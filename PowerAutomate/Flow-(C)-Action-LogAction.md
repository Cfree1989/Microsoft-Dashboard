# Flow C (PR-Action)

**Full Name:** PR-Action: Log action (called from Power Apps)  
**Type:** Instant cloud flow (triggered from Power Apps)

**Purpose:** When staff press buttons in the Power Apps staff console (e.g., Approve, Reject), log that action with proper actor attribution and comprehensive audit details.

---

## Clean Build Plan - Step-by-Step Implementation

**IMPORTANT:** This flow is called FROM Power Apps, not triggered by SharePoint. It receives parameters from Power Apps and creates audit log entries.

### Step 1: Flow Creation Setup

**What this does:** Creates the foundation instant cloud flow that Power Apps can call to log staff actions.

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. **Create** → **Instant cloud flow**
3. **Name:** Type `Flow C (PR-Action)` or `PR-Action: Log action`
4. **Choose trigger:** Select **Power Apps**
5. **Skip** the "Choose how to trigger this flow" step (Power Apps trigger is added automatically)
6. **Click Create**

**Test Step 1:** Save → Flow should appear in "My flows" with a Power Apps icon

---

### Step 2: Add Input Parameters

**What this does:** Defines the 5 parameters that Power Apps will send to the flow when staff perform actions (approve, reject, update fields, etc.).

**⚠️ Parameter Order Matters:** Power Automate assigns internal names (`text`, `text_1`, `text_2`, etc.) based on the order you add them. Add them in the exact order below to match the expressions in later steps.

**UI steps:**
1. In the **Power Apps** trigger card → Click **Add an input**
2. For each parameter below, select **Text** type and fill in exactly as shown:

#### Parameter 1: RequestID
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `RequestID`
- **Please enter description:** Type `The ID of the request being modified`
- **Internal reference:** `triggerBody()['text']`

#### Parameter 2: Action
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `Action`
- **Please enter description:** Type `The action being performed (e.g., Status Change, Approved, Rejected)`
- **Internal reference:** `triggerBody()['text_1']`

#### Parameter 3: FieldName
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `FieldName`
- **Please enter description:** Type `The field being changed (e.g., Status, Priority, StaffNotes)`
- **Internal reference:** `triggerBody()['text_2']`

#### Parameter 4: NewValue
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `NewValue`
- **Please enter description:** Type `New value of the field`
- **Internal reference:** `triggerBody()['text_3']`

#### Parameter 5: ActorEmail
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `ActorEmail`
- **Please enter description:** Type `Email of the staff member performing the action`
- **Internal reference:** `triggerBody()['text_4']`

**Test Step 2:** Save → All 5 parameters should show in the Power Apps trigger card

---

### Step 3: Get Request Item

**What this does:** Retrieves the PrintRequests item to get the ReqKey and validates the request exists before creating an audit entry.

