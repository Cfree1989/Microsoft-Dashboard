# Student Portal — Speed, Simplify, Resilience, and Look Review

**Date:** 14 August 2026  
**What this is:** A look at the **Student Portal** (the app students use to submit and track 3D prints) to find ways to make it **faster**, **simpler**, **harder to break**, and **less barebones**. Nothing in the live app was changed.

**Who this version is for:** If you are new to Power Apps, start with the **In plain English** block in every section. The shorter technical notes under it are for later, when we actually change the app.

This follows the same method as `Debug/StaffDashboard-Speed-Simplify-Resilience-Review.md`. The Staff Console is a busy lab tool. This app is the student-facing half of the same SharePoint list.

**Live session reviewed:** app `21d82d0e-29a1-4293-8d23-16fd6f6b1f2e`, environment `Default-2d4dad3f-50ae-47d9-83a0-9ae2b1f466f8`, signed in as `cfree3@lsu.edu`. App Checker: **24 performance items** (23 unused variables, 1 gallery `CountRows`).

---

## A few words used in this doc

| Everyday idea | What it means in this app |
|---------------|---------------------------|
| **SharePoint list** | The same `PrintRequests` filing cabinet the Staff Console uses. |
| **EditForm / SubmitForm** | The submit screen is a Power Apps form tied to that list. That is why file attachments work. |
| **My Requests gallery** | The grid of the student’s own jobs. |
| **Popup / modal** | Confirm estimate, or cancel a job. |
| **UPN vs SMTP** | Sign-in ID (`cfree3@lsu.edu`) vs the “pretty” campus email. LSU often has both. |
| **Delegation** | Asking SharePoint to find *this student’s* jobs vs downloading a pile and searching the pile on the tablet. |
| **IfError** | A safety net: “if this save fails, tell the person and do not pretend it worked.” |

**The five tags** used on findings:

- **Speed** — the app feels slow, or will as the lab stores more jobs.
- **Simplify** — leftover pieces, duplicated chrome, or more clicks than needed.
- **Resilience** — if something fails, the student might not notice, or two screens can disagree.
- **Usage** — a student can easily do the wrong thing, or not know what to do next.
- **Look** — the screen feels empty, default, or unlike a campus lab app.

---

## How this app is actually used (important)

**In plain English:** Unlike the Staff Console, **each student signs in as themselves**. There is no shared lab login and no “Performing Action As” dropdown. The app should know who they are from Microsoft 365.

That is why startup spends time asking Office 365 for the student’s real email, display name, and Entra ID. If that identity is wrong, **My Requests looks empty** even though the job is in SharePoint. That already happened in the lab (`Debug/My Requests Solutions.md`). The current filter is better than the old Person-field filter, but it is still fragile (section 4).

Students typically submit from a **computer** (files live there), then check status later on the same app. The layout is tablet-sized (`1366×768` in the live app, spec still says `1024×768`).

---

## Live app vs this repo (read this before we change anything)

**In plain English:** The copy in Git and the app open in Studio are **not the same**. Most of the difference is file formatting. A few lines actually change behavior.

| Topic | Live Studio (what students get after publish) | Repo (`PowerApps/source/StudentPortal/`) |
|-------|-----------------------------------------------|------------------------------------------|
| Resin printer list | Filters to **`Form 3 (…)`** (no plus) | Filters to **`Form 3+ (…)`** and auto-selects it |
| Dropdown selected row | White text on white background | Dark text on light gray (readable) |
| Printing badge color | Purple | Orange (matches Staff Console) |
| Resin price vars | `varResinRate = 0.30` (unused anyway) | Density × gram rate (also unused) |

Home and My Requests otherwise match. **Do not overwrite the repo from live** until we pick a winner for those four items. The repo already has the better dropdown contrast and the `Form 3+` printer name.

---

## What is already in good shape

**In plain English:** The plumbing is more careful than the screens look. We should not rip it out.

