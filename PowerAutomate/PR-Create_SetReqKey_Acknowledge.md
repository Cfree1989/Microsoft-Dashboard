# Flow A — PR-Create: Set ReqKey + Acknowledge

**Trigger:** SharePoint — When an item is **created** (List: `PrintRequests`)

**Purpose:** When a new request is created, assign a **ReqKey**, generate standardized filename, log a **Created** event, and email the student with confirmation.

---

## Error Handling Configuration
**Configure retry policies on all actions for resilience:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 1 minute
- **Apply to:** Update item, Create item (AuditLog), Send email actions

---

## Step-by-Step Implementation

### Flow Creation Setup

1. **Create → Automated cloud flow**
   - Name: `PR-Create: Set ReqKey + Acknowledge`
   - Trigger: **SharePoint – When an item is created**
   - Site address: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - List: `PrintRequests`

### 2. **Compose Action: "Generate ReqKey"** (rename the compose action)
**Inputs:**
```
concat('REQ-', formatNumber(triggerOutputs()?['body/ID'], '00000'))

```

*This creates a padded 5-digit request key like "REQ-00001" from the SharePoint item ID.*

### 3. **Compose Action: "Generate Standardized Filename"** (rename the compose action)
**Inputs:**
```
concat(
  replace(replace(replace(replace(replace(
    concat(
      first(split(coalesce(triggerOutputs()?['body/Student/DisplayName'], triggerOutputs()?['body/Author/DisplayName']), ' ')),
      last(split(coalesce(triggerOutputs()?['body/Student/DisplayName'], triggerOutputs()?['body/Author/DisplayName']), ' '))
    ),
    ' ', ''), '-', ''), '''', ''), '.', ''), ',', ''),
  '_',
  coalesce(string(triggerOutputs()?['body/Method/Value']), string(triggerOutputs()?['body/Method']), 'Unknown'),
  '_',
  coalesce(string(triggerOutputs()?['body/Color/Value']), string(triggerOutputs()?['body/Color']), 'Unknown'),
  '_',
  formatNumber(triggerOutputs()?['body/ID'], '00000')
)
```

*This computes a standardized base filename string like "JaneDoe_Filament_Blue_00001" (no extension). It does not rename any files; it's used only for metadata, validation, or messaging.*

#### **Expression Breakdown:**
1. **FirstAndLastName**: `replace(replace(replace(replace(replace(triggerOutputs()?['body/Student/DisplayName'], ' ', ''), '-', ''), '''', ''), '.', ''), ',', '')`
   - Removes spaces, hyphens, apostrophes, periods, and commas from student name
2. **PrintMethod**: `triggerOutputs()?['body/Method']` (Filament or Resin)
3. **Color**: `triggerOutputs()?['body/Color']`
4. **SimpleJobID**: `formatNumber(triggerOutputs()?['body/ID'], '00000')`

### 3a. Attachment Filename Validation Gate (No in-place rename)
Add these steps immediately after Step 3 and before Step 4:

1) **Get attachments** (SharePoint)
- Site/List: `PrintRequests`
- Id: `ID` (from trigger)

2) **Apply to each** — value from Get attachments
- Set Concurrency to 1

3) **Condition** — validate filename format and extension
Use this expression (replace `Apply_to_each` with your loop's actual name if different):
```
and(
  or(
    equals(toLower(last(split(items('Apply_to_each')?['Name'], '.'))), 'stl'),
    equals(toLower(last(split(items('Apply_to_each')?['Name'], '.'))), 'obj'),
    equals(toLower(last(split(items('Apply_to_each')?['Name'], '.'))), '3mf'),
    equals(toLower(last(split(items('Apply_to_each')?['Name'], '.'))), 'idea'),
    equals(toLower(last(split(items('Apply_to_each')?['Name'], '.'))), 'form')
  ),
  equals(length(split(first(split(items('Apply_to_each')?['Name'], '.')), '_')), 3),
  greater(length(first(split(first(split(items('Apply_to_each')?['Name'], '.')), '_'))), 0),
  greater(length(first(skip(split(first(split(items('Apply_to_each')?['Name'], '.')), '_'), 1))), 0),
  greater(length(last(split(first(split(items('Apply_to_each')?['Name'], '.')), '_'))), 0)
)
```

4) **If Yes (valid)**
- Proceed with the existing flow (Update item, AuditLog, Email) for this submission
- Optional: Create `AuditLog` entry noting "Attachment filename valid"

5) **If No (invalid)**
- Update item (PrintRequests):
  - `Status` = `Rejected`
  - `NeedsAttention` = `Yes`
  - `LastAction` = `Rejected`
  - `LastActionBy` = `System`
  - `LastActionAt` = `@{utcNow()}`
- Create item (AuditLog): Title `Rejected: Invalid filename`, include the offending name `@{items('Apply_to_each')?['Name']}` in Notes
- Send rejection email to student with rename policy and accepted extensions
- Terminate (Status: Canceled) to prevent confirmation email

