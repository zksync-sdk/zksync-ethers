import { type ContractRunner } from "ethers";
import type { Contract2Factory, Contract2FactoryInterface } from "../Contract2Factory";
export declare class Contract2Factory__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }];
        readonly name: "create2";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }, {
            readonly internalType: "enum IContractDeployer.AccountAbstractionVersion";
            readonly name: "";
            readonly type: "uint8";
        }];
        readonly name: "create2Account";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): Contract2FactoryInterface;
    static connect(address: string, runner?: ContractRunner | null): Contract2Factory;
}
