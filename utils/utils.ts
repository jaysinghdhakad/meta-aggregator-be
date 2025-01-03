import BigNumber from "bignumber.js";
import { baseChainID } from "./config";
import { ERC20ABI } from "./ERC20.abi";
import { SWAPCONTRACTABI } from "./SWAPCONTRACT.abi";
import { SWAPMANAGERABI } from "./SWAPMANAGER.abi";
import { ethers } from "ethers";
import axios from "axios";
import { TokenObj } from "../types/types";
import { skip } from "node:test";
// This function finds the max of three numbers.
export function findMax(a: any, b: any, c: any) {
    const maxAB = BigNumber.max(a, b);
    const maxABC = BigNumber.max(maxAB, c);
    return maxABC.toFixed(0);
}

// This function returns the approval address for the protocol for the chainId.
export function getApprovalAddressForChain(protocol: string, chainId: number) {
    if (chainId === baseChainID) {
        if (protocol === "portalfi") {
            return process.env.PORTALFI_APPROVAL_ADDRESS_BASE
        }

        if (protocol === "enso") {
            return process.env.ENSO_APPROVAL_ADDRESS_BASE
        }

        if (protocol === "barter") {
            return process.env.BARTER_APPROVAL_ADDRESS_BASE
        }

    }
}

export function getSwapContract(chainId: number, isETH: boolean) {
    if (chainId === baseChainID) {
        if (isETH) return process.env.SWAP_CONTRACT_BASE
        return process.env.SWAP_MANAGER_BASE;
    }
}

export function getSwapContractABI(chainId: number, isETH: boolean) {
    if (chainId === baseChainID) {
        if (isETH) return SWAPCONTRACTABI
        return SWAPMANAGERABI;
    }
}

export function getSwapManager(chainID: number) {
    if (chainID === baseChainID) {
        return process.env.SWAP_MANAGER
    }
}

// This function returns the chain name for the chainId.
export function getChainName(chainId: number) {
    if (chainId === baseChainID) {
        return "base"
    }
}

export function getMinAmountOut(amountOut: string, slippage: number) {
    return BigNumber(amountOut).minus(BigNumber(amountOut).times(slippage / 100)).toFixed(0)
}

export function getProvider(chainId: number) {
    if (chainId === baseChainID) {
        return new ethers.JsonRpcProvider(process.env.BASE_RPC_URL)
    }
}

export function getApprovalData(chainId: number, amount: string, tokenAddress: string, approvalAddress: string) {
    try {
        if (chainId === baseChainID) {
            const provider = getProvider(chainId)
            const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider)
            const calldata = tokenContract.interface.encodeFunctionData('approve', [approvalAddress, ethers.toBigInt(amount)])
            return calldata
        }
    }
    catch (error) {
        console.log("error", error)
        return null
    }
}


export async function getDecimalsSymbol(chainId: number, tokenAddress: string) {
    try {
        if (chainId === baseChainID) {
            const provider = getProvider(chainId)
            const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider)
            const symbol = await tokenContract.decimals();
            return symbol
        }
    }
    catch (error) {
        console.log("error", error)
        return null
    }
}

export function generateSwapData(tokenIn: string, tokenOut: string, aggregator: string, swapData: string, amountIn: string, minAmountOut: string, receiver: string, isEnso: boolean, chainId: number, isETH: boolean, skipSimulation:boolean) {
    try {
        if (chainId === baseChainID) {
            const provider = getProvider(chainId)
            const swapContractAddress = getSwapContract(chainId, isETH || skipSimulation) || "";
            const swapContractAbi = getSwapContractABI(chainId, isETH  || skipSimulation) || "";
            const swapContract = new ethers.Contract(swapContractAddress, swapContractAbi, provider)
            let calldata;
            if(!skipSimulation) {
                if (isETH) {
                    calldata = swapContract.interface.encodeFunctionData('swapETH', [tokenIn, tokenOut, aggregator, swapData, ethers.toBigInt(amountIn), ethers.toBigInt(minAmountOut), receiver, isEnso])
                } else {
                    calldata = swapContract.interface.encodeFunctionData('swap', [tokenIn, tokenOut, aggregator, swapData, ethers.toBigInt(amountIn), ethers.toBigInt(minAmountOut), receiver, isEnso])
                }
            } else {
                if (isETH) {
                    calldata = swapContract.interface.encodeFunctionData('swapETHDelegate', [tokenIn, tokenOut, aggregator, swapData, ethers.toBigInt(amountIn), ethers.toBigInt(minAmountOut), receiver, isEnso])
                } else {
                    calldata = swapContract.interface.encodeFunctionData('swapERC20Delegate', [tokenIn, tokenOut, aggregator, swapData, ethers.toBigInt(amountIn), ethers.toBigInt(minAmountOut), receiver, isEnso])
                } 
            }
           
            return calldata
        }
    }
    catch (error) {
        console.log("error", error)
        return null
    }
}



