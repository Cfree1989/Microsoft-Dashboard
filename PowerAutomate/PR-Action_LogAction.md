# Flow C — PR-Action: Log action (called from Power Apps)

**Type:** Instant cloud flow (triggered from Power Apps)

## Trigger Inputs (from Power Apps)
- RequestID (Text)
- Action (Text)
- FieldName (Text)
- OldValue (Text)
- NewValue (Text)
- ActorEmail (Text)
- ClientApp (Text) → `Power Apps`
- Notes (Text)

## Steps
1) **Get item** (PrintRequests) by ID (RequestID)
2) **Create item** in `AuditLog` with:
- Title = `Action: @{triggerBody()['Action']}`
- RequestID = RequestID
- ReqKey = from Get item
- Action = Action
- FieldName = FieldName
- OldValue = OldValue
- NewValue = NewValue
- Actor = ActorEmail (map to Person)
- ActorRole = `Staff`
- ClientApp = ClientApp
- Notes = Notes
- FlowRunId = `@{workflow().run.name}`
3) **Respond to Power Apps** (optional): return `true`/`success`.

> Power Apps tip: Wrap the call in `IfError()` and surface `Notify()` messages for success/failure.
> ```powerfx
> IfError(
>   'PR-Action: Log action'.Run(
>     Text(ThisItem.ID),
>     "Status Change",
>     "Status",
>     ThisItem.Status,
>     "Ready to Print",
>     varMeEmail,
>     "Power Apps",
>     "Approved in Staff Console"
>   ),
>   Notify("Could not log action.", NotificationType.Error),
>   Notify("Action logged.", NotificationType.Success)
> )
> ```
