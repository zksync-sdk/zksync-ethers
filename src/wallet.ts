import {EIP712Signer} from './signer';
import {Provider} from './provider';
import {serialize, EIP712_TX_TYPE} from './utils';
import {
  BigNumber,
  BigNumberish,
  Bytes,
  BytesLike,
  ethers,
  Overrides,
  PopulatedTransaction,
  utils,
} from 'ethers';
import {
  BlockTag,
  TransactionResponse,
  TransactionRequest,
  Address,
  PriorityOpResponse,
  FullDepositFee,
  FinalizeWithdrawalParams,
  BalancesMap,
  PaymasterParams,
} from './types';
import {ProgressCallback} from '@ethersproject/json-wallets';
import {AdapterL1, AdapterL2} from './adapters';
import {IZkSyncHyperchain} from './typechain/IZkSyncHyperchain';
import {Il1Erc20Bridge as IL1ERC20Bridge} from './typechain/Il1Erc20Bridge';
import {Il1SharedBridge as IL1SharedBridge} from './typechain/Il1SharedBridge';
import {Il2Bridge as IL2Bridge} from './typechain/Il2Bridge';
import {IBridgehub} from './typechain/IBridgehub';
import {Il2SharedBridge} from './typechain/Il2SharedBridge';

/**
 * A `Wallet` is an extension of {@link ethers.Wallet} with additional features for interacting with ZKsync Era.
 * It facilitates bridging assets between different networks.
 * All transactions must originate from the address corresponding to the provided private key.
 */
export class Wallet extends AdapterL2(AdapterL1(ethers.Wallet)) {
  override readonly provider!: Provider;
  providerL1?: ethers.providers.Provider;
  public eip712!: EIP712Signer;

