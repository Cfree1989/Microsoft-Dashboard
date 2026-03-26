# **Notes Format Options**

## **Purpose**

This document finalizes what notes should look like before any more app-spec changes.
The goal is a compact timeline that answers four questions fast:

- When did it happen?
- Who did it?
- What type of action was it?
- What exactly changed or happened?

## **Scope**

Included in the Notes modal:

- Manual staff notes
- Approval
- Rejection
- Archive
- Detail updates
- Revert
- Request status changes
- Payments
- Batch payments
- Build plate actions

Explicitly not included in the Notes modal:

- Student messages
- Staff messages
- Message read/unread activity

Those belong in the Messages modal, not the Notes modal.

## **Core Principles**

- Keep notes compact.
- Do not repeat details already easy to see on the dashboard.
- Do not include plate IDs.
- Do not include transaction numbers.
- Do not include sliced-on computer.
- Do not include build plate count in approval notes.
- Use extra lines only when they improve readability.

## **Preferred Display Format**

Default compact format:

```text
<event type> - <timestamp>
<staff short name> - <action summary>
```

Optional third line:

- Only use a quoted line for manual note text or an important freeform reason/comment.

Examples:

```text
UPDATED - 3/25 9:45am
Conrad F. - Weight 42g -> 103.5g; Hours 3 -> 6
```

```text
REVERTED - 3/25 9:17am
William M. - Printing -> Ready to Print
"Print too small"
```

```text
NOTE - 3/26 9:44am
Sarah B. - "Print too small"
```

## **Storage Contract**

New notes can still use tokenized storage internally, but the rendered output should stay compact.

Recommended stored form:

```text
ACTION by Short Name: [Summary] ... [Changes] ... [Reason] ... [Context] ... [Comment] ... - m/d h:mmam/pm
```

Storage rules:

- Keep the outer entry delimiter as `" | "`.
- Keep `[NOTE]` on manual notes so the existing note counter still works.
- Keep token blocks in storage if needed for parsing, but do not force all of them to display.
- Use ` ~~ ` inside stored blocks when multiple items are needed.
- Sanitize free text so it cannot inject `" | "`, ` ~~ `, or token markers.

## **Display Rules**

Render in this order:

1. Header: `<event type> - <timestamp>`
2. Main line: `<short name> - <most important action summary>`
3. Optional quote line for note text or reason

Use multi-line blocks only when truly necessary:

- `NOTE`: always compact
- `UPDATED`: one compact line if the diff is short enough
- `REJECTED`: add a quoted line if there is a typed comment
- `REVERTED`: add a quoted line for the reason
- `BUILD PLATE`: compact line with label and status change

Avoid `Reasons:` and `Context:` headers unless there is no clearer compact alternative.

## **Event Labels**

Use these event labels:

- `NOTE`
- `APPROVED`
- `REJECTED`
- `ARCHIVED`
- `UPDATED`
- `REVERTED`
- `STATUS`
- `PAID`
- `PAID (BATCH)`
- `BUILD PLATE`

## **Finalized Examples**

### **Manual Staff Note**

Display:

```text
NOTE - 3/26 9:44am
Sarah B. - "Print too small"
```

### **Approval**

Display:

```text
APPROVED - 3/25 8:42am
William M. - 42g, $4.20
```

### **Rejection**

Display:

```text
REJECTED - 3/25 9:17am
William M. - Geometry issue; wall thickness issue
"Print too small"
```

### **Archive**

Display:

```text
ARCHIVED - 3/26 1:20pm
Sarah B. - Duplicate submission
```

### **Detail Update**

Display:

```text
UPDATED - 3/25 9:45am
Conrad F. - Weight 42g -> 103.5g; Hours 3 -> 6; Printer MK4S -> XL
```

### **Revert**

Display:

```text
REVERTED - 3/25 9:17am
William M. - Printing -> Ready to Print
"Print too small"
```

### **Status Change: Start Printing**

Display:

```text
STATUS - 3/26 10:12am
Sarah B. - Ready to Print -> Printing
```

### **Status Change: Print Complete**

Display:

```text
STATUS - 3/26 2:05pm
Sarah B. - Printing -> Completed
```

### **Single Payment**

Display:

```text
PAID - 3/25 10:10am
Sarah B. - $10.10 for 101g
"Paid at front desk"
```

### **Batch Payment**

Display:

```text
PAID (BATCH) - 3/25 10:10am
Sarah B. - $24.40 for 244g
```

### **Build Plate Added**

Display:

```text
BUILD PLATE - 3/26 9:40am
Sarah B. - Added 4/4 on Prusa MK4S
```

## **What Should Not Appear**

Do not show these in normal notes:

- Plate IDs
- Transaction numbers
- Sliced-on computer
- Build plate count
- Message activity

Only include extra detail if the note becomes ambiguous without it.

## **Backward Compatibility**

- Old notes will still need legacy parsing.
- Legacy `UPDATED` entries should render as changes, not as reasons.
- Legacy `[NOTE]` entries should remain simple and quoted where appropriate.
- Do not rewrite historical notes in place.

## **Modal Layout Implications**

- Since the format is compact, the modal should still be wider than it is today.
- The extra width should primarily reduce awkward wrapping, not encourage more metadata.
- The notes area should favor two short lines over long multi-section blocks.

## **Final Recommendation**

Use a compact two-line default:

```text
<event type> - <timestamp>
<staff short name> - <what happened>
```

Add a third quoted line only for a typed note, reason, or short comment.
Keep Notes focused on internal workflow actions and leave messaging activity in the Messages modal.
