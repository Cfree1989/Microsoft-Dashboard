# Flow C — PR-Action: Log action (called from Power Apps)

**Type:** Instant cloud flow (triggered from Power Apps)

**Purpose:** When staff press buttons in the Power Apps staff console (e.g., Approve, Reject), log that action with proper actor attribution and comprehensive audit details.

---

## Error Handling Configuration

**Configure retry policies on all critical actions:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 30 seconds
- **Apply to:** Get item, Create item (AuditLog)

---

## Trigger Inputs (from Power Apps)

Configure these input parameters when creating the instant flow:

- **RequestID** (Text) - **Required** - The ID of the request being modified
- **Action** (Text) - **Required** - The action being performed (e.g., "Status Change", "Approved", "Rejected")
- **FieldName** (Text) - **Required** - The field being changed (e.g., "Status", "Priority", "StaffNotes")
- **OldValue** (Text) - **Optional** - Previous value of the field
- **NewValue** (Text) - **Required** - New value of the field
- **ActorEmail** (Text) - **Required** - Email of the staff member performing the action
- **ClientApp** (Text) - **Default: "Power Apps"** - Source application
- **Notes** (Text) - **Optional** - Additional context or notes

---

## Step-by-Step Implementation

### Step 1: Flow Creation Setup

**UI steps:**
1. Go to **Power Automate** → **Create** → **Instant cloud flow**
2. Name: `PR-Action: Log action`
3. Choose trigger: **Power Apps**
4. Skip the "Choose how to trigger this flow" step (Power Apps trigger will be added automatically)
5. Click **Create**

### Step 2: Add Input Parameters

**What this does:** Defines the data that Power Apps will send to the flow when triggered.

**UI steps:**
1. In the **Power Apps** trigger card, click **Add an input**
2. For each parameter below, select **Text** and fill in the details:

**Parameter 1: RequestID**
- **Input type:** Text
- **Input name:** `RequestID`
- **Please enter description:** `The ID of the request being modified`
- Mark as **Required**

**Parameter 2: Action**
- **Input type:** Text
- **Input name:** `Action`
- **Please enter description:** `The action being performed (e.g., Status Change)`
- Mark as **Required**

**Parameter 3: FieldName**
- **Input type:** Text
- **Input name:** `FieldName`
- **Please enter description:** `The field being changed (e.g., Status)`
- Mark as **Required**

**Parameter 4: OldValue**
- **Input type:** Text
- **Input name:** `OldValue`
- **Please enter description:** `Previous value of the field`
- Leave as **Optional**

**Parameter 5: NewValue**
- **Input type:** Text
- **Input name:** `NewValue`
- **Please enter description:** `New value of the field`
- Mark as **Required**

**Parameter 6: ActorEmail**
- **Input type:** Text
- **Input name:** `ActorEmail`
- **Please enter description:** `Email of the staff member performing the action`
- Mark as **Required**

**Parameter 7: ClientApp**
- **Input type:** Text
- **Input name:** `ClientApp`
- **Please enter description:** `Source application (Power Apps)`
- Leave as **Optional** with default value

**Parameter 8: Notes**
- **Input type:** Text
- **Input name:** `Notes`
- **Please enter description:** `Additional context or notes`
- Leave as **Optional**

### Step 3: Get Request Item

**What this does:** Retrieves the ReqKey and validates the item exists before logging the action.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Request Item`
   - Click the **three dots (…)** → **Rename** → type `Get Request Item`
4. **Configure retry policy** (see instructions at top)
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **RequestID** (from Power Apps trigger)

### Step 4: Input Validation

**What this does:** Ensures all required parameters are provided before attempting to log the action.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Validate Required Inputs`
   - Click the **three dots (…)** → **Rename** → type `Validate Required Inputs`
4. Set up condition:
   - Left box: Click **Expression** tab (fx) and paste:
   ```
   and(not(empty(triggerBody()['text'])), not(empty(triggerBody()['text_1'])), not(empty(triggerBody()['text_4'])), not(empty(triggerBody()['text_5'])))
   ```
   - Click **Update**
   - Middle: **is equal to**
   - Right box: `true`

