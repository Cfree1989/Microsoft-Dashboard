# Staff Dashboard — Speed, Simplify, and Resilience Review

**Date:** 14 August 2026  
**What this is:** A look at the Staff Console app to find ways to make it **faster**, **simpler**, and **harder to break**. Nothing in the live app was changed.

**Who this version is for:** If you are new to Power Apps, start with the **In plain English** block in every section. The shorter technical notes under it are for later, when we actually change the app.

---

## A few words used in this doc

You do not need to memorize these. Skim once, then skip back here if a later section uses one.

| Everyday idea | What it means in this app |
|---------------|---------------------------|
| **SharePoint list** | The real filing cabinet in the cloud. Print jobs, plates, payments, messages, and the staff roster all live there. |
| **Collection** | A photocopy the app makes on the tablet when it starts (or every 30 seconds). Fast to read, but it can get out of date, and it cannot hold an unlimited number of rows. |
| **Card / gallery** | The grid of job cards on the dashboard. Each card is one print request. |
| **Tab** | Uploaded, Pending, Printing, Completed, and so on. |
| **Popup / modal** | The overlay that opens when you Approve, Reject, take payment, etc. |
| **Save / Patch** | The app writing a change back to SharePoint. |
| **Flow** | A behind-the-scenes helper (Power Automate). Payments and monthly export use these so the tablet does not do every write itself. |
| **IfError** | A safety net: “if this save fails, tell the person and do not pretend it worked.” |
| **Delegation** | Asking SharePoint to find the matching jobs (smart, can handle a large cabinet) versus downloading a pile of jobs to the tablet and searching that pile (only works until the pile is too big). |

**The four tags** used on findings:

- **Speed** — the app feels slow, or will as the lab stores more jobs.
- **Simplify** — extra leftover pieces, duplicated work, or more clicks than needed.
- **Resilience** — if something fails, staff might not notice, or two screens can disagree.
- **Usage** — a normal person in the lab can easily do the wrong thing, or waste time.

---

## How this app is actually used (important)

**In plain English:** The Staff Console is not “each worker logs in as themselves.” It runs on **one Microsoft account** — the owner’s. Student workers share that same login on the lab machine.

That is why popups ask **Performing Action As** and start empty. SharePoint would otherwise think every approve, reject, and payment was done by the same person. Staff pick **their own name** from the roster so the diary and emails show who actually did the work.

Auto-filling that box with “whoever is signed in” would always pick the owner. **We will not do that.** The same is true on Schedule: defaulting to the signed-in email would always be the owner, not the student editing their shifts.

---

## What is already in good shape

**In plain English:** The app is not a mess. A lot of the “scary” work is already handled well. We should not rip those parts out.

- When the app opens, it loads several SharePoint lists **at the same time** instead of one after another. That is why startup is not even slower.
- Each job card does **not** call SharePoint just to show “2/3 plates done” or “3 messages.” It looks at a summary the app already built.
- Approve, Reject, Archive, Complete, and similar buttons usually **show a loading screen**, **check whether the save worked**, and **write an audit line**. If the audit helper fails, staff still get a warning.
- Recording payment is handed to a Flow (a background helper), not done as a long chain of saves on the tablet.
- While a save is running, a dark overlay blocks extra clicks.
- You cannot mark a job Complete while plates are still printing. If you undo a paid pickup, the plates are undone too, so the next checkout is not confused.
- Colors, fonts, and button sizes are stored in one place, so a visual tweak does not mean hunting through hundreds of controls.
- Saving a schedule asks you to confirm, and it warns you if the save only half-worked.

The rest of this doc is about the gaps **on top of** that.

---

## 1. App startup (what happens when someone opens the Staff Console)

**In plain English:** Opening the app is like the tablet photocopying several filing cabinets so the dashboard can feel snappy. That is a good idea. The problem is it photocopies **everything** it can, including old paid jobs’ plates, payments, and messages — and a photocopy can only hold so many pages.

