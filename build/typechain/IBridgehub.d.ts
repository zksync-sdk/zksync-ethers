import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export type L2LogStruct = {
    l2ShardId: BigNumberish;
    isService: boolean;
    txNumberInBatch: BigNumberish;
    sender: AddressLike;
    key: BytesLike;
    value: BytesLike;
};
export type L2LogStructOutput = [
    l2ShardId: bigint,
    isService: boolean,
    txNumberInBatch: bigint,
    sender: string,
    key: string,
    value: string
] & {
    l2ShardId: bigint;
    isService: boolean;
    txNumberInBatch: bigint;
    sender: string;
    key: string;
    value: string;
};
export type L2MessageStruct = {
    txNumberInBatch: BigNumberish;
    sender: AddressLike;
    data: BytesLike;
};
export type L2MessageStructOutput = [
    txNumberInBatch: bigint,
    sender: string,
    data: string
] & {
    txNumberInBatch: bigint;
    sender: string;
    data: string;
};
export type L2TransactionRequestDirectStruct = {
    chainId: BigNumberish;
    mintValue: BigNumberish;
    l2Contract: AddressLike;
    l2Value: BigNumberish;
    l2Calldata: BytesLike;
    l2GasLimit: BigNumberish;
    l2GasPerPubdataByteLimit: BigNumberish;
    factoryDeps: BytesLike[];
    refundRecipient: AddressLike;
};
export type L2TransactionRequestDirectStructOutput = [
    chainId: bigint,
    mintValue: bigint,
    l2Contract: string,
    l2Value: bigint,
    l2Calldata: string,
    l2GasLimit: bigint,
    l2GasPerPubdataByteLimit: bigint,
    factoryDeps: string[],
    refundRecipient: string
] & {
    chainId: bigint;
    mintValue: bigint;
    l2Contract: string;
    l2Value: bigint;
    l2Calldata: string;
    l2GasLimit: bigint;
    l2GasPerPubdataByteLimit: bigint;
    factoryDeps: string[];
    refundRecipient: string;
};
export type L2TransactionRequestTwoBridgesOuterStruct = {
    chainId: BigNumberish;
    mintValue: BigNumberish;
    l2Value: BigNumberish;
    l2GasLimit: BigNumberish;
    l2GasPerPubdataByteLimit: BigNumberish;
    refundRecipient: AddressLike;
    secondBridgeAddress: AddressLike;
    secondBridgeValue: BigNumberish;
    secondBridgeCalldata: BytesLike;
};
export type L2TransactionRequestTwoBridgesOuterStructOutput = [
    chainId: bigint,
    mintValue: bigint,
    l2Value: bigint,
    l2GasLimit: bigint,
    l2GasPerPubdataByteLimit: bigint,
    refundRecipient: string,
    secondBridgeAddress: string,
    secondBridgeValue: bigint,
    secondBridgeCalldata: string
] & {
    chainId: bigint;
    mintValue: bigint;
    l2Value: bigint;
    l2GasLimit: bigint;
    l2GasPerPubdataByteLimit: bigint;
    refundRecipient: string;
    secondBridgeAddress: string;
    secondBridgeValue: bigint;
    secondBridgeCalldata: string;
};
export interface IBridgehubInterface extends Interface {
    getFunction(nameOrSignature: "L1_CHAIN_ID" | "acceptAdmin" | "addChainTypeManager" | "addTokenAssetId" | "admin" | "assetIdIsRegistered" | "assetRouter" | "baseToken" | "baseTokenAssetId" | "bridgeBurn" | "bridgeMint" | "bridgeRecoverFailedTransfer" | "chainTypeManager" | "chainTypeManagerIsRegistered" | "createNewChain" | "ctmAssetIdFromAddress" | "ctmAssetIdFromChainId" | "ctmAssetIdToAddress" | "forwardTransactionOnGateway" | "getAllZKChainChainIDs" | "getAllZKChains" | "getHyperchain" | "getZKChain" | "l1CtmDeployer" | "l2TransactionBaseCost" | "messageRoot" | "migrationPaused" | "pauseMigration" | "proveL1ToL2TransactionStatus" | "proveL2LogInclusion" | "proveL2MessageInclusion" | "registerAlreadyDeployedZKChain" | "registerLegacyChain" | "registerSettlementLayer" | "removeChainTypeManager" | "requestL2TransactionDirect" | "requestL2TransactionTwoBridges" | "setAddresses" | "setCTMAssetAddress" | "setPendingAdmin" | "settlementLayer" | "sharedBridge" | "unpauseMigration" | "whitelistedSettlementLayers"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "AssetRegistered" | "BaseTokenAssetIdRegistered" | "BridgeBurn" | "BridgeMint" | "ChainTypeManagerAdded" | "ChainTypeManagerRemoved" | "MigrationFinalized" | "MigrationStarted" | "NewAdmin" | "NewChain" | "NewPendingAdmin" | "SettlementLayerRegistered"): EventFragment;
    encodeFunctionData(functionFragment: "L1_CHAIN_ID", values?: undefined): string;
    encodeFunctionData(functionFragment: "acceptAdmin", values?: undefined): string;
    encodeFunctionData(functionFragment: "addChainTypeManager", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "addTokenAssetId", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "admin", values?: undefined): string;
    encodeFunctionData(functionFragment: "assetIdIsRegistered", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "assetRouter", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseToken", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "baseTokenAssetId", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "bridgeBurn", values: [BigNumberish, BigNumberish, BytesLike, AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "bridgeMint", values: [BigNumberish, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "bridgeRecoverFailedTransfer", values: [BigNumberish, BytesLike, AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "chainTypeManager", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "chainTypeManagerIsRegistered", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "createNewChain", values: [
        BigNumberish,
        AddressLike,
        BytesLike,
        BigNumberish,
        AddressLike,
        BytesLike,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "ctmAssetIdFromAddress", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "ctmAssetIdFromChainId", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "ctmAssetIdToAddress", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "forwardTransactionOnGateway", values: [BigNumberish, BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getAllZKChainChainIDs", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAllZKChains", values?: undefined): string;
    encodeFunctionData(functionFragment: "getHyperchain", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getZKChain", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "l1CtmDeployer", values?: undefined): string;
    encodeFunctionData(functionFragment: "l2TransactionBaseCost", values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "messageRoot", values?: undefined): string;
    encodeFunctionData(functionFragment: "migrationPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "pauseMigration", values?: undefined): string;
    encodeFunctionData(functionFragment: "proveL1ToL2TransactionStatus", values: [
        BigNumberish,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike[],
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "proveL2LogInclusion", values: [BigNumberish, BigNumberish, BigNumberish, L2LogStruct, BytesLike[]]): string;
    encodeFunctionData(functionFragment: "proveL2MessageInclusion", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        L2MessageStruct,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "registerAlreadyDeployedZKChain", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "registerLegacyChain", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "registerSettlementLayer", values: [BigNumberish, boolean]): string;
    encodeFunctionData(functionFragment: "removeChainTypeManager", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "requestL2TransactionDirect", values: [L2TransactionRequestDirectStruct]): string;
    encodeFunctionData(functionFragment: "requestL2TransactionTwoBridges", values: [L2TransactionRequestTwoBridgesOuterStruct]): string;
    encodeFunctionData(functionFragment: "setAddresses", values: [AddressLike, AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "setCTMAssetAddress", values: [BytesLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "setPendingAdmin", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "settlementLayer", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "sharedBridge", values?: undefined): string;
    encodeFunctionData(functionFragment: "unpauseMigration", values?: undefined): string;
    encodeFunctionData(functionFragment: "whitelistedSettlementLayers", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "L1_CHAIN_ID", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "acceptAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addChainTypeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addTokenAssetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "admin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "assetIdIsRegistered", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "assetRouter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTokenAssetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgeBurn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgeMint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgeRecoverFailedTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "chainTypeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "chainTypeManagerIsRegistered", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createNewChain", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ctmAssetIdFromAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ctmAssetIdFromChainId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ctmAssetIdToAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "forwardTransactionOnGateway", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllZKChainChainIDs", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllZKChains", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getHyperchain", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getZKChain", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l1CtmDeployer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l2TransactionBaseCost", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "messageRoot", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "migrationPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pauseMigration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveL1ToL2TransactionStatus", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveL2LogInclusion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveL2MessageInclusion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registerAlreadyDeployedZKChain", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registerLegacyChain", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registerSettlementLayer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeChainTypeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requestL2TransactionDirect", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requestL2TransactionTwoBridges", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setAddresses", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setCTMAssetAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPendingAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "settlementLayer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sharedBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unpauseMigration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "whitelistedSettlementLayers", data: BytesLike): Result;
}
export declare namespace AssetRegisteredEvent {
    type InputTuple = [
        assetInfo: BytesLike,
        _assetAddress: AddressLike,
        additionalData: BytesLike,
        sender: AddressLike
    ];
    type OutputTuple = [
        assetInfo: string,
        _assetAddress: string,
        additionalData: string,
        sender: string
    ];
    interface OutputObject {
        assetInfo: string;
        _assetAddress: string;
        additionalData: string;
        sender: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace BaseTokenAssetIdRegisteredEvent {
    type InputTuple = [assetId: BytesLike];
    type OutputTuple = [assetId: string];
    interface OutputObject {
        assetId: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace BridgeBurnEvent {
    type InputTuple = [
        chainId: BigNumberish,
        assetId: BytesLike,
        sender: AddressLike,
        receiver: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        assetId: string,
        sender: string,
        receiver: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        assetId: string;
        sender: string;
        receiver: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace BridgeMintEvent {
    type InputTuple = [
        chainId: BigNumberish,
        assetId: BytesLike,
        receiver: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        assetId: string,
        receiver: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        assetId: string;
        receiver: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ChainTypeManagerAddedEvent {
    type InputTuple = [chainTypeManager: AddressLike];
    type OutputTuple = [chainTypeManager: string];
    interface OutputObject {
        chainTypeManager: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ChainTypeManagerRemovedEvent {
    type InputTuple = [chainTypeManager: AddressLike];
    type OutputTuple = [chainTypeManager: string];
    interface OutputObject {
        chainTypeManager: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace MigrationFinalizedEvent {
    type InputTuple = [
        chainId: BigNumberish,
        assetId: BytesLike,
        zkChain: AddressLike
    ];
    type OutputTuple = [chainId: bigint, assetId: string, zkChain: string];
    interface OutputObject {
        chainId: bigint;
        assetId: string;
        zkChain: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace MigrationStartedEvent {
    type InputTuple = [
        chainId: BigNumberish,
        assetId: BytesLike,
        settlementLayerChainId: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        assetId: string,
        settlementLayerChainId: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        assetId: string;
        settlementLayerChainId: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace NewAdminEvent {
    type InputTuple = [oldAdmin: AddressLike, newAdmin: AddressLike];
    type OutputTuple = [oldAdmin: string, newAdmin: string];
    interface OutputObject {
        oldAdmin: string;
        newAdmin: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace NewChainEvent {
    type InputTuple = [
        chainId: BigNumberish,
        chainTypeManager: AddressLike,
        chainGovernance: AddressLike
    ];
    type OutputTuple = [
        chainId: bigint,
        chainTypeManager: string,
        chainGovernance: string
    ];
    interface OutputObject {
        chainId: bigint;
        chainTypeManager: string;
        chainGovernance: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace NewPendingAdminEvent {
    type InputTuple = [
        oldPendingAdmin: AddressLike,
        newPendingAdmin: AddressLike
    ];
    type OutputTuple = [oldPendingAdmin: string, newPendingAdmin: string];
    interface OutputObject {
        oldPendingAdmin: string;
        newPendingAdmin: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace SettlementLayerRegisteredEvent {
    type InputTuple = [chainId: BigNumberish, isWhitelisted: boolean];
    type OutputTuple = [chainId: bigint, isWhitelisted: boolean];
    interface OutputObject {
        chainId: bigint;
        isWhitelisted: boolean;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IBridgehub extends BaseContract {
    connect(runner?: ContractRunner | null): IBridgehub;
    waitForDeployment(): Promise<this>;
    interface: IBridgehubInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    L1_CHAIN_ID: TypedContractMethod<[], [bigint], "view">;
    acceptAdmin: TypedContractMethod<[], [void], "nonpayable">;
    addChainTypeManager: TypedContractMethod<[
        _chainTypeManager: AddressLike
    ], [
        void
    ], "nonpayable">;
    addTokenAssetId: TypedContractMethod<[
        _baseTokenAssetId: BytesLike
    ], [
        void
    ], "nonpayable">;
    admin: TypedContractMethod<[], [string], "view">;
    assetIdIsRegistered: TypedContractMethod<[
        _baseTokenAssetId: BytesLike
    ], [
        boolean
    ], "view">;
    assetRouter: TypedContractMethod<[], [string], "view">;
    baseToken: TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    baseTokenAssetId: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        string
    ], "view">;
    bridgeBurn: TypedContractMethod<[
        _chainId: BigNumberish,
        _msgValue: BigNumberish,
        _assetId: BytesLike,
        _originalCaller: AddressLike,
        _data: BytesLike
    ], [
        string
    ], "payable">;
    bridgeMint: TypedContractMethod<[
        _chainId: BigNumberish,
        _assetId: BytesLike,
        _data: BytesLike
    ], [
        void
    ], "payable">;
    bridgeRecoverFailedTransfer: TypedContractMethod<[
        _chainId: BigNumberish,
        _assetId: BytesLike,
        _depositSender: AddressLike,
        _data: BytesLike
    ], [
        void
    ], "payable">;
    chainTypeManager: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        string
    ], "view">;
    chainTypeManagerIsRegistered: TypedContractMethod<[
        _chainTypeManager: AddressLike
    ], [
        boolean
    ], "view">;
    createNewChain: TypedContractMethod<[
        _chainId: BigNumberish,
        _chainTypeManager: AddressLike,
        _baseTokenAssetId: BytesLike,
        _salt: BigNumberish,
        _admin: AddressLike,
        _initData: BytesLike,
        _factoryDeps: BytesLike[]
    ], [
        bigint
    ], "nonpayable">;
    ctmAssetIdFromAddress: TypedContractMethod<[
        _ctmAddress: AddressLike
    ], [
        string
    ], "view">;
    ctmAssetIdFromChainId: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        string
    ], "view">;
    ctmAssetIdToAddress: TypedContractMethod<[
        _assetInfo: BytesLike
    ], [
        string
    ], "view">;
    forwardTransactionOnGateway: TypedContractMethod<[
        _chainId: BigNumberish,
        _canonicalTxHash: BytesLike,
        _expirationTimestamp: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getAllZKChainChainIDs: TypedContractMethod<[], [bigint[]], "view">;
    getAllZKChains: TypedContractMethod<[], [string[]], "view">;
    getHyperchain: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        string
    ], "view">;
    getZKChain: TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    l1CtmDeployer: TypedContractMethod<[], [string], "view">;
    l2TransactionBaseCost: TypedContractMethod<[
        _chainId: BigNumberish,
        _gasPrice: BigNumberish,
        _l2GasLimit: BigNumberish,
        _l2GasPerPubdataByteLimit: BigNumberish
    ], [
        bigint
    ], "view">;
    messageRoot: TypedContractMethod<[], [string], "view">;
    migrationPaused: TypedContractMethod<[], [boolean], "view">;
    pauseMigration: TypedContractMethod<[], [void], "nonpayable">;
    proveL1ToL2TransactionStatus: TypedContractMethod<[
        _chainId: BigNumberish,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[],
        _status: BigNumberish
    ], [
        boolean
    ], "view">;
    proveL2LogInclusion: TypedContractMethod<[
        _chainId: BigNumberish,
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _log: L2LogStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    proveL2MessageInclusion: TypedContractMethod<[
        _chainId: BigNumberish,
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _message: L2MessageStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    registerAlreadyDeployedZKChain: TypedContractMethod<[
        _chainId: BigNumberish,
        _hyperchain: AddressLike
    ], [
        void
    ], "nonpayable">;
    registerLegacyChain: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        void
    ], "nonpayable">;
    registerSettlementLayer: TypedContractMethod<[
        _newSettlementLayerChainId: BigNumberish,
        _isWhitelisted: boolean
    ], [
        void
    ], "nonpayable">;
    removeChainTypeManager: TypedContractMethod<[
        _chainTypeManager: AddressLike
    ], [
        void
    ], "nonpayable">;
    requestL2TransactionDirect: TypedContractMethod<[
        _request: L2TransactionRequestDirectStruct
    ], [
        string
    ], "payable">;
    requestL2TransactionTwoBridges: TypedContractMethod<[
        _request: L2TransactionRequestTwoBridgesOuterStruct
    ], [
        string
    ], "payable">;
    setAddresses: TypedContractMethod<[
        _sharedBridge: AddressLike,
        _l1CtmDeployer: AddressLike,
        _messageRoot: AddressLike
    ], [
        void
    ], "nonpayable">;
    setCTMAssetAddress: TypedContractMethod<[
        _additionalData: BytesLike,
        _assetAddress: AddressLike
    ], [
        void
    ], "nonpayable">;
    setPendingAdmin: TypedContractMethod<[
        _newPendingAdmin: AddressLike
    ], [
        void
    ], "nonpayable">;
    settlementLayer: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        bigint
    ], "view">;
    sharedBridge: TypedContractMethod<[], [string], "view">;
    unpauseMigration: TypedContractMethod<[], [void], "nonpayable">;
    whitelistedSettlementLayers: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "L1_CHAIN_ID"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "acceptAdmin"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "addChainTypeManager"): TypedContractMethod<[
        _chainTypeManager: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "addTokenAssetId"): TypedContractMethod<[_baseTokenAssetId: BytesLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "admin"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "assetIdIsRegistered"): TypedContractMethod<[_baseTokenAssetId: BytesLike], [boolean], "view">;
    getFunction(nameOrSignature: "assetRouter"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "baseToken"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "baseTokenAssetId"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "bridgeBurn"): TypedContractMethod<[
        _chainId: BigNumberish,
        _msgValue: BigNumberish,
        _assetId: BytesLike,
        _originalCaller: AddressLike,
        _data: BytesLike
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "bridgeMint"): TypedContractMethod<[
        _chainId: BigNumberish,
        _assetId: BytesLike,
        _data: BytesLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "bridgeRecoverFailedTransfer"): TypedContractMethod<[
        _chainId: BigNumberish,
        _assetId: BytesLike,
        _depositSender: AddressLike,
        _data: BytesLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "chainTypeManager"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "chainTypeManagerIsRegistered"): TypedContractMethod<[_chainTypeManager: AddressLike], [boolean], "view">;
    getFunction(nameOrSignature: "createNewChain"): TypedContractMethod<[
        _chainId: BigNumberish,
        _chainTypeManager: AddressLike,
        _baseTokenAssetId: BytesLike,
        _salt: BigNumberish,
        _admin: AddressLike,
        _initData: BytesLike,
        _factoryDeps: BytesLike[]
    ], [
        bigint
    ], "nonpayable">;
    getFunction(nameOrSignature: "ctmAssetIdFromAddress"): TypedContractMethod<[_ctmAddress: AddressLike], [string], "view">;
    getFunction(nameOrSignature: "ctmAssetIdFromChainId"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "ctmAssetIdToAddress"): TypedContractMethod<[_assetInfo: BytesLike], [string], "view">;
    getFunction(nameOrSignature: "forwardTransactionOnGateway"): TypedContractMethod<[
        _chainId: BigNumberish,
        _canonicalTxHash: BytesLike,
        _expirationTimestamp: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "getAllZKChainChainIDs"): TypedContractMethod<[], [bigint[]], "view">;
    getFunction(nameOrSignature: "getAllZKChains"): TypedContractMethod<[], [string[]], "view">;
    getFunction(nameOrSignature: "getHyperchain"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "getZKChain"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "l1CtmDeployer"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "l2TransactionBaseCost"): TypedContractMethod<[
        _chainId: BigNumberish,
        _gasPrice: BigNumberish,
        _l2GasLimit: BigNumberish,
        _l2GasPerPubdataByteLimit: BigNumberish
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "messageRoot"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "migrationPaused"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "pauseMigration"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "proveL1ToL2TransactionStatus"): TypedContractMethod<[
        _chainId: BigNumberish,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[],
        _status: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "proveL2LogInclusion"): TypedContractMethod<[
        _chainId: BigNumberish,
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _log: L2LogStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "proveL2MessageInclusion"): TypedContractMethod<[
        _chainId: BigNumberish,
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _message: L2MessageStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "registerAlreadyDeployedZKChain"): TypedContractMethod<[
        _chainId: BigNumberish,
        _hyperchain: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "registerLegacyChain"): TypedContractMethod<[_chainId: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "registerSettlementLayer"): TypedContractMethod<[
        _newSettlementLayerChainId: BigNumberish,
        _isWhitelisted: boolean
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "removeChainTypeManager"): TypedContractMethod<[
        _chainTypeManager: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "requestL2TransactionDirect"): TypedContractMethod<[
        _request: L2TransactionRequestDirectStruct
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "requestL2TransactionTwoBridges"): TypedContractMethod<[
        _request: L2TransactionRequestTwoBridgesOuterStruct
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "setAddresses"): TypedContractMethod<[
        _sharedBridge: AddressLike,
        _l1CtmDeployer: AddressLike,
        _messageRoot: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setCTMAssetAddress"): TypedContractMethod<[
        _additionalData: BytesLike,
        _assetAddress: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setPendingAdmin"): TypedContractMethod<[_newPendingAdmin: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "settlementLayer"): TypedContractMethod<[_chainId: BigNumberish], [bigint], "view">;
    getFunction(nameOrSignature: "sharedBridge"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "unpauseMigration"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "whitelistedSettlementLayers"): TypedContractMethod<[_chainId: BigNumberish], [boolean], "view">;
    getEvent(key: "AssetRegistered"): TypedContractEvent<AssetRegisteredEvent.InputTuple, AssetRegisteredEvent.OutputTuple, AssetRegisteredEvent.OutputObject>;
    getEvent(key: "BaseTokenAssetIdRegistered"): TypedContractEvent<BaseTokenAssetIdRegisteredEvent.InputTuple, BaseTokenAssetIdRegisteredEvent.OutputTuple, BaseTokenAssetIdRegisteredEvent.OutputObject>;
    getEvent(key: "BridgeBurn"): TypedContractEvent<BridgeBurnEvent.InputTuple, BridgeBurnEvent.OutputTuple, BridgeBurnEvent.OutputObject>;
    getEvent(key: "BridgeMint"): TypedContractEvent<BridgeMintEvent.InputTuple, BridgeMintEvent.OutputTuple, BridgeMintEvent.OutputObject>;
    getEvent(key: "ChainTypeManagerAdded"): TypedContractEvent<ChainTypeManagerAddedEvent.InputTuple, ChainTypeManagerAddedEvent.OutputTuple, ChainTypeManagerAddedEvent.OutputObject>;
    getEvent(key: "ChainTypeManagerRemoved"): TypedContractEvent<ChainTypeManagerRemovedEvent.InputTuple, ChainTypeManagerRemovedEvent.OutputTuple, ChainTypeManagerRemovedEvent.OutputObject>;
    getEvent(key: "MigrationFinalized"): TypedContractEvent<MigrationFinalizedEvent.InputTuple, MigrationFinalizedEvent.OutputTuple, MigrationFinalizedEvent.OutputObject>;
    getEvent(key: "MigrationStarted"): TypedContractEvent<MigrationStartedEvent.InputTuple, MigrationStartedEvent.OutputTuple, MigrationStartedEvent.OutputObject>;
    getEvent(key: "NewAdmin"): TypedContractEvent<NewAdminEvent.InputTuple, NewAdminEvent.OutputTuple, NewAdminEvent.OutputObject>;
    getEvent(key: "NewChain"): TypedContractEvent<NewChainEvent.InputTuple, NewChainEvent.OutputTuple, NewChainEvent.OutputObject>;
    getEvent(key: "NewPendingAdmin"): TypedContractEvent<NewPendingAdminEvent.InputTuple, NewPendingAdminEvent.OutputTuple, NewPendingAdminEvent.OutputObject>;
    getEvent(key: "SettlementLayerRegistered"): TypedContractEvent<SettlementLayerRegisteredEvent.InputTuple, SettlementLayerRegisteredEvent.OutputTuple, SettlementLayerRegisteredEvent.OutputObject>;
    filters: {
        "AssetRegistered(bytes32,address,bytes32,address)": TypedContractEvent<AssetRegisteredEvent.InputTuple, AssetRegisteredEvent.OutputTuple, AssetRegisteredEvent.OutputObject>;
        AssetRegistered: TypedContractEvent<AssetRegisteredEvent.InputTuple, AssetRegisteredEvent.OutputTuple, AssetRegisteredEvent.OutputObject>;
        "BaseTokenAssetIdRegistered(bytes32)": TypedContractEvent<BaseTokenAssetIdRegisteredEvent.InputTuple, BaseTokenAssetIdRegisteredEvent.OutputTuple, BaseTokenAssetIdRegisteredEvent.OutputObject>;
        BaseTokenAssetIdRegistered: TypedContractEvent<BaseTokenAssetIdRegisteredEvent.InputTuple, BaseTokenAssetIdRegisteredEvent.OutputTuple, BaseTokenAssetIdRegisteredEvent.OutputObject>;
        "BridgeBurn(uint256,bytes32,address,address,uint256)": TypedContractEvent<BridgeBurnEvent.InputTuple, BridgeBurnEvent.OutputTuple, BridgeBurnEvent.OutputObject>;
        BridgeBurn: TypedContractEvent<BridgeBurnEvent.InputTuple, BridgeBurnEvent.OutputTuple, BridgeBurnEvent.OutputObject>;
        "BridgeMint(uint256,bytes32,address,uint256)": TypedContractEvent<BridgeMintEvent.InputTuple, BridgeMintEvent.OutputTuple, BridgeMintEvent.OutputObject>;
        BridgeMint: TypedContractEvent<BridgeMintEvent.InputTuple, BridgeMintEvent.OutputTuple, BridgeMintEvent.OutputObject>;
        "ChainTypeManagerAdded(address)": TypedContractEvent<ChainTypeManagerAddedEvent.InputTuple, ChainTypeManagerAddedEvent.OutputTuple, ChainTypeManagerAddedEvent.OutputObject>;
        ChainTypeManagerAdded: TypedContractEvent<ChainTypeManagerAddedEvent.InputTuple, ChainTypeManagerAddedEvent.OutputTuple, ChainTypeManagerAddedEvent.OutputObject>;
        "ChainTypeManagerRemoved(address)": TypedContractEvent<ChainTypeManagerRemovedEvent.InputTuple, ChainTypeManagerRemovedEvent.OutputTuple, ChainTypeManagerRemovedEvent.OutputObject>;
        ChainTypeManagerRemoved: TypedContractEvent<ChainTypeManagerRemovedEvent.InputTuple, ChainTypeManagerRemovedEvent.OutputTuple, ChainTypeManagerRemovedEvent.OutputObject>;
        "MigrationFinalized(uint256,bytes32,address)": TypedContractEvent<MigrationFinalizedEvent.InputTuple, MigrationFinalizedEvent.OutputTuple, MigrationFinalizedEvent.OutputObject>;
        MigrationFinalized: TypedContractEvent<MigrationFinalizedEvent.InputTuple, MigrationFinalizedEvent.OutputTuple, MigrationFinalizedEvent.OutputObject>;
        "MigrationStarted(uint256,bytes32,uint256)": TypedContractEvent<MigrationStartedEvent.InputTuple, MigrationStartedEvent.OutputTuple, MigrationStartedEvent.OutputObject>;
        MigrationStarted: TypedContractEvent<MigrationStartedEvent.InputTuple, MigrationStartedEvent.OutputTuple, MigrationStartedEvent.OutputObject>;
        "NewAdmin(address,address)": TypedContractEvent<NewAdminEvent.InputTuple, NewAdminEvent.OutputTuple, NewAdminEvent.OutputObject>;
        NewAdmin: TypedContractEvent<NewAdminEvent.InputTuple, NewAdminEvent.OutputTuple, NewAdminEvent.OutputObject>;
        "NewChain(uint256,address,address)": TypedContractEvent<NewChainEvent.InputTuple, NewChainEvent.OutputTuple, NewChainEvent.OutputObject>;
        NewChain: TypedContractEvent<NewChainEvent.InputTuple, NewChainEvent.OutputTuple, NewChainEvent.OutputObject>;
        "NewPendingAdmin(address,address)": TypedContractEvent<NewPendingAdminEvent.InputTuple, NewPendingAdminEvent.OutputTuple, NewPendingAdminEvent.OutputObject>;
        NewPendingAdmin: TypedContractEvent<NewPendingAdminEvent.InputTuple, NewPendingAdminEvent.OutputTuple, NewPendingAdminEvent.OutputObject>;
        "SettlementLayerRegistered(uint256,bool)": TypedContractEvent<SettlementLayerRegisteredEvent.InputTuple, SettlementLayerRegisteredEvent.OutputTuple, SettlementLayerRegisteredEvent.OutputObject>;
        SettlementLayerRegistered: TypedContractEvent<SettlementLayerRegisteredEvent.InputTuple, SettlementLayerRegisteredEvent.OutputTuple, SettlementLayerRegisteredEvent.OutputObject>;
    };
}
