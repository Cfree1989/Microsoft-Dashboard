# Payment / Batch Payment Fragility Review

**Purpose:** Shared prompt and research log for reviewing fragility, blind spots, and bad-data risks in the single-payment and consolidated batch-payment flows  
**Status:** Active review doc for multi-AI input  
**Primary References:** `PowerApps/StaffDashboard-App-Spec.md`, `SharePoint/Payments-List-Setup.md`, `SharePoint/PrintRequests-List-Setup.md`, `SharePoint/BuildPlates-List-Setup.md`, `PowerAutomate/Flow-(G)-Export-MonthlyTransactions.md`

---

## What We Are Reviewing

This review is focused on the interaction between these data models and UI flows:

- `PrintRequests` - parent request status and payment rollups
- `Payments` - canonical payment ledger
- `BuildPlates` - pickup-time plate context for jobs that use plates
- `btnPaymentConfirm` - single-request payment save path
- `btnBatchPaymentConfirm` - consolidated multi-request batch payment save path

The current intended model is:

- Single payment creates one `Payments` row tied to `RequestID`
- Batch payment creates one consolidated `Payments` row for the real-world checkout
- A consolidated batch row stores per-request splits in `BatchRequestIDs`, `BatchReqKeys`, and `BatchAllocationSummary`
- `PrintRequests.FinalWeight`, `FinalCost`, and `PaymentDate` are convenience rollups, not the canonical ledger
- Single payment can be partial pickup
- Batch payment is final pickup only for every selected request
- `PlateIDsPickedUp` stores the best available stable pickup-time plate snapshot, but the `Payments` row is still the canonical financial record

This doc exists to pressure-test whether that model is actually robust in day-to-day lab usage.

---

## Reference Snapshot

Use `PowerApps/StaffDashboard-App-Spec.md` as the implementation reference. The most relevant areas are:

- Step 12C payment modal, especially `btnPaymentConfirm.OnSelect`
- Step 12E batch payment modal, especially `btnBatchPaymentConfirm.OnSelect`
- Batch selection behavior around `btnAddMoreItems`, card click toggling, and `btnProcessBatchPayment`
- Revert flow around `btnRevertConfirm`
- Payment history display formulas that rebuild `colPayments`

Use these docs for intended behavior:

- `SharePoint/Payments-List-Setup.md`
- `SharePoint/PrintRequests-List-Setup.md`
- `SharePoint/BuildPlates-List-Setup.md`
- `PowerAutomate/Flow-(G)-Export-MonthlyTransactions.md`

---

## Review Goals

Ask whether the system can get into inconsistent, ambiguous, stale, or hard-to-recover states.

Specifically look for:

- canonical `Payments` data being missing, duplicated, or partially saved
- `PrintRequests` rollups drifting from the payment ledger
- cases where a button appears to succeed but the underlying lists disagree
- cases where partial failures leave staff with no safe retry path
- cases where batch and single payment do not follow the same source-of-truth rules
- scenarios where text parsing or local collections become hidden dependencies for correct results
- policy gaps where staff cannot tell what the app will do before clicking
- recovery gaps where a mistaken payment can only be fixed by manual SharePoint surgery

---

## Key Design Questions

### 1. Canonical Ledger Safety

Questions:

- Can the app ever mark a request as paid without a matching canonical `Payments` row?
- Can one real-world checkout create multiple ledger interpretations depending on which button path was used?
- Are retries idempotent, or can the same human action create duplicates or partial duplicates?

### 2. Parent Rollup Reliability

Questions:

- Do `FinalWeight`, `FinalCost`, and `PaymentDate` always reflect every payment that applies to a request?
- Are consolidated batch allocations treated consistently anywhere the app rebuilds payment history?
- If a request is reopened after payment, can later saves undercount prior history?

### 3. Button Semantics and Operator Trust

Questions:

- Do `Record Payment`, `Record Partial Payment`, `Add More Items`, and `Record Batch Payment` do exactly what a staff member would reasonably expect?
- Does batch clearly communicate that it is a final pickup for all remaining completed pieces?
- Are there realistic click paths where staff thinks they are retrying or correcting data, but actually creates a second transaction pattern?

