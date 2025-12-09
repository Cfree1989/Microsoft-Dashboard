# Fabrication Lab 3D Print Request System — Scratchpad
*Planning & Implementation Tracker*

---

## 🎯 CURRENT STATUS SUMMARY (Updated: December 2024)

### ✅ COMPLETED - Core MVP Infrastructure
| Component | Status | Notes |
|-----------|--------|-------|
| **PrintRequests List** | ✅ DONE | 22 columns, views, status formatting |
| **AuditLog List** | ✅ DONE | 14 audit columns |
| **Staff List** | ✅ DONE | Team members populated |
| **Flow A (PR-Create)** | ✅ DONE | ReqKey generation, filename validation, confirmation emails |
| **Flow B (PR-Audit)** | ✅ DONE | Field change logging, status emails (Rejected/Pending/Completed) |
| **Flow C (PR-Action)** | ✅ DONE | Staff action logging from Power Apps |
| **Power Apps Dashboard** | 🔶 PARTIAL | Started - core structure in progress |

### 🆕 NEW FEATURES DOCUMENTED (Not Yet Built)
| Component | Purpose | Documentation |
|-----------|---------|---------------|
| **FileUploads List** | Staging area for student file updates | `SharePoint/FileUploads-List-Setup.md` |
| **RequestComments List** | Bi-directional staff/student messaging with email threading | `SharePoint/RequestComments-List-Setup.md` |
| **Flow D (PR-Message)** | Send threaded email notifications to students | `PowerAutomate/Flow-(D)-Message-Notifications.md` |
| **Flow E (PR-Mailbox)** | Process inbound student email replies | `PowerAutomate/Flow-(E)-Mailbox-InboundReplies.md` |
| **Flow F (PR-ValidateUpload)** | Validate student upload requests (instant flow) | `PowerAutomate/Flow-(F)-ValidateUpload.md` |
| **Flow G (PR-ProcessUpload)** | Process validated uploads, move files to PrintRequest | `PowerAutomate/Flow-(G)-ProcessUpload.md` |
| **Student Upload Portal** | Separate app for replacement/additional file uploads | `PowerApps/StudentUploadPortal-App-Spec.md` |

---

## 📋 RECOMMENDED PATH FORWARD

### Phase 3A: Complete Core Power Apps Dashboard (CURRENT PRIORITY)
**Why:** You have all the backend infrastructure (3 lists + 3 flows) needed for a working MVP.

| Task | Est. Time | Status |
|------|-----------|--------|
| 3A.1: Status tabs gallery | 30 min | 🔶 In Progress |
| 3A.2: Job cards gallery | 1 hour | Pending |
| 3A.3: Approval modal (with cost calculation) | 1 hour | Pending |
| 3A.4: Rejection modal (with reason checkboxes) | 45 min | Pending |
| 3A.5: Archive modal | 30 min | Pending |
| 3A.6: Status action buttons (Start Print, Complete, Picked Up) | 1 hour | Pending |
| 3A.7: Search and filters | 30 min | Pending |
| 3A.8: Lightbulb attention toggle | 30 min | Pending |
| **Phase 3A Total** | **~6 hours** | |

### Phase 3B: Add Messaging Feature (Enhancement)
**Dependencies:** RequestComments list, Flows D & E

| Task | Est. Time | Status |
|------|-----------|--------|
| 3B.1: Build RequestComments SharePoint list | 45 min | Pending |
| 3B.2: Build Flow D (PR-Message) | 1.5 hours | Pending |
| 3B.3: Build Flow E (PR-Mailbox) | 2 hours | Pending |
| 3B.4: Add Message Modal to Power Apps | 1 hour | Pending |
| 3B.5: Add conversation view to job cards | 1 hour | Pending |
| **Phase 3B Total** | **~6 hours** | |

### Phase 3C: Add File Upload Feature (Enhancement)
**Dependencies:** FileUploads list, Flows F & G, Student Upload Portal

