import {
  BigNumberish,
  BytesLike,
  ethers,
  ContractTransactionResponse,
  Overrides,
} from 'ethers';
import {
  Address,
  PaymasterParams,
  PriorityOpResponse,
  TransactionResponse,
  TransactionLike,
  FinalizeL1DepositParams,
} from '../types';
import {IERC20__factory} from '../typechain';
import {
  REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
  checkBaseCost,
  scaleGasLimit,
} from '../utils';
import {Wallet} from '../wallet';
import {insertGasPrice} from '../adapters';

export interface IDepositTransaction {
  token: Address;
  amount: BigNumberish;
  to?: Address;
  operatorTip?: BigNumberish;
  bridgeAddress: Address;
  approveERC20?: boolean;
  l2GasLimit?: BigNumberish;
  gasPerPubdataByte?: BigNumberish;
  refundRecipient?: Address;
  overrides?: Overrides;
  approveOverrides?: Overrides;
}

export interface IWithdrawTransaction {
  token: Address;
  amount: BigNumberish;
  to?: Address;
  bridgeAddress: Address;
  paymasterParams?: PaymasterParams;
  overrides?: Overrides;
  approveERC20?: boolean;
  approveOverrides?: Overrides;
}

/**
 * `AbstractBridge` is an abstract class that provides a base implementation for bridging assets.
 */
export abstract class AbstractBridge {
  constructor(protected readonly wallet: Wallet) {}

  /**
   * Returns the amount of approved tokens for a specific L2 bridge.
   *
   * @param token The address of the token.
   * @param bridgeAddress The address of the bridge contract to be used.
   * @param [blockTag] The block in which an allowance should be checked.
   * Defaults to 'committed', i.e., the latest processed block.
   */
  protected async getAllowanceL2(
    token: Address,
    bridgeAddress: Address,
    blockTag?: ethers.BlockTag
  ): Promise<bigint> {
    const erc20contract = IERC20__factory.connect(
      token,
      this.wallet._providerL2()
    );
    return await erc20contract.allowance(
      await this.wallet.getAddress(),
      bridgeAddress,
      {
        blockTag,
      }
    );
  }

  /**
   * Approves token for the specified bridge.
   *
   * @param token The L2 address of the token.
   * @param bridgeAddress The address of the bridge contract to be used.
   * @param amount The amount of the token to be approved.
   * @param [overrides] Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.
   * @returns A promise that resolves to the response of the approval transaction.
   */
  protected async approveERC20L2(
    token: Address,
    bridgeAddress: Address,
    amount: BigNumberish,
    overrides: ethers.Overrides = {}
  ): Promise<ethers.TransactionResponse> {
    const erc20contract = IERC20__factory.connect(
      token,
      this.wallet._signerL2()
    );
    return await erc20contract.approve(bridgeAddress, amount, overrides);
  }

  /**
   * Returns the deposit calldata for the second bridge.
   *
   * @param transaction Deposit transaction.
   */
  protected abstract getSecondBridgeDepositCalldata(
    transaction: IDepositTransaction
  ): Promise<string>;

  /**
   * Validates the deposit parameters.
   *
   * @param transaction Deposit transaction.
   * By default, does nothing.
   * Override this method in subclasses to implement custom validation logic.
   */
  protected async validateDepositParams(
    _: IDepositTransaction
  ): Promise<void> {}

