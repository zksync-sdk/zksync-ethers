import {
    BigNumberish,
    BytesLike,
    ethers,
    AbiCoder,
} from 'ethers';
import {
    Address,
} from '../types';
export interface IBridgeAdapter {
    getSecondBridgeCalldata(transaction: {
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
    // async getL1Nullifier(bridgeAddress?: Address): Promise<IL1Nullifier> {
    //     return IL1Nullifier__factory.connect(
    //         bridgeAddress || (await this.getDefaultBridgeAddresses()).l1Nullifier!,
    //         this._signerL1()
    //     );
    // }

    async getSecondBridgeCalldata(transaction: {
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
                transaction.token, transaction.amount, transaction.to
            ]
        );
    }
}