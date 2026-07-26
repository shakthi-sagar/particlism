# Particlism

An interactive particle-life simulator built with React and Vite. Particle configurations can be shared through short links backed by Cloudflare KV.

## Development

```bash
npm install
npm run dev
```

The Vite server runs the UI only. To test the production build with Pages Functions and local KV:

```bash
npm run build
npm run cf:dev
```

## Deployment

```bash
npm run deploy
```

The site deploys to the existing `particlism` Cloudflare Pages project.
