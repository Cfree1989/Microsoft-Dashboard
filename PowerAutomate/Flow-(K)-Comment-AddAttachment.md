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

### Step 2: Initialize varSuccess

**+ Add an action** → **Initialize variable**

- Rename: `Initialize varSuccess`
- Name: `varSuccess`
- Type: Boolean
- Value: `true`

### Step 3: Initialize varMessage

**+ Add an action** under varSuccess → **Initialize variable** (a second card)

- Rename: `Initialize varMessage`
- Name: `varMessage`
- Type: String
- Value: leave empty

Until this card exists, **Set variable** will only list `varSuccess`.

### Step 4: Add Screenshot to Comment

**+ Add an action** → SharePoint **Add attachment**. Rename: `Add Screenshot to Comment`.

**Settings:** Exponential retry 4 / PT1M / PT20S / PT1H.

**Parameters:**

| Field | Value |
|--------|--------|
| Site | Digital Fabrication Lab |
| List | `RequestComments` |
| Id | `int(triggerBody()['text'])` |
| File Name | `triggerBody()?['file']?['name']` |
| File Content | `triggerBody()?['file']?['contentBytes']` |

### Step 5: Set varMessage attached

**+ Add an action** under Add Screenshot → **Set variable**

- Rename: `Set varMessage attached`
- Name: pick **`varMessage`**
- Value: click **Enter custom value**, then type `Screenshot attached.` (do not pick true/false)


### Step 6: Respond to Power Apps

**+ Add an action** under Set varMessage. Search **Respond to a Power App or flow** (Power Apps connector). Rename the card: `Respond to Power Apps`.

On **Parameters**, click **Add an output** twice (both **Text**):

| What you name the output | Where | What you enter |
|--------------------------|--------|----------------|
| `Success` | **Value** box next to that output → **fx** | `toLower(string(variables('varSuccess')))` |
| `Message` | **Value** box next to that output → **fx** | `variables('varMessage')` |

Do not type those into the **name** of the output. Name is `Success` / `Message`. The formulas go in **Value** as expressions (**fx** → paste → Add).

Canvas order:

`When Power Apps calls a flow (V2)` → `Initialize varSuccess` → `Initialize varMessage` → `Add Screenshot to Comment` → `Set varMessage attached` → `Respond`

If Add attachment fails, the flow fails and the Staff app `IfError` treats it as a failed upload.

---

## Power Apps call

Add this flow in the Staff Console **Power Automate** pane (lightning bolt), same as Flow C / H / I. The flow title is `Flow-(K)-Comment-AddAttachment`. Studio may bind it as **`PowerAppV2->InitializevarSuccess`** — that is the `.Run` name.

The Data pane may show this flow as **`PowerAppV2->InitializevarSuccess`**. Send uses that identifier for `.Run`. File argument is **Screenshot**; text is **CommentID**.

```powerfx
'PowerAppV2->InitializevarSuccess'.Run(
    {
        contentBytes: First(attViewMsg.Attachments).Value,
        name: First(attViewMsg.Attachments).Name
    },
    Text(varNewComment.ID)
)
```

One screenshot per send (`MaxAttachments = 1`). Canvas cannot call a flow inside `ForAll`.

If Studio shows a different `.Run(` shape after you add the flow, match Studio — then update this spec and `btnViewMsgSend`.

---

## Testing Checklist

- [ ] File input named `Screenshot`, text input named `CommentID`, in that order
- [ ] `RequestComments` has attachments enabled
- [ ] From the Staff messages modal, attach a small PNG and Send
- [ ] SharePoint message row shows the PNG on the paperclip
- [ ] Flow D has **not** emailed yet until `ReadyToEmail` is Yes
- [ ] Respond returns `success` = `true`
- [ ] A failed Add attachment fails the flow; the app does **not** set `ReadyToEmail`

---

## Notes

- One file per run. Multiple screenshots = multiple `.Run(` calls from the app, then one `ReadyToEmail = true`.
- Do not set `ReadyToEmail` in this flow. The app does that after every file succeeds, so Flow D never emails an incomplete set.
- Max size in the app picker is 10 MB per file (screenshots). Do not raise this to the 50 MB STL limit.
