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
Set **Visible = false** for: `Status`, `Priority`, `AssignedTo`, `StaffNotes`, `EstHours`, `WeightEstimate`, `LastAction`, `LastActionBy`, `LastActionAt`.

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
"Upload .STL, .OBJ, or .3MF files only. Maximum 50MB per file. Ensure your model fits within the selected printer's build plate dimensions."

## OnSuccess
```powerfx
Notify("Request submitted. You'll receive an email confirmation shortly.", NotificationType.Success);
```

> Tip: For performance and consistency, cache `User().Email` and `User().FullName` once (e.g., in App.OnStart or Screen.OnVisible) and reuse the variables instead of calling `User()` repeatedly.

Publish the form and set as default.
