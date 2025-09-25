# Power Apps Dashboard Design Guide
*Building the Tabbed Job Card Interface*

## Dashboard Overview
This guide shows how to recreate the dashboard shown in Dashboard.png using Power Apps Canvas app.

---

## 1. Top Navigation Bar

### Navigation Buttons (Horizontal Container)
```powerfx
// Dashboard Button (Selected State)
Button.Fill = If(varCurrentPage = "Dashboard", RGBA(70, 130, 220, 1), RGBA(245, 245, 245, 1))
Button.Color = If(varCurrentPage = "Dashboard", Color.White, RGBA(100, 100, 100, 1))
Button.OnSelect = Set(varCurrentPage, "Dashboard")

// Admin Button (Placeholder)
Button.OnSelect = Notify("Admin features coming soon!", NotificationType.Information)

// Analytics Button (Placeholder)
Button.OnSelect = Notify("Analytics features coming soon!", NotificationType.Information)
```

---

## 2. Status Tabs Row

### Tab Container (Horizontal Gallery)
```powerfx
// Gallery Items (Status Tabs)
Items = [
    {Status: "Uploaded", Count: CountRows(Filter(PrintRequests, Status = "Uploaded")), Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Count: CountRows(Filter(PrintRequests, Status = "Pending")), Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Count: CountRows(Filter(PrintRequests, Status = "Ready to Print")), Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Count: CountRows(Filter(PrintRequests, Status = "Printing")), Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Count: CountRows(Filter(PrintRequests, Status = "Completed")), Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Count: CountRows(Filter(PrintRequests, Status = "Paid & Picked Up")), Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Count: CountRows(Filter(PrintRequests, Status = "Rejected")), Color: RGBA(209, 52, 56, 1)},
    {Status: "Archived", Count: CountRows(Filter(PrintRequests, Status = "Archived")), Color: RGBA(96, 94, 92, 1)}
]

// Tab Button Design
Button.Text = ThisItem.Status & " " & ThisItem.Count
Button.Fill = If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1))
Button.Color = If(varSelectedStatus = ThisItem.Status, Color.White, RGBA(100, 100, 100, 1))
Button.OnSelect = Set(varSelectedStatus, ThisItem.Status)
```

---

## 3. Search and Controls Bar

### Search and Filter Container
```powerfx
// Search Text Input
TextInput.HintText = "Search jobs..."
TextInput.OnChange = Set(varSearchText, TextInput.Text)

// Needs Attention Checkbox
Checkbox.Text = "Needs Attention"
Checkbox.OnCheck = Set(varNeedsAttention, true)
Checkbox.OnUncheck = Set(varNeedsAttention, false)

// Expand All Button
Button.Text = If(varExpandAll, "Collapse All", "Expand All")
Button.OnSelect = Set(varExpandAll, !varExpandAll); Set(varExpandSignal, varExpandSignal + 1)
```

---

## 4. Job Cards Gallery

### Main Jobs Gallery
```powerfx
// Gallery Items (Filtered Jobs)
Items = SortByColumns(
    Filter(
        PrintRequests,
        Status = varSelectedStatus,
        If(IsBlank(varSearchText), true, 
            varSearchText in Student.DisplayName || 
            varSearchText in StudentEmail
        ),
        If(varNeedsAttention, NeedsAttention = true, true)
    ),
    "Modified",
    Descending
)

// Gallery Template Height
TemplateSize = If(ThisItem.Expanded || varExpandAll, 400, 180)
```

### Attachments Modal — Add/Remove Files with Actor (No Drag-and-Drop)

1. Variables (App.OnStart)
```powerfx
Set(varShowAddFileModal, false);
Set(varSelectedItem, Blank());
Set(varSelectedActor, Blank());
Set(varAttachmentChangeType, Blank());
Set(varAttachmentChangedName, Blank());
```

2. Read-only attachments on each job card
- Insert a Display Form `frmAttachmentsView` inside the gallery template
  - DataSource: `PrintRequests`
  - Item: `ThisItem`
  - Include only the Attachments data card
- Collapsed card: show `"Files: " & CountRows(AttachmentsView_Attachments.Attachments)`
- Expanded card: increase height to show full list; filenames open in SharePoint

3. Add/Remove Files button (in card)
```powerfx
// Button.OnSelect
Set(varSelectedItem, ThisItem);
Set(varShowAddFileModal, true);
ResetForm(frmAttachmentsEdit);
Set(varSelectedActor, Blank());
Set(varAttachmentChangeType, Blank());
Set(varAttachmentChangedName, Blank());
```

4. Modal container
- Full-screen overlay Container: `Visible = varShowAddFileModal`
- Centered white Rectangle for modal content

5. Required actor selector
```powerfx
// ComboBox ddAttachmentActor
Items = colStaff
DefaultSelectedItems = Filter(colStaff, Lower(Member.Email) = varMeEmail)
OnChange = Set(
    varSelectedActor,
    {
      '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
      Claims: "i:0#.f|membership|" & ddAttachmentActor.Selected.Member.Email,
      DisplayName: ddAttachmentActor.Selected.Member.DisplayName,
      Email: ddAttachmentActor.Selected.Member.Email
    }
)
```

6. Edit Form for attachments
- Insert Edit Form `frmAttachmentsEdit`
  - DataSource: `PrintRequests`
  - Item: `varSelectedItem`
  - Include only the Attachments data card (supports add and delete)
```powerfx
// Inside Attachments control (optional signals)
// OnAddFile
Set(varAttachmentChangeType, "Added");
// OnRemoveFile
Set(varAttachmentChangeType, "Removed");
```

7. Modal actions
```powerfx
// Save button
DisplayMode = If(IsBlank(varSelectedActor), DisplayMode.Disabled, DisplayMode.Edit)
OnSelect = If(
    IsBlank(varSelectedActor),
    Notify("Select your name to continue", NotificationType.Error),
    SubmitForm(frmAttachmentsEdit)
)

// Cancel button
OnSelect = Set(varShowAddFileModal, false); Set(varSelectedItem, Blank()); Set(varSelectedActor, Blank())
```

