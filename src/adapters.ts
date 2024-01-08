import {BigNumber, BigNumberish, BytesLike, ethers} from "ethers";
import {Ierc20__factory as IERC20Factory} from "../typechain/factories/Ierc20__factory";
import {Il1Bridge__factory as IL1BridgeFactory} from "../typechain/factories/Il1Bridge__factory";
import {Il2Bridge__factory as IL2BridgeFactory} from "../typechain/factories/Il2Bridge__factory";
import {IBridgehub__factory as IBridgehubFactory} from "../typechain/factories/IBridgehub__factory";
import {IBridgehub} from "../typechain/IBridgehub";
import {INonceHolder__factory as INonceHolderFactory} from "../typechain/factories/INonceHolder__factory";
import {IStateTransitionChain__factory as IStateTransitionChainFactory} from "../typechain/factories/IStateTransitionChain__factory";
import {IStateTransitionChain} from "../typechain/IStateTransitionChain";
import {Provider} from "./provider";
import {
    Address,
    BalancesMap,
    BlockTag,
    Eip712Meta,
    FullDepositFee,
    PriorityOpResponse,
    TransactionResponse,
} from "./types";
import {
    BOOTLOADER_FORMAL_ADDRESS,
    checkBaseCost,
    DEFAULT_GAS_PER_PUBDATA_LIMIT,
    estimateCustomBridgeDepositL2Gas,
    estimateDefaultBridgeDepositL2Gas,
    ETH_ADDRESS,
    ETH_ADDRESS_IN_CONTRACTS,
    getERC20DefaultBridgeData,
    isETH,
    L1_MESSENGER_ADDRESS,
    L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT,
    L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT,
    layer1TxDefaults,
    NONCE_HOLDER_ADDRESS,
    REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
    scaleGasLimit,
    undoL1ToL2Alias,
} from "./utils";

type Constructor<T = {}> = new (...args: any[]) => T;

interface TxSender {
    sendTransaction(
        tx: ethers.providers.TransactionRequest,
    ): Promise<ethers.providers.TransactionResponse>;

    getAddress(): Promise<Address>;
}

