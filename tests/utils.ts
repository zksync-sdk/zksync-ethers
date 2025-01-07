export const ADDRESS1 = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
export const PRIVATE_KEY1 =
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
export const MNEMONIC1 =
  'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
export const ADDRESS2 = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618';
export const PRIVATE_KEY2 =
  '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3';
export const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55';
export const DAI_L2 = '0xDb6ca4Dd98d4F7248f7dEaE35204706e10492Ef7';
export const NON_ETH_BASED_ETH_L2_ADDRESS =
  '0xa283C9f5302429D70d62346a5a9d236FF0886dA5';
export const APPROVAL_TOKEN = '0x2dc3685cA34163952CF4A5395b0039c00DFa851D'; // Crown token
export const PAYMASTER = '0x0EEc6f45108B4b806e27B81d9002e162BD910670'; // Crown token paymaster
export const NTV_ADDRESS = '0x0000000000000000000000000000000000010004'; // Native Token Vault is deployed at this address on ZK chains
export const IS_ETH_BASED = ['true', '1', 'yes'].includes(
  process.env.IS_ETH_CHAIN ?? 'true'
);
export const L2_CHAIN_URL = IS_ETH_BASED
  ? 'http://127.0.0.1:15100'
  : 'http://127.0.0.1:15200';
export const L1_CHAIN_URL = 'http://127.0.0.1:15045';
