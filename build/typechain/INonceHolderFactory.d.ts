import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { INonceHolder } from "./INonceHolder";
export declare class INonceHolderFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): INonceHolder;
}
