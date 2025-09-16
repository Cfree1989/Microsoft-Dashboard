# Microsoft Dashboard - 3D Print Queue System
*Planning & Implementation Tracker*

## Background and Motivation

### Project Context
Building a **comprehensive 3D Print Request Queue Management System** for LSU's Fabrication Lab using entirely Microsoft Power Platform technologies. The system must handle student submissions, staff workflow management, complete audit trails, and maintain security/privacy requirements.

### Key Requirements
- **Internal LSU accounts only** (no external access)
- **No workstation authentication** dependencies  
- **File management via SharePoint** (attachments on list items)
- **Complete staff attribution** on every action
- **Full audit logging** of all changes and activities
- **Item-level security** (students see only their requests)
- **No analytics/reporting** in MVP (keep simple)
- **No-code/low-code approach** with ready-to-use formulas

### Success Criteria
✅ Students can submit 3D print requests with file attachments  
✅ Staff can manage queue through intuitive interface  
✅ All actions are logged with proper attribution  
✅ Email notifications work automatically  
✅ Security model prevents data leaks between students  
✅ System is maintainable by non-technical staff  

---

## Key Challenges and Analysis

### Technical Challenges Identified
1. **Person Field Complexity**: SharePoint Person columns require specific claim formatting in Power Apps
2. **Delegation Warnings**: Large datasets may trigger delegation warnings in Power Apps galleries  
3. **Flow Reliability**: Power Automate flows need error handling for production use
4. **Permission Complexity**: Item-level permissions + staff access requires careful setup
5. **Field Mapping**: Internal column names vs display names can cause confusion

### Risk Assessment  
- **HIGH**: PowerShell script execution (requires proper permissions)
- **MEDIUM**: Power Apps Person field patching (technical syntax)  
- **LOW**: SharePoint list creation (well-documented process)
- **LOW**: Flow building (step-by-step guides provided)

### Architectural Decisions Made
- **SharePoint Lists over SQL**: Native M365 integration, built-in security
- **Attachments over Document Library**: Simpler for MVP, easier association
- **Canvas App over Model-Driven**: More control over UX for staff workflows  
- **Multiple Flows over Single**: Better error isolation and maintainability

---

## High-level Task Breakdown

### Phase 0: Critical Gap Resolution (2-3 hours) **[NEW - PRIORITY]**
**Goal**: Address architectural mismatches identified in ChatGPT analysis before foundation work

#### Task 0.1: Status Model Unification 
- **Outcome**: Single truth table mapping Microsoft ↔ Masterplan statuses
- **Acceptance Criteria**:
  - Status choices reduced from 12+ to 6-8 core statuses  
  - Clear mapping between internal codes, directory names, and UI labels
  - Decision: Rename existing choices OR add mapping column
- **Estimated Time**: 1 hour
- **Risk**: Analytics breakage, staff confusion, migration pain
- **Deliverable**: Updated provisioning script with unified status model

#### Task 0.2: File Handling Enhancement
- **Outcome**: Simplified local file workflow documented  
- **Acceptance Criteria**:
  - Staff downloads attachments locally for PrusaSlicer work
  - No re-upload or file versioning complexity needed
  - Status updates handled through Power Apps dashboard only  
  - Clear workflow documented for staff file management
- **Estimated Time**: 15 minutes (simplified approach)  
- **Risk**: Minimal - standard local file workflow
- **Deliverable**: Staff workflow documentation for local file handling

#### Task 0.3: Field Structure Refinement ✅ COMPLETED
- **Outcome**: Simplified student vs staff field separation implemented
- **Acceptance Criteria**:
  - Student fields reduced to 9 essential project definition fields
  - Staff fields focused on operational management (8 fields)
  - Printer selection includes build plate dimensions for self-service sizing
  - Method choice (Filament/Resin) replaces complex material parameters
- **Estimated Time**: 45 minutes (completed)
- **Risk**: Minimal - cleaner architecture reduces complexity
- **Deliverable**: Updated field structure across all documentation

### Phase 1: Foundation Setup (3-4 hours)
**Goal**: Establish SharePoint foundation with proper security

#### Task 1.1: SharePoint Site Preparation  
- **Outcome**: Site exists with proper groups and permissions
- **Acceptance Criteria**: 
  - Site accessible at target URL
  - "Fabrication Lab Staff" owners group created  
  - "LSU Students" members group configured
- **Estimated Time**: 30 minutes
- **Dependencies**: Site collection admin rights

