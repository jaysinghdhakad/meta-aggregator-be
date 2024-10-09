import axios from "axios";
import qs from "qs";
import 'dotenv/config'

// This function queries the enso protocol and returns the swap data.
export const getEnsoSwap = async (chainID: number, slippage: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string) => {
    const params = qs.stringify({
        chainId: chainID,
        fromAddress: sender,
        spender: sender,
        amountIn: [amount.toString()],
        tokenIn: [tokenIn],
        tokenOut: [tokenOut],
        slippage: (slippage * 100).toString(),
        receiver: receiver,
        fee: process.env.ENSO_FEE,
        feeReceiver: process.env.FEE_RECEIVER
    })

    try {
        const response = await axios.get(`https://api.enso.finance/api/v1/shortcuts/route?${params}`, {
            headers: {
                accept: "application/json",
                content: "application/json",
                Authorization: process.env.ENSO_API_KEY
            }
        })

        return response.data
    } catch (error) {
        console.log("enso swap error", error)
        return null
    }
}

// This function queries the enso protocol and returns the quote amount out.
export const getEnsoQuote = async (chainID: number, amount: string, tokenIn: string, tokenOut: string) => {
    const params = qs.stringify({
        chainId: chainID,
        amountIn: [amount.toString()],
        tokenIn: [tokenIn],
        tokenOut: [tokenOut],
    })

    try {
        const response = await axios.get(`https://api.enso.finance/api/v1/shortcuts/quote?${params}`, {
            headers: {
                accept: "application/json",
                content: "application/json",
                Authorization: process.env.ENSO_API_KEY
            }
        })
        return response.data
    }
    catch (error) {
        console.log("enso quote error", error)
        return null
    }
}

