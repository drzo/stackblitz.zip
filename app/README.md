# stackblitz.zip

A simple [Nitro](https://nitro.build) API that lets you download [StackBlitz](https://stackblitz.com/) projects programmatically by changing the domain from `stackblitz.com` to `stackblitz.zip`.

Deployed on Vercel at [stackblitz.zip](https://stackblitz.zip).

> [!IMPORTANT]
> This project is not affiliated with or endorsed by StackBlitz in any way. Users are responsible for ensuring their use of this tool complies with [StackBlitz's Terms of Service](https://stackblitz.com/terms-of-service). Please review their terms before using this tool.

## Usage

Replace `stackblitz.com` with `stackblitz.zip` in any StackBlitz edit URL:

```bash
# Original URL
https://stackblitz.com/edit/nuxt-starter-k7spa3r4

# Download URL
https://stackblitz.zip/edit/nuxt-starter-k7spa3r4
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Visit http://localhost:3000 for API information.

## Examples

- http://localhost:3000/edit/nuxt-starter-k7spa3r4.zip
- http://localhost:3000/edit/vitejs-vite-starter.zip

The `.zip` extension is optional but makes it clear you're downloading a zip file.

## Deployment

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

Deploy to any platform using [Nitro's deployment presets](https://nitro.build/deploy) - supports Vercel, Netlify, Cloudflare Pages, AWS, Azure, Node.js, and many more.
