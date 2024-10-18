"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L1VoidSigner = exports.L2VoidSigner = exports.L1Signer = exports.Signer = exports.EIP712Signer = exports.EIP712_TYPES = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const hash_1 = require("@ethersproject/hash");
const adapters_1 = require("./adapters");
/**
 * All typed data conforming to the EIP712 standard within ZKsync Era.
 */
exports.EIP712_TYPES = {
    Transaction: [
        { name: 'txType', type: 'uint256' },
        { name: 'from', type: 'uint256' },
        { name: 'to', type: 'uint256' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'gasPerPubdataByteLimit', type: 'uint256' },
        { name: 'maxFeePerGas', type: 'uint256' },
        { name: 'maxPriorityFeePerGas', type: 'uint256' },
        { name: 'paymaster', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' },
        { name: 'factoryDeps', type: 'bytes32[]' },
        { name: 'paymasterInput', type: 'bytes' },
    ],
};
/**
 * A `EIP712Signer` provides support for signing EIP712-typed ZKsync Era transactions.
 */
class EIP712Signer {
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
    constructor(ethSigner, chainId) {
        this.ethSigner = ethSigner;
        this.eip712Domain = Promise.resolve(chainId).then(chainId => ({
            name: 'zkSync',
            version: '2',
            chainId,
        }));
    }
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
    static getSignInput(transaction) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const maxFeePerGas = (_b = (_a = transaction.maxFeePerGas) !== null && _a !== void 0 ? _a : transaction.gasPrice) !== null && _b !== void 0 ? _b : 0;
        const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || maxFeePerGas;
        const gasPerPubdataByteLimit = (_d = (_c = transaction.customData) === null || _c === void 0 ? void 0 : _c.gasPerPubdata) !== null && _d !== void 0 ? _d : utils_1.DEFAULT_GAS_PER_PUBDATA_LIMIT;
        return {
            txType: transaction.type || utils_1.EIP712_TX_TYPE,
            from: transaction.from,
            to: transaction.to,
            gasLimit: transaction.gasLimit || 0,
            gasPerPubdataByteLimit: gasPerPubdataByteLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymaster: ((_f = (_e = transaction.customData) === null || _e === void 0 ? void 0 : _e.paymasterParams) === null || _f === void 0 ? void 0 : _f.paymaster) ||
                ethers_1.ethers.constants.AddressZero,
            nonce: transaction.nonce || 0,
            value: transaction.value || 0,
            data: transaction.data || '0x',
            factoryDeps: ((_h = (_g = transaction.customData) === null || _g === void 0 ? void 0 : _g.factoryDeps) === null || _h === void 0 ? void 0 : _h.map((dep) => (0, utils_1.hashBytecode)(dep))) || [],
            paymasterInput: ((_k = (_j = transaction.customData) === null || _j === void 0 ? void 0 : _j.paymasterParams) === null || _k === void 0 ? void 0 : _k.paymasterInput) || '0x',
        };
    }
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
    async sign(transaction) {
        return await this.ethSigner._signTypedData(await this.eip712Domain, exports.EIP712_TYPES, EIP712Signer.getSignInput(transaction));
    }
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
    static getSignedDigest(transaction) {
        if (!transaction.chainId) {
            throw Error("Transaction chainId isn't set!");
        }
        const domain = {
            name: 'zkSync',
            version: '2',
            chainId: transaction.chainId,
        };
        return hash_1._TypedDataEncoder.hash(domain, exports.EIP712_TYPES, EIP712Signer.getSignInput(transaction));
    }
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
    async getDomain() {
        return await this.eip712Domain;
    }
}
exports.EIP712Signer = EIP712Signer;
/* c8 ignore start */
/**
 * A `Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L2 operations.
 *
 * @see {@link L1Signer} for L1 operations.
 *
 */
