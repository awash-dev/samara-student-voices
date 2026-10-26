# Samara University — Student Voice & Safety Network

> **A secure, confidential grievance redressal, female student protection, and campus feedback platform built for Samara University.**  
> *Your Voice. Charter-Protected. Heard.*

---

## 🏛️ Executive Summary

The **Student Voice & Safety Network** is an institutional digital platform designed to bridge the trust gap between students, student executive leaders, and university administrators at Samara University. It empowers every student to speak out against harassment, seek immediate emergency assistance, and voice academic concerns without fear of retaliation, academic penalty, or social exposure.

Built around a **strict 4-role checks-and-balances governance model**, the system ensures that sensitive safety complaints can never be buried, ignored, or intercepted by unauthorized peers, while constructive university feedback receives transparent, timely executive action.

---

## 👥 Who Is This Platform For?

The platform serves four primary stakeholder groups within the Samara University ecosystem, each equipped with dedicated workspaces, permissions, and security guardrails:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SAMARA UNIVERSITY COMMUNITY                     │
└───────┬───────────────────┬───────────────────┬───────────────────┬────┘
        │                   │                   │                   │
        ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   STUDENTS   │    │  EXECUTIVES  │    │ADMINISTRATORS│    │ SUPER ADMINS │
│ Safe Voices  │    │First Response│    │Account Verify│    │Master Audit  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 1. 🎓 Students (Undergraduate, Postgraduate & Campus Residents)
- **Target Audience:** Any active student at Samara University holding an approved university email.
- **Core Role:** Submit incident reports, request emergency crisis intervention, follow case progress in real-time, and suggest university improvements.

### 2. 🛡️ Student Executives (Student Union Council & Welfare Representatives)
- **Target Audience:** Elected Student Council representatives, Welfare Officers, and Academic Affairs liaisons.
- **Core Role:** Review incoming non-sensitive campus feedback, triage issues by urgency, communicate directly with students via private threads, collaborate using internal notes, and advance issues from *Pending* to *In Review* to *Resolved*.

### 3. ⚖️ Campus Administrators (Student Affairs & Verification Staff)
- **Target Audience:** University registrars and Student Affairs administrative staff.
- **Core Role:** Gatekeep platform integrity by reviewing and verifying student and executive registrations against the official university roster. Admins ensure no fake accounts or bots infiltrate the network, while being **strictly barred** from reading confidential student messages.

### 4. 👑 Super Administrators (Dean of Student Affairs & Chief Compliance Officers)
- **Target Audience:** Dean of Student Affairs, Chief Legal/Compliance Officer, and designated senior leadership.
- **Core Role:** Maintain master oversight over all harassment cases, confidential life-safety emergencies, system configuration (including emergency campus hotline dispatch), and immutable audit logs. Super Admin guarantees anti-corruption and anti-suppression oversight.

---

## 💡 What Benefits Does the Platform Deliver?

| Dimension | Traditional Campus Processes | Samara Student Voice Platform |
|---|---|---|
| **Reporting Fear** | Fear of academic retaliation, grading bias, or social stigma. | **Guaranteed Anonymity & Zero-Retaliation Policy** backed by University Peace Charter. |
| **Response Time** | Weeks of bureaucratic red tape and lost paper files. | **Real-time digital triage** with an average initial review turnaround under 24 hours. |
| **Harassment Handling** | Often intercepted or handled by peers without authority. | **Restricted strictly to Super Admin**; completely invisible to executive peer inboxes. |
| **Transparency** | Students never know if their complaint was read or discarded. | **Live status tracking** (*Pending* → *In Review* → *Resolved*) with private 2-way replies. |
| **Emergency Help** | Scattered personal phone numbers with uncertain availability. | **Instant 24/7 Crisis Hotline Hub** with direct one-tap emergency calling and SOS triggers. |
| **Accountability** | Records can be deleted or denied by involved parties. | **Cryptographic timestamps, tamper-resistant database records, and complete audit logging.** |

---

## 📢 Dedicated Reporting Channels

The system categorizes all student submissions into three distinct pathways to guarantee appropriate handling, privacy, and speed:

```
                            STUDENT SUBMISSION
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│ 🔴 HARASSMENT & ABUSE│   │ 🌸 GIRL STUDENT SOS │   │ 📘 CAMPUS FEEDBACK  │
│ Stalking, Extortion,│   │ 24/7 Female Officer │   │ Teaching, Cafeteria,│
│ Intimidation, Bias  │   │ Crisis Intervention │   │ Facilities, Dorms   │
└──────────┬──────────┘   └──────────┬──────────┘   └──────────┬──────────┘
           │                         │                         │
           ▼                         ▼                         ▼
   SUPER ADMIN ONLY          SUPER ADMIN & DISPATCH     EXECUTIVE COUNCIL
(Zero Executive Leak)     (Immediate Field Response)   (Collaborative Triage)
```

