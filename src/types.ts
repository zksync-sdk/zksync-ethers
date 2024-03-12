import {BytesLike, BigNumberish, providers, BigNumber} from 'ethers';
import {BlockWithTransactions as EthersBlockWithTransactions} from '@ethersproject/abstract-provider';
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
  NotFound = 'not-found',
  Processing = 'processing',
  Committed = 'committed',
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
 * - A numeric value (number, BigNumber, or hexadecimal string) representing the block height, where the genesis block is block 0.
 *   A negative value indicates the block number should be deducted from the most recent block.
 * - A block hash as a string, specifying a specific block by its block hash.
 *   This allows potentially orphaned blocks to be specified without ambiguity, but many backends do not support this for some operations.
 * - Constants representing special blocks such as 'committed', 'finalized', 'latest', 'earliest', or 'pending'.
 */
export type BlockTag =
  | number
  | string // hex number
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
  /** @deprecated This field is here for backward compatibility - please use l2Address field instead */
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

/** Represents the transaction fee parameters. */
export interface Fee {
  /** The maximum amount of gas allowed for the transaction. */
  readonly gasLimit: BigNumber;
  /** The maximum amount of gas the user is willing to pay for a single byte of pubdata. */
  readonly gasPerPubdataLimit: BigNumber;
  /** The EIP1559 tip per gas. */
  readonly maxPriorityFeePerGas: BigNumber;
  /** The EIP1559 fee cap per gas. */
  readonly maxFeePerGas: BigNumber;
}

/** Represents a message proof. */
export interface MessageProof {
  id: number;
  proof: string[];
  root: string;
}

/**
 * An EventFilter allows efficiently filtering logs (also known as events) using bloom filters included within blocks.
 */
export interface EventFilter {
  /**
   * An array representing the structure to define bloom-filter queries.
   *
   * Each element in the array corresponds to a topic filter. The elements can be of type string, Array<string>, or null.
   *
   * - A string element must match exactly that value.
   * - An array element represents an OR-ed set, where any one of those values must match.
   * - A null element matches any value.
   */
  topics?: Array<string | Array<string> | null>;
  /**
   * The address or addresses from which logs are filtered.
   *
   * If specified as a single Address, only logs originating from that address are included.
   * If specified as an array of Addresses, logs from any of those addresses are included.
   */
  address?: Address | Array<Address>;
  /**
   * The block number or block tag representing the starting block for filtering logs.
   */
  fromBlock?: BlockTag;
  /**
   * The block number or block tag representing the ending block for filtering logs.
   */
  toBlock?: BlockTag;
  /**
   * The hash of the block from which logs are filtered.
   *
   * If specified, filters logs from a single block identified by its block hash.
   */
  blockHash?: string;
}

/**
 * A `TransactionResponse` is an extension of {@link providers.TransactionResponse} with additional features for
 * interacting with zkSync Era.
 */
export interface TransactionResponse extends providers.TransactionResponse {
  /** The batch number on the L1 network. */
  l1BatchNumber: number;
  /** The transaction index within the batch on the L1 network. */
  l1BatchTxIndex: number;
  /** Waits for transaction to be mined. */
  wait(confirmations?: number): Promise<TransactionReceipt>;
  /** Waits for transaction to be finalized. */
  waitFinalize(): Promise<TransactionReceipt>;
}

/**
 * A `TransactionReceipt` is an extension of {@link providers.TransactionReceipt} with additional features for
 * interacting with zkSync Era.
 */
export interface TransactionReceipt extends providers.TransactionReceipt {
  /** The batch number on the L1 network. */
  l1BatchNumber: number;
  /** The transaction index within the batch on the L1 network. */
  l1BatchTxIndex: number;
  /** All logs included in the transaction receipt. */
  logs: Array<Log>;
  /** The logs of L2 to L1 messages. */
  l2ToL1Logs: Array<L2ToL1Log>;
}

