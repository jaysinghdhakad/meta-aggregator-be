import axios from "axios";
import 'dotenv/config'
import { getMinAmountOut } from "./utils"
import BigNumber from "bignumber.js";

// This function queries the barter protocol and returns the swap data.
export const getBarterSwap = async (slippage: number, amount: string, tokenIn: string, tokenOut: string, minOutputAmount: number, receipt: string) => {
    try {
        if (tokenOut == process.env.ETH_ADDRESS_ENSO) { tokenOut = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
        if (tokenIn == process.env.ETH_ADDRESS_ENSO) { tokenIn = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
        const amountOut = getMinAmountOut(minOutputAmount.toString(), slippage)
        const fee = BigNumber(amount).times(process.env.BARTER_FEE || 0.1).div(100).toFixed(0)
        const swapRequestPayload = {
            'sourceFee': {
                'recipient': process.env.FEE_RECEIVER,
                'amount': fee.toString(),
            },
            'recipient': receipt,
            'amount': amount.toString(),
            'target': tokenOut,
            'source': tokenIn,
            'targetTokenMinReturn': `${amountOut}`,
            'deadline': `${Math.floor(Date.now() / 1000 + 300)}`
        }

        const swapResponse = await axios.post("https://velvet.base.barterswap.xyz/swap", swapRequestPayload, {
            headers: {
                "Authorization": process.env.BARTER_API_KEY,

            }
        }
        )

        return swapResponse.data

    } catch (error) {
        console.log("barter swap error", error)
        return null
    }
}

// This function queries the barter protocol and returns the quote.
export const getBarterQuote = async (amount: string, tokenIn: string, tokenOut: string) => {
    try {
        if (tokenOut == process.env.ETH_ADDRESS_ENSO) { tokenOut = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
        if (tokenIn == process.env.ETH_ADDRESS_ENSO) { tokenIn = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }

        const routeRequestPayload = {
            'amount': amount.toString(),
            'target': tokenOut,
            'source': tokenIn
        }

        const routeData = await axios.post("https://velvet.base.barterswap.xyz/getSwapRoute", routeRequestPayload, {
            headers: {
                "Authorization": process.env.BARTER_API_KEY,
            }
        })
        // return null if the status is not normal
        if (routeData.data.status != "Normal") return null

        return routeData.data
    } catch (error) {
        console.log("barter quote error", error)
        return null
    }
}

// This function queries the barter protocol and returns the amount and swap data.
export const getBarterAmountAndSwap = async (slippage: number, amount: string, tokenIn: string, tokenOut: string, receiver: string) => {
    try {
        console.log("barter params", {
            amount: amount,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            receiver: receiver,
            slippage: slippage,
            fee: process.env.BARTER_FEE
        })
        const quote = await getBarterQuote(amount, tokenIn, tokenOut)
        if (!quote) return null

        const swapData = await getBarterSwap(slippage, amount, tokenIn, tokenOut, quote.outputWithGasAmount, receiver)
        return swapData

    } catch (error) {
        return null
    }
}