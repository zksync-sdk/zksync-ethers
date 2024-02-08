import * as chai from "chai";
import "../custom-matchers";
import { ContractFactory, Contract, SmartAccount, Provider, types, utils, Wallet } from "../../src";
import { ethers, TransactionLike } from "ethers";
import * as fs from "fs";
import { Transaction, TransactionRequest } from "../../src/types";
import { serializeEip712 } from "../../src/utils";
import { deploySmartWalletContracts } from "../setup";
const { expect } = chai;

const DAI = require("../token.json");

describe.only("SmartAccount", async () => {
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
    const provider = Provider.getDefaultProvider(types.Network.Localhost);
    const ethProvider = ethers.getDefaultProvider("http://localhost:8545");
    let smartAccountAddress: string;
    let multiAccountAddress: string;
    let multiAccountPK2: string;
    const deployer = new Wallet(PRIVATE_KEY, provider, ethProvider);

    let smartWallet: SmartAccount;
    let receiver;
    let l2DAI: string;

    let addresses;

    const dummySignMethod = async (
        tx: TransactionRequest,
        defaultSigner: ethers.Signer,
        keys: string[] | string | ethers.SigningKey,
    ) => {
        return "0x";
    };
    before("setup", async function () {
        this.timeout(90_000);

        // deploy the smart account contract
        addresses = await deploySmartWalletContracts();

        const provider = Provider.getDefaultProvider(types.Network.Localhost);
        l2DAI = await provider.l2TokenAddress(DAI.l1Address);

        // @ts-ignore
        smartAccountAddress = addresses.smartAccountAddress;
        multiAccountAddress = addresses.multiAccountAddress;
        multiAccountPK2 = addresses.owner2.owner2PrivateKey;

        smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
        receiver = Wallet.createRandom(provider);

        // fund the smart account contract
        const fundTx = await deployer.transfer({
            to: smartAccountAddress,
            amount: ethers.parseEther("1"),
        });

        const b = await deployer.getBalanceL1(DAI.l1Address);

        await fundTx.wait();

        console.log("account funded with ETH");

        const tx = await deployer.deposit({
            token: DAI.l1Address,
            to: await deployer.getAddress(),
            amount: 100,
            approveERC20: true,
            refundRecipient: await deployer.getAddress(),
        });
        await tx.wait();

        await deployer.getBalance(l2DAI);

        const fundTxTok = await deployer.transfer({
            token: l2DAI,
            to: smartAccountAddress,
            amount: 5,
        });
        await fundTxTok.wait();

        console.log("account funded with DAI");
    });

    describe("#constructor()", () => {
        it("`SmartWallet(address, PK, provider)` should return a `SmartAccount` with provider", () => {
            const smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
            expect(smartWallet.privateKeys).to.be.equal(PRIVATE_KEY);
            expect(smartWallet.provider).to.be.equal(provider);
            expect(smartWallet.address).to.be.equal(smartAccountAddress);
        });
        it("`SmartWallet(address, privateKey, provider, signMethod)` should return a `SmartAccount` with provider and custom sign ", async () => {
            // decided to remove ethProvider from constructor as it is not needed for SmartAccounts only EOA accounts
            const wallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider, dummySignMethod);

            expect(wallet.provider).to.be.equal(provider);
            expect(wallet.address).to.be.equal(smartAccountAddress);
            expect(wallet.customSigningMethod).to.be.equal(dummySignMethod);
        });
        // it("`SmartWallet(address, [PK, PK2], provider)` should return a `SmartAccount` with L2 provider", () => {
        // TODO: not implemented yet
        // const smartWallet = new SmartAccount(
        //     multiAccountAddress,
        //     [PRIVATE_KEY, multiAccountPK2],
        //     provider,
        // );
        // expect(smartWallet.provider).to.be.equal(provider);
        // expect(smartWallet.address).to.be.equal(ADDRESS);
        // });
    });
    describe("class properties", () => {
        it('should have "address" property', () => {
            const smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
            expect(smartWallet.address).to.be.equal(smartAccountAddress);
        });
        it("should not derive the address from the PK", () => {
            const smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
            expect(smartWallet.address).to.not.be.equal("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
        });
    });

    describe.skip("#transfer", () => {
        // TODO: transfer method not implemented yet
        // it("DefaultAccount should transfer ETH", async () => {
        //     const normalWallet = new Wallet(PRIVATE_KEY, provider);
        //     const smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
        //     const amount = 1_000;
        //     const nBalanceBeforeTransfer = await provider.getBalance(normalWallet);
        //     // console.log("nBalanceBeforeTransfer :>> ", nBalanceBeforeTransfer);
        //     const ownBalanceBeforeTransfer = await provider.getBalance(smartAccountAddress);
        //     // console.log("ownBalanceBeforeTransfer :>> ", ownBalanceBeforeTransfer);
        //     const balanceBeforeTransfer = await provider.getBalance(receiver.address);
        //     // console.log("balanceBeforeTransfer :>> ", balanceBeforeTransfer);
        //     const tx = await smartWallet.transfer({
        //         token: utils.ETH_ADDRESS,
        //         to: receiver.address,
        //         amount: amount,
        //     });
        //     const result = await tx.wait();
        //     const nBalanceAfterTransfer = await provider.getBalance(normalWallet);
        //     // console.log("nBalanceAfterTransfer :>> ", nBalanceAfterTransfer);
        //     const ownBalanceAfterTransfer = await provider.getBalance(smartAccountAddress);
        //     // console.log("ownBalanceAfterTransfer :>> ", ownBalanceAfterTransfer);
        //     const balanceAfterTransfer = await provider.getBalance(receiver.address);
        //     // console.log("balanceAfterTransfer :>> ", balanceAfterTransfer);
        //     expect(result).not.to.be.null;
        //     expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(BigInt(amount));
        //     // cant check the exact balance of the smart account as the gas cost for tx is not fixed
        //     // expect(BigInt(ownBalanceAfterTransfer)).to.be.below(BigInt(ownBalanceBeforeTransfer));
        // }).timeout(45_000);
        // it("should transfer DAI", async () => {
        //     const smartWallet = new SmartAccount(
        //         smartAccountAddress,
        //         PRIVATE_KEY,
        //         provider,
        //         null,
        //         ethProvider,
        //     );
        //     const amount = 1;
        //     const l2DAI = await provider.l2TokenAddress(DAI.l1Address);
        //     const ownBalanceBeforeTransfer = await provider.getBalance(
        //         smartAccountAddress,
        //         "latest",
        //         l2DAI,
        //     );
        //     console.log("DAI balanceBeforeTransfer :>> ", ownBalanceBeforeTransfer);
        //     const tx = await smartWallet.transfer({
        //         token: l2DAI,
        //         to: receiver.address,
        //         amount: amount,
        //     });
        //     const result = await tx.wait();
        //     const balanceAfterTransfer = await provider.getBalance(receiver.address, "latest", l2DAI);
        //     const ownBalanceAfterTransfer = await provider.getBalance(
        //         smartAccountAddress,
        //         "latest",
        //         l2DAI,
        //     );
        //     expect(result).not.to.be.null;
        //     expect(balanceAfterTransfer).to.be.equal(BigInt(amount));
        // }).timeout(45_000);
    });

    describe("#contract Read/Write()", () => {
        it("DefaultAccount can read contract state", async () => {
            const smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
            const greeter = new Contract(
                addresses.greeterAddress,
                require("../files/greeter.json").abi,
                smartWallet,
            );
            const res = await greeter.greet();
            expect(res).to.be.equal("Hello world!");
        });
        it("DefaultAccount can write contract state", async () => {
            const smartWallet = new SmartAccount(smartAccountAddress, PRIVATE_KEY, provider);
            const greeter = new Contract(
                addresses.greeterAddress,
                require("../files/greeter.json").abi,
                smartWallet,
            );
            const newMessage = "Hola mundo!";
            const tx = await greeter.setGreeting(newMessage);
            await tx.wait();
            const from = tx.from;
            const res = await greeter.greet();
            expect(res).to.be.equal(newMessage);
            expect(from).to.be.equal(smartWallet.address);
        }).timeout(45_000);
    });
});
