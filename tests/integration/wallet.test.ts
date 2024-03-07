import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';
import {ethers} from 'ethers';
import * as fs from 'fs';

const {expect} = chai;

import TokensL1 from '../tokens.json';

describe('Wallet', () => {
  const ADDRESS = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
  const PRIVATE_KEY =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
  const MNEMONIC =
    'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
  const RECEIVER = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618';

  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const ethProvider = ethers.getDefaultProvider('http://localhost:8545');
  const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

  const DAI_L1 = TokensL1[0].address;

  const TOKEN = '0x841c43Fa5d8fFfdB9efE3358906f7578d8700Dd4';
  const PAYMASTER = '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174';

  describe('#constructor()', () => {
    it('`Wallet(privateKey, provider)` should return a `Wallet` with L2 provider', async () => {
      const wallet = new Wallet(PRIVATE_KEY, provider);

      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
      expect(wallet.provider).to.be.equal(provider);
    });

    it('`Wallet(privateKey, provider, ethProvider)` should return a `Wallet` with L1 and L2 provider', async () => {
      const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
      expect(wallet.provider).to.be.equal(provider);
      expect(wallet.providerL1).to.be.equal(ethProvider);
    });
  });

  describe('#getMainContract()', () => {
    it('should return the main contract', async () => {
      const result = await wallet.getMainContract();
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BridgeContracts()', () => {
    it('should return the L1 bridge contracts', async () => {
      const result = await wallet.getL1BridgeContracts();
      expect(result).not.to.be.null;
    });
  });

  describe('#getBalanceL1()', () => {
    it('should return a L1 balance', async () => {
      const result = await wallet.getBalanceL1();
      expect(result > 0).to.be.true;
    });
  });

  describe('#getAllowanceL1()', () => {
    it('should return an allowance of L1 token', async () => {
      const result = await wallet.getAllowanceL1(DAI_L1);
      expect(result >= 0).to.be.true;
    });
  });

  describe('#l2TokenAddress()', () => {
    it('should return the L2 ETH address', async () => {
      const result = await wallet.l2TokenAddress(utils.ETH_ADDRESS);
      expect(result).to.be.equal(utils.ETH_ADDRESS);
    });

    it('should return the L2 DAI address', async () => {
      const result = await wallet.l2TokenAddress(DAI_L1);
      expect(result).not.to.be.null;
    });
  });

  describe('#approveERC20()', () => {
    it('should approve a L1 token', async () => {
      const tx = await wallet.approveERC20(DAI_L1, 5);
      const result = await tx.wait();
      expect(result).not.to.be.null;
    }).timeout(10_000);

    it('should throw an error when approving ETH token', async () => {
      try {
        await wallet.approveERC20(utils.ETH_ADDRESS, 5);
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          "ETH token can't be approved! The address of the token does not exist on L1."
        );
      }
    }).timeout(10_000);
  });

  describe('#getBaseCost()', () => {
    it('should return a base cost of L1 transaction', async () => {
      const result = await wallet.getBaseCost({gasLimit: 100_000});
      expect(result).not.to.be.null;
    });
  });

  describe('#getBalance()', () => {
    it('should return a `Wallet` balance', async () => {
      const result = await wallet.getBalance();
      expect(result > 0).to.be.true;
    });
  });

  describe('#getAllBalances()', () => {
    it('should return the all balances', async () => {
      const result = await wallet.getAllBalances();
      expect(Object.keys(result)).to.have.lengthOf(2);
    });
  });

  describe('#getL2BridgeContracts()', () => {
    it('should return a L2 bridge contracts', async () => {
      const result = await wallet.getL2BridgeContracts();
      expect(result).not.to.be.null;
    });
  });

  describe('#getAddress()', () => {
    it('should return the `Wallet` address', async () => {
      const result = await wallet.getAddress();
      expect(result).to.be.equal(ADDRESS);
    });
  });

  describe('#ethWallet()', () => {
    it('should return a L1 `Wallet`', async () => {
      const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
      const ethWallet = wallet.ethWallet();
      expect(ethWallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
      expect(ethWallet.provider).to.be.equal(ethProvider);
    });

    it('should throw  an error when L1 `Provider` is not specified in constructor', async () => {
      const wallet = new Wallet(PRIVATE_KEY, provider);
      try {
        wallet.ethWallet();
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          'L1 provider missing: use `connectToL1` to specify!'
        );
      }
    });
  });

  describe('#connect()', () => {
    it('should return a `Wallet` with provided `provider` as L2 provider', async () => {
      let wallet = new Wallet(PRIVATE_KEY);
      wallet = wallet.connect(provider);
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
      expect(wallet.provider).to.be.equal(provider);
    });
  });

  describe('#connectL1()', () => {
    it('should return a `Wallet` with provided `provider` as L1 provider', async () => {
      let wallet = new Wallet(PRIVATE_KEY);
      wallet = wallet.connectToL1(ethProvider);
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
      expect(wallet.providerL1).to.be.equal(ethProvider);
    });
  });

  describe('#getDeploymentNonce()', () => {
    it('should return a deployment nonce', async () => {
      const result = await wallet.getDeploymentNonce();
      expect(result).not.to.be.null;
    });
  });

  describe('#populateTransaction()', () => {
    it('should return a populated transaction', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000_000n,
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        gasLimit: 154_379n,
        chainId: 270n,
        data: '0x',
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
        gasPrice: 250_000_000n,
      };

      const result = await wallet.populateTransaction({
        type: utils.EIP712_TX_TYPE,
        to: RECEIVER,
        value: 7_000_000_000,
      });
      expect(result).to.be.deep.equal(tx);
    }).timeout(25_000);

    it('should return a populated transaction with default values if are omitted', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 2,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        maxFeePerGas: 1_500_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
      };
      const result = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });

    it('should return populated transaction when `maxFeePerGas` and `maxPriorityFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 113,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        data: '0x',
        chainId: 270n,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      };
      const result = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });

    it('should return populated transaction when `maxPriorityFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 113,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        data: '0x',
        chainId: 270n,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      };
      const result = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });

    it('should return populated transaction when `maxFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 113,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        data: '0x',
        chainId: 270n,
        maxFeePerGas: 3_500_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      };
      const result = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });

    it('should return populated EIP1559 transaction when `maxFeePerGas` and `maxPriorityFeePerGas` are provided', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 2,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      };
      const result = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });

    it('should return populated EIP1559 transaction with `maxFeePerGas` and `maxPriorityFeePerGas` same as provided `gasPrice`', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 2,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 3_500_000_000n,
      };
      const result = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        gasPrice: 3_500_000_000n,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });

    it('should return populated legacy transaction when `type = 0`', async () => {
      const tx = {
        to: RECEIVER,
        value: 7_000_000n,
        type: 0,
        from: ADDRESS,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        gasPrice: 250_000_000n,
      };
      const result = await wallet.populateTransaction({
        type: 0,
        to: RECEIVER,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
    });
  });

  describe('#sendTransaction()', () => {
    it('should send already populated transaction with provided `maxFeePerGas` and `maxPriorityFeePerGas` and `customData` fields', async () => {
      const populatedTx = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      const tx = await wallet.sendTransaction(populatedTx);
      const result = await tx.wait();
      expect(result).not.to.be.null;
    }).timeout(10_000);

    it('should send EIP1559 transaction when `maxFeePerGas` and `maxPriorityFeePerGas` are provided', async () => {
      const tx = await wallet.sendTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      });
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(2);
    }).timeout(10_000);

    it('should return already populated EIP1559 transaction with `maxFeePerGas` and `maxPriorityFeePerGas`', async () => {
      const populatedTx = await wallet.populateTransaction({
        to: RECEIVER,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      });

      const tx = await wallet.sendTransaction(populatedTx);
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(2);
    }).timeout(10_000);

    it('should send EIP1559 transaction with `maxFeePerGas` and `maxPriorityFeePerGas` same as provided `gasPrice`', async () => {
      const tx = await wallet.sendTransaction({
        to: RECEIVER,
        value: 7_000_000,
        gasPrice: 3_500_000_000n,
      });
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(2);
    }).timeout(10_000);

    it('should send legacy transaction when `type = 0`', async () => {
      const tx = await wallet.sendTransaction({
        type: 0,
        to: RECEIVER,
        value: 7_000_000,
      });
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(0);
    }).timeout(10_000);
  });

  describe('#fromMnemonic()', () => {
    it('should return a `Wallet` with the `provider` as L1 provider and a private key that is built from the `mnemonic` passphrase', async () => {
      const wallet = Wallet.fromMnemonic(MNEMONIC, ethProvider);
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
      expect(wallet.providerL1).to.be.equal(ethProvider);
    });
  });

  describe('#fromEncryptedJson()', () => {
    it('should return a `Wallet` from encrypted `json` file using provided `password`', async () => {
      const wallet = await Wallet.fromEncryptedJson(
        fs.readFileSync('tests/files/wallet.json', 'utf8'),
        'password'
      );
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
    }).timeout(5_000);
  });

  describe('#fromEncryptedJsonSync()', () => {
    it('should return a `Wallet` from encrypted `json` file using provided `password`', async () => {
      const wallet = Wallet.fromEncryptedJsonSync(
        fs.readFileSync('tests/files/wallet.json', 'utf8'),
        'password'
      );
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY);
    }).timeout(5_000);
  });

  describe('#createRandom()', () => {
    it('should return a random `Wallet` with L2 provider', async () => {
      const wallet = Wallet.createRandom(provider);
      expect(wallet.signingKey.privateKey).not.to.be.null;
      expect(wallet.provider).to.be.equal(provider);
    });
  });

  describe('#getDepositTx()', () => {
    it('should return an ETH deposit transaction', async () => {
      const tx = {
        contractAddress: ADDRESS,
        calldata: '0x',
        l2Value: 7_000_000,
        l2GasLimit: '0x8cbaa',
        token: '0x0000000000000000000000000000000000000000',
        to: ADDRESS,
        amount: 7_000_000,
        refundRecipient: ADDRESS,
        operatorTip: 0,
        overrides: {
          from: ADDRESS,
          maxFeePerGas: 1_500_000_010n,
          maxPriorityFeePerGas: 1_500_000_000n,
          value: 288_213_007_000_000n,
        },
        gasPerPubdataByte: 800,
      };
      const result = await wallet.getDepositTx({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
        amount: 7_000_000,
        refundRecipient: await wallet.getAddress(),
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified', async () => {
      const tx = {
        contractAddress: ADDRESS,
        calldata: '0x',
        l2Value: 7_000_000,
        l2GasLimit: '0x8cbaa',
        token: '0x0000000000000000000000000000000000000000',
        to: ADDRESS,
        amount: 7_000_000,
        refundRecipient: ADDRESS,
        operatorTip: 0,
        overrides: {
          from: ADDRESS,
          maxFeePerGas: 1_500_000_010n,
          maxPriorityFeePerGas: 1_500_000_000n,
          value: 288_213_007_000_000n,
        },
        gasPerPubdataByte: 800,
      };
      const result = await wallet.getDepositTx({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000,
        refundRecipient: await wallet.getAddress(),
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a DAI deposit transaction', async () => {
      const tx = {
        maxFeePerGas: 1_500_000_010n,
        maxPriorityFeePerGas: 1_500_000_000n,
        value: 288_992_000_000_000n,
        from: ADDRESS,
        to: await (await wallet.getL1BridgeContracts()).erc20.getAddress(),
      };
      const result = await wallet.getDepositTx({
        token: DAI_L1,
        to: await wallet.getAddress(),
        amount: 5,
        refundRecipient: await wallet.getAddress(),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });
  });

  describe('#estimateGasDeposit()', () => {
    it('should return a gas estimation for the ETH deposit transaction', async () => {
      const result = await wallet.estimateGasDeposit({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
        amount: 5,
        refundRecipient: await wallet.getAddress(),
      });
      expect(result).to.be.equal(132_711n);
    });

    it('should return a gas estimation for the DAI deposit transaction', async () => {
      const result = await wallet.estimateGasDeposit({
        token: DAI_L1,
        to: await wallet.getAddress(),
        amount: 5,
        refundRecipient: await wallet.getAddress(),
      });
      expect(result).to.be.equal(253_418n);
    });
  });

  describe('#deposit()', () => {
    it('should deposit ETH to the L2 network', async () => {
      const amount = 7_000_000_000n;
      const l2BalanceBeforeDeposit = await wallet.getBalance();
      const l1BalanceBeforeDeposit = await wallet.getBalanceL1();
      const tx = await wallet.deposit({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
        amount: amount,
        refundRecipient: await wallet.getAddress(),
      });
      const result = await tx.wait();
      const l2BalanceAfterDeposit = await wallet.getBalance();
      const l1BalanceAfterDeposit = await wallet.getBalanceL1();
      expect(result).not.to.be.null;
      expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be
        .true;
      expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be
        .true;
    }).timeout(20_000);

    it('should deposit DAI to the L2 network', async () => {
      const amount = 5n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
      const l1BalanceBeforeDeposit = await wallet.getBalanceL1(DAI_L1);
      const tx = await wallet.deposit({
        token: DAI_L1,
        to: await wallet.getAddress(),
        amount: amount,
        approveERC20: true,
        refundRecipient: await wallet.getAddress(),
      });
      const result = await tx.wait();
      const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
      const l1BalanceAfterDeposit = await wallet.getBalanceL1(DAI_L1);
      expect(result).not.to.be.null;
      expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit === amount).to.be
        .true;
      expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit === amount).to.be
        .true;
    }).timeout(20_000);

    it('should deposit DAI to the L2 network with approve transaction for allowance', async () => {
      const amount = 7n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
      const l1BalanceBeforeDeposit = await wallet.getBalanceL1(DAI_L1);
      const tx = await wallet.deposit({
        token: DAI_L1,
        to: await wallet.getAddress(),
        amount: amount,
        approveERC20: true,
        refundRecipient: await wallet.getAddress(),
      });
      const result = await tx.wait();
      await tx.waitFinalize();
      const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
      const l1BalanceAfterDeposit = await wallet.getBalanceL1(DAI_L1);
      expect(result).not.to.be.null;
      expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit === amount).to.be
        .true;
      expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit === amount).to.be
        .true;
    }).timeout(30_000);
  });

  describe('#claimFailedDeposit()', () => {
    // it("should claim failed deposit", async () => {
    //     const response = await wallet.deposit({
    //         token: utils.ETH_ADDRESS,
    //         to: await wallet.getAddress(),
    //         amount: 7_000_000_000,
    //         refundRecipient: await wallet.getAddress(),
    //         gasPerPubdataByte: 500 // make it fail because of low gas
    //     });
    //
    //     const tx = await response.waitFinalize(); // fails, sames goes with response.wait()
    //     const result = await wallet.claimFailedDeposit(tx.hash);
    //
    // }).timeout(30_000);

    it('should throw an error when trying to claim successful deposit', async () => {
      const response = await wallet.deposit({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
        amount: 7_000_000_000,
        refundRecipient: await wallet.getAddress(),
      });

      const tx = await response.waitFinalize();
      try {
        await wallet.claimFailedDeposit(tx.hash);
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          'Cannot claim successful deposit!'
        );
      }
    }).timeout(30_000);
  });

  describe('#getFullRequiredDepositFee()', () => {
    it('should return a fee for ETH token deposit', async () => {
      const feeData = {
        baseCost: 285_096_500_000_000n,
        l1GasLimit: 132_711n,
        l2GasLimit: '0x8b351',
        maxFeePerGas: 1_500_000_010n,
        maxPriorityFeePerGas: 1_500_000_000n,
      };
      const result = await wallet.getFullRequiredDepositFee({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
      });
      expect(result).to.be.deep.equal(feeData);
    });

    it('should throw an error when there is not enough allowance to cover the deposit', async () => {
      try {
        await wallet.getFullRequiredDepositFee({
          token: DAI_L1,
          to: await wallet.getAddress(),
        });
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          'Not enough allowance to cover the deposit!'
        );
      }
    }).timeout(10_000);

    it('should return a fee for DAI token deposit', async () => {
      const feeData = {
        baseCost: 288_992_000_000_000n,
        l1GasLimit: 253_177n,
        l2GasLimit: '0x8d1c0',
        maxFeePerGas: 1_500_000_010n,
        maxPriorityFeePerGas: 1_500_000_000n,
      };

      const tx = await wallet.approveERC20(DAI_L1, 5);
      await tx.wait();

      const result = await wallet.getFullRequiredDepositFee({
        token: DAI_L1,
        to: await wallet.getAddress(),
      });
      expect(result).to.be.deep.equal(feeData);
    }).timeout(10_000);

    it('should throw an error when there is not enough balance for the deposit', async () => {
      try {
        const randomWallet = new Wallet(
          ethers.Wallet.createRandom().privateKey,
          provider,
          ethProvider
        );
        await randomWallet.getFullRequiredDepositFee({
          token: DAI_L1,
          to: await wallet.getAddress(),
        });
      } catch (e) {
        expect((e as Error).message).to.include(
          'Not enough balance for deposit!'
        );
      }
    }).timeout(10_000);
  });

  describe('#withdraw()', () => {
    it('should withdraw ETH to the L1 network', async () => {
      const amount = 7_000_000_000n;
      const l2BalanceBeforeWithdrawal = await wallet.getBalance();
      const withdrawTx = await wallet.withdraw({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();
      const l2BalanceAfterWithdrawal = await wallet.getBalance();
      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal >= amount).to
        .be.true;
    }).timeout(25_000);

    it('should withdraw ETH to the L1 network using paymaster to cover fee', async () => {
      const amount = 7_000_000_000n;
      const minimalAllowance = 1n;

      const paymasterBalanceBeforeWithdrawal =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const l2BalanceBeforeWithdrawal = await wallet.getBalance();
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await wallet.getBalance(TOKEN);

      const withdrawTx = await wallet.withdraw({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(),
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();

      const paymasterBalanceAfterWithdrawal =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceAfterWithdrawal = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const l2BalanceAfterWithdrawal = await wallet.getBalance();
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await wallet.getBalance(TOKEN);

      expect(
        paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0n
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal -
          paymasterTokenBalanceBeforeWithdrawal
      ).to.be.equal(minimalAllowance);

      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
        amount
      );
      expect(
        l2ApprovalTokenBalanceAfterWithdrawal ===
          l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance
      ).to.be.true;

      expect(result).not.to.be.null;
    }).timeout(25_000);

    it('should withdraw DAI to the L1 network', async () => {
      const amount = 5n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);

      const withdrawTx = await wallet.withdraw({
        token: l2DAI,
        to: await wallet.getAddress(),
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();
      const l2BalanceAfterWithdrawal = await wallet.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
        amount
      );
      expect(l1BalanceAfterWithdrawal - l1BalanceBeforeWithdrawal).to.be.equal(
        amount
      );
    }).timeout(25_000);

    it('should withdraw DAI to the L1 network using paymaster to cover fee', async () => {
      const amount = 5n;
      const minimalAllowance = 1n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);

      const paymasterBalanceBeforeWithdrawal =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await wallet.getBalance(TOKEN);

      const withdrawTx = await wallet.withdraw({
        token: l2DAI,
        to: await wallet.getAddress(),
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();

      const paymasterBalanceAfterWithdrawal =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceAfterWithdrawal = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const l2BalanceAfterWithdrawal = await wallet.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await wallet.getBalance(TOKEN);

      expect(
        paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0n
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal -
          paymasterTokenBalanceBeforeWithdrawal
      ).to.be.equal(minimalAllowance);
      expect(
        l2ApprovalTokenBalanceAfterWithdrawal ===
          l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
        amount
      );
      expect(l1BalanceAfterWithdrawal - l1BalanceBeforeWithdrawal).to.be.equal(
        amount
      );
    }).timeout(25_000);
  });

  describe('#getRequestExecuteTx()', () => {
    it('should return a request execute transaction', async () => {
      const result = await wallet.getRequestExecuteTx({
        contractAddress: await provider.getMainContractAddress(),
        calldata: '0x',
        l2Value: 7_000_000_000,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#estimateGasRequestExecute()', () => {
    it('should return a gas estimation for the request execute transaction', async () => {
      const result = await wallet.estimateGasRequestExecute({
        contractAddress: await provider.getMainContractAddress(),
        calldata: '0x',
        l2Value: 7_000_000_000,
      });
      expect(result > 0n).to.be.true;
    });
  });

  describe('#requestExecute()', () => {
    it('should request transaction execution on the L2 network', async () => {
      const amount = 7_000_000_000n;
      const l2BalanceBeforeExecution = await wallet.getBalance();
      const l1BalanceBeforeExecution = await wallet.getBalanceL1();
      const tx = await wallet.requestExecute({
        contractAddress: await provider.getMainContractAddress(),
        calldata: '0x',
        l2Value: amount,
        l2GasLimit: 900_000,
      });
      const result = await tx.wait();
      const l2BalanceAfterExecution = await wallet.getBalance();
      const l1BalanceAfterExecution = await wallet.getBalanceL1();
      expect(result).not.to.be.null;
      expect(l2BalanceAfterExecution - l2BalanceBeforeExecution >= amount).to.be
        .true;
      expect(l1BalanceBeforeExecution - l1BalanceAfterExecution >= amount).to.be
        .true;
    }).timeout(10_000);
  });

  describe('#transfer()', () => {
    it('should transfer ETH', async () => {
      const amount = 7_000_000_000n;
      const balanceBeforeTransfer = await provider.getBalance(RECEIVER);
      const tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: RECEIVER,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(RECEIVER);
      expect(result).not.to.be.null;
      expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount);
    }).timeout(25_000);

    it('should transfer ETH using paymaster to cover fee', async () => {
      const amount = 7_000_000_000n;
      const minimalAllowance = 1n;

      const paymasterBalanceBeforeTransfer =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceBeforeTransfer = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const senderBalanceBeforeTransfer = await wallet.getBalance();
      const senderApprovalTokenBalanceBeforeTransfer =
        await wallet.getBalance(TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(RECEIVER);

      const tx = await wallet.transfer({
        token: utils.ETH_ADDRESS,
        to: RECEIVER,
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      });
      const result = await tx.wait();

      const paymasterBalanceAfterTransfer =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceAfterTransfer = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const senderBalanceAfterTransfer = await wallet.getBalance();
      const senderApprovalTokenBalanceAfterTransfer =
        await wallet.getBalance(TOKEN);
      const receiverBalanceAfterTransfer = await provider.getBalance(RECEIVER);

      expect(
        paymasterBalanceBeforeTransfer - paymasterBalanceAfterTransfer >= 0n
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterTransfer - paymasterTokenBalanceBeforeTransfer
      ).to.be.equal(minimalAllowance);

      expect(
        senderBalanceBeforeTransfer - senderBalanceAfterTransfer
      ).to.be.equal(amount);
      expect(
        senderApprovalTokenBalanceAfterTransfer ===
          senderApprovalTokenBalanceBeforeTransfer - minimalAllowance
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        receiverBalanceAfterTransfer - receiverBalanceBeforeTransfer
      ).to.be.equal(amount);
    }).timeout(25_000);

    it('should transfer DAI', async () => {
      const amount = 5n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const balanceBeforeTransfer = await provider.getBalance(
        RECEIVER,
        'latest',
        l2DAI
      );
      const tx = await wallet.transfer({
        token: l2DAI,
        to: RECEIVER,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(
        RECEIVER,
        'latest',
        l2DAI
      );
      expect(result).not.to.be.null;
      expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount);
    }).timeout(25_000);

    it('should transfer DAI using paymaster to cover fee', async () => {
      const amount = 5n;
      const minimalAllowance = 1n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);

      const paymasterBalanceBeforeTransfer =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceBeforeTransfer = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const senderBalanceBeforeTransfer = await wallet.getBalance(l2DAI);
      const senderApprovalTokenBalanceBeforeTransfer =
        await wallet.getBalance(TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(
        RECEIVER,
        'latest',
        l2DAI
      );

      const tx = await wallet.transfer({
        token: l2DAI,
        to: RECEIVER,
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      });
      const result = await tx.wait();

      const paymasterBalanceAfterTransfer =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceAfterTransfer = await provider.getBalance(
        PAYMASTER,
        'latest',
        TOKEN
      );
      const senderBalanceAfterTransfer = await wallet.getBalance(l2DAI);
      const senderApprovalTokenBalanceAfterTransfer =
        await wallet.getBalance(TOKEN);
      const receiverBalanceAfterTransfer = await provider.getBalance(
        RECEIVER,
        'latest',
        l2DAI
      );

      expect(
        paymasterBalanceBeforeTransfer - paymasterBalanceAfterTransfer >= 0n
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterTransfer - paymasterTokenBalanceBeforeTransfer
      ).to.be.equal(minimalAllowance);

      expect(
        senderBalanceBeforeTransfer - senderBalanceAfterTransfer
      ).to.be.equal(amount);
      expect(
        senderApprovalTokenBalanceAfterTransfer ===
          senderApprovalTokenBalanceBeforeTransfer - minimalAllowance
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        receiverBalanceAfterTransfer - receiverBalanceBeforeTransfer
      ).to.be.equal(amount);
    }).timeout(25_000);
  });

  describe('#signTransaction()', () => {
    it('should return a signed type EIP1559 transaction', async () => {
      const result = await wallet.signTransaction({
        type: 2,
        to: RECEIVER,
        value: 7_000_000_000n,
      });
      expect(result).not.to.be.null;
    }).timeout(25_000);

    it('should return a signed EIP712 transaction', async () => {
      const result = await wallet.signTransaction({
        type: utils.EIP712_TX_TYPE,
        to: RECEIVER,
        value: ethers.parseEther('1'),
      });
      expect(result).not.to.be.null;
    }).timeout(25_000);

    it('should throw an error when `tx.from` is mismatched from private key', async () => {
      try {
        await wallet.signTransaction({
          type: utils.EIP712_TX_TYPE,
          from: RECEIVER,
          to: RECEIVER,
          value: 7_000_000_000,
        });
      } catch (e) {
        expect((e as Error).message).to.contain('transaction from mismatch');
      }
    }).timeout(25_000);
  });
});
