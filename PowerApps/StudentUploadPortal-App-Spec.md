# Student Upload Portal - Implementation Specification

**Purpose:** Allow students to upload replacement or additional files to their existing print requests without accessing the internal staff dashboard.  
**Estimated Build Time:** 4-6 hours  
**Dependencies:** `FileUploads` list, `PrintRequests` list, `AuditLog` list, Flow F, Flow G

---

## Implementation Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| File archiving | Delete existing files (no archive) | Simplifies Flow H |
| Staff notification | Dashboard only (NeedsAttention flag) | No email notification |
| Student access | Direct app link shared separately | Not embedded in emails |

---

## Overview

Students sometimes need to update their files after initial submission (design revisions, wrong file uploaded, staff requested changes). Currently, this requires staff intervention or a new submission.

The Student Upload Portal provides a **separate, student-facing Power App** where students can:
1. Look up their existing request by email + ReqKey
2. Upload replacement or additional files
3. NOT modify any other job properties

Staff see uploads via NeedsAttention flag on the dashboard, and all activity is logged.

---

## Architecture

```
Student opens Upload Portal (direct link)
        ↓
Enter Email + ReqKey
        ↓
Flow F validates request exists
  └── Email matches StudentEmail?
  └── Status not Archived/Rejected?
        ↓ Valid
Show upload interface
        ↓
Student selects: Replacement or Additional
        ↓
Student attaches files
        ↓
Submit creates FileUploads entry
        ↓
Flow G processes upload
  └── Validates file format
  └── If Replacement: deletes existing files
  └── Copies files to PrintRequest
  └── Sets NeedsAttention = Yes
  └── Logs to AuditLog
        ↓
Student sees success confirmation
```

---

## SharePoint Components

### New List: `FileUploads`

**Purpose:** Queue for processing student file uploads before moving to PrintRequests

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| Title | Single line | Yes | Auto | Auto-generated identifier |
| StudentEmail | Single line | Yes | - | Submitting student's email |
| RequestID | Number | Yes | - | Links to PrintRequests.ID |
| ReqKey | Single line | Yes | - | Request identifier (REQ-00001) |
| UploadType | Choice | Yes | - | "Replacement" or "Additional" |
| Status | Choice | Yes | Pending | "Pending", "Processed", "Failed" |
| ProcessedAt | DateTime | No | - | When files were moved |
| ProcessedBy | Single line | No | - | "System" or staff name |
| Notes | Multiple lines | No | - | Student's notes about the upload |
| ErrorMessage | Multiple lines | No | - | Error details if processing failed |

**Choice Values:**
- **UploadType:** Replacement, Additional
- **Status:** Pending, Processed, Failed

**Attachments:** Enabled (students attach files to this list item)

---

### Views for FileUploads

**View 1: Pending Uploads**
- Filter: Status = Pending
- Sort: Created (Descending)
- Columns: ReqKey, StudentEmail, UploadType, Created

**View 2: All Uploads**
- No filter
- Sort: Created (Descending)
- Columns: ReqKey, StudentEmail, UploadType, Status, ProcessedAt

---

## Power Apps: Student Upload Portal

### App Type
- **Canvas App** (Phone layout for mobile access)
- **Separate app from Staff Dashboard** (different permissions)

---

### Step-by-Step Build Guide

#### Step 1: Create the App

1. Go to **Power Apps** → **Create** → **Canvas app from blank**
2. **App name:** `Student Upload Portal`
3. **Format:** **Phone** (for mobile-friendly layout)
4. Click **Create**

---

#### Step 2: Add Data Sources

1. Click **Data** in the left panel
2. Click **+ Add data**
3. Search for **SharePoint** → Connect to your site
4. Add list: `FileUploads`
5. Click **Add data** again → Search for **Power Automate**
6. Find and add: `Flow F (PR-ValidateUpload)` or your flow name

> **Note:** Flow F must be published and you must have run access to see it in Power Apps.

---

#### Step 3: Configure App.OnStart

1. Click on **App** in the Tree view (left panel)
2. Select **OnStart** property in the formula bar
3. Paste this code:

