# PR-Create Flow Testing Checklist

**Purpose:** Comprehensive test suite for validating the PR-Create: Set ReqKey + Acknowledge Power Automate flow.

**Flow Under Test:** `PR-Create: Set ReqKey + Acknowledge`

---

## Test Files to Create

### ✅ Valid Files (Should Pass)
Create these files with any content - filename format is FirstLast_Method_Color + valid extension:

- [x] `JohnSmith_Filament_Red.stl`
- [x] `MaryJones_Resin_Clear.obj`
- [x] `BobWilson_Filament_Blue.3mf`

### ❌ Invalid Format Files (Should Reject)
Create these files to test filename validation:

- [x] `wrongformat.stl` (no underscores)
- [x] `John_Smith_Red_Extra.stl` (too many parts)
- [x] `JohnSmith_Filament.stl` (missing color)


### ❌ Invalid Extension Files (Should Reject)
Create these files to test file type validation:

- [ ] `JohnSmith_Filament_Red.pdf`


---

## Test Scenarios

### Test 1: No Files Attached
- [ ] **Action:** Submit form with no files attached
- [ ] **Expected:** Rejection email about missing files
- [ ] **Expected:** Status = "Rejected"
- [ ] **Expected:** Flow terminates (Cancelled)

### Test 2: Single Valid File
- [ ] **Action:** Submit form with `JohnSmith_Filament_Red.stl`
- [ ] **Expected:** Confirmation email received
- [ ] **Expected:** Status = "Uploaded"
- [ ] **Expected:** ReqKey generated (REQ-00001 format)
- [ ] **Expected:** Flow completes successfully

### Test 3: Multiple Valid Files
- [ ] **Action:** Submit form with `JohnSmith_Filament_Red.stl` + `MaryJones_Resin_Clear.obj`
- [ ] **Expected:** Single confirmation email (not per file)
- [ ] **Expected:** Status = "Uploaded"
- [ ] **Expected:** Flow completes successfully

### Test 4: Single Invalid Format
- [ ] **Action:** Submit form with `wrongformat.stl`
- [ ] **Expected:** Rejection email about filename format
- [ ] **Expected:** Status = "Rejected"
- [ ] **Expected:** Flow terminates (Cancelled)

### Test 5: Single Invalid Extension
- [ ] **Action:** Submit form with `JohnSmith_Filament_Red.pdf`
- [ ] **Expected:** Rejection email about filename format
- [ ] **Expected:** Status = "Rejected"
- [ ] **Expected:** Flow terminates (Cancelled)

### Test 6: Mixed Valid + Invalid Files
- [ ] **Action:** Submit form with `JohnSmith_Filament_Red.stl` + `wrongformat.stl`
- [ ] **Expected:** Rejection email (invalid file found)
- [ ] **Expected:** Status = "Rejected"
- [ ] **Expected:** Flow terminates (Cancelled)

### Test 7: Spaces in Filename
- [ ] **Action:** Submit form with `John Smith_Filament_Red.stl`
- [ ] **Expected:** Rejection email about filename format
- [ ] **Expected:** Status = "Rejected"
- [ ] **Expected:** Flow terminates (Cancelled)

### Test 8: Missing Parts in Filename
- [ ] **Action:** Submit form with `JohnSmith_Filament.stl`
- [ ] **Expected:** Rejection email about filename format
- [ ] **Expected:** Status = "Rejected"
- [ ] **Expected:** Flow terminates (Cancelled)

---

## Validation Checklist

### For Valid File Tests (Tests 2-3):
- [ ] **ReqKey:** Generated in format "REQ-00001"
- [ ] **Title:** Updated with standardized display name
- [ ] **Status:** Set to "Uploaded"
- [ ] **NeedsAttention:** Set to "Yes"
- [ ] **Email:** Confirmation email received with request details
- [ ] **AuditLog:** 2 entries created (Request Created + Email Sent)
- [ ] **Flow Status:** Completed successfully

### For Invalid File Tests (Tests 1, 4-8):
- [ ] **Status:** Set to "Rejected"
- [ ] **NeedsAttention:** Set to "Yes"
- [ ] **Email:** Rejection email received with policy reminder
- [ ] **AuditLog:** 1 entry created (Rejected)
- [ ] **Flow Status:** Terminated (Cancelled)
- [ ] **No Confirmation:** No confirmation email sent

---

## Quick File Creation Script

```powershell
# Create test directory
New-Item -ItemType Directory -Path "C:\3DPrintTests" -Force

# Valid files
$validFiles = @("JohnSmith_Filament_Red.stl", "MaryJones_Resin_Clear.obj", "BobWilson_Filament_Blue.3mf", "SarahDavis_Resin_Black.idea", "MikeBrown_Filament_Green.form")

# Invalid files
$invalidFiles = @("wrongformat.stl", "John_Smith_Red_Extra.stl", "JohnSmith_Filament.stl", "JohnSmith__Red.stl", "John Smith_Filament_Red.stl", "JohnSmith-Filament-Red.stl", "JohnSmith_Filament_Red.pdf", "JohnSmith_Filament_Red.docx", "JohnSmith_Filament_Red.jpg")

# Create all test files
($validFiles + $invalidFiles) | ForEach-Object {
    "Test content" | Out-File -FilePath "C:\3DPrintTests\$_"
}

Write-Host "Created $(($validFiles + $invalidFiles).Count) test files in C:\3DPrintTests\"
```

---

## Testing Summary

**Total Test Cases:** 8 scenarios
**Total Test Files:** 14 files
**Expected Pass:** 2 scenarios (Tests 2-3)
**Expected Fail:** 6 scenarios (Tests 1, 4-8)

**Testing Goal:** Verify all validation paths work correctly and no invalid submissions reach the confirmation stage.
