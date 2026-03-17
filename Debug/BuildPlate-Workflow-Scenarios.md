# Build Plate Tracking — Workflow Scenarios

**Purpose:** Document typical and edge-case workflows for the Build Plate Tracking system  
**Related Spec:** `PowerApps/Future Improvements/3-BuildPlate-Tracking-Enhancement.md`

---

## System Overview

### Plate Status Flow

```
Queued → Printing → Completed → Picked Up
```

### Key Rules

1. **Default plate** — 1 plate auto-created on approval using student's requested printer
2. **Completion gate** — Job cannot be marked "Complete" until ALL plates are `Completed` or `Picked Up`
3. **Partial pickup** — Student can pick up completed plates while others are still printing
4. **Plate removal** — Any plate can be removed at any time (supports re-slicing scenarios)
5. **ActualPrinter** — Auto-populated from distinct machines across all plates

---

## Typical Workflows

### Typical 1: Single-Plate Job (Most Common)

**Scenario:** Student submits a small model that fits on one build plate.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | Student | Submits request for keychain on MK4S | Status: `Uploaded` |
| 2 | Staff | Opens Approval Modal, enters weight/hours, clicks Approve | Status: `Ready to Print`, 1 plate auto-created (MK4S, Queued) |
| 3 | Staff | Starts print, clicks "▶ Printing" in Build Plates Modal | Plate 1: `Printing` |
| 4 | Staff | Print finishes, clicks "✓ Done" | Plate 1: `Completed`, Job card shows "1/1 done" |
| 5 | Staff | Clicks "Print Complete" on job card | Complete Modal opens (button was enabled because 1/1 plates done) |
| 6 | Staff | Confirms completion | Status: `Completed`, ActualPrinter: `[MK4S]` |
| 7 | Student | Arrives for pickup | — |
| 8 | Staff | Opens Payment Modal, enters weight/transaction, confirms | Status: `Paid & Picked Up`, Plate 1: `Picked Up` |

**Data at end:**
- `PrintRequests.Status`: Paid & Picked Up
- `PrintRequests.ActualPrinter`: [MK4S]
- `BuildPlates`: 1 record (Picked Up)

---

### Typical 2: Multi-Plate Job, Same Printer

**Scenario:** Architecture student submits a building model sliced into 3 pieces, all fit on MK4S.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | Student | Submits building model requesting MK4S | Status: `Uploaded` |
| 2 | Staff | Opens Approval Modal, clicks "Add Plates/Printers" | Build Plates Modal opens |
| 3 | Staff | Sets Total Plates = 3, adds 3 MK4S plates | 3 plates (all Queued) |
| 4 | Staff | Clicks Done, then Approve | Status: `Ready to Print` |
| 5 | Staff | Loads all 3 onto separate MK4S machines, marks all "▶ Printing" | All 3: `Printing` |
| 6 | Staff | Plates finish at different times, marks each "✓ Done" as they complete | Progress: 1/3 → 2/3 → 3/3 done |
| 7 | Staff | All plates done, clicks "Print Complete" | Button now enabled |
| 8 | Staff | Confirms completion | Status: `Completed`, ActualPrinter: `[MK4S]` |
| 9 | Student | Picks up all 3 pieces at once | Payment recorded, all plates → `Picked Up` |

**Data at end:**
- `PrintRequests.ActualPrinter`: [MK4S] (single value, even though 3 plates)
- `BuildPlates`: 3 records (all Picked Up)

---

### Typical 3: Multi-Plate Job, Multiple Printers

**Scenario:** Student submits a large sculpture. Staff slices it into 4 pieces — 2 fit on MK4S, 2 need the larger XL.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | Student | Submits sculpture requesting XL | Status: `Uploaded` |
| 2 | Staff | Opens Approval Modal → Build Plates Modal | — |
| 3 | Staff | Sets Total = 4, adds 2 MK4S plates + 2 XL plates | 4 plates across 2 printers |
| 4 | Staff | Approves job | Status: `Ready to Print` |
| 5 | Staff | Starts all 4 prints on available machines | All 4: `Printing` |
| 6 | Staff | MK4S plates finish first (smaller), marks done | 2/4 done (MK4S), 2 still printing (XL) |
| 7 | Staff | XL plates finish, marks done | 4/4 done |
| 8 | Staff | Clicks "Print Complete" | ActualPrinter: `[MK4S, XL]` |
| 9 | Student | Picks up | Status: `Paid & Picked Up` |

