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

**Recommendation:** Implement the proposed fixes (filter by `StudentEmail`, fix `StudentEmail_DataCard1.Update`), keep the `Student` Person field for display/staff use, and add a fallback filter for email aliases.

**Justification:**

1. **Root cause validation:** Your analysis is correct. The `Student.Claims` filter fails because (a) the Student field is manually selected and may not match the logged-in user, (b) `Student.Claims` is **not delegable** to SharePoint (only `Email` and `DisplayName` are delegable on Person types), so the filter may run locally and be limited to 500 records, and (c) email aliases cause `User().Email` to differ from what SharePoint stores.

2. **Why StudentEmail stores wrong value:** In Power Apps forms, the **DataCard's `Update` property** controls what gets written to SharePoint. If `Update` is unset or uses `Parent.Default`, it writes whatever the TextInput displays. If the TextInput's `Default` evaluates differently at save time (e.g., due to form lifecycle or a different user context), the wrong value can be saved. Setting `StudentEmail_DataCard1.Update = Lower(User().Email)` forces the correct value regardless of display.

3. **"List data validation failed":** This usually means SharePoint column validation (required fields, data type, or column validation formula) rejected the submission. Common causes: required Person field left blank, invalid choice value, or a validation formula failing. Check PrintRequests list settings → each column → Validation.

**Implementation Steps:**

1. **Fix gallery filter** — Set `galMyRequests.Items` to:
   ```powerfx
   SortByColumns(
       Filter(
           PrintRequests,
           Lower(StudentEmail) = varMeEmail
       ),
       "Created",
       SortOrder.Descending
   )
   ```
   This matches the spec. Records with blank `StudentEmail` will not appear until repaired (step 3).

2. **Fix StudentEmail save** — On `StudentEmail_DataCard1` (the card, not the TextInput), set:
   - `Update` = `Lower(User().Email)`
   - Ensure the inner TextInput has `DisplayMode` = `DisplayMode.View` and `Default` = `Lower(User().Email)` for new records.

3. **Repair existing records** — For records with wrong/missing `StudentEmail`, run a one-time flow or use SharePoint list view to bulk update `StudentEmail` from `Student.Email` where possible.

4. **Keep Student Person field** — Retain it for staff display and reporting. Use `StudentEmail` as the primary filter key; `Student` remains useful for People Picker features and staff workflows.

5. **Email aliases long-term** — `User().Email` returns the primary UPN. For LSU's multi-alias setup, consider storing **both** `User().Email` and `User().Id` (GUID) in a new column if needed for future-proofing. For now, `Lower(User().Email)` is the most reliable; ensure IT documents which alias is primary for M365.

**Potential gotchas:**
- `Lower()` on `Student.Email` may not delegate to SharePoint; if PrintRequests exceeds 500 items, consider a different approach (e.g., Power Automate to sync a "MyRequests" view).
- Existing records with blank `StudentEmail` will not appear until repaired.
- If "List data validation failed" persists, inspect each required column and any column validation formulas in SharePoint.

---

### ChatGPT (OpenAI)

**Recommendation:** Your root-cause analysis is largely correct. Implement your short-term fixes now (`StudentEmail`-based filtering + explicit DataCard `Update` values), but move to a stronger long-term identity model: auto-populate identity fields on submit and filter by an immutable user identifier (Entra Object ID) rather than email alias.

**Justification:**

1. **Root-cause validation:**  
   - Correct: filtering by a manually selected `Student` person record is brittle and can mismatch the signed-in user.  
   - Correct: alias differences (`User().Email` vs stored SharePoint email) can hide valid records.  
   - Correct: DataCard `Update` (not TextInput `Default`) determines what is actually written.  
   - Missing piece: formulas like `Lower(StudentEmail)` or `Lower(Student.Email)` in filters can introduce delegation warnings/performance issues on larger lists.

2. **Filter strategy (`StudentEmail` vs better key):**  
   - `StudentEmail` is a good immediate fix and better than `Student.Claims` in your current setup.  
   - Best long-term key is immutable identity (Entra Object ID), because aliases and UPNs can change.

3. **Why `StudentEmail` can save incorrectly even if displayed correctly:**  
   - DataCard `Update` is bound to `Parent.Default` or an unintended control value.  
   - Another formula/flow overwrites values after submit.  
   - Form state changes (new/edit/reset) cause the control `Default` to re-evaluate unexpectedly.

