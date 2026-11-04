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

## Local development data

Run `npm run db:setup:local` to create `.data/barhoppr.db` and point `.env` at it.
The command backs up an existing environment file to an ignored
`.env.production.backup-*` file before changing the database connection, creates
a separate local auth secret, and seeds fictional venues, drinks, and visits.
It never connects to or copies data from the previous database. Repeating the
command preserves existing local records. The database and environment backups
are ignored by Git. Restart the dev server after setup.

OAuth sign-in still requires provider credentials with a local callback URL:
`http://localhost:3000/api/auth/callback/github` or
`http://localhost:3000/api/auth/callback/google`. Use separate development OAuth
applications when the production provider is configured for your deployed URL.

For an existing database, the visit-rating migration is in
`drizzle/0001_visit_rating.sql`; `npm run db:migrate:visits` applies it once to
the database selected by the environment. Review the target before running it.
Production has not been migrated by the local setup.

Run `npm test`, `npm run lint`, and `npm run build` to check the app. Location
search matches venue names and descriptions, while “near me” filters actual
coordinates locally after the visitor grants geolocation permission. No
geocoding service or API key is required. Venue directions open Google Maps.

Both Find a drink fields suggest listed drinks, breweries, styles, or venues
after a 500 ms typing pause (at least two characters). Area text matches venue
descriptions. Suggestions respect the other field and active filters; choose
one with the mouse or arrow keys and Enter, then submit the search.

The colour theme follows the device by default and supports saved light and
dark overrides. Beer transitions and decorative animations respect the
browser’s reduced-motion preference.

## Community drink reports

Visits can select any drink from the shared catalogue, including drinks not yet
listed at that venue, or add a new drink with its producer, type, style, and ABV.
Posting records the sighting and links those drinks to the venue, making the
venue discoverable through drink searches and the map. Repeated reports reuse
existing drink and venue records, and drink details show the latest report date.
Listings describe community reports; availability can change.

The new-drink name field offers online suggestions from Wikidata after a
500 ms typing pause (at least three characters). Choosing a suggestion fills
available producer, type, style, and ABV details for review before posting.
Fields remain editable, and manual entry works when there is no match or the
source is unavailable. Coverage varies, especially for smaller producers.
No API key is needed. The server batches metadata requests, caches lookups for
15 minutes per process, limits upstream traffic, and honours provider backoff.
Only explicitly recorded, unambiguous percentage ABV values are filled.
Structured data is sourced from [Wikidata](https://www.wikidata.org/wiki/Wikidata:Data_access)
under CC0; the selected entry is linked in the form.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