```powerfx
// Initialize global variables
Set(varErrorMessage, "");
Set(varIsLoading, false);
Set(varRequestData, Blank());
Set(varUploadedItem, Blank());
Set(varFileCount, 0);

// Define upload type options for radio buttons
ClearCollect(
    colUploadTypes,
    {Value: "Replacement", Label: "Replace existing files (deletes old files)"},
    {Value: "Additional", Label: "Add more files (keeps existing files)"}
);
```

4. Click **Run OnStart** (three dots → Run OnStart) to initialize

---

### Screens

#### Screen 1: Request Lookup (`scrLookup`)

**Purpose:** Student enters credentials to find their request

##### Create the Screen

1. Rename **Screen1** to `scrLookup`
2. Set **Fill** property: `RGBA(250, 250, 250, 1)` (light gray background)

##### Add Controls

**Header Section:**

1. Insert **Label** → Rename to `lblTitle`
   - **Text:** `"Upload Files to Your Print Request"`
   - **Font size:** 24
   - **Font weight:** Bold
   - **Align:** Center
   - **Position:** X=0, Y=40, Width=640, Height=60

2. Insert **Label** → Rename to `lblInstructions`
   - **Text:** `"Enter your LSU email and Request ID to upload new files."`
   - **Font size:** 14
   - **Align:** Center
   - **Position:** X=20, Y=110, Width=600, Height=40

**Input Fields:**

3. Insert **Label** → Rename to `lblEmailLabel`
   - **Text:** `"Your LSU Email:"`
   - **Position:** X=20, Y=180

4. Insert **Text input** → Rename to `txtEmail`
   - **Default:** `""`
   - **Hint text:** `"your.name@lsu.edu"`
   - **Position:** X=20, Y=210, Width=600, Height=50
   - **Border radius:** 8

5. Insert **Label** → Rename to `lblReqKeyLabel`
   - **Text:** `"Request ID:"`
   - **Position:** X=20, Y=280

6. Insert **Text input** → Rename to `txtReqKey`
   - **Default:** `""`
   - **Hint text:** `"REQ-00001"`
   - **Position:** X=20, Y=310, Width=600, Height=50
   - **Border radius:** 8

**Button and Messages:**

7. Insert **Button** → Rename to `btnLookup`
   - **Text:** `If(varIsLoading, "Searching...", "Find My Request")`
   - **Position:** X=20, Y=400, Width=600, Height=50
   - **Fill:** `RGBA(70, 29, 124, 1)` (LSU purple)
   - **Color:** White
   - **Border radius:** 8
   - **DisplayMode:** 
```powerfx
If(
    varIsLoading || IsBlank(txtEmail.Text) || IsBlank(txtReqKey.Text),
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```
   - **OnSelect:**
```powerfx
// Clear previous state
Set(varErrorMessage, "");
Set(varIsLoading, true);

// Validate input format
If(
    !EndsWith(Lower(txtEmail.Text), "@lsu.edu"),
    Set(varErrorMessage, "Please enter a valid LSU email address.");
    Set(varIsLoading, false);
    Return()
);

If(
    !StartsWith(Upper(txtReqKey.Text), "REQ-") || Len(txtReqKey.Text) < 9,
    Set(varErrorMessage, "Request ID must be in format REQ-00001");
    Set(varIsLoading, false);
    Return()
);

// Call Flow F to validate
Set(
    varValidationResult, 
    'PR-ValidateUpload'.Run(
        Lower(txtEmail.Text),
        Upper(txtReqKey.Text)
    )
);

Set(varIsLoading, false);

// Check result
If(
    varValidationResult.IsValid,
    // Parse JSON and navigate
    Set(varRequestData, ParseJSON(varValidationResult.RequestData));
    Navigate(scrUpload, ScreenTransition.Fade),
    // Show error message
    Set(varErrorMessage, varValidationResult.ErrorMessage)
)
```

8. Insert **Label** → Rename to `lblError`
   - **Text:** `varErrorMessage`
   - **Color:** `RGBA(200, 0, 0, 1)` (red)
   - **Visible:** `!IsBlank(varErrorMessage)`
   - **Position:** X=20, Y=470, Width=600, Height=60
   - **Align:** Center

9. Insert **Label** → Rename to `lblHelp`
   - **Text:** `"Your Request ID was sent in your confirmation email (REQ-00001 format)."`
   - **Font size:** 12
   - **Color:** Gray
   - **Position:** X=20, Y=540, Width=600
   - **Align:** Center

