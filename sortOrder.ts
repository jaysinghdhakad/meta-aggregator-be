import { getPortalfiSwap } from "./portalfi";
import { getEnsoSwap } from "./enso";
import { getBarterAmountAndSwap } from "./barter";
import { getApprovalAddressForChain, getMinAmountOut } from "./utils";
import { ENSO_PROTOCOL } from "./protocol";
import { generateSimulationData, checkExecutionNotReverted } from "./simulation";

export const sortOrder = async (chainID: number, slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string, receiver: string) => {
  const isEth = tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  // Get quotes and run simulations for all protocols
  const [portalfiResult, ensoResult, barterResult] = await Promise.all([
    getPortalfiSwap(chainID, slippage, amount, tokenIn, tokenOut, sender, receiver, false)
      .then(async (portalfi) => {
        if (!portalfi) return null;
        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, portalfi.tx.to, portalfi.tx.data, isEth
        );
        const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        return { quote: portalfi, simulationPassed };
      }),
    getEnsoSwap(chainID, slippage, amount, tokenIn, tokenOut, sender, receiver)
      .then(async (enso) => {
        if (!enso) return null;
        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, enso.tx.to, enso.tx.data, isEth
        );
        const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        return { quote: enso, simulationPassed };
      }),
    getBarterAmountAndSwap(slippage, amount, tokenIn, tokenOut, receiver)
      .then(async (barter) => {
        if (!barter) return null;
        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, barter.to, barter.data, isEth
        );
        const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        return { quote: barter, simulationPassed };
      })
  ]);

  console.log("portalsSimulationPassed", portalfiResult?.simulationPassed.status)
  console.log("ensoSimulationPassed", ensoResult?.simulationPassed.status)
  console.log("barterSimulationPassed", barterResult?.simulationPassed.status)

  const quotes = [];

  if (portalfiResult && portalfiResult.simulationPassed.status) {
    quotes.push({
      protocol: "portalfi",
      to: portalfiResult.quote.tx.to,
      data: portalfiResult.quote.tx.data,
      value: portalfiResult.quote.tx.value,
      amountOut: portalfiResult.quote.context.outputAmount,
      approvalAddress: portalfiResult.quote.tx.to,
      minAmountOut: portalfiResult.quote.context.minOutputAmount,
      gasEstimate: portalfiResult.simulationPassed.gas,
      simulationStatus: portalfiResult.simulationPassed.status
    });
  }

  if (ensoResult && ensoResult.simulationPassed.status) {
    const minAmountOut = getMinAmountOut(ensoResult.quote.amountOut, slippage);
    quotes.push({
      protocol: "enso",
      to: ensoResult.quote.tx.to,
      data: ensoResult.quote.tx.data,
      value: ensoResult.quote.tx.value,
      amountOut: ensoResult.quote.amountOut,
      approvalAddress: ensoResult.quote.tx.to,
      minAmountOut: minAmountOut,
      gasEstimate: ensoResult.quote.gas,
      simulationStatus: ensoResult.simulationPassed.status
    });
  }

  if (barterResult && barterResult.simulationPassed.status) {
    const minAmountOut = getMinAmountOut(barterResult.quote.route.outputAmount, slippage);
    quotes.push({
      protocol: "barter",
      to: barterResult.quote.to,
      data: barterResult.quote.data,
      value: barterResult.quote.value,
      amountOut: barterResult.quote.route.outputAmount,
      approvalAddress: barterResult.quote.to,
      minAmountOut: minAmountOut,
      gasEstimate: barterResult.quote.route.gasEstimation,
      simulationStatus: barterResult.simulationPassed.status
    });
  }

  // Sort quotes in descending order based on amountOut
  quotes.sort((a, b) => b.amountOut - a.amountOut);
  console.log(quotes)
  return quotes
}