  /**
   * Deposit USDC.
   *
   * @example
   *
   * import { Wallet, Provider, types, USDCBridge } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const USDC_TOKEN_L1_ADDRESS = "<USDC_TOKEN_ADDRESS>";
   * const USDC_BRIDGE_L1_ADDRESS = "<USDC_BRIDGE_L1_ADDRESS>";
   * const AMOUNT = "5";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   * const usdcBridge = new USDCBridge(wallet);
   *
   * const depositTx = await usdcBridge.deposit({
   *   token: USDC_TOKEN_L1_ADDRESS,
   *   amount: ethers.parseUnits(AMOUNT, 6),
   *   approveERC20: true,
   *   bridgeAddress: USDC_BRIDGE_L1_ADDRESS,
   * });
   *
   * // Note that we wait not only for the L1 transaction to complete but also for it to be
   * // processed by zkSync. If we want to wait only for the transaction to be processed on L1,
   * // we can use `await depositTx.waitL1Commit()`
   * await depositTx.wait();
   */
  async deposit(transaction: IDepositTransaction): Promise<PriorityOpResponse> {
    await this.validateDepositParams(transaction);

    const chainId = (await this.wallet._providerL2().getNetwork()).chainId;
    const bridgehub = await this.wallet.getBridgehubContract();

    const tx = {
      ...transaction,
      to: transaction.to || (await this.wallet.getAddress()),
      operatorTip: transaction.operatorTip || 0,
      gasPerPubdataByte:
        transaction.gasPerPubdataByte ||
        REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
      overrides: transaction.overrides || {},
    };
    const secondBridgeCalldata = await this.getSecondBridgeDepositCalldata(tx);
    if (!tx.l2GasLimit) {
      tx.l2GasLimit = await this.wallet._getL2GasLimitFromCustomBridge({
        ...tx,
        customBridgeData: secondBridgeCalldata,
      });
    }
    await insertGasPrice(this.wallet._providerL1(), tx.overrides);

    const gasPriceForEstimation =
      tx.overrides.maxFeePerGas || tx.overrides.gasPrice;
    const baseCost = await bridgehub.l2TransactionBaseCost(
      chainId,
      gasPriceForEstimation as BigNumberish,
      tx.l2GasLimit,
      tx.gasPerPubdataByte
    );

    const mintValue = baseCost + BigInt(tx.operatorTip);
    tx.overrides.value = tx.overrides.value || mintValue;
    tx.overrides.from = await this.wallet.getAddress();

    await checkBaseCost(baseCost, mintValue);

    const depositTx =
      await bridgehub.requestL2TransactionTwoBridges.populateTransaction(
        {
          chainId,
          mintValue,
          l2Value: 0,
          l2GasLimit: tx.l2GasLimit,
          l2GasPerPubdataByteLimit: tx.gasPerPubdataByte,
          refundRecipient: tx.refundRecipient ?? ethers.ZeroAddress,
          secondBridgeAddress: tx.bridgeAddress,
          secondBridgeValue: 0,
          secondBridgeCalldata,
        },
        tx.overrides
      );
    if (tx.approveERC20) {
      const allowance = await this.wallet.getAllowanceL1(
        tx.token,
        tx.bridgeAddress
      );
      if (allowance < BigInt(transaction.amount)) {
        const approveTx = await this.wallet.approveERC20(tx.token, tx.amount, {
          bridgeAddress: tx.bridgeAddress,
          ...tx.approveOverrides,
        });
        await approveTx.wait();
      }
    }

    if (!depositTx.gasLimit) {
      const baseGasLimit = await this.wallet
        ._providerL1()
        .estimateGas(depositTx);
      depositTx.gasLimit = scaleGasLimit(baseGasLimit);
    }

    return await this.wallet.getPriorityOpResponse(
      await this.wallet._signerL1().sendTransaction(depositTx)
    );
  }

  /**
   * Populates the withdraw transaction for the bridge.
   *
   * @param transaction Withdraw transaction.
   */
  protected abstract populateWithdrawTransaction(
    transaction: IWithdrawTransaction
  ): Promise<TransactionLike>;

  /**
   * Validates the withdraw parameters.
   *
   * @param transaction Withdraw transaction.
   * By default, does nothing.
   * Override this method in subclasses to implement custom validation logic.
   */
  protected async validateWithdrawParams(
    _: IWithdrawTransaction
  ): Promise<void> {}

