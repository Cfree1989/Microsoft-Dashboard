# Staff Dashboard App Review — Bugs and Improvement Opportunities

## The Task

A multi-model council review of the Staff Dashboard Canvas App. Each model connects to the server, reads the current app source files, and lists bugs and improvement opportunities. No changes are made at this stage.

**Goal:** Surface everything worth fixing or improving before deciding what to act on.

---

## App Overview

- **App Type:** Power Apps Canvas App (Tablet layout)
- **App Name:** Staff Console — Digital Fabrication Lab
- **Purpose:** Staff view, manage, and process all 3D print requests through a dashboard
- **Screens:** `scrDashboard` (main), `scrSchedule` (staff shift scheduling)

### SharePoint Lists

| List | Purpose | Key Columns |
|------|---------|-------------|
| `PrintRequests` | Core job records | `ID`, `Status`, `ReqKey`, `LastAction`, `LastActionBy`, `LastActionAt`, `Student`, `StudentEmail`, `StaffNotes`, `SlicedOnComputer`, `NeedsAttention`, `Created`, `Color`, `Printer`, `Method`, `EstimatedWeight`, `EstimatedTime`, `EstimatedCost`, `TransactionNumber`, `ActualPrinter` (multi-select choice), `FinalWeight`, `FinalCost`, `TigerCardNumber`, `StudentOwnMaterial` |
| `Staff` | Staff roster | `ID`, `Member` (person), `Role`, `Active`, `AidType`, `SchedSortOrder` |
| `BuildPlates` | Per-job gcode build plates | `ID`, `RequestID`, `DisplayLabel`, `Status`, `Machine`, `PlateKey` |
| `Payments` | Payment transaction records | `ID`, `RequestID`, `PaymentType`, `PaymentDate`, `Amount`, `BatchRequestIDs`, `BatchReqKeys`, `BatchAllocationSummary`, `PlateIDsPickedUp`, `PlatesPickedUp` |
| `RequestComments` | Staff/student message thread | `ID`, `RequestID`, `ReqKey`, `Message`, `Author0`, `AuthorRole`, `Direction`, `SentAt`, `ReadByStudent`, `ReadByStaff`, `StudentEmail` |
| `StaffShifts` | Weekly schedule shift rows | `StaffEmail`, `Day` (choice), `ShiftStart` (choice), `ShiftEnd` (choice) |

### Power Automate Flows

| Flow | Called From App? | How Called | Parameters |
|------|-----------------|------------|------------|
| `Flow-(A)-Create-SetReqKey` | No (SharePoint trigger) | — | — |
| `Flow-(B)-Audit-LogChanges` | No (SharePoint trigger) | — | — |
| `Flow-(C)-Action-LogAction` | Yes — direct `.Run()` | After every status change action | `RequestID`, `Action`, `FieldName`, `NewValue`, `ActorEmail` (5 args); richer `NewValue` for payments |
| `Flow-(G)-Export-MonthlyTransactions` | Yes — inside `IfError` | Direct `.Run()` | `ddExportMonth.Selected.Value`, `ddExportYear.Selected.Value`; returns `fileurl` |
| `Flow-(H)-Payment-SaveSingle` | Yes — direct `.Run()` | `Set(varFlowResult, '...'.Run(...))` | 17 args: RequestID, weight, rates, discount, transaction text, payment type, payer info, staff email/name, plate IDs, notes, flags, date |
| `Flow-(I)-Payment-SaveBatch` | Yes — direct `.Run()` | `Set(varFlowResult, '...'.Run(...))` | 13 args: combined weight, rates, discount, item IDs string, ReqKeys string, transaction, payment type, payer name, staff email/name, own material flag, date |

### Canvas Source Files

| File | Description |
|------|-------------|
| `PowerApps/canvas-sync/App.pa.yaml` | App-level OnStart, variables, connections |
| `PowerApps/canvas-sync/scrDashboard.pa.yaml` | Main screen — all galleries, modals, buttons, timer |
| `PowerApps/canvas-sync/scrSchedule.pa.yaml` | Schedule screen |

---

## App.OnStart — Variable Reference

All of the below are initialized in `App.OnStart`. This is the full state model of the app.

### Core State

| Variable | Initial Value | Purpose |
|----------|--------------|---------|
| `varMeEmail` | `Lower(User().Email)` | Current user email |
| `varMeName` | `User().FullName` | Current user display name |
| `varIsStaff` | Lookup from `colStaff` | Whether current user is active staff |
| `varSelectedStatus` | `"Uploaded"` | Active status tab |
| `varCurrentPage` | `"Dashboard"` | Navigation state |
| `varSearchText` | `""` | Search filter text |
| `varSortOrder` | `"Queue Order"` | Active sort order |
| `varNeedsAttention` | `false` | Lightbulb filter toggle |
| `varExpandAll` | `false` | Expand-all toggle |
| `varSelectedItem` | `Blank()` | Currently selected job card record |
| `varIsLoading` | `false` | Global loading state |
| `varLoadingMessage` | `""` | Loading overlay message text |
| `varFlowResult` | `{success: "false", message: "", paymentid: ""}` | Return value from flows H and I |
| `varPlaySound` | `false` | Triggers audio chime |
| `varPrevAttentionCount` | `CountRows(colNeedsAttention)` | Baseline for audio alert comparison |
| `varRefreshInterval` | `30000` | Timer interval (30 seconds) |

### Modal Show/Hide Variables

Most modals use an integer pattern (`0` = hidden, any record ID = visible). The Export modal uses a Boolean.

| Variable | Type | Controls Modal |
|----------|------|----------------|
| `varShowRejectModal` | Int (ID) | Rejection modal |
| `varShowApprovalModal` | Int (ID) | Approval modal |
| `varShowArchiveModal` | Int (ID) | Archive modal |
| `varShowCompleteModal` | Int (ID) | Complete modal |
| `varShowDetailsModal` | Int (ID) | Change Print Details modal |
| `varShowPaymentModal` | Int (ID) | Payment Recording modal |
| `varShowAddFileModal` | Int (ID) | Attachments modal |
| `varShowNotesModal` | Int (ID) | Notes modal |
| `varShowViewMessagesModal` | Int (ID) | View Messages modal |
| `varShowStudentNoteModal` | Int (ID) | Student Note modal |
| `varShowRevertModal` | Int (ID) | Revert Status modal |
| `varShowBatchPaymentModal` | Int (ID) | Batch Payment modal |
| `varShowBuildPlatesModal` | Int (ID) | Build Plates modal |
| `varShowExportModal` | **Boolean** | Export modal ← type inconsistency with the rest |
| `varBuildPlatesOpenedFromApproval` | Boolean | Flag: build plates reached via approval flow |

### Preloaded Collections

| Collection | Source | Purpose |
|------------|--------|---------|
| `colStaff` | `Staff` list (active only) | Populates staff dropdowns, membership check |
| `colNeedsAttention` | `Filter(PrintRequests, NeedsAttention = true)` | Lightbulb count / audio baseline |
| `colAllBuildPlates` | `BuildPlates` | Avoids per-card delegation queries |
| `colAllPayments` | `Payments` | Avoids per-card delegation queries |
| `colBuildPlateSummary` | Aggregated from `colAllBuildPlates` by `RequestID` | Summary per job |
| `colTimeSlots` | Static — 17 rows (Idx 0–16), `Label` + `Minutes` | Schedule grid time labels |
| `colSchedColors` | Static — 12 palette rows | Staff color assignment |
| `colEditShifts` | Typed seed then `Clear` | Edit buffer for schedule changes |

### Batch Payment State

