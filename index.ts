import express from "express";
import { sortOrder } from "./sortOrder";
import { getAmountOut } from "./sortAmount";
import { getSwapData } from "./fetchSwapData";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { baseChainID } from "./config";


const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Custom CSS to increase summary font size
const customCss = `
  .swagger-ui .opblock-summary-description {
    font-size: 16px !important;
  }
`;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: customCss,
}));

const verifyRequestBody = (requiredFields: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check for required fields
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Check for chain ID
    if (req.body.chainId !== baseChainID) {
      return res.status(400).json({ error: `Invalid chain ID. Expected ${baseChainID}` });
    }

    next();
  };
};

// This is for the best quote with swap data. This endpoint queries all protocols and returns the best quote with swap data. Won't return gas estimate for portalfi. Would not return quote from protalfi if sender is not receiver.
app.post('/best-quote',verifyRequestBody(['slippage', 'amount', 'tokenIn', 'tokenOut', 'sender', 'receiver', 'chainId']), async (req, res) => {
  const { slippage, amount, tokenIn, tokenOut, sender, receiver, chainId } = req.body;
  // sort the quotes by amount out and return the quote with the max amount out
  const swapData = await sortOrder(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver)
  if (swapData == null) return res.status(404).send({ error: "No quotes found" });
  res.send(swapData);
});

//This is for the best amount out. This endpoint queries all protocols and returns the best amount out. Also give the approval address for the best quote.Would not return amount from protalfi if sender is not receiver.
app.post('/best-amount-out',verifyRequestBody(['amount', 'tokenIn', 'tokenOut', 'sender', 'receiver', 'chainId']), async (req, res) => {
  const { amount, tokenIn, tokenOut, sender, receiver, chainId } = req.body;
  const response = await getAmountOut(chainId, amount, tokenIn, tokenOut, sender, receiver);
  if (response == null) return res.status(404).send({ error: "No quotes found" });
  res.send(response);
});

// This end point is for the swap data. This endpoint queries the protocol sent in by the user and returns the swap data. Also give the approval address for the best quote.Would not return amount from protalfi if sender is not receiver.
app.post('/swap-data',verifyRequestBody(['slippage', 'amount', 'tokenIn', 'tokenOut', 'sender', 'amountOut', 'protocol', 'receiver', 'chainId']), async (req, res) => {
  const { slippage, amount, tokenIn, tokenOut, sender, amountOut, protocol, receiver, chainId } = req.body;
  const swapData = await getSwapData(chainId, protocol, slippage, amount, tokenIn, tokenOut, sender, receiver, amountOut);
  if (swapData == null) return res.status(404).send({ error: "No swap data found" });
  res.send(swapData);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

