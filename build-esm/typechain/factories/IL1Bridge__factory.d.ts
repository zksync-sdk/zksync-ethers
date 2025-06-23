import { type ContractRunner } from "ethers";
import type { IL1Bridge, IL1BridgeInterface } from "../IL1Bridge";
export declare class IL1Bridge__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "txDataHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "l2DepositTxHash";
            readonly type: "bytes32";
        }];
        readonly name: "BridgehubDepositFinalized";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "txDataHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "l1Token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "BridgehubDepositInitiatedSharedBridge";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l1Token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "ClaimedFailedDepositSharedBridge";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "l2DepositTxHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "l1Token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "DepositInitiatedSharedBridge";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l1Token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "WithdrawalFinalizedSharedBridge";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "bridgehub";
        readonly outputs: readonly [{
            readonly internalType: "contract IBridgehub";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_txDataHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_txHash";
            readonly type: "bytes32";
        }];
        readonly name: "bridgehubConfirmL2Transaction";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_prevMsgSender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "bridgehubDeposit";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "magicValue";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "l2Contract";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "l2Calldata";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes[]";
                readonly name: "factoryDeps";
                readonly type: "bytes[]";
            }, {
                readonly internalType: "bytes32";
                readonly name: "txDataHash";
                readonly type: "bytes32";
            }];
            readonly internalType: "struct L2TransactionRequestTwoBridgesInner";
            readonly name: "request";
            readonly type: "tuple";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_prevMsgSender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_l1Token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "bridgehubDepositBaseToken";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_depositSender";
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
            readonly internalType: "bytes32";
            readonly name: "_l2TxHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2BatchNumber";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2MessageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint16";
            readonly name: "_l2TxNumberInBatch";
            readonly type: "uint16";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "_merkleProof";
            readonly type: "bytes32[]";
        }];
        readonly name: "claimFailedDeposit";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
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
            readonly name: "_mintValue";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2TxGasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2TxGasPerPubdataByte";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_refundRecipient";
            readonly type: "address";
        }];
        readonly name: "deposit";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "txHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_l2TxHash";
            readonly type: "bytes32";
        }];
        readonly name: "depositHappened";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2BatchNumber";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2MessageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint16";
            readonly name: "_l2TxNumberInBatch";
            readonly type: "uint16";
        }, {
            readonly internalType: "bytes";
            readonly name: "_message";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "_merkleProof";
            readonly type: "bytes32[]";
        }];
        readonly name: "finalizeWithdrawal";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2BatchNumber";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2MessageIndex";
            readonly type: "uint256";
        }];
        readonly name: "isWithdrawalFinalizedShared";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "l2BridgeAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IL1BridgeInterface;
    static connect(address: string, runner?: ContractRunner | null): IL1Bridge;
}
