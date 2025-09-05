import {expect} from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';
import {ADDRESS2, L2_CHAIN_URL, PRIVATE_KEY1} from '../utils';
import {Transaction} from 'ethers';
describe('types', () => {
  const provider = new Provider(L2_CHAIN_URL);
  const wallet = new Wallet(PRIVATE_KEY1, provider);

  describe('TransactionResponse', () => {
    let tx: types.TransactionResponse;

    before('setup', async function () {
      this.timeout(25_000);
      tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: 1_000_000,
      });
      await tx.wait();
    });

    describe('#getTransaction()', () => {
      it('should return the transaction response', async () => {
        const result = await tx.getTransaction();
        expect(result.hash).to.be.equal(tx.hash);
      });
    });

    describe('#getBlock()', () => {
      it('should return the block in which transaction is mined', async () => {
        const result = await tx.getBlock();
        expect(result).not.to.be.null;
      });
    });

    describe('#toJSON()', () => {
      it('should return the JSON representation of the transaction response', async () => {
        const result = tx.toJSON();
        expect(result).not.to.be.null;
      });
    });
  });

  describe('TransactionReceipt', () => {
    let receipt: types.TransactionReceipt;

    before('setup', async function () {
      this.timeout(25_000);
      const tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: 1_000_000,
      });
      receipt = await tx.wait();
    });

    describe('#getTransaction()', () => {
      it('should return the transaction receipt', async () => {
        const result = await receipt.getTransaction();
        expect(result.hash).to.be.equal(receipt.hash);
      });
    });

    describe('#getBlock()', () => {
      it('should return the block in which transaction is mined', async () => {
        const result = await receipt.getBlock();
        expect(result.hash).to.be.equal(receipt.blockHash);
      });
    });

    describe('#toJSON()', () => {
      it('should return the JSON representation of the transaction receipt', async () => {
        const result = receipt.toJSON();
        expect(result).not.to.be.null;
      });
    });
  });

  describe('Block', () => {
    let block: types.Block;

    before('setup', async function () {
      this.timeout(25_000);
      const tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: 1_000_000,
      });
      const receipt = await tx.wait();
      block = await provider.getBlock(receipt.blockHash, true);
    });

    describe('#getTransaction()', () => {
      it('should return the transaction in block based on provided index', async () => {
        const result = await block.getTransaction(0);
        expect(result).not.to.be.null;
      });
    });

    describe('#prefetchedTransactions()', () => {
      it('should throw an error when requesting pre-fetched transactions', async () => {
        try {
          block.getPrefetchedTransaction(0);
        } catch (e) {
          expect(
            (e as Error).message.startsWith(
              'transactions were not prefetched with block request'
            )
          ).to.be.true;
        }
      });
    });

    describe('#toJSON()', () => {
      it('should return the JSON representation of the block', async () => {
        const result = block.toJSON();
        expect(result).not.to.be.null;
      });
    });
  });

  describe('Log', () => {
    let log: types.Log;

    before('setup', async function () {
      this.timeout(25_000);
      const tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: 1_000_000,
      });
      const receipt = await tx.wait();
      log = new types.Log(
        {
          blockHash: receipt.blockHash,
          blockNumber: receipt.blockNumber,
          transactionHash: receipt.hash,
          transactionIndex: receipt.index,
          data: '0x',
          address: utils.L2_BASE_TOKEN_ADDRESS,
          index: 0,
          removed: false,
          topics: [],
          l1BatchNumber: 0,
        },
        provider
      );
    });

    describe('#getTransaction()', () => {
      it('should return the transaction response', async () => {
        const result = await log.getTransaction();
        expect(result.hash).to.be.equal(log.transactionHash);
      });
    });

    describe('#getTransactionReceipt()', () => {
      it('should return the transaction receipt', async () => {
        const result = await log.getTransaction();
        expect(result.hash).to.be.equal(log.transactionHash);
      });
    });

    describe('#getBlock()', () => {
      it('should return the block in which transaction is mined', async () => {
        const result = await log.getBlock();
        expect(result.hash).to.be.equal(log.blockHash);
      });
    });

    describe('#toJSON()', () => {
      it('should return the JSON representation of the transaction response', async () => {
        const result = log.toJSON();
        expect(result).not.to.be.null;
      });
    });
  });

  describe('Transaction', () => {
    let eip1559Tx: Transaction;

    before('setup', async function () {
      this.timeout(25_000);

      const signedLegacyTx = await wallet.signTransaction({
        type: 2,
        to: ADDRESS2,
        value: 1_000_000,
        nonce: 1,
      });
      eip1559Tx = Transaction.from(signedLegacyTx);
    });

    describe('#unsignedSerialized()', () => {
      it('should return the unsigned serialized EIP1559 transaction', async () => {
        const result = eip1559Tx.unsignedSerialized;
        expect(result).not.to.be.null;
      });
    });

    describe('#typeName()', () => {
      it('should return the type name of the EIP1559 transaction', async () => {
        const result = eip1559Tx.typeName;
        expect(result).to.be.equal('eip-1559');
      });
    });

    describe('#toJSON()', () => {
      it('should return the JSON representation of the EIP1559 transaction', async () => {
        const result = eip1559Tx.toJSON();
        expect(result).not.to.be.null;
      });
    });
  });
});
