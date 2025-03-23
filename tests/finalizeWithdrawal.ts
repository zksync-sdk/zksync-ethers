import {Provider, Wallet, ContractFactory, Contract, utils} from '../src';
import {ethers, Typed} from 'ethers';

const mainnetRPC = 'https://mainnet.era.zksync.io';
// const testnetRPC = 'https://testnet.era.zksync.dev';
const l1RPC =
  'https://eth-mainnet.g.alchemy.com/v2/HoW4n0BojRWAPFNlKeFE2rGWlSBCUvuY';

const provider = new Provider(mainnetRPC);
const PRIVATE_KEY =
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
const ethProvider = ethers.getDefaultProvider(l1RPC);
const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
async function main() {
  const tx = await wallet.finalizeWithdrawal(
    '0x6cbe295f401101a890f5442ad6cce45a93c5c409842932574f23da62ef77b589'
  );

  console.log(tx);
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