  override _providerL1(): ethers.providers.Provider {
    if (!this.providerL1) {
      throw new Error(
        'L1 provider is missing! Use `Wallet.connectToL1()` to connect to L1!'
      );
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
   * const mainContract = await wallet.getMainContract();
   */
  override async getMainContract(): Promise<IZkSyncHyperchain> {
    return super.getMainContract();
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
   * const bridgehub = await wallet.getBridgehubContract();
   */
  override async getBridgehubContract(): Promise<IBridgehub> {
    return super.getBridgehubContract();
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
   * const l1BridgeContracts = await wallet.getL1BridgeContracts();
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
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   *
   * console.log(`Token balance: ${await wallet.getBalanceL1(tokenL1)}`);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * console.log(`Token allowance: ${await wallet.getAllowanceL1(tokenL1)}`);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   *
   * console.log(`Token L2 address: ${await wallet.l2TokenAddress(tokenL1)}`);
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
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const txHandle = await wallet.approveERC20(tokenL1, "10000000");
   *
   * await txHandle.wait();
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * console.log(`Base cost: ${await wallet.getBaseCost({ gasLimit: 100_000 })}`);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * console.log(`Base token: ${await wallet.getBaseToken()}`);
   */
  override async getBaseToken(): Promise<string> {
    return super.getBaseToken();
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
   * console.log(`Is ETH-based chain: ${await wallet.isETHBasedChain()}`);
   */
  override async isETHBasedChain(): Promise<boolean> {
    return super.isETHBasedChain();
  }

  /**
   * @inheritDoc
   *
   * @example Get allowance parameters for depositing token on ETH-based chain.
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
   * const token = "<L1_TOKEN>";
   * const amount = 5;
   * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
   *
   * await (
   *    await wallet.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * @example Get allowance parameters for depositing ETH on non-ETH-based chain.
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
   * const token = utils.LEGACY_ETH_ADDRESS;
   * const amount = 5;
   * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
   *
   * await (
   *    await wallet.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * @example Get allowance parameters for depositing base token on non-ETH-based chain.
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
   * const token = await wallet.getBaseToken();
   * const amount = 5;
   * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
   *
   * await (
   *    await wallet.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * @example Get allowance parameters for depositing non-base token on non-ETH-based chain.
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
   * const token = "<L1_TOKEN>";
   * const amount = 5;
   * const approveParams = await wallet.getDepositAllowanceParams(token, amount);
   *
   * await (
   *    await wallet.approveERC20(
   *        approveParams[0].token,
   *        approveParams[0].allowance
   *    )
   * ).wait();
   *
   * await (
   *    await wallet.approveERC20(
   *        approveParams[1].token,
   *        approveParams[1].allowance
   *    )
   * ).wait();
   */
  override async getDepositAllowanceParams(
    token: Address,
    amount: BigNumberish
  ): Promise<
    {
      token: Address;
      allowance: BigNumberish;
    }[]
  > {
    return super.getDepositAllowanceParams(token, amount);
  }

  /**
   * @inheritDoc
   *
   * @example Deposit ETH on ETH-based chain.
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
   * const depositTx = await wallet.deposit({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000,
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await depositTx.waitL1Commit()`
   * await depositTx.wait();
   *
   * @example Deposit token on ETH-based chain.
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
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const depositTx = await wallet.deposit({
   *   token: tokenL1,
   *   amount: 10_000_000,
   *   approveERC20: true,
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await depositTx.waitL1Commit()`
   * await depositTx.wait();
   *
   * @example Deposit ETH on non-ETH-based chain.
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
   * const depositTx = await wallet.deposit({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000,
   *   approveBaseERC20: true,
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await depositTx.waitL1Commit()`
   * await depositTx.wait();
   *
   * @example Deposit base token on non-ETH-based chain.
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
   * const depositTx = await wallet.deposit({
   *   token: await wallet.getBaseToken(),
   *   amount: 10_000_000,
   *   approveERC20: true, // or approveBaseERC20: true
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await depositTx.waitL1Commit()`
   * await depositTx.wait();
   *
   * @example Deposit non-base token on non-ETH-based chain.
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
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const depositTx = await wallet.deposit({
   *   token: tokenL1,
   *   amount: 10_000_000,
   *   approveERC20: true,
   *   approveBaseERC20: true,
   * });
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await depositTx.waitL1Commit()`
   * await depositTx.wait();
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
    overrides?: ethers.PayableOverrides;
    approveOverrides?: ethers.Overrides;
    approveBaseOverrides?: ethers.Overrides;
    customBridgeData?: BytesLike;
  }): Promise<PriorityOpResponse> {
    return super.deposit(transaction);
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
   * const tokenL1 = "0x5C221E77624690fff6dd741493D735a17716c26B";
   * const gas = await wallet.estimateGasDeposit({
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
    overrides?: ethers.PayableOverrides;
  }): Promise<BigNumber> {
    return super.estimateGasDeposit(transaction);
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
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const tx = await wallet.getDepositTx({
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
    overrides?: ethers.PayableOverrides;
  }): Promise<any> {
    return super.getDepositTx(transaction);
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
   * const tokenL1 = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
   * const fee = await wallet.getFullRequiredDepositFee({
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
    overrides?: ethers.PayableOverrides;
  }): Promise<FullDepositFee> {
    return super.getFullRequiredDepositFee(transaction);
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
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const params = await wallet.finalizeWithdrawalParams(WITHDRAWAL_HASH);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const finalizeWithdrawTx = await wallet.finalizeWithdrawal(WITHDRAWAL_HASH);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const WITHDRAWAL_HASH = "<WITHDRAWAL_TX_HASH>";
   * const isFinalized = await wallet.isWithdrawalFinalized(WITHDRAWAL_HASH);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const FAILED_DEPOSIT_HASH = "<FAILED_DEPOSIT_TX_HASH>";
   * const claimFailedDepositTx = await wallet.claimFailedDeposit(FAILED_DEPOSIT_HASH);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const tx = {
   *    contractAddress: await wallet.getAddress(),
   *    calldata: '0x',
   *    l2Value: 7_000_000_000,
   * };
   *
   * const approveParams = await wallet.getRequestExecuteAllowanceParams(tx);
   * await (
   *    await wallet.approveERC20(
   *        approveParams.token,
   *        approveParams.allowance
   *    )
   * ).wait();
   */
  override async getRequestExecuteAllowanceParams(transaction: {
    contractAddress: Address;
    calldata: BytesLike;
    l2GasLimit?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: ethers.PayableOverrides;
  }): Promise<{token: Address; allowance: BigNumberish}> {
    return super.getRequestExecuteAllowanceParams(transaction);
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const gasPrice = await wallet.providerL1.getGasPrice();
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
   * const l2GasLimit = BigNumber.from(1_000);
   *
   * const txCostPrice = await wallet.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await wallet.requestExecute({
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
    calldata: BytesLike;
    l2GasLimit?: BigNumberish;
    mintValue?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: ethers.PayableOverrides;
  }): Promise<PriorityOpResponse> {
    return super.requestExecute(transaction);
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const gasPrice = await wallet.providerL1.getGasPrice();
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
   * const l2GasLimit = BigNumber.from(1_000);
   *
   * const txCostPrice = await wallet.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await wallet.getRequestExecuteTx({
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
    calldata: BytesLike;
    l2GasLimit?: BigNumberish;
    mintValue?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: ethers.PayableOverrides;
  }): Promise<BigNumber> {
    return super.estimateGasRequestExecute(transaction);
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
   * const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const gasPrice = await wallet.providerL1.getGasPrice();
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
   * const l2GasLimit = BigNumber.from(1_000);
   *
   * const txCostPrice = await wallet.getBaseCost({
   *   gasPrice,
   *   calldataLength: ethers.utils.arrayify(calldata).length,
   *   l2GasLimit,
   * });
   *
   * console.log(`Executing the transaction will cost ${ethers.utils.formatEther(txCostPrice)} ETH`);
   *
   * const executeTx = await wallet.getRequestExecuteTx({
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
    calldata: BytesLike;
    l2GasLimit?: BigNumberish;
    mintValue?: BigNumberish;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    operatorTip?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    refundRecipient?: Address;
    overrides?: ethers.PayableOverrides;
  }): Promise<PopulatedTransaction> {
    return super.getRequestExecuteTx(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example Get ETH balance.
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
   * console.log(`ETH balance: ${await wallet.getBalance()}`);
   *
   * @example Get token balance.
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
   * const token = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   *
   * console.log(`Token balance: ${await wallet.getBalance(token)}`);
   *
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const allBalances = await wallet.getAllBalances();
   */
  override async getAllBalances(): Promise<BalancesMap> {
    return super.getAllBalances();
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
   * console.log(`Nonce: ${await wallet.getDeploymentNonce()}`);
   */
  override async getDeploymentNonce(): Promise<BigNumber> {
    return super.getDeploymentNonce();
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
   * const l2BridgeContracts = await wallet.getL2BridgeContracts();
   */
  override async getL2BridgeContracts(): Promise<{
    erc20: IL2Bridge;
    weth: IL2Bridge;
    shared: Il2SharedBridge;
  }> {
    return super.getL2BridgeContracts();
  }

  /**
   * @inheritDoc
   *
   * @example Withdraw ETH.
   *
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const withdrawTx = await wallet.withdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000,
   * });
   *
   * @example Withdraw ETH using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const withdrawTx = await wallet.withdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 10_000_000,
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const withdrawTx = await wallet.withdraw({
   *   token: tokenL2,
   *   amount: 10_000_000,
   * });
   *
   * @example Withdraw token using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const withdrawTx = await wallet.withdraw({
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
   * @example Transfer ETH.
   *
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const transferTx = await wallet.transfer({
   *   to: Wallet.createRandom().address,
   *   amount: ethers.utils.parseEther("0.01"),
   * });
   *
   * const receipt = await transferHandle.wait();
   *
   * console.log(`The sum of ${receipt.value} ETH was transferred to ${receipt.to}`);
   *
   * @example Transfer ETH using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const transferTx = await wallet.transfer({
   *   to: Wallet.createRandom().address,
   *   amount: ethers.utils.parseEther("0.01"),
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const transferTx = await wallet.transfer({
   *   token: tokenL2,
   *   to: Wallet.createRandom().address,
   *   amount: ethers.utils.parseEther("0.01"),
   * });
   *
   * const receipt = await transferHandle.wait();
   *
   * console.log(`The sum of ${receipt.value} token was transferred to ${receipt.to}`);
   *
   * @example Transfer token using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const tokenL2 = "0x6a4Fb925583F7D4dF82de62d98107468aE846FD1";
   * const transferTx = await wallet.transfer({
   *   token: tokenL2,
   *   to: Wallet.createRandom().address,
   *   amount: ethers.utils.parseEther("0.01"),
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
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Confirmation data: ${utils.toJSON(await wallet.getPriorityOpConfirmation(tx, 0))}`);
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
   * Returns `ethers.Wallet` object with the same private key.
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
   * const ethWallet = wallet.ethWallet();
   */
  ethWallet(): ethers.Wallet {
    return new ethers.Wallet(this._signingKey(), this._providerL1());
  }

  /**
   * Get the number of transactions ever sent for account, which is used as the `nonce` when sending a transaction.
   *
   * @param [blockTag] The block tag to query. If provided, the transaction count is as of that block.
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
   * const nonce = wallet.getNonce();
   */
  async getNonce(blockTag?: BlockTag): Promise<number> {
    return await this.getTransactionCount(blockTag);
  }

  /**
   * Connects to the L2 network using `provider`.
   *
   * @param provider The provider instance for connecting to an L2 network.
   *
   * @see {@link connectToL1} in order to connect to L1 network.
   *
   * @example
   *
   * import { Wallet, Provider, types } from "zksync-ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const unconnectedWallet = new Wallet(PRIVATE_KEY);
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = unconnectedWallet.connect(provider);
   */
  override connect(provider: Provider): Wallet {
    return new Wallet(this._signingKey(), provider, this.providerL1);
  }

  /**
   * Connects to the L1 network using `provider`.
   *
   * @param provider The provider instance for connecting to a L1 network.
   *
   * @see {@link connect} in order to connect to L2 network.
   *
   * @example
   *
   * import { Wallet } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const unconnectedWallet = new Wallet(PRIVATE_KEY);
   *
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = unconnectedWallet.connectToL1(ethProvider);
   *
   * @param provider
   */
  connectToL1(provider: ethers.providers.Provider): Wallet {
    return new Wallet(this._signingKey(), this.provider, provider);
  }

  /**
   * Creates a new `Wallet` with the `provider` as L1 provider and a private key that is built from the mnemonic passphrase.
   *
   * @param mnemonic The mnemonic of the private key.
   * @param [path] The derivation path.
   * @param [wordlist] The wordlist used to derive the mnemonic.
   *
   * @example
   *
   * import { Wallet, Provider, utils } from "zksync-ethers";
   *
   * const MNEMONIC = "stuff slice staff easily soup parent arm payment cotton hammer scatter struggle";
   *
   * const wallet = Wallet.fromMnemonic(MNEMONIC);
   */
  static override fromMnemonic(
    mnemonic: string,
    path?: string,
    wordlist?: ethers.Wordlist
  ): Wallet {
    const wallet = super.fromMnemonic(mnemonic, path, wordlist);
    return new Wallet(wallet._signingKey());
  }

  /**
   * Creates a new `Wallet` from encrypted json file using provided `password`.
   *
   * @param json The encrypted json file.
   * @param password The password for the encrypted json file.
   * @param [callback] If provided, it is called periodically during decryption so that any UI can be updated.
   *
   * @example
   *
   * import { Wallet, Provider, utils } from "zksync-ethers";
   * import * as fs from "fs";
   *
   * const wallet = await Wallet.fromEncryptedJson(fs.readFileSync("wallet.json", "utf8"), "password");
   */
  static override async fromEncryptedJson(
    json: string,
    password?: string | ethers.Bytes,
    callback?: ProgressCallback
  ): Promise<Wallet> {
    const wallet = await super.fromEncryptedJson(
      json,
      password as string | Bytes,
      callback
    );
    return new Wallet(wallet._signingKey());
  }

  /**
   * Creates a new `Wallet` from encrypted json file using provided `password`.
   *
   * @param json The encrypted json file.
   * @param password The password for the encrypted json file.
   *
   * @example
   *
   * import { Wallet } from "zksync-ethers";
   * import * as fs from "fs";
   *
   * const wallet = Wallet.fromEncryptedJsonSync(fs.readFileSync("tests/files/wallet.json", "utf8"), "password");
   */
  static override fromEncryptedJsonSync(
    json: string,
    password?: string | ethers.Bytes
  ): Wallet {
    const wallet = super.fromEncryptedJsonSync(
      json,
      password as string | Bytes
    );
    return new Wallet(wallet._signingKey());
  }

  /**
   * Creates random `Wallet`.
   * @param options  Additional options.
   *
   * @example
   *
   * import { Wallet} from "zksync-ethers";
   *
   * const wallet = Wallet.createRandom();
   */
  static override createRandom(options?: any): Wallet {
    const wallet = super.createRandom(options);
    return new Wallet(wallet._signingKey());
  }

  /**
   *
   * @param privateKey The private key of the account.
   * @param providerL2 The provider instance for connecting to a L2 network.
   * @param providerL1 The provider instance for connecting to a L1 network.
   *
   * @example
   *
   * import { Wallet, Provider, types } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   */
  constructor(
    privateKey: ethers.BytesLike | utils.SigningKey,
    providerL2?: Provider,
    providerL1?: ethers.providers.Provider
  ) {
    super(privateKey, providerL2);
    if (this.provider) {
      const chainId = this.getChainId();
      this.eip712 = new EIP712Signer(this, chainId);
    }
    this.providerL1 = providerL1;
  }

  /**
   * Designed for users who prefer a simplified approach by providing only the necessary data to create a valid transaction.
   * The only required fields are `transaction.to` and either `transaction.data` or `transaction.value` (or both, if the method is payable).
   * Any other fields that are not set will be prepared by this method.
   *
   * @param transaction The transaction request that needs to be populated.
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
   * const populatedTx = await wallet.populateTransaction({
   *   to: Wallet.createRandom().address,
   *   value: 7_000_000,
   * });
   */
  override async populateTransaction(
    transaction: TransactionRequest
  ): Promise<TransactionRequest> {
    if (
      (!transaction.type || transaction.type !== EIP712_TX_TYPE) &&
      !transaction.customData
    ) {
      return await super.populateTransaction(transaction);
    }
    transaction.type = EIP712_TX_TYPE;
    const populated = await super.populateTransaction(transaction);

    populated.type = EIP712_TX_TYPE;
    populated.value ??= 0;
    populated.data ??= '0x';
    populated.customData = this._fillCustomData(transaction.customData ?? {});
    if (!populated.maxFeePerGas && !populated.maxPriorityFeePerGas) {
      populated.gasPrice = await this.provider.getGasPrice();
    }
    return populated;
  }

  /***
   * Signs the transaction and serializes it to be ready to be broadcast to the network.
   *
   * @param transaction The transaction request that needs to be signed.
   *
   * @throws {Error} If `transaction.from` is mismatched from the private key.
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
   * const tx = await wallet.signTransaction({
   *   type: utils.EIP712_TX_TYPE,
   *   to: Wallet.createRandom().address,
   *   value: BigNumber.from(7_000_000_000),
   * });
   */
  override async signTransaction(
    transaction: TransactionRequest
  ): Promise<string> {
    const populated = await this.populateTransaction(transaction);
    if (populated.type !== EIP712_TX_TYPE) {
      return await super.signTransaction(populated);
    }

    populated.customData!.customSignature = await this.eip712.sign(populated);
    return serialize(populated);
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
   * import { Wallet, Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   *
   * const tx = await wallet.sendTransaction({
   *   to: Wallet.createRandom().address,
   *   value: 7_000_000,
   *   maxFeePerGas: BigNumber.from(3_500_000_000),
   *   maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
   *   customData: {
   *     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
   *   },
   * });
   * await tx.wait();
   */
  override async sendTransaction(
    transaction: TransactionRequest
  ): Promise<TransactionResponse> {
    return (await super.sendTransaction(transaction)) as TransactionResponse;
  }
}
