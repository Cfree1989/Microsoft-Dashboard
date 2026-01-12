# Flow D (PR-Message)

**Full Name:** PR-Message: Send notifications  
**Trigger:** SharePoint — When an item is **created** (List: `RequestComments`)

**Purpose:** Send email notifications when messages are exchanged between staff and students, with email threading support for reply tracking.

---

## Quick Overview

This flow runs automatically when a new message is added to the RequestComments list. Here's what happens:

1. **Check direction** (Outbound = staff message, Inbound = student reply)
2. **If outbound:** Look up the print request details
3. **Check for existing thread** (reuse ThreadID or generate new one)
4. **Generate MessageID** for email threading
5. **Send threaded email** to student from shared mailbox
6. **Update message** with threading info (ThreadID, MessageID)
7. **Log to audit** for tracking

---

## Overview

- **Staff sends message** → Student receives threaded email notification
- **Student sends message** → NeedsAttention flag set on request (inbound replies handled by Flow E)
- **Email threading** → All messages in a conversation stay in the same email thread

---

## Prerequisites

- [ ] `RequestComments` SharePoint list created with threading columns (see `RequestComments-Schema-Update.md`)
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
3. Choose trigger: **SharePoint – When an item is created**
4. Fill in:
   - **Site address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List name:** `RequestComments`
5. Click **Create**

---

### Step 2: Get Print Request

**What this does:** Retrieves the parent print request details (ReqKey, student info, etc.) using the RequestID stored in the comment.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Print Request`
   - Click the **three dots (…)** → **Rename** → type `Get Print Request`
4. **Configure retry policy** (see instructions above)
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/RequestID']` → click **Update**

---

### Step 3: Check Direction (Skip Inbound Messages)

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

**YES Branch:** Continue with email sending (Steps 4-8)  
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

### Step 4: Check for Existing Thread (Inside YES Branch)

**What this does:** Determines if this is the first message in a conversation or a reply to an existing thread. Looks for any previous outbound messages for the same request.

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch
2. Search for and select **Get items** (SharePoint)
3. Rename the action to: `Get Existing Thread Messages`
   - Click the **three dots (…)** → **Rename** → type `Get Existing Thread Messages`
4. **Configure retry policy** (see instructions above)
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
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

### Step 5: Generate Thread ID

**What this does:** Creates a new ThreadID for new conversations, or reuses existing ThreadID for replies. This ensures all messages about the same request stay grouped in the student's email client.

#### Step 5a: Initialize ThreadID Variable

**UI steps:**
1. Click **+ Add an action** (still inside YES branch, after Get Existing Thread Messages)
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize ThreadID`
   - Click the **three dots (…)** → **Rename** → type `Initialize ThreadID`
4. Fill in:
   - **Name:** Type `ThreadID`
   - **Type:** Select `String`
   - **Value:** Leave empty (we'll set it in the next step)

#### Step 5b: Set ThreadID Based on Thread Existence

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename the condition to: `Check if Thread Exists`
   - Click the **three dots (…)** → **Rename** → type `Check if Thread Exists`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `length(outputs('Get_Existing_Thread_Messages')?['body/value'])` → click **Update**
   - **Middle:** Select **is greater than**
   - **Right box:** Type `0`

##### YES Branch (Existing Thread — Reuse ThreadID)

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch
2. Search for and select **Set variable**
3. Rename the action to: `Use Existing ThreadID`
   - Click the **three dots (…)** → **Rename** → type `Use Existing ThreadID`
4. Fill in:
   - **Name:** Select `ThreadID` from dropdown
   - **Value:** Click **Expression** tab (fx) → paste: `first(outputs('Get_Existing_Thread_Messages')?['body/value'])?['ThreadID']` → click **Update**

##### NO Branch (New Thread — Generate ThreadID)

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

### Step 6: Generate Message ID

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

### Step 7: Check Author Role

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

**YES Branch:** Staff message confirmed → Send email to student (Step 8)  
**NO Branch:** Not a staff message → Terminate (shouldn't happen if Direction = Outbound)

---

### Step 8: YES Branch (Staff → Email Student)

**What this does:** Sends a threaded email notification to the student, updates the message record with threading info, and logs the action to the audit trail.

#### Step 8a: Send Threaded Email

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch of "Check if Staff Message"
2. Search for and select **Send an email from a shared mailbox (V2)** (Office 365 Outlook)
3. Rename the action to: `Send Threaded Email to Student`
   - Click the **three dots (…)** → **Rename** → type `Send Threaded Email to Student`
4. **Configure retry policy** (see instructions above)
5. Fill in:
   - **Original Mailbox Address:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/StudentEmail']` → click **Update**
   - **Subject:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('[', outputs('Get_Print_Request')?['body/ReqKey'], '] ', triggerOutputs()?['body/Title'])
