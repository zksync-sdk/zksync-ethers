import { ethers } from "ethers";
import { Provider } from "./provider";
import { DEFAULT_GAS_PER_PUBDATA_LIMIT, EIP712_TX_TYPE, hashBytecode, serializeEip712 } from "./utils";
import { Address, Signature, TransactionLike, TransactionRequest, TransactionResponse } from "./types";
import { AdapterL1, AdapterL2 } from "./adapters";

export const eip712Types = {
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

export class EIP712Signer {
    private eip712Domain: Promise<ethers.TypedDataDomain>;
    constructor(
        private ethSigner: ethers.Signer,
        chainId: number | Promise<number>,
    ) {
        this.eip712Domain = Promise.resolve(chainId).then((chainId) => ({
            name: "zkSync",
            version: "2",
            chainId,
        }));
    }

    static getSignInput(transaction: TransactionRequest) {
        const maxFeePerGas = transaction.maxFeePerGas || transaction.gasPrice;
        const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || maxFeePerGas;
        const gasPerPubdataByteLimit =
            transaction.customData?.gasPerPubdata || DEFAULT_GAS_PER_PUBDATA_LIMIT;
        return {
            txType: transaction.type,
            from: transaction.from,
            to: transaction.to,
            gasLimit: transaction.gasLimit,
            gasPerPubdataByteLimit: gasPerPubdataByteLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymaster: transaction.customData?.paymasterParams?.paymaster || ethers.ZeroAddress,
            nonce: transaction.nonce,
            value: transaction.value,
            data: transaction.data,
            factoryDeps: transaction.customData?.factoryDeps?.map((dep: any) => hashBytecode(dep)) || [],
            paymasterInput: transaction.customData?.paymasterParams?.paymasterInput || "0x",
        };
    }

    async sign(transaction: TransactionRequest): Promise<Signature> {
        return await this.ethSigner.signTypedData(
            await this.eip712Domain,
            eip712Types,
            EIP712Signer.getSignInput(transaction),
        );
    }

    static getSignedDigest(transaction: TransactionRequest): ethers.BytesLike {
        if (!transaction.chainId) {
            throw Error("Transaction chainId isn't set");
        }
        const domain = {
            name: "zkSync",
            version: "2",
            chainId: transaction.chainId,
        };
        return ethers.TypedDataEncoder.hash(domain, eip712Types, EIP712Signer.getSignInput(transaction));
    }
}

// This class is to be used on the frontend, with metamask injection.
// It only contains L2 operations. For L1 operations, see L1Signer.
// Sample usage:
// const provider = new BrowserProvider(window.ethereum);
// const signer = provider.getSigner();
// const tx = await signer.sendTransaction({ ... });
export class Signer extends AdapterL2(ethers.JsonRpcSigner) {
    // @ts-ignore
    public override provider: Provider;
    // @ts-ignore
    public eip712: EIP712Signer;

    override _signerL2() {
        return this;
    }

    override _providerL2() {
        return this.provider;
    }

    static from(signer: ethers.JsonRpcSigner & { provider: Provider }, chainId: number): Signer {
        const newSigner: Signer = Object.setPrototypeOf(signer, Signer.prototype);
        newSigner.eip712 = new EIP712Signer(newSigner, chainId);
        return newSigner;
    }

    override async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        if (transaction.customData == null && transaction.type == null) {
            // use legacy txs by default
            transaction.type = 0;
        }
        if (transaction.customData == null && transaction.type != EIP712_TX_TYPE) {
            return (await super.sendTransaction(transaction)) as TransactionResponse;
        } else {
            const address = await this.getAddress();
            const from = await ethers.resolveAddress(transaction.from as Address);
            if (from.toLowerCase() != address.toLowerCase()) {
                throw new Error("Transaction `from` address mismatch");
            }
            const tx: TransactionLike = {
                type: transaction.type ?? EIP712_TX_TYPE,
                value: transaction.value ?? 0,
                data: transaction.data ?? "0x",
                nonce: transaction.nonce ?? (await this.getNonce()),
                gasPrice: transaction.gasPrice ?? (await this.provider.getGasPrice()),
                gasLimit: transaction.gasLimit ?? (await this.provider.estimateGas(transaction)),
                chainId: transaction.chainId ?? (await this.provider.getNetwork()).chainId,
                to: await ethers.resolveAddress(transaction.to as Address),
                customData: this._fillCustomData(transaction.customData ?? {}),
                from,
            };
            tx.customData ??= {};
            tx.customData.customSignature = await this.eip712.sign(tx);

            const txBytes = serializeEip712(tx);
            return await this.provider.broadcastTransaction(txBytes);
        }
    }
}

