"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const signer_1 = require("./signer");
const utils_1 = require("./utils");
const ethers_1 = require("ethers");
const adapters_1 = require("./adapters");
class Wallet extends (0, adapters_1.AdapterL2)((0, adapters_1.AdapterL1)(ethers_1.ethers.Wallet)) {
    _providerL1() {
        if (this.providerL1 == null) {
            throw new Error("L1 provider missing: use `connectToL1` to specify");
        }
        return this.providerL1;
    }
    _providerL2() {
        return this.provider;
    }
    _signerL1() {
        return this.ethWallet();
    }
    _signerL2() {
        return this;
    }
    ethWallet() {
        return new ethers_1.ethers.Wallet(this._signingKey(), this._providerL1());
    }
    // an alias with a better name
    async getNonce(blockTag) {
        return await this.getTransactionCount(blockTag);
    }
    connect(provider) {
        return new Wallet(this._signingKey(), provider, this.providerL1);
    }
    connectToL1(provider) {
        return new Wallet(this._signingKey(), this.provider, provider);
    }
    static fromMnemonic(mnemonic, path, wordlist) {
        const wallet = super.fromMnemonic(mnemonic, path, wordlist);
        return new Wallet(wallet._signingKey());
    }
    static async fromEncryptedJson(json, password, callback) {
        const wallet = await super.fromEncryptedJson(json, password, callback);
        return new Wallet(wallet._signingKey());
    }
    static fromEncryptedJsonSync(json, password) {
        const wallet = super.fromEncryptedJsonSync(json, password);
        return new Wallet(wallet._signingKey());
    }
    static createRandom(options) {
        const wallet = super.createRandom(options);
        return new Wallet(wallet._signingKey());
    }
    constructor(privateKey, providerL2, providerL1) {
        super(privateKey, providerL2);
        if (this.provider != null) {
            const chainId = this.getChainId();
            // @ts-ignore
            this.eip712 = new signer_1.EIP712Signer(this, chainId);
        }
        this.providerL1 = providerL1;
    }
    async populateTransaction(transaction) {
        var _a, _b;
        if (transaction.type == null && transaction.customData == null) {
            // use legacy txs by default
            transaction.type = 0;
        }
        if (transaction.customData == null && transaction.type != utils_1.EIP712_TX_TYPE) {
            return await super.populateTransaction(transaction);
        }
        transaction.type = utils_1.EIP712_TX_TYPE;
        const populated = await super.populateTransaction(transaction);
        populated.type = utils_1.EIP712_TX_TYPE;
        (_a = populated.value) !== null && _a !== void 0 ? _a : (populated.value = 0);
        (_b = populated.data) !== null && _b !== void 0 ? _b : (populated.data = "0x");
        populated.customData = this._fillCustomData(transaction.customData);
        if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
            populated.gasPrice = await this.provider.getGasPrice();
        }
        return populated;
    }
    async signTransaction(transaction) {
        var _a;
        if (transaction.customData == null && transaction.type != utils_1.EIP712_TX_TYPE) {
            if (transaction.type == 2 && transaction.maxFeePerGas == null) {
                transaction.maxFeePerGas = await this.provider.getGasPrice();
            }
            return await super.signTransaction(transaction);
        }
        else {
            (_a = transaction.from) !== null && _a !== void 0 ? _a : (transaction.from = this.address);
            if (transaction.from.toLowerCase() != this.address.toLowerCase()) {
                throw new Error("Transaction `from` address mismatch");
            }
            const populated = await this.populateTransaction(transaction);
            populated.customData.customSignature = await this.eip712.sign(transaction);
            return (0, utils_1.serialize)(populated);
        }
    }
    async sendTransaction(transaction) {
        // Typescript isn't smart enough to recognise that wallet.sendTransaction
        // calls provider.sendTransaction which returns our extended type and not ethers' one.
        return (await super.sendTransaction(transaction));
    }
    // TODO Remove if when getBaseToken RPC endpoint is available on L2
    async transfer(transaction) {
        var _a;
        const baseToken = await this.getBaseToken();
        const isEthBasedChain = await this.isEthBasedChain();
        if (!isEthBasedChain && (!transaction.token || transaction.token === baseToken)) {
            const tx = {
                ...(await ethers_1.ethers.utils.resolveProperties(((_a = transaction.overrides) !== null && _a !== void 0 ? _a : (transaction.overrides = {})))),
                from: await this.getAddress(),
                to: transaction.to,
                value: transaction.amount,
            };
            const txResponse = await this.sendTransaction(tx);
            return this._providerL2()._wrapTransaction(txResponse);
        }
        return super.transfer(transaction);
    }
}
exports.Wallet = Wallet;
