# Student Form — Customized SharePoint Form

**⏱️ Time Required:** 2 hours  
**🎯 Goal:** Students can submit 3D print requests with proper validation

---

## Quick Start

1. Open SharePoint → `PrintRequests` list
2. **Integrate** → **Power Apps** → **Customize forms**
3. Follow steps below to configure form
4. **File** → **Publish to SharePoint**
5. Test submission as student user

---

## Set Defaults
- **Student** (DefaultSelectedItems):
```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    [
        {
            DisplayName: User().FullName,
            Claims: "i:0#.f|membership|" & Lower(User().Email),
            Email: Lower(User().Email)
        }
    ],
    Parent.Default
)
```
- **StudentEmail** (Default):
```powerfx
If(SharePointForm1.Mode = FormMode.New, Lower(User().Email), Parent.Default)
```
- **Status** (Default):
```powerfx
If(SharePointForm1.Mode = FormMode.New, "Uploaded", Parent.Default)
```

## Hide Staff-only cards

**Method 1: Remove cards (Recommended)**
1. In Power Apps form designer → Select form
2. **Properties** pane → **Edit fields**
3. For each field below, hover → click **...** → **Remove**

**Method 2: Set Visible = false**
For each data card, set **Visible** property to `false`

**Fields to hide:**
- `Status` - Auto-set by flow
- `Priority` - Staff manages queue priority
- `EstHours` (EstimatedTime) - Staff estimates print time
- `EstWeight` (EstimatedWeight) - Staff estimates material
- `EstimatedCost` - Staff calculates cost
- `StaffNotes` - Internal staff communication
- `LastAction` - Auto-populated by flows
- `LastActionBy` - Auto-populated by flows
- `LastActionAt` - Auto-populated timestamp
- `NeedsAttention` - Staff attention flag
- `StudentConfirmed` - Estimate confirmation flag (SPECIAL: Hide on NEW submissions, but students need to see/edit this field in "My Requests" view to confirm estimates. Set Visible property to: `SharePointForm1.Mode <> FormMode.New`)
- `RejectionReason` - Staff rejection reasons (multi-select)

