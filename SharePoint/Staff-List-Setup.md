# Staff SharePoint List Setup

**Purpose:** Team member management and role assignment for access control  
**Time Required:** 10 minutes

---

## Overview

The Staff list manages team member information and role assignments. Power Apps staff console checks this list to determine if a user has staff access.

**Key Features:**
- 3 total fields
- Person field integration with LSU accounts
- Role designation (Manager, Technician, Student Worker)
- Active/inactive status management
- Integration with access control systems

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `Staff`
6. **Description:** `Team member management and role assignment`
7. Click **Create**

---

## Step 2: Add Columns

After creating the list, add these 3 columns:

### Column 1: Member (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `Member`
3. **Description:** `Staff member's LSU account`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

### Column 2: Role (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Role`
3. **Description:** `Staff member's role`
4. **Choices:**
   - Manager
   - Technician
   - Student Worker
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 3: Active (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `Active`
3. **Description:** `Employment status`
4. **Default value:** Yes
5. Click **Save**

---

## Step 3: Create Views

### View 1: Active Staff

1. Click **Settings** (gear icon) → **List settings**
2. Scroll down to **Views** section → Click **Create view**
3. Select **Standard View**
4. **View Name:** `Active Staff`
5. **Columns:** Check these columns:
   - Member
   - Role
   - Active
6. **Filter:** Active **is equal to** Yes
7. **Sort:** Member (Ascending)
8. Click **OK**

### View 2: All Staff

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `All Staff`
4. **Columns:** Check these columns:
   - Member
   - Role
   - Active
5. **Sort:** Member (Ascending)
6. Click **OK**

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | No | - | Optional identifier |
| Member | Person | Yes | - | Staff member's LSU account |
| Role | Choice | Yes | - | Manager; Technician; Student Worker |
| Active | Yes/No | No | Yes | Employment status |

---

## Adding Staff Members

To add a new staff member:

1. Go to the Staff list
2. Click **+ New**
3. **Member:** Search for and select the LSU account
4. **Role:** Select appropriate role
5. **Active:** Leave as Yes (default)
6. Click **Save**

---

## Removing Staff Access

To deactivate a staff member (recommended over deletion):

1. Find the staff member in the list
2. Click to edit the item
3. Change **Active** to **No**
4. Click **Save**

This preserves historical records while removing access.

---

## Power Apps Integration

The Staff Dashboard app uses this list for access control:

```
// Check if current user is active staff
LookUp(
    Staff,
    Member.Email = User().Email && Active = true
)
```

If no match is found, the user is not granted staff access to the dashboard.

---

## Verification Checklist

- [ ] List created with name "Staff"
- [ ] Member column is Person type (required)
- [ ] Role has choices: Manager, Technician, Student Worker
- [ ] Active defaults to Yes
- [ ] Active Staff view created with filter
- [ ] All Staff view created
- [ ] At least one staff member added for testing

---

## Next Steps

1. Add all current Fabrication Lab staff members
2. Configure Power Apps staff console to check this list
3. Test access control by logging in as staff member
4. Document staff onboarding/offboarding procedures