- Startup caches the Office 365 profile **once**, with a fallback if that call fails. It stores SMTP email, UPN, display name, and Entra ID.
- Submit writes the Person field with **UPN in Claims** and **SMTP in Email** — the pattern the Staff spec calls out as required.
- Hidden fields stamp **Status = Uploaded** and **StudentEntraId** on new jobs.
- File names are checked **before** submit (type + `Name_Method_Color`). Students used to get a confusing rejection email after the fact.
- Submit shows a **Submitting…** overlay, and **OnFailure** actually tells the student the error. That is better than several Staff Console saves were before August 2026.
- Confirm-estimate and cancel exist, with a dark overlay so you cannot click the gallery behind them.
- Colors, fonts, radii, and the help email / Room 113 text live in `App.OnStart`, so a visual pass does not have to hunt every control.
- TigerCard is 16 digits, with a photo of where the POS number is. Method/printer/color cascade (printer and color stay off until method is picked).

The rest of this doc is the gaps **on top of** that.

---

## 1. App startup

**In plain English:** Opening the portal is light compared with the Staff Console. It does **not** photocopy plates, payments, and messages. It mostly remembers “who am I?” and a pile of color settings.

### 1.1 Identity is the whole game

**In plain English:** If Office 365 profile fails, the app falls back to the sign-in email. That is usually fine. If SMTP and UPN differ, My Requests must check **both** (it does). Jobs stored under a *third* alias still vanish.

**What we would do later:** Keep the dual-email filter, and also match `StudentEntraId` (already saved on submit). An Entra ID does not change when email aliases do.

### 1.2 Leftover switches (App Checker)

**In plain English:** Startup sets about **20 memory slots nothing uses**: pricing (`varFilamentRate`, `varResinRate`, `varMinimumCost`), hover colors, unused radii, `varCurrentScreen`, `varFormSubmitted`, and so on. They do not break the lab. They make the recipe longer and the checker noisy.

**Done 14 August 2026** (live app): those unused OnStart variables were removed.

Same habit as Staff Console section 1.3.

### 1.3 No “you are a student” lock

**In plain English:** Anyone in the environment who can open the app can submit under **their** account. That is correct. There is no extra staff roster. Do not copy Staff Console’s “Performing Action As” pattern here.

---

## 2. Home screen (landing)

**In plain English:** Two big buttons (submit / my requests), a welcome line, help text, and the same three nav buttons again at the bottom. It works. It looks like a first draft.

### 2.1 No lab branding

**Look.** The app already has `logo.jpg` and TigerCard art in source. Home does not show a FabLab / LSU mark, pickup hours, or a one-line “what this is.” The spec also calls for a circular profile photo in the header (`imgUserPhotoHome`). It is not in the live tree.

The header bar is **transparent**, so it does not read as a header. The welcome label has **no Fill**, so Studio’s default light-purple block shows through — that is the banner in the screenshot, not a designed chip.

**What we would do later:** Solid header (`varColorHeader` is currently `Transparent`), logo left, short name + first name right. Cream or white welcome, not the default purple.

### 2.2 Two ways to do the same two things

**Simplify / Usage.** Get Started and View Requests duplicate the bottom **New Request** / **My Requests** buttons. Fine for a first visit; noisy every time after. The subtitle “What would you like to do today?” is **hidden** (`Visible = false`).

**What we would do later:** Keep the two cards (they are the right idea). Drop the duplicate feel by making the bottom bar smaller, or make the cards earn their space: **“1 estimate waiting”**, last job status, or “You have no open jobs.”

### 2.3 Home does not know the queue

**Usage.** A student with a Pending job still sees a generic lobby. They have to remember to open My Requests and find Confirm Estimate.

**What we would do later:** One line on Home: “You have a print waiting for your OK” (count of Pending + not confirmed). That is the highest-value Home feature we do not have.

---

## 3. Submit screen

**In plain English:** This is one long form: who you are, TigerCard, class, method, printer, color, due date, notes, then files. The screenshot only shows the top because **the rest is below the fold**. Submit stays gray until the required pieces (including a valid file) are filled.

