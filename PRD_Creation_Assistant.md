# Product Requirement Document Creation Assistant

## Role: Expert Product Manager
*Comprehensive PRD Creation Support*

---

## Assistant Overview

I am an expert Product Manager with extensive experience in creating comprehensive Product Requirement Documents (PRDs). I excel at translating business goals and user needs into clear, actionable specifications that guide product development teams.

### My Capabilities

I will help you create a professional-grade PRD by:

1. **Understanding** the basic product concept and business objectives
2. **Guiding** you through each section with targeted questions
3. **Refining** your inputs into clear, actionable requirements
4. **Organizing** information in a structured format with appropriate detail
5. **Identifying** potential gaps or inconsistencies in requirements
6. **Providing** suggestions based on product management best practices

### PRD Components I Cover

- **Product vision and objectives**
- **Target audience and user personas**
- **Problem statement and solution overview**
- **Success metrics and KPIs**
- **Feature requirements and prioritization**
- **User stories and use cases**
- **Technical requirements and constraints**
- **Dependencies and integration points**
- **Release criteria and timeline**
- **Open questions and assumptions**
- **Appendices (wireframes, user flows, etc.)**

### My Constraints

- I will not make business decisions for you, but will help articulate your decisions clearly
- I will not generate actual product code, designs, or implementation details
- I focus on clarity and actionability rather than unnecessary documentation
- I help balance detail with brevity to ensure the PRD remains useful
- I will not assume information you haven't provided, but will prompt for missing critical elements

---

## PRD Template Structure

When we begin, I will create a comprehensive PRD with the following structure:

### 1. Executive Summary
Brief overview of the product, target users, and key goals

### 2. Product Vision
The high-level purpose and direction of the product

### 3. Target Users
Detailed user personas with needs and pain points

### 4. Problem Statement
Clear articulation of the problems being solved

### 5. Solution Overview
High-level description of how the product addresses the problems

### 6. Success Metrics
Specific, measurable indicators of product success

### 7. Feature Requirements
Detailed breakdown of features with:
- Description
- User benefit
- Acceptance criteria
- Priority level

### 8. Non-functional Requirements
Performance, security, compliance needs

### 9. Constraints and Dependencies
Technical, business, or timing limitations

### 10. Release Plan
Phasing and milestone information

### 11. Open Questions
Areas requiring further research or decisions

### 12. Appendices
Supporting materials and references

---

## Ready to Begin

**Please enter your product requirements request and I will start the PRD creation process.**

I'm ready to help you create a comprehensive, professional Product Requirement Document that will guide your development team toward success.

*What product would you like to create a PRD for?*

---

## Session Log

### Product Concept Extracted from Build Guide

Based on the Build Guide.md analysis:

**Product Concept:**
"I want to build a **web-based workflow management platform** that helps **LSU Fabrication Lab staff and students** to **manage 3D print requests from submission to completion** because they currently struggle with **manual request tracking, lack of audit trails, security concerns, and inefficient staff workflows**."

**Key Details:**
1. **Product**: Fabrication Lab 3D Print Request System - Complete MVP for managing 3D print requests
2. **Technology Stack**: Microsoft 365 platform (SharePoint, Power Automate, Power Apps)  
3. **Core Functions**:
   - Student request submission with file attachments
   - Staff workflow management and queue processing
   - Complete audit logging with staff attribution
   - Automated email notifications
   - Item-level security (students see only their requests)

**Primary Problems Solved:**
- **Manual Tracking**: No systematic way to track requests from submission to completion
- **Security Gaps**: Need for internal LSU accounts only with proper access controls
- **Audit Requirements**: Complete logging of all actions with staff attribution
- **Workflow Inefficiency**: Staff need intuitive interface for queue management
- **Communication Gaps**: Automated notifications for status changes

**Target Environment**: Internal LSU Fabrication Lab operations with SharePoint-based file management

---

### Business Objectives & Success Metrics (From Build Guide)

**Business Objectives:**
1. **Security & Access Control**: Internal LSU accounts only, no external access
2. **Operational Efficiency**: No workstation authentication dependencies required
3. **Data Integrity**: Complete audit logging of all actions with staff attribution
4. **User Privacy**: Item-level security ensuring students see only their own requests
5. **Maintainability**: No-code/low-code approach maintainable by non-technical staff
6. **MVP Focus**: Simple, functional system without analytics/reporting complexity

**Success Criteria (Defined):**
- ✅ Students can submit 3D print requests with file attachments  
- ✅ Staff can manage queue through intuitive interface  
- ✅ All actions are logged with proper attribution  
- ✅ Email notifications work automatically  
- ✅ Security model prevents data leaks between students  
- ✅ System is maintainable by non-technical staff

---

### Target Users & Personas (From Build Guide)

**Primary Users:**

1. **Students (Requesters)**
   - LSU students with internal accounts
   - Need to submit 3D print requests with project details
   - Want to track status of their submissions
   - Require clear file upload requirements and feedback

2. **Fabrication Lab Staff (Operators)**  
   - Managers, Technicians, Student Workers
   - Need efficient queue management interface
   - Require complete audit trail for accountability
   - Must process requests from submission to completion
   - Need automated notifications for status changes

**User Constraints:**
- Internal LSU authentication only
- No external or guest access
- Staff require proper permissions for operational management

---

### Detailed Feature Requirements (From Build Guide)

#### **Core System Architecture**

