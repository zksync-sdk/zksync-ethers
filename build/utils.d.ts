import { BigNumber, BigNumberish, BytesLike, ethers } from 'ethers';
import { SignatureLike } from '@ethersproject/bytes';
import { Address, DeploymentInfo, PriorityOpTree, PriorityQueueType } from './types';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { Provider } from './provider';
export * from './paymaster-utils';
export * from './smart-account-utils';
export { EIP712_TYPES } from './signer';
/**
 * The ABI for the `ZKsync` interface.
 * @constant
 */
export declare const ZKSYNC_MAIN_ABI: ethers.utils.Interface;
/**
 * The ABI of the `Bridgehub` interface.
 * @constant
 */
export declare const BRIDGEHUB_ABI: ethers.utils.Interface;
/**
 * The ABI for the `IContractDeployer` interface, which is utilized for deploying smart contracts.
 * @constant
 */
export declare const CONTRACT_DEPLOYER: ethers.utils.Interface;
/**
 * The ABI for the `IL1Messenger` interface, which is utilized for sending messages from the L2 to L1.
 * @constant
 */
export declare const L1_MESSENGER: ethers.utils.Interface;
/**
 * The ABI for the `IERC20` interface, which is utilized for interacting with ERC20 tokens.
 * @constant
 */
export declare const IERC20: ethers.utils.Interface;
/**
 * The ABI for the `IERC1271` interface, which is utilized for signature validation by contracts.
 * @constant
 */
export declare const IERC1271: ethers.utils.Interface;
/**
 * The ABI for the `IL1Bridge` interface, which is utilized for transferring ERC20 tokens from L1 to L2.
 * @constant
 */
export declare const L1_BRIDGE_ABI: ethers.utils.Interface;
/**
 * The ABI for the `IL2Bridge` interface, which is utilized for transferring ERC20 tokens from L2 to L1.
 * @constant
 */
export declare const L2_BRIDGE_ABI: ethers.utils.Interface;
/**
 * The ABI for the `INonceHolder` interface, which is utilized for managing deployment nonces.
 * @constant
 */
export declare const NONCE_HOLDER_ABI: ethers.utils.Interface;
/**
 * The address of the L1 `ETH` token.
 * @constant
 */
export declare const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
/**
 * The address of the L1 `ETH` token.
 * @constant
 */
export declare const LEGACY_ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
/**
 * In the contracts the zero address can not be used, use one instead.
 * @constant
 */
export declare const ETH_ADDRESS_IN_CONTRACTS = "0x0000000000000000000000000000000000000001";
/**
 * The formal address for the `Bootloader`.
 * @constant
 */
export declare const BOOTLOADER_FORMAL_ADDRESS = "0x0000000000000000000000000000000000008001";
/**
 * The address of the Contract deployer.
 * @constant
 */
export declare const CONTRACT_DEPLOYER_ADDRESS = "0x0000000000000000000000000000000000008006";
/**
 * The address of the L1 messenger.
 * @constant
 */
export declare const L1_MESSENGER_ADDRESS = "0x0000000000000000000000000000000000008008";
/**
 * The address of the L2 `ETH` token.
 * @constant
 * @deprecated In favor of {@link L2_BASE_TOKEN_ADDRESS}.
 */
export declare const L2_ETH_TOKEN_ADDRESS = "0x000000000000000000000000000000000000800a";
/**
 * The address of the base token.
 * @constant
 */
export declare const L2_BASE_TOKEN_ADDRESS = "0x000000000000000000000000000000000000800a";
/**
 * The address of the Nonce holder.
 * @constant
 */
export declare const NONCE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000008003";
/**
 * The zero hash value.
 * @constant
 */
export declare const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
/**
 * Used for applying and undoing aliases on addresses during bridging from L1 to L2.
 * @constant
 */
export declare const L1_TO_L2_ALIAS_OFFSET = "0x1111000000000000000000000000000000001111";
/**
 * The EIP1271 magic value used for signature validation in smart contracts.
 * This predefined constant serves as a standardized indicator to signal successful
 * signature validation by the contract.
 *
 * @constant
 */
export declare const EIP1271_MAGIC_VALUE = "0x1626ba7e";
/**
 * Represents an EIP712 transaction type.
 *
 * @constant
 */
export declare const EIP712_TX_TYPE = 113;
/**
 * Represents a priority transaction operation on L2.
 *
 * @constant
 */
export declare const PRIORITY_OPERATION_L2_TX_TYPE = 255;
/**
 * The maximum bytecode length in bytes that can be deployed.
 *
 * @constant
 */
export declare const MAX_BYTECODE_LEN_BYTES: number;
/**
 * Numerator used in scaling the gas limit to ensure acceptance of `L1->L2` transactions.
 *
 * This constant is part of a coefficient calculation to adjust the gas limit to account for variations
 * in the SDK estimation, ensuring the transaction will be accepted.
 *
 * @constant
 */
export declare const L1_FEE_ESTIMATION_COEF_NUMERATOR: BigNumber;
/**
 * Denominator used in scaling the gas limit to ensure acceptance of `L1->L2` transactions.
 *
 * This constant is part of a coefficient calculation to adjust the gas limit to account for variations
 * in the SDK estimation, ensuring the transaction will be accepted.
 *
 * @constant
 */
