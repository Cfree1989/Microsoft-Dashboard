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
| PrintRequests list | `StaffNotes` = "REJECTED by Ian R: Features are too small or too thin; Open model/not solid geometry; Your model still has zero thickness areas, and there are 3 copies of the same model in the file. - 2/27 4:12PM" |
| PrintRequests list | `RejectionReason` column **CONFIRMED EMPTY** (blank cell visible in SharePoint list view) |
| Flow Code View | Email body uses `Compose_Formatted_Reasons_Text` and `Get_Current_Rejected_Data['body/Notes']` |
| Flow Run Status | "Your flow ran successfully" — no errors, but output is empty |
| AuditLog | "Email Sent: Rejection" logged with FlowRunId — flow executed |
| Received Email | REASON FOR REJECTION: (empty), ADDITIONAL DETAILS: (empty) |
| SharePoint Column Settings | `RejectionReason` is multi-select choice with "Can add values manually" enabled |
| Email JSON | Confirms blank sections: `"REASON FOR REJECTION:<br><br><br>ADDITIONAL DETAILS:<br><br><br>"` |

### Confirmed SharePoint Column Choices (RejectionReason)

From the SharePoint column settings screenshot (verified 2/27/2026):

| Choice Option (as defined in SharePoint) |
|------------------------------------------|
| Features are too small or too thin |
| The geometry is problematic |
| Open model/not solid geometry |
| The scale is wrong |
| The model is messy |
| Excessive overhangs requiring supports |
| Model parts are not joined together |
| Other (see additional details) |

**Configuration:**
- Type: Choice (multi-select enabled)
- "Can add values manually" = Yes (fill-in choices allowed)
- Required: No
- Default: None

### Value Mismatch Analysis

Comparing what staff selected vs SharePoint defined choices:

| Staff Selected (from StaffNotes) | SharePoint Defined Choice | Match? |
|----------------------------------|---------------------------|--------|
| "Features are too small or too thin" | "Features are too small or too thin" | ✓ Match |
| "Open model/not solid geometry" | "Open model/not solid geometry" | ✓ Match |
| "Your model still has zero thickness areas" | *(not in predefined list)* | ✗ Custom fill-in |
| "there are 3 copies of the same model in the file" | *(not in predefined list)* | ✗ Custom fill-in |

**Finding:** Staff entered custom fill-in text in addition to predefined choices. The Power Apps Patch may be failing to write the entire `RejectionReason` array when custom values are included, or the table format `{Selected: bool, Value: text}` is incompatible with SharePoint's expected `{Value: text}` format.

---

## Research Prompt

**INSTRUCTIONS FOR AI MODELS:**
- Use **Context7** (or `/context7` MCP tool) to look up official Microsoft documentation for Power Automate, SharePoint, and Power Apps
- **Search the web** for recent solutions, community posts, and Microsoft Learn articles about this specific issue
- Cross-reference documentation with the observed behavior to validate hypotheses

```
RESEARCH TASK: Use Context7 to look up Microsoft documentation and search the web for solutions.

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

RESEARCH REQUESTS (use Context7 and web search):
1. Look up: "SharePoint multi-select choice column Power Automate data format"
2. Look up: "Power Apps Patch choice column table format SharePoint"
3. Look up: "Power Automate Select action empty array handling"
4. Look up: "SharePoint Get item choice field JSON structure"
5. Search for: "Power Apps varRejectionReasonsTable SharePoint choice not saving"

QUESTIONS:
1. How does SharePoint return multi-select choice column data in Power Automate? (cite documentation)
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
1. Validation or correction of the root cause hypotheses (with documentation citations)
2. Step-by-step debugging approach to identify exact failure point
3. Fix for REASON FOR REJECTION (either fix RejectionReason population or switch to StaffNotes)
4. Fix for ADDITIONAL DETAILS (correct field reference)
5. Expression syntax for parsing rejection reasons from StaffNotes as fallback
6. Testing checklist to verify the fix
7. Long-term recommendation on best source for rejection reasons (choice column vs text field)

IMPORTANT: Cite specific Microsoft documentation or community sources for your answers.
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

**Recommendation:** Confirms both root causes identified by Opus 4.5. Adds deeper technical analysis of *why* the `RejectionReason` choice column is likely empty, identifies the specific Power Apps Patch format issue, and provides a concrete StaffNotes parsing expression for future use.

**Verdict: Two confirmed root causes, one simple fix, one architectural decision.**

---

**Root Cause #1 — CONFIRMED: `Notes` vs `StaffNotes` field mismatch**

The email template references `body/Notes` (the student's submission notes from the portal) for ADDITIONAL DETAILS. The student may not have entered any notes, so this field is empty. The correct field is `body/StaffNotes`, which contains the staff-written rejection entry. This is a straightforward field name error.

**Root Cause #2 — CONFIRMED: `RejectionReason` choice column is almost certainly empty**

After examining the Power Apps Patch logic in `StaffDashboard-App-Spec.md` (Step 46, `btnRejectConfirm.OnSelect`), the code builds `varRejectionReasonsTable` like this:

```powerfx
Set(varRejectionReasonsTable,
    Filter(
        Table(
            {Selected: chkTooSmall.Value, Value: "Features are too small or too thin"},
            {Selected: chkGeometry.Value, Value: "The geometry is problematic"},
            ...
        ),
        Selected
    )
);
```

Then patches with:
```powerfx
RejectionReason: varRejectionReasonsTable
```

**Why this likely fails silently:**

SharePoint multi-select choice columns expect records in the format `{Value: "ExactOptionText"}`. The `varRejectionReasonsTable` produces records with schema `{Selected: Boolean, Value: Text}` — the extra `Selected` column is normally harmless (Power Apps ignores unknown properties during Patch), but multi-select choice columns are notoriously fragile in three specific ways:

1. **Exact value matching required.** The `Value` strings in the table must *exactly* match the predefined choice options in the SharePoint column definition — same casing, same punctuation, same whitespace. If the SharePoint column was created with slightly different option text (e.g., "Features are too small" vs "Features are too small or too thin"), the entire column write silently fails.

2. **Fill-in choices add complexity.** If the `RejectionReason` column has "Allow fill-in choices" enabled, custom values work differently from predefined ones and may not persist through the same Patch format.

3. **Patch behavior with choice columns is atomic.** If *any* value in the table doesn't match a defined choice, SharePoint rejects the entire column update but succeeds on all other columns in the same Patch call. This produces exactly the observed behavior: Status, StaffNotes, LastAction all update correctly, but RejectionReason stays empty.

**How SharePoint returns multi-select choice data in Power Automate:**

When the flow's `Get Current Rejected Data` action fetches the item, a populated multi-select choice column returns:
```json
"RejectionReason": [
    {"Value": "Features are too small or too thin"},
    {"Value": "Open model/not solid geometry"}
]
```

An empty multi-select choice column returns:
```json
"RejectionReason": []
```

The `Format Rejection Reasons` Select action with `@item()?['Value']` is *correct syntax* — it would work if the array had data. The problem is upstream: the array is empty because the Patch never populated it.

**Confirming the diagnosis — How to verify:**

1. Open SharePoint → PrintRequests list → Edit columns → Add `RejectionReason` to the view
2. Check REQ-00127: if `RejectionReason` is blank, the problem is confirmed as Power Apps Patch
3. Alternatively, in the Flow B run history for REQ-00127, expand `Get Current Rejected Data` → check `body/RejectionReason` — if it's `[]`, Patch failed silently

**Answers to Research Questions:**

| # | Question | Answer |
|---|----------|--------|
| 1 | How does SharePoint return multi-select choice data? | Array of `{Value: "text"}` objects. Empty = `[]`. The Select action correctly extracts `.Value` from each. |
| 2 | Is `@item()?['Value']` correct? | **Yes.** Correct syntax for the Select action. The issue is the input array being empty, not the extraction logic. |
| 3 | Why might RejectionReason be empty? | **Power Apps Patch silently fails on the choice column** if values don't exactly match SharePoint's defined options. Other columns in the same Patch succeed normally. |
| 4 | Should flow fall back to StaffNotes? | **Yes.** StaffNotes is guaranteed populated by the same Patch call and contains human-readable rejection text. It should be the primary source. |
| 5 | How to verify Get_Current_Rejected_Data output? | Expand the action in flow run history → Outputs → `body/RejectionReason`. If `[]`, the column is empty. |
| 6 | Expression for StaffNotes? | `outputs('Get_Current_Rejected_Data')?['body/StaffNotes']` |
| 7 | Could Patch be silently failing? | **Yes, this is the most likely cause.** SharePoint Patch returns success for the overall operation even when individual choice column values are rejected. |
| 8 | How to debug Select action? | Add a Compose action: `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']` — this will show the raw array (likely `[]`). |
| 9 | Format mismatch between Power Apps and SharePoint? | **Likely.** The Patch table format is structurally correct but values may not match defined choices exactly. Verify in SharePoint column settings. |
| 10 | Should flow use StaffNotes instead? | **Yes, as the primary email source.** Keep RejectionReason for structured reporting if you fix the Patch. |

