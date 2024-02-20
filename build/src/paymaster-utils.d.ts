import { BytesLike, ethers } from "ethers";
import { Address, ApprovalBasedPaymasterInput, GeneralPaymasterInput, PaymasterInput, PaymasterParams } from "./types";
export declare const PAYMASTER_FLOW_ABI: ethers.utils.Interface;
export declare function getApprovalBasedPaymasterInput(paymasterInput: ApprovalBasedPaymasterInput): BytesLike;
export declare function getGeneralPaymasterInput(paymasterInput: GeneralPaymasterInput): BytesLike;
export declare function getPaymasterParams(paymasterAddress: Address, paymasterInput: PaymasterInput): PaymasterParams;
