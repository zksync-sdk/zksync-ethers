import {
  assert,
  assertArgument,
  BigNumberish,
  BytesLike,
  defineProperties,
  ethers,
  Signature as EthersSignature,
  TransactionRequest as EthersTransactionRequest,
} from 'ethers';
import {
  EIP712_TX_TYPE,
  parseEip712,
  serializeEip712,
  sleep,
  eip712TxHash,
  isAddressEq,
} from './utils';
import {Provider} from './provider';

/** 0x-prefixed, hex encoded, ethereum account address. */
export type Address = string;

/** 0x-prefixed, hex encoded, ECDSA signature. */
export type Signature = string;

/** Ethereum network. */
export enum Network {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Sepolia = 6,
  Localhost = 9,
  EraTestNode = 10,
}

/** Enumerated list of priority queue types. */
export enum PriorityQueueType {
  Deque = 0,
  HeapBuffer = 1,
  Heap = 2,
}

/** Enumerated list of priority operation tree types. */
export enum PriorityOpTree {
  Full = 0,
  Rollup = 1,
}

/** Enumerated list of transaction status types. */
export enum TransactionStatus {
  /** Transaction not found. */
  NotFound = 'not-found',
  /** Transaction is processing. */
  Processing = 'processing',
  /** Transaction has been committed. */
  Committed = 'committed',
  /** Transaction has been finalized. */
  Finalized = 'finalized',
}

/** Type defining a paymaster by its address and the bytestream input. */
export type PaymasterParams = {
  /** The address of the paymaster. */
  paymaster: Address;
  /** The bytestream input for the paymaster. */
  paymasterInput: BytesLike;
};

/** Contains EIP712 transaction metadata. */
export type Eip712Meta = {
  /** The maximum amount of gas the user is willing to pay for a single byte of pubdata. */
  gasPerPubdata?: BigNumberish;
  /** An array of bytes containing the bytecode of the contract being deployed and any related contracts it can deploy. */
  factoryDeps?: BytesLike[];
  /** Custom signature used for cases where the signer's account is not an EOA. */
  customSignature?: BytesLike;
  /** Parameters for configuring the custom paymaster for the transaction. */
  paymasterParams?: PaymasterParams;
};

/**
 * Specifies a specific block. This can be represented by:
 * - A numeric value (number, bigint, or hexadecimal string) representing the block height, where the genesis block is block 0.
 *   A negative value indicates the block number should be deducted from the most recent block.
 * - A block hash as a string, specifying a specific block by its block hash.
 *   This allows potentially orphaned blocks to be specified without ambiguity, but many backends do not support this for some operations.
 * - Constants representing special blocks such as 'committed', 'finalized', 'latest', 'earliest', 'pending' or 'l1_committed'.
 */
export type BlockTag =
  | BigNumberish
  | string // block hash
  | 'committed'
  | 'finalized'
  | 'latest'
  | 'earliest'
  | 'pending'
  | 'l1_committed';

/** Pipe-delimited choice of deployment types. */
export type DeploymentType =
  | 'create'
  | 'createAccount'
  | 'create2'
  | 'create2Account';

/** Bridged token. */
export interface Token {
  /** Token address on L1. */
  l1Address: Address;
  /** Token address on L2. */
  l2Address: Address;
  /** Token name. */
  name: string;
  /** Token symbol. */
  symbol: string;
  /** Token decimals. */
  decimals: number;
}

/** Represents the transaction fee parameters. */
export interface Fee {
  /** The maximum amount of gas that can be used. */
  gasLimit: bigint;
  /** The gas limit per unit of public data. */
  gasPerPubdataLimit: bigint;
  /** The maximum priority fee per unit of gas to incentivize miners. */
  maxPriorityFeePerGas: bigint;
  /** The maximum fee per unit of gas that the sender is willing to pay. */
  maxFeePerGas: bigint;
}