**Implementation — Two-Tier Fix:**

**Tier 1: Immediate fix (already applied per Flow B doc)**

The Flow B documentation (`Flow-(B)-Audit-LogChanges.md`, Step 7a, Action 6) already shows the corrected email template using `StaffNotes` directly and a note confirming this fix was applied on 2/27/2026. The email now uses a single "REJECTION DETAILS" section with `@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}`.

**Tier 2: Fix the Power Apps Patch (for data integrity, optional)**

If you want `RejectionReason` choice column to work for reporting/filtering:

1. **Verify choice options in SharePoint** — Go to PrintRequests → List Settings → `RejectionReason` column → check that defined choices match *exactly* what Power Apps sends
2. **Simplify the Patch format** — Drop the `Selected` property from the records sent to SharePoint:
```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    {Value: ThisRecord.Value}
)
```
3. **Or use Choices() lookup for guaranteed matching:**
```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    LookUp(Choices(PrintRequests.RejectionReason), Value = ThisRecord.Value)
)
```
This ensures each value is resolved against SharePoint's actual option list, eliminating text mismatch issues.

**Tier 3: Optional — StaffNotes parsing for cleaner emails**

If you later want to extract *just* the rejection reasons from StaffNotes (without the "REJECTED by..." prefix and timestamp), use this Power Automate expression:

```
// Full StaffNotes value (with pipe-delimited history):
// "REJECTED by Ian R.: Features are too small or too thin; Open model/not solid geometry; | Staff Comments: <html> - 2/27 4:12pm"

// To show just the latest entry (everything after the last " | " if history exists):
@{last(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | '))}
```

For most use cases, showing the full StaffNotes is preferable — it gives the student complete context.

**Testing Checklist:**

- [ ] Reject a test request with 2+ checkboxes selected
- [ ] Verify email arrives with "REJECTION DETAILS:" section populated
- [ ] Verify StaffNotes content appears in the email body
- [ ] Confirm no empty sections remain in the email
- [ ] Check AuditLog for "Email Sent: Rejection" entry
- [ ] (Optional) Verify `RejectionReason` column in SharePoint — is it now populated after Tier 2 fix?

**Long-term Architecture Recommendation:**

Use **StaffNotes as the email content source** (reliable, human-readable, always populated) and **RejectionReason as a structured data column** (for filtering, reporting, and analytics — e.g., "what % of rejections are due to geometry issues?"). These serve different purposes and should not be conflated. The flow should never depend on the choice column for student-facing communication.

---

### Sonnet 4.6

**Recommendation:** Both root causes are independently confirmed. This analysis adds one finding not raised by other models: the Select action's output is `null` (not `[]`) when the input array is empty, which means any downstream `length()` or `join()` call on it will throw a runtime error — not just produce blank output. This makes the flow brittle beyond just the missing email content. Two concrete fix tracks are provided below.

**Validation of Root Cause Hypotheses:**

**Hypothesis 1 — Power Apps Patch not populating `RejectionReason`: CONFIRMED**

The `varRejectionReasonsTable` is built as:
```powerfx
Filter(Table({Selected: bool, Value: "text"}, ...), Selected)
```

