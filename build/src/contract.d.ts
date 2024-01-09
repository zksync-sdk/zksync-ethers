import { Wallet } from "./wallet";
import { Signer } from "./signer";
import { Contract, ContractInterface, ethers } from "ethers";
import { DeploymentType } from "./types";
export { Contract } from "ethers";
export declare class ContractFactory extends ethers.ContractFactory {
    readonly signer: Wallet | Signer;
    readonly deploymentType: DeploymentType;
    constructor(abi: ContractInterface, bytecode: ethers.BytesLike, signer: Wallet | Signer, deploymentType?: DeploymentType);
    private encodeCalldata;
    protected checkOverrides(overrides: ethers.PayableOverrides): void;
    getDeployTransaction(...args: any[]): ethers.providers.TransactionRequest;
    /**
     * Deploys a new contract or account instance on the Ethereum blockchain.
     *
     * @async
     * @param {...Array<any>} args - Constructor arguments for the contract followed by optional
     * {@link ethers.PayableOverrides|overrides}. When deploying with CREATE2 opcode slat must be present in overrides.
     *
     *
     * @example
     * // Deploy with constructor arguments only using CREATE opcode
     * const deployedContract = await contractFactory.deploy(arg1, arg2, ...);
     *
     * // Deploy with constructor arguments, and factory dependencies using CREATE opcode
     * const deployedContractWithSaltAndDeps = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     factoryDeps: ['0x...']
     *   }
     * });
     *
     * // Deploy with constructor arguments and custom salt using CREATE2 opcode
     * const deployedContractWithSalt = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     salt: '0x...'
     *   }
     * });
     *
     * // Deploy with constructor arguments, custom salt, and factory dependencies using CREATE2 opcode
     * const deployedContractWithSaltAndDeps = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     salt: '0x...',
     *     factoryDeps: ['0x...']
     *   }
     * });
     */
    deploy(...args: Array<any>): Promise<Contract>;
}
