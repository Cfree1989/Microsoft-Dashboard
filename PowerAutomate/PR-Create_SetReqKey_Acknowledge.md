# Flow A — PR-Create: Set ReqKey + Acknowledge

**Trigger:** SharePoint — When an item is **created** (List: `PrintRequests`)

**Purpose:** When a new request is created, assign a **ReqKey**, compute a standardized display name string (used for Title/email/validation; no file rename), log a **Created** event, and email the student with confirmation.

---

## Quick Overview

This flow runs automatically when someone submits a new 3D print request. Here's what happens:

1. **Generate unique ID** (REQ-00001 format)
2. **Create standardized name** (JaneDoe_Filament_Blue_00001)
3. **Validate file names** (must follow FirstLast_Method_Color.ext format)
4. **If valid:** Update request, log action, send confirmation email
5. **If invalid:** Reject request, send rejection email, stop flow

---

## Error Handling Configuration

**Configure retry policies on all actions for resilience:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 1 minute
- **Apply to:** Update item, Create item (AuditLog), Send email actions

**How to set retry policy on any action:**
1. Click the **three dots (…)** on the action card
2. Choose **Settings**
3. Turn **Retry Policy** to **On**
4. Configure:
   - **Type:** Select **Exponential**
   - **Count:** Set to **4**
   - **Minimum Interval:** Type **PT1M** (ISO 8601 format for 1 minute)
5. Click **Done**

**ISO 8601 Duration Format Examples:**
- 30 seconds = **PT30S**
- 1 minute = **PT1M**
- 2 minutes = **PT2M**
- 90 seconds = **PT1M30S**

---

## Step-by-Step Implementation

### Step 1: Flow Creation Setup

**UI steps:**
1. Go to **Power Automate** → **Create** → **Automated cloud flow**
2. Name: `PR-Create: Set ReqKey + Acknowledge`
3. Choose trigger: **SharePoint – When an item is created**
4. Fill in:
   - **Site address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List name:** `PrintRequests`
5. Click **Create**

---

### Step 2: Generate ReqKey

**What this does:** Creates a unique request ID like "REQ-00001" from the SharePoint item ID.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Generate ReqKey`
   - Click the **three dots (…)** → **Rename** → type `Generate ReqKey`
4. In the **Inputs** box, click the **Expression** tab (fx)
5. Paste this expression:
```
concat('REQ-', formatNumber(triggerOutputs()?['body/ID'], '00000'))
```
6. Click **Update** → **Save**

**Result:** This creates "REQ-00001", "REQ-00002", etc.

---

### Step 3: Generate Standardized Display Name

**What this does:** Creates a clean, standardized name like "JaneDoe_Filament_Blue_00001" for use in titles and emails (does not rename files).

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Generate Standardized Display Name`
4. In the **Inputs** box, click the **Expression** tab (fx)
5. Paste this expression:
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
6. Click **Update** → **Save**

**Character cleaning rules applied:**
- **Spaces** → Removed (Jane Doe → JaneDoe)
- **Hyphens** → Removed (Mary-Jane → MaryJane)
- **Apostrophes** → Removed (O'Connor → OConnor)
- **Periods** → Removed (Jr. → Jr)
- **Commas** → Removed (Smith, John → SmithJohn)

This ensures names work across Windows, Mac, and Linux filesystems.

---

### Step 4: Attachment Validation System

**What this does:** First checks if any files are attached, then validates that each file follows the naming policy (FirstLast_Method_Color) and has approved extensions (.stl, .obj, .3mf, .idea, .form). The system automatically detects the file type from the extension - students don't need to include the extension in their naming.

#### 4a) Get Attachments

**UI steps:**
1. Click **+ New step**
2. Search for and select **Get attachments** (SharePoint)
3. Rename the action to: `Get Attachments`
   - Click the **three dots (…)** → **Rename** → type `Get Attachments`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Dynamic content** → select **ID** (from trigger)

#### 4b) No Attachments Guard (Condition)

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Check for No Attachments`
   - Click the **three dots (…)** → **Rename** → type `Check for No Attachments`
4. Set up condition:
   - Left box: **Expression** → `equals(length(body('Get_attachments')), 0)`
   - Middle: **is equal to**
   - Right box: `true`

##### Yes Branch (No Files Attached) — Reject Immediately:

**Action 1: Update item to Rejected**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Reject Request - No Files`
   - Click the **three dots (…)** → **Rename** → type `Reject Request - No Files`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)
   - **Status:** Type `Rejected`
   - **NeedsAttention:** Select `Yes`
   - **LastAction:** Type `Rejected`
   - **LastActionBy:** Type `System`
   - **LastActionAt:** **Expression** → `utcNow()`

