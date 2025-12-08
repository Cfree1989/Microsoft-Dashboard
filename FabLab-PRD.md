# Product Requirement Document
# Fabrication Lab 3D Print Request Management System

**Version:** 2.0  
**Date:** October 2025  
**Document Owner:** Product Manager  
**Status:** Updated to Reflect Implementation  

---

## 1. Executive Summary

The Fabrication Lab 3D Print Request Management System is a comprehensive web-based workflow management platform designed to streamline 3D print request processing at LSU's Digital Fabrication Lab. Built entirely on Microsoft 365 technologies (SharePoint, Power Automate, Power Apps), the system provides secure student submission capabilities, efficient staff queue management, and complete audit compliance.

**Key Goals:**
- Replace manual 3D print request tracking with automated digital workflow
- Ensure complete audit trail for all operations with staff attribution
- Provide secure, role-based access for LSU students and Fabrication Lab staff
- Deliver MVP solution maintainable by non-technical staff

**Target Users:** LSU students (requesters) and Fabrication Lab staff (operators)

---

## 2. Product Vision

To create the most efficient, secure, and user-friendly 3D print request management system for educational fabrication labs, enabling seamless collaboration between students and staff while maintaining complete operational transparency and accountability.

**Success Metrics:**
- 100% of print requests tracked with audit trail
- Zero data leaks between student accounts
- Staff processing efficiency increase of 50%
- Automated notifications for all status changes
- System maintainable by non-technical staff

---

## 3. Target Users & Personas

### Primary Persona: Student Requester (Sarah)
- **Profile:** LSU Architecture student, junior level
- **Goals:** Submit 3D print requests for class projects, track status, receive timely updates
- **Pain Points:** Unclear file requirements, no visibility into queue status, missed pickup notifications
- **Needs:** Simple submission form, clear file guidelines, automatic status updates

### Secondary Persona: Fabrication Lab Staff Member (Mike)
- **Profile:** Digital Fabrication Technician, 2 years experience
- **Goals:** Efficiently process print queue, maintain quality standards, ensure accountability
- **Pain Points:** Manual tracking, unclear request history, difficulty managing multiple requests
- **Needs:** Intuitive queue interface, one-click status updates, complete action logging

### Tertiary Persona: Fabrication Lab Manager (Dr. Johnson)
- **Profile:** Faculty lab manager, oversight responsibilities
- **Goals:** Ensure operational compliance, maintain audit trails, system maintainability
- **Pain Points:** Lack of oversight visibility, manual audit processes, staff training complexity
- **Needs:** Complete audit system, maintainable no-code solution, clear operational procedures

---

## 4. Problem Statement

LSU's Fabrication Lab currently lacks a systematic approach for managing 3D print requests, resulting in:

**Core Problems:**
1. **Manual Tracking Inefficiency:** No centralized system for request status tracking
2. **Security & Privacy Gaps:** No item-level security preventing student data exposure
3. **Audit Compliance Issues:** Incomplete action logging and staff attribution
4. **Communication Breakdown:** Manual notifications leading to missed updates
5. **Workflow Inefficiency:** Staff struggle with queue prioritization and file management

**Business Impact:**
- Increased processing time for requests
- Risk of compliance violations due to inadequate audit trails
- Student dissatisfaction with lack of transparency
- Staff productivity lost to manual administrative tasks

---

## 5. Solution Overview

A comprehensive Microsoft 365-based workflow management system consisting of:

**Core Components:**
- **SharePoint Foundation:** Secure data repository with role-based access
- **Student Submission Interface:** Simplified form with smart validation
- **Staff Management Console:** Power Apps interface for queue processing
- **Automation Layer:** Power Automate flows for notifications and logging
- **Audit System:** Complete action tracking with staff attribution

**Key Differentiators:**
- Built entirely on institutional Microsoft 365 platform
- No-code/low-code approach for maintainability
- Complete audit trail for compliance
- Item-level security for privacy protection
- Automated workflows reducing manual effort

---

## 6. Success Metrics & KPIs

