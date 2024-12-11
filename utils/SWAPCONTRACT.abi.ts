export const SWAPCONTRACTABI =  [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ensoSwapContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdt",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "ApprovalFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotSwapETH",
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
    "name": "InsufficientTokenOutAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidENSOAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidUSDTAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MinAmountOutMustBeGreaterThanZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotDelegate",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20Swapped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20SwappedDelegate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ETHSwappedDelegate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ETHSwappedForToken",
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
    "name": "swapERC20Delegate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
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
    "inputs": [
      {
        "internalType": "address",
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
    "name": "swapETHDelegate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]