"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TransactionReceipt_logs, _Block_transactions, _Transaction_type, _Transaction_from;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountNonceOrdering = exports.AccountAbstractionVersion = exports.Transaction = exports.Log = exports.Block = exports.TransactionReceipt = exports.TransactionResponse = exports.TransactionStatus = exports.PriorityOpTree = exports.PriorityQueueType = exports.Network = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
/** Ethereum network. */
var Network;
(function (Network) {
    Network[Network["Mainnet"] = 1] = "Mainnet";
    Network[Network["Ropsten"] = 3] = "Ropsten";
    Network[Network["Rinkeby"] = 4] = "Rinkeby";
    Network[Network["Goerli"] = 5] = "Goerli";
    Network[Network["Sepolia"] = 6] = "Sepolia";
    Network[Network["Localhost"] = 9] = "Localhost";
    Network[Network["EraTestNode"] = 10] = "EraTestNode";
})(Network || (exports.Network = Network = {}));
/** Enumerated list of priority queue types. */
var PriorityQueueType;
(function (PriorityQueueType) {
    PriorityQueueType[PriorityQueueType["Deque"] = 0] = "Deque";
    PriorityQueueType[PriorityQueueType["HeapBuffer"] = 1] = "HeapBuffer";
    PriorityQueueType[PriorityQueueType["Heap"] = 2] = "Heap";
})(PriorityQueueType || (exports.PriorityQueueType = PriorityQueueType = {}));
/** Enumerated list of priority operation tree types. */
var PriorityOpTree;
(function (PriorityOpTree) {
    PriorityOpTree[PriorityOpTree["Full"] = 0] = "Full";
    PriorityOpTree[PriorityOpTree["Rollup"] = 1] = "Rollup";
})(PriorityOpTree || (exports.PriorityOpTree = PriorityOpTree = {}));
/** Enumerated list of transaction status types. */
var TransactionStatus;
(function (TransactionStatus) {
    /** Transaction not found. */
    TransactionStatus["NotFound"] = "not-found";
    /** Transaction is processing. */
    TransactionStatus["Processing"] = "processing";
    /** Transaction has been committed. */
    TransactionStatus["Committed"] = "committed";
    /** Transaction has been finalized. */
    TransactionStatus["Finalized"] = "finalized";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
/**
 * A `TransactionResponse` is an extension of {@link ethers.TransactionResponse} with additional features for
 * interacting with ZKsync Era.
 */
class TransactionResponse extends ethers_1.ethers.TransactionResponse {
    constructor(params, provider) {
        super(params, provider);
        (0, ethers_1.defineProperties)(this, {
            l1BatchNumber: params.l1BatchNumber,
            l1BatchTxIndex: params.l1BatchTxIndex,
        });
    }
    /**
     * Waits for this transaction to be mined and have a specified number of confirmation blocks.
     * Resolves once the transaction has `confirmations` blocks including it.
     * If `confirmations` is 0 and the transaction has not been mined, it resolves to `null`.
     * Otherwise, it waits until enough confirmations have completed.
     *
     * @param confirmations The number of confirmation blocks. Defaults to 1.
     * @returns A promise that resolves to the transaction receipt.
     */
    async wait(confirmations, timeout) {
        timeout ?? (timeout = 500);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const receipt = (await super.wait(confirmations));
            if (receipt && receipt.blockNumber) {
                return receipt;
            }
            await (0, utils_1.sleep)(timeout);
        }
    }
    async getTransaction() {
        return (await super.getTransaction());
    }
    replaceableTransaction(startBlock) {
        return new TransactionResponse(super.replaceableTransaction(startBlock), this.provider);
    }
    async getBlock() {
        return (await super.getBlock());
    }
    /** Waits for transaction to be finalized. */
    async waitFinalize() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const receipt = await this.wait();
            if (receipt && receipt.blockNumber) {
                const block = await this.provider.getBlock('finalized');
                if (receipt.blockNumber <= block.number) {
                    return (await this.provider.getTransactionReceipt(receipt.hash));
                }
            }
            else {
                await (0, utils_1.sleep)(500);
            }
        }
    }
    toJSON() {
        const { l1BatchNumber, l1BatchTxIndex } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber,
            l1BatchTxIndex,
        };
    }
}
exports.TransactionResponse = TransactionResponse;
/**
 * A `TransactionReceipt` is an extension of {@link ethers.TransactionReceipt} with additional features for
 * interacting with ZKsync Era.
 */
