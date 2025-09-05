import {Provider, utils, Wallet} from '../src/index';
import {ethers} from 'ethers';

const L1_RPC = 'http://localhost:8545'; // L1
const L2_RPC = 'http://localhost:3050'; // L2
const PRIVATE_KEY = '0x';

const l1_provider = new Provider(L1_RPC);
const l2_provider = new Provider(L2_RPC);
const wallet = new Wallet(PRIVATE_KEY, l2_provider, l1_provider);

async function main() {
  console.log(`L2 balance before withdraw: ${await wallet.getBalance()}`);
  console.log(`L1 balance before withdraw: ${await wallet.getBalanceL1()}`);

  const tx = await wallet.withdraw({
    token: utils.ETH_ADDRESS,
    to: await wallet.getAddress(),
    amount: ethers.parseEther('0.001'),
  });
  const receipt = await tx.wait();
  console.log(`Tx: ${receipt.hash}`);

  console.log(`L2 balance after withdraw: ${await wallet.getBalance()}`);
  console.log(`L1 balance after withdraw: ${await wallet.getBalanceL1()}`);
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