| Task | Est. Time | Status |
|------|-----------|--------|
| 3C.1: Build FileUploads SharePoint list | 20 min | Pending |
| 3C.2: Build Flow F (PR-ValidateUpload) | 1 hour | Pending |
| 3C.3: Build Flow G (PR-ProcessUpload) | 2 hours | Pending |
| 3C.4: Build Student Upload Portal app | 3 hours | Pending |
| 3C.5: Add file attachment modal to dashboard | 1 hour | Pending |
| **Phase 3C Total** | **~7 hours** | |

### Phase 4: Integration & Production (After All Features)

| Task | Est. Time |
|------|-----------|
| 4.1: End-to-end testing | 1.5 hours |
| 4.2: Edge case testing | 30 min |
| 4.3: Production deployment & handoff | 30 min |
| **Phase 4 Total** | **~2.5 hours** |

---

## Background and Motivation

### Project Context
Building a **comprehensive 3D Print Request Queue Management System** for LSU's Fabrication Lab using entirely Microsoft Power Platform technologies. The system handles student submissions, staff workflow management, complete audit trails, and maintains security/privacy requirements.

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

## Completed Features Archive

### ✅ Filename Validation in Flow A (COMPLETED)
**Background:** Enforce filename policy for student-submitted attachments without renaming files.
**Solution:** Flow A validates `FirstLast_Method_Color.ext` format with allowed extensions (.stl, .obj, .3mf, .idea, .form).
**Result:** Invalid filenames auto-rejected with clear email instructions; valid files proceed to confirmation.

### ✅ RejectionReason Multi-Choice Field Fix (COMPLETED)
**Issue:** Multi-choice SharePoint field returned array of complex objects, not simple strings.
**Solution:** Select action with **text mode Map field** extracts `Value` properties, then `join()` for display.
**Key Learning:** Must click "Switch to text mode" in Map field - visual mode creates unwanted key-value pairs.

### ✅ PR-Audit Documentation Reorganization (COMPLETED)
**Issue:** Documentation had forward/backward references requiring scrolling.
**Solution:** Complete instructions at every step, inline HTML templates, deleted 240 lines of redundant content.

### ✅ Flow B Number Field Internal Name Fix (COMPLETED)
**Issue:** NewValue empty in audit logs for EstimatedWeight changes.
**Root Cause:** SharePoint display names differ from internal names (EstimatedWeight → EstWeight).
**Solution:** Use `triggerOutputs()?['body/EstWeight']` with null-safe handling.

### ✅ Flow A/B Race Condition Prevention (COMPLETED)
**Issue:** Flow A updates trigger Flow B during item creation.
**Solution:** Condition `equals(LastActionBy, 'System')` as Step 2 wrapping ALL Flow B logic.

### ✅ Status Model Unification (COMPLETED)
**Result:** 8-status unified model aligned with masterplan: Uploaded → Pending → Ready to Print → Printing → Completed → Paid & Picked Up → Rejected → Archived

### ✅ Field Structure Refinement (COMPLETED)
**Result:** 12 student-facing fields focused on project definition; 10 staff-only fields for operational management.

---

## Project Status Board

### ✅ PHASE 0: CRITICAL GAPS RESOLVED (COMPLETED)
- [x] **0.1**: Status Model Unification ✅ COMPLETED
- [x] **0.2**: File Handling Enhancement (SIMPLIFIED APPROACH) ✅ COMPLETED  
- [x] **0.3**: Field Structure Refinement ✅ COMPLETED

### ✅ PHASE 1: SHAREPOINT FOUNDATION (COMPLETED)
**Critical Path**: Everything depends on this foundation
- [x] **1.1**: Create SharePoint Team Site ✅ COMPLETED
- [x] **1.2**: Build PrintRequests List - 22 columns, views, formatting ✅ COMPLETED
- [x] **1.3**: Build AuditLog List - 14 audit columns ✅ COMPLETED
- [x] **1.4**: Build Staff List + populate team ✅ COMPLETED
- [x] **1.5**: Foundation Validation Testing ✅ COMPLETED

