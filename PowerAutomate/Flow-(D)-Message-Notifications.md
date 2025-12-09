# Flow D (PR-Message)

**Full Name:** PR-Message: Send notifications  
**Trigger:** SharePoint — When an item is **created** (List: `RequestComments`)

**Purpose:** Send email notifications when messages are exchanged between staff and students, with email threading support for reply tracking.

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

## Step 1: Create the Flow

1. **Power Automate** → **My flows** → **+ New flow** → **Automated cloud flow**
2. **Name:** `Flow D (PR-Message)`
3. **Trigger:** SharePoint – When an item is created
4. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
5. **List:** `RequestComments`

---

## Step 2: Get Print Request

1. **+ New step** → **Get item** (SharePoint)
2. **Rename:** `Get Print Request`
3. **List:** `PrintRequests`
4. **Id:** Expression → `triggerOutputs()?['body/RequestID']`

---

## Step 3: Check Direction (Skip Inbound Messages)

**What this does:** Flow D only sends emails for outbound (staff) messages. Inbound messages are processed by Flow E.

1. **+ New step** → **Condition**
2. **Rename:** `Check if Outbound Message`
3. **Left:** Expression → `triggerOutputs()?['body/Direction']?['Value']`
4. **Operator:** is equal to
5. **Right:** `Outbound`

