import * as chai from "chai";
import "../custom-matchers";
import { Provider, types, utils, Wallet } from "../../src";
import { ethers, BigNumber } from "ethers";
import * as fs from "fs";

const { expect } = chai;

describe("Wallet", async () => {
    const ADDRESS = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
    const MNEMONIC = "stuff slice staff easily soup parent arm payment cotton trade scatter struggle";
    const RECEIVER = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";

    const provider = Provider.getDefaultProvider();
    const ethProvider = ethers.getDefaultProvider("http://localhost:8545");
    const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

    const TOKENS_L1 = require("../tokens.json");
    // const DAI_L1 = TOKENS_L1[0].address;
    const DAI_L1 = "0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55";

    const isETHBasedChain = await wallet.isETHBasedChain();

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

    describe("#getBridgehubContract()", () => {
        it("should return the main contract", async () => {
            const result = await wallet.getBridgehubContract();
            expect(result).not.to.be.null;
        });
    });

    describe("#getL1BridgeContracts()", () => {
        it("should return a L1 bridge contracts", async () => {
            const result = await wallet.getL1BridgeContracts();
            expect(result).not.to.be.null;
        });
    });

    describe("#isETHBasedChain()", () => {
        it("should return whether the chain is ETH-based or not", async () => {
            const result = await wallet.isETHBasedChain();
            expect(result).to.be.equal(isETHBasedChain);
        });
    });

    describe("#getBaseToken()", () => {
        it("should return base token", async () => {
            const result = await wallet.getBaseToken();
            isETHBasedChain
                ? expect(result).to.be.equal(utils.ETH_ADDRESS_IN_CONTRACTS)
                : expect(result).not.to.be.null;
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
            const result = await wallet.getAllowanceL1(DAI_L1);
            expect(result.gte(0)).to.be.true;
        });
    });

    describe("#l2TokenAddress()", () => {
        it("should return the L2 ETH address", async () => {
            const result = await wallet.l2TokenAddress(utils.ETH_ADDRESS);
            expect(result).to.be.equal(utils.ETH_ADDRESS);
        });

        it("should return the L2 DAI address", async () => {
            const result = await wallet.l2TokenAddress(DAI_L1);
            expect(result).not.to.be.null;
        });
    });

    describe("#approveERC20()", () => {
        it("should approve a L1 token", async () => {
            const tx = await wallet.approveERC20(DAI_L1, 5);
            const result = await tx.wait();
            expect(result).not.to.be.null;
        }).timeout(5_000);

        it("should throw an error when approving ETH token", async () => {
            try {
                await wallet.approveERC20(utils.ETH_ADDRESS, 5);
            } catch (e) {
                expect(e.message).to.be.equal(
                    "ETH token can't be approved. The address of the token does not exist on L1.",
                );
            }
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

        it("should throw  an error when L1 `Provider` is not specified in constructor", async () => {
            const wallet = new Wallet(PRIVATE_KEY, provider);
            try {
                wallet.ethWallet();
            } catch (e) {
                expect(e.message).to.be.equal("L1 provider missing: use `connectToL1` to specify");
            }
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

    describe("#connectL1()", () => {
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
                // chainId: 270,
                gasPrice: BigNumber.from(100_000_000),
            };
            const result = await wallet.populateTransaction({
                to: RECEIVER,
                value: 7_000_000,
            });
            expect(result).to.be.deepEqualExcluding(tx, ["gasLimit", "chainId"]);
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
        }).timeout(10_000);
    });

    describe("#fromEncryptedJsonSync()", () => {
        it("should return a `Wallet` from encrypted `json` file using provided `password`", async () => {
            const wallet = Wallet.fromEncryptedJsonSync(
                fs.readFileSync("tests/files/wallet.json", "utf8"),
                "password",
            );
            expect(wallet.privateKey).to.be.equal(PRIVATE_KEY);
        }).timeout(10_000);
    });

    describe("#createRandom()", () => {
        it("should return a random `Wallet` with L2 provider", async () => {
            const wallet = Wallet.createRandom(provider);
            expect(wallet.privateKey).not.to.be.null;
        });
    });

    describe("#getDepositTx()", () => {
        if (isETHBasedChain) {
            it("should return ETH deposit transaction", async () => {
                const transaction = {
                    contractAddress: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    calldata: "0x",
                    l2Value: 7_000_000,
                    l2GasLimit: BigNumber.from(405_053),
                    mintValue: BigNumber.from(210_121_250_750_000),
                    token: "0x0000000000000000000000000000000000000000",
                    to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    amount: 7_000_000,
                    refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    operatorTip: BigNumber.from(0),
                    overrides: {
                        maxFeePerGas: BigNumber.from(1_500_000_010),
                        maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                        value: BigNumber.from(210_121_250_750_000),
                    },
                    gasPerPubdataByte: 800,
                };
                const tx = await wallet.getDepositTx({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                    amount: 7_000_000,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(tx).to.be.deep.equal(transaction);
            });

            it("should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified", async () => {
                const transaction = {
                    contractAddress: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    calldata: "0x",
                    l2Value: 7_000_000,
                    l2GasLimit: BigNumber.from(405_053),
                    mintValue: BigNumber.from(210_121_250_750_000),
                    token: "0x0000000000000000000000000000000000000000",
                    to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    amount: 7_000_000,
                    refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    operatorTip: BigNumber.from(0),
                    overrides: {
                        maxFeePerGas: BigNumber.from(1_500_000_010),
                        maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                        value: BigNumber.from(210_121_250_750_000),
                    },
                    gasPerPubdataByte: 800,
                };
                const tx = await wallet.getDepositTx({
                    token: utils.ETH_ADDRESS,
                    amount: 7_000_000,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(tx).to.be.deep.equal(transaction);
            });

            it("should return DAI deposit transaction", async () => {
                const transaction = {
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                    value: BigNumber.from(210_121_243_750_000),
                    from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    to: await provider.getBridgehubContractAddress(),
                };
                const tx = await wallet.getDepositTx({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                    amount: 5,
                    refundRecipient: await wallet.getAddress(),
                });
                tx.to = tx.to.toLowerCase();
                expect(tx).to.be.deepEqualExcluding(transaction, ["data"]);
            });
        } else {
            it("should return ETH deposit transaction", async () => {
                const transaction = {
                    from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    to: (await provider.getBridgehubContractAddress()).toLowerCase(),
                    value: BigNumber.from(7_000_000),
                    data: "0x24fd57fb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000010e0000000000000000000000000000000000000000000000000000bf1aaa17ee7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000062e3d000000000000000000000000000000000000000000000000000000000000032000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049000000000000000000000000842deab39809094bf5e4b77a7f97ae308adc5e5500000000000000000000000000000000000000000000000000000000006acfc0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049",
                    maxFeePerGas: BigNumber.from(1_500_000_001),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                };
                const tx = await wallet.getDepositTx({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                    amount: 7_000_000,
                    refundRecipient: await wallet.getAddress(),
                });
                tx.to = tx.to.toLowerCase();
                expect(tx).to.be.deepEqualExcluding(transaction, ["data"]);
            });

            it("should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified", async () => {
                const transaction = {
                    from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    to: (await provider.getBridgehubContractAddress()).toLowerCase(),
                    value: BigNumber.from(7_000_000),
                    maxFeePerGas: BigNumber.from(1_500_000_001),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                };
                const tx = await wallet.getDepositTx({
                    token: utils.ETH_ADDRESS,
                    amount: 7_000_000,
                    refundRecipient: await wallet.getAddress(),
                });
                tx.to = tx.to.toLowerCase();
                expect(tx).to.be.deepEqualExcluding(transaction, ["data"]);
            });

            it("should return DAI deposit transaction", async () => {
                const transaction = {
                    maxFeePerGas: BigNumber.from(1_500_000_001),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                    value: BigNumber.from(210_121_243_750_000),
                    from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    to: (await provider.getBridgehubContractAddress()).toLowerCase(),
                };
                const tx = await wallet.getDepositTx({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                    amount: 5,
                    refundRecipient: await wallet.getAddress(),
                });
                tx.to = tx.to.toLowerCase();
                expect(tx).to.be.deepEqualExcluding(transaction, ["data"]);
            });
        }
    });

    describe("#estimateGasDeposit()", () => {
        if (isETHBasedChain) {
            it("should return gas estimation for ETH deposit transaction", async () => {
                const result = await wallet.estimateGasDeposit({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                    amount: 5,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(result.eq(BigNumber.from(220_046))).to.be.true;
            });

            it("should return gas estimation for DAI deposit transaction", async () => {
                const result = await wallet.estimateGasDeposit({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                    amount: 5,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(result.eq(BigNumber.from(333_426))).to.be.true;
            });
        } else {
            it("should throw an error for insufficient allowance when estimating gas for ETH deposit transaction", async () => {
                try {
                    await wallet.estimateGasDeposit({
                        token: utils.ETH_ADDRESS,
                        to: await wallet.getAddress(),
                        amount: 5,
                        refundRecipient: await wallet.getAddress(),
                    });
                } catch (e) {
                    expect(e.reason).to.include("ERC20: insufficient allowance");
                }
            }).timeout(10_000);

            it("should return gas estimation for ETH deposit transaction", async () => {
                const token = utils.ETH_ADDRESS;
                const amount = 5;
                const approveParams = await wallet.getDepositAllowanceParams(token, amount);

                await (
                    await wallet.approveERC20(approveParams[0].token, approveParams[0].allowance)
                ).wait();

                const result = await wallet.estimateGasDeposit({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                    amount: amount,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(result.isZero()).to.be.false; // 344_650 or 313818
            }).timeout(10_000);

            it("should return gas estimation for base token deposit transaction", async () => {
                const token = await wallet.getBaseToken();
                const amount = 5;
                const approveParams = await wallet.getDepositAllowanceParams(token, amount);

                await (
                    await wallet.approveERC20(approveParams[0].token, approveParams[0].allowance)
                ).wait();

                const result = await wallet.estimateGasDeposit({
                    token: token,
                    to: await wallet.getAddress(),
                    amount: amount,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(result.eq(BigNumber.from(25_200))).to.be.true;
            }).timeout(10_000);

            it("should return gas estimation for DAI deposit transaction", async () => {
                const token = DAI_L1;
                const amount = 5;
                const approveParams = await wallet.getDepositAllowanceParams(token, amount);

                await (
                    await wallet.approveERC20(approveParams[0].token, approveParams[0].allowance)
                ).wait();
                await (
                    await wallet.approveERC20(approveParams[1].token, approveParams[1].allowance)
                ).wait();

                const result = await wallet.estimateGasDeposit({
                    token: token,
                    to: await wallet.getAddress(),
                    amount: amount,
                    refundRecipient: await wallet.getAddress(),
                });
                expect(result.eq(BigNumber.from(359_308))).to.be.true;
            }).timeout(10_000);
        }
    });

    describe("#deposit()", () => {
        if (isETHBasedChain) {
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
                const l2DAI = await provider.l2TokenAddress(DAI_L1);
                const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
                const l1BalanceBeforeDeposit = await wallet.getBalanceL1(DAI_L1);
                const tx = await wallet.deposit({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                    amount: amount,
                    approveERC20: true,
                    refundRecipient: await wallet.getAddress(),
                });
                const result = await tx.wait();
                const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
                const l1BalanceAfterDeposit = await wallet.getBalanceL1(DAI_L1);
                expect(result).not.to.be.null;
                expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).eq(amount)).to.be.true;
                expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).eq(amount)).to.be.true;
            }).timeout(10_000);

            it("should deposit DAI to the L2 network with approve transaction for allowance", async () => {
                const amount = 7;
                const l2DAI = await provider.l2TokenAddress(DAI_L1);
                const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
                const l1BalanceBeforeDeposit = await wallet.getBalanceL1(DAI_L1);
                const tx = await wallet.deposit({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                    amount: amount,
                    approveERC20: true,
                    refundRecipient: await wallet.getAddress(),
                });
                const result = await tx.wait();
                await tx.waitFinalize();
                const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
                const l1BalanceAfterDeposit = await wallet.getBalanceL1(DAI_L1);
                expect(result).not.to.be.null;
                expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).eq(amount)).to.be.true;
                expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).eq(amount)).to.be.true;
            }).timeout(30_000);
        } else {
            it("should deposit ETH to L2 network", async () => {
                const amount = 7_000_000_000;
                const l2BalanceBeforeDeposit = await wallet.getBalance();
                const l1BalanceBeforeDeposit = await wallet.getBalanceL1();
                const tx = await wallet.deposit({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                    amount: amount,
                    approveBaseERC20: true,
                    refundRecipient: await wallet.getAddress(),
                });
                await utils.sleep(10000);
                // const result = await tx.wait();
                const l2BalanceAfterDeposit = await wallet.getBalance();
                const l1BalanceAfterDeposit = await wallet.getBalanceL1();
                // expect(result).not.to.be.null;
                expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).gte(amount)).to.be.true;
                expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).gte(amount)).to.be.true;
            }).timeout(20_000);

            it("should deposit base token to L2 network", async () => {
                const amount = 5;
                const baseTokenL1 = await wallet.getBaseToken();
                const l2BalanceBeforeDeposit = await wallet.getBalance();
                const l1BalanceBeforeDeposit = await wallet.getBalanceL1(baseTokenL1);
                const tx = await wallet.deposit({
                    token: baseTokenL1,
                    to: await wallet.getAddress(),
                    amount: amount,
                    approveERC20: true,
                    refundRecipient: await wallet.getAddress(),
                });
                const result = await tx.wait();
                const l2BalanceAfterDeposit = await wallet.getBalance();
                const l1BalanceAfterDeposit = await wallet.getBalanceL1(baseTokenL1);
                expect(result).not.to.be.null;
                expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).gt(0)).to.be.true;
                expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).gt(0)).to.be.true;
            }).timeout(20_000);

            it("should deposit DAI to L2 network", async () => {
                const amount = 5;
                const l2DAI = await provider.l2TokenAddress(DAI_L1);
                const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
                const l1BalanceBeforeDeposit = await wallet.getBalanceL1(DAI_L1);
                const tx = await wallet.deposit({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                    amount: amount,
                    approveERC20: true,
                    approveBaseERC20: true,
                    refundRecipient: await wallet.getAddress(),
                });
                const result = await tx.wait();
                const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
                const l1BalanceAfterDeposit = await wallet.getBalanceL1(DAI_L1);
                expect(result).not.to.be.null;
                expect(l2BalanceAfterDeposit.sub(l2BalanceBeforeDeposit).eq(amount)).to.be.true;
                expect(l1BalanceBeforeDeposit.sub(l1BalanceAfterDeposit).eq(amount)).to.be.true;
            }).timeout(20_000);
        }
    });

    describe("#claimFailedDeposit()", () => {
        if (isETHBasedChain) {
            // it("should claim failed deposit", async () => {
            //     const response = await wallet.deposit({
            //         token: utils.ETH_ADDRESS,
            //         to: await wallet.getAddress(),
            //         amount: 7_000_000_000,
            //         refundRecipient: await wallet.getAddress(),
            //         gasPerPubdataByte: 500 // make it fail because of low gas
            //     });

            //     const tx = await response.waitFinalize(); // fails, sames goes with response.wait()
            //     const result = await wallet.claimFailedDeposit(tx.hash);

            // }).timeout(30_000);

            it("should throw an error when trying to claim successful deposit", async () => {
                const response = await wallet.deposit({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                    amount: 7_000_000_000,
                    refundRecipient: await wallet.getAddress(),
                });
                await utils.sleep(10000);
                // const tx = await response.waitFinalize();
                try {
                    await wallet.claimFailedDeposit(response.hash);
                    // await wallet.claimFailedDeposit(tx.transactionHash);
                } catch (e) {
                    expect(e.message).to.be.equal("Cannot claim successful deposit");
                }
            }).timeout(30_000);
        } else {
            it("should throw an error when trying to claim successful deposit", async () => {
                // const response = await wallet.deposit({
                //     token: utils.ETH_ADDRESS,
                //     to: await wallet.getAddress(),
                //     amount: 7_000_000_000,
                //     approveBaseERC20: true,
                //     refundRecipient: await wallet.getAddress(),
                // });
                const response = await wallet.deposit({
                    token: await wallet.getBaseToken(),
                    to: await wallet.getAddress(),
                    amount: 5,
                    approveERC20: true,
                    refundRecipient: await wallet.getAddress(),
                });
                // await utils.sleep(10000);
                const tx = await response.waitFinalize();
                try {
                    await wallet.claimFailedDeposit(tx.transactionHash);
                } catch (e) {
                    expect(e.message).to.be.equal("Cannot claim successful deposit");
                }
            }).timeout(30_000);
        }
    });

    describe("#getFullRequiredDepositFee()", () => {
        if (isETHBasedChain) {
            it("should return fee for ETH token deposit", async () => {
                const FEE_DATA = {
                    baseCost: BigNumber.from(207_964_281_250_000),
                    l1GasLimit: BigNumber.from(220_046),
                    l2GasLimit: BigNumber.from(400_895),
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                };
                const result = await wallet.getFullRequiredDepositFee({
                    token: utils.ETH_ADDRESS,
                    to: await wallet.getAddress(),
                });
                expect(result).to.be.deep.equal(FEE_DATA);
            });

            it("should throw an error when there is not enough allowance to cover the deposit", async () => {
                try {
                    await wallet.getFullRequiredDepositFee({
                        token: DAI_L1,
                        to: await wallet.getAddress(),
                    });
                } catch (e) {
                    expect(e.message).to.be.equal("Not enough allowance to cover the deposit");
                }
            }).timeout(10_000);

            it("should return fee for DAI token deposit", async () => {
                const FEE_DATA = {
                    baseCost: BigNumber.from(210_121_243_750_000),
                    l1GasLimit: BigNumber.from(0x0514ce),
                    l2GasLimit: BigNumber.from(405_053),
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                };

                const tx = await wallet.approveERC20(DAI_L1, 5);
                await tx.wait();

                const result = await wallet.getFullRequiredDepositFee({
                    token: DAI_L1,
                    to: await wallet.getAddress(),
                });
                expect(result).to.be.deep.equal(FEE_DATA);
            }).timeout(10_000);

            it("should throw an error when there is not enough balance for the deposit", async () => {
                try {
                    const randomWallet = new Wallet(
                        ethers.Wallet.createRandom().privateKey,
                        provider,
                        ethProvider,
                    );
                    await randomWallet.getFullRequiredDepositFee({
                        token: DAI_L1,
                        to: await wallet.getAddress(),
                    });
                } catch (e) {
                    expect(e.message).to.include("Not enough balance for deposit.");
                }
            }).timeout(10_000);
        } else {
        }
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
            expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

            const finalizeWithdrawTx = await wallet.finalizeWithdrawal(withdrawTx.hash);
            const result = await finalizeWithdrawTx.wait();
            const l2BalanceAfterWithdrawal = await wallet.getBalance();
            expect(result).not.to.be.null;
            expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).gte(amount)).to.be.true;
        }).timeout(25_000);

        it("should withdraw DAI to L1 network", async () => {
            const amount = 5;
            const l2DAI = await provider.l2TokenAddress(DAI_L1);
            const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2DAI);
            const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);
            const withdrawTx = await wallet.withdraw({
                token: l2DAI,
                to: await wallet.getAddress(),
                amount: amount,
            });
            await withdrawTx.waitFinalize();
            // expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

            const finalizeWithdrawTx = await wallet.finalizeWithdrawal(withdrawTx.hash);
            const result = await finalizeWithdrawTx.wait();
            const l2BalanceAfterWithdrawal = await wallet.getBalance(l2DAI);
            const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);
            expect(result).not.to.be.null;
            expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount)).to.be.true;
            expect(l1BalanceAfterWithdrawal.sub(l1BalanceBeforeWithdrawal).eq(amount)).to.be.true;
        }).timeout(25_000);
    });

    describe("#getRequestExecuteTx()", () => {
        if (isETHBasedChain) {
            it("should return request execute transaction", async () => {
                const result = await wallet.getRequestExecuteTx({
                    contractAddress: await provider.getBridgehubContractAddress(),
                    calldata: "0x",
                    l2Value: 7_000_000_000,
                });
                expect(result).not.to.be.null;
            });
        } else {
            it("should return request execute transaction", async () => {
                const tx = {
                    from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                    to: "0xC33E616b13Ef21ea6C07Ee545fBcF6408AEA7575",
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                    data: "0xf195a2c50000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000010e0000000000000000000000000000000000000000000000000002731400992d0000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000000000000000000000000000000000001a13b86000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000006e42e0000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000014000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    value: BigNumber.from(234_290_062_500_000),
                };

                const amount = 7_000_000_000;

                const result = await wallet.getRequestExecuteTx({
                    contractAddress: await wallet.getAddress(),
                    calldata: "0x",
                    l2Value: amount,
                    mintValue: (
                        await wallet.getDepositAllowanceParams(await wallet.getBaseToken(), amount)
                    )[0].allowance,
                    overrides: { value: 0, nonce: 0 },
                });
                expect(result).not.to.be.deep.equal(tx);
            });
        }
    });

    describe("#estimateGasRequestExecute()", () => {
        if (isETHBasedChain) {
            it("should return gas estimation for request execute transaction", async () => {
                const result = await wallet.estimateGasRequestExecute({
                    contractAddress: await provider.getBridgehubContractAddress(),
                    calldata: "0x",
                    l2Value: 7_000_000_000,
                });
                expect(result.isZero()).to.be.false;
            });
        } else {
            it("should return gas estimation for request execute transaction", async () => {
                const token = await wallet.getBaseToken();
                const amount = 7_000_000_000;

                const approveParams = await wallet.getDepositAllowanceParams(token, amount);
                await (
                    await wallet.approveERC20(approveParams[0].token, approveParams[0].allowance)
                ).wait();

                const result = await wallet.estimateGasRequestExecute({
                    contractAddress: await wallet.getAddress(),
                    calldata: "0x",
                    l2Value: amount,
                    mintValue: approveParams[0].allowance,
                    overrides: { value: 0 },
                });
                expect(result.isZero()).to.be.false;
            }).timeout(10_000);
        }
    });

    describe("#requestExecute()", () => {
        if (isETHBasedChain) {
            it("should request transaction execution on L2 network", async () => {
                const amount = 7_000_000_000;
                const l2BalanceBeforeExecution = await wallet.getBalance();
                const l1BalanceBeforeExecution = await wallet.getBalanceL1();
                const tx = await wallet.requestExecute({
                    contractAddress: await provider.getBridgehubContractAddress(),
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
        } else {
            it("should request transaction execution on L2 network", async () => {
                const token = await wallet.getBaseToken();
                const amount = 5;

                const approveParams = await wallet.getDepositAllowanceParams(token, amount);
                await (
                    await wallet.approveERC20(approveParams[0].token, approveParams[0].allowance)
                ).wait();

                const l2BalanceBeforeExecution = await wallet.getBalance();
                const l1BalanceBeforeExecution = await wallet.getBalanceL1();

                const tx = await wallet.requestExecute({
                    contractAddress: await wallet.getAddress(),
                    calldata: "0x",
                    l2Value: amount,
                    l2GasLimit: BigNumber.from(1_319_957),
                    mintValue: approveParams[0].allowance, // BigNumber.from(684_727_693_750_005)
                    operatorTip: 0,
                    gasPerPubdataByte: 800,
                    refundRecipient: await wallet.getAddress(),
                    overrides: {
                        maxFeePerGas: BigNumber.from(1_500_000_010),
                        maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                        gasLimit: BigNumber.from(238_654),
                        value: 0,
                    },
                });
                const result = await tx.wait();
                const l2BalanceAfterExecution = await wallet.getBalance();
                const l1BalanceAfterExecution = await wallet.getBalanceL1();
                expect(result).not.to.be.null;
                expect(l2BalanceAfterExecution.sub(l2BalanceBeforeExecution).gte(amount)).to.be.true;
                expect(l1BalanceBeforeExecution.sub(l1BalanceAfterExecution).gte(amount)).to.be.true;
            }).timeout(10_000);
        }
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
            const l2DAI = await provider.l2TokenAddress(DAI_L1);
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

        if (isETHBasedChain) {
            it("should transfer base token", async () => {
                const amount = 7_000_000_000;
                const token = await wallet.getBaseToken();
                const balanceBeforeTransfer = await provider.getBalance(RECEIVER, "latest", token);
                const tx = await wallet.transfer({
                    token: token,
                    to: RECEIVER,
                    amount: amount,
                });
                const result = await tx.wait();
                const balanceAfterTransfer = await provider.getBalance(RECEIVER, "latest", token);
                expect(result).not.to.be.null;
                expect(balanceAfterTransfer.sub(balanceBeforeTransfer).isZero()).to.be.true;
            }).timeout(25_000);
        } else {
            it("should transfer base token", async () => {
                const amount = 7_000_000_000;
                const balanceBeforeTransfer = await provider.getBalance(RECEIVER);
                const tx = await wallet.transfer({
                    token: await wallet.getBaseToken(),
                    to: RECEIVER,
                    amount: amount,
                });
                const result = await tx.wait();
                const balanceAfterTransfer = await provider.getBalance(RECEIVER);
                expect(result).not.to.be.null;
                expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be.true;
            }).timeout(25_000);
        }
    });

    describe("#signTransaction()", () => {
        it("should return a signed type EIP1559 transaction", async () => {
            const result = await wallet.signTransaction({
                type: 2,
                to: RECEIVER,
                value: BigNumber.from(7_000_000_000),
                nonce: 0,
            });
            expect(result).to.be.equal(
                "0x02f8698080808405f5e1008094a61464658afeaf65cccaafd3a512b69a83b776188501a13b860080c001a059e46987c3c5cafd906c5555d7d17f6b6ba1e32904a93161e3393c34b7017a00a00c1c7d76669bf9aaab20d6ab329a428bd9e982b598ce169e99aae35317a02a39",
            );
        }).timeout(25_000);

        it("should return a signed EIP712 transaction", async () => {
            const result = await wallet.signTransaction({
                type: utils.EIP712_TX_TYPE,
                to: RECEIVER,
                value: ethers.utils.parseEther("1"),
            });
            expect(result).not.to.be.null;
        }).timeout(25_000);

        it("should throw an error when `tx.from` is mismatched from private key", async () => {
            try {
                await wallet.signTransaction({
                    type: utils.EIP712_TX_TYPE,
                    from: RECEIVER,
                    to: RECEIVER,
                    value: 7_000_000_000,
                });
            } catch (e) {
                expect(e.message).to.be.equal("Transaction `from` address mismatch");
            }
        }).timeout(25_000);
    });
});
