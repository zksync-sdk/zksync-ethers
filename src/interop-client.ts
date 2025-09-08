// src/interop-client.ts
import {ethers, JsonRpcProvider} from 'ethers';
import {Wallet, types} from './index';
import {Provider} from './provider';
import {
  findInteropLogIndex,
  getGatewayProof,
  getGwBlockForBatch,
  waitForGatewayInteropRoot,
} from './interop-utils';
import {
  L2_MESSAGE_VERIFICATION_ABI,
  L2_MESSAGE_VERIFICATION_ADDRESS,
} from './utils';
import * as utils from './utils';

/**
 * Gateway presets for mainnet and testnet.
 * @public
 */
export const GATEWAY_PRESETS: Readonly<
  Record<'testnet' | 'mainnet', {chainId: bigint; rpcUrl: string}>
> = {
  testnet: {
    chainId: 32657n,
    rpcUrl: 'https://rpc.era-gateway-testnet.zksync.dev/',
  },
  mainnet: {
    chainId: 9075n,
    rpcUrl: 'https://rpc.era-gateway-mainnet.zksync.dev/',
  },
};

/**
 * Resolve a Gateway provider + chainId from a flexible config.
 *
 * Precedence:
 * 1) explicit `gwProvider` + `gwChainId`
 * 2) `env` ('testnet' | 'mainnet') with optional overrides
 * 3) `env: 'local'` requires `gwRpcUrl` and `gwChainId` (or explicit provider + chainId)
 *
 * @public
 * @param config - Flexible Gateway configuration. Defaults to the **testnet** preset.
 * @returns `{ gwProvider, gwChainId }` ready to use.
 * @throws If `env: 'local'` is selected without enough information to construct a provider.
 * @example
 * ```ts
 * const { gwProvider, gwChainId } = resolveGateway(); // testnet by default
 * const onMainnet = resolveGateway({ env: 'mainnet' });
 * const local = resolveGateway({ env: 'local', gwRpcUrl: 'http://localhost:3250', gwChainId: 506n });
 * ```
 */
export function resolveGateway(config: types.GatewayConfig = {}): {
  gwProvider: JsonRpcProvider;
  gwChainId: bigint;
} {
  if (
    config.gwProvider &&
    config.gwChainId !== null &&
    config.gwChainId !== undefined
  ) {
    return {gwProvider: config.gwProvider, gwChainId: config.gwChainId};
  }

  const env = config.env ?? 'testnet';

  // Presets
  if (env === 'testnet' || env === 'mainnet') {
    const preset = GATEWAY_PRESETS[env];
    const gwChainId = config.gwChainId ?? preset.chainId;
    const rpcUrl = config.gwRpcUrl ?? preset.rpcUrl;
    const gwProvider = config.gwProvider ?? new JsonRpcProvider(rpcUrl);
    return {gwProvider, gwChainId};
  }

  // Local
  if (env === 'local') {
    const gwProvider =
      config.gwProvider ??
      (config.gwRpcUrl ? new JsonRpcProvider(config.gwRpcUrl) : undefined);
    if (
      !gwProvider ||
      config.gwChainId === null ||
      config.gwChainId === undefined
    ) {
      throw new Error(
        'Gateway config for env="local" requires gwRpcUrl and gwChainId (or explicit gwProvider + gwChainId).'
      );
    }
    return {gwProvider, gwChainId: config.gwChainId};
  }

  throw new Error('Invalid gateway configuration');
}

export class InteropClient {
  /** Resolved Gateway provider used for batch→GW block mapping. */
  readonly gwProvider: JsonRpcProvider;
  /** Resolved Gateway chain id used for root lookups on target chains. */
  readonly gwChainId: bigint;

  constructor(opts: {gateway?: types.GatewayConfig} = {}) {
    const {gwProvider, gwChainId} = resolveGateway(opts.gateway);
    this.gwProvider = gwProvider;
    this.gwChainId = gwChainId;
  }

  /**
   * Send a message via the L1Messenger on the source chain and return the `Sent` bundle.
   *
   * @param srcWallet - Wallet connected to the source L2.
   * @param message   - Bytes or string; strings are UTF-8 encoded.
   *
   * @returns txHash — The transaction hash.
   */
  async sendMessage(
    srcWallet: Wallet,
    message: ethers.BytesLike | string
  ): Promise<{txHash: `0x${string}`}> {
    const messenger = new ethers.Contract(
      utils.L1_MESSENGER_ADDRESS,
      utils.L1_MESSENGER,
      srcWallet
    );

    const bytes =
      typeof message === 'string' ? ethers.toUtf8Bytes(message) : message;

    const tx = await messenger.sendToL1(bytes);
    await (await srcWallet.provider.getTransaction(tx.hash)).wait();

    return {txHash: tx.hash as `0x${string}`};
  }

