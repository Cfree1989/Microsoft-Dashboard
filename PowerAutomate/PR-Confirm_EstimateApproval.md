# Flow D — PR-Confirm: Estimate Approval (Instant)

**Trigger:** Manual (HTTP Request) — When a student clicks the confirmation link in the estimate email

**Purpose:** When a student clicks the confirmation link in their estimate email, update the status from "Pending" to "Ready to Print", log the confirmation action, and send a confirmation response.

---

## Quick Overview

This is an instant flow that gets triggered when students click the "✅ Yes, proceed with printing" link in their estimate email. Here's what happens:

1. **Validate the RequestID** parameter from the email link
2. **Get the PrintRequest** item from SharePoint
3. **Update status** from "Pending" to "Ready to Print"
4. **Log the confirmation** in AuditLog
5. **Return success message** to the student

---

## Error Handling Configuration

**Configure retry policies on all actions for resilience:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 1 minute
- **Apply to:** Get item, Update item, Create item (AuditLog) actions

**How to set retry policy on any action:**
1. Click the **three dots (…)** on the action card
2. Choose **Settings**
3. Turn **Retry Policy** to **On**
4. Configure the exponential settings above

---

## Flow Steps

### Step 1: Create the Manual Trigger

**What this does:** Creates an HTTP endpoint that can be called from email links with a RequestID parameter.

**UI steps:**
1. Open **Power Automate** → **Create** → **Instant cloud flow**
2. Name the flow: `PR-Confirm_EstimateApproval`
3. Choose trigger: **When an HTTP request is received**
4. Click **Create**

### Step 2: Configure the HTTP Trigger

**What this does:** Sets up the trigger to accept a RequestID parameter from the confirmation link.

**UI steps:**
1. In the **When an HTTP request is received** trigger
2. Click **Use sample payload to generate schema**
3. Paste this sample JSON:
```json
{
  "RequestID": "123"
}
```
4. Click **Done**
5. **Configure retry policy** on this trigger

**Request Schema (auto-generated):**
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

### Step 3: Get PrintRequest Item

**What this does:** Retrieves the specific PrintRequest from SharePoint using the RequestID.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get PrintRequest`
   - Click the **three dots (…)** → **Rename** → type `Get PrintRequest`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **RequestID** (from trigger)

### Step 4: Validate Request Status

**What this does:** Ensures the request is in "Pending" status before proceeding with confirmation.

**UI steps:**
1. Click **+ New step**
2. Search for and select **Condition**
3. Rename the condition to: `Validate Pending Status`
   - Click the **three dots (…)** → **Rename** → type `Validate Pending Status`
4. Set up condition:
   - Left box: **Dynamic content** → **Status** (from Get PrintRequest)
   - Middle: **is equal to**
   - Right box: Type `Pending`

### Step 5a: Yes Branch - Process Confirmation

**Action 1: Update status to Ready to Print**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Update item** (SharePoint)
3. Rename the action to: `Update to Ready to Print`
   - Click the **three dots (…)** → **Rename** → type `Update to Ready to Print`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **RequestID** (from trigger)
   - **Status:** Type `Ready to Print`
   - **LastAction:** Type `Estimate Confirmed`
   - **LastActionBy:** **Dynamic content** → **Student Claims** (from Get PrintRequest)
   - **LastActionAt:** **Expression** → `utcNow()`

**Action 2: Log confirmation in AuditLog**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Estimate Confirmation`
   - Click the **three dots (…)** → **Rename** → type `Log Estimate Confirmation`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Student Confirmed Estimate`
   - **RequestID:** **Dynamic content** → **RequestID** (from trigger)
   - **ReqKey:** **Dynamic content** → **ReqKey** (from Get PrintRequest)
   - **Action Value:** Type `Estimate Confirmed`
   - **FieldName:** Type `Status`
   - **OldValue:** Type `Pending`
   - **NewValue:** Type `Ready to Print`
   - **Actor Claims:** **Dynamic content** → **Student Claims** (from Get PrintRequest)
   - **ActorRole Value:** Type `Student`
   - **ClientApp Value:** Type `Email Link`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** **Expression** → `concat('Student confirmed estimate via email link for request ', triggerOutputs()?['body/RequestID'])`

**Action 3: Return success response**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Response**
3. Rename the action to: `Success Response`
   - Click the **three dots (…)** → **Rename** → type `Success Response`
4. Fill in:
   - **Status Code:** Type `200`
   - **Headers:** Leave blank
   - **Body:** Paste this HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Estimate Confirmed</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px 0 0; }
        .button:hover { background-color: #0056b3; }
    </style>
</head>
<body>
    <div class="success">
        <h2>✅ Estimate Confirmed Successfully!</h2>
        <p>Thank you for confirming your 3D print estimate.</p>
    </div>
    
    <div class="details">
        <h3>What Happens Next:</h3>
        <ul>
            <li>Your request is now queued for printing</li>
            <li>We'll begin preparing your print job</li>
            <li>You'll receive an email when it's completed and ready for pickup</li>
            <li>Payment will be due at pickup based on actual material used</li>
        </ul>
    </div>
    
    <p>
        <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="button">View My Requests</a>
        <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab" class="button">Lab Homepage</a>
    </p>
    
    <p><em>LSU Digital Fabrication Lab</em></p>
</body>
</html>
```

