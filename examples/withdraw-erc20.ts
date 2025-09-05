import {Provider, Wallet} from '../src/index';

const L1_RPC = 'http://localhost:8545'; // L1
const L2_RPC = 'http://localhost:3050'; // L2
const PRIVATE_KEY = '0x';

const l1_provider = new Provider(L1_RPC);
const l2_provider = new Provider(L2_RPC);
const wallet = new Wallet(PRIVATE_KEY, l2_provider, l1_provider);

async function main() {
  // TODO: update to existing token
  const tokenL1 = '0x';
  const tokenL2 = await l2_provider.l2TokenAddress(tokenL1);
  console.log(`L2 balance before withdrawal: ${await wallet.getBalance()}`);
  console.log(`L1 balance before withdrawal: ${await wallet.getBalanceL1()}`);

  const tx = await wallet.withdraw({
    token: tokenL2,
    to: await wallet.getAddress(),
    amount: 5,
  });
  const receipt = await tx.wait();
  console.log(`Tx: ${receipt.hash}`);
}

main()
  .then(() => {})
  .catch(error => {
    console.log(`Error: ${error}`);
  });