**UI steps:**
1. Click **+ New step**
2. **Search:** Type `Get item` → Select **Get item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get Request Item`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry Policy:** Turn to **On**
   - **Type:** Select **Exponential**
   - **Count:** Type **4**
   - **Minimum Interval:** Type **PT30S** (30 seconds)
   - **Click Done**
5. **Fill in all fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** 
     - **Click **Expression** tab (fx) → Paste `triggerBody()['text']` → Click **OK**
     
**⚠️ Note:** If Dynamic content doesn't show your parameters, save the flow first. Alternatively, use the expression method (Option A) which always works.

**Test Step 3:** Save → Manually test flow with valid RequestID → Should retrieve item without errors

---

### Step 4: Input Validation

**What this does:** Validates that all required parameters (RequestID, Action, NewValue, ActorEmail) are present before logging. This prevents incomplete audit entries.

**UI steps:**
1. Click **+ New step**
2. **Search:** Type `Condition` → Select **Condition**
3. **Rename condition:** Click **three dots (…)** → **Rename** → Type `Validate Required Inputs`
4. **Configure condition:**
   - **Left box:** Click **Expression** tab (fx) → Paste the expression below:
   ```
   and(not(empty(triggerBody()['text'])), not(empty(triggerBody()['text_1'])), not(empty(triggerBody()['text_3'])), not(empty(triggerBody()['text_4'])))
   ```
   - Click **Update**
   - **Middle dropdown:** Select **is equal to**
   - **Right box:** Type `true`

**⚠️ What this expression checks (4 required parameters):**
- `triggerBody()['text']` = RequestID (required)
- `triggerBody()['text_1']` = Action (required)
- `triggerBody()['text_3']` = NewValue (required)
- `triggerBody()['text_4']` = ActorEmail (required)

**Why `text_2` (FieldName) is NOT in this expression:**
- FieldName is **optional** - some actions don't need it (e.g., a general "Approved" action)
- The expression intentionally skips from `text_1` to `text_3`
- This is by design, not an error

**Alternative method (if Expression tab not working):**
1. Before the Condition, add a **Compose** action
2. Rename to: `Are Inputs Present`
3. In **Inputs**, paste the expression above
4. In the Condition, set **Outputs** of `Are Inputs Present` **is equal to** `true`

**Yes Branch:** All required inputs present → Create audit entry
**No Branch:** Missing required inputs → Return error response

**Test Step 4:** Save → Test with missing ActorEmail → Should follow No branch and return error

---

### Step 5: Create Audit Log Entry (Yes Branch)

**What this does:** Creates a comprehensive audit log entry in the AuditLog list with all staff action details when validation passes.

**UI steps (INSIDE THE "YES" BRANCH of Step 4):**
1. In the **Yes branch** → Click **+ Add an action**
2. **Search:** Type `Create item` → Select **Create item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Create Audit Log Entry`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry Policy:** Turn to **On**
   - **Type:** Select **Exponential**
   - **Count:** Type **4**
   - **Minimum Interval:** Type **PT30S**
   - **Click Done**
5. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Click **Expression** → Type `concat('Staff Action: ', triggerBody()['text_1'])`
   - **RequestID:** Click **Dynamic content** → Select **ID** (from Get Request Item) ← Uses Number type from SharePoint
   - **ReqKey:** Click **Dynamic content** → Select **ReqKey** (from Get Request Item)
   - **Action Value:** Click **Dynamic content** → Select **Action** (from Power Apps trigger)
   - **FieldName:** Click **Dynamic content** → Select **FieldName** (from Power Apps trigger)
   - **OldValue:** Leave blank
   - **NewValue:** Click **Dynamic content** → Select **NewValue** (from Power Apps trigger)
   - **Actor Claims:** Click **Dynamic content** → Select **ActorEmail** (from Power Apps trigger)
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `Power Apps`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Staff action via Power Apps: ', triggerBody()['text_1'])`

> 💡 **Why use ID from Get Request Item?** The AuditLog `RequestID` column is a Number type. Using the ID from SharePoint (already a number) is cleaner than using the trigger input (which is a string).

**Test Step 5:** Save → Call flow from Power Apps with valid data → Check AuditLog for entry with all fields populated

---

### Step 6: Send Success Response (Yes Branch)

**What this does:** Returns a JSON response to Power Apps with success status and the newly created audit entry ID.

