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
    AddressLike,
} from "ethers";
import { IERC20__factory, IEthToken__factory, IL2Bridge__factory } from "../typechain";
import {
    Address,
    TransactionResponse,
    TransactionRequest,
    TransactionStatus,
    Token,
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
} from "./types";
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
} from "./utils";
import { Signer } from "./signer";

import { formatLog, formatBlock, formatTransactionResponse, formatTransactionReceipt } from "./format";

type Constructor<T = {}> = new (...args: any[]) => T;

export function JsonRpcApiProvider<TBase extends Constructor<ethers.JsonRpcApiProvider>>(
    ProviderType: TBase,
) {
    return class Provider extends ProviderType {
        override _send(
            payload: JsonRpcPayload | Array<JsonRpcPayload>,
        ): Promise<Array<JsonRpcResult | JsonRpcError>> {
            throw new Error("Must be implemented by the derived class!");
        }

        contractAddresses(): {
            mainContract?: Address;
            erc20BridgeL1?: Address;
            erc20BridgeL2?: Address;
            wethBridgeL1?: Address;
            wethBridgeL2?: Address;
        } {
            throw new Error("Must be implemented by the derived class!");
        }

        override _getBlockTag(blockTag?: BlockTag): string | Promise<string> {
            if (blockTag == "committed") {
                return "committed";
            }
            return super._getBlockTag(blockTag);
        }

        override _wrapLog(value: any, network: ethers.Network): Log {
            return new Log(formatLog(value), this);
        }

        override _wrapBlock(value: any, network: ethers.Network): Block {
            const block: any = formatBlock(value);
            return new Block(super._wrapBlock(block, network), this);
        }

        override _wrapTransactionResponse(value: any, network: ethers.Network): TransactionResponse {
            const tx: any = formatTransactionResponse(value);
            return new TransactionResponse(super._wrapTransactionResponse(tx, network), this);
        }

        override _wrapTransactionReceipt(value: any, network: ethers.Network): TransactionReceipt {
            const receipt: any = formatTransactionReceipt(value);
            return new TransactionReceipt(receipt, this);
        }

        override async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
            while (true) {
                const receipt = await super.getTransactionReceipt(txHash) as TransactionReceipt;
                if (receipt && receipt.blockNumber) {
                    return receipt;
                }
                await sleep(500);
            }
        }

        override async getTransaction(txHash: string): Promise<TransactionResponse> {
            return (await super.getTransaction(txHash)) as TransactionResponse;
        }

        override async getBlock(blockHashOrBlockTag: BlockTag, includeTxs?: boolean): Promise<Block> {
            return (await super.getBlock(blockHashOrBlockTag, includeTxs)) as Block;
        }

        override async getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]> {
            return (await super.getLogs(filter)) as Log[];
        }

        override async getBalance(
            address: Address,
            blockTag?: BlockTag,
            tokenAddress?: Address,
        ): Promise<bigint> {
            if (tokenAddress == null || isETH(tokenAddress)) {
                // requesting ETH balance
                return await super.getBalance(address, blockTag);
            } else {
                try {
                    let token = IERC20__factory.connect(tokenAddress, this);
                    return await token.balanceOf(address, { blockTag });
                } catch {
                    return 0n;
                }
            }
        }

        async l2TokenAddress(token: Address): Promise<string> {
            if (token == ETH_ADDRESS) {
                return ETH_ADDRESS;
            } else {
                const bridgeAddresses = await this.getDefaultBridgeAddresses();
                const l2WethBridge = IL2Bridge__factory.connect(bridgeAddresses.wethL2 as string, this);
                try {
                    const l2WethToken = await l2WethBridge.l2TokenAddress(token);
                    if (l2WethToken != ethers.ZeroAddress) {
                        return l2WethToken;
                    }
                } catch (e) {}

                const erc20Bridge = IL2Bridge__factory.connect(bridgeAddresses.erc20L2!, this);
                return await erc20Bridge.l2TokenAddress(token);
            }
        }

        async l1TokenAddress(token: Address): Promise<string> {
            if (token == ETH_ADDRESS) {
                return ETH_ADDRESS;
            } else {
                const bridgeAddresses = await this.getDefaultBridgeAddresses();
                const l2WethBridge = IL2Bridge__factory.connect(bridgeAddresses.wethL2 as string, this);
                try {
                    const l1WethToken = await l2WethBridge.l1TokenAddress(token);
                    if (l1WethToken != ethers.ZeroAddress) {
                        return l1WethToken;
                    }
                } catch (e) {}
                const erc20Bridge = IL2Bridge__factory.connect(bridgeAddresses.erc20L2!, this);
                return await erc20Bridge.l1TokenAddress(token);
            }
        }

        async estimateGasL1(transaction: TransactionRequest): Promise<bigint> {
            return await this.send("zks_estimateGasL1ToL2", [this.getRpcTransaction(transaction)]);
        }

        async estimateFee(transaction: TransactionRequest): Promise<Fee> {
            return await this.send("zks_estimateFee", [transaction]);
        }

        async getGasPrice(): Promise<bigint> {
            const feeData = await this.getFeeData();
            return feeData.gasPrice!;
        }

        async getLogProof(txHash: BytesLike, index?: number): Promise<MessageProof | null> {
            return await this.send("zks_getL2ToL1LogProof", [ethers.hexlify(txHash), index]);
        }

        async getL1BatchBlockRange(l1BatchNumber: number): Promise<[number, number] | null> {
            const range = await this.send("zks_getL1BatchBlockRange", [l1BatchNumber]);
            if (range == null) {
                return null;
            }
            return [parseInt(range[0], 16), parseInt(range[1], 16)];
        }

        async getMainContractAddress(): Promise<Address> {
            if (!this.contractAddresses().mainContract) {
                this.contractAddresses().mainContract = await this.send("zks_getMainContract", []);
            }
            return this.contractAddresses().mainContract!;
        }

        async getTestnetPaymasterAddress(): Promise<Address | null> {
            // Unlike contract's addresses, the testnet paymaster is not cached, since it can be trivially changed
            // on the fly by the server and should not be relied on to be constant
            return await this.send("zks_getTestnetPaymaster", []);
        }

        async getDefaultBridgeAddresses() {
            if (!this.contractAddresses().erc20BridgeL1) {
                let addresses = await this.send("zks_getBridgeContracts", []);
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

        async getConfirmedTokens(start: number = 0, limit: number = 255): Promise<Token[]> {
            const tokens: Token[] = await this.send("zks_getConfirmedTokens", [start, limit]);
            return tokens.map((token) => ({ address: token.l2Address, ...token }));
        }

        async getAllAccountBalances(address: Address): Promise<BalancesMap> {
            let balances = await this.send("zks_getAllAccountBalances", [address]);
            for (let token in balances) {
                balances[token] = BigInt(balances[token]);
            }
            return balances;
        }

        async l1ChainId(): Promise<number> {
            const res = await this.send("zks_L1ChainId", []);
            return Number(res);
        }

        async getL1BatchNumber(): Promise<number> {
            const number = await this.send("zks_L1BatchNumber", []);
            return Number(number);
        }

        async getL1BatchDetails(number: number): Promise<BatchDetails> {
            return await this.send("zks_getL1BatchDetails", [number]);
        }

        async getBlockDetails(number: number): Promise<BlockDetails> {
            return await this.send("zks_getBlockDetails", [number]);
        }

        async getTransactionDetails(txHash: BytesLike): Promise<TransactionDetails> {
            return await this.send("zks_getTransactionDetails", [txHash]);
        }

        async getBytecodeByHash(bytecodeHash: BytesLike): Promise<Uint8Array> {
            return await this.send("zks_getBytecodeByHash", [bytecodeHash]);
        }

        async getRawBlockTransactions(number: number): Promise<RawBlockTransaction[]> {
            return await this.send("zks_getRawBlockTransactions", [number]);
        }

        async getWithdrawTx(transaction: {
            token: Address;
            amount: BigNumberish;
            from?: Address;
            to?: Address;
            bridgeAddress?: Address;
            overrides?: ethers.Overrides;
        }): Promise<EthersTransactionRequest> {
            const { ...tx } = transaction;

            if (tx.to == null && tx.from == null) {
                throw new Error("withdrawal target address is undefined");
            }

            tx.to ??= tx.from;
            tx.overrides ??= {};
            tx.overrides.from ??= tx.from;

            if (isETH(tx.token)) {
                if (!tx.overrides.value) {
                    tx.overrides.value = tx.amount;
                }
                const passedValue = BigInt(tx.overrides.value);

                if (passedValue != BigInt(tx.amount)) {
                    // To avoid users shooting themselves into the foot, we will always use the amount to withdraw
                    // as the value

                    throw new Error("The tx.value is not equal to the value withdrawn");
                }

                const ethL2Token = IEthToken__factory.connect(L2_ETH_TOKEN_ADDRESS, this);
                return ethL2Token.withdraw.populateTransaction(tx.to as Address, tx.overrides);
            }

            if (tx.bridgeAddress == null) {
                const bridgeAddresses = await this.getDefaultBridgeAddresses();
                const l2WethBridge = IL2Bridge__factory.connect(bridgeAddresses.wethL2 as string, this);
                let l1WethToken = ethers.ZeroAddress;
                try {
                    l1WethToken = await l2WethBridge.l1TokenAddress(tx.token);
                } catch (e) {}
                tx.bridgeAddress =
                    l1WethToken != ethers.ZeroAddress ? bridgeAddresses.wethL2 : bridgeAddresses.erc20L2;
            }

            const bridge = IL2Bridge__factory.connect(tx.bridgeAddress!, this);
            return bridge.withdraw.populateTransaction(
                tx.to as Address,
                tx.token,
                tx.amount,
                tx.overrides,
            );
        }

        async estimateGasWithdraw(transaction: {
            token: Address;
            amount: BigNumberish;
            from?: Address;
            to?: Address;
            bridgeAddress?: Address;
            overrides?: ethers.Overrides;
        }): Promise<bigint> {
            const withdrawTx = await this.getWithdrawTx(transaction);
            return await this.estimateGas(withdrawTx);
        }

        async getTransferTx(transaction: {
            to: Address;
            amount: BigNumberish;
            from?: Address;
            token?: Address;
            overrides?: ethers.Overrides;
        }): Promise<EthersTransactionRequest> {
            const { ...tx } = transaction;
            tx.overrides ??= {};
            tx.overrides.from ??= tx.from;

            if (tx.token == null || tx.token == ETH_ADDRESS) {
                return {
                    ...tx.overrides,
                    to: tx.to,
                    value: tx.amount,
                };
            } else {
                const token = IERC20__factory.connect(tx.token, this);
                return await token.transfer.populateTransaction(tx.to, tx.amount, tx.overrides);
            }
        }

        async estimateGasTransfer(transaction: {
            to: Address;
            amount: BigNumberish;
            from?: Address;
            token?: Address;
            overrides?: ethers.Overrides;
        }): Promise<bigint> {
            const transferTx = await this.getTransferTx(transaction);
            return await this.estimateGas(transferTx);
        }

        async newFilter(filter: FilterByBlockHash | Filter): Promise<bigint> {
            const id = await this.send("eth_newFilter", [await this._getFilter(filter)]);
            return BigInt(id);
        }

        async newBlockFilter(): Promise<bigint> {
            const id = await this.send("eth_newBlockFilter", []);
            return BigInt(id);
        }

        async newPendingTransactionsFilter(): Promise<bigint> {
            const id = await this.send("eth_newPendingTransactionFilter", []);
            return BigInt(id);
        }

        async getFilterChanges(idx: bigint): Promise<Array<Log | string>> {
            const logs = await this.send("eth_getFilterChanges", [ethers.toBeHex(idx)]);
            const network = await this.getNetwork();
            return typeof logs[0] === "string"
                ? logs
                : logs.map((log: any) => this._wrapLog(log, network));
        }

        // This is inefficient. Status should probably be indicated in the transaction receipt.
        async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
            const tx = await this.getTransaction(txHash);
            if (tx == null) {
                return TransactionStatus.NotFound;
            }
            if (tx.blockNumber == null) {
                return TransactionStatus.Processing;
            }
            const verifiedBlock = (await this.getBlock("finalized")) as Block;
            if (tx.blockNumber <= verifiedBlock.number) {
                return TransactionStatus.Finalized;
            }
            return TransactionStatus.Committed;
        }

        override async broadcastTransaction(signedTx: string): Promise<TransactionResponse> {
            const { blockNumber, hash, network } = await resolveProperties({
                blockNumber: this.getBlockNumber(),
                hash: this._perform({
                    method: "broadcastTransaction",
                    signedTransaction: signedTx,
                }),
                network: this.getNetwork(),
            });

            const tx = Transaction.from(signedTx);
            if (tx.hash !== hash) {
                throw new Error("@TODO: the returned hash did not match");
            }

            return this._wrapTransactionResponse(<any>tx, network).replaceableTransaction(blockNumber);
        }

        async getL2TransactionFromPriorityOp(
            l1TxResponse: ethers.TransactionResponse,
        ): Promise<TransactionResponse> {
            const receipt = await l1TxResponse.wait();
            const l2Hash = getL2HashFromPriorityOp(
                receipt as ethers.TransactionReceipt,
                await this.getMainContractAddress(),
            );

            let status = null;
            do {
                status = await this.getTransactionStatus(l2Hash);
                await sleep(this.pollingInterval);
            } while (status == TransactionStatus.NotFound);

            return await this.getTransaction(l2Hash);
        }

        async getPriorityOpResponse(
            l1TxResponse: ethers.TransactionResponse,
        ): Promise<PriorityOpResponse> {
            const l2Response = { ...l1TxResponse } as PriorityOpResponse;

            l2Response.waitL1Commit = l2Response.wait;
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

        async getContractAccountInfo(address: Address): Promise<ContractAccountInfo> {
            const deployerContract = new Contract(
                CONTRACT_DEPLOYER_ADDRESS,
                CONTRACT_DEPLOYER.fragments,
                this,
            );
            const data = await deployerContract.getAccountInfo(address);

            return {
                supportedAAVersion: data.supportedAAVersion,
                nonceOrdering: data.nonceOrdering,
            };
        }

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

        override getRpcTransaction(tx: TransactionRequest): JsonRpcTransactionRequest {
            const result: any = super.getRpcTransaction(tx);
            if (tx.customData == null) {
                return result;
            }
            result.type = ethers.toBeHex(EIP712_TX_TYPE);
            result.eip712Meta = {
                gasPerPubdata: ethers.toBeHex(tx.customData.gasPerPubdata ?? 0),
            } as any;
            if (tx.customData.factoryDeps) {
                result.eip712Meta.factoryDeps = tx.customData.factoryDeps.map((dep: ethers.BytesLike) =>
                    // TODO (SMA-1605): we arraify instead of hexlifying because server expects Vec<u8>.
                    //  We should change deserialization there.
                    Array.from(ethers.getBytes(dep)),
                );
            }
            if (tx.customData.paymasterParams) {
                // @ts-ignore
                result.eip712Meta.paymasterParams = {
                    paymaster: ethers.hexlify(tx.customData.paymasterParams.paymaster),
                    paymasterInput: Array.from(
                        ethers.getBytes(tx.customData.paymasterParams.paymasterInput),
                    ),
                };
            }
            return result;
        }
    };
}

