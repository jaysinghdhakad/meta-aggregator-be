import BigNumber from "bignumber.js";
import { baseChainID } from "./config";
import { ERC20ABI } from "./ERC20.abi.ts";
import { ethers } from "ethers";
import axios from "axios";
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
            const calldata = tokenContract.interface.encodeFunctionData('approve', [approvalAddress, ethers.toBigInt(amount)])
            return calldata
        }
    }
    catch (error) {
        console.log("error", error)
        return null
    }
}


export async function fetchTokenPrice(tokenAddress: string, chainId: number) {
    if (tokenAddress.localeCompare(process.env.ETH_ADDRESS_ENSO || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", 'en', { sensitivity: 'base' }) == 0) tokenAddress = process.env.WETH_ADDRESS || "0x4200000000000000000000000000000000000006";
    const chainName = getChainName(chainId)
    try {
        const response = await axios.get(`https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/price?chain=${chainName}`, {
            headers: {
                timeout: 500,
                'X-API-Key': process.env.MORALIS_KEY
            }
        });

        return response.data
    } catch (e) {
        console.log("fetch token price error", e)
        return null
    }
}

export function calculatePriceImpactPercentage(amountOut: string, amountIn: string, tokenInPrice: string, tokenOutPrice: string, tokenInDecimals: number, tokenOutDecimals: number) {
    const amountOutBN = BigNumber(amountOut).div(BigNumber(10).pow(tokenOutDecimals))
    const amountInBN = BigNumber(amountIn).div(BigNumber(10).pow(tokenInDecimals))
    const tokenInPriceBN = BigNumber(tokenInPrice)
    const tokenOutPriceBN = BigNumber(tokenOutPrice)
    const amountInUsd = amountInBN.times(tokenInPriceBN)
    const amountOutUsd = amountOutBN.times(tokenOutPriceBN)
    const amountOutUSDInAmountIn = amountOutUsd.div(amountInUsd)
    const priceImpactPercentage = BigNumber(1).minus(amountOutUSDInAmountIn).times(100).toFixed(2)
    return priceImpactPercentage
}

