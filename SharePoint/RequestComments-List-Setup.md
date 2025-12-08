# RequestComments SharePoint List Setup

**Purpose:** Enable bi-directional messaging between staff and students about print requests  
**Time Required:** 30 minutes

---

## Overview

The RequestComments list stores all messages exchanged between staff and students. Each message is linked to a specific PrintRequest via RequestID, enabling conversation history tracking.

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

After creating the list, add these columns:

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
3. **Columns:** ReqKey, Title, Message, Author, AuthorRole, SentAt, ReadByStaff
4. **Sort:** SentAt (Descending)
5. Click **Save**

### View 2: Unread from Students

1. Click **Settings** → **Create view** → **Standard view**
2. **Name:** `Unread from Students`
3. **Filter:** AuthorRole = Student AND ReadByStaff = No
4. **Sort:** SentAt (Descending)
5. Click **Save**

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

---

## Verification Checklist

- [ ] List created with name "RequestComments"
- [ ] All 9 columns added
- [ ] AuthorRole has choices: Staff, Student
- [ ] SentAt has "Include time" enabled
- [ ] ReadByStudent and ReadByStaff default to No
- [ ] Views created

---

## Next Steps

1. Add data connection in Power Apps Staff Console
2. Build Send Message modal
3. Create Flow E (PR-Message) for notifications
4. Configure student-facing message view
