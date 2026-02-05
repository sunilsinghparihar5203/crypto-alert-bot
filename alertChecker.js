import db from "./db.js";
import { getPrices, toId } from "./priceFetcher.js";

export async function checkAlerts(sendMessage, options = {}) {
  const rows = await new Promise((resolve, reject) => {
    db.all("SELECT * FROM alerts", (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  }).catch((err) => {
    console.error("DB read error", err);
    return [];
  });

  if (rows.length === 0) return;

  const ids = rows.map((r) => toId(r.symbol));

  let priceMap = {};
  try {
    priceMap = await getPrices(ids, options);
  } catch (e) {
    console.error("Fetch prices failed", e);
    return;
  }

  for (const alert of rows) {
    const id = toId(alert.symbol);
    const current = priceMap[id];
    if (typeof current !== "number") continue;
    const target = Number(alert.price);
    const hit =
      (alert.direction === "above" && current >= target) ||
      (alert.direction === "below" && current <= target);

    if (hit) {
      try {
        await sendMessage(
          alert.user_id,
          `🚨 ${id.toUpperCase()} hit $${current} (target ${alert.direction} $${target})`,
        );
      } catch (e) {
        console.error("Failed to send alert", e);
      }

      await new Promise((resolve, reject) => {
        db.run("DELETE FROM alerts WHERE id=?", alert.id, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }).catch(() => {});
    }
  }
}
