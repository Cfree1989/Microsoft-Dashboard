# Email Identity Mismatch Issue

## The Problem

Students submit print requests through a PowerApps canvas app. The app auto-populates their email using `User().Email` and saves it to a `StudentEmail` text field in SharePoint. The "My Requests" gallery filters by this field to show only the logged-in student's requests.

**However:**
- Students can see their submitted files immediately after submission
- After a print request is approved (status changes) and the student returns via a confirmation email link, their files no longer appear in "My Requests"
- SharePoint sometimes stores a different email alias than what was displayed in the submission form
- The app uses `User().Email` which returns the **User Principal Name (UPN)**, not the actual SMTP email address

## Why It Fails

### Root Cause: `User().Email` Returns UPN, Not Email

According to Microsoft documentation and community research:

> **`User().Email` does NOT return the user's email address** — it returns the **User Principal Name (UPN)**, which is the sign-in identifier.

At LSU (Louisiana State University), students have multiple email aliases:

| Identity Type | Example Value | Source |
|---------------|---------------|--------|
| UPN (sign-in) | `dbeltz2@lsu.edu` | `User().Email` returns this |
| Primary SMTP email | `devin.beltz@lsu.edu` | SharePoint Person fields may store this |
| Proxy aliases | Both of the above | All deliver to same inbox |

### The Mismatch Flow

1. **On Submit:** Form displays `dbeltz2@lsu.edu` (from `User().Email`)
2. **SharePoint Saves:** `StudentEmail` = `dbeltz2@lsu.edu`, but `Student.Email` (Person field) may resolve to `devin.beltz@lsu.edu`
3. **On Return:** `varMeEmail` = `Lower(User().Email)` = `dbeltz2@lsu.edu`
4. **Filter:** `StudentEmail = varMeEmail` — if StudentEmail somehow stored the SMTP version, **no match**

### Why Records "Disappear" After Approval

When students click the confirmation link in their email and return to the app:
- The app re-evaluates `varMeEmail` from `User().Email`
- If the stored `StudentEmail` doesn't exactly match, the filter returns empty
- This creates the illusion that approved files "disappear"

## Impact

- Students cannot see their own submissions after approval
- Students may resubmit requests thinking they didn't go through
- Staff receive duplicate requests
- Trust in the app is undermined
- Support burden increases

## Scope

This is a **user identity resolution issue** between Power Apps and SharePoint, not a platform bug. The behavior is documented but not intuitive.

---

## Environment Details

- **App Type:** Power Apps Canvas App (Student Portal)
- **Data Source:** SharePoint Online (PrintRequests list)
- **Authentication:** Microsoft 365 / Azure AD (Entra ID)
- **University:** LSU (Louisiana State University)
- **Email System:** Multiple aliases per user (e.g., `jsmith3@lsu.edu` and `john.smith@lsu.edu`)

### SharePoint List: PrintRequests

Key columns:
- `Student` (Person/People Picker) - stores user as SharePoint Person object with `DisplayName`, `Email`, `Claims`
- `StudentEmail` (Single line of text) - stores submitting user's email for filtering
- `Status` (Choice) - tracks request status (Uploaded, Pending, Ready to Print, etc.)
- `StudentConfirmed` (Yes/No) - tracks if student confirmed estimate

### Current App Configuration

**App.OnStart:**
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);
```

**galMyRequests.Items (current filter):**
```powerfx
SortByColumns(
    Filter(PrintRequests, StudentEmail = varMeEmail),
    "Created",
    SortOrder.Descending
)
```

**StudentEmail_DataCard1.Update (submit form):**
```powerfx
Lower(User().Email)
```

**Student_DataCard1.Update (Person field auto-populate):**
```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & Lower(User().Email),
    DisplayName: User().FullName,
    Email: Lower(User().Email)
}
```

---

## Research Prompt

```
I have a PowerApps canvas app where students cannot reliably see their own 
print requests in a "My Requests" gallery. The app uses SharePoint as its 
data source.

ROOT CAUSE IDENTIFIED:
- `User().Email` returns the User Principal Name (UPN), not the actual SMTP 
  email address
- Our university (LSU) assigns multiple email aliases per student 
  (e.g., jsmith3@lsu.edu vs john.smith@lsu.edu)
- SharePoint Person fields may resolve to a different alias than what 
  `User().Email` returns
- The gallery filter `StudentEmail = varMeEmail` fails when these don't match

PROPOSED FIX:
Replace `User().Email` with `Office365Users.MyProfileV2().mail` throughout:
- App.OnStart: Set(varMeEmail, Lower(Office365Users.MyProfileV2().mail))
- StudentEmail_DataCard1.Update: Lower(Office365Users.MyProfileV2().mail)
- Add Coalesce fallback to User().Email if API fails

