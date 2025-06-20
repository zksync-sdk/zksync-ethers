import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export type L2TransactionRequestTwoBridgesInnerStruct = {
    magicValue: BytesLike;
    l2Contract: AddressLike;
    l2Calldata: BytesLike;
    factoryDeps: BytesLike[];
    txDataHash: BytesLike;
};
export type L2TransactionRequestTwoBridgesInnerStructOutput = [
    magicValue: string,
    l2Contract: string,
    l2Calldata: string,
    factoryDeps: string[],
    txDataHash: string
] & {
    magicValue: string;
    l2Contract: string;
    l2Calldata: string;
    factoryDeps: string[];
    txDataHash: string;
};
export interface IL1SharedBridgeInterface extends Interface {
    getFunction(nameOrSignature: "BRIDGE_HUB" | "L1_WETH_TOKEN" | "bridgehubConfirmL2Transaction" | "bridgehubDeposit" | "bridgehubDepositBaseToken" | "claimFailedDeposit" | "claimFailedDepositLegacyErc20Bridge" | "depositHappened" | "depositLegacyErc20Bridge" | "finalizeWithdrawal" | "finalizeWithdrawalLegacyErc20Bridge" | "isWithdrawalFinalized" | "l2BridgeAddress" | "legacyBridge" | "receiveEth" | "setEraLegacyBridgeLastDepositTime" | "setEraPostDiamondUpgradeFirstBatch" | "setEraPostLegacyBridgeUpgradeFirstBatch"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BridgehubDepositBaseTokenInitiated" | "BridgehubDepositFinalized" | "BridgehubDepositInitiated" | "ClaimedFailedDepositSharedBridge" | "LegacyDepositInitiated" | "WithdrawalFinalizedSharedBridge"): EventFragment;
    encodeFunctionData(functionFragment: "BRIDGE_HUB", values?: undefined): string;
    encodeFunctionData(functionFragment: "L1_WETH_TOKEN", values?: undefined): string;
    encodeFunctionData(functionFragment: "bridgehubConfirmL2Transaction", values: [BigNumberish, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "bridgehubDeposit", values: [BigNumberish, AddressLike, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "bridgehubDepositBaseToken", values: [BigNumberish, AddressLike, AddressLike, BigNumberish]): string;
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
    encodeFunctionData(functionFragment: "depositLegacyErc20Bridge", values: [
        AddressLike,
        AddressLike,
        AddressLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        AddressLike
    ]): string;
    encodeFunctionData(functionFragment: "finalizeWithdrawal", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike,
        BytesLike[]
    ]): string;
    encodeFunctionData(functionFragment: "finalizeWithdrawalLegacyErc20Bridge", values: [BigNumberish, BigNumberish, BigNumberish, BytesLike, BytesLike[]]): string;
    encodeFunctionData(functionFragment: "isWithdrawalFinalized", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "l2BridgeAddress", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "legacyBridge", values?: undefined): string;
    encodeFunctionData(functionFragment: "receiveEth", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "setEraLegacyBridgeLastDepositTime", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setEraPostDiamondUpgradeFirstBatch", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "setEraPostLegacyBridgeUpgradeFirstBatch", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "BRIDGE_HUB", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "L1_WETH_TOKEN", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgehubConfirmL2Transaction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgehubDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgehubDepositBaseToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFailedDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimFailedDepositLegacyErc20Bridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositHappened", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositLegacyErc20Bridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "finalizeWithdrawal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "finalizeWithdrawalLegacyErc20Bridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isWithdrawalFinalized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l2BridgeAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "legacyBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "receiveEth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setEraLegacyBridgeLastDepositTime", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setEraPostDiamondUpgradeFirstBatch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setEraPostLegacyBridgeUpgradeFirstBatch", data: BytesLike): Result;
}
export declare namespace BridgehubDepositBaseTokenInitiatedEvent {
    type InputTuple = [
        chainId: BigNumberish,
        from: AddressLike,
        l1Token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        from: string,
        l1Token: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        from: string;
        l1Token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
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
export declare namespace BridgehubDepositInitiatedEvent {
    type InputTuple = [
        chainId: BigNumberish,
        txDataHash: BytesLike,
        from: AddressLike,
        to: AddressLike,
        l1Token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        txDataHash: string,
        from: string,
        to: string,
        l1Token: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        txDataHash: string;
        from: string;
        to: string;
        l1Token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ClaimedFailedDepositSharedBridgeEvent {
    type InputTuple = [
        chainId: BigNumberish,
        to: AddressLike,
        l1Token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        to: string,
        l1Token: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        to: string;
        l1Token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace LegacyDepositInitiatedEvent {
    type InputTuple = [
        chainId: BigNumberish,
        l2DepositTxHash: BytesLike,
        from: AddressLike,
        to: AddressLike,
        l1Token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        l2DepositTxHash: string,
        from: string,
        to: string,
        l1Token: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        l2DepositTxHash: string;
        from: string;
        to: string;
        l1Token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace WithdrawalFinalizedSharedBridgeEvent {
    type InputTuple = [
        chainId: BigNumberish,
        to: AddressLike,
        l1Token: AddressLike,
        amount: BigNumberish
    ];
    type OutputTuple = [
        chainId: bigint,
        to: string,
        l1Token: string,
        amount: bigint
    ];
    interface OutputObject {
        chainId: bigint;
        to: string;
        l1Token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IL1SharedBridge extends BaseContract {
    connect(runner?: ContractRunner | null): IL1SharedBridge;
    waitForDeployment(): Promise<this>;
    interface: IL1SharedBridgeInterface;
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
    L1_WETH_TOKEN: TypedContractMethod<[], [string], "view">;
    bridgehubConfirmL2Transaction: TypedContractMethod<[
        _chainId: BigNumberish,
        _txDataHash: BytesLike,
        _txHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    bridgehubDeposit: TypedContractMethod<[
        _chainId: BigNumberish,
        _prevMsgSender: AddressLike,
        _l2Value: BigNumberish,
        _data: BytesLike
    ], [
        L2TransactionRequestTwoBridgesInnerStructOutput
    ], "payable">;
    bridgehubDepositBaseToken: TypedContractMethod<[
        _chainId: BigNumberish,
        _prevMsgSender: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish
    ], [
        void
    ], "payable">;
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
    depositLegacyErc20Bridge: TypedContractMethod<[
        _msgSender: AddressLike,
        _l2Receiver: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish,
        _l2TxGasLimit: BigNumberish,
        _l2TxGasPerPubdataByte: BigNumberish,
        _refundRecipient: AddressLike
    ], [
        string
    ], "payable">;
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
    finalizeWithdrawalLegacyErc20Bridge: TypedContractMethod<[
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _message: BytesLike,
        _merkleProof: BytesLike[]
    ], [
        [
            string,
            string,
            bigint
        ] & {
            l1Receiver: string;
            l1Token: string;
            amount: bigint;
        }
    ], "nonpayable">;
    isWithdrawalFinalized: TypedContractMethod<[
        _chainId: BigNumberish,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish
    ], [
        boolean
    ], "view">;
    l2BridgeAddress: TypedContractMethod<[
        _chainId: BigNumberish
    ], [
        string
    ], "view">;
    legacyBridge: TypedContractMethod<[], [string], "view">;
    receiveEth: TypedContractMethod<[_chainId: BigNumberish], [void], "payable">;
    setEraLegacyBridgeLastDepositTime: TypedContractMethod<[
        _eraLegacyBridgeLastDepositBatch: BigNumberish,
        _eraLegacyBridgeLastDepositTxNumber: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setEraPostDiamondUpgradeFirstBatch: TypedContractMethod<[
        _eraPostDiamondUpgradeFirstBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setEraPostLegacyBridgeUpgradeFirstBatch: TypedContractMethod<[
        _eraPostLegacyBridgeUpgradeFirstBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "BRIDGE_HUB"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "L1_WETH_TOKEN"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "bridgehubConfirmL2Transaction"): TypedContractMethod<[
        _chainId: BigNumberish,
        _txDataHash: BytesLike,
        _txHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "bridgehubDeposit"): TypedContractMethod<[
        _chainId: BigNumberish,
        _prevMsgSender: AddressLike,
        _l2Value: BigNumberish,
        _data: BytesLike
    ], [
        L2TransactionRequestTwoBridgesInnerStructOutput
    ], "payable">;
    getFunction(nameOrSignature: "bridgehubDepositBaseToken"): TypedContractMethod<[
        _chainId: BigNumberish,
        _prevMsgSender: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish
    ], [
        void
    ], "payable">;
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
    getFunction(nameOrSignature: "depositLegacyErc20Bridge"): TypedContractMethod<[
        _msgSender: AddressLike,
        _l2Receiver: AddressLike,
        _l1Token: AddressLike,
        _amount: BigNumberish,
        _l2TxGasLimit: BigNumberish,
        _l2TxGasPerPubdataByte: BigNumberish,
        _refundRecipient: AddressLike
    ], [
        string
    ], "payable">;
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
    getFunction(nameOrSignature: "finalizeWithdrawalLegacyErc20Bridge"): TypedContractMethod<[
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _message: BytesLike,
        _merkleProof: BytesLike[]
    ], [
        [
            string,
            string,
            bigint
        ] & {
            l1Receiver: string;
            l1Token: string;
            amount: bigint;
        }
    ], "nonpayable">;
    getFunction(nameOrSignature: "isWithdrawalFinalized"): TypedContractMethod<[
        _chainId: BigNumberish,
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "l2BridgeAddress"): TypedContractMethod<[_chainId: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "legacyBridge"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "receiveEth"): TypedContractMethod<[_chainId: BigNumberish], [void], "payable">;
    getFunction(nameOrSignature: "setEraLegacyBridgeLastDepositTime"): TypedContractMethod<[
        _eraLegacyBridgeLastDepositBatch: BigNumberish,
        _eraLegacyBridgeLastDepositTxNumber: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setEraPostDiamondUpgradeFirstBatch"): TypedContractMethod<[
        _eraPostDiamondUpgradeFirstBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setEraPostLegacyBridgeUpgradeFirstBatch"): TypedContractMethod<[
        _eraPostLegacyBridgeUpgradeFirstBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "BridgehubDepositBaseTokenInitiated"): TypedContractEvent<BridgehubDepositBaseTokenInitiatedEvent.InputTuple, BridgehubDepositBaseTokenInitiatedEvent.OutputTuple, BridgehubDepositBaseTokenInitiatedEvent.OutputObject>;
    getEvent(key: "BridgehubDepositFinalized"): TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
    getEvent(key: "BridgehubDepositInitiated"): TypedContractEvent<BridgehubDepositInitiatedEvent.InputTuple, BridgehubDepositInitiatedEvent.OutputTuple, BridgehubDepositInitiatedEvent.OutputObject>;
    getEvent(key: "ClaimedFailedDepositSharedBridge"): TypedContractEvent<ClaimedFailedDepositSharedBridgeEvent.InputTuple, ClaimedFailedDepositSharedBridgeEvent.OutputTuple, ClaimedFailedDepositSharedBridgeEvent.OutputObject>;
    getEvent(key: "LegacyDepositInitiated"): TypedContractEvent<LegacyDepositInitiatedEvent.InputTuple, LegacyDepositInitiatedEvent.OutputTuple, LegacyDepositInitiatedEvent.OutputObject>;
    getEvent(key: "WithdrawalFinalizedSharedBridge"): TypedContractEvent<WithdrawalFinalizedSharedBridgeEvent.InputTuple, WithdrawalFinalizedSharedBridgeEvent.OutputTuple, WithdrawalFinalizedSharedBridgeEvent.OutputObject>;
    filters: {
        "BridgehubDepositBaseTokenInitiated(uint256,address,address,uint256)": TypedContractEvent<BridgehubDepositBaseTokenInitiatedEvent.InputTuple, BridgehubDepositBaseTokenInitiatedEvent.OutputTuple, BridgehubDepositBaseTokenInitiatedEvent.OutputObject>;
        BridgehubDepositBaseTokenInitiated: TypedContractEvent<BridgehubDepositBaseTokenInitiatedEvent.InputTuple, BridgehubDepositBaseTokenInitiatedEvent.OutputTuple, BridgehubDepositBaseTokenInitiatedEvent.OutputObject>;
        "BridgehubDepositFinalized(uint256,bytes32,bytes32)": TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
        BridgehubDepositFinalized: TypedContractEvent<BridgehubDepositFinalizedEvent.InputTuple, BridgehubDepositFinalizedEvent.OutputTuple, BridgehubDepositFinalizedEvent.OutputObject>;
        "BridgehubDepositInitiated(uint256,bytes32,address,address,address,uint256)": TypedContractEvent<BridgehubDepositInitiatedEvent.InputTuple, BridgehubDepositInitiatedEvent.OutputTuple, BridgehubDepositInitiatedEvent.OutputObject>;
        BridgehubDepositInitiated: TypedContractEvent<BridgehubDepositInitiatedEvent.InputTuple, BridgehubDepositInitiatedEvent.OutputTuple, BridgehubDepositInitiatedEvent.OutputObject>;
        "ClaimedFailedDepositSharedBridge(uint256,address,address,uint256)": TypedContractEvent<ClaimedFailedDepositSharedBridgeEvent.InputTuple, ClaimedFailedDepositSharedBridgeEvent.OutputTuple, ClaimedFailedDepositSharedBridgeEvent.OutputObject>;
        ClaimedFailedDepositSharedBridge: TypedContractEvent<ClaimedFailedDepositSharedBridgeEvent.InputTuple, ClaimedFailedDepositSharedBridgeEvent.OutputTuple, ClaimedFailedDepositSharedBridgeEvent.OutputObject>;
        "LegacyDepositInitiated(uint256,bytes32,address,address,address,uint256)": TypedContractEvent<LegacyDepositInitiatedEvent.InputTuple, LegacyDepositInitiatedEvent.OutputTuple, LegacyDepositInitiatedEvent.OutputObject>;
        LegacyDepositInitiated: TypedContractEvent<LegacyDepositInitiatedEvent.InputTuple, LegacyDepositInitiatedEvent.OutputTuple, LegacyDepositInitiatedEvent.OutputObject>;
        "WithdrawalFinalizedSharedBridge(uint256,address,address,uint256)": TypedContractEvent<WithdrawalFinalizedSharedBridgeEvent.InputTuple, WithdrawalFinalizedSharedBridgeEvent.OutputTuple, WithdrawalFinalizedSharedBridgeEvent.OutputObject>;
        WithdrawalFinalizedSharedBridge: TypedContractEvent<WithdrawalFinalizedSharedBridgeEvent.InputTuple, WithdrawalFinalizedSharedBridgeEvent.OutputTuple, WithdrawalFinalizedSharedBridgeEvent.OutputObject>;
    };
}
