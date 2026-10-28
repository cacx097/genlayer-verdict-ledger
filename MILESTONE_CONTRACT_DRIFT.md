# Verdict Ledger — Contract Drift & Evidence Timeline (Milestone v2)

**Project:** GenLayer Verdict Ledger (user-reported accepted Builder Project)
**Status:** Published at https://cacx097.github.io/genlayer-verdict-ledger/milestone.html ; Builder Milestone submission NOT yet performed.
**Independent novelty:** Original project tracks transaction status and one-time contract identity. This new feature captures *repeated* real GenLayer contract-code/schema fingerprints, detects differences across observation times and produces a verifiable hash-linked timeline and downloadable JSON.

## Verifiable read-only implementation
- GenLayer Studionet `gen_getContractCode` and `gen_getContractSchema`, positional contract-address arguments.
- Existing PolicyGuard contract `0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2` and SourceQuorum `0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a`.
- SHA-256 fingerprints of decoded deployed code and sorted public method schemas; each observation captures date, address and digest of the previous observation. Browser-local storage, verification and export.
- No new IC deployed; the two real contracts were deployed earlier for separate projects. No contract writes, fees, wallet signing, validator consensus or fabricated status/history.
- Hash links are not cryptographic attestations of upstream truth and do not catch a full malicious rewrite absent independently retained tip.
- An unchanged fingerprint across two captured observations does not prove contract state remained unchanged between them.

## Independent verification
- Live HTTP 200 after publishing.
- Live desktop Chromium E2E PASS: actual PolicyGuard contract code/schema read, two snapshots with unchanged code/schema comparison, real SourceQuorum read, SHA-256 chain verification, local persistence, JSON export.
- Mobile Chromium 390px E2E PASS: actual SourceQuorum contract read, code fingerprint rendered, no page horizontal overflow after a responsive CSS fix. Verified on public GitHub Pages 2026-10-28.
- Known initial frontend issue: snapshot grouping mistakenly compared display name with select key; fixed to group by exact deployed contract address. The fix is published in `docs/milestone.js`.
- Source: `docs/milestone.js`, `docs/milestone.html`. All features read-only.
- Previous approved project state and existing Verdict Ledger main UI remain unchanged.

## User action
Select GenLayer Portal **Builder > Milestones**, choose approved Verdict Ledger project, link the public milestone page and source repository, provide exact before/after novelty, attach evidence, and personally finish CAPTCHA/submission. Do not claim BP/approval until Portal confirms.
