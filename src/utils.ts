import { AbiCoder, BigNumberish, BytesLike, ethers, SignatureLike } from "ethers";
import {
    Address,
    DeploymentInfo,
    Eip712Meta,
    EthereumSignature,
    PaymasterParams,
    PriorityOpTree,
    PriorityQueueType,
    TransactionLike,
} from "./types";
import { Provider } from "./provider";
import { EIP712Signer } from "./signer";
import { IERC20__factory, IL1Bridge__factory } from "../typechain";

export * from "./paymaster-utils";

export const ZKSYNC_MAIN_ABI = new ethers.Interface(require("../abi/IZkSync.json").abi);
export const CONTRACT_DEPLOYER = new ethers.Interface(require("../abi/ContractDeployer.json").abi);
export const L1_MESSENGER = new ethers.Interface(require("../abi/IL1Messenger.json").abi);
export const IERC20 = new ethers.Interface(require("../abi/IERC20.json").abi);
export const IERC1271 = new ethers.Interface(require("../abi/IERC1271.json").abi);
export const L1_BRIDGE_ABI = new ethers.Interface(require("../abi/IL1Bridge.json").abi);
export const L2_BRIDGE_ABI = new ethers.Interface(require("../abi/IL2Bridge.json").abi);
export const NONCE_HOLDER_ABI = new ethers.Interface(require("../abi/INonceHolder.json").abi);
export const PAYMASTER_FLOW_ABI = new ethers.Interface(require("../abi/IPaymasterFlow.json").abi);

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
export const BOOTLOADER_FORMAL_ADDRESS = "0x0000000000000000000000000000000000008001";
export const CONTRACT_DEPLOYER_ADDRESS = "0x0000000000000000000000000000000000008006";
export const L1_MESSENGER_ADDRESS = "0x0000000000000000000000000000000000008008";
export const L2_ETH_TOKEN_ADDRESS = "0x000000000000000000000000000000000000800a";
export const NONCE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000008003";

export const L1_TO_L2_ALIAS_OFFSET = "0x1111000000000000000000000000000000001111";

export const EIP1271_MAGIC_VALUE = "0x1626ba7e";

export const EIP712_TX_TYPE = 0x71;
export const PRIORITY_OPERATION_L2_TX_TYPE = 0xff;

export const MAX_BYTECODE_LEN_BYTES = ((1 << 16) - 1) * 32;

// Currently, for some reason the SDK may return slightly smaller L1 gas limit than required for initiating L1->L2
// transaction. We use a coefficient to ensure that the transaction will be accepted.
export const L1_FEE_ESTIMATION_COEF_NUMERATOR = 12;
export const L1_FEE_ESTIMATION_COEF_DENOMINATOR = 10;

// This gas limit will be used for displaying the error messages when the users do not have enough fee.
export const L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT = 400_000;
export const L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT = 200_000;

// The large L2 gas per pubdata to sign. This gas is enough to ensure that
// any reasonable limit will be accepted. Note, that the operator is NOT required to
// use the honest value of gas per pubdata, and it can use any value up to the one signed by the user.
// In the future releases, we will provide a way to estimate the current gasPerPubdata.
export const DEFAULT_GAS_PER_PUBDATA_LIMIT = 50_000;

// It is possible to provide practically any gasPerPubdataByte for L1->L2 transactions, since
// the cost per gas will be adjusted respectively. We will use 800 as a relatively optimal value for now.
export const REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT = 800;

export function isETH(token: Address) {
    return token.toLowerCase() == ETH_ADDRESS || token.toLowerCase() == L2_ETH_TOKEN_ADDRESS;
}

export function sleep(millis: number) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

export function layer1TxDefaults() {
    return {
        queueType: PriorityQueueType.Deque,
        opTree: PriorityOpTree.Full,
    };
}

export function getHashedL2ToL1Msg(sender: Address, msg: BytesLike, txNumberInBlock: number) {
    const encodedMsg = new Uint8Array([
        0, // l2ShardId
        1, // isService
        ...ethers.getBytes(ethers.zeroPadBytes(ethers.toBeHex(txNumberInBlock), 2)),
        ...ethers.getBytes(L1_MESSENGER_ADDRESS),
        ...ethers.getBytes(ethers.zeroPadBytes(sender, 32)),
        ...ethers.getBytes(ethers.keccak256(msg)),
    ]);

    return ethers.keccak256(encodedMsg);
}