```

> **Important:** The `[REQ-00001]` prefix in the subject enables Flow E to parse student replies and match them to the correct request. Do not change this format.

6. **Body:** Paste this HTML and replace dynamic content placeholders:
```html
<p>Hi <strong>@{outputs('Get_Print_Request')?['body/Student']?['DisplayName']}</strong>,</p>

<p>You have a new message about your print request.</p>

<div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #6b2d5b;">
<strong>MESSAGE:</strong><br>
@{triggerOutputs()?['body/Message']}
</div>

<hr>
<p><strong>Request:</strong> @{outputs('Get_Print_Request')?['body/ReqKey']}<br>
<strong>From:</strong> @{triggerOutputs()?['body/Author']?['DisplayName']}</p>

<p><em>You can reply directly to this email, and your response will be added to your request.</em></p>

<p style="color: #666; font-size: 12px;">
LSU Digital Fabrication Lab<br>
Room 145 Atkinson Hall<br>
coad-fablab@lsu.edu
</p>
```

**How to build the body:**
1. Click in the **Body** field
2. Toggle to HTML mode (if available) or paste HTML directly
3. For dynamic content like `@{outputs('Get_Print_Request')?['body/ReqKey']}`:
   - Place cursor where you want the value
   - Click **Dynamic content** tab
   - Select the appropriate field OR
   - Click **Expression** tab and paste the expression

7. Click **Show advanced options** to expand
8. **Importance:** Select `Normal`

> **Note:** The Office 365 Outlook connector's "Send an email from a shared mailbox (V2)" action automatically handles Message-ID generation. We store our generated MessageID in SharePoint for reference and future threading.

---

#### Step 8b: Update RequestComments with Threading Info

**What this does:** Stores the ThreadID and MessageID back on the comment record for tracking and threading future messages.

**UI steps:**
1. Click **+ Add an action** (after Send Threaded Email, still in YES branch)
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Update Message with Threading`
   - Click the **three dots (…)** → **Rename** → type `Update Message with Threading`
4. **Configure retry policy** (see instructions above)
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
   - **Id:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/ID']` → click **Update**
   - **ThreadID:** Click **Expression** tab (fx) → paste: `variables('ThreadID')` → click **Update**
   - **MessageID:** Click **Expression** tab (fx) → paste: `outputs('Generate_MessageID')` → click **Update**

---

#### Step 8c: Log to Audit

**What this does:** Creates an audit trail entry recording that a message was sent to the student.

**UI steps:**
1. Click **+ Add an action** (after Update Message with Threading)
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Message Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Message Sent`
4. **Configure retry policy** (see instructions above)
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

### Step 9: NO Branch (Not Staff Message — Safety Terminate)

**What this does:** This branch handles the edge case where AuthorRole is not "Staff". Since we already filter by Direction = Outbound in Step 3, this should rarely execute. It's a safety net to prevent unexpected behavior.

> **Note:** This branch exists for completeness. Flow D only processes outbound messages from staff. Inbound student replies are handled by Flow E (PR-Mailbox).

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch of "Check if Staff Message"
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - Not Staff Message`
   - Click the **three dots (…)** → **Rename** → type `Stop Flow - Not Staff Message`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `Message author is not Staff - no email notification sent`

---

## Legacy Step Reference: Student Messages (Deprecated)

> **Note:** The following logic has been moved to Flow E (PR-Mailbox) which handles inbound email replies. This section is kept for reference only.

### Original Step 5: NO Branch (Student → Flag for Staff)

### Update NeedsAttention (Legacy - Now in Flow E)

> This logic has been moved to Flow E for inbound email processing.

1. **+ Add action** → **Update item** (SharePoint) → List: `PrintRequests`
2. **Id:** `triggerOutputs()?['body/RequestID']`
3. **NeedsAttention:** `Yes`
4. **LastAction Value:** `Message Received`
5. **LastActionAt:** `utcNow()`

### Log to Audit (Legacy - Now in Flow E)

