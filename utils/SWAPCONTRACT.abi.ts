export const SWAPCONTRACTABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ensoSwapContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AmountInMustBeGreaterThanZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotSwapETHToETH",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotSwapTokens",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IncorrectEtherAmountSent",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientETHOutAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientOutputBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientTokenInBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientTokenOutAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MinAmountOutMustBeGreaterThanZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SwapFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TokenInAndTokenOutCannotBeSame",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      }
    ],
    "name": "AmountSent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "aggregator",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "swapData",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isDelegate",
        "type": "bool"
      }
    ],
    "name": "swapERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "aggregator",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "swapData",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isDelegate",
        "type": "bool"
      }
    ],
    "name": "swapETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]