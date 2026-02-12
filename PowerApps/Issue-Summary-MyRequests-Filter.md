# Issue Summary: Students Cannot See Print Requests in "My Requests" Page

## Overview

A PowerApps Student Portal application for a university 3D printing lab has a critical bug where students cannot see their own print requests on the "My Requests" screen. The app uses SharePoint as its data source.

---

## Symptom Reported by Student

> "I submitted it again, and I could see it in my submissions folder, then I went and approved it on the lab computer and it went away."

This indicates:
1. The student successfully submitted a request (visible in SharePoint)
2. After some action on the lab computer (approval), the request disappeared from their view in the app
3. The data still exists in SharePoint, but the app's filter is not matching it

---

## Application Architecture

### Data Source
- **SharePoint List:** `PrintRequests`
- **Key Fields:**
  - `Student` (Person/People Picker field) - stores user as SharePoint Person object with properties: `DisplayName`, `Email`, `Claims`
  - `StudentEmail` (Single line of text) - intended to store the submitting user's email
  - `Status` (Choice field) - tracks request status
  - `StudentConfirmed` (Yes/No) - tracks if student confirmed estimate

### User Identification
On app start (`App.OnStart`):
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);
```

### Current Gallery Filter (The Problem)
The `galMyRequests` gallery uses this Items formula:
```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Student.Claims = "i:0#.f|membership|" & varMeEmail
    ),
    "Created",
    SortOrder.Descending
)
```

### Student Field Configuration (Submit Form)
The `Student_DataCard1` in the submit form is configured as:
```powerfx
// ComboBox Items - students must MANUALLY SELECT their name
Items = Choices([@PrintRequests].Student)
DefaultSelectedItems = Parent.Default
IsSearchable = true
InputTextPlaceholder = "Search for your name..."
```

### StudentEmail Field Configuration (Submit Form)
The `StudentEmail_DataCard1` is supposed to auto-populate:
```powerfx
// TextInput Default (intended)
Default = If(frmSubmit.Mode = FormMode.New, Lower(User().Email), Parent.Default)
DisplayMode = DisplayMode.View  // Read-only
```

---

## Root Causes Identified

### Root Cause #1: Filter Uses Wrong Field

**The Problem:**
The gallery filters by `Student.Claims`, which relies on the `Student` Person field. However, the `Student` Person field requires **manual selection** by the student from a dropdown (ComboBox with `Choices([@PrintRequests].Student)`).

**Why This Fails:**
1. If a student selects the wrong person from the dropdown, `Student.Claims` won't match their actual login
2. If the student has never submitted before, they may not appear in the Choices list
3. If any process (like lab approval) modifies the Student field, it could break the match
4. The Claims value depends on SharePoint's internal user resolution, which may differ from `User().Email`

**Evidence:**
Debug labels were added showing:
- `"Looking for: i:0#.f|membership|" & varMeEmail`
- `"First item Claims: " & First(PrintRequests).Student.Claims`

These showed the expected Claims format but items were still not appearing.

### Root Cause #2: Email Alias Mismatch

**The Problem:**
The university provides multiple email aliases for the same user:
- `dbeltz2@lsu.edu` (short form - what `User().Email` returns)
- `devin.beltz@lsu.edu` (long form - different alias)

**Evidence from Screenshots:**

| Location | StudentEmail Value |
|----------|-------------------|
| SharePoint List | `devin.beltz@lsu.edu` |
| Submit Form Display | `dbeltz2@lsu.edu` |

These are two different email addresses for the **same person**.

**Why This Happens:**
The `StudentEmail` field is NOT being saved correctly. Even though the form shows `dbeltz2@lsu.edu` (from `User().Email`), SharePoint stores `devin.beltz@lsu.edu`. This suggests:

1. The DataCard's `Update` property is not set to `Lower(User().Email)`
2. The value might be coming from the Student Person field's `.Email` property instead
3. Or the TextInput's `Default` formula isn't being applied correctly

When the filter runs:
```powerfx
Lower(StudentEmail) = varMeEmail
// Becomes: "devin.beltz@lsu.edu" = "dbeltz2@lsu.edu"
// Result: FALSE (no match)
```

### Root Cause #3: Form Submission Error

**Additional Issue Observed:**
The screenshot shows an error during form submission:
```
PrintRequests failed: List data validation failed. 
clientRequestId: f9d92d17-cfe1-4953-bc8c-98b43fbbec2b 
serviceRequestId: 475df6a1-4050-b000-ad86-112331fbff5b
```

This indicates SharePoint is rejecting the submission due to validation rules, which could be:
- Required fields not filled
- Data type mismatches
- Column validation formulas failing
- Lookup column reference errors

---

## The Fix

### Fix 1: Change Gallery Filter to Use StudentEmail

**Before:**
```powerfx
Filter(PrintRequests, Student.Claims = "i:0#.f|membership|" & varMeEmail)
```

**After:**
```powerfx
Filter(PrintRequests, Lower(StudentEmail) = varMeEmail)
```

**Rationale:** `StudentEmail` is a simple text field that should be auto-populated from `User().Email` and never modified. It's more reliable than the Person field's Claims property.

### Fix 2: Ensure StudentEmail Saves Correctly

**On StudentEmail_DataCard1 (the DataCard itself):**
```powerfx
Update = Lower(User().Email)
```

**On the TextInput inside StudentEmail_DataCard1:**
```powerfx
Default = Lower(User().Email)
DisplayMode = DisplayMode.View
```

**Rationale:** The DataCard's `Update` property is what actually gets written to SharePoint. Setting it to `Lower(User().Email)` ensures the correct email is saved regardless of what the TextInput displays.

### Fix 3: Repair Existing Records

For students whose records have the wrong email stored:
1. Open SharePoint → PrintRequests list
2. Edit the affected record
3. Change `StudentEmail` to match the student's actual login email
4. Save

---

## Key Technical Insights

### SharePoint Person Fields vs Text Fields

| Aspect | Person Field (Student) | Text Field (StudentEmail) |
|--------|----------------------|---------------------------|
| Data Type | Complex object with DisplayName, Email, Claims, etc. | Simple string |
| Selection | Manual (People Picker/ComboBox) | Can be auto-populated |
| Reliability | Can vary based on user selection and SharePoint resolution | Consistent if set from User().Email |
| Claims Format | `i:0#.f|membership|email@domain.com` | N/A |