  /**
   * Withdraw USDC.
   *
   * @example
   *
   * import { Wallet, Provider, types, USDCBridge } from "zksync-ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const USDC_TOKEN_L2_ADDRESS = "<USDC_TOKEN_L2_ADDRESS>";
   * const USDC_BRIDGE_L2_ADDRESS = "<USDC_BRIDGE_L2_ADDRESS>";
   * const AMOUNT = "5";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   * const usdcBridge = new USDCBridge(wallet);
   *
   * const withdrawTx = await usdcBridge.withdraw({
   *   token: USDC_TOKEN_L2_ADDRESS,
   *   amount: ethers.parseUnits(AMOUNT, 6),
   *   bridgeAddress: USDC_BRIDGE_L2_ADDRESS,
   *   approveERC20: true,
   * });
   */
  async withdraw(
    transaction: IWithdrawTransaction
  ): Promise<TransactionResponse> {
    await this.validateWithdrawParams(transaction);

    if (transaction.approveERC20) {
      const allowance = await this.getAllowanceL2(
        transaction.token,
        transaction.bridgeAddress
      );
      if (allowance < BigInt(transaction.amount)) {
        const approveTx = await this.approveERC20L2(
          transaction.token,
          transaction.bridgeAddress,
          transaction.amount,
          transaction.approveOverrides
        );
        await approveTx.wait();
      }
    }

    const walletAddress = await this.wallet.getAddress();
    const tx: IWithdrawTransaction & {
      from: Address;
      to: Address;
      overrides: Overrides;
    } = {
      ...transaction,
      from: walletAddress,
      to: transaction.to || walletAddress,
      overrides: transaction.overrides || {},
    };

    const populatedWithdrawTx = await this.populateWithdrawTransaction(tx);
    return this.wallet.sendTransaction(populatedWithdrawTx);
  }

  /**
   * Finalizes the L1 deposit.
   * @param bridgeAddress The address of the bridge contract to use.
   * @param finalizeParams Finalize L1 deposit params.
   * @param [overrides] Transaction's overrides for the finalization.
   */
  protected abstract finalizeL1Deposit(
    bridgeAddress: Address,
    finalizeParams: FinalizeL1DepositParams,
    overrides?: Overrides
  ): Promise<ContractTransactionResponse>;

  /**
   * Finalizes the withdrawal on L1.
   *
   * @example
   *
   * import { Wallet, Provider, types, USDCBridge } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const USDC_BRIDGE_L1_ADDRESS = "<USDC_BRIDGE_L1_ADDRESS>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   * const usdcBridge = new USDCBridge(wallet);
   *
   * const WITHDRAWAL_TX_HASH = "<WITHDRAWAL_TX_HASH>";
   * const finalizeWithdrawalTx = await usdcBridge.finalizeWithdrawal(USDC_BRIDGE_L1_ADDRESS, WITHDRAWAL_TX_HASH);
   */
  async finalizeWithdrawal(
    bridgeAddress: Address,
    withdrawalHash: BytesLike,
    index = 0,
    overrides: Overrides = {}
  ): Promise<ContractTransactionResponse> {
    const finalizeParams = await this.wallet.getFinalizeDepositParams(
      withdrawalHash,
      index
    );

    return await this.finalizeL1Deposit(
      bridgeAddress,
      finalizeParams,
      overrides
    );
  }

  /**
   * Checks if the withdrawal is finalized.
   * @param bridgeAddress The address of the bridge contract to use.
   * @param finalizeParams Params of the L1 finalize.
   */
  protected abstract checkIfWithdrawalIsFinalized(
    bridgeAddress: Address,
    finalizeParams: FinalizeL1DepositParams
  ): Promise<boolean>;

  /**
   * Checks if the withdrawal is finalized.
   *
   * @param bridgeAddress The address of the bridge contract to use.
   * @param withdrawalHash The hash of the withdrawal transaction.
   * @param [index] The index of the withdrawal.
   *
   * @returns A promise that resolves to a boolean indicating whether the withdrawal is finalized.
   *
   * @example
   *
   * import { Wallet, Provider, types, USDCBridge } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<WALLET_PRIVATE_KEY>";
   * const USDC_BRIDGE_L1_ADDRESS = "<USDC_BRIDGE_L1_ADDRESS>";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
   * const usdcBridge = new USDCBridge(wallet);
   *
   * const WITHDRAWAL_TX_HASH = "<WITHDRAWAL_TX_HASH>";
   * const isFinalized = await usdcBridge.isWithdrawalFinalized(USDC_BRIDGE_L1_ADDRESS, WITHDRAWAL_TX_HASH);
   */
  async isWithdrawalFinalized(
    bridgeAddress: Address,
    withdrawalHash: BytesLike,
    index = 0
  ): Promise<boolean> {
    const finalizeParams = await this.wallet.getFinalizeDepositParams(
      withdrawalHash,
      index
    );

    return await this.checkIfWithdrawalIsFinalized(
      bridgeAddress,
      finalizeParams
    );
  }
}
