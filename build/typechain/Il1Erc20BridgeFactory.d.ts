import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Il1Erc20Bridge } from "./Il1Erc20Bridge";
export declare class Il1Erc20BridgeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): Il1Erc20Bridge;
}
