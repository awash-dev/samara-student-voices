export const SITE = {
  name: "Student Voice & Safety Platform",
  shortName: "Student Voice",
  tagline: "Your Voice. Protected. Heard.",
  university: "Samara University",
  campus: "Main Campus & Afar Region Academic Complex",
} as const

export const CREDITS = {
  developer: {
    name: "Mohammed Hussen",
    github: "https://github.com/awash-dev",
    handle: "awash-dev",
    website: "https://portfolis.pro.et",
    websiteLabel: "Awash Dev",
  },
  supporter: {
    name: "Peace Forum & Student Union",
    organization: "Samara University",
    website: "https://su.greenafricafarm.com/",
  },
} as const

export const EMERGENCY_CONTACTS = [
  {
    role: "Campus Security Dispatch",
    phone: "+251 (0)33 666 0112",
    available: "24/7 Rapid Response",
    badge: "Immediate Threat",
  },
  {
    role: "Women Student Safety & Dorm Liaison",
    phone: "+251 (0)33 666 0199",
    available: "24/7 Female Officers",
    badge: "Girl Safety Hotwire",
  },
  {
    role: "Executive Student Council Welfare",
    phone: "+251 (0)33 666 0240",
    available: "8:00 AM – 10:00 PM",
    badge: "Advocacy & Support",
  },
] as const

export const NAV_LINKS = [
  { href: "#channels", label: "Channels" },
  { href: "#emergency", label: "Girl Safety SOS" },
  { href: "#simulator", label: "Shield Simulator" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "Student FAQ" },
] as const

export const STATS = [
  { value: "100%", label: "Identity Shield", desc: "True anonymity on sensitive cases" },
  { value: "< 24h", label: "Avg Response", desc: "Fast review team response" },
  { value: "3 Roles + Audit", label: "Checks & Balances", desc: "Student, Exec, Admin & Superadmin" },
  { value: "0 Retaliation", label: "Charter Protected", desc: "Zero tolerance for victim intimidation" },
] as const

export const CHANNELS = [
  {
    id: "girl-safety",
    tag: "Priority Protection",
    title: "Girl & Women Student Safety",
    description:
      "A dedicated, trauma-informed safe channel for female students experiencing harassment, dormitory security threats, stalking, or gender-based violence.",
    icon: "ShieldAlert",
    accentColor: "rose",
    features: [
      "Optionally handled exclusively by designated female executive officers",
      "Immediate dormitory security coordination without disclosing identity",
      "End-to-end anonymity shield protecting from social or academic stigma",
      "Direct rapid follow-up with counseling and emergency medical referrals",
    ],
  },
  {
    id: "harassment",
    tag: "Zero Tolerance",
    title: "Anti-Harassment & Anti-Extortion",
    description:
      "Report academic intimidation, grades-for-favors blackmail, physical bullying, verbal abuse, or faculty misconduct with rock-solid protection.",
    icon: "AlertTriangle",
    accentColor: "amber",
    features: [
      "Timestamped case log to prevent denial or evidence destruction",
      "Strict zero-retaliation university enforcement charter",
      "Harassment reports go only to Super Admin and never to executive inboxes",
      "Anonymous option hides your name and email completely from executives",
      "Encrypted messaging thread to provide ongoing evidence safely",
    ],
  },
  {
    id: "feedback",
    tag: "Campus Reform",
    title: "Academic & Campus Life Voice",
    description:
      "Constructive feedback regarding lecture quality, exam schedules, library facilities, cafeteria food, water/power supply, and student union proposals.",
    icon: "BookOpen",
    accentColor: "indigo",
    features: [
      "Direct line to Student Union Representatives and Academic Deans",
      "Private discussion threads visible only to you and the assigned review team",
      "Track when your proposal moves from 'In Review' to 'Resolved'",
      "Help make Samara University a better, fairer home for everyone",
    ],
  },
] as const

export const ROLE_PROFILES = [
  {
    role: "Student",
    badge: "The Reporter",
    visibility: "Sees only their own reports, replies, and status updates.",
    powers: [
      "Submit reports under Harassment, Girl Safety, or Feedback",
      "Toggle Anonymous mode to strip all identifying data and route the report to Super Admin",
      "Chat directly with the assigned review team in real-time",
      "Guaranteed protection under university peace charter",
    ],
  },
  {
    role: "Executive",
    badge: "First Responder",
    visibility: "Sees identified incoming feedback & triage dashboard. Harassment and anonymous reports are Super Admin only.",
    powers: [
      "Review new identified feedback and triage by urgency",
      "Update status: Pending → In Review → Resolved",
      "Reply directly to students through private threads",
      "Write private internal notes between executive members",
    ],
  },
  {
    role: "Admin",
    badge: "University Official",
    visibility: "Manages accounts, approvals, campus departments, and overall statistics.",
    powers: [
      "Verify student and executive university credentials",
      "Approve or suspend access across the platform",
      "Monitor high-level resolution metrics and trends",
      "Ensure student council accountability",
    ],
  },
  {
    role: "Super Admin",
    badge: "Master Overseer & Audit Chief",
    visibility: "Complete oversight: all case activity, operational audit events, and security records. Anonymous identities stay protected.",
    powers: [
      "Full case audit trail: report events, status changes, replies, and approvals",
      "Review harassment and anonymous reports without exposing identity",
      "Prevent abuse, corruption, or intentional suppression of cases",
      "System configuration, role governance, and security diagnostics",
    ],
  },
] as const

export const FAQ_ITEMS = [
  {
    question: "Who can see my harassment or anonymous report or my identity?",
    answer:
      "Harassment and anonymous reports are hidden from the executive inbox and reviewed only by Super Admin. Your identity is never shown to other students, peers, or faculty. Super Admin retains audit-only access to investigate safety threats and prevent suppression of complaints.",
  },
  {
    question: "What makes the 'Girl Student Safety' channel special?",
    answer:
      "Female students face unique safety hurdles including dormitory vulnerability, stalking, and fear of social repercussions. This channel connects with vetted student union officers and women's affairs liaisons who handle cases with emergency urgency, optional female-officer routing, and strict confidentiality.",
  },
  {
    question: "What happens after I submit a report?",
    answer:
      "Your report is instantly timestamped and routed to the correct review queue: harassment and anonymous reports go to Super Admin, while identified feedback goes to the Executive Inbox. The review team will change the status to 'In Review' and may send you a private reply asking for details. You can reply back directly from your dashboard in real-time.",
  },
  {
    question: "Why does an Admin need to approve my account after registration?",
    answer:
      "To prevent fake accounts, bots, and external harassment of the student system, an Admin verifies that your email corresponds to a real registered Samara University student or designated officer. Once approved, you have unrestricted access.",
  },
  {
    question: "Why does Super Admin have access to audit logs if anonymous identities are hidden?",
    answer:
      "Super Admin needs a central audit trail to investigate safety threats and prevent executives from burying complaints. Anonymous submissions keep the sender's name, email, and account ID hidden even in the Super Admin workspace, while case events, status changes, and replies remain auditable.",
  },
] as const

export const AUTH_TRUST_POINTS = [
  "Private between you and the review team",
  "Harassment & anonymous reports restricted to Super Admin",
  "Admin approves accounts only",
] as const

export const PENDING_STEPS = [
  "Registration received — check your email for confirmation",
  "Admin verifies your university account",
  "You will receive an email when approved",
  "Sign in to your role dashboard",
] as const