export function AdapterL1<TBase extends Constructor<TxSender>>(Base: TBase) {
    return class Adapter extends Base {
        _providerL2(): Provider {
            throw new Error("Must be implemented by the derived class!");
        }

        _providerL1(): ethers.providers.Provider {
            throw new Error("Must be implemented by the derived class!");
        }

        _signerL1(): ethers.Signer {
            throw new Error("Must be implemented by the derived class!");
        }

        async getMainContract(): Promise<IStateTransitionChain> {
            const address = await this._providerL2().getMainContractAddress();
            return IStateTransitionChainFactory.connect(address, this._signerL1());
        }

        async getBridgehubContract(): Promise<IBridgehub> {
            const address = await this._providerL2().getBridgehubContractAddress();
            return IBridgehubFactory.connect(address, this._signerL1());
        }

        async getL1BridgeContracts() {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                erc20: IL1BridgeFactory.connect(addresses.erc20L1, this._signerL1()),
                weth: IL1BridgeFactory.connect(addresses.wethL1, this._signerL1()),
            };
        }

        async getBalanceL1(token?: Address, blockTag?: ethers.providers.BlockTag): Promise<BigNumber> {
            token ??= ETH_ADDRESS;
            if (isETH(token)) {
                return await this._providerL1().getBalance(await this.getAddress(), blockTag);
            } else {
                const erc20contract = IERC20Factory.connect(token, this._providerL1());
                return await erc20contract.balanceOf(await this.getAddress());
            }
        }

        async getAllowanceL1(
            token: Address,
            bridgeAddress?: Address,
            blockTag?: ethers.providers.BlockTag,
        ): Promise<BigNumber> {
            if (!bridgeAddress) {
                const bridgeContracts = await this.getL1BridgeContracts();
                let l2WethToken = ethers.constants.AddressZero;
                try {
                    l2WethToken = await bridgeContracts.weth.l2TokenAddress(token);
                } catch (e) {
                }

                // If the token is Wrapped Ether, return allowance to its own bridge, otherwise to the default ERC20 bridge.
                bridgeAddress =
                    l2WethToken != ethers.constants.AddressZero
                        ? bridgeContracts.weth.address
                        : bridgeContracts.erc20.address;
            }

            const erc20contract = IERC20Factory.connect(token, this._providerL1());
            return await erc20contract.allowance(await this.getAddress(), bridgeAddress, {
                blockTag,
            });
        }

        async l2TokenAddress(token: Address) {
            if (token == ETH_ADDRESS) {
                return ETH_ADDRESS;
            }

            const bridgeContracts = await this.getL1BridgeContracts();
            try {
                const l2WethToken = await bridgeContracts.weth.l2TokenAddress(token);
                // If the token is Wrapped Ether, return its L2 token address.
                if (l2WethToken != ethers.constants.AddressZero) {
                    return l2WethToken;
                }
            } catch (e) {
            }
            return await bridgeContracts.erc20.l2TokenAddress(token);
        }

        async approveERC20(
            token: Address,
            amount: BigNumberish,
            overrides?: ethers.Overrides & { bridgeAddress?: Address },
        ): Promise<ethers.providers.TransactionResponse> {
            if (isETH(token)) {
                throw new Error(
                    "ETH token can't be approved. The address of the token does not exist on L1.",
                );
            }

            let bridgeAddress = overrides?.bridgeAddress;
            const erc20contract = IERC20Factory.connect(token, this._signerL1());

            if (bridgeAddress == null) {
                const bridgeContracts = await this.getL1BridgeContracts();
                let l2WethToken = ethers.constants.AddressZero;
                try {
                    l2WethToken = await bridgeContracts.weth.l2TokenAddress(token);
                } catch (e) {
                }
                // If the token is Wrapped Ether, return corresponding bridge, otherwise return default ERC20 bridge
                bridgeAddress =
                    l2WethToken != ethers.constants.AddressZero
                        ? bridgeContracts.weth.address
                        : bridgeContracts.erc20.address;
            } else {
                delete overrides.bridgeAddress;
            }

            overrides ??= {};

            return await erc20contract.approve(bridgeAddress, amount, overrides);
        }

        async getBaseCost(params: {
            gasLimit: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            gasPrice?: BigNumberish;
        }): Promise<BigNumber> {
            const bridgehub = await this.getBridgehubContract();
            const parameters = {...layer1TxDefaults(), ...params};
            parameters.gasPrice ??= await this._providerL1().getGasPrice();
            parameters.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;

            return BigNumber.from(
                await bridgehub.l2TransactionBaseCost(
                    (await this._providerL2().getNetwork()).chainId,
                    parameters.gasPrice,
                    parameters.gasLimit,
                    parameters.gasPerPubdataByte,
                ),
            );
        }

        async deposit(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            approveERC20?: boolean;
            approveBaseERC20?: boolean;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
            approveOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse> {
            const depositTx = await this.getDepositTx(transaction);
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const baseTokenBridge = await bridgehub.baseTokenBridge(chainId);
            const bridgeContracts = await this.getL1BridgeContracts();

            if ((transaction.token == ETH_ADDRESS) && (baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS)) {
                const baseGasLimit = await this.estimateGasRequestExecute(depositTx);
                const gasLimit = scaleGasLimit(baseGasLimit);

                depositTx.overrides ??= {};
                depositTx.overrides.gasLimit ??= gasLimit;

                return this.requestExecute(depositTx);
            } else if (baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS) {
                if (transaction.approveERC20) {
                    let l2WethToken = ethers.constants.AddressZero;
                    try {
                        l2WethToken = await bridgeContracts.weth.l2TokenAddress(transaction.token);
                    } catch (e) {
                    }
                    // If the token is Wrapped Ether, use its bridge.
                    const proposedBridge =
                        l2WethToken != ethers.constants.AddressZero
                            ? bridgeContracts.weth.address
                            : bridgeContracts.erc20.address;
                    const bridgeAddress = transaction.bridgeAddress
                        ? transaction.bridgeAddress
                        : proposedBridge;

                    // We only request the allowance if the current one is not enough.
                    const allowance = await this.getAllowanceL1(transaction.token, bridgeAddress);
                    if (allowance.lt(transaction.amount)) {
                        const approveTx = await this.approveERC20(
                            transaction.token,
                            transaction.amount,
                            {
                                bridgeAddress,
                                ...transaction.approveOverrides,
                            },
                        );
                        await approveTx.wait();
                    }
                }

                const baseGasLimit = await this._providerL1().estimateGas(depositTx);
                const gasLimit = scaleGasLimit(baseGasLimit);

                depositTx.gasLimit ??= gasLimit;

                return await this._providerL2().getPriorityOpResponse(
                    await this._signerL1().sendTransaction(depositTx),
                );
            } else if (transaction.token == ETH_ADDRESS) {
                const mintValue = parseInt(depositTx.data.slice(2+8+3*64, 2+8+4*64), 16);
                // we are depositing eth into a non-eth based chain. We go through the weth bridge. 
                if (transaction.approveBaseERC20) {
                    // We only request the allowance if the current one is not enough.
                    const allowance = await this.getAllowanceL1(baseTokenAddress, baseTokenBridge);
                    if (allowance.lt(mintValue)) {
                        const approveTx = await this.approveERC20(
                            baseTokenAddress,
                            mintValue,
                            {
                                bridgeAddress: baseTokenBridge,
                                ...transaction.approveOverrides,
                            },
                        );
                        await approveTx.wait();
                    }
                }
                
                const baseGasLimit = await this._providerL1().estimateGas(depositTx);
                const gasLimit = scaleGasLimit(baseGasLimit);

                depositTx.gasLimit ??= gasLimit;

                return await this._providerL2().getPriorityOpResponse(
                    await this._signerL1().sendTransaction(depositTx),
                );

            } else if (transaction.token == baseTokenAddress) {
                const mintValue = depositTx.mintValue;
                // we are bridging the base token to a non-eth based chain. We go through the bridgehub, and give approval
                if ((transaction.approveERC20) || (transaction.approveBaseERC20)) {
                    // We only request the allowance if the current one is not enough.
                    const allowance = await this.getAllowanceL1(baseTokenAddress, baseTokenBridge);
                    if (allowance.lt(mintValue)) {
                        const approveTx = await this.approveERC20(
                            baseTokenAddress,
                            mintValue,
                            {
                                bridgeAddress: baseTokenBridge,
                                ...transaction.approveOverrides,
                            },
                        );
                        await approveTx.wait();
                    }
                }
                const baseGasLimit = await this.estimateGasRequestExecute(depositTx);
                const gasLimit = scaleGasLimit(baseGasLimit);

                depositTx.overrides ??= {};
                depositTx.overrides.gasLimit ??= gasLimit;

                return this.requestExecute(depositTx);
            } else {
                const mintValue = parseInt(depositTx.data.slice(2+8+3*64, 2+8+4*64), 16);
                // we are depositing a non-eth and non-base token to a non-eth based chain. We go through the bridgehub, and give approval for both tokens
                if (transaction.approveERC20) {
                    let l2WethToken = ethers.constants.AddressZero;
                    try {
                        l2WethToken = await bridgeContracts.weth.l2TokenAddress(transaction.token);
                    } catch (e) {}
                    // If the token is Wrapped Ether, use its bridge.
                    const proposedBridge =
                        l2WethToken != ethers.constants.AddressZero
                            ? bridgeContracts.weth.address
                            : bridgeContracts.erc20.address;
                    const bridgeAddress = transaction.bridgeAddress
                        ? transaction.bridgeAddress
                        : proposedBridge;

                    // We only request the allowance if the current one is not enough.
                    const allowance = await this.getAllowanceL1(transaction.token, bridgeAddress);
                    if (allowance.lt(transaction.amount)) {
                        const approveTx = await this.approveERC20(
                            transaction.token,
                            transaction.amount,
                            {
                                bridgeAddress,
                                ...transaction.approveOverrides,
                            },
                        );
                        await approveTx.wait();
                    }
                }
                if (transaction.approveBaseERC20) {
                    // We only request the allowance if the current one is not enough.
                    const allowance = await this.getAllowanceL1(baseTokenAddress, baseTokenBridge);
                    if (allowance.lt(mintValue)) {
                        const approveTx = await this.approveERC20(
                            baseTokenAddress,
                            mintValue,
                            {
                                bridgeAddress: baseTokenBridge,
                                ...transaction.approveOverrides,
                            },
                        );
                        await approveTx.wait();
                    }
                }
                
                const baseGasLimit = await this._providerL1().estimateGas(depositTx);
                const gasLimit = scaleGasLimit(baseGasLimit);

                depositTx.gasLimit ??= gasLimit;

                return await this._providerL2().getPriorityOpResponse(
                    await this._signerL1().sendTransaction(depositTx),
                );
            }
        }

        async estimateGasDeposit(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            customBridgeData?: BytesLike;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.BigNumber> {
            const depositTx = await this.getDepositTx(transaction);

            let baseGasLimit: BigNumber;
            if (transaction.token == ETH_ADDRESS) {
                baseGasLimit = await this.estimateGasRequestExecute(depositTx);
            } else {
                baseGasLimit = await this._providerL1().estimateGas(depositTx);
            }

            return scaleGasLimit(baseGasLimit);
        }

        async getDepositTx(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            operatorTip?: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<any> {
            const bridgeContracts = await this.getL1BridgeContracts();
            if (transaction.bridgeAddress != null) {
                bridgeContracts.erc20 = bridgeContracts.erc20.attach(transaction.bridgeAddress);
            }

            const {...tx} = transaction;
            tx.to ??= await this.getAddress();
            tx.operatorTip ??= BigNumber.from(0);
            tx.overrides ??= {};
            tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
            if (tx.bridgeAddress != null) {
                const customBridgeData =
                    tx.customBridgeData ?? bridgeContracts.weth.address == tx.bridgeAddress
                        ? "0x"
                        : await getERC20DefaultBridgeData(tx.token, this._providerL1());
                const bridge = IL1BridgeFactory.connect(tx.bridgeAddress, this._signerL1());
                const l2Address = await bridge.l2Bridge();
                tx.l2GasLimit ??= await estimateCustomBridgeDepositL2Gas(
                    this._providerL2(),
                    tx.bridgeAddress,
                    l2Address,
                    tx.token,
                    tx.amount,
                    tx.to,
                    customBridgeData,
                    await this.getAddress(),
                    tx.gasPerPubdataByte,
                );
            } else {
                tx.l2GasLimit ??= await estimateDefaultBridgeDepositL2Gas(
                    this._providerL1(),
                    this._providerL2(),
                    tx.token,
                    tx.amount,
                    tx.to,
                    await this.getAddress(),
                    tx.gasPerPubdataByte,
                );
            }

            const {to, token, amount, operatorTip, overrides} = tx;

            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;

            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);

            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                await gasPriceForEstimation,
                tx.l2GasLimit,
                tx.gasPerPubdataByte,
            );

            if ((token == ETH_ADDRESS) && (baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS)) {
                // we are depositing Eth to an Eth based chain
                overrides.value ??= baseCost.add(operatorTip).add(amount);

                return {
                    contractAddress: to,
                    calldata: "0x",
                    mintValue: overrides.value,
                    l2Value: amount,
                    // For some reason typescript can not deduce that we've already set the
                    // tx.l2GasLimit
                    l2GasLimit: tx.l2GasLimit!,
                    ...tx,
                };
            } else if (baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS) {
                // we are depositing some token to an Eth based chain
                overrides.value ??= baseCost.add(operatorTip);
                await checkBaseCost(baseCost, overrides.value);

                let refundRecipient = tx.refundRecipient ?? ethers.constants.AddressZero;
                const args: [BigNumberish, Address, Address, BigNumberish, BigNumberish, BigNumberish, BigNumberish, Address] = [
                    (await this._providerL2().getNetwork()).chainId,
                    to,
                    token,
                    await overrides.value, // TODO CHANGE THIS
                    amount,
                    tx.l2GasLimit,
                    tx.gasPerPubdataByte,
                    refundRecipient,
                ];

                // check if we're depositing weth
                let l2WethToken = ethers.constants.AddressZero;
                try {
                    l2WethToken = await bridgeContracts.weth.l2TokenAddress(tx.token);
                } catch (e) {}

                const bridge =
                    l2WethToken != ethers.constants.AddressZero
                        ? bridgeContracts.weth
                        : bridgeContracts.erc20;
                return await bridge.populateTransaction.deposit(...args, overrides);
            } else if (token == ETH_ADDRESS) {
                // we are depositing eth into a non-eth based chain. We go through the weth bridge. 
                overrides.value ??= amount;
                await checkBaseCost(baseCost, baseCost.add(operatorTip)); // this is base token, not eth

                let refundRecipient = tx.refundRecipient ?? ethers.constants.AddressZero;
                const args: [BigNumberish, Address, Address, BigNumberish, BigNumberish, BigNumberish, BigNumberish, Address] = [
                    (await this._providerL2().getNetwork()).chainId,
                    to,
                    ETH_ADDRESS_IN_CONTRACTS,
                    baseCost.add(operatorTip), // of the base token, not eth
                    0, // amount of weth deposited is 0, eth is in msg.value
                    tx.l2GasLimit,
                    tx.gasPerPubdataByte,
                    refundRecipient,
                ];

                return await bridgeContracts.weth.populateTransaction.deposit(...args, overrides);
            } else if (token == baseTokenAddress){
                overrides.value ??= 0;
                // we are bridging the base token to a non-eth based chain. We go through the bridgehub
                return {
                    contractAddress: to,
                    calldata: "0x",
                    mintValue: baseCost.add(operatorTip).add(amount),
                    l2Value: amount,
                    // For some reason typescript can not deduce that we've already set the
                    // tx.l2GasLimit
                    l2GasLimit: tx.l2GasLimit!,
                    ...tx,
                };
            } else {
                // we are bridging not eth and not the base token to a non-eth based chain
                let mintValue = baseCost.add(operatorTip);
                await checkBaseCost(baseCost, mintValue);
                overrides.value ??= 0;

                let refundRecipient = tx.refundRecipient ?? ethers.constants.AddressZero;
                const args: [BigNumberish, Address, Address, BigNumberish, BigNumberish, BigNumberish, BigNumberish, Address] = [
                    (await this._providerL2().getNetwork()).chainId,
                    to,
                    token,
                    mintValue,
                    amount,
                    tx.l2GasLimit,
                    tx.gasPerPubdataByte,
                    refundRecipient,
                ];

                // check if we're depositing weth
                let l2WethToken = ethers.constants.AddressZero;
                try {
                    l2WethToken = await bridgeContracts.weth.l2TokenAddress(tx.token);
                } catch (e) {
                }

                const bridge =
                    l2WethToken != ethers.constants.AddressZero
                        ? bridgeContracts.weth
                        : bridgeContracts.erc20;
                return await bridge.populateTransaction.deposit(...args, overrides);
            }
        }

        // Retrieves the full needed ETH fee for the deposit.
        // Returns the L1 fee and the L2 fee.
        async getFullRequiredDepositFee(transaction: {
            token: Address;
            to?: Address;
            bridgeAddress?: Address;
            customBridgeData?: BytesLike;
            gasPerPubdataByte?: BigNumberish;
            overrides?: ethers.PayableOverrides;
        }): Promise<FullDepositFee> {
            // It is assumed that the L2 fee for the transaction does not depend on its value.
            const dummyAmount = "1";

            const {...tx} = transaction;
            const bridgehub = await this.getBridgehubContract();

            tx.overrides ??= {};
            await insertGasPrice(this._providerL1(), tx.overrides);
            const gasPriceForMessages =
                (await tx.overrides.maxFeePerGas) || (await tx.overrides.gasPrice);

            tx.to ??= await this.getAddress();
            tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;

            let l2GasLimit = null;
            if (tx.bridgeAddress != null) {
                const bridgeContracts = await this.getL1BridgeContracts();
                const customBridgeData =
                    tx.customBridgeData ?? bridgeContracts.weth.address == tx.bridgeAddress
                        ? "0x"
                        : await getERC20DefaultBridgeData(tx.token, this._providerL1());
                let bridge = IL1BridgeFactory.connect(tx.bridgeAddress, this._signerL1());
                let l2Address = await bridge.l2Bridge();
                l2GasLimit ??= await estimateCustomBridgeDepositL2Gas(
                    this._providerL2(),
                    tx.bridgeAddress,
                    l2Address,
                    tx.token,
                    dummyAmount,
                    tx.to,
                    customBridgeData,
                    await this.getAddress(),
                    tx.gasPerPubdataByte,
                );
            } else {
                l2GasLimit ??= await estimateDefaultBridgeDepositL2Gas(
                    this._providerL1(),
                    this._providerL2(),
                    tx.token,
                    dummyAmount,
                    tx.to,
                    await this.getAddress(),
                    tx.gasPerPubdataByte,
                );
            }

            const baseCost = await bridgehub.l2TransactionBaseCost(
                (await this._providerL2().getNetwork()).chainId,
                gasPriceForMessages,
                l2GasLimit,
                tx.gasPerPubdataByte,
            );

            const selfBalanceETH = await this.getBalanceL1();

            // We could use 0, because the final fee will anyway be bigger than
            if (baseCost.gte(selfBalanceETH.add(dummyAmount))) {
                const recommendedETHBalance = BigNumber.from(
                    tx.token == ETH_ADDRESS
                        ? L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT
                        : L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT,
                )
                    .mul(gasPriceForMessages)
                    .add(baseCost);
                const formattedRecommendedBalance = ethers.utils.formatEther(recommendedETHBalance);
                throw new Error(
                    `Not enough balance for deposit. Under the provided gas price, the recommended balance to perform a deposit is ${formattedRecommendedBalance} ETH`,
                );
            }

            // For ETH token the value that the user passes to the estimation is the one which has the
            // value for the L2 commission substracted.
            let amountForEstimate: BigNumber;
            if (isETH(tx.token)) {
                amountForEstimate = BigNumber.from(dummyAmount);
            } else {
                amountForEstimate = BigNumber.from(dummyAmount);

                if ((await this.getAllowanceL1(tx.token)) < amountForEstimate) {
                    throw new Error("Not enough allowance to cover the deposit");
                }
            }

            // Deleting the explicit gas limits in the fee estimation
            // in order to prevent the situation where the transaction
            // fails because the user does not have enough balance
            const estimationOverrides = {...tx.overrides};
            delete estimationOverrides.gasPrice;
            delete estimationOverrides.maxFeePerGas;
            delete estimationOverrides.maxPriorityFeePerGas;

            const l1GasLimit = await this.estimateGasDeposit({
                ...tx,
                amount: amountForEstimate,
                overrides: estimationOverrides,
                l2GasLimit,
            });

            const fullCost: FullDepositFee = {
                baseCost,
                l1GasLimit,
                l2GasLimit,
            };

            if (tx.overrides.gasPrice) {
                fullCost.gasPrice = BigNumber.from(await tx.overrides.gasPrice);
            } else {
                fullCost.maxFeePerGas = BigNumber.from(await tx.overrides.maxFeePerGas);
                fullCost.maxPriorityFeePerGas = BigNumber.from(await tx.overrides.maxPriorityFeePerGas);
            }

            return fullCost;
        }

        async getPriorityOpConfirmation(txHash: string, index: number = 0){
            return this._providerL2().getPriorityOpConfirmation(txHash, index);
        }

        async _getWithdrawalLog(withdrawalHash: BytesLike, index: number = 0) {
            const hash = ethers.utils.hexlify(withdrawalHash);
            const receipt = await this._providerL2().getTransactionReceipt(hash);
            const log = receipt.logs.filter(
                (log) =>
                    log.address == L1_MESSENGER_ADDRESS &&
                    log.topics[0] == ethers.utils.id("L1MessageSent(address,bytes32,bytes)"),
            )[index];

            return {
                log,
                l1BatchTxId: receipt.l1BatchTxIndex,
            };
        }

        async _getWithdrawalL2ToL1Log(withdrawalHash: BytesLike, index: number = 0) {
            const hash = ethers.utils.hexlify(withdrawalHash);
            const receipt = await this._providerL2().getTransactionReceipt(hash);
            const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(
                ([_, log]) => log.sender == L1_MESSENGER_ADDRESS,
            );
            const [l2ToL1LogIndex, l2ToL1Log] = messages[index];

            return {
                l2ToL1LogIndex,
                l2ToL1Log,
            };
        }

        async finalizeWithdrawalParams(withdrawalHash: BytesLike, index: number = 0) {
            const {log, l1BatchTxId} = await this._getWithdrawalLog(withdrawalHash, index);
            const {l2ToL1LogIndex} = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers.utils.hexDataSlice(log.topics[1], 12);
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);
            const message = ethers.utils.defaultAbiCoder.decode(["bytes"], log.data)[0];
            return {
                l1BatchNumber: log.l1BatchNumber,
                l2MessageIndex: proof.id,
                l2TxNumberInBlock: l1BatchTxId,
                message,
                sender,
                proof: proof.proof,
            };
        }

        async finalizeWithdrawal(
            withdrawalHash: BytesLike,
            index: number = 0,
            overrides?: ethers.Overrides,
        ) {
            const {l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, sender, proof} =
                await this.finalizeWithdrawalParams(withdrawalHash, index);

            if (isETH(sender)) {
                const withdrawTo = ethers.utils.hexDataSlice(message, 4, 24);
                const l1Bridges = await this.getL1BridgeContracts();
                // If the destination address matches the address of the L1 WETH contract,
                // the withdrawal request is processed through the WETH bridge.
                if (withdrawTo.toLowerCase() == l1Bridges.weth.address.toLowerCase()) {
                    return await l1Bridges.weth.finalizeWithdrawal(
                        (await this._providerL2().getNetwork()).chainId,
                        l1BatchNumber,
                        l2MessageIndex,
                        l2TxNumberInBlock,
                        message,
                        proof,
                        overrides ?? {},
                    );
                }

                const contractAddress = await this._providerL2().getBridgehubContractAddress();
                const bridgehub = IBridgehubFactory.connect(contractAddress, this._signerL1());
                const wethBridge = IL1BridgeFactory.connect(await bridgehub.wethBridge(), this._signerL1());

                return await wethBridge.finalizeWithdrawal(
                    (await this._providerL2().getNetwork()).chainId,
                    l1BatchNumber,
                    l2MessageIndex,
                    l2TxNumberInBlock,
                    message,
                    proof,
                    overrides ?? {},
                );
            }

            const l2Bridge = IL2BridgeFactory.connect(sender, this._providerL2());
            const l1Bridge = IL1BridgeFactory.connect(await l2Bridge.l1Bridge(), this._signerL1());
            return await l1Bridge.finalizeWithdrawal(
                (await this._providerL2().getNetwork()).chainId,
                l1BatchNumber,
                l2MessageIndex,
                l2TxNumberInBlock,
                message,
                proof,
                overrides ?? {},
            );
        }

        async isWithdrawalFinalized(withdrawalHash: BytesLike, index: number = 0) {
            const {log} = await this._getWithdrawalLog(withdrawalHash, index);
            const {l2ToL1LogIndex} = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers.utils.hexDataSlice(log.topics[1], 12);
            // `getLogProof` is called not to get proof but
            // to get the index of the corresponding L2->L1 log,
            // which is returned as `proof.id`.
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);

            const chainId = (await this._providerL2().getNetwork()).chainId;
            if (isETH(sender)) {
                const contractAddress = await this._providerL2().getBridgehubContractAddress();
                const bridgehub = IBridgehubFactory.connect(contractAddress, this._signerL1());

                return await bridgehub.isEthWithdrawalFinalized(chainId, log.l1BatchNumber, proof.id);
            }

            const l2Bridge = IL2BridgeFactory.connect(sender, this._providerL2());
            const l1Bridge = IL1BridgeFactory.connect(await l2Bridge.l1Bridge(), this._providerL1());

            return await l1Bridge.isWithdrawalFinalized(chainId, log.l1BatchNumber, proof.id);
        }

        async claimFailedDeposit(depositHash: BytesLike, overrides?: ethers.Overrides) {
            const receipt = await this._providerL2().getTransactionReceipt(
                ethers.utils.hexlify(depositHash),
            );
            const successL2ToL1LogIndex = receipt.l2ToL1Logs.findIndex(
                (l2ToL1log) =>
                    l2ToL1log.sender == BOOTLOADER_FORMAL_ADDRESS && l2ToL1log.key == depositHash,
            );
            const successL2ToL1Log = receipt.l2ToL1Logs[successL2ToL1LogIndex];
            if (successL2ToL1Log.value != ethers.constants.HashZero) {
                throw new Error("Cannot claim successful deposit");
            }

            const tx = await this._providerL2().getTransaction(ethers.utils.hexlify(depositHash));

            // Undo the aliasing, since the Mailbox contract set it as for contract address.
            const l1BridgeAddress = undoL1ToL2Alias(receipt.from);
            const l2BridgeAddress = receipt.to;

            const l1Bridge = IL1BridgeFactory.connect(l1BridgeAddress, this._signerL1());
            const l2Bridge = IL2BridgeFactory.connect(l2BridgeAddress, this._providerL2());

            const calldata = l2Bridge.interface.decodeFunctionData("finalizeDeposit", tx.data);

            const proof = await this._providerL2().getLogProof(depositHash, successL2ToL1LogIndex);
            return await l1Bridge.claimFailedDeposit(
                (await this._providerL2().getNetwork()).chainId,
                calldata["_l1Sender"],
                calldata["_l1Token"],
                depositHash,
                receipt.l1BatchNumber,
                proof.id,
                receipt.l1BatchTxIndex,
                proof.proof,
                overrides ?? {},
            );
        }

        async requestExecute(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<PriorityOpResponse> {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);
            return this._providerL2().getPriorityOpResponse(
                await this._signerL1().sendTransaction(requestExecuteTx),
            );
        }

        async estimateGasRequestExecute(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.BigNumber> {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);

            delete requestExecuteTx.gasPrice;
            delete requestExecuteTx.maxFeePerGas;
            delete requestExecuteTx.maxPriorityFeePerGas;

            return this._providerL1().estimateGas(requestExecuteTx);
        }

        async getRequestExecuteTx(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            payer?: Address;
            l2GasLimit?: BigNumberish;
            mintValue?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<ethers.PopulatedTransaction> {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const ethIsBaseToken = (await bridgehub.baseToken(chainId) == ETH_ADDRESS_IN_CONTRACTS);

            const {...tx} = transaction;
            tx.l2Value ??= BigNumber.from(0);
            tx.payer ??= await this.getAddress();
            tx.mintValue ??= BigNumber.from(0);
            tx.operatorTip ??= BigNumber.from(0);
            tx.factoryDeps ??= [];
            tx.overrides ??= {};
            tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
            tx.refundRecipient ??= await this.getAddress();
            tx.l2GasLimit ??= await this._providerL2().estimateL1ToL2Execute(transaction);

            const {
                contractAddress,
                payer,
                mintValue,
                l2Value,
                calldata,
                l2GasLimit,
                factoryDeps,
                operatorTip,
                overrides,
                gasPerPubdataByte,
                refundRecipient,
            } = tx;

            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = overrides.maxFeePerGas || overrides.gasPrice;

            const baseCost = await this.getBaseCost({
                gasPrice: await gasPriceForEstimation,
                gasPerPubdataByte,
                gasLimit: l2GasLimit,
            });

            overrides.value ??= baseCost.add(operatorTip).add(l2Value);

            await checkBaseCost(baseCost, ethIsBaseToken? overrides.value : mintValue);

            return await bridgehub.populateTransaction.requestL2Transaction({
                    chainId,
                    payer: payer,
                    l2Contract: contractAddress,
                    mintValue: mintValue,
                    l2Value: l2Value,
                    l2Calldata: calldata,
                    l2GasLimit: l2GasLimit,
                    l2GasPerPubdataByteLimit: REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
                    factoryDeps: factoryDeps,
                    refundRecipient: refundRecipient,
                },
                overrides,
            );
        }
    };
}

