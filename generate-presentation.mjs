import pptxgen from 'pptxgenjs'
import fs from 'node:fs'
import path from 'node:path'

const pptx = new pptxgen()
pptx.layout = 'LAYOUT_16x9'
pptx.author = 'Mohammed Hussen (awash-dev)'
pptx.company = 'Samara University — Student Voice & Safety Network'
pptx.title = 'Samara University Student Voice & Safety Network Presentation'

// Color Palette
const COLORS = {
  navyDark: '0F172A',
  navyCard: '1E293B',
  bluePrimary: '2563EB',
  blueLight: 'EFF6FF',
  blueBorder: 'BFDBFE',
  roseAlert: 'E11D48',
  roseLight: 'FFF1F2',
  roseBorder: 'FECDD3',
  emeraldSuccess: '059669',
  emeraldLight: 'ECFDF5',
  amberWarning: 'D97706',
  amberLight: 'FFFBEB',
  slateText: '334155',
  slateMuted: '64748B',
  bgLight: 'F8FAFC',
  white: 'FFFFFF',
}

function addHeader(slide, title, category = 'SAMARA UNIVERSITY — STUDENT VOICE & SAFETY NETWORK') {
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 11.7,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.bluePrimary,
    letterSpacing: 2,
  })

  slide.addText(title, {
    x: 0.8,
    y: 0.65,
    w: 11.7,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.navyDark,
  })

  slide.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 1.3,
    w: 11.7,
    h: 0,
    line: { color: 'CBD5E1', width: 1 },
  })
}

function addFooter(slide, currentSlide, totalSlides = 12) {
  slide.addText(`Samara Student Voices | Confidential & Charter-Protected | Slide ${currentSlide} of ${totalSlides}`, {
    x: 0.8,
    y: 7.0,
    w: 11.7,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Arial',
    color: COLORS.slateMuted,
  })
}

// ==========================================
// SLIDE 1: Title & Hero Slide
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.navyDark }

  // Accent badge
  slide.addText('INSTITUTIONAL GRIEVANCE REDRESSAL & SAFETY NETWORK', {
    x: 1.0,
    y: 1.2,
    w: 11.3,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: '60A5FA',
    letterSpacing: 3,
  })

  // Main Title
  slide.addText('Samara University\nStudent Voices', {
    x: 1.0,
    y: 1.7,
    w: 11.3,
    h: 1.8,
    fontSize: 42,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white,
    lineSpacing: 46,
  })

  // Tagline
  slide.addText('Your Voice. Charter-Protected. Heard.', {
    x: 1.0,
    y: 3.6,
    w: 11.3,
    h: 0.5,
    fontSize: 18,
    fontFace: 'Arial',
    color: '94A3B8',
  })

  // Key Highlights Box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 4.4,
    w: 11.3,
    h: 1.8,
    rectRadius: 0.15,
    fill: { color: COLORS.navyCard },
    line: { color: '334155', width: 1.5 },
  })

  const highlights = [
    { title: '🔒 100% Identity Shield', desc: 'Zero-knowledge anonymous reporting backed by University Peace Charter.' },
    { title: '🌸 Girl Student SOS Hotline', desc: 'Direct 24/7 emergency dispatch and verified female security liaisons.' },
    { title: '⚖️ 4-Role Governance', desc: 'Strict separation of powers between Students, Execs, Admins & Super Admin.' },
  ]

  highlights.forEach((h, idx) => {
    const xPos = 1.3 + idx * 3.7
    slide.addText(h.title, {
      x: xPos,
      y: 4.65,
      w: 3.5,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.white,
    })
    slide.addText(h.desc, {
      x: xPos,
      y: 5.05,
      w: 3.5,
      h: 0.9,
      fontSize: 10,
      fontFace: 'Arial',
      color: '94A3B8',
    })
  })

  slide.addText('Lead Architect: Mohammed Hussen (awash-dev)  •  Partner: Peace Forum & Student Union  •  Samara University', {
    x: 1.0,
    y: 6.8,
    w: 11.3,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: '64748B',
  })
}