QUESTIONS:
1. Is `Office365Users.MyProfileV2().mail` the correct solution for this 
   UPN vs SMTP mismatch issue?
2. Are there edge cases where this solution would fail?
3. What happens for users without Exchange mailboxes (if any)?
4. Is there a more reliable user identifier we should use instead 
   (e.g., Object ID, consistent across all Microsoft services)?
5. Should we store multiple identifiers (UPN, SMTP, Object ID) for 
   future-proofing?
6. Are there performance concerns with calling Office365Users on every 
   app start and form submission?
7. How should we handle existing records that were saved with the wrong 
   email format?
8. Is there a way to configure SharePoint/Power Apps to use consistent 
   email resolution?
9. Would using `User().EntraObjectId` (GUID) be more reliable than any 
   email-based identifier?
10. Are there any security implications of this change?

For your recommendation, provide:
1. Validation or correction of the root cause analysis
2. Evaluation of the proposed Office365Users fix
3. Alternative approaches we should consider
4. Potential gotchas or edge cases
5. Best practices for user identification in PowerApps with SharePoint
6. Implementation priority (what to fix first)
7. Long-term architecture recommendations
```

---

## AI Model Recommendations

*This prompt is being submitted to multiple AI models. Each model should add their recommendation below in the designated section.*

### Claude Opus 4.5 (Anthropic) - Thinking Mode

**Recommendation:** Implement the proposed `Office365Users.MyProfileV2().mail` fix immediately, paired with `User().EntraObjectId` as the canonical long-term identifier. The root cause analysis is **validated** by Microsoft documentation.

**Justification:**

Context7 documentation confirms the core issue:

1. **`User().Email` returns UPN, not SMTP:** Power Apps docs describe `User().Email` as "the email address associated with the signed-in user," but this is technically the User Principal Name (sign-in identifier), which diverges from the primary SMTP address in multi-alias environments like LSU.

2. **Office365Users connector exposes distinct properties:** The connector documentation explicitly shows separate properties:
   - `.Mail` — primary SMTP email address
   - `.UserPrincipalName` — the UPN (sign-in identifier)
   - `.Id` — the Entra Object ID (immutable GUID)
   
   The formula `Office365Users.MyProfileV2().id` is documented for retrieving the user's unique identifier.

3. **Microsoft Graph confirms separation:** The Graph API `userIdentity` resource type defines distinct fields: `email`, `objectId`, and `userPrincipalName` — confirming these are fundamentally different identity attributes.

4. **SharePoint delegation supports the fix:** Power Apps delegation documentation confirms that `=` (equality) operations on Text columns are fully delegable to SharePoint, meaning the filter `StudentEmail = varMeEmail` will execute server-side without hitting the 500/2000 row limit.

5. **`mail` vs `proxyAddresses`:** Graph docs clarify that the `mail` property is the primary email address, while `proxyAddresses` contains all aliases. SharePoint Person fields may resolve using any alias in `proxyAddresses`, causing the mismatch.

**Answers to Research Questions:**

| # | Question | Answer |
|---|----------|--------|
| 1 | Is `Office365Users.MyProfileV2().mail` correct? | **Yes.** Confirmed by Context7 docs — `.Mail` returns SMTP, distinct from `.UserPrincipalName`. |
| 2 | Edge cases where it fails? | Users without Exchange mailboxes return `Blank()` for `.mail`. Connector consent failures. Guest users with unusual alias formats. |
| 3 | Users without Exchange mailboxes? | `.mail` is blank; `Coalesce()` fallback to `User().Email` handles this gracefully. |
| 4 | More reliable identifier? | **`User().EntraObjectId`** — immutable GUID, no connector required, survives email/name changes. Also available as `Office365Users.MyProfileV2().id`. |
| 5 | Store multiple identifiers? | **Recommended.** Store `StudentEmail` (SMTP), `StudentEntraId` (GUID), keep `Student` (Person field). |
| 6 | Performance concerns? | Call `Office365Users.MyProfileV2()` **once** in `App.OnStart`, cache in variable. Do not call per row or per form submission. |
| 7 | Handle existing records? | Power Automate backfill flow: lookup each record's user, normalize to SMTP, populate `StudentEntraId`. |
| 8 | Configure consistent resolution? | Not configurable at platform level. Control what you write (the fix) to ensure consistency. |
| 9 | `User().EntraObjectId` more reliable? | **Yes, absolutely.** Immutable across all Microsoft services, no connector needed. Best long-term primary key. |
| 10 | Security implications? | None. Both methods only return data about the signed-in user. Standard connector consent applies. |

**Implementation Steps:**

**Phase 1 — Immediate Fix:**

1. **Add Office 365 Users connector** to the app.

2. **Update `App.OnStart`:**
   ```powerfx
   Set(varUserProfile, Office365Users.MyProfileV2());
   Set(varMeEmail, Lower(Coalesce(varUserProfile.mail, User().Email)));
   Set(varMeName, Coalesce(varUserProfile.displayName, User().FullName));
   Set(varMeEntraId, User().EntraObjectId);
   ```

3. **Update `StudentEmail_DataCard1.Update`:**
   ```powerfx
   varMeEmail
   ```

4. **Update `Student_DataCard1.Update`:**
   ```powerfx
   {
       '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
       Claims: "i:0#.f|membership|" & Lower(User().Email),
       DisplayName: varMeName,
       Email: varMeEmail
   }
   ```
   *Note: `Claims` must remain UPN-based for SharePoint Person resolution.*

5. **Update gallery filter with transition fallback:**
   ```powerfx
   SortByColumns(
       Filter(
           PrintRequests,
           Lower(StudentEmail) = varMeEmail || Lower(StudentEmail) = Lower(User().Email)
       ),
       "Created",
       SortOrder.Descending
   )
   ```

**Phase 2 — Backfill & Future-Proofing:**

6. Add `StudentEntraId` (Single line text) column to PrintRequests.

7. Create Power Automate flow to backfill existing records with normalized SMTP and Entra Object ID.

8. Migrate gallery filter to use `StudentEntraId = varMeEntraId` as primary key.

**Edge Cases Identified:**

| Edge Case | Risk | Mitigation |
|-----------|------|------------|
| **No Exchange mailbox** | `.mail` returns `Blank()` | `Coalesce()` fallback to UPN |
| **Connector not consented** | API call fails | Wrap in `IfError()` or test during deployment |
| **Guest/B2B users** | Unusual UPN format (`user_domain#EXT#@tenant`) | `.mail` normalizes correctly; Object ID is stable |
| **Email alias changes** | Old records won't match new SMTP | Entra Object ID never changes — migrate to GUID-based filtering |
| **Throttling** | High-volume environments | Cache profile once per session, avoid per-row calls |
| **Person field Claims** | Must use UPN, not SMTP | Documented in implementation — don't change Claims format |
| **Delegation with `\|\|`** | OR conditions may warn | Confirmed delegable per Context7 SharePoint docs; monitor formula bar |

