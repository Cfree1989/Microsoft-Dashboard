# Student Form — Customized SharePoint Form

**⏱️ Time Required:** 2 hours  
**🎯 Goal:** Students can submit 3D print requests with proper validation

---

## Table of Contents

1. [Opening the Form Editor](#step-1-opening-the-form-editor)
2. [Setting Default Values](#step-2-setting-default-values)
3. [Hiding Staff-Only Fields](#step-3-hiding-staff-only-fields)
4. [Cascading Printer Dropdown](#step-4-cascading-printer-dropdown-method-based-filtering) ← **Prevents printer/method mismatches**
5. [Adding File Naming Instructions](#step-5-adding-file-naming-instructions)
6. [Publishing the Form](#step-6-publishing-the-form)
7. [Setting the Form as Default](#step-7-setting-the-form-as-default)
8. [Testing the Form](#step-8-testing-the-form)
9. [Troubleshooting](#troubleshooting)
10. [Reference: File Naming Examples](#reference-file-naming-examples)

---

# STEP 1: Opening the Form Editor

**What you're doing:** Opening the Power Apps form editor so you can customize your SharePoint form.

### Instructions

1. Go to your SharePoint site.
2. Open the **PrintRequests** list.
3. In the toolbar, click **Integrate** → **Power Apps** → **Customize forms**.
4. A new browser tab opens with the **Power Apps form editor**.

> 💡 **Tip:** Leave this tab open while you work through all the steps below.

---

# STEP 2: Setting Default Values

**What you're doing:** Making certain fields fill in automatically (like the student's name and email) so users don't have to type them every time.

> ⚠️ **CRITICAL:** When setting properties in Power Apps, you must select the **control inside the card** (like `DataCardValue3`), NOT the card itself (like `Student_DataCard1`). The card is just a container—the control inside is what actually displays and stores data.

---

## 2A. Auto-Fill the "Student" Field

**Goal:** When a student opens the form, their name appears automatically.

### Instructions

1. In the **Tree View** panel (left side), find `Student_DataCard1`.
2. Click the small arrow (▶) next to it to **expand** the card.
3. Inside, click on the control named `DataCardValue3` (or similar—it's the ComboBox).
4. On the right side, click the **Advanced** tab.

### Set DefaultSelectedItems

5. Find the property called **DefaultSelectedItems**.
6. Delete whatever is there and paste this formula:

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

7. Press **Enter** to confirm.

### Set DisplayFields (Important!)

8. Still on the same ComboBox, find the property called **DisplayFields**.
9. Change it to:

**⬇️ VALUE: Paste into DisplayFields**

```powerfx
["DisplayName"]
```

10. Press **Enter** to confirm.

> ⚠️ **Why DisplayFields matters:** Without this, the field will show a weird code like `i:0#.f|membership|email@lsu.edu` instead of the person's name.

---

## 2B. Auto-Fill the "StudentEmail" Field

**Goal:** Automatically fill in the student's email address.

### Instructions

1. In the **Tree View**, expand `StudentEmail_DataCard1`.
2. Click on the input control inside (e.g., `DataCardValue4`).
3. On the right, click the **Advanced** tab.
4. Find the property called **Default**.
5. Delete whatever is there and paste this formula:

**⬇️ FORMULA: Paste into Default**

```powerfx
Lower(User().Email)
```

6. Press **Enter** to confirm.

> 💡 **Note:** We use a simple formula here. When editing existing records, SharePoint automatically loads the saved value, so we don't need `Parent.Default`.

---

## 2C. Auto-Set the "Status" Field (CRITICAL)

**Goal:** When a new request is created, set the Status to "Uploaded" automatically.

> ⚠️ **IMPORTANT:** The Status field is **required** by SharePoint. Do NOT remove it from the form—you must keep it but hide it (see Step 3).

### Instructions

1. In the **Tree View**, expand `Status_DataCard1`.
2. Click on the ComboBox control inside (e.g., `DataCardValue5`).
3. On the right, click the **Advanced** tab.
4. Find the property called **DefaultSelectedItems**.
5. Delete whatever is there and paste this formula:

**⬇️ FORMULA: Paste into DefaultSelectedItems**

```powerfx
[{Value: "Uploaded"}]
```

6. Press **Enter** to confirm.

> ⚠️ **Note:** Status is a Choice/ComboBox field, so we use `DefaultSelectedItems` with `[{Value: "..."}]` format, not just a plain string.

---

# STEP 3: Hiding Staff-Only Fields

**What you're doing:** Hiding fields that students should NOT see (these are for staff only).

> ⚠️ **IMPORTANT:** Some fields (like Status) are **required** by SharePoint. You must **HIDE** these fields (set Visible = false), NOT remove them. Removing required fields will cause "Field is required" errors.

---

## Fields to HIDE (Set Visible = false)

These fields should stay in the form but be invisible to students:

| Field Name         | Why Hide It?                        | Method |
|--------------------|-------------------------------------|--------|
| **Status**         | Required by SharePoint, auto-set    | HIDE   |
| **ReqKey**         | Auto-generated by flow              | HIDE or REMOVE |

### How to Hide a Field

1. In the Tree View, click on the **DataCard** (e.g., `Status_DataCard1`).
2. On the right, click the **Advanced** tab.
3. Find the property called **Visible**.
4. Change it to `false`.

---

## Fields to REMOVE

These fields can be completely removed (they're not required):

| Field Name         | Why Remove It?                      |
|--------------------|-------------------------------------|
| Priority           | Staff manages queue priority        |
| EstimatedTime      | Staff estimates print time          |
| EstimatedWeight    | Staff estimates material            |
| EstimatedCost      | Staff calculates cost               |
| StaffNotes         | Internal staff communication        |
| LastAction         | Auto-populated by flows             |
| LastActionBy       | Auto-populated by flows             |
| LastActionAt       | Auto-populated timestamp            |
| NeedsAttention     | Staff attention flag                |
| RejectionReason    | Staff rejection reasons             |
| StudentConfirmed   | Handled separately (see below)      |
| TransactionNumber  | Payment field - staff only          |
| FinalWeight        | Payment field - staff only          |
| FinalCost          | Payment field - staff only          |
| PaymentDate        | Payment field - staff only          |
| PaymentNotes       | Payment field - staff only          |

> ⚠️ **DO NOT REMOVE:** TigerCardNumber - This is a required student field!

### How to Remove a Field

1. Click on **SharePointForm1** in the Tree View.
2. In the right-side **Properties** pane, click **Edit fields**.
3. A list of all fields appears.
4. Hover over the field name → click the three dots (**...**) → **Remove**.

---

## Special Case: StudentConfirmed Field

This field should be hidden on NEW submissions, but visible when students edit their requests later (to confirm cost estimates).

### Instructions

1. Add the StudentConfirmed field if not present (Edit fields → Add field).
2. In the Tree View, click on `StudentConfirmed_DataCard1`.
3. On the right, click the **Advanced** tab.
4. Find the property called **Visible**.
5. Paste this formula:

**⬇️ FORMULA: Paste into Visible**

```powerfx
SharePointForm1.Mode <> FormMode.New
```

6. Press **Enter** to confirm.

---

## Adding TigerCardNumber Field (If Not Already Present)

If you added the TigerCardNumber column to SharePoint after creating the form, you need to add it manually:

1. Click on **SharePointForm1** in the Tree View.
2. In the right-side **Properties** pane, click **Edit fields**.
3. Click **+ Add field**.
4. Check **TigerCardNumber** from the list.
5. Click **Add**.
6. **Drag** the TigerCardNumber field to appear **after StudentEmail** in the form order.

> 💡 **Tip:** After adding, the field should appear in the form. Students will be required to enter their 16-digit POS number (with validation enforced by SharePoint).

---

## Final Field Checklist

After completing this step, students should see these fields:

| Field | Visible to Students? |
|-------|---------------------|
| Title | ✅ Yes |
| Student | ✅ Yes (auto-filled) |
| StudentEmail | ✅ Yes (auto-filled) |
| TigerCardNumber | ✅ Yes (student enters manually) |
| Course Number | ✅ Yes |
| Discipline | ✅ Yes |
| ProjectType | ✅ Yes |
| Method | ✅ Yes |
| Color | ✅ Yes |
| Printer | ✅ Yes |
| DueDate | ✅ Yes |
| Notes | ✅ Yes |
| Attachments | ✅ Yes |
| Status | ❌ Hidden (but present) |
| ReqKey | ❌ Hidden or removed |
| All staff fields | ❌ Removed |

> ⚠️ **TigerCardNumber - IMPORTANT:** Students must enter the **16-digit POS number** from their Tiger Card, NOT their LSUID (the 89-number they usually memorize).
> 
> **On the card, it looks like:**
> ```
> LSUID: 899903556          ← NOT this one
> 6272100454327897-5        ← Use first part only
> ```
> **Enter:** `6272100454327897` (16 digits, NO dash or number after it)
> 
> The `-5` is just the card replacement count and is not needed.
> 
> This is the number staff use for manual TigerCASH entry when cards won't swipe.

---

# STEP 4: Cascading Printer Dropdown (Method-Based Filtering)

**What you're doing:** Making the Printer dropdown only show printers compatible with the selected Method. This prevents students from accidentally selecting a resin printer for a filament job (or vice versa).

### Printer/Method Compatibility

| Method | Compatible Printers |
|--------|---------------------|
| **Filament** | Prusa MK4S, Prusa XL, Raised3D Pro 2 Plus |
| **Resin** | Form 3 |

---

## Instructions

1. In the **Tree View**, expand `Printer_DataCard1`.
2. Click on the **ComboBox** control inside (e.g., `DataCardValue6` — the exact name may vary).
3. Look at the **formula bar** at the top — it should show **Items**.
4. Delete whatever is there and paste this formula:

**⬇️ FORMULA: Paste into Items property**

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        // Filament → show FDM printers only
        DataCardValue5.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        // Resin → show resin printers only
        DataCardValue5.Selected.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        // No method selected yet → show all
        true
    )
)
```

5. Press **Enter** to confirm.

> ⚠️ **IMPORTANT:** `DataCardValue5` is the Method dropdown control. Your form may have a different control name! To find the correct name:
> 1. Click on the **Method_DataCard1** in the Tree View
> 2. Expand it and note the control name inside (e.g., `DataCardValue5`, `DataCardValue7`, etc.)
> 3. Replace `DataCardValue5` in the formula above with your actual control name

### Test It

1. Press **F5** (Preview mode)
2. Select **Method = Filament** → Printer dropdown should only show 3 FDM printers
3. Select **Method = Resin** → Printer dropdown should only show Form 3
4. If no Method is selected → all printers show (allows selection in any order)

---

# STEP 5: Adding File Naming Instructions

**What you're doing:** Adding a warning label so students know how to name their files correctly.

### Instructions

1. In the toolbar at the top, click **+ Insert**.
2. In the search box, type **Label**.
3. Click **Label** to add it to the form.
4. Drag the label to appear **above** or **inside** the Attachments section.
5. With the label selected, look at the **formula bar** at the top (it should say "Text").
6. Delete whatever is there and paste this:

**⬇️ TEXT: Paste into the Label's Text property**

```powerfx
"IMPORTANT: File Naming Requirement

Your files MUST be named: FirstLast_Method_Color

Examples:
- JaneDoe_Filament_Blue.stl
- MikeSmith_Resin_Clear.3mf

Files not following this format will be rejected."
```

> ⚠️ **CRITICAL:** The text must be wrapped in **double quotes**! If you paste text without quotes, Power Apps thinks it's a formula and will show errors.

> ⚠️ **Emojis:** Avoid using emojis (like ⚠️ or ✅) in the label text—they can cause "Unexpected character" errors.

7. Press **Enter** to confirm.

### Optional: Style the Label

With the label selected, set these properties in the Advanced tab:

| Property | Value |
|----------|-------|
| Fill | `RGBA(255, 244, 206, 1)` (light yellow) |
| Color | `RGBA(0, 0, 0, 1)` (black) |
| FontWeight | `FontWeight.Bold` |
| Size | `12` |

---

## Note: File Validation Limitation

> ⚠️ **SharePoint attachment controls do NOT support OnChange validation.** You cannot add client-side file validation in a customized SharePoint form. The Power Automate flow (Flow A) will handle file validation on the server side after submission.

---

# STEP 6: Publishing the Form

**What you're doing:** Saving your changes and making them live for all users.

### Instructions

1. Click **File** in the top-left corner.
2. Click **Save**.
3. Wait for the save to complete.
4. Click **Publish to SharePoint**.
5. Wait for the publish to complete.
6. Close the Power Apps tab (or click **← Back to SharePoint**).

---

# STEP 7: Setting the Form as Default

**What you're doing:** Making sure SharePoint uses your custom form instead of the default form.

### Instructions

1. Go to your SharePoint list (PrintRequests).
2. Click the **Settings** gear icon (⚙️) in the top right.
3. Click **List settings**.
4. Click **Form settings**.
5. Select **Use a custom form created in PowerApps**.
6. Click **OK**.

> ⚠️ **WARNING:** If you accidentally select "Use the default SharePoint form," your custom form will be replaced with the plain SharePoint form. You can always switch back by selecting the PowerApps option again.

---

# STEP 8: Testing the Form

**What you're doing:** Making sure everything works correctly before going live.

### Instructions

1. Go to the **PrintRequests** list in SharePoint.
2. Click **+ Add new item** (or **New**).
3. Your custom Power Apps form should appear.

### Verification Checklist

Check that:

- [ ] Your name appears in the **Student** field automatically (shows your name, not a weird code)
- [ ] Your email appears in the **StudentEmail** field automatically
- [ ] The **Status** field is NOT visible
- [ ] Staff-only fields (Priority, StaffNotes, etc.) are NOT visible
- [ ] The file naming warning label is visible
- [ ] You can type in the **Course Number** field
- [ ] All dropdown fields (Method, Color, Printer, etc.) work

### Test Submission

1. Fill in the required fields:
   - **Title:** Test Print
   - **Method:** Filament
   - **Printer:** Prusa MK4S
   - **Color:** Blue
2. Attach a test file (any .stl file).
3. Click **Save**.
4. Verify:
   - [ ] No "Field is required" errors
   - [ ] A success message appears (or the form closes)
   - [ ] The item appears in the list with Status = "Uploaded"

---

# Troubleshooting

## Problem: "Field 'Status' is required" error

**Cause:** You removed the Status field instead of hiding it.

**Solution:**
1. Go back to Power Apps (Integrate → Power Apps → Customize forms)
2. Click SharePointForm1 → Properties → Edit fields
3. Click **+ Add field** → add **Status**
4. Set Status_DataCard1's **Visible** property to `false`
5. Set the ComboBox inside's **DefaultSelectedItems** to `[{Value: "Uploaded"}]`
6. Save and Publish

---

## Problem: Student field shows weird code like "i:0#.f|membership|..."

**Cause:** The DisplayFields property isn't set correctly.

**Solution:**
1. Click on the ComboBox inside Student_DataCard1
2. In Advanced, set **DisplayFields** to `["DisplayName"]`
3. Save and Publish

---

## Problem: "Type mismatch" error on DefaultSelectedItems

**Cause:** Both sides of the If statement must return the same type.

**Solution:**
- Use `Table(Parent.Default)` instead of just `Parent.Default`
- For Choice fields, use `[{Value: "..."}]` format

---

## Problem: Can't type in a text field (like Course Number)

**Cause:** The field's DisplayMode is set to View.

**Solution:**
1. Click on the input control inside the card
2. In Advanced, find **DisplayMode**
3. Set it to `DisplayMode.Edit`

---

## Problem: Form shows as default SharePoint form, not custom form

**Cause:** The form settings aren't set to use Power Apps.

**Solution:**
1. Go to SharePoint → List settings → Form settings
2. Select **Use a custom form created in PowerApps**
3. Click OK

---

## Problem: DataSource shows garbage text

**Cause:** You accidentally typed in the DataSource property.

**Solution:**
1. Click on SharePointForm1
2. In the formula bar, make sure DataSource is exactly: `[@PrintRequests]`
3. Delete any extra characters

---

## Problem: Label shows errors about "Unexpected character"

**Cause:** Text wasn't wrapped in quotes, or contains special characters/emojis.

**Solution:**
1. Wrap all text in double quotes: `"Your text here"`
2. Remove emojis from the text
3. Use plain characters only

---

# Reference: File Naming Examples

## ✅ Valid Filenames

| Filename                          | Why It's Valid                     |
|-----------------------------------|------------------------------------|
| `JaneDoe_Filament_Blue.stl`       | Correct format                     |
| `MikeSmith_Resin_Clear.3mf`       | Correct format                     |
| `SarahOConnor_Filament_Red.obj`   | Correct format                     |
| `PatrickOBrien_Filament_Black.idea` | PrusaSlicer project file         |
| `MaryJane_Resin_Clear.form`       | Formlabs project file              |

## ❌ Invalid Filenames

| Filename                          | Why It's Invalid                   |
|-----------------------------------|------------------------------------|
| `model.stl`                       | Missing student name, method, color |
| `JaneDoe.stl`                     | Missing method and color           |
| `JaneDoe_Blue.stl`                | Missing method                     |
| `Jane Doe_Filament_Blue.stl`      | Spaces in name (use JaneDoe)       |
| `project.pdf`                     | Invalid file type                  |

---

# Quick Reference Card

| Task                        | Where to Set It                          | Property Name           | Value |
|-----------------------------|------------------------------------------|-------------------------|-------|
| Auto-fill Student name      | ComboBox inside Student_DataCard1        | DefaultSelectedItems    | See formula above |
| Show student name correctly | ComboBox inside Student_DataCard1        | DisplayFields           | `["DisplayName"]` |
| Auto-fill StudentEmail      | Input inside StudentEmail_DataCard1      | Default                 | `Lower(User().Email)` |
| Auto-set Status             | ComboBox inside Status_DataCard1         | DefaultSelectedItems    | `[{Value: "Uploaded"}]` |
| Hide a field                | The DataCard (e.g., Status_DataCard1)    | Visible                 | `false` |

---

# Next Steps

After your form is working:

1. ✅ Verify the Power Automate flows are connected
2. ✅ Test ReqKey generation (should auto-create REQ-00001, etc.)
3. ✅ Confirm email delivery works
4. 🎯 Move to Staff Dashboard (Phase 3.2)

---

**💡 Pro Tips:**

- Always test in **Preview mode** (press F5 in Power Apps) before publishing.
- After making changes, always **Save** and **Publish to SharePoint**.
- If something breaks, you can always re-open the form editor and fix it.
- **Don't modify the DataSource property** — if you accidentally type there, it will break the form.

> **Official Microsoft Docs:** [Customize SharePoint forms with Power Apps](https://learn.microsoft.com/en-us/powerapps/maker/canvas-apps/sharepoint-form-integration)