### ✅ PHASE 2: CORE POWER AUTOMATE FLOWS (COMPLETED)
**SEQUENTIAL BUILD ORDER** (dependencies matter):
- [x] **2.1**: Flow A (PR-Create) - ReqKey + filename validation + confirmation emails ✅ COMPLETED
- [x] **2.2**: Flow B (PR-Audit) - Change logging + status emails (Rejected/Pending/Completed) ✅ COMPLETED
- [x] **2.3**: Flow C (PR-Action) - Staff action logging from Power Apps ✅ COMPLETED
- [x] **2.4**: Flow Integration Testing ✅ COMPLETED

### 🚀 PHASE 3A: CORE POWER APPS DASHBOARD (IN PROGRESS - Current Priority)
**Dependencies**: Phases 1 & 2 complete ✅
**Status**: STARTED - Basic structure begun

- [ ] **3A.1**: App setup + data connections (PrintRequests, AuditLog, Staff, Flow C) - 🔶 PARTIAL
- [ ] **3A.2**: Status tabs gallery - 8 status tabs with counts
- [ ] **3A.3**: Job cards gallery - WrapCount=4, collapsible cards
- [ ] **3A.4**: Approval modal - weight input, cost calculation, staff dropdown
- [ ] **3A.5**: Rejection modal - reason checkboxes, comments, staff dropdown
- [ ] **3A.6**: Archive modal - confirmation dialog
- [ ] **3A.7**: Status action buttons (Start Print, Complete, Picked Up)
- [ ] **3A.8**: Search/filter functionality
- [ ] **3A.9**: Lightbulb attention toggle with glow effect
- [ ] **3A.10**: Student form customization - hide staff fields, defaults
- [ ] **3A.11**: Core dashboard testing

**Estimated Remaining Time**: ~6 hours

### ⏳ PHASE 3B: MESSAGING FEATURE (Enhancement - After Core Dashboard)
**Dependencies**: RequestComments list, Flows E & F
**Status**: DOCUMENTED - Not yet built

- [ ] **3B.1**: Build RequestComments SharePoint list (45 min)
- [ ] **3B.2**: Build Flow D (PR-Message) - outbound email notifications with threading (1.5 hours)
- [ ] **3B.3**: Build Flow E (PR-Mailbox) - inbound email reply processing (2 hours)
- [ ] **3B.4**: Add Message Modal to Power Apps dashboard (1 hour)
- [ ] **3B.5**: Add conversation view to expanded job cards (1 hour)
- [ ] **3B.6**: Messaging feature testing

**Estimated Time**: ~6 hours

### ⏳ PHASE 3C: FILE UPLOAD FEATURE (Enhancement - After Messaging)
**Dependencies**: FileUploads list, Flows G & H, Student Upload Portal
**Status**: DOCUMENTED - Not yet built

- [ ] **3C.1**: Build FileUploads SharePoint list (20 min)
- [ ] **3C.2**: Build Flow F (PR-ValidateUpload) - instant validation flow (1 hour)
- [ ] **3C.3**: Build Flow G (PR-ProcessUpload) - file processing flow (2 hours)
- [ ] **3C.4**: Build Student Upload Portal Canvas app (3 hours)
- [ ] **3C.5**: Add Attachments Modal to dashboard (1 hour)
- [ ] **3C.6**: File upload feature testing

**Estimated Time**: ~7 hours

### ⏳ PHASE 4: INTEGRATION & PRODUCTION (After All Features)
**Dependencies**: Requires all phases complete

- [ ] **4.1**: End-to-End Testing - complete workflow validation (1.5 hours)
- [ ] **4.2**: Edge Case Testing - file validation, permissions (30 min) 
- [ ] **4.3**: Production Deployment & Handoff (30 min)

**Estimated Time**: ~2.5 hours

---

### 📊 PROJECT METRICS

| Metric | Value |
|--------|-------|
| **Core MVP (3A)** | ~6 hours remaining |
| **Messaging Feature (3B)** | ~6 hours |
| **File Upload Feature (3C)** | ~7 hours |
| **Testing & Deploy (4)** | ~2.5 hours |
| **Total Remaining** | ~21.5 hours (with all features) |
| **MVP Only** | ~8.5 hours (3A + 4) |