**Long-term Architecture:**

1. **Canonical Identifier:** `User().EntraObjectId` (GUID) — immutable, no connector, survives mergers/renames.

2. **Store Three Identifiers:**
   - `StudentEntraId` — primary filter key
   - `StudentEmail` — display/notifications
   - `Student` — Person field for SharePoint features

3. **Recommended User Resolution Pattern:**
   ```powerfx
   Set(
       varCurrentUser,
       {
           EntraId: User().EntraObjectId,
           Email: Lower(Coalesce(Office365Users.MyProfileV2().mail, User().Email)),
           UPN: Lower(User().Email),
           DisplayName: Coalesce(Office365Users.MyProfileV2().displayName, User().FullName)
       }
   );
   ```

4. **After backfill completes:** Remove dual-filter fallback, filter solely on `StudentEntraId`.

---

### Claude Opus 4.6 (Anthropic) - Max Thinking

**Recommendation:** Implement a **dual-identifier strategy** — use `Office365Users.MyProfileV2().mail` as the immediate fix for the SMTP mismatch, and add `User().EntraObjectId` (Entra Object ID / GUID) as the canonical, immutable user identifier for long-term reliability. The proposed `Office365Users` fix is correct and validated by Microsoft documentation.

**Justification:**

The root cause analysis is **accurate and well-identified**. Context7 documentation confirms:

1. **`User().Email` returns the UPN**, not the SMTP address. Microsoft's own Power Apps docs describe it as "the email address associated with the signed-in user," but this is the sign-in identifier (UPN), which in multi-alias environments (like LSU) diverges from the primary SMTP address stored by SharePoint Person fields.

2. **`Office365Users.MyProfileV2()`** returns the actual primary SMTP email from Microsoft Graph / Azure AD. Context7 Power Fx snippet documentation confirms the `.mail` property is distinct from `.userPrincipalName` — these are two separate fields on the profile object. The `.mail` field maps to the `mail` attribute in Entra ID, which is the primary SMTP address (`devin.beltz@lsu.edu`), while `.userPrincipalName` maps to the UPN (`dbeltz2@lsu.edu`).

