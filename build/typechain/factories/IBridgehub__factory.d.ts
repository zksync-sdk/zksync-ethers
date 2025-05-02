import { type ContractRunner } from "ethers";
import type { IBridgehub, IBridgehubInterface } from "../IBridgehub";
export declare class IBridgehub__factory {
    static readonly abi: readonly [{
        readonly type: "constructor";
        readonly inputs: readonly [{
            readonly name: "_l1ChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_owner";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_maxNumberOfZKChains";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "L1_CHAIN_ID";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "MAX_NUMBER_OF_ZK_CHAINS";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "acceptAdmin";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "acceptOwnership";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "addChainTypeManager";
        readonly inputs: readonly [{
            readonly name: "_chainTypeManager";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "addTokenAssetId";
        readonly inputs: readonly [{
            readonly name: "_baseTokenAssetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "admin";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "assetIdIsRegistered";
        readonly inputs: readonly [{
            readonly name: "baseTokenAssetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "assetRouter";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "baseToken";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "baseTokenAssetId";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "bridgeBurn";
        readonly inputs: readonly [{
            readonly name: "_settlementChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_l2MsgValue";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_originalCaller";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_data";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
        readonly outputs: readonly [{
            readonly name: "bridgehubMintData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "bridgeMint";
        readonly inputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_bridgehubMintData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "bridgeRecoverFailedTransfer";
        readonly inputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_depositSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_data";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "chainTypeManager";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "chainTypeManagerIsRegistered";
        readonly inputs: readonly [{
            readonly name: "chainTypeManager";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "createNewChain";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_chainTypeManager";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_baseTokenAssetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_salt";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_admin";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_initData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "_factoryDeps";
            readonly type: "bytes[]";
            readonly internalType: "bytes[]";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "ctmAssetIdFromAddress";
        readonly inputs: readonly [{
            readonly name: "ctmAddress";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [{
            readonly name: "ctmAssetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "ctmAssetIdFromChainId";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "ctmAssetIdToAddress";
        readonly inputs: readonly [{
            readonly name: "ctmAssetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly outputs: readonly [{
            readonly name: "ctmAddress";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "forwardTransactionOnGateway";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_canonicalTxHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_expirationTimestamp";
            readonly type: "uint64";
            readonly internalType: "uint64";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "getAllZKChainChainIDs";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "uint256[]";
            readonly internalType: "uint256[]";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "getAllZKChains";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "chainAddresses";
            readonly type: "address[]";
            readonly internalType: "address[]";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "getZKChain";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "chainAddress";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "initialize";
        readonly inputs: readonly [{
            readonly name: "_owner";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "initializeV2";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "interopCenter";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract IInteropCenter";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "l1CtmDeployer";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract ICTMDeploymentTracker";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "l2TransactionBaseCost";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_gasPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_l2GasLimit";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_l2GasPerPubdataByteLimit";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "messageRoot";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract IMessageRoot";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "migrationPaused";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "owner";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "pause";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "pauseMigration";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "paused";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "pendingOwner";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "proveL1ToL2TransactionStatus";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_l2TxHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_l2BatchNumber";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_l2MessageIndex";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_l2TxNumberInBatch";
            readonly type: "uint16";
            readonly internalType: "uint16";
        }, {
            readonly name: "_merkleProof";
            readonly type: "bytes32[]";
            readonly internalType: "bytes32[]";
        }, {
            readonly name: "_status";
            readonly type: "uint8";
            readonly internalType: "enum TxStatus";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "proveL2LogInclusion";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_batchNumber";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_index";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_log";
            readonly type: "tuple";
            readonly internalType: "struct L2Log";
            readonly components: readonly [{
                readonly name: "l2ShardId";
                readonly type: "uint8";
                readonly internalType: "uint8";
            }, {
                readonly name: "isService";
                readonly type: "bool";
                readonly internalType: "bool";
            }, {
                readonly name: "txNumberInBatch";
                readonly type: "uint16";
                readonly internalType: "uint16";
            }, {
                readonly name: "sender";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "key";
                readonly type: "bytes32";
                readonly internalType: "bytes32";
            }, {
                readonly name: "value";
                readonly type: "bytes32";
                readonly internalType: "bytes32";
            }];
        }, {
            readonly name: "_proof";
            readonly type: "bytes32[]";
            readonly internalType: "bytes32[]";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "proveL2MessageInclusion";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_batchNumber";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_index";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_message";
            readonly type: "tuple";
            readonly internalType: "struct L2Message";
            readonly components: readonly [{
                readonly name: "txNumberInBatch";
                readonly type: "uint16";
                readonly internalType: "uint16";
            }, {
                readonly name: "sender";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "data";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }];
        }, {
            readonly name: "_proof";
            readonly type: "bytes32[]";
            readonly internalType: "bytes32[]";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "registerAlreadyDeployedZKChain";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_zkChain";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "registerLegacyChain";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "registerSettlementLayer";
        readonly inputs: readonly [{
            readonly name: "_newSettlementLayerChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_isWhitelisted";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "removeChainTypeManager";
        readonly inputs: readonly [{
            readonly name: "_chainTypeManager";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "renounceOwnership";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "requestL2TransactionDirect";
        readonly inputs: readonly [{
            readonly name: "_request";
            readonly type: "tuple";
            readonly internalType: "struct L2TransactionRequestDirect";
            readonly components: readonly [{
                readonly name: "chainId";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "mintValue";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2Contract";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "l2Value";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2Calldata";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }, {
                readonly name: "l2GasLimit";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2GasPerPubdataByteLimit";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "factoryDeps";
                readonly type: "bytes[]";
                readonly internalType: "bytes[]";
            }, {
                readonly name: "refundRecipient";
                readonly type: "address";
                readonly internalType: "address";
            }];
        }];
        readonly outputs: readonly [{
            readonly name: "canonicalTxHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "requestL2TransactionTwoBridges";
        readonly inputs: readonly [{
            readonly name: "_request";
            readonly type: "tuple";
            readonly internalType: "struct L2TransactionRequestTwoBridgesOuter";
            readonly components: readonly [{
                readonly name: "chainId";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "mintValue";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2Value";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2GasLimit";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2GasPerPubdataByteLimit";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "refundRecipient";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "secondBridgeAddress";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "secondBridgeValue";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "secondBridgeCalldata";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }];
        }];
        readonly outputs: readonly [{
            readonly name: "canonicalTxHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "routeBridgehubConfirmL2Transaction";
        readonly inputs: readonly [{
            readonly name: "_secondBridgeAddress";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_txDataHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_canonicalTxHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "routeBridgehubDeposit";
        readonly inputs: readonly [{
            readonly name: "_request";
            readonly type: "tuple";
            readonly internalType: "struct RouteBridgehubDepositStruct";
            readonly components: readonly [{
                readonly name: "secondBridgeAddress";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "chainId";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "sender";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "l2Value";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "secondBridgeCalldata";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }];
        }];
        readonly outputs: readonly [{
            readonly name: "outputRequest";
            readonly type: "tuple";
            readonly internalType: "struct L2TransactionRequestTwoBridgesInner";
            readonly components: readonly [{
                readonly name: "magicValue";
                readonly type: "bytes32";
                readonly internalType: "bytes32";
            }, {
                readonly name: "l2Contract";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "l2Calldata";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }, {
                readonly name: "factoryDeps";
                readonly type: "bytes[]";
                readonly internalType: "bytes[]";
            }, {
                readonly name: "txDataHash";
                readonly type: "bytes32";
                readonly internalType: "bytes32";
            }];
        }];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "setAddresses";
        readonly inputs: readonly [{
            readonly name: "_assetRouter";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_l1CtmDeployer";
            readonly type: "address";
            readonly internalType: "contract ICTMDeploymentTracker";
        }, {
            readonly name: "_messageRoot";
            readonly type: "address";
            readonly internalType: "contract IMessageRoot";
        }, {
            readonly name: "_interopCenter";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "setCTMAssetAddress";
        readonly inputs: readonly [{
            readonly name: "_additionalData";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_assetAddress";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "setPendingAdmin";
        readonly inputs: readonly [{
            readonly name: "_newPendingAdmin";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "settlementLayer";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "activeSettlementLayerChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "transferOwnership";
        readonly inputs: readonly [{
            readonly name: "newOwner";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "unpause";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "unpauseMigration";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "whitelistedSettlementLayers";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "isWhitelistedSettlementLayer";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "event";
        readonly name: "AssetRegistered";
        readonly inputs: readonly [{
            readonly name: "assetInfo";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "_assetAddress";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }, {
            readonly name: "additionalData";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "sender";
            readonly type: "address";
            readonly indexed: false;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "BaseTokenAssetIdRegistered";
        readonly inputs: readonly [{
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "BridgeBurn";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "sender";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }, {
            readonly name: "receiver";
            readonly type: "address";
            readonly indexed: false;
            readonly internalType: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
            readonly indexed: false;
            readonly internalType: "uint256";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "BridgeMint";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "receiver";
            readonly type: "address";
            readonly indexed: false;
            readonly internalType: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
            readonly indexed: false;
            readonly internalType: "uint256";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "ChainTypeManagerAdded";
        readonly inputs: readonly [{
            readonly name: "chainTypeManager";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "ChainTypeManagerRemoved";
        readonly inputs: readonly [{
            readonly name: "chainTypeManager";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "Initialized";
        readonly inputs: readonly [{
            readonly name: "version";
            readonly type: "uint8";
            readonly indexed: false;
            readonly internalType: "uint8";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "MigrationFinalized";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "zkChain";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "MigrationStarted";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "settlementLayerChainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "NewAdmin";
        readonly inputs: readonly [{
            readonly name: "oldAdmin";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }, {
            readonly name: "newAdmin";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "NewChain";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "chainTypeManager";
            readonly type: "address";
            readonly indexed: false;
            readonly internalType: "address";
        }, {
            readonly name: "chainGovernance";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "NewPendingAdmin";
        readonly inputs: readonly [{
            readonly name: "oldPendingAdmin";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }, {
            readonly name: "newPendingAdmin";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "OwnershipTransferStarted";
        readonly inputs: readonly [{
            readonly name: "previousOwner";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }, {
            readonly name: "newOwner";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "OwnershipTransferred";
        readonly inputs: readonly [{
            readonly name: "previousOwner";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }, {
            readonly name: "newOwner";
            readonly type: "address";
            readonly indexed: true;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "Paused";
        readonly inputs: readonly [{
            readonly name: "account";
            readonly type: "address";
            readonly indexed: false;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "SettlementLayerRegistered";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "isWhitelisted";
            readonly type: "bool";
            readonly indexed: true;
            readonly internalType: "bool";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "event";
        readonly name: "Unpaused";
        readonly inputs: readonly [{
            readonly name: "account";
            readonly type: "address";
            readonly indexed: false;
            readonly internalType: "address";
        }];
        readonly anonymous: false;
    }, {
        readonly type: "error";
        readonly name: "AlreadyCurrentSL";
        readonly inputs: readonly [{
            readonly name: "blockChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly type: "error";
        readonly name: "AssetHandlerNotRegistered";
        readonly inputs: readonly [{
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
    }, {
        readonly type: "error";
        readonly name: "AssetIdAlreadyRegistered";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "AssetIdNotSupported";
        readonly inputs: readonly [{
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
    }, {
        readonly type: "error";
        readonly name: "BridgeHubAlreadyRegistered";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "CTMAlreadyRegistered";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "CTMNotRegistered";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainIdAlreadyExists";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainIdAlreadyPresent";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainIdCantBeCurrentChain";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainIdMismatch";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainIdNotRegistered";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly type: "error";
        readonly name: "ChainIdTooBig";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainNotLegacy";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ChainNotPresentInCTM";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "EmptyAssetId";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "HyperchainNotRegistered";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "IncorrectBridgeHubAddress";
        readonly inputs: readonly [{
            readonly name: "bridgehub";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "IncorrectChainAssetId";
        readonly inputs: readonly [{
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "assetIdFromChainId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
    }, {
        readonly type: "error";
        readonly name: "IncorrectSender";
        readonly inputs: readonly [{
            readonly name: "prevMsgSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "chainAdmin";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "MigrationPaused";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "NoCTMForAssetId";
        readonly inputs: readonly [{
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
    }, {
        readonly type: "error";
        readonly name: "NonEmptyMsgValue";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "NotAssetRouter";
        readonly inputs: readonly [{
            readonly name: "msgSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "sharedBridge";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "NotCurrentSL";
        readonly inputs: readonly [{
            readonly name: "settlementLayerChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "blockChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly type: "error";
        readonly name: "NotInGatewayMode";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "NotInitializedReentrancyGuard";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "NotL1";
        readonly inputs: readonly [{
            readonly name: "l1ChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "blockChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly type: "error";
        readonly name: "NotRelayedSender";
        readonly inputs: readonly [{
            readonly name: "msgSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "settlementLayerRelaySender";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "Reentrancy";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "SLNotWhitelisted";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "SettlementLayersMustSettleOnL1";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "SharedBridgeNotSet";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "SlotOccupied";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "Unauthorized";
        readonly inputs: readonly [{
            readonly name: "caller";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "ZKChainLimitReached";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ZeroAddress";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "ZeroChainId";
        readonly inputs: readonly [];
    }];
    static createInterface(): IBridgehubInterface;
    static connect(address: string, runner?: ContractRunner | null): IBridgehub;
}
