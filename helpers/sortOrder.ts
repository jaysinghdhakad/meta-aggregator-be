import { getPortalfiSwap, getPortalfiQuote } from "../aggregators/portalfi";
import { getEnsoSwap } from "../aggregators/enso";
import { getBarterAmountAndSwap } from "../aggregators/barter";
import { getZeroExV2SwapData } from "../aggregators/zerox"
import { getWowMaxSwapData } from "../aggregators/wowMax";
import { getKyberSwapData } from "../aggregators/kyberswap";
import { generateSimulationData, checkExecutionNotReverted } from "../simulations/simulation";
import { getMinAmountOut, fetchPriceFromPortals, calculatePriceImpactPercentage, getChainName, getSwapContract, generateSwapData } from "../utils/utils";
import BigNumber from "bignumber.js";
export const sortOrder = async (chainID: number, slippage: number, amount: string, tokenIn: string, tokenOut: string, sender: string, receiver: string, skipSimulation: boolean) => {
  const isEth = tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const swapContract = getSwapContract(chainID, isEth) || ""
  const fromAddress = getSwapContract(chainID, true) || " "


  // Get quotes and run simulations for all protocols
  const [portalfiResult, ensoResult, barterResult, zeroXResults, wowMaxResults, kyberswapData, tokenPriceData, portalfiQuote] = await Promise.all([
    getPortalfiSwap(chainID, slippage, amount, tokenIn, tokenOut, fromAddress, fromAddress, false)
      .then(async (portalfi) => {
        if (!portalfi) return null;

        const to = portalfi.tx.to
        const data = portalfi.tx.data

        const minAmountOut = portalfi.context.minOutputAmount;
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID, isEth) || ""

        let simulationPassed;
        if (!skipSimulation) {
          const simulationData = await generateSimulationData(
            chainID, amount, tokenIn, sender, swapContract, swapData, isEth
          );
          simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        } else {
          simulationPassed = { status: true, gas: 0 }
        }
        return { quote: portalfi, simulationPassed, swapData: swapData };
      }),
    getEnsoSwap(chainID, slippage, amount, tokenIn, tokenOut, fromAddress, fromAddress)
      .then(async (enso) => {
        if (!enso) return null;

        const to = enso.tx.to
        const data = enso.tx.data
        const minAmountOut = getMinAmountOut(enso.amountOut, slippage);
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, true, chainID, isEth) || ""


        let simulationPassed;
        if (!skipSimulation) {
          const simulationData = await generateSimulationData(
            chainID, amount, tokenIn, sender, swapContract, swapData, isEth
          );
          simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        } else {
          simulationPassed = { status: true, gas: 0 }
        }
        return { quote: enso, simulationPassed, swapData: swapData };
      }),
    getBarterAmountAndSwap(slippage, amount, tokenIn, tokenOut, fromAddress)
      .then(async (barter) => {
        if (!barter) return null;

        const to = barter.to
        const data = barter.data
        const minAmountOut = getMinAmountOut(barter.route.outputAmount, slippage);
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID, isEth) || ""

        let simulationPassed;
        if (!skipSimulation) {
          const simulationData = await generateSimulationData(
            chainID, amount, tokenIn, sender, swapContract, swapData, isEth
          );
          simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        } else {
          simulationPassed = { status: true, gas: 0 }
        }
        return { quote: barter, simulationPassed, swapData: swapData };
      }),
    getZeroExV2SwapData(tokenIn, tokenOut, amount, chainID, fromAddress, slippage)
      .then(async (zerox) => {
        if (!zerox) return null;

        const to = zerox.transaction.to;
        const data = zerox.transaction.data;
        const minAmountOut = zerox.minBuyAmount;
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID, isEth) || "";

        let simulationPassed;
        if (!skipSimulation) {
          const simulationData = await generateSimulationData(
            chainID, amount, tokenIn, sender, swapContract, swapData, isEth
          );
          simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        } else {
          simulationPassed = { status: true, gas: 0 }
        }
        return { quote: zerox, simulationPassed, swapData: swapData }
      }),
    // getOneInchSwapData(tokenIn, tokenOut, amount, chainID, swapContract, slippage)
    //   .then(async (oneInch) => {
    //     console.log("oneInch", oneInch)
    //     if (!oneInch) return null;

    //     const to = oneInch.tx.to
    //     const data = oneInch.tx.data
    //     const minAmountOut = getMinAmountOut(oneInch.dstAmount, slippage);
    //     const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID) || "";
    //     const simulationData = await generateSimulationData(
    //       chainID, amount, tokenIn, sender, swapContract, swapData, isEth
    //     );
    //     const simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
    //     return { quote: oneInch, simulationPassed, swapData: swapData }
    //   }),
    getWowMaxSwapData(tokenIn, tokenOut, amount, chainID, slippage)
      .then(async (wowMax) => {
        if (!wowMax) return null;

        const to = wowMax.contract;
        const data = wowMax.data;
        const minAmountOut = getMinAmountOut(wowMax.amountOut[0], slippage);
        const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID, isEth) || "";

        let simulationPassed;
        if (!skipSimulation) {
          const simulationData = await generateSimulationData(
            chainID, amount, tokenIn, sender, swapContract, swapData, isEth
          );
          simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
        } else {
          simulationPassed = { status: true, gas: 0 }
        }
        return { quote: wowMax, simulationPassed, swapData: swapData }
      }),
    getKyberSwapData(tokenIn, tokenOut, amount, chainID, fromAddress, slippage).then(async (kyberswap) => {
      if (!kyberswap) return null;

      const to = kyberswap.routerAddress;
      const data = kyberswap.encodedSwapData;
      const minAmountOut = getMinAmountOut(kyberswap.outputAmount, slippage);
      const swapData = generateSwapData(tokenIn, tokenOut, to, data, amount, minAmountOut, receiver, false, chainID, isEth) || "";

      let simulationPassed;
      if (!skipSimulation) {
        const simulationData = await generateSimulationData(
          chainID, amount, tokenIn, sender, swapContract, swapData, isEth
        );
        simulationPassed = await checkExecutionNotReverted(simulationData, chainID);
      } else {
        simulationPassed = { status: true, gas: 0 }
      }
      return { quote: kyberswap, simulationPassed, swapData: swapData }
    }),
    fetchPriceFromPortals([tokenIn, tokenOut], getChainName(chainID) || 'base'),
    getPortalfiQuote(chainID, amount, tokenIn, tokenOut, sender, receiver)
  ]);



  console.log("portalsSimulationPassed", portalfiResult?.simulationPassed.status)
  console.log("ensoSimulationPassed", ensoResult?.simulationPassed.status)
  console.log("barterSimulationPassed", barterResult?.simulationPassed.status)
  console.log("zeroXSimulationPassed", zeroXResults?.simulationPassed.status)
  console.log("wowMaxSimulationPassed", wowMaxResults?.simulationPassed.status)
  console.log("kyberswapSimulationPassed", kyberswapData?.simulationPassed.status)
  // console.log("oneInchSimulationPassed", oneInchResults?.simulationPassed.status)

  const quotes = [];
  let priceImpactPercentage

  // if (oneInchResults && oneInchResults?.simulationPassed.status) {
  //   if (tokenPriceData != null && tokenPriceData.length == 2) {
  //     const tokenInPriceData = tokenPriceData.find(token => token.address === tokenIn.toLowerCase());
  //     const tokenOutPriceData = tokenPriceData.find(token => token.address === tokenOut.toLowerCase());
  //     priceImpactPercentage = calculatePriceImpactPercentage(oneInchResults.quote.dstAmount, amount, tokenInPriceData?.price ?? 0,
  //       tokenOutPriceData?.price ?? 0,
  //       tokenInPriceData?.decimals ?? 18,
  //       tokenOutPriceData?.decimals ?? 18)
  //   }

  //   const minAmountOut = getMinAmountOut(oneInchResults.quote.dstAmount, slippage);

  //   quotes.push({
  //     protocol: "oneInch",
  //     to: swapContract,
  //     data: oneInchResults.swapData,
  //     value: oneInchResults.quote.tx.value,
  //     amountOut: oneInchResults.quote.dstAmount,
  //     minAmountOut: minAmountOut,
  //     gasEstimate: oneInchResults.simulationPassed.gas,
  //     simulationStatus: oneInchResults.simulationPassed.status,
  //     priceImpactPercentage: priceImpactPercentage || 0
  //   })
  // }


  if (kyberswapData && kyberswapData?.simulationPassed.status) {
    const minAmountOut = getMinAmountOut(kyberswapData.quote.outputAmount, slippage);

    if (tokenPriceData != null && tokenPriceData.length == 2) {
      const tokenInPriceData = tokenPriceData.find(token => token.address === tokenIn.toLowerCase());
      const tokenOutPriceData = tokenPriceData.find(token => token.address === tokenOut.toLowerCase());
      priceImpactPercentage = calculatePriceImpactPercentage(kyberswapData.quote.outputAmount, amount, tokenInPriceData?.price ?? 0,
        tokenOutPriceData?.price ?? 0,
        tokenInPriceData?.decimals ?? 18,
        tokenOutPriceData?.decimals ?? 18)
    }
    quotes.push({
      protocol: "kyberswap",
      to: swapContract,
      data: kyberswapData.swapData,
      value: isEth ? BigNumber(amount).toNumber() : 0,
      amountOut: kyberswapData.quote.outputAmount,
      minAmountOut: minAmountOut,
      gasEstimate: kyberswapData.simulationPassed.gas,
      simulationStatus: kyberswapData.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    })
  }

  if (wowMaxResults && wowMaxResults?.simulationPassed.status) {
    const minAmountOut = getMinAmountOut(wowMaxResults.quote.amountOut, slippage);

    if (tokenPriceData != null && tokenPriceData.length == 2) {
      const tokenInPriceData = tokenPriceData.find(token => token.address === tokenIn.toLowerCase());
      const tokenOutPriceData = tokenPriceData.find(token => token.address === tokenOut.toLowerCase());
      priceImpactPercentage = calculatePriceImpactPercentage(wowMaxResults.quote.amountOut, amount, tokenInPriceData?.price ?? 0,
        tokenOutPriceData?.price ?? 0,
        tokenInPriceData?.decimals ?? 18,
        tokenOutPriceData?.decimals ?? 18)
    }

    quotes.push({
      protocol: "wowMax",
      to: swapContract,
      data: wowMaxResults.swapData,
      value: wowMaxResults.quote.value,
      amountOut: wowMaxResults.quote.amountOut[0],
      minAmountOut: minAmountOut,
      gasEstimate: wowMaxResults.simulationPassed.gas,
      simulationStatus: wowMaxResults.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    })
  }

  if (zeroXResults && zeroXResults?.simulationPassed.status) {
    if (tokenPriceData != null && tokenPriceData.length == 2) {
      const tokenInPriceData = tokenPriceData.find(token => token.address === tokenIn.toLowerCase());
      const tokenOutPriceData = tokenPriceData.find(token => token.address === tokenOut.toLowerCase());
      priceImpactPercentage = calculatePriceImpactPercentage(zeroXResults.quote.buyAmount, amount, tokenInPriceData?.price ?? 0,
        tokenOutPriceData?.price ?? 0,
        tokenInPriceData?.decimals ?? 18,
        tokenOutPriceData?.decimals ?? 18)
    }
    quotes.push({
      protocol: "zeroX",
      to: swapContract,
      data: zeroXResults.swapData,
      value: zeroXResults.quote.transaction.value,
      amountOut: zeroXResults.quote.buyAmount,
      minAmountOut: zeroXResults.quote.minBuyAmount,
      gasEstimate: zeroXResults.simulationPassed.gas,
      simulationStatus: zeroXResults.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    })
  }


  if (portalfiResult && portalfiResult.simulationPassed.status && portalfiQuote) {
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
      gasEstimate: ensoResult.simulationPassed.gas,
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
      to: swapContract,
      data: barterResult.swapData,
      value: barterResult.quote.value,
      amountOut: barterResult.quote.route.outputAmount,
      minAmountOut: minAmountOut,
      gasEstimate: barterResult.simulationPassed.gas,
      simulationStatus: barterResult.simulationPassed.status,
      priceImpactPercentage: priceImpactPercentage || 0
    });
  }

  // Sort quotes in descending order based on amountOut
  quotes.sort((a, b) => b.amountOut - a.amountOut);

  return { quotes: quotes, approvalAddress: swapContract }
}