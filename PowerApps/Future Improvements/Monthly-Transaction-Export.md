# Monthly Transaction Export

**Status:** Future Enhancement  
**Priority:** Medium  
**Dependencies:** Multi-Payment Tracking Enhancement (#5, required), Payer Tracking Enhancement (#2, optional but recommended)

---

## Overview

Create an in-app export feature that generates an Excel spreadsheet of all transactions for a selected month, matching the format of the current manual TigerCASH log used by finance.

### Current Process (Manual)

1. Staff manually maintains an Excel spreadsheet throughout the month
2. Each payment is typed into the log by hand
3. At month end, the spreadsheet is sent to finance
4. Error-prone: typos, missed entries, inconsistent formatting

### Future Process (Automated)

1. Staff clicks "Export Monthly Report" button in the dashboard
2. Selects target month/year from dropdown
3. App generates Excel file with all transactions
4. Staff downloads and sends to finance (or reviews first)

---

## Export Specifications

### File Format

- **Type:** Excel (.xlsx)
- **Filename:** `TigerCASH-Log-{Month}-{Year}.xlsx` (e.g., `TigerCASH-Log-March-2026.xlsx`)
- **Sheet Name:** `Atkinson Hall 145`

### Column Mapping

> ⚠️ **Data Source Change:** With Multi-Payment Tracking (#5), this export queries the `Payments` list instead of `PrintRequests`. Each row represents one actual transaction, enabling accurate tracking of partial pickups and multiple payments per job.

| Excel Column | SharePoint Source | Notes |
|--------------|-------------------|-------|
| A: Machine | `LookUp(PrintRequests, ID = RequestID).Method.Value` | "Prusa" for Filament, "Resin" for Resin |
| B: $/Unit | Rate based on Method | `varFilamentRate` or `varResinRate` |
| C: Unit Amount | `Weight` | Actual weight in grams (from Payments) |
| D: Cost | `Amount` | Amount charged (from Payments) |
| E: Payer | `PayerName` | From Payments record (or falls back via lookup) |
| F: Notes | `LookUp(PrintRequests, ID = RequestID).PaymentNotes` | Staff notes from parent request |
| G: Course Number | `LookUp(PrintRequests, ID = RequestID).CourseNumber` | Student's course |
| H: Date | `PaymentDate` | Payment date (from Payments) |
| I: Transaction Number | `TransactionNumber` | TigerCASH/Check/Code reference (from Payments) |
| J: Processed By | `RecordedBy.DisplayName` | Staff who processed this payment |
| K: Request ID | `ReqKey` | e.g., "REQ-00042" (from Payments) |

### Data Filter

> 💡 **Why Power Automate:** The `Month()` and `Year()` functions are NOT delegable in Power Apps, meaning only the first 500-2,000 records would be processed. Power Automate handles the full dataset using OData filters.

**Power Automate OData Filter (recommended):**
```
PaymentDate ge '@{formatDateTime(startOfMonth(variables('SelectedDate')), 'yyyy-MM-dd')}' and PaymentDate lt '@{formatDateTime(addDays(endOfMonth(variables('SelectedDate')), 1), 'yyyy-MM-dd')}'
```

**Power Apps Preview (for UI only, not for export):**
```powerfx
Filter(
    Payments,
    Month(PaymentDate) = varSelectedMonth &&
    Year(PaymentDate) = varSelectedYear
)
```

### Sort Order

- Primary: `PaymentDate` (ascending)
- Secondary: `TransactionNumber` (ascending)

---

## UI Design

### Location: Analytics Page

This export feature will live on the future **Analytics page** (`scrAnalytics`), accessible via the top navigation bar. The Analytics page will house various reporting and data visualization features, with the Monthly Transaction Export as one section.

```
┌─────────────────────────────────────────────────────────────┐
│  [ Dashboard ]  [ Analytics ]  [ Admin ]                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MONTHLY TRANSACTION EXPORT                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  Select Month: *              Select Year: *        │    │
│  │  ┌─────────────────┐          ┌─────────────────┐   │    │
│  │  │ March        ▼  │          │ 2026         ▼  │   │    │
│  │  └─────────────────┘          └─────────────────┘   │    │
│  │                                                     │    │
│  │  Preview: 16 transactions found                     │    │
│  │  Total Amount: $187.50                              │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │ ReqKey    │ Payer           │ Cost   │ Date │    │    │
│  │  ├───────────┼─────────────────┼────────┼──────┤    │    │
│  │  │ REQ-00042 │ Ryan Atkinson   │ $11.50 │ 3/2  │    │    │
│  │  │ REQ-00043 │ Lily Bacas      │ $4.90  │ 3/2  │    │    │
│  │  │ REQ-00044 │ Caitlin Mclin   │ $17.30 │ 3/2  │    │    │
│  │  │ ...       │ ...             │ ...    │ ...  │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  │            [ Download Excel ]                       │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  (Additional analytics sections below)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Update

The existing `btnNavAnalytics` button (currently hidden with `Visible: false`) will be enabled and wired to navigate to `scrAnalytics`:

```powerfx
// btnNavAnalytics.OnSelect
Set(varCurrentPage, "Analytics");
Navigate(scrAnalytics, varScreenTransition)
```

### Future Analytics Page Sections

The Analytics page can grow to include additional reporting features:

- **Monthly Transaction Export** (this feature)
- Print volume trends by week/month
- Revenue summary and charts
- Popular print methods breakdown
- Staff activity and processing times
- Student submission patterns

---

## Technical Implementation

### Approach: Power Automate Flow

Power Apps cannot directly create Excel files. Use a Power Automate flow triggered from the app.

#### Flow: GenerateMonthlyExport

**Trigger:** PowerApps (V2)

**Inputs:**
- `Month` (number: 1-12)
- `Year` (number: e.g., 2026)
- `RequestorEmail` (string: who triggered it)

**Steps:**

1. **Initialize Variables**
   - `SelectedDate` (string): Compose a date from Month/Year inputs → `@{concat(triggerBody()['text_1'], '-', triggerBody()['text'], '-01')}`

2. **Get Payments** - Query SharePoint `Payments` list
   - OData Filter: `PaymentDate ge '@{formatDateTime(startOfMonth(variables('SelectedDate')), 'yyyy-MM-dd')}' and PaymentDate lt '@{formatDateTime(addDays(endOfMonth(variables('SelectedDate')), 1), 'yyyy-MM-dd')}'`
   - This returns ALL payments for the selected month (no delegation limits)

3. **Get Parent Request Details** - For each payment, get the parent `PrintRequests` item
   - Use `Get item` action with `RequestID` to fetch Method, CourseNumber, etc.
   - Consider batching with "Get items" + Filter array for better performance

4. **Create Excel Table** - Use "Create table" action in Excel Online
   - Location: OneDrive or SharePoint document library
   - Create new file: `TigerCASH-Log-{Month}-{Year}.xlsx`

5. **Add Rows** - For each payment, add row to table
   - Map columns per specification above
   - Combine payment data with parent request data

6. **Return File** - Return file content or download URL to PowerApps

> 💡 **Performance Tip:** Instead of calling "Get item" for each payment, use "Get items" on PrintRequests with an `ID` filter for all unique RequestIDs, then use Filter array in the flow to match them up. This reduces API calls significantly.

#### PowerApps Button OnSelect

```powerfx
// Validate selection
If(
    IsBlank(ddExportMonth.Selected) || IsBlank(ddExportYear.Selected),
    Notify("Please select a month and year", NotificationType.Warning),
    
    // Show loading
    Set(varIsLoading, true);
    Set(varLoadingMessage, "Generating export...");
    
    // Call flow
    Set(
        varExportResult,
        GenerateMonthlyExport.Run(
            ddExportMonth.Selected.Value,
            ddExportYear.Selected.Value,
            varMeEmail
        )
    );
    
    // Handle result
    Set(varIsLoading, false);
    Set(varLoadingMessage, "");
    
    If(
        varExportResult.Success,
        // Download file or show link
        Download(varExportResult.FileUrl);
        Notify("Export complete! Check your downloads.", NotificationType.Success),
        Notify("Export failed: " & varExportResult.Error, NotificationType.Error)
    )
)
```

### Alternative: Office Scripts

If Power Automate licensing is a constraint, use Office Scripts with Excel Online:

1. Create an Office Script that formats the data
2. Call the script from Power Automate (or directly if supported)
3. More control over Excel formatting

---

## Control Specifications

### Month Dropdown (ddExportMonth)

| Property | Value |
|----------|-------|
| Items | `["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]` |
| Default | `Text(Today(), "mmmm")` |

Or use a table for month numbers:

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

### Year Dropdown (ddExportYear)

| Property | Value |
|----------|-------|
| Items | `[Year(Today()) - 1, Year(Today()), Year(Today()) + 1]` |
| Default | `Year(Today())` |

### Preview Count Label (lblExportPreview)

| Property | Value |
|----------|-------|
| Text | See formula below |

```powerfx
With(
    {
        filtered: Filter(
            PrintRequests,
            Status.Value = "Paid & Picked Up" &&
            Month(PaymentDate) = ddExportMonth.Selected.Value &&
            Year(PaymentDate) = ddExportYear.Selected.Value
        )
    },
    "Found: " & CountRows(filtered) & " transactions" & Char(10) &
    "Total: " & Text(Sum(filtered, FinalCost), "[$-en-US]$#,##0.00")
)
```

### Download Button (btnExportDownload)

| Property | Value |
|----------|-------|
| Text | `"Download Excel"` |
| DisplayMode | `If(CountRows(filtered) > 0, DisplayMode.Edit, DisplayMode.Disabled)` |
| Fill | `varColorSuccess` |

---

## Preview Gallery (Optional)

Show a preview of what will be exported before download.

### Gallery: galExportPreview

| Property | Value |
|----------|-------|
| Items | See filter formula above |
| Height | `300` |
| TemplateSize | `40` |

### Gallery Template

```
┌────────────────────────────────────────────────────────────┐
│ REQ-00042  │  Ryan Atkinson  │  $11.50  │  3/2/2026       │
└────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### No Transactions Found

```powerfx
If(
    CountRows(filtered) = 0,
    Notify(
        "No transactions found for " & ddExportMonth.Selected.Display & " " & Text(ddExportYear.Selected.Value),
        NotificationType.Information
    )
)
```

### Flow Failure

- Display error message from flow
- Log error for troubleshooting
- Suggest manual export as fallback

### Timeout

- Large months (100+ transactions) may take time
- Show progress indicator
- Consider pagination for very large datasets

---

## Security Considerations

### Who Can Export?

| Option | Implementation |
|--------|----------------|
| All Staff | Default - anyone in `colStaff` can export |
| Managers Only | Add `Role` check: `Filter(colStaff, MemberEmail = varMeEmail && Role = "Manager")` |
| Specific Users | Create `ExportUsers` list in SharePoint |

### Audit Trail

Log each export for accountability:

```powerfx
Patch(
    ExportLog,  // New SharePoint list
    Defaults(ExportLog),
    {
        ExportedBy: varActor,
        ExportMonth: ddExportMonth.Selected.Value,
        ExportYear: ddExportYear.Selected.Value,
        TransactionCount: CountRows(filtered),
        TotalAmount: Sum(filtered, FinalCost),
        ExportedAt: Now()
    }
)
```

---

## Implementation Priority

### Phase 1: Basic Export

1. Create Power Automate flow `GenerateMonthlyExport`
2. Add Export button to dashboard (or modal)
3. Add month/year dropdowns
4. Basic Excel generation with core columns

### Phase 2: Enhanced UI

1. Add preview gallery
2. Add transaction count and total
3. Add loading indicator during generation

### Phase 3: Polish

1. Add export audit logging
2. Refine Excel formatting (headers, column widths)
3. Add "Email to Finance" option (if requested later)

---

## Dependencies

### Required

- Power Automate license (included with most Microsoft 365 plans)
- SharePoint site for file storage (or OneDrive)
- **Multi-Payment Tracking Enhancement (#5)** - Creates the `Payments` list that this export queries
  - Without it: Export queries `PrintRequests` directly (original behavior, loses multi-payment data)
  - With it: Export queries `Payments` list (one row per actual transaction)

### Recommended

- **Payer Tracking Enhancement (#2)** - For accurate "Payer" column
  - Without it: Falls back to `Student.DisplayName` via lookup
  - With it: Uses `PayerName` from Payments record (correct even for third-party payments)

---

## Testing Scenarios

### Scenario 1: Normal Month Export

1. Select "March" and "2026"
2. Preview shows 16 transactions, $187.50 total
3. Click "Download Excel"
4. Verify file downloads with correct data

### Scenario 2: Empty Month

1. Select a month with no transactions
2. Preview shows "0 transactions, $0.00"
3. Download button is disabled
4. Notification explains no data found

### Scenario 3: Large Dataset

1. Select a busy month (50+ transactions)
2. Loading indicator shows during generation
3. File generates successfully within reasonable time
4. All transactions included, correctly formatted

---

## Sample Output

Expected Excel output matching current TigerCASH log format. Note how REQ-00042 appears twice — this is a partial pickup scenario where the student paid for two separate portions on different days:

| Machine | $/Unit | Unit Amount | Cost | Payer | Notes | Course Number | Date | Transaction Number | Processed By | Request ID |
|---------|--------|-------------|------|-------|-------|---------------|------|--------------------|--------------|------------|
| Prusa | 0.10 | 85 | $8.50 | Jane Smith | Partial - plates 1-3 | ID1712 | 3/15/2026 | TXN-44821 | Colin | REQ-00042 |
| Prusa | 0.10 | 62 | $6.20 | Jane Smith | Remaining plates | ID1712 | 3/16/2026 | TXN-44890 | Colin | REQ-00042 |
| Prusa | 0.10 | 49 | $4.90 | Lily Bacas | | ID1712 | 3/16/2026 | TXN-44891 | Colin | REQ-00043 |
| Resin | 0.25 | 173 | $43.25 | Caitlin Mclin | | ID1712 | 3/17/2026 | TXN-44900 | Madison | REQ-00044 |

> 💡 **Key Difference:** With Multi-Payment Tracking, each row represents one actual transaction from the `Payments` list. Finance gets exactly what they need: one row per swipe/check/code entry, even when multiple payments apply to the same job.

---

## Related Documents

- **Payer Tracking Enhancement:** `Future Improvements/Payer-Tracking-Enhancement.md`
- **Payment Modal Spec:** `StaffDashboard-App-Spec.md` Step 12C
- **Current TigerCASH Log:** Manual Excel spreadsheet (reference for format)

---

*Last Updated: March 17, 2026*
