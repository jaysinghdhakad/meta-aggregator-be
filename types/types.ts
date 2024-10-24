export interface ITransactionData {
    from: string
    input: any
    to: string,
    value: number
  }

export interface TokenObj {
    name: string;
    symbol: string;
    logo: string;
    address: string;
    price: number;
    priceBN: string;
    apy: number | string;
    marketCap: string;
    volume: number | string;
    tvl: string;
    chainName: string;
    decimals: number;
  }
  