  /**
   * Verify inclusion of a previously sent message on a target chain.
   * This is a read-only check against the target's L2MessageVerification contract.
   *
   * @param params.txHash         - Returned txHash from `sendMessage`.
   * @param params.srcProvider  - Provider for the source chain (to fetch proof nodes + batch details).
   * @param params.targetChain   - Provider for the target chain (to read interop roots + call verifier). This can be any chain that imports the Gateway roots.
   * @param params.includeProofInputs - If true, include raw proof positioning info in the result (for debugging).
   * @param params.timeoutMs         - Max time to wait for the interop root on the target chain (ms). Default: 120_000.
   * @returns InteropResult — compact verification outcome (plus optional proof inputs).
   */
  async verifyMessage(params: {
    txHash: `0x${string}`;
    srcProvider: Provider;
    targetChain: Provider;
    includeProofInputs?: boolean;
    timeoutMs?: number;
  }): Promise<types.InteropResult> {
    const {
      txHash,
      srcProvider,
      targetChain,
      includeProofInputs,
      timeoutMs = 120_000,
    } = params;

    const tx = await srcProvider.getTransaction(txHash);
    const finalizedRcpt = await tx.wait();
    if (
      finalizedRcpt.l1BatchNumber === null ||
      finalizedRcpt.l1BatchNumber === undefined
    ) {
      throw new Error(
        'Source tx is not yet finalized in an L1 batch. Cannot verify yet.'
      );
    }

    const sender = tx.from as `0x${string}`;
    const l2ToL1LogIndex = findInteropLogIndex(finalizedRcpt as any, sender);
    if (l2ToL1LogIndex < 0) {
      throw new Error(
        'Interop log not found in source receipt for L1Messenger'
      );
    }

    const rawLog = (finalizedRcpt as any).l2ToL1Logs?.[l2ToL1LogIndex];
    const messageHex = rawLog?.value as `0x${string}`;
    if (!messageHex) {
      throw new Error('Missing message value on matched L1Messenger log');
    }

    const l1BatchNumber = (finalizedRcpt as any).l1BatchNumber as number;
    const l1BatchTxIndex = (finalizedRcpt as any).l1BatchTxIndex as number;

    const nodes = await getGatewayProof(srcProvider, txHash, l2ToL1LogIndex);

    const gwBlock = await getGwBlockForBatch(
      BigInt(l1BatchNumber),
      srcProvider,
      this.gwProvider
    );
    const interopRoot = await waitForGatewayInteropRoot(
      this.gwChainId,
      targetChain,
      gwBlock,
      {timeoutMs}
    );

    const verifier = new ethers.Contract(
      L2_MESSAGE_VERIFICATION_ADDRESS,
      L2_MESSAGE_VERIFICATION_ABI,
      targetChain as any
    );
    const srcChainId = Number((await srcProvider.getNetwork()).chainId);

    const included: boolean = await verifier.proveL2MessageInclusionShared(
      srcChainId,
      l1BatchNumber,
      l1BatchTxIndex,
      {
        txNumberInBatch: l1BatchTxIndex,
        sender,
        data: messageHex,
      },
      nodes
    );

    const result: types.InteropResult = {
      source: {
        chainId: srcChainId,
        txHash,
        sender,
        messageHash: ethers.keccak256(messageHex) as `0x${string}`,
      },
      interopRoot: interopRoot as `0x${string}`,
      verified: included,
    };

    if (includeProofInputs) {
      result.proof = {
        l1BatchNumber,
        l1BatchTxIndex,
        l2ToL1LogIndex,
        gwBlockNumber: gwBlock,
      };
    }

    return result;
  }

  /**
   * One-shot convenience: sends on the source chain and verifies on the target chain.
   *
   * @param params.srcWallet     - Wallet on the source chain (used to send the message).
   * @param params.targetChain   - Provider on the target chain. This can be any chain that imports the Gateway roots.
   * @param params.message       - Message bytes/string to send.
   * @param params.includeProofInputs - Include raw proof positioning in result (optional, debugging).
   * @param params.timeoutMs          - Max time to wait for the interop root on the target chain (ms). Default: 120_000.
   */
  async sendMessageAndVerify(params: {
    srcWallet: Wallet;
    targetChain: Provider;
    message: ethers.BytesLike | string;
    includeProofInputs?: boolean;
    timeoutMs?: number;
  }): Promise<types.InteropResult> {
    const {txHash} = await this.sendMessage(params.srcWallet, params.message);
    return this.verifyMessage({
      txHash,
      srcProvider: params.srcWallet.provider as Provider,
      targetChain: params.targetChain,
      includeProofInputs: params.includeProofInputs,
      timeoutMs: params.timeoutMs,
    });
  }
}