### 3.1 One scroll instead of steps

**Look / Usage.** Students see identity fields and a disabled SUBMIT REQUEST and think the form is empty. Method, printer, color, and the file box — the actual print — are further down a Classic form (`frmSubmit` height 561). The validation banner sits at `Y = btnSubmit.Y - 70` and can cover the last fields.

**What we would do later:** Three short steps: **You → Print → File**, with a progress label, then submit. Same SharePoint form underneath. This is the biggest “it looks barebones” fix that also reduces wrong submissions.

### 3.2 Resin printer name does not match (live)

**Resilience.** Live filter is **`Form 3 (5.7×5.7×7.3in)`**. Repo and Staff Console use **`Form 3+`**. If the SharePoint choice is `Form 3+`, the live dropdown can show **no resin printer**. Live also does **not** auto-select resin’s printer (`DefaultSelectedItems = Parent.Default`).

**What we would do later:** One printer string, shared with Staff Console. Confirm the choice list in SharePoint before changing the app.

### 3.3 “(Required)” on Method is wired to TigerCard

**Usage.** `lblMethodRequired` shows when the TigerCard is not 16 digits, not when Method is empty. Copy-paste leftover. Harmless-looking, confusing.

**Done 14 August 2026** (live app): `Visible` is `IsBlank(DataCardValue8.Selected.Value)`.

### 3.4 File rules are strict and easy to fail

**Usage.** Names must be exactly three underscore parts (`FirstLast_Method_Color.stl`). `Jane_Doe_Filament_Blue.3mf` fails. A file with extra dots can fail the extension check. The yellow instruction box is good; it is also a wall of text next to a small attachments control pushed to `X = 786`.

App Checker warns that large attachments (live allows **50 MB**) can fail on some devices.

### 3.5 Submit overlay is good; double-submit still possible in theory

**Resilience.** Overlay appears when `varIsLoading` is true. If `SubmitForm` never returns success or failure, the overlay can stick — same class of bug as Staff Console section 15. Rare.

OnSuccess always says they will get a confirmation email. That email is **Flow A**, not this app. If the flow is off, the toast is optimistic.

### 3.6 Dropdown contrast (live)

**Look.** Live `varDropdownSelectionFill` and `varDropdownSelectionColor` are both white. Selected rows in Discipline / Method / Printer / Color can look blank. **Already fixed in the repo.**

---

## 4. My Requests screen (the important speed section)

**In plain English:** This is “show me my jobs, newest first.” While the lab is small, it works. When history grows, SharePoint will quietly stop sending older rows, and some students will think jobs vanished.

### 4.1 The gallery asks in a way SharePoint cannot fully handle

**Speed / Resilience.**

```powerfx
Filter(
    PrintRequests,
    Lower(StudentEmail) = varMeEmail || Lower(StudentEmail) = varMeUPN
)
```

`Lower()` on a SharePoint column is **not delegable**. Power Apps downloads a stack (often 500, sometimes 2,000) and filters that stack. Same failure mode as Staff Console tabs before the August 2026 fix — except here the victim is **one student’s history**, not a status tab.

We already save `StudentEntraId`. Filtering `StudentEntraId = Text(varMeEntraId)` (no `Lower`) is the durable question.

**What we would do later:** Prefer Entra ID equality (delegable if the column is indexed). Keep email as a fallback for old rows with a blank Entra ID. Index `StudentEmail` and `StudentEntraId` in SharePoint.

**Done 14 August 2026** (live app): gallery prefers Entra ID with email fallback; empty state uses `AllItemsCount`. Index those two columns in SharePoint list settings (cannot be done from the app).

### 4.2 Empty state unpacks every card

**Speed.** `lblEmptyState` uses `CountRows(galMyRequests.AllItems) = 0`. App Checker: use `galMyRequests.AllItemsCount` instead. Same class as Staff Console 4.3.

