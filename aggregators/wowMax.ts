import axios from "axios"
import qs from "qs"
import { getDecimalsSymbol } from "../utils/utils";
import BigNumber from "bignumber.js";

export const getWowMaxSwapData = async (
    tokenIn: string,
    tokenOut: string,
    amount: string,
    chainId: number,
    slippage: number,
): Promise<any> => {
    try {
        let amountIn = amount;
        if (tokenIn != process.env.ETH_ADDRESS_ENSO) {
            const tokenInDecimals = await getDecimalsSymbol(chainId, tokenIn)

            amountIn = BigNumber(amount).dividedBy(Math.pow(10, Number(tokenInDecimals))).toFixed(Number(tokenInDecimals))
        } else {
            amountIn = BigNumber(amount).dividedBy(Math.pow(10, Number(18))).toFixed(Number(18))
            tokenIn = process.env.ETH_ADDRESS || "";

        }

        const params = {
            from: tokenIn,
            to: tokenOut,
            amount: amountIn,
            slippage: slippage,
        }


        const response = await axios.get(`https://api-gateway.wowmax.exchange/chains/${chainId}/swap?${qs.stringify(params)}`, {
            timeout: 6000,
        })
        return response.data
    } catch (e) {
        console.log("quote error", e);
        return null
    }
}