var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Provider_connect, _BrowserProvider_request;
import { ethers, Contract, resolveProperties, FetchRequest, } from 'ethers';
import { IERC20__factory, IEthToken__factory, IL2AssetRouter__factory, IL2Bridge__factory, IL2NativeTokenVault__factory, IL2SharedBridge__factory, IBridgedStandardToken__factory, } from './typechain';
import { TransactionResponse, TransactionStatus, TransactionReceipt, Block, Log, Network as ZkSyncNetwork, Transaction, } from './types';
import { getL2HashFromPriorityOp, CONTRACT_DEPLOYER_ADDRESS, CONTRACT_DEPLOYER, sleep, EIP712_TX_TYPE, REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT, BOOTLOADER_FORMAL_ADDRESS, ETH_ADDRESS_IN_CONTRACTS, L2_BASE_TOKEN_ADDRESS, LEGACY_ETH_ADDRESS, isAddressEq, getERC20DefaultBridgeData, getERC20BridgeCalldata, applyL1ToL2Alias, L2_ASSET_ROUTER_ADDRESS, L2_NATIVE_TOKEN_VAULT_ADDRESS, encodeNTVTransferData, } from './utils';
import { Signer } from './signer';
import { formatLog, formatBlock, formatTransactionResponse, formatTransactionReceipt, formatFee, } from './format';
import { makeError } from 'ethers';
export function JsonRpcApiProvider(ProviderType) {
    return class Provider extends ProviderType {
        /**
         * Sends a JSON-RPC `_payload` (or a batch) to the underlying channel.
         *
         * @param _payload The JSON-RPC payload or batch of payloads to send.
         * @returns A promise that resolves to the result of the JSON-RPC request(s).
         */
        _send(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _payload) {
            throw new Error('Must be implemented by the derived class!');
        }
        /**
         * Returns the addresses of the main contract and default ZKsync Era bridge contracts on both L1 and L2.
         */
        contractAddresses() {
            throw new Error('Must be implemented by the derived class!');
        }
        _getBlockTag(blockTag) {
            if (blockTag === 'committed') {
                return 'committed';
            }
            else if (blockTag === 'l1_committed') {
                return 'l1_committed';
            }
            return super._getBlockTag(blockTag);
        }
        _wrapLog(value) {
            return new Log(formatLog(value), this);
        }
        _wrapBlock(value) {
            return new Block(formatBlock(value), this);
        }
        _wrapTransactionResponse(value) {
            const tx = formatTransactionResponse(value);
            return new TransactionResponse(tx, this);
        }
        _wrapTransactionReceipt(value) {
            const receipt = formatTransactionReceipt(value);
            return new TransactionReceipt(receipt, this);
        }
        /**
         * Resolves to the transaction receipt for `txHash`, if mined.
         * If the transaction has not been mined, is unknown or on pruning nodes which discard old transactions
         * this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        async getTransactionReceipt(txHash) {
            return (await super.getTransactionReceipt(txHash));
        }
        /**
         * Resolves to the transaction for `txHash`.
         * If the transaction is unknown or on pruning nodes which discard old transactions this resolves to `null`.
         *
         * @param txHash The hash of the transaction.
         */
        async getTransaction(txHash) {
            return (await super.getTransaction(txHash));
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
        async getBlock(blockHashOrBlockTag, includeTxs) {
            return (await super.getBlock(blockHashOrBlockTag, includeTxs));
        }
        /**
         * Resolves to the list of Logs that match `filter`.
         *
         * @param filter The filter criteria to apply.
         */
        async getLogs(filter) {
            return (await super.getLogs(filter));
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
        async getBalance(address, blockTag, tokenAddress) {
            if (!tokenAddress) {
                tokenAddress = L2_BASE_TOKEN_ADDRESS;
            }
            else if (isAddressEq(tokenAddress, LEGACY_ETH_ADDRESS) ||
                isAddressEq(tokenAddress, ETH_ADDRESS_IN_CONTRACTS)) {
                tokenAddress = await this.l2TokenAddress(tokenAddress);
            }
            if (isAddressEq(tokenAddress, L2_BASE_TOKEN_ADDRESS)) {
                return await super.getBalance(address, blockTag);
            }
            else {
                try {
                    const token = IERC20__factory.connect(tokenAddress, this);
                    return await token.balanceOf(address, { blockTag });
                }
                catch {
                    return 0n;
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
         */
        async l2TokenAddress(token, bridgeAddress) {
            if (isAddressEq(token, LEGACY_ETH_ADDRESS)) {
                token = ETH_ADDRESS_IN_CONTRACTS;
            }
            const baseToken = await this.getBaseTokenContractAddress();
            if (isAddressEq(token, baseToken)) {
                return L2_BASE_TOKEN_ADDRESS;
            }
            bridgeAddress ?? (bridgeAddress = (await this.getDefaultBridgeAddresses()).sharedL2);
            return await (await this.connectL2Bridge(bridgeAddress)).l2TokenAddress(token);
        }
        /**
         * Returns the L1 token address equivalent for a L2 token address as they are not equal.
         * ETH address is set to zero address.
         *
         * @remarks Only works for tokens bridged on default ZKsync Era bridges.
         *
         * @param token The address of the token on L2.
         */
        async l1TokenAddress(token) {
            if (isAddressEq(token, LEGACY_ETH_ADDRESS)) {
                return LEGACY_ETH_ADDRESS;
            }
            const bridgeAddresses = await this.getDefaultBridgeAddresses();
            const sharedBridge = IL2Bridge__factory.connect(bridgeAddresses.sharedL2, this);
            return await sharedBridge.l1TokenAddress(token);
        }
        /**
         * Return the protocol version.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getprotocolversion zks_getProtocolVersion} JSON-RPC method.
         *
         * @param [id] Specific version ID.
         */
        async getProtocolVersion(id) {
            return await this.send('zks_getProtocolVersion', [id]);
        }
        /**
         * Returns an estimate of the amount of gas required to submit a transaction from L1 to L2 as a bigint object.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-estimategasl1tol2 zks_estimateL1ToL2} JSON-RPC method.
         *
         * @param transaction The transaction request.
         */
        async estimateGasL1(transaction) {
            return await this.send('zks_estimateGasL1ToL2', [
                this.getRpcTransaction(transaction),
            ]);
        }
        /**
         * Returns an estimated {@link Fee} for requested transaction.
         *
         * @param transaction The transaction request.
         */
        async estimateFee(transaction) {
            const fee = await this.send('zks_estimateFee', [
                await this.getRpcTransaction(transaction),
            ]);
            return formatFee(fee);
        }
        /**
         * Returns the current fee parameters.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks_getFeeParams zks_getFeeParams} JSON-RPC method.
         */
        async getFeeParams() {
            return await this.send('zks_getFeeParams', []);
        }
        /**
         * Returns an estimate (best guess) of the gas price to use in a transaction.
         */
        async getGasPrice() {
            const feeData = await this.getFeeData();
            return feeData.gasPrice;
        }
        /**
         * Returns the proof for a transaction's L2 to L1 log sent via the `L1Messenger` system contract.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getl2tol1logproof zks_getL2ToL1LogProof} JSON-RPC method.
         *
         * @param txHash The hash of the L2 transaction the L2 to L1 log was produced within.
         * @param [index] The index of the L2 to L1 log in the transaction.
         */
        async getLogProof(txHash, index) {
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
        async getL1BatchBlockRange(l1BatchNumber) {
            const range = await this.send('zks_getL1BatchBlockRange', [
                l1BatchNumber,
            ]);
            if (!range) {
                return null;
            }
            return [parseInt(range[0], 16), parseInt(range[1], 16)];
        }
        /**
         * Returns the Bridgehub smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgehubcontract zks_getBridgehubContract} JSON-RPC method.
         */
        async getBridgehubContractAddress() {
            if (!this.contractAddresses().bridgehubContract) {
                this.contractAddresses().bridgehubContract = await this.send('zks_getBridgehubContract', []);
            }
            return this.contractAddresses().bridgehubContract;
        }
        /**
         * Returns the main ZKsync Era smart contract address.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getmaincontract zks_getMainContract} JSON-RPC method.
         */
        async getMainContractAddress() {
            if (!this.contractAddresses().mainContract) {
                this.contractAddresses().mainContract = await this.send('zks_getMainContract', []);
            }
            return this.contractAddresses().mainContract;
        }
        /**
         * Returns the L1 base token address.
         */
        async getBaseTokenContractAddress() {
            if (!this.contractAddresses().baseToken) {
                this.contractAddresses().baseToken = await this.send('zks_getBaseTokenL1Address', []);
            }
            return ethers.getAddress(this.contractAddresses().baseToken);
        }
        /**
         * Returns whether the chain is ETH-based.
         */
        async isEthBasedChain() {
            return isAddressEq(await this.getBaseTokenContractAddress(), ETH_ADDRESS_IN_CONTRACTS);
        }
        /**
         * Returns whether the `token` is the base token.
         */
        async isBaseToken(token) {
            return (isAddressEq(token, await this.getBaseTokenContractAddress()) ||
                isAddressEq(token, L2_BASE_TOKEN_ADDRESS));
        }
        /**
         * Returns the testnet {@link https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters paymaster address}
         * if available, or `null`.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettestnetpaymaster zks_getTestnetPaymaster} JSON-RPC method.
         */
        async getTestnetPaymasterAddress() {
            // Unlike contract's addresses, the testnet paymaster is not cached, since it can be trivially changed
            // on the fly by the server and should not be relied on to be constant
            return await this.send('zks_getTestnetPaymaster', []);
        }
        /**
         * Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbridgecontracts zks_getBridgeContracts} JSON-RPC method.
         */
        async getDefaultBridgeAddresses() {
            if (!this.contractAddresses().erc20BridgeL1) {
                const addresses = await this.send('zks_getBridgeContracts', []);
                this.contractAddresses().erc20BridgeL1 = addresses.l1Erc20DefaultBridge;
                this.contractAddresses().erc20BridgeL2 = addresses.l2Erc20DefaultBridge;
                this.contractAddresses().wethBridgeL1 = addresses.l1WethBridge;
                this.contractAddresses().wethBridgeL2 = addresses.l2WethBridge;
                this.contractAddresses().sharedBridgeL1 =
                    addresses.l1SharedDefaultBridge;
                this.contractAddresses().sharedBridgeL2 =
                    addresses.l2SharedDefaultBridge;
            }
            return {
                erc20L1: this.contractAddresses().erc20BridgeL1,
                erc20L2: this.contractAddresses().erc20BridgeL2,
                wethL1: this.contractAddresses().wethBridgeL1,
                wethL2: this.contractAddresses().wethBridgeL2,
                sharedL1: this.contractAddresses().sharedBridgeL1,
                sharedL2: this.contractAddresses().sharedBridgeL2,
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
         * const l2Bridge = await provider.connectL2Bridge("<L2_BRIDGE_ADDRESS>");
         */
        async connectL2Bridge(address) {
            if (await this.isL2BridgeLegacy(address)) {
                return IL2Bridge__factory.connect(address, this);
            }
            return IL2SharedBridge__factory.connect(address, this);
        }
        async connectL2NTV() {
            return IL2NativeTokenVault__factory.connect(L2_NATIVE_TOKEN_VAULT_ADDRESS, this);
        }
        async connectBridgedToken(token) {
            return IBridgedStandardToken__factory.connect(token, this);
        }
        async connectL2AssetRouter() {
            return IL2AssetRouter__factory.connect(L2_ASSET_ROUTER_ADDRESS, this);
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
         * const isBridgeLegacy = await provider.isL2BridgeLegacy("<L2_BRIDGE_ADDRESS>");
         * console.log(isBridgeLegacy);
         */
        async isL2BridgeLegacy(address) {
            const bridge = IL2SharedBridge__factory.connect(address, this);
            try {
                await bridge.l1SharedBridge();
                return false;
            }
            catch (e) {
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
         */
        async getAllAccountBalances(address) {
            const balances = await this.send('zks_getAllAccountBalances', [address]);
            for (const token in balances) {
                balances[token] = BigInt(balances[token]);
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
         */
        async getConfirmedTokens(start = 0, limit = 255) {
            const tokens = await this.send('zks_getConfirmedTokens', [
                start,
                limit,
            ]);
            return tokens.map(token => ({ address: token.l2Address, ...token }));
        }
        /**
         * @deprecated In favor of {@link getL1ChainId}
         *
         * Returns the L1 chain ID.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
         */
        async l1ChainId() {
            const res = await this.send('zks_L1ChainId', []);
            return Number(res);
        }
        /**
         * Returns the L1 chain ID.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1chainid zks_L1ChainId} JSON-RPC method.
         */
        async getL1ChainId() {
            const res = await this.send('zks_L1ChainId', []);
            return Number(res);
        }
        /**
         * Returns the latest L1 batch number.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-l1batchnumber zks_L1BatchNumber}  JSON-RPC method.
         */
        async getL1BatchNumber() {
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
        async getL1BatchDetails(number) {
            return await this.send('zks_getL1BatchDetails', [number]);
        }
        /**
         * Returns additional zkSync-specific information about the L2 block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getblockdetails zks_getBlockDetails}  JSON-RPC method.
         *
         * @param number The block number.
         */
        async getBlockDetails(number) {
            return await this.send('zks_getBlockDetails', [number]);
        }
        /**
         * Returns data from a specific transaction given by the transaction hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-gettransactiondetails zks_getTransactionDetails} JSON-RPC method.
         *
         * @param txHash The transaction hash.
         */
        async getTransactionDetails(txHash) {
            return await this.send('zks_getTransactionDetails', [txHash]);
        }
        /**
         * Returns bytecode of a contract given by its hash.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getbytecodebyhash zks_getBytecodeByHash} JSON-RPC method.
         *
         * @param bytecodeHash The bytecode hash.
         */
        async getBytecodeByHash(bytecodeHash) {
            return await this.send('zks_getBytecodeByHash', [bytecodeHash]);
        }
        /**
         * Returns data of transactions in a block.
         *
         * Calls the {@link https://docs.zksync.io/build/api.html#zks-getrawblocktransactions zks_getRawBlockTransactions}  JSON-RPC method.
         *
         * @param number The block number.
         */
        async getRawBlockTransactions(number) {
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
        async getProof(address, keys, l1BatchNumber) {
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
         */
        async sendRawTransactionWithDetailedOutput(signedTx) {
            return await this.send('zks_sendRawTransactionWithDetailedOutput', [
                signedTx,
            ]);
        }
        /**
         * Returns the populated withdrawal transaction.
         *
         * @param transaction The transaction details.
         * @param transaction.amount The amount of token.
         * @param transaction.token The token address.
         * @param [transaction.from] The sender's address.
         * @param [transaction.to] The recipient's address.
         * @param [transaction.bridgeAddress] The bridge address.
         * @param [transaction.paymasterParams] Paymaster parameters.
         * @param [transaction.overrides] Transaction overrides including `gasLimit`, `gasPrice`, and `value`.
         */
        async getWithdrawTx(transaction) {
            var _a, _b;
            const { ...tx } = transaction;
            tx.token ?? (tx.token = L2_BASE_TOKEN_ADDRESS);
            if (isAddressEq(tx.token, LEGACY_ETH_ADDRESS) ||
                isAddressEq(tx.token, ETH_ADDRESS_IN_CONTRACTS)) {
                tx.token = await this.l2TokenAddress(ETH_ADDRESS_IN_CONTRACTS);
            }
            if ((tx.to === null || tx.to === undefined) &&
                (tx.from === null || tx.from === undefined)) {
                throw new Error('Withdrawal target address is undefined!');
            }
            tx.to ?? (tx.to = tx.from);
            tx.overrides ?? (tx.overrides = {});
            (_a = tx.overrides).from ?? (_a.from = tx.from);
            (_b = tx.overrides).type ?? (_b.type = EIP712_TX_TYPE);
            if (isAddressEq(tx.token, L2_BASE_TOKEN_ADDRESS)) {
                if (!tx.overrides.value) {
                    tx.overrides.value = tx.amount;
                }
                const passedValue = BigInt(tx.overrides.value);
                if (passedValue !== BigInt(tx.amount)) {
                    // To avoid users shooting themselves into the foot, we will always use the amount to withdraw
                    // as the value
                    throw new Error('The tx.value is not equal to the value withdrawn!');
                }
                const ethL2Token = IEthToken__factory.connect(L2_BASE_TOKEN_ADDRESS, this);
                const populatedTx = await ethL2Token.withdraw.populateTransaction(tx.to, tx.overrides);
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
            const ntv = await this.connectL2NTV();
            const assetId = await ntv.assetId(tx.token);
            const originChainId = await ntv.originChainId(assetId);
            const l1ChainId = await this.getL1ChainId();
            const isTokenL1Native = originChainId === BigInt(l1ChainId) ||
                tx.token === ETH_ADDRESS_IN_CONTRACTS;
            if (!tx.bridgeAddress) {
                const bridgeAddresses = await this.getDefaultBridgeAddresses();
                tx.bridgeAddress = isTokenL1Native
                    ? bridgeAddresses.sharedL2
                    : L2_ASSET_ROUTER_ADDRESS;
            }
            let populatedTx;
            if (!isTokenL1Native) {
                const bridge = await this.connectL2AssetRouter();
                const chainId = Number((await this.getNetwork()).chainId);
                const assetId = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['uint256', 'address', 'address'], [chainId, L2_NATIVE_TOKEN_VAULT_ADDRESS, tx.token]));
                const assetData = encodeNTVTransferData(BigInt(tx.amount), tx.to, tx.token);
                populatedTx = await bridge.withdraw.populateTransaction(assetId, assetData, tx.overrides);
            }
            else {
                const bridge = await this.connectL2Bridge(tx.bridgeAddress);
                populatedTx = await bridge.withdraw.populateTransaction(tx.to, tx.token, tx.amount, tx.overrides);
            }
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
        async estimateGasWithdraw(transaction) {
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
        async getTransferTx(transaction) {
            var _a, _b;
            const { ...tx } = transaction;
            if (!tx.token) {
                tx.token = L2_BASE_TOKEN_ADDRESS;
            }
            else if (isAddressEq(tx.token, LEGACY_ETH_ADDRESS) ||
                isAddressEq(tx.token, ETH_ADDRESS_IN_CONTRACTS)) {
                tx.token = await this.l2TokenAddress(ETH_ADDRESS_IN_CONTRACTS);
            }
            tx.overrides ?? (tx.overrides = {});
            (_a = tx.overrides).from ?? (_a.from = tx.from);
            (_b = tx.overrides).type ?? (_b.type = EIP712_TX_TYPE);
            if (isAddressEq(tx.token, L2_BASE_TOKEN_ADDRESS)) {
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
            }
            else {
                const token = IERC20__factory.connect(tx.token, this);
                const populatedTx = await token.transfer.populateTransaction(tx.to, tx.amount, tx.overrides);
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
        async estimateGasTransfer(transaction) {
            const transferTx = await this.getTransferTx(transaction);
            return await this.estimateGas(transferTx);
        }
        /**
         * Returns a new filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newFilter}
         * and passing a filter object.
         *
         * @param filter The filter query to apply.
         */
        async newFilter(filter) {
            const id = await this.send('eth_newFilter', [
                await this._getFilter(filter),
            ]);
            return BigInt(id);
        }
        /**
         * Returns a new block filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newBlockFilter}.
         */
        async newBlockFilter() {
            const id = await this.send('eth_newBlockFilter', []);
            return BigInt(id);
        }
        /**
         * Returns a new pending transaction filter by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_newPendingTransactionFilter}.
         */
        async newPendingTransactionsFilter() {
            const id = await this.send('eth_newPendingTransactionFilter', []);
            return BigInt(id);
        }
        /**
         * Returns an array of logs by calling {@link https://ethereum.github.io/execution-apis/api-documentation/ eth_getFilterChanges}.
         *
         * @param idx The filter index.
         */
        async getFilterChanges(idx) {
            const logs = await this.send('eth_getFilterChanges', [
                ethers.toBeHex(idx),
            ]);
            return typeof logs[0] === 'string'
                ? logs
                : logs.map((log) => this._wrapLog(log));
        }
        /**
         * Returns the status of a specified transaction.
         *
         * @param txHash The hash of the transaction.
         */
        // This is inefficient. Status should probably be indicated in the transaction receipt.
        async getTransactionStatus(txHash) {
            const tx = await this.getTransaction(txHash);
            if (!tx) {
                return TransactionStatus.NotFound;
            }
            if (!tx.blockNumber) {
                return TransactionStatus.Processing;
            }
            const verifiedBlock = (await this.getBlock('finalized'));
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
        async broadcastTransaction(signedTx) {
            const { blockNumber, hash } = await resolveProperties({
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
            return this._wrapTransactionResponse(tx).replaceableTransaction(blockNumber);
        }
        /**
         * Returns a L2 transaction response from L1 transaction response.
         *
         * @param l1TxResponse The L1 transaction response.
         */
        async getL2TransactionFromPriorityOp(l1TxResponse) {
            const receipt = await l1TxResponse.wait();
            const l2Hash = getL2HashFromPriorityOp(receipt, await this.getMainContractAddress());
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
        async getPriorityOpResponse(l1TxResponse) {
            const l2Response = { ...l1TxResponse };
            l2Response.waitL1Commit = l1TxResponse.wait.bind(l1TxResponse);
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
        async _getPriorityOpConfirmationL2ToL1Log(txHash, index = 0) {
            const hash = ethers.hexlify(txHash);
            const receipt = await this.getTransactionReceipt(hash);
            if (!receipt) {
                throw new Error('Transaction is not mined!');
            }
            const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(([, log]) => isAddressEq(log.sender, BOOTLOADER_FORMAL_ADDRESS));
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
         */
        async getPriorityOpConfirmation(txHash, index = 0) {
            const { l2ToL1LogIndex, l2ToL1Log, l1BatchTxId } = await this._getPriorityOpConfirmationL2ToL1Log(txHash, index);
            const proof = await this.getLogProof(txHash, l2ToL1LogIndex);
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
         */
        async getContractAccountInfo(address) {
            const deployerContract = new Contract(CONTRACT_DEPLOYER_ADDRESS, CONTRACT_DEPLOYER.fragments, this);
            const data = await deployerContract.getAccountInfo(address);
            return {
                supportedAAVersion: Number(data.supportedAAVersion),
                nonceOrdering: Number(data.nonceOrdering),
            };
        }
        /**
         * Returns an estimation of the L2 gas required for token bridging via the default ERC20 bridge.
         *
         * @param providerL1 The Ethers provider for the L1 network.
         * @param token The address of the token to be bridged.
         * @param amount The deposit amount.
         * @param to The recipient address on the L2 network.
         * @param from The sender address on the L1 network.
         * @param gasPerPubdataByte The current gas per byte of pubdata.
         *
         * @see
         * {@link https://docs.zksync.io/build/developer-reference/bridging-asset.html#default-bridges Default bridges documentation}.
         */
        async estimateDefaultBridgeDepositL2Gas(providerL1, token, amount, to, from, gasPerPubdataByte) {
            // If the `from` address is not provided, we use a random address, because
            // due to storage slot aggregation, the gas estimation will depend on the address
            // and so estimation for the zero address may be smaller than for the sender.
            from ?? (from = ethers.Wallet.createRandom().address);
            token = isAddressEq(token, LEGACY_ETH_ADDRESS)
                ? ETH_ADDRESS_IN_CONTRACTS
                : token;
            if (await this.isBaseToken(token)) {
                return await this.estimateL1ToL2Execute({
                    contractAddress: to,
                    gasPerPubdataByte: gasPerPubdataByte,
                    caller: from,
                    calldata: '0x',
                    l2Value: amount,
                });
            }
            else {
                const bridgeAddresses = await this.getDefaultBridgeAddresses();
                const value = 0;
                const l1BridgeAddress = bridgeAddresses.sharedL1;
                const l2BridgeAddress = bridgeAddresses.sharedL2;
                const bridgeData = await getERC20DefaultBridgeData(token, providerL1);
                return await this.estimateCustomBridgeDepositL2Gas(l1BridgeAddress, l2BridgeAddress, token, amount, to, bridgeData, from, gasPerPubdataByte, value);
            }
        }
        /**
         * Returns an estimation of the L2 gas required for token bridging via the custom ERC20 bridge.
         *
         * @param l1BridgeAddress The address of the custom L1 bridge.
         * @param l2BridgeAddress The address of the custom L2 bridge.
         * @param token The address of the token to be bridged.
         * @param amount The deposit amount.
         * @param to The recipient address on the L2 network.
         * @param bridgeData Additional bridge data.
         * @param from The sender address on the L1 network.
         * @param gasPerPubdataByte The current gas per byte of pubdata.
         * @param l2Value The `msg.value` of L2 transaction.
         *
         * @see
         * {@link https://docs.zksync.io/build/developer-reference/bridging-asset.html#custom-bridges-on-l1-and-l2 Custom bridges documentation}.
         */
        async estimateCustomBridgeDepositL2Gas(l1BridgeAddress, l2BridgeAddress, token, amount, to, bridgeData, from, gasPerPubdataByte, l2Value) {
            const calldata = await getERC20BridgeCalldata(token, from, to, amount, bridgeData);
            return await this.estimateL1ToL2Execute({
                caller: applyL1ToL2Alias(l1BridgeAddress),
                contractAddress: l2BridgeAddress,
                gasPerPubdataByte: gasPerPubdataByte,
                calldata: calldata,
                l2Value: l2Value,
            });
        }
        /**
         * Returns gas estimation for an L1 to L2 execute operation.
         *
         * @param transaction The transaction details.
         * @param transaction.contractAddress The address of the contract.
         * @param transaction.calldata The transaction call data.
         * @param [transaction.caller] The caller's address.
         * @param [transaction.l2Value] The deposit amount.
         * @param [transaction.factoryDeps] An array of bytes containing contract bytecode.
         * @param [transaction.gasPerPubdataByte] The current gas per byte value.
         * @param [transaction.overrides] Transaction overrides including `gasLimit`, `gasPrice`, and `value`.
         */
        async estimateL1ToL2Execute(transaction) {
            transaction.gasPerPubdataByte ?? (transaction.gasPerPubdataByte = REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT);
            // If the `from` address is not provided, we use a random address, because
            // due to storage slot aggregation, the gas estimation will depend on the address
            // and so estimation for the zero address may be smaller than for the sender.
            transaction.caller ?? (transaction.caller = ethers.Wallet.createRandom().address);
            const customData = {
                gasPerPubdata: transaction.gasPerPubdataByte,
            };
            if (transaction.factoryDeps) {
                Object.assign(customData, { factoryDeps: transaction.factoryDeps });
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
        getRpcTransaction(tx) {
            const result = super.getRpcTransaction(tx);
            if (!tx.customData) {
                return result;
            }
            result.type = ethers.toBeHex(EIP712_TX_TYPE);
            result.eip712Meta = {
                gasPerPubdata: ethers.toBeHex(tx.customData.gasPerPubdata ?? 0),
            };
            if (tx.customData.factoryDeps) {
                result.eip712Meta.factoryDeps = tx.customData.factoryDeps.map((dep) => 
                // TODO (SMA-1605): we arraify instead of hexlifying because server expects Vec<u8>.
                //  We should change deserialization there.
                Array.from(ethers.getBytes(dep)));
            }
            if (tx.customData.customSignature) {
                result.eip712Meta.customSignature = Array.from(ethers.getBytes(tx.customData.customSignature));
            }
            if (tx.customData.paymasterParams) {
                result.eip712Meta.paymasterParams = {
                    paymaster: ethers.hexlify(tx.customData.paymasterParams.paymaster),
                    paymasterInput: Array.from(ethers.getBytes(tx.customData.paymasterParams.paymasterInput)),
                };
            }
            return result;
        }
    };
}
/**
 * A `Provider` extends {@link ethers.JsonRpcProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 */
export class Provider extends JsonRpcApiProvider(ethers.JsonRpcProvider) {
    contractAddresses() {
        return this._contractAddresses;
    }
    /**
     * Creates a new `Provider` instance for connecting to an L2 network.
     * Caching is disabled for local networks.
     * @param [url] The network RPC URL. Defaults to the local network.
     * @param [network] The network name, chain ID, or object with network details.
     * @param [options] Additional options for the provider.
     */
    constructor(url, network, options) {
        if (!url) {
            url = 'http://127.0.0.1:3050';
        }
        const isLocalNetwork = typeof url === 'string'
            ? url.includes('localhost') ||
                url.includes('127.0.0.1') ||
                url.includes('0.0.0.0')
            : url.url.includes('localhost') ||
                url.url.includes('127.0.0.1') ||
                url.url.includes('0.0.0.0');
        const optionsWithDisabledCache = isLocalNetwork
            ? { ...options, cacheTimeout: -1 }
            : options;
        super(url, network, optionsWithDisabledCache);
        _Provider_connect.set(this, void 0);
        typeof url === 'string'
            ? (__classPrivateFieldSet(this, _Provider_connect, new FetchRequest(url), "f"))
            : (__classPrivateFieldSet(this, _Provider_connect, url.clone(), "f"));
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
    async getTransactionReceipt(txHash) {
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
    async getTransaction(txHash) {
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
    async getBlock(blockHashOrBlockTag, includeTxs) {
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
    async getLogs(filter) {
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
    async getBalance(address, blockTag, tokenAddress) {
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
    async l2TokenAddress(token) {
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
    async l1TokenAddress(token) {
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
     * console.log(`Protocol version: ${await provider.getProtocolVersion()}`);
     */
    async getProtocolVersion(id) {
        return super.getProtocolVersion(id);
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
    async estimateGasL1(transaction) {
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
    async estimateFee(transaction) {
        return super.estimateFee(transaction);
    }
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
    async getFeeParams() {
        return super.getFeeParams();
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
    async getGasPrice() {
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
    async getLogProof(txHash, index) {
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
    async getL1BatchBlockRange(l1BatchNumber) {
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
    async getMainContractAddress() {
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
     * console.log(`Bridgehub: ${await provider.getBridgehubContractAddress()}`);
     */
    async getBridgehubContractAddress() {
        return super.getBridgehubContractAddress();
    }
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
    async getBaseTokenContractAddress() {
        return super.getBaseTokenContractAddress();
    }
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
    async isEthBasedChain() {
        return super.isEthBasedChain();
    }
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
    async isBaseToken(token) {
        return super.isBaseToken(token);
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
    async getTestnetPaymasterAddress() {
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
    async getDefaultBridgeAddresses() {
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
    async getAllAccountBalances(address) {
        return super.getAllAccountBalances(address);
    }
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
    async getConfirmedTokens(start = 0, limit = 255) {
        return super.getConfirmedTokens(start, limit);
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
    async l1ChainId() {
        return super.l1ChainId();
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
    async getL1ChainId() {
        return super.getL1ChainId();
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
    async getL1BatchNumber() {
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
    async getL1BatchDetails(number) {
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
    async getBlockDetails(number) {
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
    async getTransactionDetails(txHash) {
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
    async getBytecodeByHash(bytecodeHash) {
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
    async getRawBlockTransactions(number) {
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
    async getProof(address, keys, l1BatchNumber) {
        return super.getProof(address, keys, l1BatchNumber);
    }
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
    async sendRawTransactionWithDetailedOutput(signedTx) {
        return super.sendRawTransactionWithDetailedOutput(signedTx);
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
    async getWithdrawTx(transaction) {
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
    async estimateGasWithdraw(transaction) {
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
    async getTransferTx(transaction) {
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
    async estimateGasTransfer(transaction) {
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
    async newFilter(filter) {
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
    async newBlockFilter() {
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
    async newPendingTransactionsFilter() {
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
    async getFilterChanges(idx) {
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
    async getTransactionStatus(txHash) {
        return super.getTransactionStatus(txHash);
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
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
     * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
     * if (l1TxResponse) {
     *   console.log(`Tx: ${utils.toJSON(await provider.getL2TransactionFromPriorityOp(l1TxResponse))}`);
     * }
     */
    async getL2TransactionFromPriorityOp(l1TxResponse) {
        return super.getL2TransactionFromPriorityOp(l1TxResponse);
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
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     * const l1Tx = "0xcca5411f3e514052f4a4ae1c2020badec6e0998adb52c09959c5f5ff15fba3a8";
     * const l1TxResponse = await ethProvider.getTransaction(l1Tx);
     * if (l1TxResponse) {
     *   console.log(`Tx: ${utils.toJSON(await provider.getPriorityOpResponse(l1TxResponse))}`);
     * }
     */
    async getPriorityOpResponse(l1TxResponse) {
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
     * // Any L2 -> L1 transaction can be used.
     * // In this case, withdrawal transaction is used.
     * const tx = "0x2a1c6c74b184965c0cb015aae9ea134fd96215d2e4f4979cfec12563295f610e";
     * console.log(`Confirmation data: ${utils.toJSON(await provider.getPriorityOpConfirmation(tx, 0))}`);
     */
    async getPriorityOpConfirmation(txHash, index = 0) {
        return super.getPriorityOpConfirmation(txHash, index);
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
    async getContractAccountInfo(address) {
        return super.getContractAccountInfo(address);
    }
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, utils, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     *
     * const token = "0x0000000000000000000000000000000000000001";
     * const amount = 5;
     * const to = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const from = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const gasPerPubdataByte = utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
     *
     * const gas = await provider.estimateCustomBridgeDepositL2Gas(
     *   ethProvider,
     *   token,
     *   amount,
     *   to,
     *   from,
     *   gasPerPubdataByte
     * );
     * // gas = 355_704
     */
    async estimateDefaultBridgeDepositL2Gas(providerL1, token, amount, to, from, gasPerPubdataByte) {
        return super.estimateDefaultBridgeDepositL2Gas(providerL1, token, amount, to, from, gasPerPubdataByte);
    }
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     * const l1BridgeAddress = "0x3e8b2fe58675126ed30d0d12dea2a9bda72d18ae";
     * const l2BridgeAddress = "0x681a1afdc2e06776816386500d2d461a6c96cb45";
     * const token = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const amount = 5;
     * const to = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const bridgeData = "0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000
     * 0000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000016000000000000000000000
     * 000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000
     * 000000000000000000000000000000000000000000000000000000543726f776e0000000000000000000000000000000000000000000000000000
     * 000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000
     * 0000000000020000000000000000000000000000000000000000000000000000000000000000543726f776e000000000000000000000000000000
     * 000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000
     * 00000000000000000000000000000000012";
     * const from = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const gasPerPubdataByte = utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
     * const l2Value = 0;
     *
     * const gas = await utils.estimateCustomBridgeDepositL2Gas(
     *   provider,
     *   l1BridgeAddress,
     *   l2BridgeAddress,
     *   token,
     *   amount,
     *   to,
     *   bridgeData,
     *   from,
     *   gasPerPubdataByte,
     *   l2Value
     * );
     * // gas = 683_830
     */
    async estimateCustomBridgeDepositL2Gas(l1BridgeAddress, l2BridgeAddress, token, amount, to, bridgeData, from, gasPerPubdataByte, l2Value) {
        return super.estimateCustomBridgeDepositL2Gas(l1BridgeAddress, l2BridgeAddress, token, amount, to, bridgeData, from, gasPerPubdataByte, l2Value);
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
    async estimateL1ToL2Execute(transaction) {
        return super.estimateL1ToL2Execute(transaction);
    }
    getRpcError(payload, _error) {
        const { error } = _error;
        const message = _error.error.message ?? 'Execution reverted';
        const code = _error.error.code ?? 0;
        // @ts-ignore
        return makeError(message, code, { payload, error });
    }
    async _send(payload) {
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
     * @param zksyncNetwork The type of ZKsync network.
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = Provider.getDefaultProvider(types.Network.Sepolia);
     */
    static getDefaultProvider(zksyncNetwork = ZkSyncNetwork.Localhost) {
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
}
_Provider_connect = new WeakMap();
/* c8 ignore start */
/**
 * A `BrowserProvider` extends {@link ethers.BrowserProvider} and includes additional features for interacting with ZKsync Era.
 * It supports RPC endpoints within the `zks` namespace.
 * This provider is designed for frontend use in a browser environment and integration for browser wallets
 * (e.g., MetaMask, WalletConnect).
 */
export class BrowserProvider extends JsonRpcApiProvider(ethers.BrowserProvider) {
    contractAddresses() {
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
    constructor(ethereum, network) {
        super(ethereum, network);
        _BrowserProvider_request.set(this, void 0);
        this._contractAddresses = {};
        __classPrivateFieldSet(this, _BrowserProvider_request, async (method, params) => {
            const payload = { method, params };
            this.emit('debug', { action: 'sendEip1193Request', payload });
            try {
                const result = await ethereum.request(payload);
                this.emit('debug', { action: 'receiveEip1193Result', result });
                return result;
            }
            catch (e) {
                const error = new Error(e.message);
                error.code = e.code;
                error.data = e.data;
                error.payload = payload;
                this.emit('debug', { action: 'receiveEip1193Error', error });
                throw error;
            }
        }, "f");
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
    async getTransactionReceipt(txHash) {
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
    async getTransaction(txHash) {
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
    async getBlock(blockHashOrBlockTag, includeTxs) {
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
    async getLogs(filter) {
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
    async getBalance(address, blockTag, tokenAddress) {
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
    async l2TokenAddress(token) {
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
    async l1TokenAddress(token) {
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
     * console.log(`Protocol version: ${await provider.getProtocolVersion()}`);
     */
    async getProtocolVersion(id) {
        return super.getProtocolVersion(id);
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
    async estimateGasL1(transaction) {
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
    async estimateFee(transaction) {
        return super.estimateFee(transaction);
    }
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
    async getFeeParams() {
        return super.getFeeParams();
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
    async getGasPrice() {
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
    async getLogProof(txHash, index) {
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
    async getL1BatchBlockRange(l1BatchNumber) {
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
    async getMainContractAddress() {
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
     * console.log(`Bridgehub: ${await provider.getBridgehubContractAddress()}`);
     */
    async getBridgehubContractAddress() {
        return super.getBridgehubContractAddress();
    }
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
    async getBaseTokenContractAddress() {
        return super.getBaseTokenContractAddress();
    }
    /**
     * @inheritDoc
     *
     * import { BrowserProvider } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * console.log(`Is ETH based chain: ${await provider.isEthBasedChain()}`);
     */
    async isEthBasedChain() {
        return super.isEthBasedChain();
    }
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
    async isBaseToken(token) {
        return super.isBaseToken(token);
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
    async getTestnetPaymasterAddress() {
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
    async getDefaultBridgeAddresses() {
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
    async getAllAccountBalances(address) {
        return super.getAllAccountBalances(address);
    }
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
    async getConfirmedTokens(start = 0, limit = 255) {
        return super.getConfirmedTokens(start, limit);
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
    async l1ChainId() {
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
    async getL1BatchNumber() {
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
    async getL1BatchDetails(number) {
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
    async getBlockDetails(number) {
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
    async getTransactionDetails(txHash) {
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
    async getBytecodeByHash(bytecodeHash) {
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
    async getRawBlockTransactions(number) {
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
    async getProof(address, keys, l1BatchNumber) {
        return super.getProof(address, keys, l1BatchNumber);
    }
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
    async sendRawTransactionWithDetailedOutput(signedTx) {
        return super.sendRawTransactionWithDetailedOutput(signedTx);
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
    async getWithdrawTx(transaction) {
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
    async estimateGasWithdraw(transaction) {
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
    async getTransferTx(transaction) {
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
    async estimateGasTransfer(transaction) {
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
    async newFilter(filter) {
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
    async newBlockFilter() {
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
    async newPendingTransactionsFilter() {
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
    async getFilterChanges(idx) {
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
    async getTransactionStatus(txHash) {
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
    async getL2TransactionFromPriorityOp(l1TxResponse) {
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
    async getPriorityOpResponse(l1TxResponse) {
        return super.getPriorityOpResponse(l1TxResponse);
    }
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
    async getPriorityOpConfirmation(txHash, index = 0) {
        return super.getPriorityOpConfirmation(txHash, index);
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
    async getContractAccountInfo(address) {
        return super.getContractAccountInfo(address);
    }
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, utils, types } from "zksync-ethers";
     * import { ethers } from "ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const ethProvider = ethers.getDefaultProvider("sepolia");
     *
     * const token = "0x0000000000000000000000000000000000000001";
     * const amount = 5;
     * const to = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const from = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const gasPerPubdataByte = utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
     *
     * const gas = await provider.estimateCustomBridgeDepositL2Gas(
     *   ethProvider,
     *   token,
     *   amount,
     *   to,
     *   from,
     *   gasPerPubdataByte
     * );
     * // gas = 355_704
     */
    async estimateDefaultBridgeDepositL2Gas(providerL1, token, amount, to, from, gasPerPubdataByte) {
        return super.estimateDefaultBridgeDepositL2Gas(providerL1, token, amount, to, from, gasPerPubdataByte);
    }
    /**
     * @inheritDoc
     *
     * @example
     *
     * import { Provider, types } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const l1BridgeAddress = "0x3e8b2fe58675126ed30d0d12dea2a9bda72d18ae";
     * const l2BridgeAddress = "0x681a1afdc2e06776816386500d2d461a6c96cb45";
     * const token = "0x56E69Fa1BB0d1402c89E3A4E3417882DeA6B14Be";
     * const amount = 5;
     * const to = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const bridgeData = "0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000
     * 0000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000016000000000000000000000
     * 000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000
     * 000000000000000000000000000000000000000000000000000000543726f776e0000000000000000000000000000000000000000000000000000
     * 000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000
     * 0000000000020000000000000000000000000000000000000000000000000000000000000000543726f776e000000000000000000000000000000
     * 000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000
     * 00000000000000000000000000000000012";
     * const from = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
     * const gasPerPubdataByte = utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT;
     * const l2Value = 0;
     *
     * const gas = await utils.estimateCustomBridgeDepositL2Gas(
     *   provider,
     *   l1BridgeAddress,
     *   l2BridgeAddress,
     *   token,
     *   amount,
     *   to,
     *   bridgeData,
     *   from,
     *   gasPerPubdataByte,
     *   l2Value
     * );
     * // gas = 683_830
     */
    async estimateCustomBridgeDepositL2Gas(l1BridgeAddress, l2BridgeAddress, token, amount, to, bridgeData, from, gasPerPubdataByte, l2Value) {
        return super.estimateCustomBridgeDepositL2Gas(l1BridgeAddress, l2BridgeAddress, token, amount, to, bridgeData, from, gasPerPubdataByte, l2Value);
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
    async estimateL1ToL2Execute(transaction) {
        return super.estimateL1ToL2Execute(transaction);
    }
    async _send(payload) {
        ethers.assertArgument(!Array.isArray(payload), 'EIP-1193 does not support batch request', 'payload', payload);
        try {
            const result = await __classPrivateFieldGet(this, _BrowserProvider_request, "f").call(this, payload.method, payload.params || []);
            return [{ id: payload.id, result }];
        }
        catch (e) {
            return [
                {
                    id: payload.id,
                    error: { code: e.code, data: e.data, message: e.message },
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
    getRpcError(payload, error) {
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
     *
     * @example
     *
     * import { BrowserProvider, utils } from "zksync-ethers";
     *
     * const provider = new BrowserProvider(window.ethereum);
     * const hasSigner = await provider.hasSigner(0);
     */
    async hasSigner(address) {
        if (!address) {
            address = 0;
        }
        const accounts = await this.send('eth_accounts', []);
        if (typeof address === 'number') {
            return accounts.length > address;
        }
        return (accounts.filter((a) => isAddressEq(a, address))
            .length !== 0);
    }
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
    async getSigner(address) {
        if (!address) {
            address = 0;
        }
        if (!(await this.hasSigner(address))) {
            try {
                await __classPrivateFieldGet(this, _BrowserProvider_request, "f").call(this, 'eth_requestAccounts', []);
            }
            catch (error) {
                const payload = error.payload;
                throw this.getRpcError(payload, { id: payload.id, error });
            }
        }
        return Signer.from((await super.getSigner(address)), Number((await this.getNetwork()).chainId));
    }
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
    async estimateGas(transaction) {
        const gas = await super.estimateGas(transaction);
        const metamaskMinimum = 21000n;
        const isEIP712 = transaction.customData || transaction.type === EIP712_TX_TYPE;
        return gas > metamaskMinimum || isEIP712 ? gas : metamaskMinimum;
    }
}
_BrowserProvider_request = new WeakMap();
/* c8 ignore stop */
//# sourceMappingURL=provider.js.map