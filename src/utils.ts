import {BigNumber, BigNumberish, BytesLike, ethers, utils} from 'ethers';
import {SignatureLike} from '@ethersproject/bytes';
import {
  Address,
  DeploymentInfo,
  Eip712Meta,
  EthereumSignature,
  PaymasterParams,
  PriorityOpTree,
  PriorityQueueType,
} from './types';
import {TypedDataDomain, TypedDataField} from '@ethersproject/abstract-signer';
import {Provider} from './provider';
import {EIP712Signer} from './signer';
import {Ierc20Factory as IERC20Factory} from '../typechain/Ierc20Factory';
import {Il1BridgeFactory as IL1BridgeFactory} from '../typechain/Il1BridgeFactory';
import {AbiCoder} from 'ethers/lib/utils';

export * from './paymaster-utils';
export {EIP712_TYPES} from './signer';

/**
 * The ABI for the `ZkSync` interface.
 * @constant
 */
export const ZKSYNC_MAIN_ABI = new utils.Interface(
  require('../abi/IZkSync.json')
);

/**
 * The ABI for the `IContractDeployer` interface, which is utilized for deploying smart contracts.
 * @constant
 */
export const CONTRACT_DEPLOYER = new utils.Interface(
  require('../abi/IContractDeployer.json')
);

/**
 * The ABI for the `IL1Messenger` interface, which is utilized for sending messages from the L2 to L1.
 * @constant
 */
export const L1_MESSENGER = new utils.Interface(
  require('../abi/IL1Messenger.json')
);

/**
 * The ABI for the `IERC20` interface, which is utilized for interacting with ERC20 tokens.
 * @constant
 */
export const IERC20 = new utils.Interface(require('../abi/IERC20.json'));

/**
 * The ABI for the `IERC1271` interface, which is utilized for signature validation by contracts.
 * @constant
 */
export const IERC1271 = new utils.Interface(require('../abi/IERC1271.json'));

/**
 * The ABI for the `IL1Bridge` interface, which is utilized for transferring ERC20 tokens from L1 to L2.
 * @constant
 */
export const L1_BRIDGE_ABI = new utils.Interface(
  require('../abi/IL1Bridge.json')
);

/**
 * The ABI for the `IL2Bridge` interface, which is utilized for transferring ERC20 tokens from L2 to L1.
 * @constant
 */
export const L2_BRIDGE_ABI = new utils.Interface(
  require('../abi/IL2Bridge.json')
);

/**
 * The ABI for the `INonceHolder` interface, which is utilized for managing deployment nonces.
 * @constant
 */
export const NONCE_HOLDER_ABI = new utils.Interface(
  require('../abi/INonceHolder.json')
);

/**
 * The address of the L1 `ETH` token.
 * @constant
 */
export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * The formal address for the `Bootloader`.
 * @constant
 */
export const BOOTLOADER_FORMAL_ADDRESS =
  '0x0000000000000000000000000000000000008001';

/**
 * The address of the Contract deployer.
 * @constant
 */
export const CONTRACT_DEPLOYER_ADDRESS =
  '0x0000000000000000000000000000000000008006';

/**
 * The address of the L1 messenger.
 * @constant
 */
export const L1_MESSENGER_ADDRESS =
  '0x0000000000000000000000000000000000008008';

/**
 * The address of the L2 `ETH` token.
 * @constant
 */
export const L2_ETH_TOKEN_ADDRESS =
  '0x000000000000000000000000000000000000800a';

/**
 * The address of the Nonce holder.
 * @constant
 */
export const NONCE_HOLDER_ADDRESS =
  '0x0000000000000000000000000000000000008003';

/**
 * The zero hash value.
 * @constant
 */
export const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Used for applying and undoing aliases on addresses during bridging from L1 to L2.
 * @constant
 */
export const L1_TO_L2_ALIAS_OFFSET =
  '0x1111000000000000000000000000000000001111';

/**
 * The EIP1271 magic value used for signature validation in smart contracts.
 * This predefined constant serves as a standardized indicator to signal successful
 * signature validation by the contract.
 *
 * @constant
 */
export const EIP1271_MAGIC_VALUE = '0x1626ba7e';

/**
 * Represents an EIP712 transaction type.
 *
 * @constant
 */
export const EIP712_TX_TYPE = 0x71;

/**
 * Represents a priority transaction operation on L2.
 *
 * @constant
 */
export const PRIORITY_OPERATION_L2_TX_TYPE = 0xff;

/**
 * The maximum bytecode length in bytes that can be deployed.
 *
 * @constant
 */
export const MAX_BYTECODE_LEN_BYTES = ((1 << 16) - 1) * 32;

/**
 * Numerator used in scaling the gas limit to ensure acceptance of `L1->L2` transactions.
 *
 * This constant is part of a coefficient calculation to adjust the gas limit to account for variations
 * in the SDK estimation, ensuring the transaction will be accepted.
 *
 * @constant
 */
export const L1_FEE_ESTIMATION_COEF_NUMERATOR = BigNumber.from(12);
/**
 * Denominator used in scaling the gas limit to ensure acceptance of `L1->L2` transactions.
 *
 * This constant is part of a coefficient calculation to adjust the gas limit to account for variations
 * in the SDK estimation, ensuring the transaction will be accepted.
 *
 * @constant
 */
