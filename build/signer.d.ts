import { BigNumberish, BlockTag, BytesLike, ContractTransactionResponse, ethers, Overrides } from 'ethers';
import { Provider } from './provider';
import { Address, BalancesMap, FinalizeWithdrawalParams, FullDepositFee, PaymasterParams, PriorityOpResponse, Signature, TransactionLike, TransactionRequest, TransactionResponse } from './types';
import { IBridgehub, IL1ERC20Bridge, IL1SharedBridge, IL2Bridge, IL2SharedBridge, IZkSyncHyperchain } from './typechain';
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
     * const signer = new EIP712Signer(new ethers.Wallet(PRIVATE_KEY), Number((await provider.getNetwork()).chainId));
     */
    constructor(ethSigner: ethers.Signer, chainId: number | Promise<number>);
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
     *   value: 7_000_000n,
     *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
     *   nonce: 0n,
     *   chainId: 270n,
     *   gasPrice: 250_000_000n,
     *   gasLimit: 21_000n,
     *   customData: {},
     * });
     */
    static getSignInput(transaction: TransactionRequest): {
        txType: number;
        from: ethers.AddressLike | null | undefined;
        to: ethers.AddressLike | null | undefined;
        gasLimit: BigNumberish;
        gasPerPubdataByteLimit: BigNumberish;
        maxFeePerGas: BigNumberish;
        maxPriorityFeePerGas: BigNumberish;
        paymaster: string;
        nonce: number;
        value: BigNumberish;
        data: string;
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
     *   value: 7_000_000n,
     *   nonce: 0n,
     *   chainId: 270n,
     *   gasPrice: 250_000_000n,
     *   gasLimit: 21_000n,
     * })
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
     *   value: 7_000_000n,
     *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
     *   nonce: 0n,
     *   chainId: 270n,
     *   gasPrice: 250_000_000n,
     *   gasLimit: 21_000n,
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
            amount: BigNumberish;
            token: string;
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
} & typeof ethers.JsonRpcSigner;
/**
 * A `Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L2 operations.
 *
 * @see {@link L1Signer} for L1 operations.
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
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`ETH balance: ${await signer.getBalance()}`);
     *
     * @example Get token balance.
     *
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const token = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     *
     * console.log(`Token balance: ${await signer.getBalance(token)}`);
     */
    getBalance(token?: Address, blockTag?: BlockTag): Promise<bigint>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
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
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Nonce: ${await signer.getDeploymentNonce()}`);
     */
    getDeploymentNonce(): Promise<bigint>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const l2BridgeContracts = await signer.getL2BridgeContracts();
     */
    getL2BridgeContracts(): Promise<{
        erc20: IL2Bridge;
        weth: IL2Bridge;
        shared: IL2SharedBridge;
    }>;
    /**
     * @inheritDoc
     *
     * @example Withdraw token.
     *
     * import { BrowserProvider, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const withdrawTx = await signer.withdraw({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000n,
     * });
     *
     * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { BrowserProvider, Provider, types, utils } from "zksync-ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const withdrawTx = await signer.withdraw({
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
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const withdrawTx = await signer.withdraw({
     *   token: tokenL2,
     *   amount: 10_000_000n,
     * });
     *
     * @example Withdraw token using paymaster to facilitate fee payment with an ERC20 token.
     *
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const withdrawTx = await signer.withdraw({
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
     * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const transferTx = await signer.transfer({
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
     * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = await Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const transferTx = signer.transfer({
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
     * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const transferTx = await signer.transfer({
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
     * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
     * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = await Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
     * const transferTx = signer.transfer({
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
     * Creates a new Singer with provided `signer` and `chainId`.
     *
     * @param signer  The signer from browser wallet.
     * @param chainId The chain ID of the network.
     * @param [zksyncProvider] The provider instance for connecting to a L2 network. If not provided,
     * the methods from the `zks` namespace are not supported, and interaction with them will result in an error.
     *
     * @example
     *
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     */
    static from(signer: ethers.JsonRpcSigner & {
        provider: Provider;
    }, chainId: number, zksyncProvider?: Provider): Signer;
    /**
     * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
     *
     * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
     *
     * import { BrowserProvider, Provider, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
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
     * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
     *
     * const browserProvider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await browserProvider.getSigner(),
     *     Number((await browserProvider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * signer.sendTransaction({
     *     to: Wallet.createRandom().address,
     *     value: 10_000_000n
     * });
     */
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    protected populateFeeData(transaction: TransactionRequest): Promise<ethers.PreparedTransactionRequest>;
}
declare const L1Signer_base: {
    new (...args: any[]): {
        _providerL2(): Provider;
        _providerL1(): ethers.Provider;
        _signerL1(): ethers.Signer;
        getDefaultBridgeAddresses(): Promise<{
            erc20L1: string;
            erc20L2: string;
            wethL1: string;
            wethL2: string;
            sharedL1: string;
            sharedL2: string;
            l1Nullifier: string;
            l1NativeTokenVault: string;
        }>;
        getMainContract(): Promise<IZkSyncHyperchain>;
        getBridgehubContract(): Promise<IBridgehub>;
        getL1BridgeContracts(): Promise<{
            erc20: IL1ERC20Bridge;
            weth: IL1ERC20Bridge;
            shared: IL1SharedBridge;
        }>;
        getL1AssetRouter(address?: string | undefined): Promise<import("./typechain").IL1AssetRouter>;
        getL1NativeTokenVault(): Promise<import("./typechain").IL1NativeTokenVault>;
        getL1Nullifier(): Promise<import("./typechain").IL1Nullifier>;
        getBaseToken(): Promise<string>;
        isETHBasedChain(): Promise<boolean>;
        getBalanceL1(token?: string | undefined, blockTag?: BlockTag | undefined): Promise<bigint>;
        getAllowanceL1(token: string, bridgeAddress?: string | undefined, blockTag?: BlockTag | undefined): Promise<bigint>;
        l2TokenAddress(token: string): Promise<string>;
        l1TokenAddress(token: string): Promise<string>;
        approveERC20(token: string, amount: BigNumberish, overrides?: (ethers.Overrides & {
            bridgeAddress?: string | undefined;
        }) | undefined): Promise<ethers.TransactionResponse>;
        getBaseCost(params: {
            gasLimit: BigNumberish;
            gasPerPubdataByte?: BigNumberish | undefined;
            gasPrice?: BigNumberish | undefined;
        }): Promise<bigint>;
        getDepositAllowanceParams(token: string, amount: BigNumberish, overrides?: ethers.Overrides | undefined): Promise<{
            token: string;
            allowance: BigNumberish;
        }[]>;
        getNativeTokenVaultL1(): Promise<ethers.Contract>;
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
        _getSecondBridgeCalldata(token: string, amount: BigNumberish, to: string): Promise<string>;
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
        getFinalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number, interopMode?: "proof_based_gw" | undefined): Promise<FinalizeWithdrawalParams>;
        getFinalizeDepositParams(withdrawalHash: BytesLike, index?: number): Promise<import("./types").FinalizeL1DepositParams>;
        getFinalizeWithdrawalParamsWithoutProof(withdrawalHash: BytesLike, index?: number): Promise<import("./types").FinalizeWithdrawalParamsWithoutProof>;
        getL1NullifierAddress(): Promise<string>;
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
} & typeof ethers.JsonRpcSigner;
/**
 * A `L1Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L1 operations.
 *
 * @see {@link Signer} for L2 operations.
 */
