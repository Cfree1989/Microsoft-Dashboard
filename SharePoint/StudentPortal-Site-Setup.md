# SharePoint Student Portal Site Setup

**Purpose:** Configure the Digital Fabrication Lab SharePoint site as a dual-purpose portal serving both students (Moodle-style resource hub) and staff (administrative backend)  
**Time Required:** 90-120 minutes

---

## Overview

This guide transforms the existing SharePoint team site into a student-facing portal that mirrors the Moodle course structure while maintaining full staff access to administrative lists and dashboards.

**Key Features:**
- Dual-audience architecture (students vs staff)
- Moodle-style navigation with educational content pages
- Audience-targeted navigation (different menus per user type)
- Student print request tracking with item-level security
- Staff-only administrative sections hidden from students
- Integration with existing Power Apps dashboard and submission form

**Architecture:**

```
SharePoint Site: Digital Fabrication Lab
│
├── Staff-Only Navigation (audience-targeted, Members only - at top)
│   ├── Staff Hub (staff operations page)
│   ├── Print Lab Dashboard (Power App)
│   ├── PrintRequests (full list)
│   ├── RequestComments (messaging)
│   ├── AuditLog (tracking)
│   └── Staff (team management)
│
├── Home (Student-facing landing page, site default)
│   └── Moodle-style welcome, student quick links
│
└── Student Pages (visible to everyone)
    ├── Subtractive (CNC/laser info)
    ├── Additive (3D printing info + Student Print Portal app)
    ├── Resources (downloads/guides)
    ├── Feedback (surveys/contact)
    ├── Lab Rules (policies)
    └── Safety (requirements)
```

**Key Concept:** Staff see everything (student pages + staff sections). Students only see the student pages.

---

## Prerequisites

Before starting this guide, ensure you have:

- [ ] SharePoint site created: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- [ ] Site Owner or Site Collection Admin permissions
- [ ] PrintRequests list configured (see `PrintRequests-List-Setup.md`)
- [ ] AuditLog list configured (see `AuditLog-List-Setup.md`)
- [ ] Staff list configured (see `Staff-List-Setup.md`)
- [ ] RequestComments list configured (see `RequestComments-List-Setup.md`)
- [ ] Power Apps Staff Dashboard deployed
- [ ] Power Apps Student Submission Form deployed (or SharePoint form ready)

---

## Step 1: Understand the Security Model

SharePoint uses a permission hierarchy with three default groups:

| Group | Permission Level | Intended Users |
|-------|-----------------|----------------|
| Digital Fabrication Lab Owners | Full Control | Admins, Lab Manager |
| Digital Fabrication Lab Members | Edit | FabLab Staff |
| Digital Fabrication Lab Visitors | Read | Students (via "Everyone except external users") |

**Our Goal:**
- **Staff** → Digital Fabrication Lab Members → See everything (all lists, all pages, all navigation)
- **Students** → Digital Fabrication Lab Visitors → See student pages + their own PrintRequests only

**Key Security Concepts:**
1. **Site-level permissions** control who can access the site
2. **List-level permissions** can break inheritance to restrict specific lists
3. **Item-level permissions** (on PrintRequests) ensure students see only their own items
4. **Audience targeting** hides navigation/content from specific audiences (visual only, not security)

> ⚠️ **IMPORTANT:** Audience targeting is NOT a security feature. It only hides content visually. Always use proper permissions to secure sensitive data.

---

## Step 2: Configure Site Permissions

### 2.1: Review Current Site Groups

1. Go to your SharePoint site
2. Click **Settings** (gear icon) → **Site permissions**
3. Click **Advanced permissions settings**
4. Review the three default groups:
   - **Digital Fabrication Lab Owners** - Should include Lab Manager
   - **Digital Fabrication Lab Members** - Should include all staff
   - **Digital Fabrication Lab Visitors** - Will include students

### 2.2: Add Staff to Site Members

1. Go to **Settings** (gear icon) → **Site permissions**
2. Click **Advanced permissions settings**
3. In the left sidebar under **Groups**, click on **Digital Fabrication Lab Members**
4. Click **New** dropdown → **Add Users**
5. In the **"Share 'Digital Fabrication Lab'"** dialog:
   - In the **"Enter names or email addresses"** field, type each staff member's name or email
   - Select them from the dropdown suggestions
   - Optionally check/uncheck "Send an email invitation" based on preference
6. Click **Share**
7. Repeat for additional staff members, or add multiple at once

> 💡 **Tip:** You can also add an M365 security group (e.g., "FabLab Staff") instead of individual users. This makes management easier - just type the group name instead of individual emails.

### 2.3: Configure Student Access

Students use their LSU Microsoft 365 accounts and need "Visitors" level (Read) access. This allows any authenticated LSU user to access the student-facing content.

