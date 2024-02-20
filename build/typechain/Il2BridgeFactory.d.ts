import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Il2Bridge } from "./Il2Bridge";
export declare class Il2BridgeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): Il2Bridge;
}