8. frmAttachmentsEdit.OnSuccess
```powerfx
Patch(
    PrintRequests,
    frmAttachmentsEdit.LastSubmit,
    {
        LastAction: If(varAttachmentChangeType = "Removed", "File Removed", "File Added"),
        LastActionBy: varSelectedActor,
        LastActionAt: Now()
    }
);

// Optional: explicit audit entry via Flow C
IfError(
    'PR-Action_LogAction'.Run(
        Text(frmAttachmentsEdit.LastSubmit.ID),
        If(varAttachmentChangeType = "Removed", "File Removed", "File Added"),
        "Attachments",
        "",
        "",
        varMeEmail,
        "Power Apps",
        Coalesce(varAttachmentChangedName, "")
    ),
    Notify("Could not log attachment action.", NotificationType.Error)
);

Set(varShowAddFileModal, false);
```

Notes
- No drag-and-drop in Canvas; use the Attachments control file picker.
- Existing PR-Audit flow logs file additions; removals can be inferred historically.

### Job Card Design (Gallery Template)
```powerfx
// Card Container (Rectangle) - Updated with Glow Effect
Rectangle.Fill = If(
    ThisItem.NeedsAttention,
    // Pulsing glow animation - subtle background
    If(Mod(Timer.Value, 1500) < 750, 
        RGBA(255, 215, 0, 0.08),  // Subtle gold background (bright)
        RGBA(255, 215, 0, 0.03)   // Subtle gold background (dim)
    ),
    Color.White  // Normal white background
)
Rectangle.BorderColor = If(
    ThisItem.NeedsAttention,
    If(Mod(Timer.Value, 1500) < 750, 
        RGBA(255, 215, 0, 1),     // Gold border (bright)
        RGBA(255, 215, 0, 0.6)    // Gold border (dim)
    ),
    RGBA(220, 220, 220, 1)  // Normal gray border
)
Rectangle.BorderThickness = If(ThisItem.NeedsAttention, 2, 1)

// Student Name (Header)
Label.Text = ThisItem.Student.DisplayName
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Submission Time (Subtitle)
Label.Text = "Submitted " & DateDiff(ThisItem.Created, Now(), TimeUnit.Days) & "d " & 
             Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24) & "h " &
             Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Minutes), 60) & "m ago"
Label.Color = If(DateDiff(ThisItem.Created, Now(), TimeUnit.Days) > 2, 
                RGBA(209, 52, 56, 1), 
                RGBA(100, 100, 100, 1))

// Job Identifier (Standardized Filename)
Label.Text = ThisItem.Title // This will be the standardized filename from Flow A
Label.Font = Font.'Courier New'
Label.Color = RGBA(70, 70, 70, 1)

// Email Address
Label.Text = ThisItem.StudentEmail
Label.Color = RGBA(100, 100, 100, 1)

// Printer Selection
Icon.Icon = Icon.Print
Label.Text = ThisItem.PrinterSelection
Label.Color = RGBA(70, 70, 70, 1)

// Color Indicator (Circle)
Circle.Fill = Switch(ThisItem.Color,
    "Dark Yellow", RGBA(218, 165, 32, 1),
    "Blue", RGBA(0, 100, 200, 1),
    "Red", RGBA(200, 50, 50, 1),
    "Black", RGBA(50, 50, 50, 1),
    "White", RGBA(245, 245, 245, 1),
    RGBA(150, 150, 150, 1)
)

// Lightbulb Toggle (Top Right Corner)
Icon.Icon = If(ThisItem.NeedsAttention, Icon.Lightbulb, Icon.LightbulbSolid)
Icon.Color = If(ThisItem.NeedsAttention, 
    RGBA(255, 215, 0, 1),  // Bright gold when ON
    RGBA(150, 150, 150, 1) // Gray when OFF
)
Icon.Size = 24
Icon.X = Parent.Width - 40
Icon.Y = 10
Icon.OnSelect = Patch(PrintRequests, ThisItem, {NeedsAttention: !ThisItem.NeedsAttention})
Icon.Tooltip = If(ThisItem.NeedsAttention, "Mark as handled", "Mark as needing attention")
```

---

## 5. Lightbulb Toggle & Glow Effects

### Attention Toggle (Lightbulb Icon)
```powerfx
// Lightbulb Icon (positioned in top right corner of each card)
Icon.Icon = If(ThisItem.NeedsAttention, Icon.Lightbulb, Icon.LightbulbSolid)
Icon.Color = If(ThisItem.NeedsAttention, 
    RGBA(255, 215, 0, 1),  // Bright gold when ON (needs attention)
    RGBA(150, 150, 150, 1) // Gray when OFF (handled)
)
Icon.Size = 24
Icon.X = Parent.Width - 40  // Position in top right corner
Icon.Y = 10
Icon.OnSelect = Patch(PrintRequests, ThisItem, {NeedsAttention: !ThisItem.NeedsAttention})
Icon.Tooltip = If(ThisItem.NeedsAttention, "Mark as handled", "Mark as needing attention")
```

### Glow Effect for Cards Needing Attention
```powerfx
// Card Background Glow (update the main card Rectangle.Fill)
Rectangle.Fill = If(
    ThisItem.NeedsAttention,
    // Pulsing glow animation - subtle background
    If(Mod(Timer.Value, 1500) < 750, 
        RGBA(255, 215, 0, 0.08),  // Subtle gold background (bright)
        RGBA(255, 215, 0, 0.03)   // Subtle gold background (dim)
    ),
    Color.White  // Normal white background
)

// Alternative: Border Glow (can use instead of or in addition to background)
Rectangle.BorderColor = If(
    ThisItem.NeedsAttention,
    If(Mod(Timer.Value, 1500) < 750, 
        RGBA(255, 215, 0, 1),     // Gold border (bright)
        RGBA(255, 215, 0, 0.6)    // Gold border (dim)
    ),
    RGBA(220, 220, 220, 1)  // Normal gray border
)
Rectangle.BorderThickness = If(ThisItem.NeedsAttention, 2, 1)
```

### Timer for Animation
```powerfx
// Add Timer control to screen for glow animation
Timer.Duration = 1500
Timer.Repeat = true
Timer.AutoStart = true
Timer.Visible = false
```

**SharePoint Field Required:**
- Add `NeedsAttention` (Yes/No) column to PrintRequests list
- Default value: Yes (new jobs automatically need attention)

