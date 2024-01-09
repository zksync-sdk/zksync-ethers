import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IStateTransitionChain } from "./IStateTransitionChain";
export declare class IStateTransitionChainFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IStateTransitionChain;
}
