import { type ContractRunner } from "ethers";
import type { IContractDeployer, IContractDeployerInterface } from "../IContractDeployer";
export declare class IContractDeployer__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "accountAddress";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "enum IContractDeployer.AccountNonceOrdering";
            readonly name: "nonceOrdering";
            readonly type: "uint8";
        }];
        readonly name: "AccountNonceOrderingUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "accountAddress";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "enum IContractDeployer.AccountAbstractionVersion";
            readonly name: "aaVersion";
            readonly type: "uint8";
        }];
        readonly name: "AccountVersionUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "deployerAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "bytecodeHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "contractAddress";
            readonly type: "address";
        }];
        readonly name: "ContractDeployed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_input";
            readonly type: "bytes";
        }];
        readonly name: "create";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "newAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_input";
            readonly type: "bytes";
        }];
        readonly name: "create2";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "newAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_input";
            readonly type: "bytes";
        }, {
            readonly internalType: "enum IContractDeployer.AccountAbstractionVersion";
            readonly name: "_aaVersion";
            readonly type: "uint8";
        }];
        readonly name: "create2Account";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "newAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_input";
            readonly type: "bytes";
        }, {
            readonly internalType: "enum IContractDeployer.AccountAbstractionVersion";
            readonly name: "_aaVersion";
            readonly type: "uint8";
        }];
        readonly name: "createAccount";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "newAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_address";
            readonly type: "address";
        }];
        readonly name: "getAccountInfo";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "enum IContractDeployer.AccountAbstractionVersion";
                readonly name: "supportedAAVersion";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum IContractDeployer.AccountNonceOrdering";
                readonly name: "nonceOrdering";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IContractDeployer.AccountInfo";
            readonly name: "info";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_sender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_senderNonce";
            readonly type: "uint256";
        }];
        readonly name: "getNewAddressCreate";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "newAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_sender";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_bytecodeHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_input";
            readonly type: "bytes";
        }];
        readonly name: "getNewAddressCreate2";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "newAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum IContractDeployer.AccountAbstractionVersion";
            readonly name: "_version";
            readonly type: "uint8";
        }];
        readonly name: "updateAccountVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum IContractDeployer.AccountNonceOrdering";
            readonly name: "_nonceOrdering";
            readonly type: "uint8";
        }];
        readonly name: "updateNonceOrdering";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IContractDeployerInterface;
    static connect(address: string, runner?: ContractRunner | null): IContractDeployer;
}