// ==========================================
// SLIDE 2: Main Purpose & Problem Statement
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Main Purpose: Overcoming the Campus Fear Barrier')

  // Left Column: The Problem
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.6,
    h: 5.0,
    rectRadius: 0.12,
    fill: { color: COLORS.white },
    line: { color: COLORS.roseBorder, width: 1.5 },
  })

  slide.addText('🔴 The Traditional Campus Pain Points', {
    x: 1.1,
    y: 1.8,
    w: 5.0,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.roseAlert,
  })

  const problems = [
    { label: 'Fear of Retaliation:', text: 'Students remain silent on sexual harassment or extortion due to fear of grade penalties or social stigma.' },
    { label: 'Paper Red Tape:', text: 'Manual paper submissions get lost, buried, or delayed for weeks across bureaucratic offices.' },
    { label: 'Conflict of Interest:', text: 'Complaints handled by peer representatives risk gossip, privacy leaks, and bias.' },
    { label: 'Scattered Emergency Contacts:', text: 'Students lack immediate access to verified, working campus emergency numbers during night crises.' },
  ]

  problems.forEach((p, idx) => {
    slide.addText([
      { text: `• ${p.label} `, options: { bold: true, color: COLORS.navyDark } },
      { text: p.text, options: { color: COLORS.slateText } },
    ], {
      x: 1.1,
      y: 2.35 + idx * 1.0,
      w: 5.0,
      h: 0.9,
      fontSize: 11,
      fontFace: 'Arial',
    })
  })

  // Right Column: The Solution
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.6,
    w: 5.7,
    h: 5.0,
    rectRadius: 0.12,
    fill: { color: COLORS.white },
    line: { color: COLORS.blueBorder, width: 1.5 },
  })

  slide.addText('🔵 The Student Voice Platform Solution', {
    x: 7.1,
    y: 1.8,
    w: 5.1,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.bluePrimary,
  })

  const solutions = [
    { label: 'Charter-Protected Anonymity:', text: 'Submissions strip student identity at the DB level, allowing 100% candid reporting.' },
    { label: 'Real-Time Digital Triage:', text: 'Automated queue management delivers initial case review in under 24 hours.' },
    { label: 'Harassment Isolation Principle:', text: 'Severe harassment is routed exclusively to Super Admin (Dean of Student Affairs), never to peers.' },
    { label: 'Unified Safety Hub:', text: 'Live-managed 24/7 crisis numbers and one-tap emergency calling always visible in header.' },
  ]

  solutions.forEach((s, idx) => {
    slide.addText([
      { text: `✔ ${s.label} `, options: { bold: true, color: COLORS.bluePrimary } },
      { text: s.text, options: { color: COLORS.slateText } },
    ], {
      x: 7.1,
      y: 2.35 + idx * 1.0,
      w: 5.1,
      h: 0.9,
      fontSize: 11,
      fontFace: 'Arial',
    })
  })

  addFooter(slide, 2)
}

// ==========================================
// SLIDE 3: Collaboration & Institutional Support
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Institutional Support & Leadership Collaboration')

  const pillars = [
    {
      role: 'LEAD DEVELOPER & ARCHITECT',
      name: 'Mohammed Hussen (awash-dev)',
      org: 'Independent Lead Software Architect',
      details: [
        'Designed end-to-end cloud database & Next.js full-stack system',
        'Implemented custom zero-knowledge identity stripping proxy',
        'Built full role governance and automated incident dispatching',
        'Portfolio: portfolis.pro.et  |  GitHub: @awash-dev',
      ],
      color: COLORS.bluePrimary,
      fill: COLORS.blueLight,
      border: COLORS.blueBorder,
    },
    {
      role: 'INSTITUTIONAL SUPPORTER & PARTNER',
      name: 'Peace Forum & Student Union',
      org: 'Samara University Student Community',
      details: [
        'Official co-sponsor ensuring campus-wide student representation',
        'Provides student guidance and feedback channel alignment',
        'Ensures alignment with university anti-retaliation charter',
        'Partner Portal: su.greenafricafarm.com',
      ],
      color: COLORS.emeraldSuccess,
      fill: COLORS.emeraldLight,
      border: 'A7F3D0',
    },
    {
      role: 'EXECUTIVE OVERSIGHT & ADOPTION',
      name: 'Dean of Student Affairs & University Leadership',
      org: 'Samara University Administration',
      details: [
        'Super Administrator master clearance over harassment dossiers',
        'Final tribunal authority on severe student welfare violations',
        'Campus emergency hotline management and response mobilization',
        'Guarantor of student peace, justice, and campus security',
      ],
      color: COLORS.amberWarning,
      fill: COLORS.amberLight,
      border: 'FDE68A',
    },
  ]

  pillars.forEach((p, idx) => {
    const xPos = 0.8 + idx * 4.0
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 3.7,
      h: 5.0,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: p.border, width: 1.5 },
    })

    // Header badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.2,
      y: 1.8,
      w: 3.3,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: p.fill },
      line: { color: p.border, width: 1 },
    })

    slide.addText(p.role, {
      x: xPos + 0.2,
      y: 1.85,
      w: 3.3,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: p.color,
      align: 'center',
    })

    slide.addText(p.name, {
      x: xPos + 0.2,
      y: 2.3,
      w: 3.3,
      h: 0.5,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
      align: 'center',
    })

    slide.addText(p.org, {
      x: xPos + 0.2,
      y: 2.8,
      w: 3.3,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.slateMuted,
      align: 'center',
    })

    slide.addShape(pptx.ShapeType.line, {
      x: xPos + 0.3,
      y: 3.2,
      w: 3.1,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    })

    p.details.forEach((d, dIdx) => {
      slide.addText(`• ${d}`, {
        x: xPos + 0.25,
        y: 3.4 + dIdx * 0.75,
        w: 3.2,
        h: 0.7,
        fontSize: 10,
        fontFace: 'Arial',
        color: COLORS.slateText,
      })
    })
  })

  addFooter(slide, 3)
}

