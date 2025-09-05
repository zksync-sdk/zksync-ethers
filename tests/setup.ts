import {Provider, Wallet, utils} from '../src';
import {ethers, Typed, ContractFactory, Contract} from 'ethers';
import {
  ITestnetERC20Token__factory,
  IL2NativeTokenVault__factory,
  IERC20__factory,
} from '../src/typechain';
import MintableERC20Artifact from './files/MintableERC20.json';
import {L1_CHAIN_URL, L2_CHAIN_URL, NTV_ADDRESS} from './utils';

const PRIVATE_KEY =
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';

const provider = new Provider(L2_CHAIN_URL);
const ethProvider = new ethers.JsonRpcProvider(L1_CHAIN_URL);
export let APPROVAL_TOKEN = ethers.ZeroAddress;
export let DAI_L1 = ethers.ZeroAddress;

const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

// Deploys token
// Mints tokens to wallet
// TODO: may need to deploy token via create2?
async function deployToken(): Promise<{
  token: string;
}> {
  const abi = MintableERC20Artifact.abi;
  const bytecode = MintableERC20Artifact.bytecode;
  const factory = new ContractFactory(abi, bytecode, wallet);

  const tokenContract = (await factory.deploy('Crown', 'Crown', 18, {
    gasLimit: 6000000,
  })) as Contract;
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();

  // mint tokens to wallet
  const mintTx = (await tokenContract.mint(
    Typed.address(await wallet.getAddress()),
    Typed.uint256(50)
  )) as ethers.ContractTransactionResponse;
  await mintTx.wait();
  APPROVAL_TOKEN = tokenAddress;

  return {token: tokenAddress};
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
    const rec = await mintTx.wait();
    console.log(rec);
  }
}

export async function deployDaiTokenL1(): Promise<`0x${string}`> {
  const {abi, bytecode} = MintableERC20Artifact as unknown as {
    abi: any;
    bytecode: `0x${string}`;
  };
  const factory = new ContractFactory(abi, bytecode, wallet._signerL1());
  const dai = await factory.deploy('Dai Stablecoin', 'DAI', 18);
  await dai.waitForDeployment();
  DAI_L1 = await dai.getAddress();
  return (await dai.getAddress()) as `0x${string}`;
}

/*
Send base token to L2 in case L2 in non-ETH base chain.
*/
async function sendTokenToL2(l1TokenAddress: string) {
  const priorityOpResponse = await wallet.deposit({
    token: l1TokenAddress,
    to: await wallet.getAddress(),
    amount: ethers.parseEther('1'),
    approveERC20: true,
    approveBaseERC20: true,
    refundRecipient: await wallet.getAddress(),
  });
  console.log(`Deposit tx: ${priorityOpResponse.hash}`);
  const receipt = await priorityOpResponse.waitFinalize();
  console.log(`Send funds tx: ${receipt.hash}`);
}

/*
Prepare L2 native bridging: register token and approve NTV.
*/
async function prepareL2NativeBridging(l2TokenAddress: string) {
  const crownContract = IERC20__factory.connect(
    l2TokenAddress,
    wallet._signerL2()
  );
  const ntv = IL2NativeTokenVault__factory.connect(NTV_ADDRESS, wallet);
  const ntvRegisterTx = await ntv.registerToken(l2TokenAddress);
  await ntvRegisterTx.wait();
  console.log('Crown token registered with ntv');

  const tokenApprovalTx = await crownContract.approve(
    NTV_ADDRESS,
    await wallet.getBalance(l2TokenAddress)
  );
  await tokenApprovalTx.wait();
}

async function main() {
  const baseToken = await wallet.getBaseToken();
  console.log(`Wallet address: ${await wallet.getAddress()}`);
  console.log(`Base token L1: ${baseToken}`);
  const daiAddress = await deployDaiTokenL1();
  console.log(`DAI token deployed at: ${daiAddress}`);
  console.log(`L1 base token balance before: ${await wallet.getBalanceL1()}`);
  console.log(`L2 base token balance before: ${await wallet.getBalance()}`);

  await mintTokensOnL1(baseToken);
  console.log('Minted tokens on L1', baseToken);
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

  const l2DAIAddress = await wallet.l2TokenAddress(daiAddress);
  console.log(`DAI L1: ${daiAddress}`);
  console.log(`DAI L2: ${l2DAIAddress}`);

  console.log(
    `L1 DAI balance before: ${await wallet.getBalanceL1(daiAddress)}`
  );
  console.log(
    `L2 DAI balance before: ${await wallet.getBalance(l2DAIAddress)}`
  );

  await mintTokensOnL1(daiAddress);
  await sendTokenToL2(daiAddress);

  console.log(`L1 DAI balance after: ${await wallet.getBalanceL1(daiAddress)}`);
  console.log(`L2 DAI balance after: ${await wallet.getBalance(l2DAIAddress)}`);

  console.log('===== Deploying token =====');
  const {token} = await deployToken();
  console.log(`Token: ${token}`);
  console.log(`Wallet Crown balance: ${await wallet.getBalance(token)}`);
  console.log(`Crown token address: ${token}.`);

  await prepareL2NativeBridging(token);
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
