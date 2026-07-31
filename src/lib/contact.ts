/**
 * Contact form email delivery.
 *
 * Submissions are forwarded to the site owner via Resend (https://resend.com).
 * Configure with environment variables:
 *   RESEND_API_KEY     — API key from your Resend account (required to send)
 *   CONTACT_TO_EMAIL   — inbox that receives messages (default info@mitchelturner.dev)
 *   CONTACT_FROM_EMAIL — verified sender, e.g. "Mitchel Turner <contact@mitchelturner.dev>"
 *
 * The sender domain must be verified in Resend for delivery. When no API key is
 * configured the API route reports this so the UI can fall back to a mailto link.
 */
import { Resend } from "resend";

export const CONTACT_EMAIL =
  process.env.CONTACT_TO_EMAIL?.trim() || "info@mitchelturner.dev";

const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL?.trim() ||
  "Mitchel Turner <contact@mitchelturner.dev>";

export function isContactConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "send_failed" };

export async function sendContactEmail(
  msg: ContactMessage,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: "not_configured" };

  const resend = new Resend(apiKey);
  const sourceMatch = msg.message.match(/^Source:\s*(.+)$/m);
  const subject = sourceMatch
    ? `Landing lead (${sourceMatch[1].trim()}) from ${msg.name}`
    : `Portfolio contact from ${msg.name}`;
  const text = [
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    "",
    msg.message,
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: msg.email,
      subject,
      text,
    });
    if (error) {
      console.error("Resend send error:", error);
      return { ok: false, reason: "send_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Contact email failed:", err);
    return { ok: false, reason: "send_failed" };
  }
}
