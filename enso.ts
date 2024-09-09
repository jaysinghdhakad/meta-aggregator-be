import axios from "axios";
import qs from "qs";
import 'dotenv/config'

export const getEnsoQuote = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string) => {
    console.log({slippage, amount, tokenIn, tokenOut, sender})
    const params = qs.stringify({
        chainId: process.env.CHAIN_ID,
        fromAddress: sender,
        spender:sender,
        amountIn: [amount.toString()],
        tokenIn: [tokenIn],
        tokenOut: [tokenOut],
        slippage: (slippage * 100).toString()
    })
    try {
        const response = await axios.get(`https://api.enso.finance/api/v1/shortcuts/route?${params}`, {
            headers: {
                accept: "application/json",
                content: "application/json",
                Authorization: process.env.ENSO_API_KEY
            }
        })
        console.log("responseEnso:", response.data)

        return response.data
    } catch (error) {
        return null
    }
}