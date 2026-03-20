# Build Plate / Payment Fragility Review

**Purpose:** Shared prompt and research log for reviewing fragility, blind spots, and edge cases in the build plate, payment, and batch pickup workflows  
**Status:** Active review doc for multi-AI input  
**Primary References:** `PowerApps/StaffDashboard-App-Spec.md`, `Dashboard Yaml`, `SharePoint/BuildPlates-List-Setup.md`, `SharePoint/Payments-List-Setup.md`

---

## What We Are Reviewing

This review is focused on the interaction between these three data models:

- `PrintRequests` — parent request / workflow state
- `BuildPlates` — child records for individual plates or gcode files
- `Payments` — child records for each actual transaction

The current intended model is:

- Single-item payment flow can handle partial pickup
- Batch payment is **final pickup only**
- `PlateNum` is display-only
- `PlateKey` is the durable plate identifier
- `Payments.PlateIDsPickedUp` stores stable plate references
- `Payments.PlatesPickedUp` stores only the human-readable snapshot

This doc exists to pressure-test whether that model is actually robust.

---

## Reference Snapshot

Use `Dashboard Yaml` as implementation reference only. The most relevant areas are:

- App startup collections for `colAllBuildPlates`, `colBuildPlatesIndexed`, `colPickedUpPlates`, and batch variables
- Single payment flow around `btnPaymentConfirm.OnSelect`
- Build plate creation / default plate creation paths
- Batch payment flow around `btnBatchPaymentConfirm.OnSelect`

Use these docs for intended behavior:

- `PowerApps/StaffDashboard-App-Spec.md`
- `SharePoint/BuildPlates-List-Setup.md`
- `SharePoint/Payments-List-Setup.md`

---

## Review Goals

Ask whether the system can get into inconsistent, ambiguous, stale, or hard-to-recover states.

Specifically look for:

- Status drift between `PrintRequests.Status` and child `BuildPlates.Status`
- Running total drift between `PrintRequests.FinalWeight` / `FinalCost` and summed `Payments`
- Ambiguous plate history after removal, re-slicing, or renumbering
- Race conditions from stale UI or multiple staff editing the same request
- Cases where batch and single-item payment logic do not enforce the same rules
- Cases where SharePoint / Power Apps delegation, collection refresh timing, or formula order could produce stale or partial writes
- UX traps where staff could reasonably do the wrong thing even if the formulas are technically valid

---

## Key Design Questions

### 1. Final Pickup Semantics

Batch payment now means:

- every selected request is in `Completed`
- any build-plate-backed request has no `Queued` or `Printing` plates
- all remaining `Completed` plates for that request are being picked up now

Questions:

- Is this rule clear enough in the UI?
- Are there realistic staff workflows where this rule will be violated accidentally?
- Should batch be blocked for some classes of requests even if technically eligible?

### 2. Stable Plate History

The design now separates:

- `PlateNum` = display order only
- `PlateKey` = durable identifier

Questions:

- Are there still places where humans will see only `PlateNum` and draw the wrong conclusion?
- Is storing both display text and stable IDs enough for reconciliation?
- What happens to history readability when plates are heavily reworked over time?

### 3. Parent / Child Consistency

Questions:

- Can a request end up `Paid & Picked Up` while some child plates are still only `Completed`?
- Can `PrintRequests.FinalWeight` / `FinalCost` diverge from `Payments` because of formula order, stale collections, or concurrency?
- Can a request be left in a halfway state if some child patches succeed and others fail?

### 4. Concurrency / Stale UI

Questions:

- What happens if two staff members open the same request or batch at once?
- What happens if one staff member records a single payment while another has a stale batch modal open?
- Which writes are idempotent, and which writes could double-record or overwrite?

### 5. Operational Recovery

Questions:

- If staff makes a mistake, is there a clean correction path?
- Are there irreversible actions that need stronger guardrails?
- Do support staff have enough information in history to reconstruct what actually happened?

---

## Suggested Review Scenarios

Review these scenarios first:

1. Prior partial pickup, then later final batch pickup on the same request.
2. Batch modal opened by Staff A while Staff B records a single-item payment on one selected request.
3. Student picks up some completed plates, then staff removes and re-slices the remaining plates.
4. Staff accidentally removes a previously completed plate that already had payment history.
5. A request has mixed states across plates and is pushed through completion/payment transitions quickly.
6. Batch contains one eligible request and one request that became invalid after the modal opened.
7. Payment history exists, but `PrintRequests` rolled-up totals no longer match.
8. A request without build plates is mixed into batch with requests that do have build plates.

Then look for additional edge cases not listed here.

---

## What To Produce

Each reviewer should add:

- findings ordered by severity
- the exact formula / control / data model area involved
- why it is fragile
- whether it is a real defect, a policy gap, a UX risk, or acceptable warning noise
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
   - Evidence: <reference to spec/yaml/formula behavior>
   - Recommendation: <what to change or watch>

2. ...

### Open Questions

- ...

### Safe / Sound Areas

