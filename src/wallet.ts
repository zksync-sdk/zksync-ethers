import { EIP712Signer } from "./signer";
import { Provider } from "./provider";
import { EIP712_TX_TYPE, serializeEip712 } from "./utils";
import { ethers, ProgressCallback } from "ethers";
import { TransactionLike, TransactionRequest, TransactionResponse } from "./types";
import { AdapterL1, AdapterL2 } from "./adapters";

export class Wallet extends AdapterL2(AdapterL1(ethers.Wallet)) {
    // @ts-ignore
    override readonly provider: Provider;
    providerL1?: ethers.Provider;
    // @ts-ignore
    public eip712: EIP712Signer;

    override _providerL1() {
        if (this.providerL1 == null) {
            throw new Error("L1 provider missing: use `connectToL1` to specify");
        }
        return this.providerL1;
    }

    override _providerL2() {
        return this.provider;
    }

    override _signerL1() {
        return this.ethWallet();
    }

    override _signerL2() {
        return this;
    }

    ethWallet(): ethers.Wallet {
        return new ethers.Wallet(this.signingKey, this._providerL1());
    }

    override connect(provider: Provider): Wallet {
        return new Wallet(this.signingKey, provider, this.providerL1);
    }

    connectToL1(provider: ethers.Provider): Wallet {
        return new Wallet(this.signingKey, this.provider, provider);
    }

    static fromMnemonic(mnemonic: string, provider?: ethers.Provider): Wallet {
        const wallet = super.fromPhrase(mnemonic, provider);
        return new Wallet(wallet.signingKey, undefined, wallet.provider as ethers.Provider);
    }

    static override async fromEncryptedJson(
        json: string,
        password: string | Uint8Array,
        callback?: ProgressCallback,
    ): Promise<Wallet> {
        const wallet = await super.fromEncryptedJson(json, password, callback);
        return new Wallet(wallet.signingKey);
    }

    static override fromEncryptedJsonSync(json: string, password: string | Uint8Array): Wallet {
        const wallet = super.fromEncryptedJsonSync(json, password);
        return new Wallet(wallet.signingKey);
    }

    constructor(
        privateKey: string | ethers.SigningKey,
        providerL2?: Provider,
        providerL1?: ethers.Provider,
    ) {
        super(privateKey, providerL2);
        // @ts-ignore
        if (this.provider != null) {
            const network = this.provider.getNetwork();
            // @ts-ignore
            this.eip712 = new EIP712Signer(
                this,
                network.then((n) => Number(n.chainId)),
            );
        }
        this.providerL1 = providerL1;
    }

    override async populateTransaction(transaction: TransactionRequest): Promise<TransactionLike> {
        if (transaction.type == null && transaction.customData == null) {
            // use legacy txs by default
            transaction.type = 0;
        }
        if (transaction.customData == null && transaction.type != EIP712_TX_TYPE) {
            return (await super.populateTransaction(transaction)) as TransactionLike;
        }
        transaction.type = EIP712_TX_TYPE;
        const populated = (await super.populateTransaction(transaction)) as TransactionLike;

        populated.type = EIP712_TX_TYPE;
        populated.value ??= 0;
        populated.data ??= "0x";
        populated.customData = this._fillCustomData(transaction.customData ?? {});
        populated.gasPrice = await this.provider.getGasPrice();
        return populated;
    }

    override async signTransaction(transaction: TransactionRequest): Promise<string> {
        if (transaction.customData == null && transaction.type != EIP712_TX_TYPE) {
            if (transaction.type == 2 && transaction.maxFeePerGas == null) {
                transaction.maxFeePerGas = await this.provider.getGasPrice();
            }
            return await super.signTransaction(transaction);
        } else {
            transaction.from ??= this.address;
            let from = await ethers.resolveAddress(transaction.from);
            if (from.toLowerCase() != this.address.toLowerCase()) {
                throw new Error("Transaction `from` address mismatch");
            }
            transaction.customData ??= {};
            transaction.customData.customSignature = await this.eip712.sign(transaction);
            const populated = await this.populateTransaction(transaction);

            return serializeEip712(populated);
        }
    }

    override async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        const populatedTx = await this.populateTransaction(tx);
        return await this.provider.broadcastTransaction(await this.signTransaction(populatedTx));
    }
}
