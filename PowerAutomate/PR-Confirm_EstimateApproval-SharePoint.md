# Flow D — Student Estimate Confirmation via SharePoint (Alternative Implementation)

**Type:** SharePoint-based confirmation (no separate flow required)

**Purpose:** When a student receives an estimate email, they confirm by editing their request in SharePoint. The existing PR-Audit flow detects the confirmation and updates the status to "Ready to Print".

**Advantages over HTTP Trigger approach:**
- ✅ No authentication/authorization issues
- ✅ SharePoint handles all security automatically
- ✅ Students can only see/edit their own requests
- ✅ Simpler implementation (no separate flow needed)
- ✅ Works across all browsers and email clients
- ✅ Familiar interface for students

---

## Implementation Plan Overview

Instead of creating a separate HTTP-triggered flow, we'll:
1. Add a "StudentConfirmed" field to the PrintRequests list
2. Secure the "My Requests" view so students only see their own items
3. Update the estimate email to include a SharePoint link
4. Enhance PR-Audit flow to detect confirmation and update status
5. Add audit logging for student confirmations

**Total Time:** ~30-45 minutes

---

## Step 1: Add StudentConfirmed Field to PrintRequests List

**What this does:** Creates a Yes/No field that students will toggle to confirm their estimate.

**UI steps:**
1. Go to **SharePoint** → Your site → **PrintRequests** list
2. Click **Add column** (or + Add column button)
3. Select **Yes/No**
4. **Name:** Type `StudentConfirmed`
5. **Description:** Type `Student has confirmed the estimate and approved proceeding with print`
6. **Default value:** Select **No**
7. Click **Save**

**✅ Test Step 1:** 
- Refresh the list view
- Verify you see the new "StudentConfirmed" column
- Check a few items - they should all default to "No"

---

## Step 2: Verify "My Requests" View Security

**What this does:** Ensures students can only see and edit their own print requests, not other students' requests.

### Part A: Check List Permissions

**UI steps:**
1. In **PrintRequests** list → Click **⚙ Settings** (gear icon) → **List settings**
2. Under **Permissions and Management** → Click **Permissions for this list**
3. Check if list has unique permissions (should see a message at top)
4. Verify students have **Contribute** permission (NOT **Full Control** or **Design**)

**⚠️ Important:** If students have "Read" only, they won't be able to edit. If they have "Full Control", they can see everything.

### Part B: Configure Item-Level Permissions

**UI steps:**
1. Still in **List settings** → Under **General Settings** → Click **Advanced settings**
2. Scroll to **Item-level Permissions** section
3. **Read access:** Select **Read items that were created by the user**
4. **Create and Edit access:** Select **Create items and edit items that were created by the user**
5. Click **OK**

**⚠️ Critical Security:** These settings ensure students can only see/edit items where they are the creator (or where Student field = them).

### Part C: Verify "My Requests" View Filter

**UI steps:**
1. In **PrintRequests** list → Find **My Requests** view in the view dropdown
2. Click **Edit current view** (or click **All Items** → **More** → **Edit current view**)
3. If "My Requests" doesn't exist, create it:
   - Click **All Items** → **Create new view**
   - Name: `My Requests`
   - Make available to: **All users**
4. Scroll to **Filter** section
5. **Show items only when the following is true:**
   - Column: **Student**
   - Operator: **is equal to**
   - Value: **[Me]**
6. Click **OK**

**✅ Test Step 2:**
- Open the list as a different user (or in private browser)
- View "My Requests" - should only show items where you are the student
- Try to edit someone else's item by URL manipulation - should get "Access Denied"

---

## Step 3: Update Estimate Email in PR-Audit Flow

**What this does:** Changes the email to include a SharePoint link instead of an HTTP trigger link.

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. Find **PR-Audit: Log changes + Email notifications**
3. Click **Edit**
4. Find the **Send Estimate Email** action (in the "Check Status Pending" branch)
5. Click on the action to expand it
6. Update the **Body** field with the new HTML below:

**New Email Body HTML:**
```html
<p>Hi @{outputs('Get_Current_Pending_Data')?['body/Student']?['DisplayName']},</p>
<br>
<p>Your 3D print estimate is ready! Before we start printing, please review and confirm the details below.</p>
<p><strong>⚠️ We will not run your print without your confirmation.</strong></p>
<br>
<div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; border-left: 4px solid #0078d4;">
    <p><strong>Request:</strong> @{outputs('Get_Current_Pending_Data')?['body/ReqKey']}</p>
    <p><strong>Estimated Cost:</strong> $@{if(equals(outputs('Get_Current_Pending_Data')?['body/EstimatedCost'], null), 'TBD', outputs('Get_Current_Pending_Data')?['body/EstimatedCost'])}</p>
    <p><strong>Color:</strong> @{outputs('Get_Current_Pending_Data')?['body/Color']?['Value']}</p>
    <p><strong>Print Time:</strong> @{if(equals(outputs('Get_Current_Pending_Data')?['body/EstHours'], null), 'TBD', concat(string(outputs('Get_Current_Pending_Data')?['body/EstHours']), ' hours'))}</p>
</div>
<br>
<p><strong>📋 To confirm this estimate:</strong></p>
<ol>
    <li>Click the button below to view your request</li>
    <li>Find the <strong>"StudentConfirmed"</strong> field</li>
    <li>Change it from <strong>"No"</strong> to <strong>"Yes"</strong></li>
    <li>Click <strong>"Save"</strong> at the top</li>
</ol>
<br>
<p style="text-align: center;">
    <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">📝 View & Confirm My Request</a>
</p>
<br>
<p style="background-color: #fff3cd; padding: 10px; border-radius: 5px;"><strong>💡 Tip:</strong> The link will open your requests in SharePoint. Your request should be at the top of the list.</p>
<br>
<p>If you have any questions or concerns about the estimate, please contact us before confirming.</p>
<br>
<p>Thank you,<br>
<strong>LSU Digital Fabrication Lab</strong></p>
<p style="font-size: 12px; color: #666;">
    <strong>Lab Hours:</strong> Monday-Friday 8:30 AM - 4:30 PM<br>
    <strong>Email:</strong> coad-fablab@lsu.edu<br>
    <strong>Location:</strong> Room 145 Atkinson Hall
</p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**✅ Test Step 3:** Save the flow → Test by changing a request to "Pending" → Check email for new format

---

## Step 4: Add Confirmation Detection to PR-Audit Flow

**What this does:** Detects when StudentConfirmed changes to "Yes" and automatically updates status to "Ready to Print".

**UI steps:**
1. Still in **PR-Audit** flow editor
2. Find the **Get Item Changes** action (should be near the top after the trigger)
3. After **Get Item Changes** → Add a new **Condition**
4. **Rename:** Click **three dots (…)** → **Rename** → Type `Check StudentConfirmed Changed`
5. **Configure condition:**
   - **Left:** Click **Add dynamic content** → Select **Has Column Changed: StudentConfirmed** (from Get Item Changes)
   - **Middle:** Select **is equal to**
   - **Right:** Type `true`

### In YES Branch (StudentConfirmed Changed):

**Action 1: Check if Changed to Yes**
1. **+ Add an action** → **Condition**
2. **Rename:** Type `Validate StudentConfirmed is Yes`
3. **Configure:**
   - **Left:** Click **Expression** → Type `triggerOutputs()?['body/StudentConfirmed']`
   - **Middle:** **is equal to**
   - **Right:** Type `true`

### In YES Branch (StudentConfirmed = Yes):

**Action 2: Update Status to Ready to Print**
1. **+ Add an action** → **Update item** (SharePoint)
2. **Rename:** Type `Update to Ready to Print`
3. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry Policy:** **On**
   - **Type:** **Exponential**
   - **Count:** **4**
   - **Minimum Interval:** **PT30S**
   - Click **Done**
4. **Fill in fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **Status Value:** Type `Ready to Print`
   - **LastAction:** Type `Student Confirmed Estimate`
   - **LastActionBy Claims:** Click **Expression** → Type `triggerOutputs()?['body/Student']?['Claims']`
   - **LastActionAt:** Click **Expression** → Type `utcNow()`

**Action 3: Log Confirmation in AuditLog**
1. **+ Add an action** → **Create item** (SharePoint)
2. **Rename:** Type `Log Student Confirmation`
3. **Configure retry policy** (same as Action 2)
4. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Student Confirmed Estimate via SharePoint`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Estimate Confirmed`
   - **FieldName:** Type `StudentConfirmed`
   - **OldValue:** Type `No`
   - **NewValue:** Type `Yes`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Student']?['Claims']`
   - **ActorRole Value:** Type `Student`
   - **ClientApp Value:** Type `SharePoint`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type:
   ```
   concat('Student confirmed estimate via SharePoint for request ', triggerOutputs()?['body/ReqKey'], '. Status changed from Pending to Ready to Print.')
   ```

