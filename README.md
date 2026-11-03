This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# BarHoppr

Find your favourite beer on tap near you! 🍻

## Run locally

1. Clone the repository
```bash
git clone https://github.com/maybMedia/barhoppr.git
```

2. Install dependencies
```bash
npm i
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Dependency security

The npm overrides keep PostCSS and the migration loader's esbuild on patched
versions. The Minimatch override uses v11 to address
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
`tools/minimatch-compat.cjs` adapts its CommonJS export for the lint plugins when
ESLint loads its configuration. All matching uses upstream v11; the adapter
does not modify installed files. Remove it and the Minimatch override when the
lint dependencies support patched releases directly.

Run `node --test tools/minimatch-compat.test.cjs`, `npm run lint`, and `npm audit`
to verify the compatibility adapter and dependency security.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
