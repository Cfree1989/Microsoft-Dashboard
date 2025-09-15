# Microsoft Dashboard - 3D Print Queue System
*Planning & Implementation Tracker*

## Background and Motivation

### Project Context
Building a **comprehensive 3D Print Request Queue Management System** for LSU's FabLab using entirely Microsoft Power Platform technologies. The system must handle student submissions, staff workflow management, complete audit trails, and maintain security/privacy requirements.

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

### Phase 1: Foundation Setup (3-4 hours)
**Goal**: Establish SharePoint foundation with proper security

#### Task 1.1: SharePoint Site Preparation  
- **Outcome**: Site exists with proper groups and permissions
- **Acceptance Criteria**: 
  - Site accessible at target URL
  - "FabLab Staff" owners group created  
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

### 🟡 READY TO START
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
- **Total Estimated Time**: 15-20 hours
- **Critical Path**: SharePoint → Flows → Staff Console → Testing
- **Team Size Needed**: 1 (with occasional stakeholder input)
- **Key Dependencies**: Site permissions, PnP PowerShell, Power Platform licenses

---

## Executor's Feedback or Assistance Requests

- Implemented flow doc improvements: standardized Compose naming, added FlowRunId, and concurrency note.
- Enhanced provisioning script: added #Requires, fail-fast errors, unique ReqKey, and indexes.
- Updated Power Apps guidance: added IfError to Approve handler and tip to cache User().Email.

Pending next: decide if we want SP list item-level unique index for ReqKey collisions messaging in UI, and whether to add additional views.

---

## Lessons

### Technical Notes
- **Person Field Claims**: Always use `"i:0#.f|membership|" & Lower(User().Email)` format
- **Delegation**: Filter galleries with explicit OR conditions rather than "in" operator for better performance
- **Flow Testing**: Always test with real user accounts, not admin accounts for permission validation
- **Column Names**: Use consistent internal names in provisioning script to avoid Power Apps mapping issues

### Implementation Strategy  
- **Start with SharePoint foundation** - everything depends on proper list structure
- **Test each flow individually** before building the staff console  
- **Use staged rollout** - start with staff testing before opening to students
- **Keep audit trail simple** in MVP - can enhance later based on needs

---

## Decision History

| Decision | Rationale | Alternative Considered |
|----------|-----------|----------------------|
| SharePoint Lists vs Custom DB | Native M365 integration, built-in security | Custom database would require hosting and additional security |
| Attachments vs Document Library | Simpler association model for MVP | Document library provides better file management but complex permissions |
| Canvas vs Model-Driven App | More UX control for staff workflows | Model-driven would be faster to build but less flexible |
| Multiple Flows vs Monolithic | Better error isolation and maintainability | Single flow would be simpler but harder to troubleshoot |

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
