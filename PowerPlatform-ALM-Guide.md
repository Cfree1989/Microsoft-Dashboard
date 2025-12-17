# Power Platform ALM & Backup Guide
*Application Lifecycle Management for the Digital Fabrication Lab Dashboard*

---

## Overview

This guide explains how to safely manage changes to the FabLab system without breaking production. Since we operate in a **single environment** (Louisiana State University), we use **Solution exports** as our backup and restore mechanism.

### The Golden Rule

> **Export before you edit. Every time.**

---

## Solution Setup (One-Time)

### Publisher Details

| Field | Value |
|-------|-------|
| Display name | `Digital Fabrication Lab` |
| Name | `DigitalFabricationLab` |
| Prefix | `fablab` |
| Choice value prefix | `80758` |

### Solution Details

| Field | Value |
|-------|-------|
| Display name | `Digital Fabrication Lab Dashboard` |
| Name | `DigitalFabricationLabDashboard` |
| Publisher | `Digital Fabrication Lab (DigitalFabricationLab)` |
| Version | `1.0.0.0` (increment with changes) |
| Package type | `Unmanaged` |

---

## How to Create the Solution (First Time Only)

### Step 1: Create Publisher

1. Go to **make.powerapps.com**
2. Verify **Louisiana State University** is selected (top-right dropdown)
3. Click **Solutions** in left navigation
4. Click **+ New solution**
5. Click **+ New publisher**
6. Fill in publisher details (see table above)
7. Click **Save**

### Step 2: Create Solution

1. Fill in solution details (see table above)
2. Select your publisher from the dropdown
3. Click **Create**

### Step 3: Add Existing Components

1. Open your new solution
2. Click **Add existing** → **App** → **Canvas app**
   - Select: `FabLab Staff Dashboard`
   - Click **Add**
3. Click **Add existing** → **Automation** → **Cloud flow**
   - Select ALL flows:
     - `PR-Create (Flow A)`
     - `PR-Audit (Flow B)`
     - `PR-Action (Flow C)`
     - `PR-Message (Flow D)`
     - `PR-Mailbox (Flow E)`
   - Click **Add**

---

## Backup Process (Before Every Change)

### When to Backup

- Before editing ANY Power App screen
- Before modifying ANY flow logic
- Before adding new components
- Before updating connections
- Weekly, even if no changes planned

### How to Export

1. Go to **make.powerapps.com** → **Solutions**
2. Select **Digital Fabrication Lab Dashboard**
3. Click **Export** (top menu)
4. Select **Unmanaged**
5. Click **Export**
6. Save the `.zip` file with descriptive name:

```
FabLab_v1.0_2024-12-10_BASELINE.zip
FabLab_v1.1_2024-12-15_BeforeMessagingUpdate.zip
FabLab_v1.2_2024-12-20_AfterBugFix.zip
```

### Backup Storage Location

Store backups in a safe location:
```
OneDrive > FabLab System Backups > [dated zip files]
```

Or:
```
SharePoint > Team-ASDN-DigitalFabricationLab > System Backups > [dated zip files]
```

---

## Restore Process (If Something Breaks)

### How to Restore from Backup

1. Go to **make.powerapps.com** → **Solutions**
2. Click **Import**
3. Click **Browse** and select your backup `.zip` file
4. Click **Next**
5. Select **Upgrade** (replaces current version)
6. Click **Import**
7. Wait for import to complete (~2-5 minutes)
8. Test to confirm restoration

### After Restore

- Verify app opens correctly
- Test one flow trigger
- Check SharePoint connections are working

---

## Version Numbering

Use semantic versioning: `MAJOR.MINOR.PATCH.BUILD`

| Change Type | Example | Version Change |
|-------------|---------|----------------|
| Initial release | Go-live | `1.0.0.0` |
| New feature added | Messaging system | `1.1.0.0` |
| Bug fix | Fixed email format | `1.1.1.0` |
| Minor tweak | UI color change | `1.1.1.1` |
| Major overhaul | Complete redesign | `2.0.0.0` |

To update version before export:
1. Open solution
2. Click **...** (more actions) → **Edit**
3. Update Version number
4. Save

---

## What's Protected vs. Not Protected

### ✅ Included in Solution Backup

- Power Apps (Canvas apps)
- Power Automate Flows
- Connection References
- Environment Variables

### ❌ NOT Included (Manage Separately)

- SharePoint list structure (columns, views)
- SharePoint list data
- SharePoint permissions
- Column formatting JSON

### SharePoint Safety Rules

Since SharePoint lists aren't backed up:

1. **Never delete columns** - hide them instead
2. **Never change column types** - create new column, migrate data
3. **Document all list changes** in the setup files
4. **Test view changes** on a copy first

---

## Change Risk Levels

### 🟢 Low Risk (Can edit directly)

- UI text changes (labels, titles)
- Color/styling tweaks
- Adding optional fields
- New SharePoint views

### 🟡 Medium Risk (Export backup first)

- New screens or modals
- Gallery filter logic changes
- New flow branches
- Adding required fields

### 🔴 High Risk (Export backup + test with dummy data)

- Changing flow triggers
- Modifying ReqKey generation
- Status workflow changes
- SharePoint column type changes
- Deleting ANY component

---

## Recommended Backup Schedule

| Trigger | Action |
|---------|--------|
| Before any edit | Export current state |
| After successful feature | Export new baseline |
| Weekly (Fridays) | Export regardless of changes |
| Before semester start | Export + verify restore works |

---

## Quick Reference

### Key URLs

| Resource | URL |
|----------|-----|
| Power Apps Maker | `make.powerapps.com` |
| Power Automate | `make.powerautomate.com` |
| SharePoint Site | `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab` |

### Environment

| Field | Value |
|-------|-------|
| Environment Name | `Louisiana State University (default)` |
| Type | Single environment (no Dev/Test/Prod separation) |

---

## Troubleshooting

### "I can't find my solution"

- Make sure correct environment is selected (top-right)
- Check **Solutions** in left nav, not **Apps**

### "Export failed"

- Check all components are properly added to solution
- Try exporting individual components first
- Check for circular dependencies

### "Import failed"

- Verify you're importing to the same environment
- Check that you exported as **Unmanaged**
- Look for connection issues in the import log

### "App works but flow doesn't"

- Flows may need connections re-authorized after import
- Check flow is turned **On** after import
- Verify SharePoint list connections are correct

---

*Last Updated: December 10, 2024*
*Solution Version: 1.0.0.0*

