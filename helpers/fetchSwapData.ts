import { getPortalfiSwap } from "../aggregators/portalfi";
import { getEnsoSwap } from "../aggregators/enso";
import { getBarterSwap } from "../aggregators/barter";
import { getApprovalAddressForChain, getMinAmountOut, calculatePriceImpactPercentage, fetchTokenPrice } from "../utils/utils";

// This function queries the protocol sent in by the user and returns the swap data.
export async function getSwapData(chainId: number, protocol: string, slippage: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string, amountOut: string) {
  if (protocol === "portalfi") {
    // query the protocol for the swap data
    const [portalfiResponse, tokenInPriceData, tokenOutPriceData] = await Promise.all([getPortalfiSwap(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver, true), fetchTokenPrice(tokenIn, chainId), fetchTokenPrice(tokenOut, chainId)]);
    if (portalfiResponse == null) return null
    // return the swap data
    return {
      protocol: "portalfi",
      to: portalfiResponse.tx.to,
      data: portalfiResponse.tx.data,
      value: portalfiResponse.tx.value,
      amountOut: portalfiResponse.context.outputAmount,
      approvalAddress: portalfiResponse.tx.to,
      minAmountOut: portalfiResponse.context.minOutputAmount,
      gasEstimate: portalfiResponse.context.gasLimit,
      priceImpactPercentage: calculatePriceImpactPercentage(portalfiResponse.context.minOutputAmount, amount, tokenInPriceData.usdPrice, tokenOutPriceData.usdPrice, tokenInPriceData.tokenDecimals  , tokenOutPriceData.tokenDecimals)
    }
  } else if (protocol === "enso") {
    // query the protocol for the swap data
    const [response, tokenInPriceData, tokenOutPriceData] = await Promise.all([getEnsoSwap(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver), fetchTokenPrice(tokenIn, chainId), fetchTokenPrice(tokenOut, chainId)]);
    if (response == null) return null

    const ensoAmount = response.amountOut;
    const minAmountOut = getMinAmountOut(ensoAmount, slippage);
    // get the approval address for the protocol for chainId
    const approvalAddress = getApprovalAddressForChain(protocol, chainId);
    // return the swap data
    return {
      protocol: "enso",
      to: response.tx.to,
      data: response.tx.data,
      value: response.tx.value,
      amountOut: ensoAmount,
      approvalAddress: approvalAddress,
      minAmountOut: minAmountOut,
      gasEstimate: response.gas,
      priceImpactPercentage: calculatePriceImpactPercentage(minAmountOut, amount, tokenInPriceData.usdPrice, tokenOutPriceData.usdPrice, tokenInPriceData.tokenDecimals  , tokenOutPriceData.tokenDecimals)
    }
  } else if (protocol === "barter") {
    // query the protocol for the swap data
    const [response, tokenInPriceData, tokenOutPriceData] = await Promise.all([getBarterSwap(slippage, amount, tokenIn, tokenOut, amountOut, receiver), fetchTokenPrice(tokenIn, chainId), fetchTokenPrice(tokenOut, chainId)]);
    if (response == null) return null

    const barterAmount = response.route.outputAmount;
    const minAmountOut = getMinAmountOut(barterAmount, slippage);
    // return the swap data
    return {
      protocol: "barter",
      to: response.to,
      data: response.data,
      value: response.value,
      amountOut: barterAmount,
      approvalAddress: response.to,
      minAmountOut: minAmountOut,
      gasEstimate: response.route.gasEstimation,
      priceImpactPercentage: calculatePriceImpactPercentage(minAmountOut, amount, tokenInPriceData.usdPrice, tokenOutPriceData.usdPrice, tokenInPriceData.tokenDecimals  , tokenOutPriceData.tokenDecimals)
    }
  }
}