export function getDeployedContracts(receipt: ethers.TransactionReceipt): DeploymentInfo[] {
    const addressBytesLen = 40;
    return (
        receipt.logs
            .filter(
                (log) =>
                    log.topics[0] == ethers.id("ContractDeployed(address,bytes32,address)") &&
                    log.address == CONTRACT_DEPLOYER_ADDRESS,
            )
            // Take the last topic (deployed contract address as U256) and extract address from it (U160).
            .map((log) => {
                const sender = `0x${log.topics[1].slice(log.topics[1].length - addressBytesLen)}`;
                const bytesCodehash = log.topics[2];
                const address = `0x${log.topics[3].slice(log.topics[3].length - addressBytesLen)}`;
                return {
                    sender: ethers.getAddress(sender),
                    bytecodeHash: bytesCodehash,
                    deployedAddress: ethers.getAddress(address),
                };
            })
    );
}

export function create2Address(
    sender: Address,
    bytecodeHash: BytesLike,
    salt: BytesLike,
    input: BytesLike = "",
): string {
    const prefix = ethers.keccak256(ethers.toUtf8Bytes("zksyncCreate2"));
    const inputHash = ethers.keccak256(input);
    const addressBytes = ethers
        .keccak256(
            ethers.concat([prefix, ethers.zeroPadValue(sender, 32), salt, bytecodeHash, inputHash]),
        )
        .slice(26);
    return ethers.getAddress(addressBytes);
}

export function createAddress(sender: Address, senderNonce: BigNumberish) {
    const prefix = ethers.keccak256(ethers.toUtf8Bytes("zksyncCreate"));
    const addressBytes = ethers
        .keccak256(
            ethers.concat([
                prefix,
                ethers.zeroPadValue(sender, 32),
                ethers.zeroPadValue(ethers.toBeHex(senderNonce), 32),
            ]),
        )
        .slice(26);

    return ethers.getAddress(addressBytes);
}

export async function checkBaseCost(
    baseCost: ethers.BigNumberish,
    value: ethers.BigNumberish | Promise<ethers.BigNumberish>,
): Promise<void> {
    if (baseCost > (await value)) {
        throw new Error(
            `The base cost of performing the priority operation is higher than the provided value parameter ` +
                `for the transaction: baseCost: ${baseCost}, provided value: ${value}`,
        );
    }
}

export function serializeEip712(transaction: TransactionLike, signature?: ethers.SignatureLike): string {
    if (!transaction.chainId) {
        throw Error("Transaction chainId isn't set");
    }

    if (!transaction.from) {
        throw new Error("Explicitly providing `from` field is required for EIP712 transactions");
    }
    const from = transaction.from;
    const meta: Eip712Meta = transaction.customData ?? {};
    let maxFeePerGas = transaction.maxFeePerGas || transaction.gasPrice || 0;
    let maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || maxFeePerGas;

    const fields: any[] = [
        ethers.toBeArray(transaction.nonce || 0),
        ethers.toBeArray(maxPriorityFeePerGas),
        ethers.toBeArray(maxFeePerGas),
        ethers.toBeArray(transaction.gasLimit || 0),
        transaction.to != null ? ethers.getAddress(transaction.to) : "0x",
        ethers.toBeArray(transaction.value || 0),
        transaction.data || "0x",
    ];

    if (signature) {
        const sig = ethers.Signature.from(signature);
        fields.push(sig.yParity);
        fields.push(ethers.toBeArray(sig.r));
        fields.push(ethers.toBeArray(sig.s));
    } else {
        fields.push(ethers.toBeArray(transaction.chainId));
        fields.push("0x");
        fields.push("0x");
    }
    fields.push(ethers.toBeArray(transaction.chainId));
    fields.push(ethers.getAddress(from));

    // Add meta
    fields.push(ethers.toBeArray(meta.gasPerPubdata || DEFAULT_GAS_PER_PUBDATA_LIMIT));
    fields.push((meta.factoryDeps ?? []).map((dep) => ethers.hexlify(dep)));

    if (meta.customSignature && ethers.getBytes(meta.customSignature).length == 0) {
        throw new Error("Empty signatures are not supported");
    }
    fields.push(meta.customSignature || "0x");

    if (meta.paymasterParams) {
        fields.push([
            meta.paymasterParams.paymaster,
            ethers.hexlify(meta.paymasterParams.paymasterInput),
        ]);
    } else {
        fields.push([]);
    }

    return ethers.concat([new Uint8Array([EIP712_TX_TYPE]), ethers.encodeRlp(fields)]);
}

