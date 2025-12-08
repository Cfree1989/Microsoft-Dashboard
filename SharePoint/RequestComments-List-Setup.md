# RequestComments SharePoint List Setup

**Purpose:** Enable bi-directional messaging between staff and students about print requests with email threading support  
**Time Required:** 45 minutes

---

## Overview

The RequestComments list stores all messages exchanged between staff and students. Each message is linked to a specific PrintRequest via RequestID, enabling conversation history tracking. The list supports:
- Bi-directional messaging (staff ↔ student)
- Email threading (keeping replies in the same thread)
- Tracking message direction (staff outbound vs student inbound)
- Matching incoming email replies to the correct request

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `RequestComments`
6. **Description:** `Messages between staff and students about print requests`
7. Click **Create**

---

## Step 2: Add Columns

After creating the list, add these 13 columns:

### Column 1: RequestID (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `RequestID`
3. **Description:** `Links to PrintRequests.ID`
4. **Require that this column contains information:** Yes
5. **Number of decimal places:** 0
6. Click **Save**

### Column 2: ReqKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Request identifier for display (REQ-00001)`
4. Click **Save**

### Column 3: Message (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `Message`
3. **Description:** `Full message content`
4. **Require that this column contains information:** Yes
5. **Type of text:** Plain text
6. Click **Save**

### Column 4: Author (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `Author`
3. **Description:** `Who wrote the message`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

### Column 5: AuthorRole (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `AuthorRole`
3. **Description:** `Whether the author is staff or student`
4. **Choices:**
   - Staff
   - Student
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 6: SentAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `SentAt`
3. **Description:** `When the message was sent`
4. **Include time:** Yes
5. **Default value:** Today's date
6. Click **Save**

### Column 7: ReadByStudent (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `ReadByStudent`
3. **Description:** `Has the student seen this message`
4. **Default value:** No
5. Click **Save**

### Column 8: ReadByStaff (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `ReadByStaff`
3. **Description:** `Has staff seen this message`
4. **Default value:** No
5. Click **Save**

### Column 9: StudentEmail (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `StudentEmail`
3. **Description:** `Student email for notifications (copied from PrintRequest)`
4. Click **Save**

### Column 10: Direction (Choice)

**Purpose:** Indicates whether the message was sent by staff (outbound) or received from student (inbound)

1. Click **+ Add column** → **Choice**
2. **Name:** `Direction`
3. **Description:** `Message direction - Outbound (staff to student) or Inbound (student reply)`
4. **Choices:**
   - Outbound
   - Inbound
5. **Default value:** Outbound
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 11: ThreadID (Single line of text)

