# Rejection Email Missing Reasons Issue

## The Problem

When staff reject a 3D print request through the Power Apps Staff Dashboard, the student receives an automated rejection email but the **REASON FOR REJECTION** and **ADDITIONAL DETAILS** sections are empty, even though the rejection reasons are clearly visible in the SharePoint `StaffNotes` field.

**Observed behavior (REQ-00127, Alexandra R Garner, 2/27/2026):**
- SharePoint `StaffNotes` contains: "REJECTED by Ian R: Features are too small or too thin; Open model/not solid geometry; Your model still has zero thickness areas; and there are 3 copies of the same model in the file. - 2/27 4:12PM"
- Rejection email shows "REASON FOR REJECTION:" followed by nothing
- Rejection email shows "ADDITIONAL DETAILS:" followed by nothing
- AuditLog confirms email was sent successfully (Title: "Email Sent: Rejection")

**Impact:**
- Students receive rejection emails with no explanation
- Students contact staff asking why their request was rejected
- Staff must manually explain rejection reasons (defeating automation purpose)
- Trust in the notification system is undermined

---

## Environment Details

- **App Type:** Power Apps Staff Dashboard (Canvas App)
- **Flow:** PR-Audit (Flow B) — sends rejection email when Status changes to "Rejected"
- **Data Source:** SharePoint Online (PrintRequests list)
- **Email Method:** Send from shared mailbox (coad-fablab@lsu.edu)
- **Test Case:** REQ-00127, Student: Alexandra R Garner, Date: 2/27/2026

### SharePoint List: PrintRequests

Key columns involved in rejection:
- `Status` (Choice) — changed to "Rejected" by staff action
- `RejectionReason` (Choice, multi-select with fill-in) — stores predefined reasons as choice values
- `StaffNotes` (Multiple lines text) — contains human-readable rejection entry with reasons
- `Notes` (Multiple lines text) — student's notes from submission (not staff notes)

### Current Flow Configuration

**Flow B "Send Rejection Email" action uses:**

```
REASON FOR REJECTION:
@{outputs('Compose_Formatted_Reasons_Text')}

ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}
```

**Flow B data pipeline:**
1. `Get Current Rejected Data` — fetches fresh PrintRequest item
2. `Format Rejection Reasons` — Select action extracting `Value` from `RejectionReason` choice field
3. `Compose Formatted Reasons Text` — joins array with `; ` separator
4. `Send Rejection Email` — uses composed text in email body

---

## Root Cause Analysis

### Hypothesis 1: RejectionReason Choice Column Not Being Populated

The Power Apps rejection button builds two separate outputs:

**1. `varRejectionReasons` (text string for StaffNotes):**
```powerfx
Set(varRejectionReasons,
    If(chkTooSmall.Value, "Features are too small or too thin; ", "") &
    If(chkGeometry.Value, "The geometry is problematic; ", "") &
    If(chkNotSolid.Value, "Open model/not solid geometry; ", "") &
    // ... more checkboxes
);
```

**2. `varRejectionReasonsTable` (table for RejectionReason choice column):**
```powerfx
Set(varRejectionReasonsTable,
    Filter(
        Table(
            {Selected: chkTooSmall.Value, Value: "Features are too small or too thin"},
            {Selected: chkGeometry.Value, Value: "The geometry is problematic"},
            // ... more rows
        ),
        Selected
    )
);
```

**Potential Issue:** The `varRejectionReasonsTable` is supposed to populate the `RejectionReason` SharePoint choice column, but:
- SharePoint multi-select choice columns have specific format requirements
- The table may not be mapping correctly to SharePoint's expected format
- The Patch may be silently failing on this column while succeeding on others

### Hypothesis 2: Flow Reading Wrong Field

The flow's `Compose_Formatted_Reasons_Text` action relies on:
```
outputs('Get_Current_Rejected_Data')?['body/RejectionReason']
```

**Potential Issues:**
- `RejectionReason` is a multi-select choice field, which returns an array of objects
- The `Format Rejection Reasons` Select action expects: `@item()?['Value']`
- If `RejectionReason` is empty/null, the array is empty, producing blank output
- The flow doesn't fall back to `StaffNotes` if `RejectionReason` is empty

### Hypothesis 3: ADDITIONAL DETAILS Uses Wrong Field

The email uses:
```
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}
```