**Done 14 August 2026** (live app): `Visible` is `galMyRequests.AllItemsCount = 0`.

### 4.3 Refresh recopies the whole list

**Speed.** Refresh calls `Refresh(PrintRequests)` — the entire list the student is allowed to see — then toasts “Requests refreshed!” There is no 30-second timer (good; this is not the Staff Console). Still heavier than “reload my rows.”

### 4.4 Cards are sparse

**Look / Usage.** A card shows: optional ReqKey, status pill, date, color dot, method/printer, estimate (if staff entered one), Confirm or Cancel. It does **not** show:

- Rejection **reason** (only “Request rejected”)
- Staff messages
- Attached file names / download
- Pickup hours beyond Room 113 + TigerCASH on Completed
- A simple timeline (Uploaded → Pending → Printing → Ready)

ReqKey comes from Flow A. Until that flow runs, the title on the card can be **blank**, which matches a card that looks like it has no job ID.

Card template height is **280px** with `WrapCount = 3`. One job leaves a large white field — the screenshot. That is OK for one job; it looks unfinished without a header, filters, or a “1 open request” count.

### 4.5 Confirm estimate does not check for failure

**Resilience.** Confirm `Patch`es `StudentConfirmed: true`, then **always** toasts success and refreshes. No `IfError`, no loading overlay (the overlay exists only on Submit). If SharePoint fails, the student thinks printing will start; staff still see unconfirmed Pending.

Same for Cancel.

### 4.6 Cancel overwrites Notes

**Resilience.** Cancel writes:

```powerfx
Notes: "Canceled by student before printing."
```

That **replaces** the student’s original notes (and anything else in `Notes`). It does not append. Staff Console treats notes as a diary in `StaffNotes`; this write is the **student** Notes column, but wiping it still destroys context for staff.

Cancel is allowed in Uploaded, Pending, and **Ready to Print**. Ready to Print may already be on a machine. There is no “staff has started slicing — ask the lab” warning.

### 4.7 Rejected and Completed are under-explained

**Usage.** Rejected: “Request rejected” — no checkboxes, no comment, no “fix the file and resubmit.” Completed: pickup room + TigerCASH, good. No hours, no “bring your TigerCard.” Printing: “in progress” only.

---

## 5. What students cannot do at all (features worth adding)

**In plain English:** The portal is a drop-box plus a status list. The Staff Console is a workshop. A lot of student questions that staff answer in person could live here.

| Idea | Why it helps | Effort |
|------|----------------|--------|
| **Home: “needs you” count** | Pending estimate is easy to miss | Small |
| **Status timeline on the card** | Students do not know Uploaded vs Pending vs Ready | Small |
| **Show rejection reason** | Already in SharePoint / email; hidden in the app | Small |
| **Open / download my files** | “Did it actually attach?” | Medium |
| **Message staff** | Staff already have a thread; students have none in this app | Medium (list + flow already exist) |
| **Step-by-step submit** | Fixes the “empty form” look and skipped file rules | Medium |
| **Logo + real header** | Looks like a lab, not a template | Small |
| **Hours / closed banner** | Cuts “is the lab open?” emails | Small |
| **Filter My Requests** (Open / Ready / Done) | History will get long | Small |
| **ReqKey on screen immediately** | Don’t wait for Flow A to name the job | Medium (or show SharePoint ID until then) |

Do **not** add staff-only tools (plates, payment, schedule) here.

---

## 6. Look — why it feels barebones

**In plain English:** Theme *variables* exist. Many screens do not use them. Classic buttons, 1px gray borders, transparent header, default purple welcome, cream cards on near-white, lots of empty canvas, no logo. Bottom nav is three large gray/blue capsules that do not match modern Power Apps “tab bar” examples — and they repeat the Home cards.

Staff Console at least looks dense. This app looks **unfinished** because density is low and chrome is missing.

A visual pass that would change the screenshots without touching business rules:

1. Header fill + logo + “COAD FabLab” (or current lab name).
2. Welcome without the purple default (`Fill = Color.Transparent` or cream).
3. Cards with a real status stripe (use `varStatusColors`, already there).
4. Home cards with a live count, not only icons.
5. Submit as sections or steps, file box full width.
6. Publish the repo dropdown colors so selected items are readable.

---

## 7. Patterns that show up everywhere

### Saves that do not check for failure

| What the student clicked | What they might see if SharePoint fails |
|--------------------------|------------------------------------------|
| Confirm estimate | Green “in the queue” toast anyway |
| Cancel request | “Canceled successfully” anyway; Notes may already be wiped |
| Submit | **Already protected** (`OnFailure`) |

### Identity vs gallery

Submit stamps Entra ID. My Requests does not use it yet. Email `Lower()` cannot be pushed to SharePoint.

### Accessibility

Source App Checker (older run) flagged missing **AccessibleLabel** on almost every input, and TabIndex on gallery/cards. Status messages use emoji. Same “hourglass emoji” class of issue as Staff Console section 15.

### Unused theme

Hover/pressed color vars are set and never bound (App Checker). Some buttons hard-code `ColorFade(RGBA(56, 96, 178, 1), …)` instead of `varColorPrimary`.

---

## Suggested order of work (when we are ready to change the app)

**In plain English:** Shopping list, not work happening now. Earlier numbers help students more, with less change to the rules.

1. ~~**Align live with the better repo bits:** readable dropdown selection; confirm `Form 3` vs `Form 3+` against SharePoint.~~ **Done 14 August 2026** (live app): resin is **Form 3+** only; dropdown selection matches Staff Console; Printing badge is orange (`varColorWarning`). Run **OnStart** in Studio to pick up colors.  
2. ~~**IfError + overlay** on Confirm and Cancel; do not toast success unless the save worked.~~ **Done 14 August 2026** (live app).  
3. ~~**Cancel:** append or write `StaffNotes` / LastAction only — **do not replace** `Notes`. Warn if status is Ready to Print.~~ **Done 14 August 2026** (live app).  
4. ~~**My Requests filter** by `StudentEntraId` (plus email fallback); index those columns; `AllItemsCount` for empty state.~~ **Done 14 August 2026** (live app). Index **StudentEntraId** and **StudentEmail** in SharePoint list settings.  
5. ~~**Look, cheap:** header fill, logo, kill default purple welcome, show rejection text, show ReqKey or “Submitting…” if blank.~~ **Done 14 August 2026** (live app): Staff Console chrome (dark header, white 18pt titles, cream cards). ReqKey falls back to `Job #{ID}`. Rejected cards show `RejectionComment` / `RejectionReason`. No logo — Staff live header has none. Run **OnStart** in Studio to pick up `varColorHeader`.  
6. ~~**Home “needs you”** line for unconfirmed Pending jobs.~~ **Done 14 August 2026** (live app). Orange Home line + My Requests card copy; tap goes to My Requests.  
7. ~~**Submit layout:** steps or named sections so file + method are obvious; fix Method “(Required)” visibility.~~ **Layout skipped** (user likes current form). **Method “(Required)” fixed 14 August 2026** (live app): visible when Method is empty, not when TigerCard is short.  
8. ~~**Delete unused OnStart variables** (App Checker list).~~ **Done 14 August 2026** (live app): 23 unused vars removed. App Checker should be down to the attachments size note.  
9. **Later:** student messages, file download, hours banner, status filters. **Filters + Staff-style filename on cards: done 17 August 2026** (live app). Messages still undecided (email remains the reply path). Hours banner not built.  
10. **Do not:** copy Staff Console shared-login patterns into this app.

---

## What this doc does not cover

- Flow A (create / email / ReqKey) and Flow B (audit) internals  
- Staff Console popups, plates, payment  
- SharePoint embedding / Teams tab  
- Whether filename rules should be relaxed (product decision)

Those can stay in their own write-ups. This review only asks: what would make the **student** app faster, simpler, safer, and less like a blank template in everyday use?