1. Go to **Settings** (gear icon) → **Site permissions**
2. Click **Advanced permissions settings**
3. In the left sidebar under **Groups**, click on **Digital Fabrication Lab Visitors**
4. The group will show "There are no items to show" (empty)
5. Click **New** dropdown → **Add Users**
6. In the **"Share 'Digital Fabrication Lab'"** dialog:
   - In the **"Enter names or email addresses"** field, type: `Everyone except external users`
   - Select it from the dropdown suggestions
   - It will show: "1 group will be invited"
   - **Uncheck** "Send an email invitation" (you don't want to email the entire organization)
   - The dialog should show "(won't be emailed)" under the group name
7. Click **Share**

**Result:** Any LSU user with a Microsoft 365 account can now access the site at the Visitor (Read) level. The group will now show "Everyone except external users" as a member.

> 💡 **What this means:**
> - Students can view all pages on the site
> - Students can see only their own items in PrintRequests (due to item-level security)
> - Students CANNOT access staff-only lists (AuditLog, Staff, RequestComments) after we secure them in Step 3
> - No maintenance needed when new students join LSU - they automatically have access

> ⚠️ **Alternative: Controlled Access**
> If you later need to restrict access to specific students only, work with LSU IT to create an M365 security group and add that group to Visitors instead of "Everyone except external users."

---

## Step 3: Secure Staff-Only Lists

By default, all lists inherit site permissions. We need to break inheritance on staff-only lists so students cannot access them directly.

### 3.1: Secure AuditLog List

1. Go to **Site contents** → Click on **AuditLog**
2. Click **Settings** (gear icon) → **List settings**
3. Under **Permissions and Management**, click **Permissions for this list**
4. You'll see a banner: "This list inherits permissions from its parent"
5. In the ribbon, click **Stop Inheriting Permissions**
6. Click **OK** to confirm breaking inheritance
7. You'll now see the permission groups listed (Owners, Members, Visitors)
8. Check the box next to **Digital Fabrication Lab Visitors**
9. In the ribbon, click **Remove User Permissions**
10. Click **OK** to confirm removal

**Result:** Only Owners and Members can access AuditLog. Students (Visitors) will get "Access Denied" if they try to access this list directly.

### 3.2: Secure Staff List

1. Go to **Site contents** → Click on **Staff**
2. Click **Settings** (gear icon) → **List settings**
3. Under **Permissions and Management**, click **Permissions for this list**
4. In the ribbon, click **Stop Inheriting Permissions**
5. Click **OK** to confirm
6. Check the box next to **Digital Fabrication Lab Visitors**
7. In the ribbon, click **Remove User Permissions**
8. Click **OK** to confirm

**Result:** Only Owners and Members can access Staff list.

### 3.3: Secure RequestComments List

1. Go to **Site contents** → Click on **RequestComments**
2. Click **Settings** (gear icon) → **List settings**
3. Under **Permissions and Management**, click **Permissions for this list**
4. In the ribbon, click **Stop Inheriting Permissions**
5. Click **OK** to confirm
6. Check the box next to **Digital Fabrication Lab Visitors**
7. In the ribbon, click **Remove User Permissions**
8. Click **OK** to confirm

**Result:** Only Owners and Members can access RequestComments.

### 3.4: Verify PrintRequests Item-Level Security

The PrintRequests list uses item-level permissions so students can only see their own requests. Verify this is configured:

1. Go to **Site contents** → Click on **PrintRequests**
2. Click **Settings** (gear icon) → **List settings**
3. Click **Advanced settings**
4. Under **Item-level Permissions**, verify:
   - Read access: **Read items that were created by the user**
   - Create and Edit access: **Create items and edit items that were created by the user**
5. If not set, configure and click **OK**

**Result:** Students accessing PrintRequests will only see items where they are the creator (Student field).

> 💡 **Note:** Staff (Site Members) will still see all items because they have Edit permission at the site level, which overrides item-level read restrictions.

---

## Step 4: Create Student-Facing Pages

Create pages that mirror the Moodle course structure. Each page will use SharePoint's modern page experience with web parts.

### 4.0: Rename Existing Home Page to "Staff Hub" (Staff Operations)

Your current Home page contains staff-focused content (TigerCASH Log, Schedule, Master SOP, etc.). We'll keep this as a staff-only operations page.

1. Go to **Site contents** → **Site Pages**
2. Find the current **Home** page
3. Click the **...** (ellipsis) next to it → **Rename**
4. Change the name to: `Staff Hub`
5. Click **Rename**

> 💡 **Alternative Method:** Open the page, click **Page details** in the toolbar, and edit the page name there.

**Result:** Your existing staff operations page is now called "Staff Hub" and will be configured as staff-only in navigation later. The URL will change to `/SitePages/Staff%20Hub.aspx`.

---

### 4.1: Create Home Page (Student Landing)

Create a new student-facing Home page that will become the site's default landing page. This page mirrors the Moodle landing page design using SharePoint's native web parts with section backgrounds to create a card-like appearance.

**Page Structure Overview:**

```
┌─────────────────────────────────────────────────────┐
│  SECTION 1: Title (no background)                   │
│  └─ Text: "Digital Fabrication Laboratory" (H1)     │
├─────────────────────────────────────────────────────┤
│  SECTION 2: Hero Card (Neutral background)          │
│  └─ Image: Lab photo                                │
│  └─ Text: Welcome paragraph                         │
├────────────────────┬────────────────────────────────┤
│  SECTION 3: Two columns (Neutral background)        │
│  LEFT COLUMN       │  RIGHT COLUMN                  │
│  - Subtractive     │  - Software                    │
│  - Additive        │  - Location                    │
│                    │  - Lab Hours                   │
│                    │  - Contact                     │
├────────────────────┴────────────────────────────────┤
│  SECTION 4: Footer Callout (Neutral background)     │
│  └─ Text: Faculty consultation notice (centered)    │
├─────────────────────────────────────────────────────┤
│  SECTION 5: Quick Links (no background)             │
│  └─ Links to other pages                            │
└─────────────────────────────────────────────────────┘
```

#### Step 1: Create the Page

1. Go to the **site home** (click site name "Digital Fabrication Lab" in header)
2. Click **+ New** in the top command bar
3. Select **Page**
4. In the **Template gallery**, click **Create blank** (top right)
5. Click the page title area and type: `Home`

#### Step 2: Add Title Section

1. The page starts with a default section. Click the **+** to add a web part
2. Select **Text**
3. Type: `Digital Fabrication Laboratory`
4. Select the text and format it:
   - Click the **Heading 1** style (or use the formatting dropdown)
   - Click **Center align** in the toolbar

#### Step 3: Add Hero Card Section (Lab Image + Welcome Text)

1. Hover below the title section and click the **+** line to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral** (light gray)
5. Click **Apply**

**Add the Lab Image:**

6. Click **+** inside the new section → Select **Image**
7. Click **Upload** → Select your lab photo (the black & white fabrication lab image)
8. After upload, click on the image and resize if needed (use corner handles)

**Add the Welcome Paragraph:**

9. Click **+** below the image → Select **Text**
10. Paste the following welcome text:

```
Welcome to the Digital Fabrication Laboratory, a space dedicated to empowering students and faculty to explore ideas and conduct research. Our well-equipped lab provides the necessary area and equipment to work with a diverse range of materials, from foam and wood to mild steel and engineering resins. Our dedicated staff is here to support you at every step of the way. Whether you need assistance with 3D modeling, have questions about CNC, or seek guidance in designing and building a project from start to finish, we are happy to help. The Fabrication Lab plays a vital role in advancing education, fostering recruitment, and driving research in digital fabrication technology across various disciplines within the College of Art + Design and beyond.
```

#### Step 4: Add Equipment & Info Section (Two Columns)

1. Hover below the hero section and click the **+** line to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **Two columns**
4. Under **Background**, select **Neutral** (light gray)
5. Click **Apply**

**Left Column - Machines:**

6. Click **+** in the **left column** → Select **Text**
7. Add the following content (use Heading 2 for titles, bullet list for items):

```
Subtractive Machines

• CNC Router 4'x8'
• CNC Plasma 4'x4'
• Tormach CNC Mill
• Formech Vacuum Former
• Multiprocess Welder

Additive Machines

• Form 3+ (2) Resin
• Form Fuse 1+ 30w SLS
• Prusa MK4S (6)
• Prusa XL 2 toolhead (2)
• Raise3D Pro 2 Plus (2)
• Markforged Onyx Pro
• Potterbot 9 Ceramic 3D Printer
```

8. Format "Subtractive Machines" and "Additive Machines" as **Heading 2**
9. Format the machine lists as **bullet lists** (select text → click bullet icon)

**Right Column - Info:**

10. Click **+** in the **right column** → Select **Text**
11. Add the following content:

```
Software

• Fusion
• Rhino
• PrusaSlicer
• Preform

Location

Art Building 123
Atkinson 145

Lab Hours

Monday – Friday
8:30-4:30

Contact

coad-fablab@lsu.edu
```

12. Format "Software", "Location", "Lab Hours", and "Contact" as **Heading 2**
13. Format the software list as a **bullet list**

#### Step 5: Add Footer Callout Section

1. Hover below the two-column section and click the **+** line to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral** (light gray)
5. Click **Apply**

6. Click **+** inside the section → Select **Text**
7. Type: `Consultations are required for all faculty looking to conduct class projects through the Lab.`
8. Select the text and format it:
   - Click **Bold**
   - Click **Center align**

#### Step 6: Add Quick Links Section

1. Hover below the footer callout and click the **+** line to add a new section
2. Leave the background as **None** (default)
3. Click **+** → Select **Quick links**
4. In the properties panel, select **Grid** or **Compact** layout
5. Add links to other pages (complete after creating all pages in Step 4.2):

| Title | URL | Suggested Icon |
|-------|-----|----------------|
| Subtractive Manufacturing | /SitePages/Subtractive.aspx | Tool or Gear |
| Additive Manufacturing | /SitePages/Additive.aspx | Cube or Printer |
| Resources | /SitePages/Resources.aspx | Document |
| Lab Rules | /SitePages/Lab-Rules.aspx | Book |
| Safety | /SitePages/Safety.aspx | Shield |

#### Step 7: Publish the Page

1. Review the page layout - verify all sections have correct backgrounds
2. Click **Publish** in the top-right corner
3. Click **Publish** again to confirm

> 💡 **Tip:** The Neutral background on sections creates the "card" appearance from the Moodle design. While SharePoint doesn't support rounded corners or shadows natively, the gray backgrounds provide clear visual separation between content areas.

> 💡 **For all remaining pages:** Use **Create blank** in the Template gallery (simpler content pages don't need a template).

---

### 4.2: Create Remaining Pages (Blank)

Create all remaining pages as blank placeholders. Content will be added later by migrating from Moodle.

**Quick creation steps (repeat for each page):**

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank** (top right)
3. Name the page
4. Click **Publish**

**Pages to create:**

| Page Name | URL After Creation |
|-----------|-------------------|
| Subtractive | /SitePages/Subtractive.aspx |
| Additive | /SitePages/Additive.aspx |
| 3D Scanning | /SitePages/3D-Scanning.aspx |
| Resources | /SitePages/Resources.aspx |
| Feedback | /SitePages/Feedback.aspx |
| Lab Rules | /SitePages/Lab-Rules.aspx |
| Safety | /SitePages/Safety.aspx |

> 💡 **Tip:** You can leave pages completely blank or add a simple "Content coming soon" text placeholder.
>
> 📱 **Note:** The Additive page will include the Student Print Portal app (see Step 10), which handles both print request submission and tracking.
>
> 📍 **Note:** The 3D Scanning page is a resource/redirect page — the FabLab doesn't have scanning equipment, but this page directs users to campus resources (see Step 13).

---

## Step 5: Configure Site Navigation

SharePoint modern sites have left navigation that can be customized and audience-targeted.

### 5.1: Access Navigation Settings

1. Click **Settings** (gear icon) → **Change the look**
2. Click **Navigation**
3. OR: Click **Edit** at the bottom of the left navigation panel

### 5.2: Enable Audience Targeting

1. While editing navigation, scroll to the **bottom** of the left navigation panel
2. Find the **"Enable site navigation audience targeting"** toggle
3. Switch it to **On**
4. Click **Save**

> 💡 **Note:** This allows you to show/hide navigation items based on M365 security groups or SharePoint groups.

### 5.3: Configure Staff-Only Navigation (At Top)

Add these items visible to **staff only** at the top of the navigation:

| Label | Link | Audience |
|-------|------|----------|
| Staff Hub | `/SitePages/Staff-Hub.aspx` | Digital Fabrication Lab Members |
| Print Lab Dashboard | [Power App URL] | Digital Fabrication Lab Members |
| PrintRequests | `/Lists/PrintRequests` | Digital Fabrication Lab Members |
| RequestComments | `/Lists/RequestComments` | Digital Fabrication Lab Members |
| AuditLog | `/Lists/AuditLog` | Digital Fabrication Lab Members |
| Staff | `/Lists/Staff` | Digital Fabrication Lab Members |

> 💡 **Staff Hub** is your renamed original Home page containing staff docs, TigerCASH Log, Schedule, Master SOP, etc.

**To add staff-only items:**

1. Click **+ Add link**
2. Enter the **Label**
3. Enter the **URL**
4. Click **Edit audiences** (or the people icon)
5. Type `Digital Fabrication Lab Members`
6. Select the group from the dropdown
7. Click **Save**

### 5.4: Configure Student-Visible Navigation (Below Staff Items)

Add these items visible to **everyone** (students and staff):

| Label | Link | Audience |
|-------|------|----------|
| Home | `/SitePages/Home.aspx` | Everyone (leave blank) |
| Subtractive | `/SitePages/Subtractive.aspx` | Everyone (leave blank) |
| Additive | `/SitePages/Additive.aspx` | Everyone (leave blank) |
| 3D Scanning | `/SitePages/3D-Scanning.aspx` | Everyone (leave blank) |
| Resources | `/SitePages/Resources.aspx` | Everyone (leave blank) |
| Feedback | `/SitePages/Feedback.aspx` | Everyone (leave blank) |
| Lab Rules | `/SitePages/Lab-Rules.aspx` | Everyone (leave blank) |
| Safety | `/SitePages/Safety.aspx` | Everyone (leave blank) |

> 💡 **How Audience Targeting Works:** In SharePoint, navigation items are visible to **everyone by default**. You only specify an audience when you want to **restrict** visibility. An empty/blank audience = visible to all users.
>
> 📱 **Note:** The Additive page includes the embedded Student Print Portal app, which provides both submission and request tracking functionality. No separate navigation items are needed for print requests.

**To add each item:**

1. **Enter navigation edit mode** (if not already):
   - Look at the **left navigation panel** on your site
   - Click **Edit** at the bottom of the left nav panel
   - OR: Go to **Settings** (gear icon) → **Change the look** → **Navigation**
   
2. Once in edit mode, you'll see the existing nav items with drag handles. At the bottom of the navigation list, click **+ Add link**

3. A dialog appears — enter the **Label** (display text)
4. Enter the **URL** (page path or full URL)
5. Click **OK**
6. **Do NOT set any audience** — leave the Audiences field blank/empty
7. Repeat for each item in the table above
8. Click **Save** when finished adding all items

> ⚠️ **Important:** Don't look for an "Everyone" option to select. Simply skip the audience targeting step entirely. Blank = Everyone.

### 5.5: Reorder Navigation Items

1. Drag and drop items to arrange in logical order
2. Recommended order (staff items at top, student pages below):
   ```
   Staff Hub               (Staff only)
   Print Lab Dashboard     (Staff only)
   PrintRequests           (Staff only)
   RequestComments         (Staff only)
   AuditLog                (Staff only)
   Staff                   (Staff only)
   ─────────────────
   Home
   Subtractive
   Additive                (includes Student Print Portal app)
   3D Scanning             (campus scanning resources)
   Resources
   Feedback
   Lab Rules
   Safety
   ```

3. Click **Save** when done

> 💡 **Why staff items at top?** Staff members access the administrative items frequently. Putting them at the top reduces scrolling. Students won't see these items anyway due to audience targeting.

### 5.6: Remove Unnecessary Navigation Items

Remove items no longer needed (like the old document library):

1. Hover over the item to remove
2. Click the **...** (ellipsis)
3. Click **Remove**
4. Click **Save**

**Items to consider removing:**
- 3D File Submission (folder - no longer needed with Power Apps form)
- Documents (if not used)
- Any default pages not needed

---

## Step 6: Set Site Home Page

Configure which page users see when they first visit the site.

### 6.1: Set Home.aspx as Site Home Page

1. Go to **Site Pages** → Open **Home.aspx**
2. Click **Page details** in the toolbar (or **...** → **Page details**)
3. Click **Make this your home page** (or **Promote** → **Make homepage**)
4. Confirm when prompted

### 6.2: Verify Home Page

1. Navigate to the site root URL
2. Verify the Home page loads by default

---

## Step 7: Configure Quick Links on Home Page

Now that all pages are created, add quick links on the Home page.

### 7.1: Edit Home Page

1. Go to **Site Pages** → **Home.aspx**
2. Click **Edit** in the toolbar

### 7.2: Configure Quick Links Web Part

1. Click on the Quick Links web part
2. Click **Edit web part** (pencil icon)
3. Add links:

**For Students:**
| Title | URL | Icon |
|-------|-----|------|
| Additive Manufacturing | /SitePages/Additive.aspx | Printer or 3D icon |
| Subtractive Manufacturing | /SitePages/Subtractive.aspx | Tool icon |
| Resources | /SitePages/Resources.aspx | Document icon |
| Lab Rules | /SitePages/Lab-Rules.aspx | Book icon |
| Safety | /SitePages/Safety.aspx | Shield icon |

> 📱 **Note:** The Additive page includes the embedded Student Print Portal app, so students can submit and track print requests directly from that page. No separate quick links needed for print functionality.

4. Click **Republish**

---

## Step 8: Test Permissions and Navigation

### 8.1: Test as Staff Member

1. Log in as a staff member (Site Members group)
2. Verify you can see:
   - [ ] All navigation items (including staff-only)
   - [ ] Print Lab Dashboard link works
   - [ ] PrintRequests shows ALL items
   - [ ] AuditLog is accessible
   - [ ] RequestComments is accessible
   - [ ] Staff list is accessible
   - [ ] All student pages are accessible

### 8.2: Test as Student

1. Open an InPrivate/Incognito browser window
2. Log in as a student account (Site Visitors group)
3. Verify:
   - [ ] Only student navigation items visible
   - [ ] Staff-only nav items are HIDDEN
   - [ ] All student pages load correctly
   - [ ] Student Print Portal app on Additive page shows ONLY their own requests
   - [ ] Can submit new print request via the embedded app
   - [ ] Cannot access /Lists/AuditLog (permission denied)
   - [ ] Cannot access /Lists/Staff (permission denied)
   - [ ] Cannot access /Lists/RequestComments (permission denied)

### 8.3: Test Item-Level Security

1. As a student, submit a test print request via the Student Print Portal app on the Additive page
2. View the "My Requests" screen in the app
3. Verify only their own request appears
4. As a different student, verify they cannot see the first student's request

---

## Step 9: Cleanup Tasks

### 9.1: Remove 3D File Submission Folder (If Applicable)

If you previously used a document library for file submissions:

1. Go to **Site contents**
2. Find **3D File Submission** (or similar)
3. Click **...** → **Settings**
4. Click **Delete this document library**
5. OR: Just remove it from navigation and leave the files for archival

### 9.2: Update Site Logo and Branding

1. Click **Settings** → **Change the look**
2. Click **Header**
3. Upload a site logo (FabLab logo)
4. Set the header layout preference
5. Click **Save**

### 9.3: Configure Site Description

1. Click **Settings** → **Site information**
2. Update **Site description**: `LSU Digital Fabrication Lab - 3D Printing, CNC, and Laser Cutting Services`
3. Click **Save**

---

## Column/Page Summary

### Pages Created

| Page Name | URL | Purpose | Audience |
|-----------|-----|---------|----------|
| Home | /SitePages/Home.aspx | Student landing page with hero and quick links | Everyone |
| Staff Hub | /SitePages/Staff-Hub.aspx | Staff operations (renamed from original Home) | Staff Only |
| Subtractive | /SitePages/Subtractive.aspx | CNC/laser information | Everyone |
| Additive | /SitePages/Additive.aspx | 3D printing info + Student Print Portal app | Everyone |
| 3D Scanning | /SitePages/3D-Scanning.aspx | Campus scanning resources directory | Everyone |
| Resources | /SitePages/Resources.aspx | Downloads and tutorials | Everyone |
| Feedback | /SitePages/Feedback.aspx | Survey/contact form | Everyone |
| Lab Rules | /SitePages/Lab-Rules.aspx | Usage policies | Everyone |
| Safety | /SitePages/Safety.aspx | Safety requirements | Everyone |

### Permission Configuration Summary

| List/Library | Inheritance | Staff Access | Student Access |
|--------------|-------------|--------------|----------------|
| PrintRequests | Inherited | All items | Own items only (item-level) |
| AuditLog | Broken | Full access | No access |
| Staff | Broken | Full access | No access |
| RequestComments | Broken | Full access | No access |
| Site Pages | Inherited | Full access | Read only |

### Navigation Summary

| Navigation Item | Visible To | Type |
|-----------------|------------|------|
| Staff Hub | Staff Only | Page (Staff operations) |
| Print Lab Dashboard | Staff Only | External Link |
| PrintRequests | Staff Only | List |
| RequestComments | Staff Only | List |
| AuditLog | Staff Only | List |
| Staff | Staff Only | List |
| Home | Everyone | Page (Student landing) |
| Subtractive | Everyone | Page |
| Additive | Everyone | Page (includes Student Print Portal app) |
| 3D Scanning | Everyone | Page (campus scanning resources) |
| Resources | Everyone | Page |
| Feedback | Everyone | Page |
| Lab Rules | Everyone | Page |
| Safety | Everyone | Page |

---

## Verification Checklist

### Security Configuration
- [ ] Staff added to Digital Fabrication Lab Members group (via New → Add Users)
- [ ] "Everyone except external users" added to Digital Fabrication Lab Visitors group (email unchecked)
- [ ] AuditLog: Stop Inheriting Permissions → Digital Fabrication Lab Visitors removed
- [ ] Staff list: Stop Inheriting Permissions → Digital Fabrication Lab Visitors removed
- [ ] RequestComments: Stop Inheriting Permissions → Digital Fabrication Lab Visitors removed
- [ ] PrintRequests item-level permissions verified (Read: Only their own)

### Pages Created
- [ ] Existing Home page renamed to "Staff Hub" (staff operations)
- [ ] New Home.aspx created (student landing) and set as site homepage
- [ ] Subtractive.aspx created
- [ ] Additive.aspx created (will include Student Print Portal app - see Step 10)
- [ ] Resources.aspx created
- [ ] Feedback.aspx created
- [ ] Lab-Rules.aspx created
- [ ] Safety.aspx created

### Navigation Configured
- [ ] Audience targeting enabled on navigation
- [ ] All student pages added to navigation (visible to Everyone)
- [ ] Staff Hub configured with Members audience (staff only)
- [ ] Staff-only items configured with Members audience
- [ ] Unnecessary items removed (3D File Submission, etc.)

### Testing Complete
- [ ] Staff can see all navigation and lists
- [ ] Students see only student navigation
- [ ] Students cannot access staff-only lists
- [ ] PrintRequests item-level security working
- [ ] Home page loads as site default
- [ ] Student Print Portal app on Additive page works correctly

---

## Next Steps

1. **Migrate Content:** Work through each page and migrate content from Moodle HTML
2. **Add Media:** Upload images and videos to pages
3. **Configure Forms:** Set up Microsoft Forms for feedback if desired
4. **Train Staff:** Walk through the dual-view system with lab staff
5. **Announce to Students:** Communicate the new portal URL
6. **Deploy Student Portal App:** Build and embed the Power Apps Student Print Portal (see below)

---

## Step 10: Embedding the Student Print Portal App on Additive Page

The Student Print Portal is a Power Apps canvas app that provides students with a complete print request experience. It includes:
- **Submit Screen:** Clean submission form with cascading dropdowns
- **My Requests Screen:** Gallery showing their submissions with status badges
- **Built-in Navigation:** Bottom nav bar to switch between screens
- **Estimate Confirmation:** Modal for confirming cost estimates
- **Cancel Capability:** Students can cancel requests before staff review

By embedding this app on the Additive page, students get both educational content about 3D printing AND the ability to submit/track requests — all in one place.

> 📚 **Build Guide:** See `PowerApps/StudentPortal-App-Spec.md` for complete build instructions.

### 10.1: Prerequisites

Before embedding the app, ensure:
- [ ] Student Print Portal app is built and published
- [ ] App is shared with "Everyone" (User permission)
- [ ] You have the app's Web link

### 10.2: Get the App Web Link

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Find **Student Print Portal** in your Apps list
3. Click the **...** (ellipsis) menu → **Details**
4. Copy the **Web link** URL
   - Format: `https://apps.powerapps.com/play/e/[environment-id]/a/[app-id]`

### 10.3: Choose Your Integration Approach

You have two options for integrating the Student Portal app on the Additive page:

| Approach | Pros | Cons |
|----------|------|------|
| **Embedded App** | All-in-one experience, no tab switching | Can look cramped, slower page load |
| **Button Link** | Cleaner page layout, app opens full-screen | Requires tab/window switch |

**Option A: Embed the App Directly (below)**

**Option B: Use a Button Link** — See **Step 12.6** for instructions on adding a "3D Print Submission" button that opens the app in a new tab. This approach is recommended if you prefer a cleaner page layout.

---

#### Option A: Embed the App on Additive Page

1. Go to **Site contents** → **Site Pages**
2. Open **Additive.aspx**
3. Click **Edit** in the toolbar
4. Scroll to the bottom of your existing 3D printing content (or add content first if the page is blank)
5. Click **+** to add a web part
6. Search for and select **Power Apps**
7. In the properties panel:
   - Paste the **Web link** you copied
   - Set **Height**: `900` (or adjust based on your preference)
8. (Optional) Add a text section above the app:
   ```
   Submit and Track Your 3D Print Requests
   Use the app below to submit new print requests and track the status of your existing submissions.
   ```
9. Click **Republish**

> 💡 **Tip:** The app's built-in bottom navigation lets students switch between "Submit" and "My Requests" screens without leaving the Additive page.

### 10.4: Verification

After embedding, test the following:

- [ ] Navigate to Additive page — app loads below the 3D printing content
- [ ] Submit a test request through the app
- [ ] Use the app's bottom navigation to switch to "My Requests"
- [ ] Your test request appears in the My Requests gallery
- [ ] Status badges display correctly
- [ ] Confirm estimate modal works (when status is "Pending")
- [ ] Cancel request works (when status is "Uploaded")

---

## Step 11: Sharing the Direct App Link

For easy access, you can share the app link directly with students:

### Get Shareable Link

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Find **Student Print Portal**
3. Click **...** → **Share**
4. Click **Copy link**

### Share Options

| Method | Example |
|--------|---------|
| **Email** | Include in welcome emails or course announcements |
| **Moodle** | Add as external link in course resources |
| **QR Code** | Generate QR code for lab signage |
| **Bookmarklet** | Provide browser bookmark instructions |

### Sample Announcement Text

```
📢 Submit your 3D print requests online!

Visit our Additive Manufacturing page to:
✓ Learn about 3D printing services
✓ Submit print requests
✓ Track your request status  
✓ Confirm cost estimates
✓ View pickup instructions

Access the portal: [SHAREPOINT SITE URL]/SitePages/Additive.aspx

Or use the direct app link: [YOUR APP LINK]

Questions? Email coad-fablab@lsu.edu
```

---

## Step 12: Building the Additive Page Content

This section provides detailed instructions for building out the Additive page to match the Moodle-style layout with card-based sections containing 3D printing information, pricing, and the submission button.

### Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTION 1: Title (no background)                               │
│  └─ Text: "Additive" (H1, centered)                             │
├─────────────────────────────┬───────────────────────────────────┤
│  SECTION 2: Two columns 2:1 (Neutral background)                │
│  LEFT (60%)                 │  RIGHT (40%)                      │
│  - Image: 3D printers photo │  - Quick Links: Design guides     │
│  - Text: Area description   │    (List layout)                  │
├─────────────────────────────┼───────────────────────────────────┤
│  SECTION 3: Two columns 1:1 (Neutral background)                │
│  LEFT (50%)                 │  RIGHT (50%)                      │
│  - Pricing info             │  - Printer Dimensions             │
│  - FDM/SLA rates            │  - Build volumes                  │
├─────────────────────────────┼───────────────────────────────────┤
│  SECTION 4: Two columns 1:1 (Neutral background)                │
│  LEFT (50%)                 │  RIGHT (50%)                      │
│  - 3D Print Job Process     │  - Model Checklist                │
│  - 12-step numbered list    │  - 9-item numbered list           │
├─────────────────────────────┴───────────────────────────────────┤
│  SECTION 5: One column (no background)                          │
│  └─ Button: "3D Print Submission" (centered, links to app)      │
└─────────────────────────────────────────────────────────────────┘
```

### 12.1: Edit the Additive Page

1. Go to **Site contents** → **Site Pages**
2. Open **Additive.aspx**
3. Click **Edit** in the toolbar

### 12.2: Add Title Section

1. The page starts with a default section
2. Click **+** to add a web part → Select **Text**
3. Type: `Additive`
4. Select the text and format:
   - Click **Heading 1** style
   - Click **Center align**

### 12.3: Add Hero Section (Image + Design Links)

**Create the section:**

1. Hover below the title and click the **+** line to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **Two columns (2:1 ratio)** — this gives 66%/33% split
4. Under **Background**, select **Neutral** (light gray)
5. Click **Apply**

**Left Column - Image and Description:**

6. Click **+** in the left column → Select **Image**
7. Upload your 3D printers photo (the black & white lab image)
8. Click **+** below the image → Select **Text**
9. Paste the description:

```
The Additive area within the Fabrication Lab is dedicated to all things 3D printing, offering a space ideal for small to medium-sized projects. This area is especially suitable for intricate or organic designs that may be challenging to create by hand. Our 3D printers can handle a diverse range of materials, ensuring we can cater to your specific project requirements with precision.
```

**Right Column - Design Guide Links:**

10. Click **+** in the right column → Select **Quick links**
11. In the properties panel, select **List** layout
12. Click **+ Add links** and add each guide:

| Title | URL |
|-------|-----|
| Design Guidelines for 3D Printing | [Your SharePoint/OneDrive link] |
| Designing for 3D Printing | [Your SharePoint/OneDrive link] |
| 3D Printing Best Practices | [Your SharePoint/OneDrive link] |
| Prusa Modeling for 3D Printing | https://help.prusa3d.com/article/modeling-with-3d-printing-in-mind_164135 |
| Preparing Rhino Files for 3D Printing | [Your SharePoint/OneDrive link] |
| Rhino 3D Printing Checks | [Your SharePoint/OneDrive link] |
| 3D Printing for Architecture | [Your SharePoint/OneDrive link] |
| 3D Printing for Interior Design | [Your SharePoint/OneDrive link] |
| Form 3 SLA Design Guide | [Your SharePoint/OneDrive link] |
| Form Fuse Design Guide | [Your SharePoint/OneDrive link] |

13. Click on the Quick Links web part title area and change it to: `Designing for 3D Printing`

### 12.4: Add Pricing and Printer Dimensions Section

**Create the section:**

1. Hover below the hero section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **Two columns (1:1 ratio)**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Left Column - Pricing:**

6. Click **+** in the left column → Select **Text**
7. Add the following content:

```
Pricing

$3 Minimum on all 3D prints

FDM (Filament):
• PLA: $0.10 per gram
• Markforged PLA: $0.15 per gram

SLA (Resin):
• Standard Resin: $0.30 per ml
```

8. Format "Pricing" as **Heading 2**
9. Format "$3 Minimum on all 3D prints" as **Bold** and **Center aligned**
10. Format "FDM (Filament):" and "SLA (Resin):" as **Bold**

**Right Column - Printer Dimensions:**

11. Click **+** in the right column → Select **Text**
12. Add the following content:

```
Printer Dimensions

FDM (Filament):
• Prusa MK4S: 9.84" × 8.3" × 8.6" (250 × 210 × 220 mm)
• Prusa XL: 14.17" × 14.17" × 14.17" (360 × 360 × 360 mm)
• Raise3D Pro 2 Plus: 12" × 12" × 23.8" (305 × 305 × 605 mm)

SLA (Resin):
• Formlabs Form 3: 5.7" × 5.7" × 7.3" (145 × 145 × 175 mm)
```

13. Format "Printer Dimensions" as **Heading 2**
14. Format "FDM (Filament):" and "SLA (Resin):" as **Bold**

### 12.5: Add Process and Checklist Section

**Create the section:**

1. Hover below the pricing section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **Two columns (1:1 ratio)**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Left Column - 3D Print Job Process:**

6. Click **+** in the left column → Select **Text**
7. Add the following content:

```
3D Print Job Process

1. Read the content and look through the guides on this page.
2. Fill out the Form below.
3. Ensure that files are sent in .3MF, .STL, or .OBJ format.
4. Use the following file naming format: firstandlastname_printertype_materialcolor_classnumber
   (e.g., johnsmith_filament_blue_ARCH4031)
5. Fill out the form below and wait for an email with a link to upload your file.
6. Once the file is correctly submitted, we will verify if it is printable.
7. If the file is not printable, we will alert you and provide recommendations for fixes.
8. When the file is ready, we will slice your model and provide a price quote.
9. Printing will not proceed until you agree to the price.
10. We will print your job using the most suitable 3D printer.
11. Upon completion, we will notify you via email about pickup.
12. Payment is required at the time of pickup via TigerCASH, check, or grant code.
```

8. Format "3D Print Job Process" as **Heading 2**
9. Format the steps as a **Numbered list**
10. Format the example "(e.g., johnsmith_filament_blue_ARCH4031)" as *Italic*

**Right Column - Model Checklist:**

11. Click **+** in the right column → Select **Text**
12. Add the following content:

```
Model Checklist

1. Did you submit your file with the correct name format?
2. Has the model been broken down to reduce support material?
3. Is it a valid Closed Solid Polysurface or closed mesh (Type in "What" into the command bar in Rhino to check validity)?
4. Is the model scaled to the correct size? .STL and .OBJ MUST be exported and scaled in metric units otherwise the scale will be wrong.
5. Does the scaled size fit within the build volume? (You can select your model and type in "Bounding Box" to double-check the dimensions)
6. Is your model at least 1/16" thick when scaled fit on a printer bed?
7. You can include many items in one file. We simply arrange it ourselves to fit on the printers.
8. Ensure that the file contains ONLY what you want printed. Export selected geometry and save it as .3mf, if possible, to ensure accuracy. If it says a plugin failed then save the geometry you want printed as a new Rhino file and proceed to export from there.
9. Send us ONE SINGLE file whenever possible. Multiple files as a last resort.
```

13. Format "Model Checklist" as **Heading 2**
14. Format the items as a **Numbered list**
15. Format "MUST" and "ONLY" as **Bold** for emphasis

### 12.6: Add Submission Button Section

**Create the section:**

1. Hover below the process section and click **+** to add a new section
2. Leave the background as **None** (default) — this makes the button stand out

**Add the Button:**

3. Click **+** → Search for and select **Button**
4. Configure the button:
   - **Label**: `3D Print Submission`
   - **Link**: Paste your Student Portal app URL
     - Example: `https://apps.powerapps.com/play/e/default-[environment-id]/a/[app-id]?tenantId=[tenant-id]`
5. Click **Alignment** → Select **Center**

> **Note:** The button opens the Student Portal app in a new tab/window, providing a cleaner experience than embedding the app directly on the page.

### 12.7: Publish the Page

1. Review all sections — verify backgrounds are set correctly
2. Check that all links work (Quick Links, Button)
3. Click **Republish** in the top-right corner

### 12.8: Verification Checklist

After building the page, verify:

- [ ] Title "Additive" displays centered at top
- [ ] Hero section shows image on left, Quick Links on right
- [ ] All design guide links work correctly
- [ ] Pricing section displays FDM and SLA rates
- [ ] Printer dimensions show all machine build volumes
- [ ] 3D Print Job Process shows all 12 steps
- [ ] Model Checklist shows all 9 items
- [ ] "3D Print Submission" button is centered
- [ ] Button opens the Student Portal app when clicked
- [ ] All card sections have neutral (gray) backgrounds
- [ ] Page looks professional and matches the intended design

---

## Step 13: Building the 3D Scanning Page Content

The 3D Scanning page is a **resource directory** — your FabLab doesn't have scanning equipment, but this page helps direct users to the various campus resources available for 3D scanning, photogrammetry, and drone capture.

### Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTION 1: Title + Intro (no background)                       │
│  └─ Text: "3D Scanning" (H1) + intro paragraph                  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 2: Scanners (Neutral background)                       │
│  └─ Table or formatted list of scanning equipment               │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 3: Accessories (Neutral background)                    │
│  └─ Table or formatted list of accessories                      │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 4: Scale Guide (Neutral background)                    │
│  └─ Recommendations by project size (S, M, L, XL)               │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 5: Rules (Neutral background)                          │
│  └─ Drone certification requirements                            │
└─────────────────────────────────────────────────────────────────┘
```

### 13.1: Edit the 3D Scanning Page

1. Go to **Site contents** → **Site Pages**
2. Open **3D-Scanning.aspx**
3. Click **Edit** in the toolbar

### 13.2: Add Title and Introduction Section

1. Click **+** to add a web part → Select **Text**
2. Type: `3D Scanning`
3. Select the text and format as **Heading 1**, **Center aligned**
4. Press Enter and add an introduction paragraph:

```
The FabLab does not currently have 3D scanning equipment. However, several departments across campus have scanning resources available. This page provides a directory of equipment, locations, and contacts to help you find the right scanning solution for your project.
```

### 13.3: Add Scanners Section

**Create the section:**

1. Hover below the intro and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Add the content:**

6. Click **+** → Select **Text**
7. Add the following content:

```
Scanners

Faro Focus
• Type: Terrestrial laser scanner
• Acquired: 2017
• Location: ART 106
• Manager: CoAD / Brendan Harmon
• Notes: Near end of life; batteries no longer manufactured

Faro Focus Premium
• Type: Terrestrial laser scanner
• Acquired: 2022
• Location: DMC 2072: Digital Twinning Studio
• Manager: Digital Art / DMAE
• Notes: Reservations managed with Cheqroom

Faro Freestyle 2
• Type: Handheld 3D laser scanner
• Acquired: 2022
• Location: DMC 2072: Digital Twinning Studio
• Manager: Digital Art / DMAE
• Notes: Reservations managed with Cheqroom; No longer supported

Faro ScanPlan
• Type: Handheld 2D laser scanner
• Acquired: 2022
• Location: DMC 2072: Digital Twinning Studio
• Manager: Digital Art / DMAE
• Notes: Reservations managed with Cheqroom; No longer supported

DJI Matrice 300 RTK
• Type: Drone (quadcopter)
• Sensors: L1 lidar & P1 camera
• Acquired: 2022
• Location: DMC 2072: Digital Twinning Studio
• Manager: Digital Art / DMAE
• Notes: Reservations managed with Cheqroom

DJI Phantom 4 (x3)
• Type: Drone (quadcopter)
• Sensors: Built-in camera
• Acquired: 2019
• Location: CxC
• Manager: CxC / Josef Horacek
• Notes: Reservations managed by CxC; Students can use after training
```

8. Format "Scanners" as **Heading 2**
9. Format each scanner name (Faro Focus, etc.) as **Bold**

### 13.4: Add Accessories Section

**Create the section:**

1. Hover below the scanners section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Add the content:**

6. Click **+** → Select **Text**
7. Add the following content:

```
Accessories

Registration targets
• Type: Spherical targets for terrestrial laser scanning
• Acquired: 2022
• Location: DMC 2072: Digital Twinning Studio
• Manager: Digital Art / DMAE

Prism poles for targets
• Type: Bipods and centering rods for targets for terrestrial laser scanning
• Acquired: 2024
• Location: ART 106
• Manager: Landscape Architecture / Brendan Harmon

Kangur-Lift
• Type: Pneumatic mast for terrestrial laser scanner
• Acquired: 2022
• Location: DMC 2072: Digital Twinning Studio / ART 106
• Manager: Digital Art / DMAE
• Notes: Reservations managed with Cheqroom

Giant elevating tripod
• Type: Giant elevating tripod for terrestrial laser scanner
• Acquired: 2020
• Location: ART 106
• Manager: Landscape Architecture / Brendan Harmon
```

8. Format "Accessories" as **Heading 2**
9. Format each accessory name as **Bold**

### 13.5: Add Scale Guide Section

This section helps users choose the right approach based on their project size.

**Create the section:**

1. Hover below the accessories section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Add the content:**

6. Click **+** → Select **Text**
7. Add the following content:

```
Scanning by Scale

S — Object (small items)

Photogrammetry / Lidar
• Equipment: Phone / Camera
• Apps: Polycam / Record3D / Kiri Engine
• Software: Metashape / RealityCapture
• Format: Point cloud / mesh

Neural rendering
• Equipment: Phone / Camera
• Apps: LumaAI
• Software: Nerfstudio
• Format: Nerf / 3D gaussian splat, point cloud / mesh

M — Furniture / Sculpture / Interiors

Terrestrial laser scanning
• Equipment: Faro Focus Premium
• Software: Faro Scene
• Accessory: Registration targets on prism poles (optional)
• Format: Point cloud / mesh

L — Structures / Trees

Terrestrial laser scanning
• Equipment: Faro Focus Premium
• Accessory: Pneumatic mast / elevating tripod + registration targets on prism poles
• Software: Faro Scene
• Format: Point cloud / mesh

XL — Building / Landscape

Drone photogrammetry
• Equipment: DJI Phantom / DJI Matrice + P1 camera
• Accessory: Ground control points (recommended)
• Software: Metashape Pro
• Format: Point cloud / mesh / raster

Drone lidar
• Equipment: DJI Matrice + L1 lidar
• Accessory: LSU C4G RTN corrections / DJI D-RTK GNSS base station
• Software: DJI Terra
• Format: Point cloud / mesh / raster
```

8. Format "Scanning by Scale" as **Heading 2**
9. Format each scale heading (S — Object, M — Furniture, etc.) as **Heading 3** or **Bold**
10. Format the method names (Photogrammetry / Lidar, Neural rendering, etc.) as **Bold**

### 13.6: Add Rules Section

**Create the section:**

1. Hover below the scale section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Add the content:**

6. Click **+** → Select **Text**
7. Add the following content:

```
Rules

Drones

All drone operations require FAA Remote Pilot Certificate (Part 107).

Operations must be supervised by a certified pilot in command.

Certified Pilots:
• Brendan Harmon
• Brent Fortenberry

Contact one of the certified pilots before planning any drone capture project.
```

8. Format "Rules" as **Heading 2**
9. Format "Drones" as **Heading 3** or **Bold**
10. Format the FAA requirement as **Bold** for emphasis

### 13.7: Publish the Page

1. Review all sections — verify backgrounds are set correctly
2. Click **Republish** in the top-right corner

### 13.8: Verification Checklist

After building the page, verify:

- [ ] Title "3D Scanning" displays centered at top
- [ ] Introduction explains this is a resource directory
- [ ] Scanners section lists all 6 pieces of equipment
- [ ] Accessories section lists all 4 items
- [ ] Scale guide shows all 4 size categories (S, M, L, XL)
- [ ] Rules section displays drone certification requirements
- [ ] All card sections have neutral (gray) backgrounds
- [ ] Page is easy to scan and find relevant information

---

## Step 14: Building the Subtractive Page Content

This section provides detailed instructions for building out the Subtractive page to match the Moodle-style layout with card-based sections containing CNC/subtractive manufacturing information, pricing, and the job submission process.

### Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTION 1: Title (no background)                               │
│  └─ Text: "Subtractive" (H1, centered)                          │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 2: Hero (Neutral background)                           │
│  └─ Image: CNC Plasma Cutter photo                              │
│  └─ Text: Area description paragraph                            │
├─────────────────────────────┬───────────────────────────────────┤
│  SECTION 3: Two columns 1:1 (Neutral background)                │
│  LEFT (50%)                 │  RIGHT (50%)                      │
│  - Available Machines       │  - Pricing                        │
│  - 4 machines with specs    │  - Student/Faculty/Outside rates  │
├─────────────────────────────┴───────────────────────────────────┤
│  SECTION 4: One column (Neutral background)                     │
│  └─ CNC Job Process                                             │
│  └─ 11-step numbered list                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 14.1: Edit the Subtractive Page

1. Go to **Site contents** → **Site Pages**
2. Open **Subtractive.aspx**
3. Click **Edit** in the toolbar

### 14.2: Add Title Section

1. The page starts with a default section
2. Click **+** to add a web part → Select **Text**
3. Type: `Subtractive`
4. Select the text and format:
   - Click **Heading 1** style
   - Click **Center align**

### 14.3: Add Hero Section (Image + Description)

**Create the section:**

1. Hover below the title and click the **+** line to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral** (light gray)
5. Click **Apply**

**Add the Image:**

6. Click **+** inside the section → Select **Image**
7. Upload your CNC Plasma Cutter photo
8. After upload, resize if needed (use corner handles)

**Add the Description:**

9. Click **+** below the image → Select **Text**
10. Paste the description:

```
The Subtractive area of the Fabrication Lab is where cutting and shaping takes place. These machines work with a broad range of materials, from wood and foam to metal and plastic. Almost anything can be created using these machines. Please stop by and let us take a look at your project.
```

### 14.4: Add Available Machines and Pricing Section

**Create the section:**

1. Hover below the hero section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **Two columns (1:1 ratio)**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Left Column - Available Machines:**

6. Click **+** in the left column → Select **Text**
7. Add the following content:

```
Available Machines

Forest Scientific HS 4x8 CNC Router
Capable of cutting 4'x8'x10.5" material.
Materials: MDF, Plywood, Foam, Plastics

Lonestar Spitfire 4x4 CNC Plasma Cutter
Capable of cutting 4'x4'x5/8" material.
Materials: Mild Steel, Stainless Steel (All Sheets MUST Be Flat)

Formech 686 Vacuum Former
Used to vacuum form thin sheets of plastic.

Multimatic 200 Multiprocess Welder
Offers Tig, Mig, and Arc welding options.
```

8. Format "Available Machines" as **Heading 2**
9. Format each machine name (Forest Scientific, Lonestar Spitfire, etc.) as **Bold**

**Right Column - Pricing:**

10. Click **+** in the right column → Select **Text**
11. Add the following content:

```
Pricing

Students:
• $20 per hour

Faculty:
• $35 per hour

Outside Jobs:
• $60 per hour
```

12. Format "Pricing" as **Heading 2**
13. Format "Students:", "Faculty:", and "Outside Jobs:" as **Bold**
14. Format the rates as **bullet lists**

### 14.5: Add CNC Job Process Section

**Create the section:**

1. Hover below the machines/pricing section and click **+** to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral**
5. Click **Apply**

**Add the content:**

6. Click **+** → Select **Text**
7. Add the following content:

```
CNC Job Process

1. Visit Art Building room 123 for a consultation.
2. If you have a 3D model, please provide a .3dm, .STEP, or .f3d file.
3. If you have a 2D model please provide a .DXF file.
4. Present your project scope and provide either a CAD model or reference images.
5. We will confirm your expectations and provide a price estimate (materials to be provided by the client).
6. We will proceed only after you accept the price estimate.
7. Using your provided model or creating one from scratch, we will generate toolpaths for the required machine.
8. Before making the first cut, you will have the opportunity to verify all the details in person.
9. Once verified, we will mill your project and provide you with ready-to-assemble pieces, ensuring that tabs are removed if necessary.
10. You will receive an email notification regarding project pickup.
11. Payment is required at the time of pickup, and you can use TigerCASH, provide a check to the front office, or use a grant code.
```

8. Format "CNC Job Process" as **Heading 2**
9. Format the steps as a **Numbered list**

### 14.6: Publish the Page

1. Review all sections — verify backgrounds are set correctly
2. Click **Republish** in the top-right corner

### 14.7: Verification Checklist

After building the page, verify:

- [ ] Title "Subtractive" displays centered at top
- [ ] Hero section shows CNC image with description below
- [ ] Available Machines section lists all 4 machines with specifications
- [ ] Pricing section shows Student/Faculty/Outside rates
- [ ] CNC Job Process shows all 11 steps
- [ ] All card sections have neutral (gray) backgrounds
- [ ] Page looks professional and matches the intended design

---

## Step 15: Building the Class Project Policy Page Content

This section provides instructions for building the Class Project Policy page, which informs faculty about the consultation requirement for class-wide projects using the Fabrication Lab.

### Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTION 1: Title (no background)                               │
│  └─ Text: "Class Project Policy" (H1, centered)                 │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 2: Policy Card (Neutral background)                    │
│  └─ Image: Tormach CNC machine photo                            │
│  └─ Text: Consultation requirement paragraph                    │
│  └─ Text: "Please Submit One Form Per Course" (centered, bold)  │
│  └─ Button: "Class Project Form" (centered, links to MS Forms)  │
└─────────────────────────────────────────────────────────────────┘
```

### 15.1: Create the Class Project Policy Page

First, create the page if it doesn't exist:

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank** (top right)
3. Name the page: `Class Project Policy`
4. Continue to edit (don't publish yet)

### 15.2: Add Title Section

1. The page starts with a default section
2. Click **+** to add a web part → Select **Text**
3. Type: `Class Project Policy`
4. Select the text and format:
   - Click **Heading 1** style
   - Click **Center align**

### 15.3: Add Policy Card Section

**Create the section:**

1. Hover below the title and click the **+** line to add a new section
2. Click the section divider → **Edit section**
3. Under **Layout**, select **One column**
4. Under **Background**, select **Neutral** (light gray)
5. Click **Apply**

**Add the Image:**

6. Click **+** inside the section → Select **Image**
7. Upload the Tormach CNC machine photo
8. After upload, resize if needed (use corner handles)

**Add the Policy Description:**

9. Click **+** below the image → Select **Text**
10. Paste the description:

```
To ensure the success of class-wide projects utilizing the Fabrication Lab, we require a 30-minute consultation at the beginning of each semester. This consultation helps us support your project's needs, reduce errors and waste, prioritize safety, and set realistic expectations. After the consultation, we will schedule the project on the lab calendar.
```

11. Press Enter twice to add spacing, then add:

```
If a consultation is not scheduled and completed by the second week of the semester, we will not be able to accommodate your project or class.
```

12. Select the second paragraph (the warning) and format as **Bold**

**Add the Form Instructions:**

13. Click **+** below the policy text → Select **Text**
14. Type: `Please Submit One Form Per Course`
15. Select the text and format:
    - Click **Bold**
    - Click **Underline**
    - Click **Center align**

**Add the Form Button:**

16. Click **+** below the instructions → Select **Button**
17. Configure the button:
    - **Label**: `Class Project Form`
    - **Link**: `https://forms.office.com/r/Zqzn6yZ64S`
18. Click **Alignment** → Select **Center**

### 15.4: Update Navigation

Add this page to the site navigation:

1. Click **Edit** at the bottom of the left navigation panel
2. Click **+ Add link**
3. Enter:
   - **Label**: `Class Project Policy`
   - **URL**: `/SitePages/Class-Project-Policy.aspx`
4. Leave **Audiences** blank (visible to everyone)
5. Drag to position it appropriately (after Lab Rules or Safety)
6. Click **Save**

### 15.5: Publish the Page

1. Review all sections — verify backgrounds are set correctly
2. Click **Publish** in the top-right corner

### 15.6: Verification Checklist

After building the page, verify:

- [ ] Title "Class Project Policy" displays centered at top
- [ ] Hero section shows Tormach CNC image
- [ ] Consultation policy paragraph displays correctly
- [ ] Deadline warning is bold
- [ ] "Please Submit One Form Per Course" is bold, underlined, and centered
- [ ] "Class Project Form" button is centered
- [ ] Button opens the Microsoft Forms link when clicked
- [ ] Card section has neutral (gray) background
- [ ] Page is added to site navigation

---

## Troubleshooting

### Students Can See Staff Navigation Items

**Cause:** Audience targeting not configured correctly

**Fix:**
1. Edit navigation
2. Click the staff-only item
3. Verify audience is set to "Digital Fabrication Lab Members"
4. Save navigation

### Students Can Access AuditLog/Staff Lists

**Cause:** Permissions inheritance not broken

**Fix:**
1. Go to the list settings → Permissions
2. Verify "Stop Inheriting Permissions" was clicked
3. Verify Visitors group was removed

### Students See All PrintRequests Items

**Cause:** Item-level permissions not configured

**Fix:**
1. Go to PrintRequests → List settings → Advanced settings
2. Set Read access to "Read items that were created by the user"
3. Click OK

### Navigation Changes Not Appearing

**Cause:** Browser caching

**Fix:**
1. Hard refresh the page (Ctrl+F5)
2. Clear browser cache
3. Try in InPrivate/Incognito window

### Page Not Found Errors

**Cause:** Page URL mismatch or page not published

**Fix:**
1. Verify page is published (not draft)
2. Check URL matches (spaces become hyphens: "Lab Rules" → "Lab-Rules.aspx")
3. Verify page exists in Site Pages library

---

## Content Migration Notes

When ready to migrate content from Moodle, for each page:

1. Open the Moodle HTML file
2. Identify content sections
3. Edit the SharePoint page
4. Use appropriate web parts:
   - **Text** for paragraphs and formatted content
   - **Image** for standalone images
   - **Image gallery** for multiple images
   - **Embed** for videos (YouTube, Stream)
   - **Quick links** for link collections
   - **Button** for call-to-action links
   - **Divider** for visual separation
   - **Power Apps** for the Student Print Portal (Additive page only)
5. Copy/paste text content (formatting may need adjustment)
6. Upload images to Site Assets or directly in web parts
7. Republish the page

> 💡 **Tip:** SharePoint text web parts support basic HTML. You can sometimes paste HTML directly, but complex formatting may not transfer perfectly.

> 📱 **Note for Additive page:** After migrating 3D printing content from Moodle, add the Student Print Portal app at the bottom of the page (see Step 10). This gives students both educational content and print request functionality in one place.

---

## Appendix A: Lab Rules Page Content

Use the following content when building the Lab Rules page. Copy each section into SharePoint Text web parts.

---

**To ensure a safe and productive environment in the Fabrication Lab, please adhere to the following rules. For detailed hazard information and OSHA guidelines, see the Safety page.**

---

### General Safety Rules

- **PPE Required:** Safety glasses (Z87+) at all times; hearing protection when CNC Router is running; gloves as specified for tasks.
- **Proper Attire:** No loose hair, clothing, or jewelry. Wear long pants and closed-toed shoes.
- **No Food or Drink:** Unsealed or uncovered food and drinks are not allowed.

---

### Additive/Subtractive Labs

- **Authorized Access Only:** Only trained and authorized users may operate lab equipment. Do not use equipment you are not trained on.
- **Machine Operation:**
  - Follow all operating procedures for each machine.
  - Do not leave machines unattended while in operation.
  - Report malfunctioning equipment to lab staff immediately.
- **File Submission:** See the Additive or Subtractive page for file requirements and submission procedures.

---

### Usage Etiquette

- **Time Management:** Be mindful of time on machines. Book in advance if required and arrive on time.
- **Shared Resources:**
  - Do not monopolize equipment or resources.
  - Return tools and materials to their proper place.
  - Do not remove anything from the lab, including unpaid prints.
  - 3D prints and milled work are lab property until paid for.
  - Do not place bags, drinks, or food on machines.
- **Lab Access:** Use the lab during designated hours only. No unauthorized persons.

---

### Communication and Reporting

- Report issues or concerns to lab staff promptly.
- Provide feedback to help improve lab operations.

---

### Housekeeping

- Keep work areas clean and free of debris.
- Dispose of waste properly; address spills immediately.
- See Safety page for detailed spill and chemical disposal procedures.

---

### Emergency Procedures

- **Emergency Exits:** Know the location of exits and evacuation routes.
- **Fire Extinguishers:** Know their locations and how to use them.
- **First Aid:** Be aware of first aid kit locations.
- **Emergency Contacts:** See Safety page for contact numbers.

---

**Stay safe and happy fabricating!**

