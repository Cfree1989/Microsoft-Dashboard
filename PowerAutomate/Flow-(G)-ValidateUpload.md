# Flow G (PR-ValidateUpload)

**Full Name:** PR-ValidateUpload: Validate student upload request  
**Trigger:** Power Apps (instant flow)

**Purpose:** Validate that a student can upload files to a specific print request. Called from the Student Upload Portal before showing the upload interface.

---

## Quick Overview

This flow validates student upload requests by:

1. Accepting email and ReqKey from Power Apps
2. Looking up the PrintRequest by ReqKey
3. Validating the request exists
4. Verifying the email matches (case-insensitive)
5. Checking status is not Archived or Rejected
6. Returning validation result with request data or error message

---

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| StudentEmail | Text | Yes | Email entered by student in Upload Portal |
| ReqKey | Text | Yes | Request ID entered by student (REQ-00001) |

---

## Output Response

**Success Response:**
```json
{
  "IsValid": true,
  "RequestData": {
    "ID": 42,
    "ReqKey": "REQ-00042",
    "Title": "JaneDoe_Filament_Blue_00042",
    "StudentEmail": "jdoe@lsu.edu",
    "Status": "Ready to Print"
  },
  "ErrorMessage": ""
}
```

**Error Response:**
```json
{
  "IsValid": false,
  "RequestData": null,
  "ErrorMessage": "No request found with that ID. Please check your Request ID."
}
```

---

## Error Messages

| Condition | Error Message |
|-----------|---------------|
| ReqKey not found | "No request found with that ID. Please check your Request ID." |
| Email mismatch | "Email does not match the request on file. Use the email you submitted with." |
| Status = Archived | "This request has been archived and cannot accept new files." |
| Status = Rejected | "This request was rejected. Please submit a new request." |

---

## Step-by-Step Implementation

### Step 1: Create the Flow

1. Go to **Power Automate** → **Create** → **Instant cloud flow**
2. **Name:** `Flow G (PR-ValidateUpload)` or `PR-ValidateUpload: Validate student upload request`
3. **Trigger:** Select **PowerApps (V2)**
4. Click **Create**

---

### Step 2: Configure Input Parameters

1. In the **PowerApps (V2)** trigger, click **+ Add an input**
2. Select **Text**
3. **Name:** `StudentEmail`
4. Click **+ Add an input** again
5. Select **Text**
6. **Name:** `ReqKey`

---

### Step 3: Initialize Response Variables

**Action 1: Initialize IsValid Variable**

1. Click **+ New step** → Search **Initialize variable**
2. **Name:** `IsValid`
3. **Type:** Boolean
4. **Value:** `false`

**Action 2: Initialize ErrorMessage Variable**

1. Click **+ New step** → **Initialize variable**
2. **Name:** `ErrorMessage`
3. **Type:** String
4. **Value:** (leave empty)

**Action 3: Initialize RequestData Variable**

1. Click **+ New step** → **Initialize variable**
2. **Name:** `RequestData`
3. **Type:** String
4. **Value:** `null`

---

### Step 4: Look Up PrintRequest

1. Click **+ New step** → Search **SharePoint** → Select **Get items**
2. Rename action to: `Get PrintRequest by ReqKey`
3. Configure:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** Click in the box, then click **Expression** tab and enter:

```
concat('ReqKey eq ''', triggerBody()['text_1'], '''')
```

> **Note:** `text_1` corresponds to ReqKey. If your parameters have different internal names, adjust accordingly. You can check by clicking on the ReqKey dynamic content to see its internal reference.

4. **Top Count:** `1`

---

### Step 5: Check if Request Exists

1. Click **+ New step** → Search **Condition**
2. Rename to: `Check Request Exists`
3. Configure the condition:
   - Click in the left box → **Expression** tab → enter:

```
length(outputs('Get_PrintRequest_by_ReqKey')?['body/value'])
```

   - Operator: **is greater than**
   - Right value: `0`

