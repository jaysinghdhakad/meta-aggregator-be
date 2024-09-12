import axios from "axios";
import qs from "qs";
import 'dotenv/config'

export const getPortalfiQuote = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string) => {

    const params = qs.stringify({
        sender: sender,
        inputToken: `${process.env.CHAIN_NAME}:${tokenIn}`,
        outputToken: `${process.env.CHAIN_NAME}:${tokenOut}`,
        inputAmount: amount,
        slippageTolerancePercentage: slippage,
        validate: false
    })

    try {
        const response = await axios.get(`https://api.portals.fi/v2/portal?${params}`, {
            headers: { Authorization: `${process.env.PORTALFI_API_KEY}` }
        })


        return response.data
    } catch (error) {
        return null
    }
}