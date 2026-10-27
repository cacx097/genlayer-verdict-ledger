# GenLayer Verdict Ledger

Read-only GenLayer Studionet transaction status journal and evidence exporter. Independent from the PolicySignal project.

## Features
- Manual read-only `gen_getTransactionStatus` queries (no wallet, fees, signatures or transaction writes)
- Timestamped multi-transaction observations, error tracking, and observed status changes
- SHA-256 chained JSONL history in the local edition
- JSON report export and responsive browser interface
- Optional Cloudflare Pages demo with browser-local storage (see `public-demo/`)

**Important:** `FINALIZED` does **not** prove successful contract execution. A SHA-256 link detects edits only when its trusted digest is retained; it is not blockchain attestation.

## Run locally (Node.js 22+)

On Windows, double-click `START_VERDICT_LEDGER.cmd`, then open http://127.0.0.1:5179/ or run:

```sh
node web-server.mjs
node --test tests/*.test.mjs
```

The server listens on localhost only. It uses a fixed read-only RPC method, rate limits and local JSONL file storage. There is no automatic polling.

## Public Pages demo source

The `public-demo/` directory contains a standalone Cloudflare Pages site using a POST-only Pages Function to make a read-only Studionet request. History lives in the visitor's browser; it is separate from the Windows app. See `public-demo/README.md` for deployment and security limitations.

## Verification scope

Local Node tests (6/6), desktop/mobile Chromium E2E with mocked upstream, plus a separate **real GenLayer Studionet browser integration test** passed as of October 2026. The real test returned transaction status `FINALIZED` and verified JSON report digest consistency; it did not verify contract execution outcome. Public deployment and GenLayer Builder review are separate and not guaranteed.

## Builder Projects

This is a new independent Builder Projects candidate. Submission draft: `BUILDER_PROJECTS_SUBMISSION.md`. Project acceptance, BP and airdrop outcomes are not guaranteed.

## Intelligent Contract provenance (GitHub Pages edition)

The public `docs/` application also reads real deployed GenLayer Studionet Intelligent Contract code and schemas using `gen_getContractCode` / `gen_getContractSchema` (read-only). `PolicyGuard` (`0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2`) and `SourceQuorum` (`0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a`) are **previously deployed contracts also used by separate projects**, not new Verdict Ledger deployments. The tool shows SHA-256 code fingerprints, published read-only method schemas, explorer links and JSON export. This is independent from its transaction-observation history; it does not prove any entered transaction was caused by either contract. Verified in the real public Chromium browser on 2026-10-27; the contract code and schema reads and JSON export passed for both.

No Cloudflare is used by the live GitHub Pages site. Legacy `public-demo/` sources remain historical only; `docs/` is the active edition.
