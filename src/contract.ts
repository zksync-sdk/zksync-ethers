import {
    BytesLike,
    InterfaceAbi,
    Interface,
    ethers,
    ContractRunner,
    BaseContract,
    ContractTransactionResponse,
    ContractDeployTransaction,
    ContractMethodArgs,
} from "ethers";
import {
    hashBytecode,
    CONTRACT_DEPLOYER,
    CONTRACT_DEPLOYER_ADDRESS,
    EIP712_TX_TYPE,
    getDeployedContracts,
    DEFAULT_GAS_PER_PUBDATA_LIMIT,
} from "./utils";
import { AccountAbstractionVersion, DeploymentType } from "./types";
export { Contract } from "ethers";

export class ContractFactory<
    A extends Array<any> = Array<any>,
    I = BaseContract,
> extends ethers.ContractFactory<A, I> {
    readonly deploymentType: DeploymentType;

    constructor(
        abi: Interface | InterfaceAbi,
        bytecode: ethers.BytesLike,
        runner?: ContractRunner,
        deploymentType?: DeploymentType,
    ) {
        super(abi, bytecode, runner);
        this.deploymentType = deploymentType || "create";
    }

    private encodeCalldata(
        salt: BytesLike,
        bytecodeHash: BytesLike,
        constructorCalldata: BytesLike,
    ): string {
        const contractDeploymentArgs = [salt, bytecodeHash, constructorCalldata];
        const accountDeploymentArgs = [...contractDeploymentArgs, AccountAbstractionVersion.Version1];
        if (this.deploymentType === "create") {
            return CONTRACT_DEPLOYER.encodeFunctionData("create", [...contractDeploymentArgs]);
        } else if (this.deploymentType === "createAccount") {
            return CONTRACT_DEPLOYER.encodeFunctionData("createAccount", [...accountDeploymentArgs]);
        } else if (this.deploymentType === "create2") {
            return CONTRACT_DEPLOYER.encodeFunctionData("create2", [...contractDeploymentArgs]);
        } else if (this.deploymentType === "create2Account") {
            return CONTRACT_DEPLOYER.encodeFunctionData("create2Account", [...accountDeploymentArgs]);
        } else {
            throw new Error(`Unsupported deployment type ${this.deploymentType}`);
        }
    }

    protected checkOverrides(overrides: ethers.Overrides) {
        if (this.deploymentType === "create2" || this.deploymentType === "create2Account") {
            if (!overrides.customData || !overrides.customData.salt) {
                throw new Error("Salt is required for CREATE2 deployment.");
            }

            if (!overrides.customData.salt.startsWith("0x") || overrides.customData.salt.length !== 66) {
                throw new Error("Invalid salt provided.");
            }
        }

        if (
            overrides.customData &&
            overrides.customData.factoryDeps &&
            !Array.isArray(overrides.customData.factoryDeps)
        ) {
            throw new Error("Invalid 'factoryDeps' format. It should be an array of bytecodes.");
        }
    }

    override async getDeployTransaction(
        ...args: ContractMethodArgs<A>
    ): Promise<ContractDeployTransaction> {
        let constructorArgs: any[];
        let overrides: ethers.Overrides = {
            customData: { factoryDeps: [], salt: ethers.ZeroHash },
        };

        // The overrides will be popped out in this call:
        const txRequest = await super.getDeployTransaction(...args);
        if (this.interface.deploy.inputs.length + 1 == args.length) {
            constructorArgs = args.slice(0, args.length - 1);
            overrides = args[args.length - 1] as ethers.Overrides;
            overrides.customData ??= {};
            overrides.customData.salt ??= ethers.ZeroHash;
            this.checkOverrides(overrides);
            overrides.customData.factoryDeps = (overrides.customData.factoryDeps ?? []).map(
                normalizeBytecode,
            );
        } else {
            constructorArgs = args;
        }

        const bytecodeHash = hashBytecode(this.bytecode);
        const constructorCalldata = ethers.getBytes(this.interface.encodeDeploy(constructorArgs));
        const deployCalldata = this.encodeCalldata(
            overrides.customData.salt,
            bytecodeHash,
            constructorCalldata,
        );

        // salt is no longer used and should not be present in customData of EIP712 transaction
        if (txRequest.customData && txRequest.customData.salt) delete txRequest.customData.salt;
        const tx = {
            ...txRequest,
            to: CONTRACT_DEPLOYER_ADDRESS,
            data: deployCalldata,
            type: EIP712_TX_TYPE,
        };

        tx.customData ??= {};
        tx.customData.factoryDeps ??= overrides.customData.factoryDeps || [];
        tx.customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;

        // The number of factory deps is relatively low, so it is efficient enough.
        if (!tx.customData || !tx.customData.factoryDeps.includes(this.bytecode)) {
            tx.customData.factoryDeps.push(this.bytecode);
        }

        return tx;
    }

    /**
     * Deploys a new contract or account instance on the Ethereum blockchain.
     * There is no need to wait for deployment with {@link BaseContract#waitForDeployment|BaseContract.waitForDeployment}
     * because **deploy** already waits for deployment to finish.
     *
     * @async
     * @param {...ContractMethodArgs} args - Constructor arguments for the contract followed by optional
     * {@link ethers.Overrides|overrides}. When deploying with CREATE2 opcode slat must be present in overrides.
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
    override async deploy(
        ...args: ContractMethodArgs<A>
    ): Promise<
        BaseContract & { deploymentTransaction(): ContractTransactionResponse } & Omit<
                I,
                keyof BaseContract
            >
    > {
        const contract = await super.deploy(...args);
        const deployTxReceipt = await this.runner?.provider?.getTransactionReceipt(
            // @ts-ignore
            contract.deploymentTransaction().hash,
        );

        // @ts-ignore
        const deployedAddresses = getDeployedContracts(deployTxReceipt).map(
            (info) => info.deployedAddress,
        );

        const contractWithCorrectAddress = new ethers.Contract(
            deployedAddresses[deployedAddresses.length - 1],
            contract.interface.fragments,
            contract.runner,
        ) as BaseContract & { deploymentTransaction(): ContractTransactionResponse } & Omit<
                I,
                keyof BaseContract
            >;

        // @ts-ignore
        contractWithCorrectAddress.deploymentTransaction = () => contract.deploymentTransaction();
        return contractWithCorrectAddress;
    }
}

function normalizeBytecode(bytecode: BytesLike | { object: string }) {
    // Dereference Solidity bytecode objects and allow a missing `0x`-prefix
    if (bytecode instanceof Uint8Array) {
        bytecode = ethers.hexlify(ethers.getBytes(bytecode));
    } else {
        if (typeof bytecode === "object") {
            bytecode = bytecode.object;
        }
        if (!bytecode.startsWith("0x")) {
            bytecode = "0x" + bytecode;
        }
        bytecode = ethers.hexlify(ethers.getBytes(bytecode));
    }

    return bytecode;
}