export const L1_FEE_ESTIMATION_COEF_DENOMINATOR = BigNumber.from(10);

/**
 * Gas limit used for displaying the error messages when the
 * users do not have enough fee when depositing ERC20 token from L1 to L2.
 *
 * @constant
 */
export const L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT = 400_000;

/**
 * Gas limit used for displaying the error messages when the
 * users do not have enough fee when depositing `ETH` token from L1 to L2.
 *
 * @constant
 */
export const L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT = 200_000;

/**
 * Default gas per pubdata byte for L2 transactions.
 * This value is utilized when inserting a default value for type 2
 * and EIP712 type transactions.
 *
 * @constant
 */
// It is a realistic value, but it is large enough to fill into any batch regardless of the pubdata price.
export const DEFAULT_GAS_PER_PUBDATA_LIMIT = 50_000;

/**
 * The `L1->L2` transactions are required to have the following gas per pubdata byte.
 *
 * @constant
 */
export const REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT = 800;

/**
 * Returns true if token represents ETH on L1 or L2.
 *
 * @param token The token address.
 *
 * @example
 *
 * const isL1ETH = utils.isETH(utils.ETH_ADDRESS); // true
 * const isL2ETH = utils.isETH(utils.L2_ETH_TOKEN_ADDRESS); // true
 */
export function isETH(token: Address): boolean {
  return (
    token.toLowerCase() === ETH_ADDRESS ||
    token.toLowerCase() === L2_ETH_TOKEN_ADDRESS
  );
}

/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param millis The number of milliseconds to pause execution.
 *
 * @example
 *
 * await sleep(1_000);
 */
export function sleep(millis: number): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Returns the default settings for L1 transactions.
 */
export function layer1TxDefaults(): {
  queueType: PriorityQueueType.Deque;
  opTree: PriorityOpTree.Full;
} {
  return {
    queueType: PriorityQueueType.Deque,
    opTree: PriorityOpTree.Full,
  };
}

/**
 * Returns a `keccak` encoded message with a given sender address and block number from the L1 messenger contract.
 *
 * @param sender The sender of the message on L2.
 * @param msg The encoded message.
 * @param txNumberInBlock The index of the transaction in the block.
 * @returns The hashed `L2->L1` message.
 *
 * @example
 *
 * const withdrawETHMessage = "0x6c0960f936615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000000000000000000000000000000000001a13b8600";
 * const withdrawETHMessageHash = utils.getHashedL2ToL1Msg("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049", withdrawETHMessage, 0);
 * // withdrawETHMessageHash = "0xd8c80ecb64619e343f57c3b133c6c6d8dd0572dd3488f1ca3276c5b7fd3a938d"
 */
export function getHashedL2ToL1Msg(
  sender: Address,
  msg: BytesLike,
  txNumberInBlock: number
): string {
  const encodedMsg = new Uint8Array([
    0, // l2ShardId
    1, // isService
    ...ethers.utils.zeroPad(ethers.utils.hexlify(txNumberInBlock), 2),
    ...ethers.utils.arrayify(L1_MESSENGER_ADDRESS),
    ...ethers.utils.zeroPad(sender, 32),
    ...ethers.utils.arrayify(ethers.utils.keccak256(msg)),
  ]);

  return ethers.utils.keccak256(encodedMsg);
}

/**
 * Returns a log containing details of all deployed contracts related to a transaction receipt.
 *
 * @param receipt The transaction receipt containing deployment information.
 *
 * @example
 *
 *
 */
export function getDeployedContracts(
  receipt: ethers.providers.TransactionReceipt
): DeploymentInfo[] {
  const addressBytesLen = 40;
  return (
    receipt.logs
      .filter(
        log =>
          log.topics[0] ===
            utils.id('ContractDeployed(address,bytes32,address)') &&
          log.address === CONTRACT_DEPLOYER_ADDRESS
      )
      // Take the last topic (deployed contract address as U256) and extract address from it (U160).
      .map(log => {
        const sender = `0x${log.topics[1].slice(
          log.topics[1].length - addressBytesLen
        )}`;
        const bytecodeHash = log.topics[2];
        const address = `0x${log.topics[3].slice(
          log.topics[3].length - addressBytesLen
        )}`;
        return {
          sender: utils.getAddress(sender),
          bytecodeHash: bytecodeHash,
          deployedAddress: utils.getAddress(address),
        };
      })
  );
}

/**
 * Generates a future-proof contract address using a salt plus bytecode, allowing the determination of an address before deployment.
 *
 * @param sender The sender's address.
 * @param bytecodeHash The hash of the bytecode, typically the output from `zkSolc`.
 * @param salt A randomization element used to create the contract address.
 * @param input The ABI-encoded constructor arguments, if any.
 *
 * @remarks The implementation of `create2Address` in zkSync Era may differ slightly from Ethereum.
 *
 * @example
 *
 * const address = utils.create2Address("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049", "0x010001cb6a6e8d5f6829522f19fa9568660e0a9cd53b2e8be4deb0a679452e41", "0x01", "0x01");
 * // address = "0x29bac3E5E8FFE7415F97C956BFA106D70316ad50"
 */
