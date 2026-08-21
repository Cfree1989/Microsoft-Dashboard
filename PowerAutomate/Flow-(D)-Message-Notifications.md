# Flow D (PR-Message)

**Full Name:** PR-Message: Send notifications  
**Trigger:** SharePoint — When an item is **created or modified** (List: `RequestComments`)

**Purpose:** Send email notifications when messages are exchanged between staff and students, with email threading support for reply tracking.

---

## Quick Overview

This flow runs automatically when a new message is added to the RequestComments list. Here's what happens:

1. **Trigger only when ready:** `ReadyToEmail` is Yes **and** `MessageID` is still empty (skips inbound, drafts, and the post-send update)
2. **Look up print request details** (ReqKey, student info)
3. **Initialize ThreadID** (root level, before any conditions)
4. **Initialize EmailAttachments** (root level empty array)
5. **Check direction** (Outbound = staff message, Inbound = student reply)
6. **If outbound:** Check for existing thread (reuse ThreadID or generate new one)
7. **Generate MessageID** for email threading
8. **Check author role** (Staff)
9. **Get comment attachments**
10. **Has screenshots?** If yes, get each file’s content into `EmailAttachments`
11. **Send threaded email** to student from shared mailbox, with those files attached
12. **Update message** with threading info (ThreadID, MessageID) — that update does **not** email again
13. **Log to audit** for tracking

---

## Overview

- **Staff sends message** → Student receives threaded email notification
- **Student sends message** → NeedsAttention flag set on request (inbound replies handled by Flow E)
- **Email threading** → All messages in a conversation stay in the same email thread

---

## Prerequisites

- [ ] `RequestComments` SharePoint list created with threading columns **and** `ReadyToEmail` (see `SharePoint/RequestComments-List-Setup.md`)
- [ ] List attachments enabled on `RequestComments`
- [ ] Staff app + Flow K deployed together with this trigger change (old Send never sets `ReadyToEmail`, so those messages would never email)
- [ ] `PrintRequests` list with `NeedsAttention` field
- [ ] `AuditLog` list exists
- [ ] Shared mailbox `coad-fablab@lsu.edu` configured
- [ ] Flow owner has "Send As" permissions on shared mailbox

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

## Step-by-Step Implementation

### Step 1: Flow Creation Setup

**UI steps:**
1. Go to **Power Automate** → **Create** → **Automated cloud flow**
2. Name: `Flow-(D)-Message-Notifications`
3. Choose trigger: **SharePoint – When an item is created or modified**
4. Fill in:
   - **Site address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List name:** `RequestComments`
5. Click **Create**
6. **Trigger settings (required — prevents double email):**
   - Click the trigger **…** → **Settings**
   - **Split on:** **On**
     - **Array:** `@triggerOutputs()?['body/value']`
     - **Split-on tracking ID:** `@guid()`
   - **Concurrency control:** On, **Degree of parallelism:** `1`
   - **Trigger conditions:** add **both** of these (Settings → Trigger conditions → Add):

```
@equals(triggerBody()?['ReadyToEmail'], true)
```

```
@empty(coalesce(triggerBody()?['MessageID'], ''))
```

> **Why these conditions:** The app creates the row with `ReadyToEmail = No`. After screenshots upload, it sets `ReadyToEmail = Yes` (flow starts). After this flow writes `MessageID`, later edits to the same item do not send again. Use **created or modified** so the email waits until files are on the row.

### Editing an existing Flow D (trigger swap)

1. Click the **first card** → SharePoint **When an item is created or modified**
2. Same site, list **RequestComments**
3. Settings: Split on **Array** `@triggerOutputs()?['body/value']`, **tracking ID** `@guid()`, concurrency **1**, the two trigger conditions above
4. Rebind fields that used the old trigger:

| Action | Field | Expression or dynamic content |
|--------|--------|--------------------------------|
| Get Print Request | Id | `triggerOutputs()?['body/RequestID']` |
| Send Threaded Email | To | Dynamic content: trigger **StudentEmail**, or fx `triggerOutputs()?['body/StudentEmail']` |
| Send Threaded Email | Subject | `concat('[', outputs('Get_Print_Request')?['body/ReqKey'], '] ', triggerOutputs()?['body/Title'])` |
| Send Threaded Email | Body | Include `@{triggerOutputs()?['body/Message']}` and `@{triggerOutputs()?['body/Author0']?['DisplayName']}` |
| Update Message with Threading | Id | `triggerOutputs()?['body/ID']` |
| Update Message with Threading | RequestID | `triggerOutputs()?['body/RequestID']` |
| Update Message with Threading | Message | `triggerOutputs()?['body/Message']` |

