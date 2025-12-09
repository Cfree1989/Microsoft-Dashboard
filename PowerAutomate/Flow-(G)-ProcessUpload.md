# Flow G (PR-ProcessUpload)

**Full Name:** PR-ProcessUpload: Process student file upload  
**Trigger:** SharePoint — When an item is **created** (List: `FileUploads`)

**Purpose:** Process student file uploads by validating files, moving them to the target PrintRequest, updating status flags, logging to AuditLog, and sending confirmation email.

---

## Quick Overview

This flow runs automatically when a student submits files via the Upload Portal:

1. **Get upload details** from FileUploads entry
2. **Validate file format** (.stl, .obj, .3mf, .idea, .form)
3. **If Replacement:** Delete existing files from PrintRequest
4. **Copy new files** to PrintRequest
5. **Update PrintRequest:** NeedsAttention = Yes, LastAction = "File Uploaded"
6. **Update FileUploads:** Status = Processed
7. **Log to AuditLog** with student attribution
8. **Send confirmation email** to student

---

## Error Handling Configuration

**Configure retry policies on all SharePoint actions:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Minimum Interval:** PT1M (1 minute)

---

## Step-by-Step Implementation

### Step 1: Create the Flow

1. Go to **Power Automate** → **Create** → **Automated cloud flow**
2. **Name:** `Flow G (PR-ProcessUpload)` or `PR-ProcessUpload: Process student file upload`
3. **Trigger:** Select **SharePoint – When an item is created**
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `FileUploads`
5. Click **Create**

---

### Step 2: Get Upload Attachments

1. Click **+ New step**
2. Search for **Get attachments** (SharePoint)
3. Rename to: `Get Upload Attachments`
4. Configure:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `FileUploads`
   - **Id:** Dynamic content → **ID** (from trigger)

---

### Step 3: Get Target PrintRequest

1. Click **+ New step**
2. Search for **Get item** (SharePoint)
3. Rename to: `Get Target PrintRequest`
4. Configure:
   - **Site Address:** Same as above
   - **List Name:** `PrintRequests`
   - **Id:** Dynamic content → **RequestID** (from trigger)

---

### Step 4: Initialize Variables

**Variable 1: HasInvalidFile**

1. Click **+ New step** → **Initialize variable**
2. **Name:** `HasInvalidFile`
3. **Type:** Boolean
4. **Value:** `false`

**Variable 2: InvalidFileName**

1. Click **+ New step** → **Initialize variable**
2. **Name:** `InvalidFileName`
3. **Type:** String
4. **Value:** (leave empty)

**Variable 3: ProcessedFileNames**

1. Click **+ New step** → **Initialize variable**
2. **Name:** `ProcessedFileNames`
3. **Type:** Array
4. **Value:** `[]`

---

### Step 5: File Validation Loop

1. Click **+ New step** → **Apply to each**
2. **Select output:** Expression → `body('Get_Upload_Attachments')`
3. Rename to: `Validate Each File`
4. **Settings** → **Concurrency Control** → Degree of Parallelism = **1**

#### Inside the Loop: Validation Condition

1. Click **Add an action** → **Condition**
2. Rename to: `Check File Format Valid`
3. Configure condition:
   - Left box → **Expression**:

```
and(
  or(
    equals(toLower(last(split(items('Validate_Each_File')?['DisplayName'], '.'))), 'stl'),
    equals(toLower(last(split(items('Validate_Each_File')?['DisplayName'], '.'))), 'obj'),
    equals(toLower(last(split(items('Validate_Each_File')?['DisplayName'], '.'))), '3mf'),
    equals(toLower(last(split(items('Validate_Each_File')?['DisplayName'], '.'))), 'idea'),
    equals(toLower(last(split(items('Validate_Each_File')?['DisplayName'], '.'))), 'form')
  ),
  less(items('Validate_Each_File')?['Size'], 157286400)
)
```

> **Note:** 157286400 bytes = 150MB file size limit

   - Operator: **is equal to**
   - Right: `true`

#### If Yes (Valid File):

1. Add action → **Append to array variable**
2. **Name:** `ProcessedFileNames`
3. **Value:** Expression → `items('Validate_Each_File')?['DisplayName']`