export function AdapterL2<TBase extends Constructor<TxSender>>(Base: TBase) {
    return class Adapter extends Base {
        _providerL2(): Provider {
            throw new Error("Must be implemented by the derived class!");
        }

        _signerL2(): ethers.Signer {
            throw new Error("Must be implemented by the derived class!");
        }

        async getBalance(token?: Address, blockTag: BlockTag = "committed") {
            return await this._providerL2().getBalance(await this.getAddress(), blockTag, token);
        }

        async getAllBalances(): Promise<BalancesMap> {
            return await this._providerL2().getAllAccountBalances(await this.getAddress());
        }

        async getDeploymentNonce(): Promise<BigNumber> {
            return await INonceHolderFactory.connect(
                NONCE_HOLDER_ADDRESS,
                this._signerL2(),
            ).getDeploymentNonce(await this.getAddress());
        }

        async getL2BridgeContracts() {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                erc20: IL2BridgeFactory.connect(addresses.erc20L2, this._signerL2()),
                weth: IL2BridgeFactory.connect(addresses.wethL2, this._signerL2()),
            };
        }

        _fillCustomData(data: Eip712Meta): Eip712Meta {
            const customData = {...data};
            customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;
            customData.factoryDeps ??= [];
            return customData;
        }

        async withdraw(transaction: {
            token: Address;
            amount: BigNumberish;
            to?: Address;
            bridgeAddress?: Address;
            overrides?: ethers.Overrides;
        }): Promise<TransactionResponse> {
            const withdrawTx = await this._providerL2().getWithdrawTx({
                from: await this.getAddress(),
                ...transaction,
            });
            const txResponse = await this.sendTransaction(withdrawTx);
            return this._providerL2()._wrapTransaction(txResponse);
        }

        async transfer(transaction: {
            to: Address;
            amount: BigNumberish;
            token?: Address;
            overrides?: ethers.Overrides;
        }): Promise<TransactionResponse> {
            const transferTx = await this._providerL2().getTransferTx({
                from: await this.getAddress(),
                ...transaction,
            });
            const txResponse = await this.sendTransaction(transferTx);
            return this._providerL2()._wrapTransaction(txResponse);
        }
    };
}

/// @dev This method checks if the overrides contain a gasPrice (or maxFeePerGas), if not it will insert
/// the maxFeePerGas
async function insertGasPrice(
    l1Provider: ethers.providers.Provider,
    overrides: ethers.PayableOverrides,
) {
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