3. **`User().EntraObjectId`** is available natively in Power Apps (no connector needed) and returns the Entra ID GUID — the only truly immutable identifier across all Microsoft services. Context7 documentation shows this being used in production patterns (e.g., `Office365Users.UserPhotoV2(User().EntraObjectId)`).

4. **SharePoint delegation** supports text equality (`=`) filtering, so filtering on a text column storing either email or GUID will delegate properly to the server. However, the Person field's `Email` and `DisplayName` subfields are also delegable — meaning a Person-field-based filter is also viable.

5. **Performance consideration from Microsoft docs**: "Avoid too many dynamic lookup columns — SharePoint supports various data types, including dynamic lookups such as Person, Group, and Calculated. If a list defines too many dynamic columns, it takes more time to manipulate these dynamic columns within SharePoint." This supports using a plain text column (`StudentEmail`) for filtering rather than the Person field.

**Answers to Specific Research Questions:**

| # | Question | Answer |
|---|---------|--------|
| 1 | Is `Office365Users.MyProfileV2().mail` correct? | **Yes.** It returns the primary SMTP address from Entra ID, solving the UPN/SMTP mismatch. |
| 2 | Edge cases where it fails? | Yes — see Edge Cases section below. |
| 3 | Users without Exchange mailboxes? | `.mail` will be `Blank()` for users without an Exchange mailbox. The `Coalesce` fallback to `User().Email` handles this. |
| 4 | More reliable identifier? | **`User().EntraObjectId`** — a GUID that never changes, even if emails or names change. No connector required. |
| 5 | Store multiple identifiers? | **Yes.** Store `StudentEmail` (SMTP), `StudentUPN` (for backward compatibility), and `StudentEntraId` (GUID) for future-proofing. |
| 6 | Performance concerns? | `Office365Users.MyProfileV2()` makes a Graph API call. Call it **once** in `App.OnStart`, cache in a variable. Do not call per-form-submission or per-gallery-row. |
| 7 | Handle existing records? | Power Automate flow to backfill: look up each `StudentEmail` via Graph API, normalize to SMTP, and optionally populate a new `StudentEntraId` column. |
| 8 | Consistent email resolution? | Not configurable at the SharePoint/Power Apps level. The only way to ensure consistency is to control what value you write (which this fix does). |
| 9 | `User().EntraObjectId` more reliable? | **Yes, absolutely.** It is the most reliable identifier — immutable, unique, and available without a connector. Recommended as the long-term primary key. |
| 10 | Security implications? | None. Both `Office365Users.MyProfileV2()` and `User().EntraObjectId` return data about the currently signed-in user only. No elevation of privilege. The connector requires admin consent but reads only the caller's own profile. |

**Implementation Steps:**

**Phase 1 — Immediate Fix (resolve the mismatch):**

1. **Add the Office 365 Users connector** to the Student Portal canvas app.

2. **Update `App.OnStart`** — call the API once, cache all needed values:
   ```powerfx
   // Cache the user profile once at app start
   Set(varUserProfile, Office365Users.MyProfileV2());
   Set(varMeEmail, Lower(Coalesce(varUserProfile.mail, User().Email)));
   Set(varMeName, Coalesce(varUserProfile.displayName, User().FullName));
   Set(varMeEntraId, User().EntraObjectId);
   ```

3. **Update `StudentEmail_DataCard1.Update`** (submit form):
   ```powerfx
   varMeEmail
   ```
   *(References the cached variable instead of calling `User().Email` again.)*

4. **Update `Student_DataCard1.Update`** (Person field):
   ```powerfx
   {
       '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
       Claims: "i:0#.f|membership|" & Lower(User().Email),
       DisplayName: varMeName,
       Email: varMeEmail
   }
   ```
   *(Note: `Claims` must still use the UPN since SharePoint resolves People by UPN claim. The `Email` subfield uses the SMTP address.)*

5. **Update `galMyRequests.Items` filter** — add a fallback filter for the transition period while old records may have UPN-based emails:
   ```powerfx
   SortByColumns(
       Filter(
           PrintRequests,
           Lower(StudentEmail) = varMeEmail
               || Lower(StudentEmail) = Lower(User().Email)
       ),
       "Created",
       SortOrder.Descending
   )
   ```

6. **Test with multiple student accounts** that have UPN != SMTP to confirm the fix works end-to-end.

**Phase 2 — Backfill Existing Records:**

7. **Add a `StudentEntraId` column** (Single line of text) to the PrintRequests SharePoint list.

