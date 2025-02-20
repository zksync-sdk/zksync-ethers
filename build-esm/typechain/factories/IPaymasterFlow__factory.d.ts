import { type ContractRunner } from "ethers";
import type { IPaymasterFlow, IPaymasterFlowInterface } from "../IPaymasterFlow";
export declare class IPaymasterFlow__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_minAllowance";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_innerInput";
            readonly type: "bytes";
        }];
        readonly name: "approvalBased";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "input";
            readonly type: "bytes";
        }];
        readonly name: "general";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IPaymasterFlowInterface;
    static connect(address: string, runner?: ContractRunner | null): IPaymasterFlow;
}
