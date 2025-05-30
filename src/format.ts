import {
  accessListify,
  assert,
  assertArgument,
  BlockParams,
  getAddress,
  getBigInt,
  getCreateAddress,
  getNumber,
  hexlify,
  isHexString,
  Signature,
  TransactionReceiptParams,
  TransactionResponseParams,
  zeroPadValue,
} from 'ethers';

import {LogParams} from './types';

const BN_0 = BigInt(0);

export type FormatFunc = (value: any) => any;

export function allowNull(format: FormatFunc, nullValue?: any): FormatFunc {
  return function (value: any) {
    if (!value) {
      return nullValue;
    }
    return format(value);
  };
}

export function arrayOf(format: FormatFunc, allowNull?: boolean): FormatFunc {
  return (array: any) => {
    if (allowNull && !array) {
      return null;
    }
    if (!Array.isArray(array)) {
      throw new Error('Not an array!');
    }
    return array.map(i => format(i));
  };
}

// Requires an object which matches a fleet of other formatters
// Any FormatFunc may return `undefined` to have the value omitted
// from the result object. Calls preserve `this`.
export function object(
  format: Record<string, FormatFunc>,
  altNames?: Record<string, Array<string>>
): FormatFunc {
  return (value: any) => {
    const result: any = {};
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
      } catch (error) {
        const message = error instanceof Error ? error.message : 'not-an-error';
        assert(
          false,
          `invalid value for value.${key} (${message})`,
          'BAD_DATA',
          {value}
        );
      }
    }
    return result;
  };
}

export function formatBoolean(value: any): boolean {
  switch (value) {
    case true:
    case 'true':
      return true;
    case false:
    case 'false':
      return false;
  }
  assertArgument(
    false,
    `invalid boolean; ${JSON.stringify(value)}`,
    'value',
    value
  );
}

export function formatData(value: string): string {
  assertArgument(isHexString(value, true), 'invalid data', 'value', value);
  return value;
}

export function formatHash(value: any): string {
  assertArgument(isHexString(value, 32), 'invalid hash', 'value', value);
  return value;
}

export function formatUint256(value: any): string {
  if (!isHexString(value)) {
    throw new Error('Invalid uint256!');
  }
  return zeroPadValue(value, 32);
}

const _formatLog = object(
  {
    address: getAddress,
    blockHash: formatHash,
    blockNumber: getNumber,
    data: formatData,
    index: getNumber,
    removed: allowNull(formatBoolean, false),
    topics: arrayOf(formatHash),
    transactionHash: formatHash,
    transactionIndex: getNumber,
    l1BatchNumber: allowNull(getNumber),
  },
  {
    index: ['logIndex'],
  }
);

export function formatLog(value: any): LogParams {
  return _formatLog(value);
}

const _formatBlock = object({
  hash: allowNull(formatHash),
  parentHash: formatHash,
  number: getNumber,
  sha3Uncles: formatHash,

  stateRoot: formatHash,
  transactionsRoot: formatHash,
  receiptsRoot: formatHash,

  timestamp: getNumber,
  nonce: allowNull(formatData),
  difficulty: getBigInt,
  totalDifficulty: allowNull(getBigInt),

  gasLimit: getBigInt,
  gasUsed: getBigInt,

  miner: allowNull(getAddress),
  extraData: formatData,

  baseFeePerGas: allowNull(getBigInt),

  logsBloom: formatData,
  sealFields: allowNull(arrayOf(formatData)),
  uncles: arrayOf(formatHash),
  size: getBigInt,
  mixHash: formatHash,

  l1BatchNumber: allowNull(getNumber),
  l1BatchTimestamp: allowNull(getNumber),
});

export function formatBlock(value: any): BlockParams {
  const result = _formatBlock(value);
  result.transactions = value.transactions.map(
    (tx: string | TransactionResponseParams) => {
      if (typeof tx === 'string') {
        return tx;
      }
      return formatTransactionResponse(tx);
    }
  );
  return result;
}

const _formatReceiptLog = object(
  {
    transactionIndex: getNumber,
    blockNumber: getNumber,
    transactionHash: formatHash,
    address: getAddress,
    topics: arrayOf(formatHash),
    data: formatData,
    index: getNumber,
    blockHash: formatHash,
    l1BatchNumber: allowNull(getNumber),
  },
  {
    index: ['logIndex'],
  }
);

export function formatReceiptLog(value: any): LogParams {
  return _formatReceiptLog(value);
}

