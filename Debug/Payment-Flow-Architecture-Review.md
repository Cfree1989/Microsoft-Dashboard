# Payment Flow Architecture Review

**Purpose:** Shared prompt and research log for reviewing whether the proposed Power Automate flows for single and batch payment saves are the simplest, most elegant, and most stable design possible — or whether a better architecture exists  
**Status:** Active review doc for multi-AI input  
**Primary References:** `PowerAutomate/Flow-(H)-Payment-SaveSingle.md`, `PowerAutomate/Flow-(I)-Payment-SaveBatch.md`, `Debug/Payment-BatchPayment-Fragility-Review.md`, `SharePoint/Payments-List-Setup.md`, `SharePoint/PrintRequests-List-Setup.md`, `SharePoint/BuildPlates-List-Setup.md`

---

## Background

The fragility review in `Debug/Payment-BatchPayment-Fragility-Review.md` identified critical issues with the original app-side payment save logic. Three independent reviewers (GPT-5.4, Claude Opus, Composer/Cursor) unanimously agreed on three critical findings:

1. **Non-atomic saves** — single payment inserts the `Payments` row first then patches plates and parent separately; batch patches plates and parent first then writes the consolidated ledger row. Neither path is transactional.
2. **Batch closes requests before the consolidated ledger row exists** — if the ledger write fails, requests appear paid with no canonical payment record.
3. **Batch rollup filter excludes prior consolidated batch history** — the broader filter used in UI history display is not used in the batch rollup calculation path.

The consensus decision was to move both single and batch payment saves to Power Automate as two separate flows (Decision 5, Option A). Flow H (single payment) and Flow I (batch payment) were designed in response.

This document asks: **Are those flows the best design?**

---

## What We Are Reviewing

The two proposed Power Automate flows:

- **Flow H (`Flow-(H)-Payment-SaveSingle`)** — handles the entire single-payment save server-side. Validates inputs, checks for duplicate transactions, writes the canonical payment record, updates plate statuses, and patches the parent request.
- **Flow I (`Flow-(I)-Payment-SaveBatch`)** — handles all-or-nothing batch payment saves server-side. Validates every selected request, calculates proportional weight/cost allocations, writes one consolidated payment record first, then updates all plate statuses and parent requests.

Both flows follow the same general pattern:
1. Initialize variables for result tracking
2. Validate inputs (TigerCard detection, duplicate transaction check)
3. Load and validate SharePoint data
4. Calculate values (costs, allocations, statuses)
5. Write all records inside a Scope (payment first, then plates, then parent request)
6. Handle scope failure with run-after error handlers
7. Return a single result to the Power App

---

## The Core Question

> **Is this the simplest Power Automate flow design that is still elegant and stable for this use case?**

We are not asking whether the flows "work." We are asking whether there is a fundamentally simpler way to achieve the same guarantees. Specifically:

- Can the number of actions be meaningfully reduced without losing reliability?
- Are there Power Automate patterns, connectors, or techniques that would eliminate entire steps?
- Is the variable-gated pattern (check `varSuccess` before every step) the best error-handling approach, or is there a cleaner way?
- Are the nested conditions and gate checks the simplest control flow, or is there a flatter structure that achieves the same?
- Is the allocation calculation in Flow I (loop non-last items, remainder to last item) the simplest correct approach, or is there a more elegant way?
- Should these be two separate flows, or could they be combined into one with a mode flag?
- Are there Power Automate features (child flows, expressions, HTTP actions, custom connectors, Dataverse) that would dramatically simplify the design?

Do not accept complexity just because it exists. Challenge every gate, every loop, every variable. If the current design is already optimal, say so and explain why.

---

## Instructions For Reviewers

### Research Requirements

Before writing your review, you **must** do the following:

1. **Use Context7** to pull current Power Automate documentation. Specifically search for:
   - `Scope` action error handling and run-after configuration
   - `Apply to each` concurrency behavior and limitations
   - Power Automate expression functions (especially `select`, `join`, `xpath`, `json`, array manipulation)
   - `Respond to a PowerApp or flow` action behavior and limitations
   - Child flow / solution flow patterns
   - Power Automate retry policies and transient fault handling
   - SharePoint connector throttling limits and batch operation support
   - HTTP connector for SharePoint REST API batch requests
   - Power Automate variable scoping and alternatives to variable-gated patterns

2. **Search online documentation and forums** for:
   - Power Automate best practices for multi-write SharePoint operations
   - Power Automate community patterns for "all-or-nothing" saves
   - Whether SharePoint REST API `$batch` endpoint can be called from Power Automate to combine multiple writes into one HTTP call
   - Power Automate alternatives to deeply nested conditions (e.g., `Terminate` action, child flows, switch statements)
   - Real-world examples of Power Automate flows calling SharePoint with similar complexity
   - Known limitations or gotchas with the patterns used in Flow H and Flow I
   - Power Automate performance implications of multiple `Get items` calls vs. single queries with OData filters

3. **Read the full flow specs** in `PowerAutomate/Flow-(H)-Payment-SaveSingle.md` and `PowerAutomate/Flow-(I)-Payment-SaveBatch.md` end-to-end.

4. **Read the fragility review** in `Debug/Payment-BatchPayment-Fragility-Review.md` to understand what problems these flows were designed to solve and what design decisions were already made.

### What To Evaluate

For each flow, evaluate:

1. **Simplicity** — Can the flow be made simpler (fewer actions, fewer variables, fewer nested conditions) without sacrificing correctness?
2. **Elegance** — Is the control flow clean and easy to follow? Would a non-expert Power Automate builder be able to maintain this?
3. **Stability** — Does the error handling actually catch all failure modes? Are there silent failure paths?
4. **Performance** — How many SharePoint API calls does the flow make? Are there ways to reduce them?
5. **Maintainability** — If the data model changes (new fields, new lists), how many places in the flow need to change?
6. **Alternative architectures** — Is there a fundamentally different Power Automate design that achieves the same goals more simply?

### Specific Design Choices To Challenge

These are the design choices most worth questioning:

| # | Design Choice | Question |
|---|--------------|----------|
| 1 | Variable-gated pattern (`varSuccess` checked at every step) | Is this the simplest error-handling pattern? Would `Terminate` + `Configure run after` be cleaner? Would a single top-level Scope wrapping everything be simpler? |
| 2 | Separate Gate conditions at each step | Could a single Scope around the entire flow replace all individual gates? |
| 3 | Two separate flows (H for single, I for batch) | Could one flow handle both, with a mode flag? Would that be simpler or more complex? |
| 4 | `Apply to each` for plate updates | Should this use SharePoint REST API `$batch` via HTTP connector instead? |
| 5 | `Select` + `xpath` + `join` for building summary strings | Is there a simpler expression pattern for the same output? |
| 6 | Last-item remainder pattern for allocation rounding | Is this the simplest correct approach for proportional allocation? |
| 7 | `Filter array` + `first()` to find individual items from a loaded list | Would `Get item` (by ID) be simpler even though it adds API calls? |
| 8 | Scope with run-after handlers for write error detection | Is there a more robust pattern? |
| 9 | All calculated values stored in Compose actions | Would variables, or a single JSON object, be cleaner? |
| 10 | Manual OData filter construction (`concat('ID eq ', replace(...))`) | Is there a safer or simpler way to query multiple items? |

---

## Review Goals

Ask whether this is truly the simplest design, not just a working one.

Specifically look for:

- unnecessary complexity that exists because the designer didn't know about a simpler Power Automate feature
- actions or variables that could be eliminated entirely
- patterns that are fragile in Power Automate specifically (even if they'd be fine in code)
- performance bottlenecks from excessive SharePoint API calls
- alternative architectures that would be dramatically simpler while maintaining the same guarantees
- places where the flow could silently fail without the error handler catching it
- maintainability concerns for a team that may not be expert Power Automate builders

---

## What To Produce

Each reviewer should add their findings using the output format below. Your review should include:

- A proposed alternative architecture (if you believe one exists) with enough detail to compare against the current design
- If you believe the current design is already optimal, explain specifically why simpler alternatives don't work
- Concrete action-count comparisons where possible (e.g., "this approach uses 15 actions vs. the current 40")
- Any Power Automate features or patterns the current design is not using that it should be
- Any Power Automate gotchas or limitations that affect the current design

Do not just restate what the flows do. Propose something better, or confirm this is already the best approach with evidence.

---

## Output Format For Reviewers

Append a new section at the bottom of this file using this template:

```md
## Review Entry - <AI Name or Tool> - <Date>

### Research Performed

- Context7 topics searched: <list what you looked up>
- Online sources consulted: <list URLs or forum threads>
- Key documentation findings: <summarize anything that changes the analysis>

### Assessment: Is This The Simplest Design?

<Yes / No / Mostly — with explanation>

### Proposed Alternative Architecture (if any)

<Describe the alternative. Include a flow structure diagram if possible. If no alternative is better, say so explicitly.>

### Flow H (Single Payment) Findings

1. <finding>
   - Current approach: <what the flow does now>
   - Simpler alternative: <what could replace it, or "none — this is already optimal">
   - Impact: <action count change, complexity change, reliability change>

2. ...

### Flow I (Batch Payment) Findings

1. <finding>
   - Current approach: <what the flow does now>
   - Simpler alternative: <what could replace it>
   - Impact: <action count change, complexity change, reliability change>

### Stability Concerns

- <any failure modes the current design misses>

### Performance Concerns

- <SharePoint API call counts, throttling risks, etc.>

### Open Questions

- ...

### Verdict

<One paragraph: keep the current design, modify it, or replace it — and why>
```

---

## Notes For Reviewers

- The current design was created specifically to fix the critical issues found in the fragility review. Any proposed alternative must still solve those same problems (non-atomic saves, batch ordering, rollup consistency).
- Flow H has approximately 30 actions. Flow I has approximately 55 actions. If you propose an alternative, estimate the action count.
- Power Automate has real constraints that code does not: no try/catch, no custom functions, limited expression language, SharePoint connector throttling. Your proposals must work within these constraints.
- The SharePoint site is `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`. The lists are `Payments`, `PrintRequests`, and `BuildPlates`.
- "Simpler" means fewer moving parts, not fewer characters. A 10-action flow with clear logic is simpler than a 5-action flow with dense expressions nobody can read.
- If you find that the current design is already the simplest stable approach, that is a valid and valuable conclusion. Say so with conviction and explain why.

---

## Reviewer Feedback

### Reviewer 1

*(Awaiting review)*

---

### Reviewer 2

*(Awaiting review)*

---

### Reviewer 3

*(Awaiting review)*

---

## Consensus

**Status:** Not yet started — will be completed when the document owner states the document is ready.

This section will be filled in after all reviewer entries are complete. The consensus will:

1. Determine whether the current Flow H / Flow I design should be kept, modified, or replaced
2. If modified: list the specific changes with rationale
3. If replaced: document the agreed alternative architecture in enough detail to build from
4. Record any dissenting opinions from reviewers
5. Identify any follow-up questions that need answers before implementation

---

*Created: March 31, 2026*
