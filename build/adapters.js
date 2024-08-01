"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterL2 = exports.AdapterL1 = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const typechain_1 = require("./typechain");
function AdapterL1(Base) {
    return class Adapter extends Base {
        /**
         * Returns a provider instance for connecting to an L2 network.
         */
        _providerL2() {
            throw new Error('Must be implemented by the derived class!');
        }
        /**
         * Returns a provider instance for connecting to a L1 network.
         */
        _providerL1() {
            throw new Error('Must be implemented by the derived class!');
        }
        /**
         * Returns a signer instance used for signing transactions sent to the L1 network.
         */
        _signerL1() {
            throw new Error('Must be implemented by the derived class!');
        }
        /**
         * Returns `Contract` wrapper of the ZKsync Era smart contract.
         */
        async getMainContract() {
            const address = await this._providerL2().getMainContractAddress();
            return typechain_1.IZkSyncHyperchain__factory.connect(address, this._signerL1());
        }
        /**
         * Returns `Contract` wrapper of the Bridgehub smart contract.
         */
        async getBridgehubContract() {
            const address = await this._providerL2().getBridgehubContractAddress();
            return typechain_1.IBridgehub__factory.connect(address, this._signerL1());
        }
        /**
         * Returns L1 bridge contracts.
         *
         * @remarks There is no separate Ether bridge contract, {@link getBridgehubContract Bridgehub} is used instead.
         */
        async getL1BridgeContracts() {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                erc20: typechain_1.IL1ERC20Bridge__factory.connect(addresses.erc20L1, this._signerL1()),
                weth: typechain_1.IL1ERC20Bridge__factory.connect(addresses.wethL1 || addresses.erc20L1, this._signerL1()),
                shared: typechain_1.IL1SharedBridge__factory.connect(addresses.sharedL1, this._signerL1()),
            };
        }
        /**
         * Returns the address of the base token on L1.
         */
        async getBaseToken() {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            return await bridgehub.baseToken(chainId);
        }
        /**
         * Returns whether the chain is ETH-based.
         */
        async isETHBasedChain() {
            return this._providerL2().isEthBasedChain();
        }
        /**
         * Returns the amount of the token held by the account on the L1 network.
         *
         * @param [token] The address of the token. Defaults to ETH if not provided.
         * @param [blockTag] The block in which the balance should be checked.
         * Defaults to 'committed', i.e., the latest processed block.
         */
        async getBalanceL1(token, blockTag) {
            token ?? (token = utils_1.LEGACY_ETH_ADDRESS);
            if ((0, utils_1.isETH)(token)) {
                return await this._providerL1().getBalance(await this.getAddress(), blockTag);
            }
            else {
                const erc20contract = typechain_1.IERC20__factory.connect(token, this._providerL1());
                return await erc20contract.balanceOf(await this.getAddress());
            }
        }
        /**
         * Returns the amount of approved tokens for a specific L1 bridge.
         *
         * @param token The Ethereum address of the token.
         * @param [bridgeAddress] The address of the bridge contract to be used.
         * Defaults to the default ZKsync Era bridge, either `L1EthBridge` or `L1Erc20Bridge`.
         * @param [blockTag] The block in which an allowance should be checked.
         * Defaults to 'committed', i.e., the latest processed block.
         */
        async getAllowanceL1(token, bridgeAddress, blockTag) {
            if (!bridgeAddress) {
                const bridgeContracts = await this.getL1BridgeContracts();
                bridgeAddress = await bridgeContracts.shared.getAddress();
            }
            const erc20contract = typechain_1.IERC20__factory.connect(token, this._providerL1());
            return await erc20contract.allowance(await this.getAddress(), bridgeAddress, {
                blockTag,
            });
        }
        /**
         * Returns the L2 token address equivalent for a L1 token address as they are not necessarily equal.
         * The ETH address is set to the zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L1.
         */
        async l2TokenAddress(token) {
            return this._providerL2().l2TokenAddress(token);
        }
        /**
         * Bridging ERC20 tokens from L1 requires approving the tokens to the ZKsync Era smart contract.
         *
         * @param token The L1 address of the token.
         * @param amount The amount of the token to be approved.
         * @param [overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @returns A promise that resolves to the response of the approval transaction.
         * @throws {Error} If attempting to approve an ETH token.
         */
        async approveERC20(token, amount, overrides) {
            if ((0, utils_1.isETH)(token)) {
                throw new Error("ETH token can't be approved! The address of the token does not exist on L1.");
            }
            overrides ?? (overrides = {});
            let bridgeAddress = overrides.bridgeAddress;
            const erc20contract = typechain_1.IERC20__factory.connect(token, this._signerL1());
            if (!bridgeAddress) {
                bridgeAddress = await (await this.getL1BridgeContracts()).shared.getAddress();
            }
            else {
                delete overrides.bridgeAddress;
            }
            return await erc20contract.approve(bridgeAddress, amount, overrides);
        }
        /**
         * Returns the base cost for an L2 transaction.
         *
         * @param params The parameters for calculating the base cost.
         * @param params.gasLimit The gasLimit for the L2 contract call.
         * @param [params.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [params.gasPrice] The L1 gas price of the L1 transaction that will send the request for an execute call.
         */
        async getBaseCost(params) {
            const bridgehub = await this.getBridgehubContract();
            const parameters = { ...(0, utils_1.layer1TxDefaults)(), ...params };
            parameters.gasPrice ?? (parameters.gasPrice = (await this._providerL1().getFeeData()).gasPrice);
            parameters.gasPerPubdataByte ?? (parameters.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            return await bridgehub.l2TransactionBaseCost((await this._providerL2().getNetwork()).chainId, parameters.gasPrice, parameters.gasLimit, parameters.gasPerPubdataByte);
        }
        /**
         * Returns the parameters for the approval token transaction based on the deposit token and amount.
         * Some deposit transactions require multiple approvals. Existing allowance for the bridge is not checked;
         * allowance is calculated solely based on the specified amount.
         *
         * @param token The address of the token to deposit.
         * @param amount The amount of the token to deposit.
         */
        async getDepositAllowanceParams(token, amount) {
            if ((0, utils_1.isAddressEq)(token, utils_1.LEGACY_ETH_ADDRESS)) {
                token = utils_1.ETH_ADDRESS_IN_CONTRACTS;
            }
            const baseTokenAddress = await this.getBaseToken();
            const isETHBasedChain = await this.isETHBasedChain();
            if (isETHBasedChain && (0, utils_1.isAddressEq)(token, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                throw new Error("ETH token can't be approved! The address of the token does not exist on L1.");
            }
            else if ((0, utils_1.isAddressEq)(baseTokenAddress, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return [{ token, allowance: amount }];
            }
            else if ((0, utils_1.isAddressEq)(token, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositETHOnNonETHBasedChainTx({ token, amount })).mintValue,
                    },
                ];
            }
            else if ((0, utils_1.isAddressEq)(token, baseTokenAddress)) {
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositBaseTokenOnNonETHBasedChainTx({
                            token,
                            amount,
                        })).mintValue,
                    },
                ];
            }
            else {
                // A deposit of a non-base token to a non-ETH-based chain requires two approvals.
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositNonBaseTokenToNonETHBasedChainTx({
                            token,
                            amount,
                        })).mintValue,
                    },
                    {
                        token: token,
                        allowance: amount,
                    },
                ];
            }
        }
        /**
         * Transfers the specified token from the associated account on the L1 network to the target account on the L2 network.
         * The token can be either ETH or any ERC20 token. For ERC20 tokens, enough approved tokens must be associated with
         * the specified L1 bridge (default one or the one defined in `transaction.bridgeAddress`).
         * In this case, depending on is the chain ETH-based or not `transaction.approveERC20` or `transaction.approveBaseERC20`
         * can be enabled to perform token approval. If there are already enough approved tokens for the L1 bridge,
         * token approval will be skipped. To check the amount of approved tokens for a specific bridge,
         * use the {@link getAllowanceL1} method.
         *
         * @param transaction The transaction object containing deposit details.
         * @param transaction.token The address of the token to deposit. ETH by default.
         * @param transaction.amount The amount of the token to deposit.
         * @param [transaction.to] The address that will receive the deposited tokens on L2.
         * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
         * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of
         * the base cost of the transaction.
         * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
         * Defaults to the default ZKsync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
         * @param [transaction.approveERC20] Whether or not token approval should be performed under the hood.
         * Set this flag to true if you bridge an ERC20 token and didn't call the {@link approveERC20} function beforehand.
         * @param [transaction.approveBaseERC20] Whether or not base token approval should be performed under the hood.
         * Set this flag to true if you bridge a base token and didn't call the {@link approveERC20} function beforehand.
         * @param [transaction.l2GasLimit] Maximum amount of L2 gas that the transaction can consume during execution on L2.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
         * If the transaction fails, it will also be the address to receive `l2Value`.
         * @param [transaction.overrides] Transaction's overrides for deposit which may be used to pass
         * L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @param [transaction.approveOverrides] Transaction's overrides for approval of an ERC20 token which may be used
         * to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @param [transaction.approveBaseOverrides] Transaction's overrides for approval of a base token which may be used
         * to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
         */
        async deposit(transaction) {
            if ((0, utils_1.isAddressEq)(transaction.token, utils_1.LEGACY_ETH_ADDRESS)) {
                transaction.token = utils_1.ETH_ADDRESS_IN_CONTRACTS;
            }
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = (0, utils_1.isAddressEq)(baseTokenAddress, utils_1.ETH_ADDRESS_IN_CONTRACTS);
            if (isETHBasedChain &&
                (0, utils_1.isAddressEq)(transaction.token, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return await this._depositETHToETHBasedChain(transaction);
            }
            else if ((0, utils_1.isAddressEq)(baseTokenAddress, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return await this._depositTokenToETHBasedChain(transaction);
            }
            else if ((0, utils_1.isAddressEq)(transaction.token, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return await this._depositETHToNonETHBasedChain(transaction);
            }
            else if ((0, utils_1.isAddressEq)(transaction.token, baseTokenAddress)) {
                return await this._depositBaseTokenToNonETHBasedChain(transaction);
            }
            else {
                return await this._depositNonBaseTokenToNonETHBasedChain(transaction);
            }
        }
        async _depositNonBaseTokenToNonETHBasedChain(transaction) {
            // Deposit a non-ETH and non-base token to a non-ETH-based chain.
            // Go through the BridgeHub and obtain approval for both tokens.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const bridgeContracts = await this.getL1BridgeContracts();
            const { tx, mintValue } = await this._getDepositNonBaseTokenToNonETHBasedChainTx(transaction);
            if (transaction.approveBaseERC20) {
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(baseTokenAddress, await bridgeContracts.shared.getAddress());
                if (allowance < mintValue) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: await bridgeContracts.shared.getAddress(),
                        ...transaction.approveBaseOverrides,
                    });
                    await approveTx.wait();
                }
            }
            if (transaction.approveERC20) {
                const bridgeAddress = transaction.bridgeAddress
                    ? transaction.bridgeAddress
                    : await bridgeContracts.shared.getAddress();
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(transaction.token, bridgeAddress);
                if (allowance < BigInt(transaction.amount)) {
                    const approveTx = await this.approveERC20(transaction.token, transaction.amount, {
                        bridgeAddress,
                        ...transaction.approveOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this._providerL1().estimateGas(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            tx.gasLimit ?? (tx.gasLimit = gasLimit);
            return await this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(tx));
        }
        async _depositBaseTokenToNonETHBasedChain(transaction) {
            var _a;
            // Bridging the base token to a non-ETH-based chain.
            // Go through the BridgeHub, and give approval.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const sharedBridge = await (await this.getL1BridgeContracts()).shared.getAddress();
            const { tx, mintValue } = await this._getDepositBaseTokenOnNonETHBasedChainTx(transaction);
            if (transaction.approveERC20 || transaction.approveBaseERC20) {
                const approveOverrides = transaction.approveBaseOverrides ?? transaction.approveOverrides;
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(baseTokenAddress, sharedBridge);
                if (allowance < mintValue) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: sharedBridge,
                        ...approveOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this.estimateGasRequestExecute(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            tx.overrides ?? (tx.overrides = {});
            (_a = tx.overrides).gasLimit ?? (_a.gasLimit = gasLimit);
            return this.requestExecute(tx);
        }
        async _depositETHToNonETHBasedChain(transaction) {
            // Depositing ETH into a non-ETH-based chain.
            // Use requestL2TransactionTwoBridges, secondBridge is the wETH bridge.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const sharedBridge = await (await this.getL1BridgeContracts()).shared.getAddress();
            const { tx, mintValue } = await this._getDepositETHOnNonETHBasedChainTx(transaction);
            if (transaction.approveBaseERC20) {
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(baseTokenAddress, sharedBridge);
                if (allowance < mintValue) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: sharedBridge,
                        ...transaction.approveBaseOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this._providerL1().estimateGas(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            tx.gasLimit ?? (tx.gasLimit = gasLimit);
            return await this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(tx));
        }
        async _depositTokenToETHBasedChain(transaction) {
            const bridgeContracts = await this.getL1BridgeContracts();
            const tx = await this._getDepositTokenOnETHBasedChainTx(transaction);
            if (transaction.approveERC20) {
                const proposedBridge = await bridgeContracts.shared.getAddress();
                const bridgeAddress = transaction.bridgeAddress
                    ? transaction.bridgeAddress
                    : proposedBridge;
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(transaction.token, bridgeAddress);
                if (allowance < BigInt(transaction.amount)) {
                    const approveTx = await this.approveERC20(transaction.token, transaction.amount, {
                        bridgeAddress,
                        ...transaction.approveOverrides,
                    });
                    await approveTx.wait();
                }
            }
            const baseGasLimit = await this._providerL1().estimateGas(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            tx.gasLimit ?? (tx.gasLimit = gasLimit);
            return await this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(tx));
        }
        async _depositETHToETHBasedChain(transaction) {
            var _a;
            const tx = await this._getDepositETHOnETHBasedChainTx(transaction);
            const baseGasLimit = await this.estimateGasRequestExecute(tx);
            const gasLimit = (0, utils_1.scaleGasLimit)(baseGasLimit);
            tx.overrides ?? (tx.overrides = {});
            (_a = tx.overrides).gasLimit ?? (_a.gasLimit = gasLimit);
            return this.requestExecute(tx);
        }
        /**
         * Estimates the amount of gas required for a deposit transaction on the L1 network.
         * Gas for approving ERC20 tokens is not included in the estimation.
         *
         * In order for estimation to work, enough token allowance is required in the following cases:
         * - Depositing ERC20 tokens on an ETH-based chain.
         * - Depositing any token (including ETH) on a non-ETH-based chain.
         *
         * @param transaction The transaction details.
         * @param transaction.token The address of the token to deposit. ETH by default.
         * @param transaction.amount The amount of the token to deposit.
         * @param [transaction.to] The address that will receive the deposited tokens on L2.
         * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
         * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of the
         * base cost of the transaction.
         * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
         * Defaults to the default ZKsync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
         * @param [transaction.l2GasLimit] Maximum amount of L2 gas that the transaction can consume during execution on L2.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
         * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
         * If the transaction fails, it will also be the address to receive `l2Value`.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         */
        async estimateGasDeposit(transaction) {
            if ((0, utils_1.isAddressEq)(transaction.token, utils_1.LEGACY_ETH_ADDRESS)) {
                transaction.token = utils_1.ETH_ADDRESS_IN_CONTRACTS;
            }
            const tx = await this.getDepositTx(transaction);
            let baseGasLimit;
            if (tx.token && (0, utils_1.isAddressEq)(tx.token, await this.getBaseToken())) {
                baseGasLimit = await this.estimateGasRequestExecute(tx);
            }
            else {
                baseGasLimit = await this._providerL1().estimateGas(tx);
            }
            return (0, utils_1.scaleGasLimit)(baseGasLimit);
        }
        /**
         * Returns a populated deposit transaction.
         *
         * @param transaction The transaction details.
         * @param transaction.token The address of the token to deposit. ETH by default.
         * @param transaction.amount The amount of the token to deposit.
         * @param [transaction.to] The address that will receive the deposited tokens on L2.
         * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
         * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of the
         * base cost of the transaction.
         * @param [transaction.bridgeAddress] The address of the bridge contract to be used. Defaults to the default ZKsync
         * Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
         * @param [transaction.l2GasLimit] Maximum amount of L2 gas that the transaction can consume during execution on L2.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
         * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
         * If the transaction fails, it will also be the address to receive `l2Value`.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         */
        async getDepositTx(transaction) {
            if ((0, utils_1.isAddressEq)(transaction.token, utils_1.LEGACY_ETH_ADDRESS)) {
                transaction.token = utils_1.ETH_ADDRESS_IN_CONTRACTS;
            }
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = (0, utils_1.isAddressEq)(baseTokenAddress, utils_1.ETH_ADDRESS_IN_CONTRACTS);
            if (isETHBasedChain &&
                (0, utils_1.isAddressEq)(transaction.token, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return await this._getDepositETHOnETHBasedChainTx(transaction);
            }
            else if (isETHBasedChain) {
                return await this._getDepositTokenOnETHBasedChainTx(transaction);
            }
            else if ((0, utils_1.isAddressEq)(transaction.token, utils_1.ETH_ADDRESS_IN_CONTRACTS)) {
                return (await this._getDepositETHOnNonETHBasedChainTx(transaction)).tx;
            }
            else if ((0, utils_1.isAddressEq)(transaction.token, baseTokenAddress)) {
                return (await this._getDepositBaseTokenOnNonETHBasedChainTx(transaction)).tx;
            }
            else {
                return (await this._getDepositNonBaseTokenToNonETHBasedChainTx(transaction)).tx;
            }
        }
        async _getDepositNonBaseTokenToNonETHBasedChainTx(transaction) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const bridgeContracts = await this.getL1BridgeContracts();
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { token, operatorTip, amount, overrides, l2GasLimit, to, refundRecipient, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, l2GasLimit, gasPerPubdataByte);
            const mintValue = baseCost + BigInt(operatorTip);
            await (0, utils_1.checkBaseCost)(baseCost, mintValue);
            overrides.value ?? (overrides.value = 0);
            return {
                tx: await bridgehub.requestL2TransactionTwoBridges.populateTransaction({
                    chainId: chainId,
                    mintValue,
                    l2Value: 0,
                    l2GasLimit: l2GasLimit,
                    l2GasPerPubdataByteLimit: gasPerPubdataByte,
                    refundRecipient: refundRecipient ?? ethers_1.ethers.ZeroAddress,
                    secondBridgeAddress: tx.bridgeAddress ?? (await bridgeContracts.shared.getAddress()),
                    secondBridgeValue: 0,
                    secondBridgeCalldata: ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'uint256', 'address'], [token, amount, to]),
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
            const { operatorTip, amount, to, overrides, l2GasLimit, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, l2GasLimit, gasPerPubdataByte);
            tx.overrides.value = 0;
            return {
                tx: {
                    contractAddress: to,
                    calldata: '0x',
                    mintValue: baseCost + BigInt(operatorTip) + BigInt(amount),
                    l2Value: amount,
                    ...tx,
                },
                mintValue: baseCost + BigInt(operatorTip) + BigInt(amount),
            };
        }
        async _getDepositETHOnNonETHBasedChainTx(transaction) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const sharedBridge = await (await this.getL1BridgeContracts()).shared.getAddress();
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, overrides, l2GasLimit, to, refundRecipient, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, l2GasLimit, gasPerPubdataByte);
            overrides.value ?? (overrides.value = amount);
            const mintValue = baseCost + BigInt(operatorTip);
            await (0, utils_1.checkBaseCost)(baseCost, mintValue);
            return {
                tx: await bridgehub.requestL2TransactionTwoBridges.populateTransaction({
                    chainId,
                    mintValue,
                    l2Value: 0,
                    l2GasLimit: l2GasLimit,
                    l2GasPerPubdataByteLimit: gasPerPubdataByte,
                    refundRecipient: refundRecipient ?? ethers_1.ethers.ZeroAddress,
                    secondBridgeAddress: tx.bridgeAddress ?? sharedBridge,
                    secondBridgeValue: amount,
                    secondBridgeCalldata: ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'uint256', 'address'], [utils_1.ETH_ADDRESS_IN_CONTRACTS, 0, to]),
                }, overrides),
                mintValue: mintValue,
            };
        }
        async _getDepositTokenOnETHBasedChainTx(transaction) {
            // Depositing token to an ETH-based chain. Use the ERC20 bridge as done before.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { token, operatorTip, amount, overrides, l2GasLimit, to, refundRecipient, gasPerPubdataByte, } = tx;
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            const mintValue = baseCost + BigInt(operatorTip);
            overrides.value ?? (overrides.value = mintValue);
            await (0, utils_1.checkBaseCost)(baseCost, mintValue);
            const secondBridgeAddress = tx.bridgeAddress ??
                (await (await this.getL1BridgeContracts()).shared.getAddress());
            const secondBridgeCalldata = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'uint256', 'address'], [token, amount, to]);
            return await bridgehub.requestL2TransactionTwoBridges.populateTransaction({
                chainId,
                mintValue,
                l2Value: 0,
                l2GasLimit,
                l2GasPerPubdataByteLimit: gasPerPubdataByte,
                refundRecipient: refundRecipient ?? ethers_1.ethers.ZeroAddress,
                secondBridgeAddress,
                secondBridgeValue: 0,
                secondBridgeCalldata,
            }, overrides);
        }
        async _getDepositETHOnETHBasedChainTx(transaction) {
            // Call the BridgeHub directly, like it's done with the DiamondProxy.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, overrides, l2GasLimit, gasPerPubdataByte, to, } = tx;
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, l2GasLimit, gasPerPubdataByte);
            overrides.value ?? (overrides.value = baseCost + BigInt(operatorTip) + BigInt(amount));
            return {
                contractAddress: to,
                calldata: '0x',
                mintValue: overrides.value,
                l2Value: amount,
                ...tx,
            };
        }
        // Creates a shallow copy of a transaction and populates missing fields with defaults.
        async _getDepositTxWithDefaults(transaction) {
            const { ...tx } = transaction;
            tx.to = tx.to ?? (await this.getAddress());
            tx.operatorTip ?? (tx.operatorTip = 0);
            tx.overrides ?? (tx.overrides = {});
            tx.overrides.from = await this.getAddress();
            tx.gasPerPubdataByte ?? (tx.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            tx.l2GasLimit ?? (tx.l2GasLimit = await this._getL2GasLimit(tx));
            await insertGasPrice(this._providerL1(), tx.overrides);
            return tx;
        }
        // Default behaviour for calculating l2GasLimit of deposit transaction.
        async _getL2GasLimit(transaction) {
            if (transaction.bridgeAddress) {
                return await this._getL2GasLimitFromCustomBridge(transaction);
            }
            else {
                return await (0, utils_1.estimateDefaultBridgeDepositL2Gas)(this._providerL1(), this._providerL2(), transaction.token, transaction.amount, transaction.to, await this.getAddress(), transaction.gasPerPubdataByte);
            }
        }
        // Calculates the l2GasLimit of deposit transaction using custom bridge.
        async _getL2GasLimitFromCustomBridge(transaction) {
            const customBridgeData = transaction.customBridgeData ??
                (await (0, utils_1.getERC20DefaultBridgeData)(transaction.token, this._providerL1()));
            const bridge = typechain_1.IL1Bridge__factory.connect(transaction.bridgeAddress, this._signerL1());
            const chainId = (await this._providerL2().getNetwork())
                .chainId;
            const l2Address = await bridge.l2BridgeAddress(chainId);
            return await (0, utils_1.estimateCustomBridgeDepositL2Gas)(this._providerL2(), transaction.bridgeAddress, l2Address, transaction.token, transaction.amount, transaction.to, customBridgeData, await this.getAddress(), transaction.gasPerPubdataByte);
        }
        /**
         * Retrieves the full needed ETH fee for the deposit. Returns the L1 fee and the L2 fee {@link FullDepositFee}.
         *
         * @param transaction The transaction details.
         * @param transaction.token The address of the token to deposit. ETH by default.
         * @param [transaction.to] The address that will receive the deposited tokens on L2.
         * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
         * Defaults to the default ZKsync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
         * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @throws {Error} If:
         *  - There's not enough balance for the deposit under the provided gas price.
         *  - There's not enough allowance to cover the deposit.
         */
        async getFullRequiredDepositFee(transaction) {
            var _a, _b;
            if ((0, utils_1.isAddressEq)(transaction.token, utils_1.LEGACY_ETH_ADDRESS)) {
                transaction.token = utils_1.ETH_ADDRESS_IN_CONTRACTS;
            }
            // It is assumed that the L2 fee for the transaction does not depend on its value.
            const dummyAmount = 1n;
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = (0, utils_1.isAddressEq)(baseTokenAddress, utils_1.ETH_ADDRESS_IN_CONTRACTS);
            const tx = await this._getDepositTxWithDefaults({
                ...transaction,
                amount: dummyAmount,
            });
            const gasPriceForEstimation = tx.overrides.maxFeePerGas || tx.overrides.gasPrice;
            const baseCost = await bridgehub.l2TransactionBaseCost(chainId, gasPriceForEstimation, tx.l2GasLimit, tx.gasPerPubdataByte);
            if (isETHBasedChain) {
                // To ensure that L1 gas estimation succeeds when using estimateGasDeposit,
                // the account needs to have a sufficient ETH balance.
                const selfBalanceETH = await this.getBalanceL1();
                if (baseCost >= selfBalanceETH + dummyAmount) {
                    const recommendedL1GasLimit = (0, utils_1.isAddressEq)(tx.token, utils_1.ETH_ADDRESS_IN_CONTRACTS)
                        ? utils_1.L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT
                        : utils_1.L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT;
                    const recommendedETHBalance = BigInt(recommendedL1GasLimit) * BigInt(gasPriceForEstimation) +
                        baseCost;
                    const formattedRecommendedBalance = ethers_1.ethers.formatEther(recommendedETHBalance);
                    throw new Error(`Not enough balance for deposit! Under the provided gas price, the recommended balance to perform a deposit is ${formattedRecommendedBalance} ETH`);
                }
                // In case of token deposit, a sufficient token allowance is also required.
                if (!(0, utils_1.isAddressEq)(tx.token, utils_1.ETH_ADDRESS_IN_CONTRACTS) &&
                    (await this.getAllowanceL1(tx.token, tx.bridgeAddress)) < dummyAmount) {
                    throw new Error('Not enough allowance to cover the deposit!');
                }
            }
            else {
                const mintValue = baseCost + BigInt(tx.operatorTip);
                if ((await this.getAllowanceL1(baseTokenAddress)) < mintValue) {
                    throw new Error('Not enough base token allowance to cover the deposit!');
                }
                if ((0, utils_1.isAddressEq)(tx.token, utils_1.ETH_ADDRESS_IN_CONTRACTS) ||
                    (0, utils_1.isAddressEq)(tx.token, baseTokenAddress)) {
                    (_a = tx.overrides).value ?? (_a.value = tx.amount);
                }
                else {
                    (_b = tx.overrides).value ?? (_b.value = 0);
                    if ((await this.getAllowanceL1(tx.token)) < dummyAmount) {
                        throw new Error('Not enough token allowance to cover the deposit!');
                    }
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
                amount: dummyAmount,
                overrides: estimationOverrides,
                l2GasLimit: tx.l2GasLimit,
            });
            const fullCost = {
                baseCost,
                l1GasLimit,
                l2GasLimit: BigInt(tx.l2GasLimit),
            };
            if (tx.overrides.gasPrice) {
                fullCost.gasPrice = BigInt(tx.overrides.gasPrice);
            }
            else {
                fullCost.maxFeePerGas = BigInt(tx.overrides.maxFeePerGas);
                fullCost.maxPriorityFeePerGas = BigInt(tx.overrides.maxPriorityFeePerGas);
            }
            return fullCost;
        }
        /**
         * Returns the transaction confirmation data that is part of `L2->L1` message.
         *
         * @param txHash The hash of the L2 transaction where the message was initiated.
         * @param [index=0] In case there were multiple transactions in one message, you may pass an index of the
         * transaction which confirmation data should be fetched.
         * @throws {Error} If log proof can not be found.
         */
        async getPriorityOpConfirmation(txHash, index = 0) {
            return this._providerL2().getPriorityOpConfirmation(txHash, index);
        }
        async _getWithdrawalLog(withdrawalHash, index = 0) {
            const hash = ethers_1.ethers.hexlify(withdrawalHash);
            const receipt = await this._providerL2().getTransactionReceipt(hash);
            if (!receipt) {
                throw new Error('Transaction is not mined!');
            }
            const log = receipt.logs.filter(log => (0, utils_1.isAddressEq)(log.address, utils_1.L1_MESSENGER_ADDRESS) &&
                log.topics[0] === ethers_1.ethers.id('L1MessageSent(address,bytes32,bytes)'))[index];
            return {
                log,
                l1BatchTxId: receipt.l1BatchTxIndex,
            };
        }
        async _getWithdrawalL2ToL1Log(withdrawalHash, index = 0) {
            const hash = ethers_1.ethers.hexlify(withdrawalHash);
            const receipt = await this._providerL2().getTransactionReceipt(hash);
            if (!receipt) {
                throw new Error('Transaction is not mined!');
            }
            const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(([, log]) => (0, utils_1.isAddressEq)(log.sender, utils_1.L1_MESSENGER_ADDRESS));
            const [l2ToL1LogIndex, l2ToL1Log] = messages[index];
            return {
                l2ToL1LogIndex,
                l2ToL1Log,
            };
        }
        /**
         * Returns the {@link FinalizeWithdrawalParams parameters} required for finalizing a withdrawal from the
         * withdrawal transaction's log on the L1 network.
         *
         * @param withdrawalHash Hash of the L2 transaction where the withdrawal was initiated.
         * @param [index=0] In case there were multiple withdrawals in one transaction, you may pass an index of the
         * withdrawal you want to finalize.
         * @throws {Error} If log proof can not be found.
         */
        async finalizeWithdrawalParams(withdrawalHash, index = 0) {
            const { log, l1BatchTxId } = await this._getWithdrawalLog(withdrawalHash, index);
            const { l2ToL1LogIndex } = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers_1.ethers.dataSlice(log.topics[1], 12);
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);
            if (!proof) {
                throw new Error('Log proof not found!');
            }
            const message = ethers_1.ethers.AbiCoder.defaultAbiCoder().decode(['bytes'], log.data)[0];
            return {
                l1BatchNumber: log.l1BatchNumber,
                l2MessageIndex: proof.id,
                l2TxNumberInBlock: l1BatchTxId,
                message,
                sender,
                proof: proof.proof,
            };
        }
        /**
         * Proves the inclusion of the `L2->L1` withdrawal message.
         *
         * @param withdrawalHash Hash of the L2 transaction where the withdrawal was initiated.
         * @param [index=0] In case there were multiple withdrawals in one transaction, you may pass an index of the
         * withdrawal you want to finalize.
         * @param [overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @returns A promise that resolves to the proof of inclusion of the withdrawal message.
         * @throws {Error} If log proof can not be found.
         */
        async finalizeWithdrawal(withdrawalHash, index = 0, overrides) {
            const { l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, sender, proof, } = await this.finalizeWithdrawalParams(withdrawalHash, index);
            let l1Bridge;
            if ((0, utils_1.isAddressEq)(sender, utils_1.L2_BASE_TOKEN_ADDRESS)) {
                l1Bridge = (await this.getL1BridgeContracts()).shared;
            }
            else if (!(await this._providerL2().isL2BridgeLegacy(sender))) {
                const l2Bridge = typechain_1.IL2SharedBridge__factory.connect(sender, this._providerL2());
                const bridgeAddress = await l2Bridge.l1SharedBridge();
                l1Bridge = typechain_1.IL1SharedBridge__factory.connect(bridgeAddress, this._signerL1());
            }
            else {
                const l2Bridge = typechain_1.IL2Bridge__factory.connect(sender, this._providerL2());
                const bridgeAddress = await l2Bridge.l1Bridge();
                l1Bridge = typechain_1.IL1Bridge__factory.connect(bridgeAddress, this._signerL1());
            }
            return await l1Bridge.finalizeWithdrawal((await this._providerL2().getNetwork()).chainId, l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, proof, overrides ?? {});
        }
        /**
         * Returns whether the withdrawal transaction is finalized on the L1 network.
         *
         * @param withdrawalHash Hash of the L2 transaction where the withdrawal was initiated.
         * @param [index=0] In case there were multiple withdrawals in one transaction, you may pass an index of the
         * withdrawal you want to finalize.
         * @throws {Error} If log proof can not be found.
         */
        async isWithdrawalFinalized(withdrawalHash, index = 0) {
            const { log } = await this._getWithdrawalLog(withdrawalHash, index);
            const { l2ToL1LogIndex } = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers_1.ethers.dataSlice(log.topics[1], 12);
            // `getLogProof` is called not to get proof but
            // to get the index of the corresponding L2->L1 log,
            // which is returned as `proof.id`.
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);
            if (!proof) {
                throw new Error('Log proof not found!');
            }
            const chainId = (await this._providerL2().getNetwork()).chainId;
            let l1Bridge;
            if (await this._providerL2().isBaseToken(sender)) {
                l1Bridge = (await this.getL1BridgeContracts()).shared;
            }
            else {
                const l2Bridge = typechain_1.IL2SharedBridge__factory.connect(sender, this._providerL2());
                l1Bridge = typechain_1.IL1SharedBridge__factory.connect(await l2Bridge.l1SharedBridge(), this._providerL1());
            }
            return await l1Bridge.isWithdrawalFinalized(chainId, log.l1BatchNumber, proof.id);
        }
        /**
         * Withdraws funds from the initiated deposit, which failed when finalizing on L2.
         * If the deposit L2 transaction has failed, it sends an L1 transaction calling `claimFailedDeposit` method of the
         * L1 bridge, which results in returning L1 tokens back to the depositor.
         *
         * @param depositHash The L2 transaction hash of the failed deposit.
         * @param [overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         * @returns A promise that resolves to the response of the `claimFailedDeposit` transaction.
         * @throws {Error} If attempting to claim successful deposit.
         */
        async claimFailedDeposit(depositHash, overrides) {
            const receipt = await this._providerL2().getTransactionReceipt(ethers_1.ethers.hexlify(depositHash));
            if (!receipt) {
                throw new Error('Transaction is not mined!');
            }
            const successL2ToL1LogIndex = receipt.l2ToL1Logs.findIndex(l2ToL1log => (0, utils_1.isAddressEq)(l2ToL1log.sender, utils_1.BOOTLOADER_FORMAL_ADDRESS) &&
                l2ToL1log.key === depositHash);
            const successL2ToL1Log = receipt.l2ToL1Logs[successL2ToL1LogIndex];
            if (successL2ToL1Log.value !== ethers_1.ethers.ZeroHash) {
                throw new Error('Cannot claim successful deposit!');
            }
            const tx = await this._providerL2().getTransaction(ethers_1.ethers.hexlify(depositHash));
            // Undo the aliasing, since the Mailbox contract set it as for contract address.
            const l1BridgeAddress = (0, utils_1.undoL1ToL2Alias)(receipt.from);
            const l2BridgeAddress = receipt.to;
            if (!l2BridgeAddress) {
                throw new Error('L2 bridge address not found!');
            }
            const l1Bridge = typechain_1.IL1SharedBridge__factory.connect(l1BridgeAddress, this._signerL1());
            const l2Bridge = typechain_1.IL2Bridge__factory.connect(l2BridgeAddress, this._providerL2());
            const calldata = l2Bridge.interface.decodeFunctionData('finalizeDeposit', tx.data);
            const proof = await this._providerL2().getLogProof(depositHash, successL2ToL1LogIndex);
            if (!proof) {
                throw new Error('Log proof not found!');
            }
            return await l1Bridge.claimFailedDeposit((await this._providerL2().getNetwork()).chainId, calldata['_l1Sender'], calldata['_l1Token'], calldata['_amount'], depositHash, receipt.l1BatchNumber, proof.id, receipt.l1BatchTxIndex, proof.proof, overrides ?? {});
        }
        /**
         * Requests execution of an L2 transaction from L1.
         *
         * @param transaction The transaction details.
         * @param transaction.contractAddress The L2 contract to be called.
         * @param transaction.calldata The input of the L2 transaction.
         * @param [transaction.l2GasLimit] Maximum amount of L2 gas that transaction can consume during execution on L2.
         * @param [transaction.mintValue] The amount of base token that needs to be minted on non-ETH-based L2.
         * @param [transaction.l2Value] `msg.value` of L2 transaction.
         * @param [transaction.factoryDeps] An array of L2 bytecodes that will be marked as known on L2.
         * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
         * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of
         * the base cost of the transaction.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
         * If the transaction fails, it will also be the address to receive `l2Value`.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.
         * @returns A promise that resolves to the response of the execution request.
         */
        async requestExecute(transaction) {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);
            return this._providerL2().getPriorityOpResponse(await this._signerL1().sendTransaction(requestExecuteTx));
        }
        /**
         * Estimates the amount of gas required for a request execute transaction.
         *
         * @param transaction The transaction details.
         * @param transaction.contractAddress The L2 contract to be called.
         * @param transaction.calldata The input of the L2 transaction.
         * @param [transaction.l2GasLimit] Maximum amount of L2 gas that transaction can consume during execution on L2.
         * @param [transaction.mintValue] The amount of base token that needs to be minted on non-ETH-based L2.
         * @param [transaction.l2Value] `msg.value` of L2 transaction.
         * @param [transaction.factoryDeps] An array of L2 bytecodes that will be marked as known on L2.
         * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
         * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top
         * of the base cost of the transaction.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
         * If the transaction fails, it will also be the address to receive `l2Value`.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         */
        async estimateGasRequestExecute(transaction) {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);
            delete requestExecuteTx.gasPrice;
            delete requestExecuteTx.maxFeePerGas;
            delete requestExecuteTx.maxPriorityFeePerGas;
            return this._providerL1().estimateGas(requestExecuteTx);
        }
        /**
         * Returns the parameters for the approval token transaction based on the request execute transaction.
         * Existing allowance for the bridge is not checked; allowance is calculated solely based on the specified transaction.
         *
         * @param transaction The request execute transaction on which approval parameters are calculated.
         */
        async getRequestExecuteAllowanceParams(transaction) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const isETHBaseToken = (0, utils_1.isAddressEq)(await bridgehub.baseToken(chainId), utils_1.ETH_ADDRESS_IN_CONTRACTS);
            if (isETHBaseToken) {
                throw new Error("ETH token can't be approved! The address of the token does not exist on L1.");
            }
            const { ...tx } = transaction;
            tx.l2Value ?? (tx.l2Value = 0n);
            tx.operatorTip ?? (tx.operatorTip = 0n);
            tx.factoryDeps ?? (tx.factoryDeps = []);
            tx.overrides ?? (tx.overrides = {});
            tx.gasPerPubdataByte ?? (tx.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            tx.refundRecipient ?? (tx.refundRecipient = await this.getAddress());
            tx.l2GasLimit ?? (tx.l2GasLimit = await this._providerL2().estimateL1ToL2Execute(transaction));
            const { l2Value, l2GasLimit, operatorTip, overrides, gasPerPubdataByte } = tx;
            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await this.getBaseCost({
                gasPrice: gasPriceForEstimation,
                gasPerPubdataByte,
                gasLimit: l2GasLimit,
            });
            return {
                token: await this.getBaseToken(),
                allowance: baseCost + BigInt(operatorTip) + BigInt(l2Value),
            };
        }
        /**
         * Returns a populated request execute transaction.
         *
         * @param transaction The transaction details.
         * @param transaction.contractAddress The L2 contract to be called.
         * @param transaction.calldata The input of the L2 transaction.
         * @param [transaction.l2GasLimit] Maximum amount of L2 gas that transaction can consume during execution on L2.
         * @param [transaction.mintValue] The amount of base token that needs to be minted on non-ETH-based L2.
         * @param [transaction.l2Value] `msg.value` of L2 transaction.
         * @param [transaction.factoryDeps] An array of L2 bytecodes that will be marked as known on L2.
         * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
         * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of the
         * base cost of the transaction.
         * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
         * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
         * If the transaction fails, it will also be the address to receive `l2Value`.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
         */
        async getRequestExecuteTx(transaction) {
            var _a;
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const isETHBaseToken = (0, utils_1.isAddressEq)(await bridgehub.baseToken(chainId), utils_1.ETH_ADDRESS_IN_CONTRACTS);
            const { ...tx } = transaction;
            tx.l2Value ?? (tx.l2Value = 0);
            tx.mintValue ?? (tx.mintValue = 0);
            tx.operatorTip ?? (tx.operatorTip = 0);
            tx.factoryDeps ?? (tx.factoryDeps = []);
            tx.overrides ?? (tx.overrides = {});
            (_a = tx.overrides).from ?? (_a.from = await this.getAddress());
            tx.gasPerPubdataByte ?? (tx.gasPerPubdataByte = utils_1.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            tx.refundRecipient ?? (tx.refundRecipient = await this.getAddress());
            tx.l2GasLimit ?? (tx.l2GasLimit = await this._providerL2().estimateL1ToL2Execute(transaction));
            const { contractAddress, mintValue, l2Value, calldata, l2GasLimit, factoryDeps, operatorTip, overrides, gasPerPubdataByte, refundRecipient, } = tx;
            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;
            const baseCost = await this.getBaseCost({
                gasPrice: gasPriceForEstimation,
                gasPerPubdataByte,
                gasLimit: l2GasLimit,
            });
            const l2Costs = baseCost + BigInt(operatorTip) + BigInt(l2Value);
            let providedValue = isETHBaseToken ? overrides.value : mintValue;
            if (providedValue === undefined ||
                providedValue === null ||
                BigInt(providedValue) === 0n) {
                providedValue = l2Costs;
                if (isETHBaseToken)
                    overrides.value = providedValue;
            }
            await (0, utils_1.checkBaseCost)(baseCost, providedValue);
            return await bridgehub.requestL2TransactionDirect.populateTransaction({
                chainId,
                mintValue: providedValue,
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
        /**
         * Returns a provider instance for connecting to an L2 network.
         */
        _providerL2() {
            throw new Error('Must be implemented by the derived class!');
        }
        /**
         * Returns a signer instance used for signing transactions sent to the L2 network.
         */
        _signerL2() {
            throw new Error('Must be implemented by the derived class!');
        }
        /**
         * Returns the balance of the account.
         *
         * @param [token] The token address to query balance for. Defaults to the native token.
         * @param [blockTag='committed'] The block tag to get the balance at.
         */
        async getBalance(token, blockTag = 'committed') {
            return await this._providerL2().getBalance(await this.getAddress(), blockTag, token);
        }
        /**
         * Returns all token balances of the account.
         */
        async getAllBalances() {
            return await this._providerL2().getAllAccountBalances(await this.getAddress());
        }
        /**
         * Returns the deployment nonce of the account.
         */
        async getDeploymentNonce() {
            return await typechain_1.INonceHolder__factory.connect(utils_1.NONCE_HOLDER_ADDRESS, this._signerL2()).getDeploymentNonce(await this.getAddress());
        }
        /**
         * Returns L2 bridge contracts.
         */
        async getL2BridgeContracts() {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                erc20: typechain_1.IL2Bridge__factory.connect(addresses.erc20L2, this._signerL2()),
                weth: typechain_1.IL2Bridge__factory.connect(addresses.wethL2 || addresses.erc20L2, this._signerL2()),
                shared: typechain_1.IL2SharedBridge__factory.connect(addresses.sharedL2, this._signerL2()),
            };
        }
        _fillCustomData(data) {
            const customData = { ...data };
            customData.gasPerPubdata ?? (customData.gasPerPubdata = utils_1.DEFAULT_GAS_PER_PUBDATA_LIMIT);
            customData.factoryDeps ?? (customData.factoryDeps = []);
            return customData;
        }
        /**
         * Initiates the withdrawal process which withdraws ETH or any ERC20 token
         * from the associated account on L2 network to the target account on L1 network.
         *
         * @param transaction Withdrawal transaction request.
         * @param transaction.token The address of the token. Defaults to ETH.
         * @param transaction.amount The amount of the token to withdraw.
         * @param [transaction.to] The address of the recipient on L1.
         * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
         * @param [transaction.paymasterParams] Paymaster parameters.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.
         * @returns A Promise resolving to a withdrawal transaction response.
         */
        async withdraw(transaction) {
            const withdrawTx = await this._providerL2().getWithdrawTx({
                from: await this.getAddress(),
                ...transaction,
            });
            return (await this.sendTransaction(withdrawTx));
        }
        /**
         * Transfer ETH or any ERC20 token within the same interface.
         *
         * @param transaction Transfer transaction request.
         * @param transaction.to The address of the recipient.
         * @param transaction.amount The amount of the token to transfer.
         * @param [transaction.token] The address of the token. Defaults to ETH.
         * @param [transaction.paymasterParams] Paymaster parameters.
         * @param [transaction.overrides] Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.
         * @returns A Promise resolving to a transfer transaction response.
         */
        async transfer(transaction) {
            const transferTx = await this._providerL2().getTransferTx({
                from: await this.getAddress(),
                ...transaction,
            });
            return (await this.sendTransaction(transferTx));
        }
    };
}
exports.AdapterL2 = AdapterL2;
// This method checks if the overrides contain a gasPrice (or maxFeePerGas),
// if not it will insert the maxFeePerGas
async function insertGasPrice(l1Provider, overrides) {
    if (!overrides.gasPrice && !overrides.maxFeePerGas) {
        const l1FeeData = await l1Provider.getFeeData();
        // check if plugin is used to fetch fee data
        const network = await l1Provider.getNetwork();
        const plugin = (network.getPlugin('org.ethers.plugins.network.FetchUrlFeeDataPlugin'));
        if (plugin) {
            overrides.gasPrice = l1FeeData.gasPrice;
            overrides.maxFeePerGas = l1FeeData.maxFeePerGas;
            overrides.maxPriorityFeePerGas = l1FeeData.maxPriorityFeePerGas;
            return;
        }
        // Sometimes baseFeePerGas is not available, so we use gasPrice instead.
        const baseFee = l1FeeData.maxFeePerGas
            ? getBaseCostFromFeeData(l1FeeData)
            : l1FeeData.gasPrice;
        if (!baseFee) {
            throw new Error('Failed to calculate base fee!');
        }
        // ethers.js by default uses multiplication by 2, but since the price for the L2 part
        // will depend on the L1 part, doubling base fee is typically too much.
        overrides.maxFeePerGas =
            (baseFee * 3n) / 2n + (l1FeeData.maxPriorityFeePerGas ?? 0n);
        overrides.maxPriorityFeePerGas = l1FeeData.maxPriorityFeePerGas;
    }
}
function getBaseCostFromFeeData(feeData) {
    const maxFeePerGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    // Reverse the logic implemented in the abstract-provider.ts (line 917)
    return (maxFeePerGas - maxPriorityFeePerGas) / 2n;
}
//# sourceMappingURL=adapters.js.map