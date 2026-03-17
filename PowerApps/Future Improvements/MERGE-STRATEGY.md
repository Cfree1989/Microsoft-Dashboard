# Enhancement Merge Strategy

**Purpose:** Guide for merging Enhancements #1, #3, and #5 into the main `StaffDashboard-App-Spec.md` as built-in features  
**Created:** March 17, 2026

---

## Overview

This document outlines the staged approach to merge three enhancement specifications into the main Staff Dashboard App Spec as if they were built-in from the beginning.

### Enhancements Being Merged

| # | Enhancement | Lines | Dependencies |
|---|-------------|-------|--------------|
| 1 | Printer Verification | 432 | Step 12A (Complete Modal) |
| 3 | Build Plate Tracking | 1235 | Steps 3, 6-7, 11, 12A, 12C |
| 5 | Multi-Payment Tracking | 815 | Steps 3, 12C |

### Files Affected

| File | Changes Required |
|------|------------------|
| `PowerApps/StaffDashboard-App-Spec.md` | Major updates to multiple steps |
| `SharePoint/PrintRequests-List-Setup.md` | Add new columns, update column count |
| **NEW:** `SharePoint/BuildPlates-List-Setup.md` | Create from Enhancement #3 |
| **NEW:** `SharePoint/Payments-List-Setup.md` | Create from Enhancement #5 |
| `PowerAutomate/Flow-(C)-Action-LogAction.md` | Add new Action choices |

---

## Stage 1: SharePoint Schema Updates

**Goal:** Prepare all SharePoint lists before touching the app spec.

### 1.1 Update `PrintRequests-List-Setup.md`

**Current State:** 37 columns documented (Step 4C already has ActualPrinter)

**Add New Columns:**

| Column | Type | Source Enhancement |
|--------|------|-------------------|
| `PayerName` | Single line of text | Enhancement #2 (Payer Tracking) |
| `PayerTigerCard` | Single line of text | Enhancement #2 (Payer Tracking) |

> Note: PayerName and PayerTigerCard come from Enhancement #2 (Payer Tracking), which is referenced by Enhancement #5. Add these for completeness.

**Update Documentation:**
- Change "38 total fields" to "40 total fields" in Overview
- Add Payment Recording Fields section to include PayerName and PayerTigerCard
- Update Column Summary table
- Update Verification Checklist

### 1.2 Create `SharePoint/BuildPlates-List-Setup.md`

**Source:** Enhancement #3 → "SharePoint Schema Changes" section

**Content to Extract:**
- New List: `BuildPlates` description
- Column definitions: `RequestID`, `ReqKey`, `Machine`, `Status`
- Machine Column Setup (exact choices matching PrintRequests.Printer)
- Status Column Setup (Queued, Printing, Completed, Picked Up)
- Permissions setup (staff-only)

**Template Structure:**
```
# BuildPlates SharePoint List Setup
## Overview
## Step 1: Create the List
## Step 2: Add Columns
## Step 3: Set Permissions
## Column Summary
## Verification Checklist
```

### 1.3 Create `SharePoint/Payments-List-Setup.md`

**Source:** Enhancement #5 → "SharePoint Schema" section

**Content to Extract:**
- New List: `Payments` description
- All 12 column definitions with setup instructions
- Permissions setup (staff-only)

**Template Structure:**
```
# Payments SharePoint List Setup
## Overview
## Step 1: Create the List
## Step 2: Add Columns
## Step 3: Set Permissions
## Column Summary
## Verification Checklist
```

---

## Stage 2: Prerequisites Section Update

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Prerequisites (around line 50)

**Current Prerequisites:**
- SharePoint lists: `PrintRequests`, `AuditLog`, `Staff`
- Power Automate flows: Flow A, Flow B, Flow C
- Staff list populated
- Power Apps license

**Add to Prerequisites:**
- SharePoint lists: Add `BuildPlates`, `Payments`
- Note about ActualPrinter being multi-select on PrintRequests

---

## Stage 3: Data Connections Update (Step 2)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 2 - Adding Data Connections (around line 278)

**Current Connections:**
- PrintRequests
- AuditLog
- Staff
- Office365Users
- Flow C