### Primary Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Request Processing Efficiency | 50% reduction in staff time per request | Time tracking comparison |
| Audit Trail Completeness | 100% of actions logged | AuditLog review |
| Security Compliance | Zero cross-student data exposure | Access control testing |
| Email Notification Delivery | 99% successful automated notifications | System monitoring |
| System Maintainability | Non-technical staff can manage | Training and handoff success |

### Secondary Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Student Satisfaction | >90% positive feedback | User surveys |
| File Rejection Rate | <5% due to format issues | Rejection tracking |
| Staff Training Time | <2 hours to proficiency | Training logs |
| System Uptime | 99.9% availability | Microsoft 365 SLA |

### Financial Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Cost Recovery Rate | 100% material costs | Revenue vs material expenses |
| Average Print Cost | $8-15 range | Mean of EstimatedCost field |
| Minimum Charge Usage | <30% of prints | Count of $3.00 prints / total |
| Estimate Accuracy | ±10% of actual | Compare EstimatedCost vs final charge |

**Pricing Model:** See Appendix D for detailed pricing structure and cost calculation formulas.

---

## 7. Feature Requirements

### 7.1 SharePoint Foundation Features

#### PrintRequests List (P0 - Critical)
- **Description:** Central repository for all 3D print requests
- **Acceptance Criteria:**
  - 22 total fields (12 student-facing, 10 staff-only)
  - Item-level security ensuring students see only their requests
  - Attachment support for 3D model files
  - Version history enabled for change tracking
  - Status formatting with color-coded visual indicators

#### AuditLog List (P0 - Critical)
- **Description:** Complete tracking system for all actions and changes
- **Acceptance Criteria:**
  - Captures all create, update, and status change operations
  - Links to specific PrintRequest items
  - Records actor, timestamp, and action details
  - Supports both automated and manual action logging

#### Staff Directory (P0 - Critical)
- **Description:** Team member management and role assignment
- **Acceptance Criteria:**
  - Person field integration with LSU accounts
  - Role designation (Manager, Technician, Student Worker)
  - Active/inactive status management
  - Integration with access control systems

### 7.2 Student Submission Features

#### Simplified Request Form (P0 - Critical)
- **Description:** Streamlined interface for project specification
- **User Benefit:** Easy submission without technical complexity
- **Acceptance Criteria:**
  - 12 student-facing fields focused on project definition
  - Auto-populated user information (Student, StudentEmail)
  - Default status assignment ("Uploaded")
  - File attachment capability with validation guidance
  - Success confirmation upon submission

#### Smart Printer Selection (P0 - Critical)
- **Description:** Build plate dimensions displayed for self-service sizing
- **User Benefit:** Reduces rejections due to size incompatibility
- **Acceptance Criteria:**
  - Method selection (Filament/Resin) drives printer filtering
  - Build plate dimensions clearly displayed (inches format)
  - Form 3 shown only for resin method selection
  - All FDM printers available for filament method

#### File Validation Framework (P0 - Critical)
- **Description:** Automated validation for 3D model files with instant feedback
- **User Benefit:** Immediate correction guidance, faster processing, reduced staff workload
- **Acceptance Criteria:**
  
  **Filename Policy (Automated Enforcement):**
  - Required format: `FirstLast_Method_Color.ext`
  - Example: `JaneDoe_Filament_Blue.stl`
  - Character cleaning: Spaces, hyphens, apostrophes, periods, commas removed from display names
  - Validation: All three segments must be non-empty
  
  **Accepted File Types:**
  - 3D model files: .stl, .obj, .3mf (mesh formats)
  - Slicer project files: .idea (PrusaSlicer), .form (Formlabs)
  - Case-insensitive extension matching
  
  **File Requirements:**
  - Maximum file size: 150MB per file
  - At least one file must be attached
  - Multiple files allowed (all must pass validation)
  
  **Validation Workflow:**
  - Instant validation on submission (Flow A)
  - Auto-rejection with specific error email if validation fails
  - Helper text visible on form with requirements and examples
  - Invalid submissions do not enter staff queue
  
  **Error Notifications:**
  - No files attached: "Action needed: attach your 3D print file" email
  - Invalid filename: "Action needed: rename your 3D print file" email
  - Emails include: Required format, examples, resubmission instructions

