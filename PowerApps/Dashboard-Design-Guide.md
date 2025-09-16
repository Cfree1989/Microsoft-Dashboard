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
Button.OnSelect = // Launch rejection modal

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

## 8. Expandable Details

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

## 9. Implementation Steps

### Step 1: Create Canvas App Structure
1. Create new Canvas app (Tablet layout)
2. Add data connections to PrintRequests, AuditLog, Staff
3. Set up variables in App.OnStart
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
- ✅ Action buttons (Approve, Reject, Archive)
- ✅ Search functionality with attention-based filtering
- ✅ Expandable details
- ✅ Professional styling and colors

**SharePoint Requirements:**
- Add `NeedsAttention` (Yes/No) column to PrintRequests list with default value: Yes

**Total build time: 6-8 hours** for a complete implementation.