### 1.1 The app copies entire extra lists into memory

**In plain English:** Besides the print-job list, the app also copies **all build plates**, **all payments**, and **all student/staff messages** onto the tablet.

Think of it as bringing every receipt and every sticky note from the whole year to the front desk, not just the jobs still in the queue.

Power Apps will only copy a limited number of rows (often 500, sometimes 2,000). After that, extra rows simply **do not make it onto the photocopy**. The app does not warn anyone. Cards can then show the wrong plate progress, search-by-printer can miss jobs, and the monthly Report button can think there are no TigerCASH payments this month even when there are.

**What we would do later:** Only photocopy plates/messages for jobs still in the active queue. When someone opens an old Paid or Archived job, fetch that job’s extras on demand.

**Status (14 August 2026):** Live app photocopies plates, payments, and messages from the last **365 days** (`StaffCacheSince`), not the entire lists. Opening **Messages** also loads that job’s thread from SharePoint. **Report** preview asks SharePoint for the selected month (download is still Flow G). Very old Archived cards may show empty plate/message counts until you open the popup.

### 1.2 Summaries are built the slow way

**In plain English:** To show “2/3 plates done” and “Messages (4)” on each card, the app builds two cheat sheets at startup.

The idea is right (one cheat sheet, many cards). The method is like: for every job, walk the entire plate list and count. Then do it again for messages. When there are hundreds of jobs and thousands of plates, that is a lot of walking — and it happens again every time the 30-second refresh recopies the lists.

Then each visible card looks up the cheat sheet. The Messages **button** looks it up about five extra times just to pick colors (normal, hover, pressed).

**What we would do later:** Build each cheat sheet in one pass (group plates by job once). On the card, look up messages once and reuse that for the button color.

**Status (14 August 2026):** Done in the live app. Named formulas use `GroupBy` + counts on the nested group (then drop the nested table). Messages button Fill looks up once; other colors use `Self.Fill`. Unread badge Visible uses `Value(Self.Text) > 0`. Print Complete uses `TotalAll` / `IncompleteCount` from the plate cheat sheet.

### 1.3 Leftover switches that do nothing

**In plain English:** When the app starts, it sets several “memory slots” that **nothing on the screens actually uses** anymore. It is like leaving unused light switches on the wall after a remodel.

Examples: a “is this person staff?” flag that is never checked (and would not help anyway — the signed-in email is always the owner), an “expand all cards” switch from when cards could collapse, and leftover boxes from when batch payment used to save one job at a time on the tablet (batch payment is now one Flow).

They do not break the lab. They make the startup recipe longer.

**Fixed 14 August 2026:** Removed unused `varQuickQueue`, `varExpandAll`, `varIsStaff`, `colBatchSucceededItems`, and `colBatchFailedItems` from startup.

### 1.4 Opening the app is the only real lock

**In plain English:** Because everyone uses the owner’s login, the app cannot tell student workers apart from their Microsoft account. The Staff list + **Performing Action As** is how names get onto jobs. Anyone who can sit at that machine and open the app can act as any roster name, including on Schedule. That is the tradeoff of a shared login. There is no extra “sorry, staff only” screen inside the app.

### 1.5 Black screen flash of “Monthly Transaction Export” on startup

**In plain English:** For about a second after open, the screen is black and the Report popup is sitting in the middle (Month, Year, “0 transactions”, the Art Building note). Then the real dashboard appears. It is not a second screen. It is the export popup showing **too early**.

Power Apps paints the dashboard **before** the startup recipe finishes. Until that recipe runs, the switch that means “hide the export popup” has no value yet (it is blank).

Every other popup uses a rule that means “show me only if the switch is a number greater than zero.” A blank switch fails that test, so Reject, Approve, Payment, and the rest stay hidden during load.

Export uses a different rule: “show me if the switch is **not** zero.” Blank is not zero, so Power Apps treats that as “show it.” The cream card and overlay colors also have not been set yet, so you get dark text on a black screen and white dropdowns.