// ==========================================
// SLIDE 4: 4-Role Checks-and-Balances Governance Model
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Checks & Balances: The 4-Role Governance Model')

  const roles = [
    {
      num: '1',
      role: 'STUDENTS',
      badge: 'SAFE VOICES',
      color: COLORS.bluePrimary,
      canDo: ['Submit harassment or feedback reports', 'Toggle true anonymous mode', 'Track live timeline (Pending → Resolved)', 'Private threaded chats with reviewers'],
      cannotDo: ['Cannot view other students’ complaints', 'Cannot access admin or executive desks'],
    },
    {
      num: '2',
      role: 'STUDENT EXECUTIVES',
      badge: 'FIRST RESPONSE',
      color: '0284C7',
      canDo: ['Review academic & campus life feedback', 'Update status (Pending, In Review, Resolved)', 'Reply directly to student threads', 'Write collaborative internal council notes'],
      cannotDo: ['STRICTLY BLOCKED from harassment reports', 'Cannot see identity of anonymous students'],
    },
    {
      num: '3',
      role: 'ADMINISTRATORS',
      badge: 'ACCOUNT VERIFY',
      color: '475569',
      canDo: ['Verify registrations against university roster', 'Approve legitimate student/executive accounts', 'Prevent bots, spam, and fake credentials'],
      cannotDo: ['ZERO ACCESS to read student messages', 'Zero access to replies or complaint logs'],
    },
    {
      num: '4',
      role: 'SUPER ADMINISTRATOR',
      badge: 'MASTER AUDIT & DISPATCH',
      color: COLORS.roseAlert,
      canDo: ['Exclusive jurisdiction over harassment cases', 'Download Word (.docx) tribunal case dossiers', 'Live platform emergency contact editing', 'Master privacy audit & user access control'],
      cannotDo: ['Cannot delete immutable audit records', 'Account subject to multi-party audit checks'],
    },
  ]

  roles.forEach((r, idx) => {
    const xPos = 0.8 + idx * 3.0
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 2.8,
      h: 5.0,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: 'CBD5E1', width: 1.2 },
    })

    // Header circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: xPos + 1.15,
      y: 1.8,
      w: 0.5,
      h: 0.5,
      fill: { color: r.color },
      line: { color: r.color, width: 0 },
    })
    slide.addText(r.num, {
      x: xPos + 1.15,
      y: 1.85,
      w: 0.5,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.white,
      align: 'center',
    })

    slide.addText(r.role, {
      x: xPos + 0.1,
      y: 2.35,
      w: 2.6,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
      align: 'center',
    })

    slide.addText(r.badge, {
      x: xPos + 0.1,
      y: 2.65,
      w: 2.6,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: r.color,
      align: 'center',
    })

    slide.addShape(pptx.ShapeType.line, {
      x: xPos + 0.2,
      y: 3.0,
      w: 2.4,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    })

    slide.addText('PERMITTED:', {
      x: xPos + 0.15,
      y: 3.1,
      w: 2.5,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.emeraldSuccess,
    })

    r.canDo.forEach((c, cIdx) => {
      slide.addText(`✔ ${c}`, {
        x: xPos + 0.15,
        y: 3.35 + cIdx * 0.48,
        w: 2.5,
        h: 0.45,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: COLORS.slateText,
      })
    })

    slide.addText('RESTRICTED:', {
      x: xPos + 0.15,
      y: 5.35,
      w: 2.5,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.roseAlert,
    })

    r.cannotDo.forEach((c, cIdx) => {
      slide.addText(`✖ ${c}`, {
        x: xPos + 0.15,
        y: 5.6 + cIdx * 0.45,
        w: 2.5,
        h: 0.45,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: '991B1B',
      })
    })
  })

  addFooter(slide, 4)
}

