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

### Step 2: Prevent System Update Loops

**What this does:** Prevents Flow B from running when any System process (Flow A or Flow B itself) is updating the item, avoiding race conditions and circular loops.

**UI steps (Recommended):**
1. Click **+ New step** → **Condition** → rename to `Skip if System Update`.
   - Left (Expression): `equals(triggerOutputs()?['body/LastActionBy'], 'System')`
   - Middle: is equal to
   - Right: `true`
   - **Note:** Skips processing when any system automation writes to the item.


**Yes Branch:** Leave empty (skip all processing when any System process is running)

**No Branch:** ALL remaining Flow B logic goes here (Steps 3-5 below) - processes user modifications only

---

### Step 2a: Configure Trigger Conditions (optional loop guard)

**What this does:** Prevents the flow from even starting when the item update was made by the flow itself (or other system processes). This removes the circular loop warning and reduces no-op runs.

**UI steps (on the trigger card "When an item is created or modified"):**
1. Open the trigger → click the **three dots (… )** → **Settings**.
2. Under **Trigger conditions** → click **Add** and paste this expression:
   - `@not(equals(triggerBody()?['LastActionBy'], 'System'))`
3. Under **Concurrency control**, turn it **On** and set **Limit = 1** (strict ordering of audit logs).
4. Ensure **Split on** is **Off** (not used for this trigger).

**Notes:**
- Use the column internal names in the expressions. If unsure, confirm in SharePoint List settings or by using "Peek code" on any action to see the property paths.
- Keep Step 2's in-flow condition as a second safeguard even with trigger conditions.

### Step 3: Get Changes for Item

**What this does:** Retrieves what fields changed since the flow started, preventing infinite loops.

**UI steps (INSIDE THE "NO" BRANCH of Step 2):**
1. Click **+ New step**
2. Search for and select **Get changes for an item or a file (properties only)** (SharePoint)
3. Rename the action to: `Get Item Changes`
   - Click the **three dots (…)** → **Rename** → type `Get Item Changes`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Expression** → `triggerBody()?['ID']`
   - **Since:** **Dynamic content** → **Trigger Window Start Token** (from trigger)

*This compares current values to those at flow start time, preventing infinite loops.*

> Tip: If you see "id may not be null or empty" on this action, open the card and rebind **Site Address/List Name** and the **Id** expression above. After trigger edits, tokens can drop; this direct expression is the most stable.

### Step 4: Parallel Field Change Detection

**What this does:** Creates separate condition branches that run in parallel to detect changes to specific fields and log them appropriately.

**Implementation approach:** Add multiple **Condition** actions at the same level (not nested) to create parallel branches.

#### Step 4a: Status Change Detection

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
   - **NewValue:** **Expression** → `triggerOutputs()?['body/Status']`
   - **Actor Claims:** **Expression** → `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** **Expression** → `concat('Status updated from previous value to ', triggerOutputs()?['body/Status'])`


**How to build parallel field change conditions:**
1. Add a **Condition** action at the root level
2. Rename with descriptive name (e.g., "Check [FieldName] Changed")
3. Click the left **Choose a value** box
4. In the **Dynamic content** panel, under the **"Get Item Changes"** section, search for "Has Column Changed"
5. Pick the specific field from that section (e.g., **Has Column Changed: Priority**)
6. Set middle dropdown to **is equal to**
7. In right box, type `true` (without quotes)
8. In **Yes** branch, add **Create item** action with descriptive rename
9. Configure all AuditLog fields consistently
10. **Configure retry policy** on the Create item action
11. Repeat for each field, adding conditions at the same level for parallelism

##### Beginner Walkthrough: Build the first detector (Priority)

1. Add a new Condition at the root level (sibling of other conditions) and set it to detect Priority changes using the steps above (pick **Has Column Changed: Priority** = `true`).
2. In the **Yes** branch, add **Create item** (SharePoint) and fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** `Priority Change`
   - **RequestID:** **Expression** → `triggerOutputs()?['body/ID']`
   - **ReqKey:** **Dynamic content** → `ReqKey`
   - **Action Value:** `Field Change`
   - **FieldName:** `Priority`
   - **OldValue:** (leave blank)
   - **NewValue:** **Expression** → `triggerOutputs()?['body/Priority']`
   - **Actor Claims:** **Expression** → `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** `Staff`
   - **ClientApp Value:** `SharePoint Form`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** **Expression** → `concat('Priority updated to ', triggerOutputs()?['body/Priority'])`
3. Open the action's settings (… → Settings) and turn on **Retry Policy** (Type: Exponential, Count: 4, Minimum Interval: PT1M).
4. Leave the **No** branch empty.

##### Duplicate for the other fields (change only the items listed)

