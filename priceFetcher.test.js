import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeSymbol, toId, getPrice, getPrices } from "./priceFetcher.js";
import { mockFetch } from "./testHelpers.js";

describe("priceFetcher", () => {
  describe("normalizeSymbol", () => {
    it("trims and lowercases", () => {
      assert.strictEqual(normalizeSymbol("  BTC  "), "btc");
      assert.strictEqual(normalizeSymbol("Eth"), "eth");
      assert.strictEqual(normalizeSymbol(""), "");
      assert.strictEqual(normalizeSymbol(null), "");
      assert.strictEqual(normalizeSymbol(undefined), "");
    });
  });

  describe("toId", () => {
    it("maps common tickers to CoinGecko IDs", () => {
      assert.strictEqual(toId("btc"), "bitcoin");
      assert.strictEqual(toId("BTC"), "bitcoin");
      assert.strictEqual(toId("bitcoin"), "bitcoin");
      assert.strictEqual(toId("eth"), "ethereum");
      assert.strictEqual(toId("sol"), "solana");
      assert.strictEqual(toId("matic"), "matic-network");
      assert.strictEqual(toId("polygon"), "matic-network");
      assert.strictEqual(toId("arb"), "arbitrum");
      assert.strictEqual(toId("usdt"), "tether");
      assert.strictEqual(toId("usdc"), "usd-coin");
      assert.strictEqual(toId("bnb"), "binancecoin");
      assert.strictEqual(toId("xrp"), "ripple");
      assert.strictEqual(toId("ada"), "cardano");
      assert.strictEqual(toId("doge"), "dogecoin");
      assert.strictEqual(toId("avax"), "avalanche-2");
      assert.strictEqual(toId("dot"), "polkadot");
      assert.strictEqual(toId("link"), "chainlink");
      assert.strictEqual(toId("ltc"), "litecoin");
      assert.strictEqual(toId("bch"), "bitcoin-cash");
      assert.strictEqual(toId("near"), "near");
      assert.strictEqual(toId("op"), "optimism");
      assert.strictEqual(toId("apt"), "aptos");
      assert.strictEqual(toId("atom"), "cosmos");
      assert.strictEqual(toId("uni"), "uniswap");
      assert.strictEqual(toId("icp"), "internet-computer");
      assert.strictEqual(toId("trx"), "tron");
      assert.strictEqual(toId("xlm"), "stellar");
      assert.strictEqual(toId("etc"), "ethereum-classic");
      assert.strictEqual(toId("fil"), "filecoin");
      assert.strictEqual(toId("xmr"), "monero");
      assert.strictEqual(toId("algo"), "algorand");
      assert.strictEqual(toId("ftm"), "fantom");
      assert.strictEqual(toId("shib"), "shiba-inu");
      assert.strictEqual(toId("wbtc"), "wrapped-bitcoin");
      assert.strictEqual(toId("ape"), "apecoin");
      assert.strictEqual(toId("rndr"), "render-token");
      assert.strictEqual(toId("sui"), "sui");
      assert.strictEqual(toId("sei"), "sei-network");
      assert.strictEqual(toId("tia"), "celestia");
      assert.strictEqual(toId("pyth"), "pyth-network");
      assert.strictEqual(toId("inj"), "injective-protocol");
      assert.strictEqual(toId("rose"), "oasis-network");
      assert.strictEqual(toId("qnt"), "quant-network");
      assert.strictEqual(toId("grt"), "the-graph");
      assert.strictEqual(toId("kas"), "kaspa");
      assert.strictEqual(toId("stx"), "stacks");
    });

    it("falls back to input if not in map", () => {
      assert.strictEqual(toId("unknowncoin"), "unknowncoin");
      assert.strictEqual(toId("exact-coingecko-id"), "exact-coingecko-id");
    });
  });

  describe("getPrice", () => {
    it("fetches price for a known symbol using injected fetch", async () => {
      const fetchFn = mockFetch({ bitcoin: 42000 });
      const price = await getPrice("bitcoin", { fetchFn: fetchFn.mock });
      assert.strictEqual(price, 42000);
    });

    it("throws for unsupported symbol using injected fetch", async () => {
      const fetchFn = mockFetch({});
      await assert.rejects(
        () => getPrice("not-a-real-id-12345", { fetchFn: fetchFn.mock }),
        /Unsupported symbol\/id/,
      );
    });
  });

  describe("getPrices", () => {
    it("fetches multiple prices using injected fetch", async () => {
      const fetchFn = mockFetch({
        bitcoin: 42000,
        ethereum: 2500,
        solana: 100,
      });
      const prices = await getPrices(["bitcoin", "ethereum", "solana"], {
        fetchFn: fetchFn.mock,
      });
      assert.deepStrictEqual(prices, {
        bitcoin: 42000,
        ethereum: 2500,
        solana: 100,
      });
    });

    it("returns empty object for empty input", async () => {
      const fetchFn = mockFetch({ bitcoin: 1 });
      const prices = await getPrices([], { fetchFn: fetchFn.mock });
      assert.deepStrictEqual(prices, {});
    });

    it("handles mix of valid and invalid ids gracefully", async () => {
      const fetchFn = mockFetch({ bitcoin: 42000 });
      const prices = await getPrices(["bitcoin", "not-real-123"], {
        fetchFn: fetchFn.mock,
      });
      assert.deepStrictEqual(prices, { bitcoin: 42000 });
    });
  });
});
