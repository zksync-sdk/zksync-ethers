import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IBridgehub } from "./IBridgehub";
export declare class IBridgehubFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IBridgehub;
}