### 4. Text-Parsing Fragility

Questions:

- Which behaviors depend on parsing human-readable strings like `REQ-00164: $21.18 for 181.41g`?
- What breaks if those strings are manually edited, formatted differently, or generated slightly differently later?
- Should structured batch-allocation data exist instead of re-parsing display text?

### 5. Operational Recovery

Questions:

- If staff reopens a paid request, what is the intended correction path?
- Can staff void a bad payment, or only layer more payments on top?
- Does the app help staff reconcile partial batch failures, or does it simply warn after the fact?

---

## Suggested Review Scenarios

Review these scenarios first:

1. Single payment saves the `Payments` row, but one plate patch or the parent patch fails.
2. Batch closes 2 requests successfully, then the final consolidated ledger row fails to save.
3. Batch succeeds for some items and fails for others, then staff follows the prompt to "retry."
4. A request was previously included in a consolidated batch row, is later reverted to `Completed`, and then gets another payment.
5. A staff member manually edits a `BatchAllocationSummary` string in SharePoint to fix a typo.
6. A mixed filament/resin batch is assembled even though the written rules say methods must match.
7. A request is reopened from `Paid & Picked Up` to `Completed` because the first payment was wrong.
8. A staff member expects batch mode to preserve one checkout number across retries, but uniqueness checks block it.

Then look for additional edge cases not listed here.

---

## What To Produce

Each reviewer should add:

- findings ordered by severity
- the exact control, formula, or data-model area involved
- why it is fragile
- whether it is a real defect, a recovery gap, a UX risk, or a policy gap
- a proposed mitigation

Do not just restate the intended design. Try to break it.

---

## Output Format For Reviewers

Append a new section at the bottom of this file using this template:

```md
## Review Entry - <AI Name or Tool> - <Date>

### Findings

1. <severity>: <short title>
   - Area: <control / formula / data model>
   - Risk: <what can go wrong>
   - Evidence: <reference to spec / formula behavior>
   - Recommendation: <what to change or watch>

2. ...

### Open Questions

- ...

### Safe / Sound Areas

- ...
```

If you find no serious issues, say that explicitly and list residual risks anyway.

---

## Notes For Reviewers

- The current batch architecture is **not** the older "one payment row per request" model. It now writes one consolidated `Payments` row per checkout.
- Distinguish between:
  - hard data integrity risk
  - stale UI risk
  - recovery gap
  - policy / UX ambiguity
  - acceptable operational tradeoff
- Prefer concrete workflow failures over abstract architecture complaints.
- If you cite a fragility that existed in the older build-plate review, confirm whether it still exists in the current consolidated batch design before repeating it.

---

## Seed Observations

These are already known or strongly suspected concerns worth confirming or disproving:

- Single payment still writes the canonical `Payments` row before later plate and parent updates complete.
- Batch updates requests first and writes the single consolidated ledger row afterward.
- Payment history for requests that appear inside a consolidated batch row is rebuilt by parsing human-readable allocation text.
- Revert now allows `Paid & Picked Up -> Completed` while preserving prior `Payments` history.
- The spec text says batch selections must all use the same `Method`, but the visible save path appears to price each request by its own `Method.Value`.

---

## Review Log

### Current architecture notes

Reviewed the current `PowerApps/StaffDashboard-App-Spec.md` and related SharePoint docs on March 30, 2026. Key takeaways relevant to this review:

- **Single payment:** `btnPaymentConfirm.OnSelect` refreshes sources first, inserts one `Payments` row, then patches `BuildPlates`, refreshes collections, and finally patches `PrintRequests` rollups/status.
- **Batch payment:** `btnBatchPaymentConfirm.OnSelect` revalidates each selected request, patches request/plate state per request, then writes one consolidated `Payments` row containing `BatchRequestIDs`, `BatchReqKeys`, and `BatchAllocationSummary`.
- **History display:** the payment modal reconstructs request-level history by including both direct `RequestID` rows and consolidated batch rows whose `BatchRequestIDs` mention the request ID, then derives `DisplayWeight`, `DisplayAmount`, and `DisplayPlatesPickedUp` by parsing batch summary text.
- **Export path:** the monthly TigerCASH export intentionally treats the `Payments` list as the canonical ledger and exports one row per real-world batch checkout, not one row per affected request.