/** Represents the fee parameters configuration. */
export interface FeeParams {
  /** Fee parameter configuration for the current version of the ZKsync protocol. */
  V2: {
    /** Settings related to transaction fee computation. */
    config: {
      /** Minimal gas price on L2. */
      minimal_l2_gas_price: bigint;
      /** Compute overhead part in fee calculation. */
      compute_overhead_part: bigint;
      /** Public data overhead part in fee calculation. */
      pubdata_overhead_part: bigint;
      /** Overhead in L1 gas for a batch of transactions. */
      batch_overhead_l1_gas: bigint;
      /** Maximum gas allowed per batch. */
      max_gas_per_batch: bigint;
      /** Maximum amount of public data allowed per batch. */
      max_pubdata_per_batch: bigint;
    };
    /** Represents the BaseToken<->ETH conversion ratio. */
    conversion_ratio: {
      /** Represents the denominator part of the conversion ratio. */
      denominator: bigint;
      /** Represents the numerator part of the conversion ratio. */
      numerator: bigint;
    };
    /** Current L1 gas price. */
    l1_gas_price: bigint;
    /** Price of storing public data on L1. */
    l1_pubdata_price: bigint;
  };
}

/** Represents a message proof.
 *  @deprecated In favor of {@link LogProof}.
 */
export interface MessageProof {
  /** Identifier of the log within the transaction. */
  id: number;
  /** Each element represents a piece of the proof for the specified log. */
  proof: string[];
  /** Root hash of the proof, anchoring it to a specific state in the blockchain. */
  root: string;
}

/** Represents a log proof for an L2 to L1 transaction. */
export interface LogProof {
  /** Identifier of the log within the transaction. */
  id: number;
  /** Each element represents a piece of the proof for the specified log. */
  proof: string[];
  /** Root hash of the proof, anchoring it to a specific state in the blockchain. */
  root: string;
}

/**
 * A `TransactionResponse` is an extension of {@link ethers.TransactionResponse} with additional features for
 * interacting with ZKsync Era.
 */
export class TransactionResponse extends ethers.TransactionResponse {
  /** The batch number on the L1 network. */
  readonly l1BatchNumber!: null | number;
  /** The transaction index within the batch on the L1 network. */
  readonly l1BatchTxIndex!: null | number;

  constructor(params: any, provider: ethers.Provider) {
    super(params, provider);
    defineProperties<TransactionResponse>(this, {
      l1BatchNumber: params.l1BatchNumber,
      l1BatchTxIndex: params.l1BatchTxIndex,
    });
  }

  /**
   * Waits for this transaction to be mined and have a specified number of confirmation blocks.
   * Resolves once the transaction has `confirmations` blocks including it.
   * If `confirmations` is 0 and the transaction has not been mined, it resolves to `null`.
   * Otherwise, it waits until enough confirmations have completed.
   *
   * @param confirmations The number of confirmation blocks. Defaults to 1.
   * @returns A promise that resolves to the transaction receipt.
   */
  override async wait(
    confirmations?: number,
    timeout?: number
  ): Promise<TransactionReceipt> {
    timeout ??= 500;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const receipt = (await super.wait(confirmations)) as TransactionReceipt;
      if (receipt && receipt.blockNumber) {
        return receipt;
      }
      await sleep(timeout);
    }
  }

  override async getTransaction(): Promise<TransactionResponse> {
    return (await super.getTransaction()) as TransactionResponse;
  }

  override replaceableTransaction(startBlock: number): TransactionResponse {
    return new TransactionResponse(
      super.replaceableTransaction(startBlock),
      this.provider
    );
  }

  override async getBlock(): Promise<Block> {
    return (await super.getBlock()) as Block;
  }

  /** Waits for transaction to be finalized. */
  async waitFinalize(): Promise<TransactionReceipt> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const receipt = await this.wait();
      if (receipt && receipt.blockNumber) {
        const block = await this.provider.getBlock('finalized');
        if (receipt.blockNumber <= block!.number) {
          return (await this.provider.getTransactionReceipt(
            receipt.hash
          )) as TransactionReceipt;
        }
      } else {
        await sleep(500);
      }
    }
  }

  override toJSON(): any {
    const {l1BatchNumber, l1BatchTxIndex} = this;

    return {
      ...super.toJSON(),
      l1BatchNumber,
      l1BatchTxIndex,
    };
  }
}

