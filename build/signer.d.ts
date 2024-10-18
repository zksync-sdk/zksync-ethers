import { BigNumber, BigNumberish, BytesLike, ethers, Overrides, PopulatedTransaction } from 'ethers';
import { Provider } from './provider';
import { Address, BalancesMap, BlockTag, FinalizeWithdrawalParams, FullDepositFee, PaymasterParams, PriorityOpResponse, Signature, TransactionRequest, TransactionResponse } from './types';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { Il2Bridge as IL2Bridge } from './typechain/Il2Bridge';
import { Il1Erc20Bridge as IL1ERC20Bridge } from './typechain/Il1Erc20Bridge';
import { Il1SharedBridge as IL1SharedBridge } from './typechain/Il1SharedBridge';
import { IZkSyncHyperchain } from './typechain/IZkSyncHyperchain';
import { IBridgehub } from './typechain/IBridgehub';
import { Il2SharedBridge } from './typechain/Il2SharedBridge';
/**
 * All typed data conforming to the EIP712 standard within ZKsync Era.
 */
export declare const EIP712_TYPES: {
    Transaction: {
        name: string;
        type: string;
    }[];
};
/**
 * A `EIP712Signer` provides support for signing EIP712-typed ZKsync Era transactions.
 */
export declare class EIP712Signer {
    private ethSigner;
    private eip712Domain;
    /**
     * @example
     *
     * import { Provider, types, EIP712Signer } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new EIP712Signer(new ethers.Wallet(PRIVATE_KEY, Number(await provider.getNetwork()));
     */
    constructor(ethSigner: ethers.Signer & TypedDataSigner, chainId: number | Promise<number>);
    /**
     * Generates the EIP712 typed data from provided transaction. Optional fields are populated by zero values.
     *
     * @param transaction The transaction request that needs to be populated.
     *
     * @example
     *
     * import { EIP712Signer } from "zksync-ethers";
     *
     * const tx = EIP712Signer.getSignInput({
     *   type: utils.EIP712_TX_TYPE,
     *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
     *   value: BigNumber.from(7_000_000),
     *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
     *   nonce: BigNumber.from(0),
     *   chainId: 270,
     *   gasPrice: BigNumber.from(250_000_000),
     *   gasLimit: BigNumber.from(21_000),
     *   customData: {},
     * });
     */
    static getSignInput(transaction: TransactionRequest): {
        txType: number;
        from: string | undefined;
        to: string | undefined;
        gasLimit: BigNumberish;
        gasPerPubdataByteLimit: BigNumberish;
        maxFeePerGas: BigNumberish;
        maxPriorityFeePerGas: BigNumberish;
        paymaster: string;
        nonce: BigNumberish;
        value: BigNumberish;
        data: BytesLike;
        factoryDeps: Uint8Array[];
        paymasterInput: BytesLike;
    };
    /**
     * Signs a transaction request using EIP712.
     *
     * @param transaction The transaction request that needs to be signed.
     * @returns A promise that resolves to the signature of the transaction.
     *
     * @example
     *
     * import { Provider, types, EIP712Signer } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new EIP712Signer(new ethers.Wallet(PRIVATE_KEY, Number(await provider.getNetwork()));
     * const signature = signer.sign({
     *   type: utils.EIP712_TX_TYPE,
     *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
     *   value: BigNumber.from(7_000_000),
     *   nonce: BigNumber.from(0),
     *   chainId: 270,
     *   gasPrice: BigNumber.from(250_000_000),
     *   gasLimit: BigNumber.from(21_000),
     * });
     */
    sign(transaction: TransactionRequest): Promise<Signature>;
    /**
     * Hashes the transaction request using EIP712.
     *
     * @param transaction The transaction request that needs to be hashed.
     * @returns A hash (digest) of the transaction request.
     *
     * @throws {Error} If `transaction.chainId` is not set.
     *
     * @example
     *
     * import { EIP712Signer } from "zksync-ethers";
     *
     * const hash = EIP712Signer.getSignedDigest({
     *   type: utils.EIP712_TX_TYPE,
     *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
     *   value: BigNumber.from(7_000_000),
     *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
     *   nonce: BigNumber.from(0),
     *   chainId: 270,
     *   gasPrice: BigNumber.from(250_000_000),
     *   gasLimit: BigNumber.from(21_000),
     *   customData: {},
     * });
     */
    static getSignedDigest(transaction: TransactionRequest): ethers.BytesLike;
    /**
     * Returns ZKsync Era EIP712 domain.
     *
     * @example
     *
     * import { Provider, types, EIP712Signer } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new EIP712Signer(new ethers.Wallet(PRIVATE_KEY, Number(await provider.getNetwork()));
     * const domain = await signer.getDomain();
     */
    getDomain(): Promise<ethers.TypedDataDomain>;
}
declare const Signer_base: {
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
} & typeof ethers.providers.JsonRpcSigner;
/**
 * A `Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L2 operations.
 *
 * @see {@link L1Signer} for L1 operations.
 *
 */
