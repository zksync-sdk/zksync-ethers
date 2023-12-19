import { Provider, types, Wallet } from "../src";
import { ethers } from "ethers";
import * as fs from "fs";

const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

const provider = Provider.getDefaultProvider(types.Network.Localhost);
const ethProvider = ethers.getDefaultProvider("http://127.0.0.1:8545");

const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
const ethWallet = new ethers.Wallet(PRIVATE_KEY, ethProvider);

const tokenContractPath = "./files/Token.json";
const tokenPath = "./tests/token.json";

async function checkIfTokenNeedsToBeCreated(): Promise<{ l1: boolean; l2: boolean }> {
    if (fs.existsSync(tokenPath)) {
        const jsonData = fs.readFileSync(tokenPath, "utf8");
        const token = JSON.parse(jsonData);

        const l1Bytecode = await ethProvider.getCode(token.l1Address);
        const l2Bytecode = await provider.getCode(token.l2Address);
        return { l1: l1Bytecode == "0x", l2: l2Bytecode == "0x" };
    }
    return { l1: true, l2: true };
}

async function createTokenL1(): Promise<string> {
    const abi = require(tokenContractPath).abi;
    const bytecode: string = require(tokenContractPath).bytecode;
    const factory = new ethers.ContractFactory(abi, bytecode, ethWallet);

    const l1DAI = (await factory.deploy("DAI", "DAI", 18)) as ethers.Contract;
    await l1DAI.waitForDeployment();

    const response = (await l1DAI.mint(
        await ethWallet.getAddress(),
        100_000_000,
    )) as ethers.ContractTransactionResponse;
    await response.wait();

    return await l1DAI.getAddress();
}

async function createTokenL2(l1TokenAddress: string): Promise<string> {
    const priorityOpResponse = await wallet.deposit({
        token: l1TokenAddress,
        to: await wallet.getAddress(),
        amount: 30,
        approveERC20: true,
        refundRecipient: await wallet.getAddress(),
    });
    await priorityOpResponse.waitFinalize();
    return await wallet.l2TokenAddress(l1TokenAddress);
}

function writeTokenConfigToFile(token: { l1Address: string; l2Address: string }) {
    const tokenJSON = JSON.stringify(token, null, 2);
    console.log(`Token: ${tokenJSON}`);
    fs.writeFileSync(tokenPath, tokenJSON);
}

/*
Generate tokens on L1 and L2 networks and write their addresses to token.json.
If the token.json file already exists and L1 address is defined (already deployed),
then appropriate token will be created on L2 network.
If the token.json file already exists with both addresses defined, this script is skipped.
 */
async function main() {
    const createTokenChecks = await checkIfTokenNeedsToBeCreated();
    if (createTokenChecks.l1) {
        const l1TokenAddress = await createTokenL1();
        const l2TokenAddress = await createTokenL2(l1TokenAddress);
        writeTokenConfigToFile({ l1Address: l1TokenAddress, l2Address: l2TokenAddress });
    } else if (!createTokenChecks.l1 && createTokenChecks.l2) {
        const l1TokenAddress = JSON.parse(fs.readFileSync(tokenPath, "utf8")).l1Address;
        const l2TokenAddress = await createTokenL2(l1TokenAddress);
        writeTokenConfigToFile({ l1Address: l1TokenAddress, l2Address: l2TokenAddress });
    } else {
        console.log("Token has been already created.");
    }
}

main()
    .then()
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