Guard the confirmation email step so it only runs when the Condition passes (i.e., only on the valid path).

#### **Character Cleaning Rules:**
The following characters are removed from student names to ensure filesystem compatibility:
- **Spaces** → Removed (Jane Doe → JaneDoe)
- **Hyphens** → Removed (Mary-Jane → MaryJane)
- **Apostrophes** → Removed (O'Connor → OConnor)
- **Periods** → Removed (Jr. → Jr)
- **Commas** → Removed (Smith, John → SmithJohn)

This ensures filenames work across Windows, Mac, and Linux filesystems without issues.

> Note: Steps 4–7 run only in the YES (valid) branch of the Attachment Filename Validation Gate.

### 4. **Update item** (SharePoint) - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **List Name:** `PrintRequests`
- **Id:** `ID` (from trigger)
- **ReqKey:** `Outputs` (from Generate ReqKey step)
- **Title:** 
```
@{outputs('Generate Standardized Filename')}
```
- **StudentEmail:**
```
@{toLower(triggerOutputs()?['body/Author/Email'])}
```
- **Status:** `Uploaded` (default)
- **NeedsAttention:** `Yes` (new requests need attention)
- **LastAction:** `Created`
- **LastActionBy:** `Author Claims` (from trigger)
- **LastActionAt:** 
```
@{utcNow()}
```

### 5. **Create item** in `AuditLog` - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** same
- **List Name:** `AuditLog`
- **Title:** `Request Created`
- **RequestID:** `@{triggerOutputs()?['body/ID']}`
- **ReqKey:** `Outputs` (from Generate ReqKey)
- **Action Value:** `Created`
- **FieldName:** (leave blank)
- **OldValue:** (leave blank)  
- **NewValue:** `@{outputs('Generate Standardized Filename')}`
- **Actor Claims:** `Author Claims` (from trigger)
- **ActorRole Value:** `Student`
- **ClientApp Value:** `SharePoint Form`
- **ActionAt:**
```
@{utcNow()}
```
- **FlowRunId:**
```
@{workflow()['run']['name']}
```
- **Notes:** `New 3D print request submitted with standardized filename`

### 6. **Send an email from a shared mailbox (V2)** - **Configure Retry Policy: Exponential, 4 retries**
- **Shared Mailbox:** `coad-Fabrication Lab@lsu.edu`
- **To:** `StudentEmail` (from Update item step)
- **Subject:**
```
We received your 3D Print request – @{outputs('Generate ReqKey')}
```
- **Body:**
```html
<p>We received your 3D Print request.</p>
<p><strong>Request:</strong> @{outputs('Generate Standardized Filename')}</p>
<p><strong>Request ID:</strong> @{outputs('Generate ReqKey')}</p>
<p><strong>Method:</strong> @{triggerOutputs()?['body/Method']}</p>
<p><strong>Printer:</strong> @{triggerOutputs()?['body/PrinterSelection']}</p>
<p><strong>Color:</strong> @{triggerOutputs()?['body/Color']}</p>
<br>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Our team will review your request for technical feasibility</li>
  <li>You'll receive updates as your request progresses through our queue</li>
  <li>Estimated review time: 1-2 business days</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><strong>File Requirements Reminder:</strong></p>
<p>• Accepted formats: .stl, .obj, .3mf, .idea, .form<br>
• Maximum file size: 150MB per file<br>
• Files not meeting requirements will be rejected</p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

### 7. **Create item** in `AuditLog` (Email Sent) - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** same
- **List Name:** `AuditLog`
- **Title:** `Email Sent: Confirmation`
- **RequestID:** `@{triggerOutputs()?['body/ID']}`
- **ReqKey:** `Outputs` (from Generate ReqKey)
- **Action Value:** `Email Sent`
- **FieldName:** `StudentEmail`
- **NewValue:** `@{outputs('Update item')?['body/StudentEmail']}`
- **Actor Claims:** (leave blank for system)
- **ActorRole Value:** `System`
- **ClientApp Value:** `Power Automate`
- **ActionAt:**
```
@{utcNow()}
```
- **FlowRunId:**
```
@{workflow()['run']['name']}
```
- **Notes:** `Confirmation email sent to student`

---

## Rejection Email (Invalid Filename) — Template

Use in the NO (invalid) branch after updating the item and creating the AuditLog entry.

- Subject:
```
Action needed: rename your 3D print file
```

- Body (HTML):
```html
<p>We’re unable to process your request because the attached file name doesn’t follow our format.</p>
<p><strong>Required format:</strong> FirstLast_Method_Color.ext</p>
<p><strong>Examples:</strong> JaneDoe_Resin_Clear.3mf</p>
<p><strong>Accepted types:</strong> .stl, .obj, .3mf, .idea, .form</p>
<p>Please rename your file accordingly and submit a new request. Thank you!</p>
```

> Ensure the confirmation email step is not executed in the invalid branch.

---

## Filename Policy — Text for SharePoint Form UI

Use this text in your form (Power Apps customized form or a read-only instructions field placed at the top):

- Please name your file: FirstLast_Method_Color.ext
- Example: JaneDoe_Resin_Clear.3mf
- Accepted types: .stl, .obj, .3mf, .idea, .form
- Submissions not following this format may be rejected.

Power Apps placement (quick steps):
- Customize the list form in Power Apps → insert a Label at the top of the main screen
- Set Text to the bullets above, enable auto-height, set Wrap = true
- Optional: use a yellow info icon and bold for the first line

Modern list (no Power Apps) alternative:
- Add a single-line read-only column named "Submission Instructions"
- Default value: the policy text above; show this column first in the form

---

## URL Reference Guide

**Replace these placeholders with your actual SharePoint site URLs:**

- **Site root**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **Per-item link (used in emails)**: `/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}` 
  - Points to the SharePoint Display Form for the specific item
  - Keep the `@{...}` expression exactly as shown - Power Automate fills in the item ID at runtime
- **My Requests view (students)**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`
  - Public link to the student-filtered view for use in confirmation emails

