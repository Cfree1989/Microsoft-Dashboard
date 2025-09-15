# Flow A — PR-Create: Set ReqKey + Acknowledge

**Trigger:** SharePoint — When an item is **created** (List: `PrintRequests`)

## Steps
1) **Initialize variable** `vId` (String)
```
@{triggerOutputs()?['body/ID']}
```
2) **Compose** — `ReqKey`
```
@{concat('REQ-', right(concat('00000', string(triggerOutputs()?['body/ID'])), 5))}
```
3) **Update item** (SharePoint)
- ReqKey = **Outputs** of Compose ReqKey
- StudentEmail =
```
@{toLower(triggerOutputs()?['body/Author/Email'])}
```
4) **Create item** in `AuditLog`
- Title = `Created`
- RequestID = `@{triggerOutputs()?['body/ID']}`
- ReqKey = **Outputs** of Compose ReqKey
- Action = `Created`
- Actor = `triggerOutputs()?['body/Author/Email']` (map to Person)
- ActorRole = `Student`
- ClientApp = `SharePoint Form`
- FlowRunId = `@{workflow().run.name}`

5) **Send an email (V2)** to **StudentEmail**
- Subject: `We received your 3D Print request - @{outputs('Compose ReqKey')}`
- Body: include link to the item:
```
<a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">
View your request (@{outputs('Compose ReqKey')})
</a>
```

> Tip: Add a short summary of the submitted fields in the email body. Consider enabling retry policies on Update item and Send email actions for resiliency.
