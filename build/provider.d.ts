import { BigNumber, BigNumberish, BytesLike, ethers, providers, utils } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import { ConnectionInfo } from '@ethersproject/web';
import { Address, BalancesMap, BatchDetails, Block, BlockDetails, BlockTag, BlockWithTransactions, ContractAccountInfo, EventFilter, Log, MessageProof, PriorityOpResponse, TransactionDetails, TransactionReceipt, TransactionRequest, TransactionResponse, TransactionStatus, Fee, Network as ZkSyncNetwork, RawBlockTransaction, StorageProof, PaymasterParams, LogProof, Token, ProtocolVersion, FeeParams, TransactionWithDetailedOutput } from './types';
import { Signer } from './signer';
import Formatter = providers.Formatter;
import { Il2Bridge } from './typechain/Il2Bridge';
import { Il2SharedBridge } from './typechain/Il2SharedBridge';
import { Networkish } from '@ethersproject/networks';
/**
 * A `Provider` extends {@link ethers.providers.JsonRpcProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 */
export declare class Provider extends ethers.providers.JsonRpcProvider {
    private static _nextPollId;
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
    poll(): Promise<void>;
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
    getTransactionReceipt(transactionHash: string | Promise<string>): Promise<TransactionReceipt>;
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
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
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
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
    /**  Retrieves the formatter used to format responses from the network. */
    static getFormatter(): Formatter;
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
    getBalance(address: Address, blockTag?: BlockTag, tokenAddress?: Address): Promise<BigNumber>;
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
    l2TokenAddress(token: Address, bridgeAddress?: Address): Promise<string>;
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
    l1TokenAddress(token: Address): Promise<string>;
    /**
     * This function is used when formatting requests for `eth_call` and `eth_estimateGas`. We override it here
     * because we have extra stuff to serialize (customData).
     * This function is for internal use only.
     *
     * @param transaction The transaction request to be serialized.
     * @param [allowExtra] Extra properties are allowed in the transaction.
     */
    static hexlifyTransaction(transaction: ethers.providers.TransactionRequest, allowExtra?: Record<string, boolean>): any;
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
    estimateGas(transaction: utils.Deferrable<TransactionRequest>): Promise<BigNumber>;
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
    getProtocolVersion(id?: number): Promise<ProtocolVersion>;
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
    estimateGasL1(transaction: utils.Deferrable<TransactionRequest>): Promise<BigNumber>;
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
    estimateFee(transaction: TransactionRequest): Promise<Fee>;
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
    getFeeParams(): Promise<FeeParams>;
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
    getGasPrice(token?: Address): Promise<BigNumber>;
    /**
     * Creates a new `Provider` instance for connecting to an L2 network.
     * @param [url] The network RPC URL. Defaults to the local network.
     * @param [network] The network name, chain ID, or object with network details.
     */
    constructor(url?: ConnectionInfo | string, network?: ethers.providers.Networkish);
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
    getLogProof(txHash: BytesLike, index?: number): Promise<MessageProof | null>;
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
    getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
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
    getBridgehubContractAddress(): Promise<Address>;
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
    getMainContractAddress(): Promise<Address>;
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
    getBaseTokenContractAddress(): Promise<Address>;
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
    isEthBasedChain(): Promise<boolean>;
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
    isBaseToken(token: Address): Promise<boolean>;
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
    getTestnetPaymasterAddress(): Promise<Address | null>;
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
     * const l2Bridge = await provider.connectL2Bridge("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
     */
    connectL2Bridge(address: Address): Promise<Il2SharedBridge | Il2Bridge>;
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
    isL2BridgeLegacy(address: Address): Promise<boolean>;
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
    getAllAccountBalances(address: Address): Promise<BalancesMap>;
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
    getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
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
    l1ChainId(): Promise<number>;
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
    getL1BatchNumber(): Promise<number>;
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
    getL1BatchDetails(number: number): Promise<BatchDetails>;
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
    getBlockDetails(number: number): Promise<BlockDetails>;
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
    getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails>;
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
    getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array>;
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
        overrides?: ethers.CallOverrides;
    }): Promise<ethers.providers.TransactionRequest>;
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
    estimateGasWithdraw(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.CallOverrides;
    }): Promise<BigNumber>;
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
    getTransferTx(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.CallOverrides;
    }): Promise<ethers.providers.TransactionRequest>;
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
    estimateGasTransfer(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.CallOverrides;
    }): Promise<BigNumber>;
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
    newFilter(filter: EventFilter | Promise<EventFilter>): Promise<BigNumber>;
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
    newBlockFilter(): Promise<BigNumber>;
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
    newPendingTransactionsFilter(): Promise<BigNumber>;
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
    getFilterChanges(idx: BigNumber): Promise<Array<Log | string>>;
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
    getLogs(filter?: EventFilter | Promise<EventFilter>): Promise<Array<Log>>;
    protected _parseLogs(logs: any[]): Array<Log>;
    protected _prepareFilter(filter: EventFilter): {
        fromBlock: string | null;
        toBlock: string | null;
        topics?: (string | string[] | null)[] | undefined;
        address?: string | string[] | undefined;
        blockHash?: string | undefined;
    };
    _wrapTransaction(tx: ethers.Transaction, hash?: string): TransactionResponse;
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
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
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
    getTransaction(hash: string | Promise<string>): Promise<TransactionResponse>;
    /**
     * Broadcasts the `transaction` to the network, adding it to the memory pool of any node for which the transaction
     * meets the rebroadcast requirements.
     *
     * @param transaction The signed transaction that needs to be broadcasted.
     * @returns A promise that resolves with the transaction response.
     */
    sendTransaction(transaction: string | Promise<string>): Promise<TransactionResponse>;
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
    getL2TransactionFromPriorityOp(l1TxResponse: ethers.providers.TransactionResponse): Promise<TransactionResponse>;
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
    getPriorityOpResponse(l1TxResponse: ethers.providers.TransactionResponse): Promise<PriorityOpResponse>;
    _getPriorityOpConfirmationL2ToL1Log(txHash: string, index?: number): Promise<{
        l2ToL1LogIndex: number;
        l2ToL1Log: import("./types").L2ToL1Log;
        l1BatchTxId: number;
    }>;
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
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number;
        proof: string[];
    }>;
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
    estimateL1ToL2Execute(transaction: {
        contractAddress: Address;
        calldata: BytesLike;
        caller?: Address;
        l2Value?: BigNumberish;
        factoryDeps?: ethers.BytesLike[];
        gasPerPubdataByte?: BigNumberish;
        overrides?: ethers.PayableOverrides;
    }): Promise<BigNumber>;
}
export type JsonRpcFetchFunc = (method: string, params?: Array<any>) => Promise<any>;
/**
 * A `Web3Provider` extends {@link ExternalProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 * This provider is designed for frontend use in a browser environment and integration for browser wallets
 * (e.g., MetaMask, WalletConnect).
 */
