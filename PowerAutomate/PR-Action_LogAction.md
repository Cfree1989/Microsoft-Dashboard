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

### Flow Creation Setup

1. **Create → Instant cloud flow**
   - Name: `PR-Action: Log action`
   - Trigger: **Power Apps**
   - Skip the "Choose how to trigger this flow" step (Power Apps trigger will be added automatically)

### 2. **Add input parameters** from Power Apps trigger

Click **Add an input** for each of the following parameters defined above in the Trigger Inputs section. Power Automate will create these automatically when you add them:

- **RequestID** (Text) → "The ID of the request being modified"
- **Action** (Text) → "The action being performed (e.g., Status Change)"
- **FieldName** (Text) → "The field being changed (e.g., Status)"
- **OldValue** (Text) → "Previous value of the field"
- **NewValue** (Text) → "New value of the field"
- **ActorEmail** (Text) → "Email of the staff member performing the action"
- **ClientApp** (Text) → "Source application (Power Apps)"
- **Notes** (Text) → "Additional context or notes"

### 3. **Get item** (SharePoint) - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **List Name:** `PrintRequests`
- **Id:** `RequestID` (from Power Apps trigger input)

*This retrieves the ReqKey and validates the item exists before logging.*

### 4. **Condition: Validate Required Inputs**
- **Choose a value:** 
```
@{and(not(empty(triggerBody()['text'])), not(empty(triggerBody()['text_1'])), not(empty(triggerBody()['text_4'])), not(empty(triggerBody()['text_5'])))}
```
- **Condition:** is equal to
- **Choose a value:** `true`

*This ensures RequestID, Action, NewValue, and ActorEmail are provided.*

**Beginner UI steps — where to paste this in Power Automate:**
1. Add a **Condition** action after the **Get item** step.
2. Click the first left box labeled **Choose a value** to open the side panel.
3. Switch to the **Expression** tab (fx) at the top of the panel.
4. Paste the whole expression above and click **Update**.
5. Set the middle dropdown to **is equal to**.
6. In the right box, type `true` (without quotes).
7. Click **Save** on the flow.

If you cannot reach the Expression tab, add a **Compose** action named `Are Inputs Present` and paste the expression into **Inputs**. Then set the Condition to compare `Outputs` of `Are Inputs Present` **is equal to** `true`.

### 5. **Yes Branch - Create item** in `AuditLog` - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** same
- **List Name:** `AuditLog`
- **Title:**
```
@{concat('Staff Action: ', triggerBody()['text_1'])}
```
- **RequestID:** `RequestID` (from Power Apps trigger input)
- **ReqKey:** `ReqKey` (from Get item step)
- **Action Value:** `Action` (from Power Apps trigger input)
- **FieldName:** `FieldName` (from Power Apps trigger input)
- **OldValue:** `OldValue` (from Power Apps trigger input)
- **NewValue:** `NewValue` (from Power Apps trigger input)
- **Actor Claims:** `ActorEmail` (from Power Apps trigger input - SharePoint resolves to person)
- **ActorRole Value:** `Staff`
- **ClientApp Value:** `ClientApp` (from Power Apps trigger input)
- **ActionAt:**
```
@{utcNow()}
```
- **FlowRunId:**
```
@{workflow()['run']['name']}
```
- **Notes:** 
```
@{if(empty(triggerBody()['text_7']), concat('Action performed by staff via Power Apps: ', triggerBody()['text_1']), triggerBody()['text_7'])}
```

### 6. **Respond to a PowerApp or flow** - Success Response
- **Response:** 
```json
{
  "success": true,
  "message": "Action logged successfully",
  "auditId": "@{outputs('Create_item')?['body/ID']}",
  "timestamp": "@{utcNow()}"
}
```

### 7. **No Branch - Respond to PowerApp** - Error Response
- **Response:**
```json
{
  "success": false,
  "message": "Missing required parameters: RequestID, Action, NewValue, or ActorEmail",
  "timestamp": "@{utcNow()}"
}
```

---

## Power Apps Connection Setup

### Adding the Flow to Your Power Apps
1. In Power Apps Studio, go to **Data** → **Add data**
2. Search for "Power Automate" and select it
3. Find your "PR-Action: Log action" flow and add it
4. The flow will appear in your app's data sources as `'PR-Action: Log action'`

### Flow Trigger Management
- The instant flow trigger automatically creates the required input parameters
- Power Apps will show these parameters when you call the flow
- Ensure all required parameters are mapped correctly in your Power Apps formulas

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
