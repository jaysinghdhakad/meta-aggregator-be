import { getPortalfiSwap } from "./protalfi";
import { getEnsoSwap } from "./enso";
import { getBarterAmountAndSwap } from "./barter";
import { findMax, getApprovalAddressForChain } from "./utils";
import { ENSO_PROTOCOL } from "./protocol";

// This function queries all protocols and returns the best quote with swap data.
export const sortOrder = async (chainID: number, slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string, receiver: string) => {
  // get quotes from all protocols
  const [portalfi, enso, barter] = await Promise.all([
    getPortalfiSwap(chainID, slippage, amount, tokenIn, tokenOut, sender, receiver, false),
    getEnsoSwap(chainID, slippage, amount, tokenIn, tokenOut, sender, receiver),
    getBarterAmountAndSwap(slippage, amount, tokenIn, tokenOut, receiver)
  ])

  const portalfiAmount = portalfi ? portalfi.context.outputAmount : 0
  const ensoAmount = enso ? enso.amountOut : 0
  const barterAmount = barter ? barter.route.outputAmount : 0

  if (portalfiAmount === 0 && ensoAmount === 0 && barterAmount === 0) {
    return null
  }

  // find the max amount out of all quotes
  const maxAmount = findMax(portalfiAmount, ensoAmount, barterAmount)


  console.log("maxAmount", maxAmount)
  console.log("portalfiAmount", portalfiAmount)
  console.log("ensoAmount", ensoAmount)
  console.log("barterAmount", barterAmount)

  // return the quote with the max amount out
  if (maxAmount === portalfiAmount) {
    return {
      protocol: "portalfi",
      to: portalfi.tx.to,
      data: portalfi.tx.data,
      value: portalfi.tx.value,
      amountOut: portalfiAmount,
      approvalAddress: portalfi.tx.to,
      minAmountOut: portalfi.context.minOutputAmount
    }
  } else if (maxAmount === ensoAmount) {
    const minAmountOut = Math.floor(ensoAmount - (ensoAmount * (slippage / 100)))
    const approvalAddress = getApprovalAddressForChain(ENSO_PROTOCOL, chainID)
    return {
      protocol: "enso",
      to: enso.tx.to,
      data: enso.tx.data,
      value: enso.tx.value,
      amountOut: ensoAmount,
      approvalAddress: approvalAddress,
      minAmountOut: minAmountOut,
      gasEstimate: enso.gas
    }
  } else {
    const minAmountOut = Math.floor(barterAmount - (barterAmount * (slippage / 100)))
    return {
      protocol: "barter",
      to: barter.to,
      data: barter.data,
      value: barter.value,
      amountOut: barterAmount,
      approvalAddress: barter.to,
      minAmountOut: minAmountOut,
      gasEstimate: barter.route.gasEstimation
    }
  }

}