// ==========================================
// SLIDE 5: Dedicated Reporting Channels
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Three Dedicated, Specialized Reporting Channels')

  const channels = [
    {
      title: '🔴 Anti-Harassment & Anti-Extortion',
      tag: 'ZERO TOLERANCE • SUPER ADMIN ONLY',
      tagColor: COLORS.roseAlert,
      tagBg: COLORS.roseLight,
      desc: 'Confidential reporting for sexual harassment, coercion, stalking, extortion, intimidation, or grading bias.',
      bullets: [
        'Direct routing strictly to Dean / Super Admin workspace',
        'Executive council members have ZERO visibility or access',
        'Full optional anonymity to safeguard academic standing',
        'Exportable Word (.docx) dossier formatted for legal tribunals',
      ],
      border: COLORS.roseBorder,
    },
    {
      title: '🌸 Girl & Women Student Safety SOS',
      tag: 'PRIORITY CRISIS INTERVENTION',
      tagColor: 'BE185D',
      tagBg: 'FDF2F8',
      desc: 'Trauma-informed safety support for female campus residents facing dorm harassment, transit threats, or violence.',
      bullets: [
        'Dedicated 24/7 hotline directly to female security officers',
        'One-tap mobile dialing for instant physical intervention',
        'Rapid campus security dorm dispatch without public disclosure',
        'Integrated medical, psychological, and welfare liaisons',
      ],
      border: 'FBCFE8',
    },
    {
      title: '📘 Academic & Campus Life Feedback',
      tag: 'STUDENT EXECUTIVE TRIAGE',
      tagColor: COLORS.bluePrimary,
      tagBg: COLORS.blueLight,
      desc: 'Open feedback channel for curriculum, dorm facilities, cafeteria nutrition, library, and campus improvements.',
      bullets: [
        'Routed directly to Student Union Executive Council',
        'Lifecycle status tracking: Pending → In Review → Resolved',
        'Internal collaboration notes shared among council reviewers',
        'Direct 2-way messaging for clarifications and updates',
      ],
      border: COLORS.blueBorder,
    },
  ]

  channels.forEach((c, idx) => {
    const xPos = 0.8 + idx * 4.0
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 3.7,
      h: 5.0,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: c.border, width: 1.5 },
    })

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.2,
      y: 1.8,
      w: 3.3,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: c.tagBg },
      line: { color: c.border, width: 1 },
    })

    slide.addText(c.tag, {
      x: xPos + 0.2,
      y: 1.85,
      w: 3.3,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: c.tagColor,
      align: 'center',
    })

    slide.addText(c.title, {
      x: xPos + 0.2,
      y: 2.3,
      w: 3.3,
      h: 0.6,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
    })

    slide.addText(c.desc, {
      x: xPos + 0.2,
      y: 2.95,
      w: 3.3,
      h: 0.8,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.slateMuted,
    })

    slide.addShape(pptx.ShapeType.line, {
      x: xPos + 0.2,
      y: 3.8,
      w: 3.3,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    })

    c.bullets.forEach((b, bIdx) => {
      slide.addText(`• ${b}`, {
        x: xPos + 0.2,
        y: 4.0 + bIdx * 0.68,
        w: 3.3,
        h: 0.65,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: COLORS.slateText,
      })
    })
  })

  addFooter(slide, 5)
}

