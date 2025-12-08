# FileUploads SharePoint List Setup

**Purpose:** Queue for processing student file uploads before moving to PrintRequests  
**Time Required:** 20 minutes

---

## Overview

The FileUploads list acts as a staging area for student-submitted files. When students need to update files on an existing print request, they use the Student Upload Portal which creates entries in this list. Flow H then processes these entries, validates the files, and moves them to the original PrintRequest.

**Workflow:**
1. Student submits files via Upload Portal → FileUploads entry created
2. Flow H triggers automatically → validates files
3. Valid files copied to PrintRequests → FileUploads marked "Processed"
4. Invalid files → FileUploads marked "Failed" with error message

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `FileUploads`
6. **Description:** `Queue for processing student file uploads`
7. Click **Create**

---

## Step 2: Enable Attachments

1. Click **Settings** (gear icon) → **List settings**
2. Click **Advanced settings**
3. Under **Attachments**, select **Enabled**
4. Click **OK**

---

## Step 3: Add Columns

After creating the list, add these 9 columns (Title already exists):

### Column 1: StudentEmail (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `StudentEmail`
3. **Description:** `Email of the student uploading files`
4. **Require that this column contains information:** Yes
5. Click **Save**

### Column 2: RequestID (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `RequestID`
3. **Description:** `Links to PrintRequests.ID`
4. **Require that this column contains information:** Yes
5. **Number of decimal places:** 0
6. Click **Save**

### Column 3: ReqKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Request identifier (REQ-00001)`
4. **Require that this column contains information:** Yes
5. Click **Save**

### Column 4: UploadType (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `UploadType`
3. **Description:** `Whether files replace existing or add to them`
4. **Choices:**
   - Replacement
   - Additional
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 5: Status (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Status`
3. **Description:** `Processing status of the upload`
4. **Choices:**
   - Pending
   - Processed
   - Failed
5. **Default value:** Pending
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 6: ProcessedAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `ProcessedAt`
3. **Description:** `When files were moved to PrintRequest`
4. **Include time:** Yes
5. Click **Save**

### Column 7: ProcessedBy (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ProcessedBy`
3. **Description:** `System or staff name who processed`
4. Click **Save**

### Column 8: Notes (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `Notes`
3. **Description:** `Student notes about the upload`
4. **Type of text:** Plain text
5. Click **Save**

### Column 9: ErrorMessage (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `ErrorMessage`
3. **Description:** `Error details if processing failed`
4. **Type of text:** Plain text
5. Click **Save**

---

## Step 4: Create Views

### View 1: Pending Uploads

1. Click **Settings** (gear icon) → **List settings**
2. Scroll down to **Views** section → Click **Create view**
3. Select **Standard View**
4. **View Name:** `Pending Uploads`
5. **Columns:** Check these columns:
   - ReqKey
   - StudentEmail
   - UploadType
   - Created
6. **Sort:** Created (Descending)
7. **Filter:** Show items only when the following is true:
   - Status **is equal to** Pending
8. Click **OK**

### View 2: All Uploads

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `All Uploads`
4. **Columns:** Check these columns:
   - ReqKey
   - StudentEmail
   - UploadType
   - Status
   - ProcessedAt
   - Created
5. **Sort:** Created (Descending)
6. Click **OK**

### View 3: Failed Uploads

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `Failed Uploads`
4. **Columns:** Check these columns:
   - ReqKey
   - StudentEmail
   - UploadType
   - ErrorMessage
   - Created
5. **Sort:** Created (Descending)
6. **Filter:** Show items only when the following is true:
   - Status **is equal to** Failed
7. Click **OK**

---

## Step 5: Add Status Color Formatting (Optional)

1. Go to the **All Uploads** view
2. Click the **Status** column header → **Column settings** → **Format this column**
3. Click **Advanced mode**
4. Paste this JSON:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "span",
  "style": {
    "padding": "4px 8px",
    "border-radius": "16px",
    "font-weight": "600",
    "color": "#ffffff",
    "background-color": {
      "operator": "?",
      "operands": [
        { "operator": "==", "operands": ["@currentField", "Pending"] },
        "#0078D4",
        { "operator": "==", "operands": ["@currentField", "Processed"] },
        "#107C10",
        { "operator": "==", "operands": ["@currentField", "Failed"] },
        "#D13438",
        "#605E5C"
      ]
    }
  },
  "txtContent": "@currentField"
}
```

5. Click **Save**

**Color Legend:**
- **Pending** = Blue (#0078D4)
- **Processed** = Green (#107C10)
- **Failed** = Red (#D13438)

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | Yes | Auto | Auto-generated identifier |
| StudentEmail | Single line | Yes | - | Submitting student's email |
| RequestID | Number | Yes | - | Links to PrintRequests.ID |
| ReqKey | Single line | Yes | - | Request identifier (REQ-00001) |
| UploadType | Choice | Yes | - | Replacement or Additional |
| Status | Choice | Yes | Pending | Processing status |
| ProcessedAt | DateTime | No | - | When files were moved |
| ProcessedBy | Single line | No | - | System or staff name |
| Notes | Multi-line | No | - | Student notes |
| ErrorMessage | Multi-line | No | - | Error details |

---

## Permissions Configuration

### Student Access (via Upload Portal App)

Students need **Contribute** access to the FileUploads list only:

1. Go to **List settings** → **Permissions for this list**
2. Click **Stop Inheriting Permissions** (if not already done)
3. Click **Grant Permissions**
4. Add: `LSU Students` or your student security group
5. Permission level: **Contribute**
6. Click **Share**

### What Students CAN Do:
- Create new FileUploads entries
- Add attachments to their entries

### What Students CANNOT Do:
- Edit entries after creation
- Delete entries
- View other students' uploads

### Staff Access

Staff should have **Full Control** (inherited from site permissions) for troubleshooting failed uploads.

---

## Verification Checklist

- [ ] List created with name "FileUploads"
- [ ] Attachments enabled in Advanced settings
- [ ] All 9 columns added (plus Title)
- [ ] UploadType has choices: Replacement, Additional
- [ ] Status has choices: Pending, Processed, Failed (default: Pending)
- [ ] ProcessedAt has "Include time" enabled
- [ ] 3 views created: Pending Uploads, All Uploads, Failed Uploads
- [ ] Status column formatting applied (optional)
- [ ] Student permissions configured

---

## Next Steps

1. Create **Flow G (PR-ValidateUpload)** - validates student upload requests
2. Create **Flow H (PR-ProcessUpload)** - processes uploads and moves files
3. Build **Student Upload Portal** Power App
4. Test end-to-end workflow

---

## Troubleshooting

### Students Can't Create Entries
- Verify students have Contribute permission on FileUploads list
- Check that the Upload Portal app is shared with students

### Attachments Not Saving
- Verify Attachments are enabled in List settings → Advanced settings
- Check file size (SharePoint limit: 250MB per file)

### Processing Failures
- Check the ErrorMessage column for specific error details
- Review Flow H run history in Power Automate
- Verify Flow H has permissions to read/write PrintRequests

