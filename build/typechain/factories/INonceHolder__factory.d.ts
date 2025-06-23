import { type ContractRunner } from "ethers";
import type { INonceHolder, INonceHolderInterface } from "../INonceHolder";
export declare class INonceHolder__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "accountAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "key";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }];
        readonly name: "ValueSetUnderNonce";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_address";
            readonly type: "address";
        }];
        readonly name: "getDeploymentNonce";
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
            readonly name: "_address";
            readonly type: "address";
        }];
        readonly name: "getMinNonce";
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
            readonly name: "_address";
            readonly type: "address";
        }];
        readonly name: "getRawNonce";
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
            readonly name: "_key";
            readonly type: "uint256";
        }];
        readonly name: "getValueUnderNonce";
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
            readonly name: "_value";
            readonly type: "uint256";
        }];
        readonly name: "increaseMinNonce";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_address";
            readonly type: "address";
        }];
        readonly name: "incrementDeploymentNonce";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_expectedNonce";
            readonly type: "uint256";
        }];
        readonly name: "incrementMinNonceIfEquals";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_address";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_nonce";
            readonly type: "uint256";
        }];
        readonly name: "isNonceUsed";
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
            readonly name: "_key";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }];
        readonly name: "setValueUnderNonce";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_address";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_key";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "_shouldBeUsed";
            readonly type: "bool";
        }];
        readonly name: "validateNonceUsage";
        readonly outputs: readonly [];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): INonceHolderInterface;
    static connect(address: string, runner?: ContractRunner | null): INonceHolder;
}