### 7.3 Staff Management Features

#### Queue Management Interface (P0 - Critical)
- **Description:** Power Apps console for efficient request processing
- **User Benefit:** Streamlined staff workflow management
- **Acceptance Criteria:**
  - Gallery view showing active requests (Uploaded → Completed)
  - Sorting by modification date (newest first)
  - Quick access to all request details and attachments
  - Staff detection logic restricting access to authorized users

#### Status Action Buttons (P0 - Critical)
- **Description:** One-click status updates with automatic audit logging
- **User Benefit:** Quick processing with complete accountability
- **Acceptance Criteria:**
  - Approve → Ready to Print 
  - Reject → Rejected (with automatic student notification)
  - Start Printing → Printing
  - Complete Printing → Completed (with pickup notification)  
  - Ready for Pickup → Paid & Picked Up
  - File Validation Reject → Rejected (with policy violation logging)

#### Local File Workflow (P0 - Critical)
- **Description:** Simplified file management for print preparation
- **User Benefit:** Practical workflow without system complexity
- **Acceptance Criteria:**
  - Staff download attachments to local workstations
  - Work with files in PrusaSlicer locally
  - No re-upload requirement to system
  - Status updates managed through Power Apps interface only

### 7.4 Automation Features

#### Auto-ReqKey Generation (P0 - Critical)
- **Description:** Unique identifier assignment for systematic tracking
- **User Benefit:** Consistent request identification across all communications
- **Acceptance Criteria:**
  - Format: REQ-##### (e.g., REQ-00042)
  - Auto-generated on request creation
  - Zero-padded 5-digit sequential numbering
  - Displayed in all emails and interfaces

#### Change Detection & Logging (P0 - Critical)
- **Description:** Automatic audit trail for all field modifications
- **User Benefit:** Complete compliance tracking without manual effort
- **Acceptance Criteria:**
  - Triggers on any PrintRequest field change
  - Logs field name, old value, new value, actor, timestamp
  - Handles bulk changes and attachment modifications
  - Creates separate entries for different change types

#### Student Estimate Confirmation (P0 - Critical)
- **Description:** Automated workflow requiring student approval before printing
- **User Benefit:** Prevents surprise costs, ensures informed consent
- **Acceptance Criteria:**
  - Status change to "Pending" triggers estimate email
  - Email contains cost, time, color, and confirmation instructions
  - Student confirms via StudentConfirmed field toggle in "My Requests" view
  - Confirmation auto-updates Status to "Ready to Print"
  - Circular loop prevention (only processes when Status = Pending)
  - Complete audit trail with student attribution

#### Auto-Rejection for Invalid Submissions (P0 - Critical)
- **Description:** Automated filtering of non-compliant file submissions
- **User Benefit:** Instant feedback loop, consistent policy enforcement
- **Acceptance Criteria:**
  - No manual staff intervention required for validation
  - Students receive immediate actionable feedback
  - Invalid submissions logged to AuditLog with "Rejected" action
  - Rejection emails include specific guidance for correction
  - System prevents invalid files from entering work queue

#### Automated Email Notifications (P0 - Critical)
- **Description:** Timely student communication for key status changes
- **User Benefit:** Proactive communication without staff manual effort
- **Acceptance Criteria:**
  - Confirmation email on successful submission with ReqKey
  - Estimate email when status changes to "Pending" with cost details
  - Rejection notification with structured rejection reasons
  - Completion notification with pickup instructions and lab hours
  - All emails logged to AuditLog with System attribution

### 7.5 Security & Compliance Features

#### LSU Account Integration (P0 - Critical)
- **Description:** Internal authentication ensuring institutional security
- **User Benefit:** Secure access aligned with LSU policies
- **Acceptance Criteria:**
  - Internal LSU accounts only, no external access
  - Person fields resolve to LSU directory information
  - No guest or anonymous access permitted
  - Integration with Microsoft 365 authentication

