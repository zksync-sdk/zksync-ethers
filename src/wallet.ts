import { EIP712Signer } from "./signer";
import { Provider } from "./provider";
import { serialize, EIP712_TX_TYPE } from "./utils";
import {Bytes, ethers, utils} from "ethers";
import { BlockTag, TransactionResponse, TransactionRequest } from "./types";
import { ProgressCallback } from "@ethersproject/json-wallets";
import { AdapterL1, AdapterL2 } from "./adapters";

export class Wallet extends AdapterL2(AdapterL1(ethers.Wallet)) {
    override readonly provider!: Provider;
    providerL1?: ethers.providers.Provider;
    public eip712!: EIP712Signer;

    override _providerL1() {
        if (this.providerL1 == null) {
            throw new Error("L1 provider missing: use `connectToL1` to specify!");
        }
        return this.providerL1;
    }

    override _providerL2(): Provider {
        return this.provider;
    }

    override _signerL1(): ethers.Wallet {
        return this.ethWallet();
    }

    override _signerL2(): Wallet {
        return this;
    }

    ethWallet(): ethers.Wallet {
        return new ethers.Wallet(this._signingKey(), this._providerL1());
    }

    // an alias with a better name
    async getNonce(blockTag?: BlockTag): Promise<number> {
        return await this.getTransactionCount(blockTag);
    }

    override connect(provider: Provider): Wallet {
        return new Wallet(this._signingKey(), provider, this.providerL1);
    }

    connectToL1(provider: ethers.providers.Provider): Wallet {
        return new Wallet(this._signingKey(), this.provider, provider);
    }

    static override fromMnemonic(mnemonic: string, path?: string, wordlist?: ethers.Wordlist): Wallet {
        const wallet = super.fromMnemonic(mnemonic, path, wordlist);
        return new Wallet(wallet._signingKey());
    }

    static override async fromEncryptedJson(
        json: string,
        password?: string | ethers.Bytes,
        callback?: ProgressCallback,
    ):Promise<Wallet> {
        const wallet = await super.fromEncryptedJson(json, password as (string | Bytes), callback);
        return new Wallet(wallet._signingKey());
    }

    static override fromEncryptedJsonSync(json: string, password?: string | ethers.Bytes): Wallet {
        const wallet = super.fromEncryptedJsonSync(json, password as (string | Bytes));
        return new Wallet(wallet._signingKey());
    }

    static override createRandom(options?: any) {
        const wallet = super.createRandom(options);
        return new Wallet(wallet._signingKey());
    }

    constructor(
        privateKey: ethers.BytesLike | utils.SigningKey,
        providerL2?: Provider,
        providerL1?: ethers.providers.Provider,
    ) {
        super(privateKey, providerL2);
        if (this.provider != null) {
            const chainId = this.getChainId();
            this.eip712 = new EIP712Signer(this, chainId);
        }
        this.providerL1 = providerL1;
    }

    override async populateTransaction(transaction: TransactionRequest): Promise<TransactionRequest> {
        if ((transaction.type == null || transaction.type !== EIP712_TX_TYPE) && transaction.customData == null) {
            return await super.populateTransaction(transaction);
        }
        transaction.type = EIP712_TX_TYPE;
        const populated = await super.populateTransaction(transaction);

        populated.type = EIP712_TX_TYPE;
        populated.value ??= 0;
        populated.data ??= "0x";
        populated.customData = this._fillCustomData(transaction.customData ?? {});
        if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
            populated.gasPrice = await this.provider.getGasPrice();
        }
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
            if (transaction.from.toLowerCase() != this.address.toLowerCase()) {
                throw new Error("Transaction `from` address mismatch!");
            }
            const populated = await this.populateTransaction(transaction);
            populated.customData!.customSignature = await this.eip712.sign(transaction);

            return serialize(populated);
        }
    }

    override async sendTransaction(
        transaction: ethers.providers.TransactionRequest,
    ): Promise<TransactionResponse> {
        return (await super.sendTransaction(transaction)) as TransactionResponse;
    }
}
