# Staff Console — Canvas App (Tablet)

**⏱️ Time Required:** 6-8 hours (can be done in multiple sessions)  
**🎯 Goal:** Staff can view, manage, and process all 3D print requests through an intuitive dashboard

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating the Canvas App](#step-1-creating-the-canvas-app)
3. [Adding Data Connections](#step-2-adding-data-connections)
4. [Setting Up App.OnStart](#step-3-setting-up-apponstart)
5. [Understanding Where Things Go](#understanding-where-things-go-read-this) ← **READ THIS FIRST!**
6. [Building the Top Navigation Bar](#step-4-building-the-top-navigation-bar)
7. [Creating Status Tabs](#step-5-creating-status-tabs)
8. [Building the Job Cards Gallery](#step-6-building-the-job-cards-gallery)
9. [Creating the Job Card Template](#step-7-creating-the-job-card-template)
10. [Adding Expandable Details](#step-8-adding-expandable-details)
11. [Implementing Action Buttons](#step-9-implementing-action-buttons)
12. [Building the Rejection Modal](#step-10-building-the-rejection-modal)
13. [Building the Approval Modal](#step-11-building-the-approval-modal)
14. [Building the Archive Modal](#step-12-building-the-archive-modal)
15. [Adding Search and Filters](#step-13-adding-search-and-filters)
16. [Adding the Lightbulb Attention System](#step-14-adding-the-lightbulb-attention-system)
17. [Adding the Attachments Modal](#step-15-adding-the-attachments-modal)
18. [Publishing the App](#step-16-publishing-the-app)
19. [Testing the App](#step-17-testing-the-app)
20. [Troubleshooting](#troubleshooting)
21. [Quick Reference Card](#quick-reference-card)

---

# Prerequisites

Before you start, make sure you have:

- [ ] **SharePoint lists created**: `PrintRequests`, `AuditLog`, `Staff`
- [ ] **Power Automate flows working**: Flow A (PR-Create), Flow B (PR-Audit), Flow C (PR-Action)
- [ ] **Staff list populated**: At least one staff member with `Active = Yes`
- [ ] **Power Apps license**: Standard license included with Microsoft 365

> ⚠️ **IMPORTANT:** Complete Phases 1 and 2 (SharePoint + Flows) before building the Staff Console. The app depends on these being set up correctly.

---

# STEP 1: Creating the Canvas App

**What you're doing:** Creating a new Canvas app with a Tablet layout, which gives you a wide screen perfect for viewing job queues.

### Instructions

1. Open **Power Apps** in your browser: [make.powerapps.com](https://make.powerapps.com)
2. Make sure you're in the correct **Environment** (top right dropdown — should show "Louisiana State Universi...").
3. In the left navigation, click **+ Create**.
4. Under "Create your apps", click **Start with a blank canvas**.
5. In the popup "Start with a blank canvas", click **Tablet size** (middle option, 1084 x 1386).
6. Enter these settings:
   - **App name:** `Console`
7. Click **Create**.

> 💡 **Tip:** Tablet format gives you a wide landscape canvas—perfect for dashboards with side-by-side content.

> 📝 **Naming alternatives:** You can also use `3D Print Queue Dashboard`, `FabLab Print Dashboard`, or any name that fits your lab.

### What You Should See

- The Power Apps Studio editor opens
- A blank white screen appears in the center
- The left panel shows **Tree view** with `Screen1`
- The top shows the formula bar

---

# STEP 2: Adding Data Connections

**What you're doing:** Connecting your app to the SharePoint lists and Power Automate flow it needs.

### Instructions

1. In the left panel, click the **Data** icon (cylinder icon, 4th from top).
2. Click **+ Add data**.
3. In the search box, type `SharePoint`.
4. Click **SharePoint** from the list.
5. You may see **duplicate SharePoint connections** (both showing your email). This is normal — **click either one**, they're the same connection.
6. If prompted, sign in with your Microsoft 365 account.
7. Paste your SharePoint site URL:

**⬇️ URL: Paste into "Enter a custom site URL"**

```
https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab
```

8. Click **Connect**.
9. Check the boxes for these lists:
   - [x] **PrintRequests**
   - [x] **AuditLog**
   - [x] **Staff**
10. Click **Connect**.

### Adding the Power Automate Flow

> ⚠️ **IMPORTANT:** Adding a flow is DIFFERENT from adding a data source. Don't search for "Power Automate" in the data panel — those are admin connectors, not your flow!

11. Look in the **left sidebar** for a **Power Automate icon** (lightning bolt ⚡).
    - OR: In the top menu, click the **three dots (...)** → **Power Automate**
12. Click **+ Add flow**.
13. You'll see "Add a flow from this environment" with your flows listed.
14. Under **Instant**, find and click **Flow C (PR-Action)** (or whatever you named Flow C).
15. The flow is now added to your app.

> 💡 **Why only Flow C?** Flows A and B are automatic SharePoint triggers — they run on their own when items are created/modified. Only Flow C (instant trigger) is called from Power Apps buttons.

| Flow | Trigger Type | Add to Power Apps? |
|------|-------------|-------------------|
| Flow A (PR-Create) | Automatic (SharePoint) | ❌ No |
| Flow B (PR-Audit) | Automatic (SharePoint) | ❌ No |
| **Flow C (PR-Action)** | **Instant (Power Apps)** | ✅ **Yes** |

### Verification

**In the Data panel**, you should see:
- ✅ PrintRequests
- ✅ AuditLog  
- ✅ Staff

**In the Power Automate panel**, you should see:
- ✅ Flow C (PR-Action)

> ⚠️ **Flow Name Note:** Your flow might be named `PR-Action: Log action`, `Flow C (PR-Action)`, or `PR-Action_LogAction`. The formulas in this guide use `'Flow C (PR-Action)'` — replace with your actual flow name as it appears in Power Apps.

---

# STEP 3: Setting Up App.OnStart

**What you're doing:** Initializing variables that the entire app will use—like knowing who's logged in, loading staff data, and defining status options.

### Instructions

1. In the **Tree view** (left panel), click on **App** at the very top.
2. In the **Property dropdown** (top left, shows "OnStart"), make sure **OnStart** is selected.
3. Click in the **formula bar** (the wide text area at the top).
4. Delete any existing content and paste this formula:

**⬇️ FORMULA: Paste into App.OnStart**

```powerfx
// === USER IDENTIFICATION ===
// Cache user info for performance (Context7 best practice)
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

// === STAFF DATA ===
// Load active staff members into a collection for dropdowns
ClearCollect(colStaff, Filter(Staff, Active = true));

// Check if current user is a staff member
Set(varIsStaff, CountRows(Filter(colStaff, Lower(Member.Email) = varMeEmail)) > 0);

// === STATUS DEFINITIONS ===
// All possible statuses in the system
Set(varStatuses, ["Uploaded", "Pending", "Ready to Print", "Printing", "Completed", "Paid & Picked Up", "Rejected", "Archived"]);

// Statuses shown in the main queue (active work)
Set(varQuickQueue, ["Uploaded", "Pending", "Ready to Print", "Printing", "Completed"]);

// === UI STATE VARIABLES ===
// Currently selected status tab
Set(varSelectedStatus, "Uploaded");

// Search and filter state
Set(varSearchText, "");
Set(varNeedsAttention, false);
Set(varExpandAll, false);

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowRejectModal, 0);
Set(varShowApprovalModal, 0);
Set(varShowArchiveModal, 0);
Set(varShowAddFileModal, false);

// Currently selected item for modals
Set(varSelectedItem, Blank());

// === FORM VALIDATION ===
Set(varApprovalFormValid, false);

// === ATTACHMENT TRACKING ===
Set(varSelectedActor, Blank());
Set(varAttachmentChangeType, Blank());
Set(varAttachmentChangedName, Blank());
```

5. Press **Enter** or click away to confirm.

### Running OnStart to Test

6. At the top of the screen, click the **three dots (...)** next to "App".
7. Click **Run OnStart**.
8. Wait for it to complete (you'll see a brief loading indicator).

> 💡 **Tip:** You can also press **F5** to preview the app, which automatically runs OnStart.

### Understanding the Variables

| Variable | Purpose | Type |
|----------|---------|------|
| `varMeEmail` | Current user's email (lowercase) | Text |
| `varMeName` | Current user's display name | Text |
| `colStaff` | Collection of active staff members | Table |
| `varIsStaff` | Is current user a staff member? | Boolean |
| `varStatuses` | All status options | Table |
| `varQuickQueue` | Active queue statuses | Table |
| `varSelectedStatus` | Currently selected status tab | Text |
| `varSearchText` | Current search filter | Text |
| `varNeedsAttention` | Filter for attention items only | Boolean |
| `varShowRejectModal` | ID of item being rejected (0=hidden) | Number |
| `varShowApprovalModal` | ID of item being approved (0=hidden) | Number |
| `varShowArchiveModal` | ID of item being archived (0=hidden) | Number |
| `varSelectedItem` | Item currently selected for modal | Record |

---

## Understanding Where Things Go (READ THIS!)

Before you start building the UI, understand the difference between **App** and **Screen1**:

```
▼ App                    ← App-wide formulas ONLY (OnStart, etc.)
▼ Screen1                ← ALL visual elements go here
    Rectangle1           ← Header bar
    Label1               ← App title
    Button1              ← Navigation button
    galStatusTabs        ← Status tabs gallery
    galJobCards          ← Main job cards gallery
    recRejectOverlay     ← Modal overlay
    recRejectModal       ← Modal content
    ... more controls
```

**Key Rules:**

| Rule | Explanation |
|------|-------------|
| **App = formulas only** | Only put formulas like `OnStart` here. Never visual elements. |
| **Screen1 = all visuals** | All rectangles, labels, buttons, galleries go here. |
| **Elements are siblings** | They sit side-by-side in Tree view, NOT nested inside each other. |
| **Galleries are special** | If you select a gallery and then Insert, the new control goes INSIDE that gallery's template. |

> 💡 **How to know what's selected:** Look at the Tree view on the left. The highlighted item is what's currently selected. When you click **+ Insert**, the new control goes into whatever is selected.

---

# STEP 4: Building the Top Navigation Bar

**What you're doing:** Creating a professional navigation bar at the top of the screen with page buttons.

> ⚠️ **IMPORTANT: App vs Screen1**
> 
> | Object | What Goes There | How to Select It |
> |--------|-----------------|------------------|
> | **App** | App-wide formulas (`OnStart`) | Click "App" at the very top of Tree view |
> | **Screen1** | All visual elements (rectangles, labels, buttons, galleries) | Click "Screen1" in Tree view |
> 
> **All visual elements go directly on Screen1** — they don't need to be nested inside containers. They sit as siblings (side by side in the Tree view).

### Instructions

1. **In the Tree view, click on `Screen1`** to select it (NOT App).
2. Click **+ Insert** in the toolbar (or press **Alt+I**).
3. Search for **Rectangle** and click to add it.
4. Position and size the rectangle:
   - **X:** `0`
   - **Y:** `0`
   - **Width:** `1366` (full width)
   - **Height:** `60`
5. Set the **Fill** property:

```powerfx
RGBA(45, 45, 48, 1)
```

> This creates a dark gray header bar.

### Adding the App Title

6. Click **+ Insert** → **Text label**.
7. Set these properties:
   - **Text:** `"🖨️ 3D Printing Dashboard"`
   - **X:** `20`
   - **Y:** `15`
   - **Width:** `300`
   - **Height:** `30`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Size:** `18`
   - **Color:** `Color.White`

### Adding Navigation Buttons

8. Click **+ Insert** → **Button**.
9. Set these properties for the **Dashboard** button:
   - **Text:** `"Dashboard"`
   - **X:** `300`
   - **Y:** `12`
   - **Width:** `120`
   - **Height:** `36`

10. Set the **Fill** property (makes it highlight when selected):

**⬇️ FORMULA: Paste into Button Fill**

```powerfx
If(varCurrentPage = "Dashboard", RGBA(70, 130, 220, 1), RGBA(60, 60, 65, 1))
```

11. Set the **Color** property:

```powerfx
Color.White
```

12. Set the **OnSelect** property:

```powerfx
Set(varCurrentPage, "Dashboard")
```

13. Repeat steps 8-12 to create **Admin** and **Analytics** buttons:

| Button | X | OnSelect |
|--------|---|----------|
| Admin | `430` | `Notify("Admin features coming soon!", NotificationType.Information)` |
| Analytics | `560` | `Notify("Analytics features coming soon!", NotificationType.Information)` |

### Adding User Info Display

14. Click **+ Insert** → **Text label**.
15. Set these properties:
   - **Text:** `varMeName`
   - **X:** `1150`
   - **Y:** `18`
   - **Width:** `200`
   - **Height:** `24`
   - **Align:** `Align.Right`
   - **Color:** `RGBA(200, 200, 200, 1)`
   - **Size:** `12`

---

# STEP 5: Creating Status Tabs

**What you're doing:** Building a row of clickable tabs that show status counts and filter the gallery.

### Instructions

1. Click **+ Insert** → **Horizontal gallery** (or search for "Blank horizontal gallery").
2. Rename it to `galStatusTabs` (click the name in Tree view to edit).
3. Position and size:
   - **X:** `0`
   - **Y:** `60`
   - **Width:** `1366`
   - **Height:** `50`

4. Set the **Items** property:

**⬇️ FORMULA: Paste into galStatusTabs Items**

```powerfx
Table(
    {Status: "Uploaded", Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: RGBA(209, 52, 56, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
)
```

5. Set **TemplateSize:** `160`
6. Set **TemplatePadding:** `5`

### Adding the Tab Button Inside the Gallery

7. With `galStatusTabs` selected, click **+ Insert** → **Button**.
8. The button appears inside the gallery template.
9. Set the button's **Text** property:

**⬇️ FORMULA: Paste into Button Text (shows status + count)**

```powerfx
ThisItem.Status & " " & Text(CountRows(Filter(PrintRequests, Status = ThisItem.Status)))
```

10. Set the **Fill** property:

```powerfx
If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1))
```

11. Set the **Color** property (text color):

```powerfx
If(
    varSelectedStatus = ThisItem.Status, 
    If(ThisItem.Status = "Pending", Color.Black, Color.White),
    RGBA(100, 100, 100, 1)
)
```

12. Set the **OnSelect** property:

```powerfx
Set(varSelectedStatus, ThisItem.Status)
```

13. Set **Width:** `150`, **Height:** `40`
14. Set **BorderRadius:** `20` (rounded pill shape)

---

# STEP 6: Building the Job Cards Gallery

**What you're doing:** Creating the main gallery that displays all print requests as job cards.

### Instructions

1. Click on **Screen1** in the Tree view (not inside the status tabs gallery).
2. Click **+ Insert** → **Blank vertical gallery**.
3. Rename it to `galJobCards`.
4. Position and size:
   - **X:** `20`
   - **Y:** `170`
   - **Width:** `1326`
   - **Height:** `580`

5. Set the **Items** property:

**⬇️ FORMULA: Paste into galJobCards Items**

```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        // Filter by selected status tab
        Status = varSelectedStatus,
        // Search filter (searches name and email)
        If(
            IsBlank(varSearchText), 
            true, 
            varSearchText in Student.DisplayName || varSearchText in StudentEmail || varSearchText in ReqKey
        ),
        // Needs attention filter
        If(varNeedsAttention, NeedsAttention = true, true)
    ),
    "Modified",
    SortOrder.Descending
)
```

6. Set **TemplateSize:** `180` (we'll make this dynamic later for expand/collapse)
7. Set **TemplatePadding:** `10`

### Making Cards Expandable

8. Update the **TemplateSize** property to be dynamic:

```powerfx
If(ThisItem.Expanded || varExpandAll, 400, 180)
```

> This makes cards grow taller when expanded.

---

# STEP 7: Creating the Job Card Template

**What you're doing:** Designing what each job card looks like—showing student name, request details, printer, color, etc.

### Instructions

With `galJobCards` selected:

### Card Background

1. Click **+ Insert** → **Rectangle**.
2. Position inside the template:
   - **X:** `0`
   - **Y:** `0`
   - **Width:** `Parent.TemplateWidth`
   - **Height:** `Parent.TemplateHeight - 10`
3. Set **Fill:**

```powerfx
If(
    ThisItem.NeedsAttention,
    RGBA(255, 250, 230, 1),
    Color.White
)
```

4. Set **BorderColor:** `RGBA(220, 220, 220, 1)`
5. Set **BorderThickness:** `1`
6. Set border radius properties: `8` for all corners

### Student Name (Header)

7. Click **+ Insert** → **Text label**.
8. Rename to `lblStudentName`.
9. Set properties:
   - **Text:** `ThisItem.Student.DisplayName`
   - **X:** `15`
   - **Y:** `12`
   - **Width:** `300`
   - **Height:** `28`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Size:** `16`
   - **Color:** `RGBA(50, 50, 50, 1)`

### Submission Time

10. Click **+ Insert** → **Text label**.
11. Rename to `lblSubmittedTime`.
12. Set **Text:**

**⬇️ FORMULA: Shows relative time since submission**

```powerfx
"Submitted " & 
If(
    DateDiff(ThisItem.Created, Now(), TimeUnit.Days) > 0,
    Text(DateDiff(ThisItem.Created, Now(), TimeUnit.Days)) & "d ",
    ""
) &
If(
    Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24) > 0,
    Text(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24)) & "h ",
    ""
) &
Text(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Minutes), 60)) & "m ago"
```

13. Set other properties:
   - **X:** `15`
   - **Y:** `38`
   - **Width:** `250`
   - **Size:** `11`
   - **Color:** 

```powerfx
If(DateDiff(ThisItem.Created, Now(), TimeUnit.Days) > 2, RGBA(209, 52, 56, 1), RGBA(100, 100, 100, 1))
```

> Items older than 2 days show in red to indicate urgency.

### Request Title / ReqKey

14. Add another label for the request identifier:
   - **Text:** `ThisItem.ReqKey & " — " & ThisItem.Title`
   - **X:** `15`
   - **Y:** `58`
   - **Width:** `500`
   - **Font:** `Font.'Courier New'`
   - **Size:** `12`
   - **Color:** `RGBA(70, 70, 70, 1)`

### Student Email

15. Add label:
   - **Text:** `ThisItem.StudentEmail`
   - **X:** `15`
   - **Y:** `78`
   - **Width:** `300`
   - **Size:** `11`
   - **Color:** `RGBA(100, 100, 100, 1)`

### Printer Icon and Label

16. Click **+ Insert** → **Icon**.
17. Set **Icon:** `Icon.Print`
18. Position: **X:** `15`, **Y:** `100`, **Width:** `20`, **Height:** `20`
19. Set **Color:** `RGBA(100, 100, 100, 1)`

20. Add label next to it:
   - **Text:** `ThisItem.Printer`
   - **X:** `40`
   - **Y:** `100`
   - **Width:** `200`
   - **Size:** `12`

### Method Badge

21. Add a label for the print method:
   - **Text:** `ThisItem.Method`
   - **X:** `15`
   - **Y:** `125`
   - **Width:** `80`
   - **Height:** `24`
   - **Align:** `Align.Center`
   - **PaddingTop:** `4`
   - **Fill:** `If(ThisItem.Method = "Resin", RGBA(156, 39, 176, 0.2), RGBA(33, 150, 243, 0.2))`
   - **Color:** `If(ThisItem.Method = "Resin", RGBA(156, 39, 176, 1), RGBA(33, 150, 243, 1))`
   - **BorderRadius:** `12`

### Color Indicator Circle

22. Click **+ Insert** → search for **Circle** (or use an icon).
23. Position: **X:** `110`, **Y:** `125`, **Width:** `24`, **Height:** `24`
24. Set **Fill:**

**⬇️ FORMULA: Maps color names to actual colors**

```powerfx
Switch(
    ThisItem.Color,
    "Black", RGBA(50, 50, 50, 1),
    "White", RGBA(245, 245, 245, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Red", RGBA(200, 50, 50, 1),
    "Green", RGBA(50, 150, 50, 1),
    "Blue", RGBA(50, 100, 200, 1),
    "Yellow", RGBA(218, 165, 32, 1),
    "Any", RGBA(200, 200, 200, 1),
    RGBA(150, 150, 150, 1)
)
```

25. Set **BorderColor:** `RGBA(200, 200, 200, 1)` and **BorderThickness:** `1`

### Color Name Label

26. Add a label next to the circle:
   - **Text:** `ThisItem.Color`
   - **X:** `140`
   - **Y:** `127`
   - **Size:** `11`

---

# STEP 8: Adding Expandable Details

**What you're doing:** Creating the expanded view that shows when staff click to see more details.

### Instructions

Still inside the `galJobCards` gallery template:

### Expand/Collapse Button

1. Click **+ Insert** → **Icon**.
2. Set **Icon:**

```powerfx
If(ThisItem.Expanded || varExpandAll, Icon.ChevronUp, Icon.ChevronDown)
```

3. Position in top right: **X:** `Parent.TemplateWidth - 50`, **Y:** `10`
4. Set **Width:** `30`, **Height:** `30`
5. Set **Color:** `RGBA(100, 100, 100, 1)`
6. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {Expanded: !ThisItem.Expanded})
```

### Expanded Details Container

7. Click **+ Insert** → **Rectangle** (or Container if available).
8. Rename to `conExpandedDetails`.
9. Position:
   - **X:** `15`
   - **Y:** `155`
   - **Width:** `Parent.TemplateWidth - 30`
   - **Height:** `230`
10. Set **Visible:**

```powerfx
ThisItem.Expanded || varExpandAll
```

11. Set **Fill:** `RGBA(250, 250, 250, 1)`
12. Set border radius: `6` for all corners

### Staff Notes Section (Inside Expanded Area)

13. Add a label:
   - **Text:** `"Staff Notes"`
   - **X:** `conExpandedDetails.X + 10`
   - **Y:** `conExpandedDetails.Y + 10`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Size:** `14`
   - **Visible:** `ThisItem.Expanded || varExpandAll`

14. Click **+ Insert** → **Text input**.
15. Rename to `txtStaffNotes`.
16. Set properties:
   - **Default:** `ThisItem.StaffNotes`
   - **Mode:** `TextMode.MultiLine`
   - **X:** `conExpandedDetails.X + 10`
   - **Y:** `conExpandedDetails.Y + 35`
   - **Width:** `400`
   - **Height:** `80`
   - **HintText:** `"Add internal notes..."`
   - **Visible:** `ThisItem.Expanded || varExpandAll`

### Save Notes Button

17. Add a button:
   - **Text:** `"💾 Save Notes"`
   - **X:** `txtStaffNotes.X + txtStaffNotes.Width + 10`
   - **Y:** `txtStaffNotes.Y`
   - **Width:** `100`
   - **Height:** `35`
   - **Fill:** `RGBA(70, 130, 220, 1)`
   - **Color:** `Color.White`
   - **Visible:**

```powerfx
(ThisItem.Expanded || varExpandAll) && txtStaffNotes.Text <> ThisItem.StaffNotes
```

18. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {StaffNotes: txtStaffNotes.Text});
Notify("Notes saved", NotificationType.Success)
```

### Additional Details (Two Column Layout)

19. Add labels for additional details visible when expanded:

**Left Column:**
- Job ID: `"Job ID: " & ThisItem.ReqKey`
- Created: `"Created: " & Text(ThisItem.Created, "mmm dd, yyyy hh:mm")`
- Due Date: `"Due: " & If(IsBlank(ThisItem.DueDate), "Not set", Text(ThisItem.DueDate, "mmm dd, yyyy"))`

**Right Column:**
- Discipline: `"Discipline: " & ThisItem.Discipline`
- Project Type: `"Type: " & ThisItem.ProjectType`
- Course: `"Course: " & If(IsBlank(ThisItem.'Course Number'), "N/A", Text(ThisItem.'Course Number'))`

Position these at Y positions starting around `conExpandedDetails.Y + 130` with appropriate X offsets.

---

# STEP 9: Implementing Action Buttons

**What you're doing:** Adding the Approve, Reject, and Archive buttons to each job card.

### Understanding the Person Record

Before adding buttons, you need to understand how to update Person fields in SharePoint. Power Apps requires a specific format.

### Setting Up varActor

First, let's ensure varActor is set up. We'll create it on the screen's OnVisible event.

1. Click on **Screen1** in Tree view.
2. Set the **OnVisible** property:

**⬇️ FORMULA: Paste into Screen1.OnVisible**

```powerfx
Set(varActor,
    {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & varMeEmail,
        DisplayName: varMeName,
        Email: varMeEmail
    }
)
```

### Adding Action Buttons to Job Cards

Go back inside `galJobCards` gallery template:

### Approve Button

1. Click **+ Insert** → **Button**.
2. Set properties:
   - **Text:** `"✓ Approve"`
   - **X:** `Parent.TemplateWidth - 350`
   - **Y:** `100`
   - **Width:** `100`
   - **Height:** `40`
   - **Fill:** `RGBA(16, 124, 16, 1)`
   - **Color:** `Color.White`
   - **BorderRadius:** `6`
   - **Visible:** `ThisItem.Status = "Uploaded"`

3. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

### Reject Button

4. Add another button:
   - **Text:** `"✗ Reject"`
   - **X:** `Parent.TemplateWidth - 240`
   - **Y:** `100`
   - **Width:** `100`
   - **Height:** `40`
   - **Fill:** `RGBA(209, 52, 56, 1)`
   - **Color:** `Color.White`
   - **BorderRadius:** `6`
   - **Visible:** `ThisItem.Status = "Uploaded" || ThisItem.Status = "Pending"`

5. Set **OnSelect:**

```powerfx
Set(varShowRejectModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

### Archive Button

6. Add another button:
   - **Text:** `"📦 Archive"`
   - **X:** `Parent.TemplateWidth - 130`
   - **Y:** `100`
   - **Width:** `110`
   - **Height:** `40`
   - **Fill:** `RGBA(255, 140, 0, 1)`
   - **Color:** `Color.White`
   - **BorderRadius:** `6`
   - **Visible:** `ThisItem.Status = "Completed" || ThisItem.Status = "Paid & Picked Up" || ThisItem.Status = "Rejected"`

7. Set **OnSelect:**

```powerfx
Set(varShowArchiveModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

### Start Printing Button (for Ready to Print status)

8. Add button:
   - **Text:** `"🖨️ Start Print"`
   - **Visible:** `ThisItem.Status = "Ready to Print"`
   - **Fill:** `RGBA(107, 105, 214, 1)`

9. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Printing",
    LastAction: "Printing",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Printing",
    varMeEmail,
    "Power Apps",
    "Started printing"
);

Notify("Print started!", NotificationType.Success)
```

### Complete Printing Button

10. Add button:
   - **Text:** `"✓ Complete"`
   - **Visible:** `ThisItem.Status = "Printing"`
   - **Fill:** `RGBA(0, 78, 140, 1)`

11. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Completed",
    LastAction: "Completed",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Completed",
    varMeEmail,
    "Power Apps",
    "Print completed - ready for pickup"
);

Notify("Marked as completed!", NotificationType.Success)
```

### Picked Up Button

12. Add button:
   - **Text:** `"💰 Picked Up"`
   - **Visible:** `ThisItem.Status = "Completed"`
   - **Fill:** `RGBA(0, 158, 73, 1)`

13. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Paid & Picked Up",
    LastAction: "Picked Up",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Paid & Picked Up",
    varMeEmail,
    "Power Apps",
    "Student picked up and paid"
);

Notify("Marked as picked up!", NotificationType.Success)
```

---

# STEP 10: Building the Rejection Modal

**What you're doing:** Creating a popup dialog that appears when staff click "Reject" to capture rejection reasons.

### Instructions

Build this on **Screen1**, outside of the gallery (at the screen level).

### Modal Overlay (Dark Background)

1. Click on **Screen1** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. Rename to `recRejectOverlay`.
4. Set properties:
   - **X:** `0`
   - **Y:** `0`
   - **Width:** `1366`
   - **Height:** `768`
   - **Fill:** `RGBA(0, 0, 0, 0.7)`
   - **Visible:** `varShowRejectModal > 0`

### Modal Content Box

5. Add another **Rectangle**.
6. Rename to `recRejectModal`.
7. Set properties:
   - **X:** `(Parent.Width - 600) / 2`
   - **Y:** `(Parent.Height - 550) / 2`
   - **Width:** `600`
   - **Height:** `550`
   - **Fill:** `Color.White`
   - **BorderRadius:** `8` (all corners)
   - **Visible:** `varShowRejectModal > 0`

### Modal Title

8. Add **Text label**:
   - **Text:** `"Reject Request - " & varSelectedItem.ReqKey`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 20`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Size:** `20`
   - **Color:** `RGBA(209, 52, 56, 1)`
   - **Visible:** `varShowRejectModal > 0`

### Student Info

9. Add label:
   - **Text:** `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 55`
   - **Visible:** `varShowRejectModal > 0`

### Staff Attribution Dropdown

10. Add **Text label**:
   - **Text:** `"Performing Action As: *"`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 90`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Visible:** `varShowRejectModal > 0`

11. Click **+ Insert** → **Combo box** (or Dropdown).
12. Rename to `ddRejectStaff`.
13. Set properties:
   - **Items:** `colStaff`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 115`
   - **Width:** `300`
   - **DisplayFields:** `["Member"]`
   - **SearchFields:** `["Member"]`
   - **DefaultSelectedItems:** `Filter(colStaff, Lower(Member.Email) = varMeEmail)`
   - **Visible:** `varShowRejectModal > 0`

### Rejection Reasons Checkboxes

14. Add label: `"Rejection Reasons (select all that apply):"`

15. Add **Checkbox** controls for each reason. For each:
   - Name them: `chkIncomplete`, `chkSafety`, `chkDetail`, `chkCopyright`, `chkComplexity`
   - Set **Visible:** `varShowRejectModal > 0`

| Checkbox Name | Text Property |
|--------------|---------------|
| chkIncomplete | `"Incomplete project description"` |
| chkSafety | `"Safety concerns with design"` |
| chkDetail | `"Insufficient detail/resolution"` |
| chkCopyright | `"Copyright/IP concerns"` |
| chkComplexity | `"Too complex for equipment"` |

Position them vertically starting at `recRejectModal.Y + 170` with 30px spacing.

### Custom Comments

16. Add label: `"Additional Comments (optional):"`
17. Add **Text input**:
   - Rename to `txtRejectComments`
   - **Mode:** `TextMode.MultiLine`
   - **HintText:** `"Provide specific feedback..."`
   - **Width:** `540`
   - **Height:** `80`
   - **Visible:** `varShowRejectModal > 0`

### Cancel Button

18. Add **Button**:
   - **Text:** `"Cancel"`
   - **X:** `recRejectModal.X + 300`
   - **Y:** `recRejectModal.Y + 490`
   - **Width:** `120`
   - **Fill:** `RGBA(150, 150, 150, 1)`
   - **Visible:** `varShowRejectModal > 0`

19. Set **OnSelect:**

```powerfx
Set(varShowRejectModal, 0);
Set(varSelectedItem, Blank());
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkIncomplete);
Reset(chkSafety);
Reset(chkDetail);
Reset(chkCopyright);
Reset(chkComplexity)
```

### Confirm Rejection Button

20. Add **Button**:
   - **Text:** `"✗ Confirm Rejection"`
   - **X:** `recRejectModal.X + 430`
   - **Y:** `recRejectModal.Y + 490`
   - **Width:** `150`
   - **Fill:** `RGBA(209, 52, 56, 1)`
   - **Color:** `Color.White`
   - **Visible:** `varShowRejectModal > 0`

21. Set **DisplayMode:**

```powerfx
If(IsBlank(ddRejectStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)
```

22. Set **OnSelect:**

**⬇️ FORMULA: Complete rejection logic with audit logging**

```powerfx
// Build rejection reasons string
Set(varRejectionReasons, 
    If(chkIncomplete.Value, "Incomplete description; ", "") &
    If(chkSafety.Value, "Safety concerns; ", "") &
    If(chkDetail.Value, "Insufficient detail; ", "") &
    If(chkCopyright.Value, "Copyright concerns; ", "") &
    If(chkComplexity.Value, "Too complex; ", "")
);

// Update the SharePoint item
Patch(PrintRequests, varSelectedItem, {
    Status: "Rejected",
    NeedsAttention: false,
    LastAction: "Rejected",
    LastActionBy: {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddRejectStaff.Selected.Member.Email,
        DisplayName: ddRejectStaff.Selected.Member.DisplayName,
        Email: ddRejectStaff.Selected.Member.Email
    },
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "REJECTED by " & ddRejectStaff.Selected.Member.DisplayName & ": " & 
        varRejectionReasons & txtRejectComments.Text & " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log to AuditLog via Flow C
IfError(
    'Flow C (PR-Action)'.Run(
        Text(varSelectedItem.ID),
        "Rejected",
        "Status",
        varSelectedItem.Status,
        "Rejected",
        ddRejectStaff.Selected.Member.Email,
        "Power Apps",
        "Rejected: " & varRejectionReasons & txtRejectComments.Text
    ),
    Notify("Could not log rejection.", NotificationType.Error),
    Notify("Request rejected. Student will be notified.", NotificationType.Success)
);

// Close modal and reset
Set(varShowRejectModal, 0);
Set(varSelectedItem, Blank());
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkIncomplete);
Reset(chkSafety);
Reset(chkDetail);
Reset(chkCopyright);
Reset(chkComplexity)
```

---

# STEP 11: Building the Approval Modal

**What you're doing:** Creating a dialog for staff to enter weight/time estimates before approving a request.

### Instructions

Similar to the rejection modal, build on Screen1:

### Modal Overlay

1. Add **Rectangle** named `recApprovalOverlay`:
   - Same size as screen, `Fill: RGBA(0, 0, 0, 0.7)`
   - **Visible:** `varShowApprovalModal > 0`

### Modal Content Box

2. Add **Rectangle** named `recApprovalModal`:
   - **Width:** `600`, **Height:** `650`
   - Centered like the reject modal
   - **Visible:** `varShowApprovalModal > 0`

### Modal Title

3. Add label:
   - **Text:** `"Approve Request - " & varSelectedItem.ReqKey`
   - **Color:** `RGBA(16, 124, 16, 1)` (green)

### Staff Dropdown

4. Add **Combo box** named `ddApprovalStaff`:
   - Same setup as rejection modal

### Estimated Weight Input

5. Add label: `"Estimated Weight (grams): *"`
6. Add **Text input** named `txtEstimatedWeight`:
   - **Format:** `TextFormat.Number`
   - **HintText:** `"Enter weight in grams (e.g., 25)"`
   - **Width:** `200`
   - **Visible:** `varShowApprovalModal > 0`

7. Add validation label:
   - **Text:**

```powerfx
If(
    IsBlank(txtEstimatedWeight.Text), 
    "Weight is required",
    !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0,
    "Enter a valid weight > 0",
    ""
)
```
   - **Color:** `RGBA(209, 52, 56, 1)`
   - **Visible:** `varShowApprovalModal > 0 && (IsBlank(txtEstimatedWeight.Text) || !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0)`

### Estimated Time Input (Optional)

8. Add label: `"Estimated Print Time (hours): (Optional)"`
9. Add **Text input** named `txtEstimatedTime`:
   - Same setup but optional

### Cost Calculation Display

10. Add label: `"Estimated Cost:"`
11. Add label for the calculated cost:

**⬇️ FORMULA: Auto-calculates cost based on weight and method**

```powerfx
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    "$" & Text(
        Max(
            3.00,
            Value(txtEstimatedWeight.Text) * If(
                varSelectedItem.Method = "Resin",
                0.20,
                0.10
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$3.00 (minimum)"
)
```

12. Style this label with green color and larger font.

### Comments Input

13. Add **Text input** named `txtApprovalComments`:
   - **Mode:** `TextMode.MultiLine`
   - **HintText:** `"Add any special instructions..."`

### Cancel Button

14. Same pattern as rejection modal

### Confirm Approval Button

15. Add **Button**:
   - **Text:** `"✓ Confirm Approval"`
   - **Fill:** `RGBA(16, 124, 16, 1)`
   - **Color:** `Color.White`

16. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddApprovalStaff.Selected) && 
    !IsBlank(txtEstimatedWeight.Text) && 
    IsNumeric(txtEstimatedWeight.Text) && 
    Value(txtEstimatedWeight.Text) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

17. Set **OnSelect:**

**⬇️ FORMULA: Complete approval logic with cost calculation**

```powerfx
// Calculate cost
Set(varCalculatedCost, 
    Max(
        3.00,
        Value(txtEstimatedWeight.Text) * If(
            varSelectedItem.Method = "Resin",
            0.20,
            0.10
        )
    )
);

// Update SharePoint item
Patch(PrintRequests, varSelectedItem, {
    Status: "Pending",
    NeedsAttention: false,
    LastAction: "Approved",
    LastActionBy: {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddApprovalStaff.Selected.Member.Email,
        DisplayName: ddApprovalStaff.Selected.Member.DisplayName,
        Email: ddApprovalStaff.Selected.Member.Email
    },
    LastActionAt: Now(),
    EstimatedWeight: Value(txtEstimatedWeight.Text),
    EstimatedTime: If(IsNumeric(txtEstimatedTime.Text), Value(txtEstimatedTime.Text), Blank()),
    EstimatedCost: varCalculatedCost,
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "APPROVED by " & ddApprovalStaff.Selected.Member.DisplayName &
        ": Weight=" & txtEstimatedWeight.Text & "g, Cost=$" & Text(varCalculatedCost, "[$-en-US]#,##0.00") &
        If(!IsBlank(txtApprovalComments.Text), " - " & txtApprovalComments.Text, "") &
        " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log action
IfError(
    'Flow C (PR-Action)'.Run(
        Text(varSelectedItem.ID),
        "Approved",
        "Status",
        varSelectedItem.Status,
        "Pending",
        ddApprovalStaff.Selected.Member.Email,
        "Power Apps",
        "Approved - Weight: " & txtEstimatedWeight.Text & "g, Cost: $" & Text(varCalculatedCost, "[$-en-US]#,##0.00")
    ),
    Notify("Could not log approval.", NotificationType.Error),
    Notify("Approved! Student will receive estimate email.", NotificationType.Success)
);

// Close and reset
Set(varShowApprovalModal, 0);
Set(varSelectedItem, Blank());
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff)
```

> 💰 **Pricing:** Filament = $0.10/gram, Resin = $0.20/gram, $3.00 minimum

---

# STEP 12: Building the Archive Modal

**What you're doing:** Creating a confirmation dialog for archiving completed/rejected requests.

### Instructions

Follow the same modal pattern:

### Modal Structure

1. Create `recArchiveOverlay` and `recArchiveModal`
2. **Visible:** `varShowArchiveModal > 0`
3. **Modal size:** 500×450

### Content

4. Title: `"Archive Request - " & varSelectedItem.ReqKey`
5. Warning icon and text: `"This will remove the request from active views."`
6. Staff dropdown: `ddArchiveStaff`
7. Optional reason: `txtArchiveReason`

### Confirm Archive OnSelect

**⬇️ FORMULA: Archive logic**

```powerfx
Patch(PrintRequests, varSelectedItem, {
    Status: "Archived",
    NeedsAttention: false,
    LastAction: "Archived",
    LastActionBy: {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddArchiveStaff.Selected.Member.Email,
        DisplayName: ddArchiveStaff.Selected.Member.DisplayName,
        Email: ddArchiveStaff.Selected.Member.Email
    },
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "ARCHIVED by " & ddArchiveStaff.Selected.Member.DisplayName &
        If(!IsBlank(txtArchiveReason.Text), ": " & txtArchiveReason.Text, "") &
        " - " & Text(Now(), "mm/dd/yyyy")
    )
});

IfError(
    'Flow C (PR-Action)'.Run(
        Text(varSelectedItem.ID),
        "Archived",
        "Status",
        varSelectedItem.Status,
        "Archived",
        ddArchiveStaff.Selected.Member.Email,
        "Power Apps",
        If(!IsBlank(txtArchiveReason.Text), "Reason: " & txtArchiveReason.Text, "")
    ),
    Notify("Could not log archive.", NotificationType.Error),
    Notify("Request archived.", NotificationType.Success)
);

Set(varShowArchiveModal, 0);
Set(varSelectedItem, Blank());
Reset(txtArchiveReason);
Reset(ddArchiveStaff)
```

---

# STEP 13: Adding Search and Filters

**What you're doing:** Adding a search box and filter controls above the job cards gallery.

### Instructions

### Search Text Input

1. Click **+ Insert** → **Text input**.
2. Rename to `txtSearch`.
3. Set properties:
   - **X:** `20`
   - **Y:** `120`
   - **Width:** `300`
   - **Height:** `40`
   - **HintText:** `"Search by name, email, or ReqKey..."`
   - **OnChange:** `Set(varSearchText, txtSearch.Text)`

### Needs Attention Checkbox

4. Click **+ Insert** → **Checkbox**.
5. Rename to `chkNeedsAttention`.
6. Set properties:
   - **Text:** `"Needs Attention Only"`
   - **X:** `340`
   - **Y:** `125`
   - **OnCheck:** `Set(varNeedsAttention, true)`
   - **OnUncheck:** `Set(varNeedsAttention, false)`

### Expand All Button

7. Add **Button**:
   - **Text:** `If(varExpandAll, "Collapse All", "Expand All")`
   - **X:** `550`
   - **Y:** `120`
   - **Width:** `120`
   - **Height:** `40`
   - **OnSelect:** `Set(varExpandAll, !varExpandAll)`

### Clear Filters Button

8. Add **Button**:
   - **Text:** `"Clear Filters"`
   - **X:** `680`
   - **Y:** `120`
   - **Width:** `100`
   - **Fill:** `RGBA(150, 150, 150, 1)`
   - **OnSelect:**

```powerfx
Reset(txtSearch);
Set(varSearchText, "");
Set(varNeedsAttention, false);
Reset(chkNeedsAttention)
```

---

# STEP 14: Adding the Lightbulb Attention System

**What you're doing:** Adding a toggleable lightbulb icon to each card that marks items as needing attention.

### Instructions

Inside `galJobCards` gallery template:

### Lightbulb Icon

1. Click **+ Insert** → **Icon**.
2. Set **Icon:**

```powerfx
If(ThisItem.NeedsAttention, Icon.Lightbulb, Icon.LightbulbSolid)
```

3. Position in top right corner of card:
   - **X:** `Parent.TemplateWidth - 90`
   - **Y:** `12`
   - **Width:** `28`
   - **Height:** `28`

4. Set **Color:**

```powerfx
If(ThisItem.NeedsAttention, RGBA(255, 215, 0, 1), RGBA(180, 180, 180, 1))
```

5. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {NeedsAttention: !ThisItem.NeedsAttention})
```

6. Set **Tooltip:**

```powerfx
If(ThisItem.NeedsAttention, "Mark as handled", "Mark as needing attention")
```

### Optional: Animated Glow Effect

For a pulsing glow on cards needing attention:

7. Add a **Timer** control to Screen1 (not in gallery):
   - **Duration:** `1500`
   - **Repeat:** `true`
   - **AutoStart:** `true`
   - **Visible:** `false`
   - Rename to `tmrGlow`

8. Update the card background rectangle's **Fill:**

```powerfx
If(
    ThisItem.NeedsAttention,
    If(
        Mod(tmrGlow.Value, 1500) < 750,
        RGBA(255, 250, 230, 1),
        RGBA(255, 245, 210, 1)
    ),
    Color.White
)
```

---

# STEP 15: Adding the Attachments Modal

**What you're doing:** Creating a modal for staff to add/remove file attachments from requests.

### Overview

This uses a Display Form (read-only) and Edit Form (for modifications).

### Variables (Already Added in OnStart)

```powerfx
Set(varShowAddFileModal, false);
Set(varSelectedActor, Blank());
```

### Add Files Button (In Job Card)

1. Add button in gallery template:
   - **Text:** `"📎 Files (" & ThisItem.AttachmentCount & ")"`
   - **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowAddFileModal, true);
Set(varSelectedActor, Blank())
```

### Modal Overlay

2. Add rectangle `recFileOverlay`:
   - **Visible:** `varShowAddFileModal`
   - Full screen dark overlay

### Modal Content

3. Add rectangle `recFileModal`:
   - **Visible:** `varShowAddFileModal`
   - **Width:** `500`, **Height:** `500`
   - Centered

### Edit Form for Attachments

4. Click **+ Insert** → **Edit form**.
5. Rename to `frmAttachmentsEdit`.
6. Set properties:
   - **DataSource:** `PrintRequests`
   - **Item:** `varSelectedItem`
   - **Visible:** `varShowAddFileModal`

7. In the form's Fields panel, remove all fields except **Attachments**.

### Staff Selector

8. Add combo box `ddFileActor`:
   - **Items:** `colStaff`
   - **DefaultSelectedItems:** `Filter(colStaff, Lower(Member.Email) = varMeEmail)`

9. Set **OnChange:**

```powerfx
Set(varSelectedActor,
    {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddFileActor.Selected.Member.Email,
        DisplayName: ddFileActor.Selected.Member.DisplayName,
        Email: ddFileActor.Selected.Member.Email
    }
)
```

### Save Button

10. Add button:
   - **Text:** `"Save Changes"`
   - **DisplayMode:** `If(IsBlank(varSelectedActor), DisplayMode.Disabled, DisplayMode.Edit)`
   - **OnSelect:** `SubmitForm(frmAttachmentsEdit)`

### Form OnSuccess

11. Set `frmAttachmentsEdit.OnSuccess`:

```powerfx
Patch(
    PrintRequests,
    frmAttachmentsEdit.LastSubmit,
    {
        LastAction: "File Added",
        LastActionBy: varSelectedActor,
        LastActionAt: Now()
    }
);

Set(varShowAddFileModal, false);
Notify("Attachments updated", NotificationType.Success)
```

### Cancel Button

12. Add button:
   - **OnSelect:** `Set(varShowAddFileModal, false); Set(varSelectedItem, Blank())`

---

# STEP 16: Publishing the App

**What you're doing:** Saving and publishing your app so staff can use it.

### Instructions

1. Click **File** in the top left.
2. Click **Save**.
3. Wait for the save to complete.
4. Click **Publish**.
5. Click **Publish this version**.
6. Click the **←** back arrow to return to the editor.

### Sharing the App

7. Go to [make.powerapps.com](https://make.powerapps.com).
8. Find your app in the **Apps** list.
9. Click the **three dots (...)** next to the app.
10. Click **Share**.
11. Add your staff team or security group.
12. Check **Co-owner** if you want them to edit the app.
13. Click **Share**.

---

# STEP 17: Testing the App

**What you're doing:** Verifying everything works correctly.

### Testing Checklist

#### Basic Functionality
- [ ] App loads without errors
- [ ] Status tabs show correct counts
- [ ] Clicking a tab filters the gallery
- [ ] Search filters by name/email/ReqKey
- [ ] "Needs Attention" checkbox filters correctly

#### Action Buttons
- [ ] Approve button opens approval modal
- [ ] Reject button opens rejection modal
- [ ] Archive button opens archive modal
- [ ] All modals close with Cancel button
- [ ] Staff dropdown defaults to current user

#### Approval Flow
- [ ] Enter weight → cost calculates automatically
- [ ] Confirm with valid data → status changes to "Pending"
- [ ] AuditLog entry created
- [ ] Success notification appears
- [ ] Student receives estimate email (via Flow B)

#### Rejection Flow
- [ ] Select at least one reason checkbox
- [ ] Confirm → status changes to "Rejected"
- [ ] AuditLog entry created
- [ ] Success notification appears
- [ ] Student receives rejection email (via Flow B)

#### Archive Flow
- [ ] Confirm → status changes to "Archived"
- [ ] AuditLog entry created
- [ ] Item disappears from active tabs

#### Other Actions
- [ ] Start Print → status changes to "Printing"
- [ ] Complete → status changes to "Completed"
- [ ] Picked Up → status changes to "Paid & Picked Up"
- [ ] Lightbulb toggle works
- [ ] Staff Notes save correctly

---

# Troubleshooting

## Problem: "Data source not found" error

**Cause:** SharePoint connection lost or list renamed.

**Solution:**
1. Go to **Data** panel
2. Remove the broken connection
3. Re-add SharePoint connection with correct site URL
4. Reconnect to lists

---

## Problem: Flow not appearing in Power Automate panel

**Cause:** Flow not saved, wrong environment, or looking in wrong place.

**Solution:**
1. **Don't search in Data panel** — flows are NOT added through "Add data"
2. Look in the **left sidebar** for the Power Automate icon (⚡), OR go to **Action** → **Power Automate**
3. Click **+ Add flow** to see available flows
4. If flow still missing:
   - In Power Automate, open your flow and click **Save**
   - Verify you're in the same environment (check top-right dropdown)
   - Ensure the flow has a **Power Apps trigger** (instant flow)

> 💡 **Only instant flows appear!** Automated flows (SharePoint triggers) won't show up — that's correct behavior.

---

## Problem: Person field won't save (Patch fails)

**Cause:** Incorrect person field format.

**Solution:** Use the exact format:

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & Lower(userEmail),
    DisplayName: userName,
    Email: Lower(userEmail)
}
```

---

## Problem: Gallery shows all items, not filtered

**Cause:** Filter formula has errors.

**Solution:**
1. Check that `varSelectedStatus` is being set correctly
2. Verify the Status column in SharePoint matches exactly (case-sensitive)
3. Test with a simpler filter first: `Filter(PrintRequests, Status = "Uploaded")`

---

## Problem: Modals appear behind other elements

**Cause:** Z-order (stacking order) is wrong.

**Solution:**
1. In Tree view, right-click the modal overlay
2. Click **Reorder** → **Bring to front**
3. Do the same for the modal content rectangle

---

## Problem: "The specified column doesn't exist" error

**Cause:** Column internal name differs from display name.

**Solution:**
1. In SharePoint, go to List Settings → click the column
2. Look at the URL for `Field=InternalName`
3. Use the internal name in your formulas

---

## Problem: Cost calculation shows wrong value

**Cause:** Method field value doesn't match expected text.

**Solution:**
1. Check your SharePoint Method column choices
2. Ensure they're exactly "Filament" and "Resin" (case-sensitive)
3. Or update the formula to match your actual choices

---

# Quick Reference Card

## Key Variables

| Variable | Set By | Purpose |
|----------|--------|---------|
| `varMeEmail` | App.OnStart | Current user email |
| `varIsStaff` | App.OnStart | Staff member check |
| `colStaff` | App.OnStart | Active staff collection |
| `varSelectedStatus` | Status tab click | Current filter |
| `varSelectedItem` | Button click | Item for modal |
| `varActor` | Screen.OnVisible | Person record for Patch |

## Person Field Format

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & email,
    DisplayName: name,
    Email: email
}
```

## Pricing Formula

```powerfx
Max(3.00, weight * If(method = "Resin", 0.20, 0.10))
```

## Flow C Call Pattern

```powerfx
'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),      // RequestID
    "Status Change",         // Action
    "Status",               // FieldName
    ThisItem.Status,        // OldValue
    "NewStatus",            // NewValue
    varMeEmail,             // ActorEmail
    "Power Apps",           // ClientApp
    "Notes here"            // Notes
)
```

> ⚠️ **Replace flow name:** If your flow has a different name (like `PR-Action_LogAction` or `PR-Action: Log action`), use that name instead in all formulas.

---

# Next Steps

After your Staff Console is working:

1. ✅ Test the complete workflow end-to-end
2. ✅ Train staff on using the dashboard
3. ✅ Monitor AuditLog for proper logging
4. 🎯 Move to Phase 4: Integration & Production

---

**💡 Pro Tips:**

- **Preview often:** Press **F5** frequently to test changes
- **Save incrementally:** Save after each major section
- **Name controls:** Rename controls as you create them—it makes formulas easier to read
- **Use the formula bar:** Click in the formula bar to see the full formula
- **Check the App Checker:** Click the checkmark icon (top right) to see warnings and errors

> **Official Microsoft Docs:** [Create a canvas app from scratch](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/create-blank-app)