#### Task 1.2: Run Provisioning Script
- **Outcome**: All lists, columns, views, and permissions configured  
- **Acceptance Criteria**:
  - 3 lists created: PrintRequests, AuditLog, Staff
  - All 25+ columns added to PrintRequests with correct types
  - Item-level permissions enabled on PrintRequests
  - Status column formatting applied (color chips)
  - Views created: "My Requests", "Staff - Queue"
- **Estimated Time**: 1-2 hours (including troubleshooting)
- **Dependencies**: PnP.PowerShell installed, site owner permissions
- **Command**: `pwsh ./SharePoint/Provision-FabLab.ps1 -SiteUrl "https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab"`

#### Task 1.3: Staff List Population
- **Outcome**: Staff list populated with team members
- **Acceptance Criteria**: 
  - All staff members added with correct roles
  - Active flags set properly
  - Test user accounts available for testing
- **Estimated Time**: 30 minutes  
- **Dependencies**: Task 1.2 complete

#### Task 1.4: Validation Testing
- **Outcome**: SharePoint foundation verified working
- **Acceptance Criteria**:
  - Can create test items in PrintRequests
  - Item-level permissions working (students see only their items)
  - Status formatting displays correctly
  - All columns accept appropriate data types
- **Estimated Time**: 1 hour
- **Dependencies**: Tasks 1.1-1.3 complete

### Phase 2: Power Automate Flows (4-5 hours)  
**Goal**: Automated workflows for request processing and audit logging

#### Task 2.1: Build Flow A (PR-Create)
- **Outcome**: New requests get ReqKey and send confirmation emails
- **Acceptance Criteria**:
  - ReqKey generated in format "REQ-00001"
  - StudentEmail populated from author
  - AuditLog entry created for "Created" action  
  - Email sent to student with request link
  - Flow handles errors gracefully
- **Estimated Time**: 2 hours
- **Dependencies**: Task 1.2 complete

#### Task 2.2: Build Flow B (PR-Audit)  
- **Outcome**: All field changes automatically logged
- **Acceptance Criteria**:
  - Triggers on create/modify of PrintRequests
  - Detects changes to key fields (Status, Priority, etc.)
  - Creates AuditLog entries with proper field names
  - Distinguishes between Status changes vs other updates
  - Handles attachment changes
- **Estimated Time**: 2-3 hours  
- **Dependencies**: Task 2.1 complete

#### Task 2.3: Build Flow C (PR-Action)
- **Outcome**: Staff console actions logged to AuditLog  
- **Acceptance Criteria**:
  - Accepts parameters from Power Apps
  - Retrieves ReqKey from PrintRequests item
  - Creates detailed AuditLog entry  
  - Returns success confirmation to Power Apps
  - Properly maps Person fields
- **Estimated Time**: 1 hour
- **Dependencies**: Task 2.2 complete  

#### Task 2.4: Flow Integration Testing
- **Outcome**: All flows work together without conflicts
- **Acceptance Criteria**:
  - Create request → Flow A triggers properly
  - Modify request → Flow B logs changes  
  - Manual testing of Flow C with sample data
  - No duplicate audit entries created
  - Email delivery confirmed
- **Estimated Time**: 1 hour
- **Dependencies**: Tasks 2.1-2.3 complete

### Phase 3: Power Apps Development (6-8 hours)
**Goal**: User interfaces for students and staff

#### Task 3.1: Customize Student Form
- **Outcome**: SharePoint form optimized for student submissions
- **Acceptance Criteria**:
  - Student and StudentEmail auto-populated
  - Status defaults to "Submitted"  
  - Staff-only fields hidden from students
  - Form validation works properly
  - Success message displays after submission
- **Estimated Time**: 2 hours
- **Dependencies**: Task 1.4 complete

#### Task 3.2: Staff Console - Basic Structure
- **Outcome**: Canvas app shell with data connections
- **Acceptance Criteria**:
  - App connects to all 3 SharePoint lists
  - Staff detection logic working (varIsStaff)
  - Basic queue gallery displays items
  - Person record building (varActor) functional
- **Estimated Time**: 2 hours  
- **Dependencies**: Task 2.4 complete

#### Task 3.3: Staff Console - Action Buttons
- **Outcome**: Status change buttons with audit logging
- **Acceptance Criteria**:
  - Approve, Reject, Queue buttons working
  - Printing status buttons (Start, Pause, Complete) 
  - "Ready for Pickup", "Picked Up" buttons
  - All buttons call Flow C for logging
  - Success notifications display
