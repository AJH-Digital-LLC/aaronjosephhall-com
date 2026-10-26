import type { APIRoute } from "astro";
import { escapeHtml, isHoneypotFilled, sendNotificationEmail } from "@/lib/email";

// This is one of two dynamic routes on an otherwise fully static site (see
// `output: "server"` + `export const prerender = true` on every page in
// astro.config.mjs / each page file).
export const prerender = false;

const REQUIRED_FIELDS = ["name", "email", "reason", "message"] as const;

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid request body." }), { status: 400 });
  }

  if (isHoneypotFilled(data)) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || String(data[field]).trim() === "") {
      return new Response(JSON.stringify({ ok: false, error: `Missing required field: ${field}` }), {
        status: 400,
      });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — cannot send contact email.");
    return new Response(JSON.stringify({ ok: false, error: "Email delivery is not configured yet." }), {
      status: 500,
    });
  }

  const name = String(data.name).trim();
  const email = String(data.email).trim();
  const reason = String(data.reason).trim();
  const message = String(data.message).trim();

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Reason", reason],
  ];

  const html = `
    <h2>New contact message</h2>
    <table cellpadding="4" cellspacing="0">
      ${rows.map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}
    </table>
    <p><strong>Message</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    message,
  ].join("\n");

  const result = await sendNotificationEmail({
    apiKey,
    replyTo: email,
    subject: `New contact message from ${name}`,
    html,
    text,
  });

  if (!result.ok) {
    return new Response(JSON.stringify({ ok: false, error: result.error }), { status: result.status ?? 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
