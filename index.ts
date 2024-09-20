import express from "express";
import { sortOrder } from "./sortOrder";
import { getAmountOut } from "./sortAmount";
import { getSwapData } from "./fetchSwapData";
import cors from "cors";

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

// this is for the best quote with swap data. This endpoint queries all protocols and returns the best quote with swap data. 
app.post('/best-quote', async (req, res) => {
  const { slippage, amount, tokenIn, tokenOut, sender, receiver, chainId } = req.body;
  // sort the quotes by amount out and return the quote with the max amount out
  const swapData = await sortOrder(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver)
  if(swapData == null) return res.status(400).send({error: "No quotes found"});
  res.send(swapData);
});

//This is for the best amount out. This endpoint queries all protocols and returns the best amount out. Also give the approval address for the best quote.
app.post('/best-amount-out', async (req, res) => {
  const { amount, tokenIn, tokenOut, sender, receiver, chainId } = req.body;
  const response = await getAmountOut(chainId, amount, tokenIn, tokenOut, sender, receiver);
  if(response == null) return res.status(400).send({error: "No quotes found"});
  res.send(response);
});

// This end point is for the swap data. This endpoint queries the protocol sent in by the user and returns the swap data.
app.post('/swap-data', async (req, res) => {
  const { slippage, amount, tokenIn, tokenOut, sender, amountOut, protocol, receiver, chainId } = req.body;

 const swapData = await getSwapData(chainId, protocol, slippage, amount, tokenIn, tokenOut, sender, receiver, amountOut);
 if(swapData == null) return res.status(400).send({error: "No swap data found"});
 res.send(swapData);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

