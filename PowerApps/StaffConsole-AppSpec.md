# Staff Console — Canvas App (Tablet)

Create a **Canvas app (Tablet)**. Add data connections: `PrintRequests`, `AuditLog`, `Staff` and your Flow `PR-Action_LogAction`.

## App.OnStart
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

ClearCollect(colStaff, Filter(Staff, Active = true));
Set(varIsStaff, CountRows(Filter(colStaff, Lower(Member.Email) = varMeEmail)) > 0);

Set(varStatuses, ["Submitted","Intake Review","Needs Info","Approved","Rejected","Queued","Printing","Paused","Failed","Completed","Ready for Pickup","Picked Up","Canceled"]);
Set(varQuickQueue, ["Submitted","Intake Review","Approved","Queued","Printing"]);
```

## Queue Gallery (Items)
```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Status = "Submitted" || Status = "Intake Review" || Status = "Approved" || Status = "Queued" || Status = "Printing"
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
        Status: "Approved",
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
        "Approved",
        varMeEmail,
        "Power Apps",
        "Approved in Staff Console"
    );
    Notify("Marked Approved.", NotificationType.Success),
    Notify("Could not update item. Please try again or contact support.", NotificationType.Error)
)
```

Duplicate this button for other statuses (Queued, Printing, Needs Info, Ready for Pickup, Picked Up, etc.) and adjust literals.