- **Estimated Time**: 3-4 hours
- **Dependencies**: Task 3.2 complete

#### Task 3.4: Staff Console - Polish & Testing
- **Outcome**: Production-ready staff interface
- **Acceptance Criteria**:
  - Error handling for failed operations
  - Loading states/disable during operations
  - Assignment to self functionality
  - Search/filter capabilities
  - Responsive design verified
- **Estimated Time**: 2 hours
- **Dependencies**: Task 3.3 complete

### Phase 4: Integration & Production Prep (2-3 hours)
**Goal**: End-to-end system validation and launch prep

#### Task 4.1: End-to-End Testing
- **Outcome**: Complete workflow validation
- **Acceptance Criteria**:
  - Student submits request → gets ReqKey & email
  - Staff approves → status updates, audit logged
  - Multiple field changes → proper audit trail
  - File attachments → handled correctly
  - Permission boundaries respected
- **Estimated Time**: 1.5 hours
- **Dependencies**: Task 3.4 complete

#### Task 4.2: Production Deployment
- **Outcome**: System live for actual use
- **Acceptance Criteria**:
  - Apps shared with proper security groups
  - Flows published and enabled
  - SharePoint permissions verified
  - Documentation accessible to staff
  - Backup/recovery plan documented
- **Estimated Time**: 1 hour  
- **Dependencies**: Task 4.1 complete

#### Task 4.3: User Training & Handoff
- **Outcome**: Team can operate the system independently  
- **Acceptance Criteria**:
  - Staff trained on console operations
  - Students understand submission process
  - Troubleshooting guide created
  - System ownership transferred
- **Estimated Time**: 30 minutes
- **Dependencies**: Task 4.2 complete

---

## Project Status Board

### 🔴 CRITICAL - IMMEDIATE ACTION REQUIRED  
- [x] **Phase 0.1**: Status Model Unification ✅ COMPLETED
- [x] **Phase 0.2**: File Handling Enhancement (SIMPLIFIED APPROACH) ✅ COMPLETED  
- [x] **Phase 0.3**: Field Structure Refinement ✅ COMPLETED

### 🟢 READY TO START (Phase 0 Complete!)
- [ ] **Phase 1.1**: SharePoint Site Preparation
- [ ] **Phase 1.2**: Run Provisioning Script  
- [ ] **Phase 1.3**: Staff List Population
- [ ] **Phase 1.4**: Validation Testing

### ⏳ AWAITING DEPENDENCIES  
- [ ] **Phase 2.1**: Build Flow A (PR-Create)
- [ ] **Phase 2.2**: Build Flow B (PR-Audit)
- [ ] **Phase 2.3**: Build Flow C (PR-Action)
- [ ] **Phase 2.4**: Flow Integration Testing
- [ ] **Phase 3.1**: Customize Student Form
- [ ] **Phase 3.2**: Staff Console - Basic Structure
- [ ] **Phase 3.3**: Staff Console - Action Buttons
- [ ] **Phase 3.4**: Staff Console - Polish & Testing
- [ ] **Phase 4.1**: End-to-End Testing
- [ ] **Phase 4.2**: Production Deployment
- [ ] **Phase 4.3**: User Training & Handoff

### 📊 PROJECT METRICS
- **Total Estimated Time**: 17-23 hours (updated after gap analysis)
- **Critical Path**: **Gap Resolution → SharePoint → Flows → Staff Console → Testing**
- **Team Size Needed**: 1 (with occasional stakeholder input)
- **Key Dependencies**: Site permissions, PnP PowerShell, Power Platform licenses
- **Risk Mitigation**: +2-3 hours upfront to prevent weeks of operational issues

---

## Executor's Feedback or Assistance Requests