---

## Review Entry - GPT-5.4 - March 30, 2026

### Findings

1. **Critical - Single payment is still non-transactional after the ledger row is created**
   - **Area:** `btnPaymentConfirm.OnSelect`
   - **Risk:** The app inserts the canonical `Payments` row first, then separately patches `BuildPlates` and `PrintRequests`. If a later patch fails, the payment ledger says money was taken but plate state or parent totals can remain behind. Staff sees a "payment saved" style outcome with no rollback.
   - **Evidence:** The `Payments` insert is wrapped in `IfError`, but the later `ForAll(... Patch(BuildPlates ...))` and final `Patch(PrintRequests, ...)` are not protected by the same all-or-nothing mechanism.
   - **Classification:** Real defect / hard data integrity risk.
   - **Recommendation:** Move the whole save into a server-side flow or add explicit compensation: if any later patch fails, flag the new payment as needing reconciliation and stop the success path. Do not treat the ledger insert alone as a completed payment.

2. **Critical - Batch can mark requests paid before the consolidated ledger row exists**
   - **Area:** `btnBatchPaymentConfirm.OnSelect`
   - **Risk:** Step 3 patches `BuildPlates` and `PrintRequests` for each successful request before Step 4 writes the single consolidated `Payments` row. If Step 4 fails, requests can already be `Paid & Picked Up` with updated rollups and no canonical batch ledger row.
   - **Evidence:** The formula intentionally sets `varBatchLedgerSaveFailed` if the final `Patch(Payments, Defaults(Payments), ...)` fails, and the recovery message says the selected requests were already updated and staff must reconcile manually.
   - **Classification:** Real defect / hard data integrity risk.
   - **Recommendation:** Treat ledger creation as the gating step, not the cleanup step. Either orchestrate the entire batch server-side, or stage the checkout first and only close requests after the consolidated `Payments` row saves successfully.

3. **High - Partial batch retry path is internally contradictory**
   - **Area:** `btnBatchPaymentConfirm.OnSelect` uniqueness check plus partial-failure cleanup
   - **Risk:** The UX says failed items can be reviewed and retried, but once the succeeded subset writes the consolidated payment row, the same `TransactionNumber` already exists. Retrying with the original checkout number is blocked; retrying with a new number splits one real-world checkout across multiple ledger rows.
   - **Evidence:** Step 1 blocks `TransactionNumber` reuse against all `Payments` rows. Step 6 keeps failed items in `colBatchItems` and tells staff to review and retry.
   - **Classification:** Recovery gap / operational fragility.
   - **Recommendation:** Decide explicitly between:
     - true all-or-nothing batches, or
     - a resumable batch model that can append failed items into the same checkout record.
     The current hybrid model promises retry but does not support a clean accounting outcome.

4. **High - Batch request rollups ignore prior consolidated batch history**
   - **Area:** `btnBatchPaymentConfirm.OnSelect` per-item rollup calculation
   - **Risk:** Batch parent rollups use `wPriorPayments: Filter(Payments, RequestID = BatchItem.ID)`, which excludes older consolidated batch rows where `RequestID` is blank and the request only appears inside `BatchRequestIDs`. If a request is reopened after a prior batch payment and paid again, the new rollup can undercount older batch history.
   - **Evidence:** Elsewhere in the app, request payment history is rebuilt using `RequestID = <id> Or Text(<id>) in Split(BatchRequestIDs, ", ").Value`, which acknowledges that consolidated rows still belong to the request context. The batch rollup path does not use that broader rule.
   - **Classification:** Real defect / rollup drift risk.
   - **Recommendation:** Centralize one reusable definition of "payments affecting this request" and use it everywhere. If consolidated batch rows are part of request history in the UI, they must also count when recomputing request totals.