4. **Keep or remove the `Student` Person field:**  
   - Keep it for staff UX, People Picker rendering, approvals, and reporting.  
   - Do **not** let students manually select it; auto-populate it from the current user.

5. **`List data validation failed` likely causes:**  
   - Required columns missing  
   - Invalid choice values  
   - Person field payload shape mismatch  
   - Column/list validation formulas failing  
   - Unique column/index conflicts  
   - Power Automate post-submit updates failing validation

6. **Risks/gotchas:**  
   - Changing the gallery filter can hide legacy rows until backfilled.  
   - Non-delegable filter logic can silently truncate visible records beyond app limits.  
   - Email-only identity remains vulnerable to future alias changes.

7. **Best-practice identity model for Power Apps + SharePoint:**  
   - Store three identity values on create: immutable ID, canonical email, display name.  
   - Auto-populate identity fields in form `Update` properties (not user-editable controls).  
   - Normalize on write; keep list filters as simple delegated equality checks.

**Implementation Steps:**

1. **On app start, capture normalized user context**
   ```powerfx
   Set(varMeEmail, Lower(User().Email));
   Set(varMeName, User().FullName);
   // If available in your tenant/app version:
   Set(varMeObjectId, User().EntraObjectId);
   ```

2. **Stop manual user identity selection in submit form**
   - Hide/lock the `Student` card for student-facing submission.
   - Set `Student_DataCard.Update` to a generated person record:
   ```powerfx
   {
       '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
       Claims: "i:0#.f|membership|" & varMeEmail,
       DisplayName: varMeName,
       Email: varMeEmail
   }
   ```

3. **Force identity fields to save from current session user**
   - `StudentEmail_DataCard.Update`:
   ```powerfx
   varMeEmail
   ```
   - If you add a `StudentObjectId` text column, set:
   ```powerfx
   StudentObjectId_DataCard.Update = varMeObjectId
   ```

4. **Update My Requests filter**
   - **Immediate safe version (email-based with fallback):**
   ```powerfx
   SortByColumns(
       Filter(
           PrintRequests,
           StudentEmail = varMeEmail || Student.Email = varMeEmail
       ),
       "Created",
       SortOrder.Descending
   )
   ```
   - **Preferred long-term version (immutable key):**
   ```powerfx
   SortByColumns(
       Filter(
           PrintRequests,
           StudentObjectId = varMeObjectId
       ),
       "Created",
       SortOrder.Descending
   )
   ```

5. **Backfill existing rows**
   - One-time repair script/flow:
     - If `StudentObjectId` blank, populate from directory lookup by `Student.Email` or known mapping table.
     - If `StudentEmail` blank/wrong, set from normalized authoritative value.
   - Keep temporary fallback filter until backfill completion is verified.

6. **Debug validation failures systematically**
   - Use form `OnFailure` to surface details:
   ```powerfx
   Notify(frmSubmit.Error, NotificationType.Error)
   ```
   - In SharePoint, review each column’s Required/Validation settings.
   - Use Power Apps Monitor during submit to identify exact failing field/payload.

---

### Gemini (Google)

