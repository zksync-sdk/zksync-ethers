import {Provider, Wallet} from '../src/index';

const L1_RPC = 'http://localhost:8545'; // L1
const L2_RPC = 'http://localhost:3050'; // L2
const PRIVATE_KEY = '0x';

const l1_provider = new Provider(L1_RPC);
const l2_provider = new Provider(L2_RPC);
const wallet = new Wallet(PRIVATE_KEY, l2_provider, l1_provider);

// TODO: update with actual withdrawal transaction hash
const WITHDRAW_TX = '0x';

async function main() {
  console.log(
    `L2 balance before finalize withdrawal: ${await wallet.getBalance()}`
  );
  console.log(
    `L1 balance before finalize withdrawal: ${await wallet.getBalanceL1()}`
  );

  const res = await wallet.isWithdrawalFinalized(WITHDRAW_TX);
  console.log('Withdrawal finalized:', res);

  const finalizeWithdrawTx = await wallet.finalizeWithdrawal(WITHDRAW_TX);
  const receipt = await finalizeWithdrawTx.wait();
  console.log(`Tx: ${receipt?.hash}`);

  console.log(
    `L2 balance after finalize withdrawal: ${await wallet.getBalance()}`
  );
  console.log(
    `L1 balance after finalize withdrawal: ${await wallet.getBalanceL1()}`
  );
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
