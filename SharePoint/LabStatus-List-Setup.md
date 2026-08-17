# LabStatus SharePoint List Setup

**Purpose:** One student-readable row that shows how busy the print lab is, without letting students see anyone else’s jobs  
**Time Required:** 20 minutes

---

## Overview

Students are only allowed to read **their own** rows in `PrintRequests`. That is on purpose (privacy). It also means the Student Portal **cannot** count the whole queue by itself.

`LabStatus` solves that with a **single snapshot row** named `Current`. A staff-identity flow (Flow J) counts the real queue and writes numbers onto this row. Students only ever read this one row.

**Key Features:**
- Exactly **one** row (`Title` = `Current`) — this is not a log
- Counts for jobs waiting and jobs printing, split by Filament vs Resin
- A simple busy word: Quiet / Typical / Busy / Packed
- Lab hours, pickup location, and a typical-wait sentence live here so staff can change them without republishing the Student Portal
- Optional staff message (“XL down today”) and a manual override so staff can pin a busy word

**Related Documents:**
- **PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md`
- **Flow J (refresh snapshot):** `PowerAutomate/Flow-(J)-LabStatus-Refresh.md`
- **Student Portal App Spec:** `PowerApps/StudentPortal-App-Spec.md`

> ⚠️ **Do not skip permissions.** If this list uses “only their own” item-level security (the PrintRequests setting), students **cannot** see the snapshot. The Current row is created by staff, not by each student.

---

## Why this list exists (read this)

| What students ask | What they are allowed to see |
|-------------------|------------------------------|
| “How busy is the lab?” | Totals only (this list) |
| “Where is **my** job?” | Their own `PrintRequests` rows (My Requests) |
| Other students’ names, files, emails | Never |

Flow J runs as a **staff account**, so SharePoint lets it see every `PrintRequests` item. It writes only numbers and labels onto `LabStatus`. The Student Portal then does a simple `LookUp` on this list.

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `LabStatus`
6. **Description:** `Single-row snapshot of print-lab busyness for the Student Portal`
7. Click **Create**

> 💡 **Name must be exact:** `LabStatus` (no space). Power Apps and Flow J use this list name.

---

## Step 2: Turn off item-level “only their own”

1. On the LabStatus list, click **Settings** (gear) → **List settings**
2. Click **Advanced settings**
3. Under **Item-level Permissions**:
   - Read access: **Read all items**
   - Create and Edit access: **Create and edit all items**
4. Under **Attachments**, select **Disabled** (this list has no files)
5. Click **OK**

> ⚠️ **If you leave “Read access = Only their own”**, students will open Home and the Lab today card will be blank. The Current row was not created by them.

---

## Step 3: Add Columns

SharePoint already created **Title**. Leave it. You will type `Current` in that field when you create the one row.

### Column 1: BusyLevel (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `BusyLevel`
3. **Description:** `How busy the lab is right now (word students see)`
4. **Choices** (exact spelling — Power Apps and Flow J use these strings):
   - `Quiet`
   - `Typical`
   - `Busy`
   - `Packed`
5. **Default value:** `Quiet`
6. **Require that this column contains information:** Yes
7. Click **Save**

> 💡 **What the words mean (Flow J sets this from the waiting count):**
>
> | BusyLevel | Jobs waiting (Ready to Print) |
> |-----------|-------------------------------|
> | Quiet | 0–5 |
> | Typical | 6–15 |
> | Busy | 16–30 |
> | Packed | 31+ |
>
> Printing jobs are shown as a separate number. They do **not** change the word.

#### Optional: Color the BusyLevel pill

8. Click the **BusyLevel** column header → **Column settings** → **Format this column**
9. Click **Advanced mode**
10. Paste:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "color": "=if(@currentField == 'Typical', '#000000', '#ffffff')",
    "background-color": "=if(@currentField == 'Quiet', '#107C10', if(@currentField == 'Typical', '#FFB900', if(@currentField == 'Busy', '#FF8C00', if(@currentField == 'Packed', '#D13438', '#333333'))))",
    "border-radius": "10px",
    "padding": "4px 10px",
    "font-weight": "600",
    "display": "inline-block"
  },
  "txtContent": "@currentField"
}
```

11. Click **Save**

---

### Column 2: JobsWaiting (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `JobsWaiting`
3. **Description:** `Count of PrintRequests with Status = Ready to Print`
4. **Number of decimal places:** 0
5. **Default value:** `0`
6. **Require that this column contains information:** Yes
7. Click **Save**

> 💡 **Ready to Print** means the student confirmed the estimate and the job is in the print queue. It does **not** include Uploaded or Pending.

---