export function hashBytecode(bytecode: ethers.BytesLike): Uint8Array {
    // For getting the consistent length we first convert the bytecode to UInt8Array
    const bytecodeAsArray = ethers.getBytes(bytecode);

    if (bytecodeAsArray.length % 32 != 0) {
        throw new Error("The bytecode length in bytes must be divisible by 32");
    }

    if (bytecodeAsArray.length > MAX_BYTECODE_LEN_BYTES) {
        throw new Error(`Bytecode can not be longer than ${MAX_BYTECODE_LEN_BYTES} bytes`);
    }

    const hashStr = ethers.sha256(bytecodeAsArray);
    const hash = ethers.getBytes(hashStr);

    // Note that the length of the bytecode
    // should be provided in 32-byte words.
    const bytecodeLengthInWords = bytecodeAsArray.length / 32;
    if (bytecodeLengthInWords % 2 == 0) {
        throw new Error("Bytecode length in 32-byte words must be odd");
    }

    const bytecodeLength = ethers.toBeArray(bytecodeLengthInWords);

    // The bytecode should always take the first 2 bytes of the bytecode hash,
    // so we pad it from the left in case the length is smaller than 2 bytes.
    const bytecodeLengthPadded = ethers.getBytes(ethers.zeroPadValue(bytecodeLength, 2));

    const codeHashVersion = new Uint8Array([1, 0]);
    hash.set(codeHashVersion, 0);
    hash.set(bytecodeLengthPadded, 2);

    return hash;
}

