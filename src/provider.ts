import {
  BigNumber,
  BigNumberish,
  BytesLike,
  Contract,
  ethers,
  providers,
  utils,
} from 'ethers';
import {ExternalProvider} from '@ethersproject/providers';
import {ConnectionInfo, poll} from '@ethersproject/web';
import {Ierc20Factory as IERC20Factory} from './typechain/Ierc20Factory';
import {IEthTokenFactory} from './typechain/IEthTokenFactory';
import {Il2BridgeFactory as IL2BridgeFactory} from './typechain/Il2BridgeFactory';
import {
  Address,
  BalancesMap,
  BatchDetails,
  Block,
  BlockDetails,
  BlockTag,
  BlockWithTransactions,
  ContractAccountInfo,
  EventFilter,
  Log,
  MessageProof,
  PriorityOpResponse,
  TransactionDetails,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
  TransactionStatus,
  Fee,
  Network as ZkSyncNetwork,
  RawBlockTransaction,
  StorageProof,
  PaymasterParams,
  Eip712Meta,
  LogProof,
  Token,
  ProtocolVersion,
  FeeParams,
  TransactionWithDetailedOutput,
} from './types';
import {
  BOOTLOADER_FORMAL_ADDRESS,
  CONTRACT_DEPLOYER,
  CONTRACT_DEPLOYER_ADDRESS,
  EIP712_TX_TYPE,
  LEGACY_ETH_ADDRESS,
  ETH_ADDRESS_IN_CONTRACTS,
  getL2HashFromPriorityOp,
  L2_BASE_TOKEN_ADDRESS,
  parseTransaction,
  REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
  sleep,
  isAddressEq,
} from './utils';
import {Signer} from './signer';
import Formatter = providers.Formatter;
import {Il2SharedBridgeFactory} from './typechain/Il2SharedBridgeFactory';
import {Il2Bridge} from './typechain/Il2Bridge';
import {Il2SharedBridge} from './typechain/Il2SharedBridge';

let defaultFormatter: Formatter | null = null;

/**
 * A `Provider` extends {@link ethers.providers.JsonRpcProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 */
export class Provider extends ethers.providers.JsonRpcProvider {
  private static _nextPollId = 1;
  protected contractAddresses: {
    bridgehubContract?: Address;
    mainContract?: Address;
    erc20BridgeL1?: Address;
    erc20BridgeL2?: Address;
    wethBridgeL1?: Address;
    wethBridgeL2?: Address;
    sharedBridgeL1?: Address;
    sharedBridgeL2?: Address;
    baseToken?: Address;
  };

  // NOTE: this is almost a complete copy-paste of the parent poll method
  // https://github.com/ethers-io/ethers.js/blob/v5.7.2/packages/providers/src.ts/base-provider.ts#L977
  // The only difference is that we handle transaction receipts with `blockNumber: null` differently here.
  override async poll(): Promise<void> {
    const pollId = Provider._nextPollId++;

    // Track all running promises, so we can trigger a post-poll once they are complete
    const runners: Array<Promise<void>> = [];

    let blockNumber: number;
    try {
      blockNumber = await this._getInternalBlockNumber(
        100 + this.pollingInterval / 2
      );
    } catch (error) {
      this.emit('error', error);
      return;
    }
    this._setFastBlockNumber(blockNumber);

    // Emit a poll event after we have the latest (fast) block number
    this.emit('poll', pollId, blockNumber);

    // If the block has not changed, meh.
    if (blockNumber === this._lastBlockNumber) {
      this.emit('didPoll', pollId);
      return;
    }

    // First polling cycle, trigger a "block" events
    if (this._emitted.block === -2) {
      this._emitted.block = blockNumber - 1;
    }

    if (Math.abs(<number>this._emitted.block - blockNumber) > 1000) {
      console.warn(
        `network block skew detected; skipping block events (emitted=${this._emitted.block} blockNumber=${blockNumber})`
      );
      this.emit('error', {
        blockNumber: blockNumber,
        event: 'blockSkew',
        previousBlockNumber: this._emitted.block,
      });
      this.emit('block', blockNumber);
    } else {
      // Notify all listener for each block that has passed
      for (let i = <number>this._emitted.block + 1; i <= blockNumber; i++) {
        this.emit('block', i);
      }
    }

    // The emitted block was updated, check for obsolete events
    if (<number>this._emitted.block !== blockNumber) {
      this._emitted.block = blockNumber;

      Object.keys(this._emitted).forEach(key => {
        // The block event does not expire
        if (key === 'block') {
          return;
        }

        // The block we were at when we emitted this event
        const eventBlockNumber = this._emitted[key];

        // We cannot garbage collect pending transactions or blocks here
        // They should be garbage collected by the Provider when setting
        // "pending" events
        if (eventBlockNumber === 'pending') {
          return;
        }

        // Evict any transaction hashes or block hashes over 12 blocks
        // old, since they should not return null anyway
        if (blockNumber - eventBlockNumber > 12) {
          delete this._emitted[key];
        }
      });
    }

    // First polling cycle
    if (this._lastBlockNumber === -2) {
      this._lastBlockNumber = blockNumber - 1;
    }
    // Find all transaction hashes we are waiting on
    this._events.forEach(event => {
      switch (event.type) {
        case 'tx': {
          const hash = event.hash;
          const runner = this.getTransactionReceipt(hash)
            .then(receipt => {
              if (!receipt) {
                return null;
              }

              // NOTE: receipts with blockNumber == null are OK.
              // this means they were rejected in state-keeper or replaced in mempool.
              // But we still check that they were actually rejected.
              if (
                !receipt.blockNumber &&
                !(receipt.status && BigNumber.from(receipt.status).isZero())
              ) {
                return null;
              }

              this._emitted['t:' + hash] = receipt.blockNumber;
              this.emit(hash, receipt);
              return null;
            })
            .catch((error: Error) => {
              this.emit('error', error);
            });

          runners.push(runner as Promise<void>);

          break;
        }

        case 'filter': {
          // We only allow a single getLogs to be in-flight at a time
          if (!event._inflight) {
            event._inflight = true;

            // This is the first filter for this event, so we want to
            // restrict events to events that happened no earlier than now
            if (event._lastBlockNumber === -2) {
              event._lastBlockNumber = blockNumber - 1;
            }

            // Filter from the last *known* event; due to load-balancing
            // and some nodes returning updated block numbers before
            // indexing events, a logs result with 0 entries cannot be
            // trusted, and we must retry a range which includes it again
            const filter = event.filter;
            filter.fromBlock = event._lastBlockNumber + 1;
            filter.toBlock = blockNumber;

            // Prevent file ranges from growing too wild, since it is quite
            // likely there just haven't been any events to move the lastBlockNumber.
            const minFromBlock = filter.toBlock - this._maxFilterBlockRange;
            if (minFromBlock > filter.fromBlock) {
              filter.fromBlock = minFromBlock;
            }

            if (filter.fromBlock < 0) {
              filter.fromBlock = 0;
            }

            const runner = this.getLogs(filter)
              .then(logs => {
                // Allow the next getLogs
                event._inflight = false;

                if (logs.length === 0) {
                  return;
                }

                logs.forEach((log: Log) => {
                  // Only when we get an event for a given block number
                  // can we trust the events are indexed
                  if (log.blockNumber > event._lastBlockNumber) {
                    event._lastBlockNumber = log.blockNumber;
                  }

                  // Make sure we stall requests to fetch blocks and txs
                  this._emitted['b:' + log.blockHash] = log.blockNumber;
                  this._emitted['t:' + log.transactionHash] = log.blockNumber;

                  this.emit(filter, log);
                });
              })
              .catch((error: Error) => {
                this.emit('error', error);

                // Allow another getLogs (the range was not updated)
                event._inflight = false;
              });
            runners.push(runner);
          }

          break;
        }
      }
    });

    this._lastBlockNumber = blockNumber;

    // Once all events for this loop have been processed, emit "didPoll"
    Promise.all(runners)
      .then(() => {
        this.emit('didPoll', pollId);
      })
      .catch(error => {
        this.emit('error', error);
      });

    return;
  }