export async function fetchTokenPrice(tokenAddress: string, chainId: number) {
    if (tokenAddress.localeCompare(process.env.ETH_ADDRESS_ENSO || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", 'en', { sensitivity: 'base' }) == 0) tokenAddress = process.env.WETH_ADDRESS || "0x4200000000000000000000000000000000000006";
    const chainName = getChainName(chainId)
    try {
        const response = await axios.get(`https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/price?chain=${chainName}`, {
            headers: {
                timeout: 500,
                'X-API-Key': process.env.MORALIS_KEY
            }
        });

        return response.data
    } catch (e) {
        console.log("fetch token price error", e)
        return null
    }
}

export const fetchPriceFromPortals = async (tokens: string[], chain: 'base' | 'bsc') => {
    try {
        const PORTALS_PLATFORMS: Record<'base' | 'bsc', string[]> = {
            base: [
                'platforms=native',
                'platforms=basic',
                'platforms=morpho',
                'platforms=baseswap',
                'platforms=rocketswap',
                'platforms=swapbased',
                'platforms=synthswap',
                'platforms=beefy',
                'platforms=balancerv2',
                'platforms=balancerv2boosted',
                'platforms=thegranary',
                'platforms=alienbase',
                'platforms=soswap',
                'platforms=moonwell',
                'platforms=stargate',
                'platforms=curve',
                'platforms=aerodrome',
                'platforms=sonne-finance',
                'platforms=seamless-protocol',
                'platforms=aavev3',
                'platforms=equalizer',
                'platforms=compound-v3',
                'platforms=hop-protocol',
                'platforms=hop-protocol-tokens',
                'platforms=harvest-finance',
                'platforms=pooltogether-v5',
                'platforms=uniswapv2',
                'platforms=fluid',
                'platforms=overnight-finance',
            ],
            bsc: [
                'platforms=native',
                'platforms=basic',
                'platforms=sushiswap',
                'platforms=pancakeswap',
                'platforms=venus',
                'platforms=apeswap',
                'platforms=apeswap-lending',
                'platforms=beefy',
                'platforms=uniswapv2',
            ],
        };

        const tokensList = tokens.map((token) => `${chain}:` + token);
        const res = await axios.get(
            `https://api.portals.fi/v2/tokens?ids=${tokensList.join(
                ','
            )}&${PORTALS_PLATFORMS[chain].join(
                '&'
            )}&networks=${chain}&sortDirection=asc&limit=250&page=0`,
            {
                headers: {
                    Authorization: process.env.PORTALFI_API_KEY,
                },
            }
        );


        const data: TokenObj[] = res.data.tokens.map(
            ({ name, symbol, image, address, price, metrics, liquidity, decimals }: {
                name: string;
                symbol: string;
                image: string | null;
                address: string;
                price: number;
                metrics: { apy?: number; volumeUsd1d?: string } | null;
                liquidity: number | null;
                decimals: number | null;
            }) => ({
                name,
                symbol,
                logo: image ?? '',
                address: address.toLowerCase(),
                price: +price,
                priceBN: ethers.parseEther((+price).toFixed(15)).toString(),
                apy: metrics?.apy ?? '-',
                marketCap: liquidity ? liquidity.toString() : '-',
                volume: metrics?.volumeUsd1d ?? '-',
                tvl: liquidity ? liquidity.toString() : '-',
                chainName: chain,
                decimals: decimals
            })
        );

        return data;
    } catch (e) {
        const err = e as Error;
        console.error('failed to fetch price from portals', err.message);
        return [];
    }
};

export function calculatePriceImpactPercentage(amountOut: string, amountIn: string, tokenInPrice: number, tokenOutPrice: number, tokenInDecimals: number, tokenOutDecimals: number) {
    const amountOutBN = BigNumber(amountOut).div(BigNumber(10).pow(tokenOutDecimals))
    const amountInBN = BigNumber(amountIn).div(BigNumber(10).pow(tokenInDecimals))
    const tokenInPriceBN = BigNumber(tokenInPrice)
    const tokenOutPriceBN = BigNumber(tokenOutPrice)
    const amountInUsd = amountInBN.times(tokenInPriceBN)
    const amountOutUsd = amountOutBN.times(tokenOutPriceBN)
    const amountOutUSDInAmountIn = amountOutUsd.div(amountInUsd)
    const priceImpactPercentage = BigNumber(1).minus(amountOutUSDInAmountIn).times(100).toFixed(2)
    return priceImpactPercentage
}


