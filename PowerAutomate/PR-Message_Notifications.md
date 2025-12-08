# Flow E (PR-Message)

**Full Name:** PR-Message: Send notifications  
**Trigger:** SharePoint — When an item is **created** (List: `RequestComments`)

**Purpose:** Send email notifications when messages are exchanged between staff and students.

---

## Overview

- **Staff sends message** → Student receives email notification
- **Student sends message** → NeedsAttention flag set on request

---

## Prerequisites

- [ ] `RequestComments` SharePoint list created
- [ ] `PrintRequests` list with `NeedsAttention` field
- [ ] `AuditLog` list exists
- [ ] Shared mailbox `coad-fablab@lsu.edu` configured

---

## Step 1: Create the Flow

1. **Power Automate** → **My flows** → **+ New flow** → **Automated cloud flow**
2. **Name:** `Flow E (PR-Message)`
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

## Step 3: Check Author Role

1. **+ New step** → **Condition**
2. **Rename:** `Check if Staff Message`
3. **Left:** Expression → `triggerOutputs()?['body/AuthorRole']?['Value']`
4. **Operator:** is equal to
5. **Right:** `Staff`

---

## Step 4: YES Branch (Staff → Email Student)

### Send Email

1. **+ Add action** → **Send an email from a shared mailbox (V2)**
2. **Shared Mailbox:** `coad-fablab@lsu.edu`
3. **To:** Expression → `triggerOutputs()?['body/StudentEmail']`
4. **Subject:** Expression:
```
concat('Message about your 3D print – ', outputs('Get_Print_Request')?['body/ReqKey'])
```
5. **Body:**
```
Hi @{outputs('Get_Print_Request')?['body/Student']?['DisplayName']},

You have a new message about your print request.

SUBJECT: @{triggerOutputs()?['body/Title']}

MESSAGE:
@{triggerOutputs()?['body/Message']}

---
Request: @{outputs('Get_Print_Request')?['body/ReqKey']}
From: @{triggerOutputs()?['body/Author']?['DisplayName']}

To reply, visit: https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx

LSU Digital Fabrication Lab
```

### Log to Audit

1. **+ Add action** → **Create item** (SharePoint) → List: `AuditLog`
2. **Title:** `Message Sent to Student`
3. **RequestID:** `triggerOutputs()?['body/RequestID']`
4. **ReqKey:** `outputs('Get_Print_Request')?['body/ReqKey']`
5. **Action Value:** `Message Sent`
6. **ActorRole Value:** `Staff`
7. **ActionAt:** `utcNow()`

---

## Step 5: NO Branch (Student → Flag for Staff)

### Update NeedsAttention

1. **+ Add action** → **Update item** (SharePoint) → List: `PrintRequests`
2. **Id:** `triggerOutputs()?['body/RequestID']`
3. **NeedsAttention:** `Yes`
4. **LastAction Value:** `Message Received`
5. **LastActionAt:** `utcNow()`

### Log to Audit

1. **+ Add action** → **Create item** (SharePoint) → List: `AuditLog`
2. **Title:** `Student Message Received`
3. **RequestID:** `triggerOutputs()?['body/RequestID']`
4. **Action Value:** `Message Received`
5. **ActorRole Value:** `Student`

---

## Testing Checklist

- [ ] Staff message → Student receives email
- [ ] Student message → NeedsAttention = Yes on request
- [ ] AuditLog entries created for both scenarios
- [ ] Dashboard badge shows unread count

---

## Expression Reference

| Purpose | Expression |
|---------|------------|
| Request ID | `triggerOutputs()?['body/RequestID']` |
| Author Role | `triggerOutputs()?['body/AuthorRole']?['Value']` |
| Author Name | `triggerOutputs()?['body/Author']?['DisplayName']` |
| Message Subject | `triggerOutputs()?['body/Title']` |
| Message Body | `triggerOutputs()?['body/Message']` |
| Student Email | `triggerOutputs()?['body/StudentEmail']` |
| ReqKey | `outputs('Get_Print_Request')?['body/ReqKey']` |
