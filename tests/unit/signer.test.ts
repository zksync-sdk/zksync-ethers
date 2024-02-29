import * as chai from 'chai';
import '../custom-matchers';
import {utils, EIP712Signer} from '../../src';
import {ethers} from 'ethers';
import {ADDRESS1, ADDRESS2} from '../utils';

const {expect} = chai;

describe('EIP712Signer', () => {
  describe('#getSignInput()', () => {
    it('should return a populated transaction', async () => {
      const tx = {
        txType: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        to: ADDRESS2,
        gasLimit: 21_000n,
        gasPerPubdataByteLimit: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        maxFeePerGas: 250_000_000n,
        maxPriorityFeePerGas: 250_000_000n,
        paymaster: ethers.ZeroAddress,
        nonce: 0,
        value: 7_000_000n,
        data: '0x',
        factoryDeps: [],
        paymasterInput: '0x',
      };

      const result = EIP712Signer.getSignInput({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        value: 7_000_000n,
        from: ADDRESS1,
        nonce: 0,
        chainId: 270n,
        gasPrice: 250_000_000n,
        gasLimit: 21_000n,
        customData: {},
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a populated transaction with default values', async () => {
      const tx = {
        txType: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        to: ADDRESS2,
        gasLimit: 0n,
        gasPerPubdataByteLimit: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        maxFeePerGas: 0n,
        maxPriorityFeePerGas: 0n,
        paymaster: ethers.ZeroAddress,
        nonce: 0,
        value: 0n,
        data: '0x',
        factoryDeps: [],
        paymasterInput: '0x',
      };

      const result = EIP712Signer.getSignInput({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        from: ADDRESS1,
      });
      expect(result).to.be.deep.equal(tx);
    });
  });

  describe('#getSignedDigest()', () => {
    it('should throw an error when chain ID is not specified', async () => {
      try {
        EIP712Signer.getSignedDigest({});
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          "Transaction chainId isn't set!"
        );
      }
    });
  });
});
