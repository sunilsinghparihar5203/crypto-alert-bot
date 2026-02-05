import TelegramBot from "node-telegram-bot-api";
import db from "./db.js";
import { checkAlerts } from "./alertChecker.js";
import dotenv from "dotenv";
import { toId } from "./priceFetcher.js";

dotenv.config();
const { TG_TOKEN } = process.env;
if (!TG_TOKEN) {
  console.error(
    "Missing TG_TOKEN. Create a .env file (do not edit .env.example) and set TG_TOKEN=your_token",
  );
  process.exit(1);
}

const bot = new TelegramBot(TG_TOKEN, { polling: true });
bot
  .getMe()
  .then((me) => console.log(`Telegram bot started as @${me.username}`))
  .catch(() => {});

bot.onText(
  /\/alert\s+(\S+)(?:\s+(above|below))?\s+(\d+(?:\.\d+)?)/i,
  (msg, match) => {
    const chatId = msg.chat.id;
    const symbolRaw = match[1];
    const direction = (match[2] || "above").toLowerCase();
    const price = Number(match[3]);

    if (!Number.isFinite(price) || price <= 0) {
      bot.sendMessage(chatId, "Please provide a valid positive price.");
      return;
    }

    const symbolId = toId(symbolRaw);

    db.run(
      "INSERT INTO alerts (user_id, symbol, price, direction) VALUES (?,?,?,?)",
      [String(chatId), symbolId, price, direction],
      (err) => {
        if (err) {
          console.error("DB insert error", err);
          bot.sendMessage(chatId, "Failed to set alert. Try again later.");
          return;
        }
        bot.sendMessage(
          chatId,
          `✅ Alert set for ${symbolId} ${direction} $${price}`,
        );
      },
    );
  },
);

setInterval(() => {
  checkAlerts((chatId, text) => bot.sendMessage(chatId, text).catch(() => {}));
}, 60_000);
