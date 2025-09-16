# Flow B — PR-Audit: Log changes + Email notifications

**Trigger:** SharePoint — When an item is **created or modified** (List: `PrintRequests`)

**Purpose:** Whenever a request is modified, record which fields changed in `AuditLog` and send automated emails for key status changes.

---

## Error Handling Configuration

**Configure retry policies on all critical actions:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 1 minute
- **Apply to:** Create item (AuditLog), Send email actions
- **Concurrency Control:** Set to 1 for strictly ordered audit logs

---

## Step-by-Step Implementation

### 1. **Get changes for an item or a file (properties only)**
- **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **List Name:** `PrintRequests`
- **Id:** `ID` (from trigger)
- **Since:** **Trigger Window Start Token** (from dynamic content)

*This compares current values to those at flow start time, preventing infinite loops.*

### 2. **Parallel Condition Branches for Field Changes**

Add **Condition** blocks using **Has Column Changed** outputs:

#### **Status Change Condition**
- **Choose a value:** `Has Column Changed: Status` (from Get changes output)
- **Condition:** is equal to
- **Choose a value:** `true`

**Yes Branch:**
- **Create item** in `AuditLog` - **Configure Retry Policy: Exponential, 4 retries**
  - **Site Address:** same
  - **List Name:** `AuditLog`
  - **Title:** `Status Change`
  - **RequestID:** `@{triggerOutputs()?['body/ID']}`
  - **ReqKey:** `@{triggerOutputs()?['body/ReqKey']}`
  - **Action Value:** `Status Change`
  - **FieldName:** `Status`
  - **OldValue:** (leave blank for MVP)
  - **NewValue:** `@{triggerOutputs()?['body/Status']}`
  - **Actor Claims:** `Editor Claims` (from trigger)
  - **ActorRole Value:** `Staff`
  - **ClientApp Value:** `SharePoint Form`
  - **ActionAt:** `@{utcNow()}`
  - **FlowRunId:** `@{workflow()['run']['name']}`
  - **Notes:** `Status updated from previous value to @{triggerOutputs()?['body/Status']}`

#### **Additional Field Change Conditions** (Create parallel branches for each):

**AssignedTo Change:**
- Condition: `Has Column Changed: AssignedTo` = true
- AuditLog: FieldName = `AssignedTo`, NewValue = `@{triggerOutputs()?['body/AssignedTo/DisplayName']}`

**Priority Change:**
- Condition: `Has Column Changed: Priority` = true  
- AuditLog: FieldName = `Priority`, NewValue = `@{triggerOutputs()?['body/Priority']}`

**Method Change:**
- Condition: `Has Column Changed: Method` = true
- AuditLog: FieldName = `Method`, NewValue = `@{triggerOutputs()?['body/Method']}`

**PrinterSelection Change:**
- Condition: `Has Column Changed: PrinterSelection` = true
- AuditLog: FieldName = `PrinterSelection`, NewValue = `@{triggerOutputs()?['body/PrinterSelection']}`

**EstimatedTime Change:**
- Condition: `Has Column Changed: EstimatedTime` = true
- AuditLog: FieldName = `EstimatedTime`, NewValue = `@{triggerOutputs()?['body/EstimatedTime']}`

**EstimatedWeight Change:**
- Condition: `Has Column Changed: EstimatedWeight` = true
- AuditLog: FieldName = `EstimatedWeight`, NewValue = `@{triggerOutputs()?['body/EstimatedWeight']}`

**EstimatedCost Change:**
- Condition: `Has Column Changed: EstimatedCost` = true
- AuditLog: FieldName = `EstimatedCost`, NewValue = `@{triggerOutputs()?['body/EstimatedCost']}`

**StaffNotes Change:**
- Condition: `Has Column Changed: StaffNotes` = true
- AuditLog: FieldName = `StaffNotes`, NewValue = `@{triggerOutputs()?['body/StaffNotes']}`

