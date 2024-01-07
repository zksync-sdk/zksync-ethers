import * as chai from 'chai';
import '../custom-matchers';
import {utils, EIP712Signer} from '../../src';
import {ethers, BigNumber} from 'ethers';
import {ADDRESS1, ADDRESS2} from '../utils';

const {expect} = chai;

describe('EIP712Signer', () => {
  describe('#getSignInput()', () => {
    it('should return a populated transaction', async () => {
      const tx = {
        txType: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        to: ADDRESS2,
        gasLimit: BigNumber.from(21_000),
        gasPerPubdataByteLimit: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        maxFeePerGas: BigNumber.from(250_000_000),
        maxPriorityFeePerGas: BigNumber.from(250_000_000),
        paymaster: ethers.constants.AddressZero,
        nonce: 0,
        value: BigNumber.from(7_000_000),
        data: '0x',
        factoryDeps: [],
        paymasterInput: '0x',
      };

      const result = EIP712Signer.getSignInput({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        value: BigNumber.from(7_000_000),
        from: ADDRESS1,
        nonce: 0,
        chainId: 270,
        gasPrice: BigNumber.from(250_000_000),
        gasLimit: BigNumber.from(21_000),
        customData: {},
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a populated transaction with default values', async () => {
      const tx = {
        txType: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        to: ADDRESS2,
        gasLimit: 0,
        gasPerPubdataByteLimit: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymaster: ethers.constants.AddressZero,
        nonce: 0,
        value: 0,
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
