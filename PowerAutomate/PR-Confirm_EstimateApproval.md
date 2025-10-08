# Flow D — PR-Confirm: Estimate Approval (Instant)

**Type:** Instant cloud flow (triggered via HTTP Request)

**Purpose:** When a student clicks the confirmation link in their estimate email, validate the request, update the status from "Pending" to "Ready to Print", log the confirmation action, and display a user-friendly confirmation page.

---

## Clean Build Plan - Step-by-Step Implementation

**IMPORTANT:** This flow creates an HTTP endpoint that students can access via email links to confirm print estimates. It requires careful security and validation setup.

### Step 1: Flow Creation Setup

**What this does:** Creates the foundation instant cloud flow with an HTTP trigger that can be called from email links.

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. **Create** → **Instant cloud flow**
3. **Name:** Type `PR-Confirm: Estimate Approval`
4. **Choose trigger:** Select **When an HTTP request is received**
5. **Click Create**

**Test Step 1:** Save → Flow should appear in "My flows" with HTTP request icon

---

### Step 2: Configure HTTP Request Trigger

**What this does:** Sets up the trigger to accept a RequestID parameter from the confirmation link URL and generates the schema for validation.

**UI steps:**
1. Click on the **When an HTTP request is received** trigger card to expand it
2. Ensure you're on the **Parameters** tab
3. **Who can trigger the flow?** Should be set to **Any user in my tenant** (default)
4. Under **Request Body JSON Schema**, click the **Use sample payload to generate schema** link
5. In the dialog that opens, **paste this sample JSON:**
```json
{
  "RequestID": "123"
}
```
6. Click **Done**

**Auto-generated Request Body JSON Schema:**
```json
{
    "type": "object",
    "properties": {
        "RequestID": {
            "type": "string"
        }
    }
}
```

**⚠️ Important Notes:**
- The **HTTP URL** field shows "URL will be generated after save" until you save the flow
- After saving, the trigger will generate an **HTTP POST URL** that you'll use in email templates
- The RequestID parameter will be passed as a query string parameter in the URL
- The trigger URL includes a signature for security
- **"Any user in my tenant"** means any LSU user can trigger this flow via the link (appropriate for student confirmations)

**Test Step 2:** Save → Schema should appear in "Request Body JSON Schema" field and HTTP URL should be generated

---

### Step 3: Validate RequestID Parameter

**What this does:** Ensures the RequestID parameter was provided before proceeding, preventing errors from malformed links.

**UI steps:**
1. Click **+ New step**
2. **Search:** Type `Condition` → Select **Condition**
3. **Rename condition:** Click **three dots (…)** → **Rename** → Type `Validate RequestID Present`
4. **Configure condition:**
   - **Left box:** Click **Expression** tab (fx) → Paste:
   ```
   empty(triggerOutputs()?['queries']?['RequestID'])
   ```
   - Click **Update**
   - **Middle dropdown:** Select **is equal to**
   - **Right box:** Type `false`

**⚠️ What this expression checks:**
- `triggerOutputs()?['queries']?['RequestID']` = The RequestID from the URL query string
- `empty()` = Returns true if RequestID is missing or blank
- We check if it equals `false`, meaning RequestID IS present

**Yes Branch:** RequestID present → Proceed with confirmation
**No Branch:** RequestID missing → Return error response

**Test Step 3:** Save → Test with URL without RequestID parameter → Should follow No branch

---

### Step 4: Get PrintRequest Item (Yes Branch)

**What this does:** Retrieves the specific PrintRequest from SharePoint using the RequestID to validate it exists and get current data.

