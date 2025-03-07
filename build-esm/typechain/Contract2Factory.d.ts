import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "./common";
export interface Contract2FactoryInterface extends Interface {
    getFunction(nameOrSignature: "create2" | "create2Account"): FunctionFragment;
    encodeFunctionData(functionFragment: "create2", values: [BytesLike, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "create2Account", values: [BytesLike, BytesLike, BytesLike, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "create2", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "create2Account", data: BytesLike): Result;
}
export interface Contract2Factory extends BaseContract {
    connect(runner?: ContractRunner | null): Contract2Factory;
    waitForDeployment(): Promise<this>;
    interface: Contract2FactoryInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    create2: TypedContractMethod<[
        arg0: BytesLike,
        arg1: BytesLike,
        arg2: BytesLike
    ], [
        string
    ], "payable">;
    create2Account: TypedContractMethod<[
        arg0: BytesLike,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: BigNumberish
    ], [
        string
    ], "payable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "create2"): TypedContractMethod<[
        arg0: BytesLike,
        arg1: BytesLike,
        arg2: BytesLike
    ], [
        string
    ], "payable">;
    getFunction(nameOrSignature: "create2Account"): TypedContractMethod<[
        arg0: BytesLike,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: BigNumberish
    ], [
        string
    ], "payable">;
    filters: {};
}
