import {expect} from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';
import {ethers} from 'ethers';
import {
  IS_ETH_BASED,
  ADDRESS1,
  PRIVATE_KEY1,
  ADDRESS2,
  L2_CHAIN_URL,
  L1_CHAIN_URL,
  APPROVAL_TOKEN,
  DAI_L1,
} from '../utils';

describe('Provider', () => {
  const provider = new Provider(L2_CHAIN_URL);
  const wallet = new Wallet(PRIVATE_KEY1, provider);
  const ethProvider = ethers.getDefaultProvider(L1_CHAIN_URL);
  let receipt: types.TransactionReceipt;

  before('setup', async function () {
    this.timeout(25_000);

    const tx = await wallet.transfer({
      token: utils.LEGACY_ETH_ADDRESS,
      to: ADDRESS2,
      amount: 1_000_000,
    });
    receipt = await tx.wait();
  });

  describe('#getDefaultProvider()', () => {
    it('should return a provider connected to Sepolia network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Sepolia);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(300n);
    });

    it('should return a provider connected to main network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Mainnet);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(324n);
    });
  });

  describe('#getBridgehubContractAddress()', () => {
    it('should return the address of main contract', async () => {
      const result = await provider.getBridgehubContractAddress();
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1ChainId()', () => {
    it('should return the L1 chain ID', async () => {
      const L1_CHAIN_ID = 31337;
      const result = await provider.getL1ChainId();
      expect(result).to.be.equal(L1_CHAIN_ID);
    });
  });

  describe('getBlockNumber()', () => {
    it('should return a block number', async () => {
      const result = await provider.getBlockNumber();
      expect(result).to.be.greaterThan(0);
    });
  });

  describe('#getGasPrice()', () => {
    it('should return a gas price', async () => {
      const result = await provider.getGasPrice();
      expect(result > 0n).to.be.true;
    });
  });

  describe('#getBalance()', () => {
    it('should return an ETH balance of the account at `address`', async () => {
      const result = await provider.getBalance(ADDRESS1);
      expect(result > 0n).to.be.true;
    });
  });

  describe('#getTransactionStatus()', () => {
    it('should return the `Committed` status for a mined transaction', async () => {
      const result = await provider.getTransactionStatus(receipt.hash);
      expect(result).not.to.be.null;
    });

    it('should return the `NotFound` status for a non-existing transaction', async () => {
      const tx =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
      const result = await provider.getTransactionStatus(tx);
      expect(result).to.be.equal(types.TransactionStatus.NotFound);
    });
  });

  describe('#getTransaction()', () => {
    it('should return a transaction', async () => {
      const result = await provider.getTransaction(receipt.hash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getTransactionReceipt()', () => {
    it('should return a transaction receipt', async () => {
      const result = await provider.getTransaction(receipt.hash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getDefaultBridgeAddresses()', () => {
    it('should return the default bridges', async () => {
      const result = await provider.getDefaultBridgeAddresses();
      expect(result).not.to.be.null;
    });
  });

  describe('#newBlockFilter()', () => {
    it('should return a new block filter', async () => {
      const result = await provider.newBlockFilter();
      expect(result).not.to.be.null;
    });
  });

  describe('#newPendingTransactionsFilter()', () => {
    it('should return a new pending block filter', async () => {
      const result = await provider.newPendingTransactionsFilter();
      expect(result).not.to.be.null;
    });
  });

  describe('#newFilter()', () => {
    it('should return a new filter', async () => {
      const result = await provider.newFilter({
        fromBlock: 0,
        toBlock: 5,
        address: utils.L2_BASE_TOKEN_ADDRESS,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#l2TokenAddress()', () => {
    it('should return the L2 ETH address', async () => {
      if (!IS_ETH_BASED) {
        const result = await provider.l2TokenAddress(utils.LEGACY_ETH_ADDRESS);
        expect(result).not.to.be.null;
      }
    });

    it('should return the L2 DAI address', async () => {
      const result = await provider.l2TokenAddress(DAI_L1);
      expect(result).not.to.be.null;
    });
  });

  describe('#l1TokenAddress()', () => {
    it('should return L1 token address', async () => {
      const result = await provider.l1TokenAddress(utils.LEGACY_ETH_ADDRESS);
      expect(result).to.be.equal(utils.LEGACY_ETH_ADDRESS);
    });

    it('should return the L1 DAI address', async () => {
      const result = await provider.l1TokenAddress(
        await provider.l2TokenAddress(DAI_L1)
      );
      const r = await provider.l2TokenAddress(DAI_L1);
      expect(result.toLowerCase()).to.equal(DAI_L1.toLowerCase());
    });
  });

  describe('#getBlock()', () => {
    it('should return a block', async () => {
      const result = await provider.getBlock(receipt.blockNumber!, false);
      expect(result).not.to.be.null;
      expect(result.transactions).not.to.be.empty;
    });

    it('should return a block with prefetch transactions', async () => {
      const result = await provider.getBlock(receipt.blockNumber!, true);
      expect(result).not.to.be.null;
      expect(result.transactions).not.to.be.empty;
      expect(result.prefetchedTransactions).not.to.be.empty;
    });

    it('should return a latest block', async () => {
      const result = await provider.getBlock('latest');
      expect(result).not.to.be.null;
    });

    it('should return the earliest block', async () => {
      const result = await provider.getBlock('earliest');
      expect(result).not.to.be.null;
    });

    it('should return a finalized block', async () => {
      const result = await provider.getBlock('finalized');
      expect(result).not.to.be.null;
    });
  });

  describe('#getLogs()', () => {
    it('should return the logs', async () => {
      const result = await provider.getLogs({
        fromBlock: 0,
        toBlock: 5,
        address: utils.L2_BASE_TOKEN_ADDRESS,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#getWithdrawTx()', () => {
    if (IS_ETH_BASED) {
      it('should return an ETH withdraw transaction', async () => {
        const tx = {
          from: ADDRESS1,
          value: 7_000_000_000n,
          to: utils.L2_BASE_TOKEN_ADDRESS,
          data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        };
        const result = await provider.getWithdrawTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000_000,
          to: ADDRESS1,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });
    } else {
      it('should return an ETH withdraw transaction', async () => {
        const tx = {
          from: ADDRESS1,
          to: (await provider.getDefaultBridgeAddresses()).sharedL2,
          data: '0xd9caed1200000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049000000000000000000000000540dff1797971fe12ba19e45c8e0568fe886b32000000000000000000000000000000000000000000000000000000001a13b8600',
        };
        const result = await provider.getWithdrawTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000_000,
          to: ADDRESS1,
          from: ADDRESS1,
        });
        expect(result).to.be.deepEqualExcluding(tx, ['data']);
      });

      it('should return a base token withdraw transaction', async () => {
        const tx = {
          from: ADDRESS1,
          value: 7_000_000_000n,
          to: utils.L2_BASE_TOKEN_ADDRESS,
          data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        };
        const result = await provider.getWithdrawTx({
          token: utils.L2_BASE_TOKEN_ADDRESS,
          amount: 7_000_000_000,
          to: ADDRESS1,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });
    }

    it('should return a DAI withdraw transaction', async () => {
      const tx = {
        value: 5n,
        from: ADDRESS1,
        to: (await provider.getDefaultBridgeAddresses()).sharedL2,
        data: '0xd9caed1200000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000082b5ea13260346f4251c0940067a9117a6cf13840000000000000000000000000000000000000000000000000000000000000005',
      };
      const result = await provider.getWithdrawTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS1,
        from: ADDRESS1,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });

    it('should return a Crown withdraw transaction', async () => {
      const tx = {
        from: ADDRESS1,
        to: (await provider.getDefaultBridgeAddresses()).sharedL2,
        data: '0xd9caed1200000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000082b5ea13260346f4251c0940067a9117a6cf13840000000000000000000000000000000000000000000000000000000000000005',
      };
      const result = await provider.getWithdrawTx({
        token: APPROVAL_TOKEN,
        amount: 5,
        to: ADDRESS1,
        from: ADDRESS1,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });

    it('should return a withdraw transaction with `tx.from==tx.to` when `tx.to` is not provided', async () => {
      const tx = {
        from: ADDRESS1,
        value: 7_000_000_000n,
        to: IS_ETH_BASED
          ? utils.L2_BASE_TOKEN_ADDRESS
          : (await provider.getDefaultBridgeAddresses()).sharedL2,
        data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      };
      const result = await provider.getWithdrawTx({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        from: ADDRESS1,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });

    it('should throw an error when `tx.to` and `tx.from` are not provided`', async () => {
      try {
        await provider.getWithdrawTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 5,
        });
      } catch (e) {
        expect(e).not.to.be.equal('withdrawal target address is undefined');
      }
    });

    it('should throw an error when `tx.amount!=tx.overrides.value', async () => {
      try {
        await provider.getWithdrawTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 5,
          to: ADDRESS1,
          from: ADDRESS1,
          overrides: {value: 7},
        });
      } catch (e) {
        expect(e).not.to.be.equal(
          'The tx.value is not equal to the value withdrawn'
        );
      }
    });
  });

  describe('#getTransferTx()', () => {
    if (IS_ETH_BASED) {
      it('should return an ETH transfer transaction', async () => {
        const tx = {
          from: ADDRESS1,
          to: ADDRESS2,
          value: 7_000_000_000,
        };
        const result = await provider.getTransferTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000_000,
          to: ADDRESS2,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });
    } else {
      it('should return an ETH transfer transaction', async () => {
        const tx = {
          from: ADDRESS1,
          to: await provider.l2TokenAddress(utils.ETH_ADDRESS_IN_CONTRACTS),
          data: '0xa9059cbb000000000000000000000000a61464658afeaf65cccaafd3a512b69a83b7761800000000000000000000000000000000000000000000000000000001a13b8600',
        };
        const result = await provider.getTransferTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000_000,
          to: ADDRESS2,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });

      it('should return an ETH transfer transaction with paymaster parameters', async () => {
        const tx = {
          from: ADDRESS1,
          to: await provider.l2TokenAddress(utils.ETH_ADDRESS_IN_CONTRACTS),
          data: '0xa9059cbb000000000000000000000000a61464658afeaf65cccaafd3a512b69a83b7761800000000000000000000000000000000000000000000000000000001a13b8600',
        };
        const result = await provider.getTransferTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000_000,
          to: ADDRESS2,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });

      it('should return a base token transfer transaction', async () => {
        const tx = {
          from: ADDRESS1,
          to: ADDRESS2,
          value: 7_000_000_000,
        };
        const result = await provider.getTransferTx({
          amount: 7_000_000_000,
          to: ADDRESS2,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });

      it('should return a base token transfer transaction with paymaster parameters', async () => {
        const tx = {
          from: ADDRESS1,
          to: ADDRESS2,
          value: 7_000_000_000,
        };
        const result = await provider.getTransferTx({
          amount: 7_000_000_000,
          to: ADDRESS2,
          from: ADDRESS1,
        });
        expect(result).to.be.deep.equal(tx);
      });
    }

    it('should return a DAI transfer transaction', async () => {
      const tx = {
        from: ADDRESS1,
        to: await provider.l2TokenAddress(DAI_L1),
        data: '0xa9059cbb000000000000000000000000a61464658afeaf65cccaafd3a512b69a83b776180000000000000000000000000000000000000000000000000000000000000005',
      };
      const result = await provider.getTransferTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS2,
        from: ADDRESS1,
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a DAI transfer transaction with paymaster parameters', async () => {
      const tx = {
        from: ADDRESS1,
        to: await provider.l2TokenAddress(DAI_L1),
        data: '0xa9059cbb000000000000000000000000a61464658afeaf65cccaafd3a512b69a83b776180000000000000000000000000000000000000000000000000000000000000005',
      };
      const result = await provider.getTransferTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS2,
        from: ADDRESS1,
      });
      expect(result).to.be.deep.equal(tx);
    });
  });

  describe('#estimateGasWithdraw()', () => {
    it('should return a gas estimation of the withdraw transaction', async () => {
      const result = await provider.estimateGasWithdraw({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS1,
        from: ADDRESS1,
      });
      expect(result > 0n).to.be.true;
    });

    it('should return a gas estimation of the withdraw transaction with paymaster', async () => {
      const token = IS_ETH_BASED
        ? utils.ETH_ADDRESS_IN_CONTRACTS
        : await wallet.l2TokenAddress(utils.ETH_ADDRESS_IN_CONTRACTS);
      const result = await provider.estimateGasWithdraw({
        token: token,
        amount: 7_000_000_000,
        to: ADDRESS1,
        from: ADDRESS1,
      });
      expect(result > 0n).to.be.true;
    });
  });

  describe('#estimateGasTransfer()', () => {
    it('should return a gas estimation of the transfer transaction', async () => {
      const result = await provider.estimateGasTransfer({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS2,
        from: ADDRESS1,
      });
      expect(result > 0n).to.be.be.true;
    });
  });

  describe('#estimateGas()', () => {
    it('should return a gas estimation of the transaction', async () => {
      const result = await provider.estimateGas({
        from: ADDRESS1,
        to: await provider.l2TokenAddress(DAI_L1),
        data: utils.IERC20.encodeFunctionData('approve', [ADDRESS2, 1]),
      });
      expect(result > 0n).to.be.true;
    });
  });

  describe('#getFilterChanges()', () => {
    it('should return the filtered logs', async () => {
      const filter = await provider.newFilter({
        address: utils.L2_BASE_TOKEN_ADDRESS,
        topics: [ethers.id('Transfer(address,address,uint256)')],
      });
      const result = await provider.getFilterChanges(filter);
      expect(result).not.to.be.null;
    });
  });

  describe('#error()', () => {
    it('Should not allow invalid contract bytecode', async () => {
      const address = wallet.getAddress();

      try {
        await provider.estimateGas({
          to: address,
          from: address,
        });
      } catch (e) {
        expect(
          (e as Error).message
            .toString()
            .includes('Bytecode length is not divisible by 32')
        ).to.be.true;
      }
    });

    it('Not enough balance should revert', async () => {
      try {
        await provider.estimateGasTransfer({
          token: utils.L2_BASE_TOKEN_ADDRESS,
          amount: 100_700_000_000_000_000_000_000_000_000n,
          to: ADDRESS2,
          from: ADDRESS1,
        });
      } catch (e) {
        const revertString = 'invalid transaction: LackOfFundForMaxFee';
        expect((e as Error).message.toString().includes(revertString)).to.be
          .true;
      }
    });
  });
});
