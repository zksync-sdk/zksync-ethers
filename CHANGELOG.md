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
