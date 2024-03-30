import {expect} from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';

describe('types', () => {
  const PRIVATE_KEY =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
  const RECEIVER = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618';

  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  describe('TransactionResponse', () => {
    let tx: types.TransactionResponse;

    before('setup', async function () {
      this.timeout(25_000);
      tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: RECEIVER,
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
        to: RECEIVER,
        amount: 1_000_000,
      });
      await tx.wait();
      receipt = await provider.getTransactionReceipt(tx.hash);
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
        to: RECEIVER,
        amount: 1_000_000,
      });
      await tx.wait();
      const receipt = await provider.getTransactionReceipt(tx.hash);
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
        to: RECEIVER,
        amount: 1_000_000,
      });
      await tx.wait();
      const receipt = await provider.getTransactionReceipt(tx.hash);
      log = new types.Log(
        {
          blockHash: receipt.blockHash,
          blockNumber: receipt.blockNumber,
          transactionHash: receipt.hash,
          transactionIndex: receipt.index,
          data: '0x',
          address: utils.L2_ETH_TOKEN_ADDRESS,
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
    let eip712Tx: types.Transaction;
    let eip1559Tx: types.Transaction;

    before('setup', async function () {
      this.timeout(25_000);
      const signedEip712Tx = await wallet.signTransaction({
        type: utils.EIP712_TX_TYPE,
        to: RECEIVER,
        value: 1_000_000,
        nonce: 1,
      });
      eip712Tx = types.Transaction.from(signedEip712Tx);

      const signedLegacyTx = await wallet.signTransaction({
        to: RECEIVER,
        value: 1_000_000,
        nonce: 1,
      });
      eip1559Tx = types.Transaction.from(signedLegacyTx);
    });

    describe('#serialized()', () => {
      it('should return the serialized EIP1559 transaction', async () => {
        const tx =
          '0x02f87082010e01843b9aca008447868c008302719494a61464658afeaf65cccaafd3a512b69a83b77618830f424080c080a028a5a399b859e0dcc2aae91b20e5554cbffbd6767cbaceeb11f6df9f5cb74dc1a01c9034c1dce62f775e5f88c005850d36c32834cd0e105d5230d2b9785ec2bc90';
        const result = eip1559Tx.serialized;
        expect(result).to.be.equal(tx);
      });

      it('should return the serialized EIP712 transaction', async () => {
        const tx =
          '0x71f890018405f5e1008405f5e1008302662294a61464658afeaf65cccaafd3a512b69a83b77618830f42408082010e808082010e9436615cf349d7f6344891b1e7ca7c72883f5dc04984ffffffffc0b841c23a07fb6aa2f3f9fd1aa284b455799e37c5e70cdfc41c138ebf68ab005c1796242512709c548e9636fab11237cea25df965aaa81879f018023c7a41438887f91bc0';
        const result = eip712Tx.serialized;
        expect(result).to.be.equal(tx);
      });
    });

    describe('#unsignedSerialized()', () => {
      it('should return the unsigned serialized EIP1559 transaction', async () => {
        const tx =
          '0x02ed82010e01843b9aca008447868c008302719494a61464658afeaf65cccaafd3a512b69a83b77618830f424080c0';
        const result = eip1559Tx.unsignedSerialized;
        expect(result).to.be.equal(tx);
      });

      it('should return the unsigned serialized EIP712 transaction', async () => {
        const tx =
          '0x71f890018405f5e1008405f5e1008302662294a61464658afeaf65cccaafd3a512b69a83b77618830f42408082010e808082010e9436615cf349d7f6344891b1e7ca7c72883f5dc04984ffffffffc0b841c23a07fb6aa2f3f9fd1aa284b455799e37c5e70cdfc41c138ebf68ab005c1796242512709c548e9636fab11237cea25df965aaa81879f018023c7a41438887f91bc0';
        const result = eip712Tx.unsignedSerialized;
        expect(result).to.be.equal(tx);
      });
    });

    describe('#typeName()', () => {
      it('should return the type name of the EIP1559 transaction', async () => {
        const result = eip1559Tx.typeName;
        expect(result).to.be.equal('eip-1559');
      });

      it('should return the type name of the EIP712 transaction', async () => {
        const result = eip712Tx.typeName;
        expect(result).to.be.equal('zksync');
      });
    });

    describe('#toJSON()', () => {
      it('should return the JSON representation of the EIP1559 transaction', async () => {
        const result = eip1559Tx.toJSON();
        expect(result).not.to.be.null;
      });

      it('should return the JSON representation of the EIP712 transaction', async () => {
        const result = eip712Tx.toJSON();
        expect(result).not.to.be.null;
      });
    });
  });
});