export function create2Address(
  sender: Address,
  bytecodeHash: BytesLike,
  salt: BytesLike,
  input: BytesLike = ''
): string {
  const prefix = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('zksyncCreate2')
  );
  const inputHash = ethers.utils.keccak256(input);
  const addressBytes = ethers.utils
    .keccak256(
      ethers.utils.concat([
        prefix,
        ethers.utils.zeroPad(sender, 32),
        salt,
        bytecodeHash,
        inputHash,
      ])
    )
    .slice(26);
  return ethers.utils.getAddress(addressBytes);
}

/**
 * Generates a contract address from the deployer's account and nonce.
 *
 * @param sender The address of the deployer's account.
 * @param senderNonce The nonce of the deployer's account.
 *
 * @example
 *
 * const address = utils.createAddress("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049", 1);
 * // address = "0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021"
 */
export function createAddress(
  sender: Address,
  senderNonce: BigNumberish
): string {
  const prefix = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('zksyncCreate')
  );
  const addressBytes = ethers.utils
    .keccak256(
      ethers.utils.concat([
        prefix,
        ethers.utils.zeroPad(sender, 32),
        ethers.utils.zeroPad(ethers.utils.hexlify(senderNonce), 32),
      ])
    )
    .slice(26);

  return ethers.utils.getAddress(addressBytes);
}

/**
 * Checks if the transaction's base cost is greater than the provided value, which covers the transaction's cost.
 *
 * @param baseCost The base cost of the transaction.
 * @param value The value covering the transaction's cost.
 * @throws {Error} The base cost must be greater than the provided value.
 *
 * @example
 *
 * const baseCost = BigNumber.from(100);
 * const value = 99;
 * try {
 *   await utils.checkBaseCost(baseCost, value);
 * } catch (e) {
 *   // e.message = `The base cost of performing the priority operation is higher than the provided value parameter for the transaction: baseCost: ${baseCost}, provided value: ${value}`,
 * }
 */
export async function checkBaseCost(
  baseCost: ethers.BigNumber,
  value: ethers.BigNumberish | Promise<ethers.BigNumberish>
): Promise<void> {
  if (baseCost.gt(await value)) {
    throw new Error(
      'The base cost of performing the priority operation is higher than the provided value parameter ' +
        `for the transaction: baseCost: ${baseCost}, provided value: ${value}!`
    );
  }
}

/**
 * Serializes an EIP712 transaction and includes a signature if provided.
 *
 * @param transaction The transaction that needs to be serialized.
 * @param signature Ethers signature to be included in the transaction.
 * @throws {Error} Throws an error if:
 * - `transaction.customData.customSignature` is an empty string. The transaction should be signed, and the `transaction.customData.customSignature` field should be populated with the signature. It should not be specified if the transaction is not signed.
 * - `transaction.chainId` is not provided.
 * - `transaction.from` is not provided.
 *
 * @example Serialize EIP712 transaction without signature.
 *
 * const serializedTx = utils.serialize({ chainId: 270, from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049" }, null);
 *
 * // serializedTx = "0x71ea8080808080808082010e808082010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0"
 *
 * @example Serialize EIP712 transaction with signature.
 *
 * const signature = ethers.utils.splitSignature("0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aaf87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a");
 *
 * const serializedTx = utils.serialize(
 *   {
 *     chainId: 270,
 *     from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
 *     to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
 *     value: 1_000_000,
 *   },
 *   signature
 * );
 * // serializedTx = "0x71f87f8080808094a61464658afeaf65cccaafd3a512b69a83b77618830f42408001a073a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aa02f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a82010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0"
 */
export function serialize(
  transaction: ethers.providers.TransactionRequest,
  signature?: SignatureLike
): string {
  if (!transaction.customData && transaction.type !== EIP712_TX_TYPE) {
    return utils.serializeTransaction(
      transaction as ethers.PopulatedTransaction,
      signature
    );
  }
  if (!transaction.chainId) {
    throw Error("Transaction chainId isn't set!");
  }

  function formatNumber(value: BigNumberish, name: string): Uint8Array {
    const result = utils.stripZeros(BigNumber.from(value).toHexString());
    if (result.length > 32) {
      throw new Error(`Invalid length for ${name}!`);
    }
    return result;
  }

  if (!transaction.from) {
    throw new Error(
      'Explicitly providing `from` field is required for EIP712 transactions!'
    );
  }
  const from = transaction.from;

  const meta: Eip712Meta = transaction.customData ?? {};

  const maxFeePerGas = transaction.maxFeePerGas || transaction.gasPrice || 0;
  const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || maxFeePerGas;

  const fields: any[] = [
    formatNumber(transaction.nonce || 0, 'nonce'),
    formatNumber(maxPriorityFeePerGas, 'maxPriorityFeePerGas'),
    formatNumber(maxFeePerGas, 'maxFeePerGas'),
    formatNumber(transaction.gasLimit || 0, 'gasLimit'),
    transaction.to ? utils.getAddress(transaction.to) : '0x',
    formatNumber(transaction.value || 0, 'value'),
    transaction.data || '0x',
  ];

  if (signature) {
    const sig = utils.splitSignature(signature);
    fields.push(formatNumber(sig.recoveryParam, 'recoveryParam'));
    fields.push(utils.stripZeros(sig.r));
    fields.push(utils.stripZeros(sig.s));
  } else {
    fields.push(formatNumber(transaction.chainId, 'chainId'));
    fields.push('0x');
    fields.push('0x');
  }
  fields.push(formatNumber(transaction.chainId, 'chainId'));
  fields.push(utils.getAddress(from));

  // Add meta
  fields.push(
    formatNumber(
      meta.gasPerPubdata || DEFAULT_GAS_PER_PUBDATA_LIMIT,
      'gasPerPubdata'
    )
  );
  fields.push((meta.factoryDeps ?? []).map(dep => utils.hexlify(dep)));

  if (
    meta.customSignature &&
    ethers.utils.arrayify(meta.customSignature).length === 0
  ) {
    throw new Error('Empty signatures are not supported!');
  }
  fields.push(meta.customSignature || '0x');

  if (meta.paymasterParams) {
    fields.push([
      meta.paymasterParams.paymaster,
      ethers.utils.hexlify(meta.paymasterParams.paymasterInput),
    ]);
  } else {
    fields.push([]);
  }

  return utils.hexConcat([[EIP712_TX_TYPE], utils.RLP.encode(fields)]);
}

