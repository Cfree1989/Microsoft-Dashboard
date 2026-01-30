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
├── Home (NEW - Student-facing landing page, site default)
│   └── Moodle-style welcome, student quick links
│
├── Lab Hub (RENAMED from existing "Home" - Staff only)
│   └── Staff docs, TigerCASH Log, Schedule, Master SOP, etc.
│
├── Student Pages (visible to everyone)
│   ├── Additive (3D printing info)
│   ├── Subtractive (CNC/laser info)
│   ├── Class Projects (course guidelines)
│   ├── Resources (downloads/guides)
│   ├── Feedback (surveys/contact)
│   ├── Lab Rules (policies)
│   ├── Safety (requirements)
│   ├── My Print Requests (filtered to own items)
│   └── Submit Request (Power App form)
│
└── Staff-Only (audience-targeted, Members only)
    ├── Lab Hub (staff operations page)
    ├── Print Lab Dashboard (Power App)
    ├── PrintRequests (full list)
    ├── RequestComments (messaging)
    ├── AuditLog (tracking)
    └── Staff (team management)
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

### 4.0: Rename Existing Home Page to "Lab Hub" (Staff Operations)

Your current Home page contains staff-focused content (TigerCASH Log, Schedule, Master SOP, etc.). We'll keep this as a staff-only operations page.

1. Go to **Site contents** → **Site Pages**
2. Find the current **Home** page
3. Click the **...** (ellipsis) next to it → **Rename**
4. Change the name to: `Lab Hub`
5. Click **Rename**

> 💡 **Alternative Method:** Open the page, click **Page details** in the toolbar, and edit the page name there.

**Result:** Your existing staff operations page is now called "Lab Hub" and will be configured as staff-only in navigation later. The URL will change to `/SitePages/Lab-Hub.aspx`.

---

### 4.1: Create Home Page (Student Landing)

Create a new student-facing Home page that will become the site's default landing page.

**To create a modern Site page:**

1. Go to the **site home** (click site name "Digital Fabrication Lab" in header)
2. Click **+ New** in the top command bar
3. Select **Page**
4. The **Template gallery: Pages** will appear with pre-built templates

**Choose a template:**

| Option | Description |
|--------|-------------|
| **Create blank** (top right) | Empty page - add your own web parts from scratch |
| **About a topic** | Pre-built layout with Hero section - recommended for Home page |
| **Visual topic introduction** | Alternative Hero-style layout |

5. Select **"About a topic"** template (or **Create blank** for full control)
6. Click the page title area and type: `Home`

**Customize the template content:**

7. **Replace the Hero section:**
   - Click on the Hero image
   - Click **Change image** → Upload your lab banner photo
   - Update any text overlays with your lab name/tagline

8. **Replace placeholder text sections:**
   - Click on text areas and replace with your content
   - Add placeholder for now:
   
   ```
   [PLACEHOLDER: Migrate welcome content from Moodle HTML]
   
   Welcome to the Digital Fabrication Laboratory...
   ```

9. **Add/modify Quick Links Section:**
   - If not present, click **+** to add a **Quick links** web part
   - Select **Compact** or **Grid** layout
   - Add links to other pages (will complete after creating all pages)

10. Click **Publish** (or **Save as draft** until all pages are ready)

> 💡 **For all remaining pages:** Use **Create blank** in the Template gallery (simpler content pages don't need a template).

---

### 4.2: Create Additive Manufacturing Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank** (top right)
3. Name the page: `Additive`
4. **Add Text Web Part:**
   - Click **+** → **Text**
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Additive Manufacturing content from Moodle HTML]
   
   Topics to cover:
   - FDM Printing (Filament)
   - Resin Printing (SLA)
   - Available Printers and Build Volumes
   - Supported File Formats (.stl, .obj, .3mf)
   - Pricing Information
   - How to Submit a Print Request
   ```

5. **Add Image Web Part (optional):**
   - Click **+** → **Image**
   - Upload printer photos

6. Click **Publish**

### 4.3: Create Subtractive Manufacturing Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `Subtractive`
4. **Add Text Web Part:**
   - Click **+** → **Text**
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Subtractive Manufacturing content from Moodle HTML]
   
   Topics to cover:
   - CNC Routing
   - Laser Cutting
   - Available Equipment
   - Material Guidelines
   - Booking Procedures
   ```

5. Click **Publish**

### 4.4: Create Class Projects Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `Class Projects`
4. **Add Text Web Part:**
   - Click **+** → **Text**
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Class Projects content from Moodle HTML]
   
   Topics to cover:
   - Course-specific project guidelines
   - Assignment submission requirements
   - Examples/portfolio of past projects
   ```

5. Click **Publish**

### 4.5: Create Resources Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `Resources`
4. **Add Quick Links or Document Library Web Part:**
   - Click **+** → **Quick links** (for external links)
   - OR **Document library** (for file downloads)
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Resources content from Moodle HTML]
   
   Items to include:
   - Software download links (PrusaSlicer, PreForm, etc.)
   - File templates
   - Tutorial videos
   - User guides/manuals
   ```