**UI steps (INSIDE THE "YES" BRANCH, after "Create Audit Log Entry"):**
1. In the **Yes branch** after "Create Audit Log Entry" → Click **+ Add an action**
2. **Search:** Type `Respond to a PowerApp` → Select **Respond to a Power App or flow**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Send Success Response`
4. Click **Add an output** → Select **Text**
5. **Title:** Type `Response`
6. **Enter a value to respond:** **Paste directly into the text field** (DO NOT use Expression tab):
```json
{
  "success": true,
  "message": "Action logged successfully",
  "auditId": "@{outputs('Create_Audit_Log_Entry')?['body/ID']}",
  "timestamp": "@{utcNow()}"
}
```

**⚠️ Important:** 
- Paste as plain text directly into the field, not in the Expression editor
- The `@{...}` parts will automatically be recognized as dynamic expressions
- Ensure the action name `Create_Audit_Log_Entry` matches your actual action name (spaces become underscores)

**⚠️ Note:** Power Apps will receive this JSON and can parse it with `varFlowResult.success`, `varFlowResult.auditId`, etc.

**Test Step 6:** Save → Call flow → Power Apps should receive success response with audit ID

---

### Step 7: Send Error Response (No Branch)

**What this does:** Returns an error JSON response to Power Apps when required parameters are missing.

**UI steps (INSIDE THE "NO" BRANCH of Step 4):**
1. In the **No branch** → Click **+ Add an action**
2. **Search:** Type `Respond to a PowerApp` → Select **Respond to a Power App or flow**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Send Error Response`
4. Click **Add an output** → Select **Text**
5. **Title:** Type `Response`
6. **Enter a value to respond:** **Paste directly into the text field** (DO NOT use Expression tab):
```json
{
  "success": false,
  "message": "Missing required parameters: RequestID, Action, NewValue, or ActorEmail",
  "timestamp": "@{utcNow()}"
}
```

**⚠️ Important:** Paste as plain text directly into the field. The `@{utcNow()}` will automatically be recognized as a dynamic expression.

**Test Step 7:** Save → Call flow with missing ActorEmail → Power Apps should receive error response

---

### Step 8: Final Testing

**What this does:** Comprehensive testing of all flow paths and Power Apps integration.

**Testing Checklist:**
- [ ] Flow appears in Power Apps data sources
- [ ] Calling flow with valid parameters creates audit entry
- [ ] Success response includes audit entry ID
- [ ] Missing required parameters triggers error response
- [ ] ActorEmail resolves to Person field in SharePoint
- [ ] ReqKey correctly retrieved from PrintRequests
- [ ] FlowRunId and ActionAt timestamps populated
- [ ] Notes field auto-generates from Action name
- [ ] ClientApp shows "Power Apps"
- [ ] Retry policies trigger on simulated SharePoint failures

**🎉 SUCCESS:** You now have a working Flow C that Power Apps can call to log staff actions!

---

## Power Apps Integration Guide

### Adding the Flow to Power Apps

**What this does:** Makes the flow available in Power Apps so staff can call it from buttons and forms.

**UI steps:**
1. Open your **Power Apps** in **Power Apps Studio**
2. Left sidebar → **Data** → **Add data**
3. Search for **Power Automate** → Select it
4. Find **Flow C (PR-Action)** or **PR-Action: Log action** in the list → Click to add
5. The flow appears in your app's formulas as `'Flow C (PR-Action)'` or `'PR-Action: Log action'`

**Verify Connection:**
- In Power Apps formula bar, type the flow name with a period (e.g., `'Flow C (PR-Action)'.`)
- You should see `.Run()` appear in IntelliSense
- The `.Run()` function will show 5 parameters: RequestID, Action, FieldName, NewValue, ActorEmail

---

## Power Apps Usage Examples

> 💡 **Note:** This flow accepts 5 parameters. OldValue, ClientApp, and Notes are auto-populated by the flow.

### Example 1: Approve Button with Full Error Handling

**What this does:** Approves a request, logs the action, and shows user feedback based on success/failure.

**Power Apps code (OnSelect property of Approve button):**

**Note:** Replace `'Flow C (PR-Action)'` with your actual flow name in Power Apps (it might be `'Flow-(C)-Action-LogAction'` or `'PR-Action: Log action'`).

