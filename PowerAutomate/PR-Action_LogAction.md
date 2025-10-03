# Flow C — PR-Action: Log action (called from Power Apps)

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
3. **Name:** Type `PR-Action: Log action`
4. **Choose trigger:** Select **Power Apps**
5. **Skip** the "Choose how to trigger this flow" step (Power Apps trigger is added automatically)
6. **Click Create**

**Test Step 1:** Save → Flow should appear in "My flows" with a Power Apps icon

---

### Step 2: Add Input Parameters

**What this does:** Defines the 8 parameters that Power Apps will send to the flow when staff perform actions (approve, reject, update fields, etc.).

**⚠️ Parameter Order Matters:** Power Automate assigns internal names (`text`, `text_1`, `text_2`, etc.) based on the order you add them. Add them in the exact order below to match the expressions in later steps.

**UI steps:**
1. In the **Power Apps** trigger card → Click **Add an input**
2. For each parameter below, select **Text** type and fill in exactly as shown:

#### Parameter 1: RequestID
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `RequestID`
- **Please enter description:** Type `The ID of the request being modified`
- **Check the "Required" checkbox**
- **Internal reference:** `triggerBody()['text']`

#### Parameter 2: Action
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `Action`
- **Please enter description:** Type `The action being performed (e.g., Status Change, Approved, Rejected)`
- **Check the "Required" checkbox**
- **Internal reference:** `triggerBody()['text_1']`

#### Parameter 3: FieldName
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `FieldName`
- **Please enter description:** Type `The field being changed (e.g., Status, Priority, StaffNotes)`
- **Check the "Required" checkbox**
- **Internal reference:** `triggerBody()['text_2']`

#### Parameter 4: OldValue
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `OldValue`
- **Please enter description:** Type `Previous value of the field (optional)`
- **Leave "Required" unchecked**
- **Internal reference:** `triggerBody()['text_3']`

#### Parameter 5: NewValue
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `NewValue`
- **Please enter description:** Type `New value of the field`
- **Check the "Required" checkbox**
- **Internal reference:** `triggerBody()['text_4']`

#### Parameter 6: ActorEmail
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `ActorEmail`
- **Please enter description:** Type `Email of the staff member performing the action`
- **Check the "Required" checkbox**
- **Internal reference:** `triggerBody()['text_5']`

#### Parameter 7: ClientApp
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `ClientApp`
- **Please enter description:** Type `Source application (default: Power Apps)`
- **Leave "Required" unchecked**
- **Internal reference:** `triggerBody()['text_6']`

#### Parameter 8: Notes
- **Click "Add an input"** → **Select "Text"**
- **Input name:** Type `Notes`
- **Please enter description:** Type `Additional context or notes (optional)`
- **Leave "Required" unchecked**
- **Internal reference:** `triggerBody()['text_7']`

**⚠️ Critical Note:** The `triggerBody()['text_X']` references shown above are used in the expressions in later steps. If you add parameters in a different order, you'll need to adjust the text indices in Steps 4 and 5.

**Test Step 2:** Save → All 8 parameters should show in the Power Apps trigger card with correct Required/Optional status

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
   - **Id:** Click **Dynamic content** → Select **RequestID** (from Power Apps trigger)

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
   and(not(empty(triggerBody()['text'])), not(empty(triggerBody()['text_1'])), not(empty(triggerBody()['text_4'])), not(empty(triggerBody()['text_5'])))
   ```
   - Click **Update**
   - **Middle dropdown:** Select **is equal to**
   - **Right box:** Type `true`

**⚠️ What this expression checks:**
- `triggerBody()['text']` = RequestID (required)
- `triggerBody()['text_1']` = Action (required)
- `triggerBody()['text_4']` = NewValue (required)
- `triggerBody()['text_5']` = ActorEmail (required)

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
   - **RequestID:** Click **Dynamic content** → Select **RequestID** (from Power Apps trigger)
   - **ReqKey:** Click **Dynamic content** → Select **ReqKey** (from Get Request Item)
   - **Action Value:** Click **Dynamic content** → Select **Action** (from Power Apps trigger)
   - **FieldName:** Click **Dynamic content** → Select **FieldName** (from Power Apps trigger)
   - **OldValue:** Click **Dynamic content** → Select **OldValue** (from Power Apps trigger)
   - **NewValue:** Click **Dynamic content** → Select **NewValue** (from Power Apps trigger)
   - **Actor:** Click **Dynamic content** → Select **ActorEmail** (from Power Apps trigger)
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Click **Dynamic content** → Select **ClientApp** (from Power Apps trigger)
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `if(empty(triggerBody()['text_7']), concat('Action performed by staff via Power Apps: ', triggerBody()['text_1']), triggerBody()['text_7'])`

**⚠️ Notes Field Logic:** If Notes parameter is empty, auto-generates "Action performed by staff via Power Apps: [Action]". Otherwise uses the provided Notes.

**Test Step 5:** Save → Call flow from Power Apps with valid data → Check AuditLog for entry with all fields populated

---

### Step 6: Send Success Response (Yes Branch)

**What this does:** Returns a JSON response to Power Apps with success status and the newly created audit entry ID.

**UI steps (INSIDE THE "YES" BRANCH, after "Create Audit Log Entry"):**
1. In the **Yes branch** after "Create Audit Log Entry" → Click **+ Add an action**
2. **Search:** Type `Respond to a PowerApp` → Select **Respond to a PowerApp or flow**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Send Success Response`
4. Click **Add an output** → Select **Text**
5. **Title:** Type `Response`
6. **Enter a value to respond:** Click **Expression** tab (fx) → Paste:
```json
{
  "success": true,
  "message": "Action logged successfully",
  "auditId": "@{outputs('Create_Audit_Log_Entry')?['body/ID']}",
  "timestamp": "@{utcNow()}"
}
```
7. Click **Update**