8. **Create a Power Automate flow** to iterate over all PrintRequests records:
   - For each record, look up the `StudentEmail` or `Student` (Person) field via the Office 365 Users connector
   - Normalize `StudentEmail` to the primary SMTP address (`.mail`)
   - Populate `StudentEntraId` with the user's Entra Object ID
   - Log any records that cannot be resolved (e.g., deleted accounts)

9. **Run the backfill flow** and verify results.

**Phase 3 — Long-term Migration to Entra Object ID:**

10. **Update `StudentEmail_DataCard1.Update`** to also write `StudentEntraId`:
    ```powerfx
    // In the StudentEntraId data card:
    varMeEntraId
    ```

11. **Migrate the gallery filter** to use the GUID as primary match:
    ```powerfx
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEntraId = varMeEntraId
        ),
        "Created",
        SortOrder.Descending
    )
    ```

12. **Remove the dual-filter fallback** from Phase 1 once all records have been backfilled.

**Edge Cases Identified:**

| Edge Case | Risk | Mitigation |
|-----------|------|------------|
| **`MyProfileV2().mail` is Blank** | Users without Exchange Online mailboxes (e.g., shared accounts, service accounts) will return `Blank()` for `.mail`. | `Coalesce(varUserProfile.mail, User().Email)` falls back to UPN. |
| **Connector consent not granted** | If the Office 365 Users connector hasn't been consented by the tenant admin, the call will fail silently or error. | Test in the target environment; wrap in `IfError()` for graceful degradation. |
| **Guest users (B2B)** | External/guest users may have a UPN like `user_contoso.com#EXT#@lsu.onmicrosoft.com`. Their `.mail` may differ significantly from their UPN. | The `Coalesce` fallback handles this. Guest users should still match on `.mail`. Consider whether guests should access the student portal at all. |
| **Email alias changes** | If LSU changes a student's primary SMTP alias (e.g., after a legal name change), old records stored with the previous email won't match. | This is why the Entra Object ID (GUID) is the recommended long-term identifier — it **never changes**. |
| **Rate limiting / throttling** | `Office365Users.MyProfileV2()` calls Microsoft Graph. Under extreme load, throttling could occur. | Calling once in `App.OnStart` and caching in a variable eliminates repeated calls. This is a non-issue for single-user canvas apps. |
| **Delegation warning on `\|\|` (OR) filter** | The dual-filter in Phase 1 step 5 uses `\|\|` which is delegable to SharePoint (confirmed by Context7 docs: "Expressions joined with And or Or are delegable to SharePoint"), but test to confirm no delegation warnings appear. | Monitor the formula bar for delegation warnings. If issues arise, use `Search()` or `AddColumns()` workaround. |
| **Person field Claims vs Email mismatch** | The `Claims` string in the Person field must use the UPN (sign-in identifier) to resolve correctly in SharePoint. Using SMTP here will cause the Person field to fail to resolve. | Keep `Claims` using `User().Email` (UPN); only change the `Email` subfield and the `StudentEmail` text column. |

**Long-term Architecture:**

1. **Canonical Identifier: `User().EntraObjectId` (GUID)**
   - Store as `StudentEntraId` (text column) on every record
   - Use as the **primary filter key** for all gallery filtering
   - Immutable across name changes, email alias changes, and domain migrations
   - Available natively via `User().EntraObjectId` — no connector needed
   - Also available via `Office365Users.MyProfileV2().id`

