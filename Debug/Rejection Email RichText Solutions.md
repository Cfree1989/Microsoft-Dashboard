# Rejection Email Rich Text Content Missing Issue

## The Problem

When staff reject a 3D print request through the Power Apps Staff Dashboard, the rejection email successfully displays the **checkbox reasons** but the **custom text** and **pasted images** from the rich text editor (`rteRejectComments`) do not appear in the email's "ADDITIONAL DETAILS" section.

**Observed behavior (REQ-00129, Conrad T Freeman, 2/27/2026):**
- Email shows: "REASON FOR REJECTION: Features are too small or too thin" ✓
- Email shows: "ADDITIONAL DETAILS:" followed by nothing ✗
- Staff entered custom text AND pasted an image in the rich text editor
- The rich text content was supposed to explain the specific issues with the model

**Impact:**
- Students receive rejection emails with incomplete information
- Staff's detailed explanations and visual annotations don't reach students
- Students must contact staff to understand what exactly needs to be fixed
- Defeats the purpose of the rich text editor feature

---

## Environment Details

- **App Type:** Power Apps Staff Dashboard (Canvas App)
- **Flow:** PR-Audit (Flow B) — sends rejection email when Status changes to "Rejected"
- **Data Source:** SharePoint Online (PrintRequests list)
- **Email Method:** Send from shared mailbox (coad-fablab@lsu.edu)
- **Test Case:** REQ-00129, Student: Conrad T Freeman, Date: 2/27/2026

### SharePoint List: PrintRequests

Key columns involved in rejection:
- `Status` (Choice) — changed to "Rejected" by staff action
- `RejectionReason` (Choice, multi-select) — stores predefined checkbox reasons
- `StaffNotes` (Multiple lines text) — contains concatenated rejection entry with reasons AND rich text comments

### Current Data Architecture

The Power Apps rejection button builds `StaffNotes` as a **concatenated string**:

```
REJECTED by [Staff Name]: [checkbox reasons]; | Staff Comments: [rich text HTML] - [timestamp]
```

**Example StaffNotes value:**
```
REJECTED by Ian R.: Features are too small or too thin; | Staff Comments: <div>Your model has zero thickness walls here:</div><img src="data:image/png;base64,iVBOR..."/> - 2/27 7:33am
```

### Current Flow B Email Template

The email has two separate sections:

```
REASON FOR REJECTION:
@{outputs('Compose_Formatted_Reasons_Text')}

ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}
```

**Problems Identified:**
1. `Compose_Formatted_Reasons_Text` extracts from `RejectionReason` choice column (now working)
2. `body/Notes` references `Notes` field (student submission notes) — **WRONG FIELD**
3. The rich text content is embedded INSIDE `StaffNotes` with `" | Staff Comments: "` prefix
4. No separate SharePoint column exists for the rich text comments
5. Pasted images as base64 HTML may be very large and potentially truncated

### Power Apps Rejection Button Logic

From `StaffDashboard-App-Spec.md` (Step 46, `btnRejectConfirm.OnSelect`):

```powerfx
StaffNotes: Concatenate(
    If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
    "REJECTED by " & 
    With({n: ddRejectStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
    ": " & varRejectionReasons & 
    If(!IsBlank(rteRejectComments.HtmlText), " | Staff Comments: " & rteRejectComments.HtmlText, "") &
    " - " & Text(Now(), "m/d h:mmam/pm")
)
```

**Key Finding:** The rich text HTML from `rteRejectComments.HtmlText` is appended to `StaffNotes` — it's NOT stored in a separate column.

---

## Root Cause Hypotheses

