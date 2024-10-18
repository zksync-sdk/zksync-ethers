import { EIP712Signer } from './signer';
import { Provider, Web3Provider } from "./provider";
import { BigNumber, BigNumberish, BytesLike, ethers, Overrides, PopulatedTransaction, utils } from 'ethers';
import { BlockTag, TransactionResponse, TransactionRequest, Address, PriorityOpResponse, FullDepositFee, FinalizeWithdrawalParams, BalancesMap, PaymasterParams } from './types';
import { ProgressCallback } from '@ethersproject/json-wallets';
import { IZkSyncHyperchain } from './typechain/IZkSyncHyperchain';
import { Il1Erc20Bridge as IL1ERC20Bridge } from './typechain/Il1Erc20Bridge';
import { Il1SharedBridge as IL1SharedBridge } from './typechain/Il1SharedBridge';
import { Il2Bridge as IL2Bridge } from './typechain/Il2Bridge';
import { IBridgehub } from './typechain/IBridgehub';
import { Il2SharedBridge } from './typechain/Il2SharedBridge';
declare const Wallet_base: {
    new (...args: any[]): {
        _providerL2(): Provider;
        _signerL2(): ethers.Signer;
        getBalance(token?: string | undefined, blockTag?: BlockTag): Promise<BigNumber>;
        getAllBalances(): Promise<BalancesMap>;
        getDeploymentNonce(): Promise<BigNumber>;
        getL2BridgeContracts(): Promise<{
            erc20: IL2Bridge;
            weth: IL2Bridge;
            shared: Il2SharedBridge;
        }>;
        _fillCustomData(data: import("./types").Eip712Meta): import("./types").Eip712Meta;
        withdraw(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<TransactionResponse>;
        transfer(transaction: {
            to: string;
            amount: BigNumberish;
            token?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<TransactionResponse>;
        sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & {
    new (...args: any[]): {
        _providerL2(): Provider;
        _providerL1(): ethers.providers.Provider;
        _signerL1(): ethers.Signer;
        getMainContract(): Promise<IZkSyncHyperchain>;
        getBridgehubContract(): Promise<IBridgehub>;
        getL1BridgeContracts(): Promise<{
            erc20: IL1ERC20Bridge;
            weth: IL1ERC20Bridge;
            shared: IL1SharedBridge;
        }>;
        getBaseToken(): Promise<string>;
        isETHBasedChain(): Promise<boolean>;
        getBalanceL1(token?: string | undefined, blockTag?: ethers.providers.BlockTag | undefined): Promise<BigNumber>;
        getAllowanceL1(token: string, bridgeAddress?: string | undefined, blockTag?: ethers.providers.BlockTag | undefined): Promise<BigNumber>;
        l2TokenAddress(token: string): Promise<string>;
        approveERC20(token: string, amount: BigNumberish, overrides?: (ethers.Overrides & {
            bridgeAddress?: string | undefined;
        }) | undefined): Promise<ethers.providers.TransactionResponse>;
        getBaseCost(params: {
            gasLimit: BigNumberish;
            gasPerPubdataByte?: BigNumberish | undefined;
            gasPrice?: BigNumberish | undefined;
        }): Promise<BigNumber>;
        getDepositAllowanceParams(token: string, amount: BigNumberish): Promise<{
            token: string;
            allowance: BigNumberish;
        }[]>;
        deposit(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            approveERC20?: boolean | undefined;
            approveBaseERC20?: boolean | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
            approveOverrides?: ethers.Overrides | undefined;
            approveBaseOverrides?: ethers.Overrides | undefined;
            customBridgeData?: BytesLike | undefined;
        }): Promise<PriorityOpResponse>;
        _depositNonBaseTokenToNonETHBasedChain(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            approveERC20?: boolean | undefined;
            approveBaseERC20?: boolean | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
            approveOverrides?: ethers.Overrides | undefined;
            approveBaseOverrides?: ethers.Overrides | undefined;
            customBridgeData?: BytesLike | undefined;
        }): Promise<PriorityOpResponse>;
        _depositBaseTokenToNonETHBasedChain(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            approveERC20?: boolean | undefined;
            approveBaseERC20?: boolean | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
            approveOverrides?: ethers.Overrides | undefined;
            approveBaseOverrides?: ethers.Overrides | undefined;
            customBridgeData?: BytesLike | undefined;
        }): Promise<PriorityOpResponse>;
        _depositETHToNonETHBasedChain(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            approveERC20?: boolean | undefined;
            approveBaseERC20?: boolean | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
            approveOverrides?: ethers.Overrides | undefined;
            approveBaseOverrides?: ethers.Overrides | undefined;
            customBridgeData?: BytesLike | undefined;
        }): Promise<PriorityOpResponse>;
        _depositTokenToETHBasedChain(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            approveERC20?: boolean | undefined;
            approveBaseERC20?: boolean | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
            approveOverrides?: ethers.Overrides | undefined;
            approveBaseOverrides?: ethers.Overrides | undefined;
            customBridgeData?: BytesLike | undefined;
        }): Promise<PriorityOpResponse>;
        _depositETHToETHBasedChain(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            approveERC20?: boolean | undefined;
            approveBaseERC20?: boolean | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
            approveOverrides?: ethers.Overrides | undefined;
            approveBaseOverrides?: ethers.Overrides | undefined;
            customBridgeData?: BytesLike | undefined;
        }): Promise<PriorityOpResponse>;
        estimateGasDeposit(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            customBridgeData?: BytesLike | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<BigNumber>;
        getDepositTx(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<any>;
        _getDepositNonBaseTokenToNonETHBasedChainTx(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<{
            tx: ethers.PopulatedTransaction;
            mintValue: BigNumber;
        }>;
        _getDepositBaseTokenOnNonETHBasedChainTx(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<{
            tx: {
                token: string;
                amount: BigNumberish;
                to: string;
                operatorTip: BigNumberish;
                bridgeAddress?: string | undefined;
                l2GasLimit: BigNumberish;
                gasPerPubdataByte: BigNumberish;
                customBridgeData?: BytesLike | undefined;
                refundRecipient?: string | undefined;
                overrides: ethers.PayableOverrides;
                contractAddress: string;
                calldata: string;
                mintValue: BigNumber;
                l2Value: BigNumberish;
            };
            mintValue: BigNumber;
        }>;
        _getDepositETHOnNonETHBasedChainTx(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<{
            tx: ethers.PopulatedTransaction;
            mintValue: BigNumber;
        }>;
        _getDepositTokenOnETHBasedChainTx(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<ethers.PopulatedTransaction>;
        _getDepositETHOnETHBasedChainTx(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<{
            token: string;
            amount: BigNumberish;
            to: string;
            operatorTip: BigNumberish;
            bridgeAddress?: string | undefined;
            l2GasLimit: BigNumberish;
            gasPerPubdataByte: BigNumberish;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides: ethers.PayableOverrides;
            contractAddress: string;
            calldata: string;
            mintValue: BigNumberish;
            l2Value: BigNumberish;
        }>;
        _getDepositTxWithDefaults(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<{
            token: string;
            amount: BigNumberish;
            to: string;
            operatorTip: BigNumberish;
            bridgeAddress?: string | undefined;
            l2GasLimit: BigNumberish;
            gasPerPubdataByte: BigNumberish;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides: ethers.PayableOverrides;
        }>;
        _getL2GasLimit(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<BigNumberish>;
        _getL2GasLimitFromCustomBridge(transaction: {
            token: string;
            amount: BigNumberish;
            to?: string | undefined;
            operatorTip?: BigNumberish | undefined;
            bridgeAddress?: string | undefined;
            l2GasLimit?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            customBridgeData?: BytesLike | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<BigNumberish>;
        getFullRequiredDepositFee(transaction: {
            token: string;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            customBridgeData?: BytesLike | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            overrides?: ethers.PayableOverrides | undefined;
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
        finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: ethers.Overrides | undefined): Promise<ethers.ContractTransaction>;
        isWithdrawalFinalized(withdrawalHash: BytesLike, index?: number): Promise<boolean>;
        claimFailedDeposit(depositHash: BytesLike, overrides?: ethers.Overrides | undefined): Promise<ethers.ContractTransaction>;
        requestExecute(transaction: {
            contractAddress: string;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish | undefined;
            mintValue?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<PriorityOpResponse>;
        estimateGasRequestExecute(transaction: {
            contractAddress: string;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish | undefined;
            mintValue?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<BigNumber>;
        getRequestExecuteAllowanceParams(transaction: {
            contractAddress: string;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<{
            token: string;
            allowance: BigNumberish;
        }>;
        getRequestExecuteTx(transaction: {
            contractAddress: string;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish | undefined;
            mintValue?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.PayableOverrides | undefined;
        }): Promise<ethers.PopulatedTransaction>;
        sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & typeof ethers.Wallet;
/**
 * A `Wallet` is an extension of {@link ethers.Wallet} with additional features for interacting with ZKsync Era.
 * It facilitates bridging assets between different networks.
 * All transactions must originate from the address corresponding to the provided private key.
 */
export declare class Wallet extends Wallet_base {
    readonly provider: Provider;
    providerL1?: ethers.providers.Provider;
    eip712: EIP712Signer;
    _providerL1(): ethers.providers.Provider;
    _providerL2(): Provider;
    _signerL1(): ethers.Wallet;
    _signerL2(): Wallet;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const mainContract = await wallet.getMainContract();
     */
    getMainContract(): Promise<IZkSyncHyperchain>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const bridgehub = await wallet.getBridgehubContract();
     */
    getBridgehubContract(): Promise<IBridgehub>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const l1BridgeContracts = await wallet.getL1BridgeContracts();
     */
    getL1BridgeContracts(): Promise<{
        erc20: IL1ERC20Bridge;
        weth: IL1ERC20Bridge;
        shared: IL1SharedBridge;
    }>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     *
     * console.log(`Token balance: ${await wallet.getBalanceL1(tokenL1)}`);
     */
    getBalanceL1(token?: Address, blockTag?: BlockTag): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * console.log(`Token allowance: ${await wallet.getAllowanceL1(tokenL1)}`);
     */
    getAllowanceL1(token: Address, bridgeAddress?: Address, blockTag?: BlockTag): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     *
     * console.log(`Token L2 address: ${await wallet.l2TokenAddress(tokenL1)}`);
     */
    l2TokenAddress(token: Address): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const txHandle = await wallet.approveERC20(tokenL1, "10000000");
     *
     * await txHandle.wait();
     */
    approveERC20(token: Address, amount: BigNumberish, overrides?: Overrides & {
        bridgeAddress?: Address;
    }): Promise<ethers.providers.TransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * console.log(`Base cost: ${await wallet.getBaseCost({ gasLimit: 100_000 })}`);
     */
    getBaseCost(params: {
        gasLimit: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        gasPrice?: BigNumberish;
    }): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * console.log(`Base token: ${await wallet.getBaseToken()}`);
     */
    getBaseToken(): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * console.log(`Is ETH-based chain: ${await wallet.isETHBasedChain()}`);
     */
    isETHBasedChain(): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example Get allowance parameters for depositing token on ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const token = "<L1_TOKEN>";
     * const amount = 5;
     * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
     *
     * await (
     *    await wallet.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * @example Get allowance parameters for depositing ETH on non-ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const token = utils.LEGACY_ETH_ADDRESS;
     * const amount = 5;
     * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
     *
     * await (
     *    await wallet.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * @example Get allowance parameters for depositing base token on non-ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const token = await wallet.getBaseToken();
     * const amount = 5;
     * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
     *
     * await (
     *    await wallet.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * @example Get allowance parameters for depositing non-base token on non-ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const token = "<L1_TOKEN>";
     * const amount = 5;
     * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
     *
     * await (
     *    await wallet.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * await (
     *    await wallet.approveERC20(
     *        approveParams[1].token,
     *        approveParams[1].allowance
     *    )
     * ).wait();
     */
    getDepositAllowanceParams(token: Address, amount: BigNumberish): Promise<{
        token: Address;
        allowance: BigNumberish;
    }[]>;
    /**
     * @inheritDoc
     *
     * @example Deposit ETH on ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const depositTx = await wallet.deposit({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     * });
     * // Note that we wait not only for the L1 transaction to complete but also for it to be
     * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
     * // we can use `await depositTx.waitL1Commit()`
     * await depositTx.wait();
     *
     * @example Deposit token on ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const depositTx = await wallet.deposit({
     *   token: tokenL1,
     *   amount: 10_000_000,
     *   approveERC20: true,
     * });
     * // Note that we wait not only for the L1 transaction to complete but also for it to be
     * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
     * // we can use `await depositTx.waitL1Commit()`
     * await depositTx.wait();
     *
     * @example Deposit ETH on non-ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const depositTx = await wallet.deposit({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     *   approveBaseERC20: true,
     * });
     * // Note that we wait not only for the L1 transaction to complete but also for it to be
     * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
     * // we can use `await depositTx.waitL1Commit()`
     * await depositTx.wait();
     *
     * @example Deposit base token on non-ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const depositTx = await wallet.deposit({
     *   token: await wallet.getBaseToken(),
     *   amount: 10_000_000,
     *   approveERC20: true, // or approveBaseERC20: true
     * });
     * // Note that we wait not only for the L1 transaction to complete but also for it to be
     * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
     * // we can use `await depositTx.waitL1Commit()`
     * await depositTx.wait();
     *
     * @example Deposit non-base token on non-ETH-based chain.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const depositTx = await wallet.deposit({
     *   token: tokenL1,
     *   amount: 10_000_000,
     *   approveERC20: true,
     *   approveBaseERC20: true,
     * });
     * // Note that we wait not only for the L1 transaction to complete but also for it to be
     * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
     * // we can use `await depositTx.waitL1Commit()`
     * await depositTx.wait();
     */
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
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * const gas = await wallet.estimateGasDeposit({
     *   token: tokenL1,
     *   amount: "10000000",
     * });
     * console.log(`Gas: ${gas}`);
     */
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
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const tx = await wallet.getDepositTx({
     *   token: tokenL1,
     *   amount: "10000000",
     * });
     */
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
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const fee = await wallet.getFullRequiredDepositFee({
     *   token: tokenL1,
     *   to: await wallet.getAddress(),
     * });
     * console.log(`Fee: ${fee}`);
     */
    getFullRequiredDepositFee(transaction: {
        token: Address;
        to?: Address;
        bridgeAddress?: Address;
        customBridgeData?: BytesLike;
        gasPerPubdataByte?: BigNumberish;
        overrides?: ethers.PayableOverrides;
    }): Promise<FullDepositFee>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const params = await wallet.finalizeWithdrawalParams(WITHDRAWAL_HASH);
     */
    finalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number): Promise<FinalizeWithdrawalParams>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const finalizeWithdrawTx = await wallet.finalizeWithdrawal(WITHDRAWAL_HASH);
     */
    finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: Overrides): Promise<ethers.ContractTransaction>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const isFinalized = await wallet.isWithdrawalFinalized(WITHDRAWAL_HASH);
     */
    isWithdrawalFinalized(withdrawalHash: BytesLike, index?: number): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const FAILED_DEPOSIT_HASH = "<FAILED_DEPOSIT_TX_HASH>";
     * const claimFailedDepositTx = await wallet.claimFailedDeposit(FAILED_DEPOSIT_HASH);
     */
    claimFailedDeposit(depositHash: BytesLike, overrides?: Overrides): Promise<ethers.ContractTransaction>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tx = {
     *    contractAddress: await wallet.getAddress(),
     *    calldata: '0x',
     *    l2Value: 7_000_000_000,
     * };
     *
     * const approveParams = await wallet.getRequestExecuteAllowanceParams(tx);
     * await (
     *    await wallet.approveERC20(
     *        approveParams.token,
     *        approveParams.allowance
     *    )
     * ).wait();
     */
    getRequestExecuteAllowanceParams(transaction: {
        contractAddress: Address;
        calldata: BytesLike;
        l2GasLimit?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: ethers.PayableOverrides;
    }): Promise<{
        token: Address;
        allowance: BigNumberish;
    }>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const gasPrice = await wallet.providerL1.getGasPrice();
     *
     * // The calldata can be encoded the same way as for Ethereum.
     * // Here is an example of how to get the calldata from an ABI:
     * const abi = [
     *   {
     *     inputs: [],
     *     name: "increment",
     *     outputs: [],
     *     stateMutability: "nonpayable",
     *     type: "function",
     *   },
     * ];
     * const contractInterface = new ethers.utils.Interface(abi);
     * const calldata = contractInterface.encodeFunctionData("increment", []);
     * const l2GasLimit = BigNumber.from(1_000);
     *
     * const txCostPrice = await wallet.getBaseCost({
     *   gasPrice,
     *   calldataLength: ethers.utils.arrayify(calldata).length,
     *   l2GasLimit,
     * });
     *
     * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
     *
     * const executeTx = await wallet.requestExecute({
     *   contractAddress: CONTRACT_ADDRESS,
     *   calldata,
     *   l2Value: 1,
     *   l2GasLimit,
     *   overrides: {
     *     gasPrice,
     *     value: txCostPrice,
     *   },
     * });
     *
     * await executeTx.wait();
     */
    requestExecute(transaction: {
        contractAddress: Address;
        calldata: BytesLike;
        l2GasLimit?: BigNumberish;
        mintValue?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: ethers.PayableOverrides;
    }): Promise<PriorityOpResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const gasPrice = await wallet.providerL1.getGasPrice();
     *
     * // The calldata can be encoded the same way as for Ethereum.
     * // Here is an example of how to get the calldata from an ABI:
     * const abi = [
     *   {
     *     inputs: [],
     *     name: "increment",
     *     outputs: [],
     *     stateMutability: "nonpayable",
     *     type: "function",
     *   },
     * ];
     * const contractInterface = new ethers.utils.Interface(abi);
     * const calldata = contractInterface.encodeFunctionData("increment", []);
     * const l2GasLimit = BigNumber.from(1_000);
     *
     * const txCostPrice = await wallet.getBaseCost({
     *   gasPrice,
     *   calldataLength: ethers.utils.arrayify(calldata).length,
     *   l2GasLimit,
     * });
     *
     * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
     *
     * const executeTx = await wallet.getRequestExecuteTx({
     *   contractAddress: CONTRACT_ADDRESS,
     *   calldata,
     *   l2Value: 1,
     *   l2GasLimit,
     *   overrides: {
     *     gasPrice,
     *     value: txCostPrice,
     *   },
     * });
     */
    estimateGasRequestExecute(transaction: {
        contractAddress: Address;
        calldata: BytesLike;
        l2GasLimit?: BigNumberish;
        mintValue?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: ethers.PayableOverrides;
    }): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const gasPrice = await wallet.providerL1.getGasPrice();
     *
     * // The calldata can be encoded the same way as for Ethereum.
     * // Here is an example of how to get the calldata from an ABI:
     * const abi = [
     *   {
     *     inputs: [],
     *     name: "increment",
     *     outputs: [],
     *     stateMutability: "nonpayable",
     *     type: "function",
     *   },
     * ];
     * const contractInterface = new ethers.utils.Interface(abi);
     * const calldata = contractInterface.encodeFunctionData("increment", []);
     * const l2GasLimit = BigNumber.from(1_000);
     *
     * const txCostPrice = await wallet.getBaseCost({
     *   gasPrice,
     *   calldataLength: ethers.utils.arrayify(calldata).length,
     *   l2GasLimit,
     * });
     *
     * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
     *
     * const executeTx = await wallet.getRequestExecuteTx({
     *   contractAddress: CONTRACT_ADDRESS,
     *   calldata,
     *   l2Value: 1,
     *   l2GasLimit,
     *   overrides: {
     *     gasPrice,
     *     value: txCostPrice,
     *   },
     * });
     */
    getRequestExecuteTx(transaction: {
        contractAddress: Address;
        calldata: BytesLike;
        l2GasLimit?: BigNumberish;
        mintValue?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: ethers.PayableOverrides;
    }): Promise<PopulatedTransaction>;
    /**
     * @inheritDoc
     *
     * @example Get ETH balance.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * console.log(`ETH balance: ${await wallet.getBalance()}`);
     *
     * @example Get token balance.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const token = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     *
     * console.log(`Token balance: ${await wallet.getBalance(token)}`);
     *
     */
    getBalance(token?: Address, blockTag?: BlockTag): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const allBalances = await wallet.getAllBalances();
     */
    getAllBalances(): Promise<BalancesMap>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * console.log(`Nonce: ${await wallet.getDeploymentNonce()}`);
     */
    getDeploymentNonce(): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const l2BridgeContracts = await wallet.getL2BridgeContracts();
     */
    getL2BridgeContracts(): Promise<{
        erc20: IL2Bridge;
        weth: IL2Bridge;
        shared: Il2SharedBridge;
    }>;
    /**
     * @inheritDoc
     *
     * @example Withdraw ETH.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const withdrawTx = await wallet.withdraw({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     * });
     *
     * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const withdrawTx = await wallet.withdraw({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     *   paymasterParams: utils.getPaymasterParams(paymaster, {
     *     type: "ApprovalBased",
     *     token: token,
     *     minimalAllowance: 1,
     *     innerInput: new Uint8Array(),
     *   }),
     * });
     *
     * @example Withdraw token.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const withdrawTx = await wallet.withdraw({
     *   token: tokenL2,
     *   amount: 10_000_000,
     * });
     *
     * @example Withdraw token using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const withdrawTx = await wallet.withdraw({
     *   token: tokenL2,
     *   amount: 10_000_000,
     *   paymasterParams: utils.getPaymasterParams(paymaster, {
     *     type: "ApprovalBased",
     *     token: token,
     *     minimalAllowance: 1,
     *     innerInput: new Uint8Array(),
     *   }),
     * });
     */
    withdraw(transaction: {
        token: Address;
        amount: BigNumberish;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: Overrides;
    }): Promise<TransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example Transfer ETH.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const transferTx = await wallet.transfer({
     *   to: Wallet.createRandom().address,
     *   amount: ethers.utils.parseEther("0.01"),
     * });
     *
     * const receipt = await transferHandle.wait();
     *
     * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
     *
     * @example Transfer ETH using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const transferTx = await wallet.transfer({
     *   to: Wallet.createRandom().address,
     *   amount: ethers.utils.parseEther("0.01"),
     *   paymasterParams: utils.getPaymasterParams(paymaster, {
     *     type: "ApprovalBased",
     *     token: token,
     *     minimalAllowance: 1,
     *     innerInput: new Uint8Array(),
     *   }),
     * });
     *
     * const receipt = await transferTx.wait();
     *
     * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
     *
     * @example Transfer token.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const transferTx = await wallet.transfer({
     *   token: tokenL2,
     *   to: Wallet.createRandom().address,
     *   amount: ethers.utils.parseEther("0.01"),
     * });
     *
     * const receipt = await transferHandle.wait();
     *
     * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
     *
     * @example Transfer token using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const transferTx = await wallet.transfer({
     *   token: tokenL2,
     *   to: Wallet.createRandom().address,
     *   amount: ethers.utils.parseEther("0.01"),
     *   paymasterParams: utils.getPaymasterParams(paymaster, {
     *     type: "ApprovalBased",
     *     token: token,
     *     minimalAllowance: 1,
     *     innerInput: new Uint8Array(),
     *   }),
     * });
     *
     * const receipt = await transferTx.wait();
     *
     * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
     */
    transfer(transaction: {
        to: Address;
        amount: BigNumberish;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: Overrides;
    }): Promise<TransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * // Any L2 -> L1 transaction can be used.
     * // In this case, withdrawal transaction is used.
     * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
     * console.log(`Confirmation data: ${utils.toJSON(await wallet.getPriorityOpConfirmation(tx, 0))}`);
     */
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number;
        proof: string[];
    }>;
    /**
     * Returns `ethers.Wallet` object with the same private key.
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const ethWallet = wallet.ethWallet();
     */
    ethWallet(): ethers.Wallet;
    /**
     * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
     *
     * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const nonce = wallet.getNonce();
     */
    getNonce(blockTag?: BlockTag): Promise<number>;
    /**
     * Connects to the L2 network using `provider`.
     *
     * @param provider The provider instance for connecting to an L2 network.
     *
     * @see {@link connectToL1} in order to connect to L1 network.
     *
     * @example
     *
     * import { Wallet, Provider, types } from "zksync-ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const unconnectedWallet = new Wallet(PRIVATE_KEY);
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = unconnectedWallet.connect(provider);
     */
    connect(provider: Provider): Wallet;
    /**
     * Connects to the L1 network using `provider`.
     *
     * @param provider The provider instance for connecting to a L1 network.
     *
     * @see {@link connect} in order to connect to L2 network.
     *
     * @example
     *
     * import { Wallet } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     * const unconnectedWallet = new Wallet(PRIVATE_KEY);
     *
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = unconnectedWallet.connectToL1(ethProvider);
     *
     * @param provider
     */
    connectToL1(provider: ethers.providers.Provider): Wallet;
    /**
     * Creates a new `Wallet` with the `provider` as L1 provider and a private key that is built from the mnemonic passphrase.
     *
     * @param mnemonic The mnemonic of the private key.
     * @param [path] The derivation path.
     * @param [wordlist] The wordlist used to derive the mnemonic.
     *
     * @example
     *
     * import { Wallet, Provider, utils } from "zksync-ethers";
     *
     * const MNEMONIC = "stuff slice staff easily soup parent arm payment cotton hammer scatter struggle";
     *
     * const wallet = Wallet.fromMnemonic(MNEMONIC);
     */
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: ethers.Wordlist): Wallet;
    /**
     * Creates a new `Wallet` from encrypted json file using provided `password`.
     *
     * @param json The encrypted json file.
     * @param password The password for the encrypted json file.
     * @param [callback] If provided, it is called periodically during decryption so that any UI can be updated.
     *
     * @example
     *
     * import { Wallet, Provider, utils } from "zksync-ethers";
     * import * as fs from "fs";
     *
     * const wallet = await Wallet.fromEncryptedJson(fs.readFileSync("wallet.json", "utf8"), "password");
     */
    static fromEncryptedJson(json: string, password?: string | ethers.Bytes, callback?: ProgressCallback): Promise<Wallet>;
    /**
     * Creates a new `Wallet` from encrypted json file using provided `password`.
     *
     * @param json The encrypted json file.
     * @param password The password for the encrypted json file.
     *
     * @example
     *
     * import { Wallet } from "zksync-ethers";
     * import * as fs from "fs";
     *
     * const wallet = Wallet.fromEncryptedJsonSync(fs.readFileSync("tests/files/wallet.json", "utf8"), "password");
     */
    static fromEncryptedJsonSync(json: string, password?: string | ethers.Bytes): Wallet;
    /**
     * Creates random `Wallet`.
     * @param options  Additional options.
     *
     * @example
     *
     * import { Wallet} from "zksync-ethers";
     *
     * const wallet = Wallet.createRandom();
     */
    static createRandom(options?: any): Wallet;
    /**
     *
     * @param privateKey The private key of the account.
     * @param providerL2 The provider instance for connecting to a L2 network.
     * @param providerL1 The provider instance for connecting to a L1 network.
     *
     * @example
     *
     * import { Wallet, Provider, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     */
    constructor(privateKey: ethers.BytesLike | utils.SigningKey, providerL2?: Provider | Web3Provider, providerL1?: ethers.providers.Provider);
    /**
     * Designed for users who prefer a simplified approach by providing only the necessary data to create a valid transaction.
     * The only required fields are `transaction.to` and either `transaction.data` or `transaction.value` (or both, if the method is payable).
     * Any other fields that are not set will be prepared by this method.
     *
     * @param transaction The transaction request that needs to be populated.
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const populatedTx = await wallet.populateTransaction({
     *   to: Wallet.createRandom().address,
     *   value: 7_000_000,
     * });
     */
    populateTransaction(transaction: TransactionRequest): Promise<TransactionRequest>;
    /***
     * Signs the transaction and serializes it to be ready to be broadcast to the network.
     *
     * @param transaction The transaction request that needs to be signed.
     *
     * @throws {Error} If `transaction.from` is mismatched from the private key.
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tx = await wallet.signTransaction({
     *   type: utils.EIP712_TX_TYPE,
     *   to: Wallet.createRandom().address,
     *   value: BigNumber.from(7_000_000_000),
     * });
     */
    signTransaction(transaction: TransactionRequest): Promise<string>;
    /**
     * Broadcast the transaction to the network.
     *
     * @param transaction The transaction request that needs to be broadcast to the network.
     *
     * @throws {Error} If `transaction.from` is mismatched from the private key.
     *
     * @example
     *
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tx = await wallet.sendTransaction({
     *   to: Wallet.createRandom().address,
     *   value: 7_000_000,
     *   maxFeePerGas: BigNumber.from(3_500_000_000),
     *   maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
     *   customData: {
     *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
     *   },
     * });
     * await tx.wait();
     */
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
export {};