**Data at end:**
- `PrintRequests.ActualPrinter`: [MK4S, XL] (multi-select captures both)
- `BuildPlates`: 4 records

---

## Edge Case Scenarios

### Edge Case 1: Partial Pickup — Student Takes Some Pieces Early

**Scenario:** Student has a 5-plate job. 3 plates finish, student needs those pieces NOW for a critique, but 2 plates are still printing overnight.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | — | Job approved with 5 plates (3 MK4S, 2 XL) | 5 plates Queued |
| 2 | Staff | Starts all prints | 5 plates Printing |
| 3 | — | 3 MK4S plates finish | 3 Completed, 2 Printing |
| 4 | Student | Arrives, asks for the 3 finished pieces | — |
| 5 | Staff | **Cannot click "Print Complete"** (2 plates still printing) | Button disabled, hint: "2 plate(s) still printing" |
| 6 | Staff | Opens Payment Modal via "Partial Payment" button | Sees 3 checkboxes (only Completed plates shown) |
| 7 | Staff | Checks all 3, enters partial weight (e.g., 85g), transaction number | — |
| 8 | Staff | Confirms payment | 3 plates → `Picked Up`, Job still `Printing` |
| 9 | — | Next day, XL plates finish | 2 plates → `Completed` |
| 10 | Staff | Now "Print Complete" is enabled (3 Picked Up + 2 Completed = all done) | — |
| 11 | Staff | Marks complete | Status: `Completed` |
| 12 | Student | Returns for remaining 2 pieces | — |
| 13 | Staff | Records final payment (remaining weight) | Status: `Paid & Picked Up`, all 5 plates `Picked Up` |

**Key insight:** The completion gate counts `Picked Up` as "done" — a plate that's been picked up doesn't block completion.

**Data tracking — SOLUTION DOCUMENTED:**

> 📋 **See:** [`PowerApps/Future Improvements/5-Multi-Payment-Tracking-Enhancement.md`](../PowerApps/Future%20Improvements/5-Multi-Payment-Tracking-Enhancement.md)

Finance needs each transaction recorded separately while also seeing the total job cost. The solution uses a **`Payments` list** (same pattern as `BuildPlates`):

| Payment | Transaction # | Weight | Amount | Plates Picked Up | Date |
|---------|---------------|--------|--------|------------------|------|
| 1 | TXN-44821 | 85g | $8.50 | 1, 2, 3 | 3/15 |
| 2 | TXN-44890 | 62g | $6.20 | 4, 5 | 3/16 |
| **Total** | — | **147g** | **$14.70** | — | — |

**Key points:**
- Each payment = one row in `Payments` list
- `PrintRequests.FinalWeight` / `FinalCost` = running totals (summed from payments)
- Monthly Transaction Export queries `Payments` list (one row per actual transaction)
- Payment Modal shows payment history with "Paid so far" and "Remaining estimate"

---

### Edge Case 2: Print Failure Mid-Job — Scrap and Re-slice

**Scenario:** Staff started a 4-plate job. 2 plates completed successfully. The 3rd plate failed catastrophically (spaghetti). The 4th was using the same failed gcode and needs to be re-sliced along with plate 3.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | — | Job has 4 plates: 2 Completed, 2 Printing | — |
| 2 | — | Plate 3 fails mid-print | Physical failure, system still shows "Printing" |
| 3 | Staff | Opens Build Plates Modal | Sees 2 Completed, 2 Printing |
| 4 | Staff | Removes Plate 3 (failed) | Now 3 plates total |
| 5 | Staff | Removes Plate 4 (same bad gcode) | Now 2 plates total |
| 6 | Staff | Re-slices model, creates 3 new plates from corrected gcode | — |
| 7 | Staff | Adds 3 new plates in modal, updates Total to 5 | 2 Completed + 3 Queued |
| 8 | Staff | Prints new plates, marks done as they finish | Progress: 2/5 → 3/5 → 4/5 → 5/5 |
| 9 | Staff | Marks complete when all done | — |

