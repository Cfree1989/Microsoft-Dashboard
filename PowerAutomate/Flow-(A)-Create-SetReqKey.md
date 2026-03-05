# Flow A (PR-Create)

**Full Name:** PR-Create: Set ReqKey + Acknowledge  
**Trigger:** SharePoint — When an item is **created** (List: `PrintRequests`)

**Purpose:** When a new print request is created, assign a unique ReqKey identifier, compute a standardized display name, validate attachment filenames against policy, log the creation event, and send the student a confirmation email. Invalid submissions are auto-rejected with guidance emails.

---

## Quick Overview

This flow runs automatically when a new item is created in the PrintRequests list. Here's what happens:

1. **Generate ReqKey** (e.g., REQ-00001) using formatted ID
2. **Generate Standardized Display Name** (FirstLast_Method_Color_ReqKey)
3. **Get Student Email** from the Author/Creator
4. **Validate attachment filenames** against policy (FirstLast_Method_Color.ext)
5. **If valid:** Update item with ReqKey + DisplayName, log to AuditLog, send confirmation email
6. **If invalid:** Mark as Rejected, send rejection email with guidance, terminate

---

## Overview

- **New request created** → Flow assigns ReqKey and validates files
- **Valid filename** → Student receives confirmation email, request enters queue
- **Invalid filename** → Student receives rejection email with correction guidance, request marked Rejected
- **No attachments** → Student receives "attach your file" email, request marked Rejected

---

## Prerequisites

- [ ] `PrintRequests` SharePoint list created with all columns (see `SharePoint/PrintRequests-List-Setup.md`)
- [ ] `AuditLog` SharePoint list exists
- [ ] Shared mailbox `coad-fablab@lsu.edu` configured
- [ ] Flow owner has "Send As" permissions on shared mailbox
- [ ] Student Portal Power App URL available for email links

---

## Error Handling Configuration

**Configure retry policies on all actions for resilience:**
- **Retry Policy Type:** Exponential interval
- **Apply to:** Get item, Update item, Create item (AuditLog), Send email actions

**How to set retry policy on any action:**
1. Click the **three dots (…)** on the action card
2. Choose **Settings**
3. Scroll down to **Networking** section
4. In **Retry policy** dropdown, select **Exponential interval**
5. Fill in ALL four fields (all are required):
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
6. Click **Done**

**What these values mean:**
- **Count:** Number of retry attempts (4 retries)
- **Interval:** Base wait time between retries (1 minute)
- **Minimum interval:** Shortest possible wait (20 seconds)
- **Maximum interval:** Longest possible wait (1 hour)

**ISO 8601 Duration Format Reference:**
| Duration | Format |
|----------|--------|
| 20 seconds | `PT20S` |
| 30 seconds | `PT30S` |
| 1 minute | `PT1M` |
| 5 minutes | `PT5M` |
| 1 hour | `PT1H` |
| 90 seconds | `PT1M30S` |

---

## Filename Policy

**Required Format:** `FirstLast_Method_Color.ext`

**Examples:**
- ✅ `JaneDoe_Filament_Blue.stl`
- ✅ `JohnSmith_Resin_Clear.obj`
- ❌ `my_model.stl` (missing name, method, color)
- ❌ `Jane Doe_Filament_Blue.stl` (spaces not allowed)

**Accepted File Extensions:**
- `.stl`, `.obj`, `.3mf` (mesh formats)
- `.idea` (IdeaMaker project)
- `.form` (Formlabs PreForm project)

**Character Cleaning:**
- Spaces, hyphens, apostrophes, periods, commas removed from display names
- All three segments (FirstLast, Method, Color) must be non-empty

---

## Step-by-Step Implementation

### Step 1: Flow Creation Setup

**UI steps:**
1. Go to **Power Automate** → **Create** → **Automated cloud flow**
2. Name: `PR-Create: Set ReqKey + Acknowledge` (or `Flow-(A)-Create-SetReqKey`)
3. Choose trigger: **SharePoint – When an item is created**
4. Fill in:
   - **Site address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List name:** `PrintRequests`
5. Click **Create**

---

### Step 2: Generate ReqKey

**What this does:** Creates a unique request identifier by formatting the SharePoint item ID with leading zeros (e.g., REQ-00001, REQ-00042).

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Generate ReqKey`
   - Click the **three dots (…)** → **Rename** → type `Generate ReqKey`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('REQ-', formatNumber(triggerOutputs()?['body/ID'], '00000'))
```

