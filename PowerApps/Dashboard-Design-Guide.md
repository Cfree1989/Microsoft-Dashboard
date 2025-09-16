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

// Admin Button
Button.OnSelect = Navigate(AdminScreen)

// Analytics Button  
Button.OnSelect = Navigate(AnalyticsScreen)
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

## 5. Status Indicators

### Unreviewed Badge
```powerfx
// Unreviewed Indicator
Rectangle.Visible = IsBlank(ThisItem.StaffViewedAt)
Rectangle.Fill = RGBA(255, 185, 0, 1)
Rectangle.RadiusTopLeft = 12
Rectangle.RadiusTopRight = 12
Rectangle.RadiusBottomLeft = 12
Rectangle.RadiusBottomRight = 12

Label.Text = "👁 Unreviewed"
Label.Color = Color.White
Label.Font = Font.'Segoe UI Semibold'
```

---

## 6. Lightbulb Toggle & Glow Effects

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
- This replaces the previous `StaffViewedAt` logic with explicit staff control

---

## 7. Action Buttons

### Primary Action Buttons
```powerfx
// Approve Button (Green)
Button.Text = "✓ Approve"
Button.Fill = RGBA(16, 124, 16, 1)
Button.Color = Color.White
Button.OnSelect = // Launch approval modal

// Reject Button (Red)
Button.Text = "✗ Reject"
Button.Fill = RGBA(209, 52, 56, 1)
Button.Color = Color.White
Button.OnSelect = Set(varShowRejectModal, ThisItem.ID); Set(varSelectedItem, ThisItem)

// Archive Button (Orange)
Button.Text = "📦 Archive"
Button.Fill = RGBA(255, 140, 0, 1)
Button.Color = Color.White
Button.OnSelect = 
    // Update the record first
    Patch(PrintRequests, ThisItem, {
        Status: "Archived", 
        NeedsAttention: false
    });
    
    // Log the action with proper error handling
    IfError(
        'PR-Action: Log action'.Run(
            Text(ThisItem.ID),           // RequestID
            "Archived",                  // Action  
            "Status",                    // FieldName
            ThisItem.Status,             // OldValue (current status)
            "Archived",                  // NewValue
            User().Email,                // ActorEmail
            "Power Apps",                // ClientApp
            "Job archived by staff"      // Notes
        ),
        Notify("Could not log archive action.", NotificationType.Error),
        Notify("Job archived successfully.", NotificationType.Success)
    )
```

---

## 8. Rejection Modal

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

## 9. Expandable Details

### Expandable Content
```powerfx
// Expand/Collapse Icon
Icon.Icon = If(ThisItem.Expanded, Icon.ChevronUp, Icon.ChevronDown)
Icon.OnSelect = Patch(PrintRequests, ThisItem, {Expanded: !ThisItem.Expanded})

// Details Container (Visible when expanded)
Container.Visible = ThisItem.Expanded || varExpandAll

// Additional Details in Expanded View
Label.Text = "Course: " & ThisItem.Course
Label.Text = "Department: " & ThisItem.Department  
Label.Text = "Project Type: " & ThisItem.ProjectType
Label.Text = "Due Date: " & Text(ThisItem.DueDate, "mm/dd/yyyy")
Label.Text = "Notes: " & ThisItem.Notes
```

---

## 10. Implementation Steps

### Step 1: Create Canvas App Structure
1. Create new Canvas app (Tablet layout)
2. Add data connections to PrintRequests, AuditLog, Staff
3. Set up variables in App.OnStart:
   ```powerfx
   Set(varMeEmail, Lower(User().Email));
   Set(varMeName, User().FullName);
   ClearCollect(colStaff, Filter(Staff, Active = true));
   Set(varShowRejectModal, 0);  // Controls modal visibility
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

## 11. Advanced Features

### Visual Alerts (NEW badge, pulsing)
```powerfx
// Pulsing Animation for Unreviewed Jobs
Rectangle.Fill = If(IsBlank(ThisItem.StaffViewedAt), 
    If(Mod(Timer.Value, 2000) < 1000, 
        RGBA(255, 185, 0, 1), 
        RGBA(255, 185, 0, 0.6)
    ),
    Transparent
)
```

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
- ✅ Status indicators (Unreviewed badge)
- ✅ **Lightbulb toggle system** - staff can mark jobs as needing attention
- ✅ **Animated glow effects** - cards pulse with gold glow when flagged
- ✅ **Complete rejection modal** - staff dropdown, reason checkboxes, custom comments
- ✅ Action buttons (Approve, Reject, Archive) with full functionality
- ✅ Search functionality with attention-based filtering
- ✅ Expandable details
- ✅ Professional styling and colors

**SharePoint Requirements:**
- Add `NeedsAttention` (Yes/No) column to PrintRequests list with default value: Yes
- Ensure `Staff` list exists with `Member` (Person) and `Active` (Yes/No) columns

**Automated Email Integration:**
- Rejection emails automatically sent via Flow B (PR-Audit) when status = "Rejected"
- Includes detailed rejection reasons and staff attribution

**Total build time: 8-10 hours** for a complete implementation with rejection modal.