export declare const L1_FEE_ESTIMATION_COEF_DENOMINATOR: BigNumber;
/**
 * Gas limit used for displaying the error messages when the
 * users do not have enough fee when depositing ERC20 token from L1 to L2.
 *
 * @constant
 */
export declare const L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT = 400000;
/**
 * Gas limit used for displaying the error messages when the
 * users do not have enough fee when depositing `ETH` token from L1 to L2.
 *
 * @constant
 */
export declare const L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT = 200000;
/**
 * Default gas per pubdata byte for L2 transactions.
 * This value is utilized when inserting a default value for type 2
 * and EIP712 type transactions.
 *
 * @constant
 */
export declare const DEFAULT_GAS_PER_PUBDATA_LIMIT = 50000;
/**
 * The `L1->L2` transactions are required to have the following gas per pubdata byte.
 *
 * @constant
 */
export declare const REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT = 800;
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
export declare function isETH(token: Address): boolean;
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
export declare function sleep(millis: number): Promise<unknown>;
/**
 * Returns the default settings for L1 transactions.
 */
export declare function layer1TxDefaults(): {
    queueType: PriorityQueueType.Deque;
    opTree: PriorityOpTree.Full;
};
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
export declare function getHashedL2ToL1Msg(sender: Address, msg: BytesLike, txNumberInBlock: number): string;
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
export declare function getDeployedContracts(receipt: ethers.providers.TransactionReceipt): DeploymentInfo[];
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
export declare function create2Address(sender: Address, bytecodeHash: BytesLike, salt: BytesLike, input?: BytesLike): string;
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
export declare function createAddress(sender: Address, senderNonce: BigNumberish): string;
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
 * const baseCost = BigNumber.from(100);
 * const value = 99;
 * try {
 *   await utils.checkBaseCost(baseCost, value);
 * } catch (e) {
 *   // e.message = `The base cost of performing the priority operation is higher than the provided value parameter for the transaction: baseCost: ${baseCost}, provided value: ${value}`,
 * }
 */
export declare function checkBaseCost(baseCost: ethers.BigNumber, value: ethers.BigNumberish | Promise<ethers.BigNumberish>): Promise<void>;
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
 * const serializedTx = utils.serialize({ chainId: 270, from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049" }, null);
 *
 * // serializedTx = "0x71ea8080808080808082010e808082010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0"
 *
 * @example Serialize EIP712 transaction with signature.
 *
 * import { utils } from "zksync-ethers";
 * import { ethers } from "ethers";
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
export declare function serialize(transaction: ethers.providers.TransactionRequest, signature?: SignatureLike): string;
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
export declare function hashBytecode(bytecode: ethers.BytesLike): Uint8Array;
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
 *     chainId: 270,
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
export declare function parseTransaction(payload: ethers.BytesLike): ethers.Transaction;
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
export declare function getL2HashFromPriorityOp(txReceipt: ethers.providers.TransactionReceipt, zkSyncAddress: Address): string;
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
export declare function applyL1ToL2Alias(address: string): string;
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
export declare function undoL1ToL2Alias(address: string): string;
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
export declare function getERC20DefaultBridgeData(l1TokenAddress: string, provider: ethers.providers.Provider): Promise<string>;
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
export declare function getERC20BridgeCalldata(l1TokenAddress: string, l1Sender: string, l2Receiver: string, amount: BigNumberish, bridgeData: BytesLike): Promise<string>;
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
export declare function isMessageSignatureCorrect(provider: Provider, address: string, message: ethers.Bytes | string, signature: SignatureLike): Promise<boolean>;
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
export declare function isTypedDataSignatureCorrect(provider: Provider, address: string, domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, signature: SignatureLike): Promise<boolean>;
/**
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
 * @see
 * {@link https://docs.zksync.io/build/developer-reference/bridging-asset.html#default-bridges Default bridges documentation}.
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
 * const gas = await utils.estimateCustomBridgeDepositL2Gas(
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
export declare function estimateDefaultBridgeDepositL2Gas(providerL1: ethers.providers.Provider, providerL2: Provider, token: Address, amount: BigNumberish, to: Address, from?: Address, gasPerPubdataByte?: BigNumberish): Promise<BigNumber>;
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
export declare function scaleGasLimit(gasLimit: BigNumber): BigNumber;
/**
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
 * @see
 * {@link https://docs.zksync.io/build/developer-reference/bridging-asset.html#custom-bridges-on-l1-and-l2 Custom bridges documentation}.
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
export declare function estimateCustomBridgeDepositL2Gas(providerL2: Provider, l1BridgeAddress: Address, l2BridgeAddress: Address, token: Address, amount: BigNumberish, to: Address, bridgeData: BytesLike, from?: Address, gasPerPubdataByte?: BigNumberish, l2Value?: BigNumberish): Promise<BigNumber>;
/**
 * Creates a JSON string from an object, including support for serializing bigint types.
 *
 * @param object The object to serialize to JSON.
 *
 * @example
 *
 * import { utils } from "zksync-ethers";
 *
 * const json = utils.toJSON({gasLimit: BigNumber.from(1_000)})
 * // {"gasLimit": 1000}
 */
export declare function toJSON(object: any): string;
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
export declare function isAddressEq(a: Address, b: Address): boolean;
