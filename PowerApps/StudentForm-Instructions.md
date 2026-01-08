# Student Form — Customized SharePoint Form

**⏱️ Time Required:** 2-3 hours  
**🎯 Goal:** Students can submit 3D print requests with proper validation and a professional, user-friendly interface

> 📚 **This is the comprehensive guide** — includes step-by-step build instructions, property tables, formulas, and troubleshooting.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards) ← **Font, Color & Layout Reference**
3. [Understanding Form Structure](#understanding-form-structure-read-this) ← **READ THIS FIRST!**
4. [Opening the Form Editor](#step-1-opening-the-form-editor)
5. [Cleaning Up the Form](#step-2-cleaning-up-the-form)
6. [Building the Form Header](#step-3-building-the-form-header)
7. [Student Information Section](#step-4-student-information-section)
8. [Project Details Section](#step-5-project-details-section)
9. [Print Configuration Section](#step-6-print-configuration-section)
10. [Attachments Section](#step-7-attachments-section)
11. [Hidden Fields Section](#step-8-hidden-fields-section)
12. [Form Styling & Polish](#step-9-form-styling--polish)
13. [Publishing the Form](#step-10-publishing-the-form)
14. [Setting the Form as Default](#step-11-setting-the-form-as-default)
15. [Testing the Form](#step-12-testing-the-form)
16. [Troubleshooting](#troubleshooting)
17. [Quick Reference Card](#quick-reference-card)
18. [Code Reference (Copy-Paste Snippets)](#code-reference-copy-paste-snippets)

---

# Prerequisites

Before you start, make sure you have:

- [ ] **SharePoint site created**: Your FabLab team site exists
- [ ] **PrintRequests list created**: All 32 columns defined per `SharePoint/PrintRequests-List-Setup.md`
- [ ] **Staff list populated**: At least one staff member with `Active = Yes`
- [ ] **Power Apps license**: Standard license included with Microsoft 365 (automatic)
- [ ] **Power Automate flows ready**: Flow A (PR-Create) should be built first for ReqKey generation

> ⚠️ **IMPORTANT:** Complete Phase 1 (SharePoint Lists) before customizing the form. The form depends on the PrintRequests list columns being set up correctly.

---

## ⚠️ CRITICAL: Curly Quotes Warning

**When copying formulas from this guide, you may get errors like:**
- "Unexpected characters"
- "Characters are used in the formula in an unexpected way"

**The Problem:** Document formatting often converts straight quotes `"text"` to curly/smart quotes `"text"`. Power Apps only accepts straight quotes.

**The Fix:**
1. **Best option:** Type formulas directly in Power Apps instead of copy-pasting
2. **If you paste:** Delete the quotes and retype them using your keyboard (`Shift + '`)

| Wrong (curly) | Correct (straight) |
|---------------|---------------------|
| `"Uploaded"` | `"Uploaded"` |
| `'text'` | `'text'` |

> 💡 **Tip:** If a formula shows red errors after pasting, the quotes are usually the culprit!

---

# Design Standards

This form follows consistent design patterns for a professional appearance that matches the Staff Dashboard.

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Form Header | `Font.'Segoe UI'` | 20 | Semibold |
| Section Headers | `Font.'Segoe UI'` | 14 | Semibold |
| Field Labels | `Font.'Segoe UI'` | 11 | Normal |
| Input Text | `Font.'Segoe UI'` | 11 | Normal |
| Help Text/Hints | `Font.'Segoe UI'` | 9 | Normal |
| Warning Labels | `Font.'Segoe UI'` | 10 | Semibold |

> ⚠️ **Consistency Rule:** Always use `Font.'Segoe UI'` throughout the form. This is the Microsoft design language and matches SharePoint's native styling.

## Color Palette

| Purpose | Color | RGBA |
|---------|-------|------|
| Primary (LSU Purple) | Purple | `RGBA(70, 29, 124, 1)` |
| Secondary (LSU Gold) | Gold | `RGBA(253, 208, 35, 1)` |
| Success | Green | `RGBA(16, 124, 16, 1)` |
| Warning Background | Light Yellow | `RGBA(255, 244, 206, 1)` |
| Warning Border | Amber | `RGBA(255, 185, 0, 1)` |
| Error | Red | `RGBA(209, 52, 56, 1)` |
| Section Background | Light Gray | `RGBA(250, 250, 250, 1)` |
| Card Border | Border Gray | `RGBA(200, 200, 200, 1)` |
| Muted Text | Gray | `RGBA(100, 100, 100, 1)` |
| Form Background | Off-White | `RGBA(248, 248, 248, 1)` |

## Section Styling

| Element | Property | Value |
|---------|----------|-------|
| Section Container | Fill | `RGBA(255, 255, 255, 1)` |
| Section Container | BorderColor | `RGBA(220, 220, 220, 1)` |
| Section Container | BorderThickness | `1` |
| Section Container | RadiusTopLeft/Right/BottomLeft/Right | `8` |
| Section Header | Fill | `RGBA(70, 29, 124, 1)` (LSU Purple) |
| Section Header | Color | `Color.White` |
| Section Header | Height | `40` |

## Corner Radius Standards

| Element Type | Radius | Examples |
|--------------|--------|----------|
| Section Containers | `8` | `conStudentInfo`, `conProjectDetails` |
| Input Fields | `4` | Text inputs, dropdowns |
| Buttons | `4` | Submit button |
| Warning Labels | `4` | File naming warning |

---

# Understanding Form Structure (READ THIS!)

Before you start building, understand how SharePoint customized forms work:

## How SharePoint Forms Differ from Canvas Apps

| Aspect | Canvas App (Dashboard) | SharePoint Form |
|--------|------------------------|-----------------|
| **Creation** | Built from scratch | Customizes existing form |
| **Data Binding** | Manual connection | Automatic from list columns |
| **Structure** | Free-form controls | DataCards containing controls |
| **Submit** | Custom Patch() formulas | Built-in SubmitForm() |
| **Default Values** | Set in control properties | Set in DataCard properties |

## Form Hierarchy

```
▼ SharePointForm1                    ← The main form control
    ▼ Student_DataCard1              ← Container for Student field
        DataCardKey1                 ← Label showing field name
        DataCardValue1               ← ComboBox control (actual input)
        ErrorMessage1                ← Validation error display
        StarVisible1                 ← Required field indicator
    ▼ StudentEmail_DataCard1         ← Container for StudentEmail field
        DataCardKey2                 ← Label
        DataCardValue2               ← Text input control
        ErrorMessage2
        StarVisible2
    ▼ Status_DataCard1               ← Container for Status field
        DataCardKey3
        DataCardValue3               ← ComboBox control
        ...
    // ... more DataCards for each field
```

## Naming Convention

We use **prefixes** to identify control types at a glance:

| Prefix | Control Type | Example |
|--------|-------------|---------|
| `con` | Container (Section grouping) | `conStudentInfo` |
| `rec` | Rectangle (Backgrounds) | `recSectionHeader` |
| `lbl` | Label | `lblFormTitle`, `lblFileWarning` |
| `DataCard` | Field container (SharePoint) | `Student_DataCard1` |
| `DataCardValue` | Input control | `DataCardValue3` |
| `btn` | Button | `btnSubmit` |

## Important Form Concepts

| Concept | Explanation |
|---------|-------------|
| **DataCard** | Container for a field — includes label, input, error message |
| **DataCardValue** | The actual input control inside the DataCard |
| **Parent.Default** | Returns the saved value when editing an existing item |
| **SharePointForm1.Mode** | `FormMode.New` = creating, `FormMode.Edit` = editing |
| **DefaultSelectedItems** | Sets default for Choice/ComboBox fields (use array format) |
| **Default** | Sets default for Text/Number fields (use string/number format) |

## Critical Control Selection Rule

> ⚠️ **CRITICAL:** When setting properties in Power Apps, you must select the **control inside the card** (like `DataCardValue3`), NOT the card itself (like `Student_DataCard1`). The card is just a container—the control inside is what actually displays and stores data.

## Z-Order (Layering) Rule

> 💡 **Z-ORDER:** In Power Apps, controls **higher in the Tree View appear IN FRONT** of controls lower in the list. This means:
> - **Labels and content** should be listed **FIRST** (they render on top/in front)
> - **Background rectangles** should be listed **AFTER** (they render behind/at the back)
>
> If a rectangle appears before a label in the Tree View, the rectangle will cover the label and hide it!

---

# Complete Form Tree View

Here's the **complete Tree view** exactly as it should appear after all steps are complete:

> ⚠️ **Note:** Your DataCard numbers may differ. The important thing is the structure and visibility settings.

```
▼ App
▼ scrFormScreen                      ← Main screen
    ▼ SharePointForm1                ← Main form control
        
        // === HEADER (Step 3) ===
        lblFormTitle                 ← IN FRONT
        recFormHeader                ← BEHIND
        
        // === STUDENT INFO (Step 4) ===
        lblStudentSectionHeader      ← IN FRONT
        recStudentSection            ← BEHIND
        Student_DataCard1            ← Auto-filled
        StudentEmail_DataCard1       ← Auto-filled
        TigerCardNumber_DataCard1    ← Required
        
        // === PROJECT DETAILS (Step 5) ===
        lblProjectSectionHeader      ← IN FRONT
        recProjectSection            ← BEHIND
        Title_DataCard1
        CourseNumber_DataCard1
        Discipline_DataCard1
        ProjectType_DataCard1
        DueDate_DataCard1
        Notes_DataCard1
        
        // === PRINT CONFIG (Step 6) ===
        lblPrintSectionHeader        ← IN FRONT
        recPrintSection              ← BEHIND
        Method_DataCard1             ← Controls Printer filter
        Printer_DataCard1            ← Cascading dropdown
        Color_DataCard1
        
        // === ATTACHMENTS (Step 7) ===
        lblFileSectionHeader         ← IN FRONT
        lblFileWarning               ← File naming instructions
        recFileSection               ← BEHIND
        Attachments_DataCard1
        
        // === HIDDEN (Step 8) ===
        Status_DataCard1             ← Visible: false
        ReqKey_DataCard1             ← Visible: false (or removed)
        
        // === CONDITIONAL (Step 8) ===
        StudentConfirmed_DataCard1   ← Visible in Edit mode only
```

### Fields NOT in Form (Staff-Only)

These fields exist in SharePoint but should be **REMOVED** from the student form:

| Field | Reason |
|-------|--------|
| Priority | Staff manages queue priority |
| EstimatedTime | Staff estimates print time |
| EstimatedWeight | Staff estimates material |
| EstimatedCost | Staff calculates cost |
| StaffNotes | Internal staff communication |
| LastAction | Auto-populated by flows |
| LastActionBy | Auto-populated by flows |
| LastActionAt | Auto-populated timestamp |
| NeedsAttention | Staff attention flag |
| RejectionReason | Staff rejection reasons |
| TransactionNumber | Payment field - staff only |
| FinalWeight | Payment field - staff only |
| FinalCost | Payment field - staff only |
| PaymentDate | Payment field - staff only |
| PaymentNotes | Payment field - staff only |

---

# STEP 1: Opening the Form Editor

**What you're doing:** Opening the Power Apps form editor so you can customize your SharePoint form.

**Time:** 5 minutes

### Instructions

1. **Navigate to your SharePoint site**
   - Open your browser
   - Go to: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`

2. **Open the PrintRequests list**
   - In the left navigation, click **PrintRequests**
   - OR: Click the gear icon (⚙️) → **Site contents** → **PrintRequests**

3. **Open the form customization editor**
   - In the command bar at the top, click **Integrate**
   - Click **Power Apps**
   - Click **Customize forms**

4. **Wait for Power Apps Studio to load**
   - A new browser tab opens
   - You'll see the Power Apps form editor with your SharePoint list form

### What You Should See

| Element | Description |
|---------|-------------|
| **Left Panel** | Tree view showing `SharePointForm1` with all DataCards |
| **Center** | Visual preview of the form |
| **Right Panel** | Properties pane for selected control |
| **Top Bar** | Formula bar + toolbar with Save/Publish |
| **Property Dropdown** | Shows current property being edited |

> 💡 **Tip:** Leave this tab open while you work through all the steps below. Save frequently!

### Verification

- [ ] Power Apps Studio is open in a new tab
- [ ] You can see SharePointForm1 in the Tree view
- [ ] You can see DataCards for your list columns
- [ ] The form preview shows your fields

---

# STEP 2: Cleaning Up the Form

**What you're doing:** Removing staff-only fields from the form and organizing what remains.

**Time:** 15 minutes

## 2A. Remove Staff-Only Fields

Staff-only fields should NOT appear on the student form. We'll remove them completely.

### Instructions

1. **Open the field editor**
   - In the Tree view, click on **SharePointForm1**
   - In the right Properties pane, click **Edit fields**
   - A panel opens showing all fields currently in the form

2. **Remove each staff-only field**

For each field in this list, do the following:
   - Find the field name in the list
   - Hover over it → click the three dots (**...**)
   - Click **Remove**

### Fields to REMOVE

| Field Name | Why Remove |
|------------|------------|
| Priority | Staff manages queue priority |
| EstimatedTime | Staff estimates print time |
| EstimatedWeight | Staff estimates material |
| EstimatedCost | Staff calculates cost |
| StaffNotes | Internal staff communication |
| LastAction | Auto-populated by flows |
| LastActionBy | Auto-populated by flows |
| LastActionAt | Auto-populated timestamp |
| NeedsAttention | Staff attention flag |
| RejectionReason | Staff rejection reasons |
| TransactionNumber | Payment field |
| FinalWeight | Payment field |
| FinalCost | Payment field |
| PaymentDate | Payment field |
| PaymentNotes | Payment field |

> ⚠️ **DO NOT REMOVE these fields:**
> - **Status** — Required by SharePoint (we'll hide it in Step 8)
> - **TigerCardNumber** — Students need to enter this
> - **StudentConfirmed** — Shown conditionally when editing

## 2B. Add Missing Fields

If any student-facing fields are missing, add them now.

### Instructions

1. Still in the Edit fields panel, click **+ Add field**
2. Check each field that should be visible to students:

| Field | Must Have |
|-------|-----------|
| Title | ✅ Yes |
| Student | ✅ Yes |
| StudentEmail | ✅ Yes |
| TigerCardNumber | ✅ Yes |
| Course Number | ✅ Yes |
| Discipline | ✅ Yes |
| ProjectType | ✅ Yes |
| Method | ✅ Yes |
| Printer | ✅ Yes |
| Color | ✅ Yes |
| DueDate | ✅ Yes |
| Notes | ✅ Yes |
| Attachments | ✅ Yes |
| Status | ✅ Yes (will hide) |
| StudentConfirmed | ✅ Yes (conditional) |

3. Click **Add** to add any missing fields

## 2C. Reorder Fields

Drag fields in the Edit fields panel to arrange them in logical order:

### Recommended Order

```
1. Title
2. Student
3. StudentEmail
4. TigerCardNumber
5. Course Number
6. Discipline
7. ProjectType
8. Method
9. Printer
10. Color
11. DueDate
12. Notes
13. Attachments
14. Status (will hide)
15. StudentConfirmed (conditional)
```

> 💡 **Tip:** Click and drag a field to move it up or down in the list.

### Verification

After completing this step:
- [ ] All staff-only fields are removed
- [ ] All student-facing fields are present
- [ ] Fields are in a logical order
- [ ] Status field is still in the form (will be hidden)

---

# STEP 3: Building the Form Header

**What you're doing:** Adding a professional header to the form with the lab name and instructions.

**Time:** 15 minutes

## 3A. Add Header Background Rectangle

### Instructions

1. **Select the screen (not the form)**
   - In the Tree view, click on the screen name (e.g., `FormScreen1` or `Screen1`)

2. **Insert a rectangle**
   - Click **+ Insert** in the toolbar
   - Search for and click **Rectangle**

3. **Rename the rectangle**
   - In the Tree view, double-click `Rectangle1`
   - Type `recFormHeader` and press Enter

4. **Set rectangle properties**

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `80` |
| Fill | `RGBA(70, 29, 124, 1)` |

> This creates an LSU Purple header bar at the top of the form.

## 3B. Add Form Title Label

### Instructions

1. **With the screen selected** (not the form), click **+ Insert** → **Text label**

2. **Rename it:** `lblFormTitle`

3. **Set label properties**

| Property | Value |
|----------|-------|
| Text | `"3D Print Request Form"` |
| X | `20` |
| Y | `20` |
| Width | `400` |
| Height | `40` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `22` |
| Color | `Color.White` |

## 3C. Add Subtitle Label (Optional)

### Instructions

1. Insert another **Text label**

2. **Rename it:** `lblFormSubtitle`

3. **Set properties**

| Property | Value |
|----------|-------|
| Text | `"LSU Fabrication Lab"` |
| X | `20` |
| Y | `50` |
| Width | `400` |
| Height | `25` |
| Font | `Font.'Segoe UI'` |
| Size | `12` |
| Color | `RGBA(255, 255, 255, 0.8)` |

### Verification

- [ ] Purple header bar appears at the top
- [ ] "3D Print Request Form" is visible in white
- [ ] Subtitle appears below the title
- [ ] Header looks professional

---

# STEP 4: Student Information Section

**What you're doing:** Configuring the Student, StudentEmail, and TigerCardNumber fields to auto-fill and display correctly.

**Time:** 30 minutes

## 4A. Auto-Fill the Student Field

**Goal:** When a student opens the form, their name appears automatically.

### Finding the Control

1. In the **Tree View** panel, find `Student_DataCard1`
2. Click the small arrow (▶) to **expand** the card
3. Inside, click on the control named `DataCardValue` + a number (e.g., `DataCardValue3`)
   - This is the **ComboBox** control
   - You can identify it by clicking and seeing "ComboBox" in the properties

### Set DefaultSelectedItems

4. With the ComboBox selected, click the **Advanced** tab in the right panel
5. Scroll down to find **DefaultSelectedItems**
6. Click in the formula box next to it
7. Delete the existing formula
8. Paste this formula:

**⬇️ FORMULA: Paste into DefaultSelectedItems**

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
    Table(Parent.Default)
)
```

9. Press **Enter** to confirm

### Set DisplayFields

10. Still on the same ComboBox, find **DisplayFields**
11. Change it to:

**⬇️ VALUE: Paste into DisplayFields**

```powerfx
["DisplayName"]
```

12. Press **Enter**

### Understanding the Formula

| Part | What It Does |
|------|--------------|
| `SharePointForm1.Mode = FormMode.New` | Checks if creating a new item |
| `User().FullName` | Gets current user's display name |
| `"i:0#.f|membership|"` | SharePoint person field claim format |
| `Lower(User().Email)` | User's email in lowercase |
| `Table(Parent.Default)` | When editing, show the saved value |

> ⚠️ **Why DisplayFields matters:** Without this, the field shows a weird code like `i:0#.f|membership|email@lsu.edu` instead of the person's name.

## 4B. Auto-Fill the StudentEmail Field

**Goal:** Automatically fill in the student's email address.

### Instructions

1. In the Tree View, expand `StudentEmail_DataCard1`
2. Click on the **input control** inside (e.g., `DataCardValue4`)
3. Click the **Advanced** tab
4. Find the **Default** property
5. Delete the existing formula and paste:

**⬇️ FORMULA: Paste into Default**

```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    Lower(User().Email),
    Parent.Default
)
```

6. Press **Enter**

### Understanding the Formula

| Part | What It Does |
|------|--------------|
| `FormMode.New` | Only auto-fill for new submissions |
| `Lower(User().Email)` | Current user's email (lowercase) |
| `Parent.Default` | When editing, show the saved email |

> 💡 **Why lowercase?** Email comparisons are case-sensitive in some systems. Using lowercase ensures consistency.

## 4C. Configure TigerCardNumber Field

**Goal:** Students enter their 16-digit POS number from their Tiger Card.

### Instructions

1. Find `TigerCardNumber_DataCard1` in Tree view
2. Click on the TextInput control inside
3. Verify these properties in **Advanced** tab:

| Property | Value |
|----------|-------|
| Mode | `TextMode.SingleLine` |
| Format | `TextFormat.Text` |

### Add Placeholder Text

4. Find **HintText** property
5. Set it to:

```powerfx
"16-digit POS number from Tiger Card"
```

### Update Field Label

To help students understand what to enter:

1. Find `DataCardKey` inside the TigerCardNumber_DataCard1
2. Set its **Text** property to:

```powerfx
"Tiger Card Number (16-digit POS)"
```

> ⚠️ **IMPORTANT:** This is the **16-digit POS number** from their Tiger Card, NOT their LSUID (the 89-number they memorize).
> 
> **On the card, it looks like:**
> ```
> LSUID: 899903556          ← NOT this one
> 6272100454327897-5        ← Use first part only
> ```
> **Enter:** `6272100454327897` (16 digits, NO dash or number after it)

### Verification

After completing this step:
- [ ] Student field auto-fills with current user's name (not weird claims code)
- [ ] StudentEmail field auto-fills with current user's email
- [ ] TigerCardNumber shows helpful placeholder text
- [ ] All three fields display correct values in Preview mode (F5)

---

# STEP 5: Project Details Section

**What you're doing:** Configuring the Title, Course Number, Discipline, ProjectType, DueDate, and Notes fields.

**Time:** 20 minutes

## 5A. Configure Title Field

The Title field is straightforward — students type their project name.

### Instructions

1. Find `Title_DataCard1` in Tree view
2. Click on the TextInput control inside
3. Verify in **Advanced** tab:

| Property | Value |
|----------|-------|
| Mode | `TextMode.SingleLine` |
| MaxLength | `255` |

### Add Placeholder Text

Set **HintText** to:

```powerfx
"e.g., Phone Stand, Chess Piece, Bracket"
```

## 5B. Configure Course Number Field

### Instructions

1. Find `CourseNumber_DataCard1` (or `Course_x0020_Number_DataCard1`)
2. Click on the TextInput control inside
3. Set **HintText** to:

```powerfx
"e.g., ART 2000, ME 4201"
```

> 💡 **Note:** This field is optional — personal projects don't have a course number.

## 5C. Configure Discipline Field

This is a Choice field (dropdown).

### Instructions

1. Find `Discipline_DataCard1`
2. The control inside should be a ComboBox
3. Verify it's connected to the SharePoint choices (Items should reference `[@PrintRequests].Discipline`)

> 💡 **Default behavior is fine** — students select from the list of disciplines defined in SharePoint.

## 5D. Configure ProjectType Field

This is a Choice field (dropdown).

### Instructions

1. Find `ProjectType_DataCard1`
2. Verify the ComboBox shows choices like:
   - Class Project
   - Personal Project
   - Research
   - Other

## 5E. Configure DueDate Field

### Instructions

1. Find `DueDate_DataCard1`
2. Click on the DatePicker control inside
3. In **Advanced** tab, verify:

| Property | Value |
|----------|-------|
| DefaultDate | `Today()` |
| DateTimeZone | `DateTimeZone.Local` |

### Set Minimum Date (Optional)

To prevent students from selecting past dates:

Set **MinDate** to:

```powerfx
Today()
```

## 5F. Configure Notes Field

This should be a multi-line text field for additional instructions.

### Instructions

1. Find `Notes_DataCard1`
2. Click on the TextInput control inside
3. Set **Mode** to:

```powerfx
TextMode.MultiLine
```

4. Set **Height** to: `100`

5. Set **HintText** to:

```powerfx
"Any special instructions, scaling notes, or questions for staff"
```

### Verification

After completing this step:
- [ ] Title field accepts text input
- [ ] Course Number has helpful placeholder
- [ ] Discipline dropdown shows available options
- [ ] ProjectType dropdown shows available options
- [ ] DueDate defaults to today and prevents past dates
- [ ] Notes field is multi-line with adequate height

---

# STEP 6: Print Configuration Section

**What you're doing:** Setting up Method, Printer, and Color fields with cascading dropdowns so students can only select compatible printers for their chosen print method.

**Time:** 30 minutes

## 6A. Configure Method Field

The Method field determines which printers are available.

### Instructions

1. Find `Method_DataCard1` in Tree view
2. Click on the ComboBox control inside (note its exact name, e.g., `DataCardValue6`)
3. Verify it shows choices: **Filament**, **Resin**

> 💡 **Write down the DataCardValue name** — you'll need it for the Printer filter formula.

## 6B. Configure Printer Field (Cascading Dropdown)

**Goal:** Only show printers compatible with the selected Method.

### Printer/Method Compatibility

| Method | Compatible Printers |
|--------|---------------------|
| **Filament** | Prusa MK4S, Prusa XL, Raised3D Pro 2 Plus |
| **Resin** | Form 3 |

### Instructions

1. In the Tree View, expand `Printer_DataCard1`
2. Click on the **ComboBox** control inside (e.g., `DataCardValue7`)
3. Click in the **formula bar** at the top
4. Make sure you're editing the **Items** property
5. Delete the existing formula
6. Paste this formula:

**⬇️ FORMULA: Paste into Items property**

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        DataCardValue6.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        DataCardValue6.Selected.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        true
    )
)
```

7. Press **Enter** to confirm

> ⚠️ **IMPORTANT:** Replace `DataCardValue6` with your actual Method control name! To find the correct name:
> 1. Click on **Method_DataCard1** in the Tree View
> 2. Expand it and note the control name inside
> 3. Replace `DataCardValue6` in the formula above

### Understanding the Formula

| Part | What It Does |
|------|--------------|
| `Choices([@PrintRequests].Printer)` | Gets all printer options from SharePoint |
| `DataCardValue6.Selected.Value = "Filament"` | Checks if Filament is selected |
| `Value in [...]` | Filters to only FDM printers |
| `Value = "Form 3..."` | Filters to only resin printer |
| `true` | Shows all printers if no method selected |

## 6C. Configure Color Field

### Instructions

1. Find `Color_DataCard1`
2. Verify the ComboBox shows the color choices defined in SharePoint

> 💡 **Note:** Color options come from the SharePoint column definition. No special configuration needed.

## 6D. Test the Cascading Filter

### Instructions

1. Press **F5** to enter Preview mode
2. Test these scenarios:

| Test | Expected Result |
|------|-----------------|
| Select **Method = Filament** | Printer shows: Prusa MK4S, Prusa XL, Raised3D |
| Select **Method = Resin** | Printer shows: Form 3 only |
| No Method selected | Printer shows: All printers |
| Change Method after Printer selected | Printer selection should clear |

3. Press **Escape** to exit Preview mode

### Verification

After completing this step:
- [ ] Method dropdown works correctly
- [ ] Printer dropdown filters based on Method
- [ ] Selecting Filament shows 3 FDM printers
- [ ] Selecting Resin shows only Form 3
- [ ] Color dropdown shows available options
- [ ] All three fields are marked as required

---

# STEP 7: Attachments Section

**What you're doing:** Adding the file upload control with clear naming instructions so students know how to name their files.

**Time:** 20 minutes

## 7A. Add File Naming Warning Label

Students need clear instructions about file naming requirements.

### Instructions

1. **Select SharePointForm1** in the Tree view
2. Click **+ Insert** → **Text label**
3. **Rename it:** `lblFileWarning`
4. **Position it** above the Attachments field by setting:

| Property | Value |
|----------|-------|
| X | `20` |
| Y | Position above Attachments_DataCard1 (adjust as needed) |
| Width | `Parent.Width - 40` |
| Height | `120` |

5. Set the **Text** property:

**⬇️ TEXT: Paste into the Text property**

```powerfx
"IMPORTANT: File Naming Requirement

Your files MUST be named: FirstLast_Method_Color

Examples:
  - JaneDoe_Filament_Blue.stl
  - MikeSmith_Resin_Clear.3mf

Files not following this format will be rejected."
```

> ⚠️ **CRITICAL:** The text must be wrapped in **double quotes**! If you paste text without quotes, Power Apps thinks it's a formula and shows errors.

> ⚠️ **No Emojis:** Avoid using emojis in label text—they can cause "Unexpected character" errors.

## 7B. Style the Warning Label

### Instructions

With `lblFileWarning` selected, set these properties in the **Advanced** tab:

| Property | Value |
|----------|-------|
| Fill | `RGBA(255, 244, 206, 1)` |
| Color | `RGBA(102, 77, 3, 1)` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| PaddingTop | `10` |
| PaddingBottom | `10` |
| PaddingLeft | `15` |
| PaddingRight | `15` |
| BorderColor | `RGBA(255, 185, 0, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

> This creates a yellow warning box that stands out visually.

## 7C. Configure Attachments Field

### Instructions

1. Find `Attachments_DataCard1`
2. The control inside is an **AttachmentControl**
3. No special configuration needed — it uses SharePoint's built-in attachment handling

### File Type Restrictions

> ⚠️ **SharePoint Limitation:** Attachment controls do NOT support client-side file type validation. The Power Automate flow (Flow A) handles file validation after submission.

**Accepted file types** (validated by Flow A):
- `.stl` — Standard mesh format
- `.obj` — Object file format
- `.3mf` — 3D Manufacturing Format
- `.idea` — PrusaSlicer project file
- `.form` — Formlabs project file

## 7D. Add File Type Hint (Optional)

You can add a helper label below the warning:

1. Insert another **Text label**
2. **Rename it:** `lblFileTypes`
3. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Accepted formats: .stl, .obj, .3mf, .idea, .form"` |
| Font | `Font.'Segoe UI'` |
| Size | `9` |
| Color | `RGBA(100, 100, 100, 1)` |
| FontWeight | `FontWeight.Normal` |

### Verification

After completing this step:
- [ ] Yellow warning box displays file naming instructions
- [ ] Warning is clearly visible and readable
- [ ] Attachments control appears below the warning
- [ ] File type hint is visible (if added)

---

# STEP 8: Hidden Fields Section

**What you're doing:** Configuring fields that must exist in the form but should be invisible to students.

**Time:** 15 minutes

## 8A. Configure Status Field (CRITICAL)

**Goal:** Auto-set Status to "Uploaded" for new submissions, but hide the field from students.

> ⚠️ **IMPORTANT:** The Status field is **required** by SharePoint. Do NOT remove it—you must keep it but hide it.

### Instructions

1. In the Tree View, expand `Status_DataCard1`
2. Click on the **ComboBox** control inside (e.g., `DataCardValue5`)
3. Click the **Advanced** tab
4. Find **DefaultSelectedItems**
5. Delete the existing formula and paste:

**⬇️ FORMULA: Paste into DefaultSelectedItems**

```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    [{Value: "Uploaded"}],
    Table(Parent.Default)
)
```

6. Press **Enter**

### Hide the Status Field

7. Click on `Status_DataCard1` itself (the card, not the control inside)
8. In the **Advanced** tab, find **Visible**
9. Set it to:

```powerfx
false
```

### Understanding the Formula

| Part | What It Does |
|------|--------------|
| `FormMode.New` | Only auto-set for new submissions |
| `[{Value: "Uploaded"}]` | Sets status to "Uploaded" |
| `Table(Parent.Default)` | When editing, keep the current status |

> ⚠️ **Note:** Status is a Choice field, so we use `[{Value: "..."}]` format, not just a plain string.

## 8B. Configure ReqKey Field

**Goal:** Hide or remove the ReqKey field since it's auto-generated by Flow A.

### Option A: Hide It (Recommended)

1. Click on `ReqKey_DataCard1`
2. In **Advanced** tab, set **Visible** to:

```powerfx
false
```

### Option B: Remove It

If ReqKey doesn't need to appear even for edits:

1. Click **SharePointForm1**
2. Click **Edit fields** in Properties
3. Find **ReqKey** → click **...** → **Remove**

## 8C. Configure StudentConfirmed Field

**Goal:** Show this field only when students edit their requests to confirm cost estimates.

### Instructions

1. Click on `StudentConfirmed_DataCard1`
2. In **Advanced** tab, set **Visible** to:

**⬇️ FORMULA: Paste into Visible**

```powerfx
SharePointForm1.Mode <> FormMode.New
```

This hides the field for new submissions but shows it when editing.

### Understanding the Logic

| Scenario | Visible Value | Result |
|----------|--------------|--------|
| New submission | `false` | Hidden (students don't confirm yet) |
| Editing request | `true` | Visible (students can confirm estimate) |

### Verification

After completing this step:
- [ ] Status field is hidden but defaults to "Uploaded"
- [ ] ReqKey field is hidden or removed
- [ ] StudentConfirmed field is hidden for new items
- [ ] StudentConfirmed field appears when editing existing items

---

# STEP 9: Form Styling & Polish

**What you're doing:** Final visual polish to make the form look professional and match the FabLab branding.

**Time:** 15 minutes

## 9A. Set Form Height (Dynamic)

The form height should dynamically adjust based on your content. Since `ContentHeight` is not available in SharePoint form customization, use a formula based on your last visible DataCard.

### Instructions

1. Click on **SharePointForm1**
2. In the **Advanced** tab, find the **Height** property
3. Set it to:

```powerfx
Attachments_DataCard1.Y + Attachments_DataCard1.Height + 100
```

### Understanding the Formula

| Part | What It Does |
|------|--------------|
| `Attachments_DataCard1.Y` | Distance from top to where the attachments card starts |
| `Attachments_DataCard1.Height` | How tall the attachments card is |
| `+ 100` | Extra padding at the bottom |

> ⚠️ **Note:** `Attachments_DataCard1` should be your last visible DataCard. If you reorder fields, update this formula to reference whichever DataCard appears last.

> 💡 **Tip:** SharePoint handles the scrolling panel around your form automatically. This formula ensures all content fits within the form container.

## 9B. Adjust Form Padding

### Instructions

1. Click on **SharePointForm1**
2. In **Advanced** tab, find:

| Property | Value |
|----------|-------|
| PaddingTop | `100` (to account for header) |
| PaddingLeft | `20` |
| PaddingRight | `20` |
| PaddingBottom | `20` |

## 9C. Adjust DataCard Spacing

For better visual separation between fields:

1. Select each DataCard
2. Set **Padding** properties:

| Property | Value |
|----------|-------|
| PaddingTop | `8` |
| PaddingBottom | `8` |
| PaddingLeft | `0` |
| PaddingRight | `0` |

## 9D. Style Required Field Indicators

Required fields show a red asterisk. You can customize this:

1. Find `StarVisible1` (or similar) inside required DataCards
2. Set properties:

| Property | Value |
|----------|-------|
| Color | `RGBA(209, 52, 56, 1)` |
| Size | `10` |

## 9E. Style Error Messages

For validation error display:

1. Find `ErrorMessage1` (or similar) inside DataCards
2. Set properties:

| Property | Value |
|----------|-------|
| Color | `RGBA(209, 52, 56, 1)` |
| Size | `9` |
| Font | `Font.'Segoe UI'` |

## 9F. Ensure Consistent Font Usage

Go through each label and input control to verify:

| Control Type | Font Property |
|--------------|---------------|
| All Labels | `Font.'Segoe UI'` |
| All TextInputs | `Font.'Segoe UI'` |
| All ComboBoxes | `Font.'Segoe UI'` |

### Verification

After completing this step:
- [ ] Form has consistent spacing
- [ ] Header doesn't overlap form content
- [ ] Required field indicators are visible
- [ ] Error messages use consistent styling
- [ ] All text uses Segoe UI font

---

# STEP 10: Publishing the Form

**What you're doing:** Saving your changes and making them live for all users.

**Time:** 5 minutes

### Instructions

1. **Save your work**
   - Click **File** in the top-left corner (or press `Ctrl + S`)
   - Click **Save**
   - Wait for "All changes saved" message

2. **Publish to SharePoint**
   - Click **Publish to SharePoint**
   - Wait for the publish to complete (may take 30-60 seconds)

3. **Close the editor**
   - Click **← Back to SharePoint**
   - OR close the browser tab

### What "Publish" Means

| Action | Effect |
|--------|--------|
| **Save** | Saves changes but doesn't make them live |
| **Publish** | Makes changes visible to all users |

> 💡 **Tip:** You can Save frequently while working, but only Publish when ready for users to see changes.

### Verification

- [ ] "All changes saved" message appeared
- [ ] "Published to SharePoint" confirmation appeared
- [ ] No error messages during save/publish

---

# STEP 11: Setting the Form as Default

**What you're doing:** Ensuring SharePoint uses your custom form instead of the default form.

**Time:** 5 minutes

### Instructions

1. **Navigate to the PrintRequests list**
   - Go to your SharePoint site
   - Click **PrintRequests** in the navigation

2. **Open List Settings**
   - Click the **Settings** gear icon (⚙️) in the top right
   - Click **List settings**

3. **Open Form Settings**
   - Under "General Settings", click **Form settings**

4. **Select Power Apps Form**
   - Select **Use a custom form created in PowerApps**
   - Click **OK**

### What Each Option Means

| Option | Effect |
|--------|--------|
| Use the default SharePoint form | Plain SharePoint form (no customization) |
| **Use a custom form created in PowerApps** | Your customized form |

> ⚠️ **WARNING:** If you accidentally select "Use the default SharePoint form," your custom form will be replaced. You can switch back, but you'll need to reopen Power Apps to edit again.

### Verification

- [ ] Form settings shows "Use a custom form created in PowerApps"
- [ ] Clicking "+ New" in the list opens your custom form

---

# STEP 12: Testing the Form

**What you're doing:** Verifying all functionality works correctly before going live.

**Time:** 15 minutes

## 12A. Basic Functionality Test

### Instructions

1. Go to the **PrintRequests** list in SharePoint
2. Click **+ New** (or **+ Add new item**)
3. Your custom Power Apps form should appear

### Verification Checklist — Auto-Fill

| Check | Expected Result |
|-------|-----------------|
| Your name in Student field | ✅ Shows your full name (not weird claims code) |
| Your email in StudentEmail field | ✅ Shows your email address |
| Status field | ✅ NOT visible |
| Staff-only fields | ✅ NOT visible |
| File naming warning | ✅ Yellow box with instructions visible |

## 12B. Cascading Dropdown Test

### Instructions

1. In the form, test the Method → Printer cascade:

| Action | Expected Printer Options |
|--------|--------------------------|
| Select **Filament** | Prusa MK4S, Prusa XL, Raised3D Pro 2 Plus |
| Select **Resin** | Form 3 only |
| No Method selected | All printers available |

## 12C. Full Submission Test

### Instructions

1. Fill in all required fields:

| Field | Test Value |
|-------|------------|
| Title | `Test Print - Delete Me` |
| TigerCardNumber | `1234567890123456` |
| Method | `Filament` |
| Printer | `Prusa MK4S (9.8×8.3×8.7in)` |
| Color | `Blue` |
| DueDate | Tomorrow's date |

2. Attach a test file (any .stl file)
3. Click **Submit** (or **Save**)

### Expected Results

| Check | Expected Result |
|-------|-----------------|
| No "Field is required" errors | ✅ Form submits successfully |
| Success message or form closes | ✅ Confirmation appears |
| Item appears in list | ✅ New row with your test data |
| Status column | ✅ Shows "Uploaded" |
| ReqKey column | ✅ Shows "REQ-00001" (or next number) — from Flow A |

## 12D. Edit Mode Test

### Instructions

1. Find your test item in the list
2. Click to open it (or click Edit)
3. Verify:

| Check | Expected Result |
|-------|-----------------|
| Student field | ✅ Shows saved name (not editable) |
| StudentEmail field | ✅ Shows saved email |
| StudentConfirmed field | ✅ NOW VISIBLE (wasn't visible on New) |
| All data preserved | ✅ Your test values are shown |

## 12E. Clean Up

1. Delete your test item:
   - Select the item in the list
   - Click **Delete** in the toolbar
   - Confirm deletion

---

# Troubleshooting

## Problem: "Field 'Status' is required" error

**Cause:** You removed the Status field instead of hiding it.

**Solution:**
1. Go back to Power Apps (Integrate → Power Apps → Customize forms)
2. Click SharePointForm1 → Properties → Edit fields
3. Click **+ Add field** → add **Status**
4. Set Status_DataCard1's **Visible** property to `false`
5. Set the ComboBox inside's **DefaultSelectedItems** to:
   ```powerfx
   If(SharePointForm1.Mode = FormMode.New, [{Value: "Uploaded"}], Table(Parent.Default))
   ```
6. Save and Publish

---

## Problem: Student field shows weird code like "i:0#.f|membership|..."

**Cause:** The DisplayFields property isn't set correctly.

**Solution:**
1. Click on the ComboBox inside Student_DataCard1
2. In Advanced tab, set **DisplayFields** to:
   ```powerfx
   ["DisplayName"]
   ```
3. Save and Publish

---

## Problem: "Type mismatch" error on DefaultSelectedItems

**Cause:** Both sides of the If statement must return the same type.

**Solution:**
- Use `Table(Parent.Default)` instead of just `Parent.Default`
- For Choice fields, use `[{Value: "..."}]` format

**Correct pattern:**
```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    [{Value: "Uploaded"}],    // Array of record
    Table(Parent.Default)      // Also returns table
)
```

---

## Problem: Can't type in a text field

**Cause:** The field's DisplayMode is set to View.

**Solution:**
1. Click on the input control inside the card
2. In Advanced tab, find **DisplayMode**
3. Set it to:
   ```powerfx
   DisplayMode.Edit
   ```

---

## Problem: Form shows as default SharePoint form, not custom form

**Cause:** The form settings aren't set to use Power Apps.

**Solution:**
1. Go to SharePoint → PrintRequests list
2. Click gear icon → **List settings**
3. Click **Form settings**
4. Select **Use a custom form created in PowerApps**
5. Click OK

---

## Problem: DataSource shows garbage text or errors

**Cause:** You accidentally typed in the DataSource property.

**Solution:**
1. Click on SharePointForm1
2. In the formula bar, verify DataSource is exactly:
   ```powerfx
   [@PrintRequests]
   ```
3. Delete any extra characters

---

## Problem: Label shows "Unexpected character" errors

**Cause:** Text wasn't wrapped in quotes, or contains special characters/emojis.

**Solution:**
1. Wrap ALL text in double quotes: `"Your text here"`
2. Remove any emojis from the text
3. Use only standard ASCII characters

**Before (broken):**
```powerfx
⚠️ Important: Name your files correctly!
```

**After (fixed):**
```powerfx
"IMPORTANT: Name your files correctly!"
```

---

## Problem: Printer dropdown not filtering by Method

**Cause:** The formula references the wrong control name.

**Solution:**
1. Find the Method_DataCard1 in Tree view
2. Expand it and note the exact control name (e.g., `DataCardValue6`)
3. Update the Printer Items formula to use that exact name

---

## Problem: Person field not saving correctly

**Cause:** Claims format is incorrect.

**Solution:**
Ensure DefaultSelectedItems includes all three properties:
```powerfx
{
    DisplayName: User().FullName,
    Claims: "i:0#.f|membership|" & Lower(User().Email),
    Email: Lower(User().Email)
}
```

---

# Quick Reference Card

## Property Quick Reference

| Task | Control | Property | Value |
|------|---------|----------|-------|
| Dynamic form height | SharePointForm1 | Height | `Attachments_DataCard1.Y + Attachments_DataCard1.Height + 100` |
| Auto-fill Student name | ComboBox in Student_DataCard | DefaultSelectedItems | See formula above |
| Show student name correctly | ComboBox in Student_DataCard | DisplayFields | `["DisplayName"]` |
| Auto-fill StudentEmail | Input in StudentEmail_DataCard | Default | `Lower(User().Email)` |
| Auto-set Status | ComboBox in Status_DataCard | DefaultSelectedItems | `[{Value: "Uploaded"}]` |
| Hide a field | The DataCard itself | Visible | `false` |
| Show only in Edit mode | The DataCard | Visible | `SharePointForm1.Mode <> FormMode.New` |
| Filter Printer by Method | ComboBox in Printer_DataCard | Items | See cascading formula |

## Formula Templates

### Person Field Auto-Fill
```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    [{DisplayName: User().FullName, Claims: "i:0#.f|membership|" & Lower(User().Email), Email: Lower(User().Email)}],
    Table(Parent.Default)
)
```

### Text Field Auto-Fill
```powerfx
If(SharePointForm1.Mode = FormMode.New, Lower(User().Email), Parent.Default)
```

### Choice Field Default
```powerfx
If(SharePointForm1.Mode = FormMode.New, [{Value: "Uploaded"}], Table(Parent.Default))
```

### Conditional Visibility
```powerfx
SharePointForm1.Mode <> FormMode.New
```

### Cascading Dropdown Filter
```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        MethodControl.Selected.Value = "Filament",
        Value in ["Printer1", "Printer2", "Printer3"],
        MethodControl.Selected.Value = "Resin",
        Value = "ResinPrinter",
        true
    )
)
```

## Field Visibility Summary

| Field | New Mode | Edit Mode |
|-------|----------|-----------|
| Student | ✅ Visible (auto-filled) | ✅ Visible |
| StudentEmail | ✅ Visible (auto-filled) | ✅ Visible |
| TigerCardNumber | ✅ Visible | ✅ Visible |
| Title | ✅ Visible | ✅ Visible |
| Course Number | ✅ Visible | ✅ Visible |
| Method | ✅ Visible | ✅ Visible |
| Printer | ✅ Visible | ✅ Visible |
| Color | ✅ Visible | ✅ Visible |
| DueDate | ✅ Visible | ✅ Visible |
| Notes | ✅ Visible | ✅ Visible |
| Attachments | ✅ Visible | ✅ Visible |
| **Status** | ❌ Hidden | ❌ Hidden |
| **ReqKey** | ❌ Hidden | ❌ Hidden |
| **StudentConfirmed** | ❌ Hidden | ✅ Visible |
| All staff fields | ❌ Removed | ❌ Removed |

---

# Code Reference (Copy-Paste Snippets)

## App.OnStart (Optional)

If you need global variables:

```powerfx
// Cache user info
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);
```

## SharePointForm1 — Height (Dynamic)

```powerfx
Attachments_DataCard1.Y + Attachments_DataCard1.Height + 100
```

> ⚠️ Replace `Attachments_DataCard1` with your last visible DataCard if different.

## Student_DataCard ComboBox — DefaultSelectedItems

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
    Table(Parent.Default)
)
```

## Student_DataCard ComboBox — DisplayFields

```powerfx
["DisplayName"]
```

## StudentEmail_DataCard Input — Default

```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    Lower(User().Email),
    Parent.Default
)
```

## Status_DataCard ComboBox — DefaultSelectedItems

```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    [{Value: "Uploaded"}],
    Table(Parent.Default)
)
```

## Status_DataCard — Visible

```powerfx
false
```

## StudentConfirmed_DataCard — Visible

```powerfx
SharePointForm1.Mode <> FormMode.New
```

## Printer_DataCard ComboBox — Items (Cascading)

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        DataCardValue6.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        DataCardValue6.Selected.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        true
    )
)
```

> ⚠️ Replace `DataCardValue6` with your actual Method control name!

## lblFileWarning — Text

```powerfx
"IMPORTANT: File Naming Requirement

Your files MUST be named: FirstLast_Method_Color

Examples:
  - JaneDoe_Filament_Blue.stl
  - MikeSmith_Resin_Clear.3mf

Files not following this format will be rejected."
```

## lblFileWarning — Fill (Warning Yellow)

```powerfx
RGBA(255, 244, 206, 1)
```

## lblFileWarning — BorderColor (Amber)

```powerfx
RGBA(255, 185, 0, 1)
```

---

# Reference: File Naming Examples

## ✅ Valid Filenames

| Filename | Why It's Valid |
|----------|----------------|
| `JaneDoe_Filament_Blue.stl` | Correct format |
| `MikeSmith_Resin_Clear.3mf` | Correct format |
| `SarahOConnor_Filament_Red.obj` | Correct format |
| `PatrickOBrien_Filament_Black.idea` | PrusaSlicer project file |
| `MaryJane_Resin_Clear.form` | Formlabs project file |

## ❌ Invalid Filenames

| Filename | Why It's Invalid |
|----------|------------------|
| `model.stl` | Missing student name, method, color |
| `JaneDoe.stl` | Missing method and color |
| `JaneDoe_Blue.stl` | Missing method |
| `Jane Doe_Filament_Blue.stl` | Spaces in name (use JaneDoe) |
| `project.pdf` | Invalid file type |

---

# Next Steps

After your form is working:

1. ✅ Verify the Power Automate flows are connected (Flow A should trigger on new items)
2. ✅ Test ReqKey generation (should auto-create REQ-00001, etc.)
3. ✅ Confirm email delivery works (Flow A sends confirmation email)
4. 🎯 Continue with Staff Dashboard (Phase 3A)

---

**💡 Pro Tips:**

- **Always test in Preview mode** (press F5 in Power Apps) before publishing
- **After making changes, always Save and Publish to SharePoint**
- **If something breaks**, you can always re-open the form editor and fix it
- **Don't modify the DataSource property** — if you accidentally type there, it breaks the form
- **Back up your work** by taking screenshots of complex formulas before major changes

> **Official Microsoft Docs:** [Customize SharePoint forms with Power Apps](https://learn.microsoft.com/en-us/powerapps/maker/canvas-apps/sharepoint-form-integration)
