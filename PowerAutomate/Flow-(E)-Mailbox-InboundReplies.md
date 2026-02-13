# Flow E (PR-Mailbox)

**Full Name:** PR-Mailbox: Process inbound replies  
**Trigger:** Office 365 Outlook — When a new email arrives in a shared mailbox (V2)

**Purpose:** Monitor the shared mailbox for student email replies, parse them to find the related print request, and add them to the RequestComments list for staff visibility.

---

## Quick Overview

This flow runs automatically when a student replies to an email about their print request. Here's what happens:

1. **Trigger on email arrival** (subject contains "REQ-")
2. **Extract ReqKey from subject** (parse `[REQ-00001]` pattern)
3. **Validate ReqKey exists** (terminate if no ReqKey found)
4. **Look up PrintRequest** (find matching request by ReqKey)
5. **Validate request exists** (terminate if request not found)
6. **Validate sender** (verify email sender matches student on record)
7. **Get thread information** (find existing ThreadID for conversation)
8. **Clean email body** (strip quoted reply text)
9. **Create RequestComments entry** (Direction: Inbound)
10. **Flag for attention** (set NeedsAttention = Yes on PrintRequest)
11. **Log to audit** (create AuditLog entry)
12. **Mark email as read** (optional cleanup)

---

## Overview

- **Student replies to email** — Message added to RequestComments (Direction: Inbound)
- **Sender validation** — Only accepts replies from the student on record
- **Thread linking** — Reuses existing ThreadID for conversation continuity
- **Staff notification** — NeedsAttention flag surfaces replies in dashboard

---

## Prerequisites

- [ ] `RequestComments` SharePoint list with threading columns (see `RequestComments-List-Setup.md`)
- [ ] `PrintRequests` list with `NeedsAttention` field
- [ ] `AuditLog` list exists
- [ ] Shared mailbox `coad-fablab@lsu.edu` configured
- [ ] Flow owner has "Read and manage" permissions on shared mailbox
- [ ] Flow D (PR-Message) sending emails with `[REQ-00001]` subject format

---

## Error Handling Configuration

**Configure retry policies on all SharePoint and Outlook actions for resilience:**
- **Retry Policy Type:** Exponential interval
- **Apply to:** Get items, Create item, Update item, Mark as read actions

**How to set retry policy on any action:**
1. Click the **three dots (...)** on the action card
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

**What this does:** Creates the flow with an email trigger that monitors the shared mailbox for potential student replies.

**UI steps:**
1. Go to **Power Automate** → **Create** → **Automated cloud flow**
2. Name: `Flow-(E)-Mailbox-InboundReplies`
3. Choose trigger: **Office 365 Outlook – When a new email arrives in a shared mailbox (V2)**
4. Click **Create**
5. Configure trigger fields:
   - **Original Mailbox Address:** Type `coad-fablab@lsu.edu`
   - **Folder:** Select `Inbox`
   - **Include Attachments:** Select `No` (for performance)
   - **Subject Filter:** Type `REQ-` (filters to only emails with REQ- in subject)

> **Note:** The subject filter reduces flow runs by only triggering on emails that might be replies to print requests.

---

### Step 2: Extract ReqKey from Subject

**What this does:** Parses the email subject to find the request identifier. The expression extracts the number portion from patterns like `[REQ-00001]`.

#### Step 2a: Extract ReqKey Number

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Extract ReqKey from Subject`
   - Click the **three dots (...)** → **Rename** → type `Extract ReqKey from Subject`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  contains(triggerOutputs()?['body/subject'], '[REQ-'),
  first(split(last(split(triggerOutputs()?['body/subject'], '[REQ-')), ']')),
  ''
)
```

**How this expression works:**
- Input: `Re: [REQ-00001] Question about your file`
- `split(..., '[REQ-')` → `['Re: ', '00001] Question about your file']`
- `last(...)` → `'00001] Question about your file'`
- `split(..., ']')` → `['00001', ' Question about your file']`
- `first(...)` → `'00001'`

#### Step 2b: Build Full ReqKey

**UI steps:**
1. Click **+ New step**
2. Search for and select **Compose**
3. Rename the action to: `Build Full ReqKey`
   - Click the **three dots (...)** → **Rename** → type `Build Full ReqKey`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  empty(outputs('Extract_ReqKey_from_Subject')),
  '',
  concat('REQ-', outputs('Extract_ReqKey_from_Subject'))
)
```

**Result:** Converts `00001` to `REQ-00001`

---

### Step 3: Validate ReqKey Found

**What this does:** Stops processing if no valid ReqKey was found in the subject. This prevents the flow from trying to process unrelated emails.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Check ReqKey Found`
   - Click the **three dots (...)** → **Rename** → type `Check ReqKey Found`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `outputs('Build_Full_ReqKey')` → click **Update**
   - **Middle:** Select **is not equal to**
   - **Right box:** Leave empty (checking for non-empty string)