const formatL2ToL1Log = object({
  blockNumber: getNumber,
  blockHash: formatHash,
  l1BatchNumber: allowNull(getNumber),
  transactionIndex: getNumber,
  shardId: getNumber,
  isService: formatBoolean,
  sender: getAddress,
  key: formatHash,
  value: formatHash,
  transactionHash: formatHash,
  logIndex: getNumber,
});

const _formatTransactionReceipt = object(
  {
    to: allowNull(getAddress, null),
    from: allowNull(getAddress, null),
    contractAddress: allowNull(getAddress, null),
    // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
    index: getNumber,
    root: allowNull(hexlify),
    gasUsed: getBigInt,
    logsBloom: allowNull(formatData),
    blockHash: allowNull(formatHash, null),
    hash: formatHash,
    logs: arrayOf(formatReceiptLog),
    blockNumber: allowNull(getNumber, null),
    //confirmations: allowNull(getNumber, null),
    cumulativeGasUsed: getBigInt,
    effectiveGasPrice: allowNull(getBigInt),
    status: allowNull(getNumber),
    type: allowNull(getNumber, 0),
    l1BatchNumber: allowNull(getNumber),
    l1BatchTxIndex: allowNull(getNumber),
    l2ToL1Logs: allowNull(arrayOf(formatL2ToL1Log), []),
  },
  {
    effectiveGasPrice: ['gasPrice'],
    hash: ['transactionHash'],
    index: ['transactionIndex'],
  }
);

export function formatTransactionReceipt(value: any): TransactionReceiptParams {
  return _formatTransactionReceipt(value);
}

export function formatTransactionResponse(
  value: any
): TransactionResponseParams {
  // Some clients (TestRPC) do strange things like return 0x0 for the
  // 0 address; correct this to be a real address
  if (value.to && getBigInt(value.to) === BN_0) {
    value.to = '0x0000000000000000000000000000000000000000';
  }

  const result = object(
    {
      hash: formatHash,

      // Some nodes do not return this, usually test nodes (like Ganache)
      index: allowNull(getNumber, undefined),

      type: (value: any) => {
        if (value === '0x' || value === null || value === undefined) {
          return 0;
        }
        return getNumber(value);
      },
      accessList: allowNull(accessListify, null),

      blockHash: allowNull(formatHash, null),
      blockNumber: allowNull(getNumber, null),
      transactionIndex: allowNull(getNumber, null),

      //confirmations: allowNull(getNumber, null),

      from: getAddress,

      // either (gasPrice) or (maxPriorityFeePerGas + maxFeePerGas) must be set
      gasPrice: allowNull(getBigInt),
      maxPriorityFeePerGas: allowNull(getBigInt),
      maxFeePerGas: allowNull(getBigInt),

      gasLimit: getBigInt,
      to: allowNull(getAddress, null),
      value: getBigInt,
      nonce: getNumber,
      data: formatData,

      creates: allowNull(getAddress, null),

      chainId: allowNull(getBigInt, null),

      l1BatchNumber: allowNull(getNumber),
      l1BatchTxIndex: allowNull(getNumber),
    },
    {
      data: ['input'],
      gasLimit: ['gas'],
      index: ['transactionIndex'],
    }
  )(value);

  // If to and creates are empty, populate the creates from the value
  if (!result.to === null && result.creates === null) {
    result.creates = getCreateAddress(result);
  }

  // Add an access list to supported transaction types
  if ((value.type === 1 || value.type === 2) && value.accessList === null) {
    result.accessList = [];
  }

  // Compute the signature
  try {
    if (value.signature) {
      result.signature = Signature.from(value.signature);
    } else {
      result.signature = Signature.from(value);
    }
  } catch (e) {
    // DepositL2 transactions does not have V,R,S values
    // which causes signature computation to fail
    result.signature = Signature.from(undefined);
  }

  // Some backends omit ChainId on legacy transactions, but we can compute it
  if (result.chainId === null) {
    const chainId = result.signature.legacyChainId;
    if (chainId) {
      result.chainId = chainId;
    }
  }

  // 0x0000... should actually be null
  if (result.blockHash && getBigInt(result.blockHash) === BN_0) {
    result.blockHash = null;
  }

  return result;
}

const _formatFee = object(
  {
    gasLimit: getBigInt,
    gasPerPubdataLimit: getBigInt,
    maxPriorityFeePerGas: getBigInt,
    maxFeePerGas: getBigInt,
  },
  {
    gasLimit: ['gas_limit'],
    gasPerPubdataLimit: ['gas_per_pubdata_limit'],
    maxPriorityFeePerGas: ['max_priority_fee_per_gas'],
    maxFeePerGas: ['max_fee_per_gas'],
  }
);

export function formatFee(value: any) {
  return _formatFee(value);
}
