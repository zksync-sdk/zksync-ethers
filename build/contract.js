"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFactory = exports.Contract = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const types_1 = require("./types");
const bytes_1 = require("@ethersproject/bytes");
var ethers_2 = require("ethers");
Object.defineProperty(exports, "Contract", { enumerable: true, get: function () { return ethers_2.Contract; } });
/**
 * A `ContractFactory` is used to deploy a `Contract` to the blockchain.
 */
class ContractFactory extends ethers_1.ethers.ContractFactory {
    /**
     * Create a new `ContractFactory` with `abi` and `bytecode`, connected to `signer`.
     * The `bytecode` may be the bytecode property within the standard Solidity JSON output.
     *
     * @param abi The ABI (Application Binary Interface) of the contract.
     * @param bytecode The bytecode of the contract.
     * @param [signer] The signer capable of interacting with a `Contract`on the network.
     * @param [deploymentType] The deployment type, defaults to 'create'.
     */
    constructor(abi, bytecode, signer, deploymentType) {
        super(abi, bytecode, signer);
        this.deploymentType = deploymentType || 'create';
    }
    encodeCalldata(salt, bytecodeHash, constructorCalldata) {
        const contractDeploymentArgs = [salt, bytecodeHash, constructorCalldata];
        const accountDeploymentArgs = [
            ...contractDeploymentArgs,
            types_1.AccountAbstractionVersion.Version1,
        ];
        if (this.deploymentType === 'create') {
            return utils_1.CONTRACT_DEPLOYER.encodeFunctionData('create', [
                ...contractDeploymentArgs,
            ]);
        }
        else if (this.deploymentType === 'createAccount') {
            return utils_1.CONTRACT_DEPLOYER.encodeFunctionData('createAccount', [
                ...accountDeploymentArgs,
            ]);
        }
        else if (this.deploymentType === 'create2') {
            return utils_1.CONTRACT_DEPLOYER.encodeFunctionData('create2', [
                ...contractDeploymentArgs,
            ]);
        }
        else if (this.deploymentType === 'create2Account') {
            return utils_1.CONTRACT_DEPLOYER.encodeFunctionData('create2Account', [
                ...accountDeploymentArgs,
            ]);
        }
        else {
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
    checkOverrides(overrides) {
        if (this.deploymentType === 'create2' ||
            this.deploymentType === 'create2Account') {
            if (!overrides.customData || !overrides.customData.salt) {
                throw new Error('Salt is required for CREATE2 deployment!');
            }
            if (!overrides.customData.salt.startsWith('0x') ||
                overrides.customData.salt.length !== 66) {
                throw new Error('Invalid salt provided!');
            }
        }
        if (overrides.customData &&
            overrides.customData.factoryDeps !== null &&
            overrides.customData.factoryDeps !== undefined &&
            !Array.isArray(overrides.customData.factoryDeps)) {
            throw new Error("Invalid 'factoryDeps' format! It should be an array of bytecodes.");
        }
    }
    getDeployTransaction(...args) {
        var _a, _b, _c, _d, _e, _f;
        var _g, _h, _j;
        let constructorArgs;
        let overrides = {
            customData: { factoryDeps: [], salt: utils_1.ZERO_HASH },
        };
        // The overrides will be popped out in this call:
        const txRequest = super.getDeployTransaction(...args);
        if (this.interface.deploy.inputs.length + 1 === args.length) {
            constructorArgs = args.slice(0, args.length - 1);
            overrides = args[args.length - 1];
            (_a = overrides.customData) !== null && _a !== void 0 ? _a : (overrides.customData = {});
            (_b = (_g = overrides.customData).salt) !== null && _b !== void 0 ? _b : (_g.salt = utils_1.ZERO_HASH);
            this.checkOverrides(overrides);
            overrides.customData.factoryDeps = ((_c = overrides.customData.factoryDeps) !== null && _c !== void 0 ? _c : []).map(normalizeBytecode);
        }
        else {
            constructorArgs = args;
        }
        const bytecodeHash = (0, utils_1.hashBytecode)(this.bytecode);
        const constructorCalldata = ethers_1.utils.arrayify(this.interface.encodeDeploy(constructorArgs));
        const deployCalldata = this.encodeCalldata(overrides.customData.salt, bytecodeHash, constructorCalldata);
        // salt is no longer used and should not be present in customData of EIP712 transaction
        if (txRequest.customData && txRequest.customData.salt)
            delete txRequest.customData.salt;
        const tx = {
            ...txRequest,
            to: utils_1.CONTRACT_DEPLOYER_ADDRESS,
            data: deployCalldata,
            type: utils_1.EIP712_TX_TYPE,
        };
        (_d = tx.customData) !== null && _d !== void 0 ? _d : (tx.customData = {});
        (_e = (_h = tx.customData).factoryDeps) !== null && _e !== void 0 ? _e : (_h.factoryDeps = overrides.customData.factoryDeps);
        (_f = (_j = tx.customData).gasPerPubdata) !== null && _f !== void 0 ? _f : (_j.gasPerPubdata = utils_1.DEFAULT_GAS_PER_PUBDATA_LIMIT);
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
    async deploy(...args) {
        const contract = await super.deploy(...args);
        const deployTxReceipt = await contract.deployTransaction.wait();
        const deployedAddresses = (0, utils_1.getDeployedContracts)(deployTxReceipt).map(info => info.deployedAddress);
        const contractWithCorrectAddress = new ethers_1.ethers.Contract(deployedAddresses[deployedAddresses.length - 1], contract.interface, contract.signer);
        ethers_1.utils.defineReadOnly(contractWithCorrectAddress, 'deployTransaction', contract.deployTransaction);
        return contractWithCorrectAddress;
    }
}
exports.ContractFactory = ContractFactory;
function normalizeBytecode(bytecode) {
    let bytecodeHex;
    if (typeof bytecode === 'string') {
        bytecodeHex = bytecode;
    }
    else if ((0, bytes_1.isBytes)(bytecode)) {
        bytecodeHex = (0, bytes_1.hexlify)(bytecode);
    }
    else if (bytecode) {
        // Allow the bytecode object from the Solidity compiler
        bytecodeHex = bytecode.object;
    }
    else {
        // Crash in the next verification step
        bytecodeHex = '!';
    }
    // Make sure it is 0x prefixed
    if (bytecodeHex.substring(0, 2) !== '0x') {
        bytecodeHex = '0x' + bytecodeHex;
    }
    // Make sure the final result is valid bytecode
    if (!(0, bytes_1.isHexString)(bytecodeHex) || bytecodeHex.length % 2) {
        throw new Error('Invalid bytecode!');
    }
    return bytecodeHex;
}
//# sourceMappingURL=contract.js.map