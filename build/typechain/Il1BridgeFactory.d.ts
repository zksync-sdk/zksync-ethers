import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Il1Bridge } from "./Il1Bridge";
export declare class Il1BridgeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): Il1Bridge;
}
