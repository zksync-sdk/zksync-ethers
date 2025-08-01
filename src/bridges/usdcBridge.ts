import {
  AbiCoder,
  ContractTransactionResponse,
  Overrides,
  Contract,
} from 'ethers';
import {Address, FinalizeL1DepositParams, TransactionLike} from '../types';
import {IL1Nullifier__factory} from '../typechain';
import {Wallet} from '../wallet';
import {
  IDepositTransaction,
  IWithdrawTransaction,
  AbstractBridge,
} from './abstractBridge';

const L1_BRIDGE_ABI = ['function L1_USDC_TOKEN() view returns (address)'];

const L2_BRIDGE_ABI = ['function L2_USDC_TOKEN() view returns (address)'];

/**
 * `USDCBridge` is an implementation of the AbstractBridge class which provides methods
 * for depositing and withdrawing USDC tokens using Custom USDC Bridge that can be found here:
 * https://github.com/matter-labs/usdc-bridge
 */
export class USDCBridge extends AbstractBridge {
  constructor(wallet: Wallet) {
    super(wallet);
  }

  protected override async validateDepositParams(
    transaction: IDepositTransaction
  ): Promise<void> {
    const l1Token = new Contract(
      transaction.bridgeAddress,
      L1_BRIDGE_ABI,
      this.wallet._signerL1()
    );
    const bridgeL1Token = await l1Token.L1_USDC_TOKEN();

    if (bridgeL1Token.toLowerCase() !== transaction.token.toLowerCase()) {
      throw new Error('Wrong token address for USDC bridge deposit.');
    }
  }

  protected override async getSecondBridgeDepositCalldata(
    transaction: IDepositTransaction
  ): Promise<string> {
    return AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256', 'address'],
      [transaction.token, transaction.amount, transaction.to]
    );
  }

  protected override async validateWithdrawParams(
    transaction: IWithdrawTransaction
  ): Promise<void> {
    const l2Token = new Contract(
      transaction.bridgeAddress,
      L2_BRIDGE_ABI,
      this.wallet._signerL2()
    );
    const bridgeL2Token = await l2Token.L2_USDC_TOKEN();

    if (bridgeL2Token.toLowerCase() !== transaction.token.toLowerCase()) {
      throw new Error('Wrong token address for USDC bridge withdrawal.');
    }
  }

  protected override async populateWithdrawTransaction(
    tx: IWithdrawTransaction
  ): Promise<TransactionLike> {
    const bridge = await this.wallet
      ._providerL2()
      .connectL2Bridge(tx.bridgeAddress!);
    const populatedWithdrawTx = await bridge.withdraw.populateTransaction(
      tx.to!,
      tx.token!,
      tx.amount,
      tx.overrides!
    );

    if (tx.paymasterParams) {
      populatedWithdrawTx.customData = {
        paymasterParams: tx.paymasterParams,
      };
    }

    return populatedWithdrawTx;
  }

  protected override async finalizeL1Deposit(
    bridgeAddress: Address,
    finalizeParams: FinalizeL1DepositParams,
    overrides?: Overrides
  ): Promise<ContractTransactionResponse> {
    const bridgeContract = IL1Nullifier__factory.connect(
      bridgeAddress,
      this.wallet._signerL1()
    );

    return await bridgeContract.finalizeWithdrawal(
      finalizeParams.chainId,
      finalizeParams.l2BatchNumber,
      finalizeParams.l2MessageIndex,
      finalizeParams.l2TxNumberInBatch,
      finalizeParams.message,
      finalizeParams.merkleProof,
      overrides ?? {}
    );
  }

  protected override async checkIfWithdrawalIsFinalized(
    bridgeAddress: Address,
    finalizeParams: FinalizeL1DepositParams
  ): Promise<boolean> {
    const bridgeContract = IL1Nullifier__factory.connect(
      bridgeAddress,
      this.wallet._signerL1()
    );

    return await bridgeContract.isWithdrawalFinalized(
      finalizeParams.chainId,
      finalizeParams.l2BatchNumber,
      finalizeParams.l2MessageIndex
    );
  }
}
