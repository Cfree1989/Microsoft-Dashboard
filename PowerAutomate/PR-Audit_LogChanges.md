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

### Flow Creation Setup

1. **Create → Automated cloud flow**
   - Name: `PR-Audit: Log changes + Email notifications`
   - Trigger: **SharePoint – When an item is created or modified**
   - **Site Address**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name**: `PrintRequests`

### Step 2: Get Changes for Item

**What this does:** Retrieves what fields changed since the flow started, preventing infinite loops.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Get changes for an item or a file (properties only)** (SharePoint)
3. Rename the action to: `Get Item Changes`
   - Click the **three dots (…)** → **Rename** → type `Get Item Changes`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)
   - **Since:** **Dynamic content** → **Trigger Window Start Token** (from trigger)

*This compares current values to those at flow start time, preventing infinite loops.*

### Step 3: Parallel Field Change Detection

**What this does:** Creates separate condition branches that run in parallel to detect changes to specific fields and log them appropriately.

**Implementation approach:** Add multiple **Condition** actions at the same level (not nested) to create parallel branches.

#### Step 3a: Status Change Detection

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Changed`
   - Click the **three dots (…)** → **Rename** → type `Check Status Changed`
4. Set up condition:
   - Left box: **Dynamic content** → **Has Column Changed: Status** (from Get Item Changes)
   - Middle: **is equal to**
   - Right box: `true`

##### Yes Branch - Log Status Change:

**Action 1: Log status change**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Status Change`
   - Click the **three dots (…)** → **Rename** → type `Log Status Change`
4. **Configure retry policy** (see instructions at top)
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Status Change`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **ReqKey** (from trigger)
   - **Action Value:** Type `Status Change`
   - **FieldName:** Type `Status`
   - **OldValue:** Leave blank for MVP
   - **NewValue:** **Dynamic content** → **Status** (from trigger)
   - **Actor Claims:** **Dynamic content** → **Editor Claims** (from trigger)
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** **Expression** → `concat('Status updated from previous value to ', triggerOutputs()?['body/Status'])`

#### Step 3b: Additional Field Change Detection

**Create parallel conditions for each field following the same pattern as Step 3a:**

**AssignedTo Change Detection:**
1. Add **Condition** → Rename to: `Check AssignedTo Changed`
2. Condition: **Has Column Changed: AssignedTo** = true
3. Yes Branch: Add **Create item** → Rename to: `Log AssignedTo Change`
4. AuditLog fields: FieldName = `AssignedTo`, NewValue = **Expression** → `triggerOutputs()?['body/AssignedTo/DisplayName']`

**Priority Change Detection:**
1. Add **Condition** → Rename to: `Check Priority Changed`
2. Condition: **Has Column Changed: Priority** = true
3. Yes Branch: Add **Create item** → Rename to: `Log Priority Change`
4. AuditLog fields: FieldName = `Priority`, NewValue = **Dynamic content** → **Priority**

**Method Change Detection:**
1. Add **Condition** → Rename to: `Check Method Changed`
2. Condition: **Has Column Changed: Method** = true
3. Yes Branch: Add **Create item** → Rename to: `Log Method Change`
4. AuditLog fields: FieldName = `Method`, NewValue = **Dynamic content** → **Method**

**PrinterSelection Change Detection:**
1. Add **Condition** → Rename to: `Check PrinterSelection Changed`
2. Condition: **Has Column Changed: PrinterSelection** = true
3. Yes Branch: Add **Create item** → Rename to: `Log PrinterSelection Change`
4. AuditLog fields: FieldName = `PrinterSelection`, NewValue = **Dynamic content** → **PrinterSelection**

**EstimatedTime Change Detection:**
1. Add **Condition** → Rename to: `Check EstimatedTime Changed`
2. Condition: **Has Column Changed: EstimatedTime** = true
3. Yes Branch: Add **Create item** → Rename to: `Log EstimatedTime Change`
4. AuditLog fields: FieldName = `EstimatedTime`, NewValue = **Dynamic content** → **EstimatedTime**

**EstimatedWeight Change Detection:**
1. Add **Condition** → Rename to: `Check EstimatedWeight Changed`
2. Condition: **Has Column Changed: EstimatedWeight** = true
3. Yes Branch: Add **Create item** → Rename to: `Log EstimatedWeight Change`
4. AuditLog fields: FieldName = `EstimatedWeight`, NewValue = **Dynamic content** → **EstimatedWeight**

**EstimatedCost Change Detection:**
1. Add **Condition** → Rename to: `Check EstimatedCost Changed`
2. Condition: **Has Column Changed: EstimatedCost** = true
3. Yes Branch: Add **Create item** → Rename to: `Log EstimatedCost Change`
4. AuditLog fields: FieldName = `EstimatedCost`, NewValue = **Dynamic content** → **EstimatedCost**

**StaffNotes Change Detection:**
1. Add **Condition** → Rename to: `Check StaffNotes Changed`
2. Condition: **Has Column Changed: StaffNotes** = true
3. Yes Branch: Add **Create item** → Rename to: `Log StaffNotes Change`
4. AuditLog fields: FieldName = `StaffNotes`, NewValue = **Dynamic content** → **StaffNotes**

**How to build parallel field change conditions:**
1. Add a **Condition** action at the root level
2. Rename with descriptive name (e.g., "Check [FieldName] Changed")
3. Click the left **Choose a value** box
4. In **Dynamic content** tab, search for "Has Column Changed"
5. Pick the specific field (e.g., **Has Column Changed: Priority**)
6. Set middle dropdown to **is equal to**
7. In right box, type `true` (without quotes)
8. In **Yes** branch, add **Create item** action with descriptive rename
9. Configure all AuditLog fields consistently
10. **Configure retry policy** on the Create item action
11. Repeat for each field, adding conditions at the same level for parallelism

### Step 4: Status-Based Email Notifications

**What this does:** Inside the "Check Status Changed" Yes branch, add nested conditions to send emails when status changes to specific values.

#### Step 4a: Rejection Email Logic

**UI steps (inside the Status Change Yes branch):**
1. Click **+ Add an action** in the Status Change Yes branch
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Rejected`
   - Click the **three dots (…)** → **Rename** → type `Check Status Rejected`