---

#### Screen 2: File Upload (`scrUpload`)

**Purpose:** Student uploads files with upload type selection

##### Create the Screen

1. Insert **New screen** → **Blank**
2. Rename to `scrUpload`
3. Set **Fill:** `RGBA(250, 250, 250, 1)`

##### Add Controls

**Header Section:**

1. Insert **Label** → Rename to `lblRequestInfo`
   - **Text:** `"Uploading to: " & Text(varRequestData.ReqKey)`
   - **Font size:** 20
   - **Font weight:** Bold
   - **Position:** X=20, Y=40

2. Insert **Label** → Rename to `lblCurrentStatus`
   - **Text:** `"Current Status: " & Text(varRequestData.Status)`
   - **Font size:** 14
   - **Color:** Gray
   - **Position:** X=20, Y=80

**Upload Type Selection:**

3. Insert **Label** → Rename to `lblUploadTypeLabel`
   - **Text:** `"What are you uploading?"`
   - **Font weight:** Semibold
   - **Position:** X=20, Y=130

4. Insert **Radio** → Rename to `rdoUploadType`
   - **Items:** `colUploadTypes`
   - **Default:** `First(colUploadTypes)`
   - **Layout:** Vertical
   - **Position:** X=20, Y=160, Width=600, Height=100

**File Attachment Form:**

5. Insert **Label** → Rename to `lblFilesLabel`
   - **Text:** `"Select Files (.stl, .obj, .3mf, .idea, .form):"`
   - **Font weight:** Semibold
   - **Position:** X=20, Y=280

6. Insert **Edit form** → Rename to `frmFileUpload`
   - **DataSource:** `FileUploads`
   - **DefaultMode:** `FormMode.New`
   - **Position:** X=20, Y=310, Width=600, Height=180
   - In the **Fields** panel, remove all fields except **Attachments**
   - Set the form **Item:** `varUploadedItem`

**Notes Field:**

7. Insert **Label** → Rename to `lblNotesLabel`
   - **Text:** `"Notes (optional):"`
   - **Position:** X=20, Y=500

8. Insert **Text input** → Rename to `txtNotes`
   - **Mode:** Multiline
   - **Hint text:** `"Explain what changed..."`
   - **Position:** X=20, Y=530, Width=600, Height=80
   - **Border radius:** 8

**Action Buttons:**

9. Insert **Button** → Rename to `btnSubmit`
   - **Text:** `If(varIsLoading, "Submitting...", "Submit Files")`
   - **Position:** X=20, Y=640, Width=290, Height=50
   - **Fill:** `RGBA(70, 29, 124, 1)` (LSU purple)
   - **Color:** White
   - **Border radius:** 8
   - **DisplayMode:** `If(varIsLoading, DisplayMode.Disabled, DisplayMode.Edit)`
   - **OnSelect:**
```powerfx
// Check for attachments
If(
    IsEmpty(frmFileUpload.Updates.Attachments),
    Notify("Please attach at least one file", NotificationType.Error);
    Return()
);

Set(varIsLoading, true);

// Store file count for confirmation screen
Set(varFileCount, CountRows(frmFileUpload.Updates.Attachments));

// Create FileUploads entry first
Set(
    varUploadedItem,
    Patch(
        FileUploads,
        Defaults(FileUploads),
        {
            Title: "Upload-" & Text(Now(), "yyyyMMdd-HHmmss"),
            StudentEmail: Text(varRequestData.StudentEmail),
            RequestID: Value(varRequestData.ID),
            ReqKey: Text(varRequestData.ReqKey),
            UploadType: {Value: rdoUploadType.Selected.Value},
            Status: {Value: "Pending"},
            Notes: txtNotes.Text
        }
    )
);

// Now submit the form to attach files to the created item
SubmitForm(frmFileUpload);
```

10. Set `frmFileUpload.OnSuccess`:
```powerfx
Set(varIsLoading, false);
Navigate(scrConfirmation, ScreenTransition.Fade)
```

11. Set `frmFileUpload.OnFailure`:
```powerfx
Set(varIsLoading, false);
Notify("Failed to upload files. Please try again.", NotificationType.Error)
```