### Column 3: JobsPrinting (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `JobsPrinting`
3. **Description:** `Count of PrintRequests with Status = Printing`
4. **Number of decimal places:** 0
5. **Default value:** `0`
6. **Require that this column contains information:** Yes
7. Click **Save**

---

### Column 4: FilamentWaiting (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `FilamentWaiting`
3. **Description:** `Ready to Print jobs where Method = Filament`
4. **Number of decimal places:** 0
5. **Default value:** `0`
6. **Require that this column contains information:** Yes
7. Click **Save**

---

### Column 5: ResinWaiting (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `ResinWaiting`
3. **Description:** `Ready to Print jobs where Method = Resin`
4. **Number of decimal places:** 0
5. **Default value:** `0`
6. **Require that this column contains information:** Yes
7. Click **Save**

---

### Column 6: FilamentPrinting (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `FilamentPrinting`
3. **Description:** `Printing jobs where Method = Filament`
4. **Number of decimal places:** 0
5. **Default value:** `0`
6. **Require that this column contains information:** Yes
7. Click **Save**

---

### Column 7: ResinPrinting (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `ResinPrinting`
3. **Description:** `Printing jobs where Method = Resin`
4. **Number of decimal places:** 0
5. **Default value:** `0`
6. **Require that this column contains information:** Yes
7. Click **Save**

> 💡 **Check your math later:** `JobsWaiting` should equal `FilamentWaiting + ResinWaiting`. `JobsPrinting` should equal `FilamentPrinting + ResinPrinting`.

---

### Column 8: TypicalWaitText (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `TypicalWaitText`
3. **Description:** `Honest wait sentence shown on Home (not a clock time)`
4. **Default value:** `Typical wait after you confirm: 1–3 lab days`
5. Click **Save**

> ⚠️ **Flow J does not overwrite this.** Staff can edit the sentence in SharePoint (or later from the Staff Console). Do not promise a Tuesday 3:14 PM finish time here.

---

### Column 9: StaffMessage (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `StaffMessage`
3. **Description:** `Optional note students see (printer down, closed Friday, etc.)`
4. **Type of text:** Plain text
5. **Require that this column contains information:** No
6. Click **Save**

> 💡 **Examples:** `XL down today — expect longer filament waits.` or leave blank.

---

### Column 10: LabHours (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `LabHours`
3. **Description:** `Posted lab hours for the Student Portal banner`
4. **Default value:** `Mon–Fri 8:30 AM – 4:30 PM`
5. Click **Save**

> 💡 This replaces hardcoding `varLabHours` in the Student Portal once the Home card is wired up.

---

### Column 11: PickupLocation (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PickupLocation`
3. **Description:** `Pickup room students see on Home / My Requests`
4. **Default value:** `Room 113 Art Building`
5. Click **Save**

---

### Column 12: ManualOverride (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `ManualOverride`
3. **Description:** `If Yes, Flow J still updates counts but does not change BusyLevel`
4. **Default value:** No
5. Click **Save**

> 💡 **When to turn this on:** Finals week, a lab closure, or “we are packed even if the count looks typical.” Set **BusyLevel** by hand, set **ManualOverride** to **Yes**. Flow J will keep the counts fresh and leave your word alone.

---

### Column 13: UpdatedAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `UpdatedAt`
3. **Description:** `When Flow J last wrote this snapshot`
4. **Include time:** Yes
5. **Require that this column contains information:** No
6. Click **Save**

---

## Step 4: Set Permissions (students can read, not edit)

The Student Portal runs **as the student**. They must be allowed to **read** this list. They must **not** be allowed to change hours or counts.

1. Go to the LabStatus list
2. Click **Settings** (gear icon) → **List settings**
3. Click **Permissions for this list**
4. Click **Stop Inheriting Permissions**
5. Click **OK** to confirm
6. **Keep:**
   - Owners — **Full Control**
   - Your staff group — **Edit** or **Contribute**
7. **Grant Read** to the same people who can open the Student Portal:
   - If students are already **Visitors** on the site, grant that group **Read**
   - If you are not sure, add **Everyone except external users** with **Read** only
8. **Remove Contribute/Edit** from any group that includes ordinary students (for example **Members**, if students are in it)

> ⚠️ **Privacy check:** Open LabStatus in a private/InPrivate window as a **student** test account. You should see **one row** with counts only — no student names. You should **not** see an **Edit** button that saves.

> 💡 **Why not PrintRequests?** Counting `PrintRequests` from the student app would either fail (item-level security) or leak other students’ jobs. This list is the mailbox for totals only.

---

## Step 5: Create the one `Current` row

Flow J **updates** this row. It does not create it. If the row is missing, the flow fails on purpose so you notice.