5. Click **Publish**

### 4.6: Create Feedback Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `Feedback`
4. **Add Text Web Part:**
   - Click **+** → **Text**
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Feedback content from Moodle HTML]
   
   Options:
   - Embed Microsoft Forms survey
   - Contact information
   - Feedback submission process
   ```

5. **Optional - Embed Microsoft Form:**
   - Click **+** → **Embed**
   - Paste Microsoft Forms embed URL

6. Click **Publish**

### 4.7: Create Lab Rules Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `Lab Rules`
4. **Add Text Web Part:**
   - Click **+** → **Text**
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Lab Rules content from Moodle HTML]
   
   Topics to cover:
   - Usage policies
   - Hours of operation
   - Payment requirements
   - Equipment reservation
   - Behavioral expectations
   ```

5. Click **Publish**

### 4.8: Create Safety Page

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `Safety`
4. **Add Text Web Part:**
   - Click **+** → **Text**
   - Add placeholder:
   
   ```
   [PLACEHOLDER: Migrate Safety content from Moodle HTML]
   
   Topics to cover:
   - Required safety training
   - PPE requirements
   - Emergency procedures
   - Equipment-specific safety
   - Reporting incidents
   ```

5. Click **Publish**

### 4.9: Create My Print Requests Page

This page shows students their own print requests.

1. From the site home, click **+ New** → **Page**
2. In the Template gallery, click **Create blank**
3. Name the page: `My Print Requests`
4. **Add Text Header:**
   - Click **+** → **Text**
   - Type: `View the status of your 3D print requests below. You can only see requests you have submitted.`

5. **Add List Web Part:**
   - Click **+** → **List**
   - Select **PrintRequests**
   - The list will automatically show only the current user's items (due to item-level permissions)

6. **Configure List View:**
   - Click the web part → **Edit web part** (pencil icon)
   - Under **View**, select **My Requests** (if you created this view)
   - OR select columns to display:
     - ReqKey
     - Title
     - Status
     - Method
     - Printer
     - Color
     - EstimatedCost
     - Created

7. **Add Link to Submission Form:**
   - Click **+** → **Button** (or Quick links)
   - Text: `Submit New Print Request`
   - Link: URL to your Power Apps submission form or SharePoint form

8. Click **Publish**

---

## Step 5: Configure Site Navigation

SharePoint modern sites have left navigation that can be customized and audience-targeted.

### 5.1: Access Navigation Settings

1. Click **Settings** (gear icon) → **Change the look**
2. Click **Navigation**
3. OR: Click **Edit** at the bottom of the left navigation panel

### 5.2: Enable Audience Targeting

1. From the Navigation panel, click the **...** (ellipsis) at the top
2. Click **Enable audience targeting**
3. Confirm when prompted

> 💡 **Note:** This allows you to show/hide navigation items based on M365 security groups or SharePoint groups.

### 5.3: Configure Student-Visible Navigation

Add these items visible to **everyone** (students and staff):

| Label | Link | Audience |
|-------|------|----------|
| Home | `/SitePages/Home.aspx` | Everyone |
| Additive | `/SitePages/Additive.aspx` | Everyone |
| Subtractive | `/SitePages/Subtractive.aspx` | Everyone |
| Class Projects | `/SitePages/Class-Projects.aspx` | Everyone |
| Resources | `/SitePages/Resources.aspx` | Everyone |
| Feedback | `/SitePages/Feedback.aspx` | Everyone |
| Lab Rules | `/SitePages/Lab-Rules.aspx` | Everyone |
| Safety | `/SitePages/Safety.aspx` | Everyone |
| My Print Requests | `/SitePages/My-Print-Requests.aspx` | Everyone |
| Submit Request | [Power Apps URL or Form URL] | Everyone |

**To add each item:**

1. Click **+ Add link**
2. Enter the **Label** (display text)
3. Enter the **URL** (page path or full URL)
4. Click **OK**
5. Leave **Audiences** blank for items visible to everyone

### 5.4: Configure Staff-Only Navigation

Add these items visible to **staff only**:

| Label | Link | Audience |
|-------|------|----------|
| --- | (Separator) | - |
| Lab Hub | `/SitePages/Lab-Hub.aspx` | Digital Fabrication Lab Members |
| Print Lab Dashboard | [Power App URL] | Digital Fabrication Lab Members |
| PrintRequests | `/Lists/PrintRequests` | Digital Fabrication Lab Members |
| RequestComments | `/Lists/RequestComments` | Digital Fabrication Lab Members |
| AuditLog | `/Lists/AuditLog` | Digital Fabrication Lab Members |
| Staff | `/Lists/Staff` | Digital Fabrication Lab Members |

