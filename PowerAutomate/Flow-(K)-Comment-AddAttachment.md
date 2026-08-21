# Flow K (Comment-AddAttachment)

**Full Name:** `Flow-(K)-Comment-AddAttachment`  
**Trigger:** When Power Apps calls a flow (V2)  
**Purpose:** Attach one screenshot (PNG/JPG) to an existing `RequestComments` row. The Staff Console calls this once per file **before** it sets `ReadyToEmail = Yes`. Flow D then emails the student with those files.

The canvas app **cannot** `Patch` SharePoint list attachments, and this picker is **not** inside a form. This flow is the save path.

**Related Documents:**
- `SharePoint/RequestComments-List-Setup.md` — `ReadyToEmail`, list attachments enabled
- `PowerAutomate/Flow-(D)-Message-Notifications.md` — sends the email after `ReadyToEmail = Yes`
- `PowerApps/StaffDashboard-App-Spec.md` — `attViewMsg` + `btnViewMsgSend.OnSelect`

---

## Input Reference

Add inputs in this exact order.

| # | Name | Type | Expression | Description |
|---|------|------|------------|-------------|
| 1 | Screenshot | File | Dynamic content **Screenshot** content / name | The image from the unbound Attachments picker |
| 2 | CommentID | Text | `triggerBody()['text']` | `RequestComments.ID` of the row created by Send |

> **File input:** After you add the File input, rename it from `File Content` to `Screenshot`. In later actions, pick **Screenshot** from dynamic content.

> **CommentID is Text, not Number:** Power Apps passes `Text(varNewComment.ID)`. Convert with `int(triggerBody()['text'])` on the SharePoint **Id** field.

---

## Output Reference

| Name | Type | Description |
|------|------|-------------|
| Success | Text | `"true"` on success, `"false"` on failure |
| Message | Text | Short result for the app |

Power Apps reads these as lowercase: `success`, `message`.

---

## Step-by-Step Implementation

### Step 1: Create the flow

1. Power Automate → **Create** → **Instant cloud flow**
2. **Name:** `Flow-(K)-Comment-AddAttachment`
3. Skip the default trigger. Delete it if Studio added **Manually trigger a cloud flow** or classic **Power Apps**.
4. Add trigger: **Power Apps (V2)** / **When Power Apps calls a flow (V2)**
5. **Add an input** → **File** → rename to `Screenshot`
6. **Add an input** → **Text** → name `CommentID` → description `RequestComments ID`

### Step 2: Initialize result variables (root level)

1. **Initialize variable** → `Initialize varSuccess`
   - Name: `varSuccess` | Type: Boolean | Value: `true`
2. **Initialize variable** → `Initialize varMessage`
   - Name: `varMessage` | Type: String | Value: empty

### Step 3: Add attachment

1. **SharePoint – Add attachment**
2. Rename: `Add Screenshot to Comment`
3. Retry policy: Exponential interval, Count `4`, Interval `PT1M`, Minimum `PT20S`, Maximum `PT1H`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `RequestComments`
   - **Id:** Expression `int(triggerBody()['text'])`
   - **File Name:** dynamic content **Screenshot name** (or expression from the test run)
   - **File Content:** dynamic content **Screenshot content**

Configure **Configure run after** on a parallel failure path, or wrap with **Scope** if you prefer. Minimum: add a second path — **Configure run after**: has failed / timed out → **Set variable** `varSuccess` = `false`, `varMessage` = `Could not attach screenshot.`

On success, **Set variable** `varMessage` = `Screenshot attached.`

### Step 4: Respond to Power Apps

1. **Respond to a Power App or flow**
2. Add outputs:
   - **Success** (Text): Expression `toLower(string(variables('varSuccess')))`
   - **Message** (Text): `variables('varMessage')`

Use lowercase `"true"` / `"false"` so the canvas `Text(success) = "true"` check works (same as Flow H / I).

---

## Power Apps call

Add this flow in the Staff Console **Power Automate** pane (lightning bolt), same as Flow C / H / I. The **Data** panel name must be exactly `Flow-(K)-Comment-AddAttachment`.

```powerfx
'Flow-(K)-Comment-AddAttachment'.Run(
    {
        contentBytes: f.Value,
        name: f.Name
    },
    Text(varNewComment.ID)
)
```

`f` is each row of `attViewMsg.Attachments` inside `ForAll`. First argument is the File input; second is `CommentID`.

If Studio shows a different `.Run(` shape after you add the flow, match Studio — then update this spec and `btnViewMsgSend`.

---

## Testing Checklist

- [ ] File input named `Screenshot`, text input named `CommentID`, in that order
- [ ] `RequestComments` has attachments enabled
- [ ] From the Staff messages modal, attach a small PNG and Send
- [ ] SharePoint message row shows the PNG on the paperclip
- [ ] Flow D has **not** emailed yet until `ReadyToEmail` is Yes
- [ ] Respond returns `success` = `true`
- [ ] A bad CommentID returns `success` = `false` and the app does **not** set `ReadyToEmail`

---

## Notes

- One file per run. Multiple screenshots = multiple `.Run(` calls from the app, then one `ReadyToEmail = true`.
- Do not set `ReadyToEmail` in this flow. The app does that after every file succeeds, so Flow D never emails an incomplete set.
- Max size in the app picker is 10 MB per file (screenshots). Do not raise this to the 50 MB STL limit.
