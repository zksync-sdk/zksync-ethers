import { getAddress } from "ethers";
import { ApprovalBasedPaymasterInput, Eip712Meta, GeneralPaymasterInput } from "./types";
import { DEFAULT_GAS_PER_PUBDATA_LIMIT, getPaymasterParams, encodeData } from "./utils";

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
        this.paymasterInput = type == "ApprovalBased" ? {
            type,
            token: getAddress(tokenAddress),
            minimalAllowance,
            innerInput: encodedInnerInput
        } : {
            type,
            innerInput: encodedInnerInput
        };
    }

    getCustomData() {
        return {
            gasPerPubdata: DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: getPaymasterParams(this.address, this.paymasterInput),
        } as Eip712Meta;
    }
}