### 📋 PRD Creation Task (Executor Mode) - ✅ COMPLETED + UPDATED
**Status**: COMPLETED - Professional PRD delivered with operational clarification
**Deliverables**: 
- `PRD_Creation_Assistant.md` - PRD creation framework and session log
- `Fabrication Lab_3D_Print_System_PRD.md` - Comprehensive 34-page PRD document  
**Achievement**: Successfully transformed Build Guide.md (706 lines) into executive-ready PRD with 27 detailed features, user personas, success metrics, and implementation roadmap
**Business Value**: Professional stakeholder alignment document ready for project approval and development handoff
**Key Update**: Clarified operational preference for **shared queue approach** - no individual request assignment, all staff can work on any request collectively  
**Technical Update**: Build Guide and PowerApps spec updated to remove automatic AssignedTo assignment in Approve button  
**File Naming Implementation**: Added standardized file naming convention from masterplan (`FirstAndLastName_PrintMethod_Color_SimpleJobID.extension`) with Power Automate expressions and PowerShell functions  
**Dashboard Design**: Created complete Power Apps Canvas app design guide matching Dashboard.png - clean navigation, no refresh functionality needed (Power Apps handles data updates natively)  
**Lightbulb Toggle Feature**: Enhanced dashboard with animated glow effects for job attention management - lightbulb ON/OFF toggle with pulsing gold animation, requires NeedsAttention (Yes/No) SharePoint field  
**UI Refinement**: Removed "Open File" button from action buttons since SharePoint attachments don't support external launch functionality  
**Archive Button Implementation**: Added complete Power Fx implementation for Archive button with proper flow integration, error handling, and user feedback notifications

### 🚨 CRITICAL ANALYSIS RECEIVED (ChatGPT Review)
**Status**: NEW - Requires immediate planning decisions before implementation

**Key Findings from Build Guide Issues Analysis**:
✅ **Validation**: Microsoft MVP confirmed as "absolutely buildable" with clear scope
⚠️ **Critical Gaps**: 5 architectural mismatches between Masterplan and Build Guide identified
🔧 **Action Required**: Phase 0 added to address gaps before foundation work

**Priority Issues Requiring Decisions**:
1. **Status Model Crisis**: Build Guide uses 12+ statuses vs Masterplan's 6 core statuses
   - **Decision Needed**: Rename existing OR add mapping column approach
   - **Impact**: Analytics breakage, staff confusion if not resolved

2. **File Handling Gap**: No authoritative file selection or "open in slicer" equivalent  
   - **Decision Needed**: Approve PrimaryAttachment column addition
   - **Impact**: Re-print errors, workflow breakdown without this

3. **File Validation Missing**: No type/size constraints vs Masterplan's strict validation
   - **Decision Needed**: Confirm .stl/.obj/.3mf only, 50MB limit enforcement
   - **Impact**: Silent failures, security risks

**Implementation Status**:
- Implemented flow doc improvements: standardized Compose naming, added FlowRunId, and concurrency note
- Enhanced provisioning script: added #Requires, fail-fast errors, unique ReqKey, and indexes  
- Updated Power Apps guidance: added IfError to Approve handler and tip to cache User().Email

**Pending Decisions**:
- PRIORITY: Begin Phase 1 SharePoint foundation work (3-4 hour investment)
- Secondary: SP list item-level unique index for ReqKey collisions messaging in UI
- Secondary: Whether to add additional views beyond basic requirements

**Status Model Resolution (COMPLETED)**:
- ✅ **Unified Status Model Created** - Aligned Build Guide with masterplan's proven 8-status model
- ✅ **Documentation Updated** - All references updated across Build Guide, Prompts.md
- ✅ **Implementation Ready** - SharePoint column choices, Power Apps arrays, JSON formatting all aligned
- 🎯 **Result**: Crisis resolved - consistent status model across all documentation

**File Validation Framework (COMPLETED)**:
- ✅ **Student Form Enhanced** - Added clear helper text for file requirements (.stl/.obj/.3mf only, 50MB max)
- ✅ **Staff Rejection Workflow** - Implemented File Validation Reject button with automatic logging
- ✅ **Testing Procedures** - Added file validation test cases to end-to-end testing section
- ✅ **Policy Documentation** - Clear guidance for staff on checking file compliance
- 🎯 **Result**: Security gap closed - system now has enforceable file validation with clear workflows

**Build Guide Email Enhancement (COMPLETED)**:
- ✅ **Automated Rejection Emails** - Enhanced Flow B to automatically email students when requests are rejected
- ✅ **Automated Completion Emails** - Enhanced Flow B to automatically email students when prints are ready for pickup  
- ✅ **Email Audit Trail** - All automated emails logged in AuditLog with System attribution
- ✅ **Testing Updates** - Added email testing procedures to end-to-end testing section
- 🎯 **Result**: Complete automated student communication workflow implemented for key status changes

**File Handling Enhancement (COMPLETED - SIMPLIFIED)**:
- ✅ **Simplified Workflow Adopted** - Staff download attachments locally, work in PrusaSlicer, no re-uploads needed
- ✅ **Complexity Eliminated** - Removed PrimaryAttachment columns and file versioning requirements 
- ✅ **Status-Only Updates** - Power Apps dashboard handles status changes only, no file management complexity
- ✅ **MVP-Focused** - Practical approach that gets system working without over-engineering
- 🎯 **Result**: File workflow simplified to essential MVP functionality - download, work locally, update status