#### Role-Based Access Control (P0 - Critical)
- **Description:** Appropriate data access boundaries for users and staff
- **User Benefit:** Privacy protection and operational security
- **Acceptance Criteria:**
  - Students see only their own PrintRequest items
  - Staff see all items with full operational access
  - Staff-only fields hidden from student interfaces
  - Fabrication Lab Staff group has Owner permissions on SharePoint site

---

## 8. Non-Functional Requirements

### Performance Requirements
- Support concurrent usage by up to 50 active users
- Handle up to 500 print requests without performance degradation
- Power Apps delegation warnings managed gracefully
- Email notifications delivered within 5 minutes of status changes
- File attachments up to 150MB per file supported

### Security Requirements
- All data stored within LSU Microsoft 365 tenant
- Item-level security preventing cross-student data access
- Complete audit logging for compliance requirements
- No external system dependencies or data transfers
- File type restrictions enforced (.stl, .obj, .3mf, .idea, .form only)
- Automated filename validation prevents malicious or malformed files

### Reliability Requirements
- 99.9% uptime leveraging Microsoft 365 SLA
- Error handling in all Power Automate flows
- Graceful degradation if email service temporarily unavailable
- Version history maintained for all list items
- Backup and recovery handled by Microsoft 365 infrastructure

### Usability Requirements
- Intuitive interfaces requiring minimal training
- Mobile-responsive design for tablet and phone access
- Clear error messages and user feedback
- Consistent navigation and visual design
- Accessibility compliance (WCAG 2.1 AA)

### Maintainability Requirements
- No custom code or external dependencies
- Configuration-based customization only
- Documentation sufficient for non-technical staff maintenance
- Clear operational procedures for common tasks
- Upgrade path compatible with Microsoft 365 updates

---

## 9. Constraints & Dependencies

### Technical Constraints
- Must use only Microsoft 365 platform components
- No-code/low-code approach required for maintainability
- File storage limited to SharePoint attachment capabilities
- Power Apps delegation limitations for large datasets
- Power Automate flow execution limits and throttling

### Business Constraints
- Internal LSU accounts only (no external access)
- Budget limited to existing Microsoft 365 licensing
- Implementation by non-developer staff required
- Compliance with LSU data governance policies
- MVP scope excluding analytics and advanced reporting

### Dependencies
- LSU Microsoft 365 tenant with appropriate licenses
- SharePoint site with Owner-level permissions
- Power Platform environment configured
- Fabrication Lab staff accounts and role assignments
- Email service (coad-Fabrication Lab@lsu.edu) configured

### Risk Factors
- Microsoft 365 service availability and limitations
- User adoption requiring change management
- Staff training time and learning curve
- Potential SharePoint list size limitations over time
- Power Platform licensing changes affecting functionality

---

## 10. Release Plan & Milestones

### Phase 1: Foundation Setup (Weeks 1-2)
- **Goal:** Establish SharePoint foundation with proper security
- **Deliverables:**
  - SharePoint site and lists configured
  - Security and permission structure implemented
  - Initial staff accounts populated
- **Estimated Effort:** 1.5-2 hours
- **Success Criteria:** Lists created, permissions working, test items can be added

### Phase 2: Automation Layer (Weeks 2-3)
- **Goal:** Implement Power Automate workflows
- **Deliverables:**
  - PR-Create flow (ReqKey + acknowledgment)
  - PR-Audit flow (change logging + email notifications)
  - PR-Action flow (staff action logging)
- **Estimated Effort:** 3-4 hours
- **Success Criteria:** All flows operational, emails sending, audit logging working

### Phase 3: User Interfaces (Weeks 3-4)
- **Goal:** Deploy student and staff interfaces
- **Deliverables:**
  - Customized SharePoint form for students
  - Power Apps staff console with action buttons
  - File validation and workflow procedures
- **Estimated Effort:** 6-8 hours
- **Success Criteria:** Forms functional, staff console operational, file handling working

### Phase 4: Testing & Launch (Week 4)
- **Goal:** Validate system and deploy to production
- **Deliverables:**
  - End-to-end testing completion
  - Staff training and documentation
  - Production deployment and handoff
- **Estimated Effort:** 2-3 hours
- **Success Criteria:** System live, staff trained, documentation complete