---

## 6. Action Buttons

### Primary Action Buttons
```powerfx
// Approve Button (Green)
Button.Text = "✓ Approve"
Button.Fill = RGBA(16, 124, 16, 1)
Button.Color = Color.White
Button.OnSelect = Set(varShowApprovalModal, ThisItem.ID); Set(varSelectedItem, ThisItem)

// Reject Button (Red)
Button.Text = "✗ Reject"
Button.Fill = RGBA(209, 52, 56, 1)
Button.Color = Color.White
Button.OnSelect = Set(varShowRejectModal, ThisItem.ID); Set(varSelectedItem, ThisItem)

// Archive Button (Orange)
Button.Text = "📦 Archive"
Button.Fill = RGBA(255, 140, 0, 1)
Button.Color = Color.White
Button.OnSelect = Set(varShowArchiveModal, ThisItem.ID); Set(varSelectedItem, ThisItem)
```

---

## 7. Rejection Modal

### Rejection Modal Container
```powerfx
// Modal Overlay (Full Screen)
Container.Visible = If(varShowRejectModal > 0, true, false)
Container.Fill = RGBA(0, 0, 0, 0.7)  // Dark overlay
Container.X = 0
Container.Y = 0
Container.Width = Parent.Width
Container.Height = Parent.Height

// Modal Content Box (White rectangle in center)
Rectangle.Fill = Color.White
Rectangle.BorderColor = RGBA(200, 200, 200, 1)
Rectangle.BorderThickness = 2
Rectangle.Width = 600
Rectangle.Height = 550
Rectangle.X = (Parent.Width - 600) / 2
Rectangle.Y = (Parent.Height - 550) / 2
Rectangle.RadiusTopLeft = 8
Rectangle.RadiusTopRight = 8
Rectangle.RadiusBottomLeft = 8
Rectangle.RadiusBottomRight = 8
```

### Modal Header and Content
```powerfx
// Modal Title
Label.Text = "Reject Request - " & varSelectedItem.ReqKey
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 20
Label.Color = RGBA(209, 52, 56, 1)
Label.X = Modal.X + 20
Label.Y = Modal.Y + 20

// Student Info
Label.Text = "Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)

// Request Title
Label.Text = "Request: " & varSelectedItem.Title
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)
```

### Staff Attribution Dropdown (Mandatory)
```powerfx
// Staff Selection Label
Label.Text = "Performing Action As: *"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Staff Dropdown
Dropdown.Items = colStaff
Dropdown.DisplayFields = ["Member"]
Dropdown.SearchFields = ["Member"]
Dropdown.DefaultSelectedItems = Filter(colStaff, Lower(Member.Email) = varMeEmail)
Dropdown.Width = 300
Dropdown.BorderColor = If(IsBlank(ddStaffSelection.Selected), 
    RGBA(209, 52, 56, 1),  // Red border if not selected
    RGBA(200, 200, 200, 1) // Normal border
)
Dropdown.HintText = "Select your name to continue"
```

### Rejection Reasons (Checkboxes)
```powerfx
// Rejection Reasons Label
Label.Text = "Rejection Reasons (select all that apply):"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16

// Incomplete Description Checkbox
Checkbox.Text = "Incomplete project description"
Checkbox.Default = false

// Safety Concerns Checkbox
Checkbox.Text = "Safety concerns with design"
Checkbox.Default = false

// Insufficient Detail Checkbox
Checkbox.Text = "Insufficient detail/resolution for printing"
Checkbox.Default = false

// Copyright/IP Checkbox
Checkbox.Text = "Copyright or intellectual property concerns"
Checkbox.Default = false

// Print Complexity Checkbox
Checkbox.Text = "Design too complex for available equipment"
Checkbox.Default = false
```

### Custom Reason Text Area
```powerfx
// Custom Reason Label
Label.Text = "Additional Comments (optional):"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 14

// Custom Reason Text Input
TextInput.Mode = TextMode.MultiLine
TextInput.HintText = "Provide specific feedback to help the student improve their submission..."
TextInput.Width = 540
TextInput.Height = 80
TextInput.BorderColor = RGBA(200, 200, 200, 1)
```

### Modal Action Buttons
```powerfx
// Cancel Button
Button.Text = "Cancel"
Button.Fill = RGBA(150, 150, 150, 1)
Button.Color = Color.White
Button.Width = 120
Button.Height = 40
Button.OnSelect = 
    Set(varShowRejectModal, 0); 
    Set(varSelectedItem, Blank()); 
    Reset(txtCustomReason);
    Reset(ddStaffSelection)

// Confirm Rejection Button  
Button.Text = "✗ Confirm Rejection"
Button.Fill = RGBA(209, 52, 56, 1)
Button.Color = Color.White
Button.Width = 160
Button.Height = 40
Button.DisplayMode = If(IsBlank(ddStaffSelection.Selected), 
    DisplayMode.Disabled, 
    DisplayMode.Edit
)
Button.OnSelect = 
    // Build rejection reasons string
    Set(varRejectionReasons, 
        If(chkIncomplete.Value, "Incomplete description; ", "") &
        If(chkSafety.Value, "Safety concerns; ", "") &
        If(chkDetail.Value, "Insufficient detail; ", "") &
        If(chkCopyright.Value, "Copyright violation; ", "") &
        If(chkComplexity.Value, "Too complex for equipment; ", "")
    );
    
    // Update the record
    Patch(PrintRequests, varSelectedItem, {
        Status: "Rejected", 
        NeedsAttention: false,
        LastAction: "Rejected",
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddStaffSelection.Selected.Member.Email,
            DisplayName: ddStaffSelection.Selected.Member.DisplayName,
            Email: ddStaffSelection.Selected.Member.Email
        },
        LastActionAt: Now(),
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            "REJECTED by " & ddStaffSelection.Selected.Member.DisplayName & ": " & 
            varRejectionReasons & txtCustomReason.Text & " - " & Text(Now(), "mm/dd/yyyy")
        )
    });
    
    // Log the action with selected staff attribution
    IfError(
        'PR-Action: Log action'.Run(
            Text(varSelectedItem.ID),           // RequestID
            "Rejected",                         // Action  
            "Status",                           // FieldName
            varSelectedItem.Status,             // OldValue
            "Rejected",                         // NewValue
            ddStaffSelection.Selected.Member.Email,  // ActorEmail (selected staff)
            "Power Apps",                       // ClientApp
            "Rejected by " & ddStaffSelection.Selected.Member.DisplayName & ". Reasons: " & varRejectionReasons & txtCustomReason.Text
        ),
        Notify("Could not log rejection action.", NotificationType.Error),
        Notify("Request rejected successfully. Student will be notified automatically.", NotificationType.Success)
    );
    
    // Clear modal and reset form
    Set(varShowRejectModal, 0); 
    Set(varSelectedItem, Blank());
    Reset(txtCustomReason); 
    Reset(ddStaffSelection);
    UpdateContext({
        chkIncomplete: false, chkSafety: false, chkDetail: false, 
        chkCopyright: false, chkComplexity: false
    })
```

