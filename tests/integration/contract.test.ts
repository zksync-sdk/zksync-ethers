import * as chai from "chai";
import "../custom-matchers";
import { Provider, types, Wallet, ContractFactory } from "../../src";
import { ethers } from "ethers";
import { TOKENS } from "../const";

const { expect } = chai;

describe("ContractFactory", () => {
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

    const provider = Provider.getDefaultProvider(types.Network.Localhost);
    const wallet = new Wallet(PRIVATE_KEY, provider);

    const tokenPath = "../files/Token.json";
    const paymasterPath = "../files/Paymaster.json";
    const storagePath = "../files/Storage.json";

    describe("#constructor()", () => {
        it("`ContractFactory(abi, bytecode, runner)` should return a `ContractFactory` with `create` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet);

            expect(factory.deploymentType).to.be.equal("create");
        });

        it("`ContractFactory(abi, bytecode, runner, createAccount)` should return a `ContractFactory` with `createAccount` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "createAccount");

            expect(factory.deploymentType).to.be.equal("createAccount");
        });

        it("`ContractFactory(abi, bytecode, runner, create2)` should return a `ContractFactory` with `create2` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");

            expect(factory.deploymentType).to.be.equal("create2");
        });

        it("`ContractFactory(abi, bytecode, runner, create2Account)` should return a `ContractFactory` with `create2Account` deployment", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2Account");

            expect(factory.deploymentType).to.be.equal("create2Account");
        });
    });

    describe("#deploy()", () => {
        it("should deploy contract without constructor using CREATE opcode", async () => {
            const abi = require(storagePath).contracts["Storage.sol:Storage"].abi;
            const bytecode: string = require(storagePath).contracts["Storage.sol:Storage"].bin;
            const factory = new ContractFactory(abi, bytecode, wallet);
            const contract = await factory.deploy();

            const code = await provider.getCode(await contract.getAddress());
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy contract with CREATE opcode", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet);
            const contract = await factory.deploy("Ducat", "Ducat", 18);

            const code = await provider.getCode(await contract.getAddress());
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy account with CREATE opcode", async () => {
            const paymasterAbi = require(paymasterPath).abi;
            const paymasterBytecode = require(paymasterPath).bytecode;
            const accountFactory = new ContractFactory(
                paymasterAbi,
                paymasterBytecode,
                wallet,
                "createAccount",
            );
            const paymasterContract = await accountFactory.deploy(
                await provider.l2TokenAddress(TOKENS.DAI.address),
            );

            const code = await provider.getCode(await paymasterContract.getAddress());
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy contract without constructor using CREATE2 opcode", async () => {
            const abi = require(storagePath).contracts["Storage.sol:Storage"].abi;
            const bytecode: string = require(storagePath).contracts["Storage.sol:Storage"].bin;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");
            const contract = await factory.deploy({
                customData: { salt: ethers.hexlify(ethers.randomBytes(32)) },
            });

            const code = await provider.getCode(await contract.getAddress());
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy contract with CREATE2 opcode", async () => {
            const abi = require(tokenPath).abi;
            const bytecode: string = require(tokenPath).bytecode;
            const factory = new ContractFactory(abi, bytecode, wallet, "create2");
            const contract = await factory.deploy("Ducat", "Ducat", 18, {
                customData: { salt: ethers.hexlify(ethers.randomBytes(32)) },
            });

            const code = await provider.getCode(await contract.getAddress());
            expect(code).not.to.be.null;
        }).timeout(10_000);

        it("should deploy account with CREATE2 opcode", async () => {
            const paymasterAbi = require(paymasterPath).abi;
            const paymasterBytecode = require(paymasterPath).bytecode;
            const accountFactory = new ContractFactory(
                paymasterAbi,
                paymasterBytecode,
                wallet,
                "create2Account",
            );
            const paymasterContract = await accountFactory.deploy(
                await provider.l2TokenAddress(TOKENS.DAI.address),
                { customData: { salt: ethers.hexlify(ethers.randomBytes(32)) } },
            );

            const code = await provider.getCode(await paymasterContract.getAddress());
            expect(code).not.to.be.null;
        }).timeout(10_000);
    });
});
