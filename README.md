# Crypto Price Alert Bot (Discord + Telegram)

Simple alert bot that notifies when a crypto hits a target price.

## Features
- Add alerts like `!alert btc 70000` or `!alert eth below 3000`
- Checks prices every 60 seconds (CoinGecko free API)
- Persists alerts in SQLite
- Discord and Telegram bots

## Supported symbols
- btc / bitcoin
- eth / ethereum
- sol / solana
- xrp / ripple

## Setup
1. Create folder and install deps
```
npm install
```

2. Create `.env` from example
```
cp .env.example .env
# set DISCORD_TOKEN and TG_TOKEN
```

3. Run Discord bot
```
npm start
```

4. Run Telegram bot (optional)
```
npm run telegram
```

## Discord notes
- Enable the "Message Content Intent" in the Discord Developer Portal for your bot.
- Commands accepted: `!alert` or `/alert` prefix.
  - `!alert btc 70000` (defaults to above)
  - `!alert eth below 3000`

## Deploy
- Run the bot on a small VPS or platforms like Railway/Render/Fly.

## Monetization (optional later)
- Add `is_premium` in user table and limit free users to 1 alert.