// ==========================================
// SLIDE 6: How To Use — Step-by-Step for Students
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'How To Use: The Student Journey')

  const steps = [
    {
      step: 'STEP 1',
      title: 'Register & Verify',
      desc: 'Sign up with your verified Samara University student email. Admin verifies your enrollment against campus records.',
      icon: '📝',
    },
    {
      step: 'STEP 2',
      title: 'Choose Channel',
      desc: 'Select Harassment (confidential Dean review) or Feedback (Student Council). Toggle "Submit Anonymously" if needed.',
      icon: '🛡️',
    },
    {
      step: 'STEP 3',
      title: 'Track Live Progress',
      desc: 'Watch your case move from Pending to In Review to Resolved with real-time status indicators and Ably updates.',
      icon: '⏱️',
    },
    {
      step: 'STEP 4',
      title: 'Private Discussion',
      desc: 'Receive direct updates, supply follow-up details, or ask questions inside your secure, two-way threaded chat.',
      icon: '💬',
    },
  ]

  steps.forEach((s, idx) => {
    const xPos = 0.8 + idx * 3.0
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 2.8,
      h: 5.0,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: COLORS.blueBorder, width: 1.2 },
    })

    slide.addText(s.icon, {
      x: xPos,
      y: 2.0,
      w: 2.8,
      h: 0.6,
      fontSize: 28,
      align: 'center',
    })

    slide.addText(s.step, {
      x: xPos,
      y: 2.7,
      w: 2.8,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.bluePrimary,
      align: 'center',
    })

    slide.addText(s.title, {
      x: xPos + 0.15,
      y: 3.1,
      w: 2.5,
      h: 0.6,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
      align: 'center',
    })

    slide.addShape(pptx.ShapeType.line, {
      x: xPos + 0.3,
      y: 3.8,
      w: 2.2,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    })

    slide.addText(s.desc, {
      x: xPos + 0.2,
      y: 4.1,
      w: 2.4,
      h: 2.2,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: COLORS.slateText,
      align: 'center',
      lineSpacing: 16,
    })
  })

  addFooter(slide, 6)
}

// ==========================================
// SLIDE 7: How To Use — Executive & Admin Workflows
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Executive & Admin Workflows: Triage, Privacy & Verification')

  // Top Box: Executive Workflow
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 2.4,
    rectRadius: 0.12,
    fill: { color: COLORS.white },
    line: { color: COLORS.blueBorder, width: 1.2 },
  })

  slide.addText('🛡️ Student Executive Council Workflow (Feedback Triage)', {
    x: 1.1,
    y: 1.8,
    w: 11.0,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.bluePrimary,
  })

  const execWorkflow = [
    { title: '1. Filterable Inbox', desc: 'Real-time counters for Pending, In Review, and Resolved community proposals.' },
    { title: '2. Anonymous Shield', desc: 'Identity of anonymous students is replaced with pseudonyms — impossible to unmask.' },
    { title: '3. Status & Notes', desc: 'Advance issues to In Review; collaborate with council peers via internal notes.' },
    { title: '4. Direct Reply', desc: 'Send official executive resolutions directly back into the student\'s thread.' },
  ]

  execWorkflow.forEach((ew, idx) => {
    const xPos = 1.1 + idx * 2.85
    slide.addText(ew.title, {
      x: xPos,
      y: 2.25,
      w: 2.7,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
    })
    slide.addText(ew.desc, {
      x: xPos,
      y: 2.55,
      w: 2.7,
      h: 1.2,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: COLORS.slateText,
    })
  })

  // Bottom Box: Admin Workflow
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.2,
    w: 11.7,
    h: 2.4,
    rectRadius: 0.12,
    fill: { color: COLORS.white },
    line: { color: 'CBD5E1', width: 1.2 },
  })

  slide.addText('⚖️ University Administrator Workflow (Gatekeeping & Verification)', {
    x: 1.1,
    y: 4.4,
    w: 11.0,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.navyDark,
  })

  const adminWorkflow = [
    { title: '1. Roster Verification', desc: 'Cross-check submitted student and executive emails with university registry.' },
    { title: '2. One-Click Approval', desc: 'Instantly approve genuine students; approve elected council representatives.' },
    { title: '3. Bot & Spam Rejection', desc: 'Purge unauthorized registration attempts to maintain community integrity.' },
    { title: '4. Zero-Message Barrier', desc: 'Architecturally barred from viewing complaints, reports, or discussions.' },
  ]

  adminWorkflow.forEach((aw, idx) => {
    const xPos = 1.1 + idx * 2.85
    slide.addText(aw.title, {
      x: xPos,
      y: 4.85,
      w: 2.7,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
    })
    slide.addText(aw.desc, {
      x: xPos,
      y: 5.15,
      w: 2.7,
      h: 1.2,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: COLORS.slateText,
    })
  })

  addFooter(slide, 7)
}