class TransactionReceipt extends ethers_1.ethers.TransactionReceipt {
    constructor(params, provider) {
        super(params, provider);
        /** All logs included in the transaction receipt. */
        _TransactionReceipt_logs.set(this, void 0);
        (0, ethers_1.defineProperties)(this, {
            l1BatchNumber: params.l1BatchNumber,
            l1BatchTxIndex: params.l1BatchTxIndex,
            l2ToL1Logs: params.l2ToL1Logs,
        });
        __classPrivateFieldSet(this, _TransactionReceipt_logs, Object.freeze(params.logs.map((log) => {
            return new Log(log, provider);
        })), "f");
    }
    get logs() {
        return __classPrivateFieldGet(this, _TransactionReceipt_logs, "f");
    }
    getBlock() {
        return super.getBlock();
    }
    getTransaction() {
        return super.getTransaction();
    }
    toJSON() {
        const { l1BatchNumber, l1BatchTxIndex, l2ToL1Logs } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber,
            l1BatchTxIndex,
            l2ToL1Logs,
        };
    }
}
exports.TransactionReceipt = TransactionReceipt;
_TransactionReceipt_logs = new WeakMap();
/** A `Block` is an extension of {@link ethers.Block} with additional features for interacting with ZKsync Era. */
class Block extends ethers_1.ethers.Block {
    constructor(params, provider) {
        super(params, provider);
        _Block_transactions.set(this, void 0);
        __classPrivateFieldSet(this, _Block_transactions, params.transactions.map((tx) => {
            if (typeof tx !== 'string') {
                return new TransactionResponse(tx, provider);
            }
            return tx;
        }), "f");
        (0, ethers_1.defineProperties)(this, {
            l1BatchNumber: params.l1BatchNumber,
            l1BatchTimestamp: params.l1BatchTimestamp,
        });
    }
    toJSON() {
        const { l1BatchNumber, l1BatchTimestamp } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber,
            l1BatchTimestamp,
        };
    }
    get prefetchedTransactions() {
        const txs = __classPrivateFieldGet(this, _Block_transactions, "f").slice();
        // Doesn't matter...
        if (txs.length === 0) {
            return [];
        }
        // Make sure we prefetched the transactions
        (0, ethers_1.assert)(typeof txs[0] === 'object', 'transactions were not prefetched with block request', 'UNSUPPORTED_OPERATION', {
            operation: 'transactionResponses()',
        });
        return txs;
    }
    async getTransaction(indexOrHash) {
        // Find the internal value by its index or hash
        let tx = undefined;
        if (typeof indexOrHash === 'number') {
            tx = __classPrivateFieldGet(this, _Block_transactions, "f")[indexOrHash];
        }
        else {
            const hash = indexOrHash.toLowerCase();
            for (const v of __classPrivateFieldGet(this, _Block_transactions, "f")) {
                if (typeof v === 'string') {
                    if (v !== hash) {
                        continue;
                    }
                    tx = v;
                    break;
                }
                else {
                    if (v.hash === hash) {
                        continue;
                    }
                    tx = v;
                    break;
                }
            }
        }
        if (!tx) {
            throw new Error('no such tx');
        }
        if (typeof tx === 'string') {
            return await this.provider.getTransaction(tx);
        }
        else {
            return tx;
        }
    }
}
exports.Block = Block;
_Block_transactions = new WeakMap();
/** A `Log` is an extension of {@link ethers.Log} with additional features for interacting with ZKsync Era. */
class Log extends ethers_1.ethers.Log {
    constructor(params, provider) {
        super(params, provider);
        this.l1BatchNumber = params.l1BatchNumber;
    }
    toJSON() {
        const { l1BatchNumber } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber,
        };
    }
    async getBlock() {
        return (await super.getBlock());
    }
    async getTransaction() {
        return (await super.getTransaction());
    }
    async getTransactionReceipt() {
        return (await super.getTransactionReceipt());
    }
}
exports.Log = Log;
/**
 * A `Transaction` is an extension of {@link ethers.Transaction} with additional features for interacting
 * with ZKsync Era.
 */
