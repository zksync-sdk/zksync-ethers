import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IZkSyncStateTransition } from "./IZkSyncStateTransition";
export declare class IZkSyncStateTransitionFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IZkSyncStateTransition;
}
