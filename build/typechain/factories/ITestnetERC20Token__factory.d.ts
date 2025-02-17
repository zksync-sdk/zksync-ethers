import { type ContractRunner } from "ethers";
import type { ITestnetERC20Token, ITestnetERC20TokenInterface } from "../ITestnetERC20Token";
export declare class ITestnetERC20Token__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "decimals";
        readonly outputs: readonly [{
            readonly internalType: "uint8";
            readonly name: "";
            readonly type: "uint8";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "mint";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITestnetERC20TokenInterface;
    static connect(address: string, runner?: ContractRunner | null): ITestnetERC20Token;
}
