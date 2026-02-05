import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import db from "./db.js";
import { checkAlerts } from "./alertChecker.js";
import dotenv from "dotenv";
import { toId } from "./priceFetcher.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author?.bot) return;
  const content = (msg.content || "").trim();
  if (!content.startsWith("!alert") && !content.startsWith("/alert")) return;

  const parts = content.split(/\s+/);
  if (parts.length < 3) {
    msg.reply(
      "Usage: !alert <symbol> [above|below] <price>\nExamples: !alert btc 70000 | !alert eth below 3000",
    );
    return;
  }

  const symbolRaw = parts[1];
  let direction;
  let priceStr;

  if (
    parts.length >= 4 &&
    ["above", "below"].includes(parts[2].toLowerCase())
  ) {
    direction = parts[2].toLowerCase();
    priceStr = parts[3];
  } else {
    direction = "above";
    priceStr = parts[2];
  }

  const price = Number(priceStr);
  if (!Number.isFinite(price) || price <= 0) {
    msg.reply("Please provide a valid positive price.");
    return;
  }

  const symbolId = toId(symbolRaw);

  db.run(
    "INSERT INTO alerts (user_id, symbol, price, direction) VALUES (?,?,?,?)",
    [msg.author.id, symbolId, price, direction],
    function (err) {
      if (err) {
        console.error("DB insert error", err);
        msg.reply("Failed to set alert. Try again later.");
        return;
      }
      msg.reply(`✅ Alert set for ${symbolId} ${direction} $${price}`);
    },
  );
});

client.login(process.env.DISCORD_TOKEN);

setInterval(() => {
  checkAlerts((userId, text) =>
    client.users
      .fetch(userId)
      .then((user) => user.send(text))
      .catch(() => {}),
  );
}, 60_000);