/** A `Block` is an extension of {@link providers.Block} with additional features for interacting with zkSync Era. */
export interface Block extends providers.Block {
  /** The batch number on L1. */
  l1BatchNumber: number;
  /** The timestamp of the batch on L1. */
  l1BatchTimestamp: number;
}

/** A `Block` is an extension of {@link EthersBlockWithTransactions} with additional features for interacting with zkSync Era. */
export interface BlockWithTransactions extends EthersBlockWithTransactions {
  /** The batch number on L1. */
  l1BatchNumber: number;
  /** The timestamp of the batch on L1. */
  l1BatchTimestamp: number;
  /** The transactions that are part of the block */
  transactions: Array<TransactionResponse>;
}

/** A `Log` is an extension of {@link providers.Log} with additional features for interacting with zkSync Era. */
export interface Log extends providers.Log {
  /** The batch number on L1. */
  l1BatchNumber: number;
}

/**
 * Represents a L2 to L1 transaction log.
 */
export interface L2ToL1Log {
  blockNumber: number;
  blockHash: string;
  l1BatchNumber: number;
  transactionIndex: number;
  txIndexInL1Batch?: number;
  shardId: number;
  isService: boolean;
  sender: string;
  key: string;
  value: string;
  transactionHash: string;
  logIndex: number;
}

/**
 * A `TransactionRequest` is an extension of {@link providers.TransactionRequest} with additional features for interacting
 * with zkSync Era.
 */
export type TransactionRequest = providers.TransactionRequest & {
  /** The custom data for EIP712 transaction metadata. */
  customData?: Eip712Meta;
};

/**
 * Interface representation of priority op response that extends {@link TransactionResponse} and adds a function
 * that waits to commit a L1 transaction, including when given on optional confirmation number.
 */
export interface PriorityOpResponse extends TransactionResponse {
  /**
   * Waits for the L1 transaction to be committed, including waiting for the specified number of confirmations.
   * @param confirmation The number of confirmations to wait for. Defaults to 1.
   * @returns A promise that resolves to the transaction receipt once committed.
   */
  waitL1Commit(confirmation?: number): Promise<providers.TransactionReceipt>;
}

/** A map containing accounts and their balances. */
export type BalancesMap = {[key: string]: BigNumber};

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
  minimalAllowance: BigNumber;
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
  baseSystemContractsHashes: {
    bootloader: string;
    defaultAa: string;
  };
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
  baseSystemContractsHashes: {
    bootloader: string;
    defaultAa: string;
  };
}

/** Contains transaction details information. */
export interface TransactionDetails {
  isL1Originated: boolean;
  status: string;
  fee: BigNumberish;
  gasPerPubdata: BigNumberish;
  initiatorAddress: Address;
  receivedAt: Date;
  ethCommitTxHash?: string;
  ethProveTxHash?: string;
  ethExecuteTxHash?: string;
}

/** Represents the full deposit fee containing fees for both L1 and L2 transactions. */
export interface FullDepositFee {
  /** The maximum fee per gas for L1 transaction. */
  maxFeePerGas?: BigNumber;
  /** The maximum priority fee per gas for L1 transaction. */
  maxPriorityFeePerGas?: BigNumber;
  /** The gas price for L2 transaction. */
  gasPrice?: BigNumber;
  /** The base cost of the deposit transaction on L2. */
  baseCost: BigNumber;
  /** The gas limit for L1 transaction. */
  l1GasLimit: BigNumber;
  /** The gas limit for L2 transaction. */
  l2GasLimit: BigNumber;
}

/** Represents a raw block transaction. */
export interface RawBlockTransaction {
  common_data: {
    L2: {
      nonce: number;
      fee: {
        gas_limit: BigNumber;
        max_fee_per_gas: BigNumber;
        max_priority_fee_per_gas: BigNumber;
        gas_per_pubdata_limit: BigNumber;
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
    value: BigNumber;
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
 *  @param payload  The payload that needs to be sign already populated transaction to sign.
 *  @param [secret] The Secret used for signing the `payload`.
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
) => Promise<providers.TransactionRequest>;

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
