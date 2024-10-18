"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymasterParams = exports.getGeneralPaymasterInput = exports.getApprovalBasedPaymasterInput = exports.PAYMASTER_FLOW_ABI = void 0;
const ethers_1 = require("ethers");
const IPaymasterFlow_json_1 = __importDefault(require("../abi/IPaymasterFlow.json"));
/**
 * The ABI for the `IPaymasterFlow` interface, which is utilized for encoding input parameters for paymaster flows.
 * @constant
 */
exports.PAYMASTER_FLOW_ABI = new ethers_1.ethers.utils.Interface(IPaymasterFlow_json_1.default);
/**
 * Returns encoded input for an approval-based paymaster.
 *
 * @param paymasterInput The input data for the paymaster.
 */
function getApprovalBasedPaymasterInput(paymasterInput) {
    return exports.PAYMASTER_FLOW_ABI.encodeFunctionData('approvalBased', [
        paymasterInput.token,
        paymasterInput.minimalAllowance,
        paymasterInput.innerInput,
    ]);
}
exports.getApprovalBasedPaymasterInput = getApprovalBasedPaymasterInput;
/**
 * Returns encoded input for a general-based paymaster.
 *
 * @param paymasterInput The input data for the paymaster.
 */
function getGeneralPaymasterInput(paymasterInput) {
    return exports.PAYMASTER_FLOW_ABI.encodeFunctionData('general', [
        paymasterInput.innerInput,
    ]);
}
exports.getGeneralPaymasterInput = getGeneralPaymasterInput;
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
function getPaymasterParams(paymasterAddress, paymasterInput) {
    if (paymasterInput.type === 'General') {
        return {
            paymaster: paymasterAddress,
            paymasterInput: getGeneralPaymasterInput(paymasterInput),
        };
    }
    else {
        return {
            paymaster: paymasterAddress,
            paymasterInput: getApprovalBasedPaymasterInput(paymasterInput),
        };
    }
}
exports.getPaymasterParams = getPaymasterParams;
//# sourceMappingURL=paymaster-utils.js.map