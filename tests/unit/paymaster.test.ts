import { expect } from "chai";
import { Paymaster } from "../../src";
import { getApprovalBasedPaymasterInput } from "../../src/utils";

describe("Paymaster", () => {
  describe("constructor", () => {
    it("should create an ApprovalBased Paymaster instance", () => {
      const type = "ApprovalBased";
      const address = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"
      const tokenAddress = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";
      const minimalAllowance = 100;
      const innerInput = [1, 2, 3];

      const paymaster = new Paymaster(type, address, tokenAddress, minimalAllowance, innerInput);

      expect(paymaster.type).to.equal(type);
      expect(paymaster.address).to.equal(address);
      expect(paymaster.paymasterInput.type).to.equal(type);
      // @ts-ignore
      expect(paymaster.paymasterInput.token).to.equal(tokenAddress);
      // @ts-ignore
      expect(paymaster.paymasterInput.minimalAllowance).to.equal(minimalAllowance);
      expect(paymaster.paymasterInput.innerInput).to.deep.equal("0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003");
    });

    it("should create a General Paymaster instance", () => {
      const type = "General";
      const address = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
      const innerInput = [4, 5, 6];

      const paymaster = new Paymaster(type, address, undefined, undefined, innerInput);

      expect(paymaster.type).to.equal(type);
      expect(paymaster.address).to.equal(address);
      expect(paymaster.paymasterInput.type).to.equal(type);
      expect(paymaster.paymasterInput.innerInput).to.deep.equal("0x000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000006");
    });
  });

  describe("getPaymasterParams", () => {
    it("should return the paymaster params", () => {
      const address = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
      const paymasterInput = {
        type: "ApprovalBased",
        token: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
        minimalAllowance: 100,
        innerInput: [1, 2, 3]
      };
      const paymasterParams = {
          paymaster: address,
          paymasterInput
        };

      // @ts-ignore
      const paymaster = new Paymaster(paymasterInput.type, address, paymasterInput.token, paymasterInput.minimalAllowance, paymasterInput.innerInput);
      const resPaymasterParams = paymaster.getPaymasterParams();      
      const expectedPaymasterParams = {
        paymaster: address,
        // @ts-ignore
        paymasterInput: getApprovalBasedPaymasterInput(paymaster.paymasterInput),
      };
      expect(resPaymasterParams).to.deep.equal(expectedPaymasterParams);
    });
  });
});