1. **+ Add action** → **Create item** (SharePoint) → List: `AuditLog`
2. **Title:** `Student Message Received`
3. **RequestID:** `triggerOutputs()?['body/RequestID']`
4. **Action Value:** `Message Received`
5. **ActorRole Value:** `Student`

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
- [ ] Email body contains message content
- [ ] Email body contains reply instructions
- [ ] Email body contains request details (ReqKey, Author name)
- [ ] AuditLog entry created with correct fields

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
| Author Name | `triggerOutputs()?['body/Author']?['DisplayName']` |
| Author Email | `triggerOutputs()?['body/Author']?['Email']` |
| Message Subject/Title | `triggerOutputs()?['body/Title']` |
| Message Body | `triggerOutputs()?['body/Message']` |
| Student Email | `triggerOutputs()?['body/StudentEmail']` |

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
│  TRIGGER: RequestComments item created                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Get Print Request                                      │
│  → Retrieves parent request details (ReqKey, Student info)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Check if Outbound Message                              │
│  → Direction = "Outbound"?                                      │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (Inbound)        │ YES (Outbound)                            │
│ → Stop Flow -       │ → Continue to Step 4                      │
│   Inbound Message   │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (YES only)
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Get Existing Thread Messages                           │
│  → Find previous outbound messages for same request             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5a: Initialize ThreadID                                   │
│  → Create empty ThreadID variable                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5b: Check if Thread Exists                                │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (New Thread)     │ YES (Existing Thread)                     │
│ → Generate New      │ → Use Existing ThreadID                   │
│   ThreadID          │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Generate MessageID                                     │
│  → Create unique email Message-ID                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Check if Staff Message                                 │
│  → AuthorRole = "Staff"?                                        │
├─────────────────────┬───────────────────────────────────────────┤
│ NO (Not Staff)      │ YES (Staff)                               │
│ → Stop Flow - Not   │ → Continue to Step 8                      │
│   Staff Message     │                                           │
└─────────────────────┴───────────────────────────────────────────┘
                              ↓ (YES only)
┌─────────────────────────────────────────────────────────────────┐
│  Step 8a: Send Threaded Email to Student                        │
│  → Email with [REQ-00001] subject prefix                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 8b: Update Message with Threading                         │
│  → Store ThreadID, MessageID on RequestComments item            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 8c: Log Message Sent                                      │
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
1. Staff writes message in Power Apps
2. Power Apps creates RequestComments item (Direction: Outbound)
3. **Flow D** sends email to student with `[REQ-00001]` subject
4. Student replies to email
5. **Flow E** receives reply, parses `[REQ-00001]` from subject
6. **Flow E** creates new RequestComments item (Direction: Inbound)
7. **Flow E** sets NeedsAttention = Yes on PrintRequest

See `Flow-(E)-Mailbox-InboundReplies.md` for inbound processing documentation.

---

## Troubleshooting

### Email Not Sending

| Symptom | Check | Solution |
|---------|-------|----------|
| Flow runs but no email | Direction field | Ensure message has `Direction = Outbound` |
| Flow runs but no email | AuthorRole field | Ensure comment has `AuthorRole = Staff` |
| Email action fails | StudentEmail field | Verify StudentEmail is populated on the comment |
| Email action fails | Mailbox permissions | Flow owner needs "Send As" on `coad-fablab@lsu.edu` |
| Email action fails | Shared mailbox | Verify `coad-fablab@lsu.edu` exists and is accessible |

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
| 3 | Condition | `Check if Outbound Message` |
| 3 (NO) | Terminate | `Stop Flow - Inbound Message` |
| 4 | Get items (SharePoint) | `Get Existing Thread Messages` |
| 5a | Initialize variable | `Initialize ThreadID` |
| 5b | Condition | `Check if Thread Exists` |
| 5b (YES) | Set variable | `Use Existing ThreadID` |
| 5b (NO) | Set variable | `Generate New ThreadID` |
| 6 | Compose | `Generate MessageID` |
| 7 | Condition | `Check if Staff Message` |
| 8a | Send email (V2) | `Send Threaded Email to Student` |
| 8b | Update item (SharePoint) | `Update Message with Threading` |
| 8c | Create item (SharePoint) | `Log Message Sent` |
| 9 | Terminate | `Stop Flow - Not Staff Message` |

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

- **Infinite Loop Prevention:** Flow only triggers on CREATE, not MODIFY
- **Direction Filtering:** Inbound messages terminate early (processed by Flow E)
- **Author Validation:** Non-staff messages terminate with success status
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint/Exchange
- **Threading Persistence:** ThreadID/MessageID stored for future reference