1. Open the **LabStatus** list
2. Click **+ New**
3. Fill in:

| Field | Value to type |
|-------|----------------|
| Title | `Current` |
| BusyLevel | `Quiet` |
| JobsWaiting | `0` |
| JobsPrinting | `0` |
| FilamentWaiting | `0` |
| ResinWaiting | `0` |
| FilamentPrinting | `0` |
| ResinPrinting | `0` |
| TypicalWaitText | `Typical wait after you confirm: 1–3 lab days` |
| StaffMessage | *(leave blank)* |
| LabHours | `Mon–Fri 8:30 AM – 4:30 PM` |
| PickupLocation | `Room 113 Art Building` |
| ManualOverride | **No** |
| UpdatedAt | *(leave blank — Flow J fills this)* |

4. Click **Save**

> ⚠️ **Title must be exactly `Current`.** Flow J looks up that word. `current`, `Lab Status`, or a second row will break the flow.

> 💡 **Never add a second row.** If you accidentally create extras, delete them. This list is a scoreboard, not a history table.

---

## Column Summary

| Column | Type | Required | Default | Overwritten by Flow J? |
|--------|------|----------|---------|------------------------|
| Title | Single line | Yes | - | No (must stay `Current`) |
| BusyLevel | Choice | Yes | Quiet | Yes, unless ManualOverride = Yes |
| JobsWaiting | Number | Yes | 0 | Yes |
| JobsPrinting | Number | Yes | 0 | Yes |
| FilamentWaiting | Number | Yes | 0 | Yes |
| ResinWaiting | Number | Yes | 0 | Yes |
| FilamentPrinting | Number | Yes | 0 | Yes |
| ResinPrinting | Number | Yes | 0 | Yes |
| TypicalWaitText | Single line | No | Typical wait… | **No** |
| StaffMessage | Multi-line | No | - | **No** |
| LabHours | Single line | No | Mon–Fri 8:30 AM – 4:30 PM | **No** |
| PickupLocation | Single line | No | Room 113 Art Building | **No** |
| ManualOverride | Yes/No | No | No | **No** |
| UpdatedAt | Date and time | No | - | Yes |

---

## Data Flow Example

**Scenario:** It is Tuesday afternoon. The queue has 11 filament jobs and 3 resin jobs waiting (Ready to Print), and 2 filament jobs plus 1 resin job printing.

| Title | BusyLevel | JobsWaiting | JobsPrinting | FilamentWaiting | ResinWaiting | FilamentPrinting | ResinPrinting | TypicalWaitText | StaffMessage | ManualOverride |
|-------|-----------|-------------|--------------|-----------------|--------------|------------------|---------------|-----------------|--------------|----------------|
| Current | Typical | 14 | 3 | 11 | 3 | 2 | 1 | Typical wait after you confirm: 1–3 lab days | *(blank)* | No |

**What students should see on Home later:**  
**Typical** · 14 jobs waiting · 3 printing · Filament 11 · Resin 3 · *Typical wait after you confirm: 1–3 lab days* · updated time

**What they must not see:** other students’ ReqKeys, names, files, or emails.

---

## Power Apps (later)

Add **LabStatus** as a data source in the **Student Portal** (same site as PrintRequests). Home will `LookUp(LabStatus, Title = "Current")` and show those fields. Do **not** add this list to a student gallery of jobs.

Staff do not need this list on the Staff Console for v1. They can edit `StaffMessage`, hours, and `ManualOverride` directly in SharePoint.

---

## Verification Checklist

- [ ] List named `LabStatus` on the same site as `PrintRequests`
- [ ] Advanced settings: **Read all items** (not “only their own”)
- [ ] Attachments disabled
- [ ] `BusyLevel` choices are exactly Quiet, Typical, Busy, Packed
- [ ] Seven number columns exist and default to 0
- [ ] `TypicalWaitText`, `LabHours`, `PickupLocation` have the starter values
- [ ] `ManualOverride` defaults to No
- [ ] `UpdatedAt` includes time
- [ ] Students have **Read** only; staff can **Edit**
- [ ] Exactly one list item, **Title** = `Current`
- [ ] A student test account can open the list and see counts, not other people’s print jobs

---

## Next Steps

1. Build the refresh flow: [Flow-(J)-LabStatus-Refresh.md](../PowerAutomate/Flow-(J)-LabStatus-Refresh.md)
2. After Flow J runs once, confirm the `Current` row numbers match a staff count of Ready to Print / Printing in PrintRequests
3. Wire the Student Portal Home card (see [StudentPortal-App-Spec.md](../PowerApps/StudentPortal-App-Spec.md))