/**
 * A `TransactionReceipt` is an extension of {@link ethers.TransactionReceipt} with additional features for
 * interacting with ZKsync Era.
 */
export class TransactionReceipt extends ethers.TransactionReceipt {
  /** The batch number on the L1 network. */
  readonly l1BatchNumber!: null | number;
  /** The transaction index within the batch on the L1 network. */
  readonly l1BatchTxIndex!: null | number;
  /** The logs of L2 to L1 messages. */
  readonly l2ToL1Logs!: L2ToL1Log[];
  /** All logs included in the transaction receipt. */
  readonly #logs: ReadonlyArray<Log>;

  constructor(params: any, provider: ethers.Provider) {
    super(params, provider);
    defineProperties<TransactionReceipt>(this, {
      l1BatchNumber: params.l1BatchNumber,
      l1BatchTxIndex: params.l1BatchTxIndex,
      l2ToL1Logs: params.l2ToL1Logs,
    });

    this.#logs = Object.freeze(
      params.logs.map((log: Log) => {
        return new Log(log, provider);
      })
    );
  }

  override get logs(): ReadonlyArray<Log> {
    return this.#logs;
  }

  override getBlock(): Promise<Block> {
    return super.getBlock() as Promise<Block>;
  }

  override getTransaction(): Promise<TransactionResponse> {
    return super.getTransaction() as Promise<TransactionResponse>;
  }

  override toJSON(): any {
    const {l1BatchNumber, l1BatchTxIndex, l2ToL1Logs} = this;
    return {
      ...super.toJSON(),
      l1BatchNumber,
      l1BatchTxIndex,
      l2ToL1Logs,
    };
  }
}

/** A `Block` is an extension of {@link ethers.Block} with additional features for interacting with ZKsync Era. */
export class Block extends ethers.Block {
  /** The batch number on L1. */
  readonly l1BatchNumber!: null | number;
  /** The timestamp of the batch on L1. */
  readonly l1BatchTimestamp!: null | number;

  readonly #transactions: Array<string | TransactionResponse>;

  constructor(params: any, provider: ethers.Provider) {
    super(params, provider);
    this.#transactions = params.transactions.map(
      (tx: TransactionResponse | string) => {
        if (typeof tx !== 'string') {
          return new TransactionResponse(tx, provider);
        }
        return tx;
      }
    );
    defineProperties<Block>(this, {
      l1BatchNumber: params.l1BatchNumber,
      l1BatchTimestamp: params.l1BatchTimestamp,
    });
  }

  override toJSON(): any {
    const {l1BatchNumber, l1BatchTimestamp} = this;
    return {
      ...super.toJSON(),
      l1BatchNumber,
      l1BatchTimestamp,
    };
  }

  override get prefetchedTransactions(): TransactionResponse[] {
    const txs = this.#transactions.slice();

    // Doesn't matter...
    if (txs.length === 0) {
      return [];
    }

    // Make sure we prefetched the transactions
    assert(
      typeof txs[0] === 'object',
      'transactions were not prefetched with block request',
      'UNSUPPORTED_OPERATION',
      {
        operation: 'transactionResponses()',
      }
    );

    return txs as TransactionResponse[];
  }

  override async getTransaction(
    indexOrHash: number | string
  ): Promise<TransactionResponse> {
    // Find the internal value by its index or hash
    let tx: string | TransactionResponse | undefined = undefined;
    if (typeof indexOrHash === 'number') {
      tx = this.#transactions[indexOrHash];
    } else {
      const hash = indexOrHash.toLowerCase();
      for (const v of this.#transactions) {
        if (typeof v === 'string') {
          if (v !== hash) {
            continue;
          }
          tx = v;
          break;
        } else {
          if (v.hash === hash) {
            continue;
          }
          tx = v;
          break;
        }
      }
    }
    if (!tx) {
      throw new Error('no such tx');
    }

    if (typeof tx === 'string') {
      return <TransactionResponse>await this.provider.getTransaction(tx);
    } else {
      return tx;
    }
  }
}

