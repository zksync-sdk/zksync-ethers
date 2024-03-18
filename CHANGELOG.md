# [5.6.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.5.0...v5.6.0) (2024-03-18)


### Bug Fixes

* **utils:** add padding in apply and undo alias in order to return 20 bytes long address ([3acaa8f](https://github.com/zksync-sdk/zksync-ethers/commit/3acaa8f5ed73fed12884111bd8e5fa7cf340bb73))


### Features

* extract all files from the `src` folder into the `build` folder ([c678612](https://github.com/zksync-sdk/zksync-ethers/commit/c6786123ccbe49f0dff53779815374bb0ad2f3ab))
* **provider:** add support for era test node ([6c744fa](https://github.com/zksync-sdk/zksync-ethers/commit/6c744fa53273871472467dd22f2dbe3378256d7b))
* **provider:** parse all block fields from RPC endpoints ([d58fb83](https://github.com/zksync-sdk/zksync-ethers/commit/d58fb836c23baed8d3413582e6d594f7b9ed115b))
* **provider:** remove support for the `ZKSYNC_WEB3_API_URL` environment variable ([0592ae4](https://github.com/zksync-sdk/zksync-ethers/commit/0592ae4a2ec877f3872ecbea5a3f940b76dc1670))


### BREAKING CHANGES

* **provider:** Remove support for the `ZKSYNC_WEB3_API_URL` environment
variable from the `Provider.getDefaultProvider()` to make it compatible
with browser integration.
* Previously, the build folder contained the src folder along
with all the `js` and `d.ts` files. This setup resulted in a poor developer
experience, as developers were required to use the src prefix in their imports
(e.g., `'zksync-ethers/src/types'`). Now, all files from the src folder are
extracted, eliminating the need to specify the `src` prefix in the path.

# [5.5.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.4.0...v5.5.0) (2024-03-05)


### Features

* **signer:** add `L2VoidSigner` and `L1VoidSigner` ([53d9270](https://github.com/zksync-sdk/zksync-ethers/commit/53d92700ad68ffaf75aa8996d85f00073cb0e569))

# [5.4.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.3.0...v5.4.0) (2024-02-29)


### Bug Fixes

* **wallet:** make `populateTransaction` compatible with `ethers` validation ([e048e59](https://github.com/zksync-sdk/zksync-ethers/commit/e048e5983f4b2c3c54b35f8da3dce4c4ed24f5fe))
* **wallet:** populate transaction before signing ([17deca3](https://github.com/zksync-sdk/zksync-ethers/commit/17deca379572b8d3e331bae17d34fb586469c516))


### Features

* **provider:** remove `getMessageProof()` method ([4dabbda](https://github.com/zksync-sdk/zksync-ethers/commit/4dabbdaf0736fbbf347efb1a95369480a6d5058f))
* **provider:** remove `getTokenPrice()` method ([69e3536](https://github.com/zksync-sdk/zksync-ethers/commit/69e3536afa0bd6e03643112b718d234bc757f1ff))
* **utils:** add `toJSON` function for printing objects ([1d13933](https://github.com/zksync-sdk/zksync-ethers/commit/1d139336e7712866b9c2ee00b6d5728381de087e))


### BREAKING CHANGES

* **provider:** Remove deprecated `Provider.getMessageProof()` method.
* **provider:** Remove deprecated `Provider.getTokenPrice()` method.

# [5.3.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.2.0...v5.3.0) (2024-02-08)


### Features

* **provider, wallet:** fix typo in paymaster parameter name ([72289c0](https://github.com/zksync-sdk/zksync-ethers/commit/72289c09add28c86653fd52c2cd09c4e9b37faac))


### BREAKING CHANGES

* **provider, wallet:** Rename function parameter `paymasterParamas` to `paymasterParams` in
`Provider.getTransferTx()`, `Provider.estimateGasTransfer()`, `Provider.getWithdrawTx()`,
`Provider.estimateGasWithdraw()`, `Wallet.transfer()`, and `Wallet.withdraw()` methods.

# [5.2.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.1.0...v5.2.0) (2024-02-07)


### Features

* **provider:** `getDefaultProvider()` returns connection to local network by default ([8bfa153](https://github.com/zksync-sdk/zksync-ethers/commit/8bfa1539dc3e09023e1a834117d56809bb60728c))
* **provider:** add `getProof` method for fetching storage proofs ([a1af287](https://github.com/zksync-sdk/zksync-ethers/commit/a1af287e0e54e8590986fa03b1a2015a44e1ae95))
* **wallet,provider:** add paymaster support for transfer and withdrawal tx ([261ed5a](https://github.com/zksync-sdk/zksync-ethers/commit/261ed5a56e6b4ed1cc7c4e137f846eac4ffc5194))

# [5.1.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.0.0...v5.1.0) (2024-01-24)


### Features

* `EIP712Signer.getSignInput()` now returns zero values as defaults instead of `null` ([477548d](https://github.com/zksync-sdk/zksync-ethers/commit/477548d094eb19cccc42c4820fce2fe27c065325))
* remove `L2VoidSigner` and `L1VoidSigner` ([396b6d1](https://github.com/zksync-sdk/zksync-ethers/commit/396b6d134a9bcfa4fbb2eb9b06620dbe96d4028f))
* remove `Provider.getConfirmedTokens` method ([a761751](https://github.com/zksync-sdk/zksync-ethers/commit/a76175184e638eddfbbb2d4c738336bb22b0f1cc))
* **signer:** add `EIP712Signer.getDomain()` method ([807c314](https://github.com/zksync-sdk/zksync-ethers/commit/807c314251572ef36fda2123be7ec3dc909c8ff5))
* **types:** add `FinalizeWithdrawalParams` interface ([3aa32f6](https://github.com/zksync-sdk/zksync-ethers/commit/3aa32f682cf86290ef78673d13a23b94242b7abe))
* **utils:** add `EIP712_TYPES` ([490e0ea](https://github.com/zksync-sdk/zksync-ethers/commit/490e0eaa978f6eabe867b85b49bfc1dd8156c583))
* **utils:** rename `IPaymasterFlow` to `PAYMASTER_FLOW_ABI` ([746a333](https://github.com/zksync-sdk/zksync-ethers/commit/746a333289f96d7d1a402061ded23e112b291c63))


### BREAKING CHANGES

* `EIP712Signer.getSignInput()` now returns zero values instead of `null` as default
values. In the case of a `number`, the zero value is `0`. In the case of an `ethers.BigNumberish`,
the zero value is `0n`. In the case of a `string`, the zero value is `0x0`.
* `L2VoidSigner` and `L1VoidSigner` are removed from the SDK.
* this method will be removed from JSON RPC API.

# Changelog

## 5.0.0 (2023-12-08)

### Features

* setup `zksync-ethers` project ([9959f2e](https://github.com/zksync-sdk/zksync-ethers.git/commit/9959f2eadd75be2d4fcf9a3ca21bebc6a752432f))
