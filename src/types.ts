import {
  assertArgument,
  BigNumberish,
  BytesLike,
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
 * - Constants representing special blocks such as 'committed', 'finalized', 'latest', 'earliest', or 'pending'.
 */
export type BlockTag =
  | BigNumberish
  | string // block hash
  | 'committed'
  | 'finalized'
  | 'latest'
  | 'earliest'
  | 'pending';

/** Pipe-delimited choice of deployment types. */
export type DeploymentType =
  | 'create'
  | 'createAccount'
  | 'create2'
  | 'create2Account';

/** Bridged token. */
export interface Token {
  l1Address: Address;
  l2Address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

/** Represents the transaction fee parameters. */
export interface Fee {
  /** The maximum amount of gas allowed for the transaction. */
  gasLimit: bigint;
  /** The maximum amount of gas the user is willing to pay for a single byte of pubdata. */
  gasPerPubdataLimit: bigint;
  /** The EIP1559 tip per gas. */
  maxPriorityFeePerGas: bigint;
  /** The EIP1559 fee cap per gas. */
  maxFeePerGas: bigint;
}

/** Represents a message proof. */
export interface MessageProof {
  id: number;
  proof: string[];
  root: string;
}

/**
 * A `TransactionResponse` is an extension of {@link ethers.TransactionResponse} with additional features for
 * interacting with zkSync Era.
 */
export class TransactionResponse extends ethers.TransactionResponse {
  /** The batch number on the L1 network. */
  readonly l1BatchNumber: null | number;
  /** The transaction index within the batch on the L1 network. */
  readonly l1BatchTxIndex: null | number;

  constructor(params: any, provider: ethers.Provider) {
    super(params, provider);
    this.l1BatchNumber = params.l1BatchNumber;
    this.l1BatchTxIndex = params.l1BatchTxIndex;
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
  override async wait(confirmations?: number): Promise<TransactionReceipt> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const receipt = (await super.wait(confirmations)) as TransactionReceipt;
      if (receipt && receipt.blockNumber) {
        return receipt;
      }
      await sleep(500);
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
 * interacting with zkSync Era.
 */
export class TransactionReceipt extends ethers.TransactionReceipt {
  /** The batch number on the L1 network. */
  readonly l1BatchNumber: null | number;
  /** The transaction index within the batch on the L1 network. */
  readonly l1BatchTxIndex: null | number;
  /** The logs of L2 to L1 messages. */
  readonly l2ToL1Logs: L2ToL1Log[];
  /** All logs included in the transaction receipt. */
  readonly _logs: ReadonlyArray<Log>;

  constructor(params: any, provider: ethers.Provider) {
    super(params, provider);
    this.l1BatchNumber = params.l1BatchNumber;
    this.l1BatchTxIndex = params.l1BatchTxIndex;
    this.l2ToL1Logs = params.l2ToL1Logs;
    this._logs = Object.freeze(
      params.logs.map((log: Log) => {
        return new Log(log, provider);
      })
    );
  }

  override get logs(): ReadonlyArray<Log> {
    return this._logs;
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

/** A `Block` is an extension of {@link ethers.Block} with additional features for interacting with zkSync Era. */
export class Block extends ethers.Block {
  /** The batch number on L1. */
  readonly l1BatchNumber: null | number;
  /** The timestamp of the batch on L1. */
  readonly l1BatchTimestamp: null | number;

  constructor(params: any, provider: ethers.Provider) {
    super(params, provider);
    this.l1BatchNumber = params.l1BatchNumber;
    this.l1BatchTimestamp = params.l1BatchTxIndex;
  }

  override toJSON(): any {
    const {l1BatchNumber, l1BatchTimestamp: l1BatchTxIndex} = this;
    return {
      ...super.toJSON(),
      l1BatchNumber,
      l1BatchTxIndex,
    };
  }

  override get prefetchedTransactions(): TransactionResponse[] {
    return super.prefetchedTransactions as TransactionResponse[];
  }

  override getTransaction(
    indexOrHash: number | string
  ): Promise<TransactionResponse> {
    return super.getTransaction(indexOrHash) as Promise<TransactionResponse>;
  }
}

/** A `LogParams` is an extension of {@link ethers.LogParams} with additional features for interacting with zkSync Era. */
export interface LogParams extends ethers.LogParams {
  /** The batch number on L1. */
  readonly l1BatchNumber: null | number;
}

/** A `Log` is an extension of {@link ethers.Log} with additional features for interacting with zkSync Era. */
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
 * with zkSync Era.
 */
export interface TransactionLike extends ethers.TransactionLike {
  /** The custom data for EIP712 transaction metadata. */
  customData?: null | Eip712Meta;
}

/**
 * A `Transaction` is an extension of {@link ethers.Transaction} with additional features for interacting
 * with zkSync Era.
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
          result.from.toLowerCase() === tx.from.toLowerCase(),
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
  blockNumber: number;
  blockHash: string;
  l1BatchNumber: number;
  transactionIndex: number;
  shardId: number;
  isService: boolean;
  sender: string;
  key: string;
  value: string;
  transactionHash: string;
  logIndex: number;
}

/**
 * A `TransactionRequest` is an extension of {@link ethers.TransactionRequest} with additional features for interacting
 * with zkSync Era.
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

/** A map containing accounts and their balances. */
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
  /** Used for contracts that are not accounts */
  None = 0,
  /** Used for contracts that are accounts */
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

/** Contains batch information. */
export interface BatchDetails {
  number: number;
  timestamp: number;
  l1TxCount: number;
  l2TxCount: number;
  rootHash?: string;
  status: string;
  commitTxHash?: string;
  committedAt?: Date;
  proveTxHash?: string;
  provenAt?: Date;
  executeTxHash?: string;
  executedAt?: Date;
  l1GasPrice: number;
  l2FairGasPrice: number;
}

/** Contains block information. */
export interface BlockDetails {
  number: number;
  timestamp: number;
  l1BatchNumber: number;
  l1TxCount: number;
  l2TxCount: number;
  rootHash?: string;
  status: string;
  commitTxHash?: string;
  committedAt?: Date;
  proveTxHash?: string;
  provenAt?: Date;
  executeTxHash?: string;
  executedAt?: Date;
}

/** Contains transaction details information. */
export interface TransactionDetails {
  isL1Originated: boolean;
  status: string;
  fee: BigNumberish;
  initiatorAddress: Address;
  receivedAt: Date;
  ethCommitTxHash?: string;
  ethProveTxHash?: string;
  ethExecuteTxHash?: string;
}

/** Represents the full deposit fee containing fees for both L1 and L2 transactions. */
export interface FullDepositFee {
  /** The maximum fee per gas for L1 transaction. */
  maxFeePerGas?: BigInt;
  /** The maximum priority fee per gas for L1 transaction. */
  maxPriorityFeePerGas?: BigInt;
  /** The gas price for L2 transaction. */
  gasPrice?: BigInt;
  /** The base cost of the deposit transaction on L2. */
  baseCost: BigInt;
  /** The gas limit for L1 transaction. */
  l1GasLimit: BigInt;
  /** The gas limit for L2 transaction. */
  l2GasLimit: BigInt;
}

/** Represents a raw block transaction. */
export interface RawBlockTransaction {
  common_data: {
    L2: {
      nonce: number;
      fee: {
        gas_limit: BigInt;
        max_fee_per_gas: BigInt;
        max_priority_fee_per_gas: BigInt;
        gas_per_pubdata_limit: BigInt;
      };
      initiatorAddress: Address;
      signature: Uint8Array;
      transactionType: string;
      input: {
        hash: string;
        data: Uint8Array;
      };
      paymasterParams: {
        paymaster: Address;
        paymasterInput: Uint8Array;
      };
    };
  };
  execute: {
    calldata: string;
    contractAddress: Address;
    factoryDeps: BytesLike[];
    value: BigInt;
  };
  received_timestamp_ms: number;
  raw_bytes: string;
}

/** Contains parameters for finalizing the withdrawal transaction. */
export interface FinalizeWithdrawalParams {
  l1BatchNumber: number | null;
  l2MessageIndex: number;
  l2TxNumberInBlock: number | null;
  message: any;
  sender: string;
  proof: string[];
}

/** Represents storage proof */
export interface StorageProof {
  address: string;
  storageProof: {
    key: string;
    value: string;
    index: number;
    proof: string[];
  }[];
}

/**
 *  Signs various types of payloads, optionally using a some kind of secret.
 *
 *  @param payload The payload that needs to be sign already populated transaction to sign.
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
