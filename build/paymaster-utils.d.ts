import { BytesLike, ethers } from 'ethers';
import { Address, ApprovalBasedPaymasterInput, GeneralPaymasterInput, PaymasterInput, PaymasterParams } from './types';
/**
 * The ABI for the `IPaymasterFlow` interface, which is utilized for encoding input parameters for paymaster flows.
 * @constant
 */
export declare const PAYMASTER_FLOW_ABI: ethers.utils.Interface;
/**
 * Returns encoded input for an approval-based paymaster.
 *
 * @param paymasterInput The input data for the paymaster.
 */
export declare function getApprovalBasedPaymasterInput(paymasterInput: ApprovalBasedPaymasterInput): BytesLike;
/**
 * Returns encoded input for a general-based paymaster.
 *
 * @param paymasterInput The input data for the paymaster.
 */
export declare function getGeneralPaymasterInput(paymasterInput: GeneralPaymasterInput): BytesLike;
/**
 * Returns a correctly-formed {@link PaymasterParams|paymasterParams} object for common paymaster flows.
 *
 * @param paymasterAddress The non-zero paymaster address.
 * @param paymasterInput The input data for the paymaster.
 *
 * @example Create general-based parameters.
 *
 * const paymasterAddress = "0x0a67078A35745947A37A552174aFe724D8180c25";
 * const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
 *   type: "General",
 *   innerInput: new Uint8Array(),
 * });
 *
 * @example Create approval-based parameters.
 *
 * const result = utils.getPaymasterParams("0x0a67078A35745947A37A552174aFe724D8180c25", {
 *   type: "ApprovalBased",
 *   token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
 *   minimalAllowance: BigNumber.from(1),
 *   innerInput: new Uint8Array(),
 * });
 */
export declare function getPaymasterParams(paymasterAddress: Address, paymasterInput: PaymasterInput): PaymasterParams;