### 3. **Status-Based Email Logic** (Inside Status Change "Yes" branch)

#### **Nested Condition: "Check Status = Rejected"**
- **Choose a value:** `@{triggerOutputs()?['body/Status']}`
- **Condition:** is equal to
- **Choose a value:** `Rejected`

**Yes Branch - Send Rejection Email:**
- **Send an email from a shared mailbox (V2)** - **Configure Retry Policy: Exponential, 4 retries**
  - **Shared Mailbox:** `coad-Fabrication Lab@lsu.edu`
  - **To:** `@{triggerOutputs()?['body/StudentEmail']}`
  - **Subject:**
  ```
  Your 3D Print request has been rejected – @{triggerOutputs()?['body/ReqKey']}
  ```
  - **Body:**
  ```html
  <p>Unfortunately, your 3D Print request has been rejected by our staff.</p>
  <p><strong>Request:</strong> @{triggerOutputs()?['body/Title']} (@{triggerOutputs()?['body/ReqKey']})</p>
  <p><strong>Method:</strong> @{triggerOutputs()?['body/Method']}</p>
  <p><strong>Printer Requested:</strong> @{triggerOutputs()?['body/PrinterSelection']}</p>
  <br>
  <p><strong>Reason for Rejection:</strong></p>
  <p>Please check the staff notes in your request for specific details about why your request was rejected.</p>
  <br>
  <p><strong>Next Steps:</strong></p>
  <ul>
    <li>Review the feedback provided in staff notes</li>
    <li>Make necessary adjustments to your design or request</li>
    <li>Submit a new corrected request through the Fabrication Lab website</li>
    <li>Contact our staff if you have questions about the feedback</li>
  </ul>
  <br>
  <p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
  <p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
  <br>
  <p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
  ```

- **Create item** in `AuditLog` (Email Sent - Rejection) - **Configure Retry Policy: Exponential, 4 retries**
  - **Title:** `Email Sent: Rejection`
  - **RequestID:** `@{triggerOutputs()?['body/ID']}`
  - **ReqKey:** `@{triggerOutputs()?['body/ReqKey']}`
  - **Action Value:** `Email Sent`
  - **FieldName:** `StudentEmail`
  - **NewValue:** `@{triggerOutputs()?['body/StudentEmail']}`
  - **Actor Claims:** (leave blank for system)
  - **ActorRole Value:** `System`
  - **ClientApp Value:** `Power Automate`
  - **ActionAt:** `@{utcNow()}`
  - **FlowRunId:** `@{workflow()['run']['name']}`
  - **Notes:** `Rejection notification sent to student`

#### **Parallel Nested Condition: "Check Status = Completed"**
- **Choose a value:** `@{triggerOutputs()?['body/Status']}`
- **Condition:** is equal to
- **Choose a value:** `Completed`

**Yes Branch - Send Completion Email:**
- **Send an email from a shared mailbox (V2)** - **Configure Retry Policy: Exponential, 4 retries**
  - **Shared Mailbox:** `coad-Fabrication Lab@lsu.edu`
  - **To:** `@{triggerOutputs()?['body/StudentEmail']}`
  - **Subject:**
  ```
  Your 3D print is ready for pickup – @{triggerOutputs()?['body/ReqKey']}
  ```
  - **Body:**
  ```html
  <p>Great news! Your 3D print is completed and ready for pickup.</p>
  <p><strong>Request:</strong> @{triggerOutputs()?['body/Title']} (@{triggerOutputs()?['body/ReqKey']})</p>
  <p><strong>Method:</strong> @{triggerOutputs()?['body/Method']}</p>
  <p><strong>Printer Used:</strong> @{triggerOutputs()?['body/PrinterSelection']}</p>
  <p><strong>Color:</strong> @{triggerOutputs()?['body/Color']}</p>
  @{if(not(empty(triggerOutputs()?['body/EstimatedWeight'])), concat('<p><strong>Estimated Weight:</strong> ', string(triggerOutputs()?['body/EstimatedWeight']), 'g</p>'), '')}
  @{if(not(empty(triggerOutputs()?['body/EstimatedTime'])), concat('<p><strong>Print Time:</strong> ', string(triggerOutputs()?['body/EstimatedTime']), ' hours</p>'), '')}
  @{if(not(empty(triggerOutputs()?['body/EstimatedCost'])), concat('<p><strong>Estimated Cost:</strong> $', string(triggerOutputs()?['body/EstimatedCost'])), '')}
  <br>
  <p><strong>Next Steps:</strong></p>
  <ul>
    <li>Visit the Digital Fabrication Lab to pay and collect your print</li>
    <li>Payment will be calculated based on actual material used</li>
    <li>Bring your student ID for verification</li>
    <li>Lab hours: Monday-Friday 9AM-5PM, Saturday 10AM-2PM</li>
    <li>Location: Design Building, Room 101</li>
  </ul>
  <br>
  <p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
  <p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
  <br>
  <p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
  ```

