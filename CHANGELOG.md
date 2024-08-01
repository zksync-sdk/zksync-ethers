## [6.11.1](https://github.com/zksync-sdk/zksync-ethers/compare/v6.11.0...v6.11.1) (2024-08-01)


### Bug Fixes

* **provider:** switch localhost to ip ([dc284de](https://github.com/zksync-sdk/zksync-ethers/commit/dc284dea88cec26d9c5bd60577c08c17962b25e5))

# [6.11.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.10.0...v6.11.0) (2024-07-24)


### Features

* prioratize `EIP712` and utilize `zks_estimateFee` ([4c58829](https://github.com/zksync-sdk/zksync-ethers/commit/4c5882959e353ec0a56f3aa1cc4e5685614cc0ae))
* prioratize `EIP712` and utilize `zks_estimateFee` ([527a74f](https://github.com/zksync-sdk/zksync-ethers/commit/527a74f4ea2dd200acf9b8d1d93e2ae98f10df81))
* **provider:** add support for `l1_committed` block tag ([011db1f](https://github.com/zksync-sdk/zksync-ethers/commit/011db1ff7b3a922f3e2809e9630a91a1654772f6))

# [6.10.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.9.0...v6.10.0) (2024-07-09)


### Bug Fixes

* make weth bridge addresses optional ([ad3cff8](https://github.com/zksync-sdk/zksync-ethers/commit/ad3cff876c0ac2b7319d62d1d79fc5b121b8a7c4))


### Features

* **types:** add ` l1_committed` type into type `BlockTag` ([89e7f69](https://github.com/zksync-sdk/zksync-ethers/commit/89e7f69a090b0e9139942bb32d08ba6ac829aeba))

# [6.9.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.8.0...v6.9.0) (2024-06-19)


### Bug Fixes

* **adapter:** fix support for custom bridge ([deb01a4](https://github.com/zksync-sdk/zksync-ethers/commit/deb01a40708ebcce06d83d70bea88b9b4e0ec386))
* **adapter:** return `IL2SharedBridge` ([bd67567](https://github.com/zksync-sdk/zksync-ethers/commit/bd675672c85f152bdffc7ce5762190d95ef37bec))


### Features

* align types and RPC endpoints with version `v24.7.0` of a node ([f7ef615](https://github.com/zksync-sdk/zksync-ethers/commit/f7ef61568c0413b85c6f59994f2515d91b97d27a))
* **provider:** add `Provider.getConfirmedTokens()` method ([887dc00](https://github.com/zksync-sdk/zksync-ethers/commit/887dc00661db4b68f52f1ad4d0e4046e45d0b280))
* **provider:** add `Provider.getFeeParams()` method ([f5b9381](https://github.com/zksync-sdk/zksync-ethers/commit/f5b9381ba5bafd8c6b670852ca59dbe8a0830397))
* **provider:** add `Provider.getProtocolVersion()` method ([864c9d0](https://github.com/zksync-sdk/zksync-ethers/commit/864c9d05669bb3de8a5426639232e7dfe6283808))
* **provider:** add `Provider.sendRawTransactionWithDetailedOutput()` method ([d41a75d](https://github.com/zksync-sdk/zksync-ethers/commit/d41a75d98495987c5cad20355f56bfed5dfb8531))


### BREAKING CHANGES

* Types and RPC endpoints are aligned with version
`v24.7.0` of a node.

# [6.8.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.7.1...v6.8.0) (2024-06-06)


### Bug Fixes

* **adapter:** fix correct `recommendedL1GasLimit` in `getFullRequiredDepositFee` ([8e92981](https://github.com/zksync-sdk/zksync-ethers/commit/8e929811a47d61c2aa6be53599b2ec2943a56a9a))
* **provider:** `getTransferTx` and `getWithdrawTx` non-eth-based chain ([fc19131](https://github.com/zksync-sdk/zksync-ethers/commit/fc19131660dd52fa24ee03508d134186b407fe34))
* **types:** change types in `FullDepositFee` from `BigInt` to `bigint` ([8707879](https://github.com/zksync-sdk/zksync-ethers/commit/87078790bdd6675f887a1637d69a10893571dec8))
* **types:** ensure `Block.l1BatchTimestamp` has accurate value ([cbbb84e](https://github.com/zksync-sdk/zksync-ethers/commit/cbbb84ea8d1b24c2a00211e1f6d2da63b5ece78c))
* **types:** update `RawBlockTransaction` ([183fa57](https://github.com/zksync-sdk/zksync-ethers/commit/183fa577484bed5a1104ecac5254e5545d0eda9b))


### Features

* provide support for Bridgehub ([acfeadd](https://github.com/zksync-sdk/zksync-ethers/commit/acfeadd75036afde8ecc277a9fc3dd3bcae5d07d))
* **provider:** `getTransactionReceipt()` returns `null` if transaction is not mined or found ([17f131d](https://github.com/zksync-sdk/zksync-ethers/commit/17f131d606513b212d405365fb98394653fd396e))


### BREAKING CHANGES

* **provider:** `Provider.getTransactionReceipt()` and `BrowserProvider.getTransactionReceipt()`
return `null` if transaction is not mined, discarded or not found.

## [6.7.1](https://github.com/zksync-sdk/zksync-ethers/compare/v6.7.0...v6.7.1) (2024-05-09)


### Bug Fixes

* export `typechain` at the top level of the package ([d125eea](https://github.com/zksync-sdk/zksync-ethers/commit/d125eea0534c4660176cabf251e410ce7ff1f229))
* getPriorityOpResponse correctly assigns waitL1Commit to l2Response object ([0cfedc9](https://github.com/zksync-sdk/zksync-ethers/commit/0cfedc96456adbb2613ead8f498c28022f409039))
* **signer:** make `Signer` compatible when created using `BrowserProvider.getSigner()` ([e62c98d](https://github.com/zksync-sdk/zksync-ethers/commit/e62c98d9e066a01697d517d2a3966fd822777b5b))

# [6.7.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.6.0...v6.7.0) (2024-04-04)


### Bug Fixes

* make `Block.sealFields` optional ([5825404](https://github.com/zksync-sdk/zksync-ethers/commit/5825404fc5124af9d6c22292da74b9929aa86152))
* move `abi` folder at top level ([2759e5d](https://github.com/zksync-sdk/zksync-ethers/commit/2759e5da38bd09bae998aafa01c8a8ee8858a7e2))
* **provider:** drop support for the `Goerli` network ([a395dae](https://github.com/zksync-sdk/zksync-ethers/commit/a395daed6aabb506b3355549f3d1201d8ae2795d))
* **signer:** add support for `zks` RPC methods in `Signer` ([c63faea](https://github.com/zksync-sdk/zksync-ethers/commit/c63faeaa65f80aa3ada3092031eab622e9123df5))


### Features

* add `SmartAccount` in order to provide better support for AA ([d31a9b1](https://github.com/zksync-sdk/zksync-ethers/commit/d31a9b1f513099255a312288de2e9521831a2d4e))


### BREAKING CHANGES

* **provider:** The function `Provider.getDefaultProvider()` no
longer supports `types.Network.Goerli`.

# [6.6.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.5.0...v6.6.0) (2024-03-18)


### Bug Fixes

* **provider:** create prefetched txs correctly in `Block` object ([8ef06f2](https://github.com/zksync-sdk/zksync-ethers/commit/8ef06f2292b6ca888cc43b0963e82e8b8f513a99)), closes [#75](https://github.com/zksync-sdk/zksync-ethers/issues/75)
* **provider:** disable caching for local networks ([26d6f63](https://github.com/zksync-sdk/zksync-ethers/commit/26d6f6302831c2a4cd0265705601a7b11d1ed576))
* **utils:** add padding in apply and undo alias in order to return 20 bytes long address ([a5a83b6](https://github.com/zksync-sdk/zksync-ethers/commit/a5a83b64c1756f5ec014381adfd1cfaab10f5816))


### Features

* extract all files from the `src` folder into the `build` folder ([e5f2209](https://github.com/zksync-sdk/zksync-ethers/commit/e5f22090498b5b8dbca33a1bef600df9c8c3add4))
* **provider:** add support for era test node ([7be6040](https://github.com/zksync-sdk/zksync-ethers/commit/7be604099c2b7489ceecb359296985cfdb5ec827))
* **provider:** remove support for the `ZKSYNC_WEB3_API_URL` environment variable ([f5b8529](https://github.com/zksync-sdk/zksync-ethers/commit/f5b85293122a6dcc8aea5ac88acc38384549bda0))


### Reverts

* **adapters:** make `AdapterL1.getFullRequiredDepositFee` work with overrides ([0ed9389](https://github.com/zksync-sdk/zksync-ethers/commit/0ed93893d5d0b0b785aa99d3f87711cc41b5da56))


### BREAKING CHANGES

* **provider:** Remove support for the `ZKSYNC_WEB3_API_URL` environment
variable from the `Provider.getDefaultProvider()` to make it compatible
with browser integration.
* Previously, the build folder contained the src folder along
with all the `js` and `d.ts` files. This setup resulted in a poor developer
experience, as developers were required to use the src prefix in their imports
(e.g., `'zksync-ethers/src/types'`). Now, all files from the src folder are
extracted, eliminating the need to specify the `src` prefix in the path.
* **adapters:** Remove support from `AdapterL1.getFullRequiredDepositFee` for
considering `overrides.from` as the initiator of the operation. This functionality
was previously used to calculate the full deposit fee for accounts whose private
key is unknown. However, this feature is no longer necessary because
`L1VoidSigner.getFullRequiredDepositFee` is specifically designed to handle such
cases.

# [6.5.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.4.0...v6.5.0) (2024-03-05)


### Features

* **adapters:** make `AdapterL1.getFullRequiredDepositFee` work with overrides ([9feb1e1](https://github.com/zksync-sdk/zksync-ethers/commit/9feb1e136335f31b7eda3b2e9ef664b1e29ad366))
* **signer:** add `L2VoidSigner` and `L1VoidSigner` ([84008bb](https://github.com/zksync-sdk/zksync-ethers/commit/84008bbe955e21562df38dd2d254d5cd5ed3713d))

# [6.4.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.3.0...v6.4.0) (2024-02-29)


### Bug Fixes

* **adapter:** make `l2GasLimit` optional parameter in `requestExecute` ([a5fb96c](https://github.com/zksync-sdk/zksync-ethers/commit/a5fb96ceeeb2145705841cdc616ce24d564363e4))
* **wallet:** populate transaction before signing ([72a0585](https://github.com/zksync-sdk/zksync-ethers/commit/72a058531ec403f76e63d7c078f8c08d5a616a37))


### Features

* **utils:** add `toJSON` function for converting object to JSON string ([8ef0299](https://github.com/zksync-sdk/zksync-ethers/commit/8ef02993c17340a5cd9d613c50f3d8a77c9da0c8))

# [6.3.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.2.0...v6.3.0) (2024-02-08)


### Features

* **provider,wallet:** fix typo in paymaster paramter name ([7f71a9d](https://github.com/zksync-sdk/zksync-ethers/commit/7f71a9dff6ba2c54d0fd1b148d14db03b607a93e))


### BREAKING CHANGES

* **provider,wallet:** Rename function paramter `paymasterParamas` to
`paymasterParams` in `Provider.getTransferTx()`, `Provider.estimateGasTransfer()`,
`Provider.getWithdrawTx()`, `Provider.estimateGasWithdraw()`, `Wallet.transfer()`
 and `Wallet.withdraw()` methods.

# [6.2.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.1.0...v6.2.0) (2024-02-07)


### Features

* **provider:** `getDefaultProvider()` connects to local network by default ([ae2146d](https://github.com/zksync-sdk/zksync-ethers/commit/ae2146d1c38128de1dfc96369fa48d8e915ef343))
* **provider:** add `getProof` method for fetching storage proofs ([d364000](https://github.com/zksync-sdk/zksync-ethers/commit/d3640001e8419dc704438063ab8cb37c37a4f86b))
* **wallet,provider:** add paymaster support for transfer and withdrawal tx ([5cab446](https://github.com/zksync-sdk/zksync-ethers/commit/5cab446b3781ce485e2d2735bdfde654a809d277))

# [6.1.0](https://github.com/zksync-sdk/zksync-ethers/compare/v6.0.0...v6.1.0) (2024-01-24)


### Bug Fixes

* **utils:** pad zeroes to left instead to right in `getHashedL2ToL1Msg()` ([41d0ef3](https://github.com/zksync-sdk/zksync-ethers/commit/41d0ef3a5c4636329c156bbab18f6fe928ddb6fb))
* **utils:** pad zeroes to left instead to right in `getSignature()` ([c252039](https://github.com/zksync-sdk/zksync-ethers/commit/c252039569559b426b9b3025b2dfcc9495cb368e))


### Features

* remove `Provider.getConfirmedTokens` method ([7d5e0fe](https://github.com/zksync-sdk/zksync-ethers/commit/7d5e0fe79a0d5e386838e1307f345286b4ca788b))
* **signer:** `EIP712Signer.getSignInput()` now returns zero values as defaults instead of `null` ([710b08c](https://github.com/zksync-sdk/zksync-ethers/commit/710b08c23ac445c6a53d83c6159858757f8f3af1))
* **signer:** add `EIP712Signer.getDomain()` method ([907fee8](https://github.com/zksync-sdk/zksync-ethers/commit/907fee8a919f0d4ebff342188a2f1ce207211590))
* **types:** add `FinalizeWithdrawalParams` interface ([3220dee](https://github.com/zksync-sdk/zksync-ethers/commit/3220dee6be6c4757b0e9626c849f747f18fbfcf5))
* **utils:** add `EIP712_TYPES` ([e148367](https://github.com/zksync-sdk/zksync-ethers/commit/e1483676d42ab7e4ae66a9d83da0c6b21bb4671b))
* **utils:** remove deprecated `IPaymasterFlow` ABI ([56f8094](https://github.com/zksync-sdk/zksync-ethers/commit/56f8094c61e724d03d3c78754a882658e89ecfd1))


### BREAKING CHANGES

* **utils:** remove the deprecated `utils.IPaymasterFlow` in
favor of `utils.PAYMASTER_FLOW_ABI`.
* **signer:** `EIP712Signer.getSignInput()` now returns zero values instead of `null` as default
values. In the case of a `number`, the zero value is `0`. In the case of an `ethers.BigNumberish`,
the zero value is `0n`. In the case of a `string`, the zero value is `0x0`.
* This method will be removed from JSON RPC API.

# Changelog

## 6.0.0 (2023-12-08)

### Features

* setup `zksync-ethers` project ([05bdb16](https://github.com/zksync-sdk/zksync-ethers.git/commit/05bdb16af15bc6edd862cbbb51b9903849dbe905))
