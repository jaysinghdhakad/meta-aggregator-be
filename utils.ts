import BigNumber from "bignumber.js";
import { baseChainID } from "./config";
import { ERC20ABI } from "./ERC20.abi.ts";
import { ethers } from "ethers";

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
            return process.env.PORTALFI_APPROVAL_ADDRESS_BASE
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

export function getProvider(chainId: number) {
    if (chainId === baseChainID) {
        return new ethers.JsonRpcProvider(process.env.BASE_RPC_URL)
    }
}

export function getApprovalData(chainId: number, amount: string, tokenAddress: string, approvalAddress: string) {
    try {
        if (chainId === baseChainID) {
            const provider = getProvider(chainId)
            const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider)
            const calldata = tokenContract.interface.encodeFunctionData('approve', [approvalAddress, ethers.parseUnits(amount)])
            return calldata
        }
    }
    catch (error) {
        console.log("error", error)
        return null
    }
}