5. Then add Step 10 and Step 11 before send.

#### To

1. Click **inside** the To field so **Dynamic content** / **Expression** opens.
2. Pick **StudentEmail** from **When an item is created or modified**, or fx `triggerOutputs()?['body/StudentEmail']` then **Add**.
3. If StudentEmail is not in the list: Compose with that expression, then pick the Compose in To.

**Mailbox:** `coad-fablab@lsu.edu`

---

### Step 2: Get Print Request

**What this does:** Retrieves the parent print request details (ReqKey, student info, etc.) using the RequestID stored in the comment.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Print Request`
   - Click the **three dots (…)** → **Rename** → type `Get Print Request`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/RequestID']` → click **Update**

---

### Step 3: Initialize ThreadID Variable (Root Level)

**What this does:** Creates an empty ThreadID variable at the root level. This MUST be done before any conditions because Power Automate does not allow Initialize Variable actions inside conditions or loops.

> ⚠️ **Important:** Initialize Variable actions CANNOT be nested inside conditions, loops, or any other control actions. They must always be at the root (top) level of the flow.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize ThreadID`
   - Click the **three dots (…)** → **Rename** → type `Initialize ThreadID`
4. Fill in:
   - **Name:** Type `ThreadID`
   - **Type:** Select `String`
   - **Value:** Leave empty (we'll set it later based on thread existence)

---

### Step 4: Initialize EmailAttachments Variable (Root Level)

**What this does:** Creates an empty array at root level. Screenshot files are appended here in Step 11. Initialize Variable cannot sit inside a condition.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize EmailAttachments`
   - Click the **three dots (…)** → **Rename** → type `Initialize EmailAttachments`
4. Fill in:
   - **Name:** Type `EmailAttachments`
   - **Type:** Select `Array`
   - **Value:** Click **Expression** tab (fx) → paste `json('[]')` → click **Update** (empty array — stays empty when there is no screenshot)

---

### Step 5: Check Direction (Skip Inbound Messages)

**What this does:** Flow D only sends emails for outbound (staff) messages. Inbound messages are processed by Flow E. This check prevents duplicate processing.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Check if Outbound Message`
   - Click the **three dots (…)** → **Rename** → type `Check if Outbound Message`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/Direction']?['Value']` → click **Update**
   - **Middle:** Select **is equal to**
   - **Right box:** Type `Outbound` (without quotes)

