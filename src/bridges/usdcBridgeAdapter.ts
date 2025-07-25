import {
    BigNumberish,
    BytesLike,
    ethers,
    AbiCoder,
} from 'ethers';
import {
    Address,
} from '../types';
import { Wallet } from '../wallet';
export interface IBridgeAdapter {
    getSecondBridgeDepositCalldata(transaction: {
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
    }): Promise<string>;
}

export class USDCBridgeAdapter implements IBridgeAdapter {
    constructor(protected readonly wallet: Wallet) { }

    async getSecondBridgeDepositCalldata(transaction: {
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
    }): Promise<string> {
        return AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256", "address"],
            [
                transaction.token, transaction.amount, transaction.to ?? (await this.wallet.getAddress())
            ]
        );
    }
}