**✅ Test Step 4:** 
- Save flow
- Create test request with Status = "Pending"
- Open in SharePoint → Change StudentConfirmed to "Yes" → Save
- Check: Status should change to "Ready to Print"
- Check: AuditLog should have confirmation entry

---

## Step 5: Add Confirmation Email to Student (Optional)

**What this does:** Sends an automatic confirmation email to the student after they confirm, reassuring them that their action was received.

**UI steps:**
1. Still in PR-Audit flow, after **Log Student Confirmation** action
2. **+ Add an action** → **Send an email from a shared mailbox (V2)**
3. **Rename:** Type `Send Confirmation Receipt to Student`
4. **Configure retry policy** (Exponential, Count 4, PT1M)
5. **Fill in:**
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** Click **Expression** → Type `triggerOutputs()?['body/StudentEmail']`
   - **Subject:** Click **Expression** → Type:
   ```
   concat('Estimate confirmed – ', triggerOutputs()?['body/ReqKey'], ' – Ready to print')
   ```
   - **Body:** Paste HTML below:

```html
<p>Hi @{triggerOutputs()?['body/Student']?['DisplayName']},</p>
<br>
<p>✅ <strong>Your estimate has been confirmed successfully!</strong></p>
<br>
<div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
    <p><strong>Request:</strong> @{triggerOutputs()?['body/ReqKey']}</p>
    <p><strong>Status:</strong> Ready to Print</p>
    <p><strong>Confirmed:</strong> @{formatDateTime(utcNow(), 'MMM dd, yyyy h:mm tt')}</p>
</div>
<br>
<p><strong>📋 What happens next:</strong></p>
<ul>
    <li>Your request is now in our print queue</li>
    <li>We'll begin preparing and printing your job</li>
    <li>You'll receive another email when it's completed and ready for pickup</li>
    <li>Payment will be due at pickup (TigerCASH only)</li>
</ul>
<br>
<p><strong>💡 Important reminders:</strong></p>
<ul>
    <li>Print times are estimates and may vary</li>
    <li>Final cost may differ slightly based on actual material used</li>
    <li>Bring your student ID for pickup</li>
</ul>
<br>
<p style="text-align: center;">
    <a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" style="background-color: #0078d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">📄 View My Requests</a>
</p>
<br>
<p>If you have any questions, feel free to contact us!</p>
<br>
<p>Thank you,<br>
<strong>LSU Digital Fabrication Lab</strong></p>
<p style="font-size: 12px; color: #666;">
    <strong>Lab Hours:</strong> Monday-Friday 8:30 AM - 4:30 PM<br>
    <strong>Email:</strong> coad-fablab@lsu.edu<br>
    <strong>Location:</strong> Room 145 Atkinson Hall
</p>
```

**✅ Test Step 5:** Confirm a test request → Check student's email for confirmation receipt

---

## Step 6: Final Testing Checklist

### Test 1: New Request Submission
- [ ] Submit new request via form
- [ ] Request appears in "My Requests" view
- [ ] StudentConfirmed defaults to "No"
- [ ] Status starts as "Uploaded"

### Test 2: Estimate Email
- [ ] Staff changes status to "Pending"
- [ ] Estimate email sent to student
- [ ] Email contains correct cost, color, time
- [ ] SharePoint link works
- [ ] Link goes to "My Requests" view

### Test 3: Student Confirmation
- [ ] Student clicks link from email
- [ ] Opens to "My Requests" view
- [ ] Can see only their own requests
- [ ] Can edit StudentConfirmed field
- [ ] Changes StudentConfirmed to "Yes"
- [ ] Clicks Save successfully

### Test 4: Automatic Status Update
- [ ] Status changes from "Pending" to "Ready to Print" automatically
- [ ] LastAction updates to "Student Confirmed Estimate"
- [ ] LastActionBy shows student's name
- [ ] LastActionAt shows current timestamp

### Test 5: Audit Logging
- [ ] AuditLog entry created for confirmation
- [ ] All fields populated correctly
- [ ] ClientApp shows "SharePoint"
- [ ] ActorRole shows "Student"
- [ ] Notes field describes the action

### Test 6: Confirmation Email (if implemented Step 5)
- [ ] Confirmation receipt email sent to student
- [ ] Contains correct request details
- [ ] Links work correctly

### Test 7: Security Verification
- [ ] Student A cannot see Student B's requests
- [ ] Student cannot edit other students' requests
- [ ] Staff can see all requests
- [ ] "My Requests" view filters correctly