**Total Implementation Timeline:** 4 weeks  
**Total Estimated Effort:** 12.5-17 hours

---

## 11. Open Questions & Assumptions

### Open Questions
1. **Analytics Requirements:** Future need for reporting and analytics beyond MVP scope?
2. **Integration Opportunities:** Potential integration with existing LSU systems or payment processing?
3. **Scalability Planning:** Expected growth in request volume and user base?
4. **Backup Procedures:** Additional backup requirements beyond Microsoft 365 standard provisions?
5. **Advanced File Management:** Future need for file versioning or collaborative editing capabilities?

### Key Assumptions
- LSU Microsoft 365 environment has necessary licensing and permissions
- Staff will have Site Owner access for implementation and maintenance
- Current 3D printer inventory (4 printers) remains stable for MVP
- Email service (coad-Fabrication Lab@lsu.edu) is available and properly configured
- Student and staff adoption will be supported by change management process
- File storage requirements will remain within SharePoint attachment limits

### Decision Points Requiring Stakeholder Input
- ~~**Lab Hours Information:** Specific operating hours for inclusion in pickup notifications~~ **RESOLVED:** Monday-Friday 8:30 AM - 4:30 PM, Room 145 Atkinson Hall
- ~~**Payment Process:** Integration with existing payment systems or manual process continuation~~ **RESOLVED:** TigerCASH only at pickup
- **Staff Role Hierarchy:** Detailed role definitions beyond Manager/Technician/Student Worker
- **File Retention Policy:** Long-term storage requirements for completed requests and audit logs

---

## 12. Appendices

### Appendix A: Data Model

#### PrintRequests List Schema

**Total Fields:** 22 (12 student-facing + 10 staff-only)

**Student-Facing Fields (12):**
- **Title** (Single line text) - Request title
- **ReqKey** (Single line text) - Auto-generated unique ID (format: REQ-00042)
- **Student** (Person) - Requester identification
- **StudentEmail** (Single line text) - Contact information
- **Course Number** (Number) - Optional class number (e.g., 1001, 2050)
- **Discipline** (Choice) - Architecture; Engineering; Art & Design; Business; Liberal Arts; Sciences; Other
- **ProjectType** (Choice) - Class Project; Research; Personal; Other
- **Color** (Choice) - Any; Black; White; Gray; Red; Green; Blue; Yellow; Other
- **Method** (Choice) - Filament; Resin
- **Printer** (Choice) - Prusa MK4S (9.8×8.3×8.7in); Prusa XL (14.2×14.2×14.2in); Raised3D Pro 2 Plus (12.0×12.0×23in); Form 3 (5.7×5.7×7.3in)
- **DueDate** (Date) - Timeline planning
- **Notes** (Multiple lines text) - Additional instructions

**Staff-Only Fields (10):**
- **Status** (Choice) - Uploaded; Pending; Ready to Print; Printing; Completed; Paid & Picked Up; Rejected; Archived
- **Priority** (Choice) - Low; Normal; High; Rush
- **AssignedTo** (Person) - Optional field for manual assignment if needed (not used in automated workflows)
- **EstimatedTime** (Number, Display: EstHours) - Time estimation in hours
- **EstimatedWeight** (Number, Display: EstWeight) - Material weight in grams
- **EstimatedCost** (Currency) - Calculated cost estimation (see Appendix D for formula)
- **StaffNotes** (Multiple lines text) - Internal communication
- **RejectionReason** (Choice with fill-in) - File format not supported; Design not printable; Excessive material usage; Incomplete request information; Size limitations; Material not available; Quality concerns; Other
- **StudentConfirmed** (Yes/No, Default: No) - Student approval of cost estimate
- **NeedsAttention** (Yes/No, Default: No) - Flags items requiring staff review
- **Expanded** (Yes/No, Default: No) - Power Apps UI state for collapsed/expanded view
- **AttachmentCount** (Number, Default: 0) - Tracks attachment changes for audit (hidden from students)
- **LastAction** (Choice) - Created; Updated; Status Change; File Added; Comment Added; Assigned; Email Sent; Rejected; System
- **LastActionBy** (Single line text) - High-level action attribution (stores "System" or staff name)
- **LastActionAt** (Date and Time) - Audit timestamp