**Action 2: Log no attachments rejection**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log No Files Rejection`
   - Click the **three dots (…)** → **Rename** → type `Log No Files Rejection`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** Same as above
   - **List Name:** `AuditLog`
   - **Title:** Type `Rejected: No files attached`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **Outputs** (from Generate ReqKey)
   - **Action Value:** Type `Rejected`
   - **FieldName:** Type `Attachments`
   - **NewValue:** Type `No files attached`
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Request rejected: No files were attached to the submission`

**Action 3: Send no files rejection email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send No Files Email`
   - Click the **three dots (…)** → **Rename** → type `Send No Files Email`
4. **Configure retry policy**
5. Fill in:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `triggerOutputs()?['body/Author/Email']`
   - **Subject:** Type `Action needed: attach your 3D print file`
   - **Body:** Paste this HTML:
```html
<p>We're unable to process your 3D print request because no files were attached.</p>
<p><strong>Required:</strong> At least one 3D model file must be attached</p>
<p><strong>Accepted formats:</strong> .stl, .obj, .3mf, .idea, .form</p>
<p><strong>File naming:</strong> FirstLast_Method_Color.ext</p>
<p><strong>Example:</strong> JaneDoe_Resin_Clear.3mf</p>
<br>
<p>Please attach your file and submit a new request. Thank you!</p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 4: Terminate flow**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - No Files`
   - Click the **three dots (…)** → **Rename** → type `Stop Flow - No Files`
4. Fill in:
   - **Status:** Select `Cancelled`

##### No Branch (Files Present) — Continue to File Validation:

#### 4c) Initialize Invalid Attachment Flag

**UI steps:**
1. Click **+ New step**
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize HasInvalidAttachment`
4. Fill in:
   - **Name:** `HasInvalidAttachment`
   - **Type:** `Boolean`
   - **Value:** `false`

