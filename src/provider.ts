import {
  ethers,
  BigNumberish,
  BytesLike,
  Contract,
  BlockTag,
  Filter,
  FilterByBlockHash,
  TransactionRequest as EthersTransactionRequest,
  JsonRpcTransactionRequest,
  Networkish,
  Eip1193Provider,
  JsonRpcError,
  JsonRpcResult,
  JsonRpcPayload,
  resolveProperties,
  FetchRequest,
} from 'ethers';
import {
  IERC20__factory,
  IEthToken__factory,
  IL2Bridge__factory,
} from './typechain';
import {
  Address,
  TransactionResponse,
  TransactionRequest,
  TransactionStatus,
  PriorityOpResponse,
  BalancesMap,
  MessageProof,
  TransactionReceipt,
  Block,
  Log,
  TransactionDetails,
  BlockDetails,
  ContractAccountInfo,
  Network as ZkSyncNetwork,
  BatchDetails,
  Fee,
  Transaction,
  RawBlockTransaction,
  PaymasterParams,
  StorageProof,
} from './types';
import {
  isETH,
  getL2HashFromPriorityOp,
  CONTRACT_DEPLOYER_ADDRESS,
  CONTRACT_DEPLOYER,
  ETH_ADDRESS,
  sleep,
  L2_ETH_TOKEN_ADDRESS,
  EIP712_TX_TYPE,
  REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
} from './utils';
import {Signer} from './signer';

import {
  formatLog,
  formatBlock,
  formatTransactionResponse,
  formatTransactionReceipt,
} from './format';

type Constructor<T = {}> = new (...args: any[]) => T;

export function JsonRpcApiProvider<
  TBase extends Constructor<ethers.JsonRpcApiProvider>,
