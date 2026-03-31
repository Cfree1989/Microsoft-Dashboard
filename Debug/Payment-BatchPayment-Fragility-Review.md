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

---

## Review Entry - Claude (Opus) - March 30, 2026

### Methodology

Reviewed the full `StaffDashboard-App-Spec.md` (15,071 lines), `Payments-List-Setup.md`, `PrintRequests-List-Setup.md`, `BuildPlates-List-Setup.md`, and `Flow-(G)-Export-MonthlyTransactions.md`. Cross-referenced with Microsoft's official Power Apps documentation on `Patch`, `ForAll`, `IfError`, `Refresh`, `Split`, and `StartsWith` behavior via Context7. Walked through every scenario listed in the review prompt and added additional edge cases discovered during analysis.

### Findings

1. **Critical - Single payment rollup patch uses stale `colPayments` data if the preceding `Refresh` + `ClearCollect` silently fails or is delayed**
   - **Area:** `btnPaymentConfirm.OnSelect`, lines 7553-7635 (post-save refresh and `colPayments` rebuild) feeding into lines 7653-7717 (parent `PrintRequests` patch)
   - **Risk:** After the `Payments` row is created, the formula calls `Refresh(Payments)`, `Refresh(BuildPlates)`, then `ClearCollect(colAllPayments, Payments)` and rebuilds `colPayments`. The parent rollup (`FinalWeight: Sum(colPayments, DisplayWeight)`, `FinalCost: Sum(colPayments, DisplayAmount)`) depends entirely on this mid-formula refresh returning the just-saved row. Per Microsoft's documentation, `Refresh` "retrieves a fresh copy" but has **no return value** and no error surface — if SharePoint returns a cached or throttled response, the new payment row may not appear in the refreshed data, and the rollup will silently undercount. The formula has no guard checking that the just-saved `varNewPayment.ID` actually appears in the rebuilt `colPayments`.
   - **Classification:** Hard data integrity risk / rollup drift.
   - **Recommendation:** After the mid-formula refresh, verify the just-saved payment row is present in `colPayments` before computing rollups. If it is absent, either insert it into the local collection from `varNewPayment` as a fallback, or abort the parent patch with a reconciliation warning.

2. **Critical - Batch per-item rollup formula excludes consolidated batch history from prior payments**
   - **Area:** `btnBatchPaymentConfirm.OnSelect`, Step 3, line 9222: `wPriorPayments: Filter(Payments, RequestID = BatchItem.ID)`
   - **Risk:** This filter only finds `Payments` rows where `RequestID` directly equals the request ID. It misses prior consolidated batch rows where `RequestID` is blank and the request appears only inside `BatchRequestIDs`. Yet the single-payment modal and history display both use the broader `RequestID = ID Or Text(ID) in Split(BatchRequestIDs, ", ").Value` pattern. When a request is reopened after a prior batch payment and then re-enters a new batch, lines 9320-9321 compute `FinalWeight: Sum(wPriorPayments, Weight) + wBatchWeight` and `FinalCost: Sum(wPriorPayments, Amount) + wBatchCost` — both will silently miss the earlier batch allocation, producing understated parent rollups.
   - **Evidence:** Compare line 9222 with line 7331 (`RequestID = varSelectedItem.ID Or Text(varSelectedItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value`) and line 2674 (same broader filter). The inconsistency is concrete.
   - **Classification:** Real defect / hard data integrity risk.
   - **Recommendation:** Replace `wPriorPayments: Filter(Payments, RequestID = BatchItem.ID)` with the same broader filter used elsewhere. This must also include a weight/amount extraction step (the `DisplayWeight`/`DisplayAmount` parsing) for consolidated rows, otherwise `Sum(wPriorPayments, Weight)` still uses the batch-total `Weight` rather than the per-request allocated weight.