```powerfx
// Store flow result
Set(varFlowResult,
    IfError(
        'Flow C (PR-Action)'.Run(
            Text(ThisItem.ID),      // RequestID
            "Approved",             // Action
            "Status",               // FieldName  
            "Ready to Print",       // NewValue
            User().Email            // ActorEmail
        ),
        {success: false, message: FirstError.Message}   // Error fallback if flow fails
    )
);

// Show notification based on result
If(varFlowResult.success,
    Notify("Action logged successfully. Audit ID: " & varFlowResult.auditId, NotificationType.Success),
    Notify("Failed to log action: " & varFlowResult.message, NotificationType.Error)
);

// Refresh the gallery to show updated data
Refresh(PrintRequests);
```

**⚠️ Key Points:**
- `IfError()` catches flow failures and provides a fallback response
- Parse JSON response with `.success`, `.message`, `.auditId`, `.timestamp`
- Always refresh data sources after successful updates

---

### Example 2: Reject Button

**What this does:** Rejects a request and logs the action.

**Power Apps code (OnSelect property of Reject button):**

```powerfx
// Call flow to log rejection
Set(varFlowResult,
    IfError(
        'Flow-(C)-Action-LogAction'.Run(
            Text(ThisItem.ID),      // RequestID
            "Rejected",             // Action
            "Status",               // FieldName
            "Rejected",             // NewValue
            User().Email            // ActorEmail
        ),
        {success: false, message: FirstError.Message}
    )
);

// Handle response
If(varFlowResult.success,
    Notify("Rejection logged. Audit ID: " & varFlowResult.auditId, NotificationType.Success),
    Notify("Failed to log rejection: " & varFlowResult.message, NotificationType.Error)
);

// Refresh data
Refresh(PrintRequests);
```

---

### Example 3: Update Single Field with Validation

**What this does:** Updates a single field (like StaffNotes) with pre-flight validation before calling the flow.

**Power Apps code (OnSelect property of Save Notes button):**

```powerfx
// Validate required parameters
Set(varValidationErrors, "");

If(IsBlank(ThisItem.ID), 
    Set(varValidationErrors, varValidationErrors & "Item ID is required. "));
If(IsBlank(User().Email), 
    Set(varValidationErrors, varValidationErrors & "User email is required. "));
If(IsBlank(txtStaffNotes.Text), 
    Set(varValidationErrors, varValidationErrors & "Notes cannot be blank. "));

// Only call flow if validation passes
If(IsBlank(varValidationErrors),
    // Validation passed - call flow
    Set(varFlowResult,
        IfError(
            'Flow-(C)-Action-LogAction'.Run(
                Text(ThisItem.ID),          // RequestID
                "Field Updated",            // Action
                "StaffNotes",               // FieldName
                txtStaffNotes.Text,         // NewValue
                User().Email                // ActorEmail
            ),
            {success: false, message: FirstError.Message}
        )
    );
    
    // Handle response
    If(varFlowResult.success,
        Notify("Notes saved. Audit ID: " & varFlowResult.auditId, NotificationType.Success),
        Notify("Failed to save notes: " & varFlowResult.message, NotificationType.Error)
    );
    
    Refresh(PrintRequests);,
    
    // Validation failed - show errors
    Notify("Validation failed: " & varValidationErrors, NotificationType.Error)
);
```

---

### Example 4: Update Estimates with Calculated Cost

**What this does:** Updates cost estimate fields and logs the action.

**Power Apps code (OnSelect property of Save Estimates button):**

```powerfx
// Calculate cost based on weight and material
Set(varCalculatedCost, 
    numEstimatedWeight.Text * 
    Switch(ddMaterial.Selected.Value,
        "PLA", 0.03,
        "ABS", 0.04,
        "PETG", 0.05,
        0.03  // default
    )
);

// Log the estimate update
Set(varFlowResult,
    IfError(
        'Flow-(C)-Action-LogAction'.Run(
            Text(ThisItem.ID),                              // RequestID
            "Estimate Updated",                             // Action
            "EstimatedCost",                                // FieldName
            Text(varCalculatedCost, "[$-en-US]#,##0.00"),   // NewValue
            User().Email                                    // ActorEmail
        ),
        {success: false, message: FirstError.Message}
    )
);

// Handle response
If(varFlowResult.success,
    Notify("Estimate saved. Audit ID: " & varFlowResult.auditId, NotificationType.Success),
    Notify("Failed to save estimate: " & varFlowResult.message, NotificationType.Error)
);
```