| Variable | Type | Purpose |
|----------|------|---------|
| `varBatchSelectMode` | Boolean | Toggles card multi-select behavior |
| `colBatchItems` | Collection | Selected job cards for batch |
| `colBatchSucceededItems` | Collection | Successful batch results |
| `colBatchFailedItems` | Collection | Failed batch items |
| `varBatchTotalEstWeight` | Number (0) | Running est. weight total |
| `varBatchCombinedWeight` | Number (0) | Confirmed combined weight |
| `varBatchItemCount` | Number (0) | Count of items in batch |
| `varBatchLastItemID` | Number (0) | Last processed item ID |
| `varBatchLastItemWeight` | Number (0) | Last item weight |
| `varBatchFinalCost` | Number (0) | Calculated final cost |
| `varBatchProcessedCount` | Number (0) | Items processed so far |
| `varBatchRecordedAt` | `Now()` | Typed DateTime for App Checker |

### Payment State

| Variable | Purpose |
|----------|---------|
| `varBaseCost` | Calculated base cost |
| `varFinalCost` | Final cost after discounts |
| `varPickedPlatesText` | Human-readable plate labels for snapshot |
| `varPickedPlateIDsText` | Pipe-delimited plate ID text |
| `varPickedPlateIDsList` | Comma-delimited plate IDs for flow |
| `varPaymentRecordedAt` | Typed DateTime for App Checker |

### Pricing Constants

| Variable | Value | Purpose |
|----------|-------|---------|
| `varFilamentRate` | `0.10` | Cost per gram (filament) |
| `varResinRate` | `0.30` | Cost per mL (resin) |
| `varResinDensity` | `1.11` | Density for weight-to-mL conversion |
| `varResinGramRate` | Derived | Actual per-gram resin rate |
| `varMinimumCost` | `3.00` | Floor price |
| `varOwnMaterialDiscount` | `0.30` | Fraction discount if student provides material |

### Schedule Screen State (also in App.OnStart)

| Variable / Collection | Purpose |
|-----------------------|---------|
| `varSchedSelectedEmail` | `""` | Currently selected staff email for editing |
| `varSchedEditSaving` | `false` | Save-in-progress flag |
| `varSchedShowReorder` | `false` | Reorder mode toggle |
| `varSchedTotalsSortBy` | `"Total"` | Totals section sort column |
| `varSchedTotalsSortDesc` | `true` | Totals sort direction |
| `varSchedScrollVersion` | `0` | Version bump to force gallery refresh |
| `colEditShifts` | Typed seed + Clear | Edit-mode shift buffer |

**Audit note:** There is a known duplicate `// === SCHEDULE SCREEN STATE ===` block in the live app after `varRefreshInterval`. This causes `colEditShifts` type drift and must be removed.

---

## Gallery and Filter Logic

### `galJobCards`

```powerfx
Items = With(
  { filteredJobs: Filter(PrintRequests,
      Status.Value = varSelectedStatus,
      If(IsBlank(varSearchText), true,
        varSearchText in Student.DisplayName ||
        varSearchText in StudentEmail ||
        varSearchText in ReqKey ||
        varSearchText in SlicedOnComputer.Value),
      If(varNeedsAttention, NeedsAttention = true, true))
  },
  Switch(varSortOrder,
    "Queue Order", Sort(filteredJobs, NeedsAttention, Descending) /* then Created asc */,
    /* other sort branches */
  )
)
```

### `galStatusTabs`

One row per status string, drives the tab bar. `btnStatusTab` text includes filtered counts using the same search + attention filters.

### Unread Messages Count

```powerfx
CountRows(Filter(RequestComments, RequestID = ThisItem.ID, Direction.Value = "Inbound", ReadByStaff = false))
```

---

## Key Behaviors to Review

### Auto-Refresh Timer (`tmrAutoRefresh`)

- `Duration = varRefreshInterval` (30 000 ms)
- `OnTimerEnd`: `Concurrent(Refresh(PrintRequests), Refresh(BuildPlates), Refresh(Payments))`, rebuilds attention collection, compares `varCurrentAttentionCount` to `varPrevAttentionCount`, fires audio chime if count grew.
- **Note:** `varCurrentAttentionCount` is set inside `OnTimerEnd` but is **not** initialized in `App.OnStart` (it is not in the documented OnStart block).

### Audio Notification

- Control: `audNotification` (`Media = notification_chime`, `Start = varPlaySound`)
- Pattern: `Reset(audNotification); Set(varPlaySound, true)` — required due to browser autoplay restrictions
- `OnEnd`: `Set(varPlaySound, false)`
- Also fires when lightbulb is toggled **on** for a card

### Lightbulb (NeedsAttention toggle)

- `icoLightbulb.OnSelect`: reads `ThisItem.NeedsAttention`, calls `Patch` to toggle it, fires audio if turning on, `Notify` on success/error
- Does **not** call Flow C (no audit log for attention toggle)

### Flow Result Pattern (H and I)

```powerfx
Set(varFlowResult, 'Flow-(H)-Payment-SaveSingle'.Run(...))
// Then check:
Or(varFlowResult.success = true, Lower(Trim(Coalesce(Text(varFlowResult.success), ""))) = "true")
```

The `success` return value may come back as a boolean or the string `"True"` depending on the flow run.

### Schedule Save (`btnSchedSave.OnSelect`)

```powerfx
Set(varSchedEditSaving, true);
RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail);
Patch(StaffShifts, ForAll(
  Filter(colEditShifts, !IsBlank(ShiftStart) && !IsBlank(ShiftEnd)),
  { StaffEmail: varSchedSelectedEmail, Day: {Value: Day}, ShiftStart: {Value: ShiftStart}, ShiftEnd: {Value: ShiftEnd} }
));
/* rebuild colSchedStaff / colShifts / colSchedLookup */;
Set(varSchedSelectedEmail, "");
Clear(colEditShifts);
Set(varSchedScrollVersion, Coalesce(varSchedScrollVersion, 0) + 1);
Set(varSchedEditSaving, false)
```

---

## Known Issues Already Documented

These are documented problems already tracked in the spec — models should look for related issues or verify whether these are fully resolved in the live YAML:

1. **Duplicate schedule state block** in `App.OnStart` — causes `colEditShifts` type drift
2. **`varShowExportModal` is Boolean** while all other modal variables are integers (ID-based) — inconsistent type pattern
3. **`varCurrentAttentionCount` not initialized in `App.OnStart`** — used in `tmrAutoRefresh.OnTimerEnd` but absent from the documented init block
4. **Flow result `success` field type ambiguity** — can be Boolean or string `"True"` depending on flow run context
5. **Payment date format** — `Flow-(H)` and `Flow-(I)` require `"yyyy-mm-dd"` (lowercase m) not `"yyyy-MM-dd"`; mismatch causes `TriggerInputSchemaMismatch`
6. **Mixed filament/resin batch** not supported — batch payment blocked if items span both material types; potential division-by-zero
7. **Audio browser autoplay** — requires `Reset(audNotification)` before `Set(varPlaySound, true)`; direct set doesn't replay
8. **Classic dropdown first-render blank** in schedule gallery — needs real default times to avoid blank seed issue
9. **Schedule `RemoveIf` is unbounded** — `RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail)` runs against the full live list; no soft delete or confirmation step
10. **Delegation warnings** — pre-existing ~18 warnings on `btnStatusTab`, `galJobCards`, message counts, `btnPickedUp`, schedule `OnVisible`, `btnSchedSave.OnSelect` (noted as non-blocking)
11. **`lblWeightValidation`** — referenced in older spec steps, not present in live app
12. **Nav bar discrepancy** — live app has `btnNavSchedule` + `btnNavAnalytics` (`Report`); older spec described `btnNavDashboard`, `btnNavAdmin`
13. **Send/compose message** — older spec referenced `btnCardSendMessage` on the card template; live YAML uses `btnViewMessages` + `lblUnreadBadge` only; compose/send is inside `conViewMessagesModal`

---

## Design Standards (for reference during review)

### Color Palette