/** A `LogParams` is an extension of {@link ethers.LogParams} with additional features for interacting with ZKsync Era. */
export interface LogParams extends ethers.LogParams {
  /** The batch number on L1. */
  readonly l1BatchNumber: null | number;
}

/** A `Log` is an extension of {@link ethers.Log} with additional features for interacting with ZKsync Era. */
export class Log extends ethers.Log {
  /** The batch number on L1. */
  readonly l1BatchNumber: null | number;

  constructor(params: LogParams, provider: ethers.Provider) {
    super(params, provider);
    this.l1BatchNumber = params.l1BatchNumber;
  }

  override toJSON(): any {
    const {l1BatchNumber} = this;
    return {
      ...super.toJSON(),
      l1BatchNumber,
    };
  }

  override async getBlock(): Promise<Block> {
    return (await super.getBlock()) as Block;
  }

  override async getTransaction(): Promise<TransactionResponse> {
    return (await super.getTransaction()) as TransactionResponse;
  }

  override async getTransactionReceipt(): Promise<TransactionReceipt> {
    return (await super.getTransactionReceipt()) as TransactionReceipt;
  }
}

/**
 * A `TransactionLike` is an extension of {@link ethers.TransactionLike} with additional features for interacting
 * with ZKsync Era.
 */
export interface TransactionLike extends ethers.TransactionLike {
  /** The custom data for EIP712 transaction metadata. */
  customData?: null | Eip712Meta;
}

/**
 * A `Transaction` is an extension of {@link ethers.Transaction} with additional features for interacting
 * with ZKsync Era.
 */
export class Transaction extends ethers.Transaction {
  /** The custom data for EIP712 transaction metadata. */
  customData?: null | Eip712Meta;
  // super.#type is private and there is no way to override which enforced to
  // introduce following variable
  #type?: null | number;
  #from?: null | string;

  override get type(): number | null {
    return this.#type === EIP712_TX_TYPE ? this.#type : super.type;
  }

  override set type(value: number | string | null) {
    switch (value) {
      case EIP712_TX_TYPE:
      case 'eip-712':
        this.#type = EIP712_TX_TYPE;
        break;
      default:
        super.type = value;
    }
  }

  static override from(tx: string | TransactionLike): Transaction {
    if (typeof tx === 'string') {
      const payload = ethers.getBytes(tx);
      if (payload[0] !== EIP712_TX_TYPE) {
        return Transaction.from(ethers.Transaction.from(tx));
      } else {
        return Transaction.from(parseEip712(payload));
      }
    } else {
      const result = new Transaction();
      if (tx.type === EIP712_TX_TYPE) {
        result.type = EIP712_TX_TYPE;
        result.customData = tx.customData;
        result.from = tx.from!;
      }
      if (tx.type !== null && tx.type !== undefined) result.type = tx.type;
      if (tx.to) result.to = tx.to;
      if (tx.nonce) result.nonce = tx.nonce;
      if (tx.gasLimit) result.gasLimit = tx.gasLimit;
      if (tx.gasPrice) result.gasPrice = tx.gasPrice;
      if (tx.maxPriorityFeePerGas)
        result.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
      if (tx.maxFeePerGas) result.maxFeePerGas = tx.maxFeePerGas;
      if (tx.data) result.data = tx.data;
      if (tx.value) result.value = tx.value;
      if (tx.chainId) result.chainId = tx.chainId;
      if (tx.signature) result.signature = EthersSignature.from(tx.signature);
      result.accessList = null;

      if (tx.from) {
        assertArgument(
          result.isSigned(),
          'unsigned transaction cannot define from',
          'tx',
          tx
        );
        assertArgument(
          isAddressEq(result.from, tx.from),
          'from mismatch',
          'tx',
          tx
        );
      }

      if (tx.hash) {
        assertArgument(
          result.isSigned(),
          'unsigned transaction cannot define hash',
          'tx',
          tx
        );
        assertArgument(result.hash === tx.hash, 'hash mismatch', 'tx', tx);
      }

      return result;
    }
  }

