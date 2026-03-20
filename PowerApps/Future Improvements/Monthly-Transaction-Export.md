# Monthly Transaction Export

**Status:** Future Enhancement  
**Priority:** Medium  
**Dependencies:** Multi-Payment Tracking Enhancement (#5, required)

---

## Overview

Add an in-app export that generates a simple Excel spreadsheet of all payment transactions for a selected month. Accounting only needs four columns: Transaction Number, Payer, Amount, and Date.

### Current Process (Manual)

1. Staff maintains a TigerCASH Excel log by hand throughout the month
2. At month end, the spreadsheet is sent to departmental accounting
3. Error-prone: typos, missed entries, inconsistent formatting

### Future Process (Automated)

1. Staff clicks the **Analytics** button in the nav bar → export modal opens
2. Selects month and year from dropdowns
3. Clicks **Download Excel** → Power Automate generates the file
4. Staff downloads the file, manually adds Art Building transactions (typically < 5), and emails to accounting

> Art Building transactions are low-volume and entered by staff into the downloaded file before sending. Only Atkinson Hall 145 transactions flow through the dashboard.

---

## Export Output

### File Format

- **Type:** Excel (.xlsx)
- **Filename:** `TigerCASH-Log-{Month}-{Year}.xlsx` (e.g., `TigerCASH-Log-March-2026.xlsx`)
- **Sheet Name:** `Transactions`

### Columns

| Excel Column | SharePoint Source (`Payments` list) |
|---|---|
| A: Transaction # | `TransactionNumber` |
| B: Payer | `PayerName` |
| C: Amount | `Amount` |
| D: Date | `PaymentDate` |

### Sort Order

- Primary: `PaymentDate` ascending
- Secondary: `TransactionNumber` ascending

### Trailing Blank Rows

Append **5 empty rows** below the last data row so staff can type in Art Building transactions without reformatting the table.

### Sample Output

| Transaction # | Payer | Amount | Date |
|---|---|---|---|
| 214 | Ryan Atkinson | $11.50 | 3/2/2026 |
| 215 | Lily Bacas | $4.90 | 3/2/2026 |
| 216 | Caitlin Mclin | $17.30 | 3/2/2026 |
| 217 | Luca Passalacqua | $3.00 | 3/2/2026 |
| ... | ... | ... | ... |
| 298 | Ava Stout | $15.90 | 3/20/2026 |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

---

## UI: Export Modal

The export lives in a modal triggered from the existing `btnNavAnalytics` button in the nav bar. No new screen is needed.

### Wireframe

```
+---------------------------------------------------+
|  Monthly Transaction Export                  [ X ] |
|---------------------------------------------------|
|                                                   |
|  Month: [ March       v ]  Year: [ 2026    v ]   |
|                                                   |
|  87 transactions  ·  $1,204.30 total              |
|                                                   |
|               [ Download Excel ]                  |
|                                                   |
|  Art Building transactions must be added          |
|  manually after download.                         |
+---------------------------------------------------+
```

### Control Tree

```
▼ conExportModal                    ← Container (visibility gate)
    recExportOverlay                ← Dark overlay
    recExportBox                    ← White modal box
    lblExportTitle                  ← Title label
    btnExportClose                  ← Close button (X)
    lblExportMonthLabel             ← "Month:" label
    ddExportMonth                   ← Month dropdown
    lblExportYearLabel              ← "Year:" label
    ddExportYear                    ← Year dropdown
    lblExportPreview                ← Transaction count + total
    btnExportDownload               ← Download button
    lblExportNote                   ← Art Building note
```

### Navigation Trigger

Update `btnNavAnalytics` (currently shows a "coming soon" notification) to open the modal:

```powerfx
// btnNavAnalytics.OnSelect
Set(varShowExportModal, true)
```

### New Variable

Add to `App.OnStart`:

```powerfx
Set(varShowExportModal, false);
```

| Variable | Purpose | Type |
|---|---|---|
| `varShowExportModal` | Controls export modal visibility | Boolean |

---

### Control Specifications

#### Modal Container (conExportModal)

| Property | Value |
|---|---|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowExportModal` |

> Visibility is set ONLY on this container. All child controls inherit it automatically.

#### Modal Overlay (recExportOverlay)

| Property | Value |
|---|---|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |
| OnSelect | `Set(varShowExportModal, false)` |

#### Modal Box (recExportBox)

| Property | Value |
|---|---|
| X | `(Parent.Width - Self.Width) / 2` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `500` |
| Height | `320` |
| Fill | `White` |
| BorderRadius | `varRadiusLarge` |

#### Title (lblExportTitle)

| Property | Value |
|---|---|
| Text | `"Monthly Transaction Export"` |
| Font | `varAppFont` |
| Size | `16` |
| FontWeight | `FontWeight.Bold` |

#### Close Button (btnExportClose)

| Property | Value |
|---|---|
| Text | `"X"` |
| OnSelect | `Set(varShowExportModal, false)` |

#### Month Dropdown (ddExportMonth)

| Property | Value |
|---|---|
| Items | See formula below |
| Default | Current month |

```powerfx
Table(
    {Display: "January", Value: 1},
    {Display: "February", Value: 2},
    {Display: "March", Value: 3},
    {Display: "April", Value: 4},
    {Display: "May", Value: 5},
    {Display: "June", Value: 6},
    {Display: "July", Value: 7},
    {Display: "August", Value: 8},
    {Display: "September", Value: 9},
    {Display: "October", Value: 10},
    {Display: "November", Value: 11},
    {Display: "December", Value: 12}
)
```

Default to current month:

```powerfx
LookUp(Self.Items, Value = Month(Today()))
```

#### Year Dropdown (ddExportYear)

| Property | Value |
|---|---|
| Items | `[Year(Today()) - 1, Year(Today()), Year(Today()) + 1]` |
| Default | `Year(Today())` |

#### Preview Label (lblExportPreview)

| Property | Value |
|---|---|
| Text | See formula below |
| Font | `varAppFont` |
| Size | `13` |
| Color | `varColorText` |

```powerfx
With(
    {
        filtered: Filter(
            colAllPayments,
            Month(PaymentDate) = ddExportMonth.Selected.Value &&
            Year(PaymentDate) = ddExportYear.Selected.Value
        )
    },
    CountRows(filtered) & " transactions  ·  " &
    Text(Sum(filtered, Amount), "[$-en-US]$#,##0.00") & " total"
)
```

> This queries the local `colAllPayments` collection (pre-loaded at startup) for preview purposes only. The actual export uses Power Automate with server-side filtering — no delegation limits.

#### Download Button (btnExportDownload)

| Property | Value |
|---|---|
| Text | `"Download Excel"` |
| Fill | `varColorSuccess` |
| Color | `White` |
| BorderRadius | `varRadiusSmall` |
| DisplayMode | See formula below |
| OnSelect | See formula below |

Disable when no transactions exist:

```powerfx
If(
    CountRows(
        Filter(
            colAllPayments,
            Month(PaymentDate) = ddExportMonth.Selected.Value &&
            Year(PaymentDate) = ddExportYear.Selected.Value
        )
    ) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

OnSelect — trigger the Power Automate flow:

```powerfx
Set(varIsLoading, true);
Set(varLoadingMessage, "Generating export...");

Set(
    varExportResult,
    GenerateMonthlyExport.Run(
        ddExportMonth.Selected.Value,
        ddExportYear.Selected.Value
    )
);

Set(varIsLoading, false);
Set(varLoadingMessage, "");

If(
    !IsBlank(varExportResult.FileUrl),
    Download(varExportResult.FileUrl);
    Notify("Export ready — check your downloads.", NotificationType.Success),
    Notify("Export failed. Try again or contact admin.", NotificationType.Error)
)
```

#### Art Building Note (lblExportNote)

| Property | Value |
|---|---|
| Text | `"Art Building transactions must be added manually after download."` |
| Size | `11` |
| Color | `RGBA(120, 120, 120, 1)` |
| Italic | `true` |

---

## Power Automate Flow: GenerateMonthlyExport

Power Apps cannot create Excel files directly. This flow handles the server-side work: query SharePoint, build the spreadsheet, and return a download URL.

### Trigger

**PowerApps (V2)**

Inputs:
- `Month` (number, 1–12)
- `Year` (number, e.g. 2026)

### Steps

**1. Compose start/end dates**

```
StartDate: @{concat(triggerBody()['text_1'], '-', formatNumber(triggerBody()['text'], '00'), '-01')}
EndDate:   @{addDays(endOfMonth(variables('StartDate')), 1)}
```

**2. Get Payments from SharePoint**

Action: **Get items** on the `Payments` list.

OData filter:

```
PaymentDate ge '@{formatDateTime(variables('StartDate'), 'yyyy-MM-dd')}' and PaymentDate lt '@{formatDateTime(variables('EndDate'), 'yyyy-MM-dd')}'
```

Order by: `PaymentDate asc, TransactionNumber asc`

Top count: `5000` (well above any realistic monthly volume)

> No delegation limits here — Power Automate queries SharePoint server-side via OData, so even 500+ records are handled without issue.

**3. Create Excel file in SharePoint**

Action: **Create file** in a designated document library folder (e.g., `Shared Documents/Exports`).

Filename: `TigerCASH-Log-@{variables('MonthName')}-@{triggerBody()['text_1']}.xlsx`

Use the **Create table** action (Excel Online Business connector) to insert a table named `Transactions` with columns: `Transaction #`, `Payer`, `Amount`, `Date`.

**4. Add rows to table**

Action: **Apply to each** over the Get items output.

For each payment, **Add a row into a table**:

| Table Column | Value |
|---|---|
| Transaction # | `items('Apply_to_each')?['TransactionNumber']` |
| Payer | `items('Apply_to_each')?['PayerName']` |
| Amount | `items('Apply_to_each')?['Amount']` |
| Date | `formatDateTime(items('Apply_to_each')?['PaymentDate'], 'M/d/yyyy')` |

After the data rows, add **5 blank rows** (empty strings for all columns) so staff can manually append Art Building entries.

**5. Return download URL**

Action: **Respond to a PowerApp or flow** with:

| Output | Value |
|---|---|
| `FileUrl` | File link from the Create file step |
| `Success` | `true` |

---

## Error Handling

### No Transactions Found

The **Download Excel** button is disabled when the preview count is zero. The label shows `0 transactions · $0.00 total`, making it clear there is nothing to export.

### Flow Failure

If `varExportResult.FileUrl` is blank or the flow errors, the app displays:

```
"Export failed. Try again or contact admin."
```

The existing loading overlay (`varIsLoading`) shows "Generating export..." while the flow runs and clears automatically on completion or failure.

### Large Months

Even months with 100+ transactions complete in seconds. Power Automate's SharePoint connector handles bulk reads natively, and Excel row insertion is fast for this volume.

---

## Dependencies

### Required

- **Multi-Payment Tracking Enhancement (#5)** — Creates the `Payments` SharePoint list this export queries
- **Power Automate** — Included with most Microsoft 365 plans; needed to generate the Excel file
- **SharePoint document library** — Storage location for generated exports (e.g., `Shared Documents/Exports`)

### Without Multi-Payment Tracking

If the `Payments` list does not yet exist, this feature cannot be built. Legacy payment data stored directly on `PrintRequests` (single `FinalCost` / `TransactionNumber` fields) does not support per-transaction export rows.

---

## Testing

### Scenario 1: Normal Month

1. Open export modal, select "March" / "2026"
2. Preview shows transaction count and total
3. Click **Download Excel**
4. Verify file downloads with 4 columns, correct data, sorted by date then transaction number
5. Verify 5 blank rows at the bottom for manual entries

### Scenario 2: Empty Month

1. Select a month with no payment records
2. Preview shows "0 transactions · $0.00 total"
3. Download button is disabled

### Scenario 3: Large Month (100+ transactions)

1. Select a busy month
2. Loading overlay appears during generation
3. File generates successfully, all rows present

---

## Related Documents

- **Payments List Setup:** `SharePoint/Payments-List-Setup.md`
- **Staff Dashboard App Spec:** `PowerApps/StaffDashboard-App-Spec.md`
- **Current TigerCASH Log:** `TigerCASH Log 25-26.xlsx` (reference for what accounting currently receives)

---

*Last Updated: March 20, 2026*
