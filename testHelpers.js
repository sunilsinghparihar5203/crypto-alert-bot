import { mock } from 'node:test';

// Simple fetch mock for deterministic price data in tests
export function mockFetch(prices) {
  return mock.fn((url) => {
    const ids = new URL(url).searchParams.get('ids')?.split(',') || [];
    const payload = {};
    ids.forEach(id => {
      if (prices[id] !== undefined) payload[id] = { usd: prices[id] };
    });
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(payload),
    });
  });
}

// Helper to wait for async DB operations in tests
export function delay(ms = 20) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
