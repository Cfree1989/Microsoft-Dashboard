# Canvas app: which files to use and how to update the live app

This repository tracks **Print Lab Dashboard** (staff) and **Student Portal** as separate Canvas apps. This document is the **authoritative workflow** for changing the **Staff Dashboard** app via **Cursor Canvas Authoring** (MCP: `sync_canvas`, `compile_canvas`).

**Cursor:** the agent rule at [`.cursor/rules/canvas-staff-app-coauthor.mdc`](../.cursor/rules/canvas-staff-app-coauthor.mdc) applies when working under `PowerApps/canvas-coauthor/` and restates the same requirements (read this file for the full version).

## Which files are the source of truth

### Staff Dashboard (YAML / coauthoring)

| Role | Path | Use it for |
|------|------|------------|
| **Canonical copy in git** | `PowerApps/canvas-coauthor/App.pa.yaml` | App object: `OnStart`, `Formulas`, theme. |
| | `PowerApps/canvas-coauthor/scrDashboard.pa.yaml` | Dashboard screen, modals, job cards, payments. |
| | `PowerApps/canvas-coauthor/scrSchedule.pa.yaml` | Schedule screen. |
| **MCP working directory (local only)** | `.cursor-mcp-deploy/` (same three `.pa.yaml` files) | **Edit here** when pushing with MCP: `sync_canvas` fills this folder; your patches apply; `compile_canvas` reads it and **pushes to the live coauthoring session** (the app in Power Apps). |

- Treat **`PowerApps/canvas-coauthor/*.pa.yaml`** as what should **match** the app after a successful push (refresh these from the server with `sync_canvas` when you need the latest).
- **Do not** point `compile_canvas` at random folders or at empty / partial YAML. That has produced failed pushes and **overwrote the live session with bad content** in the past.

### Packaged app exports (not for daily YAML edits)

| Path | Use it for |
|------|------------|
| `PowerApps/StaffDashboard.msapp` | Full app package (Studio import/backup), **not** the primary coauthor edit surface. |
| `PowerApps/source/StaffDashboard/` | Unpacked Studio-style sources; useful for reference, **not** the MCP coauthor round-trip. |

### Student Portal (separate app)

| Path | Notes |
|------|--------|
| `PowerApps/StudentPortal.msapp` | Student app package. |
| `PowerApps/source/StudentPortal/` | Unpacked sources. |

Changes to the student app **do not** go through the Staff Dashboard `canvas-coauthor` files.

---

## Always follow this loop (update and push to the app)

**Goal:** Every change to the live Staff Dashboard should go **from server → local → edit → validate → server**, so git and the app stay aligned.

### 1. Pull the current live app (required before editing)

Run **`sync_canvas`** with **`directoryPath`** set to your MCP deploy directory, for example:

- `C:\Microsoft-Dashboard\.cursor-mcp-deploy`

This **overwrites** the YAML files in that folder with the **current coauthoring session** state. Always do this if anyone else could have changed the app, or if you are not 100% sure your local copy is current.

### 2. Edit the right files

- Apply changes under **`.cursor-mcp-deploy\`** (typically `App.pa.yaml`, `scrDashboard.pa.yaml`, `scrSchedule.pa.yaml`).
- Alternatively, edit **`PowerApps/canvas-coauthor\`** and **copy the same changes** into `.cursor-mcp-deploy` before compile—only do this if you are disciplined about keeping them identical; the **safest** pattern is: **sync → edit deploy folder → compile → sync coauthor** (step 4).

### 3. Push to the app (validate and publish to coauthor session)

Run **`compile_canvas`** with **`directoryPath`** = the same directory that contains the edited `.pa.yaml` files (e.g. `.cursor-mcp-deploy`).

- **Resolve any blocking errors** before treating the app as updated.
- Warnings (e.g. delegation) are often pre-existing; do not ignore new **errors** that would change behavior.

### 4. Refresh the repo’s canonical copy (recommended after every successful push)

Run **`sync_canvas`** again into:

- **`.cursor-mcp-deploy`** (optional), and/or
- **`PowerApps/canvas-coauthor`** (use a **dedicated** target directory or sync to coauthor and replace files **only after** you verify the app—avoid deleting coauthor without a fresh sync).

**Commit** the updated `PowerApps/canvas-coauthor/*.pa.yaml` when you want git to record what is live.

### 5. Quick verification checklist

- [ ] Started from **`sync_canvas`** (not from a stale or empty file).
- [ ] Edited only complete **`App.pa.yaml` / `scrDashboard.pa.yaml` / `scrSchedule.pa.yaml`** sets for this app.
- [ ] Ran **`compile_canvas`** successfully.
- [ ] Ran **`sync_canvas`** again and updated **`PowerApps/canvas-coauthor`** (or otherwise confirmed parity) before committing.

---

## What not to do

- **Do not** `compile_canvas` from an **empty** `scrDashboard.pa.yaml` (or any missing screen file). The tool may fail, or worse, **push destructive empties**.
- **Do not** maintain multiple “parallel” sync trees (`canvas-sync`, ad-hoc `download`, old verify folders). Use **one** deploy directory (`.cursor-mcp-deploy`) and **one** canonical git location (`PowerApps/canvas-coauthor`).
- **Do not** assume `PowerApps/canvas-coauthor` is up to date without a recent **`sync_canvas`**.

---

## MCP tools (reference)

| Tool | Purpose |
|------|--------|
| `sync_canvas` | **Download** current coauthoring session YAML into a local directory (overwrites same-named files). |
| `compile_canvas` | **Validate** YAML and **push** to the coauthoring session (updates the app tied to that session). |

Server name in Cursor: **`project-0-Microsoft-Dashboard-canvas-authoring`** (see your MCP config if it differs).

---

## Related documentation

- `PowerApps/StaffDashboard-App-Spec.md` — product and implementation details for the staff app.
- `PowerApps/StaffDashboard-Schedule-Screen.md` — schedule screen; points at `canvas-coauthor/scrSchedule.pa.yaml`.
- `SharePoint/*.md` — list schemas and setup for data sources.

When in doubt: **sync first, edit the full deploy set, compile, sync again, then commit `canvas-coauthor`.**