### Test 8: Edge Cases
- [ ] What if student changes StudentConfirmed back to "No"? (Should nothing happen, or log the change)
- [ ] What if student changes StudentConfirmed multiple times? (Should handle gracefully)
- [ ] What if staff changes StudentConfirmed? (Should still work, but actor will be staff)

---

## Comparison: SharePoint vs HTTP Trigger Approach

| Feature | SharePoint Approach | HTTP Trigger Approach |
|---------|-------------------|---------------------|
| **Authentication** | ✅ Automatic (SharePoint) | ❌ Complex OAuth required |
| **Security** | ✅ Built-in item-level | ⚠️ Manual validation |
| **Student Experience** | ✅ Familiar interface | ⚠️ Custom HTML page |
| **Implementation Time** | ✅ 30-45 minutes | ❌ 2-3 hours |
| **Maintenance** | ✅ Low (uses existing flow) | ⚠️ Separate flow to maintain |
| **Reliability** | ✅ SharePoint infrastructure | ⚠️ Depends on org policies |
| **Works with Email** | ✅ Yes (link to SharePoint) | ❌ Not with SAS disabled |
| **Mobile Friendly** | ✅ SharePoint responsive | ⚠️ Custom HTML needed |
| **Error Handling** | ✅ SharePoint handles | ⚠️ Custom error pages |
| **Audit Trail** | ✅ Same as current system | ✅ Same capability |

---

## Troubleshooting Guide

### Issue 1: Student Can't See Their Request

**Symptoms:**
- "My Requests" view is empty
- Student gets "Access Denied"

**Fix:**
1. Check item-level permissions (Step 2B)
2. Verify Student field is populated correctly
3. Check "My Requests" view filter uses `[Me]`
4. Ensure student has Contribute permission on list

---

### Issue 2: Student Can See Other Requests

**Symptoms:**
- Multiple requests visible in "My Requests"
- Requests from other students appear

**Fix:**
1. Verify "My Requests" view has filter: Student = [Me]
2. Check item-level permissions are set to "created by user"
3. Clear browser cache and reload
4. Check if user is admin (admins see everything)

---

### Issue 3: StudentConfirmed Change Doesn't Trigger Flow

**Symptoms:**
- Student changes field but status doesn't update
- No AuditLog entry created

**Fix:**
1. Check PR-Audit flow is turned ON
2. Verify trigger is "When an item or file is modified"
3. Check "Check StudentConfirmed Changed" condition uses correct column
4. View flow run history for errors
5. Ensure Status was "Pending" before confirmation

---

### Issue 4: Student Can't Edit StudentConfirmed Field

**Symptoms:**
- Field appears as read-only
- "Save" button is grayed out

**Fix:**
1. Check list permissions - student needs Contribute
2. Verify student is the owner/creator of the item
3. Check if field is in a read-only section
4. Try editing from list view instead of form

---

### Issue 5: Multiple Confirmation Emails Sent

**Symptoms:**
- Student receives multiple confirmation emails
- Flow runs multiple times

**Fix:**
1. Check if PR-Audit flow has proper conditions
2. Add condition to only process if old value was "No" and new is "Yes"
3. Consider adding a "ConfirmationEmailSent" flag

---

## Advanced Enhancements

### Enhancement 1: Prevent Re-confirmation

Add logic to prevent processing if StudentConfirmed changes from Yes to No:

```
In "Validate StudentConfirmed is Yes" condition:
Add an additional check:
- outputs('Get_Item_Changes')?['body/StudentConfirmed/OldValue'] is equal to false
```

### Enhancement 2: Add Confirmation Deadline

Add a calculated column that shows days since estimate was sent, and warn if > 7 days.

### Enhancement 3: Auto-Reminder Email

If StudentConfirmed remains "No" for 3 days after Pending status, send reminder email.

---

## Maintenance Notes

**Monthly:**
- [ ] Review AuditLog for confirmation patterns
- [ ] Check for requests stuck in "Pending" status
- [ ] Verify "My Requests" view security still working

**Quarterly:**
- [ ] Test confirmation workflow end-to-end
- [ ] Update email templates with new lab hours/info
- [ ] Review and optimize PR-Audit flow performance

**As Needed:**
- [ ] Update SharePoint link if site structure changes
- [ ] Modify email templates based on student feedback
- [ ] Add fields or validation as requirements evolve

---

**📝 Document Version:** 1.0 (SharePoint Implementation)  
**Last Updated:** October 2025  
**Replaces:** HTTP Trigger approach due to authentication limitations  
**Compatibility:** SharePoint Online, Power Automate Premium