  /**
   * Resolves to the transaction receipt for `transactionHash`, if mined.
   *
   * @param transactionHash The hash of the transaction.
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
    transactionHash: string | Promise<string>
  ): Promise<TransactionReceipt> {
    await this.getNetwork();

    transactionHash = await transactionHash;

    const params = {
      transactionHash: this.formatter.hash(transactionHash, true),
    };

    return poll(
      async () => {
        const result = await this.perform('getTransactionReceipt', params);

        if (!result) {
          if (this._emitted['t:' + transactionHash] === undefined) {
            return null;
          }
          return undefined;
        }

        if (
          !result.blockNumber &&
          result.status &&
          BigNumber.from(result.status).isZero()
        ) {
          // transaction is rejected in the state-keeper
          return {
            ...this.formatter.receipt({
              ...result,
              confirmations: 1,
              blockNumber: 0,
              blockHash: ethers.constants.HashZero,
            }),
            blockNumber: null,
            blockHash: null,
            l1BatchNumber: null,
            l1BatchTxIndex: null,
          };
        }

        if (!result.blockHash) {
          // receipt is not ready
          return undefined;
        } else {
          const receipt: any = this.formatter.receipt(result);
          if (!receipt.blockNumber) {
            receipt.confirmations = 0;
          } else if (!receipt.confirmations) {
            const blockNumber = await this._getInternalBlockNumber(
              100 + 2 * this.pollingInterval
            );

            // Add the confirmations using the fast block number (pessimistic)
            let confirmations = blockNumber - receipt.blockNumber + 1;
            if (confirmations <= 0) {
              confirmations = 1;
            }
            receipt.confirmations = confirmations;
          }
          return receipt;
        }
      },
      {oncePoll: this}
    );
  }

  /**
   * Resolves to the block for `blockHashOrBlockTag`.
   *
   * @param blockHashOrBlockTag The hash or tag of the block to retrieve.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Block: ${utils.toJSON(await provider.getBlock("latest", true))}`);
   */
  override async getBlock(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  ): Promise<Block> {
    return <Promise<Block>>this._getBlock(blockHashOrBlockTag, false);
  }

  /**
   * Resolves to the block for `blockHashOrBlockTag`.
   * All transactions will be included and the `Block` object will not
   * need to make remote calls for getting transactions.
   *
   * @param blockHashOrBlockTag The hash or tag of the block to retrieve.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Block: ${utils.toJSON(await provider.getBlockWithTransactions("latest", true))}`);
   */
  override async getBlockWithTransactions(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  ): Promise<BlockWithTransactions> {
    return <Promise<BlockWithTransactions>>(
      this._getBlock(blockHashOrBlockTag, true)
    );
  }

  /**  Retrieves the formatter used to format responses from the network. */
  static override getFormatter(): Formatter {
    if (!defaultFormatter) {
      defaultFormatter = new Formatter();
      const number = defaultFormatter.number.bind(defaultFormatter);
      const boolean = defaultFormatter.boolean.bind(defaultFormatter);
      const hash = defaultFormatter.hash.bind(defaultFormatter);
      const address = defaultFormatter.address.bind(defaultFormatter);
      const data = defaultFormatter.data.bind(defaultFormatter);

      defaultFormatter.formats.receiptLog.l1BatchNumber =
        Formatter.allowNull(number);

      (defaultFormatter.formats as any).l2Tol1Log = {
        blockNumber: number,
        blockHash: hash,
        l1BatchNumber: Formatter.allowNull(number),
        transactionIndex: number,
        shardId: number,
        isService: boolean,
        sender: address,
        key: hash,
        value: hash,
        transactionHash: hash,
        txIndexInL1Batch: Formatter.allowNull(number),
        logIndex: number,
      };

      defaultFormatter.formats.receipt.l1BatchNumber =
        Formatter.allowNull(number);
      defaultFormatter.formats.receipt.l1BatchTxIndex =
        Formatter.allowNull(number);
      defaultFormatter.formats.receipt.l2ToL1Logs = Formatter.arrayOf(value =>
        Formatter.check((defaultFormatter!.formats as any).l2Tol1Log, value)
      );

      defaultFormatter.formats.block.sha3Uncles = hash;
      defaultFormatter.formats.block.stateRoot = hash;
      defaultFormatter.formats.block.transactionsRoot = hash;
      defaultFormatter.formats.block.receiptsRoot = hash;
      defaultFormatter.formats.block.totalDifficulty = number;
      defaultFormatter.formats.block.logsBloom = data;
      defaultFormatter.formats.block.sealFields = Formatter.allowNull(
        Formatter.arrayOf(data)
      );
      defaultFormatter.formats.block.uncles = Formatter.arrayOf(hash);
      defaultFormatter.formats.block.size = number;
      defaultFormatter.formats.block.mixHash = hash;
      defaultFormatter.formats.block.l1BatchNumber =
        Formatter.allowNull(number);
      defaultFormatter.formats.block.l1BatchTimestamp =
        Formatter.allowNull(number);

      defaultFormatter.formats.blockWithTransactions.sha3Uncles = hash;
      defaultFormatter.formats.blockWithTransactions.stateRoot = hash;
      defaultFormatter.formats.blockWithTransactions.transactionsRoot = hash;
      defaultFormatter.formats.blockWithTransactions.receiptsRoot = hash;
      defaultFormatter.formats.blockWithTransactions.totalDifficulty = number;
      defaultFormatter.formats.blockWithTransactions.logsBloom = data;
      defaultFormatter.formats.blockWithTransactions.sealFields =
        Formatter.allowNull(Formatter.arrayOf(data));
      defaultFormatter.formats.blockWithTransactions.uncles =
        Formatter.arrayOf(hash);
      defaultFormatter.formats.blockWithTransactions.size = number;
      defaultFormatter.formats.blockWithTransactions.mixHash = hash;
      defaultFormatter.formats.blockWithTransactions.l1BatchNumber =
        Formatter.allowNull(number);
      defaultFormatter.formats.blockWithTransactions.l1BatchTimestamp =
        Formatter.allowNull(number);

      defaultFormatter.formats.transaction.l1BatchNumber =
        Formatter.allowNull(number);
      defaultFormatter.formats.transaction.l1BatchTxIndex =
        Formatter.allowNull(number);

      defaultFormatter.formats.filterLog.l1BatchNumber =
        Formatter.allowNull(number);
    }
    return defaultFormatter;
  }

