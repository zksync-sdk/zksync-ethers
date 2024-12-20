"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFee = exports.formatTransactionResponse = exports.formatTransactionReceipt = exports.formatReceiptLog = exports.formatBlock = exports.formatLog = exports.formatUint256 = exports.formatHash = exports.formatData = exports.formatBoolean = exports.object = exports.arrayOf = exports.allowNull = void 0;
const ethers_1 = require("ethers");
const BN_0 = BigInt(0);
function allowNull(format, nullValue) {
    return function (value) {
        if (!value) {
            return nullValue;
        }
        return format(value);
    };
}
exports.allowNull = allowNull;
function arrayOf(format, allowNull) {
    return (array) => {
        if (allowNull && !array) {
            return null;
        }
        if (!Array.isArray(array)) {
            throw new Error('Not an array!');
        }
        return array.map(i => format(i));
    };
}
exports.arrayOf = arrayOf;
// Requires an object which matches a fleet of other formatters
// Any FormatFunc may return `undefined` to have the value omitted
// from the result object. Calls preserve `this`.
function object(format, altNames) {
    return (value) => {
        const result = {};
        for (const key in format) {
            let srcKey = key;
            if (altNames && key in altNames && !(srcKey in value)) {
                for (const altKey of altNames[key]) {
                    if (altKey in value) {
                        srcKey = altKey;
                        break;
                    }
                }
            }
            try {
                const nv = format[key](value[srcKey]);
                if (nv !== undefined) {
                    result[key] = nv;
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'not-an-error';
                (0, ethers_1.assert)(false, `invalid value for value.${key} (${message})`, 'BAD_DATA', { value });
            }
        }
        return result;
    };
}
exports.object = object;
function formatBoolean(value) {
    switch (value) {
        case true:
        case 'true':
            return true;
        case false:
        case 'false':
            return false;
    }
    (0, ethers_1.assertArgument)(false, `invalid boolean; ${JSON.stringify(value)}`, 'value', value);
}
exports.formatBoolean = formatBoolean;
function formatData(value) {
    (0, ethers_1.assertArgument)((0, ethers_1.isHexString)(value, true), 'invalid data', 'value', value);
    return value;
}
exports.formatData = formatData;
function formatHash(value) {
    (0, ethers_1.assertArgument)((0, ethers_1.isHexString)(value, 32), 'invalid hash', 'value', value);
    return value;
}
exports.formatHash = formatHash;
function formatUint256(value) {
    if (!(0, ethers_1.isHexString)(value)) {
        throw new Error('Invalid uint256!');
    }
    return (0, ethers_1.zeroPadValue)(value, 32);
}
exports.formatUint256 = formatUint256;
const _formatLog = object({
    address: ethers_1.getAddress,
    blockHash: formatHash,
    blockNumber: ethers_1.getNumber,
    data: formatData,
    index: ethers_1.getNumber,
    removed: allowNull(formatBoolean, false),
    topics: arrayOf(formatHash),
    transactionHash: formatHash,
    transactionIndex: ethers_1.getNumber,
    l1BatchNumber: allowNull(ethers_1.getNumber),
}, {
    index: ['logIndex'],
});
function formatLog(value) {
    return _formatLog(value);
}
exports.formatLog = formatLog;
const _formatBlock = object({
    hash: allowNull(formatHash),
    parentHash: formatHash,
    number: ethers_1.getNumber,
    sha3Uncles: formatHash,
    stateRoot: formatHash,
    transactionsRoot: formatHash,
    receiptsRoot: formatHash,
    timestamp: ethers_1.getNumber,
    nonce: allowNull(formatData),
    difficulty: ethers_1.getBigInt,
    totalDifficulty: ethers_1.getBigInt,
    gasLimit: ethers_1.getBigInt,
    gasUsed: ethers_1.getBigInt,
    miner: allowNull(ethers_1.getAddress),
    extraData: formatData,
    baseFeePerGas: allowNull(ethers_1.getBigInt),
    logsBloom: formatData,
    sealFields: allowNull(arrayOf(formatData)),
    uncles: arrayOf(formatHash),
    size: ethers_1.getBigInt,
    mixHash: formatHash,
    l1BatchNumber: allowNull(ethers_1.getNumber),
    l1BatchTimestamp: allowNull(ethers_1.getNumber),
});
function formatBlock(value) {
    const result = _formatBlock(value);
    result.transactions = value.transactions.map((tx) => {
        if (typeof tx === 'string') {
            return tx;
        }
        return formatTransactionResponse(tx);
    });
    return result;
}
exports.formatBlock = formatBlock;
const _formatReceiptLog = object({
    transactionIndex: ethers_1.getNumber,
    blockNumber: ethers_1.getNumber,
    transactionHash: formatHash,
    address: ethers_1.getAddress,
    topics: arrayOf(formatHash),
    data: formatData,
    index: ethers_1.getNumber,
    blockHash: formatHash,
    l1BatchNumber: allowNull(ethers_1.getNumber),
}, {
    index: ['logIndex'],
});
function formatReceiptLog(value) {
    return _formatReceiptLog(value);
}
exports.formatReceiptLog = formatReceiptLog;
const formatL2ToL1Log = object({
    blockNumber: ethers_1.getNumber,
    blockHash: formatHash,
    l1BatchNumber: allowNull(ethers_1.getNumber),
    transactionIndex: ethers_1.getNumber,
    shardId: ethers_1.getNumber,
    isService: formatBoolean,
    sender: ethers_1.getAddress,
    key: formatHash,
    value: formatHash,
    transactionHash: formatHash,
    logIndex: ethers_1.getNumber,
});
const _formatTransactionReceipt = object({
    to: allowNull(ethers_1.getAddress, null),
    from: allowNull(ethers_1.getAddress, null),
    contractAddress: allowNull(ethers_1.getAddress, null),
    // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
    index: ethers_1.getNumber,
    root: allowNull(ethers_1.hexlify),
    gasUsed: ethers_1.getBigInt,
    logsBloom: allowNull(formatData),
    blockHash: allowNull(formatHash, null),
    hash: formatHash,
    logs: arrayOf(formatReceiptLog),
    blockNumber: allowNull(ethers_1.getNumber, null),
    //confirmations: allowNull(getNumber, null),
    cumulativeGasUsed: ethers_1.getBigInt,
    effectiveGasPrice: allowNull(ethers_1.getBigInt),
    status: allowNull(ethers_1.getNumber),
    type: allowNull(ethers_1.getNumber, 0),
    l1BatchNumber: allowNull(ethers_1.getNumber),
    l1BatchTxIndex: allowNull(ethers_1.getNumber),
    l2ToL1Logs: allowNull(arrayOf(formatL2ToL1Log), []),
}, {
    effectiveGasPrice: ['gasPrice'],
    hash: ['transactionHash'],
    index: ['transactionIndex'],
});
function formatTransactionReceipt(value) {
    return _formatTransactionReceipt(value);
}
exports.formatTransactionReceipt = formatTransactionReceipt;
function formatTransactionResponse(value) {
    // Some clients (TestRPC) do strange things like return 0x0 for the
    // 0 address; correct this to be a real address
    if (value.to && (0, ethers_1.getBigInt)(value.to) === BN_0) {
        value.to = '0x0000000000000000000000000000000000000000';
    }
    const result = object({
        hash: formatHash,
        // Some nodes do not return this, usually test nodes (like Ganache)
        index: allowNull(ethers_1.getNumber, undefined),
        type: (value) => {
            if (value === '0x' || value === null || value === undefined) {
                return 0;
            }
            return (0, ethers_1.getNumber)(value);
        },
        accessList: allowNull(ethers_1.accessListify, null),
        blockHash: allowNull(formatHash, null),
        blockNumber: allowNull(ethers_1.getNumber, null),
        transactionIndex: allowNull(ethers_1.getNumber, null),
        //confirmations: allowNull(getNumber, null),
        from: ethers_1.getAddress,
        // either (gasPrice) or (maxPriorityFeePerGas + maxFeePerGas) must be set
        gasPrice: allowNull(ethers_1.getBigInt),
        maxPriorityFeePerGas: allowNull(ethers_1.getBigInt),
        maxFeePerGas: allowNull(ethers_1.getBigInt),
        gasLimit: ethers_1.getBigInt,
        to: allowNull(ethers_1.getAddress, null),
        value: ethers_1.getBigInt,
        nonce: ethers_1.getNumber,
        data: formatData,
        creates: allowNull(ethers_1.getAddress, null),
        chainId: allowNull(ethers_1.getBigInt, null),
        l1BatchNumber: allowNull(ethers_1.getNumber),
        l1BatchTxIndex: allowNull(ethers_1.getNumber),
    }, {
        data: ['input'],
        gasLimit: ['gas'],
        index: ['transactionIndex'],
    })(value);
    // If to and creates are empty, populate the creates from the value
    if (!result.to === null && result.creates === null) {
        result.creates = (0, ethers_1.getCreateAddress)(result);
    }
    // Add an access list to supported transaction types
    if ((value.type === 1 || value.type === 2) && value.accessList === null) {
        result.accessList = [];
    }
    // Compute the signature
    try {
        if (value.signature) {
            result.signature = ethers_1.Signature.from(value.signature);
        }
        else {
            result.signature = ethers_1.Signature.from(value);
        }
    }
    catch (e) {
        // DepositL2 transactions does not have V,R,S values
        // which causes signature computation to fail
        result.signature = ethers_1.Signature.from(undefined);
    }
    // Some backends omit ChainId on legacy transactions, but we can compute it
    if (result.chainId === null) {
        const chainId = result.signature.legacyChainId;
        if (chainId) {
            result.chainId = chainId;
        }
    }
    // 0x0000... should actually be null
    if (result.blockHash && (0, ethers_1.getBigInt)(result.blockHash) === BN_0) {
        result.blockHash = null;
    }
    return result;
}
exports.formatTransactionResponse = formatTransactionResponse;
const _formatFee = object({
    gasLimit: ethers_1.getBigInt,
    gasPerPubdataLimit: ethers_1.getBigInt,
    maxPriorityFeePerGas: ethers_1.getBigInt,
    maxFeePerGas: ethers_1.getBigInt,
}, {
    gasLimit: ['gas_limit'],
    gasPerPubdataLimit: ['gas_per_pubdata_limit'],
    maxPriorityFeePerGas: ['max_priority_fee_per_gas'],
    maxFeePerGas: ['max_fee_per_gas'],
});
function formatFee(value) {
    return _formatFee(value);
}
exports.formatFee = formatFee;
//# sourceMappingURL=format.js.map