### 1. 🔴 Harassment & Abuse Reporting
- **Scope:** Sexual harassment, coercion, verbal or physical intimidation, stalking, grade extortion, and discrimination.
- **Protection Mechanism:** Routed **exclusively** to the Super Admin workspace. Student Executive Council members **never** receive access to these reports, eliminating the danger of peer gossip or conflicts of interest.
- **Audit Shield:** An immutable audit timestamp prevents cases from being altered, suppressed, or destroyed.

### 2. 🌸 Girl Student Safety & Hotline Support
- **Scope:** Immediate threats to female students in dormitories, campus transit corridors, or unlit academic facilities.
- **Protection Mechanism:** Instant access to 24/7 campus security dispatch and the Women Student Safety Liaison. Students can submit urgent emergency reports or trigger immediate one-tap mobile calls to verified female officers.

### 3. 📘 Academic & Campus Life Feedback
- **Scope:** Curriculum grievances, cafeteria nutrition, laboratory equipment, library hours, water/power outages, and student welfare proposals.
- **Protection Mechanism:** Routed to the Student Executive triage queue. Representatives review proposals, add internal collaborative team notes, reply directly to the student, and resolve actionable issues.

---

## 🔒 Privacy & Governance Architecture

The platform is engineered around the principle of **Defensive Privacy** and separation of powers:

### 1. Zero-Knowledge Executive Routing
When a student toggles **"Submit Anonymously"**:
- The student's name, email, and user account UUID are stripped at the database query layer.
- The executive workspace receives only the sanitized message content, incident category, and a pseudonymous identifier.
- Executives can still communicate with the anonymous student through the encrypted message thread without ever knowing who they are.

### 2. Harassment Isolation Principle
Harassment complaints are completely partitioned away from peer executives:
- Executive API endpoints explicitly reject queries seeking harassment records (`ne(messages.type, 'harassment')`).
- Push notifications for harassment cases bypass executive channels entirely, notifying only Super Admin devices.

### 3. Administrator Separation of Powers
Campus Administrators verify university credentials to ensure every account is authentic. However, **Administrators have zero access to read messages or replies**. They can only approve or reject account requests.

### 4. Super Admin Emergency Clearance
The Super Admin retains audit authority to investigate life-safety threats, prevent abuse of the system, and investigate corrupt suppression of complaints, with every action logged in the compliance ledger.

---

## ⚡ Key Platform Capabilities

### 📱 Student Workspace
- **Smart Submission Composer:** Pick between sensitive harassment or open campus feedback, with real-time character counters and instant anonymous toggling.
- **Interactive Case History:** Live timeline of all submitted cases with status badges (*Pending*, *In Review*, *Resolved*).
- **Two-Way Threaded Discussion:** Chat directly with the assigned review team, ask questions, and supply additional evidence.
- **Account Security Suite:** Client-side credential management, session intelligence, and instant sign-out.

### 🛡️ Student Executive Dashboard
- **Inbox Command Center:** Filterable triage table with category filters, search, and status counters.
- **Case Review Panel:** Read incoming feedback, change case lifecycle status, write student-facing replies, and maintain internal notes for fellow executives.
- **Resolution Metrics:** Visual progress trackers showcasing resolved vs. pending community feedback.

### ⚖️ Administrator Verification Hub
- **Queue Management:** Review pending student and executive registrations against campus enrollment records.
- **One-Click Approval / Rejection:** Instantly verify genuine students or purge illegitimate registrations.
- **Zero-Message Access:** Enforced architectural boundary ensuring student privacy remains inviolable.

### 👑 Super Administrator Master Oversight
- **Central Incident Command:** Full case workspace for harassment investigations with rich Word (.docx) case dossier exports for disciplinary tribunals.
- **Live Platform Settings Editor:** Manage and live-update campus emergency contacts, dispatch numbers, and crisis hotlines across the entire platform in real time.
- **Comprehensive User Directory:** Search, filter, promote, or suspend user accounts across all four system roles.
- **Security & Privacy Audit Ledger:** Inspect platform consent telemetry, security check-ins, and cryptographic logs.

---

## 🌐 Dynamic Campus Safety Hotline Hub

Emergency contacts are **centrally controlled by the Super Administrator** through the platform settings console. When crisis contacts or response personnel change:
1. Super Admin updates phone numbers and availability in their settings portal.
2. Changes are written directly to the database platform settings table.
3. The guest landing page emergency grid and the global header **SOS Modal** synchronize immediately, ensuring every student on campus always calls active, verified numbers.

---

## 🤝 Project Credits & Institutional Endorsement

- **Lead Software Architect & Developer:** [Mohammed Hussen](https://github.com/awash-dev) (`awash-dev`)  
  *Portfolio:* [portfolis.pro.et](https://portfolis.pro.et)
- **Institutional Supporter:** Peace Forum & Student Union, Samara University  
  *Partner Portal:* [su.greenafricafarm.com](https://su.greenafricafarm.com/)
- **Presented To:** Dean of Student Affairs, Samara University

---

*Samara University Student Voice Network — Ensuring every voice is protected, every emergency is answered, and every student is heard.*
# samara-student-voices