  /**
   * Returns the account balance  for the specified account `address`, `blockTag`, and `tokenAddress`.
   * If `blockTag` and `tokenAddress` are not provided, the balance for the latest committed block and ETH token
   * is returned by default.
   *
   * @param address The account address for which the balance is retrieved.
   * @param [blockTag] The block tag for getting the balance on. Latest committed block is the default.
   * @param [tokenAddress] The token address. ETH is the default token.
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
  ): Promise<BigNumber> {
    const tag = this.formatter.blockTag(blockTag);
    if (!tokenAddress) {
      tokenAddress = L2_BASE_TOKEN_ADDRESS;
    } else if (
      isAddressEq(tokenAddress, LEGACY_ETH_ADDRESS) ||
      isAddressEq(tokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ) {
      tokenAddress = await this.l2TokenAddress(tokenAddress);
    }
    if (isAddressEq(tokenAddress, L2_BASE_TOKEN_ADDRESS)) {
      // requesting base token balance
      return await super.getBalance(address, tag);
    } else {
      try {
        const token = IERC20Factory.connect(tokenAddress, this);
        return await token.balanceOf(address, {blockTag: tag});
      } catch {
        return BigNumber.from(0);
      }
    }
  }

  /**
   * Returns the L2 token address equivalent for a L1 token address as they are not equal.
   * ETH address is set to zero address.
   *
   * @remarks Only works for tokens bridged on default ZKsync Era bridges.
   *
   * @param token The address of the token on L1.
   * @param bridgeAddress The address of custom bridge, which will be used to get l2 token address.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`L2 token address: ${await provider.l2TokenAddress("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
   */
  async l2TokenAddress(
    token: Address,
    bridgeAddress?: Address
  ): Promise<string> {
    if (isAddressEq(token, LEGACY_ETH_ADDRESS)) {
      token = ETH_ADDRESS_IN_CONTRACTS;
    }

    const baseToken = await this.getBaseTokenContractAddress();
    if (isAddressEq(token, baseToken)) {
      return L2_BASE_TOKEN_ADDRESS;
    }

    bridgeAddress ??= (await this.getDefaultBridgeAddresses()).sharedL2;

    return await (
      await this.connectL2Bridge(bridgeAddress)
    ).l2TokenAddress(token);
  }

  /**
   * Returns the L1 token address equivalent for a L2 token address as they are not equal.
   * ETH address is set to zero address.
   *
   * @remarks Only works for tokens bridged on default ZKsync Era bridges.
   *
   * @param token The address of the token on L2.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`L1 token address: ${await provider.l1TokenAddress("0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b")}`);
   */
  async l1TokenAddress(token: Address) {
    if (isAddressEq(token, LEGACY_ETH_ADDRESS)) {
      return LEGACY_ETH_ADDRESS;
    }

    const bridgeAddresses = await this.getDefaultBridgeAddresses();

    const sharedBridge = IL2BridgeFactory.connect(
      bridgeAddresses.sharedL2,
      this
    );
    return await sharedBridge.l1TokenAddress(token);
  }

  /**
   * This function is used when formatting requests for `eth_call` and `eth_estimateGas`. We override it here
   * because we have extra stuff to serialize (customData).
   * This function is for internal use only.
   *
   * @param transaction The transaction request to be serialized.
   * @param [allowExtra] Extra properties are allowed in the transaction.
   */
  static override hexlifyTransaction(
    transaction: ethers.providers.TransactionRequest,
    allowExtra?: Record<string, boolean>
  ) {
    const result = ethers.providers.JsonRpcProvider.hexlifyTransaction(
      transaction,
      {
        ...allowExtra,
        customData: true,
        from: true,
      }
    ) as any;
    if (!transaction.customData) {
      return result;
    }
    result.eip712Meta = {
      gasPerPubdata: utils.hexValue(transaction.customData.gasPerPubdata ?? 0),
    } as Eip712Meta;
    transaction.type = EIP712_TX_TYPE;
    if (transaction.customData.factoryDeps) {
      result.eip712Meta.factoryDeps = transaction.customData.factoryDeps.map(
        (dep: ethers.BytesLike) =>
          // TODO (SMA-1605): we arraify instead of hexlifying because server expects Vec<u8>.
          //  We should change deserialization there.
          Array.from(utils.arrayify(dep))
      );
    }
    if (transaction.customData.paymasterParams) {
      result.eip712Meta.paymasterParams = {
        paymaster: utils.hexlify(
          transaction.customData.paymasterParams.paymaster
        ),
        paymasterInput: Array.from(
          utils.arrayify(transaction.customData.paymasterParams.paymasterInput)
        ),
      };
    }
    return result;
  }

  /**
   * Estimates the amount of gas required to execute `transaction`.
   *
   * @param transaction The transaction for which to estimate gas.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const gas = await provider.estimateGas({
   *   value: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   */
  override async estimateGas(
    transaction: utils.Deferrable<TransactionRequest>
  ): Promise<BigNumber> {
    await this.getNetwork();
    const params = (await utils.resolveProperties({
      transaction: this._getTransactionRequest(transaction),
    })) as {transaction: TransactionRequest};
    if (transaction.customData) {
      params.transaction.customData = transaction.customData;
    }
    const result = await this.perform('estimateGas', params);
    try {
      return BigNumber.from(result);
    } catch (error) {
      throw new Error(`Bad result from backend (estimateGas): ${result}!`);
    }
  }

  /**
   * Return the protocol version
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks_getprotocolversion zks_getProtocolVersion} JSON-RPC method.
   *
   * @param [id] Specific version ID.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Protocol version: ${await provider.getProtocolVersion()}`);
   */
  async getProtocolVersion(id?: number): Promise<ProtocolVersion> {
    return await this.send('zks_getProtocolVersion', [id]);
  }

  /**
   * Returns an estimate of the amount of gas required to submit a transaction from L1 to L2.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-estimategasl1tol2 zks_estimateL1ToL2} JSON-RPC method.
   *
   * @param transaction The transaction request.
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
   * console.log(`L1 gas: ${gasL1}`);
   */
  async estimateGasL1(
    transaction: utils.Deferrable<TransactionRequest>
  ): Promise<BigNumber> {
    await this.getNetwork();
    const params = await utils.resolveProperties({
      transaction: this._getTransactionRequest(
        transaction
      ) as TransactionRequest,
    });
    if (transaction.customData) {
      params.transaction.customData = transaction.customData;
    }
    const result = await this.send('zks_estimateGasL1ToL2', [
      Provider.hexlifyTransaction(
        params.transaction as ethers.providers.TransactionRequest,
        {
          from: true,
        }
      ),
    ]);
    try {
      return BigNumber.from(result);
    } catch (error) {
      throw new Error(
        `Bad result from backend (zks_estimateGasL1ToL2): ${result}!`
      );
    }
  }

  /**
   * Returns an estimated {@link Fee} for requested transaction.
   *
   * @param transaction The transaction request.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const fee = await provider.estimateFee({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   value: BigNumber.from(7_000_000_000).toHexString(),
   * });
   * console.log(`Fee: ${utils.toJSON(fee)}`);
   */
  async estimateFee(transaction: TransactionRequest): Promise<Fee> {
    const fee = await this.send('zks_estimateFee', [transaction]);
    return {
      gasLimit: BigNumber.from(fee.gas_limit),
      gasPerPubdataLimit: BigNumber.from(fee.gas_per_pubdata_limit),
      maxPriorityFeePerGas: BigNumber.from(fee.max_priority_fee_per_gas),
      maxFeePerGas: BigNumber.from(fee.max_fee_per_gas),
    };
  }

  /**
   * Returns the current fee parameters.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks_getFeeParams zks_getFeeParams} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const feeParams = await provider.getFeeParams();
   * console.log(`Fee: ${utils.toJSON(feeParams)}`);
   */
  async getFeeParams(): Promise<FeeParams> {
    return await this.send('zks_getFeeParams', []);
  }

  /**
   * Returns an estimate (best guess) of the gas price to use in a transaction.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Gas price: ${await provider.getGasPrice()}`);
   */
  override async getGasPrice(token?: Address): Promise<BigNumber> {
    const params = token ? [token] : [];
    const price = await this.send('eth_gasPrice', params);
    return BigNumber.from(price);
  }