12. Insert **Button** → Rename to `btnCancel`
    - **Text:** `"Cancel"`
    - **Position:** X=330, Y=640, Width=290, Height=50
    - **Fill:** `RGBA(200, 200, 200, 1)` (gray)
    - **Color:** Black
    - **Border radius:** 8
    - **OnSelect:**
```powerfx
ResetForm(frmFileUpload);
Set(varRequestData, Blank());
Navigate(scrLookup, ScreenTransition.Fade)
```

---

#### Screen 3: Confirmation (`scrConfirmation`)

**Purpose:** Success message after upload

##### Create the Screen

1. Insert **New screen** → **Blank**
2. Rename to `scrConfirmation`
3. Set **Fill:** `RGBA(250, 250, 250, 1)`

##### Add Controls

1. Insert **Icon** → **Check** → Rename to `icoSuccess`
   - **Color:** `RGBA(16, 124, 16, 1)` (green)
   - **Position:** X=270, Y=60, Width=100, Height=100

2. Insert **Label** → Rename to `lblSuccessTitle`
   - **Text:** `"Files Uploaded Successfully!"`
   - **Font size:** 24
   - **Font weight:** Bold
   - **Align:** Center
   - **Position:** X=0, Y=180, Width=640, Height=50

3. Insert **Label** → Rename to `lblSuccessMessage`
   - **Text:** `"Your files have been submitted for processing."`
   - **Font size:** 16
   - **Align:** Center
   - **Position:** X=20, Y=240, Width=600, Height=40

4. Insert **Label** → Rename to `lblSummary`
   - **Text:** 
```powerfx
"Request: " & Text(varRequestData.ReqKey) & "
Upload Type: " & rdoUploadType.Selected.Value & "
Files: " & varFileCount & " file(s)"
```
   - **Font size:** 14
   - **Align:** Center
   - **Position:** X=20, Y=300, Width=600, Height=80

5. Insert **Label** → Rename to `lblNextSteps`
   - **Text:**
```
"WHAT HAPPENS NEXT:
• Staff will review your new files
• You'll receive an email confirmation shortly
• Check your request status in SharePoint

Questions? Contact coad-fablab@lsu.edu"
```
   - **Font size:** 14
   - **Align:** Center
   - **Position:** X=20, Y=400, Width=600, Height=150

6. Insert **Button** → Rename to `btnNewUpload`
   - **Text:** `"Upload More Files"`
   - **Position:** X=120, Y=580, Width=400, Height=50
   - **Fill:** `RGBA(70, 29, 124, 1)`
   - **Color:** White
   - **Border radius:** 8
   - **OnSelect:**
```powerfx
// Reset everything for new upload
Set(varRequestData, Blank());
Set(varUploadedItem, Blank());
Set(varErrorMessage, "");
Set(varFileCount, 0);
ResetForm(frmFileUpload);
Reset(txtEmail);
Reset(txtReqKey);
Reset(txtNotes);
Navigate(scrLookup, ScreenTransition.Fade)
```

---

### Complete Variable Reference

| Variable | Type | Purpose |
|----------|------|---------|
| varErrorMessage | Text | Displays error messages on lookup screen |
| varIsLoading | Boolean | Shows loading state, disables buttons |
| varRequestData | Record | Stores validated request data from Flow G |
| varUploadedItem | Record | Stores the created FileUploads item |
| varFileCount | Number | Count of files uploaded for confirmation |
| colUploadTypes | Collection | Radio button options |
| varValidationResult | Record | Response from Flow F |

---

### Flow Name Reference

The flow name in Power Apps depends on how you named it in Power Automate:

| If Flow Named | Use in Power Apps |
|--------------|-------------------|
| `Flow F (PR-ValidateUpload)` | `'Flow F (PR-ValidateUpload)'.Run(...)` |
| `PR-ValidateUpload: Validate student upload request` | `'PR-ValidateUpload: Validate student upload request'.Run(...)` |

Update the `btnLookup.OnSelect` code to match your flow name.

---

## Power Automate Flows

### Flow F: Validate Upload Request

**Full Name:** PR-ValidateUpload: Validate student upload request  
**Trigger:** Power Apps (instant)  
**Purpose:** Validates that a student can upload to a specific request

📋 **Full implementation details:** See [`PowerAutomate/Flow-(F)-ValidateUpload.md`](../PowerAutomate/Flow-(F)-ValidateUpload.md)

