import {
    Provider,
    types,
    Wallet,
    ContractFactory,
    Contract,
    utils,
  } from './src';
  import {ethers, Typed} from 'ethers';
  
  const PRIVATE_KEY =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
  
  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const ethProvider = ethers.getDefaultProvider('http://127.0.0.1:8545');
  
  const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
  
  async function main() {
    const priorityOpResponse = await wallet.deposit({
       token: utils.ETH_ADDRESS_IN_CONTRACTS,
       to: await wallet.getAddress(),
       amount: ethers.parseEther('100'),
       refundRecipient: await wallet.getAddress(),
    });
    await priorityOpResponse.waitFinalize();
  }
  
  main()
    .then()
    .catch(error => {
      console.log(`Error: ${error}`);
    });