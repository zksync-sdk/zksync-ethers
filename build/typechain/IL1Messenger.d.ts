import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export type L2ToL1LogStruct = {
    l2ShardId: BigNumberish;
    isService: boolean;
    txNumberInBlock: BigNumberish;
    sender: AddressLike;
    key: BytesLike;
    value: BytesLike;
};
export type L2ToL1LogStructOutput = [
    l2ShardId: bigint,
    isService: boolean,
    txNumberInBlock: bigint,
    sender: string,
    key: string,
    value: string
] & {
    l2ShardId: bigint;
    isService: boolean;
    txNumberInBlock: bigint;
    sender: string;
    key: string;
    value: string;
};
export interface IL1MessengerInterface extends Interface {
    getFunction(nameOrSignature: "requestBytecodeL1Publication" | "sendL2ToL1Log" | "sendToL1"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BytecodeL1PublicationRequested" | "L1MessageSent" | "L2ToL1LogSent"): EventFragment;
    encodeFunctionData(functionFragment: "requestBytecodeL1Publication", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "sendL2ToL1Log", values: [boolean, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "sendToL1", values: [BytesLike]): string;
    decodeFunctionResult(functionFragment: "requestBytecodeL1Publication", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sendL2ToL1Log", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sendToL1", data: BytesLike): Result;
}
export declare namespace BytecodeL1PublicationRequestedEvent {
    type InputTuple = [_bytecodeHash: BytesLike];
    type OutputTuple = [_bytecodeHash: string];
    interface OutputObject {
        _bytecodeHash: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace L1MessageSentEvent {
    type InputTuple = [
        _sender: AddressLike,
        _hash: BytesLike,
        _message: BytesLike
    ];
    type OutputTuple = [_sender: string, _hash: string, _message: string];
    interface OutputObject {
        _sender: string;
        _hash: string;
        _message: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace L2ToL1LogSentEvent {
    type InputTuple = [_l2log: L2ToL1LogStruct];
    type OutputTuple = [_l2log: L2ToL1LogStructOutput];
    interface OutputObject {
        _l2log: L2ToL1LogStructOutput;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IL1Messenger extends BaseContract {
    connect(runner?: ContractRunner | null): IL1Messenger;
    waitForDeployment(): Promise<this>;
    interface: IL1MessengerInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    requestBytecodeL1Publication: TypedContractMethod<[
        _bytecodeHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    sendL2ToL1Log: TypedContractMethod<[
        _isService: boolean,
        _key: BytesLike,
        _value: BytesLike
    ], [
        bigint
    ], "nonpayable">;
    sendToL1: TypedContractMethod<[_message: BytesLike], [string], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "requestBytecodeL1Publication"): TypedContractMethod<[_bytecodeHash: BytesLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "sendL2ToL1Log"): TypedContractMethod<[
        _isService: boolean,
        _key: BytesLike,
        _value: BytesLike
    ], [
        bigint
    ], "nonpayable">;
    getFunction(nameOrSignature: "sendToL1"): TypedContractMethod<[_message: BytesLike], [string], "nonpayable">;
    getEvent(key: "BytecodeL1PublicationRequested"): TypedContractEvent<BytecodeL1PublicationRequestedEvent.InputTuple, BytecodeL1PublicationRequestedEvent.OutputTuple, BytecodeL1PublicationRequestedEvent.OutputObject>;
    getEvent(key: "L1MessageSent"): TypedContractEvent<L1MessageSentEvent.InputTuple, L1MessageSentEvent.OutputTuple, L1MessageSentEvent.OutputObject>;
    getEvent(key: "L2ToL1LogSent"): TypedContractEvent<L2ToL1LogSentEvent.InputTuple, L2ToL1LogSentEvent.OutputTuple, L2ToL1LogSentEvent.OutputObject>;
    filters: {
        "BytecodeL1PublicationRequested(bytes32)": TypedContractEvent<BytecodeL1PublicationRequestedEvent.InputTuple, BytecodeL1PublicationRequestedEvent.OutputTuple, BytecodeL1PublicationRequestedEvent.OutputObject>;
        BytecodeL1PublicationRequested: TypedContractEvent<BytecodeL1PublicationRequestedEvent.InputTuple, BytecodeL1PublicationRequestedEvent.OutputTuple, BytecodeL1PublicationRequestedEvent.OutputObject>;
        "L1MessageSent(address,bytes32,bytes)": TypedContractEvent<L1MessageSentEvent.InputTuple, L1MessageSentEvent.OutputTuple, L1MessageSentEvent.OutputObject>;
        L1MessageSent: TypedContractEvent<L1MessageSentEvent.InputTuple, L1MessageSentEvent.OutputTuple, L1MessageSentEvent.OutputObject>;
        "L2ToL1LogSent(tuple)": TypedContractEvent<L2ToL1LogSentEvent.InputTuple, L2ToL1LogSentEvent.OutputTuple, L2ToL1LogSentEvent.OutputObject>;
        L2ToL1LogSent: TypedContractEvent<L2ToL1LogSentEvent.InputTuple, L2ToL1LogSentEvent.OutputTuple, L2ToL1LogSentEvent.OutputObject>;
    };
}
