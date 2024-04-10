import { ethers } from "ethers";
import { Provider } from "./provider";
import { BlockTag, Signature, TransactionRequest, TransactionResponse } from "./types";
import { TypedDataSigner } from "@ethersproject/abstract-signer";
export declare const EIP712_TYPES: {
    Transaction: {
        name: string;
        type: string;
    }[];
};
export declare class EIP712Signer {
    private ethSigner;
    private eip712Domain;
    constructor(ethSigner: ethers.Signer & TypedDataSigner, chainId: number | Promise<number>);
    static getSignInput(transaction: TransactionRequest): {
        txType: number;
        from: string;
        to: string;
        gasLimit: ethers.BigNumberish;
        gasPerPubdataByteLimit: ethers.BigNumberish;
        maxFeePerGas: ethers.BigNumberish;
        maxPriorityFeePerGas: ethers.BigNumberish;
        paymaster: string;
        nonce: ethers.BigNumberish;
        value: ethers.BigNumberish;
        data: ethers.utils.BytesLike;
        factoryDeps: Uint8Array[];
        paymasterInput: ethers.utils.BytesLike;
    };
    sign(transaction: TransactionRequest): Promise<Signature>;
    static getSignedDigest(transaction: TransactionRequest): ethers.BytesLike;
    getDomain(): Promise<ethers.TypedDataDomain>;
}
declare const Signer_base: {
    new (...args: any[]): {
        _providerL2(): Provider;
        _signerL2(): ethers.Signer;
        getBalance(token?: string, blockTag?: BlockTag): Promise<ethers.BigNumber>;
        getAllBalances(): Promise<import("./types").BalancesMap>;
        getDeploymentNonce(): Promise<ethers.BigNumber>;
        getL2BridgeContracts(): Promise<{
            shared: import("../typechain/Il2Bridge").Il2Bridge;
        }>;
        _fillCustomData(data: import("./types").Eip712Meta): import("./types").Eip712Meta;
        withdraw(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            bridgeAddress?: string;
            overrides?: ethers.Overrides;
        }): Promise<TransactionResponse>;
        transfer(transaction: {
            to: string;
            amount: ethers.BigNumberish;
            token?: string;
            overrides?: ethers.Overrides;
        }): Promise<TransactionResponse>;
        sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & typeof ethers.providers.JsonRpcSigner;
export declare class Signer extends Signer_base {
    provider: Provider;
    eip712: EIP712Signer;
    _signerL2(): this;
    _providerL2(): Provider;
    static from(signer: ethers.providers.JsonRpcSigner & {
        provider: Provider;
    }): Signer;
    getNonce(blockTag?: BlockTag): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
declare const L1Signer_base: {
    new (...args: any[]): {
        _providerL2(): Provider;
        _providerL1(): ethers.providers.Provider;
        _signerL1(): ethers.Signer;
        getMainContract(): Promise<import("../typechain/IZkSyncStateTransition").IZkSyncStateTransition>;
        getBridgehubContract(): Promise<import("../typechain/IBridgehub").IBridgehub>;
        getL1BridgeContracts(): Promise<{
            erc20: import("../typechain/Il1Erc20Bridge").Il1Erc20Bridge;
            shared: import("../typechain/Il1SharedBridge").Il1SharedBridge;
        }>;
        getBaseToken(): Promise<string>;
        isEthBasedChain(): Promise<boolean>;
        getBalanceL1(token?: string, blockTag?: ethers.providers.BlockTag): Promise<ethers.BigNumber>;
        getAllowanceL1(token: string, bridgeAddress?: string, blockTag?: ethers.providers.BlockTag): Promise<ethers.BigNumber>;
        l2TokenAddress(token: string): Promise<string>;
        approveERC20(token: string, amount: ethers.BigNumberish, overrides?: ethers.Overrides & {
            bridgeAddress?: string;
        }): Promise<ethers.providers.TransactionResponse>;
        getBaseCost(params: {
            gasLimit: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            gasPrice?: ethers.BigNumberish;
        }): Promise<ethers.BigNumber>;
        getDepositAllowanceParams(token: string, amount: ethers.BigNumberish): Promise<{
            token: string;
            allowance: ethers.BigNumberish;
        }[]>;
        deposit(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: ethers.utils.BytesLike;
        }): Promise<import("./types").PriorityOpResponse>;
        _depositNonBaseTokenToNonETHBasedChain(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: ethers.utils.BytesLike;
        }): Promise<import("./types").PriorityOpResponse>;
        _depositBaseTokenToNonETHBasedChain(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: ethers.utils.BytesLike;
        }): Promise<import("./types").PriorityOpResponse>;
        _depositETHToNonETHBasedChain(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: ethers.utils.BytesLike;
        }): Promise<import("./types").PriorityOpResponse>;
        _depositTokenToETHBasedChain(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: ethers.utils.BytesLike;
        }): Promise<import("./types").PriorityOpResponse>;
        _depositETHToETHBasedChain(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: ethers.utils.BytesLike;
        }): Promise<import("./types").PriorityOpResponse>;
        estimateGasDeposit(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            customBridgeData?: ethers.utils.BytesLike;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.BigNumber>;
        getDepositTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<any>;
        _getDepositNonBaseTokenToNonETHBasedChainTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            tx: ethers.PopulatedTransaction;
            mintValue: ethers.BigNumber;
        }>;
        _getDepositBaseTokenOnNonETHBasedChainTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            tx: {
                token: string;
                amount: ethers.BigNumberish;
                to: string;
                operatorTip: ethers.BigNumberish;
                bridgeAddress?: string;
                l2GasLimit: ethers.BigNumberish;
                gasPerPubdataByte: ethers.BigNumberish;
                customBridgeData?: ethers.utils.BytesLike;
                refundRecipient?: string;
                overrides: ethers.PayableOverrides;
                contractAddress: string;
                calldata: string;
                mintValue: ethers.BigNumber;
                l2Value: ethers.BigNumberish;
            };
            mintValue: ethers.BigNumber;
        }>;
        _getDepositETHOnNonETHBasedChainTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            tx: ethers.PopulatedTransaction;
            mintValue: ethers.BigNumber;
        }>;
        _getDepositTokenOnETHBasedChainTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.PopulatedTransaction>;
        _getDepositETHOnETHBasedChainTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            token: string;
            amount: ethers.BigNumberish;
            to: string;
            operatorTip: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit: ethers.BigNumberish;
            gasPerPubdataByte: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides: ethers.PayableOverrides;
            contractAddress: string;
            calldata: string;
            mintValue: ethers.BigNumberish;
            l2Value: ethers.BigNumberish;
        }>;
        _getDepositTxWithDefaults(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            token: string;
            amount: ethers.BigNumberish;
            to: string;
            operatorTip: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit: ethers.BigNumberish;
            gasPerPubdataByte: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides: ethers.PayableOverrides;
        }>;
        _getL2GasLimit(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.BigNumberish>;
        _getL2GasLimitFromCustomBridge(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            to?: string;
            operatorTip?: ethers.BigNumberish;
            bridgeAddress?: string;
            l2GasLimit?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            customBridgeData?: ethers.utils.BytesLike;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.BigNumberish>;
        getFullRequiredDepositFee(transaction: {
            token: string;
            to?: string;
            bridgeAddress?: string;
            customBridgeData?: ethers.utils.BytesLike;
            gasPerPubdataByte?: ethers.BigNumberish;
            overrides?: ethers.PayableOverrides;
        }): Promise<import("./types").FullDepositFee>;
        getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
            l1BatchNumber: number;
            l2MessageIndex: number;
            l2TxNumberInBlock: number;
            proof: string[];
        }>;
        _getWithdrawalLog(withdrawalHash: ethers.utils.BytesLike, index?: number): Promise<{
            log: import("./types").Log;
            l1BatchTxId: number;
        }>;
        _getWithdrawalL2ToL1Log(withdrawalHash: ethers.utils.BytesLike, index?: number): Promise<{
            l2ToL1LogIndex: number;
            l2ToL1Log: import("./types").L2ToL1Log;
        }>;
        finalizeWithdrawalParams(withdrawalHash: ethers.utils.BytesLike, index?: number): Promise<import("./types").FinalizeWithdrawalParams>;
        finalizeWithdrawal(withdrawalHash: ethers.utils.BytesLike, index?: number, overrides?: ethers.Overrides): Promise<ethers.ContractTransaction>;
        isWithdrawalFinalized(withdrawalHash: ethers.utils.BytesLike, index?: number): Promise<any>;
        claimFailedDeposit(depositHash: ethers.utils.BytesLike, overrides?: ethers.Overrides): Promise<ethers.ContractTransaction>;
        requestExecute(transaction: {
            contractAddress: string;
            calldata: ethers.utils.BytesLike;
            l2GasLimit?: ethers.BigNumberish;
            mintValue?: ethers.BigNumberish;
            l2Value?: ethers.BigNumberish;
            factoryDeps?: ethers.utils.BytesLike[];
            operatorTip?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<import("./types").PriorityOpResponse>;
        estimateGasRequestExecute(transaction: {
            contractAddress: string;
            calldata: ethers.utils.BytesLike;
            l2GasLimit?: ethers.BigNumberish;
            mintValue?: ethers.BigNumberish;
            l2Value?: ethers.BigNumberish;
            factoryDeps?: ethers.utils.BytesLike[];
            operatorTip?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.BigNumber>;
        getRequestExecuteAllowanceParams(transaction: {
            contractAddress: string;
            calldata: ethers.utils.BytesLike;
            l2GasLimit?: ethers.BigNumberish;
            l2Value?: ethers.BigNumberish;
            factoryDeps?: ethers.utils.BytesLike[];
            operatorTip?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            token: string;
            allowance: ethers.BigNumberish;
        }>;
        getRequestExecuteTx(transaction: {
            contractAddress: string;
            calldata: ethers.utils.BytesLike;
            l2GasLimit?: ethers.BigNumberish;
            mintValue?: ethers.BigNumberish;
            l2Value?: ethers.BigNumberish;
            factoryDeps?: ethers.utils.BytesLike[];
            operatorTip?: ethers.BigNumberish;
            gasPerPubdataByte?: ethers.BigNumberish;
            refundRecipient?: string;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.PopulatedTransaction>;
        sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & typeof ethers.providers.JsonRpcSigner;
export declare class L1Signer extends L1Signer_base {
    providerL2: Provider;
    _providerL2(): Provider;
    _providerL1(): ethers.providers.JsonRpcProvider;
    _signerL1(): this;
    static from(signer: ethers.providers.JsonRpcSigner, zksyncProvider: Provider): L1Signer;
    connectToL2(provider: Provider): this;
}
export {};
