import {Wallet} from './wallet';
import {Signer} from './signer';
import {BytesLike, Contract, ContractInterface, ethers, utils} from 'ethers';
import {
  hashBytecode,
  CONTRACT_DEPLOYER,
  CONTRACT_DEPLOYER_ADDRESS,
  EIP712_TX_TYPE,
  getDeployedContracts,
  DEFAULT_GAS_PER_PUBDATA_LIMIT,
  ZERO_HASH,
} from './utils';
import {AccountAbstractionVersion, DeploymentType} from './types';
import {hexlify, isBytes, isHexString} from '@ethersproject/bytes';
import {SmartAccount} from './smart-account';
export {Contract} from 'ethers';

/**
 * A `ContractFactory` is used to deploy a `Contract` to the blockchain.
 */
export class ContractFactory extends ethers.ContractFactory {
  override readonly signer!: Wallet | Signer;
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
  constructor(
    abi: ContractInterface,
    bytecode: ethers.BytesLike,
    signer: Wallet | Signer | SmartAccount,
    deploymentType?: DeploymentType
  ) {
    super(abi, bytecode, signer);
    this.deploymentType = deploymentType || 'create';
  }

  private encodeCalldata(
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
      throw new Error(`Unsupported deployment type ${this.deploymentType}!`);
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
  protected checkOverrides(overrides: ethers.PayableOverrides) {
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

  override getDeployTransaction(
    ...args: any[]
  ): ethers.providers.TransactionRequest {
    let constructorArgs: any[];
    let overrides: ethers.Overrides = {
      customData: {factoryDeps: [], salt: ZERO_HASH},
    };

    // The overrides will be popped out in this call:
    const txRequest = super.getDeployTransaction(...args);
    if (this.interface.deploy.inputs.length + 1 === args.length) {
      constructorArgs = args.slice(0, args.length - 1);
      overrides = args[args.length - 1] as ethers.PayableOverrides;
      overrides.customData ??= {};
      overrides.customData.salt ??= ZERO_HASH;
      this.checkOverrides(overrides);
      overrides.customData.factoryDeps = (
        overrides.customData.factoryDeps ?? []
      ).map(normalizeBytecode);
    } else {
      constructorArgs = args;
    }

    const bytecodeHash = hashBytecode(this.bytecode);
    const constructorCalldata = utils.arrayify(
      this.interface.encodeDeploy(constructorArgs)
    );
    const deployCalldata = this.encodeCalldata(
      overrides.customData!.salt,
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
    tx.customData.factoryDeps ??= overrides.customData!.factoryDeps;
    tx.customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;

    // The number of factory deps is relatively low, so it is efficient enough.
    if (!tx.customData || !tx.customData.factoryDeps.includes(this.bytecode)) {
      tx.customData.factoryDeps.push(this.bytecode);
    }

    return tx;
  }

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
  override async deploy(...args: Array<any>): Promise<Contract> {
    const contract = await super.deploy(...args);

    const deployTxReceipt = await contract.deployTransaction.wait();

    const deployedAddresses = getDeployedContracts(deployTxReceipt).map(
      info => info.deployedAddress
    );

    const contractWithCorrectAddress = new ethers.Contract(
      deployedAddresses[deployedAddresses.length - 1],
      contract.interface,
      contract.signer
    );
    utils.defineReadOnly(
      contractWithCorrectAddress,
      'deployTransaction',
      contract.deployTransaction
    );
    return contractWithCorrectAddress;
  }
}

function normalizeBytecode(bytecode: BytesLike | {object: string}) {
  let bytecodeHex: string;

  if (typeof bytecode === 'string') {
    bytecodeHex = bytecode;
  } else if (isBytes(bytecode)) {
    bytecodeHex = hexlify(bytecode);
  } else if (bytecode) {
    // Allow the bytecode object from the Solidity compiler
    bytecodeHex = (<any>bytecode).object;
  } else {
    // Crash in the next verification step
    bytecodeHex = '!';
  }

  // Make sure it is 0x prefixed
  if (bytecodeHex.substring(0, 2) !== '0x') {
    bytecodeHex = '0x' + bytecodeHex;
  }

  // Make sure the final result is valid bytecode
  if (!isHexString(bytecodeHex) || bytecodeHex.length % 2) {
    throw new Error('Invalid bytecode!');
  }
  return bytecodeHex;
}