  /**
   * Creates a new `Provider` instance for connecting to an L2 network.
   * @param [url] The network RPC URL. Defaults to the local network.
   * @param [network] The network name, chain ID, or object with network details.
   */
  constructor(
    url?: ConnectionInfo | string,
    network?: ethers.providers.Networkish
  ) {
    super(url, network);
    this.pollingInterval = 500;

    const blockTag = this.formatter.blockTag.bind(this.formatter);
    this.formatter.blockTag = (tag: any) => {
      if (tag === 'committed' || tag === 'finalized') {
        return tag;
      }
      return blockTag(tag);
    };
    this.contractAddresses = {};
    this.formatter.transaction = parseTransaction;
  }

  /**
   * Returns the proof for a transaction's L2 to L1 log sent via the `L1Messenger` system contract.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl2tol1logproof zks_getL2ToL1LogProof} JSON-RPC method.
   *
   * @param txHash The hash of the L2 transaction the L2 to L1 log was produced within.
   * @param [index] The index of the L2 to L1 log in the transaction.
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
  async getLogProof(
    txHash: BytesLike,
    index?: number
  ): Promise<MessageProof | null> {
    return await this.send('zks_getL2ToL1LogProof', [
      ethers.utils.hexlify(txHash),
      index,
    ]);
  }

  /**
   * Returns the range of blocks contained within a batch given by batch number.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchblockrange zks_getL1BatchBlockRange} JSON-RPC method.
   *
   * @param l1BatchNumber The L1 batch number.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * console.log(`L1 batch block range: ${utils.toJSON(await provider.getL1BatchBlockRange(l1BatchNumber))}`);
   */
  async getL1BatchBlockRange(
    l1BatchNumber: number
  ): Promise<[number, number] | null> {
    const range = await this.send('zks_getL1BatchBlockRange', [l1BatchNumber]);
    if (!range) {
      return null;
    }
    return [parseInt(range[0], 16), parseInt(range[1], 16)];
  }

  /**
   * Returns the Bridgehub smart contract address.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgehubcontract zks_getBridgehubContract} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Bridgehub: ${await provider.getBridgehubContractAddress()}`);
   */
  async getBridgehubContractAddress(): Promise<Address> {
    if (!this.contractAddresses.bridgehubContract) {
      this.contractAddresses.bridgehubContract = await this.send(
        'zks_getBridgehubContract',
        []
      );
    }
    return this.contractAddresses.bridgehubContract!;
  }

  /**
   * Returns the main ZKsync Era smart contract address.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getmaincontract zks_getMainContract} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Main contract: ${await provider.getMainContractAddress()}`);
   */
  async getMainContractAddress(): Promise<Address> {
    if (!this.contractAddresses.mainContract) {
      this.contractAddresses.mainContract = await this.send(
        'zks_getMainContract',
        []
      );
    }
    return this.contractAddresses.mainContract!;
  }

  /**
   * Returns the L1 base token address.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbasetokenl1address zks_getBaseTokenL1Address} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Base token: ${await provider.getBaseTokenContractAddress()}`);
   */
  async getBaseTokenContractAddress(): Promise<Address> {
    if (!this.contractAddresses.baseToken) {
      this.contractAddresses.baseToken = await this.send(
        'zks_getBaseTokenL1Address',
        []
      );
    }
    return ethers.utils.getAddress(this.contractAddresses.baseToken!);
  }

  /**
   * Returns whether the chain is ETH-based.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Is ETH based chain: ${await provider.isEthBasedChain()}`);
   */
  async isEthBasedChain(): Promise<boolean> {
    return isAddressEq(
      await this.getBaseTokenContractAddress(),
      ETH_ADDRESS_IN_CONTRACTS
    );
  }

  /**
   * Returns whether the `token` is the base token.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Is base token: ${await provider.isBaseToken("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
   */
  async isBaseToken(token: Address): Promise<boolean> {
    return (
      isAddressEq(token, await this.getBaseTokenContractAddress()) ||
      isAddressEq(token, L2_BASE_TOKEN_ADDRESS)
    );
  }

  /**
   * Returns the testnet {@link https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters paymaster address}
   * if available, or `null`.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettestnetpaymaster zks_getTestnetPaymaster} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Testnet paymaster: ${await provider.getTestnetPaymasterAddress()}`);
   */
  async getTestnetPaymasterAddress(): Promise<Address | null> {
    // Unlike contract's addresses, the testnet paymaster is not cached, since it can be trivially changed
    // on the fly by the server and should not be relied on to be constant
    return await this.send('zks_getTestnetPaymaster', []);
  }

  /**
   * Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgecontracts zks_getBridgeContracts} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Default bridges: ${utils.toJSON(await provider.getDefaultBridgeAddresses())}`);
   */
  async getDefaultBridgeAddresses(): Promise<{
    erc20L1: string;
    erc20L2: string;
    wethL1: string;
    wethL2: string;
    sharedL1: string;
    sharedL2: string;
  }> {
    if (!this.contractAddresses.erc20BridgeL1) {
      const addresses: {
        l1Erc20DefaultBridge: string;
        l2Erc20DefaultBridge: string;
        l1WethBridge: string;
        l2WethBridge: string;
        l1SharedDefaultBridge: string;
        l2SharedDefaultBridge: string;
      } = await this.send('zks_getBridgeContracts', []);
      this.contractAddresses.erc20BridgeL1 = addresses.l1Erc20DefaultBridge;
      this.contractAddresses.erc20BridgeL2 = addresses.l2Erc20DefaultBridge;
      this.contractAddresses.wethBridgeL1 = addresses.l1WethBridge;
      this.contractAddresses.wethBridgeL2 = addresses.l2WethBridge;
      this.contractAddresses.sharedBridgeL1 = addresses.l1SharedDefaultBridge;
      this.contractAddresses.sharedBridgeL2 = addresses.l2SharedDefaultBridge;
    }
    return {
      erc20L1: this.contractAddresses.erc20BridgeL1,
      erc20L2: this.contractAddresses.erc20BridgeL2!,
      wethL1: this.contractAddresses.wethBridgeL1!,
      wethL2: this.contractAddresses.wethBridgeL2!,
      sharedL1: this.contractAddresses.sharedBridgeL1!,
      sharedL2: this.contractAddresses.sharedBridgeL2!,
    };
  }

  /**
   * Returns contract wrapper. If given address is shared bridge address it returns Il2SharedBridge and if its legacy it returns Il2Bridge.
   **
   * @param address The bridge address.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const l2Bridge = await provider.connectL2Bridge("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
   */
  async connectL2Bridge(
    address: Address
  ): Promise<Il2SharedBridge | Il2Bridge> {
    if (await this.isL2BridgeLegacy(address)) {
      return IL2BridgeFactory.connect(address, this);
    }
    return Il2SharedBridgeFactory.connect(address, this);
  }

  /**
   * Returns true if passed bridge address is legacy and false if its shared bridge.
   **
   * @param address The bridge address.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const isBridgeLegacy = await provider.isL2BridgeLegacy("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
   * console.log(isBridgeLegacy);
   */
  async isL2BridgeLegacy(address: Address): Promise<boolean> {
    const bridge = Il2SharedBridgeFactory.connect(address, this);
    try {
      await bridge.l1SharedBridge();
      return false;
    } catch (e) {
      // skip
    }

    return true;
  }

  /**
   * Returns all balances for confirmed tokens given by an account address.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getallaccountbalances zks_getAllAccountBalances} JSON-RPC method.
   *
   * @param address The account address.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const balances = await provider.getAllAccountBalances("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
   * console.log(`All balances: ${utils.toJSON(balances)}`);
   */
  async getAllAccountBalances(address: Address): Promise<BalancesMap> {
    const balances = await this.send('zks_getAllAccountBalances', [address]);
    for (const token in balances) {
      balances[token] = BigNumber.from(balances[token]);
    }
    return balances;
  }

