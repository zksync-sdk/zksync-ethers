import * as chai from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet, ContractFactory} from '../../src';
import {Contract, ethers, BigNumber} from 'ethers';

const {expect} = chai;

describe('Paymaster', () => {
  const PRIVATE_KEY =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';

  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  const tokenPath = '../files/Token.json';
  const paymasterPath = '../files/Paymaster.json';

  describe('#ApprovalBased', () => {
    it('use ERC20 token to pay transaction fee', async () => {
      const INIT_MINT_AMOUNT = 10;
      const MINT_AMOUNT = 3;
      const MINIMAL_ALLOWANCE = 1;

      const abi = require(tokenPath).abi;
      const bytecode: string = require(tokenPath).bytecode;
      const factory = new ContractFactory(abi, bytecode, wallet);
      const tokenContract = (await factory.deploy(
        'Ducat',
        'Ducat',
        18
      )) as Contract;
      const tokenAddress = tokenContract.address;

      // mint tokens to wallet, so it could pay fee with tokens
      await tokenContract.mint(await wallet.getAddress(), INIT_MINT_AMOUNT);

      const paymasterAbi = require(paymasterPath).abi;
      const paymasterBytecode = require(paymasterPath).bytecode;
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
      const tokenAbi = new ethers.utils.Interface(require(tokenPath).abi);
      const tx = await wallet.sendTransaction({
        to: tokenAddress,
        data: tokenAbi.encodeFunctionData('mint', [
          await wallet.getAddress(),
          MINT_AMOUNT,
        ]),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: utils.getPaymasterParams(paymasterAddress, {
            type: 'ApprovalBased',
            token: tokenAddress,
            minimalAllowance: BigNumber.from(MINIMAL_ALLOWANCE),
            innerInput: new Uint8Array(),
          }),
        },
      });
      await tx.wait();

      const paymasterBalanceAfterTx =
        await provider.getBalance(paymasterAddress);
      const paymasterTokenBalanceAfterTx = await provider.getBalance(
        paymasterAddress,
        'latest',
        tokenAddress
      );
      const walletBalanceAfterTx = await wallet.getBalance();
      const walletTokenBalanceAfterTx = await wallet.getBalance(tokenAddress);

      expect(paymasterTokenBalanceBeforeTx.isZero()).to.be.true;
      expect(walletTokenBalanceBeforeTx.eq(BigNumber.from(INIT_MINT_AMOUNT))).to
        .be.true;

      expect(
        paymasterBalanceBeforeTx
          .sub(paymasterBalanceAfterTx)
          .gte(BigNumber.from(0))
      ).to.be.true;
      expect(paymasterTokenBalanceAfterTx.eq(BigNumber.from(MINIMAL_ALLOWANCE)))
        .to.be.true;

      expect(
        walletBalanceBeforeTx.sub(walletBalanceAfterTx).gte(BigNumber.from(0))
      ).to.be.true;
      expect(
        walletTokenBalanceAfterTx.eq(
          walletTokenBalanceBeforeTx
            .sub(BigNumber.from(MINIMAL_ALLOWANCE))
            .add(BigNumber.from(MINT_AMOUNT))
        )
      ).to.be.true;
    }).timeout(30_000);
  });
});
