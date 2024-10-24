import axios from "axios"
import qs from "qs"

export const getZeroExV2SwapData = async (
    tokeIn: string,
    tokenOut: string,
    amount: string,
    chainId: number,
    taker: string,
    slippage: number,
): Promise<any> => {
    try {
        const params = {
            chainId: chainId,
            sellToken: tokeIn,
            buyToken: tokenOut,
            sellAmount: amount,
            taker: taker,
            slippage: slippage * 100,
            // swapFeeBps: process.env.ZEROX_FEE,
            // swapFeeRecipient: process.env.FEE_RECEIVER
        }

        const response = await axios.get(`https://api.0x.org/swap/allowance-holder/quote?${qs.stringify(params)}`, {
            timeout: 6000,
            headers: {
                '0x-api-key': process.env.ZEROEX_API_KEY,
                "0x-version": "v2"
            },
        })

        return response.data
    } catch (e) {
        console.log(" quote error", e);
        return null
    }
}