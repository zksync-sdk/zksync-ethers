import {BytesLike, ethers} from 'ethers';

import {
  Address,
  ApprovalBasedPaymasterInput,
  GeneralPaymasterInput,
  PaymasterInput,
  PaymasterParams,
} from './types';

import IPaymasterFlowABI from '../abi/IPaymasterFlow.json';

/**
 * The ABI for the `IPaymasterFlow` interface, which is utilized for encoding input parameters for paymaster flows.
 * @constant
 */
export const PAYMASTER_FLOW_ABI = new ethers.utils.Interface(IPaymasterFlowABI);

/**
 * Returns encoded input for an approval-based paymaster.
 *
 * @param paymasterInput The input data for the paymaster.
 */
export function getApprovalBasedPaymasterInput(
  paymasterInput: ApprovalBasedPaymasterInput
): BytesLike {
  return PAYMASTER_FLOW_ABI.encodeFunctionData('approvalBased', [
    paymasterInput.token,
    paymasterInput.minimalAllowance,
    paymasterInput.innerInput,
  ]);
}

/**
 * Returns encoded input for a general-based paymaster.
 *
 * @param paymasterInput The input data for the paymaster.
 */
export function getGeneralPaymasterInput(
  paymasterInput: GeneralPaymasterInput
): BytesLike {
  return PAYMASTER_FLOW_ABI.encodeFunctionData('general', [
    paymasterInput.innerInput,
  ]);
}

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
export function getPaymasterParams(
  paymasterAddress: Address,
  paymasterInput: PaymasterInput
): PaymasterParams {
  if (paymasterInput.type === 'General') {
    return {
      paymaster: paymasterAddress,
      paymasterInput: getGeneralPaymasterInput(paymasterInput),
    };
  } else {
    return {
      paymaster: paymasterAddress,
      paymasterInput: getApprovalBasedPaymasterInput(paymasterInput),
    };
  }
}