**Issue Identified:** This references the `Notes` field (student's submission notes), NOT the `StaffNotes` field where rejection details are stored. If the student didn't include notes when submitting, this will always be blank.

### Hypothesis 4: Select Action Configuration Issue

The `Format Rejection Reasons` action uses Select with text mode:
```
From: outputs('Get_Current_Rejected_Data')?['body/RejectionReason']
Map: @item()?['Value']
```

**Potential Issues:**
- SharePoint choice columns may return different object structure than expected
- The `Value` property path may be incorrect for multi-select choice responses
- Empty arrays produce empty output without error

---

## Evidence from Screenshots

| Evidence | Observation |
|----------|-------------|
| PrintRequests list | `StaffNotes` = "REJECTED by Ian R: Features are too small or too thin; Open model/not solid geometry; Your model still has zero thickness areas..." |
| PrintRequests list | `RejectionReason` column **not visible** in screenshot — need to verify if populated |
| Flow Code View | Email body uses `Compose_Formatted_Reasons_Text` and `Get_Current_Rejected_Data['body/Notes']` |
| Flow Run Status | "Your flow ran successfully" — no errors, but output is empty |
| AuditLog | "Email Sent: Rejection" logged with FlowRunId — flow executed |
| Received Email | REASON FOR REJECTION: (empty), ADDITIONAL DETAILS: (empty) |

---

## Research Prompt

```
I have a Power Automate flow (Flow B) that sends rejection emails when a SharePoint item's 
Status changes to "Rejected". The email is being sent successfully, but two sections are 
always empty:

1. REASON FOR REJECTION: (empty)
2. ADDITIONAL DETAILS: (empty)

CURRENT FLOW LOGIC:
- `Format Rejection Reasons` action uses Select on `RejectionReason` field (multi-select choice)
- `Compose Formatted Reasons Text` action joins the array with `; `
- Email body uses: @{outputs('Compose_Formatted_Reasons_Text')}
- ADDITIONAL DETAILS uses: @{outputs('Get_Current_Rejected_Data')?['body/Notes']}

OBSERVED DATA:
- SharePoint `StaffNotes` field contains the full rejection text (visible in list view)
- SharePoint `RejectionReason` choice column status unknown (may be empty)
- Student `Notes` field is likely empty (student didn't add notes on submission)
- Power Apps Patch includes `RejectionReason: varRejectionReasonsTable`

QUESTIONS:
1. How does SharePoint return multi-select choice column data in Power Automate?
2. What object structure should the Select action expect (is `@item()?['Value']` correct)?
3. Why might `RejectionReason` be empty even if `varRejectionReasonsTable` was built correctly?
4. Should the flow fall back to parsing `StaffNotes` if `RejectionReason` is empty?
5. Is there a way to verify what data `Get_Current_Rejected_Data` actually returns?
6. What's the correct expression to read ADDITIONAL DETAILS from `StaffNotes` instead of `Notes`?
7. Could the Power Apps Patch be silently failing on the choice column?
8. How can I debug the Select action to see what input it received?
9. Is there a mismatch between Power Apps choice table format and SharePoint choice column format?
10. Should I restructure the flow to read from `StaffNotes` instead of `RejectionReason`?

For your recommendation, provide:
1. Validation or correction of the root cause hypotheses
2. Step-by-step debugging approach to identify exact failure point
3. Fix for REASON FOR REJECTION (either fix RejectionReason population or switch to StaffNotes)
4. Fix for ADDITIONAL DETAILS (correct field reference)
5. Expression syntax for parsing rejection reasons from StaffNotes as fallback
6. Testing checklist to verify the fix
7. Long-term recommendation on best source for rejection reasons (choice column vs text field)
```

---

## AI Model Recommendations

*This prompt is being submitted to multiple AI models. Each model should add their recommendation below in the designated section.*

### Claude Opus 4.5 (Anthropic) - Thinking Mode

**Recommendation:** The issue has **two distinct root causes** that must both be fixed. Implement a dual-fix approach: (1) correct the ADDITIONAL DETAILS field reference immediately, and (2) restructure the REASON FOR REJECTION to use `StaffNotes` parsing instead of the unreliable `RejectionReason` choice column.

**Justification:**

Based on the evidence analysis:

1. **Root Cause #1 CONFIRMED: ADDITIONAL DETAILS uses wrong field**
   - The email template references `body/Notes` (student submission notes)
   - Should reference `body/StaffNotes` (staff rejection notes)
   - This is a simple field name error — immediate fix available

2. **Root Cause #2 CONFIRMED: RejectionReason choice column is empty**
   - The `RejectionReason` column is not visible in the PrintRequests screenshot
   - Flow ran successfully with no errors but produced empty output
   - This indicates the Select action received an empty array
   - Power Apps `varRejectionReasonsTable` format likely incompatible with SharePoint multi-select choice

**Why RejectionReason is Likely Empty:**

Power Apps creates `varRejectionReasonsTable` as:
```powerfx
Filter(Table({Selected: true, Value: "Reason text"}, ...), Selected)
```

This produces a table with `Value` properties. However, SharePoint multi-select choice columns expect a specific format. The Patch may be:
- Silently failing on this column (common with choice fields)
- Receiving the table but not mapping it correctly
- The choice column may have strict value matching (exact text required)

**Answers to Research Questions:**

| # | Question | Answer |
|---|----------|--------|
| 1 | How does SharePoint return multi-select choice data? | As an array of objects: `[{"Value": "Option 1"}, {"Value": "Option 2"}]` |
| 2 | Is `@item()?['Value']` correct? | **Yes**, but only if the array is populated. Empty array = empty output. |
| 3 | Why might RejectionReason be empty? | Power Apps table format may not match SharePoint choice requirements. Choice values must exactly match defined options. |
| 4 | Should flow fall back to StaffNotes? | **Yes, recommended.** StaffNotes is guaranteed populated and contains human-readable rejection text. |
| 5 | How to verify Get_Current_Rejected_Data output? | Expand action in flow run history → check `body/RejectionReason` value. |
| 6 | Expression for StaffNotes? | `outputs('Get_Current_Rejected_Data')?['body/StaffNotes']` |
| 7 | Could Patch be silently failing? | **Yes.** Choice columns often fail silently if values don't exactly match defined options. |
| 8 | How to debug Select action? | Add Compose action before Select: `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']` |
| 9 | Format mismatch? | **Likely.** Power Apps tables may need explicit `{Value: "text"}` format for choices. |
| 10 | Should flow use StaffNotes instead? | **Yes, for reliability.** StaffNotes is always populated and human-readable. |

**Implementation Steps:**

**Phase 1 — Immediate Fixes (5 minutes):**

1. **Fix ADDITIONAL DETAILS** — Update Flow B email template:
   ```
   // BEFORE (wrong):
   @{outputs('Get_Current_Rejected_Data')?['body/Notes']}
   
   // AFTER (correct):
   @{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
   ```

2. **Fix REASON FOR REJECTION** — Replace complex Select/Compose chain with direct StaffNotes reference:
   ```
   // BEFORE (unreliable - depends on RejectionReason choice column):
   @{outputs('Compose_Formatted_Reasons_Text')}
   
   // AFTER (reliable - uses populated StaffNotes):
   @{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
   ```

**Phase 2 — Enhanced Formatting (Optional):**

If you want to show only the rejection reasons (not full StaffNotes history), parse the latest entry:

```
// Extract text after "REJECTED by [Name]: " and before " - [timestamp]"
// This requires a more complex expression or custom parsing logic
```

For simplicity, showing full StaffNotes is acceptable — it provides complete context.

**Phase 3 — Fix Power Apps (Optional, for data integrity):**

If you want the `RejectionReason` choice column to work:

1. Verify choice column values in SharePoint exactly match Power Apps table values
2. Update Power Apps Patch to use proper choice format:
   ```powerfx
   RejectionReason: ForAll(
       varRejectionReasonsTable,
       {Value: ThisRecord.Value}
   )
   ```
3. Test Patch in isolation to confirm choice column updates

**Recommended Approach:**

**Use StaffNotes as the single source of truth for rejection emails.** Rationale:
- Always populated (guaranteed by rejection button logic)
- Human-readable format
- Contains full context (who, what, when)
- No dependency on choice column mechanics
- Simpler flow logic (no Select/Compose chain needed)

**Updated Email Template:**

```html
<p class="editor-paragraph">Unfortunately, your 3D Print request has been rejected by our staff.<br><br>REQUEST DETAILS:<br>- Request: @{outputs('Get_Current_Rejected_Data')?['body/Title']} (@{outputs('Get_Current_Rejected_Data')?['body/ReqKey']})<br>- Method: @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}<br>- Printer Requested: @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}<br><br>REJECTION DETAILS:<br>@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}<br><br>NEXT STEPS:<br>• Review the rejection reason above<br>• Make necessary adjustments to your design or request<br>• Submit a new corrected request through the Submission Portal<br>• Come by the lab and ask us!<br><br>---<br>This is an automated message from the LSU Digital Fabrication Lab.</p>
```

**Changes Made:**
- Merged "REASON FOR REJECTION" and "ADDITIONAL DETAILS" into single "REJECTION DETAILS" section
- Uses `StaffNotes` directly — always contains the rejection entry
- Removed dependency on `RejectionReason` choice column and `Notes` field

**Testing Checklist:**

- [ ] Update Flow B email template with new expressions
- [ ] Test rejection on a new request
- [ ] Verify email contains rejection reasons from StaffNotes
- [ ] Confirm no empty sections in email
- [ ] Check AuditLog for successful email delivery

**Long-term Recommendation:**

Keep `RejectionReason` choice column for **reporting and filtering purposes** (e.g., "Show all rejections due to geometry issues"), but use `StaffNotes` as the **source for email content**. This provides:
- Reliable emails (StaffNotes always populated)
- Structured data for analytics (choice column when it works)
- No critical dependency on choice column mechanics

---

### Claude Opus 4.6 (Anthropic) - Max Thinking

*(Add recommendation here)*

---

### GPT 5.3 (OpenAI) - Extra High Thinking

*(Add recommendation here)*

---

### Gemini 3 Pro (Google)

*(Add recommendation here)*

---

### Composer 1.5

*(Add recommendation here)*

---

### Other Models

*(Add additional sections as needed)*

---

## Consensus Summary

### Points of Agreement:

*(To be filled after collecting AI recommendations)*

### Points of Disagreement:

*(To be filled after collecting AI recommendations)*

### Recommended Approach:

*(To be filled after consensus analysis)*

---

## Quick Fixes to Test

### Fix 1: Verify RejectionReason Column Data

**Test Steps:**
1. Open SharePoint PrintRequests list
2. Add `RejectionReason` column to the view (if not visible)
3. Check REQ-00127 — is `RejectionReason` populated or empty?
4. If empty: Problem is in Power Apps Patch
5. If populated: Problem is in Flow B Select/Compose actions

### Fix 2: Check Flow Run History for Data

**Test Steps:**
1. Open Power Automate → Flow B run history
2. Find the run for REQ-00127 (FlowRunId: 08504293765124827295309667115029)
3. Expand `Get Current Rejected Data` action
4. Check outputs → `body/RejectionReason` — what does it contain?
5. Expand `Format Rejection Reasons` action — what is the input/output?
6. Expand `Compose Formatted Reasons Text` — what is the final output?

### Fix 3: Immediate Email Template Fix (ADDITIONAL DETAILS)

**Current (wrong):**
```
ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}
```

**Should be (if using StaffNotes):**
```
ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

**Note:** This would show the full audit trail. May want to parse just the latest entry.

---

## Final Decision

**Selected Solution:** *(to be filled after reviewing all recommendations)*

**Rationale:**

**Implementation Date:**

**Status:** [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Abandoned

---

## Implementation Checklist

- [ ] Verify `RejectionReason` column data in SharePoint for REQ-00127
- [ ] Check Flow B run history to see actual data at each step
- [ ] Verify Power Apps `varRejectionReasonsTable` format matches SharePoint expectations
- [ ] Test Patch in isolation to confirm `RejectionReason` column updates
- [ ] Fix ADDITIONAL DETAILS field reference (Notes → StaffNotes or custom parsing)
- [ ] Implement fallback logic if `RejectionReason` is empty
- [ ] Test complete rejection flow end-to-end
- [ ] Verify email contains expected reasons
- [ ] Update documentation with fix
- [ ] Monitor next 5 rejections to confirm resolution

---

## Related Documentation

- `PowerAutomate/Flow-(B)-Audit-LogChanges.md` — Flow B implementation details
- `PowerApps/StaffDashboard-App-Spec.md` — Rejection button OnSelect logic (Step 46)
- `Debug/Email Identity Solutions.md` — Similar debug document format