**Note on Field Types:**
- **EstimatedTime** internal name is `EstHours` in SharePoint
- **EstimatedWeight** internal name is `EstWeight` in SharePoint
- **LastActionBy** is Single line text (not Person) to allow "System" value for infinite loop prevention
- For detailed audit attribution with person fields, see AuditLog.Actor

#### AuditLog List Schema

**Total Fields:** 14

**Purpose:** Complete tracking system for all actions, changes, and system events with full attribution and temporal ordering.

**Core Tracking Fields:**
- **Title** (Single line text) - Human-readable action summary
- **RequestID** (Number) - Links to PrintRequests.ID
- **ReqKey** (Single line text) - Request identifier (REQ-00001)
- **Action** (Choice) - Created; Updated; Status Change; File Added; Comment Added; Assigned; Email Sent; Rejected; System
- **ActionAt** (Date and Time) - When action occurred (UTC)

**Change Tracking Fields:**
- **FieldName** (Single line text) - Which field changed (e.g., "Status", "Priority")
- **OldValue** (Multiple lines text) - Previous value before change
- **NewValue** (Multiple lines text) - New value after change

**Attribution Fields:**
- **Actor** (Person) - Who performed the action (resolved to person field with full metadata)
- **ActorRole** (Choice) - Student; Staff; System
- **ClientApp** (Choice) - SharePoint Form; Power Apps; Power Automate

**Debugging Fields:**
- **Notes** (Multiple lines text) - Additional context or error messages
- **FlowRunId** (Single line text) - Power Automate run ID for tracing

**Usage Examples:**

*Field Change Entry:*
```
Title: "Priority Change"
RequestID: 42
ReqKey: "REQ-00042"
Action: "Updated"
FieldName: "Priority"
OldValue: "Normal"
NewValue: "High"
Actor: [Staff Member Person Field]
ActorRole: "Staff"
ClientApp: "SharePoint Form"
ActionAt: "2025-10-14 10:30:00"
```

*Email Sent Entry:*
```
Title: "Email Sent: Confirmation"
RequestID: 42
ReqKey: "REQ-00042"
Action: "Email Sent"
FieldName: "StudentEmail"
NewValue: "student@lsu.edu"
Actor: [NULL]
ActorRole: "System"
ClientApp: "Power Automate"
ActionAt: "2025-10-14 10:30:15"
FlowRunId: "08586653536760461208"
```

**Security:** All staff can read all entries (no item-level permissions). Students cannot access AuditLog list.

#### Staff List Schema

**Total Fields:** 3

**Purpose:** Team member management and role assignment for access control.

**Fields:**
- **Member** (Person, Required) - Staff member's LSU account
- **Role** (Choice) - Manager; Technician; Student Worker
- **Active** (Yes/No, Default: Yes) - Employment status

**Usage:** Power Apps staff console checks this list to determine if user has staff access.

#### Attribution Field Strategy

The system uses two complementary approaches for tracking who performed actions:

**1. LastActionBy (Text field in PrintRequests)**
- **Use Case:** Workflow logic and infinite loop prevention
- **Stores:** Simple text strings ("System", staff name)
- **Benefits:** Can store "System" literal, simple conditional checks in Flow B
- **Limitation:** No person field benefits (profiles, filtering)

**2. Actor (Person field in AuditLog)**
- **Use Case:** Compliance auditing and detailed attribution
- **Stores:** Full SharePoint person objects with metadata
- **Benefits:** Clickable profiles, rich user data, people picker filtering
- **Limitation:** Cannot store "System" as literal string

**Why Both?**
- PrintRequests.LastActionBy: Operational (prevent infinite loops in Flow B)
- AuditLog.Actor: Compliance (detailed audit trail with full user information)
- Together: Best of both worlds

### Appendix B: Status Workflow

**Enhanced Primary Flow with Student Estimate Approval:**

Uploaded → Pending → **[STUDENT CONFIRMS]** → Ready to Print → Printing → Completed → Paid & Picked Up → Archived

