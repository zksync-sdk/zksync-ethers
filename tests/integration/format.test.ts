import * as chai from "chai";
import "../custom-matchers";
import { Provider, types } from "../../src";
import { ethers } from "ethers";

const { expect } = chai;

describe("format", () => {
    const provider = Provider.getDefaultProvider(types.Network.Localhost);

    describe("formatTransactionResponse()", () => {
        it("should return `response.to=zeroAddress' when `value.to='0x0'`", async () => {
            const value = {
                hash: "0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee",
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: "0x0",
                gasLimit: BigInt(21_000),
                value: BigInt(1_000_000),
                nonce: BigInt(0),
                data: "0x",
            };
            const result = provider._wrapTransactionResponse(value, await provider.getNetwork());
            expect(result.to).to.be.equal(ethers.ZeroAddress);
        });

        it("should return a `response.to=null' when `value.to=null && value.creates=null`", async () => {
            const value = {
                hash: "0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee",
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: null,
                gasLimit: BigInt(21_000),
                value: BigInt(1_000_000),
                nonce: BigInt(0),
                data: "0x",
                creates: null,
            };
            const result = provider._wrapTransactionResponse(value, await provider.getNetwork());
            expect(result.to).to.be.null;
        });

        it("should return a `response.accessList=[]` when `value.accessList=null` for EIP2930 and EIP1559 transactions`", async () => {
            const value = {
                type: 1,
                hash: "0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee",
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
                gasLimit: BigInt(21_000),
                value: BigInt(1_000_000),
                nonce: BigInt(0),
                data: "0x",
                accessList: null,
            };
            const result = provider._wrapTransactionResponse(value, await provider.getNetwork());
            expect(result.accessList).to.has.lengthOf(0);
        });

        it("should return a `response.blockHash=null` when `value.blockHash=zeroHash`", async () => {
            const value = {
                blockHash: ethers.ZeroHash,
                hash: "0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee",
                from: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
                to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
                gasLimit: BigInt(21_000),
                value: BigInt(1_000_000),
                nonce: BigInt(0),
                data: "0x",
            };
            const result = provider._wrapTransactionResponse(value, await provider.getNetwork());
            expect(result.blockHash).to.be.null;
        });

        it("should thrown an error when hash is not provided", async () => {
            try {
                provider._wrapTransactionResponse({}, await provider.getNetwork());
            } catch (e) {
                expect(e.message).to.include("invalid value for value.hash");
            }
        });
    });
});
