import { Provider, types, Wallet } from "../src";
import { ethers } from "ethers";

const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

const provider = Provider.getDefaultProvider(types.Network.Localhost);
const ethProvider = ethers.getDefaultProvider("http://127.0.0.1:8545");

const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

const TOKENS_L1 = require("./tokens.json");

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

/*
Deploy token to the L2 network through deposit transaction.
 */
async function main() {
    const l2TokenAddress = await createTokenL2(TOKENS_L1[0].address);
    console.log(`L2 DAI address: ${l2TokenAddress}`);
}

main()
    .then()
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
