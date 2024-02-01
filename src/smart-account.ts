import {
    ethers,
    BlockTag,
    Signer,
    TypedDataDomain,
    TypedDataField,
    getAddress,
    SigningKey,
    BytesLike,
} from "ethers";
import { Provider } from "./provider";
import { EIP712Signer } from "./signer";
import { Wallet } from "./wallet";
import { EIP712_TX_TYPE, DEFAULT_GAS_PER_PUBDATA_LIMIT, serializeEip712 } from "./utils";
import { TransactionResponse, TransactionRequest, TransactionLike, Eip712Meta } from "./types";

/**
 * The custom signing method is used to sign transactions with a custom logic
 * @param transaction - transaction to sign
 * @param defaultSigner - default signer to sign transaction
 * @param keys - private keys to sign transaction
 * @returns signed transaction
 */
type CustomSigningMethod = (
    transaction: TransactionRequest,
    defaultSigner: ethers.Signer,
    keys: string[] | string | ethers.SigningKey,
) => Promise<string>;

export class SmartAccount extends EIP712Signer implements Signer {
    readonly address: string;
    provider: Provider;
    readonly customSigningMethod?: CustomSigningMethod;
    readonly privateKeys: string[] | string | ethers.SigningKey;
    private defaultSigner: ethers.Signer;
    // public eip712: EIP712Signer;
    readonly #signingKey: SigningKey;

    constructor(
        address: string,
        privateKeys: string[] | string | ethers.SigningKey,
        provider: Provider,
        signingMethod?: CustomSigningMethod,
    ) {
        const network = provider.getNetwork();

        // initializes EIP712Signer which requires chainId to be a number
        let tempPK;
        if (privateKeys instanceof Array) {
            tempPK = privateKeys[0];
            // this.defaultSigner = new ethers.Wallet(privateKeys[0], provider);
            // this.defaultSigner = new Wallet(privateKeys[0], provider);
            // this.#signingKey = new SigningKey(privateKeys[0]);
        } else {
            tempPK = privateKeys;
            // this.defaultSigner = new ethers.Wallet(privateKeys, provider);
            // this.#signingKey = new SigningKey(privateKeys as BytesLike);
        }
        super(
            new Wallet(tempPK, provider),
            network.then((n) => Number(n.chainId)),
        );
        this.defaultSigner = new ethers.Wallet(tempPK, provider);
        this.#signingKey = new SigningKey(tempPK as BytesLike);
        this.address = address;
        this.privateKeys = privateKeys;
        this.customSigningMethod = signingMethod;
        this.provider = provider;
    }

    // Implementation of Signer interface

    _fillCustomData(data: Eip712Meta): Eip712Meta {
        const customData = { ...data };
        customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;
        customData.factoryDeps ??= [];
        return customData;
    }

    /**
     *  Returns a new instance of this Signer connected to //provider// or detached
     *  from any Provider if null.
     */
    connect(provider: null | Provider): Signer {
        if (this.provider != null) {
            return new SmartAccount(
                this.address,
                this.privateKeys,
                provider as Provider,
                this.customSigningMethod,
            );
        }
        throw "Cannot connect, no provider available";
    }

    ////////////////////
    // State

    /**
     *  Get the address of the Signer.
     */
    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    /**
     *  Gets the next nonce required for this Signer to send a transaction.
     *
     *  @param blockTag - The blocktag to base the transaction count on, keep in mind
     *         many nodes do not honour this value and silently ignore it [default: ``"latest"``]
     */
    getNonce(blockTag?: BlockTag): Promise<number> {
        // TODO: implement proper nonce check
        return Promise.resolve(9999);
    }

    ////////////////////
    // Preparation

    /**
     *  Prepares a {@link TransactionRequest} for calling:
     *  - resolves ``to`` and ``from`` addresses
     *  - if ``from`` is specified , check that it matches this Signer
     *
     *  @param tx - The call to prepare
     */
    populateCall(tx: TransactionRequest): Promise<TransactionLike> {
        if (tx.from && tx.from !== this.address) {
            throw new Error("Transaction `from` address mismatch");
        }

        // Resolve 'to' address if it's a Promise or in a non-string format
        const resolvedTo = tx.to ? getAddress(tx.to.toString()) : null;
        const resolvedFrom = tx.from ? getAddress(tx.from.toString()) : null;

        // Ensure all properties conform to TransactionLike<string>
        const result: TransactionLike = {
            ...tx,
            // Make sure 'to' and 'from are string
            to: resolvedTo,
            from: resolvedFrom,
            // Convert/resolve other properties as necessary
        };

        return Promise.resolve(result);
    }

