import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "./common";
export type FeeParamsStruct = {
    pubdataPricingMode: BigNumberish;
    batchOverheadL1Gas: BigNumberish;
    maxPubdataPerBatch: BigNumberish;
    maxL2GasPerBatch: BigNumberish;
    priorityTxMaxPubdata: BigNumberish;
    minimalL2GasPrice: BigNumberish;
};
export type FeeParamsStructOutput = [
    pubdataPricingMode: bigint,
    batchOverheadL1Gas: bigint,
    maxPubdataPerBatch: bigint,
    maxL2GasPerBatch: bigint,
    priorityTxMaxPubdata: bigint,
    minimalL2GasPrice: bigint
] & {
    pubdataPricingMode: bigint;
    batchOverheadL1Gas: bigint;
    maxPubdataPerBatch: bigint;
    maxL2GasPerBatch: bigint;
    priorityTxMaxPubdata: bigint;
    minimalL2GasPrice: bigint;
};
export type L2CanonicalTransactionStruct = {
    txType: BigNumberish;
    from: BigNumberish;
    to: BigNumberish;
    gasLimit: BigNumberish;
    gasPerPubdataByteLimit: BigNumberish;
    maxFeePerGas: BigNumberish;
    maxPriorityFeePerGas: BigNumberish;
    paymaster: BigNumberish;
    nonce: BigNumberish;
    value: BigNumberish;
    reserved: [BigNumberish, BigNumberish, BigNumberish, BigNumberish];
    data: BytesLike;
    signature: BytesLike;
    factoryDeps: BigNumberish[];
    paymasterInput: BytesLike;
    reservedDynamic: BytesLike;
};
export type L2CanonicalTransactionStructOutput = [
    txType: bigint,
    from: bigint,
    to: bigint,
    gasLimit: bigint,
    gasPerPubdataByteLimit: bigint,
    maxFeePerGas: bigint,
    maxPriorityFeePerGas: bigint,
    paymaster: bigint,
    nonce: bigint,
    value: bigint,
    reserved: [bigint, bigint, bigint, bigint],
    data: string,
    signature: string,
    factoryDeps: bigint[],
    paymasterInput: string,
    reservedDynamic: string
] & {
    txType: bigint;
    from: bigint;
    to: bigint;
    gasLimit: bigint;
    gasPerPubdataByteLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    paymaster: bigint;
    nonce: bigint;
    value: bigint;
    reserved: [bigint, bigint, bigint, bigint];
    data: string;
    signature: string;
    factoryDeps: bigint[];
    paymasterInput: string;
    reservedDynamic: string;
};
export type BridgehubL2TransactionRequestStruct = {
    sender: AddressLike;
    contractL2: AddressLike;
    mintValue: BigNumberish;
    l2Value: BigNumberish;
    l2Calldata: BytesLike;
    l2GasLimit: BigNumberish;
    l2GasPerPubdataByteLimit: BigNumberish;
    factoryDeps: BytesLike[];
    refundRecipient: AddressLike;
};
export type BridgehubL2TransactionRequestStructOutput = [
    sender: string,
    contractL2: string,
    mintValue: bigint,
    l2Value: bigint,
    l2Calldata: string,
    l2GasLimit: bigint,
    l2GasPerPubdataByteLimit: bigint,
    factoryDeps: string[],
    refundRecipient: string
] & {
    sender: string;
    contractL2: string;
    mintValue: bigint;
    l2Value: bigint;
    l2Calldata: string;
    l2GasLimit: bigint;
    l2GasPerPubdataByteLimit: bigint;
    factoryDeps: string[];
    refundRecipient: string;
};
export type VerifierParamsStruct = {
    recursionNodeLevelVkHash: BytesLike;
    recursionLeafLevelVkHash: BytesLike;
    recursionCircuitsSetVksHash: BytesLike;
};
export type VerifierParamsStructOutput = [
    recursionNodeLevelVkHash: string,
    recursionLeafLevelVkHash: string,
    recursionCircuitsSetVksHash: string
] & {
    recursionNodeLevelVkHash: string;
    recursionLeafLevelVkHash: string;
    recursionCircuitsSetVksHash: string;
};
export type PriorityOperationStruct = {
    canonicalTxHash: BytesLike;
    expirationTimestamp: BigNumberish;
    layer2Tip: BigNumberish;
};
export type PriorityOperationStructOutput = [
    canonicalTxHash: string,
    expirationTimestamp: bigint,
    layer2Tip: bigint
] & {
    canonicalTxHash: string;
    expirationTimestamp: bigint;
    layer2Tip: bigint;
};
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
export declare namespace Diamond {
    type FacetCutStruct = {
        facet: AddressLike;
        action: BigNumberish;
        isFreezable: boolean;
        selectors: BytesLike[];
    };
    type FacetCutStructOutput = [
        facet: string,
        action: bigint,
        isFreezable: boolean,
        selectors: string[]
    ] & {
        facet: string;
        action: bigint;
        isFreezable: boolean;
        selectors: string[];
    };
    type DiamondCutDataStruct = {
        facetCuts: Diamond.FacetCutStruct[];
        initAddress: AddressLike;
        initCalldata: BytesLike;
    };
    type DiamondCutDataStructOutput = [
        facetCuts: Diamond.FacetCutStructOutput[],
        initAddress: string,
        initCalldata: string
    ] & {
        facetCuts: Diamond.FacetCutStructOutput[];
        initAddress: string;
        initCalldata: string;
    };
}
export declare namespace IExecutor {
    type StoredBatchInfoStruct = {
        batchNumber: BigNumberish;
        batchHash: BytesLike;
        indexRepeatedStorageChanges: BigNumberish;
        numberOfLayer1Txs: BigNumberish;
        priorityOperationsHash: BytesLike;
        l2LogsTreeRoot: BytesLike;
        timestamp: BigNumberish;
        commitment: BytesLike;
    };
    type StoredBatchInfoStructOutput = [
        batchNumber: bigint,
        batchHash: string,
        indexRepeatedStorageChanges: bigint,
        numberOfLayer1Txs: bigint,
        priorityOperationsHash: string,
        l2LogsTreeRoot: string,
        timestamp: bigint,
        commitment: string
    ] & {
        batchNumber: bigint;
        batchHash: string;
        indexRepeatedStorageChanges: bigint;
        numberOfLayer1Txs: bigint;
        priorityOperationsHash: string;
        l2LogsTreeRoot: string;
        timestamp: bigint;
        commitment: string;
    };
    type CommitBatchInfoStruct = {
        batchNumber: BigNumberish;
        timestamp: BigNumberish;
        indexRepeatedStorageChanges: BigNumberish;
        newStateRoot: BytesLike;
        numberOfLayer1Txs: BigNumberish;
        priorityOperationsHash: BytesLike;
        bootloaderHeapInitialContentsHash: BytesLike;
        eventsQueueStateHash: BytesLike;
        systemLogs: BytesLike;
        pubdataCommitments: BytesLike;
    };
    type CommitBatchInfoStructOutput = [
        batchNumber: bigint,
        timestamp: bigint,
        indexRepeatedStorageChanges: bigint,
        newStateRoot: string,
        numberOfLayer1Txs: bigint,
        priorityOperationsHash: string,
        bootloaderHeapInitialContentsHash: string,
        eventsQueueStateHash: string,
        systemLogs: string,
        pubdataCommitments: string
    ] & {
        batchNumber: bigint;
        timestamp: bigint;
        indexRepeatedStorageChanges: bigint;
        newStateRoot: string;
        numberOfLayer1Txs: bigint;
        priorityOperationsHash: string;
        bootloaderHeapInitialContentsHash: string;
        eventsQueueStateHash: string;
        systemLogs: string;
        pubdataCommitments: string;
    };
    type ProofInputStruct = {
        recursiveAggregationInput: BigNumberish[];
        serializedProof: BigNumberish[];
    };
    type ProofInputStructOutput = [
        recursiveAggregationInput: bigint[],
        serializedProof: bigint[]
    ] & {
        recursiveAggregationInput: bigint[];
        serializedProof: bigint[];
    };
}
export declare namespace IGetters {
    type FacetStruct = {
        addr: AddressLike;
        selectors: BytesLike[];
    };
    type FacetStructOutput = [addr: string, selectors: string[]] & {
        addr: string;
        selectors: string[];
    };
}
export interface IZkSyncHyperchainInterface extends Interface {
    getFunction(nameOrSignature: "acceptAdmin" | "baseTokenGasPriceMultiplierDenominator" | "baseTokenGasPriceMultiplierNominator" | "bridgehubRequestL2Transaction" | "changeFeeParams" | "commitBatches" | "commitBatchesSharedBridge" | "executeBatches" | "executeBatchesSharedBridge" | "executeUpgrade" | "facetAddress" | "facetAddresses" | "facetFunctionSelectors" | "facets" | "finalizeEthWithdrawal" | "freezeDiamond" | "getAdmin" | "getBaseToken" | "getBaseTokenBridge" | "getBridgehub" | "getFirstUnprocessedPriorityTx" | "getL2BootloaderBytecodeHash" | "getL2DefaultAccountBytecodeHash" | "getL2SystemContractsUpgradeBatchNumber" | "getL2SystemContractsUpgradeTxHash" | "getName" | "getPendingAdmin" | "getPriorityQueueSize" | "getPriorityTxMaxGasLimit" | "getProtocolVersion" | "getPubdataPricingMode" | "getSemverProtocolVersion" | "getStateTransitionManager" | "getTotalBatchesCommitted" | "getTotalBatchesExecuted" | "getTotalBatchesVerified" | "getTotalPriorityTxs" | "getVerifier" | "getVerifierParams" | "isDiamondStorageFrozen" | "isEthWithdrawalFinalized" | "isFacetFreezable" | "isFunctionFreezable" | "isValidator" | "l2LogsRootHash" | "l2TransactionBaseCost" | "priorityQueueFrontOperation" | "proveBatches" | "proveBatchesSharedBridge" | "proveL1ToL2TransactionStatus" | "proveL2LogInclusion" | "proveL2MessageInclusion" | "requestL2Transaction" | "revertBatches" | "revertBatchesSharedBridge" | "setPendingAdmin" | "setPorterAvailability" | "setPriorityTxMaxGasLimit" | "setPubdataPricingMode" | "setTokenMultiplier" | "setTransactionFilterer" | "setValidator" | "storedBatchHash" | "transferEthToSharedBridge" | "unfreezeDiamond" | "upgradeChainFromVersion"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BlockCommit" | "BlockExecution" | "BlocksRevert" | "BlocksVerification" | "ExecuteUpgrade" | "Freeze" | "IsPorterAvailableStatusUpdate" | "NewAdmin" | "NewBaseTokenMultiplier" | "NewFeeParams" | "NewPendingAdmin" | "NewPriorityRequest" | "NewPriorityTxMaxGasLimit" | "NewTransactionFilterer" | "ProposeTransparentUpgrade" | "Unfreeze" | "ValidatorStatusUpdate" | "ValidiumModeStatusUpdate"): EventFragment;
    encodeFunctionData(functionFragment: "acceptAdmin", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseTokenGasPriceMultiplierDenominator", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseTokenGasPriceMultiplierNominator", values?: undefined): string;
    encodeFunctionData(functionFragment: "bridgehubRequestL2Transaction", values: [BridgehubL2TransactionRequestStruct]): string;
    encodeFunctionData(functionFragment: "changeFeeParams", values: [FeeParamsStruct]): string;
    encodeFunctionData(functionFragment: "commitBatches", values: [IExecutor.StoredBatchInfoStruct, IExecutor.CommitBatchInfoStruct[]]): string;
    encodeFunctionData(functionFragment: "commitBatchesSharedBridge", values: [
        BigNumberish,
        IExecutor.StoredBatchInfoStruct,
        IExecutor.CommitBatchInfoStruct[]
    ]): string;
    encodeFunctionData(functionFragment: "executeBatches", values: [IExecutor.StoredBatchInfoStruct[]]): string;
    encodeFunctionData(functionFragment: "executeBatchesSharedBridge", values: [BigNumberish, IExecutor.StoredBatchInfoStruct[]]): string;
    encodeFunctionData(functionFragment: "executeUpgrade", values: [Diamond.DiamondCutDataStruct]): string;
    encodeFunctionData(functionFragment: "facetAddress", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "facetAddresses", values?: undefined): string;
    encodeFunctionData(functionFragment: "facetFunctionSelectors", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "facets", values?: undefined): string;
    encodeFunctionData(functionFragment: "finalizeEthWithdrawal", values: [BigNumberish, BigNumberish, BigNumberish, BytesLike, BytesLike[]]): string;
    encodeFunctionData(functionFragment: "freezeDiamond", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAdmin", values?: undefined): string;
    encodeFunctionData(functionFragment: "getBaseToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "getBaseTokenBridge", values?: undefined): string;
    encodeFunctionData(functionFragment: "getBridgehub", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFirstUnprocessedPriorityTx", values?: undefined): string;
    encodeFunctionData(functionFragment: "getL2BootloaderBytecodeHash", values?: undefined): string;
    encodeFunctionData(functionFragment: "getL2DefaultAccountBytecodeHash", values?: undefined): string;
    encodeFunctionData(functionFragment: "getL2SystemContractsUpgradeBatchNumber", values?: undefined): string;
    encodeFunctionData(functionFragment: "getL2SystemContractsUpgradeTxHash", values?: undefined): string;
    encodeFunctionData(functionFragment: "getName", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPendingAdmin", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPriorityQueueSize", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPriorityTxMaxGasLimit", values?: undefined): string;
    encodeFunctionData(functionFragment: "getProtocolVersion", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPubdataPricingMode", values?: undefined): string;
    encodeFunctionData(functionFragment: "getSemverProtocolVersion", values?: undefined): string;
    encodeFunctionData(functionFragment: "getStateTransitionManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalBatchesCommitted", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalBatchesExecuted", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalBatchesVerified", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalPriorityTxs", values?: undefined): string;
    encodeFunctionData(functionFragment: "getVerifier", values?: undefined): string;
    encodeFunctionData(functionFragment: "getVerifierParams", values?: undefined): string;
    encodeFunctionData(functionFragment: "isDiamondStorageFrozen", values?: undefined): string;
    encodeFunctionData(functionFragment: "isEthWithdrawalFinalized", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "isFacetFreezable", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "isFunctionFreezable", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "isValidator", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "l2LogsRootHash", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "l2TransactionBaseCost", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "priorityQueueFrontOperation", values?: undefined): string;
    encodeFunctionData(functionFragment: "proveBatches", values: [
        IExecutor.StoredBatchInfoStruct,
        IExecutor.StoredBatchInfoStruct[],
        IExecutor.ProofInputStruct
    ]): string;
    encodeFunctionData(functionFragment: "proveBatchesSharedBridge", values: [
        BigNumberish,
        IExecutor.StoredBatchInfoStruct,
        IExecutor.StoredBatchInfoStruct[],
        IExecutor.ProofInputStruct
    ]): string;
    encodeFunctionData(functionFragment: "proveL1ToL2TransactionStatus", values: [
        BytesLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike[],
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "proveL2LogInclusion", values: [BigNumberish, BigNumberish, L2LogStruct, BytesLike[]]): string;
    encodeFunctionData(functionFragment: "proveL2MessageInclusion", values: [BigNumberish, BigNumberish, L2MessageStruct, BytesLike[]]): string;
    encodeFunctionData(functionFragment: "requestL2Transaction", values: [
        AddressLike,
        BigNumberish,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BytesLike[],
        AddressLike
    ]): string;
    encodeFunctionData(functionFragment: "revertBatches", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "revertBatchesSharedBridge", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setPendingAdmin", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setPorterAvailability", values: [boolean]): string;
    encodeFunctionData(functionFragment: "setPriorityTxMaxGasLimit", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "setPubdataPricingMode", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "setTokenMultiplier", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setTransactionFilterer", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setValidator", values: [AddressLike, boolean]): string;
    encodeFunctionData(functionFragment: "storedBatchHash", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferEthToSharedBridge", values?: undefined): string;
    encodeFunctionData(functionFragment: "unfreezeDiamond", values?: undefined): string;
    encodeFunctionData(functionFragment: "upgradeChainFromVersion", values: [BigNumberish, Diamond.DiamondCutDataStruct]): string;
    decodeFunctionResult(functionFragment: "acceptAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTokenGasPriceMultiplierDenominator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTokenGasPriceMultiplierNominator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bridgehubRequestL2Transaction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "changeFeeParams", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "commitBatches", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "commitBatchesSharedBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeBatches", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeBatchesSharedBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeUpgrade", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "facetAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "facetAddresses", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "facetFunctionSelectors", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "facets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "finalizeEthWithdrawal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "freezeDiamond", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBaseToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBaseTokenBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBridgehub", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFirstUnprocessedPriorityTx", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getL2BootloaderBytecodeHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getL2DefaultAccountBytecodeHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getL2SystemContractsUpgradeBatchNumber", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getL2SystemContractsUpgradeTxHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getName", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPendingAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPriorityQueueSize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPriorityTxMaxGasLimit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getProtocolVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPubdataPricingMode", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSemverProtocolVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getStateTransitionManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalBatchesCommitted", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalBatchesExecuted", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalBatchesVerified", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalPriorityTxs", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVerifier", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVerifierParams", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isDiamondStorageFrozen", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isEthWithdrawalFinalized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isFacetFreezable", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isFunctionFreezable", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isValidator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l2LogsRootHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "l2TransactionBaseCost", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "priorityQueueFrontOperation", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveBatches", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveBatchesSharedBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveL1ToL2TransactionStatus", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveL2LogInclusion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proveL2MessageInclusion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requestL2Transaction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revertBatches", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revertBatchesSharedBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPendingAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPorterAvailability", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPriorityTxMaxGasLimit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPubdataPricingMode", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTokenMultiplier", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTransactionFilterer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setValidator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "storedBatchHash", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferEthToSharedBridge", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unfreezeDiamond", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "upgradeChainFromVersion", data: BytesLike): Result;
}
export declare namespace BlockCommitEvent {
    type InputTuple = [
        batchNumber: BigNumberish,
        batchHash: BytesLike,
        commitment: BytesLike
    ];
    type OutputTuple = [
        batchNumber: bigint,
        batchHash: string,
        commitment: string
    ];
    interface OutputObject {
        batchNumber: bigint;
        batchHash: string;
        commitment: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace BlockExecutionEvent {
    type InputTuple = [
        batchNumber: BigNumberish,
        batchHash: BytesLike,
        commitment: BytesLike
    ];
    type OutputTuple = [
        batchNumber: bigint,
        batchHash: string,
        commitment: string
    ];
    interface OutputObject {
        batchNumber: bigint;
        batchHash: string;
        commitment: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace BlocksRevertEvent {
    type InputTuple = [
        totalBatchesCommitted: BigNumberish,
        totalBatchesVerified: BigNumberish,
        totalBatchesExecuted: BigNumberish
    ];
    type OutputTuple = [
        totalBatchesCommitted: bigint,
        totalBatchesVerified: bigint,
        totalBatchesExecuted: bigint
    ];
    interface OutputObject {
        totalBatchesCommitted: bigint;
        totalBatchesVerified: bigint;
        totalBatchesExecuted: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace BlocksVerificationEvent {
    type InputTuple = [
        previousLastVerifiedBatch: BigNumberish,
        currentLastVerifiedBatch: BigNumberish
    ];
    type OutputTuple = [
        previousLastVerifiedBatch: bigint,
        currentLastVerifiedBatch: bigint
    ];
    interface OutputObject {
        previousLastVerifiedBatch: bigint;
        currentLastVerifiedBatch: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ExecuteUpgradeEvent {
    type InputTuple = [diamondCut: Diamond.DiamondCutDataStruct];
    type OutputTuple = [diamondCut: Diamond.DiamondCutDataStructOutput];
    interface OutputObject {
        diamondCut: Diamond.DiamondCutDataStructOutput;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace FreezeEvent {
    type InputTuple = [];
    type OutputTuple = [];
    interface OutputObject {
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace IsPorterAvailableStatusUpdateEvent {
    type InputTuple = [isPorterAvailable: boolean];
    type OutputTuple = [isPorterAvailable: boolean];
    interface OutputObject {
        isPorterAvailable: boolean;
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
export declare namespace NewBaseTokenMultiplierEvent {
    type InputTuple = [
        oldNominator: BigNumberish,
        oldDenominator: BigNumberish,
        newNominator: BigNumberish,
        newDenominator: BigNumberish
    ];
    type OutputTuple = [
        oldNominator: bigint,
        oldDenominator: bigint,
        newNominator: bigint,
        newDenominator: bigint
    ];
    interface OutputObject {
        oldNominator: bigint;
        oldDenominator: bigint;
        newNominator: bigint;
        newDenominator: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace NewFeeParamsEvent {
    type InputTuple = [
        oldFeeParams: FeeParamsStruct,
        newFeeParams: FeeParamsStruct
    ];
    type OutputTuple = [
        oldFeeParams: FeeParamsStructOutput,
        newFeeParams: FeeParamsStructOutput
    ];
    interface OutputObject {
        oldFeeParams: FeeParamsStructOutput;
        newFeeParams: FeeParamsStructOutput;
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
export declare namespace NewPriorityRequestEvent {
    type InputTuple = [
        txId: BigNumberish,
        txHash: BytesLike,
        expirationTimestamp: BigNumberish,
        transaction: L2CanonicalTransactionStruct,
        factoryDeps: BytesLike[]
    ];
    type OutputTuple = [
        txId: bigint,
        txHash: string,
        expirationTimestamp: bigint,
        transaction: L2CanonicalTransactionStructOutput,
        factoryDeps: string[]
    ];
    interface OutputObject {
        txId: bigint;
        txHash: string;
        expirationTimestamp: bigint;
        transaction: L2CanonicalTransactionStructOutput;
        factoryDeps: string[];
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace NewPriorityTxMaxGasLimitEvent {
    type InputTuple = [
        oldPriorityTxMaxGasLimit: BigNumberish,
        newPriorityTxMaxGasLimit: BigNumberish
    ];
    type OutputTuple = [
        oldPriorityTxMaxGasLimit: bigint,
        newPriorityTxMaxGasLimit: bigint
    ];
    interface OutputObject {
        oldPriorityTxMaxGasLimit: bigint;
        newPriorityTxMaxGasLimit: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace NewTransactionFiltererEvent {
    type InputTuple = [
        oldTransactionFilterer: AddressLike,
        newTransactionFilterer: AddressLike
    ];
    type OutputTuple = [
        oldTransactionFilterer: string,
        newTransactionFilterer: string
    ];
    interface OutputObject {
        oldTransactionFilterer: string;
        newTransactionFilterer: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ProposeTransparentUpgradeEvent {
    type InputTuple = [
        diamondCut: Diamond.DiamondCutDataStruct,
        proposalId: BigNumberish,
        proposalSalt: BytesLike
    ];
    type OutputTuple = [
        diamondCut: Diamond.DiamondCutDataStructOutput,
        proposalId: bigint,
        proposalSalt: string
    ];
    interface OutputObject {
        diamondCut: Diamond.DiamondCutDataStructOutput;
        proposalId: bigint;
        proposalSalt: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace UnfreezeEvent {
    type InputTuple = [];
    type OutputTuple = [];
    interface OutputObject {
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ValidatorStatusUpdateEvent {
    type InputTuple = [validatorAddress: AddressLike, isActive: boolean];
    type OutputTuple = [validatorAddress: string, isActive: boolean];
    interface OutputObject {
        validatorAddress: string;
        isActive: boolean;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace ValidiumModeStatusUpdateEvent {
    type InputTuple = [validiumMode: BigNumberish];
    type OutputTuple = [validiumMode: bigint];
    interface OutputObject {
        validiumMode: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IZkSyncHyperchain extends BaseContract {
    connect(runner?: ContractRunner | null): IZkSyncHyperchain;
    waitForDeployment(): Promise<this>;
    interface: IZkSyncHyperchainInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    acceptAdmin: TypedContractMethod<[], [void], "nonpayable">;
    baseTokenGasPriceMultiplierDenominator: TypedContractMethod<[
    ], [
        bigint
    ], "view">;
    baseTokenGasPriceMultiplierNominator: TypedContractMethod<[
    ], [
        bigint
    ], "view">;
    bridgehubRequestL2Transaction: TypedContractMethod<[
        _request: BridgehubL2TransactionRequestStruct
    ], [
        string
    ], "nonpayable">;
    changeFeeParams: TypedContractMethod<[
        _newFeeParams: FeeParamsStruct
    ], [
        void
    ], "nonpayable">;
    commitBatches: TypedContractMethod<[
        _lastCommittedBatchData: IExecutor.StoredBatchInfoStruct,
        _newBatchesData: IExecutor.CommitBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    commitBatchesSharedBridge: TypedContractMethod<[
        _chainId: BigNumberish,
        _lastCommittedBatchData: IExecutor.StoredBatchInfoStruct,
        _newBatchesData: IExecutor.CommitBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    executeBatches: TypedContractMethod<[
        _batchesData: IExecutor.StoredBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    executeBatchesSharedBridge: TypedContractMethod<[
        _chainId: BigNumberish,
        _batchesData: IExecutor.StoredBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    executeUpgrade: TypedContractMethod<[
        _diamondCut: Diamond.DiamondCutDataStruct
    ], [
        void
    ], "nonpayable">;
    facetAddress: TypedContractMethod<[_selector: BytesLike], [string], "view">;
    facetAddresses: TypedContractMethod<[], [string[]], "view">;
    facetFunctionSelectors: TypedContractMethod<[
        _facet: AddressLike
    ], [
        string[]
    ], "view">;
    facets: TypedContractMethod<[], [IGetters.FacetStructOutput[]], "view">;
    finalizeEthWithdrawal: TypedContractMethod<[
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _message: BytesLike,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    freezeDiamond: TypedContractMethod<[], [void], "nonpayable">;
    getAdmin: TypedContractMethod<[], [string], "view">;
    getBaseToken: TypedContractMethod<[], [string], "view">;
    getBaseTokenBridge: TypedContractMethod<[], [string], "view">;
    getBridgehub: TypedContractMethod<[], [string], "view">;
    getFirstUnprocessedPriorityTx: TypedContractMethod<[], [bigint], "view">;
    getL2BootloaderBytecodeHash: TypedContractMethod<[], [string], "view">;
    getL2DefaultAccountBytecodeHash: TypedContractMethod<[], [string], "view">;
    getL2SystemContractsUpgradeBatchNumber: TypedContractMethod<[
    ], [
        bigint
    ], "view">;
    getL2SystemContractsUpgradeTxHash: TypedContractMethod<[], [string], "view">;
    getName: TypedContractMethod<[], [string], "view">;
    getPendingAdmin: TypedContractMethod<[], [string], "view">;
    getPriorityQueueSize: TypedContractMethod<[], [bigint], "view">;
    getPriorityTxMaxGasLimit: TypedContractMethod<[], [bigint], "view">;
    getProtocolVersion: TypedContractMethod<[], [bigint], "view">;
    getPubdataPricingMode: TypedContractMethod<[], [bigint], "view">;
    getSemverProtocolVersion: TypedContractMethod<[
    ], [
        [bigint, bigint, bigint]
    ], "view">;
    getStateTransitionManager: TypedContractMethod<[], [string], "view">;
    getTotalBatchesCommitted: TypedContractMethod<[], [bigint], "view">;
    getTotalBatchesExecuted: TypedContractMethod<[], [bigint], "view">;
    getTotalBatchesVerified: TypedContractMethod<[], [bigint], "view">;
    getTotalPriorityTxs: TypedContractMethod<[], [bigint], "view">;
    getVerifier: TypedContractMethod<[], [string], "view">;
    getVerifierParams: TypedContractMethod<[
    ], [
        VerifierParamsStructOutput
    ], "view">;
    isDiamondStorageFrozen: TypedContractMethod<[], [boolean], "view">;
    isEthWithdrawalFinalized: TypedContractMethod<[
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish
    ], [
        boolean
    ], "view">;
    isFacetFreezable: TypedContractMethod<[
        _facet: AddressLike
    ], [
        boolean
    ], "view">;
    isFunctionFreezable: TypedContractMethod<[
        _selector: BytesLike
    ], [
        boolean
    ], "view">;
    isValidator: TypedContractMethod<[_address: AddressLike], [boolean], "view">;
    l2LogsRootHash: TypedContractMethod<[
        _batchNumber: BigNumberish
    ], [
        string
    ], "view">;
    l2TransactionBaseCost: TypedContractMethod<[
        _gasPrice: BigNumberish,
        _l2GasLimit: BigNumberish,
        _l2GasPerPubdataByteLimit: BigNumberish
    ], [
        bigint
    ], "view">;
    priorityQueueFrontOperation: TypedContractMethod<[
    ], [
        PriorityOperationStructOutput
    ], "view">;
    proveBatches: TypedContractMethod<[
        _prevBatch: IExecutor.StoredBatchInfoStruct,
        _committedBatches: IExecutor.StoredBatchInfoStruct[],
        _proof: IExecutor.ProofInputStruct
    ], [
        void
    ], "nonpayable">;
    proveBatchesSharedBridge: TypedContractMethod<[
        _chainId: BigNumberish,
        _prevBatch: IExecutor.StoredBatchInfoStruct,
        _committedBatches: IExecutor.StoredBatchInfoStruct[],
        _proof: IExecutor.ProofInputStruct
    ], [
        void
    ], "nonpayable">;
    proveL1ToL2TransactionStatus: TypedContractMethod<[
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
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _log: L2LogStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    proveL2MessageInclusion: TypedContractMethod<[
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _message: L2MessageStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    requestL2Transaction: TypedContractMethod<[
        _contractL2: AddressLike,
        _l2Value: BigNumberish,
        _calldata: BytesLike,
        _l2GasLimit: BigNumberish,
        _l2GasPerPubdataByteLimit: BigNumberish,
        _factoryDeps: BytesLike[],
        _refundRecipient: AddressLike
    ], [
        string
    ], "payable">;
    revertBatches: TypedContractMethod<[
        _newLastBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    revertBatchesSharedBridge: TypedContractMethod<[
        _chainId: BigNumberish,
        _newLastBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setPendingAdmin: TypedContractMethod<[
        _newPendingAdmin: AddressLike
    ], [
        void
    ], "nonpayable">;
    setPorterAvailability: TypedContractMethod<[
        _zkPorterIsAvailable: boolean
    ], [
        void
    ], "nonpayable">;
    setPriorityTxMaxGasLimit: TypedContractMethod<[
        _newPriorityTxMaxGasLimit: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setPubdataPricingMode: TypedContractMethod<[
        _pricingMode: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setTokenMultiplier: TypedContractMethod<[
        _nominator: BigNumberish,
        _denominator: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setTransactionFilterer: TypedContractMethod<[
        _transactionFilterer: AddressLike
    ], [
        void
    ], "nonpayable">;
    setValidator: TypedContractMethod<[
        _validator: AddressLike,
        _active: boolean
    ], [
        void
    ], "nonpayable">;
    storedBatchHash: TypedContractMethod<[
        _batchNumber: BigNumberish
    ], [
        string
    ], "view">;
    transferEthToSharedBridge: TypedContractMethod<[], [void], "nonpayable">;
    unfreezeDiamond: TypedContractMethod<[], [void], "nonpayable">;
    upgradeChainFromVersion: TypedContractMethod<[
        _protocolVersion: BigNumberish,
        _cutData: Diamond.DiamondCutDataStruct
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "acceptAdmin"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "baseTokenGasPriceMultiplierDenominator"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "baseTokenGasPriceMultiplierNominator"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "bridgehubRequestL2Transaction"): TypedContractMethod<[
        _request: BridgehubL2TransactionRequestStruct
    ], [
        string
    ], "nonpayable">;
    getFunction(nameOrSignature: "changeFeeParams"): TypedContractMethod<[
        _newFeeParams: FeeParamsStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "commitBatches"): TypedContractMethod<[
        _lastCommittedBatchData: IExecutor.StoredBatchInfoStruct,
        _newBatchesData: IExecutor.CommitBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "commitBatchesSharedBridge"): TypedContractMethod<[
        _chainId: BigNumberish,
        _lastCommittedBatchData: IExecutor.StoredBatchInfoStruct,
        _newBatchesData: IExecutor.CommitBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "executeBatches"): TypedContractMethod<[
        _batchesData: IExecutor.StoredBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "executeBatchesSharedBridge"): TypedContractMethod<[
        _chainId: BigNumberish,
        _batchesData: IExecutor.StoredBatchInfoStruct[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "executeUpgrade"): TypedContractMethod<[
        _diamondCut: Diamond.DiamondCutDataStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "facetAddress"): TypedContractMethod<[_selector: BytesLike], [string], "view">;
    getFunction(nameOrSignature: "facetAddresses"): TypedContractMethod<[], [string[]], "view">;
    getFunction(nameOrSignature: "facetFunctionSelectors"): TypedContractMethod<[_facet: AddressLike], [string[]], "view">;
    getFunction(nameOrSignature: "facets"): TypedContractMethod<[], [IGetters.FacetStructOutput[]], "view">;
    getFunction(nameOrSignature: "finalizeEthWithdrawal"): TypedContractMethod<[
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish,
        _l2TxNumberInBatch: BigNumberish,
        _message: BytesLike,
        _merkleProof: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "freezeDiamond"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "getAdmin"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getBaseToken"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getBaseTokenBridge"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getBridgehub"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getFirstUnprocessedPriorityTx"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getL2BootloaderBytecodeHash"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getL2DefaultAccountBytecodeHash"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getL2SystemContractsUpgradeBatchNumber"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getL2SystemContractsUpgradeTxHash"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getName"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getPendingAdmin"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getPriorityQueueSize"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getPriorityTxMaxGasLimit"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getProtocolVersion"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getPubdataPricingMode"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getSemverProtocolVersion"): TypedContractMethod<[], [[bigint, bigint, bigint]], "view">;
    getFunction(nameOrSignature: "getStateTransitionManager"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getTotalBatchesCommitted"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getTotalBatchesExecuted"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getTotalBatchesVerified"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getTotalPriorityTxs"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "getVerifier"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getVerifierParams"): TypedContractMethod<[], [VerifierParamsStructOutput], "view">;
    getFunction(nameOrSignature: "isDiamondStorageFrozen"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "isEthWithdrawalFinalized"): TypedContractMethod<[
        _l2BatchNumber: BigNumberish,
        _l2MessageIndex: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "isFacetFreezable"): TypedContractMethod<[_facet: AddressLike], [boolean], "view">;
    getFunction(nameOrSignature: "isFunctionFreezable"): TypedContractMethod<[_selector: BytesLike], [boolean], "view">;
    getFunction(nameOrSignature: "isValidator"): TypedContractMethod<[_address: AddressLike], [boolean], "view">;
    getFunction(nameOrSignature: "l2LogsRootHash"): TypedContractMethod<[_batchNumber: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "l2TransactionBaseCost"): TypedContractMethod<[
        _gasPrice: BigNumberish,
        _l2GasLimit: BigNumberish,
        _l2GasPerPubdataByteLimit: BigNumberish
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "priorityQueueFrontOperation"): TypedContractMethod<[], [PriorityOperationStructOutput], "view">;
    getFunction(nameOrSignature: "proveBatches"): TypedContractMethod<[
        _prevBatch: IExecutor.StoredBatchInfoStruct,
        _committedBatches: IExecutor.StoredBatchInfoStruct[],
        _proof: IExecutor.ProofInputStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "proveBatchesSharedBridge"): TypedContractMethod<[
        _chainId: BigNumberish,
        _prevBatch: IExecutor.StoredBatchInfoStruct,
        _committedBatches: IExecutor.StoredBatchInfoStruct[],
        _proof: IExecutor.ProofInputStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "proveL1ToL2TransactionStatus"): TypedContractMethod<[
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
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _log: L2LogStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "proveL2MessageInclusion"): TypedContractMethod<[
        _batchNumber: BigNumberish,
        _index: BigNumberish,
        _message: L2MessageStruct,
        _proof: BytesLike[]
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "requestL2Transaction"): TypedContractMethod<[
        _contractL2: AddressLike,
        _l2Value: BigNumberish,
        _calldata: BytesLike,
        _l2GasLimit: BigNumberish,
        _l2GasPerPubdataByteLimit: BigNumberish,
        _factoryDeps: BytesLike[],
        _refundRecipient: AddressLike
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "revertBatches"): TypedContractMethod<[_newLastBatch: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "revertBatchesSharedBridge"): TypedContractMethod<[
        _chainId: BigNumberish,
        _newLastBatch: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setPendingAdmin"): TypedContractMethod<[_newPendingAdmin: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "setPorterAvailability"): TypedContractMethod<[_zkPorterIsAvailable: boolean], [void], "nonpayable">;
    getFunction(nameOrSignature: "setPriorityTxMaxGasLimit"): TypedContractMethod<[
        _newPriorityTxMaxGasLimit: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setPubdataPricingMode"): TypedContractMethod<[_pricingMode: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "setTokenMultiplier"): TypedContractMethod<[
        _nominator: BigNumberish,
        _denominator: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setTransactionFilterer"): TypedContractMethod<[
        _transactionFilterer: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setValidator"): TypedContractMethod<[
        _validator: AddressLike,
        _active: boolean
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "storedBatchHash"): TypedContractMethod<[_batchNumber: BigNumberish], [string], "view">;
    getFunction(nameOrSignature: "transferEthToSharedBridge"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "unfreezeDiamond"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "upgradeChainFromVersion"): TypedContractMethod<[
        _protocolVersion: BigNumberish,
        _cutData: Diamond.DiamondCutDataStruct
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "BlockCommit"): TypedContractEvent<BlockCommitEvent.InputTuple, BlockCommitEvent.OutputTuple, BlockCommitEvent.OutputObject>;
    getEvent(key: "BlockExecution"): TypedContractEvent<BlockExecutionEvent.InputTuple, BlockExecutionEvent.OutputTuple, BlockExecutionEvent.OutputObject>;
    getEvent(key: "BlocksRevert"): TypedContractEvent<BlocksRevertEvent.InputTuple, BlocksRevertEvent.OutputTuple, BlocksRevertEvent.OutputObject>;
    getEvent(key: "BlocksVerification"): TypedContractEvent<BlocksVerificationEvent.InputTuple, BlocksVerificationEvent.OutputTuple, BlocksVerificationEvent.OutputObject>;
    getEvent(key: "ExecuteUpgrade"): TypedContractEvent<ExecuteUpgradeEvent.InputTuple, ExecuteUpgradeEvent.OutputTuple, ExecuteUpgradeEvent.OutputObject>;
    getEvent(key: "Freeze"): TypedContractEvent<FreezeEvent.InputTuple, FreezeEvent.OutputTuple, FreezeEvent.OutputObject>;
    getEvent(key: "IsPorterAvailableStatusUpdate"): TypedContractEvent<IsPorterAvailableStatusUpdateEvent.InputTuple, IsPorterAvailableStatusUpdateEvent.OutputTuple, IsPorterAvailableStatusUpdateEvent.OutputObject>;
    getEvent(key: "NewAdmin"): TypedContractEvent<NewAdminEvent.InputTuple, NewAdminEvent.OutputTuple, NewAdminEvent.OutputObject>;
    getEvent(key: "NewBaseTokenMultiplier"): TypedContractEvent<NewBaseTokenMultiplierEvent.InputTuple, NewBaseTokenMultiplierEvent.OutputTuple, NewBaseTokenMultiplierEvent.OutputObject>;
    getEvent(key: "NewFeeParams"): TypedContractEvent<NewFeeParamsEvent.InputTuple, NewFeeParamsEvent.OutputTuple, NewFeeParamsEvent.OutputObject>;
    getEvent(key: "NewPendingAdmin"): TypedContractEvent<NewPendingAdminEvent.InputTuple, NewPendingAdminEvent.OutputTuple, NewPendingAdminEvent.OutputObject>;
    getEvent(key: "NewPriorityRequest"): TypedContractEvent<NewPriorityRequestEvent.InputTuple, NewPriorityRequestEvent.OutputTuple, NewPriorityRequestEvent.OutputObject>;
    getEvent(key: "NewPriorityTxMaxGasLimit"): TypedContractEvent<NewPriorityTxMaxGasLimitEvent.InputTuple, NewPriorityTxMaxGasLimitEvent.OutputTuple, NewPriorityTxMaxGasLimitEvent.OutputObject>;
    getEvent(key: "NewTransactionFilterer"): TypedContractEvent<NewTransactionFiltererEvent.InputTuple, NewTransactionFiltererEvent.OutputTuple, NewTransactionFiltererEvent.OutputObject>;
    getEvent(key: "ProposeTransparentUpgrade"): TypedContractEvent<ProposeTransparentUpgradeEvent.InputTuple, ProposeTransparentUpgradeEvent.OutputTuple, ProposeTransparentUpgradeEvent.OutputObject>;
    getEvent(key: "Unfreeze"): TypedContractEvent<UnfreezeEvent.InputTuple, UnfreezeEvent.OutputTuple, UnfreezeEvent.OutputObject>;
    getEvent(key: "ValidatorStatusUpdate"): TypedContractEvent<ValidatorStatusUpdateEvent.InputTuple, ValidatorStatusUpdateEvent.OutputTuple, ValidatorStatusUpdateEvent.OutputObject>;
    getEvent(key: "ValidiumModeStatusUpdate"): TypedContractEvent<ValidiumModeStatusUpdateEvent.InputTuple, ValidiumModeStatusUpdateEvent.OutputTuple, ValidiumModeStatusUpdateEvent.OutputObject>;
    filters: {
        "BlockCommit(uint256,bytes32,bytes32)": TypedContractEvent<BlockCommitEvent.InputTuple, BlockCommitEvent.OutputTuple, BlockCommitEvent.OutputObject>;
        BlockCommit: TypedContractEvent<BlockCommitEvent.InputTuple, BlockCommitEvent.OutputTuple, BlockCommitEvent.OutputObject>;
        "BlockExecution(uint256,bytes32,bytes32)": TypedContractEvent<BlockExecutionEvent.InputTuple, BlockExecutionEvent.OutputTuple, BlockExecutionEvent.OutputObject>;
        BlockExecution: TypedContractEvent<BlockExecutionEvent.InputTuple, BlockExecutionEvent.OutputTuple, BlockExecutionEvent.OutputObject>;
        "BlocksRevert(uint256,uint256,uint256)": TypedContractEvent<BlocksRevertEvent.InputTuple, BlocksRevertEvent.OutputTuple, BlocksRevertEvent.OutputObject>;
        BlocksRevert: TypedContractEvent<BlocksRevertEvent.InputTuple, BlocksRevertEvent.OutputTuple, BlocksRevertEvent.OutputObject>;
        "BlocksVerification(uint256,uint256)": TypedContractEvent<BlocksVerificationEvent.InputTuple, BlocksVerificationEvent.OutputTuple, BlocksVerificationEvent.OutputObject>;
        BlocksVerification: TypedContractEvent<BlocksVerificationEvent.InputTuple, BlocksVerificationEvent.OutputTuple, BlocksVerificationEvent.OutputObject>;
        "ExecuteUpgrade(tuple)": TypedContractEvent<ExecuteUpgradeEvent.InputTuple, ExecuteUpgradeEvent.OutputTuple, ExecuteUpgradeEvent.OutputObject>;
        ExecuteUpgrade: TypedContractEvent<ExecuteUpgradeEvent.InputTuple, ExecuteUpgradeEvent.OutputTuple, ExecuteUpgradeEvent.OutputObject>;
        "Freeze()": TypedContractEvent<FreezeEvent.InputTuple, FreezeEvent.OutputTuple, FreezeEvent.OutputObject>;
        Freeze: TypedContractEvent<FreezeEvent.InputTuple, FreezeEvent.OutputTuple, FreezeEvent.OutputObject>;
        "IsPorterAvailableStatusUpdate(bool)": TypedContractEvent<IsPorterAvailableStatusUpdateEvent.InputTuple, IsPorterAvailableStatusUpdateEvent.OutputTuple, IsPorterAvailableStatusUpdateEvent.OutputObject>;
        IsPorterAvailableStatusUpdate: TypedContractEvent<IsPorterAvailableStatusUpdateEvent.InputTuple, IsPorterAvailableStatusUpdateEvent.OutputTuple, IsPorterAvailableStatusUpdateEvent.OutputObject>;
        "NewAdmin(address,address)": TypedContractEvent<NewAdminEvent.InputTuple, NewAdminEvent.OutputTuple, NewAdminEvent.OutputObject>;
        NewAdmin: TypedContractEvent<NewAdminEvent.InputTuple, NewAdminEvent.OutputTuple, NewAdminEvent.OutputObject>;
        "NewBaseTokenMultiplier(uint128,uint128,uint128,uint128)": TypedContractEvent<NewBaseTokenMultiplierEvent.InputTuple, NewBaseTokenMultiplierEvent.OutputTuple, NewBaseTokenMultiplierEvent.OutputObject>;
        NewBaseTokenMultiplier: TypedContractEvent<NewBaseTokenMultiplierEvent.InputTuple, NewBaseTokenMultiplierEvent.OutputTuple, NewBaseTokenMultiplierEvent.OutputObject>;
        "NewFeeParams(tuple,tuple)": TypedContractEvent<NewFeeParamsEvent.InputTuple, NewFeeParamsEvent.OutputTuple, NewFeeParamsEvent.OutputObject>;
        NewFeeParams: TypedContractEvent<NewFeeParamsEvent.InputTuple, NewFeeParamsEvent.OutputTuple, NewFeeParamsEvent.OutputObject>;
        "NewPendingAdmin(address,address)": TypedContractEvent<NewPendingAdminEvent.InputTuple, NewPendingAdminEvent.OutputTuple, NewPendingAdminEvent.OutputObject>;
        NewPendingAdmin: TypedContractEvent<NewPendingAdminEvent.InputTuple, NewPendingAdminEvent.OutputTuple, NewPendingAdminEvent.OutputObject>;
        "NewPriorityRequest(uint256,bytes32,uint64,tuple,bytes[])": TypedContractEvent<NewPriorityRequestEvent.InputTuple, NewPriorityRequestEvent.OutputTuple, NewPriorityRequestEvent.OutputObject>;
        NewPriorityRequest: TypedContractEvent<NewPriorityRequestEvent.InputTuple, NewPriorityRequestEvent.OutputTuple, NewPriorityRequestEvent.OutputObject>;
        "NewPriorityTxMaxGasLimit(uint256,uint256)": TypedContractEvent<NewPriorityTxMaxGasLimitEvent.InputTuple, NewPriorityTxMaxGasLimitEvent.OutputTuple, NewPriorityTxMaxGasLimitEvent.OutputObject>;
        NewPriorityTxMaxGasLimit: TypedContractEvent<NewPriorityTxMaxGasLimitEvent.InputTuple, NewPriorityTxMaxGasLimitEvent.OutputTuple, NewPriorityTxMaxGasLimitEvent.OutputObject>;
        "NewTransactionFilterer(address,address)": TypedContractEvent<NewTransactionFiltererEvent.InputTuple, NewTransactionFiltererEvent.OutputTuple, NewTransactionFiltererEvent.OutputObject>;
        NewTransactionFilterer: TypedContractEvent<NewTransactionFiltererEvent.InputTuple, NewTransactionFiltererEvent.OutputTuple, NewTransactionFiltererEvent.OutputObject>;
        "ProposeTransparentUpgrade(tuple,uint256,bytes32)": TypedContractEvent<ProposeTransparentUpgradeEvent.InputTuple, ProposeTransparentUpgradeEvent.OutputTuple, ProposeTransparentUpgradeEvent.OutputObject>;
        ProposeTransparentUpgrade: TypedContractEvent<ProposeTransparentUpgradeEvent.InputTuple, ProposeTransparentUpgradeEvent.OutputTuple, ProposeTransparentUpgradeEvent.OutputObject>;
        "Unfreeze()": TypedContractEvent<UnfreezeEvent.InputTuple, UnfreezeEvent.OutputTuple, UnfreezeEvent.OutputObject>;
        Unfreeze: TypedContractEvent<UnfreezeEvent.InputTuple, UnfreezeEvent.OutputTuple, UnfreezeEvent.OutputObject>;
        "ValidatorStatusUpdate(address,bool)": TypedContractEvent<ValidatorStatusUpdateEvent.InputTuple, ValidatorStatusUpdateEvent.OutputTuple, ValidatorStatusUpdateEvent.OutputObject>;
        ValidatorStatusUpdate: TypedContractEvent<ValidatorStatusUpdateEvent.InputTuple, ValidatorStatusUpdateEvent.OutputTuple, ValidatorStatusUpdateEvent.OutputObject>;
        "ValidiumModeStatusUpdate(uint8)": TypedContractEvent<ValidiumModeStatusUpdateEvent.InputTuple, ValidiumModeStatusUpdateEvent.OutputTuple, ValidiumModeStatusUpdateEvent.OutputObject>;
        ValidiumModeStatusUpdate: TypedContractEvent<ValidiumModeStatusUpdateEvent.InputTuple, ValidiumModeStatusUpdateEvent.OutputTuple, ValidiumModeStatusUpdateEvent.OutputObject>;
    };
}