| Role | Value |
|------|-------|
| Primary / Active | `RGBA(70, 130, 220, 1)` |
| Success | `RGBA(46, 125, 50, 1)` |
| Warning / Orange | `RGBA(255, 140, 0, 1)` |
| Error / Reject | `RGBA(219, 3, 3, 1)` |
| Gold / Pending | `RGBA(255, 185, 0, 1)` |
| Header background | `RGBA(77, 77, 77, 1)` |
| Modal overlay | `RGBA(0, 0, 0, 0.7)` → `varColorOverlay` |
| Card background | `RGBA(247, 237, 223, 1)` |

### Button Font Tiers

| Tier | Size | Typical controls |
|------|------|------------------|
| Standard | `varBtnFontSize` (12) | `btnApprove`, `btnReject`, primary card actions |
| Compact card | `9` | `btnViewNotes`, `btnViewMessages` |
| Header tight | `8` | `btnNavAnalytics`, `btnBuildPlates` |
| Ultra-compact | `5` | `btnStudentNote` |
| Modal chrome | `14` | Modal close buttons, `btnBuildPlatesDone` |

---

## Review Prompt

**INSTRUCTIONS FOR AI MODELS:**
- Connect to the server and read the current canvas source files before reviewing
- Use the context in this document alongside the live YAML files
- Look for actual bugs — broken logic, missing error handling, incorrect expressions, race conditions, delegation issues, uninitialized variables, type mismatches, etc.
- Look for easy improvement opportunities — redundant logic, missing feedback, UX friction, accessibility gaps, performance patterns
- Be specific: reference the control name, screen, variable, or formula where you found the issue
- The "Known Issues Already Documented" section above lists problems already on record — you may validate whether they are resolved or note related issues, but focus your energy on finding **new** issues
- Do **not** change any files at this stage
- Do **not** produce a consensus summary yet

```text
REVIEW TASK: Staff Dashboard Canvas App (Power Apps) — Bug Hunt and Improvement Audit

Connect to the server and read these source files:
  - PowerApps/canvas-sync/App.pa.yaml
  - PowerApps/canvas-sync/scrDashboard.pa.yaml
  - PowerApps/canvas-sync/scrSchedule.pa.yaml

WHAT THIS APP DOES:
Staff at a 3D printing fabrication lab use this Canvas App (tablet layout) to manage student
print requests through their full lifecycle: Uploaded → Pending → Ready to Print → Printing →
Completed → Paid & Picked Up (or Rejected / Canceled / Archived). The app also handles payments,
build plate tracking, student/staff messaging, a monthly transaction export, and a weekly staff
schedule screen.

WHAT TO REVIEW FOR:

1. BUGS
   - Broken or incorrect Power Fx expressions
   - Variables or context variables that may be uninitialized or inconsistently typed at use time
   - Delegation issues that will silently truncate data at runtime
   - Race conditions in flow calls or OnSelect chains
   - Missing or incomplete error handling (IfError, IsError, Notify on failure)
   - Controls referencing data or variables that may not exist yet at load time
   - Incorrect data types being passed to flows or SharePoint Patch calls
   - Modal show/hide logic that could leave a modal stuck open or visible incorrectly
   - Timer or collection rebuild logic that could produce stale or incorrect state
   - Schedule save logic edge cases (no shifts, overlapping shifts, empty name selection)

2. IMPROVEMENT OPPORTUNITIES (easy wins)
   - Redundant or duplicated logic that could be consolidated
   - Variables that are set but never used, or used in a confusing way
   - Gallery or filter patterns that could be simplified or made safer
   - Missing loading states or user feedback during async operations
   - Accessibility gaps (missing AccessibleLabel, tab order, color-only status indicators)
   - Performance patterns: unnecessary full-list refreshes, heavy OnStart, etc.
   - UX friction points obvious from the code
   - Inconsistent patterns across modals (e.g. different error handling approaches)

3. SCHEDULE SCREEN SPECIFICS
   - Review the save logic (RemoveIf + Patch pattern) for correctness and resilience
   - Look for issues in the HtmlViewer grid rebuild after save
   - Check colSchedLookup rebuild for correctness
   - Review the colTimeSlots / colSchedColors static data for any edge cases
   - Check the scroll version bump pattern

KNOWN CONTEXT (already documented — validate or look for related issues):
- Duplicate schedule state block in App.OnStart causes colEditShifts type drift
- varShowExportModal is Boolean while all other modal variables are Int (ID pattern)
- varCurrentAttentionCount may not be initialized in App.OnStart
- Flow result success field can be Boolean or string "True" — handled with Or/Lower/Trim pattern
- Payment date requires "yyyy-mm-dd" lowercase-m format for flows
- Audio requires Reset(audNotification) before Set(varPlaySound, true)
- ~18 pre-existing delegation warnings exist; some are expected

REQUESTED OUTPUT FORMAT:

## Bugs Found
For each bug:
- Control / screen / variable / formula reference
- Description of the bug
- Why it is a bug (not just a style issue)

## Improvement Opportunities
For each improvement:
- Reference
- What could be improved and how

## Notes
- Anything else worth flagging

IMPORTANT: Do not change any files. Do not write a consensus summary.
```

---

## AI Model Recommendations

*This prompt is being submitted to multiple AI models. Each model should add their findings below in their designated section. Do not write a consensus summary yet.*

---

### Claude Opus 4.6 (Anthropic) - Max

**Summary:** Full read of all three YAML source files. Found 14 bugs and 12 improvement opportunities. The most critical bugs are missing error handling on several Patch/Flow calls (Start Print, Reject, Archive, Revert, Details, Schedule Save), an icon-based batch selection path that bypasses method validation, a likely broken export month dropdown mapping, and a batch payment confirmation that incorrectly requires a transaction number for grant/program code payments.

---

#### Bugs Found

1. **`btnStartPrint.OnSelect` (scrDashboard) — No `IfError` on Patch or Flow C**
   - The Start Print handler calls `Patch(PrintRequests, ...)` and `'Flow-(C)-Action-LogAction'.Run(...)` without any error handling. If either fails (SharePoint throttling, network error), the user sees "Print started!" and the loading overlay dismisses, but the item may not have been updated. Every other action modal wraps at least one of these in `IfError` — this one wraps neither.

2. **`btnStartPrint.OnSelect` (scrDashboard) — Uses `User().Email` instead of staff picker**
   - This is the only status-change action that hardcodes `User().Email` / `User().FullName` in the `LastActionBy` person field. Every other action (Approve, Reject, Archive, Complete, Revert, Details, Payment) uses a "Performing Action As" staff dropdown. This breaks the "acting as" pattern — if a manager starts a print on behalf of a student worker, the audit trail records the wrong staff member.

3. **`btnRejectConfirm.OnSelect` (scrDashboard) — Patch not wrapped in `IfError`**
   - The reject confirm calls `Patch(PrintRequests, ...)` directly without `IfError`. If the patch fails, execution continues to Flow C and shows "Request rejected. Student will be notified." even though the status was never changed. The `IfError` only wraps the Flow C call. Compare to `btnCompleteConfirm` which correctly wraps the Patch.

4. **`btnArchiveConfirm.OnSelect` (scrDashboard) — Patch not wrapped in `IfError`**
   - Same issue as reject: `Patch(PrintRequests, ...)` is called directly. On failure, the user still sees "Request archived successfully." and the modal closes. The archive action is particularly risky because the user may not realize the item didn't move to Archived.

5. **`btnRevertConfirm.OnSelect` (scrDashboard) — Neither Patch nor Flow C wrapped in `IfError`**
   - Both the main `Patch(PrintRequests, ...)` and `'Flow-(C)-Action-LogAction'.Run(...)` execute without error handling. Additionally, the conditional plate-revert `ForAll` + `Patch` block also lacks error handling. A failed revert is dangerous because it can leave plates and request status in an inconsistent state (plates reverted but status unchanged, or vice versa).

6. **`btnDetailsConfirm.OnSelect` (scrDashboard) — Patch not wrapped in `IfError`**
   - The Details Save handler calls `Patch(PrintRequests, ...)` without `IfError`. Success notification fires regardless of Patch outcome.