3. **Critical - Batch per-item rollup summing `Weight` from prior consolidated rows double-counts even if the filter were fixed**
   - **Area:** `btnBatchPaymentConfirm.OnSelect`, lines 9320-9321
   - **Risk:** Even if finding #2 is fixed to include consolidated batch rows, `Sum(wPriorPayments, Weight)` sums the raw `Weight` column. For a consolidated batch row, `Weight` is the **total weight across all requests in that batch**, not the allocated weight for this specific request. To get the per-request portion, the formula would need to parse `BatchAllocationSummary` — exactly the text-parsing pattern used for `DisplayWeight` in the single-payment modal. Without that extraction, the rollup will overcount if any prior payment was a consolidated batch row.
   - **Classification:** Real defect / rollup overcounting risk (compounding with finding #2).
   - **Recommendation:** Extract the per-request allocated weight from `BatchAllocationSummary` the same way the `colPayments` rebuild does, or better yet, centralize a named formula or reusable pattern that returns the request-level weight and cost from any `Payments` row.

4. **High - ForAll inside `btnBatchPaymentConfirm` processes items in undefined order and potentially in parallel, but calls `Refresh` per iteration**
   - **Area:** `btnBatchPaymentConfirm.OnSelect`, Step 3, line 9213: `ForAll(colBatchItems As BatchItem, Refresh(PrintRequests); Refresh(BuildPlates); Refresh(Payments); ...)`
   - **Risk:** Per Microsoft's official Power Apps documentation on `ForAll`: *"records may be processed in any order and potentially in parallel."* Each iteration calls `Refresh(PrintRequests); Refresh(BuildPlates); Refresh(Payments)` which are global data source refreshes. If two iterations overlap in parallel, one iteration's `Refresh` could trample another's mid-save `Patch`, or the `LookUp(PrintRequests, ID = BatchItem.ID)` could return data from a different iteration's refresh. The `Collect(colBatchSucceededDetails, ...)` call is permitted inside `ForAll`, but the ordering of side effects is formally undefined.
   - **Evidence:** Microsoft docs state `"functions like UpdateContext, Clear, and ClearCollect are prohibited within ForAll to avoid ordering dependencies"` — yet the formula relies on sequential `Patch → Collect → next item` semantics. `Collect` is allowed but with "order of record addition... undefined." The `Refresh` calls inside `ForAll` are not prohibited but produce unpredictable global side effects when iterations overlap.
   - **Classification:** Structural fragility / potential race condition risk.
   - **Recommendation:** Move the per-item revalidation and save into a Power Automate flow that processes items sequentially with explicit error handling, or at minimum, validate that the SharePoint connector serializes `ForAll` iterations in practice (it often does for SharePoint, but this is an implementation detail, not a guarantee).

5. **High - `colPayments` text parsing uses `Last(Split(wBatchEntry, ": "))` which breaks on ReqKey values or dollar amounts containing a colon**
   - **Area:** `colPayments` rebuild logic at lines 2714-2720 (and identically at 7371-7377 and 7600-7608) — specifically: `Value(Substitute(Trim(First(Split(Last(Split(wBatchEntry, ": ")).Value, " for ")).Value), "$", ""))`
   - **Risk:** The formula splits on `": "` to separate the `REQ-XXXXX: $21.18 for 181.41g` prefix from the amount portion. It takes `Last(Split(..., ": "))` to get `$21.18 for 181.41g`. This works for the current format, but `Last(Split(...))` means if any future format introduces an additional `": "` in the string (e.g., a ReqKey containing a colon, or a suffix like `"note: adjusted"`), the `Last()` call would silently grab the wrong segment. More immediately, the weight extraction `Value(First(Split(Last(Split(wBatchEntry, " for ")).Value, "g")).Value)` splits on `" for "` — if a payment note or future field contains the substring `" for "`, parsing silently yields garbage values.
   - **Classification:** Structural fragility / medium-to-high data-quality risk.
   - **Recommendation:** At minimum, anchor the parse to the known `BatchAllocationSummary` format using `Mid()` or indexed `Split()` instead of `Last()`, so extra delimiters cannot shift the target. Better: store per-request allocated weight and cost as structured fields (e.g., a JSON column or separate comma-delimited numeric columns) rather than parsing display text.

6. **High - `DisplayWeight` and `DisplayAmount` parsing returns `Blank()` for consolidated rows where `BatchAllocationSummary` is missing or differently formatted, but `Sum(colPayments, DisplayWeight)` treats `Blank()` as 0**
   - **Area:** `colPayments` rebuild and `lblPaidSoFar.Text` at line 6921: `Sum(colPayments, DisplayWeight)`
   - **Risk:** If `BatchAllocationSummary` is blank, manually edited, or in a slightly different format (e.g., extra whitespace, different currency symbol, localized number format), the parsing chain returns `Blank()`. `Sum()` in Power Fx treats `Blank()` as 0. This means a consolidated batch row with a missing or corrupt allocation summary will silently contribute $0 / 0g to the "Paid so far" display — and worse, to the parent rollup computation at lines 7657-7658. Staff sees an undercount with no error indication.
   - **Classification:** Silent data loss risk / recovery gap.
   - **Recommendation:** Add a guard: if a consolidated batch row has `Blank()` for `DisplayWeight` or `DisplayAmount` after parsing, surface a warning to staff (e.g., append a "[parse error]" marker or color the history row differently) so the issue is visible rather than silently zeroed.

7. **Medium - Batch `ForAll` calls `Refresh(PrintRequests)` and `Refresh(Payments)` on every iteration, creating O(n) full-list refreshes against SharePoint**
   - **Area:** `btnBatchPaymentConfirm.OnSelect`, Step 3 inner loop
   - **Risk:** For a batch of `n` items, the formula issues `3n` SharePoint list refreshes (PrintRequests, BuildPlates, Payments each per item) plus the initial 3 and the Step 5 final 3. SharePoint has request throttling (typically 600 requests per minute per user for connector calls). A batch of 10 items generates ~33 refresh calls plus the individual `Patch` calls. This is unlikely to hit throttling for small batches but becomes a real risk for larger ones, and the app provides no feedback about throttling — it just fails silently or gets a 429 response that `Refresh` cannot surface.
   - **Classification:** Performance risk / operational fragility for larger batches.
   - **Recommendation:** Refresh once before the loop and once after, not per iteration. The per-item revalidation can use `LookUp(PrintRequests, ID = BatchItem.ID)` which is a targeted query rather than a full list refresh.

8. **Medium - Revert from `Paid & Picked Up` to `Completed` does not reset `BuildPlates` statuses**
   - **Area:** `btnRevertConfirm.OnSelect` at lines 8188-8274, plus the Notify at line 8256-8260
   - **Risk:** When a request is reverted from `Paid & Picked Up` back to `Completed`, the parent `PrintRequests.Status` changes but all `BuildPlates` rows remain `Picked Up`. The app does notify staff: *"plate statuses are unchanged — adjust in Build Plates if needed."* However, if staff later re-enters the single payment modal for this request, the "Paid so far" summary uses `Sum(colPayments, DisplayWeight)` which still reflects prior payments, and the plate pickup checklist shows `Filter(colBuildPlatesIndexed, Status.Value = "Completed")` — which returns zero plates because they are all still `Picked Up`. Staff cannot record a corrective payment with plates because there are no eligible plates to check, even though the request is back in `Completed`.
   - **Classification:** Recovery gap / UX dead end.
   - **Recommendation:** Either (a) automatically revert plate statuses from `Picked Up` back to `Completed` during the revert operation, or (b) provide a dedicated plate-status reset tool that staff can invoke from the revert modal before the status change completes.

9. **Medium - Batch card selection does not enforce same-`Method` rule despite documented requirement**
   - **Area:** `recCardBackground.OnSelect` at lines 1472-1483, `icoBatchCheck.OnSelect` at line 12133, and `btnBatchPaymentConfirm.OnSelect` Step 1 validations (lines 9121-9151)
   - **Risk:** The batch eligibility rules state: *"Batch selections must all use the same Method so resin pickup grams never mix with filament grams under different pricing rules."* But neither the card toggle (`Collect(colBatchItems, ThisItem)`) nor the confirm button's pre-save validations check `Method` consistency. The pricing formulas in Steps 2-3 do branch per item by `Method.Value`, so mixed batches are priced correctly — but the documented rule suggests mixed batches are forbidden. Staff may unknowingly create mixed-method batches that "work" today but violate a policy they are told exists.
   - **Classification:** Policy gap / documented-vs-implemented mismatch.
   - **Recommendation:** Either enforce the rule (block adding a different-method item to `colBatchItems` at selection time, or reject mixed batches in the confirm validation) or remove the documented restriction and make mixed-method batches an explicitly supported workflow.

10. **Medium - Transaction number uniqueness check is global but not scoped to payment type or date**
    - **Area:** `btnPaymentConfirm.OnSelect` line 7320: `CountRows(Filter(colAllPayments, TransactionNumber = Trim(txtPaymentTransaction.Text))) > 0`; `btnBatchPaymentConfirm.OnSelect` line 9129: same pattern
    - **Risk:** The uniqueness check filters all `Payments` rows by `TransactionNumber` regardless of `PaymentType`. A TigerCASH receipt number could collide with a Check number or a grant Code that happens to share the same string. More importantly, `colAllPayments` is populated at the start of the save path via `ClearCollect(colAllPayments, Payments)` — but the `Payments` list may contain more than 2,000 rows over time. Power Apps non-delegable `Filter` against a collection has a row limit (default 500 or 2,000 depending on settings). If `colAllPayments` is truncated, the uniqueness check can miss older duplicates entirely.
    - **Classification:** Data integrity risk (duplicate detection gap) for mature deployments.
    - **Recommendation:** Scope the uniqueness check to the same `PaymentType` at minimum. For the delegation concern, either (a) move the uniqueness check to a Power Automate flow with a delegable SharePoint query, or (b) increase the non-delegable row limit and monitor `Payments` list growth.

11. **Medium - `PayerTigerCard` is not populated for batch payments**
    - **Area:** `btnBatchPaymentConfirm.OnSelect`, Step 4 consolidated `Payments` row at lines 9376-9412
    - **Risk:** The single payment modal captures `PayerTigerCard` via `txtPayerTigerCard` (line 7493). The batch payment modal has `txtBatchPayerName` but no corresponding `txtBatchPayerTigerCard` input. The consolidated `Payments` row's `Patch` in Step 4 does not set `PayerTigerCard` at all. For TigerCASH payments where the card won't swipe, staff need the TigerCard number for manual POS entry — but in batch mode there is no way to record it.
    - **Classification:** Missing field / operational gap.
    - **Recommendation:** Add a `txtBatchPayerTigerCard` input to the batch modal and include it in the consolidated `Payments` Patch, or accept the gap and document that batch mode requires a working card swipe.

12. **Medium - Single payment `IfError` wraps `Patch(Payments)` but does not stop the success path on audit log failure**
    - **Area:** `btnPaymentConfirm.OnSelect`, lines 7718-7737
    - **Risk:** After the parent `PrintRequests` patch, the formula calls `Flow-(C)-Action-LogAction.Run(...)` wrapped in `IfError(..., Notify("Payment saved, but could not log to audit.", NotificationType.Warning))`. If the audit flow call fails, the user sees a warning, but the modal still closes and resets (`Set(varShowPaymentModal, 0)` at line 7742). This is reasonable for a non-critical audit log — but if the audit flow hangs or times out (Power Automate flows called from Power Apps have a ~120-second timeout), the entire save path blocks, and the loading spinner stays indefinitely with no timeout recovery. Staff may force-close the app and believe the payment didn't save, then retry, creating a duplicate.
    - **Classification:** UX risk / duplicate creation risk under flow timeout.
    - **Recommendation:** Set a shorter timeout expectation on the flow call, or make the audit log fire-and-forget (e.g., write to a local collection and sync later) so the save path never blocks on it.

13. **Low - Batch selection collects the `ThisItem` snapshot at selection time, not at confirm time**
    - **Area:** `recCardBackground.OnSelect` at line 1478: `Collect(colBatchItems, ThisItem)` and `icoBatchCheck.OnSelect` at line 12133
    - **Risk:** When staff clicks a card to add it to the batch, `Collect(colBatchItems, ThisItem)` captures the request record as it was at that moment. If another staff member changes the request's `EstimatedWeight`, `Method`, or `Status` between selection and confirmation, `colBatchItems` holds stale data. The confirm button does re-validate status via `LookUp(PrintRequests, ID = BatchItem.ID)` in Step 3, but the weight allocation in Step 2 uses `colBatchItems.EstimatedWeight` (line 9154: `Sum(colBatchItems, EstimatedWeight)`) — which is the stale snapshot value. This means proportional weight allocation could use outdated estimates.
    - **Classification:** Stale-data risk / minor allocation accuracy concern.
    - **Recommendation:** Re-fetch `EstimatedWeight` from the live `PrintRequests` data during Step 2 instead of relying on the snapshot in `colBatchItems`.

14. **Low - Batch cancel (`btnBatchPaymentCancel`) does not clear `colBatchItems`, only the batch modal fields**
    - **Area:** `btnBatchPaymentCancel.OnSelect` at lines 9046-9054
    - **Risk:** The cancel button resets transaction fields and closes the batch modal, but the comment explicitly says `// Don't clear colBatchItems - let user continue selecting`. This is intentional UX (letting staff adjust and re-open), but it means `varBatchSelectMode` remains true and the footer persists. If staff wants to truly abandon the batch, they must click the separate `btnBatchCancel` in the footer. This two-cancel design could confuse staff who expect "Cancel" in the modal to mean "cancel the whole batch."
    - **Classification:** UX ambiguity / minor operational risk.
    - **Recommendation:** Consider renaming the modal cancel to "Back to Selection" or similar to clarify that it returns to the batch selection state rather than abandoning it.

15. **Low - Export flow does not resolve `Machine` or `CourseNumber` for consolidated batch rows**
    - **Area:** `Flow-(G)-Export-MonthlyTransactions.md`, Export Columns table at lines 358-360
    - **Risk:** The export column spec says `Machine` uses `LookUp(PrintRequests, ID = RequestID).Method.Value` and `Course` uses `LookUp(PrintRequests, ID = RequestID).CourseNumber`. For consolidated batch rows, `RequestID` is blank, so both lookups return `Blank()`. The spec acknowledges this ("consolidated rows should render a combined summary if exported") but no implementation is shown — the actual `Build Payment Rows JSON` step only maps `transactionNumber`, `payer`, `amount`, `date`, and `recordedAt`. Machine and Course are not in the flow's mapped columns at all.
    - **Classification:** Missing feature / export gap (not data integrity).
    - **Recommendation:** If Machine and Course are needed in exports, add them to the flow mapping with per-request extraction from batch fields. If they are not needed for the TigerCASH export, remove them from the export column spec to avoid confusion.

### Open Questions

- Should `ForAll` inside `btnBatchPaymentConfirm` be replaced with a server-side Power Automate flow to guarantee sequential execution and proper error propagation, given that `ForAll` documentation explicitly warns about undefined order and potential parallel execution?
- When a request is reopened via revert, should plate statuses also be reverted, or should the app provide a separate "reset plates" action? The current design leaves plates in `Picked Up` state with only a text warning.
- How large can `colAllPayments` grow before the non-delegable `Filter` for transaction uniqueness becomes unreliable? What is the current non-delegable row limit setting, and is there monitoring for when `Payments` approaches that threshold?
- Is there a known scenario where `Refresh(Payments)` returns stale data due to SharePoint caching or eventual consistency, and if so, what is the typical delay? This directly affects the reliability of the mid-formula refresh in the single payment save path.
- Should `BatchAllocationSummary` be treated as immutable system data (write-once, never manually edited), or does staff need the ability to correct allocation text in SharePoint? The parsing logic is entirely dependent on format consistency.
- If the app is ever localized or used with non-US locale settings, will `Value()` parsing of `"$21.18"` after `Substitute("$", "")` still work, or will decimal separators cause silent failures?

### Safe / Sound Areas

- **Pre-save revalidation in both flows** — Both `btnPaymentConfirm` and `btnBatchPaymentConfirm` call `Refresh` on all three data sources and re-check status eligibility before proceeding. This is a meaningful defense against the most obvious stale-state race conditions (e.g., another staff member already processed the request).
- **Transaction number uniqueness check** — Both save paths block duplicate transaction numbers before creating a `Payments` row. The check is imperfect for large lists (finding #10) but is a solid safeguard for typical usage volumes.
- **Consolidated batch architecture** — Writing one `Payments` row per real-world checkout is architecturally correct and aligns with finance/export needs. The GPT-5.4 review's endorsement of this direction is well-founded.
- **`IfError` wrapping on the single payment `Patch`** — The critical `Patch(Payments, Defaults(Payments), ...)` call is wrapped in `IfError(..., false)` with an early exit if it fails. This prevents the worst-case scenario of proceeding with plate and parent updates when the ledger row doesn't exist.
- **Batch partial-failure tracking** — The `colBatchSucceededItems` / `colBatchFailedItems` / `colBatchSucceededDetails` pattern provides per-item error granularity, which is materially better than an all-or-nothing approach that might lose all progress on a single item failure.
- **Plate `PlateKey` as stable identity** — Using `Text(GUID())` for `PlateKey` and persisting it to `PlateIDsPickedUp` gives a durable audit trail that survives relabeling, renumbering, and reprint additions. This is a sound design.
- **`varBatchLedgerSaveFailed` flag and explicit reconciliation message** — When the consolidated `Payments` row fails to save in Step 4, the app sets a flag and issues a clear error message telling staff to reconcile before processing another batch. This is honest about the failure state even though it cannot roll back the per-request patches.
- **Export treats `Payments` as canonical** — The TigerCASH export flow correctly reads from `Payments` and does not try to reconstruct transactions from `PrintRequests` rollup fields. This is the right source-of-truth behavior.

---

## Review Entry - Composer (Cursor) - March 30, 2026

*Independent pass against `StaffDashboard-App-Spec.md` and `SharePoint/Payments-List-Setup.md`; Microsoft Power Apps / Power Fx guidance consulted via Context7 (`/microsoftdocs/powerapps-docs`, `/microsoft/power-fx`) for Patch/`IfError` behavior and formula chaining—not for product-specific guarantees.*

### Findings

1. **Critical — Canvas app has no cross-record transaction; ledger and parent/plate writes are sequential**
   - **Area:** `btnPaymentConfirm.OnSelect`, `btnBatchPaymentConfirm.OnSelect`; platform behavior
   - **Risk:** Microsoft’s error-handling guidance treats each `Patch` as an operation that can fail independently (`IfError`/`IsError` on the result). Chaining many `Patch` calls with semicolons does not create atomicity. A saved `Payments` row can coexist with failed `BuildPlates` or `PrintRequests` updates (single path), or paid parents without a consolidated row (batch path).
   - **Evidence:** Single path inserts `Payments` first, then `ForAll` plate `Patch`es, refresh, then `Patch(PrintRequests, ...)` with no single compensating wrapper around the full chain (see ```7470:7717:PowerApps/StaffDashboard-App-Spec.md```). Batch path patches plates and `PrintRequests` inside `ForAll` before the consolidated `Payments` `Patch` (see ```9212:9418:PowerApps/StaffDashboard-App-Spec.md```).
   - **Classification:** Hard data integrity risk (platform + app design), not merely UX.
   - **Recommendation:** Move the full save sequence to Power Automate (or another server-side orchestration) with explicit compensation, or add a durable “reconciliation required” state on new ledger/parent rows when downstream steps fail.

2. **Critical — Batch ordering: requests closed before consolidated ledger write**
   - **Area:** `btnBatchPaymentConfirm.OnSelect` Step 3 vs Step 4
   - **Risk:** If Step 4’s `Patch(Payments, Defaults(Payments), ...)` fails, affected requests can already be `Paid & Picked Up` with updated rollups while no canonical consolidated row exists—the spec’s own recovery copy acknowledges this (`varBatchLedgerSaveFailed` message).
   - **Evidence:** ```9365:9418:PowerApps/StaffDashboard-App-Spec.md``` writes the consolidated row only after per-item processing; ```9472:9476:PowerApps/StaffDashboard-App-Spec.md``` surfaces the manual-reconcile error.
   - **Classification:** Real defect / ledger–parent mismatch.
   - **Recommendation:** Persist the ledger row first (or use a staging row), then mutate parents only after confirmed success—or perform both in one server flow.

3. **High — Batch rollups use `wPriorPayments: Filter(Payments, RequestID = ...)` only**
   - **Area:** Inside `ForAll(colBatchItems ...)` in `btnBatchPaymentConfirm.OnSelect`
   - **Risk:** Prior money in consolidated batch rows (`RequestID` blank, ID listed in `BatchRequestIDs`) is invisible to `Sum(wPriorPayments, Weight/Amount)`. Reopen-then-pay-again can double-count semantics in the UI elsewhere while parent `FinalWeight`/`FinalCost` undercount prior batch share.
   - **Evidence:** ```9220:9222:PowerApps/StaffDashboard-App-Spec.md``` vs history logic that includes `BatchRequestIDs` in ```7329:7332:PowerApps/StaffDashboard-App-Spec.md```.
   - **Classification:** Rollup drift / inconsistent source-of-truth rules.
   - **Recommendation:** One shared formula or helper concept: “all `Payments` rows that allocate to this request ID,” reused for rollups and history.

4. **High — Resin batch: proportional split mixes semantics (mL estimates vs combined grams)**
   - **Area:** `varBatchTotalEstWeight` / per-item allocation in `btnBatchPaymentConfirm.OnSelect`
   - **Risk:** `EstimatedWeight` is used as a pure number for shares of `varBatchCombinedWeight`, but for resin jobs the spec treats that column as volume (mL), while the batch modal requires combined **grams**. Relative splits and per-request gram allocations can be wrong even when every item is resin (mL ≠ g), not only in mixed-method batches.
   - **Evidence:** Proportional block ```9154:9174:PowerApps/StaffDashboard-App-Spec.md```; resin labeling uses mL elsewhere (e.g. ```5284:5284:PowerApps/StaffDashboard-App-Spec.md```).
   - **Classification:** Pricing / allocation correctness risk (documentation says same-method batching but does not resolve unit semantics).
   - **Recommendation:** Define whether batch combined weight is always mass; if so, convert resin estimates to comparable mass for allocation, or require separate batch paths per method.

5. **High — “Same `Method` for batch” is documented but not enforced on open or save**
   - **Area:** Batch Eligibility Rules (Step 12E); `btnProcessBatchPayment.OnSelect`; `btnBatchPaymentConfirm` validations
   - **Risk:** Staff can open the batch modal with arbitrary `Completed` selections; confirm-time checks cover status and plates, not method homogeneity. Mixed-method batches are possible despite the written rule, and pricing already branches per item (`Method.Value`).
   - **Evidence:** Rules at ```8304:8306:PowerApps/StaffDashboard-App-Spec.md```; `btnProcessBatchPayment` only ```12341:12343:PowerApps/StaffDashboard-App-Spec.md```; no method-equality guard in Step 1 of confirm (```9121:9151:PowerApps/StaffDashboard-App-Spec.md```).
   - **Classification:** Policy gap + latent data-quality risk.
   - **Recommendation:** Enforce a single method (or explicitly drop the rule and document mixed-method support) in `btnProcessBatchPayment` and again on confirm.

6. **Medium — Single payment plate `ForAll` patches are not individually error-handled**
   - **Area:** `btnPaymentConfirm.OnSelect` after `varPaymentSaved`
   - **Risk:** If one `Patch(BuildPlates, ...)` fails mid-loop, some plates may show `Picked Up` and others not, with the ledger already committed.
   - **Evidence:** ```7541:7551:PowerApps/StaffDashboard-App-Spec.md``` (no `IfError` around individual plate patches).
   - **Classification:** Partial-failure / recovery gap.
   - **Recommendation:** Per-row `IfError` with aggregation, or server-side update of all plates for the request in one action.

7. **Medium — Audit logging runs for batch “successes” even when consolidated ledger save fails**
   - **Area:** Step 5 `ForAll(colBatchSucceededItems ... 'Flow-(C)-Action-LogAction'.Run(...))` vs Step 4 `varBatchLedgerSaveFailed`
   - **Risk:** Flow C can record “Paid & Picked Up (Batch final pickup)” while the consolidated `Payments` row never persisted, weakening audit-vs-ledger reconciliation.
   - **Evidence:** Order is Step 4 ledger (```9365:9418:PowerApps/StaffDashboard-App-Spec.md```) then Step 5 logging (```9427:9448:PowerApps/StaffDashboard-App-Spec.md```); failure notify is Step 6 (```9472:9476:PowerApps/StaffDashboard-App-Spec.md```). Logging does not gate on `!varBatchLedgerSaveFailed`.
   - **Classification:** Operational / compliance fragility.
   - **Recommendation:** Run batch audit only after confirmed ledger write, or log an explicit “ledger failed” event with the same correlation id.

8. **Medium — Spec contradiction on revert from `Paid & Picked Up`**
   - **Area:** Step 12D “Valid Revert Transitions” note vs `btnRevert` / `ddRevertTarget`
   - **Risk:** The transition table still states paid cannot be reverted (```7793:7793:PowerApps/StaffDashboard-App-Spec.md```), while `ddRevertTarget` allows `Paid & Picked Up` → `Completed` (```8062:8063:PowerApps/StaffDashboard-App-Spec.md```) and `btnRevert` is visible for that status (```2845:2849:PowerApps/StaffDashboard-App-Spec.md```). Maintainers and trainers may ship the wrong procedure.
   - **Classification:** Documentation / training gap (not runtime logic).
   - **Recommendation:** Update the Step 12D table and note to match the implemented recovery path and preserved `Payments` behavior.

9. **Medium — Request-level display still depends on parsing `BatchAllocationSummary` / `PlatesPickedUp` text**
   - **Area:** `colPayments` rebuild in payment modal
   - **Risk:** `SharePoint/Payments-List-Setup.md` describes `BatchAllocationSummary` as human-readable by design; the app parses `REQ-…: $… for …g` and plate fragments. Manual edits, locale/format changes, or concat order changes break `DisplayWeight` / `DisplayAmount` / `DisplayPlatesPickedUp` without failing loudly.
   - **Evidence:** Parsing blocks ```7336:7396:PowerApps/StaffDashboard-App-Spec.md```; list setup ```81:88:SharePoint/Payments-List-Setup.md```.
   - **Classification:** Structural fragility.
   - **Recommendation:** Versioned structured field(s) or JSON fragment; keep text as a denormalized view only.

10. **Low — Partial batch + global `TransactionNumber` uniqueness**
    - **Area:** Step 1 uniqueness check; Step 6 “retry” messaging
    - **Risk:** Successful subset consumes the transaction number; retrying failed lines with the same number is blocked, yet finance may expect one physical receipt for one checkout.
    - **Evidence:** ```9128:9132:PowerApps/StaffDashboard-App-Spec.md``` and warning copy ```9484:9489:PowerApps/StaffDashboard-App-Spec.md```.
    - **Classification:** Recovery gap / accounting expectation mismatch.
    - **Recommendation:** Document operator procedure, or model “same receipt, supplemental ledger adjustment” explicitly in data and export.

### Open Questions

- Should Flow G (monthly export) ever need to explode a batch back to per-request lines for disputes, or is one row per checkout always sufficient for TigerCASH reconciliation?
- For resin jobs, is there an assumed density so mL estimates can be treated as proportional to grams, or is that unstated?
- If the platform adds richer transactional APIs for SharePoint lists, is the app expected to migrate, or is server-side flow the long-term direction?

### Safe / Sound Areas

- **Explicit** `IfError` around the primary `Payments` insert in single payment and around the consolidated batch ledger `Patch` reduces silent drops on those two critical writes.
- **TigerCard vs receipt guard** on batch transaction input (```9121:9126:PowerApps/StaffDashboard-App-Spec.md```) is a practical fat-finger control aligned with `Payments-List-Setup.md`.
- **Per-item revalidation** inside batch `ForAll` (refresh + latest request/plates) reduces stale-card races compared with a single upfront snapshot.
- **Consolidated batch row** shape (`BatchRequestIDs`, `BatchReqKeys`, `BatchAllocationSummary`) matches the documented ledger model and export intent better than duplicate per-request rows for one swipe.

---

## Cross-Review Consensus — March 30, 2026

**Reviewers:** GPT-5.4, Claude (Opus), Composer (Cursor)

This section synthesizes findings across all three independent reviews to surface unanimous agreement, shared themes, and the design decisions that must be resolved before fixes can proceed.

### Unanimous Critical Findings

These issues were independently identified by all three reviewers at Critical severity:

1. **Non-atomic saves in both payment paths**
   - Single payment inserts the `Payments` row first, then patches plates and parent separately. Batch patches plates and parent first, then writes the consolidated ledger row. Neither path is transactional. A partial failure at any step leaves the system in an inconsistent state that the app treats as success.
   - All three reviewers recommend server-side orchestration (Power Automate) or explicit compensation logic that flags incomplete saves for reconciliation.

2. **Batch closes requests before the consolidated ledger row exists**
   - Step 3 marks requests `Paid & Picked Up` and updates rollups. Step 4 writes the single consolidated `Payments` row. If Step 4 fails, requests appear paid with no canonical payment record.
   - All three reviewers recommend reversing the order (write the ledger row first, then close requests) or staging the entire operation server-side.

3. **Batch rollup filter excludes prior consolidated batch history**
   - `wPriorPayments: Filter(Payments, RequestID = BatchItem.ID)` only finds direct-match rows. Prior consolidated batch rows where `RequestID` is blank and the request appears only inside `BatchRequestIDs` are invisible to this filter. The broader filter (`RequestID = ID Or Text(ID) in Split(BatchRequestIDs, ", ").Value`) is used elsewhere in the app but not here.
   - All three reviewers recommend centralizing one reusable definition of "all payments affecting this request" and using it everywhere — rollups, history display, and export.

### Strongly Agreed High-Severity Findings

These issues were raised by at least two reviewers at High severity, with the third confirming or identifying a closely related variant:

4. **Text parsing of `BatchAllocationSummary` is structurally fragile**
   - Request-level `DisplayWeight`, `DisplayAmount`, and `DisplayPlatesPickedUp` for consolidated rows are reconstructed by parsing human-readable strings. Manual edits, format drift, locale changes, or extra delimiters can silently produce `Blank()` (treated as 0 by `Sum`), with no error surfaced to staff.
   - Recommendation: store per-request allocation as structured data (JSON column or parallel numeric columns) and keep text as a denormalized display-only view.

5. **Same-Method batch rule is documented but not enforced**
   - Batch eligibility rules state that all selected items must use the same `Method`, but neither card selection nor confirm-time validations check method consistency. Pricing already branches per item by `Method.Value`, so mixed-method batches work in practice but violate the written policy.
   - Recommendation: either enforce the rule at selection and confirm time, or remove the documented restriction and explicitly support mixed-method batches.

6. **Partial batch retry path is internally contradictory**
   - After a partial batch success, the succeeded subset consumes the transaction number via the consolidated `Payments` row. Retrying the failed subset with the same number is blocked by the uniqueness check. Retrying with a new number splits one real-world checkout across two ledger rows, breaking the one-checkout-one-row model.
   - Recommendation: decide between true all-or-nothing batches or a resumable model that can append failed items into the same ledger record. The current hybrid promises retry but cannot deliver a clean accounting outcome.

7. **Revert from `Paid & Picked Up` does not reset plate statuses**
   - Reverting to `Completed` changes the parent status but leaves all `BuildPlates` rows as `Picked Up`. Staff cannot then re-record a payment with plates because the plate pickup checklist filters on `Status = "Completed"` and finds nothing.
   - Recommendation: either automatically revert plate statuses during the revert operation or provide a separate plate-reset action before the status change completes.

### Additional Notable Findings (Reviewer-Specific)

These were raised by individual reviewers and are worth confirming or addressing:

- **Stale `Refresh` risk in single payment rollups** (Claude): `Refresh(Payments)` has no error surface and no guarantee the just-saved row appears in the refreshed data. The parent rollup could silently undercount if SharePoint returns a cached response.
- **`ForAll` parallel execution risk** (Claude): Microsoft docs state `ForAll` may process records in any order and potentially in parallel. The per-iteration `Refresh` calls inside batch `ForAll` are global data-source refreshes that could produce unpredictable side effects if iterations overlap.
- **Resin mL-vs-grams unit mismatch in batch allocation** (Composer): `EstimatedWeight` for resin jobs represents mL, but the batch combined weight is entered in grams. Proportional allocation treats both as the same unit, producing incorrect per-request splits even in same-method resin batches.
- **`colAllPayments` non-delegable row limit** (Claude): Transaction number uniqueness checks filter a local collection. If `Payments` exceeds the non-delegable row limit (default 500 or 2,000), older duplicates can be missed entirely.
- **Audit logging fires even when ledger save fails** (Composer): Batch Step 5 logs "Paid & Picked Up" actions for succeeded items without gating on `varBatchLedgerSaveFailed`, weakening audit-vs-ledger reconciliation.
- **Spec contradiction on revert transitions** (Composer): The Step 12D transition table still states paid requests cannot be reverted, while `ddRevertTarget` and `btnRevert` implement the `Paid & Picked Up → Completed` path.

### Design Decisions Required Before Fixing

The following questions must be answered to determine the fix approach. Many findings are clear defects, but the remediation shape depends on these choices:

| # | Decision | Options | Impact |
|---|----------|---------|--------|
| 1 | **Should batch be all-or-nothing, or should partial success be supported?** | (a) All-or-nothing: fail the entire batch if any item fails. (b) Partial success with resumable retry. (c) Partial success with manual reconciliation only. | Determines save ordering, retry model, and whether a server-side flow is required. |
| 2 | **Should `BatchAllocationSummary` be immutable system data?** | (a) Write-once, never manually edited — lock the field in SharePoint. (b) Staff-editable for corrections — must move to structured storage so parsing is not required. | Determines whether text parsing is acceptable long-term or must be replaced now. |
| 3 | **Are mixed-method batches allowed?** | (a) Enforce same-method at selection and confirm time. (b) Explicitly support mixed-method and remove the documented restriction. | Simple enforcement either way, but pricing and allocation math must be validated against the chosen policy. |
| 4 | **Should revert automatically reset plate statuses?** | (a) Yes — revert plates from `Picked Up` back to `Completed` during the revert operation. (b) No — provide a separate plate-reset tool. (c) No — accept the gap and document manual SharePoint correction. | Affects whether the revert flow needs additional `BuildPlates` patches and whether staff training must cover a manual step. |
| 5 | **Is server-side orchestration (Power Automate) the long-term direction for payment saves?** | (a) Yes — move both single and batch save paths to Power Automate flows with sequential execution and compensation. (b) No — keep saves in-app and add robust in-app compensation (reconciliation flags, guards, retry logic). | The "correct" fix for atomicity is server-side. If that is on the roadmap, some in-app mitigations become temporary stopgaps. If not, in-app compensation must be thorough. |

#### Plain-Language Version of the Design Decisions

**Question 1 — If a batch payment partly fails, what should happen?**

Right now, if a staff member processes a batch of 5 requests and 2 of them fail mid-save, the app saves the 3 that worked and tells staff to "review and retry" the other 2. But the receipt number is already used up, so retrying cleanly is not actually possible. You need to pick one:

- **(a) All or nothing.** If any item in the batch fails, the whole batch fails. Nothing is saved. Staff retries the entire batch. Simplest to reason about, but staff loses progress on the items that would have worked.
- **(b) Partial success with smart retry.** The app saves what it can and lets staff retry the rest under the same receipt. More complex to build, but matches how a real checkout works — one swipe, one receipt.
- **(c) Partial success, staff fixes it manually.** The app saves what it can, warns staff about the failures, and staff goes into SharePoint to clean up. Cheapest to build, but puts the burden on staff and risks mistakes.

Answer:A

**Question 2 — Can staff hand-edit the batch breakdown text in SharePoint?**

When a batch payment is saved, the app writes a human-readable summary like `REQ-00164: $21.18 for 181.41g | REQ-00165: $12.50 for 100.00g` into a SharePoint column. The app later reads that text back and breaks it apart to show payment history. If someone edits that text — even just fixing a typo — the app could silently misread the numbers. You need to pick one:

- **(a) Lock it down.** Treat that field as system-generated data that nobody touches. Keep the current text-parsing approach.
- **(b) Let staff edit it.** If corrections are needed, staff should be able to fix it. But then the app needs to store the breakdown in a more structured way (not as a sentence to parse) so edits don't break anything.

Answer:A

**Question 3 — Can a batch mix filament and resin requests together?**

The written rules say every request in a batch must use the same print method (all filament or all resin). But the app does not actually check this — staff can select a mix and it will process fine because the pricing math already handles each method separately. You need to pick one:

- **(a) Enforce the rule.** Block staff from adding a resin request to a filament batch (or vice versa). Keeps things simple and avoids any unit-mixing confusion.
- **(b) Drop the rule.** Allow mixed batches officially. The pricing already works, so just remove the outdated restriction from the documentation and training materials.

Answer:B

**Question 4 — When staff reopens a paid request, should the plates go back to "ready" automatically?**

Right now, if staff reverts a request from "Paid & Picked Up" back to "Completed" (e.g., the payment was wrong), the request status changes but all the build plates stay marked as "Picked Up." That means if staff tries to re-do the payment, there are no plates available to check off. You need to pick one:

- **(a) Auto-reset plates.** When a request is reverted, automatically flip its plates back to "Completed" so staff can re-process normally.
- **(b) Provide a separate reset button.** Give staff a dedicated "Reset Plates" action they can use before or after reverting.
- **(c) Accept the gap.** Leave it as-is and train staff to manually fix plate statuses in SharePoint when this comes up. Only makes sense if reverts are extremely rare.

Answer:A

**Question 5 — What should the long-term payment save architecture be?**

The biggest issue all three reviews found is that payment saves are multi-step operations with no true atomicity. Single payment and batch payment both write to multiple places (`Payments`, `BuildPlates`, and `PrintRequests`), so a failure in the middle can leave the data out of sync. If the goal is a simple, solid architecture, you need to decide whether to keep patching around that in the app or move all payment saves server-side. You need to pick one:

- **(a) Move both single and batch saves to Power Automate as two separate flows.** Build one flow for single payments and one for batch payments, with both following the same server-side save pattern. This is the cleanest long-term architecture and the most reliable, but it is a bigger upfront build.
- **(b) Move only batch saves to Power Automate for now.** Keep single payments in the app and move only the batch path server-side, since batch is the more fragile workflow. This is a smaller lift, but it leaves the system with two different save architectures.
- **(c) Keep payment saves in the app.** Add stronger in-app error handling, reconciliation flags, and recovery guidance instead of moving the logic to flows. This is the fastest to build, but partial-save risk remains part of the design.

Answer: A

### Residual Open Questions (Non-Blocking)

These do not block the top fixes but should be addressed in parallel or during implementation:

- Should Flow G (monthly export) ever need to explode a consolidated batch back to per-request lines for disputes, or is one row per checkout always sufficient for TigerCASH reconciliation?
   - No
- For resin jobs, is there an assumed density so mL estimates can be treated as proportional to grams, or is that unstated?
   - For estimates its in mL for payments its in grams. 
- Is `BatchAllocationSummary` expected to be parseable by external systems (e.g., export flows, admin reports), or only by the app's own formulas?
   - No idea what this means
- How large can `colAllPayments` grow before the non-delegable `Filter` for transaction uniqueness becomes unreliable? What is the current non-delegable row limit setting?
   - No idea
- If the app is ever localized or used with non-US locale settings, will `Value()` parsing of `"$21.18"` after `Substitute("$", "")` still work, or will decimal separators cause silent failures?
   - This will never happen.
- Do any other formulas besides the payment modal need to parse consolidated batch text to rebuild request-level values?
   - No idea. 

### Areas Confirmed Sound by All Three Reviewers

- **Consolidated batch architecture** — One `Payments` row per real-world checkout is the correct ledger model and aligns with finance/export needs.
- **`IfError` wrapping on the primary `Payments` insert** — Both single and batch paths protect the critical ledger write with error detection and early exit.
- **Pre-save revalidation** — Both paths refresh data sources and re-check status eligibility before proceeding, defending against the most obvious stale-state races.
- **Transaction number uniqueness check** — Both paths block duplicate transaction numbers before creating a `Payments` row (with the caveat about non-delegable row limits for mature deployments).
- **Per-item revalidation inside batch `ForAll`** — Refresh + `LookUp` per item reduces stale-card races compared with a single upfront snapshot.
- **`PlateKey` as stable identity** — `Text(GUID())` for `PlateKey` persisted to `PlateIDsPickedUp` gives a durable audit trail that survives relabeling and reprints.
- **Export treats `Payments` as canonical** — The TigerCASH export flow reads from `Payments` directly and does not reconstruct transactions from rollup fields.
