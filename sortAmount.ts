import { getPortalfiQuote } from "./portalfi";
import { getEnsoQuote } from "./enso";
import { getBarterQuote } from "./barter";
import { findMax,getApprovalAddressForChain } from "./utils";
import { ENSO_PROTOCOL, PORTALFI_PROTOCOL, BARTER_PROTOCOL } from "./protocol";

// This function queries all protocols and returns the best amount out. Also give the approval address for the best quote.
export async function getAmountOut(chainID: number, amount: number, tokenIn: string, tokenOut: string, sender: string, receiver: string) {
    // query all protocols for the quote output amount.
    const [portalfi, enso, barter] = await Promise.all([
        getPortalfiQuote(chainID, amount, tokenIn, tokenOut, sender, receiver),
        getEnsoQuote(chainID, amount, tokenIn, tokenOut),
        getBarterQuote(amount, tokenIn, tokenOut)
    ])

    const portalfiAmount = portalfi ? portalfi.context.outputAmount : 0
    const ensoAmount = enso ? enso.amountOut : 0
    const barterAmount = barter ? barter.outputAmount : 0

    if(portalfiAmount === 0 && ensoAmount === 0 && barterAmount === 0){
        return null
    }

    console.log("portalfiAmount", portalfiAmount)
    console.log("ensoAmount", ensoAmount)
    console.log("barterAmount", barterAmount)

    // find the max amount out of all quotes
    const maxAmount = findMax(portalfiAmount, ensoAmount, barterAmount)

    // return the quote with the max amount out
    if (maxAmount === portalfiAmount) {
        const approvalAddress = getApprovalAddressForChain(PORTALFI_PROTOCOL, chainID)
        return {
            protocol: "portalfi",
            amountOut: portalfiAmount,
            approvalAddress: approvalAddress
        }
    } else if (maxAmount === ensoAmount) {
        const approvalAddress = getApprovalAddressForChain(ENSO_PROTOCOL, chainID)
        return {
            protocol: "enso",
            amountOut: ensoAmount,
            approvalAddress: approvalAddress
        }
    } else {
        const approvalAddress = getApprovalAddressForChain(BARTER_PROTOCOL, chainID)
        return {
            protocol: "barter",
            amountOut: barterAmount,
            approvalAddress: approvalAddress
        }
    }
}