import { type ContractRunner } from "ethers";
import type { IBridgehub, IBridgehubInterface } from "../IBridgehub";
export declare class IBridgehub__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "oldAdmin";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newAdmin";
            readonly type: "address";
        }];
        readonly name: "NewAdmin";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "stateTransitionManager";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "chainGovernance";
            readonly type: "address";
        }];
        readonly name: "NewChain";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "oldPendingAdmin";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newPendingAdmin";
            readonly type: "address";
        }];
        readonly name: "NewPendingAdmin";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "acceptAdmin";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_stateTransitionManager";
            readonly type: "address";
        }];
        readonly name: "addStateTransitionManager";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "addToken";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "baseToken";
        readonly outputs: readonly [{
            readonly internalType: "address";
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
            readonly internalType: "address";
            readonly name: "_stateTransitionManager";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_baseToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_salt";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_admin";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "_initData";
            readonly type: "bytes";
        }];
        readonly name: "createNewChain";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "getHyperchain";
        readonly outputs: readonly [{
            readonly internalType: "address";
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
            readonly internalType: "uint256";
            readonly name: "_gasPrice";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2GasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2GasPerPubdataByteLimit";
            readonly type: "uint256";
        }];
        readonly name: "l2TransactionBaseCost";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
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
        }, {
            readonly internalType: "enum TxStatus";
            readonly name: "_status";
            readonly type: "uint8";
        }];
        readonly name: "proveL1ToL2TransactionStatus";
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
        }, {
            readonly internalType: "uint256";
            readonly name: "_batchNumber";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_index";
            readonly type: "uint256";
        }, {
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
                readonly name: "txNumberInBatch";
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
            readonly internalType: "struct L2Log";
            readonly name: "_log";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "_proof";
            readonly type: "bytes32[]";
        }];
        readonly name: "proveL2LogInclusion";
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
        }, {
            readonly internalType: "uint256";
            readonly name: "_batchNumber";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_index";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint16";
                readonly name: "txNumberInBatch";
                readonly type: "uint16";
            }, {
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct L2Message";
            readonly name: "_message";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "_proof";
            readonly type: "bytes32[]";
        }];
        readonly name: "proveL2MessageInclusion";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_stateTransitionManager";
            readonly type: "address";
        }];
        readonly name: "removeStateTransitionManager";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "chainId";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "mintValue";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "l2Contract";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "l2Value";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "l2Calldata";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "l2GasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "l2GasPerPubdataByteLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes[]";
                readonly name: "factoryDeps";
                readonly type: "bytes[]";
            }, {
                readonly internalType: "address";
                readonly name: "refundRecipient";
                readonly type: "address";
            }];
            readonly internalType: "struct L2TransactionRequestDirect";
            readonly name: "_request";
            readonly type: "tuple";
        }];
        readonly name: "requestL2TransactionDirect";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "canonicalTxHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "chainId";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "mintValue";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "l2Value";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "l2GasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "l2GasPerPubdataByteLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "refundRecipient";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "secondBridgeAddress";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "secondBridgeValue";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "secondBridgeCalldata";
                readonly type: "bytes";
            }];
            readonly internalType: "struct L2TransactionRequestTwoBridgesOuter";
            readonly name: "_request";
            readonly type: "tuple";
        }];
        readonly name: "requestL2TransactionTwoBridges";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "canonicalTxHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_newPendingAdmin";
            readonly type: "address";
        }];
        readonly name: "setPendingAdmin";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_sharedBridge";
            readonly type: "address";
        }];
        readonly name: "setSharedBridge";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "sharedBridge";
        readonly outputs: readonly [{
            readonly internalType: "contract IL1SharedBridge";
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
        }];
        readonly name: "stateTransitionManager";
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
            readonly name: "_stateTransitionManager";
            readonly type: "address";
        }];
        readonly name: "stateTransitionManagerIsRegistered";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_baseToken";
            readonly type: "address";
        }];
        readonly name: "tokenIsRegistered";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IBridgehubInterface;
    static connect(address: string, runner?: ContractRunner | null): IBridgehub;
}