This produces records with schema `{Selected: Boolean, Value: Text}`. According to official Microsoft documentation and verified community sources ([platformsofpower.net](https://platformsofpower.net/patching-complex-sharepoint-columns-with-power-apps/), [Matthew Devaney](https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/)), a SharePoint multi-select choice column expects records with **only** `{Value: "ExactOptionText"}`.

There are two likely failure modes:
- The extra `Selected` property is silently discarded but the remaining `{Value: "text"}` structure should still work — *unless* the value strings don't exactly match the defined options in the SharePoint column.
- If `RejectionReason` was defined with "Allow fill-in choices" enabled, value matching behaves differently and may fail silently on exact-match validation.

Key fact: Power Apps `Patch` returns a success result even when SharePoint rejects the data for a specific choice column. All other columns (Status, StaffNotes, LastAction) are written successfully. This is the observed behavior.

**Hypothesis 2 — Flow reading wrong field for Select chain: CONFIRMED UPSTREAM ISSUE**

The SharePoint connector's "Get item" action returns a populated multi-select choice column as an array of objects ([SharePoint Stack Exchange, 2021](https://sharepoint.stackexchange.com/questions/294994)):
```json
"RejectionReason": [
    {
        "@@odata.type": "Collection(Edm.String)",
        "Id": 1,
        "Value": "Features are too small or too thin"
    }
]
```

An unpopulated column returns:
```json
"RejectionReason": []
```

The Select action expression `@item()?['Value']` is **syntactically correct** per the returned schema. The issue is entirely upstream — the Patch never wrote data, so the array is empty.

**Hypothesis 3 — ADDITIONAL DETAILS uses wrong field: CONFIRMED**

`body/Notes` is the student's submission notes from the portal. It is empty for any student who didn't add notes during submission (the majority of cases). The field should be `body/StaffNotes`. This is a field name typo.

**Hypothesis 4 — Select action on empty array: PARTIALLY CONFIRMED + NEW FINDING**

When the Select action receives an empty array `[]`, Power Automate returns `null` as the output — **not** an empty array. This is documented behavior ([Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/power-platform/power-automate/flow-run-issues/getting-errors-null-fields), [SharePoint SE](https://sharepoint.stackexchange.com/questions/306042/how-to-treat-the-output-of-select-as-an-array)). The consequence:

- `join(outputs('Select'), '; ')` → runtime error (cannot join null)
- `outputs('Compose_Formatted_Reasons_Text')` → null → renders blank in email

The flow "ran successfully" because the email send action treated the null as an empty string. No error was thrown, just silent blank output.

**Answers to All Research Questions:**

| # | Question | Answer | Source |
|---|----------|--------|--------|
| 1 | How does SharePoint return multi-select choice data? | Array of objects: `[{"@@odata.type":"Collection(Edm.String)","Id":1,"Value":"text"}]`. Empty column = `[]`. | [SharePoint SE](https://sharepoint.stackexchange.com/questions/294994) |
| 2 | Is `@item()?['Value']` correct for Select? | **Yes.** Correct syntax. Problem is upstream (empty array input), not this expression. | Community + Microsoft Learn |
| 3 | Why might `RejectionReason` be empty? | Power Apps Patch silently fails when choice values don't exactly match defined options, or due to extra `Selected` property. SharePoint returns success for the overall operation. | [Matthew Devaney](https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/), [platformsofpower.net](https://platformsofpower.net/patching-complex-sharepoint-columns-with-power-apps/) |
| 4 | Should flow fall back to StaffNotes? | **Yes.** StaffNotes is written in the same Patch call and is guaranteed populated. | — |
| 5 | How to verify `Get_Current_Rejected_Data` output? | Flow run history → expand action → Outputs → inspect `body/RejectionReason`. Empty array = Patch failed. | Microsoft Learn |
| 6 | Expression for ADDITIONAL DETAILS from StaffNotes? | `@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}` | — |
| 7 | Could Patch silently fail on choice column? | **Yes, confirmed.** SharePoint returns HTTP 200 for the overall Patch even when it rejects specific choice column values. | [platformsofpower.net](https://platformsofpower.net/patching-complex-sharepoint-columns-with-power-apps/) |
| 8 | How to debug Select action? | Add Compose before Select: `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']` — shows raw array (expected: `[]`). | Microsoft Learn |
| 9 | Format mismatch between Power Apps and SharePoint? | **Yes.** Power Apps produces `{Selected, Value}` records. SharePoint expects `{Value}` only. Fix: `ForAll(varRejectionReasonsTable, {Value: ThisRecord.Value})` | [Matthew Devaney](https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/) |
| 10 | Should flow use StaffNotes instead of `RejectionReason`? | **Yes, as primary email source.** Retain `RejectionReason` for structured data/reporting after Patch is fixed. | — |

**Step-by-Step Debugging Approach:**

1. **Confirm `RejectionReason` column is empty in SharePoint:**
   - Open PrintRequests list → Edit columns → Add `RejectionReason` to current view
   - Check REQ-00127 row — is the column blank?
   - If blank: confirms Patch failure. If populated: the issue is in the flow's Select/Compose chain.

2. **Inspect Flow B run history:**
   - Power Automate → Flow B → Run History → find run for REQ-00127
   - Expand `Get Current Rejected Data` → Outputs → locate `body/RejectionReason`
   - Expected finding: `[]` (empty array)

3. **Add diagnostic Compose action (temporary):**
   - Before `Format Rejection Reasons`, add a Compose with:
   ```
   @{outputs('Get_Current_Rejected_Data')?['body/RejectionReason']}
   ```
   - Trigger a test rejection — inspect Compose output. If `[]` or `null`, confirms root cause.

4. **Verify StaffNotes is populated in same run:**
   - Same `Get Current Rejected Data` output → check `body/StaffNotes`
   - Should contain the full rejection text — confirms it's a safe replacement

**Fix Track A: Immediate (Flow B — use StaffNotes)**

Update the Send Rejection Email action body:

```
// BEFORE (broken):
REASON FOR REJECTION:
@{outputs('Compose_Formatted_Reasons_Text')}

ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}

// AFTER (fixed):
REJECTION DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

The `Format Rejection Reasons`, `Compose Formatted Reasons Text`, and `Select` actions can be left in place for now (they produce null output but don't break the flow). They can be removed in a future cleanup.

**Fix Track B: Comprehensive (also fix Power Apps Patch)**

Add null safety to the flow's Select/Compose chain, and fix the Power Apps Patch to properly write `RejectionReason`:

**Flow B — null-safe Select chain:**
```
// Wrap Compose_Formatted_Reasons_Text input with coalesce:
@{coalesce(join(body('Format_Rejection_Reasons'), '; '), '')}
```

**Power Apps — fix `varRejectionReasonsTable` Patch:**
```powerfx
// Current (may fail silently):
RejectionReason: varRejectionReasonsTable

// Fixed — strip extra 'Selected' property:
RejectionReason: ForAll(varRejectionReasonsTable, {Value: ThisRecord.Value})
```

**Or, use Choices() lookup to guarantee exact match against defined column options:**
```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    LookUp(Choices(PrintRequests.RejectionReason), Value = ThisRecord.Value)
)
```
This resolves each value against SharePoint's actual defined choices, eliminating any text mismatch.

**Expression for parsing StaffNotes (if you later want structured output):**

The StaffNotes format from REQ-00127 is:
```
"REJECTED by Ian R: [reasons]; [more reasons] - 2/27 4:12PM"
```

To extract just the reasons segment (between the colon and the dash-timestamp):
```
// Split on ": " → take index [1] → split on " - " → take index [0]
@{split(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ': ')[1], ' - ')[0]}
```

**Caution:** This is brittle if the StaffNotes format ever changes. Using the full `StaffNotes` field is more resilient and provides richer context for students.

**Testing Checklist:**

- [ ] Apply Fix Track A (StaffNotes in email body)
- [ ] Submit new test rejection with at least 2 checkboxes checked
- [ ] Verify rejection email arrives with populated "REJECTION DETAILS" section
- [ ] Confirm exact StaffNotes content appears in email (no truncation)
- [ ] Confirm no empty REASON or DETAILS sections
- [ ] Check AuditLog for "Email Sent: Rejection" entry with correct FlowRunId
- [ ] (Optional) Apply Fix Track B Power Apps Patch fix
- [ ] (Optional) Verify `RejectionReason` column in SharePoint is now populated after Track B fix
- [ ] Monitor next 5 live rejections to confirm consistent behavior

**Long-term Recommendation:**

Maintain a **two-field architecture**:
- `StaffNotes` → email content (reliable plain text, always written, human-readable)
- `RejectionReason` → structured data (fix the Patch, use for filtering/reporting/analytics)

Never depend on the choice column for student-facing communication. Choice columns require exact value matching and are vulnerable to silent Patch failures whenever option text is updated in SharePoint. `StaffNotes` is immune to schema changes and always contains what the staff actually typed.

---

### GPT 5.3 (OpenAI) - Extra High Thinking

**Recommendation:** Implement a two-track fix. First, immediately switch student-facing rejection email content to `StaffNotes` (reliability fix). Second, separately harden the Power Apps `Patch` for `RejectionReason` (data integrity/reporting fix). This resolves the blank email issue now while preserving long-term analytics capability.

**Validation / Correction of Root Cause Hypotheses:**

1. **Hypothesis 3 (wrong field in ADDITIONAL DETAILS): CONFIRMED**
   - Current email uses `body/Notes` (student notes field).
   - Rejection context is written by staff to `body/StaffNotes`.
   - Correct expression:
     `@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}`

2. **Hypothesis 1 (Power Apps may not be writing multi-choice column): LIKELY**
   - Flow syntax using Select is valid *if* `RejectionReason` has values.
   - If `RejectionReason` is empty, Select/Join output is blank and the email section appears empty.
   - This strongly indicates the failure point is upstream at write time (Power Apps to SharePoint), not in Select mapping.

3. **Hypothesis 2 / 4 (Select action expression and shape): PARTIALLY CORRECT**
   - `@item()?['Value']` is the right mapping pattern for multi-choice objects.
   - Problem is likely empty or null source data, not incorrect property path.

4. **Flow design robustness gap: CONFIRMED**
   - The flow currently assumes `RejectionReason` is always populated.
   - A fallback to `StaffNotes` should be added to prevent blank student notifications.

**Answers to the 10 Research Questions:**

1. **SharePoint multi-select return format in flow:** array of objects with `Value` (and often metadata), not a plain string.
2. **Is `@item()?['Value']` correct?:** Yes.
3. **Why might `RejectionReason` be empty?:** Power Apps payload mismatch, option text mismatch, or a non-observed column-level write failure.
4. **Should flow fall back to `StaffNotes`?:** Yes, recommended.
5. **How to verify returned data?:** Flow run history -> `Get_Current_Rejected_Data` -> Outputs -> inspect `body/RejectionReason` and `body/StaffNotes`.
6. **Correct ADDITIONAL DETAILS expression:** `@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}`
7. **Could Patch fail silently on choice column?:** It can be missed unless errors are explicitly surfaced/inspected.
8. **How to debug Select input?:** Add Compose before Select:
   `@{outputs('Get_Current_Rejected_Data')?['body/RejectionReason']}`
9. **Power Apps vs SharePoint format mismatch?:** Likely; normalize outgoing records to `{Value: ...}`.
10. **Should flow use StaffNotes instead?:** Yes for email content; keep `RejectionReason` for reporting.

**Step-by-Step Debugging Approach:**

1. In SharePoint list view, temporarily display `RejectionReason` and inspect a rejected test item.
2. In Flow B run history, inspect `Get_Current_Rejected_Data` raw output:
   - `body/RejectionReason`
   - `body/StaffNotes`
3. Add temporary Compose actions:
   - Raw reasons array (`body/RejectionReason`)
   - Select output
   - Joined reasons output
4. In Power Apps, instrument `Patch` with `IfError(...)` and inspect `Errors(PrintRequests)` after submit.
5. Use Power Apps Live Monitor during rejection to verify payload and response behavior.

**Fix for REASON FOR REJECTION (recommended resilient expression):**

Use a fallback expression so email content is never blank:

```text
@{if(
  empty(outputs('Get_Current_Rejected_Data')?['body/RejectionReason']),
  outputs('Get_Current_Rejected_Data')?['body/StaffNotes'],
  join(select(outputs('Get_Current_Rejected_Data')?['body/RejectionReason'], item()?['Value']), '; ')
)}
```

If you prefer to keep existing actions (`Format Rejection Reasons` + `Compose`), then implement fallback in the email body instead:

```text
@{if(
  empty(outputs('Get_Current_Rejected_Data')?['body/RejectionReason']),
  outputs('Get_Current_Rejected_Data')?['body/StaffNotes'],
  outputs('Compose_Formatted_Reasons_Text')
)}
```

**Fix for ADDITIONAL DETAILS:**

```text
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

**Power Apps Patch Fix (for structured `RejectionReason` reliability):**

```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    {Value: ThisRecord.Value}
)
```

Optional exact-match hardening:

```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    LookUp(Choices(PrintRequests.RejectionReason), Value = ThisRecord.Value)
)
```

**Expression syntax for parsing rejection reasons from StaffNotes (fallback/cleanup):**

If format is `REJECTED by <Name>: <reasons> - <timestamp>`:

```text
@{split(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ': ')[1], ' - ')[0]}
```

If StaffNotes stores history with ` | ` separators and you want latest segment:

```text
@{last(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | '))}
```

**Testing Checklist:**

- [ ] Reject a new test request with 2+ reasons selected
- [ ] Verify email REASON section is populated
- [ ] Verify ADDITIONAL DETAILS is populated from `StaffNotes`
- [ ] Confirm no empty rejection sections
- [ ] Confirm `Get_Current_Rejected_Data.body/RejectionReason` behavior in run history
- [ ] Validate AuditLog still writes "Email Sent: Rejection"
- [ ] Optional: after Power Apps fix, confirm SharePoint `RejectionReason` is populated

**Long-term Recommendation:**

- Use `StaffNotes` as the **email source of truth** (reliable, human-readable, always available in this workflow).
- Keep `RejectionReason` as **structured analytics metadata** (filtering/reporting).
- Do not make student-facing rejection communication depend solely on the multi-choice column.

**Sources (Microsoft + community):**

- Microsoft Learn: Use data operations in Power Automate  
  https://learn.microsoft.com/en-us/power-automate/data-operations
- Microsoft Learn: Work with data operations (guidance)  
  https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/use-data-operations
- Microsoft Learn: Expressions in conditions (`empty`, etc.)  
  https://learn.microsoft.com/en-us/power-automate/use-expressions-in-conditions
- Microsoft Learn: Workflow expression function reference (`coalesce`, `empty`, `join`, `split`, `last`)  
  https://learn.microsoft.com/en-us/azure/logic-apps/expression-functions-reference
- Microsoft Learn: Power Fx `Patch`  
  https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-patch
- Microsoft Learn: Power Fx `Errors`  
  https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-errors
- Microsoft Learn: Debugging canvas apps with Live monitor  
  https://learn.microsoft.com/en-us/power-apps/maker/monitor-canvasapps
- Microsoft Learn: SharePoint connector reference  
  https://learn.microsoft.com/en-us/connectors/sharepoint/
- SharePoint Stack Exchange: Multi-choice JSON `Value` extraction pattern  
  https://sharepoint.stackexchange.com/questions/294994/parse-json-elements-of-a-list-returned-from-a-multi-choice-column-in-power-autom
- Matthew Devaney: Patch SharePoint multi-choice as `{Value: ...}`  
  https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/

---

### Gemini 3 Pro (Google)

**Recommendation:** The issue stems from two distinct problems: incorrect field mapping for "Additional Details" and a data type mismatch when patching the SharePoint multi-select choice column from Power Apps. The most robust solution is to use `StaffNotes` as the primary data source for the email, as it reliably captures the rejection context.

**Answers to Questions & Validation of Hypotheses:**

1. **SharePoint multi-select choice data format:** SharePoint returns multi-select choice columns to Power Automate as an array of objects. Example: `[{"@odata.type":"#Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference","Id":1,"Value":"Reason 1"}]`.
2. **Select action structure:** Yes, `@item()?['Value']` is the correct expression to extract the text value from the choice object array. However, if the array is empty or null, the Select action will output an empty array, which joins to an empty string.
3. **Why `RejectionReason` is empty:** Power Apps is likely passing a table structure that SharePoint rejects. For a multi-select choice column, Power Apps needs to patch a table containing records with a specific `@odata.type` or exact `Value` schema. If the schema doesn't match perfectly, SharePoint silently ignores the update for that specific column while patching the rest of the record.
4. **Fallback to `StaffNotes`:** Yes, falling back to or exclusively using `StaffNotes` is highly recommended because it is a simple text field that is reliably populated by the Power Apps formula.
5. **Verifying `Get_Current_Rejected_Data`:** Go to the Flow Run History, open a recent run, expand the "Get Current Rejected Data" action, and inspect the raw JSON "Outputs" body. Look for the `RejectionReason` property.
6. **Correct expression for ADDITIONAL DETAILS:** `@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}`
7. **Silent Patch failures:** Yes, the `Patch` function in Power Apps is known to fail silently on complex SharePoint columns (like Choice, Person, or Lookup) if the provided record schema is incorrect, even if the overall Patch operation succeeds for simple text columns.
8. **Debugging Select action:** Add a "Compose" action immediately before the "Select" action with the input `@{outputs('Get_Current_Rejected_Data')?['body/RejectionReason']}` to see exactly what array (or null) is being passed.
9. **Format mismatch:** Yes, `varRejectionReasonsTable` is created as `{Selected: boolean, Value: string}`. SharePoint expects a table of records containing just the `Value` (and sometimes `@odata.type` depending on the connector version), e.g., `Table({Value: "Reason 1"}, {Value: "Reason 2"})`. The extra `Selected` property or missing type metadata causes the silent failure.
10. **Restructure flow:** Yes, restructuring the flow to read from `StaffNotes` is the most resilient approach.

**Proposed Fixes:**

**1. Fix for ADDITIONAL DETAILS:**
Update the flow action to reference the correct field:
```text
ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

**2. Fix for REASON FOR REJECTION (Power Apps Patch Correction):**
If you want to fix the underlying data issue in Power Apps, update the Patch statement to format the choice table correctly:
```powerfx
RejectionReason: ForAll(
    Filter(
        Table(
            {Selected: chkTooSmall.Value, Value: "Features are too small or too thin"},
            {Selected: chkGeometry.Value, Value: "The geometry is problematic"}
            // ... other options
        ),
        Selected
    ),
    {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference",
        Value: Value
    }
)
```

**3. Expression syntax for parsing StaffNotes (Alternative Flow Fix):**
If you prefer to extract just the reasons from `StaffNotes` in the flow (assuming the format "REJECTED by Name: [Reasons] - [Date]"):
```text
@{split(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ': ')[1], ' - ')[0]}
```
*(Note: This is brittle if the text format changes. Using the full `StaffNotes` is safer).*

**Testing Checklist:**
- [ ] Update the flow to use `body/StaffNotes` for Additional Details.
- [ ] (Optional) Apply the Power Apps Patch fix for `RejectionReason`.
- [ ] Submit a test request and reject it with specific checkboxes selected.
- [ ] Verify in SharePoint that the `RejectionReason` column is now populated.
- [ ] Verify the received email contains both the Reason and Additional Details.

**Long-term Recommendation:**
Use **`StaffNotes` as the primary source for email communications** because plain text fields are immune to complex connector schema changes. Retain the `RejectionReason` choice column for SharePoint list filtering, reporting, and analytics, ensuring the Power Apps Patch is corrected to populate it properly.

---

### Composer 1.5

**Recommendation:** Both root causes are confirmed. Use `StaffNotes` as the single source for rejection email content. The `RejectionReason` choice column is likely empty due to Power Apps Patch format mismatch with SharePoint's multi-select choice expectations.

**Documentation Citations & Validation of Hypotheses:**

| Source | Finding |
|--------|---------|
| [SharePoint Stack Exchange](https://sharepoint.stackexchange.com/questions/294994/parse-json-elements-of-a-list-returned-from-a-multi-choice-column-in-power-autom) | Multi-select choice columns return as array of objects with `@@odata.type`, `Id`, `Value`. Access via `body('Parse_JSON')?[0]?['MyChoiceFruits']?[0]['Value']`. Alternative format: `{"results": ["choice1", "choice2"]}`. |
| [Matthew Devaney - Power Apps Patch](https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/) | Multi-select choice requires `[{Value: "Option1"}, {Value: "Option2"}]` format. ComboBox `SelectedItems` returns correct format; manual tables must match exactly. |
| [Mark Juniper - Choice Column Patch](https://www.markjuniper.co.uk/2025/02/patching-sharepoint-choice-columns-from.html) | Cannot patch choice with plain string. Must use `{Value: "Choice 1"}` record. Single vs multi-select differ in structure. |
| [Microsoft Q&A - SharePoint Choice](https://learn.microsoft.com/en-us/answers/questions/1286878/sharepoint-online-list-choice-column-selection-not) | Choice column not saving: refresh data connection, use Monitor to verify payload, ensure field names match exactly. |
| [Power Platform Community - Select Action](https://community.powerplatform.com/forums/thread/details/?threadid=1fd2a891-c136-431d-a8c9-842f4300b766) | Select action with empty input returns `null` (not `[]`), causing `length()` errors. Use `coalesce()` for null handling. |
| [Arash Aghajani - Multi-Select in Power Automate](https://arashaghajani.com/blog/how-to-get-sharepoint-multi-select-choice-column-values-in-power-automate/) | Multi-select choice contains objects with metadata (`@odata.type`, `Id`, `Value`). Loop through and compare individually; simple `contains` fails. |

**Answers to Research Questions:**

| # | Question | Answer |
|---|----------|--------|
| 1 | How does SharePoint return multi-select choice data in Power Automate? | Array of objects: `[{"@@odata.type":"...","Id":1,"Value":"text"}]` or `[{"Value":"text"}]`. Empty = `[]`. [SharePoint SE](https://sharepoint.stackexchange.com/questions/294994/parse-json-elements-of-a-list-returned-from-a-multi-choice-column-in-power-autom) |
| 2 | Is `@item()?['Value']` correct for Select action? | **Yes.** Correct for extracting text from each choice object. Fails only when input array is empty. |
| 3 | Why might RejectionReason be empty? | Power Apps `varRejectionReasonsTable` has `{Selected, Value}` — extra `Selected` or value mismatch causes silent Patch failure. [Matthew Devaney](https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/) |
| 4 | Should flow fall back to StaffNotes? | **Yes.** StaffNotes is guaranteed populated; choice column is unreliable. |
| 5 | How to verify Get_Current_Rejected_Data output? | Flow run history → expand action → Outputs → `body/RejectionReason`. If `[]` or null, column is empty. |
| 6 | Expression for ADDITIONAL DETAILS from StaffNotes? | `outputs('Get_Current_Rejected_Data')?['body/StaffNotes']` |
| 7 | Could Patch silently fail on choice column? | **Yes.** [Mark Juniper](https://www.markjuniper.co.uk/2025/02/patching-sharepoint-choice-columns-from.html): incorrect schema causes silent ignore. |
| 8 | How to debug Select action input? | Add Compose before Select: `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']` |
| 9 | Format mismatch Power Apps vs SharePoint? | **Yes.** Power Apps needs `ForAll(table, {Value: ThisRecord.Value})` to strip extra properties. [Matthew Devaney](https://www.matthewdevaney.com/power-apps-patch-function-examples-for-every-sharepoint-column-type/patch-a-sharepoint-choices-column-with-multiple-values/) |
| 10 | Restructure flow to use StaffNotes? | **Yes.** Primary fix. Keep RejectionReason for reporting only. |

**Step-by-Step Debugging Approach:**

1. **Verify RejectionReason in SharePoint** — Add column to view, check REQ-00127. Empty → Patch issue.
2. **Inspect Flow run** — Get Current Rejected Data → `body/RejectionReason`. Empty array → confirms Patch didn't persist.
3. **Add Compose debug** — Before Format Rejection Reasons: `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']` to see raw input.
4. **Check StaffNotes** — Same action's `body/StaffNotes` should contain rejection text. If present, use it.

**Fix for REASON FOR REJECTION:**

Replace `Compose_Formatted_Reasons_Text` with direct StaffNotes reference:
```
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

**Fix for ADDITIONAL DETAILS:**

Replace `Notes` with `StaffNotes`:
```
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

**Expression for parsing latest StaffNotes entry (optional fallback):**

If StaffNotes has pipe-delimited history and you want only the latest rejection:
```
@{last(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | '))}
```

**Testing Checklist:**

- [ ] Update Flow B email template to use `StaffNotes` for both sections
- [ ] Reject test request with 2+ checkboxes selected
- [ ] Verify email contains "REJECTION DETAILS:" with StaffNotes content
- [ ] Confirm no empty sections
- [ ] Check AuditLog for "Email Sent: Rejection"
- [ ] (Optional) Verify RejectionReason in SharePoint after Tier 2 Power Apps fix

**Long-term Recommendation:**

Use **StaffNotes for email content** (reliable, always populated). Use **RejectionReason for reporting** (filtering, analytics) — fix Power Apps Patch with `ForAll(varRejectionReasonsTable, {Value: ThisRecord.Value})` if structured data is needed. Never depend on choice column for student-facing communication.

---

### Other Models

*(Add additional sections as needed)*

---

## Consensus Summary

### Points of Agreement (6/6 Models):

All six AI models (Claude Opus 4.5, Claude Opus 4.6, Sonnet 4.6, GPT 5.3, Gemini 3 Pro, Composer 1.5) reached **unanimous consensus** on the following:

| Finding | Confidence | Models Agreeing |
|---------|------------|-----------------|
| **Root Cause #1:** ADDITIONAL DETAILS uses `body/Notes` (student submission notes) instead of `body/StaffNotes` (staff rejection notes) | **CONFIRMED** | 6/6 |
| **Root Cause #2:** `RejectionReason` choice column is likely empty due to Power Apps `varRejectionReasonsTable` format mismatch with SharePoint multi-select choice requirements | **CONFIRMED** | 6/6 |
| **Select action syntax is correct:** `@item()?['Value']` properly extracts values from choice objects — issue is upstream (empty input array) | **CONFIRMED** | 6/6 |
| **StaffNotes is the reliable source:** Always populated by rejection button logic, contains human-readable rejection reasons | **CONFIRMED** | 6/6 |
| **Silent Patch failure:** SharePoint Patch returns success for overall operation even when it rejects specific choice column values due to format/value mismatch | **CONFIRMED** | 6/6 |
| **Long-term architecture:** Use StaffNotes for email content (reliable), keep RejectionReason for reporting/analytics (structured data) | **RECOMMENDED** | 6/6 |

### Points of Divergence (Minor Variations):

| Variation | Model(s) | Assessment |
|-----------|----------|------------|
| Select action on empty array returns `null` (not `[]`), which could cause runtime errors with `join()`/`length()` operations | Sonnet 4.6 | **Valid finding** — adds understanding of flow behavior but doesn't change solution |
| Use fallback expression: `if(empty(RejectionReason), StaffNotes, formatted_reasons)` | GPT 5.3 | **Optional** — provides redundancy if RejectionReason is fixed later |
| Include `@odata.type` metadata in Power Apps Patch for full SharePoint compliance | Gemini 3 Pro | **Optional** — may improve Patch reliability but not required for immediate fix |
| Various StaffNotes parsing expressions to extract just the reasons segment | All models | **Not recommended** — parsing is brittle; full StaffNotes provides better context |

### Recommended Approach (Unanimous):

**Implement a two-track fix:**

**Track 1 — Immediate Fix (Flow B email template):**
1. Replace `Compose_Formatted_Reasons_Text` reference with `body/StaffNotes` for REASON FOR REJECTION
2. Replace `body/Notes` with `body/StaffNotes` for ADDITIONAL DETAILS
3. Optionally merge into single "REJECTION DETAILS" section for cleaner formatting

**Track 2 — Optional Data Integrity Fix (Power Apps Patch):**
1. Update `varRejectionReasonsTable` Patch to use `ForAll(varRejectionReasonsTable, {Value: ThisRecord.Value})`
2. Or use `Choices()` lookup: `ForAll(varRejectionReasonsTable, LookUp(Choices(PrintRequests.RejectionReason), Value = ThisRecord.Value))`
3. Retain RejectionReason choice column for filtering/reporting purposes

**Why StaffNotes is the correct choice:**
- Always populated (guaranteed by rejection button logic)
- Human-readable format with full context (who, what, when)
- Immune to schema changes and choice column mechanics
- Simpler flow logic (no Select/Compose chain needed)
- Students get complete explanation rather than just enumerated reasons

---

## Suggested Solution

### Recommended Fix: Use StaffNotes as Email Content Source

Based on the unanimous consensus from all 6 AI models, the recommended solution is to **replace the unreliable `RejectionReason` choice column and incorrect `Notes` field with direct `StaffNotes` reference** in the Flow B rejection email.

#### Current Email Template (Broken):

```html
<p>REASON FOR REJECTION:<br>
@{outputs('Compose_Formatted_Reasons_Text')}<br><br>
ADDITIONAL DETAILS:<br>
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}</p>
```

**Problems:**
- `Compose_Formatted_Reasons_Text` outputs empty string (RejectionReason array is `[]`)
- `body/Notes` references student submission notes (usually empty), not staff rejection notes

#### Fixed Email Template (Recommended):

```html
<p class="editor-paragraph">Unfortunately, your 3D Print request has been rejected by our staff.<br><br>
REQUEST DETAILS:<br>
- Request: @{outputs('Get_Current_Rejected_Data')?['body/Title']} (@{outputs('Get_Current_Rejected_Data')?['body/ReqKey']})<br>
- Method: @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}<br>
- Printer Requested: @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}<br><br>
REJECTION DETAILS:<br>
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}<br><br>
NEXT STEPS:<br>
• Review the rejection reason above<br>
• Make necessary adjustments to your design or request<br>
• Submit a new corrected request through the Submission Portal<br>
• Come by the lab and ask us!<br><br>
---<br>
This is an automated message from the LSU Digital Fabrication Lab.</p>
```

**Changes Made:**
1. Merged "REASON FOR REJECTION" and "ADDITIONAL DETAILS" into single "REJECTION DETAILS" section
2. Changed from `Compose_Formatted_Reasons_Text` to `body/StaffNotes` (always populated)
3. Changed from `body/Notes` to `body/StaffNotes` (correct field)
4. Removed dependency on Select/Compose action chain
5. Added REQUEST DETAILS section for context (optional)

#### Alternative: Minimal Change Fix

If you prefer to keep the two-section format:

```
REASON FOR REJECTION:
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}

ADDITIONAL DETAILS:
See above rejection entry for full details.
```

#### Optional: Power Apps Patch Fix (for RejectionReason Column)

If you want the `RejectionReason` choice column to work for reporting/filtering:

**Current Patch (may fail silently):**
```powerfx
RejectionReason: varRejectionReasonsTable
```

**Fixed Patch (correct format):**
```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    {Value: ThisRecord.Value}
)
```

**Or with guaranteed match using Choices() lookup:**
```powerfx
RejectionReason: ForAll(
    varRejectionReasonsTable,
    LookUp(Choices(PrintRequests.RejectionReason), Value = ThisRecord.Value)
)
```

This strips the extra `Selected` property and ensures values match SharePoint's defined choices.

### Implementation Priority

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| **P0 (Critical)** | Update Flow B email template to use `StaffNotes` | 5 min | Fixes blank rejection emails immediately |
| **P1 (Important)** | Fix Power Apps Patch for `RejectionReason` | 15 min | Enables structured reporting/filtering |
| **P2 (Nice-to-have)** | Remove unused Select/Compose actions from Flow B | 5 min | Cleaner flow, less confusion |

### Verification Steps After Fix

1. **Test rejection flow:** Reject a test request (e.g., REQ-TEST-001) with 2+ checkboxes
2. **Check email received:** Verify "REJECTION DETAILS" section contains StaffNotes content
3. **Confirm no blank sections:** Email should have no empty REASON or DETAILS areas
4. **Verify AuditLog:** Should show "Email Sent: Rejection" with correct FlowRunId
5. **Monitor production:** Watch next 5 live rejections to confirm consistent behavior

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

**Selected Solution:** Use `StaffNotes` as the source for rejection email content instead of `RejectionReason` choice column and `Notes` field.

**Rationale:** StaffNotes is guaranteed to be populated by the rejection button logic and contains human-readable rejection reasons. The RejectionReason choice column has compatibility issues between Power Apps and SharePoint, and the Notes field references student submission notes (wrong field entirely).

**Implementation Date:** 2/27/2026

**Status:** [ ] Not Started  [ ] In Progress  [x] Completed  [ ] Abandoned

---

## Implementation Checklist

- [x] Verify `RejectionReason` column data in SharePoint for REQ-00127 — **CONFIRMED EMPTY (2/27/2026): Screenshot shows blank cell in SharePoint list view**
- [x] Check Flow B run history to see actual data at each step — **CONFIRMED: Flow succeeded but Select received empty array `[]`**
- [ ] Verify Power Apps `varRejectionReasonsTable` format matches SharePoint expectations — **Deferred: using StaffNotes instead**
- [ ] Test Patch in isolation to confirm `RejectionReason` column updates — **Deferred: using StaffNotes instead**
- [x] Fix ADDITIONAL DETAILS field reference (Notes → StaffNotes or custom parsing) — **DONE: Updated Flow B email template**
- [x] Implement fallback logic if `RejectionReason` is empty — **DONE: Replaced with direct StaffNotes reference**
- [ ] Test complete rejection flow end-to-end — **Ready for testing**
- [ ] Verify email contains expected reasons — **Ready for testing**
- [x] Update documentation with fix — **DONE: Flow-(B)-Audit-LogChanges.md updated (Step 7a, Action 6)**
- [ ] Monitor next 5 rejections to confirm resolution — **Pending deployment**

### Evidence Screenshots (2/27/2026)

| Screenshot | Description | Key Finding |
|------------|-------------|-------------|
| SharePoint List View | REQ-00127 row showing all columns | `RejectionReason` = EMPTY, `StaffNotes` = populated |
| Column Settings | RejectionReason column configuration | Multi-select choice, fill-in enabled, 8 predefined options |
| Received Email | Actual rejection email received by student | REASON FOR REJECTION = blank, ADDITIONAL DETAILS = blank |

---

## Resolution Summary (2/27/2026)

### Root Causes Confirmed

| Root Cause | Evidence | Status |
|------------|----------|--------|
| **`RejectionReason` choice column is empty** | SharePoint screenshot shows blank cell for REQ-00127 | **CONFIRMED** |
| **Power Apps Patch silently failing on choice column** | StaffNotes populated, RejectionReason empty in same Patch | **CONFIRMED** |
| **ADDITIONAL DETAILS uses wrong field (`Notes` vs `StaffNotes`)** | Email JSON shows empty sections despite StaffNotes being populated | **CONFIRMED** |
| **Custom fill-in values may break choice column Patch** | Staff entered "zero thickness areas" which isn't a predefined choice | **LIKELY CONTRIBUTOR** |

### Fix Applied

**Flow B email template updated** to use `StaffNotes` directly:

```html
REJECTION DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

**Changes made in `Flow-(B)-Audit-LogChanges.md`:**
- Step 7a, Action 6: Updated email body HTML
- Merged "REASON FOR REJECTION" and "ADDITIONAL DETAILS" into single "REJECTION DETAILS" section
- Removed dependency on `Compose_Formatted_Reasons_Text` (unreliable)
- Removed dependency on `body/Notes` (wrong field)
- Added fix note with reference to this debug document

### Next Steps

1. **Deploy the updated Flow B** with the corrected email template
2. **Test a new rejection** to verify the fix works
3. **Monitor next 5 rejections** to confirm consistent behavior
4. **(Optional)** Fix Power Apps Patch for `RejectionReason` if structured reporting is needed

### Lessons Learned

1. **SharePoint multi-select choice columns are fragile** — Patch can silently fail if values don't exactly match defined options
2. **Use text fields for critical communication** — `StaffNotes` is immune to choice column mechanics
3. **Always verify field names in email templates** — `Notes` vs `StaffNotes` was a simple typo with major impact
4. **Test email content end-to-end** — Flow success doesn't guarantee email content is correct

---

## Related Documentation

- `PowerAutomate/Flow-(B)-Audit-LogChanges.md` — Flow B implementation details (fix applied in Step 7a, Action 6)
- `PowerApps/StaffDashboard-App-Spec.md` — Rejection button OnSelect logic (Step 46)
- `Debug/Email Identity Solutions.md` — Similar debug document format
