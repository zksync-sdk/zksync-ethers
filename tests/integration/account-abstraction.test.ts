import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet, ContractFactory} from '../../src';
import {Contract, ethers, Typed} from 'ethers';
import {ECDSASmartAccount, MultisigECDSASmartAccount} from '../../src';

const {expect} = chai;

import Token from '../files/Token.json';
import Paymaster from '../files/Paymaster.json';
import Storage from '../files/Storage.json';
import MultisigAccount from '../files/TwoUserMultisig.json';

describe('Account Abstraction', () => {
  const ADDRESS = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
  const PRIVATE_KEY =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';

  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  const TOKEN = '0x841c43Fa5d8fFfdB9efE3358906f7578d8700Dd4';
  const PAYMASTER = '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174';

  it('use the ERC20 token for paying transaction fee', async () => {
    const InitMintAmount = 10n;
    const mintAmount = 3n;
    const minimalAllowance = 1n;

    const abi = Token.abi;
    const bytecode: string = Token.bytecode;
    const factory = new ContractFactory(abi, bytecode, wallet);
    const tokenContract = (await factory.deploy(
      'Ducat',
      'Ducat',
      18
    )) as Contract;
    const tokenAddress = await tokenContract.getAddress();

    // mint tokens to wallet, so it could pay fee with tokens
    const mintTx = (await tokenContract.mint(
      Typed.address(await wallet.getAddress()),
      Typed.uint256(InitMintAmount)
    )) as ethers.ContractTransactionResponse;
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
    const paymasterAddress = await paymasterContract.getAddress();

    // transfer ETH to paymaster so it could pay fee
    const faucetTx = await wallet.transfer({
      token: utils.ETH_ADDRESS,
      to: paymasterAddress,
      amount: ethers.parseEther('0.01'),
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

    expect(paymasterTokenBalanceBeforeTx === 0n).to.be.true;
    expect(walletTokenBalanceBeforeTx === InitMintAmount).to.be.true;

    expect(paymasterBalanceBeforeTx - paymasterBalanceAfterTx >= 0n).to.be.true;
    expect(paymasterTokenBalanceAfterTx === minimalAllowance).to.be.true;

    expect(walletBalanceBeforeTx - walletBalanceAfterTx >= 0n).to.be.true;
    expect(
      walletTokenBalanceAfterTx ===
        walletTokenBalanceBeforeTx - minimalAllowance + mintAmount
    ).to.be.true;
  }).timeout(30_000);

  it('use multisig account', async () => {
    const storageValue = 500n;

    const account = ECDSASmartAccount.create(ADDRESS, PRIVATE_KEY, provider);

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
    const multisigAddress = await multisigContract.getAddress();

    // send ETH to multisig account
    await (
      await account.sendTransaction({
        to: multisigAddress,
        value: ethers.parseEther('1'),
      })
    ).wait();

    // send paymaster approval token to multisig account
    const sendApprovalTokenTx = await new Wallet(
      PRIVATE_KEY,
      provider
    ).transfer({
      to: multisigAddress,
      token: TOKEN,
      amount: 5,
    });
    await sendApprovalTokenTx.wait();

    const multisigAccount = MultisigECDSASmartAccount.create(
      multisigAddress,
      [owner1.signingKey, owner2.signingKey],
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

    const storageSetTx = await storage.set.populateTransaction(storageValue);
    const tx = await multisigAccount.sendTransaction({...storageSetTx});
    await tx.wait();

    const multisigAccountBalanceAfterTx = await multisigAccount.getBalance();
    expect(multisigAccountBalanceBeforeTx > multisigAccountBalanceAfterTx).to.be
      .true;
    expect(await storage.get()).to.be.equal(storageValue);
  }).timeout(25_000);

  it('use a contract with smart account as a runner to send transactions that utilize a paymaster', async () => {
    const minimalAllowance = 1n;
    const storageValue = 700n;

    const account = ECDSASmartAccount.create(ADDRESS, PRIVATE_KEY, provider);

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
    const accountApprovalTokenBalanceBeforeTx = await account.getBalance(TOKEN);

    const paymasterSetTx = await storage.set(storageValue, {
      customData: {
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: minimalAllowance,
          innerInput: new Uint8Array(),
        }),
      },
    });
    await paymasterSetTx.wait();

    const accountBalanceAfterTx = await account.getBalance();
    const accountApprovalTokenBalanceAfterTx = await account.getBalance(TOKEN);

    expect(accountBalanceBeforeTx === accountBalanceAfterTx).to.be.true;
    expect(
      accountApprovalTokenBalanceAfterTx ===
        accountApprovalTokenBalanceBeforeTx - minimalAllowance
    ).to.be.true;
    expect(await storage.get()).to.be.equal(storageValue);
  }).timeout(25_000);
});