**Key insight:** Plates can be removed at ANY status (including Completed) to support re-slicing. The system doesn't prevent removing completed work — staff judgment required.

**Risk:** Staff could accidentally remove completed plates. No undo. Consider adding confirmation dialog for removing non-Queued plates.

---

### Edge Case 3: Student Cancels After Partial Completion

**Scenario:** Student has a 6-plate job. 4 plates are done, 2 are printing. Student emails to cancel — they no longer need the project.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | — | Job: 4 Completed, 2 Printing | — |
| 2 | Student | Sends cancellation email | — |
| 3 | Staff | Sees email, needs to handle partial completion | — |
| 4 | Staff | **Option A:** Mark job Canceled, eat the material cost | Status: `Canceled`, plates orphaned |
| 5 | Staff | **Option B:** Contact student — they must pay for completed work | — |
| 6 | Staff | If student agrees to pay for 4 pieces: | — |
| 7 | Staff | Removes 2 printing plates (stop the prints) | 4 Completed, 0 Printing |
| 8 | Staff | Updates Total to 4 | — |
| 9 | Staff | "Print Complete" now enabled | — |
| 10 | Staff | Marks complete, records payment for 4 pieces | Status: `Paid & Picked Up` |
| 11 | — | Student picks up (or staff disposes if student declines) | — |

**Policy question:** What happens to completed prints when a job is canceled? Current system doesn't enforce payment for partial work.

**Possible states after cancellation:**
- `Canceled` with plates in mixed states (messy data)
- `Paid & Picked Up` for partial work (cleaner, but requires payment)
- Staff manually archives with notes explaining situation

---

### Edge Case 4: Printer Reassignment Mid-Print

**Scenario:** Staff set up a plate for MK4S, marked it Printing. Then realized the MK4S is broken and moved the job to the XL.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | Staff | Created plate: MK4S, Queued | — |
| 2 | Staff | Marked "▶ Printing" | Plate: MK4S, Printing |
| 3 | — | MK4S breaks down | Physical issue |
| 4 | Staff | Needs to reassign to XL | — |
| 5 | Staff | **Current system:** Cannot change Machine on existing plate | ❌ No edit capability |
| 6 | Staff | **Workaround:** Remove the MK4S plate, add new XL plate | — |
| 7 | Staff | Removes MK4S plate (even though marked Printing) | Plate deleted |
| 8 | Staff | Adds new XL plate, marks Printing | New plate: XL, Printing |

**Gap identified:** No way to edit a plate's Machine after creation. Workaround is delete + recreate, which loses the "Printing" status history.

**Possible enhancement:** Allow Machine edit on Queued/Printing plates (not Completed/Picked Up).

---

### Edge Case 5: Zero-Plate Legacy Job

**Scenario:** Job was approved BEFORE build plate tracking was implemented. It has no plates in the `BuildPlates` list. Staff tries to complete it.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | — | Old job exists: Status = `Printing`, TotalBuildPlates = 0 or null | No BuildPlates records |
| 2 | Staff | Clicks "Print Complete" | — |
| 3 | System | Completion gate check: `CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID))` returns 0 | — |
| 4 | System | Gate logic: "If no plates exist, allow completion (legacy behavior)" | Button enabled ✅ |
| 5 | Staff | Completes job normally | Status: `Completed` |
| 6 | System | ActualPrinter population: No plates to derive from | ActualPrinter stays blank or uses dropdown fallback |

**Key insight:** The completion gate has a fallback: jobs with zero plates bypass the gate entirely. This preserves backward compatibility.

**ActualPrinter handling for legacy jobs:**
- If no plates exist, Complete Modal shows **dropdown** (not read-only label)
- Staff manually selects the printer used
- This matches the Printer Verification Enhancement spec for "jobs without Build Plate Tracking"

---

### Edge Case 6: TotalBuildPlates Mismatch

**Scenario:** Staff set TotalBuildPlates = 5, but only created 3 plate records. Student sees "2/5 done" even though only 3 plates exist.