**Required Variables:**
- `varShowRejectModal` (Number) - ID of item being rejected, 0 = hidden
- `varSelectedItem` (Record) - Currently selected gallery item
- `varRejectionReasons` (Text) - Concatenated rejection reasons
- `colStaff` (Collection) - Active staff members from Staff list

---

## 7b. Approval Modal

### Approval Modal Container
```powerfx
// Modal Overlay (Full Screen)
Container.Visible = If(varShowApprovalModal > 0, true, false)
Container.Fill = RGBA(0, 0, 0, 0.7)  // Dark overlay
Container.X = 0
Container.Y = 0
Container.Width = Parent.Width
Container.Height = Parent.Height

// Modal Content Box (White rectangle in center)
Rectangle.Fill = Color.White
Rectangle.BorderColor = RGBA(200, 200, 200, 1)
Rectangle.BorderThickness = 2
Rectangle.Width = 600
Rectangle.Height = 650
Rectangle.X = (Parent.Width - 600) / 2
Rectangle.Y = (Parent.Height - 650) / 2
Rectangle.RadiusTopLeft = 8
Rectangle.RadiusTopRight = 8
Rectangle.RadiusBottomLeft = 8
Rectangle.RadiusBottomRight = 8
```

### Modal Header and Content
```powerfx
// Modal Title
Label.Text = "Approve Request - " & varSelectedItem.ReqKey
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 20
Label.Color = RGBA(16, 124, 16, 1)
Label.X = Modal.X + 20
Label.Y = Modal.Y + 20

// Student Info
Label.Text = "Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)

// Request Title
Label.Text = "Request: " & varSelectedItem.Title
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)
```

### Staff Attribution Dropdown (Mandatory)
```powerfx
// Staff Selection Label
Label.Text = "Performing Action As: *"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Staff Dropdown
Dropdown.Items = colStaff
Dropdown.DisplayFields = ["Member"]
Dropdown.SearchFields = ["Member"]
Dropdown.DefaultSelectedItems = Filter(colStaff, Lower(Member.Email) = varMeEmail)
Dropdown.Width = 300
Dropdown.BorderColor = If(IsBlank(ddApprovalStaffSelection.Selected), 
    RGBA(209, 52, 56, 1),  // Red border if not selected
    RGBA(200, 200, 200, 1) // Normal border
)
Dropdown.HintText = "Select your name to continue"
```

### Estimated Weight Input
```powerfx
// Weight Label
Label.Text = "Estimated Weight (grams): *"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Weight Text Input
TextInput.Format = TextFormat.Number
TextInput.HintText = "Enter weight in grams (e.g., 25)"
TextInput.Width = 200
TextInput.Height = 40
TextInput.BorderColor = If(
    IsBlank(txtEstimatedWeight.Text) || !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0,
    RGBA(209, 52, 56, 1),  // Red border if invalid
    RGBA(200, 200, 200, 1) // Normal border
)

// Weight Validation Message
Label.Text = If(
    IsBlank(txtEstimatedWeight.Text), 
    "Weight is required",
    !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0,
    "Please enter a valid weight greater than 0",
    ""
)
Label.Color = RGBA(209, 52, 56, 1)
Label.Visible = IsBlank(txtEstimatedWeight.Text) || !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0
Label.Font = Font.'Segoe UI'
Label.Size = 12
```

### Estimated Print Time Input
```powerfx
// Print Time Label  
Label.Text = "Estimated Print Time (hours): (Optional)"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Print Time Text Input
TextInput.Format = TextFormat.Number
TextInput.HintText = "Enter time in hours (e.g., 2.5) - for operational tracking"
TextInput.Width = 200
TextInput.Height = 40
TextInput.BorderColor = If(
    !IsBlank(txtEstimatedTime.Text) && (!IsNumeric(txtEstimatedTime.Text) || Value(txtEstimatedTime.Text) <= 0),
    RGBA(209, 52, 56, 1),  // Red border if invalid (but only when not blank)
    RGBA(200, 200, 200, 1) // Normal border
)

// Time Validation Message (only for invalid entries, not blank)
Label.Text = If(
    !IsBlank(txtEstimatedTime.Text) && (!IsNumeric(txtEstimatedTime.Text) || Value(txtEstimatedTime.Text) <= 0),
    "Please enter a valid time greater than 0 or leave blank",
    ""
)
Label.Color = RGBA(209, 52, 56, 1)
Label.Visible = !IsBlank(txtEstimatedTime.Text) && (!IsNumeric(txtEstimatedTime.Text) || Value(txtEstimatedTime.Text) <= 0)
Label.Font = Font.'Segoe UI'
Label.Size = 12
```

### Cost Calculation Display
```powerfx
// Cost Calculation Label
Label.Text = "Estimated Cost:"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Cost Display (Auto-calculated)
Label.Text = If(
    IsNumeric(txtEstimatedWeight.Text),
    "$" & Text(
        // Cost calculation: Method-specific pricing with $3.00 minimum
        // Filament: $0.10/gram, Resin: $0.20/gram
        Max(
            3.00,  // $3.00 minimum charge
            Value(txtEstimatedWeight.Text) * If(
                varSelectedItem.Method = "Resin", 
                0.20,  // Resin: $0.20 per gram
                0.10   // Filament: $0.10 per gram
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$3.00"  // Show minimum when weight not available
)
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 18
Label.Color = RGBA(16, 124, 16, 1)
```

