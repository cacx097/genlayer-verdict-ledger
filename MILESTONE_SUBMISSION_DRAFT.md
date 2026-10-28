# GenLayer Builder > Milestones — Contract Drift & Evidence Timeline

**State:** Ready-to-copy submission content, but only submit after final GitHub Pages mobile layout QA is confirmed. This is a Milestone for the already-approved **GenLayer Verdict Ledger** project, not a new Projects submission. No Portal submission or BP award has occurred.

## Milestone title
Contract Drift & Evidence Timeline

## One-liner (125 chars)
Tracks deployed GenLayer contract code and schema changes over time with hash-linked snapshots and exportable audit evidence.

## Description (900 chars)
Contract Drift & Evidence Timeline is a new, read-only milestone for the approved GenLayer Verdict Ledger project. It adds repeated on-chain code and method-schema snapshots for two real Studionet Intelligent Contracts, PolicyGuard and SourceQuorum. Users capture the deployed code and public method metadata directly through GenLayer RPC, then compare SHA-256 fingerprints across observation times to identify code or schema differences. Each browser-local snapshot is timestamped and linked to the previous snapshot digest. Users can verify the record chain and export a complete JSON evidence timeline. This is a substantive addition beyond Verdict Ledger's original transaction-status journal and one-time contract identity checks. The two contracts were previously deployed for separate projects; no new contract deployment, validator consensus, wallet signature, or paid transaction is claimed.

## Reviewer steps
1. Visit https://cacx097.github.io/genlayer-verdict-ledger/milestone.html
2. Select PolicyGuard, click **Read contract and capture** twice.
3. The second snapshot should show `codeChanged=false` and `schemaChanged=false` for repeated unchanged responses, not a claim about unseen intermediate changes.
4. Select SourceQuorum and capture a third observation.
5. Click **Verify saved chain** and **Export full evidence JSON**. Confirm `verdict-contract-drift-v2.json` contains timestamped records, deployed code/schema fingerprints and previousDigest links.

## Verification outcome (487 chars)
Open the milestone page, choose PolicyGuard and click Read contract and capture twice. The second record shows codeChanged=false and schemaChanged=false for unchanged RPC responses. Choose SourceQuorum and capture again. Click Verify saved chain to confirm three linked snapshots, then export verdict-contract-drift-v2.json. Desktop browser QA confirmed real code/schema reads, comparison, persistence and JSON download. This proves observed responses, not unobserved historical changes.

## Actual links
- Approved parent project site: https://cacx097.github.io/genlayer-verdict-ledger/
- New milestone site: https://cacx097.github.io/genlayer-verdict-ledger/milestone.html
- Primary GitHub source: https://github.com/cacx097/genlayer-verdict-ledger/blob/main/docs/milestone.js
- Milestone source page: https://github.com/cacx097/genlayer-verdict-ledger/blob/main/docs/milestone.html
- Explanation: https://github.com/cacx097/genlayer-verdict-ledger/blob/main/MILESTONE_CONTRACT_DRIFT.md
- Existing deployed contracts: PolicyGuard https://explorer-studio.genlayer.com/address/0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2 ; SourceQuorum https://explorer-studio.genlayer.com/address/0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a

## Tags
If Portal presents the same choices as the parent Projects form, prioritize Contract Monitoring then Failure Diagnosis. Do not claim actual Portal Milestones tags unless displayed. Do not duplicate previously submitted URLs where the Portal refuses duplicates.

## Limitations
This milestone reads existing contracts. It has not deployed any new IC and has not executed validator consensus. SHA-256 hash chaining is tamper-evident only relative to a separately retained trusted digest. Snapshots only sample observations. No Cloudflare.