    /**
     *  Prepares a {@link TransactionRequest} for sending to the network by
     *  populating any missing properties:
     *  - resolves ``to`` and ``from`` addresses
     *  - if ``from`` is specified , check that it matches this Signer
     *  - populates ``nonce`` via ``signer.getNonce("pending")``
     *  - populates ``gasLimit`` via ``signer.estimateGas(tx)``
     *  - populates ``chainId`` via ``signer.provider.getNetwork()``
     *  - populates ``type`` and relevant fee data for that type (``gasPrice``
     *    for legacy transactions, ``maxFeePerGas`` for EIP-1559, etc)
     *
     *  @note Some Signer implementations may skip populating properties that
     *        are populated downstream; for example JsonRpcSigner defers to the
     *        node to populate the nonce and fee data.
     *
     *  @param tx - The call to prepare
     */
    async populateTransaction(transaction: TransactionRequest): Promise<TransactionLike> {
        // similar to populateTransaction in wallet.ts > populateTransaction
        // but always use EIP712 tx type
        transaction.from = this.address;
        // TODO: populate rest of tx params as in ethers.js > abstract-signer.ts > populateTransaction
        const pop = { ...transaction } as TransactionLike;

        if (pop.gasLimit == null) {
            pop.gasLimit = await this.estimateGas(pop);
        }
        const network = await (<Provider>this.provider).getNetwork();

        if (pop.chainId != null) {
            const chainId = network.chainId;
            if (pop.chainId != network.chainId) {
                throw `transaction chainId mismatch ${chainId} - ${pop.chainId}`;
            }
        } else {
            pop.chainId = network.chainId;
        }

        pop.type = EIP712_TX_TYPE;
        // not need to populate value and data it is already set
        pop.value ??= 0;
        pop.data ??= "0x";
        pop.customData = this._fillCustomData(transaction.customData ?? {});
        pop.gasPrice = await this.provider.getGasPrice();
        console.log("populated tx :>> ", pop);
        return pop;
    }

    ////////////////////
    // Execution

    /**
     *  Estimates the required gas required to execute //tx// on the Blockchain. This
     *  will be the expected amount a transaction will require as its ``gasLimit``
     *  to successfully run all the necessary computations and store the needed state
     *  that the transaction intends.
     *
     *  Keep in mind that this is **best efforts**, since the state of the Blockchain
     *  is in flux, which could affect transaction gas requirements.
     *
     *  @throws UNPREDICTABLE_GAS_LIMIT A transaction that is believed by the node to likely
     *          fail will throw an error during gas estimation. This could indicate that it
     *          will actually fail or that the circumstances are simply too complex for the
     *          node to take into account. In these cases, a manually determined ``gasLimit``
     *          will need to be made.
     */
    estimateGas(tx: TransactionRequest): Promise<bigint> {
        return this.provider.estimateGas(tx);
    }

    /**
     *  Evaluates the //tx// by running it against the current Blockchain state. This
     *  cannot change state and has no cost in ether, as it is effectively simulating
     *  execution.
     *
     *  This can be used to have the Blockchain perform computations based on its state
     *  (e.g. running a Contract's getters) or to simulate the effect of a transaction
     *  before actually performing an operation.
     */
    call(tx: TransactionRequest): Promise<string> {
        return this.provider.call(tx);
    }

    /**
     *  Resolves an ENS Name to an address.
     */
    resolveName(name: string): Promise<null | string> {
        // TODO: implement
        // return this.provider.resolveName(name);
        throw new Error("Not supported");
    }

    ////////////////////
    // Signing

    /**
     *  Signs %%tx%%, returning the fully signed transaction. This does not
     *  populate any additional properties within the transaction.
     */
    async signTransaction(tx: TransactionRequest): Promise<string> {
        if (this.customSigningMethod) {
            console.log("account has custom sign method");
            return this.customSigningMethod(tx, this.defaultSigner, this.privateKeys);
        } else {
            // default signing as in wallet.ts > signTransaction
            tx.customData ??= {};
            tx.customData.customSignature = await this.sign(tx);
            const populatedTx = await this.populateTransaction(tx);
            return serializeEip712(populatedTx);
        }
    }

    /**
     *  Sends tx to the Network. The ``signer.populateTransaction(tx)``
     *  is called first to ensure all necessary properties for the
     *  transaction to be valid have been popualted first.
     */
    async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        const populatedTx = await this.populateTransaction(tx);
        return await this.provider.broadcastTransaction(await this.signTransaction(populatedTx));
    }

    /**
     *  Signs an [[link-eip-191]] prefixed personal message.
     *
     *  If the %%message%% is a string, it is signed as UTF-8 encoded bytes. It is **not**
     *  interpretted as a [[BytesLike]]; so the string ``"0x1234"`` is signed as six
     *  characters, **not** two bytes.
     *
     *  To sign that example as two bytes, the Uint8Array should be used
     *  (i.e. ``new Uint8Array([ 0x12, 0x34 ])``).
     */
    signMessage(message: string | Uint8Array): Promise<string> {
        // TODO: check implementation in ethers.js > base-wallet.ts > signMessage

        return this.defaultSigner.signMessage(message);
    }

    /**
     *  Signs the [[link-eip-712]] typed data.
     */
    signTypedData(
        domain: TypedDataDomain,
        types: Record<string, Array<TypedDataField>>,
        value: Record<string, any>,
    ): Promise<string> {
        // TODO: check implementation in ethers.js > base-wallet.ts > signTypedData
        return this.defaultSigner.signTypedData(domain, types, value);
        // return Promise.resolve(this.sign(domain, types, value));
    }
}