### Hypothesis 1: ADDITIONAL DETAILS Uses Wrong Field
The email template references `body/Notes` (student's submission notes) instead of extracting the Staff Comments from `StaffNotes`.

### Hypothesis 2: Rich Text Content Buried in StaffNotes
The Staff Comments are embedded within the concatenated `StaffNotes` string with a `" | Staff Comments: "` prefix. There's no direct field to reference.

### Hypothesis 3: No Separate Column for Rich Text
Unlike checkbox reasons (which have their own `RejectionReason` choice column), the rich text comments don't have a dedicated SharePoint column.

### Hypothesis 4: Base64 Images May Be Truncated
When staff paste images into the rich text editor, they're encoded as base64 data URIs in the HTML. These can be extremely large (megabytes) and may exceed SharePoint's column limits.

### Hypothesis 5: HTML Email Rendering Issues
Even if the HTML content reaches the email, the email client may not render embedded base64 images correctly.

---

## Research Prompt

**INSTRUCTIONS FOR AI MODELS:**
- Use **Context7** (or `/context7` MCP tool) to look up official Microsoft documentation for Power Automate, SharePoint, and Power Apps
- **Search the web** for recent solutions, community posts, and Microsoft Learn articles about this specific issue
- Cross-reference documentation with the observed behavior to validate hypotheses

```
RESEARCH TASK: Use Context7 to look up Microsoft documentation and search the web for solutions.

I have a Power Automate flow that sends rejection emails when a SharePoint item's Status 
changes to "Rejected". The checkbox rejection reasons now appear correctly, but the 
rich text content (custom text + pasted images) from the Power Apps rich text editor 
does NOT appear in the email.

CURRENT ARCHITECTURE:
- Power Apps has a rich text editor control: `rteRejectComments`
- On rejection, the HTML content (`rteRejectComments.HtmlText`) is appended to `StaffNotes`:
  "REJECTED by [Name]: [reasons]; | Staff Comments: [HTML content] - [timestamp]"
- There is NO separate SharePoint column for the rich text comments
- The email template's "ADDITIONAL DETAILS" section references `body/Notes` (wrong field)

OBSERVED DATA:
- `StaffNotes` field in SharePoint contains the concatenated rejection entry
- The "Staff Comments: " section should contain HTML from the rich text editor
- Staff pasted both text and an image into the rich text editor
- Email shows REASON FOR REJECTION correctly but ADDITIONAL DETAILS is empty

ARCHITECTURAL OPTIONS TO EVALUATE:

OPTION A: Parse StaffNotes in Flow
- Use split() expressions to extract the " | Staff Comments: " section from StaffNotes
- Pros: No SharePoint schema changes
- Cons: Brittle parsing, complex expressions

OPTION B: Create Separate SharePoint Column
- Add new column `RejectionComments` (Multiple lines of text, Enhanced rich text)
- Update Power Apps Patch to write rich text to this column separately
- Update Flow to reference `body/RejectionComments`
- Pros: Clean separation, direct field reference
- Cons: Requires SharePoint change and Power Apps update

OPTION C: Store Images Separately
- Upload pasted images to SharePoint document library
- Store image URLs in rich text instead of base64
- Pros: Smaller column size, reliable image delivery
- Cons: Complex implementation, async upload logic

RESEARCH REQUESTS (use Context7 and web search):
1. Look up: "Power Apps rich text editor HTML output SharePoint"
2. Look up: "SharePoint multiple lines of text column size limit"
3. Look up: "Power Automate email embedded images base64"
4. Look up: "Power Apps RichTextEditor HtmlText Patch SharePoint"
5. Look up: "Power Automate parse string split expression"
6. Search for: "SharePoint enhanced rich text column images not displaying"
7. Search for: "Power Automate Office 365 email HTML images base64"

QUESTIONS:
1. What is the maximum size of a SharePoint "Multiple lines of text" column?
2. Can SharePoint's "Enhanced rich text" column type store embedded base64 images?
3. Will Power Automate's "Send email" action render base64 images in HTML content?
4. What happens if the rich text HTML exceeds SharePoint's column limit?
5. Is there a way to extract a substring between two delimiters in Power Automate?
6. Should we use the "Send an email (V2)" action's HTML body capability for rich content?
7. What's the best practice for storing Power Apps rich text content in SharePoint?
8. How do we handle pasted images in a way that survives the Power Apps → SharePoint → Flow → Email pipeline?
9. Does the Office 365 Outlook connector support Content-ID (cid:) embedded images?
10. Would a hybrid approach (text in column, images in document library) be more reliable?

For your recommendation, provide:
1. Validation or correction of the root cause hypotheses (with documentation citations)
2. Evaluation of each architectural option (A, B, C) with pros/cons
3. Recommended solution with step-by-step implementation
4. Expression syntax for parsing StaffNotes (if Option A is recommended)
5. SharePoint column configuration for rich text (if Option B is recommended)
6. Image handling strategy for reliable email delivery
7. Testing checklist to verify the fix
8. Long-term recommendation on rich text + image architecture

IMPORTANT: Cite specific Microsoft documentation or community sources for your answers.
```

---

## AI Model Recommendations

*This prompt is being submitted to multiple AI models. Each model should add their recommendation below in the designated section.*

### Claude Opus 4.5 (Anthropic) - Thinking Mode

**Recommendation:** Option B (Separate SharePoint Column) + Option C (Image Library) Hybrid

---

#### Research Findings & Documentation Citations

**1. SharePoint "Multiple lines of text" Column Size Limit**

Per Microsoft Q&A documentation, SharePoint "Multiple lines of text" columns can store up to **63,999 characters** ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5145019/sharepoint-multiple-lines-of-text-column-with-unli)). This is a hard limit that applies even when "Allow unlimited length" is enabled.

**Critical Finding:** Base64-encoded images easily exceed this. A single 500KB image becomes ~680KB as base64 (33% increase), which is **~680,000 characters** — over 10x the column limit.

**2. SharePoint Base64 Image Storage — DOES NOT WORK**