export declare class L1Signer extends L1Signer_base {
    providerL2: Provider;
    _providerL2(): Provider;
    _providerL1(): ethers.JsonRpcApiProvider;
    _signerL1(): this;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     *
     * console.log(await signer.getBalanceL1(tokenL1));
     */
    getBalanceL1(token?: Address, blockTag?: BlockTag): Promise<bigint>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * console.log(`Token allowance: ${await signer.getAllowanceL1(tokenL1)}`);
     */
    getAllowanceL1(token: Address, bridgeAddress?: Address, blockTag?: BlockTag): Promise<bigint>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * import { Wallet, Provider, types, utils } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
     *
     * const tokenL2 = "0xe1134444211593Cfda9fc9eCc7B43208615556E2";
     *
     * console.log(`Token L1 address: ${await wallet.l1TokenAddress(tokenL1)}`);
     */
    l1TokenAddress(token: Address): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * await signer.approveERC20(tokenL1, 5);
     */
    approveERC20(token: Address, amount: BigNumberish, overrides?: Overrides & {
        bridgeAddress?: Address;
    }): Promise<ethers.TransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Base cost: ${await signer.getBaseCost({ gasLimit: 100_000 })}`);
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * console.log(`Is ETH-based chain: ${await signer.isETHBasedChain()}`);
     */
    isETHBasedChain(): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example Get allowance parameters for depositing ETH on ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
    getDepositAllowanceParams(token: Address, amount: BigNumberish, overrides?: ethers.Overrides): Promise<{
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * await signer.deposit({
     *   token: utils.ETH_ADDRESS,
     *   amount: 10_000_000n,
     * });
     *
     * @example Deposit token on ETH-based chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * await signer.deposit({
     *   token: tokenL1,
     *   amount: 10_000_000n,
     *   approveERC20: true,
     * });
     *
     * @example Deposit ETH on non-ETH-chain.
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
     * const gas = await signer.estimateGasDeposit({
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const tx = await signer.getDepositTx({
     *   token: tokenL1,
     *   amount: 10_000_000n,
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
     * import { Provider, L1Signer, Wallet, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
        overrides?: Overrides;
    }): Promise<FullDepositFee>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const params = await signer.getFinalizeWithdrawalParams(WITHDRAWAL_HASH);
     */
    getFinalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number): Promise<FinalizeWithdrawalParams>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
     * const finalizeWithdrawTx = await signer.finalizeWithdrawal(WITHDRAWAL_HASH);
     */
    finalizeWithdrawal(withdrawalHash: BytesLike, index?: number, overrides?: Overrides): Promise<ContractTransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const FAILED_DEPOSIT_HASH = "<FAILED_DEPOSIT_TX_HASH>";
     * const claimFailedDepositTx = await signer.claimFailedDeposit(FAILED_DEPOSIT_HASH);
     */
    claimFailedDeposit(depositHash: BytesLike, overrides?: Overrides): Promise<ContractTransactionResponse>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const gas = await signer.estimateGasRequestExecute({
     *     contractAddress: await signer.providerL2.getMainContractAddress(),
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
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
     * @example
     *
     * import { Provider, L1Signer, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
        l2TxNumberInBlock: number | null;
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     */
    static from(signer: ethers.JsonRpcSigner, zksyncProvider: Provider): L1Signer;
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
     * const browserProvider = new ethers.BrowserProvider(window.ethereum);
     * const signer = L1Signer.from(
     *     await browserProvider.getSigner(),
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
            amount: BigNumberish;
            token: string;
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
} & typeof ethers.VoidSigner;
/**
 * @deprecated In favor of {@link VoidSigner}
 *
 * A `L2VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L2 operations.
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
     * @param tx The transaction request that needs to be populated.
     *
     * @example
     *
     * import { Provider, L2VoidSigner, Wallet, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new L2VoidSigner("<ADDRESS>", provider);
     *
     * const populatedTx = await signer.populateTransaction({
     *   to: Wallet.createRandom().address,
     *   value: 7_000_000n,
     *   maxFeePerGas: 3_500_000_000n,
     *   maxPriorityFeePerGas: 2_000_000_000n,
     *   customData: {
     *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
     *     factoryDeps: [],
     *   },
     * });
     */
    populateTransaction(tx: TransactionRequest): Promise<TransactionLike>;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
}
declare const VoidSigner_base: {
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
            amount: BigNumberish;
            token: string;
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
} & typeof ethers.VoidSigner;
/**
 * A `VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L2 operations.
 *
 * @see {@link L1VoidSigner} for L1 operations.
 */
export declare class VoidSigner extends VoidSigner_base {
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
     * let signer = new VoidSigner("<ADDRESS>");
     * signer = signer.connect(provider);
     */
    connect(provider: Provider): VoidSigner;
    /**
     * Designed for users who prefer a simplified approach by providing only the necessary data to create a valid transaction.
     * The only required fields are `transaction.to` and either `transaction.data` or `transaction.value` (or both, if the method is payable).
     * Any other fields that are not set will be prepared by this method.
     *
     * @param tx The transaction request that needs to be populated.
     *
     * @example
     *
     * import { Provider, VoidSigner, Wallet, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const signer = new VoidSigner("<ADDRESS>", provider);
     *
     * const populatedTx = await signer.populateTransaction({
     *   to: Wallet.createRandom().address,
     *   value: 7_000_000n,
     *   maxFeePerGas: 3_500_000_000n,
     *   maxPriorityFeePerGas: 2_000_000_000n,
     *   customData: {
     *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
     *     factoryDeps: [],
     *   },
     * });
     */
    populateTransaction(tx: TransactionRequest): Promise<TransactionLike>;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
}
declare const L1VoidSigner_base: {
    new (...args: any[]): {
        _providerL2(): Provider;
        _providerL1(): ethers.Provider;
        _signerL1(): ethers.Signer;
        getDefaultBridgeAddresses(): Promise<{
            erc20L1: string;
            erc20L2: string;
            wethL1: string;
            wethL2: string;
            sharedL1: string;
            sharedL2: string;
            l1Nullifier: string;
            l1NativeTokenVault: string;
        }>;
        getMainContract(): Promise<IZkSyncHyperchain>;
        getBridgehubContract(): Promise<IBridgehub>;
        getL1BridgeContracts(): Promise<{
            erc20: IL1ERC20Bridge;
            weth: IL1ERC20Bridge;
            shared: IL1SharedBridge;
        }>;
        getL1AssetRouter(address?: string | undefined): Promise<import("./typechain").IL1AssetRouter>;
        getL1NativeTokenVault(): Promise<import("./typechain").IL1NativeTokenVault>;
        getL1Nullifier(): Promise<import("./typechain").IL1Nullifier>;
        getBaseToken(): Promise<string>;
        isETHBasedChain(): Promise<boolean>;
        getBalanceL1(token?: string | undefined, blockTag?: BlockTag | undefined): Promise<bigint>;
        getAllowanceL1(token: string, bridgeAddress?: string | undefined, blockTag?: BlockTag | undefined): Promise<bigint>;
        l2TokenAddress(token: string): Promise<string>;
        l1TokenAddress(token: string): Promise<string>;
        approveERC20(token: string, amount: BigNumberish, overrides?: (ethers.Overrides & {
            bridgeAddress?: string | undefined;
        }) | undefined): Promise<ethers.TransactionResponse>;
        getBaseCost(params: {
            gasLimit: BigNumberish;
            gasPerPubdataByte?: BigNumberish | undefined;
            gasPrice?: BigNumberish | undefined;
        }): Promise<bigint>;
        getDepositAllowanceParams(token: string, amount: BigNumberish, overrides?: ethers.Overrides | undefined): Promise<{
            token: string;
            allowance: BigNumberish;
        }[]>;
        getNativeTokenVaultL1(): Promise<ethers.Contract>;
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
        _getSecondBridgeCalldata(token: string, amount: BigNumberish, to: string): Promise<string>;
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
        getFinalizeWithdrawalParams(withdrawalHash: BytesLike, index?: number, interopMode?: "proof_based_gw" | undefined): Promise<FinalizeWithdrawalParams>;
        getFinalizeDepositParams(withdrawalHash: BytesLike, index?: number): Promise<import("./types").FinalizeL1DepositParams>;
        getFinalizeWithdrawalParamsWithoutProof(withdrawalHash: BytesLike, index?: number): Promise<import("./types").FinalizeWithdrawalParamsWithoutProof>;
        getL1NullifierAddress(): Promise<string>;
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
} & typeof ethers.VoidSigner;
/**
 * A `L1VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L1 operations.
 *
 * @see {@link VoidSigner} for L2 operations.
 */
export declare class L1VoidSigner extends L1VoidSigner_base {
    providerL2?: Provider;
    _providerL2(): Provider;
    _providerL1(): ethers.Provider;
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
    constructor(address: string, providerL1?: ethers.Provider, providerL2?: Provider);
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
    connect(provider: ethers.Provider): L1VoidSigner;
    /**
     * Returns the balance of the account.
     *
     * @param [token] The token address to query balance for. Defaults to the native token.
     * @param [blockTag='committed'] The block tag to get the balance at.
     *
     * @example
     *
     * import { L1VoidSigner } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     *
     * const signer = new L1VoidSigner("<ADDRESS>);
     * const balance = await signer.getBalance();
     */
    getBalance(token?: Address, blockTag?: BlockTag): Promise<bigint>;
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
}
export {};
