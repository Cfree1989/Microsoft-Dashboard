# PrintRequests SharePoint List Setup

**Purpose:** Central repository for all 3D print requests  
**Time Required:** 45 minutes

---

## Overview

The PrintRequests list is the core data store for the Fabrication Lab 3D Print Request Management System. It contains all student submissions and staff processing information.

**Key Features:**
- 32 total fields (13 student-facing + 14 staff processing + 5 payment recording)
- Item-level security ensuring students see only their requests
- Attachment support for 3D model files
- Version history enabled for change tracking
- Status formatting with color-coded visual indicators
- Payment recording with estimate vs actual tracking

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `PrintRequests`
6. **Description:** `Central repository for all 3D print requests`
7. Click **Create**

---

## Step 2: Enable Attachments and Version History

1. Click **Settings** (gear icon) → **List settings**
2. Click **Advanced settings**
3. Under **Attachments**, select **Enabled**
4. Under **Item-level Permissions**:
   - Read access: **Only their own**
   - Create and Edit access: **Only their own**
5. Click **OK**
6. Go back to **List settings** → **Versioning settings**
7. Set **Create a version each time you edit an item** to **Yes**
8. Click **OK**

---

## Step 3: Add Student-Facing Columns (13)

### Column 1: ReqKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Auto-generated unique ID (format: REQ-00042)`
4. Click **Save**

### Column 2: Student (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `Student`
3. **Description:** `Requester identification`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

### Column 3: StudentEmail (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `StudentEmail`
3. **Description:** `Contact information`
4. **Require that this column contains information:** Yes
5. Click **Save**

### Column 4: TigerCardNumber (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `TigerCardNumber`
3. **Description:** `16-digit POS number from Tiger Card (NOT the LSUID) - used for manual payment entry`
4. **Require that this column contains information:** Yes
5. Click **Save**

#### Add Column Validation

6. After creating the column, go to **List Settings** (gear icon → List settings)
7. Under **Columns**, click on **TigerCardNumber**
8. Scroll down to **Column Validation**
9. In the **Formula** box, paste:

```
=LEN([TigerCardNumber])=16
```

10. In **User message**, enter:

```
Please enter your 16-digit Tiger Card POS number (NOT your LSUID). This is the longer number on your card. Do not include the dash or the number after it.
```

11. Click **OK**

> 💡 **What the validation checks:**
> - Total length is exactly 16 digits
> - Format: `XXXXXXXXXXXXXXXX`

> ⚠️ **IMPORTANT - Which Number to Enter:**
> 
> On the Tiger Card, there are TWO numbers:
> - **LSUID** (starts with 89, ~9 digits) - This is NOT what we need
> - **POS Number** (16 digits) - **THIS is what we need**
> 
> **Example:**
> ```
> LSUID: 899903556          ← NOT this one (9 digits - will FAIL)
> 6272100454327897-5        ← Use the first part only
> 6272100454327897          ← ENTER THIS (16 digits - will PASS)
> ```
> 
> **Do NOT include:** The dash and number after it (e.g., `-5`). That's just the card replacement count.
> 
> This number is used when cards won't swipe and staff need to manually enter the number into the TigerCASH POS system.

### Column 5: Course Number (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `Course Number`
3. **Description:** `Optional class number (e.g., 1001, 2050)`
4. **Require that this column contains information:** No
5. **Number of decimal places:** 0
6. Click **Save**

### Column 6: Discipline (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Discipline`
3. **Description:** `Student's academic discipline`
4. **Choices:**
   - Architecture
   - Engineering
   - Art & Design
   - Business
   - Liberal Arts
   - Sciences
   - Other
5. Click **Save**

### Column 7: ProjectType (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `ProjectType`
3. **Description:** `Type of project`
4. **Choices:**
   - Class Project
   - Research
   - Personal
   - Other
5. Click **Save**

### Column 8: Color (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Color`
3. **Description:** `Preferred filament/resin color`
4. **Choices:**
   - Any
   - Black
   - White
   - Gray
   - Red
   - Orange
   - Yellow
   - Green
   - Forest Green
   - Blue
   - Purple
   - Brown
   - Chocolate Brown
   - Copper
   - Bronze
   - Silver
   - Clear
5. **Require that this column contains information:** Yes
6. Click **Save**

#### Apply Color Formatting (Visual Color Display)

7. After creating the column, click the **Color** column header → **Column settings** → **Format this column**
8. Click **Advanced mode**
9. Paste the JSON from `SharePoint/FilamentColor-Column-Formatting.json`
10. Click **Save**

> 💡 **Result:** Each color choice will display as a pill/badge with its actual filament color as the background, making it easy to visually identify colors in the list view.

