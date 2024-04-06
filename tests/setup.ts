import {
  Provider,
  types,
  Wallet,
  ContractFactory,
  Contract,
  utils,
} from '../src';
import {ethers, Typed} from 'ethers';
import {IL1Bridge} from '../src/typechain';
import fs from 'fs';

import TokensL1 from './files/tokens.json';
import Token from './files/Token.json';
import Paymaster from './files/Paymaster.json';
import TokenL2Bridged from './files/TokenL2Bridged.json';
import TokenL1 from './files/TokenL1.json';
import CustomBridgeL1 from './files/CustomBridgeL1.json';
import CustomBridgeL2 from './files/CustomBridgeL2.json';
import DiamondProxy from './files/diamondProxy.json';

const PRIVATE_KEY =
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';

const provider = Provider.getDefaultProvider(types.Network.Localhost);
const ethProvider = ethers.getDefaultProvider('http://127.0.0.1:8545');

const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

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

// Creates token on L2 by depositing
async function createTokenL2(l1TokenAddress: string): Promise<string> {
  const priorityOpResponse = await wallet.deposit({
    token: l1TokenAddress,
    to: await wallet.getAddress(),
    amount: 100,
    approveERC20: true,
    refundRecipient: await wallet.getAddress(),
  });
  await priorityOpResponse.waitFinalize();
  return await wallet.l2TokenAddress(l1TokenAddress);
}

async function deployCustomBridges() {
  // deploy L2 token
  const l2TokenFactory = new ContractFactory(
    TokenL2Bridged.abi,
    TokenL2Bridged.bytecode,
    wallet
  );
  const l2Token = (await l2TokenFactory.deploy('USDC', 'USDC', 18)) as Contract;
  await l2Token.waitForDeployment();

  // deploy L1 token
  const l1TokenFactory = new ethers.ContractFactory(
    TokenL1.abi,
    TokenL1.bytecode,
    wallet._signerL1()
  );
  const l1Token = (await l1TokenFactory.deploy('USDC', 'USDC', 18)) as Contract;
  await l1Token.waitForDeployment();

  // mint token to L1
  const tx = (await l1Token.mint(
    wallet.address,
    ethers.parseEther('100')
  )) as ethers.ContractTransactionResponse;
  await tx.wait();

  // deploy custom bridges
  const gasPrice = (await ethProvider.getFeeData()).gasPrice!;
  const zkSync = await wallet.getMainContract();
  const requiredValueToInitializeBridge = await zkSync.l2TransactionBaseCost(
    gasPrice,
    10_000_000,
    utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT
  );
  const l1BridgeFactory = new ethers.ContractFactory(
    CustomBridgeL1.abi,
    CustomBridgeL1.bytecode,
    wallet._signerL1()
  );
  const l1Bridge = (await l1BridgeFactory.deploy(
    [CustomBridgeL2.bytecode],
    [
      await l1Token.getAddress(),
      await l2Token.getAddress(),
      DiamondProxy.address,
    ],
    requiredValueToInitializeBridge,
    {
      gasPrice,
      value: requiredValueToInitializeBridge,
      gasLimit: 10_000_000,
    }
  )) as IL1Bridge;
  await l1Bridge.waitForDeployment();

  // connect L2 token to L2 custom bridge
  await l2Token.setBridge(await l1Bridge.l2Bridge());

  return {
    l1Token: await l1Token.getAddress(),
    l2Token: await l2Token.getAddress(),
    l1Bridge: await l1Bridge.getAddress(),
    l2Bridge: await l1Bridge.l2Bridge(),
  };
}

/*
Deploy token to the L2 network through deposit transaction.
Deploy approval token and it's paymaster.
Deploy custom bridges for custom token.
 */
async function main() {
  console.log('===== Depositing DAI to L2 =====');
  const l2DAI = await createTokenL2(TokensL1[0].address);
  console.log(`L2 DAI address: ${l2DAI}`);

  console.log('===== Deploying token and paymaster =====');
  const {token, paymaster} = await deployPaymasterAndToken();
  console.log(`Token: ${token}`);
  console.log(`Paymaster: ${paymaster}`);
  console.log(`Paymaster ETH balance: ${await provider.getBalance(paymaster)}`);
  console.log(`Wallet Crown balance: ${await wallet.getBalance(token)}`);

  console.log('===== Deploying custom bridges =====');
  const customAddresses = await deployCustomBridges();
  const {l1Token, l2Token, l1Bridge, l2Bridge} = customAddresses;
  console.log(`L1 USDC address: ${l1Token}`);
  console.log(`L2 USDC address: ${l2Token}`);
  console.log(`L1 custom bridge address: ${l1Bridge}`);
  console.log(`L2 custom bridge address: ${l2Bridge}`);
  console.log(`L1 USDC balance: ${await wallet.getBalanceL1(l1Token)}`);
  console.log(`L2 USDC balance: ${await wallet.getBalance(l2Token)}`);

  fs.writeFileSync(
    'tests/files/customBridge.json',
    utils.toJSON(customAddresses)
  );
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