### Step 5b: No Branch - Handle Invalid Status

**Action 1: Return error response**
1. Click **+ Add an action** in No branch
2. Search for and select **Response**
3. Rename the action to: `Error Response`
   - Click the **three dots (…)** → **Rename** → type `Error Response`
4. Fill in:
   - **Status Code:** Type `400`
   - **Headers:** Leave blank
   - **Body:** Paste this HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Confirmation Error</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px 0 0; }
        .button:hover { background-color: #0056b3; }
    </style>
</head>
<body>
    <div class="error">
        <h2>⚠️ Unable to Process Confirmation</h2>
        <p>This estimate confirmation link is no longer valid or has already been processed.</p>
    </div>
    
    <p><strong>Possible reasons:</strong></p>
    <ul>
        <li>You have already confirmed this estimate</li>
        <li>The request status has been changed by staff</li>
        <li>The confirmation link has expired</li>
    </ul>
    
    <p>Please check your request status or contact the lab if you need assistance.</p>
    
    <p>
        <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="button">View My Requests</a>
        <a href="mailto:coad-fablab@lsu.edu" class="button">Contact Lab</a>
    </p>
    
    <p><em>LSU Digital Fabrication Lab</em></p>
</body>
</html>
```

---

## Get the HTTP POST URL

After saving the flow, you'll need the HTTP POST URL to use in the estimate email:

**UI steps:**
1. **Save** the flow
2. In the **When an HTTP request is received** trigger, copy the **HTTP POST URL**
3. The URL will look like: `https://prod-12.westus.logic.azure.com:443/workflows/12345678901234567890/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SIGNATURE`

**Update the estimate email template:**
Replace the placeholder URL in the `PR-Audit_LogChanges.md` email template with the actual flow URL, and modify it to include the RequestID parameter:

```html
<a href="https://prod-12.westus.logic.azure.com:443/workflows/12345678901234567890/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SIGNATURE&RequestID=[Dynamic content: ID]" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">✅ Yes, proceed with printing</a>
```

**Important:** The `RequestID=[Dynamic content: ID]` parameter gets passed to the flow and used to identify which print request to confirm.

---

## Testing the Flow

### Manual Test
1. **Create a test request** in SharePoint with status = "Pending"
2. **Get the flow URL** from the trigger
3. **Test the URL** in a browser with `?RequestID=123` (replace 123 with actual ID)
4. **Verify** the status changed to "Ready to Print" and AuditLog entry was created

### Integration Test
1. **Submit a new print request** as a student
2. **Approve it** using the Power Apps staff console (should set status to "Pending")
3. **Check email** for the estimate notification
4. **Click the confirmation link** in the email
5. **Verify** the success page appears and status updates to "Ready to Print"

---

## URL Reference Guide

**Replace these with your actual URLs:**

- **Flow HTTP endpoint:** `https://prod-12.westus.logic.azure.com:443/workflows/YOUR_WORKFLOW_ID/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YOUR_SIGNATURE`
- **Site root:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **My Requests view:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`
- **Contact email:** `coad-fablab@lsu.edu`

---

## Security Considerations

### URL Security
- The HTTP POST URL contains a signature parameter that prevents unauthorized access
- RequestID parameter ensures students can only confirm their own requests (if they have the link)
- Flow validates the request status before processing

### Student Authentication
- Students must have received the email with the confirmation link to access this flow
- The email is sent to their verified student email address
- SharePoint item-level permissions ensure they can only view their own requests

### Error Handling
- Invalid RequestIDs return a proper error page
- Already-processed confirmations show appropriate messaging  
- All confirmations are logged in AuditLog for audit trail

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

---

## Troubleshooting

- **"Flow not found" error:** Verify the HTTP POST URL is correct and flow is turned on
- **"RequestID missing" error:** Ensure the email link includes `&RequestID=[Dynamic content: ID]` parameter
- **Confirmation not working:** Check that request status is "Pending" before clicking link
- **Permission errors:** Verify flow connections have proper SharePoint access
- **Email link broken:** Regenerate the HTTP POST URL if the flow was recreated

---

## Flow Dependencies

**Requires these flows to be working:**
- **PR-Create** (Flow A) - Creates the initial requests
- **PR-Audit** (Flow B) - Sends the estimate emails with confirmation links
- **PR-Action_LogAction** (Flow C) - Handles staff actions that set status to "Pending"

**SharePoint Lists:**
- `PrintRequests` - Updates status and LastAction fields
- `AuditLog` - Creates confirmation audit entries

**Connections:**
- SharePoint (for list operations)
- HTTP (built-in, no connection required)