**Alternative if Expression tab not available:**
1. First add a **Compose** action before the Condition
2. Rename to: `Are Inputs Present`
3. In **Inputs**, paste the expression above
4. In the Condition, compare **Outputs** of `Are Inputs Present` **is equal to** `true`

*This validation ensures RequestID, Action, NewValue, and ActorEmail are provided.*

### Step 5: Log Action to Audit Trail

#### Step 5a: Yes Branch - Create Audit Entry

**What this does:** Creates a detailed audit log entry when all required inputs are present.

**UI steps:**
1. Click **+ Add an action** in the **Yes** branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Create Audit Log Entry`
   - Click the **three dots (…)** → **Rename** → type `Create Audit Log Entry`
4. **Configure retry policy** (see instructions at top)
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** **Expression** → `concat('Staff Action: ', triggerBody()['text_1'])`
   - **RequestID:** **Dynamic content** → **RequestID** (from Power Apps trigger)
   - **ReqKey:** **Dynamic content** → **ReqKey** (from Get Request Item)
   - **Action Value:** **Dynamic content** → **Action** (from Power Apps trigger)
   - **FieldName:** **Dynamic content** → **FieldName** (from Power Apps trigger)
   - **OldValue:** **Dynamic content** → **OldValue** (from Power Apps trigger)
   - **NewValue:** **Dynamic content** → **NewValue** (from Power Apps trigger)
   - **Actor Claims:** **Dynamic content** → **ActorEmail** (from Power Apps trigger - SharePoint will resolve to person)
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** **Dynamic content** → **ClientApp** (from Power Apps trigger)
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** **Expression** → `if(empty(triggerBody()['text_7']), concat('Action performed by staff via Power Apps: ', triggerBody()['text_1']), triggerBody()['text_7'])`

#### Step 5b: Send Success Response

**What this does:** Sends a structured response back to Power Apps indicating successful logging.

**UI steps:**
1. Click **+ Add an action** in the **Yes** branch
2. Search for and select **Respond to a PowerApp or flow**
3. Rename the action to: `Send Success Response`
   - Click the **three dots (…)** → **Rename** → type `Send Success Response`
4. In the **Response** field, click **Expression** tab (fx) and paste:
```json
{
  "success": true,
  "message": "Action logged successfully",
  "auditId": "@{outputs('Create_Audit_Log_Entry')?['body/ID']}",
  "timestamp": "@{utcNow()}"
}
```
5. Click **Update**

#### Step 5c: No Branch - Send Error Response

**What this does:** Sends an error response when required parameters are missing.

**UI steps:**
1. Click **+ Add an action** in the **No** branch
2. Search for and select **Respond to a PowerApp or flow**
3. Rename the action to: `Send Error Response`
   - Click the **three dots (…)** → **Rename** → type `Send Error Response`
4. In the **Response** field, click **Expression** tab (fx) and paste:
```json
{
  "success": false,
  "message": "Missing required parameters: RequestID, Action, NewValue, or ActorEmail",
  "timestamp": "@{utcNow()}"
}
```
5. Click **Update**

---

## Power Apps Connection Setup

### Step 6: Adding the Flow to Power Apps

**What this does:** Connects the flow to your Power Apps application for use in button actions.

**UI steps:**
1. In Power Apps Studio, go to **Data** → **Add data**
2. Search for "Power Automate" and select it
3. Find your "PR-Action: Log action" flow and add it
4. The flow will appear in your app's data sources as `'PR-Action: Log action'`

**Connection Notes:**
- The instant flow trigger automatically creates the required input parameters
- Power Apps will show these parameters when you call the flow
- Ensure all required parameters are mapped correctly in your Power Apps formulas
- Test the connection by calling the flow from a button with sample data

---

## Power Apps Integration

### Enhanced Error Handling Pattern

Use this pattern in Power Apps for robust error handling:

```powerfx
// Store flow result
Set(varFlowResult,
    IfError(
        'PR-Action: Log action'.Run(
            Text(ThisItem.ID),                    // RequestID
            "Status Change",                      // Action
            "Status",                            // FieldName  
            ThisItem.Status,                     // OldValue
            "Ready to Print",                    // NewValue
            varMeEmail,                          // ActorEmail
            "Power Apps",                        // ClientApp
            "Approved via Staff Dashboard"       // Notes
        ),
        {success: false, message: FirstError.Message}  // Error fallback
    )
);