export declare class Web3Provider extends Provider {
    readonly provider: ExternalProvider;
    readonly jsonRpcFetchFunc: JsonRpcFetchFunc;
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
    constructor(provider: ExternalProvider | JsonRpcFetchFunc, network?: Networkish);
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
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt>;
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
    getTransaction(txHash: string): Promise<TransactionResponse>;
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
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
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
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
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
    getLogs(filter?: EventFilter | Promise<EventFilter>): Promise<Array<Log>>;
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
    getBalance(address: Address, blockTag?: BlockTag, tokenAddress?: Address): Promise<BigNumber>;
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
    l2TokenAddress(token: Address): Promise<string>;
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
    l1TokenAddress(token: Address): Promise<string>;
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
    getProtocolVersion(id?: number): Promise<ProtocolVersion>;
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
    estimateGasL1(transaction: TransactionRequest): Promise<BigNumber>;
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
    estimateFee(transaction: TransactionRequest): Promise<Fee>;
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
    getFeeParams(): Promise<FeeParams>;
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
    getGasPrice(): Promise<BigNumber>;
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
    getLogProof(txHash: BytesLike, index?: number): Promise<LogProof | null>;
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
    getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null>;
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
    getBridgehubContractAddress(): Promise<Address>;
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
    getBaseTokenContractAddress(): Promise<Address>;
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
    isEthBasedChain(): Promise<boolean>;
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
    isBaseToken(token: Address): Promise<boolean>;
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
    getMainContractAddress(): Promise<Address>;
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
    getTestnetPaymasterAddress(): Promise<Address | null>;
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
     * import { Web3Provider, utils } from "zksync-ethers";
     *
     * const provider = new Web3Provider(window.ethereum);
     * const balances = await provider.getAllAccountBalances("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
     * console.log(`All balances: ${utils.toJSON(balances)}`);
     */
    getAllAccountBalances(address: Address): Promise<BalancesMap>;
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
    getConfirmedTokens(start?: number, limit?: number): Promise<Token[]>;
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
    l1ChainId(): Promise<number>;
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
    getL1BatchNumber(): Promise<number>;
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
    getL1BatchDetails(number: number): Promise<BatchDetails>;
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
    getBlockDetails(number: number): Promise<BlockDetails>;
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
    getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails>;
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
    getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array>;
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
    getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]>;
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
    getProof(address: Address, keys: string[], l1BatchNumber: number): Promise<StorageProof>;
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
    sendRawTransactionWithDetailedOutput(signedTx: string): Promise<TransactionWithDetailedOutput>;
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
    estimateGasWithdraw(transaction: {
        token: Address;
        amount: BigNumberish;
        from?: Address;
        to?: Address;
        bridgeAddress?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<BigNumber>;
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
    estimateGasTransfer(transaction: {
        to: Address;
        amount: BigNumberish;
        from?: Address;
        token?: Address;
        paymasterParams?: PaymasterParams;
        overrides?: ethers.Overrides;
    }): Promise<BigNumber>;
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
    newFilter(filter: EventFilter | Promise<EventFilter>): Promise<BigNumber>;
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
    newBlockFilter(): Promise<BigNumber>;
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
    newPendingTransactionsFilter(): Promise<BigNumber>;
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
    getFilterChanges(idx: BigNumber): Promise<Array<Log | string>>;
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
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
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
    getL2TransactionFromPriorityOp(l1TxResponse: ethers.providers.TransactionResponse): Promise<TransactionResponse>;
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
    getPriorityOpResponse(l1TxResponse: ethers.providers.TransactionResponse): Promise<PriorityOpResponse>;
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
    getPriorityOpConfirmation(txHash: string, index?: number): Promise<{
        l1BatchNumber: number;
        l2MessageIndex: number;
        l2TxNumberInBlock: number;
        proof: string[];
    }>;
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
    getContractAccountInfo(address: Address): Promise<ContractAccountInfo>;
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
    estimateL1ToL2Execute(transaction: {
        contractAddress: Address;
        calldata: string;
        caller?: Address;
        l2Value?: BigNumberish;
        factoryDeps?: BytesLike[];
        gasPerPubdataByte?: BigNumberish;
        overrides?: ethers.Overrides;
    }): Promise<BigNumber>;
    send(method: string, params?: Array<any>): Promise<any>;
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
    getSigner(addressOrIndex?: number | string): Signer;
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
    estimateGas(transaction: ethers.utils.Deferrable<TransactionRequest>): Promise<BigNumber>;
}
