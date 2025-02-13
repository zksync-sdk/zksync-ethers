import { type ContractRunner } from "ethers";
import type { IL1NativeTokenVault, IL1NativeTokenVaultInterface } from "../IL1NativeTokenVault";
export declare class IL1NativeTokenVault__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "bridgedTokenBeacon";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "bridgedTokenProxyBytecodeHash";
            readonly type: "bytes32";
        }];
        readonly name: "BridgedTokenBeaconUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "l2TokenBeacon";
            readonly type: "address";
        }];
        readonly name: "TokenBeaconUpdated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "ASSET_ROUTER";
        readonly outputs: readonly [{
            readonly internalType: "contract IAssetRouterBase";
            readonly name: "";
            readonly type: "address";
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
        readonly name: "WETH_TOKEN";
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
            readonly name: "token";
            readonly type: "address";
        }];
        readonly name: "assetId";
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
            readonly internalType: "address";
            readonly name: "_tokenAddress";
            readonly type: "address";
        }];
        readonly name: "calculateAssetId";
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
            readonly name: "_originChainId";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_originToken";
            readonly type: "address";
        }];
        readonly name: "calculateCreate2TokenAddress";
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
        }];
        readonly name: "chainBalance";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_originChainId";
            readonly type: "uint256";
        }];
        readonly name: "getERC20Getters";
        readonly outputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "originChainId";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "registerEthToken";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_l1Token";
            readonly type: "address";
        }];
        readonly name: "registerToken";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "assetId";
            readonly type: "bytes32";
        }];
        readonly name: "tokenAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IL1NativeTokenVaultInterface;
    static connect(address: string, runner?: ContractRunner | null): IL1NativeTokenVault;
}
