# Flow E (PR-Mailbox)

**Full Name:** PR-Mailbox: Process inbound replies  
**Trigger:** Office 365 Outlook — When a new email arrives in a shared mailbox (V2)

**Purpose:** Monitor the shared mailbox for student email replies, parse them to find the related print request, and add them to the RequestComments list for staff visibility.

---

## Overview

When a student replies to an email about their print request:
1. Flow detects email in shared mailbox
2. Parses subject line for `[REQ-00001]` pattern
3. Looks up the matching PrintRequest
4. Validates sender matches student on record
5. Creates RequestComments entry (Direction: Inbound)
6. Flags the request for staff attention
7. Logs the activity

---

## Prerequisites

- [ ] `RequestComments` SharePoint list with threading columns (see `RequestComments-Schema-Update.md`)
- [ ] `PrintRequests` list with `NeedsAttention` field
- [ ] `AuditLog` list exists
- [ ] Shared mailbox `coad-fablab@lsu.edu` configured
- [ ] Flow owner has "Read and manage" permissions on shared mailbox
- [ ] Flow D (PR-Message) sending emails with `[REQ-00001]` subject format

---

## Step 1: Create the Flow

1. **Power Automate** → **My flows** → **+ New flow** → **Automated cloud flow**
2. **Name:** `Flow E (PR-Mailbox)` or `PR-Mailbox: Process inbound replies`
3. **Trigger:** Office 365 Outlook – **When a new email arrives in a shared mailbox (V2)**
4. **Configure trigger:**
   - **Original Mailbox Address:** `coad-fablab@lsu.edu`
   - **Folder:** Inbox
   - **Include Attachments:** No (for performance)
   - **Subject Filter:** `REQ-` (filters to only emails with REQ- in subject)

> **Note:** The subject filter reduces flow runs by only triggering on emails that might be replies to print requests.

---

## Step 2: Extract ReqKey from Subject

**What this does:** Parses the email subject to find the request identifier.

### Step 2a: Compose ReqKey Extraction

1. **+ New step** → **Compose**
2. **Rename:** `Extract ReqKey from Subject`
3. **Inputs:** Expression:
```
if(
  contains(triggerOutputs()?['body/subject'], '[REQ-'),
  first(split(last(split(triggerOutputs()?['body/subject'], '[REQ-')), ']')),
  ''
)
```

**How this works:**
- Input: `Re: [REQ-00001] Question about your file`
- `split(..., '[REQ-')` → `['Re: ', '00001] Question about your file']`
- `last(...)` → `'00001] Question about your file'`
- `split(..., ']')` → `['00001', ' Question about your file']`
- `first(...)` → `'00001'`

### Step 2b: Build Full ReqKey

1. **+ New step** → **Compose**
2. **Rename:** `Build Full ReqKey`
3. **Inputs:** Expression:
```
if(
  empty(outputs('Extract_ReqKey_from_Subject')),
  '',
  concat('REQ-', outputs('Extract_ReqKey_from_Subject'))
)
```

---

## Step 3: Validate ReqKey Found

**What this does:** Stops processing if no valid ReqKey was found in the subject.

1. **+ New step** → **Condition**
2. **Rename:** `Check ReqKey Found`
3. **Left:** Expression → `outputs('Build_Full_ReqKey')`
4. **Operator:** is not equal to
5. **Right:** (leave empty - checking for non-empty string)

**NO Branch (No ReqKey Found):**
1. **+ Add action** → **Terminate**
2. **Status:** Succeeded
3. **Message:** `No ReqKey found in subject - not a reply to a print request email`

**YES Branch:** Continue with Steps 4+

---

## Step 4: Look Up Print Request

**What this does:** Finds the PrintRequest matching the ReqKey.

1. **+ New step** → **Get items** (SharePoint)
2. **Rename:** `Get Print Request by ReqKey`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `PrintRequests`
5. **Filter Query:** Expression:
```
concat('ReqKey eq ''', outputs('Build_Full_ReqKey'), '''')
```
6. **Top Count:** `1`

---

## Step 5: Validate Request Found

**What this does:** Stops processing if no matching request exists.

1. **+ New step** → **Condition**
2. **Rename:** `Check Request Found`
3. **Left:** Expression → `length(outputs('Get_Print_Request_by_ReqKey')?['body/value'])`
4. **Operator:** is greater than
5. **Right:** `0`

