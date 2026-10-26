import { ROLE_PROFILES } from "@/lib/marketing/content"

export type DashboardGuideRole = "student" | "executive"

export type DashboardGuideIcon =
  | "send"
  | "messages"
  | "reports"
  | "settings"
  | "users"

export type DashboardGuideAction = {
  /** Dashboard view id used by the role's navigation handler. */
  view: string
  label: string
  description: string
  icon: DashboardGuideIcon
}

export type DashboardGuideSection = {
  title: string
  description: string
}

export type DashboardGuideFaq = {
  question: string
  answer: string
}

export type DashboardGuide = {
  role: DashboardGuideRole
  eyebrow: string
  title: string
  description: string
  profile: (typeof ROLE_PROFILES)[number]
  steps: DashboardGuideSection[]
  privacy: DashboardGuideSection[]
  actions: DashboardGuideAction[]
  faqs: DashboardGuideFaq[]
  footnote: string
}

export const GUIDE_STORAGE_KEY_PREFIX = "svp_dashboard_guide_seen"

export const DASHBOARD_GUIDES: Record<DashboardGuideRole, DashboardGuide> = {
  student: {
    role: "student",
    eyebrow: "Student onboarding",
    title: "Your voice, protected",
    description:
      "A quick tour of how to send a message, choose anonymity, and follow every reply in your private thread.",
    profile: ROLE_PROFILES[0],
    steps: [
      {
        title: "Choose the right channel",
        description:
          "Use Feedback for academic and campus-life ideas. Use Harassment for safety reports, which go straight to the Super Admin review queue.",
      },
      {
        title: "Write what happened",
        description:
          "Include dates, places, and details where you feel safe. You can add more context later in your private thread.",
      },
      {
        title: "Decide on anonymity",
        description:
          "Anonymous mode masks your name, email, and user ID. Anonymous reports are hidden from executives and reviewed only by Super Admin.",
      },
      {
        title: "Track the outcome",
        description:
          "Open Messages or Reports to see status changes and reply privately. Cases move from Pending to In review to Resolved.",
      },
    ],
    privacy: [
      {
        title: "Harassment is Super Admin only",
        description:
          "Harassment reports never appear in the executive inbox. They route directly to the Super Admin review queue.",
      },
      {
        title: "Anonymous means masked",
        description:
          "Choosing anonymous hides your name, email, and user ID from every dashboard and export, including the Super Admin view.",
      },
      {
        title: "Private threads",
        description:
          "Only you and the authorized review team can read your conversation, status changes, and replies.",
      },
      {
        title: "Protected from retaliation",
        description:
          "The Samara University peace charter backs every report. Speak up without fear of academic or social punishment.",
      },
    ],
    actions: [
      {
        view: "compose",
        label: "Submit a message",
        description: "Start a feedback or harassment report.",
        icon: "send",
      },
      {
        view: "messages",
        label: "View replies",
        description: "Read your private threads and status updates.",
        icon: "messages",
      },
      {
        view: "reports",
        label: "My harassment reports",
        description: "See reports handled by Super Admin.",
        icon: "reports",
      },
      {
        view: "settings",
        label: "Account & privacy",
        description: "Review your profile and protection settings.",
        icon: "settings",
      },
    ],
    faqs: [
      {
        question: "Will an executive see my harassment report?",
        answer:
          "No. Harassment reports are restricted to Super Admin and are not returned to executive inboxes or APIs.",
      },
      {
        question: "Can I add details after sending anonymously?",
        answer:
          "Yes. Reply in the private thread without adding identifying details. Anonymous submissions stay masked in every workspace.",
      },
      {
        question: "What do the status labels mean?",
        answer:
          "Pending means your message was received. In review means a reviewer is working on it. Resolved means the case is closed, and any reply stays visible in Messages.",
      },
    ],
    footnote:
      "Open this guide anytime with the Guide button in your header. Closing it never changes your reports or privacy choices.",
  },
  executive: {
    role: "executive",
    eyebrow: "Executive onboarding",
    title: "Triage with care",
    description:
      "A quick tour of your identified-feedback inbox, reply workflow, and the privacy boundary every executive must protect.",
    profile: ROLE_PROFILES[1],
    steps: [
      {
        title: "Start in the inbox",
        description:
          "Review identified student feedback. Harassment and anonymous reports never appear here by design.",
      },
      {
        title: "Reply privately",
        description:
          "Answer the student inside the thread. Only the student and authorized reviewers can read the conversation.",
      },
      {
        title: "Move the status forward",
        description:
          "Update cases from Pending to In review to Resolved as work progresses. Every change is timestamped.",
      },
      {
        title: "Keep context in internal notes",
        description:
          "Record handover context for other executives. Internal notes are never shown to students.",
      },
    ],
    privacy: [
      {
        title: "Restricted reports stay invisible",
        description:
          "Harassment and anonymous reports are Super Admin-only. They are excluded from executive inboxes, APIs, and exports.",
      },
      {
        title: "Never de-anonymize",
        description:
          "Do not try to identify anonymous reporters through timing, metadata, or other records. Escalate concerns to Super Admin.",
      },
      {
        title: "Confidential by default",
        description:
          "Discuss identified cases only with authorized reviewers. Do not forward student details outside the platform.",
      },
      {
        title: "Every action is auditable",
        description:
          "Replies, notes, status changes, and access are logged for accountability and student protection.",
      },
    ],
    actions: [
      {
        view: "inbox",
        label: "Open student inbox",
        description: "Triage identified feedback and reply.",
        icon: "messages",
      },
      {
        view: "students",
        label: "Student directory",
        description: "Find students and send official email notices.",
        icon: "users",
      },
      {
        view: "settings",
        label: "Settings & ethics",
        description: "Review your account and confidentiality rules.",
        icon: "settings",
      },
    ],
    faqs: [
      {
        question: "Why is a report missing from my inbox?",
        answer:
          "Harassment and anonymous reports are restricted to Super Admin by design. Executives only receive identified student feedback.",
      },
      {
        question: "Can I email several students at once?",
        answer:
          "Yes. Open Students, filter or select the rows you need, and send one official notice to everyone selected.",
      },
      {
        question: "Who can see internal notes?",
        answer:
          "Only authorized executives and Super Admin. Students never see internal notes in their threads or exports.",
      },
    ],
    footnote:
      "Open this guide anytime with the Guide button in your header. Closing it never changes your inbox or review access.",
  },
}