/**
 * Returns the hash of the given bytecode.
 *
 * @param bytecode The bytecode to hash.
 *
 * @example
 *
 * const bytecode =
 *   "0x000200000000000200010000000103550000006001100270000000130010019d0000008001000039000000400010043f0000000101200190000000290000c13d0000000001000031000000040110008c000000420000413d0000000101000367000000000101043b000000e001100270000000150210009c000000310000613d000000160110009c000000420000c13d0000000001000416000000000110004c000000420000c13d000000040100008a00000000011000310000001702000041000000200310008c000000000300001900000000030240190000001701100197000000000410004c000000000200a019000000170110009c00000000010300190000000001026019000000000110004c000000420000c13d00000004010000390000000101100367000000000101043b000000000010041b0000000001000019000000490001042e0000000001000416000000000110004c000000420000c13d0000002001000039000001000010044300000120000004430000001401000041000000490001042e0000000001000416000000000110004c000000420000c13d000000040100008a00000000011000310000001702000041000000000310004c000000000300001900000000030240190000001701100197000000000410004c000000000200a019000000170110009c00000000010300190000000001026019000000000110004c000000440000613d00000000010000190000004a00010430000000000100041a000000800010043f0000001801000041000000490001042e0000004800000432000000490001042e0000004a00010430000000000000000000000000000000000000000000000000000000000000000000000000ffffffff0000000200000000000000000000000000000040000001000000000000000000000000000000000000000000000000000000000000000000000000006d4ce63c0000000000000000000000000000000000000000000000000000000060fe47b18000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000080000000000000000000000000000000000000000000000000000000000000000000000000000000009c8c8fa789967eb514f3ec9def748480945cc9b10fcbd1a19597d924eb201083";
 * const hashedBytecode = utils.hashBytecode(bytecode);
 * /*
 * hashedBytecode =  new Uint8Array([
 *     1, 0, 0, 27, 57, 231, 154, 55, 0, 164, 201, 96, 244, 120, 23, 112, 54, 34, 224, 133,
 *     160, 122, 88, 164, 112, 80, 0, 134, 48, 138, 74, 16,
 *   ]),
 * );
 * *\/
 */
export function hashBytecode(bytecode: ethers.BytesLike): Uint8Array {
  // For getting the consistent length we first convert the bytecode to UInt8Array
  const bytecodeAsArray = ethers.utils.arrayify(bytecode);

  if (bytecodeAsArray.length % 32 !== 0) {
    throw new Error('The bytecode length in bytes must be divisible by 32!');
  }

  if (bytecodeAsArray.length > MAX_BYTECODE_LEN_BYTES) {
    throw new Error(
      `Bytecode can not be longer than ${MAX_BYTECODE_LEN_BYTES} bytes!`
    );
  }

  const hashStr = ethers.utils.sha256(bytecodeAsArray);
  const hash = ethers.utils.arrayify(hashStr);

  // Note that the length of the bytecode
  // should be provided in 32-byte words.
  const bytecodeLengthInWords = bytecodeAsArray.length / 32;
  if (bytecodeLengthInWords % 2 === 0) {
    throw new Error('Bytecode length in 32-byte words must be odd!');
  }

  const bytecodeLength = ethers.utils.arrayify(bytecodeLengthInWords);

  // The bytecode should always take the first 2 bytes of the bytecode hash,
  // so we pad it from the left in case the length is smaller than 2 bytes.
  const bytecodeLengthPadded = ethers.utils.zeroPad(bytecodeLength, 2);

  const codeHashVersion = new Uint8Array([1, 0]);
  hash.set(codeHashVersion, 0);
  hash.set(bytecodeLengthPadded, 2);

  return hash;
}