| Step | Actor | Action | System State |
|------|-------|--------|--------------|
| 1 | Staff | Sets Total = 5 in modal | TotalBuildPlates: 5 |
| 2 | Staff | Adds only 3 plates (got distracted, forgot 2) | BuildPlates: 3 records |
| 3 | Staff | Marks all 3 plates Completed | 3/5 done displayed |
| 4 | Staff | Tries to click "Print Complete" | — |
| 5 | System | Gate check: All existing plates are Completed | Button enabled (gate passes) |
| 6 | Staff | Completes job | Status: `Completed` |
| 7 | — | Job card showed "3/5 done" — misleading but not blocking | — |

**Key insight:** The completion gate checks actual plate records, not `TotalBuildPlates`. The mismatch causes confusing UI but doesn't break functionality.

**Why this happens:** `TotalBuildPlates` is set manually (staff types "5") but plate records are created one-by-one. If staff doesn't finish adding plates, the numbers diverge.

**Possible fix:** Add validation warning when `TotalBuildPlates ≠ CountRows(plates)` at completion time.

---

### Edge Case 7: Rapid Status Changes (Race Condition)

**Scenario:** Two staff members have the same job's Build Plates Modal open. Both try to update the same plate simultaneously.

| Step | Actor | Action | Result |
|------|-------|--------|--------|
| 1 | Staff A | Opens Build Plates Modal for REQ-00100 | Sees Plate 1: Queued |
| 2 | Staff B | Opens Build Plates Modal for REQ-00100 | Sees Plate 1: Queued |
| 3 | Staff A | Clicks "▶ Printing" on Plate 1 | Patches Plate 1 → Printing |
| 4 | Staff B | (Still sees Queued) Clicks "▶ Printing" on Plate 1 | Patches Plate 1 → Printing (no-op, already Printing) |
| 5 | Staff A | Clicks "✓ Done" on Plate 1 | Patches Plate 1 → Completed |
| 6 | Staff B | (Modal still shows Printing) Clicks "✓ Done" | Patches Plate 1 → Completed (no-op) |

**Outcome:** Last write wins, but since both are moving forward in the same direction, no data corruption occurs. The main issue is **stale UI** — Staff B's modal doesn't reflect Staff A's changes until they close/reopen.

**Mitigation:** After each Patch, the modal refreshes `colBuildPlates` from SharePoint. But if Staff B never clicks anything, their view stays stale.

**Possible enhancement:** Add refresh button to modal, or auto-refresh on a timer.

---

## Summary Table

| Scenario | Complexity | Risk Level | System Handles It? |
|----------|------------|------------|-------------------|
| Single plate job | Low | Low | ✅ Yes |
| Multi-plate same printer | Medium | Low | ✅ Yes |
| Multi-plate multi-printer | Medium | Low | ✅ Yes |
| Partial pickup | High | Medium | ✅ Yes (with partial payment flow) |
| Print failure / re-slice | High | Medium | ✅ Yes (via plate removal) |
| Cancellation after partial | High | High | ⚠️ Policy gap — no enforced handling |
| Printer reassignment | Medium | Low | ⚠️ Workaround needed (delete/recreate) |
| Legacy zero-plate jobs | Low | Low | ✅ Yes (fallback behavior) |
| TotalBuildPlates mismatch | Medium | Medium | ⚠️ Confusing UI, no validation |
| Concurrent edits | Medium | Low | ⚠️ Stale UI possible, no data corruption |

---

## Recommendations

1. ~~**Create `Payments` list**~~ → ✅ Documented in [Enhancement #5](../PowerApps/Future%20Improvements/5-Multi-Payment-Tracking-Enhancement.md)
2. **Add confirmation dialog** when removing non-Queued plates (prevents accidental deletion of completed work)
3. **Add validation warning** at completion if `TotalBuildPlates ≠ actual plate count`
4. **Allow Machine edit** on Queued/Printing plates (avoids delete/recreate workaround)
5. **Define cancellation policy** for jobs with completed plates
6. **Consider refresh mechanism** for Build Plates Modal to handle concurrent access

---

*Created: March 17, 2026*
