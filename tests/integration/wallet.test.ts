import * as chai from "chai";
import "../custom-matchers";
import { Provider, types, utils, Wallet } from "../../src";
import { ethers, BigNumber } from "ethers";
import * as fs from "fs";

const { expect } = chai;

describe("Wallet", () => {
    const ADDRESS = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
    const MNEMONIC = "stuff slice staff easily soup parent arm payment cotton trade scatter struggle";
    const RECEIVER = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";

    const provider = Provider.getDefaultProvider();
    const ethProvider = ethers.getDefaultProvider("http://localhost:8545");
    const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

    const TOKENS_L1 = require("../tokens.json");
    const DAI_L1 = TOKENS_L1[0].address;

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
        it("should return ETH deposit transaction", async () => {
            const tx = {
                contractAddress: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                calldata: "0x",
                l2Value: 7_000_000,
                l2GasLimit: BigNumber.from("0x08cbaa"),
                token: "0x0000000000000000000000000000000000000000",
                to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                amount: 7_000_000,
                refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                operatorTip: BigNumber.from(0),
                overrides: {
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                    value: BigNumber.from(288_213_007_000_000),
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

        it("should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified", async () => {
            const tx = {
                contractAddress: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                calldata: "0x",
                l2Value: 7_000_000,
                l2GasLimit: BigNumber.from("0x8cbaa"),
                token: "0x0000000000000000000000000000000000000000",
                to: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                amount: 7_000_000,
                refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                operatorTip: BigNumber.from(0),
                overrides: {
                    maxFeePerGas: BigNumber.from(1_500_000_010),
                    maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                    value: BigNumber.from(288_213_007_000_000),
                },
                gasPerPubdataByte: 800,
            };
            const result = await wallet.getDepositTx({
                token: utils.ETH_ADDRESS,
                amount: 7_000_000,
                refundRecipient: await wallet.getAddress(),
            });
            expect(result).to.be.deep.equal(tx);
        });

        it("should return DAI deposit transaction", async () => {
            const tx = {
                maxFeePerGas: BigNumber.from(1_500_000_010),
                maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
                value: BigNumber.from(288_992_000_000_000),
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: (await wallet.getL1BridgeContracts()).erc20.address,
            };
            const result = await wallet.getDepositTx({
                token: DAI_L1,
                to: await wallet.getAddress(),
                amount: 5,
                refundRecipient: await wallet.getAddress(),
            });
            result.to = result.to.toLowerCase();
            expect(result).to.be.deepEqualExcluding(tx, ["data"]);
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
            expect(result.eq(BigNumber.from(132_711))).to.be.true;
        });

        it("should return gas estimation for DAI deposit transaction", async () => {
            const result = await wallet.estimateGasDeposit({
                token: DAI_L1,
                to: await wallet.getAddress(),
                amount: 5,
                refundRecipient: await wallet.getAddress(),
            });
            expect(result.eq(BigNumber.from(253_418))).to.be.true;
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
    });

    describe("#claimFailedDeposit()", () => {
        // it("should claim failed deposit", async () => {
        //     const response = await wallet.deposit({
        //         token: utils.ETH_ADDRESS,
        //         to: await wallet.getAddress(),
        //         amount: 7_000_000_000,
        //         refundRecipient: await wallet.getAddress(),
        //         gasPerPubdataByte: 500 // make it fail because of low gas
        //     });
        //
        //     const tx = await response.waitFinalize(); // fails, sames goes with response.wait()
        //     const result = await wallet.claimFailedDeposit(tx.hash);
        //
        // }).timeout(30_000);

        it("should throw an error when trying to claim successful deposit", async () => {
            const response = await wallet.deposit({
                token: utils.ETH_ADDRESS,
                to: await wallet.getAddress(),
                amount: 7_000_000_000,
                refundRecipient: await wallet.getAddress(),
            });

            const tx = await response.waitFinalize();
            try {
                await wallet.claimFailedDeposit(tx.transactionHash);
            } catch (e) {
                expect(e.message).to.be.equal("Cannot claim successful deposit");
            }
        }).timeout(30_000);
    });

    describe("#getFullRequiredDepositFee()", () => {
        it("should return fee for ETH token deposit", async () => {
            const FEE_DATA = {
                baseCost: BigNumber.from(285_096_500_000_000),
                l1GasLimit: BigNumber.from(132_711),
                l2GasLimit: BigNumber.from("0x08b351"),
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
                baseCost: BigNumber.from(288_992_000_000_000),
                l1GasLimit: BigNumber.from(253_177),
                l2GasLimit: BigNumber.from("0x08d1c0"),
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
            expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

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
        it("should return request execute transaction", async () => {
            const result = await wallet.getRequestExecuteTx({
                contractAddress: await provider.getBridgehubContractAddress(),
                calldata: "0x",
                l2Value: 7_000_000_000,
            });
            expect(result).not.to.be.null;
        });
    });

    describe("#estimateGasRequestExecute()", () => {
        it("should return gas estimation for request execute transaction", async () => {
            const result = await wallet.estimateGasRequestExecute({
                contractAddress: await provider.getBridgehubContractAddress(),
                calldata: "0x",
                l2Value: 7_000_000_000,
            });
            expect(result.isZero()).to.be.false;
        });
    });

    describe("#requestExecute()", () => {
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
    });

    describe("#signTransaction()", () => {
        it("should return a signed type EIP1559 transaction", async () => {
            const result = await wallet.signTransaction({
                type: 2,
                to: RECEIVER,
                value: BigNumber.from(7_000_000_000),
            });
            expect(result).to.be.equal(
                "0x02f869808080840ee6b2808094a61464658afeaf65cccaafd3a512b69a83b776188501a13b860080c001a0ea6c3f7588b7b4e5652e0372aa09d772b59689ee0e51445b3b7d69bffd5d9e77a046387a8dfa24ab22d3427cd85035b91abc28e1876813873ea0b41f2bdc9ef778",
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
