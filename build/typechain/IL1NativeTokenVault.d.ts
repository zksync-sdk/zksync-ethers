import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export interface IL1NativeTokenVaultInterface extends Interface {
    getFunction(nameOrSignature: "ASSET_ROUTER" | "L1_NULLIFIER" | "WETH_TOKEN" | "assetId" | "calculateAssetId" | "calculateCreate2TokenAddress" | "chainBalance" | "getERC20Getters" | "originChainId" | "registerEthToken" | "registerToken" | "tokenAddress"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BridgedTokenBeaconUpdated" | "TokenBeaconUpdated"): EventFragment;
    encodeFunctionData(functionFragment: "ASSET_ROUTER", values?: undefined): string;
    encodeFunctionData(functionFragment: "L1_NULLIFIER", values?: undefined): string;
    encodeFunctionData(functionFragment: "WETH_TOKEN", values?: undefined): string;
    encodeFunctionData(functionFragment: "assetId", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "calculateAssetId", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "calculateCreate2TokenAddress", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "chainBalance", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "getERC20Getters", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "originChainId", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "registerEthToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "registerToken", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "tokenAddress", values: [BytesLike]): string;
    decodeFunctionResult(functionFragment: "ASSET_ROUTER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "L1_NULLIFIER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "WETH_TOKEN", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "assetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calculateAssetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calculateCreate2TokenAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "chainBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getERC20Getters", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "originChainId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registerEthToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registerToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenAddress", data: BytesLike): Result;
}
export declare namespace BridgedTokenBeaconUpdatedEvent {
    type InputTuple = [
        bridgedTokenBeacon: AddressLike,
        bridgedTokenProxyBytecodeHash: BytesLike
    ];
    type OutputTuple = [
        bridgedTokenBeacon: string,
        bridgedTokenProxyBytecodeHash: string
    ];
    interface OutputObject {
        bridgedTokenBeacon: string;
        bridgedTokenProxyBytecodeHash: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace TokenBeaconUpdatedEvent {
    type InputTuple = [l2TokenBeacon: AddressLike];
    type OutputTuple = [l2TokenBeacon: string];
    interface OutputObject {
        l2TokenBeacon: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IL1NativeTokenVault extends BaseContract {
    connect(runner?: ContractRunner | null): IL1NativeTokenVault;
    waitForDeployment(): Promise<this>;
    interface: IL1NativeTokenVaultInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    ASSET_ROUTER: TypedContractMethod<[], [string], "view">;
    L1_NULLIFIER: TypedContractMethod<[], [string], "view">;
    WETH_TOKEN: TypedContractMethod<[], [string], "view">;
    assetId: TypedContractMethod<[token: AddressLike], [string], "view">;
    calculateAssetId: TypedContractMethod<[
        _chainId: BigNumberish,
        _tokenAddress: AddressLike
    ], [
        string
    ], "view">;
    calculateCreate2TokenAddress: TypedContractMethod<[
        _originChainId: BigNumberish,
        _originToken: AddressLike
    ], [
        string
    ], "view">;
    chainBalance: TypedContractMethod<[
        _chainId: BigNumberish,
        _assetId: BytesLike
    ], [
        bigint
    ], "view">;
    getERC20Getters: TypedContractMethod<[
        _token: AddressLike,
        _originChainId: BigNumberish
    ], [
        string
    ], "view">;
    originChainId: TypedContractMethod<[assetId: BytesLike], [bigint], "view">;
    registerEthToken: TypedContractMethod<[], [void], "nonpayable">;
    registerToken: TypedContractMethod<[
        _l1Token: AddressLike
    ], [
        void
    ], "nonpayable">;
    tokenAddress: TypedContractMethod<[assetId: BytesLike], [string], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "ASSET_ROUTER"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "L1_NULLIFIER"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "WETH_TOKEN"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "assetId"): TypedContractMethod<[token: AddressLike], [string], "view">;
    getFunction(nameOrSignature: "calculateAssetId"): TypedContractMethod<[
        _chainId: BigNumberish,
        _tokenAddress: AddressLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "calculateCreate2TokenAddress"): TypedContractMethod<[
        _originChainId: BigNumberish,
        _originToken: AddressLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "chainBalance"): TypedContractMethod<[
        _chainId: BigNumberish,
        _assetId: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "getERC20Getters"): TypedContractMethod<[
        _token: AddressLike,
        _originChainId: BigNumberish
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "originChainId"): TypedContractMethod<[assetId: BytesLike], [bigint], "view">;
    getFunction(nameOrSignature: "registerEthToken"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "registerToken"): TypedContractMethod<[_l1Token: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "tokenAddress"): TypedContractMethod<[assetId: BytesLike], [string], "view">;
    getEvent(key: "BridgedTokenBeaconUpdated"): TypedContractEvent<BridgedTokenBeaconUpdatedEvent.InputTuple, BridgedTokenBeaconUpdatedEvent.OutputTuple, BridgedTokenBeaconUpdatedEvent.OutputObject>;
    getEvent(key: "TokenBeaconUpdated"): TypedContractEvent<TokenBeaconUpdatedEvent.InputTuple, TokenBeaconUpdatedEvent.OutputTuple, TokenBeaconUpdatedEvent.OutputObject>;
    filters: {
        "BridgedTokenBeaconUpdated(address,bytes32)": TypedContractEvent<BridgedTokenBeaconUpdatedEvent.InputTuple, BridgedTokenBeaconUpdatedEvent.OutputTuple, BridgedTokenBeaconUpdatedEvent.OutputObject>;
        BridgedTokenBeaconUpdated: TypedContractEvent<BridgedTokenBeaconUpdatedEvent.InputTuple, BridgedTokenBeaconUpdatedEvent.OutputTuple, BridgedTokenBeaconUpdatedEvent.OutputObject>;
        "TokenBeaconUpdated(address)": TypedContractEvent<TokenBeaconUpdatedEvent.InputTuple, TokenBeaconUpdatedEvent.OutputTuple, TokenBeaconUpdatedEvent.OutputObject>;
        TokenBeaconUpdated: TypedContractEvent<TokenBeaconUpdatedEvent.InputTuple, TokenBeaconUpdatedEvent.OutputTuple, TokenBeaconUpdatedEvent.OutputObject>;
    };
}
