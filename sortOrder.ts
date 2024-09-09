import { getPortalfiQuote } from "./protalfi";
import { getEnsoQuote } from "./enso";
import { getBarterQuote } from "./barter";

export const sortOrder = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string) => {
    const [portalfi, enso, barter] = Promise.all([getPortalfiQuote(slippage, amount, tokenIn, tokenOut, sender), getEnsoQuote(slippage, amount, tokenIn, tokenOut, sender), getBarterQuote(slippage, amount, tokenIn, tokenOut, sender)])

    const portalfiAmount = portalfi.data.amountOut
    const ensoAmount = enso.data.amountOut
    const barterAmount = barter.data.outputAmount

}