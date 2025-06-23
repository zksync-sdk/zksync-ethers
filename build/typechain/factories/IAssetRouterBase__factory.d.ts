import { type ContractRunner } from "ethers";
import type { IAssetRouterBase, IAssetRouterBaseInterface } from "../IAssetRouterBase";
export declare class IAssetRouterBase__factory {
    static readonly abi: readonly [{
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
        readonly name: "DepositFinalizedAssetRouter";
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
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_assetId";
            readonly type: "bytes32";
        }];
        readonly name: "assetHandlerAddress";
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
    }];
    static createInterface(): IAssetRouterBaseInterface;
    static connect(address: string, runner?: ContractRunner | null): IAssetRouterBase;
}