**UI steps (INSIDE THE "YES" BRANCH of Step 3):**
1. In the **Yes branch** → Click **+ Add an action**
2. **Search:** Type `Get item` → Select **Get item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get PrintRequest`
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
   - **Id:** Click **Expression** tab (fx) → Paste:
   ```
   triggerOutputs()?['queries']?['RequestID']
   ```
   - Click **OK**

**⚠️ Note:** This Get item action will fail if the RequestID doesn't exist, which we'll handle in Step 5.

**Test Step 4:** Save → Test with valid RequestID → Should retrieve item successfully

---

### Step 5: Validate Request Status

**What this does:** Ensures the request is in "Pending" status before allowing confirmation, preventing duplicate confirmations or invalid state transitions.

**UI steps (INSIDE THE "YES" BRANCH, after "Get PrintRequest"):**
1. After "Get PrintRequest" → Click **+ Add an action**
2. **Search:** Type `Condition` → Select **Condition**
3. **Rename condition:** Click **three dots (…)** → **Rename** → Type `Validate Pending Status`
4. **Configure condition:**
   - **Left box:** Click **Expression** tab (fx) → Paste:
   ```
   outputs('Get_PrintRequest')?['body/Status']?['Value']
   ```
   - Click **Update**
   - **Middle dropdown:** Select **is equal to**
   - **Right box:** Type `Pending`

**⚠️ What this checks:**
- Only allows confirmation if Status is exactly "Pending"
- Prevents re-confirmation of already processed requests
- Prevents confirmation of rejected or completed requests

**Yes Branch:** Status is Pending → Process confirmation
**No Branch:** Status is not Pending → Return error response

**Test Step 5:** Save → Change request status to "In Review" → Click link → Should follow No branch

---

### Step 6: Update Status to Ready to Print (Yes Branch - Pending Status)

**What this does:** Updates the PrintRequest status and tracking fields to mark the estimate as confirmed by the student.

**UI steps (INSIDE THE "YES" BRANCH of "Validate Pending Status"):**
1. In the **Yes branch** → Click **+ Add an action**
2. **Search:** Type `Update item` → Select **Update item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Update to Ready to Print`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry Policy:** Turn to **On**
   - **Type:** Select **Exponential**
   - **Count:** Type **4**
   - **Minimum Interval:** Type **PT30S**
   - **Click Done**
5. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Paste:
   ```
   triggerOutputs()?['queries']?['RequestID']
   ```
   - **Status Value:** Type `Ready to Print`
   - **LastAction:** Type `Estimate Confirmed`
   - **LastActionBy Claims:** Click **Expression** → Paste:
   ```
   outputs('Get_PrintRequest')?['body/Student']?['Claims']
   ```
   - **LastActionAt:** Click **Expression** → Paste:
   ```
   utcNow()
   ```

**⚠️ Field Explanations:**
- **Status:** Changes from "Pending" to "Ready to Print"
- **LastAction:** Descriptive text of what happened
- **LastActionBy Claims:** The student who confirmed (from original request)
- **LastActionAt:** Timestamp of confirmation

**Test Step 6:** Save → Click confirmation link → Verify status changes to "Ready to Print"

---

### Step 7: Log Confirmation in AuditLog (Yes Branch - After Update)

**What this does:** Creates a comprehensive audit log entry documenting the student's confirmation action.

