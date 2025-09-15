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
If(SharePointForm1.Mode = FormMode.New, "Submitted", Parent.Default)
```

## Hide Staff-only cards
Set **Visible = false** for: `AssignedTo`, `StaffNotes`, `EstHours`, `LastAction`, `LastActionBy`, `LastActionAt`.

## OnSuccess
```powerfx
Notify("Request submitted. You’ll receive an email confirmation shortly.", NotificationType.Success);
```

> Tip: For performance and consistency, cache `User().Email` and `User().FullName` once (e.g., in App.OnStart or Screen.OnVisible) and reuse the variables instead of calling `User()` repeatedly.

Publish the form and set as default.
