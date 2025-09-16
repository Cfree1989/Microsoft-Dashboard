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

### 1. **Get item** (SharePoint) - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **List Name:** `PrintRequests`
- **Id:** `RequestID` (from Power Apps trigger input)

*This retrieves the ReqKey and validates the item exists before logging.*

### 2. **Condition: Validate Required Inputs**
- **Choose a value:** 
```javascript
@{and(not(empty(triggerBody()['text'])), not(empty(triggerBody()['text_1'])), not(empty(triggerBody()['text_4'])), not(empty(triggerBody()['text_5'])))}
```
- **Condition:** is equal to
- **Choose a value:** `true`

*This ensures RequestID, Action, NewValue, and ActorEmail are provided.*

### 3. **Yes Branch - Create item** in `AuditLog` - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** same
- **List Name:** `AuditLog`
- **Title:**
```javascript
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
```javascript
@{utcNow()}
```
- **FlowRunId:**
```javascript
@{workflow()['run']['name']}
```
- **Notes:** 
```javascript
@{if(empty(triggerBody()['text_7']), concat('Action performed by staff via Power Apps: ', triggerBody()['text_1']), triggerBody()['text_7'])}
```

### 4. **Respond to a PowerApp or flow** - Success Response
- **Response:** 
```json
{
  "success": true,
  "message": "Action logged successfully",
  "auditId": "@{outputs('Create_item')?['body/ID']}",
  "timestamp": "@{utcNow()}"
}
```

### 5. **No Branch - Respond to PowerApp** - Error Response
- **Response:**
```json
{
  "success": false,
  "message": "Missing required parameters: RequestID, Action, NewValue, or ActorEmail",
  "timestamp": "@{utcNow()}"
}
```

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
