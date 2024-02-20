"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L1Signer = exports.Signer = exports.EIP712Signer = exports.EIP712_TYPES = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const hash_1 = require("@ethersproject/hash");
const adapters_1 = require("./adapters");
exports.EIP712_TYPES = {
    Transaction: [
        { name: "txType", type: "uint256" },
        { name: "from", type: "uint256" },
        { name: "to", type: "uint256" },
        { name: "gasLimit", type: "uint256" },
        { name: "gasPerPubdataByteLimit", type: "uint256" },
        { name: "maxFeePerGas", type: "uint256" },
        { name: "maxPriorityFeePerGas", type: "uint256" },
        { name: "paymaster", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "factoryDeps", type: "bytes32[]" },
        { name: "paymasterInput", type: "bytes" },
    ],
};
class EIP712Signer {
    constructor(ethSigner, chainId) {
        this.ethSigner = ethSigner;
        this.eip712Domain = Promise.resolve(chainId).then((chainId) => ({
            name: "zkSync",
            version: "2",
            chainId,
        }));
    }
    static getSignInput(transaction) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const maxFeePerGas = (_b = (_a = transaction.maxFeePerGas) !== null && _a !== void 0 ? _a : transaction.gasPrice) !== null && _b !== void 0 ? _b : 0;
        const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || maxFeePerGas;
        const gasPerPubdataByteLimit = (_d = (_c = transaction.customData) === null || _c === void 0 ? void 0 : _c.gasPerPubdata) !== null && _d !== void 0 ? _d : utils_1.DEFAULT_GAS_PER_PUBDATA_LIMIT;
        return {
            txType: transaction.type,
            from: transaction.from,
            to: transaction.to,
            gasLimit: transaction.gasLimit || 0,
            gasPerPubdataByteLimit: gasPerPubdataByteLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymaster: ((_f = (_e = transaction.customData) === null || _e === void 0 ? void 0 : _e.paymasterParams) === null || _f === void 0 ? void 0 : _f.paymaster) || ethers_1.ethers.constants.AddressZero,
            nonce: transaction.nonce || 0,
            value: transaction.value || 0,
            data: transaction.data || "0x",
            factoryDeps: ((_h = (_g = transaction.customData) === null || _g === void 0 ? void 0 : _g.factoryDeps) === null || _h === void 0 ? void 0 : _h.map((dep) => (0, utils_1.hashBytecode)(dep))) || [],
            paymasterInput: ((_k = (_j = transaction.customData) === null || _j === void 0 ? void 0 : _j.paymasterParams) === null || _k === void 0 ? void 0 : _k.paymasterInput) || "0x",
        };
    }
    async sign(transaction) {
        return await this.ethSigner._signTypedData(await this.eip712Domain, exports.EIP712_TYPES, EIP712Signer.getSignInput(transaction));
    }
    static getSignedDigest(transaction) {
        if (!transaction.chainId) {
            throw Error("Transaction chainId isn't set");
        }
        const domain = {
            name: "zkSync",
            version: "2",
            chainId: transaction.chainId,
        };
        return hash_1._TypedDataEncoder.hash(domain, exports.EIP712_TYPES, EIP712Signer.getSignInput(transaction));
    }
    async getDomain() {
        return await this.eip712Domain;
    }
}
exports.EIP712Signer = EIP712Signer;
// This class is to be used on the frontend, with metamask injection.
// It only contains L2 operations. For L1 operations, see L1Signer.
// Sample usage:
// const provider = new zkweb3.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// const tx = await signer.sendTransaction({ ... });
/* c8 ignore start */
class Signer extends (0, adapters_1.AdapterL2)(ethers_1.ethers.providers.JsonRpcSigner) {
    _signerL2() {
        return this;
    }
    _providerL2() {
        return this.provider;
    }
    static from(signer) {
        const newSigner = Object.setPrototypeOf(signer, Signer.prototype);
        // @ts-ignore
        newSigner.eip712 = new EIP712Signer(newSigner, newSigner.getChainId());
        return newSigner;
    }
    // an alias with a better name
    async getNonce(blockTag) {
        return await this.getTransactionCount(blockTag);
    }
    async sendTransaction(transaction) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (transaction.customData == null && transaction.type == null) {
            // use legacy txs by default
            transaction.type = 0;
        }
        if (transaction.customData == null && transaction.type != utils_1.EIP712_TX_TYPE) {
            return (await super.sendTransaction(transaction));
        }
        else {
            const address = await this.getAddress();
            (_a = transaction.from) !== null && _a !== void 0 ? _a : (transaction.from = address);
            if (transaction.from.toLowerCase() != address.toLowerCase()) {
                throw new Error("Transaction `from` address mismatch");
            }
            transaction.type = utils_1.EIP712_TX_TYPE;
            (_b = transaction.value) !== null && _b !== void 0 ? _b : (transaction.value = 0);
            (_c = transaction.data) !== null && _c !== void 0 ? _c : (transaction.data = "0x");
            (_d = transaction.nonce) !== null && _d !== void 0 ? _d : (transaction.nonce = await this.getNonce());
            transaction.customData = this._fillCustomData(transaction.customData);
            (_e = transaction.gasPrice) !== null && _e !== void 0 ? _e : (transaction.gasPrice = await this.provider.getGasPrice());
            (_f = transaction.gasLimit) !== null && _f !== void 0 ? _f : (transaction.gasLimit = await this.provider.estimateGas(transaction));
            (_g = transaction.chainId) !== null && _g !== void 0 ? _g : (transaction.chainId = (await this.provider.getNetwork()).chainId);
            transaction.customData.customSignature = await this.eip712.sign(transaction);
            const txBytes = (0, utils_1.serialize)(transaction);
            return await this.provider.sendTransaction(txBytes);
        }
    }
}
exports.Signer = Signer;
// This class is to be used on the frontend with metamask injection.
// It only contains L1 operations. For L2 operations, see Signer.
// Sample usage:
// const provider = new ethers.Web3Provider(window.ethereum);
// const zksyncProvider = new zkweb3.Provider('<rpc_url>');
// const signer = zkweb3.L1Signer.from(provider.getSigner(), zksyncProvider);
// const tx = await signer.deposit({ ... });
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
    static from(signer, zksyncProvider) {
        const newSigner = Object.setPrototypeOf(signer, L1Signer.prototype);
        newSigner.providerL2 = zksyncProvider;
        return newSigner;
    }
    connectToL2(provider) {
        this.providerL2 = provider;
        return this;
    }
}
exports.L1Signer = L1Signer;
/* c8 ignore stop */
