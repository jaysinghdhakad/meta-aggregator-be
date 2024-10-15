import { getPortalfiSwap , getPortalfiQuote} from "../aggregators/portalfi";
import { getEnsoSwap } from "../aggregators/enso";
import { getBarterAmountAndSwap } from "../aggregators/barter";
import { generateSimulationData, checkExecutionNotReverted } from "../simulations/simulation";
import { getMinAmountOut, fetchPriceFromPortals, calculatePriceImpactPercentage, getChainName } from "../utils/utils";
export const sortOrder = async (chainID: number, slippage: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string) => {
  const isEth = tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  // Get quotes and run simulations for all protocols
  const [portalfiResult, ensoResult, barterResult, tokenPriceData, portalfiQuote] = await Promise.all([
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
      }),
    fetchPriceFromPortals([tokenIn, tokenOut], getChainName(chainID) || 'base'),
    getPortalfiQuote(chainID, amount, tokenIn, tokenOut, sender, receiver)
  ]);



  console.log("portalsSimulationPassed", portalfiResult?.simulationPassed.status)
  console.log("ensoSimulationPassed", ensoResult?.simulationPassed.status)
  console.log("barterSimulationPassed", barterResult?.simulationPassed.status)

  const quotes = [];
  let priceImpactPercentage
  if (portalfiResult && portalfiResult.simulationPassed.status) {
    if (tokenPriceData != null && tokenPriceData.length == 2) {
      const tokenInPriceData = tokenPriceData.find(token => token.address === tokenIn.toLowerCase());
      const tokenOutPriceData = tokenPriceData.find(token => token.address === tokenOut.toLowerCase());
      priceImpactPercentage = calculatePriceImpactPercentage(portalfiQuote.outputAmount, amount, tokenInPriceData?.price ?? 0,
        tokenOutPriceData?.price ?? 0,
        tokenInPriceData?.decimals ?? 18,
        tokenOutPriceData?.decimals ?? 18)
    }
    quotes.push({
      protocol: "portalfi",
      to: portalfiResult.quote.tx.to,
      data: portalfiResult.quote.tx.data,
      value: portalfiResult.quote.tx.value,
      amountOut: portalfiQuote.outputAmount,
      approvalAddress: portalfiResult.quote.tx.to,
      minAmountOut: portalfiResult.quote.context.minOutputAmount,
      gasEstimate: portalfiResult.simulationPassed.gas,
      simulationStatus: portalfiResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  if (ensoResult && ensoResult.simulationPassed.status) {
    const minAmountOut = getMinAmountOut(ensoResult.quote.amountOut, slippage);
    let priceImpactPercentage;
    if(ensoResult.quote.priceImpact == null) {
      if (tokenPriceData != null && tokenPriceData.length == 2) {
        const tokenInPriceData = tokenPriceData.find(token => token.address.toLowerCase() === tokenIn.toLowerCase());
        const tokenOutPriceData = tokenPriceData.find(token => token.address.toLowerCase() === tokenOut.toLowerCase());
        priceImpactPercentage = calculatePriceImpactPercentage(ensoResult.quote.amountOut, amount, tokenInPriceData?.price ?? 0,
          tokenOutPriceData?.price ?? 0,
          tokenInPriceData?.decimals ?? 18,
          tokenOutPriceData?.decimals ?? 18)
      }
    } else {
      priceImpactPercentage = ensoResult.quote.priceImpact / 100
    }
    quotes.push({
      protocol: "enso",
      to: ensoResult.quote.tx.to,
      data: ensoResult.quote.tx.data,
      value: ensoResult.quote.tx.value,
      amountOut: ensoResult.quote.amountOut,
      approvalAddress: ensoResult.quote.tx.to,
      minAmountOut: minAmountOut,
      gasEstimate: ensoResult.quote.gas,
      simulationStatus: ensoResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  if (barterResult && barterResult.simulationPassed.status) {
    const minAmountOut = getMinAmountOut(barterResult.quote.route.outputAmount, slippage);
    if (tokenPriceData != null && tokenPriceData.length == 2) {
      const tokenInPriceData = tokenPriceData.find(token => token.address.toLowerCase() === tokenIn.toLowerCase());
      const tokenOutPriceData = tokenPriceData.find(token => token.address.toLowerCase() === tokenOut.toLowerCase());
      priceImpactPercentage = calculatePriceImpactPercentage(barterResult.quote.route.outputAmount, amount, tokenInPriceData?.price ?? 0,
        tokenOutPriceData?.price ?? 0,
        tokenInPriceData?.decimals ?? 18,
        tokenOutPriceData?.decimals ?? 18)
    }
    quotes.push({
      protocol: "barter",
      to: barterResult.quote.to,
      data: barterResult.quote.data,
      value: barterResult.quote.value,
      amountOut: barterResult.quote.route.outputAmount,
      approvalAddress: barterResult.quote.to,
      minAmountOut: minAmountOut,
      gasEstimate: barterResult.quote.route.gasEstimation,
      simulationStatus: barterResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  // Sort quotes in descending order based on amountOut
  quotes.sort((a, b) => b.amountOut - a.amountOut);
  // add the quotes that failed simulation with message "Increase slippage for swap"
  if (ensoResult && !ensoResult.simulationPassed.status && ensoResult.simulationPassed.message == "Increase slippage for swap") {
    quotes.push({
      protocol: "enso",
      message: "Increase slippage for swap",
      amountOut: ensoResult.quote.amountOut,
      to: ensoResult.quote.tx.to,
      data: ensoResult.quote.tx.data,
      value: ensoResult.quote.tx.value,
      minAmountOut: ensoResult.quote.context.minOutputAmount,
      gasEstimate: ensoResult.quote.gas,
      approvalAddress: ensoResult.quote.tx.to,
      simulationStatus: ensoResult.simulationPassed.status,
      priceImpactPercentage: 0
    })
  }

  if (barterResult && !barterResult.simulationPassed.status && barterResult.simulationPassed.message == "Increase slippage for swap") {
    quotes.push({
      protocol: "barter",
      message: "Increase slippage for swap",
      amountOut: barterResult.quote.route.outputAmount,
      to: barterResult.quote.to,
      data: barterResult.quote.data,
      value: barterResult.quote.value,
      minAmountOut: barterResult.quote.route.outputAmount,
      gasEstimate: barterResult.quote.route.gasEstimation,
      approvalAddress: barterResult.quote.to,
      simulationStatus: barterResult.simulationPassed.status,
      priceImpactPercentage: 0
    })
  }

  if (portalfiResult && !portalfiResult.simulationPassed.status && portalfiResult.simulationPassed.message == "Increase slippage for swap") {
    quotes.push({
      protocol: "portalfi",
      message: "Increase slippage for swap",
      amountOut: portalfiResult.quote.context.outputAmount,
      to: portalfiResult.quote.tx.to,
      data: portalfiResult.quote.tx.data,
      value: portalfiResult.quote.tx.value,
      minAmountOut: portalfiResult.quote.context.minOutputAmount,
      gasEstimate: portalfiResult.quote.gas,
      approvalAddress: portalfiResult.quote.tx.to,
      simulationStatus: portalfiResult.simulationPassed.status,
      priceImpactPercentage: 0
    })
  }

  return quotes
}