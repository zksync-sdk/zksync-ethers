import * as chai from "chai";
import "../custom-matchers";
import { ContractFactory, Provider, types, Wallet, Contract } from "../../src";
import { ethers } from "ethers";

const { expect } = chai;

describe("ContractFactory", () => {
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

    const provider = Provider.getDefaultProvider(types.Network.Localhost);
    const wallet = new Wallet(PRIVATE_KEY, provider);

    const tokenPath = "../files/Token.json";
    const paymasterPath = "../files/Paymaster.json";
    const storagePath = "../files/Storage.json";
    const demoPath = "../files/Demo.json";

    const TOKENS_L1 = require("../tokens.json");
    const DAI_L1 = TOKENS_L1[0].address;

    describe("#constructor()", () => {
        it("`ContractFactory(abi, bytecode, runner)` should return a `ContractFactory` with `create` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet);

            expect(factory.deploymentType).to.be.equal("create");
        });

        it("`ContractFactory(abi, bytecode, runner, 'createAccount')` should return a `ContractFactory` with `createAccount` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "createAccount");

            expect(factory.deploymentType).to.be.equal("createAccount");
        });

        it("`ContractFactory(abi, bytecode, runner, 'create2')` should return a `ContractFactory` with `create2` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");

            expect(factory.deploymentType).to.be.equal("create2");
        });

        it("`ContractFactory(abi, bytecode, runner, 'create2Account')` should return a `ContractFactory` with `create2Account` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2Account");

            expect(factory.deploymentType).to.be.equal("create2Account");
        });

        it("`ContractFactory(abi, bytecode, runner, '')` should throw an error when invalid deployment type is specified", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            try {
                // @ts-ignore
                new ContractFactory(abi, bytecode, wallet, "null");
            } catch (e) {
                expect(e.message).to.be.equal("Unsupported deployment type null");
            }
        });
    });

    describe("#deploy()", () => {
        it("should deploy a contract without constructor using CREATE opcode", async () => {
            const abi = require(storagePath).contracts["Storage.sol:Storage"].abi;
            const bytecode: string = require(storagePath).contracts["Storage.sol:Storage"].bin;
            const factory = new ContractFactory(abi, bytecode, wallet);
            const contract = await factory.deploy();

            const code = await provider.getCode(contract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy a contract with a constructor using CREATE opcode", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet);
            const contract = await factory.deploy("Ducat", "Ducat", 18);

            const code = await provider.getCode(contract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy a contract with dependencies using CREATE opcode", async () => {
            const abi = require(demoPath).contracts["Demo.sol:Demo"].abi;
            const bytecode: string = require(demoPath).contracts["Demo.sol:Demo"].bin;

            const factory = new ContractFactory(abi, bytecode, wallet);
            const contract = (await factory.deploy({
                customData: { factoryDeps: [require(demoPath).contracts["Foo.sol:Foo"].bin] },
            })) as Contract;

            const code = await provider.getCode(contract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy an account using CREATE opcode", async () => {
            const paymasterAbi = require(paymasterPath).abi;
            const paymasterBytecode = require(paymasterPath).bytecode;
            const accountFactory = new ContractFactory(
                paymasterAbi,
                paymasterBytecode,
                wallet,
                "createAccount",
            );
            const paymasterContract = await accountFactory.deploy(await provider.l2TokenAddress(DAI_L1));

            const code = await provider.getCode(paymasterContract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy a contract without a constructor using CREATE2 opcode", async () => {
            const abi = require(storagePath).contracts["Storage.sol:Storage"].abi;
            const bytecode: string = require(storagePath).contracts["Storage.sol:Storage"].bin;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");
            const contract = await factory.deploy({
                customData: { salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)) },
            });

            const code = await provider.getCode(contract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy a contract with a constructor using CREATE2 opcode", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");
            const contract = await factory.deploy("Ducat", "Ducat", 18, {
                customData: { salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)) },
            });

            const code = await provider.getCode(contract.address);
            const deploymentTx = contract.deployTransaction;
            expect(code).not.to.be.null;
            expect(deploymentTx).not.to.be.null;
        }).timeout(10_000);

        it("should deploy a contract with dependencies using CREATE2 opcode", async () => {
            const abi = require(demoPath).contracts["Demo.sol:Demo"].abi;
            const bytecode: string = require(demoPath).contracts["Demo.sol:Demo"].bin;

            const factory = new ContractFactory(abi, bytecode, wallet, "create2");
            const contract = (await factory.deploy({
                customData: {
                    salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                    factoryDeps: [require(demoPath).contracts["Foo.sol:Foo"].bin],
                },
            })) as Contract;

            const code = await provider.getCode(contract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy an account using CREATE2 opcode", async () => {
            const paymasterAbi = require(paymasterPath).abi;
            const paymasterBytecode = require(paymasterPath).bytecode;
            const accountFactory = new ContractFactory(
                paymasterAbi,
                paymasterBytecode,
                wallet,
                "create2Account",
            );
            const paymasterContract = await accountFactory.deploy(
                await provider.l2TokenAddress(DAI_L1),
                { customData: { salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)) } },
            );

            const code = await provider.getCode(paymasterContract.address);
            expect(code).not.to.be.null;
        }).timeout(10_000);
    });

    describe("getDeployTransaction()", () => {
        it("should return a deployment transaction", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet);

            const result = await factory.getDeployTransaction("Ducat", "Ducat", 18);
            expect(result).not.to.be.null;
        }).timeout(10_000);

        it("should throw an error when salt is not provided in CRATE2 deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");

            try {
                await factory.getDeployTransaction("Ducat", "Ducat", 18);
            } catch (e) {
                expect(e.message).to.be.equal("Salt is required for CREATE2 deployment!");
            }
        }).timeout(10_000);

        it("should throw an error when salt is not provided in hexadecimal format in CRATE2 deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");

            try {
                await factory.getDeployTransaction("Ducat", "Ducat", 18, {
                    customData: { salt: "0000" },
                });
            } catch (e) {
                expect(e.message).to.be.equal("Invalid salt provided!");
            }
        }).timeout(10_000);

        it("should throw an error when invalid salt length is provided in CRATE2 deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");

            try {
                await factory.getDeployTransaction("Ducat", "Ducat", 18, {
                    customData: { salt: "0x000" },
                });
            } catch (e) {
                expect(e.message).to.be.equal("Invalid salt provided!");
            }
        }).timeout(10_000);

        it("should throw an error when invalid factory deps are provided in CRATE2 deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");

            try {
                await factory.getDeployTransaction("Ducat", "Ducat", 18, {
                    customData: {
                        salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                        factoryDeps: "0",
                    },
                });
            } catch (e) {
                expect(e.message).to.be.equal(
                    "Invalid 'factoryDeps' format! It should be an array of bytecodes.",
                );
            }

            try {
                await factory.getDeployTransaction("Ducat", "Ducat", 18, {
                    customData: {
                        salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                        factoryDeps: "",
                    },
                });
            } catch (e) {
                expect(e.message).to.be.equal(
                    "Invalid 'factoryDeps' format! It should be an array of bytecodes.",
                );
            }
        }).timeout(10_000);
    });
});
