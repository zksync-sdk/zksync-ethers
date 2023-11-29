import { BytesLike, ethers } from "ethers";
import { PAYMASTER_FLOW_ABI } from "./utils";

import {
    Address,
    ApprovalBasedPaymasterInput,
    GeneralPaymasterInput,
    PaymasterInput,
    PaymasterParams,
} from "./types";

/** @deprecated This ABI is here for backward compatibility - please use utils.PAYMASTER_FLOW_ABI instead */
export const IPaymasterFlow = new ethers.Interface(require("../abi/IPaymasterFlow.json").abi);

export function getApprovalBasedPaymasterInput(paymasterInput: ApprovalBasedPaymasterInput): BytesLike {
    return PAYMASTER_FLOW_ABI.encodeFunctionData("approvalBased", [
        paymasterInput.token,
        paymasterInput.minimalAllowance,
        paymasterInput.innerInput,
    ]);
}

export function getGeneralPaymasterInput(paymasterInput: GeneralPaymasterInput): BytesLike {
    return PAYMASTER_FLOW_ABI.encodeFunctionData("general", [paymasterInput.innerInput]);
}

export function getPaymasterParams(
    paymasterAddress: Address,
    paymasterInput: PaymasterInput,
): PaymasterParams {
    if (paymasterInput.type == "General") {
        return {
            paymaster: paymasterAddress,
            paymasterInput: getGeneralPaymasterInput(paymasterInput),
        };
    } else {
        return {
            paymaster: paymasterAddress,
            paymasterInput: getApprovalBasedPaymasterInput(paymasterInput),
        };
    }
}