class Transaction extends ethers_1.ethers.Transaction {
    constructor() {
        super(...arguments);
        // super.#type is private and there is no way to override which enforced to
        // introduce following variable
        _Transaction_type.set(this, void 0);
        _Transaction_from.set(this, void 0);
    }
    get type() {
        return __classPrivateFieldGet(this, _Transaction_type, "f") === utils_1.EIP712_TX_TYPE ? __classPrivateFieldGet(this, _Transaction_type, "f") : super.type;
    }
    set type(value) {
        switch (value) {
            case utils_1.EIP712_TX_TYPE:
            case 'eip-712':
                __classPrivateFieldSet(this, _Transaction_type, utils_1.EIP712_TX_TYPE, "f");
                break;
            default:
                super.type = value;
        }
    }
    static from(tx) {
        if (typeof tx === 'string') {
            const payload = ethers_1.ethers.getBytes(tx);
            if (payload[0] !== utils_1.EIP712_TX_TYPE) {
                return Transaction.from(ethers_1.ethers.Transaction.from(tx));
            }
            else {
                return Transaction.from((0, utils_1.parseEip712)(payload));
            }
        }
        else {
            const result = new Transaction();
            if (tx.type === utils_1.EIP712_TX_TYPE) {
                result.type = utils_1.EIP712_TX_TYPE;
                result.customData = tx.customData;
                result.from = tx.from;
            }
            if (tx.type !== null && tx.type !== undefined)
                result.type = tx.type;
            if (tx.to)
                result.to = tx.to;
            if (tx.nonce)
                result.nonce = tx.nonce;
            if (tx.gasLimit)
                result.gasLimit = tx.gasLimit;
            if (tx.gasPrice)
                result.gasPrice = tx.gasPrice;
            if (tx.maxPriorityFeePerGas)
                result.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
            if (tx.maxFeePerGas)
                result.maxFeePerGas = tx.maxFeePerGas;
            if (tx.data)
                result.data = tx.data;
            if (tx.value)
                result.value = tx.value;
            if (tx.chainId)
                result.chainId = tx.chainId;
            if (tx.signature)
                result.signature = ethers_1.Signature.from(tx.signature);
            result.accessList = null;
            if (tx.from) {
                (0, ethers_1.assertArgument)(result.isSigned(), 'unsigned transaction cannot define from', 'tx', tx);
                (0, ethers_1.assertArgument)((0, utils_1.isAddressEq)(result.from, tx.from), 'from mismatch', 'tx', tx);
            }
            if (tx.hash) {
                (0, ethers_1.assertArgument)(result.isSigned(), 'unsigned transaction cannot define hash', 'tx', tx);
                (0, ethers_1.assertArgument)(result.hash === tx.hash, 'hash mismatch', 'tx', tx);
            }
            return result;
        }
    }
    get serialized() {
        if (!this.customData && __classPrivateFieldGet(this, _Transaction_type, "f") !== utils_1.EIP712_TX_TYPE) {
            return super.serialized;
        }
        return (0, utils_1.serializeEip712)(this, this.signature);
    }
    get unsignedSerialized() {
        if (!this.customData && this.type !== utils_1.EIP712_TX_TYPE) {
            return super.unsignedSerialized;
        }
        return (0, utils_1.serializeEip712)(this);
    }
    toJSON() {
        const { customData } = this;
        return {
            ...super.toJSON(),
            type: !__classPrivateFieldGet(this, _Transaction_type, "f") ? this.type : __classPrivateFieldGet(this, _Transaction_type, "f"),
            customData,
        };
    }
    get typeName() {
        return __classPrivateFieldGet(this, _Transaction_type, "f") === utils_1.EIP712_TX_TYPE ? 'zksync' : super.typeName;
    }
    isSigned() {
        return __classPrivateFieldGet(this, _Transaction_type, "f") === utils_1.EIP712_TX_TYPE
            ? this.customData?.customSignature !== null
            : super.isSigned();
    }
    get hash() {
        if (__classPrivateFieldGet(this, _Transaction_type, "f") === utils_1.EIP712_TX_TYPE) {
            return this.customData?.customSignature !== null
                ? (0, utils_1.eip712TxHash)(this)
                : null;
        }
        else {
            return super.hash;
        }
    }
    get from() {
        return __classPrivateFieldGet(this, _Transaction_type, "f") === utils_1.EIP712_TX_TYPE ? __classPrivateFieldGet(this, _Transaction_from, "f") : super.from;
    }
    set from(value) {
        __classPrivateFieldSet(this, _Transaction_from, value, "f");
    }
}
exports.Transaction = Transaction;
_Transaction_type = new WeakMap(), _Transaction_from = new WeakMap();
/** Enumerated list of account abstraction versions. */
var AccountAbstractionVersion;
(function (AccountAbstractionVersion) {
    /** Used for contracts that are not accounts. */
    AccountAbstractionVersion[AccountAbstractionVersion["None"] = 0] = "None";
    /** Used for contracts that are accounts. */
    AccountAbstractionVersion[AccountAbstractionVersion["Version1"] = 1] = "Version1";
})(AccountAbstractionVersion || (exports.AccountAbstractionVersion = AccountAbstractionVersion = {}));
/**
 * Enumerated list of account nonce ordering formats.
 */
var AccountNonceOrdering;
(function (AccountNonceOrdering) {
    /**
     * Nonces should be ordered in the same way as in externally owned accounts (EOAs).
     * This means, for instance, that the operator will always wait for a transaction with nonce `X`
     * before processing a transaction with nonce `X+1`.
     */
    AccountNonceOrdering[AccountNonceOrdering["Sequential"] = 0] = "Sequential";
    /** Nonces can be ordered in arbitrary order. */
    AccountNonceOrdering[AccountNonceOrdering["Arbitrary"] = 1] = "Arbitrary";
})(AccountNonceOrdering || (exports.AccountNonceOrdering = AccountNonceOrdering = {}));
//# sourceMappingURL=types.js.map