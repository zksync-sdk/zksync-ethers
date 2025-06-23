import { type ContractRunner } from "ethers";
import type { IZkSync, IZkSyncInterface } from "../IZkSync";
export declare class IZkSync__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "batchNumber";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "batchHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "commitment";
            readonly type: "bytes32";
        }];
        readonly name: "BlockCommit";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "batchNumber";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "batchHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "commitment";
            readonly type: "bytes32";
        }];
        readonly name: "BlockExecution";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "totalBatchesCommitted";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "totalBatchesVerified";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "totalBatchesExecuted";
            readonly type: "uint256";
        }];
        readonly name: "BlocksRevert";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "previousLastVerifiedBatch";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "currentLastVerifiedBatch";
            readonly type: "uint256";
        }];
        readonly name: "BlocksVerification";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "EthWithdrawalFinalized";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "facet";
                    readonly type: "address";
                }, {
                    readonly internalType: "enum Diamond.Action";
                    readonly name: "action";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isFreezable";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bytes4[]";
                    readonly name: "selectors";
                    readonly type: "bytes4[]";
                }];
                readonly internalType: "struct Diamond.FacetCut[]";
                readonly name: "facetCuts";
                readonly type: "tuple[]";
            }, {
                readonly internalType: "address";
                readonly name: "initAddress";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "initCalldata";
                readonly type: "bytes";
            }];
            readonly indexed: false;
            readonly internalType: "struct Diamond.DiamondCutData";
            readonly name: "diamondCut";
            readonly type: "tuple";
        }];
        readonly name: "ExecuteUpgrade";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [];
        readonly name: "Freeze";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "isPorterAvailable";
            readonly type: "bool";
        }];
        readonly name: "IsPorterAvailableStatusUpdate";
        readonly type: "event";
    }, {
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
            readonly internalType: "address";
            readonly name: "oldGovernor";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newGovernor";
            readonly type: "address";
        }];
        readonly name: "NewGovernor";
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
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "oldPendingGovernor";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newPendingGovernor";
            readonly type: "address";
        }];
        readonly name: "NewPendingGovernor";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "txId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "txHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint64";
            readonly name: "expirationTimestamp";
            readonly type: "uint64";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "txType";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "from";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "to";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "gasLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "gasPerPubdataByteLimit";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxPriorityFeePerGas";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "paymaster";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "value";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256[4]";
                readonly name: "reserved";
                readonly type: "uint256[4]";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256[]";
                readonly name: "factoryDeps";
                readonly type: "uint256[]";
            }, {
                readonly internalType: "bytes";
                readonly name: "paymasterInput";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "reservedDynamic";
                readonly type: "bytes";
            }];
            readonly indexed: false;
            readonly internalType: "struct IMailbox.L2CanonicalTransaction";
            readonly name: "transaction";
            readonly type: "tuple";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes[]";
            readonly name: "factoryDeps";
            readonly type: "bytes[]";
        }];
        readonly name: "NewPriorityRequest";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "oldPriorityTxMaxGasLimit";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "newPriorityTxMaxGasLimit";
            readonly type: "uint256";
        }];
        readonly name: "NewPriorityTxMaxGasLimit";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [];
        readonly name: "Unfreeze";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "validatorAddress";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "isActive";
            readonly type: "bool";
        }];
        readonly name: "ValidatorStatusUpdate";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "acceptAdmin";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "acceptGovernor";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint64";
                readonly name: "batchNumber";
                readonly type: "uint64";
            }, {
                readonly internalType: "bytes32";
                readonly name: "batchHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint64";
                readonly name: "indexRepeatedStorageChanges";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint256";
                readonly name: "numberOfLayer1Txs";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "priorityOperationsHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "l2LogsTreeRoot";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "timestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "commitment";
                readonly type: "bytes32";
            }];
            readonly internalType: "struct IExecutor.StoredBatchInfo";
            readonly name: "_lastCommittedBatchData";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint64";
                readonly name: "batchNumber";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint64";
                readonly name: "timestamp";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint64";
                readonly name: "indexRepeatedStorageChanges";
                readonly type: "uint64";
            }, {
                readonly internalType: "bytes32";
                readonly name: "newStateRoot";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "numberOfLayer1Txs";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "priorityOperationsHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "bootloaderHeapInitialContentsHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "eventsQueueStateHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes";
                readonly name: "systemLogs";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "totalL2ToL1Pubdata";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IExecutor.CommitBatchInfo[]";
            readonly name: "_newBatchesData";
            readonly type: "tuple[]";
        }];
        readonly name: "commitBatches";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint64";
                readonly name: "batchNumber";
                readonly type: "uint64";
            }, {
                readonly internalType: "bytes32";
                readonly name: "batchHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint64";
                readonly name: "indexRepeatedStorageChanges";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint256";
                readonly name: "numberOfLayer1Txs";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "priorityOperationsHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "l2LogsTreeRoot";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "timestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "commitment";
                readonly type: "bytes32";
            }];
            readonly internalType: "struct IExecutor.StoredBatchInfo[]";
            readonly name: "_batchesData";
            readonly type: "tuple[]";
        }];
        readonly name: "executeBatches";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "facet";
                    readonly type: "address";
                }, {
                    readonly internalType: "enum Diamond.Action";
                    readonly name: "action";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isFreezable";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bytes4[]";
                    readonly name: "selectors";
                    readonly type: "bytes4[]";
                }];
                readonly internalType: "struct Diamond.FacetCut[]";
                readonly name: "facetCuts";
                readonly type: "tuple[]";
            }, {
                readonly internalType: "address";
                readonly name: "initAddress";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "initCalldata";
                readonly type: "bytes";
            }];
            readonly internalType: "struct Diamond.DiamondCutData";
            readonly name: "_diamondCut";
            readonly type: "tuple";
        }];
        readonly name: "executeUpgrade";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "facetAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "facet";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "facetAddresses";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "facets";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_facet";
            readonly type: "address";
        }];
        readonly name: "facetFunctionSelectors";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "facets";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IGetters.Facet[]";
            readonly name: "";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
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
        readonly name: "finalizeEthWithdrawal";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "freezeDiamond";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFirstUnprocessedPriorityTx";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getGovernor";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getL2BootloaderBytecodeHash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getL2DefaultAccountBytecodeHash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getL2SystemContractsUpgradeBatchNumber";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getL2SystemContractsUpgradeTxHash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getName";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getPendingGovernor";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getPriorityQueueSize";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getPriorityTxMaxGasLimit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getProtocolVersion";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTotalBatchesCommitted";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTotalBatchesExecuted";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTotalBatchesVerified";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTotalPriorityTxs";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getVerifier";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getVerifierParams";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "recursionNodeLevelVkHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "recursionLeafLevelVkHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "recursionCircuitsSetVksHash";
                readonly type: "bytes32";
            }];
            readonly internalType: "struct VerifierParams";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "isDiamondStorageFrozen";
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
            readonly name: "_l2BatchNumber";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2MessageIndex";
            readonly type: "uint256";
        }];
        readonly name: "isEthWithdrawalFinalized";
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
            readonly name: "_facet";
            readonly type: "address";
        }];
        readonly name: "isFacetFreezable";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "isFreezable";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "isFunctionFreezable";
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
            readonly name: "_address";
            readonly type: "address";
        }];
        readonly name: "isValidator";
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
            readonly name: "_batchNumber";
            readonly type: "uint256";
        }];
        readonly name: "l2LogsRootHash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "hash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
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
        readonly inputs: readonly [];
        readonly name: "priorityQueueFrontOperation";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "canonicalTxHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint64";
                readonly name: "expirationTimestamp";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint192";
                readonly name: "layer2Tip";
                readonly type: "uint192";
            }];
            readonly internalType: "struct PriorityOperation";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint64";
                readonly name: "batchNumber";
                readonly type: "uint64";
            }, {
                readonly internalType: "bytes32";
                readonly name: "batchHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint64";
                readonly name: "indexRepeatedStorageChanges";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint256";
                readonly name: "numberOfLayer1Txs";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "priorityOperationsHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "l2LogsTreeRoot";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "timestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "commitment";
                readonly type: "bytes32";
            }];
            readonly internalType: "struct IExecutor.StoredBatchInfo";
            readonly name: "_prevBatch";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint64";
                readonly name: "batchNumber";
                readonly type: "uint64";
            }, {
                readonly internalType: "bytes32";
                readonly name: "batchHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint64";
                readonly name: "indexRepeatedStorageChanges";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint256";
                readonly name: "numberOfLayer1Txs";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "priorityOperationsHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "l2LogsTreeRoot";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "timestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes32";
                readonly name: "commitment";
                readonly type: "bytes32";
            }];
            readonly internalType: "struct IExecutor.StoredBatchInfo[]";
            readonly name: "_committedBatches";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256[]";
                readonly name: "recursiveAggregationInput";
                readonly type: "uint256[]";
            }, {
                readonly internalType: "uint256[]";
                readonly name: "serializedProof";
                readonly type: "uint256[]";
            }];
            readonly internalType: "struct IExecutor.ProofInput";
            readonly name: "_proof";
            readonly type: "tuple";
        }];
        readonly name: "proveBatches";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
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
            readonly name: "_l2BatchNumber";
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
            readonly name: "_l2BatchNumber";
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
            readonly name: "_contractL2";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2Value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_calldata";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2GasLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_l2GasPerPubdataByteLimit";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes[]";
            readonly name: "_factoryDeps";
            readonly type: "bytes[]";
        }, {
            readonly internalType: "address";
            readonly name: "_refundRecipient";
            readonly type: "address";
        }];
        readonly name: "requestL2Transaction";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "canonicalTxHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_newLastBatch";
            readonly type: "uint256";
        }];
        readonly name: "revertBatches";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
            readonly name: "_newPendingGovernor";
            readonly type: "address";
        }];
        readonly name: "setPendingGovernor";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_zkPorterIsAvailable";
            readonly type: "bool";
        }];
        readonly name: "setPorterAvailability";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_newPriorityTxMaxGasLimit";
            readonly type: "uint256";
        }];
        readonly name: "setPriorityTxMaxGasLimit";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_validator";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "_active";
            readonly type: "bool";
        }];
        readonly name: "setValidator";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_batchNumber";
            readonly type: "uint256";
        }];
        readonly name: "storedBatchHash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "unfreezeDiamond";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IZkSyncInterface;
    static connect(address: string, runner?: ContractRunner | null): IZkSync;
}
