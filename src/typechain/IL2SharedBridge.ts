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

export interface IL2SharedBridgeInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "finalizeDeposit"
      | "l1Bridge"
      | "l1SharedBridge"
      | "l1TokenAddress"
      | "l2TokenAddress"
      | "withdraw"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "FinalizeDeposit" | "WithdrawalInitiated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "finalizeDeposit",
    values: [AddressLike, AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "l1Bridge", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "l1SharedBridge",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "l1TokenAddress",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "l2TokenAddress",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "finalizeDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "l1Bridge", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "l1SharedBridge",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "l1TokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "l2TokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
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

export interface IL2SharedBridge extends BaseContract {
  connect(runner?: ContractRunner | null): IL2SharedBridge;
  waitForDeployment(): Promise<this>;

  interface: IL2SharedBridgeInterface;

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

  finalizeDeposit: TypedContractMethod<
    [
      _l1Sender: AddressLike,
      _l2Receiver: AddressLike,
      _l1Token: AddressLike,
      _amount: BigNumberish,
      _data: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  l1Bridge: TypedContractMethod<[], [string], "view">;

  l1SharedBridge: TypedContractMethod<[], [string], "view">;

  l1TokenAddress: TypedContractMethod<
    [_l2Token: AddressLike],
    [string],
    "view"
  >;

  l2TokenAddress: TypedContractMethod<
    [_l1Token: AddressLike],
    [string],
    "view"
  >;

  withdraw: TypedContractMethod<
    [_l1Receiver: AddressLike, _l2Token: AddressLike, _amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "finalizeDeposit"
  ): TypedContractMethod<
    [
      _l1Sender: AddressLike,
      _l2Receiver: AddressLike,
      _l1Token: AddressLike,
      _amount: BigNumberish,
      _data: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "l1Bridge"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "l1SharedBridge"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "l1TokenAddress"
  ): TypedContractMethod<[_l2Token: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "l2TokenAddress"
  ): TypedContractMethod<[_l1Token: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "withdraw"
  ): TypedContractMethod<
    [_l1Receiver: AddressLike, _l2Token: AddressLike, _amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "FinalizeDeposit"
  ): TypedContractEvent<
    FinalizeDepositEvent.InputTuple,
    FinalizeDepositEvent.OutputTuple,
    FinalizeDepositEvent.OutputObject
  >;
  getEvent(
    key: "WithdrawalInitiated"
  ): TypedContractEvent<
    WithdrawalInitiatedEvent.InputTuple,
    WithdrawalInitiatedEvent.OutputTuple,
    WithdrawalInitiatedEvent.OutputObject
  >;

  filters: {
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
