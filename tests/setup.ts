import {
  Provider,
  types,
  Wallet,
  ContractFactory,
  Contract,
  utils,
} from '../src';
import {ethers, Typed} from 'ethers';
import {ITestnetERC20Token__factory} from '../src/typechain';

import Token from './files/Token.json';
import Paymaster from './files/Paymaster.json';

const PRIVATE_KEY =
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';

const provider = Provider.getDefaultProvider(types.Network.Localhost);
const ethProvider = ethers.getDefaultProvider('http://127.0.0.1:8545');

const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55';

const SALT =
  '0x293328ad84b118194c65a0dc0defdb6483740d3163fd99b260907e15f2e2f642';
const TOKEN = '0x841c43Fa5d8fFfdB9efE3358906f7578d8700Dd4'; // deployed by using create2 and SALT
const PAYMASTER = '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174'; // approval based paymaster for TOKEN deployed by using create2 and SALT

// Deploys token and approval based paymaster for that token using create2 method.
// Mints tokens to wallet and sends ETH to paymaster.
async function deployPaymasterAndToken(): Promise<{
  token: string;
  paymaster: string;
}> {
  const abi = Token.abi;
  const bytecode: string = Token.bytecode;
  const factory = new ContractFactory(abi, bytecode, wallet, 'create2');
  const tokenContract = (await factory.deploy('Crown', 'Crown', 18, {
    customData: {salt: SALT},
  })) as Contract;
  const tokenAddress = await tokenContract.getAddress();

  // mint tokens to wallet
  const mintTx = (await tokenContract.mint(
    Typed.address(await wallet.getAddress()),
    Typed.uint256(50)
  )) as ethers.ContractTransactionResponse;
  await mintTx.wait();

  const paymasterAbi = Paymaster.abi;
  const paymasterBytecode = Paymaster.bytecode;

  const accountFactory = new ContractFactory(
    paymasterAbi,
    paymasterBytecode,
    wallet,
    'create2Account'
  );

  const paymasterContract = await accountFactory.deploy(tokenAddress, {
    customData: {salt: SALT},
  });
  const paymasterAddress = await paymasterContract.getAddress();

  // transfer ETH to paymaster so it could pay fee
  const faucetTx = await wallet.transfer({
    token: utils.ETH_ADDRESS,
    to: paymasterAddress,
    amount: ethers.parseEther('100'),
  });
  await faucetTx.wait();

  if (ethers.getAddress(TOKEN) !== ethers.getAddress(tokenAddress)) {
    throw new Error('token addresses mismatch');
  }

  if (ethers.getAddress(PAYMASTER) !== ethers.getAddress(paymasterAddress)) {
    throw new Error('paymaster addresses mismatch');
  }

  return {token: tokenAddress, paymaster: paymasterAddress};
}

/*
Mints tokens on L1 in case L2 is non-ETH based chain.
It mints based token, provided alternative tokens (different from base token) and wETH.
*/
async function mintTokensOnL1(l1Token: string) {
  if (l1Token !== utils.ETH_ADDRESS_IN_CONTRACTS) {
    const token = ITestnetERC20Token__factory.connect(
      l1Token,
      wallet._signerL1()
    );
    const mintTx = await token.mint(
      await wallet.getAddress(),
      ethers.parseEther('20000')
    );
    await mintTx.wait();
  }
}

/*
Send base token to L2 in case L2 in non-ETH base chain.
*/
async function sendTokenToL2(l1TokenAddress: string) {
  const priorityOpResponse = await wallet.deposit({
    token: l1TokenAddress,
    to: await wallet.getAddress(),
    amount: ethers.parseEther('10000'),
    approveERC20: true,
    approveBaseERC20: true,
    refundRecipient: await wallet.getAddress(),
  });
  const receipt = await priorityOpResponse.waitFinalize();
  console.log(`Send funds tx: ${receipt.hash}`);
}

async function main() {
  const baseToken = await wallet.getBaseToken();
  console.log(`Wallet address: ${await wallet.getAddress()}`);
  console.log(`Base token L1: ${baseToken}`);

  console.log(
    `L1 base token balance before: ${await wallet.getBalanceL1(baseToken)}`
  );
  console.log(`L2 base token balance before: ${await wallet.getBalance()}`);

  await mintTokensOnL1(baseToken);
  await sendTokenToL2(baseToken);

  console.log(
    `L1 base token balance after: ${await wallet.getBalanceL1(baseToken)}`
  );
  console.log(`L2 base token balance after: ${await wallet.getBalance()} \n`);

  if (baseToken !== utils.ETH_ADDRESS_IN_CONTRACTS) {
    const l2EthAddress = await wallet.l2TokenAddress(
      utils.ETH_ADDRESS_IN_CONTRACTS
    );
    console.log(`ETH L1: ${utils.ETH_ADDRESS_IN_CONTRACTS}`);
    console.log(`ETH L2: ${l2EthAddress}`);

    console.log(`L1 ETH balance before: ${await wallet.getBalanceL1()}`);
    console.log(
      `L2 ETH balance before: ${await wallet.getBalance(l2EthAddress)}`
    );

    await mintTokensOnL1(utils.ETH_ADDRESS_IN_CONTRACTS);
    await sendTokenToL2(utils.ETH_ADDRESS_IN_CONTRACTS);

    console.log(`L1 ETH balance after: ${await wallet.getBalanceL1()}`);
    console.log(
      `L2 ETH balance after: ${await wallet.getBalance(l2EthAddress)}\n`
    );
  }

  const l2DAIAddress = await wallet.l2TokenAddress(DAI_L1);
  console.log(`DAI L1: ${DAI_L1}`);
  console.log(`DAI L2: ${l2DAIAddress}`);

  console.log(`L1 DAI balance before: ${await wallet.getBalanceL1(DAI_L1)}`);
  console.log(
    `L2 DAI balance before: ${await wallet.getBalance(l2DAIAddress)}`
  );

  await mintTokensOnL1(DAI_L1);
  await sendTokenToL2(DAI_L1);

  console.log(`L1 DAI balance after: ${await wallet.getBalanceL1(DAI_L1)}`);
  console.log(`L2 DAI balance after: ${await wallet.getBalance(l2DAIAddress)}`);

  console.log('===== Deploying token and paymaster =====');
  const {token, paymaster} = await deployPaymasterAndToken();
  console.log(`Token: ${token}`);
  console.log(`Paymaster: ${paymaster}`);
  console.log(`Paymaster ETH balance: ${await provider.getBalance(paymaster)}`);
  console.log(`Wallet Crown balance: ${await wallet.getBalance(token)}`);
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
