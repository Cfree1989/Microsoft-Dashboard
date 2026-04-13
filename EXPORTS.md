# Exporting live app state into this repo

Use this when you want to **fix or optimize** something: refresh the exports here, then ask for help in Cursor. The AI can read the real `definition.json`, unpacked app YAML, and list schemas instead of only the build docs.

**Site:** [Team-ASDN-DigitalFabricationLab](https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab)

---

## Prerequisites (one-time)

### 1. PnP PowerShell (SharePoint schema export)

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser -Force -AllowClobber
```

### 2. Power Platform CLI — `pac` (unpack Power Apps)

Install one of:

- **winget (recommended):** `winget install --id Microsoft.PowerAppsCLI -e`
- **MSI:** [Install Power Platform CLI using Windows MSI](https://learn.microsoft.com/power-platform/developer/howto/install-cli-msi)

Verify:

```powershell
pac
```

After installing or updating `pac`, **restart Cursor** (or open a new terminal) so `pac` is on `PATH`.

---

## 1. SharePoint — list schemas (automated)

From the repo root:

```powershell
cd SharePoint
.\Export-Schemas.ps1
```

- Signs you in with a **browser** (interactive).
- Writes JSON files under [`SharePoint/schemas/`](SharePoint/schemas/) (one per list).

Re-run whenever you change columns, choices, or lookups.

---

## 2. Power Automate — flow definitions (manual ZIP)

1. Open [Power Automate](https://make.powerautomate.com) and select your flow.
2. **Export** → **Package (.zip)** (wording may vary slightly).
3. Unzip the package.
4. Copy the unzipped contents into the matching folder under [`PowerAutomate/exports/`](PowerAutomate/exports/) (see table in that folder’s `README.md`).

The file you care about for logic is usually **`definition.json`**.

Repeat for flows **A–I** when you want a full snapshot.

---

## 3. Power Apps — unpack canvas apps

1. In Power Apps Studio: **File** → **Save as** → **This computer** for each app.
2. Copy the `.msapp` files into the [`PowerApps/`](PowerApps/) folder as:

   - `StaffDashboard.msapp`
   - `StudentPortal.msapp`

   (Or keep them anywhere and pass full paths to the script.)

3. Run:

```powershell
cd PowerApps
.\Unpack-Apps.ps1
```

Optional — custom paths:

```powershell
.\Unpack-Apps.ps1 -StaffMsapp "C:\Downloads\StaffDashboard.msapp" -StudentMsapp "C:\Downloads\StudentPortal.msapp"
```

Output goes to:

- [`PowerApps/source/StaffDashboard/`](PowerApps/source/StaffDashboard/)
- [`PowerApps/source/StudentPortal/`](PowerApps/source/StudentPortal/)

---

## Quick checklist before a “fix this” chat

| Component   | Command / action |
|------------|------------------|
| SharePoint | `SharePoint\Export-Schemas.ps1` |
| Flows      | Export ZIP → unzip into `PowerAutomate\exports\...\` |
| Power Apps | Save `.msapp` → `PowerApps\Unpack-Apps.ps1` |

Commit the updated files if you use Git, so history matches production.

---

## Updating `pac`

If you installed via MSI or winget:

```powershell
pac install latest
```