// ==========================================
// SLIDE 8: Super Administrator Incident Command
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Super Administrator Master Oversight & Incident Command')

  const superFeatures = [
    {
      title: '🏛️ Harassment Incident Command',
      desc: 'Exclusive, private workspace for the Dean of Student Affairs. View complete testimony, timeline, and forensic metadata with zero leakage to peer students or council executives.',
      badge: 'Confidential Jurisdiction',
      color: COLORS.roseAlert,
    },
    {
      title: '📄 Exportable Legal Dossier (.docx)',
      desc: 'Generate rich, formal Microsoft Word case dossiers at the touch of a button. Formatted specifically for university disciplinary committees, police investigations, or legal tribunals.',
      badge: 'Evidence Ready',
      color: COLORS.bluePrimary,
    },
    {
      title: '📞 Live Safety Hotline Dispatcher',
      desc: 'Centrally edit campus emergency contacts and crisis numbers in real time. Changes synchronize instantly across the guest landing page and the global student SOS modal.',
      badge: 'Dynamic Dispatch',
      color: COLORS.emeraldSuccess,
    },
    {
      title: '🔍 Compliance & User Directory',
      desc: 'Master directory of all registered accounts. Inspect consent telemetry, review security check-ins, promote leadership roles, and review tamper-resistant compliance logs.',
      badge: 'Accountability Shield',
      color: COLORS.amberWarning,
    },
  ]

  superFeatures.forEach((sf, idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const xPos = 0.8 + col * 6.0
    const yPos = 1.6 + row * 2.5

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 2.3,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: 'CBD5E1', width: 1.2 },
    })

    slide.addText(sf.badge.toUpperCase(), {
      x: xPos + 0.3,
      y: yPos + 0.25,
      w: 5.0,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: sf.color,
    })

    slide.addText(sf.title, {
      x: xPos + 0.3,
      y: yPos + 0.5,
      w: 5.1,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
    })

    slide.addText(sf.desc, {
      x: xPos + 0.3,
      y: yPos + 0.95,
      w: 5.1,
      h: 1.1,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.slateText,
      lineSpacing: 15,
    })
  })

  addFooter(slide, 8)
}

// ==========================================
// SLIDE 9: Is It Safe? Defensive Privacy & Security
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Is It Safe? Defensive Privacy & Security Architecture')

  const safetyPillars = [
    {
      icon: '🛡️',
      title: 'Database-Level Identity Stripping',
      points: [
        'When "Submit Anonymously" is selected, the database query layer explicitly strips name, email, and user account UUID.',
        'Executives receive ONLY the sanitized text, category, and an anonymous hash.',
        'Impossible for peers to trace back even with technical database inspection.',
      ],
    },
    {
      icon: '🚫',
      title: 'Air-Gapped Harassment Routing',
      points: [
        'Harassment cases are excluded by code (`ne(messages.type, "harassment")`) from executive API endpoints.',
        'Real-time notifications for harassment bypass peer channels completely.',
        'Zero gossip, zero leaks, zero campus peer compromise.',
      ],
    },
    {
      icon: '🔐',
      title: 'Neon Auth Cloud Security',
      points: [
        'Multi-factor and session token management via secure HTTP-only cookies.',
        'Next.js BFF server proxy ensures origin whitelisting and CSRF protection.',
        'Strict password hashing and automated token revocation upon sign-out.',
      ],
    },
    {
      icon: '📜',
      title: 'Charter-Protected Anti-Retaliation',
      points: [
        'Formal backing from Samara University Peace Forum & Student Union.',
        'Zero-retaliation legal policy guarantees student protection against academic penalties.',
        'Immutable audit timestamps prevent records from being altered or erased.',
      ],
    },
  ]

  safetyPillars.forEach((sp, idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const xPos = 0.8 + col * 6.0
    const yPos = 1.6 + row * 2.5

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 2.3,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: COLORS.blueBorder, width: 1.2 },
    })

    slide.addText(`${sp.icon}  ${sp.title}`, {
      x: xPos + 0.3,
      y: yPos + 0.25,
      w: 5.1,
      h: 0.35,
      fontSize: 12.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
    })

    sp.points.forEach((pt, pIdx) => {
      slide.addText(`• ${pt}`, {
        x: xPos + 0.3,
        y: yPos + 0.65 + pIdx * 0.5,
        w: 5.1,
        h: 0.48,
        fontSize: 9,
        fontFace: 'Arial',
        color: COLORS.slateText,
      })
    })
  })

  addFooter(slide, 9)
}