// This class is to be used on the frontend with metamask injection.
// It only contains L1 operations. For L2 operations, see Signer.
// Sample usage:
// const ethProvider = new ethers.BrowserProvider(window.ethereum);
// const provider = new Provider('<rpc_url>');
// const signer = L1Signer.from(ethProvider.getSigner(), provider);
// const tx = await signer.deposit({ ... });
export class L1Signer extends AdapterL1(ethers.JsonRpcSigner) {
    // @ts-ignore
    public providerL2: Provider;
    override _providerL2() {
        return this.providerL2;
    }

    override _providerL1() {
        return this.provider;
    }

    override _signerL1() {
        return this;
    }

    static from(signer: ethers.JsonRpcSigner, zksyncProvider: Provider): L1Signer {
        const newSigner: L1Signer = Object.setPrototypeOf(signer, L1Signer.prototype);
        newSigner.providerL2 = zksyncProvider;
        return newSigner;
    }

    connectToL2(provider: Provider): this {
        this.providerL2 = provider;
        return this;
    }
}

export class L2VoidSigner extends AdapterL2(ethers.VoidSigner) {
    // @ts-ignore
    public override provider: Provider;
    // @ts-ignore
    public eip712: EIP712Signer;

    override _signerL2() {
        return this;
    }

    override _providerL2() {
        return this.provider;
    }

    static from(signer: ethers.VoidSigner & { provider: Provider }, chainId: number): L2VoidSigner {
        const newSigner: L2VoidSigner = Object.setPrototypeOf(signer, L2VoidSigner.prototype);
        newSigner.eip712 = new EIP712Signer(newSigner, chainId);
        return newSigner;
    }

    override async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        if (transaction.customData == null && transaction.type == null) {
            // use legacy txs by default
            transaction.type = 0;
        }
        if (transaction.customData == null && transaction.type != EIP712_TX_TYPE) {
            return (await super.sendTransaction(transaction)) as TransactionResponse;
        } else {
            const address = await this.getAddress();
            const from = await ethers.resolveAddress(transaction.from as Address);
            if (from.toLowerCase() != address.toLowerCase()) {
                throw new Error("Transaction `from` address mismatch");
            }
            const tx: TransactionLike = {
                type: transaction.type ?? EIP712_TX_TYPE,
                value: transaction.value ?? 0,
                data: transaction.data ?? "0x",
                nonce: transaction.nonce ?? (await this.getNonce()),
                gasPrice: transaction.gasPrice ?? (await this.provider.getGasPrice()),
                gasLimit: transaction.gasLimit ?? (await this.provider.estimateGas(transaction)),
                chainId: transaction.chainId ?? (await this.provider.getNetwork()).chainId,
                to: await ethers.resolveAddress(transaction.to as Address),
                customData: this._fillCustomData(transaction.customData ?? {}),
                from,
            };
            tx.customData ??= {};
            tx.customData.customSignature = await this.eip712.sign(tx);

            const txBytes = serializeEip712(tx);
            return await this.provider.broadcastTransaction(txBytes);
        }
    }
}

// This class is to be used on the frontend with metamask injection.
// It only contains L1 operations. For L2 operations, see Signer.
// Sample usage:
// const ethProvider = new ethers.BrowserProvider(window.ethereum);
// const provider = new Provider('<rpc_url>');
// const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
// const tx = await signer.deposit({ ... });
export class L1VoidSigner extends AdapterL1(ethers.VoidSigner) {
    // @ts-ignore
    public providerL2: Provider;
    override _providerL2() {
        return this.providerL2;
    }

    override _providerL1(): ethers.Provider {
        // @ts-ignore
        return this.provider;
    }

    override _signerL1() {
        return this;
    }

    static from(signer: ethers.VoidSigner, zksyncProvider: Provider): L1VoidSigner {
        const newSigner: L1VoidSigner = Object.setPrototypeOf(signer, L1VoidSigner.prototype);
        newSigner.providerL2 = zksyncProvider;
        return newSigner;
    }

    connectToL2(provider: Provider): this {
        this.providerL2 = provider;
        return this;
    }
}
