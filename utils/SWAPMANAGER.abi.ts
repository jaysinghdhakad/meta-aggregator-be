export const SWAPMANAGERABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_metaAggregatorSwap",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "CannotSwapETH",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
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
        "name": "swap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]