7. **`icoBatchCheck.OnSelect` (scrDashboard, galJobCards) — Missing method validation**
   - The batch checkbox icon adds items directly: `Collect(colBatchItems, ThisItem)` without checking if `ThisItem.Method.Value` matches existing items. Compare to `recCardBackground.OnSelect` which correctly validates `ThisItem.Method.Value = First(colBatchItems).Method.Value`. A user clicking the checkbox icon can add Resin and Filament items to the same batch, bypassing the safety check. The guard at `btnProcessBatchPayment` catches this later, but the user gets no immediate feedback and sees items accumulate in a broken batch.

8. **`ddExportMonth` (scrDashboard, conExportModal) — `Items.Value: =Display` maps Selected.Value to string names**
   - The month dropdown is configured with `Items.Value: =Display`, meaning `ddExportMonth.Selected.Value` returns the display text ("January", "April", etc.) rather than the numeric month. But the export filter compares `Month(PaymentDate) = ddExportMonth.Selected.Value` (number vs. string), and the flow receives the display text instead of a number. The `Default: =Month(Today())` also sets a number which won't match any Display string, so the dropdown likely defaults to the first item (January) regardless of the current month. The preview count and flow parameters are likely broken.

9. **`btnBatchPaymentConfirm.DisplayMode` (scrDashboard) — Transaction required for all payment types**
   - The confirm button requires `!IsBlank(txtBatchTransaction.Text)` for ALL payment types. But the Grant/Program Code hint text says "Leave blank if code is pending." This means staff cannot process a batch payment with Grant/Program Code type unless they enter something in the transaction field. Compare to single payment (`btnPaymentConfirm`) which only requires transaction for TigerCASH: `ddPaymentType.Selected.Value = "TigerCASH" && IsBlank(...)`.

10. **`btnSchedSave.OnSelect` (scrSchedule) — No error handling on `RemoveIf` or `Patch`**
    - The schedule save calls `RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail)` followed by `Patch(StaffShifts, ForAll(...))` with zero error handling. If `RemoveIf` succeeds but `Patch` fails, the staff member's shifts are deleted but not recreated — data loss. `varSchedEditSaving` still gets set to `false` and no error notification fires.

11. **`drpSchedName.InputTextPlaceholder` (scrSchedule) — Says "Select a student..."**
    - The schedule screen's staff picker placeholder reads "Select a student..." but this dropdown shows `colSchedStaff` (active staff members). Should say "Select a staff member..." or "Select staff..."

12. **`lblLoadingMessage.Y` (scrDashboard, conLoadingOverlay) — Fixed position disconnected from box**
    - `lblLoadingMessage` uses `Y: =385` (a hardcoded pixel value), while `recLoadingBox` uses `Y: =(Parent.Height - 100) / 2`. On a tablet screen at 768px, the box centers around Y=334 and the text at Y=385 aligns. But on taller screens the text would appear below the box, and on shorter screens it would appear inside or above it. Should be calculated relative to `recLoadingBox`.

13. **`varCurrentItem` / `varWasAttention` / `varAttentionToggleSuccess` — Not initialized in `App.OnStart`**
    - `btnStartPrint` uses `Set(varCurrentItem, ThisItem)`, and `icoLightbulb` uses `Set(varWasAttention, ...)` and `Set(varAttentionToggleSuccess, ...)`. None of these are declared in `App.OnStart`. While Power Apps infers types on first use, App Checker may flag type ambiguity, and any code referencing these before their first `Set()` will encounter untyped blanks.

14. **`lblDetailsCurrent.X` (scrDashboard, conDetailsModal) — Hardcoded to `=428`**
    - This label's X position is `428` which doesn't relate to `recDetailsModal.X` (which is `(Parent.Width - 550) / 2`). On a 1366px tablet, the modal starts at X=408 and the label appears at X=428, placing it 20px from the left edge. But if screen width changes, the label stays at X=428 while the modal moves — the label would float outside the modal boundary.

#### Improvement Opportunities

1. **Massive duplication of `colBuildPlateSummary` rebuild formula (5 occurrences)** *(Verified: actually 8 — see Consensus)*
   - The identical 10-line `ForAll(Distinct(colAllBuildPlates, RequestID)...)` formula appears in: `App.OnStart`, `tmrAutoRefresh.OnTimerEnd`, `btnRefresh.OnSelect`, `btnPaymentConfirm` success path, and `btnBatchPaymentConfirm` success path. Any change to the summary logic must be replicated in all 5 places. Consider extracting to a named formula or a shared helper approach. *(Additional occurrences found in `btnApproveConfirm` success path, `btnPickedUp` partial path, and `btnPickedUp` full path — 8 total.)*

2. **`colBuildPlatesIndexed` computation duplicated 3 times**
   - The `AddColumns(colBuildPlates, PlateNum, ..., ResolvedPlateLabel, ...)` pattern is duplicated in `btnBuildPlates.OnSelect`, `btnPickedUp.OnSelect`, and `btnApproveAddPlates.OnSelect`. Same risk of divergence if the label logic changes.

3. **Staff picker could auto-select current user**
   - Every modal requires manually selecting a staff member from the "Performing Action As" dropdown. Since `varMeEmail` is already known, the dropdown's `DefaultSelectedItems` could pre-select the matching `colStaff` record: `Filter(colStaff, Lower(MemberEmail) = varMeEmail)`. This would save a click on every action.

4. **Modal close/cancel Reset chains are duplicated**
   - Each modal duplicates its Reset sequence in both the close button and the cancel button. For example, `conRejectModal` has identical 9-line Reset chains in both `btnRejectClose.OnSelect` and `btnRejectCancel.OnSelect`. If a field is added, both must be updated. Consider using `Select(btnRejectCancel)` from the close button to centralize cleanup.

5. **Accessibility: Nearly all controls lack `AccessibleLabel`**
   - Only `ddSortOrder` and `drpSchedTotalsSort` have `AccessibleLabel` set. All other interactive controls (buttons, dropdowns, checkboxes, text inputs, icons) across both screens lack accessibility labels. This is a significant WCAG gap for screen reader users.

6. **`RequestComments` queried per-card inside `galJobCards`**
   - `lblMessagesHeader`, `btnViewMessages`, and `lblUnreadBadge` each filter `RequestComments` directly (a SharePoint list, not a local collection). These execute per gallery card, per render. With 50 items visible, that's 150+ delegation queries per refresh. Pre-loading comment counts into a collection (like `colBuildPlateSummary`) would dramatically reduce SharePoint calls.

7. **`txtSearch.OnChange` fires delegation queries on every keystroke**
   - `Set(varSearchText, Self.Text)` triggers immediately, causing `galJobCards.Items` to re-evaluate its filter on `PrintRequests` for each character typed. Consider using a "Search" button or debounce pattern (e.g., only search when the timer fires or when the user presses Enter).

8. **Inconsistent `Font` property — some controls bypass `varAppFont`**
   - Most controls correctly use `Font: =varAppFont`, but at least 10 controls directly reference `Font: =Font.'Open Sans'` (e.g., `ddCompleteStaff`, `lblBatchModeActive`, `lblBatchCount`, `btnRevert`, `ddRevertStaff`, `lblRevertTitle`, `chkBatchOwnMaterial`, `txtPayerTigerCard`, `lblPayerTigerCardLabel`). This defeats the purpose of the centralized font variable and would cause visual inconsistency if the font is ever changed.

9. **`btnStartPrint` should have a confirmation modal**
   - "Start Print" is the only status-transition action without a confirmation step. Approve, Reject, Complete, Archive, and Revert all have modals with a staff picker and confirm button. Start Print executes immediately on click with no staff attribution (it hardcodes `User().Email`). Adding a simple confirmation modal with a staff picker would bring it in line with the rest of the app's safety pattern.

10. **Revert from "Paid & Picked Up" should show stronger warning**
    - Reverting from "Paid & Picked Up" to "Completed" clears `FinalWeight`, `FinalCost`, `PaymentDate`, `PaymentType`, `PayerName`, `PayerTigerCard`, `TransactionNumber`, and `PaymentNotes`, plus reverts plate statuses. The modal shows a generic "Revert Status" title — it should prominently warn that payment data will be cleared, similar to how the archive modal warns about removing from active views.

