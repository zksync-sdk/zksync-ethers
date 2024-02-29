import * as chai from 'chai';
import '../custom-matchers';
import {
  SmartAccount,
  Provider,
  types,
  utils,
  Wallet,
  ContractFactory,
} from '../../src';
import {ethers} from 'ethers';
import {ECDSASmartAccount, MultisigECDSASmartAccount} from '../../src';
import {
  IS_ETH_BASED,
  ADDRESS1,
  PRIVATE_KEY1,
  ADDRESS2,
  PRIVATE_KEY2,
  DAI_L1,
  APPROVAL_TOKEN,
  PAYMASTER,
} from '../utils';

const {expect} = chai;

import MultisigAccount from '../files/TwoUserMultisig.json';

describe('SmartAccount', async () => {
  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const ethProvider = ethers.getDefaultProvider('http://localhost:8545');
  const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
  const account = new SmartAccount(
    {address: ADDRESS1, secret: PRIVATE_KEY1},
    provider
  );

  describe('#constructor()', () => {
    it('`SmartAccount(address, {address, secret}, provider)` should return a `SmartAccount` with signer and provider', () => {
      const account = new SmartAccount(
        {address: ADDRESS1, secret: PRIVATE_KEY1},
        provider
      );
      expect(account.address).to.be.equal(ADDRESS1);
      expect(account.secret).to.be.equal(PRIVATE_KEY1);
      expect(account.provider).to.be.equal(provider);
    });

    it('`SmartAccount(address, {address, secret})` should return a `SmartAccount` with signer', () => {
      const account = new SmartAccount({
        address: ADDRESS1,
        secret: PRIVATE_KEY1,
      });
      expect(account.address).to.be.equal(ADDRESS1);
      expect(account.secret).to.be.equal(PRIVATE_KEY1);
      expect(account.provider).to.be.null;
    });

    it('`SmartWallet(address, {address, secret, payloadSigner, transactionBuilder}, provider)` should return a `SmartAccount` with custom payload signing method', async () => {
      const account = new SmartAccount(
        {
          address: ADDRESS1,
          secret: PRIVATE_KEY1,
          payloadSigner: async () => {
            return '0x';
          },
          transactionBuilder: async () => {
            return {};
          },
        },
        provider
      );

      expect(account.address).to.be.equal(ADDRESS1);
      expect(account.secret).to.be.equal(PRIVATE_KEY1);
      expect(account.provider).to.be.equal(provider);
    });
  });

  describe('#connect()', () => {
    it('should return a `SmartAccount` with provided `provider` as a provider', async () => {
      const newProvider = Provider.getDefaultProvider(types.Network.Localhost);
      let account = new SmartAccount(
        {address: ADDRESS1, secret: PRIVATE_KEY1},
        provider
      );
      account = account.connect(newProvider);
      expect(account.address).to.be.equal(ADDRESS1);
      expect(account.secret).to.be.equal(PRIVATE_KEY1);
      expect(account.provider).to.be.equal(newProvider);
    });

    it('should return a `SmartAccount` with no `provider` when `null` is used', async () => {
      let account = new SmartAccount(
        {address: ADDRESS1, secret: PRIVATE_KEY1},
        provider
      );
      account = account.connect(null);
      expect(account.address).to.be.equal(ADDRESS1);
      expect(account.secret).to.be.equal(PRIVATE_KEY1);
      expect(account.provider).to.be.equal(null);
    });
  });

  describe('#getAddress()', () => {
    it('should return the `SmartAccount` address', async () => {
      const account = new SmartAccount(
        {address: ADDRESS1, secret: PRIVATE_KEY1},
        provider
      );
      const result = await account.getAddress();
      expect(result).to.be.equal(ADDRESS1);
    });
  });

  describe('#getBalance()', () => {
    it('should return a `SmartAccount` balance', async () => {
      const result = await account.getBalance();
      expect(result > 0n).to.be.true;
    });
  });

  describe('#getAllBalances()', () => {
    it('should return all balances', async () => {
      const result = await account.getAllBalances();
      const expected = IS_ETH_BASED ? 2 : 3;
      expect(Object.keys(result)).to.have.lengthOf(expected);
    });
  });

  describe('#getDeploymentNonce()', () => {
    it('should return the deployment nonce', async () => {
      const result = await account.getDeploymentNonce();
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
        nonce: await account.getNonce('pending'),
        gasLimit: 156_726n,
        chainId: 270n,
        data: '0x',
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
        gasPrice: 100_000_000n,
      };

      const result = await account.populateTransaction({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        value: 7_000_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
      expect(BigInt(result.gasPrice!) > 0n).to.be.true;
    }).timeout(25_000);

    it('should return a populated transaction with default values if are omitted', async () => {
      const tx = {
        to: ADDRESS2,
        value: 7_000_000n,
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        nonce: await account.getNonce('pending'),
        chainId: 270n,
        gasPrice: 100_000_000n,
        data: '0x',
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
      };
      const result = await account.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit']);
      expect(BigInt(result.gasLimit!) > 0n).to.be.true;
    });
  });

  describe('#signTransaction()', () => {
    it('should return a signed EIP712 transaction', async () => {
      const result = await account.signTransaction({
        to: ADDRESS2,
        value: ethers.parseEther('1'),
      });
      expect(result).not.to.be.null;
    }).timeout(25_000);
  });

  describe('#signMessage()', () => {
    it('should return a signed message', async () => {
      const result = await account.signMessage('Hello World!');
      expect(result).to.be.equal(
        '0x7c15eb760c394b0ca49496e71d841378d8bfd4f9fb67e930eb5531485329ab7c67068d1f8ef4b480ec327214ee6ed203687e3fbe74b92367b259281e340d16fd1c'
      );
    }).timeout(25_000);
  });

  describe('#signTypedData()', () => {
    it('should return a signed typed data', async () => {
      const result = await account.signTypedData(
        {name: 'Example', version: '1', chainId: 270},
        {
          Person: [
            {name: 'name', type: 'string'},
            {name: 'age', type: 'uint8'},
          ],
        },
        {name: 'John', age: 30}
      );
      expect(result).to.be.equal(
        '0xbcaf0673c0c2b0e120165d207d42281d0c6e85f0a7f6b8044b0578a91cf5bda66b4aeb62aca4ae17012a38d71c9943e27285792fa7d788d848f849e3ea2e614b1b'
      );
    }).timeout(25_000);
  });

  describe('#transfer()', () => {
    it('should transfer ETH', async () => {
      const amount = 7_000_000_000n;
      const balanceBeforeTransfer = await provider.getBalance(ADDRESS2);
      const tx = await account.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(ADDRESS2);
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
        APPROVAL_TOKEN
      );
      const senderBalanceBeforeTransfer = await account.getBalance();
      const senderApprovalTokenBalanceBeforeTransfer =
        await account.getBalance(APPROVAL_TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(ADDRESS2);

      const tx = await account.transfer({
        token: utils.ETH_ADDRESS,
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
      const senderBalanceAfterTransfer = await account.getBalance();
      const senderApprovalTokenBalanceAfterTransfer =
        await account.getBalance(APPROVAL_TOKEN);
      const receiverBalanceAfterTransfer = await provider.getBalance(ADDRESS2);

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
        ADDRESS2,
        'latest',
        l2DAI
      );
      const tx = await account.transfer({
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
      const senderBalanceBeforeTransfer = await account.getBalance(l2DAI);
      const senderApprovalTokenBalanceBeforeTransfer =
        await account.getBalance(APPROVAL_TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(
        ADDRESS2,
        'latest',
        l2DAI
      );

      const tx = await account.transfer({
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
      const senderBalanceAfterTransfer = await account.getBalance(l2DAI);
      const senderApprovalTokenBalanceAfterTransfer =
        await account.getBalance(APPROVAL_TOKEN);
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

  describe('#withdraw()', () => {
    it('should withdraw ETH to the L1 network', async () => {
      const amount = 7_000_000_000n;
      const l2BalanceBeforeWithdrawal = await account.getBalance();
      const withdrawTx = await account.withdraw({
        token: utils.ETH_ADDRESS,
        to: await account.getAddress(),
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();
      const l2BalanceAfterWithdrawal = await account.getBalance();
      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal >= amount).to
        .be.true;
    }).timeout(35_000);

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
      const l2BalanceBeforeWithdrawal = await account.getBalance();
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

      const withdrawTx = await account.withdraw({
        token: utils.ETH_ADDRESS,
        to: await account.getAddress(),
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
      const l2BalanceAfterWithdrawal = await account.getBalance();
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

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
    }).timeout(35_000);

    it('should withdraw DAI to the L1 network', async () => {
      const amount = 5n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const l2BalanceBeforeWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);

      const withdrawTx = await account.withdraw({
        token: l2DAI,
        to: await account.getAddress(),
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();
      const l2BalanceAfterWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
        amount
      );
      expect(l1BalanceAfterWithdrawal - l1BalanceBeforeWithdrawal).to.be.equal(
        amount
      );
    }).timeout(35_000);

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
      const l2BalanceBeforeWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

      const withdrawTx = await account.withdraw({
        token: l2DAI,
        to: await account.getAddress(),
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
      const l2BalanceAfterWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

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
    }).timeout(35_000);
  });
});

describe('MultisigECDSASmartAccount', async () => {
  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const ethProvider = ethers.getDefaultProvider('http://localhost:8545');
  const wallet = new Wallet(PRIVATE_KEY1, provider, ethProvider);
  let account: SmartAccount;

  before('setup', async function () {
    this.timeout(25_000);

    const deployer = ECDSASmartAccount.create(ADDRESS1, PRIVATE_KEY1, provider);

    const multisigAccountAbi = MultisigAccount.abi;
    const multisigAccountBytecode: string = MultisigAccount.bytecode;
    const factory = new ContractFactory(
      multisigAccountAbi,
      multisigAccountBytecode,
      deployer,
      'createAccount'
    );
    const owner1 = new Wallet(PRIVATE_KEY1);
    const owner2 = new Wallet(PRIVATE_KEY2);
    const multisigContract = await factory.deploy(
      owner1.address,
      owner2.address
    );
    const multisigAddress = await multisigContract.getAddress();

    // send ETH to multisig account
    await (
      await deployer.sendTransaction({
        to: multisigAddress,
        value: ethers.parseEther('1'),
      })
    ).wait();

    // send paymaster approval token to multisig account
    const sendApprovalTokenTx = await deployer.transfer({
      to: multisigAddress,
      token: APPROVAL_TOKEN,
      amount: 5,
    });
    await sendApprovalTokenTx.wait();

    // send DAI token to multisig account
    const sendTokenTx = await deployer.transfer({
      to: multisigAddress,
      token: await provider.l2TokenAddress(DAI_L1),
      amount: 20,
    });
    await sendTokenTx.wait();

    account = MultisigECDSASmartAccount.create(
      multisigAddress,
      [PRIVATE_KEY1, PRIVATE_KEY2],
      provider
    );
  });

  describe('#transfer()', () => {
    it('should transfer ETH', async () => {
      const amount = 7_000_000_000n;
      const balanceBeforeTransfer = await provider.getBalance(ADDRESS2);
      const tx = await account.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(ADDRESS2);
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
        APPROVAL_TOKEN
      );
      const senderBalanceBeforeTransfer = await account.getBalance();
      const senderApprovalTokenBalanceBeforeTransfer =
        await account.getBalance(APPROVAL_TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(ADDRESS2);

      const tx = await account.transfer({
        token: utils.ETH_ADDRESS,
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
      const senderBalanceAfterTransfer = await account.getBalance();
      const senderApprovalTokenBalanceAfterTransfer =
        await account.getBalance(APPROVAL_TOKEN);
      const receiverBalanceAfterTransfer = await provider.getBalance(ADDRESS2);

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
        ADDRESS2,
        'latest',
        l2DAI
      );
      const tx = await account.transfer({
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
      const senderBalanceBeforeTransfer = await account.getBalance(l2DAI);
      const senderApprovalTokenBalanceBeforeTransfer =
        await account.getBalance(APPROVAL_TOKEN);
      const receiverBalanceBeforeTransfer = await provider.getBalance(
        ADDRESS2,
        'latest',
        l2DAI
      );

      const tx = await account.transfer({
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
      const senderBalanceAfterTransfer = await account.getBalance(l2DAI);
      const senderApprovalTokenBalanceAfterTransfer =
        await account.getBalance(APPROVAL_TOKEN);
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

  describe('#withdraw()', () => {
    it('should withdraw ETH to the L1 network', async () => {
      const amount = 7_000_000_000n;
      const l2BalanceBeforeWithdrawal = await account.getBalance();
      const withdrawTx = await account.withdraw({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(), // send to L1 EOA since AA does not exit on L1
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();
      const l2BalanceAfterWithdrawal = await account.getBalance();
      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal >= amount).to
        .be.true;
    }).timeout(35_000);

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
      const l2BalanceBeforeWithdrawal = await account.getBalance();
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

      const withdrawTx = await account.withdraw({
        token: utils.ETH_ADDRESS,
        to: await wallet.getAddress(), // send to L1 EOA since AA does not exit on L1
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
      const l2BalanceAfterWithdrawal = await account.getBalance();
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

      expect(
        paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0
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
    }).timeout(35_000);

    it('should withdraw DAI to the L1 network', async () => {
      const amount = 5n;
      const l2DAI = await provider.l2TokenAddress(DAI_L1);
      const l2BalanceBeforeWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);

      const withdrawTx = await account.withdraw({
        token: l2DAI,
        to: await wallet.getAddress(), // send to L1 EOA since AA does not exit on L1
        amount: amount,
      });
      await withdrawTx.waitFinalize();
      expect(await wallet.isWithdrawalFinalized(withdrawTx.hash)).to.be.false;

      const finalizeWithdrawTx = await wallet.finalizeWithdrawal(
        withdrawTx.hash
      );
      const result = await finalizeWithdrawTx.wait();

      const l2BalanceAfterWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
        amount
      );
      expect(l1BalanceAfterWithdrawal - l1BalanceBeforeWithdrawal).to.be.equal(
        amount
      );
    }).timeout(35_000);

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
      const l2BalanceBeforeWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceBeforeWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceBeforeWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

      const withdrawTx = await account.withdraw({
        token: l2DAI,
        to: await wallet.getAddress(), // send to L1 EOA since AA does not exit on L1
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
      const l2BalanceAfterWithdrawal = await account.getBalance(l2DAI);
      const l1BalanceAfterWithdrawal = await wallet.getBalanceL1(DAI_L1);
      const l2ApprovalTokenBalanceAfterWithdrawal =
        await account.getBalance(APPROVAL_TOKEN);

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
    }).timeout(35_000);
  });
});
