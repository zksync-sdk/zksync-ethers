import { expect } from "chai";
import { Provider, types, utils, Wallet } from "../../src";
import { ethers } from "ethers";
import { TOKENS } from "../const";

describe("Provider", () => {
    const ADDRESS = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
    const RECEIVER = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";

    const provider = Provider.getDefaultProvider(types.Network.Localhost);
    const wallet = new Wallet(PRIVATE_KEY, provider);

    let tx = null;

    before("setup", async function () {
        this.timeout(25_000);
        tx = await wallet.transfer({
            token: utils.ETH_ADDRESS,
            to: RECEIVER,
            amount: 1_000_000,
        });
        await tx.wait();
    });

    describe("#getMainContractAddress()", () => {
        it("should return the address of main contract", async () => {
            const result = await provider.getMainContractAddress();
            expect(result).not.to.be.null;
        });
    });

    describe("#getTestnetPaymasterAddress()", () => {
        it("should return the address of testnet paymaster", async () => {
            const TESTNET_PAYMASTER = "0x0f9acdb01827403765458b4685de6d9007580d15";
            const result = await provider.getTestnetPaymasterAddress();
            expect(result).to.be.equal(TESTNET_PAYMASTER);
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

    describe("#getGasPrice()", () => {
        it("should return gas price", async () => {
            const GAS_PRICE = BigInt(2_500_000_00);
            const result = await provider.getGasPrice();
            expect(result).to.be.equal(GAS_PRICE);
        });
    });

    describe("#getL1BatchNumber()", () => {
        it("should return L1 batch number", async () => {
            const result = await provider.getL1BatchNumber();
            expect(result).to.be.greaterThan(0);
        });
    });

    describe("#getBalance()", () => {
        it("should return ETH balance of the account at `address`", async () => {
            const result = await provider.getBalance(ADDRESS);
            expect(result > 0).to.be.true;
        });

        it("should return DAI balance of the account at `address`", async () => {
            const result = await provider.getBalance(
                ADDRESS,
                "latest",
                await provider.l2TokenAddress(TOKENS.DAI.address),
            );
            expect(result > 0).to.be.true;
        });
    });

    describe("#getAllAccountBalances()", () => {
        it("should return all balances of the account at `address`", async () => {
            const result = await provider.getAllAccountBalances(ADDRESS);
            expect(Object.keys(result)).to.have.lengthOf(2); // ETH and DAI
        });
    });

    describe("#getBlockDetails()", () => {
        it("should return block details", async () => {
            const result = await provider.getBlockDetails(1);
            expect(result).not.to.be.null;
        });
    });

    describe("#getTransactionDetails(txHash)", () => {
        it("should return transaction details", async () => {
            const result = await provider.getTransactionDetails(tx.hash);
            expect(result).not.to.be.null;
        });
    });

    describe("#getBytecodeByHash(txHash)", () => {
        it("should return bytecode of a contract", async () => {
            const TESTNET_PAYMASTER = "0x0f9acdb01827403765458b4685de6d9007580d15";
            const result = await provider.getBytecodeByHash(TESTNET_PAYMASTER);
            expect(result).not.to.be.null;
        });
    });

    describe("#getRawBlockTransactions(number)", () => {
        it("should return bytecode of a contract", async () => {
            const blockNumber = await provider.getBlockNumber();
            const result = await provider.getRawBlockTransactions(blockNumber);
            expect(result).not.to.be.null;
        });
    });

    describe("#getTransactionStatus(txHash)", () => {
        it("should return transaction status", async () => {
            const result = await provider.getTransactionStatus(tx.hash);
            expect(result).not.to.be.null;
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

    describe("#getConfirmedTokens()", () => {
        it("should return confirmed tokens", async () => {
            const result = await provider.getConfirmedTokens();
            expect(result).to.have.lengthOf(2);
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
                address: utils.L2_ETH_TOKEN_ADDRESS,
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
        it("should return L2 token address", async () => {
            const result = await provider.l2TokenAddress(utils.ETH_ADDRESS);
            expect(result).to.be.equal(utils.ETH_ADDRESS);
        });
    });

    describe("#l1TokenAddress()", () => {
        it("should return L1 token address", async () => {
            const result = await provider.l1TokenAddress(utils.ETH_ADDRESS);
            expect(result).to.be.equal(utils.ETH_ADDRESS);
        });
    });

    describe("#getBlock()", () => {
        it("should return block with transactions", async () => {
            const result = await provider.getBlock("latest", true);
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

    describe("#getLogs(filter)", () => {
        it("should return logs", async () => {
            const result = await provider.getLogs({
                fromBlock: 0,
                toBlock: 5,
                address: utils.L2_ETH_TOKEN_ADDRESS,
            });
            expect(result).not.to.be.null;
        });
    });

    describe("#getWithdrawTx(tx)", () => {
        it("return withdraw transaction", async () => {
            const WITHDRAW_TX = {
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                value: BigInt(7_000_000_000),
                to: "0x000000000000000000000000000000000000800a",
                data: "0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049",
            };
            const result = await provider.getWithdrawTx({
                token: utils.ETH_ADDRESS,
                amount: 7_000_000_000,
                to: ADDRESS,
                from: ADDRESS,
            });
            expect(result).to.be.deep.equal(WITHDRAW_TX);
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
                token: utils.ETH_ADDRESS,
                amount: 7_000_000_000,
                to: RECEIVER,
                from: ADDRESS,
            });
            expect(result).to.be.deep.equal(TRANSFER_TX);
        });
    });

    describe("#estimateGasWithdraw()", () => {
        it("should return gas estimation of withdraw transaction", async () => {
            const result = await provider.estimateGasWithdraw({
                token: utils.ETH_ADDRESS,
                amount: 7_000_000_000,
                to: ADDRESS,
                from: ADDRESS,
            });
            expect(result > 0).to.be.true;
        });
    });

    describe("#estimateGasTransfer()", () => {
        it("should return gas estimation of transfer transaction", async () => {
            const result = await provider.estimateGasTransfer({
                token: utils.ETH_ADDRESS,
                amount: 7_000_000_000,
                to: RECEIVER,
                from: ADDRESS,
            });
            expect(result > 0).to.be.be.true;
        });
    });

    describe("#estimateGasL1()", () => {
        it("should return gas estimation of L1 transaction", async () => {
            const result = await provider.estimateGasL1({
                from: ADDRESS,
                to: await provider.getMainContractAddress(),
                value: 7_000_000_000,
                customData: {
                    gasPerPubdata: 800,
                },
            });
            expect(result > 0).to.be.true;
        });
    });

    describe("#estimateL1ToL2Execute()", () => {
        it("should return gas estimation of L1 to L2 transaction", async () => {
            const result = await provider.estimateL1ToL2Execute({
                contractAddress: await provider.getMainContractAddress(),
                calldata: "0x",
                caller: ADDRESS,
                l2Value: 7_000_000_000,
            });
            expect(result > 0).to.be.true;
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
                to: await provider.l2TokenAddress(TOKENS.DAI.address),
                data: utils.IERC20.encodeFunctionData("approve", [RECEIVER, 1]),
            });
            expect(result > 0).to.be.true;
        });

        // it("should return gas estimation of EIP712 transaction", async () => {
        //     // const tokenApprove = await provider.estimateGas({
        //     //     from: PUBLIC_KEY,
        //     //     to: tokenAddress,
        //     //     data: utils.IERC20.encodeFunctionData("approve", [RECEIVER, 1]),
        //     //     customData: {
        //     //         gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        //     //         paymasterParams,
        //     //     }
        //     // });
        //     // console.log(`Gas token approval (EIP-712): ${tokenApprove}`);
        //
        //     const result = await provider.estimateFee({
        //         from: ADDRESS,
        //         to: RECEIVER,
        //         value: `0x${BigInt(7_000_000_000).toString(16)}`,
        //     });
        //     expect(result).not.to.be.null;
        // });
    });

    describe("#getFilterChanges()", () => {
        it("should return filtered logs", async () => {
            const filter = await provider.newFilter({
                address: utils.L2_ETH_TOKEN_ADDRESS,
                topics: [ethers.id("Transfer(address,address,uint256)")],
            });
            const result = await provider.getFilterChanges(filter);
            expect(result).not.to.be.null;
        });
    });
});
