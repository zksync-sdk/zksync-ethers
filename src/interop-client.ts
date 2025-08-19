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
   * @returns Sent — the minimal info needed to later prove inclusion.
   */
  async sendMessage(
    srcWallet: Wallet,
    message: ethers.BytesLike | string
  ): Promise<types.Sent> {
    const messenger = new ethers.Contract(
      utils.L1_MESSENGER_ADDRESS,
      utils.L1_MESSENGER,
      srcWallet
    );

    const bytes =
      typeof message === 'string' ? ethers.toUtf8Bytes(message) : message;

    const tx = await messenger.sendToL1(bytes);
    const rcpt = await (
      await srcWallet.provider.getTransaction(tx.hash)
    ).waitFinalize();

    if (rcpt.l1BatchNumber === null || rcpt.l1BatchTxIndex === null) {
      throw new Error('Missing l1BatchNumber or l1BatchTxIndex on receipt');
    }

    const idx = findInteropLogIndex(rcpt, await srcWallet.getAddress(), bytes);
    if (idx < 0) throw new Error('Interop log not found');

    return {
      txHash: tx.hash,
      l1BatchNumber: rcpt.l1BatchNumber,
      l1BatchTxIndex: rcpt.l1BatchTxIndex,
      l2ToL1LogIndex: idx,
      sender: await srcWallet.getAddress(),
      messageHex: ethers.hexlify(bytes),
    };
  }

  /**
   * Verify inclusion of a previously sent message on a target chain.
   * This is a read-only check against the target's L2MessageVerification contract.
   *
   * @param params.sent         - Returned payload from `sendMessage`.
   * @param params.srcProvider  - Provider for the source chain (to fetch proof nodes + batch details).
   * @param params.targetChain   - Provider for the target chain (to read interop roots + call verifier).
   * @param params.includeProofInputs - If true, include raw proof positioning info in the result (for debugging).
   *
   * @returns InteropResult — compact verification outcome (plus optional proof inputs).
   */
  async verifyMessage(params: {
    sent: types.Sent;
    srcProvider: Provider;
    targetChain: Provider;
    includeProofInputs?: boolean;
  }): Promise<types.InteropResult> {
    const {sent, srcProvider, targetChain, includeProofInputs = false} = params;

    // fetch proof nodes from the source chain
    const nodes = await getGatewayProof(
      srcProvider,
      sent.txHash,
      sent.l2ToL1LogIndex
    );

    // map L1 batch -> Gateway block
    const gwBlock = await getGwBlockForBatch(
      BigInt(sent.l1BatchNumber),
      srcProvider,
      this.gwProvider
    );
    // wait for interop root import on target
    const interopRoot = await waitForGatewayInteropRoot(
      this.gwChainId,
      targetChain,
      gwBlock
    );

    // on-chain verifier
    const verifier = new ethers.Contract(
      L2_MESSAGE_VERIFICATION_ADDRESS,
      L2_MESSAGE_VERIFICATION_ABI,
      targetChain as any
    );
    const srcChainId = Number((await srcProvider.getNetwork()).chainId);

    const included: boolean = await verifier.proveL2MessageInclusionShared(
      srcChainId,
      sent.l1BatchNumber,
      sent.l1BatchTxIndex,
      {
        txNumberInBatch: sent.l1BatchTxIndex,
        sender: sent.sender,
        data: sent.messageHex,
      },
      nodes
    );

    const result: types.InteropResult = {
      source: {
        chainId: srcChainId,
        txHash: sent.txHash,
        sender: sent.sender,
        messageHash: ethers.keccak256(sent.messageHex),
      },
      interopRoot,
      verified: included,
    };

    if (includeProofInputs) {
      result.proof = {
        l1BatchNumber: sent.l1BatchNumber,
        l1BatchTxIndex: sent.l1BatchTxIndex,
        l2ToL1LogIndex: sent.l2ToL1LogIndex,
        gwBlockNumber: gwBlock,
      };
    }

    return result;
  }

  /**
   * One-shot convenience: sends on the source chain and verifies on the target chain.
   *
   * @param params.srcWallet     - Wallet on the source chain (used to send the message).
   * @param params.targetRunner    - Provider on the target chain.
   * @param params.message       - Message bytes/string to send.
   * @param params.includeProofInputs - Include raw proof positioning in result (optional, debugging).
   */
  async sendMessageAndVerify(params: {
    srcWallet: Wallet;
    targetChain: Provider;
    message: ethers.BytesLike | string;
    includeProofInputs?: boolean;
  }): Promise<types.InteropResult> {
    const sent = await this.sendMessage(params.srcWallet, params.message);
    return this.verifyMessage({
      sent,
      srcProvider: params.srcWallet.provider as Provider,
      targetChain: params.targetChain,
      includeProofInputs: params.includeProofInputs,
    });
  }
}