**Field Structure Refinement (COMPLETED)**:
- ✅ **Student Fields Simplified** - Reduced from 15+ fields to 9 focused project definition fields
- ✅ **Staff Control Enhanced** - 8 dedicated staff fields for operational management and audit trail
- ✅ **Printer Selection UX** - Built-in build plate dimensions (9.8×8.3×8.7in, 14.2×14.2×14.2in, etc.) for self-service sizing
- ✅ **Method-Driven Workflow** - Filament/Resin choice drives logical printer filtering (Form 3 resin-only)
- ✅ **Documentation Updated** - Provisioning script, Power Apps specs, SharePoint formatting, and Build Guide all aligned
- ✅ **Build Guide Enhanced** - Added benefits explanation, updated time estimates (12.5-17 hrs vs 17-26 hrs)
- ✅ **Reduced Complexity** - Eliminated technical parameters (infill, layer height, supports) from student interface
- 🎯 **Result**: Clean separation of concerns - students focus on project definition, staff manage technical execution

---

## Refined Field Structure (Student vs Staff Separation)

### Student-Facing Fields (9 Total)
**Focus**: Project definition and basic specifications

| Field | Type | Choices/Notes | Purpose |
|-------|------|---------------|---------|
| Title | Single line of text | Request title | Project description |
| ReqKey | Single line of text | Auto-filled by flow (REQ-00042) | Unique tracking identifier |
| Student | Person | Required, auto-filled | Requester identification |
| StudentEmail | Single line of text | Auto-filled from account | Contact information |
| Course | Single line of text | Optional | Academic context |
| Department | Choice | Architecture; Engineering; Art & Design; Other | Organizational routing |
| ProjectType | Choice | Class Project; Research; Personal; Other | Priority/billing context |
| Color | Choice | Any; Black; White; Gray; Red; Green; Blue; Yellow; Other | Aesthetic preference |
| Method | Choice | Filament; Resin | Print technology selection |
| Printer Selection | Choice | See printer specs below | Equipment + size constraints |
| DueDate | Date | Optional | Timeline planning |
| Notes | Multiple lines of text | Plain text | Additional instructions |

### Staff-Only Fields (8 Total)  
**Focus**: Operational management and audit trail

| Field | Type | Choices/Notes | Purpose |
|-------|------|---------------|---------|
| Status | Choice | Uploaded; Pending; Ready to Print; Printing; Completed; Paid & Picked Up; Rejected; Archived | Workflow state management |
| Priority | Choice | Low; Normal; High; Rush | Queue prioritization |
| EstHours | Number | Staff estimation | Time planning |
| Weight Estimate | Number | Staff estimation | Material costing |
| StaffNotes | Multiple lines of text | Internal only | Staff communication |
| LastAction | Choice | Created; Updated; Status Change; File Added; Approved; Rejected; Printing; Completed; Picked Up; Comment Added; Email Sent | Audit trail categorization |
| LastActionBy | Person | Auto-filled | Accountability tracking |
| LastActionAt | Date and Time | Auto-filled timestamp | Audit trail timing |

### Printer Selection with Build Plate Dimensions

**Students will see size constraints to self-select appropriate printer:**

| Printer | Method | Build Plate (inches) | Notes |
|---------|--------|----------------------|-------|
| Prusa MK4S | Filament | 9.8 × 8.3 × 8.7 | High-quality FDM, good for detailed work |
| Prusa XL | Filament | 14.2 × 14.2 × 14.2 | Large format FDM, multi-color capable |
| Raised3D Pro 2 Plus | Filament | 12.0 × 12.0 × 13.4 | Professional FDM, reliable for complex prints |
| Form 3 | Resin | 5.7 × 5.7 × 7.3 | SLA printer, high detail, limited to resin method |

**UX Design**: When student selects "Resin" method, printer choices filter to show only Form 3. When selecting "Filament", all FDM printers display with their build volumes in inches.

### Benefits of Refined Structure
✅ **Student Experience**: Simplified from 15+ fields to 9 focused project fields  
✅ **Staff Control**: All technical decisions (infill, layer height, supports) managed by experts  
✅ **Self-Service Sizing**: Students see build plate dimensions and select appropriate printer  
✅ **Workflow Efficiency**: Method + Printer combination creates logical decision tree  
✅ **Reduced Rejections**: Size constraints visible upfront prevent "doesn't fit" issues  