- **Method**
  - Title: `Method Change`
  - FieldName: `Method`
  - NewValue: `triggerOutputs()?['body/Method']?['Value']`
  - Notes: `concat('Method updated to ', triggerOutputs()?['body/Method']?['Value'])`

- **Printer**
  - Title: `Printer Change`
  - FieldName: `Printer`
  - NewValue: `triggerOutputs()?['body/Printer']?['Value']`
  - Notes: `concat('Printer updated to ', triggerOutputs()?['body/Printer']?['Value'])`

- **Color**
  - Title: `Color Change`
  - FieldName: `Color`
  - NewValue: `triggerOutputs()?['body/Color']?['Value']`
  - Notes: `concat('Color updated to ', triggerOutputs()?['body/Color']?['Value'])`

- **EstimatedTime**
  - Title: `EstimatedTime Change`
  - FieldName: `EstimatedTime`
  - NewValue: `triggerOutputs()?['body/EstimatedTime']`
  - Notes: `concat('EstimatedTime updated to ', string(triggerOutputs()?['body/EstimatedTime']))`

- **EstimatedWeight**
  - Title: `EstimatedWeight Change`
  - FieldName: `EstimatedWeight`
  - NewValue: `triggerOutputs()?['body/EstWeight']`
  - Notes: `concat('EstimatedWeight updated to ', string(triggerOutputs()?['body/EstWeight']))`

- **EstimatedCost**
  - Title: `EstimatedCost Change`
  - FieldName: `EstimatedCost`
  - NewValue: `triggerOutputs()?['body/EstimatedCost']`
  - Notes: `concat('EstimatedCost updated to ', string(triggerOutputs()?['body/EstimatedCost']))`

- **Notes**
  - Title: `Notes Change`
  - FieldName: `Notes`
  - NewValue: `triggerOutputs()?['body/Notes']`
  - Notes: `concat('Notes updated')`

- **RejectionReason**
  - Title: `RejectionReason Change`
  - FieldName: `RejectionReason`
  - NewValue: `triggerOutputs()?['body/RejectionReason']`
  - Notes: `concat('RejectionReason updated to ', triggerOutputs()?['body/RejectionReason'])`


##### Sanity checks and quick test

- All field Conditions are added at the root level (parallel), not nested.
- Each Create item has Retry Policy enabled (Exponential, 4, PT1M).
- Flow-level Concurrency Control is set to 1 (see Error Handling Configuration).
- Test: edit one field at a time and confirm one new AuditLog entry with the correct `FieldName` and `NewValue`. Then try two fields in one save and confirm two audit entries.

### Step 5: Status-Based Email Notifications

**What this does:** Inside the "Check Status Changed" Yes branch, add nested conditions to send emails when status changes to specific values.

#### Step 5a: Rejection Email Logic

**UI steps (inside the Status Change Yes branch):**
1. Click **+ Add an action** in the Status Change Yes branch
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Rejected`
   - Click the **three dots (…)** → **Rename** → type `Check Status Rejected`
4. Set up condition:
   - Left box: **Dynamic content** → **Status Value** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Rejected`

##### Yes Branch - Send Rejection Email:

**Action 1: Get current item data**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Current Rejected Data`
   - Click the **three dots (…)** → **Rename** → type `Get Current Rejected Data`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)

**Action 2: Send rejection email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Rejection Email`
   - Click the **three dots (…)** → **Rename** → type `Send Rejection Email`
4. **Configure retry policy**
5. Fill in, using expressions from the **"Get Current Rejected Data"** action for all fields related to the request:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `outputs('Get_Current_Rejected_Data')?['body/StudentEmail']`
   - **Subject:** **Expression** → `concat('Your 3D Print request has been rejected – ', outputs('Get_Current_Rejected_Data')?['body/ReqKey'])`
   - **Body:** Use expressions from **"Get Current Rejected Data"** (see HTML below) so no loop is added.

**Troubleshooting the "For each" Loop:**
If Power Automate automatically adds a "For each" loop when you select a Choice field (like RejectionReason), you must use an expression instead.
1. Delete the "For each" loop and the email action inside it.
2. Re-add the "Send email" action.
3. For the body, click the `</>` Code View button and paste the HTML below.
4. **Crucially**, ensure the action name in the expressions (e.g., `Get_Current_Rejected_Data`) exactly matches the name of your "Get item" action (with spaces replaced by underscores). Use the "Peek code" trick on a Compose action to find the exact name if you are unsure.

