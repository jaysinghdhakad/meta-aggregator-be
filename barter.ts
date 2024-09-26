import axios from "axios";
import 'dotenv/config'
import { getMinAmountOut } from "./utils"
// This function queries the barter protocol and returns the swap data.
export const getBarterSwap = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, minOutputAmount: number, receipt: string) => {
    try {
        if (tokenOut == process.env.ETH_ADDRESS_ENSO) { tokenOut = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
        if (tokenIn == process.env.ETH_ADDRESS_ENSO) { tokenIn = process.env.ETH_ADDRESS || "0x0000000000000000000000000000000000000000" }
        const amountOut = getMinAmountOut(minOutputAmount.toString(), slippage)
        const swapRequestPayload =
        {
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
        return null
    }

}

// This function queries the barter protocol and returns the quote.
export const getBarterQuote = async (amount: number, tokenIn: string, tokenOut: string) => {
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
        return null
    }
}

// This function queries the barter protocol and returns the amount and swap data.
export const getBarterAmountAndSwap = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, receiver: string) => {
    try {
        const quote = await getBarterQuote(amount, tokenIn, tokenOut)
        if (!quote) return null

        const swapData = await getBarterSwap(slippage, amount, tokenIn, tokenOut, quote.outputWithGasAmount, receiver)
        return swapData

    } catch (error) {
        return null
    }
}