**Status Details:**
- **Uploaded:** New submission, awaiting initial staff review
- **Pending:** Staff approved with estimates, **awaiting student confirmation** (StudentConfirmed = No)
- **Ready to Print:** Student confirmed estimate (StudentConfirmed = Yes), queued for printing
- **Printing:** Actively printing on equipment
- **Completed:** Print finished, ready for student pickup
- **Paid & Picked Up:** Student collected print and paid via TigerCASH
- **Archived:** Request closed for historical record

**Rejection Flow:** Uploaded → Rejected → Archived

**Student Confirmation Process:**
1. Staff review request and set estimates (EstimatedCost, EstimatedTime, EstimatedWeight)
2. Staff change Status to "Pending"
3. Flow B automatically sends estimate email to student
4. Student opens "My Requests" view in SharePoint
5. Student toggles StudentConfirmed from "No" to "Yes"
6. Flow B detects change and automatically updates Status to "Ready to Print"
7. Staff proceed with printing

**Circular Loop Prevention:** Flow B only processes StudentConfirmed changes when Status = "Pending". After update to "Ready to Print", subsequent toggles are ignored.

### Appendix C: Email Templates

#### 1. Submission Confirmation Template

**Trigger:** Flow A - When new request created with valid filename

```
Subject: We received your 3D Print request – [ReqKey]

We received your 3D Print request.

REQUEST DETAILS:
- Request: [Standardized Display Name]
- Request ID: [ReqKey]
- Method: [Method]
- Printer: [Printer]
- Color: [Color]

NEXT STEPS:
• Our team will review your request for technical feasibility
• You'll receive updates as your request progresses through our queue
• Estimated review time: 1-2 business days

View your request details:
[Direct Link: /Lists/PrintRequests/DispForm.aspx?ID=[ID]]

View all your requests:
[My Requests View: /Lists/PrintRequests/My%20Requests.aspx]

---
This is an automated message from the LSU Digital Fabrication Lab.
```

#### 2. Estimate Ready Template

**Trigger:** Flow B - When Status changes to "Pending"

```
Subject: Estimate ready for your 3D print – [ReqKey]

Hi [Student Display Name],

Your 3D print estimate is ready! Before we start printing, please review and confirm the details below.

⚠️ WE WILL NOT RUN YOUR PRINT WITHOUT YOUR CONFIRMATION.

ESTIMATE DETAILS:
- Request: [ReqKey]
- Estimated Cost: $[EstimatedCost or "TBD"]
- Color: [Color]
- Print Time: [EstHours hours or "TBD"]

TO CONFIRM THIS ESTIMATE:
1. Click the link below to view your request
2. Find the "StudentConfirmed" field
3. Change it from "No" to "Yes"
4. Click "Save" at the top

View and Confirm Your Request:
[My Requests View: /Lists/PrintRequests/My%20Requests.aspx]

TIP: The link will open your requests in SharePoint. Your request should be at the top of the list.

If you have any questions or concerns about the estimate, please contact us before confirming.

Thank you,
LSU Digital Fabrication Lab

Lab Hours: Monday-Friday 8:30 AM - 4:30 PM
Email: coad-fablab@lsu.edu
Location: Room 145 Atkinson Hall

---
This is an automated message from the LSU Digital Fabrication Lab.
```

#### 3. Rejection Notification Template

**Trigger:** Flow B - When Status changes to "Rejected"

```
Subject: Your 3D Print request has been rejected – [ReqKey]

Unfortunately, your 3D Print request has been rejected by our staff.

REQUEST DETAILS:
- Request: [Title] ([ReqKey])
- Method: [Method]
- Printer Requested: [Printer]

REASON FOR REJECTION:
[RejectionReason - Structured choices or custom text]

ADDITIONAL DETAILS:
[Notes field content]

NEXT STEPS:
• Review the specific rejection reason above
• Make necessary adjustments to your design or request
• Submit a new corrected request through the Fabrication Lab website
• Contact our staff if you have questions about this feedback

---
This is an automated message from the LSU Digital Fabrication Lab.
```

#### 4. Completion Notification Template

**Trigger:** Flow B - When Status changes to "Completed"