**Purpose:** Groups related messages into a conversation thread. Format: `REQ-00001-{timestamp}`

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ThreadID`
3. **Description:** `Unique thread identifier for grouping conversation messages`
4. **Maximum number of characters:** 50
5. **Require that this column contains information:** No
6. Click **Save**

**ThreadID Format:** `REQ-00001-20251208143022`
- First part: ReqKey of the request
- Second part: Timestamp when thread was started (YYYYMMDDHHmmss)

### Column 12: MessageID (Single line of text)

**Purpose:** Stores the email Message-ID header for matching replies

1. Click **+ Add column** → **Single line of text**
2. **Name:** `MessageID`
3. **Description:** `Email Message-ID header for thread matching`
4. **Maximum number of characters:** 255
5. **Require that this column contains information:** No
6. Click **Save**

**MessageID Format:** `<REQ-00001-20251208143022@fablab.lsu.edu>`
- Standard email Message-ID format
- Used by email clients to maintain thread continuity

### Column 13: InReplyTo (Single line of text)

**Purpose:** Links a reply to its parent message for threading

1. Click **+ Add column** → **Single line of text**
2. **Name:** `InReplyTo`
3. **Description:** `Parent MessageID this message is replying to`
4. **Maximum number of characters:** 255
5. **Require that this column contains information:** No
6. Click **Save**

---

## Step 3: Security Configuration

Since students need to see messages from staff (not just their own), use view-based filtering:

1. **Keep default permissions** (all authenticated users can read)
2. **Filter in Power Apps** to show only relevant messages per request
3. **SharePoint views** filter by current user context

This approach is simpler and supports bi-directional messaging.

---

## Step 4: Create Views

### View 1: All Messages (Staff View)

1. Click **Settings** → **Create view** → **Standard view**
2. **Name:** `All Messages`
3. **Columns:** ReqKey, Title, Message, Author, AuthorRole, Direction, SentAt, ThreadID, ReadByStaff
4. **Sort:** SentAt (Descending)
5. Click **Save**

### View 2: Unread from Students

1. Click **Settings** → **Create view** → **Standard view**
2. **Name:** `Unread from Students`
3. **Filter:** AuthorRole = Student AND ReadByStaff = No
4. **Sort:** SentAt (Descending)
5. Click **Save**

### View 3: Threads by Request

1. Click **Settings** → **Create view** → **Standard view**
2. **Name:** `Threads by Request`
3. **Columns:** ReqKey, Direction, Title, Author, SentAt, ThreadID
4. **Sort:** 
   - First: ReqKey (Ascending)
   - Then: SentAt (Ascending)
5. **Group By:** ThreadID
6. Click **Save**

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | Yes | - | Message subject |
| RequestID | Number | Yes | - | Links to PrintRequests.ID |
| ReqKey | Single line | No | - | Display identifier |
| Message | Multi-line | Yes | - | Full content |
| Author | Person | Yes | - | Who wrote it |
| AuthorRole | Choice | Yes | - | Staff or Student |
| SentAt | DateTime | No | Today | Timestamp |
| ReadByStudent | Yes/No | No | No | Read tracking |
| ReadByStaff | Yes/No | No | No | Read tracking |
| StudentEmail | Single line | No | - | For notifications |
| Direction | Choice | Yes | Outbound | Inbound/Outbound indicator |
| ThreadID | Single line | No | - | Thread grouping |
| MessageID | Single line | No | - | Email Message-ID header |
| InReplyTo | Single line | No | - | Parent message reference |

---

## How Email Threading Works

### Outbound Messages (Staff → Student)

1. Staff sends message via Power Apps dashboard
2. Flow E generates:
   - `ThreadID`: `REQ-00001-{timestamp}` (new thread) or existing ThreadID (reply)
   - `MessageID`: `<{ThreadID}@fablab.lsu.edu>`
3. Email sent with:
   - Subject: `[REQ-00001] {subject}`
   - Message-ID header: `{MessageID}`
   - References header: `{previous MessageIDs in thread}`
4. `Direction` = Outbound

### Inbound Messages (Student → Staff)

1. Student replies to email
2. Email arrives in shared mailbox with `[REQ-00001]` in subject
3. Flow F parses:
   - Extracts ReqKey from subject
   - Reads In-Reply-To header to find parent MessageID
   - Looks up ThreadID from parent message
4. Creates RequestComments entry:
   - `Direction` = Inbound
   - `ThreadID` = same as parent
   - `InReplyTo` = parent MessageID
5. Sets `NeedsAttention = Yes` on PrintRequest

---

## Expression Reference for Flows

### Generate ThreadID (for new threads)

```
concat(
  outputs('Get_Print_Request')?['body/ReqKey'],
  '-',
  formatDateTime(utcNow(), 'yyyyMMddHHmmss')
)
```

### Generate MessageID

```
concat(
  '<',
  variables('ThreadID'),
  '@fablab.lsu.edu>'
)
```

### Extract ReqKey from Email Subject

```
first(split(last(split(triggerOutputs()?['body/Subject'], '[')), ']'))
```

**Example:**
- Input: `Re: [REQ-00001] Question about your file`
- Output: `REQ-00001`

---

## Verification Checklist

- [ ] List created with name "RequestComments"
- [ ] All 13 columns added
- [ ] AuthorRole has choices: Staff, Student
- [ ] Direction has choices: Outbound, Inbound (default: Outbound)
- [ ] SentAt has "Include time" enabled
- [ ] ReadByStudent and ReadByStaff default to No
- [ ] ThreadID column (50 chars max)
- [ ] MessageID column (255 chars max)
- [ ] InReplyTo column (255 chars max)
- [ ] All 3 views created

---

## Next Steps

1. Add data connection in Power Apps Staff Console
2. Build Send Message modal
3. Create Flow E (PR-Message) for notifications with threading headers
4. Create Flow F (PR-Mailbox) to process inbound student replies
5. Configure student-facing message view with Direction styling