export class Provider extends JsonRpcApiProvider(ethers.JsonRpcProvider) {
    #connect: FetchRequest;
    protected _contractAddresses: {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
    };

    override contractAddresses(): {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
    } {
        return this._contractAddresses;
    }

    constructor(url?: ethers.FetchRequest | string, network?: Networkish, options?: any) {
        if (url == null) {
            url = "http://localhost:3050";
        }
        super(url, network, options);
        typeof url === "string"
            ? (this.#connect = new FetchRequest(url))
            : (this.#connect = url.clone());
        this.pollingInterval = 500;
        this._contractAddresses = {};
    }

    override async _send(
        payload: JsonRpcPayload | Array<JsonRpcPayload>,
    ): Promise<Array<JsonRpcResult>> {
        const request = this._getConnection();
        request.body = JSON.stringify(payload);
        request.setHeader("content-type", "application/json");

        const response = await request.send();
        response.assertOk();

        let resp = response.bodyJson;
        if (!Array.isArray(resp)) {
            resp = [resp];
        }

        return resp;
    }

    static getDefaultProvider(zksyncNetwork: ZkSyncNetwork = ZkSyncNetwork.Localhost) {
        if (process.env.ZKSYNC_WEB3_API_URL) {
            return new Provider(process.env.ZKSYNC_WEB3_API_URL);
        }
        switch (zksyncNetwork) {
            case ZkSyncNetwork.Localhost:
                return new Provider("http://localhost:3050");
            case ZkSyncNetwork.Goerli:
                return new Provider("https://zksync2-testnet.zksync.dev");
            case ZkSyncNetwork.Sepolia:
                return new Provider("https://sepolia.era.zksync.dev");
            case ZkSyncNetwork.Mainnet:
                return new Provider("https://mainnet.era.zksync.io");
        }
    }
}

export class BrowserProvider extends JsonRpcApiProvider(ethers.BrowserProvider) {
    #request: (method: string, params: Array<any> | Record<string, any>) => Promise<any>;

    protected _contractAddresses: {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
    };

    override contractAddresses(): {
        mainContract?: Address;
        erc20BridgeL1?: Address;
        erc20BridgeL2?: Address;
    } {
        return this._contractAddresses;
    }

    constructor(ethereum: Eip1193Provider, network?: Networkish) {
        super(ethereum, network);
        this._contractAddresses = {};

        this.#request = async (method: string, params: Array<any> | Record<string, any>) => {
            const payload = { method, params };
            this.emit("debug", { action: "sendEip1193Request", payload });
            try {
                const result = await ethereum.request(payload);
                this.emit("debug", { action: "receiveEip1193Result", result });
                return result;
            } catch (e: any) {
                const error = new Error(e.message);
                (<any>error).code = e.code;
                (<any>error).data = e.data;
                (<any>error).payload = payload;
                this.emit("debug", { action: "receiveEip1193Error", error });
                throw error;
            }
        };
    }

    override async _send(
        payload: JsonRpcPayload | Array<JsonRpcPayload>,
    ): Promise<Array<JsonRpcResult | JsonRpcError>> {
        ethers.assertArgument(
            !Array.isArray(payload),
            "EIP-1193 does not support batch request",
            "payload",
            payload,
        );

        try {
            const result = await this.#request(payload.method, payload.params || []);
            return [{ id: payload.id, result }];
        } catch (e: any) {
            return [
                {
                    id: payload.id,
                    error: { code: e.code, data: e.data, message: e.message },
                },
            ];
        }
    }

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

    override async hasSigner(address: number | string): Promise<boolean> {
        if (address == null) {
            address = 0;
        }

        const accounts = await this.send("eth_accounts", []);
        if (typeof address === "number") {
            return accounts.length > address;
        }

        address = address.toLowerCase();
        return accounts.filter((a: string) => a.toLowerCase() === address).length !== 0;
    }

    override async getSigner(address?: number | string): Promise<Signer> {
        if (address == null) {
            address = 0;
        }

        if (!(await this.hasSigner(address))) {
            try {
                await this.#request("eth_requestAccounts", []);
            } catch (error: any) {
                const payload = error.payload;
                throw this.getRpcError(payload, { id: payload.id, error });
            }
        }

        return Signer.from(
            (await super.getSigner(address)) as any,
            Number((await this.getNetwork()).chainId),
        );
    }

    override async estimateGas(transaction: TransactionRequest): Promise<bigint> {
        const gas = await super.estimateGas(transaction);
        const metamaskMinimum = 21000n;
        const isEIP712 = transaction.customData != null || transaction.type == EIP712_TX_TYPE;
        return gas > metamaskMinimum || isEIP712 ? gas : metamaskMinimum;
    }
}