/**
 * Parses an EIP712 transaction from a payload.
 *
 * @param payload The payload to parse.
 *
 * @example
 *
 * import { types } from "zksync-ethers";
 *
 * const serializedTx =
 *   "0x71f87f8080808094a61464658afeaf65cccaafd3a512b69a83b77618830f42408001a073a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aa02f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a82010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0";
 * const tx: types.TransactionLike = utils.parseTransaction(serializedTx);
 * /*
 * const tx = {
 *     type: 113,
 *     nonce: 0,
 *     maxPriorityFeePerGas: BigNumber.from(0),
 *     maxFeePerGas: BigNumber.from(0),
 *     gasLimit: BigNumber.from(0),
 *     to: RECEIVER,
 *     value: BigNumber.from(1000000),
 *     data: '0x',
 *     chainId: BigNumber.from(270),
 *     from: ADDRESS,
 *     customData: {
 *     gasPerPubdata: BigNumber.from(50000),
 *     factoryDeps: [],
 *     customSignature: '0x',
 *     paymasterParams: undefined,
 *   },
 *   hash: '0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee',
 * };
 * *\/
 */
export function parseTransaction(
  payload: ethers.BytesLike
): ethers.Transaction {
  function handleAddress(value: string): string | null {
    if (value === '0x') {
      return null;
    }
    return utils.getAddress(value);
  }

  function handleNumber(value: string): BigNumber {
    if (value === '0x') {
      return BigNumber.from(0);
    }
    return BigNumber.from(value);
  }

  function arrayToPaymasterParams(arr: string[]): PaymasterParams | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    if (arr.length !== 2) {
      throw new Error(
        `Invalid paymaster parameters, expected to have length of 2, found ${arr.length}!`
      );
    }

    return {
      paymaster: utils.getAddress(arr[0]),
      paymasterInput: utils.arrayify(arr[1]),
    };
  }

  const bytes = utils.arrayify(payload);
  if (bytes[0] !== EIP712_TX_TYPE) {
    return utils.parseTransaction(bytes);
  }

  const raw = utils.RLP.decode(bytes.slice(1));
  const transaction: any = {
    type: EIP712_TX_TYPE,
    nonce: handleNumber(raw[0]).toNumber(),
    maxPriorityFeePerGas: handleNumber(raw[1]),
    maxFeePerGas: handleNumber(raw[2]),
    gasLimit: handleNumber(raw[3]),
    to: handleAddress(raw[4]),
    value: handleNumber(raw[5]),
    data: raw[6],
    chainId: handleNumber(raw[10]),
    from: handleAddress(raw[11]),
    customData: {
      gasPerPubdata: handleNumber(raw[12]),
      factoryDeps: raw[13],
      customSignature: raw[14],
      paymasterParams: arrayToPaymasterParams(raw[15]),
    },
  };

  const ethSignature = {
    v: handleNumber(raw[7]).toNumber(),
    r: raw[8],
    s: raw[9],
  };

  if (
    (utils.hexlify(ethSignature.r) === '0x' ||
      utils.hexlify(ethSignature.s) === '0x') &&
    !transaction.customData.customSignature
  ) {
    return transaction;
  }

  if (
    ethSignature.v !== 0 &&
    ethSignature.v !== 1 &&
    !transaction.customData.customSignature
  ) {
    throw new Error('Failed to parse signature!');
  }

  if (!transaction.customData.customSignature) {
    transaction.v = ethSignature.v;
    transaction.s = ethSignature.s;
    transaction.r = ethSignature.r;
  }

  transaction.hash = eip712TxHash(transaction, ethSignature);

  return transaction;
}

function getSignature(
  transaction: any,
  ethSignature?: EthereumSignature
): Uint8Array {
  if (
    transaction?.customData?.customSignature &&
    transaction.customData.customSignature.length
  ) {
    return ethers.utils.arrayify(transaction.customData.customSignature);
  }

  if (!ethSignature) {
    throw new Error('No signature provided!');
  }

  const r = ethers.utils.zeroPad(ethers.utils.arrayify(ethSignature.r), 32);
  const s = ethers.utils.zeroPad(ethers.utils.arrayify(ethSignature.s), 32);
  const v = ethSignature.v;

  return new Uint8Array([...r, ...s, v]);
}

/**
 * Returns the hash of an EIP712 transaction.
 *
 * @param transaction The EIP-712 transaction.
 * @param ethSignature The ECDSA signature of the transaction.
 *
 * @example
 *
 *
 */
function eip712TxHash(
  transaction: any,
  ethSignature?: EthereumSignature
): string {
  const signedDigest = EIP712Signer.getSignedDigest(transaction);
  const hashedSignature = ethers.utils.keccak256(
    getSignature(transaction, ethSignature)
  );

  return ethers.utils.keccak256(
    ethers.utils.hexConcat([signedDigest, hashedSignature])
  );
}

/**
 * Returns the hash of the L2 priority operation from a given transaction receipt and L2 address.
 *
 * @param txReceipt The receipt of the L1 transaction.
 * @param zkSyncAddress The address of the zkSync Era main contract.
 *
 * @example
 */
