import { expect } from "chai";
import { Provider, types, utils, Wallet } from "../../src";
import { BigNumber, ethers } from "ethers";
import { PRIVATE_KEY, ADDRESS, RECEIVER,  DAI_L1 } from "../utils";

describe("Provider", () => {

    const provider = Provider.getDefaultProvider();
    const ethProvider = ethers.getDefaultProvider("http://localhost:8545");
    const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider); // overwritten transfer method use L1 network

    // const TOKENS_L1 = require("../tokens.json");
    // const DAI_L1 = TOKENS_L1[0].address;

    let tx;
    let isEthBased;
    let baseToken;

    before("setup", async function () {
        isEthBased = await provider.isEthBasedChain();
        baseToken = await provider.getBaseTokenContractAddress();

        this.timeout(25_000);
        tx = await wallet.transfer({
            token: utils.LEGACY_ETH_ADDRESS,
            to: RECEIVER,
            amount: 1_000_000,
        });
        await tx.wait();
    });

    describe("#constructor()", () => {
        it("Provider(null) should return a `Provider` connected to local network when URL is not defined", async () => {
            const provider = new Provider(undefined);
            const network = await provider.getNetwork();
            expect(network.chainId).to.be.equal(9);
        });
    });

    describe("#getDefaultProvider()", () => {
        it("should return a provider connected to local network", async () => {
            const provider = Provider.getDefaultProvider(types.Network.Localhost);
            const network = await provider.getNetwork();
            expect(network.chainId).not.to.be.null;
        });

        it("should return a provider connected to Sepolia network", async () => {
            const provider = Provider.getDefaultProvider(types.Network.Sepolia);
            const network = await provider.getNetwork();
            expect(network.chainId).to.be.equal(300);
        });

        it("should return a provider connected to main network", async () => {
            const provider = Provider.getDefaultProvider(types.Network.Mainnet);
            const network = await provider.getNetwork();
            expect(network.chainId).to.be.equal(324);
        });
    });

    describe("#getMainContractAddress()", () => {
        it("should return the address of main contract", async () => {
            const result = await provider.getMainContractAddress();
            expect(result).not.to.be.null;
        });
    });

    describe("#getBridgehubContractAddress()", () => {
        it("should return the address of main contract", async () => {
            const result = await provider.getBridgehubContractAddress();
            expect(result).not.to.be.null;
        });
    });

    describe("#getTestnetPaymasterAddress()", () => {
        it("should return the address of testnet paymaster", async () => {
            const result = await provider.getTestnetPaymasterAddress();
            expect(result).not.to.be.null;
        });
    });

    describe("#l1ChainId()", () => {
        it("should return L1 chain ID", async () => {
            const L1_CHAIN_ID = 9;
            const result = await provider.l1ChainId();
            expect(result).to.be.equal(L1_CHAIN_ID);
        });
    });

    describe("getBlockNumber()", () => {
        it("should return block number", async () => {
            const result = await provider.getBlockNumber();
            expect(result).to.be.greaterThan(0);
        });
    });

    describe("#getL1BatchNumber()", () => {
        it("should return L1 batch number", async () => {
            const result = await provider.getL1BatchNumber();
            expect(result).to.be.greaterThan(0);
        });
    });

    describe("#getBalance()", () => {
        it("should return balance of the account at `address`", async () => {
            const result = await provider.getBalance(ADDRESS);
            expect(result.gte(BigNumber.from(0))).to.be.true;
        });

        it("should return a DAI balance of the account at `address`", async () => {
            const result = await provider.getBalance(
                ADDRESS,
                "latest",
                await provider.l2TokenAddress(DAI_L1),
            );
            expect(result.isZero()).to.be.false;
        });
    });

    describe("#getAllAccountBalances()", () => {
        it("should return all balances of the account at `address`", async () => {
            const result = await provider.getAllAccountBalances(ADDRESS);
            const expected = isEthBased ? 2 : 3;
            expect(Object.keys(result)).to.have.lengthOf(expected);
        });
    });

    describe("#getBlockDetails()", () => {
        it("should return block details", async () => {
            const result = await provider.getBlockDetails(1);
            expect(result).not.to.be.null;
        });
    });

    describe("#getTransactionDetails()", () => {
        it("should return transaction details", async () => {
            const result = await provider.getTransactionDetails(tx.hash);
            expect(result).not.to.be.null;
        });
    });

    describe("#getBytecodeByHash(txHash)", () => {
        it("should return bytecode of a contract", async () => {
            const testnetPaymasterBytecode = await provider.getCode(
                (await provider.getTestnetPaymasterAddress()) as string,
            );
            const tokenFactoryDepsHash = ethers.utils.hexlify(
                utils.hashBytecode(testnetPaymasterBytecode),
            );
            const result = await provider.getBytecodeByHash(tokenFactoryDepsHash);
            expect(result).to.be.deep.equal(Array.from(ethers.utils.arrayify(testnetPaymasterBytecode)));
        });
    });

    describe("#getRawBlockTransactions(number)", () => {
        it("should return the raw transactions", async () => {
            const blockNumber = await provider.getBlockNumber();
            const result = await provider.getRawBlockTransactions(blockNumber);
            expect(result).not.to.be.null;
        });
    });

    describe("#getTransactionStatus()", () => {
        it("should return transaction status", async () => {
            const result = await provider.getTransactionStatus(tx.hash);
            expect(result).not.to.be.null;
        });

        it("should return the `NotFound` status for a non-existing transaction", async () => {
            const tx = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const result = await provider.getTransactionStatus(tx);
            expect(result).to.be.equal(types.TransactionStatus.NotFound);
        });
    });

    describe("#getTransaction()", () => {
        it("should return transaction", async () => {
            const result = await provider.getTransaction(tx.hash);
            expect(result).not.to.be.null;
        });
    });

    describe("#getTransactionReceipt()", () => {
        it("should return transaction receipt", async () => {
            const result = await provider.getTransaction(tx.hash);
            expect(result).not.to.be.null;
        });
    });

    describe("#getDefaultBridgeAddresses()", () => {
        it("should return default bridges", async () => {
            const result = await provider.getDefaultBridgeAddresses();
            expect(result).not.to.be.null;
        });
    });

    describe("#newBlockFilter()", () => {
        it("should return new block filter", async () => {
            const result = await provider.newBlockFilter();
            expect(result).not.to.be.null;
        });
    });

    describe("#newPendingTransactionsFilter()", () => {
        it("should return new pending block filter", async () => {
            const result = await provider.newPendingTransactionsFilter();
            expect(result).not.to.be.null;
        });
    });

    describe("#newFilter()", () => {
        it("should return new filter", async () => {
            const result = await provider.newFilter({
                fromBlock: 0,
                toBlock: 5,
                address: utils.L2_BASE_TOKEN_ADDRESS,
            });
            expect(result).not.to.be.null;
        });
    });

    describe("#getContractAccountInfo()", () => {
        it("should return contract account info", async () => {
            const TESTNET_PAYMASTER = "0x0f9acdb01827403765458b4685de6d9007580d15";
            const result = await provider.getContractAccountInfo(TESTNET_PAYMASTER);
            expect(result).not.to.be.null;
        });
    });

    describe("#l2TokenAddress()", () => {
        it("should return the L2 base address", async () => {
            const result = await provider.l2TokenAddress(baseToken);
            expect(result).to.be.equal(utils.L2_BASE_TOKEN_ADDRESS);
        });

        it("should return the L2 ETH address", async () => {
            if (!isEthBased) {
                const result = await provider.l2TokenAddress(utils.LEGACY_ETH_ADDRESS);
                expect(result).not.to.be.null;
            }
        });

        it("should return the L2 DAI address", async () => {
            const result = await provider.l2TokenAddress(DAI_L1);
            expect(result).not.to.be.null;
        });
    });

    describe("#l1TokenAddress()", () => {
        it("should return L1 token address", async () => {
            const result = await provider.l1TokenAddress(utils.LEGACY_ETH_ADDRESS);
            expect(result).to.be.equal(utils.LEGACY_ETH_ADDRESS);
        });

        it("should return the L1 DAI address", async () => {
            const result = await provider.l1TokenAddress(await provider.l2TokenAddress(DAI_L1));
            expect(result).to.be.equal(DAI_L1);
        });
    });

    describe("#getBlock()", () => {
        it("should return block with transactions", async () => {
            const result = await provider.getBlock("latest");
            expect(result).not.to.be.null;
        });
    });

    describe("#getBlockWithTransactions()", () => {
        it("should return block with transactions", async () => {
            const result = await provider.getBlockWithTransactions("latest");
            expect(result).not.to.be.null;
        });
    });

    describe("#getBlockDetails()", () => {
        it("should return block with transactions", async () => {
            const result = await provider.getBlockDetails(await provider.getBlockNumber());
            expect(result).not.to.be.null;
        });
    });

    describe("#getL1BatchBlockRange()", () => {
        it("should return L1 batch block range", async () => {
            const l1BatchNumber = await provider.getL1BatchNumber();
            const result = await provider.getL1BatchBlockRange(l1BatchNumber);
            expect(result).not.to.be.null;
        });
    });

    describe("#getL1BatchDetails()", () => {
        it("should return L1 batch details", async () => {
            const l1BatchNumber = await provider.getL1BatchNumber();
            const result = await provider.getL1BatchDetails(l1BatchNumber);
            expect(result).not.to.be.null;
        });
    });

    describe("#getLogs()", () => {
        it("should return logs", async () => {
            const result = await provider.getLogs({
                fromBlock: 0,
                toBlock: 5,
                address: utils.L2_BASE_TOKEN_ADDRESS,
            });
            expect(result).not.to.be.null;
        });
    });

    describe("#getWithdrawTx()", () => {
        it("return withdraw transaction", async () => {
            const WITHDRAW_TX = {
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                value: BigNumber.from(7_000_000_000),
                to: "0x000000000000000000000000000000000000800A",
                data: "0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049",
            };
            const result = await provider.getWithdrawTx({
                token: baseToken,
                amount: 7_000_000_000,
                to: ADDRESS,
                from: ADDRESS,
            });
            expect(result).to.be.deep.equal(WITHDRAW_TX);
        });

        it("should return a withdraw transaction with `tx.from==tx.to` when `tx.to` is not provided", async () => {
            const WITHDRAW_TX = {
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                value: BigNumber.from(7_000_000_000),
                to: "0x000000000000000000000000000000000000800A",
                data: "0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049",
            };
            const result = await provider.getWithdrawTx({
                token: baseToken,
                amount: 7_000_000_000,
                from: ADDRESS,
            });
            expect(result).to.be.deep.equal(WITHDRAW_TX);
        });

        it("should throw an error when `tx.to=undefined && tx.from=undefined`", async () => {
            try {
                await provider.getWithdrawTx({
                    token: utils.LEGACY_ETH_ADDRESS,
                    amount: 5,
                    to: undefined,
                    from: undefined,
                });
            } catch (e) {
                expect(e).not.to.be.equal("withdrawal target address is undefined");
            }
        });

        it("should throw an error when `tx.amount!=tx.overrides.value", async () => {
            try {
                await provider.getWithdrawTx({
                    token: utils.LEGACY_ETH_ADDRESS,
                    amount: 5,
                    to: ADDRESS,
                    from: ADDRESS,
                    overrides: { value: 7 },
                });
            } catch (e) {
                expect(e).not.to.be.equal("The tx.value is not equal to the value withdrawn");
            }
        });
    });

    describe("#getTransferTx()", () => {
        it("should return transfer transaction", async () => {
            const TRANSFER_TX = {
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: RECEIVER,
                value: 7_000_000_000,
            };
            const result = await provider.getTransferTx({
                token: utils.LEGACY_ETH_ADDRESS,
                amount: 7_000_000_000,
                to: RECEIVER,
                from: ADDRESS,
            });
            expect(result).to.be.deep.equal(TRANSFER_TX);
        });
    });

    describe("#estimateGasWithdraw()", () => {
        it("should return gas estimation of withdraw transaction", async () => {
            const tokenAddress = isEthBased ? utils.ETH_ADDRESS_IN_CONTRACTS : await wallet.l2TokenAddress(utils.ETH_ADDRESS_IN_CONTRACTS);
            const result = await provider.estimateGasWithdraw({
                token: tokenAddress,
                amount: 7_000_000_000,
                to: ADDRESS,
                from: ADDRESS,
            });
            expect(result.gte(BigNumber.from(0))).to.be.true;
        });
    });

    describe("#estimateGasTransfer()", () => {
        it("should return gas estimation of transfer transaction", async () => {
            const result = await provider.estimateGasTransfer({
                token: utils.LEGACY_ETH_ADDRESS,
                amount: 7_000_000_000,
                to: RECEIVER,
                from: ADDRESS,
            });
            expect(result.gte(BigNumber.from(0))).to.be.be.true;
        });
    });

    describe("#estimateGasL1()", () => {
        it("should return gas estimation of L1 transaction", async () => {
            const result = await provider.estimateGasL1({
                from: ADDRESS,
                to: await provider.getBridgehubContractAddress(),
                value: 7_000_000_000,
                customData: {
                    gasPerPubdata: 800,
                },
            });
            expect(result.gte(BigNumber.from(0))).to.be.true;
        });
    });

    describe("#estimateL1ToL2Execute()", () => {
        it("should return gas estimation of L1 to L2 transaction", async () => {
            const result = await provider.estimateL1ToL2Execute({
                contractAddress: await provider.getBridgehubContractAddress(),
                calldata: "0x",
                caller: ADDRESS,
                l2Value: 7_000_000_000,
            });
            expect(result.gte(BigNumber.from(0))).to.be.true;
        });
    });

    describe("#estimateFee()", () => {
        it("should return gas estimation of transaction", async () => {
            const result = await provider.estimateFee({
                from: ADDRESS,
                to: RECEIVER,
                value: `0x${BigInt(7_000_000_000).toString(16)}`,
            });
            expect(result).not.to.be.null;
        });
    });

    describe("#estimateGas()", () => {
        it("should return gas estimation of transaction", async () => {
            const result = await provider.estimateGas({
                from: ADDRESS,
                to: await provider.l2TokenAddress(DAI_L1),
                data: utils.IERC20.encodeFunctionData("approve", [RECEIVER, 1]),
            });
            expect(result.gt(BigNumber.from(0))).to.be.true;
        });

        it("should return a gas estimation of the EIP712 transaction", async () => {
            const result = await provider.estimateGas({
                from: ADDRESS,
                to: await provider.l2TokenAddress(DAI_L1),
                data: utils.IERC20.encodeFunctionData("approve", [RECEIVER, 1]),
                customData: {
                    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                },
            });
            expect(result.isZero()).to.be.false;
        });
    });

    describe("#getFilterChanges()", () => {
        it("should return filtered logs", async () => {
            const filter = await provider.newFilter({
                address: utils.L2_BASE_TOKEN_ADDRESS,
                topics: [ethers.utils.id("Transfer(address,address,uint256)")],
            });
            const result = await provider.getFilterChanges(filter);
            expect(result).not.to.be.null;
        });
    });
});
