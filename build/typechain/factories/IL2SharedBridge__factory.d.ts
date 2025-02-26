import { type ContractRunner } from "ethers";
import type { IL2SharedBridge, IL2SharedBridgeInterface } from "../IL2SharedBridge";
export declare class IL2SharedBridge__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l1Sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l2Receiver";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l2Token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "FinalizeDeposit";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l2Sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l1Receiver";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l2Token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "WithdrawalInitiated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_l1Sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_l2Receiver";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_l1Token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "finalizeDeposit";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "l1Bridge";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "l1SharedBridge";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_l2Token";
            readonly type: "address";
        }];
        readonly name: "l1TokenAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_l1Token";
            readonly type: "address";
        }];
        readonly name: "l2TokenAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_l1Receiver";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_l2Token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IL2SharedBridgeInterface;
    static connect(address: string, runner?: ContractRunner | null): IL2SharedBridge;
}