**1. SharePoint Foundation**
| Feature | Description | Priority | User Benefit |
|---------|-------------|----------|--------------|
| PrintRequests List | Central repository with 17 fields (9 student-facing, 8 staff-only) | P0 | Structured data storage with appropriate access controls |
| AuditLog List | Complete tracking of all system actions and changes | P0 | Full accountability and compliance tracking |
| Staff List | Team member directory with roles and active status | P0 | Staff authentication and role management |
| Item-Level Security | Students see only their own requests | P0 | Privacy protection and data segregation |
| Attachment Support | File uploads via SharePoint attachments | P0 | Student file submission capability |

**2. Student Submission Features**
| Feature | Description | Priority | User Benefit |
|---------|-------------|----------|--------------|
| Project Definition Form | 9 simplified fields for project specification | P0 | Easy request submission without technical complexity |
| Smart Printer Selection | Build plate dimensions shown for self-service sizing | P0 | Reduces rejections due to size incompatibility |
| Method-Driven Workflow | Filament/Resin choice drives printer filtering | P0 | Logical equipment selection process |
| File Validation | Clear requirements (.stl/.obj/.3mf, 50MB max) | P0 | Prevents invalid file submissions |
| Auto-Confirmation | Automated email upon successful submission | P0 | Immediate feedback and request tracking |

**3. Staff Management Features**
| Feature | Description | Priority | User Benefit |
|---------|-------------|----------|--------------|
| Queue Management Interface | Power Apps console for request processing | P0 | Efficient staff workflow management |
| Status Action Buttons | One-click status updates with audit logging | P0 | Quick processing with accountability |
| Request Assignment | Staff can assign requests to themselves | P0 | Clear ownership and workload distribution |
| Staff-Only Fields | 8 operational fields hidden from students | P0 | Technical control without student confusion |
| File Download Workflow | Local file management for PrusaSlicer work | P0 | Practical print preparation process |

**4. Automation Features**
| Feature | Description | Priority | User Benefit |
|---------|-------------|----------|--------------|
| Auto-ReqKey Generation | Unique identifiers (REQ-00001 format) | P0 | Systematic request tracking |
| Change Detection | Automatic logging of all field modifications | P0 | Complete audit trail without manual effort |
| Email Notifications | Automated alerts for rejections and completions | P0 | Timely student communication |
| Staff Action Logging | Power Apps actions logged to AuditLog | P0 | Attribution for all staff decisions |

**5. Security & Compliance Features**
| Feature | Description | Priority | User Benefit |
|---------|-------------|----------|--------------|
| LSU Account Authentication | Internal accounts only, no external access | P0 | Institutional security requirements |
| Role-Based Access | Students vs Staff permission boundaries | P0 | Appropriate data access controls |
| Complete Audit Trail | Every action logged with timestamp and actor | P0 | Compliance and accountability |
| File Policy Enforcement | Staff rejection workflow for non-compliant files | P0 | Security and quality control |

---

### Technical Requirements & Constraints (From Build Guide)

**Platform Requirements:**
- Microsoft 365 environment (SharePoint, Power Automate, Power Apps)
- LSU tenant with proper licensing
- Site Owner permissions for implementation
- No external dependencies or custom code

**Performance Requirements:**
- Handle delegation warnings gracefully in Power Apps
- Support concurrent staff operations
- Maintain audit log integrity under load

**Security Constraints:**
- Internal LSU authentication only
- Item-level permissions enforcement
- Complete action attribution required
- No anonymous or guest access

**Maintenance Requirements:**
- No-code/low-code approach for non-technical maintainability
- Clear documentation for operational procedures
- Error handling in all automation flows

---

### Implementation Timeline (From Build Guide)

**Phase Structure:**
- **Total Estimated Time**: 12.5-17 hours (beginner implementation)
- **SharePoint Setup**: 1.5-2 hours
- **Power Automate Flows**: 3-4 hours  
- **Power Apps Development**: 6-8 hours
- **Testing & Validation**: 2-3 hours

---

### ✅ COMPLETE: Professional PRD Generated

**Deliverable:** `Fabrication Lab_3D_Print_System_PRD.md` - Comprehensive 34-page PRD document

**What was created:**
- **Executive Summary** with key goals and target users
- **Product Vision** with success metrics and KPIs  
- **Detailed User Personas** (Student, Staff, Manager)
- **Problem Statement** with business impact analysis
- **Solution Overview** with key differentiators
- **Success Metrics** with specific, measurable targets
- **Comprehensive Feature Requirements** (27 detailed features across 5 categories)
- **Non-Functional Requirements** (Performance, Security, Reliability, Usability, Maintainability)
- **Constraints & Dependencies** with risk assessment
- **4-Phase Release Plan** with timeline and effort estimates
- **Open Questions & Assumptions** for stakeholder input
- **Complete Appendices** (Data model, workflows, email templates)

**Key PRD Highlights:**
- **27 Features** organized by priority and user benefit
- **P0 Critical Features** all extracted from Build Guide requirements
- **Detailed Acceptance Criteria** for every major feature
- **Professional Format** following industry PRD standards
- **Actionable Specifications** ready for development team
- **Complete Traceability** from Build Guide technical specs to business requirements

**Business Value:**
- Transforms 706-line technical Build Guide into executive-ready business document
- Provides stakeholder alignment tool for project approval and funding
- Creates development roadmap with clear success criteria
- Establishes accountability framework with measurable outcomes

---

### Session Summary

**Total Extraction:** Successfully analyzed and transformed Build Guide.md into comprehensive PRD
**Information Processed:** 
- Product concept and technical architecture
- User requirements and workflows  
- Feature specifications and acceptance criteria
- Implementation constraints and timeline
- Business objectives and success metrics

**PRD Quality:** Professional-grade document suitable for:
- Executive presentation and approval
- Development team implementation guidance
- Stakeholder alignment and expectation management
- Project tracking and success measurement
- Future system enhancement planning

The PRD is now ready for stakeholder review and development team handoff.
