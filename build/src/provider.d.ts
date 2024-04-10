import { BigNumber, BigNumberish, BytesLike, ethers, providers, utils } from "ethers";
import { ExternalProvider } from "@ethersproject/providers";
import { ConnectionInfo } from "@ethersproject/web";
import { Address, BalancesMap, BatchDetails, Block, BlockDetails, BlockTag, BlockWithTransactions, ContractAccountInfo, EventFilter, Log, MessageProof, PriorityOpResponse, TransactionDetails, TransactionReceipt, TransactionRequest, TransactionResponse, TransactionStatus, Fee, Network as ZkSyncNetwork, RawBlockTransaction } from "./types";
import { Signer } from "./signer";
import Formatter = providers.Formatter;
export declare class Provider extends ethers.providers.JsonRpcProvider {
    private static _nextPollId;
    protected contractAddresses: {
        bridgehubContract?: Address;
        mainContract?: Address;
        erc20BridgeL1?: Address;
        sharedBridgeL1?: Address;
        sharedBridgeL2?: Address;
        baseToken?: Address;
    };
    poll(): Promise<void>;
    getTransactionReceipt(transactionHash: string | Promise<string>): Promise<TransactionReceipt>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
    static getFormatter(): Formatter;
    getBalance(address: Address, blockTag?: BlockTag, tokenAddress?: Address): Promise<BigNumber>;
    l2TokenAddress(token: Address): Promise<string>;
    l1TokenAddress(token: Address): Promise<string>;
    static hexlifyTransaction(transaction: ethers.providers.TransactionRequest, allowExtra?: Record<string, boolean>): {
        [key: string]: string | ethers.utils.AccessList;
    };
    estimateGas(transaction: utils.Deferrable<TransactionRequest>): Promise<BigNumber>;
    estimateGasL1(transaction: utils.Deferrable<TransactionRequest>): Promise<BigNumber>;
    estimateFee(transaction: TransactionRequest): Promise<Fee>;
    getGasPrice(token?: Address): Promise<BigNumber>;
    constructor(url?: ConnectionInfo | string, network?: ethers.providers.Networkish);
    getMessageProof(blockNumber: ethers.BigNumberish, sender: Address, messageHash: BytesLike, logIndex?: number): Promise<MessageProof | null>;
    getLogProof(txHash: BytesLike, index?: number): Promise<MessageProof | null>;
    getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
    getBridgehubContractAddress(): Promise<Address>;
    getMainContractAddress(): Promise<Address>;
    getBaseTokenContractAddress(): Promise<Address>;
    isEthBasedChain(): Promise<boolean>;
    isBaseToken(token: Address): Promise<boolean>;
    getTestnetPaymasterAddress(): Promise<Address | null>;
    getDefaultBridgeAddresses(): Promise<{
        erc20L1: string;
        sharedL1: string;
        sharedL2: string;
    }>;
    getTokenPrice(token: Address): Promise<string | null>;
    getAllAccountBalances(address: Address): Promise<BalancesMap>;
    l1ChainId(): Promise<number>;
    getL1BatchNumber(): Promise<number>;
    getL1BatchDetails(number: number): Promise<BatchDetails>;
    getBlockDetails(number: number): Promise<BlockDetails>;
    getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails>;
    getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array>;
    getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
    getWithdrawTx(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        overrides?: ethers.CallOverrides;
    }): Promise<ethers.providers.TransactionRequest>;
    estimateGasWithdraw(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        overrides?: ethers.CallOverrides;
    }): Promise<BigNumber>;
    getTransferTx(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        overrides?: ethers.CallOverrides;
    }): Promise<ethers.providers.TransactionRequest>;
    estimateGasTransfer(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        overrides?: ethers.CallOverrides;
    }): Promise<BigNumber>;
    static getDefaultProvider(zksyncNetwork?: ZkSyncNetwork): Provider;
    newFilter(filter: EventFilter | Promise<EventFilter>): Promise<BigNumber>;
    newBlockFilter(): Promise<BigNumber>;
    newPendingTransactionsFilter(): Promise<BigNumber>;
    getFilterChanges(idx: BigNumber): Promise<Array<Log | string>>;
    getLogs(filter?: EventFilter | Promise<EventFilter>): Promise<Array<Log>>;
    protected _parseLogs(logs: any[]): Array<Log>;
    protected _prepareFilter(filter: EventFilter): {
        fromBlock: string;
        toBlock: string;
        topics?: (string | string[])[];
        address?: string | string[];
        blockHash?: string;
    };
    _wrapTransaction(tx: ethers.Transaction, hash?: string): TransactionResponse;
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
    getTransaction(hash: string | Promise<string>): Promise<TransactionResponse>;
    sendTransaction(transaction: string | Promise<string>): Promise<TransactionResponse>;
    getL2TransactionFromPriorityOp(l1TxResponse: ethers.providers.TransactionResponse): Promise<TransactionResponse>;
    getPriorityOpResponse(l1TxResponse: ethers.providers.TransactionResponse): Promise<PriorityOpResponse>;
    _getPriorityOpConfirmationL2ToL1Log(txHash: string, index?: number): Promise<{
        l2ToL1LogIndex: number;
        l2ToL1Log: import("./types").L2ToL1Log;
        l1BatchTxId: number;
    }>;
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number;
        proof: string[];
    }>;
    getContractAccountInfo(address: Address): Promise<ContractAccountInfo>;
    estimateL1ToL2Execute(transaction: {
        contractAddress: Address;
        calldata: BytesLike;
        caller?: Address;
        l2Value?: BigNumberish;
        factoryDeps?: ethers.BytesLike[];
        gasPerPubdataByte?: BigNumberish;
        overrides?: ethers.PayableOverrides;
    }): Promise<BigNumber>;
}
export declare class Web3Provider extends Provider {
    readonly provider: ExternalProvider;
    constructor(provider: ExternalProvider, network?: ethers.providers.Networkish);
    send(method: string, params?: Array<any>): Promise<any>;
    getSigner(addressOrIndex?: number | string): Signer;
    estimateGas(transaction: ethers.utils.Deferrable<TransactionRequest>): Promise<BigNumber>;
}
