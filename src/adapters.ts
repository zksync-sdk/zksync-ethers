import {BigNumber, BigNumberish, BytesLike, ethers, utils} from "ethers";
import { Ierc20Factory } from "../typechain/Ierc20Factory";
import { Il1BridgeFactory } from "../typechain/Il1BridgeFactory";
import { Il2BridgeFactory } from "../typechain/Il2BridgeFactory";
import { Il2Bridge } from "../typechain/Il2Bridge";
import { IBridgehubFactory } from "../typechain/IBridgehubFactory";
import { IBridgehub } from "../typechain/IBridgehub";
import { Il1Bridge } from "../typechain/Il1Bridge";
import { Il1SharedBridge } from "../typechain/Il1SharedBridge";
import { Il1SharedBridgeFactory } from "../typechain/Il1SharedBridgeFactory";
import { INonceHolderFactory } from "../typechain/INonceHolderFactory";
import { IZkSyncStateTransitionFactory } from "../typechain/IZkSyncStateTransitionFactory";
import { IZkSyncStateTransition } from "../typechain/IZkSyncStateTransition";
import { Provider } from "./provider";
import {
    Address,
    BalancesMap,
    BlockTag,
    Eip712Meta,
    FinalizeWithdrawalParams,
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
    LEGACY_ETH_ADDRESS,
    ETH_ADDRESS_IN_CONTRACTS,
    L2_BASE_TOKEN_ADDRESS,
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

        async getMainContract(): Promise<IZkSyncStateTransition> {
            const address = await this._providerL2().getMainContractAddress();
            return IZkSyncStateTransitionFactory.connect(address, this._signerL1());
        }

        async getBridgehubContract(): Promise<IBridgehub> {
            const address = await this._providerL2().getBridgehubContractAddress();
            return IBridgehubFactory.connect(address, this._signerL1());
        }

        async getL1BridgeContracts(): Promise<{
            erc20: Il1Bridge;
            shared: Il1SharedBridge;
        }> {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                erc20: Il1BridgeFactory.connect(addresses.erc20L1, this._signerL1()),
                shared: Il1SharedBridgeFactory.connect(addresses.sharedL1, this._signerL1()),
            };
        }

        async getBaseToken(): Promise<string> {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            return await bridgehub.baseToken(chainId);
        }

        async isETHBasedChain(): Promise<boolean> {
            return this._providerL2().isETHBasedChain();
        }

        async getBalanceL1(token?: Address, blockTag?: ethers.providers.BlockTag): Promise<BigNumber> {
            token ??= LEGACY_ETH_ADDRESS;
            if (isETH(token)) {
                return await this._providerL1().getBalance(await this.getAddress(), blockTag);
            } else {
                const erc20contract = Ierc20Factory.connect(token, this._providerL1());
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
                bridgeAddress = bridgeContracts.shared.address;
            }

            const erc20contract = Ierc20Factory.connect(token, this._providerL1());
            return await erc20contract.allowance(await this.getAddress(), bridgeAddress, {
                blockTag,
            });
        }

        async l2TokenAddress(token: Address): Promise<string> {
            return this._providerL2().l2TokenAddress(token);
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
            const erc20contract = Ierc20Factory.connect(token, this._signerL1());
            const baseToken = await this.getBaseToken();
            const isETHBasedChain = await this.isETHBasedChain();

            if (bridgeAddress == null) {
                if (!isETHBasedChain && token == baseToken) {
                    bridgeAddress = await (await this.getBridgehubContract()).sharedBridge();
                } else {
                    const bridgeContracts = await this.getL1BridgeContracts();
                    bridgeAddress = bridgeContracts.shared.address;
                }
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
            const parameters = { ...layer1TxDefaults(), ...params };
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

        // Returns the parameters for the approval token transaction based on the deposit token and amount.
        // Some deposit transactions require multiple approvals. Existing allowance for the bridge is not checked;
        // allowance is calculated solely based on the specified amount.
        async getDepositAllowanceParams(
            token: Address,
            amount: BigNumberish,
        ): Promise<{ token: Address; allowance: BigNumberish }[]> {
            if (token == LEGACY_ETH_ADDRESS) {
                token = ETH_ADDRESS_IN_CONTRACTS;
            }
            const baseTokenAddress = await this.getBaseToken();
            const isETHBasedChain = await this.isETHBasedChain();

            if (isETHBasedChain && token == LEGACY_ETH_ADDRESS) {
                throw new Error(
                    "ETH token can't be approved. The address of the token does not exist on L1.",
                );
            } else if (baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS) {
                return [{ token, allowance: amount }];
            } else if (token == LEGACY_ETH_ADDRESS) {
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (await this._getDepositETHOnNonETHBasedChainTx({ token, amount }))
                            .mintValue,
                    },
                ];
            } else if (token == baseTokenAddress) {
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (
                            await this._getDepositBaseTokenOnNonETHBasedChainTx({ token, amount })
                        ).mintValue,
                    },
                ];
            } else {
                // A deposit of a non-base token to a non-ETH-based chain requires two approvals.
                return [
                    {
                        token: baseTokenAddress,
                        allowance: (
                            await this._getDepositNonBaseTokenToNonETHBasedChainTx({ token, amount })
                        ).mintValue,
                    },
                    {
                        token: token,
                        allowance: amount,
                    },
                ];
            }
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
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse> {
            if (transaction.token == LEGACY_ETH_ADDRESS) {
                transaction.token = ETH_ADDRESS_IN_CONTRACTS;
            }
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS;

            if (isETHBasedChain && transaction.token == ETH_ADDRESS_IN_CONTRACTS) {
                return await this._depositETHToETHBasedChain(transaction);
            } else if (baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS) {
                return await this._depositTokenToETHBasedChain(transaction);
            } else if (transaction.token == ETH_ADDRESS_IN_CONTRACTS) {
                return await this._depositETHToNonETHBasedChain(transaction);
            } else if (transaction.token == baseTokenAddress) {
                return await this._depositBaseTokenToNonETHBasedChain(transaction);
            } else {
                return await this._depositNonBaseTokenToNonETHBasedChain(transaction);
            }
        }

        async _depositNonBaseTokenToNonETHBasedChain(transaction: {
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
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse> {
            // Deposit a non-ETH and non-base token to a non-ETH-based chain.
            // Go through the BridgeHub and obtain approval for both tokens.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const bridgeContracts = await this.getL1BridgeContracts();
            const { tx, mintValue } =
                await this._getDepositNonBaseTokenToNonETHBasedChainTx(transaction);

            if (transaction.approveBaseERC20) {
                // Only request the allowance if the current one is not enough.
                const allowance = await this.getAllowanceL1(
                    baseTokenAddress,
                    bridgeContracts.shared.address,
                );
                if (allowance.lt(mintValue)) {
                    const approveTx = await this.approveERC20(baseTokenAddress, mintValue, {
                        bridgeAddress: bridgeContracts.shared.address,
                        ...transaction.approveBaseOverrides,
                    });
                    await approveTx.wait();
                }
            }

            if (transaction.approveERC20) {
                const bridgeAddress = transaction.bridgeAddress
                    ? transaction.bridgeAddress
                    : bridgeContracts.shared.address;

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
            const gasLimit = scaleGasLimit(baseGasLimit);

            tx.gasLimit ??= gasLimit;

            return await this._providerL2().getPriorityOpResponse(
                await this._signerL1().sendTransaction(tx),
            );
        }

        async _depositBaseTokenToNonETHBasedChain(transaction: {
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
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }):Promise<PriorityOpResponse> {
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
            const gasLimit = scaleGasLimit(baseGasLimit);

            tx.overrides ??= {};
            tx.overrides.gasLimit ??= gasLimit;

            return this.requestExecute(tx);
        }

        async _depositETHToNonETHBasedChain(transaction: {
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
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse> {
            // Depositing ETH into a non-ETH-based chain.
            // Use requestL2TransactionTwoBridges, secondBridge is the wETH bridge.
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
            const gasLimit = scaleGasLimit(baseGasLimit);

            tx.gasLimit ??= gasLimit;

            return await this._providerL2().getPriorityOpResponse(
                await this._signerL1().sendTransaction(tx),
            );
        }

        async _depositTokenToETHBasedChain(transaction: {
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
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse> {
            const bridgeContracts = await this.getL1BridgeContracts();
            const tx = await this._getDepositTokenOnETHBasedChainTx(transaction);

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
            const gasLimit = scaleGasLimit(baseGasLimit);

            tx.gasLimit ??= gasLimit;

            return await this._providerL2().getPriorityOpResponse(
                await this._signerL1().sendTransaction(tx),
            );
        }

        async _depositETHToETHBasedChain(transaction: {
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
            approveBaseOverrides?: ethers.Overrides;
            customBridgeData?: BytesLike;
        }): Promise<PriorityOpResponse> {
            const tx = await this._getDepositETHOnETHBasedChainTx(transaction);

            const baseGasLimit = await this.estimateGasRequestExecute(tx);
            const gasLimit = scaleGasLimit(baseGasLimit);

            tx.overrides ??= {};
            tx.overrides.gasLimit ??= gasLimit;

            return this.requestExecute(tx);
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
        }): Promise<BigNumber> {
            if (transaction.token == LEGACY_ETH_ADDRESS) {
                transaction.token = ETH_ADDRESS_IN_CONTRACTS;
            }
            const tx = await this.getDepositTx(transaction);

            let baseGasLimit: BigNumber;
            if (tx.token == this.getBaseToken()) {
                baseGasLimit = await this.estimateGasRequestExecute(tx);
            } else {
                baseGasLimit = await this._providerL1().estimateGas(tx);
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
            if (transaction.token == LEGACY_ETH_ADDRESS) {
                transaction.token = ETH_ADDRESS_IN_CONTRACTS;
            }
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS;

            if (isETHBasedChain && transaction.token == ETH_ADDRESS_IN_CONTRACTS) {
                return await this._getDepositETHOnETHBasedChainTx(transaction);
            } else if (isETHBasedChain) {
                return await this._getDepositTokenOnETHBasedChainTx(transaction);
            } else if (transaction.token == ETH_ADDRESS_IN_CONTRACTS) {
                return (await this._getDepositETHOnNonETHBasedChainTx(transaction)).tx;
            } else if (transaction.token == baseTokenAddress) {
                return (await this._getDepositBaseTokenOnNonETHBasedChainTx(transaction)).tx;
            } else {
                return (await this._getDepositNonBaseTokenToNonETHBasedChainTx(transaction)).tx;
            }
        }

        async _getDepositNonBaseTokenToNonETHBasedChainTx(transaction: {
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
        }) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const bridgeContracts = await this.getL1BridgeContracts();

            const tx = await this._getDepositTxWithDefaults(transaction);
            const {
                token,
                operatorTip,
                amount,
                overrides,
                l2GasLimit,
                to,
                refundRecipient,
                gasPerPubdataByte,
            } = tx;

            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                gasPriceForEstimation,
                l2GasLimit,
                gasPerPubdataByte,
            );

            const mintValue = baseCost.add(operatorTip);
            await checkBaseCost(baseCost, mintValue);
            overrides.value ??= 0;

            return {
                tx: await bridgehub.populateTransaction.requestL2TransactionTwoBridges(
                    {
                        chainId: chainId,
                        mintValue,
                        l2Value: 0,
                        l2GasLimit: l2GasLimit,
                        l2GasPerPubdataByteLimit: gasPerPubdataByte,
                        refundRecipient: refundRecipient ?? ethers.constants.AddressZero,
                        secondBridgeAddress: bridgeContracts.shared.address,
                        secondBridgeValue: 0,
                        secondBridgeCalldata: ethers.utils.defaultAbiCoder.encode(
                            ["address", "uint256", "address"],
                            [token, amount, to],
                        ),
                    },
                    overrides,
                ),
                mintValue: mintValue,
            };
        }

        async _getDepositBaseTokenOnNonETHBasedChainTx(transaction: {
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
        }) {
            // Depositing the base token to a non-ETH-based chain.
            // Goes through the BridgeHub.
            // Have to give approvals for the sharedBridge.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;

            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, to, overrides, l2GasLimit, gasPerPubdataByte } = tx;

            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                gasPriceForEstimation,
                l2GasLimit,
                gasPerPubdataByte,
            );

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

        async _getDepositETHOnNonETHBasedChainTx(transaction: {
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
        }) {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const sharedBridge = (await this.getL1BridgeContracts()).shared;

            const tx = await this._getDepositTxWithDefaults(transaction);
            const {
                operatorTip,
                amount,
                overrides,
                l2GasLimit,
                to,
                refundRecipient,
                gasPerPubdataByte,
            } = tx;

            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                gasPriceForEstimation,
                l2GasLimit,
                gasPerPubdataByte,
            );

            overrides.value ??= amount;
            const mintValue = baseCost.add(operatorTip);
            await checkBaseCost(baseCost, mintValue);

            return {
                tx: await bridgehub.populateTransaction.requestL2TransactionTwoBridges(
                    {
                        chainId,
                        mintValue,
                        l2Value: 0,
                        l2GasLimit: l2GasLimit,
                        l2GasPerPubdataByteLimit: gasPerPubdataByte,
                        refundRecipient: refundRecipient ?? ethers.constants.AddressZero,
                        secondBridgeAddress: sharedBridge.address,
                        secondBridgeValue: amount,
                        secondBridgeCalldata: ethers.utils.defaultAbiCoder.encode(
                            ["address", "uint256", "address"],
                            [ETH_ADDRESS_IN_CONTRACTS, 0, to],
                        ),
                    },
                    overrides,
                ),
                mintValue: mintValue,
            };
        }

        async _getDepositTokenOnETHBasedChainTx(transaction: {
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
        }): Promise<ethers.PopulatedTransaction> {
            // Depositing token to an ETH-based chain. Use the ERC20 bridge as done before.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;

            const tx = await this._getDepositTxWithDefaults(transaction);
            const {
                token,
                operatorTip,
                amount,
                overrides,
                l2GasLimit,
                to,
                refundRecipient,
                gasPerPubdataByte,
            } = tx;

            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                gasPriceForEstimation,
                tx.l2GasLimit,
                tx.gasPerPubdataByte,
            );

            const mintValue = baseCost.add(operatorTip);
            overrides.value ??= mintValue;
            await checkBaseCost(baseCost, mintValue);

            let secondBridgeAddress: string;
            let secondBridgeCalldata: BytesLike;
            if (tx.bridgeAddress) {
                secondBridgeAddress = tx.bridgeAddress;
                secondBridgeCalldata = await getERC20DefaultBridgeData(
                    transaction.token,
                    this._providerL1(),
                );
            } else {
                secondBridgeAddress = (await this.getL1BridgeContracts()).shared.address;
                secondBridgeCalldata = ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256", "address"],
                    [token, amount, to],
                );
            }

            return await bridgehub.populateTransaction.requestL2TransactionTwoBridges(
                {
                    chainId,
                    mintValue,
                    l2Value: 0,
                    l2GasLimit,
                    l2GasPerPubdataByteLimit: gasPerPubdataByte,
                    refundRecipient: refundRecipient ?? ethers.constants.AddressZero,
                    secondBridgeAddress,
                    secondBridgeValue: 0,
                    secondBridgeCalldata,
                },
                overrides,
            );
        }

        async _getDepositETHOnETHBasedChainTx(transaction: {
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
        }) {
            // Call the BridgeHub directly, like it's done with the DiamondProxy.
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;

            const tx = await this._getDepositTxWithDefaults(transaction);
            const { operatorTip, amount, overrides, l2GasLimit, gasPerPubdataByte, to } = tx;

            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                gasPriceForEstimation,
                l2GasLimit,
                gasPerPubdataByte,
            );

            overrides.value ??= baseCost.add(operatorTip).add(amount);

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
        async _getDepositTxWithDefaults(transaction: {
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
        }): Promise<{
            token: Address;
            amount: BigNumberish;
            to: Address;
            operatorTip: BigNumberish;
            bridgeAddress?: Address;
            l2GasLimit: BigNumberish;
            gasPerPubdataByte: BigNumberish;
            customBridgeData?: BytesLike;
            refundRecipient?: Address;
            overrides: ethers.PayableOverrides;
        }> {
            const { ...tx } = transaction;
            tx.to = tx.to ?? (await this.getAddress());
            tx.operatorTip ??= BigNumber.from(0);
            tx.overrides ??= {};
            tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
            tx.l2GasLimit ??= await this._getL2GasLimit(tx);
            await insertGasPrice(this._providerL1(), tx.overrides);

            return tx as {
                token: Address;
                amount: BigNumberish;
                to: Address;
                operatorTip: BigNumberish;
                bridgeAddress?: Address;
                l2GasLimit: BigNumberish;
                gasPerPubdataByte: BigNumberish;
                customBridgeData?: BytesLike;
                refundRecipient?: Address;
                overrides: ethers.PayableOverrides;
            };
        }

        // Default behaviour for calculating l2GasLimit of deposit transaction.
        async _getL2GasLimit(transaction: {
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
        }): Promise<BigNumberish> {
            const baseToken = await this.getBaseToken();
            if (transaction.bridgeAddress != null) {
                return await this._getL2GasLimitFromCustomBridge(transaction);
            } else {
                return await estimateDefaultBridgeDepositL2Gas(
                    this._providerL1(),
                    this._providerL2(),
                    transaction.token,
                    transaction.amount,
                    transaction.to,
                    await this.getAddress(),
                    transaction.gasPerPubdataByte,
                    transaction.token === baseToken,
                );
            }
        }

        // Calculates the l2GasLimit of deposit transaction using custom bridge.
        async _getL2GasLimitFromCustomBridge(transaction: {
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
        }): Promise<BigNumberish> {
            const customBridgeData =
                transaction.customBridgeData ??
                (await getERC20DefaultBridgeData(transaction.token, this._providerL1()));
            const bridge = Il1BridgeFactory.connect(transaction.bridgeAddress, this._signerL1());
            const l2Address = await bridge.l2Bridge();
            return await estimateCustomBridgeDepositL2Gas(
                this._providerL2(),
                transaction.bridgeAddress,
                l2Address,
                transaction.token,
                transaction.amount,
                transaction.to,
                customBridgeData,
                await this.getAddress(),
                transaction.gasPerPubdataByte,
            );
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
            if (transaction.token == LEGACY_ETH_ADDRESS) {
                transaction.token = ETH_ADDRESS_IN_CONTRACTS;
            }
            // It is assumed that the L2 fee for the transaction does not depend on its value.
            const dummyAmount = BigNumber.from(1);
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const baseTokenAddress = await bridgehub.baseToken(chainId);
            const isETHBasedChain = baseTokenAddress == ETH_ADDRESS_IN_CONTRACTS;

            const tx = await this._getDepositTxWithDefaults({
                ...transaction,
                amount: dummyAmount
            });

            const gasPriceForEstimation = (await tx.overrides.maxFeePerGas) || (await tx.overrides.gasPrice);
            const baseCost = await bridgehub.l2TransactionBaseCost(
                chainId,
                gasPriceForEstimation,
                tx.l2GasLimit,
                tx.gasPerPubdataByte,
            );

            if (isETHBasedChain) {
                // To ensure that L1 gas estimation succeeds when using estimateGasDeposit,
                // the account needs to have a sufficient ETH balance.
                const selfBalanceETH = await this.getBalanceL1();
                if (baseCost.gte(selfBalanceETH.add(dummyAmount))) {
                    const recommendedL1GasLimit = tx.token === ETH_ADDRESS_IN_CONTRACTS ? L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT : L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT
                    const recommendedETHBalance = BigNumber.from(recommendedL1GasLimit)
                        .mul(gasPriceForEstimation)
                        .add(baseCost);
                    const formattedRecommendedBalance = ethers.utils.formatEther(recommendedETHBalance);
                    throw new Error(
                        `Not enough balance for deposit! Under the provided gas price, the recommended balance to perform a deposit is ${formattedRecommendedBalance} ETH`,
                    );
                }
                // In case of token deposit, a sufficient token allowance is also required.
                if (tx.token !== ETH_ADDRESS_IN_CONTRACTS && (await this.getAllowanceL1(tx.token)) < dummyAmount) {
                    throw new Error("Not enough allowance to cover the deposit!");
                }
            } else  {
                const mintValue = baseCost.add(tx.operatorTip);
                if ((await this.getAllowanceL1(baseTokenAddress)) < mintValue) {
                    throw new Error("Not enough base token allowance to cover the deposit!");
                }
                if (tx.token === ETH_ADDRESS_IN_CONTRACTS || tx.token === baseTokenAddress) {
                    tx.overrides.value ??= tx.amount;
                } else {
                    tx.overrides.value ??= 0;
                    if ((await this.getAllowanceL1(tx.token)) < dummyAmount) {
                        throw new Error("Not enough token allowance to cover the deposit!");
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

            const fullCost: FullDepositFee = {
                baseCost,
                l1GasLimit,
                l2GasLimit: BigNumber.from(tx.l2GasLimit),
            };

            if (tx.overrides.gasPrice) {
                fullCost.gasPrice = BigNumber.from(await tx.overrides.gasPrice);
            } else {
                fullCost.maxFeePerGas = BigNumber.from(await tx.overrides.maxFeePerGas);
                fullCost.maxPriorityFeePerGas = BigNumber.from(await tx.overrides.maxPriorityFeePerGas);
            }

            return fullCost;
        }

        async getPriorityOpConfirmation(txHash: string, index: number = 0) {
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
                ([, log]) => log.sender == L1_MESSENGER_ADDRESS,
            );
            const [l2ToL1LogIndex, l2ToL1Log] = messages[index];

            return {
                l2ToL1LogIndex,
                l2ToL1Log,
            };
        }

        async finalizeWithdrawalParams(
            withdrawalHash: BytesLike,
            index: number = 0,
        ): Promise<FinalizeWithdrawalParams> {
            const { log, l1BatchTxId } = await this._getWithdrawalLog(withdrawalHash, index);
            const { l2ToL1LogIndex } = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
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
        ): Promise<ethers.ContractTransaction> {
            const { l1BatchNumber, l2MessageIndex, l2TxNumberInBlock, message, sender, proof } =
                await this.finalizeWithdrawalParams(withdrawalHash, index);

            const bridgehub = await this.getBridgehubContract();
            const l1SharedBridge = Il1SharedBridgeFactory.connect(
                await bridgehub.sharedBridge(),
                this._signerL1(),
            );

            return await l1SharedBridge.finalizeWithdrawal(
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
            const { log } = await this._getWithdrawalLog(withdrawalHash, index);
            const { l2ToL1LogIndex } = await this._getWithdrawalL2ToL1Log(withdrawalHash, index);
            const sender = ethers.utils.hexDataSlice(log.topics[1], 12);
            // `getLogProof` is called not to get proof but
            // to get the index of the corresponding L2->L1 log,
            // which is returned as `proof.id`.
            const proof = await this._providerL2().getLogProof(withdrawalHash, l2ToL1LogIndex);

            const chainId = (await this._providerL2().getNetwork()).chainId;

            const l2Bridge = Il2BridgeFactory.connect(sender, this._providerL2());
            const l1Bridge = Il1BridgeFactory.connect(await l2Bridge.l1Bridge(), this._providerL1());

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

            const l1Bridge = Il1BridgeFactory.connect(l1BridgeAddress, this._signerL1());
            const l2Bridge = Il2BridgeFactory.connect(l2BridgeAddress, this._providerL2());

            const calldata = l2Bridge.interface.decodeFunctionData("finalizeDeposit", tx.data);

            const proof = await this._providerL2().getLogProof(depositHash, successL2ToL1LogIndex);
            return await l1Bridge.claimFailedDeposit(
                (await this._providerL2().getNetwork()).chainId,
                calldata["_l1Sender"],
                calldata["_l1Token"],
                calldata["_amount"],
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
            mintValue?: BigNumberish;
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
            mintValue?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<BigNumber> {
            const requestExecuteTx = await this.getRequestExecuteTx(transaction);

            delete requestExecuteTx.gasPrice;
            delete requestExecuteTx.maxFeePerGas;
            delete requestExecuteTx.maxPriorityFeePerGas;

            return this._providerL1().estimateGas(requestExecuteTx);
        }

        async getRequestExecuteAllowanceParams(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
            l2GasLimit?: BigNumberish;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            operatorTip?: BigNumberish;
            gasPerPubdataByte?: BigNumberish;
            refundRecipient?: Address;
            overrides?: ethers.PayableOverrides;
        }): Promise<{ token: Address; allowance: BigNumberish }> {
            const bridgehub = await this.getBridgehubContract();
            const chainId = (await this._providerL2().getNetwork()).chainId;
            const isETHBaseToken = (await bridgehub.baseToken(chainId)) == ETH_ADDRESS_IN_CONTRACTS;

            if (isETHBaseToken) {
                throw new Error("Could not estitame mint value on ETH-based chain!");
            }

            const { ...tx } = transaction;
            tx.l2Value ??= BigNumber.from(0);
            tx.operatorTip ??= BigNumber.from(0);
            tx.factoryDeps ??= [];
            tx.overrides ??= {};
            tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
            tx.refundRecipient ??= await this.getAddress();
            tx.l2GasLimit ??= await this._providerL2().estimateL1ToL2Execute(transaction);

            const {
                l2Value,
                l2GasLimit,
                operatorTip,
                overrides,
                gasPerPubdataByte,
            } = tx;

            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);

            const baseCost = await this.getBaseCost({
                gasPrice: gasPriceForEstimation,
                gasPerPubdataByte,
                gasLimit: l2GasLimit,
            });

            return {
                token: await this.getBaseToken(),
                allowance: baseCost.add(operatorTip).add(l2Value)
            }
        }

        async getRequestExecuteTx(transaction: {
            contractAddress: Address;
            calldata: BytesLike;
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
            const isETHBaseToken = (await bridgehub.baseToken(chainId)) == ETH_ADDRESS_IN_CONTRACTS;

            const { ...tx } = transaction;
            tx.l2Value ??= BigNumber.from(0);
            tx.operatorTip ??= BigNumber.from(0);
            tx.factoryDeps ??= [];
            tx.overrides ??= {};
            tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
            tx.refundRecipient ??= await this.getAddress();
            tx.l2GasLimit ??= await this._providerL2().estimateL1ToL2Execute(transaction);

            const {
                contractAddress,
                l2Value,
                mintValue,
                calldata,
                l2GasLimit,
                factoryDeps,
                operatorTip,
                overrides,
                gasPerPubdataByte,
                refundRecipient,
            } = tx;

            await insertGasPrice(this._providerL1(), overrides);
            const gasPriceForEstimation = (await overrides.maxFeePerGas) || (await overrides.gasPrice);

            const baseCost = await this.getBaseCost({
                gasPrice: gasPriceForEstimation,
                gasPerPubdataByte,
                gasLimit: l2GasLimit,
            });

            const l2Costs = baseCost.add(operatorTip).add(l2Value);
            let providedValue =  isETHBaseToken ? overrides.value : mintValue;
            if (providedValue === undefined || providedValue === null) {
                providedValue = l2Costs;
                if (isETHBaseToken) overrides.value = providedValue;
            }

            await checkBaseCost(baseCost, providedValue);

            return await bridgehub.populateTransaction.requestL2TransactionDirect(
                {
                    chainId,
                    mintValue: await providedValue,
                    l2Contract: contractAddress,
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

        async getL2BridgeContracts(): Promise<{ shared: Il2Bridge }> {
            const addresses = await this._providerL2().getDefaultBridgeAddresses();
            return {
                shared: Il2BridgeFactory.connect(addresses.sharedL2, this._signerL2()),
            };
        }

        _fillCustomData(data: Eip712Meta): Eip712Meta {
            const customData = { ...data };
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
): Promise<void> {
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
