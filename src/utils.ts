import {
  AbiCoder,
  BigNumberish,
  BytesLike,
  ethers,
  SignatureLike,
  resolveProperties,
} from 'ethers';
import {
  Address,
  DeploymentInfo,
  Eip712Meta,
  EthereumSignature,
  PaymasterParams,
  PriorityOpTree,
  PriorityQueueType,
  Transaction,
  TransactionLike,
  TransactionReceipt,
  TransactionRequest,
} from './types';
import {Provider} from './provider';
import {EIP712Signer} from './signer';
import {IERC20__factory, IL1NativeTokenVault} from './typechain';
import IZkSyncABI from '../abi/IZkSyncHyperchain.json';
import IBridgehubABI from '../abi/IBridgehub.json';
import IContractDeployerABI from '../abi/IContractDeployer.json';
import Contract2FactoryABI from '../abi/Contract2Factory.json';
import IL1MessengerABI from '../abi/IL1Messenger.json';
import IERC20ABI from '../abi/IERC20.json';
import IERC1271ABI from '../abi/IERC1271.json';
import IL1BridgeABI from '../abi/IL1ERC20Bridge.json';
import IL2BridgeABI from '../abi/IL2Bridge.json';
import INonceHolderABI from '../abi/INonceHolder.json';

export * from './paymaster-utils';
export * from './smart-account-utils';
export {EIP712_TYPES} from './signer';

/**
 * The ABI for the `ZKsync` interface.
 * @readonly
 */
export const ZKSYNC_MAIN_ABI = new ethers.Interface(IZkSyncABI);

/**
 * The ABI of the `Bridgehub` interface.
 * @readonly
 */
export const BRIDGEHUB_ABI = new ethers.Interface(IBridgehubABI);

/**
 * The ABI for the `IContractDeployer` interface, which is utilized for deploying smart contracts.
 * @readonly
 */
export const CONTRACT_DEPLOYER = new ethers.Interface(IContractDeployerABI);

/**
 * The ABI for the `Contract2Factory` interface, which is utilized for deploying smart contracts using CREATE2 and CREATE2ACCOUNT.
 * @readonly
 */
export const CONTRACT_2_FACTORY = new ethers.Interface(Contract2FactoryABI);

/**
 * The ABI for the `IL1Messenger` interface, which is utilized for sending messages from the L2 to L1.
 * @readonly
 */
export const L1_MESSENGER = new ethers.Interface(IL1MessengerABI);

/**
 * The ABI for the `IERC20` interface, which is utilized for interacting with ERC20 tokens.
 * @readonly
 */
export const IERC20 = new ethers.Interface(IERC20ABI);

/**
 * The ABI for the `IERC1271` interface, which is utilized for signature validation by contracts.
 * @readonly
 */
export const IERC1271 = new ethers.Interface(IERC1271ABI);

/**
 * The ABI for the `IL1Bridge` interface, which is utilized for transferring ERC20 tokens from L1 to L2.
 * @readonly
 */
export const L1_BRIDGE_ABI = new ethers.Interface(IL1BridgeABI);

/**
 * The ABI for the `IL2Bridge` interface, which is utilized for transferring ERC20 tokens from L2 to L1.
 * @readonly
 */
export const L2_BRIDGE_ABI = new ethers.Interface(IL2BridgeABI);

/**
 * The ABI for the `INonceHolder` interface, which is utilized for managing deployment nonces.
 * @readonly
 */
export const NONCE_HOLDER_ABI = new ethers.Interface(INonceHolderABI);

/**
 * The address of the L1 `ETH` token.
 * @readonly
 */
export const ETH_ADDRESS: Address =
  '0x0000000000000000000000000000000000000000';

/**
 * The address of the L1 `ETH` token.
 * @readonly
 */
export const LEGACY_ETH_ADDRESS: Address =
  '0x0000000000000000000000000000000000000000';

/**
 * In the contracts the zero address can not be used, use one instead
 * @readonly
 */
export const ETH_ADDRESS_IN_CONTRACTS: Address =
  '0x0000000000000000000000000000000000000001';

/**
 * The formal address for the `Bootloader`.
 * @readonly
 */
export const BOOTLOADER_FORMAL_ADDRESS: Address =
  '0x0000000000000000000000000000000000008001';

/**
 * The address of the Contract deployer.
 * @readonly
 */
export const CONTRACT_DEPLOYER_ADDRESS: Address =
  '0x0000000000000000000000000000000000008006';

/**
 * The address of the Contract2Factory.
 * @readonly
 */
export const CONTRACT_2_FACTORY_ADDRESS: Address =
  '0x0000000000000000000000000000000000010000';

/**
 * The address of the L1 messenger.
 * @readonly
 */
export const L1_MESSENGER_ADDRESS: Address =
  '0x0000000000000000000000000000000000008008';

/**
 * The address of the L2 `ETH` token.
 * @readonly
 * @deprecated In favor of {@link L2_BASE_TOKEN_ADDRESS}.
 */
export const L2_ETH_TOKEN_ADDRESS: Address =
  '0x000000000000000000000000000000000000800a';

/**
 * The address of the base token.
 * @readonly
 */
export const L2_BASE_TOKEN_ADDRESS =
  '0x000000000000000000000000000000000000800a';

/**
 * The address of the Nonce holder.
 * @readonly
 */
