# Staff Outlook Setup Guide

**Purpose:** Configure Outlook to organize automated FabLab system emails  
**Time Required:** 5 minutes

---

## Overview

The FabLab system sends automated emails for confirmations, rejections, estimates, and pickup notifications. These emails can clutter your inbox. This guide shows how to automatically move them to a dedicated folder while keeping other emails visible.

---

## Automated Email Subject Patterns

The system sends emails with these subject lines:

| Type | Subject Pattern |
|------|-----------------|
| Confirmation | `We received your 3D Print request – REQ-#####` |
| Rejection (no file) | `Action needed: attach your 3D print file` |
| Rejection (bad name) | `Action needed: rename your 3D print file` |
| Estimate Ready | `Estimate ready for your 3D print – REQ-#####` |
| Estimate Confirmed | `Estimate confirmed – REQ-##### – Ready to print` |
| Request Rejected | `Your 3D Print request has been rejected – REQ-#####` |
| Ready for Pickup | `Your 3D print is ready for pickup – REQ-#####` |
| Staff Message | `[REQ-#####] Message title` |

**Common pattern:** All automated emails contain `REQ-` in the subject line.

---

## Option 1: Outlook Web (Recommended)

Server-side rules run 24/7, even when Outlook desktop isn't open.

### Step 1: Create the Folder

1. Go to **outlook.office.com**
2. In the left sidebar, right-click **Inbox**
3. Click **Create new subfolder**
4. Name it: `FabLab Notifications`
5. Press **Enter**

### Step 2: Create the Rule

1. Click the **Settings** gear icon (top-right)
2. Click **View all Outlook settings**
3. Go to **Mail** → **Rules**
4. Click **+ Add new rule**

### Step 3: Configure the Rule

| Field | Value |
|-------|-------|
| **Name** | `FabLab Auto-Emails` |

**Add a condition:**

5. Click **Add a condition**
6. Select **Subject includes**
7. Type: `REQ-`

**Add an action:**

8. Click **Add an action**
9. Select **Move to**
10. Choose **FabLab Notifications** folder

**Optional - Stop processing:**

11. Click **Add an action**
12. Select **Stop processing more rules**

### Step 4: Save

13. Click **Save**

The rule takes effect immediately. All emails with `REQ-` in the subject will now go to your FabLab Notifications folder.

---

## Option 2: Outlook Desktop

Use this if you prefer desktop configuration.

### Step 1: Create the Folder

1. In Outlook, right-click **Inbox**
2. Click **New Folder**
3. Name it: `FabLab Notifications`
4. Click **OK**

### Step 2: Create the Rule

1. Go to **Home** tab → **Rules** → **Manage Rules & Alerts**
2. Click **New Rule...**
3. Select **Apply rule on messages I receive**
4. Click **Next**

### Step 3: Set Conditions

5. Check **with specific words in the subject**
6. Click the underlined **specific words** link
7. Type: `REQ-`
8. Click **Add** → **OK**
9. Click **Next**

### Step 4: Set Actions

10. Check **move it to the specified folder**
11. Click the underlined **specified** link
12. Select **FabLab Notifications**
13. Click **OK**
14. Click **Next**

### Step 5: Finish

15. Click **Next** (skip exceptions)
16. Name the rule: `FabLab Auto-Emails`
17. Check **Turn on this rule**
18. Click **Finish**
19. Click **OK** to close Rules dialog

---

## Filtering More Specifically

If you want to filter only certain email types (not all `REQ-` emails), use multiple conditions:

### Example: Only Filter Confirmations

Use **Subject includes** with these patterns (create separate rules or use OR logic):

- `We received your 3D Print request`
- `Estimate ready for your 3D print`
- `Your 3D print is ready for pickup`

### Example: Keep Rejections in Inbox

Create the rule with `REQ-` but add an **exception**:

- **Except if** subject includes: `rejected`
- **Except if** subject includes: `Action needed`

This keeps rejection notifications visible while filing routine confirmations.

---

## Testing Your Rule

1. After creating the rule, submit a test print request
2. Wait for the confirmation email
3. Check that it arrives in **FabLab Notifications** folder (not Inbox)
4. If it's still in Inbox, verify the rule is enabled and the condition matches

---

## Troubleshooting

### Emails still appearing in Inbox

- **Check rule is enabled:** Go to Rules settings and verify the toggle is on
- **Check condition:** Make sure it's `Subject includes` (not `Subject is`)
- **Server sync delay:** Outlook Web rules may take a few minutes to activate

### Rule not showing in Outlook Desktop

- Rules created in Outlook Web are server-side
- They work automatically but may not appear in Outlook Desktop's rule list
- This is normal - the rule still works

### Want to see the emails temporarily

- Simply go to your **FabLab Notifications** folder
- Or temporarily disable the rule in Settings → Mail → Rules

---

## Quick Reference

| Task | Location |
|------|----------|
| Create rule (web) | outlook.office.com → Settings → Mail → Rules |
| Create rule (desktop) | Home → Rules → Manage Rules & Alerts |
| View filtered emails | FabLab Notifications folder |
| Disable rule temporarily | Settings → Mail → Rules → Toggle off |