**What we would do later:** Make export use the same hide rule as the other popups (`greater than zero`, not `not equal to zero`). That is a one-line change. It does not change how Report works after the app is loaded. Lowest-risk item on this list.

**Status (14 August 2026):** Done in the live app. `conExportModal.Visible` is now `varShowExportModal > 0`.

---

## 2. The hidden 30-second refresh, and the Refresh button

**In plain English:** A hidden timer runs in the background so a new student job or a teammate’s lightbulb can show up without hitting Refresh. Every 30 seconds it re-downloads the four main lists and rebuilds the photocopies. It also counts “needs attention” jobs and plays a chime if that count went up.

That is why the dashboard can feel “alive.” It is also why the app talks to SharePoint **constantly**.

**Speed.** Four downloads plus three full recopies, 120 times an hour, **for every tablet that has the app open** — even if someone is in the middle of taking payment. When the lab has more history, this is the main way to hit Microsoft’s “slow down, too many requests” limit.

**Resilience.** The timer does **not** pause while a popup is open. Your checked plates for pickup usually stay checked, but the photocopies underneath can be swapped mid-task. That is like someone replacing the folder on the desk while you are filling out a form.

**Usage.** The on-screen **Refresh** button does not reload the “needs attention” photocopy. A teammate can turn on a lightbulb and your chime / filter can disagree with the cards until the timer fires.

**What we would do later:** Pause the timer while a popup is open or a save is running. Refresh the little “needs attention” list more often than the huge plate/payment/message lists. Make the Refresh button do the same reload the timer does.

**Status (14 August 2026):** Pause + matching Refresh are in the live app (`StaffModalOpen`, timer `Start`, `OnTimerEnd` guard, Refresh reloads `colNeedsAttention`). Still on a 30-second interval when idle; a slower interval is a later optional tweak.

---

## 3. Top bar (Schedule and Report) and “who is doing this?”

**In plain English:** The top-right buttons are simple. **Schedule** opens the weekly grid. **Report** opens the monthly export popup (the button in the file is still named “Analytics” from an older label — cosmetic only).

Most popups ask **Performing Action As** and the dropdown starts **empty** so the student worker can pick **themselves**. The app is always signed in as the owner, so that pick is the only way the log shows the right person. **Not a change we will make.** (See “How this app is actually used” above.)

The Report button opens this same export popup. On startup it can flash for a second before the dashboard is ready — that is section 1.5, not a second Report screen.

---

## 4. Tabs, search, sort, and “no jobs found”

**In plain English:** This is the main grid of the lab: pick a tab, maybe type in search, maybe sort. **This is the most important speed section.** If we only fix one area later, this is the one.

### 4.1 How the card grid asks for jobs

**In plain English:** Imagine SharePoint is a huge library. The smart way to get “all Uploaded jobs” is to **ask the librarian**. The librarian can walk the whole building.

The app currently asks in a way that is more like: “Give me a stack of books (the first 500 or 2,000 in the whole library), then I will flip through that stack myself looking for Uploaded, and also hunt for this search text in names, emails, job IDs, computers, printers, and even printer names on plates.”

Searching *inside* text and peeking at plates is something the librarian (SharePoint) will not do for you in this setup. So Power Apps often decides: “Fine, I will not ask the librarian at all. I will only search the stack I already have.”

While the lab is small, the stack still has every job, so you never notice. When history grows, **Paid, Rejected, Canceled, and Archived** will start **quietly missing older jobs**. Nobody gets an error. The tab just looks shorter than the real cabinet.

**What we would do later:** With an empty search box, only ask “jobs whose Status is this tab” — a question SharePoint *can* answer for the whole list. Use the heavier search only when someone is actually typing.

**Status (14 August 2026):** Done in the live app. Empty search uses `Filter(PrintRequests, Status.Value = …)` only. Typed search is unchanged. Index **Status** on the PrintRequests list in SharePoint if you have not already (Step 6b in the list setup doc).

### 4.2 The numbers on the tabs