*Note: This flag allows the flow to evaluate results after the loop and terminate safely outside the loop (Terminate can't be nested under Apply to each).*

#### 4d) File Validation Gate (Apply to Each Loop)

**UI steps:**
1. Click **+ New step**
2. Search for and select **Apply to each**
3. In **Select an output from previous steps:** Switch to **Expression** tab (fx) → type `body('Get_attachments')` → Click **Update**
4. **Rename the loop:** Click the **three dots (…)** on the loop → **Rename** → type `File Validation Gate`
5. **Set concurrency:** Click **three dots (…)** → **Settings** → turn on **Concurrency Control** → set **Degree of Parallelism** = **1** → **Done**

*Note: Concurrency = 1 ensures that if any file fails validation, the flow stops cleanly.*

#### 4e) Filename Validation Condition

**UI steps:**
1. **Inside the loop**, click **+ Add an action**
2. Search for and select **Condition**
3. Rename the condition to: `Validate Filename Format`
   - Click the **three dots (…)** → **Rename** → type `Validate Filename Format`
4. **Set up the condition:**
   - Click the left **Choose a value** box
   - Switch to **Expression** tab (fx)
   - Paste this expression (spaces in loop names become underscores):
```
and(
  or(
    equals(toLower(last(split(items('File_Validation_Gate')?['DisplayName'], '.'))), 'stl'),
    equals(toLower(last(split(items('File_Validation_Gate')?['DisplayName'], '.'))), 'obj'),
    equals(toLower(last(split(items('File_Validation_Gate')?['DisplayName'], '.'))), '3mf'),
    equals(toLower(last(split(items('File_Validation_Gate')?['DisplayName'], '.'))), 'idea'),
    equals(toLower(last(split(items('File_Validation_Gate')?['DisplayName'], '.'))), 'form')
  ),
  equals(length(split(first(split(items('File_Validation_Gate')?['DisplayName'], '.')), '_')), 3),
  greater(length(first(split(first(split(items('File_Validation_Gate')?['DisplayName'], '.')), '_'))), 0),
  greater(length(first(skip(split(first(split(items('File_Validation_Gate')?['DisplayName'], '.')), '_'), 1))), 0),
  greater(length(last(split(first(split(items('File_Validation_Gate')?['DisplayName'], '.')), '_'))), 0)
)
```
4. Click **Update**
5. Set middle dropdown to **is equal to**
6. In right box, type `true` (without quotes)
7. Click **Save**


#### 4f) True Branch (Green Box) — Valid Filename

**What this does:** Do nothing inside the loop. Final processing for valid submissions runs once after the loop if no invalid files were detected.

**UI steps:**
1. Click the **+ (plus)** inside the **True** (green) box
2. No actions required in the True branch - leave it empty.

*Note: All valid file processing has been moved to run once after the loop to avoid duplicate actions for multiple valid files.*

#### 4g) False Branch (Red Box) — Invalid Filename

**What this does:** When filename fails validation, reject the request, log the rejection, send rejection email, and flag for termination after the loop.

**UI steps:**
1. Click the **+ (plus)** inside the **False** (red) box
2. Add these actions in order:

**Action 1: Update item to Rejected**
1. Search for and select **Update item** (SharePoint)
2. Rename the action to: `Reject Request - Invalid Filename`
   - Click the **three dots (…)** → **Rename** → type `Reject Request - Invalid Filename`
3. **Configure retry policy**
4. Fill in:
   - **Site Address:** Same as above
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)
   - **Status:** Type `Rejected`
   - **NeedsAttention:** Select `Yes`
   - **LastAction:** Type `Rejected`
   - **LastActionBy:** Type `System`
   - **LastActionAt:** **Expression** → `utcNow()`

**Action 2: Log rejection**
1. Click **+ Add an action** in False branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Invalid Filename Rejection`
   - Click the **three dots (…)** → **Rename** → type `Log Invalid Filename Rejection`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** Same as above
   - **List Name:** `AuditLog`
   - **Title:** Type `Rejected: Invalid filename`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **Outputs** (from Generate ReqKey)
   - **Action Value:** Type `Rejected`
   - **FieldName:** Type `Attachments`
   - **NewValue:** Type `Invalid filename format`
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `File rejected: @{items('File_Validation_Gate')['DisplayName']} does not follow naming policy`

**Action 3: Send rejection email**
1. Click **+ Add an action** in False branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Invalid Filename Email`
   - Click the **three dots (…)** → **Rename** → type `Send Invalid Filename Email`
4. **Configure retry policy**
5. Fill in:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `triggerOutputs()?['body/Author/Email']`
   - **Subject:** Type `Action needed: rename your 3D print file`
   - **Body:** Paste this HTML:
```html
<p>We're unable to process your request because the attached file name doesn't follow our format.</p>
<p><strong>Required format:</strong> FirstLast_Method_Color</p>
<p><strong>Examples:</strong> JaneDoe_Resin_Clear (with .stl, .obj, .3mf, .idea, or .form extension)</p>
<p><strong>Accepted file types:</strong> .stl, .obj, .3mf, .idea, .form</p>
<p>Please rename your file accordingly and submit a new request. Thank you!</p>
```

**Action 4: Flag invalid attachment**
1. Click **+ Add an action** in False branch
2. Search for and select **Set variable**
3. Rename the action to: `Set HasInvalidAttachment True`
   - Click the **three dots (…)** → **Rename** → type `Set HasInvalidAttachment True`