```html
<p>Unfortunately, your 3D Print request has been rejected by our staff.</p>
<p><strong>Request:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Title']} (@{outputs('Get_Current_Rejected_Data')?['body/ReqKey']})</p>
<p><strong>Method:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}</p>
<p><strong>Printer Requested:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}</p>
<br>
<p><strong>Reason for Rejection:</strong></p>
<p>@{outputs('Get_Current_Rejected_Data')?['body/RejectionReason']?['Value']}</p>
<p><strong>Additional Details:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Notes']}</p>
<br>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Review the specific rejection reason above</li>
  <li>Make necessary adjustments to your design or request</li>
  <li>Submit a new corrected request through the Fabrication Lab website</li>
  <li>Contact our staff if you have questions about this feedback</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 3: Log rejection email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Rejection Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Rejection Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Rejection`
   - **RequestID:** **Dynamic content** → **ID** (from the trigger, "When an item is created or modified")
   - **ReqKey:** **Dynamic content** → **ReqKey** (from "Get Current Rejected Data")
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from "Get Current Rejected Data")
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Rejection notification sent to student`

#### Step 5b: Pending (Estimate) Email Logic

**UI steps (create parallel to the Rejection condition):**
1. Click **+ Add an action** at the same level as the Rejection condition
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Pending`
   - Click the **three dots (…)** → **Rename** → type `Check Status Pending`
4. Set up condition:
   - Left box: **Dynamic content** → **Status Value** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Pending`

##### Yes Branch - Send Estimate Email:

**Action 1: Get current item data**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Current Pending Data`
   - Click the **three dots (…)** → **Rename** → type `Get Current Pending Data`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)

**Action 2: Send estimate email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Estimate Email`
   - Click the **three dots (…)** → **Rename** → type `Send Estimate Email`
4. **Configure retry policy**
5. Fill in, using expressions from the **"Get Current Pending Data"** action:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `outputs('Get_Current_Pending_Data')?['body/StudentEmail']`
   - **Subject:** **Expression** → `concat('Estimate ready for your 3D print – ', outputs('Get_Current_Pending_Data')?['body/ReqKey'])`
   - **Body:** Use expressions from **"Get Current Pending Data"** (see HTML below).

**Troubleshooting the "For each" Loop:**
Follow the same troubleshooting steps as the Rejection Email. Use expressions in the Code View (`</>`) of the email body, making sure to replace `Get_Current_Pending_Data` with the exact name of your "Get item" action for this branch.

```html
<p>Good news! Your 3D print request has been reviewed and approved.</p>
<p><strong>Request:</strong> @{outputs('Get_Current_Pending_Data')?['body/Title']} (@{outputs('Get_Current_Pending_Data')?['body/ReqKey']})</p>
<p><strong>Method:</strong> @{outputs('Get_Current_Pending_Data')?['body/Method/Value']} (@{outputs('Get_Current_Pending_Data')?['body/Color/Value']})</p>
<p><strong>Printer:</strong> @{outputs('Get_Current_Pending_Data')?['body/Printer/Value']}</p>
<br>
<p><strong>COST ESTIMATE:</strong></p>
<ul>
  <li><strong>Estimated Weight:</strong> @{outputs('Get_Current_Pending_Data')?['body/EstWeight']}g</li>
  <li><strong>Estimated Print Time:</strong> @{outputs('Get_Current_Pending_Data')?['body/EstHours']} hours</li>
  <li><strong>Estimated Cost:</strong> $@{outputs('Get_Current_Pending_Data')?['body/EstimatedCost']}</li>
</ul>
<br>
<p><strong>Please confirm you want to proceed with this estimate:</strong></p>
<p><a href="https://prod-12.westus.logic.azure.com:443/workflows/12345678901234567890/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SIGNATURE&RequestID=@{triggerOutputs()?['body/ID']}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">✅ Yes, proceed with printing</a></p>
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
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 3: Log estimate email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Estimate Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Estimate Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Estimate`
   - **RequestID:** **Dynamic content** → **ID** (from the trigger, "When an item is created or modified")
   - **ReqKey:** **Dynamic content** → **ReqKey** (from "Get Current Pending Data")
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from "Get Current Pending Data")
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Estimate notification sent to student with confirmation link`

#### Step 5c: Completion Email Logic

**UI steps (create parallel to the Pending condition):**
1. Click **+ Add an action** at the same level as the Pending condition
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Completed`
   - Click the **three dots (…)** → **Rename** → type `Check Status Completed`
4. Set up condition:
   - Left box: **Dynamic content** → **Status Value** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Completed`

##### Yes Branch - Send Completion Email:

**Action 1: Get current item data**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Current Completed Data`
   - Click the **three dots (…)** → **Rename** → type `Get Current Completed Data`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)

**Action 2: Send completion email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Completion Email`
   - Click the **three dots (…)** → **Rename** → type `Send Completion Email`