### University Email Alias Problem

Many universities provide multiple email aliases that route to the same mailbox:
- Short form: `jsmith3@university.edu`
- Full name: `john.smith@university.edu`
- With middle initial: `john.m.smith@university.edu`

`User().Email` returns whichever alias the user used to log in, which may differ from:
- What's displayed in the People Picker
- What SharePoint resolves the Person field to
- What was stored in previous submissions

### EditForm DataCard Properties

- `Default` - What displays in the control when the form loads
- `Update` - What gets saved to the data source when SubmitForm() runs
- `DisplayMode` - Whether the field is editable

Setting `Update = Lower(User().Email)` on the DataCard ensures the correct value is saved regardless of what the TextInput shows.

---

## Debug Labels Used

Two debug labels were added to the My Requests screen:

**Label2:**
```powerfx
"Your email: " & varMeEmail & " | Items found: " & CountRows(PrintRequests)
```

**Label3:**
```powerfx
"Looking for: i:0#.f|membership|" & varMeEmail & 
Char(10) & Char(10) &
"First item Claims: " & First(PrintRequests).Student.Claims
```

These helped identify that:
1. `varMeEmail` was correctly set to the lowercase login email
2. The Claims format was being constructed correctly
3. The issue was with what's stored in SharePoint, not the filter syntax

---

## Files Involved

- **StudentPortal-App-Spec.md** - Contains the full application specification
- **PrintRequests** - SharePoint list storing all print requests
- **scrMyRequests** - The screen where students view their requests
- **galMyRequests** - The gallery displaying filtered requests
- **scrSubmit** - The screen with the submit form
- **frmSubmit** - The EditForm for submitting new requests
- **StudentEmail_DataCard1** - The DataCard for the StudentEmail field
- **Student_DataCard1** - The DataCard for the Student Person field