**In plain English:** Each tab shows a count, like `Completed 12`. The app does not reuse the grid’s answer. It runs **the same heavy search nine times** (once per tab). Every letter you type in Job Search does that again.

That is why typing in search can make the whole top of the screen hitch.

**What we would do later:** When you are not searching, ask SharePoint for a simple count per status. When you are searching, count from the same short list the grid is already using.

**Status (14 August 2026):** Done in the live app. Empty search uses a status-only Filter per tab. Typed search still uses the same search Filter as the gallery (nine times — search-as-you-type is a later item).

### 4.3 “No Uploaded requests found”

**In plain English:** To decide whether to show the empty message, the app may load **every** matching card just to see if the count is zero. That is like unpacking every box to find out the closet is empty.

There are cheaper ways to ask “is this list empty?”

### 4.4 Search runs on every keystroke

**In plain English:** There is no pause. `J` then `o` then `b` each rebuild the grid and all nine tab numbers. A short wait after you stop typing, or a Search button, would feel calmer and talk to SharePoint less.

### 4.5 Sort

**In plain English:** “Oldest first” and “queue order” can be done by the librarian **if** the job list was asked for the smart way. Sorting by student name, color, computer, or print time usually means sorting the stack already on the tablet. That is fine for today’s queue. It is a problem if that stack was already missing older jobs (see 4.1).

---

## 5. The job cards themselves

**In plain English:** Each card is a mini poster: name, file, color, estimates, plate progress, and a row of buttons. Four posters fit across. Each poster has about 40 little pieces. The dashboard as a whole has hundreds of pieces. Every time data refreshes, a lot of those pieces recalculate.

### 5.1 The Messages button asks the same question too many times

**In plain English:** “How many messages does this job have?” is asked once for the small header, about five times for the button’s colors, and again for the red unread bubble. Same answer, seven trips to the cheat sheet, on **every visible card**.

**Fixed 14 August 2026:** The button looks up the count once for Fill; hover/pressed/border/text color follow that Fill. The unread bubble looks up once for the number and reuses it for show/hide.

### 5.2 Print Complete keeps rechecking plates

**In plain English:** On Printing cards, the Complete button is greyed out until every plate is done. To decide that, each card walks the plate photocopy twice. The cheat sheet in section 1 already knows the counts. We could use that instead.

**Fixed 14 August 2026:** Complete uses `BuildPlateSummary` (`TotalAll` / `IncompleteCount`) instead of scanning the plate photocopy on each card.

### 5.3 The lightbulb is tiny

**In plain English:** The attention lightbulb **does** check for save errors (good). It is just a small target. Missing it usually does nothing in normal mode. Not urgent.

### 5.4 Batch checkout on the card

**In plain English:** When batch mode is on, clicking a Completed card adds or removes it from the checkout pile. Mixing filament and resin is blocked with a clear message. Good.

**Fixed 14 August 2026:** Adding a job that still has plates Queued or Printing is refused immediately (card click, check icon, and Add More Items). Jobs already in the batch can still be removed. Jobs with no plates are allowed.

### 5.5 Start Print can half-succeed

**In plain English:** Start Print first tries to mark the only queued plate as Printing (and checks if that worked). Then it tries to mark the **job** as Printing.

**Fixed 14 August 2026:** The job save is also checked. “Print started!” and the audit helper only run if the job save worked. If the plate already moved but the job did not, staff see a warning to refresh and try again.

### 5.6 Cards cannot collapse

**In plain English:** Every card always shows the full details (class, notes, messages, which computer). That is why cards are so tall and why you see fewer jobs at once. A short row that expands when you tap would show more of the queue and give the tablet less to calculate.

**Skipped 14 August 2026:** Not collapsing or shortening cards.

---

## 6. Reject popup

**In plain English:** Rejecting a job is mostly careful: it shows loading, checks whether the save worked, and tries to write an audit line. If the audit helper fails, the job is still rejected (the student still needs the email). That is reasonable.