4. **Configure retry policy**
5. Fill in, using expressions from the **"Get Current Completed Data"** action:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `outputs('Get_Current_Completed_Data')?['body/StudentEmail']`
   - **Subject:** **Expression** → `concat('Your 3D print is ready for pickup – ', outputs('Get_Current_Completed_Data')?['body/ReqKey'])`
   - **Body:** Use expressions from **"Get Current Completed Data"** (see HTML below):

```html
<p class="editor-paragraph">Your print is ready for pick up in the Fabrication Lab in room 145 Atkinson.

TigerCASH is the only form of payment in the lab.


Lab Hours:

M-F 8:30 – 4:30</p>

<p class="editor-paragraph"><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}" class="editor-link">View your request details</a></p>
<p class="editor-paragraph"><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="editor-link">View all your requests</a>

</p>
<p class="editor-paragraph"><i><em class="editor-text-italic">This is an automated message from the LSU Digital Fabrication Lab.</em></i></p>
```

**Action 3: Log completion email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Completion Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Completion Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Completion`
   - **RequestID:** **Dynamic content** → **ID** (from the trigger, "When an item is created or modified")
   - **ReqKey:** **Dynamic content** → **ReqKey** (from "Get Current Completed Data")
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from "Get Current Completed Data")
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Completion notification sent to student`

---

## Advanced Implementation Notes

### Dynamic Content Sources

When building this flow, you'll see dynamic content available from multiple sources. It's critical to use the correct one for each situation:

1.  **"When an item is created or modified" (The Trigger)**
    - **Use for:** The initial **ID** of the item that was changed. Feed this ID into the "Get Item Changes" and "Get Current Item Data" actions.
    - **Avoid for:** Email content, as the data can be stale (see "Data Freshness" note).

2.  **"Get Item Changes"**
    - **Use for:** ONLY the **"Has Column Changed: [FieldName]"** boolean values. These are used inside `Condition` actions to check IF a field has been updated.
    - **Avoid for:** Any other purpose. Do not use its `Title`, `Status`, or other field values in emails or logging actions, as they may not be the most current.

3.  **"Get Current Item Data" (e.g., `Get Current Rejected Data`, `Get Current Pending Data`, etc.)**
    - **Use for:** This is the primary source for **all content that goes into emails** and most logging fields. Each email branch should have its own uniquely named "Get item" action to provide a fresh, up-to-the-moment snapshot of the item.
    - **Examples:** `Title`, `ReqKey`, `Method Value`, `RejectionReason Value`, `EstimatedCost`, `StudentEmail`.

### Email Content Data Freshness
Each email action includes a uniquely named **"Get item"** step (e.g., `Get Current Rejected Data`) immediately before sending to ensure the email contains the latest field values rather than potentially stale trigger data. This prevents race conditions where staff make final adjustments while the flow is running.

**Why this matters:** In the typical workflow, staff review the student's file and update technical parameters (printer, method, color, cost estimates) based on professional analysis. These updates may happen simultaneously with status changes, so using fresh data ensures the email reflects the staff's final decisions, not the student's original guesses.

### SharePoint Choice Field Values
**Important:** For SharePoint choice fields (like Status, Method, Priority, etc.), always use the **"[FieldName] Value"** option in conditions and expressions, not just "[FieldName]". 

- ✅ **Status Value** - gives you the text ("Rejected", "Pending", "Completed")  
- ❌ **Status** - gives you a complex object that won't work in text comparisons
- ✅ **Method Value** - gives you the text ("FDM", "SLA", "Multi Jet Fusion")
- ❌ **Method** - gives you a complex object

This applies to all choice fields throughout the flow.

### Person Field Resolution
If the **Actor** person field fails to resolve, use **Modified By Claims** from the trigger instead of trying to resolve email addresses manually.

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
- **Choose a value:** **Dynamic content** → **Status Value** (from trigger)
- **Condition:** is equal to
- **Choose a value:** `Ready to Print`
- **Yes Branch:** Send approval notification with cost estimates

**Parallel Nested Condition: "Check Status = Printing"**
- **Choose a value:** **Dynamic content** → **Status Value** (from trigger)
- **Condition:** is equal to
- **Choose a value:** `Printing`
- **Yes Branch:** Send "printing started" notification to keep students informed

// Attachments change detection removed for now (not required).

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
- [ ] **Email content freshness test:** Make simultaneous updates to printer/method/estimates while changing status - emails should show latest values, not original trigger values
- [ ] **RejectionReason field** appears correctly in rejection emails (both predefined choices and custom fill-in values)
- [ ] RejectionReason changes are logged to AuditLog when staff update rejection reasons
- [ ] Shared mailbox configuration working properly
- [ ] Email links resolve to correct SharePoint URLs
- [ ] Lab hours and location information accurate in emails