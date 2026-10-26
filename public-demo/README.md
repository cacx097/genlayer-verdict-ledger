# GenLayer Verdict Ledger — Cloudflare Pages public demo candidate

**Status: BUILD PACKAGE ONLY; NOT DEPLOYED.** This folder is independent from the existing Windows local app and PolicySignal.

## Deployment structure
- `public/`: complete standalone static browser app (vanilla JavaScript, responsive layout)
- `functions/api/status.js`: Cloudflare Pages Function for POST-only, fixed `gen_getTransactionStatus` forwarding to GenLayer Studionet
- `tests/public.test.mjs`: Node tests of local hash chain, request validation and read-only proxy behavior

For **Cloudflare Pages**, point build output to `public` and Functions directory to the sibling `functions`, with the repository root set to `public-demo`. With Wrangler, `npx wrangler pages deploy public --project-name <approved-new-project>` from this folder uses the Pages Functions directory; only run after separate permission. Do not reuse PolicySignal's existing Pages project.

## Behavior and truthfulness
Browser-only `localStorage` history, max 100 snapshots, max six hashes per manual batch, no wallet or keys, no automatic polling, JSON report with chained SHA-256 entries. The Function accepts only same-origin POST and a fixed read-only method. It is **not per-user rate-limited at the edge**, so a free public endpoint may be abused unless account-side Cloudflare protections/quotas are configured. User quota and free hosting limits should be confirmed before publishing.

There is no receipt or independent attestation; `FINALIZED` does not mean execution SUCCESS. The browser-local SHA-256 chain detects simple edits but is not tamper-proof against a deliberate full rewrite. Browsers can clear stored history; users must export if they need preservation. The browser-local journal and local Windows app store separate histories.

## Tests
`node --test tests/public.test.mjs`

Three checks passed on 2026-10-26: hash-chain tampering/change detection, blocked invalid/cross-origin/GET requests, and the fixed read-only RPC method with deterministic mock result.

**Not yet done:** live deployment/browser E2E of the *public* Pages build, external-source publication, official Portal Projects review/submit. Existing local Windows app already separately passed real RPC and Chromium PC/mobile QA; those tests do not establish Pages production readiness.