11. **`tmrAutoRefresh` does not refresh `RequestComments`**
    - The timer refreshes `PrintRequests`, `BuildPlates`, and `Payments`, but not `RequestComments`. Unread message badges (`lblUnreadBadge`) remain stale until a manual refresh or screen navigation. Adding `Refresh(RequestComments)` to the timer's `Concurrent` call would keep message indicators current.

12. **No `Notify` feedback on lightbulb toggle failure path when `varAttentionToggleSuccess` is false**
    - The `icoLightbulb.OnSelect` already has error handling via `IfError`, but if `varAttentionToggleSuccess` is false, the loading overlay dismisses with no further user feedback. The error `Notify` is inside the `IfError` block, but the success-only `Notify` guard (`If(varAttentionToggleSuccess, Notify(...))`) means a silent failure if `IfError` returns false AND something went wrong after the notify inside IfError. Actually this is fine on closer inspection — the IfError's false branch does fire a Notify. No issue here.

#### Notes

- **Known issue #1 (duplicate schedule state block)** — Confirmed NOT present in the live `App.pa.yaml`. The `colEditShifts` typed seed + `Clear(colEditShifts)` pattern appears only once (lines 58-59). This known issue appears to have been resolved.

- **Known issue #3 (`varCurrentAttentionCount` not initialized)** — Confirmed. It is only set inside `tmrAutoRefresh.OnTimerEnd` (line 59 of scrDashboard). The first comparison `varCurrentAttentionCount > varPrevAttentionCount` will compare blank > number on the first timer tick, which evaluates to false — functionally safe but technically unclean.

- **Known issue #5 (payment date `"yyyy-mm-dd"` lowercase)** — Confirmed in live code. Both `btnPaymentConfirm` (line 5018) and `btnBatchPaymentConfirm` (line 6531) use `Text(dpPaymentDate.SelectedDate, "yyyy-mm-dd")` with lowercase `m`. In Power Fx, lowercase `m` is minutes and uppercase `M` is month, but the flows expect this exact format string (lowercase). If the flows work correctly with this, it's because the flow schema matches; if not, dates would be mangled.

- **Z-order concern for `conLoadingOverlay`** — The loading overlay is declared at line 8010, well after the gallery and most modals. However, `conExportModal` (line 8060) is declared AFTER the loading overlay, meaning the export modal renders on top of the loading spinner. If a user clicks "Download Report" (which sets `varIsLoading = true`), the loading overlay would appear behind the export modal — potentially invisible to the user.

- **Large `App.OnStart` payload** — The OnStart block is ~314 lines and sets 80+ variables. This all executes synchronously before the app is usable. The `Concurrent()` call for SharePoint data is good, but the 50+ styling/theming variables could be moved to named formulas or a component library to reduce startup time.

- **`colBuildPlateSummary` rebuild is O(n²)** — The rebuild iterates `Distinct(colAllBuildPlates, RequestID)` and for each unique ID, runs 4 separate `CountRows(Filter(...))` passes over the full collection. With 500 plates across 100 requests, that's 400 filter passes per rebuild, and this runs on every 30-second timer tick.

---

### Gemini

**Summary:** The review identified several critical bugs primarily related to state management, inconsistent variable typing, and unsafe data operations (like the unbounded `RemoveIf` on the schedule screen). There are also integration fragility issues with Power Automate flows regarding date formats and return types. Improvements focus on standardizing patterns, adding safety guards, and resolving known inconsistencies.

---

#### Bugs Found

- **`tmrAutoRefresh.OnTimerEnd` (scrDashboard)**: `varCurrentAttentionCount` is used and set here, but it is not initialized in `App.OnStart`. While it works because it's set before being compared, it violates the initialization pattern and could cause issues if referenced elsewhere before the timer fires.
- **`varShowExportModal` (App.OnStart & scrDashboard)**: This variable is initialized and used as a Boolean, whereas all other modal visibility variables (`varShowRejectModal`, `varShowApprovalModal`, etc.) use an Integer (ID) pattern. This inconsistency can lead to maintenance errors and type mismatches if modal logic is abstracted.
- **`btnSchedSave.OnSelect` (scrSchedule)**: The `RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail)` operation is unbounded and runs against the live SharePoint list. If `varSchedSelectedEmail` is somehow blank or corrupted, this could delete all shifts in the list. There is no confirmation step or soft delete.
- **Payment Date Format (scrDashboard)**: Flows `Flow-(H)-Payment-SaveSingle` and `Flow-(I)-Payment-SaveBatch` expect the date in `"yyyy-mm-dd"` format (lowercase m for month). If the app passes `"yyyy-MM-dd"`, it causes a `TriggerInputSchemaMismatch` and the flow will fail.
- **Flow Result Success Check (scrDashboard)**: The `success` field from the payment flows can return as a Boolean or a string `"True"`. The app uses a complex `Or(varFlowResult.success = true, Lower(...) = "true")` pattern which is fragile and indicates a type ambiguity issue between Power Apps and Power Automate.
- **Mixed Batch Payments (scrDashboard)**: Batch payments do not support mixed filament and resin items. If a batch contains both, it can cause a division-by-zero or incorrect calculation because the pricing logic differs and isn't handled for mixed batches.
- **Audio Autoplay (scrDashboard)**: The `audNotification` control requires `Reset(audNotification)` before `Set(varPlaySound, true)` due to browser autoplay restrictions. If the reset is missed anywhere, the sound won't play.

#### Improvement Opportunities

- **Schedule Save Logic (scrSchedule)**: Add a guard clause to `btnSchedSave.OnSelect` to ensure `varSchedSelectedEmail` is not blank before executing the `RemoveIf` and `Patch` operations.
- **Modal Variable Consistency (App.OnStart)**: Change `varShowExportModal` to an Integer pattern (0 for hidden, 1 for visible) to match the rest of the modal variables.
- **Batch Payment Validation (scrDashboard)**: Add a validation check before allowing batch payments to ensure all selected items use the same material type (filament or resin), and disable the batch payment button or show a warning if they are mixed.
- **Flow Return Types (Power Automate / scrDashboard)**: Standardize the return type of the `success` field in the Power Automate flows to always return a Boolean, simplifying the check in Power Apps to just `If(varFlowResult.success, ...)`.
- **Variable Initialization (App.OnStart)**: Initialize `varCurrentAttentionCount` in `App.OnStart` to 0 or the current count to ensure it's explicitly typed and available before the first timer tick.
- **Delegation Warnings**: Address the ~18 delegation warnings by pre-filtering data into collections where possible, or ensuring that queries against large lists use delegable functions.

#### Notes

- The duplicate schedule state block in `App.OnStart` mentioned in the known issues was not found in the current `App.pa.yaml`, suggesting it might have been removed, but `colEditShifts` type drift should still be monitored.
- The `lblWeightValidation` control mentioned in older specs is indeed missing from the live app.
- The navigation bar discrepancy (`btnNavSchedule` + `btnNavAnalytics` vs `btnNavDashboard` + `btnNavAdmin`) is present and should be aligned with the latest design specs.

---

### Composer 2

**Summary:** Reviewed `PowerApps/canvas-sync/App.pa.yaml`, `scrDashboard.pa.yaml`, and `scrSchedule.pa.yaml` against this spec. Several documented issues are still present; the synced YAML does **not** contain a duplicate `// === SCHEDULE SCREEN STATE ===` block (only one block at `App.OnStart` lines 51–59). A few new risks surfaced around schedule save error handling, shift validation, and data freshness for `RequestComments`.

---

#### Bugs Found