>(ProviderType: TBase) {
  return class Provider extends ProviderType {
    /**
     * Sends a JSON-RPC `_payload` (or a batch) to the underlying channel.
     *
     * @param _payload The JSON-RPC payload or batch of payloads to send.
     * @returns A promise that resolves to the result of the JSON-RPC request(s).
     */
    override _send(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _payload: JsonRpcPayload | Array<JsonRpcPayload>
    ): Promise<Array<JsonRpcResult | JsonRpcError>> {
      throw new Error('Must be implemented by the derived class!');
    }

    /**
     * Returns the addresses of the main contract and default zkSync Era bridge contracts on both L1 and L2.
     */
    contractAddresses(): {
      mainContract?: Address;
      erc20BridgeL1?: Address;
      erc20BridgeL2?: Address;
      wethBridgeL1?: Address;
      wethBridgeL2?: Address;
    } {
      throw new Error('Must be implemented by the derived class!');
    }

    override _getBlockTag(blockTag?: BlockTag): string | Promise<string> {
      if (blockTag === 'committed') {
        return 'committed';
      }
      return super._getBlockTag(blockTag);
    }

    override _wrapLog(value: any): Log {
      return new Log(formatLog(value), this);
    }

    override _wrapBlock(value: any): Block {
      return new Block(formatBlock(value), this);
    }

    override _wrapTransactionResponse(value: any): TransactionResponse {
      const tx: any = formatTransactionResponse(value);
      return new TransactionResponse(tx, this);
    }

    override _wrapTransactionReceipt(value: any): TransactionReceipt {
      const receipt: any = formatTransactionReceipt(value);
      return new TransactionReceipt(receipt, this);
    }

    /**
     * Resolves to the transaction receipt for `txHash`, if mined.
     * If the transaction has not been mined, is unknown or on pruning nodes which discard old transactions
     * this resolves to `null`.
     *
     * @param txHash The hash of the transaction.
     */
    override async getTransactionReceipt(
      txHash: string
    ): Promise<TransactionReceipt> {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const receipt = (await super.getTransactionReceipt(
          txHash
        )) as TransactionReceipt;
        if (receipt && receipt.blockNumber) {
          // otherwise transaction has not been mined yet
          return receipt;
        }
        await sleep(500);
      }
    }

    /**
     * Resolves to the transaction for `txHash`.
     * If the transaction is unknown or on pruning nodes which discard old transactions this resolves to `null`.
     *
     * @param txHash The hash of the transaction.
     */
    override async getTransaction(
      txHash: string
    ): Promise<TransactionResponse> {
      return (await super.getTransaction(txHash)) as TransactionResponse;
    }

    /**
     * Resolves to the block corresponding to the provided `blockHashOrBlockTag`.
     * If `includeTxs` is set to `true` and the backend supports including transactions with block requests,
     * all transactions will be included in the returned block object, eliminating the need for remote calls
     * to fetch transactions separately.
     *
     * @param blockHashOrBlockTag The hash or tag of the block to retrieve.
     * @param [includeTxs] A flag indicating whether to include transactions in the block.
     */
    override async getBlock(
      blockHashOrBlockTag: BlockTag,
      includeTxs?: boolean
    ): Promise<Block> {
      return (await super.getBlock(blockHashOrBlockTag, includeTxs)) as Block;
    }

    /**
     * Resolves to the list of Logs that match `filter`.
     *
     * @param filter The filter criteria to apply.
     */
    override async getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]> {
      return (await super.getLogs(filter)) as Log[];
    }

    /**
     * Returns the account balance  for the specified account `address`, `blockTag`, and `tokenAddress`.
     * If `blockTag` and `tokenAddress` are not provided, the balance for the latest committed block and ETH token
     * is returned by default.
     *
     * @param address The account address for which the balance is retrieved.
     * @param [blockTag] The block tag for getting the balance on. Latest committed block is the default.
     * @param [tokenAddress] The token address. ETH is the default token.
     */
    override async getBalance(
      address: Address,
      blockTag?: BlockTag,
      tokenAddress?: Address
    ): Promise<bigint> {
      if (!tokenAddress || isETH(tokenAddress)) {
        return await super.getBalance(address, blockTag);
      } else {
        try {
          const token = IERC20__factory.connect(tokenAddress, this);
          return await token.balanceOf(address, {blockTag});
        } catch {
          return 0n;
        }
      }
    }

    /**
     * Returns the L2 token address equivalent for a L1 token address as they are not equal.
     * ETH address is set to zero address.
     *
     * @remarks Only works for tokens bridged on default zkSync Era bridges.
     *
     * @param token The address of the token on L1.
     */
    async l2TokenAddress(token: Address): Promise<string> {
      if (token === ETH_ADDRESS) {
        return ETH_ADDRESS;
      } else {
        const bridgeAddresses = await this.getDefaultBridgeAddresses();
        const l2WethBridge = IL2Bridge__factory.connect(
          bridgeAddresses.wethL2!,
          this
        );
        try {
          const l2WethToken = await l2WethBridge.l2TokenAddress(token);
          if (l2WethToken !== ethers.ZeroAddress) {
            return l2WethToken;
          }
        } catch (e) {
          // skip
        }

        const erc20Bridge = IL2Bridge__factory.connect(
          bridgeAddresses.erc20L2!,
          this
        );
        return await erc20Bridge.l2TokenAddress(token);
      }
    }

    /**
     * Returns the L1 token address equivalent for a L2 token address as they are not equal.
     * ETH address is set to zero address.
     *
     * @remarks Only works for tokens bridged on default zkSync Era bridges.
     *
     * @param token The address of the token on L2.
     */
    async l1TokenAddress(token: Address): Promise<string> {
      if (token === ETH_ADDRESS) {
        return ETH_ADDRESS;
      } else {
        const bridgeAddresses = await this.getDefaultBridgeAddresses();
        const l2WethBridge = IL2Bridge__factory.connect(
          bridgeAddresses.wethL2!,
          this
        );
        try {
          const l1WethToken = await l2WethBridge.l1TokenAddress(token);
          if (l1WethToken !== ethers.ZeroAddress) {
            return l1WethToken;
          }
        } catch (e) {
          // skip
        }
        const erc20Bridge = IL2Bridge__factory.connect(
          bridgeAddresses.erc20L2!,
          this
        );
        return await erc20Bridge.l1TokenAddress(token);
      }
    }

    /**
     * Returns an estimate of the amount of gas required to submit a transaction from L1 to L2 as a bigint object.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-estimategasl1tol2 zks_estimateL1ToL2} JSON-RPC method.
     *
     * @param transaction The transaction request.
     */
    async estimateGasL1(transaction: TransactionRequest): Promise<bigint> {
      return await this.send('zks_estimateGasL1ToL2', [
        this.getRpcTransaction(transaction),
      ]);
    }

    /**
     * Returns an estimated {@link Fee} for requested transaction.
     *
     * @param transaction The transaction request.
     */
    async estimateFee(transaction: TransactionRequest): Promise<Fee> {
      return await this.send('zks_estimateFee', [transaction]);
    }

    /**
     * Returns an estimate (best guess) of the gas price to use in a transaction.
     */
    async getGasPrice(): Promise<bigint> {
      const feeData = await this.getFeeData();
      return feeData.gasPrice!;
    }

    /**
     * Returns the proof for a transaction's L2 to L1 log sent via the `L1Messenger` system contract.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl2tol1logproof zks_getL2ToL1LogProof} JSON-RPC method.
     *
     * @param txHash The hash of the L2 transaction the L2 to L1 log was produced within.
     * @param [index] The index of the L2 to L1 log in the transaction.
     */
    async getLogProof(
      txHash: BytesLike,
      index?: number
    ): Promise<MessageProof | null> {
      return await this.send('zks_getL2ToL1LogProof', [
        ethers.hexlify(txHash),
        index,
      ]);
    }

    /**
     * Returns the range of blocks contained within a batch given by batch number.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchblockrange zks_getL1BatchBlockRange} JSON-RPC method.
     *
     * @param l1BatchNumber The L1 batch number.
     */
    async getL1BatchBlockRange(
      l1BatchNumber: number
    ): Promise<[number, number] | null> {
      const range = await this.send('zks_getL1BatchBlockRange', [
        l1BatchNumber,
      ]);
      if (!range) {
        return null;
      }
      return [parseInt(range[0], 16), parseInt(range[1], 16)];
    }

    /**
     * Returns the main zkSync Era smart contract address.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getmaincontract zks_getMainContract} JSON-RPC method.
     */
    async getMainContractAddress(): Promise<Address> {
      if (!this.contractAddresses().mainContract) {
        this.contractAddresses().mainContract = await this.send(
          'zks_getMainContract',
          []
        );
      }
      return this.contractAddresses().mainContract!;
    }

    /**
     * Returns the testnet {@link https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters paymaster address}
     * if available, or `null`.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettestnetpaymaster zks_getTestnetPaymaster} JSON-RPC method.
     */
    async getTestnetPaymasterAddress(): Promise<Address | null> {
      // Unlike contract's addresses, the testnet paymaster is not cached, since it can be trivially changed
      // on the fly by the server and should not be relied on to be constant
      return await this.send('zks_getTestnetPaymaster', []);
    }

    /**
     * Returns the addresses of the default zkSync Era bridge contracts on both L1 and L2.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgecontracts zks_getBridgeContracts} JSON-RPC method.
     */
    async getDefaultBridgeAddresses(): Promise<{
      erc20L1: string | undefined;
      erc20L2: string | undefined;
      wethL1: string | undefined;
      wethL2: string | undefined;
    }> {
      if (!this.contractAddresses().erc20BridgeL1) {
        const addresses: {
          l1Erc20DefaultBridge: string;
          l2Erc20DefaultBridge: string;
          l1WethBridge: string;
          l2WethBridge: string;
        } = await this.send('zks_getBridgeContracts', []);
        this.contractAddresses().erc20BridgeL1 = addresses.l1Erc20DefaultBridge;
        this.contractAddresses().erc20BridgeL2 = addresses.l2Erc20DefaultBridge;
        this.contractAddresses().wethBridgeL1 = addresses.l1WethBridge;
        this.contractAddresses().wethBridgeL2 = addresses.l2WethBridge;
      }
      return {
        erc20L1: this.contractAddresses().erc20BridgeL1,
        erc20L2: this.contractAddresses().erc20BridgeL2,
        wethL1: this.contractAddresses().wethBridgeL1,
        wethL2: this.contractAddresses().wethBridgeL2,
      };
    }

    /**
     * Returns all balances for confirmed tokens given by an account address.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getallaccountbalances zks_getAllAccountBalances} JSON-RPC method.
     *
     * @param address The account address.
     */
    async getAllAccountBalances(address: Address): Promise<BalancesMap> {
      const balances = await this.send('zks_getAllAccountBalances', [address]);
      for (const token in balances) {
        balances[token] = BigInt(balances[token]);
      }
      return balances;
    }

    /**
     * Returns the L1 chain ID.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
     */
    async l1ChainId(): Promise<number> {
      const res = await this.send('zks_L1ChainId', []);
      return Number(res);
    }

    /**
     * Returns the latest L1 batch number.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1batchnumber zks_L1BatchNumber}  JSON-RPC method.
     */
    async getL1BatchNumber(): Promise<number> {
      const number = await this.send('zks_L1BatchNumber', []);
      return Number(number);
    }

    /**
     * Returns data pertaining to a given batch.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchdetails zks_getL1BatchDetails} JSON-RPC method.
     *
     * @param number The L1 batch number.
     */
    async getL1BatchDetails(number: number): Promise<BatchDetails> {
      return await this.send('zks_getL1BatchDetails', [number]);
    }

    /**
     * Returns additional zkSync-specific information about the L2 block.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getblockdetails zks_getBlockDetails}  JSON-RPC method.
     *
     * @param number The block number.
     */
    async getBlockDetails(number: number): Promise<BlockDetails> {
      return await this.send('zks_getBlockDetails', [number]);
    }

    /**
     * Returns data from a specific transaction given by the transaction hash.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettransactiondetails zks_getTransactionDetails} JSON-RPC method.
     *
     * @param txHash The transaction hash.
     */
    async getTransactionDetails(
      txHash: BytesLike
    ): Promise<TransactionDetails> {
      return await this.send('zks_getTransactionDetails', [txHash]);
    }

    /**
     * Returns bytecode of a contract given by its hash.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbytecodebyhash zks_getBytecodeByHash} JSON-RPC method.
     *
     * @param bytecodeHash The bytecode hash.
     */
    async getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array> {
      return await this.send('zks_getBytecodeByHash', [bytecodeHash]);
    }

    /**
     * Returns data of transactions in a block.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getrawblocktransactions zks_getRawBlockTransactions}  JSON-RPC method.
     *
     * @param number The block number.
     */
    async getRawBlockTransactions(
      number: number
    ): Promise<RawBlockTransaction[]> {
      return await this.send('zks_getRawBlockTransactions', [number]);
    }

    /**
     * Returns Merkle proofs for one or more storage values at the specified account along with a Merkle proof
     * of their authenticity.
     *
     * Calls the {@link https://docs.zksync.io/build/api.html#zks-getproof zks_getProof} JSON-RPC method.
     *
     * @param address The account to fetch storage values and proofs for.
     * @param keys The vector of storage keys in the account.
     * @param l1BatchNumber The number of the L1 batch specifying the point in time at which the requested values are returned.
     */
    async getProof(
      address: Address,
      keys: string[],
      l1BatchNumber: number
    ): Promise<StorageProof> {
      return await this.send('zks_getProof', [address, keys, l1BatchNumber]);
    }

    /**
     * Returns the populated withdrawal transaction.
     *
     * @param transaction The transaction details.
     * @param transaction.token The token address.
     * @param transaction.amount The amount of token.
     * @param [transaction.from] The sender's address.
     * @param [transaction.to] The recipient's address.
     * @param [transaction.bridgeAddress] The bridge address.
     * @param [transaction.paymasterParams] Paymaster parameters.
     * @param [transaction.overrides] Transaction overrides including `gasLimit`, `gasPrice`, and `value`.
     */
    async getWithdrawTx(transaction: {
      token: Address;
      amount: BigNumberish;
      from?: Address;
      to?: Address;
      bridgeAddress?: Address;
      paymasterParams?: PaymasterParams;
      overrides?: ethers.Overrides;
    }): Promise<EthersTransactionRequest> {
      const {...tx} = transaction;

      if (
        (tx.to === null || tx.to === undefined) &&
        (tx.from === null || tx.from === undefined)
      ) {
        throw new Error('Withdrawal target address is undefined!');
      }

      tx.to ??= tx.from;
      tx.overrides ??= {};
      tx.overrides.from ??= tx.from;

      if (isETH(tx.token)) {
        if (!tx.overrides.value) {
          tx.overrides.value = tx.amount;
        }
        const passedValue = BigInt(tx.overrides.value);

        if (passedValue !== BigInt(tx.amount)) {
          // To avoid users shooting themselves into the foot, we will always use the amount to withdraw
          // as the value

          throw new Error('The tx.value is not equal to the value withdrawn!');
        }

        const ethL2Token = IEthToken__factory.connect(
          L2_ETH_TOKEN_ADDRESS,
          this
        );
        const populatedTx = await ethL2Token.withdraw.populateTransaction(
          tx.to!,
          tx.overrides
        );
        if (tx.paymasterParams) {
          return {
            ...populatedTx,
            customData: {
              paymasterParams: tx.paymasterParams,
            },
          };
        }
        return populatedTx;
      }

      if (!tx.bridgeAddress) {
        const bridgeAddresses = await this.getDefaultBridgeAddresses();
        const l2WethBridge = IL2Bridge__factory.connect(
          bridgeAddresses.wethL2!,
          this
        );
        let l1WethToken = ethers.ZeroAddress;
        try {
          l1WethToken = await l2WethBridge.l1TokenAddress(tx.token);
        } catch (e) {
          // skip
        }
        tx.bridgeAddress =
          l1WethToken !== ethers.ZeroAddress
            ? bridgeAddresses.wethL2
            : bridgeAddresses.erc20L2;
      }

      const bridge = IL2Bridge__factory.connect(tx.bridgeAddress!, this);
      const populatedTx = await bridge.withdraw.populateTransaction(
        tx.to!,
        tx.token,
        tx.amount,
        tx.overrides
      );
      if (tx.paymasterParams) {
        return {
          ...populatedTx,
          customData: {
            paymasterParams: tx.paymasterParams,
          },
        };
      }
      return populatedTx;
    }

    /**
     * Returns the gas estimation for a withdrawal transaction.
     *
     * @param transaction The transaction details.
     * @param transaction.token The token address.
     * @param transaction.amount The amount of token.
     * @param [transaction.from] The sender's address.
     * @param [transaction.to] The recipient's address.
     * @param [transaction.bridgeAddress] The bridge address.
     * @param [transaction.paymasterParams] Paymaster parameters.
     * @param [transaction.overrides] Transaction overrides including `gasLimit`, `gasPrice`, and `value`.
     */
    async estimateGasWithdraw(transaction: {
      token: Address;
      amount: BigNumberish;
      from?: Address;
      to?: Address;
      bridgeAddress?: Address;
      paymasterParams?: PaymasterParams;
      overrides?: ethers.Overrides;
    }): Promise<bigint> {
      const withdrawTx = await this.getWithdrawTx(transaction);
      return await this.estimateGas(withdrawTx);
    }

    /**
     * Returns the populated transfer transaction.
     *
     * @param transaction Transfer transaction request.
     * @param transaction.to The address of the recipient.
     * @param transaction.amount The amount of the token to transfer.
     * @param [transaction.token] The address of the token. Defaults to ETH.
     * @param [transaction.paymasterParams] Paymaster parameters.
     * @param [transaction.overrides] Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.
     */
    async getTransferTx(transaction: {
      to: Address;
      amount: BigNumberish;
      from?: Address;
      token?: Address;
      paymasterParams?: PaymasterParams;
      overrides?: ethers.Overrides;
    }): Promise<EthersTransactionRequest> {
      const {...tx} = transaction;
      tx.overrides ??= {};
      tx.overrides.from ??= tx.from;

      if (!tx.token || tx.token === ETH_ADDRESS) {
        if (tx.paymasterParams) {
          return {
            ...tx.overrides,
            type: EIP712_TX_TYPE,
            to: tx.to,
            value: tx.amount,
            customData: {
              paymasterParams: tx.paymasterParams,
            },
          };
        }

        return {
          ...tx.overrides,
          to: tx.to,
          value: tx.amount,
        };
      } else {
        const token = IERC20__factory.connect(tx.token, this);
        const populatedTx = await token.transfer.populateTransaction(
          tx.to,
          tx.amount,
          tx.overrides
        );
        if (tx.paymasterParams) {
          return {
            ...populatedTx,
            customData: {
              paymasterParams: tx.paymasterParams,
            },
          };
        }
        return populatedTx;
      }
    }

    /**
     * Returns the gas estimation for a transfer transaction.
     *
     * @param transaction Transfer transaction request.
     * @param transaction.to The address of the recipient.
     * @param transaction.amount The amount of the token to transfer.
     * @param [transaction.token] The address of the token. Defaults to ETH.
     * @param [transaction.paymasterParams] Paymaster parameters.
     * @param [transaction.overrides] Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.
     */
    async estimateGasTransfer(transaction: {
      to: Address;
      amount: BigNumberish;
      from?: Address;
      token?: Address;
      paymasterParams?: PaymasterParams;
      overrides?: ethers.Overrides;
    }): Promise<bigint> {
      const transferTx = await this.getTransferTx(transaction);
      return await this.estimateGas(transferTx);
    }

    /**
     * Returns a new filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newFilter}
     * and passing a filter object.
     *
     * @param filter The filter query to apply.
     */
    async newFilter(filter: FilterByBlockHash | Filter): Promise<bigint> {
      const id = await this.send('eth_newFilter', [
        await this._getFilter(filter),
      ]);
      return BigInt(id);
    }

    /**
     * Returns a new block filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newBlockFilter}.
     */
    async newBlockFilter(): Promise<bigint> {
      const id = await this.send('eth_newBlockFilter', []);
      return BigInt(id);
    }

    /**
     * Returns a new pending transaction filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newPendingTransactionFilter}.
     */
    async newPendingTransactionsFilter(): Promise<bigint> {
      const id = await this.send('eth_newPendingTransactionFilter', []);
      return BigInt(id);
    }

    /**
     * Returns an array of logs by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_getFilterChanges}.
     *
     * @param idx The filter index.
     */
    async getFilterChanges(idx: bigint): Promise<Array<Log | string>> {
      const logs = await this.send('eth_getFilterChanges', [
        ethers.toBeHex(idx),
      ]);

      return typeof logs[0] === 'string'
        ? logs
        : logs.map((log: any) => this._wrapLog(log));
    }

    /**
     * Returns the status of a specified transaction.
     *
     * @param txHash The hash of the transaction.
     */
    // This is inefficient. Status should probably be indicated in the transaction receipt.
    async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
      const tx = await this.getTransaction(txHash);
      if (!tx) {
        return TransactionStatus.NotFound;
      }
      if (!tx.blockNumber) {
        return TransactionStatus.Processing;
      }
      const verifiedBlock = (await this.getBlock('finalized')) as Block;
      if (tx.blockNumber <= verifiedBlock.number) {
        return TransactionStatus.Finalized;
      }
      return TransactionStatus.Committed;
    }

    /**
     * Broadcasts the `signedTx` to the network, adding it to the memory pool of any node for which the transaction
     * meets the rebroadcast requirements.
     *
     * @param signedTx The signed transaction that needs to be broadcasted.
     * @returns A promise that resolves with the transaction response.
     */
    override async broadcastTransaction(
      signedTx: string
    ): Promise<TransactionResponse> {
      const {blockNumber, hash} = await resolveProperties({
        blockNumber: this.getBlockNumber(),
        hash: this._perform({
          method: 'broadcastTransaction',
          signedTransaction: signedTx,
        }),
        network: this.getNetwork(),
      });

      const tx = Transaction.from(signedTx);
      if (tx.hash !== hash) {
        throw new Error('@TODO: the returned hash did not match!');
      }

      return this._wrapTransactionResponse(<any>tx).replaceableTransaction(
        blockNumber
      );
    }

    /**
     * Returns a L2 transaction response from L1 transaction response.
     *
     * @param l1TxResponse The L1 transaction response.
     */
    async getL2TransactionFromPriorityOp(
      l1TxResponse: ethers.TransactionResponse
    ): Promise<TransactionResponse> {
      const receipt = await l1TxResponse.wait();
      const l2Hash = getL2HashFromPriorityOp(
        receipt as ethers.TransactionReceipt,
        await this.getMainContractAddress()
      );

      let status = null;
      do {
        status = await this.getTransactionStatus(l2Hash);
        await sleep(this.pollingInterval);
      } while (status === TransactionStatus.NotFound);

      return await this.getTransaction(l2Hash);
    }

    /**
     * Returns a {@link PriorityOpResponse} from L1 transaction response.
     *
     * @param l1TxResponse The L1 transaction response.
     */
    async getPriorityOpResponse(
      l1TxResponse: ethers.TransactionResponse
    ): Promise<PriorityOpResponse> {
      const l2Response = {...l1TxResponse} as PriorityOpResponse;

      l2Response.waitL1Commit = l1TxResponse.wait.bind(
        l1TxResponse
      ) as PriorityOpResponse['wait'];
      l2Response.wait = async () => {
        const l2Tx = await this.getL2TransactionFromPriorityOp(l1TxResponse);
        return await l2Tx.wait();
      };
      l2Response.waitFinalize = async () => {
        const l2Tx = await this.getL2TransactionFromPriorityOp(l1TxResponse);
        return await l2Tx.waitFinalize();
      };

      return l2Response;
    }

    /**
     * Returns the version of the supported account abstraction and nonce ordering from a given contract address.
     *
     * @param address The contract address.
     */
    async getContractAccountInfo(
      address: Address
    ): Promise<ContractAccountInfo> {
      const deployerContract = new Contract(
        CONTRACT_DEPLOYER_ADDRESS,
        CONTRACT_DEPLOYER.fragments,
        this
      );
      const data = await deployerContract.getAccountInfo(address);

      return {
        supportedAAVersion: data.supportedAAVersion,
        nonceOrdering: data.nonceOrdering,
      };
    }

    /**
     * Returns gas estimation for an L1 to L2 execute operation.
     *
     * @param transaction The transaction details.
     * @param transaction.contractAddress The address of the contract.
     * @param transaction.calldata The transaction call data.
     * @param [transaction.caller] The caller's address.
     * @param [transaction.l2Value] The current L2 gas value.
     * @param [transaction.factoryDeps] An array of bytes containing contract bytecode.
     * @param [transaction.gasPerPubdataByte] The current gas per byte value.
     * @param [transaction.overrides] Transaction overrides including `gasLimit`, `gasPrice`, and `value`.
     */
    // TODO (EVM-3): support refundRecipient for fee estimation
    async estimateL1ToL2Execute(transaction: {
      contractAddress: Address;
      calldata: string;
      caller?: Address;
      l2Value?: BigNumberish;
      factoryDeps?: ethers.BytesLike[];
      gasPerPubdataByte?: BigNumberish;
      overrides?: ethers.Overrides;
    }): Promise<bigint> {
      transaction.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;

      // If the `from` address is not provided, we use a random address, because
      // due to storage slot aggregation, the gas estimation will depend on the address
      // and so estimation for the zero address may be smaller than for the sender.
      transaction.caller ??= ethers.Wallet.createRandom().address;

      const customData = {
        gasPerPubdata: transaction.gasPerPubdataByte,
      };
      if (transaction.factoryDeps) {
        Object.assign(customData, {factoryDeps: transaction.factoryDeps});
      }

      return await this.estimateGasL1({
        from: transaction.caller,
        data: transaction.calldata,
        to: transaction.contractAddress,
        value: transaction.l2Value,
        customData,
      });
    }

    /**
     * Returns `tx` as a normalized JSON-RPC transaction request, which has all values `hexlified` and any numeric
     * values converted to Quantity values.
     * @param tx The transaction request that should be normalized.
     */
    override getRpcTransaction(
      tx: TransactionRequest
    ): JsonRpcTransactionRequest {
      const result: any = super.getRpcTransaction(tx);
      if (!tx.customData) {
        return result;
      }
      result.type = ethers.toBeHex(EIP712_TX_TYPE);
      result.eip712Meta = {
        gasPerPubdata: ethers.toBeHex(tx.customData.gasPerPubdata ?? 0),
      } as any;
      if (tx.customData.factoryDeps) {
        result.eip712Meta.factoryDeps = tx.customData.factoryDeps.map(
          (dep: ethers.BytesLike) =>
            // TODO (SMA-1605): we arraify instead of hexlifying because server expects Vec<u8>.
            //  We should change deserialization there.
            Array.from(ethers.getBytes(dep))
        );
      }
      if (tx.customData.paymasterParams) {
        result.eip712Meta.paymasterParams = {
          paymaster: ethers.hexlify(tx.customData.paymasterParams.paymaster),
          paymasterInput: Array.from(
            ethers.getBytes(tx.customData.paymasterParams.paymasterInput)
          ),
        };
      }
      return result;
    }
  };
}