export const NONCE_HOLDER_ADDRESS: Address =
  '0x0000000000000000000000000000000000008003';

/**
 * Used for applying and undoing aliases on addresses during bridging from L1 to L2.
 * @readonly
 */
export const L1_TO_L2_ALIAS_OFFSET: Address =
  '0x1111000000000000000000000000000000001111';

export const L2_ASSET_ROUTER_ADDRESS: Address =
  '0x0000000000000000000000000000000000010003';

export const L2_NATIVE_TOKEN_VAULT_ADDRESS: Address =
  '0x0000000000000000000000000000000000010004';

/**
 * The EIP1271 magic value used for signature validation in smart contracts.
 * This predefined constant serves as a standardized indicator to signal successful
 * signature validation by the contract.
 *
 * @readonly
 */
export const EIP1271_MAGIC_VALUE = '0x1626ba7e';

/**
 * Represents an EIP712 transaction type.
 *
 * @readonly
 */
export const EIP712_TX_TYPE = 0x71;

/**
 * Represents a priority transaction operation on L2.
 *
 * @readonly
 */
export const PRIORITY_OPERATION_L2_TX_TYPE = 0xff;

/**
 * The maximum bytecode length in bytes that can be deployed.
 *
 * @readonly
 */
export const MAX_BYTECODE_LEN_BYTES: number = ((1 << 16) - 1) * 32;

/**
 * Numerator used in scaling the gas limit to ensure acceptance of `L1->L2` transactions.
 *
 * This constant is part of a coefficient calculation to adjust the gas limit to account for variations
 * in the SDK estimation, ensuring the transaction will be accepted.
 *
 * @readonly
 */
export const L1_FEE_ESTIMATION_COEF_NUMERATOR = 12;

/**
 * Denominator used in scaling the gas limit to ensure acceptance of `L1->L2` transactions.
 *
 * This constant is part of a coefficient calculation to adjust the gas limit to account for variations
 * in the SDK estimation, ensuring the transaction will be accepted.
 *
 * @readonly
 */
export const L1_FEE_ESTIMATION_COEF_DENOMINATOR = 10;

/**
 * Gas limit used for displaying the error messages when the
 * users do not have enough fee when depositing ERC20 token from L1 to L2.
 *
 * @readonly
 */
export const L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT = 1_000_000;

/**
 * Gas limit used for displaying the error messages when the
 * users do not have enough fee when depositing `ETH` token from L1 to L2.
 *
 * @readonly
 */
export const L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT = 200_000;

/**
 * Default gas per pubdata byte for L2 transactions.
 * This value is utilized when inserting a default value for type 2
 * and EIP712 type transactions.
 *
 * @readonly
 */
// It is a realistic value, but it is large enough to fill into any batch regardless of the pubdata price.
export const DEFAULT_GAS_PER_PUBDATA_LIMIT = 50_000;

/**
 * The `L1->L2` transactions are required to have the following gas per pubdata byte.
 *
 * @readonly
 */
export const REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT = 800;

/**
 * Returns true if token represents ETH on L1 or L2.
 *
 * @param token The token address.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
 *
 * const isL1ETH = utils.isETH(utils.ETH_ADDRESS); // true
 * const isL2ETH = utils.isETH(utils.ETH_ADDRESS_IN_CONTRACTS); // true
 */
export function isETH(token: Address) {
  return (
    isAddressEq(token, LEGACY_ETH_ADDRESS) ||
    isAddressEq(token, L2_BASE_TOKEN_ADDRESS) ||
    isAddressEq(token, ETH_ADDRESS_IN_CONTRACTS)
  );
}

/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param millis The number of milliseconds to pause execution.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
 *
 * await utils.sleep(1_000);
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
 * import { utils } from "zksync-ethers";
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
    ...ethers.getBytes(ethers.toBeHex(txNumberInBlock, 2)),
    ...ethers.getBytes(L1_MESSENGER_ADDRESS),
    ...ethers.getBytes(ethers.zeroPadValue(sender, 32)),
    ...ethers.getBytes(ethers.keccak256(msg)),
  ]);

  return ethers.keccak256(encodedMsg);
}

/**
 * Returns a log containing details of all deployed contracts related to a transaction receipt.
 *
 * @param receipt The transaction receipt containing deployment information.
 *
 * @example
 *
 * import { Provider, types, utils } from "zksync-ethers";
 *
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const deployTx = "<DEPLOY TRANSACTION>";
 * const receipt = await provider.getTransactionReceipt(deployTx);
 * const deploymentInfo = utils.getDeployedContracts(receipt as ethers.TransactionReceipt);
 */