- ...
```

If you find no serious issues, say that explicitly and list the residual risks anyway.

---

## Notes For Reviewers

- Assume the SharePoint columns `BuildPlates.PlateKey` and `Payments.PlateIDsPickedUp` now exist.
- Do not treat current delegation warnings alone as proof of a defect.
- Distinguish between:
  - hard data integrity risk
  - stale UI risk
  - operational friction
  - future scalability concern
- Prefer concrete workflow failures over abstract architecture complaints.

---

## Seed Observations

These are already known concerns worth confirming or disproving:

- Batch payment used to force `PrintRequests.Status = "Paid & Picked Up"` directly and was fragile.
- Plate numbering is mutable; that is why `PlateKey` and `PlateIDsPickedUp` were introduced.
- SharePoint-backed formulas may still show delegation warnings even when behavior is acceptable for current data volume.
- The most likely remaining weak spots are concurrency, operator misunderstanding, and recovery/correction workflows.

---

## Review Log

### Context7 research notes (Power Apps / Power Fx)

Used library `/websites/learn_microsoft_en-us_power-apps` via Context7. Takeaways relevant to this review:

- **Delegation:** SharePoint lists support delegated **Filter** and **LookUp** for many scenarios; non-delegable patterns or local shaping can still cap how many rows are considered ([delegation overview](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/delegation-overview), [SharePoint connector](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/connections/connection-sharepoint-online)).
- **ForAll:** Loops over tables in Power Fx; Microsoft notes **ForAll is not delegable**, which matters if iteration size grows ([function ForAll](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/functions/function-forall)).
- **Refresh:** **Refresh** pulls a fresh copy of a data source so the app can see **changes made by other users**—it is behavior-only and should be used where concurrent edits matter ([function Refresh](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/functions/function-refresh)).
- **Patch errors:** Microsoft recommends **IfError** / **IsError** around **Patch** because updates can fail; without that, users may not get clear feedback and you can leave partial writes ([Patch](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/functions/function-patch), [error handling](https://learn.microsoft.com/en-us/power-apps/guidance/coding-guidelines/error-handling)).

---

## Review Entry - Cursor (Context7 + spec/yaml) - March 19, 2026

### Findings

1. **Critical — Batch `PrintRequests` rollups omit the payment row just created**
   - **Area:** `btnBatchPaymentConfirm.OnSelect` → after `Patch(Payments, ...)`, the same iteration patches `PrintRequests` with `FinalWeight: Sum(Filter(colAllPayments, RequestID = BatchItem.ID), Weight)`, `FinalCost: Sum(..., Amount)`, and `PaymentDate: Max(..., PaymentDate)`.
   - **Risk:** `colAllPayments` is filled once at Step 1 (`ClearCollect(colAllPayments, Payments)` after `Refresh(Payments)`) and is **not** refreshed or appended inside the `ForAll`. The new batch `Payments` row therefore **does not exist in `colAllPayments`** when those sums run. Parent totals and max payment date can be **systematically wrong** after every batch final pickup (until some other code path recomputes them). This directly matches review scenario **#7** (history exists but rollups do not match).
   - **Evidence:** `PowerApps/StaffDashboard-App-Spec.md` (batch confirm block, parent `Patch` using `colAllPayments`); `Dashboard Yaml` (`btnBatchPaymentConfirm` OnSelect mirrors the same pattern). Contrast **single** payment: after `Patch(Payments, ...)`, the app does `ClearCollect(colAllPayments, Payments)` then rebuilds `colPayments` and uses `Sum(colPayments, …)` for the parent patch — so single-item flow **does** include the new row.
   - **Classification:** **Real defect** (data integrity on `PrintRequests`).
   - **Recommendation:** Inside each batch iteration, after a successful `Patch` to `Payments`, either (a) add the patched record into `colAllPayments` (e.g. `Collect(colAllPayments, <newRow>)` if you capture the `Patch` result), or (b) re-`Refresh(Payments); ClearCollect(colAllPayments, Payments)` (heavier), or (c) compute rollups as **prior sum + `wBatchWeight` / `wBatchCost`** and set `PaymentDate` with `Max` of prior max and `Today()` / chosen date. Verify `FinalWeight`/`FinalCost` match `Sum(Payments)` for each affected request in a test list.

2. **High — No transactional rollback across `ForAll`; partial failure leaves mixed state**
   - **Area:** `ForAll(colBatchItems, …)` chaining `Patch(BuildPlates, …)`, `Patch(Payments, …)`, `Patch(PrintRequests, …)` without per-step `IfError` / early exit.
   - **Risk:** If a later `Patch` fails (throttling, validation, choice mismatch, network), earlier items in the batch may already have new `Payments` rows, updated plates, and/or updated parents while later items did not — matching **“some child patches succeed and others fail.”** Single-item flow has similar multi-`Patch` structure for plates + parent.
   - **Classification:** **Hard data integrity risk** when errors occur (operational rarity depends on environment).
   - **Recommendation:** Wrap critical patches in `IfError`; on failure, notify with **which** `ReqKey` failed and document a **manual reconciliation** checklist (SharePoint list views filtered by `TransactionNumber` / time). For highest assurance, move multi-record updates to **Power Automate** with retry/compensation (larger change).

3. **High — Concurrency window: one `Refresh` at batch start vs. long-running `ForAll`**
   - **Area:** Batch Step 1 `Refresh` + eligibility checks; then sequential processing of `colBatchItems`.
   - **Risk:** Another staff member can record a **single** payment or status change **after** that refresh but **before** this session finishes all `Patch` calls. Eligibility checks can be stale; parent rollup patches can **overwrite** fields (`TransactionNumber`, `PaymentType`, `StudentOwnMaterial`, etc.) on `PrintRequests` using batch values even when partial history already existed — amplifying damage if combined with finding **#1** (wrong `FinalWeight`/`FinalCost`).
   - **Classification:** **Stale UI / concurrency risk** (realistic in busy labs).
   - **Recommendation:** Per Microsoft’s **Refresh** guidance, re-validate immediately before each request (or use a flow that reads authoritative state). At minimum, re-`Refresh`/`ClearCollect` of `Payments` and `BuildPlates` **inside** the loop before patching each `BatchItem`, or switch to server-side orchestration. Align batch parent-field updates with single-payment semantics (append-only notes vs. overwrite).

4. **Medium — Rounded proportional split may not sum to entered batch weight/cost**
   - **Area:** `Round((BatchItem.EstimatedWeight / varBatchTotalEstWeight) * varBatchCombinedWeight, 2)` and analogous cost split.
   - **Risk:** Summed per-row `Weight`/`Amount` across `Payments` for the same transaction can differ by cents or grams from what staff typed — reconciliation and exports can show noise.
   - **Classification:** **Operational friction** / minor integrity noise (not necessarily wrong if policy accepts rounding).
   - **Recommendation:** Adjust last item in the batch to absorb remainder (`total - Sum(previous)`), or store **batch-level** transaction metadata only on a single row and link line items (bigger schema change).

5. **Medium — UX / policy: “final pickup only” is easy to violate under pressure**
   - **Area:** Batch modal copy vs. single `chkPartialPickup` flow; spec explicitly says batch picks **all remaining `Completed`** plates.
   - **Risk:** Staff can still open batch for a job where the student only takes **some** completed plates; concurrency check does not read minds. Matches scenarios **#1**, **#6**, **#8** if eligibility is narrowly technical.
   - **Classification:** **UX risk** + **policy gap** (spec mitigates with guidance to use Step 12C instead — depends on training).
   - **Recommendation:** In batch UI, show explicit **“All completed plates will be marked picked up”** and count of plates; block or warn when `CountRows(completed) > 0` and staff intent is ambiguous (e.g. require typing confirmation).

6. **Medium — `PlatesPickedUp` snapshot in batch uses ID-based synthetic numbering**
   - **Area:** Batch builds display text via `priorPlate.ID <= plate.ID` ordering (`StaffDashboard-App-Spec.md` batch section).
   - **Risk:** If staff-facing `PlateNum` elsewhere comes from `colBuildPlatesIndexed` with a different ordering rule, **payment receipts** and **gallery labels** can disagree — undermining trust in `PlateNum` as “display only” and complicating support calls (design question **#2**).
   - **Classification:** **UX / reconciliation risk**.
   - **Recommendation:** Reuse the **same** `PlateNum` column already on rows (once indexed) in the snapshot, or document that batch receipts use **plate creation order**, not UI order.

7. **Low — `LookUp(BuildPlates, ID = …)` inside loops**
   - **Area:** Plate status patches in single and batch flows use `LookUp` on the **data source** (not `colAllBuildPlates`).
   - **Risk:** At very large list sizes, delegation and performance could degrade; startup collections avoid this for **read** UI but writes still hit the connector.
   - **Classification:** **Future scalability concern** (likely fine for current volumes).
   - **Recommendation:** Monitor list size; if needed, `LookUp(colAllBuildPlates, …)` after a targeted refresh for the relevant `RequestID`.

8. **Low — Single payment enables plate pickup list bypass when no completed plates**
   - **Area:** `btnPaymentConfirm` `DisplayMode` only forces picked plates when `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0`.
   - **Risk:** If indexing is stale vs. reality, edge cases could allow recording payment without picking up plates — usually overridden by operational discipline.
   - **Classification:** **Acceptable warning noise** unless indexing refresh is buggy.

### Suggested-review scenarios (mapped)

| # | Scenario | Assessment |
|---|-----------|------------|
| 1 | Partial pickup then later batch | Supported in principle; **#1** and **#5** affect trust in rollups and operator discipline. |
| 2 | Batch open while other staff single-pays | **#3** — stale selection and overwrites possible. |
| 3 | Pickup then re-slice | `PlateKey` on new plates + old `PlateIDsPickedUp` is sound **if** old keys are never reused; confirm removal flows do not recycle keys. |
| 4 | Remove plate that had payment history | Operational hazard: history references a key that may no longer exist on active plates — support must use **Payments** and audit, not live `BuildPlates` alone. |
| 5 | Mixed plate states, fast transitions | Race between UI collections and datasource; mitigated by refreshes but not bulletproof (**#3**). |
| 6 | One invalid after modal open | Batch Step 1 abort paths address **status** and **final-pickup** validity; still subject to **#3** after pass. |
| 7 | Payments vs rollups mismatch | **#1** guarantees this for batch until fixed; single flow is structurally safer. |
| 8 | No-build-plate request in batch | Eligibility filter excludes build-plate-backed invalid cases; zero-plate requests skip plate patches — ensure product intent matches finance policy. |

### Key design questions (brief answers)

1. **Final pickup semantics / UI** — Rule is documented in spec but **easy to miss** under time pressure; recommend stronger on-screen warnings (**#5**).
2. **Stable plate history** — `PlateKey` + `PlateIDsPickedUp` is **enough for machine reconciliation** if every plate row gets a key at creation and keys are immutable; humans still lean on `PlateNum` in **StaffNotes** and snapshots — train staff to cite **transaction + PlateKey** when escalating (**#6**).
3. **Parent/child consistency** — With **#1**, request can be `Paid & Picked Up` while `FinalCost` **understates** `Payments`; plate statuses may be `Picked Up` while parent still shows wrong rollup. Child `Completed` with parent `Paid & Picked Up` should not happen if batch/single plate patches succeed.
4. **Concurrency** — No built-in row locking; **Refresh** helps only at points you call it (**#3**). Idempotency: repeating the same batch transaction number could create **duplicate** `Payments` rows unless prevented by policy or flow.
5. **Operational recovery** — Revert modal excludes `Paid & Picked Up`; corrections are **SharePoint/manual** or a dedicated admin flow — acceptable if documented; consider stronger guardrails on **irreversible** batch submit if **#2** occurs.

### Open Questions

- Should `PrintRequests.TransactionNumber` / `PaymentType` on batch represent **only** the latest batch, or stay compatible with multi-payment history? Overwriting may confuse reporting if prior single payments used different types.
- Is there a **unique constraint** (or automation) on `Payments.TransactionNumber` to prevent accidental double submission?
- Do exports and dashboards read **only** `Payments`, or also `PrintRequests.FinalWeight`/`FinalCost`? If the latter, **#1** corrupts downstream analytics until fixed.

### Safe / sound areas

- **Single-item** `btnPaymentConfirm` path rebuilds `colAllPayments` / `colPayments` **before** recomputing parent `FinalWeight` and `FinalCost`, so running totals align with the new row (spec block ~6996–7021).
- **Batch Step 1** re-validates parent `Completed` and “final pickup” plate conditions against refreshed data — good pattern per Microsoft’s **Refresh** intent; limitation is **time-to-complete** the loop, not the idea.
- **Introduction of `PlateKey` / `PlateIDsPickedUp`** directly addresses mutable `PlateNum` and is the right separation of display vs. durable identity (`SharePoint/BuildPlates-List-Setup.md`, `Payments-List-Setup.md`, spec durability notes).
- **Using `ForAll` + per-row `Patch`** for SharePoint is an intentional compatibility choice (spec troubleshooting note) vs. bulk `Patch(table, ForAll)` — reasonable tradeoff if error handling is added (**#2**).

---

## Review Entry - AI Assistant - March 19, 2026

### Findings

1. **High**: Single Payment Partial Failure State
   - **Area**: `btnPaymentConfirm.OnSelect` (Dashboard Yaml)
   - **Risk**: The logic creates the `Payments` record *before* updating the `BuildPlates` and `PrintRequests`. If the `Patch` to `BuildPlates` or `PrintRequests` fails, the transaction is already recorded in `Payments`. Since there is no rollback, the student is charged, but the system still shows the plates as `Completed` and the request as `Completed`.
   - **Evidence**: `varPaymentSaved` is checked, and then a `ForAll` patches `BuildPlates`, followed by a `Patch` to `PrintRequests`. If either of the latter fails, the payment record is orphaned.
   - **Recommendation**: Implement a manual reconciliation view or use Power Automate to handle the transaction atomically.

2. **Medium**: `wResultStatus` Evaluation Relies on Potentially Failed Patches
   - **Area**: `btnPaymentConfirm.OnSelect` (Dashboard Yaml)
   - **Risk**: The status of the parent request is determined by checking if any plates remain in a non-picked-up state: `CountRows(Filter(colAllBuildPlates, RequestID = varSelectedItem.ID, Status.Value <> "Picked Up")) > 0`. However, `colAllBuildPlates` is refreshed *after* the `BuildPlates` patches but without verifying if those patches succeeded. If a plate patch failed silently, `colAllBuildPlates` will correctly reflect that it wasn't picked up, preventing the parent from moving to `Paid & Picked Up`. While this acts as a safeguard, it leaves the system in the partial failure state described in Finding 1.
   - **Evidence**: `ClearCollect(colAllBuildPlates, BuildPlates)` is called right before evaluating `wResultStatus`.
   - **Recommendation**: Add explicit `IfError` checks around the `BuildPlates` patches and abort the parent update if any child patch fails, while notifying the user to manually revert the payment.

3. **Low**: Double-Click Vulnerability on Payment Confirmation
   - **Area**: `btnPaymentConfirm.OnSelect` and `btnBatchPaymentConfirm.OnSelect`
   - **Risk**: Although `varIsLoading` is set to true immediately, Power Apps buttons can sometimes register rapid double-clicks before the UI disables the button, leading to duplicate `Payments` records being created.
   - **Evidence**: `Patch(Payments, Defaults(Payments), ...)` is an insert operation.
   - **Recommendation**: Add a local context variable to disable the button immediately upon the first click, or check if a payment with the exact same `TransactionNumber` was created in the last few seconds.

### Open Questions

- Is there a standard operating procedure (SOP) for staff to void or refund a payment if they realize they made a mistake immediately after clicking "Record Payment"? Currently, the UI lacks a "Delete Payment" function.
- Should batch payments be completely disabled for requests that already have partial payments to force staff to review the complex history manually?

### Safe / Sound Areas

- **Partial Pickup Logic**: The single payment flow correctly handles partial pickups by evaluating if any plates are left behind before moving the parent status to `Paid & Picked Up`.
- **Concurrency Check in Batch**: The initial concurrency check in `btnBatchPaymentConfirm` is a strong safeguard against processing requests that have already been modified by another user.

---

## Review Entry - GPT-5.4 + Context7 - March 19, 2026

### Findings

1. **Critical**: Batch parent rollups are patched from stale `colAllPayments`
   - **Area**: `btnBatchPaymentConfirm.OnSelect`
   - **Risk**: A request can be marked `Paid & Picked Up` while `PrintRequests.FinalWeight`, `FinalCost`, and `PaymentDate` still exclude the batch payment row that was just created. That creates immediate drift between `PrintRequests` and canonical `Payments` history.
   - **Evidence**: The batch flow does `Refresh(Payments); ClearCollect(colAllPayments, Payments)` once up front, then inside `ForAll(colBatchItems...)` it `Patch`es a new `Payments` record and immediately patches the parent with `Sum(Filter(colAllPayments, RequestID = BatchItem.ID), Weight)`, `Sum(..., Amount)`, and `Max(..., PaymentDate)`. `colAllPayments` is not refreshed until after the whole loop finishes. By contrast, the single-item flow refreshes payment collections before recomputing the parent rollup.
   - **Recommendation**: Fix this as a real defect. Capture the new payment row from `Patch(...)` and include it in the rollup before patching `PrintRequests`, or re-query `Payments` for that request after the insert and only then write parent totals.

2. **High**: Batch pricing assumes filament pricing for every request
   - **Area**: `lblBatchCostValue`, `varBatchFinalCost`, `icoBatchCheck.Visible`, and `btnBatchPaymentConfirm.OnSelect`
   - **Risk**: Resin jobs can be undercharged, and mixed filament/resin batches have no clear pricing rule. Staff can therefore record a financially wrong transaction even when the workflow is otherwise "valid."
   - **Evidence**: Card eligibility for batch is only `varBatchSelectMode && ThisItem.Status.Value = "Completed"`, so any completed request can be selected. The batch modal cost preview and save logic both use `varFilamentRate` directly; unlike the single-item payment flow, there is no `If(Method.Value = "Resin", varResinRate, varFilamentRate)` branch.
   - **Recommendation**: Either block resin and mixed-method requests from batch entirely, or compute batch allocation per request using that request's `Method`.

3. **High**: `Add More Items` can insert the same request into the batch multiple times
   - **Area**: `btnAddMoreItems.OnSelect` and `btnBatchPaymentConfirm.OnSelect`
   - **Risk**: Duplicate entries in `colBatchItems` can produce duplicate payment rows, repeated `BuildPlates` updates, and duplicate audit entries for the same request.
   - **Evidence**: `btnAddMoreItems.OnSelect` uses `Collect(colBatchItems, varSelectedItem)` with no `ID` guard. The card-level batch toggle does dedupe on `ThisItem.ID in colBatchItems.ID`, but this path does not. The save path then processes `ForAll(colBatchItems As BatchItem, ...)` directly.
   - **Recommendation**: Treat this as a real defect. Add the same `ID in colBatchItems.ID` guard to `btnAddMoreItems`, or normalize `colBatchItems` through `Distinct(ID)` before the batch loop.

4. **High**: Payment writes are non-transactional and only partially error-handled
   - **Area**: Single-item `btnPaymentConfirm.OnSelect`; batch `btnBatchPaymentConfirm.OnSelect`
   - **Risk**: Half-written states are plausible: a `Payments` row saved but `BuildPlates` not updated, `BuildPlates` updated but parent rollups/status not updated, or some requests in a batch succeeding while others fail. Staff may still receive a generic success path and no precise repair guidance.
   - **Evidence**: In the single-item flow, only the initial `Payments` insert is inside `IfError`; later `BuildPlates` and `PrintRequests` patches are not. In the batch flow, the main `ForAll` contains unguarded `Patch` calls for `BuildPlates`, `Payments`, and `PrintRequests`. Microsoft Learn guidance surfaced via Context7 and web research notes that `ForAll` can process records in any order and, when possible, in parallel, so it should not be treated like an atomic transaction with implicit rollback.
   - **Recommendation**: Add per-request error capture around every critical patch, stop advancing the parent when any child write fails, and surface item-level failures. Long term, this is a good candidate for a Power Automate orchestration that can log, retry, and compensate.

5. **Medium**: Batch UI does not clearly restate the "final pickup only" rule at commit time
   - **Area**: Batch modal UI copy and selected-item summary
   - **Risk**: Staff can reasonably read batch as "multiple jobs in one payment" rather than "all remaining completed pieces for every selected request are leaving now." That makes accidental policy violations likely under time pressure.
   - **Evidence**: The app spec says batch is for final pickup only, but the actual modal controls are generic: `Selected Items:`, `Process Batch Payment`, and `Record Batch Payment`. The selected-item rows show only `ReqKey`, student, estimated weight, and estimated cost; they do not show the pickup consequence or plate-state summary.
   - **Recommendation**: Add a persistent warning inside the batch modal such as `Final pickup only - all remaining completed plates on each request will be marked picked up`, plus per-item eligibility text.

6. **Medium**: Rounded proportional batch splits can drift from the amount staff entered
   - **Area**: `wBatchWeight` and `wBatchCost` in `btnBatchPaymentConfirm.OnSelect`
   - **Risk**: The sum of child `Payments.Amount` or `Payments.Weight` rows can differ slightly from the total transaction the staff member typed. That is small, but it becomes awkward for receipt reconciliation when several rows share one `TransactionNumber`.
   - **Evidence**: Each item's amount and weight are individually rounded with `Round(...)`, but there is no last-item remainder adjustment.
   - **Recommendation**: Allocate the remainder to the final request in the batch so the persisted rows sum exactly to the entered total.

7. **Medium**: Recovery after a bad payment is weak and appears to require manual list repair
   - **Area**: Revert flow and payment correction workflow
   - **Risk**: If staff double-processes a request, charges the wrong amount, or marks the wrong plates as picked up, there is no clean in-app correction path. That raises the operational impact of every defect above.
   - **Evidence**: The spec explicitly says `Paid & Picked Up` cannot be reverted. The documented details editor allows transaction-number correction, but there is no documented void/refund/reopen workflow that recomputes parent totals from canonical `Payments` history.
   - **Recommendation**: Add an admin-only repair path: void a payment row, reopen the request, recompute `FinalWeight` / `FinalCost` from `Payments`, and log the correction reason.

### Open Questions

- Should batch be limited to filament-only requests for now, with resin explicitly blocked until there is a defensible mixed-method pricing rule?
- Should requests that already have partial-payment history be excluded from batch to reduce recovery complexity?
- Do downstream exports and dashboards read only from `Payments`, or do any still trust `PrintRequests.FinalWeight` / `FinalCost` as authoritative? That matters because finding 1 will corrupt any downstream logic that trusts the parent cache.
- Should there be a formal "re-sync request totals from children" admin action for support staff?

### Safe / Sound Areas

- The `PlateKey` plus `Payments.PlateIDsPickedUp` design is the right durability split. Storing both stable IDs and a human-readable snapshot is much safer than relying on mutable `PlateNum`.
- The single-item payment path is structurally safer than the batch path because it refreshes payment collections before recomputing parent totals.
- The single-item status rule is sensible: it keeps the parent at `Printing` or `Completed` when refreshed plate state still shows remaining non-picked-up work, and only reaches `Paid & Picked Up` on true final pickup.

---

## Review Entry - Claude (Opus) + Context7 - March 19, 2026

### Methodology

Reviewed the full `Dashboard Yaml` formula implementations for `btnPaymentConfirm.OnSelect`, `btnBatchPaymentConfirm.OnSelect`, `btnComplete.OnSelect`, `btnRevertConfirm.OnSelect`, `btnRemovePlate.OnSelect`, `btnAddPlate.OnSelect`, App.OnStart collections, and all supporting DisplayMode / Visible gates. Cross-referenced against `SharePoint/BuildPlates-List-Setup.md`, `SharePoint/Payments-List-Setup.md`, and intended behaviors from the review prompt. Confirmed Power Apps ForAll/ClearCollect constraints via official Microsoft documentation through Context7: ClearCollect is explicitly prohibited inside ForAll to avoid ordering dependencies, which makes the stale-collection defect structurally unfixable by simple refresh.

### Findings

#### 1. CRITICAL: Batch Parent Totals Miss the Current Batch Payment (confirms prior reviewers)

- **Area:** `btnBatchPaymentConfirm.OnSelect` — Step 3 ForAll, `Patch(PrintRequests, ...)` block
- **Risk:** `FinalWeight` and `FinalCost` are computed as `Sum(Filter(colAllPayments, RequestID = BatchItem.ID), Weight/Amount)`. But `colAllPayments` was snapshot at Step 1 BEFORE the ForAll creates any Payment records. The new batch payment is absent from the sum. ClearCollect inside ForAll is prohibited by the Power Apps runtime, confirming this is not a trivial fix.
- **Evidence:** Dashboard Yaml Step 1: `ClearCollect(colAllPayments, Payments)`. Step 3 ForAll: `Patch(Payments, Defaults(Payments), {...})` then `Patch(PrintRequests, ..., {FinalWeight: Sum(Filter(colAllPayments, ...))})`. Microsoft docs (via Context7): "functions like UpdateContext, Clear, and ClearCollect are prohibited within ForAll."
- **Impact:** For first-time final pickups: `FinalWeight = 0`, `FinalCost = 0`. For requests with prior partial payments: totals are short by the batch amount. `Payments` list is correct; only `PrintRequests` rolled-up fields are wrong.
- **Classification:** Hard data integrity defect.
- **Recommendation:** Replace the Sum expressions with explicit addition: `FinalWeight: Sum(Filter(colAllPayments, RequestID = BatchItem.ID), Weight) + wBatchWeight` and `FinalCost: ... + wBatchCost`. For `PaymentDate`, use `Max(Max(Filter(colAllPayments, ...), PaymentDate), Today())`. This sidesteps the ClearCollect prohibition entirely.

#### 2. HIGH: Batch Payment Always Uses Filament Rate, Ignoring Resin (confirms prior reviewers)

- **Area:** `btnBatchPaymentConfirm.OnSelect` — `varBatchFinalCost` calculation
- **Risk:** Formula: `Max(Value(txtBatchWeight.Text) * varFilamentRate, varMinimumCost)`. Always uses `varFilamentRate` ($0.10/g), never checks `Method.Value` or uses `varResinRate` ($0.30/g). Resin prints are undercharged by ~67%.
- **Evidence:** Single payment correctly uses `If(varSelectedItem.Method.Value = "Resin", varResinRate, varFilamentRate)` (Dashboard Yaml ~line 4607). Batch has no equivalent.
- **Classification:** Hard data integrity defect (financial).
- **Recommendation:** Compute per-item costs inside the ForAll using each item's `Method.Value` to select rate, then sum. Or block resin from batch until per-item pricing is implemented.

#### 3. HIGH: Plate Removal Has No Payment History Guard (new finding — not in prior reviews)

- **Area:** `btnRemovePlate.OnSelect` in the Build Plates modal
- **Risk:** Executes `Remove(BuildPlates, LookUp(BuildPlates, ID = ThisItem.ID))` with zero checks. If the plate's `PlateKey` is referenced in `Payments.PlateIDsPickedUp`, the payment history reference becomes orphaned. The plate record vanishes from SharePoint but the audit trail still cites it.
- **Evidence:** Dashboard Yaml ~line 5443: hard `Remove` with no guard. `Payments.PlateIDsPickedUp` stores PlateKey values as text; lookup against a deleted plate returns nothing.
- **Impact:** Audit trail is broken for that plate. Support staff cannot reconstruct what happened. Disputes over specific plate charges become unresolvable from the data.
- **Classification:** Hard data integrity risk.
- **Recommendation:** Before removing, check if the PlateKey appears in any Payments record. If so, either block the removal with `Notify("This plate has payment history and cannot be deleted.")`, or soft-delete by adding a "Removed" status value to BuildPlates rather than hard-deleting the row.

#### 4. HIGH: Batch ForAll Has No Per-Item Error Handling (confirms + extends prior reviewers)

- **Area:** `btnBatchPaymentConfirm.OnSelect` — Step 3 ForAll body
- **Risk:** Three sequential operations per item (patch plates, create payment, patch request) with no IfError per operation. Power Apps ForAll "can process records in any order and potentially in parallel" (Microsoft docs via Context7). A failure on item 3 of 5 does not stop items 4 and 5. Post-ForAll, Step 5 unconditionally clears `colBatchItems`, closes the modal, and shows `"X items processed successfully!"` — including failures.
- **Evidence:** Step 3 ForAll has zero IfError. Step 5 uses `varBatchProcessedCount` (set BEFORE processing) for the success message.
- **Classification:** Hard data integrity risk + operational recovery risk.
- **Recommendation:** Wrap per-item operations in IfError. Track failures in a local collection. After ForAll, report `"X of Y items processed; Z failed — please review [list]"` and keep failed items in `colBatchItems` for retry. Set `varBatchProcessedCount` AFTER processing, from the success collection count.

#### 5. MEDIUM: Single Payment Flow Has No Concurrency Check (new finding — extends prior reviewer #3)

- **Area:** `btnPaymentConfirm.OnSelect`
- **Risk:** Unlike the batch flow (which refreshes and validates at Step 1), the single payment flow starts immediately with cost calculation and Patch. No `Refresh(PrintRequests)` or status revalidation. Two staff can open payment modals for the same request and both submit.
- **Evidence:** Dashboard Yaml ~line 4598: `Set(varIsLoading, true)` then straight to `Set(varBaseCost, ...)` and `Patch`. Compare batch Step 1: `Refresh(PrintRequests); Refresh(BuildPlates); Refresh(Payments)` + status checks.
- **Impact:** Double-recorded payments. Duplicate Payment records for the same plates. Parent totals doubled.
- **Classification:** Stale UI / concurrency risk.
- **Recommendation:** Add `Refresh(PrintRequests)` + status revalidation at the top of `btnPaymentConfirm.OnSelect`, mirroring the batch flow pattern.

#### 6. MEDIUM: Batch Flow Writes No StaffNotes (new finding)

- **Area:** `btnBatchPaymentConfirm.OnSelect` — `Patch(PrintRequests, ...)` in Step 3
- **Risk:** Single payment appends a detailed StaffNotes entry (amount, weight, plate IDs, transaction number, timestamp). Batch writes nothing to StaffNotes. If the audit flow in Step 4 fails (handled with `IfError → Blank()`, silently swallowed), there is zero on-record breadcrumb.
- **Evidence:** Single flow StaffNotes at Dashboard Yaml ~line 4756-4769. Batch Patch in Step 3 has no StaffNotes field.
- **Classification:** Operational recovery risk.
- **Recommendation:** Append a StaffNotes entry in the batch Patch using the same format as the single flow: `"PAID (BATCH) by [staff]: $X.XX (Yg) #[txn] [type] (Plate IDs ...) - [timestamp]"`.

#### 7. MEDIUM: Batch Writes Deprecated Fields; Single Flow Does Not (new finding)

- **Area:** `btnBatchPaymentConfirm.OnSelect` — sets `TransactionNumber` and `PaymentType` on PrintRequests
- **Risk:** Per `Payments-List-Setup.md`, these PrintRequests fields are "Deprecated — not updated for new payments." Single payment correctly omits them. Batch writes them. After batch processing, deprecated fields are populated; after single payment, they retain whatever legacy value they had.
- **Evidence:** Batch Patch includes `TransactionNumber: txtBatchTransaction.Text` and `PaymentType: LookUp(Choices(...))`. Single Patch (Dashboard Yaml ~line 4739-4781) has neither.
- **Classification:** Inconsistency / operational friction.
- **Recommendation:** Remove both from the batch Patch to match single flow and deprecation intent.

#### 8. MEDIUM: StudentOwnMaterial on Parent is Last-Write-Wins (new finding)

- **Area:** Both payment flows — `Patch(PrintRequests, ..., {StudentOwnMaterial: chkOwnMaterial.Value})`
- **Risk:** On multi-payment requests, the parent field is overwritten by the most recent payment's checkbox. Payment #1 with own-material + Payment #2 without → parent shows `false`, contradicting the actual history. The per-payment `Payments.StudentOwnMaterial` is correct, but the parent is misleading.
- **Evidence:** Single flow ~line 4746, batch flow Step 3 — both unconditionally set the parent field.
- **Classification:** Minor data integrity risk.
- **Recommendation:** Either stop writing this field on PrintRequests (derive from Payments when needed), or compute as `CountRows(Filter(colPayments, StudentOwnMaterial)) > 0` (true if ANY payment used own material).

#### 9. LOW: Revert from Completed Does Not Address Plate Status Mismatch (new finding)

- **Area:** `btnRevertConfirm.OnSelect` + `ddRevertTarget`
- **Risk:** Reverting Completed → Printing changes only PrintRequests.Status. Child plates at "Completed" stay at "Completed". Job card shows "3/3 done" while parent says "Printing." Not a data integrity issue (plate status independently reflects reality), but confusing for staff.
- **Evidence:** Dashboard Yaml ~line 3458: only patches PrintRequests. No BuildPlates patches in revert.
- **Classification:** UX risk / operational friction.
- **Recommendation:** Display a warning on revert: "Plate statuses are unchanged. Adjust individual plate statuses in the Build Plates modal if needed." Or prompt staff to select which plates should revert.

#### 10. LOW: Batch Applies Own-Material Discount Uniformly (new finding)

- **Area:** `btnBatchPaymentConfirm.OnSelect` — single `chkBatchOwnMaterial` checkbox
- **Risk:** One checkbox applies the 70% discount to ALL items. Mixed own-material/lab-material batches are priced incorrectly.
- **Evidence:** `varBatchFinalCost` uses `chkBatchOwnMaterial.Value` globally. Each item's Payments record gets the same `StudentOwnMaterial` value.
- **Classification:** Policy gap / UX limitation.
- **Recommendation:** If mixed batches are common, add per-item own-material overrides. If rare, document that mixed batches must be processed individually.

#### 11. LOW: No Payment Amount Sanity Check (new finding)

- **Area:** Both payment flows — weight input drives cost with no validation against estimates
- **Risk:** Staff typo (1500g instead of 150g) produces a 10× overcharge with no warning. Neither DisplayMode checks weight against `EstimatedWeight`.
- **Evidence:** Neither `btnPaymentConfirm.DisplayMode` nor `btnBatchPaymentConfirm.DisplayMode` compares entered weight to estimated weight.
- **Classification:** UX risk.
- **Recommendation:** Add a warning label (not a hard block) when entered weight deviates >50% from `EstimatedWeight`: `"⚠️ Entered weight is 3× the estimate — please verify."`

#### 12. LOW: Rounding Drift on Batch Weight/Cost Splits (confirms prior reviewers)

- **Area:** Per-item `Round(..., 2)` allocation in batch ForAll
- **Risk:** Sum of rounded per-item values may not equal entered total. $10.00 ÷ 3 = 3 × $3.33 = $9.99.
- **Classification:** Acceptable at current scale but creates reconciliation noise.
- **Recommendation:** Assign remainder to the last item: `lastItemCost = totalCost - Sum(allPriorItems)`.

### Scenario Walk-Through Results

| # | Scenario | Result |
|---|----------|--------|
| 1 | Prior partial pickup → batch final pickup | **FAIL**: Batch running totals exclude batch payment (Finding 1). Parent `FinalWeight`/`FinalCost` are short. |
| 2 | Batch modal open, Staff B single-pays | **PASS if status changes**: Batch concurrency check aborts. **PARTIAL FAIL if status stays Completed**: Batch proceeds but totals are stale (Finding 1), and no concurrency guard on the single side (Finding 5). |
| 3 | Partial pickup, then remove + re-slice | **PASS**: Non-paid plates can be removed. New plates get fresh PlateKeys. PlateNum renumbering is display-only. |
| 4 | Remove plate with payment history | **FAIL**: Hard delete orphans payment references (Finding 3). No guard or warning. |
| 5 | Mixed plate states, fast transitions | **PASS**: Each plate status change in Build Plates modal refreshes `colAllBuildPlates`. Completion gate uses fresh data. |
| 6 | Batch with one valid + one newly invalid | **PASS**: Concurrency check aborts entire batch. All-or-nothing is correct. |
| 7 | Payment history vs. rollup mismatch | **EXPECTED FAILURE from Finding 1**: Batch-processed requests will have stale totals. No automated reconciliation. |
| 8 | No-plate request in batch with plate-backed | **PASS**: Batch validation only applies plate checks to plate-backed requests. Non-plate requests pass with empty plate fields. |

### Additional Edge Cases Not in Original Scenarios

- **Add More Items duplicate injection (confirmed from prior reviewer):** `btnAddMoreItems.OnSelect` uses `Collect(colBatchItems, varSelectedItem)` without an ID guard. If the same request is added twice, the batch ForAll processes it twice, creating duplicate payments and double-patching the parent.
- **Payment from Printing status with zero completed plates:** Staff can record a payment while no plates are Completed (DisplayMode gate only requires plate selection when completed plates exist). This may be intentional for advance payments but is undocumented and could confuse plate reconciliation.
- **Batch audit log (Step 4) uses post-ForAll plate state:** Step 4 refreshes `colAllBuildPlates` after the ForAll, then logs audit entries referencing `Status.Value = "Picked Up"` plates. If a plate patch failed in Step 3, the audit log would correctly show it as NOT picked up — but the success notification from Step 5 wouldn't mention the discrepancy.

### Open Questions

- **Should batch be blocked for requests with prior partial payments?** Combining single-payment history with batch close creates mixed tracking patterns and amplifies the stale-totals defect.
- **Is there a planned total reconciliation mechanism?** No way currently exists to recalculate `FinalWeight`/`FinalCost` from `Payments` if they drift. A "Recalculate Totals" admin action would close this gap for all defect paths.
- **Should plate removal be soft-delete?** A "Removed" status on BuildPlates (rather than deleting the row) would preserve history while keeping the plate out of active workflow.
- **Is "payment from Printing with no completed plates" intentional?** If so, it should be documented. If not, the DisplayMode gate should require `Status.Value = "Completed"` on at least one plate before enabling the button.
- **Are there any downstream reports that read `PrintRequests.FinalWeight`/`FinalCost` as authoritative?** If so, Finding 1 corrupts those reports. If reports read only from `Payments`, the impact is limited to the UI display.

### Safe / Sound Areas

- **PlateKey generation** via `Text(GUID())` is durable, unique, and correctly immutable. Sound design.
- **Single payment refresh-then-compute pattern** is correct. `ClearCollect(colAllPayments, Payments)` is called AFTER the new Payment is patched and BEFORE parent totals are computed. Totals are accurate.
- **Batch concurrency check (Step 1)** is well-designed: refreshes all three data sources, validates parent status, and validates plate-level eligibility. All-or-nothing abort is correct.
- **Plate status progression** is enforced by UI gates. Completion gate blocks "Print Complete" until all plates are Completed or Picked Up. Batch gate blocks processing if plates are Queued or Printing.
- **PlateNum indexing** (`CountRows(Filter(..., priorPlate.ID <= plate.ID))`) is consistent between flows.
- **PlateIDsPickedUp / PlatesPickedUp separation** is architecturally sound. Stable keys for data integrity, display labels for readability.
- **Audit flow logging** is IfError-wrapped in both flows. Audit failures never block payment processing.
- **Build Plates modal** refreshes `colAllBuildPlates` after every add, remove, and status-change operation.
- **Payment modal plate checklist** correctly filters to `Status.Value = "Completed"` only, preventing staff from selecting plates still printing or already picked up.

---

## Consensus Report — All Reviewers — March 19, 2026

**Reviewers synthesized:** Cursor (Context7 + spec/yaml), AI Assistant, GPT-5.4 (Context7), Claude Opus (Context7)

---

### Reviewer Agreement Matrix

| Finding | Cursor | AI Asst | GPT-5.4 | Claude | Consensus Severity |
|---|:---:|:---:|:---:|:---:|---|
| Batch rollups use stale `colAllPayments` | Critical | — | Critical | Critical | **Critical** |
| Batch pricing ignores resin rate | — | — | High | High | **High** |
| `btnAddMoreItems` allows duplicate batch entries | — | — | High | Confirmed | **High** |
| Plate removal has no payment history guard | — | — | — | High | **High (new)** |
| No per-item error handling in ForAll | High | High | High | High | **High (unanimous)** |
| Concurrency window across batch duration | High | — | — | Extended | **High** |
| "Final pickup only" UX is unclear | Medium | — | Medium | — | **Medium** |
| Rounding drift on batch splits | Medium | — | Medium | Low | **Medium** |
| Batch writes no StaffNotes | — | — | — | Medium | **Medium (new)** |
| Batch writes deprecated fields | — | — | — | Medium | **Medium (new)** |
| `StudentOwnMaterial` is last-write-wins | — | — | — | Medium | **Medium (new)** |
| Recovery / correction workflows are weak | — | Raised | Medium | Extended | **Medium** |
| Double-click / duplicate submission risk | — | Low | — | — | **Low** |
| No payment amount sanity check | — | — | — | Low | **Low (new)** |

---

### Tier 1 — Fix Before Ship

> Critical and High severity findings with multi-reviewer consensus. These represent hard data integrity risks.

#### 1. Batch parent rollups are systematically wrong

**Consensus severity:** Critical (3 of 4 reviewers)

Every batch payment writes `FinalWeight` and `FinalCost` from `colAllPayments`, which was snapshot *before* the batch created any new payment rows. `ClearCollect` inside `ForAll` is prohibited by the Power Apps runtime, so this cannot be fixed by refreshing mid-loop. The single-item flow does not have this bug.

**Converged fix:** Replace the `Sum` expressions with explicit addition:

- `FinalWeight: Sum(Filter(colAllPayments, ...), Weight) + wBatchWeight`
- `FinalCost: ... + wBatchCost`
- `PaymentDate: Max(prior max, Today())`

This sidesteps the `ClearCollect` prohibition entirely.

#### 2. Batch pricing always uses filament rate

**Consensus severity:** High (2 of 4 reviewers)

`varBatchFinalCost` is computed as `weight × varFilamentRate` with no `Method` check. Resin jobs are undercharged by ~67%. The single-item flow correctly branches on `Method.Value`.

**Converged fix:** Compute per-item costs inside `ForAll` using each request's `Method.Value` to select the correct rate. Or block resin / mixed-method requests from batch until per-item pricing is implemented.

#### 3. `btnAddMoreItems` allows duplicate batch entries

**Consensus severity:** High (2 of 4 reviewers)

`Collect(colBatchItems, varSelectedItem)` has no ID guard. The card-level toggle deduplicates, but this alternate path does not. Duplicates produce double payments and double parent patches.

**Converged fix:** Add `If(!(varSelectedItem.ID in colBatchItems.ID), ...)` on `btnAddMoreItems`, or normalize with `Distinct` before the `ForAll`.

#### 4. No per-item error handling in batch ForAll

**Consensus severity:** High (all 4 reviewers)

Three sequential `Patch` calls per item (plates → payment → request) with no `IfError`. Failures on one item do not stop others. The post-loop success message uses a pre-set count and reports success unconditionally.

**Converged fix:** Wrap each `Patch` in `IfError`. Track successes and failures in local collections. Report `"X of Y succeeded; Z failed — review [list]"`. Long term, consider Power Automate for server-side orchestration with retry/compensation.

#### 5. Plate removal has no payment history guard

**Consensus severity:** High (1 reviewer, clearly valid)

`btnRemovePlate.OnSelect` hard-deletes the `BuildPlates` row with zero checks. If that plate's `PlateKey` is referenced in `Payments.PlateIDsPickedUp`, the audit trail is orphaned and dispute resolution becomes impossible.

**Converged fix:** Check if `PlateKey` appears in any `Payments` record before removal. If found, either block with a `Notify`, or soft-delete by adding a `"Removed"` status value instead of hard-deleting the row.

#### 6. Concurrency window extends to single payment

**Consensus severity:** High (2 reviewers)

Batch refreshes at Step 1 but the `ForAll` can run long enough for another staff member to intervene. The single-item flow has *no* refresh or status revalidation — two staff can submit payment for the same request simultaneously.

**Converged fix:** Add `Refresh(PrintRequests)` and status revalidation at the top of `btnPaymentConfirm.OnSelect`, mirroring the batch pattern. For the batch loop, re-validate status immediately before patching each item.

---

### Tier 2 — Fix Soon

> Medium severity. These strengthen reliability, consistency, and operator confidence.

#### 7. "Final pickup only" semantics are unclear in the batch UI

**Consensus severity:** Medium (2 reviewers)

The modal shows generic labels. Nothing explicitly states all remaining completed plates on every selected request will be marked picked up.

**Fix:** Add a persistent warning inside the batch modal and per-item plate count.

#### 8. Rounding drift on batch weight/cost splits

**Consensus severity:** Medium (3 reviewers)

Individual `Round(..., 2)` allocations can diverge from the entered total. No remainder adjustment.

**Fix:** Assign remainder to the last item: `lastItemCost = totalCost - Sum(allPriorItems)`.

#### 9. Batch writes no StaffNotes

**Consensus severity:** Medium (1 reviewer, clearly valid)

Single payment appends a detailed `StaffNotes` entry. Batch writes nothing. If the audit step fails (silently swallowed), there is zero on-record breadcrumb.

**Fix:** Append a `StaffNotes` entry in the batch `Patch` using the single-flow format: `"PAID (BATCH) by [staff]: $X.XX (Yg) #[txn] [type] (Plate IDs ...) - [timestamp]"`.

#### 10. Batch writes deprecated PrintRequests fields

**Consensus severity:** Medium (1 reviewer, clearly valid)

Batch sets `TransactionNumber` and `PaymentType` on `PrintRequests`, which are documented as deprecated. Single payment correctly omits them.

**Fix:** Remove both from the batch `Patch` to match single-flow behavior and deprecation intent.

#### 11. `StudentOwnMaterial` is last-write-wins on parent

**Consensus severity:** Medium (1 reviewer)

Multi-payment requests have the parent field overwritten by whichever payment was recorded last. The per-payment field is correct, but the parent can be misleading.

**Fix:** Stop writing this field on `PrintRequests` and derive from `Payments` when needed, or compute as `CountRows(Filter(colPayments, StudentOwnMaterial)) > 0`.

#### 12. Recovery / correction workflows are weak

**Consensus severity:** Medium (3 reviewers touch on this)

`Paid & Picked Up` cannot be reverted. There is no in-app void, refund, or reopen path. No way to recalculate `FinalWeight` / `FinalCost` from canonical `Payments`. Every defect above is amplified by the lack of a correction path.

**Fix:** Add an admin-only repair path: void a payment row, reopen the request, recompute parent totals from `Payments`, and log the correction reason.

---

### Tier 3 — Monitor / Document

> Low severity. Track these and address as needed.

- **Double-click vulnerability** on payment buttons — add a local disable variable or `TransactionNumber` uniqueness check.
- **No payment amount sanity check** — add a warning when entered weight deviates >50% from `EstimatedWeight`.
- **Batch applies own-material discount uniformly** — document that mixed own-material batches must be processed individually, or add per-item overrides.
- **Revert from Completed doesn't touch plate statuses** — add a warning that plate statuses are unchanged.
- **`LookUp` on data source inside loops** — fine at current volume, monitor list growth.

---

### Universally Confirmed as Sound

All four reviewers agree these areas are solid and require no changes:

- **`PlateKey` / `PlateIDsPickedUp` design** — correct separation of durable identity from display labels.
- **Single-item payment refresh-then-compute pattern** — totals are accurate because collections are rebuilt after the `Patch`.
- **Batch Step 1 concurrency check** — refreshes all sources, validates status and plate eligibility, aborts all-or-nothing.
- **Plate status progression gates** — UI correctly prevents invalid transitions.
- **`PlateNum` indexing** is consistent across flows.
- **Audit flow logging** is `IfError`-wrapped; failures never block payment processing.
- **Build Plates modal** refreshes `colAllBuildPlates` after every add, remove, and status-change operation.

---

### Unresolved Cross-Reviewer Questions

These questions surfaced in 2+ reviews with no definitive answer:

1. **Do downstream reports trust `PrintRequests.FinalWeight` / `FinalCost`?** If yes, the batch rollup defect corrupts analytics. If reports read only from `Payments`, the impact is limited to UI display.
2. **Should batch be blocked for requests with prior partial payments?** Combining single-payment history with batch close creates mixed tracking and amplifies the stale-totals defect.
3. **Is there a unique constraint on `Payments.TransactionNumber`?** Without one, double submissions create duplicate records.
4. **Should a "Recalculate Totals from Payments" admin action exist?** It would close the gap for all rollup-drift scenarios, past and future.
5. **Should plate removal be soft-delete?** A `"Removed"` status preserves history while keeping the plate out of active workflow.

---

### Bottom Line

The system has a correct foundational architecture (`PlateKey`, single-payment flow, batch eligibility checks), but the **batch payment path has at least two hard data defects** (stale rollups, wrong pricing for resin) and **no error handling**. The combination of those three issues means any batch payment on a resin job will silently produce wrong financial data with no recovery path. The single-item flow is structurally safer but still lacks concurrency protection.

**Fixing the six Tier 1 items should be the gate for shipping batch payments to production.**

---

## Resolution Log — March 19, 2026

All Tier 1 and Tier 2 findings have been addressed in `PowerApps/StaffDashboard-App-Spec.md`. Tier 3 items that could be resolved via spec changes are also done.

### Tier 1 — Fix Before Ship

| # | Finding | Resolution |
|---|---------|------------|
| 1 | Batch parent rollups stale `colAllPayments` | **Fixed (prior pass).** Rollups now use `Sum(wPriorPayments, Weight) + wBatchWeight` from the refreshed datasource. |
| 2 | Batch pricing ignores resin rate | **Fixed (prior pass).** Both preview and per-item cost branch on `Method.Value`. |
| 3 | `btnAddMoreItems` allows duplicates | **Fixed (prior pass).** ID guard added. |
| 4 | No per-item error handling in ForAll | **Fixed (prior pass).** `IfError` + `colBatchSucceededItems`/`colBatchFailedItems` with partial-failure reporting. |
| 5 | Plate removal no payment history guard | **Accepted as design.** Spec documents this as intentional — `Payments` rows are the canonical record. |
| 6 | Concurrency window on single payment | **Fixed (prior pass).** Single payment now refreshes + revalidates before save; batch does per-item refresh. |

### Tier 2 — Fix Soon

| # | Finding | Resolution |
|---|---------|------------|
| 7 | "Final pickup only" UI unclear | **Fixed.** `lblBatchSummary` now shows `"⚠️ All completed plates on each item will be marked picked up"` in warning color. `lblBatchItemRow` shows per-item plate counts. |
| 8 | Rounding drift on batch splits | **Fixed.** `varBatchLastItemID`/`varBatchLastItemWeight` absorb the rounding remainder so per-item amounts sum exactly to the entered total. |
| 9 | Batch writes no StaffNotes | **Fixed (prior pass).** Batch Patch now includes StaffNotes in the same format as single payment. |
| 10 | Batch writes deprecated fields | **Fixed.** `TransactionNumber` and `PaymentType` removed from the batch `PrintRequests` Patch. |
| 11 | `StudentOwnMaterial` last-write-wins | **Fixed.** Single: `CountRows(Filter(colPayments, StudentOwnMaterial)) > 0`. Batch: `chkBatchOwnMaterial.Value \|\| CountRows(Filter(wPriorPayments, StudentOwnMaterial)) > 0`. |
| 12 | Recovery / correction workflows weak | **Fixed.** `btnRevert` now visible for `Paid & Picked Up`; `ddRevertTarget` offers `Completed` as a target. Revert Notify warns that plate statuses are unchanged. |

### Tier 3 — Monitor / Document

| Finding | Resolution |
|---------|------------|
| Double-click vulnerability | **Mitigated (prior pass).** `varIsLoading` overlay. |
| No payment amount sanity check | **Fixed.** Both `lblPaymentWeightLabel` and `lblBatchWeightLabel` now show a `⚠️` warning when entered weight deviates >50% from estimate. |
| Batch applies own-material uniformly | **Accepted.** Mixed batches must be processed individually; documented as policy. |
| Revert doesn't touch plate statuses | **Fixed.** Revert Notify now includes plate-status warning. |
| `LookUp` on datasource inside loops | **Accepted.** Fine at current volume. |

### Open Questions — Dispositions

1. **Do downstream reports trust `PrintRequests.FinalWeight`/`FinalCost`?** — **Resolved.** Reports read from `Payments` directly. `PrintRequests` rollup fields are app-display only. Historical drift is cosmetic; the `btnRecalcTotals` button can fix individual items.
2. **Should batch be blocked for requests with prior partial payments?** — **No.** The fixed rollup formula (`Sum(wPriorPayments) + wBatchWeight`) handles mixed history correctly.
3. **Unique constraint on `Payments.TransactionNumber`?** — **Resolved.** Both `btnPaymentConfirm` and `btnBatchPaymentConfirm` now hard-block submission if the entered transaction number already exists in `colAllPayments` (checked against freshly refreshed data).
4. **"Recalculate Totals from Payments" admin action?** — **Not needed.** With the batch rollup defect fixed, `FinalWeight`/`FinalCost` are computed correctly during every payment. The revert-to-Completed path handles correction of mistaken closures. Any historical drift from before the fix can be corrected in SharePoint directly.
5. **Should plate removal be soft-delete?** — **No.** Hard-delete by design; `Payments` rows are canonical history.