export function getL2HashFromPriorityOp(
  txReceipt: ethers.providers.TransactionReceipt,
  zkSyncAddress: Address
): string {
  let txHash: string | null = null;
  for (const log of txReceipt.logs) {
    if (log.address.toLowerCase() !== zkSyncAddress.toLowerCase()) {
      continue;
    }

    try {
      const priorityQueueLog = ZKSYNC_MAIN_ABI.parseLog(log);
      if (priorityQueueLog && priorityQueueLog.args.txHash) {
        txHash = priorityQueueLog.args.txHash;
      }
    } catch {
      // skip
    }
  }
  if (!txHash) {
    throw new Error('Failed to parse tx logs!');
  }

  return txHash;
}

const ADDRESS_MODULO = BigNumber.from(2).pow(160);

/**
 * Converts the address that submitted a transaction to the inbox on L1 to the `msg.sender` viewed on L2.
 * Returns the `msg.sender` of the `L1->L2` transaction as the address of the contract that initiated the transaction.
 *
 * All available cases:
 * - During a normal transaction, if contract `A` calls contract `B`, the `msg.sender` is `A`.
 * - During `L1->L2` communication, if an EOA `X` calls contract `B`, the `msg.sender` is `X`.
 * - During `L1->L2` communication, if a contract `A` calls contract `B`, the `msg.sender` is `applyL1ToL2Alias(A)`.
 *
 * @param address The address of the contract.
 * @returns The transformed address representing the `msg.sender` on L2.
 *
 * @see
 * {@link undoL1ToL2Alias}.
 *
 * @example
 *
 * const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb";
 * const l2ContractAddress = utils.applyL1ToL2Alias(l1ContractAddress);
 * // l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC"
 *
 */
export function applyL1ToL2Alias(address: string): string {
  return ethers.utils.hexlify(
    ethers.BigNumber.from(address)
      .add(L1_TO_L2_ALIAS_OFFSET)
      .mod(ADDRESS_MODULO)
  );
}

/**
 * Converts and returns the `msg.sender` viewed on L2 to the address that submitted a transaction to the inbox on L1.
 *
 * @param address The sender address viewed on L2.
 *
 * @see
 * {@link applyL1ToL2Alias}.
 *
 * @example
 *
 * const l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC";
 * const l1ContractAddress = utils.undoL1ToL2Alias(l2ContractAddress);
 * // const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb"
 */
export function undoL1ToL2Alias(address: string): string {
  let result = ethers.BigNumber.from(address).sub(L1_TO_L2_ALIAS_OFFSET);
  if (result.lt(BigNumber.from(0))) {
    result = result.add(ADDRESS_MODULO);
  }

  return ethers.utils.hexlify(result);
}

/**
 * Returns the data needed for correct initialization of an L1 token counterpart on L2.
 *
 * @param l1TokenAddress The token address on L1.
 * @param provider The client that is able to work with contracts on a read-write basis.
 * @returns The encoded bytes which contains token name, symbol and decimals.
 */
export async function getERC20DefaultBridgeData(
  l1TokenAddress: string,
  provider: ethers.providers.Provider
): Promise<string> {
  const token = IERC20Factory.connect(l1TokenAddress, provider);

  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();

  const coder = new AbiCoder();

  const nameBytes = coder.encode(['string'], [name]);
  const symbolBytes = coder.encode(['string'], [symbol]);
  const decimalsBytes = coder.encode(['uint256'], [decimals]);

  return coder.encode(
    ['bytes', 'bytes', 'bytes'],
    [nameBytes, symbolBytes, decimalsBytes]
  );
}

/**
 * Returns the calldata sent by an L1 ERC20 bridge to its L2 counterpart during token bridging.
 *
 * @param l1TokenAddress The token address on L1.
 * @param l1Sender The sender address on L1.
 * @param l2Receiver The recipient address on L2.
 * @param amount The gas fee for the number of tokens to bridge.
 * @param bridgeData Additional bridge data.
 *
 * @example
 *
 *
 */
export async function getERC20BridgeCalldata(
  l1TokenAddress: string,
  l1Sender: string,
  l2Receiver: string,
  amount: BigNumberish,
  bridgeData: BytesLike
): Promise<string> {
  return L2_BRIDGE_ABI.encodeFunctionData('finalizeDeposit', [
    l1Sender,
    l2Receiver,
    l1TokenAddress,
    amount,
    bridgeData,
  ]);
}

/**
 * Validates signatures from non-contract account addresses (EOA).
 * Provides similar functionality to `ethers.js` but returns `true`
 * if the validation process succeeds, otherwise returns `false`.
 *
 * Called from {@link isSignatureCorrect} for non-contract account addresses.
 *
 * @param address The address which signs the `msgHash`.
 * @param msgHash The hash of the message.
 * @param signature The Ethers signature.
 *
 * @example
 *
 * import { Wallet, utils } from "zksync-ethers";
 *
 * const ADDRESS = "<WALLET_ADDRESS>";
 * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
 *
 * const message = "Hello, world!";
 * const signature = await new Wallet(PRIVATE_KEY).signMessage(message);
 * // ethers.Wallet can be used as well
 * // const signature =  await new ethers.Wallet(PRIVATE_KEY).signMessage(message);
 *
 * const isValidSignature = await utils.isECDSASignatureCorrect(ADDRESS, message, signature);
 * // isValidSignature = true
 */