**⚠️ Note:** Power Apps will receive this JSON and can parse it with `varFlowResult.success`, `varFlowResult.auditId`, etc.

**Test Step 6:** Save → Call flow → Power Apps should receive success response with audit ID

---

### Step 7: Send Error Response (No Branch)

**What this does:** Returns an error JSON response to Power Apps when required parameters are missing.

**UI steps (INSIDE THE "NO" BRANCH of Step 4):**
1. In the **No branch** → Click **+ Add an action**
2. **Search:** Type `Respond to a PowerApp` → Select **Respond to a PowerApp or flow**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Send Error Response`
4. Click **Add an output** → Select **Text**
5. **Title:** Type `Response`
6. **Enter a value to respond:** Click **Expression** tab (fx) → Paste:
```json
{
  "success": false,
  "message": "Missing required parameters: RequestID, Action, NewValue, or ActorEmail",
  "timestamp": "@{utcNow()}"
}
```
7. Click **Update**

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
- [ ] Notes field handles both provided and auto-generated content
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
4. Find **PR-Action: Log action** in the list → Click to add
5. The flow appears in your app's formulas as `'PR-Action: Log action'`

**Verify Connection:**
- In Power Apps formula bar, type `'PR-Action: Log action'.` (with the period)
- You should see `.Run()` appear in IntelliSense
- The `.Run()` function will show 8 parameters matching Step 2

---

## Power Apps Usage Examples

### Example 1: Approve Button with Full Error Handling

**What this does:** Approves a request, logs the action, and shows user feedback based on success/failure.

**Power Apps code (OnSelect property of Approve button):**

```powerfx
// Store flow result
Set(varFlowResult,
    IfError(
        'PR-Action: Log action'.Run(
            Text(ThisItem.ID),                           // RequestID
            "Approved",                                  // Action
            "Status",                                    // FieldName  
            ThisItem.Status.Value,                       // OldValue
            "Ready to Print",                            // NewValue
            User().Email,                                // ActorEmail
            "Power Apps",                                // ClientApp
            "Approved via Staff Dashboard"               // Notes
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

### Example 2: Reject Button with Multiple Rejection Reasons

**What this does:** Rejects a request with concatenated rejection reasons from checkboxes and custom text.

**Power Apps code (OnSelect property of Reject button):**

```powerfx
// Build rejection reasons string
Set(varRejectionReasons, "");
If(chkFileQuality.Value, Set(varRejectionReasons, varRejectionReasons & "File Quality Issues; "));
If(chkTooLarge.Value, Set(varRejectionReasons, varRejectionReasons & "Too Large to Print; "));
If(chkUnsupported.Value, Set(varRejectionReasons, varRejectionReasons & "Unsupported Material; "));
If(!IsBlank(txtCustomReason.Text), Set(varRejectionReasons, varRejectionReasons & txtCustomReason.Text));

// Call flow to log rejection
Set(varFlowResult,
    IfError(
        'PR-Action: Log action'.Run(
            Text(ThisItem.ID),
            "Rejected",
            "Status", 
            ThisItem.Status.Value,
            "Rejected",
            User().Email,
            "Power Apps",
            "Request rejected. Reasons: " & varRejectionReasons
        ),
        {success: false, message: FirstError.Message}
    )
);

// Handle response
If(varFlowResult.success,
    Notify("Rejection logged. Audit ID: " & varFlowResult.auditId, NotificationType.Success);
    // Reset form
    Reset(chkFileQuality); Reset(chkTooLarge); Reset(chkUnsupported); Reset(txtCustomReason);,
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
            'PR-Action: Log action'.Run(
                Text(ThisItem.ID),
                "Field Updated",
                "StaffNotes",
                ThisItem.StaffNotes,
                txtStaffNotes.Text,
                User().Email,
                "Power Apps",
                "Staff notes updated by " & User().FullName
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

**What this does:** Updates cost estimate fields and logs the calculation method in Notes.

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
        'PR-Action: Log action'.Run(
            Text(ThisItem.ID),
            "Estimate Updated",
            "EstimatedCost",
            Text(ThisItem.EstimatedCost, "[$-en-US]#,##0.00"),
            Text(varCalculatedCost, "[$-en-US]#,##0.00"),
            User().Email,
            "Power Apps",
            "Cost calculated: " & numEstimatedWeight.Text & "g × $" & 
                Text(varMaterialRate, "[$-en-US]#,##0.00") & "/g = $" & 
                Text(varCalculatedCost, "[$-en-US]#,##0.00")
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

**Quick reference for the 8 parameters when calling the flow:**

| Parameter # | Name | Type | Required | Example Value | Purpose |
|-------------|------|------|----------|---------------|---------|
| 1 | RequestID | Text | ✅ Yes | `Text(ThisItem.ID)` | ID of the PrintRequests item |
| 2 | Action | Text | ✅ Yes | `"Approved"` | Type of action being performed |
| 3 | FieldName | Text | ✅ Yes | `"Status"` | Which field is being changed |
| 4 | OldValue | Text | ❌ No | `ThisItem.Status.Value` | Previous value (for audit trail) |
| 5 | NewValue | Text | ✅ Yes | `"Ready to Print"` | New value being set |
| 6 | ActorEmail | Text | ✅ Yes | `User().Email` | Email of staff performing action |
| 7 | ClientApp | Text | ❌ No | `"Power Apps"` | Source application name |
| 8 | Notes | Text | ❌ No | `"Approved by manager"` | Additional context |

**⚠️ Common Mistakes:**
- ❌ `ThisItem.ID` → ✅ `Text(ThisItem.ID)` (must convert to text)
- ❌ `ThisItem.Status` → ✅ `ThisItem.Status.Value` (Choice fields need .Value)
- ❌ Missing `User().Email` → ✅ Always provide ActorEmail for audit trail

---

## Key Features

✅ **Input Validation** - Flow validates required parameters before processing  
✅ **Enhanced Error Handling** - Exponential retry policies on SharePoint actions  
✅ **Structured JSON Responses** - Success/failure status with audit entry ID  
✅ **Comprehensive Audit Fields** - All audit information captured  
✅ **Flexible Notes** - Auto-generates notes if not provided  
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

### Issue 2: "Missing required parameters" Error

**Symptoms:**
- Flow returns error response
- AuditLog entry not created

**Fix:**
1. Check that all 4 required parameters are provided:
   - RequestID (Parameter 1)
   - Action (Parameter 2)
   - NewValue (Parameter 5)
   - ActorEmail (Parameter 6)
2. Verify parameters aren't blank: `!IsBlank(User().Email)`
3. Convert IDs to text: `Text(ThisItem.ID)` not `ThisItem.ID`

---

### Issue 3: Actor Field Not Resolving

**Symptoms:**
- Actor field shows as text in AuditLog, not as Person field
- Can't see user's display name in audit entries
- Email appears instead of user name

**Fix:**
1. Ensure ActorEmail parameter contains valid email: `User().Email`
2. Check user exists in SharePoint site's people picker
3. Verify **Actor** field type in AuditLog is **Person or Group** (not Single line of text)
4. SharePoint auto-resolves emails to Person fields (may take 1-2 minutes)
5. Verify the email address is formatted correctly (lowercase, valid domain)

---

### Issue 4: Flow Times Out in Power Apps

**Symptoms:**
- Long wait in Power Apps after calling flow
- Eventually shows timeout error

**Fix:**
1. Check retry policies in flow aren't too aggressive
2. Verify SharePoint site is accessible from flow
3. Test flow directly in Power Automate → **Test** → Manual trigger
4. Consider increasing Power Apps timeout: `'PR-Action: Log action'.Run(...); Timeout: 60`

---

### Issue 5: JSON Response Not Parsing

**Symptoms:**
- Can't access `varFlowResult.success` or `.auditId`
- Type errors when referencing response properties

**Fix:**
1. Verify "Respond to PowerApp or flow" action includes JSON in "Enter a value to respond"
2. Check JSON syntax is valid (no missing commas, quotes)
3. Ensure action names in expressions match exactly: `Create_Audit_Log_Entry` vs `Create Audit Log Entry`
4. Test response structure: `Notify(JSON(varFlowResult, JSONFormat.IndentFour))`