// Handle response
If(varFlowResult.success,
    Notify("Action logged successfully. Audit ID: " & varFlowResult.auditId, NotificationType.Success),
    Notify("Failed to log action: " & varFlowResult.message, NotificationType.Error)
);
```

### Validation in Power Apps

Add this validation before calling the flow:

```powerfx
// Validate required parameters
Set(varValidationErrors, "");

If(IsBlank(ThisItem.ID), 
    Set(varValidationErrors, varValidationErrors & "Item ID is required. "));
If(IsBlank(varMeEmail), 
    Set(varValidationErrors, varValidationErrors & "Staff email is required. "));

// Only call flow if validation passes
If(IsBlank(varValidationErrors),
    // Call flow here
    Set(varFlowResult, 'PR-Action: Log action'.Run(...)),
    // Show validation error
    Notify("Validation failed: " & varValidationErrors, NotificationType.Error)
);
```

---

## Key Features Added

✅ **Input Validation** - Ensures required parameters are provided  
✅ **Enhanced Error Handling** - Exponential retry policies on all actions  
✅ **Structured Responses** - JSON responses with success/failure details  
✅ **Comprehensive Audit Fields** - Includes all required audit information  
✅ **Flexible Notes Handling** - Auto-generates notes if not provided  
✅ **Power Apps Integration Guide** - Complete error handling patterns  
✅ **Validation Helpers** - Pre-flight checks in Power Apps  

---

## Error Handling Notes

- **Item Validation:** Ensures PrintRequests item exists before logging
- **Parameter Validation:** Required fields checked before processing
- **Structured Responses:** Success/failure clearly indicated to Power Apps
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint
- **Person Field Resolution:** ActorEmail automatically resolves to Person field

---

## Testing Checklist

- [ ] Flow responds with validation error when required parameters missing
- [ ] AuditLog entry created with all required fields populated
- [ ] Actor field correctly resolves from provided email address
- [ ] Success response includes audit entry ID
- [ ] Retry policies trigger on simulated SharePoint failures
- [ ] Power Apps error handling displays appropriate notifications
- [ ] FlowRunId and ActionAt timestamps populated correctly
- [ ] Notes field handles both provided and auto-generated content

---

## Common Use Cases

### Approval Actions
```powerfx
'PR-Action: Log action'.Run(
    Text(ThisItem.ID),
    "Approved", 
    "Status",
    ThisItem.Status,
    "Ready to Print",
    ddStaffSelection.Selected.Member.Email,
    "Power Apps",
    "Request approved with cost estimate: $" & Text(varCalculatedCost, "[$-en-US]#,##0.00")
)
```

### Rejection Actions
```powerfx
'PR-Action: Log action'.Run(
    Text(ThisItem.ID),
    "Rejected",
    "Status", 
    ThisItem.Status,
    "Rejected",
    ddStaffSelection.Selected.Member.Email,
    "Power Apps",
    "Request rejected. Reasons: " & varRejectionReasons & txtCustomReason.Text
)
```

### Field Updates
```powerfx
'PR-Action: Log action'.Run(
    Text(ThisItem.ID),
    "Field Updated",
    "StaffNotes",
    ThisItem.StaffNotes,
    txtStaffNotes.Text,
    User().Email,
    "Power Apps",
    "Staff notes updated"
)
```