**Recommendation**: Complete Phase 3A first for a working MVP, then add 3B and 3C incrementally.

---

## Executor's Feedback or Assistance Requests

### 🚀 CURRENT FOCUS: Phase 3A - Core Power Apps Dashboard

**Status:** IN PROGRESS - Core backend infrastructure complete, continuing dashboard development

**What's Working:**
- ✅ All 3 SharePoint lists functional with proper columns
- ✅ Flow A generating ReqKeys and sending confirmation emails
- ✅ Flow B logging field changes and sending status emails
- ✅ Flow C available for Power Apps action logging
- ✅ Basic Power Apps structure started

**Next Steps:**
1. Complete status tabs gallery (galStatusTabs)
2. Build job cards gallery (galJobCards) with WrapCount=4
3. Implement Approval Modal with cost calculation
4. Implement Rejection Modal with reason checkboxes
5. Add remaining action buttons

**Documentation Reference:**
- `PowerApps/StaffDashboard-App-Spec.md` - Complete step-by-step guide
- `.cursor/Build Guide.md` - Overall system guide

---

### 📋 ENHANCEMENT FEATURES DOCUMENTATION SUMMARY

**Phase 3B: Messaging System** (Bi-directional staff/student communication)
| Component | Documentation | Purpose |
|-----------|---------------|---------|
| RequestComments List | `SharePoint/RequestComments-List-Setup.md` | 13 columns for threaded conversations |
| Flow D (PR-Message) | `PowerAutomate/Flow-(D)-Message-Notifications.md` | Send threaded emails with `[REQ-00001]` format |
| Flow E (PR-Mailbox) | `PowerAutomate/Flow-(E)-Mailbox-InboundReplies.md` | Parse inbound replies, validate sender |
| Power Apps Message Modal | `PowerApps/StaffDashboard-App-Spec.md` Step 16 | Staff sends messages from dashboard |

**Phase 3C: File Upload System** (Student file replacement/addition)
| Component | Documentation | Purpose |
|-----------|---------------|---------|
| FileUploads List | `SharePoint/FileUploads-List-Setup.md` | 10 columns for upload queue |
| Flow F (PR-ValidateUpload) | `PowerAutomate/Flow-(F)-ValidateUpload.md` | Instant validation before upload UI |
| Flow G (PR-ProcessUpload) | `PowerAutomate/Flow-(G)-ProcessUpload.md` | Move validated files to PrintRequest |
| Student Upload Portal | `PowerApps/StudentUploadPortal-App-Spec.md` | Separate app for student uploads |

---

## Lessons

### 🔴 Critical - SharePoint Field Names
- **Internal vs Display Names**: ALWAYS verify internal names in List Settings → Column URL. Examples: EstimatedWeight → `EstWeight`, EstimatedTime → `EstHours`
- **Multi-Choice Fields**: Return arrays of objects with `Id` and `Value` properties. Use Select action with **text mode** Map field (`@item()?['Value']`), then `join()` to format for display

### 🟠 Power Automate Expressions
- **Null Handling**: Use `if(equals(value, null), fallback, function(value))` before `int()`, `length()`, or type conversions
- **Empty Arrays**: Use `json('[]')` not `createArray()` for empty array fallbacks in Apply to each
- **Race Conditions**: Add `equals(LastActionBy, 'System')` check as Step 2 in triggered flows to prevent loops

### 🟡 Power Apps Patterns
- **Person Field Claims**: Format as `"i:0#.f|membership|" & Lower(User().Email)`
- **Staff Attribution**: Mandatory dropdown from `colStaff` collection in modals; validate before enabling action buttons
- **Delegation**: Use explicit OR conditions vs "in" operator for better gallery performance