Gaps:

- You can confirm a rejection with **no checkbox and no comment**. Easy to send a blank “your print was rejected” email.

**Fixed 14 August 2026:** Confirm is disabled until staff pick **Performing Action As** and either check a reason or type a comment.

Remaining:

- Adding a new canned reason today means changing the app, because the seven checkboxes are typed into the screen. They could be driven by the SharePoint list of reasons instead.
- When it writes the internal activity log, it looks up the same job twice. Harmless, just extra work. Same habit appears on Approve, Archive, Complete, and Revert.

---

## 7. Approve popup

**In plain English:** Approve is one of the stricter popups: you must pick staff, a slicing computer, and a real weight and time. The dollar preview matches what gets saved. Own-material discount is applied. That part is in good shape.

### 7.1 The automatic first plate

**In plain English:** If staff never opened “Add plates,” the app creates one default plate after a successful approve.

**Fixed 14 August 2026:** If that plate create fails, the job stays approved and staff see a warning to add a plate from Build Plates (instead of a silent Pending job with zero plates).

### 7.2 The “Build Plates: 1 plate on …” label

**In plain English:** That label asks SharePoint live, twice, instead of looking at the photocopy already on the tablet. Extra waiting while the popup is open, for a sentence you could answer from memory.

**Fixed 14 August 2026:** The label reads **`BuildPlateSummary`**. Confirm Approval and Build Plates Close/Done count plates from **`colAllBuildPlates`**.

### 7.3 Cleaning weird characters out of comments

**In plain English:** Staff comments get a long “find and replace” so words like `[Summary]` do not break the Notes screen. That only exists because **one SharePoint box is trying to be both a diary of every action and a readable notes page.** See section 11.

---

## 8. Archive, Complete, Revert, and Edit Details

**In plain English:** These four popups move a job forward, backward, or sideways. Archive and Complete follow the same careful save pattern as Reject. Details will not even enable Save until something actually changed.

### Archive

No extra beginner issues beyond the double lookup when writing the diary (same as Reject).

### Complete

**In plain English:** The warning that a pickup email goes out immediately is clear. The button stays off until plates are done. Good.

If the job used more than one printer, the audit line mostly names the **first** printer and says “+ 1 more.” Fine for a log. Easy for staff to miss which machines actually ran.

### Revert (undo a status)

**In plain English:** You must type a real reason (at least 5 characters). If you undo a paid pickup back to Completed, the app also tries to set those plates back from “Picked Up” to “Completed.” That is necessary. Otherwise the next checkout thinks those plates were already taken.

The job save is checked for errors. The plate undos should be checked the same way. If the job moves back and the plates do not, we recreate the exact mess this revert was written to prevent.

### Edit Details (method, printer, color, weight, and so on)

**In plain English:** This popup does several linked updates: change resin vs filament, force the right printer, maybe update the plate’s machine. The logic is careful but written as a long chain of “remember this, remember that.” Easier to break when someone edits it later.

If the job saves and a plate-machine update fails, staff should see that, not only “details updated.”

---

## 9. Payment (one student) and batch payment (several students)

**In plain English:** Taking money is **not** a bunch of tablet saves. The app calls a background helper (Flow H for one job, Flow I for a batch). That is the right design: the helper can update the job, the plates, and the payment record together.

The tablet still has a few weak spots around “did the helper even answer?” and “did we let staff start a batch that the helper will refuse?”

### 9.1 If the payment helper hangs or crashes

**In plain English:** After the helper returns, the app checks a success flag (including picky differences like `true` vs `"true"`). Good.

If the helper **never returns** (timeout, outage), that check may never run. Staff can be stuck behind the loading overlay, or see a useless error. The monthly export already has a “if this helper fails, say so” wrapper. Payment does not.

### 9.2 Writing down which plates were picked up

**In plain English:** The app builds three lists of the same checked plates (pretty names, durable IDs, numeric IDs) by walking the pile three times. It could walk once and copy three ways. Small speed/simplify item, not a lab-facing bug.