// ==========================================
// SLIDE 10: Technical Architecture
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Modern Full-Stack Technical Architecture')

  const techStack = [
    {
      layer: 'FRONTEND / UX',
      tech: 'Next.js 16 (Turbopack) & React 19',
      details: 'Tailwind CSS v4, Lucide Icons, Framer Motion, and Base-UI accessible components delivering 100% responsive desktop & mobile performance.',
      fill: COLORS.blueLight,
      color: COLORS.bluePrimary,
    },
    {
      layer: 'BACKEND & PROXY',
      layerSub: 'BFF Architecture',
      tech: 'Next.js Proxy & API Route Handlers',
      details: 'Next.js 16 Proxy layer enforcing session authentication, role checks, and resilient Origin proxying to cloud authentication microservices.',
      fill: COLORS.emeraldLight,
      color: COLORS.emeraldSuccess,
    },
    {
      layer: 'DATABASE & ORM',
      tech: 'Neon Serverless PostgreSQL & Drizzle ORM',
      details: 'Serverless PostgreSQL with branchable architecture, type-safe schema definitions, relational joins, and automated schema migrations.',
      fill: COLORS.amberLight,
      color: COLORS.amberWarning,
    },
    {
      layer: 'REAL-TIME & ALERTS',
      tech: 'Ably WebSockets & Nodemailer SMTP',
      details: 'Ably real-time token exchange for instant live status updates and chat; automated Gmail SMTP transactional notifications.',
      fill: COLORS.roseLight,
      color: COLORS.roseAlert,
    },
  ]

  techStack.forEach((ts, idx) => {
    const xPos = 0.8 + idx * 3.0
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 2.8,
      h: 5.0,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: 'CBD5E1', width: 1.2 },
    })

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.15,
      y: 1.8,
      w: 2.5,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: ts.fill },
      line: { color: 'CBD5E1', width: 0.5 },
    })

    slide.addText(ts.layer, {
      x: xPos + 0.15,
      y: 1.85,
      w: 2.5,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: ts.color,
      align: 'center',
    })

    slide.addText(ts.tech, {
      x: xPos + 0.15,
      y: 2.4,
      w: 2.5,
      h: 0.8,
      fontSize: 12.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navyDark,
      align: 'center',
    })

    slide.addShape(pptx.ShapeType.line, {
      x: xPos + 0.3,
      y: 3.3,
      w: 2.2,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    })

    slide.addText(ts.details, {
      x: xPos + 0.2,
      y: 3.6,
      w: 2.4,
      h: 2.7,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.slateText,
      align: 'center',
      lineSpacing: 16,
    })
  })

  addFooter(slide, 10)
}