4. Set up condition:
   - Left box: **Dynamic content** → **Status** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Rejected`

##### Yes Branch - Send Rejection Email:

**Action 1: Send rejection email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Rejection Email`
   - Click the **three dots (…)** → **Rename** → type `Send Rejection Email`
4. **Configure retry policy**
5. Fill in:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Dynamic content** → **StudentEmail** (from trigger)
   - **Subject:** **Expression** → `concat('Your 3D Print request has been rejected – ', triggerOutputs()?['body/ReqKey'])`
   - **Body:** Use **Dynamic content** and **Expressions** to build this HTML:
```html
<p>Unfortunately, your 3D Print request has been rejected by our staff.</p>
<p><strong>Request:</strong> [Dynamic content: Title] ([Dynamic content: ReqKey])</p>
<p><strong>Method:</strong> [Dynamic content: Method]</p>
<p><strong>Printer Requested:</strong> [Dynamic content: PrinterSelection]</p>
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
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=[Dynamic content: ID]">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 2: Log rejection email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Rejection Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Rejection Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Rejection`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **ReqKey** (from trigger)
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from trigger)
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Rejection notification sent to student`

#### Step 4b: Pending (Estimate) Email Logic

**UI steps (create parallel to the Rejection condition):**
1. Click **+ Add an action** at the same level as the Rejection condition
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Pending`
   - Click the **three dots (…)** → **Rename** → type `Check Status Pending`
4. Set up condition:
   - Left box: **Dynamic content** → **Status** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Pending`

##### Yes Branch - Send Estimate Email:

**Action 1: Send estimate email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Estimate Email`
   - Click the **three dots (…)** → **Rename** → type `Send Estimate Email`
4. **Configure retry policy**
5. Fill in:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Dynamic content** → **StudentEmail** (from trigger)
   - **Subject:** **Expression** → `concat('Estimate ready for your 3D print – ', triggerOutputs()?['body/ReqKey'])`
   - **Body:** Use **Dynamic content** and **Expressions** to build this HTML:
```html
<p>Good news! Your 3D print request has been reviewed and approved.</p>
<p><strong>Request:</strong> [Dynamic content: Title] ([Dynamic content: ReqKey])</p>
<p><strong>Method:</strong> [Dynamic content: Method] ([Dynamic content: Color])</p>
<p><strong>Printer:</strong> [Dynamic content: PrinterSelection]</p>
<br>
<p><strong>COST ESTIMATE:</strong></p>
<ul>
  <li><strong>Estimated Weight:</strong> [Dynamic content: EstimatedWeight]g</li>
  <li><strong>Estimated Print Time:</strong> [Dynamic content: EstimatedTime] hours</li>
  <li><strong>Estimated Cost:</strong> $[Dynamic content: EstimatedCost]</li>
</ul>
<br>
<p><strong>Please confirm you want to proceed with this estimate:</strong></p>
<p><a href="https://prod-12.westus.logic.azure.com:443/workflows/12345678901234567890/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SIGNATURE&RequestID=[Dynamic content: ID]" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">✅ Yes, proceed with printing</a></p>
<p><em>By clicking this link, you authorize us to begin printing your request.</em></p>
<br>
<p><strong>Cost Details:</strong></p>
<ul>
  <li>Filament prints: $0.10 per gram (minimum $3.00)</li>
  <li>Resin prints: $0.20 per gram (minimum $3.00)</li>
  <li>Final cost may vary slightly based on actual material usage</li>
  <li>Payment due at pickup</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=[Dynamic content: ID]">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 2: Log estimate email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Estimate Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Estimate Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Estimate`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **ReqKey** (from trigger)
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from trigger)
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Estimate notification sent to student with confirmation link`

#### Step 4c: Completion Email Logic

**UI steps (create parallel to the Pending condition):**
1. Click **+ Add an action** at the same level as the Pending condition
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Completed`
   - Click the **three dots (…)** → **Rename** → type `Check Status Completed`
4. Set up condition:
   - Left box: **Dynamic content** → **Status** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Completed`

##### Yes Branch - Send Completion Email:

**Action 1: Send completion email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Completion Email`
   - Click the **three dots (…)** → **Rename** → type `Send Completion Email`
4. **Configure retry policy**
5. Fill in:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Dynamic content** → **StudentEmail** (from trigger)
   - **Subject:** **Expression** → `concat('Your 3D print is ready for pickup – ', triggerOutputs()?['body/ReqKey'])`
   - **Body:** Use **Dynamic content** and **Expressions** to build this HTML:
```html
<p>Great news! Your 3D print is completed and ready for pickup.</p>
<p><strong>Request:</strong> [Dynamic content: Title] ([Dynamic content: ReqKey])</p>
<p><strong>Method:</strong> [Dynamic content: Method]</p>
<p><strong>Printer Used:</strong> [Dynamic content: PrinterSelection]</p>
<p><strong>Color:</strong> [Dynamic content: Color]</p>
<p><strong>Estimated Weight:</strong> [Dynamic content: EstimatedWeight]g (if available)</p>
<p><strong>Print Time:</strong> [Dynamic content: EstimatedTime] hours (if available)</p>
<p><strong>Estimated Cost:</strong> $[Dynamic content: EstimatedCost] (if available)</p>
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
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=[Dynamic content: ID]">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Note:** For conditional fields (Weight, Time, Cost), you can use expressions to only show them when values exist, or simply use Dynamic content and they'll be blank if empty.

**Action 2: Log completion email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Completion Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Completion Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Completion`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **ReqKey** (from trigger)
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from trigger)
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Completion notification sent to student`

---

## Advanced Implementation Notes

### Person Field Resolution
If the **Actor** person field fails to resolve, use **Editor Claims** from the trigger instead of trying to resolve email addresses manually.

### Infinite Loop Prevention
This flow uses the **Trigger Window Start Token** in the "Get changes" action, which compares current values to those at flow start time, preventing infinite loops when the flow updates SharePoint items.

### Email Customization
To customize the email templates:
1. Modify the HTML in the email body sections
2. Add conditional content using Power Automate expressions like:
   ```
   @{if(not(empty(triggerOutputs()?['body/EstimatedCost'])), concat('Cost: $', string(triggerOutputs()?['body/EstimatedCost'])), 'Cost: TBD')}
   ```
3. Update lab hours and contact information in the completion email

### Shared Mailbox Setup
**Preferred Email Action:** "Send an email from a shared mailbox (V2)"
- **Shared mailbox**: `coad-Fabrication Lab@lsu.edu`
- Requires that the flow owner has "Send As" permissions on the shared mailbox

**Alternative (if shared mailbox unavailable):** "Send an email (V2)"
- Set Advanced option "From (Send as)" = `coad-Fabrication Lab@lsu.edu`
- Requires "Send As" permission configured in Exchange Admin

**How to configure retry policy on any action:**
1. Click the **three dots (…)** on the action card
2. Choose **Settings**
3. Turn **Retry Policy** to **On**
4. Configure:
   - **Type:** Select **Exponential**
   - **Count:** Set to **4**
   - **Minimum Interval:** Type **PT1M** (ISO 8601 format for 1 minute)
5. Click **Done**

**ISO 8601 Duration Format Examples:**
- 30 seconds = **PT30S**
- 1 minute = **PT1M**
- 2 minutes = **PT2M**
- 90 seconds = **PT1M30S**

### Email Template Customization Points
Update these sections in the email templates for your lab:
- **Lab hours**: Currently set to "Monday-Friday 9AM-5PM, Saturday 10AM-2PM"
- **Lab location**: Currently "Design Building, Room 101"
- **Contact information**: Update any phone numbers or additional contact methods
- **Pickup procedures**: Modify payment and ID verification requirements

#### **Additional Status Email Conditions** (Optional Enhancement)

**Parallel Nested Condition: "Check Status = Ready to Print"**
- **Choose a value:** `@{triggerOutputs()?['body/Status']}`
- **Condition:** is equal to
- **Choose a value:** `Ready to Print`
- **Yes Branch:** Send approval notification with cost estimates

**Parallel Nested Condition: "Check Status = Printing"**
- **Choose a value:** `@{triggerOutputs()?['body/Status']}`
- **Condition:** is equal to
- **Choose a value:** `Printing`
- **Yes Branch:** Send "printing started" notification to keep students informed

### Step 5: Attachments Change Detection (Optional Enhancement)

**What this does:** Logs when files are added or removed from requests.

#### Step 5a: Detect Attachment Changes

**UI steps:**
1. Add **Condition** at root level
2. Rename to: `Check Attachments Changed`
3. Condition: **Has Column Changed: Attachments** = true

#### Step 5b: Log Attachment Details

**Yes Branch actions:**

**Action 1: Get current attachments**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Get attachments** (SharePoint)
3. Rename to: `Get Current Attachments`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)

**Action 2: Log each attachment**
1. Click **+ Add an action**
2. Search for and select **Apply to each**
3. Rename to: `Log Each Attachment`
4. Select output: **Dynamic content** → **value** (from Get Current Attachments)
5. Inside the loop, add **Create item** (SharePoint)
6. Rename to: `Log Attachment Change`
7. **Configure retry policy**
8. Fill in:
   - **Site Address:** Same as above
   - **List Name:** `AuditLog`
   - **Title:** **Expression** → `concat('Attachment: ', items('Log_Each_Attachment')?['DisplayName'])`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → **ReqKey** (from trigger)
   - **Action Value:** Type `File Added`
   - **FieldName:** Type `Attachments`
   - **NewValue:** **Dynamic content** → **DisplayName** (from current item)
   - **Actor Claims:** **Dynamic content** → **Editor Claims** (from trigger)
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** **Expression** → `concat('New file attachment: ', items('Log_Each_Attachment')?['DisplayName'])`

---

## Key Features Added

✅ **Complete Email Audit Logging** - All sent emails logged to AuditLog  
✅ **Enhanced Email Content** - Rich HTML with detailed information and cost estimates  
✅ **Comprehensive Field Tracking** - All important field changes logged  
✅ **Error Handling** - Exponential retry policies on all critical actions  
✅ **Concurrency Control** - Prevents race conditions in audit logging  
✅ **Dynamic Email Content** - Shows cost/time estimates when available  
✅ **Professional Communication** - Detailed pickup instructions and lab info  
✅ **Shared Mailbox Integration** - Consistent sender identity across all emails  
✅ **Customizable Templates** - Easy to update lab-specific information  

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
- [ ] Shared mailbox configuration working properly
- [ ] Email links resolve to correct SharePoint URLs
- [ ] Lab hours and location information accurate in emails
