import axios from "axios"
import { getChainName } from "../utils/utils";


export const getKyberSwapData = async (tokenIn: string,
    tokenOut: string,
    amount: string,
    chainId: number,
    from: string,
    slippage: number) => {
    try {

        if (tokenIn.localeCompare(process.env.ETH_ADDRESS_ENSO || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", 'en', { sensitivity: 'base' }) == 0) tokenIn = process.env.NATIVETOKEN_KYBERSWAP || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

        if (tokenOut.localeCompare(process.env.ETH_ADDRESS_ENSO || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", 'en', { sensitivity: 'base' }) == 0) tokenOut = process.env.NATIVETOKEN_KYBERSWAP || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

        const chainName = getChainName(chainId);



        const response = await axios.get(`https://aggregator-api.kyberswap.com/${chainName}/route/encode?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amount}&to=${from}&slippageTolerance=${slippage * 100}`, {
            timeout: 6000,
            headers: {
                "x-client-id": process.env.KYBERSWAP_KEY,
            },
        });



        return response.data
    } catch (err) {
        console.log("kyberswap error", err)
        return null
    }
}