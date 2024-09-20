import BigNumber from "bignumber.js";
import { baseChainID } from "./config";

// This function finds the max of three numbers.
export function findMax(a: any, b: any, c: any) {
    const maxAB = BigNumber.max(a, b);
    const maxABC = BigNumber.max(maxAB, c);
    return maxABC.toFixed(0);
}

// This function returns the approval address for the protocol for the chainId.
export function getApprovalAddressForChain(protocol: string, chainId: number) {
    if (chainId === baseChainID) {
        if (protocol === "portalfi") {
            return  process.env.PORTALFI_APPROVAL_ADDRESS_BASE
        }

        if (protocol === "enso") {
            return process.env.ENSO_APPROVAL_ADDRESS_BASE
        }

        if (protocol === "barter") {
            return process.env.BARTER_APPROVAL_ADDRESS_BASE
        }
        
    }
}

// This function returns the chain name for the chainId.
export function getChainName(chainId: number) {
    if (chainId === baseChainID) {
        return "base"
    }
}

export function getMinAmountOut(amountOut: string, slippage: number) {
    return BigNumber(amountOut).minus(BigNumber(amountOut).times(slippage / 100)).toFixed(0)
}