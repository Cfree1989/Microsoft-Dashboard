# Flow A — PR-Create: Set ReqKey + Acknowledge

**Trigger:** SharePoint — When an item is **created** (List: `PrintRequests`)

**Purpose:** When a new request is created, assign a **ReqKey**, generate standardized filename, log a **Created** event, and email the student with confirmation.

---

## Error Handling Configuration
**Configure retry policies on all actions for resilience:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 1 minute
- **Apply to:** Update item, Create item (AuditLog), Send email actions

---

## Step-by-Step Implementation

### 1. **Compose Action: "Generate ReqKey"**
```javascript
@{concat('REQ-', right(concat('00000', string(triggerOutputs()?['body/ID'])), 5))}
```

### 2. **Compose Action: "Generate Standardized Filename"**
```javascript
@{concat(
  replace(replace(replace(replace(replace(triggerOutputs()?['body/Student/DisplayName'], ' ', ''), '-', ''), '''', ''), '.', ''), ',', ''),
  '_',
  triggerOutputs()?['body/Method'],
  '_', 
  triggerOutputs()?['body/Color'],
  '_',
  right(outputs('Generate ReqKey'), 5),
  '.',
  last(split(triggerOutputs()?['body/Attachments'][0]['Name'], '.'))
)}
```

### 3. **Update item** (SharePoint) - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **List Name:** `PrintRequests`
- **Id:** `ID` (from trigger)
- **ReqKey:** `Outputs` (from Generate ReqKey step)
- **Title:** 
```javascript
@{replace(outputs('Generate Standardized Filename'), concat('.', last(split(triggerOutputs()?['body/Attachments'][0]['Name'], '.'))), '')}
```
- **StudentEmail:**
```javascript
@{toLower(triggerOutputs()?['body/Author/Email'])}
```
- **Status:** `Uploaded` (default)
- **NeedsAttention:** `Yes` (new requests need attention)
- **LastAction:** `Created`
- **LastActionBy:** `Author Claims` (from trigger)
- **LastActionAt:** 
```javascript
@{utcNow()}
```

### 4. **Create item** in `AuditLog` - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** same
- **List Name:** `AuditLog`
- **Title:** `Request Created`
- **RequestID:** `@{triggerOutputs()?['body/ID']}`
- **ReqKey:** `Outputs` (from Generate ReqKey)
- **Action Value:** `Created`
- **FieldName:** (leave blank)
- **OldValue:** (leave blank)  
- **NewValue:** `@{outputs('Generate Standardized Filename')}`
- **Actor Claims:** `Author Claims` (from trigger)
- **ActorRole Value:** `Student`
- **ClientApp Value:** `SharePoint Form`
- **ActionAt:**
```javascript
@{utcNow()}
```
- **FlowRunId:**
```javascript
@{workflow()['run']['name']}
```
- **Notes:** `New 3D print request submitted with standardized filename`

### 5. **Send an email from a shared mailbox (V2)** - **Configure Retry Policy: Exponential, 4 retries**
- **Shared Mailbox:** `coad-Fabrication Lab@lsu.edu`
- **To:** `StudentEmail` (from Update item step)
- **Subject:**
```
We received your 3D Print request – @{outputs('Generate ReqKey')}
```
- **Body:**
```html
<p>We received your 3D Print request.</p>
<p><strong>Request:</strong> @{replace(outputs('Generate Standardized Filename'), concat('.', last(split(triggerOutputs()?['body/Attachments'][0]['Name'], '.'))), '')}</p>
<p><strong>Request ID:</strong> @{outputs('Generate ReqKey')}</p>
<p><strong>Method:</strong> @{triggerOutputs()?['body/Method']}</p>
<p><strong>Printer:</strong> @{triggerOutputs()?['body/PrinterSelection']}</p>
<p><strong>Color:</strong> @{triggerOutputs()?['body/Color']}</p>
<br>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Our team will review your request for technical feasibility</li>
  <li>You'll receive updates as your request progresses through our queue</li>
  <li>Estimated review time: 1-2 business days</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><strong>File Requirements Reminder:</strong></p>
<p>• Accepted formats: .stl, .obj, .3mf only<br>
• Maximum file size: 150MB per file<br>
• Files not meeting requirements will be rejected</p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

### 6. **Create item** in `AuditLog` (Email Sent) - **Configure Retry Policy: Exponential, 4 retries**
- **Site Address:** same
- **List Name:** `AuditLog`
- **Title:** `Email Sent: Confirmation`
- **RequestID:** `@{triggerOutputs()?['body/ID']}`
- **ReqKey:** `Outputs` (from Generate ReqKey)
- **Action Value:** `Email Sent`
- **FieldName:** `StudentEmail`
- **NewValue:** `@{outputs('Update item')?['body/StudentEmail']}`
- **Actor Claims:** (leave blank for system)
- **ActorRole Value:** `System`
- **ClientApp Value:** `Power Automate`
- **ActionAt:**
```javascript
@{utcNow()}
```
- **FlowRunId:**
```javascript
@{workflow()['run']['name']}
```
- **Notes:** `Confirmation email sent to student`

---

## Key Features Added

✅ **Standardized Filename Generation** - Creates consistent, searchable filenames  
✅ **Enhanced Title Update** - Uses standardized name (without extension)  
✅ **Complete Audit Logging** - Includes FlowRunId, ActionAt timestamps  
✅ **Email Audit Trail** - Logs all sent emails for compliance  
✅ **Rich HTML Email** - Professional formatting with complete information  
✅ **Error Handling** - Exponential retry policies on all critical actions  
✅ **NeedsAttention Flag** - New requests automatically flagged for staff review  
✅ **Comprehensive Links** - Both item detail and "My Requests" view links  

---

## Error Handling Notes

- **Infinite Loop Prevention:** Flow only triggers on CREATE, not MODIFY
- **Attachment Validation:** Uses first attachment for filename generation
- **Person Field Resolution:** Uses Author Claims for reliable person mapping  
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint

---

## Testing Checklist

- [ ] ReqKey generates in format "REQ-00001"
- [ ] Standardized filename created correctly
- [ ] Title field updated without file extension
- [ ] StudentEmail populated from author
- [ ] NeedsAttention set to Yes
- [ ] LastAction fields populated
- [ ] Two AuditLog entries created (Created + Email Sent)
- [ ] Confirmation email received with all links working
- [ ] Retry policies trigger on simulated failures
