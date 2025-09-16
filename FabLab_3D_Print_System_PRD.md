# Product Requirement Document
# Fabrication Lab 3D Print Request Management System

**Version:** 1.0  
**Date:** January 2024  
**Document Owner:** Product Manager  
**Status:** Draft  

---

## 1. Executive Summary

The FababricationLab 3D Print Request Management System is a comprehensive web-based workflow management platform designed to streamline 3D print request processing at LSU's Digital Fabrication Lab. Built entirely on Microsoft 365 technologies (SharePoint, Power Automate, Power Apps), the system provides secure student submission capabilities, efficient staff queue management, and complete audit compliance.

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

---

## 7. Feature Requirements

### 7.1 SharePoint Foundation Features

#### PrintRequests List (P0 - Critical)
- **Description:** Central repository for all 3D print requests
- **Acceptance Criteria:**
  - 17 total fields (9 student-facing, 8 staff-only)
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
  - 9 student-facing fields focused on project definition
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
- **Description:** Clear requirements and validation for 3D model files
- **User Benefit:** Prevents invalid file submissions, reduces processing delays
- **Acceptance Criteria:**
  - Accepted formats: .stl, .obj, .3mf only
  - Maximum file size: 50MB per file
  - Helper text visible on form with requirements
  - Staff rejection workflow for non-compliant files

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

#### Automated Email Notifications (P0 - Critical)
- **Description:** Timely student communication for key status changes
- **User Benefit:** Proactive communication without staff manual effort
- **Acceptance Criteria:**
  - Confirmation email on successful submission with ReqKey
  - Rejection notification with reason to check staff notes
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
- File attachments up to 50MB per file supported

### Security Requirements
- All data stored within LSU Microsoft 365 tenant
- Item-level security preventing cross-student data access
- Complete audit logging for compliance requirements
- No external system dependencies or data transfers
- File type restrictions enforced (.stl, .obj, .3mf only)

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
- **Lab Hours Information:** Specific operating hours for inclusion in pickup notifications
- **Payment Process:** Integration with existing payment systems or manual process continuation
- **Staff Role Hierarchy:** Detailed role definitions beyond Manager/Technician/Student Worker
- **File Retention Policy:** Long-term storage requirements for completed requests and audit logs

---

## 12. Appendices

### Appendix A: Data Model

#### PrintRequests List Schema
**Student-Facing Fields (9):**
- Title (Single line text) - Request title
- ReqKey (Single line text) - Auto-generated unique ID
- Student (Person) - Requester identification
- StudentEmail (Single line text) - Contact information
- Course (Single line text) - Academic context
- Discipline (Choice) - Architecture; Engineering; Art & Design; Other
- ProjectType (Choice) - Class Project; Research; Personal; Other
- Color (Choice) - Material color preference
- Method (Choice) - Filament; Resin
- PrinterSelection (Choice) - Equipment and size constraints
- DueDate (Date) - Timeline planning
- Notes (Multiple lines text) - Additional instructions

**Staff-Only Fields (9):**
- Status (Choice) - 8-state workflow progression
- Priority (Choice) - Queue management
- AssignedTo (Person) - Optional field for manual assignment if needed (not used in automated workflows)
- EstimatedTime (Number) - Time estimation
- EstimatedWeight (Number) - Material costing
- EstimatedCost (Currency) - Calculated cost estimation
- StaffNotes (Multiple lines text) - Internal communication
- LastAction (Choice) - Action categorization
- LastActionBy (Person) - Accountability tracking
- LastActionAt (Date/Time) - Audit timestamp

### Appendix B: Status Workflow

**Primary Flow:** Uploaded → Pending → Ready to Print → Printing → Completed → Paid & Picked Up → Archived  
**Rejection Flow:** Uploaded → Rejected → Archived

### Appendix C: Email Templates

**Submission Confirmation Template:**
```
Subject: We received your 3D Print request – [ReqKey]

We received your 3D Print request.
Request: [Title]
Request ID: [ReqKey]
Method: [Method]
Printer: [PrinterSelection]

[View Request Link] | [View All Requests Link]

Our team will review your request and contact you with any questions.
```

**Rejection Notification Template:**
```
Subject: Your 3D Print request has been rejected – [ReqKey]

Unfortunately, your 3D Print request has been rejected by our staff.
Request: [Title] ([ReqKey])
Reason: Please check the staff notes in your request for specific details.

[View Request Link]

You may submit a new corrected request at any time.
```

**Completion Notification Template:**
```
Subject: Your 3D print is ready for pickup – [ReqKey]

Great news! Your 3D print is completed and ready for pickup.
Request: [Title] ([ReqKey])

Next Steps:
• Visit the Digital Fabrication Lab to pay and collect your print
• Payment calculated based on actual material used
• Bring student ID for verification
• Lab hours: [Hours Information]

[View Request Link]
```

---

**Document Control:**
- Created: January 2024
- Last Modified: January 2024
- Next Review: March 2024
- Approvers: Fabrication Lab Manager, IT Governance, Student Services
