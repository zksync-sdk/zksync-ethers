import {expect} from 'chai';
import {Provider} from '../../src';
import {TransactionResponse} from 'ethers';
import {Signature} from 'ethers';

describe('Provider', () => {
  it('should correctly initialize and assign function properties in getPriorityOpResponse', async () => {
    const provider = new Provider();
    const l1TxResponse = new TransactionResponse(
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0xabcdef1234567890abcdef1234567890abcdef1234',
        blockHash:
          '0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: 123456,
        to: '0xabcdef1234567890abcdef1234567890abcdef1234',
        type: 2,
        nonce: 42,
        gasLimit: 2000000n,
        index: 3,
        gasPrice: 1000000000n,
        data: '0x',
        value: 0n,
        chainId: 1337n,
        // not used in tested code, keep the test simple
        signature: null as unknown as Signature,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        accessList: null,
      },
      provider
    );

    const priorityOpResponse =
      await provider.getPriorityOpResponse(l1TxResponse);
    expect(typeof priorityOpResponse.waitL1Commit).to.equal(
      'function',
      'The waitL1Commit function should be properly initialized'
    );
    expect(typeof priorityOpResponse.wait).to.equal(
      'function',
      'The wait function should be properly initialized'
    );
    expect(typeof priorityOpResponse.waitFinalize).to.equal(
      'function',
      'The waitFinalize function should be properly initialized'
    );
  });
});