### 9.3 Batch: the last button does not check plates

**In plain English:** You can click through batch checkout as long as you picked a staff member, a payment type, a weight, a dollar amount, and at least one job. The popup does **not** check “every job is Completed and has no plates still queued or printing.” The helper should reject that. Staff only see it as an error at the end.

**Fixed 14 August 2026:** Process Batch warns and stays closed if any selected job still has Queued/Printing plates. Record Batch Payment stays grey until the batch is clean. Same named formula (`StaffBatchHasIneligiblePlates`) as the add-to-batch gate.

### 9.4 After a successful batch, the app still writes one audit line per job

**In plain English:** The money is already saved. Then the tablet calls the audit helper once **per student** before the overlay goes away. A big batch waits here. Not dangerous. A single “batch of 8 jobs” audit line would be simpler.

### 9.5 Partial pickup vs batch

**In plain English:** One-student payment can be a **partial** pickup (some plates today, some later). Batch is **final pickup only**. That is on purpose. The batch footer does not say so. Staff who wanted “three students, but only some of Sam’s plates” have to cancel batch and use Record Payment. A one-line hint would prevent that dead end.

**Fixed 14 August 2026:** The batch footer count reads “N items selected · final pickup only.” The popup title is **Final Batch Pickup**. Tooltips on the check icon and Process Batch say the same.

---

## 10. Build Plates popup

**In plain English:** This is where staff add plates, pick a machine, mark a plate Printing, mark it Done, or remove a reprint. Adding and status changes generally show loading and check for errors. That is in good shape.

### 10.1 Removing a plate

**In plain English:** Original plates that are “locked” cannot be deleted (you add a reprint instead). Good.

Deleting a reprint does **not** use the safety net. If the delete fails, the app may still try to write “Removed plate …” in the diary — or the opposite: the plate vanishes and the diary never says so.

### 10.2 Notes are saved when you close, not on every click

**In plain English:** Rapid “add plate / mark printing / mark done” does not write the diary every click. It waits until you close the popup. That keeps the popup fast.

If the app is closed or refreshed before you hit Done/Close, the plates in SharePoint are real, but the diary may not mention them. A small “plate activity not in notes yet” hint would make that obvious.

### 10.3 The progress line on the card

**In plain English:** Once originals are locked, the card shows something like `3/4 done · R 0/1`. That means “3 of 4 original plates finished, and there is 1 reprint not done.” Easy to misread under stress. A tooltip in full sentences would help.

---

## 11. Notes popup

**In plain English:** This screen is trying to be two things at once:

1. A **diary** of everything that happened (approved, plate added, status changed).
2. A place to type a **normal note**.

All of that is stuffed into **one** SharePoint text box, with entries glued together by ` | `. When you open Notes, the app splits that blob back apart to show lines.

Problems a beginner will feel:

- Adding a note does **not** show the loading overlay and does **not** check for failure. A double-click can add the note twice. A failed save may just do nothing — no error toast.
- That text box can only hold about **64,000 characters**. A busy job with lots of plate actions will eventually hit the wall, and new diary lines will fail.
- If someone types ` | ` or `[Summary]` in a comment, the display can split or hide the wrong pieces. Other popups try to scrub those characters. That is a sign the storage design is too fragile.

**What we would do later (big):** Keep a short “staff notes” box for humans, and let the existing audit log store events. **Sooner:** check for save errors, block double-clicks, warn when the box is almost full.

**Skipped 14 August 2026:** Not splitting StaffNotes off the event log. Save errors / double-click on Add Note are already fixed. Near-full warning and a separate audit-only diary are out of scope.

---

## 12. Files (attachments) popup

**In plain English:** This uses a standard “form” to add or remove files on the job. If that succeeds, the app also stamps “file added” on the job.

There is **no** “if saving the files failed, tell the user.” Staff can click Save, see nothing, and not know whether to try again.

