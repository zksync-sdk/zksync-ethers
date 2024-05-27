import {
  AbstractSigner,
  BigNumberish,
  BlockTag,
  ethers,
  hashMessage,
  SigningKey,
  TypedDataEncoder,
} from 'ethers';
import {Provider} from './provider';
import {
  Address,
  BalancesMap,
  PayloadSigner,
  PaymasterParams,
  SmartAccountSigner,
  TransactionBuilder,
  TransactionLike,
  TransactionRequest,
  TransactionResponse,
} from './types';

import {
  populateTransactionECDSA,
  populateTransactionMultisigECDSA,
  signPayloadWithECDSA,
  signPayloadWithMultipleECDSA,
} from './smart-account-utils';
import {INonceHolder__factory} from './typechain';
import {NONCE_HOLDER_ADDRESS, serializeEip712} from './utils';
import {EIP712Signer} from './signer';

function checkProvider(signer: SmartAccount, operation: string): Provider {
  if (signer.provider) {
    return signer.provider;
  }
  ethers.assert(false, 'missing provider', 'UNSUPPORTED_OPERATION', {
    operation,
  });
}

/**
 * A `SmartAccount` is a signer which can be configured to sign various payloads using a provided secret.
 * The secret can be in any form, allowing for flexibility when working with different account implementations.
 * The `SmartAccount` is bound to a specific address and provides the ability to define custom method for populating transactions
 * and custom signing method used for signing messages, typed data, and transactions.
 * It is compatible with {@link ethers.ContractFactory} for deploying contracts/accounts, as well as with {@link ethers.Contract}
 * for interacting with contracts/accounts using provided ABI along with custom transaction signing logic.
 */
export class SmartAccount extends AbstractSigner {
  /** Address to which the `SmartAccount` is bound. */
  readonly address!: string;
  /** Secret in any form that can be used for signing different payloads. */
  readonly secret: any;
  /** Provider to which the `SmartAccount` is connected. */
  override readonly provider!: null | Provider;

  /** Custom method for signing different payloads. */
  protected payloadSigner: PayloadSigner;

  /** Custom method for populating transaction requests. */
  protected transactionBuilder: TransactionBuilder;

  /**
   * Creates a `SmartAccount` instance with provided `signer` and `provider`.
   * By default, uses {@link signPayloadWithECDSA} and {@link populateTransactionECDSA}.
   *
   * @param signer - Contains necessary properties for signing payloads.
   * @param provider - The provider to connect to. Can be `null` for offline usage.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   */
  constructor(signer: SmartAccountSigner, provider?: null | Provider) {
    super(provider);
    ethers.defineProperties<SmartAccount>(this, {
      address: signer.address,
      secret: signer.secret,
    });
    this.payloadSigner = signer.payloadSigner || signPayloadWithECDSA;
    this.transactionBuilder =
      signer.transactionBuilder || populateTransactionECDSA;
  }

  /**
   * Creates a new instance of `SmartAccount` connected to a provider or detached
   * from any provider if `null` is provided.
   *
   * @param provider - The provider to connect the `SmartAccount` to.
   * If `null`, the `SmartAccount` will be detached from any provider.
   *
   * @example
   *
   * import { Wallet, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const sepoliaProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const sepoliaAccount = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   sepoliaProvider
   * );
   *
   * const mainnetProvider = Provider.getDefaultProvider(types.Network.Mainnet);
   * const mainnetAccount = sepoliaAccount.connect(mainnetProvider);
   */
  connect(provider: null | Provider): SmartAccount {
    return new SmartAccount(
      {
        address: this.address,
        secret: this.secret,
        payloadSigner: this.payloadSigner,
        transactionBuilder: this.transactionBuilder,
      },
      provider
    );
  }

  /**
   * Returns the address of the account.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const address = await account.getAddress();
   */
  getAddress(): Promise<string> {
    return Promise.resolve(this.address);
  }

  /**
   * Returns the balance of the account.
   *
   * @param [token] - The token address to query balance for. Defaults to the native token.
   * @param [blockTag='committed'] - The block tag to get the balance at.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const balance = await account.getBalance();
   */
  async getBalance(
    token?: Address,
    blockTag: BlockTag = 'committed'
  ): Promise<bigint> {
    return await checkProvider(this, 'getBalance').getBalance(
      await this.getAddress(),
      blockTag,
      token
    );
  }