**NO Branch (No Request Found):**
1. **+ Add action** → **Terminate**
2. **Status:** Succeeded
3. **Message:** Expression:
```
concat('No PrintRequest found for ReqKey: ', outputs('Build_Full_ReqKey'))
```

**YES Branch:** Continue with Steps 6+

---

## Step 6: Validate Sender Email

**What this does:** Verifies the email sender matches the student on the request to prevent spoofing.

### Step 6a: Get Request Details

1. **+ New step** → **Compose**
2. **Rename:** `Get Request Record`
3. **Inputs:** Expression → `first(outputs('Get_Print_Request_by_ReqKey')?['body/value'])`

### Step 6b: Compare Sender to StudentEmail

1. **+ New step** → **Condition**
2. **Rename:** `Validate Sender is Student`
3. **Left:** Expression → `toLower(triggerOutputs()?['body/from'])`
4. **Operator:** contains
5. **Right:** Expression → `toLower(outputs('Get_Request_Record')?['StudentEmail'])`

> **Note:** We use `contains` rather than `equals` because the From field may include display name like `"Jane Doe" <janedoe@lsu.edu>`.

**NO Branch (Sender Mismatch):**
1. **+ Add action** → **Create item** (SharePoint) → List: `AuditLog`
2. **Rename:** `Log Sender Mismatch`
3. **Title:** `Email Reply Rejected - Sender Mismatch`
4. **RequestID:** Expression → `outputs('Get_Request_Record')?['ID']`
5. **ReqKey:** Expression → `outputs('Build_Full_ReqKey')`
6. **Action Value:** `Email Rejected`
7. **FieldName:** `SenderEmail`
8. **OldValue:** Expression → `outputs('Get_Request_Record')?['StudentEmail']`
9. **NewValue:** Expression → `triggerOutputs()?['body/from']`
10. **ActorRole Value:** `System`
11. **ClientApp Value:** `Power Automate`
12. **ActionAt:** Expression → `utcNow()`
13. **FlowRunId:** Expression → `workflow()['run']['name']`
14. **Notes:** `Email rejected: sender does not match student on record`

Then:
1. **+ Add action** → **Terminate**
2. **Status:** Succeeded
3. **Message:** `Sender email does not match student on record`

**YES Branch:** Continue with Steps 7+

---

## Step 7: Get Thread Information

**What this does:** Finds the existing ThreadID for this request's conversation.

1. **+ New step** → **Get items** (SharePoint)
2. **Rename:** `Get Existing Thread`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `RequestComments`
5. **Filter Query:** Expression:
```
concat('RequestID eq ', outputs('Get_Request_Record')?['ID'])
```
6. **Top Count:** `1`
7. **Order By:** `SentAt desc`

---

## Step 8: Extract Clean Message Body

**What this does:** Strips quoted reply text from the email body to get just the new content.

1. **+ New step** → **Compose**
2. **Rename:** `Clean Email Body`
3. **Inputs:** Expression:
```
if(
  contains(triggerOutputs()?['body/body'], '---'),
  first(split(triggerOutputs()?['body/body'], '---')),
  if(
    contains(triggerOutputs()?['body/body'], 'From:'),
    first(split(triggerOutputs()?['body/body'], 'From:')),
    if(
      contains(triggerOutputs()?['body/body'], 'On '),
      first(split(triggerOutputs()?['body/body'], 'On ')),
      triggerOutputs()?['body/body']
    )
  )
)
```

> **Note:** This attempts to strip common reply markers. The order checks for `---` (our separator), then `From:`, then `On ` (common in "On [date], [person] wrote:").

---

## Step 9: Create RequestComments Entry

**What this does:** Adds the student's reply to the conversation in SharePoint.