If the 30-second timer refreshed the job while this popup was open, SharePoint sometimes says “someone else changed this item.” Pausing the timer during popups (section 2) helps here too.

---

## 13. Messages popup

**In plain English:** Staff can read the thread with the student and send a new message. Mark as read **does** check for errors. Subject and body have minimum lengths so empty spam is harder. Good.

Send itself **does not** check for errors, then always shows “Message sent! Student will receive email notification.” If the save failed, that toast is a lie, and the student never gets mail.

After sending, the app recopies **every** message in the whole lab just to show the one new bubble. It only needed to add that one row to the photocopy.

---

## 14. Report / monthly export popup

**In plain English:** You pick a month and year. A helper builds a file and the app downloads it. If the helper fails, you get an error. That part is done right.

The Download button is enabled by looking at the **photocopy** of payments on the tablet and asking “any TigerCASH in that month?” If the photocopy is missing older payments (section 1.1), the button can stay grey even though the helper would find rows — or the opposite. Safer: let people click Download whenever month/year are picked, and let the helper say “nothing for that month.”

---

## 15. The “please wait” overlay

**In plain English:** On the dashboard, a dark screen with a hourglass emoji appears while a save runs so you cannot double-click. The **Schedule** screen does not have this overlay; it only greys out Save.

The emoji is not a real spinner and is weak for screen readers. A simple “Saving…” label is enough.

The scary case: the overlay turns **on**, then the save crashes in a way the app did not catch. The overlay can stay up and the dashboard looks frozen. The likely culprits are the same un-checked saves: notes, messages, Start Print’s job save, and payment helper timeouts.

---

## 16. Schedule screen

**In plain English:** This is the weekly grid of who is working when, plus a form to replace your shifts. The grid is a picture built out of HTML (like a tiny web page), not a clickable calendar.

### 16.1 It reloads staff and shifts from scratch every visit

**In plain English:** The dashboard already loaded the staff roster at startup. Schedule ignores that and asks SharePoint again, then loads shifts with a question SharePoint cannot fully handle (“only shifts whose email matches someone on this staff list”). Same 500/2,000 photocopy limit as section 1. If there are ever more shift rows than that, some people vanish from the grid with no error.

**Fixed 14 August 2026:** Schedule copies student workers from the in-memory staff list. Shifts load with a simple “email is filled in” question, then names are matched on the tablet. New people added in SharePoint show up after the next app reload (same as other dropdowns).

### 16.2 Building the color/name lookup

**In plain English:** For each shift, the app looks up that person twice (once for the name, once for which color they get). Harmless at lab size. Easy to look up once.

**Fixed 14 August 2026:** One person lookup, then the color comes from that row’s staff ID.

### 16.3 The colored grid

**In plain English:** The pretty table is rebuilt as one giant chunk of HTML whenever anything changes. Fine for about ten people. Heavier if the roster grows.

You cannot tab through cells or click a block to edit it. Editing is the dropdown + rows above the grid, which works. Color is a big part of “who is this,” though initials are there too. Screen readers will not treat this like a real table of buttons.

### 16.4 Save deletes all of that person’s shifts, then writes the new ones

**In plain English:** There is no “change Tuesday 2–4 to 3–5.” Save means: erase that person’s week, then write the rows on screen. If erase works and write fails, you are warned to type the week in again. That warning is important and already there.

Anyone at the shared machine can pick **another** person’s name and replace **their** week. That is the same shared-login tradeoff as Performing Action As: we cannot default to “whoever is signed in,” because that is always the owner. A manager-only lock would need a separate rule, not the Microsoft account.

**Confirmed 14 August 2026:** The name dropdown stays empty (`DefaultSelectedItems = Blank()`). It does not use the signed-in account.

### 16.5 Aid-hour hint

**In plain English:** The form shows how many hours you have in the rows vs the cap for Work Study / GA / President’s Aid. Good. We should confirm Save actually **blocks** going over the cap, not only paints the numbers red.

---

## 17. Patterns that show up everywhere