**⚠️ StudentConfirmed Special Handling:**
This field has dual visibility requirements:
- **New submissions:** Hidden (students don't confirm during initial submission)
- **My Requests view (edit mode):** Visible (students toggle this to confirm cost estimates)
- **Implementation:** Set Visible property to `SharePointForm1.Mode <> FormMode.New` instead of `false`

## Filename Policy (CRITICAL - Show to Students)

Add prominent helper text near the file attachment control to explain the required filename format:

**Helper Text to Display:**
```
⚠️ IMPORTANT: File Naming Requirement

Your files MUST be named in this format:
FirstLast_Method_Color

Examples:
✅ JaneDoe_Filament_Blue.stl
✅ MikeSmith_Resin_Clear.3mf
✅ SarahOConnor_Filament_Red.obj

The system will automatically detect your file extension.
Files not following this format will be rejected automatically.
```

**Implementation:** Add this as a Label control above the Attachments card with:
- Background: Light yellow (#FFF4CE)
- Font: Bold, size 12
- Border: 2px solid orange (#FFB900)

**Why:** Flow A automatically rejects files that don't follow this naming convention. Students need to know this BEFORE submitting.

## Printer Selection Logic

Add conditional visibility for **Printer** choices based on **Method**:

```powerfx
// For Printer Selection card, modify the Choices property:
If(
    DataCardValue_Method.Selected.Value = "Resin",
    ["Form 3 (5.7×5.7×7.3in)"],
    ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"]
)
```

## File Requirements Helper Text

Add helper text for file attachments:
"Upload .STL, .OBJ, .3MF, .IDEA, or .FORM files only. Maximum 150MB per file. Files must be named: FirstLast_Method_Color (example: JaneDoe_Filament_Blue.stl). Files not following this naming format will be automatically rejected."

## Client-Side File Validation

### Attachment Control Validation
```powerfx
// Add to Attachments card OnChange property
ForAll(
    Attachments1.Attachments,
    If(
        // Check file extension
        !( 
            EndsWith(Lower(DisplayName), ".stl") || 
            EndsWith(Lower(DisplayName), ".obj") || 
            EndsWith(Lower(DisplayName), ".3mf") ||
            EndsWith(Lower(DisplayName), ".idea") ||
            EndsWith(Lower(DisplayName), ".form")
        ),
        Notify("Error: " & DisplayName & " - Only .STL, .OBJ, .3MF, .IDEA, and .FORM files are allowed.", NotificationType.Error);
        // Note: Reset(Attachments1) will clear all attachments - consider alternative UX
        ,
        
        // Check file size (150MB = 157,286,400 bytes)
        If(
            Size > 157286400,
            Notify("Error: " & DisplayName & " - File size must be 150MB or less.", NotificationType.Error)
            // Note: Individual file removal from SharePoint attachments is limited
        )
    )
)
```

### Enhanced Submit Button Validation
```powerfx
// Replace default OnSelect with validation logic
If(
    IsEmpty(Attachments1.Attachments),
    Notify("Please attach at least one 3D model file (.stl, .obj, .3mf, .idea, or .form)", NotificationType.Error),
    
    // Check if all attached files are valid
    If(
        CountRows(
            Filter(
                Attachments1.Attachments,
                !(
                    EndsWith(Lower(DisplayName), ".stl") || 
                    EndsWith(Lower(DisplayName), ".obj") || 
                    EndsWith(Lower(DisplayName), ".3mf") ||
                    EndsWith(Lower(DisplayName), ".idea") ||
                    EndsWith(Lower(DisplayName), ".form")
                ) ||
                Size > 157286400
            )
        ) > 0,
        Notify("Please remove invalid files and try again. Only .STL/.OBJ/.3MF/.IDEA/.FORM files under 150MB are allowed.", NotificationType.Error),
        
        // If all validations pass, submit the form
        SubmitForm(SharePointForm1);
        Notify("Request submitted successfully! You'll receive an email confirmation shortly.", NotificationType.Success)
    )
)
```

### File Validation Status Indicator
```powerfx
// Add a label to show validation status (Optional)
Label.Text = If(
    IsEmpty(Attachments1.Attachments),
    "⚠️ No files attached",
    If(
        CountRows(
            Filter(
                Attachments1.Attachments,
                EndsWith(Lower(DisplayName), ".stl") || 
                EndsWith(Lower(DisplayName), ".obj") || 
                EndsWith(Lower(DisplayName), ".3mf") ||
                EndsWith(Lower(DisplayName), ".idea") ||
                EndsWith(Lower(DisplayName), ".form")
            )
        ) = CountRows(Attachments1.Attachments),
        "✅ All files valid",
        "❌ Some files invalid - remove before submitting"
    )
)
Label.Color = If(
    IsEmpty(Attachments1.Attachments), 
    RGBA(255, 165, 0, 1),  // Orange for warning
    If(
        CountRows(Filter(Attachments1.Attachments, 
            EndsWith(Lower(DisplayName), ".stl") || 
            EndsWith(Lower(DisplayName), ".obj") || 
            EndsWith(Lower(DisplayName), ".3mf") ||
            EndsWith(Lower(DisplayName), ".idea") ||
            EndsWith(Lower(DisplayName), ".form")
        )) = CountRows(Attachments1.Attachments),
        RGBA(0, 128, 0, 1),   // Green for valid
        RGBA(255, 0, 0, 1)    // Red for invalid
    )
)
```

**Note**: SharePoint attachment controls have limitations on individual file removal. Consider using a Canvas app with Add Media control for more advanced file management if needed.

## OnSuccess
```powerfx
Notify("Request submitted. You'll receive an email confirmation shortly.", NotificationType.Success);
```

---

## Publish Form

1. **File** → **Save**
2. **File** → **Publish to SharePoint**
3. Back in SharePoint list → **Settings** → **Form settings**
4. Set form as **Default** (if not already)

---

## Test Form (Required)

**As Student User:**
1. Go to PrintRequests list → Click **New**
2. Verify auto-populated fields:
   - [ ] Student name appears
   - [ ] StudentEmail filled with your email
3. Fill required fields:
   - Method: Filament
   - Printer: Prusa MK4S
   - Color: Blue
4. Attach valid file: `YourName_Filament_Blue.stl`
5. Click **Save**
6. Verify:
   - [ ] Success notification appears
   - [ ] Item appears in list with Status = "Uploaded"
   - [ ] ReqKey generated (REQ-00001)
   - [ ] Confirmation email received

**Test Invalid File:**
1. Create new request
2. Attach: `model.stl` (invalid name)
3. Try to submit
4. Should see error message about file naming

---

## Filename Validation Examples

**Valid Filenames:**
- ✅ `JaneDoe_Filament_Blue.stl`
- ✅ `MikeSmith_Resin_Clear.3mf`
- ✅ `SarahOConnor_Filament_Red.obj`
- ✅ `PatrickOBrien_Filament_Black.idea` (PrusaSlicer project)
- ✅ `MaryJane_Resin_Clear.form` (Formlabs project)

**Invalid Filenames (will be auto-rejected):**
- ❌ `model.stl` (missing student name, method, color)
- ❌ `JaneDoe.stl` (missing method and color)
- ❌ `JaneDoe_Blue.stl` (missing method)
- ❌ `Jane Doe_Filament_Blue.stl` (spaces in name - use JaneDoe)
- ❌ `project.pdf` (invalid file type)

**Character Cleaning (automatic):**
Student names are automatically cleaned:
- Spaces removed: "Jane Doe" → "JaneDoe"
- Hyphens removed: "Mary-Jane" → "MaryJane"
- Apostrophes removed: "O'Connor" → "OConnor"

---

## Troubleshooting

**Student field not auto-populating:**
- Check DefaultSelectedItems expression syntax
- Verify User() function returns data in Power Apps

**Hidden fields still showing:**
- Refresh Power Apps designer
- Verify Visible = false on each card
- Or remove cards via Edit fields pane

**File validation not working:**
- Check Attachments card OnChange expression
- Verify EndsWith() syntax correct
- Test with different file types

---

## Next Steps

After form is working:
1. ✅ Test with Flow A (PR-Create)
2. ✅ Verify ReqKey generation
3. ✅ Confirm email delivery
4. 🎯 Move to Staff Dashboard (Phase 3.2)

---

**Microsoft Best Practice:** Always test forms in Preview mode (F5) before publishing. Verify all default values, validation logic, and hidden fields work as expected.

> **Performance Tip:** Cache `User().Email` and `User().FullName` in variables (Screen.OnVisible or App.OnStart) instead of calling `User()` repeatedly in formulas.
