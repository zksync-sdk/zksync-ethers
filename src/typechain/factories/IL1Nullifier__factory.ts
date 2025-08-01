/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type { IL1Nullifier, IL1NullifierInterface } from "../IL1Nullifier";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "txDataHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "l2DepositTxHash",
        type: "bytes32",
      },
    ],
    name: "BridgehubDepositFinalized",
    type: "event",
  },
  {
    inputs: [],
    name: "BRIDGE_HUB",
    outputs: [
      {
        internalType: "contract IBridgehub",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_depositSender",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_assetId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_assetData",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "_l2TxHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_l2BatchNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2MessageIndex",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_l2TxNumberInBatch",
        type: "uint16",
      },
      {
        internalType: "bytes32[]",
        name: "_merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "bridgeRecoverFailedTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_txDataHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_txHash",
        type: "bytes32",
      },
    ],
    name: "bridgehubConfirmL2TransactionForwarded",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "chainBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_depositSender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_l1Token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_l2TxHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_l2BatchNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2MessageIndex",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_l2TxNumberInBatch",
        type: "uint16",
      },
      {
        internalType: "bytes32[]",
        name: "_merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "claimFailedDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_depositSender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_l1Token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_l2TxHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_l2BatchNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2MessageIndex",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_l2TxNumberInBatch",
        type: "uint16",
      },
      {
        internalType: "bytes32[]",
        name: "_merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "claimFailedDepositLegacyErc20Bridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_l2TxHash",
        type: "bytes32",
      },
    ],
    name: "depositHappened",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "l2BatchNumber",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "l2MessageIndex",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "l2Sender",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "l2TxNumberInBatch",
            type: "uint16",
          },
          {
            internalType: "bytes",
            name: "message",
            type: "bytes",
          },
          {
            internalType: "bytes32[]",
            name: "merkleProof",
            type: "bytes32[]",
          },
        ],
        internalType: "struct FinalizeL1DepositParams",
        name: "_finalizeWithdrawalParams",
        type: "tuple",
      },
    ],
    name: "finalizeDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2BatchNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2MessageIndex",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_l2TxNumberInBatch",
        type: "uint16",
      },
      {
        internalType: "bytes",
        name: "_message",
        type: "bytes",
      },
      {
        internalType: "bytes32[]",
        name: "_merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "finalizeWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2BatchNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_l2MessageIndex",
        type: "uint256",
      },
    ],
    name: "isWithdrawalFinalized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l1NativeTokenVault",
    outputs: [
      {
        internalType: "contract IL1NativeTokenVault",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
    ],
    name: "l2BridgeAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "legacyBridge",
    outputs: [
      {
        internalType: "contract IL1ERC20Bridge",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "nullifyChainBalanceByNTV",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_l1AssetRouter",
        type: "address",
      },
    ],
    name: "setL1AssetRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IL1NativeTokenVault",
        name: "_nativeTokenVault",
        type: "address",
      },
    ],
    name: "setL1NativeTokenVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "transferTokenToNTV",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IL1Nullifier__factory {
  static readonly abi = _abi;
  static createInterface(): IL1NullifierInterface {
    return new Interface(_abi) as IL1NullifierInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IL1Nullifier {
    return new Contract(address, _abi, runner) as unknown as IL1Nullifier;
  }
}