**Quick Summary:**
1. Accept StudentEmail and ReqKey parameters from Power Apps
2. Look up PrintRequest by ReqKey
3. Validate request exists
4. Validate StudentEmail matches (case-insensitive)
5. Validate Status is not "Archived" or "Rejected"
6. Return JSON response with validation result

**Output Response:**
```json
{
  "IsValid": true,
  "RequestData": {
    "ID": 42,
    "ReqKey": "REQ-00042",
    "Title": "JaneDoe_Filament_Blue_00042",
    "StudentEmail": "jdoe@lsu.edu",
    "Status": "Ready to Print"
  },
  "ErrorMessage": ""
}
```

**Error Messages:**
- "No request found with that ID. Please check your Request ID."
- "Email does not match the request on file. Use the email you submitted with."
- "This request has been archived and cannot accept new files."
- "This request was rejected. Please submit a new request."

---

### Flow G: Process File Upload

**Full Name:** PR-ProcessUpload: Process student file upload  
**Trigger:** SharePoint - When an item is created (List: `FileUploads`)  
**Purpose:** Moves uploaded files to the correct PrintRequest

📋 **Full implementation details:** See [`PowerAutomate/Flow-(G)-ProcessUpload.md`](../PowerAutomate/Flow-(G)-ProcessUpload.md)

**Quick Summary:**

1. **Get FileUploads Item Details**
   - Get attachments from FileUploads item
   - Get target PrintRequest by RequestID

2. **Validate File Format**
   - Check file extensions (.stl, .obj, .3mf, .idea, .form)
   - Check file size (max 150MB)
   - If invalid: Update FileUploads.Status = Failed, send error email, stop

3. **Handle Upload Type**

   **If UploadType = "Replacement":**
   - Delete existing attachments from PrintRequest (no archive)

   **If UploadType = "Additional":**
   - Keep existing attachments as-is

4. **Copy New Files to PrintRequest**
   - For each attachment on FileUploads, copy to PrintRequest

5. **Update PrintRequest**
   - NeedsAttention: Yes
   - LastAction: "File Added"
   - LastActionBy: "System"

6. **Update FileUploads Status**
   - Status: "Processed"
   - ProcessedAt: utcNow()

7. **Log to AuditLog**
   - ActorRole: "Student"
   - ClientApp: "Upload Portal"

8. **Send Confirmation Email to Student**

---

## Permissions Model

### Student Upload Portal App
- **Share with:** All LSU authenticated users (or LSU Students group)
- **Connection permissions:** Students need Contribute access to FileUploads list only
- **Students CANNOT:** Access PrintRequests list directly, modify any fields except uploading files

### FileUploads List
- **Students:** Can create items, can add attachments
- **Students CANNOT:** Edit items after creation, delete items, view other students' uploads
- **Staff:** Full control (for troubleshooting)

### PrintRequests List
- **No changes to existing permissions**
- Flow H uses elevated permissions to add attachments

---

## Security Considerations

### Validation Requirements
1. **Email Verification:** Student must enter email matching request's StudentEmail
2. **ReqKey Verification:** Request must exist and not be Archived/Rejected
3. **File Validation:** Same rules as initial submission (format, size, naming)

### What Students CANNOT Do
- View other students' requests
- Modify request properties (status, priority, notes, etc.)
- Delete files (only add/replace)
- Upload to Archived or Rejected requests
- Bypass the validation flow

### Audit Trail
All uploads logged to AuditLog with:
- Student attribution
- Upload type (Replacement/Additional)
- Timestamp
- File names
- Flow run ID for debugging

---

## File Validation Rules

Flow H validates uploaded files before processing:

### Accepted File Types
- .stl, .obj, .3mf (mesh formats)
- .idea (PrusaSlicer)
- .form (Formlabs)

### File Size
- Maximum: 150MB per file

### File Naming
- No strict naming requirement for uploads (unlike initial submission)
- Students may upload corrected files with any valid name

### Validation Failure Handling
If any file fails validation:
1. Set FileUploads.Status = "Failed"
2. Set FileUploads.ErrorMessage = specific error (which file, what issue)
3. Send rejection email to student with instructions
4. Do NOT copy any files to PrintRequest
5. Log failure to AuditLog

---

## Integration Points

### With Existing System

