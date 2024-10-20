import {
  BigNumberish,
  BlockTag,
  BytesLike,
  ContractTransactionResponse,
  ethers,
  Overrides,
} from 'ethers';
import {Provider} from './provider';
import {
  DEFAULT_GAS_PER_PUBDATA_LIMIT,
  EIP712_TX_TYPE,
  hashBytecode,
  serializeEip712,
} from './utils';
import {
  Address,
  BalancesMap,
  FinalizeWithdrawalParams,
  FullDepositFee,
  PaymasterParams,
  PriorityOpResponse,
  Signature,
  TransactionLike,
  TransactionRequest,
  TransactionResponse,
} from './types';
import {AdapterL1, AdapterL2} from './adapters';
import {IL1Bridge, IL2Bridge, IZkSync} from './typechain';

/**
 * All typed data conforming to the EIP712 standard within zkSync Era.
 */
export const EIP712_TYPES = {
  Transaction: [
    {name: 'txType', type: 'uint256'},
    {name: 'from', type: 'uint256'},
    {name: 'to', type: 'uint256'},
    {name: 'gasLimit', type: 'uint256'},
    {name: 'gasPerPubdataByteLimit', type: 'uint256'},
    {name: 'maxFeePerGas', type: 'uint256'},
    {name: 'maxPriorityFeePerGas', type: 'uint256'},
    {name: 'paymaster', type: 'uint256'},
    {name: 'nonce', type: 'uint256'},
    {name: 'value', type: 'uint256'},
    {name: 'data', type: 'bytes'},
    {name: 'factoryDeps', type: 'bytes32[]'},
    {name: 'paymasterInput', type: 'bytes'},
  ],
};

/**
 * A `EIP712Signer` provides support for signing EIP712-typed zkSync Era transactions.
 */
export class EIP712Signer {
  private eip712Domain: Promise<ethers.TypedDataDomain>;

  constructor(
    private ethSigner: ethers.Signer,
    chainId: number | Promise<number>
  ) {
    this.eip712Domain = Promise.resolve(chainId).then(chainId => ({
      name: 'zkSync',
      version: '2',
      chainId,
    }));
  }

  /**
   * Generates the EIP712 typed data from provided transaction. Optional fields are populated by zero values.
   *
   * @param transaction The transaction request that needs to be populated.
   *
   * @example
   *
   * const tx = EIP712Signer.getSignInput({
   *   type: utils.EIP712_TX_TYPE,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   value: BigInt(7_000_000),
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   nonce: 0,
   *   chainId: BigInt(270),
   *   gasPrice: BigInt(250_000_000),
   *   gasLimit: BigInt(21_000),
   *   customData: {},
   * });
   */
  static getSignInput(transaction: TransactionRequest) {
    const maxFeePerGas = transaction.maxFeePerGas || transaction.gasPrice || 0n;
    const maxPriorityFeePerGas =
      transaction.maxPriorityFeePerGas || maxFeePerGas;
    const gasPerPubdataByteLimit =
      transaction.customData?.gasPerPubdata || DEFAULT_GAS_PER_PUBDATA_LIMIT;
    return {
      txType: transaction.type || EIP712_TX_TYPE,
      from: transaction.from,
      to: transaction.to,
      gasLimit: transaction.gasLimit || 0n,
      gasPerPubdataByteLimit: gasPerPubdataByteLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymaster:
        transaction.customData?.paymasterParams?.paymaster ||
        ethers.ZeroAddress,
      nonce: transaction.nonce || 0,
      value: transaction.value || 0n,
      data: transaction.data || '0x',
      factoryDeps:
        transaction.customData?.factoryDeps?.map((dep: any) =>
          hashBytecode(dep)
        ) || [],
      paymasterInput:
        transaction.customData?.paymasterParams?.paymasterInput || '0x',
    };
  }

