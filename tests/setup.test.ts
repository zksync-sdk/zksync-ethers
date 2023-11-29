import { expect } from "chai";
import { Provider, types, Wallet } from "../src";
import { ethers } from "ethers";
import { TOKENS } from "./const";

// This should be run first before all other tests,
// which is why it's specified first in the test command in package.json.
describe("setup", () => {
    const PRIVATE_KEY = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

    const provider = Provider.getDefaultProvider(types.Network.Localhost);
    const ethProvider = ethers.getDefaultProvider("http://localhost:8545");

    const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

    it("deploy DAI token on L2 if not exists using deposit", async () => {
        const l2DAI = await provider.getCode(await provider.l2TokenAddress(TOKENS.DAI.address));
        if (l2DAI === "0x") {
            const priorityOpResponse = await wallet.deposit({
                token: TOKENS.DAI.address,
                to: await wallet.getAddress(),
                amount: 30,
                approveERC20: true,
                refundRecipient: await wallet.getAddress(),
            });
            const receipt = await priorityOpResponse.waitFinalize();
            expect(receipt).not.to.be.null;
        }
    }).timeout(25_000);
});
