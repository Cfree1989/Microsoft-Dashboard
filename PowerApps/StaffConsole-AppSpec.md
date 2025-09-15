# Staff Console — Canvas App (Tablet)

Create a **Canvas app (Tablet)**. Add data connections: `PrintRequests`, `AuditLog`, `Staff` and your Flow `PR-Action_LogAction`.

## App.OnStart
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

ClearCollect(colStaff, Filter(Staff, Active = true));
Set(varIsStaff, CountRows(Filter(colStaff, Lower(Member.Email) = varMeEmail)) > 0);

Set(varStatuses, ["Uploaded","Pending","Ready to Print","Printing","Completed","Paid & Picked Up","Rejected","Archived"]);
Set(varQuickQueue, ["Uploaded","Pending","Ready to Print","Printing","Completed"]);
```

## Queue Gallery (Items)
```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Status = "Uploaded" || Status = "Pending" || Status = "Ready to Print" || Status = "Printing" || Status = "Completed"
    ),
    "Modified",
    Descending
)
```

## Person record for Patch (e.g., Screen.OnVisible)
```powerfx
Set(varActor,
{
  '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
  Claims: "i:0#.f|membership|" & varMeEmail,
  DisplayName: varMeName,
  Email: varMeEmail
});
```

## Approve button (OnSelect)
```powerfx
IfError(
    Patch(PrintRequests, ThisItem, {
        Status: "Ready to Print",
        LastAction: "Approved",
        LastActionBy: varActor,
        LastActionAt: Now(),
        AssignedTo: varActor
    });
    'PR-Action_LogAction'.Run(
        Text(ThisItem.ID),
        "Status Change",
        "Status",
        ThisItem.Status,
        "Ready to Print",
        varMeEmail,
        "Power Apps",
        "Approved in Staff Console"
    );
    Notify("Marked Ready to Print.", NotificationType.Success),
    Notify("Could not update item. Please try again or contact support.", NotificationType.Error)
)
```

## Additional Action Buttons

Create similar buttons for other status transitions:

- **Reject Button**: Status → "Rejected"
- **Start Printing Button**: Status → "Printing" 
- **Complete Printing Button**: Status → "Completed"
- **Ready for Pickup Button**: Status → "Paid & Picked Up"
- **Archive Button**: Status → "Archived"

## Printer Selection UX Notes

For the student form, implement conditional logic:
- When Method = "Resin" → Show only "Form 3 (145×145×185mm)" 
- When Method = "Filament" → Show all FDM printers with dimensions
- Display build plate dimensions prominently to help students self-select appropriate printer