  override get serialized(): string {
    if (!this.customData && this.#type !== EIP712_TX_TYPE) {
      return super.serialized;
    }
    return serializeEip712(this, this.signature!);
  }

  override get unsignedSerialized(): string {
    if (!this.customData && this.type !== EIP712_TX_TYPE) {
      return super.unsignedSerialized;
    }
    return serializeEip712(this);
  }

  override toJSON(): any {
    const {customData} = this;
    return {
      ...super.toJSON(),
      type: !this.#type ? this.type : this.#type,
      customData,
    };
  }

  override get typeName(): string | null {
    return this.#type === EIP712_TX_TYPE ? 'zksync' : super.typeName;
  }

  override isSigned(): this is Transaction & {
    type: number;
    typeName: string;
    from: string;
    signature: Signature;
  } {
    return this.#type === EIP712_TX_TYPE
      ? this.customData?.customSignature !== null
      : super.isSigned();
  }

  override get hash(): string | null {
    if (this.#type === EIP712_TX_TYPE) {
      return this.customData?.customSignature !== null
        ? eip712TxHash(this)
        : null;
    } else {
      return super.hash;
    }
  }

  override get from(): string | null {
    return this.#type === EIP712_TX_TYPE ? this.#from! : super.from;
  }
  override set from(value: string | null) {
    this.#from = value;
  }
}

/**
 * Represents a L2 to L1 transaction log.
 */
export interface L2ToL1Log {
  /** The block number. */
  blockNumber: number;
  /** The block hash. */
  blockHash: string;
  /** The batch number on L1. */
  l1BatchNumber: number;
  /** The L2 transaction number in a block, in which the log was sent. */
  transactionIndex: number;
  /** The transaction log index.  */
  transactionLogIndex: number;
  /** The transaction index in L1 batch. */
  txIndexInL1Batch?: number;
  /** The shard identifier, 0 - rollup, 1 - porter. */
  shardId: number;
  /**
   *  A boolean flag that is part of the log along with `key`, `value`, and `sender` address.
   *  This field is required formally but does not have any special meaning.
   */
  isService: boolean;
  /** The L2 address which sent the log. */
  sender: string;
  /** The 32 bytes of information that was sent in the log. */
  key: string;
  /** The 32 bytes of information that was sent in the log. */
  value: string;
  /** The transaction hash. */
  transactionHash: string;
  /** The log index. */
  logIndex: number;
}

/**
 * A `TransactionRequest` is an extension of {@link ethers.TransactionRequest} with additional features for interacting
 * with ZKsync Era.
 */
export interface TransactionRequest extends EthersTransactionRequest {
  /** The custom data for EIP712 transaction metadata. */
  customData?: null | Eip712Meta;
}

/**
 * Interface representation of priority op response that extends {@link ethers.TransactionResponse} and adds a function
 * that waits to commit a L1 transaction, including when given on optional confirmation number.
 */
export interface PriorityOpResponse extends TransactionResponse {
  /**
   * Waits for the L1 transaction to be committed, including waiting for the specified number of confirmations.
   * @param confirmation The number of confirmations to wait for. Defaults to 1.
   * @returns A promise that resolves to the transaction receipt once committed.
   */
  waitL1Commit(confirmation?: number): Promise<ethers.TransactionReceipt>;
}

/**
 * A map  with token addresses as keys and their corresponding balances as values.
 * Each key-value pair represents the balance of a specific token held by the account.
 */
export type BalancesMap = {[key: string]: bigint};