// TODO: extend ethers.Transaction and add custom fields
export function parseEip712(payload: ethers.BytesLike): TransactionLike {
    function handleAddress(value: string): string | null {
        if (value === "0x") {
            return null;
        }
        return ethers.getAddress(value);
    }

    function handleNumber(value: string): bigint {
        if (value === "0x") {
            return 0n;
        }
        return BigInt(value);
    }

    function arrayToPaymasterParams(arr: string[]): PaymasterParams | undefined {
        if (arr.length == 0) {
            return undefined;
        }
        if (arr.length != 2) {
            throw new Error(
                `Invalid paymaster parameters, expected to have length of 2, found ${arr.length}`,
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
            // @ts-ignore
            paymasterParams: arrayToPaymasterParams(raw[15]),
        },
    };

    const ethSignature = {
        v: Number(handleNumber(raw[7])),
        r: raw[8],
        s: raw[9],
    };

    if (
        (ethers.hexlify(ethSignature.r) == "0x" || ethers.hexlify(ethSignature.s) == "0x") &&
        !transaction.customData?.customSignature
    ) {
        return transaction;
    }

    if (ethSignature.v !== 0 && ethSignature.v !== 1 && !transaction.customData?.customSignature) {
        throw new Error("Failed to parse signature");
    }

    if (!transaction.customData?.customSignature) {
        transaction.signature = ethers.Signature.from(ethSignature);
    }

    transaction.hash = eip712TxHash(transaction, ethSignature);

    return transaction;
}

function getSignature(transaction: any, ethSignature?: EthereumSignature): Uint8Array {
    if (transaction?.customData?.customSignature && transaction.customData.customSignature.length) {
        return ethers.getBytes(transaction.customData.customSignature);
    }

    if (!ethSignature) {
        throw new Error("No signature provided");
    }

    const r = ethers.getBytes(ethers.zeroPadBytes(ethSignature.r, 32));
    const s = ethers.getBytes(ethers.zeroPadBytes(ethSignature.s, 32));
    const v = ethSignature.v;

    return new Uint8Array([...r, ...s, v]);
}

export function eip712TxHash(transaction: any, ethSignature?: EthereumSignature) {
    const signedDigest = EIP712Signer.getSignedDigest(transaction);
    const hashedSignature = ethers.keccak256(getSignature(transaction, ethSignature));

    return ethers.keccak256(ethers.concat([signedDigest, hashedSignature]));
}

export function getL2HashFromPriorityOp(
    txReceipt: ethers.TransactionReceipt,
    zkSyncAddress: Address,
): string {
    let txHash: string | null = null;
    for (const log of txReceipt.logs) {
        if (log.address.toLowerCase() != zkSyncAddress.toLowerCase()) {
            continue;
        }

        try {
            const priorityQueueLog = ZKSYNC_MAIN_ABI.parseLog({
                topics: log.topics as string[],
                data: log.data,
            });
            if (priorityQueueLog && priorityQueueLog.args.txHash != null) {
                txHash = priorityQueueLog.args.txHash;
            }
        } catch {}
    }
    if (!txHash) {
        throw new Error("Failed to parse tx logs");
    }

    return txHash;
}

const ADDRESS_MODULO = 2n ** 160n;

export function applyL1ToL2Alias(address: string): string {
    return ethers.hexlify(
        ethers.toBeHex((BigInt(address) + BigInt(L1_TO_L2_ALIAS_OFFSET)) % ADDRESS_MODULO),
    );
}

export function undoL1ToL2Alias(address: string): string {
    let result = BigInt(address) - BigInt(L1_TO_L2_ALIAS_OFFSET);
    if (result < 0n) {
        result += ADDRESS_MODULO;
    }
    return ethers.hexlify(ethers.toBeHex(result));
}

/// Getters data used to correctly initialize the L1 token counterpart on L2
export async function getERC20DefaultBridgeData(
    l1TokenAddress: string,
    provider: ethers.Provider,
): Promise<string> {
    const token = IERC20__factory.connect(l1TokenAddress, provider);

    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();

    const coder = new AbiCoder();

    const nameBytes = coder.encode(["string"], [name]);
    const symbolBytes = coder.encode(["string"], [symbol]);
    const decimalsBytes = coder.encode(["uint256"], [decimals]);

    return coder.encode(["bytes", "bytes", "bytes"], [nameBytes, symbolBytes, decimalsBytes]);
}

/// The method that returns the calldata that will be sent by an L1 ERC20 bridge to its L2 counterpart
/// during bridging of a token.
export async function getERC20BridgeCalldata(
    l1TokenAddress: string,
    l1Sender: string,
    l2Receiver: string,
    amount: BigNumberish,
    bridgeData: BytesLike,
): Promise<string> {
    return L2_BRIDGE_ABI.encodeFunctionData("finalizeDeposit", [
        l1Sender,
        l2Receiver,
        l1TokenAddress,
        amount,
        bridgeData,
    ]);
}

// The method with similar functionality is already available in ethers.js,
// the only difference is that we provide additional `try { } catch { }`
// for error-resilience.
//
// It will also pave the road for allowing future EIP-1271 signature verification, by
// letting our SDK have functionality to verify signatures.
function isECDSASignatureCorrect(address: string, msgHash: string, signature: SignatureLike): boolean {
    try {
        return address == ethers.recoverAddress(msgHash, signature);
    } catch {
        // In case ECDSA signature verification has thrown an error,
        // we simply consider the signature as incorrect.
        return false;
    }
}

async function isEIP1271SignatureCorrect(
    provider: Provider,
    address: string,
    msgHash: string,
    signature: SignatureLike,
): Promise<boolean> {
    const accountContract = new ethers.Contract(address, IERC1271.fragments, provider);

    // This line may throw an exception if the contract does not implement the EIP1271 correctly.
    // But it may also throw an exception in case the internet connection is lost.
    // It is the caller's responsibility to handle the exception.
    const result = await accountContract.isValidSignature(msgHash, signature);

    return result == EIP1271_MAGIC_VALUE;
}

async function isSignatureCorrect(
    provider: Provider,
    address: string,
    msgHash: string,
    signature: SignatureLike,
): Promise<boolean> {
    let isContractAccount = false;

    const code = await provider.getCode(address);
    isContractAccount = ethers.getBytes(code).length != 0;

    if (!isContractAccount) {
        return isECDSASignatureCorrect(address, msgHash, signature);
    } else {
        return await isEIP1271SignatureCorrect(provider, address, msgHash, signature);
    }
}

// Returns `true` or `false` depending on whether the account abstraction's
// signature is correct. Note, that while currently it does not do any `async` actions.
// in the future it will. That's why the `Promise<boolean>` is returned.
export async function isMessageSignatureCorrect(
    provider: Provider,
    address: string,
    message: Uint8Array | string,
    signature: SignatureLike,
): Promise<boolean> {
    const msgHash = ethers.hashMessage(message);
    return await isSignatureCorrect(provider, address, msgHash, signature);
}

// Returns `true` or `false` depending on whether the account abstraction's
// EIP712 signature is correct. Note, that while currently it does not do any `async` actions.
// in the future it will. That's why the `Promise<boolean>` is returned.
export async function isTypedDataSignatureCorrect(
    provider: Provider,
    address: string,
    domain: ethers.TypedDataDomain,
    types: Record<string, Array<ethers.TypedDataField>>,
    value: Record<string, any>,
    signature: SignatureLike,
): Promise<boolean> {
    const msgHash = ethers.TypedDataEncoder.hash(domain, types, value);
    return await isSignatureCorrect(provider, address, msgHash, signature);
}

export async function estimateDefaultBridgeDepositL2Gas(
    providerL1: ethers.Provider,
    providerL2: Provider,
    token: Address,
    amount: BigNumberish,
    to: Address,
    from?: Address,
    gasPerPubdataByte?: BigNumberish,
): Promise<bigint> {
    // If the `from` address is not provided, we use a random address, because
    // due to storage slot aggregation, the gas estimation will depend on the address
    // and so estimation for the zero address may be smaller than for the sender.
    from ??= ethers.Wallet.createRandom().address;

    if (token == ETH_ADDRESS) {
        return await providerL2.estimateL1ToL2Execute({
            contractAddress: to,
            gasPerPubdataByte: gasPerPubdataByte,
            caller: from,
            calldata: "0x",
            l2Value: amount,
        });
    } else {
        let value, l1BridgeAddress, l2BridgeAddress, bridgeData;
        const bridgeAddresses = await providerL2.getDefaultBridgeAddresses();
        const l1WethBridge = IL1Bridge__factory.connect(bridgeAddresses.wethL1 as string, providerL1);
        let l2WethToken = ethers.ZeroAddress;
        try {
            l2WethToken = await l1WethBridge.l2TokenAddress(token);
        } catch (e) {}

        if (l2WethToken != ethers.ZeroAddress) {
            value = amount;
            l1BridgeAddress = bridgeAddresses.wethL1;
            l2BridgeAddress = bridgeAddresses.wethL2;
            bridgeData = "0x";
        } else {
            value = 0;
            l1BridgeAddress = bridgeAddresses.erc20L1;
            l2BridgeAddress = bridgeAddresses.erc20L2;
            bridgeData = await getERC20DefaultBridgeData(token, providerL1);
        }

        return await estimateCustomBridgeDepositL2Gas(
            providerL2,
            l1BridgeAddress as string,
            l2BridgeAddress as string,
            token,
            amount,
            to,
            bridgeData,
            from,
            gasPerPubdataByte,
            value,
        );
    }
}

export function scaleGasLimit(gasLimit: bigint): bigint {
    return (
        (gasLimit * BigInt(L1_FEE_ESTIMATION_COEF_NUMERATOR)) /
        BigInt(L1_FEE_ESTIMATION_COEF_DENOMINATOR)
    );
}

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
    l2Value?: BigNumberish,
): Promise<bigint> {
    const calldata = await getERC20BridgeCalldata(token, from, to, amount, bridgeData);
    return await providerL2.estimateL1ToL2Execute({
        caller: applyL1ToL2Alias(l1BridgeAddress),
        contractAddress: l2BridgeAddress,
        gasPerPubdataByte: gasPerPubdataByte,
        calldata: calldata,
        l2Value: l2Value,
    });
}
