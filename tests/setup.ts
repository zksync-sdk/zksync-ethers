import { Provider, Wallet, types } from "../src";
import { ethers } from "ethers";
import {  ETH_ADDRESS_IN_CONTRACTS } from "../src/utils";

import { ITestnetErc20TokenFactory } from "../typechain/ITestnetErc20TokenFactory";

const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

const provider = Provider.getDefaultProvider(types.Network.Localhost);
const ethProvider = ethers.getDefaultProvider("http://127.0.0.1:8545");

const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

// const TOKENS_L1 = require("./tokens.json");
// const DAI_L1 = TOKENS_L1[0].address;

// only for zk stack because everytime tokens addresses are
// different
const DAI_L1 = "0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55";

/*
Mints tokens on L1 in case L2 is non-ETH based chain.
It mints based token, provided alternative tokens (different from base token) and wETH.
*/
async function mintTokensOnL1(alternativeToken: string) {
    const bridgehub = await wallet.getBridgehubContract();
    const chainId = (await provider.getNetwork()).chainId;
    let baseTokenAddress = await bridgehub.baseToken(chainId);

    if (baseTokenAddress != ETH_ADDRESS_IN_CONTRACTS) {
        const baseToken = ITestnetErc20TokenFactory.connect(baseTokenAddress, wallet._signerL1());
        const baseTokenMintTx = await baseToken.mint(
            await wallet.getAddress(),
            ethers.utils.parseEther("20000"),
        );
        await baseTokenMintTx.wait();
    }

    const altToken = ITestnetErc20TokenFactory.connect(alternativeToken, wallet._signerL1());
    const altTokenMintTx = await altToken.mint(
        await wallet.getAddress(),
        ethers.utils.parseEther("20000"),
    );
    await altTokenMintTx.wait();
    console.log(`Minting tokens on L1 finished`);
}

/*
Send base token to L2 in case L2 in non-ETH base chain.
*/
async function sendTokenToL2(l1TokenAddress: string) {
    const priorityOpResponse = await wallet.deposit({
        token: l1TokenAddress,
        to: await wallet.getAddress(),
        amount: ethers.utils.parseEther("10000"),
        approveERC20: true,
        approveBaseERC20: true,
        refundRecipient: await wallet.getAddress(),
    });
    const receipt = await priorityOpResponse.waitFinalize();
    console.log(`Send funds tx: ${receipt.transactionHash}`);
}

async function main() {
    const baseToken = await wallet.getBaseToken();
    console.log(`Wallet address: ${await wallet.getAddress()}`)
    console.log(`Base token L1: ${baseToken}`)

    console.log(`L1 base token balance before: ${await wallet.getBalanceL1(baseToken)}`);
    console.log(`L2 base token balance before: ${await wallet.getBalance()}`);

    await mintTokensOnL1(baseToken);
    await sendTokenToL2(baseToken);

    console.log(`L1 base token balance after: ${await wallet.getBalanceL1(baseToken)}`);
    console.log(`L2 base token balance after: ${await wallet.getBalance()} \n`, );
    
    if (baseToken != ETH_ADDRESS_IN_CONTRACTS) {
        const l2EthAddress =  await wallet.l2TokenAddress(ETH_ADDRESS_IN_CONTRACTS);
        console.log(`Eth L1: ${ETH_ADDRESS_IN_CONTRACTS}`)
        console.log(`Eth L2: ${l2EthAddress}`)

        console.log(`L1 eth balance before: ${await wallet.getBalanceL1()}`);
        console.log(`L2 eth balance before: ${await wallet.getBalance(l2EthAddress)}`);
    
        await mintTokensOnL1(ETH_ADDRESS_IN_CONTRACTS);
        await sendTokenToL2(ETH_ADDRESS_IN_CONTRACTS);

        console.log(`L1 eth balance after: ${await wallet.getBalanceL1()}`);
        console.log(`L2 eth  balance after: ${await wallet.getBalance(l2EthAddress)}\n`);
    }

    const l2DAIAddress =  await wallet.l2TokenAddress(DAI_L1);
    console.log(`DAI L1: ${DAI_L1}`)
    console.log(`DAI L2: ${l2DAIAddress}`)

    console.log(`L1 DAI balance before: ${await wallet.getBalanceL1(DAI_L1)}`);
    console.log(`L2 DAI balance before: ${await wallet.getBalance(l2DAIAddress)}`);

    await mintTokensOnL1(DAI_L1);
    await sendTokenToL2(DAI_L1);
    console.log(`L1 DAI balance after: ${await wallet.getBalanceL1(DAI_L1)}`);
    console.log(`L2 DAI balance after: ${await wallet.getBalance(l2DAIAddress)}`);
}

main()
    .then()
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
