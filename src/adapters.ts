import {
  BigNumberish,
  BlockTag,
  BytesLike,
  ContractTransactionResponse,
  ethers,
  FetchUrlFeeDataNetworkPlugin,
  TransactionRequest as EthersTransactionRequest,
} from 'ethers';
import {Provider} from './provider';
import {
  BOOTLOADER_FORMAL_ADDRESS,
  checkBaseCost,
  DEFAULT_GAS_PER_PUBDATA_LIMIT,
  estimateCustomBridgeDepositL2Gas,
  estimateDefaultBridgeDepositL2Gas,
  ETH_ADDRESS,
  getERC20DefaultBridgeData,
  isETH,
  L1_MESSENGER_ADDRESS,
  L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT,
  L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT,
  layer1TxDefaults,
  REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
  scaleGasLimit,
  undoL1ToL2Alias,
  NONCE_HOLDER_ADDRESS,
} from './utils';
import {
  IERC20__factory,
  IL1Bridge,
  IL1Bridge__factory,
  IL2Bridge,
  IL2Bridge__factory,
  INonceHolder__factory,
  IZkSync,
  IZkSync__factory,
} from './typechain';
import {
  Address,
  BalancesMap,
  Eip712Meta,
  FinalizeWithdrawalParams,
  FullDepositFee,
  PaymasterParams,
  PriorityOpResponse,
  TransactionResponse,
} from './types';

type Constructor<T = {}> = new (...args: any[]) => T;

interface TxSender {
  sendTransaction(
    tx: EthersTransactionRequest
  ): Promise<ethers.TransactionResponse>;

  getAddress(): Promise<Address>;
}