#### If No (Invalid File):

1. Add action → **Set variable**
2. **Name:** `HasInvalidFile`
3. **Value:** Expression → `true`

2. Add action → **Set variable**
3. **Name:** `InvalidFileName`
4. **Value:** Expression → `items('Validate_Each_File')?['DisplayName']`

---

### Step 6: Check Validation Results

**After the Apply to each loop closes:**

1. Click **+ New step** → **Condition**
2. Rename to: `Check If Any Invalid Files`
3. Configure:
   - Left: Variable → `HasInvalidFile`
   - Operator: **is equal to**
   - Right: Expression → `true`

---

### Step 7: If Yes (Invalid Files Found) - Reject Upload

#### Action 1: Update FileUploads to Failed

1. Add action → **Update item** (SharePoint)
2. Rename to: `Mark Upload Failed`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `FileUploads`
   - **Id:** Dynamic → **ID** (from trigger)
   - **Status Value:** `Failed`
   - **ProcessedAt:** Expression → `utcNow()`
   - **ProcessedBy:** `System`
   - **ErrorMessage:** Expression →

```
concat('Invalid file: ', variables('InvalidFileName'), '. Accepted formats: .stl, .obj, .3mf, .idea, .form (max 150MB)')
```

#### Action 2: Send Rejection Email

1. Add action → **Send an email from a shared mailbox (V2)**
2. Rename to: `Send File Rejection Email`
3. Configure:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** Dynamic → **StudentEmail** (from trigger)
   - **Subject:** Expression →

```
concat('File upload rejected for ', triggerOutputs()?['body/ReqKey'])
```

   - **Body:** (HTML)

