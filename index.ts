import express from "express";
import { getPortalfiQuote } from "./protalfi";
import { getEnsoQuote } from "./enso";
import { getBarterQuote } from "./barter";
import BigNumber from "bignumber.js";
import cors from "cors";




const app = express();
app.use(cors());

const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

app.post('/best-quote', async (req, res) => {
  console.log(req.body)
  const { slippage, amount, tokenIn, tokenOut, sender } = req.body;
  const swapData = await sortOrder(slippage, amount, tokenIn, tokenOut, sender)
  res.send(swapData);
});

export const sortOrder = async (slippage: number, amount: number, tokenIn: string, tokenOut: string, sender: string) => {
  const [portalfi, enso, barter] = await Promise.all([getPortalfiQuote(slippage, amount, tokenIn, tokenOut, sender), getEnsoQuote(slippage, amount, tokenIn, tokenOut, sender), getBarterQuote(slippage, amount, tokenIn, tokenOut, sender)])

  const portalfiAmount = portalfi ? portalfi.context.outputAmount : 0
  const ensoAmount = enso ? enso.amountOut : 0
  const barterAmount = barter ? barter.route.outputAmount : 0

  const maxAmount = findMax(portalfiAmount, ensoAmount, barterAmount)


  console.log("maxAmount", maxAmount)
  console.log("portalfiAmount", portalfiAmount)
  console.log("ensoAmount", ensoAmount)
  console.log("barterAmount", barterAmount)



  if (maxAmount === portalfiAmount) {
    return {
      protocol: "portalfi",
      to: portalfi.tx.to,
      data: portalfi.tx.data,
      value: portalfi.tx.value,
      amountOut: portalfiAmount,
      approvalAddress: portalfi.tx.to,
      minAmountOut: portalfiAmount
    }
  } else if (maxAmount === ensoAmount) {
    const minAmountOut = ensoAmount - (ensoAmount * (slippage / 100))
      return {
      protocol: "enso",
      to: enso.tx.to,
      data: enso.tx.data,
      value: enso.tx.value,
      amountOut: ensoAmount,
      approvalAddress: "0x27Dd78498B909cD0B93f0E312d1A1bB12c89921d",
      minAmountOut: minAmountOut
    }
  } else {
    const minAmountOut = barterAmount - (barterAmount * (slippage / 100))
    return {
      protocol: "barter",
      to: barter.to,
      data: barter.data,
      value: barter.value,
      amountOut: barterAmount,
      approvalAddress: barter.to,
      minAmountOut: minAmountOut
    }
  }

}

function findMax(a: any, b: any, c: any) {
  const maxAB = BigNumber.max(a, b);
  const maxABC = BigNumber.max(maxAB, c);
  return maxABC.toFixed(0);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});