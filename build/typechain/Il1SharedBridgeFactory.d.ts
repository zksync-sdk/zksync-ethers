import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Il1SharedBridge } from "./Il1SharedBridge";
export declare class Il1SharedBridgeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): Il1SharedBridge;
}