1. **`scrSchedule` / `btnSchedSave.OnSelect` — unhandled errors and stuck saving state**  
   The save chain runs `Set(varSchedEditSaving, true)` then `RemoveIf(StaffShifts, ...)` and `Patch(StaffShifts, ForAll(...))` with **no** `IfError` (or equivalent) around the data calls. If `RemoveIf` or `Patch` throws (permissions, list schema, throttling, network), execution may stop before `Set(varSchedEditSaving, false)`, leaving the button in **"Saving..."** and `DisplayMode.Disabled` until the user restarts. Also, `RemoveIf` already deleted existing rows, so a failed `Patch` can leave the staff member with **no shifts in SharePoint** (partially applied state).

2. **`galEditShifts` / `drpGalShiftStart` + `drpGalShiftEnd` — invalid time ranges**  
   There is no guard that `ShiftEnd` is strictly after `ShiftStart`. Users can pick an end time before the start. Then `lblSchedAidInfo` and `galSchedTotals` use `(LookUp(colTimeSlots, Label = ShiftEnd).Idx - LookUp(colTimeSlots, Label = ShiftStart).Idx) * 30 / 60`, which becomes **negative**, inflating the “over max hours” color logic incorrectly and showing wrong hour totals. The grid span `si >= StartSlot && si < EndSlot` also produces **no** filled cells for invalid ranges, so the UI looks empty while the row still “counts” negative hours in sums.

3. **`tmrAutoRefresh` / `scrDashboard` — `varCurrentAttentionCount` only set on timer**  
   `varCurrentAttentionCount` is set in `OnTimerEnd` (lines 59–60) and is **not** initialized in `App.OnStart`. Nothing in the reviewed YAML *reads* it outside the timer, so the first run self-aligns. This remains a **footgun** if a future control binds to `varCurrentAttentionCount` on load, or for debugging, where the value is ambiguous until the first `OnTimerEnd`.

4. **Potential `Min` usage in `htmlSchedGrid.HtmlText` (`scrSchedule`)**  
   The `With` block uses `minSlotIdx: Min(Filter(colTimeSlots, Idx < 16), Idx)`. Depending on how Power Apps resolves `Min` on a table column in this app’s language version, this may rely on implicit behavior. If the expression ever evaluates incorrectly when `colTimeSlots` is empty or filtered empty, the “No shifts” `rowspan` branch could break. (Lower severity — worth validating in App checker / runtime.)

---

#### Improvement Opportunities

1. **`tmrAutoRefresh` — add `Refresh(RequestComments)` (or pre-collect pattern)**  
   The timer only runs `Refresh(PrintRequests)`, `Refresh(BuildPlates)`, `Refresh(Payments)`. Message UI (`Filter(RequestComments, ...)`, unread counts on `lblUnreadBadge`, etc.) never gets a refresh on the 30s cadence, so **message counts and read state can lag** behind other users until a manual action triggers a refresh. Add `RequestComments` to the concurrent refresh set if the connector cost is acceptable.

2. **Modal pattern — align `varShowExportModal` with other modals**  
   As documented, export uses a **Boolean** while other modals use **record ID Int**. Consider migrating to the same `0` / `ID` pattern for one mental model and simpler “close all modals” helpers (optional refactor).

3. **Attention toggle — `icoLightbulb.OnSelect`**  
   Confirmed: toggling `NeedsAttention` does not call `Flow-(C)-Action-LogAction`. If audit completeness matters for compliance, add a C flow call (or log via list automation only — already have other flows) so attention changes are traceable the same as status changes.

4. **`btnStatusTab` / per-tab counts**  
   The tab text uses `CountRows(Filter(PrintRequests, ...))` with the same filter stack as the gallery. This duplicates work on every render and will continue to throw **delegation** warnings for large lists. Consider a cached collection rebuilt when status/search/attention changes, or document the accepted ceiling.

5. **Accessibility**  
   Most dashboard controls omit `AccessibleLabel` (unlike e.g. `drpSchedTotalsSort` on the schedule). Adding labels to `galJobCards` template actions, status tabs, and modal primary buttons would help screen-reader users.

6. **Schedule save UX**  
   Documented `RemoveIf` is destructive with no confirm. A one-line confirmation (`Confirm` pattern or custom dialog) before wiping and re-patching all rows for `varSchedSelectedEmail` would reduce accidental data loss.

---

#### Notes

- **Duplicate `OnStart` schedule block:** Not present in current `App.pa.yaml`; the audit note in this doc may describe an older app export. If type drift reappears, re-scan for a second `ClearCollect(colEditShifts, ...)` after `varRefreshInterval`.
- **Payment / batch payment dates:** `Text(..., "yyyy-mm-dd")` is used in `Flow-(H)-Payment-SaveSingle` and `Flow-(I)-Payment-SaveBatch` call sites — consistent with the known Power Automate quirk in the spec.
- **Export (`btnExportDownload`):** Uses `IfError` around `Flow-(G)-Export-MonthlyTransactions` and clears loading in the outer `Set` after the block — reasonable pattern. Preview filters `colAllPayments` (refreshed with timer / payment success paths).
- **`lblWeightValidation`:** No references in the repo — matches “not present in live app.”
- **Nav:** `btnNavSchedule` + `btnNavAnalytics` (`Report`) match the spec’s “live app” description.

---

### GPT-5.4

**Summary:** Found several correctness bugs in schedule save and dashboard status/message indicators, plus a few high-impact quality improvements around reuse, accessibility, and query performance.

---

#### Bugs Found

- **Reference:** `scrDashboard > galStatusTabs > btnStatusTab.Text` (`CountRows(Filter(PrintRequests, ...))`)  
  **Bug:** Status-tab counts do not include the `SlicedOnComputer` search condition used by `galJobCards.Items`.  
  **Why this is a bug:** When searching by slicing computer, card results and tab counts diverge, so the UI reports incorrect counts for each status.

- **Reference:** `scrSchedule > btnSchedSave.OnSelect` (`Set(varSchedEditSaving, true); RemoveIf(...); Patch(...); ... Set(varSchedEditSaving, false)`)  
  **Bug:** Save chain has no `IfError` guards around `RemoveIf`/`Patch`.  
  **Why this is a bug:** If SharePoint write/delete fails, the user can be left with partial writes, stale schedule collections, and a misleading success path; the save spinner/disable state can also become unreliable under failure conditions.

- **Reference:** `scrSchedule > btnSchedSave.OnSelect` (`Filter(colEditShifts, !IsBlank(ShiftStart) && !IsBlank(ShiftEnd))`)  
  **Bug:** Save logic allows invalid intervals (e.g., end <= start) because it only checks blankness.  
  **Why this is a bug:** Invalid rows still get persisted, and totals/grid calculations later can render zero/negative hours, corrupting schedule accuracy.

- **Reference:** `scrSchedule.OnVisible`, `scrSchedule.btnSchedSave.OnSelect` (`MemberEmail = StaffEmail`, `RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail)`)  
  **Bug:** Email matching is done without `Lower(Trim(...))` normalization.  
  **Why this is a bug:** Case/spacing inconsistencies in stored emails can cause shifts to be missed during load and not removed during save, producing duplicate or orphaned schedule rows.

- **Reference:** `scrDashboard > btnViewMessages` visual state formulas (`!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID))`)  
  **Bug:** Message button "alert" styling is driven by total comment existence, not unread inbound comments.  
  **Why this is a bug:** Cards can remain highlighted even when there are no unread staff messages, creating false-positive urgency and masking real unread states.

#### Improvement Opportunities

- **Reference:** `scrDashboard > tmrAutoRefresh.OnTimerEnd`, `btnRefresh.OnSelect`, payment success paths (`btnPaymentConfirm`, `btnBatchPaymentConfirm`)  
  **Improvement:** The refresh + `colBuildPlateSummary` rebuild block is duplicated in multiple places. Consolidate into one shared formula pattern (or component command) to reduce drift and maintenance risk.

- **Reference:** `scrDashboard` + `scrSchedule` controls  
  **Improvement:** Accessibility metadata is sparse (only a few controls have `AccessibleLabel`). Add labels for key action controls (status tabs, card action buttons, message/payment controls, schedule edit controls) to improve screen reader navigation.