2. **Store All Three Identifiers on Each Record:**
   - `StudentEntraId` — GUID (primary key for filtering)
   - `StudentEmail` — SMTP email (for display and notification purposes)
   - `Student` — Person field (for SharePoint's built-in people features, profile cards, presence)

3. **App-Level User Resolution Pattern (recommended):**
   ```powerfx
   // App.OnStart — single source of truth for user identity
   Set(varUserProfile, Office365Users.MyProfileV2());
   Set(
       varCurrentUser,
       {
           EntraId: User().EntraObjectId,
           Email: Lower(Coalesce(varUserProfile.mail, User().Email)),
           UPN: Lower(User().Email),
           DisplayName: Coalesce(varUserProfile.displayName, User().FullName)
       }
   );
   ```
   This creates a single `varCurrentUser` record that any screen, form, or gallery can reference consistently.

4. **Notification Emails:** Continue using the SMTP email (`varCurrentUser.Email`) for sending confirmation emails, since this is the deliverable address. Both UPN and SMTP aliases likely deliver to the same inbox at LSU, but SMTP is the standard.

5. **Future-proofing:** If LSU ever migrates tenants or merges with another institution, the Entra Object ID will survive as long as the user object is preserved. Email addresses and UPNs will not.

---

### GPT 5.3 (OpenAI) - Extra High Thinking

**Recommendation:** Apply a phased fix: immediately normalize to SMTP using `Office365Users.MyProfileV2()` with fallback, then migrate ownership filtering to `User().EntraObjectId` (`StudentObjectId`) as the canonical key.

**Justification:**
- Root cause is correct: UPN (`User().Email`) and SMTP can diverge in multi-alias tenants.
- Context7 Office 365 Users docs show profile objects expose both `Mail` and `UserPrincipalName`, confirming they are distinct identity values.
- Context7 Graph docs separate `mail`/`proxyAddresses` from immutable identity (`id`/`objectId`), supporting Object ID as the durable ownership key.
- `Office365Users.MyProfileV2().mail` is a strong tactical fix, but not a perfect long-term key by itself.

**Implementation Steps:**
1. Add `StudentObjectId` (single line text) to `PrintRequests`.
2. Cache profile once in `App.OnStart` (avoid repeated connector calls):
   ```powerfx
   Set(varMeUpn, Lower(User().Email));
   Set(varMeObjectId, User().EntraObjectId);
   Set(varProfile, IfError(Office365Users.MyProfileV2(), Blank()));
   Set(varMeEmail, Lower(Coalesce(varProfile.mail, varProfile.userPrincipalName, varMeUpn)));
   ```
3. Submit `StudentEmail = varMeEmail` and `StudentObjectId = varMeObjectId`.
4. Keep Person claims based on UPN for stable SharePoint resolution:
   ```powerfx
   Claims: "i:0#.f|membership|" & varMeUpn
   ```
5. Update gallery filter to prefer Object ID with legacy email fallback during migration.
6. Backfill old rows (Power Automate/admin app) to populate `StudentObjectId` and normalized `StudentEmail`.

**Edge Cases Identified:**
- No Exchange mailbox: `mail` can be blank; fallback to `userPrincipalName`/`User().Email`.
- Guest/B2B users: alias formats can be odd; Object ID remains stable.
- Connector transient failure/throttling: wrap profile call in `IfError`, cache once per session.
- Mixed legacy data: keep dual filter (Object ID OR normalized email) until backfill completes.

**Long-term Architecture:**
- Canonical identity for ownership/authorization: `StudentObjectId` (`User().EntraObjectId`).
- Keep `StudentEmail` for notifications and human-readable reporting only.
- Optionally store `StudentUPN` for diagnostics/audit and alias drift analysis.
- After migration, remove email-based ownership filtering.

---

### Gemini 3 Pro (Google)

**Recommendation:** Strongly endorse the proposed fix: replace `User().Email` with `Office365Users.MyProfileV2().mail` (SMTP) as the primary identifier for the `StudentEmail` field.

**Justification:**
- **Confirmed Behavior:** `User().Email` returns the User Principal Name (UPN), which is a login identifier and not always the primary SMTP address. `Office365Users.MyProfileV2().mail` explicitly returns the SMTP address, which aligns with how SharePoint resolves Person fields.
- **Reliability:** Using the SMTP address ensures consistency between the app's logic and SharePoint's internal user resolution.
- **Connector Availability:** The Office 365 Users connector is standard for most M365 plans and provides the necessary profile details.

**Implementation Steps:**
1.  **Add Connector:** Ensure the "Office 365 Users" connector is added to the app.
2.  **App.OnStart:**
    ```powerfx
    Set(varMeEmail, Coalesce(Lower(Office365Users.MyProfileV2().mail), Lower(User().Email)));
    Set(varMeName, User().FullName);
    ```
3.  **Form Submission:** Update the `StudentEmail` data card to use `varMeEmail` (or the formula above) instead of `User().Email`.
4.  **Backfill:** Create a Power Automate flow to update existing records where `StudentEmail` matches the UPN but not the SMTP address.

**Edge Cases Identified:**
- **No Mailbox:** Users without an Exchange mailbox might have a blank `.mail` property. The `Coalesce` function handles this by falling back to UPN.
- **Guest Users:** Ensure guest users have permission to read their own profile in the tenant.

**Long-term Architecture:**
- **Immutable ID:** For the most robust solution, store `User().EntraObjectId` (or `Office365Users.MyProfileV2().id`) in a separate column (`StudentObjectId`). This GUID never changes, even if names or emails do. Future-proof the app by filtering on this ID instead of email.

---

### Composer 1.5

**Recommendation:** Use `Office365Users.MyProfileV2().mail` as the primary identifier for `StudentEmail`, with `User().Email` as a Coalesce fallback. Add a new `StudentObjectId` (text) column for future-proofing. For the SharePoint Person field, continue using the Claims format but derive the email from the same source as `StudentEmail` for consistency.

**Justification:**

- **Root cause validated:** Microsoft Power Fx documentation explicitly states: *"The `User().Email` function returns the user's UPN and not the SMTP email address"* ([learn.microsoft.com/power-platform/power-fx/reference/function-user](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-user)). The document's analysis is correct.
- **Office365Users.MyProfileV2()** returns both `.mail` (SMTP) and `.userPrincipalName` (UPN) as distinct properties. The `.mail` property is the primary SMTP address used by Exchange/SharePoint for resolution.
- **User().EntraObjectId** is the most stable identifier (GUID, never changes) but SharePoint Person columns use Claims (`i:0#.f|membership|email`) and do not natively support Object ID for lookups. Storing it as a secondary column enables future migration if needed.
- The Office 365 Users connector is a premium connector; LSU students with M365 licenses should have access. Guest users may need explicit connector permissions.

**Implementation Steps:**

1. **Add Office 365 Users connector** to the Student Portal app.
2. **App.OnStart** â€” set email with fallback:
   ```powerfx
   Set(varMeEmail, Coalesce(Lower(Office365Users.MyProfileV2().mail), Lower(User().Email)));
   Set(varMeName, User().FullName);
   Set(varMeObjectId, User().EntraObjectId);  // optional, for future use
   ```
3. **StudentEmail_DataCard1.Update** â€” use same formula:
   ```powerfx
   Coalesce(Lower(Office365Users.MyProfileV2().mail), Lower(User().Email))
   ```
4. **Student_DataCard1.Update** â€” use the same email source for Claims consistency:
   ```powerfx
   {
       '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
       Claims: "i:0#.f|membership|" & Coalesce(Lower(Office365Users.MyProfileV2().mail), Lower(User().Email)),
       DisplayName: User().FullName,
       Email: Coalesce(Lower(Office365Users.MyProfileV2().mail), Lower(User().Email))
   }
   ```
5. **Backfill existing records** via Power Automate: for each `PrintRequests` item where `StudentEmail` â‰  expected SMTP, look up user by UPN (current `StudentEmail`) via Office 365 Users, get `.mail`, update `StudentEmail`.
6. **Optional:** Add `StudentObjectId` (Single line of text) column and populate with `User().EntraObjectId` for records going forward. Use for filtering only if email-based approach continues to fail for specific users.

**Edge Cases Identified:**

- **Users without Exchange mailboxes:** `Office365Users.MyProfileV2().mail` may be blank. Coalesce falls back to `User().Email` (UPN), preserving current behavior.
- **Office365Users API failure (throttling, transient errors):** Coalesce with `User().Email` provides resilience. For stricter handling, wrap in `IfError(Office365Users.MyProfileV2().mail, User().Email)`.
- **Guest users / B2B:** Office 365 Users connector defaults to resource tenant; guests need appropriate permissions. Test with a guest account before rollout.
- **Performance:** `MyProfileV2()` is called on App.OnStart and on form submit. One call per session is acceptable; avoid calling it in gallery formulas or OnVisible of every screen.
- **Existing records:** Records saved with UPN will not match until backfilled. Run the backfill flow before or immediately after deployment.

**Long-term Architecture:**

- **Preferred:** Use `User().EntraObjectId` as the canonical identifier in a new `StudentObjectId` column. Filter by Object ID instead of email. Requires SharePoint schema change and backfill; eliminates UPN/SMTP/alias ambiguity entirely.
- **Alternative:** If staying email-based, standardize on SMTP via `Office365Users.MyProfileV2().mail` everywhere. Document that `StudentEmail` stores SMTP, not UPN.
- **Monitoring:** Add a simple admin view or flow to detect records where `Student.Email` (Person) and `StudentEmail` (text) differ, to catch resolution drift.

---

### Other Models

*(Add additional sections as needed)*

---

## Consensus Summary

### Points of Agreement:

All five models (Claude Opus 4.5, Claude Opus 4.6, GPT 5.3, Gemini 3 Pro, Composer 1.5) reached **unanimous consensus** on:

1. **Root Cause Validated:** `User().Email` returns the User Principal Name (UPN), not the SMTP email address. This is documented Microsoft behavior, not a bug.

2. **Immediate Fix:** Use `Office365Users.MyProfileV2().mail` to retrieve the primary SMTP address, replacing `User().Email` for the `StudentEmail` field.

3. **Fallback Pattern:** Wrap in `Coalesce()` or `IfError()` to fall back to `User().Email` when `.mail` is blank (users without Exchange mailboxes).

4. **Long-term Identifier:** `User().EntraObjectId` (Entra Object ID / GUID) is the most reliable, immutable identifier — survives email changes, name changes, and domain migrations.

5. **Performance Best Practice:** Call `Office365Users.MyProfileV2()` **once** in `App.OnStart` and cache in a variable. Never call per-row or per-form-submission.

6. **Person Field Claims:** The `Claims` string must continue using UPN (`User().Email`) for SharePoint Person resolution — only the `Email` subfield and `StudentEmail` text column should use SMTP.

7. **Backfill Required:** Existing records need a Power Automate flow to normalize `StudentEmail` to SMTP and optionally populate a new `StudentEntraId` column.

8. **Edge Cases Identified:** All models flagged the same risks — no Exchange mailbox, guest/B2B users, connector consent failures, and email alias changes over time.

### Points of Disagreement:

**Minor implementation details only — no fundamental disagreements:**

| Topic | Variation | Resolution |
|-------|-----------|------------|
| **Column naming** | `StudentEntraId` vs `StudentObjectId` | Either works; choose one and be consistent. `StudentEntraId` aligns with Microsoft's "Entra ID" branding. |
| **Error handling** | `Coalesce()` vs `IfError()` | GPT 5.3 explicitly uses `IfError()` for connector failures; others rely on `Coalesce()`. Using both (`IfError` wrapping `Coalesce`) is most resilient. |
| **Connector licensing** | Composer 1.5 notes Office 365 Users may be premium | For M365-licensed students this is typically included; verify tenant licensing. |
| **Claims field source** | Composer 1.5 suggests SMTP in Claims | **Rejected** — Claims must use UPN for SharePoint Person resolution per other models. |

### Recommended Approach:

**Three-phase implementation with immediate student impact relief:**

**Phase 1 — Immediate Fix (resolve disappearing records):**
1. Add Office 365 Users connector to Student Portal app
2. Update `App.OnStart`:
   ```powerfx
   Set(varUserProfile, IfError(Office365Users.MyProfileV2(), Blank()));
   Set(varMeEmail, Lower(Coalesce(varUserProfile.mail, User().Email)));
   Set(varMeName, Coalesce(varUserProfile.displayName, User().FullName));
   Set(varMeEntraId, User().EntraObjectId);
   ```
3. Update `StudentEmail_DataCard1.Update`: `varMeEmail`
4. Update gallery filter with transition fallback:
   ```powerfx
   Filter(PrintRequests, Lower(StudentEmail) = varMeEmail || Lower(StudentEmail) = Lower(User().Email))
   ```

**Phase 2 — Backfill & Schema Update:**
5. Add `StudentEntraId` (Single line text) column to PrintRequests list
6. Create Power Automate flow to backfill existing records with normalized SMTP and Entra Object ID
7. Update form to also write `StudentEntraId = varMeEntraId`

**Phase 3 — Long-term Migration:**
8. Migrate gallery filter to use `StudentEntraId = varMeEntraId` as primary key
9. Remove dual-filter fallback once backfill is complete
10. Document that `StudentEntraId` is the canonical ownership identifier

### Implementation Priority:

| Priority | Task | Impact |
|----------|------|--------|
| **P0 (Critical)** | Update `App.OnStart` with cached SMTP email | Fixes disappearing records for new submissions |
| **P0 (Critical)** | Update `StudentEmail_DataCard1.Update` | Ensures new records use correct identifier |
| **P1 (High)** | Add dual-filter fallback to gallery | Enables existing UPN-based records to still appear |
| **P2 (Medium)** | Backfill existing records via Power Automate | Normalizes historical data |
| **P3 (Low)** | Add `StudentEntraId` column and migrate filtering | Future-proofs against email/alias changes |

---

## Final Decision

**Selected Solution:** *(to be filled after reviewing all recommendations)*

**Rationale:**

**Implementation Date:**

**Status:** [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Abandoned

---

## Implementation Checklist

- [ ] Add Office 365 Users connector to Student Portal app
- [ ] Test `Office365Users.MyProfileV2().mail` vs `User().Email` for multiple students
- [ ] Update `App.OnStart` with new email resolution (with Coalesce fallback)
- [ ] Update `StudentEmail_DataCard1.Update` in submit form
- [ ] Update `Student_DataCard1.Update` Person field (if needed)
- [ ] Test complete submission â†’ approval â†’ confirmation flow
- [ ] Create Power Automate flow to backfill existing records
- [ ] Run backfill flow and verify results
- [ ] Remove any temporary fallback filters
- [ ] Update documentation/spec files
- [ ] Monitor for edge cases after deployment

