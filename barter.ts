import axios from "axios";
import 'dotenv/config'


export const getBarterQuote = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string) => {

    try {
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



        if (routeData.data.status != "Normal") return null


        const swapRequestPayload =
        {
            'recipient': sender,
            'amount': amount.toString(),
            'target': tokenOut,
            'source': tokenIn,
            'targetTokenMinReturn': `${Math.ceil((routeData.data.outputWithGasAmount / 100) * (100 - slippage))}`,
            'deadline': `${Math.floor(Date.now() / 1000 + 300)}`
        }

        const swapResponse = await axios.post("https://velvet.base.barterswap.xyz/swap", swapRequestPayload, {
            headers: {
                "Authorization": process.env.BARTER_API_KEY,

            }
        }
        )
        console.log("responseBarter:", swapResponse.data)

        return swapResponse.data

    } catch (error) {
        return null
    }

}