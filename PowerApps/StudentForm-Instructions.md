# Student Form — Customized SharePoint Form

Open `PrintRequests` → **Integrate** → **Power Apps** → **Customize forms**.

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
Set **Visible = false** for: `Status`, `Priority`, `AssignedTo`, `StaffNotes`, `EstimatedTime`, `EstimatedWeight`, `EstimatedCost`, `LastAction`, `LastActionBy`, `LastActionAt`.

## Printer Selection Logic

Add conditional visibility for **PrinterSelection** choices based on **Method**:

```powerfx
// For Printer Selection card, modify the Choices property:
If(
    DataCardValue_Method.Selected.Value = "Resin",
    ["Form 3 (5.7×5.7×7.3in)"],
    ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×13.4in)"]
)
```

## File Requirements Helper Text

Add helper text for file attachments:
"Upload .STL, .OBJ, or .3MF files only. Maximum 150MB per file. Ensure your model fits within the selected printer's build plate dimensions."

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
            EndsWith(Lower(DisplayName), ".3mf")
        ),
        Notify("Error: " & DisplayName & " - Only .STL, .OBJ, and .3MF files are allowed.", NotificationType.Error);
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
    Notify("Please attach at least one 3D model file (.stl, .obj, or .3mf)", NotificationType.Error),
    
    // Check if all attached files are valid
    If(
        CountRows(
            Filter(
                Attachments1.Attachments,
                !(
                    EndsWith(Lower(DisplayName), ".stl") || 
                    EndsWith(Lower(DisplayName), ".obj") || 
                    EndsWith(Lower(DisplayName), ".3mf")
                ) ||
                Size > 157286400
            )
        ) > 0,
        Notify("Please remove invalid files and try again. Only .STL/.OBJ/.3MF files under 150MB are allowed.", NotificationType.Error),
        
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
                EndsWith(Lower(DisplayName), ".3mf")
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
            EndsWith(Lower(DisplayName), ".3mf")
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

> Tip: For performance and consistency, cache `User().Email` and `User().FullName` once (e.g., in App.OnStart or Screen.OnVisible) and reuse the variables instead of calling `User()` repeatedly.

Publish the form and set as default.