### Additional Comments Text Area
```powerfx
// Comments Label
Label.Text = "Additional Comments (optional):"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 14

// Comments Text Input
TextInput.Mode = TextMode.MultiLine
TextInput.HintText = "Add any special instructions or notes for the student..."
TextInput.Width = 540
TextInput.Height = 80
TextInput.BorderColor = RGBA(200, 200, 200, 1)
```

### Modal Action Buttons
```powerfx
// Cancel Button
Button.Text = "Cancel"
Button.Fill = RGBA(150, 150, 150, 1)
Button.Color = Color.White
Button.Width = 120
Button.Height = 40
Button.OnSelect = 
    Set(varShowApprovalModal, 0); 
    Set(varSelectedItem, Blank()); 
    Reset(txtEstimatedWeight);
    Reset(txtEstimatedTime);
    Reset(txtApprovalComments);
    Reset(ddApprovalStaffSelection)

// Form Validation Logic
Set(varApprovalFormValid, 
    !IsBlank(ddApprovalStaffSelection.Selected) && 
    !IsBlank(txtEstimatedWeight.Text) && 
    IsNumeric(txtEstimatedWeight.Text) && 
    Value(txtEstimatedWeight.Text) > 0
    // Note: EstimatedTime is optional for cost calculation (cost is based on weight + method only)
)

// Confirm Approval Button  
Button.Text = "✓ Confirm Approval"
Button.Fill = RGBA(16, 124, 16, 1)
Button.Color = Color.White
Button.Width = 160
Button.Height = 40
Button.DisplayMode = If(varApprovalFormValid, 
    DisplayMode.Edit, 
    DisplayMode.Disabled
)
Button.OnSelect = 
    // Calculate total cost with method-specific pricing and $3.00 minimum
    Set(varCalculatedCost, 
        Max(
            3.00,  // $3.00 minimum charge
            Value(txtEstimatedWeight.Text) * If(
                varSelectedItem.Method = "Resin", 
                0.20,  // Resin: $0.20 per gram
                0.10   // Filament: $0.10 per gram  
            )
        )
    );
    
    // Update the record
    Patch(PrintRequests, varSelectedItem, {
        Status: "Ready to Print", 
        NeedsAttention: false,
        LastAction: "Approved",
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddApprovalStaffSelection.Selected.Member.Email,
            DisplayName: ddApprovalStaffSelection.Selected.Member.DisplayName,
            Email: ddApprovalStaffSelection.Selected.Member.Email
        },
        LastActionAt: Now(),
        EstimatedWeight: Value(txtEstimatedWeight.Text),
        EstimatedTime: Value(txtEstimatedTime.Text),
        EstimatedCost: varCalculatedCost,
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            "APPROVED by " & ddApprovalStaffSelection.Selected.Member.DisplayName & 
            ": Weight=" & txtEstimatedWeight.Text & "g, Method=" & varSelectedItem.Method & 
            ", Cost=$" & Text(varCalculatedCost, "[$-en-US]#,##0.00") & " (Min $3.00)" &
            If(!IsBlank(txtApprovalComments.Text), " - " & txtApprovalComments.Text, "") & 
            " - " & Text(Now(), "mm/dd/yyyy")
        )
    });
    
    // Log the action with selected staff attribution
    IfError(
        'PR-Action: Log action'.Run(
            Text(varSelectedItem.ID),           // RequestID
            "Approved",                         // Action  
            "Status",                           // FieldName
            varSelectedItem.Status,             // OldValue
            "Ready to Print",                   // NewValue
            ddApprovalStaffSelection.Selected.Member.Email,  // ActorEmail (selected staff)
            "Power Apps",                       // ClientApp
            "Approved by " & ddApprovalStaffSelection.Selected.Member.DisplayName & 
            ". Weight: " & txtEstimatedWeight.Text & "g, Method: " & varSelectedItem.Method & 
            ", Cost: $" & Text(varCalculatedCost, "[$-en-US]#,##0.00") & " (includes $3.00 min)" & 
            If(!IsBlank(txtApprovalComments.Text), ". Notes: " & txtApprovalComments.Text, "")
        ),
        Notify("Could not log approval action.", NotificationType.Error),
        Notify("Request approved successfully. Student will be notified with cost estimate.", NotificationType.Success)
    );
    
    // Clear modal and reset form
    Set(varShowApprovalModal, 0); 
    Set(varSelectedItem, Blank());
    Reset(txtEstimatedWeight); 
    Reset(txtEstimatedTime);
    Reset(txtApprovalComments);
    Reset(ddApprovalStaffSelection)
```

**Required Variables:**
- `varShowApprovalModal` (Number) - ID of item being approved, 0 = hidden
- `varSelectedItem` (Record) - Currently selected gallery item
- `varCalculatedCost` (Number) - Auto-calculated cost based on weight and time
- `varApprovalFormValid` (Boolean) - Form validation state
- `colStaff` (Collection) - Active staff members from Staff list

**SharePoint Fields Required:**
- Uses existing `EstimatedWeight` (Number) and `EstimatedTime` (Number) columns  
- Uses existing `EstimatedCost` (Currency) column
- **Pricing:** Filament $0.10/gram, Resin $0.20/gram, $3.00 minimum charge

**Email Integration:**
- Approval emails automatically sent via Flow B (PR-Audit) when status = "Ready to Print"
- Includes estimated weight, time, cost, and any additional comments

---

## 7c. Archive Confirmation Modal

### Archive Modal Container
```powerfx
// Modal Overlay (Full Screen)
Container.Visible = If(varShowArchiveModal > 0, true, false)
Container.Fill = RGBA(0, 0, 0, 0.7)  // Dark overlay
Container.X = 0
Container.Y = 0
Container.Width = Parent.Width
Container.Height = Parent.Height

// Modal Content Box (White rectangle in center)
Rectangle.Fill = Color.White
Rectangle.BorderColor = RGBA(200, 200, 200, 1)
Rectangle.BorderThickness = 2
Rectangle.Width = 500
Rectangle.Height = 450
Rectangle.X = (Parent.Width - 500) / 2
Rectangle.Y = (Parent.Height - 450) / 2
Rectangle.RadiusTopLeft = 8
Rectangle.RadiusTopRight = 8
Rectangle.RadiusBottomLeft = 8
Rectangle.RadiusBottomRight = 8
```

