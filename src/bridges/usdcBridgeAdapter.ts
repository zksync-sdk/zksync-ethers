import {
    BigNumberish,
    BytesLike,
    ethers,
    AbiCoder,
    ContractTransaction,
    ContractTransactionResponse,
} from 'ethers';
import {
    Address,
    PaymasterParams,
    FinalizeL1DepositParams,
} from '../types';
import { Wallet } from '../wallet';

interface IDepositTransaction {
    token: Address;
    amount: BigNumberish;
    to?: Address;
    operatorTip?: BigNumberish;
    bridgeAddress?: Address;
    l2GasLimit?: BigNumberish;
    gasPerPubdataByte?: BigNumberish;
    customBridgeData?: BytesLike;
    refundRecipient?: Address;
    overrides?: ethers.Overrides;
};

interface IWithdrawTransaction {
    amount: BigNumberish;
    token?: Address;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    bridgeAdapter?: IBridgeAdapter;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
};

export interface IBridgeAdapter {
    getSecondBridgeDepositCalldata(transaction: IDepositTransaction): Promise<string>;
    populateWithdrawTransaction(transaction: IWithdrawTransaction): Promise<ContractTransaction>;
    finalizeDeposit(bridgeAddress: Address, l1DepositParams: FinalizeL1DepositParams, overrides?: ethers.Overrides): Promise<ContractTransactionResponse>;
}

export class USDCBridgeAdapter implements IBridgeAdapter {
    constructor(protected readonly wallet: Wallet) { }

    async getSecondBridgeDepositCalldata(transaction: IDepositTransaction): Promise<string> {
        return AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256", "address"],
            [
                transaction.token, transaction.amount, transaction.to ?? (await this.wallet.getAddress())
            ]
        );
    }

    async populateWithdrawTransaction(transaction: IWithdrawTransaction): Promise<ContractTransaction> {
        const bridge = await this.wallet._providerL2().connectL2Bridge(transaction.bridgeAddress!);
        return await bridge.withdraw.populateTransaction(
            transaction.to!,
            transaction.token!,
            transaction.amount,
            transaction.overrides!
        );
    }

    async finalizeDeposit(bridgeAddress: Address, l1DepositParams: FinalizeL1DepositParams, overrides?: ethers.Overrides): Promise<ContractTransactionResponse> {
        const l1Nullifier = await this.wallet.getL1Nullifier(bridgeAddress);
        return await l1Nullifier.finalizeWithdrawal(
            l1DepositParams.chainId,
            l1DepositParams.l2BatchNumber,
            l1DepositParams.l2MessageIndex,
            l1DepositParams.l2TxNumberInBatch,
            l1DepositParams.message,
            l1DepositParams.merkleProof,
            overrides ?? {}
        );
    }
}