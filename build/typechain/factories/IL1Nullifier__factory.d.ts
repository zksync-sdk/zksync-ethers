import { type ContractRunner } from "ethers";
import type { IL1Nullifier, IL1NullifierInterface } from "../IL1Nullifier";
export declare class IL1Nullifier__factory {
    static readonly abi: readonly [{
        readonly type: "constructor";
        readonly inputs: readonly [{
            readonly name: "_bridgehub";
            readonly type: "address";
            readonly internalType: "contract IBridgehub";
        }, {
            readonly name: "_interopCenter";
            readonly type: "address";
            readonly internalType: "contract IInteropCenter";
        }, {
            readonly name: "_eraChainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_eraDiamondProxy";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "BRIDGE_HUB";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract IBridgehub";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "__DEPRECATED_admin";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "__DEPRECATED_chainBalance";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "l1Token";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [{
            readonly name: "balance";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "__DEPRECATED_l2BridgeAddress";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "l2Bridge";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "__DEPRECATED_pendingAdmin";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "acceptOwnership";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "bridgeRecoverFailedTransfer";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_depositSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_assetData";
            readonly type: "bytes";
            readonly internalType: "bytes";
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
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "bridgehubConfirmL2TransactionForwarded";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_txDataHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_txHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "chainBalance";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_token";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "claimFailedDeposit";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_depositSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_l1Token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_amount";
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
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "claimFailedDepositLegacyErc20Bridge";
        readonly inputs: readonly [{
            readonly name: "_depositSender";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_l1Token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_amount";
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
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "depositHappened";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "l2DepositTxHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly outputs: readonly [{
            readonly name: "depositDataHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "encodeTxDataHash";
        readonly inputs: readonly [{
            readonly name: "_encodingVersion";
            readonly type: "bytes1";
            readonly internalType: "bytes1";
        }, {
            readonly name: "_originalCaller";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "_transferData";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
        readonly outputs: readonly [{
            readonly name: "txDataHash";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "finalizeDeposit";
        readonly inputs: readonly [{
            readonly name: "_finalizeWithdrawalParams";
            readonly type: "tuple";
            readonly internalType: "struct FinalizeL1DepositParams";
            readonly components: readonly [{
                readonly name: "chainId";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2BatchNumber";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2MessageIndex";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "l2Sender";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "l2TxNumberInBatch";
                readonly type: "uint16";
                readonly internalType: "uint16";
            }, {
                readonly name: "message";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }, {
                readonly name: "merkleProof";
                readonly type: "bytes32[]";
                readonly internalType: "bytes32[]";
            }];
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "finalizeWithdrawal";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
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
            readonly name: "_message";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "_merkleProof";
            readonly type: "bytes32[]";
            readonly internalType: "bytes32[]";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "initialize";
        readonly inputs: readonly [{
            readonly name: "_owner";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "_eraPostDiamondUpgradeFirstBatch";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_eraPostLegacyBridgeUpgradeFirstBatch";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_eraLegacyBridgeLastDepositBatch";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_eraLegacyBridgeLastDepositTxNumber";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "isWithdrawalFinalized";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "l2BatchNumber";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "l2ToL1MessageNumber";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "isFinalized";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "l1AssetRouter";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract IL1AssetRouter";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "l1NativeTokenVault";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract IL1NativeTokenVault";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "l2BridgeAddress";
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
        readonly name: "legacyBridge";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "contract IL1ERC20Bridge";
        }];
        readonly stateMutability: "view";
    }, {
        readonly type: "function";
        readonly name: "nullifyChainBalanceByNTV";
        readonly inputs: readonly [{
            readonly name: "_chainId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "_token";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
        readonly name: "renounceOwnership";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "setL1AssetRouter";
        readonly inputs: readonly [{
            readonly name: "_l1AssetRouter";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "setL1Erc20Bridge";
        readonly inputs: readonly [{
            readonly name: "_legacyBridge";
            readonly type: "address";
            readonly internalType: "contract IL1ERC20Bridge";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
    }, {
        readonly type: "function";
        readonly name: "setL1NativeTokenVault";
        readonly inputs: readonly [{
            readonly name: "_l1NativeTokenVault";
            readonly type: "address";
            readonly internalType: "contract IL1NativeTokenVault";
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
        readonly name: "transferTokenToNTV";
        readonly inputs: readonly [{
            readonly name: "_token";
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
        readonly type: "event";
        readonly name: "BridgehubDepositFinalized";
        readonly inputs: readonly [{
            readonly name: "chainId";
            readonly type: "uint256";
            readonly indexed: true;
            readonly internalType: "uint256";
        }, {
            readonly name: "txDataHash";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
        }, {
            readonly name: "l2DepositTxHash";
            readonly type: "bytes32";
            readonly indexed: true;
            readonly internalType: "bytes32";
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
        readonly name: "AddressAlreadySet";
        readonly inputs: readonly [{
            readonly name: "addr";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "DepositDoesNotExist";
        readonly inputs: readonly [{
            readonly name: "";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
    }, {
        readonly type: "error";
        readonly name: "DepositExists";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "EthTransferFailed";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "IncorrectTokenAddressFromNTV";
        readonly inputs: readonly [{
            readonly name: "assetId";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "tokenAddress";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "InvalidNTVBurnData";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "InvalidProof";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "InvalidSelector";
        readonly inputs: readonly [{
            readonly name: "func";
            readonly type: "bytes4";
            readonly internalType: "bytes4";
        }];
    }, {
        readonly type: "error";
        readonly name: "L2WithdrawalMessageWrongLength";
        readonly inputs: readonly [{
            readonly name: "messageLen";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly type: "error";
        readonly name: "LegacyBridgeNotSet";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "LegacyMethodForNonL1Token";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "NativeTokenVaultAlreadySet";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "NotInitializedReentrancyGuard";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "Reentrancy";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "SharedBridgeValueNotSet";
        readonly inputs: readonly [{
            readonly name: "";
            readonly type: "uint8";
            readonly internalType: "enum SharedBridgeKey";
        }];
    }, {
        readonly type: "error";
        readonly name: "SlotOccupied";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "TokenNotLegacy";
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
        readonly name: "UnsupportedEncodingVersion";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "WithdrawalAlreadyFinalized";
        readonly inputs: readonly [];
    }, {
        readonly type: "error";
        readonly name: "WrongL2Sender";
        readonly inputs: readonly [{
            readonly name: "providedL2Sender";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }, {
        readonly type: "error";
        readonly name: "WrongMsgLength";
        readonly inputs: readonly [{
            readonly name: "expected";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "length";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly type: "error";
        readonly name: "ZeroAddress";
        readonly inputs: readonly [];
    }];
    static createInterface(): IL1NullifierInterface;
    static connect(address: string, runner?: ContractRunner | null): IL1Nullifier;
}