function isECDSASignatureCorrect(
  address: string,
  msgHash: string,
  signature: SignatureLike
): boolean {
  try {
    return address === ethers.utils.recoverAddress(msgHash, signature);
  } catch {
    // In case ECDSA signature verification has thrown an error,
    // we simply consider the signature as incorrect.
    return false;
  }
}

/**
 * Called from {@link isSignatureCorrect} for contract account addresses.
 * The function returns `true` if the validation process results
 * in the {@link EIP1271_MAGIC_VALUE}.
 *
 * @param provider The provider.
 * @param address The sender address.
 * @param msgHash The hash of the message.
 * @param signature The Ethers signature.
 *
 * @see
 * {@link isMessageSignatureCorrect} and {@link isTypedDataSignatureCorrect} to validate signatures.
 *
 * @example
 *
 */
async function isEIP1271SignatureCorrect(
  provider: Provider,
  address: string,
  msgHash: string,
  signature: SignatureLike
): Promise<boolean> {
  const accountContract = new ethers.Contract(address, IERC1271, provider);

  // This line may throw an exception if the contract does not implement the EIP1271 correctly.
  // But it may also throw an exception in case the internet connection is lost.
  // It is the caller's responsibility to handle the exception.
  const result = await accountContract.isValidSignature(msgHash, signature);

  return result === EIP1271_MAGIC_VALUE;
}

/**
 * Called from {@link isMessageSignatureCorrect} and {@link isTypedDataSignatureCorrect}.
 * Returns whether the account abstraction signature is correct.
 * Signature can be created using EIP1271 or ECDSA.
 *
 * @param provider The provider.
 * @param address The sender address.
 * @param msgHash The hash of the message.
 * @param signature The Ethers signature.
 */
async function isSignatureCorrect(
  provider: Provider,
  address: string,
  msgHash: string,
  signature: SignatureLike
): Promise<boolean> {
  let isContractAccount = false;

  const code = await provider.getCode(address);
  isContractAccount = ethers.utils.arrayify(code).length !== 0;

  if (!isContractAccount) {
    return isECDSASignatureCorrect(address, msgHash, signature);
  } else {
    return await isEIP1271SignatureCorrect(
      provider,
      address,
      msgHash,
      signature
    );
  }
}

/**
 * Returns whether the account abstraction message signature is correct.
 * Signature can be created using EIP1271 or ECDSA.
 *
 * @param provider The provider.
 * @param address The sender address.
 * @param message The hash of the message.
 * @param signature The Ethers signature.
 *
 * @example
 *
 * import { Wallet, utils, Provider } from "zksync-ethers";
 *
 * const ADDRESS = "<WALLET_ADDRESS>";
 * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const message = "Hello, world!";
 * const signature = await new Wallet(PRIVATE_KEY).signMessage(message);
 * // ethers.Wallet can be used as well
 * // const signature =  await new ethers.Wallet(PRIVATE_KEY).signMessage(message);
 *
 * const isValidSignature = await utils.isMessageSignatureCorrect(provider, ADDRESS, message, signature);
 * // isValidSignature = true
 */
export async function isMessageSignatureCorrect(
  provider: Provider,
  address: string,
  message: ethers.Bytes | string,
  signature: SignatureLike
): Promise<boolean> {
  const msgHash = ethers.utils.hashMessage(message);
  return await isSignatureCorrect(provider, address, msgHash, signature);
}

/**
 * Returns whether the account abstraction EIP712 signature is correct.
 *
 * @param provider The provider.
 * @param address The sender address.
 * @param domain The domain data.
 * @param types A map of records pointing from field name to field type.
 * @param value A single record value.
 * @param signature The Ethers signature.
 *
 * @example
 *
 * import { Wallet, utils, Provider, EIP712Signer } from "zksync-ethers";
 *
 * const ADDRESS = "<WALLET_ADDRESS>";
 * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const tx: types.TransactionRequest = {
 *   type: 113,
 *   chainId: 270,
 *   from: ADDRESS,
 *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
 *   value: BigNumber.from(7_000_000),
 * };
 *
 * const eip712Signer = new EIP712Signer(
 *   new Wallet(PRIVATE_KEY), // or new ethers.Wallet(PRIVATE_KEY),
 *   Number((await provider.getNetwork()).chainId)
 * );
 *
 * const signature = await eip712Signer.sign(tx);
 *
 * const isValidSignature = await utils.isTypedDataSignatureCorrect(provider, ADDRESS, await eip712Signer.getDomain(), utils.EIP712_TYPES, EIP712Signer.getSignInput(tx), signature);
 * // isValidSignature = true
 */
export async function isTypedDataSignatureCorrect(
  provider: Provider,
  address: string,
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, any>,
  signature: SignatureLike
): Promise<boolean> {
  const msgHash = ethers.utils._TypedDataEncoder.hash(domain, types, value);
  return await isSignatureCorrect(provider, address, msgHash, signature);
}

