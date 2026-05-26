export type Token = {
  symbol: string;
  name: string;
  address: `0x${string}` | "native";
  decimals: number;
  color: string;
  volatile: boolean;
};

export const NATIVE_ETH: Token = {
  symbol: "ETH",
  name: "Ether",
  address: "native",
  decimals: 18,
  color: "#627EEA",
  volatile: true,
};

export const ARBITRUM_TOKENS: Token[] = [
  NATIVE_ETH,
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
    color: "#627EEA",
    volatile: true,
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimals: 18,
    color: "#28A0F0",
    volatile: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    color: "#2775CA",
    volatile: false,
  },
  {
    symbol: "USDC.e",
    name: "USD Coin (Bridged)",
    address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    decimals: 6,
    color: "#2775CA",
    volatile: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    decimals: 6,
    color: "#26A17B",
    volatile: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    color: "#F5AC37",
    volatile: false,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    decimals: 8,
    color: "#F7931A",
    volatile: true,
  },
  {
    symbol: "FRAX",
    name: "Frax",
    address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    decimals: 18,
    color: "#000000",
    volatile: false,
  },
  {
    symbol: "LUSD",
    name: "Liquity USD",
    address: "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b",
    decimals: 18,
    color: "#2EB6EA",
    volatile: false,
  },
  {
    symbol: "GMX",
    name: "GMX",
    address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    decimals: 18,
    color: "#03d1ce",
    volatile: true,
  },
  {
    symbol: "RDNT",
    name: "Radiant",
    address: "0x3082CC23568eA640225c2467653dB90e9250AaA0",
    decimals: 18,
    color: "#7E62E5",
    volatile: true,
  },
  {
    symbol: "PENDLE",
    name: "Pendle",
    address: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
    decimals: 18,
    color: "#1F9A8D",
    volatile: true,
  },
  {
    symbol: "CRV",
    name: "Curve DAO",
    address: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    decimals: 18,
    color: "#A91827",
    volatile: true,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    decimals: 18,
    color: "#2A5ADA",
    volatile: true,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    decimals: 18,
    color: "#FF007A",
    volatile: true,
  },
  {
    symbol: "MAGIC",
    name: "Magic",
    address: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    decimals: 18,
    color: "#E11D48",
    volatile: true,
  },
  {
    symbol: "GRAIL",
    name: "Camelot",
    address: "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8",
    decimals: 18,
    color: "#F4B53F",
    volatile: true,
  },
  {
    symbol: "GNS",
    name: "Gains Network",
    address: "0x18c11FD286C5EC11c3b683Caa813B77f5163A122",
    decimals: 18,
    color: "#6E54B5",
    volatile: true,
  },
  {
    symbol: "JOE",
    name: "JoeToken",
    address: "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07",
    decimals: 18,
    color: "#9F2842",
    volatile: true,
  },
];

export const tokenBySymbol = (sym: string) =>
  ARBITRUM_TOKENS.find((t) => t.symbol === sym);
