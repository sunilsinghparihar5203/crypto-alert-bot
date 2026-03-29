# Hosting your compliance pages

You can host these static files on any free static host: 

## GitHub Pages (recommended) 
1. Create a new public repo or use an existing one. 
2. Push the `public/` folder to the repo. 
3. In repo Settings → Pages, set source to `main` (or `gh-pages`) and `/public` folder.
4. GitHub will give you a public URL like `https://yourusername.github.io/repo/`.

## Netlify / Vercel
1. Drag and drop the `public/` folder.
2. You’ll get a public URL immediately.

## What to do with the URLs
- Discord Developer Portal → Verification:
  - Terms of Service: `https://your-public-url/terms.md`
  - Privacy Policy: `https://your-public-url/privacy.md`
  - Install Link: generate from OAuth2 URL Generator and paste it.

## Customize
- Replace `YOUR_CLIENT_ID` in index.html with your Discord Application Client ID.
- Replace `@YourBotUsername` and contact info in all files.

## Notes
- Keep the URLs live as long as the bot is public.
- Update the dates if you change the policies.