**Recommendation:** Adopt the **Text-Based Email Filter** strategy (Proposed Fix #1 & #2) as the primary solution to bypass SharePoint's alias resolution issues. Additionally, **automate the Student Person field** to prevent user error.

**Justification:**

1.  **Root Cause Validation:** Confirmed. The mismatch between `User().Email` (session context) and SharePoint's stored User Profile email is a known synchronization challenge in hybrid/enterprise environments. Relying on SharePoint's Person field resolution (`Claims` or `.Email`) introduces a dependency on the User Profile Service, which is failing here.
2.  **Why the Text Column Fix Works:** By saving `User().Email` directly into a simple Text column (`StudentEmail`), you create a "what you see is what you get" match. You are filtering based on the exact string the app session uses, ignoring whatever alias SharePoint prefers.
3.  **Delegation Warning:** `Lower()` is often non-delegable in SharePoint filters depending on the API version. To ensure scalability beyond 2,000 records:
    *   **Action:** Ensure the `StudentEmail` is *saved* as lowercase in the `Update` property (`Lower(User().Email)`).
    *   **Filter:** Use `StudentEmail = varMeEmail` (remove `Lower()` from the left side of the filter).

**Implementation Steps:**

1.  **Optimize Data Storage (Prevent Delegation Issues):**
    *   Set `StudentEmail_DataCard1.Update` = `Lower(User().Email)`
    *   Ensure `varMeEmail` is set to `Lower(User().Email)` in `App.OnStart`.

2.  **Apply Robust Filter:**
    *   Update `galMyRequests.Items`:
        ```powerfx
        SortByColumns(
            Filter(PrintRequests, StudentEmail = varMeEmail),
            "Created",
            SortOrder.Descending
        )
        ```

3.  **UX Improvement (Auto-populate Person Field):**
    *   Even if you filter by the text column, you should fix the `Student` Person field to prevent confusion.
    *   Set the `Student` DataCard `Default` to `User()` (or lookup the user if needed).
    *   Set `DisplayMode` to `DisplayMode.View` so users cannot select the wrong person.

4.  **Troubleshoot Validation Error:**
    *   The "List data validation failed" error often occurs if the `Student` Person field is **Required** in SharePoint but the form is sending a blank or invalid value.
    *   **Check:** If you hide the `Student` card or change its defaults, ensure it is still submitting a valid Claims string or User record. If you switch to only using `StudentEmail`, make the `Student` column **Optional** in SharePoint settings.

---

### Copilot (Microsoft)

**Recommendation:** *(pending)*

**Justification:**

**Implementation Steps:**

---

### Other Models

*(Add additional sections as needed)*

---

---

# Implementation Guide

**⏱️ Time Required:** 30-45 minutes  
**🎯 Goal:** Fix the "My Requests" filter so students can see their own print requests

> ⚠️ **IMPORTANT:** Complete all Phase 1 steps before testing. The fix requires changes to both the submit form AND the gallery filter to work correctly.

---

## Prerequisites

Before you start, make sure you have:

- [ ] **Power Apps Studio** open with the Student Portal app
- [ ] **Edit access** to the PrintRequests SharePoint list
- [ ] **Existing `varMeEmail` variable** set in `App.OnStart` (should already exist)

Verify `App.OnStart` includes this line:
```powerfx
Set(varMeEmail, Lower(User().Email));
```

> 💡 **Tip:** If `varMeEmail` doesn't exist, add the line above to your `App.OnStart` and run OnStart before proceeding.

---

# PHASE 1: Fix the Submit Form

These changes ensure new submissions save the correct student identity.

---

## STEP 1: Fix StudentEmail to Save Correctly

**What you're doing:** Ensuring the `StudentEmail` field saves the logged-in user's email (lowercase) instead of relying on form display values.

### Instructions

1. In the **Tree view** (left panel), navigate to `scrSubmit` → `frmSubmit`.
2. Expand `frmSubmit` to see all DataCards.
3. Click on **StudentEmail_DataCard1** (the card, not the text input inside it).
4. In the **Property dropdown** (top left), select **Update**.
5. In the **formula bar**, delete any existing content and paste:

**⬇️ FORMULA: Paste into StudentEmail_DataCard1.Update**

```powerfx
Lower(User().Email)
```

6. Press **Enter** to confirm.

### Verification

- The formula bar should show `Lower(User().Email)`
- No red error underlines should appear

> 💡 **Why this works:** The `Update` property controls what gets written to SharePoint. By setting it to `Lower(User().Email)`, we bypass any display issues and guarantee the correct email is saved.

---

## STEP 2: Auto-Populate the Student Person Field

**What you're doing:** Automatically filling the Student Person field with the logged-in user's identity so students don't have to select themselves from a dropdown.

### Instructions

1. In the **Tree view**, find **Student_DataCard1** inside `frmSubmit`.
2. Click on **Student_DataCard1** (the card itself).
3. In the **Property dropdown**, select **Update**.
4. In the **formula bar**, delete any existing content and paste:

**⬇️ FORMULA: Paste into Student_DataCard1.Update**

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & Lower(User().Email),
    DisplayName: User().FullName,
    Email: Lower(User().Email)
}
```

5. Press **Enter** to confirm.

### Verification

- The formula should show the full record structure
- No red error underlines should appear

> ⚠️ **Note:** The `@odata.type` line must include the `@` symbol and quotes exactly as shown. If you get errors, check for curly quotes (see Prerequisites in the main spec).

---

## STEP 3: Lock the Student Field (Prevent Manual Selection)

**What you're doing:** Preventing students from accidentally selecting the wrong person by making the Student field read-only.

### Instructions

1. Still on **Student_DataCard1**, find the **DisplayMode** property in the Property dropdown.
2. Set **DisplayMode** to:

**⬇️ FORMULA: Paste into Student_DataCard1.DisplayMode**

```powerfx
DisplayMode.View
```

3. Press **Enter** to confirm.

### Alternative: Hide the Field Entirely

If you prefer to hide the Student field completely:

1. Click on **Student_DataCard1**.
2. Set **Visible** to:

```powerfx
false
```

> 💡 **Tip:** Hiding is cleaner for students, but keeping it visible (in View mode) helps with debugging if issues arise.

---

## STEP 4: Add Error Handling to Debug Validation Failures

**What you're doing:** Making validation errors visible so you can identify what's causing "List data validation failed" errors.

### Instructions

1. In the **Tree view**, click on **frmSubmit** (the form itself, not a DataCard).
2. In the **Property dropdown**, select **OnFailure**.
3. In the **formula bar**, paste:

**⬇️ FORMULA: Paste into frmSubmit.OnFailure**

```powerfx
Notify("Error: " & frmSubmit.Error, NotificationType.Error);
Set(varIsLoading, false)
```

4. Press **Enter** to confirm.

### What You Should See

When a submission fails, a red notification banner will appear showing the specific error message.

> 💡 **Debugging tip:** If errors mention a specific field, check that field's DataCard `Update` property and the SharePoint column's Required/Validation settings.

---

# PHASE 2: Fix the My Requests Gallery

Now that submissions save correctly, update the gallery filter to find them.

---

## STEP 5: Update the Gallery Filter

**What you're doing:** Changing the gallery to filter by `StudentEmail` (text field) instead of `Student.Claims` (Person field), which is more reliable.

### Instructions

1. In the **Tree view**, navigate to `scrMyRequests` (or the screen containing your My Requests gallery).
2. Click on **galMyRequests** (or your gallery name).
3. In the **Property dropdown**, select **Items**.
4. In the **formula bar**, delete the existing filter and paste:

**⬇️ FORMULA: Paste into galMyRequests.Items**

```powerfx
SortByColumns(
    Filter(PrintRequests, StudentEmail = varMeEmail),
    "Created",
    SortOrder.Descending
)
```

5. Press **Enter** to confirm.

### Verification

- No delegation warning (yellow triangle) should appear
- The gallery should show requests for the logged-in user

> ⚠️ **Important:** Do NOT use `Lower(StudentEmail)` in the filter. Since we save emails as lowercase in Step 1, we filter by lowercase. Using `Lower()` in the filter can cause delegation issues with large lists.

---

## STEP 6: Test the Fix

**What you're doing:** Verifying that new submissions appear in My Requests.

### Instructions

1. Press **F5** to preview the app (or click the Play button).
2. Navigate to the **Submit** screen.
3. Fill out the form and submit a test request.
4. Navigate to the **My Requests** screen.
5. Verify the new request appears in the gallery.

### What You Should See

| Check | Expected Result |
|-------|-----------------|
| Form submits | Success notification, no errors |
| SharePoint list | New row with `StudentEmail` = your lowercase email |
| My Requests gallery | New request appears immediately |

### If the Request Doesn't Appear

1. Open SharePoint and check the PrintRequests list directly
2. Find your new submission
3. Check the `StudentEmail` column value
4. Compare it to `varMeEmail` (should be identical, lowercase)

> 💡 **Tip:** Use Power Apps Monitor (Settings → Upcoming features → Enable Monitor) to see exactly what's being sent to SharePoint.

---

# PHASE 3: Repair Existing Records

Existing records may have blank or incorrect `StudentEmail` values. This phase fixes them.

---

## STEP 7: Backfill Existing Records (Power Automate)

**What you're doing:** Creating a one-time flow to populate `StudentEmail` for old records.

### Instructions

1. Open **Power Automate**: [make.powerautomate.com](https://make.powerautomate.com)
2. Click **+ Create** → **Instant cloud flow**.
3. Name it: `Backfill StudentEmail (One-Time)`
4. Choose trigger: **Manually trigger a flow**
5. Click **Create**.

### Add Flow Steps

**Step 1: Get all PrintRequests**

1. Click **+ New step**.
2. Search for **SharePoint** → **Get items**.
3. Configure:
   - **Site Address:** Your SharePoint site
   - **List Name:** PrintRequests
   - **Top Count:** 5000 (or leave blank for all)

**Step 2: Loop through and update**

1. Click **+ New step**.
2. Search for **Control** → **Apply to each**.
3. Select **value** from "Get items" as the input.
4. Inside the loop, click **Add an action**.
5. Search for **Control** → **Condition**.
6. Configure the condition:
   - **Left:** `empty(items('Apply_to_each')?['StudentEmail'])`
   - **Operator:** `is equal to`
   - **Right:** `true`

**Step 3: Update blank records (in the "Yes" branch)**

1. In the **Yes** branch, click **Add an action**.
2. Search for **SharePoint** → **Update item**.
3. Configure:
   - **Site Address:** Your SharePoint site
   - **List Name:** PrintRequests
   - **Id:** `items('Apply_to_each')?['ID']`
   - **StudentEmail:** `toLower(items('Apply_to_each')?['Student']?['Email'])`

### Run the Flow

1. Click **Save**.
2. Click **Test** → **Manually** → **Test**.
3. Wait for completion.
4. Check SharePoint to verify `StudentEmail` is now populated.

> ⚠️ **Note:** Records where `Student.Email` is also blank cannot be auto-repaired. These need manual review.

---

## STEP 8: (Optional) Temporary Fallback Filter

**What you're doing:** Adding a fallback filter that catches old records during the transition period.

> 💡 **Use this only if:** You have existing records that can't be backfilled and need to appear in My Requests immediately.

### Instructions

1. Replace the `galMyRequests.Items` formula from Step 5 with:

**⬇️ FORMULA: Temporary fallback filter**

```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        StudentEmail = varMeEmail || Lower(Student.Email) = varMeEmail
    ),
    "Created",
    SortOrder.Descending
)
```

2. After backfill is complete and verified, **revert to the simpler filter** from Step 5.

> ⚠️ **Warning:** The fallback filter uses `Lower()` which may cause delegation warnings. This is acceptable temporarily but should be removed once backfill is verified.

---

# Verification Checklist

After completing all steps, verify each item:

- [ ] **StudentEmail_DataCard1.Update** = `Lower(User().Email)`
- [ ] **Student_DataCard1.Update** = auto-populate record (Step 2 formula)
- [ ] **Student_DataCard1.DisplayMode** = `DisplayMode.View` (or Visible = false)
- [ ] **frmSubmit.OnFailure** = error notification (Step 4 formula)
- [ ] **galMyRequests.Items** = `StudentEmail = varMeEmail` filter
- [ ] **Test submission** appears in My Requests gallery
- [ ] **SharePoint list** shows correct `StudentEmail` value
- [ ] **Backfill flow** ran successfully (if applicable)
- [ ] **Old records** appear after backfill (if applicable)

---

# Troubleshooting

## "List data validation failed" error

| Possible Cause | Solution |
|----------------|----------|
| Required field is blank | Check SharePoint list settings for required columns |
| Invalid Person field value | Ensure Step 2 formula is correct (check quotes) |
| Column validation formula failing | Check SharePoint column validation settings |

**To investigate:**
1. Open SharePoint → PrintRequests → List Settings
2. Check each column for "Require that this column contains information"
3. Check each column's "Column Validation" section
4. Check "List Settings" → "Validation settings"

## New submissions don't appear in My Requests

| Possible Cause | Solution |
|----------------|----------|
| `StudentEmail` not saving | Verify Step 1 formula is on the DataCard, not TextInput |
| Email case mismatch | Ensure both save and filter use lowercase |
| `varMeEmail` not set | Check `App.OnStart` includes `Set(varMeEmail, Lower(User().Email))` |

**To debug:**
1. Submit a test request
2. Open SharePoint → PrintRequests
3. Find the new row
4. Check `StudentEmail` value exactly (case matters!)

## Old records still don't appear after backfill

| Possible Cause | Solution |
|----------------|----------|
| Backfill flow didn't update all records | Re-run flow, check for errors |
| `Student.Email` was also blank | Manual update required in SharePoint |
| Using wrong email alias | Check which alias SharePoint stored vs `User().Email` |

---

# Summary

| Phase | What Changed | Why |
|-------|-------------|-----|
| **Phase 1** | Submit form auto-captures student identity | Prevents wrong person selection, guarantees correct email |
| **Phase 2** | Gallery filters by `StudentEmail` text field | More reliable than Person field Claims, fully delegable |
| **Phase 3** | Backfill existing records | Old records need `StudentEmail` populated to appear |

---

**Status:** [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Abandoned
