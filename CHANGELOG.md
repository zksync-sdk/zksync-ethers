## [5.9.2](https://github.com/zksync-sdk/zksync-ethers/compare/v5.9.1...v5.9.2) (2024-08-01)


### Bug Fixes

* **provider:** switch localhost to ip ([a11ab17](https://github.com/zksync-sdk/zksync-ethers/commit/a11ab17b942a24205e4904df6e55d730b932c137))

## [5.9.1](https://github.com/zksync-sdk/zksync-ethers/compare/v5.9.0...v5.9.1) (2024-07-09)


### Bug Fixes

* make weth bridge addresses optional ([#190](https://github.com/zksync-sdk/zksync-ethers/issues/190)) ([ce56b44](https://github.com/zksync-sdk/zksync-ethers/commit/ce56b44476d37f9ef46d886bf4b257db696db768))

# [5.9.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.8.0...v5.9.0) (2024-06-19)


### Bug Fixes

* **adapter:** fix support for custom bridge ([82a54aa](https://github.com/zksync-sdk/zksync-ethers/commit/82a54aa7578dee0993c8069be6019ea8491bcf10))
* **adapter:** replace `l2Bridge` with `l2BridgeAddress` in `_getL2GasLimitFromCustomBridge` ([7a2e611](https://github.com/zksync-sdk/zksync-ethers/commit/7a2e6111d883b47e18460ce81f1b7174756dfd51))
* **adapter:** return `IL2SharedBridge` ([aae16cd](https://github.com/zksync-sdk/zksync-ethers/commit/aae16cd99f8444411a3eccfa2f05e45898197e6b))


### Features

* align types and RPC endpoints with version `v24.7.0` of a node ([a419e45](https://github.com/zksync-sdk/zksync-ethers/commit/a419e450e0bc10aea1b6a0ecbdf9d3e5c1e1644a))
* **provider:** add `connectL2Bridge` and `isL2BridgeLegacy` ([dd2e3b9](https://github.com/zksync-sdk/zksync-ethers/commit/dd2e3b9c42474e3f6a6c67a2cd887ec262ac5e36))
* **Provider:** add `Provider.getConfirmedTokens()` method ([034011f](https://github.com/zksync-sdk/zksync-ethers/commit/034011fa014606ecf66106798ea5e6d6ff113375))
* **provider:** add `Provider.getFeeParams()` method ([770a410](https://github.com/zksync-sdk/zksync-ethers/commit/770a4105214ccc04b257dfb251553799e87a0401))
* **Provider:** add `Provider.getProtocolVersion()` method ([daa3670](https://github.com/zksync-sdk/zksync-ethers/commit/daa3670cd176cb3eb4a16d5f9868dfee0a3a3daa))
* **provider:** add `Provider.sendRawTransactionWithDetailedOutput()` method ([2e4761d](https://github.com/zksync-sdk/zksync-ethers/commit/2e4761dfef8a2cd8b2018074666634c361972795))


### BREAKING CHANGES

* Types and RPC endpoints are aligned with version
`v24.7.0` of a node.

# [5.8.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.7.2...v5.8.0) (2024-06-06)


### Bug Fixes

* **adapter:** fix `isWithdrawalFinalized` ([53bd0df](https://github.com/zksync-sdk/zksync-ethers/commit/53bd0df4cfa98cf18e3c0a03332f26491a1fbba1))
* **provider:** `getTransferTx` and `getWithdrawTx` non eth chain ([9ef3836](https://github.com/zksync-sdk/zksync-ethers/commit/9ef38363ee2834df67078072b7d87857a7d6f2bc))
* **provider:** fix type l2Response.waitL1Commit as `waitL1Commit` ([c33b117](https://github.com/zksync-sdk/zksync-ethers/commit/c33b117b68749951c4cba3470e8017b895ed9707))
* **types:** update `RawBlockTransaction` ([fe3a0ee](https://github.com/zksync-sdk/zksync-ethers/commit/fe3a0ee16e9a136634bc13828bd0dc0d88d418ce))


### Features

* provide support for Bridgehub ([bf234e3](https://github.com/zksync-sdk/zksync-ethers/commit/bf234e3e40fa86a577b30b63d7a2e4a93544603b))

## [5.7.2](https://github.com/zksync-sdk/zksync-ethers/compare/v5.7.1...v5.7.2) (2024-05-10)


### Bug Fixes

* resolve module resolution for `typechain` definition files ([c70ccc4](https://github.com/zksync-sdk/zksync-ethers/commit/c70ccc46ea60650aef13b47b79d207d5bdb01f06))

## [5.7.1](https://github.com/zksync-sdk/zksync-ethers/compare/v5.7.0...v5.7.1) (2024-05-09)


### Bug Fixes

* export `typechain` folder at the top of the package` ([cbc0301](https://github.com/zksync-sdk/zksync-ethers/commit/cbc0301bb2d8ac88f6b3c8f0c978b01f3a64dfa2))
* getPriorityOpResponse correctly assigns waitL1Commit to l2Response object ([a0a0cef](https://github.com/zksync-sdk/zksync-ethers/commit/a0a0cef2edee3b1c8de6f56b5ab0a73407cd895e))
* **signer:** make `Signer` compatible when created using `Web3Provider.getSigner()` ([f16c34c](https://github.com/zksync-sdk/zksync-ethers/commit/f16c34ce8cf16619e7700e5dae20e0b1ff0d2225))

# [5.7.0](https://github.com/zksync-sdk/zksync-ethers/compare/v5.6.0...v5.7.0) (2024-04-04)


### Bug Fixes

* make `Block.sealFields` optional ([dc83275](https://github.com/zksync-sdk/zksync-ethers/commit/dc83275bc2dc316d4fd53376ee004af11358828e))
* move `abi` folder at top level ([aacddbe](https://github.com/zksync-sdk/zksync-ethers/commit/aacddbe189dd916e713d044e4f59b50a0a280548))
* **provider:** fix issue related to resolving `blockTag` value ([a9a1b30](https://github.com/zksync-sdk/zksync-ethers/commit/a9a1b3060db8d878870cad8c3f5633ac9785c736))
* **signer, wallet:** make `l2GasLimit` optional parameter in `requestExecute` ([7279205](https://github.com/zksync-sdk/zksync-ethers/commit/7279205aaf40862229875f1b50a7a93021796852))
* **signer:** add support for `zks` RPC methods in `Signer` ([5c718db](https://github.com/zksync-sdk/zksync-ethers/commit/5c718dbe43646f238f3fdd1a4c614b8f50f089a1))
* **types:** `TransactionRespnose.wait()` return native `TransactionReceipt` ([9860d4d](https://github.com/zksync-sdk/zksync-ethers/commit/9860d4d61dde430df062b658c8e3e958528a01e0))
* **wallet:** use native `TransactionRequest` type instead of `ethers` ([24c4071](https://github.com/zksync-sdk/zksync-ethers/commit/24c407192e9ec4016ca4d5771f1e84a38008ef82))


### Features

* add `SmartAccount` in order to provide better support for AA ([c38f20c](https://github.com/zksync-sdk/zksync-ethers/commit/c38f20c0c190a48f0e0cc04fa47f2ff3c25e9103))
* **provider:** drop support for the `Goerly` network ([027d9b7](https://github.com/zksync-sdk/zksync-ethers/commit/027d9b7490842cfc0539d23f61266ae25d27e90a))


### BREAKING CHANGES

* **provider:** The function `Provider.getDefaultProvider()` no
longer supports `types.Network.Goerli`.

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