/**
 * Returns an estimation of the L2 gas required for token bridging via the default ERC20 bridge.
 *
 * @param providerL1 The Ethers provider for the L1 network.
 * @param providerL2 The zkSync provider for the L2 network.
 * @param token The address of the token to be bridged.
 * @param amount The deposit amount.
 * @param to The recipient address on the L2 network.
 * @param from The sender address on the L1 network.
 * @param gasPerPubdataByte The current gas per byte of pubdata.
 *
 * @see
 * {@link https://docs.zksync.io/build/developer-reference/bridging-asset.html#default-bridges Default bridges documentation}.
 *
 * @example
 *
 *
 */
export async function estimateDefaultBridgeDepositL2Gas(
  providerL1: ethers.providers.Provider,
  providerL2: Provider,
  token: Address,
  amount: BigNumberish,
  to: Address,
  from?: Address,
  gasPerPubdataByte?: BigNumberish
): Promise<BigNumber> {
  // If the `from` address is not provided, we use a random address, because
  // due to storage slot aggregation, the gas estimation will depend on the address
  // and so estimation for the zero address may be smaller than for the sender.
  from ??= ethers.Wallet.createRandom().address;

  if (token === ETH_ADDRESS) {
    return await providerL2.estimateL1ToL2Execute({
      contractAddress: to,
      gasPerPubdataByte: gasPerPubdataByte,
      caller: from,
      calldata: '0x',
      l2Value: amount,
    });
  } else {
    let value, l1BridgeAddress, l2BridgeAddress, bridgeData;
    const bridgeAddresses = await providerL2.getDefaultBridgeAddresses();
    const l1WethBridge = IL1BridgeFactory.connect(
      bridgeAddresses.wethL1!,
      providerL1
    );
    let l2WethToken = ethers.constants.AddressZero;
    try {
      l2WethToken = await l1WethBridge.l2TokenAddress(token);
    } catch (e) {
      // skip
    }

    if (l2WethToken !== ethers.constants.AddressZero) {
      value = amount;
      l1BridgeAddress = bridgeAddresses.wethL1;
      l2BridgeAddress = bridgeAddresses.wethL2;
      bridgeData = '0x';
    } else {
      value = 0;
      l1BridgeAddress = bridgeAddresses.erc20L1;
      l2BridgeAddress = bridgeAddresses.erc20L2;
      bridgeData = await getERC20DefaultBridgeData(token, providerL1);
    }

    return await estimateCustomBridgeDepositL2Gas(
      providerL2,
      l1BridgeAddress!,
      l2BridgeAddress!,
      token,
      amount,
      to,
      bridgeData,
      from,
      gasPerPubdataByte,
      value
    );
  }
}

/**
 * Scales the provided gas limit using a coefficient to ensure acceptance of L1->L2 transactions.
 *
 * This function adjusts the gas limit by multiplying it with a coefficient calculated from the
 * `L1_FEE_ESTIMATION_COEF_NUMERATOR` and `L1_FEE_ESTIMATION_COEF_DENOMINATOR` constants.
 *
 * @param gasLimit - The gas limit to be scaled.
 *
 * @example
 *
 * const scaledGasLimit = utils.scaleGasLimit(10_000);
 * // scaledGasLimit = 12_000
 */
export function scaleGasLimit(gasLimit: BigNumber): BigNumber {
  return gasLimit
    .mul(L1_FEE_ESTIMATION_COEF_NUMERATOR)
    .div(L1_FEE_ESTIMATION_COEF_DENOMINATOR);
}

/**
 * Returns an estimation of the L2 gas required for token bridging via the custom ERC20 bridge.
 *
 * @param providerL2 The zkSync provider for the L2 network.
 * @param l1BridgeAddress The address of the custom L1 bridge.
 * @param l2BridgeAddress The address of the custom L2 bridge.
 * @param token The address of the token to be bridged.
 * @param amount The deposit amount.
 * @param to The recipient address on the L2 network.
 * @param bridgeData Additional bridge data.
 * @param from The sender address on the L1 network.
 * @param gasPerPubdataByte The current gas per byte of pubdata.
 * @param l2Value The `msg.value` of L2 transaction.
 *
 * @see
 * {@link https://docs.zksync.io/build/developer-reference/bridging-asset.html#custom-bridges-on-l1-and-l2 Custom bridges documentation}.
 *
 * @example
 *
 *
 */
export async function estimateCustomBridgeDepositL2Gas(
  providerL2: Provider,
  l1BridgeAddress: Address,
  l2BridgeAddress: Address,
  token: Address,
  amount: BigNumberish,
  to: Address,
  bridgeData: BytesLike,
  from?: Address,
  gasPerPubdataByte?: BigNumberish,
  l2Value?: BigNumberish
): Promise<BigNumber> {
  const calldata = await getERC20BridgeCalldata(
    token,
    from!,
    to,
    amount,
    bridgeData
  );
  return await providerL2.estimateL1ToL2Execute({
    caller: applyL1ToL2Alias(l1BridgeAddress),
    contractAddress: l2BridgeAddress,
    gasPerPubdataByte,
    calldata,
    l2Value,
  });
}

/**
 * Creates a JSON string from an object, including support for serializing bigint types.
 *
 * @param object The object to serialize to JSON.
 */
export function toJSON(object: any): string {
  return JSON.stringify(object, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString(); // Convert BigInt to string
    }
    return value;
  });
}