/** Represents deployment information. */
export interface DeploymentInfo {
  /** The account responsible for deployment. */
  sender: Address;
  /** The hash of the contract/account bytecode. */
  bytecodeHash: string;
  /** The deployed address of the contract/address. */
  deployedAddress: Address;
}

/**
 * Represents the input data structure for an approval-based paymaster.
 */
export interface ApprovalBasedPaymasterInput {
  /** The type of the paymaster input. */
  type: 'ApprovalBased';
  /** The address of the token to be approved. */
  token: Address;
  /** The minimum allowance required for the token approval. */
  minimalAllowance: BigNumberish;
  /** The additional input data. */
  innerInput: BytesLike;
}

/**
 * Represents the input data structure for a general paymaster.
 */
export interface GeneralPaymasterInput {
  /** The type of the paymaster input. */
  type: 'General';
  /** The additional input data. */
  innerInput: BytesLike;
}

/**
 * Represents an Ethereum signature consisting of the components `v`, `r`, and `s`.
 */
export interface EthereumSignature {
  /** The recovery id. */
  v: number;
  /** The "r" value of the signature. */
  r: BytesLike;
  /** The "s" value of the signature. */
  s: BytesLike;
}

/**
 * Represents the input data structure for a paymaster.
 * It can be either approval-based or general.
 */
export type PaymasterInput =
  | ApprovalBasedPaymasterInput
  | GeneralPaymasterInput;

/** Enumerated list of account abstraction versions. */
export enum AccountAbstractionVersion {
  /** Used for contracts that are not accounts. */
  None = 0,
  /** Used for contracts that are accounts. */
  Version1 = 1,
}

/**
 * Enumerated list of account nonce ordering formats.
 */
export enum AccountNonceOrdering {
  /**
   * Nonces should be ordered in the same way as in externally owned accounts (EOAs).
   * This means, for instance, that the operator will always wait for a transaction with nonce `X`
   * before processing a transaction with nonce `X+1`.
   */
  Sequential = 0,
  /** Nonces can be ordered in arbitrary order. */
  Arbitrary = 1,
}

/**
 * Interface representing contract account information containing details on the supported account abstraction version
 * and nonce ordering format.
 */
export interface ContractAccountInfo {
  /** The supported account abstraction version. */
  supportedAAVersion: AccountAbstractionVersion;
  /** The nonce ordering format. */
  nonceOrdering: AccountNonceOrdering;
}

/** Contains L1 batch details. */
export interface BatchDetails {
  /** L1 batch number. */
  number: number;
  /** Unix timestamp when the batch was processed. */
  timestamp: number;
  /** Number of L1 transactions included in the batch. */
  l1TxCount: number;
  /** Number of L2 transactions associated with this batch. */
  l2TxCount: number;
  /** Root hash of the state after processing the batch. */
  rootHash?: string;
  /** Current status of the batch (e.g., verified). */
  status: string;
  /** Transaction hash of the commit operation on L1. */
  commitTxHash?: string;
  /** Timestamp when the block was committed on L1. */
  committedAt?: Date;
  /** Transaction hash of the proof submission on L1. */
  proveTxHash?: string;
  /** Timestamp when the proof was submitted on L1. */
  provenAt?: Date;
  /** Transaction hash of the execution on L1. */
  executeTxHash?: string;
  /** Timestamp when the block execution was completed on L1. */
  executedAt?: Date;
  /** L1 gas price at the time of the block's execution. */
  l1GasPrice: number;
  /** Fair gas price on L2 at the time of the block's execution. */
  l2FairGasPrice: number;
  /** Hashes of the base system contracts involved in the batch. */
  baseSystemContractsHashes: {
    bootloader: string;
    default_aa: string;
  };
}