```
Subject: Your 3D print is ready for pickup – [ReqKey]

Your print is ready for pick up in the Fabrication Lab!

PICKUP INFORMATION:
📍 Location: Room 145 Atkinson Hall
💳 Payment: TigerCASH only
🕐 Lab Hours: Monday-Friday 8:30 AM - 4:30 PM

WHAT TO BRING:
• Your student ID
• TigerCASH for payment

Thank you,
LSU Digital Fabrication Lab

---
This is an automated message from the LSU Digital Fabrication Lab.
```

**Note:** All emails are sent from the shared mailbox `coad-fablab@lsu.edu` and automatically logged to AuditLog with System attribution.

### Appendix D: Pricing Model

#### Material Pricing Structure

The Fabrication Lab uses a weight-based pricing model to recover material costs and cover operational expenses.

**Pricing Rates:**

| Material | Rate per Gram | Typical Small Print (50g) | Typical Large Print (200g) |
|----------|---------------|---------------------------|----------------------------|
| Filament (PLA/PETG/ABS) | $0.10/g | $5.00 | $20.00 |
| Resin (Standard) | $0.20/g | $10.00 | $40.00 |

#### Minimum Charge

**All prints: $3.00 minimum**

Covers:
- Machine setup and calibration time
- Failed print risk and troubleshooting
- Material waste (support structures, first layer adhesion tests)
- Facility and equipment maintenance costs

#### Cost Calculation Formula

```
EstimatedCost = Max($3.00, EstimatedWeight × Material_Rate)

Where:
- EstimatedWeight: grams of material (from slicer software)
- Material_Rate: $0.10/g (Filament) or $0.20/g (Resin)
- $3.00: Minimum charge applied if calculated cost is lower
```

#### Calculation Examples

**Example 1: Small Filament Keychain**
- Weight: 15 grams
- Method: Filament
- Calculated: 15g × $0.10/g = $1.50
- **Final Cost: $3.00** (minimum applied)

**Example 2: Medium Filament Part**
- Weight: 75 grams
- Method: Filament
- Calculated: 75g × $0.10/g = $7.50
- **Final Cost: $7.50**

**Example 3: Small Resin Miniature**
- Weight: 20 grams
- Method: Resin
- Calculated: 20g × $0.20/g = $4.00
- **Final Cost: $4.00**

**Example 4: Large Resin Model**
- Weight: 100 grams
- Method: Resin
- Calculated: 100g × $0.20/g = $20.00
- **Final Cost: $20.00**

#### Estimation Process

1. **Staff Review:** Staff examines 3D model file
2. **Slicer Analysis:** Staff imports file into PrusaSlicer or PreForm
3. **Weight Calculation:** Slicer calculates material usage (grams)
4. **Staff Input:** Staff enters EstimatedWeight in PrintRequests
5. **Auto-Calculation:** System applies formula to calculate EstimatedCost
6. **Student Notification:** Estimate email sent with cost (Status: Pending)
7. **Student Confirmation:** Student reviews and confirms via StudentConfirmed field
8. **Printing:** Only proceeds after student approval (Status: Ready to Print)

#### Payment Collection

**Method:** TigerCASH only  
**Location:** Room 145 Atkinson Hall  
**When:** At pickup (Status: Completed)  
**Requirements:** Student ID for verification

**Payment Workflow:**
1. Student receives pickup notification email
2. Student visits Fabrication Lab with ID and TigerCASH
3. Staff verifies print quality
4. Student pays with TigerCASH card
5. Staff marks Status: Paid & Picked Up

#### Notes on Pricing

- **Estimates are estimates:** Final cost may differ slightly based on actual material used
- **Time not a factor:** EstimatedTime field is for scheduling only, not pricing
- **No refunds:** Once printing begins (Status: Printing), cost is committed
- **Bulk discounts:** Not currently offered (future consideration)
- **Special materials:** Pricing subject to change for specialty filaments/resins

---

**Document Control:**
- Created: January 2024
- Last Modified: October 2025
- Next Review: December 2025
- Approvers: Fabrication Lab Manager, IT Governance, Student Services