**ReqKey Format:** `REQ-00001`
- Prefix `REQ-` for easy identification
- 5-digit zero-padded number based on SharePoint item ID
- Guarantees uniqueness (SharePoint IDs are unique)

---

### Step 3: Generate Standardized Display Name

**What this does:** Creates a clean, standardized display name from the student's name, method, color, and ReqKey. This is used for the item title and emails.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Generate Standardized Display Name`
   - Click the **three dots (…)** → **Rename** → type `Generate Standardized Display Name`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat(replace(replace(replace(replace(replace(triggerOutputs()?['body/Author']?['DisplayName'], ' ', ''), '-', ''), '''', ''), '.', ''), ',', ''), '_', triggerOutputs()?['body/Method']?['Value'], '_', triggerOutputs()?['body/Color']?['Value'], '_', outputs('Generate_ReqKey'))
```

**Display Name Format:** `JaneDoe_Filament_Blue_REQ-00001`
- Student name with special characters removed
- Underscore separators
- Method and Color from form selections
- ReqKey suffix for uniqueness

---

### Step 4: Get Student Email

**What this does:** Extracts and normalizes the student's email address from the Author field for use in emails and the StudentEmail field.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Get Student Email`
   - Click the **three dots (…)** → **Rename** → type `Get Student Email`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
toLower(triggerOutputs()?['body/Author']?['Email'])
```

---

### Step 5: Check for Attachments

**What this does:** Verifies that the student attached at least one file. Requests without attachments are rejected immediately.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Check Has Attachments`
   - Click the **three dots (…)** → **Rename** → type `Check Has Attachments`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/{HasAttachments}']` → click **Update**
   - **Middle:** Select **is equal to**
   - **Right box:** Type `true`

**YES Branch:** Has attachments → Continue to filename validation (Step 6)  
**NO Branch:** No attachments → Reject and send "attach file" email (Step 5a)

---

### Step 5a: NO Branch — No Attachments (Rejection)

**What this does:** When no files are attached, marks the request as Rejected and sends the student an email explaining they need to attach a file.

#### Action 1: Update Item as Rejected (No Attachments)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Reject - No Attachments`
   - Click the **three dots (…)** → **Rename** → type `Reject - No Attachments`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **Title:** Click **Expression** tab (fx) → paste: `outputs('Generate_Standardized_Display_Name')` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **Status Value:** Select `Rejected`
   - **StudentEmail:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **RejectionReason Value:** Select `Incomplete request information`
   - **LastAction Value:** Select `Rejected`
   - **LastActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**

#### Action 2: Send No Attachment Email

**UI steps:**
1. Click **+ Add an action** in the NO branch
2. Search for and select **Send an email from a shared mailbox (V2)** (Office 365 Outlook)
3. Rename the action to: `Send No Attachment Email`
   - Click the **three dots (…)** → **Rename** → type `Send No Attachment Email`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Original Mailbox Address:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **Subject:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('[', outputs('Generate_ReqKey'), '] Action needed: attach your 3D print file')
```
   - **Body:** Click **Code View button (`</>`)** at top right → Paste the HTML below:

```html
<p class="editor-paragraph">Your 3D print request was received, but no file was attached.<br><br>WHAT TO DO:<br>1. Go to the Digital Fabrication Lab submission portal<br>2. Submit a new request with your 3D model file attached<br><br>FILE REQUIREMENTS:<br>• Name your file: FirstLast_Method_Color.ext<br>• Example: JaneDoe_Filament_Blue.stl<br>• Accepted file types: .stl, .obj, .3mf, .idea, .form<br>• Maximum file size: 50MB<br><br>REQUEST DETAILS:<br>- Request ID: @{outputs('Generate_ReqKey')}<br>- Method: @{triggerOutputs()?['body/Method']?['Value']}<br>- Color: @{triggerOutputs()?['body/Color']?['Value']}<br><br>If you need assistance, please visit the lab during open hours or reply to this email.<br><br>---<br>Digital Fabrication Lab<br>Room 145 Atkinson Hall<br>coad-fablab@lsu.edu</p>
```

6. In the **Advanced parameters** section, click **Show all**
7. **Is HTML:** Toggle to **Yes**
8. **Importance:** Select `Normal`

#### Action 3: Log Rejection (No Attachments)

**UI steps:**
1. Click **+ Add an action** in the NO branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Rejection - No Attachments`
   - Click the **three dots (…)** → **Rename** → type `Log Rejection - No Attachments`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Auto-Rejected: No Attachments`
   - **RequestID:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **Action Value:** Select `Rejected`
   - **FieldName:** Type `Status`
   - **OldValue:** Type `Uploaded`
   - **NewValue:** Type `Rejected`
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Select `System`
   - **ClientApp Value:** Select `Power Automate`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Type `No files attached. Rejection email sent to student.`

#### Action 4: Terminate Flow (No Attachments)

**UI steps:**
1. Click **+ Add an action** in the NO branch
2. Search for and select **Terminate**
3. Rename the action to: `Terminate - No Attachments`
   - Click the **three dots (…)** → **Rename** → type `Terminate - No Attachments`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `Request rejected - no attachments. Email sent to student.`

---

### Step 6: Get Attachments (Inside YES Branch)

**What this does:** Retrieves the list of attachments to validate their filenames against the naming policy.

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch of "Check Has Attachments"
2. Search for and select **Get attachments** (SharePoint)
3. Rename the action to: `Get Attachments`
   - Click the **three dots (…)** → **Rename** → type `Get Attachments`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**

---

### Step 7: Validate First Attachment Filename

**What this does:** Checks if the first attachment follows the naming policy (FirstLast_Method_Color.ext). Uses the first attachment as representative of submission quality.

**UI steps:**
1. Click **+ Add an action** (after Get Attachments, still in YES branch)
2. Search for and select **Compose**
3. Rename the action to: `Get First Filename`
   - Click the **three dots (…)** → **Rename** → type `Get First Filename`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
first(outputs('Get_Attachments')?['body'])?['DisplayName']
```

---

### Step 8: Check Filename Has Valid Extension

**What this does:** Verifies the file has an accepted 3D file extension (.stl, .obj, .3mf, .idea, .form).

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Check Valid Extension`
   - Click the **three dots (…)** → **Rename** → type `Check Valid Extension`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
or(endsWith(toLower(outputs('Get_First_Filename')), '.stl'), endsWith(toLower(outputs('Get_First_Filename')), '.obj'), endsWith(toLower(outputs('Get_First_Filename')), '.3mf'), endsWith(toLower(outputs('Get_First_Filename')), '.idea'), endsWith(toLower(outputs('Get_First_Filename')), '.form'))
```

---

### Step 9: Check Filename Has Three Underscores

**What this does:** Validates that the filename follows the FirstLast_Method_Color.ext format by checking for exactly 2 underscore segments (3 parts when split).

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Check Filename Format`
   - Click the **three dots (…)** → **Rename** → type `Check Filename Format`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
equals(length(split(first(split(outputs('Get_First_Filename'), '.')), '_')), 3)
```

**What this checks:**
- Removes the file extension (split by '.')
- Splits the base name by underscores
- Checks there are exactly 3 parts (FirstLast, Method, Color)

---

### Step 10: Validate Combined Filename Check

**What this does:** Combines the extension check and format check into a single validation result.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename the condition to: `Is Filename Valid`
   - Click the **three dots (…)** → **Rename** → type `Is Filename Valid`
4. Set up condition with **AND** logic:
   - Click **+ Add** → **Add row** to add a second condition
   - **Row 1 - Left box:** Click **Expression** tab (fx) → paste: `outputs('Check_Valid_Extension')` → click **Update**
   - **Row 1 - Middle:** Select **is equal to**
   - **Row 1 - Right box:** Type `true`
   - **Row 2 - Left box:** Click **Expression** tab (fx) → paste: `outputs('Check_Filename_Format')` → click **Update**
   - **Row 2 - Middle:** Select **is equal to**
   - **Row 2 - Right box:** Type `true`

**YES Branch:** Valid filename → Update item, log, send confirmation email (Step 11)  
**NO Branch:** Invalid filename → Reject and send guidance email (Step 10a)

---

### Step 10a: NO Branch — Invalid Filename (Rejection)

**What this does:** When the filename doesn't match the policy, marks the request as Rejected and sends the student an email explaining the correct format.

#### Action 1: Update Item as Rejected (Invalid Filename)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch of "Is Filename Valid"
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Reject - Invalid Filename`
   - Click the **three dots (…)** → **Rename** → type `Reject - Invalid Filename`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **Title:** Click **Expression** tab (fx) → paste: `outputs('Generate_Standardized_Display_Name')` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **Status Value:** Select `Rejected`
   - **StudentEmail:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **RejectionReason Value:** Select `File format not supported`
   - **LastAction Value:** Select `Rejected`
   - **LastActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**

#### Action 2: Send Invalid Filename Email

**UI steps:**
1. Click **+ Add an action** in the NO branch
2. Search for and select **Send an email from a shared mailbox (V2)** (Office 365 Outlook)
3. Rename the action to: `Send Invalid Filename Email`
   - Click the **three dots (…)** → **Rename** → type `Send Invalid Filename Email`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Original Mailbox Address:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **Subject:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('[', outputs('Generate_ReqKey'), '] Action needed: rename your 3D print file')
```
   - **Body:** Click **Code View button (`</>`)** at top right → Paste the HTML below:

```html
<p class="editor-paragraph">Your 3D print request was received, but the file name doesn't match our required format.<br><br>YOUR FILE:<br>@{outputs('Get_First_Filename')}<br><br>REQUIRED FORMAT:<br>FirstLast_Method_Color.ext<br><br>EXAMPLE:<br>JaneDoe_Filament_Blue.stl<br><br>WHAT TO DO:<br>1. Rename your file to match the format above<br>2. Use underscores (_) to separate the three parts<br>3. Submit a new request with the correctly named file<br><br>ACCEPTED FILE TYPES:<br>.stl, .obj, .3mf, .idea, .form<br><br>REQUEST DETAILS:<br>- Request ID: @{outputs('Generate_ReqKey')}<br>- Method: @{triggerOutputs()?['body/Method']?['Value']}<br>- Color: @{triggerOutputs()?['body/Color']?['Value']}<br><br>If you need assistance, please visit the lab during open hours or reply to this email.<br><br>---<br>Digital Fabrication Lab<br>Room 145 Atkinson Hall<br>coad-fablab@lsu.edu</p>
```

6. In the **Advanced parameters** section, click **Show all**
7. **Is HTML:** Toggle to **Yes**
8. **Importance:** Select `Normal`

#### Action 3: Log Rejection (Invalid Filename)

**UI steps:**
1. Click **+ Add an action** in the NO branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Rejection - Invalid Filename`
   - Click the **three dots (…)** → **Rename** → type `Log Rejection - Invalid Filename`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Auto-Rejected: Invalid Filename`
   - **RequestID:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **Action Value:** Select `Rejected`
   - **FieldName:** Type `Filename`
   - **OldValue:** Click **Expression** tab (fx) → paste: `outputs('Get_First_Filename')` → click **Update**
   - **NewValue:** Type `Invalid format - must be FirstLast_Method_Color.ext`
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Select `System`
   - **ClientApp Value:** Select `Power Automate`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('Filename "', outputs('Get_First_Filename'), '" does not match required format. Rejection email sent.')
```

#### Action 4: Terminate Flow (Invalid Filename)

**UI steps:**
1. Click **+ Add an action** in the NO branch
2. Search for and select **Terminate**
3. Rename the action to: `Terminate - Invalid Filename`
   - Click the **three dots (…)** → **Rename** → type `Terminate - Invalid Filename`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `Request rejected - invalid filename format. Email sent to student.`

---

### Step 11: YES Branch — Valid Submission

**What this does:** For valid submissions, updates the item with ReqKey and display name, logs the creation, and sends a confirmation email to the student.

#### Action 1: Update Item with ReqKey and Display Name

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch of "Is Filename Valid"
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Update Item with ReqKey`
   - Click the **three dots (…)** → **Rename** → type `Update Item with ReqKey`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **Title:** Click **Expression** tab (fx) → paste: `outputs('Generate_Standardized_Display_Name')` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **StudentEmail:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **LastAction Value:** Select `Created`
   - **LastActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**

#### Action 2: Log Request Created

**UI steps:**
1. Click **+ Add an action** in the YES branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Request Created`
   - Click the **three dots (…)** → **Rename** → type `Log Request Created`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Request Created`
   - **RequestID:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **Action Value:** Select `Created`
   - **FieldName:** Type `Title`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** tab (fx) → paste: `outputs('Generate_Standardized_Display_Name')` → click **Update**
   - **Actor Claims:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/Author']?['Claims']` → click **Update**
   - **ActorRole Value:** Select `Student`
   - **ClientApp Value:** Select `SharePoint Form`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Type `New 3D print request submitted with standardized display name`

#### Action 3: Send Confirmation Email

**UI steps:**
1. Click **+ Add an action** in the YES branch
2. Search for and select **Send an email from a shared mailbox (V2)** (Office 365 Outlook)
3. Rename the action to: `Send Confirmation Email`
   - Click the **three dots (…)** → **Rename** → type `Send Confirmation Email`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Original Mailbox Address:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **Subject:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('We received your 3D Print request – ', outputs('Generate_ReqKey'))
```
   - **Body:** Click **Code View button (`</>`)** at top right → Paste the HTML below:

> **Note:** The hyperlink uses an HTML `<a href="...">` anchor tag. When using Code View, HTML tags render correctly in the email.

> ⚠️ **Common Mistake:** Do NOT nest anchor tags. The `href` attribute should contain ONLY the URL, not another `<a>` tag. If your link shows as plain text, check for encoded characters like `&lt;` or `&quot;` in the href.

**Copy this exact HTML into Code View:**

```html
<p class="editor-paragraph">We received your 3D Print request.<br><br>REQUEST DETAILS:<br>- Request: @{outputs('Generate_Standardized_Display_Name')}<br>- Request ID: @{outputs('Generate_ReqKey')}<br>- Method: @{triggerOutputs()?['body/Method']?['Value']}<br>- Printer: @{triggerOutputs()?['body/Printer']?['Value']}<br>- Color: @{triggerOutputs()?['body/Color']?['Value']}<br><br>NEXT STEPS:<br>• Our team will review your request for technical feasibility<br>• You'll receive updates as your request progresses through our queue<br>• Estimated review time: 1-2 business days<br><br><a href="https://apps.powerapps.com/play/e/default-2d4dad3f-50ae-47d9-83a0-9ae2b1f466f8/a/d47fb3d1-176f-4f5a-adae-93185d79eb17?tenantId=2d4dad3f-50ae-47d9-83a0-9ae2b1f466f8">View all your requests</a><br><br>---<br>This is an automated message from the Digital Fabrication Lab.</p>
```

> ⚠️ **Update the URL:** Replace the Power Apps URL above with your actual Student Portal app URL.

6. In the **Advanced parameters** section, click **Show all**
7. **Is HTML:** Toggle to **Yes**
8. **Importance:** Select `Normal`

**Expressions reference:**
| Placeholder | Expression |
|-------------|------------|
| Display Name | `outputs('Generate_Standardized_Display_Name')` |
| ReqKey | `outputs('Generate_ReqKey')` |
| Method | `triggerOutputs()?['body/Method']?['Value']` |
| Printer | `triggerOutputs()?['body/Printer']?['Value']` |
| Color | `triggerOutputs()?['body/Color']?['Value']` |

#### Action 4: Log Email Sent

**UI steps:**
1. Click **+ Add an action** in the YES branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Email Sent`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Confirmation`
   - **RequestID:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Generate_ReqKey')` → click **Update**
   - **Action Value:** Select `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** tab (fx) → paste: `outputs('Get_Student_Email')` → click **Update**
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Select `System`
   - **ClientApp Value:** Select `Power Automate`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Type `Confirmation email sent to student`

---

## Testing Checklist

### Pre-Testing Setup
- [ ] PrintRequests list has all required columns (ReqKey, Status, StudentEmail, etc.)
- [ ] AuditLog list exists with required columns
- [ ] Shared mailbox `coad-fablab@lsu.edu` is accessible
- [ ] Flow owner has "Send As" permissions on shared mailbox
- [ ] Student Portal Power App is published and URL is updated in flow

### Valid Submission Tests
- [ ] Submit request with valid filename (e.g., `JaneDoe_Filament_Blue.stl`)
- [ ] ReqKey generated correctly (format: `REQ-00001`)
- [ ] Title updated to standardized display name
- [ ] StudentEmail populated correctly
- [ ] Confirmation email received with all details
- [ ] "View all your requests" link works and opens Student Portal
- [ ] Two AuditLog entries created (Request Created + Email Sent)

### No Attachment Tests
- [ ] Submit request with no file attached
- [ ] Request marked as Rejected
- [ ] RejectionReason set to "Incomplete request information"
- [ ] "No attachment" email received with instructions
- [ ] AuditLog entry created with rejection reason
- [ ] Flow terminates with success status

### Invalid Filename Tests
- [ ] Submit with wrong format (e.g., `my_model.stl`)
- [ ] Submit with wrong extension (e.g., `JaneDoe_Filament_Blue.pdf`)
- [ ] Submit with missing parts (e.g., `JaneDoe_Blue.stl` - no method)
- [ ] Request marked as Rejected
- [ ] RejectionReason set to "File format not supported"
- [ ] "Invalid filename" email received showing the actual filename and correct format
- [ ] AuditLog entry created with filename in OldValue
- [ ] Flow terminates with success status

### Edge Cases
- [ ] Very long filenames handled correctly
- [ ] Special characters in student name cleaned properly
- [ ] Multiple attachments (first one validated)
- [ ] Retry policy activates on SharePoint throttling
- [ ] Uppercase file extensions work (e.g., `.STL`)

---

## Expression Reference

### Trigger Outputs (PrintRequests item that triggered the flow)

| Purpose | Expression |
|---------|------------|
| Item ID | `triggerOutputs()?['body/ID']` |
| Has Attachments | `triggerOutputs()?['body/{HasAttachments}']` |
| Author Name | `triggerOutputs()?['body/Author']?['DisplayName']` |
| Author Email | `triggerOutputs()?['body/Author']?['Email']` |
| Author Claims | `triggerOutputs()?['body/Author']?['Claims']` |
| Method (choice) | `triggerOutputs()?['body/Method']?['Value']` |
| Color (choice) | `triggerOutputs()?['body/Color']?['Value']` |
| Printer (choice) | `triggerOutputs()?['body/Printer']?['Value']` |

### Generated Values

| Purpose | Expression |
|---------|------------|
| ReqKey | `outputs('Generate_ReqKey')` |
| Standardized Display Name | `outputs('Generate_Standardized_Display_Name')` |
| Student Email (lowercase) | `outputs('Get_Student_Email')` |
| First Filename | `outputs('Get_First_Filename')` |
| Is Extension Valid | `outputs('Check_Valid_Extension')` |
| Is Format Valid | `outputs('Check_Filename_Format')` |

### Common Utility Expressions

| Purpose | Expression |
|---------|------------|
| Current UTC Time | `utcNow()` |
| Flow Run ID | `workflow()['run']['name']` |
| Format number with leading zeros | `formatNumber(value, '00000')` |

---

## Architecture Notes

### Flow Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  TRIGGER: PrintRequests item created                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Generate ReqKey                                        │
│  → Format: REQ-00001 (5-digit zero-padded)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Generate Standardized Display Name                     │
│  → Format: FirstLast_Method_Color_REQ-00001                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Get Student Email                                      │
│  → Lowercase normalized email                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Check Has Attachments                                  │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (No Files)       │ YES (Has Files)                           │
│ → Reject            │ → Continue to Step 6                      │
│ → Send email        │                                           │
│ → Log & Terminate   │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (YES only)
┌─────────────────────────────────────────────────────────────────┐
│  Steps 6-9: Filename Validation                                 │
│  → Get attachments → Check extension → Check format             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 10: Is Filename Valid?                                    │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (Invalid)        │ YES (Valid)                               │
│ → Reject            │ → Continue to Step 11                     │
│ → Send email        │                                           │
│ → Log & Terminate   │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (YES only)
┌─────────────────────────────────────────────────────────────────┐
│  Step 11: Valid Submission Actions                              │
│  → Update item with ReqKey                                      │
│  → Log "Request Created"                                        │
│  → Send confirmation email                                      │
│  → Log "Email Sent"                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Email Subject Formats

| Scenario | Subject Format |
|----------|----------------|
| Valid submission | `We received your 3D Print request – REQ-00001` |
| No attachments | `[REQ-00001] Action needed: attach your 3D print file` |
| Invalid filename | `[REQ-00001] Action needed: rename your 3D print file` |

### Integration with Other Flows

| Flow | Dependency | Notes |
|------|------------|-------|
| **Flow A** | None | Runs first on item creation |
| **Flow B** | Needs ReqKey from Flow A | Triggers on modification, reads ReqKey |
| **Flow C** | Needs ReqKey from Flow A | Called from Power Apps, logs staff actions |
| **Flow D** | Needs ReqKey from Flow A | Sends message notifications |

**Request Lifecycle:**
1. Student submits request via SharePoint form
2. **Flow A** validates, assigns ReqKey, sends confirmation
3. Staff reviews in Power Apps, approves/rejects
4. **Flow B** logs changes, sends status emails
5. **Flow C** logs staff actions from dashboard buttons

---

## Troubleshooting

### ReqKey Not Generated

| Symptom | Check | Solution |
|---------|-------|----------|
| ReqKey is blank | Generate ReqKey action | Verify expression uses correct path to ID |
| ReqKey format wrong | formatNumber expression | Ensure format string is `'00000'` (5 zeros) |

### Email Not Sending

| Symptom | Check | Solution |
|---------|-------|----------|
| Flow runs but no email | Student email field | Verify `outputs('Get_Student_Email')` returns value |
| Email action fails | Mailbox permissions | Flow owner needs "Send As" on shared mailbox |
| Link not clickable | Email body HTML | Ensure href contains ONLY the URL (no nested tags) |

### Filename Validation Issues

| Symptom | Check | Solution |
|---------|-------|----------|
| Valid files rejected | Extension check | Verify extensions are lowercase in check |
| Invalid files accepted | Format check | Verify split by underscore produces 3 parts |
| Attachments not found | Get Attachments action | Check Site Address and List Name match exactly |

### Common Expression Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid expression" | Missing quotes | Use single quotes inside expressions |
| "Property not found" | Wrong path | Check exact field name in SharePoint |
| "Cannot read property" | Null value | Add null checks or use `coalesce()` |

---

## Action Naming Summary

Use these exact names when renaming actions in Power Automate:

| Step | Action Type | Rename To |
|------|-------------|-----------|
| 2 | Compose | `Generate ReqKey` |
| 3 | Compose | `Generate Standardized Display Name` |
| 4 | Compose | `Get Student Email` |
| 5 | Condition | `Check Has Attachments` |
| 5a-1 | Update item | `Reject - No Attachments` |
| 5a-2 | Send email | `Send No Attachment Email` |
| 5a-3 | Create item | `Log Rejection - No Attachments` |
| 5a-4 | Terminate | `Terminate - No Attachments` |
| 6 | Get attachments | `Get Attachments` |
| 7 | Compose | `Get First Filename` |
| 8 | Compose | `Check Valid Extension` |
| 9 | Compose | `Check Filename Format` |
| 10 | Condition | `Is Filename Valid` |
| 10a-1 | Update item | `Reject - Invalid Filename` |
| 10a-2 | Send email | `Send Invalid Filename Email` |
| 10a-3 | Create item | `Log Rejection - Invalid Filename` |
| 10a-4 | Terminate | `Terminate - Invalid Filename` |
| 11-1 | Update item | `Update Item with ReqKey` |
| 11-2 | Create item | `Log Request Created` |
| 11-3 | Send email | `Send Confirmation Email` |
| 11-4 | Create item | `Log Email Sent` |

**Why rename actions?**
- Makes flow easier to read and debug
- Expression references use action names (spaces become underscores)
- Example: `outputs('Generate_ReqKey')` references the "Generate ReqKey" action

---

## Key Features

✅ **Unique ReqKey Generation** — Every request gets a unique identifier (REQ-00001)  
✅ **Standardized Display Names** — Consistent naming: FirstLast_Method_Color_ReqKey  
✅ **Filename Validation** — Auto-rejects invalid file names with guidance emails  
✅ **No Attachment Detection** — Catches submissions without files  
✅ **Student Notifications** — Confirmation emails with Student Portal link  
✅ **Complete Audit Logging** — Tracks all actions with FlowRunId and timestamps  
✅ **Rejection Guidance** — Specific emails tell students exactly what to fix  
✅ **Error Handling** — Exponential retry policies on all critical actions  
✅ **Shared Mailbox Integration** — Sends from `coad-fablab@lsu.edu` for consistent sender identity

---

## Error Handling Notes

- **Early Termination:** Invalid submissions terminate flow after logging and emailing
- **No Infinite Loops:** Flow only triggers on CREATE, not MODIFY
- **Audit Trail:** All outcomes (valid, no attachment, invalid filename) are logged
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint/Exchange