/** Contains block information. */
export interface BlockDetails {
  /** Number of the block. */
  number: number;
  /** Unix timestamp when the block was committed. */
  timestamp: number;
  /** Corresponding L1 batch number. */
  l1BatchNumber: number;
  /** Number of L1 transactions included in the block. */
  l1TxCount: number;
  /** Number of L2 transactions included in the block. */
  l2TxCount: number;
  /** Root hash of the block's state after execution. */
  rootHash?: string;
  /** Current status of the block (e.g., verified, executed). */
  status: string;
  /** Transaction hash of the commit operation on L1. */
  commitTxHash?: string;
  /** Timestamp when the block was committed on L1. */
  committedAt?: Date;
  /** Transaction hash of the proof submission on L1. */
  proveTxHash?: string;
  /** Timestamp when the proof was submitted on L1. */
  provenAt?: Date;
  /** Transaction hash of the execution on L1. */
  executeTxHash?: string;
  /** Timestamp when the block execution was completed on L1. */
  executedAt?: Date;
  /** L1 gas price at the time of the block's execution. */
  l1GasPrice: number;
  /** Fair gas price on L2 at the time of the block's execution. */
  l2FairGasPrice: number;
  /** A collection of hashes for the base system contracts involved in the block. */
  baseSystemContractsHashes: {
    bootloader: string;
    default_aa: string;
  };
  /** Address of the operator who committed the block. */
  operatorAddress: string;
  /** Version of the ZKsync protocol the block was committed under. */
  protocolVersion: string;
}

/** Contains transaction details information. */
export interface TransactionDetails {
  /** Indicates whether the transaction originated on Layer 1. */
  isL1Originated: boolean;
  /** Current status of the transaction (e.g., verified). */
  status: string;
  /** Transaction fee. */
  fee: BigNumberish;
  /** Gas amount per unit of public data for this transaction. */
  gasPerPubdata: BigNumberish;
  /** Address of the transaction initiator. */
  initiatorAddress: Address;
  /** Timestamp when the transaction was received. */
  receivedAt: Date;
  /** Transaction hash of the commit operation. */
  ethCommitTxHash?: string;
  /** Transaction hash of the proof submission. */
  ethProveTxHash?: string;
  /** Transaction hash of the execution. */
  ethExecuteTxHash?: string;
}

/** Represents the full deposit fee containing fees for both L1 and L2 transactions. */
export interface FullDepositFee {
  /** The maximum fee per gas for L1 transaction. */
  maxFeePerGas?: bigint;
  /** The maximum priority fee per gas for L1 transaction. */
  maxPriorityFeePerGas?: bigint;
  /** The gas price for L2 transaction. */
  gasPrice?: bigint;
  /** The base cost of the deposit transaction on L2. */
  baseCost: bigint;
  /** The gas limit for L1 transaction. */
  l1GasLimit: bigint;
  /** The gas limit for L2 transaction. */
  l2GasLimit: bigint;
}

/** Represents a raw block transaction. */
export interface RawBlockTransaction {
  /** General information about the L2 transaction. */
  common_data: {
    L2: {
      nonce: number;
      fee: {
        gas_limit: bigint;
        max_fee_per_gas: bigint;
        max_priority_fee_per_gas: bigint;
        gas_per_pubdata_limit: bigint;
      };
      initiatorAddress: Address;
      signature: BytesLike[];
      transactionType: string;
      input: {
        hash: string;
        data: BytesLike[];
      };
      paymasterParams: {
        paymaster: Address;
        paymasterInput: BytesLike[];
      };
    };
  };
  /** Details regarding the execution of the transaction. */
  execute: {
    calldata: string;
    contractAddress: Address;
    factoryDeps: BytesLike[] | null;
    value: bigint;
  };
  /** Timestamp when the transaction was received, in milliseconds. */
  received_timestamp_ms: number;
  /** Raw bytes of the transaction as a hexadecimal string. */
  raw_bytes: string | null;
}

