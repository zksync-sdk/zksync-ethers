import {
  BaseContract,
  BytesLike,
  ContractDeployTransaction,
  ContractMethodArgs,
  ContractRunner,
  ContractTransactionResponse,
  ethers,
  Interface,
  InterfaceAbi,
} from 'ethers';
import {
  CONTRACT_DEPLOYER,
  CONTRACT_DEPLOYER_ADDRESS,
  DEFAULT_GAS_PER_PUBDATA_LIMIT,
  EIP712_TX_TYPE,
  getDeployedContracts,
  hashBytecode,
} from './utils';
import {
  AccountAbstractionVersion,
  DeploymentType,
  TransactionReceipt,
} from './types';

/* c8 ignore next */
export {Contract} from 'ethers';

/**
 * A `ContractFactory` is used to deploy a `Contract` to the blockchain.
 */
export class ContractFactory<
  A extends Array<any> = Array<any>,
  I = BaseContract,
> extends ethers.ContractFactory<A, I> {
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
  constructor(
    abi: Interface | InterfaceAbi,
    bytecode: ethers.BytesLike,
    runner?: ContractRunner,
    deploymentType?: DeploymentType
  ) {
    super(abi, bytecode, runner);
    this.deploymentType = deploymentType || 'create';
  }

  protected encodeCalldata(
    salt: BytesLike,
    bytecodeHash: BytesLike,
    constructorCalldata: BytesLike
  ): string {
    const contractDeploymentArgs = [salt, bytecodeHash, constructorCalldata];
    const accountDeploymentArgs = [
      ...contractDeploymentArgs,
      AccountAbstractionVersion.Version1,
    ];
    if (this.deploymentType === 'create') {
      return CONTRACT_DEPLOYER.encodeFunctionData('create', [
        ...contractDeploymentArgs,
      ]);
    } else if (this.deploymentType === 'createAccount') {
      return CONTRACT_DEPLOYER.encodeFunctionData('createAccount', [
        ...accountDeploymentArgs,
      ]);
    } else if (this.deploymentType === 'create2') {
      return CONTRACT_DEPLOYER.encodeFunctionData('create2', [
        ...contractDeploymentArgs,
      ]);
    } else if (this.deploymentType === 'create2Account') {
      return CONTRACT_DEPLOYER.encodeFunctionData('create2Account', [
        ...accountDeploymentArgs,
      ]);
    } else {
      throw new Error(`Unsupported deployment type: ${this.deploymentType}!`);
    }
  }

  /**
   * Checks if the provided overrides are appropriately configured for a specific deployment type.
   * @param overrides The overrides to be checked.
   *
   * @throws {Error} If:
   *   - `overrides.customData.salt` is not provided for `Create2` deployment type.
   *   - Provided `overrides.customData.salt` is not 32 bytes in hex format.
   *   - `overrides.customData.factoryDeps` is not array of bytecodes.
   */
  protected checkOverrides(overrides: ethers.Overrides) {
    if (
      this.deploymentType === 'create2' ||
      this.deploymentType === 'create2Account'
    ) {
      if (!overrides.customData || !overrides.customData.salt) {
        throw new Error('Salt is required for CREATE2 deployment!');
      }

      if (
        !overrides.customData.salt.startsWith('0x') ||
        overrides.customData.salt.length !== 66
      ) {
        throw new Error('Invalid salt provided!');
      }
    }

    if (
      overrides.customData &&
      overrides.customData.factoryDeps !== null &&
      overrides.customData.factoryDeps !== undefined &&
      !Array.isArray(overrides.customData.factoryDeps)
    ) {
      throw new Error(
        "Invalid 'factoryDeps' format! It should be an array of bytecodes."
      );
    }
  }

  override async getDeployTransaction(
    ...args: ContractMethodArgs<A>
  ): Promise<ContractDeployTransaction> {
    let constructorArgs: any[];
    let overrides: ethers.Overrides = {
      customData: {factoryDeps: [], salt: ethers.ZeroHash},
    };

    // The overrides will be popped out in this call:
    const txRequest = await super.getDeployTransaction(...args);
    if (this.interface.deploy.inputs.length + 1 === args.length) {
      constructorArgs = args.slice(0, args.length - 1);
      overrides = args[args.length - 1] as ethers.Overrides;
      overrides.customData ??= {};
      overrides.customData.salt ??= ethers.ZeroHash;
      this.checkOverrides(overrides);
      overrides.customData.factoryDeps = (
        overrides.customData.factoryDeps ?? []
      ).map(normalizeBytecode);
    } else {
      constructorArgs = args;
    }

    const bytecodeHash = hashBytecode(this.bytecode);
    const constructorCalldata = ethers.getBytes(
      this.interface.encodeDeploy(constructorArgs)
    );
    const deployCalldata = this.encodeCalldata(
      overrides.customData.salt,
      bytecodeHash,
      constructorCalldata
    );

    // salt is no longer used and should not be present in customData of EIP712 transaction
    if (txRequest.customData && txRequest.customData.salt)
      delete txRequest.customData.salt;
    const tx = {
      ...txRequest,
      to: CONTRACT_DEPLOYER_ADDRESS,
      data: deployCalldata,
      type: EIP712_TX_TYPE,
    };

    tx.customData ??= {};
    tx.customData.factoryDeps ??= overrides.customData.factoryDeps;
    tx.customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;

    // The number of factory deps is relatively low, so it is efficient enough.
    if (!tx.customData || !tx.customData.factoryDeps.includes(this.bytecode)) {
      tx.customData.factoryDeps.push(this.bytecode);
    }

    return tx;
  }

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
  override async deploy(...args: ContractMethodArgs<A>): Promise<
    BaseContract & {
      deploymentTransaction(): ContractTransactionResponse;
    } & Omit<I, keyof BaseContract>
  > {
    const contract = await (await super.deploy(...args)).waitForDeployment();

    const deployTxReceipt = (await this.runner?.provider?.getTransactionReceipt(
      contract.deploymentTransaction()!.hash
    )) as TransactionReceipt;

    const deployedAddresses = getDeployedContracts(deployTxReceipt!).map(
      info => info.deployedAddress
    );

    const contractWithCorrectAddress = new ethers.Contract(
      deployedAddresses[deployedAddresses.length - 1],
      contract.interface.fragments,
      contract.runner
    ) as BaseContract & {
      deploymentTransaction(): ContractTransactionResponse;
    } & Omit<I, keyof BaseContract>;

    const deploymentTx = contract.deploymentTransaction()!;

    (deploymentTx as any).blockNumber = deployTxReceipt.blockNumber;
    (deploymentTx as any).blockHash = deployTxReceipt.blockHash;
    (deploymentTx as any).index = deployTxReceipt.index;
    (deploymentTx as any).gasPrice = deployTxReceipt.gasPrice;

    contractWithCorrectAddress.deploymentTransaction = () => deploymentTx;
    return contractWithCorrectAddress;
  }
}

function normalizeBytecode(bytecode: BytesLike | {object: string}) {
  // Dereference Solidity bytecode objects and allow a missing `0x`-prefix
  if (bytecode instanceof Uint8Array) {
    bytecode = ethers.hexlify(ethers.getBytes(bytecode));
  } else {
    if (typeof bytecode === 'object') {
      bytecode = bytecode.object;
    }
    if (!bytecode.startsWith('0x')) {
      bytecode = '0x' + bytecode;
    }
    bytecode = ethers.hexlify(ethers.getBytes(bytecode));
  }

  return bytecode;
}
