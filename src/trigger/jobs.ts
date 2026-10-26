/**
 * Trigger.dev Jobs
 *
 * These jobs handle email queue processing for the Student Voice Platform.
 * They are triggered via internal API calls from route handlers.
 *
 * To use with Trigger.dev v3 SDK, configure your project at https://trigger.dev
 * and set TRIGGER_SECRET_KEY in your environment.
 *
 * For now, email sending is handled directly via the /api/trigger/* routes
 * which use Nodemailer + Brevo SMTP with batching.
 */

// Job 1: send-new-message-alert
// Triggered: POST /api/trigger/new-message
// Action: Fetches all executive emails, sends batch notification

// Job 2: send-reply-notification
// Triggered: POST /api/trigger/reply-notification
// Action: Sends email to student when executive replies

// Job 3: send-bulk-announcement
// Triggered: POST /api/trigger/bulk-announcement (admin only)
// Action: Sends announcement to all 10K approved students in batches of 100

export const TRIGGER_JOBS = {
  NEW_MESSAGE_ALERT: 'send-new-message-alert',
  REPLY_NOTIFICATION: 'send-reply-notification',
  BULK_ANNOUNCEMENT: 'send-bulk-announcement',
} as const