### Column 9: Method (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Method`
3. **Description:** `Printing method`
4. **Choices:**
   - Filament
   - Resin
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 10: Printer (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Printer`
3. **Description:** `Selected printer with build plate dimensions`
4. **Choices:**
   - Prusa MK4S (9.8×8.3×8.7in)
   - Prusa XL (14.2×14.2×14.2in)
   - Raised3D Pro 2 Plus (12.0×12.0×23in)
   - Form 3 (5.7×5.7×7.3in)
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 11: DueDate (Date)

1. Click **+ Add column** → **Date and time**
2. **Name:** `DueDate`
3. **Description:** `Timeline planning`
4. **Include time:** No
5. Click **Save**

### Column 12: Notes (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `Notes`
3. **Description:** `Additional instructions`
4. **Type of text:** Plain text
5. Click **Save**

---

## Step 4: Add Staff-Only Columns (10+)

### Column 13: Status (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Status`
3. **Description:** `Current status of the request`
4. **Choices:**
   - Uploaded
   - Pending
   - Ready to Print
   - Printing
   - Completed
   - Paid & Picked Up
   - Rejected
   - Canceled
   - Archived
5. **Default value:** Uploaded
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 14: Priority (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Priority`
3. **Description:** `Processing priority`
4. **Choices:**
   - Low
   - Normal
   - High
   - Rush
5. **Default value:** Normal
6. Click **Save**

### Column 15: AssignedTo (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `AssignedTo`
3. **Description:** `Optional field for manual assignment if needed (not used in automated workflows)`
4. **Require that this column contains information:** No
5. **Allow multiple selections:** No
6. Click **Save**

### Column 16: EstHours (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `EstHours`
3. **Description:** `Time estimation in hours (Display name: EstimatedTime)`
4. **Number of decimal places:** 1
5. Click **Save**

### Column 17: EstWeight (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `EstWeight`
3. **Description:** `Material weight in grams (Display name: EstimatedWeight)`
4. **Number of decimal places:** 0
5. Click **Save**

### Column 18: EstimatedCost (Currency)

1. Click **+ Add column** → **Currency**
2. **Name:** `EstimatedCost`
3. **Description:** `Calculated cost estimation (see PRD Appendix D for formula)`
4. **Currency format:** $ English (United States)
5. **Number of decimal places:** 2
6. Click **Save**

### Column 19: StaffNotes (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `StaffNotes`
3. **Description:** `Internal communication`
4. **Type of text:** Plain text
5. Click **Save**

### Column 20: RejectionReason (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `RejectionReason`
3. **Description:** `Reason for rejection`
4. **Choices:**
   - File format not supported
   - Design not printable
   - Excessive material usage
   - Incomplete request information
   - Size limitations
   - Material not available
   - Quality concerns
   - Other
5. **Can add values manually:** Yes (fill-in)
6. Click **Save**

### Column 21: StudentConfirmed (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `StudentConfirmed`
3. **Description:** `Student approval of cost estimate`
4. **Default value:** No
5. Click **Save**

### Column 22: NeedsAttention (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `NeedsAttention`
3. **Description:** `Flags items requiring staff review`
4. **Default value:** No
5. Click **Save**

### Column 23: Expanded (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `Expanded`
3. **Description:** `Power Apps UI state for collapsed/expanded view`
4. **Default value:** No
5. Click **Save**

### Column 24: LastAction (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `LastAction`
3. **Description:** `Most recent action type`
4. **Choices:**
   - Created
   - Updated
   - Status Change
   - File Added
   - Comment Added
   - Assigned
   - Email Sent
   - Rejected
   - Canceled by Student
   - System
5. Click **Save**

### Column 25: LastActionBy (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `LastActionBy`
3. **Description:** `High-level action attribution (stores "System" or staff name)`
4. Click **Save**

**Note:** This is Single line text (not Person) to allow "System" value for infinite loop prevention.

### Column 26: LastActionAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `LastActionAt`
3. **Description:** `Audit timestamp`
4. **Include time:** Yes
5. Click **Save**

---

## Step 4B: Add Payment Recording Columns (5)

These columns capture actual payment details when a print is picked up.

### Column 27: TransactionNumber (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `TransactionNumber`
3. **Description:** `TigerCASH transaction/receipt number`
4. Click **Save**

### Column 28: FinalWeight (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `FinalWeight`
3. **Description:** `Actual weight of finished print in grams`
4. **Number of decimal places:** 0
5. Click **Save**

### Column 29: FinalCost (Currency)

1. Click **+ Add column** → **Currency**
2. **Name:** `FinalCost`
3. **Description:** `Actual cost charged (calculated from FinalWeight)`
4. **Currency format:** $ English (United States)
5. **Number of decimal places:** 2
6. Click **Save**

### Column 30: PaymentDate (Date)

1. Click **+ Add column** → **Date and time**
2. **Name:** `PaymentDate`
3. **Description:** `Date payment was recorded`
4. **Include time:** No
5. Click **Save**

### Column 31: PaymentNotes (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `PaymentNotes`
3. **Description:** `Staff notes about payment (discrepancies, special circumstances)`
4. **Type of text:** Plain text
5. Click **Save**

---

## Step 5: Add Status Color Formatting

1. Go to the default view
2. Click the **Status** column header → **Column settings** → **Format this column**
3. Click **Advanced mode**
4. Paste the JSON from `SharePoint/Format Status Columns.json`
5. Click **Save**

---

## Step 6: Create Views

### View 1: My Requests (Student View)

1. Click **Settings** (gear icon) → **List settings**
2. Scroll down to **Views** section → Click **Create view**
3. Select **Standard View**
4. **View Name:** `My Requests`
5. **Columns:** Check these columns:
   - Title
   - ReqKey
   - Status
   - Method
   - Printer
   - Color
   - EstimatedCost
   - StudentConfirmed
   - Created
6. **Sort:** Created (Descending)
7. **Filter:** Show items only when the following is true:
   - Student **is equal to** [Me]
8. Click **OK**

### View 2: All Requests (Staff View)

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `All Requests`
4. **Columns:** Check all relevant columns
5. **Sort:** Modified (Descending)
6. Click **OK**

### View 3: Active Queue

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `Active Queue`
4. **Filter:** Status **is not equal to** Archived AND Status **is not equal to** Paid & Picked Up
5. **Sort:** Created (Ascending)
6. Click **OK**

---

## Column Summary

### Student-Facing Fields (13)

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | Yes | - | Request title |
| ReqKey | Single line | No | - | Auto-generated unique ID (REQ-00042) |
| Student | Person | Yes | - | Requester identification |
| StudentEmail | Single line | Yes | - | Contact information |
| TigerCardNumber | Single line | Yes | - | 16-digit POS number (NOT LSUID) for manual payment entry |
| Course Number | Number | No | - | Optional class number |
| Discipline | Choice | No | - | Academic discipline |
| ProjectType | Choice | No | - | Class Project; Research; Personal; Other |
| Color | Choice | Yes | - | Any; Black; White; Gray; Red; Orange; Yellow; Green; Forest Green; Blue; Purple; Brown; Chocolate Brown; Copper; Bronze; Silver; Clear |
| Method | Choice | Yes | - | Filament; Resin |
| Printer | Choice | Yes | - | Printer with build dimensions |
| DueDate | Date | No | - | Timeline planning |
| Notes | Multi-line | No | - | Additional instructions |

### Staff-Only Fields (Estimates & Processing)

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Status | Choice | Yes | Uploaded | Current status |
| Priority | Choice | No | Normal | Processing priority |
| AssignedTo | Person | No | - | Manual assignment (optional) |
| EstHours | Number | No | - | Estimated time in hours |
| EstWeight | Number | No | - | Estimated material weight in grams |
| EstimatedCost | Currency | No | - | Calculated estimated cost |
| StaffNotes | Multi-line | No | - | Internal communication |
| RejectionReason | Choice (fill-in) | No | - | Rejection reason |
| StudentConfirmed | Yes/No | No | No | Student approval of estimate |
| NeedsAttention | Yes/No | No | No | Flags for staff review |
| Expanded | Yes/No | No | No | Power Apps UI state |
| LastAction | Choice | No | - | Most recent action type |
| LastActionBy | Single line | No | - | Action attribution |
| LastActionAt | DateTime | No | - | Audit timestamp |

### Payment Recording Fields (Actuals at Pickup)

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| TransactionNumber | Single line | No | - | TigerCASH transaction/receipt number |
| FinalWeight | Number | No | - | Actual weight of finished print (grams) |
| FinalCost | Currency | No | - | Actual cost charged (from FinalWeight) |
| PaymentDate | Date | No | - | Date payment was recorded |
| PaymentNotes | Multi-line | No | - | Payment discrepancies or notes |

---

## Verification Checklist

- [ ] List created with name "PrintRequests"
- [ ] Attachments enabled in Advanced settings
- [ ] Item-level permissions configured (students see only their own)
- [ ] Version history enabled
- [ ] All 13 student-facing columns added (including TigerCardNumber)
- [ ] All 14 staff processing columns added
- [ ] All 5 payment recording columns added
- [ ] Status has all 9 choices with default "Uploaded"
- [ ] Priority has 4 choices with default "Normal"
- [ ] Method has choices: Filament, Resin
- [ ] Printer has all 4 printer options with dimensions
- [ ] StudentConfirmed, NeedsAttention, Expanded default to No
- [ ] Status column formatting applied
- [ ] Color column formatting applied (actual filament colors)
- [ ] Views created: My Requests, All Requests, Active Queue

---

## Notes on Field Types

- **EstHours** internal name is `EstHours` in SharePoint (Display: EstimatedTime)
- **EstWeight** internal name is `EstWeight` in SharePoint (Display: EstimatedWeight)
- **EstimatedCost** vs **FinalCost**: Estimates are set at approval; Finals are recorded at payment pickup
- **FinalWeight** captures actual material used; enables estimate accuracy tracking
- **LastActionBy** is Single line text (not Person) to allow "System" value for infinite loop prevention
- For detailed audit attribution with person fields, see AuditLog.Actor

