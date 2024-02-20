"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterL2 = exports.AdapterL1 = void 0;
const ethers_1 = require("ethers");
const Ierc20Factory_1 = require("../typechain/Ierc20Factory");
const Il1BridgeFactory_1 = require("../typechain/Il1BridgeFactory");
const Il2BridgeFactory_1 = require("../typechain/Il2BridgeFactory");
const Il1Erc20BridgeFactory_1 = require("../typechain/Il1Erc20BridgeFactory");
const IBridgehubFactory_1 = require("../typechain/IBridgehubFactory");
const Il1SharedBridgeFactory_1 = require("../typechain/Il1SharedBridgeFactory");
const INonceHolderFactory_1 = require("../typechain/INonceHolderFactory");
const IZkSyncStateTransitionFactory_1 = require("../typechain/IZkSyncStateTransitionFactory");
const utils_1 = require("./utils");
function AdapterL1(Base) {
    return class Adapter extends Base {
        _providerL2() {
            throw new Error("Must be implemented by the derived class!");
        }
        _providerL1() {
            throw new Error("Must be implemented by the derived class!");
        }
        _signerL1() {
            throw new Error("Must be implemented by the derived class!");
        }
        async getMainContract() {
            const address = await this._providerL2().getMainContractAddress();
            return IZkSyncStateTransitionFactory_1.IZkSyncStateTransitionFactory.connect(address, this._signerL1());
        }
        async getBridgehubContract() {
            const address = await this._providerL2().getBridgehubContractAddress();
            return IBridgehubFactory_1.IBridgehubFactory.connect(address, this._signerL1());
        }
        async getL1BridgeContracts() {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                erc20: Il1BridgeFactory_1.Il1BridgeFactory.connect(addresses.erc20L1, this._signerL1()),
                shared: Il1SharedBridgeFactory_1.Il1SharedBridgeFactory.connect(addresses.sharedL1, this._signerL1()),
            };
        }
        async getBaseToken() {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            return await bridgehub.baseToken(chainId);
        }
        async isETHBasedChain() {
            return (await this.getBaseToken()) == utils_1.ETH_ADDRESS_IN_CONTRACTS;
        }
        async getBalanceL1(token, blockTag) {
            token !== null && token !== void 0 ? token : (token = utils_1.ETH_ADDRESS);
            if ((0, utils_1.isETH)(token)) {
                return await this._providerL1().getBalance(await this.getAddress(), blockTag);
            }
            else {
                const erc20contract = Ierc20Factory_1.Ierc20Factory.connect(token, this._providerL1());
                return await erc20contract.balanceOf(await this.getAddress());
            }
        }
        async getAllowanceL1(token, bridgeAddress, blockTag) {
            if (!bridgeAddress) {
                const bridgeContracts = await this.getL1BridgeContracts();
                // If the token is Wrapped Ether, return allowance to its own bridge, otherwise to the default ERC20 bridge.
                bridgeAddress = bridgeContracts.shared.address;
            }
            const erc20contract = Ierc20Factory_1.Ierc20Factory.connect(token, this._providerL1());
            return await erc20contract.allowance(await this.getAddress(), bridgeAddress, {
                blockTag,
            });
        }
        async l2TokenAddress(token) {
            if (token == utils_1.ETH_ADDRESS) {
                return utils_1.ETH_ADDRESS;
            }
            const bridge = Il1Erc20BridgeFactory_1.Il1Erc20BridgeFactory.connect((await this._providerL2().getDefaultBridgeAddresses()).erc20L1, // TODO CHANGE THIS TO SHARED WHEN IT'S FIEXED
            this._signerL1());
            return await bridge.l2TokenAddress(token);
        }
        async approveERC20(token, amount, overrides) {
            if ((0, utils_1.isETH)(token)) {
                throw new Error("ETH token can't be approved. The address of the token does not exist on L1.");
            }
            let bridgeAddress = overrides === null || overrides === void 0 ? void 0 : overrides.bridgeAddress;
            const erc20contract = Ierc20Factory_1.Ierc20Factory.connect(token, this._signerL1());
            const baseToken = await this.getBaseToken();
            const isETHBasedChain = await this.isETHBasedChain();
            if (bridgeAddress == null) {
                if (!isETHBasedChain && token == baseToken) {
                    const chainId = (await this._providerL2().getNetwork()).chainId;
                    bridgeAddress = await (await this.getBridgehubContract()).sharedBridge();
                }
                else {
                    const bridgeContracts = await this.getL1BridgeContracts();
                    bridgeAddress = bridgeContracts.shared.address;
                }
            }
            else {
                delete overrides.bridgeAddress;
            }
            overrides !== null && overrides !== void 0 ? overrides : (overrides = {});
            return await erc20contract.approve(bridgeAddress, amount, overrides);
        }
        async getBaseCost(params) {
            var _a, _b;
            const bridgehub = await this.getBridgehubContract();
            const parameters = { ...(0, utils_1.layer1TxDefaults)(), ...params };
            (_a = parameters.gasPrice) !== null && _a !== void 0 ? _a : (parameters.gasPrice = await this._providerL1().getGasPrice());
            (_b = parameters.gasPerPubdataByte) !== null && _b !== void 0 ? _b : (parameters.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            return ethers_1.BigNumber.from(await bridgehub.l2TransactionBaseCost((await this._providerL2().getNetwork()).chainId, parameters.gasPrice, parameters.gasLimit, parameters.gasPerPubdataByte));
        }
        // Returns the parameters for the approval token transaction based on the deposit token and amount.
        // Some deposit transactions require multiple approvals. Existing allowance for the bridge is not checked;
        // allowance is calculated solely based on the specified amount.
        async getDepositAllowanceParams(token, amount) {
            const baseTokenAddress = await this.getBaseToken();
            const isETHBasedChain = await this.isETHBasedChain();
            if (isETHBasedChain && token == utils_1.ETH_ADDRESS) {
                throw new Error("ETH token can't be approved. The address of the token does not exist on L1.");
            }
            else if (baseTokenAddress == utils_1.ETH_ADDRESS_IN_CONTRACTS) {
                return [{ token, allowance: amount }];
            }
            else if (token == utils_1.ETH_ADDRESS) {
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositETHOnNonETHBasedChainTx({ token, amount }))
                            .mintValue,
                    },
                ];
            }
            else if (token == baseTokenAddress) {
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositBaseTokenOnNonETHBasedChainTx({ token, amount })).mintValue,
                    },
                ];
            }
            else {
                // A deposit of a non-base token to a non-ETH-based chain requires two approvals.
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositNonBaseTokenToNonETHBasedChainTx({ token, amount })).mintValue,
                    },
                    {
                        token: token,
                        allowance: amount,
                    },
                ];
            }
        }
        async deposit(transaction) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = baseTokenAddress == utils_1.ETH_ADDRESS_IN_CONTRACTS;
            if (isETHBasedChain && transaction.token == utils_1.ETH_ADDRESS) {
                return await this._depositETHToETHBasedChain(transaction);
            }
            else if (baseTokenAddress == utils_1.ETH_ADDRESS_IN_CONTRACTS) {
                return await this._depositTokenToETHBasedChain(transaction);
            }
            else if (transaction.token == utils_1.ETH_ADDRESS) {
                return await this._depositETHToNonETHBasedChain(transaction);
            }
            else if (transaction.token == baseTokenAddress) {
                return await this._depositBaseTokenToNonETHBasedChain(transaction);
            }
            else {
                return await this._depositNonBaseTokenToNonETHBasedChain(transaction);
            }
        }
        async _depositNonBaseTokenToNonETHBasedChain(transaction) {
            var _a;
            // Deposit a non-ETH and non-base token to a non-ETH-based chain.
            // Go through the BridgeHub and obtain approval for both tokens.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const sharedBridge = await bridgehub.sharedBridge();
            const bridgeContracts = await this.getL1BridgeContracts();
            const { tx, mintValue } = await this._getDepositNonBaseTokenToNonETHBasedChainTx(transaction);
            if (transaction.approveBaseERC20) {
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(baseTokenAddress, sharedBridge);
                if (allowance.lt(mintValue)) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: sharedBridge,
                        ...transaction.approveBaseOverrides,
                    });
                    await approveTx.wait();
                }
            }
            if (transaction.approveERC20) {
                const proposedBridge = bridgeContracts.shared.address;
                const bridgeAddress = transaction.bridgeAddress
                    ? transaction.bridgeAddress
                    : proposedBridge;
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(transaction.token, bridgeAddress);
                if (allowance.lt(transaction.amount)) {
                    const approveTx = await this.approveERC20(transaction.token, transaction.amount, {
                        bridgeAddress,
                        ...transaction.approveOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this._providerL1().estimateGas(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            (_a = tx.gasLimit) !== null && _a !== void 0 ? _a : (tx.gasLimit = gasLimit);
            return await this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(tx));
        }
        async _depositBaseTokenToNonETHBasedChain(transaction) {
            var _a, _b;
            var _c;
            // Bridging the base token to a non-ETH-based chain.
            // Go through the BridgeHub, and give approval.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const sharedBridge = await bridgehub.sharedBridge();
            const { tx, mintValue } = await this._getDepositBaseTokenOnNonETHBasedChainTx(transaction);
            if (transaction.approveERC20 || transaction.approveBaseERC20) {
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(baseTokenAddress, sharedBridge);
                if (allowance.lt(mintValue)) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: sharedBridge,
                        ...transaction.approveBaseOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this.estimateGasRequestExecute(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            (_a = tx.overrides) !== null && _a !== void 0 ? _a : (tx.overrides = {});
            (_b = (_c = tx.overrides).gasLimit) !== null && _b !== void 0 ? _b : (_c.gasLimit = gasLimit);
            return this.requestExecute(tx);
        }
        async _depositETHToNonETHBasedChain(transaction) {
            var _a;
            // Depositing ETH into a non-ETH-based chain.
            // Use requestL2TransactionTwoBridges, secondBridge is the wETH bridge.
            // Give approval for the base token, and transfer ether value to the wethBridge (and not weth).
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const sharedBridge = await bridgehub.sharedBridge();
            const { tx, mintValue } = await this._getDepositETHOnNonETHBasedChainTx(transaction);
            if (transaction.approveBaseERC20) {
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(baseTokenAddress, sharedBridge);
                if (allowance.lt(mintValue)) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: sharedBridge,
                        ...transaction.approveBaseOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this._providerL1().estimateGas(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            (_a = tx.gasLimit) !== null && _a !== void 0 ? _a : (tx.gasLimit = gasLimit);
            return await this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(tx));
        }
        async _depositTokenToETHBasedChain(transaction) {
            var _a;
            const bridgeContracts = await this.getL1BridgeContracts();
            const { tx, } = await this._getDepositTokenOnETHBasedChainTx(transaction);
            if (transaction.approveERC20) {
                const proposedBridge = bridgeContracts.shared.address;
                const bridgeAddress = transaction.bridgeAddress
                    ? transaction.bridgeAddress
                    : proposedBridge;
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(transaction.token, bridgeAddress);
                if (allowance.lt(transaction.amount)) {
                    const approveTx = await this.approveERC20(transaction.token, transaction.amount, {
                        bridgeAddress,
                        ...transaction.approveOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this._providerL1().estimateGas(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            (_a = tx.gasLimit) !== null && _a !== void 0 ? _a : (tx.gasLimit = gasLimit);
            return await this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(tx));
        }
        async _depositETHToETHBasedChain(transaction) {
            var _a, _b;
            var _c;
            const tx = await this._getDepositETHOnETHBasedChainTx(transaction);
            const baseGasLimit = await this.estimateGasRequestExecute(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            (_a = tx.overrides) !== null && _a !== void 0 ? _a : (tx.overrides = {});
            (_b = (_c = tx.overrides).gasLimit) !== null && _b !== void 0 ? _b : (_c.gasLimit = gasLimit);
            return this.requestExecute(tx);
        }
        async estimateGasDeposit(transaction) {
            const tx = await this.getDepositTx(transaction);
            const isETHBasedChain = await this.isETHBasedChain();
            let baseGasLimit;
            if (isETHBasedChain && transaction.token == utils_1.ETH_ADDRESS) {
                baseGasLimit = await this.estimateGasRequestExecute(tx);
            }
            else {
                baseGasLimit = await this._providerL1().estimateGas(tx);
            }
            return (0, utils_1.scaleGasLimit)(baseGasLimit);
        }
        async getDepositTx(transaction) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = baseTokenAddress == utils_1.ETH_ADDRESS_IN_CONTRACTS;
            if (isETHBasedChain && transaction.token == utils_1.ETH_ADDRESS) {
                return await this._getDepositETHOnETHBasedChainTx(transaction);
            }
            else if (isETHBasedChain) {
                return await this._getDepositTokenOnETHBasedChainTx(transaction);
            }
            else if (transaction.token == utils_1.ETH_ADDRESS) {
                return (await this._getDepositETHOnNonETHBasedChainTx(transaction)).tx;
            }
            else if (transaction.token == baseTokenAddress) {
                return (await this._getDepositBaseTokenOnNonETHBasedChainTx(transaction)).tx;
            }
            else {
                return (await this._getDepositNonBaseTokenToNonETHBasedChainTx(transaction)).tx;
            }
        }
        async _getDepositNonBaseTokenToNonETHBasedChainTx(transaction) {
            var _a;
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const bridgeContracts = await this.getL1BridgeContracts();
            if (transaction.bridgeAddress != null) {
                bridgeContracts.erc20 = bridgeContracts.erc20.attach(transaction.bridgeAddress);
            }
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { token, operatorTip, amount, overrides, l2GasLimit, to, refundRecipient, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            const mintValue = baseCost.add(operatorTip);
            await (0, utils_1.checkBaseCost)(baseCost, mintValue);
            (_a = overrides.value) !== null && _a !== void 0 ? _a : (overrides.value = 0);
            const secondBridgeCalldata = ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256", "address"], [token, amount, to]);
            return {
                tx: await bridgehub.populateTransaction.requestL2TransactionTwoBridges({
                    chainId: (await this._providerL2().getNetwork()).chainId,
                    mintValue,
                    l2Value: 0,
                    l2GasLimit: l2GasLimit,
                    l2GasPerPubdataByteLimit: gasPerPubdataByte,
                    refundRecipient: refundRecipient !== null && refundRecipient !== void 0 ? refundRecipient : ethers_1.ethers.constants.AddressZero,
                    secondBridgeAddress: bridgeContracts.shared.address,
                    secondBridgeValue: 0,
                    secondBridgeCalldata,
                }, overrides),
                mintValue: mintValue,
            };
        }
        async _getDepositBaseTokenOnNonETHBasedChainTx(transaction) {
            // Depositing the base token to a non-ETH-based chain.
            // Goes through the BridgeHub.
            // Have to give approvals for the sharedBridge.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, to, overrides } = tx;
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, await gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            tx.overrides.value = 0;
            return {
                tx: {
                    contractAddress: to,
                    calldata: "0x",
                    mintValue: baseCost.add(operatorTip).add(amount),
                    l2Value: amount,
                    ...tx,
                },
                mintValue: baseCost.add(operatorTip).add(amount),
            };
        }
        async _getDepositETHOnNonETHBasedChainTx(transaction) {
            var _a;
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const sharedBridge = (await this.getL1BridgeContracts()).shared;
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, overrides, l2GasLimit, to, refundRecipient, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            (_a = overrides.value) !== null && _a !== void 0 ? _a : (overrides.value = amount);
            const mintValue = baseCost.add(operatorTip); // of the base token, not eth
            await (0, utils_1.checkBaseCost)(baseCost, mintValue);
            const secondBridgeCalldata = ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256", "address"], [utils_1.ETH_ADDRESS_IN_CONTRACTS, 0, to]);
            return {
                tx: await bridgehub.populateTransaction.requestL2TransactionTwoBridges({
                    chainId,
                    mintValue,
                    l2Value: 0,
                    l2GasLimit: l2GasLimit,
                    l2GasPerPubdataByteLimit: gasPerPubdataByte,
                    refundRecipient: refundRecipient !== null && refundRecipient !== void 0 ? refundRecipient : ethers_1.ethers.constants.AddressZero,
                    secondBridgeAddress: sharedBridge.address,
                    secondBridgeValue: amount,
                    secondBridgeCalldata,
                }, overrides),
                mintValue: mintValue,
            };
        }
        async _getDepositTokenOnETHBasedChainTx(transaction) {
            var _a;
            // Depositing token to an ETH-based chain. Use the ERC20 bridge as done before.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const bridgeContracts = await this.getL1BridgeContracts();
            if (transaction.bridgeAddress != null) {
                bridgeContracts.erc20 = bridgeContracts.erc20.attach(transaction.bridgeAddress);
            }
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { token, operatorTip, amount, overrides, l2GasLimit, to, refundRecipient, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            (_a = overrides.value) !== null && _a !== void 0 ? _a : (overrides.value = amount);
            const mintValue = baseCost.add(operatorTip); // of the base token, not eth
            await (0, utils_1.checkBaseCost)(baseCost, mintValue);
            const secondBridgeCalldata = ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256", "address"], [token, 0, to]);
            return {
                tx: await bridgehub.populateTransaction.requestL2TransactionTwoBridges({
                    chainId,
                    mintValue,
                    l2Value: 0,
                    l2GasLimit: l2GasLimit,
                    l2GasPerPubdataByteLimit: gasPerPubdataByte,
                    refundRecipient: refundRecipient !== null && refundRecipient !== void 0 ? refundRecipient : ethers_1.ethers.constants.AddressZero,
                    secondBridgeAddress: bridgeContracts.shared.address,
                    secondBridgeValue: amount,
                    secondBridgeCalldata,
                }, overrides),
                mintValue: mintValue,
            };
        }
        async _getDepositETHOnETHBasedChainTx(transaction) {
            var _a;
            // Call the BridgeHub directly, like it's done with the DiamondProxy.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, overrides, l2GasLimit, to } = tx;
            const gasPriceForEstimation = await overrides.maxFeePerGas || await overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            (_a = overrides.value) !== null && _a !== void 0 ? _a : (overrides.value = baseCost.add(operatorTip).add(amount));
            return {
                contractAddress: to,
                calldata: "0x",
                mintValue: await overrides.value,
                l2Value: amount,
                l2GasLimit: l2GasLimit,
                ...tx,
            };
        }
        // Creates a shallow copy of a transaction and populates missing fields with defaults.
        async _getDepositTxWithDefaults(transaction) {
            var _a, _b, _c, _d, _e;
            const { ...tx } = transaction;
            tx.to = (_a = tx.to) !== null && _a !== void 0 ? _a : (await this.getAddress());
            (_b = tx.operatorTip) !== null && _b !== void 0 ? _b : (tx.operatorTip = ethers_1.BigNumber.from(0));
            (_c = tx.overrides) !== null && _c !== void 0 ? _c : (tx.overrides = {});
            (_d = tx.gasPerPubdataByte) !== null && _d !== void 0 ? _d : (tx.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            (_e = tx.l2GasLimit) !== null && _e !== void 0 ? _e : (tx.l2GasLimit = await this._getL2GasLimit(tx));
            await insertGasPrice(this._providerL1(), tx.overrides);
            return tx;
        }
        // Default behaviour for calculating l2GasLimit of deposit transaction.
        async _getL2GasLimit(transaction) {
            if (transaction.bridgeAddress != null) {
                return await this._getL2GasLimitFromCustomBridge(transaction);
            }
            else {
                return await (0, utils_1.estimateDefaultBridgeDepositL2Gas)(this._providerL1(), this._providerL2(), transaction.token, transaction.amount, transaction.to, await this.getAddress(), transaction.gasPerPubdataByte);
            }
        }
        // Calculates the l2GasLimit of deposit transaction using custom bridge.
        async _getL2GasLimitFromCustomBridge(transaction) {
            var _a;
            const bridgeContracts = await this.getL1BridgeContracts();
            const customBridgeData = (_a = transaction.customBridgeData) !== null && _a !== void 0 ? _a : await (0, utils_1.getERC20DefaultBridgeData)(transaction.token, this._providerL1());
            const bridge = Il1BridgeFactory_1.Il1BridgeFactory.connect(transaction.bridgeAddress, this._signerL1());
            const l2Address = await bridge.l2Bridge();
            return await (0, utils_1.estimateCustomBridgeDepositL2Gas)(this._providerL2(), transaction.bridgeAddress, l2Address, transaction.token, transaction.amount, transaction.to, customBridgeData, await this.getAddress(), transaction.gasPerPubdataByte);
        }
        // Retrieves the full needed ETH fee for the deposit.
        // Returns the L1 fee and the L2 fee.
        async getFullRequiredDepositFee(transaction) {
            var _a, _b, _c, _d;
            // It is assumed that the L2 fee for the transaction does not depend on its value.
            const dummyAmount = "1";
            const { ...tx } = transaction;
            const bridgehub = await this.getBridgehubContract();
            (_a = tx.overrides) !== null && _a !== void 0 ? _a : (tx.overrides = {});
            await insertGasPrice(this._providerL1(), tx.overrides);
            const gasPriceForMessages = (await tx.overrides.maxFeePerGas) || (await tx.overrides.gasPrice);
            (_b = tx.to) !== null && _b !== void 0 ? _b : (tx.to = await this.getAddress());
            (_c = tx.gasPerPubdataByte) !== null && _c !== void 0 ? _c : (tx.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            let l2GasLimit = null;
            if (tx.bridgeAddress != null) {
                const bridgeContracts = await this.getL1BridgeContracts();
                const customBridgeData = (_d = tx.customBridgeData) !== null && _d !== void 0 ? _d : (tx.customBridgeData = await (0, utils_1.getERC20DefaultBridgeData)(tx.token, this._providerL1()));
                let bridge = Il1BridgeFactory_1.Il1BridgeFactory.connect(tx.bridgeAddress, this._signerL1());
                let l2Address = await bridge.l2Bridge();
                l2GasLimit !== null && l2GasLimit !== void 0 ? l2GasLimit : (l2GasLimit = await (0, utils_1.estimateCustomBridgeDepositL2Gas)(this._providerL2(), tx.bridgeAddress, l2Address, tx.token, dummyAmount, tx.to, customBridgeData, await this.getAddress(), tx.gasPerPubdataByte));
            }
            else {
                l2GasLimit !== null && l2GasLimit !== void 0 ? l2GasLimit : (l2GasLimit = await (0, utils_1.estimateDefaultBridgeDepositL2Gas)(this._providerL1(), this._providerL2(), tx.token, dummyAmount, tx.to, await this.getAddress(), tx.gasPerPubdataByte));
            }
            const baseCost = await bridgehub.l2TransactionBaseCost((await this._providerL2().getNetwork()).chainId, gasPriceForMessages, l2GasLimit, tx.gasPerPubdataByte);
            const selfBalanceETH = await this.getBalanceL1();
            if (baseCost.gte(selfBalanceETH.add(dummyAmount))) {
                const recommendedETHBalance = ethers_1.BigNumber.from(tx.token == utils_1.ETH_ADDRESS
                    ? utils_1.L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT
                    : utils_1.L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT)
                    .mul(gasPriceForMessages)
                    .add(baseCost);
                const formattedRecommendedBalance = ethers_1.ethers.utils.formatEther(recommendedETHBalance);
                throw new Error(`Not enough balance for deposit. Under the provided gas price, the recommended balance to perform a deposit is ${formattedRecommendedBalance} ETH`);
            }
            // For ETH token the value that the user passes to the estimation is the one which has the
            // value for the L2 commission substracted.
            let amountForEstimate;
            if ((0, utils_1.isETH)(tx.token)) {
                amountForEstimate = ethers_1.BigNumber.from(dummyAmount);
            }
            else {
                amountForEstimate = ethers_1.BigNumber.from(dummyAmount);
                if ((await this.getAllowanceL1(tx.token)) < amountForEstimate) {
                    throw new Error("Not enough allowance to cover the deposit");
                }
            }
            // Deleting the explicit gas limits in the fee estimation
            // in order to prevent the situation where the transaction
            // fails because the user does not have enough balance
            const estimationOverrides = { ...tx.overrides };
            delete estimationOverrides.gasPrice;
            delete estimationOverrides.maxFeePerGas;
            delete estimationOverrides.maxPriorityFeePerGas;
            const l1GasLimit = await this.estimateGasDeposit({
                ...tx,
                amount: amountForEstimate,
                overrides: estimationOverrides,
                l2GasLimit,
            });
            const fullCost = {
                baseCost,
                l1GasLimit,
                l2GasLimit,
            };
            if (tx.overrides.gasPrice) {
                fullCost.gasPrice = ethers_1.BigNumber.from(await tx.overrides.gasPrice);
            }
            else {
                fullCost.maxFeePerGas = ethers_1.BigNumber.from(await tx.overrides.maxFeePerGas);
                fullCost.maxPriorityFeePerGas = ethers_1.BigNumber.from(await tx.overrides.maxPriorityFeePerGas);
            }
            return fullCost;
        }
        async getPriorityOpConfirmation(txHash, index = 0) {
            return this._providerL2().getPriorityOpConfirmation(txHash, index);
        }
        async _getWithdrawalLog(withdrawalHash, index = 0) {
            const hash = ethers_1.ethers.utils.hexlify(withdrawalHash);
            const receipt = await this._providerL2().getTransactionReceipt(hash);
            const log = receipt.logs.filter((log) => log.address == utils_1.L1_MESSENGER_ADDRESS &&
                log.topics[0] == ethers_1.ethers.utils.id("L1MessageSent(address,bytes32,bytes)"))[index];
            return {
                log,
                l1BatchTxId: receipt.l1BatchTxIndex,
            };
        }
        async _getWithdrawalL2ToL1Log(withdrawalHash, index = 0) {
            const hash = ethers_1.ethers.utils.hexlify(withdrawalHash);
            const receipt = await this._providerL2().getTransactionReceipt(hash);
            const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(([_, log]) => log.sender == utils_1.L1_MESSENGER_ADDRESS);
            const [l2ToL1LogIndex, l2ToL1Log] = messages[index];
            return {
                l2ToL1LogIndex,
                l2ToL1Log,
            };
        }
        async finalizeWithdrawalParams(withdrawalHash, index = 0) {
            const { log, l1BatchTxId } = await this._getWithdrawalLog(withdrawalHash, index);
            const { l2ToL1LogIndex } = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers_1.ethers.utils.hexDataSlice(log.topics[1], 12);
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);
            const message = ethers_1.ethers.utils.defaultAbiCoder.decode(["bytes"], log.data)[0];
            return {
                l1BatchNumber: log.l1BatchNumber,
                l2MessageIndex: proof.id,
                l2TxNumberInBlock: l1BatchTxId,
                message,
                sender,
                proof: proof.proof,
            };
        }
        async finalizeWithdrawal(withdrawalHash, index = 0, overrides) {
            const { l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, sender, proof } = await this.finalizeWithdrawalParams(withdrawalHash, index);
            if ((0, utils_1.isETH)(sender)) {
                const withdrawTo = ethers_1.ethers.utils.hexDataSlice(message, 4, 24);
                const l1Bridges = await this.getL1BridgeContracts();
                // If the destination address matches the address of the L1 WETH contract,
                // the withdrawal request is processed through the WETH bridge.
                // if (withdrawTo.toLowerCase() == l1Bridges.weth.address.toLowerCase()) {
                //     return await l1Bridges.weth.finalizeWithdrawal(
                //         (await this._providerL2().getNetwork()).chainId,
                //         l1BatchNumber,
                //         l2MessageIndex,
                //         l2TxNumberInBlock,
                //         message,
                //         proof,
                //         overrides ?? {},
                //     );
                // }
                const contractAddress = await this._providerL2().getBridgehubContractAddress();
                const bridgehub = IBridgehubFactory_1.IBridgehubFactory.connect(contractAddress, this._signerL1());
                const wethBridge = Il1BridgeFactory_1.Il1BridgeFactory.connect(await bridgehub.wethBridge(), this._signerL1());
                return await wethBridge.finalizeWithdrawal((await this._providerL2().getNetwork()).chainId, l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, proof, overrides !== null && overrides !== void 0 ? overrides : {});
            }
            const l2Bridge = Il2BridgeFactory_1.Il2BridgeFactory.connect(sender, this._providerL2());
            const l1Bridge = Il1BridgeFactory_1.Il1BridgeFactory.connect(await l2Bridge.l1Bridge(), this._signerL1());
            return await l1Bridge.finalizeWithdrawal((await this._providerL2().getNetwork()).chainId, l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, proof, overrides !== null && overrides !== void 0 ? overrides : {});
        }
        async isWithdrawalFinalized(withdrawalHash, index = 0) {
            const { log } = await this._getWithdrawalLog(withdrawalHash, index);
            const { l2ToL1LogIndex } = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers_1.ethers.utils.hexDataSlice(log.topics[1], 12);
            // `getLogProof` is called not to get proof but
            // to get the index of the corresponding L2->L1 log,
            // which is returned as `proof.id`.
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);
            const chainId = (await this._providerL2().getNetwork()).chainId;
            if ((0, utils_1.isETH)(sender)) {
                const mainContract = await this.getMainContract();
                return await mainContract.isEthWithdrawalFinalized(log.l1BatchNumber, proof.id);
            }
            const l2Bridge = Il2BridgeFactory_1.Il2BridgeFactory.connect(sender, this._providerL2());
            const l1Bridge = Il1BridgeFactory_1.Il1BridgeFactory.connect(await l2Bridge.l1Bridge(), this._providerL1());
            return await l1Bridge.isWithdrawalFinalized(chainId, log.l1BatchNumber, proof.id);
        }
        async claimFailedDeposit(depositHash, overrides) {
            const receipt = await this._providerL2().getTransactionReceipt(ethers_1.ethers.utils.hexlify(depositHash));
            const successL2ToL1LogIndex = receipt.l2ToL1Logs.findIndex((l2ToL1log) => l2ToL1log.sender == utils_1.BOOTLOADER_FORMAL_ADDRESS && l2ToL1log.key == depositHash);
            const successL2ToL1Log = receipt.l2ToL1Logs[successL2ToL1LogIndex];
            if (successL2ToL1Log.value != ethers_1.ethers.constants.HashZero) {
                throw new Error("Cannot claim successful deposit");
            }
            const tx = await this._providerL2().getTransaction(ethers_1.ethers.utils.hexlify(depositHash));
            // Undo the aliasing, since the Mailbox contract set it as for contract address.
            const l1BridgeAddress = (0, utils_1.undoL1ToL2Alias)(receipt.from);
            const l2BridgeAddress = receipt.to;
            const l1Bridge = Il1BridgeFactory_1.Il1BridgeFactory.connect(l1BridgeAddress, this._signerL1());
            const l2Bridge = Il2BridgeFactory_1.Il2BridgeFactory.connect(l2BridgeAddress, this._providerL2());
            const calldata = l2Bridge.interface.decodeFunctionData("finalizeDeposit", tx.data);
            const proof = await this._providerL2().getLogProof(depositHash, successL2ToL1LogIndex);
            return await l1Bridge.claimFailedDeposit((await this._providerL2().getNetwork()).chainId, calldata["_l1Sender"], calldata["_l1Token"], depositHash, calldata["_amount"], receipt.l1BatchNumber, proof.id, receipt.l1BatchTxIndex, proof.proof, overrides !== null && overrides !== void 0 ? overrides : {});
        }
        async requestExecute(transaction) {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);
            return this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(requestExecuteTx));
        }
        async estimateGasRequestExecute(transaction) {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);
            delete requestExecuteTx.gasPrice;
            delete requestExecuteTx.maxFeePerGas;
            delete requestExecuteTx.maxPriorityFeePerGas;
            return this._providerL1().estimateGas(requestExecuteTx);
        }
        async getRequestExecuteTx(transaction) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const isETHBaseToken = (await bridgehub.baseToken(chainId)) == utils_1.ETH_ADDRESS_IN_CONTRACTS;
            const { ...tx } = transaction;
            (_a = tx.l2Value) !== null && _a !== void 0 ? _a : (tx.l2Value = ethers_1.BigNumber.from(0));
            (_b = tx.mintValue) !== null && _b !== void 0 ? _b : (tx.mintValue = ethers_1.BigNumber.from(0));
            (_c = tx.operatorTip) !== null && _c !== void 0 ? _c : (tx.operatorTip = ethers_1.BigNumber.from(0));
            (_d = tx.factoryDeps) !== null && _d !== void 0 ? _d : (tx.factoryDeps = []);
            (_e = tx.overrides) !== null && _e !== void 0 ? _e : (tx.overrides = {});
            (_f = tx.gasPerPubdataByte) !== null && _f !== void 0 ? _f : (tx.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            (_g = tx.refundRecipient) !== null && _g !== void 0 ? _g : (tx.refundRecipient = await this.getAddress());
            (_h = tx.l2GasLimit) !== null && _h !== void 0 ? _h : (tx.l2GasLimit = await this._providerL2().estimateL1ToL2Execute(transaction));
            const { contractAddress, mintValue, l2Value, calldata, l2GasLimit, factoryDeps, operatorTip, overrides, gasPerPubdataByte, refundRecipient, } = tx;
            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await this.getBaseCost({
                gasPrice: gasPriceForEstimation,
                gasPerPubdataByte,
                gasLimit: l2GasLimit,
            });
            (_j = overrides.value) !== null && _j !== void 0 ? _j : (overrides.value = baseCost.add(operatorTip).add(l2Value));
            await (0, utils_1.checkBaseCost)(baseCost, isETHBaseToken ? overrides.value : mintValue);
            return await bridgehub.populateTransaction.requestL2TransactionDirect({
                chainId,
                mintValue: isETHBaseToken ? await overrides.value : mintValue,
                l2Contract: contractAddress,
                l2Value: l2Value,
                l2Calldata: calldata,
                l2GasLimit: l2GasLimit,
                l2GasPerPubdataByteLimit: utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
                factoryDeps: factoryDeps,
                refundRecipient: refundRecipient,
            }, overrides);
        }
    };
}
exports.AdapterL1 = AdapterL1;
function AdapterL2(Base) {
    return class Adapter extends Base {
        _providerL2() {
            throw new Error("Must be implemented by the derived class!");
        }
        _signerL2() {
            throw new Error("Must be implemented by the derived class!");
        }
        async getBalance(token, blockTag = "committed") {
            return await this._providerL2().getBalance(await this.getAddress(), blockTag, token);
        }
        async getAllBalances() {
            return await this._providerL2().getAllAccountBalances(await this.getAddress());
        }
        async getDeploymentNonce() {
            return await INonceHolderFactory_1.INonceHolderFactory.connect(utils_1.NONCE_HOLDER_ADDRESS, this._signerL2()).getDeploymentNonce(await this.getAddress());
        }
        async getL2BridgeContracts() {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                shared: Il2BridgeFactory_1.Il2BridgeFactory.connect(addresses.sharedL2, this._signerL2()),
            };
        }
        _fillCustomData(data) {
            var _a, _b;
            const customData = { ...data };
            (_a = customData.gasPerPubdata) !== null && _a !== void 0 ? _a : (customData.gasPerPubdata = utils_1.DEFAULT_GAS_PER_PUBDATA_LIMIT);
            (_b = customData.factoryDeps) !== null && _b !== void 0 ? _b : (customData.factoryDeps = []);
            return customData;
        }
        async withdraw(transaction) {
            const withdrawTx = await this._providerL2().getWithdrawTx({
                from: await this.getAddress(),
                ...transaction,
            });
            const txResponse = await this.sendTransaction(withdrawTx);
            return this._providerL2()._wrapTransaction(txResponse);
        }
        async transfer(transaction) {
            const transferTx = await this._providerL2().getTransferTx({
                from: await this.getAddress(),
                ...transaction,
            });
            const txResponse = await this.sendTransaction(transferTx);
            return this._providerL2()._wrapTransaction(txResponse);
        }
    };
}
exports.AdapterL2 = AdapterL2;
/// @dev This method checks if the overrides contain a gasPrice (or maxFeePerGas), if not it will insert
/// the maxFeePerGas
async function insertGasPrice(l1Provider, overrides) {
    if (!overrides.gasPrice && !overrides.maxFeePerGas) {
        const l1FeeData = await l1Provider.getFeeData();
        // Sometimes baseFeePerGas is not available, so we use gasPrice instead.
        const baseFee = l1FeeData.lastBaseFeePerGas || l1FeeData.gasPrice;
        // ethers.js by default uses multiplication by 2, but since the price for the L2 part
        // will depend on the L1 part, doubling base fee is typically too much.
        overrides.maxFeePerGas = baseFee.mul(3).div(2).add(l1FeeData.maxPriorityFeePerGas);
        overrides.maxPriorityFeePerGas = l1FeeData.maxPriorityFeePerGas;
    }
}
