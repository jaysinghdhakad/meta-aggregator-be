import axios from "axios";
import qs from "qs";
import 'dotenv/config'
import { getChainName } from "../utils/utils";

// This function queries the portalfi protocol and returns the swap data. Also give the gas estimate if getGasEstimate is true. The sender and receiver should be the same if you want to get the swap data.
export const getPortalfiSwap = async (chainId: number, slippage: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string, getGasEstimate: boolean) => {
    if (sender != receiver) return null
    if (tokenOut == process.env.ETH_ADDRESS_ENSO) { tokenOut = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
    if (tokenIn == process.env.ETH_ADDRESS_ENSO) { tokenIn = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
    const chainName = getChainName(chainId)
    const params = qs.stringify({
        sender: sender,
        inputToken: `${chainName}:${tokenIn}`,
        outputToken: `${chainName}:${tokenOut}`,
        inputAmount: amount,
        slippageTolerancePercentage: slippage,
        validate: getGasEstimate,
        feePercentage: 0,
        partner: process.env.FEE_RECEIVER
    })

    try {
        const response = await axios.get(`https://api.portals.fi/v2/portal?${params}`, {
            timeout: 6000,
            headers: { Authorization: `${process.env.PORTALFI_API_KEY}` }
        })
        return response.data
    } catch (error) {
        console.log("portalfi swap error", error)
        return null
    }
}

// This function queries the portalfi protocol and returns the quote amount out. The sender and receiver should be the same if you want to get the quote amount out.
export const getPortalfiQuote = async (chainId: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string) => {
    if (sender != receiver) return null
    if (tokenOut == process.env.ETH_ADDRESS_ENSO) { tokenOut = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
    if (tokenIn == process.env.ETH_ADDRESS_ENSO) { tokenIn = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
    const chainName = getChainName(chainId)
    const params = qs.stringify({
        inputToken: `${chainName}:${tokenIn}`,
        outputToken: `${chainName}:${tokenOut}`,
        inputAmount: amount
    })

    try {
        const response = await axios.get(`https://api.portals.fi/v2/portal/estimate?${params}`, {
            headers: { Authorization: `${process.env.PORTALFI_API_KEY}` }
        })
        return response.data
    } catch (error) {
        console.log("portalfi quote error", error)
        return null
    }
}