**YES Branch:** Continue with email sending (Steps 4-8)  
**NO Branch:** Terminate flow (inbound messages don't need email notification)

---

## Step 4: Check for Existing Thread

**What this does:** Determines if this is the first message in a conversation or a reply to an existing thread.

1. **+ New step** → **Get items** (SharePoint)
2. **Rename:** `Get Existing Thread Messages`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `RequestComments`
5. **Filter Query:** Expression:
```
concat('RequestID eq ', triggerOutputs()?['body/RequestID'], ' and Direction eq ''Outbound'' and ID ne ', triggerOutputs()?['body/ID'])
```
6. **Top Count:** `1`
7. **Order By:** `SentAt desc`

---

## Step 5: Generate Thread ID

**What this does:** Creates a new ThreadID for new conversations, or reuses existing ThreadID for replies.

### Step 5a: Initialize ThreadID Variable

1. **+ New step** → **Initialize variable**
2. **Rename:** `Initialize ThreadID`
3. **Name:** `ThreadID`
4. **Type:** String
5. **Value:** Leave empty

### Step 5b: Set ThreadID Based on Thread Existence

1. **+ New step** → **Condition**
2. **Rename:** `Check if Thread Exists`
3. **Left:** Expression → `length(outputs('Get_Existing_Thread_Messages')?['body/value'])`
4. **Operator:** is greater than
5. **Right:** `0`

**YES Branch (Existing Thread):**
1. **+ Add action** → **Set variable**
2. **Rename:** `Use Existing ThreadID`
3. **Name:** `ThreadID`
4. **Value:** Expression → `first(outputs('Get_Existing_Thread_Messages')?['body/value'])?['ThreadID']`

**NO Branch (New Thread):**
1. **+ Add action** → **Set variable**
2. **Rename:** `Generate New ThreadID`
3. **Name:** `ThreadID`
4. **Value:** Expression:
```
concat(outputs('Get_Print_Request')?['body/ReqKey'], '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))
```

---

## Step 6: Generate Message ID

**What this does:** Creates a unique Message-ID for email threading.

1. **+ New step** → **Compose**
2. **Rename:** `Generate MessageID`
3. **Inputs:** Expression:
```
concat('<', variables('ThreadID'), '-', formatDateTime(utcNow(), 'HHmmss'), '@fablab.lsu.edu>')
```

---

## Step 7: Check Author Role

1. **+ New step** → **Condition**
2. **Rename:** `Check if Staff Message`
3. **Left:** Expression → `triggerOutputs()?['body/AuthorRole']?['Value']`
4. **Operator:** is equal to
5. **Right:** `Staff`

---

## Step 8: YES Branch (Staff → Email Student)

### Send Threaded Email

1. **+ Add action** → **Send an email from a shared mailbox (V2)**
2. **Rename:** `Send Threaded Email to Student`
3. **Shared Mailbox:** `coad-fablab@lsu.edu`
4. **To:** Expression → `triggerOutputs()?['body/StudentEmail']`
5. **Subject:** Expression:
```
concat('[', outputs('Get_Print_Request')?['body/ReqKey'], '] ', triggerOutputs()?['body/Title'])
```

> **Important:** The `[REQ-00001]` prefix in the subject enables Flow E to parse student replies and match them to the correct request.

6. **Body:**
```
Hi @{outputs('Get_Print_Request')?['body/Student']?['DisplayName']},

You have a new message about your print request.

MESSAGE:
@{triggerOutputs()?['body/Message']}

---
Request: @{outputs('Get_Print_Request')?['body/ReqKey']}
From: @{triggerOutputs()?['body/Author']?['DisplayName']}

You can reply directly to this email, and your response will be added to your request.

LSU Digital Fabrication Lab
Room 145 Atkinson Hall
coad-fablab@lsu.edu
```

7. **Show advanced options** → Click to expand
8. **Importance:** Normal
9. **Internet Message Headers:** (Custom headers for threading)

> **Note:** The Office 365 Outlook connector's "Send an email from a shared mailbox (V2)" action automatically handles Message-ID generation. For explicit threading, we store our generated MessageID in SharePoint for reference.

### Update RequestComments with Threading Info

1. **+ Add action** → **Update item** (SharePoint)
2. **Rename:** `Update Message with Threading`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `RequestComments`
5. **Id:** Expression → `triggerOutputs()?['body/ID']`
6. **ThreadID:** Expression → `variables('ThreadID')`
7. **MessageID:** Expression → `outputs('Generate_MessageID')`

### Log to Audit

1. **+ Add action** → **Create item** (SharePoint) → List: `AuditLog`
2. **Rename:** `Log Message Sent`
3. **Title:** `Message Sent to Student`
4. **RequestID:** Expression → `triggerOutputs()?['body/RequestID']`
5. **ReqKey:** Expression → `outputs('Get_Print_Request')?['body/ReqKey']`
6. **Action Value:** `Message Sent`
7. **FieldName:** `ThreadID`
8. **NewValue:** Expression → `variables('ThreadID')`
9. **ActorRole Value:** `Staff`
10. **ClientApp Value:** `Power Automate`
11. **ActionAt:** Expression → `utcNow()`
12. **FlowRunId:** Expression → `workflow()['run']['name']`
13. **Notes:** Expression:
```
concat('Staff message sent to ', triggerOutputs()?['body/StudentEmail'], ' in thread ', variables('ThreadID'))
```

---

## Step 9: NO Branch (Student Message - No Action Needed)

> **Note:** For outbound messages, this branch won't execute because we check Direction = Outbound in Step 3. This branch exists for completeness but Flow D only processes outbound messages. Inbound student replies are handled by Flow E (PR-Mailbox).

Leave this branch empty or add a **Terminate** action:
1. **+ Add action** → **Terminate**
2. **Status:** Succeeded
3. **Message:** `Inbound message - no email notification needed`

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

### Basic Functionality
- [ ] Staff sends message → Student receives email
- [ ] Email subject contains `[REQ-00001]` prefix
- [ ] Email body contains message content and reply instructions
- [ ] AuditLog entry created with ThreadID

### Email Threading
- [ ] First message creates new ThreadID (format: `REQ-00001-{timestamp}`)
- [ ] RequestComments item updated with ThreadID and MessageID
- [ ] Second message to same request reuses existing ThreadID
- [ ] Student can reply to email (reply processed by Flow E)

### Direction Filtering
- [ ] Outbound messages (staff) trigger email sending
- [ ] Inbound messages (via Flow E) do NOT trigger this flow
- [ ] Direction field correctly identifies message type

### Edge Cases
- [ ] Multiple staff messages to same request stay in same thread
- [ ] Messages to different requests get different ThreadIDs
- [ ] Flow handles missing StudentEmail gracefully

---

## Expression Reference

| Purpose | Expression |
|---------|------------|
| Request ID | `triggerOutputs()?['body/RequestID']` |
| Direction | `triggerOutputs()?['body/Direction']?['Value']` |
| Author Role | `triggerOutputs()?['body/AuthorRole']?['Value']` |
| Author Name | `triggerOutputs()?['body/Author']?['DisplayName']` |
| Message Subject | `triggerOutputs()?['body/Title']` |
| Message Body | `triggerOutputs()?['body/Message']` |
| Student Email | `triggerOutputs()?['body/StudentEmail']` |
| ReqKey | `outputs('Get_Print_Request')?['body/ReqKey']` |
| **Threading Expressions** | |
| Generate ThreadID | `concat(ReqKey, '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))` |
| Generate MessageID | `concat('<', ThreadID, '-', formatDateTime(utcNow(), 'HHmmss'), '@fablab.lsu.edu>')` |
| Email Subject Format | `concat('[', ReqKey, '] ', Subject)` |
| Get Existing ThreadID | `first(outputs('Get_Existing_Thread_Messages')?['body/value'])?['ThreadID']` |

---

## Architecture Notes

### Threading Flow

```
Staff sends message via Power Apps
        ↓
RequestComments item created (Direction: Outbound)
        ↓
Flow D triggers
        ↓
Check Direction = Outbound? ──NO──→ Terminate (handled by Flow E)
        ↓ YES
Get Print Request details
        ↓
Check for existing thread
        ↓
Generate/Reuse ThreadID
        ↓
Generate MessageID
        ↓
Send email with [REQ-00001] subject
        ↓
Update RequestComments with ThreadID, MessageID
        ↓
Log to AuditLog
```

### Email Subject Format

**Outbound:** `[REQ-00001] Your subject here`
- Square brackets enable reliable regex parsing
- ReqKey allows Flow E to match replies to requests

### Integration with Flow E

Flow D handles **outbound** messages (staff → student)  
Flow E handles **inbound** messages (student email replies → SharePoint)

See `PR-Mailbox_InboundReplies.md` for inbound processing documentation.

---

## Troubleshooting

### Email Not Sending

1. **Check Direction:** Ensure message has `Direction = Outbound`
2. **Check StudentEmail:** Verify StudentEmail field is populated
3. **Check Permissions:** Flow owner needs "Send As" on shared mailbox

### ThreadID Not Generated

1. **Check ThreadID variable:** Ensure Initialize variable runs before Set variable
2. **Check condition logic:** Verify thread existence check is evaluating correctly

### Reply Not Threading in Email Client

1. **Subject consistency:** Ensure `[REQ-00001]` prefix is preserved in replies
2. **MessageID format:** Verify MessageID follows email standard format `<id@domain>`
