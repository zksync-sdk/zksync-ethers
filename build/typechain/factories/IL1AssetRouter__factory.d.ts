import { type ContractRunner } from "ethers";
import type { IL1AssetRouter, IL1AssetRouterInterface } from "../IL1AssetRouter";
export declare class IL1AssetRouter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_l1WethAddress";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_bridgehub";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_l1Nullifier";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_eraChainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_eraDiamondProxy";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "addr";
            readonly type: "address";
        }];
        readonly name: "AddressAlreadyUsed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "AssetHandlerDoesNotExist";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "AssetIdNotSupported";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NotInitializedReentrancyGuard";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "Reentrancy";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SlotOccupied";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }];
        readonly name: "TokenNotSupported";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "caller";
            readonly type: "address";
        }];
        readonly name: "Unauthorized";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "UnsupportedEncodingVersion";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroAddress";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "assetDeploymentTracker";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "additionalData";
            readonly type: "bytes32";
        }];
        readonly name: "AssetDeploymentTrackerSet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_assetAddress";
            readonly type: "address";
        }];
        readonly name: "AssetHandlerRegistered";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "assetHandlerAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "additionalData";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "assetDeploymentTracker";
            readonly type: "address";
        }];
        readonly name: "AssetHandlerRegisteredInitial";
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
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "BridgehubDepositBaseTokenInitiated";
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
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "bridgeMintCalldata";
            readonly type: "bytes";
        }];
        readonly name: "BridgehubDepositInitiated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "bridgeMintData";
            readonly type: "bytes";
        }];
        readonly name: "BridgehubMintData";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "assetDataHash";
            readonly type: "bytes32";
        }];
        readonly name: "BridgehubWithdrawalInitiated";
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
            readonly internalType: "bytes";
            readonly name: "assetData";
            readonly type: "bytes";
        }];
        readonly name: "ClaimedFailedDepositAssetRouter";
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
            readonly internalType: "bytes";
            readonly name: "assetData";
            readonly type: "bytes";
        }];
        readonly name: "DepositFinalizedAssetRouter";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint8";
            readonly name: "version";
            readonly type: "uint8";
        }];
        readonly name: "Initialized";
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
            readonly name: "l1Asset";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "LegacyDepositInitiated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "previousOwner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "OwnershipTransferStarted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "previousOwner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "OwnershipTransferred";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "Paused";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "Unpaused";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "BRIDGE_HUB";
        readonly outputs: readonly [{
            readonly internalType: "contract IBridgehub";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "ERA_CHAIN_ID";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
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
        readonly name: "L1_NULLIFIER";
        readonly outputs: readonly [{
            readonly internalType: "contract IL1Nullifier";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "L1_WETH_TOKEN";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "acceptOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "assetDeploymentTracker";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "assetDeploymentTracker";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "assetHandlerAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "assetHandlerAddress";
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
            readonly name: "_depositSender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_assetData";
            readonly type: "bytes";
        }];
        readonly name: "bridgeRecoverFailedTransfer";
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
            readonly name: "_depositSender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_assetData";
            readonly type: "bytes";
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
        readonly name: "bridgeRecoverFailedTransfer";
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
            readonly name: "_originalCaller";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
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
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_originalCaller";
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
            readonly internalType: "address";
            readonly name: "_originalCaller";
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
        readonly name: "depositLegacyErc20Bridge";
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
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_transferData";
            readonly type: "bytes";
        }];
        readonly name: "finalizeDeposit";
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
            readonly internalType: "address";
            readonly name: "_sender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_assetData";
            readonly type: "bytes";
        }];
        readonly name: "getDepositCalldata";
        readonly outputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_owner";
            readonly type: "address";
        }];
        readonly name: "initialize";
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
        readonly name: "isWithdrawalFinalized";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "legacyBridge";
        readonly outputs: readonly [{
            readonly internalType: "contract IL1ERC20Bridge";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "nativeTokenVault";
        readonly outputs: readonly [{
            readonly internalType: "contract INativeTokenVault";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "owner";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "pause";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "paused";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "pendingOwner";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "renounceOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_assetRegistrationData";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_assetDeploymentTracker";
            readonly type: "address";
        }];
        readonly name: "setAssetDeploymentTracker";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_assetRegistrationData";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_assetHandlerAddress";
            readonly type: "address";
        }];
        readonly name: "setAssetHandlerAddressThisChain";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IL1ERC20Bridge";
            readonly name: "_legacyBridge";
            readonly type: "address";
        }];
        readonly name: "setL1Erc20Bridge";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract INativeTokenVault";
            readonly name: "_nativeTokenVault";
            readonly type: "address";
        }];
        readonly name: "setNativeTokenVault";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_originalCaller";
            readonly type: "address";
        }];
        readonly name: "transferFundsToNTV";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "transferOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "unpause";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IL1AssetRouterInterface;
    static connect(address: string, runner?: ContractRunner | null): IL1AssetRouter;
}
