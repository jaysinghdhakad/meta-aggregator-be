import { getPortalfiSwap, getPortalfiQuote } from "../aggregators/portalfi";
import { getEnsoSwap } from "../aggregators/enso";
import { getBarterAmountAndSwap } from "../aggregators/barter";
import { generateSimulationData, checkExecutionNotReverted } from "../simulations/simulation";
import { getMinAmountOut, fetchPriceFromPortals, calculatePriceImpactPercentage, getChainName, getSwapContract, generateSwapData } from "../utils/utils";
export const sortOrder = async (chainID: number, slippage: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string) => {
  const isEth = tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const swapContract = getSwapContract(chainID) || ""

  // Get quotes and run simulations for all protocols
  const [portalfiResult, ensoResult, barterResult, tokenPriceData, portalfiQuote] = await Promise.all([
    getPortalfiSwap(chainID, slippage, amount, tokenIn, tokenOut, swapContract, swapContract, false)
      .then(async (portalfi) => {
        if (!portalfi) return null;
        const to = portalfi.tx.to
        const data = portalfi.tx.data

        const minAmountOut = portalfi.context.minOutputAmount;
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID) || ""
        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, swapContract, swapData, isEth
        );
        const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        return { quote: portalfi, simulationPassed, swapData: swapData };
      }),
    getEnsoSwap(chainID, slippage, amount, tokenIn, tokenOut, swapContract, swapContract)
      .then(async (enso) => {
        if (!enso) return null;
        const to = enso.tx.to
        const data = enso.tx.data
        const minAmountOut = getMinAmountOut(enso.amountOut, slippage);
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, true, chainID,) || ""

        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, swapContract, swapData, isEth
        );
        const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        return { quote: enso, simulationPassed, swapData: swapData };
      }),
    getBarterAmountAndSwap(slippage, amount, tokenIn, tokenOut, swapContract)
      .then(async (barter) => {
        if (!barter) return null;

        const to = barter.to
        const data = barter.data
        const minAmountOut = getMinAmountOut(barter.route.outputAmount, slippage);
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID) || ""
        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, swapContract, swapData, isEth
        );
        console.log("barter simulation data", simulationData)
        const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        return { quote: barter, simulationPassed, swapData: swapData  };
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
    console.log("here in the portalfi")
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
      to: swapContract,
      data: portalfiResult.swapData,
      value: portalfiResult.quote.tx.value,
      amountOut: portalfiQuote.outputAmount,
      minAmountOut: portalfiResult.quote.context.minOutputAmount,
      gasEstimate: portalfiResult.simulationPassed.gas,
      simulationStatus: portalfiResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  if (ensoResult && ensoResult.simulationPassed.status) {
    console.log("here in the enso")
    const minAmountOut = getMinAmountOut(ensoResult.quote.amountOut, slippage);
    let priceImpactPercentage;
    if (ensoResult.quote.priceImpact == null) {
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
      to: swapContract,
      data: ensoResult.swapData,
      value: ensoResult.quote.tx.value,
      amountOut: ensoResult.quote.amountOut,
      minAmountOut: minAmountOut,
      gasEstimate: ensoResult.quote.gas,
      simulationStatus: ensoResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  if (barterResult && barterResult.simulationPassed.status) {
    console.log("here in the barter")
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
      to: swapContract,
      data: barterResult.swapData,
      value: barterResult.quote.value,
      amountOut: barterResult.quote.route.outputAmount,
      minAmountOut: minAmountOut,
      gasEstimate: barterResult.quote.route.gasEstimation,
      simulationStatus: barterResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  // Sort quotes in descending order based on amountOut
  quotes.sort((a, b) => b.amountOut - a.amountOut);

  return {quotes : quotes, approvalAddress: swapContract}
}