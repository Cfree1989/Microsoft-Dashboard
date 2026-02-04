# AuditLog SharePoint List Setup

**Purpose:** Complete tracking system for all actions and changes  
**Time Required:** 30 minutes

---

## Overview

The AuditLog list provides complete tracking for all actions, changes, and system events with full attribution and temporal ordering. This list is essential for compliance requirements.

**Key Features:**
- 14 total fields
- Captures all create, update, and status change operations
- Links to specific PrintRequest items
- Records actor, timestamp, and action details
- Supports both automated and manual action logging

**Security:** All staff can read all entries (no item-level permissions). Students cannot access AuditLog list.

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `AuditLog`
6. **Description:** `Complete tracking system for all actions and changes`
7. Click **Create**

---

## Step 2: Add Core Tracking Columns (5)

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
3. **Description:** `Request identifier (REQ-00001)`
4. Click **Save**

### Column 3: Action (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Action`
3. **Description:** `Type of action performed`
4. **Choices:**
   - Created
   - Updated
   - Status Change
   - File Added
   - Comment Added
   - Assigned
   - Approved
   - Picked Up
   - Started
   - Completed
   - Email Sent
   - Rejected
   - Canceled by Student
   - System
5. **Require that this column contains information:** Yes
6. Click **Save**

> ⚠️ **Important:** Include all action values that Power Apps might log. If you try to log an action that isn't in this list, the flow will fail with "could not log to audit" error.

### Column 4: ActionAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `ActionAt`
3. **Description:** `When action occurred (UTC)`
4. **Include time:** Yes
5. **Require that this column contains information:** Yes
6. Click **Save**

---

## Step 3: Add Change Tracking Columns (3)

### Column 5: FieldName (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `FieldName`
3. **Description:** `Which field changed (e.g., "Status", "Priority")`
4. Click **Save**

### Column 6: OldValue (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `OldValue`
3. **Description:** `Previous value before change`
4. **Type of text:** Plain text
5. Click **Save**

### Column 7: NewValue (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `NewValue`
3. **Description:** `New value after change`
4. **Type of text:** Plain text
5. Click **Save**

---

## Step 4: Add Attribution Columns (3)

### Column 8: Actor (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `Actor`
3. **Description:** `Who performed the action (resolved to person field with full metadata)`
4. **Require that this column contains information:** No
5. **Allow multiple selections:** No
6. Click **Save**

**Note:** Actor can be null for system-generated entries.

### Column 9: ActorRole (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `ActorRole`
3. **Description:** `Role of the actor`
4. **Choices:**
   - Student
   - Staff
   - System
5. Click **Save**

### Column 10: ClientApp (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `ClientApp`
3. **Description:** `Application that triggered the action`
4. **Choices:**
   - SharePoint Form
   - Power Apps
   - Power Automate
5. Click **Save**

---

## Step 5: Add Debugging Columns (2)

### Column 11: Notes (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `Notes`
3. **Description:** `Additional context or error messages`
4. **Type of text:** Plain text
5. Click **Save**

### Column 12: FlowRunId (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `FlowRunId`
3. **Description:** `Power Automate run ID for tracing`
4. Click **Save**

---

## Step 6: Create Views

### View 1: All Entries

1. Click **Settings** (gear icon) → **List settings**
2. Scroll down to **Views** section → Click **Create view**
3. Select **Standard View**
4. **View Name:** `All Entries`
5. **Columns:** Check these columns:
   - Title
   - ReqKey
   - Action
   - FieldName
   - Actor
   - ActorRole
   - ActionAt
6. **Sort:** ActionAt (Descending)
7. Click **OK**

### View 2: By Request

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `By Request`
4. **Columns:** Title, Action, FieldName, OldValue, NewValue, Actor, ActionAt
5. **Sort:** ActionAt (Descending)
6. **Group By:** ReqKey
7. Click **OK**

### View 3: Status Changes

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `Status Changes`
4. **Columns:** ReqKey, OldValue, NewValue, Actor, ActionAt
5. **Filter:** Action **is equal to** Status Change
6. **Sort:** ActionAt (Descending)
7. Click **OK**

---

## Column Summary

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| Title | Single line | Yes | Human-readable action summary |
| RequestID | Number | Yes | Links to PrintRequests.ID |
| ReqKey | Single line | No | Request identifier (REQ-00001) |
| Action | Choice | Yes | Created; Updated; Status Change; File Added; Comment Added; Assigned; Approved; Picked Up; Started; Completed; Email Sent; Rejected; Canceled by Student; System |
| ActionAt | DateTime | Yes | When action occurred (UTC) |
| FieldName | Single line | No | Which field changed |
| OldValue | Multi-line | No | Previous value before change |
| NewValue | Multi-line | No | New value after change |
| Actor | Person | No | Who performed the action |
| ActorRole | Choice | No | Student; Staff; System |
| ClientApp | Choice | No | SharePoint Form; Power Apps; Power Automate |
| Notes | Multi-line | No | Additional context or error messages |
| FlowRunId | Single line | No | Power Automate run ID for tracing |

---

## Usage Examples

### Field Change Entry

```
Title: "Priority Change"
RequestID: 42
ReqKey: "REQ-00042"
Action: "Updated"
FieldName: "Priority"
OldValue: "Normal"
NewValue: "High"
Actor: [Staff Member Person Field]
ActorRole: "Staff"
ClientApp: "SharePoint Form"
ActionAt: "2025-10-14 10:30:00"
```

### Email Sent Entry

```
Title: "Email Sent: Confirmation"
RequestID: 42
ReqKey: "REQ-00042"
Action: "Email Sent"
FieldName: "StudentEmail"
NewValue: "student@lsu.edu"
Actor: [NULL]
ActorRole: "System"
ClientApp: "Power Automate"
ActionAt: "2025-10-14 10:30:15"
FlowRunId: "08586653536760461208"
```

---

## Permissions Configuration

### Staff Access
- Staff should have **Full Control** (inherited from site permissions)
- All staff can read all audit entries

### Student Access
- Students should **NOT** have access to the AuditLog list
- Remove any inherited student permissions if necessary

### To Configure:
1. Go to **List settings** → **Permissions for this list**
2. Click **Stop Inheriting Permissions** (if students have site access)
3. Remove student groups from permissions
4. Keep Fabrication Lab Staff group with Full Control

---

## Verification Checklist

- [ ] List created with name "AuditLog"
- [ ] All 13 columns added (plus Title)
- [ ] RequestID is Number type with 0 decimal places
- [ ] Action has all 13 choices (including Approved, Picked Up, Started, Completed)
- [ ] ActionAt has "Include time" enabled
- [ ] Actor is Person type (allows null)
- [ ] ActorRole has choices: Student, Staff, System
- [ ] ClientApp has choices: SharePoint Form, Power Apps, Power Automate
- [ ] OldValue and NewValue are Multi-line text
- [ ] 3 views created: All Entries, By Request, Status Changes
- [ ] Student access removed from permissions

---

## Next Steps

1. Configure Flow B (PR-Audit) to write to this list
2. Configure Flow C (PR-Action) for staff action logging
3. Test audit trail by making changes in PrintRequests
4. Verify all actions are being logged correctly