---

## Parameter Reference Table

**Quick reference for the 5 parameters:**

| Parameter # | Name | Internal | Example Value | Purpose |
|-------------|------|----------|---------------|---------|
| 1 | RequestID | `text` | `Text(ThisItem.ID)` | ID of the PrintRequests item |
| 2 | Action | `text_1` | `"Approved"` | Type of action being performed |
| 3 | FieldName | `text_2` | `"Status"` | Which field is being changed |
| 4 | NewValue | `text_3` | `"Pending"` | New value being set |
| 5 | ActorEmail | `text_4` | `User().Email` | Email of staff performing action |

**Auto-populated fields in AuditLog (hardcoded in flow):**
- **OldValue:** Left blank (consistent with other flows)
- **ClientApp:** `"Power Apps"`
- **Notes:** Auto-generated from Action name

**⚠️ Common Mistakes:**
- ❌ `ThisItem.ID` → ✅ `Text(ThisItem.ID)` (must convert to text)
- ❌ `ThisItem.Status` → ✅ `ThisItem.Status.Value` (Choice fields need .Value)
- ❌ Missing `User().Email` → ✅ Always provide ActorEmail for audit trail

**Power Apps Call Pattern:**
```powerfx
'Flow-(C)-Action-LogAction'.Run(
    Text(ThisItem.ID),      // RequestID
    "Status Change",        // Action
    "Status",               // FieldName
    "NewStatus",            // NewValue
    varMeEmail              // ActorEmail
)
```

---

## Key Features

✅ **Input Validation** - Flow validates required parameters before processing  
✅ **Enhanced Error Handling** - Exponential retry policies on SharePoint actions  
✅ **Structured JSON Responses** - Success/failure status with audit entry ID  
✅ **Comprehensive Audit Fields** - All audit information captured  
✅ **Auto-generated Notes** - Notes created from Action name  
✅ **Power Apps Integration** - Complete examples with error handling  
✅ **Actor Attribution** - Email automatically resolves to Person field  

---

## Troubleshooting Guide

### Issue 1: Flow Not Appearing in Power Apps

**Symptoms:**
- Can't find flow in Power Apps data sources
- Flow doesn't appear when typing formula

**Fix:**
1. Verify flow is saved and published in Power Automate
2. In Power Apps → **Data** → **Refresh** → Look for flow again
3. Check flow owner has permission to share with app users
4. Ensure flow trigger is **Power Apps**, not SharePoint

---

### Issue 2: Internal Parameter Names Mismatch (InvalidTemplate Error)

**Symptoms:**
- Flow fails with `InvalidTemplate` error
- Error message: `property 'text_X' doesn't exist`
- Validation expression cannot be evaluated

**Cause:**
- Power Automate assigns internal names (`text`, `text_1`, `text_2`, etc.) based on the **order** parameters are added
- If parameters were deleted and re-added, or added out of order, the internal names won't match the expressions

**How to Check Your Internal Names:**
1. Click on the **Power Apps trigger** card
2. Click **...** menu → **Peek code**
3. Look at the `properties` section to see actual internal names

**Expected Internal Names (if added in correct order):**
```json
{
  "text": "RequestID",
  "text_1": "Action",
  "text_2": "FieldName",
  "text_3": "NewValue",
  "text_4": "ActorEmail"
}
```

**Fix Option 1 - Update Expressions:**
Update the Validate Required Inputs expression to match your actual internal names.

**Fix Option 2 - Rebuild Parameters (Cleanest):**
1. Delete all 5 parameters from the Power Apps trigger
2. Re-add them in exact order: RequestID, Action, FieldName, NewValue, ActorEmail
3. Save the flow
4. In Power Apps: Remove and re-add the flow connection to refresh

---

