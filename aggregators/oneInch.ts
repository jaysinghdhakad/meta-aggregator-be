import axios from "axios"
import qs from "qs"

export const getOneInchSwapData = async (
    tokenIn: string,
    tokenOut: string,
    amount: string,
    chainId: number,
    from: string,
    slippage: number,
  ): Promise<any> => {
    try {
  
      const params = {
        src: tokenIn,
        dst: tokenOut,
        amount: amount,
        from: from,
        slippage: slippage, 
        disableEstimate: true,
        includeGas: false,
      }
  
      const response = await axios.get(`https://api.1inch.dev/swap/v6.0/${chainId}/swap?${qs.stringify(params)}`, {
        timeout: 6000,
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      })
  
      return response.data
    } catch (e) {
      console.log("oneInch quote error", e)
      return null
    }
  }