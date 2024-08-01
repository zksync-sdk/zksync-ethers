import { ethers, BigNumberish, BytesLike, BlockTag, Filter, FilterByBlockHash, TransactionRequest as EthersTransactionRequest, JsonRpcTransactionRequest, Networkish, Eip1193Provider, JsonRpcError, JsonRpcResult, JsonRpcPayload } from 'ethers';
import { IL2Bridge, IL2SharedBridge } from './typechain';
import { Address, TransactionResponse, TransactionRequest, TransactionStatus, PriorityOpResponse, BalancesMap, TransactionReceipt, Block, Log, TransactionDetails, BlockDetails, ContractAccountInfo, Network as ZkSyncNetwork, BatchDetails, Fee, RawBlockTransaction, PaymasterParams, StorageProof, LogProof, Token, ProtocolVersion, FeeParams, TransactionWithDetailedOutput } from './types';
import { Signer } from './signer';
type Constructor<T = {}> = new (...args: any[]) => T;
export declare function JsonRpcApiProvider<TBase extends Constructor<ethers.JsonRpcApiProvider>>(ProviderType: TBase): {
    new (...args: any[]): {
        /**
         * Sends a JSON-RPC `_payload` (or a batch) to the underlying channel.
         *
         * @param _payload The JSON-RPC payload or batch of payloads to send.
         * @returns A promise that resolves to the result of the JSON-RPC request(s).
         */
        _send(_payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
        /**
         * Returns the addresses of the main contract and default ZKsync Era bridge contracts on both L1 and L2.
         */
        contractAddresses(): {
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
        _getBlockTag(blockTag?: BlockTag): string | Promise<string>;
        _wrapLog(value: any): Log;
        _wrapBlock(value: any): Block;
        _wrapTransactionResponse(value: any): TransactionResponse;
        _wrapTransactionReceipt(value: any): TransactionReceipt;
        /**
         * Resolves to the transaction receipt for `txHash`, if mined.
         * If the transaction has not been mined, is unknown or on pruning nodes which discard old transactions
         * this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
        /**
         * Resolves to the transaction for `txHash`.
         * If the transaction is unknown or on pruning nodes which discard old transactions this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        getTransaction(txHash: string): Promise<TransactionResponse>;
        /**
         * Resolves to the block corresponding to the provided `blockHashOrBlockTag`.
         * If `includeTxs` is set to `true` and the backend supports including transactions with block requests,
         * all transactions will be included in the returned block object, eliminating the need for remote calls
         * to fetch transactions separately.
         *
         * @param blockHashOrBlockTag The hash or tag of the block to retrieve.
         * @param [includeTxs] A flag indicating whether to include transactions in the block.
         */
        getBlock(blockHashOrBlockTag: BlockTag, includeTxs?: boolean): Promise<Block>;
        /**
         * Resolves to the list of Logs that match `filter`.
         *
         * @param filter The filter criteria to apply.
         */
        getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]>;
        /**
         * Returns the account balance  for the specified account `address`, `blockTag`, and `tokenAddress`.
         * If `blockTag` and `tokenAddress` are not provided, the balance for the latest committed block and ETH token
         * is returned by default.
         *
         * @param address The account address for which the balance is retrieved.
         * @param [blockTag] The block tag for getting the balance on. Latest committed block is the default.
         * @param [tokenAddress] The token address. ETH is the default token.
         */
        getBalance(address: Address, blockTag?: BlockTag, tokenAddress?: Address): Promise<bigint>;
        /**
         * Returns the L2 token address equivalent for a L1 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L1.
         * @param bridgeAddress The address of custom bridge, which will be used to get l2 token address.
         */
        l2TokenAddress(token: Address, bridgeAddress?: Address): Promise<string>;
        /**
         * Returns the L1 token address equivalent for a L2 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L2.
         */
        l1TokenAddress(token: Address): Promise<string>;
        /**
         * Return the protocol version.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getprotocolversion zks_getProtocolVersion} JSON-RPC method.
         *
         * @param [id] Specific version ID.
         */
        getProtocolVersion(id?: number): Promise<ProtocolVersion>;
        /**
         * Returns an estimate of the amount of gas required to submit a transaction from L1 to L2 as a bigint object.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-estimategasl1tol2 zks_estimateL1ToL2} JSON-RPC method.
         *
         * @param transaction The transaction request.
         */
        estimateGasL1(transaction: TransactionRequest): Promise<bigint>;
        /**
         * Returns an estimated {@link Fee} for requested transaction.
         *
         * @param transaction The transaction request.
         */
        estimateFee(transaction: TransactionRequest): Promise<Fee>;
        /**
         * Returns the current fee parameters.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getFeeParams zks_getFeeParams} JSON-RPC method.
         */
        getFeeParams(): Promise<FeeParams>;
        /**
         * Returns an estimate (best guess) of the gas price to use in a transaction.
         */
        getGasPrice(): Promise<bigint>;
        /**
         * Returns the proof for a transaction's L2 to L1 log sent via the `L1Messenger` system contract.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl2tol1logproof zks_getL2ToL1LogProof} JSON-RPC method.
         *
         * @param txHash The hash of the L2 transaction the L2 to L1 log was produced within.
         * @param [index] The index of the L2 to L1 log in the transaction.
         */
        getLogProof(txHash: BytesLike, index?: number): Promise<LogProof | null>;
        /**
         * Returns the range of blocks contained within a batch given by batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchblockrange zks_getL1BatchBlockRange} JSON-RPC method.
         *
         * @param l1BatchNumber The L1 batch number.
         */
        getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
        /**
         * Returns the Bridgehub smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgehubcontract zks_getBridgehubContract} JSON-RPC method.
         */
        getBridgehubContractAddress(): Promise<Address>;
        /**
         * Returns the main ZKsync Era smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getmaincontract zks_getMainContract} JSON-RPC method.
         */
        getMainContractAddress(): Promise<Address>;
        /**
         * Returns the L1 base token address.
         */
        getBaseTokenContractAddress(): Promise<Address>;
        /**
         * Returns whether the chain is ETH-based.
         */
        isEthBasedChain(): Promise<boolean>;
        /**
         * Returns whether the `token` is the base token.
         */
        isBaseToken(token: Address): Promise<boolean>;
        /**
         * Returns the testnet {@link https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters paymaster address}
         * if available, or `null`.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettestnetpaymaster zks_getTestnetPaymaster} JSON-RPC method.
         */
        getTestnetPaymasterAddress(): Promise<Address | null>;
        /**
         * Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgecontracts zks_getBridgeContracts} JSON-RPC method.
         */
        getDefaultBridgeAddresses(): Promise<{
            erc20L1: string;
            erc20L2: string;
            wethL1: string;
            wethL2: string;
            sharedL1: string;
            sharedL2: string;
        }>;
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
         * const l2Bridge = await provider.connectL2Bridge("<L2_BRIDGE_ADDRESS>");
         */
        connectL2Bridge(address: Address): Promise<IL2SharedBridge | IL2Bridge>;
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
         * const isBridgeLegacy = await provider.isL2BridgeLegacy("<L2_BRIDGE_ADDRESS>");
         * console.log(isBridgeLegacy);
         */
        isL2BridgeLegacy(address: Address): Promise<boolean>;
        /**
         * Returns all balances for confirmed tokens given by an account address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getallaccountbalances zks_getAllAccountBalances} JSON-RPC method.
         *
         * @param address The account address.
         */
        getAllAccountBalances(address: Address): Promise<BalancesMap>;
        /**
         * Returns confirmed tokens. Confirmed token is any token bridged to ZKsync Era via the official bridge.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getconfirmedtokens zks_getConfirmedTokens} JSON-RPC method.
         *
         * @param start The token id from which to start.
         * @param limit The maximum number of tokens to list.
         */
        getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
        /**
         * Returns the L1 chain ID.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
         */
        l1ChainId(): Promise<number>;
        /**
         * Returns the latest L1 batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1batchnumber zks_L1BatchNumber}  JSON-RPC method.
         */
        getL1BatchNumber(): Promise<number>;
        /**
         * Returns data pertaining to a given batch.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchdetails zks_getL1BatchDetails} JSON-RPC method.
         *
         * @param number The L1 batch number.
         */
        getL1BatchDetails(number: number): Promise<BatchDetails>;
        /**
         * Returns additional zkSync-specific information about the L2 block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getblockdetails zks_getBlockDetails}  JSON-RPC method.
         *
         * @param number The block number.
         */
        getBlockDetails(number: number): Promise<BlockDetails>;
        /**
         * Returns data from a specific transaction given by the transaction hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettransactiondetails zks_getTransactionDetails} JSON-RPC method.
         *
         * @param txHash The transaction hash.
         */
        getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails>;
        /**
         * Returns bytecode of a contract given by its hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbytecodebyhash zks_getBytecodeByHash} JSON-RPC method.
         *
         * @param bytecodeHash The bytecode hash.
         */
        getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array>;
        /**
         * Returns data of transactions in a block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getrawblocktransactions zks_getRawBlockTransactions}  JSON-RPC method.
         *
         * @param number The block number.
         */
        getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
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
        getProof(address: Address, keys: string[], l1BatchNumber: number): Promise<StorageProof>;
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
         */
        sendRawTransactionWithDetailedOutput(signedTx: string): Promise<TransactionWithDetailedOutput>;
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
        getWithdrawTx(transaction: {
            token: Address;
            amount: BigNumberish;
            from?: Address;
            to?: Address;
            bridgeAddress?: Address;
            paymasterParams?: PaymasterParams;
            overrides?: ethers.Overrides;
        }): Promise<EthersTransactionRequest>;
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
        estimateGasWithdraw(transaction: {
            token: Address;
            amount: BigNumberish;
            from?: Address;
            to?: Address;
            bridgeAddress?: Address;
            paymasterParams?: PaymasterParams;
            overrides?: ethers.Overrides;
        }): Promise<bigint>;
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
        getTransferTx(transaction: {
            to: Address;
            amount: BigNumberish;
            from?: Address;
            token?: Address;
            paymasterParams?: PaymasterParams;
            overrides?: ethers.Overrides;
        }): Promise<EthersTransactionRequest>;
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
        estimateGasTransfer(transaction: {
            to: Address;
            amount: BigNumberish;
            from?: Address;
            token?: Address;
            paymasterParams?: PaymasterParams;
            overrides?: ethers.Overrides;
        }): Promise<bigint>;
        /**
         * Returns a new filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newFilter}
         * and passing a filter object.
         *
         * @param filter The filter query to apply.
         */
        newFilter(filter: FilterByBlockHash | Filter): Promise<bigint>;
        /**
         * Returns a new block filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newBlockFilter}.
         */
        newBlockFilter(): Promise<bigint>;
        /**
         * Returns a new pending transaction filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newPendingTransactionFilter}.
         */
        newPendingTransactionsFilter(): Promise<bigint>;
        /**
         * Returns an array of logs by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_getFilterChanges}.
         *
         * @param idx The filter index.
         */
        getFilterChanges(idx: bigint): Promise<Array<Log | string>>;
        /**
         * Returns the status of a specified transaction.
         *
         * @param txHash The hash of the transaction.
         */
        getTransactionStatus(txHash: string): Promise<TransactionStatus>;
        /**
         * Broadcasts the `signedTx` to the network, adding it to the memory pool of any node for which the transaction
         * meets the rebroadcast requirements.
         *
         * @param signedTx The signed transaction that needs to be broadcasted.
         * @returns A promise that resolves with the transaction response.
         */
        broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
        /**
         * Returns a L2 transaction response from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        getL2TransactionFromPriorityOp(l1TxResponse: ethers.TransactionResponse): Promise<TransactionResponse>;
        /**
         * Returns a {@link PriorityOpResponse} from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        getPriorityOpResponse(l1TxResponse: ethers.TransactionResponse): Promise<PriorityOpResponse>;
        _getPriorityOpConfirmationL2ToL1Log(txHash: string, index?: number): Promise<{
            l2ToL1LogIndex: number;
            l2ToL1Log: import("./types").L2ToL1Log;
            l1BatchTxId: number | null;
        }>;
        /**
         * Returns the transaction confirmation data that is part of `L2->L1` message.
         *
         * @param txHash The hash of the L2 transaction where the message was initiated.
         * @param [index=0] In case there were multiple transactions in one message, you may pass an index of the
         * transaction which confirmation data should be fetched.
         * @throws {Error} If log proof can not be found.
         */
        getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
            l1BatchNumber: number;
            l2MessageIndex: number;
            l2TxNumberInBlock: number | null;
            proof: string[];
        }>;
        /**
         * Returns the version of the supported account abstraction and nonce ordering from a given contract address.
         *
         * @param address The contract address.
         */
        getContractAccountInfo(address: Address): Promise<ContractAccountInfo>;
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
        estimateL1ToL2Execute(transaction: {
            contractAddress: Address;
            calldata: string;
            caller?: Address;
            l2Value?: BigNumberish;
            factoryDeps?: ethers.BytesLike[];
            gasPerPubdataByte?: BigNumberish;
            overrides?: ethers.Overrides;
        }): Promise<bigint>;
        /**
         * Returns `tx` as a normalized JSON-RPC transaction request, which has all values `hexlified` and any numeric
         * values converted to Quantity values.
         * @param tx The transaction request that should be normalized.
         */
        getRpcTransaction(tx: TransactionRequest): JsonRpcTransactionRequest;
        "__#17@#private": any;
        _getOption<K extends keyof ethers.JsonRpcApiProviderOptions>(key: K): ethers.JsonRpcApiProviderOptions[K];
        readonly _network: ethers.Network;
        _perform(req: ethers.PerformActionRequest): Promise<any>;
        _detectNetwork(): Promise<ethers.Network>;
        _start(): void;
        _waitUntilReady(): Promise<void>;
        _getSubscriber(sub: ethers.Subscription): ethers.Subscriber;
        readonly ready: boolean;
        getRpcRequest(req: ethers.PerformActionRequest): {
            method: string;
            args: any[];
        } | null;
        getRpcError(payload: ethers.JsonRpcPayload, _error: ethers.JsonRpcError): Error;
        send(method: string, params: any[] | Record<string, any>): Promise<any>;
        getSigner(address?: string | number | undefined): Promise<ethers.JsonRpcSigner>;
        listAccounts(): Promise<ethers.JsonRpcSigner[]>;
        destroy(): void;
        "__#14@#private": any;
        readonly pollingInterval: number;
        readonly provider: any;
        readonly plugins: ethers.AbstractProviderPlugin[];
        attachPlugin(plugin: ethers.AbstractProviderPlugin): any;
        getPlugin<T extends ethers.AbstractProviderPlugin = ethers.AbstractProviderPlugin>(name: string): T | null;
        disableCcipRead: boolean;
        ccipReadFetch(tx: ethers.PerformActionTransaction, calldata: string, urls: string[]): Promise<string | null>;
        getBlockNumber(): Promise<number>;
        _getAddress(address: ethers.AddressLike): string | Promise<string>;
        _getFilter(filter: ethers.Filter | ethers.FilterByBlockHash): ethers.PerformActionFilter | Promise<ethers.PerformActionFilter>;
        _getTransactionRequest(_request: ethers.TransactionRequest): ethers.PerformActionTransaction | Promise<ethers.PerformActionTransaction>;
        getNetwork(): Promise<ethers.Network>;
        getFeeData(): Promise<ethers.FeeData>;
        estimateGas(_tx: ethers.TransactionRequest): Promise<bigint>;
        call(_tx: ethers.TransactionRequest): Promise<string>;
        getTransactionCount(address: ethers.AddressLike, blockTag?: ethers.BlockTag | undefined): Promise<number>;
        getCode(address: ethers.AddressLike, blockTag?: ethers.BlockTag | undefined): Promise<string>;
        getStorage(address: ethers.AddressLike, _position: ethers.BigNumberish, blockTag?: ethers.BlockTag | undefined): Promise<string>;
        getTransactionResult(hash: string): Promise<string | null>;
        _getProvider(chainId: number): ethers.AbstractProvider;
        getResolver(name: string): Promise<ethers.EnsResolver | null>;
        getAvatar(name: string): Promise<string | null>;
        resolveName(name: string): Promise<string | null>;
        lookupAddress(address: string): Promise<string | null>;
        waitForTransaction(hash: string, _confirms?: number | null | undefined, timeout?: number | null | undefined): Promise<ethers.TransactionReceipt | null>;
        waitForBlock(blockTag?: ethers.BlockTag | undefined): Promise<ethers.Block>;
        _clearTimeout(timerId: number): void;
        _setTimeout(_func: () => void, timeout?: number | undefined): number;
        _forEachSubscriber(func: (s: ethers.Subscriber) => void): void;
        _recoverSubscriber(oldSub: ethers.Subscriber, newSub: ethers.Subscriber): void;
        on(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        once(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        emit(event: ethers.ProviderEvent, ...args: any[]): Promise<boolean>;
        listenerCount(event?: ethers.ProviderEvent | undefined): Promise<number>;
        listeners(event?: ethers.ProviderEvent | undefined): Promise<ethers.Listener[]>;
        off(event: ethers.ProviderEvent, listener?: ethers.Listener | undefined): Promise<any>;
        removeAllListeners(event?: ethers.ProviderEvent | undefined): Promise<any>;
        addListener(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        removeListener(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        readonly destroyed: boolean;
        paused: boolean;
        pause(dropWhilePaused?: boolean | undefined): void;
        resume(): void;
    };
} & TBase;
declare const Provider_base: {
    new (...args: any[]): {
        /**
         * Sends a JSON-RPC `_payload` (or a batch) to the underlying channel.
         *
         * @param _payload The JSON-RPC payload or batch of payloads to send.
         * @returns A promise that resolves to the result of the JSON-RPC request(s).
         */
        _send(_payload: ethers.JsonRpcPayload | ethers.JsonRpcPayload[]): Promise<(ethers.JsonRpcResult | ethers.JsonRpcError)[]>;
        /**
         * Returns the addresses of the main contract and default ZKsync Era bridge contracts on both L1 and L2.
         */
        contractAddresses(): {
            bridgehubContract?: string | undefined;
            mainContract?: string | undefined;
            erc20BridgeL1?: string | undefined;
            erc20BridgeL2?: string | undefined;
            wethBridgeL1?: string | undefined;
            wethBridgeL2?: string | undefined;
            sharedBridgeL1?: string | undefined;
            sharedBridgeL2?: string | undefined;
            baseToken?: string | undefined;
        };
        _getBlockTag(blockTag?: ethers.BlockTag | undefined): string | Promise<string>;
        _wrapLog(value: any): Log;
        _wrapBlock(value: any): Block;
        _wrapTransactionResponse(value: any): TransactionResponse;
        _wrapTransactionReceipt(value: any): TransactionReceipt;
        /**
         * Resolves to the transaction receipt for `txHash`, if mined.
         * If the transaction has not been mined, is unknown or on pruning nodes which discard old transactions
         * this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
        /**
         * Resolves to the transaction for `txHash`.
         * If the transaction is unknown or on pruning nodes which discard old transactions this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        getTransaction(txHash: string): Promise<TransactionResponse>;
        /**
         * Resolves to the block corresponding to the provided `blockHashOrBlockTag`.
         * If `includeTxs` is set to `true` and the backend supports including transactions with block requests,
         * all transactions will be included in the returned block object, eliminating the need for remote calls
         * to fetch transactions separately.
         *
         * @param blockHashOrBlockTag The hash or tag of the block to retrieve.
         * @param [includeTxs] A flag indicating whether to include transactions in the block.
         */
        getBlock(blockHashOrBlockTag: ethers.BlockTag, includeTxs?: boolean | undefined): Promise<Block>;
        /**
         * Resolves to the list of Logs that match `filter`.
         *
         * @param filter The filter criteria to apply.
         */
        getLogs(filter: ethers.Filter | ethers.FilterByBlockHash): Promise<Log[]>;
        /**
         * Returns the account balance  for the specified account `address`, `blockTag`, and `tokenAddress`.
         * If `blockTag` and `tokenAddress` are not provided, the balance for the latest committed block and ETH token
         * is returned by default.
         *
         * @param address The account address for which the balance is retrieved.
         * @param [blockTag] The block tag for getting the balance on. Latest committed block is the default.
         * @param [tokenAddress] The token address. ETH is the default token.
         */
        getBalance(address: string, blockTag?: ethers.BlockTag | undefined, tokenAddress?: string | undefined): Promise<bigint>;
        /**
         * Returns the L2 token address equivalent for a L1 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L1.
         * @param bridgeAddress The address of custom bridge, which will be used to get l2 token address.
         */
        l2TokenAddress(token: string, bridgeAddress?: string | undefined): Promise<string>;
        /**
         * Returns the L1 token address equivalent for a L2 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L2.
         */
        l1TokenAddress(token: string): Promise<string>;
        /**
         * Return the protocol version.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getprotocolversion zks_getProtocolVersion} JSON-RPC method.
         *
         * @param [id] Specific version ID.
         */
        getProtocolVersion(id?: number | undefined): Promise<ProtocolVersion>;
        /**
         * Returns an estimate of the amount of gas required to submit a transaction from L1 to L2 as a bigint object.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-estimategasl1tol2 zks_estimateL1ToL2} JSON-RPC method.
         *
         * @param transaction The transaction request.
         */
        estimateGasL1(transaction: TransactionRequest): Promise<bigint>;
        /**
         * Returns an estimated {@link Fee} for requested transaction.
         *
         * @param transaction The transaction request.
         */
        estimateFee(transaction: TransactionRequest): Promise<Fee>;
        /**
         * Returns the current fee parameters.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getFeeParams zks_getFeeParams} JSON-RPC method.
         */
        getFeeParams(): Promise<FeeParams>;
        /**
         * Returns an estimate (best guess) of the gas price to use in a transaction.
         */
        getGasPrice(): Promise<bigint>;
        /**
         * Returns the proof for a transaction's L2 to L1 log sent via the `L1Messenger` system contract.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl2tol1logproof zks_getL2ToL1LogProof} JSON-RPC method.
         *
         * @param txHash The hash of the L2 transaction the L2 to L1 log was produced within.
         * @param [index] The index of the L2 to L1 log in the transaction.
         */
        getLogProof(txHash: ethers.BytesLike, index?: number | undefined): Promise<LogProof | null>;
        /**
         * Returns the range of blocks contained within a batch given by batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchblockrange zks_getL1BatchBlockRange} JSON-RPC method.
         *
         * @param l1BatchNumber The L1 batch number.
         */
        getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
        /**
         * Returns the Bridgehub smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgehubcontract zks_getBridgehubContract} JSON-RPC method.
         */
        getBridgehubContractAddress(): Promise<string>;
        /**
         * Returns the main ZKsync Era smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getmaincontract zks_getMainContract} JSON-RPC method.
         */
        getMainContractAddress(): Promise<string>;
        /**
         * Returns the L1 base token address.
         */
        getBaseTokenContractAddress(): Promise<string>;
        /**
         * Returns whether the chain is ETH-based.
         */
        isEthBasedChain(): Promise<boolean>;
        /**
         * Returns whether the `token` is the base token.
         */
        isBaseToken(token: string): Promise<boolean>;
        /**
         * Returns the testnet {@link https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters paymaster address}
         * if available, or `null`.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettestnetpaymaster zks_getTestnetPaymaster} JSON-RPC method.
         */
        getTestnetPaymasterAddress(): Promise<string | null>;
        /**
         * Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgecontracts zks_getBridgeContracts} JSON-RPC method.
         */
        getDefaultBridgeAddresses(): Promise<{
            erc20L1: string;
            erc20L2: string;
            wethL1: string;
            wethL2: string;
            sharedL1: string;
            sharedL2: string;
        }>;
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
         * const l2Bridge = await provider.connectL2Bridge("<L2_BRIDGE_ADDRESS>");
         */
        connectL2Bridge(address: string): Promise<IL2Bridge | IL2SharedBridge>;
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
         * const isBridgeLegacy = await provider.isL2BridgeLegacy("<L2_BRIDGE_ADDRESS>");
         * console.log(isBridgeLegacy);
         */
        isL2BridgeLegacy(address: string): Promise<boolean>;
        /**
         * Returns all balances for confirmed tokens given by an account address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getallaccountbalances zks_getAllAccountBalances} JSON-RPC method.
         *
         * @param address The account address.
         */
        getAllAccountBalances(address: string): Promise<BalancesMap>;
        /**
         * Returns confirmed tokens. Confirmed token is any token bridged to ZKsync Era via the official bridge.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getconfirmedtokens zks_getConfirmedTokens} JSON-RPC method.
         *
         * @param start The token id from which to start.
         * @param limit The maximum number of tokens to list.
         */
        getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
        /**
         * Returns the L1 chain ID.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
         */
        l1ChainId(): Promise<number>;
        /**
         * Returns the latest L1 batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1batchnumber zks_L1BatchNumber}  JSON-RPC method.
         */
        getL1BatchNumber(): Promise<number>;
        /**
         * Returns data pertaining to a given batch.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchdetails zks_getL1BatchDetails} JSON-RPC method.
         *
         * @param number The L1 batch number.
         */
        getL1BatchDetails(number: number): Promise<BatchDetails>;
        /**
         * Returns additional zkSync-specific information about the L2 block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getblockdetails zks_getBlockDetails}  JSON-RPC method.
         *
         * @param number The block number.
         */
        getBlockDetails(number: number): Promise<BlockDetails>;
        /**
         * Returns data from a specific transaction given by the transaction hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettransactiondetails zks_getTransactionDetails} JSON-RPC method.
         *
         * @param txHash The transaction hash.
         */
        getTransactionDetails(txHash: ethers.BytesLike): Promise<TransactionDetails>;
        /**
         * Returns bytecode of a contract given by its hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbytecodebyhash zks_getBytecodeByHash} JSON-RPC method.
         *
         * @param bytecodeHash The bytecode hash.
         */
        getBytecodeByHash(bytecodeHash: ethers.BytesLike): Promise<Uint8Array>;
        /**
         * Returns data of transactions in a block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getrawblocktransactions zks_getRawBlockTransactions}  JSON-RPC method.
         *
         * @param number The block number.
         */
        getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
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
        getProof(address: string, keys: string[], l1BatchNumber: number): Promise<StorageProof>;
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
         */
        sendRawTransactionWithDetailedOutput(signedTx: string): Promise<TransactionWithDetailedOutput>;
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
        getWithdrawTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<ethers.TransactionRequest>;
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
        estimateGasWithdraw(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
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
        getTransferTx(transaction: {
            to: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            token?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<ethers.TransactionRequest>;
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
        estimateGasTransfer(transaction: {
            to: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            token?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
        /**
         * Returns a new filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newFilter}
         * and passing a filter object.
         *
         * @param filter The filter query to apply.
         */
        newFilter(filter: ethers.Filter | ethers.FilterByBlockHash): Promise<bigint>;
        /**
         * Returns a new block filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newBlockFilter}.
         */
        newBlockFilter(): Promise<bigint>;
        /**
         * Returns a new pending transaction filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newPendingTransactionFilter}.
         */
        newPendingTransactionsFilter(): Promise<bigint>;
        /**
         * Returns an array of logs by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_getFilterChanges}.
         *
         * @param idx The filter index.
         */
        getFilterChanges(idx: bigint): Promise<(string | Log)[]>;
        /**
         * Returns the status of a specified transaction.
         *
         * @param txHash The hash of the transaction.
         */
        getTransactionStatus(txHash: string): Promise<TransactionStatus>;
        /**
         * Broadcasts the `signedTx` to the network, adding it to the memory pool of any node for which the transaction
         * meets the rebroadcast requirements.
         *
         * @param signedTx The signed transaction that needs to be broadcasted.
         * @returns A promise that resolves with the transaction response.
         */
        broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
        /**
         * Returns a L2 transaction response from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        getL2TransactionFromPriorityOp(l1TxResponse: ethers.TransactionResponse): Promise<TransactionResponse>;
        /**
         * Returns a {@link PriorityOpResponse} from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        getPriorityOpResponse(l1TxResponse: ethers.TransactionResponse): Promise<PriorityOpResponse>;
        _getPriorityOpConfirmationL2ToL1Log(txHash: string, index?: number): Promise<{
            l2ToL1LogIndex: number;
            l2ToL1Log: import("./types").L2ToL1Log;
            l1BatchTxId: number | null;
        }>;
        /**
         * Returns the transaction confirmation data that is part of `L2->L1` message.
         *
         * @param txHash The hash of the L2 transaction where the message was initiated.
         * @param [index=0] In case there were multiple transactions in one message, you may pass an index of the
         * transaction which confirmation data should be fetched.
         * @throws {Error} If log proof can not be found.
         */
        getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
            l1BatchNumber: number;
            l2MessageIndex: number;
            l2TxNumberInBlock: number | null;
            proof: string[];
        }>;
        /**
         * Returns the version of the supported account abstraction and nonce ordering from a given contract address.
         *
         * @param address The contract address.
         */
        getContractAccountInfo(address: string): Promise<ContractAccountInfo>;
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
        estimateL1ToL2Execute(transaction: {
            contractAddress: string;
            calldata: string;
            caller?: string | undefined;
            l2Value?: ethers.BigNumberish | undefined;
            factoryDeps?: ethers.BytesLike[] | undefined;
            gasPerPubdataByte?: ethers.BigNumberish | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
        /**
         * Returns `tx` as a normalized JSON-RPC transaction request, which has all values `hexlified` and any numeric
         * values converted to Quantity values.
         * @param tx The transaction request that should be normalized.
         */
        getRpcTransaction(tx: TransactionRequest): ethers.JsonRpcTransactionRequest;
        "__#17@#private": any;
        _getOption<K extends keyof ethers.JsonRpcApiProviderOptions>(key: K): ethers.JsonRpcApiProviderOptions[K];
        readonly _network: ethers.Network;
        _perform(req: ethers.PerformActionRequest): Promise<any>;
        _detectNetwork(): Promise<ethers.Network>;
        _start(): void;
        _waitUntilReady(): Promise<void>;
        _getSubscriber(sub: ethers.Subscription): ethers.Subscriber;
        readonly ready: boolean;
        getRpcRequest(req: ethers.PerformActionRequest): {
            method: string;
            args: any[];
        } | null;
        getRpcError(payload: ethers.JsonRpcPayload, _error: ethers.JsonRpcError): Error;
        send(method: string, params: any[] | Record<string, any>): Promise<any>;
        getSigner(address?: string | number | undefined): Promise<ethers.JsonRpcSigner>;
        listAccounts(): Promise<ethers.JsonRpcSigner[]>;
        destroy(): void;
        "__#14@#private": any;
        readonly pollingInterval: number;
        readonly provider: any;
        readonly plugins: ethers.AbstractProviderPlugin[];
        attachPlugin(plugin: ethers.AbstractProviderPlugin): any;
        getPlugin<T extends ethers.AbstractProviderPlugin = ethers.AbstractProviderPlugin>(name: string): T | null;
        disableCcipRead: boolean;
        ccipReadFetch(tx: ethers.PerformActionTransaction, calldata: string, urls: string[]): Promise<string | null>;
        getBlockNumber(): Promise<number>;
        _getAddress(address: ethers.AddressLike): string | Promise<string>;
        _getFilter(filter: ethers.Filter | ethers.FilterByBlockHash): ethers.PerformActionFilter | Promise<ethers.PerformActionFilter>;
        _getTransactionRequest(_request: ethers.TransactionRequest): ethers.PerformActionTransaction | Promise<ethers.PerformActionTransaction>;
        getNetwork(): Promise<ethers.Network>;
        getFeeData(): Promise<ethers.FeeData>;
        estimateGas(_tx: ethers.TransactionRequest): Promise<bigint>;
        call(_tx: ethers.TransactionRequest): Promise<string>;
        getTransactionCount(address: ethers.AddressLike, blockTag?: ethers.BlockTag | undefined): Promise<number>;
        getCode(address: ethers.AddressLike, blockTag?: ethers.BlockTag | undefined): Promise<string>;
        getStorage(address: ethers.AddressLike, _position: ethers.BigNumberish, blockTag?: ethers.BlockTag | undefined): Promise<string>;
        getTransactionResult(hash: string): Promise<string | null>;
        _getProvider(chainId: number): ethers.AbstractProvider;
        getResolver(name: string): Promise<ethers.EnsResolver | null>;
        getAvatar(name: string): Promise<string | null>;
        resolveName(name: string): Promise<string | null>;
        lookupAddress(address: string): Promise<string | null>;
        waitForTransaction(hash: string, _confirms?: number | null | undefined, timeout?: number | null | undefined): Promise<ethers.TransactionReceipt | null>;
        waitForBlock(blockTag?: ethers.BlockTag | undefined): Promise<ethers.Block>;
        _clearTimeout(timerId: number): void;
        _setTimeout(_func: () => void, timeout?: number | undefined): number;
        _forEachSubscriber(func: (s: ethers.Subscriber) => void): void;
        _recoverSubscriber(oldSub: ethers.Subscriber, newSub: ethers.Subscriber): void;
        on(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        once(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        emit(event: ethers.ProviderEvent, ...args: any[]): Promise<boolean>;
        listenerCount(event?: ethers.ProviderEvent | undefined): Promise<number>;
        listeners(event?: ethers.ProviderEvent | undefined): Promise<ethers.Listener[]>;
        off(event: ethers.ProviderEvent, listener?: ethers.Listener | undefined): Promise<any>;
        removeAllListeners(event?: ethers.ProviderEvent | undefined): Promise<any>;
        addListener(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        removeListener(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        readonly destroyed: boolean;
        paused: boolean;
        pause(dropWhilePaused?: boolean | undefined): void;
        resume(): void;
    };
} & typeof ethers.JsonRpcProvider;
/**
 * A `Provider` extends {@link ethers.JsonRpcProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 */
export declare class Provider extends Provider_base {
    #private;
    protected _contractAddresses: {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
        wethBridgeL1?: Address;
        wethBridgeL2?: Address;
    };
    contractAddresses(): {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
        wethBridgeL1?: Address;
        wethBridgeL2?: Address;
    };
    /**
     * Creates a new `Provider` instance for connecting to an L2 network.
     * Caching is disabled for local networks.
     * @param [url] The network RPC URL. Defaults to the local network.
     * @param [network] The network name, chain ID, or object with network details.
     * @param [options] Additional options for the provider.
     */
    constructor(url?: ethers.FetchRequest | string, network?: Networkish, options?: any);
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
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
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
    getTransaction(txHash: string): Promise<TransactionResponse>;
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
    getBlock(blockHashOrBlockTag: BlockTag, includeTxs?: boolean): Promise<Block>;
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
    getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]>;
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
    getBalance(address: Address, blockTag?: BlockTag, tokenAddress?: Address): Promise<bigint>;
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
    l2TokenAddress(token: Address): Promise<string>;
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
    l1TokenAddress(token: Address): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * console.log(`Protocol version: ${await provider.getProtocolVersion()}`);
     */
    getProtocolVersion(id?: number): Promise<ProtocolVersion>;
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
    estimateGasL1(transaction: TransactionRequest): Promise<bigint>;
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
    estimateFee(transaction: TransactionRequest): Promise<Fee>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types, utils } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const feeParams = await provider.getFeeParams();
     * console.log(`Fee: ${utils.toJSON(feeParams)}`);
     */
    getFeeParams(): Promise<FeeParams>;
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
    getGasPrice(): Promise<bigint>;
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
    getLogProof(txHash: BytesLike, index?: number): Promise<LogProof | null>;
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
    getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
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
    getMainContractAddress(): Promise<Address>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * console.log(`Bridgehub: ${await provider.getBridgehubContractAddress()}`);
     */
    getBridgehubContractAddress(): Promise<Address>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * console.log(`Base token: ${await provider.getBaseTokenContractAddress()}`);
     */
    getBaseTokenContractAddress(): Promise<Address>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * console.log(`Is ETH based chain: ${await provider.isEthBasedChain()}`);
     */
    isEthBasedChain(): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * console.log(`Is base token: ${await provider.isBaseToken("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
     */
    isBaseToken(token: Address): Promise<boolean>;
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
    getTestnetPaymasterAddress(): Promise<Address | null>;
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
    getDefaultBridgeAddresses(): Promise<{
        erc20L1: string;
        erc20L2: string;
        wethL1: string;
        wethL2: string;
        sharedL1: string;
        sharedL2: string;
    }>;
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
    getAllAccountBalances(address: Address): Promise<BalancesMap>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types, utils } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const tokens = await provider.getConfirmedTokens();
     * console.log(`Confirmed tokens: ${utils.toJSON(tokens)}`);
     */
    getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
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
    l1ChainId(): Promise<number>;
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
    getL1BatchNumber(): Promise<number>;
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
    getL1BatchDetails(number: number): Promise<BatchDetails>;
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
    getBlockDetails(number: number): Promise<BlockDetails>;
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
    getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails>;
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
    getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array>;
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
    getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
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
    getProof(address: Address, keys: string[], l1BatchNumber: number): Promise<StorageProof>;
    /**
     * @inheritDoc
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
     *    value: ethers.parseEther("0.01"),
     *  })
     * );
     *
     * console.log(`Transaction with detailed output: ${utils.toJSON(txWithOutputs)}`);
     */
    sendRawTransactionWithDetailedOutput(signedTx: string): Promise<TransactionWithDetailedOutput>;
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
    getWithdrawTx(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<TransactionRequest>;
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
    estimateGasWithdraw(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<bigint>;
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
    getTransferTx(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<TransactionRequest>;
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
    estimateGasTransfer(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<bigint>;
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
    newFilter(filter: FilterByBlockHash | Filter): Promise<bigint>;
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
    newBlockFilter(): Promise<bigint>;
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
    newPendingTransactionsFilter(): Promise<bigint>;
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
    getFilterChanges(idx: bigint): Promise<Array<Log | string>>;
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
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
    /**
     * @inheritDoc
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
    getL2TransactionFromPriorityOp(l1TxResponse: ethers.TransactionResponse): Promise<TransactionResponse>;
    /**
     * @inheritDoc
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
    getPriorityOpResponse(l1TxResponse: ethers.TransactionResponse): Promise<PriorityOpResponse>;
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
     * console.log(`Confirmation data: ${utils.toJSON(await provider.getPriorityOpConfirmation(tx, 0))}`);
     */
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number | null;
        proof: string[];
    }>;
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
    getContractAccountInfo(address: Address): Promise<ContractAccountInfo>;
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
    estimateL1ToL2Execute(transaction: {
        contractAddress: Address;
        calldata: string;
        caller?: Address;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        gasPerPubdataByte?: BigNumberish;
        overrides?: ethers.Overrides;
    }): Promise<bigint>;
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>>;
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
    static getDefaultProvider(zksyncNetwork?: ZkSyncNetwork): Provider;
}
declare const BrowserProvider_base: {
    new (...args: any[]): {
        /**
         * Sends a JSON-RPC `_payload` (or a batch) to the underlying channel.
         *
         * @param _payload The JSON-RPC payload or batch of payloads to send.
         * @returns A promise that resolves to the result of the JSON-RPC request(s).
         */
        _send(_payload: ethers.JsonRpcPayload | ethers.JsonRpcPayload[]): Promise<(ethers.JsonRpcResult | ethers.JsonRpcError)[]>;
        /**
         * Returns the addresses of the main contract and default ZKsync Era bridge contracts on both L1 and L2.
         */
        contractAddresses(): {
            bridgehubContract?: string | undefined;
            mainContract?: string | undefined;
            erc20BridgeL1?: string | undefined;
            erc20BridgeL2?: string | undefined;
            wethBridgeL1?: string | undefined;
            wethBridgeL2?: string | undefined;
            sharedBridgeL1?: string | undefined;
            sharedBridgeL2?: string | undefined;
            baseToken?: string | undefined;
        };
        _getBlockTag(blockTag?: ethers.BlockTag | undefined): string | Promise<string>;
        _wrapLog(value: any): Log;
        _wrapBlock(value: any): Block;
        _wrapTransactionResponse(value: any): TransactionResponse;
        _wrapTransactionReceipt(value: any): TransactionReceipt;
        /**
         * Resolves to the transaction receipt for `txHash`, if mined.
         * If the transaction has not been mined, is unknown or on pruning nodes which discard old transactions
         * this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
        /**
         * Resolves to the transaction for `txHash`.
         * If the transaction is unknown or on pruning nodes which discard old transactions this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        getTransaction(txHash: string): Promise<TransactionResponse>;
        /**
         * Resolves to the block corresponding to the provided `blockHashOrBlockTag`.
         * If `includeTxs` is set to `true` and the backend supports including transactions with block requests,
         * all transactions will be included in the returned block object, eliminating the need for remote calls
         * to fetch transactions separately.
         *
         * @param blockHashOrBlockTag The hash or tag of the block to retrieve.
         * @param [includeTxs] A flag indicating whether to include transactions in the block.
         */
        getBlock(blockHashOrBlockTag: ethers.BlockTag, includeTxs?: boolean | undefined): Promise<Block>;
        /**
         * Resolves to the list of Logs that match `filter`.
         *
         * @param filter The filter criteria to apply.
         */
        getLogs(filter: ethers.Filter | ethers.FilterByBlockHash): Promise<Log[]>;
        /**
         * Returns the account balance  for the specified account `address`, `blockTag`, and `tokenAddress`.
         * If `blockTag` and `tokenAddress` are not provided, the balance for the latest committed block and ETH token
         * is returned by default.
         *
         * @param address The account address for which the balance is retrieved.
         * @param [blockTag] The block tag for getting the balance on. Latest committed block is the default.
         * @param [tokenAddress] The token address. ETH is the default token.
         */
        getBalance(address: string, blockTag?: ethers.BlockTag | undefined, tokenAddress?: string | undefined): Promise<bigint>;
        /**
         * Returns the L2 token address equivalent for a L1 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L1.
         * @param bridgeAddress The address of custom bridge, which will be used to get l2 token address.
         */
        l2TokenAddress(token: string, bridgeAddress?: string | undefined): Promise<string>;
        /**
         * Returns the L1 token address equivalent for a L2 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L2.
         */
        l1TokenAddress(token: string): Promise<string>;
        /**
         * Return the protocol version.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getprotocolversion zks_getProtocolVersion} JSON-RPC method.
         *
         * @param [id] Specific version ID.
         */
        getProtocolVersion(id?: number | undefined): Promise<ProtocolVersion>;
        /**
         * Returns an estimate of the amount of gas required to submit a transaction from L1 to L2 as a bigint object.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-estimategasl1tol2 zks_estimateL1ToL2} JSON-RPC method.
         *
         * @param transaction The transaction request.
         */
        estimateGasL1(transaction: TransactionRequest): Promise<bigint>;
        /**
         * Returns an estimated {@link Fee} for requested transaction.
         *
         * @param transaction The transaction request.
         */
        estimateFee(transaction: TransactionRequest): Promise<Fee>;
        /**
         * Returns the current fee parameters.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getFeeParams zks_getFeeParams} JSON-RPC method.
         */
        getFeeParams(): Promise<FeeParams>;
        /**
         * Returns an estimate (best guess) of the gas price to use in a transaction.
         */
        getGasPrice(): Promise<bigint>;
        /**
         * Returns the proof for a transaction's L2 to L1 log sent via the `L1Messenger` system contract.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl2tol1logproof zks_getL2ToL1LogProof} JSON-RPC method.
         *
         * @param txHash The hash of the L2 transaction the L2 to L1 log was produced within.
         * @param [index] The index of the L2 to L1 log in the transaction.
         */
        getLogProof(txHash: ethers.BytesLike, index?: number | undefined): Promise<LogProof | null>;
        /**
         * Returns the range of blocks contained within a batch given by batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchblockrange zks_getL1BatchBlockRange} JSON-RPC method.
         *
         * @param l1BatchNumber The L1 batch number.
         */
        getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
        /**
         * Returns the Bridgehub smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgehubcontract zks_getBridgehubContract} JSON-RPC method.
         */
        getBridgehubContractAddress(): Promise<string>;
        /**
         * Returns the main ZKsync Era smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getmaincontract zks_getMainContract} JSON-RPC method.
         */
        getMainContractAddress(): Promise<string>;
        /**
         * Returns the L1 base token address.
         */
        getBaseTokenContractAddress(): Promise<string>;
        /**
         * Returns whether the chain is ETH-based.
         */
        isEthBasedChain(): Promise<boolean>;
        /**
         * Returns whether the `token` is the base token.
         */
        isBaseToken(token: string): Promise<boolean>;
        /**
         * Returns the testnet {@link https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters paymaster address}
         * if available, or `null`.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettestnetpaymaster zks_getTestnetPaymaster} JSON-RPC method.
         */
        getTestnetPaymasterAddress(): Promise<string | null>;
        /**
         * Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgecontracts zks_getBridgeContracts} JSON-RPC method.
         */
        getDefaultBridgeAddresses(): Promise<{
            erc20L1: string;
            erc20L2: string;
            wethL1: string;
            wethL2: string;
            sharedL1: string;
            sharedL2: string;
        }>;
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
         * const l2Bridge = await provider.connectL2Bridge("<L2_BRIDGE_ADDRESS>");
         */
        connectL2Bridge(address: string): Promise<IL2Bridge | IL2SharedBridge>;
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
         * const isBridgeLegacy = await provider.isL2BridgeLegacy("<L2_BRIDGE_ADDRESS>");
         * console.log(isBridgeLegacy);
         */
        isL2BridgeLegacy(address: string): Promise<boolean>;
        /**
         * Returns all balances for confirmed tokens given by an account address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getallaccountbalances zks_getAllAccountBalances} JSON-RPC method.
         *
         * @param address The account address.
         */
        getAllAccountBalances(address: string): Promise<BalancesMap>;
        /**
         * Returns confirmed tokens. Confirmed token is any token bridged to ZKsync Era via the official bridge.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getconfirmedtokens zks_getConfirmedTokens} JSON-RPC method.
         *
         * @param start The token id from which to start.
         * @param limit The maximum number of tokens to list.
         */
        getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
        /**
         * Returns the L1 chain ID.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
         */
        l1ChainId(): Promise<number>;
        /**
         * Returns the latest L1 batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1batchnumber zks_L1BatchNumber}  JSON-RPC method.
         */
        getL1BatchNumber(): Promise<number>;
        /**
         * Returns data pertaining to a given batch.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl1batchdetails zks_getL1BatchDetails} JSON-RPC method.
         *
         * @param number The L1 batch number.
         */
        getL1BatchDetails(number: number): Promise<BatchDetails>;
        /**
         * Returns additional zkSync-specific information about the L2 block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getblockdetails zks_getBlockDetails}  JSON-RPC method.
         *
         * @param number The block number.
         */
        getBlockDetails(number: number): Promise<BlockDetails>;
        /**
         * Returns data from a specific transaction given by the transaction hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettransactiondetails zks_getTransactionDetails} JSON-RPC method.
         *
         * @param txHash The transaction hash.
         */
        getTransactionDetails(txHash: ethers.BytesLike): Promise<TransactionDetails>;
        /**
         * Returns bytecode of a contract given by its hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbytecodebyhash zks_getBytecodeByHash} JSON-RPC method.
         *
         * @param bytecodeHash The bytecode hash.
         */
        getBytecodeByHash(bytecodeHash: ethers.BytesLike): Promise<Uint8Array>;
        /**
         * Returns data of transactions in a block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getrawblocktransactions zks_getRawBlockTransactions}  JSON-RPC method.
         *
         * @param number The block number.
         */
        getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
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
        getProof(address: string, keys: string[], l1BatchNumber: number): Promise<StorageProof>;
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
         */
        sendRawTransactionWithDetailedOutput(signedTx: string): Promise<TransactionWithDetailedOutput>;
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
        getWithdrawTx(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<ethers.TransactionRequest>;
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
        estimateGasWithdraw(transaction: {
            token: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            to?: string | undefined;
            bridgeAddress?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
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
        getTransferTx(transaction: {
            to: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            token?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<ethers.TransactionRequest>;
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
        estimateGasTransfer(transaction: {
            to: string;
            amount: ethers.BigNumberish;
            from?: string | undefined;
            token?: string | undefined;
            paymasterParams?: PaymasterParams | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
        /**
         * Returns a new filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newFilter}
         * and passing a filter object.
         *
         * @param filter The filter query to apply.
         */
        newFilter(filter: ethers.Filter | ethers.FilterByBlockHash): Promise<bigint>;
        /**
         * Returns a new block filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newBlockFilter}.
         */
        newBlockFilter(): Promise<bigint>;
        /**
         * Returns a new pending transaction filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newPendingTransactionFilter}.
         */
        newPendingTransactionsFilter(): Promise<bigint>;
        /**
         * Returns an array of logs by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_getFilterChanges}.
         *
         * @param idx The filter index.
         */
        getFilterChanges(idx: bigint): Promise<(string | Log)[]>;
        /**
         * Returns the status of a specified transaction.
         *
         * @param txHash The hash of the transaction.
         */
        getTransactionStatus(txHash: string): Promise<TransactionStatus>;
        /**
         * Broadcasts the `signedTx` to the network, adding it to the memory pool of any node for which the transaction
         * meets the rebroadcast requirements.
         *
         * @param signedTx The signed transaction that needs to be broadcasted.
         * @returns A promise that resolves with the transaction response.
         */
        broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
        /**
         * Returns a L2 transaction response from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        getL2TransactionFromPriorityOp(l1TxResponse: ethers.TransactionResponse): Promise<TransactionResponse>;
        /**
         * Returns a {@link PriorityOpResponse} from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        getPriorityOpResponse(l1TxResponse: ethers.TransactionResponse): Promise<PriorityOpResponse>;
        _getPriorityOpConfirmationL2ToL1Log(txHash: string, index?: number): Promise<{
            l2ToL1LogIndex: number;
            l2ToL1Log: import("./types").L2ToL1Log;
            l1BatchTxId: number | null;
        }>;
        /**
         * Returns the transaction confirmation data that is part of `L2->L1` message.
         *
         * @param txHash The hash of the L2 transaction where the message was initiated.
         * @param [index=0] In case there were multiple transactions in one message, you may pass an index of the
         * transaction which confirmation data should be fetched.
         * @throws {Error} If log proof can not be found.
         */
        getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
            l1BatchNumber: number;
            l2MessageIndex: number;
            l2TxNumberInBlock: number | null;
            proof: string[];
        }>;
        /**
         * Returns the version of the supported account abstraction and nonce ordering from a given contract address.
         *
         * @param address The contract address.
         */
        getContractAccountInfo(address: string): Promise<ContractAccountInfo>;
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
        estimateL1ToL2Execute(transaction: {
            contractAddress: string;
            calldata: string;
            caller?: string | undefined;
            l2Value?: ethers.BigNumberish | undefined;
            factoryDeps?: ethers.BytesLike[] | undefined;
            gasPerPubdataByte?: ethers.BigNumberish | undefined;
            overrides?: ethers.Overrides | undefined;
        }): Promise<bigint>;
        /**
         * Returns `tx` as a normalized JSON-RPC transaction request, which has all values `hexlified` and any numeric
         * values converted to Quantity values.
         * @param tx The transaction request that should be normalized.
         */
        getRpcTransaction(tx: TransactionRequest): ethers.JsonRpcTransactionRequest;
        "__#17@#private": any;
        _getOption<K extends keyof ethers.JsonRpcApiProviderOptions>(key: K): ethers.JsonRpcApiProviderOptions[K];
        readonly _network: ethers.Network;
        _perform(req: ethers.PerformActionRequest): Promise<any>;
        _detectNetwork(): Promise<ethers.Network>;
        _start(): void;
        _waitUntilReady(): Promise<void>;
        _getSubscriber(sub: ethers.Subscription): ethers.Subscriber;
        readonly ready: boolean;
        getRpcRequest(req: ethers.PerformActionRequest): {
            method: string;
            args: any[];
        } | null;
        getRpcError(payload: ethers.JsonRpcPayload, _error: ethers.JsonRpcError): Error;
        send(method: string, params: any[] | Record<string, any>): Promise<any>;
        getSigner(address?: string | number | undefined): Promise<ethers.JsonRpcSigner>;
        listAccounts(): Promise<ethers.JsonRpcSigner[]>;
        destroy(): void;
        "__#14@#private": any;
        readonly pollingInterval: number;
        readonly provider: any;
        readonly plugins: ethers.AbstractProviderPlugin[];
        attachPlugin(plugin: ethers.AbstractProviderPlugin): any;
        getPlugin<T extends ethers.AbstractProviderPlugin = ethers.AbstractProviderPlugin>(name: string): T | null;
        disableCcipRead: boolean;
        ccipReadFetch(tx: ethers.PerformActionTransaction, calldata: string, urls: string[]): Promise<string | null>;
        getBlockNumber(): Promise<number>;
        _getAddress(address: ethers.AddressLike): string | Promise<string>;
        _getFilter(filter: ethers.Filter | ethers.FilterByBlockHash): ethers.PerformActionFilter | Promise<ethers.PerformActionFilter>;
        _getTransactionRequest(_request: ethers.TransactionRequest): ethers.PerformActionTransaction | Promise<ethers.PerformActionTransaction>;
        getNetwork(): Promise<ethers.Network>;
        getFeeData(): Promise<ethers.FeeData>;
        estimateGas(_tx: ethers.TransactionRequest): Promise<bigint>;
        call(_tx: ethers.TransactionRequest): Promise<string>;
        getTransactionCount(address: ethers.AddressLike, blockTag?: ethers.BlockTag | undefined): Promise<number>;
        getCode(address: ethers.AddressLike, blockTag?: ethers.BlockTag | undefined): Promise<string>;
        getStorage(address: ethers.AddressLike, _position: ethers.BigNumberish, blockTag?: ethers.BlockTag | undefined): Promise<string>;
        getTransactionResult(hash: string): Promise<string | null>;
        _getProvider(chainId: number): ethers.AbstractProvider;
        getResolver(name: string): Promise<ethers.EnsResolver | null>;
        getAvatar(name: string): Promise<string | null>;
        resolveName(name: string): Promise<string | null>;
        lookupAddress(address: string): Promise<string | null>;
        waitForTransaction(hash: string, _confirms?: number | null | undefined, timeout?: number | null | undefined): Promise<ethers.TransactionReceipt | null>;
        waitForBlock(blockTag?: ethers.BlockTag | undefined): Promise<ethers.Block>;
        _clearTimeout(timerId: number): void;
        _setTimeout(_func: () => void, timeout?: number | undefined): number;
        _forEachSubscriber(func: (s: ethers.Subscriber) => void): void;
        _recoverSubscriber(oldSub: ethers.Subscriber, newSub: ethers.Subscriber): void;
        on(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        once(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        emit(event: ethers.ProviderEvent, ...args: any[]): Promise<boolean>;
        listenerCount(event?: ethers.ProviderEvent | undefined): Promise<number>;
        listeners(event?: ethers.ProviderEvent | undefined): Promise<ethers.Listener[]>;
        off(event: ethers.ProviderEvent, listener?: ethers.Listener | undefined): Promise<any>;
        removeAllListeners(event?: ethers.ProviderEvent | undefined): Promise<any>;
        addListener(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        removeListener(event: ethers.ProviderEvent, listener: ethers.Listener): Promise<any>;
        readonly destroyed: boolean;
        paused: boolean;
        pause(dropWhilePaused?: boolean | undefined): void;
        resume(): void;
    };
} & typeof ethers.BrowserProvider;
/**
 * A `BrowserProvider` extends {@link ethers.BrowserProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 * This provider is designed for frontend use in a browser environment and integration for browser wallets
 * (e.g., MetaMask, WalletConnect).
 */
export declare class BrowserProvider extends BrowserProvider_base {
    #private;
    protected _contractAddresses: {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
        wethBridgeL1?: Address;
        wethBridgeL2?: Address;
    };
    contractAddresses(): {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
        wethBridgeL1?: Address;
        wethBridgeL2?: Address;
    };
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
    constructor(ethereum: Eip1193Provider, network?: Networkish);
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
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
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
    getTransaction(txHash: string): Promise<TransactionResponse>;
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
    getBlock(blockHashOrBlockTag: BlockTag, includeTxs?: boolean): Promise<Block>;
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
    getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]>;
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
    getBalance(address: Address, blockTag?: BlockTag, tokenAddress?: Address): Promise<bigint>;
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
    l2TokenAddress(token: Address): Promise<string>;
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
    l1TokenAddress(token: Address): Promise<string>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * console.log(`Protocol version: ${await provider.getProtocolVersion()}`);
     */
    getProtocolVersion(id?: number): Promise<ProtocolVersion>;
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
    estimateGasL1(transaction: TransactionRequest): Promise<bigint>;
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
    estimateFee(transaction: TransactionRequest): Promise<Fee>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const feeParams = await provider.getFeeParams();
     * console.log(`Fee: ${utils.toJSON(feeParams)}`);
     */
    getFeeParams(): Promise<FeeParams>;
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
    getGasPrice(): Promise<bigint>;
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
    getLogProof(txHash: BytesLike, index?: number): Promise<LogProof | null>;
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
    getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
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
    getMainContractAddress(): Promise<Address>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * console.log(`Bridgehub: ${await provider.getBridgehubContractAddress()}`);
     */
    getBridgehubContractAddress(): Promise<Address>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * console.log(`Base token: ${await provider.getBaseTokenContractAddress()}`);
     */
    getBaseTokenContractAddress(): Promise<Address>;
    /**
     * @inheritDoc
     *
     * import { BrowserProvider } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * console.log(`Is ETH based chain: ${await provider.isEthBasedChain()}`);
     */
    isEthBasedChain(): Promise<boolean>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * console.log(`Is base token: ${await provider.isBaseToken("0x5C221E77624690fff6dd741493D735a17716c26B")}`);
     */
    isBaseToken(token: Address): Promise<boolean>;
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
    getTestnetPaymasterAddress(): Promise<Address | null>;
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
    getDefaultBridgeAddresses(): Promise<{
        erc20L1: string;
        erc20L2: string;
        wethL1: string;
        wethL2: string;
        sharedL1: string;
        sharedL2: string;
    }>;
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
    getAllAccountBalances(address: Address): Promise<BalancesMap>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const tokens = await provider.getConfirmedTokens();
     * console.log(`Confirmed tokens: ${utils.toJSON(tokens)}`);
     */
    getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
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
    l1ChainId(): Promise<number>;
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
    getL1BatchNumber(): Promise<number>;
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
    getL1BatchDetails(number: number): Promise<BatchDetails>;
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
    getBlockDetails(number: number): Promise<BlockDetails>;
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
    getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails>;
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
    getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array>;
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
    getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
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
    getProof(address: Address, keys: string[], l1BatchNumber: number): Promise<StorageProof>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider, Wallet, Provider, utils, types } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const signer = Signer.from(
     *     await provider.getSigner(),
     *     Number((await provider.getNetwork()).chainId),
     *     Provider.getDefaultProvider(types.Network.Sepolia)
     * );
     *
     * const txWithOutputs = await provider.sendRawTransactionWithDetailedOutput(
     *   await signer.signTransaction({
     *     Wallet.createRandom().address,
     *     amount: ethers.parseEther("0.01"),
     *   })
     * );
     * console.log(`Transaction with detailed output: ${utils.toJSON(txWithOutputs)}`);
     */
    sendRawTransactionWithDetailedOutput(signedTx: string): Promise<TransactionWithDetailedOutput>;
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
    getWithdrawTx(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<TransactionRequest>;
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
    estimateGasWithdraw(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<bigint>;
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
    getTransferTx(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<TransactionRequest>;
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
    estimateGasTransfer(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<bigint>;
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
    newFilter(filter: FilterByBlockHash | Filter): Promise<bigint>;
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
    newBlockFilter(): Promise<bigint>;
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
    newPendingTransactionsFilter(): Promise<bigint>;
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
    getFilterChanges(idx: bigint): Promise<Array<Log | string>>;
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
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
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
    getL2TransactionFromPriorityOp(l1TxResponse: ethers.TransactionResponse): Promise<TransactionResponse>;
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
    getPriorityOpResponse(l1TxResponse: ethers.TransactionResponse): Promise<PriorityOpResponse>;
    /**
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * // Any L2 -> L1 transaction can be used.
     * // In this case, withdrawal transaction is used.
     * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
     * console.log(`Confirmation data: ${utils.toJSON(await provider.getPriorityOpConfirmation(tx, 0))}`);
     */
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number | null;
        proof: string[];
    }>;
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
    getContractAccountInfo(address: Address): Promise<ContractAccountInfo>;
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
    estimateL1ToL2Execute(transaction: {
        contractAddress: Address;
        calldata: string;
        caller?: Address;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        gasPerPubdataByte?: BigNumberish;
        overrides?: ethers.Overrides;
    }): Promise<bigint>;
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
    /**
     * Returns an ethers-style `Error` for the given JSON-RPC error `payload`, coalescing the various strings and error
     * shapes that different nodes return, coercing them into a machine-readable standardized error.
     *
     * @param payload The JSON-RPC payload.
     * @param error The JSON-RPC error.
     */
    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error;
    /**
     * Resolves whether the provider manages the `address`.
     *
     * @param address The address to check.
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const hasSigner = await provider.hasSigner(0);
     */
    hasSigner(address: number | string): Promise<boolean>;
    /**
     * Resolves to the `Signer` account for `address` managed by the client.
     * If the `address` is a number, it is used as an index in the accounts from `listAccounts`.
     * This can only be used on clients which manage accounts (e.g. MetaMask).
     *
     * @param address The address or index of the account to retrieve the signer for.
     *
     * @throws {Error} If the account doesn't exist.
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const signer = await provider.getSigner();
     */
    getSigner(address?: number | string): Promise<Signer>;
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const gas = await provider.estimate({
     *   value: 7_000_000_000,
     *   to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
     *   from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
     * });
     * console.log(`Gas: ${gas}`);
     */
    estimateGas(transaction: TransactionRequest): Promise<bigint>;
}
export {};
