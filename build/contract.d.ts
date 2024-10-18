import { Wallet } from './wallet';
import { Signer } from './signer';
import { Contract, ContractInterface, ethers } from 'ethers';
import { DeploymentType } from './types';
import { SmartAccount } from './smart-account';
export { Contract } from 'ethers';
/**
 * A `ContractFactory` is used to deploy a `Contract` to the blockchain.
 */
export declare class ContractFactory extends ethers.ContractFactory {
    readonly signer: Wallet | Signer;
    readonly deploymentType: DeploymentType;
    /**
     * Create a new `ContractFactory` with `abi` and `bytecode`, connected to `signer`.
     * The `bytecode` may be the bytecode property within the standard Solidity JSON output.
     *
     * @param abi The ABI (Application Binary Interface) of the contract.
     * @param bytecode The bytecode of the contract.
     * @param [signer] The signer capable of interacting with a `Contract`on the network.
     * @param [deploymentType] The deployment type, defaults to 'create'.
     */
    constructor(abi: ContractInterface, bytecode: ethers.BytesLike, signer: Wallet | Signer | SmartAccount, deploymentType?: DeploymentType);
    private encodeCalldata;
    /**
     * Checks if the provided overrides are appropriately configured for a specific deployment type.
     * @param overrides The overrides to be checked.
     *
     * @throws {Error} If:
     *   - `overrides.customData.salt` is not provided for `Create2` deployment type.
     *   - Provided `overrides.customData.salt` is not 32 bytes in hex format.
     *   - `overrides.customData.factoryDeps` is not array of bytecodes.
     */
    protected checkOverrides(overrides: ethers.PayableOverrides): void;
    getDeployTransaction(...args: any[]): ethers.providers.TransactionRequest;
    /**
     * Deploys a new contract or account instance on the Ethereum blockchain.
     *
     * @param {...Array<any>} args - Constructor arguments for the contract followed by optional
     * {@link ethers.PayableOverrides|overrides}. When deploying with CREATE2 method slat must be present in overrides.
     *
     *
     * @example Deploy with constructor arguments only using CREATE method
     * const deployedContract = await contractFactory.deploy(arg1, arg2, ...);
     *
     * @example Deploy with constructor arguments, and factory dependencies using CREATE method
     * const deployedContractWithSaltAndDeps = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     factoryDeps: ['0x...']
     *   }
     * });
     *
     * @example Deploy with constructor arguments and custom salt using CREATE2 method
     * const deployedContractWithSalt = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     salt: '0x...'
     *   }
     * });
     *
     * @example Deploy with constructor arguments, custom salt, and factory dependencies using CREATE2 method
     * const deployedContractWithSaltAndDeps = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     salt: '0x...',
     *     factoryDeps: ['0x...']
     *   }
     * });
     */
    deploy(...args: Array<any>): Promise<Contract>;
}
