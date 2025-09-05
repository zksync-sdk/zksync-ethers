import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types, utils} from '../../src';
import {ethers} from 'ethers';
import {
  PRIVATE_KEY1,
  ADDRESS1,
  IS_ETH_BASED,
  ADDRESS2,
  DAI_L1,
  L1_CHAIN_URL,
  L2_CHAIN_URL,
} from '../utils';

const {expect} = chai;

describe('utils', () => {
  const provider = new Provider(L2_CHAIN_URL);
  const ethProvider = ethers.getDefaultProvider(L1_CHAIN_URL);

  describe('#isMessageSignatureCorrect()', () => {
    it('should return true for a valid message signature', async () => {
      const message = 'Hello, world!';
      const signature = await new ethers.Wallet(PRIVATE_KEY1).signMessage(
        message
      );

      const result = await utils.isMessageSignatureCorrect(
        provider,
        ADDRESS1,
        message,
        signature
      );
      expect(result).to.be.true;
    });

    it('should return false for an invalid message signature', async () => {
      const message = 'Hello!';
      const invalidSignature =
        '0xb04f825363596418c630425916f73447d636094a75e47b45e2eb59d8a6c7d5035355f03b903b84700376f0efa23f3b095815776c5c6daf2b371a0a61b5f703451b';

      const result = await utils.isMessageSignatureCorrect(
        provider,
        ADDRESS1,
        message,
        invalidSignature
      );
      expect(result).to.be.false;
    });
  });
});
