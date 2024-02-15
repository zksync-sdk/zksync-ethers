import {Provider, types, utils} from '../src';

/*
Waits until node is ready to receive traffic. It's used to wait for local environment setup.
 */
async function main() {
  const maxAttempts = 30;
  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await provider.getNetwork();
      return;
    } catch (error) {
      await utils.sleep(20_000);
    }
  }
  throw new Error('Maximum retries exceeded.');
}

main()
  .then()
  .catch(error => {
    console.log(`Error: ${error}`);
  });