/** Contains parameters for finalizing the withdrawal transaction. */
export interface FinalizeWithdrawalParams {
  /** The L2 batch number where the withdrawal was processed. */
  l1BatchNumber: number | null;
  /** The position in the L2 logs Merkle tree of the l2Log that was sent with the message. */
  l2MessageIndex: number;
  /** The L2 transaction number in the batch, in which the log was sent. */
  l2TxNumberInBlock: number | null;
  /** The L2 withdraw data, stored in an L2 -> L1 message. */
  message: any;
  /** The L2 address which sent the log. */
  sender: string;
  /** The Merkle proof of the inclusion L2 -> L1 message about withdrawal initialization. */
  proof: string[];
}

/** Represents storage proof. */
export interface StorageProof {
  /** Account address associated with the storage proofs. */
  address: string;
  /** Array of objects, each representing a storage proof for the requested keys. */
  storageProof: {
    /** Storage key for which the proof is provided. */
    key: string;
    /** Value stored in the specified storage key at the time of the specified l1BatchNumber. */
    value: string;
    /**
     * A 1-based index representing the position of the tree entry within the Merkle tree.
     * This index is used to help reconstruct the Merkle path during verification.
     */
    index: number;
    /**
     * An array of 32-byte hashes that constitute the Merkle path from the leaf node
     * (representing the storage key-value pair) to the root of the Merkle tree.
     */
    proof: string[];
  }[];
}

/** Represents the protocol version. */
export interface ProtocolVersion {
  /** Protocol version ID. */
  version_id: number;
  /** Unix timestamp of the version's activation. */
  timestamp: number;
  /** Contains the hashes of various verification keys used in the protocol. */
  verification_keys_hashes: {
    params: {
      recursion_node_level_vk_hash: string;
      recursion_leaf_level_vk_hash: string;
      recursion_circuits_set_vks_hash: string;
    };
    recursion_scheduler_level_vk_hash: string;
  };
  /** Hashes of the base system contracts. */
  base_system_contracts: {
    bootloader: string;
    default_aa: string;
  };
  /** Hash of the transaction used for the system upgrade, if any. */
  l2_system_upgrade_tx_hash: string | null;
}

/** Represents the transaction with detailed output. */
export interface TransactionWithDetailedOutput {
  /** Transaction hash. */
  transactionHash: string;
  /** Storage slots. */
  storageLogs: Array<{
    address: string;
    key: string;
    writtenValue: string;
  }>;
  /** Generated events. */
  events: Array<{
    address: string;
    topics: string[];
    data: string;
    blockHash: string | null;
    blockNumber: bigint | null;
    l1BatchNumber: bigint | null;
    transactionHash: string;
    transactionIndex: bigint;
    logIndex: bigint | null;
    transactionLogIndex: bigint | null;
    logType: string | null;
    removed: boolean;
  }>;
}

/**
 *  Signs various types of payloads, optionally using a some kind of secret.
 *
 *  @param payload The payload that needs to be sign.
 *  @param [secret] The secret used for signing the `payload`.
 *  @param [provider] The provider is used to fetch data from the network if it is required for signing.
 *  @returns A promise that resolves to the serialized signature in hexadecimal format.
 */
export type PayloadSigner = (
  payload: BytesLike,
  secret?: any,
  provider?: null | Provider
) => Promise<string>;

/**
 * Populates missing fields in a transaction with default values.
 *
 * @param transaction The transaction that needs to be populated.
 * @param [secret] The secret used for populating the transaction.
 * @param [provider] The provider is used to fetch data from the network if it is required for signing.
 * @returns A promise that resolves to the populated transaction.
 */
export type TransactionBuilder = (
  transaction: TransactionRequest,
  secret?: any,
  provider?: null | Provider
) => Promise<TransactionLike>;

/**
 * Encapsulates the required input parameters for creating a signer for `SmartAccount`.
 */
export interface SmartAccountSigner {
  /** Address to which the `SmartAccount` is bound. */
  address: string;
  /** Secret in any form that can be used for signing different payloads. */
  secret: any;
  /** Custom method for signing different payloads. */
  payloadSigner?: PayloadSigner;
  /** Custom method for populating transaction requests. */
  transactionBuilder?: TransactionBuilder;
}
