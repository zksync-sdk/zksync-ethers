import * as chai from 'chai';
import '../custom-matchers';
import {EIP712Signer, Provider, types} from '../../src';
import {TransactionRequest} from '../../src/types';
import {
  populateTransactionECDSA,
  populateTransactionMultisigECDSA,
  signPayloadWithECDSA,
  signPayloadWithMultipleECDSA,
} from '../../src/smart-account-utils';
import {TypedDataEncoder, hashMessage} from 'ethers';
import {ADDRESS1, PRIVATE_KEY1, ADDRESS2} from '../utils';

const {expect} = chai;

describe('signPayloadWithECDSA()', () => {
  it('should return signature by signing EIP712 transaction hash', async () => {
    const tx: TransactionRequest = {
      chainId: 270,
      from: ADDRESS1,
      to: ADDRESS2,
      value: 7_000_000_000,
    };

    const txHash = EIP712Signer.getSignedDigest(tx);

    const result = await signPayloadWithECDSA(txHash, PRIVATE_KEY1);
    expect(result).to.be.equal(
      '0x89905d36a3cdde117445d6c58627061a53f09cf0535d73719d82d4d96fe332541167e2e3d38ce3cb2751a0203eff2a71f55ad45dc91623587f5480ec1883281b1b'
    );
  });

  it('should return signature by signing message hash', async () => {
    const message = 'Hello World!';
    const messageHash = hashMessage(message);

    const result = await signPayloadWithECDSA(messageHash, PRIVATE_KEY1);
    expect(result).to.be.equal(
      '0x7c15eb760c394b0ca49496e71d841378d8bfd4f9fb67e930eb5531485329ab7c67068d1f8ef4b480ec327214ee6ed203687e3fbe74b92367b259281e340d16fd1c'
    );
  });

  it('should return signature by signing typed data hash', async () => {
    const typedDataHash = TypedDataEncoder.hash(
      {name: 'Example', version: '1', chainId: 270},
      {
        Person: [
          {name: 'name', type: 'string'},
          {name: 'age', type: 'uint8'},
        ],
      },
      {name: 'John', age: 30}
    );
    const result = await signPayloadWithECDSA(typedDataHash, PRIVATE_KEY1);
    expect(result).to.be.equal(
      '0xbcaf0673c0c2b0e120165d207d42281d0c6e85f0a7f6b8044b0578a91cf5bda66b4aeb62aca4ae17012a38d71c9943e27285792fa7d788d848f849e3ea2e614b1b'
    );
  });
});

describe('signPayloadWithMultipleECDSA()', () => {
  const ADDRESS1 = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
  const PRIVATE_KEY1 =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
  const ADDRESS2 = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618';
  const PRIVATE_KEY2 =
    '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3';

  it('should return signature by signing EIP712 transaction hash', async () => {
    const tx: TransactionRequest = {
      chainId: 270,
      from: ADDRESS1,
      to: ADDRESS2,
      value: 7_000_000_000,
    };

    const txHash = EIP712Signer.getSignedDigest(tx);

    const result = await signPayloadWithMultipleECDSA(txHash, [
      PRIVATE_KEY1,
      PRIVATE_KEY2,
    ]);
    expect(result).to.be.equal(
      '0x89905d36a3cdde117445d6c58627061a53f09cf0535d73719d82d4d96fe332541167e2e3d38ce3cb2751a0203eff2a71f55ad45dc91623587f5480ec1883281b1bca3afd539deed6935f0a6ab5ec807d9bf292f90fb2f2aa447f1072fa9b2503a2576b47e8e9a340b3e2ee9fce3e90af8377ce790a9c7f730402db757b36c4d0e01b'
    );
  });

  it('should return signature by signing message hash', async () => {
    const message = 'Hello World!';
    const messageHash = hashMessage(message);

    const result = await signPayloadWithMultipleECDSA(messageHash, [
      PRIVATE_KEY1,
      PRIVATE_KEY2,
    ]);
    expect(result).to.be.equal(
      '0x7c15eb760c394b0ca49496e71d841378d8bfd4f9fb67e930eb5531485329ab7c67068d1f8ef4b480ec327214ee6ed203687e3fbe74b92367b259281e340d16fd1c2f2f4a312d23de1bcadff9c547fe670a9e21beae16a7c9688fc10b97ba2e286574de339c2b70bd3f02bd021c270a1405942cc3e1268bf3f7a7a419a1c7aea2db1c'
    );
  });

  it('should return signature by signing typed data hash', async () => {
    const typedDataHash = TypedDataEncoder.hash(
      {name: 'Example', version: '1', chainId: 270},
      {
        Person: [
          {name: 'name', type: 'string'},
          {name: 'age', type: 'uint8'},
        ],
      },
      {name: 'John', age: 30}
    );
    const result = await signPayloadWithMultipleECDSA(typedDataHash, [
      PRIVATE_KEY1,
      PRIVATE_KEY2,
    ]);
    expect(result).to.be.equal(
      '0xbcaf0673c0c2b0e120165d207d42281d0c6e85f0a7f6b8044b0578a91cf5bda66b4aeb62aca4ae17012a38d71c9943e27285792fa7d788d848f849e3ea2e614b1b8231ec20acfc86483b908e8f1e88c917b244465c7e73202b6f2643377a6e54f5640f0d3e2f5902695faec96668b2e998148c49a4de613bb7bc4325a3c855cf6a1b'
    );
  });
});

describe('populateTransaction()', () => {
  const provider = Provider.getDefaultProvider(types.Network.Localhost);

  it('should populate `tx.from` to address derived from private key if it not set', async () => {
    const tx: TransactionRequest = {
      chainId: 270,
      to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
      value: 7_000_000_000n,
      type: 113,
      data: '0x',
      gasPrice: 100_000_000n,
      gasLimit: 156_726n,
      customData: {
        gasPerPubdata: 50_000,
        factoryDeps: [],
      },
      from: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    };

    const result = await populateTransactionECDSA(
      {
        chainId: 270,
        to: ADDRESS2,
        value: 7_000_000_000,
      },
      PRIVATE_KEY1,
      provider
    );
    expect(result).to.be.deepEqualExcluding(tx, ['nonce']);
  });

  it('should throw an error when provider is not set', async () => {
    const tx: TransactionRequest = {
      chainId: 270,
      from: ADDRESS1,
      to: ADDRESS2,
      value: 7_000_000_000,
    };

    try {
      await populateTransactionECDSA(tx, PRIVATE_KEY1);
    } catch (error) {
      expect((error as Error).message).to.be.equal(
        'Provider is required but is not provided!'
      );
    }
  });
});

describe('populateTransactionMultisig()', () => {
  it('should throw an error when multiple keys are not provided', async () => {
    const tx: TransactionRequest = {
      chainId: 270,
      from: ADDRESS1,
      to: ADDRESS2,
      value: 7_000_000_000,
    };

    try {
      await populateTransactionMultisigECDSA(tx, PRIVATE_KEY1);
    } catch (error) {
      expect((error as Error).message).to.be.equal(
        'Multiple keys are required to build the transaction!'
      );
    }
  });
});