export function AdapterL1<TBase extends Constructor<TxSender>>(Base: TBase) {
  return class Adapter extends Base {
    /**
     * Returns a provider instance for connecting to an L2 network.
     */
    _providerL2(): Provider {
      throw new Error('Must be implemented by the derived class!');
    }

    /**
     * Returns a provider instance for connecting to a L1 network.
     */
    _providerL1(): ethers.Provider {
      throw new Error('Must be implemented by the derived class!');
    }

    /**
     * Returns a signer instance used for signing transactions sent to the L1 network.
     */
    _signerL1(): ethers.Signer {
      throw new Error('Must be implemented by the derived class!');
    }

    /**
     * Returns `Contract` wrapper of the zkSync Era smart contract.
     */
    async getMainContract(): Promise<IZkSync> {
      const address = await this._providerL2().getMainContractAddress();
      return IZkSync__factory.connect(address, this._signerL1());
    }

    /**
     * Returns L1 bridge contracts.
     *
     * @remarks There is no separate Ether bridge contract, {@link getMainContract Main contract} is used instead.
     */
    async getL1BridgeContracts(): Promise<{erc20: IL1Bridge; weth: IL1Bridge}> {
      const addresses = await this._providerL2().getDefaultBridgeAddresses();
      return {
        erc20: IL1Bridge__factory.connect(addresses.erc20L1!, this._signerL1()),
        weth: IL1Bridge__factory.connect(addresses.wethL1!, this._signerL1()),
      };
    }

    /**
     * Returns the amount of the token held by the account on the L1 network.
     *
     * @param [token] The address of the token. Defaults to ETH if not provided.
     * @param [blockTag] The block in which the balance should be checked.
     * Defaults to 'committed', i.e., the latest processed block.
     */
    async getBalanceL1(token?: Address, blockTag?: BlockTag): Promise<bigint> {
      token ??= ETH_ADDRESS;
      if (isETH(token)) {
        return await this._providerL1().getBalance(
          await this.getAddress(),
          blockTag
        );
      } else {
        const erc20contract = IERC20__factory.connect(
          token,
          this._providerL1()
        );
        return await erc20contract.balanceOf(await this.getAddress());
      }
    }

    /**
     * Returns the amount of approved tokens for a specific L1 bridge.
     *
     * @param token The Ethereum address of the token.
     * @param [bridgeAddress] The address of the bridge contract to be used.
     * Defaults to the default zkSync Era bridge, either `L1EthBridge` or `L1Erc20Bridge`.
     * @param [blockTag] The block in which an allowance should be checked.
     * Defaults to 'committed', i.e., the latest processed block.
     */
    async getAllowanceL1(
      token: Address,
      bridgeAddress?: Address,
      blockTag?: ethers.BlockTag
    ): Promise<bigint> {
      if (!bridgeAddress) {
        const bridgeContracts = await this.getL1BridgeContracts();
        let l2WethToken = ethers.ZeroAddress;
        try {
          l2WethToken = await bridgeContracts.weth.l2TokenAddress(token);
        } catch (e) {
          // skip
        }

        // If the token is Wrapped Ether, return allowance to its own bridge, otherwise to the default ERC20 bridge.
        bridgeAddress =
          l2WethToken !== ethers.ZeroAddress
            ? await bridgeContracts.weth.getAddress()
            : await bridgeContracts.erc20.getAddress();
      }

      const erc20contract = IERC20__factory.connect(token, this._providerL1());
      return await erc20contract.allowance(
        await this.getAddress(),
        bridgeAddress,
        {
          blockTag,
        }
      );
    }

    /**
     * Returns the L2 token address equivalent for a L1 token address as they are not necessarily equal.
     * The ETH address is set to the zero address.
     *
     * @remarks Only works for tokens bridged on default zkSync Era bridges.
     *
     * @param token The address of the token on L1.
     */
    async l2TokenAddress(token: Address): Promise<string> {
      if (token === ETH_ADDRESS) {
        return ETH_ADDRESS;
      }
      const bridgeContracts = await this.getL1BridgeContracts();
      try {
        const l2WethToken = await bridgeContracts.weth.l2TokenAddress(token);
        // If the token is Wrapped Ether, return its L2 token address.
        if (l2WethToken !== ethers.ZeroAddress) {
          return l2WethToken;
        }
      } catch (e) {
        // skip
      }
      return await bridgeContracts.erc20.l2TokenAddress(token);
    }

    /**
     * Bridging ERC20 tokens from L1 requires approving the tokens to the zkSync Era smart contract.
     *
     * @param token The L1 address of the token.
     * @param amount The amount of the token to be approved.
     * @param [overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
     * @returns A promise that resolves to the response of the approval transaction.
     * @throws {Error} If attempting to approve an ETH token.
     */
    async approveERC20(
      token: Address,
      amount: BigNumberish,
      overrides?: ethers.Overrides & {bridgeAddress?: Address}
    ): Promise<ethers.TransactionResponse> {
      if (isETH(token)) {
        throw new Error(
          "ETH token can't be approved! The address of the token does not exist on L1."
        );
      }

      overrides ??= {};
      let bridgeAddress = overrides?.bridgeAddress;
      const erc20contract = IERC20__factory.connect(token, this._signerL1());

      if (!bridgeAddress) {
        const bridgeContracts = await this.getL1BridgeContracts();
        let l2WethToken = ethers.ZeroAddress;
        try {
          l2WethToken = await bridgeContracts.weth.l2TokenAddress(token);
        } catch (e) {
          // skip
        }
        // If the token is Wrapped Ether, return corresponding bridge, otherwise return default ERC20 bridge
        bridgeAddress =
          l2WethToken !== ethers.ZeroAddress
            ? await bridgeContracts.weth.getAddress()
            : await bridgeContracts.erc20.getAddress();
      } else {
        delete overrides.bridgeAddress;
      }

      return await erc20contract.approve(bridgeAddress!, amount, overrides);
    }

    /**
     * Returns the base cost for an L2 transaction.
     *
     * @param params The parameters for calculating the base cost.
     * @param params.gasLimit The gasLimit for the L2 contract call.
     * @param [params.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
     * @param [params.gasPrice] The L1 gas price of the L1 transaction that will send the request for an execute call.
     */
    async getBaseCost(params: {
      gasLimit: BigNumberish;
      gasPerPubdataByte?: BigNumberish;
      gasPrice?: BigNumberish;
    }): Promise<bigint> {
      const zksyncContract = await this.getMainContract();
      const parameters = {...layer1TxDefaults(), ...params};
      parameters.gasPrice ??= (await this._providerL1().getFeeData()).gasPrice!;
      parameters.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;

      return await zksyncContract.l2TransactionBaseCost(
        parameters.gasPrice,
        parameters.gasLimit,
        parameters.gasPerPubdataByte
      );
    }

    /**
     * Transfers the specified token from the associated account on the L1 network to the target account on the L2 network.
     * The token can be either ETH or any ERC20 token. For ERC20 tokens, enough approved tokens must be associated with
     * the specified L1 bridge (default one or the one defined in `transaction.bridgeAddress`).
     * In this case, `transaction.approveERC20` can be enabled to perform token approval. If there are already enough
     * approved tokens for the L1 bridge, token approval will be skipped.
     * To check the amount of approved tokens for a specific bridge, use the {@link getAllowanceL1} method.
     *
     * @param transaction The transaction object containing deposit details.
     * @param transaction.token The address of the token to deposit. ETH by default.
     * @param transaction.amount The amount of the token to deposit.
     * @param [transaction.to] The address that will receive the deposited tokens on L2.
     * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
     * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of
     * the base cost of the transaction.
     * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
     * Defaults to the default zkSync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
     * @param [transaction.approveERC20] Whether or not token approval should be performed under the hood.
     * Set this flag to true if you bridge an ERC20 token and didn't call the {@link approveERC20}  function beforehand.
     * @param [transaction.l2GasLimit] Maximum amount of L2 gas that the transaction can consume during execution on L2.
     * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
     * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
     * If the transaction fails, it will also be the address to receive `l2Value`.
     * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
     * @param [transaction.approveOverrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
     * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
     */
    async deposit(transaction: {
      token: Address;
      amount: BigNumberish;
      to?: Address;
      operatorTip?: BigNumberish;
      bridgeAddress?: Address;
      approveERC20?: boolean;
      l2GasLimit?: BigNumberish;
      gasPerPubdataByte?: BigNumberish;
      refundRecipient?: Address;
      overrides?: ethers.Overrides;
      approveOverrides?: ethers.Overrides;
      customBridgeData?: BytesLike;
    }): Promise<PriorityOpResponse> {
      const depositTx = await this.getDepositTx(transaction);

      if (transaction.token === ETH_ADDRESS) {
        const baseGasLimit = await this.estimateGasRequestExecute(depositTx);
        const gasLimit = scaleGasLimit(baseGasLimit);
        depositTx.overrides.gasLimit ??= gasLimit;
        return this.requestExecute(depositTx);
      } else {
        const bridgeContracts = await this.getL1BridgeContracts();
        if (transaction.approveERC20) {
          let l2WethToken = ethers.ZeroAddress;
          try {
            l2WethToken = await bridgeContracts.weth.l2TokenAddress(
              transaction.token
            );
          } catch (e) {
            // skip
          }
          // If the token is Wrapped Ether, use its bridge.
          const proposedBridge =
            l2WethToken !== ethers.ZeroAddress
              ? await bridgeContracts.weth.getAddress()
              : await bridgeContracts.erc20.getAddress();
          const bridgeAddress = transaction.bridgeAddress
            ? transaction.bridgeAddress
            : proposedBridge;

          // We only request the allowance if the current one is not enough.
          const allowance = await this.getAllowanceL1(
            transaction.token,
            bridgeAddress
          );
          if (allowance < BigInt(transaction.amount)) {
            const approveTx = await this.approveERC20(
              transaction.token,
              transaction.amount,
              {
                bridgeAddress,
                ...transaction.approveOverrides,
              }
            );
            await approveTx.wait();
          }
        }

        const baseGasLimit = await this._providerL1().estimateGas(depositTx);
        const gasLimit = scaleGasLimit(baseGasLimit);

        depositTx.gasLimit ??= gasLimit;

        return await this._providerL2().getPriorityOpResponse(
          await this._signerL1().sendTransaction(depositTx)
        );
      }
    }

    /**
     * Estimates the amount of gas required for a deposit transaction on the L1 network.
     * Gas for approving ERC20 tokens is not included in the estimation.
     *
     * @param transaction The transaction details.
     * @param transaction.token The address of the token to deposit. ETH by default.
     * @param transaction.amount The amount of the token to deposit.
     * @param [transaction.to] The address that will receive the deposited tokens on L2.
     * @param [transaction.operatorTip] (currently not used) If the ETH value passed with the transaction is not
     * explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of the
     * base cost of the transaction.
     * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
     * Defaults to the default zkSync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
     * @param [transaction.l2GasLimit] Maximum amount of L2 gas that the transaction can consume during execution on L2.
     * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
     * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
     * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
     * If the transaction fails, it will also be the address to receive `l2Value`.
     * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
     */
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
      overrides?: ethers.Overrides;
    }): Promise<bigint> {
      const depositTx = await this.getDepositTx(transaction);

      let baseGasLimit: bigint;
      if (transaction.token === ETH_ADDRESS) {
        baseGasLimit = await this.estimateGasRequestExecute(depositTx);
      } else {
        baseGasLimit = await this._providerL1().estimateGas(depositTx);
      }

      return scaleGasLimit(baseGasLimit);
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
     * @param [transaction.bridgeAddress] The address of the bridge contract to be used. Defaults to the default zkSync
     * Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
     * @param [transaction.l2GasLimit] Maximum amount of L2 gas that the transaction can consume during execution on L2.
     * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
     * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
     * @param [transaction.refundRecipient] The address on L2 that will receive the refund for the transaction.
     * If the transaction fails, it will also be the address to receive `l2Value`.
     * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
     */
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
      overrides?: ethers.Overrides;
    }): Promise<any> {
      const bridgeContracts = await this.getL1BridgeContracts();
      if (transaction.bridgeAddress) {
        bridgeContracts.erc20 = bridgeContracts.erc20.attach(
          transaction.bridgeAddress
        ) as IL1Bridge;
      }

      const {...tx} = transaction;
      tx.to ??= await this.getAddress();
      tx.operatorTip ??= 0;
      tx.overrides ??= {};
      tx.overrides.from ??= await this.getAddress();
      tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
      if (tx.bridgeAddress) {
        const customBridgeData =
          tx.customBridgeData ??
          (await bridgeContracts.weth.getAddress()) === tx.bridgeAddress
            ? '0x'
            : await getERC20DefaultBridgeData(tx.token, this._providerL1());
        const bridge = IL1Bridge__factory.connect(
          tx.bridgeAddress,
          this._signerL1()
        );
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
          tx.gasPerPubdataByte
        );
      } else {
        tx.l2GasLimit ??= await estimateDefaultBridgeDepositL2Gas(
          this._providerL1(),
          this._providerL2(),
          tx.token,
          tx.amount,
          tx.to,
          await this.getAddress(),
          tx.gasPerPubdataByte
        );
      }

      const {to, token, amount, operatorTip, overrides} = tx;

      await insertGasPrice(this._providerL1(), overrides);
      const gasPriceForEstimation =
        overrides.maxFeePerGas || overrides.gasPrice;

      const zksyncContract = await this.getMainContract();

      const baseCost = await zksyncContract.l2TransactionBaseCost(
        gasPriceForEstimation!,
        tx.l2GasLimit,
        tx.gasPerPubdataByte
      );

      if (token === ETH_ADDRESS) {
        overrides.value ??= baseCost + BigInt(operatorTip) + BigInt(amount);

        return {
          contractAddress: to,
          calldata: '0x',
          l2Value: amount,
          ...tx,
        };
      } else {
        const refundRecipient = tx.refundRecipient ?? ethers.ZeroAddress;
        const args: [
          Address,
          Address,
          BigNumberish,
          BigNumberish,
          BigNumberish,
          Address,
        ] = [
          to,
          token,
          amount,
          tx.l2GasLimit,
          tx.gasPerPubdataByte,
          refundRecipient,
        ];

        overrides.value ??= baseCost + BigInt(operatorTip);
        await checkBaseCost(baseCost, overrides.value);
        overrides.from ??= await this.getAddress();

        let l2WethToken = ethers.ZeroAddress;
        try {
          l2WethToken = await bridgeContracts.weth.l2TokenAddress(tx.token);
        } catch (e) {
          // skip
        }

        const bridge =
          l2WethToken !== ethers.ZeroAddress
            ? bridgeContracts.weth
            : bridgeContracts.erc20;

        return await bridge.deposit.populateTransaction(...args, overrides);
      }
    }

    /**
     * Retrieves the full needed ETH fee for the deposit. Returns the L1 fee and the L2 fee {@link FullDepositFee}.
     *
     * @param transaction The transaction details.
     * @param transaction.token The address of the token to deposit. ETH by default.
     * @param [transaction.to] The address that will receive the deposited tokens on L2.
     * @param [transaction.bridgeAddress] The address of the bridge contract to be used.
     * Defaults to the default zkSync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).
     * @param [transaction.customBridgeData] Additional data that can be sent to a bridge.
     * @param [transaction.gasPerPubdataByte] The L2 gas price for each published L1 calldata byte.
     * @param [transaction.overrides] Transaction's overrides which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.
     * @throws {Error} If:
     *  - There's not enough balance for the deposit under the provided gas price.
     *  - There's not enough allowance to cover the deposit.
     */
    async getFullRequiredDepositFee(transaction: {
      token: Address;
      to?: Address;
      bridgeAddress?: Address;
      customBridgeData?: BytesLike;
      gasPerPubdataByte?: BigNumberish;
      overrides?: ethers.Overrides;
    }): Promise<FullDepositFee> {
      // It is assumed that the L2 fee for the transaction does not depend on its value.
      const dummyAmount = 1n;

      const {...tx} = transaction;
      const zksyncContract = await this.getMainContract();

      tx.overrides ??= {};
      await insertGasPrice(this._providerL1(), tx.overrides);
      const gasPriceForMessages =
        tx.overrides.maxFeePerGas || tx.overrides.gasPrice;

      tx.to ??= await this.getAddress();
      tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;

      let l2GasLimit: bigint;
      if (tx.bridgeAddress) {
        const bridgeContracts = await this.getL1BridgeContracts();
        const customBridgeData =
          tx.customBridgeData ??
          (await bridgeContracts.weth.getAddress()) === tx.bridgeAddress
            ? '0x'
            : await getERC20DefaultBridgeData(tx.token, this._providerL1());
        const bridge = IL1Bridge__factory.connect(
          tx.bridgeAddress,
          this._signerL1()
        );
        const l2Address = await bridge.l2Bridge();
        l2GasLimit = await estimateCustomBridgeDepositL2Gas(
          this._providerL2(),
          tx.bridgeAddress,
          l2Address,
          tx.token,
          dummyAmount,
          tx.to,
          customBridgeData,
          await this.getAddress(),
          tx.gasPerPubdataByte
        );
      } else {
        l2GasLimit = await estimateDefaultBridgeDepositL2Gas(
          this._providerL1(),
          this._providerL2(),
          tx.token,
          dummyAmount,
          tx.to,
          await this.getAddress(),
          tx.gasPerPubdataByte
        );
      }

      const baseCost = await zksyncContract.l2TransactionBaseCost(
        gasPriceForMessages!,
        l2GasLimit,
        tx.gasPerPubdataByte
      );

      const selfBalanceETH = await this.getBalanceL1();

      // We could zero in, because the final fee will anyway be bigger than
      if (baseCost >= selfBalanceETH + dummyAmount) {
        const recommendedETHBalance =
          BigInt(
            tx.token === ETH_ADDRESS
              ? L1_RECOMMENDED_MIN_ETH_DEPOSIT_GAS_LIMIT
              : L1_RECOMMENDED_MIN_ERC20_DEPOSIT_GAS_LIMIT
          ) *
            BigInt(gasPriceForMessages!) +
          baseCost;
        const formattedRecommendedBalance = ethers.formatEther(
          recommendedETHBalance
        );
        throw new Error(
          `Not enough balance for deposit! Under the provided gas price, the recommended balance to perform a deposit is ${formattedRecommendedBalance} ETH.`
        );
      }

      // For ETH token the value that the user passes to the estimation is the one which has the
      // value for the L2 commission subtracted.
      let amountForEstimate: bigint;
      if (isETH(tx.token)) {
        amountForEstimate = dummyAmount;
      } else {
        amountForEstimate = dummyAmount;

        if ((await this.getAllowanceL1(tx.token)) < amountForEstimate) {
          throw new Error('Not enough allowance to cover the deposit!');
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
        fullCost.gasPrice = BigInt(tx.overrides.gasPrice);
      } else {
        fullCost.maxFeePerGas = BigInt(tx.overrides.maxFeePerGas!);
        fullCost.maxPriorityFeePerGas = BigInt(
          tx.overrides.maxPriorityFeePerGas!
        );
      }

      return fullCost;
    }

    async _getWithdrawalLog(withdrawalHash: BytesLike, index = 0) {
      const hash = ethers.hexlify(withdrawalHash);
      const receipt = await this._providerL2().getTransactionReceipt(hash);
      const log = receipt.logs.filter(
        log =>
          log.address === L1_MESSENGER_ADDRESS &&
          log.topics[0] === ethers.id('L1MessageSent(address,bytes32,bytes)')
      )[index];

      return {
        log,
        l1BatchTxId: receipt.l1BatchTxIndex,
      };
    }

    async _getWithdrawalL2ToL1Log(withdrawalHash: BytesLike, index = 0) {
      const hash = ethers.hexlify(withdrawalHash);
      const receipt = await this._providerL2().getTransactionReceipt(hash);
      const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(
        ([, log]) => log.sender === L1_MESSENGER_ADDRESS
      );
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
    async finalizeWithdrawalParams(
      withdrawalHash: BytesLike,
      index = 0
    ): Promise<FinalizeWithdrawalParams> {
      const {log, l1BatchTxId} = await this._getWithdrawalLog(
        withdrawalHash,
        index
      );
      const {l2ToL1LogIndex} = await this._getWithdrawalL2ToL1Log(
        withdrawalHash,
        index
      );
      const sender = ethers.dataSlice(log.topics[1], 12);
      const proof = await this._providerL2().getLogProof(
        withdrawalHash,
        l2ToL1LogIndex
      );
      if (!proof) {
        throw new Error('Log proof not found!');
      }
      const message = ethers.AbiCoder.defaultAbiCoder().decode(
        ['bytes'],
        log.data
      )[0];
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
    async finalizeWithdrawal(
      withdrawalHash: BytesLike,
      index = 0,
      overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransactionResponse> {
      const {
        l1BatchNumber,
        l2MessageIndex,
        l2TxNumberInBlock,
        message,
        sender,
        proof,
      } = await this.finalizeWithdrawalParams(withdrawalHash, index);

      if (isETH(sender)) {
        const withdrawTo = ethers.dataSlice(message, 4, 24);
        const l1Bridges = await this.getL1BridgeContracts();
        // If the destination address matches the address of the L1 WETH contract,
        // the withdrawal request is processed through the WETH bridge.
        if (
          withdrawTo.toLowerCase() ===
          (await l1Bridges.weth.getAddress()).toLowerCase()
        ) {
          return await l1Bridges.weth.finalizeWithdrawal(
            l1BatchNumber!,
            l2MessageIndex,
            l2TxNumberInBlock!,
            message,
            proof,
            overrides ?? {}
          );
        }

        const contractAddress =
          await this._providerL2().getMainContractAddress();
        const zksync = IZkSync__factory.connect(
          contractAddress,
          this._signerL1()
        );

        return await zksync.finalizeEthWithdrawal(
          l1BatchNumber!,
          l2MessageIndex!,
          l2TxNumberInBlock!,
          message,
          proof,
          overrides ?? {}
        );
      }

      const l2Bridge = IL2Bridge__factory.connect(sender, this._providerL2());
      const l1Bridge = IL1Bridge__factory.connect(
        await l2Bridge.l1Bridge(),
        this._signerL1()
      );
      return await l1Bridge.finalizeWithdrawal(
        l1BatchNumber!,
        l2MessageIndex!,
        l2TxNumberInBlock!,
        message,
        proof,
        overrides ?? {}
      );
    }

    /**
     * Returns whether the withdrawal transaction is finalized on the L1 network.
     *
     * @param withdrawalHash Hash of the L2 transaction where the withdrawal was initiated.
     * @param [index=0] In case there were multiple withdrawals in one transaction, you may pass an index of the
     * withdrawal you want to finalize.
     * @throws {Error} If log proof can not be found.
     */
    async isWithdrawalFinalized(
      withdrawalHash: BytesLike,
      index = 0
    ): Promise<boolean> {
      const {log} = await this._getWithdrawalLog(withdrawalHash, index);
      const {l2ToL1LogIndex} = await this._getWithdrawalL2ToL1Log(
        withdrawalHash,
        index
      );
      const sender = ethers.dataSlice(log.topics[1], 12);
      // `getLogProof` is called not to get proof but
      // to get the index of the corresponding L2->L1 log,
      // which is returned as `proof.id`.
      const proof = await this._providerL2().getLogProof(
        withdrawalHash,
        l2ToL1LogIndex
      );
      if (!proof) {
        throw new Error('Log proof not found!');
      }

      if (isETH(sender)) {
        const contractAddress =
          await this._providerL2().getMainContractAddress();
        const zksync = IZkSync__factory.connect(
          contractAddress,
          this._signerL1()
        );

        return await zksync.isEthWithdrawalFinalized(
          log.l1BatchNumber!,
          proof.id
        );
      }

      const l2Bridge = IL2Bridge__factory.connect(sender, this._providerL2());
      const l1Bridge = IL1Bridge__factory.connect(
        await l2Bridge.l1Bridge(),
        this._providerL1()
      );

      return await l1Bridge.isWithdrawalFinalized(log.l1BatchNumber!, proof.id);
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
    async claimFailedDeposit(
      depositHash: BytesLike,
      overrides?: ethers.Overrides
    ): Promise<ContractTransactionResponse> {
      const receipt = await this._providerL2().getTransactionReceipt(
        ethers.hexlify(depositHash)
      );
      const successL2ToL1LogIndex = receipt.l2ToL1Logs.findIndex(
        l2ToL1log =>
          l2ToL1log.sender === BOOTLOADER_FORMAL_ADDRESS &&
          l2ToL1log.key === depositHash
      );
      const successL2ToL1Log = receipt.l2ToL1Logs[successL2ToL1LogIndex];
      if (successL2ToL1Log.value !== ethers.ZeroHash) {
        throw new Error('Cannot claim successful deposit!');
      }

      const tx = await this._providerL2().getTransaction(
        ethers.hexlify(depositHash)
      );

      // Undo the aliasing, since the Mailbox contract set it as for contract address.
      const l1BridgeAddress = undoL1ToL2Alias(receipt.from);
      const l2BridgeAddress = receipt.to;
      if (!l2BridgeAddress) {
        throw new Error('L2 bridge address not found!');
      }

      const l1Bridge = IL1Bridge__factory.connect(
        l1BridgeAddress,
        this._signerL1()
      );
      const l2Bridge = IL2Bridge__factory.connect(
        l2BridgeAddress,
        this._providerL2()
      );

      const calldata = l2Bridge.interface.decodeFunctionData(
        'finalizeDeposit',
        tx.data
      );

      const proof = await this._providerL2().getLogProof(
        depositHash,
        successL2ToL1LogIndex
      );
      if (!proof) {
        throw new Error('Log proof not found!');
      }
      return await l1Bridge.claimFailedDeposit(
        calldata['_l1Sender'],
        calldata['_l1Token'],
        depositHash,
        receipt.l1BatchNumber!,
        proof.id,
        receipt.l1BatchTxIndex!,
        proof.proof,
        overrides ?? {}
      );
    }

    /**
     * Requests execution of an L2 transaction from L1.
     *
     * @param transaction The transaction details.
     * @param transaction.contractAddress The L2 contract to be called.
     * @param transaction.calldata The input of the L2 transaction.
     * @param [transaction.l2GasLimit] Maximum amount of L2 gas that transaction can consume during execution on L2.
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
    async requestExecute(transaction: {
      contractAddress: Address;
      calldata: string;
      l2GasLimit?: BigNumberish;
      l2Value?: BigNumberish;
      factoryDeps?: ethers.BytesLike[];
      operatorTip?: BigNumberish;
      gasPerPubdataByte?: BigNumberish;
      refundRecipient?: Address;
      overrides?: ethers.Overrides;
    }): Promise<PriorityOpResponse> {
      const requestExecuteTx = await this.getRequestExecuteTx(transaction);
      return this._providerL2().getPriorityOpResponse(
        await this._signerL1().sendTransaction(requestExecuteTx)
      );
    }

    /**
     * Estimates the amount of gas required for a request execute transaction.
     *
     * @param transaction The transaction details.
     * @param transaction.contractAddress The L2 contract to be called.
     * @param transaction.calldata The input of the L2 transaction.
     * @param [transaction.l2GasLimit] Maximum amount of L2 gas that transaction can consume during execution on L2.
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
    async estimateGasRequestExecute(transaction: {
      contractAddress: Address;
      calldata: string;
      l2GasLimit?: BigNumberish;
      l2Value?: BigNumberish;
      factoryDeps?: ethers.BytesLike[];
      operatorTip?: BigNumberish;
      gasPerPubdataByte?: BigNumberish;
      refundRecipient?: Address;
      overrides?: ethers.Overrides;
    }): Promise<bigint> {
      const requestExecuteTx = await this.getRequestExecuteTx(transaction);

      delete requestExecuteTx.gasPrice;
      delete requestExecuteTx.maxFeePerGas;
      delete requestExecuteTx.maxPriorityFeePerGas;

      return this._providerL1().estimateGas(requestExecuteTx);
    }

    /**
     * Returns a populated request execute transaction.
     *
     * @param transaction The transaction details.
     * @param transaction.contractAddress The L2 contract to be called.
     * @param transaction.calldata The input of the L2 transaction.
     * @param [transaction.l2GasLimit] Maximum amount of L2 gas that transaction can consume during execution on L2.
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
    async getRequestExecuteTx(transaction: {
      contractAddress: Address;
      calldata: string;
      l2GasLimit?: BigNumberish;
      l2Value?: BigNumberish;
      factoryDeps?: ethers.BytesLike[];
      operatorTip?: BigNumberish;
      gasPerPubdataByte?: BigNumberish;
      refundRecipient?: Address;
      overrides?: ethers.Overrides;
    }): Promise<EthersTransactionRequest> {
      const zksyncContract = await this.getMainContract();

      const {...tx} = transaction;
      tx.l2Value ??= 0;
      tx.operatorTip ??= 0;
      tx.factoryDeps ??= [];
      tx.overrides ??= {};
      tx.overrides.from ??= await this.getAddress();
      tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
      tx.refundRecipient ??= await this.getAddress();
      tx.l2GasLimit ??=
        await this._providerL2().estimateL1ToL2Execute(transaction);

      const {
        contractAddress,
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
      const gasPriceForEstimation =
        overrides.maxFeePerGas || overrides.gasPrice;

      const baseCost = await this.getBaseCost({
        gasPrice: gasPriceForEstimation!,
        gasPerPubdataByte,
        gasLimit: l2GasLimit,
      });

      overrides.value ??= baseCost + BigInt(operatorTip) + BigInt(l2Value);

      await checkBaseCost(baseCost, overrides.value);

      return await zksyncContract.requestL2Transaction.populateTransaction(
        contractAddress,
        l2Value,
        calldata,
        l2GasLimit,
        REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
        factoryDeps,
        refundRecipient,
        overrides
      );
    }
  };
}

export function AdapterL2<TBase extends Constructor<TxSender>>(Base: TBase) {
  return class Adapter extends Base {
    /**
     * Returns a provider instance for connecting to an L2 network.
     */
    _providerL2(): Provider {
      throw new Error('Must be implemented by the derived class!');
    }

    /**
     * Returns a signer instance used for signing transactions sent to the L2 network.
     */
    _signerL2(): ethers.Signer {
      throw new Error('Must be implemented by the derived class!');
    }

    /**
     * Returns the balance of the account.
     *
     * @param [token] The token address to query balance for. Defaults to the native token.
     * @param [blockTag='committed'] The block tag to get the balance at.
     */
    async getBalance(
      token?: Address,
      blockTag: BlockTag = 'committed'
    ): Promise<bigint> {
      return await this._providerL2().getBalance(
        await this.getAddress(),
        blockTag,
        token
      );
    }

    /**
     * Returns all token balances of the account.
     */
    async getAllBalances(): Promise<BalancesMap> {
      return await this._providerL2().getAllAccountBalances(
        await this.getAddress()
      );
    }

    /**
     * Returns the deployment nonce of the account.
     */
    async getDeploymentNonce(): Promise<bigint> {
      return await INonceHolder__factory.connect(
        NONCE_HOLDER_ADDRESS,
        this._signerL2()
      ).getDeploymentNonce(await this.getAddress());
    }

    /**
     * Returns L2 bridge contracts.
     */
    async getL2BridgeContracts(): Promise<{erc20: IL2Bridge; weth: IL2Bridge}> {
      const addresses = await this._providerL2().getDefaultBridgeAddresses();
      return {
        erc20: IL2Bridge__factory.connect(addresses.erc20L2!, this._signerL2()),
        weth: IL2Bridge__factory.connect(addresses.wethL2!, this._signerL2()),
      };
    }

    _fillCustomData(data: Eip712Meta): Eip712Meta {
      const customData = {...data};
      customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;
      customData.factoryDeps ??= [];
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
    async withdraw(transaction: {
      token: Address;
      amount: BigNumberish;
      to?: Address;
      bridgeAddress?: Address;
      paymasterParams?: PaymasterParams;
      overrides?: ethers.Overrides;
    }): Promise<TransactionResponse> {
      const withdrawTx = await this._providerL2().getWithdrawTx({
        from: await this.getAddress(),
        ...transaction,
      });
      return (await this.sendTransaction(withdrawTx)) as TransactionResponse;
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
    async transfer(transaction: {
      to: Address;
      amount: BigNumberish;
      token?: Address;
      paymasterParams?: PaymasterParams;
      overrides?: ethers.Overrides;
    }): Promise<TransactionResponse> {
      const transferTx = await this._providerL2().getTransferTx({
        from: await this.getAddress(),
        ...transaction,
      });
      return (await this.sendTransaction(transferTx)) as TransactionResponse;
    }
  };
}

// This method checks if the overrides contain a gasPrice (or maxFeePerGas),
// if not it will insert the maxFeePerGas
async function insertGasPrice(
  l1Provider: ethers.Provider,
  overrides: ethers.Overrides
): Promise<void> {
  if (!overrides.gasPrice && !overrides.maxFeePerGas) {
    const l1FeeData = await l1Provider.getFeeData();

    // check if plugin is used to fetch fee data
    const network = await l1Provider.getNetwork();
    const plugin = <FetchUrlFeeDataNetworkPlugin>(
      network.getPlugin('org.ethers.plugins.network.FetchUrlFeeDataPlugin')
    );
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

function getBaseCostFromFeeData(feeData: ethers.FeeData): bigint {
  const maxFeePerGas = feeData.maxFeePerGas!;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;

  // Reverse the logic implemented in the abstract-provider.ts (line 917)
  return (maxFeePerGas - maxPriorityFeePerGas) / 2n;
}
