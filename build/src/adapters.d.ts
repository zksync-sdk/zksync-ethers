import { BigNumber, BigNumberish, BytesLike, ethers } from "ethers";
import { Il2Bridge } from "../typechain/Il2Bridge";
import { IBridgehub } from "../typechain/IBridgehub";
import { Il1Erc20Bridge } from "../typechain/Il1Erc20Bridge";
import { Il1SharedBridge } from "../typechain/Il1SharedBridge";
import { IZkSyncStateTransition } from "../typechain/IZkSyncStateTransition";
import { Provider } from "./provider";
import { Address, BalancesMap, BlockTag, Eip712Meta, FinalizeWithdrawalParams, FullDepositFee, PriorityOpResponse, TransactionResponse } from "./types";
type Constructor<T = {}> = new (...args: any[]) => T;
interface TxSender {
    sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
    getAddress(): Promise<Address>;
}
export declare function AdapterL1<TBase extends Constructor<TxSender>>(Base: TBase): {
    new (...args: any[]): {
        _providerL2(): Provider;
        _providerL1(): ethers.providers.Provider;
        _signerL1(): ethers.Signer;
        getMainContract(): Promise<IZkSyncStateTransition>;
        getBridgehubContract(): Promise<IBridgehub>;
        getL1BridgeContracts(): Promise<{
            erc20: Il1Erc20Bridge;
            shared: Il1SharedBridge;
        }>;
        getBaseToken(): Promise<string>;
        isEthBasedChain(): Promise<boolean>;
        getBalanceL1(token?: Address, blockTag?: ethers.providers.BlockTag): Promise<BigNumber>;
        getAllowanceL1(token: Address, bridgeAddress?: Address, blockTag?: ethers.providers.BlockTag): Promise<BigNumber>;
        l2TokenAddress(token: Address): Promise<string>;
        approveERC20(token: Address, amount: BigNumberish, overrides?: ethers.Overrides & {
            bridgeAddress?: Address;
        }): Promise<ethers.providers.TransactionResponse>;
        getBaseCost(params: {
            gasLimit: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            gasPrice?: BigNumberish;
        }): Promise<BigNumber>;
        getDepositAllowanceParams(token: Address, amount: BigNumberish): Promise<{
            token: Address;
            allowance: BigNumberish;
        }[]>;
        deposit(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse>;
        _depositNonBaseTokenToNonETHBasedChain(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse>;
        _depositBaseTokenToNonETHBasedChain(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse>;
        _depositETHToNonETHBasedChain(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse>;
        _depositTokenToETHBasedChain(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse>;
        _depositETHToETHBasedChain(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse>;
        estimateGasDeposit(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            customBridgeData?: BytesLike;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<BigNumber>;
        getDepositTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<any>;
        _getDepositNonBaseTokenToNonETHBasedChainTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            tx: ethers.PopulatedTransaction;
            mintValue: BigNumber;
        }>;
        _getDepositBaseTokenOnNonETHBasedChainTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            tx: {
                token: Address;
                amount: BigNumberish;
                to: Address;
                operatorTip: BigNumberish;
                bridgeAddress?: Address;
                l2GasLimit: BigNumberish;
                gasPerPubdataByte: BigNumberish;
                customBridgeData?: BytesLike;
                refundRecipient?: Address;
                overrides: ethers.PayableOverrides;
                contractAddress: string;
                calldata: string;
                mintValue: BigNumber;
                l2Value: BigNumberish;
            };
            mintValue: BigNumber;
        }>;
        _getDepositETHOnNonETHBasedChainTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            tx: ethers.PopulatedTransaction;
            mintValue: BigNumber;
        }>;
        _getDepositTokenOnETHBasedChainTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.PopulatedTransaction>;
        _getDepositETHOnETHBasedChainTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            token: Address;
            amount: BigNumberish;
            to: Address;
            operatorTip: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit: BigNumberish;
            gasPerPubdataByte: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides: ethers.PayableOverrides;
            contractAddress: string;
            calldata: string;
            mintValue: BigNumberish;
            l2Value: BigNumberish;
        }>;
        _getDepositTxWithDefaults(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            token: Address;
            amount: BigNumberish;
            to: Address;
            operatorTip: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit: BigNumberish;
            gasPerPubdataByte: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides: ethers.PayableOverrides;
        }>;
        _getL2GasLimit(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<BigNumberish>;
        _getL2GasLimitFromCustomBridge(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<BigNumberish>;
        getFullRequiredDepositFee(transaction: {
            token: Address;
            to?: Address;
            bridgeAddress?: Address;
            customBridgeData?: BytesLike;
            gasPerPubdataByte?: BigNumberish;
            overrides?: ethers.PayableOverrides;
        }): Promise<FullDepositFee>;
        getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
            l1BatchNumber: number;
            l2MessageIndex: number;
            l2TxNumberInBlock: number;
            proof: string[];
        }>;
        _getWithdrawalLog(withdrawalHash: BytesLike, index?: number): Promise<{
            log: import("./types").Log;
            l1BatchTxId: number;
        }>;
        _getWithdrawalL2ToL1Log(withdrawalHash: BytesLike, index?: number): Promise<{
            l2ToL1LogIndex: number;
            l2ToL1Log: import("./types").L2ToL1Log;
        }>;
        finalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number): Promise<FinalizeWithdrawalParams>;
        finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: ethers.Overrides): Promise<ethers.ContractTransaction>;
        isWithdrawalFinalized(withdrawalHash: BytesLike, index?: number): Promise<any>;
        claimFailedDeposit(depositHash: BytesLike, overrides?: ethers.Overrides): Promise<ethers.ContractTransaction>;
        requestExecute(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            mintValue?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<PriorityOpResponse>;
        estimateGasRequestExecute(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            mintValue?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<BigNumber>;
        getRequestExecuteAllowanceParams(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{
            token: Address;
            allowance: BigNumberish;
        }>;
        getRequestExecuteTx(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            mintValue?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.PopulatedTransaction>;
        sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & TBase;
export declare function AdapterL2<TBase extends Constructor<TxSender>>(Base: TBase): {
    new (...args: any[]): {
        _providerL2(): Provider;
        _signerL2(): ethers.Signer;
        getBalance(token?: Address, blockTag?: BlockTag): Promise<BigNumber>;
        getAllBalances(): Promise<BalancesMap>;
        getDeploymentNonce(): Promise<BigNumber>;
        getL2BridgeContracts(): Promise<{
            shared: Il2Bridge;
        }>;
        _fillCustomData(data: Eip712Meta): Eip712Meta;
        withdraw(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            bridgeAddress?: Address;
            overrides?: ethers.Overrides;
        }): Promise<TransactionResponse>;
        transfer(transaction: {
            to: Address;
            amount: BigNumberish;
            token?: Address;
            overrides?: ethers.Overrides;
        }): Promise<TransactionResponse>;
        sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & TBase;
export {};