/**
 * A `Provider` extends {@link ethers.JsonRpcProvider} and includes additional features for interacting with zkSync Era.
 * It supports RPC endpoints within the `zks` namespace.
 */
export class Provider extends JsonRpcApiProvider(ethers.JsonRpcProvider) {
  #connect: FetchRequest;
  protected _contractAddresses: {
    mainContract?: Address;
    erc20BridgeL1?: Address;
    erc20BridgeL2?: Address;
    wethBridgeL1?: Address;
    wethBridgeL2?: Address;
  };

  override contractAddresses(): {
    mainContract?: Address;
    erc20BridgeL1?: Address;
    erc20BridgeL2?: Address;
    wethBridgeL1?: Address;
    wethBridgeL2?: Address;
  } {
    return this._contractAddresses;
  }

  /**
   * Creates a new `Provider` instance for connecting to an L2 network.
   * Caching is disabled for local networks.
   * @param [url] The network RPC URL. Defaults to the local network.
   * @param [network] The network name, chain ID, or object with network details.
   * @param [options] Additional options for the provider.
   */
  constructor(
    url?: ethers.FetchRequest | string,
    network?: Networkish,
    options?: any
  ) {
    if (!url) {
      url = 'http://localhost:3050';
    }

    const isLocalNetwork =
      typeof url === 'string'
        ? url.includes('localhost') || url.includes('127.0.0.1')
        : url.url.includes('localhost') || url.url.includes('127.0.0.1');

    const optionsWithDisabledCache = isLocalNetwork
      ? {...options, cacheTimeout: -1}
      : options;

    super(url, network, optionsWithDisabledCache);
    typeof url === 'string'
      ? (this.#connect = new FetchRequest(url))
      : (this.#connect = url.clone());
    this.pollingInterval = 500;
    this._contractAddresses = {};
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * console.log(`Transaction receipt: ${utils.toJSON(await provider.getTransactionReceipt(TX_HASH))}`);
   */
  override async getTransactionReceipt(
    txHash: string
  ): Promise<TransactionReceipt> {
    return super.getTransactionReceipt(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * const tx = await provider.getTransaction(TX_HASH);
   *
   * // Wait until the transaction is processed by the server.
   * await tx.wait();
   * // Wait until the transaction is finalized.
   * await tx.waitFinalize();
   */
  override async getTransaction(txHash: string): Promise<TransactionResponse> {
    return super.getTransaction(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Block: ${utils.toJSON(await provider.getBlock("latest", true))}`);
   */
  override async getBlock(
    blockHashOrBlockTag: BlockTag,
    includeTxs?: boolean
  ): Promise<Block> {
    return super.getBlock(blockHashOrBlockTag, includeTxs);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Logs: ${utils.toJSON(await provider.getLogs({ fromBlock: 0, toBlock: 5, address: utils.L2_ETH_TOKEN_ADDRESS }))}`);
   */
  override async getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]> {
    return super.getLogs(filter);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const account = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
   * const tokenAddress = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * console.log(`ETH balance: ${await provider.getBalance(account)}`);
   * console.log(`Token balance: ${await provider.getBalance(account, "latest", tokenAddress)}`);
   */
  override async getBalance(
    address: Address,
    blockTag?: BlockTag,
    tokenAddress?: Address
  ): Promise<bigint> {
    return super.getBalance(address, blockTag, tokenAddress);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`L2 token address: ${await provider.l2TokenAddress("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
   */
  override async l2TokenAddress(token: Address): Promise<string> {
    return super.l2TokenAddress(token);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`L1 token address: ${await provider.l1TokenAddress("0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b")}`);
   */
  override async l1TokenAddress(token: Address): Promise<string> {
    return super.l1TokenAddress(token);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const gasL1 = await provider.estimateGasL1({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: await provider.getMainContractAddress(),
   *   value: 7_000_000_000,
   *   customData: {
   *     gasPerPubdata: 800,
   *   },
   * });
   * console.log(`L1 gas: ${BigInt(gasL1)}`);
   */
  override async estimateGasL1(
    transaction: TransactionRequest
  ): Promise<bigint> {
    return super.estimateGasL1(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const fee = await provider.estimateFee({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   value: `0x${BigInt(7_000_000_000).toString(16)}`,
   * });
   * console.log(`Fee: ${utils.toJSON(fee)}`);
   */
  override async estimateFee(transaction: TransactionRequest): Promise<Fee> {
    return super.estimateFee(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Gas price: ${await provider.getGasPrice()}`);
   */
  override async getGasPrice(): Promise<bigint> {
    return super.getGasPrice();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Log ${utils.toJSON(await provider.getLogProof(tx, 0))}`);
   */
  override async getLogProof(
    txHash: BytesLike,
    index?: number
  ): Promise<MessageProof | null> {
    return super.getLogProof(txHash, index);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * console.log(`L1 batch block range: ${utils.toJSON(await provider.getL1BatchBlockRange(l1BatchNumber))}`);
   */
  override async getL1BatchBlockRange(
    l1BatchNumber: number
  ): Promise<[number, number] | null> {
    return super.getL1BatchBlockRange(l1BatchNumber);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Main contract: ${await provider.getMainContractAddress()}`);
   */
  override async getMainContractAddress(): Promise<Address> {
    return super.getMainContractAddress();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Testnet paymaster: ${await provider.getTestnetPaymasterAddress()}`);
   */
  override async getTestnetPaymasterAddress(): Promise<Address | null> {
    return super.getTestnetPaymasterAddress();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Default bridges: ${utils.toJSON(await provider.getDefaultBridgeAddresses())}`);
   */
  override async getDefaultBridgeAddresses(): Promise<{
    erc20L1: string | undefined;
    erc20L2: string | undefined;
    wethL1: string | undefined;
    wethL2: string | undefined;
  }> {
    return super.getDefaultBridgeAddresses();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const balances = await provider.getAllAccountBalances("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
   * console.log(`All balances: ${utils.toJSON(balances)}`);
   */
  override async getAllAccountBalances(address: Address): Promise<BalancesMap> {
    return super.getAllAccountBalances(address);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types} from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const l1ChainId = await provider.l1ChainId();
   * console.log(`All balances: ${l1ChainId}`);
   */
  override async l1ChainId(): Promise<number> {
    return super.l1ChainId();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`L1 batch number: ${await provider.getL1BatchNumber()}`);
   */
  override async getL1BatchNumber(): Promise<number> {
    return super.getL1BatchNumber();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * console.log(`L1 batch details: ${utils.toJSON(await provider.getL1BatchDetails(l1BatchNumber))}`);
   */
  override async getL1BatchDetails(number: number): Promise<BatchDetails> {
    return super.getL1BatchDetails(number);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Block details: ${utils.toJSON(await provider.getBlockDetails(90_000))}`);
   */
  override async getBlockDetails(number: number): Promise<BlockDetails> {
    return super.getBlockDetails(number);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * console.log(`Transaction details: ${utils.toJSON(await provider.getTransactionDetails(TX_HASH))}`);
   */
  override async getTransactionDetails(
    txHash: BytesLike
  ): Promise<TransactionDetails> {
    return super.getTransactionDetails(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * // Bytecode hash can be computed by following these steps:
   * // const testnetPaymasterBytecode = await provider.getCode(await provider.getTestnetPaymasterAddress());
   * // const testnetPaymasterBytecodeHash = ethers.hexlify(utils.hashBytecode(testnetPaymasterBytecode));
   *
   * const testnetPaymasterBytecodeHash = "0x010000f16d2b10ddeb1c32f2c9d222eb1aea0f638ec94a81d4e916c627720e30";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Bytecode: ${await provider.getBytecodeByHash(testnetPaymasterBytecodeHash)}`);
   */
  override async getBytecodeByHash(
    bytecodeHash: BytesLike
  ): Promise<Uint8Array> {
    return super.getBytecodeByHash(bytecodeHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Raw block transactions: ${utils.toJSON(await provider.getRawBlockTransactions(90_000))}`);
   */
  override async getRawBlockTransactions(
    number: number
  ): Promise<RawBlockTransaction[]> {
    return super.getRawBlockTransactions(number);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const address = "0x082b1BB53fE43810f646dDd71AA2AB201b4C6b04";
   *
   * // Fetching the storage proof for rawNonces storage slot in NonceHolder system contract.
   * // mapping(uint256 => uint256) internal rawNonces;
   *
   * // Ensure the address is a 256-bit number by padding it
   * // because rawNonces slot uses uint256 for mapping addresses and their nonces.
   * const addressPadded = ethers.zeroPadValue(address, 32);
   *
   * // Convert the slot number to a hex string and pad it to 32 bytes.
   * const slotPadded = ethers.zeroPadValue(ethers.toBeHex(0), 32);
   *
   * // Concatenate the padded address and slot number.
   * const concatenated = addressPadded + slotPadded.slice(2); // slice to remove '0x' from the slotPadded
   *
   * // Hash the concatenated string using Keccak-256.
   * const storageKey = ethers.keccak256(concatenated);
   *
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * const storageProof = await provider.getProof(utils.NONCE_HOLDER_ADDRESS, [storageKey], l1BatchNumber);
   * console.log(`Storage proof: ${utils.toJSON(storageProof)}`);
   */
  override async getProof(
    address: Address,
    keys: string[],
    l1BatchNumber: number
  ): Promise<StorageProof> {
    return super.getProof(address, keys, l1BatchNumber);
  }

  /**
   * @inheritDoc
   *
   * @example Retrieve populated ETH withdrawal transactions.
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * const tx = await provider.getWithdrawTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Withdrawal tx: ${tx}`);
   *
   * @example Retrieve populated ETH withdrawal transaction using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const tx = await provider.getWithdrawTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   * console.log(`Withdrawal tx: ${tx}`);
   */
  override async getWithdrawTx(transaction: {
    token: Address;
    amount: BigNumberish;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<TransactionRequest> {
    return super.getWithdrawTx(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const gasWithdraw = await provider.estimateGasWithdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000,
   *   to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Gas for withdrawal tx: ${gasWithdraw}`);
   */
  override async estimateGasWithdraw(transaction: {
    token: Address;
    amount: BigNumberish;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<bigint> {
    return super.estimateGasWithdraw(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example Retrieve populated ETH transfer transaction.
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * const tx = await provider.getTransferTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Transfer tx: ${tx}`);
   *
   * @example Retrieve populated ETH transfer transaction using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const tx = await provider.getTransferTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   * console.log(`Transfer tx: ${tx}`);
   */
  override async getTransferTx(transaction: {
    to: Address;
    amount: BigNumberish;
    from?: Address;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<TransactionRequest> {
    return super.getTransferTx(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const gasTransfer = await provider.estimateGasTransfer({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Gas for transfer tx: ${gasTransfer}`);
   */
  override async estimateGasTransfer(transaction: {
    to: Address;
    amount: BigNumberish;
    from?: Address;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<bigint> {
    return super.estimateGasTransfer(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(
   *   `New filter: ${await provider.newFilter({
   *     fromBlock: 0,
   *     toBlock: 5,
   *     address: utils.L2_ETH_TOKEN_ADDRESS,
   *   })}`
   * );
   */
  override async newFilter(
    filter: FilterByBlockHash | Filter
  ): Promise<bigint> {
    return super.newFilter(filter);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`New block filter: ${await provider.newBlockFilter()}`);
   */
  override async newBlockFilter(): Promise<bigint> {
    return super.newBlockFilter();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`New pending transaction filter: ${await provider.newPendingTransactionsFilter()}`);
   */
  override async newPendingTransactionsFilter(): Promise<bigint> {
    return super.newPendingTransactionsFilter();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const filter = await provider.newFilter({
   *   address: utils.L2_ETH_TOKEN_ADDRESS,
   *   topics: [ethers.id("Transfer(address,address,uint256)")],
   * });
   * const result = await provider.getFilterChanges(filter);
   */
  override async getFilterChanges(idx: bigint): Promise<Array<Log | string>> {
    return super.getFilterChanges(idx);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   *
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * console.log(`Transaction status: ${utils.toJSON(await provider.getTransactionStatus(TX_HASH))}`);
   */
  override async getTransactionStatus(
    txHash: string
  ): Promise<TransactionStatus> {
    return super.getTransactionStatus(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getL2TransactionFromPriorityOp(l1TxResponse))}`);
   * }
   */
  override async getL2TransactionFromPriorityOp(
    l1TxResponse: ethers.TransactionResponse
  ): Promise<TransactionResponse> {
    return super.getL2TransactionFromPriorityOp(l1TxResponse);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getPriorityOpResponse(l1TxResponse))}`);
   * }
   */
  override async getPriorityOpResponse(
    l1TxResponse: ethers.TransactionResponse
  ): Promise<PriorityOpResponse> {
    return super.getPriorityOpResponse(l1TxResponse);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const tokenAddress = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * console.log(`Contract account info: ${utils.toJSON(await provider.getContractAccountInfo(tokenAddress))}`);
   */
  override async getContractAccountInfo(
    address: Address
  ): Promise<ContractAccountInfo> {
    return super.getContractAccountInfo(address);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const gasL1ToL2 = await provider.estimateL1ToL2Execute({
   *   contractAddress: await provider.getMainContractAddress(),
   *   calldata: "0x",
   *   caller: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   l2Value: 7_000_000_000,
   * });
   * console.log(`Gas L1 to L2: ${BigInt(gasL1ToL2)}`);
   */
  override async estimateL1ToL2Execute(transaction: {
    contractAddress: Address;
    calldata: string;
    caller?: Address;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    gasPerPubdataByte?: BigNumberish;
    overrides?: ethers.Overrides;
  }): Promise<bigint> {
    return super.estimateL1ToL2Execute(transaction);
  }

  override async _send(
    payload: JsonRpcPayload | Array<JsonRpcPayload>
  ): Promise<Array<JsonRpcResult>> {
    const request = this._getConnection();
    request.body = JSON.stringify(payload);
    request.setHeader('content-type', 'application/json');

    const response = await request.send();
    response.assertOk();

    let resp = response.bodyJson;
    if (!Array.isArray(resp)) {
      resp = [resp];
    }

    return resp;
  }

  /**
   * Creates a new `Provider` from provided URL or network name.
   *
   * @param zksyncNetwork The type of zkSync network.
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   */
  static getDefaultProvider(
    zksyncNetwork: ZkSyncNetwork = ZkSyncNetwork.Localhost
  ): Provider {
    switch (zksyncNetwork) {
      case ZkSyncNetwork.Localhost:
        return new Provider('http://localhost:3050');
      case ZkSyncNetwork.Sepolia:
        return new Provider('https://sepolia.era.zksync.dev');
      case ZkSyncNetwork.Mainnet:
        return new Provider('https://mainnet.era.zksync.io');
      case ZkSyncNetwork.EraTestNode:
        return new Provider('http://localhost:8011');
      default:
        return new Provider('http://localhost:3050');
    }
  }
}

/* c8 ignore start */
/**
 * A `BrowserProvider` extends {@link ethers.BrowserProvider} and includes additional features for interacting with zkSync Era.
 * It supports RPC endpoints within the `zks` namespace.
 * This provider is designed for frontend use in a browser environment and integration for browser wallets
 * (e.g., MetaMask, WalletConnect).
 */
export class BrowserProvider extends JsonRpcApiProvider(
  ethers.BrowserProvider
) {
  #request: (
    method: string,
    params: Array<any> | Record<string, any>
  ) => Promise<any>;

  protected _contractAddresses: {
    mainContract?: Address;
    erc20BridgeL1?: Address;
    erc20BridgeL2?: Address;
    wethBridgeL1?: Address;
    wethBridgeL2?: Address;
  };

  override contractAddresses(): {
    mainContract?: Address;
    erc20BridgeL1?: Address;
    erc20BridgeL2?: Address;
    wethBridgeL1?: Address;
    wethBridgeL2?: Address;
  } {
    return this._contractAddresses;
  }

  /**
   * Connects to the `ethereum` provider, optionally forcing the `network`.
   *
   * @param ethereum The provider injected from the browser. For instance, Metamask is `window.ethereum`.
   * @param [network] The network name, chain ID, or object with network details.
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   */
  constructor(ethereum: Eip1193Provider, network?: Networkish) {
    super(ethereum, network);
    this._contractAddresses = {};

    this.#request = async (
      method: string,
      params: Array<any> | Record<string, any>
    ) => {
      const payload = {method, params};
      this.emit('debug', {action: 'sendEip1193Request', payload});
      try {
        const result = await ethereum.request(payload);
        this.emit('debug', {action: 'receiveEip1193Result', result});
        return result;
      } catch (e: any) {
        const error = new Error(e.message);
        (<any>error).code = e.code;
        (<any>error).data = e.data;
        (<any>error).payload = payload;
        this.emit('debug', {action: 'receiveEip1193Error', error});
        throw error;
      }
    };
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * console.log(`Transaction receipt: ${utils.toJSON(await provider.getTransactionReceipt(TX_HASH))}`);
   */
  override async getTransactionReceipt(
    txHash: string
  ): Promise<TransactionReceipt> {
    return super.getTransactionReceipt(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   *
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * const tx = await provider.getTransaction(TX_HASH);
   *
   * // Wait until the transaction is processed by the server.
   * await tx.wait();
   * // Wait until the transaction is finalized.
   * await tx.waitFinalize();
   */
  override async getTransaction(txHash: string): Promise<TransactionResponse> {
    return super.getTransaction(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Block: ${utils.toJSON(await provider.getBlock("latest", true))}`);
   */
  override async getBlock(
    blockHashOrBlockTag: BlockTag,
    includeTxs?: boolean
  ): Promise<Block> {
    return super.getBlock(blockHashOrBlockTag, includeTxs);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Logs: ${utils.toJSON(await provider.getLogs({ fromBlock: 0, toBlock: 5, address: utils.L2_ETH_TOKEN_ADDRESS }))}`);
   */
  override async getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]> {
    return super.getLogs(filter);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const account = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
   * const tokenAddress = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * console.log(`ETH balance: ${await provider.getBalance(account)}`);
   * console.log(`Token balance: ${await provider.getBalance(account, "latest", tokenAddress)}`);
   */
  override async getBalance(
    address: Address,
    blockTag?: BlockTag,
    tokenAddress?: Address
  ): Promise<bigint> {
    return super.getBalance(address, blockTag, tokenAddress);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`L2 token address: ${await provider.l2TokenAddress("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
   */
  override async l2TokenAddress(token: Address): Promise<string> {
    return super.l2TokenAddress(token);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`L1 token address: ${await provider.l1TokenAddress("0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b")}`);
   */
  override async l1TokenAddress(token: Address): Promise<string> {
    return super.l1TokenAddress(token);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const gasL1 = await provider.estimateGasL1({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: await provider.getMainContractAddress(),
   *   value: 7_000_000_000,
   *   customData: {
   *     gasPerPubdata: 800,
   *   },
   * });
   * console.log(`L1 gas: ${BigInt(gasL1)}`);
   */
  override async estimateGasL1(
    transaction: TransactionRequest
  ): Promise<bigint> {
    return super.estimateGasL1(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const fee = await provider.estimateFee({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   value: `0x${BigInt(7_000_000_000).toString(16)}`,
   * });
   * console.log(`Fee: ${utils.toJSON(fee)}`);
   */
  override async estimateFee(transaction: TransactionRequest): Promise<Fee> {
    return super.estimateFee(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Gas price: ${await provider.getGasPrice()}`);
   */
  override async getGasPrice(): Promise<bigint> {
    return super.getGasPrice();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Log ${utils.toJSON(await provider.getLogProof(tx, 0))}`);
   */
  override async getLogProof(
    txHash: BytesLike,
    index?: number
  ): Promise<MessageProof | null> {
    return super.getLogProof(txHash, index);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * console.log(`L1 batch block range: ${utils.toJSON(await provider.getL1BatchBlockRange(l1BatchNumber))}`);
   */
  override async getL1BatchBlockRange(
    l1BatchNumber: number
  ): Promise<[number, number] | null> {
    return super.getL1BatchBlockRange(l1BatchNumber);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Main contract: ${await provider.getMainContractAddress()}`);
   */
  override async getMainContractAddress(): Promise<Address> {
    return super.getMainContractAddress();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Testnet paymaster: ${await provider.getTestnetPaymasterAddress()}`);
   */
  override async getTestnetPaymasterAddress(): Promise<Address | null> {
    return super.getTestnetPaymasterAddress();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Default bridges: ${utils.toJSON(await provider.getDefaultBridgeAddresses())}`);
   */
  override async getDefaultBridgeAddresses(): Promise<{
    erc20L1: string | undefined;
    erc20L2: string | undefined;
    wethL1: string | undefined;
    wethL2: string | undefined;
  }> {
    return super.getDefaultBridgeAddresses();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const balances = await provider.getAllAccountBalances("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
   * console.log(`All balances: ${utils.toJSON(balances)}`);
   */
  override async getAllAccountBalances(address: Address): Promise<BalancesMap> {
    return super.getAllAccountBalances(address);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const l1ChainId = await provider.l1ChainId();
   * console.log(`All balances: ${l1ChainId}`);
   */
  override async l1ChainId(): Promise<number> {
    return super.l1ChainId();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`L1 batch number: ${await provider.getL1BatchNumber()}`);
   */
  override async getL1BatchNumber(): Promise<number> {
    return super.getL1BatchNumber();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * console.log(`L1 batch details: ${utils.toJSON(await provider.getL1BatchDetails(l1BatchNumber))}`);
   */
  override async getL1BatchDetails(number: number): Promise<BatchDetails> {
    return super.getL1BatchDetails(number);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Block details: ${utils.toJSON(await provider.getBlockDetails(90_000))}`);
   */
  override async getBlockDetails(number: number): Promise<BlockDetails> {
    return super.getBlockDetails(number);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   *
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * console.log(`Transaction details: ${utils.toJSON(await provider.getTransactionDetails(TX_HASH))}`);
   */
  override async getTransactionDetails(
    txHash: BytesLike
  ): Promise<TransactionDetails> {
    return super.getTransactionDetails(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * // Bytecode hash can be computed by following these steps:
   * // const testnetPaymasterBytecode = await provider.getCode(await provider.getTestnetPaymasterAddress());
   * // const testnetPaymasterBytecodeHash = ethers.hexlify(utils.hashBytecode(testnetPaymasterBytecode));
   *
   * const testnetPaymasterBytecodeHash = "0x010000f16d2b10ddeb1c32f2c9d222eb1aea0f638ec94a81d4e916c627720e30";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Bytecode: ${await provider.getBytecodeByHash(testnetPaymasterBytecodeHash)}`);
   */
  override async getBytecodeByHash(
    bytecodeHash: BytesLike
  ): Promise<Uint8Array> {
    return super.getBytecodeByHash(bytecodeHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`Raw block transactions: ${utils.toJSON(await provider.getRawBlockTransactions(90_000))}`);
   */
  override async getRawBlockTransactions(
    number: number
  ): Promise<RawBlockTransaction[]> {
    return super.getRawBlockTransactions(number);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const address = "0x082b1BB53fE43810f646dDd71AA2AB201b4C6b04";
   *
   * // Fetching the storage proof for rawNonces storage slot in NonceHolder system contract.
   * // mapping(uint256 => uint256) internal rawNonces;
   *
   * // Ensure the address is a 256-bit number by padding it
   * // because rawNonces slot uses uint256 for mapping addresses and their nonces.
   * const addressPadded = ethers.zeroPadValue(address, 32);
   *
   * // Convert the slot number to a hex string and pad it to 32 bytes.
   * const slotPadded = ethers.zeroPadValue(ethers.toBeHex(0), 32);
   *
   * // Concatenate the padded address and slot number.
   * const concatenated = addressPadded + slotPadded.slice(2); // slice to remove '0x' from the slotPadded
   *
   * // Hash the concatenated string using Keccak-256.
   * const storageKey = ethers.keccak256(concatenated);
   *
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * const storageProof = await provider.getProof(utils.NONCE_HOLDER_ADDRESS, [storageKey], l1BatchNumber);
   * console.log(`Storage proof: ${utils.toJSON(storageProof)}`);
   */
  override async getProof(
    address: Address,
    keys: string[],
    l1BatchNumber: number
  ): Promise<StorageProof> {
    return super.getProof(address, keys, l1BatchNumber);
  }

  /**
   * @inheritDoc
   *
   * @example Retrieve populated ETH withdrawal transactions.
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   *
   * const tx = await provider.getWithdrawTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Withdrawal tx: ${tx}`);
   *
   * @example Retrieve populated ETH withdrawal transaction using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const tx = await provider.getWithdrawTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   * console.log(`Withdrawal tx: ${tx}`);
   */
  override async getWithdrawTx(transaction: {
    token: Address;
    amount: BigNumberish;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<TransactionRequest> {
    return super.getWithdrawTx(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const gasWithdraw = await provider.estimateGasWithdraw({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000,
   *   to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Gas for withdrawal tx: ${gasWithdraw}`);
   */
  override async estimateGasWithdraw(transaction: {
    token: Address;
    amount: BigNumberish;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<bigint> {
    return super.estimateGasWithdraw(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example Retrieve populated ETH transfer transaction.
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   *
   * const tx = await provider.getTransferTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Transfer tx: ${tx}`);
   *
   * @example Retrieve populated ETH transfer transaction using paymaster to facilitate fee payment with an ERC20 token.
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const token = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * const paymaster = "0x13D0D8550769f59aa241a41897D4859c87f7Dd46"; // Paymaster for Crown token
   *
   * const tx = await provider.getTransferTx({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   paymasterParams: utils.getPaymasterParams(paymaster, {
   *     type: "ApprovalBased",
   *     token: token,
   *     minimalAllowance: 1,
   *     innerInput: new Uint8Array(),
   *   }),
   * });
   * console.log(`Transfer tx: ${tx}`);
   */
  override async getTransferTx(transaction: {
    to: Address;
    amount: BigNumberish;
    from?: Address;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<TransactionRequest> {
    return super.getTransferTx(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const gasTransfer = await provider.estimateGasTransfer({
   *   token: utils.ETH_ADDRESS,
   *   amount: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   * console.log(`Gas for transfer tx: ${gasTransfer}`);
   */
  override async estimateGasTransfer(transaction: {
    to: Address;
    amount: BigNumberish;
    from?: Address;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.Overrides;
  }): Promise<bigint> {
    return super.estimateGasTransfer(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(
   *   `New filter: ${await provider.newFilter({
   *     fromBlock: 0,
   *     toBlock: 5,
   *     address: utils.L2_ETH_TOKEN_ADDRESS,
   *   })}`
   * );
   */
  override async newFilter(
    filter: FilterByBlockHash | Filter
  ): Promise<bigint> {
    return super.newFilter(filter);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`New block filter: ${await provider.newBlockFilter()}`);
   */
  override async newBlockFilter(): Promise<bigint> {
    return super.newBlockFilter();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * console.log(`New pending transaction filter: ${await provider.newPendingTransactionsFilter()}`);
   */
  override async newPendingTransactionsFilter(): Promise<bigint> {
    return super.newPendingTransactionsFilter();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const filter = await provider.newFilter({
   *   address: utils.L2_ETH_TOKEN_ADDRESS,
   *   topics: [ethers.id("Transfer(address,address,uint256)")],
   * });
   * const result = await provider.getFilterChanges(filter);
   */
  override async getFilterChanges(idx: bigint): Promise<Array<Log | string>> {
    return super.getFilterChanges(idx);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   *
   * const TX_HASH = "<YOUR_TX_HASH_ADDRESS>";
   * console.log(`Transaction status: ${utils.toJSON(await provider.getTransactionStatus(TX_HASH))}`);
   */
  override async getTransactionStatus(
    txHash: string
  ): Promise<TransactionStatus> {
    return super.getTransactionStatus(txHash);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getL2TransactionFromPriorityOp(l1TxResponse))}`);
   * }
   */
  override async getL2TransactionFromPriorityOp(
    l1TxResponse: ethers.TransactionResponse
  ): Promise<TransactionResponse> {
    return super.getL2TransactionFromPriorityOp(l1TxResponse);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getPriorityOpResponse(l1TxResponse))}`);
   * }
   */
  override async getPriorityOpResponse(
    l1TxResponse: ethers.TransactionResponse
  ): Promise<PriorityOpResponse> {
    return super.getPriorityOpResponse(l1TxResponse);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const tokenAddress = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * console.log(`Contract account info: ${utils.toJSON(await provider.getContractAccountInfo(tokenAddress))}`);
   */
  override async getContractAccountInfo(
    address: Address
  ): Promise<ContractAccountInfo> {
    return super.getContractAccountInfo(address);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { BrowserProvider, utils } from "zksync-ethers";
   *
   * const provider = new BrowserProvider(window.ethereum);
   * const gasL1ToL2 = await provider.estimateL1ToL2Execute({
   *   contractAddress: await provider.getMainContractAddress(),
   *   calldata: "0x",
   *   caller: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   l2Value: 7_000_000_000,
   * });
   * console.log(`Gas L1 to L2: ${BigInt(gasL1ToL2)}`);
   */
  override async estimateL1ToL2Execute(transaction: {
    contractAddress: Address;
    calldata: string;
    caller?: Address;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    gasPerPubdataByte?: BigNumberish;
    overrides?: ethers.Overrides;
  }): Promise<bigint> {
    return super.estimateL1ToL2Execute(transaction);
  }

  override async _send(
    payload: JsonRpcPayload | Array<JsonRpcPayload>
  ): Promise<Array<JsonRpcResult | JsonRpcError>> {
    ethers.assertArgument(
      !Array.isArray(payload),
      'EIP-1193 does not support batch request',
      'payload',
      payload
    );

    try {
      const result = await this.#request(payload.method, payload.params || []);
      return [{id: payload.id, result}];
    } catch (e: any) {
      return [
        {
          id: payload.id,
          error: {code: e.code, data: e.data, message: e.message},
        },
      ];
    }
  }

  /**
   * Returns an ethers-style `Error` for the given JSON-RPC error `payload`, coalescing the various strings and error
   * shapes that different nodes return, coercing them into a machine-readable standardized error.
   *
   * @param payload The JSON-RPC payload.
   * @param error The JSON-RPC error.
   */
  override getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error {
    error = JSON.parse(JSON.stringify(error));

    // EIP-1193 gives us some machine-readable error codes, so rewrite them
    switch (error.error.code || -1) {
      case 4001:
        error.error.message = `ethers-user-denied: ${error.error.message}`;
        break;
      case 4200:
        error.error.message = `ethers-unsupported: ${error.error.message}`;
        break;
    }

    return super.getRpcError(payload, error);
  }

  /**
   * Resolves whether the provider manages the `address`.
   *
   * @param address The address to check.
   */
  override async hasSigner(address: number | string): Promise<boolean> {
    if (!address) {
      address = 0;
    }

    const accounts = await this.send('eth_accounts', []);
    if (typeof address === 'number') {
      return accounts.length > address;
    }

    address = address.toLowerCase();
    return (
      accounts.filter((a: string) => a.toLowerCase() === address).length !== 0
    );
  }

  /**
   * Resolves to the `Signer` account for `address` managed by the client.
   * If the `address` is a number, it is used as an index in the accounts from `listAccounts`.
   * This can only be used on clients which manage accounts (e.g. MetaMask).
   *
   * @param address The address or index of the account to retrieve the signer for.
   *
   * @throws {Error} If the account doesn't exist.
   */
  override async getSigner(address?: number | string): Promise<Signer> {
    if (!address) {
      address = 0;
    }

    if (!(await this.hasSigner(address))) {
      try {
        await this.#request('eth_requestAccounts', []);
      } catch (error: any) {
        const payload = error.payload;
        throw this.getRpcError(payload, {id: payload.id, error});
      }
    }

    return Signer.from(
      (await super.getSigner(address)) as any,
      Number((await this.getNetwork()).chainId)
    );
  }

  override async estimateGas(transaction: TransactionRequest): Promise<bigint> {
    const gas = await super.estimateGas(transaction);
    const metamaskMinimum = 21_000n;
    const isEIP712 =
      transaction.customData || transaction.type === EIP712_TX_TYPE;
    return gas > metamaskMinimum || isEIP712 ? gas : metamaskMinimum;
  }
}
/* c8 ignore stop */
