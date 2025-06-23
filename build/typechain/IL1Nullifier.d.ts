import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export type FinalizeL1DepositParamsStruct = {
    chainId: BigNumberish;
    l2BatchNumber: BigNumberish;
    l2MessageIndex: BigNumberish;
    l2Sender: AddressLike;
    l2TxNumberInBatch: BigNumberish;
    message: BytesLike;
    merkleProof: BytesLike[];
};
export type FinalizeL1DepositParamsStructOutput = [
    chainId: bigint,
    l2BatchNumber: bigint,
    l2MessageIndex: bigint,
    l2Sender: string,
    l2TxNumberInBatch: bigint,
    message: string,
    merkleProof: string[]
] & {
    chainId: bigint;
    l2BatchNumber: bigint;
    l2MessageIndex: bigint;
    l2Sender: string;
    l2TxNumberInBatch: bigint;
    message: string;
    merkleProof: string[];
};
export interface IL1NullifierInterface extends Interface {
    getFunction(nameOrSignature: "BRIDGE_HUB" | "__DEPRECATED_admin" | "__DEPRECATED_chainBalance" | "__DEPRECATED_l2BridgeAddress" | "__DEPRECATED_pendingAdmin" | "acceptOwnership" | "bridgeRecoverFailedTransfer" | "bridgehubConfirmL2TransactionForwarded" | "chainBalance" | "claimFailedDeposit" | "claimFailedDepositLegacyErc20Bridge" | "depositHappened" | "encodeTxDataHash" | "finalizeDeposit" | "finalizeWithdrawal" | "initialize" | "isWithdrawalFinalized" | "l1AssetRouter" | "l1NativeTokenVault" | "l2BridgeAddress" | "legacyBridge" | "nullifyChainBalanceByNTV" | "owner" | "pause" | "paused" | "pendingOwner" | "renounceOwnership" | "setL1AssetRouter" | "setL1Erc20Bridge" | "setL1NativeTokenVault" | "transferOwnership" | "transferTokenToNTV" | "unpause"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BridgehubDepositFinalized" | "Initialized" | "OwnershipTransferStarted" | "OwnershipTransferred" | "Paused" | "Unpaused"): EventFragment;
    encodeFunctionData(functionFragment: "BRIDGE_HUB", values?: undefined): string;
    encodeFunctionData(functionFragment: "__DEPRECATED_admin", values?: undefined): string;
    encodeFunctionData(functionFragment: "__DEPRECATED_chainBalance", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "__DEPRECATED_l2BridgeAddress", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "__DEPRECATED_pendingAdmin", values?: undefined): string;
    encodeFunctionData(functionFragment: "acceptOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "bridgeRecoverFailedTransfer", values: [
        BigNumberish,
        AddressLike,
        BytesLike,
        BytesLike,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "bridgehubConfirmL2TransactionForwarded", values: [BigNumberish, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "chainBalance", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "claimFailedDeposit", values: [
        BigNumberish,
        AddressLike,
        AddressLike,
        BigNumberish,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "claimFailedDepositLegacyErc20Bridge", values: [
        AddressLike,
        AddressLike,
        BigNumberish,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "depositHappened", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "encodeTxDataHash", values: [BytesLike, AddressLike, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "finalizeDeposit", values: [FinalizeL1DepositParamsStruct]): string;
    encodeFunctionData(functionFragment: "finalizeWithdrawal", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "initialize", values: [
        AddressLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "isWithdrawalFinalized", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "l1AssetRouter", values?: undefined): string;
    encodeFunctionData(functionFragment: "l1NativeTokenVault", values?: undefined): string;
    encodeFunctionData(functionFragment: "l2BridgeAddress", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "legacyBridge", values?: undefined): string;
    encodeFunctionData(functionFragment: "nullifyChainBalanceByNTV", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "pause", values?: undefined): string;
    encodeFunctionData(functionFragment: "paused", values?: undefined): string;
    encodeFunctionData(functionFragment: "pendingOwner", values?: undefined): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "setL1AssetRouter", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setL1Erc20Bridge", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setL1NativeTokenVault", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "transferTokenToNTV", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
    decodeFunctionResult(functionFragment: "BRIDGE_HUB", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "__DEPRECATED_admin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "__DEPRECATED_chainBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "__DEPRECATED_l2BridgeAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "__DEPRECATED_pendingAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "acceptOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgeRecoverFailedTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgehubConfirmL2TransactionForwarded", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "chainBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFailedDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFailedDepositLegacyErc20Bridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositHappened", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "encodeTxDataHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "finalizeDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "finalizeWithdrawal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isWithdrawalFinalized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l1AssetRouter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l1NativeTokenVault", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l2BridgeAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "legacyBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nullifyChainBalanceByNTV", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pendingOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setL1AssetRouter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setL1Erc20Bridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setL1NativeTokenVault", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferTokenToNTV", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
}
export declare namespace BridgehubDepositFinalizedEvent {
    type InputTuple = [
        chainId: BigNumberish,
        txDataHash: BytesLike,
        l2DepositTxHash: BytesLike
    ];
    type OutputTuple = [
        chainId: bigint,
        txDataHash: string,
        l2DepositTxHash: string
    ];
    interface OutputObject {
        chainId: bigint;
        txDataHash: string;
        l2DepositTxHash: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace InitializedEvent {
    type InputTuple = [version: BigNumberish];
    type OutputTuple = [version: bigint];
    interface OutputObject {
        version: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace OwnershipTransferStartedEvent {
    type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
    type OutputTuple = [previousOwner: string, newOwner: string];
    interface OutputObject {
        previousOwner: string;
        newOwner: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace OwnershipTransferredEvent {
    type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
    type OutputTuple = [previousOwner: string, newOwner: string];
    interface OutputObject {
        previousOwner: string;
        newOwner: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace PausedEvent {
    type InputTuple = [account: AddressLike];
    type OutputTuple = [account: string];
    interface OutputObject {
        account: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace UnpausedEvent {
    type InputTuple = [account: AddressLike];
    type OutputTuple = [account: string];
    interface OutputObject {
        account: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IL1Nullifier extends BaseContract {
    connect(runner?: ContractRunner | null): IL1Nullifier;
    waitForDeployment(): Promise<this>;
    interface: IL1NullifierInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    BRIDGE_HUB: TypedContractMethod<[], [string], "view">;
    __DEPRECATED_admin: TypedContractMethod<[], [string], "view">;
    __DEPRECATED_chainBalance: TypedContractMethod<[
        chainId: BigNumberish,
        l1Token: AddressLike
    ], [
        bigint
    ], "view">;
    __DEPRECATED_l2BridgeAddress: TypedContractMethod<[
        chainId: BigNumberish
    ], [
        string
    ], "view">;
    __DEPRECATED_pendingAdmin: TypedContractMethod<[], [string], "view">;
    acceptOwnership: TypedContractMethod<[], [void], "nonpayable">;
    bridgeRecoverFailedTransfer: TypedContractMethod<[
        _chainId: BigNumberish,
        _depositSender: AddressLike,
        _assetId: BytesLike,
        _assetData: BytesLike,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    bridgehubConfirmL2TransactionForwarded: TypedContractMethod<[
        _chainId: BigNumberish,
        _txDataHash: BytesLike,
        _txHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    chainBalance: TypedContractMethod<[
        _chainId: BigNumberish,
        _token: AddressLike
    ], [
        bigint
    ], "view">;
    claimFailedDeposit: TypedContractMethod<[
        _chainId: BigNumberish,
        _depositSender: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    claimFailedDepositLegacyErc20Bridge: TypedContractMethod<[
        _depositSender: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    depositHappened: TypedContractMethod<[
        chainId: BigNumberish,
        l2DepositTxHash: BytesLike
    ], [
        string
    ], "view">;
    encodeTxDataHash: TypedContractMethod<[
        _encodingVersion: BytesLike,
        _originalCaller: AddressLike,
        _assetId: BytesLike,
        _transferData: BytesLike
    ], [
        string
    ], "view">;
    finalizeDeposit: TypedContractMethod<[
        _finalizeWithdrawalParams: FinalizeL1DepositParamsStruct
    ], [
        void
    ], "nonpayable">;
    finalizeWithdrawal: TypedContractMethod<[
        _chainId: BigNumberish,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _message: BytesLike,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    initialize: TypedContractMethod<[
        _owner: AddressLike,
        _eraPostDiamondUpgradeFirstBatch: BigNumberish,
        _eraPostLegacyBridgeUpgradeFirstBatch: BigNumberish,
        _eraLegacyBridgeLastDepositBatch: BigNumberish,
        _eraLegacyBridgeLastDepositTxNumber: BigNumberish
    ], [
        void
    ], "nonpayable">;
    isWithdrawalFinalized: TypedContractMethod<[
        chainId: BigNumberish,
        l2BatchNumber: BigNumberish,
        l2ToL1MessageNumber: BigNumberish
    ], [
        boolean
    ], "view">;
    l1AssetRouter: TypedContractMethod<[], [string], "view">;
    l1NativeTokenVault: TypedContractMethod<[], [string], "view">;
    l2BridgeAddress: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        string
    ], "view">;
    legacyBridge: TypedContractMethod<[], [string], "view">;
    nullifyChainBalanceByNTV: TypedContractMethod<[
        _chainId: BigNumberish,
        _token: AddressLike
    ], [
        void
    ], "nonpayable">;
    owner: TypedContractMethod<[], [string], "view">;
    pause: TypedContractMethod<[], [void], "nonpayable">;
    paused: TypedContractMethod<[], [boolean], "view">;
    pendingOwner: TypedContractMethod<[], [string], "view">;
    renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;
    setL1AssetRouter: TypedContractMethod<[
        _l1AssetRouter: AddressLike
    ], [
        void
    ], "nonpayable">;
    setL1Erc20Bridge: TypedContractMethod<[
        _legacyBridge: AddressLike
    ], [
        void
    ], "nonpayable">;
    setL1NativeTokenVault: TypedContractMethod<[
        _l1NativeTokenVault: AddressLike
    ], [
        void
    ], "nonpayable">;
    transferOwnership: TypedContractMethod<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    transferTokenToNTV: TypedContractMethod<[
        _token: AddressLike
    ], [
        void
    ], "nonpayable">;
    unpause: TypedContractMethod<[], [void], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "BRIDGE_HUB"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "__DEPRECATED_admin"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "__DEPRECATED_chainBalance"): TypedContractMethod<[
        chainId: BigNumberish,
        l1Token: AddressLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "__DEPRECATED_l2BridgeAddress"): TypedContractMethod<[chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "__DEPRECATED_pendingAdmin"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "acceptOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "bridgeRecoverFailedTransfer"): TypedContractMethod<[
        _chainId: BigNumberish,
        _depositSender: AddressLike,
        _assetId: BytesLike,
        _assetData: BytesLike,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "bridgehubConfirmL2TransactionForwarded"): TypedContractMethod<[
        _chainId: BigNumberish,
        _txDataHash: BytesLike,
        _txHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "chainBalance"): TypedContractMethod<[
        _chainId: BigNumberish,
        _token: AddressLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "claimFailedDeposit"): TypedContractMethod<[
        _chainId: BigNumberish,
        _depositSender: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "claimFailedDepositLegacyErc20Bridge"): TypedContractMethod<[
        _depositSender: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish,
        _l2TxHash: BytesLike,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "depositHappened"): TypedContractMethod<[
        chainId: BigNumberish,
        l2DepositTxHash: BytesLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "encodeTxDataHash"): TypedContractMethod<[
        _encodingVersion: BytesLike,
        _originalCaller: AddressLike,
        _assetId: BytesLike,
        _transferData: BytesLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "finalizeDeposit"): TypedContractMethod<[
        _finalizeWithdrawalParams: FinalizeL1DepositParamsStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "finalizeWithdrawal"): TypedContractMethod<[
        _chainId: BigNumberish,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _message: BytesLike,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "initialize"): TypedContractMethod<[
        _owner: AddressLike,
        _eraPostDiamondUpgradeFirstBatch: BigNumberish,
        _eraPostLegacyBridgeUpgradeFirstBatch: BigNumberish,
        _eraLegacyBridgeLastDepositBatch: BigNumberish,
        _eraLegacyBridgeLastDepositTxNumber: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "isWithdrawalFinalized"): TypedContractMethod<[
        chainId: BigNumberish,
        l2BatchNumber: BigNumberish,
        l2ToL1MessageNumber: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "l1AssetRouter"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "l1NativeTokenVault"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "l2BridgeAddress"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "legacyBridge"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "nullifyChainBalanceByNTV"): TypedContractMethod<[
        _chainId: BigNumberish,
        _token: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "pause"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "paused"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "pendingOwner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "setL1AssetRouter"): TypedContractMethod<[_l1AssetRouter: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "setL1Erc20Bridge"): TypedContractMethod<[_legacyBridge: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "setL1NativeTokenVault"): TypedContractMethod<[
        _l1NativeTokenVault: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "transferTokenToNTV"): TypedContractMethod<[_token: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "unpause"): TypedContractMethod<[], [void], "nonpayable">;
    getEvent(key: "BridgehubDepositFinalized"): TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
    getEvent(key: "Initialized"): TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
    getEvent(key: "OwnershipTransferStarted"): TypedContractEvent<OwnershipTransferStartedEvent.InputTuple, OwnershipTransferStartedEvent.OutputTuple, OwnershipTransferStartedEvent.OutputObject>;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    getEvent(key: "Paused"): TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
    getEvent(key: "Unpaused"): TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
    filters: {
        "BridgehubDepositFinalized(uint256,bytes32,bytes32)": TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
        BridgehubDepositFinalized: TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
        "Initialized(uint8)": TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
        Initialized: TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
        "OwnershipTransferStarted(address,address)": TypedContractEvent<OwnershipTransferStartedEvent.InputTuple, OwnershipTransferStartedEvent.OutputTuple, OwnershipTransferStartedEvent.OutputObject>;
        OwnershipTransferStarted: TypedContractEvent<OwnershipTransferStartedEvent.InputTuple, OwnershipTransferStartedEvent.OutputTuple, OwnershipTransferStartedEvent.OutputObject>;
        "OwnershipTransferred(address,address)": TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        OwnershipTransferred: TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        "Paused(address)": TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
        Paused: TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
        "Unpaused(address)": TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
        Unpaused: TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
    };
}
