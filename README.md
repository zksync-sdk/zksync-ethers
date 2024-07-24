# 🚀 zksync-ethers JavaScript SDK 🚀

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE-MIT)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-orange)](LICENSE-APACHE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange)](.github/CONTRIBUTING.md)
[![X (formerly Twitter) Follow](https://badgen.net/badge/twitter/@zksyncDevs/1DA1F2?icon&label)](https://x.com/zksyncDevs)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

[![ZKsync Era Logo](logo.svg)](https://zksync.io/)

In order to provide easy access to all the features of ZKsync Era, the `zksync-ethers` JavaScript SDK was created,
which is made in a way that has an interface very similar to those of [ethers](https://docs.ethers.io/v6/). In
fact, `ethers` is a peer dependency of our library and most of the objects exported by `zksync-ethers` (
e.g. `Wallet`, `Provider` etc.) inherit from the corresponding `ethers` objects and override only the fields that need
to be changed.

While most of the existing SDKs should work out of the box, deploying smart contracts or using unique ZKsync features,
like account abstraction, requires providing additional fields to those that Ethereum transactions have by default.

The library is made in such a way that after replacing `ethers` with `zksync-ethers` most client apps will work out of
box.

🔗 For a detailed walkthrough, refer to the [official documentation](https://docs.zksync.io/sdk/js/ethers/v5/getting-started).

## 📌 Overview

To begin, it is useful to have a basic understanding of the types of objects available and what they are responsible for, at a high level:

-   `Provider` provides connection to the ZKsync Era blockchain, which allows querying the blockchain state, such as account, block or transaction details,
    querying event logs or evaluating read-only code using call. Additionally, the client facilitates writing to the blockchain by sending
    transactions.
-   `Wallet` wraps all operations that interact with an account. An account generally has a private key, which can be used to sign a variety of
    types of payloads. It provides easy usage of the most common features.

## 🛠 Prerequisites

-   `node: >= 16` ([installation guide](https://nodejs.org/en/download/package-manager))
-   `ethers: ^5.7.0`

## 📥 Installation & Setup

```bash
yarn add zksync-ethers@5
yarn add ethers@5 # ethers is a peer dependency of zksync-ethers
```

## 📝 Examples

The complete examples with various use cases are available [here](https://github.com/zksync-sdk/zksync2-examples/tree/main/js).

### Connect to the ZKsync Era network:

```ts
import { Provider, utils, types } from "zksync-ethers";
import { ethers } from "ethers";

const provider = Provider.getDefaultProvider(types.Network.Sepolia); // ZKsync Era testnet (L2)
const ethProvider = ethers.getDefaultProvider("sepolia"); // sepolia testnet (L1)
```

### Get the latest block number

```ts
const blockNumber = await provider.getBlockNumber();
```

### Get the latest block

```ts
const block = await provider.getBlock("latest");
```

### Create a wallet

```ts
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
```

### Check account balances

```ts
const ethBalance = await wallet.getBalance(); // balance on ZKsync Era network

const ethBalanceL1 = await wallet.getBalanceL1(); // balance on Sepolia network
```

### Transfer funds

Transfer funds among accounts on L2 network.

```ts
const receiver = Wallet.createRandom();

const transfer = await wallet.transfer({
    to: receiver,
    token: utils.ETH_ADDRESS,
    amount: ethers.utils.parseEther("1.0"),
});
```

### Deposit funds

Transfer funds from L1 to L2 network.

```ts
const deposit = await wallet.deposit({
    token: utils.ETH_ADDRESS,
    amount: ethers.utils.parseEther("1.0"),
});
```

### Withdraw funds

Transfer funds from L2 to L1 network.

```ts
const withdrawal = await wallet.withdraw({
    token: utils.ETH_ADDRESS,
    amount: ethers.utils.parseEther("1.0"),
});
```

## 🤖 Running tests

In order to run test you need to run [local-setup](https://github.com/matter-labs/local-setup) on your machine.
For running tests, use:

```shell
yarn test:wait # waits for local-setup to be ready
yarn test:prepare # prepares the environment (deploys token on both layers, etc.)
yarn test
```

For running test coverage, use:

```shell
yarn test:coverage
```

## 🤝 Contributing

We welcome contributions from the community! If you're interested in contributing to the `zksync-ethers` JavaScript SDK,
please take a look at our [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines and details on the process.

Thank you for making `zksync-ethers` JavaScript SDK better! 🙌