### Modal Header and Content
```powerfx
// Modal Title
Label.Text = "Archive Request - " & varSelectedItem.ReqKey
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 20
Label.Color = RGBA(255, 140, 0, 1)
Label.X = Modal.X + 20
Label.Y = Modal.Y + 20

// Warning Icon and Message
Icon.Icon = Icon.Warning
Icon.Color = RGBA(255, 140, 0, 1)
Icon.Size = 32

Label.Text = "This action will permanently archive the request and cannot be undone."
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(209, 52, 56, 1)

// Student Info
Label.Text = "Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)

// Request Title
Label.Text = "Request: " & varSelectedItem.Title
Label.Font = Font.'Segoe UI'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)

// Current Status
Label.Text = "Current Status: " & varSelectedItem.Status
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 14
Label.Color = RGBA(70, 70, 70, 1)
```

### Staff Attribution Dropdown (Mandatory)
```powerfx
// Staff Selection Label
Label.Text = "Performing Action As: *"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 16
Label.Color = RGBA(50, 50, 50, 1)

// Staff Dropdown
Dropdown.Items = colStaff
Dropdown.DisplayFields = ["Member"]
Dropdown.SearchFields = ["Member"]
Dropdown.DefaultSelectedItems = Filter(colStaff, Lower(Member.Email) = varMeEmail)
Dropdown.Width = 300
Dropdown.BorderColor = If(IsBlank(ddArchiveStaffSelection.Selected), 
    RGBA(209, 52, 56, 1),  // Red border if not selected
    RGBA(200, 200, 200, 1) // Normal border
)
Dropdown.HintText = "Select your name to continue"
```

### Archive Reason Text Area
```powerfx
// Archive Reason Label
Label.Text = "Archive Reason (optional):"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 14

// Archive Reason Text Input
TextInput.Mode = TextMode.MultiLine
TextInput.HintText = "Optional: Explain why this request is being archived (e.g., duplicate, withdrawn by student, obsolete)..."
TextInput.Width = 440
TextInput.Height = 80
TextInput.BorderColor = RGBA(200, 200, 200, 1)
```

### Modal Action Buttons
```powerfx
// Cancel Button
Button.Text = "Cancel"
Button.Fill = RGBA(150, 150, 150, 1)
Button.Color = Color.White
Button.Width = 120
Button.Height = 40
Button.OnSelect = 
    Set(varShowArchiveModal, 0); 
    Set(varSelectedItem, Blank()); 
    Reset(txtArchiveReason);
    Reset(ddArchiveStaffSelection)

// Confirm Archive Button  
Button.Text = "⚠️ Confirm Archive"
Button.Fill = RGBA(255, 140, 0, 1)
Button.Color = Color.White
Button.Width = 180
Button.Height = 40
Button.DisplayMode = If(IsBlank(ddArchiveStaffSelection.Selected), 
    DisplayMode.Disabled, 
    DisplayMode.Edit
)
Button.OnSelect = 
    // Update the record
    Patch(PrintRequests, varSelectedItem, {
        Status: "Archived", 
        NeedsAttention: false,
        LastAction: "Archived",
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddArchiveStaffSelection.Selected.Member.Email,
            DisplayName: ddArchiveStaffSelection.Selected.Member.DisplayName,
            Email: ddArchiveStaffSelection.Selected.Member.Email
        },
        LastActionAt: Now(),
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            "ARCHIVED by " & ddArchiveStaffSelection.Selected.Member.DisplayName &
            If(!IsBlank(txtArchiveReason.Text), ": " & txtArchiveReason.Text, "") & 
            " - " & Text(Now(), "mm/dd/yyyy")
        )
    });
    
    // Log the action with selected staff attribution
    IfError(
        'PR-Action: Log action'.Run(
            Text(varSelectedItem.ID),           // RequestID
            "Archived",                         // Action  
            "Status",                           // FieldName
            varSelectedItem.Status,             // OldValue
            "Archived",                         // NewValue
            ddArchiveStaffSelection.Selected.Member.Email,  // ActorEmail (selected staff)
            "Power Apps",                       // ClientApp
            "Archived by " & ddArchiveStaffSelection.Selected.Member.DisplayName & 
            If(!IsBlank(txtArchiveReason.Text), ". Reason: " & txtArchiveReason.Text, "")
        ),
        Notify("Could not log archive action.", NotificationType.Error),
        Notify("Request archived successfully.", NotificationType.Success)
    );
    
    // Clear modal and reset form
    Set(varShowArchiveModal, 0); 
    Set(varSelectedItem, Blank());
    Reset(txtArchiveReason);
    Reset(ddArchiveStaffSelection)
```

**Required Variables:**
- `varShowArchiveModal` (Number) - ID of item being archived, 0 = hidden
- `varSelectedItem` (Record) - Currently selected gallery item
- `colStaff` (Collection) - Active staff members from Staff list

**Safety Features:**
- Confirmation modal prevents accidental clicks
- Staff attribution tracks who performed the action
- Warning message emphasizes permanent nature
- Optional reason field for documentation
- Disabled confirm button until staff is selected

---

## 8. Expandable Details

### Expandable Content
```powerfx
// Expand/Collapse Icon
Icon.Icon = If(ThisItem.Expanded, Icon.ChevronUp, Icon.ChevronDown)
Icon.OnSelect = Patch(PrintRequests, ThisItem, {Expanded: !ThisItem.Expanded})

// Details Container (Visible when expanded)
Container.Visible = ThisItem.Expanded || varExpandAll
```