#### NO Branch (No ReqKey Found)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - No ReqKey`
   - Click the **three dots (...)** → **Rename** → type `Stop Flow - No ReqKey`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `No ReqKey found in subject - not a reply to a print request email`

#### YES Branch

Continue with Steps 4+ (all remaining steps go in the YES branch)

---

### Step 4: Look Up Print Request (Inside YES Branch)

**What this does:** Finds the PrintRequest matching the ReqKey extracted from the subject line.

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch
2. Search for and select **Get items** (SharePoint)
3. Rename the action to: `Get Print Request by ReqKey`
   - Click the **three dots (...)** → **Rename** → type `Get Print Request by ReqKey`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**
5. Fill in basic fields:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
6. In the **Advanced parameters** section, click **Show all** to expand all parameters
7. Fill in advanced fields:
   - **Filter Query:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
concat('ReqKey eq ''', outputs('Build_Full_ReqKey'), '''')
```

   - **Top Count:** Type `1`

---

### Step 5: Validate Request Found

**What this does:** Stops processing if no matching PrintRequest exists. This handles cases where the ReqKey format is valid but doesn't match any request.

**UI steps:**
1. Click **+ Add an action** (still inside the YES branch of Step 3)
2. Search for and select **Condition**
3. Rename the condition to: `Check Request Found`
   - Click the **three dots (...)** → **Rename** → type `Check Request Found`
4. Set up condition:
   - **Left box:** Click **Expression** tab (fx) → paste: `length(outputs('Get_Print_Request_by_ReqKey')?['body/value'])` → click **Update**
   - **Middle:** Select **is greater than**
   - **Right box:** Type `0`

#### NO Branch (No Request Found)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch
2. Search for and select **Terminate**
3. Rename the action to: `Stop Flow - Request Not Found`
   - Click the **three dots (...)** → **Rename** → type `Stop Flow - Request Not Found`
4. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
concat('No PrintRequest found for ReqKey: ', outputs('Build_Full_ReqKey'))
```

#### YES Branch

Continue with Steps 6+ (all remaining steps go in the YES branch of this condition)

---

### Step 6: Validate Sender Identity (Inside YES Branch of Step 5)

**What this does:** Verifies the email sender is the student on the request using Entra Object ID (immutable GUID). This solves the UPN vs SMTP email mismatch issue where students have multiple email aliases.

> **Why Entra Object ID?** Students may have multiple email aliases (e.g., `jsmith3@lsu.edu` and `john.smith@lsu.edu`). Email-based validation fails when students reply from a different alias. The Entra Object ID is immutable and remains the same regardless of which email alias is used.

#### Step 6a: Get Request Record

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch of "Check Request Found"
2. Search for and select **Compose**
3. Rename the action to: `Get Request Record`
   - Click the **three dots (...)** → **Rename** → type `Get Request Record`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste: `first(outputs('Get_Print_Request_by_ReqKey')?['body/value'])` → click **Update**

#### Step 6b: Extract Sender Email Address

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Extract Sender Email`
   - Click the **three dots (...)** → **Rename** → type `Extract Sender Email`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  contains(triggerOutputs()?['body/from'], '<'),
  first(split(last(split(triggerOutputs()?['body/from'], '<')), '>')),
  triggerOutputs()?['body/from']
)
```

> **How this works:** The From field may be `"Jane Doe" <jane@lsu.edu>` or just `jane@lsu.edu`. This expression extracts just the email address from either format.

#### Step 6c: Look Up Sender by Email

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Search for users (V2)** (Office 365 Users)
3. Rename the action to: `Search for Sender`
   - Click the **three dots (...)** → **Rename** → type `Search for Sender`
4. Fill in:
   - **Search Term:** Click **Expression** tab (fx) → paste: `outputs('Extract_Sender_Email')` → click **Update**
   - **Top:** Type `1`

#### Step 6d: Get Sender Object ID

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Get Sender Object ID`
   - Click the **three dots (...)** → **Rename** → type `Get Sender Object ID`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste: `first(outputs('Search_for_Sender')?['body/value'])?['id']` → click **Update**

#### Step 6d-2: Get Sender Display Name

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Get Sender Display Name`
   - Click the **three dots (...)** → **Rename** → type `Get Sender Display Name`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste: `first(outputs('Search_for_Sender')?['body/value'])?['displayName']` → click **Update**

#### Step 6d-3: Get Sender UPN

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Get Sender UPN`
   - Click the **three dots (...)** → **Rename** → type `Get Sender UPN`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste: `first(outputs('Search_for_Sender')?['body/value'])?['userPrincipalName']` → click **Update**

> **Why capture sender details?** We use these values later to set the Author field on the inbound message. Using the actual email sender's identity (rather than the Student field from PrintRequest) ensures the message shows the correct author name.

#### Step 6e: Validate Sender is Student

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename the condition to: `Validate Sender is Student`
   - Click the **three dots (...)** → **Rename** → type `Validate Sender is Student`
4. Set up condition using this expression (handles both new and legacy records):
   - **Left box:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
or(
  equals(outputs('Get_Sender_Object_ID'), outputs('Get_Request_Record')?['StudentEntraId']),
  and(
    empty(outputs('Get_Request_Record')?['StudentEntraId']),
    contains(toLower(triggerOutputs()?['body/from']), toLower(outputs('Get_Request_Record')?['StudentEmail']))
  )
)
```

   - **Middle:** Select **is equal to**
   - **Right box:** Type `true`

> **How this validation works:**
> 1. **Primary check:** Sender's Entra Object ID matches `StudentEntraId` on the request
> 2. **Fallback for legacy records:** If `StudentEntraId` is empty (older records), falls back to email comparison
>
> This ensures backward compatibility during the transition period while new records use the more reliable Object ID.

#### NO Branch (Sender Mismatch — Log and Terminate)

**UI steps:**
1. Click **+ Add an action** in the NO (red) branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Sender Mismatch`
   - Click the **three dots (...)** → **Rename** → type `Log Sender Mismatch`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Reply Rejected - Identity Mismatch`
   - **RequestID:** Click **Expression** tab (fx) → paste: `outputs('Get_Request_Record')?['ID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Build_Full_ReqKey')` → click **Update**
   - **Action Value:** Type `Email Rejected`
   - **FieldName:** Type `SenderIdentity`
   - **OldValue:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('EntraId:', coalesce(outputs('Get_Request_Record')?['StudentEntraId'], 'N/A'), ' Email:', outputs('Get_Request_Record')?['StudentEmail'])
```
   - **NewValue:** Click **Expression** tab (fx) → paste this expression → click **Update**:
```
concat('EntraId:', coalesce(outputs('Get_Sender_Object_ID'), 'N/A'), ' Email:', outputs('Extract_Sender_Email'))
```
   - **ActorRole Value:** Select `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Type `Email rejected: sender identity does not match student on record (Entra Object ID or email mismatch)`

6. Click **+ Add an action** (after Log Sender Mismatch)
7. Search for and select **Terminate**
8. Rename the action to: `Stop Flow - Sender Mismatch`
   - Click the **three dots (...)** → **Rename** → type `Stop Flow - Sender Mismatch`
9. Fill in:
   - **Status:** Select `Succeeded`
   - **Message (optional):** Type `Sender identity does not match student on record`

#### YES Branch (Sender Validated)

Continue with Steps 7+ (all remaining steps go in the YES branch of "Validate Sender is Student")

---

### Step 7: Get Thread Information (Inside YES Branch of Step 6)

**What this does:** Finds the existing ThreadID for this request's conversation. This ensures the inbound message links to the same thread as previous messages.

**UI steps:**
1. Click **+ Add an action** in the YES (green) branch of "Validate Sender is Student"
2. Search for and select **Get items** (SharePoint)
3. Rename the action to: `Get Existing Thread`
   - Click the **three dots (...)** → **Rename** → type `Get Existing Thread`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**
5. Fill in basic fields:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
6. In the **Advanced parameters** section, click **Show all** to expand all parameters
7. Fill in advanced fields:
   - **Filter Query:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
concat('RequestID eq ', outputs('Get_Request_Record')?['ID'])
```

   - **Top Count:** Type `1`
   - **Order By:** Type `SentAt desc`

---

### Step 8: Clean Email Body

**What this does:** Strips quoted reply text from the email body to get just the new content the student wrote. Uses `bodyPreview` (plain text) instead of `body` (HTML) to avoid capturing HTML formatting from email clients. Checks for common reply markers in order of priority.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Compose**
3. Rename the action to: `Clean Email Body`
   - Click the **three dots (...)** → **Rename** → type `Clean Email Body`
4. Fill in:
   - **Inputs:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  contains(triggerOutputs()?['body/bodyPreview'], '---'),
  first(split(triggerOutputs()?['body/bodyPreview'], '---')),
  if(
    contains(triggerOutputs()?['body/bodyPreview'], '___'),
    first(split(triggerOutputs()?['body/bodyPreview'], '___')),
    if(
      contains(triggerOutputs()?['body/bodyPreview'], 'From:'),
      first(split(triggerOutputs()?['body/bodyPreview'], 'From:')),
      if(
        contains(triggerOutputs()?['body/bodyPreview'], 'On '),
        first(split(triggerOutputs()?['body/bodyPreview'], 'On ')),
        triggerOutputs()?['body/bodyPreview']
      )
    )
  )
)
```

**How this expression works:**
1. First checks for `---` (our separator from Flow D emails)
2. Then checks for `___` (common email signature delimiter - underscores)
3. Then checks for `From:` (common in forwarded/quoted emails)
4. Then checks for `On ` (common in "On [date], [person] wrote:")
5. Falls back to full body if no markers found

> **Note:** This expression uses `bodyPreview` (plain text) to avoid HTML formatting issues. It handles the most common reply patterns. Edge cases with unusual formatting may include some quoted text.

---

### Step 9: Create RequestComments Entry

**What this does:** Adds the student's reply to the conversation in SharePoint with Direction = Inbound.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Create Inbound Message`
   - Click the **three dots (...)** → **Rename** → type `Create Inbound Message`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**

#### Basic Required Fields

5. Fill in the basic required fields:
   - **Site Address:** Select `Digital Fabrication Lab - https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** Select `RequestComments`
   - **RequestID:** Click **Expression** tab (fx) → paste: `outputs('Get_Request_Record')?['ID']` → click **Update**
   - **Message:** Click **Expression** tab (fx) → paste: `outputs('Clean_Email_Body')` → click **Update**

#### Advanced Parameters

6. Click **Advanced parameters** dropdown → select **Show all** to expand all 14 fields
7. Fill in the advanced fields:
   - **Limit Columns by View:** Leave empty (not needed)
   - **Title:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  contains(triggerOutputs()?['body/subject'], 'Re:'),
  concat('Re: ', outputs('Build_Full_ReqKey')),
  triggerOutputs()?['body/subject']
)
```

   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Build_Full_ReqKey')` → click **Update**
   - **Author Claims:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
concat('i:0#.f|membership|', outputs('Get_Sender_UPN'))
```

> **Important:** We use the sender's UPN (captured in Step 6d-3) to build the Claims string, not the Student field from PrintRequest. This ensures the Author reflects who actually sent the email reply.

   - **AuthorRole Value:** Select `Student`
   - **SentAt:** Click **Expression** tab (fx) → paste: `triggerOutputs()?['body/receivedDateTime']` → click **Update**
   - **ReadByStudent:** Select `Yes`
   - **ReadByStaff:** Select `No`
   - **StudentEmail:** Click **Expression** tab (fx) → paste: `outputs('Get_Request_Record')?['StudentEmail']` → click **Update**
   - **Direction Value:** Select `Inbound`
   - **ThreadID:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  greater(length(outputs('Get_Existing_Thread')?['body/value']), 0),
  first(outputs('Get_Existing_Thread')?['body/value'])?['ThreadID'],
  concat(outputs('Build_Full_ReqKey'), '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))
)
```

   - **MessageID:** Leave empty (this field captures the Message-ID header from outbound emails sent by Flow D; inbound replies don't generate a new MessageID)
   - **InReplyTo:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
if(
  greater(length(outputs('Get_Existing_Thread')?['body/value']), 0),
  first(outputs('Get_Existing_Thread')?['body/value'])?['MessageID'],
  ''
)
```

   - **Content type Id:** Leave as default (do not change)

**ThreadID Logic:**
- If existing thread found → Reuse that ThreadID for continuity
- If no existing thread → Generate new ThreadID (format: `REQ-00001-20260112143052`)

**InReplyTo Logic:**
- If existing thread found → Reference the parent MessageID
- If no existing thread → Leave empty

---

### Step 10: Update PrintRequest - Flag for Attention

**What this does:** Marks the request as needing staff attention so it surfaces in the dashboard.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Flag Request for Attention`
   - Click the **three dots (...)** → **Rename** → type `Flag Request for Attention`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**

#### Basic Required Fields

5. Fill in the basic required fields:
   - **Site Address:** Select `Digital Fabrication Lab - https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** Select `PrintRequests`
   - **Id:** Click **Expression** tab (fx) → paste: `outputs('Get_Request_Record')?['ID']` → click **Update**
   - **TigerCardNumber:** Click **Expression** tab (fx) → paste: `outputs('Get_Request_Record')?['TigerCardNumber']` → click **Update**

> **Note:** TigerCardNumber is a required field in the list. We preserve the existing value by pulling it from the request record. This prevents accidentally clearing the field during the update.

#### Advanced Parameters

6. Click **Advanced parameters** dropdown → select **Show all** (or just expand to show the fields you need)
7. Fill in the advanced fields:
   - **LastAction Value:** Select `Comment Added`
   - **LastActionBy Claims:** Leave empty (system action, no specific user)
   - **LastActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **NeedsAttention:** Select `Yes`

---

### Step 11: Log to AuditLog

**What this does:** Creates an audit trail entry for the inbound message.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Inbound Message`
   - Click the **three dots (...)** → **Rename** → type `Log Inbound Message`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Student Email Reply Received`
   - **RequestID:** Click **Expression** tab (fx) → paste: `outputs('Get_Request_Record')?['ID']` → click **Update**
   - **ReqKey:** Click **Expression** tab (fx) → paste: `outputs('Build_Full_ReqKey')` → click **Update**
   - **Action Value:** Select `Comment Added`
   - **FieldName:** Type `Direction`
   - **NewValue:** Type `Inbound`
   - **Actor Claims:** Click **Expression** tab (fx) → paste: `concat('i:0#.f|membership|', outputs('Get_Sender_UPN'))` → click **Update**
   - **ActorRole Value:** Select `Student`
   - **ClientApp Value:** Type `Email`
   - **ActionAt:** Click **Expression** tab (fx) → paste: `utcNow()` → click **Update**
   - **FlowRunId:** Click **Expression** tab (fx) → paste: `workflow()['run']['name']` → click **Update**
   - **Notes:** Click **Expression** tab (fx) → paste this expression → click **Update**:

```
concat('Student replied via email. Thread: ', outputs('Create_Inbound_Message')?['body/ThreadID'])
```

---

### Step 12: Mark Email as Read (Optional)

**What this does:** Marks the processed email as read in the shared mailbox. This helps staff distinguish processed emails from unprocessed ones.

**UI steps:**
1. Click **+ Add an action**
2. Search for and select **Mark as read or unread (V3)** (Office 365 Outlook)
3. Rename the action to: `Mark Email as Read`
   - Click the **three dots (...)** → **Rename** → type `Mark Email as Read`
4. **Configure retry policy:**
   1. Click the **three dots (...)** on the action card
   2. Choose **Settings**
   3. Scroll down to **Networking** section
   4. In **Retry policy** dropdown, select **Exponential interval**
   5. Fill in ALL four fields (all are required):
      - **Count:** `4`
      - **Interval:** `PT1M`
      - **Minimum interval:** `PT20S`
      - **Maximum interval:** `PT1H`
   6. Click **Done**

#### Basic Required Field

5. Fill in the basic required field:
   - **Message Id:** Select **Message Id** from the Dynamic content panel (from the trigger "When a new email arrives in a shared mailbox")
   
   > **Alternative:** If dynamic content isn't available, click **Expression** tab (fx) → paste: `triggerOutputs()?['body/id']` → click **Update**

#### Advanced Parameters

6. Click **Advanced parameters** dropdown → select **Show all** to expand (2 fields)
7. Fill in the advanced fields:
   - **Original Mailbox Address:** Type `coad-fablab@lsu.edu` in the search box and select it (this is a people/email picker field)
   - **Mark as:** Select `Yes` (Yes = mark as read, No = mark as unread)

---

## Testing Checklist

### Pre-Testing Setup

- [ ] RequestComments list has ThreadID, MessageID, Direction columns
- [ ] PrintRequests list has NeedsAttention field
- [ ] AuditLog list exists with required columns
- [ ] Shared mailbox `coad-fablab@lsu.edu` is accessible
- [ ] Flow owner has "Read and manage" permissions on shared mailbox
- [ ] Flow D has sent at least one test email (creates `[REQ-00001]` subject)

### Basic Functionality

- [ ] Email with `[REQ-00001]` in subject triggers flow
- [ ] ReqKey correctly extracted from subject line
- [ ] Matching PrintRequest found
- [ ] RequestComments entry created with Direction: Inbound
- [ ] NeedsAttention set to Yes on PrintRequest
- [ ] AuditLog entry created
- [ ] Email marked as read in shared mailbox

### Email Subject Parsing

- [ ] Subject: `Re: [REQ-00001] Question` → ReqKey: `REQ-00001`
- [ ] Subject: `[REQ-00042] My file` → ReqKey: `REQ-00042`
- [ ] Subject: `Fwd: [REQ-00001] Question` → ReqKey: `REQ-00001`
- [ ] Subject: `Re: Re: [REQ-00001] Question` → ReqKey: `REQ-00001`
- [ ] Subject: `No ReqKey here` → Flow terminates gracefully

### Sender Validation

- [ ] Matching sender email → Message accepted
- [ ] Non-matching sender email → Message rejected with audit log
- [ ] Sender format `"Name" <email>` → Correctly matched
- [ ] Different case (uppercase/lowercase) → Correctly matched

### Message Body Cleaning

- [ ] Reply with `---` separator → Only new content saved
- [ ] Reply with `From:` quote → Only new content saved
- [ ] Reply with `On [date] wrote:` → Only new content saved
- [ ] Simple reply without markers → Full body saved
- [ ] HTML email body → Plain text extracted via bodyPreview

### Threading

- [ ] First inbound message → Creates new ThreadID if none exists
- [ ] Reply to existing thread → Reuses ThreadID
- [ ] InReplyTo populated with parent MessageID
- [ ] ThreadID format: `REQ-00001-20260112143052`

### Edge Cases

- [ ] Email without ReqKey → Flow terminates without error
- [ ] ReqKey for non-existent request → Flow terminates with log
- [ ] Multiple emails in quick succession → All processed correctly
- [ ] Empty email body → Handled gracefully
- [ ] Very long email body → Handled (check SharePoint column limits)

### Audit Trail Verification

- [ ] Successful message: AuditLog entry has Action = "Comment Added"
- [ ] Rejected message: AuditLog entry has Action = "Email Rejected"
- [ ] AuditLog entry has correct RequestID and ReqKey
- [ ] AuditLog entry has FlowRunId populated
- [ ] AuditLog entry has ActionAt timestamp

---

## Expression Reference

### Trigger Outputs (Email Fields)

| Purpose | Expression |
|---------|------------|
| Email Subject | `triggerOutputs()?['body/subject']` |
| Email Body (HTML) | `triggerOutputs()?['body/body']` |
| Email Body Preview (plain text) | `triggerOutputs()?['body/bodyPreview']` |
| Email From | `triggerOutputs()?['body/from']` |
| Email Received Time | `triggerOutputs()?['body/receivedDateTime']` |
| Email Message ID | `triggerOutputs()?['body/id']` |

### ReqKey Extraction Expressions

| Purpose | Expression |
|---------|------------|
| Extract Number from Subject | `first(split(last(split(triggerOutputs()?['body/subject'], '[REQ-')), ']'))` |
| Build Full ReqKey | `concat('REQ-', outputs('Extract_ReqKey_from_Subject'))` |
| Check ReqKey Empty | `empty(outputs('Extract_ReqKey_from_Subject'))` |

### Get Print Request Outputs

| Purpose | Expression |
|---------|------------|
| First Result (Request Record) | `first(outputs('Get_Print_Request_by_ReqKey')?['body/value'])` |
| Request ID | `outputs('Get_Request_Record')?['ID']` |
| Student Email | `outputs('Get_Request_Record')?['StudentEmail']` |
| Student Claims | `outputs('Get_Request_Record')?['Student']?['Claims']` |
| Check Results Exist | `length(outputs('Get_Print_Request_by_ReqKey')?['body/value'])` |

### Sender Identity Outputs

| Purpose | Expression |
|---------|------------|
| Sender Object ID | `outputs('Get_Sender_Object_ID')` |
| Sender Display Name | `outputs('Get_Sender_Display_Name')` |
| Sender UPN | `outputs('Get_Sender_UPN')` |
| Sender Claims (for Author field) | `concat('i:0#.f|membership|', outputs('Get_Sender_UPN'))` |

### Threading Expressions

| Purpose | Expression |
|---------|------------|
| Use Existing ThreadID | `first(outputs('Get_Existing_Thread')?['body/value'])?['ThreadID']` |
| Use Existing MessageID | `first(outputs('Get_Existing_Thread')?['body/value'])?['MessageID']` |
| Generate New ThreadID | `concat(outputs('Build_Full_ReqKey'), '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))` |
| Check Thread Exists | `greater(length(outputs('Get_Existing_Thread')?['body/value']), 0)` |

### Filter Query Expressions

| Purpose | Expression |
|---------|------------|
| Filter by ReqKey | `concat('ReqKey eq ''', outputs('Build_Full_ReqKey'), '''')` |
| Filter by RequestID | `concat('RequestID eq ', outputs('Get_Request_Record')?['ID'])` |

### Common Utility Expressions

| Purpose | Expression |
|---------|------------|
| Current UTC Time | `utcNow()` |
| Flow Run ID | `workflow()['run']['name']` |
| Lowercase String | `toLower(string)` |

---

## Troubleshooting

### Flow Not Triggering

| Symptom | Check | Solution |
|---------|-------|----------|
| No flow runs for any emails | Mailbox permissions | Flow owner needs "Read and manage" on `coad-fablab@lsu.edu` |
| Flow runs for some emails only | Subject filter | Ensure emails have `REQ-` in subject (case-sensitive) |
| Flow runs but wrong folder | Folder setting | Verify trigger monitors `Inbox` folder |
| Connection expired | Connection status | Re-authenticate Office 365 connection |

**How to check:**
1. Go to **Power Automate** → **My flows** → Select the flow
2. Check **Run history** for any runs
3. If no runs, verify trigger configuration

### ReqKey Not Extracted

| Symptom | Check | Solution |
|---------|-------|----------|
| Empty ReqKey | Subject format | Must be `[REQ-00001]` with square brackets |
| Partial ReqKey | Expression output | Check `Extract ReqKey from Subject` output in run history |
| Wrong ReqKey | Multiple patterns | Expression finds first `[REQ-` pattern in subject |

**Debug steps:**
1. Open a failed flow run
2. Expand the `Extract ReqKey from Subject` action
3. Check the **Outputs** section for the extracted value

### Request Not Found

| Symptom | Check | Solution |
|---------|-------|----------|
| Valid ReqKey but no request | Filter query | Verify ReqKey exists in PrintRequests list |
| Request exists but not found | ReqKey format | Check for extra spaces or characters |
| Intermittent failures | Timing | Request may not exist yet (race condition) |

**How to verify:**
1. Go to PrintRequests list in SharePoint
2. Filter by the ReqKey value
3. Confirm the request exists

### Sender Validation Failing

| Symptom | Check | Solution |
|---------|-------|----------|
| Legitimate student rejected | Email format | From field may include display name: `"Name" <email>` |
| Case mismatch | Case sensitivity | Expression uses `toLower()` for comparison |
| StudentEmail empty | PrintRequest data | Ensure StudentEmail field is populated on request |

**How to check:**
1. Open the failed flow run
2. Expand `Validate Sender is Student` condition
3. Compare left value (from email) with right value (StudentEmail)

### Message Body Issues

| Symptom | Check | Solution |
|---------|-------|----------|
| Full quoted text included | Reply markers | Email may use uncommon reply format |
| HTML tags in message | Body field | Consider using `body/bodyPreview` for plain text |
| Truncated message | SharePoint limits | Multi-line text column has 63,999 character limit |
| Encoding issues | Special characters | Some characters may need URL decoding |

### Thread Not Linking

| Symptom | Check | Solution |
|---------|-------|----------|
| New ThreadID created instead of reusing | Previous messages | Check if RequestComments has items for this RequestID |
| InReplyTo empty | MessageID | Previous message must have MessageID populated |
| Wrong thread | Filter query | Verify filter returns correct previous message |

**Debug steps:**
1. Check RequestComments list for this RequestID
2. Verify ThreadID and MessageID columns have values
3. Check `Get Existing Thread` action output in flow run

### Common Expression Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid expression" | Syntax error | Check for missing quotes, parentheses |
| "Property not found" | Wrong path | Verify exact field name in SharePoint |
| "Cannot read property of null" | Null value | Add null checks or use `coalesce()` |
| "Template validation failed" | Missing action | Ensure referenced action exists and runs first |

---

## Security Considerations

### Sender Verification

The flow validates that the email sender matches the StudentEmail on record. This prevents:
- **Spoofed emails** being added to requests
- **Students adding messages** to other students' requests
- **External parties** injecting content into conversations

### Audit Trail

All actions are logged to AuditLog:
- **Successful message creation** — Action: "Comment Added"
- **Rejected messages** — Action: "Email Rejected" with sender details
- **Flow run IDs** for debugging and accountability

### Data Sanitization

Email body is processed to:
- **Strip quoted reply content** — Removes redundant previous messages
- **Limit message length** — SharePoint column limits apply (63,999 chars)
- **Preserve original timestamp** — Uses `receivedDateTime` from email

---

## Architecture Diagram

```
Email arrives in shared mailbox
        |
Trigger: Subject contains "REQ-"?
        | YES
Step 2: Extract ReqKey from Subject
        |
Step 3: ReqKey found? --NO--> Stop Flow - No ReqKey
        | YES
Step 4: Get PrintRequest by ReqKey
        |
Step 5: Request found? --NO--> Stop Flow - Request Not Found
        | YES
Step 6a: Get Request Record
        |
Step 6b: Extract Sender Email
        |
Step 6c: Search for Sender (Office 365 Users)
        |
Step 6d: Get Sender Object ID, Display Name, UPN
        |
Step 6e: Sender authorized? --NO--> Log Sender Mismatch + Stop Flow
        | YES
Step 7: Get Existing Thread
        |
Step 8: Clean Email Body
        |
Step 9: Create Inbound Message
  - Author: Sender (from Step 6d)
  - Direction: Inbound
  - ThreadID: existing or new
  - InReplyTo: parent MessageID
        |
Step 10: Flag Request for Attention
  - NeedsAttention: Yes
        |
Step 11: Log Inbound Message
        |
Step 12: Mark Email as Read
```

---

## Integration Notes

### With Flow D (PR-Message)

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

**Subject Format Dependency:**
- Flow D uses: `[REQ-00001] Message title`
- Flow E parses: `[REQ-00001]` pattern from subject
- Both flows must use consistent `[REQ-XXXXX]` format

### With Power Apps Dashboard

- Dashboard displays messages from RequestComments list
- `galMessages` gallery shows Direction indicator (Inbound/Outbound)
- Unread badge counts: `Direction = Inbound AND ReadByStaff = No`
- Staff can see full conversation history per request
- NeedsAttention flag surfaces requests with new replies

### With PrintRequests

- **NeedsAttention flag** surfaces replies in dashboard attention queue
- **LastAction** updated to "Comment Added"
- **LastActionAt** updated to current time
- **No status change** — staff decides next action after reading message

---

## Action Naming Summary

Use these exact names when renaming actions in Power Automate:

| Step | Action Type | Rename To |
|------|-------------|-----------|
| 2a | Compose | `Extract ReqKey from Subject` |
| 2b | Compose | `Build Full ReqKey` |
| 3 | Condition | `Check ReqKey Found` |
| 3 (NO) | Terminate | `Stop Flow - No ReqKey` |
| 4 | Get items (SharePoint) | `Get Print Request by ReqKey` |
| 5 | Condition | `Check Request Found` |
| 5 (NO) | Terminate | `Stop Flow - Request Not Found` |
| 6a | Compose | `Get Request Record` |
| 6b | Compose | `Extract Sender Email` |
| 6c | Search for users (Office 365) | `Search for Sender` |
| 6d | Compose | `Get Sender Object ID` |
| 6d-2 | Compose | `Get Sender Display Name` |
| 6d-3 | Compose | `Get Sender UPN` |
| 6e | Condition | `Validate Sender is Student` |
| 6e (NO) | Create item (SharePoint) | `Log Sender Mismatch` |
| 6e (NO) | Terminate | `Stop Flow - Sender Mismatch` |
| 7 | Get items (SharePoint) | `Get Existing Thread` |
| 8 | Compose | `Clean Email Body` |
| 9 | Create item (SharePoint) | `Create Inbound Message` |
| 10 | Update item (SharePoint) | `Flag Request for Attention` |
| 11 | Create item (SharePoint) | `Log Inbound Message` |
| 12 | Mark as read (Outlook) | `Mark Email as Read` |

**Why rename actions?**
- Makes flow easier to read and debug
- Expression references use action names (spaces become underscores)
- Example: `outputs('Get_Request_Record')` references the "Get Request Record" action

---

## Key Features

- **Subject Line Parsing** — Extracts ReqKey from `[REQ-00001]` pattern in any position
- **Sender Verification** — Validates email sender matches student on record (security)
- **Message Body Cleaning** — Strips quoted reply text for cleaner conversations
- **Email Threading Support** — Reuses ThreadID for conversation continuity
- **InReplyTo Linking** — References parent MessageID for thread hierarchy
- **Staff Notification** — Sets NeedsAttention flag to surface replies in dashboard
- **Complete Audit Logging** — Tracks all messages and rejections with FlowRunId
- **Graceful Termination** — Invalid emails terminate with success status (not errors)
- **Error Handling** — Exponential retry policies on all SharePoint/Outlook actions
- **Shared Mailbox Integration** — Monitors `coad-fablab@lsu.edu` for all student replies

---

## Error Handling Notes

- **Subject Filter:** Trigger only fires for emails with "REQ-" in subject, reducing unnecessary runs
- **ReqKey Validation:** Flow terminates gracefully if no `[REQ-00001]` pattern found
- **Request Validation:** Flow terminates gracefully if ReqKey doesn't match any PrintRequest
- **Sender Validation:** Mismatched senders logged to AuditLog before termination
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint/Exchange on throttling
- **Threading Fallback:** Creates new ThreadID if no existing thread found
- **Email Marking:** Processed emails marked as read for mailbox hygiene
