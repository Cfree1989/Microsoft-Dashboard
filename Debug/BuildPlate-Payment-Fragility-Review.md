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

No external review entries yet.