  /**
   * Signs a transaction request using EIP712.
   *
   * @param transaction The transaction request that needs to be signed.
   * @returns A promise that resolves to the signature of the transaction.
   */
  async sign(transaction: TransactionRequest): Promise<Signature> {
    return await this.ethSigner.signTypedData(
      await this.eip712Domain,
      EIP712_TYPES,
      EIP712Signer.getSignInput(transaction)
    );
  }

  /**
   * Hashes the transaction request using EIP712.
   *
   * @param transaction The transaction request that needs to be hashed.
   * @returns A hash (digest) of the transaction request.
   *
   * @throws {Error} If `transaction.chainId` is not set.
   */
  static getSignedDigest(transaction: TransactionRequest): ethers.BytesLike {
    if (!transaction.chainId) {
      throw Error("Transaction chainId isn't set!");
    }
    const domain = {
      name: 'zkSync',
      version: '2',
      chainId: transaction.chainId,
    };
    return ethers.TypedDataEncoder.hash(
      domain,
      EIP712_TYPES,
      EIP712Signer.getSignInput(transaction)
    );
  }

  /**
   * Returns zkSync Era EIP712 domain.
   */
  async getDomain(): Promise<ethers.TypedDataDomain> {
    return await this.eip712Domain;
  }
}

/* c8 ignore start */
/**
 * A `Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L2 operations.
 *
 * @see {@link L1Signer} for L1 operations.
 */
export class Signer extends AdapterL2(ethers.JsonRpcSigner) {
  public override provider!: Provider;
  public eip712!: EIP712Signer;
  protected providerL2?: Provider;

  override _signerL2() {
    return this;
  }

  override _providerL2() {
    // Make it compatible when singer is created with Web3Provider.getSigner()
    return this.providerL2 ? this.providerL2 : this.provider;
  }

