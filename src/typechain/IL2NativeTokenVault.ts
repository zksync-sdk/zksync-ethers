/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface IL2NativeTokenVaultInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "ASSET_ROUTER"
      | "WETH_TOKEN"
      | "assetId"
      | "calculateAssetId"
      | "calculateCreate2TokenAddress"
      | "getERC20Getters"
      | "l2TokenAddress"
      | "originChainId"
      | "registerToken"
      | "tokenAddress"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "BridgedTokenBeaconUpdated"
      | "FinalizeDeposit"
      | "L2TokenBeaconUpdated"
      | "WithdrawalInitiated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "ASSET_ROUTER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "WETH_TOKEN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "assetId",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "calculateAssetId",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "calculateCreate2TokenAddress",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getERC20Getters",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "l2TokenAddress",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "originChainId",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "registerToken",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenAddress",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "ASSET_ROUTER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "WETH_TOKEN", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "assetId", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "calculateAssetId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "calculateCreate2TokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getERC20Getters",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "l2TokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "originChainId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenAddress",
    data: BytesLike
  ): Result;
}

export namespace BridgedTokenBeaconUpdatedEvent {
  export type InputTuple = [
    bridgedTokenBeacon: AddressLike,
    bridgedTokenProxyBytecodeHash: BytesLike
  ];
  export type OutputTuple = [
    bridgedTokenBeacon: string,
    bridgedTokenProxyBytecodeHash: string
  ];
  export interface OutputObject {
    bridgedTokenBeacon: string;
    bridgedTokenProxyBytecodeHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FinalizeDepositEvent {
  export type InputTuple = [
    l1Sender: AddressLike,
    l2Receiver: AddressLike,
    l2Token: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [
    l1Sender: string,
    l2Receiver: string,
    l2Token: string,
    amount: bigint
  ];
  export interface OutputObject {
    l1Sender: string;
    l2Receiver: string;
    l2Token: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace L2TokenBeaconUpdatedEvent {
  export type InputTuple = [
    l2TokenBeacon: AddressLike,
    l2TokenProxyBytecodeHash: BytesLike
  ];
  export type OutputTuple = [
    l2TokenBeacon: string,
    l2TokenProxyBytecodeHash: string
  ];
  export interface OutputObject {
    l2TokenBeacon: string;
    l2TokenProxyBytecodeHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WithdrawalInitiatedEvent {
  export type InputTuple = [
    l2Sender: AddressLike,
    l1Receiver: AddressLike,
    l2Token: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [
    l2Sender: string,
    l1Receiver: string,
    l2Token: string,
    amount: bigint
  ];
  export interface OutputObject {
    l2Sender: string;
    l1Receiver: string;
    l2Token: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IL2NativeTokenVault extends BaseContract {
  connect(runner?: ContractRunner | null): IL2NativeTokenVault;
  waitForDeployment(): Promise<this>;

  interface: IL2NativeTokenVaultInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  ASSET_ROUTER: TypedContractMethod<[], [string], "view">;

  WETH_TOKEN: TypedContractMethod<[], [string], "view">;

  assetId: TypedContractMethod<[token: AddressLike], [string], "view">;

  calculateAssetId: TypedContractMethod<
    [_chainId: BigNumberish, _tokenAddress: AddressLike],
    [string],
    "view"
  >;

  calculateCreate2TokenAddress: TypedContractMethod<
    [_originChainId: BigNumberish, _originToken: AddressLike],
    [string],
    "view"
  >;

  getERC20Getters: TypedContractMethod<
    [_token: AddressLike, _originChainId: BigNumberish],
    [string],
    "view"
  >;

  l2TokenAddress: TypedContractMethod<
    [_l1Token: AddressLike],
    [string],
    "view"
  >;

  originChainId: TypedContractMethod<[assetId: BytesLike], [bigint], "view">;

  registerToken: TypedContractMethod<
    [_l1Token: AddressLike],
    [void],
    "nonpayable"
  >;

  tokenAddress: TypedContractMethod<[assetId: BytesLike], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "ASSET_ROUTER"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "WETH_TOKEN"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "assetId"
  ): TypedContractMethod<[token: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "calculateAssetId"
  ): TypedContractMethod<
    [_chainId: BigNumberish, _tokenAddress: AddressLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "calculateCreate2TokenAddress"
  ): TypedContractMethod<
    [_originChainId: BigNumberish, _originToken: AddressLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "getERC20Getters"
  ): TypedContractMethod<
    [_token: AddressLike, _originChainId: BigNumberish],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "l2TokenAddress"
  ): TypedContractMethod<[_l1Token: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "originChainId"
  ): TypedContractMethod<[assetId: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "registerToken"
  ): TypedContractMethod<[_l1Token: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "tokenAddress"
  ): TypedContractMethod<[assetId: BytesLike], [string], "view">;

  getEvent(
    key: "BridgedTokenBeaconUpdated"
  ): TypedContractEvent<
    BridgedTokenBeaconUpdatedEvent.InputTuple,
    BridgedTokenBeaconUpdatedEvent.OutputTuple,
    BridgedTokenBeaconUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "FinalizeDeposit"
  ): TypedContractEvent<
    FinalizeDepositEvent.InputTuple,
    FinalizeDepositEvent.OutputTuple,
    FinalizeDepositEvent.OutputObject
  >;
  getEvent(
    key: "L2TokenBeaconUpdated"
  ): TypedContractEvent<
    L2TokenBeaconUpdatedEvent.InputTuple,
    L2TokenBeaconUpdatedEvent.OutputTuple,
    L2TokenBeaconUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "WithdrawalInitiated"
  ): TypedContractEvent<
    WithdrawalInitiatedEvent.InputTuple,
    WithdrawalInitiatedEvent.OutputTuple,
    WithdrawalInitiatedEvent.OutputObject
  >;

  filters: {
    "BridgedTokenBeaconUpdated(address,bytes32)": TypedContractEvent<
      BridgedTokenBeaconUpdatedEvent.InputTuple,
      BridgedTokenBeaconUpdatedEvent.OutputTuple,
      BridgedTokenBeaconUpdatedEvent.OutputObject
    >;
    BridgedTokenBeaconUpdated: TypedContractEvent<
      BridgedTokenBeaconUpdatedEvent.InputTuple,
      BridgedTokenBeaconUpdatedEvent.OutputTuple,
      BridgedTokenBeaconUpdatedEvent.OutputObject
    >;

    "FinalizeDeposit(address,address,address,uint256)": TypedContractEvent<
      FinalizeDepositEvent.InputTuple,
      FinalizeDepositEvent.OutputTuple,
      FinalizeDepositEvent.OutputObject
    >;
    FinalizeDeposit: TypedContractEvent<
      FinalizeDepositEvent.InputTuple,
      FinalizeDepositEvent.OutputTuple,
      FinalizeDepositEvent.OutputObject
    >;

    "L2TokenBeaconUpdated(address,bytes32)": TypedContractEvent<
      L2TokenBeaconUpdatedEvent.InputTuple,
      L2TokenBeaconUpdatedEvent.OutputTuple,
      L2TokenBeaconUpdatedEvent.OutputObject
    >;
    L2TokenBeaconUpdated: TypedContractEvent<
      L2TokenBeaconUpdatedEvent.InputTuple,
      L2TokenBeaconUpdatedEvent.OutputTuple,
      L2TokenBeaconUpdatedEvent.OutputObject
    >;

    "WithdrawalInitiated(address,address,address,uint256)": TypedContractEvent<
      WithdrawalInitiatedEvent.InputTuple,
      WithdrawalInitiatedEvent.OutputTuple,
      WithdrawalInitiatedEvent.OutputObject
    >;
    WithdrawalInitiated: TypedContractEvent<
      WithdrawalInitiatedEvent.InputTuple,
      WithdrawalInitiatedEvent.OutputTuple,
      WithdrawalInitiatedEvent.OutputObject
    >;
  };
}