4. Fill in:
   - **Name:** `HasInvalidAttachment`
   - **Value:** `true`
   - This flags the flow to terminate after the loop.

*Note: Terminate actions cannot be used inside an Apply to each loop. We'll terminate after the loop if any invalid attachments were found.*

#### 4h) Post-Loop Termination Gate

**What this does:** After the `Apply to each` finishes, checks if any invalid attachment was detected. If yes, terminates the flow. If no, proceeds with one-time valid processing actions.

**UI steps:**
1. Click below the entire **Apply to each** loop and click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Check Invalid Attachments`
   - Click the **three dots (…)** → **Rename** → type `Check Invalid Attachments`
4. Set up condition:
   - Left box: **Dynamic content** → select variable **HasInvalidAttachment**
   - Middle: **is equal to**
   - Right box: `true`

##### Yes Branch — Terminate Flow

1. Click **+ Add an action** in Yes branch
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - Invalid Attachment`
4. Fill in:
   - **Status:** Select `Cancelled`
   - **Message (optional):** `One or more attachments failed validation.`

##### No Branch — Proceed with Valid Path (run once)

Add these actions in order (moved out of the loop so they run once):

**Action 1: Update item (SharePoint)**
1. Search for and select **Update item** (SharePoint)
2. Rename the action to: `Update Request - Valid File`
3. **Configure retry policy** (see instructions at top)
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)
   - **ReqKey:** **Dynamic content** → **Outputs** (from Generate ReqKey)
   - **Title:** **Expression** → `outputs('Generate_Standardized_Display_Name')`
   - **StudentEmail:** **Expression** → `toLower(triggerOutputs()?['body/Author/Email'])`
   - **Status:** Type `Uploaded`
   - **NeedsAttention:** Select `Yes`
   - **LastAction:** Type `Created`
   - **LastActionBy:** **Dynamic content** → **Student Claims** (from trigger)
   - **LastActionAt:** **Expression** → `utcNow()`

**Action 2: Create item (AuditLog)**
1. Click **+ Add an action** in No branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Request Creation`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** Same as above
   - **List Name:** `AuditLog`
   - **Title:** Type `Request Created`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **Outputs** (from Generate ReqKey)
   - **Action Value:** Type `Created`
   - **FieldName:** Leave blank
   - **OldValue:** Leave blank
   - **NewValue:** **Expression** → `outputs('Generate_Standardized_Display_Name')`
   - **Actor Claims:** **Dynamic content** → **Student Claims** (from trigger)
   - **ActorRole Value:** Type `Student`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `New 3D print request submitted with standardized display name`

**Action 3: Send confirmation email**
1. Click **+ Add an action** in No branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Confirmation Email`
4. **Configure retry policy**
5. Fill in:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Dynamic content** → **StudentEmail** (from Update item)
   - **Subject:** **Expression** → `concat('We received your 3D Print request – ', outputs('Generate_ReqKey'))`
   - **Body:** Use **Dynamic content** and **Expressions** to build this HTML:
```html
<p>We received your 3D Print request.</p>
<p><strong>Request:</strong> [Dynamic content: Outputs from Generate Standardized Display Name]</p>
<p><strong>Request ID:</strong> [Dynamic content: Outputs from Generate ReqKey]</p>
<p><strong>Method:</strong> [Dynamic content: Method from trigger]</p>
<p><strong>Printer:</strong> [Dynamic content: Printer from trigger]</p>
<p><strong>Color:</strong> [Dynamic content: Color from trigger]</p>
<br>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Our team will review your request for technical feasibility</li>
  <li>You'll receive updates as your request progresses through our queue</li>
  <li>Estimated review time: 1-2 business days</li>
  </ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=[Dynamic content: ID from trigger]">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**How to build this in Power Automate:**
1. Type the HTML structure in the Body field
2. Place cursor where you see [Dynamic content: ...]
3. Click **Dynamic content** and select the indicated field
4. For trigger fields, look under "When an item is created"
5. For outputs, look under the respective action names

**Action 4: Log email sent**
1. Click **+ Add an action** in No branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** Same as above
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Confirmation`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **Outputs** (from Generate ReqKey)
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Expression** → `toLower(triggerOutputs()?['body/Author/Email'])`
   - **Actor Claims:** Leave blank
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Confirmation email sent to student`


---

## Filename Policy for SharePoint Form

Add this text to your SharePoint form so users know the file naming requirements:

**Text to display:**
- Please name your file: FirstLast_Method_Color
- Example: JaneDoe_Resin_Clear (system will detect .stl, .obj, .3mf, etc.)
- Accepted file types: .stl, .obj, .3mf, .idea, .form
- Submissions not following this format may be rejected.

**How to add to Power Apps form:**
1. Customize the list form in Power Apps
2. Insert a **Label** at the top of the main screen
3. Set **Text** to the policy above
4. Enable **Auto Height**, set **Wrap** = true
5. Optional: Add yellow background and bold formatting

**Alternative for modern SharePoint lists:**
1. Add a single-line text column named "Submission Instructions"
2. Set as read-only with default value = policy text
3. Show this column first in the form

---

## URL Reference Guide

**Replace these with your actual SharePoint URLs:**

- **Site root:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **Item details link:** `/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}`
- **My Requests view:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`

**To get your My Requests view URL:**
1. In SharePoint, open the `PrintRequests` list
2. Switch to the "My Requests" view
3. Copy the full browser URL
4. Use this URL in email templates

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

---

## Benefits of This Naming Convention

✅ **Consistency:** All files follow identical naming pattern  
✅ **Searchability:** Easy to find files by student, method, or color  
✅ **Sortability:** Files sort logically by name  
✅ **Collision Prevention:** SimpleJobID ensures unique filenames  
✅ **Metadata Embedded:** Key information visible in filename  
✅ **Cross-Platform Safe:** No special characters that cause filesystem issues

---

## Key Features Added

✅ **Standardized Display Name Generation** - Creates consistent, searchable names with character cleaning  
✅ **Enhanced Title Update** - Uses standardized display name (no file rename)  
✅ **Complete Audit Logging** - Includes FlowRunId, ActionAt timestamps, and filename in audit trail  
✅ **Email Audit Trail** - Logs all sent emails for compliance tracking  
✅ **Rich HTML Email** - Professional formatting with complete request information  
✅ **Error Handling** - Exponential retry policies on all critical actions  
✅ **NeedsAttention Flag** - New requests automatically flagged for staff review  
✅ **Comprehensive Links** - Both item detail and "My Requests" view links  
✅ **Cross-Platform Compatibility** - Filename safe across all operating systems  
✅ **PowerShell Integration** - Offline filename generation for administrative tasks  
✅ **Detailed Documentation** - Step-by-step UI instructions throughout

---

## Error Handling Notes

- **Infinite Loop Prevention:** Flow only triggers on CREATE, not MODIFY
- **Attachment Validation:** Enforces filename policy on each attachment
- **Person Field Resolution:** Uses Student Claims for reliable person mapping  
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint
- **Flow Termination:** Invalid files stop processing before confirmation emails

---

## Testing Checklist

- [ ] ReqKey generates in format "REQ-00001"
- [ ] Standardized display name computed correctly
- [ ] Title field updated without file extension
- [ ] StudentEmail populated from author
- [ ] NeedsAttention set to Yes
- [ ] LastAction fields populated
- [ ] Valid filename: Two AuditLog entries created (Created + Email Sent)
- [ ] Valid filename: Confirmation email received with all links working
- [ ] Invalid filename: Request marked as Rejected
- [ ] Invalid filename: Rejection email sent with policy reminder
- [ ] Invalid filename: Flow terminates (no confirmation email)
- [ ] Retry policies trigger on simulated failures
- [ ] Concurrency setting prevents race conditions