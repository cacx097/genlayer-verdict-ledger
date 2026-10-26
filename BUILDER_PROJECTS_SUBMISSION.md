# GenLayer Builder > Projects — submission draft (NOT SUBMITTED)

**Project name:** GenLayer Verdict Ledger — Auditable Studionet Transaction Status Journal

**Summary:** A read-only GenLayer Studionet developer utility that lets anyone track up to 12 transaction hashes, record timestamped consensus status observations, compare actual observed changes, verify a chained SHA-256 local history, and export a portable JSON report. No wallet, signing, transaction write, or paid infrastructure is required for local operation.

**Why useful:** GenLayer consensus lifecycle is not equivalent to contract execution outcome. Explorer views are good for inspecting a current transaction. This tool focuses instead on durable, reproducible *point-in-time* monitoring evidence for multiple transactions, including RPC failures and change counts. It does not invent unsupported receipt data or claim validator proof.

**Technology / independent implementation:** Node.js 22+, Node HTTP server, vanilla HTML/CSS/JavaScript, GenLayer Studionet JSON-RPC `gen_getTransactionStatus`, JSONL SHA-256 hash chain. No contract deployment or API secrets.

**Evidence already verified locally:** 6 Node integration/unit tests PASS; desktop and 390px mobile Chrome/Chromium E2E with deterministic RPC PASS; one *real* RPC E2E read returned FINALIZED and the downloaded JSON was re-parsed and matched with stored SHA-256 tip. Real read verifies status only, not execution success.

**Before Portal submission:** publish new standalone source repository, arrange public documentation/demo where technically appropriate, confirm the Portal allows this project type, and preserve truthful implementation limitations. Do not reuse PolicySignal repo as this project's evidence. User does CAPTCHA and final submit.

**Required public links:** NEW GitHub repo URL (not created); public demo/docs URL (not created). Never invent these.

**Status:** Draft ready for review; no GenLayer contribution submitted and no points earned for this candidate.