  /**
   * @inheritDoc
   *
   * @example Get ETH balance.
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * console.log(`ETH balance: ${await signer.getBalance()}`);
   *
   * @example Get token balance.
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const token = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   *
   * console.log(`Token balance: ${await signer.getBalance(token)}`);
   */
  override async getBalance(
    token?: Address,
    blockTag: BlockTag = 'committed'
  ): Promise<bigint> {
    return super.getBalance(token, blockTag);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const allBalances = await signer.getAllBalances();
   */
  override async getAllBalances(): Promise<BalancesMap> {
    return super.getAllBalances();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * console.log(`Nonce: ${await signer.getDeploymentNonce()}`);
   */
  override async getDeploymentNonce(): Promise<bigint> {
    return super.getDeploymentNonce();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const l2BridgeContracts = await signer.getL2BridgeContracts();
   */
  override async getL2BridgeContracts(): Promise<{
    erc20: IL2Bridge;
    weth: IL2Bridge;
  }> {
    return super.getL2BridgeContracts();
  }

  /**
   * @inheritDoc
   *
   * @example Withdraw ETH.
   *
   * import { BrowserProvider, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const withdrawTx = await signer.withdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000n,
   * });
   *
   * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { BrowserProvider, Provider, types, utils } from "zksync-ethers";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const withdrawTx = await signer.withdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000n,
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   *
   * @example Withdraw token.
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const withdrawTx = await signer.withdraw({
   *   token: tokenL2,
   *   amount: 10_000_000n,
   * });
   *
   * @example Withdraw token using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const withdrawTx = await signer.withdraw({
   *   token: tokenL2,
   *   amount: 10_000_000n,
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   */
  override async withdraw(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: Overrides;
  }): Promise<TransactionResponse> {
    return super.withdraw(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example Transfer ETH.
   *
   * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const transferTx = await signer.transfer({
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
   * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = await Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const transferTx = signer.transfer({
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
   *
   * @example Transfer token.
   *
   * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const transferTx = await signer.transfer({
   *   token: tokenL2,
   *   to: Wallet.createRandom().address,
   *   amount: ethers.parseEther("0.01"),
   * });
   *
   * const receipt = await transferTx.wait();
   *
   * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
   *
   * @example Transfer token using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = await Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const transferTx = signer.transfer({
   *   token: tokenL2,
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
   * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
   */
  override async transfer(transaction: {
    to: Address;
    amount: BigNumberish;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: Overrides;
  }): Promise<TransactionResponse> {
    return super.transfer(transaction);
  }

  /**
   * Creates a new Singer with provided `signer` and `chainId`.
   *
   * @param signer  The signer from browser wallet.
   * @param chainId The chain ID of the network.
   * @param [zksyncProvider] The provider instance for connecting to a L2 network. If not provided,
   * the methods from the `zks` namespace are not supported, and interaction with them will result in an error.
   *
   * @example
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   */
  static from(
    signer: ethers.JsonRpcSigner & {provider: Provider},
    chainId: number,
    zksyncProvider?: Provider
  ): Signer {
    const newSigner: Signer = Object.setPrototypeOf(signer, Signer.prototype);
    newSigner.eip712 = new EIP712Signer(newSigner, chainId);
    newSigner.providerL2 = zksyncProvider;
    return newSigner;
  }

  /**
   * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
   *
   * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
   *
   * import { BrowserProvider, Provider, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const nonce = await signer.getNonce();
   */
  override async getNonce(blockTag?: BlockTag): Promise<number> {
    return super.getNonce(blockTag);
  }

  /**
   * Broadcast the transaction to the network.
   *
   * @param transaction The transaction request that needs to be broadcast to the network.
   *
   * @throws {Error} If `transaction.from` is mismatched from the private key.
   *
   * @example
   *
   * import { BrowserProvider, Provider, Wallet, types } from "zksync-ethers";
   *
   * const browserProvider = new BrowserProvider(window.ethereum);
   * const signer = Signer.from(
   *     await browserProvider.getSigner(),
   *     Number((await browserProvider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * signer.sendTransaction({
   *     to: Wallet.createRandom().address,
   *     value: 10_000_000n
   * });
   */
  override async sendTransaction(
    transaction: TransactionRequest
  ): Promise<TransactionResponse> {
    if (!transaction.customData && !transaction.type) {
      // use legacy txs by default
      transaction.type = 0;
    }
    if (!transaction.customData && transaction.type !== EIP712_TX_TYPE) {
      return (await super.sendTransaction(transaction)) as TransactionResponse;
    } else {
      const address = await this.getAddress();
      const from = !transaction.from
        ? address
        : await ethers.resolveAddress(transaction.from);
      if (from.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Transaction `from` address mismatch!');
      }
      const tx: TransactionLike = {
        type: transaction.type ?? EIP712_TX_TYPE,
        value: transaction.value ?? 0,
        data: transaction.data ?? '0x',
        nonce: transaction.nonce ?? (await this.getNonce()),
        gasPrice: transaction.gasPrice ?? (await this.provider.getGasPrice()),
        gasLimit:
          transaction.gasLimit ??
          (await this.provider.estimateGas(transaction)),
        chainId:
          transaction.chainId ?? (await this.provider.getNetwork()).chainId,
        to: await ethers.resolveAddress(transaction.to!),
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

/**
 * A `L1Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L1 operations.
 *
 * @see {@link Signer} for L2 operations.
 */
export class L1Signer extends AdapterL1(ethers.JsonRpcSigner) {
  public providerL2!: Provider;
  override _providerL2() {
    return this.providerL2;
  }

  override _providerL1() {
    return this.provider;
  }

  override _signerL1() {
    return this;
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const mainContract = await signer.getMainContract();
   * console.log(mainContract.address);
   */
  override async getMainContract(): Promise<IZkSync> {
    return super.getMainContract();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const l1BridgeContracts = await signer.getL1BridgeContracts();
   */
  override async getL1BridgeContracts(): Promise<{
    erc20: IL1Bridge;
    weth: IL1Bridge;
  }> {
    return super.getL1BridgeContracts();
  }

  /**
   * @inheritDoc
   *
   * @example Get ETH balance.
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * console.log(await signer.getBalanceL1());
   *
   * @example Get token balance.
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   *
   * console.log(await signer.getBalanceL1(tokenL1));
   */
  override async getBalanceL1(
    token?: Address,
    blockTag?: BlockTag
  ): Promise<bigint> {
    return super.getBalanceL1(token, blockTag);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * console.log(`Token allowance: ${await signer.getAllowanceL1(tokenL1)}`);
   */
  override async getAllowanceL1(
    token: Address,
    bridgeAddress?: Address,
    blockTag?: BlockTag
  ): Promise<bigint> {
    return super.getAllowanceL1(token, bridgeAddress, blockTag);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   *
   * console.log(`Token L2 address: ${await signer.l2TokenAddress(tokenL1)}`);
   */
  override async l2TokenAddress(token: Address): Promise<string> {
    return super.l2TokenAddress(token);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * await signer.approveERC20(tokenL1, 5);
   */
  override async approveERC20(
    token: Address,
    amount: BigNumberish,
    overrides?: Overrides & {
      bridgeAddress?: Address;
    }
  ): Promise<ethers.TransactionResponse> {
    return super.approveERC20(token, amount, overrides);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * console.log(`Base cost: ${await signer.getBaseCost({ gasLimit: 100_000 })}`);
   */
  override async getBaseCost(params: {
    gasLimit: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    gasPrice?: BigNumberish;
  }): Promise<bigint> {
    return super.getBaseCost(params);
  }

  /**
   * @inheritDoc
   *
   * @example Deposit ETH.
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * await signer.deposit({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000n,
   * });
   *
   * @example Deposit token.
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * await signer.deposit({
   *   token: tokenL1,
   *   amount: 10_000_000n,
   *   approveERC20: true,
   * });
   */
  override async deposit(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    operatorTip?: BigNumberish;
    bridgeAddress?: Address;
    approveERC20?: boolean;
    l2GasLimit?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
    approveOverrides?: Overrides;
    customBridgeData?: BytesLike;
  }): Promise<PriorityOpResponse> {
    return super.deposit(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * const gas = await signer.estimateGasDeposit({
   *   token: tokenL1,
   *   amount: 10_000_000n,
   * });
   * console.log(`Gas: ${gas}`);
   */
  override async estimateGasDeposit(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    operatorTip?: BigNumberish;
    bridgeAddress?: Address;
    customBridgeData?: BytesLike;
    l2GasLimit?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<bigint> {
    return super.estimateGasDeposit(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const tx = await signer.getDepositTx({
   *   token: tokenL1,
   *   amount: 10_000_000n,
   * });
   */
  override async getDepositTx(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    operatorTip?: BigNumberish;
    bridgeAddress?: Address;
    l2GasLimit?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    customBridgeData?: BytesLike;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<any> {
    return super.getDepositTx(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, Wallet, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const fee = await signer.getFullRequiredDepositFee({
   *   token: tokenL1,
   *   to: Wallet.createRandom().address,
   * });
   * console.log(`Fee: ${fee}`);
   */
  override async getFullRequiredDepositFee(transaction: {
    token: Address;
    to?: Address;
    bridgeAddress?: Address;
    customBridgeData?: BytesLike;
    gasPerPubdataByte?: BigNumberish;
    overrides?: Overrides;
  }): Promise<FullDepositFee> {
    return super.getFullRequiredDepositFee(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const params = await signer.finalizeWithdrawalParams(WITHDRAWAL_HASH);
   */
  override async finalizeWithdrawalParams(
    withdrawalHash: BytesLike,
    index = 0
  ): Promise<FinalizeWithdrawalParams> {
    return super.finalizeWithdrawalParams(withdrawalHash, index);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const finalizeWithdrawTx = await signer.finalizeWithdrawal(WITHDRAWAL_HASH);
   */
  override async finalizeWithdrawal(
    withdrawalHash: BytesLike,
    index = 0,
    overrides?: Overrides
  ): Promise<ContractTransactionResponse> {
    return super.finalizeWithdrawal(withdrawalHash, index, overrides);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const isFinalized = await signer.isWithdrawalFinalized(WITHDRAWAL_HASH);
   */
  override async isWithdrawalFinalized(
    withdrawalHash: BytesLike,
    index = 0
  ): Promise<boolean> {
    return super.isWithdrawalFinalized(withdrawalHash, index);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const FAILED_DEPOSIT_HASH = "<FAILED_DEPOSIT_TX_HASH>";
   * const claimFailedDepositTx = await signer.claimFailedDeposit(FAILED_DEPOSIT_HASH);
   */
  override async claimFailedDeposit(
    depositHash: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransactionResponse> {
    return super.claimFailedDeposit(depositHash, overrides);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * await signer.requestExecute({
   *     contractAddress: await signer.providerL2.getMainContractAddress(),
   *     calldata: "0x",
   *     l2Value: 7_000_000_000,
   * });
   */
  override async requestExecute(transaction: {
    contractAddress: Address;
    calldata: string;
    l2GasLimit: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<PriorityOpResponse> {
    return super.requestExecute(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const gas = await signer.estimateGasRequestExecute({
   *     contractAddress: await signer.providerL2.getMainContractAddress(),
   *     calldata: "0x",
   *     l2Value: 7_000_000_000,
   * });
   * console.log(`Gas: ${gas}`);
   */
  override async estimateGasRequestExecute(transaction: {
    contractAddress: Address;
    calldata: string;
    l2GasLimit?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<bigint> {
    return super.estimateGasRequestExecute(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const tx = await signer.getRequestExecuteTx({
   *     contractAddress: await signer.providerL2.getMainContractAddress(),
   *     calldata: "0x",
   *     l2Value: 7_000_000_000,
   * });
   */
  override async getRequestExecuteTx(transaction: {
    contractAddress: Address;
    calldata: string;
    l2GasLimit?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<TransactionRequest> {
    return super.getRequestExecuteTx(transaction);
  }

  /**
   * Creates a new L1Singer with provided `signer` and `zksyncProvider`.
   *
   * @param signer  The signer from browser wallet.
   * @param zksyncProvider The provider instance for connecting to a L2 network.
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   */
  static from(
    signer: ethers.JsonRpcSigner,
    zksyncProvider: Provider
  ): L1Signer {
    const newSigner: L1Signer = Object.setPrototypeOf(
      signer,
      L1Signer.prototype
    );
    newSigner.providerL2 = zksyncProvider;
    return newSigner;
  }

  /**
   * Connects to the L2 network using the `provider`.
   *
   * @param provider The provider instance for connecting to a L2 network.
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const browserProvider = new ethers.BrowserProvider(window.ethereum);
   * const signer = L1Signer.from(
   *     await browserProvider.getSigner(),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * signer.connectToL2(Provider.getDefaultProvider(types.Network.Mainnet));
   */
  connectToL2(provider: Provider): this {
    this.providerL2 = provider;
    return this;
  }
}
/* c8 ignore stop */

/**
 * A `L2VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L2 operations.
 *
 * @see {@link L1VoidSigner} for L1 operations.
 */
export class L2VoidSigner extends AdapterL2(ethers.VoidSigner) {
  public override provider!: Provider;

  override _signerL2() {
    return this;
  }

  override _providerL2(): Provider {
    return this.provider;
  }

  /**
   * Connects to the L2 network using the `provider`.
   *
   * @param provider The provider instance for connecting to a L2 network.
   *
   * @example
   *
   * import { Provider, L2VoidSigner, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * let signer = new L2VoidSigner("<ADDRESS>");
   * signer = signer.connect(provider);
   */
  override connect(provider: Provider): L2VoidSigner {
    return new L2VoidSigner(this.address, provider);
  }

  /**
   * Designed for users who prefer a simplified approach by providing only the necessary data to create a valid transaction.
   * The only required fields are `transaction.to` and either `transaction.data` or `transaction.value` (or both, if the method is payable).
   * Any other fields that are not set will be prepared by this method.
   *
   * @param tx The transaction request that needs to be populated.
   *
   * @example
   *
   * import { Provider, L2VoidSigner, Wallet, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = new L2VoidSigner("<ADDRESS>", provider);
   *
   * const populatedTx = await signer.populateTransaction({
   *   to: Wallet.createRandom().address,
   *   value: 7_000_000n,
   *   maxFeePerGas: 3_500_000_000n,
   *   maxPriorityFeePerGas: 2_000_000_000n,
   *   customData: {
   *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
   *     factoryDeps: [],
   *   },
   * });
   */
  override async populateTransaction(
    tx: TransactionRequest
  ): Promise<TransactionLike> {
    if ((!tx.type || tx.type !== EIP712_TX_TYPE) && !tx.customData) {
      return (await super.populateTransaction(tx)) as TransactionLike;
    }

    tx.type = EIP712_TX_TYPE;
    const populated = (await super.populateTransaction(tx)) as TransactionLike;

    populated.type = EIP712_TX_TYPE;
    populated.value ??= 0;
    populated.data ??= '0x';
    populated.customData = this._fillCustomData(tx.customData ?? {});
    if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
      populated.gasPrice = await this.provider.getGasPrice();
    }
    return populated;
  }
}

/**
 * A `L1VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L1 operations.
 *
 * @see {@link L2VoidSigner} for L2 operations.
 */
export class L1VoidSigner extends AdapterL1(ethers.VoidSigner) {
  public providerL2?: Provider;

  override _providerL2(): Provider {
    if (!this.providerL2) {
      throw new Error('L2 provider missing: use `connectToL2` to specify!');
    }
    return this.providerL2;
  }

  override _providerL1(): ethers.Provider {
    return this.provider as ethers.Provider;
  }

  override _signerL1() {
    return this;
  }

  /**
   * @param address The address of the account.
   * @param providerL1 The provider instance for connecting to a L1 network.
   * @param providerL2 The provider instance for connecting to a L2 network.
   *
   * @example
   *
   * import { Provider, L1VoidSigner, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const signer = new L1VoidSigner("<ADDRESS>", ethProvider, provider);
   */
  constructor(
    address: string,
    providerL1?: ethers.Provider,
    providerL2?: Provider
  ) {
    super(address, providerL1);
    this.providerL2 = providerL2;
  }

  /**
   * Connects to the L1 network using the `provider`.
   *
   * @param provider The provider instance for connecting to a L1 network.
   *
   * @example
   *
   * import { L1VoidSigner } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   *
   * let singer = new L1VoidSigner("<ADDRESS>);
   * singer = singer.connect(ethProvider);
   */
  override connect(provider: ethers.Provider): L1VoidSigner {
    return new L1VoidSigner(this.address, provider);
  }

  /**
   * Returns the balance of the account.
   *
   * @param [token] The token address to query balance for. Defaults to the native token.
   * @param [blockTag='committed'] The block tag to get the balance at.
   *
   * @example
   *
   * import { L1VoidSigner } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   *
   * const signer = new L1VoidSigner("<ADDRESS>);
   * const balance = await signer.getBalance();
   */
  async getBalance(
    token?: Address,
    blockTag: BlockTag = 'committed'
  ): Promise<bigint> {
    return await this._providerL2().getBalance(
      await this.getAddress(),
      blockTag,
      token
    );
  }

  /**
   * Connects to the L2 network using the `provider`.
   *
   * @param provider The provider instance for connecting to a L2 network.
   *
   * @example
   *
   * import { Provider, L1VoidSigner, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * let signer = new L1VoidSigner("<ADDRESS>");
   * signer = signer.connectToL2(provider);
   */
  connectToL2(provider: Provider): this {
    this.providerL2 = provider;
    return this;
  }
}