export declare class Signer extends Signer_base {
    provider: Provider;
    eip712: EIP712Signer;
    protected providerL2?: Provider;
    _signerL2(): this;
    _providerL2(): Provider;
    /**
     * @inheritDoc
     *
     * @example Get ETH balance.
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`ETH balance: ${await signer.getBalance()}`);
     *
     * @example Get token balance.
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const token = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     *
     * console.log(`Token balance: ${await signer.getBalance(token)}`);
     */
    getBalance(token?: Address, blockTag?: BlockTag): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const allBalances = await signer.getAllBalances();
     */
    getAllBalances(): Promise<BalancesMap>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Nonce: ${await signer.getDeploymentNonce()}`);
     */
    getDeploymentNonce(): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const l2BridgeContracts = await signer.getL2BridgeContracts();
     */
    getL2BridgeContracts(): Promise<{
        erc20: IL2Bridge;
        weth: IL2Bridge;
        shared: Il2SharedBridge;
    }>;
    /**
     * @inheritDoc
     *
     * @example Withdraw token.
     *
     * import { Web3Provider, Provider, types, utils } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.withdraw({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     * });
     *
     * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Web3Provider, Provider, types, utils } from "zksync-ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.withdraw({
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
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * await signer.withdraw({
     *   token: tokenL2,
     *   amount: 10_000_000,
     * });
     *
     * @example Withdraw token using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * await signer.withdraw({
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
     * import { Web3Provider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const transferTx = await signer.transfer({
     *   to: Wallet.createRandom().address,
     *   amount: ethers.utils.parseEther("0.01"),
     * });
     *
     * const receipt = await transferTx.wait();
     *
     * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
     *
     * @example Transfer ETH using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Web3Provider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const transferTx = await signer.transfer({
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
     * import { Web3Provider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const transferTx = await signer.transfer({
     *   token: tokenL2,
     *   to: Wallet.createRandom().address,
     *   amount: ethers.utils.parseEther("0.01"),
     * });
     *
     * const receipt = await transferTx.wait();
     *
     * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
     *
     * @example Transfer token using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { Web3Provider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const transferTx = await signer.transfer({
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
     * Creates a new Singer with provided `signer`.
     *
     * @param signer  The signer from browser wallet.
     * @param [zksyncProvider] The provider instance for connecting to a L2 network. If not provided,
     * the methods from the `zks` namespace are not supported, and interaction with them will result in an error.
     *
     * @example
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     */
    static from(signer: ethers.providers.JsonRpcSigner & {
        provider: Provider;
    }, zksyncProvider?: Provider): Signer;
    /**
     * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
     *
     * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
     *
     * @example
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const nonce = await signer.getNonce();
     */
    getNonce(blockTag?: BlockTag): Promise<number>;
    /**
     * Broadcast the transaction to the network.
     *
     * @param transaction The transaction request that needs to be broadcast to the network.
     *
     * @throws {Error} If `transaction.from` is mismatched from the private key.
     *
     * @example
     *
     * import { Web3Provider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new Web3Provider(window.ethereum);
     * const signer = Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.sendTransaction({
     *     to: Wallet.createRandom().address,
     *     value: 10_000_000
     * });
     */
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
declare const L1Signer_base: {
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
} & typeof ethers.providers.JsonRpcSigner;
/**
 * A `L1Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L1 operations.
 *
 * @see {@link Signer} for L2 operations.
 */
export declare class L1Signer extends L1Signer_base {
    providerL2: Provider;
    _providerL2(): Provider;
    _providerL1(): ethers.providers.JsonRpcProvider;
    _signerL1(): this;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const mainContract = await signer.getMainContract();
     */
    getMainContract(): Promise<IZkSyncHyperchain>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const bridgehub = await signer.getBridgehubContract();
     */
    getBridgehubContract(): Promise<IBridgehub>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const l1BridgeContracts = await signer.getL1BridgeContracts();
     */
    getL1BridgeContracts(): Promise<{
        erc20: IL1ERC20Bridge;
        weth: IL1ERC20Bridge;
        shared: IL1SharedBridge;
    }>;
    /**
     * @inheritDoc
     *
     * @example Get ETH balance.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(await signer.getBalanceL1());
     *
     * @example Get token balance.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * console.log(await signer.getBalanceL1(tokenL1));
     */
    getBalanceL1(token?: Address, blockTag?: BlockTag): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * console.log(`Token allowance: ${await signer.getAllowanceL1(tokenL1)}`);
     */
    getAllowanceL1(token: Address, bridgeAddress?: Address, blockTag?: BlockTag): Promise<BigNumber>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     *
     * console.log(`Token L2 address: ${await signer.l2TokenAddress(tokenL1)}`);
     */
    l2TokenAddress(token: Address): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * await signer.approveERC20(tokenL1, 5);
     */
    approveERC20(token: Address, amount: BigNumberish, overrides?: Overrides & {
        bridgeAddress?: Address;
    }): Promise<ethers.providers.TransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Base cost: ${await signer.getBaseCost({ gasLimit: 100_000 })}`);
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Base token: ${await signer.getBaseToken()}`);
     */
    getBaseToken(): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Is ETH-based chain: ${await signer.isETHBasedChain()}`);
     */
    isETHBasedChain(): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example Get allowance parameters for depositing token on ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const token = "<L1_TOKEN>";
     * const amount = 5;
     * const approveParams = await signer.getDepositAllowanceParams(token, amount);
     *
     * await (
     *    await signer.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * @example Get allowance parameters for depositing ETH on non-ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const token = utils.LEGACY_ETH_ADDRESS;
     * const amount = 5;
     * const approveParams = await signer.getDepositAllowanceParams(token, amount);
     * await (
     *    await signer.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * @example Get allowance parameters for depositing base token on non-ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const token = await signer.getBaseToken();
     * const amount = 5;
     * const approveParams = await signer.getDepositAllowanceParams(token, amount);
     * await (
     *    await signer.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * @example Get allowance parameters for depositing non-base token on non-ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const token = "<L1_TOKEN>";
     * const amount = 5;
     * const approveParams = await signer.getDepositAllowanceParams(token, amount);
     *
     * await (
     *    await signer.approveERC20(
     *        approveParams[0].token,
     *        approveParams[0].allowance
     *    )
     * ).wait();
     *
     * await (
     *    await signer.approveERC20(
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.deposit({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     * });
     *
     * @example Deposit token on ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * await signer.deposit({
     *   token: tokenL1,
     *   amount: 10_000_000,
     *   approveERC20: true,
     * });
     *
     * @example Deposit ETH on non-ETH-chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.deposit({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000,
     *   approveBaseERC20: true,
     * });
     *
     * @example Deposit base token on non-ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.deposit({
     *   token: await signer.getBaseToken(),
     *   amount: 10_000_000,
     *   approveERC20: true, // or approveBaseERC20: true
     * });
     *
     * @example Deposit non-base token on non-ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * await signer.deposit({
     *   token: tokenL1,
     *   amount: 10_000_000,
     *   approveERC20: true,
     *   approveBaseERC20: true,
     * });
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
        approveOverrides?: Overrides;
        approveBaseOverrides?: Overrides;
        customBridgeData?: BytesLike;
    }): Promise<PriorityOpResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * const gas = await signer.estimateGasDeposit({
     *   token: tokenL1,
     *   amount: 10_000_000,
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const tx = await signer.getDepositTx({
     *   token: tokenL1,
     *   amount: 10_000_000,
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
     * import { Provider, L1Signer, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const fee = await signer.getFullRequiredDepositFee({
     *   token: tokenL1,
     *   to: Wallet.createRandom().address,
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const params = await signer.finalizeWithdrawalParams(WITHDRAWAL_HASH);
     */
    finalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number): Promise<FinalizeWithdrawalParams>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const finalizeWithdrawTx = await signer.finalizeWithdrawal(WITHDRAWAL_HASH);
     */
    finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: Overrides): Promise<ethers.ContractTransaction>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const isFinalized = await signer.isWithdrawalFinalized(WITHDRAWAL_HASH);
     */
    isWithdrawalFinalized(withdrawalHash: BytesLike, index?: number): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const FAILED_DEPOSIT_HASH = "<FAILED_DEPOSIT_TX_HASH>";
     * const claimFailedDepositTx = await signer.claimFailedDeposit(FAILED_DEPOSIT_HASH);
     */
    claimFailedDeposit(depositHash: BytesLike, overrides?: Overrides): Promise<ethers.ContractTransaction>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tx = {
     *    contractAddress: await signer.getAddress(),
     *    calldata: '0x',
     *    l2Value: 7_000_000_000,
     * };
     *
     * const approveParams = await signer.getRequestExecuteAllowanceParams(tx);
     * await (
     *    await signer.approveERC20(
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.requestExecute({
     *     contractAddress: await signer.providerL2.getMainContractAddress(),
     *     calldata: "0x",
     *     l2Value: 7_000_000_000,
     * });
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const gas = await signer.estimateGasRequestExecute({
     *     contractAddress: await signer.providerL2.getMainContractAddress(),
     *     calldata: "0x",
     *     l2Value: 7_000_000_000,
     * });
     *
     * console.log(`Gas: ${gas}`);
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tx = await signer.getRequestExecuteTx({
     *     contractAddress: await signer.providerL2.getMainContractAddress(),
     *     calldata: "0x",
     *     l2Value: 7_000_000_000,
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
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * // Any L2 -> L1 transaction can be used.
     * // In this case, withdrawal transaction is used.
     * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
     * console.log(`Confirmation data: ${utils.toJSON(await signer.getPriorityOpConfirmation(tx, 0))}`);
     */
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number;
        proof: string[];
    }>;
    /**
     * Creates a new L1Singer with provided `signer` and `zksyncProvider`.
     *
     * @param signer  The signer from browser wallet.
     * @param zksyncProvider The provider instance for connecting to a L2 network.
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     */
    static from(signer: ethers.providers.JsonRpcSigner, zksyncProvider: Provider): L1Signer;
    /**
     * Connects to the L2 network using the `provider`.
     *
     * @param provider The provider instance for connecting to a L2 network.
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
     * const signer = L1Signer.from(
     *     browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * signer.connectToL2(Provider.getDefaultProvider(types.Network.Mainnet));
     */
    connectToL2(provider: Provider): this;
}
declare const L2VoidSigner_base: {
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
} & typeof ethers.VoidSigner;
/**
 * A `L2VoidSigner` is a class designed to allow an address to be used in any API which accepts a `Signer`, but for
 * which there are no credentials available to perform any actual signing.
 *
 * This for example allow impersonating an account for the purpose of static calls or estimating gas, but does not
 * allow sending transactions.
 *
 * Provides only L2 operations.
 *
 * @see {@link L1VoidSigner} for L1 operations.
 */
export declare class L2VoidSigner extends L2VoidSigner_base {
    provider: Provider;
    _signerL2(): this;
    _providerL2(): Provider;
    /**
     * Connects to the L2 network using the `provider`.
     *
     * @param provider The provider instance for connecting to a L2 network.
     *
     * @example
     *
     * import { Provider, L2VoidSigner, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     *
     * let signer = new L2VoidSigner("<ADDRESS>");
     * signer = signer.connect(provider);
     */
    connect(provider: Provider): L2VoidSigner;
    /**
     * Designed for users who prefer a simplified approach by providing only the necessary data to create a valid transaction.
     * The only required fields are `transaction.to` and either `transaction.data` or `transaction.value` (or both, if the method is payable).
     * Any other fields that are not set will be prepared by this method.
     *
     * @param transaction The transaction request that needs to be populated.
     *
     * @example
     *
     * import { Provider, L2VoidSigner, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new L2VoidSigner("<ADDRESS>", provider);
     *
     * const populatedTx = await signer.populateTransaction({
     *   to: Wallet.createRandom().address,
     *   value: 7_000_000,
     *   maxFeePerGas: BigNumber.from(3_500_000_000),
     *   maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
     *   customData: {
     *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
     *     factoryDeps: [],
     *   },
     * });
     */
    populateTransaction(transaction: TransactionRequest): Promise<TransactionRequest>;
    /**
     * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
     *
     * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
     *
     * @example
     *
     * import { Provider, L2VoidSigner, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new L2VoidSigner("<ADDRESS>", provider);
     *
     * const nonce = await signer.getNonce();
     */
    getNonce(blockTag?: BlockTag): Promise<number>;
}
declare const L1VoidSigner_base: {
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
} & typeof ethers.VoidSigner;
/**
 * A `L1VoidSigner` is a class designed to allow an address to be used in any API which accepts a `Signer`, but for
 * which there are no credentials available to perform any actual signing.
 *
 * This for example allow impersonating an account for the purpose of static calls or estimating gas, but does not
 * allow sending transactions.
 *
 * Provides only L1 operations.
 *
 * @see {@link L2VoidSigner} for L2 operations.
 */
export declare class L1VoidSigner extends L1VoidSigner_base {
    providerL2?: Provider;
    _providerL2(): Provider;
    _providerL1(): ethers.providers.Provider;
    _signerL1(): this;
    /**
     * @param address The address of the account.
     * @param providerL1 The provider instance for connecting to a L1 network.
     * @param providerL2 The provider instance for connecting to a L2 network.
     *
     * @example
     *
     * import { Provider, L1VoidSigner, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const signer = new L1VoidSigner("<ADDRESS>", ethProvider, provider);
     */
    constructor(address: string, providerL1?: ethers.providers.Provider, providerL2?: Provider);
    /**
     * Connects to the L1 network using the `provider`.
     *
     * @param provider The provider instance for connecting to a L1 network.
     *
     * @example
     *
     * import { L1VoidSigner } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     *
     * let singer = new L1VoidSigner("<ADDRESS>);
     * singer = singer.connect(ethProvider);
     */
    connect(provider: ethers.providers.Provider): L1VoidSigner;
    /**
     * Connects to the L2 network using the `provider`.
     *
     * @param provider The provider instance for connecting to a L2 network.
     *
     * @example
     *
     * import { Provider, L1VoidSigner, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * let signer = new L1VoidSigner("<ADDRESS>");
     * signer = signer.connectToL2(provider);
     */
    connectToL2(provider: Provider): this;
    /**
     * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
     *
     * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
     *
     * @example
     *
     * import { L1VoidSigner } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const signer = new L1VoidSigner("<ADDRESS>", ethProvider);
     *
     * const nonce = await signer.getNonce();
     */
    getNonce(blockTag?: BlockTag): Promise<number>;
}
export {};
