import { type ContractRunner } from "ethers";
import type { IL1Messenger, IL1MessengerInterface } from "../IL1Messenger";
export declare class IL1Messenger__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }];
        readonly name: "BytecodeL1PublicationRequested";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "_hash";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_message";
            readonly type: "bytes";
        }];
        readonly name: "L1MessageSent";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "l2ShardId";
                readonly type: "uint8";
            }, {
                readonly internalType: "bool";
                readonly name: "isService";
                readonly type: "bool";
            }, {
                readonly internalType: "uint16";
                readonly name: "txNumberInBlock";
                readonly type: "uint16";
            }, {
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "bytes32";
                readonly name: "key";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "value";
                readonly type: "bytes32";
            }];
            readonly indexed: false;
            readonly internalType: "struct L2ToL1Log";
            readonly name: "_l2log";
            readonly type: "tuple";
        }];
        readonly name: "L2ToL1LogSent";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }];
        readonly name: "requestBytecodeL1Publication";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_isService";
            readonly type: "bool";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_key";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_value";
            readonly type: "bytes32";
        }];
        readonly name: "sendL2ToL1Log";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "logIdInMerkleTree";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "_message";
            readonly type: "bytes";
        }];
        readonly name: "sendToL1";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IL1MessengerInterface;
    static connect(address: string, runner?: ContractRunner | null): IL1Messenger;
}