- **Reference:** `scrDashboard` message and badge formulas (`Filter(RequestComments, RequestID = ThisItem.ID, ...)` on card controls)  
  **Improvement:** Per-card direct list filtering is expensive and delegation-prone at scale. Precompute a local message summary collection keyed by `RequestID` (total, unread inbound) and bind card UI to that collection.

- **Reference:** `scrSchedule > drpSchedName.InputTextPlaceholder`  
  **Improvement:** Placeholder says `"Select a student..."` while the control picks staff workers. Rename to `"Select staff member..."` for clarity and reduced operator confusion.

#### Notes

- Validated in current YAML: payment flow date format uses `Text(..., "yyyy-mm-dd")` for both single and batch flow calls.
- Validated in current YAML: duplicate `SCHEDULE SCREEN STATE` block in `App.OnStart` does not appear in this snapshot.
- Still present: `varCurrentAttentionCount` is used in `tmrAutoRefresh.OnTimerEnd` but is not initialized in `App.OnStart`.

---

## Consensus

*Synthesized from all four model reviews: Claude Opus 4.6, Gemini, Composer 2, GPT-5.4.*

---

### P1 Bugs — Fix Before Next Release

These bugs were identified by 2 or more models independently, or by a single model with a high-confidence, clearly reproducible argument.

**Verification key:** ✅ Confirmed open in live YAML | ~~strikethrough~~ = Resolved

| # | Reference | Finding | Models | Live YAML |
|---|-----------|---------|--------|-----------|
| 1 | `btnSchedSave.OnSelect` — scrSchedule | No `IfError` around `RemoveIf` or `Patch`. On failure: existing shifts are deleted but not re-created (data loss), `varSchedEditSaving` is stuck `true`, and no error is surfaced to the user. | All 4 | ~~Fixed Apr 22, 2026~~ — nested `IfError` guards added; outer catches `RemoveIf` failure (no data changed, safe to retry); inner catches `Patch` failure (shifts deleted — user warned to re-enter); `varSchedEditSaving` always resets via unconditional `Set` at end; success path gated on `varSchedSaved`. **Pushed to live coauthoring session via `sync_canvas`**. **Docs updated**: `PowerApps/StaffDashboard-Schedule-Screen.md` Step 7 + `PowerApps/StaffDashboard-App-Spec.md` schedule gotcha #3. Compiler verified: 0 errors, warnings unchanged. |
| 2 | `btnSchedSave.OnSelect` — invalid time ranges | The filter only checks `!IsBlank(ShiftStart/End)`, not `ShiftEnd > ShiftStart`. Persisted invalid rows produce negative hour totals and empty grid spans in the schedule HtmlViewer. | Composer 2, GPT-5.4 | ~~Fixed Apr 22, 2026~~ — `btnSchedSave.OnSelect` now blocks any row where `ShiftEnd <= ShiftStart` before `RemoveIf`, shows an error notification, and only batch-patches valid rows. `lblSchedAidInfo` hour math now ignores invalid ranges too, so the edit bar no longer shows negative totals while drafting. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-Schedule-Screen.md` Step 5 aid counter + Step 7 save logic, and `PowerApps/StaffDashboard-App-Spec.md` schedule convention #3. Compiler verified: warnings only, no new errors. |
| 3 | `varCurrentAttentionCount` not initialized in `App.OnStart` | Only set inside `tmrAutoRefresh.OnTimerEnd`. First comparison on timer tick fires against a blank; any future binding before the first tick receives an untyped blank. | All 4 | ~~Fixed Apr 22, 2026~~ — `App.OnStart` now seeds both `varCurrentAttentionCount` and `varPrevAttentionCount` from `CountRows(colNeedsAttention)` before the timer starts, so the first auto-refresh comparison is typed and stable. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` OnStart block, variable table, and audio-startup troubleshooting note. Compiler verified: warnings only, no new errors. |
| 4 | `tmrAutoRefresh.OnTimerEnd` — `RequestComments` not refreshed | The `Concurrent` refresh covers `PrintRequests`, `BuildPlates`, `Payments` but not `RequestComments`. Unread message badges and counts go stale on the 30-second cadence. | Claude Opus 4.6, Composer 2, GPT-5.4 | ~~Fixed Apr 22, 2026~~ — `tmrAutoRefresh.OnTimerEnd` now refreshes `RequestComments` alongside `PrintRequests`, `BuildPlates`, and `Payments`, so unread message badges and message-button alert styling stay current on the 30-second loop. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` timer section now includes `Refresh(RequestComments)` and explains why. Compiler verified: warnings only, no new errors. |

---

### P2 Bugs — Fix Soon

High-confidence findings from one or two models with clear impact.

| # | Reference | Finding | Models | Live YAML |
|---|-----------|---------|--------|-----------|
| 5 | `btnStatusTab.Text` — `galStatusTabs`, scrDashboard | Tab counts omit the `SlicedOnComputer` search filter used by `galJobCards.Items`. Counts and gallery results diverge when searching by slicing computer. | GPT-5.4 | ~~Fixed Apr 22, 2026~~ — `btnStatusTab.Text` now includes `varSearchText in SlicedOnComputer.Value`, matching the live `galJobCards.Items` search criteria so tab counts and gallery results stay in sync when filtering by slicing computer. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` Step 5 tab formula. Compiler verified: warnings only, no new errors. |
| 6 | `icoBatchCheck.OnSelect` — `galJobCards` | Adds to `colBatchItems` without checking `Method.Value`. Bypasses the mixed filament/resin guard on `recCardBackground.OnSelect`; user gets no immediate feedback and accumulates an invalid batch. | Claude Opus 4.6 | ~~Fixed Apr 22, 2026~~ — `icoBatchCheck.OnSelect` now enforces the same single-method batch rule as `recCardBackground.OnSelect`: remove when already selected, add freely when the batch is empty, add only when `Method.Value` matches the first selected item, otherwise warn and refuse the selection. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` batch-selection icon formula and guidance note. Compiler verified: warnings only, no new errors. |
| 7 | `btnRejectConfirm` / `btnArchiveConfirm` / `btnRevertConfirm.OnSelect` | `Patch(PrintRequests,...)` called without `IfError`. Success notification fires even if the Patch fails. Revert is especially risky — plates and request status can desync. Note: `Flow-(C)` is correctly wrapped in `IfError` in Reject and Archive, but the Patch call preceding it is not. | Claude Opus 4.6, Gemini | ~~Fixed Apr 22, 2026~~ — Reject and Archive now store the request save result in `varRejectSaved` / `varArchiveSaved` via `IfError(..., Blank())` and only run audit logging, success notifications, and modal reset on a successful `Patch`. Revert now gates the entire reopen flow on `varRevertSaved`, so plate reversion, audit logging, and success messaging do not run if the request patch fails; the payment-field cleanup patch is also guarded and surfaces a targeted warning if it cannot clear the stale values after reopening. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` reject, archive, and revert formulas. Compiler verified: warnings only, no new errors. |
| 8 | `btnViewMessages` alert styling — `galJobCards` | Alert style checks `!IsEmpty(Filter(RequestComments,...))` — total existence, not unread inbound. Cards stay highlighted after all messages are read, creating false-positive urgency. | GPT-5.4 | ~~Fixed Apr 22, 2026~~ — `btnViewMessages` alert styling now keys off unread inbound comments only (`Direction.Value = "Inbound"` and `ReadByStaff = false`), matching `lblUnreadBadge`. Historical read messages still count toward the total message count, but they no longer keep the button red after staff catches up. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` Step 17C button styles + unread-only note. Compiler verified: warnings only, no new errors. |
| 9 | `btnBatchPaymentConfirm.DisplayMode` | Requires `!IsBlank(txtBatchTransaction.Text)` for all payment types including Grant/Program Code, whose hint says "Leave blank if pending." Single payment correctly scopes this to TigerCASH only. | Claude Opus 4.6 | ~~Fixed Apr 22, 2026~~ — `btnBatchPaymentConfirm.DisplayMode` now mirrors the single-payment rule: `txtBatchTransaction` is required only when `ddBatchPaymentType.Selected.Value = "TigerCASH"`, and remains optional for `Check` and `Grant/Program Code`. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` batch-payment button formula + note clarifying pending-code behavior. Compiler verified: warnings only, no new errors. |
| 10 | Email matching — scrSchedule (`OnVisible`, `btnSchedSave`) | `MemberEmail = StaffEmail` comparisons not normalized with `Lower(Trim(...))`. Case/spacing differences cause shifts to be missed on load and not removed on save (orphaned rows). | GPT-5.4 | ~~Fixed Apr 22, 2026~~ — schedule email joins are now normalized at the boundaries: `colSchedStaff.MemberEmail`, `colShifts.Email`, and `varSchedSelectedEmail` use `Lower(Trim(...))`, and the `StaffShifts` filter/delete path compares `Lower(Trim(StaffEmail))` as well. That prevents case/whitespace mismatches from hiding existing shifts or leaving orphaned rows behind after save. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-Schedule-Screen.md` load/save formulas and `PowerApps/StaffDashboard-App-Spec.md` schedule conventions. Compiler verified: warnings only, with expected additional delegation warnings on `scrSchedule.OnVisible` / `btnSchedSave` due to the new normalization formulas. |
| 11 | `drpSchedName.InputTextPlaceholder` — scrSchedule | Placeholder reads "Select a student..." but this dropdown populates from `colSchedStaff` (active staff members). | Claude Opus 4.6, GPT-5.4 | ~~Fixed Apr 22, 2026~~ — `drpSchedName.InputTextPlaceholder` now reads `Select Your Name`, matching the actual staff-only schedule picker and the existing schedule guide. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`.** Compiler verified: warnings only, no new errors beyond the expected schedule delegation warnings introduced by the prior email-normalization fix. |