  /**
   * Returns confirmed tokens. Confirmed token is any token bridged to ZKsync Era via the official bridge.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks_getconfirmedtokens zks_getConfirmedTokens} JSON-RPC method.
   *
   * @param start The token id from which to start.
   * @param limit The maximum number of tokens to list.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const tokens = await provider.getConfirmedTokens();
   * console.log(`Confirmed tokens: ${utils.toJSON(tokens)}`);
   */
  async getConfirmedTokens(start = 0, limit = 255): Promise<Token[]> {
    const tokens: Token[] = await this.send('zks_getConfirmedTokens', [
      start,
      limit,
    ]);
    return tokens.map(token => ({address: token.l2Address, ...token}));
  }

  /**
   * Returns the L1 chain ID.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types} from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const l1ChainId = await provider.l1ChainId();
   * console.log(`All balances: ${l1ChainId}`);
   */
  async l1ChainId(): Promise<number> {
    const res = await this.send('zks_L1ChainId', []);
    return BigNumber.from(res).toNumber();
  }

  /**
   /**
   * Returns the latest L1 batch number.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1batchnumber zks_L1BatchNumber}  JSON-RPC method.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`L1 batch number: ${await provider.getL1BatchNumber()}`);
   */
  async getL1BatchNumber(): Promise<number> {
    const number = await this.send('zks_L1BatchNumber', []);
    return BigNumber.from(number).toNumber();
  }

  /**
   * Returns data pertaining to a given batch.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchdetails zks_getL1BatchDetails} JSON-RPC method.
   *
   * @param number The L1 batch number.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Block details: ${utils.toJSON(await provider.getBlockDetails(90_000))}`);
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
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Block details: ${utils.toJSON(await provider.getBlockDetails(90_000))}`);
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
  async getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails> {
    return await this.send('zks_getTransactionDetails', [txHash]);
  }

  /**
   * Returns bytecode of a contract given by its hash.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbytecodebyhash zks_getBytecodeByHash} JSON-RPC method.
   *
   * @param bytecodeHash The bytecode hash.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * // Bytecode hash can be computed by following these steps:
   * // const testnetPaymasterBytecode = await provider.getCode(await provider.getTestnetPaymasterAddress());
   * // const testnetPaymasterBytecodeHash = ethers.utils.hexlify(utils.hashBytecode(testnetPaymasterBytecode));
   *
   * const testnetPaymasterBytecodeHash = "0x010000f16d2b10ddeb1c32f2c9d222eb1aea0f638ec94a81d4e916c627720e30";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Bytecode: ${await provider.getBytecodeByHash(testnetPaymasterBytecodeHash)}`);
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
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Raw block transactions: ${utils.toJSON(await provider.getRawBlockTransactions(90_000))}`);
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
   * const addressPadded =  ethers.utils.hexZeroPad(address, 32);
   *
   * // Convert the slot number to a hex string and pad it to 32 bytes.
   * const slotPadded =  ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32);
   *
   * // Concatenate the padded address and slot number.
   * const concatenated = addressPadded + slotPadded.slice(2); // slice to remove '0x' from the slotPadded
   *
   * // Hash the concatenated string using Keccak-256.
   * const storageKey = ethers.utils.keccak256(concatenated);
   *
   * const l1BatchNumber = await provider.getL1BatchNumber();
   * const storageProof = await provider.getProof(utils.NONCE_HOLDER_ADDRESS, [storageKey], l1BatchNumber);
   * console.log(`Storage proof: ${utils.toJSON(storageProof)}`);
   */
  async getProof(
    address: Address,
    keys: string[],
    l1BatchNumber: number
  ): Promise<StorageProof> {
    return await this.send('zks_getProof', [address, keys, l1BatchNumber]);
  }

