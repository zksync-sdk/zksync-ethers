// src/interop-utils.ts
import {ethers, providers} from 'ethers';
import {utils, types} from './index';
import {Provider} from './provider';
import {BatchPhase, TxDetailsLite} from './types';

/**
 * Locate the L1Messenger service log inside a receipt.
 *
 * Matches by:
 * - `sender == L1_MESSENGER_ADDRESS`
 * - `key == zeroPad(eoa, 32)`
 * - optional `value == keccak256(message)` if `message` is provided
 *
 * @internal
 * @param receipt - Source L2 tx receipt with `l2ToL1Logs`.
 * @param sender - Externally owned account (sender) to match.
 * @returns The log index within `receipt.l2ToL1Logs`, or `-1` if not found and whether or not the message was sent inside a contract.
 */
export function findInteropLogIndex(
  receipt: types.TransactionReceipt,
  sender: types.Address
): {l2ToL1LogIndex: number; messageSentInContract: boolean} {
  const paddedSender = ethers.utils.hexZeroPad(sender, 32);
  const paddedContract = receipt.to
    ? ethers.utils.hexZeroPad(receipt.to, 32)
    : null;

  let messageSentInContract = false;

  const l2ToL1LogIndex = receipt.l2ToL1Logs.findIndex((log: any) => {
    const senderMatches =
      log.sender.toLowerCase() === utils.L1_MESSENGER_ADDRESS.toLowerCase();
    const keyMatchesEOASender =
      log.key.toLowerCase() === paddedSender.toLowerCase();
    const keyMatchesContractSender =
      paddedContract && log.key.toLowerCase() === paddedContract.toLowerCase();

    if (senderMatches && (keyMatchesEOASender || keyMatchesContractSender)) {
      if (keyMatchesContractSender) {
        messageSentInContract = true;
      }
      return true;
    }

    return false;
  });

  return {l2ToL1LogIndex, messageSentInContract};
}

/**
 * Fetch the Gateway proof nodes for a specific source tx/log.
 *
 * Uses the provider’s `zks_getL2ToL1LogProof` with interop mode set to `"proof_based_gw"`,
 * i.e. the proof targets the Gateway’s Merkle root.
 *
 * @internal
 * @param l2 - Source chain provider.
 * @param txHash - Source tx hash.
 * @param logIndex - Index within `receipt.l2ToL1Logs`.
 * @returns Array of Merkle nodes (bytes32[]).
 * @throws If the proof is not ready yet on the source node.
 */
export async function getGatewayProof(
  l2: Provider,
  txHash: ethers.BytesLike,
  logIndex: number
): Promise<{nodes: string[]; proofId: number}> {
  const proofResp = await l2.getLogProof(txHash, logIndex, 'proof_based_gw');
  if (!proofResp?.proof || proofResp.proof.length === 0) {
    throw new Error(
      'Gateway proof not ready yet. Ensure the transaction is settled on Gateway.'
    );
  }
  return {nodes: proofResp.proof as string[], proofId: proofResp.id};
}

/**
 * Map an L1 batch number → the Gateway block that executed that batch.
 *
 * Implementation detail:
 * - Reads `executeTxHash` from `zks_getL1BatchDetails`
 * - Looks up its receipt on the Gateway to get the `blockNumber`
 * - Polls until available (useful shortly after batch execution)
 *
 * @internal
 * @param batch - L1 batch number.
 * @param l2 - Source chain provider.
 * @param gw - Gateway provider.
 * @param pollMs - Poll interval (ms). Default: 1000.
 * @returns Gateway block number as bigint.
 */
export async function getGwBlockForBatch(
  batch: bigint,
  l2: Provider,
  gw: providers.JsonRpcProvider,
  pollMs = 1000
): Promise<bigint> {
  for (;;) {
    const details: types.BatchDetails = await l2.getL1BatchDetails(
      Number(batch)
    );
    const exec =
      details?.executeTxHash &&
      details.executeTxHash !== ethers.constants.HashZero
        ? details.executeTxHash
        : null;
    if (exec) {
      const r = await gw.getTransactionReceipt(exec);
      if (r?.blockNumber !== undefined) return BigInt(r.blockNumber);
    }
    await utils.sleep(pollMs);
  }
}

/**
 * Wait until a target chain has imported the Gateway interop root for a given Gateway block.
 *
 * Reads `L2_INTEROP_ROOT_STORAGE.interopRoots(gwChainId, gwBlock)` until non-zero.
 * This is a **poll-only** method; the public API hides timing knobs and uses defaults here.
 *
 * Notes for local development:
 * - If you see this timing out, your target chain may not have sealed the block yet.
 *   Trigger sealing (e.g. by sending any small L2 tx) and retry.
 *
 * @internal
 * @param gwChainId - Gateway chain id (bigint).
 * @param target - Target chain provider.
 * @param gwBlock - Gateway block number.
 * @param options.timeoutMs - Timeout (ms). Default: 120_000.
 * @param options.pollMs - Poll interval (ms). Default: 1500.
 * @returns Imported interop root (bytes32 as hex string).
 * @throws If the interop root is not imported in time.
 */
export async function waitForGatewayInteropRoot(
  gwChainId: bigint,
  target: Provider,
  gwBlock: bigint,
  {
    timeoutMs = 120_000,
    pollMs = 1500,
  }: {timeoutMs?: number; pollMs?: number} = {}
): Promise<string> {
  const interop = new ethers.Contract(
    utils.L2_INTEROP_ROOT_STORAGE_ADDRESS,
    utils.L2_INTEROP_ROOT_STORAGE_ABI,
    target as any
  );

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const root: string = await interop.interopRoots(gwChainId, gwBlock);
    if (root && root !== '0x' + '0'.repeat(64)) return root;
    await utils.sleep(pollMs);
  }

  throw new Error(
    `Target chain did not import interop root for (${gwChainId}, ${gwBlock}) or block has not been sealed yet`
  );
}

export function classifyPhase(d: TxDetailsLite): BatchPhase {
  if (d.status === 'failed') return 'FAILED';
  if (d.status === 'rejected') return 'REJECTED';

  if (['included', 'fastFinalized', 'verified'].includes(d.status)) {
    if (d.ethExecuteTxHash) return 'EXECUTED';
    if (d.ethProveTxHash) return 'PROVING';
    if (d.ethCommitTxHash) return 'SENDING';
    return 'QUEUED';
  }
  return 'UNKNOWN';
}