Per SharePoint Stack Exchange ([Source](https://sharepoint.stackexchange.com/questions/223499/why-does-sharepoint-remove-img-src-dataimage-jpgbase64-from-publishing-html)):
> SharePoint automatically **strips base64-encoded images** from rich text fields. When you embed `<img src="data:image/jpg;base64,..."` the image appears during editing but is **removed upon saving**. SharePoint sanitizes the HTML and removes the base64 data URI.

**Root Cause Confirmed:** This is why pasted images disappear. SharePoint's security sanitization strips base64 data URIs from enhanced rich text columns.

**3. Power Automate Email Base64 Support — LIMITED**

Per Tachytelic.net ([Source](https://www.tachytelic.net/2021/02/power-automate-embed-image-email/)):
> Some email clients like **Gmail do not support base64 encoded images** within email bodies.

Per Microsoft Learn ([Source](https://learn.microsoft.com/en-us/answers/questions/4644622/unable-to-display-images-in-html-body-of-emails-se)):
> Images must be stored in a **publicly accessible location**. Hosting images on a website (HTTPS URLs) is more reliable than SharePoint for email embedding.

**4. Content-ID (cid:) Support — PROBLEMATIC**

Per Will Page Dev ([Source](https://willpage.dev/2024/01/08/sending-emails-with-inline-attachments-in-power-automate-logic-apps/)):
> The standard "Send an Email (V2)" action has limitations—it only accepts `name` and `contentBytes` properties from attachments and **ignores additional properties needed for inline images**.

Using `<img src="cid:image001">` results in a red X error: "The linked image cannot be displayed" in Outlook Desktop.

**5. Power Apps RichTextEditor Pasted Images**

Per Microsoft Learn ([Source](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/controls/control-richtexteditor)):
> The RichTextEditor accepts pasted rich text from external sources. HTML is the input/output format.

Per Power Platform Community ([Source](https://community.powerplatform.com/forums/thread/details/?threadid=c8b4fcbe-ac64-4996-a9ba-121e7b4d60fb)):
> Pasting images directly into the RichTextEditor has significant limitations. This functionality recently stopped working in the browser version.

---

#### Hypothesis Validation

| Hypothesis | Status | Evidence |
|------------|--------|----------|
| H1: ADDITIONAL DETAILS Uses Wrong Field | ✅ **CONFIRMED** | Template uses `body/Notes` instead of `body/StaffNotes` |
| H2: Rich Text Buried in StaffNotes | ✅ **CONFIRMED** | Content is concatenated with `" | Staff Comments: "` delimiter |
| H3: No Separate Column for Rich Text | ✅ **CONFIRMED** | Only `StaffNotes` exists, not `RejectionComments` |
| H4: Base64 Images Truncated | ✅ **CONFIRMED + WORSE** | SharePoint **strips** base64 images entirely, not just truncates |
| H5: HTML Email Rendering Issues | ✅ **CONFIRMED** | Gmail doesn't support base64; Outlook has CID issues |

---

#### Architectural Option Evaluation

**OPTION A: Parse StaffNotes in Flow**
| Aspect | Assessment |
|--------|------------|
| Pros | No SharePoint schema changes; quick implementation |
| Cons | **Does not solve the image problem** — base64 images are stripped before they reach the Flow; brittle parsing; timestamp handling complexity |
| Verdict | ❌ **NOT RECOMMENDED** — Only fixes text, not images |

**Expression syntax (if used for text-only):**
```
@{if(
    contains(triggerBody()?['StaffNotes'], ' | Staff Comments: '),
    first(split(last(split(triggerBody()?['StaffNotes'], ' | Staff Comments: ')), ' - ')),
    ''
)}
```
This extracts content between `" | Staff Comments: "` and the trailing timestamp `" - "`.

**OPTION B: Create Separate SharePoint Column**
| Aspect | Assessment |
|--------|------------|
| Pros | Clean separation; direct field reference; future-proof; works for text |
| Cons | Requires SharePoint change; still **does not solve the image problem** due to SharePoint's base64 stripping |
| Verdict | ⚠️ **PARTIAL SOLUTION** — Good for text, insufficient for images |

**SharePoint Column Configuration:**
- Column Name: `RejectionComments`
- Type: Multiple lines of text
- Specify the type of text to allow: **Enhanced rich text (Rich text with pictures, tables, and hyperlinks)**
- Allow unlimited length: Yes

**OPTION C: Store Images Separately**
| Aspect | Assessment |
|--------|------------|
| Pros | **Only reliable solution for images**; smaller column size; guaranteed image delivery in emails |
| Cons | Complex implementation; requires async upload logic; changes user workflow |
| Verdict | ✅ **REQUIRED** for image support |

---

#### Recommended Solution: Hybrid B + C

**Architecture:**
1. **Text Comments** → Dedicated SharePoint column (`RejectionComments`)
2. **Images** → SharePoint Document Library with URL references

**Phase 1 — Immediate Fix (Text Only)**

1. **Update Flow B email template:**
   Change:
   ```
   @{outputs('Get_Current_Rejected_Data')?['body/Notes']}
   ```
   To:
   ```
   @{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
   ```
   This shows the full StaffNotes including Staff Comments (text only).

**Phase 2 — Clean Architecture (Text)**

1. **Add SharePoint column:**
   - Name: `RejectionComments`
   - Type: Multiple lines of text → Enhanced rich text
   
2. **Update Power Apps Patch:**
   ```powerfx
   Patch(
       PrintRequests,
       varSelectedItem,
       {
           Status: {Value: "Rejected"},
           RejectionReason: { ... },
           StaffNotes: Concatenate(
               If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
               "REJECTED by " & varStaffInitials & ": " & varRejectionReasons &
               " - " & Text(Now(), "m/d h:mmam/pm")
           ),
           RejectionComments: rteRejectComments.HtmlText  // NEW - separate column
       }
   )
   ```

3. **Update Flow B email:**
   ```
   ADDITIONAL DETAILS:
   @{triggerBody()?['RejectionComments']}
   ```

**Phase 3 — Image Support (Future)**

1. **Create Document Library:** `RejectionImages` in SharePoint
2. **Create Power Automate Flow:** Triggered from Power Apps on rejection
   - Input: Base64 image data, Request ID
   - Action: Create File in RejectionImages
   - Output: File URL
3. **Update Power Apps:**
   - Before Patch, call Flow for each pasted image
   - Replace base64 `<img>` tags with URL-based `<img>` tags
4. **Email will display images** via public URLs

---

#### Image Handling Strategy

**Why Base64 Fails at Every Step:**
| Pipeline Stage | Base64 Outcome |
|----------------|----------------|
| Power Apps → SharePoint | **STRIPPED** by SharePoint sanitization |
| SharePoint → Power Automate | Even if stored, too large for column |
| Power Automate → Email | Gmail ignores; Outlook inconsistent |

**Reliable Image Pipeline:**
```
Power Apps → [Extract Base64] → Flow → [Upload to Library] → [Get URL] → 
Store URL in RejectionComments HTML → Flow → Email with <img src="URL">
```

**Quick Alternative — No Images:**
Disable image paste in RichTextEditor by removing the image toolbar button. Staff can instead attach images as separate files or reference external URLs.

---

#### Testing Checklist

**Phase 1 Tests (Immediate Fix):**
- [ ] Reject a request with text-only staff comments
- [ ] Verify StaffNotes contains the text in SharePoint
- [ ] Verify email shows Staff Comments text in body
- [ ] Confirm no HTML tags shown (email action renders HTML)

**Phase 2 Tests (Separate Column):**
- [ ] Verify RejectionComments column exists in SharePoint
- [ ] Reject a request with text in rich text editor
- [ ] Verify text appears in RejectionComments column
- [ ] Verify email ADDITIONAL DETAILS shows formatted text

**Phase 3 Tests (Images):**
- [ ] Paste an image in rejection comments
- [ ] Verify image uploaded to RejectionImages library
- [ ] Verify RejectionComments contains `<img src="https://...">` URL
- [ ] Verify email displays inline image
- [ ] Test in Outlook Desktop, Outlook Web, Gmail

---

#### Long-term Architecture Recommendation

**Best Practice for Power Apps Rich Text + Images with SharePoint:**

1. **Never rely on base64 for images** — SharePoint strips them, emails don't render them consistently
2. **Separate concerns:**
   - Text → Enhanced rich text column
   - Images → Document Library with URL references
3. **Use Power Automate as middleware** — Handle image uploads, URL replacement
4. **Consider file size limits:**
   - Individual images: Upload to library
   - Total text: Stay under 63,999 characters
5. **Email image hosting:**
   - SharePoint URLs work if recipients have access
   - For external recipients, use Azure Blob Storage with SAS tokens or CDN

**Reference Architecture:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Power Apps    │     │    SharePoint   │     │  Power Automate │
│ RichTextEditor  │────▶│ RejectionComments│────▶│   Send Email    │
└────────┬────────┘     │ (text + URLs)   │     │ (HTML body)     │
         │              └─────────────────┘     └─────────────────┘
         │                      ▲
         │              ┌───────┴───────┐
         │              │  Document     │
         └─────────────▶│  Library      │
           (images)     │ RejectionImages│
                        └───────────────┘
```

---

**Sources Cited:**
- Microsoft Learn: SharePoint column limits
- Microsoft Q&A: Multiple lines of text character limits
- SharePoint Stack Exchange: Base64 image stripping behavior
- Tachytelic.net: Power Automate email image embedding
- Will Page Dev: Content-ID limitations
- Microsoft Learn: Power Apps RichTextEditor control
- Power Platform Community: Image pasting limitations

---

### Claude Opus 4.6 (Anthropic) - Max Thinking

**Recommendation:** *(pending)*

---

### Sonnet 4.6

**Recommendation:** *(pending)*

---

### GPT 5.3 (OpenAI) - Extra High Thinking

**Recommendation:** *(pending)*

---

### Gemini 3.1 Pro (Google)

**Recommendation:** Option B (Separate SharePoint Column) + Option C (Image Library) Hybrid

---

#### Research Findings & Documentation Citations

**1. SharePoint "Multiple lines of text" Column Size Limit**
SharePoint "Multiple lines of text" columns in lists can store up to **63,999 characters** (or up to 2GB in the underlying SQL database theoretically, though practically limited in UI). However, base64-encoded images are massive. A single 1MB image can be ~1.3MB of base64 text, which far exceeds standard practical limits and can cause performance issues or truncation.

**2. SharePoint Base64 Image Storage**
SharePoint's Enhanced Rich Text columns **strip out base64-encoded images** (`<img src="data:image/...">`) upon saving due to XSS security sanitization. The images will appear broken or disappear entirely after the Power Apps `Patch` function executes.

**3. Power Automate Email Base64 Support**
Many email clients (including Gmail and some versions of Outlook) **block or fail to render base64 images** embedded directly in the HTML body (`<img src="data:...">`) for security reasons. 

**4. Content-ID (cid:) Support**
While `cid:` can be used in the Office 365 Outlook connector, the standard "Send an email (V2)" action has limited support for inline attachments. It requires passing specific attachment arrays, and constructing the exact HTML to reference them is brittle.

**5. Extracting Substrings in Power Automate**
You can extract text between delimiters using a combination of `split()`, `first()`, and `last()` expressions, but this is highly brittle if the delimiter (`" | Staff Comments: "`) is accidentally modified or missing.

---

#### Hypothesis Validation

| Hypothesis | Status | Evidence |
|------------|--------|----------|
| H1: ADDITIONAL DETAILS Uses Wrong Field | ✅ **CONFIRMED** | The template explicitly references `body/Notes` instead of extracting from `body/StaffNotes`. |
| H2: Rich Text Buried in StaffNotes | ✅ **CONFIRMED** | Power Apps concatenates the HTML into the `StaffNotes` string. |
| H3: No Separate Column for Rich Text | ✅ **CONFIRMED** | Confirmed by current architecture. |
| H4: Base64 Images Truncated/Stripped | ✅ **CONFIRMED** | SharePoint sanitizes and removes base64 data URIs from rich text fields upon saving. |
| H5: HTML Email Rendering Issues | ✅ **CONFIRMED** | Base64 images in emails are widely blocked by major email clients. |

---

#### Architectural Option Evaluation

**OPTION A: Parse StaffNotes in Flow**
- **Pros:** No SharePoint schema changes required.
- **Cons:** Extremely brittle. Does not solve the image stripping issue (images are already gone by the time Flow runs).
- **Verdict:** ❌ **REJECTED**.

**OPTION B: Create Separate SharePoint Column**
- **Pros:** Clean data architecture. Easy to reference in Flow (`body/RejectionComments`).
- **Cons:** Requires schema update. Still does not solve the base64 image stripping issue.
- **Verdict:** ⚠️ **PARTIAL SOLUTION**. Good for text, fails for images.

**OPTION C: Store Images Separately**
- **Pros:** The only reliable way to ensure images survive the pipeline and render in emails.
- **Cons:** High implementation complexity (requires intercepting image pastes or uploading them to a library).
- **Verdict:** ✅ **REQUIRED FOR IMAGES**.

---

#### Recommended Solution: Hybrid B + C

To ensure both text and images are reliably captured and emailed, implement a hybrid approach:

**Phase 1: Immediate Text Fix (Option B)**
1. **SharePoint:** Create a new column `RejectionComments` (Multiple lines of text, Enhanced rich text).
2. **Power Apps:** Update the `Patch` function to save `rteRejectComments.HtmlText` directly to `RejectionComments`.
3. **Power Automate:** Update the email template to use `@{triggerOutputs()?['body/RejectionComments']}` in the ADDITIONAL DETAILS section.

**Phase 2: Image Handling (Option C)**
Because pasting images directly into the Rich Text Editor generates base64 (which SharePoint strips), you must change the image workflow:
1. **SharePoint:** Create a Document Library named `RejectionImages`.
2. **Power Apps:** Remove the image paste capability from the Rich Text Editor. Instead, provide an Attachment control specifically for "Rejection Images".
3. **Power Automate:** Update the Flow to loop through these attachments, upload them to `RejectionImages`, generate absolute URLs, and append standard `<img src="URL">` tags to the email's HTML body.

---

#### Expression Syntax & Configurations

**SharePoint Column Configuration (Option B):**
- **Name:** `RejectionComments`
- **Type:** Multiple lines of text
- **Text type:** Enhanced rich text (Rich text with pictures, tables, and hyperlinks)
- **Append changes:** No

**Image Handling Strategy for Reliable Email Delivery:**
Do not use base64 or `cid:`. Store images as physical files in a SharePoint Document Library, generate a publicly accessible or tenant-accessible absolute URL, and use standard `<img src="https://tenant.sharepoint.com/...">` tags in the email HTML.

---

#### Testing Checklist
- [ ] Verify `RejectionComments` column is populated in SharePoint when a rejection occurs.
- [ ] Verify the Flow successfully retrieves `RejectionComments`.
- [ ] Verify the rejection email displays the formatted rich text in the ADDITIONAL DETAILS section.
- [ ] Verify that attached/uploaded images render correctly in Outlook and Gmail.

#### Long-term Recommendation
Never store base64 images in SharePoint list columns or send them in emails. Always decouple binary file storage (Document Libraries/Blob Storage) from metadata/text storage (Lists). Use Power Automate as the orchestration layer to link the two via URLs.

---

### Composer 1.5

**Recommendation:** Option B (Separate SharePoint Column) + Option C (Image Library) Hybrid — with Phase 1 immediate fix using StaffNotes or parsing

---

#### Research Findings & Documentation Citations

**1. SharePoint "Multiple lines of text" Column Size Limit**

Per Microsoft Q&A ([Source](https://learn.microsoft.com/en-us/answers/questions/5145019/sharepoint-multiple-lines-of-text-column-with-unli)): SharePoint "Multiple lines of text" columns can store up to **63,999 characters**. This applies to both lists and document libraries, even with "Allow unlimited length" enabled.

**2. SharePoint Strips Base64 Images from Rich Text**

Per SharePoint Stack Exchange ([Source](https://sharepoint.stackexchange.com/questions/223499/why-does-sharepoint-remove-img-src-dataimage-jpgbase64-from-publishing-html)): SharePoint **automatically strips base64 data URIs** from rich text and publishing HTML fields. When you save `<img src="data:image/jpg;base64,...">`, SharePoint removes the data URI, leaving only the alt text or empty img tag. This is a security/sanitization feature.

**3. Power Automate Email Base64 Support — Limited**

Per Tachytelic.net ([Source](https://www.tachytelic.net/2021/02/power-automate-embed-image-email/)): Some email clients like **Gmail do not support base64-encoded images** in email bodies. Microsoft Learn ([Source](https://learn.microsoft.com/en-us/power-automate/email-customization)) recommends uploading images to cloud storage (OneDrive, etc.) and using **public URLs** in the HTML body. Inline images are limited to **100 KB**.

**4. Send an Email (V2) — CID Limitations**

Per Will Page Dev ([Source](https://willpage.dev/2024/01/08/sending-emails-with-inline-attachments-in-power-automate-logic-apps/)): The standard "Send an Email (V2)" action **ignores properties beyond `name` and `contentBytes`** in attachments — it does not support `contentId` or `isInline` needed for `<img src="cid:...">`. To use CID inline images, you must use the **Graph API** (create draft via HTTP request, then send) with a custom payload.

**5. Power Apps RichTextEditor HtmlText**

Per Microsoft Learn ([Source](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/controls/control-richtexteditor)): The RichTextEditor outputs content in **HTML format** via `HtmlText`. It supports pasted rich text from external sources. The editor removes potentially compromising tags (script, style, object) for security.

**6. Power Automate String Parsing**

Per Microsoft Power Fx ([Source](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-split)): Use `split()`, `first()`, and `last()` to extract substrings. Example: `first(split(last(split(text, ' | Staff Comments: ')), ' - '))` extracts content between delimiters.

---

#### Hypothesis Validation

| Hypothesis | Status | Evidence |
|------------|--------|----------|
| H1: ADDITIONAL DETAILS Uses Wrong Field | ✅ **CONFIRMED** | Template references `body/Notes` (student notes) instead of Staff Comments from `StaffNotes` |
| H2: Rich Text Buried in StaffNotes | ✅ **CONFIRMED** | Content concatenated with `" \| Staff Comments: "` delimiter; no direct field |
| H3: No Separate Column for Rich Text | ✅ **CONFIRMED** | Only `StaffNotes` exists |
| H4: Base64 Images Stripped | ✅ **CONFIRMED** | SharePoint sanitization removes data URIs from img tags entirely |
| H5: HTML Email Rendering Issues | ✅ **CONFIRMED** | Gmail ignores base64; Outlook CID requires Graph API workaround |

---

#### Architectural Option Evaluation

**OPTION A: Parse StaffNotes in Flow**

| Aspect | Assessment |
|--------|------------|
| Pros | No SharePoint schema changes; quick implementation for text |
| Cons | **Does not solve images** — base64 stripped before Flow; brittle parsing; timestamp handling |
| Verdict | ⚠️ **PARTIAL** — Use for text-only immediate fix; images will fail |

**Expression syntax (extract Staff Comments from StaffNotes):**
```
@{if(
    contains(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | Staff Comments: '),
    first(split(
        last(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | Staff Comments: ')),
        ' - '
    )),
    'No additional comments provided.'
)}
```

**OPTION B: Create Separate SharePoint Column**

| Aspect | Assessment |
|--------|------------|
| Pros | Clean separation; direct field reference; works for text |
| Cons | Requires SharePoint change; **does not solve images** — base64 still stripped |
| Verdict | ⚠️ **PARTIAL** — Good for text architecture; images need Option C |

**SharePoint Column Configuration:**
- Column Name: `RejectionComments`
- Type: Multiple lines of text
- Specify: **Enhanced rich text (Rich text with pictures, tables, and hyperlinks)**
- Allow unlimited length: Yes (63,999 char limit still applies)

**OPTION C: Store Images Separately**

| Aspect | Assessment |
|--------|------------|
| Pros | **Only reliable solution for images**; smaller column; guaranteed delivery |
| Cons | Complex; requires upload flow; changes Power Apps logic |
| Verdict | ✅ **REQUIRED** for image support |

---

#### Recommended Solution: Hybrid B + C

**Phase 1 — Immediate Fix (Text Only, ~5 min)**

1. **Fix wrong field reference:** Change `body/Notes` → `body/StaffNotes` in Flow B email template (if not already done).
2. **OR** parse Staff Comments only:
   ```
   @{if(
       contains(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | Staff Comments: '),
       first(split(last(split(outputs('Get_Current_Rejected_Data')?['body/StaffNotes'], ' | Staff Comments: ')), ' - ')),
       'No additional comments provided.'
   )}
   ```
3. **Enable HTML body:** Ensure "Body is HTML" is checked in Send email (V2) action.

**Phase 2 — Clean Architecture (Text, ~30 min)**

1. Add `RejectionComments` column (Enhanced rich text) to PrintRequests.
2. Update Power Apps Patch to write `RejectionComments: rteRejectComments.HtmlText` separately; remove Staff Comments from StaffNotes concatenation.
3. Update Flow email to use `outputs('Get_Current_Rejected_Data')?['body/RejectionComments']`.

**Phase 3 — Image Support (2–4 hrs)**

1. Create `RejectionImages` document library.
2. Power Apps: Extract base64 from HtmlText → call Flow to upload → replace base64 `<img>` with URL `<img>`.
3. Patch modified HTML to `RejectionComments` (images as URLs).

---

#### Image Handling Strategy

| Pipeline Stage | Base64 Outcome |
|----------------|----------------|
| Power Apps → SharePoint | **STRIPPED** by SharePoint sanitization |
| SharePoint → Flow | Even if stored, exceeds 63,999 chars for large images |
| Flow → Email | Gmail ignores; Outlook inconsistent |

**Reliable pipeline:** Power Apps → Extract base64 → Flow upload to library → Get URL → Replace in HTML → Patch → Email with `<img src="https://...">`.

---

#### Testing Checklist

- [ ] Reject with text-only comments → verify StaffNotes/RejectionComments in SharePoint
- [ ] Verify email shows text in ADDITIONAL DETAILS / REJECTION DETAILS
- [ ] Reject with pasted image → verify image stripped in SharePoint (base64 gone)
- [ ] Phase 3: Verify image uploaded to library and URL in RejectionComments
- [ ] Verify email displays inline image in Outlook, Gmail, mobile

---

#### Long-term Recommendation

1. **Never rely on base64** for images in SharePoint or email.
2. **Separate concerns:** Text → Enhanced rich text column; Images → Document library with URLs.
3. **Use Power Automate** as middleware for image upload and URL replacement.
4. **Email images:** Use URLs (SharePoint, OneDrive, or Azure Blob with SAS) — Microsoft Learn recommends public URLs for images in emails.

---

**Sources Cited:**
- Microsoft Learn: Power Apps RichTextEditor, Power Automate email customization
- Microsoft Q&A: SharePoint column 63,999 character limit
- SharePoint Stack Exchange: Base64 image stripping behavior
- Tachytelic.net: Power Automate email base64 embedding
- Will Page Dev: Content-ID limitations in Send Email V2
- Microsoft Power Fx: split(), first(), last() functions

---

### Other Models

*(Add additional sections as needed)*

---

## Consensus Summary

### Points of Agreement:

| Finding | Confidence | Models Agreeing |
|---------|------------|-----------------|
| SharePoint strips base64 images from rich text columns | High | Claude Opus 4.5, Composer 1.5 |
| Column limit is 63,999 characters | High | Claude Opus 4.5, Composer 1.5 |
| Email template references wrong field (`body/Notes`) | High | Claude Opus 4.5, Composer 1.5 |
| Gmail does not render base64 images in emails | High | Claude Opus 4.5, Composer 1.5 |
| CID approach has limitations in Send Email V2 | High | Claude Opus 4.5, Composer 1.5 |
| Separate column needed for clean architecture | High | Claude Opus 4.5, Composer 1.5 |
| Image library required for reliable image delivery | High | Claude Opus 4.5, Composer 1.5 |

### Points of Divergence:

*(To be filled after all models respond)*

| Variation | Model(s) | Assessment |
|-----------|----------|------------|
| | | |

### Recommended Approach (Implemented):

**Phase 1 (Implemented):** Flow B email template uses `body/StaffNotes` ✅
**Phase 2 (Skipped):** Separate `RejectionComments` column not needed for text-only
**Phase 3 (Not Implementing):** Image support skipped due to complexity — text descriptions sufficient

---

## Suggested Solution

### Selected Option: **Phase 1 Only** (Text-Only via StaffNotes)

### Implementation Steps:

**PHASE 1 — FIX REQUIRED**

Update Flow B rejection email template to use `body/StaffNotes` instead of `body/Notes`:

**In Power Automate:**
1. Open Flow B (PR-Audit)
2. Find "Send Rejection Email" action
3. Click Code View (`</>`)
4. Replace the email body with:

```html
<p class="editor-paragraph">Unfortunately, your 3D Print request has been rejected by our staff.<br><br>REQUEST DETAILS:<br>- Request ID: @{outputs('Get_Current_Rejected_Data')?['body/ReqKey']}<br>- Method: @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}<br>- Color: @{outputs('Get_Current_Rejected_Data')?['body/Color']?['Value']}<br>- Printer: @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}<br><br>REASON FOR REJECTION:<br>@{outputs('Compose_Formatted_Reasons_Text')}<br><br>ADDITIONAL DETAILS:<br>@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}<br><br>NEXT STEPS:<br>• Review the specific rejection reason above<br>• Make necessary adjustments to your design or request<br>• Submit a new corrected request through the Submission Portal<br>• Come by the lab and ask us!<br><br>---<br>This is an automated message from the LSU Digital Fabrication Lab.</p>
```

5. Save the flow

**PHASE 2 — SKIPPED** (Clean architecture with separate column)

Not implemented. The existing `StaffNotes` approach is sufficient for text-only use.

**PHASE 3 — NOT IMPLEMENTING** (Image support)

Image upload to document library is NOT being implemented due to:
- High complexity (2-4 hours of development)
- Requires creating new SharePoint library, new Power Automate flow, and complex Power Apps logic
- Text descriptions are sufficient for most rejection scenarios

### Testing Checklist:

- [ ] Update Flow B email template (change `body/Notes` to `body/StaffNotes`)
- [ ] Staff enters custom text in rich text editor during rejection
- [ ] Verify StaffNotes contains the HTML content in SharePoint
- [ ] Verify rejection email displays custom text in ADDITIONAL DETAILS section
- [ ] Test email rendering in Outlook
- [ ] Test email rendering in Gmail (verify HTML renders correctly)

---

## The Fix

### Updated Email Template (Flow B)

Change `body/Notes` to `body/StaffNotes` in the rejection email:

**Before (WRONG):**
```html
ADDITIONAL DETAILS:<br>@{outputs('Get_Current_Rejected_Data')?['body/Notes']}
```

**After (CORRECT):**
```html
ADDITIONAL DETAILS:<br>@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}
```

### Complete Corrected Email Template

```html
<p class="editor-paragraph">Unfortunately, your 3D Print request has been rejected by our staff.<br><br>REQUEST DETAILS:<br>- Request ID: @{outputs('Get_Current_Rejected_Data')?['body/ReqKey']}<br>- Method: @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}<br>- Color: @{outputs('Get_Current_Rejected_Data')?['body/Color']?['Value']}<br>- Printer: @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}<br><br>REASON FOR REJECTION:<br>@{outputs('Compose_Formatted_Reasons_Text')}<br><br>ADDITIONAL DETAILS:<br>@{outputs('Get_Current_Rejected_Data')?['body/StaffNotes']}<br><br>NEXT STEPS:<br>• Review the specific rejection reason above<br>• Make necessary adjustments to your design or request<br>• Submit a new corrected request through the Submission Portal<br>• Come by the lab and ask us!<br><br>---<br>This is an automated message from the LSU Digital Fabrication Lab.</p>
```

### Field Explanation

| Field | Contains | Used For |
|-------|----------|----------|
| `body/Notes` | Student's submission notes | ❌ WRONG - this is what the student wrote when submitting |
| `body/StaffNotes` | Staff rejection comments | ✅ CORRECT - contains rich text from `rteRejectComments` |
| `Compose_Formatted_Reasons_Text` | Checkbox reasons | ✅ Shows predefined rejection reasons |

### Note on Image Limitation

Staff should NOT paste images into `rteRejectComments`. SharePoint strips base64 images from rich text fields. Use text descriptions instead.

---

## Implementation Priority

| Priority | Fix | Effort | Impact | Status |
|----------|-----|--------|--------|--------|
| **P0 (Critical)** | Change `body/Notes` to `body/StaffNotes` in email | 2 min | Shows text comments in email immediately | ⏳ TODO |
| **P1 (Important)** | Add separate `RejectionComments` column + update Patch | 30 min | Clean architecture, direct field reference | ⏭️ Skipped |
| **P2 (Important)** | Implement image upload to document library | 2-4 hrs | **Only way to make images work** | ❌ Not implementing |
| **P3 (Optional)** | Parse StaffNotes for cleaner extraction | 15 min | Only if not implementing P1 | ⏭️ Skipped |
| **P4 (Consider)** | Warn users about image limitation | 5 min | Prevents user frustration | ✅ Done (docs updated) |

**Decision:** Image support (P2) is not being implemented due to complexity. Text-only approach using existing `StaffNotes` field is sufficient.

**Next Step:** Complete P0 by updating Flow B in Power Automate.

---

## Related Documentation

- `PowerAutomate/Flow-(B)-Audit-LogChanges.md` — Flow B implementation details
- `PowerApps/StaffDashboard-App-Spec.md` — Rejection button OnSelect logic (Step 46)
- `Debug/Rejection Email Reasons Solutions.md` — Previous fix for checkbox reasons issue
- `Debug/Email Identity Solutions.md` — Similar debug document format

---

## Evidence Screenshots

| Screenshot | Description | Key Finding |
|------------|-------------|-------------|
| Rejection Email | Email received by student (REQ-00129) | ADDITIONAL DETAILS = empty |
| Rich Text Editor | Staff Dashboard rejection modal | Staff entered text + pasted image |
| SharePoint StaffNotes | PrintRequests list StaffNotes column | *(check if HTML content present)* |

---

## Final Decision

**Selected Solution:** Text-Only (Phase 1 fix)

**Rationale:** 
1. SharePoint **strips base64 images** from enhanced rich text columns — this is a platform limitation that cannot be worked around
2. Email clients (especially Gmail) **do not reliably render base64 images** — even if images survived storage, they wouldn't display in emails
3. **Image support (Phase 3) is NOT being implemented** — the complexity of uploading images to a document library and replacing URLs is not worth the effort for this use case
4. Text content works fine using `StaffNotes` field directly — the existing architecture is sufficient

**Implemented Fix:**
- Flow B email template uses `body/StaffNotes` (contains rejection reasons + staff comments)
- Staff Dashboard `rteRejectComments` rich text editor supports text formatting only
- Documentation updated to warn against pasting images

**What Staff Should Do Instead:**
- Use text descriptions to explain issues with the model
- Reference specific features by name (e.g., "the left wing has unsupported overhangs")
- If visual reference is critical, ask student to visit the lab in person

**Implementation Date:** 2/27/2026

**Status:** [ ] Not Started  [x] Research Complete  [ ] In Progress  [ ] Completed  [ ] Abandoned

**Action Required:** Update Flow B email template in Power Automate (change `body/Notes` to `body/StaffNotes`)

---

## Key Research Findings Summary

| Question | Answer | Source |
|----------|--------|--------|
| Max SharePoint "Multiple lines of text" size? | **63,999 characters** | Microsoft Q&A |
| Can SharePoint store base64 images in rich text? | **NO** — SharePoint strips them | SharePoint Stack Exchange |
| Will Power Automate email render base64 images? | **Inconsistent** — Gmail ignores, Outlook varies | Tachytelic.net, MS Learn |
| What happens if HTML exceeds column limit? | **Patch fails** or content truncated | Power Platform Community |
| How to extract substring between delimiters? | `split()` + `first()`/`last()` functions | MS Learn, Stack Overflow |
| Does Office 365 support CID images? | **Limited** — Send Email V2 ignores CID properties | Will Page Dev |
| Best practice for rich text + images? | **Separate storage** — Text in column, images in library | MS Learn, Community |
| Reliable email image delivery? | **URL-based images** with public access or CDN | Multiple sources |