### Staff Notes Section
```powerfx
// Staff Notes Header
Label.Text = "Staff Notes"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 14
Label.Color = RGBA(50, 50, 50, 1)

// Modern Inline Text Input for Staff Notes
TextInput.Mode = TextMode.MultiLine
TextInput.Default = ThisItem.StaffNotes
TextInput.HintText = "No notes added yet — click to add"
TextInput.Height = If(IsBlank(ThisItem.StaffNotes), 40, Min(120, Len(ThisItem.StaffNotes) / 50 * 20 + 40))
TextInput.Width = Parent.Width - 40
TextInput.BorderStyle = BorderStyle.None
TextInput.Fill = RGBA(248, 248, 248, 1)  // Light gray background
TextInput.Color = RGBA(70, 70, 70, 1)
TextInput.Font = Font.'Segoe UI'
TextInput.Size = 12
TextInput.DisplayMode = DisplayMode.Edit
TextInput.OnChange = 
    // Simple approach: Save immediately when user stops typing
    // This follows modern Power Apps patterns for inline editing
    Patch(
        PrintRequests, 
        ThisItem, 
        {StaffNotes: TextInput.Text}
    )

// Alternative: Manual Save Approach (for better control and audit logging)
Button.Text = "💾 Save Notes"
Button.Fill = RGBA(70, 130, 220, 1)
Button.Color = Color.White
Button.Width = 100
Button.Height = 32
Button.Font = Font.'Segoe UI'
Button.Size = 11
Button.Visible = TextInput.Text <> ThisItem.StaffNotes && !IsBlank(TextInput.Text)
Button.OnSelect = 
    // Manual save with audit logging
    Patch(
        PrintRequests, 
        ThisItem, 
        {StaffNotes: TextInput.Text}
    );
    // Log the staff notes change
    IfError(
        'PR-Action: Log action'.Run(
            Text(ThisItem.ID),
            "Staff Notes Updated",
            "StaffNotes",
            If(IsBlank(ThisItem.StaffNotes), "(blank)", ThisItem.StaffNotes),
            TextInput.Text,
            User().Email,
            "Power Apps",
            "Staff notes updated by " & User().FullName
        ),
        Notify("Could not log notes change.", NotificationType.Error),
        Notify("Staff notes saved successfully.", NotificationType.Success)
    )

// Modern Pattern Notes:
// 1. OnChange approach: Immediate save, follows editable gallery patterns
// 2. Manual save approach: Better for audit logging and user control
// 3. TextInput.Default loads existing values automatically
// 4. HintText provides modern placeholder experience
// 5. BorderStyle.None with Fill creates clean inline editing experience
```

### Additional Details Section (Modern Container-Based Design)
```powerfx
// Additional Details Header
Label.Text = "Additional Details"
Label.Font = Font.'Segoe UI Semibold'
Label.Size = 14
Label.Color = RGBA(50, 50, 50, 1)

// Modern Card-Style Details Container
Container.X = 0
Container.Y = HeaderLabel.Y + HeaderLabel.Height + 8
Container.Width = Parent.Width - 40
Container.Height = 120  // Fixed height for consistent layout
Container.Fill = RGBA(250, 250, 250, 1)  // Very light gray background
Container.BorderStyle = BorderStyle.Solid
Container.BorderColor = RGBA(230, 230, 230, 1)
Container.BorderThickness = 1
Container.RadiusTopLeft = 6
Container.RadiusTopRight = 6
Container.RadiusBottomLeft = 6
Container.RadiusBottomRight = 6

// Responsive Two-Column Layout using modern positioning patterns
// Left Column Container
Container_Left.X = 12  // Margin from parent container
Container_Left.Y = 12
Container_Left.Width = (Parent.Width - 36) / 2  // Half width with spacing
Container_Left.Height = Parent.Height - 24

// Right Column Container  
Container_Right.X = Container_Left.X + Container_Left.Width + 12  // Position right of left container with gap
Container_Right.Y = 12
Container_Right.Width = Parent.Width - Container_Right.X - 12  // Fill remaining width with margin
Container_Right.Height = Parent.Height - 24

// Modern Detail Item Component Pattern (Left Column)
// Job ID Row with Copy Functionality
Container_JobID.X = 0
Container_JobID.Y = 0
Container_JobID.Width = Container_Left.Width
Container_JobID.Height = 24

Label_JobID.Text = "Job ID:"
Label_JobID.X = 0
Label_JobID.Y = (Container_JobID.Height - Label_JobID.Height) / 2  // Center vertically
Label_JobID.Font = Font.'Segoe UI'
Label_JobID.Size = 11
Label_JobID.Color = RGBA(100, 100, 100, 1)
Label_JobID.Width = 50

Label_JobIDValue.Text = ThisItem.ReqKey
Label_JobIDValue.X = Label_JobID.X + Label_JobID.Width + 8
Label_JobIDValue.Y = (Container_JobID.Height - Label_JobIDValue.Height) / 2
Label_JobIDValue.Font = Font.'Segoe UI Semibold'
Label_JobIDValue.Size = 11
Label_JobIDValue.Color = RGBA(70, 70, 70, 1)
Label_JobIDValue.Width = Container_JobID.Width - Label_JobIDValue.X - 24

Icon_Copy.Icon = Icon.Copy
Icon_Copy.X = Container_JobID.Width - 20
Icon_Copy.Y = (Container_JobID.Height - 16) / 2  // Center vertically
Icon_Copy.Size = 14
Icon_Copy.Color = RGBA(70, 130, 220, 1)  // Blue for interactivity
Icon_Copy.OnSelect = 
    CopyToClipboard(ThisItem.ReqKey);
    Notify("Job ID copied: " & ThisItem.ReqKey, NotificationType.Success)

// Created Timestamp Row
Container_Created.X = 0
Container_Created.Y = Container_JobID.Y + Container_JobID.Height + 8
Container_Created.Width = Container_Left.Width
Container_Created.Height = 24

Label_Created.Text = "Created:"
Label_Created.X = 0
Label_Created.Y = (Container_Created.Height - Label_Created.Height) / 2
Label_Created.Font = Font.'Segoe UI'
Label_Created.Size = 11
Label_Created.Color = RGBA(100, 100, 100, 1)
Label_Created.Width = 50

Label_CreatedValue.Text = Text(ThisItem.Created, "mmm dd, yyyy")  // Shortened format for space
Label_CreatedValue.X = Label_Created.X + Label_Created.Width + 8
Label_CreatedValue.Y = (Container_Created.Height - Label_CreatedValue.Height) / 2
Label_CreatedValue.Font = Font.'Segoe UI'
Label_CreatedValue.Size = 11
Label_CreatedValue.Color = RGBA(70, 70, 70, 1)
Label_CreatedValue.Width = Container_Created.Width - Label_CreatedValue.X

// Right Column Details
// Discipline Row
Container_Discipline.X = 0
Container_Discipline.Y = 0
Container_Discipline.Width = Container_Right.Width
Container_Discipline.Height = 24

Label_Discipline.Text = "Discipline:"
Label_Discipline.X = 0
Label_Discipline.Y = (Container_Discipline.Height - Label_Discipline.Height) / 2
Label_Discipline.Font = Font.'Segoe UI'
Label_Discipline.Size = 11
Label_Discipline.Color = RGBA(100, 100, 100, 1)
Label_Discipline.Width = 60

Label_DisciplineValue.Text = ThisItem.Discipline
Label_DisciplineValue.X = Label_Discipline.X + Label_Discipline.Width + 8
Label_DisciplineValue.Y = (Container_Discipline.Height - Label_DisciplineValue.Height) / 2
Label_DisciplineValue.Font = Font.'Segoe UI'
Label_DisciplineValue.Size = 11
Label_DisciplineValue.Color = RGBA(70, 70, 70, 1)
Label_DisciplineValue.Width = Container_Discipline.Width - Label_DisciplineValue.X

// Class Row
Container_Class.X = 0
Container_Class.Y = Container_Discipline.Y + Container_Discipline.Height + 8
Container_Class.Width = Container_Right.Width
Container_Class.Height = 24

Label_Class.Text = "Class:"
Label_Class.X = 0
Label_Class.Y = (Container_Class.Height - Label_Class.Height) / 2
Label_Class.Font = Font.'Segoe UI'
Label_Class.Size = 11
Label_Class.Color = RGBA(100, 100, 100, 1)
Label_Class.Width = 60

Label_ClassValue.Text = ThisItem.Course
Label_ClassValue.X = Label_Class.X + Label_Class.Width + 8
Label_ClassValue.Y = (Container_Class.Height - Label_ClassValue.Height) / 2
Label_ClassValue.Font = Font.'Segoe UI'
Label_ClassValue.Size = 11
Label_ClassValue.Color = RGBA(70, 70, 70, 1)
Label_ClassValue.Width = Container_Class.Width - Label_ClassValue.X

// Modern Pattern Benefits:
// 1. Container-based layout with proper nesting
// 2. Responsive two-column design using modern positioning formulas
// 3. Consistent spacing and alignment using relative positioning
// 4. Card-style visual design with subtle borders and backgrounds
// 5. Improved interactivity with better copy icon styling
// 6. Vertical centering using modern centering formulas
// 7. Scalable component pattern for easy maintenance
```

