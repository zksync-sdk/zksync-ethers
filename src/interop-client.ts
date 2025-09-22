// src/interop-client.ts
import {ethers, providers} from 'ethers';
import {Wallet, types} from './index';
import {Provider} from './provider';
import {
  classifyPhase,
  findInteropLogIndex,
  getGatewayProof,
  getGwBlockForBatch,
  waitForGatewayInteropRoot,
} from './interop-utils';
import {
  isAddressEq,
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
    chainId: BigInt('32657'),
    rpcUrl: 'https://rpc.era-gateway-testnet.zksync.dev/',
  },
  mainnet: {
    chainId: BigInt('9075'),
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
  gwProvider: providers.JsonRpcProvider;
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
    const gwProvider =
      config.gwProvider ?? new providers.JsonRpcProvider(rpcUrl);
    return {gwProvider, gwChainId};
  }

  // Local
  if (env === 'local') {
    const gwProvider =
      config.gwProvider ??
      (config.gwRpcUrl
        ? new providers.JsonRpcProvider(config.gwRpcUrl)
        : undefined);
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
  readonly gwProvider: providers.JsonRpcProvider;
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
      typeof message === 'string' ? ethers.utils.toUtf8Bytes(message) : message;

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
    const {txHash, srcProvider, targetChain, includeProofInputs, timeoutMs} =
      params;

    const {
      srcChainId,
      l1BatchNumber,
      l2MessageIndex,
      msgData,
      gatewayProof,
      gwBlock,
      l2ToL1LogIndex,
      l1BatchTxIndex,
      interopRoot,
    } = await this.getVerificationArgs({
      txHash,
      srcProvider,
      targetChain,
      includeProofInputs: true,
      timeoutMs,
    });

    const verifier = new ethers.Contract(
      L2_MESSAGE_VERIFICATION_ADDRESS,
      L2_MESSAGE_VERIFICATION_ABI,
      targetChain as any
    );
    const included: boolean = await verifier.proveL2MessageInclusionShared(
      srcChainId,
      l1BatchNumber,
      l2MessageIndex,
      msgData,
      gatewayProof
    );

    if (!included) throw new Error('Verification failed.');

    const result: types.InteropResult = {
      source: {
        chainId: srcChainId,
        txHash,
        sender: msgData.sender,
        messageHash: ethers.utils.keccak256(msgData.data) as `0x${string}`,
      },
      interopRoot: interopRoot as `0x${string}`,
      verified: included,
    };

    if (includeProofInputs) {
      result.proof = {
        l1BatchNumber,
        l2MessageIndex,
        l1BatchTxIndex: l1BatchTxIndex!,
        l2ToL1LogIndex: l2ToL1LogIndex!,
        gwBlockNumber: gwBlock!,
      };
    }

    return result;
  }

  /**
   * Get the input arguments for proveL2MessageInclusionShared to verify a previously sent message on a target chain.
   *
   * @param params.txHash         - Returned txHash from `sendMessage`.
   * @param params.srcProvider  - Provider for the source chain (to fetch proof nodes + batch details).
   * @param params.targetChain   - Provider for the target chain (to read interop roots + call verifier). This can be any chain that imports the Gateway roots.
   * @param params.includeProofInputs - If true, include raw proof positioning info in the result (for debugging).
   * @param params.timeoutMs         - Max time to wait for the interop root on the target chain (ms). Default: 120_000.
   * @returns ProveL2MessageInclusionSharedArgs & { interopRoot: string; gwBlock?: bigint; l2ToL1LogIndex?: number; } - An object with all the required input arguments to verify a previously sent message using the proveL2MessageInclusionShared method on the target's L2MessageVerification contract.
   */
  async getVerificationArgs(params: {
    txHash: `0x${string}`;
    srcProvider: Provider;
    targetChain: Provider;
    includeProofInputs?: boolean;
    timeoutMs?: number;
  }): Promise<
    types.ProveL2MessageInclusionSharedArgs & {
      interopRoot?: string;
      gwBlock?: bigint;
      l1BatchTxIndex?: number;
      l2ToL1LogIndex?: number;
    }
  > {
    const {
      txHash,
      srcProvider,
      targetChain,
      includeProofInputs,
      timeoutMs = 120_000,
    } = params;

    const phase = await this.getMessageStatus(srcProvider, txHash);

    if (phase !== 'EXECUTED') {
      switch (phase) {
        case 'QUEUED':
          throw new Error(
            'Status: Pending → Transaction is included on L2 but the batch has not yet been committed. Not ready for verification.'
          );
        case 'SENDING':
          throw new Error(
            'Status: Included → Batch has been committed and is being sent to Gateway. Not ready for verification.'
          );
        case 'PROVING':
          throw new Error(
            'Status: Verified → Batch proof is being generated and submitted. Not ready for verification.'
          );
        case 'FAILED':
          throw new Error(
            'Status: Failed → Transaction did not verify successfully.'
          );
        case 'REJECTED':
          throw new Error(
            'Status: Failed → Transaction was rejected by the sequencer.'
          );
        default:
          throw new Error(
            'Status: Unknown → Transaction status could not be determined.'
          );
      }
    }

    const tx = await srcProvider.getTransaction(txHash);
    const finalizedRcpt = await tx.wait();

    const sender = tx.from as `0x${string}`;
    const {l2ToL1LogIndex, messageSentInContract} = findInteropLogIndex(
      finalizedRcpt as any,
      sender
    );
    if (l2ToL1LogIndex < 0) {
      throw new Error(
        'Interop log not found in source receipt for L1Messenger'
      );
    }

    const log = finalizedRcpt.logs.filter(
      log =>
        isAddressEq(log.address, utils.L1_MESSENGER_ADDRESS) &&
        log.topics[0] ===
          ethers.utils.id('L1MessageSent(address,bytes32,bytes)')
    )[l2ToL1LogIndex];
    const messageHex = ethers.utils.defaultAbiCoder.decode(
      ['bytes'],
      log.data
    )[0] as `0x${string}`;
    if (!messageHex) {
      throw new Error('Missing message value on matched L1Messenger log');
    }

    const l1BatchNumber = (finalizedRcpt as any).l1BatchNumber as number;
    const l1BatchTxIndex = (finalizedRcpt as any).l1BatchTxIndex as number;

    const {nodes, proofId} = await getGatewayProof(
      srcProvider,
      txHash,
      l2ToL1LogIndex
    );

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

    const srcChainId = Number((await srcProvider.getNetwork()).chainId);
    const result: types.ProveL2MessageInclusionSharedArgs = {
      srcChainId,
      l1BatchNumber,
      l2MessageIndex: proofId,
      msgData: {
        txNumberInBatch: l1BatchTxIndex,
        sender: messageSentInContract ? (tx.to as `0x${string}`) : sender,
        data: messageHex,
      },
      gatewayProof: nodes,
    };

    if (includeProofInputs) {
      return {...result, gwBlock, l2ToL1LogIndex, l1BatchTxIndex, interopRoot};
    }

    return result;
  }

  /**
   * Check the current lifecycle phase of a sent message on the source chain.
   *
   * @param srcProvider - Source chain provider (supports `getTransactionDetails`).
   * @param txHash      - Transaction hash returned by {@link sendMessage}.
   * @returns Phase classification:
   *   'QUEUED' | 'SENDING' | 'PROVING' | 'EXECUTED' | 'FAILED' | 'REJECTED' | 'UNKNOWN'
   */
  async getMessageStatus(srcProvider: Provider, txHash: `0x${string}`) {
    const d = await srcProvider.getTransactionDetails(txHash);
    if (!d) return {phase: 'UNKNOWN', message: 'No details available' as const};
    return classifyPhase({
      status: d.status as any,
      ethCommitTxHash: (d as any).ethCommitTxHash ?? null,
      ethProveTxHash: (d as any).ethProveTxHash ?? null,
      ethExecuteTxHash: (d as any).ethExecuteTxHash ?? null,
    });
  }
}
