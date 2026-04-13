# Exporting live app state into this repo

Use this when you want to **fix or optimize** something: refresh the exports here, then ask for help in Cursor. The AI can read the real `definition.json`, unpacked app YAML, and list schemas instead of only the build docs.

**Site:** [Team-ASDN-DigitalFabricationLab](https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab)

---

## SharePoint list “schema” without IT / without a new Entra app

If you **cannot** get admin consent for a custom app registration (common at LSU), skip PnP sign-in entirely and use one of these. They rely on access you **already have** as a maker (SharePoint site, Power Apps, or Power Automate).

### Option A — Use the unpacked Power Apps (usually enough)

After you unpack the staff and student apps, each SharePoint-backed list already appears as structured JSON:

- [`PowerApps/source/StaffDashboard/pkgs/TableDefinitions/`](PowerApps/source/StaffDashboard/pkgs/TableDefinitions/) — column metadata the app uses  
- [`PowerApps/source/StaffDashboard/DataSources/`](PowerApps/source/StaffDashboard/DataSources/) — connection + table wiring

That is often **sufficient for debugging formulas and flow logic** with the AI, without a separate `*-schema.json` export.

### Option B — One-off Power Automate (SharePoint connector, no new app)

You already use the **SharePoint** connector in flows. Add a **personal** instant or test flow that uses **Send an HTTP request to SharePoint**:

1. **Site address:** your lab site.  
2. **Method:** `GET`.  
3. **URI** (repeat per list), for example:

   `/_api/web/lists/getbytitle('PrintRequests')/fields?$select=Title,InternalName,TypeAsString,Required,Hidden,Choices`

4. Put the response in a **Compose** action, run the flow, copy the JSON into a file under [`SharePoint/schemas/`](SharePoint/schemas/) (for example `PrintRequests-schema.json`).

No Entra app registration is required beyond what Power Platform already uses for that connector.

### Option C — Try [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)

Sign in with your LSU account and call Microsoft Graph for list columns (for example [`GET /sites/{site-id}/lists/{list-id}/columns`](https://learn.microsoft.com/graph/api/resources/columnDefinition)). Some tenants allow Graph Explorer’s first-party app; **some block it**. If it works, paste the JSON into `SharePoint/schemas/`. If it fails, use A or B.

### Option D — PnP PowerShell (only if you ever get a client ID)

[`SharePoint/Export-Schemas.ps1`](SharePoint/Export-Schemas.ps1) needs **PowerShell 7** and, at LSU, almost always **`-ClientId`** from an **admin-consented** app in your tenant. If IT will not register or consent one, treat this script as **optional** and use A–C above.

---

## Prerequisites (one-time)

### 1. PnP PowerShell (optional — SharePoint schema export script)

Only needed if you use `Export-Schemas.ps1` with a consented `-ClientId`.

PnP.PowerShell **3.x requires [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows)** (`pwsh`), not Windows PowerShell 5.1.

```powershell
winget install Microsoft.PowerShell
```

```powershell
pwsh -NoProfile -Command "Install-Module PnP.PowerShell -Scope CurrentUser -Force -AllowClobber"
```

#### Locked-down tenants (`AADSTS700016`)

If sign-in fails with **AADSTS700016** and client ID `31359c7f-bd7e-475c-86db-fdb8c937548e`, the tenant does **not** allow Microsoft’s default PnP app. You need your own Entra app registration **with admin consent** and:

```powershell
cd SharePoint
pwsh -File .\Export-Schemas.ps1 -ClientId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Optional env var: `PNP_CLIENT_ID`. Device code: add `-DeviceLogin`.

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

## 1. SharePoint — list schemas

**Recommended without IT:** use [Option A](#option-a--use-the-unpacked-power-apps-usually-enough) and/or [Option B](#option-b--one-off-power-automate-sharepoint-connector-no-new-app) above.

**Optional script** (needs consented `-ClientId` at LSU):

```powershell
cd SharePoint
pwsh -File .\Export-Schemas.ps1 -ClientId "your-tenant-app-id"
```

Writes JSON under [`SharePoint/schemas/`](SharePoint/schemas/). Re-run when lists change (or refresh Option A/B outputs).

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

### Repack (sources → `.msapp`)

After editing unpacked YAML under `PowerApps/source/…`, rebuild `.msapp` files:

```powershell
cd PowerApps
.\Pack-Apps.ps1
```

Writes (by default) `StaffDashboard.msapp` and `StudentPortal.msapp` next to the script. Then open each file in **Power Apps Studio**, save to the cloud, and publish.

Optional:

```powershell
.\Pack-Apps.ps1 -StaffMsapp "C:\Out\StaffDashboard.msapp"
.\Pack-Apps.ps1 -StaffOnly
.\Pack-Apps.ps1 -StudentOnly
```

---

## Quick checklist before a “fix this” chat

| Component   | Command / action |
|------------|------------------|
| SharePoint (no IT) | Unpack apps → use `PowerApps\source\...\pkgs\TableDefinitions\` (+ optional HTTP flow → `SharePoint\schemas\`) |
| SharePoint (PnP) | `pwsh -File SharePoint\Export-Schemas.ps1 -ClientId …` only if you have a consented app |
| Flows      | Export ZIP → unzip into `PowerAutomate\exports\...\` |
| Power Apps | Save `.msapp` → `PowerApps\Unpack-Apps.ps1` · edit source → `PowerApps\Pack-Apps.ps1` → open `.msapp` in Studio |

Commit the updated files if you use Git, so history matches production.

---

## Updating `pac`

If you installed via MSI or winget:

```powershell
pac install latest
```