---

## 9. Implementation Steps

### Step 1: Create Canvas App Structure
1. Create new Canvas app (Tablet layout)
2. Add data connections to PrintRequests, AuditLog, Staff
3. Set up variables in App.OnStart:
   ```powerfx
   Set(varMeEmail, Lower(User().Email));
   Set(varMeName, User().FullName);
   ClearCollect(colStaff, Filter(Staff, Active = true));
   Set(varShowRejectModal, 0);  // Controls rejection modal visibility
   Set(varShowApprovalModal, 0);  // Controls approval modal visibility
   Set(varShowArchiveModal, 0);  // Controls archive modal visibility
   Set(varApprovalFormValid, false);  // Approval form validation state
   ```
4. Add Timer control for glow animations (Duration: 1500ms, AutoStart: true, Repeat: true)

### Step 2: Build Navigation
1. Add horizontal container for top navigation
2. Create status tabs gallery with dynamic counts
3. Add search and filter controls

### Step 3: Create Job Cards Gallery
1. Set up main gallery with filtered items
2. Design job card template with all elements
3. Add expandable details functionality

### Step 4: Implement Actions
1. Create approval/rejection modals
2. Add file opening functionality
3. Implement status change logic

### Step 5: Add Polish
1. Add visual indicators and animations
2. Test responsive behavior
3. Implement sound notifications

---

## 10. Advanced Features

### Sound Notifications
```powerfx
// Play sound on new job submission (trigger from flow or when status changes)
// Can be implemented through flow notifications or status change events
If(varPlayNotificationSound,
    PlaySound(SoundType.Notification);
    Set(varPlayNotificationSound, false)
)
```

---

## Result
This creates an exact replica of the dashboard shown in Dashboard.png with enhanced features:
- ✅ Clean navigation (Dashboard, Admin, Analytics tabs)
- ✅ Status tabs with live counts 
- ✅ Job cards with all details (name, time, identifier, email, printer, color)
- ✅ Status indicators with lightbulb attention system
- ✅ **Lightbulb toggle system** - staff can mark jobs as needing attention
- ✅ **Animated glow effects** - cards pulse with gold glow when flagged
- ✅ **Complete rejection modal** - staff dropdown, reason checkboxes, custom comments
- ✅ **Complete approval modal** - staff dropdown, weight/time inputs, auto-cost calculation  
- ✅ **Complete archive modal** - staff dropdown, confirmation warning, optional reason
- ✅ Action buttons (Approve, Reject, Archive) with full functionality
- ✅ Search functionality with attention-based filtering
- ✅ Expandable details
- ✅ Professional styling and colors

**SharePoint Requirements:**
- Add `NeedsAttention` (Yes/No) column to PrintRequests list with default value: Yes
- Ensure `Staff` list exists with `Member` (Person) and `Active` (Yes/No) columns
- Uses existing `EstimatedWeight` (Number), `EstimatedTime` (Number), and `EstimatedCost` (Currency) columns
- **Lab Pricing:** Filament $0.10/gram, Resin $0.20/gram, $3.00 minimum charge

**Automated Email Integration:**
- Rejection emails automatically sent via Flow B (PR-Audit) when status = "Rejected"
- Approval emails automatically sent via Flow B (PR-Audit) when status = "Ready to Print"
- Includes detailed rejection reasons, approval estimates, costs, and staff attribution

**Total build time: 12-14 hours** for a complete implementation with rejection, approval, and archive modals.