### 🟢 Implementation Strategy
- **Build Order**: SharePoint lists → Core flows (A, B, C) → Power Apps dashboard → Enhancement features
- **File Handling**: Download locally, work in slicer, status updates only in dashboard (no re-uploads)
- **Test Incrementally**: Test each flow individually before building UI that calls it

---

## Quick Reference

### Key URLs
| Resource | URL |
|----------|-----|
| SharePoint Site | `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab` |
| PrintRequests List | `.../Lists/PrintRequests` |
| My Requests View | `.../Lists/PrintRequests/My%20Requests.aspx` |
| Staff Queue View | `.../Lists/PrintRequests/Staff%20%20Queue.aspx` |

### Flow Names & Status
| Flow | Purpose | Status |
|------|---------|--------|
| **Flow A (PR-Create)** | ReqKey + filename validation + confirmation emails | ✅ DONE |
| **Flow B (PR-Audit)** | Field change logging + status emails | ✅ DONE |
| **Flow C (PR-Action)** | Staff action logging from Power Apps | ✅ DONE |
| **Flow D (PR-Message)** | Outbound message notifications with threading | 📄 Documented |
| **Flow E (PR-Mailbox)** | Inbound email reply processing | 📄 Documented |
| **Flow F (PR-ValidateUpload)** | Student upload validation (instant) | 📄 Documented |
| **Flow G (PR-ProcessUpload)** | File processing and transfer | 📄 Documented |

### SharePoint Internal Field Names (Critical)
| Display Name | Internal Name | Type |
|--------------|---------------|------|
| EstimatedWeight | `EstWeight` | Number |
| EstimatedTime | `EstHours` | Number |
| EstimatedCost | `EstimatedCost` | Currency |
| Status | `Status` | Choice |
| Student | `Student` | Person |
| ReqKey | `ReqKey` | Text |
| NeedsAttention | `NeedsAttention` | Yes/No |

### Status Workflow
```
Uploaded → Pending → Ready to Print → Printing → Completed → Paid & Picked Up → Archived
                ↳ Rejected → Archived
```

### Pricing Formula
```
Cost = Max($3.00, Weight × Rate)
  - Filament: $0.10/gram
  - Resin: $0.20/gram
  - Minimum: $3.00
```

---

## Testing & Documentation

### ✅ COMPLETED - Testing Guide Created
**File:** `PowerAutomate/Flow-Testing-Guide.md`
- 69 distinct test scenarios across all flows
- Quick Start: 8 essential tests (30 minutes)
- Full suite: 2.5-3 hours complete testing

### ✅ COMPLETED - All Core Documentation
| Document | Purpose | Status |
|----------|---------|--------|
| `Build Guide.md` | Complete system implementation guide | ✅ Updated |
| `FabLab-PRD.md` | Product requirements document | ✅ Complete |
| `PowerApps/StaffDashboard-App-Spec.md` | Staff console step-by-step | ✅ Complete |
| `PowerApps/StudentForm-Instructions.md` | Student form customization | ✅ Complete |
| `PowerAutomate/Flow-Testing-Guide.md` | Flow testing procedures | ✅ Complete |

---

## Document Navigation

### Primary Documentation Files
| Phase | Document | Purpose |
|-------|----------|---------|
| **Overview** | `.cursor/Build Guide.md` | Complete MVP implementation guide |
| **Phase 1** | `SharePoint/*.md` | List setup instructions |
| **Phase 2** | `PowerAutomate/Flow-(A,B,C)*.md` | Core flow documentation |
| **Phase 3A** | `PowerApps/StaffDashboard-App-Spec.md` | Staff console build guide |
| **Phase 3B** | `SharePoint/RequestComments-List-Setup.md`, `PowerAutomate/Flow-(E,F)*.md` | Messaging feature |
| **Phase 3C** | `SharePoint/FileUploads-List-Setup.md`, `PowerAutomate/Flow-(G,H)*.md` | File upload feature |
| **Testing** | `PowerAutomate/Flow-Testing-Guide.md` | Testing procedures |

---

*Last Updated: December 2024*
*Status: Phase 3A - Core Power Apps Dashboard In Progress*