5. **Medium - Request-level payment history depends on parsing human-readable batch text**
   - **Area:** `colPayments` rebuild logic and payment-history display
   - **Risk:** `DisplayWeight`, `DisplayAmount`, and `DisplayPlatesPickedUp` for consolidated rows are reconstructed by parsing strings like `REQ-00164: $21.18 for 181.41g` and `REQ-00164: 1/1 | REQ-00165: 1/1`. Small format drift, manual list edits, or future wording changes can quietly break history and parent recomputation.
   - **Evidence:** The formulas repeatedly use `Split(...)`, `StartsWith(...)`, and string cleanup against `BatchAllocationSummary` and `PlatesPickedUp` to rebuild per-request values.
   - **Classification:** Structural fragility / medium data-quality risk.
   - **Recommendation:** Prefer structured batch-allocation storage over text parsing. At minimum, keep the serialization format versioned and move parsing into one helper pattern so changes cannot drift across multiple formulas.

6. **Medium - Batch method policy is ambiguous in the current spec vs. formulas**
   - **Area:** Batch eligibility rules, selection behavior, and batch pricing formulas
   - **Risk:** The written rule says all selected batch items must use the same `Method`, but the visible save logic does not enforce that and the pricing code already branches per item by `Method.Value`. Staff and future maintainers may not know whether mixed-method batches are forbidden, supported, or only accidentally tolerated.
   - **Evidence:** The "Batch Eligibility Rules" section says methods must match, while cost preview and save formulas compute resin vs. filament pricing per request.
   - **Classification:** Policy gap / UX ambiguity.
   - **Recommendation:** Pick one truth and enforce it everywhere. Either block mixed-method batches at selection/save time, or explicitly document mixed-method batch support and remove the contradictory rule.

7. **Medium - Reopen-for-correction preserves bad payment history but offers no true correction path**
   - **Area:** `btnRevertConfirm`, reopen flow, and payment recovery model
   - **Risk:** Reverting `Paid & Picked Up -> Completed` preserves old `Payments` history and only changes parent status. That is useful for reopening work, but it is not a real void/refund/correction workflow. A mistaken payment can easily become layered with additional payments instead of being cleanly replaced.
   - **Evidence:** The revert guidance explicitly says existing `Payments` rows are preserved when reopening. No dedicated void, refund, or delete-payment path is documented in the payment system.
   - **Classification:** Recovery gap.
   - **Recommendation:** Add an admin-only correction workflow: void a payment row, annotate the reason, recompute parent rollups from the canonical ledger, and only then reopen or reprocess as needed.

### Open Questions

- Should batch be truly all-or-nothing, even if that means failing the whole checkout when one selected request changes under staff?
- If a consolidated batch row must remain the only ledger row for one checkout, how should the app support retrying failed subset items without inventing a second transaction number?
- Is `BatchAllocationSummary` expected to be manually editable by staff, or should it be treated as write-once system data?
- Do any other formulas besides the payment modal need to parse consolidated batch text to rebuild request-level values?
- Is reopening `Paid & Picked Up` intended for "continue work after pickup" only, or also for "the original payment was wrong" corrections?

### Safe / Sound Areas

- The move to **one consolidated `Payments` row per real-world batch checkout** is directionally correct and matches finance/export needs much better than the older duplicate-row batch design.
- `btnAddMoreItems` now has an explicit ID guard, so the obvious duplicate-add path is covered.
- Batch pricing now branches per request by `Method.Value`, which is materially safer than the old filament-only batch math.
- The batch modal now clearly states that batch is a **final pickup** flow, which reduces some operator misunderstanding compared with the earlier neutral wording.
- The export flow correctly treats the `Payments` list as the canonical TigerCASH ledger and does not explode consolidated batches back into multiple export rows.

---

## Bottom Line

The current payment architecture is better than the older batch design, but it is still fragile in the places that matter most:

- single payment is not atomic
- batch close-out is not atomic
- retry/recovery logic does not match accounting reality
- consolidated batch history is still reconstructed through brittle text parsing

The biggest remaining risk is not just "wrong labels" or "confusing UI." It is the possibility of **bad list data that looks successful in the app**:

- requests marked paid without a matching canonical ledger row
- request rollups that silently miss prior batch history
- staff being told to retry a failed subset in a way that cannot preserve one real-world transaction cleanly

Those issues should be treated as system-level payment reliability work, not polish.
