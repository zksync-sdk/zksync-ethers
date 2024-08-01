import { EIP712Signer } from './signer';
import { Provider } from './provider';
import { BigNumberish, BlockTag, BytesLike, ContractTransactionResponse, ethers, Overrides, ProgressCallback } from 'ethers';
import { Address, BalancesMap, FinalizeWithdrawalParams, FullDepositFee, PaymasterParams, PriorityOpResponse, TransactionLike, TransactionRequest, TransactionResponse } from './types';
import { IBridgehub, IL1ERC20Bridge, IL1SharedBridge, IL2Bridge, IL2SharedBridge, IZkSyncHyperchain } from './typechain';
declare const Wallet_base: {
    new (...args: any[]): {
        _providerL2(): Provider;
        _signerL2(): ethers.Signer;
        getBalance(token?: string | undefined, blockTag?: BlockTag): Promise<bigint>;
        getAllBalances(): Promise<BalancesMap>;
        getDeploymentNonce(): Promise<bigint>;
        getL2BridgeContracts(): Promise<{
            erc20: IL2Bridge;
            weth: IL2Bridge;
            shared: IL2SharedBridge;
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
        sendTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionResponse>;
        getAddress(): Promise<string>;
    };
} & {
    new (...args: any[]): {
        _providerL2(): Provider;
        _providerL1(): ethers.Provider;
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
        getBalanceL1(token?: string | undefined, blockTag?: BlockTag | undefined): Promise<bigint>;
        getAllowanceL1(token: string, bridgeAddress?: string | undefined, blockTag?: BlockTag | undefined): Promise<bigint>;
        l2TokenAddress(token: string): Promise<string>;
        approveERC20(token: string, amount: BigNumberish, overrides?: (ethers.Overrides & {
            bridgeAddress?: string | undefined;
        }) | undefined): Promise<ethers.TransactionResponse>;
        getBaseCost(params: {
            gasLimit: BigNumberish;
            gasPerPubdataByte?: BigNumberish | undefined;
            gasPrice?: BigNumberish | undefined;
        }): Promise<bigint>;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
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
            refundRecipient?: string | undefined;
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
        }): Promise<{
            tx: ethers.ContractTransaction;
            mintValue: bigint;
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
            overrides?: ethers.Overrides | undefined;
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
                overrides: ethers.Overrides;
                contractAddress: string;
                calldata: string;
                mintValue: bigint;
                l2Value: BigNumberish;
            };
            mintValue: bigint;
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
            overrides?: ethers.Overrides | undefined;
        }): Promise<{
            tx: ethers.ContractTransaction;
            mintValue: bigint;
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
            overrides?: ethers.Overrides | undefined;
        }): Promise<ethers.ContractTransaction>;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides: ethers.Overrides;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides: ethers.Overrides;
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
            overrides?: ethers.Overrides | undefined;
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
            overrides?: ethers.Overrides | undefined;
        }): Promise<BigNumberish>;
        getFullRequiredDepositFee(transaction: {
            token: string;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            customBridgeData?: BytesLike | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<FullDepositFee>;
        getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
            l1BatchNumber: number;
            l2MessageIndex: number;
            l2TxNumberInBlock: number | null;
            proof: string[];
        }>;
        _getWithdrawalLog(withdrawalHash: BytesLike, index?: number): Promise<{
            log: import("./types").Log;
            l1BatchTxId: number | null;
        }>;
        _getWithdrawalL2ToL1Log(withdrawalHash: BytesLike, index?: number): Promise<{
            l2ToL1LogIndex: number;
            l2ToL1Log: import("./types").L2ToL1Log;
        }>;
        finalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number): Promise<FinalizeWithdrawalParams>;
        finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: ethers.Overrides | undefined): Promise<ContractTransactionResponse>;
        isWithdrawalFinalized(withdrawalHash: BytesLike, index?: number): Promise<boolean>;
        claimFailedDeposit(depositHash: BytesLike, overrides?: ethers.Overrides | undefined): Promise<ContractTransactionResponse>;
        requestExecute(transaction: {
            contractAddress: string;
            calldata: string;
            l2GasLimit?: BigNumberish | undefined;
            mintValue?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<PriorityOpResponse>;
        estimateGasRequestExecute(transaction: {
            contractAddress: string;
            calldata: string;
            l2GasLimit?: BigNumberish | undefined;
            mintValue?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
        getRequestExecuteAllowanceParams(transaction: {
            contractAddress: string;
            calldata: string;
            l2GasLimit?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<{
            token: string;
            allowance: BigNumberish;
        }>;
        getRequestExecuteTx(transaction: {
            contractAddress: string;
            calldata: string;
            l2GasLimit?: BigNumberish | undefined;
            mintValue?: BigNumberish | undefined;
            l2Value?: BigNumberish | undefined;
            factoryDeps?: BytesLike[] | undefined;
            operatorTip?: BigNumberish | undefined;
            gasPerPubdataByte?: BigNumberish | undefined;
            refundRecipient?: string | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<ethers.TransactionRequest>;
        sendTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionResponse>;
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
    providerL1?: ethers.Provider;
    eip712: EIP712Signer;
    _providerL1(): ethers.Provider;
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
     * import { Wallet, Provider, utils } from "zksync-ethers";
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
    getBalanceL1(token?: Address, blockTag?: BlockTag): Promise<bigint>;
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
    getAllowanceL1(token: Address, bridgeAddress?: Address, blockTag?: BlockTag): Promise<bigint>;
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
     * const tx = await wallet.approveERC20(tokenL1, "10000000");
     *
     * await tx.wait();
     */
    approveERC20(token: Address, amount: BigNumberish, overrides?: Overrides & {
        bridgeAddress?: Address;
    }): Promise<ethers.TransactionResponse>;
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
    }): Promise<bigint>;
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
     * @example Get allowance parameters for depositing ETH on ETH-based chain.
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
     *   amount: 10_000_000n,
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
     *   amount: 10_000_000n,
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
     *   amount: 10_000_000n,
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
     *   amount: 10_000_000n,
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
     *   amount: 10_000_000n,
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
        overrides?: Overrides;
        approveOverrides?: Overrides;
        approveBaseOverrides?: Overrides;
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
     *   amount: 10_000_000n,
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
        overrides?: Overrides;
    }): Promise<bigint>;
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
     *   amount: "10_000_000n,
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
        overrides?: Overrides;
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
        overrides?: Overrides;
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
    finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: Overrides): Promise<ContractTransactionResponse>;
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
    claimFailedDeposit(depositHash: BytesLike, overrides?: Overrides): Promise<ContractTransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Wallet, Provider, utils } from "zksync-ethers";
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
        calldata: string;
        l2GasLimit?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: Overrides;
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
     * const tx = await wallet.requestExecute({
     *     contractAddress: await provider.getMainContractAddress(),
     *     calldata: "0x",
     *     l2Value: 7_000_000_000,
     * });
     * await tx.wait();
     */
    requestExecute(transaction: {
        contractAddress: Address;
        calldata: string;
        l2GasLimit?: BigNumberish;
        mintValue?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: Overrides;
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
     * const gas = await wallet.estimateGasRequestExecute({
     *     contractAddress: await provider.getMainContractAddress(),
     *     calldata: "0x",
     *     l2Value: 7_000_000_000,
     * });
     * console.log(`Gas: ${gas}`);
     */
    estimateGasRequestExecute(transaction: {
        contractAddress: Address;
        calldata: string;
        l2GasLimit?: BigNumberish;
        mintValue?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: Overrides;
    }): Promise<bigint>;
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
     * const tx = await wallet.getRequestExecuteTx({
     *     contractAddress: await provider.getMainContractAddress(),
     *     calldata: "0x",
     *     l2Value: 7_000_000_000,
     * });
     */
    getRequestExecuteTx(transaction: {
        contractAddress: Address;
        calldata: string;
        l2GasLimit?: BigNumberish;
        mintValue?: BigNumberish;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        operatorTip?: BigNumberish;
        gasPerPubdataByte?: BigNumberish;
        refundRecipient?: Address;
        overrides?: Overrides;
    }): Promise<TransactionRequest>;
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
     * import { Wallet, Provider, utils } from "zksync-ethers";
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
     */
    getBalance(token?: Address, blockTag?: BlockTag): Promise<bigint>;
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
    getDeploymentNonce(): Promise<bigint>;
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
        shared: IL2SharedBridge;
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
     *   amount: 10_000_000n,
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
     *   amount: 10_000_000n,
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
     * import { Wallet, Provider, types } from "zksync-ethers";
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
     *   amount: 10_000_000n,
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
     * import { Wallet, Provider, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const wallet = new Wallet(PRIVATE_KEY, provider);
     *
     * const transferTx = await wallet.transfer({
     *   to: Wallet.createRandom().address,
     *   amount: ethers.parseEther("0.01"),
     * });
     *
     * const receipt = await transferTx.wait();
     *
     * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
     *
     * @example Transfer ETH using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Wallet, Provider, types } from "zksync-ethers";
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
     *   amount: ethers.parseEther("0.01"),
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
     * import { Wallet, Provider, types } from "zksync-ethers";
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
     *   amount: ethers.parseEther("0.01"),
     * });
     *
     * const receipt = await transferTx.wait();
     *
     * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
     *
     * @example Transfer token using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Wallet, Provider, types } from "zksync-ethers";
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
     *   amount: ethers.parseEther("0.01"),
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
     * import { Wallet, Provider, utils } from "zksync-ethers";
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
        l2TxNumberInBlock: number | null;
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
    connectToL1(provider: ethers.Provider): Wallet;
    /**
     * Creates a new `Wallet` with the `provider` as L1 provider and a private key that is built from the mnemonic passphrase.
     *
     * @param mnemonic The mnemonic of the private key.
     * @param [provider] The provider instance for connecting to a L1 network.
     *
     * @example
     *
     * import { Wallet, Provider, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const MNEMONIC = "stuff slice staff easily soup parent arm payment cotton hammer scatter struggle";
     *
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = Wallet.fromMnemonic(MNEMONIC, ethProvider);
     */
    static fromMnemonic(mnemonic: string, provider?: ethers.Provider): Wallet;
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
    static fromEncryptedJson(json: string, password: string | Uint8Array, callback?: ProgressCallback): Promise<Wallet>;
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
    static fromEncryptedJsonSync(json: string, password: string | Uint8Array): Wallet;
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
    constructor(privateKey: string | ethers.SigningKey, providerL2?: Provider, providerL1?: ethers.Provider);
    /**
     * Designed for users who prefer a simplified approach by providing only the necessary data to create a valid transaction.
     * The only required fields are `transaction.to` and either `transaction.data` or `transaction.value` (or both, if the method is payable).
     * Any other fields that are not set will be prepared by this method.
     *
     * @param tx The transaction request that needs to be populated.
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
     *   type: utils.EIP712_TX_TYPE,
     *   to: RECEIVER,
     *   value: 7_000_000_000n,
     * });
     */
    populateTransaction(tx: TransactionRequest): Promise<TransactionLike>;
    /***
     * Signs the transaction and serializes it to be ready to be broadcast to the network.
     *
     * @param tx The transaction request that needs to be signed.
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
     *   value: ethers.parseEther('1'),
     * });
     */
    signTransaction(tx: TransactionRequest): Promise<string>;
    /**
     * Broadcast the transaction to the network.
     *
     * @param tx The transaction request that needs to be broadcast to the network.
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
     *   value: 7_000_000n,
     *   maxFeePerGas: 3_500_000_000n,
     *   maxPriorityFeePerGas: 2_000_000_000n,
     *   customData: {
     *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
     *   },
     * });
     * await tx.wait();
     */
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
}
export {};
