import { getPortalfiSwap } from "./portalfi";
import { getEnsoSwap } from "./enso";
import { getBarterSwap } from "./barter";
import { getApprovalAddressForChain,getMinAmountOut } from "./utils";

// This function queries the protocol sent in by the user and returns the swap data.
export async function getSwapData(chainId: number, protocol: string, slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string, receiver: string,amountOut: number) {
    if (protocol === "portalfi") {
      // query the protocol for the swap data
      const response = await getPortalfiSwap(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver, true);
      if(response == null) return null
      // return the swap data
      return {
        protocol: "portalfi",
        to: response.tx.to,
        data: response.tx.data,
        value: response.tx.value,
        amountOut: response.context.outputAmount,
        approvalAddress: response.tx.to,
        minAmountOut: response.context.minOutputAmount,
        gasEstimate: response.context.gasLimit
      }
    } else if (protocol === "enso") {
      // query the protocol for the swap data
      const response = await getEnsoSwap(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver);
      if(response == null) return null

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
        gasEstimate: response.gas
      }
    } else if (protocol === "barter") {
      // query the protocol for the swap data
      const response = await getBarterSwap(slippage, amount, tokenIn, tokenOut, amountOut, receiver);
      if(response == null) return null

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
        gasEstimate: response.route.gasEstimation
      }
    }
  }
  