import {Provider, Wallet} from '../src/index';

const L1_RPC = 'http://localhost:8545'; // L1
const L2_RPC = 'http://localhost:3050'; // L2
const PRIVATE_KEY = '0x';

const l1_provider = new Provider(L1_RPC);
const l2_provider = new Provider(L2_RPC);
const wallet = new Wallet(PRIVATE_KEY, l2_provider, l1_provider);

async function main() {
  // TODO: update to existing token
  const tokenL1 = 'Ox';
  const tokenL2 = await l2_provider.l2TokenAddress(tokenL1);

  console.log(`L2 balance before deposit: ${await wallet.getBalance(tokenL2)}`);
  console.log(
    `L1 balance before deposit: ${await wallet.getBalanceL1(tokenL1)}`
  );
  const tx = await wallet.deposit({
    token: tokenL1,
    to: await wallet.getAddress(),
    amount: 5,
    approveERC20: true,
    refundRecipient: await wallet.getAddress(),
  });
  const receipt = await tx.wait();
  console.log(`Tx: ${receipt.hash}`);

  console.log(`L2 balance after deposit: ${await wallet.getBalance(tokenL2)}`);
  console.log(
    `L1 balance after deposit: ${await wallet.getBalanceL1(tokenL1)}`
  );
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