class Signer extends (0, adapters_1.AdapterL2)(ethers_1.ethers.providers.JsonRpcSigner) {
    _signerL2() {
        return this;
    }
    _providerL2() {
        // Make it compatible when singer is created with Web3Provider.getSigner()
        return this.providerL2 ? this.providerL2 : this.provider;
    }
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
    async getBalance(token, blockTag = 'committed') {
        return super.getBalance(token, blockTag);
    }
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
    async getAllBalances() {
        return super.getAllBalances();
    }
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
    async getDeploymentNonce() {
        return super.getDeploymentNonce();
    }
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
    async getL2BridgeContracts() {
        return super.getL2BridgeContracts();
    }
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
    async withdraw(transaction) {
        return super.withdraw(transaction);
    }
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
    async transfer(transaction) {
        return super.transfer(transaction);
    }
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
    static from(signer, zksyncProvider) {
        const newSigner = Object.setPrototypeOf(signer, Signer.prototype);
        newSigner.eip712 = new EIP712Signer(newSigner, newSigner.getChainId());
        newSigner.providerL2 = zksyncProvider;
        return newSigner;
    }
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
    async getNonce(blockTag) {
        return await this.getTransactionCount(blockTag);
    }
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
    async sendTransaction(transaction) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!transaction.customData && !transaction.type) {
            // use legacy txs by default
            transaction.type = 0;
        }
        if (!transaction.customData && transaction.type !== utils_1.EIP712_TX_TYPE) {
            return (await super.sendTransaction(transaction));
        }
        else {
            const address = await this.getAddress();
            (_a = transaction.from) !== null && _a !== void 0 ? _a : (transaction.from = address);
            if (!(0, utils_1.isAddressEq)(transaction.from, address)) {
                throw new Error('Transaction `from` address mismatch!');
            }
            transaction.type = utils_1.EIP712_TX_TYPE;
            (_b = transaction.value) !== null && _b !== void 0 ? _b : (transaction.value = 0);
            (_c = transaction.data) !== null && _c !== void 0 ? _c : (transaction.data = '0x');
            (_d = transaction.nonce) !== null && _d !== void 0 ? _d : (transaction.nonce = await this.getNonce());
            transaction.customData = this._fillCustomData((_e = transaction.customData) !== null && _e !== void 0 ? _e : {});
            (_f = transaction.gasPrice) !== null && _f !== void 0 ? _f : (transaction.gasPrice = await this.provider.getGasPrice());
            (_g = transaction.gasLimit) !== null && _g !== void 0 ? _g : (transaction.gasLimit = await this.provider.estimateGas(transaction));
            (_h = transaction.chainId) !== null && _h !== void 0 ? _h : (transaction.chainId = (await this.provider.getNetwork()).chainId);
            transaction.customData.customSignature =
                await this.eip712.sign(transaction);
            const txBytes = (0, utils_1.serialize)(transaction);
            return await this.provider.sendTransaction(txBytes);
        }
    }
}
exports.Signer = Signer;
/**
 * A `L1Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L1 operations.
 *
 * @see {@link Signer} for L2 operations.
 */
