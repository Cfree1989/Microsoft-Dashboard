# My Requests Filter Issue

## The Problem

Students cannot see their own print requests on the "My Requests" screen in the PowerApps Student Portal. One student reported:

> "I submitted it again, and I could see it in my submissions folder, then I went and approved it on the lab computer and it went away."

The data exists in SharePoint, but the app's gallery filter is not matching it to the logged-in user.

## Why It Fails

### Root Cause #1: Filter Uses Wrong Field

The gallery filters by `Student.Claims`, which relies on the `Student` Person field. However, the `Student` Person field requires **manual selection** by the student from a dropdown:

```powerfx
// Current gallery filter
Filter(PrintRequests, Student.Claims = "i:0#.f|membership|" & varMeEmail)

// Student field is a ComboBox with manual selection
Items = Choices([@PrintRequests].Student)
```

This fails because:
- If a student selects the wrong person, `Student.Claims` won't match their actual login
- If the student has never submitted before, they may not appear in the Choices list
- The Claims value depends on SharePoint's internal user resolution, which may differ from `User().Email`

### Root Cause #2: Email Alias Mismatch

The university provides multiple email aliases for the same user:

| Location | StudentEmail Value |
|----------|-------------------|
| SharePoint List (stored) | `devin.beltz@lsu.edu` |
| Submit Form (displayed) | `dbeltz2@lsu.edu` |

`User().Email` returns `dbeltz2@lsu.edu`, but SharePoint stores `devin.beltz@lsu.edu`. The `StudentEmail` field is NOT saving the value from `User().Email`—likely because the DataCard's `Update` property isn't set correctly.

### Root Cause #3: Form Validation Error

An error appears during form submission:
```
PrintRequests failed: List data validation failed.
```

This indicates SharePoint is rejecting submissions due to validation rules (required fields, data type mismatches, or column validation formulas).

## Impact

- Students cannot see their own submissions in the app
- Students may resubmit requests thinking they didn't go through
- Staff may receive duplicate requests
- Trust in the app is undermined

## Scope

This is a data architecture and form configuration issue, not a SharePoint or Power Apps platform bug.

---

## Environment Details

- **App Type:** Power Apps Canvas App (Student Portal)
- **Data Source:** SharePoint Online (PrintRequests list)
- **Authentication:** Microsoft 365 / Azure AD
- **University:** LSU (Louisiana State University)
- **Email System:** Multiple aliases per user (e.g., `jsmith3@lsu.edu` and `john.smith@lsu.edu`)

### SharePoint List: PrintRequests

Key columns:
- `Student` (Person/People Picker) - stores user as SharePoint Person object with `DisplayName`, `Email`, `Claims`
- `StudentEmail` (Single line of text) - intended to store submitting user's email
- `Status` (Choice) - tracks request status
- `StudentConfirmed` (Yes/No) - tracks if student confirmed estimate

### Current App Configuration

**App.OnStart:**
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);
```

**galMyRequests.Items (current filter):**
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

**StudentEmail_DataCard1 (submit form):**
```powerfx
// TextInput Default
Default = If(frmSubmit.Mode = FormMode.New, Lower(User().Email), Parent.Default)
DisplayMode = DisplayMode.View
// Note: Update property may not be set correctly
```

---

## Research Prompt

```
I have a PowerApps canvas app where students cannot see their own print requests 
in a "My Requests" gallery. The app uses SharePoint as its data source.

ROOT CAUSES IDENTIFIED:
1. Gallery filter uses Student.Claims (Person field), but students manually select 
   their name from a dropdown—Claims may not match User().Email
2. StudentEmail field shows correct email in form but wrong email saves to SharePoint 
   (university has multiple email aliases per user)
3. Form submission sometimes fails with "List data validation failed"

PROPOSED FIXES:
1. Change gallery filter from Student.Claims to Lower(StudentEmail) = varMeEmail
2. Set StudentEmail_DataCard1.Update = Lower(User().Email) to ensure correct email saves
3. Manually repair existing records in SharePoint

QUESTIONS:
1. Are these root causes correct? Have I missed anything?
2. Is filtering by StudentEmail the right approach, or is there a better way to 
   reliably identify the submitting user?
3. Why might StudentEmail store the wrong value even when the form displays correctly?
4. Should I keep the Student Person field, or remove it entirely?
5. What causes "List data validation failed" errors?
6. Are there risks with these fixes? Will changing the filter break existing records?
7. How should I handle university email aliases long-term? Is there a consistent 
   identifier (User().Id, UPN, etc.)?
8. Is there a better architecture? Should I auto-populate the Student Person field 
   with the current user instead of manual selection?

For each recommendation, provide:
1. Validation or correction of my root cause analysis
2. Evaluation of my proposed fixes
3. Alternative approaches I should consider
4. Potential gotchas or side effects
5. Best practices for user identification in PowerApps with SharePoint
```

---

## AI Model Recommendations

*This prompt is being submitted to multiple AI models. Each model should add their recommendation below in the designated section.*

### Claude (Anthropic)

**Recommendation:** *(pending)*

**Justification:**

**Implementation Steps:**

---

### ChatGPT (OpenAI)

**Recommendation:** *(pending)*

**Justification:**

**Implementation Steps:**

---

### Gemini (Google)

**Recommendation:** *(pending)*

**Justification:**

**Implementation Steps:**

---

### Copilot (Microsoft)

**Recommendation:** *(pending)*

**Justification:**

**Implementation Steps:**

---

### Other Models

*(Add additional sections as needed)*

---

## Final Decision

**Selected Solution:** *(to be filled after reviewing all recommendations)*

**Rationale:**

**Implementation Date:**

**Status:** [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Abandoned
