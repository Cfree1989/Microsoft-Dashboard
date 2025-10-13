# Power Automate Flows - Comprehensive Testing Guide

**Project:** LSU Digital Fabrication Lab - 3D Print Queue Management System  
**Last Updated:** October 13, 2025  
**Document Version:** 1.0

---

## Table of Contents

1. [⚡ Quick Start Testing](#quick-start-testing) **(Start Here! - 30 minutes)**
2. [Test Scope Overview](#test-scope-overview)
3. [Prerequisites](#prerequisites)
4. [Test Data Requirements](#test-data-requirements)
5. [Testing Approach](#testing-approach)
6. [Flow A Tests (PR-Create)](#flow-a-tests-pr-create)
7. [Flow B Tests (PR-Audit)](#flow-b-tests-pr-audit)
8. [Flow C Tests (PR-Action)](#flow-c-tests-pr-action)
9. [Integration Tests](#integration-tests)
10. [Error Scenarios](#error-scenarios)
11. [Regression Test Suite](#regression-test-suite)
12. [Test Result Template](#test-result-template)
13. [Troubleshooting Guide](#troubleshooting-guide)

---

## ⚡ Quick Start Testing

**⏱️ Time Required:** 30 minutes  
**🎯 Purpose:** Verify critical functionality is working before diving into comprehensive testing

### Who Should Use This Section?

✅ **First-time testers** - Get started quickly  
✅ **Post-deployment validation** - Confirm system is working  
✅ **After flow changes** - Quick smoke test  
✅ **Time-constrained testing** - Essential checks only

**For comprehensive testing**, see the full test suites starting at [Flow A Tests](#flow-a-tests-pr-create).

---

### Essential Test Suite (8 Critical Tests)

These 8 tests cover the most important functionality across all 3 flows.

---

#### ✅ QUICK-01: Create Valid Request (Flow A)

**What this tests:** End-to-end request creation with valid file

**Quick Steps:**
1. Go to PrintRequests → Click **New**
2. Fill in:
   - Title: "Quick Test 1"
   - Student: Your name
   - Method: Filament
   - Printer: Prusa MK4S
   - Color: Blue
3. Attach file: **JaneDoe_Filament_Blue.stl** (must follow FirstLast_Method_Color format)
4. Click **Save**
5. Wait 30 seconds → Refresh

**Pass Criteria:**
- [ ] ReqKey generated (format: REQ-00001)
- [ ] Title updated to include standardized name
- [ ] Status = Uploaded
- [ ] Confirmation email received
- [ ] Two audit entries created (Request Created + Email Sent)

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-02: Invalid Filename Rejection (Flow A)

**What this tests:** Filename validation logic

**Quick Steps:**
1. Create new request
2. Attach file: **model.stl** (invalid - missing name segments)
3. Save

**Pass Criteria:**
- [ ] Status changed to: Rejected
- [ ] Rejection email received explaining naming format
- [ ] No confirmation email sent

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-03: System Update Condition (Flow B)

**What this tests:** Critical infinite loop prevention

**Quick Steps:**
1. Look at the request from QUICK-01
2. Check AuditLog for that ReqKey
3. Count entries created by Flow A

**Pass Criteria:**
- [ ] Only 2 audit entries from Flow A (Request Created + Email Sent)
- [ ] No field change entries from Flow B (Status, ReqKey, Title changes)
- [ ] Flow B run history shows it triggered but **skipped processing** (LastActionBy = System)

**⚠️ Critical:** If Flow B created field change entries, infinite loop prevention is broken!

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-04: Status Change Detection (Flow B)

**What this tests:** Field change logging

**Quick Steps:**
1. Open request from QUICK-01
2. Change Status from "Uploaded" to "Pending"
3. Set LastActionBy to your name (staff)
4. Save → Wait 30 seconds
5. Check AuditLog

**Pass Criteria:**
- [ ] New audit entry: "Status Change"
- [ ] FieldName = Status
- [ ] NewValue = Pending
- [ ] ActorRole = Staff

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-05: Rejection Email Automation (Flow B)

**What this tests:** Automated email on status change

**Quick Steps:**
1. Change request Status to "Rejected"
2. Select RejectionReason: "Design not printable"
3. Save
4. Check student email inbox

**Pass Criteria:**
- [ ] Rejection email received
- [ ] Subject contains ReqKey
- [ ] Body shows rejection reason (readable text, not JSON)
- [ ] Audit entry created: "Email Sent: Rejection"

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-06: Student Estimate Confirmation (Flow B)

**What this tests:** Estimate approval workflow

**Quick Steps:**
1. Create request with Status = Uploaded
2. Change Status to "Pending" (as staff)
3. Save → Check email
4. As student: Change StudentConfirmed from "No" to "Yes"
5. Save → Wait 30 seconds

**Pass Criteria:**
- [ ] Estimate email received when Status → Pending
- [ ] Status auto-updated to "Ready to Print" when StudentConfirmed = Yes
- [ ] LastAction = "Student Confirmed Estimate"
- [ ] No infinite loop (status doesn't keep changing)

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-07: Power Apps Flow Connection (Flow C)

**What this tests:** Flow C appears and connects in Power Apps

**Quick Steps:**
1. Open Power Apps Studio
2. Go to **Data** → **Power Automate**
3. Look for "Flow C (PR-Action)" or "PR-Action: Log action"

**Pass Criteria:**
- [ ] Flow appears in data sources
- [ ] Can see `.Run()` method when typing flow name in formula bar

**Status:** [ ] PASS  [ ] FAIL

---

#### ✅ QUICK-08: Staff Action Logging (Flow C)

**What this tests:** Flow C creates audit entries from Power Apps

**Quick Steps:**
1. From Power Apps, call Flow C (or manually test in Power Automate)
2. Parameters:
   - RequestID: "1"
   - Action: "Test Action"
   - FieldName: "Status"
   - NewValue: "Test"
   - ActorEmail: your email
3. Check AuditLog

**Pass Criteria:**
- [ ] Audit entry created: "Staff Action: Test Action"
- [ ] ReqKey retrieved from PrintRequests
- [ ] Actor Claims resolved to person field
- [ ] Success response returned

**Status:** [ ] PASS  [ ] FAIL

---

### Quick Test Results Summary

**Total Tests:** 8  
**Time Spent:** _____ minutes

**Results:**
```
PASSED: _____ / 8
FAILED: _____ / 8
```

**All tests passed?**
- ✅ **YES** → System is working! Use this as your ongoing regression suite.
- ❌ **NO** → See [Troubleshooting Guide](#troubleshooting-guide) or run detailed tests for the failing flow.

---

### What's Not Covered in Quick Start?

The quick tests validate core functionality but skip:

- ❌ Edge cases (special characters, concurrent requests, long text)
- ❌ Multiple field changes simultaneously
- ❌ Email content validation (just checks delivery)
- ❌ Error handling (SharePoint failures, invalid data)
- ❌ Number field null handling
- ❌ Multi-choice field formatting
- ❌ Race condition testing

**For production deployment**, run the full test suite (sections 5-10 below).

---

### When to Run Full Tests

Run comprehensive testing (sections 5-10) when:

- 🔧 **Initial deployment** - Before going live
- 🛠️ **Major flow changes** - Modified logic or expressions
- 🐛 **After fixing bugs** - Validate fix didn't break other features
- 📋 **Compliance audit** - Need complete test evidence
- ⚠️ **Quick tests failed** - Need detailed diagnostics

**Time for full testing:** 2.5-3 hours

---

## Test Scope Overview

### What We're Testing

This guide covers comprehensive testing for **three Power Automate cloud flows** that automate the 3D print request management system:

| Flow | Purpose | Trigger Type | Key Features |
|------|---------|--------------|--------------|
| **Flow A (PR-Create)** | New request processing | SharePoint Create | ReqKey generation, filename validation, confirmation emails |
| **Flow B (PR-Audit)** | Change tracking & notifications | SharePoint Modify | Field change logging, automated emails, estimate confirmations |
| **Flow C (PR-Action)** | Staff action logging | Power Apps | Audit trail from dashboard actions |

### Why Testing Matters

✅ **Prevent data loss** - Ensure audit trails are complete  
✅ **Validate automations** - Confirm emails send correctly  
✅ **Catch regressions** - Detect when changes break existing functionality  
✅ **Build confidence** - Staff can trust the system works reliably  
✅ **Document behavior** - Create evidence of testing for compliance

### Testing Philosophy (Microsoft Best Practices)

Based on Microsoft Power Automate documentation:

1. **Test early and often** - Use Flow Checker for real-time validation
2. **Test manually first** - Verify basic functionality before automation
3. **Use static results** - Mock data for testing without side effects
4. **Check error paths** - Don't just test happy paths
5. **Monitor run history** - Review execution details for issues
6. **Test with real users** - Validate with actual student/staff accounts

---

## Prerequisites

### Required Access

Before starting testing, ensure you have:

- [ ] **SharePoint Site Access**
  - URL: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
  - Permission Level: Site Owner or Full Control
  
- [ ] **Power Automate Access**
  - License: Power Automate Premium (for flow editing)
  - Can view flow run history
  - Can trigger manual tests

- [ ] **Test Accounts**
  - Student test account (for submission testing)
  - Staff test account (for action testing)
  - Access to email for both accounts

- [ ] **Power Apps Access** (for Flow C testing)
  - Staff Console app installed
  - Can trigger actions from dashboard

### SharePoint Setup Validation

Verify these lists exist and are properly configured:

```
✓ PrintRequests list
  - Contains all required columns (ReqKey, Status, StudentEmail, etc.)
  - Item-level permissions enabled
  - Status column formatting applied

✓ AuditLog list
  - All audit fields present (Title, RequestID, ReqKey, Action, etc.)
  - No special permissions (staff can view all)

✓ Staff list
  - Populated with team members
  - Active flags set correctly
```

**Validation Steps:**
1. Navigate to SharePoint site
2. Check that all three lists appear in site navigation
3. Open each list and verify column headers match documentation
4. Create a test item in PrintRequests → Should get ID = 1, 2, 3 etc.

### Email Configuration

Verify shared mailbox setup:

- [x] Shared mailbox exists: `coad-fablab@lsu.edu`
- [x] Flow owner has "Send As" permissions
- [x] Test email delivery works (send test email from shared mailbox)
- [x] Can receive emails at student test account

---

## Test Data Requirements

### Student Test Accounts

Prepare 3 test student accounts with different name formats:

| Account Type | Name | Email | Purpose |
|--------------|------|-------|---------|
| Standard | Jane Doe | janedoe@lsu.edu | Basic happy path testing |
| Special Characters | Mary O'Connor | moconnor@lsu.edu | Apostrophe handling |
| Middle Name | John Q. Public | jqpublic@lsu.edu | Period/middle initial handling |

### Test File Attachments

Create these test files before starting:

**Valid Files:**
```
✓ JaneDoe_Filament_Blue.stl (valid format)
✓ MaryOConnor_Resin_Clear.obj (valid with special char name)
✓ JohnQPublic_Filament_Red.3mf (valid with middle initial)
```

**Invalid Files:**
```
✗ model.stl (missing name segments)
✗ JaneDoe.stl (missing Method and Color)
✗ JaneDoe_Filament_.stl (empty Color segment)
✗ JaneDoe__Blue.stl (missing Method segment - double underscore)
✗ JaneDoe_Filament_Blue.exe (wrong file extension)
✗ Jane Doe_Filament_Blue.stl (spaces in name)
```

**Mixed Test Case:**
```
Valid file 1: JaneDoe_Filament_Blue.stl
Valid file 2: JaneDoe_Resin_Clear.obj
Invalid file: model.stl
```

### SharePoint Test Items

Before starting Flow B and C tests, create these baseline items:

| Item ID | Status | EstimatedCost | EstimatedWeight | Purpose |
|---------|--------|---------------|-----------------|---------|
| Test-001 | Uploaded | null | null | Field change detection with nulls |
| Test-002 | Uploaded | $15.00 | 250g | Field change detection with values |
| Test-003 | Pending | $20.00 | 300g | Student confirmation testing |

---

## Testing Approach

### Test Execution Order

Follow this sequence to build confidence progressively:

```
1. Flow A Unit Tests (30 min)
   ↓ (Verify basic request creation works)
2. Flow B Unit Tests (45 min)
   ↓ (Verify change detection works)
3. Flow C Unit Tests (20 min)
   ↓ (Verify Power Apps integration works)
4. Integration Tests (30 min)
   ↓ (Verify flows work together)
5. Error Scenarios (30 min)
   ↓ (Verify error handling)
6. Regression Suite (15 min)
   ↓ (Quick validation after fixes)
```

**Total Estimated Time:** 2.5 - 3 hours for complete testing

### Microsoft Testing Methods

We'll use these Power Automate testing features:

1. **Manual Testing** - Trigger flows by performing actions
2. **Flow Checker** - Real-time validation for errors/warnings
3. **Run History** - Review execution details and outputs
4. **Test Pane** - Use built-in Test flow functionality

### Pass/Fail Criteria

**PASS:** Test meets all expected results, no errors in run history  
**FAIL:** Test produces incorrect results or throws errors  
**BLOCKED:** Cannot complete test due to prerequisite failure

### Documentation During Testing

For each test:
- ✅ Take screenshots of successful runs
- ✅ Copy flow run IDs for reference
- ✅ Note any warnings or unexpected behavior
- ✅ Record actual vs expected results in template

---

## Flow A Tests (PR-Create)

### Test Summary

**Flow Name:** `PR-Create: Set ReqKey + Acknowledge`  
**Trigger:** SharePoint - When an item is created (PrintRequests list)  
**Estimated Time:** 30 minutes

### Unit Tests

---

#### TEST A-001: ReqKey Generation (Sequential Numbering)

**Objective:** Verify that ReqKey generates in correct format with sequential numbering.

**Prerequisites:**
- [ ] PrintRequests list is empty or note the highest existing ID
- [ ] Flow A is enabled

**Test Steps:**
1. Navigate to PrintRequests list
2. Click **New** → Create item with these values:
   - **Title:** Test Request 1
   - **Student:** Select your test account
   - **Method:** Filament
   - **Printer:** Prusa MK4S
   - **Color:** Blue
   - **Attach file:** JaneDoe_Filament_Blue.stl
3. Click **Save**
4. Wait 30 seconds for flow to complete
5. Refresh the list
6. Check the ReqKey field value

**Expected Result:**
- ReqKey format: `REQ-00001` (or next sequential number if list not empty)
- Format is exactly 5 digits with leading zeros
- Example: If this is item ID 42, ReqKey should be `REQ-00042`

**Actual Result:**
```
ReqKey Value: _______________
Item ID: _______________
Flow Run ID: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:**
_____________________________________________

---

#### TEST A-002: Standardized Display Name Generation

**Objective:** Verify that Flow A creates clean display names with character removal.

**Prerequisites:**
- [ ] Test A-001 passed
- [ ] Test accounts ready

**Test Steps:**
1. Create three new requests with different student names:
   
   **Request 1 (Standard):**
   - Student: Jane Doe
   - Method: Filament
   - Color: Blue
   - File: JaneDoe_Filament_Blue.stl
   
   **Request 2 (Apostrophe):**
   - Student: Mary O'Connor
   - Method: Resin
   - Color: Clear
   - File: MaryOConnor_Resin_Clear.obj
   
   **Request 3 (Period):**
   - Student: John Q. Public
   - Method: Filament
   - Color: Red
   - File: JohnQPublic_Filament_Red.3mf

2. Wait for flows to complete
3. Check the **Title** field for each item

**Expected Result:**

| Student Name | Expected Title Pattern |
|--------------|------------------------|
| Jane Doe | JaneDoe_Filament_Blue_##### |
| Mary O'Connor | MaryOConnor_Resin_Clear_##### |
| John Q. Public | JohnQPublic_Filament_Red_##### |

**Character Cleaning Rules Applied:**
- Spaces removed: `Jane Doe` → `JaneDoe`
- Apostrophes removed: `O'Connor` → `OConnor`
- Periods removed: `Q.` → `Q`

**Actual Result:**
```
Request 1 Title: _______________
Request 2 Title: _______________
Request 3 Title: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-003: Valid Filename - Confirmation Email

**Objective:** Verify that valid filenames trigger confirmation emails with correct content.

**Prerequisites:**
- [ ] Can receive emails at test student account
- [ ] Shared mailbox configured

**Test Steps:**
1. Create new request as Jane Doe:
   - Title: Valid Filename Test
   - Method: Filament
   - Printer: Prusa MK4S
   - Color: Blue
   - File: JaneDoe_Filament_Blue.stl
2. Click Save
3. Wait 1-2 minutes
4. Check email inbox for janedoe@lsu.edu

**Expected Result:**
- [ ] Email received from coad-fablab@lsu.edu
- [ ] Subject contains: "We received your 3D Print request – REQ-#####"
- [ ] Email body includes:
  - [ ] Standardized display name
  - [ ] Request ID (REQ-#####)
  - [ ] Method: Filament
  - [ ] Printer: Prusa MK4S
  - [ ] Color: Blue
  - [ ] Link to view request details
  - [ ] Link to "My Requests" view
  - [ ] Next steps information

**Actual Result:**
```
Email received: [ ] Yes  [ ] No
Subject line: _______________
All content correct: [ ] Yes  [ ] No
Missing items: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-004: Valid Filename - AuditLog Entries

**Objective:** Verify that valid submissions create proper audit trail.

**Prerequisites:**
- [ ] Test A-003 completed
- [ ] Can access AuditLog list

**Test Steps:**
1. Navigate to AuditLog list
2. Filter by ReqKey from Test A-003
3. Count entries and check field values

**Expected Result:**
- [ ] **Two audit entries** created for this request:
  
  **Entry 1: Request Created**
  - Title: "Request Created"
  - Action: Created
  - ActorRole: Student
  - ClientApp: SharePoint Form
  - Notes: Contains "standardized display name"
  
  **Entry 2: Email Sent**
  - Title: "Email Sent: Confirmation"
  - Action: Email Sent
  - FieldName: StudentEmail
  - ActorRole: System
  - ClientApp: Power Automate

**Actual Result:**
```
Number of audit entries: _______________
Entry 1 - Title: _______________
Entry 1 - Action: _______________
Entry 2 - Title: _______________
Entry 2 - Action: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-005: Invalid Filename - Missing Segments

**Objective:** Verify that files with missing name segments are rejected.

**Prerequisites:**
- [ ] Flow A enabled
- [ ] Invalid test file ready: model.stl

**Test Steps:**
1. Create new request:
   - Title: Invalid Filename Test
   - Student: Jane Doe
   - Method: Filament
   - Color: Blue
   - File: **model.stl** (invalid - missing FirstLast_Method_Color)
2. Click Save
3. Wait 1 minute
4. Refresh list and check Status
5. Check email inbox

**Expected Result:**
- [ ] Status changed to: **Rejected**
- [ ] NeedsAttention set to: **Yes**
- [ ] LastAction: Rejected
- [ ] LastActionBy: System
- [ ] Rejection email received with:
  - [ ] Subject: "Action needed: rename your 3D print file"
  - [ ] Body explains required format: FirstLast_Method_Color
  - [ ] Examples provided
  - [ ] Accepted file types listed (.stl, .obj, .3mf, .idea, .form)
- [ ] **No confirmation email** sent

**Actual Result:**
```
Status: _______________
NeedsAttention: _______________
Rejection email received: [ ] Yes  [ ] No
Confirmation email received: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-006: Invalid Filename - Wrong Extension

**Objective:** Verify that files with non-approved extensions are rejected.

**Prerequisites:**
- [ ] Flow A enabled
- [ ] Invalid test file: JaneDoe_Filament_Blue.exe

**Test Steps:**
1. Create new request:
   - File: JaneDoe_Filament_Blue.exe (invalid extension)
2. Save and wait
3. Check status and email

**Expected Result:**
- [ ] Request rejected
- [ ] Rejection email sent
- [ ] No confirmation email

**Actual Result:**
```
Status: _______________
Rejection email received: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-007: No Attachments Rejection

**Objective:** Verify that submissions without files are rejected immediately.

**Prerequisites:**
- [ ] Flow A enabled

**Test Steps:**
1. Create new request:
   - Title: No Attachment Test
   - Method: Filament
   - Color: Blue
   - **Do not attach any files**
2. Click Save
3. Wait 1 minute
4. Check status and email

**Expected Result:**
- [ ] Status: Rejected
- [ ] NeedsAttention: Yes
- [ ] Rejection email received:
  - [ ] Subject: "Action needed: attach your 3D print file"
  - [ ] Body explains at least one file required
  - [ ] Lists accepted formats
- [ ] AuditLog entry created with:
  - [ ] Title: "Rejected: No files attached"
  - [ ] FieldName: Attachments

**Actual Result:**
```
Status: _______________
Email received: [ ] Yes  [ ] No
AuditLog entry found: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-008: Empty Filename Segment

**Objective:** Verify rejection of filenames with empty segments (double underscores).

**Prerequisites:**
- [ ] Invalid test file: JaneDoe__Blue.stl (missing Method - double underscore)

**Test Steps:**
1. Create request with file: JaneDoe__Blue.stl
2. Save and verify rejection

**Expected Result:**
- [ ] Request rejected
- [ ] Rejection email explains proper format

**Actual Result:**
```
Status: _______________
Correctly rejected: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-009: Case Insensitive File Extensions

**Objective:** Verify that uppercase extensions are accepted (.STL, .OBJ).

**Prerequisites:**
- [ ] Test file with uppercase extension: JaneDoe_Filament_Blue.STL

**Test Steps:**
1. Create request with file: JaneDoe_Filament_Blue.STL (uppercase .STL)
2. Save and verify acceptance

**Expected Result:**
- [ ] Request accepted (Status: Uploaded)
- [ ] Confirmation email sent
- [ ] Extension case ignored in validation

**Actual Result:**
```
Status: _______________
Email received: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Edge Case Tests

---

#### TEST A-EDGE-001: Multiple Attachments (Mixed Valid/Invalid)

**Objective:** Verify behavior when multiple files are attached with some invalid.

**Prerequisites:**
- [ ] 3 test files ready:
  - JaneDoe_Filament_Blue.stl (valid)
  - JaneDoe_Resin_Clear.obj (valid)
  - model.stl (invalid)

**Test Steps:**
1. Create new request
2. Attach all 3 files simultaneously
3. Save and wait

**Expected Result:**
- [ ] **Request rejected** (any invalid file fails entire submission)
- [ ] Rejection email sent
- [ ] Email mentions the invalid filename: model.stl
- [ ] Valid files are not processed

**Actual Result:**
```
Status: _______________
Rejection email mentions model.stl: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-EDGE-002: Student Name with Hyphen

**Objective:** Verify hyphen removal in display name generation.

**Prerequisites:**
- [ ] Test account or can change display name to: Mary-Jane Smith

**Test Steps:**
1. Create request as Mary-Jane Smith
2. Method: Filament, Color: Blue
3. File: MaryJaneSmith_Filament_Blue.stl
4. Check generated Title

**Expected Result:**
- Title should be: `MaryJaneSmith_Filament_Blue_#####` (hyphen removed)

**Actual Result:**
```
Generated Title: _______________
Hyphen removed: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-EDGE-003: Extremely Long Student Name

**Objective:** Test character limit handling for very long names.

**Prerequisites:**
- [ ] Can create test with long name

**Test Steps:**
1. Create request with student name: Christopher Alexander Montgomery Johnson
2. Check display name generation

**Expected Result:**
- Display name uses first and last name only: `ChristopherJohnson_Filament_Blue_#####`

**Actual Result:**
```
Generated Title: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-EDGE-004: Special Characters in Student Name

**Objective:** Test handling of accented characters (José María).

**Prerequisites:**
- [ ] Test account with accented name

**Test Steps:**
1. Create request as: José María García
2. Check display name

**Expected Result:**
- Characters preserved or simplified: `JoséGarcía_Filament_Blue_#####` or `JoseGarcia_Filament_Blue_#####`
- No errors in flow execution

**Actual Result:**
```
Generated Title: _______________
Flow completed: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST A-EDGE-005: Concurrent Submissions

**Objective:** Test ReqKey uniqueness when multiple requests submitted simultaneously.

**Prerequisites:**
- [ ] Two browser windows open
- [ ] Can create items simultaneously

**Test Steps:**
1. Open PrintRequests in two browser windows
2. Start creating items in both windows at same time
3. Save both within 1-2 seconds of each other
4. Check ReqKey values

**Expected Result:**
- [ ] Both requests get unique ReqKeys
- [ ] No duplicate ReqKeys
- [ ] Sequential numbering maintained

**Actual Result:**
```
Request 1 ReqKey: _______________
Request 2 ReqKey: _______________
Duplicates: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Flow A Test Summary

**Total Tests:** 14 (9 unit tests + 5 edge cases)

**Results:**
```
PASSED: _____ / 14
FAILED: _____ / 14
BLOCKED: _____ / 14
```

**Critical Issues Found:**
_____________________________________________

**Proceed to Flow B Tests:** [ ] Yes  [ ] No (fix issues first)

---

## Flow B Tests (PR-Audit)

### Test Summary

**Flow Name:** `PR-Audit: Log changes + Email notifications`  
**Trigger:** SharePoint - When an item is created or modified (PrintRequests list)  
**Estimated Time:** 45 minutes

### Unit Tests

---

#### TEST B-001: System Update Condition (Skip System Changes)

**Objective:** Verify Flow B skips processing when LastActionBy = System to prevent infinite loops.

**Prerequisites:**
- [ ] Flow A and B both enabled
- [ ] Can view flow run history

**Test Steps:**
1. Create new request (triggers Flow A)
2. Flow A updates item with LastActionBy = System
3. Check run history for both flows

**Expected Result:**
- [ ] Flow A runs and completes
- [ ] Flow B triggers (item modified)
- [ ] Flow B **skips all processing** (System update condition = true)
- [ ] No field change audit entries created by Flow B
- [ ] Only Flow A's audit entries exist

**How to Verify:**
1. Go to Power Automate → Flow Runs
2. Find Flow B run for this item
3. Open run details
4. Check "Skip if System Update" condition
5. Should show: Condition = True (Yes branch is empty, so skipped)

**Actual Result:**
```
Flow A ran: [ ] Yes  [ ] No
Flow B triggered: [ ] Yes  [ ] No
Flow B condition result: _______________
Field change logs created by Flow B: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**⚠️ Critical Test:** If this fails, Flow B will create infinite loops and duplicate audit entries!

---

#### TEST B-002: Status Field Change Detection

**Objective:** Verify that Status field changes are detected and logged.

**Prerequisites:**
- [ ] Existing request with Status = "Uploaded"
- [ ] Flow B enabled

**Test Steps:**
1. Open existing PrintRequests item
2. Change **Status** from "Uploaded" to "Pending"
3. Change **LastActionBy** to a staff member (not System)
4. Save
5. Wait 30 seconds
6. Check AuditLog list

**Expected Result:**
- [ ] One new audit entry created:
  - Title: "Status Change"
  - Action: Status Change
  - FieldName: Status
  - NewValue: Pending
  - Actor Claims: Staff member email
  - ActorRole: Staff
  - FlowRunId: Present

**Actual Result:**
```
Audit entry created: [ ] Yes  [ ] No
FieldName: _______________
NewValue: _______________
ActorRole: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-003: Multiple Fields Changed Simultaneously

**Objective:** Verify that changing multiple fields creates multiple audit entries.

**Prerequisites:**
- [ ] Existing request
- [ ] Flow B enabled

**Test Steps:**
1. Open item in edit mode
2. Change **three fields** simultaneously:
   - Status: Uploaded → Ready to Print
   - Priority: Normal → High
   - Color: Blue → Red
3. Set LastActionBy to staff member
4. Save
5. Wait 1 minute
6. Check AuditLog

**Expected Result:**
- [ ] **Three separate audit entries** created:
  1. Status Change (NewValue: Ready to Print)
  2. Priority Change (NewValue: High)
  3. Color Change (NewValue: Red)
- [ ] All entries have same FlowRunId
- [ ] All entries have correct Actor Claims

**Actual Result:**
```
Number of audit entries created: _______________
Entry 1 - FieldName: _______________
Entry 2 - FieldName: _______________
Entry 3 - FieldName: _______________
Same FlowRunId: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-004: Number Field with Null Value (EstimatedWeight)

**Objective:** Verify null-safe handling for number fields prevents empty audit logs.

**Prerequisites:**
- [ ] Item with EstimatedWeight = blank/null
- [ ] Flow B enabled

**Test Steps:**
1. Open item with null EstimatedWeight
2. Change EstimatedWeight from blank to 250
3. Set LastActionBy to staff
4. Save
5. Check AuditLog entry

**Expected Result:**
- [ ] Audit entry created for EstimatedWeight change
- [ ] **NewValue field populated** with "250" (not empty)
- [ ] Notes field shows: "EstimatedWeight updated to 250"

**⚠️ Important:** This tests the fix for internal field name issue (EstWeight vs EstimatedWeight).

**Actual Result:**
```
NewValue field: _______________ (should show 250, not blank)
Notes field: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-005: Internal Field Names (EstWeight)

**Objective:** Verify that internal field names are used correctly for EstimatedWeight.

**Prerequisites:**
- [ ] Know the difference: Display name "EstimatedWeight" vs Internal name "EstWeight"

**Test Steps:**
1. Create item with EstimatedWeight = 100
2. Change EstimatedWeight to 200
3. Check audit log NewValue

**Expected Result:**
- [ ] NewValue contains "200" (not empty/null)
- [ ] Flow used correct internal name: `EstWeight`

**How This Was Fixed:**
- Flow B uses: `triggerOutputs()?['body/EstWeight']` (internal name)
- NOT: `triggerOutputs()?['body/EstimatedWeight']` (display name)

**Actual Result:**
```
NewValue: _______________ (should be 200)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-006: Rejection Email Automation

**Objective:** Verify that Status = "Rejected" triggers rejection email automatically.

**Prerequisites:**
- [ ] Item with Status = "Uploaded"
- [ ] RejectionReason field populated
- [ ] Can receive email at student account

**Test Steps:**
1. Open existing request
2. Change Status to "Rejected"
3. Select RejectionReason: "Design not printable"
4. Add Notes: "Overhangs too severe"
5. Set LastActionBy to staff member
6. Save
7. Wait 1-2 minutes
8. Check student email inbox

**Expected Result:**
- [ ] Email received from coad-fablab@lsu.edu
- [ ] Subject: "Your 3D Print request has been rejected – REQ-#####"
- [ ] Body includes:
  - [ ] Request details (Title, ReqKey, Method, Printer)
  - [ ] Rejection reason: "Design not printable"
  - [ ] Notes content: "Overhangs too severe"
  - [ ] Next steps guidance
- [ ] AuditLog entry for email sent:
  - [ ] Title: "Email Sent: Rejection"
  - [ ] ActorRole: System

**Actual Result:**
```
Email received: [ ] Yes  [ ] No
Rejection reason in email: _______________
AuditLog email entry: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-007: Pending Email with Cost Estimates

**Objective:** Verify that Status = "Pending" sends estimate email with cost details.

**Prerequisites:**
- [ ] Item with Status = "Uploaded"
- [ ] EstimatedCost = $20.00
- [ ] EstimatedTime (EstHours) = 5 hours
- [ ] Can receive email

**Test Steps:**
1. Open request
2. Set these values:
   - Status: Pending
   - EstimatedCost: 20.00
   - EstHours: 5
   - LastActionBy: Staff member
3. Save
4. Wait 1-2 minutes
5. Check student email

**Expected Result:**
- [ ] Email received from coad-fablab@lsu.edu
- [ ] Subject: "Estimate ready for your 3D print – REQ-#####"
- [ ] Body includes:
  - [ ] Estimated Cost: $20.00
  - [ ] Print Time: 5 hours
  - [ ] Color information
  - [ ] Confirmation instructions with link to "My Requests" view
  - [ ] Warning: "WE WILL NOT RUN YOUR PRINT WITHOUT YOUR CONFIRMATION"
- [ ] Link to My Requests view present

**Actual Result:**
```
Email received: [ ] Yes  [ ] No
Cost shown: _______________
Time shown: _______________
My Requests link present: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-008: Completed Email (Pickup Notification)

**Objective:** Verify that Status = "Completed" sends pickup notification.

**Prerequisites:**
- [ ] Item with Status = "Printing"
- [ ] Can receive email

**Test Steps:**
1. Change Status from "Printing" to "Completed"
2. Set LastActionBy to staff
3. Save
4. Check email

**Expected Result:**
- [ ] Email received
- [ ] Subject: "Your 3D print is ready for pickup – REQ-#####"
- [ ] Body includes:
  - [ ] Pickup location: Room 145 Atkinson Hall
  - [ ] Payment method: TigerCASH only
  - [ ] Lab hours
  - [ ] What to bring (student ID)

**Actual Result:**
```
Email received: [ ] Yes  [ ] No
Location correct: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-009: StudentConfirmed Detection

**Objective:** Verify that toggling StudentConfirmed = Yes updates Status automatically.

**Prerequisites:**
- [ ] Item with Status = "Pending"
- [ ] StudentConfirmed = No
- [ ] Student account access

**Test Steps:**
1. As student user, open "My Requests" view
2. Find request with Status = Pending
3. Change StudentConfirmed from "No" to "Yes"
4. Save
5. Wait 30 seconds
6. Refresh and check Status

**Expected Result:**
- [ ] Status automatically changed to: "Ready to Print"
- [ ] LastAction: "Student Confirmed Estimate"
- [ ] LastActionBy: Student (not System)
- [ ] AuditLog entry created:
  - [ ] Title: "Student Confirmed Estimate via SharePoint"
  - [ ] Action: Estimate Confirmed
  - [ ] ActorRole: Student

**Actual Result:**
```
Status after confirmation: _______________
LastAction: _______________
AuditLog entry created: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**⚠️ Important:** This tests the circular loop prevention (Status = Pending check).

---

#### TEST B-010: RejectionReason Multi-Choice Formatting

**Objective:** Verify that multi-choice RejectionReason field displays correctly in emails.

**Prerequisites:**
- [ ] RejectionReason field is multi-choice (allows multiple selections)
- [ ] Flow B uses Select action with text mode Map

**Test Steps:**
1. Open request
2. Change Status to "Rejected"
3. Select **multiple rejection reasons**:
   - ☑ Design not printable
   - ☑ File size too large
4. Save
5. Check rejection email

**Expected Result:**
- [ ] Email shows readable text: "Design not printable; File size too large"
- [ ] **NOT** JSON objects like: `{"@odata.type":"#Microsoft.Azure..."}`
- [ ] **NOT** key-value pairs like: `{"Design not printable":""}`

**How This Was Fixed:**
- Flow B uses Select action with **text mode Map field**
- Expression: `@item()?['Value']` extracts readable text
- Then joins with semicolons

**Actual Result:**
```
Email rejection reason text: _______________
Format correct: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Edge Case Tests

---

#### TEST B-EDGE-001: Race Condition with Flow A

**Objective:** Verify that Flow B doesn't interfere with Flow A's initial item creation.

**Prerequisites:**
- [ ] Both Flow A and B enabled
- [ ] Can track run history

**Test Steps:**
1. Create new request (triggers Flow A)
2. Flow A updates ReqKey, Title, LastActionBy = System
3. Watch run history closely

**Expected Result:**
- [ ] Flow A completes successfully
- [ ] Flow B triggers but skips processing (LastActionBy = System)
- [ ] No race condition errors
- [ ] Item fields updated correctly by Flow A

**Actual Result:**
```
Flow A completed: [ ] Yes  [ ] No
Flow B triggered: [ ] Yes  [ ] No
Flow B processed: [ ] Yes  [ ] No (should be No)
Race condition errors: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-EDGE-002: Status Change with Null Estimates

**Objective:** Test Pending email when cost estimates are null/empty.

**Prerequisites:**
- [ ] Item with EstimatedCost = null
- [ ] EstHours = null

**Test Steps:**
1. Change Status to "Pending" without filling estimates
2. Check email content

**Expected Result:**
- [ ] Email still sends
- [ ] Cost shows: "TBD" (not blank or error)
- [ ] Time shows: "TBD" (not blank or error)
- [ ] No flow errors

**Actual Result:**
```
Email sent: [ ] Yes  [ ] No
Cost display: _______________
Time display: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-EDGE-003: Circular Loop Prevention (StudentConfirmed)

**Objective:** Verify that confirming estimate twice doesn't create infinite loop.

**Prerequisites:**
- [ ] Item already confirmed (Status = Ready to Print, StudentConfirmed = Yes)

**Test Steps:**
1. Try changing StudentConfirmed from Yes → No → Yes again
2. Check flow run history

**Expected Result:**
- [ ] First confirmation: Status updates to Ready to Print
- [ ] Second confirmation: Flow B triggers but **does not update Status** (condition fails because Status ≠ Pending)
- [ ] No infinite loop
- [ ] Only one status update per confirmation

**Actual Result:**
```
First confirmation updated status: [ ] Yes  [ ] No
Second confirmation skipped: [ ] Yes  [ ] No
Infinite loop: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-EDGE-004: Email Throttling (Multiple Status Changes)

**Objective:** Test rapid status changes don't cause email throttling errors.

**Prerequisites:**
- [ ] Item with Status = Uploaded

**Test Steps:**
1. Change Status: Uploaded → Pending (sends estimate email)
2. Wait 10 seconds
3. Change Status: Pending → Ready to Print
4. Wait 10 seconds
5. Change Status: Ready to Print → Completed (sends pickup email)
6. Check flow run history for errors

**Expected Result:**
- [ ] All status changes processed
- [ ] Estimate email sent (Pending)
- [ ] Pickup email sent (Completed)
- [ ] No "429 Too Many Requests" errors
- [ ] Retry policies handled any transient failures

**Actual Result:**
```
All emails sent: [ ] Yes  [ ] No
Any throttling errors: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST B-EDGE-005: Notes Field with Special Characters

**Objective:** Test Notes field logging with special characters and line breaks.

**Prerequisites:**
- [ ] Item with Notes field

**Test Steps:**
1. Add Notes with special content:
```
Student requested special instructions:
- Use supports on overhangs
- "High quality" print preferred
- Contact at: john@example.com
```
2. Save
3. Check AuditLog entry for Notes change

**Expected Result:**
- [ ] Notes change logged
- [ ] NewValue contains full text
- [ ] Special characters preserved (quotes, dashes, @ symbol)
- [ ] No truncation or encoding errors

**Actual Result:**
```
Notes logged: [ ] Yes  [ ] No
Special chars preserved: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Flow B Test Summary

**Total Tests:** 15 (10 unit tests + 5 edge cases)

**Results:**
```
PASSED: _____ / 15
FAILED: _____ / 15
BLOCKED: _____ / 15
```

**Critical Issues Found:**
_____________________________________________

**Proceed to Flow C Tests:** [ ] Yes  [ ] No

---

## Flow C Tests (PR-Action)

### Test Summary

**Flow Name:** `PR-Action: Log action`  
**Trigger:** Power Apps (Instant cloud flow)  
**Estimated Time:** 20 minutes

### Unit Tests

---

#### TEST C-001: Flow Connection in Power Apps

**Objective:** Verify Flow C appears in Power Apps and can be called.

**Prerequisites:**
- [ ] Power Apps Staff Console open
- [ ] Flow C published and enabled

**Test Steps:**
1. Open Power Apps Studio
2. Go to Data → Power Automate
3. Look for "PR-Action: Log action" in list
4. If not present, click **+ Add flow**
5. Search for and add the flow

**Expected Result:**
- [ ] Flow appears in Power Apps data sources
- [ ] Flow shows as "PR-Action: Log action"
- [ ] Can see `.Run()` method in IntelliSense

**Actual Result:**
```
Flow visible: [ ] Yes  [ ] No
.Run() method available: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-002: Input Validation (Required Parameters)

**Objective:** Verify flow validates required parameters and returns error if missing.

**Prerequisites:**
- [ ] Can call flow from Power Apps or manually test

**Test Steps:**
1. Call flow with **missing ActorEmail** parameter:
```
RequestID: "1"
Action: "Approved"
FieldName: "Status"
OldValue: "Uploaded"
NewValue: "Ready to Print"
ActorEmail: "" (BLANK - required parameter missing)
ClientApp: "Power Apps"
Notes: "Test"
```
2. Check response

**Expected Result:**
- [ ] Flow returns error response
- [ ] Response JSON:
```json
{
  "success": false,
  "message": "Missing required parameters: RequestID, Action, NewValue, or ActorEmail",
  "timestamp": "[timestamp]"
}
```

**Actual Result:**
```
Flow returned error: [ ] Yes  [ ] No
Error message correct: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-003: Successful Action Logging

**Objective:** Verify flow creates audit entry with all fields when parameters are valid.

**Prerequisites:**
- [ ] Existing PrintRequests item (ID: 1)
- [ ] Can call flow manually or from Power Apps

**Test Steps:**
1. Call flow with valid parameters:
```
RequestID: "1"
Action: "Status Change"
FieldName: "Status"
OldValue: "Uploaded"
NewValue: "Ready to Print"
ActorEmail: "staffmember@lsu.edu"
ClientApp: "Power Apps"
Notes: "Approved via dashboard"
```
2. Wait 10 seconds
3. Check AuditLog list
4. Check flow response

**Expected Result:**
- [ ] **Success response received:**
```json
{
  "success": true,
  "message": "Action logged successfully",
  "auditId": "[number]",
  "timestamp": "[timestamp]"
}
```
- [ ] **Audit entry created in AuditLog:**
  - Title: "Staff Action: Status Change"
  - RequestID: 1
  - ReqKey: REQ-00001 (retrieved from PrintRequests)
  - Action: Status Change
  - FieldName: Status
  - OldValue: Uploaded
  - NewValue: Ready to Print
  - Actor Claims: staffmember@lsu.edu
  - ActorRole: Staff
  - ClientApp: Power Apps
  - ActionAt: Present
  - FlowRunId: Present
  - Notes: "Approved via dashboard"

**Actual Result:**
```
Success response: [ ] Yes  [ ] No
auditId returned: _______________
Audit entry created: [ ] Yes  [ ] No
All fields populated: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-004: ReqKey Retrieval

**Objective:** Verify flow correctly retrieves ReqKey from PrintRequests item.

**Prerequisites:**
- [ ] Item with ID 5 and ReqKey = REQ-00005

**Test Steps:**
1. Call flow with RequestID = "5"
2. Check AuditLog entry
3. Verify ReqKey field

**Expected Result:**
- [ ] ReqKey in audit entry matches: REQ-00005
- [ ] ReqKey retrieved from PrintRequests, not provided as parameter

**Actual Result:**
```
ReqKey in AuditLog: _______________
Matches item ReqKey: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-005: Actor Email Resolution

**Objective:** Verify Actor Claims field resolves email to Person field.

**Prerequisites:**
- [ ] Staff member email: staffmember@lsu.edu

**Test Steps:**
1. Call flow with ActorEmail = "staffmember@lsu.edu"
2. Wait 1-2 minutes for SharePoint to resolve
3. Check AuditLog entry
4. Click on Actor Claims field

**Expected Result:**
- [ ] Actor Claims shows as **Person field** (not plain text)
- [ ] Hover shows staff member's display name
- [ ] Can click to see profile card

**Actual Result:**
```
Actor field type: [ ] Person  [ ] Text
Display name shown: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-006: Optional Parameters (Blank Notes)

**Objective:** Verify flow handles optional parameters correctly.

**Prerequisites:**
- [ ] Can call flow

**Test Steps:**
1. Call flow with **Notes parameter blank**:
```
RequestID: "1"
Action: "Priority Changed"
FieldName: "Priority"
OldValue: "Normal"
NewValue: "High"
ActorEmail: "staff@lsu.edu"
ClientApp: "Power Apps"
Notes: "" (BLANK - optional)
```
2. Check audit entry

**Expected Result:**
- [ ] Flow succeeds
- [ ] Notes field auto-generated: "Action performed by staff via Power Apps: Priority Changed"

**Actual Result:**
```
Flow succeeded: [ ] Yes  [ ] No
Notes auto-generated: [ ] Yes  [ ] No
Notes content: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-007: JSON Response Parsing in Power Apps

**Objective:** Verify Power Apps can parse JSON response and access properties.

**Prerequisites:**
- [ ] Power Apps Staff Console open
- [ ] Test button configured to call Flow C

**Test Steps:**
1. Add test button to Power Apps
2. Set OnSelect:
```powerfx
Set(varFlowResult,
    'PR-Action: Log action'.Run(
        Text(1),
        "Test Action",
        "TestField",
        "Old",
        "New",
        User().Email,
        "Power Apps",
        "Test from button"
    )
);
Notify("Success: " & varFlowResult.success & ", Audit ID: " & varFlowResult.auditId)
```
3. Click button
4. Check notification

**Expected Result:**
- [ ] Notification shows: "Success: true, Audit ID: [number]"
- [ ] Can access `varFlowResult.success`
- [ ] Can access `varFlowResult.auditId`
- [ ] Can access `varFlowResult.message`
- [ ] Can access `varFlowResult.timestamp`

**Actual Result:**
```
Notification appeared: [ ] Yes  [ ] No
Properties accessible: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Edge Case Tests

---

#### TEST C-EDGE-001: Invalid RequestID

**Objective:** Test flow behavior when RequestID doesn't exist.

**Prerequisites:**
- [ ] No item with ID 99999

**Test Steps:**
1. Call flow with RequestID = "99999" (non-existent)
2. Check response

**Expected Result:**
- [ ] Flow returns error or handles gracefully
- [ ] No audit entry created
- [ ] Error message indicates item not found

**Actual Result:**
```
Error handled: [ ] Yes  [ ] No
Error message: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-EDGE-002: Long Notes Text (>255 Characters)

**Objective:** Test handling of long text in Notes parameter.

**Prerequisites:**
- [ ] Can call flow

**Test Steps:**
1. Call flow with Notes = 500 character string
2. Check if truncation or error occurs

**Expected Result:**
- [ ] Flow accepts long text
- [ ] Notes field in AuditLog stores full text or truncates gracefully
- [ ] No errors

**Actual Result:**
```
Long text accepted: [ ] Yes  [ ] No
Text truncated: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-EDGE-003: Special Characters in Parameters

**Objective:** Test handling of special characters in field values.

**Prerequisites:**
- [ ] Can call flow

**Test Steps:**
1. Call flow with special characters:
```
Action: "Comment Added: "Check this!""
Notes: "Student said: Can't print—need help & advice"
```
2. Check audit entry

**Expected Result:**
- [ ] Special characters preserved
- [ ] No encoding errors
- [ ] Quotes, ampersands, dashes display correctly

**Actual Result:**
```
Special chars preserved: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-EDGE-004: Concurrent Flow Calls

**Objective:** Test multiple simultaneous calls to Flow C.

**Prerequisites:**
- [ ] Can trigger flow multiple times quickly

**Test Steps:**
1. Call flow 5 times rapidly (within 2 seconds)
2. Check AuditLog
3. Check all responses

**Expected Result:**
- [ ] All 5 calls succeed
- [ ] All 5 audit entries created
- [ ] No race conditions or errors
- [ ] All responses return unique auditId values

**Actual Result:**
```
Calls succeeded: _____ / 5
Audit entries created: _____ / 5
Unique auditIds: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

#### TEST C-EDGE-005: IfError Handling in Power Apps

**Objective:** Test IfError wrapper catches flow failures in Power Apps.

**Prerequisites:**
- [ ] Power Apps with IfError implementation

**Test Steps:**
1. Add button with error handling:
```powerfx
Set(varFlowResult,
    IfError(
        'PR-Action: Log action'.Run(
            Text(99999), // Invalid ID
            "Test",
            "Field",
            "Old",
            "New",
            User().Email,
            "Power Apps",
            "Test"
        ),
        {success: false, message: FirstError.Message}
    )
);
If(varFlowResult.success,
    Notify("Success", NotificationType.Success),
    Notify("Error: " & varFlowResult.message, NotificationType.Error)
)
```
2. Click button
3. Check notification

**Expected Result:**
- [ ] Error caught by IfError
- [ ] Error notification displayed
- [ ] App doesn't crash
- [ ] User-friendly error message shown

**Actual Result:**
```
Error caught: [ ] Yes  [ ] No
Notification showed error: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Flow C Test Summary

**Total Tests:** 12 (7 unit tests + 5 edge cases)

**Results:**
```
PASSED: _____ / 12
FAILED: _____ / 12
BLOCKED: _____ / 12
```

**Critical Issues Found:**
_____________________________________________

**Proceed to Integration Tests:** [ ] Yes  [ ] No

---

## Integration Tests

### Overview

These tests verify that multiple flows work together correctly without conflicts or duplicate entries.

**Estimated Time:** 30 minutes

---

### TEST INT-001: Flow A → Flow B Integration

**Objective:** Verify that creating a new request (Flow A) doesn't cause Flow B to create duplicate audit entries.

**Prerequisites:**
- [ ] Both Flow A and B enabled
- [ ] Can track run history
- [ ] Can view AuditLog

**Test Steps:**
1. Create new request with valid file: JaneDoe_Filament_Blue.stl
2. Wait for flows to complete (1-2 minutes)
3. Check flow run history
4. Check AuditLog entries for this ReqKey

**Expected Result:**

**Flow Execution:**
- [ ] Flow A triggers and completes
- [ ] Flow B triggers after Flow A updates item
- [ ] Flow B **skips processing** (LastActionBy = System)

**Audit Entries (exactly 2):**
1. **"Request Created"** (from Flow A)
   - Action: Created
   - ActorRole: Student
   - ClientApp: SharePoint Form
2. **"Email Sent: Confirmation"** (from Flow A)
   - Action: Email Sent
   - ActorRole: System

**No unwanted entries:**
- [ ] No field change entries from Flow B (Status, ReqKey, Title)
- [ ] No duplicate "Created" entries

**Actual Result:**
```
Flow A ran: [ ] Yes  [ ] No
Flow B triggered: [ ] Yes  [ ] No
Flow B skipped: [ ] Yes  [ ] No
Total audit entries: _______________
Duplicate entries: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST INT-002: Flow C → Flow B Integration (Status Change)

**Objective:** Verify that staff actions via Power Apps (Flow C) and field change detection (Flow B) work together without duplicates.

**Prerequisites:**
- [ ] Flow B and C enabled
- [ ] Existing request (ID: 1)
- [ ] Power Apps access

**Test Steps:**
1. From Power Apps, trigger action that:
   - Calls Flow C with: Action = "Approved", NewValue = "Ready to Print"
   - Updates PrintRequests Status to "Ready to Print"
2. Wait 1 minute
3. Check AuditLog for this request

**Expected Result:**

**Two distinct audit entries created:**

1. **From Flow C** (Staff action):
   - Title: "Staff Action: Approved"
   - Action: Approved
   - FieldName: Status
   - ActorRole: Staff
   - ClientApp: Power Apps
   
2. **From Flow B** (Status change):
   - Title: "Status Change"
   - Action: Status Change
   - FieldName: Status
   - NewValue: Ready to Print
   - ActorRole: Staff
   - ClientApp: SharePoint Form

**Verification:**
- [ ] Both entries exist
- [ ] Different FlowRunIds
- [ ] Both have same NewValue
- [ ] No duplicates
- [ ] Timeline makes sense (Flow C first, then Flow B)

**Actual Result:**
```
Flow C entry created: [ ] Yes  [ ] No
Flow B entry created: [ ] Yes  [ ] No
Total entries: _______________
Duplicates: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST INT-003: Flow B Email → StudentConfirmed → Flow B Update

**Objective:** Test complete estimate confirmation workflow.

**Prerequisites:**
- [ ] Request with Status = Uploaded
- [ ] EstimatedCost and EstHours filled
- [ ] Student account access

**Test Steps:**

**Step 1: Staff approves request**
1. Staff changes Status from "Uploaded" to "Pending"
2. Save

**Step 2: Student receives estimate email**
3. Check student email inbox
4. Verify estimate email received with cost details

**Step 3: Student confirms estimate**
5. Student clicks link in email to "My Requests" view
6. Student changes StudentConfirmed from "No" to "Yes"
7. Save

**Step 4: Verify automatic status update**
8. Check Status field (should auto-update to "Ready to Print")
9. Check AuditLog

**Expected Result:**

**Email Workflow:**
- [ ] Estimate email sent when Status → Pending
- [ ] Email contains confirmation link

**Status Workflow:**
- [ ] StudentConfirmed = Yes + Status = Pending triggers Flow B
- [ ] Status automatically updates to "Ready to Print"
- [ ] LastAction = "Student Confirmed Estimate"
- [ ] LastActionBy = Student (not System)

**Audit Trail (3 entries):**
1. Status Change (Uploaded → Pending) - Staff actor
2. Email Sent: Estimate - System actor
3. Estimate Confirmed (StudentConfirmed detected) - Student actor

**Circular Loop Prevention:**
- [ ] Flow B doesn't re-trigger infinitely
- [ ] Only one status update per confirmation

**Actual Result:**
```
Estimate email received: [ ] Yes  [ ] No
Status auto-updated: [ ] Yes  [ ] No
Final Status: _______________
Audit entries count: _______________
Loop detected: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST INT-004: Multiple Flows with Retry Policies

**Objective:** Verify retry policies don't cause conflicts between flows.

**Prerequisites:**
- [ ] All flows have retry policies configured
- [ ] Can simulate SharePoint slowness (optional)

**Test Steps:**
1. Create new request (Flow A)
2. Immediately change Status (Flow B)
3. Immediately call Flow C
4. All within 10 seconds
5. Check run history for retry attempts

**Expected Result:**
- [ ] All flows complete successfully
- [ ] Retry policies handle any transient conflicts
- [ ] No permanent errors
- [ ] No duplicate audit entries

**Actual Result:**
```
All flows succeeded: [ ] Yes  [ ] No
Retry attempts visible: [ ] Yes  [ ] No
Final state correct: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Integration Test Summary

**Total Tests:** 4

**Results:**
```
PASSED: _____ / 4
FAILED: _____ / 4
BLOCKED: _____ / 4
```

**Critical Issues Found:**
_____________________________________________

---

## Error Scenarios

### Overview

These tests verify error handling and system resilience.

**Estimated Time:** 30 minutes

---

### TEST ERR-001: SharePoint List Temporarily Unavailable

**Objective:** Test flow behavior when SharePoint returns 503 errors.

**Prerequisites:**
- [ ] Cannot easily simulate (optional test)

**Simulation:**
- Temporarily disable SharePoint site (if admin)
- OR review past run history for 503 errors

**Expected Result:**
- [ ] Retry policies trigger (exponential backoff)
- [ ] Flow eventually succeeds after retries
- [ ] OR flow fails gracefully with clear error message
- [ ] No data loss

**Actual Result:**
```
Retry attempts: _______________
Final outcome: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED

---

### TEST ERR-002: Invalid Email Address

**Objective:** Test email sending when student email is invalid.

**Prerequisites:**
- [ ] Can edit StudentEmail field

**Test Steps:**
1. Create request
2. Manually set StudentEmail to "invalid@notarealdomain.xyz"
3. Change Status to Rejected (triggers email)
4. Check flow run history

**Expected Result:**
- [ ] Flow shows error for email action
- [ ] Retry policies attempt to send
- [ ] Eventually fails with clear error
- [ ] AuditLog entry still created (email send failed)
- [ ] Other flow actions complete

**Actual Result:**
```
Email error caught: [ ] Yes  [ ] No
Flow continued: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST ERR-003: Person Field Resolution Failure

**Objective:** Test when actor email doesn't resolve to Person field.

**Prerequisites:**
- [ ] Email address not in SharePoint: external@example.com

**Test Steps:**
1. Call Flow C with ActorEmail = "external@example.com"
2. Check audit entry
3. Check Actor Claims field

**Expected Result:**
- [ ] Audit entry created
- [ ] Actor Claims shows email as text (doesn't resolve to person)
- [ ] No flow errors
- [ ] Action still logged successfully

**Actual Result:**
```
Audit entry created: [ ] Yes  [ ] No
Actor field type: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST ERR-004: Concurrent Item Modification

**Objective:** Test when two staff members edit same item simultaneously.

**Prerequisites:**
- [ ] Two staff accounts

**Test Steps:**
1. Staff A opens item for editing
2. Staff B opens same item for editing
3. Staff A changes Status to "Printing" and saves
4. Staff B changes Priority to "High" and saves
5. Check final item state and audit logs

**Expected Result:**
- [ ] Both changes eventually apply (or one fails with version conflict)
- [ ] Audit logs show both actions
- [ ] SharePoint handles conflict resolution
- [ ] No data corruption

**Actual Result:**
```
Both changes saved: [ ] Yes  [ ] No
Conflict error: [ ] Yes  [ ] No
Audit logs complete: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST ERR-005: Flow Timeout

**Objective:** Test flow behavior if execution exceeds timeout (rare).

**Prerequisites:**
- [ ] Cannot easily simulate

**Simulation:**
- Review past run history for any timeout errors
- OR note expected behavior

**Expected Result:**
- [ ] Timeout errors are rare (flows complete quickly)
- [ ] If timeout occurs, clear error message in run history
- [ ] Retry on next trigger

**Actual Result:**
```
Timeout errors found: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED

---

### TEST ERR-006: Missing Required SharePoint Fields

**Objective:** Test when required fields are null/empty.

**Prerequisites:**
- [ ] Item with Status = null (if possible)

**Test Steps:**
1. Create item with minimal fields
2. Try to trigger flows
3. Check for errors

**Expected Result:**
- [ ] Flows handle nulls gracefully
- [ ] Null-safe expressions prevent errors
- [ ] No flow failures

**Actual Result:**
```
Null values handled: [ ] Yes  [ ] No
Flow errors: [ ] Yes  [ ] No (should be No)
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST ERR-007: Shared Mailbox Permission Issues

**Objective:** Test when flow owner loses "Send As" permission.

**Prerequisites:**
- [ ] Can temporarily revoke permission (admin)

**Test Steps:**
1. Remove "Send As" permission from flow owner
2. Trigger email flow
3. Check error

**Expected Result:**
- [ ] Email action fails with permission error
- [ ] Error message clear: "Insufficient permissions"
- [ ] Retry policies eventually fail
- [ ] Other flow actions complete

**Actual Result:**
```
Permission error caught: [ ] Yes  [ ] No
Error message clear: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED

---

### TEST ERR-008: Item Deleted During Flow Execution

**Objective:** Test flow behavior if item is deleted mid-execution.

**Prerequisites:**
- [ ] Fast reflexes or two users

**Test Steps:**
1. Create item (starts Flow A)
2. Immediately delete item from SharePoint
3. Check Flow A run history

**Expected Result:**
- [ ] Flow shows error: "Item not found" or "404"
- [ ] Error handled gracefully
- [ ] No orphaned audit entries (or audit entry shows item ID only)

**Actual Result:**
```
Error handled: [ ] Yes  [ ] No
Error type: _______________
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### TEST ERR-009: Choice Field Invalid Value

**Objective:** Test when Status is set to value not in allowed list.

**Prerequisites:**
- [ ] Can use Power Apps or API to set invalid value

**Test Steps:**
1. Attempt to set Status = "InvalidStatus" (not in list)
2. Check SharePoint validation

**Expected Result:**
- [ ] SharePoint rejects invalid choice value
- [ ] Cannot save item with invalid value
- [ ] Flow doesn't process invalid data

**Actual Result:**
```
Invalid value rejected: [ ] Yes  [ ] No
```

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

---

### Error Scenarios Test Summary

**Total Tests:** 9

**Results:**
```
PASSED: _____ / 9
FAILED: _____ / 9
BLOCKED: _____ / 9
SKIPPED: _____ / 9
```

**Critical Issues Found:**
_____________________________________________

---

## Regression Test Suite

### Overview

Quick validation tests to run after making changes to flows. Covers critical paths only.

**Estimated Time:** 15 minutes  
**When to Run:** After any flow edits, before deploying to production

---

### REGRESSION-001: Happy Path - Complete Workflow

**Objective:** End-to-end happy path validation.

**Quick Steps:**
1. ✓ Create request with valid file (Flow A)
2. ✓ Verify ReqKey generated
3. ✓ Verify confirmation email received
4. ✓ Change Status to Rejected (Flow B)
5. ✓ Verify rejection email received
6. ✓ Change Priority field (Flow B)
7. ✓ Verify field change logged
8. ✓ Call Flow C from Power Apps
9. ✓ Verify audit entry created

**Expected:** All steps complete successfully with correct audit trail.

**Status:** [ ] PASS  [ ] FAIL

---

### REGRESSION-002: Filename Validation

**Quick Steps:**
1. ✓ Submit with valid filename → Accepted
2. ✓ Submit with invalid filename → Rejected
3. ✓ Submit with no file → Rejected

**Expected:** Validation logic works correctly.

**Status:** [ ] PASS  [ ] FAIL

---

### REGRESSION-003: System Update Condition

**Quick Steps:**
1. ✓ Create new request (Flow A updates with LastActionBy = System)
2. ✓ Verify Flow B triggers but skips processing
3. ✓ No duplicate audit entries

**Expected:** System condition prevents infinite loops.

**Status:** [ ] PASS  [ ] FAIL

---

### REGRESSION-004: Email Notifications

**Quick Steps:**
1. ✓ Status → Rejected: Email sent
2. ✓ Status → Pending: Email sent with estimates
3. ✓ Status → Completed: Email sent with pickup info

**Expected:** All automated emails send correctly.

**Status:** [ ] PASS  [ ] FAIL

---

### REGRESSION-005: Student Estimate Confirmation

**Quick Steps:**
1. ✓ Status = Pending, StudentConfirmed = No
2. ✓ Change StudentConfirmed to Yes
3. ✓ Status auto-updates to Ready to Print
4. ✓ No infinite loop

**Expected:** Confirmation workflow works end-to-end.

**Status:** [ ] PASS  [ ] FAIL

---

### Regression Summary

**Results:**
```
PASSED: _____ / 5
FAILED: _____ / 5
```

**Ready for Production:** [ ] Yes  [ ] No

---

## Test Result Template

Use this template for detailed test tracking (copy to spreadsheet):

| Test ID | Test Name | Date | Tester | Status | Flow Run ID | Notes | Screenshot |
|---------|-----------|------|--------|--------|-------------|-------|------------|
| A-001 | ReqKey Generation | | | | | | |
| A-002 | Display Name | | | | | | |
| A-003 | Confirmation Email | | | | | | |
| ... | ... | | | | | | |

**Status Values:** PASS / FAIL / BLOCKED / SKIPPED

---

## Troubleshooting Guide

### Common Issues and Solutions

---

#### Issue: Flow B Not Creating Audit Entries

**Symptoms:**
- Flow B appears in run history with green checkmarks
- No field change entries in AuditLog

**Possible Causes:**
1. **System Update Condition Bug**
   - Check condition: `Skip if System Update`
   - Should be: `triggerOutputs()?['body/LastActionBy']` equals `System`
   - NOT: Double equals or wrong syntax

2. **Internal Field Names Wrong**
   - Verify: EstimatedWeight uses `EstWeight` (internal name)
   - Verify: EstimatedTime uses `EstHours` (internal name)
   - Check: SharePoint List Settings → Column → URL Field parameter

**Fix:**
1. Open Flow B in edit mode
2. Check "Skip if System Update" condition syntax
3. Verify all field expressions use correct internal names
4. Save and test again

---

#### Issue: Duplicate Audit Entries

**Symptoms:**
- Multiple identical entries for single change
- "Request Created" appears multiple times

**Possible Causes:**
1. Flow B processing System updates (condition not working)
2. Flow A and B both logging same action

**Fix:**
1. Verify System update condition in Flow B (see above)
2. Check LastActionBy field is set correctly
3. Ensure Flow A sets LastActionBy = System

---

#### Issue: Emails Not Sending

**Symptoms:**
- Flow completes but no email received
- Email action shows error in run history

**Possible Causes:**
1. Shared mailbox permission missing
2. Invalid recipient email
3. Email throttling

**Fix:**
1. Verify "Send As" permission for coad-fablab@lsu.edu
2. Check StudentEmail field is populated and valid
3. Review retry policy logs
4. Check spam/junk folder

---

#### Issue: RejectionReason Shows JSON in Email

**Symptoms:**
- Email shows: `{"@odata.type":"#Microsoft.Azure..."}`
- Or shows: `{"Design not printable":""}`

**Root Cause:**
- Multi-choice field not formatted correctly

**Fix:**
1. Open Flow B → Find rejection email section
2. Before "Send Rejection Email", add:
   - **Select** action: `Format Rejection Reasons`
   - From: `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']`
   - Map: **Switch to text mode** → Type `@item()?['Value']`
3. Add **Compose** action: `join(body('Format_Rejection_Reasons'), '; ')`
4. Update email body to use Compose output
5. Save and test

---

#### Issue: EstimatedWeight Shows Empty in Audit Log

**Symptoms:**
- NewValue field blank when EstimatedWeight changed
- Notes says "EstimatedWeight updated to empty"

**Root Cause:**
- Using display name instead of internal name

**Fix:**
1. Open Flow B → Find "Log EstimatedWeight Change" action
2. Update NewValue expression:
   - Change: `triggerOutputs()?['body/EstimatedWeight']`
   - To: `triggerOutputs()?['body/EstWeight']` (internal name)
3. Add null-safe handling:
   ```
   if(equals(triggerOutputs()?['body/EstWeight'], null), '', string(triggerOutputs()?['body/EstWeight']))
   ```
4. Save and test

---

#### Issue: Flow C Not Appearing in Power Apps

**Symptoms:**
- Can't find flow in Power Apps data sources
- .Run() method not available

**Fix:**
1. Verify flow is published and enabled
2. Power Apps Studio → Data → Refresh
3. Click **+ Add data** → Power Automate → Search for flow
4. If still missing, check flow owner has shared with app users
5. Verify trigger type is "Power Apps" (not SharePoint)

---

#### Issue: Infinite Loop (StudentConfirmed)

**Symptoms:**
- Status keeps changing repeatedly
- Flow B running continuously

**Root Cause:**
- Missing compound condition check

**Fix:**
1. Open Flow B → Find StudentConfirmed detection
2. Verify compound condition:
   - Row 1: StudentConfirmed = true
   - **AND** (not OR)
   - Row 2: Status = Pending
3. This prevents re-processing when Status already = Ready to Print

---

### Flow Checker Usage

**To validate flows for errors:**

1. Open flow in edit mode
2. Top right → Click **Flow checker** icon
3. Review:
   - **Errors** (red): Must fix before flow works
   - **Warnings** (yellow): Best practice recommendations
4. Click each issue for details and fix guidance
5. Save after fixing

**Common Flow Checker Warnings:**
- "Missing inputs" - Parameters not provided
- "Action timeout" - Configure retry policy
- "Concurrency control" - Enable for ordered processing

---

### Helpful Flow Run History Tips

**To debug failed flows:**

1. Power Automate → My flows → Flow name
2. Click **28-day run history**
3. Find failed run (red X icon)
4. Click run to open details
5. Each action shows:
   - **Inputs** - What data was provided
   - **Outputs** - What data was produced
   - **Duration** - How long it took
6. Look for:
   - Skipped actions (grey)
   - Failed actions (red X)
   - Error messages in outputs

**Copy Flow Run ID for Reference:**
- Run history → Click run → URL contains run ID
- Example: `/runs/08586653536760461208`
- Store this with test results for traceability

---

### SharePoint Internal Field Names Reference

When building flow expressions, use these internal names:

| Display Name | Internal Name | Type |
|--------------|---------------|------|
| EstimatedWeight | EstWeight | Number |
| EstimatedTime | EstHours | Number |
| EstimatedCost | EstimatedCost | Currency |
| Status | Status | Choice |
| Method | Method | Choice |
| Color | Color | Choice |
| Priority | Priority | Choice |
| Printer | Printer | Choice |
| Notes | Notes | Multiple lines |
| Student | Student | Person |
| LastActionBy | LastActionBy | Single line text |

**How to Find Internal Names:**
1. SharePoint → PrintRequests → Settings → List settings
2. Under Columns, click field name
3. Look at URL: `Field=InternalName`

---

### Testing Best Practices (Microsoft Guidance)

Based on Power Automate documentation:

✅ **Test early** - Use Flow Checker during development  
✅ **Test manually** - Verify basic functionality before automation  
✅ **Use Test pane** - Built-in testing in flow designer  
✅ **Check run history** - Review execution details  
✅ **Test error paths** - Don't just test happy paths  
✅ **Monitor performance** - Watch for slow actions  
✅ **Document results** - Keep test evidence  
✅ **Test with real data** - Use actual student/staff accounts

---

## Appendix: Quick Reference

### SharePoint URLs

- **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **PrintRequests List:** `/Lists/PrintRequests`
- **AuditLog List:** `/Lists/AuditLog`
- **My Requests View:** `/Lists/PrintRequests/My%20Requests.aspx`

### Flow Documentation Links

- [Flow A (PR-Create): Set ReqKey + Acknowledge](./PR-Create_SetReqKey_Acknowledge.md)
- [Flow B (PR-Audit): Log changes + Email notifications](./PR-Audit_LogChanges_EmailNotifications.md)
- [Flow C (PR-Action): Log action](./PR-Action_LogAction.md)

### Key Expressions Reference

**ReqKey Generation:**
```
concat('REQ-', formatNumber(triggerOutputs()?['body/ID'], '00000'))
```

**System Update Check:**
```
triggerOutputs()?['body/LastActionBy'] equals System
```

**Null-Safe Number Field:**
```
if(equals(triggerOutputs()?['body/EstWeight'], null), '', string(triggerOutputs()?['body/EstWeight']))
```

**Multi-Choice Formatting:**
```
Map field (text mode): @item()?['Value']
Join: join(body('Format_Action'), '; ')
```

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-13 | System | Initial comprehensive test guide created |

---

**End of Testing Guide**

For questions or issues, refer to individual flow documentation or contact the system administrator.

