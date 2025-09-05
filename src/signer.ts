import {
  BigNumberish,
  BlockTag,
  BytesLike,
  ContractTransactionResponse,
  ethers,
  Overrides,
  copyRequest,
} from 'ethers';
import {Provider} from './provider';
import {isAddressEq, resolveFeeData} from './utils';
import {
  Address,
  FinalizeWithdrawalParams,
  FullDepositFee,
  PriorityOpResponse,
  TransactionResponse,
} from './types';
import {AdapterL1, AdapterL2} from './adapters';
import {
  IBridgehub,
  IL1ERC20Bridge,
  IL1SharedBridge,
  IL2Bridge,
  IL2SharedBridge,
  IZkSyncHyperchain,
} from './typechain';

/* c8 ignore start */
/**
 * A `Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L2 operations.
 *
 * @see {@link L1Signer} for L1 operations.
 */
export class Signer extends AdapterL2(ethers.JsonRpcSigner) {
  public override provider!: Provider;
  protected providerL2?: Provider;

  override _signerL2() {
    return this;
  }

  override _providerL2() {
    // Make it compatible when singer is created with BrowserProvider.getSigner()
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
    shared: IL2SharedBridge;
  }> {
    return super.getL2BridgeContracts();
  }

  /**
   * @inheritDoc
   *
   * @example Withdraw token.
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
   */
  override async withdraw(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    bridgeAddress?: Address;
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
   */
  override async transfer(transaction: {
    to: Address;
    amount: BigNumberish;
    token?: Address;
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
    zksyncProvider?: Provider
  ): Signer {
    const newSigner: Signer = Object.setPrototypeOf(signer, Signer.prototype);
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
    transaction: ethers.TransactionRequest
  ): Promise<TransactionResponse> {
    const address = await this.getAddress();
    transaction.from ??= address;
    const tx = await this.populateFeeData(transaction);
    if (!isAddressEq(await ethers.resolveAddress(tx.from!), address)) {
      throw new Error('Transaction `from` address mismatch!');
    }

    return (await super.sendTransaction(tx)) as TransactionResponse;
  }

  protected async populateFeeData(
    transaction: ethers.TransactionRequest
  ): Promise<ethers.PreparedTransactionRequest> {
    const tx = copyRequest(transaction);

    if (tx.gasPrice && (tx.maxFeePerGas || tx.maxPriorityFeePerGas)) {
      throw new Error(
        'Provide combination of maxFeePerGas and maxPriorityFeePerGas or provide gasPrice. Not both!'
      );
    }
    if (!this.providerL2) {
      throw new Error('Initialize provider L2');
    }
    const {gasLimit, gasPrice} = await resolveFeeData(
      tx as ethers.TransactionLike,
      this.provider
    );

    tx.gasLimit = ethers.getBigInt(gasLimit);
    if (!tx.gasPrice && tx.type === 0) {
      tx.gasPrice = ethers.getBigInt(gasPrice);
    } else if (!tx.gasPrice && tx.type !== 0) {
      tx.maxFeePerGas = ethers.getBigInt(gasPrice);
      tx.maxPriorityFeePerGas ??= BigInt(0);
    }
    return tx;
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
   */
  override async getMainContract(): Promise<IZkSyncHyperchain> {
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
   * const bridgehub = await signer.getBridgehubContract();
   */
  override async getBridgehubContract(): Promise<IBridgehub> {
    return super.getBridgehubContract();
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
    erc20: IL1ERC20Bridge;
    weth: IL1ERC20Bridge;
    shared: IL1SharedBridge;
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const tokenL2 = "0xe1134444211593Cfda9fc9eCc7B43208615556E2";
   *
   * console.log(`Token L1 address: ${await wallet.l1TokenAddress(tokenL1)}`);
   */
  override async l1TokenAddress(token: Address): Promise<string> {
    return super.l1TokenAddress(token);
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
   * console.log(`Base token: ${await signer.getBaseToken()}`);
   */
  override async getBaseToken(): Promise<string> {
    return super.getBaseToken();
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
   * console.log(`Is ETH-based chain: ${await signer.isETHBasedChain()}`);
   */
  override async isETHBasedChain(): Promise<boolean> {
    return super.isETHBasedChain();
  }

  /**
   * @inheritDoc
   *
   * @example Get allowance parameters for depositing ETH on ETH-based chain.
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
   * const token = "<L1_TOKEN>";
   * const amount = 5;
   * const approveParams = await signer.getDepositAllowanceParams(token, amount);
   *
   * await (
   *    await signer.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * @example Get allowance parameters for depositing ETH on non-ETH-based chain.
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
   * const token = utils.LEGACY_ETH_ADDRESS;
   * const amount = 5;
   * const approveParams = await signer.getDepositAllowanceParams(token, amount);
   * await (
   *    await signer.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * @example Get allowance parameters for depositing base token on non-ETH-based chain.
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
   * const token = await signer.getBaseToken();
   * const amount = 5;
   * const approveParams = await signer.getDepositAllowanceParams(token, amount);
   * await (
   *    await signer.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * @example Get allowance parameters for depositing non-base token on non-ETH-based chain.
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
   * const token = "<L1_TOKEN>";
   * const amount = 5;
   * const approveParams = await signer.getDepositAllowanceParams(token, amount);
   *
   * await (
   *    await signer.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * await (
   *    await signer.approveERC20(
   *        approveParams[1].token,
   *        approveParams[1].allowance
   *    )
   * ).wait();
   */
  override async getDepositAllowanceParams(
    token: Address,
    amount: BigNumberish,
    overrides?: ethers.Overrides
  ): Promise<
    {
      token: Address;
      allowance: BigNumberish;
    }[]
  > {
    return super.getDepositAllowanceParams(token, amount, overrides);
  }

  /**
   * @inheritDoc
   *
   * @example Deposit ETH on ETH-based chain.
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
   * @example Deposit token on ETH-based chain.
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
   *
   * @example Deposit ETH on non-ETH-chain.
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
   *   amount: 10_000_000,
   *   approveBaseERC20: true,
   * });
   *
   * @example Deposit base token on non-ETH-based chain.
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
   *   token: await signer.getBaseToken(),
   *   amount: 10_000_000,
   *   approveERC20: true, // or approveBaseERC20: true
   * });
   *
   * @example Deposit non-base token on non-ETH-based chain.
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
   *   amount: 10_000_000,
   *   approveERC20: true,
   *   approveBaseERC20: true,
   * });
   */
  override async deposit(transaction: {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    operatorTip?: BigNumberish;
    bridgeAddress?: Address;
    approveERC20?: boolean;
    approveBaseERC20?: boolean;
    l2GasLimit?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
    approveOverrides?: Overrides;
    approveBaseOverrides?: Overrides;
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
   * const params = await signer.getFinalizeWithdrawalParams(WITHDRAWAL_HASH);
   */
  override async getFinalizeWithdrawalParams(
    withdrawalHash: BytesLike,
    index = 0
  ): Promise<FinalizeWithdrawalParams> {
    return super.getFinalizeWithdrawalParams(withdrawalHash, index);
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
   * const tx = {
   *    contractAddress: await signer.getAddress(),
   *    calldata: '0x',
   *    l2Value: 7_000_000_000,
   * };
   *
   * const approveParams = await signer.getRequestExecuteAllowanceParams(tx);
   * await (
   *    await signer.approveERC20(
   *        approveParams.token,
   *        approveParams.allowance
   *    )
   * ).wait();
   */
  override async getRequestExecuteAllowanceParams(transaction: {
    contractAddress: Address;
    calldata: string;
    l2GasLimit?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<{token: Address; allowance: BigNumberish}> {
    return super.getRequestExecuteAllowanceParams(transaction);
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
    l2GasLimit?: BigNumberish;
    mintValue?: BigNumberish;
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
    mintValue?: BigNumberish;
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
    mintValue?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: Overrides;
  }): Promise<ethers.TransactionRequest> {
    return super.getRequestExecuteTx(transaction);
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
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Confirmation data: ${utils.toJSON(await signer.getPriorityOpConfirmation(tx, 0))}`);
   */
  override async getPriorityOpConfirmation(
    txHash: string,
    index = 0
  ): Promise<{
    l1BatchNumber: number;
    l2MessageIndex: number;
    l2TxNumberInBlock: number;
    proof: string[];
  }> {
    return super.getPriorityOpConfirmation(txHash, index);
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
 * @deprecated In favor of {@link VoidSigner}
 *
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
  // override async populateTransaction(
  //   tx: ethers.TransactionRequest
  // ): Promise<ethers.TransactionLike> {
  //   tx.type = 2;
  //   const populated = (await super.populateTransaction(
  //     tx
  //   )) as ethers.TransactionLike;

  //   populated.value ??= 0;
  //   populated.data ??= '0x';
  //   if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
  //     populated.gasPrice = await this.provider.getGasPrice();
  //   }
  //   return populated;
  // }

  override async sendTransaction(
    tx: ethers.TransactionRequest
  ): Promise<TransactionResponse> {
    const populated = await this.populateTransaction(tx);

    return this.provider.broadcastTransaction(
      await this.signTransaction(populated)
    );
  }
}

/**
 * A `VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L2 operations.
 *
 * @see {@link L1VoidSigner} for L1 operations.
 */
export class VoidSigner extends AdapterL2(ethers.VoidSigner) {
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
   * let signer = new VoidSigner("<ADDRESS>");
   * signer = signer.connect(provider);
   */
  override connect(provider: Provider): VoidSigner {
    return new VoidSigner(this.address, provider);
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
   * import { Provider, VoidSigner, Wallet, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = new VoidSigner("<ADDRESS>", provider);
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
  // override async populateTransaction(
  //   tx: ethers.TransactionRequest
  // ): Promise<ethers.TransactionLike> {
  //   tx.type = 2;
  //   const populated = (await super.populateTransaction(
  //     tx
  //   )) as ethers.TransactionLike;

  //   populated.value ??= 0;
  //   populated.data ??= '0x';
  //   if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
  //     populated.gasPrice = await this.provider.getGasPrice();
  //   }
  //   return populated;
  // }

  override async sendTransaction(
    tx: ethers.TransactionRequest
  ): Promise<TransactionResponse> {
    const populated = await this.populateTransaction(tx);

    return this.provider.broadcastTransaction(
      await this.signTransaction(populated)
    );
  }
}

/**
 * A `L1VoidSigner` is an extension of {@link ethers.VoidSigner} class providing only L1 operations.
 *
 * @see {@link VoidSigner} for L2 operations.
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
  async getBalance(token?: Address, blockTag?: BlockTag): Promise<bigint> {
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