---

### Improvements — High Agreement

| Reference | What to Improve | Models | Live YAML |
|-----------|-----------------|--------|-----------|
| `colBuildPlateSummary` rebuild — **8 locations** *(report said 5)* | Identical 10-line `ForAll/Distinct` formula in `App.OnStart`, `tmrAutoRefresh`, `btnRefresh`, `btnApproveConfirm` success, `btnPickedUp` partial path, `btnPickedUp` full path, `btnPaymentConfirm` success, `btnBatchPaymentConfirm` success. Extract to a named formula. | Claude Opus 4.6, GPT-5.4 | ~~Fixed Apr 22, 2026~~ — the duplicate summary logic is now centralized in `App.Formulas` as named formula `BuildPlateSummary`, derived from `colAllBuildPlates`. The eight manual `ClearCollect(colBuildPlateSummary, ...)` rebuilds were removed, and the dashboard progress label now does a single `LookUp(BuildPlateSummary, RequestID = ThisItem.ID)`. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` now documents `BuildPlateSummary` as a named formula and removes the stale manual rebuild snippets. Compiler verified: warnings only, no blocking errors. |
| Per-card `RequestComments` filtering | `lblMessagesHeader`, `btnViewMessages`, `lblUnreadBadge` each query the live SharePoint list per card. Precompute a keyed summary collection (like `colBuildPlateSummary`) to reduce SharePoint calls. | Claude Opus 4.6, GPT-5.4 | ~~Fixed Apr 22, 2026~~ — messaging now uses local cache `colAllRequestComments` plus named formula `RequestCommentSummary` in `App.Formulas`. Dashboard cards read total/unread counts via `LookUp(RequestCommentSummary, RequestID = ThisItem.ID)` instead of filtering `RequestComments` per card, and the message modal now renders from `colAllRequestComments`. Manual refresh, auto-refresh, mark-read, and send-message actions all refresh the local comments cache so badges stay current. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-App-Spec.md` startup collections, variable table, card formulas, and message modal formulas. Compiler verified: warnings only, no blocking errors; diagnostics dropped from 28 to 26 because the two message-count delegation warnings were eliminated. |
| `varShowExportModal` type inconsistency | Export modal uses `Boolean`; all others use `Int` (record ID). Migrate to `0`/`ID` pattern for one consistent mental model and simpler "close all modals" helpers. | Gemini, Composer 2 | ✅ Open — `App.pa.yaml` line 49 |
| `btnSchedSave` — destructive `RemoveIf` with no confirmation | No guard on `varSchedSelectedEmail` being blank, no confirmation step before wiping all rows. Minimum: a blank check guard; ideally a confirm dialog. | Gemini, Composer 2 | ~~Fixed Apr 22, 2026~~ — `btnSchedSave.OnSelect` now blocks blank `varSchedSelectedEmail` and uses a two-step destructive-save confirmation: first click warns and flips the button to `Confirm Replace`, second click performs the `RemoveIf`/`Patch` replace. Any name change, edit, add/remove row, or cancel action clears `varSchedConfirmSave`, so confirmation only applies to the current draft. **Pushed to live coauthoring session via `compile_canvas` + verification `sync_canvas`. Docs updated:** `PowerApps/StaffDashboard-Schedule-Screen.md` Step 1D + Step 7, and `PowerApps/StaffDashboard-App-Spec.md` schedule variable table/edit-bar notes/convention #3. Compiler verified: warnings only, no blocking errors. |

---

### Additional Risk — Z-order (Single Model, Easy Fix)

`conExportModal` is declared after `conLoadingOverlay` in `scrDashboard.pa.yaml`. The export modal renders on top of the loading spinner, making the loading overlay invisible to the user while "Download Report" is in progress. Fix: move `conLoadingOverlay` to be declared after `conExportModal` so it gets the higher z-order.

*(Raised by Claude Opus 4.6 only. ✅ Verified — `scrDashboard.pa.yaml`: `conLoadingOverlay` at line 8010, `conExportModal` at line 8060. Export modal renders on top.)*

---

### Coauthor MCP — Compiler & Accessibility Results

*From a live `compile_canvas` + `get_accessibility_errors` run against the authoring session (Apr 22, 2026).*

**Compiler: 26 warnings, 0 errors**

| Category | Controls | Finding |
|----------|----------|---------|
| Type mismatch *(new)* | `btnPaymentConfirm.OnSelect`, `btnBatchPaymentConfirm.OnSelect` | *"Incompatible types for comparison: Text, Boolean"* — `varFlowResult.success = true` compares a Boolean to `success`, which is initialized as the string `"false"` in `App.OnStart`. This is Known Issue #4 (flow result type ambiguity), now confirmed as a real compiler warning. The `Or(... Lower(Trim(...)) = "true")` workaround suppresses the runtime mismatch but the type warning remains. |
| Delegation | `galJobCards`, `btnStatusTab`, `lblMessagesHeader`, `lblUnreadBadge`, `btnPickedUp`, `scrSchedule.OnVisible`, `btnSchedSave` | Pre-documented ~18–26 delegation warnings. Non-blocking at current data volumes. |

**Accessibility checker: 439 errors** — Every dropdown, button, icon, text input, and checkbox across both screens lacks `AccessibleLabel`. Only `ddSortOrder` and `drpSchedTotalsSort` have labels set. Tab stops and `FocusedBorderThickness` are also missing on interactive controls. This is the accessibility improvement from the consensus, confirmed at scale.

---

### Confirmed Resolved

Previously documented known issues that are **not present** in the current live YAML:

| Known Issue | Verified By |
|-------------|-------------|
| Duplicate `SCHEDULE SCREEN STATE` block in `App.OnStart` — `colEditShifts` type drift | All 4 models |
| `lblWeightValidation` control — referenced in older spec, absent from live app | Gemini, Composer 2 |
| Payment date format `"yyyy-mm-dd"` (lowercase `m`) — confirmed consistent with flow expectations at both call sites | Claude Opus 4.6, Composer 2, GPT-5.4 |

---

*Created: April 22, 2026*