  /**
   * Executes a transaction and returns its hash, storage logs, and events that would have been generated if the
   * transaction had already been included in the block. The API has a similar behaviour to `eth_sendRawTransaction`
   * but with some extra data returned from it.
   *
   * With this API Consumer apps can apply "optimistic" events in their applications instantly without having to
   * wait for ZKsync block confirmation time.
   *
   * It’s expected that the optimistic logs of two uncommitted transactions that modify the same state will not
   * have causal relationships between each other.
   *
   * Calls the {@link https://docs.zksync.io/build/api.html#zks_sendRawTransactionWithDetailedOutput zks_sendRawTransactionWithDetailedOutput} JSON-RPC method.
   *
   * @param signedTx The signed transaction that needs to be broadcasted.
   *
   * @example
   *
   * import { Provider, Wallet, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const PRIVATE_KEY = "<PRIVATE_KEY>";
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const wallet = new Wallet(PRIVATE_KEY, provider);
   *
   * const txWithOutputs = await provider.sendRawTransactionWithDetailedOutput(
   *  await wallet.signTransaction({
   *    to: Wallet.createRandom().address,
   *    value: ethers.utils.parseEther("0.01"),
   *  })
   * );
   *
   * console.log(`Transaction with detailed output: ${utils.toJSON(txWithOutputs)}`);
   */
  async sendRawTransactionWithDetailedOutput(
    signedTx: string
  ): Promise<TransactionWithDetailedOutput> {
    return await this.send('zks_sendRawTransactionWithDetailedOutput', [
      signedTx,
    ]);
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
  async getWithdrawTx(transaction: {
    token: Address;
    amount: BigNumberish;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.CallOverrides;
  }): Promise<ethers.providers.TransactionRequest> {
    const {...tx} = transaction;

    if (!tx.token) {
      tx.token = L2_BASE_TOKEN_ADDRESS;
    } else if (
      isAddressEq(tx.token, LEGACY_ETH_ADDRESS) ||
      isAddressEq(tx.token, ETH_ADDRESS_IN_CONTRACTS)
    ) {
      tx.token = await this.l2TokenAddress(tx.token);
    }

    if (!tx.to && !tx.from) {
      throw new Error('Withdrawal target address is undefined!');
    }

    tx.to ??= tx.from;
    tx.overrides ??= {};
    tx.overrides.from ??= tx.from;

    if (isAddressEq(tx.token, L2_BASE_TOKEN_ADDRESS)) {
      if (!tx.overrides.value) {
        tx.overrides.value = tx.amount;
      }
      const passedValue = BigNumber.from(tx.overrides.value);

      if (!passedValue.eq(tx.amount)) {
        // To avoid users shooting themselves into the foot, we will always use the amount to withdraw
        // as the value

        throw new Error('The tx.value is not equal to the value withdrawn!');
      }

      const ethL2Token = IEthTokenFactory.connect(L2_BASE_TOKEN_ADDRESS, this);
      const populatedTx = await ethL2Token.populateTransaction.withdraw(
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
      tx.bridgeAddress = bridgeAddresses.sharedL2;
    }

    const bridge = await this.connectL2Bridge(tx.bridgeAddress);
    const populatedTx = await bridge.populateTransaction.withdraw(
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
  async estimateGasWithdraw(transaction: {
    token: Address;
    amount: BigNumberish;
    from?: Address;
    to?: Address;
    bridgeAddress?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.CallOverrides;
  }): Promise<BigNumber> {
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
  async getTransferTx(transaction: {
    to: Address;
    amount: BigNumberish;
    from?: Address;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.CallOverrides;
  }): Promise<ethers.providers.TransactionRequest> {
    const {...tx} = transaction;
    if (!tx.token) {
      tx.token = L2_BASE_TOKEN_ADDRESS;
    } else if (
      isAddressEq(tx.token, LEGACY_ETH_ADDRESS) ||
      isAddressEq(tx.token, ETH_ADDRESS_IN_CONTRACTS)
    ) {
      tx.token = await this.l2TokenAddress(tx.token);
    }

    tx.overrides ??= {};
    tx.overrides.from ??= tx.from;

    if (isAddressEq(tx.token, L2_BASE_TOKEN_ADDRESS)) {
      if (tx.paymasterParams) {
        return {
          ...(await ethers.utils.resolveProperties(tx.overrides)),
          type: EIP712_TX_TYPE,
          to: tx.to,
          value: tx.amount,
          customData: {
            paymasterParams: tx.paymasterParams,
          },
        };
      }

      return {
        ...(await ethers.utils.resolveProperties(tx.overrides)),
        to: tx.to,
        value: tx.amount,
      };
    } else {
      const token = IERC20Factory.connect(tx.token, this);
      const populatedTx = await token.populateTransaction.transfer(
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
  async estimateGasTransfer(transaction: {
    to: Address;
    amount: BigNumberish;
    from?: Address;
    token?: Address;
    paymasterParams?: PaymasterParams;
    overrides?: ethers.CallOverrides;
  }): Promise<BigNumber> {
    const transferTx = await this.getTransferTx(transaction);
    return await this.estimateGas(transferTx);
  }

  /**
   * Creates a new `Provider` from provided URL or network name.
   *
   * @param zksyncNetwork The type of ZKsync network.
   *
   * @example
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
        return new Provider('http://127.0.0.1:3050');
      case ZkSyncNetwork.Sepolia:
        return new Provider('https://sepolia.era.zksync.dev');
      case ZkSyncNetwork.Mainnet:
        return new Provider('https://mainnet.era.zksync.io');
      case ZkSyncNetwork.EraTestNode:
        return new Provider('http://127.0.0.1:8011');
      default:
        return new Provider('http://127.0.0.1:3050');
    }
  }

  /**
   * Returns a new filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newFilter}
   * and passing a filter object.
   *
   * @param filter The filter query to apply.
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
  async newFilter(
    filter: EventFilter | Promise<EventFilter>
  ): Promise<BigNumber> {
    filter = await filter;
    const id = await this.send('eth_newFilter', [this._prepareFilter(filter)]);
    return BigNumber.from(id);
  }

  /**
   * Returns a new block filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newBlockFilter}.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`New block filter: ${await provider.newBlockFilter()}`);
   */
  async newBlockFilter(): Promise<BigNumber> {
    const id = await this.send('eth_newBlockFilter', []);
    return BigNumber.from(id);
  }

  /**
   * Returns a new pending transaction filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newPendingTransactionFilter}.
   *
   * @example
   *
   * import { Provider, types } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`New pending transaction filter: ${await provider.newPendingTransactionsFilter()}`);
   */
  async newPendingTransactionsFilter(): Promise<BigNumber> {
    const id = await this.send('eth_newPendingTransactionFilter', []);
    return BigNumber.from(id);
  }

  /**
   * Returns an array of logs by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_getFilterChanges}.
   *
   * @param idx The filter index.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const filter = await provider.newFilter({
   *   address: utils.L2_ETH_TOKEN_ADDRESS,
   *   topics: [ethers.id("Transfer(address,address,uint256)")],
   * });
   * const result = await provider.getFilterChanges(filter);
   */
  async getFilterChanges(idx: BigNumber): Promise<Array<Log | string>> {
    const logs = await this.send('eth_getFilterChanges', [idx.toHexString()]);
    return typeof logs[0] === 'string' ? logs : this._parseLogs(logs);
  }

  /**
   * Resolves to the list of Logs that match `filter`.
   *
   * @param filter The filter criteria to apply.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * console.log(`Logs: ${utils.toJSON(await provider.getLogs({ fromBlock: 0, toBlock: 5, address: utils.L2_ETH_TOKEN_ADDRESS }))}`);
   */
  override async getLogs(
    filter: EventFilter | Promise<EventFilter> = {}
  ): Promise<Array<Log>> {
    filter = await filter;
    const logs = await this.send('eth_getLogs', [this._prepareFilter(filter)]);
    return this._parseLogs(logs);
  }

  protected _parseLogs(logs: any[]): Array<Log> {
    return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(
      logs
    );
  }

  protected _prepareFilter(filter: EventFilter) {
    return {
      ...filter,
      fromBlock:
        filter.fromBlock === null || filter.fromBlock === undefined
          ? null
          : this.formatter.blockTag(filter.fromBlock),
      toBlock:
        filter.fromBlock === null || filter.fromBlock === undefined
          ? null
          : this.formatter.blockTag(filter.toBlock),
    };
  }

  override _wrapTransaction(
    tx: ethers.Transaction,
    hash?: string
  ): TransactionResponse {
    const response = super._wrapTransaction(tx, hash) as TransactionResponse;

    response.waitFinalize = async () => {
      const receipt = await response.wait();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const block = await this.getBlock('finalized');
        if (receipt.blockNumber <= block.number) {
          return await this.getTransactionReceipt(receipt.transactionHash);
        } else {
          await sleep(this.pollingInterval);
        }
      }
    };

    return response;
  }

  /**
   * Returns the status of a specified transaction.
   *
   * @param txHash The hash of the transaction.
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
  // This is inefficient. Status should probably be indicated in the transaction receipt.
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    const tx = await this.getTransaction(txHash);
    if (!tx) {
      return TransactionStatus.NotFound;
    }
    if (!tx.blockNumber) {
      return TransactionStatus.Processing;
    }
    const verifiedBlock = await this.getBlock('finalized');
    if (tx.blockNumber <= verifiedBlock.number) {
      return TransactionStatus.Finalized;
    }
    return TransactionStatus.Committed;
  }

  /**
   * Resolves to the transaction for `hash`.
   * If the transaction is unknown or on pruning nodes which discard old transactions this resolves to `null`.
   *
   * @param [hash] The hash of the transaction.
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
  override async getTransaction(
    hash: string | Promise<string>
  ): Promise<TransactionResponse> {
    hash = await hash;
    const tx = await super.getTransaction(hash);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return tx ? this._wrapTransaction(tx, hash) : null;
  }

  /**
   * Broadcasts the `transaction` to the network, adding it to the memory pool of any node for which the transaction
   * meets the rebroadcast requirements.
   *
   * @param transaction The signed transaction that needs to be broadcasted.
   * @returns A promise that resolves with the transaction response.
   */
  override async sendTransaction(
    transaction: string | Promise<string>
  ): Promise<TransactionResponse> {
    return (await super.sendTransaction(transaction)) as TransactionResponse;
  }

  /**
   * Returns a L2 transaction response from L1 transaction response.
   *
   * @param l1TxResponse The L1 transaction response.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getL2TransactionFromPriorityOp(l1TxResponse))}`);
   * }
   */
  async getL2TransactionFromPriorityOp(
    l1TxResponse: ethers.providers.TransactionResponse
  ): Promise<TransactionResponse> {
    const receipt = await l1TxResponse.wait();
    const l2Hash = getL2HashFromPriorityOp(
      receipt,
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
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getPriorityOpResponse(l1TxResponse))}`);
   * }
   */
  async getPriorityOpResponse(
    l1TxResponse: ethers.providers.TransactionResponse
  ): Promise<PriorityOpResponse> {
    const l2Response = {...l1TxResponse} as PriorityOpResponse;

    l2Response.waitL1Commit = l1TxResponse.wait.bind(
      l1TxResponse
    ) as PriorityOpResponse['waitL1Commit'];
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

  async _getPriorityOpConfirmationL2ToL1Log(txHash: string, index = 0) {
    const hash = ethers.utils.hexlify(txHash);
    const receipt = await this.getTransactionReceipt(hash);
    const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(
      ([, log]) => isAddressEq(log.sender, BOOTLOADER_FORMAL_ADDRESS)
    );
    const [l2ToL1LogIndex, l2ToL1Log] = messages[index];

    return {
      l2ToL1LogIndex,
      l2ToL1Log,
      l1BatchTxId: receipt.l1BatchTxIndex,
    };
  }

  /**
   * Returns the transaction confirmation data that is part of `L2->L1` message.
   *
   * @param txHash The hash of the L2 transaction where the message was initiated.
   * @param [index=0] In case there were multiple transactions in one message, you may pass an index of the
   * transaction which confirmation data should be fetched.
   * @throws {Error} If log proof can not be found.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Confirmation data: ${utils.toJSON(await provider.getPriorityOpConfirmation(tx, 0))}`);
   */
  async getPriorityOpConfirmation(txHash: string, index = 0) {
    const {l2ToL1LogIndex, l2ToL1Log, l1BatchTxId} =
      await this._getPriorityOpConfirmationL2ToL1Log(txHash, index);
    const proof = await this.getLogProof(txHash, l2ToL1LogIndex);
    if (!proof) {
      throw new Error('Log proof not found!');
    }
    return {
      l1BatchNumber: l2ToL1Log.l1BatchNumber,
      l2MessageIndex: proof.id,
      l2TxNumberInBlock: l1BatchTxId,
      proof: proof.proof,
    };
  }

  /**
   * Returns the version of the supported account abstraction and nonce ordering from a given contract address.
   *
   * @param address The contract address.
   *
   * @example
   *
   * import { Provider, types, utils } from "zksync-ethers";
   *
   * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
   * const tokenAddress = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * console.log(`Contract account info: ${utils.toJSON(await provider.getContractAccountInfo(tokenAddress))}`);
   */
  async getContractAccountInfo(address: Address): Promise<ContractAccountInfo> {
    const deployerContract = new Contract(
      CONTRACT_DEPLOYER_ADDRESS,
      CONTRACT_DEPLOYER,
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
   * console.log(`Gas L1 to L2: ${gasL1ToL2}`);
   */
  async estimateL1ToL2Execute(transaction: {
    contractAddress: Address;
    calldata: BytesLike;
    caller?: Address;
    l2Value?: BigNumberish;
    factoryDeps?: ethers.BytesLike[];
    gasPerPubdataByte?: BigNumberish;
    overrides?: ethers.PayableOverrides;
  }): Promise<BigNumber> {
    transaction.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;

    // If the `from` address is not provided, we use a random address, because
    // due to storage slot aggregation, the gas estimation will depend on the address
    // and so estimation for the zero address may be smaller than for the sender.
    transaction.caller ??= ethers.Wallet.createRandom().address;

    const customData = {
      gasPerPubdataByte: transaction.gasPerPubdataByte,
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
}

/* c8 ignore start */
/**
 * A `Web3Provider` extends {@link ExternalProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 * This provider is designed for frontend use in a browser environment and integration for browser wallets
 * (e.g., MetaMask, WalletConnect).
 */
export class Web3Provider extends Provider {
  readonly provider: ExternalProvider;

  /**
   * Connects to the `ethereum` provider, optionally forcing the `network`.
   *
   * @param provider The provider injected from the browser. For instance, Metamask is `window.ethereum`.
   * @param [network] The network name, chain ID, or object with network details.
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   */
  constructor(
    provider: ExternalProvider,
    network?: ethers.providers.Networkish
  ) {
    if (!provider) {
      throw new Error('Missing provider!');
    }
    if (!provider.request) {
      throw new Error('Provider must implement eip-1193!');
    }

    const path =
      provider.host ||
      provider.path ||
      (provider.isMetaMask ? 'metamask' : 'eip-1193:');
    super(path, network);
    this.provider = provider;
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Block: ${utils.toJSON(await provider.getBlock("latest", true))}`);
   */
  override async getBlock(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  ): Promise<Block> {
    return super.getBlock(blockHashOrBlockTag);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Block: ${utils.toJSON(await provider.getBlockWithTransactions("latest", true))}`);
   */
  override async getBlockWithTransactions(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  ): Promise<BlockWithTransactions> {
    return super.getBlockWithTransactions(blockHashOrBlockTag);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Logs: ${utils.toJSON(await provider.getLogs({ fromBlock: 0, toBlock: 5, address: utils.L2_ETH_TOKEN_ADDRESS }))}`);
   */
  override async getLogs(
    filter: EventFilter | Promise<EventFilter> = {}
  ): Promise<Array<Log>> {
    return super.getLogs(filter);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const account = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
   * const tokenAddress = "0x927488F48ffbc32112F1fF721759649A89721F8F"; // Crown token which can be minted for free
   * console.log(`ETH balance: ${await provider.getBalance(account)}`);
   * console.log(`Token balance: ${await provider.getBalance(account, "latest", tokenAddress)}`);
   */
  override async getBalance(
    address: Address,
    blockTag?: BlockTag,
    tokenAddress?: Address
  ): Promise<BigNumber> {
    return super.getBalance(address, blockTag, tokenAddress);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Protocol version: ${await provider.getProtocolVersion()}`);
   */
  override async getProtocolVersion(id?: number): Promise<ProtocolVersion> {
    return super.getProtocolVersion(id);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const gasL1 = await provider.estimateGasL1({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: await provider.getMainContractAddress(),
   *   value: 7_000_000_000,
   *   customData: {
   *     gasPerPubdata: 800,
   *   },
   * });
   * console.log(`L1 gas: ${gasL1}`);
   */
  override async estimateGasL1(
    transaction: TransactionRequest
  ): Promise<BigNumber> {
    return super.estimateGasL1(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const fee = await provider.estimateFee({
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   value: BigNumber.from(7_000_000_000).toHexString(),
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const feeParams = await provider.getFeeParams();
   * console.log(`Fee: ${utils.toJSON(feeParams)}`);
   */
  override async getFeeParams(): Promise<FeeParams> {
    return super.getFeeParams();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Gas price: ${await provider.getGasPrice()}`);
   */
  override async getGasPrice(): Promise<BigNumber> {
    return super.getGasPrice();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Log ${utils.toJSON(await provider.getLogProof(tx, 0))}`);
   */
  override async getLogProof(
    txHash: BytesLike,
    index?: number
  ): Promise<LogProof | null> {
    return super.getLogProof(txHash, index);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Bridgehub: ${await provider.getBridgehubContractAddress()}`);
   */
  override async getBridgehubContractAddress(): Promise<Address> {
    return super.getBridgehubContractAddress();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Base token: ${await provider.getBaseTokenContractAddress()}`);
   */
  override async getBaseTokenContractAddress(): Promise<Address> {
    return super.getBaseTokenContractAddress();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Is ETH based chain: ${await provider.isEthBasedChain()}`);
   */
  override async isEthBasedChain(): Promise<boolean> {
    return super.isEthBasedChain();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Is base token: ${await provider.isBaseToken("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
   */
  override async isBaseToken(token: Address): Promise<boolean> {
    return super.isBaseToken(token);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`Bridge addresses: ${await provider.getDefaultBridgeAddresses()}`);
   */
  override async getDefaultBridgeAddresses(): Promise<{
    erc20L1: string;
    erc20L2: string;
    wethL1: string;
    wethL2: string;
    sharedL1: string;
    sharedL2: string;
  }> {
    return super.getDefaultBridgeAddresses();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const tokens = await provider.getConfirmedTokens();
   * console.log(`Confirmed tokens: ${utils.toJSON(tokens)}`);
   */
  override async getConfirmedTokens(start = 0, limit = 255): Promise<Token[]> {
    return super.getConfirmedTokens(start, limit);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * // Bytecode hash can be computed by following these steps:
   * // const testnetPaymasterBytecode = await provider.getCode(await provider.getTestnetPaymasterAddress());
   * // const testnetPaymasterBytecodeHash = ethers.utils.hexlify(utils.hashBytecode(testnetPaymasterBytecode));
   *
   * const testnetPaymasterBytecodeHash = "0x010000f16d2b10ddeb1c32f2c9d222eb1aea0f638ec94a81d4e916c627720e30";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const address = "0x082b1BB53fE43810f646dDd71AA2AB201b4C6b04";
   *
   * // Fetching the storage proof for rawNonces storage slot in NonceHolder system contract.
   * // mapping(uint256 => uint256) internal rawNonces;
   *
   * // Ensure the address is a 256-bit number by padding it
   * // because rawNonces slot uses uint256 for mapping addresses and their nonces.
   * const addressPadded =  ethers.utils.hexZeroPad(address, 32);
   *
   * // Convert the slot number to a hex string and pad it to 32 bytes.
   * const slotPadded =  ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32);
   *
   * // Concatenate the padded address and slot number.
   * const concatenated = addressPadded + slotPadded.slice(2); // slice to remove '0x' from the slotPadded
   *
   * // Hash the concatenated string using Keccak-256.
   * const storageKey = ethers.utils.keccak256(concatenated);
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
   * @example
   *
   * import { Web3Provider, Wallet, Provider, utils, types } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = Signer.from(
   *     await provider.getSigner(),
   *     Number((await provider.getNetwork()).chainId),
   *     Provider.getDefaultProvider(types.Network.Sepolia)
   * );
   *
   * const txWithOutputs = await provider.sendRawTransactionWithDetailedOutput(
   *   await signer.signTransaction({
   *     Wallet.createRandom().address,
   *     amount: ethers.utils.parseEther("0.01"),
   *   })
   * );
   * console.log(`Transaction with detailed output: ${utils.toJSON(txWithOutputs)}`);
   */
  override async sendRawTransactionWithDetailedOutput(
    signedTx: string
  ): Promise<TransactionWithDetailedOutput> {
    return super.sendRawTransactionWithDetailedOutput(signedTx);
  }

  /**
   * @inheritDoc
   *
   * @example Retrieve populated ETH withdrawal transactions.
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
  }): Promise<BigNumber> {
    return super.estimateGasWithdraw(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example Retrieve populated ETH transfer transaction.
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
  }): Promise<BigNumber> {
    return super.estimateGasTransfer(transaction);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(
   *   `New filter: ${await provider.newFilter({
   *     fromBlock: 0,
   *     toBlock: 5,
   *     address: utils.L2_ETH_TOKEN_ADDRESS,
   *   })}`
   * );
   */
  override async newFilter(
    filter: EventFilter | Promise<EventFilter>
  ): Promise<BigNumber> {
    return super.newFilter(filter);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`New block filter: ${await provider.newBlockFilter()}`);
   */
  override async newBlockFilter(): Promise<BigNumber> {
    return super.newBlockFilter();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * console.log(`New pending transaction filter: ${await provider.newPendingTransactionsFilter()}`);
   */
  override async newPendingTransactionsFilter(): Promise<BigNumber> {
    return super.newPendingTransactionsFilter();
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   * import { ethers } from "ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const filter = await provider.newFilter({
   *   address: utils.L2_ETH_TOKEN_ADDRESS,
   *   topics: [ethers.utils.id("Transfer(address,address,uint256)")],
   * });
   * const result = await provider.getFilterChanges(filter);
   */
  override async getFilterChanges(
    idx: BigNumber
  ): Promise<Array<Log | string>> {
    return super.getFilterChanges(idx);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getL2TransactionFromPriorityOp(l1TxResponse))}`);
   * }
   */
  override async getL2TransactionFromPriorityOp(
    l1TxResponse: ethers.providers.TransactionResponse
  ): Promise<TransactionResponse> {
    return super.getL2TransactionFromPriorityOp(l1TxResponse);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const ethProvider = ethers.getDefaultProvider("sepolia");
   * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
   * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
   * if (l1TxResponse) {
   *   console.log(`Tx: ${utils.toJSON(await provider.getPriorityOpResponse(l1TxResponse))}`);
   * }
   */
  override async getPriorityOpResponse(
    l1TxResponse: ethers.providers.TransactionResponse
  ): Promise<PriorityOpResponse> {
    return super.getPriorityOpResponse(l1TxResponse);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * // Any L2 -> L1 transaction can be used.
   * // In this case, withdrawal transaction is used.
   * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
   * console.log(`Confirmation data: ${utils.toJSON(await provider.getPriorityOpConfirmation(tx, 0))}`);
   */
  override async getPriorityOpConfirmation(
    txHash: string,
    index = 0
  ): Promise<{
    l1BatchNumber: number;
    l2MessageIndex: number;
    l2TxNumberInBlock: number;
    proof: string[];
  }> {
    return super.getPriorityOpConfirmation(txHash, index);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
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
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const gasL1ToL2 = await provider.estimateL1ToL2Execute({
   *   contractAddress: await provider.getMainContractAddress(),
   *   calldata: "0x",
   *   caller: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   l2Value: 7_000_000_000,
   * });
   * console.log(`Gas L1 to L2: ${gasL1ToL2}`);
   */
  override async estimateL1ToL2Execute(transaction: {
    contractAddress: Address;
    calldata: string;
    caller?: Address;
    l2Value?: BigNumberish;
    factoryDeps?: BytesLike[];
    gasPerPubdataByte?: BigNumberish;
    overrides?: ethers.Overrides;
  }): Promise<BigNumber> {
    return super.estimateL1ToL2Execute(transaction);
  }

  override async send(method: string, params?: Array<any>): Promise<any> {
    params ??= [];
    // Metamask complains about eth_sign (and on some versions hangs)
    if (
      method === 'eth_sign' &&
      (this.provider.isMetaMask || this.provider.isStatus)
    ) {
      // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
      method = 'personal_sign';
      params = [params[1], params[0]];
    }
    return await this.provider.request!({method, params});
  }

  /**
   * Resolves to the `Signer` account for `address` managed by the client.
   * If the `address` is a number, it is used as an index in the accounts from `listAccounts`.
   * This can only be used on clients which manage accounts (e.g. MetaMask).
   *
   * @param addressOrIndex The address or index of the account to retrieve the signer for.
   *
   * @throws {Error} If the account doesn't exist.
   *
   * @example
   *
   * import { Web3Provider, utils } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const signer = await provider.getSigner();
   */
  override getSigner(addressOrIndex?: number | string): Signer {
    return Signer.from(super.getSigner(addressOrIndex) as any);
  }

  /**
   * @inheritDoc
   *
   * @example
   *
   * import { Web3Provider } from "zksync-ethers";
   *
   * const provider = new Web3Provider(window.ethereum);
   * const gas = await provider.estimateGas({
   *   value: 7_000_000_000,
   *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
   *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * });
   */
  override async estimateGas(
    transaction: ethers.utils.Deferrable<TransactionRequest>
  ): Promise<BigNumber> {
    const gas: BigNumber = await super.estimateGas(transaction);
    const metamaskMinimum = BigNumber.from(21_000);
    const isEIP712 =
      transaction.customData || transaction.type === EIP712_TX_TYPE;
    return gas.gt(metamaskMinimum) || isEIP712 ? gas : metamaskMinimum;
  }
}
/* c8 ignore stop */