---

## Unified Status Model (Masterplan Alignment)

### Core Status Workflow
**Primary Flow**: `Uploaded` → `Pending` → `Ready to Print` → `Printing` → `Completed` → `Paid & Picked Up` → `Archived`  
**Rejection Flow**: `Uploaded` → `Rejected` → `Archived`

### Status Mapping Table

| **Unified Status** | **Internal Code** | **Directory** | **Description** | **Old Build Guide** |
|-------------------|------------------|---------------|-----------------|-------------------|
| Uploaded | UPLOADED | Uploaded/ | Student submission received | Submitted |
| Pending | PENDING | Pending/ | Awaiting student confirmation | Approved → Needs student confirm |
| Ready to Print | READYTOPRINT | ReadyToPrint/ | Student confirmed, ready for printing | Queued |
| Printing | PRINTING | Printing/ | Currently being printed | Printing |
| Completed | COMPLETED | Completed/ | Print finished, awaiting pickup | Completed |
| Paid & Picked Up | PAIDPICKEDUP | PaidPickedUp/ | Final successful state | Picked Up |
| Rejected | REJECTED | Rejected/ | Staff rejected submission | Rejected |
| Archived | ARCHIVED | Archived/ | Long-term storage | (new) |

### Removed Build Guide Statuses
**Consolidated/Removed** (with rationale):
- ~~"Intake Review"~~ → Merged with "Uploaded" (staff review happens in Uploaded status)
- ~~"Approved"~~ → Renamed to "Pending" (awaiting student confirmation)  
- ~~"Needs Info"~~ → Use email/notes workflow instead of separate status
- ~~"Ready for Pickup"~~ → Renamed to "Completed"
- ~~"Paused", "Failed", "Canceled"~~ → Handle via notes/admin actions, not separate statuses

### Advantages of Unified Model
✅ **Consistency**: Matches proven masterplan workflow  
✅ **Simplicity**: 8 statuses vs 13 reduces complexity  
✅ **File System Alignment**: Status names map directly to directory structure  
✅ **Analytics Ready**: Compatible with masterplan reporting  
✅ **Migration Path**: Clear upgrade path to full system  

---

## Lessons

### Technical Notes
- **Person Field Claims**: Always use `"i:0#.f|membership|" & Lower(User().Email)` format
- **Delegation**: Filter galleries with explicit OR conditions rather than "in" operator for better performance
- **Flow Testing**: Always test with real user accounts, not admin accounts for permission validation
- **Column Names**: Use consistent internal names in provisioning script to avoid Power Apps mapping issues
- **File Validation**: Use helper text + staff rejection workflow rather than client-side validation for security

### Implementation Strategy  
- **Start with SharePoint foundation** - everything depends on proper list structure
- **Test each flow individually** before building the staff console  
- **Use staged rollout** - start with staff testing before opening to students
- **Keep audit trail simple** in MVP - can enhance later based on needs
- **Simplify file handling** - For MVP, local download/work/status updates beats complex file versioning systems
- **Lightbulb toggle pattern** - Use Icon.Lightbulb/LightbulbSolid with color animation for clear on/off states; Timer control needed for glow effects

---

## Decision History

| Decision | Rationale | Alternative Considered |
|----------|-----------|----------------------|
| SharePoint Lists vs Custom DB | Native M365 integration, built-in security | Custom database would require hosting and additional security |
| Attachments vs Document Library | Simpler association model for MVP | Document library provides better file management but complex permissions |
| Canvas vs Model-Driven App | More UX control for staff workflows | Model-driven would be faster to build but less flexible |
| Multiple Flows vs Monolithic | Better error isolation and maintainability | Single flow would be simpler but harder to troubleshoot |
| Local File Workflow vs Authoritative File System | MVP simplicity, eliminates complex versioning | PrimaryAttachment columns would provide better file tracking but add complexity |

---

## Quick Reference

### Key URLs
- **SharePoint Site**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **PrintRequests List**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests`  
- **Staff Console App**: *TBD after creation*

### Important Internal Names
- Status: `Status`, Student: `Student`, ReqKey: `ReqKey`
- AssignedTo: `AssignedTo`, LastActionBy: `LastActionBy`
- Staff list Member field: `Member`

### Flow Names (Planned)
- `PR-Create_SetReqKey_Acknowledge`
- `PR-Audit_LogChanges` 
- `PR-Action_LogAction`
