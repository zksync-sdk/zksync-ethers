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