```html
<p>Your file upload for request <strong>@{triggerOutputs()?['body/ReqKey']}</strong> could not be processed.</p>

<p><strong>Issue:</strong> @{variables('InvalidFileName')} is not an accepted file format or exceeds size limit.</p>

<p><strong>Accepted file types:</strong> .stl, .obj, .3mf, .idea, .form</p>
<p><strong>Maximum file size:</strong> 150MB per file</p>

<p>Please upload a valid file and try again.</p>

<p>If you have questions, contact <a href="mailto:coad-fablab@lsu.edu">coad-fablab@lsu.edu</a></p>

<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

#### Action 3: Log Rejection to AuditLog

1. Add action → **Create item** (SharePoint)
2. Rename to: `Log Upload Rejection`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `AuditLog`
   - **Title:** `File Upload Rejected`
   - **RequestID:** Expression → `triggerOutputs()?['body/RequestID']`
   - **ReqKey:** Dynamic → **ReqKey** (from trigger)
   - **Action Value:** `Rejected`
   - **FieldName:** `Attachments`
   - **NewValue:** Expression → `variables('InvalidFileName')`
   - **ActorRole Value:** `Student`
   - **ClientApp Value:** `Upload Portal`
   - **ActionAt:** Expression → `utcNow()`
   - **FlowRunId:** Expression → `workflow()['run']['name']`
   - **Notes:** Expression →

```
concat('Student upload rejected - invalid file: ', variables('InvalidFileName'))
```

#### Action 4: Terminate Flow

1. Add action → **Terminate**
2. **Status:** `Cancelled`

---

### Step 8: If No (All Files Valid) - Process Upload

#### Step 8a: Check Upload Type for Replacement

1. Add action → **Condition**
2. Rename to: `Check If Replacement Upload`
3. Configure:
   - Left: Dynamic → **UploadType Value** (from trigger)
   - Operator: **is equal to**
   - Right: `Replacement`

---

### Step 8b: If Yes (Replacement) - Delete Existing Files

#### Action 1: Get Existing Attachments

1. Add action → **Get attachments** (SharePoint)
2. Rename to: `Get Existing PrintRequest Attachments`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `PrintRequests`
   - **Id:** Dynamic → **RequestID** (from trigger)

#### Action 2: Delete Each Existing Attachment

1. Add action → **Apply to each**
2. Rename to: `Delete Existing Files`
3. **Select output:** Dynamic → **body** from Get Existing PrintRequest Attachments
4. Inside loop, add action → **Delete attachment** (SharePoint)
5. Configure:
   - **Site Address:** Same
   - **List Name:** `PrintRequests`
   - **Id:** Dynamic → **RequestID** (from trigger)
   - **File Identifier:** Expression → `items('Delete_Existing_Files')?['Id']`

---

### Step 8c: If No (Additional) - Skip Deletion

Leave the No branch empty - we keep existing files.

---

### Step 9: Copy New Files to PrintRequest

**After the Replacement condition closes:**

1. Add action → **Apply to each**
2. Rename to: `Copy Files to PrintRequest`
3. **Select output:** Expression → `body('Get_Upload_Attachments')`

#### Inside Loop:

**Action 1: Get Attachment Content**

1. Add action → **Get attachment content** (SharePoint)
2. Rename to: `Get File Content`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `FileUploads`
   - **Id:** Dynamic → **ID** (from trigger)
   - **File Identifier:** Expression → `items('Copy_Files_to_PrintRequest')?['Id']`

**Action 2: Add Attachment to PrintRequest**

1. Add action → **Add attachment** (SharePoint)
2. Rename to: `Add File to PrintRequest`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `PrintRequests`
   - **Id:** Dynamic → **RequestID** (from trigger)
   - **File Name:** Expression → `items('Copy_Files_to_PrintRequest')?['DisplayName']`
   - **File Content:** Dynamic → **Body** from Get File Content

---

### Step 10: Update PrintRequest

1. Add action → **Update item** (SharePoint)
2. Rename to: `Update PrintRequest Status`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `PrintRequests`
   - **Id:** Dynamic → **RequestID** (from trigger)
   - **NeedsAttention:** `Yes`
   - **LastAction Value:** `File Added`
   - **LastActionBy:** `System`
   - **LastActionAt:** Expression → `utcNow()`

---

### Step 11: Update FileUploads Status

1. Add action → **Update item** (SharePoint)
2. Rename to: `Mark Upload Processed`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `FileUploads`
   - **Id:** Dynamic → **ID** (from trigger)
   - **Status Value:** `Processed`
   - **ProcessedAt:** Expression → `utcNow()`
   - **ProcessedBy:** `System`

---

### Step 12: Log to AuditLog

1. Add action → **Create item** (SharePoint)
2. Rename to: `Log File Upload`
3. Configure:
   - **Site Address:** Same
   - **List Name:** `AuditLog`
   - **Title:** `Student File Upload`
   - **RequestID:** Expression → `triggerOutputs()?['body/RequestID']`
   - **ReqKey:** Dynamic → **ReqKey** (from trigger)
   - **Action Value:** Expression →

```
if(equals(triggerOutputs()?['body/UploadType/Value'], 'Replacement'), 'File Replaced', 'File Added')
```

   - **FieldName:** `Attachments`
   - **NewValue:** Expression → `join(variables('ProcessedFileNames'), ', ')`
   - **ActorRole Value:** `Student`
   - **ClientApp Value:** `Upload Portal`
   - **ActionAt:** Expression → `utcNow()`
   - **FlowRunId:** Expression → `workflow()['run']['name']`
   - **Notes:** Expression →

```
concat('Student uploaded via portal. Type: ', triggerOutputs()?['body/UploadType/Value'], '. Files: ', join(variables('ProcessedFileNames'), ', '))
```

---

### Step 13: Send Confirmation Email

1. Add action → **Send an email from a shared mailbox (V2)**
2. Rename to: `Send Upload Confirmation`
3. Configure:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** Dynamic → **StudentEmail** (from trigger)
   - **Subject:** Expression →

```
concat('Files received for ', triggerOutputs()?['body/ReqKey'])
```

   - **Body:** (HTML)

```html
<p>Your files have been added to your print request.</p>

<table style="border-collapse: collapse; margin: 15px 0;">
  <tr>
    <td style="padding: 5px 15px 5px 0; font-weight: bold;">Request:</td>
    <td style="padding: 5px 0;">@{triggerOutputs()?['body/ReqKey']}</td>
  </tr>
  <tr>
    <td style="padding: 5px 15px 5px 0; font-weight: bold;">Upload Type:</td>
    <td style="padding: 5px 0;">@{triggerOutputs()?['body/UploadType/Value']}</td>
  </tr>
  <tr>
    <td style="padding: 5px 15px 5px 0; font-weight: bold;">Files:</td>
    <td style="padding: 5px 0;">@{join(variables('ProcessedFileNames'), ', ')}</td>
  </tr>