**How to get your My Requests view URL:** 
1. In SharePoint, open `PrintRequests` list
2. Switch to the "My Requests" view 
3. Copy the full browser URL
4. Use this URL in the email body

---

## PowerShell Function for Offline Processing

For use in provisioning scripts or SharePoint management tasks:

```powershell
function New-StandardizedFilename {
    param(
        [Parameter(Mandatory=$true)]
        [string]$StudentName,
        
        [Parameter(Mandatory=$true)]
        [string]$Method,
        
        [Parameter(Mandatory=$true)]
        [string]$Color,
        
        [Parameter(Mandatory=$true)]
        [string]$ReqKey,
        
        [Parameter(Mandatory=$true)]
        [string]$OriginalFilename
    )
    
    # Clean student name - remove spaces, hyphens, apostrophes, periods, commas
    $CleanName = $StudentName -replace '[ \-\'\.,]', ''
    
    # Extract simple ID from ReqKey (e.g., "REQ-00001" becomes "00001")
    $SimpleID = $ReqKey -replace 'REQ-', ''
    
    # Get file extension
    $Extension = [System.IO.Path]::GetExtension($OriginalFilename)
    
    # Build standardized filename
    $StandardizedName = "$CleanName" + "_$Method" + "_$Color" + "_$SimpleID" + "$Extension"
    
    return $StandardizedName
}

# Example usage:
# $NewName = New-StandardizedFilename -StudentName "Jane Doe" -Method "Filament" -Color "Blue" -ReqKey "REQ-00001" -OriginalFilename "model.stl"
# Result: "JaneDoe_Filament_Blue_00001.stl"
```


### Benefits of This Naming Convention

✅ **Consistency**: All files follow identical naming pattern  
✅ **Searchability**: Easy to find files by student, method, or color  
✅ **Sortability**: Files sort logically by name  
✅ **Collision Prevention**: SimpleJobID ensures unique filenames  
✅ **Metadata Embedded**: Key information visible in filename  
✅ **Cross-Platform Safe**: No special characters that cause filesystem issues

---

## Key Features Added

✅ **Standardized Filename Generation** - Creates consistent, searchable filenames with character cleaning  
✅ **Enhanced Title Update** - Uses standardized name (without extension) as display name  
✅ **Complete Audit Logging** - Includes FlowRunId, ActionAt timestamps, and filename in audit trail  
✅ **Email Audit Trail** - Logs all sent emails for compliance tracking  
✅ **Rich HTML Email** - Professional formatting with complete request information  
✅ **Error Handling** - Exponential retry policies on all critical actions  
✅ **NeedsAttention Flag** - New requests automatically flagged for staff review  
✅ **Comprehensive Links** - Both item detail and "My Requests" view links  
✅ **Cross-Platform Compatibility** - Filename safe across all operating systems  
✅ **PowerShell Integration** - Offline filename generation for administrative tasks  
✅ **Expression Documentation** - Detailed breakdown of filename generation logic  

---

## Error Handling Notes

- **Infinite Loop Prevention:** Flow only triggers on CREATE, not MODIFY
- **Attachment Validation:** Enforces filename policy on each attachment
- **Person Field Resolution:** Uses Author Claims for reliable person mapping  
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint

---

## Testing Checklist

- [ ] ReqKey generates in format "REQ-00001"
- [ ] Standardized filename created correctly
- [ ] Title field updated without file extension
- [ ] StudentEmail populated from author
- [ ] NeedsAttention set to Yes
- [ ] LastAction fields populated
- [ ] Two AuditLog entries created (Created + Email Sent)
- [ ] Confirmation email received with all links working
- [ ] Retry policies trigger on simulated failures