### Issue 2b: "Missing required parameters" Error

**Symptoms:**
- Flow returns error response
- AuditLog entry not created

**Fix:**
1. Check that all 5 parameters are provided:
   - RequestID (Parameter 1 - `text`)
   - Action (Parameter 2 - `text_1`)
   - FieldName (Parameter 3 - `text_2`)
   - NewValue (Parameter 4 - `text_3`)
   - ActorEmail (Parameter 5 - `text_4`)
2. Verify parameters aren't blank: `!IsBlank(User().Email)`
3. Convert IDs to text: `Text(ThisItem.ID)` not `ThisItem.ID`

---

### Issue 2b: "Invalid number of arguments" Error in Power Apps

**Symptoms:**
- Power Apps shows error: "Invalid number of arguments: received X, expected 5-6"

**Cause:**
- Power Apps is passing more or fewer parameters than the flow expects
- The flow trigger only has 5 parameters defined

**Fix:**
1. Verify you're passing exactly 5 parameters to the flow
2. Check your flow trigger in Power Automate shows 5 inputs
3. Use this pattern:
```powerfx
'Flow-(C)-Action-LogAction'.Run(
    Text(ThisItem.ID),      // RequestID
    "Action Name",          // Action
    "FieldName",            // FieldName
    "NewValue",             // NewValue
    User().Email            // ActorEmail
)
```

---

### Issue 3: "Action logged but audit failed" or AuditLog Entry Not Created

**Symptoms:**
- Power Apps shows warning: "Approved, but could not log to audit"
- Flow runs but Create Audit Log Entry action fails
- No entry appears in AuditLog list

**Cause:**
- The **Action** column in AuditLog is a **Choice** field
- The action value being logged (e.g., "Approved") isn't in the list of valid choices

**Fix:**
1. Go to SharePoint → **Site contents** → **AuditLog** list
2. Click **Settings** (gear) → **List settings**
3. Under **Columns**, click on **Action**
4. Add missing choices. **Recommended full list:**
   - Created
   - Updated
   - Status Change
   - File Added
   - Comment Added
   - Assigned
   - **Approved** ← Add this
   - **Picked Up** ← Add this
   - **Started** ← Add this
   - **Completed** ← Add this
   - Email Sent
   - Rejected
   - System
5. Click **OK** to save

**Note:** Add any action values your app might log to prevent future failures.

---

### Issue 4: Actor Claims Field Not Resolving

**Symptoms:**
- Actor Claims field shows as text in AuditLog, not as Person field
- Can't see user's display name in audit entries
- Email appears instead of user name

**Fix:**
1. Ensure ActorEmail parameter contains valid email: `User().Email`
2. Check user exists in SharePoint site's people picker
3. Verify **Actor Claims** field type in AuditLog is **Person or Group** (not Single line of text)
4. SharePoint auto-resolves emails to Person fields (may take 1-2 minutes)
5. Verify the email address is formatted correctly (lowercase, valid domain)

---

### Issue 5: Flow Times Out in Power Apps

**Symptoms:**
- Long wait in Power Apps after calling flow
- Eventually shows timeout error

**Fix:**
1. Check retry policies in flow aren't too aggressive
2. Verify SharePoint site is accessible from flow
3. Test flow directly in Power Automate → **Test** → Manual trigger
4. Consider increasing Power Apps timeout: `'PR-Action: Log action'.Run(...); Timeout: 60`

---

### Issue 6: JSON Response Not Parsing

**Symptoms:**
- Can't access `varFlowResult.success` or `.auditId`
- Type errors when referencing response properties

**Fix:**
1. Verify "Respond to a Power App or flow" action includes JSON in "Enter a value to respond"
2. Check JSON syntax is valid (no missing commas, quotes)
3. Ensure action names in expressions match exactly: `Create_Audit_Log_Entry` vs `Create Audit Log Entry`
4. Test response structure: `Notify(JSON(varFlowResult, JSONFormat.IndentFour))`
