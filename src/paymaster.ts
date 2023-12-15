import { getAddress } from "ethers";
import { ApprovalBasedPaymasterInput, GeneralPaymasterInput } from "./types";
import { encodeData, getPaymasterParams } from "./utils";

export class Paymaster {
    type: string;
    address: string;
    paymasterInput: ApprovalBasedPaymasterInput | GeneralPaymasterInput;

    constructor(
        type: "ApprovalBased" | "General",
        address: string,
        tokenAddress: string = "",
        minimalAllowance: number = 1,
        innerInput: any[] = [],
    ) {
        this.type = type;
        this.address = getAddress(address);
        const encodedInnerInput = encodeData(innerInput);
        this.paymasterInput =
            type == "ApprovalBased"
                ? {
                      type,
                      token: getAddress(tokenAddress),
                      minimalAllowance,
                      innerInput: encodedInnerInput,
                  }
                : {
                      type,
                      innerInput: encodedInnerInput,
                  };
    }

    getPaymasterParams() {
        return getPaymasterParams(this.address, this.paymasterInput);
    }
}