class L1Signer extends (0, adapters_1.AdapterL1)(ethers_1.ethers.providers.JsonRpcSigner) {
    _providerL2() {
        return this.providerL2;
    }
    _providerL1() {
        return this.provider;
    }
    _signerL1() {
        return this;
    }
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
    async getMainContract() {
        return super.getMainContract();
    }
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
    async getBridgehubContract() {
        return super.getBridgehubContract();
    }
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
    async getL1BridgeContracts() {
        return super.getL1BridgeContracts();
    }
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
    async getBalanceL1(token, blockTag) {
        return super.getBalanceL1(token, blockTag);
    }
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
    async getAllowanceL1(token, bridgeAddress, blockTag) {
        return super.getAllowanceL1(token, bridgeAddress, blockTag);
    }
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
    async l2TokenAddress(token) {
        return super.l2TokenAddress(token);
    }
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
    async approveERC20(token, amount, overrides) {
        return super.approveERC20(token, amount, overrides);
    }
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
    async getBaseCost(params) {
        return super.getBaseCost(params);
    }
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
    async getBaseToken() {
        return super.getBaseToken();
    }
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
    async isETHBasedChain() {
        return super.isETHBasedChain();
    }
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
    async getDepositAllowanceParams(token, amount) {
        return super.getDepositAllowanceParams(token, amount);
    }
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
    async deposit(transaction) {
        return super.deposit(transaction);
    }
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
    async estimateGasDeposit(transaction) {
        return super.estimateGasDeposit(transaction);
    }
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
    async getDepositTx(transaction) {
        return super.getDepositTx(transaction);
    }
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
    async getFullRequiredDepositFee(transaction) {
        return super.getFullRequiredDepositFee(transaction);
    }
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
    async finalizeWithdrawalParams(withdrawalHash, index = 0) {
        return super.finalizeWithdrawalParams(withdrawalHash, index);
    }
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
    async finalizeWithdrawal(withdrawalHash, index = 0, overrides) {
        return super.finalizeWithdrawal(withdrawalHash, index, overrides);
    }
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
    async isWithdrawalFinalized(withdrawalHash, index = 0) {
        return super.isWithdrawalFinalized(withdrawalHash, index);
    }
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
    async claimFailedDeposit(depositHash, overrides) {
        return super.claimFailedDeposit(depositHash, overrides);
    }
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
    async getRequestExecuteAllowanceParams(transaction) {
        return super.getRequestExecuteAllowanceParams(transaction);
    }
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
    async requestExecute(transaction) {
        return super.requestExecute(transaction);
    }
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
    async estimateGasRequestExecute(transaction) {
        return super.estimateGasRequestExecute(transaction);
    }
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
    async getRequestExecuteTx(transaction) {
        return super.getRequestExecuteTx(transaction);
    }
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
    async getPriorityOpConfirmation(txHash, index = 0) {
        return super.getPriorityOpConfirmation(txHash, index);
    }
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
    static from(signer, zksyncProvider) {
        const newSigner = Object.setPrototypeOf(signer, L1Signer.prototype);
        newSigner.providerL2 = zksyncProvider;
        return newSigner;
    }
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
    connectToL2(provider) {
        this.providerL2 = provider;
        return this;
    }
}
exports.L1Signer = L1Signer;
/* c8 ignore stop */
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
class L2VoidSigner extends (0, adapters_1.AdapterL2)(ethers_1.ethers.VoidSigner) {
    _signerL2() {
        return this;
    }
    _providerL2() {
        return this.provider;
    }
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
    connect(provider) {
        return new L2VoidSigner(this.address, provider);
    }
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
    async populateTransaction(transaction) {
        var _a, _b, _c;
        if ((!transaction.type || transaction.type !== utils_1.EIP712_TX_TYPE) &&
            !transaction.customData) {
            return await super.populateTransaction(transaction);
        }
        transaction.type = utils_1.EIP712_TX_TYPE;
        const populated = await super.populateTransaction(transaction);
        populated.type = utils_1.EIP712_TX_TYPE;
        (_a = populated.value) !== null && _a !== void 0 ? _a : (populated.value = 0);
        (_b = populated.data) !== null && _b !== void 0 ? _b : (populated.data = '0x');
        populated.customData = this._fillCustomData((_c = transaction.customData) !== null && _c !== void 0 ? _c : {});
        if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
            populated.gasPrice = await this.provider.getGasPrice();
        }
        return populated;
    }
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
    async getNonce(blockTag) {
        return await this.getTransactionCount(blockTag);
    }
}
exports.L2VoidSigner = L2VoidSigner;
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
class L1VoidSigner extends (0, adapters_1.AdapterL1)(ethers_1.ethers.VoidSigner) {
    _providerL2() {
        if (!this.providerL2) {
            throw new Error('L2 provider missing: use `connectToL2` to specify!');
        }
        return this.providerL2;
    }
    _providerL1() {
        return this.provider;
    }
    _signerL1() {
        return this;
    }
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
    constructor(address, providerL1, providerL2) {
        super(address, providerL1);
        this.providerL2 = providerL2;
    }
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
    connect(provider) {
        return new L1VoidSigner(this.address, provider);
    }
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
    connectToL2(provider) {
        this.providerL2 = provider;
        return this;
    }
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
    async getNonce(blockTag) {
        return await this.getTransactionCount(blockTag);
    }
}
exports.L1VoidSigner = L1VoidSigner;
//# sourceMappingURL=signer.js.map