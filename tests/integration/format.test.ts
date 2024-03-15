import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types} from '../../src';
import {ethers} from 'ethers';

const {expect} = chai;

describe('format', () => {
  const ADDRESS = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
  const RECEIVER = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618';

  const provider = Provider.getDefaultProvider(types.Network.Localhost);

  describe('formatTransactionResponse()', () => {
    it("should return `response.to=zeroAddress' when `value.to='0x0'`", async () => {
      const value = {
        hash: '0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee',
        from: ADDRESS,
        to: '0x0',
        gasLimit: 21_000n,
        value: 1_000_000n,
        nonce: 0n,
        data: '0x',
      };
      const result = provider._wrapTransactionResponse(value);
      expect(result.to).to.be.equal(ethers.ZeroAddress);
    });

    it("should return a `response.to=null' when `value.to=null && value.creates=null`", async () => {
      const value = {
        hash: '0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee',
        from: ADDRESS,
        to: null,
        gasLimit: 21_000n,
        value: 1_000_000n,
        nonce: 0n,
        data: '0x',
        creates: null,
      };
      const result = provider._wrapTransactionResponse(value);
      expect(result.to).to.be.null;
    });

    it('should return a `response.accessList=[]` when `value.accessList=null` for EIP2930 and EIP1559 transactions`', async () => {
      const value = {
        type: 1,
        hash: '0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee',
        from: ADDRESS,
        to: RECEIVER,
        gasLimit: 21_000n,
        value: 1_000_000n,
        nonce: 0n,
        data: '0x',
        accessList: null,
      };
      const result = provider._wrapTransactionResponse(value);
      expect(result.accessList).to.has.lengthOf(0);
    });

    it('should return a `response.blockHash=null` when `value.blockHash=zeroHash`', async () => {
      const value = {
        blockHash: ethers.ZeroHash,
        hash: '0x9ed410ce33179ac1ff6b721060605afc72d64febfe0c08cacab5a246602131ee',
        from: ADDRESS,
        to: RECEIVER,
        gasLimit: 21_000n,
        value: 1_000_000n,
        nonce: 0n,
        data: '0x',
      };
      const result = provider._wrapTransactionResponse(value);
      expect(result.blockHash).to.be.null;
    });

    it('should thrown an error when hash is not provided', async () => {
      try {
        provider._wrapTransactionResponse({});
      } catch (e) {
        expect((e as Error).message).to.include('invalid value for value.hash');
      }
    });
  });
});
