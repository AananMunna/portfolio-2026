import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = ["Full-time role", "Freelance project", "Collaboration", "Something else"];

// naive in-memory limiter: 5 messages / 10 min per IP (per server instance)
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const MAX = 5;

const FALLBACK_EMAIL = "aananmunna420@gmail.com";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // honeypot: real people never fill this field
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const subject = String(body.subject ?? "").replace(/[\r\n]+/g, " ").trim();
  const type = String(body.type ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 100)
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200)
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  if (subject.length < 3 || subject.length > 150)
    return NextResponse.json({ ok: false, error: "Please add a short subject." }, { status: 400 });
  if (message.length < 10 || message.length > 5000)
    return NextResponse.json({ ok: false, error: "Message should be 10 to 5000 characters." }, { status: 400 });
  const kind = TYPES.includes(type) ? type : "Something else";

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX)
    return NextResponse.json({ ok: false, error: "Too many messages. Please try again later." }, { status: 429 });
  recent.push(now);
  hits.set(ip, recent);

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO || user;
  if (!user || !pass || !to) {
    console.error("[contact] GMAIL_USER / GMAIL_APP_PASSWORD are not set");
    return NextResponse.json(
      { ok: false, error: `Email service is not configured yet. Please email me at ${FALLBACK_EMAIL}.` },
      { status: 500 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      // fail fast instead of hanging a serverless function
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    await transporter.sendMail({
      from: `"Portfolio contact" <${user}>`,
      to,
      replyTo: `"${name.replace(/"/g, "")}" <${email}>`, // hit Reply in Gmail and it goes to the visitor
      subject: `[${kind}] ${subject}`,
      text: `${message}\n\n— ${name} <${email}>\nType: ${kind}`,
      html: `
        <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto;color:#1d1d1f">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#047857;margin:0 0 8px">New message · ${esc(kind)}</p>
          <h2 style="margin:0 0 16px;font-size:20px">${esc(subject)}</h2>
          <div style="white-space:pre-wrap;line-height:1.65;font-size:15px;padding:16px;border:1px solid #e4e4e9;border-radius:12px;background:#fafafa">${esc(message)}</div>
          <p style="margin:18px 0 0;font-size:14px"><strong>${esc(name)}</strong><br/><a href="mailto:${esc(email)}">${esc(email)}</a></p>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    return NextResponse.json(
      { ok: false, error: `Could not send your message. Please email me at ${FALLBACK_EMAIL}.` },
      { status: 502 },
    );
  }
}
