import { BaseContract, BytesLike, ContractDeployTransaction, ContractMethodArgs, ContractRunner, ContractTransactionResponse, ethers, Interface, InterfaceAbi } from 'ethers';
import { DeploymentType } from './types';
export { Contract } from 'ethers';
/**
 * A `ContractFactory` is used to deploy a `Contract` to the blockchain.
 */
export declare class ContractFactory<A extends Array<any> = Array<any>, I = BaseContract> extends ethers.ContractFactory<A, I> {
    /** The deployment type that is currently in use. */
    readonly deploymentType: DeploymentType;
    /**
     * Create a new `ContractFactory` with `abi` and `bytecode`, optionally connected to `runner`.
     * The `bytecode` may be the bytecode property within the standard Solidity JSON output.
     *
     * @param abi The ABI (Application Binary Interface) of the contract.
     * @param bytecode The bytecode of the contract.
     * @param [runner] The runner capable of interacting with a `Contract`on the network.
     * @param [deploymentType] The deployment type, defaults to 'create'.
     */
    constructor(abi: Interface | InterfaceAbi, bytecode: ethers.BytesLike, runner?: ContractRunner, deploymentType?: DeploymentType);
    protected encodeCalldata(salt: BytesLike, bytecodeHash: BytesLike, constructorCalldata: BytesLike): string;
    /**
     * Checks if the provided overrides are appropriately configured for a specific deployment type.
     * @param overrides The overrides to be checked.
     *
     * @throws {Error} If:
     *   - `overrides.customData.salt` is not provided for `Create2` deployment type.
     *   - Provided `overrides.customData.salt` is not 32 bytes in hex format.
     *   - `overrides.customData.factoryDeps` is not array of bytecodes.
     */
    protected checkOverrides(overrides: ethers.Overrides): void;
    getDeployTransaction(...args: ContractMethodArgs<A>): Promise<ContractDeployTransaction>;
    /**
     * Deploys a new contract or account instance on the L2 blockchain.
     * There is no need to wait for deployment with `waitForDeployment` method
     * because **deploy** already waits for deployment to finish.
     *
     * @param args - Constructor arguments for the contract followed by optional
     * {@link ethers.Overrides|overrides}. When deploying with Create2 method slat must be present in overrides.
     *
     * @example Deploy with constructor arguments only using `create` method
     *
     * const deployedContract = await contractFactory.deploy(arg1, arg2, ...);
     *
     * @example Deploy with constructor arguments, and factory dependencies using `create method
     *
     * const deployedContractWithSaltAndDeps = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     factoryDeps: ['0x...']
     *   }
     * });
     *
     * @example Deploy with constructor arguments and custom salt using `create2` method
     *
     * const deployedContractWithSalt = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     salt: '0x...'
     *   }
     * });
     *
     * @example Deploy with constructor arguments, custom salt, and factory dependencies using `create2` method
     *
     * const deployedContractWithSaltAndDeps = await contractFactory.deploy(arg1, arg2, ..., {
     *   customData: {
     *     salt: '0x...',
     *     factoryDeps: ['0x...']
     *   }
     * });
     */
    deploy(...args: ContractMethodArgs<A>): Promise<BaseContract & {
        deploymentTransaction(): ContractTransactionResponse;
    } & Omit<I, keyof BaseContract>>;
}