---

### Step 6: If No - Request Not Found

In the **If no** branch:

1. Click **Add an action** → **Set variable**
2. **Name:** `ErrorMessage`
3. **Value:** `No request found with that ID. Please check your Request ID.`

---

### Step 7: If Yes - Continue Validation

In the **If yes** branch, we'll add nested conditions.

**Action 1: Get First Result**

1. Click **Add an action** → **Compose**
2. Rename to: `Get First Request`
3. **Inputs:** Click **Expression** tab → enter:

```
first(outputs('Get_PrintRequest_by_ReqKey')?['body/value'])
```

---

### Step 8: Validate Email Matches

1. Click **Add an action** (still in If yes) → **Condition**
2. Rename to: `Check Email Matches`
3. Configure:
   - Left value: Click **Expression** tab → enter:

```
toLower(outputs('Get_First_Request')?['StudentEmail'])
```

   - Operator: **is equal to**
   - Right value: Click **Expression** tab → enter:

```
toLower(triggerBody()['text'])
```

> **Note:** `text` is the internal name for StudentEmail parameter. Verify this matches your trigger.

---

### Step 9: If Email Doesn't Match

In the **If no** branch of Check Email Matches:

1. Click **Add an action** → **Set variable**
2. **Name:** `ErrorMessage`
3. **Value:** `Email does not match the request on file. Use the email you submitted with.`

---

### Step 10: If Email Matches - Check Status

In the **If yes** branch of Check Email Matches:

1. Click **Add an action** → **Condition**
2. Rename to: `Check Status Not Blocked`
3. Configure with **OR** logic:
   - Click **+ Add** → **Add row**
   - First condition:
     - Left: Click **Expression** → `outputs('Get_First_Request')?['Status/Value']`
     - Operator: **is equal to**
     - Right: `Archived`
   - Second condition:
     - Left: Click **Expression** → `outputs('Get_First_Request')?['Status/Value']`
     - Operator: **is equal to**
     - Right: `Rejected`
   - Change the operator between rows to **Or**

---

### Step 11: If Status is Blocked

In the **If yes** branch (status IS Archived or Rejected):

1. Click **Add an action** → **Condition**
2. Rename to: `Determine Block Reason`
3. Configure:
   - Left: Click **Expression** → `outputs('Get_First_Request')?['Status/Value']`
   - Operator: **is equal to**
   - Right: `Archived`

**If yes (Archived):**
1. **Set variable** → ErrorMessage → `This request has been archived and cannot accept new files.`

**If no (Rejected):**
1. **Set variable** → ErrorMessage → `This request was rejected. Please submit a new request.`

---

### Step 12: If Status is Valid - Set Success

In the **If no** branch of Check Status Not Blocked (meaning status is OK):

**Action 1: Set IsValid to True**

1. Click **Add an action** → **Set variable**
2. **Name:** `IsValid`
3. **Value:** `true` (click Expression tab and type `true`)

**Action 2: Build RequestData JSON**

1. Click **Add an action** → **Compose**
2. Rename to: `Build RequestData`
3. **Inputs:** Click **Expression** tab → enter:

```
json(concat(
  '{"ID":', outputs('Get_First_Request')?['ID'],
  ',"ReqKey":"', outputs('Get_First_Request')?['ReqKey'],
  '","Title":"', replace(coalesce(outputs('Get_First_Request')?['Title'], ''), '"', '\"'),
  '","StudentEmail":"', outputs('Get_First_Request')?['StudentEmail'],
  '","Status":"', outputs('Get_First_Request')?['Status/Value'], '"}'
))
```

**Action 3: Set RequestData Variable**

1. Click **Add an action** → **Set variable**
2. **Name:** `RequestData`
3. **Value:** Select dynamic content → `Outputs` from "Build RequestData"

---

### Step 13: Return Response to Power Apps

**After all the conditions close**, add the final response action:

1. Click **+ New step** (at the bottom, outside all conditions)
2. Search for **Respond to a PowerApp or flow**
3. Configure outputs by clicking **+ Add an output** for each:

**Output 1: IsValid**
- Type: **Yes/No**
- Name: `IsValid`
- Value: Select variable `IsValid`

**Output 2: RequestData**
- Type: **Text**
- Name: `RequestData`
- Value: Select variable `RequestData`

**Output 3: ErrorMessage**
- Type: **Text**
- Name: `ErrorMessage`
- Value: Select variable `ErrorMessage`

---

## Flow Structure Summary

```
PowerApps (V2) Trigger
    ↓
Initialize IsValid = false
Initialize ErrorMessage = ""
Initialize RequestData = "null"
    ↓
Get PrintRequest by ReqKey
    ↓
Condition: Request Exists?
├── No: Set ErrorMessage = "No request found..."
└── Yes:
    ├── Compose: Get First Request
    └── Condition: Email Matches?
        ├── No: Set ErrorMessage = "Email does not match..."
        └── Yes:
            └── Condition: Status Archived OR Rejected?
                ├── Yes: 
                │   └── Condition: Is Archived?
                │       ├── Yes: Set ErrorMessage = "archived..."
                │       └── No: Set ErrorMessage = "rejected..."
                └── No (Valid!):
                    ├── Set IsValid = true
                    ├── Build RequestData JSON
                    └── Set RequestData variable
    ↓
Respond to PowerApp (IsValid, RequestData, ErrorMessage)
```

---

## Testing the Flow

### Test 1: Valid Request
- **Input:** Valid email + existing ReqKey
- **Expected:** IsValid = true, RequestData populated, ErrorMessage empty

### Test 2: Invalid ReqKey
- **Input:** Any email + non-existent ReqKey (REQ-99999)
- **Expected:** IsValid = false, ErrorMessage = "No request found..."

### Test 3: Email Mismatch
- **Input:** Wrong email + valid ReqKey
- **Expected:** IsValid = false, ErrorMessage = "Email does not match..."

### Test 4: Archived Request
- **Input:** Valid email + ReqKey of archived request
- **Expected:** IsValid = false, ErrorMessage = "...archived..."

### Test 5: Rejected Request
- **Input:** Valid email + ReqKey of rejected request
- **Expected:** IsValid = false, ErrorMessage = "...rejected..."

---

## Power Apps Integration

In the Student Upload Portal, call this flow on the Lookup screen:

```powerfx
// btnLookup.OnSelect
Set(varIsLoading, true);
Set(varErrorMessage, "");

Set(varValidationResult, 
    'PR-ValidateUpload'.Run(
        txtEmail.Text,
        txtReqKey.Text
    )
);

Set(varIsLoading, false);

If(
    varValidationResult.IsValid,
    // Parse the JSON RequestData
    Set(varRequestData, 
        Table(ParseJSON(varValidationResult.RequestData))
    );
    Navigate(scrUpload, ScreenTransition.Fade),
    // Show error
    Set(varErrorMessage, varValidationResult.ErrorMessage)
)
```

> **Note:** The flow name in Power Apps depends on how you named it. Use the exact name shown in your Power Automate environment.

---

## Troubleshooting

### Flow Returns Empty RequestData
- Verify the Compose action "Build RequestData" is inside the valid path
- Check that Get_First_Request outputs are accessible

### Email Comparison Fails Unexpectedly
- Ensure both sides use `toLower()` for case-insensitive comparison
- Verify the StudentEmail field exists on PrintRequests

### Parameter Names Don't Match
- In PowerApps (V2) trigger, click on each input to see its internal name
- Common mappings: `text` = first text input, `text_1` = second text input
- Adjust expressions accordingly

### Filter Query Syntax Error
- Ensure single quotes are properly escaped: `''` for literal quote
- Test the filter in SharePoint first using the REST API endpoint

