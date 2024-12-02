import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export declare namespace IContractDeployer {
    type AccountInfoStruct = {
        supportedAAVersion: BigNumberish;
        nonceOrdering: BigNumberish;
    };
    type AccountInfoStructOutput = [
        supportedAAVersion: bigint,
        nonceOrdering: bigint
    ] & {
        supportedAAVersion: bigint;
        nonceOrdering: bigint;
    };
}
export interface IContractDeployerInterface extends Interface {
    getFunction(nameOrSignature: "create" | "create2" | "create2Account" | "createAccount" | "getAccountInfo" | "getNewAddressCreate" | "getNewAddressCreate2" | "updateAccountVersion" | "updateNonceOrdering"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "AccountNonceOrderingUpdated" | "AccountVersionUpdated" | "ContractDeployed"): EventFragment;
    encodeFunctionData(functionFragment: "create", values: [BytesLike, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "create2", values: [BytesLike, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "create2Account", values: [BytesLike, BytesLike, BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "createAccount", values: [BytesLike, BytesLike, BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getAccountInfo", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getNewAddressCreate", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getNewAddressCreate2", values: [AddressLike, BytesLike, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "updateAccountVersion", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "updateNonceOrdering", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "create", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "create2", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "create2Account", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAccountInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getNewAddressCreate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getNewAddressCreate2", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateAccountVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateNonceOrdering", data: BytesLike): Result;
}
export declare namespace AccountNonceOrderingUpdatedEvent {
    type InputTuple = [
        accountAddress: AddressLike,
        nonceOrdering: BigNumberish
    ];
    type OutputTuple = [accountAddress: string, nonceOrdering: bigint];
    interface OutputObject {
        accountAddress: string;
        nonceOrdering: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace AccountVersionUpdatedEvent {
    type InputTuple = [
        accountAddress: AddressLike,
        aaVersion: BigNumberish
    ];
    type OutputTuple = [accountAddress: string, aaVersion: bigint];
    interface OutputObject {
        accountAddress: string;
        aaVersion: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ContractDeployedEvent {
    type InputTuple = [
        deployerAddress: AddressLike,
        bytecodeHash: BytesLike,
        contractAddress: AddressLike
    ];
    type OutputTuple = [
        deployerAddress: string,
        bytecodeHash: string,
        contractAddress: string
    ];
    interface OutputObject {
        deployerAddress: string;
        bytecodeHash: string;
        contractAddress: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IContractDeployer extends BaseContract {
    connect(runner?: ContractRunner | null): IContractDeployer;
    waitForDeployment(): Promise<this>;
    interface: IContractDeployerInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    create: TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike
    ], [
        string
    ], "payable">;
    create2: TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike
    ], [
        string
    ], "payable">;
    create2Account: TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike,
        _aaVersion: BigNumberish
    ], [
        string
    ], "payable">;
    createAccount: TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike,
        _aaVersion: BigNumberish
    ], [
        string
    ], "payable">;
    getAccountInfo: TypedContractMethod<[
        _address: AddressLike
    ], [
        IContractDeployer.AccountInfoStructOutput
    ], "view">;
    getNewAddressCreate: TypedContractMethod<[
        _sender: AddressLike,
        _senderNonce: BigNumberish
    ], [
        string
    ], "view">;
    getNewAddressCreate2: TypedContractMethod<[
        _sender: AddressLike,
        _bytecodeHash: BytesLike,
        _salt: BytesLike,
        _input: BytesLike
    ], [
        string
    ], "view">;
    updateAccountVersion: TypedContractMethod<[
        _version: BigNumberish
    ], [
        void
    ], "nonpayable">;
    updateNonceOrdering: TypedContractMethod<[
        _nonceOrdering: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "create"): TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "create2"): TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "create2Account"): TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike,
        _aaVersion: BigNumberish
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "createAccount"): TypedContractMethod<[
        _salt: BytesLike,
        _bytecodeHash: BytesLike,
        _input: BytesLike,
        _aaVersion: BigNumberish
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "getAccountInfo"): TypedContractMethod<[
        _address: AddressLike
    ], [
        IContractDeployer.AccountInfoStructOutput
    ], "view">;
    getFunction(nameOrSignature: "getNewAddressCreate"): TypedContractMethod<[
        _sender: AddressLike,
        _senderNonce: BigNumberish
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "getNewAddressCreate2"): TypedContractMethod<[
        _sender: AddressLike,
        _bytecodeHash: BytesLike,
        _salt: BytesLike,
        _input: BytesLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "updateAccountVersion"): TypedContractMethod<[_version: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "updateNonceOrdering"): TypedContractMethod<[_nonceOrdering: BigNumberish], [void], "nonpayable">;
    getEvent(key: "AccountNonceOrderingUpdated"): TypedContractEvent<AccountNonceOrderingUpdatedEvent.InputTuple, AccountNonceOrderingUpdatedEvent.OutputTuple, AccountNonceOrderingUpdatedEvent.OutputObject>;
    getEvent(key: "AccountVersionUpdated"): TypedContractEvent<AccountVersionUpdatedEvent.InputTuple, AccountVersionUpdatedEvent.OutputTuple, AccountVersionUpdatedEvent.OutputObject>;
    getEvent(key: "ContractDeployed"): TypedContractEvent<ContractDeployedEvent.InputTuple, ContractDeployedEvent.OutputTuple, ContractDeployedEvent.OutputObject>;
    filters: {
        "AccountNonceOrderingUpdated(address,uint8)": TypedContractEvent<AccountNonceOrderingUpdatedEvent.InputTuple, AccountNonceOrderingUpdatedEvent.OutputTuple, AccountNonceOrderingUpdatedEvent.OutputObject>;
        AccountNonceOrderingUpdated: TypedContractEvent<AccountNonceOrderingUpdatedEvent.InputTuple, AccountNonceOrderingUpdatedEvent.OutputTuple, AccountNonceOrderingUpdatedEvent.OutputObject>;
        "AccountVersionUpdated(address,uint8)": TypedContractEvent<AccountVersionUpdatedEvent.InputTuple, AccountVersionUpdatedEvent.OutputTuple, AccountVersionUpdatedEvent.OutputObject>;
        AccountVersionUpdated: TypedContractEvent<AccountVersionUpdatedEvent.InputTuple, AccountVersionUpdatedEvent.OutputTuple, AccountVersionUpdatedEvent.OutputObject>;
        "ContractDeployed(address,bytes32,address)": TypedContractEvent<ContractDeployedEvent.InputTuple, ContractDeployedEvent.OutputTuple, ContractDeployedEvent.OutputObject>;
        ContractDeployed: TypedContractEvent<ContractDeployedEvent.InputTuple, ContractDeployedEvent.OutputTuple, ContractDeployedEvent.OutputObject>;
    };
}