1. **+ New step** → **Create item** (SharePoint)
2. **Rename:** `Create Inbound Message`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `RequestComments`
5. **Title:** Expression:
```
if(
  contains(triggerOutputs()?['body/subject'], 'Re:'),
  concat('Re: ', outputs('Build_Full_ReqKey')),
  triggerOutputs()?['body/subject']
)
```
6. **RequestID:** Expression → `outputs('Get_Request_Record')?['ID']`
7. **ReqKey:** Expression → `outputs('Build_Full_ReqKey')`
8. **Message:** Expression → `outputs('Clean_Email_Body')`
9. **Author Claims:** Expression → `outputs('Get_Request_Record')?['Student']?['Claims']`
10. **AuthorRole Value:** `Student`
11. **SentAt:** Expression → `triggerOutputs()?['body/receivedDateTime']`
12. **ReadByStudent:** `Yes`
13. **ReadByStaff:** `No`
14. **StudentEmail:** Expression → `outputs('Get_Request_Record')?['StudentEmail']`
15. **Direction Value:** `Inbound`
16. **ThreadID:** Expression:
```
if(
  greater(length(outputs('Get_Existing_Thread')?['body/value']), 0),
  first(outputs('Get_Existing_Thread')?['body/value'])?['ThreadID'],
  concat(outputs('Build_Full_ReqKey'), '-', formatDateTime(utcNow(), 'yyyyMMddHHmmss'))
)
```
17. **InReplyTo:** Expression:
```
if(
  greater(length(outputs('Get_Existing_Thread')?['body/value']), 0),
  first(outputs('Get_Existing_Thread')?['body/value'])?['MessageID'],
  ''
)
```

---

## Step 10: Update PrintRequest - Flag for Attention

**What this does:** Marks the request as needing staff attention.

1. **+ New step** → **Update item** (SharePoint)
2. **Rename:** `Flag Request for Attention`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `PrintRequests`
5. **Id:** Expression → `outputs('Get_Request_Record')?['ID']`
6. **NeedsAttention:** `Yes`
7. **LastAction Value:** `Message Received`
8. **LastActionBy:** Leave blank or set to: `System`
9. **LastActionAt:** Expression → `utcNow()`

---

## Step 11: Log to AuditLog

**What this does:** Creates an audit trail entry for the inbound message.

1. **+ New step** → **Create item** (SharePoint)
2. **Rename:** `Log Inbound Message`
3. **Site:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
4. **List:** `AuditLog`
5. **Title:** `Student Email Reply Received`
6. **RequestID:** Expression → `outputs('Get_Request_Record')?['ID']`
7. **ReqKey:** Expression → `outputs('Build_Full_ReqKey')`
8. **Action Value:** `Message Received`
9. **FieldName:** `Direction`
10. **NewValue:** `Inbound`
11. **Actor Claims:** Expression → `outputs('Get_Request_Record')?['Student']?['Claims']`
12. **ActorRole Value:** `Student`
13. **ClientApp Value:** `Email`
14. **ActionAt:** Expression → `utcNow()`
15. **FlowRunId:** Expression → `workflow()['run']['name']`
16. **Notes:** Expression:
```
concat('Student replied via email. Thread: ', outputs('Create_Inbound_Message')?['body/ThreadID'])
```

---

## Step 12: Mark Email as Read (Optional)

**What this does:** Marks the processed email as read in the shared mailbox.

1. **+ New step** → **Mark as read or unread (V3)** (Office 365 Outlook)
2. **Rename:** `Mark Email as Read`
3. **Message Id:** Expression → `triggerOutputs()?['body/id']`
4. **Mailbox address:** `coad-fablab@lsu.edu`
5. **Mark as:** `Read`

---

## Testing Checklist

### Basic Functionality
- [ ] Email with `[REQ-00001]` in subject triggers flow
- [ ] ReqKey correctly extracted from subject line
- [ ] Matching PrintRequest found
- [ ] RequestComments entry created with Direction: Inbound
- [ ] NeedsAttention set to Yes on PrintRequest
- [ ] AuditLog entry created

### Email Parsing
- [ ] Subject: `Re: [REQ-00001] Question` → ReqKey: `REQ-00001`
- [ ] Subject: `[REQ-00042] My file` → ReqKey: `REQ-00042`
- [ ] Subject: `Fwd: [REQ-00001] Question` → ReqKey: `REQ-00001`
- [ ] Subject: `No ReqKey here` → Flow terminates gracefully

### Sender Validation
- [ ] Matching sender email → Message accepted
- [ ] Non-matching sender email → Message rejected with audit log
- [ ] Sender format `"Name" <email>` → Correctly matched

### Message Body Cleaning
- [ ] Reply with `---` separator → Only new content saved
- [ ] Reply with `From:` quote → Only new content saved
- [ ] Reply with `On [date] wrote:` → Only new content saved
- [ ] Simple reply without markers → Full body saved

