import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet, ContractFactory} from '../../src';
import {BigNumber, Contract, ethers} from 'ethers';
import {ECDSASmartAccount, MultisigECDSASmartAccount} from '../../src';
import {PRIVATE_KEY1, ADDRESS1, APPROVAL_TOKEN, PAYMASTER} from '../utils';

const {expect} = chai;

import Token from '../files/Token.json';
import Paymaster from '../files/Paymaster.json';
import Storage from '../files/Storage.json';
import MultisigAccount from '../files/TwoUserMultisig.json';

describe('Account Abstraction', () => {
  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const wallet = new Wallet(PRIVATE_KEY1, provider);

  it('use the ERC20 token for paying transaction fee', async () => {
    const InitMintAmount = BigNumber.from(10);
    const mintAmount = BigNumber.from(3);
    const minimalAllowance = BigNumber.from(1);

    const abi = Token.abi;
    const bytecode: string = Token.bytecode;
    const factory = new ContractFactory(abi, bytecode, wallet);
    const tokenContract = (await factory.deploy(
      'Ducat',
      'Ducat',
      18
    )) as Contract;
    const tokenAddress = tokenContract.address;

    // mint tokens to wallet, so it could pay fee with tokens
    const mintTx = (await tokenContract.mint(
      await wallet.getAddress(),
      InitMintAmount
    )) as ethers.ContractTransaction;
    await mintTx.wait();

    const paymasterAbi = Paymaster.abi;
    const paymasterBytecode = Paymaster.bytecode;
    const accountFactory = new ContractFactory(
      paymasterAbi,
      paymasterBytecode,
      wallet,
      'createAccount'
    );
    const paymasterContract = await accountFactory.deploy(tokenAddress);
    const paymasterAddress = paymasterContract.address;

    // transfer ETH to paymaster so it could pay fee
    const faucetTx = await wallet.transfer({
      token: utils.ETH_ADDRESS,
      to: paymasterAddress,
      amount: ethers.utils.parseEther('0.01'),
    });
    await faucetTx.wait();

    const paymasterBalanceBeforeTx =
      await provider.getBalance(paymasterAddress);
    const paymasterTokenBalanceBeforeTx = await provider.getBalance(
      paymasterAddress,
      'latest',
      tokenAddress
    );
    const walletBalanceBeforeTx = await wallet.getBalance();
    const walletTokenBalanceBeforeTx = await wallet.getBalance(tokenAddress);

    // perform tx using paymaster
    const tx = await tokenContract.mint(await wallet.getAddress(), mintAmount, {
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams: utils.getPaymasterParams(paymasterAddress, {
          type: 'ApprovalBased',
          token: tokenAddress,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      },
    });
    await tx.wait();

    const paymasterBalanceAfterTx = await provider.getBalance(paymasterAddress);
    const paymasterTokenBalanceAfterTx = await provider.getBalance(
      paymasterAddress,
      'latest',
      tokenAddress
    );
    const walletBalanceAfterTx = await wallet.getBalance();
    const walletTokenBalanceAfterTx = await wallet.getBalance(tokenAddress);

    expect(paymasterTokenBalanceBeforeTx.isZero()).to.be.true;
    expect(walletTokenBalanceBeforeTx.eq(InitMintAmount)).to.be.true;

    expect(paymasterBalanceBeforeTx.sub(paymasterBalanceAfterTx).gte(0)).to.be
      .true;
    expect(paymasterTokenBalanceAfterTx.eq(minimalAllowance)).to.be.true;

    expect(walletBalanceBeforeTx.sub(walletBalanceAfterTx).gte(0)).to.be.true;
    expect(
      walletTokenBalanceAfterTx.eq(
        walletTokenBalanceBeforeTx.sub(minimalAllowance).add(mintAmount)
      )
    ).to.be.true;
  }).timeout(30_000);

  it('use multisig account', async () => {
    const storageValue = BigNumber.from(500);

    const account = ECDSASmartAccount.create(ADDRESS1, PRIVATE_KEY1, provider);

    const multisigAccountAbi = MultisigAccount.abi;
    const multisigAccountBytecode: string = MultisigAccount.bytecode;
    const factory = new ContractFactory(
      multisigAccountAbi,
      multisigAccountBytecode,
      account,
      'createAccount'
    );
    const owner1 = Wallet.createRandom();
    const owner2 = Wallet.createRandom();

    const multisigContract = await factory.deploy(
      owner1.address,
      owner2.address
    );
    const multisigAddress = multisigContract.address;

    // send ETH to multisig account
    await (
      await account.sendTransaction({
        to: multisigAddress,
        value: ethers.utils.parseEther('1'),
      })
    ).wait();

    // send paymaster approval token to multisig account
    const sendApprovalTokenTx = await new Wallet(
      PRIVATE_KEY1,
      provider
    ).transfer({
      to: multisigAddress,
      token: APPROVAL_TOKEN,
      amount: 5,
    });
    await sendApprovalTokenTx.wait();

    const multisigAccount = MultisigECDSASmartAccount.create(
      multisigAddress,
      [owner1._signingKey(), owner2._signingKey()],
      provider
    );

    // deploy storage account which will be called from multisig account
    const storageAbi = Storage.contracts['Storage.sol:Storage'].abi;
    const storageBytecode: string =
      Storage.contracts['Storage.sol:Storage'].bin;
    const storageFactory = new ContractFactory(
      storageAbi,
      storageBytecode,
      account
    );
    const storage = (await storageFactory.deploy()) as Contract;

    const multisigAccountBalanceBeforeTx = await multisigAccount.getBalance();

    const storageSetTx = await storage.populateTransaction.set(storageValue);
    const tx = await multisigAccount.sendTransaction({
      ...storageSetTx,
      // storageSetTx contains `from` value field that needs to be properly set in the sendTransaction method.
      // To ensure it's correctly handled, set 'from' to undefined.
      // Otherwise, an invalid signature length error will be thrown.
      from: undefined,
    });
    await tx.wait();

    const multisigAccountBalanceAfterTx = await multisigAccount.getBalance();
    expect(multisigAccountBalanceBeforeTx.gt(multisigAccountBalanceAfterTx)).to
      .be.true;
    expect(BigNumber.from(await storage.get()).eq(storageValue)).to.be.true;
  }).timeout(25_000);

  it('use a contract with smart account as a runner to send transactions that utilize a paymaster', async () => {
    const minimalAllowance = BigNumber.from(1);
    const storageValue = BigNumber.from(700);

    const account = ECDSASmartAccount.create(ADDRESS1, PRIVATE_KEY1, provider);

    const storageAbi = Storage.contracts['Storage.sol:Storage'].abi;
    const storageBytecode: string =
      Storage.contracts['Storage.sol:Storage'].bin;
    const storageFactory = new ContractFactory(
      storageAbi,
      storageBytecode,
      account
    );
    const storage = (await storageFactory.deploy()) as Contract;

    const accountBalanceBeforeTx = await account.getBalance();
    const accountApprovalTokenBalanceBeforeTx =
      await account.getBalance(APPROVAL_TOKEN);

    const paymasterSetTx = await storage.set(storageValue, {
      customData: {
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: APPROVAL_TOKEN,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      },
    });
    await paymasterSetTx.wait();

    const accountBalanceAfterTx = await account.getBalance();
    const accountApprovalTokenBalanceAfterTx =
      await account.getBalance(APPROVAL_TOKEN);

    expect(accountBalanceBeforeTx.eq(accountBalanceAfterTx)).to.be.true;
    expect(
      accountApprovalTokenBalanceAfterTx.eq(
        accountApprovalTokenBalanceBeforeTx.sub(minimalAllowance)
      )
    ).to.be.true;
    expect(BigNumber.from(await storage.get()).eq(storageValue)).to.be.true;
  }).timeout(25_000);
});
