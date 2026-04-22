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

**Summary:** [Model to complete]

---

#### Bugs Found

[List each bug with control/screen/formula reference and description]

#### Improvement Opportunities

[List each improvement opportunity with context]

#### Notes

[Anything else worth flagging]

---

### Gemini

**Summary:** [Model to complete]

---

#### Bugs Found

[List each bug with control/screen/formula reference and description]

#### Improvement Opportunities

[List each improvement opportunity with context]

#### Notes

[Anything else worth flagging]

---

### Composer 2

**Summary:** [Model to complete]

---

#### Bugs Found

[List each bug with control/screen/formula reference and description]

#### Improvement Opportunities

[List each improvement opportunity with context]

#### Notes

[Anything else worth flagging]

---

### GPT-5.4

**Summary:** [Model to complete]

---

#### Bugs Found

[List each bug with control/screen/formula reference and description]

#### Improvement Opportunities

[List each improvement opportunity with context]

#### Notes

[Anything else worth flagging]

---

## Consensus

*To be completed after all models have submitted their findings. A separate model will be asked to synthesize the responses into a unified list of prioritized bugs and improvements.*

[Consensus to be added]

---

*Created: April 22, 2026*