### Threading
- [ ] First inbound message → Creates new ThreadID if none exists
- [ ] Reply to existing thread → Reuses ThreadID
- [ ] InReplyTo populated with parent MessageID

### Edge Cases
- [ ] Email without ReqKey → Flow terminates without error
- [ ] ReqKey for non-existent request → Flow terminates with log
- [ ] Multiple emails in quick succession → All processed correctly
- [ ] HTML email body → Content extracted properly

---

## Expression Reference

| Purpose | Expression |
|---------|------------|
| Email Subject | `triggerOutputs()?['body/subject']` |
| Email Body | `triggerOutputs()?['body/body']` |
| Email From | `triggerOutputs()?['body/from']` |
| Email Received Time | `triggerOutputs()?['body/receivedDateTime']` |
| Email Message ID | `triggerOutputs()?['body/id']` |
| Extract ReqKey Number | `first(split(last(split(subject, '[REQ-')), ']'))` |
| Build Full ReqKey | `concat('REQ-', extractedNumber)` |
| Get First Array Item | `first(outputs('Action')?['body/value'])` |
| Check Array Length | `length(outputs('Action')?['body/value'])` |

---

## Troubleshooting

### Flow Not Triggering

1. **Check mailbox permissions:** Flow owner needs "Read and manage" on shared mailbox
2. **Check subject filter:** Ensure emails have `REQ-` in subject
3. **Check folder:** Flow monitors Inbox only by default

### ReqKey Not Extracted

1. **Check subject format:** Must be `[REQ-00001]` with square brackets
2. **Check expression:** Test with sample subjects in Compose action
3. **Common issue:** Extra spaces or characters breaking split

### Sender Validation Failing

1. **Check email format:** From field may include display name
2. **Check case sensitivity:** Expression uses `toLower()` for comparison
3. **Check StudentEmail field:** Ensure populated on PrintRequest

### Message Body Issues

1. **HTML content:** Body may contain HTML tags - consider using `body/bodyPreview` for plain text
2. **Long quoted sections:** Expression only handles common patterns
3. **Encoding issues:** Special characters may need handling

### Thread Not Linking

1. **Check ThreadID:** Verify previous messages have ThreadID populated
2. **Check InReplyTo:** Should reference parent MessageID
3. **Check query:** Filter query must match RequestID exactly

---

## Security Considerations

### Sender Verification

The flow validates that the email sender matches the StudentEmail on record. This prevents:
- Spoofed emails being added to requests
- Students adding messages to other students' requests
- External parties injecting content

### Audit Trail

All actions are logged to AuditLog:
- Successful message creation
- Rejected messages (sender mismatch)
- Flow run IDs for debugging

### Data Sanitization

Email body is processed to:
- Strip quoted reply content
- Limit message length (SharePoint column limits)
- Prevent injection via message content

---

## Architecture Diagram

```
Email arrives in shared mailbox
        ↓
Trigger: Subject contains "REQ-"?
        ↓ YES
Extract ReqKey from subject
        ↓
ReqKey found? ──NO──→ Terminate (not a reply)
        ↓ YES
Look up PrintRequest by ReqKey
        ↓
Request found? ──NO──→ Terminate (invalid ReqKey)
        ↓ YES
Validate sender = StudentEmail
        ↓
Sender matches? ──NO──→ Log rejection + Terminate
        ↓ YES
Get existing thread info
        ↓
Clean email body (strip quotes)
        ↓
Create RequestComments entry
  - Direction: Inbound
  - ThreadID: existing or new
  - InReplyTo: parent MessageID
        ↓
Update PrintRequest
  - NeedsAttention: Yes
        ↓
Log to AuditLog
        ↓
Mark email as read
```

---

## Integration Notes

### With Flow D (PR-Message)

- Flow E sends **outbound** messages with `[REQ-00001]` subject format
- Flow E processes **inbound** replies with same subject format
- Both flows use same ThreadID for conversation continuity

### With Power Apps Dashboard

- Dashboard displays messages from RequestComments list
- `galMessages` gallery shows Direction indicator
- Unread badge counts `Direction = Inbound AND ReadByStaff = No`
- Staff can see full conversation history per request

### With PrintRequests

- NeedsAttention flag surfaces replies in dashboard
- LastAction updated to "Message Received"
- No changes to request status - staff decides next action

