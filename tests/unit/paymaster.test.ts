import * as chai from 'chai';
import '../custom-matchers';
import {utils, types} from '../../src';

const {expect} = chai;

describe('getPaymasterParams()', () => {
  it('should return encoded parameters for the general paymaster', async () => {
    const params: types.PaymasterParams = {
      paymaster: '0x0a67078A35745947A37A552174aFe724D8180c25',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    };

    const result = utils.getPaymasterParams(
      '0x0a67078A35745947A37A552174aFe724D8180c25',
      {
        type: 'General',
        innerInput: new Uint8Array(),
      }
    );
    expect(result).to.be.deep.equal(params);
  });

  it('should return encoded parameters for the general paymaster', async () => {
    const params: types.PaymasterParams = {
      paymaster: '0x0a67078A35745947A37A552174aFe724D8180c25',
      paymasterInput:
        '0x949431dc00000000000000000000000065c899b5fb8eb9ae4da51d67e1fc417c7cb7e964000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
    };

    const result = utils.getPaymasterParams(
      '0x0a67078A35745947A37A552174aFe724D8180c25',
      {
        type: 'ApprovalBased',
        token: '0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964',
        minimalAllowance: 1n,
        innerInput: new Uint8Array(),
      }
    );
    expect(result).to.be.deep.equal(params);
  });
});