| Component | Integration |
|-----------|-------------|
| PrintRequests | Files copied to attachments, NeedsAttention flagged |
| AuditLog | All upload activity logged |
| Flow A | Reuse file validation logic |
| Staff Dashboard | NeedsAttention surfaces uploads for review |
| Email System | Confirmations and error notifications |

### Flow Dependencies
- Flow F must complete before upload form shows
- Flow G triggers automatically on FileUploads creation
- Flow G should complete within 5 minutes (timeout consideration)

---

## Testing Checklist

### Flow F (Validation)
- [ ] Valid email + ReqKey → Returns request data with IsValid = true
- [ ] Invalid ReqKey → Returns "No request found" error
- [ ] Email mismatch → Returns "Email does not match" error
- [ ] Archived request → Returns "Request archived" error
- [ ] Rejected request → Returns "Request rejected" error
- [ ] Case-insensitive email matching works (JDoe@lsu.edu = jdoe@lsu.edu)

### Flow G (Processing)
- [ ] Valid file upload creates attachment on PrintRequest
- [ ] Replacement type deletes existing files
- [ ] Additional type keeps existing files
- [ ] Invalid file format (.pdf, .docx) rejects upload
- [ ] File over 150MB rejects upload
- [ ] NeedsAttention set to Yes on PrintRequest
- [ ] AuditLog entry created with ActorRole = Student
- [ ] Student confirmation email sent
- [ ] FileUploads.Status = "Processed" after success
- [ ] FileUploads.Status = "Failed" with ErrorMessage on failure

### Power Apps Portal
- [ ] Lookup screen validates LSU email format
- [ ] Lookup screen validates ReqKey format (REQ-#####)
- [ ] Error messages display correctly (red text)
- [ ] Upload screen shows correct request info from Flow G
- [ ] Radio buttons default to "Replacement"
- [ ] File attachment control works
- [ ] Submit creates FileUploads entry with correct fields
- [ ] Confirmation screen shows file count and upload type
- [ ] "Upload More Files" resets form correctly

### Security
- [ ] Student cannot access other students' requests (email validation)
- [ ] Student cannot modify request properties (only upload files)
- [ ] Archived requests blocked at validation step
- [ ] Rejected requests blocked at validation step
- [ ] Invalid email format prevented client-side

---

## UI Design Guidelines

### Branding
- Use LSU colors where appropriate
- Include FabLab logo/header
- Professional but approachable tone

### Mobile-First
- Phone layout (Power Apps phone form factor)
- Large touch targets
- Clear, readable text

### Error Handling
- Clear error messages (not technical jargon)
- Guidance on how to fix issues
- Help link to contact staff

### Success Feedback
- Clear confirmation of successful upload
- Summary of what was submitted
- Next steps explanation

---

## File Deliverables

| File | Purpose |
|------|---------|
| [`SharePoint/FileUploads-List-Setup.md`](../SharePoint/FileUploads-List-Setup.md) | List creation instructions |
| [`PowerAutomate/Flow-(F)-ValidateUpload.md`](../PowerAutomate/Flow-(F)-ValidateUpload.md) | Flow F documentation |
| [`PowerAutomate/Flow-(G)-ProcessUpload.md`](../PowerAutomate/Flow-(G)-ProcessUpload.md) | Flow G documentation |
| [`PowerApps/StudentUploadPortal-Spec.md`](StudentUploadPortal-Spec.md) | This file - full app build guide |

---

## Implementation Order

1. **SharePoint:** Create FileUploads list with all columns (see setup guide)
2. **Flow F:** Build validation flow, test with sample data
3. **Flow G:** Build processing flow, test file operations
4. **Power Apps:** Build portal screens following this spec
5. **Integration Testing:** End-to-end with real files
6. **Security Testing:** Verify permission boundaries
7. **Publish & Share:** Share direct link with students

---

## Implementation Decisions (Resolved)

| Question | Decision | Rationale |
|----------|----------|-----------|
| File archiving approach | Delete existing files (no archive) | Simplifies Flow H, students can re-upload if needed |
| Staff notification | Dashboard only (NeedsAttention flag) | Reduces email noise, staff check dashboard regularly |
| Upload limits | No limits | SharePoint handles file size limits (250MB), no cooldown needed |
| Student access method | Direct app link | Shared separately, not embedded in emails |

