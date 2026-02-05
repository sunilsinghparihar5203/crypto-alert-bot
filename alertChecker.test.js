import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { checkAlerts } from "./alertChecker.js";
import db from "./db.js";
import { mockFetch } from "./testHelpers.js";

describe("alertChecker", () => {
  let sendMessageMock;

  beforeEach(() => {
    sendMessageMock = mock.fn();
  });

  afterEach(() => {
    // Clean up DB after each test
    db.run("DELETE FROM alerts");
  });

  it("does nothing when no alerts exist", async () => {
    const fetchFn = mockFetch({ bitcoin: 100 }).mock;
    await checkAlerts(sendMessageMock.mock, { fetchFn });
    assert.strictEqual(sendMessageMock.mock.callCount(), 0);
  });

  it("sends notification and deletes alert when condition is met", async () => {
    // Insert an alert that should trigger (BTC below a very high price)
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO alerts (user_id, symbol, price, direction) VALUES (?,?,?,?)",
        ["user1", "bitcoin", 1, "below"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        },
      );
    });

    const fetchFn = mockFetch({ bitcoin: 0.5 }).mock;
    await checkAlerts(sendMessageMock.mock, { fetchFn });

    assert.strictEqual(sendMessageMock.mock.callCount(), 1);
    const [userId, message] = sendMessageMock.mock.calls[0].arguments;
    assert.strictEqual(userId, "user1");
    assert(typeof message === "string");
    assert(message.includes("BITCOIN"));
    assert(message.includes("$"));

    // Ensure alert was deleted
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM alerts", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    assert.strictEqual(rows.length, 0);
  });

  it("does not send notification if condition not met", async () => {
    // Insert an alert unlikely to trigger (BTC above a very high price)
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO alerts (user_id, symbol, price, direction) VALUES (?,?,?,?)",
        ["user2", "bitcoin", 999999999, "above"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        },
      );
    });

    const fetchFn = mockFetch({ bitcoin: 1000 }).mock;
    await checkAlerts(sendMessageMock.mock, { fetchFn });
    assert.strictEqual(sendMessageMock.mock.callCount(), 0);
  });

  it("handles multiple alerts", async () => {
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO alerts (user_id, symbol, price, direction) VALUES (?,?,?,?)",
        ["userA", "bitcoin", 1, "below"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        },
      );
    });
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO alerts (user_id, symbol, price, direction) VALUES (?,?,?,?)",
        ["userB", "ethereum", 1, "below"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        },
      );
    });

    const fetchFn = mockFetch({ bitcoin: 0.5, ethereum: 0.5 }).mock;
    await checkAlerts(sendMessageMock.mock, { fetchFn });
    assert.strictEqual(sendMessageMock.mock.callCount(), 2);
    const userIds = sendMessageMock.mock.calls.map((call) => call.arguments[0]);
    assert(userIds.includes("userA"));
    assert(userIds.includes("userB"));
  });
});