// ==========================================
// SLIDE 11: Frequently Asked Questions (FAQ)
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bgLight }
  addHeader(slide, 'Frequently Asked Questions & Answers')

  const faqs = [
    {
      q: 'Q1: Can anyone find out my name if I submit an anonymous report?',
      a: 'No. When anonymous mode is toggled, student name, email, and user account UUID are scrubbed at the database query layer. Reviewers receive only a pseudonymous identifier. You can chat back and forth without your identity ever being revealed.',
    },
    {
      q: 'Q2: Who sees my report if I submit sexual harassment or extortion?',
      a: 'Harassment reports bypass student executive council members completely. They are routed directly and exclusively to the Super Administrator (Dean of Student Affairs) workspace to prevent gossip or peer conflicts of interest.',
    },
    {
      q: 'Q3: What if I am in immediate physical danger on campus at night?',
      a: 'Tap the "Girl Safety SOS" or emergency modal in the top header. It connects immediately to 24/7 campus security dispatch and designated female safety officers stationed in the residential dormitories for rapid mobile dispatch.',
    },
    {
      q: 'Q4: How do we know complaints won’t be buried or ignored?',
      a: 'Every submitted report is logged with an immutable cryptographic timestamp. Students track live status updates (Pending → In Review → Resolved). Super Admin oversight prevents any executive from discarding a legitimate grievance.',
    },
  ]

  faqs.forEach((faq, idx) => {
    const yPos = 1.6 + idx * 1.25
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: yPos,
      w: 11.7,
      h: 1.15,
      rectRadius: 0.1,
      fill: { color: COLORS.white },
      line: { color: COLORS.blueBorder, width: 1 },
    })

    slide.addText(faq.q, {
      x: 1.0,
      y: yPos + 0.1,
      w: 11.3,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.bluePrimary,
    })

    slide.addText(faq.a, {
      x: 1.0,
      y: yPos + 0.45,
      w: 11.3,
      h: 0.6,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: COLORS.slateText,
    })
  })

  addFooter(slide, 11)
}

// ==========================================
// SLIDE 12: Summary, Live Links & Next Steps
// ==========================================
{
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.navyDark }

  slide.addText('SAMARA UNIVERSITY — EMPOWERING STUDENT SAFETY & VOICE', {
    x: 1.0,
    y: 1.0,
    w: 11.3,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: '60A5FA',
    letterSpacing: 2,
  })

  slide.addText('Summary & Live Platform Access', {
    x: 1.0,
    y: 1.35,
    w: 11.3,
    h: 0.7,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white,
  })

  // 3 Summary Metric Cards
  const summaryCards = [
    { title: '100% Identity Shield', desc: 'Zero-retaliation peace charter protecting every student voice.' },
    { title: '< 24h Turnaround', desc: 'Fast digital review queue replacing weeks of paper delays.' },
    { title: '4-Role Governance', desc: 'Strict checks and balances preventing power abuse or leaks.' },
  ]

  summaryCards.forEach((sc, idx) => {
    const xPos = 1.0 + idx * 3.85
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 2.3,
      w: 3.6,
      h: 1.5,
      rectRadius: 0.12,
      fill: { color: COLORS.navyCard },
      line: { color: '334155', width: 1 },
    })

    slide.addText(sc.title, {
      x: xPos + 0.2,
      y: 2.5,
      w: 3.2,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: '60A5FA',
    })

    slide.addText(sc.desc, {
      x: xPos + 0.2,
      y: 2.95,
      w: 3.2,
      h: 0.7,
      fontSize: 10,
      fontFace: 'Arial',
      color: '94A3B8',
    })
  })

  // Links & Institutional Endorsement
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 4.1,
    w: 11.3,
    h: 2.2,
    rectRadius: 0.12,
    fill: { color: COLORS.navyCard },
    line: { color: '334155', width: 1 },
  })

  slide.addText('Official Deployment & Project Resources', {
    x: 1.3,
    y: 4.3,
    w: 10.7,
    h: 0.35,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white,
  })

  const links = [
    { label: 'Live Platform URL:', url: 'https://samara-student-voices.vercel.app' },
    { label: 'Institutional Partner:', url: 'https://su.greenafricafarm.com (Peace Forum & Student Union)' },
    { label: 'Source Code Repository:', url: 'https://github.com/awash-dev/samara-student-voices' },
    { label: 'Lead Software Architect:', url: 'Mohammed Hussen (awash-dev) — portfolis.pro.et' },
  ]

  links.forEach((l, idx) => {
    slide.addText([
      { text: `${l.label} `, options: { bold: true, color: '60A5FA' } },
      { text: l.url, options: { color: COLORS.white } },
    ], {
      x: 1.3,
      y: 4.75 + idx * 0.36,
      w: 10.7,
      h: 0.35,
      fontSize: 10.5,
      fontFace: 'Arial',
    })
  })

  slide.addText('Thank you! Open for Questions & Demonstrations.', {
    x: 1.0,
    y: 6.7,
    w: 11.3,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: '60A5FA',
    align: 'center',
  })
}

// Generate the presentation file
const outputPath = path.resolve(process.cwd(), 'Samara_Student_Voices_Presentation.pptx')
await pptx.writeFile({ fileName: outputPath })
console.log(`Presentation successfully created at: ${outputPath}`)