**Add New Connections:**
- [x] **BuildPlates** (from Enhancement #3)
- [x] **Payments** (from Enhancement #5)

Update the verification checklist:
```
**In the Data panel**, you should see:
- ✅ PrintRequests
- ✅ AuditLog  
- ✅ Staff
- ✅ Office365Users
- ✅ BuildPlates      ← NEW
- ✅ Payments         ← NEW
```

---

## Stage 4: App.OnStart Updates (Step 3)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 3 - Setting Up App.OnStart (around line 348)

### 4.1 Add Modal Variable

**Location:** After `varShowBatchPaymentModal` line in MODAL CONTROLS block

**Add:**
```powerfx
Set(varShowBuildPlatesModal, 0);
```

### 4.2 Add Build Plate Collections

**Location:** After `colNeedsAttention` section

**Add (from Enhancement #3):**
```powerfx
// === BUILD PLATE TRACKING ===
// Pre-load all plate records so job card progress pills don't trigger per-card delegation
ClearCollect(colAllBuildPlates, BuildPlates);
// Working collections for the Build Plates modal and payment plate selection
ClearCollect(colBuildPlates, Blank());
Clear(colBuildPlates);
ClearCollect(colBuildPlatesIndexed, Blank());
Clear(colBuildPlatesIndexed);
ClearCollect(colPickedUpPlates, Blank());
Clear(colPickedUpPlates);
ClearCollect(colPrintersUsed, Blank());
Clear(colPrintersUsed);
```

### 4.3 Add Payment Collection

**Location:** After Build Plate collections

**Add (from Enhancement #5):**
```powerfx
// === PAYMENT TRACKING ===
ClearCollect(colPayments, Blank());
Clear(colPayments);
```

### 4.4 Update Card Height Variable

**Change:**
```powerfx
// Before
Set(varCardGalleryHeight, 450);

// After
Set(varCardGalleryHeight, 490);
```

### 4.5 Update Variables Table

Add new entries to the "Understanding the Variables" table:

| Variable | Purpose | Type |
|----------|---------|------|
| `varShowBuildPlatesModal` | ID of item for build plates modal (0=hidden) | Number |
| `colAllBuildPlates` | All BuildPlates records pre-loaded at startup | Table |
| `colBuildPlates` | Sorted BuildPlates records for currently selected item | Table |
| `colBuildPlatesIndexed` | `colBuildPlates` with added `PlateNum` column | Table |
| `colPickedUpPlates` | Plates checked for pickup in Payment Modal | Table |
| `colPrintersUsed` | Distinct printers used for current item | Table |
| `colPayments` | Payment records for current modal context | Table |

---

## Stage 5: Tree View Update

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** "Complete Tree View — All Controls" (around line 735)

### 5.1 Add Build Plates Modal Container

**Location:** Insert after `conBatchPaymentModal` section

**Add:**
```
    ▼ conBuildPlatesModal            ← Step 12F (Build Plates Modal Container)
        btnBuildPlatesClose
        btnBuildPlatesDone
        btnBuildPlatesAdd
        ddBuildPlatesMachine
        lblAddPlateHeader
        recBuildPlatesDivider3
        galBuildPlates
        lblBuildPlatesProgressModal
        lblTotalSlicedLabel
        recBuildPlatesDivider2
        recBuildPlatesDivider1
        lblBuildPlatesTitle
        recBuildPlatesModal
        recBuildPlatesOverlay
```

---

## Stage 6: Job Card Updates (Step 7)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 7 - Creating the Job Card Template (around line 1287)

### 6.1 Add Build Plates Row

**Location:** Insert new section describing the Build Plates row above the Details section

**Content from Enhancement #3:**
- Job Card Layout Reference (updated ASCII diagram)
- `conBuildPlatesRow` container specifications
- `lblBuildPlatesProgress` label specifications
- `lblUsingPrinters` label specifications
- `btnBuildPlates` button specifications with OnSelect

### 6.2 Update Card Height References

Any references to card height (450) should be updated to 490.

---

## Stage 7: Approval Modal Updates (Step 11)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 11 - Building the Approval Modal (around line 2904)

### 7.1 Add Build Plates Section

**Content from Enhancement #3 → Phase 6:**
- `lblApprovePlatesInfo` label specifications
- `btnApproveAddPlates` button specifications with OnSelect

### 7.2 Update btnApproveConfirm.OnSelect

Add auto-create default plate logic after existing Patch operation:

```powerfx
// Create default plate if staff didn't configure any
If(CountRows(Filter(BuildPlates, RequestID = varSelectedItem.ID)) = 0,
    Patch(BuildPlates, Defaults(BuildPlates), {
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        Machine: varSelectedItem.Printer,
        Status: {Value: "Queued"}
    })
);

// Refresh collections
ClearCollect(colAllBuildPlates, BuildPlates);
```

---

## Stage 8: Complete Modal Rewrite (Step 12A)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 12A - Building the Complete Confirmation Modal (around line 3973)

### 8.1 Update Modal Dimensions

From Enhancement #1:
- Height changes from 260 to 340 (with Build Plates integration)

### 8.2 Add Printers Used Display

**Content from Enhancement #1 → "With Build Plates" version:**
- Read-only display of ActualPrinter (auto-populated from plates)
- NOT a dropdown (plates determine the printers)

### 8.3 Add Completion Gate Validation

**Content from Enhancement #3 → Phase 7:**
- Update `btnPrintComplete.DisplayMode` to check all plates are Completed/Picked Up
- Add `lblCompletePlatesHint` helper text

### 8.4 Update btnCompleteConfirm.OnSelect

- Auto-populate ActualPrinter from distinct plate machines
- Add conditional printer correction note to audit log (from Enhancement #1)

---

## Stage 9: Payment Modal Rewrite (Step 12C)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 12C - Building the Payment Recording Modal (around line 5123)

### 9.1 Update Modal Dimensions

From Enhancement #5:
- Width changes from 550 to 800
- Two-column layout

### 9.2 Add Left Column Container

Move existing form controls into `conPaymentLeft` (400px width).

### 9.3 Add Right Column Container

**Content from Enhancement #5 → Phase 3:**
- `conPaymentRight` container (370px width)
- Payment History section (`galPaymentHistory`, summary labels)
- Plates Pickup section (`galPlatesPickup` with checkboxes)

### 9.4 Add Payer Tracking Controls

**Content from Enhancement #2 (referenced by #5):**
- `chkPayerSameAsStudent` checkbox
- `txtPayerName` text input
- `txtPayerTigerCard` text input

### 9.5 Rewrite btnPaymentConfirm.OnSelect

**Content from Enhancement #5 → Phase 4:**
Complete replacement with:
1. Create `Payments` record
2. Update `PrintRequests` running totals
3. Mark checked plates as "Picked Up"
4. Call Flow C for audit logging
5. Refresh collections
6. Reset form and close modal

---

## Stage 10: New Build Plates Modal (Step 12F)

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Create new Step 12F after Step 12E

### 10.1 Create New Section

**Content from Enhancement #3 → Phase 4:**
- Full `conBuildPlatesModal` specification
- All child controls with properties
- Grouped-by-printer UI design
- Add/Remove plate functionality
- Status transition buttons (Queued → Printing → Completed)

---

## Stage 11: Power Automate Updates

**File:** `PowerAutomate/Flow-(C)-Action-LogAction.md`

### 11.1 Add New Action Choices

Update the AuditLog Action choices list to include:
- `Partial Payment` (from Enhancement #5)
- `Plate Added` (from Enhancement #3)
- `Plate Removed` (from Enhancement #3)
- `Plate Status Change` (from Enhancement #3)

---

## Stage 12: Testing Scenarios Update

**File:** `PowerApps/StaffDashboard-App-Spec.md`  
**Section:** Step 19 - Testing the App

### 12.1 Add Build Plate Testing Scenarios

**Content from Enhancement #3 → Testing Scenarios:**
- Default Plate on Approval
- Multi-Plate Setup via Approval Modal
- Advance Plate Statuses
- Completion Gate — Plates Not Done
- Remove Any Plate (Full Flexibility)
- Partial Pickup via Payment Modal

### 12.2 Add Printer Verification Testing Scenarios

**Content from Enhancement #1 → Testing Scenarios:**
- Student Picked the Correct Printer
- Student Picked the Wrong Printer
- Resin Job (Form 3 only)
- Confirm Button Blocked Until Printer Selected

### 12.3 Add Multi-Payment Testing Scenarios

**Content from Enhancement #5 → Testing Scenarios:**
- Single Payment (Normal Case)
- Two Partial Payments
- Payment History Display
- Different Payers
- Backward Compatibility

---

## Cross-Reference Updates

After all content is merged, update these cross-references:

### In Main Spec
- Remove references to "Future Enhancement #X"
- Update line number references in Related Spec Sections
- Update Table of Contents with new Step 12F

### In Enhancement Files
- Add header noting "MERGED into StaffDashboard-App-Spec.md on [date]"
- Keep files for historical reference

### In SharePoint Docs
- Update PrintRequests column count
- Add cross-references to new BuildPlates and Payments list docs

---

## Merge Order Summary

| Order | Stage | Primary Source | Files Affected |
|-------|-------|----------------|----------------|
| 1 | SharePoint Schema | All 3 | PrintRequests-List-Setup.md, NEW lists |
| 2 | Prerequisites | All 3 | StaffDashboard-App-Spec.md |
| 3 | Data Connections | #3, #5 | StaffDashboard-App-Spec.md (Step 2) |
| 4 | App.OnStart | #3, #5 | StaffDashboard-App-Spec.md (Step 3) |
| 5 | Tree View | #3 | StaffDashboard-App-Spec.md |
| 6 | Job Cards | #3 | StaffDashboard-App-Spec.md (Step 7) |
| 7 | Approval Modal | #3 | StaffDashboard-App-Spec.md (Step 11) |
| 8 | Complete Modal | #1, #3 | StaffDashboard-App-Spec.md (Step 12A) |
| 9 | Payment Modal | #3, #5 | StaffDashboard-App-Spec.md (Step 12C) |
| 10 | Build Plates Modal | #3 | StaffDashboard-App-Spec.md (NEW Step 12F) |
| 11 | Power Automate | All 3 | Flow-(C)-Action-LogAction.md |
| 12 | Testing | All 3 | StaffDashboard-App-Spec.md (Step 19) |

---

## Notes

### Payer Tracking (Enhancement #2)
Enhancement #2 is NOT being fully merged, but the `PayerName` and `PayerTigerCard` fields are needed by Enhancement #5. Only the schema and Payment Modal UI portions are included.

### Monthly Transaction Export (Enhancement #4)
Enhancement #4 depends on Enhancement #5 (Payments list) and remains as a separate future enhancement. It queries the Payments list that will be created.

### Backward Compatibility
- Existing jobs without BuildPlates records continue to work (completion gate skipped)
- Existing jobs without Payments records continue to work (falls back to PrintRequests fields)

---

*Created: March 17, 2026*