  /**
   * Returns all token balances of the account.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const balances = await account.getAllBalances();
   */
  async getAllBalances(): Promise<BalancesMap> {
    return await checkProvider(
      this,
      'getAllAccountBalances'
    ).getAllAccountBalances(await this.getAddress());
  }

  /**
   * Returns the deployment nonce of the account.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const nonce = await account.getDeploymentNonce();
   */
  async getDeploymentNonce(): Promise<bigint> {
    return await INonceHolder__factory.connect(
      NONCE_HOLDER_ADDRESS,
      this
    ).getDeploymentNonce(await this.getAddress());
  }

  /**
   * Populates the transaction `tx` using the provided {@link TransactionBuilder} function.
   * If `tx.from` is not set, it sets the value from the {@link getAddress} method which can
   * be utilized in the {@link TransactionBuilder} function.
   *
   * @param tx The transaction that needs to be populated.
   *
   * @example
   *
   * import { SmartAccount, Provider, types, utils } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const populatedTx = await account.populateTransaction({
   *   type: utils.EIP712_TX_TYPE,
   *   to: "<RECEIVER>",
   *   value: 7_000_000_000,
   * });
   */
  override async populateTransaction(
    tx: TransactionRequest
  ): Promise<TransactionLike> {
    return this.transactionBuilder(
      {
        ...tx,
        from: tx.from || (await this.getAddress()),
      },
      this.secret,
      this.provider
    );
  }

  /**
   * Signs the transaction `tx` using the provided {@link PayloadSigner} function,
   * returning the fully signed transaction. The {@link populateTransaction} method
   * is called first to ensure that all necessary properties for the transaction to be valid
   * have been populated.
   *
   * @param tx The transaction that needs to be signed.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const signedTx = await account.signTransaction({
   *   to: "<RECEIVER>",
   *   value: ethers.parseEther('1'),
   * });
   */
  async signTransaction(tx: TransactionRequest): Promise<string> {
    const populatedTx = await this.populateTransaction(tx);
    const populatedTxHash = EIP712Signer.getSignedDigest(populatedTx);

    populatedTx.customData = {
      ...populatedTx.customData,
      customSignature: await this.payloadSigner(
        populatedTxHash,
        this.secret,
        this.provider
      ),
    };
    return serializeEip712(populatedTx);
  }

  /**
   * Sends `tx` to the Network. The {@link signTransaction}
   * is called first to ensure transaction is properly signed.
   *
   * @param tx The transaction that needs to be sent.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const signedTx = await account.sendTransaction({
   *   to: "<RECEIVER>",
   *   value: ethers.parseEther('1'),
   * });
   */
  override async sendTransaction(
    tx: TransactionRequest
  ): Promise<TransactionResponse> {
    return checkProvider(this, 'broadcastTransaction').broadcastTransaction(
      await this.signTransaction(tx)
    );
  }

  /**
   * Signs a `message` using the provided {@link PayloadSigner} function.
   *
   * @param message The message that needs to be signed.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const signedMessage = await account.signMessage('Hello World!');
   */
  signMessage(message: string | Uint8Array): Promise<string> {
    return this.payloadSigner(hashMessage(message), this.secret, this.provider);
  }

  /**
   * Signs a typed data using the provided {@link PayloadSigner} function.
   *
   * @param domain The domain data.
   * @param types A map of records pointing from field name to field type.
   * @param value A single record value.
   *
   * @example
   *
   * import { SmartAccount, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const signedTypedData = await account.signTypedData(
   *   {name: 'Example', version: '1', chainId: 270},
   *   {
   *     Person: [
   *       {name: 'name', type: 'string'},
   *       {name: 'age', type: 'uint8'},
   *     ],
   *   },
   *   {name: 'John', age: 30}
   * );
   */
  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    const populated = await TypedDataEncoder.resolveNames(
      domain,
      types,
      value,
      async (name: string) => {
        return ethers.resolveAddress(name, this.provider);
      }
    );

