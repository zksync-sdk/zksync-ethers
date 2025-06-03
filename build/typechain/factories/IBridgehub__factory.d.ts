import { type ContractRunner } from "ethers";
import type { IBridgehub, IBridgehubInterface } from "../IBridgehub";
export declare class IBridgehub__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "assetInfo";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_assetAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "additionalData";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }];
        readonly name: "AssetRegistered";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "BaseTokenAssetIdRegistered";
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
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "BridgeBurn";
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
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "BridgeMint";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "chainTypeManager";
            readonly type: "address";
        }];
        readonly name: "ChainTypeManagerAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "chainTypeManager";
            readonly type: "address";
        }];
        readonly name: "ChainTypeManagerRemoved";
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
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "zkChain";
            readonly type: "address";
        }];
        readonly name: "MigrationFinalized";
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
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "settlementLayerChainId";
            readonly type: "uint256";
        }];
        readonly name: "MigrationStarted";
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
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "chainTypeManager";
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
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "bool";
            readonly name: "isWhitelisted";
            readonly type: "bool";
        }];
        readonly name: "SettlementLayerRegistered";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "L1_CHAIN_ID";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "acceptAdmin";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_chainTypeManager";
            readonly type: "address";
        }];
        readonly name: "addChainTypeManager";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_baseTokenAssetId";
            readonly type: "bytes32";
        }];
        readonly name: "addTokenAssetId";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "admin";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_baseTokenAssetId";
            readonly type: "bytes32";
        }];
        readonly name: "assetIdIsRegistered";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "assetRouter";
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
        }];
        readonly name: "baseTokenAssetId";
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
            readonly name: "_msgValue";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_originalCaller";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "bridgeBurn";
        readonly outputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "_bridgeMintData";
            readonly type: "bytes";
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
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "bridgeMint";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_depositSender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "bridgeRecoverFailedTransfer";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "chainTypeManager";
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
            readonly name: "_chainTypeManager";
            readonly type: "address";
        }];
        readonly name: "chainTypeManagerIsRegistered";
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
            readonly internalType: "address";
            readonly name: "_chainTypeManager";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_baseTokenAssetId";
            readonly type: "bytes32";
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
        }, {
            readonly internalType: "bytes[]";
            readonly name: "_factoryDeps";
            readonly type: "bytes[]";
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
            readonly internalType: "address";
            readonly name: "_ctmAddress";
            readonly type: "address";
        }];
        readonly name: "ctmAssetIdFromAddress";
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
        }];
        readonly name: "ctmAssetIdFromChainId";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_assetInfo";
            readonly type: "bytes32";
        }];
        readonly name: "ctmAssetIdToAddress";
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
            readonly internalType: "bytes32";
            readonly name: "_canonicalTxHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint64";
            readonly name: "_expirationTimestamp";
            readonly type: "uint64";
        }];
        readonly name: "forwardTransactionOnGateway";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getAllZKChainChainIDs";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getAllZKChains";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
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
        }];
        readonly name: "getZKChain";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "l1CtmDeployer";
        readonly outputs: readonly [{
            readonly internalType: "contract ICTMDeploymentTracker";
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
        readonly inputs: readonly [];
        readonly name: "messageRoot";
        readonly outputs: readonly [{
            readonly internalType: "contract IMessageRoot";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "migrationPaused";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "pauseMigration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_hyperchain";
            readonly type: "address";
        }];
        readonly name: "registerAlreadyDeployedZKChain";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "registerLegacyChain";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_newSettlementLayerChainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "_isWhitelisted";
            readonly type: "bool";
        }];
        readonly name: "registerSettlementLayer";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_chainTypeManager";
            readonly type: "address";
        }];
        readonly name: "removeChainTypeManager";
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
            readonly name: "_sharedBridge";
            readonly type: "address";
        }, {
            readonly internalType: "contract ICTMDeploymentTracker";
            readonly name: "_l1CtmDeployer";
            readonly type: "address";
        }, {
            readonly internalType: "contract IMessageRoot";
            readonly name: "_messageRoot";
            readonly type: "address";
        }];
        readonly name: "setAddresses";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_additionalData";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_assetAddress";
            readonly type: "address";
        }];
        readonly name: "setCTMAssetAddress";
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
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "settlementLayer";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "sharedBridge";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "unpauseMigration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_chainId";
            readonly type: "uint256";
        }];
        readonly name: "whitelistedSettlementLayers";
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