**In plain English:** These are not extra popups. They are the same habits repeating.

### Saves that do not check for failure

| What the staff member clicked | What they might see if SharePoint/Flow fails |
|-------------------------------|-----------------------------------------------|
| Start Print | **Fixed 14 Aug 2026** — job save checked; no false “Print started!” |
| Approve (auto first plate) | **Fixed 14 Aug 2026** — warning if the default plate write fails |
| Add a note | **Fixed 14 Aug 2026** — loading + error toast; no success unless saved |
| Send a message | **Fixed 14 Aug 2026** — error if comment save fails |
| Save files | **Fixed 14 Aug 2026** — form OnFailure toast |
| Remove a plate | **Fixed 14 Aug 2026** — notes/gallery refresh only if Remove worked |
| Record payment / batch | **Fixed 14 Aug 2026** — Flow timeout treated as “did not respond” |
| Lightbulb | Already protected |

### One diary field doing too many jobs

See section 11. This is the biggest “we made this too complicated” item.

### Two staff editing the same job

The app often re-reads the job from SharePoint right before saving, which helps a little. It does **not** say “Alex changed this job while your popup was open.” Pausing the 30-second timer during popups is the cheap first step.

### SharePoint “indexes”

**In plain English:** An index is a thumb-tab on a filing cabinet (Status, date created, student email, and so on). Without thumb-tabs, even a smart librarian gets slow after a few thousand jobs. The list-setup docs we have do not call out adding those tabs. Worth doing in SharePoint even before we change the app.

---

## Suggested order of work (when we are ready to change the app)

**In plain English:** This is a shopping list, not something happening now. Earlier numbers help the lab more, with less change to how people work.

1. ~~Hide the export popup the same way as every other popup (`greater than zero`), so it does not flash on a black screen at startup.~~ **Done 14 August 2026** (live app).  
2. ~~Make the default job grid (no search) ask SharePoint the simple “this status only” question, and do the same for tab counts. Add a Status thumb-tab in SharePoint.~~ **Done 14 August 2026** (live app). Index **Status** on the PrintRequests list in SharePoint if it is not indexed yet (`SharePoint/PrintRequests-List-Setup.md` Step 6b).  
3. ~~Pause the 30-second refresh while a popup is open or a save is running. Make Refresh match the timer.~~ **Done 14 August 2026** (live app).  
4. ~~Add the safety net (`IfError` + loading) on the saves in the table above.~~ **Done 14 August 2026** (live app).  
5. ~~Build plate/message cheat sheets in one pass; look up messages once per card.~~ **Done 14 August 2026** (live app).  
6. ~~Stop photocopying *all* payments/messages/plates for all of history.~~ **Done 14 August 2026** (live app): last **365 days** by `Created`, Report month query, Messages load that job on open.  
7. ~~Reject: require at least one reason or a comment.~~ **Done 14 August 2026** (live app).  
8. ~~Batch: do not let staff add a job the payment helper will refuse.~~ **Done 14 August 2026** (live app).  
9. ~~Delete leftover startup switches that nothing uses.~~ **Done 14 August 2026** (live app).  
10. ~~Schedule: reuse the staff list already in memory; load shifts the simple way. Do not default the name dropdown to the signed-in account.~~ **Done 14 August 2026** (live app). Name dropdown stays empty on purpose.  
11. ~~Later: stop using StaffNotes as an event log; consider shorter cards.~~ **Skipped 14 August 2026** — leave the diary-in-`StaffNotes` design and full-height cards as they are.

---

## What this doc does not cover

Money/plate edge cases (partial pickup vs batch, plate IDs vs labels, Flow H/I internals) already have their own write-ups:

- `Debug/BuildPlate-Payment-Fragility-Review.md`
- `Debug/Payment-BatchPayment-Fragility-Review.md`
- `Debug/Payment-Flow-Architecture-Review.md`

This review leaves those rules as they are and only asks: what would make the Staff Console faster, simpler, and safer in everyday lab use?
