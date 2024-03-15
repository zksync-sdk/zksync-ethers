import {expect} from 'chai';
import '../custom-matchers';
import {Provider, types, utils, Wallet} from '../../src';
import {ethers} from 'ethers';

import TokensL1 from '../tokens.json';

describe('Provider', () => {
  const ADDRESS = '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049';
  const PRIVATE_KEY =
    '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
  const RECEIVER = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618';

  const provider = Provider.getDefaultProvider(types.Network.Localhost);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  const DAI_L1 = TokensL1[0].address;

  const TOKEN = '0x841c43Fa5d8fFfdB9efE3358906f7578d8700Dd4';
  const PAYMASTER = '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174';

  let tx: types.TransactionResponse;

  before('setup', async function () {
    this.timeout(25_000);
    tx = await wallet.transfer({
      token: utils.ETH_ADDRESS,
      to: RECEIVER,
      amount: 1_000_000,
    });
    await tx.wait();
  });

  describe('#constructor()', () => {
    it('Provider() should return a `Provider` connected to local network when URL is not defined', async () => {
      const provider = new Provider();
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(270n);
    });
  });

  describe('#getDefaultProvider()', () => {
    it('should return a provider connected to local network by default', async () => {
      const provider = Provider.getDefaultProvider();
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(270n);
    });

    it('should return a provider connected to local network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Localhost);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(270n);
    });

    it('should return a provider connected to Goerli network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Goerli);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(280n);
    });

    it('should return a provider connected to Sepolia network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Sepolia);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(300n);
    });

    it('should return a provider connected to main network', async () => {
      const provider = Provider.getDefaultProvider(types.Network.Mainnet);
      const network = await provider.getNetwork();
      expect(network.chainId).to.be.equal(324n);
    });
  });

  describe('#getMainContractAddress()', () => {
    it('should return the address of main contract', async () => {
      const result = await provider.getMainContractAddress();
      expect(result).not.to.be.null;
    });
  });

  describe('#getTestnetPaymasterAddress()', () => {
    it('should return the address of testnet paymaster', async () => {
      const TESTNET_PAYMASTER = '0x59067204f2789ffcb6eadb6be6c7cbb7be9fdc7c';
      const result = await provider.getTestnetPaymasterAddress();
      expect(result).to.be.equal(TESTNET_PAYMASTER);
    });
  });

  describe('#l1ChainId()', () => {
    it('should return the L1 chain ID', async () => {
      const L1_CHAIN_ID = 9;
      const result = await provider.l1ChainId();
      expect(result).to.be.equal(L1_CHAIN_ID);
    });
  });

  describe('getBlockNumber()', () => {
    it('should return a block number', async () => {
      const result = await provider.getBlockNumber();
      expect(result).to.be.greaterThan(0);
    });
  });

  describe('#getGasPrice()', () => {
    it('should return a gas price', async () => {
      const GAS_PRICE = 250_000_000n;
      const result = await provider.getGasPrice();
      expect(result).to.be.equal(GAS_PRICE);
    });
  });

  describe('#getL1BatchNumber()', () => {
    it('should return a L1 batch number', async () => {
      const result = await provider.getL1BatchNumber();
      expect(result).to.be.greaterThan(0);
    });
  });

  describe('#getBalance()', () => {
    it('should return an ETH balance of the account at `address`', async () => {
      const result = await provider.getBalance(ADDRESS);
      expect(result > 0).to.be.true;
    });

    it('should return a DAI balance of the account at `address`', async () => {
      const result = await provider.getBalance(
        ADDRESS,
        'latest',
        await provider.l2TokenAddress(DAI_L1)
      );
      expect(result > 0).to.be.true;
    });
  });

  describe('#getAllAccountBalances()', () => {
    it('should return the all balances of the account at `address`', async () => {
      const result = await provider.getAllAccountBalances(ADDRESS);
      expect(Object.keys(result)).to.have.lengthOf(2); // ETH, DAI
    });
  });

  describe('#getBlockDetails()', () => {
    it('should return a block details', async () => {
      const result = await provider.getBlockDetails(1);
      expect(result).not.to.be.null;
    });
  });

  describe('#getTransactionDetails()', () => {
    it('should return a transaction details', async () => {
      const result = await provider.getTransactionDetails(tx.hash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getBytecodeByHash()', () => {
    it('should return the bytecode of a contract', async () => {
      const testnetPaymasterBytecode =
        '0x000200000000000200090000000000020001000000010355000000800b0000390000004000b0043f00000000030100190000006003300270000000b2033001970000000102200190000000430000c13d000000040230008c0000004b0000413d000000000201043b000000e002200270000000b40420009c0000004f0000613d000000b50220009c000000630000c13d000000040230008a000000c00420008c000000630000413d0000000404100370000000000404043b000000b60540009c000000630000213d0000002305400039000000b706000041000000000735004b00000000070000190000000007068019000000b705500197000000000805004b0000000006008019000000b70550009c000000000607c019000000000506004b000000630000c13d0000000405400039000000000551034f000000000505043b000000b60650009c000000630000213d00000000045400190000002404400039000000000334004b000000630000213d0000002403100370000000000303043b000000b60430009c000000630000213d0000000002320049000000b703000041000002600420008c00000000040000190000000004034019000000b702200197000000000502004b000000000300a019000000b70220009c000000000304c019000000000203004b000000630000c13d0000008401100370000000000101043b000000010110008c000000630000213d0000004d0000013d0000000001000416000000000101004b000000630000c13d000000200100003900000100001004430000012000000443000000b301000041000002c50001042e000000000103004b000000630000c13d0000000001000019000002c50001042e000000040230008a000000600220008c000000630000413d0000004402100370000000000202043b000000b60420009c000000630000213d00000004042000390000000005430049000000b706000041000002600750008c00000000070000190000000007064019000000b708500197000000000908004b000000000600a019000000b70880009c000000000607c019000000000606004b000000650000613d0000000001000019000002c6000104300000000006000411000080010660008c000000990000c13d0000022406200039000000000661034f000000000606043b0000001f0550008a000000b707000041000000000856004b00000000080000190000000008078019000000b705500197000000b709600197000000000a59004b0000000007008019000000000559013f000000b70550009c000000000708c019000000000507004b000000630000c13d0000000004460019000000000541034f000000000505043b000000b60650009c000000630000213d00000000065300490000002003400039000000b707000041000000000863004b00000000080000190000000008072019000000b706600197000000b709300197000000000a69004b0000000007008019000000000669013f000000b70660009c000000000708c019000000000607004b000000630000c13d000000030650008c000000a50000213d000000b801000041000000800010043f0000002001000039000000840010043f0000003a01000039000000a40010043f000000d201000041000000c40010043f000000d301000041000000a20000013d000000b801000041000000800010043f0000002001000039000000840010043f0000002601000039000000a40010043f000000b901000041000000c40010043f000000ba01000041000000e40010043f000000bb01000041000002c600010430000000000631034f000000000606043b000000bc06600197000000bd0660009c000000dd0000c13d000000040550008a000000600650008c000000630000413d0000000403300039000000000631034f000000000606043b000900000006001d000000c00660009c000000630000213d0000004006300039000000000661034f0000002003300039000000000331034f000000000303043b000800000003001d000000000306043b000000b60630009c000000630000213d0000002406400039000000000465001900000000056300190000001f03500039000000b706000041000000000743004b00000000070000190000000007068019000000b703300197000000b708400197000000000983004b0000000006008019000000000383013f000000b70330009c000000000607c019000000000306004b000000630000c13d00070000000b001d000000000351034f000000000303043b000000c10630009c000000d70000813d000000bf063000390006002000000092000000060660017f000000b60760009c000000e70000a13d000000c40100004100000000001004350000004101000039000000040010043f000000c501000041000002c600010430000000b801000041000000800010043f0000002001000039000000840010043f0000001a01000039000000a40010043f000000be01000041000000c40010043f000000bf01000041000002c600010430000000400060043f000000800030043f00000020055000390000000006530019000000000446004b000000630000213d000000000451034f0000001f0530018f0000000506300272000000fa0000613d00000000070000190000000508700210000000000984034f000000000909043b000000a00880003900000000009804350000000107700039000000000867004b000000f20000413d000000000705004b000001090000613d0000000506600210000000000464034f0000000305500210000000a006600039000000000706043300000000075701cf000000000757022f000000000404043b0000010005500089000000000454022f00000000045401cf000000000474019f0000000000460435000000a0033000390000000000030435000300240020003d0000000301100360000000000101043b000000400400043d000000c20200004100000000002404350000000002000410000000c0032001970000002402400039000100000003001d0000000000320435000000c002100197000500000004001d0000000401400039000200000002001d000000000021043500000000010004140000000902000029000000040220008c000001240000c13d0000000003000031000000200130008c00000000040300190000002004008039000001550000013d000000b202000041000000b20310009c00000000010280190000000504000029000000b20340009c00000000020440190000004002200210000000c001100210000000000121019f000000c3011001c7000000090200002902c402bf0000040f000000050a00002900000000030100190000006003300270000000b203300197000000200430008c000000000403001900000020040080390000001f0540018f0000000506400272000001430000613d0000000007000019000000050870021000000000098a0019000000000881034f000000000808043b00000000008904350000000107700039000000000867004b0000013b0000413d000000000705004b000001520000613d0000000506600210000000000761034f00000005066000290000000305500210000000000806043300000000085801cf000000000858022f000000000707043b0000010005500089000000000757022f00000000055701cf000000000585019f0000000000560435000000000003001f00000001022001900000017d0000613d0000001f01400039000000600110018f0000000504100029000000000214004b00000000020000190000000102004039000400000004001d000000b60440009c000000d70000213d0000000102200190000000d70000c13d0000000402000029000000400020043f000000200230008c000000630000413d00000005020000290000000002020433000000080220006c000001a00000813d00000004030000290000006401300039000000d00200004100000000002104350000004401300039000000d1020000410000000000210435000000240130003900000029020000390000000000210435000000b8010000410000000000130435000000040130003900000020020000390000000000210435000000b201000041000000b20230009c00000000030180190000004001300210000000cc011001c7000002c600010430000000400200043d0000001f0430018f00000005053002720000018a0000613d000000000600001900000005076002100000000008720019000000000771034f000000000707043b00000000007804350000000106600039000000000756004b000001820000413d000000000604004b000001990000613d0000000505500210000000000151034f00000000055200190000000304400210000000000605043300000000064601cf000000000646022f000000000101043b0000010004400089000000000141022f00000000014101cf000000000161019f0000000000150435000000b201000041000000b20420009c000000000201801900000040012002100000006002300210000000000121019f000002c60001043000000003060000290000004002600039000000010520036700000080026000390000000102200367000000000202043b000000000405043b00050000502400ad000000000504004b000001ad0000613d00000005544000f9000000000224004b0000020b0000c13d0000000404000029000000240240003900000001050000290000000000520435000000c6020000410000000000240435000000040240003900000002050000290000000000520435000000440240003900000008040000290000000000420435000000c705000041000000050240006c0000000005004019000800000005001d00000000020004140000000904000029000000040440008c000001f40000613d000000b201000041000000b20320009c00000000020180190000000404000029000000b20340009c00000000010440190000004001100210000000c002200210000000000112019f000000c8011001c7000000090200002902c402ba0000040f000000040a00002900000000030100190000006003300270000000b203300197000000200430008c000000000403001900000020040080390000001f0540018f0000000506400272000001e00000613d0000000007000019000000050870021000000000098a0019000000000881034f000000000808043b00000000008904350000000107700039000000000867004b000001d80000413d000000000705004b000001ef0000613d0000000506600210000000000761034f00000004066000290000000305500210000000000806043300000000085801cf000000000858022f000000000707043b0000010005500089000000000757022f00000000055701cf000000000585019f0000000000560435000000000003001f00000001022001900000020f0000613d0000001f01400039000000600110018f0000000401100029000000b60210009c000000d70000213d000000400010043f000000200130008c000000630000413d00000004010000290000000001010433000000000201004b0000000002000019000000010200c039000000000121004b000000630000c13d000000b2010000410000000002000414000000b20320009c0000000002018019000000c001200210000000050200006b000002500000c13d000080010200003902c402ba0000040f000002560000013d000000c40100004100000000001004350000001101000039000000da0000013d0000006002000039000000000403004b0000021f0000c13d0000000001020433000000050210008c000002490000413d000000b202000041000000b20310009c00000000010280190000000704000029000000b20340009c000000000402801900000040024002100000006001100210000000000121019f000002c6000104300000003f02300039000000c904200197000000400200043d0000000004420019000000000524004b00000000050000190000000105004039000000b60640009c000000d70000213d0000000105500190000000d70000c13d000000400040043f0000001f0430018f00000000083204360000000503300272000002380000613d000000000500001900000005065002100000000007680019000000000661034f000000000606043b00000000006704350000000105500039000000000635004b000002300000413d000700000008001d000000000504004b000002120000613d0000000503300210000000000131034f00000007033000290000000304400210000000000503043300000000054501cf000000000545022f000000000101043b0000010004400089000000000141022f00000000014101cf000000000151019f0000000000130435000002120000013d000000400100043d0000006402100039000000ca0300004100000000003204350000004402100039000000cb03000041000002ab0000013d000000cd011001c7000080090200003900008001040000390000000503000029000000000500001902c402ba0000040f00000000030100190000006003300270000000b20030019d000000b205300198000002830000613d0000003f03500039000000c903300197000000400400043d0000000003340019000000000643004b00000000060000190000000106004039000000b60730009c000000d70000213d0000000106600190000000d70000c13d000000400030043f0000001f0350018f00000000045404360000000505500272000002740000613d000000000600001900000005076002100000000008740019000000000771034f000000000707043b00000000007804350000000106600039000000000756004b0000026c0000413d000000000603004b000002830000613d0000000505500210000000000151034f00000000045400190000000303300210000000000504043300000000053501cf000000000535022f000000000101043b0000010003300089000000000131022f00000000013101cf000000000151019f0000000000140435000000400100043d0000000102200190000002a60000613d000000200210003900000040030000390000000000320435000000080200002900000000002104350000004003100039000000600200043d00000000002304350000006003100039000000000402004b000002990000613d000000000400001900000000053400190000008006400039000000000606043300000000006504350000002004400039000000000524004b000002920000413d000000000332001900000000000304350000007f02200039000000060220017f000000b203000041000000b20420009c0000000002038019000000b20410009c000000000103801900000040011002100000006002200210000000000112019f000002c50001042e0000006402100039000000ce0300004100000000003204350000004402100039000000cf03000041000000000032043500000024021000390000002a030000390000000000320435000000b8020000410000000000210435000000040210003900000020030000390000000000320435000000b202000041000000b20310009c00000000010280190000004001100210000000cc011001c7000002c600010430000002bd002104210000000102000039000000000001042d0000000002000019000000000001042d000002c2002104230000000102000039000000000001042d0000000002000019000000000001042d000002c400000432000002c50001042e000002c600010430000000000000000000000000000000000000000000000000000000000000000000000000ffffffff000000020000000000000000000000000000004000000100000000000000000000000000000000000000000000000000000000000000000000000000038a24bc00000000000000000000000000000000000000000000000000000000817b17f0000000000000000000000000000000000000000000000000ffffffffffffffff800000000000000000000000000000000000000000000000000000000000000008c379a0000000000000000000000000000000000000000000000000000000004f6e6c7920626f6f746c6f616465722063616e2063616c6c207468697320636f6e747261637400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000084000000800000000000000000ffffffff00000000000000000000000000000000000000000000000000000000949431dc00000000000000000000000000000000000000000000000000000000556e737570706f72746564207061796d617374657220666c6f770000000000000000000000000000000000000000000000000064000000800000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000010000000000000000dd62ed3e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000440000000000000000000000004e487b7100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000000000000000023b872dd00000000000000000000000000000000000000000000000000000000038a24bc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000001ffffffe07327206163636f756e74000000000000000000000000000000000000000000004661696c656420746f207472616e7366657246726f6d2066726f6d207573657200000000000000000000000000000000000000840000000000000000000000000200000000000000000000000000000000000000000000000000000000000000626f6f746c6f61646572000000000000000000000000000000000000000000004661696c656420746f207472616e736665722066756e647320746f2074686520616c6c6f77616e63650000000000000000000000000000000000000000000000546865207573657220646964206e6f742070726f7669646520656e6f75676820546865207374616e64617264207061796d617374657220696e707574206d757374206265206174206c656173742034206279746573206c6f6e670000000000003e3fedd1037ff662aaf95f9c82a9391df33ea5e806aeb952e06b321484d378cb';
      const testnetPaymasterBytecodeHash = ethers.hexlify(
        utils.hashBytecode(testnetPaymasterBytecode)
      ); // "0x010000d590477725d953dc54a472de0943121b913d97843dc3e49e4f8519f34d"
      const result = await provider.getBytecodeByHash(
        testnetPaymasterBytecodeHash
      );
      expect(result).to.be.deep.equal(
        Array.from(ethers.getBytes(testnetPaymasterBytecode))
      );
    });
  });

  describe('#getRawBlockTransactions()', () => {
    it('should return a raw transactions', async () => {
      const blockNumber = await provider.getBlockNumber();
      const result = await provider.getRawBlockTransactions(blockNumber);
      expect(result).not.to.be.null;
    });
  });

  describe('#getProof()', () => {
    it('should return a storage proof', async () => {
      // fetching the storage proof for rawNonce storage slot in NonceHolder system contract
      // mapping(uint256 => uint256) internal rawNonces;

      // Ensure the address is a 256-bit number by padding it
      // because rawNonces uses uint256 for mapping addresses and their nonces
      const addressPadded = ethers.zeroPadValue(wallet.address, 32);

      // Convert the slot number to a hex string and pad it to 32 bytes
      const slotPadded = ethers.zeroPadValue(ethers.toBeHex(0), 32);

      // Concatenate the padded address and slot number
      const concatenated = addressPadded + slotPadded.slice(2); // slice to remove '0x' from the slotPadded

      // Hash the concatenated string using Keccak-256
      const storageKey = ethers.keccak256(concatenated);

      const l1BatchNumber = await provider.getL1BatchNumber();
      try {
        const result = await provider.getProof(
          utils.NONCE_HOLDER_ADDRESS,
          [storageKey],
          l1BatchNumber
        );
        expect(result).not.to.be.null;
      } catch (error) {
        //
      }
    });
  });

  describe('#getTransactionStatus()', () => {
    it('should return the `Committed` status for a mined transaction', async () => {
      const result = await provider.getTransactionStatus(tx.hash);
      expect(result).not.to.be.null;
    });

    it('should return the `NotFound` status for a non-existing transaction', async () => {
      const tx =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
      const result = await provider.getTransactionStatus(tx);
      expect(result).to.be.equal(types.TransactionStatus.NotFound);
    });
  });

  describe('#getTransaction()', () => {
    it('should return a transaction', async () => {
      const result = await provider.getTransaction(tx.hash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getTransactionReceipt()', () => {
    it('should return a transaction receipt', async () => {
      const result = await provider.getTransaction(tx.hash);
      expect(result).not.to.be.null;
    });
  });

  describe('#getDefaultBridgeAddresses()', () => {
    it('should return the default bridges', async () => {
      const result = await provider.getDefaultBridgeAddresses();
      expect(result).not.to.be.null;
    });
  });

  describe('#newBlockFilter()', () => {
    it('should return a new block filter', async () => {
      const result = await provider.newBlockFilter();
      expect(result).not.to.be.null;
    });
  });

  describe('#newPendingTransactionsFilter()', () => {
    it('should return a new pending block filter', async () => {
      const result = await provider.newPendingTransactionsFilter();
      expect(result).not.to.be.null;
    });
  });

  describe('#newFilter()', () => {
    it('should return a new filter', async () => {
      const result = await provider.newFilter({
        fromBlock: 0,
        toBlock: 5,
        address: utils.L2_ETH_TOKEN_ADDRESS,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#getContractAccountInfo()', () => {
    it('should return the contract account info', async () => {
      const TESTNET_PAYMASTER = '0x0f9acdb01827403765458b4685de6d9007580d15';
      const result = await provider.getContractAccountInfo(TESTNET_PAYMASTER);
      expect(result).not.to.be.null;
    });
  });

  describe('#l2TokenAddress()', () => {
    it('should return the L2 ETH address', async () => {
      const result = await provider.l2TokenAddress(utils.ETH_ADDRESS);
      expect(result).to.be.equal(utils.ETH_ADDRESS);
    });

    it('should return the L2 DAI address', async () => {
      const result = await provider.l2TokenAddress(DAI_L1);
      expect(result).not.to.be.null;
    });
  });

  describe('#l1TokenAddress()', () => {
    it('should return the L1 ETH address', async () => {
      const result = await provider.l1TokenAddress(utils.ETH_ADDRESS);
      expect(result).to.be.equal(utils.ETH_ADDRESS);
    });

    it('should return the L1 DAI address', async () => {
      const result = await provider.l1TokenAddress(
        await provider.l2TokenAddress(DAI_L1)
      );
      expect(result).to.be.equal(DAI_L1);
    });
  });

  describe('#getBlock()', () => {
    it('should return a block', async () => {
      const blockNumber = (await provider.getBlockNumber()) - 1;
      const result = await provider.getBlock(blockNumber, false);
      expect(result).not.to.be.null;
      expect(result.transactions).not.to.be.empty;
    });

    it('should return a block with prefetch transactions', async () => {
      const blockNumber = (await provider.getBlockNumber()) - 1;
      const result = await provider.getBlock(blockNumber, true);
      expect(result).not.to.be.null;
      expect(result.transactions).not.to.be.empty;
      expect(result.prefetchedTransactions).not.to.be.empty;
    });
  });

  describe('#getBlockDetails()', () => {
    it('should return the block details', async () => {
      const result = await provider.getBlockDetails(
        await provider.getBlockNumber()
      );
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BatchBlockRange()', () => {
    it('should return the L1 batch block range', async () => {
      const l1BatchNumber = await provider.getL1BatchNumber();
      const result = await provider.getL1BatchBlockRange(l1BatchNumber);
      expect(result).not.to.be.null;
    });
  });

  describe('#getL1BatchDetails()', () => {
    it('should return the L1 batch details', async () => {
      const l1BatchNumber = await provider.getL1BatchNumber();
      const result = await provider.getL1BatchDetails(l1BatchNumber);
      expect(result).not.to.be.null;
    });
  });

  describe('#getLogs()', () => {
    it('should return the logs', async () => {
      const result = await provider.getLogs({
        fromBlock: 0,
        toBlock: 5,
        address: utils.L2_ETH_TOKEN_ADDRESS,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#getWithdrawTx()', () => {
    it('should return an ETH withdraw transaction', async () => {
      const tx = {
        from: ADDRESS,
        value: 7_000_000_000n,
        to: '0x000000000000000000000000000000000000800a',
        data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      };
      const result = await provider.getWithdrawTx({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS,
        from: ADDRESS,
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return an ETH withdraw transaction with paymaster parameters', async () => {
      const tx = {
        from: ADDRESS,
        value: 7_000_000_000n,
        to: '0x000000000000000000000000000000000000800a',
        data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getWithdrawTx({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS,
        from: ADDRESS,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: 1,
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a DAI withdraw transaction', async () => {
      const tx = {
        from: ADDRESS,
        to: (await provider.getDefaultBridgeAddresses()).erc20L2,
        data: '0xd9caed1200000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000082b5ea13260346f4251c0940067a9117a6cf13840000000000000000000000000000000000000000000000000000000000000005',
      };
      const result = await provider.getWithdrawTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS,
        from: ADDRESS,
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });

    it('should return a DAI withdraw transaction with paymaster parameters', async () => {
      const tx = {
        from: ADDRESS,
        to: (await provider.getDefaultBridgeAddresses()).erc20L2,
        data: '0xd9caed1200000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000082b5ea13260346f4251c0940067a9117a6cf13840000000000000000000000000000000000000000000000000000000000000005',
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getWithdrawTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: ADDRESS,
        from: ADDRESS,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: 1,
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deepEqualExcluding(tx, ['data']);
    });

    it('should return a withdraw transaction with `tx.from==tx.to` when `tx.to` is not provided', async () => {
      const tx = {
        from: ADDRESS,
        value: 7_000_000_000n,
        to: '0x000000000000000000000000000000000000800a',
        data: '0x51cff8d900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      };
      const result = await provider.getWithdrawTx({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        from: ADDRESS,
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should throw an error when `tx.to` and `tx.from` are not provided`', async () => {
      try {
        await provider.getWithdrawTx({
          token: utils.ETH_ADDRESS,
          amount: 5,
        });
      } catch (e) {
        expect(e).not.to.be.equal('withdrawal target address is undefined');
      }
    });

    it('should throw an error when `tx.amount!=tx.overrides.value', async () => {
      try {
        await provider.getWithdrawTx({
          token: utils.ETH_ADDRESS,
          amount: 5,
          to: ADDRESS,
          from: ADDRESS,
          overrides: {value: 7},
        });
      } catch (e) {
        expect(e).not.to.be.equal(
          'The tx.value is not equal to the value withdrawn'
        );
      }
    });
  });

  describe('#getTransferTx()', () => {
    it('should return an ETH transfer transaction', async () => {
      const tx = {
        from: ADDRESS,
        to: RECEIVER,
        value: 7_000_000_000,
      };
      const result = await provider.getTransferTx({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: RECEIVER,
        from: ADDRESS,
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return an ETH transfer transaction with paymaster parameters', async () => {
      const tx = {
        type: utils.EIP712_TX_TYPE,
        from: ADDRESS,
        to: RECEIVER,
        value: 7_000_000_000,
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getTransferTx({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: RECEIVER,
        from: ADDRESS,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: 1,
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a DAI transfer transaction', async () => {
      const tx = {
        from: ADDRESS,
        to: await provider.l2TokenAddress(DAI_L1),
        data: '0xa9059cbb000000000000000000000000a61464658afeaf65cccaafd3a512b69a83b776180000000000000000000000000000000000000000000000000000000000000005',
      };
      const result = await provider.getTransferTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: RECEIVER,
        from: ADDRESS,
      });
      expect(result).to.be.deep.equal(tx);
    });

    it('should return a DAI transfer transaction with paymaster parameters', async () => {
      const tx = {
        from: ADDRESS,
        to: await provider.l2TokenAddress(DAI_L1),
        data: '0xa9059cbb000000000000000000000000a61464658afeaf65cccaafd3a512b69a83b776180000000000000000000000000000000000000000000000000000000000000005',
        customData: {
          paymasterParams: {
            paymaster: '0xa222f0c183AFA73a8Bc1AFb48D34C88c9Bf7A174',
            paymasterInput:
              '0x949431dc000000000000000000000000841c43fa5d8fffdb9efe3358906f7578d8700dd4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      };
      const result = await provider.getTransferTx({
        token: await provider.l2TokenAddress(DAI_L1),
        amount: 5,
        to: RECEIVER,
        from: ADDRESS,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: 1,
          innerInput: new Uint8Array(),
        }),
      });
      expect(result).to.be.deep.equal(tx);
    });
  });

  describe('#estimateGasWithdraw()', () => {
    it('should return a gas estimation of the withdraw transaction', async () => {
      const result = await provider.estimateGasWithdraw({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS,
        from: ADDRESS,
      });
      expect(result > 0).to.be.true;
    });

    it('should return a gas estimation of the withdraw transaction with paymaster', async () => {
      const result = await provider.estimateGasWithdraw({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: ADDRESS,
        from: ADDRESS,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: 1,
          innerInput: new Uint8Array(),
        }),
      });
      expect(result > 0).to.be.true;
    });
  });

  describe('#estimateGasTransfer()', () => {
    it('should return a gas estimation of the transfer transaction', async () => {
      const result = await provider.estimateGasTransfer({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: RECEIVER,
        from: ADDRESS,
      });
      expect(result > 0).to.be.be.true;
    });

    it('should return a gas estimation of the transfer transaction with paymaster', async () => {
      const result = await provider.estimateGasTransfer({
        token: utils.ETH_ADDRESS,
        amount: 7_000_000_000,
        to: RECEIVER,
        from: ADDRESS,
        paymasterParams: utils.getPaymasterParams(PAYMASTER, {
          type: 'ApprovalBased',
          token: TOKEN,
          minimalAllowance: 1,
          innerInput: new Uint8Array(),
        }),
      });
      expect(result > 0).to.be.be.true;
    });
  });

  describe('#estimateGasL1()', () => {
    it('should return a gas estimation of the L1 transaction', async () => {
      const result = await provider.estimateGasL1({
        from: ADDRESS,
        to: await provider.getMainContractAddress(),
        value: 7_000_000_000,
        customData: {
          gasPerPubdata: 800,
        },
      });
      expect(result > 0).to.be.true;
    });
  });

  describe('#estimateL1ToL2Execute()', () => {
    it('should return a gas estimation of the L1 to L2 transaction', async () => {
      const result = await provider.estimateL1ToL2Execute({
        contractAddress: await provider.getMainContractAddress(),
        calldata: '0x',
        caller: ADDRESS,
        l2Value: 7_000_000_000,
      });
      expect(result > 0).to.be.true;
    });
  });

  describe('#estimateFee()', () => {
    it('should return a gas estimation of the transaction', async () => {
      const result = await provider.estimateFee({
        from: ADDRESS,
        to: RECEIVER,
        value: `0x${7_000_000_000n.toString(16)}`,
      });
      expect(result).not.to.be.null;
    });
  });

  describe('#estimateGas()', () => {
    it('should return a gas estimation of the transaction', async () => {
      const result = await provider.estimateGas({
        from: ADDRESS,
        to: await provider.l2TokenAddress(DAI_L1),
        data: utils.IERC20.encodeFunctionData('approve', [RECEIVER, 1]),
      });
      expect(result > 0).to.be.true;
    });

    it('should return a gas estimation of the EIP712 transaction', async () => {
      const result = await provider.estimateGas({
        from: ADDRESS,
        to: await provider.l2TokenAddress(DAI_L1),
        data: utils.IERC20.encodeFunctionData('approve', [RECEIVER, 1]),
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      });
      expect(result > 0).to.be.true;
    });
  });

  describe('#getFilterChanges()', () => {
    it('should return the filtered logs', async () => {
      const filter = await provider.newFilter({
        address: utils.L2_ETH_TOKEN_ADDRESS,
        topics: [ethers.id('Transfer(address,address,uint256)')],
      });
      const result = await provider.getFilterChanges(filter);
      expect(result).not.to.be.null;
    });
  });
});