> 💡 **Lab Hub** is your renamed original Home page containing staff docs, TigerCASH Log, Schedule, Master SOP, etc.

**To add staff-only items:**

1. Click **+ Add link**
2. Enter the **Label**
3. Enter the **URL**
4. Click **Edit audiences** (or the people icon)
5. Type `Digital Fabrication Lab Members`
6. Select the group from the dropdown
7. Click **Save**

### 5.5: Reorder Navigation Items

1. Drag and drop items to arrange in logical order
2. Recommended order:
   ```
   Home
   Additive
   Subtractive
   Class Projects
   Resources
   Feedback
   Lab Rules
   Safety
   My Print Requests
   Submit Request
   ─────────────────
   Lab Hub                (Staff only - your original home page)
   Print Lab Dashboard    (Staff only)
   PrintRequests          (Staff only)
   RequestComments        (Staff only)
   AuditLog               (Staff only)
   Staff                  (Staff only)
   ```

3. Click **Save** when done

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
| Submit Print Request | [Power App URL] | Add icon |
| My Print Requests | /SitePages/My-Print-Requests.aspx | List icon |

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
   - [ ] My Print Requests shows ONLY their own items
   - [ ] Submit Request link works
   - [ ] Cannot access /Lists/AuditLog (permission denied)
   - [ ] Cannot access /Lists/Staff (permission denied)
   - [ ] Cannot access /Lists/RequestComments (permission denied)

### 8.3: Test Item-Level Security

1. As a student, submit a test print request
2. Go to My Print Requests page
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
| Lab Hub | /SitePages/Lab-Hub.aspx | Staff operations (renamed from original Home) | Staff Only |
| Additive | /SitePages/Additive.aspx | 3D printing information | Everyone |
| Subtractive | /SitePages/Subtractive.aspx | CNC/laser information | Everyone |
| Class Projects | /SitePages/Class-Projects.aspx | Course project guidelines | Everyone |
| Resources | /SitePages/Resources.aspx | Downloads and tutorials | Everyone |
| Feedback | /SitePages/Feedback.aspx | Survey/contact form | Everyone |
| Lab Rules | /SitePages/Lab-Rules.aspx | Usage policies | Everyone |
| Safety | /SitePages/Safety.aspx | Safety requirements | Everyone |
| My Print Requests | /SitePages/My-Print-Requests.aspx | Student's own requests | Everyone |

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
| Home | Everyone | Page (Student landing) |
| Additive | Everyone | Page |
| Subtractive | Everyone | Page |
| Class Projects | Everyone | Page |
| Resources | Everyone | Page |
| Feedback | Everyone | Page |
| Lab Rules | Everyone | Page |
| Safety | Everyone | Page |
| My Print Requests | Everyone | Page |
| Submit Request | Everyone | External Link |
| Lab Hub | Staff Only | Page (Staff operations) |
| Print Lab Dashboard | Staff Only | External Link |
| PrintRequests | Staff Only | List |
| RequestComments | Staff Only | List |
| AuditLog | Staff Only | List |
| Staff | Staff Only | List |

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
- [ ] Existing Home page renamed to "Lab Hub" (staff operations)
- [ ] New Home.aspx created (student landing) and set as site homepage
- [ ] Additive.aspx created
- [ ] Subtractive.aspx created
- [ ] Class-Projects.aspx created
- [ ] Resources.aspx created
- [ ] Feedback.aspx created
- [ ] Lab-Rules.aspx created
- [ ] Safety.aspx created
- [ ] My-Print-Requests.aspx created with List web part

### Navigation Configured
- [ ] Audience targeting enabled on navigation
- [ ] All student pages added to navigation (visible to Everyone)
- [ ] Lab Hub configured with Members audience (staff only)
- [ ] Staff-only items configured with Members audience
- [ ] Submit Request link added
- [ ] Unnecessary items removed (3D File Submission, etc.)

### Testing Complete
- [ ] Staff can see all navigation and lists
- [ ] Students see only student navigation
- [ ] Students cannot access staff-only lists
- [ ] PrintRequests item-level security working
- [ ] Home page loads as site default

---

## Next Steps

1. **Migrate Content:** Work through each page and migrate content from Moodle HTML
2. **Add Media:** Upload images and videos to pages
3. **Configure Forms:** Set up Microsoft Forms for feedback if desired
4. **Train Staff:** Walk through the dual-view system with lab staff
5. **Announce to Students:** Communicate the new portal URL

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
5. Copy/paste text content (formatting may need adjustment)
6. Upload images to Site Assets or directly in web parts
7. Republish the page

> 💡 **Tip:** SharePoint text web parts support basic HTML. You can sometimes paste HTML directly, but complex formatting may not transfer perfectly.

