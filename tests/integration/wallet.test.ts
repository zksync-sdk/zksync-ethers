import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';
import {ethers} from 'ethers';
import * as fs from 'fs';
import {
  ITestnetERC20Token__factory,
  IL2NativeTokenVault__factory,
  IL1NativeTokenVault__factory,
  IL1AssetRouter__factory,
} from '../../src/typechain';
import {
  IS_ETH_BASED,
  ADDRESS1,
  PRIVATE_KEY1,
  MNEMONIC1,
  ADDRESS2,
  DAI_L1,
  APPROVAL_TOKEN,
  PAYMASTER,
  L1_CHAIN_URL,
  L2_CHAIN_URL,
  NTV_ADDRESS,
  NON_ETH_BASED_ETH_L2_ADDRESS,
  DAI_L2,
} from '../utils';

const {expect} = chai;

describe('Wallet', () => {
  const provider = new Provider(L2_CHAIN_URL);
  const ethProvider = ethers.getDefaultProvider(L1_CHAIN_URL);
  const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

  describe('#constructor()', () => {
    it('`Wallet(privateKey, provider)` should return a `Wallet` with L2 provider', async () => {
      const wallet = new Wallet(PRIVATE_KEY1, provider);

      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
      expect(wallet.provider).to.be.equal(provider);
    });

    it('`Wallet(privateKey, provider, ethProvider)` should return a `Wallet` with L1 and L2 provider', async () => {
      const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
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

  describe('#getBridgehubContract()', () => {
    it('should return the bridgehub contract', async () => {
      const result = await wallet.getBridgehubContract();
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BridgeContracts()', () => {
    it('should return the L1 bridge contracts', async () => {
      const result = await wallet.getL1BridgeContracts();
      expect(result).not.to.be.null;
    });
  });

  describe('#isETHBasedChain()', () => {
    it('should return whether the chain is ETH-based or not', async () => {
      const result = await wallet.isETHBasedChain();
      expect(result).to.be.equal(IS_ETH_BASED);
    });
  });

  describe('#getBaseToken()', () => {
    it('should return base token', async () => {
      const result = await wallet.getBaseToken();
      IS_ETH_BASED
        ? expect(result).to.be.equal(utils.ETH_ADDRESS_IN_CONTRACTS)
        : expect(result).not.to.be.null;
    });
  });

  describe('#getBalanceL1()', () => {
    it('should return a L1 balance', async () => {
      const result = await wallet.getBalanceL1();
      expect(result > 0n).to.be.true;
    });
  });

  describe('#getAllowanceL1()', () => {
    it('should return an allowance of L1 token', async () => {
      const result = await wallet.getAllowanceL1(DAI_L1);
      expect(result >= 0n).to.be.true;
    });
  });

  describe('#l2TokenAddress()', () => {
    it('should return the L2 base address', async () => {
      const baseToken = await provider.getBaseTokenContractAddress();
      const result = await wallet.l2TokenAddress(baseToken);
      expect(result).to.be.equal(utils.L2_BASE_TOKEN_ADDRESS);
    });

    it('should return the L2 ETH address', async () => {
      if (!IS_ETH_BASED) {
        const result = await wallet.l2TokenAddress(utils.LEGACY_ETH_ADDRESS);
        expect(result).not.to.be.null;
      }
    });

    it('should return the L2 DAI address', async () => {
      const result = await wallet.l2TokenAddress(DAI_L1);
      expect(result).not.to.be.null;
    });
  });

  describe('#l1TokenAddress()', () => {
    if (IS_ETH_BASED) {
      it('should return the L1 ETH address', async () => {
        const result = await wallet.l1TokenAddress(utils.L2_BASE_TOKEN_ADDRESS);
        expect(result).to.be.equal(utils.LEGACY_ETH_ADDRESS);
      });
    } else {
      it('should return the L1 BASE address', async () => {
        const result = await wallet.l1TokenAddress(utils.L2_BASE_TOKEN_ADDRESS);
        expect(result).not.to.be.null;
      });

      it('should return the L1 ETH address', async () => {
        const result = await wallet.l1TokenAddress(
          NON_ETH_BASED_ETH_L2_ADDRESS
        );
        expect(result).to.be.equal(utils.LEGACY_ETH_ADDRESS);
      });
    }

    it('should return the L1 DAI address', async () => {
      const result = await wallet.l1TokenAddress(DAI_L2);
      expect(result).not.to.be.null;
    });
  });

  describe('#approveERC20()', () => {
    it('should approve a L1 token', async () => {
      const tx = await wallet.approveERC20(DAI_L1, 5);
      const result = await tx.wait();
      expect(result).not.to.be.null;
    });

    it('should throw an error when approving ETH token', async () => {
      try {
        await wallet.approveERC20(utils.LEGACY_ETH_ADDRESS, 5);
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          "ETH token can't be approved! The address of the token does not exist on L1."
        );
      }
    });
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
      expect(result > 0n).to.be.true;
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
      expect(result).to.be.equal(ADDRESS1);
    });
  });

  describe('#ethWallet()', () => {
    it('should return a L1 `Wallet`', async () => {
      const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
      const ethWallet = wallet.ethWallet();
      expect(ethWallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
      expect(ethWallet.provider).to.be.equal(ethProvider);
    });

    it('should throw  an error when L1 `Provider` is not specified in constructor', async () => {
      const wallet = new Wallet(PRIVATE_KEY1, provider);
      try {
        wallet.ethWallet();
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          'L1 provider is missing! Specify an L1 provider using `Wallet.connectToL1()`.'
        );
      }
    });
  });

  describe('#connect()', () => {
    it('should return a `Wallet` with provided `provider` as L2 provider', async () => {
      let wallet = new Wallet(PRIVATE_KEY1);
      wallet = wallet.connect(provider);
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
      expect(wallet.provider).to.be.equal(provider);
    });
  });

  describe('#connectL1()', () => {
    it('should return a `Wallet` with provided `provider` as L1 provider', async () => {
      let wallet = new Wallet(PRIVATE_KEY1);
      wallet = wallet.connectToL1(ethProvider);
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
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
        to: ADDRESS2,
        value: 7_000_000_000n,
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        nonce: await wallet.getNonce('pending'),
        gasLimit: 154_379n,
        chainId: 270n,
        data: '0x',
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: 100_000_000n,
      };

      const result = await wallet.populateTransaction({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        value: 7_000_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'chainId',
        'chainId',
        'customData',
      ]);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
    }).timeout(25_000);

    it('should return a populated transaction with default values if are omitted', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 113,
        data: '0x',
        from: ADDRESS1,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
        maxFeePerGas: 1_200_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
      };
      const result = await wallet.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'chainId',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
        'chainId',
        'customData',
      ]);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
      expect(BigInt(result.maxFeePerGas!) > 0n).to.be.true;
      expect(BigInt(result.maxPriorityFeePerGas!) >= 0n).to.be.true;
    });

    it('should return populated transaction when `maxFeePerGas` and `maxPriorityFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 113,
        from: ADDRESS1,
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
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'chainId']);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
    });

    it('should return populated transaction when `maxPriorityFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 113,
        from: ADDRESS1,
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
        to: ADDRESS2,
        value: 7_000_000,
        maxPriorityFeePerGas: 2_000_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'chainId',
        'maxFeePerGas',
      ]);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
      expect(BigInt(result.maxFeePerGas!) > 0n).to.be.true;
    });

    it('should return populated transaction when `maxFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 113,
        from: ADDRESS1,
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
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'chainId',
        'maxPriorityFeePerGas',
      ]);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
      expect(BigInt(result.maxPriorityFeePerGas!) >= 0n).to.be.true;
    });

    it('should return populated EIP1559 transaction when `maxFeePerGas` and `maxPriorityFeePerGas` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 2,
        from: ADDRESS1,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      };
      const result = await wallet.populateTransaction({
        to: ADDRESS2,
        type: 2,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'chainId']);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
    });

    it('should return populated EIP1559 transaction with `maxFeePerGas` and `maxPriorityFeePerGas` same as provided `gasPrice`', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 2,
        from: ADDRESS1,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 0n,
      };
      const result = await wallet.populateTransaction({
        to: ADDRESS2,
        type: 2,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'chainId']);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
    });

    it('should return populated legacy transaction when `type = 0`', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: 0,
        from: ADDRESS1,
        nonce: await wallet.getNonce('pending'),
        chainId: 270n,
        gasPrice: 100_000_000n,
      };
      const result = await wallet.populateTransaction({
        type: 0,
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'gasPrice',
        'chainId',
      ]);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
      expect(BigInt(result.gasPrice!) > 0n).to.be.true;
    });
  });

  describe('#sendTransaction()', () => {
    it('should send already populated transaction with provided `maxFeePerGas` and `maxPriorityFeePerGas` and `customData` fields', async () => {
      const populatedTx = await wallet.populateTransaction({
        to: ADDRESS2,
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
    });

    it('should send EIP712 transaction when `maxFeePerGas` and `maxPriorityFeePerGas` are provided and type is empty', async () => {
      const tx = await wallet.sendTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      });
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(113);
    });

    it('should send already populated EIP712 transaction with `maxFeePerGas` and `maxPriorityFeePerGas`', async () => {
      const populatedTx = await wallet.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: 3_500_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      });

      const tx = await wallet.sendTransaction(populatedTx);
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(113);
    });

    it('should send EIP712 transaction with `maxFeePerGas` and `maxPriorityFeePerGas` same as provided `gasPrice`', async () => {
      const tx = await wallet.sendTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        gasPrice: 3_500_000_000n,
      });
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(113);
    });

    it('should send legacy transaction when `type = 0`', async () => {
      const tx = await wallet.sendTransaction({
        type: 0,
        to: ADDRESS2,
        value: 7_000_000,
      });
      const result = await tx.wait();
      expect(result).not.to.be.null;
      expect(result.type).to.be.equal(0);
    });
  });

  describe('#fromMnemonic()', () => {
    it('should return a `Wallet` with the `provider` as L1 provider and a private key that is built from the `mnemonic` passphrase', async () => {
      const wallet = Wallet.fromMnemonic(MNEMONIC1, ethProvider);
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
      expect(wallet.providerL1).to.be.equal(ethProvider);
    });
  });

  describe('#fromEncryptedJson()', () => {
    it('should return a `Wallet` from encrypted `json` file using provided `password`', async () => {
      const wallet = await Wallet.fromEncryptedJson(
        fs.readFileSync('tests/files/wallet.json', 'utf8'),
        'password'
      );
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
    });
  });

  describe('#fromEncryptedJsonSync()', () => {
    it('should return a `Wallet` from encrypted `json` file using provided `password`', async () => {
      const wallet = Wallet.fromEncryptedJsonSync(
        fs.readFileSync('tests/files/wallet.json', 'utf8'),
        'password'
      );
      expect(wallet.signingKey.privateKey).to.be.equal(PRIVATE_KEY1);
    });
  });

  describe('#createRandom()', () => {
    it('should return a random `Wallet` with L2 provider', async () => {
      const wallet = Wallet.createRandom(provider);
      expect(wallet.signingKey.privateKey).not.to.be.null;
      expect(wallet.provider).to.be.equal(provider);
    });
  });

  describe('#getDepositTx()', () => {
    if (IS_ETH_BASED) {
      it('should return ETH deposit transaction', async () => {
        const tx = {
          contractAddress: ADDRESS1,
          calldata: '0x',
          l2Value: 7_000_000,
          l2GasLimit: 415_035n,
          mintValue: 111_540_663_250_000n,
          token: utils.ETH_ADDRESS_IN_CONTRACTS,
          to: ADDRESS1,
          amount: 7_000_000,
          refundRecipient: ADDRESS1,
          operatorTip: 0,
          overrides: {
            from: ADDRESS1,
            maxFeePerGas: 1_000_000_001n,
            maxPriorityFeePerGas: 1_000_000_000n,
            value: 111_540_663_250_000n,
          },
          gasPerPubdataByte: 800,
        };
        const result = await wallet.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await wallet.getAddress(),
          amount: 7_000_000,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result).to.be.deepEqualExcluding(tx, [
          'l2GasLimit',
          'mintValue',
          'overrides',
        ]);
        expect(result.l2GasLimit > 0n).to.be.true;
        expect(result.mintValue > 0n).to.be.true;
        expect(utils.isAddressEq(result.overrides.from, ADDRESS1)).to.be.true;
        expect(result.overrides.maxFeePerGas > 0n).to.be.true;
        expect(result.overrides.maxPriorityFeePerGas > 0n).to.be.true;
        expect(result.overrides.value > 0n).to.be.true;
      });

      it('should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified', async () => {
        const tx = {
          contractAddress: ADDRESS1,
          calldata: '0x',
          l2Value: 7_000_000,
          l2GasLimit: 415_035n,
          mintValue: 111_540_663_250_000n,
          token: utils.ETH_ADDRESS_IN_CONTRACTS,
          to: ADDRESS1,
          amount: 7_000_000,
          refundRecipient: ADDRESS1,
          operatorTip: 0,
          overrides: {
            from: ADDRESS1,
            maxFeePerGas: 1_000_000_001n,
            maxPriorityFeePerGas: 1_000_000_000n,
            value: 111_540_663_250_000n,
          },
          gasPerPubdataByte: 800,
        };
        const result = await wallet.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result).to.be.deepEqualExcluding(tx, [
          'l2GasLimit',
          'mintValue',
          'overrides',
        ]);
        expect(result.l2GasLimit > 0n).to.be.true;
        expect(result.mintValue > 0n).to.be.true;
        expect(utils.isAddressEq(result.overrides.from, ADDRESS1)).to.be.true;
        expect(result.overrides.maxFeePerGas > 0n).to.be.true;
        expect(result.overrides.maxPriorityFeePerGas > 0n).to.be.true;
        expect(result.overrides.value > 0n).to.be.true;
      });

      it('should return DAI deposit transaction', async () => {
        const transaction = {
          maxFeePerGas: 1_000_000_001n,
          maxPriorityFeePerGas: 1_000_000_000n,
          value: 105_100_275_000_000n,
          from: ADDRESS1,
          to: await provider.getBridgehubContractAddress(),
        };
        const result = await wallet.getDepositTx({
          token: DAI_L1,
          to: await wallet.getAddress(),
          amount: 5,
          refundRecipient: await wallet.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(transaction, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
          'value',
        ]);
        expect(result.maxFeePerGas > 0n).to.be.true;
        expect(result.maxPriorityFeePerGas > 0n).to.be.true;
        expect(result.value > 0n).to.be.true;
      });
    } else {
      it('should return ETH deposit transaction', async () => {
        const tx = {
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
          value: 7_000_000n,
          data: '0x24fd57fb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000010e0000000000000000000000000000000000000000000000000000bf1aaa17ee7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000062e3d000000000000000000000000000000000000000000000000000000000000032000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049000000000000000000000000842deab39809094bf5e4b77a7f97ae308adc5e5500000000000000000000000000000000000000000000000000000000006acfc0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
          maxFeePerGas: 1_000_000_001n,
          maxPriorityFeePerGas: 1_000_000_000n,
        };
        const result = await wallet.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await wallet.getAddress(),
          amount: 7_000_000,
          refundRecipient: await wallet.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
        ]);
        expect(BigInt(result.maxPriorityFeePerGas) > 0n).to.be.true;
        expect(BigInt(result.maxFeePerGas) > 0n).to.be.true;
      });

      it('should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified', async () => {
        const tx = {
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
          value: 7_000_000n,
          maxFeePerGas: 1_000_000_001n,
          maxPriorityFeePerGas: 1000_000_000n,
        };
        const result = await wallet.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000,
          refundRecipient: await wallet.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
        ]);
        expect(BigInt(result.maxPriorityFeePerGas) > 0n).to.be.true;
        expect(BigInt(result.maxFeePerGas) > 0n).to.be.true;
      });

      it('should return DAI deposit transaction', async () => {
        const tx = {
          maxFeePerGas: 1_000_000_001n,
          maxPriorityFeePerGas: 1_000_000_000n,
          value: 0n,
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
        };
        const result = await wallet.getDepositTx({
          token: DAI_L1,
          to: await wallet.getAddress(),
          amount: 5,
          refundRecipient: await wallet.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
        ]);
        expect(BigInt(result.maxPriorityFeePerGas) > 0n).to.be.true;
        expect(BigInt(result.maxFeePerGas) > 0n).to.be.true;
      });
    }
  });

  describe('#estimateGasDeposit()', () => {
    if (IS_ETH_BASED) {
      it('should return a gas estimation for the ETH deposit transaction', async () => {
        const result = await wallet.estimateGasDeposit({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await wallet.getAddress(),
          amount: 5,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result > 0n).to.be.true;
      });

      it('should return a gas estimation for the DAI deposit transaction', async () => {
        const result = await wallet.estimateGasDeposit({
          token: DAI_L1,
          to: await wallet.getAddress(),
          amount: 5,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result > 0n).to.be.true;
      });
    } else {
      it('should throw an error for insufficient allowance when estimating gas for ETH deposit transaction', async () => {
        try {
          await wallet.estimateGasDeposit({
            token: utils.LEGACY_ETH_ADDRESS,
            to: await wallet.getAddress(),
            amount: 5,
            refundRecipient: await wallet.getAddress(),
          });
        } catch (e: any) {
          expect(e.reason).to.include('ERC20: insufficient allowance');
        }
      });

      it('should return gas estimation for ETH deposit transaction', async () => {
        const token = utils.LEGACY_ETH_ADDRESS;
        const amount = 5;
        const approveParams = await wallet.getDepositAllowanceParams(
          token,
          amount
        );

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await wallet.estimateGasDeposit({
          token: token,
          to: await wallet.getAddress(),
          amount: amount,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result > 0n).to.be.true;
      });

      it('should return gas estimation for base token deposit transaction', async () => {
        const token = await wallet.getBaseToken();
        const amount = 5;
        const approveParams = await wallet.getDepositAllowanceParams(
          token,
          amount
        );

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await wallet.estimateGasDeposit({
          token: token,
          to: await wallet.getAddress(),
          amount: amount,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result > 0n).to.be.true;
      });

      it('should return gas estimation for DAI deposit transaction', async () => {
        const token = DAI_L1;
        const amount = 5;
        const approveParams = await wallet.getDepositAllowanceParams(
          token,
          amount
        );

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();
        await (
          await wallet.approveERC20(
            approveParams[1].token,
            approveParams[1].allowance
          )
        ).wait();

        const result = await wallet.estimateGasDeposit({
          token: token,
          to: await wallet.getAddress(),
          amount: amount,
          refundRecipient: await wallet.getAddress(),
        });
        expect(result > 0n).to.be.true;
      });
    }
  });

  describe('#deposit()', () => {
    if (IS_ETH_BASED) {
      it('should deposit ETH to L2 network', async () => {
        const amount = 7_000_000_000;
        const l2BalanceBeforeDeposit = await wallet.getBalance();
        const l1BalanceBeforeDeposit = await wallet.getBalanceL1();
        const tx = await wallet.deposit({
          token: utils.LEGACY_ETH_ADDRESS,
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
      });

      it('should deposit DAI to L2 network', async () => {
        const amount = 5;
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
        expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be
          .true;
        expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be
          .true;
      });

      it('should deposit DAI to the L2 network with approve transaction for allowance', async () => {
        const amount = 7;
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
        expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be
          .true;
        expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be
          .true;
      }).timeout(100_000);
    } else {
      it('should deposit ETH to L2 network', async () => {
        const amount = 7_000_000_000;
        const l2EthAddress = await wallet.l2TokenAddress(
          utils.ETH_ADDRESS_IN_CONTRACTS
        );
        const l2BalanceBeforeDeposit = await wallet.getBalance(l2EthAddress);
        const l1BalanceBeforeDeposit = await wallet.getBalanceL1();
        const tx = await wallet.deposit({
          token: utils.ETH_ADDRESS,
          to: await wallet.getAddress(),
          amount: amount,
          approveBaseERC20: true,
          refundRecipient: await wallet.getAddress(),
        });
        const result = await tx.wait();
        const l2BalanceAfterDeposit = await wallet.getBalance(l2EthAddress);
        const l1BalanceAfterDeposit = await wallet.getBalanceL1();
        expect(result).not.to.be.null;
        expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be
          .true;
        expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be
          .true;
      });

      it('should deposit base token to L2 network', async () => {
        const amount = 5;
        const baseTokenL1 = await wallet.getBaseToken();
        const l2BalanceBeforeDeposit = await wallet.getBalance();
        const l1BalanceBeforeDeposit = await wallet.getBalanceL1(baseTokenL1);
        const tx = await wallet.deposit({
          token: baseTokenL1,
          to: await wallet.getAddress(),
          amount: amount,
          approveERC20: true,
          refundRecipient: await wallet.getAddress(),
        });
        const result = await tx.wait();
        const l2BalanceAfterDeposit = await wallet.getBalance();
        const l1BalanceAfterDeposit = await wallet.getBalanceL1(baseTokenL1);
        expect(result).not.to.be.null;
        expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be
          .true;
        expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= 0n).to.be.true;
      });

      it('should deposit DAI to L2 network', async () => {
        const amount = 5;
        const l2DAI = await provider.l2TokenAddress(DAI_L1);
        const l2BalanceBeforeDeposit = await wallet.getBalance(l2DAI);
        const l1BalanceBeforeDeposit = await wallet.getBalanceL1(DAI_L1);
        const tx = await wallet.deposit({
          token: DAI_L1,
          to: await wallet.getAddress(),
          amount: amount,
          approveERC20: true,
          approveBaseERC20: true,
          refundRecipient: await wallet.getAddress(),
        });
        const result = await tx.wait();
        const l2BalanceAfterDeposit = await wallet.getBalance(l2DAI);
        const l1BalanceAfterDeposit = await wallet.getBalanceL1(DAI_L1);
        expect(result).not.to.be.null;
        expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be
          .true;
        expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be
          .true;
      });
    }
  });

  describe('#claimFailedDeposit()', () => {
    if (IS_ETH_BASED) {
      it('should claim failed deposit', async () => {
        const response = await wallet.deposit({
          token: DAI_L1,
          to: await wallet.getAddress(),
          amount: 5,
          approveERC20: true,
          refundRecipient: await wallet.getAddress(),
          l2GasLimit: 300_000, // make it fail because of low gas
        });
        try {
          await response.waitFinalize();
        } catch (error) {
          const blockNumber = (
            await wallet
              ._providerL2()
              .getTransaction((error as any).receipt.hash)
          ).blockNumber!;
          // Now wait for block number to be executed.
          let blockDetails: types.BlockDetails;
          do {
            // still not executed.
            await utils.sleep(500);
            blockDetails = await wallet
              ._providerL2()
              .getBlockDetails(blockNumber);
          } while (!blockDetails || !blockDetails.executeTxHash);
          const tx = await wallet.claimFailedDeposit(
            (error as any).receipt.hash
          );
          const result = await tx.wait();
          expect(result?.blockHash).to.be.not.null;
        }
      }).timeout(100_000);

      it('should throw an error when trying to claim successful deposit', async () => {
        const response = await wallet.deposit({
          token: utils.LEGACY_ETH_ADDRESS,
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
      }).timeout(90_000);
    } else {
      it('should throw an error when trying to claim successful deposit', async () => {
        const response = await wallet.deposit({
          token: await wallet.getBaseToken(),
          to: await wallet.getAddress(),
          amount: 5,
          approveERC20: true,
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
      }).timeout(90_000);
    }
  });

  describe('#getFullRequiredDepositFee()', () => {
    if (IS_ETH_BASED) {
      it('should return a fee for ETH token deposit', async () => {
        const result = await wallet.getFullRequiredDepositFee({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await wallet.getAddress(),
        });
        expect(result.baseCost > 0n).to.be.true;
        expect(result.l1GasLimit > 0n).to.be.true;
        expect(result.l2GasLimit > 0n).to.be.true;
        expect(result.maxPriorityFeePerGas! > 0n).to.be.true;
        expect(result.maxFeePerGas! > 0n).to.be.true;
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
      });

      it('should return a fee for DAI token deposit', async () => {
        const tx = await wallet.approveERC20(DAI_L1, 5);
        await tx.wait();

        const result = await wallet.getFullRequiredDepositFee({
          token: DAI_L1,
          to: await wallet.getAddress(),
        });
        expect(result.baseCost > 0n).to.be.true;
        expect(result.l1GasLimit > 0n).to.be.true;
        expect(result.l2GasLimit > 0n).to.be.true;
        expect(result.maxPriorityFeePerGas! > 0n).to.be.true;
        expect(result.maxFeePerGas! > 0n).to.be.true;
      });

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
      });
    } else {
      it('should throw an error when there is not enough base token allowance to cover the deposit', async () => {
        try {
          await new Wallet(
            ethers.Wallet.createRandom().privateKey,
            provider,
            ethProvider
          ).getFullRequiredDepositFee({
            token: utils.LEGACY_ETH_ADDRESS,
            to: await wallet.getAddress(),
          });
        } catch (e) {
          expect((e as Error).message).to.be.equal(
            'Not enough base token allowance to cover the deposit!'
          );
        }
      });

      it('should return fee for ETH token deposit', async () => {
        const token = utils.LEGACY_ETH_ADDRESS;
        const approveParams = await wallet.getDepositAllowanceParams(token, 1);

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await wallet.getFullRequiredDepositFee({
          token: token,
          to: await wallet.getAddress(),
        });
        expect(result.baseCost > 0n).to.be.true;
        expect(result.l1GasLimit > 0n).to.be.true;
        expect(result.l2GasLimit > 0n).to.be.true;
        expect(result.maxPriorityFeePerGas! > 0n).to.be.true;
        expect(result.maxFeePerGas! > 0n).to.be.true;
      });

      it('should return fee for base token deposit', async () => {
        const token = await wallet.getBaseToken();
        const approveParams = await wallet.getDepositAllowanceParams(token, 1);

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await wallet.getFullRequiredDepositFee({
          token: token,
          to: await wallet.getAddress(),
        });
        expect(result).not.to.be.null;
      });

      it('should return fee for DAI token deposit', async () => {
        const token = DAI_L1;
        const approveParams = await wallet.getDepositAllowanceParams(token, 1);

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();
        await (
          await wallet.approveERC20(
            approveParams[1].token,
            approveParams[1].allowance
          )
        ).wait();

        const result = await wallet.getFullRequiredDepositFee({
          token: token,
          to: await wallet.getAddress(),
        });
        expect(result.baseCost > 0n).to.be.true;
        expect(result.l1GasLimit > 0n).to.be.true;
        expect(result.l2GasLimit > 0n).to.be.true;
        expect(result.maxPriorityFeePerGas! > 0n).to.be.true;
        expect(result.maxFeePerGas! > 0n).to.be.true;
      });

      it('should throw an error when there is not enough token allowance to cover the deposit', async () => {
        const token = DAI_L1;
        const randomWallet = new Wallet(
          ethers.Wallet.createRandom().privateKey,
          provider,
          ethProvider
        );

        // mint base token to random wallet
        const baseToken = ITestnetERC20Token__factory.connect(
          await wallet.getBaseToken(),
          wallet._signerL1()
        );
        const baseTokenMintTx = await baseToken.mint(
          await randomWallet.getAddress(),
          ethers.parseEther('0.5')
        );
        await baseTokenMintTx.wait();

        // transfer ETH to random wallet so that base token approval tx can be performed
        const transferTx = await new ethers.Wallet(
          PRIVATE_KEY1,
          ethProvider
        ).sendTransaction({
          to: await randomWallet.getAddress(),
          value: ethers.parseEther('0.1'),
        });
        await transferTx.wait();

        const approveParams = await randomWallet.getDepositAllowanceParams(
          token,
          1
        );
        // only approve base token
        await (
          await randomWallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        try {
          await randomWallet.getFullRequiredDepositFee({
            token: token,
            to: await wallet.getAddress(),
          });
        } catch (e) {
          expect((e as Error).message).to.be.equal(
            'Not enough token allowance to cover the deposit!'
          );
        }
      });
    }
  });

  describe('#withdraw()', () => {
    if (IS_ETH_BASED) {
      it('should withdraw ETH to the L1 network', async () => {
        const amount = 7_000_000_000n;
        const l2BalanceBeforeWithdrawal = await wallet.getBalance();
        const withdrawTx = await wallet.withdraw({
          token: utils.LEGACY_ETH_ADDRESS,
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
        expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal >= amount)
          .to.be.true;
      }).timeout(90_000);

      it('should withdraw ETH to the L1 network using paymaster to cover fee', async () => {
        const amount = 7_000_000_000n;
        const minimalAllowance = 1n;

        const paymasterBalanceBeforeWithdrawal =
          await provider.getBalance(PAYMASTER);
        const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
          PAYMASTER,
          'latest',
          APPROVAL_TOKEN
        );
        const l2BalanceBeforeWithdrawal = await wallet.getBalance();
        const l2ApprovalTokenBalanceBeforeWithdrawal =
          await wallet.getBalance(APPROVAL_TOKEN);

        const withdrawTx = await wallet.withdraw({
          token: utils.ETH_ADDRESS_IN_CONTRACTS,
          to: await wallet.getAddress(),
          amount: amount,
          paymasterParams: utils.getPaymasterParams(PAYMASTER, {
            type: 'ApprovalBased',
            token: APPROVAL_TOKEN,
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
          APPROVAL_TOKEN
        );
        const l2BalanceAfterWithdrawal = await wallet.getBalance();
        const l2ApprovalTokenBalanceAfterWithdrawal =
          await wallet.getBalance(APPROVAL_TOKEN);

        expect(
          paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >=
            0n
        ).to.be.true;
        expect(
          paymasterTokenBalanceAfterWithdrawal -
            paymasterTokenBalanceBeforeWithdrawal
        ).to.be.equal(minimalAllowance);

        expect(
          l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal
        ).to.be.equal(amount);
        expect(
          l2ApprovalTokenBalanceAfterWithdrawal ===
            l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance
        ).to.be.true;

        expect(result).not.to.be.null;
      }).timeout(90_000);
    } else {
      it('should withdraw ETH to the L1 network', async () => {
        const amount = 7_000_000_000n;
        const token = await wallet.l2TokenAddress(
          utils.ETH_ADDRESS_IN_CONTRACTS
        );
        const l2BalanceBeforeWithdrawal = await wallet.getBalance(token);
        const withdrawTx = await wallet.withdraw({
          token: token,
          to: await wallet.getAddress(),
          amount: amount,
        });
        await withdrawTx.waitFinalize();
        expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

        const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
          withdrawTx.hash
        );
        const result = await finalizeWithdrawTx.wait();
        const l2BalanceAfterWithdrawal = await wallet.getBalance(token);
        expect(result).not.to.be.null;
        expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal >= amount)
          .to.be.true;
      }).timeout(90_000);

      it('should withdraw ETH to the L1 network using paymaster to cover fee', async () => {
        const amount = 7_000_000_000n;
        const minimalAllowance = 1n;

        const token = await wallet.l2TokenAddress(
          utils.ETH_ADDRESS_IN_CONTRACTS
        );
        const paymasterBalanceBeforeWithdrawal =
          await provider.getBalance(PAYMASTER);
        const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
          PAYMASTER,
          'latest',
          APPROVAL_TOKEN
        );
        const l2BalanceBeforeWithdrawal = await wallet.getBalance(token);
        const l2ApprovalTokenBalanceBeforeWithdrawal =
          await wallet.getBalance(APPROVAL_TOKEN);

        const withdrawTx = await wallet.withdraw({
          token: token,
          to: await wallet.getAddress(),
          amount: amount,
          paymasterParams: utils.getPaymasterParams(PAYMASTER, {
            type: 'ApprovalBased',
            token: APPROVAL_TOKEN,
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
          APPROVAL_TOKEN
        );
        const l2BalanceAfterWithdrawal = await wallet.getBalance(token);
        const l2ApprovalTokenBalanceAfterWithdrawal =
          await wallet.getBalance(APPROVAL_TOKEN);

        expect(
          paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >=
            0n
        ).to.be.true;
        expect(
          paymasterTokenBalanceAfterWithdrawal -
            paymasterTokenBalanceBeforeWithdrawal
        ).to.be.equal(minimalAllowance);

        expect(
          l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal
        ).to.be.equal(amount);
        expect(
          l2ApprovalTokenBalanceAfterWithdrawal ===
            l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance
        ).to.be.true;

        expect(result).not.to.be.null;
      }).timeout(90_000);

      it('should withdraw base token to the L1 network', async () => {
        const amount = 7_000_000_000n;
        const l2BalanceBeforeWithdrawal = await wallet.getBalance();
        const withdrawTx = await wallet.withdraw({
          token: utils.L2_BASE_TOKEN_ADDRESS,
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
        expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal >= amount)
          .to.be.true;
      }).timeout(90_000);

      it('should withdraw base token to the L1 network using paymaster to cover fee', async () => {
        const amount = 7_000_000_000n;
        const minimalAllowance = 1n;

        const paymasterBalanceBeforeWithdrawal =
          await provider.getBalance(PAYMASTER);
        const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
          PAYMASTER,
          'latest',
          APPROVAL_TOKEN
        );
        const l2BalanceBeforeWithdrawal = await wallet.getBalance();
        const l2ApprovalTokenBalanceBeforeWithdrawal =
          await wallet.getBalance(APPROVAL_TOKEN);

        const withdrawTx = await wallet.withdraw({
          token: utils.L2_BASE_TOKEN_ADDRESS,
          to: await wallet.getAddress(),
          amount: amount,
          paymasterParams: utils.getPaymasterParams(PAYMASTER, {
            type: 'ApprovalBased',
            token: APPROVAL_TOKEN,
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
          APPROVAL_TOKEN
        );
        const l2BalanceAfterWithdrawal = await wallet.getBalance();
        const l2ApprovalTokenBalanceAfterWithdrawal =
          await wallet.getBalance(APPROVAL_TOKEN);

        expect(
          paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >=
            0n
        ).to.be.true;
        expect(
          paymasterTokenBalanceAfterWithdrawal -
            paymasterTokenBalanceBeforeWithdrawal
        ).to.be.equal(minimalAllowance);

        expect(
          l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal
        ).to.be.equal(amount);
        expect(
          l2ApprovalTokenBalanceAfterWithdrawal ===
            l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance
        ).to.be.true;

        expect(result).not.to.be.null;
      }).timeout(90_000);
    }

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
    }).timeout(90_000);

    it('should withdraw DAI to the L1 network using paymaster to cover fee', async () => {
      const amount = 5n;
      const minimalAllowance = 1n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);

      const paymasterBalanceBeforeWithdrawal =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
        PAYMASTER,
        'latest',
        APPROVAL_TOKEN
      );
      const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await wallet.getBalance(APPROVAL_TOKEN);

      const withdrawTx = await wallet.withdraw({
        token: l2DAI,
        to: await wallet.getAddress(),
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
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
        APPROVAL_TOKEN
      );
      const l2BalanceAfterWithdrawal = await wallet.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await wallet.getBalance(APPROVAL_TOKEN);

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
    }).timeout(90_000);

    it('should withdraw Crown to the L1 network', async () => {
      const amount = 5n;
      const l2Crown = APPROVAL_TOKEN;
      const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2Crown);

      const withdrawTx = await wallet.withdraw({
        token: l2Crown,
        to: await wallet.getAddress(),
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();
      const l2BalanceAfterWithdrawal = await wallet.getBalance(l2Crown);

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
        amount
      );
    }).timeout(90_000);

    it('should deposit Crown to the L2 network', async () => {
      const amount = 5n;
      const crownL2Address = APPROVAL_TOKEN;
      const bridgeContracts = await wallet.getL1BridgeContracts();
      const sharedBridge = bridgeContracts.shared;
      const l1AssetRouter = IL1AssetRouter__factory.connect(
        await sharedBridge.getAddress(),
        wallet._signerL1()
      );
      const l2Ntv = IL2NativeTokenVault__factory.connect(
        NTV_ADDRESS,
        wallet._signerL2()
      );
      const l1NtvAddress = await l1AssetRouter.nativeTokenVault();
      const l1Ntv = IL1NativeTokenVault__factory.connect(
        l1NtvAddress,
        wallet._signerL1()
      );
      const crownAssetId = await l2Ntv.assetId(crownL2Address);
      const crownL1Address = await l1Ntv.tokenAddress(crownAssetId);

      const l2BalanceBeforeWithdrawal = await wallet.getBalance(crownL2Address);
      const l1BalanceBeforeWithdrawal =
        await wallet.getBalanceL1(crownL1Address);

      const depositTx = await wallet.deposit({
        token: crownL1Address,
        to: await wallet.getAddress(),
        amount: amount,
        approveERC20: true,
        approveBaseERC20: true,
      });
      await depositTx.waitFinalize();

      const l2BalanceAfterWithdrawal = await wallet.getBalance(crownL2Address);
      const l1BalanceAfterWithdrawal =
        await wallet.getBalanceL1(crownL1Address);

      expect(l2BalanceAfterWithdrawal - l2BalanceBeforeWithdrawal).to.be.equal(
        amount
      );
      expect(l1BalanceBeforeWithdrawal - l1BalanceAfterWithdrawal).to.be.equal(
        amount
      );
    }).timeout(90_000);

    it('should withdraw Crown to the L1 network using paymaster to cover fee', async () => {
      const amount = 5n;
      const minimalAllowance = 1n;
      const l2Crown = APPROVAL_TOKEN;

      const paymasterBalanceBeforeWithdrawal =
        await provider.getBalance(PAYMASTER);
      const paymasterTokenBalanceBeforeWithdrawal = await provider.getBalance(
        PAYMASTER,
        'latest',
        APPROVAL_TOKEN
      );
      const l2BalanceBeforeWithdrawal = await wallet.getBalance(l2Crown);
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await wallet.getBalance(APPROVAL_TOKEN);

      const withdrawTx = await wallet.withdraw({
        token: l2Crown,
        to: await wallet.getAddress(),
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
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
        APPROVAL_TOKEN
      );
      const l2BalanceAfterWithdrawal = await wallet.getBalance(l2Crown);
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await wallet.getBalance(APPROVAL_TOKEN);

      expect(
        paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0n
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal -
          paymasterTokenBalanceBeforeWithdrawal
      ).to.be.equal(minimalAllowance);
      expect(
        l2ApprovalTokenBalanceAfterWithdrawal ===
          l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance - amount
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal - minimalAllowance
      ).to.be.equal(amount);
    }).timeout(90_000);
  });

  describe('#getRequestExecuteTx()', () => {
    const amount = 7_000_000_000;
    if (IS_ETH_BASED) {
      it('should return request execute transaction', async () => {
        const result = await wallet.getRequestExecuteTx({
          contractAddress: await provider.getBridgehubContractAddress(),
          calldata: '0x',
          l2Value: amount,
        });
        expect(result).not.to.be.null;
      });
    } else {
      it('should return request execute transaction', async () => {
        const result = await wallet.getRequestExecuteTx({
          contractAddress: await wallet.getAddress(),
          calldata: '0x',
          l2Value: amount,
          overrides: {nonce: 0},
        });
        expect(result).not.to.be.null;
      });
    }
  });

  describe('#estimateGasRequestExecute()', () => {
    if (IS_ETH_BASED) {
      it('should return gas estimation for request execute transaction', async () => {
        const result = await wallet.estimateGasRequestExecute({
          contractAddress: await provider.getBridgehubContractAddress(),
          calldata: '0x',
          l2Value: 7_000_000_000,
        });
        expect(result > 0n).to.be.true;
      });
    } else {
      it('should return gas estimation for request execute transaction', async () => {
        const tx = {
          contractAddress: await wallet.getAddress(),
          calldata: '0x',
          l2Value: 7_000_000_000,
          overrides: {value: 0},
        };

        const approveParams = await wallet.getRequestExecuteAllowanceParams(tx);
        await (
          await wallet.approveERC20(
            approveParams.token,
            approveParams.allowance
          )
        ).wait();

        const result = await wallet.estimateGasRequestExecute(tx);
        expect(result > 0n).to.be.true;
      });
    }
  });

  describe('#requestExecute()', () => {
    if (IS_ETH_BASED) {
      it('should request transaction execution on L2 network', async () => {
        const amount = 7_000_000_000;
        const l2BalanceBeforeExecution = await wallet.getBalance();
        const l1BalanceBeforeExecution = await wallet.getBalanceL1();
        const tx = await wallet.requestExecute({
          contractAddress: await provider.getBridgehubContractAddress(),
          calldata: '0x',
          l2Value: amount,
          l2GasLimit: 900_000,
        });
        const result = await tx.wait();
        const l2BalanceAfterExecution = await wallet.getBalance();
        const l1BalanceAfterExecution = await wallet.getBalanceL1();
        expect(result).not.to.be.null;
        expect(l2BalanceAfterExecution - l2BalanceBeforeExecution >= amount).to
          .be.true;
        expect(l1BalanceBeforeExecution - l1BalanceAfterExecution >= amount).to
          .be.true;
      });
    } else {
      it('should request transaction execution on L2 network', async () => {
        const amount = 7_000_000_000;
        const request = {
          contractAddress: await wallet.getAddress(),
          calldata: '0x',
          l2Value: amount,
          l2GasLimit: 1_319_957n,
          operatorTip: 0,
          gasPerPubdataByte: 800,
          refundRecipient: await wallet.getAddress(),
          overrides: {
            maxFeePerGas: 1_000_000_010n,
            maxPriorityFeePerGas: 1_000_000_000n,
            gasLimit: 638_654n,
            value: 0,
          },
        };

        const approveParams =
          await wallet.getRequestExecuteAllowanceParams(request);
        await (
          await wallet.approveERC20(
            approveParams.token,
            approveParams.allowance
          )
        ).wait();

        const l2BalanceBeforeExecution = await wallet.getBalance();
        const l1BalanceBeforeExecution = await wallet.getBalanceL1();

        const tx = await wallet.requestExecute(request);
        const result = await tx.wait();
        const l2BalanceAfterExecution = await wallet.getBalance();
        const l1BalanceAfterExecution = await wallet.getBalanceL1();
        expect(result).not.to.be.null;
        expect(l2BalanceAfterExecution - l2BalanceBeforeExecution >= amount).to
          .be.true;
        expect(l1BalanceBeforeExecution - l1BalanceAfterExecution >= amount).to
          .be.true;
      });
    }
  });

  describe('#transfer()', () => {
    if (IS_ETH_BASED) {
      it('should transfer ETH', async () => {
        const amount = 7_000_000_000n;
        const balanceBeforeTransfer = await provider.getBalance(ADDRESS2);
        const tx = await wallet.transfer({
          to: ADDRESS2,
          amount: amount,
        });
        const result = await tx.wait();
        const balanceAfterTransfer = await provider.getBalance(ADDRESS2);
        expect(result).not.to.be.null;
        expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(
          amount
        );
      }).timeout(25_000);

      it('should transfer ETH using paymaster to cover fee', async () => {
        const amount = 7_000_000_000n;
        const minimalAllowance = 1n;

        const paymasterBalanceBeforeTransfer =
          await provider.getBalance(PAYMASTER);
        const paymasterTokenBalanceBeforeTransfer = await provider.getBalance(
          PAYMASTER,
          'latest',
          APPROVAL_TOKEN
        );
        const senderBalanceBeforeTransfer = await wallet.getBalance();
        const senderApprovalTokenBalanceBeforeTransfer =
          await wallet.getBalance(APPROVAL_TOKEN);
        const receiverBalanceBeforeTransfer = await provider.getBalance(
          ADDRESS2,
          'latest'
        );

        const tx = await wallet.transfer({
          to: ADDRESS2,
          amount: amount,
          paymasterParams: utils.getPaymasterParams(PAYMASTER, {
            type: 'ApprovalBased',
            token: APPROVAL_TOKEN,
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
          APPROVAL_TOKEN
        );
        const senderBalanceAfterTransfer = await wallet.getBalance();
        const senderApprovalTokenBalanceAfterTransfer =
          await wallet.getBalance(APPROVAL_TOKEN);
        const receiverBalanceAfterTransfer =
          await provider.getBalance(ADDRESS2);

        expect(
          paymasterBalanceBeforeTransfer - paymasterBalanceAfterTransfer >= 0n
        ).to.be.true;
        expect(
          paymasterTokenBalanceAfterTransfer -
            paymasterTokenBalanceBeforeTransfer
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
    } else {
      it('should transfer ETH', async () => {
        const amount = 7_000_000_000n;
        const token = await wallet.l2TokenAddress(
          utils.ETH_ADDRESS_IN_CONTRACTS
        );
        const balanceBeforeTransfer = await provider.getBalance(
          ADDRESS2,
          'latest',
          token
        );
        const tx = await wallet.transfer({
          token: utils.LEGACY_ETH_ADDRESS,
          to: ADDRESS2,
          amount: amount,
        });
        const result = await tx.wait();
        const balanceAfterTransfer = await provider.getBalance(
          ADDRESS2,
          'latest',
          token
        );
        expect(result).not.to.be.null;
        expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(
          amount
        );
      }).timeout(25_000);

      it('should transfer ETH using paymaster to cover fee', async () => {
        const amount = 7_000_000_000n;
        const minimalAllowance = 1n;

        const token = await wallet.l2TokenAddress(
          utils.ETH_ADDRESS_IN_CONTRACTS
        );
        const paymasterBalanceBeforeTransfer =
          await provider.getBalance(PAYMASTER);
        const paymasterTokenBalanceBeforeTransfer = await provider.getBalance(
          PAYMASTER,
          'latest',
          APPROVAL_TOKEN
        );
        const senderBalanceBeforeTransfer = await wallet.getBalance(token);
        const senderApprovalTokenBalanceBeforeTransfer =
          await wallet.getBalance(APPROVAL_TOKEN);
        const receiverBalanceBeforeTransfer = await provider.getBalance(
          ADDRESS2,
          'latest',
          token
        );

        const tx = await wallet.transfer({
          token: token,
          to: ADDRESS2,
          amount: amount,
          paymasterParams: utils.getPaymasterParams(PAYMASTER, {
            type: 'ApprovalBased',
            token: APPROVAL_TOKEN,
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
          APPROVAL_TOKEN
        );
        const senderBalanceAfterTransfer = await wallet.getBalance(token);
        const senderApprovalTokenBalanceAfterTransfer =
          await wallet.getBalance(APPROVAL_TOKEN);
        const receiverBalanceAfterTransfer = await provider.getBalance(
          ADDRESS2,
          'latest',
          token
        );

        expect(
          paymasterBalanceBeforeTransfer - paymasterBalanceAfterTransfer >= 0n
        ).to.be.true;
        expect(
          paymasterTokenBalanceAfterTransfer -
            paymasterTokenBalanceBeforeTransfer
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

      it('should transfer base token', async () => {
        const amount = 7_000_000_000n;
        const balanceBeforeTransfer = await provider.getBalance(ADDRESS2);
        const tx = await wallet.transfer({
          to: ADDRESS2,
          amount: amount,
        });
        const result = await tx.wait();
        const balanceAfterTransfer = await provider.getBalance(ADDRESS2);
        expect(result).not.to.be.null;
        expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(
          amount
        );
      }).timeout(25_000);

      it('should transfer base token using paymaster to cover fee', async () => {
        const amount = 7_000_000_000n;
        const minimalAllowance = 1n;

        const paymasterBalanceBeforeTransfer =
          await provider.getBalance(PAYMASTER);
        const paymasterTokenBalanceBeforeTransfer = await provider.getBalance(
          PAYMASTER,
          'latest',
          APPROVAL_TOKEN
        );
        const senderBalanceBeforeTransfer = await wallet.getBalance();
        const senderApprovalTokenBalanceBeforeTransfer =
          await wallet.getBalance(APPROVAL_TOKEN);
        const receiverBalanceBeforeTransfer = await provider.getBalance(
          ADDRESS2,
          'latest'
        );

        const tx = await wallet.transfer({
          to: ADDRESS2,
          amount: amount,
          paymasterParams: utils.getPaymasterParams(PAYMASTER, {
            type: 'ApprovalBased',
            token: APPROVAL_TOKEN,
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
          APPROVAL_TOKEN
        );
        const senderBalanceAfterTransfer = await wallet.getBalance();
        const senderApprovalTokenBalanceAfterTransfer =
          await wallet.getBalance(APPROVAL_TOKEN);
        const receiverBalanceAfterTransfer =
          await provider.getBalance(ADDRESS2);

        expect(
          paymasterBalanceBeforeTransfer - paymasterBalanceAfterTransfer >= 0n
        ).to.be.true;
        expect(
          paymasterTokenBalanceAfterTransfer -
            paymasterTokenBalanceBeforeTransfer
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
    }

    it('should transfer DAI', async () => {
      const amount = 5n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const balanceBeforeTransfer = await provider.getBalance(
        ADDRESS2,
        'latest',
        l2DAI
      );
      const tx = await wallet.transfer({
        token: l2DAI,
        to: ADDRESS2,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(
        ADDRESS2,
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
        APPROVAL_TOKEN
      );
      const senderBalanceBeforeTransfer = await wallet.getBalance(l2DAI);
      const senderApprovalTokenBalanceBeforeTransfer =
        await wallet.getBalance(APPROVAL_TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(
        ADDRESS2,
        'latest',
        l2DAI
      );

      const tx = await wallet.transfer({
        token: l2DAI,
        to: ADDRESS2,
        amount: amount,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
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
        APPROVAL_TOKEN
      );
      const senderBalanceAfterTransfer = await wallet.getBalance(l2DAI);
      const senderApprovalTokenBalanceAfterTransfer =
        await wallet.getBalance(APPROVAL_TOKEN);
      const receiverBalanceAfterTransfer = await provider.getBalance(
        ADDRESS2,
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
        to: ADDRESS2,
        value: 7_000_000_000n,
      });
      expect(result).not.to.be.null;
    }).timeout(25_000);

    it('should return a signed EIP712 transaction', async () => {
      const result = await wallet.signTransaction({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        value: ethers.parseEther('1'),
      });
      expect(result).not.to.be.null;
    }).timeout(25_000);

    it('should throw an error when `tx.from` is mismatched from private key', async () => {
      try {
        await wallet.signTransaction({
          type: utils.EIP712_TX_TYPE,
          from: ADDRESS2,
          to: ADDRESS2,
          value: 7_000_000_000,
        });
      } catch (e) {
        expect((e as Error).message).to.contain('transaction from mismatch');
      }
    }).timeout(25_000);
  });
});