export function getDeployedContracts(
  receipt: TransactionReceipt
): DeploymentInfo[] {
  const addressBytesLen = 40;
  return (
    receipt.logs
      .filter(
        log =>
          log.topics[0] ===
            ethers.id('ContractDeployed(address,bytes32,address)') &&
          isAddressEq(log.address, CONTRACT_DEPLOYER_ADDRESS)
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
          sender: ethers.getAddress(sender),
          bytecodeHash: bytecodeHash,
          deployedAddress: ethers.getAddress(address),
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
 * @remarks The implementation of `create2Address` in ZKsync Era may differ slightly from Ethereum.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
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
  const prefix = ethers.keccak256(ethers.toUtf8Bytes('zksyncCreate2'));
  const inputHash = ethers.keccak256(input);
  const addressBytes = ethers
    .keccak256(
      ethers.concat([
        prefix,
        ethers.zeroPadValue(sender, 32),
        salt,
        bytecodeHash,
        inputHash,
      ])
    )
    .slice(26);
  return ethers.getAddress(addressBytes);
}

/**
 * Generates a contract address from the deployer's account and nonce.
 *
 * @param sender The address of the deployer's account.
 * @param senderNonce The nonce of the deployer's account.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
 *
 * const address = utils.createAddress("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049", 1);
 * // address = "0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021"
 */
export function createAddress(
  sender: Address,
  senderNonce: BigNumberish
): string {
  const prefix = ethers.keccak256(ethers.toUtf8Bytes('zksyncCreate'));
  const addressBytes = ethers
    .keccak256(
      ethers.concat([
        prefix,
        ethers.zeroPadValue(sender, 32),
        ethers.toBeHex(senderNonce, 32),
      ])
    )
    .slice(26);

  return ethers.getAddress(addressBytes);
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
 * import { utils } from "zksync-ethers";
 *
 * const baseCost = 100;
 * const value = 99;
 * try {
 *   await utils.checkBaseCost(baseCost, value);
 * } catch (e) {
 *   // e.message = `The base cost of performing the priority operation is higher than the provided value parameter for the transaction: baseCost: ${baseCost}, provided value: ${value}`,
 * }
 */
export async function checkBaseCost(
  baseCost: ethers.BigNumberish,
  value: ethers.BigNumberish | Promise<ethers.BigNumberish>
): Promise<void> {
  if (baseCost > (await value)) {
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
 * @param [signature] Ethers signature to be included in the transaction.
 * @throws {Error} Throws an error if:
 * - `transaction.customData.customSignature` is an empty string. The transaction should be signed, and the `transaction.customData.customSignature` field should be populated with the signature. It should not be specified if the transaction is not signed.
 * - `transaction.chainId` is not provided.
 * - `transaction.from` is not provided.
 *
 * @example Serialize EIP712 transaction without signature.
 *
 * import { utils } from "zksync-ethers";
 *
 * const serializedTx = utils.serializeEip712({ chainId: 270, from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049" }, null);
 *
 * // serializedTx = "0x71ea8080808080808082010e808082010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0"
 *
 * @example Serialize EIP712 transaction with signature.
 *
 * import { utils } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const signature = ethers.Signature.from("0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aaf87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a");
 *
 * const serializedTx = utils.serializeEip712(
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
export function serializeEip712(
  transaction: TransactionLike,
  signature?: ethers.SignatureLike
): string {
  if (!transaction.chainId) {
    throw Error("Transaction chainId isn't set!");
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
    ethers.toBeArray(transaction.nonce || 0),
    ethers.toBeArray(maxPriorityFeePerGas),
    ethers.toBeArray(maxFeePerGas),
    ethers.toBeArray(transaction.gasLimit || 0),
    transaction.to ? ethers.getAddress(transaction.to) : '0x',
    ethers.toBeArray(transaction.value || 0),
    transaction.data || '0x',
  ];

  if (signature) {
    const sig = ethers.Signature.from(signature);
    fields.push(ethers.toBeArray(sig.yParity));
    fields.push(ethers.toBeArray(sig.r));
    fields.push(ethers.toBeArray(sig.s));
  } else {
    fields.push(ethers.toBeArray(transaction.chainId));
    fields.push('0x');
    fields.push('0x');
  }
  fields.push(ethers.toBeArray(transaction.chainId));
  fields.push(ethers.getAddress(from));

  // Add meta
  fields.push(
    ethers.toBeArray(meta.gasPerPubdata ?? DEFAULT_GAS_PER_PUBDATA_LIMIT)
  );
  fields.push((meta.factoryDeps ?? []).map(dep => ethers.hexlify(dep)));

  if (
    meta.customSignature &&
    ethers.getBytes(meta.customSignature).length === 0
  ) {
    throw new Error('Empty signatures are not supported!');
  }
  fields.push(meta.customSignature || '0x');

  if (meta.paymasterParams) {
    fields.push([
      meta.paymasterParams.paymaster,
      ethers.hexlify(meta.paymasterParams.paymasterInput),
    ]);
  } else {
    fields.push([]);
  }

  return ethers.concat([
    new Uint8Array([EIP712_TX_TYPE]),
    ethers.encodeRlp(fields),
  ]);
}

/**
 * Returns the hash of the given bytecode.
 *
 * @param bytecode The bytecode to hash.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
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
  const bytecodeAsArray = ethers.getBytes(bytecode);

  if (bytecodeAsArray.length % 32 !== 0) {
    throw new Error('The bytecode length in bytes must be divisible by 32!');
  }

  if (bytecodeAsArray.length > MAX_BYTECODE_LEN_BYTES) {
    throw new Error(
      `Bytecode can not be longer than ${MAX_BYTECODE_LEN_BYTES} bytes!`
    );
  }

  const hashStr = ethers.sha256(bytecodeAsArray);
  const hash = ethers.getBytes(hashStr);

  // Note that the length of the bytecode
  // should be provided in 32-byte words.
  const bytecodeLengthInWords = bytecodeAsArray.length / 32;
  if (bytecodeLengthInWords % 2 === 0) {
    throw new Error('Bytecode length in 32-byte words must be odd!');
  }

  const bytecodeLength = ethers.toBeArray(bytecodeLengthInWords);

  // The bytecode should always take the first 2 bytes of the bytecode hash,
  // so we pad it from the left in case the length is smaller than 2 bytes.
  const bytecodeLengthPadded = ethers.getBytes(
    ethers.zeroPadValue(bytecodeLength, 2)
  );

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
 * import { utils, types } from "zksync-ethers";
 *
 * const serializedTx =
 *   "0x71f87f8080808094a61464658afeaf65cccaafd3a512b69a83b77618830f42408001a073a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aa02f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a82010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0";
 * const tx: types.TransactionLike = utils.parseEip712(serializedTx);
 * /*
 * tx: types.TransactionLike = {
 *   type: 113,
 *   nonce: 0,
 *   maxPriorityFeePerGas: 0n,
 *   maxFeePerGas: 0n,
 *   gasLimit: 0n,
 *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
 *   value: 1000000n,
 *   data: "0x",
 *   chainId: 270n,
 *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
 *   customData: {
 *     gasPerPubdata: 50000n,
 *     factoryDeps: [],
 *     customSignature: "0x",
 *     paymasterParams: null,
 *   },
 *   hash: "0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee",
 * };
 * *\/
 */
export function parseEip712(payload: ethers.BytesLike): TransactionLike {
  function handleAddress(value: string): string | null {
    if (value === '0x') {
      return null;
    }
    return ethers.getAddress(value);
  }

  function handleNumber(value: string): bigint {
    if (!value || value === '0x') {
      return 0n;
    }
    return BigInt(value);
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
      paymaster: ethers.getAddress(arr[0]),
      paymasterInput: ethers.getBytes(arr[1]),
    };
  }

  const bytes = ethers.getBytes(payload);
  const raw = ethers.decodeRlp(bytes.slice(1)) as string[];
  const transaction: TransactionLike = {
    type: EIP712_TX_TYPE,
    nonce: Number(handleNumber(raw[0])),
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
      factoryDeps: raw[13] as unknown as string[],
      customSignature: raw[14],
      paymasterParams: arrayToPaymasterParams(raw[15] as unknown as string[]),
    },
  };

  const ethSignature = {
    v: Number(handleNumber(raw[7])),
    r: raw[8],
    s: raw[9],
  };

  if (
    (ethers.hexlify(ethSignature.r) === '0x' ||
      ethers.hexlify(ethSignature.s) === '0x') &&
    !transaction.customData?.customSignature
  ) {
    return transaction;
  }

  if (
    ethSignature.v !== 0 &&
    ethSignature.v !== 1 &&
    !transaction.customData?.customSignature
  ) {
    throw new Error('Failed to parse signature!');
  }

  if (!transaction.customData?.customSignature) {
    transaction.signature = ethers.Signature.from(ethSignature);
  }

  transaction.hash = eip712TxHash(transaction, ethSignature);

  return transaction;
}

/**
 * Returns the custom signature from EIP712 transaction if provided,
 * otherwise returns the Ethereum signature in bytes representation.
 *
 * @param transaction The EIP712 transaction that may contain a custom signature.
 * If a custom signature is not present in the transaction, the `ethSignature` parameter will be used.
 * @param [ethSignature] The Ethereum transaction signature. This parameter is ignored if the transaction
 * object contains a custom signature.
 *
 * @example Get custom signature from the EIP712 transaction.
 *
 * import { utils, types } from "zksync-ethers";
 *
 * const tx: types.TransactionLike = {
 *   type: 113,
 *   nonce: 0,
 *   maxPriorityFeePerGas: 0n,
 *   maxFeePerGas: 0n,
 *   gasLimit: 0n,
 *   to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
 *   value: 1_000_000n,
 *   data: '0x',
 *   chainId: 270n,
 *   from: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
 *   customData: {
 *     gasPerPubdata: 50_000n,
 *     factoryDeps: [],
 *     customSignature:
 *       '0x307837373262396162343735386435636630386637643732303161646332653534383933616532376263666562323162396337643666643430393766346464653063303166376630353332323866346636643838653662663334333436343931343135363761633930363632306661653832633239333339393062353563613336363162',
 *     paymasterParams: {
 *       paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
 *       paymasterInput: ethers.getBytes(
 *         '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000'
 *       ),
 *     },
 *   },
 *   hash: '0xc0ba55587423e1ef281b06a9d684b481365897f37a6ad611d7619b1b7e0bc908',
 * };
 *
 * const signature = utils.getSignature(tx);
 * // signature = '0x307837373262396162343735386435636630386637643732303161646332653534383933616532376263666562323162396337643666643430393766346464653063303166376630353332323866346636643838653662663334333436343931343135363761633930363632306661653832633239333339393062353563613336363162'
 *
 * @example Get Ethereum transaction signature.
 *
 * import { utils } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const ethSignature = ethers.Signature.from(
 *   '0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aaf87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a'
 * );
 * const signature =  utils.getSignature(undefined, ethSignature);
 * // signature = '0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aaf87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a'
 */
function getSignature(
  transaction: any,
  ethSignature?: EthereumSignature
): Uint8Array {
  if (
    transaction?.customData?.customSignature &&
    transaction.customData.customSignature.length
  ) {
    return ethers.getBytes(transaction.customData.customSignature);
  }

  if (!ethSignature) {
    throw new Error('No signature provided!');
  }

  const r = ethers.getBytes(ethers.zeroPadValue(ethSignature.r, 32));
  const s = ethers.getBytes(ethers.zeroPadValue(ethSignature.s, 32));
  const v = ethSignature.v;

  return new Uint8Array([...r, ...s, v]);
}

/**
 * Returns the hash of an EIP712 transaction. If a custom signature is provided in the transaction,
 * it will be used to form the transaction hash. Otherwise, the Ethereum signature specified in the
 * `ethSignature` parameter will be used.
 *
 * @param transaction The EIP712 transaction that may contain a custom signature.
 * If a custom signature is not present in the transaction, the `ethSignature` parameter will be used.
 * @param [ethSignature] The Ethereum transaction signature. This parameter is ignored if the transaction
 * object contains a custom signature.
 *
 * @example Get transaction hash using custom signature from the transaction.
 *
 * import { utils } from "zksync-ethers";
 *
 * const tx: types.TransactionRequest = {
 *   type: 113,
 *   nonce: 0,
 *   maxPriorityFeePerGas: 0n,
 *   maxFeePerGas: 0n,
 *   gasLimit: 0n,
 *   to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
 *   value: 1_000_000n,
 *   data: '0x',
 *   chainId: 270n,
 *   from: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
 *   customData: {
 *     gasPerPubdata: 50_000n,
 *     factoryDeps: [],
 *     customSignature:
 *       '0x307837373262396162343735386435636630386637643732303161646332653534383933616532376263666562323162396337643666643430393766346464653063303166376630353332323866346636643838653662663334333436343931343135363761633930363632306661653832633239333339393062353563613336363162',
 *     paymasterParams: {
 *       paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
 *       paymasterInput: ethers.getBytes(
 *         '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000'
 *       ),
 *     },
 *   },
 * };
 *
 * const hash = utils.eip712TxHash(tx);
 * // hash = '0xc0ba55587423e1ef281b06a9d684b481365897f37a6ad611d7619b1b7e0bc908'
 *
 * @example Get transaction hash using Ethereum signature.
 *
 * import { utils } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const tx: types.TransactionRequest = {
 *   chainId: 270n,
 *   from: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
 *   to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
 *   value: 1_000_000n,
 * };
 * const signature = ethers.Signature.from(
 *   '0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aaf87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a'
 * );
 * const hash = utils.eip712TxHash(tx, signature);
 * // hash = '0x8efdc7ce5f5a75ab945976c3e2b0c2a45e9f8e15ff940d05625ac5545cd9f870'
 */
export function eip712TxHash(
  transaction: Transaction | TransactionRequest,
  ethSignature?: EthereumSignature
): string {
  const signedDigest = EIP712Signer.getSignedDigest(transaction);
  const hashedSignature = ethers.keccak256(
    getSignature(transaction, ethSignature)
  );

  return ethers.keccak256(ethers.concat([signedDigest, hashedSignature]));
}

/**
 * Returns the hash of the L2 priority operation from a given transaction receipt and L2 address.
 *
 * @param txReceipt The receipt of the L1 transaction.
 * @param zkSyncAddress The address of the ZKsync Era main contract.
 *
 * @example
 *
 * import { Provider, types, utils } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 * const ethProvider = ethers.getDefaultProvider("sepolia");
 * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
 * const l1TxReceipt = await ethProvider.getTransactionReceipt(l1Tx);
 * if (l1TxReceipt) {
 *   const l2Hash = getL2HashFromPriorityOp(
 *     receipt as ethers.TransactionReceipt,
 *     await provider.getMainContractAddress()
 *   );
 * }
 */
export function getL2HashFromPriorityOp(
  txReceipt: ethers.TransactionReceipt,
  zkSyncAddress: Address
): string {
  let txHash: string | null = null;
  for (const log of txReceipt.logs) {
    if (!isAddressEq(log.address, zkSyncAddress)) {
      continue;
    }

    try {
      const priorityQueueLog = ZKSYNC_MAIN_ABI.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (priorityQueueLog && priorityQueueLog.args.txHash !== null) {
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

const ADDRESS_MODULO = 2n ** 160n;

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
 * import { utils } from "zksync-ethers";
 *
 * const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb";
 * const l2ContractAddress = utils.applyL1ToL2Alias(l1ContractAddress);
 * // l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC"
 */
export function applyL1ToL2Alias(address: string): string {
  return ethers.toBeHex(
    (BigInt(address) + BigInt(L1_TO_L2_ALIAS_OFFSET)) % ADDRESS_MODULO,
    20
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
 * import { utils } from "zksync-ethers";
 *
 * const l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC";
 * const l1ContractAddress = utils.undoL1ToL2Alias(l2ContractAddress);
 * // const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb"
 */
export function undoL1ToL2Alias(address: string): string {
  let result = BigInt(address) - BigInt(L1_TO_L2_ALIAS_OFFSET);
  if (result < 0n) {
    result += ADDRESS_MODULO;
  }
  return ethers.toBeHex(result, 20);
}

/**
 * Returns the data needed for correct initialization of an L1 token counterpart on L2.
 *
 * @param l1TokenAddress The token address on L1.
 * @param provider The client that is able to work with contracts on a read-write basis.
 * @returns The encoded bytes which contains token name, symbol and decimals.
 *
 * @example
 *
 * import { utils, types } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const ethProvider = ethers.getDefaultProvider("sepolia");
 * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
 *
 * const calldata = await utils.getERC20DefaultBridgeData(tokenL1, ethProvider);
 */
export async function getERC20DefaultBridgeData(
  l1TokenAddress: string,
  provider: ethers.Provider
): Promise<string> {
  if (isAddressEq(l1TokenAddress, LEGACY_ETH_ADDRESS)) {
    l1TokenAddress = ETH_ADDRESS_IN_CONTRACTS;
  }
  const token = IERC20__factory.connect(l1TokenAddress, provider);

  const name = isAddressEq(l1TokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ? 'Ether'
    : await token.name();
  const symbol = isAddressEq(l1TokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ? 'ETH'
    : await token.symbol();
  const decimals = isAddressEq(l1TokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ? 18
    : await token.decimals();

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
 * import { Provider, utils, types } from "zksync-ethers";
 *
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const l1TokenAddress = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
 * const l1Sender = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const l2Receiver = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const amount = 5;
 * const bridgeData = "0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000
 * 0000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000016000000000000000000000
 * 000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000
 * 000000000000000000000000000000000000000000000000000000543726f776e0000000000000000000000000000000000000000000000000000
 * 000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000
 * 0000000000020000000000000000000000000000000000000000000000000000000000000000543726f776e000000000000000000000000000000
 * 000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000
 * 00000000000000000000000000000000012";
 *
 * const calldata = await utils.getERC20BridgeCalldata(
 *   l1TokenAddress,
 *   l1Sender,
 *   l2Receiver,
 *   amount,
 *   bridgeData
 * );
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
 * import { ethers } from "ethers";
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
    return isAddressEq(address, ethers.recoverAddress(msgHash, signature));
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
 * import { MultisigECDSASmartAccount, Provider, utils } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const ADDRESS = "<MULTISIG ACCOUNT ADDRESS>";
 * const PRIVATE_KEY1 = "<FIRST PRIVATE KEY>;
 * const PRIVATE_KEY2 = "<SECOND PRIVATE KEY>;
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const account = MultisigECDSASmartAccount.create(
 *   ADDRESS,
 *   [PRIVATE_KEY1, PRIVATE_KEY2],
 *   provider
 * );
 *
 * const message = "Hello World";
 * const signature = await account.signMessage(message);
 * const magicValue = await utils.isEIP1271SignatureCorrect(provider, ADDRESS, msgHash, signature);
 * // magicValue = "0x1626ba7e"
 */
async function isEIP1271SignatureCorrect(
  provider: Provider,
  address: string,
  msgHash: string,
  signature: SignatureLike
): Promise<boolean> {
  const accountContract = new ethers.Contract(
    address,
    IERC1271.fragments,
    provider
  );

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
 *
 * @example
 *
 * import { Provider, utils } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const ADDRESS = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const MSG_HASH = "<WALLET_PRIVATE_KEY>";
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const isCorrect = await utils.isSignatureCorrect(
 *   provider,
 *   "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
 *   "0xb453bd4e271eed985cbab8231da609c4ce0a9cf1f763b6c1594e76315510e0f1",
 *   "0xb04f825363596418c630425916f73447d636094a75e47b45e2eb59d8a6c7d5035355f03b903b84700376f0efa23f3b095815776c5c6daf2b371a0a61b5f703451b"
 * );
 * // isCorrect = true
 */
async function isSignatureCorrect(
  provider: Provider,
  address: string,
  msgHash: string,
  signature: SignatureLike
): Promise<boolean> {
  const code = await provider.getCode(address);
  const isContractAccount = ethers.getBytes(code).length !== 0;

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
 * import { ethers } from "ethers";
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
  message: Uint8Array | string,
  signature: SignatureLike
): Promise<boolean> {
  const msgHash = ethers.hashMessage(message);
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
 * import { ethers } from "ethers";
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
 *   value: 7_000_000n,
 * };
 *
 * const eip712Signer = new EIP712Signer(
 *   new Wallet(PRIVATE_KEY), // or new ethers.Wallet(PRIVATE_KEY),
 *   Number((await provider.getNetwork()).chainId)
 * );
 *
 * const signature = await eip712Signer.sign(tx);
 *
 * const isValidSignature = await utils.isTypedDataSignatureCorrect(
 *  provider,
 *  ADDRESS,
 *  await eip712Signer.getDomain(),
 *  utils.EIP712_TYPES,
 *  EIP712Signer.getSignInput(tx),
 *  signature
 * );
 * // isValidSignature = true
 */
export async function isTypedDataSignatureCorrect(
  provider: Provider,
  address: string,
  domain: ethers.TypedDataDomain,
  types: Record<string, Array<ethers.TypedDataField>>,
  value: Record<string, any>,
  signature: SignatureLike
): Promise<boolean> {
  const msgHash = ethers.TypedDataEncoder.hash(domain, types, value);
  return await isSignatureCorrect(provider, address, msgHash, signature);
}

/**
 * @deprecated In favor of {@link provider.estimateDefaultBridgeDepositL2Gas}
 *
 * Returns an estimation of the L2 gas required for token bridging via the default ERC20 bridge.
 *
 * @param providerL1 The Ethers provider for the L1 network.
 * @param providerL2 The ZKsync provider for the L2 network.
 * @param token The address of the token to be bridged.
 * @param amount The deposit amount.
 * @param to The recipient address on the L2 network.
 * @param from The sender address on the L1 network.
 * @param gasPerPubdataByte The current gas per byte of pubdata.
 *
 * @example
 *
 * import { Provider, utils, types } from "zksync-ethers";
 * import { ethers } from "ethers";
 *
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 * const ethProvider = ethers.getDefaultProvider("sepolia");
 *
 * const token = "0x0000000000000000000000000000000000000001";
 * const amount = 5;
 * const to = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const from = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const gasPerPubdataByte = utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
 *
 * const gas = await utils.estimateDefaultBridgeDepositL2Gas(
 *   ethProvider,
 *   provider,
 *   token,
 *   amount,
 *   to,
 *   from,
 *   gasPerPubdataByte
 * );
 * // gas = 355_704
 */
export async function estimateDefaultBridgeDepositL2Gas(
  providerL1: ethers.Provider,
  providerL2: Provider,
  token: Address,
  amount: BigNumberish,
  to: Address,
  from?: Address,
  gasPerPubdataByte?: BigNumberish
): Promise<bigint> {
  // If the `from` address is not provided, we use a random address, because
  // due to storage slot aggregation, the gas estimation will depend on the address
  // and so estimation for the zero address may be smaller than for the sender.
  from ??= ethers.Wallet.createRandom().address;
  token = isAddressEq(token, LEGACY_ETH_ADDRESS)
    ? ETH_ADDRESS_IN_CONTRACTS
    : token;
  if (await providerL2.isBaseToken(token)) {
    return await providerL2.estimateL1ToL2Execute({
      contractAddress: to,
      gasPerPubdataByte: gasPerPubdataByte,
      caller: from,
      calldata: '0x',
      l2Value: amount,
    });
  } else {
    const bridgeAddresses = await providerL2.getDefaultBridgeAddresses();

    const value = 0;
    const l1BridgeAddress = bridgeAddresses.sharedL1;
    const l2BridgeAddress = bridgeAddresses.sharedL2;
    const bridgeData = await getERC20DefaultBridgeData(token, providerL1);

    return await estimateCustomBridgeDepositL2Gas(
      providerL2,
      l1BridgeAddress,
      l2BridgeAddress,
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
 * import { utils } from "zksync-ethers";
 *
 * const scaledGasLimit = utils.scaleGasLimit(10_000);
 * // scaledGasLimit = 12_000
 */
export function scaleGasLimit(gasLimit: bigint): bigint {
  return (
    (gasLimit * BigInt(L1_FEE_ESTIMATION_COEF_NUMERATOR)) /
    BigInt(L1_FEE_ESTIMATION_COEF_DENOMINATOR)
  );
}

/**
 * @deprecated In favor of {@link provider.estimateCustomBridgeDepositL2Gas}
 *
 * Returns an estimation of the L2 gas required for token bridging via the custom ERC20 bridge.
 *
 * @param providerL2 The ZKsync provider for the L2 network.
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
 * @example
 *
 * import { Provider, utils, types } from "zksync-ethers";
 *
 * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
 *
 * const l1BridgeAddress = "0x3e8b2fe58675126ed30d0d12dea2a9bda72d18ae";
 * const l2BridgeAddress = "0x681a1afdc2e06776816386500d2d461a6c96cb45";
 * const token = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
 * const amount = 5;
 * const to = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const bridgeData = "0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000
 * 0000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000016000000000000000000000
 * 000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000
 * 000000000000000000000000000000000000000000000000000000543726f776e0000000000000000000000000000000000000000000000000000
 * 000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000
 * 0000000000020000000000000000000000000000000000000000000000000000000000000000543726f776e000000000000000000000000000000
 * 000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000
 * 00000000000000000000000000000000012";
 * const from = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const gasPerPubdataByte = utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
 * const l2Value = 0;
 *
 * const gas = await utils.estimateCustomBridgeDepositL2Gas(
 *   provider,
 *   l1BridgeAddress,
 *   l2BridgeAddress,
 *   token,
 *   amount,
 *   to,
 *   bridgeData,
 *   from,
 *   gasPerPubdataByte,
 *   l2Value
 * );
 * // gas = 683_830
 */
export async function estimateCustomBridgeDepositL2Gas(
  providerL2: Provider,
  l1BridgeAddress: Address,
  l2BridgeAddress: Address,
  token: Address,
  amount: BigNumberish,
  to: Address,
  bridgeData: BytesLike,
  from: Address,
  gasPerPubdataByte?: BigNumberish,
  l2Value?: BigNumberish
): Promise<bigint> {
  const calldata = await getERC20BridgeCalldata(
    token,
    from,
    to,
    amount,
    bridgeData
  );
  return await providerL2.estimateL1ToL2Execute({
    caller: applyL1ToL2Alias(l1BridgeAddress),
    contractAddress: l2BridgeAddress,
    gasPerPubdataByte: gasPerPubdataByte,
    calldata: calldata,
    l2Value: l2Value,
  });
}

/**
 * Creates a JSON string from an object, including support for serializing bigint types.
 *
 * @param object The object to serialize to JSON.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
 *
 * const json = utils.toJSON({gasLimit: 1_000n})
 * // {"gasLimit": 1000}
 */
export function toJSON(object: any): string {
  return JSON.stringify(
    object,
    (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt to string
      }
      return value;
    },
    2
  );
}

/**
 * Compares stringified addresses, taking into account the fact that
 * addresses might be represented in different casing.
 *
 * @param a - The first address to compare.
 * @param b - The second address to compare.
 * @returns A boolean indicating whether the addresses are equal.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
 *
 * const address1 = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
 * const address2 = "0x36615cf349d7f6344891b1e7ca7c72883f5dc049";
 * const isEqual = utils.isAddressEq(address1, address2);
 * // true
 */
export function isAddressEq(a: Address, b: Address): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/* Returns the assetId for a token in the Native Token Vault with specific origin chainId and address*/
export function encodeNativeTokenVaultAssetId(
  chainId: bigint,
  address: string
) {
  const abi = new AbiCoder();
  const hex = abi.encode(
    ['uint256', 'address', 'address'],
    [chainId, L2_NATIVE_TOKEN_VAULT_ADDRESS, address]
  );
  return ethers.keccak256(hex);
}

/**
 * Resolves the assetId for a token
 **/
export async function resolveAssetId(
  token: Address,
  ntvContract: IL1NativeTokenVault
): Promise<BytesLike> {
  if (isAddressEq(token, LEGACY_ETH_ADDRESS)) {
    token = ETH_ADDRESS_IN_CONTRACTS;
  }

  // In case only token is provided, we expect that it is a token inside Native Token Vault
  const assetIdFromNTV = await ntvContract.assetId(token);

  if (assetIdFromNTV && assetIdFromNTV !== ethers.ZeroHash) {
    return assetIdFromNTV;
  }

  // Okay, the token have not been registered within the Native token vault.
  // There are two cases when it is possible:
  // - The token is native to L1 (it may or may not be bridged), but it has not been
  // registered within NTV after the Gateway upgrade. We assume that this is not the case
  // as the SDK is expected to work only after the full migration is done.
  // - The token is native to the current chain and it has never been bridged.

  const network = await ntvContract.runner?.provider?.getNetwork();

  if (!network) {
    throw new Error('Can not derive assetId since chainId is not available');
  }

  const ntvAssetId = encodeNativeTokenVaultAssetId(network.chainId, token);

  return ntvAssetId;
}

/**
 * Encodes the data for a transfer of a token through the Native Token Vault
 *
 * @param {bigint} amount The amount of tokens to transfer
 * @param {Address} receiver The address that will receive the tokens
 * @param {Address} token The address of the token being transferred
 * @returns {string} The ABI-encoded transfer data
 **/
export function encodeNativeTokenVaultTransferData(
  amount: bigint,
  receiver: Address,
  token: Address
) {
  return new AbiCoder().encode(
    ['uint256', 'address', 'address'],
    [amount, receiver, token]
  );
}

/**
 * Encodes asset transfer data for BridgeHub contract, using v1 encoding scheme (introduced in v26 upgrade).
 * Can be utilized to encode deposit initiation data.
 *
 * @param {string} assetId - encoded token asset ID
 * @param {string} transferData - encoded transfer data, see `encodeNativeTokenVaultTransferData`
 */ export function encodeSecondBridgeDataV1(
  assetId: string,
  transferData: string
) {
  const abi = new AbiCoder();
  const data = abi.encode(['bytes32', 'bytes'], [assetId, transferData]);

  return ethers.concat(['0x01', data]);
}

export function encodeNTVAssetId(chainId: bigint, address: string) {
  const abi = new AbiCoder();
  const hex = abi.encode(
    ['uint256', 'address', 'address'],
    [chainId, L2_NATIVE_TOKEN_VAULT_ADDRESS, address]
  );
  return ethers.keccak256(hex);
}

export async function ethAssetId(provider: ethers.Provider) {
  const network = await provider.getNetwork();

  return encodeNTVAssetId(network.chainId, ETH_ADDRESS_IN_CONTRACTS);
}

interface WithToken {
  token: Address;
}

interface WithAssetId {
  assetId: BytesLike;
}

// For backwards compatibility and easier interface lots of methods
// will continue to allow providing either token or assetId
export type WithTokenOrAssetId = WithToken | WithAssetId;

export function encodeNTVTransferData(
  amount: bigint,
  receiver: Address,
  token: Address
) {
  return new AbiCoder().encode(
    ['uint256', 'address', 'address'],
    [amount, receiver, token]
  );
}

export async function resolveFeeData(
  tx: TransactionLike,
  provider: Provider,
  providerL2?: Provider
): Promise<{
  gasLimit: BigNumberish;
  gasPrice: BigNumberish;
  gasPerPubdata: BigNumberish | undefined;
}> {
  // Race all requests against each other so that ethers batches them if it can
  return await resolveProperties({
    gasLimit: (async () => tx.gasLimit ?? (await provider.estimateGas(tx)))(),
    gasPrice: (async () =>
      tx.gasPrice ?? tx.maxFeePerGas ?? (await provider.getGasPrice()))(),
    gasPerPubdata: (async () => {
      if (
        tx.type === null ||
        tx.type === undefined ||
        tx.type === EIP712_TX_TYPE ||
        tx.customData
      ) {
        return (
          tx.customData?.gasPerPubdata ??
          // `zks_gasPerPubdata` should not go through proxied provider if
          // there is one (e.g. MetaMask does not forward `zks` requests).
          (await (providerL2 ?? provider).getGasPerPubdata())
        );
      }
      return undefined;
    })(),
  });
}