- **Create item** in `AuditLog` (Email Sent - Completion) - **Configure Retry Policy: Exponential, 4 retries**
  - **Title:** `Email Sent: Completion`
  - **RequestID:** `@{triggerOutputs()?['body/ID']}`
  - **ReqKey:** `@{triggerOutputs()?['body/ReqKey']}`
  - **Action Value:** `Email Sent`
  - **FieldName:** `StudentEmail`
  - **NewValue:** `@{triggerOutputs()?['body/StudentEmail']}`
  - **Actor Claims:** (leave blank for system)
  - **ActorRole Value:** `System`
  - **ClientApp Value:** `Power Automate`
  - **ActionAt:** `@{utcNow()}`
  - **FlowRunId:** `@{workflow()['run']['name']}`
  - **Notes:** `Completion notification sent to student`

#### **Additional Status Email Conditions** (Optional Enhancement)

**Parallel Nested Condition: "Check Status = Ready to Print"**
- Sends approval notification with cost estimates when status changes to "Ready to Print"

**Parallel Nested Condition: "Check Status = Printing"**
- Sends "printing started" notification to keep students informed

### 4. **Attachments Change Detection** (Optional)

**Condition:** `Has Column Changed: Attachments` = true

**Yes Branch:**
- **Get attachments** action
- **Apply to each** attachment:
  - **Create item** in `AuditLog`
    - **Action Value:** `File Added`
    - **FieldName:** `Attachments`
    - **NewValue:** `@{items('Apply_to_each')?['DisplayName']}`
    - **Notes:** `New file attachment: @{items('Apply_to_each')?['DisplayName']}`

---

## Key Features Added

✅ **Complete Email Audit Logging** - All sent emails logged to AuditLog  
✅ **Enhanced Email Content** - Rich HTML with detailed information and cost estimates  
✅ **Comprehensive Field Tracking** - All important field changes logged  
✅ **Error Handling** - Exponential retry policies on all critical actions  
✅ **Concurrency Control** - Prevents race conditions in audit logging  
✅ **Dynamic Email Content** - Shows cost/time estimates when available  
✅ **Professional Communication** - Detailed pickup instructions and lab info  

---

## Error Handling Notes

- **Concurrency Control:** Set to 1 to ensure audit logs are created in order
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Field Resolution:** Handles empty/null values gracefully
- **Infinite Loop Prevention:** Uses Trigger Window Start Token

---

## Testing Checklist

- [ ] Field changes create appropriate AuditLog entries
- [ ] Status change to "Rejected" sends rejection email + audit log
- [ ] Status change to "Completed" sends completion email + audit log  
- [ ] All changed fields logged with correct FieldName and NewValue
- [ ] Email audit entries include proper System actor and timestamps
- [ ] No duplicate emails sent during multi-field updates
- [ ] Retry policies trigger on simulated failures
- [ ] Cost estimates display correctly in completion emails
- [ ] Attachment changes logged properly (if implemented)