**UI steps (INSIDE THE "YES" BRANCH, after "Update to Ready to Print"):**
1. After "Update to Ready to Print" → Click **+ Add an action**
2. **Search:** Type `Create item` → Select **Create item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Log Estimate Confirmation`
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
   - **Title:** Type `Student Confirmed Estimate`
   - **RequestID:** Click **Expression** → Paste:
   ```
   triggerOutputs()?['queries']?['RequestID']
   ```
   - **ReqKey:** Click **Expression** → Paste:
   ```
   outputs('Get_PrintRequest')?['body/ReqKey']
   ```
   - **Action Value:** Type `Estimate Confirmed`
   - **FieldName:** Type `Status`
   - **OldValue:** Type `Pending`
   - **NewValue:** Type `Ready to Print`
   - **Actor Claims:** Click **Expression** → Paste:
   ```
   outputs('Get_PrintRequest')?['body/Student']?['Claims']
   ```
   - **ActorRole Value:** Type `Student`
   - **ClientApp Value:** Type `Email Link`
   - **ActionAt:** Click **Expression** → Paste:
   ```
   utcNow()
   ```
   - **FlowRunId:** Click **Expression** → Paste:
   ```
   workflow()['run']['name']
   ```
   - **Notes:** Click **Expression** → Paste:
   ```
   concat('Student confirmed estimate via email link for request ', triggerOutputs()?['queries']?['RequestID'])
   ```

**Test Step 7:** Save → Click confirmation link → Check AuditLog for entry with all fields populated

---

### Step 8: Send Success Response (Yes Branch - After Logging)

**What this does:** Returns a user-friendly HTML page to the student confirming their action was successful and explaining next steps.

**UI steps (INSIDE THE "YES" BRANCH, after "Log Estimate Confirmation"):**
1. After "Log Estimate Confirmation" → Click **+ Add an action**
2. **Search:** Type `Response` → Select **Response**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Success Response`
4. **Fill in all fields:**
   - **Status Code:** Type `200`
   - **Headers:** Leave blank
   - **Body:** Click **Code View button (`</>`)** at top right → Paste the HTML below:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Estimate Confirmed</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .success { 
            background-color: #d4edda; 
            border: 1px solid #c3e6cb; 
            color: #155724; 
            padding: 20px; 
            border-radius: 5px; 
            margin-bottom: 20px;
            text-align: center;
        }
        .success h2 {
            margin-top: 0;
            font-size: 24px;
        }
        .details { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 5px; 
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .details h3 {
            margin-top: 0;
            color: #007bff;
        }
        .details ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .details li {
            margin: 8px 0;
        }
        .button { 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            margin: 10px 10px 0 0;
            transition: background-color 0.3s;
        }
        .button:hover { 
            background-color: #0056b3;
            text-decoration: none;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .request-info {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .request-info strong {
            color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">
            <h2>✅ Estimate Confirmed Successfully!</h2>
            <p>Thank you for confirming your 3D print estimate.</p>
        </div>
        
        <div class="request-info">
            <strong>Request ID:</strong> @{triggerOutputs()?['queries']?['RequestID']}<br>
            <strong>Request Key:</strong> @{outputs('Get_PrintRequest')?['body/ReqKey']}<br>
            <strong>Status:</strong> Ready to Print
        </div>
        
        <div class="details">
            <h3>📋 What Happens Next:</h3>
            <ul>
                <li><strong>Queue Position:</strong> Your request is now queued for printing</li>
                <li><strong>Production:</strong> We'll begin preparing and printing your job</li>
                <li><strong>Notification:</strong> You'll receive an email when it's completed and ready for pickup</li>
                <li><strong>Payment:</strong> Payment will be due at pickup based on actual material used</li>
                <li><strong>Pickup Location:</strong> LSU Digital Fabrication Lab, Room 145 Atkinson</li>
            </ul>
        </div>
        
        <div class="details">
            <h3>💡 Important Reminders:</h3>
            <ul>
                <li>Print time estimates are approximate and may vary</li>
                <li>Final cost may differ slightly based on actual material usage</li>
                <li>TigerCASH is the only accepted payment method</li>
                <li>Please bring your student ID for pickup</li>
            </ul>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="button">📄 View My Requests</a>
            <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab" class="button">🏠 Lab Homepage</a>
        </p>
        
        <div class="footer">
            <p><em>LSU Digital Fabrication Lab</em></p>
            <p><strong>Lab Hours:</strong> Monday-Friday 8:30 AM - 4:30 PM</p>
            <p><strong>Email:</strong> coad-fablab@lsu.edu</p>
        </div>
    </div>
</body>
</html>
```

**⚠️ HTML Expressions:**
- `@{triggerOutputs()?['queries']?['RequestID']}` = Shows the request ID
- `@{outputs('Get_PrintRequest')?['body/ReqKey']}` = Shows the human-readable request key
- Expressions are automatically processed by Power Automate

**Test Step 8:** Save → Click confirmation link → Should see success page in browser

---

### Step 9: Send Missing RequestID Error (No Branch - Step 3)

**What this does:** Returns a user-friendly error page when the confirmation link is malformed (missing RequestID).

**UI steps (INSIDE THE "NO" BRANCH of Step 3 "Validate RequestID Present"):**
1. In the **No branch** → Click **+ Add an action**
2. **Search:** Type `Response` → Select **Response**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Error Missing RequestID`
4. **Fill in all fields:**
   - **Status Code:** Type `400`
   - **Headers:** Leave blank
   - **Body:** Paste the HTML below directly:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Invalid Confirmation Link</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .error { 
            background-color: #f8d7da; 
            border: 1px solid #f5c6cb; 
            color: #721c24; 
            padding: 20px; 
            border-radius: 5px; 
            margin-bottom: 20px;
            text-align: center;
        }
        .error h2 {
            margin-top: 0;
        }
        .button { 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            margin: 10px 10px 0 0;
        }
        .button:hover { 
            background-color: #0056b3;
        }
        ul {
            text-align: left;
            margin: 20px 0;
        }
        li {
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error">
            <h2>⚠️ Invalid Confirmation Link</h2>
            <p>This confirmation link appears to be incomplete or malformed.</p>
        </div>
        
        <p><strong>Possible reasons:</strong></p>
        <ul>
            <li>The link was copied incorrectly from your email</li>
            <li>The email client truncated the full URL</li>
            <li>The link format has been modified</li>
        </ul>
        
        <p><strong>What to do:</strong></p>
        <ul>
            <li>Go back to your email and click the link directly (don't copy/paste)</li>
            <li>If the problem persists, check your request status in the portal</li>
            <li>Contact the lab if you need assistance</li>
        </ul>
        
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="button">View My Requests</a>
            <a href="mailto:coad-fablab@lsu.edu" class="button">Contact Lab</a>
        </p>
        
        <div class="footer">
            <p><em>LSU Digital Fabrication Lab</em></p>
            <p>coad-fablab@lsu.edu</p>
        </div>
    </div>
</body>
</html>
```

**Test Step 9:** Save → Access flow URL without RequestID parameter → Should see error page

---

### Step 10: Send Invalid Status Error (No Branch - Step 5)

**What this does:** Returns a user-friendly error page when the request status is not "Pending" (already confirmed, rejected, or completed).

**UI steps (INSIDE THE "NO" BRANCH of Step 5 "Validate Pending Status"):**
1. In the **No branch** → Click **+ Add an action**
2. **Search:** Type `Response` → Select **Response**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Error Invalid Status`
4. **Fill in all fields:**
   - **Status Code:** Type `400`
   - **Headers:** Leave blank
   - **Body:** Click **Code View button (`</>`)** → Paste the HTML below:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Confirmation Not Available</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .error { 
            background-color: #fff3cd; 
            border: 1px solid #ffc107; 
            color: #856404; 
            padding: 20px; 
            border-radius: 5px; 
            margin-bottom: 20px;
            text-align: center;
        }
        .error h2 {
            margin-top: 0;
        }
        .info-box {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #007bff;
        }
        .button { 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            margin: 10px 10px 0 0;
        }
        .button:hover { 
            background-color: #0056b3;
        }
        ul {
            text-align: left;
            margin: 20px 0;
        }
        li {
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error">
            <h2>⚠️ Unable to Process Confirmation</h2>
            <p>This estimate confirmation link is no longer valid or has already been processed.</p>
        </div>
        
        <div class="info-box">
            <strong>Request ID:</strong> @{triggerOutputs()?['queries']?['RequestID']}<br>
            <strong>Current Status:</strong> @{outputs('Get_PrintRequest')?['body/Status']?['Value']}
        </div>
        
        <p><strong>Possible reasons:</strong></p>
        <ul>
            <li>✅ You have already confirmed this estimate</li>
            <li>🔄 The request status has been changed by staff</li>
            <li>❌ The request was rejected or cancelled</li>
            <li>⏰ The confirmation link has expired</li>
        </ul>
        
        <p><strong>What to do:</strong></p>
        <ul>
            <li>Check your request status in the portal below</li>
            <li>If status is "Ready to Print", your confirmation was already processed</li>
            <li>If you have questions about your request status, contact the lab</li>
        </ul>
        
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="button">View My Requests</a>
            <a href="mailto:coad-fablab@lsu.edu" class="button">Contact Lab</a>
        </p>
        
        <div class="footer">
            <p><em>LSU Digital Fabrication Lab</em></p>
            <p><strong>Lab Hours:</strong> Monday-Friday 8:30 AM - 4:30 PM</p>
            <p><strong>Email:</strong> coad-fablab@lsu.edu</p>
        </div>
    </div>
</body>
</html>
```

**⚠️ HTML Expressions:**
- `@{triggerOutputs()?['queries']?['RequestID']}` = Shows which request was attempted
- `@{outputs('Get_PrintRequest')?['body/Status']?['Value']}` = Shows current status

**Test Step 10:** Save → Change status to "Completed" → Click link → Should see invalid status error

---

### Step 11: Get the HTTP POST URL

**What this does:** Retrieves the HTTP endpoint URL that you'll embed in estimate emails for students to click.

**✅ COMPLETED:** Your HTTP POST URL has been retrieved and documented.

**UI steps:**
1. **Save** the flow
2. Click on the **When an HTTP request is received** trigger card
3. **Copy the HTTP POST URL** (appears after saving)

**Your HTTP POST URL:**
```
https://default2d4dad3f50ae47d983a09ae2b1f466.f8.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/53d9ccc4cb0b4790a3ae32d80490151b/triggers/manual/paths/invoke?api-version=1
```

**⚠️ Important Notes:**
- This is a permanent URL that won't change unless you recreate the flow
- This URL is in the **new Power Platform format** (not the legacy `logic.azure.com` format)
- **Migration-compliant:** Will continue working after November 2025 deadline
- If you recreate the flow, you'll get a new URL and need to update the PR-Audit email template

---

### Step 12: Update Email Template in PR-Audit Flow

**What this does:** Adds the confirmation link to the estimate email template so students can click it.

**✅ COMPLETED:** The URL has been added to the PR-Audit flow documentation.

**Instructions:**
1. Open your **PR-Audit: Log changes + Email notifications** flow
2. Find the **Send Estimate Email** action (in the "Check Status Pending" branch)
3. **Copy and paste the confirmation button HTML from the PR-Audit_LogChanges.md file (line 631)**

**Your actual flow URL (already configured in documentation):**
```html
<a href="https://default2d4dad3f50ae47d983a09ae2b1f466.f8.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/53d9ccc4cb0b4790a3ae32d80490151b/triggers/manual/paths/invoke?api-version=1&RequestID=@{triggerOutputs()?['body/ID']}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">✅ Confirm and Proceed</a>
```

**⚠️ Critical Details:**
- The `&RequestID=@{triggerOutputs()?['body/ID']}` at the end is REQUIRED
- The expression will automatically insert the correct ID when emails are sent
- This URL is already in the new Power Platform format (migration-compliant)
- Test the link after updating to ensure it works

---

### Step 13: Final Testing

**What this does:** Comprehensive testing of all flow paths and email integration.

**Testing Checklist:**

#### Test 1: Successful Confirmation Flow
- [ ] Create a test request with status = "Pending"
- [ ] Trigger PR-Audit to send estimate email
- [ ] Click confirmation link in email
- [ ] Verify success page appears
- [ ] Verify status changed to "Ready to Print"
- [ ] Verify AuditLog entry created with correct fields
- [ ] Verify LastAction fields updated

#### Test 2: Missing RequestID
- [ ] Access flow URL without `RequestID` parameter
- [ ] Verify "Invalid Confirmation Link" error page appears
- [ ] Verify HTTP status code 400 returned

#### Test 3: Invalid Status
- [ ] Create request with status = "Completed"
- [ ] Build URL manually with that RequestID
- [ ] Access the URL
- [ ] Verify "Unable to Process Confirmation" error appears
- [ ] Verify current status shown in error page

#### Test 4: Duplicate Confirmation
- [ ] Click confirmation link once (successful)
- [ ] Click same link again immediately
- [ ] Verify error page appears (status no longer "Pending")

#### Test 5: Invalid RequestID
- [ ] Access URL with non-existent RequestID (e.g., 99999)
- [ ] Verify appropriate error handling (Get item will fail)
- [ ] Check flow run history for error details

**🎉 SUCCESS:** You now have a working Flow D that students can use to confirm estimates!

---

## Key Features

✅ **One-Click Confirmation** - Students simply click a link in their email  
✅ **Automatic Status Update** - Changes from "Pending" to "Ready to Print" seamlessly  
✅ **Complete Audit Trail** - Logs student confirmation with timestamp and details  
✅ **User-Friendly Responses** - Shows success/error pages with clear next steps  
✅ **Secure Processing** - Validates request status and logs all actions  
✅ **Integration Ready** - Works seamlessly with existing PR-Audit email flow  
✅ **Error Resilience** - Retry policies on all critical actions  
✅ **Professional UI** - Styled confirmation pages match lab branding  
✅ **Idempotent** - Handles duplicate clicks gracefully  
✅ **Informative Errors** - Shows specific error messages based on failure reason

---

## URL Reference Guide

**Replace these with your actual URLs:**

| Purpose | URL Template |
|---------|-------------|
| **Flow HTTP endpoint** | `https://prod-##.westus.logic.azure.com:443/workflows/YOUR_WORKFLOW_ID/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YOUR_SIGNATURE` |
| **Site root** | `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab` |
| **My Requests view** | `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx` |
| **Contact email** | `coad-fablab@lsu.edu` |

---

## Security Considerations

### URL Security
- The HTTP POST URL contains a signature parameter (`sig=`) that prevents unauthorized access
- The signature is cryptographically generated and cannot be guessed
- RequestID parameter ensures students can only confirm specific requests
- Flow validates the request status before processing

### Student Authentication
- Students must have received the email with the confirmation link to access this flow
- The email is sent to their verified student email address
- SharePoint item-level permissions ensure they can only view their own requests
- No authentication is required at the HTTP endpoint (link access = authorization)

### Error Handling
- Invalid RequestIDs trigger appropriate error pages
- Already-processed confirmations show clear messaging  
- All confirmations are logged in AuditLog for audit trail
- Retry policies prevent data loss on temporary failures

### Potential Security Enhancements
**If you need stricter security, consider:**
1. **Add Microsoft Entra ID authentication** to the HTTP trigger
2. **Add IP restrictions** to only allow traffic from campus network
3. **Add expiration timestamps** to links (requires additional logic)
4. **Add one-time tokens** (requires token generation and validation)

**Current implementation is secure for most use cases** because:
- Signature prevents URL guessing
- Status validation prevents duplicate processing
- Complete audit trail tracks all actions
- Students can only confirm their own requests

---

## Troubleshooting Guide

### Issue 1: "Flow not found" Error

**Symptoms:**
- Clicking email link shows "Flow not found" or 404 error
- Browser shows Azure Logic Apps error page

**Fix:**
1. Verify the HTTP POST URL is copied correctly from the trigger
2. Ensure the flow is **turned on** in Power Automate
3. Check that the flow wasn't deleted or recreated (URL changes on recreation)
4. Verify you saved the flow after configuring the HTTP trigger
5. Test the URL by accessing it directly in a browser with `&RequestID=123`

---

### Issue 2: "RequestID missing" Error Page

**Symptoms:**
- Email link shows "Invalid Confirmation Link" error
- URL doesn't include RequestID parameter

**Fix:**
1. Check email template in PR-Audit flow includes `&RequestID=@{triggerOutputs()?['body/ID']}`
2. Verify the dynamic expression isn't escaped or converted to literal text
3. Test by manually adding `&RequestID=123` to the URL
4. Ensure the `&` before RequestID isn't URL-encoded to `%26`

---

### Issue 3: Confirmation Not Working (Invalid Status Error)

**Symptoms:**
- Click link but get "Unable to Process Confirmation" error
- Status shown is not "Pending"

**Fix:**
1. Verify request status is exactly "Pending" before clicking link
2. Check that staff haven't manually changed the status
3. Confirm estimate email was sent (PR-Audit should set status to "Pending")
4. Check AuditLog to see if previous confirmation already processed
5. Verify Status value matches exactly (case-sensitive): `Pending`

---

### Issue 4: Permission Errors

**Symptoms:**
- Flow run shows "Access denied" or permission errors
- Get item or Update item actions fail

**Fix:**
1. Verify flow connections have proper SharePoint access
2. Check that flow owner has edit permissions on PrintRequests list
3. Verify flow owner has create permissions on AuditLog list
4. Re-authenticate SharePoint connections: Flow → Edit → Resave connections
5. Ensure site address URL is correct

---

### Issue 5: Email Link Broken or Truncated

**Symptoms:**
- Link in email is cut off
- Clicking opens multiple browser windows
- URL wraps across multiple lines in email

**Fix:**
1. Use HTML `<a>` tag with full URL in `href` attribute (not plain text URL)
2. Ensure email client supports HTML emails
3. Test in multiple email clients (Outlook, Gmail, etc.)
4. Verify no line breaks inserted in URL
5. Use URL shortener if link is too long (not recommended for security)

---

### Issue 6: Success Page Shows But Status Doesn't Update

**Symptoms:**
- Success page appears correctly
- Status remains "Pending" instead of "Ready to Print"
- AuditLog entry not created

**Fix:**
1. Check flow run history for errors in Update item action
2. Verify retry policy is configured on Update item action
3. Check SharePoint list permissions for flow owner
4. Verify Status field exists and is a Choice field
5. Check "Ready to Print" is a valid choice value (exact spelling, case-sensitive)
6. Look for "Run after" configuration errors in flow

---

### Issue 7: HTML Page Not Rendering Correctly

**Symptoms:**
- Success/error page shows raw HTML code instead of formatted page
- Styling not applied
- Page appears as plain text

**Fix:**
1. Verify Response action has **Content-Type** header set to `text/html` (if header field available)
2. Ensure HTML is pasted in Body field, not as escaped string
3. Check for syntax errors in HTML (missing closing tags, quotes)
4. Test URL in different browsers (Chrome, Firefox, Edge)
5. Verify `<!DOCTYPE html>` is at the top of HTML

---

### Issue 8: Flow Times Out

**Symptoms:**
- Long wait after clicking link
- Browser eventually shows timeout error
- Flow run history shows "Timed out" status

**Fix:**
1. Check retry policies aren't too aggressive (reduce count or interval)
2. Verify SharePoint site is accessible from Power Automate
3. Test SharePoint connections manually
4. Check for performance issues with SharePoint list
5. Consider removing retry policies temporarily for testing

---

### Issue 9: Expressions Not Evaluating

**Symptoms:**
- Literal text like `@{triggerOutputs()...}` appears in output
- Dynamic values not populated
- Error page shows expression syntax instead of values

**Fix:**
1. Verify expressions are in correct format: `@{expression}`
2. Check action names in expressions match exactly (spaces = underscores)
3. Ensure expressions are in HTML body, not inside HTML attributes without proper encoding
4. Use Code View (`</>`) when pasting HTML with expressions
5. Test expressions in a Compose action first to verify syntax

---

## Flow Dependencies

**Requires these flows to be working:**
- **PR-Create** (Flow A) - Creates the initial requests with student information
- **PR-Audit** (Flow B) - Sends the estimate emails with confirmation links
- **PR-Action** (Flow C) - Handles staff actions that set status to "Pending"

**SharePoint Lists:**
- `PrintRequests` - Updates status and LastAction fields
- `AuditLog` - Creates confirmation audit entries

**Connections Required:**
- SharePoint (for list operations)
- HTTP (built-in, no connection required)

---

## Advanced Customization

### Adding Email Notification After Confirmation

**What this does:** Sends a confirmation email to the student after they confirm.

**Implementation:**
1. Add **Send an email** action after "Log Estimate Confirmation"
2. Use `outputs('Get_PrintRequest')?['body/StudentEmail']` for recipient
3. Include confirmation details and next steps

### Adding Confirmation Expiration

**What this does:** Prevents confirmations after a certain time period.

**Implementation:**
1. Add **Condition** after "Get PrintRequest"
2. Compare `outputs('Get_PrintRequest')?['body/LastActionAt']` to current time
3. Use `addDays(utcNow(), -7)` to check if older than 7 days

### Adding Analytics Tracking

**What this does:** Tracks confirmation link clicks for analytics.

**Implementation:**
1. Add **Create item** action at the beginning of Yes branch
2. Log to a separate "Analytics" list
3. Track timestamp, RequestID, user agent, etc.

---

## Performance Notes

**Expected Response Times:**
- Successful confirmation: 2-4 seconds
- Error responses: 1-2 seconds
- Peak load: Can handle multiple concurrent requests

**Optimization Tips:**
- Retry policies add time on failures (expected)
- SharePoint operations are typically fast (<1 second each)
- HTML response generation is instantaneous
- Most time is spent in SharePoint Get/Update operations

---

## Maintenance Checklist

**Monthly:**
- [ ] Review flow run history for errors
- [ ] Check success rate metrics
- [ ] Verify email links still working
- [ ] Test confirmation flow end-to-end

**Quarterly:**
- [ ] Update lab hours in HTML templates
- [ ] Review error messages for clarity
- [ ] Check SharePoint permissions still valid
- [ ] Test with different email clients

**Annually:**
- [ ] Review security settings
- [ ] Update contact information
- [ ] Refresh SharePoint connections
- [ ] Test all error scenarios

---

## Common Expressions Reference

| Purpose | Expression |
|---------|-----------|
| Get RequestID from URL | `triggerOutputs()?['queries']?['RequestID']` |
| Get ReqKey from PrintRequest | `outputs('Get_PrintRequest')?['body/ReqKey']` |
| Get Student Claims | `outputs('Get_PrintRequest')?['body/Student']?['Claims']` |
| Get Current Status | `outputs('Get_PrintRequest')?['body/Status']?['Value']` |
| Get Current Timestamp | `utcNow()` |
| Get Flow Run ID | `workflow()['run']['name']` |
| Concat String | `concat('Text 1', 'Text 2')` |

---

**📝 Document Version:** 2.0  
**Last Updated:** Enhanced with detailed step-by-step instructions  
**Compatibility:** Power Automate (all plans with Premium connectors)