**YES Branch:** Continue with email sending (Steps 6–14)  
**NO Branch:** Terminate flow (inbound messages don't need email notification)

#### NO Branch — Terminate (Inbound Message)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - Inbound Message`
   - Click the **three dots (…)** → **Rename** → type `Stop Flow - Inbound Message`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `Inbound message - no email notification needed (handled by Flow E)`

---

### Step 6: Check for Existing Thread (Inside YES Branch)

**What this does:** Determines if this is the first message in a conversation or a reply to an existing thread. Looks for any previous outbound messages for the same request.

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch
2. Search for and select **Get items** (SharePoint)
3. Rename the action to: `Get Existing Thread Messages`
   - Click the **three dots (…)** → **Rename** → type `Get Existing Thread Messages`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in basic fields:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
6. In the **Advanced parameters** section, click **Show all** to expand all 6 parameters
7. Fill in advanced fields:
   - **Filter Query:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('RequestID eq ', triggerOutputs()?['body/RequestID'], ' and Direction eq ''Outbound'' and ID ne ', triggerOutputs()?['body/ID'])
```
   - **Top Count:** Type `1`
   - **Order By:** Type `SentAt desc`

**Filter Query Explanation:**
- `RequestID eq [ID]` — Same print request
- `Direction eq 'Outbound'` — Only staff messages (we only thread outbound messages)
- `ID ne [current ID]` — Exclude the message that just triggered this flow

---

### Step 7: Set ThreadID Based on Thread Existence

**What this does:** Sets the ThreadID variable — either reuses an existing ThreadID for replies, or generates a new one for new conversations. This ensures all messages about the same request stay grouped in the student's email client.

**UI steps:**
1. Click **+ Add an action** (still inside YES branch, after Get Existing Thread Messages)
2. Search for and select **Condition**
3. Rename the condition to: `Check if Thread Exists`
   - Click the **three dots (…)** → **Rename** → type `Check if Thread Exists`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `length(outputs('Get_Existing_Thread_Messages')?['body/value'])` → click **Update**
   - **Middle:** Select **is greater than**
   - **Right box:** Type `0`

#### YES Branch (Existing Thread — Reuse ThreadID)

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch
2. Search for and select **Set variable**
3. Rename the action to: `Use Existing ThreadID`
   - Click the **three dots (…)** → **Rename** → type `Use Existing ThreadID`
4. Fill in:
   - **Name:** Select `ThreadID` from dropdown
   - **Value:** Click **Expression** tab (fx) → paste: `first(outputs('Get_Existing_Thread_Messages')?['body/value'])?['ThreadID']` → click **Update**

#### NO Branch (New Thread — Generate ThreadID)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch
2. Search for and select **Set variable**
3. Rename the action to: `Generate New ThreadID`
   - Click the **three dots (…)** → **Rename** → type `Generate New ThreadID`
4. Fill in:
   - **Name:** Select `ThreadID` from dropdown
   - **Value:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat(outputs('Get_Print_Request')?['body/ReqKey'], '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))
```

**ThreadID Format:** `REQ-00001-20260112143052`
- ReqKey prefix ensures uniqueness per request
- Timestamp ensures uniqueness for multiple conversation threads

---

### Step 8: Generate Message ID

**What this does:** Creates a unique Message-ID for email threading. This ID follows email standards and helps email clients group related messages together.

**UI steps:**
1. Click **+ Add an action** (after the Thread Exists condition, outside both branches)
2. Search for and select **Compose**
3. Rename the action to: `Generate MessageID`
   - Click the **three dots (…)** → **Rename** → type `Generate MessageID`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('<', variables('ThreadID'), '-', formatDateTime(utcNow(), 'HHmmss'), '@fablab.lsu.edu>')
```

**MessageID Format:** `<REQ-00001-20260112143052-143052@fablab.lsu.edu>`
- Angle brackets required by email standard
- ThreadID ensures messages group together
- Timestamp suffix ensures uniqueness per message
- Domain makes it a valid Message-ID format

---

### Step 9: Check Author Role

**What this does:** Verifies this is a staff message before sending email. This is a safety check since we already filtered by Direction = Outbound.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename the condition to: `Check if Staff Message`
   - Click the **three dots (…)** → **Rename** → type `Check if Staff Message`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/AuthorRole']?['Value']` → click **Update**
   - **Middle:** Select **is equal to**
   - **Right box:** Type `Staff` (without quotes)

**YES Branch:** Staff message confirmed → Get attachments, then email (Steps 10–14)  
**NO Branch:** Not a staff message → Terminate (shouldn't happen if Direction = Outbound)

---

### Step 10: Get Comment Attachments

**What this does:** Reads list attachments on this `RequestComments` row. They are already on the item because the app only sets `ReadyToEmail` after Flow K finishes.

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch of "Check if Staff Message" (**before** Send Threaded Email)
2. Search for **Get attachments** (SharePoint)
3. Rename to: `Get Comment Attachments`
   - Click the **three dots (…)** → **Rename** → type `Get Comment Attachments`
4. Retry policy: Exponential interval, Count `4`, Interval `PT1M`, Minimum `PT20S`, Maximum `PT1H`
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
   - **Id:** Expression `triggerOutputs()?['body/ID']`

The files are `body('Get_Comment_Attachments')` (an array).

---

### Step 11: Has Screenshots

**What this does:** If the comment has files, load each one into the `EmailAttachments` array. If not, leave the array empty and continue to send.

**UI steps:**
1. Click **+ Add an action** after `Get Comment Attachments`
2. Search for and select **Condition**
3. Rename the condition to: `Has Screenshots`
   - Click the **three dots (…)** → **Rename** → type `Has Screenshots` (no `?` in the name)
4. Set up condition:
   - **Left box:** Expression `length(body('Get_Comment_Attachments'))`
   - **Middle:** is greater than
   - **Right box:** `0`

#### YES branch (has files)

5. **Apply to each** named `For Each Screenshot`
   - Output: `body('Get_Comment_Attachments')`
6. Inside the loop: **Get attachment content** (SharePoint)
   - Rename: `Get Screenshot Content`
   - Site / List: same as Step 10
   - **Id:** `triggerOutputs()?['body/ID']`
   - **File Identifier:** `items('For_Each_Screenshot')?['Id']`
7. Still inside the loop: **Append to array variable** (search **Variable** → **Append to array variable**)
   - Rename: `Append Screenshot to EmailAttachments`
   - **Name:** `EmailAttachments` (the array from Step 4)
   - **Value:** click **fx**, paste, **Add**:

```
addProperty(addProperty(json('{}'), 'Name', coalesce(items('For_Each_Screenshot')?['DisplayName'], items('For_Each_Screenshot')?['Name'])), 'ContentBytes', body('Get_Screenshot_Content'))
```

   Value shows a purple `addProperty(...)` pill.

#### NO branch (no files)

Do nothing (array stays `[]`). After this condition, **both** branches continue to Step 12 (send email).

---

### Step 12: Send Threaded Email

**UI steps:**
1. Click **+ Add an action** after the **Has Screenshots** condition (outside both of its branches, still inside Check if Staff Message = YES)
2. Search for and select **Send an email from a shared mailbox (V2)** (Office 365 Outlook)
3. Rename the action to: `Send Threaded Email to Student`
   - Click the **three dots (…)** → **Rename** → type `Send Threaded Email to Student`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Original Mailbox Address:** `coad-fablab@lsu.edu`
   - **To:** Dynamic content → trigger **StudentEmail**, or fx `triggerOutputs()?['body/StudentEmail']` (see **To** under Step 1)
   - **Subject:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('[', outputs('Get_Print_Request')?['body/ReqKey'], '] ', triggerOutputs()?['body/Title'])
```

> **Important:** The `[REQ-00001]` prefix in the subject enables Flow E to parse student replies and match them to the correct request. Do not change this format.

6. **Body:** Click **Code View button (`</>`)** at top right of the Body field, then paste the HTML below:

```html
<p class="editor-paragraph">Hi @{outputs('Get_Print_Request')?['body/Student']?['DisplayName']},<br><br>You have a new message about your print request.<br><br>MESSAGE:<br>@{triggerOutputs()?['body/Message']}<br><br>---<br>Request: @{outputs('Get_Print_Request')?['body/ReqKey']}<br>From: @{triggerOutputs()?['body/Author0']?['DisplayName']}<br><br>You can reply directly to this email, and your response will be added to your request.<br><br>Digital Fabrication Lab<br>Room 113 Art Building<br>coad-fablab@lsu.edu</p>
```

> 💡 **Screenshots:** Files go on the email as attachments from `EmailAttachments`. Message text stays plain.


> ⚠️ **Important:** Use `Author0` (the custom Person column), not `Author` (the built-in "Created By" field). `Author` would always show whoever is logged into Power Apps, not the staff member selected in the "Performing Action As" dropdown.

7. Open **Advanced parameters** → **Show all** (if Attachments is not already visible)
8. **Is HTML:** **Yes**
9. **Importance:** `Normal`
10. **Attachments:** leave CC/BCC empty. On the **Attachments** row, click the **array / T** icon on the right (switches from **+ Add new item** to one field). Click **fx** and set:

```
variables('EmailAttachments')
```

Leave the array empty only if you skipped Steps 4 and 11. With those steps in place, `[]` is text-only; files from Step 11 go on the email.

> **Note:** The Office 365 Outlook connector's "Send an email from a shared mailbox (V2)" action automatically handles Message-ID generation. We store our generated MessageID in SharePoint for reference and future threading.

---

#### Step 13: Update RequestComments with Threading Info

**What this does:** Stores the ThreadID and MessageID back on the comment record for tracking and threading future messages.

**UI steps:**
1. Click **+ Add an action** (after Send Threaded Email, still in YES branch)
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Update Message with Threading`
   - Click the **three dots (…)** → **Rename** → type `Update Message with Threading`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in the required fields first (pass back original values so they don't get cleared):
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **RequestID:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/RequestID']` → click **Update**
   - **Message:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/Message']` → click **Update**
6. Fill in the new threading fields:
   - **ThreadID:** Click **Expression** tab (fx) → paste: `variables('ThreadID')` → click **Update**
   - **MessageID:** Click **Expression** tab (fx) → paste: `outputs('Generate_MessageID')` → click **Update**

> **Note:** RequestID and Message are required fields in SharePoint. By passing back the original values from `triggerOutputs()`, you satisfy the requirement without changing the existing data.

---

#### Step 14: Log to Audit

**What this does:** Creates an audit trail entry recording that a message was sent to the student.

**UI steps:**
1. Click **+ Add an action** (after Update Message with Threading)
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Message Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Message Sent`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings** → scroll to **Networking**
   - **Retry policy:** Select `Exponential interval`
   - **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Message Sent to Student`
   - **RequestID:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/RequestID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Get_Print_Request')?['body/ReqKey']` → click **Update**
   - **Action Value:** Type `Message Sent`
   - **FieldName:** Type `ThreadID`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** tab (fx) → paste: `variables('ThreadID')` → click **Update**
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('Staff message sent to ', triggerOutputs()?['body/StudentEmail'], ' in thread ', variables('ThreadID'))
```

---

### Step 15: NO Branch (Not Staff Message — Safety Terminate)

**What this does:** This branch handles the edge case where AuthorRole is not "Staff". Since we already filter by Direction = Outbound in Step 5, this should rarely execute. It's a safety net to prevent unexpected behavior.

> **Note:** This branch exists for completeness. Flow D only processes outbound messages from staff. Inbound student replies are handled by Flow E (PR-Mailbox). Direction was already filtered in Step 5.

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch of "Check if Staff Message"
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - Not Staff Message`
   - Click the **three dots (…)** → **Rename** → type `Stop Flow - Not Staff Message`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `Message author is not Staff - no email notification sent`

---

## Testing Checklist

### Pre-Testing Setup
- [ ] RequestComments list has ThreadID and MessageID columns
- [ ] PrintRequests list has NeedsAttention field
- [ ] AuditLog list exists with required columns
- [ ] Shared mailbox `coad-fablab@lsu.edu` is accessible
- [ ] Flow owner has "Send As" permissions on shared mailbox

### Basic Functionality
- [ ] Staff sends message via Power Apps → Student receives email
- [ ] Email subject contains `[REQ-00001]` prefix format
- [ ] Email body contains message content (plain text in the HTML wrapper)
- [ ] Email includes screenshot files when staff attached them in the messages modal
- [ ] Text-only messages still send with no files
- [ ] Email body contains reply instructions
- [ ] Email body contains request details (ReqKey, Author name)
- [ ] AuditLog entry created with correct fields

### ReadyToEmail / screenshots
- [ ] New comment with `ReadyToEmail = No` does **not** start Flow D
- [ ] After `ReadyToEmail = Yes`, student receives the email
- [ ] PNG attached via Flow K appears on the student email
- [ ] Flow D writing ThreadID/MessageID does **not** send a second email
- [ ] Two screenshots on one message both arrive on the email
- [ ] A 2–5 MB slice screenshot still sends

### Email Threading
- [ ] First message creates new ThreadID (format: `REQ-00001-20260112143052`)
- [ ] First message creates new MessageID (format: `<REQ-00001-20260112143052-143052@fablab.lsu.edu>`)
- [ ] RequestComments item updated with ThreadID and MessageID
- [ ] Second staff message to same request reuses existing ThreadID
- [ ] Multiple messages appear in same email thread in student's inbox
- [ ] Student can reply to email (reply processed by Flow E)

### Direction Filtering
- [ ] Outbound messages (Direction = "Outbound") trigger email sending
- [ ] Inbound messages (Direction = "Inbound") terminate without email
- [ ] Direction field correctly identifies message type in all cases

### Author Role Validation
- [ ] AuthorRole = "Staff" sends email successfully
- [ ] AuthorRole ≠ "Staff" terminates without email (safety check)

### Edge Cases
- [ ] Multiple staff messages to same request stay in same thread
- [ ] Messages to different requests get different ThreadIDs
- [ ] Flow handles missing StudentEmail gracefully (check for errors)
- [ ] Flow handles special characters in message content
- [ ] Retry policy activates on SharePoint throttling

### Audit Trail Verification
- [ ] AuditLog entry has correct RequestID
- [ ] AuditLog entry has correct ReqKey
- [ ] AuditLog entry has Action = "Message Sent"
- [ ] AuditLog entry has FlowRunId populated
- [ ] AuditLog entry has ActionAt timestamp
- [ ] AuditLog entry Notes contains student email and ThreadID

---

## Expression Reference

### Trigger Outputs (RequestComments item that triggered the flow)

| Purpose | Expression |
|---------|------------|
| Comment ID | `triggerOutputs()?['body/ID']` |
| Request ID (lookup) | `triggerOutputs()?['body/RequestID']` |
| Direction (choice) | `triggerOutputs()?['body/Direction']?['Value']` |
| Author Role (choice) | `triggerOutputs()?['body/AuthorRole']?['Value']` |
| **Staff Member Name** (use this) | `triggerOutputs()?['body/Author0']?['DisplayName']` |
| **Staff Member Email** (use this) | `triggerOutputs()?['body/Author0']?['Email']` |
| Created By Name (system) | `triggerOutputs()?['body/Author']?['DisplayName']` |
| Created By Email (system) | `triggerOutputs()?['body/Author']?['Email']` |
| Message Subject/Title | `triggerOutputs()?['body/Title']` |
| Message Body | `triggerOutputs()?['body/Message']` |
| Student Email | `triggerOutputs()?['body/StudentEmail']` |

> ⚠️ **Important:** Use `Author0` for the staff member's name in emails. `Author` is the SharePoint "Created By" field which shows whoever is logged in, not the person selected in the "Performing Action As" dropdown.

### Get Print Request Outputs

| Purpose | Expression |
|---------|------------|
| ReqKey | `outputs('Get_Print_Request')?['body/ReqKey']` |
| Student Name | `outputs('Get_Print_Request')?['body/Student']?['DisplayName']` |
| Student Email | `outputs('Get_Print_Request')?['body/Student']?['Email']` |

### Threading Expressions

| Purpose | Expression |
|---------|------------|
| Generate New ThreadID | `concat(outputs('Get_Print_Request')?['body/ReqKey'], '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))` |
| Use Existing ThreadID | `first(outputs('Get_Existing_Thread_Messages')?['body/value'])?['ThreadID']` |
| Generate MessageID | `concat('<', variables('ThreadID'), '-', formatDateTime(utcNow(), 'HHmmss'), '@fablab.lsu.edu>')` |
| Email Subject Format | `concat('[', outputs('Get_Print_Request')?['body/ReqKey'], '] ', triggerOutputs()?['body/Title'])` |
| Thread Exists Check | `length(outputs('Get_Existing_Thread_Messages')?['body/value'])` |

### Variables

| Variable Name | Type | Purpose |
|---------------|------|---------|
| ThreadID | String | Stores the thread identifier for email grouping |
| EmailAttachments | Array | `{Name, ContentBytes}` objects for the Outlook send |

### Common Utility Expressions

| Purpose | Expression |
|---------|------------|
| Current UTC Time | `utcNow()` |
| Flow Run ID | `workflow()['run']['name']` |

---

## Architecture Notes

### Flow Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  TRIGGER: RequestComments created or modified                   │
│  Conditions: ReadyToEmail = true AND MessageID empty            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Get Print Request                                      │
│  → Retrieves parent request details (ReqKey, Student info)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Initialize ThreadID (ROOT LEVEL)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Initialize EmailAttachments (ROOT LEVEL, empty array)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Check if Outbound Message                              │
│  → Direction = "Outbound"?                                      │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (Inbound)        │ YES (Outbound)                            │
│ → Stop Flow -       │ → Continue to Step 6                      │
│   Inbound Message   │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (YES only)
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Get Existing Thread Messages                           │
│  → Find previous outbound messages for same request             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Check if Thread Exists                                 │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (New Thread)     │ YES (Existing Thread)                     │
│ → Generate New      │ → Use Existing ThreadID                   │
│   ThreadID          │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: Generate MessageID                                     │
│  → Create unique email Message-ID                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: Check if Staff Message                                 │
│  → AuthorRole = "Staff"?                                        │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (Not Staff)      │ YES (Staff)                               │
│ → Stop Flow - Not   │ → Continue to Step 10                     │
│   Staff Message     │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (YES only)
┌─────────────────────────────────────────────────────────────────┐
│  Step 10: Get Comment Attachments                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 11: Has Screenshots                                      │
├─────────────────────┬───────────────────────────────────────────┤
│ NO                  │ YES                                       │
│ → leave array empty │ → For Each Screenshot: get content,       │
│                     │   append to EmailAttachments              │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (both)
┌─────────────────────────────────────────────────────────────────┐
│  Step 12: Send Threaded Email to Student                        │
│  → Email with [REQ-00001] subject prefix + EmailAttachments     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 13: Update Message with Threading                         │
│  → Store ThreadID, MessageID on RequestComments item            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 14: Log Message Sent                                      │
│  → Create AuditLog entry                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Email Subject Format

**Outbound Format:** `[REQ-00001] Your subject here`
- Square brackets `[ ]` enable reliable regex parsing in Flow E
- ReqKey (`REQ-00001`) allows Flow E to match student replies to correct request
- Subject after prefix is the message title from the comment

### Integration with Flow E

| Flow | Direction | Purpose |
|------|-----------|---------|
| **Flow D** | Outbound | Staff → Student (sends email notification) |
| **Flow E** | Inbound | Student → Staff (processes email replies) |

**Message Lifecycle:**
1. Staff writes message (and optionally attaches screenshots) in Power Apps
2. Power Apps creates RequestComments item with `ReadyToEmail = No`
3. Flow K attaches each screenshot to that row
4. Power Apps sets `ReadyToEmail = Yes`
5. **Flow D** sends email to student with `[REQ-00001]` subject and those files
6. Student replies to email
7. **Flow E** receives reply, parses `[REQ-00001]` from subject
8. **Flow E** creates new RequestComments item (Direction: Inbound)
9. **Flow E** sets NeedsAttention = Yes on PrintRequest

See `Flow-(E)-Mailbox-InboundReplies.md` for inbound processing documentation.

---

## Troubleshooting

### Email Not Sending

| Symptom | Check | Solution |
|---------|-------|----------|
| Flow never starts (no run in history) | Trigger conditions / Split on | Array `@triggerOutputs()?['body/value']`, tracking ID `@guid()`. Conditions: `@equals(triggerBody()?['ReadyToEmail'], true)` and MessageID empty. |
| Flow runs but no email | Direction field | Ensure message has `Direction = Outbound` |
| Email has no screenshot | Attachments timing | Do not set `ReadyToEmail` until Flow K succeeds. Confirm the row’s paperclip in SharePoint. |
| Flow runs but no email | AuthorRole field | Ensure comment has `AuthorRole = Staff` |
| Email action fails | StudentEmail field | Verify StudentEmail is populated on the comment |
| Email action fails | Mailbox permissions | Flow owner needs "Send As" on `coad-fablab@lsu.edu` |
| Email action fails | Shared mailbox | Verify `coad-fablab@lsu.edu` exists and is accessible |
| Flow checker missing To / Id / RequestID / Message | Trigger swap | Rebind using the table under **Editing an existing Flow D** |
| Save fails: `InvalidWorkflowRunActionName` / `?` | Action rename | Rename `Has Screenshots?` to `Has Screenshots` |
| Flow checker: circular loop on Update Message with Threading | Expected | Trigger conditions skip the run once `MessageID` is set |

**How to check:**
1. Open the flow run history
2. Click on the failed run
3. Expand each action to see inputs/outputs
4. Check for error messages in red

### ThreadID Not Generated

| Symptom | Check | Solution |
|---------|-------|----------|
| ThreadID is empty | Variable initialization | Ensure `Initialize ThreadID` runs before `Set variable` |
| ThreadID is empty | Condition evaluation | Check if `Check if Thread Exists` evaluates correctly |
| Wrong ThreadID | Get items filter | Verify filter query returns expected results |

**Debug steps:**
1. Add a **Compose** action after `Initialize ThreadID` with value `variables('ThreadID')`
2. Run the flow and check the Compose output
3. Check the `Get Existing Thread Messages` action output

### Reply Not Threading in Email Client

| Symptom | Check | Solution |
|---------|-------|----------|
| Replies show as separate emails | Subject line | Ensure `[REQ-00001]` prefix is preserved in replies |
| MessageID format invalid | MessageID generation | Verify format is `<id@domain>` with angle brackets |
| Threading inconsistent | Email client | Some email clients handle threading differently |

**Email threading requirements:**
1. Subject line must remain consistent (same `[REQ-00001]` prefix)
2. MessageID must follow RFC 2822 format: `<unique-id@domain>`
3. Student must use "Reply" (not "New Message") to respond

### Flow Triggering Multiple Times

| Symptom | Check | Solution |
|---------|-------|----------|
| Duplicate emails sent | Trigger condition | Verify trigger is only on `RequestComments` list |
| Duplicate audit entries | Concurrency | Check if multiple flow instances ran |

**Prevention:**
- Flow only triggers on CREATE (not modify)
- Direction check prevents processing inbound messages twice

### Common Expression Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid expression" | Missing quotes | Use single quotes inside expressions: `'Outbound'` |
| "Property not found" | Wrong path | Check exact field name in SharePoint |
| "Cannot read property" | Null value | Use `coalesce()` or null checks |

---

## Action Naming Summary

Use these exact names when renaming actions in Power Automate:

| Step | Action Type | Rename To |
|------|-------------|-----------|
| 2 | Get item (SharePoint) | `Get Print Request` |
| 3 | Initialize variable | `Initialize ThreadID` |
| 4 | Initialize variable | `Initialize EmailAttachments` |
| 5 | Condition | `Check if Outbound Message` |
| 5 (NO) | Terminate | `Stop Flow - Inbound Message` |
| 6 | Get items (SharePoint) | `Get Existing Thread Messages` |
| 7 | Condition | `Check if Thread Exists` |
| 7 (YES) | Set variable | `Use Existing ThreadID` |
| 7 (NO) | Set variable | `Generate New ThreadID` |
| 8 | Compose | `Generate MessageID` |
| 9 | Condition | `Check if Staff Message` |
| 10 | Get attachments (SharePoint) | `Get Comment Attachments` |
| 11 | Condition | `Has Screenshots` |
| 11 (YES) | Apply to each / Get attachment content / Append to array | `For Each Screenshot` / `Get Screenshot Content` |
| 12 | Send email (V2) | `Send Threaded Email to Student` |
| 13 | Update item (SharePoint) | `Update Message with Threading` |
| 14 | Create item (SharePoint) | `Log Message Sent` |
| 15 | Terminate | `Stop Flow - Not Staff Message` |

**Why rename actions?**
- Makes flow easier to read and debug
- Expression references use action names (spaces become underscores)
- Example: `outputs('Get_Print_Request')` references the "Get Print Request" action

---

## Key Features

✅ **Direction-Based Routing** — Only processes outbound (staff) messages; inbound handled by Flow E  
✅ **Email Threading Support** — Generates and reuses ThreadIDs for conversation grouping  
✅ **Unique MessageIDs** — RFC 2822 compliant Message-IDs for email client threading  
✅ **Subject Line Parsing** — `[REQ-00001]` prefix enables Flow E to match replies  
✅ **Complete Audit Logging** — Tracks all sent messages with FlowRunId and timestamps  
✅ **Shared Mailbox Integration** — Sends from `coad-fablab@lsu.edu` for consistent sender identity  
✅ **Error Handling** — Exponential retry policies on all critical actions  
✅ **Safety Checks** — Validates Direction and AuthorRole before sending  
✅ **Detailed Documentation** — Step-by-step UI instructions with action names throughout

---

## Error Handling Notes

- **Double-send prevention:** Trigger runs on create **or** modify, but only when `ReadyToEmail` is true **and** `MessageID` is empty. Writing `MessageID` after send does not start another run. Concurrency on the trigger is 1.
- **Direction Filtering:** Inbound messages terminate early (processed by Flow E)
- **Author Validation:** Non-staff messages terminate with success status
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint/Exchange
- **Threading Persistence:** ThreadID/MessageID stored for future reference
