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
import {BigNumber, ethers} from 'ethers';
import {ECDSASmartAccount, MultisigECDSASmartAccount} from '../../src';
import {
  IS_ETH_BASED,
  ADDRESS1,
  PRIVATE_KEY1,
  ADDRESS2,
  PRIVATE_KEY2,
  APPROVAL_TOKEN,
  PAYMASTER,
  DAI_L1,
} from '../utils';

const {expect} = chai;

import MultisigAccount from '../files/TwoUserMultisig.json';

describe('SmartAccount', async () => {
  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const ethProvider = ethers.getDefaultProvider('http://localhost:8545');
  ethProvider.pollingInterval = 300;
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
      expect(result.isZero()).to.be.false;
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
        value: BigNumber.from(7_000_000_000),
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        nonce: await account.getNonce('pending'),
        gasLimit: BigNumber.from(156_726),
        chainId: 270,
        data: '0x',
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
        gasPrice: BigNumber.from(100_000_000),
      };

      const result = await account.populateTransaction({
        type: utils.EIP712_TX_TYPE,
        to: ADDRESS2,
        value: 7_000_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'gasPrice']);
      expect(BigNumber.from(result.gasPrice).isZero()).to.be.false;
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    }).timeout(25_000);

    it('should return a populated transaction with default values if are omitted', async () => {
      const tx = {
        to: ADDRESS2,
        value: BigNumber.from(7_000_000),
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS1,
        nonce: await account.getNonce('pending'),
        chainId: 270,
        gasPrice: BigNumber.from(100_000_000),
        data: '0x',
        customData: {gasPerPubdata: 50_000, factoryDeps: []},
      };
      const result = await account.populateTransaction({
        to: ADDRESS2,
        value: 7_000_000,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['gasLimit', 'gasPrice']);
      expect(BigNumber.from(result.gasPrice).isZero()).to.be.false;
      expect(BigNumber.from(result.gasLimit).isZero()).to.be.false;
    });
  });

  describe('#signTransaction()', () => {
    it('should return a signed EIP712 transaction', async () => {
      const result = await account.signTransaction({
        to: ADDRESS2,
        value: ethers.utils.parseEther('1'),
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

  describe('#_signTypedData()', () => {
    it('should return a signed typed data', async () => {
      const result = await account._signTypedData(
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
      const amount = 7_000_000_000;
      const balanceBeforeTransfer = await provider.getBalance(ADDRESS2);
      const tx = await account.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(ADDRESS2);
      expect(result).not.to.be.null;
      expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be
        .true;
    }).timeout(25_000);

    it('should transfer ETH using paymaster to cover fee', async () => {
      const amount = BigNumber.from(7_000_000_000);
      const minimalAllowance = BigNumber.from(1);

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
        paymasterBalanceBeforeTransfer.sub(paymasterBalanceAfterTransfer).gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterTransfer
          .sub(paymasterTokenBalanceBeforeTransfer)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(
        senderBalanceBeforeTransfer.sub(senderBalanceAfterTransfer).eq(amount)
      ).to.be.true;
      expect(
        senderApprovalTokenBalanceAfterTransfer.eq(
          senderApprovalTokenBalanceBeforeTransfer.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        receiverBalanceAfterTransfer
          .sub(receiverBalanceBeforeTransfer)
          .eq(amount)
      ).to.be.true;
    }).timeout(25_000);

    it('should transfer DAI', async () => {
      const amount = 5;
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
      expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be
        .true;
    }).timeout(25_000);

    it('should transfer DAI using paymaster to cover fee', async () => {
      const amount = 5;
      const minimalAllowance = BigNumber.from(1);
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
        paymasterBalanceBeforeTransfer.sub(paymasterBalanceAfterTransfer).gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterTransfer
          .sub(paymasterTokenBalanceBeforeTransfer)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(
        senderBalanceBeforeTransfer.sub(senderBalanceAfterTransfer).eq(amount)
      ).to.be.true;
      expect(
        senderApprovalTokenBalanceAfterTransfer.eq(
          senderApprovalTokenBalanceBeforeTransfer.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        receiverBalanceAfterTransfer
          .sub(receiverBalanceBeforeTransfer)
          .eq(amount)
      ).to.be.true;
    }).timeout(25_000);
  });

  describe('#withdraw()', () => {
    it('should withdraw ETH to the L1 network', async () => {
      const amount = 7_000_000_000;
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
      expect(
        l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).gte(amount)
      ).to.be.true;
    }).timeout(35_000);

    it('should withdraw ETH to the L1 network using paymaster to cover fee', async () => {
      const amount = 7_000_000_000;
      const minimalAllowance = BigNumber.from(1);

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
        paymasterBalanceBeforeWithdrawal
          .sub(paymasterBalanceAfterWithdrawal)
          .gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal
          .sub(paymasterTokenBalanceBeforeWithdrawal)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount))
        .to.be.true;
      expect(
        l2ApprovalTokenBalanceAfterWithdrawal.eq(
          l2ApprovalTokenBalanceBeforeWithdrawal.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
    }).timeout(35_000);

    it('should withdraw DAI to the L1 network', async () => {
      const amount = 5;
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
      expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount))
        .to.be.true;
      expect(l1BalanceAfterWithdrawal.sub(l1BalanceBeforeWithdrawal).eq(amount))
        .to.be.true;
    }).timeout(35_000);

    it('should withdraw DAI to the L1 network using paymaster to cover fee', async () => {
      const amount = 5;
      const minimalAllowance = BigNumber.from(1);
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
        paymasterBalanceBeforeWithdrawal
          .sub(paymasterBalanceAfterWithdrawal)
          .gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal
          .sub(paymasterTokenBalanceBeforeWithdrawal)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(
        l2ApprovalTokenBalanceAfterWithdrawal.eq(
          l2ApprovalTokenBalanceBeforeWithdrawal.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount))
        .to.be.true;
      expect(l1BalanceAfterWithdrawal.sub(l1BalanceBeforeWithdrawal).eq(amount))
        .to.be.true;
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
    const multisigAddress = multisigContract.address;

    // send ETH to multisig account
    await (
      await deployer.sendTransaction({
        to: multisigAddress,
        value: ethers.utils.parseEther('1'),
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
      const amount = 7_000_000_000;
      const balanceBeforeTransfer = await provider.getBalance(ADDRESS2);
      const tx = await account.transfer({
        token: utils.ETH_ADDRESS,
        to: ADDRESS2,
        amount: amount,
      });
      const result = await tx.wait();
      const balanceAfterTransfer = await provider.getBalance(ADDRESS2);
      expect(result).not.to.be.null;
      expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be
        .true;
    }).timeout(25_000);

    it('should transfer ETH using paymaster to cover fee', async () => {
      const amount = 7_000_000_000;
      const minimalAllowance = BigNumber.from(1);

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
        paymasterBalanceBeforeTransfer.sub(paymasterBalanceAfterTransfer).gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterTransfer
          .sub(paymasterTokenBalanceBeforeTransfer)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(
        senderBalanceBeforeTransfer.sub(senderBalanceAfterTransfer).eq(amount)
      ).to.be.true;
      expect(
        senderApprovalTokenBalanceAfterTransfer.eq(
          senderApprovalTokenBalanceBeforeTransfer.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        receiverBalanceAfterTransfer
          .sub(receiverBalanceBeforeTransfer)
          .eq(amount)
      ).to.be.true;
    }).timeout(25_000);

    it('should transfer DAI', async () => {
      const amount = 5;
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
      expect(balanceAfterTransfer.sub(balanceBeforeTransfer).eq(amount)).to.be
        .true;
    }).timeout(25_000);

    it('should transfer DAI using paymaster to cover fee', async () => {
      const amount = 5;
      const minimalAllowance = BigNumber.from(1);
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
        paymasterBalanceBeforeTransfer.sub(paymasterBalanceAfterTransfer).gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterTransfer
          .sub(paymasterTokenBalanceBeforeTransfer)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(
        senderBalanceBeforeTransfer.sub(senderBalanceAfterTransfer).eq(amount)
      ).to.be.true;
      expect(
        senderApprovalTokenBalanceAfterTransfer.eq(
          senderApprovalTokenBalanceBeforeTransfer.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(
        receiverBalanceAfterTransfer
          .sub(receiverBalanceBeforeTransfer)
          .eq(amount)
      ).to.be.true;
    }).timeout(25_000);
  });

  describe('#withdraw()', () => {
    it('should withdraw ETH to the L1 network', async () => {
      const amount = 7_000_000_000;
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
      expect(
        l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).gte(amount)
      ).to.be.true;
    }).timeout(35_000);

    it('should withdraw ETH to the L1 network using paymaster to cover fee', async () => {
      const amount = 7_000_000_000;
      const minimalAllowance = BigNumber.from(1);

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
        paymasterBalanceBeforeWithdrawal
          .sub(paymasterBalanceAfterWithdrawal)
          .gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal
          .sub(paymasterTokenBalanceBeforeWithdrawal)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount))
        .to.be.true;
      expect(
        l2ApprovalTokenBalanceAfterWithdrawal.eq(
          l2ApprovalTokenBalanceBeforeWithdrawal.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
    }).timeout(35_000);

    it('should withdraw DAI to the L1 network', async () => {
      const amount = 5;
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
      expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount))
        .to.be.true;
      expect(l1BalanceAfterWithdrawal.sub(l1BalanceBeforeWithdrawal).eq(amount))
        .to.be.true;
    }).timeout(35_000);

    it('should withdraw DAI to the L1 network using paymaster to cover fee', async () => {
      const amount = 5;
      const minimalAllowance = BigNumber.from(1);
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
        paymasterBalanceBeforeWithdrawal
          .sub(paymasterBalanceAfterWithdrawal)
          .gte(0)
      ).to.be.true;
      expect(
        paymasterTokenBalanceAfterWithdrawal
          .sub(paymasterTokenBalanceBeforeWithdrawal)
          .eq(minimalAllowance)
      ).to.be.true;

      expect(
        l2ApprovalTokenBalanceAfterWithdrawal.eq(
          l2ApprovalTokenBalanceBeforeWithdrawal.sub(minimalAllowance)
        )
      ).to.be.true;

      expect(result).not.to.be.null;
      expect(l2BalanceBeforeWithdrawal.sub(l2BalanceAfterWithdrawal).eq(amount))
        .to.be.true;
      expect(l1BalanceAfterWithdrawal.sub(l1BalanceBeforeWithdrawal).eq(amount))
        .to.be.true;
    }).timeout(35_000);
  });
});
