import * as chai from "chai";
import "../custom-matchers";
import { Provider, types, utils, Wallet } from "../../src";
import { ethers, BigNumber } from "ethers";
import * as fs from "fs";
import { TOKENS } from "../const";

const { expect } = chai;

describe("Wallet", () => {
    const ADDRESS = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
    const MNEMONIC = "stuff slice staff easily soup parent arm payment cotton trade scatter struggle";
    const RECEIVER = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";

    const provider = Provider.getDefaultProvider();
    const ethProvider = ethers.getDefaultProvider("http://localhost:8545");
    const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

    describe("#constructor()", () => {
        it("`Wallet(privateKey, provider)` should return a `Wallet` with L2 provider", async () => {
            const wallet = new Wallet(PRIVATE_KEY, provider);

            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
            expect(wallet.provider).to.be.equal(provider);
        });

        it("`Wallet(privateKey, provider, ethProvider)` should return a `Wallet` with L1 and L2 provider", async () => {
            const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
            expect(wallet.provider).to.be.equal(provider);
            expect(wallet.providerL1).to.be.equal(ethProvider);
        });
    });

    describe("#getMainContract()", () => {
        it("should return the main contract", async () => {
            const result = await wallet.getMainContract();
            expect(result).not.to.be.null;
        });
    });

    describe("#getL1BridgeContracts()", () => {
        it("should return a L1 bridge contracts", async () => {
            const result = await wallet.getL1BridgeContracts();
            expect(result).not.to.be.null;
        });
    });

    describe("#getBalanceL1()", () => {
        it("should return a L1 balance", async () => {
            const result = await wallet.getBalanceL1();
            expect(result.gt(0)).to.be.true;
        });
    });

    describe("#getAllowanceL1()", () => {
        it("should return allowance of L1 token", async () => {
            const result = await wallet.getAllowanceL1(TOKENS.DAI.address);
            expect(result.gte(0)).to.be.true;
        });
    });

    describe("#l2TokenAddress()", () => {
        it("should return a L2 token address", async () => {
            const result = await wallet.l2TokenAddress(utils.ETH_ADDRESS);
            expect(result).to.be.equal(utils.ETH_ADDRESS);
        });
    });

    describe("#approveERC20()", () => {
        it("should approve a L1 token", async () => {
            const tx = await wallet.approveERC20(TOKENS.DAI.address, 5);
            const result = await tx.wait();
            expect(result).not.to.be.null;
        }).timeout(5_000);
    });

    describe("#getBaseCost()", () => {
        it("should return base cost of L1 transaction", async () => {
            const result = await wallet.getBaseCost({ gasLimit: 100_000 });
            expect(result).not.to.be.null;
        });
    });

    describe("#getBalance()", () => {
        it("should return the `Wallet` balance", async () => {
            const result = await wallet.getBalance();
            expect(result.gt(0)).to.be.true;
        });
    });

    describe("#getAllBalances()", () => {
        it("should return all balance", async () => {
            const result = await wallet.getAllBalances();
            expect(Object.keys(result)).to.have.lengthOf(2);
        });
    });

    describe("#getL2BridgeContracts()", () => {
        it("should return a L2 bridge contracts", async () => {
            const result = await wallet.getL2BridgeContracts();
            expect(result).not.to.be.null;
        });
    });

    describe("#getAddress()", () => {
        it("should return a `Wallet` address", async () => {
            const result = await wallet.getAddress();
            expect(result).to.be.equal(ADDRESS);
        });
    });

    describe("#ethWallet()", () => {
        it("should return a L1 `Wallet`", async () => {
            const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
            const ethWallet = wallet.ethWallet();
            expect(ethWallet.privateKey).to.be.equal(PRIVATE_KEY);
            expect(ethWallet.provider).to.be.equal(ethProvider);
        });
    });

    describe("#connect()", () => {
        it("should return a `Wallet` with provided `provider` as L2 provider", async () => {
            let wallet = new Wallet(PRIVATE_KEY);
            wallet = wallet.connect(provider);
            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
            expect(wallet.provider).to.be.equal(provider);
        });
    });

    describe("#connectL1(provider)", () => {
        it("should return a `Wallet` with provided `provider` as L1 provider", async () => {
            let wallet = new Wallet(PRIVATE_KEY);
            wallet = wallet.connectToL1(ethProvider);
            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
            expect(wallet.providerL1).to.be.equal(ethProvider);
        });
    });

    describe("#getDeploymentNonce()", () => {
        it("should return a deployment nonce", async () => {
            const result = await wallet.getDeploymentNonce();
            expect(result).not.to.be.null;
        });
    });

    describe("#populateTransaction()", () => {
        it("should return populated transaction with default values if are omitted", async () => {
            const tx = {
                to: RECEIVER,
                value: 7_000_000,
                type: 0,
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                nonce: await wallet.getNonce("pending"),
                chainId: 270,
                gasPrice: BigNumber.from(250_000_000),
            };
            const result = await wallet.populateTransaction({
                to: RECEIVER,
                value: 7_000_000,
            });
            expect(result).to.be.deepEqualExcluding(tx, ["gasLimit"]);
        });
    });

    describe("#fromMnemonic()", () => {
        it("should return a `Wallet` with the `provider` as L1 provider and a private key that is built from the `mnemonic` passphrase", async () => {
            const wallet = Wallet.fromMnemonic(MNEMONIC);
            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
        });
    });

    describe("#fromEncryptedJson()", () => {
        it("should return a `Wallet` from encrypted `json` file using provided `password`", async () => {
            const wallet = await Wallet.fromEncryptedJson(
                fs.readFileSync("tests/files/wallet.json", "utf8"),
                "password",
            );
            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
        }).timeout(5_000);
    });

    describe("#fromEncryptedJsonSync()", () => {
        it("should return a `Wallet` from encrypted `json` file using provided `password`", async () => {
            const wallet = Wallet.fromEncryptedJsonSync(
                fs.readFileSync("tests/files/wallet.json", "utf8"),
                "password",
            );
            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
        }).timeout(5_000);
    });

    describe("#createRandom()", () => {
        it("should return a random `Wallet` with L2 provider", async () => {
            const wallet = Wallet.createRandom(provider);
            expect(wallet.privateKey).not.to.be.null;
        });
    });

    describe("#getDepositTx()", () => {
        it("should return ETH deposit transaction", async () => {
            const tx = {
                contractAddress: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                calldata: "0x",
                l2Value: 7_000_000,
                l2GasLimit: BigNumber.from("0xa542f"),
                token: "0x0000000000000000000000000000000000000000",
                to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                amount: 7_000_000,
                refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                operatorTip: BigNumber.from(0),
                overrides: {
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                    value: BigNumber.from(338_455_507_000_000),
                },
                gasPerPubdataByte: 800,
            };
            const result = await wallet.getDepositTx({
                token: utils.ETH_ADDRESS,
                to: await wallet.getAddress(),
                amount: 7_000_000,
                refundRecipient: await wallet.getAddress(),
            });
            expect(result).to.be.deep.equal(tx);
        });

        it("should return DAI deposit transaction", async () => {
            const tx = {
                maxFeePerGas: BigNumber.from(1_500_000_010),
                maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                value: BigNumber.from(347_023_500_000_000),
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: (await wallet.getL1BridgeContracts()).erc20.address,
                data: "0xe8b99b1b00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc0490000000000000000000000005e6d086f5ec079adff4fb3774cdf3e8d6a34f7e9000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000a971f000000000000000000000000000000000000000000000000000000000000032000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049",
            };
            const result = await wallet.getDepositTx({
                token: TOKENS.DAI.address,
                to: await wallet.getAddress(),
                amount: 5,
                refundRecipient: await wallet.getAddress(),
            });
            result.to = result.to.toLowerCase();
            expect(result).to.be.deep.equal(tx);
        });
    });

    describe("#estimateGasDeposit()", () => {
        it("should return gas estimation for ETH deposit transaction", async () => {
            const result = await wallet.estimateGasDeposit({
                token: utils.ETH_ADDRESS,
                to: await wallet.getAddress(),
                amount: 5,
                refundRecipient: await wallet.getAddress(),
            });
            expect(result.eq(BigNumber.from(149_115))).to.be.true;
        });

        it("should return gas estimation for DAI deposit transaction", async () => {
            const result = await wallet.estimateGasDeposit({
                token: TOKENS.DAI.address,
                to: await wallet.getAddress(),
                amount: 5,
                refundRecipient: await wallet.getAddress(),
            });
            expect(result.eq(BigNumber.from(280_566))).to.be.true;
        });
    });

    describe("#deposit()", () => {
        it("should deposit ETH to L2 network", async () => {
            const amount = 7_000_000_000;
            const l2BalanceBeforeDeposit = await wallet.getBalance();
            const l1BalanceBeforeDeposit = await wallet.getBalanceL1();
            const tx = await wallet.deposit({
                token: utils.ETH_ADDRESS,
                to: await wallet.getAddress(),
                amount: amount,
                refundRecipient: await wallet.getAddress(),
            });
            const result = await tx.wait();
            const l2BalanceAfterDeposit = await wallet.getBalance();
            const l1BalanceAfterDeposit = await wallet.getBalanceL1();
            expect(result).not.to.be.null;
            expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).gte(amount)).to.be.true;
            expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).gte(amount)).to.be.true;
        }).timeout(10_000);

        it("should deposit DAI to L2 network", async () => {
            const amount = 5;
            const l2DAI = await provider.l2TokenAddress(TOKENS.DAI.address);
            const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
            const l1BalanceBeforeDeposit = await wallet.getBalanceL1(TOKENS.DAI.address);
            const tx = await wallet.deposit({
                token: TOKENS.DAI.address,
                to: await wallet.getAddress(),
                amount: amount,
                approveERC20: true,
                refundRecipient: await wallet.getAddress(),
            });
            const result = await tx.wait();
            const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
            const l1BalanceAfterDeposit = await wallet.getBalanceL1(TOKENS.DAI.address);
            expect(result).not.to.be.null;
            expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).eq(amount)).to.be.true;
            expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).eq(amount)).to.be.true;
        }).timeout(10_000);
    });

    describe("#getFullRequiredDepositFee()", () => {
        it("should return fee for ETH token deposit", async () => {
            const FEE_DATA = {
                baseCost: BigNumber.from(338_455_500_000_000),
                l1GasLimit: BigNumber.from(149_115),
                l2GasLimit: BigNumber.from("0x0a542f"),
                maxFeePerGas: BigNumber.from(1_500_000_010),
                maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
            };
            const result = await wallet.getFullRequiredDepositFee({
                token: utils.ETH_ADDRESS,
                to: await wallet.getAddress(),
            });
            expect(result).to.be.deep.equal(FEE_DATA);
        });

        it("should return fee for DAI token deposit", async () => {
            const FEE_DATA = {
                baseCost: BigNumber.from(347_023_500_000_000),
                l1GasLimit: BigNumber.from(280_326),
                l2GasLimit: BigNumber.from("0xa971f"),
                maxFeePerGas: BigNumber.from(1_500_000_010),
                maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
            };

            const tx = await wallet.approveERC20(TOKENS.DAI.address, 5);
            await tx.wait();

            const result = await wallet.getFullRequiredDepositFee({
                token: TOKENS.DAI.address,
                to: await wallet.getAddress(),
            });
            expect(result).to.be.deep.equal(FEE_DATA);
        }).timeout(10_000);
    });

    describe("#withdraw()", () => {
        it("should withdraw ETH to L1 network", async () => {
            const amount = 7_000_000_000;
            const l2BalanceBeforeWithdrawal = await wallet.getBalance();
            const withdrawTx = await wallet.withdraw({
                token: utils.ETH_ADDRESS,
                to: await wallet.getAddress(),
                amount: amount,
            });
            await withdrawTx.waitFinalize();
            const finalizeWithdrawTx = await wallet.finalizeWithdrawal(withdrawTx.hash);
            const result = await finalizeWithdrawTx.wait();
            const l2BalanceAfterWithdrawal = await wallet.getBalance();
            expect(result).not.to.be.null;
            expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).gte(amount)).to.be.true;
        }).timeout(25_000);

        it("should withdraw DAI to L1 network", async () => {
            const amount = 5;
            const l2DAI = await provider.l2TokenAddress(TOKENS.DAI.address);
            const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2DAI);
            const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(TOKENS.DAI.address);
            const withdrawTx = await wallet.withdraw({
                token: l2DAI,
                to: await wallet.getAddress(),
                amount: amount,
            });
            await withdrawTx.waitFinalize();
            const finalizeWithdrawTx = await wallet.finalizeWithdrawal(withdrawTx.hash);
            const result = await finalizeWithdrawTx.wait();
            const l2BalanceAfterWithdrawal = await wallet.getBalance(l2DAI);
            const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(TOKENS.DAI.address);
            expect(result).not.to.be.null;
            expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount)).to.be.true;
            expect(l1BalanceAfterWithdrawal.sub(l1BalanceBeforeWithdrawal).eq(amount)).to.be.true;
        }).timeout(25_000);
    });

    describe("#getRequestExecuteTx()", () => {
        it("should return request execute transaction", async () => {
            const result = await wallet.getRequestExecuteTx({
                contractAddress: await provider.getMainContractAddress(),
                calldata: "0x",
                l2Value: 7_000_000_000,
            });
            expect(result).not.to.be.null;
        });
    });

    describe("#estimateGasRequestExecute()", () => {
        it("should return gas estimation for request execute transaction", async () => {
            const result = await wallet.estimateGasRequestExecute({
                contractAddress: await provider.getMainContractAddress(),
                calldata: "0x",
                l2Value: 7_000_000_000,
            });
            expect(result.eq(BigNumber.from(124_299))).to.be.true;
        });
    });

    describe("#requestExecute()", () => {
        it("should request transaction execution on L2 network", async () => {
            const amount = 7_000_000_000;
            const l2BalanceBeforeExecution = await wallet.getBalance();
            const l1BalanceBeforeExecution = await wallet.getBalanceL1();
            const tx = await wallet.requestExecute({
                contractAddress: await provider.getMainContractAddress(),
                calldata: "0x",
                l2Value: amount,
                l2GasLimit: 900_000,
            });
            const result = await tx.wait();
            const l2BalanceAfterExecution = await wallet.getBalance();
            const l1BalanceAfterExecution = await wallet.getBalanceL1();
            expect(result).not.to.be.null;
            expect(l2BalanceAfterExecution.sub(l2BalanceBeforeExecution).gte(amount)).to.be.true;
            expect(l1BalanceBeforeExecution.sub(l1BalanceAfterExecution).gte(amount)).to.be.true;
        }).timeout(10_000);
    });

    describe("#transfer()", () => {
        it("should transfer ETH", async () => {
            const amount = 7_000_000_000;
            const balanceBeforeTransfer = await provider.getBalance(RECEIVER);
            const tx = await wallet.transfer({
                token: utils.ETH_ADDRESS,
                to: RECEIVER,
                amount: amount,
            });
            const result = await tx.wait();
            const balanceAfterTransfer = await provider.getBalance(RECEIVER);
            expect(result).not.to.be.null;
            expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be.true;
        }).timeout(25_000);

        it("should transfer DAI", async () => {
            const amount = 5;
            const l2DAI = await provider.l2TokenAddress(TOKENS.DAI.address);
            const balanceBeforeTransfer = await provider.getBalance(RECEIVER, "latest", l2DAI);
            const tx = await wallet.transfer({
                token: l2DAI,
                to: RECEIVER,
                amount: amount,
            });
            const result = await tx.wait();
            const balanceAfterTransfer = await provider.getBalance(RECEIVER, "latest", l2DAI);
            expect(result).not.to.be.null;
            expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be.true;
        }).timeout(25_000);
    });
});
