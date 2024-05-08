import * as chai from 'chai';
import '../custom-matchers';
import {Provider, utils, Wallet, L2VoidSigner, L1VoidSigner} from '../../src';
import {ethers, BigNumber} from 'ethers';
import {ITestnetErc20TokenFactory} from '../../src/typechain/ITestnetErc20TokenFactory';
import {IS_ETH_BASED, ADDRESS1, PRIVATE_KEY1, DAI_L1, ADDRESS2} from '../utils';

const {expect} = chai;

describe('L2VoidSigner', () => {
  const provider = Provider.getDefaultProvider();
  const signer = new L2VoidSigner(ADDRESS1, provider);

  let baseToken: string;

  before('setup', async function () {
    baseToken = await provider.getBaseTokenContractAddress();
    this.timeout(25_000);
  });

  describe('#constructor()', () => {
    it('`L2VoidSigner(address, provider)` should return a `L2VoidSigner` with L2 provider', async () => {
      const signer = new L2VoidSigner(ADDRESS1, provider);

      expect(signer.address).to.be.equal(ADDRESS1);
      expect(signer.provider).to.be.equal(provider);
    });

    it('`L2VoidSigner(address)` should return a `L2VoidSigner` without L2 provider', async () => {
      const signer = new L2VoidSigner(ADDRESS1);

      expect(signer.address).to.be.equal(ADDRESS1);
      expect(signer.provider).to.be.null;
    });
  });

  describe('#getBalance()', () => {
    it('should return the `L2VoidSigner` balance', async () => {
      const result = await signer.getBalance();
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#getAllBalances()', () => {
    it('should return all balances', async () => {
      const result = await signer.getAllBalances();
      const expected = IS_ETH_BASED ? 2 : 3;
      expect(Object.keys(result)).to.have.lengthOf(expected);
    });
  });

  describe('#getL2BridgeContracts()', () => {
    it('should return a L2 bridge contracts', async () => {
      const result = await signer.getL2BridgeContracts();
      expect(result).not.to.be.null;
    });
  });

  describe('#getAddress()', () => {
    it('should return a `L2VoidSigner` address', async () => {
      const result = await signer.getAddress();
      expect(result).to.be.equal(ADDRESS1);
    });
  });

  describe('#connect()', () => {
    it('should return a `L2VoidSigner` with provided `provider` as L2 provider', async () => {
      let signer = new L2VoidSigner(ADDRESS1);
      signer = signer.connect(provider);

      expect(signer.address).to.be.equal(ADDRESS1);
      expect(signer.provider).to.be.equal(provider);
    });
  });

  describe('#getDeploymentNonce()', () => {
    it('should return a deployment nonce', async () => {
      const result = await signer.getDeploymentNonce();
      expect(result).not.to.be.null;
    });
  });

  describe('#populateTransaction()', () => {
    it('should return populated transaction with default values if are omitted', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 2,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 270,
        maxFeePerGas: BigNumber.from(1_700_000_000),
        maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
      ]);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
      expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
      expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be.false;
    });

    it('should return populated transaction when `maxFeePerGas` and `maxPriorityFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 113,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        data: '0x',
        chainId: 270,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated transaction when `maxPriorityFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 113,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        data: '0x',
        chainId: 270,
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated transaction when `maxFeePerGas` and `customData` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 113,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        data: '0x',
        chainId: 270,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          factoryDeps: [],
        },
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated EIP1559 transaction when `maxFeePerGas` and `maxPriorityFeePerGas` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 2,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 270,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated EIP1559 transaction with `maxFeePerGas` and `maxPriorityFeePerGas` same as provided `gasPrice`', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 2,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 270,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(3_500_000_000),
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        gasPrice: BigNumber.from(3_500_000_000),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated legacy transaction when `type = 0`', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 0,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 270,
        gasPrice: BigNumber.from(100_000_000),
      };
      const result = await signer.populateTransaction({
        type: 0,
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'gasPrice']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
      expect(BigNumber.from(result.gasPrice).isZero()).to.be.false;
    });
  });

  describe('#sendTransaction()', () => {
    it('should throw an error when trying to send transaction', async () => {
      try {
        await signer.sendTransaction({
          to: ADDRESS2,
          value: 7_000_000,
          maxFeePerGas: BigNumber.from(3_500_000_000),
          maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(10_000);
  });

  describe('#withdraw()', () => {
    it('should throw an error when tyring to withdraw assets', async () => {
      try {
        await signer.withdraw({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
          amount: 7_000_000_000,
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(35_000);
  });

  describe('#transfer()', () => {
    it('should throw an error when tyring to transfer assets', async () => {
      try {
        await signer.transfer({
          token: baseToken,
          to: ADDRESS2,
          amount: 7_000_000_000,
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(25_000);
  });

  describe('#signTransaction()', () => {
    it('should throw an error when trying to sign transaction', async () => {
      try {
        await signer.signTransaction({
          type: 2,
          to: ADDRESS2,
          value: BigNumber.from(7_000_000_000),
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(25_000);
  });
});

describe('L1VoidSigner', () => {
  const provider = Provider.getDefaultProvider();
  const ethProvider = ethers.getDefaultProvider('http://localhost:8545');
  const signer = new L1VoidSigner(ADDRESS1, ethProvider, provider);

  let baseToken: string;

  before('setup', async function () {
    this.timeout(25_000);
    baseToken = await provider.getBaseTokenContractAddress();
  });

  describe('#constructor()', () => {
    it('`L1VoidSigner(privateKey, providerL1, providerL2)` should return a `L1VoidSigner` with L1 and L2 provider', async () => {
      const signer = new L1VoidSigner(ADDRESS1, ethProvider, provider);

      expect(signer.address).to.be.equal(ADDRESS1);
      expect(signer.provider).to.be.equal(ethProvider);
      expect(signer.providerL2).to.be.equal(provider);
    });

    it('`L1VoidSigner(privateKey, providerL1)` should return a `L1VoidSigner` with L1 provider', async () => {
      const signer = new L1VoidSigner(ADDRESS1, ethProvider);

      expect(signer.address).to.be.equal(ADDRESS1);
      expect(signer.provider).to.be.equal(ethProvider);
      expect(signer.providerL2).to.be.undefined;
    });

    it('`L1VoidSigner(privateKey)` should return a `L1VoidSigner` without providers', async () => {
      const signer = new L1VoidSigner(ADDRESS1);

      expect(signer.address).to.be.equal(ADDRESS1);
      expect(signer.provider).to.be.null;
      expect(signer.providerL2).to.be.undefined;
    });
  });

  describe('#getMainContract()', () => {
    it('should return the main contract', async () => {
      const result = await signer.getMainContract();
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BridgeContracts()', () => {
    it('should return a L1 bridge contracts', async () => {
      const result = await signer.getL1BridgeContracts();
      expect(result).not.to.be.null;
    });
  });

  describe('#getBalanceL1()', () => {
    it('should return a L1 balance', async () => {
      const result = await signer.getBalanceL1();
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#getAllowanceL1()', () => {
    it('should return allowance of L1 token', async () => {
      const result = await signer.getAllowanceL1(DAI_L1);
      expect(result.gte(0)).to.be.true;
    });
  });

  describe('#l2TokenAddress()', () => {
    it('should return the L2 ETH address', async () => {
      const result = await signer.l2TokenAddress(baseToken);
      expect(result).to.be.equal(utils.L2_BASE_TOKEN_ADDRESS);
    });

    it('should return the L2 DAI address', async () => {
      const result = await signer.l2TokenAddress(DAI_L1);
      expect(result).not.to.be.null;
    });

    if (!IS_ETH_BASED) {
      it('should return the L2 ETH address', async () => {
        const result = await signer.l2TokenAddress(utils.LEGACY_ETH_ADDRESS);
        expect(result).not.to.be.null;
      });
    }
  });

  describe('#approveERC20()', () => {
    it('should throw an error when approving token', async () => {
      try {
        await signer.approveERC20(utils.LEGACY_ETH_ADDRESS, 5);
      } catch (e) {
        expect((e as Error).message).to.be.equal(
          "ETH token can't be approved! The address of the token does not exist on L1."
        );
      }
    }).timeout(10_000);
  });

  describe('#getBaseCost()', () => {
    it('should return base cost of L1 transaction', async () => {
      const result = await signer.getBaseCost({gasLimit: 100_000});
      expect(result).not.to.be.null;
    });
  });

  describe('#getBalance()', () => {
    it('should return the `L1VoidSigner` balance', async () => {
      const result = await signer.getBalance();
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#getAddress()', () => {
    it('should return a `L1VoidSigner` address', async () => {
      const result = await signer.getAddress();
      expect(result).to.be.equal(ADDRESS1);
    });
  });

  describe('#connect()', () => {
    it('should return a `L1VoidSigner` with provided `provider` as L1 provider', async () => {
      let singer = new L1VoidSigner(ADDRESS1);
      singer = singer.connect(ethProvider);
      expect(singer.address).to.be.equal(ADDRESS1);
      expect(singer.provider).to.be.equal(ethProvider);
    });
  });

  describe('#connectL2()', () => {
    it('should return a `L1VoidSigner` with provided `provider` as L2 provider', async () => {
      let singer = new L1VoidSigner(ADDRESS1);
      singer = singer.connectToL2(provider);
      expect(singer.address).to.be.equal(ADDRESS1);
      expect(singer.providerL2).to.be.equal(provider);
    });
  });

  describe('#populateTransaction()', () => {
    it('should return populated transaction with default values if are omitted', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 2,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 9,
        maxFeePerGas: BigNumber.from(1_500_000_002),
        maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, [
        'gasLimit',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
      ]);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
      expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
      expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be.false;
    });

    it('should return populated EIP1559 transaction when `maxFeePerGas` and `maxPriorityFeePerGas` are provided', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 2,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 9,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated EIP1559 transaction with `maxFeePerGas` and `maxPriorityFeePerGas` same as provided `gasPrice`', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 2,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 9,
        maxFeePerGas: BigNumber.from(3_500_000_000),
        maxPriorityFeePerGas: BigNumber.from(3_500_000_000),
      };
      const result = await signer.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
        gasPrice: BigNumber.from(3_500_000_000),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });

    it('should return populated legacy transaction when `type = 0`', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000,
        type: 0,
        from: ADDRESS1,
        nonce: await signer.getNonce('pending'),
        chainId: 9,
        gasPrice: BigNumber.from(1000000001),
      };
      const result = await signer.populateTransaction({
        type: 0,
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'gasPrice']);
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
      expect(BigNumber.from(result.gasPrice).isZero()).to.be.false;
    });
  });

  describe('#sendTransaction()', () => {
    it('should throw an error when trying to send transaction', async () => {
      try {
        await signer.sendTransaction({
          to: ADDRESS2,
          value: 7_000_000,
          maxFeePerGas: BigNumber.from(3_500_000_000),
          maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(10_000);
  });

  describe('#getDepositTx()', () => {
    if (IS_ETH_BASED) {
      it('should return ETH deposit transaction', async () => {
        const tx = {
          contractAddress: ADDRESS1,
          calldata: '0x',
          l2Value: 7_000_000,
          l2GasLimit: BigNumber.from(355_704),
          mintValue: BigNumber.from(95_595_457_000_000),
          token: utils.ETH_ADDRESS_IN_CONTRACTS,
          to: ADDRESS1,
          amount: 7_000_000,
          refundRecipient: ADDRESS1,
          operatorTip: BigNumber.from(0),
          overrides: {
            maxFeePerGas: BigNumber.from(1_500_000_001),
            maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
            value: BigNumber.from(95_595_457_000_000),
          },
          gasPerPubdataByte: 800,
        };
        const result = await signer.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
          amount: 7_000_000,
          refundRecipient: await signer.getAddress(),
        });
        expect(result).to.be.deepEqualExcluding(tx, [
          'mintValue',
          'overrides',
          'l2GasLimit',
        ]);
        expect(BigNumber.from(result.mintValue).isZero()).to.be.false;
        expect(BigNumber.from(result.overrides.maxPriorityFeePerGas).isZero())
          .to.be.false;
        expect(BigNumber.from(result.overrides.maxFeePerGas).isZero()).to.be
          .false;
        expect(BigNumber.from(result.overrides.value).isZero()).to.be.false;
        expect(BigNumber.from(result.l2GasLimit).isZero()).to.be.false;
      });

      it('should return a deposit transaction with `tx.to == L1VoidSigner.getAddress()` when `tx.to` is not specified', async () => {
        const tx = {
          contractAddress: ADDRESS1,
          calldata: '0x',
          l2Value: 7_000_000,
          l2GasLimit: BigNumber.from(355_704),
          mintValue: BigNumber.from(95_595_457_000_000),
          token: utils.ETH_ADDRESS_IN_CONTRACTS,
          to: ADDRESS1,
          amount: 7_000_000,
          refundRecipient: ADDRESS1,
          operatorTip: BigNumber.from(0),
          overrides: {
            maxFeePerGas: BigNumber.from(1_500_000_001),
            maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
            value: BigNumber.from(95_595_457_000_000),
          },
          gasPerPubdataByte: 800,
        };
        const result = await signer.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000,
          refundRecipient: await signer.getAddress(),
        });
        expect(result).to.be.deepEqualExcluding(tx, [
          'mintValue',
          'overrides',
          'l2GasLimit',
        ]);
        expect(BigNumber.from(result.mintValue).isZero()).to.be.false;
        expect(BigNumber.from(result.overrides.maxPriorityFeePerGas).isZero())
          .to.be.false;
        expect(BigNumber.from(result.overrides.maxFeePerGas).isZero()).to.be
          .false;
        expect(BigNumber.from(result.overrides.value).isZero()).to.be.false;
        expect(BigNumber.from(result.l2GasLimit).isZero()).to.be.false;
      });

      it('should return DAI deposit transaction', async () => {
        const tx = {
          maxFeePerGas: BigNumber.from(1_500_000_001),
          maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
          value: BigNumber.from(107_602_662_500_000),
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
        };
        const result = await signer.getDepositTx({
          token: DAI_L1,
          to: await signer.getAddress(),
          amount: 5,
          refundRecipient: await signer.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
          'value',
        ]);
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
        expect(BigNumber.from(result.value).isZero()).to.be.false;
      });
    } else {
      it('should return ETH deposit transaction', async () => {
        const tx = {
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
          value: BigNumber.from(7_000_000),
          data: '0x24fd57fb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000010e0000000000000000000000000000000000000000000000000000bf1aaa17ee7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000062e3d000000000000000000000000000000000000000000000000000000000000032000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049000000000000000000000000842deab39809094bf5e4b77a7f97ae308adc5e5500000000000000000000000000000000000000000000000000000000006acfc0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
          maxFeePerGas: BigNumber.from(1_500_000_001),
          maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
        };
        const result = await signer.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
          amount: 7_000_000,
          refundRecipient: await signer.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
          'value',
        ]);
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
        expect(BigNumber.from(result.value).isZero()).to.be.false;
      });

      it('should return a deposit transaction with `tx.to == Wallet.getAddress()` when `tx.to` is not specified', async () => {
        const tx = {
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
          value: BigNumber.from(7_000_000),
          maxFeePerGas: BigNumber.from(1_500_000_001),
          maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
        };
        const result = await signer.getDepositTx({
          token: utils.LEGACY_ETH_ADDRESS,
          amount: 7_000_000,
          refundRecipient: await signer.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
          'value',
        ]);
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
        expect(BigNumber.from(result.value).isZero()).to.be.false;
      });

      it('should return DAI deposit transaction', async () => {
        const tx = {
          maxFeePerGas: BigNumber.from(1_500_000_001),
          maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
          from: ADDRESS1,
          to: (await provider.getBridgehubContractAddress()).toLowerCase(),
        };

        const result = await signer.getDepositTx({
          token: DAI_L1,
          to: await signer.getAddress(),
          amount: 5,
          refundRecipient: await signer.getAddress(),
        });
        result.to = result.to.toLowerCase();
        expect(result).to.be.deepEqualExcluding(tx, [
          'data',
          'maxFeePerGas',
          'maxPriorityFeePerGas',
        ]);
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
      });
    }
  });

  describe('#estimateGasDeposit()', () => {
    if (IS_ETH_BASED) {
      it('should return gas estimation for ETH deposit transaction', async () => {
        const result = await signer.estimateGasDeposit({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
          amount: 5,
          refundRecipient: await signer.getAddress(),
        });
        expect(result.isZero()).to.be.false;
      });

      it('should return gas estimation for DAI deposit transaction', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
        await (await wallet.approveERC20(DAI_L1, 5)).wait();

        const result = await signer.estimateGasDeposit({
          token: DAI_L1,
          to: await signer.getAddress(),
          amount: 5,
          refundRecipient: await signer.getAddress(),
        });
        expect(result.isZero()).to.be.false;
      }).timeout(10_000);
    } else {
      it('should throw an error for insufficient allowance when estimating gas for ETH deposit transaction', async () => {
        try {
          await signer.estimateGasDeposit({
            token: utils.LEGACY_ETH_ADDRESS,
            to: await signer.getAddress(),
            amount: 5,
            refundRecipient: await signer.getAddress(),
          });
        } catch (e) {
          expect((e as any).reason).to.include('ERC20: insufficient allowance');
        }
      }).timeout(10_000);

      it('should return gas estimation for ETH deposit transaction', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

        const token = utils.LEGACY_ETH_ADDRESS;
        const amount = 5;
        const approveParams = await signer.getDepositAllowanceParams(
          token,
          amount
        );

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await signer.estimateGasDeposit({
          token: token,
          to: await signer.getAddress(),
          amount: amount,
          refundRecipient: await signer.getAddress(),
        });
        expect(result.isZero()).to.be.false;
      }).timeout(10_000);

      it('should return gas estimation for base token deposit transaction', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

        const token = await signer.getBaseToken();
        const amount = 5;
        const approveParams = await signer.getDepositAllowanceParams(
          token,
          amount
        );

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await signer.estimateGasDeposit({
          token: token,
          to: await signer.getAddress(),
          amount: amount,
          refundRecipient: await signer.getAddress(),
        });
        expect(result.isZero()).to.be.false;
      }).timeout(10_000);

      it('should return gas estimation for DAI deposit transaction', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

        const token = DAI_L1;
        const amount = 5;
        const approveParams = await signer.getDepositAllowanceParams(
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

        const result = await signer.estimateGasDeposit({
          token: token,
          to: await signer.getAddress(),
          amount: amount,
          refundRecipient: await signer.getAddress(),
        });
        expect(result.isZero()).to.be.false;
      }).timeout(10_000);
    }
  });

  describe('#deposit()', () => {
    it('should throw an error when trying to deposit assets', async () => {
      try {
        await signer.deposit({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
          amount: 7_000_000_000,
          refundRecipient: await signer.getAddress(),
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(10_000);
  });

  describe('#claimFailedDeposit()', () => {
    it('should throw an error when trying to claim successful deposit', async () => {
      try {
        const response = await signer.deposit({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
          amount: 7_000_000_000,
          refundRecipient: await signer.getAddress(),
        });

        const tx = await response.waitFinalize();
        await signer.claimFailedDeposit(tx.transactionHash);
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(30_000);
  });

  describe('#getFullRequiredDepositFee()', () => {
    if (IS_ETH_BASED) {
      it('should return fee for ETH token deposit', async () => {
        const result = await signer.getFullRequiredDepositFee({
          token: utils.LEGACY_ETH_ADDRESS,
          to: await signer.getAddress(),
        });
        expect(BigNumber.from(result.baseCost).isZero()).to.be.false;
        expect(BigNumber.from(result.l1GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.l2GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
      }).timeout(10_000);

      it('should throw an error when there is not enough allowance to cover the deposit', async () => {
        try {
          await signer.getFullRequiredDepositFee({
            token: DAI_L1,
            to: await signer.getAddress(),
          });
        } catch (e) {
          expect((e as Error).message).to.be.equal(
            'Not enough allowance to cover the deposit!'
          );
        }
      }).timeout(10_000);

      it('should return fee for DAI token deposit', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
        const tx = await wallet.approveERC20(DAI_L1, 5);
        await tx.wait();

        const result = await signer.getFullRequiredDepositFee({
          token: DAI_L1,
          to: await signer.getAddress(),
        });
        expect(BigNumber.from(result.baseCost).isZero()).to.be.false;
        expect(BigNumber.from(result.l1GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.l2GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
      }).timeout(10_000);

      it('should throw an error when there is not enough balance for the deposit', async () => {
        try {
          await new L1VoidSigner(
            ethers.Wallet.createRandom().address,
            ethProvider,
            provider
          ).getFullRequiredDepositFee({
            token: DAI_L1,
            to: await signer.getAddress(),
          });
        } catch (e) {
          expect((e as Error).message).to.include(
            'Not enough balance for deposit!'
          );
        }
      }).timeout(10_000);
    } else {
      it('should throw an error when there is not enough base token allowance to cover the deposit', async () => {
        try {
          await new L1VoidSigner(
            ethers.Wallet.createRandom().address,
            ethProvider,
            provider
          ).getFullRequiredDepositFee({
            token: utils.LEGACY_ETH_ADDRESS,
            to: await signer.getAddress(),
          });
        } catch (e) {
          expect((e as Error).message).to.be.equal(
            'Not enough base token allowance to cover the deposit!'
          );
        }
      }).timeout(10_000);

      it('should return fee for ETH token deposit', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
        const token = utils.LEGACY_ETH_ADDRESS;
        const approveParams = await signer.getDepositAllowanceParams(token, 1);

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await signer.getFullRequiredDepositFee({
          token: token,
          to: await signer.getAddress(),
        });
        expect(BigNumber.from(result.baseCost).isZero()).to.be.false;
        expect(BigNumber.from(result.l1GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.l2GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
      }).timeout(10_000);

      it('should return fee for base token deposit', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
        const token = await signer.getBaseToken();
        const approveParams = await signer.getDepositAllowanceParams(token, 1);

        await (
          await wallet.approveERC20(
            approveParams[0].token,
            approveParams[0].allowance
          )
        ).wait();

        const result = await signer.getFullRequiredDepositFee({
          token: token,
          to: await signer.getAddress(),
        });
        expect(result).not.to.be.null;
      }).timeout(10_000);

      it('should return fee for DAI token deposit', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
        const token = DAI_L1;
        const approveParams = await signer.getDepositAllowanceParams(token, 1);

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

        const result = await signer.getFullRequiredDepositFee({
          token: token,
          to: await signer.getAddress(),
        });
        expect(BigNumber.from(result.baseCost).isZero()).to.be.false;
        expect(BigNumber.from(result.l1GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.l2GasLimit).isZero()).to.be.false;
        expect(BigNumber.from(result.maxFeePerGas).isZero()).to.be.false;
        expect(BigNumber.from(result.maxPriorityFeePerGas).isZero()).to.be
          .false;
      }).timeout(10_000);

      it('should throw an error when there is not enough token allowance to cover the deposit', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

        const token = DAI_L1;
        const randomWallet = Wallet.createRandom()
          .connectToL1(ethProvider)
          .connect(provider);

        // mint base token to random wallet
        const baseToken = ITestnetErc20TokenFactory.connect(
          await wallet.getBaseToken(),
          wallet._signerL1()
        );
        const baseTokenMintTx = await baseToken.mint(
          await randomWallet.getAddress(),
          ethers.utils.parseEther('0.5')
        );
        await baseTokenMintTx.wait();

        // transfer ETH to random wallet so that base token approval tx can be performed
        const transferTx = await new ethers.Wallet(
          PRIVATE_KEY1,
          ethProvider
        ).sendTransaction({
          to: await randomWallet.getAddress(),
          value: ethers.utils.parseEther('0.1'),
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
          await new L1VoidSigner(
            randomWallet.address,
            ethProvider,
            provider
          ).getFullRequiredDepositFee({
            token: token,
            to: await wallet.getAddress(),
          });
        } catch (e) {
          expect((e as Error).message).to.be.equal(
            'Not enough token allowance to cover the deposit!'
          );
        }
      }).timeout(20_000);
    }
  });

  describe('#getRequestExecuteTx()', () => {
    const amount = 7_000_000_000;
    if (IS_ETH_BASED) {
      it('should return request execute transaction', async () => {
        const result = await signer.getRequestExecuteTx({
          contractAddress: await provider.getBridgehubContractAddress(),
          calldata: '0x',
          l2Value: amount,
        });
        expect(result).not.to.be.null;
      });
    } else {
      it('should return request execute transaction', async () => {
        const result = await signer.getRequestExecuteTx({
          contractAddress: await signer.getAddress(),
          calldata: '0x',
          l2Value: amount,
          overrides: {nonce: 0},
        });
        expect(result).not.to.be.null;
      });
    }
  });

  describe('#estimateGasRequestExecute()', () => {
    it('should return gas estimation for request execute transaction', async () => {
      const result = await signer.estimateGasRequestExecute({
        contractAddress: await provider.getBridgehubContractAddress(),
        calldata: '0x',
        l2Value: 7_000_000_000,
      });
      expect(result.isZero()).to.be.false;
    });
  });

  describe('#requestExecute()', () => {
    if (IS_ETH_BASED) {
      it('should request transaction execution on L2 network', async () => {
        try {
          await signer.requestExecute({
            contractAddress: await provider.getBridgehubContractAddress(),
            calldata: '0x',
            l2Value: 7_000_000_000,
            l2GasLimit: 900_000,
          });
        } catch (e) {
          expect((e as Error).message).to.contain(
            'VoidSigner cannot sign transactions'
          );
        }
      }).timeout(10_000);
    } else {
      it('should request transaction execution on L2 network', async () => {
        const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);

        const amount = 7_000_000_000;
        const request = {
          contractAddress: await signer.getAddress(),
          calldata: '0x',
          l2Value: amount,
          l2GasLimit: BigNumber.from(1_319_957),
          operatorTip: 0,
          gasPerPubdataByte: 800,
          refundRecipient: await signer.getAddress(),
          overrides: {
            maxFeePerGas: BigNumber.from(1_500_000_010),
            maxPriorityFeePerGas: BigNumber.from(1_500_000_000),
            gasLimit: BigNumber.from(238_654),
            value: 0,
          },
        };

        const approveParams =
          await signer.getRequestExecuteAllowanceParams(request);
        await (
          await wallet.approveERC20(
            approveParams.token,
            approveParams.allowance
          )
        ).wait();

        try {
          await signer.requestExecute(request);
        } catch (e) {
          expect((e as Error).message).to.contain(
            'VoidSigner cannot sign transactions'
          );
        }
      }).timeout(10_000);
    }
  });

  describe('#signTransaction()', () => {
    it('should throw an error when trying to send transaction', async () => {
      try {
        await signer.sendTransaction({
          to: ADDRESS2,
          value: 7_000_000,
          maxFeePerGas: BigNumber.from(3_500_000_000),
          maxPriorityFeePerGas: BigNumber.from(2_000_000_000),
        });
      } catch (e) {
        expect((e as Error).message).to.contain(
          'VoidSigner cannot sign transactions'
        );
      }
    }).timeout(10_000);
  });
});
