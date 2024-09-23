import express from "express";
import { sortOrder } from "./sortOrder";
import { getAmountOut } from "./sortAmount";
import { getSwapData } from "./fetchSwapData";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { baseChainID } from "./config";
import { ethers } from "ethers";
import { PROTOCOLS } from "./protocol";


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

const checkRequiredFields = (requiredFields: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const missingFields = requiredFields.filter(field => !(field in req.body));

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missingFields.join(', ')}`
      });
    }

    next();
  };
};


const validateSwapParams = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { tokenIn, tokenOut, amount, receiver, sender, chainId, slippage, protocol, amountOut } = req.body;

  const errors: string[] = [];

  // Validate token addresses
  if (tokenIn && !ethers.isAddress(tokenIn)) {
    errors.push("Invalid tokenIn address");
  }
  if (tokenOut && !ethers.isAddress(tokenOut)) {
    errors.push("Invalid tokenOut address");
  }

  // Validate amount
  if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
    errors.push("Invalid amount: must be a positive number");
  }

  // Validate receiver and sender addresses
  if (receiver && !ethers.isAddress(receiver)) {
    errors.push("Invalid receiver address");
  }
  if (sender && !ethers.isAddress(sender)) {
    errors.push("Invalid sender address");
  }

  if (chainId !== baseChainID) {
    errors.push(`Invalid chain ID. Expected ${baseChainID}`);
  }

  if (slippage && (isNaN(parseFloat(slippage)) || parseFloat(slippage) < 0)) {
    errors.push("Invalid slippage: must be a non-negative number");
  }

  if (protocol && !PROTOCOLS.includes(protocol)) {
    errors.push(`Invalid protocol: must be one of ${PROTOCOLS.join(', ')}`);
  }

  if (amountOut && (isNaN(parseFloat(amountOut)) || parseFloat(amountOut) <= 0)) {
    errors.push("Invalid amountOut: must be a positive number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};


const validateRequest = (requiredFields: string[]) => {
  return [
    checkRequiredFields(requiredFields),
    validateSwapParams
  ];
};


// This is for the best quote with swap data. This endpoint queries all protocols and returns the best quote with swap data. Won't return gas estimate for portalfi. Would not return quote from protalfi if sender is not receiver.
app.post('/best-quote', validateRequest(['slippage', 'amount', 'tokenIn', 'tokenOut', 'sender', 'receiver', 'chainId']), async (req: express.Request, res: express.Response) => {
  const { slippage, amount, tokenIn, tokenOut, sender, receiver, chainId } = req.body;
  // sort the quotes by amount out and return the quote with the max amount out
  const swapData = await sortOrder(chainId, slippage, amount, tokenIn, tokenOut, sender, receiver)
  if (swapData == null) return res.status(404).send({ message: "No quotes found" });
  res.send(swapData);
});

//This is for the best amount out. This endpoint queries all protocols and returns the best amount out. Also give the approval address for the best quote.Would not return amount from protalfi if sender is not receiver.
app.post('/best-amount-out', validateRequest(['amount', 'tokenIn', 'tokenOut', 'sender', 'receiver', 'chainId']), async (req: express.Request, res: express.Response) => {
  const { amount, tokenIn, tokenOut, sender, receiver, chainId } = req.body;
  // sort the quotes by amount out and return the quote with the max amount out
  const response = await getAmountOut(chainId, amount, tokenIn, tokenOut, sender, receiver);
  if (response == null) return res.status(404).send({ message: "No quotes found" });
  res.send(response);
});

// This end point is for the swap data. This endpoint queries the protocol sent in by the user and returns the swap data. Also give the approval address for the best quote.Would not return amount from protalfi if sender is not receiver.
app.post('/swap-data', validateRequest(['slippage', 'amount', 'tokenIn', 'tokenOut', 'sender', 'amountOut', 'protocol', 'receiver', 'chainId']), async (req: express.Request, res: express.Response) => {
  const { slippage, amount, tokenIn, tokenOut, sender, amountOut, protocol, receiver, chainId } = req.body;
  // get the swap data from the protocol sent in by the user
  const swapData = await getSwapData(chainId, protocol, slippage, amount, tokenIn, tokenOut, sender, receiver, amountOut);
  if (swapData == null) return res.status(404).send({ message: "No swap data found" });
  res.send(swapData);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

