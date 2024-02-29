import {BigNumber, BigNumberish, BytesLike, ethers, Overrides} from 'ethers';
import {Provider} from './provider';
import {
  DEFAULT_GAS_PER_PUBDATA_LIMIT,
  EIP712_TX_TYPE,
  hashBytecode,
  serialize,
} from './utils';
import {
  Address,
  BalancesMap,
  BlockTag,
  FinalizeWithdrawalParams,
  FullDepositFee,
  PaymasterParams,
  PriorityOpResponse,
  Signature,
  TransactionRequest,
  TransactionResponse,
} from './types';
import {TypedDataDomain, TypedDataSigner} from '@ethersproject/abstract-signer';
import {_TypedDataEncoder as TypedDataEncoder} from '@ethersproject/hash';
import {AdapterL1, AdapterL2} from './adapters';
import {Il2Bridge} from '../typechain/Il2Bridge';
import {IZkSync} from '../typechain/IZkSync';
import {Il1Bridge} from '../typechain/Il1Bridge';

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
  private eip712Domain: Promise<TypedDataDomain>;
  constructor(
    private ethSigner: ethers.Signer & TypedDataSigner,
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
   *   value: BigNumber.from(7_000_000),
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   nonce: 0,
   *   chainId: 270,
   *   gasPrice: BigNumber.from(250_000_000),
   *   gasLimit: BigNumber.from(21_000),
   *   customData: {},
   * });
   */
  static getSignInput(transaction: TransactionRequest) {
    const maxFeePerGas = transaction.maxFeePerGas ?? transaction.gasPrice ?? 0;
    const maxPriorityFeePerGas =
      transaction.maxPriorityFeePerGas || maxFeePerGas;
    const gasPerPubdataByteLimit =
      transaction.customData?.gasPerPubdata ?? DEFAULT_GAS_PER_PUBDATA_LIMIT;
    return {
      txType: transaction.type,
      from: transaction.from,
      to: transaction.to,
      gasLimit: transaction.gasLimit || 0,
      gasPerPubdataByteLimit: gasPerPubdataByteLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymaster:
        transaction.customData?.paymasterParams?.paymaster ||
        ethers.constants.AddressZero,
      nonce: transaction.nonce || 0,
      value: transaction.value || 0,
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
   * Signs a transaction request using EIP712
   *
   * @param transaction The transaction request that needs to be signed.
   * @returns A promise that resolves to the signature of the transaction.
   */
  async sign(transaction: TransactionRequest): Promise<Signature> {
    return await this.ethSigner._signTypedData(
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
    return TypedDataEncoder.hash(
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
 *
 */
export class Signer extends AdapterL2(ethers.providers.JsonRpcSigner) {
  public override provider!: Provider;
  public eip712!: EIP712Signer;

  override _signerL2() {
    return this;
  }

  override _providerL2() {
    return this.provider;
  }

  /**
   * @inheritDoc
   *
   * @example Get ETH balance
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * console.log(`ETH balance: ${await signer.getBalance()}`);
   *
   * @example Get token balance
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const token = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   *
   * console.log(`Token balance: ${await signer.getBalance(token)}`);
   */
  override async getBalance(
    token?: Address,
    blockTag: BlockTag = 'committed'
  ): Promise<BigNumber> {
    return super.getBalance(token, blockTag);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
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
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * console.log(`Nonce: ${await signer.getDeploymentNonce()}`);
   */
  override async getDeploymentNonce(): Promise<BigNumber> {
    return super.getDeploymentNonce();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const l2BridgeContracts = await signer.getL2BridgeContracts();
   */
  override async getL2BridgeContracts(): Promise<{
    erc20: Il2Bridge;
    weth: Il2Bridge;
  }> {
    return super.getL2BridgeContracts();
  }

  /**
   * @inheritDoc
   *
   * @example Withdraw ETH
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const tokenWithdrawHandle = await signer.withdraw({
   *   token: tokenL2,
   *   amount: 10_000_000,
   * });
   *
   * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const tokenWithdrawHandle = await wallet.withdraw({
   *   token: tokenL2,
   *   amount: 10_000_000,
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
   * @example Transfer ETH
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const recipient = Wallet.createRandom();
   *
   * const transferHandle = signer.transfer({
   *   to: recipient.address,
   *   amount: ethers.parseEther("0.01"),
   * });
   *
   * const tx = await transferHandle.wait();
   *
   * console.log(`The sum of ${tx.value} ETH was transferred to ${tx.to}`);
   *
   * @example Transfer ETH using paymaster to facilitate fee payment with an ERC20 token
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const recipient = Wallet.createRandom();
   *
   * const transferHandle = signer.transfer({
   *   to: recipient.address,
   *   amount: ethers.parseEther("0.01"),
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   *
   * const tx = await transferHandle.wait();
   *
   * console.log(`The sum of ${tx.value} ETH was transferred to ${tx.to}`);
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
   * Creates a new Singer with provided `signer`.
   *
   * @param signer  The signer from browser wallet.
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const signer = Signer.from(provider.getSigner() as any);
   */
  static from(
    signer: ethers.providers.JsonRpcSigner & {provider: Provider}
  ): Signer {
    const newSigner: Signer = Object.setPrototypeOf(signer, Signer.prototype);
    newSigner.eip712 = new EIP712Signer(newSigner, newSigner.getChainId());
    return newSigner;
  }

  /**
   * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
   *
   * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = provider.getSigner();
   *
   * const nonce = await signer.getNonce();
   */
  async getNonce(blockTag?: BlockTag) {
    return await this.getTransactionCount(blockTag);
  }

  /**
   * Broadcast the transaction to the network.
   *
   * @param transaction The transaction request that needs to be broadcast to the network.
   *
   * @throws {Error} If `transaction.from` is mismatched from the private key.
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
      transaction.from ??= address;
      if (transaction.from.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Transaction `from` address mismatch!');
      }
      transaction.type = EIP712_TX_TYPE;
      transaction.value ??= 0;
      transaction.data ??= '0x';
      transaction.nonce ??= await this.getNonce();
      transaction.customData = this._fillCustomData(
        transaction.customData ?? {}
      );
      transaction.gasPrice ??= await this.provider.getGasPrice();
      transaction.gasLimit ??= await this.provider.estimateGas(transaction);
      transaction.chainId ??= (await this.provider.getNetwork()).chainId;
      transaction.customData.customSignature =
        await this.eip712.sign(transaction);

      const txBytes = serialize(transaction);
      return await this.provider.sendTransaction(txBytes);
    }
  }
}

/**
 * A `L1Signer` is designed for frontend use with browser wallet injection (e.g., MetaMask),
 * providing only L1 operations.
 *
 * @see {@link Signer} for L2 operations.
 */
export class L1Signer extends AdapterL1(ethers.providers.JsonRpcSigner) {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const l1BridgeContracts = await signer.getL1BridgeContracts();
   */
  override async getL1BridgeContracts(): Promise<{
    erc20: Il1Bridge;
    weth: Il1Bridge;
  }> {
    return super.getL1BridgeContracts();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   *
   * // Getting token balance
   * console.log(await signer.getBalanceL1(tokenL1));
   *
   * // Getting ETH balance
   * console.log(await signer.getBalanceL1());
   */
  override async getBalanceL1(
    token?: Address,
    blockTag?: BlockTag
  ): Promise<BigNumber> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * console.log(`Token allowance: ${await signer.getAllowanceL1(tokenL1)}`);
   */
  override async getAllowanceL1(
    token: Address,
    bridgeAddress?: Address,
    blockTag?: BlockTag
  ): Promise<BigNumber> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * console.log(`Base cost: ${await signer.getBaseCost({ gasLimit: 100_000 })}`);
   */
  override async approveERC20(
    token: Address,
    amount: BigNumberish,
    overrides?: Overrides & {
      bridgeAddress?: Address;
    }
  ): Promise<ethers.providers.TransactionResponse> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * console.log(`Base cost: ${await signer.getBaseCost({ gasLimit: 100_000 })}`);
   */
  override async getBaseCost(params: {
    gasLimit: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    gasPrice?: BigNumberish;
  }): Promise<BigNumber> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const tokenDepositHandle = await signer.deposit({
   *   token: tokenL1,
   *   amount: "10000000",
   *   approveERC20: true,
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await tokenDepositHandle.waitL1Commit()`
   * await tokenDepositHandle.wait();
   *
   * const ethDepositHandle = await signer.deposit({
   *   token: utils.ETH_ADDRESS,
   *   amount: "10000000",
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await ethDepositHandle.waitL1Commit()`
   * await ethDepositHandle.wait();
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * const gas = await signer.estimateGasDeposit({
   *   token: tokenL1,
   *   amount: "10000000",
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
  }): Promise<BigNumber> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const tx = await signer.getDepositTx({
   *   token: tokenL1,
   *   amount: "10000000",
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
   * import { Provider, L1Signer, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const fee = await signer.getFullRequiredDepositFee({
   *   token: tokenL1,
   *   to: await wallet.getAddress(),
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const gasPrice = await signer.providerL1.getGasPrice();
   *
   * // The calldata can be encoded the same way as for Ethereum.
   * // Here is an example of how to get the calldata from an ABI:
   * const abi = [
   *   {
   *     inputs: [],
   *     name: "increment",
   *     outputs: [],
   *     stateMutability: "nonpayable",
   *     type: "function",
   *   },
   * ];
   * const contractInterface = new ethers.utils.Interface(abi);
   * const calldata = contractInterface.encodeFunctionData("increment", []);
   * const l2GasLimit = 1000n;
   *
   * const txCostPrice = await signer.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await signer.requestExecute({
   *   contractAddress: CONTRACT_ADDRESS,
   *   calldata,
   *   l2Value: 1,
   *   l2GasLimit,
   *   overrides: {
   *     gasPrice,
   *     value: txCostPrice,
   *   },
   * });
   *
   * await executeTx.wait();
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const finalizeWithdrawHandle = await signer.finalizeWithdrawal(WITHDRAWAL_HASH);
   */
  override async finalizeWithdrawal(
    withdrawalHash: BytesLike,
    index = 0,
    overrides?: Overrides
  ): Promise<ethers.ContractTransaction> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const FAILED_DEPOSIT_HASH = "<FAILED_DEPOSIT_TX_HASH>";
   * const claimFailedDepositHandle = await signer.claimFailedDeposit(FAILED_DEPOSIT_HASH);
   */
  override async claimFailedDeposit(
    depositHash: BytesLike,
    overrides?: Overrides
  ): Promise<ethers.ContractTransaction> {
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const gasPrice = await signer.providerL1.getGasPrice();
   *
   * // The calldata can be encoded the same way as for Ethereum.
   * // Here is an example of how to get the calldata from an ABI:
   * const abi = [
   *   {
   *     inputs: [],
   *     name: "increment",
   *     outputs: [],
   *     stateMutability: "nonpayable",
   *     type: "function",
   *   },
   * ];
   * const contractInterface = new ethers.utils.Interface(abi);
   * const calldata = contractInterface.encodeFunctionData("increment", []);
   * const l2GasLimit = 1000n;
   *
   * const txCostPrice = await signer.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await signer.requestExecute({
   *   contractAddress: CONTRACT_ADDRESS,
   *   calldata,
   *   l2Value: 1,
   *   l2GasLimit,
   *   overrides: {
   *     gasPrice,
   *     value: txCostPrice,
   *   },
   * });
   *
   * await executeTx.wait();
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const gasPrice = await signer.providerL1.getGasPrice();
   *
   * // The calldata can be encoded the same way as for Ethereum.
   * // Here is an example of how to get the calldata from an ABI:
   * const abi = [
   *   {
   *     inputs: [],
   *     name: "increment",
   *     outputs: [],
   *     stateMutability: "nonpayable",
   *     type: "function",
   *   },
   * ];
   * const contractInterface = new ethers.utils.Interface(abi);
   * const calldata = contractInterface.encodeFunctionData("increment", []);
   * const l2GasLimit = 1000n;
   *
   * const txCostPrice = await signer.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await signer.getRequestExecuteTx({
   *   contractAddress: CONTRACT_ADDRESS,
   *   calldata,
   *   l2Value: 1,
   *   l2GasLimit,
   *   overrides: {
   *     gasPrice,
   *     value: txCostPrice,
   *   },
   * });
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
  }): Promise<BigNumber> {
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   *
   * const gasPrice = await signer.providerL1.getGasPrice();
   *
   * // The calldata can be encoded the same way as for Ethereum.
   * // Here is an example of how to get the calldata from an ABI:
   * const abi = [
   *   {
   *     inputs: [],
   *     name: "increment",
   *     outputs: [],
   *     stateMutability: "nonpayable",
   *     type: "function",
   *   },
   * ];
   * const contractInterface = new ethers.utils.Interface(abi);
   * const calldata = contractInterface.encodeFunctionData("increment", []);
   * const l2GasLimit = 1000n;
   *
   * const txCostPrice = await signer.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await signer.getRequestExecuteTx({
   *   contractAddress: CONTRACT_ADDRESS,
   *   calldata,
   *   l2Value: 1,
   *   l2GasLimit,
   *   overrides: {
   *     gasPrice,
   *     value: txCostPrice,
   *   },
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
  }): Promise<ethers.PopulatedTransaction> {
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
   * const provider = new ethers.providers.Web3Provider(window.ethereum);
   * const zksyncProvider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const signer = L1Signer.from(provider.getSigner(), zksyncProvider);
   */
  static from(
    signer: ethers.providers.JsonRpcSigner,
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
   */
  connectToL2(provider: Provider): this {
    this.providerL2 = provider;
    return this;
  }
}
/* c8 ignore stop */
