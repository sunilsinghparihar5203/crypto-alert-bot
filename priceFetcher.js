import fetch from "node-fetch";

const ID_MAP = {
  btc: "bitcoin",
  bitcoin: "bitcoin",
  eth: "ethereum",
  ethereum: "ethereum",
  usdt: "tether",
  tether: "tether",
  usdc: "usd-coin",
  "usd-coin": "usd-coin",
  bnb: "binancecoin",
  binance: "binancecoin",
  sol: "solana",
  solana: "solana",
  xrp: "ripple",
  ripple: "ripple",
  ada: "cardano",
  cardano: "cardano",
  doge: "dogecoin",
  dogecoin: "dogecoin",
  ton: "the-open-network",
  tron: "tron",
  trx: "tron",
  link: "chainlink",
  chainlink: "chainlink",
  dot: "polkadot",
  polkadot: "polkadot",
  avax: "avalanche-2",
  avalanche: "avalanche-2",
  shib: "shiba-inu",
  "shiba-inu": "shiba-inu",
  wbtc: "wrapped-bitcoin",
  "wrapped-bitcoin": "wrapped-bitcoin",
  ltc: "litecoin",
  litecoin: "litecoin",
  bch: "bitcoin-cash",
  "bitcoin-cash": "bitcoin-cash",
  near: "near",
  matic: "matic-network",
  polygon: "matic-network",
  op: "optimism",
  optimism: "optimism",
  arb: "arbitrum",
  arbitrum: "arbitrum",
  apt: "aptos",
  aptos: "aptos",
  atom: "cosmos",
  cosmos: "cosmos",
  uni: "uniswap",
  uniswap: "uniswap",
  icp: "internet-computer",
  "internet-computer": "internet-computer",
  hbar: "hedera-hashgraph",
  stellar: "stellar",
  xlm: "stellar",
  etc: "ethereum-classic",
  "ethereum-classic": "ethereum-classic",
  fil: "filecoin",
  filecoin: "filecoin",
  xmr: "monero",
  monero: "monero",
  algo: "algorand",
  algorand: "algorand",
  ftm: "fantom",
  fantom: "fantom",
  sand: "the-sandbox",
  "the-sandbox": "the-sandbox",
  mana: "decentraland",
  decentraland: "decentraland",
  ape: "apecoin",
  apecoin: "apecoin",
  rndr: "render-token",
  render: "render-token",
  sui: "sui",
  sei: "sei-network",
  tia: "celestia",
  pyth: "pyth-network",
  inj: "injective-protocol",
  injective: "injective-protocol",
  rose: "oasis-network",
  qnt: "quant-network",
  quant: "quant-network",
  grt: "the-graph",
  "the-graph": "the-graph",
  kas: "kaspa",
  kaspa: "kaspa",
  stx: "stacks",
  stacks: "stacks",
};

export function normalizeSymbol(input) {
  return (input || "").toLowerCase().trim();
}

export function toId(symbolOrId) {
  const key = normalizeSymbol(symbolOrId);
  return ID_MAP[key] || key; // fall back to given id if already a CoinGecko id
}

async function fetchJson(url, fetchFn) {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`Price fetch failed: ${res.status}`);
  return res.json();
}

export async function getPrice(symbolOrId, options = {}) {
  const id = toId(symbolOrId);
  const fetchFn = options.fetchFn || fetch;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`;
  const data = await fetchJson(url, fetchFn);
  const price = data?.[id]?.usd;
  if (typeof price !== "number")
    throw new Error(`Unsupported symbol/id: ${symbolOrId}`);
  return price;
}

export async function getPrices(symbolsOrIds, options = {}) {
  const ids = [...new Set((symbolsOrIds || []).map(toId))];
  if (ids.length === 0) return {};
  const fetchFn = options.fetchFn || fetch;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`;
  const data = await fetchJson(url, fetchFn);
  const map = {};
  ids.forEach((id) => {
    const v = data?.[id]?.usd;
    if (typeof v === "number") map[id] = v;
  });
  return map;
}