    return this.payloadSigner(
      TypedDataEncoder.hash(populated.domain, types, populated.value),
      this.secret,
      this.provider
    );
  }

  /**
   * Initiates the withdrawal process which withdraws ETH or any ERC20 token
   * from the associated account on L2 network to the target account on L1 network.
   *
   * @param transaction - Withdrawal transaction request.
   * @param transaction.token - The address of the token. ETH by default.
   * @param transaction.amount - The amount of the token to withdraw.
   * @param [transaction.to] - The address of the recipient on L1.
   * @param [transaction.bridgeAddress] - The address of the bridge contract to be used.
   * @param [transaction.paymasterParams] - Paymaster parameters.
   * @param [transaction.overrides] - Transaction's overrides which may be used to pass l2 gasLimit, gasPrice, value, etc.
   *
   * @returns A Promise resolving to a withdrawal transaction response.
   *
   * @example Withdraw ETH.
   *
   * import { SmartAccount, Provider, types, utils } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const withdrawTx = await account.withdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000n,
   * });
   *
   * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { SmartAccount, Provider, types, utils } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const withdrawTx = await account.withdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000n,
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   */
  async withdraw(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<TransactionResponse> {
    const withdrawTx = await checkProvider(this, 'getWithdrawTx').getWithdrawTx(
      {
        from: await this.getAddress(),
        ...transaction,
      }
    );
    return (await this.sendTransaction(withdrawTx)) as TransactionResponse;
  }

  /**
   * Transfer ETH or any ERC20 token within the same interface.
   *
   * @param transaction - Transfer transaction request.
   * @param transaction.to - The address of the recipient.
   * @param transaction.amount - The address of the recipient.
   * @param [transaction.token] - The address of the recipient.
   * @param [transaction.paymasterParams] - The address of the recipient.
   * @param [transaction.overrides] - The address of the recipient.
   *
   * @returns A Promise resolving to a transfer transaction response.
   *
   * @example Transfer ETH.
   *
   * import { SmartAccount, Wallet, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const transferTx = await account.transfer({
   *   token: utils.ETH_ADDRESS,
   *   to: Wallet.createRandom().address,
   *   amount: ethers.parseEther("0.01"),
   * });
   *
   * const receipt = await transferTx.wait();
   *
   * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
   *
   * @example Transfer ETH using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { SmartAccount, Wallet, Provider, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = new SmartAccount(
   *   {address: ADDRESS, secret: PRIVATE_KEY},
   *   provider
   * );
   *
   * const transferTx = await account.transfer({
   *   to: Wallet.createRandom().address,
   *   amount: ethers.parseEther("0.01"),
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   *
   * const receipt = await transferTx.wait();
   *
   * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
   */
  async transfer(transaction: {
    to: Address;
    amount: BigNumberish;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<TransactionResponse> {
    const transferTx = await checkProvider(this, 'getTransferTx').getTransferTx(
      {
        from: await this.getAddress(),
        ...transaction,
      }
    );
    return (await this.sendTransaction(transferTx)) as TransactionResponse;
  }
}

/**
 * A `ECDSASmartAccount` is a factory which creates a `SmartAccount` instance
 * that uses single ECDSA key for signing payload.
 */
export class ECDSASmartAccount {
  /**
   * Creates a `SmartAccount` instance that uses a single ECDSA key for signing payload.
   *
   * @param address The account address.
   * @param secret The ECDSA private key.
   * @param provider The provider to connect to.
   *
   * @example
   *
   * import { ECDSASmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = ECDSASmartAccount.create(ADDRESS, PRIVATE_KEY, provider);
   */
  static create(
    address: string,
    secret: string | SigningKey,
    provider: Provider
  ): SmartAccount {
    return new SmartAccount({address, secret}, provider);
  }
}

/**
 * A `MultisigECDSASmartAccount` is a factory which creates a `SmartAccount` instance
 * that uses multiple ECDSA keys for signing payloads.
 * The signature is generated by concatenating signatures created by signing with each key individually.
 */
export class MultisigECDSASmartAccount {
  /**
   * Creates a `SmartAccount` instance that uses multiple ECDSA keys for signing payloads.
   *
   * @param address The account address.
   * @param secret The list of the ECDSA private keys.
   * @param provider The provider to connect to.
   *
   * @example
   *
   * import { MultisigECDSASmartAccount, Provider, types } from "zksync-ethers";
   *
   * const ADDRESS = "<ADDRESS>";
   * const PRIVATE_KEY1 = "<PRIVATE_KEY1>";
   * const PRIVATE_KEY2 = "<PRIVATE_KEY2>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * const account = MultisigECDSASmartAccount.create(
   *   multisigAddress,
   *   [PRIVATE_KEY1, PRIVATE_KEY2],
   *   provider
   * );
   */
  static create(
    address: string,
    secret: string[] | SigningKey[],
    provider: Provider
  ): SmartAccount {
    return new SmartAccount(
      {
        address,
        secret,
        payloadSigner: signPayloadWithMultipleECDSA,
        transactionBuilder: populateTransactionMultisigECDSA,
      },
      provider
    );
  }
}