</table>

<p><strong>What happens next:</strong></p>
<ul>
  <li>Staff will review your new files</li>
  <li>You'll receive an email if any issues are found</li>
  <li>Check your request status in SharePoint</li>
</ul>

<p>If you have questions, contact <a href="mailto:coad-fablab@lsu.edu">coad-fablab@lsu.edu</a></p>

<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

---

## Flow Structure Summary

```
When an item is created (FileUploads)
    ↓
Get Upload Attachments
Get Target PrintRequest
Initialize Variables (HasInvalidFile, InvalidFileName, ProcessedFileNames)
    ↓
Apply to each: Validate Each File
├── Condition: Check File Format Valid
│   ├── Yes: Append filename to ProcessedFileNames
│   └── No: Set HasInvalidFile = true, Set InvalidFileName
    ↓
Condition: Check If Any Invalid Files
├── Yes (Invalid):
│   ├── Mark Upload Failed
│   ├── Send File Rejection Email
│   ├── Log Upload Rejection
│   └── Terminate (Cancelled)
└── No (All Valid):
    ├── Condition: Check If Replacement Upload
    │   ├── Yes: Get Existing Attachments → Delete Each
    │   └── No: (skip deletion)
    ├── Apply to each: Copy Files to PrintRequest
    │   ├── Get File Content
    │   └── Add File to PrintRequest
    ├── Update PrintRequest Status (NeedsAttention = Yes)
    ├── Mark Upload Processed
    ├── Log File Upload (AuditLog)
    └── Send Upload Confirmation
```

---

## Testing Checklist

### Test 1: Valid Additional Upload
- **Setup:** Existing PrintRequest with 1 file, FileUploads with UploadType = Additional
- **Expected:** Original file kept, new file added, Status = Processed

### Test 2: Valid Replacement Upload
- **Setup:** Existing PrintRequest with 2 files, FileUploads with UploadType = Replacement
- **Expected:** Original files deleted, new file(s) added, Status = Processed

### Test 3: Invalid File Format
- **Setup:** FileUploads with .pdf attachment
- **Expected:** Status = Failed, ErrorMessage populated, rejection email sent

### Test 4: File Too Large
- **Setup:** FileUploads with 200MB .stl file
- **Expected:** Status = Failed, ErrorMessage mentions size limit

### Test 5: Multiple Files (Mixed Valid/Invalid)
- **Setup:** FileUploads with valid.stl and invalid.pdf
- **Expected:** Status = Failed, only invalid file mentioned in error

### Test 6: PrintRequest Updates
- **Verify:** NeedsAttention = Yes after successful upload
- **Verify:** LastAction = "File Added", LastActionBy = "System"

### Test 7: AuditLog Entry
- **Verify:** Entry created with ActorRole = Student, ClientApp = Upload Portal
- **Verify:** Action = "File Replaced" for Replacement, "File Added" for Additional

### Test 8: Confirmation Email
- **Verify:** Email sent to StudentEmail with correct ReqKey and file list

---

## Troubleshooting

### Files Not Copying
- Verify Get attachment content action has correct File Identifier
- Check that FileUploads item has attachments (not just entry)
- Verify PrintRequests list allows attachments

### Deletion Not Working
- Ensure the loop iterates over `body` of Get Existing PrintRequest Attachments
- Verify File Identifier uses `['Id']` not `['DisplayName']`

### Wrong Email Recipient
- Verify StudentEmail is populated on FileUploads entry
- Check that Upload Portal correctly sets StudentEmail field

### Validation Always Fails
- Test file extension with different cases (.STL vs .stl)
- Verify loop name matches expression (`Validate_Each_File` vs `Validate_each_file`)
- Check file size calculation (bytes, not MB)

### Flow Runs Multiple Times
- This is expected if student uploads multiple items
- Each FileUploads entry triggers a separate flow run

