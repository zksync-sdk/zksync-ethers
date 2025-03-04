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
    getFunction(nameOrSignature: "BRIDGE_HUB" | "bridgeRecoverFailedTransfer" | "bridgehubConfirmL2TransactionForwarded" | "chainBalance" | "claimFailedDeposit" | "claimFailedDepositLegacyErc20Bridge" | "depositHappened" | "finalizeDeposit" | "isWithdrawalFinalized" | "l1NativeTokenVault" | "l2BridgeAddress" | "legacyBridge" | "nullifyChainBalanceByNTV" | "setL1AssetRouter" | "setL1NativeTokenVault" | "transferTokenToNTV"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BridgehubDepositFinalized"): EventFragment;
    encodeFunctionData(functionFragment: "BRIDGE_HUB", values?: undefined): string;
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
    encodeFunctionData(functionFragment: "finalizeDeposit", values: [FinalizeL1DepositParamsStruct]): string;
    encodeFunctionData(functionFragment: "isWithdrawalFinalized", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "l1NativeTokenVault", values?: undefined): string;
    encodeFunctionData(functionFragment: "l2BridgeAddress", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "legacyBridge", values?: undefined): string;
    encodeFunctionData(functionFragment: "nullifyChainBalanceByNTV", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "setL1AssetRouter", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setL1NativeTokenVault", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "transferTokenToNTV", values: [AddressLike]): string;
    decodeFunctionResult(functionFragment: "BRIDGE_HUB", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgeRecoverFailedTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgehubConfirmL2TransactionForwarded", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "chainBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFailedDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFailedDepositLegacyErc20Bridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositHappened", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "finalizeDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isWithdrawalFinalized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l1NativeTokenVault", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l2BridgeAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "legacyBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nullifyChainBalanceByNTV", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setL1AssetRouter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setL1NativeTokenVault", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferTokenToNTV", data: BytesLike): Result;
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
        _chainId: BigNumberish,
        _l2TxHash: BytesLike
    ], [
        string
    ], "view">;
    finalizeDeposit: TypedContractMethod<[
        _finalizeWithdrawalParams: FinalizeL1DepositParamsStruct
    ], [
        void
    ], "nonpayable">;
    isWithdrawalFinalized: TypedContractMethod<[
        _chainId: BigNumberish,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish
    ], [
        boolean
    ], "view">;
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
    setL1AssetRouter: TypedContractMethod<[
        _l1AssetRouter: AddressLike
    ], [
        void
    ], "nonpayable">;
    setL1NativeTokenVault: TypedContractMethod<[
        _nativeTokenVault: AddressLike
    ], [
        void
    ], "nonpayable">;
    transferTokenToNTV: TypedContractMethod<[
        _token: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "BRIDGE_HUB"): TypedContractMethod<[], [string], "view">;
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
        _chainId: BigNumberish,
        _l2TxHash: BytesLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "finalizeDeposit"): TypedContractMethod<[
        _finalizeWithdrawalParams: FinalizeL1DepositParamsStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "isWithdrawalFinalized"): TypedContractMethod<[
        _chainId: BigNumberish,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "l1NativeTokenVault"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "l2BridgeAddress"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "legacyBridge"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "nullifyChainBalanceByNTV"): TypedContractMethod<[
        _chainId: BigNumberish,
        _token: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setL1AssetRouter"): TypedContractMethod<[_l1AssetRouter: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "setL1NativeTokenVault"): TypedContractMethod<[
        _nativeTokenVault: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "transferTokenToNTV"): TypedContractMethod<[_token: AddressLike], [void], "nonpayable">;
    getEvent(key: "BridgehubDepositFinalized"): TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
    filters: {
        "BridgehubDepositFinalized(uint256,bytes32,bytes32)": TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
        BridgehubDepositFinalized: TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
    };
}
