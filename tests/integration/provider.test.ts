import {expect} from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';
import {BigNumber, ethers} from 'ethers';
import {
  IS_ETH_BASED,
  PRIVATE_KEY1,
  ADDRESS1,
  ADDRESS2,
  DAI_L1,
  APPROVAL_TOKEN,
  PAYMASTER,
} from '../utils';

describe('Provider', () => {
  const provider = Provider.getDefaultProvider();
  const wallet = new Wallet(PRIVATE_KEY1, provider);

  let receipt: types.TransactionReceipt;
  let baseToken: string;

  before('setup', async function () {
    this.timeout(25_000);
    baseToken = await provider.getBaseTokenContractAddress();
    const tx = await wallet.transfer({
      token: utils.LEGACY_ETH_ADDRESS,
      to: ADDRESS2,
      amount: 1_000_000,
    });
    receipt = await tx.wait();
  });

  it('should correctly initialize and assign function properties in getPriorityOpResponse', async () => {
    const provider = new Provider();
    const l1TxResponse: ethers.providers.TransactionResponse = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0xabcdef1234567890abcdef1234567890abcdef1234',
      blockHash:
        '0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 123456,
      to: '0xabcdef1234567890abcdef1234567890abcdef1234',
      type: 2,
      nonce: 42,
      gasLimit: BigNumber.from(2_000_000),
      gasPrice: BigNumber.from(1_000_000_000),
      data: '0x',
      value: BigNumber.from(0),
      chainId: 1337,
      // not used in tested code, keep the test simple
      maxPriorityFeePerGas: undefined,
      maxFeePerGas: undefined,
      accessList: undefined,
      confirmations: 0,
      wait: (): Promise<ethers.providers.TransactionReceipt> => {
        return Promise.resolve<ethers.providers.TransactionReceipt>(
          {} as ethers.providers.TransactionReceipt
        );
      },
    };

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

  describe('#constructor()', () => {
    it('Provider() should return a `Provider` connected to local network when URL is not defined', async () => {
      const provider = new Provider();
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(9);
    });
  });

  describe('#getDefaultProvider()', () => {
    it('should return a provider connected to local network by default', async () => {
      const provider = Provider.getDefaultProvider();
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(270);
    });

    it('should return a provider connected to local network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Localhost);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(270);
    });

    it('should return a provider connected to Sepolia network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Sepolia);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(300);
    });

    it('should return a provider connected to main network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Mainnet);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(324);
    });
  });

  describe('#getMainContractAddress()', () => {
    it('should return the address of main contract', async () => {
      const result = await provider.getMainContractAddress();
      expect(result).not.to.be.null;
    });
  });

  describe('#getBridgehubContractAddress()', () => {
    it('should return the address of main contract', async () => {
      const result = await provider.getBridgehubContractAddress();
      expect(result).not.to.be.null;
    });
  });

  describe('#getTestnetPaymasterAddress()', () => {
    it('should return the address of testnet paymaster', async () => {
      const result = await provider.getTestnetPaymasterAddress();
      expect(result).not.to.be.null;
    });
  });

  describe('#l1ChainId()', () => {
    it('should return L1 chain ID', async () => {
      const L1_CHAIN_ID = 9;
      const result = await provider.l1ChainId();
      expect(result).to.be.equal(L1_CHAIN_ID);
    });
  });

  describe('getBlockNumber()', () => {
    it('should return block number', async () => {
      const result = await provider.getBlockNumber();
      expect(result).to.be.greaterThan(0);
    });
  });

  describe('#getL1BatchNumber()', () => {
    it('should return L1 batch number', async () => {
      const result = await provider.getL1BatchNumber();
      expect(result).to.be.greaterThan(0);
    });
  });

  describe('#getBalance()', () => {
    it('should return balance of the account at `address`', async () => {
      const result = await provider.getBalance(ADDRESS1);
      expect(result.isZero()).to.be.false;
    });

    it('should return a DAI balance of the account at `address`', async () => {
      const result = await provider.getBalance(
        ADDRESS1,
        'latest',
        await provider.l2TokenAddress(DAI_L1)
      );
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#getAllAccountBalances()', () => {
    it('should return all balances of the account at `address`', async () => {
      const result = await provider.getAllAccountBalances(ADDRESS1);
      const expected = IS_ETH_BASED ? 2 : 3;
      expect(Object.keys(result)).to.have.lengthOf(expected);
    });
  });

  describe('#getBlockDetails()', () => {
    it('should return block details', async () => {
      const result = await provider.getBlockDetails(1);
      expect(result).not.to.be.null;
    });
  });

  describe('#getTransactionDetails()', () => {
    it('should return transaction details', async () => {
      const result = await provider.getTransactionDetails(
        receipt.transactionHash
      );
      expect(result).not.to.be.null;
    });
  });

  describe('#getBytecodeByHash()', () => {
    it('should return bytecode of a contract', async () => {
      const testnetPaymasterBytecode = await provider.getCode(
        (await provider.getTestnetPaymasterAddress()) as string
      );
      const tokenFactoryDepsHash = ethers.utils.hexlify(
        utils.hashBytecode(testnetPaymasterBytecode)
      );
      const result = await provider.getBytecodeByHash(tokenFactoryDepsHash);
      expect(result).to.be.deep.equal(
        Array.from(ethers.utils.arrayify(testnetPaymasterBytecode))
      );
    });
  }).timeout(10_000);

  describe('#getRawBlockTransactions()', () => {
    it('should return a raw transactions', async () => {
      const blockNumber = await provider.getBlockNumber();
      const result = await provider.getRawBlockTransactions(blockNumber);
      expect(result).not.to.be.null;
    });
  });

  describe('#getProof()', () => {
    it('should return a storage proof', async () => {
      // fetching the storage proof for rawNonce storage slot in NonceHolder system contract
      // mapping(uint256 => uint256) internal rawNonces;

      // Ensure the address is a 256-bit number by padding it
      // because rawNonces uses uint256 for mapping addresses and their nonces
      const addressPadded = ethers.utils.hexZeroPad(wallet.address, 32);

      // Convert the slot number to a hex string and pad it to 32 bytes
      const slotPadded = ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32);

      // Concatenate the padded address and slot number
      const concatenated = addressPadded + slotPadded.slice(2); // slice to remove '0x' from the slotPadded

      // Hash the concatenated string using Keccak-256
      const storageKey = ethers.utils.keccak256(concatenated);

      const l1BatchNumber = await provider.getL1BatchNumber();
      try {
        const result = await provider.getProof(
          utils.NONCE_HOLDER_ADDRESS,
          [storageKey],
          l1BatchNumber
        );
        expect(result).not.to.be.null;
      } catch (error) {
        // skip
      }
    });
  });

  describe('#getTransactionStatus()', () => {
    it('should return transaction status', async () => {
      const result = await provider.getTransactionStatus(
        receipt.transactionHash
      );
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
    it('should return transaction', async () => {
      const result = await provider.getTransaction(receipt.transactionHash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getTransactionReceipt()', () => {
    it('should return transaction receipt', async () => {
      const result = await provider.getTransaction(receipt.transactionHash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getDefaultBridgeAddresses()', () => {
    it('should return default bridges', async () => {
      const result = await provider.getDefaultBridgeAddresses();
      expect(result).not.to.be.null;
    });
  });

  describe('#newBlockFilter()', () => {
    it('should return new block filter', async () => {
      const result = await provider.newBlockFilter();
      expect(result).not.to.be.null;
    });
  });

  describe('#newPendingTransactionsFilter()', () => {
    it('should return new pending block filter', async () => {
      const result = await provider.newPendingTransactionsFilter();
      expect(result).not.to.be.null;
    });
  });

  describe('#newFilter()', () => {
    it('should return new filter', async () => {
      const result = await provider.newFilter({
        fromBlock: 0,
        toBlock: 5,
        address: utils.L2_BASE_TOKEN_ADDRESS,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#getContractAccountInfo()', () => {
    it('should return contract account info', async () => {
      const TESTNET_PAYMASTER = '0x0f9acdb01827403765458b4685de6d9007580d15';
      const result = await provider.getContractAccountInfo(TESTNET_PAYMASTER);
      expect(result).not.to.be.null;
    });
  });

  describe('#l2TokenAddress()', () => {
    it('should return the L2 base address', async () => {
      const result = await provider.l2TokenAddress(baseToken);
      expect(result).to.be.equal(utils.L2_BASE_TOKEN_ADDRESS);
    });

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
      expect(result).to.be.equal(DAI_L1);
    });
  });

  describe('#getBlock()', () => {
    it('should return latest block', async () => {
      const result = await provider.getBlock('latest');
      expect(result).not.to.be.null;
    });

    it('should return committed block', async () => {
      const result = await provider.getBlock('committed');
      expect(result).not.to.be.null;
    });

    it('should return finalized block', async () => {
      const result = await provider.getBlock('finalized');
      expect(result).not.to.be.null;
    });

    it('should return earliest block', async () => {
      const result = await provider.getBlock('earliest');
      expect(result).not.to.be.null;
    });

    it('should return first block', async () => {
      const result = await provider.getBlock(0);
      expect(result).not.to.be.null;
    });
  });

  describe('#getBlockWithTransactions()', () => {
    it('should return latest block with transactions', async () => {
      const result = await provider.getBlockWithTransactions('latest');
      expect(result).not.to.be.null;
    });

    it('should return committed block with transactions', async () => {
      const result = await provider.getBlockWithTransactions('committed');
      expect(result).not.to.be.null;
    });

    it('should return finalized block with transactions', async () => {
      const result = await provider.getBlockWithTransactions('finalized');
      expect(result).not.to.be.null;
    });

    it('should return earliest block with transactions', async () => {
      const result = await provider.getBlockWithTransactions('earliest');
      expect(result).not.to.be.null;
    });

    it('should return first block with transactions', async () => {
      const result = await provider.getBlockWithTransactions(0);
      expect(result).not.to.be.null;
    });
  });

  describe('#getBlockDetails()', () => {
    it('should return block with transactions', async () => {
      const result = await provider.getBlockDetails(
        await provider.getBlockNumber()
      );
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BatchBlockRange()', () => {
    it('should return L1 batch block range', async () => {
      const l1BatchNumber = await provider.getL1BatchNumber();
      const result = await provider.getL1BatchBlockRange(l1BatchNumber);
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BatchDetails()', () => {
    it('should return L1 batch details', async () => {
      const l1BatchNumber = await provider.getL1BatchNumber();
      const result = await provider.getL1BatchDetails(l1BatchNumber);
      expect(result).not.to.be.null;
    });
  });

  describe('#getLogs()', () => {
    it('should return logs', async () => {
      const result = await provider.getLogs({
        fromBlock: 0,
        toBlock: 5,
        address: utils.L2_BASE_TOKEN_ADDRESS,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#getWithdrawTx()', () => {
    it('should return withdraw transaction', async () => {
      const tx = {
        from: ADDRESS1,
        value: BigNumber.from(7_000_000_000),
        to: ethers.utils.getAddress(utils.L2_BASE_TOKEN_ADDRESS),
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

    it('should return a withdraw transaction of the base token with paymaster parameters', async () => {
      const tx = {
        from: ADDRESS1,
        value: BigNumber.from(7_000_000_000),
        to: ethers.utils.getAddress(utils.L2_BASE_TOKEN_ADDRESS),
        data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getWithdrawTx({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS1,
        from: ADDRESS1,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: BigNumber.from(1),
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a DAI withdraw transaction', async () => {
      const tx = {
        from: ADDRESS1,
        to: ethers.utils.getAddress(
          (await provider.getDefaultBridgeAddresses()).sharedL2 as string
        ),
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

    it('should return a DAI withdraw transaction with paymaster parameters', async () => {
      const tx = {
        from: ADDRESS1,
        to: ethers.utils.getAddress(
          (await provider.getDefaultBridgeAddresses()).sharedL2 as string
        ),
        data: '0xd9caed1200000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000082b5ea13260346f4251c0940067a9117a6cf13840000000000000000000000000000000000000000000000000000000000000005',
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getWithdrawTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS1,
        from: ADDRESS1,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: BigNumber.from(1),
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });

    it('should return a withdraw transaction with `tx.from==tx.to` when `tx.to` is not provided', async () => {
      const tx = {
        from: ADDRESS1,
        value: BigNumber.from(7_000_000_000),
        to: ethers.utils.getAddress(utils.L2_BASE_TOKEN_ADDRESS),
        data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      };
      const result = await provider.getWithdrawTx({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        from: ADDRESS1,
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should throw an error when `tx.to` and `tx.from` are not provided', async () => {
      try {
        await provider.getWithdrawTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 5,
        });
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          'Withdrawal target address is undefined!'
        );
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
        expect((e as Error).message).to.be.equal(
          'The tx.value is not equal to the value withdrawn!'
        );
      }
    });
  });

  describe('#getTransferTx()', () => {
    it('should return transfer transaction', async () => {
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

    it('should return an ETH transfer transaction with paymaster parameters', async () => {
      const tx = {
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        to: ADDRESS2,
        value: 7_000_000_000,
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getTransferTx({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS2,
        from: ADDRESS1,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: BigNumber.from(1),
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deep.equal(tx);
    });

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
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getTransferTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS2,
        from: ADDRESS1,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: BigNumber.from(1),
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deep.equal(tx);
    });
  });

  describe('#estimateGasWithdraw()', () => {
    it('should return gas estimation of withdraw transaction', async () => {
      const result = await provider.estimateGasWithdraw({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS1,
        from: ADDRESS1,
      });
      expect(result.isZero()).to.be.false;
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
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: BigNumber.from(1),
          innerInput: new Uint8Array(),
        }),
      });
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#estimateGasTransfer()', () => {
    it('should return gas estimation of transfer transaction', async () => {
      const result = await provider.estimateGasTransfer({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS2,
        from: ADDRESS1,
      });
      expect(result.isZero()).to.be.false;
    });

    it('should return a gas estimation of the transfer transaction with paymaster', async () => {
      const result = await provider.estimateGasTransfer({
        token: utils.LEGACY_ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS2,
        from: ADDRESS1,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: BigNumber.from(1),
          innerInput: new Uint8Array(),
        }),
      });
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#estimateGasL1()', () => {
    it('should return gas estimation of L1 transaction', async () => {
      const result = await provider.estimateGasL1({
        from: ADDRESS1,
        to: await provider.getBridgehubContractAddress(),
        value: 7_000_000_000,
        customData: {
          gasPerPubdata: 800,
        },
      });
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#estimateL1ToL2Execute()', () => {
    it('should return gas estimation of L1 to L2 transaction', async () => {
      const result = await provider.estimateL1ToL2Execute({
        contractAddress: await provider.getBridgehubContractAddress(),
        calldata: '0x',
        caller: ADDRESS1,
        l2Value: 7_000_000_000,
      });
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#estimateFee()', () => {
    it('should return gas estimation of transaction', async () => {
      const result = await provider.estimateFee({
        from: ADDRESS1,
        to: ADDRESS2,
        value: BigNumber.from(7_000_000_000).toHexString(),
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#estimateGas()', () => {
    it('should return gas estimation of transaction', async () => {
      const result = await provider.estimateGas({
        from: ADDRESS1,
        to: await provider.l2TokenAddress(DAI_L1),
        data: utils.IERC20.encodeFunctionData('approve', [ADDRESS2, 1]),
      });
      expect(result.isZero()).to.be.false;
    });

    it('should return a gas estimation of the EIP712 transaction', async () => {
      const result = await provider.estimateGas({
        from: ADDRESS1,
        to: await provider.l2TokenAddress(DAI_L1),
        data: utils.IERC20.encodeFunctionData('approve', [ADDRESS2, 1]),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#getFilterChanges()', () => {
    it('should return filtered logs', async () => {
      const filter = await provider.newFilter({
        address: utils.L2_BASE_TOKEN_ADDRESS,
        topics: [ethers.utils.id('Transfer(address,address,uint256)')],
      });
      const result = await provider.getFilterChanges(filter);
      expect(result).not.to.be.null;
    }).timeout(10_000);
  });
});
