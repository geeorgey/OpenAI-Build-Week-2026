interface EmailSendResult {
  messageId: string;
}

interface SendEmail {
  send(message: {
    to: string | Array<string>;
    from: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
    headers?: Record<string, string>;
  }): Promise<EmailSendResult>;
}

interface Env {
  EMAIL: SendEmail;
  WORKER_SHARED_SECRET: string;
  APP_BASE_URL: string;
  APP_NAME: string;
}

type MagicLinkPayload = {
  type: "magic_link";
  to: string;
  magicLink: string;
};

type CampaignPayload = {
  type: "campaign";
  recipients: Array<{ email: string; displayName?: string }>;
  subject: string;
  body: string;
};

const FROM = "newEraPresentation@lvnsk.jp";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }
    if (!env.WORKER_SHARED_SECRET || request.headers.get("x-new-era-secret") !== env.WORKER_SHARED_SECRET) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const payload = await request.json<MagicLinkPayload | CampaignPayload>();
    if (payload.type === "magic_link") {
      if (!isEmail(payload.to) || !payload.magicLink.startsWith("https://")) {
        return json({ ok: false, error: "Invalid magic link payload" }, 400);
      }
      const result = await env.EMAIL.send({
        to: payload.to,
        from: FROM,
        replyTo: FROM,
        subject: "New Era Presentation — メール認証",
        text: `以下のリンクから15分以内に認証してください。\n\n${payload.magicLink}\n\nこのメールに心当たりがない場合は無視してください。`,
        html: magicLinkHtml(payload.magicLink),
      });
      return json({ ok: true, messageId: result.messageId });
    }

    if (payload.type === "campaign") {
      const recipients = payload.recipients.filter((recipient) => isEmail(recipient.email)).slice(0, 50);
      if (!payload.subject.trim() || !payload.body.trim()) {
        return json({ ok: false, error: "Subject and body are required" }, 400);
      }
      const sent: string[] = [];
      for (const recipient of recipients) {
        const unsubscribeToken = await sign(recipient.email.toLowerCase(), env.WORKER_SHARED_SECRET);
        const unsubscribeUrl = `${env.APP_BASE_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}&token=${unsubscribeToken}`;
        const result = await env.EMAIL.send({
          to: recipient.email,
          from: FROM,
          replyTo: FROM,
          subject: payload.subject,
          text: `${payload.body}\n\n配信停止: ${unsubscribeUrl}`,
          html: campaignHtml(recipient.displayName, payload.body, unsubscribeUrl),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        sent.push(result.messageId);
      }
      return json({ ok: true, sent: sent.length, messageIds: sent });
    }

    return json({ ok: false, error: "Unknown email type" }, 400);
  },
} satisfies ExportedHandler<Env>;

function magicLinkHtml(link: string) {
  return emailFrame(`
    <p style="font:700 11px/1.4 monospace;letter-spacing:.12em;color:#6f716a">EMAIL VERIFICATION</p>
    <h1 style="font:700 34px/1.05 Arial,sans-serif;letter-spacing:-.05em;color:#17191d">プレゼンの記憶を、<br>あなたのものに。</h1>
    <p style="font:14px/1.7 Arial,sans-serif;color:#676862">下のボタンから15分以内にメール認証を完了してください。</p>
    <p style="margin:28px 0"><a href="${escapeHtml(link)}" style="display:inline-block;padding:15px 20px;background:#17191d;color:white;text-decoration:none;font:700 12px Arial,sans-serif">認証してマイページへ →</a></p>
    <p style="font:11px/1.6 Arial,sans-serif;color:#8b8c84">このメールに心当たりがない場合は、そのまま破棄してください。</p>
  `);
}

function campaignHtml(name: string | undefined, body: string, unsubscribeUrl: string) {
  return emailFrame(`
    <p style="font:700 11px/1.4 monospace;letter-spacing:.12em;color:#6f716a">NEW ERA PRESENTATION / FOLLOW-UP</p>
    <h1 style="font:700 34px/1.05 Arial,sans-serif;letter-spacing:-.05em;color:#17191d">${escapeHtml(name || "ご参加者")}さん、<br>対話の続きを。</h1>
    <div style="font:14px/1.8 Arial,sans-serif;color:#4f504b;white-space:pre-wrap">${escapeHtml(body)}</div>
    <hr style="margin:34px 0;border:0;border-top:1px solid #d4d1ca">
    <p style="font:10px/1.6 Arial,sans-serif;color:#8b8c84">このメールは、プレゼン参加時に配信へ同意した方へお送りしています。<a href="${escapeHtml(unsubscribeUrl)}" style="color:#5c5d57">配信停止</a></p>
  `);
}

function emailFrame(content: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#ece9e1"><div style="max-width:640px;margin:0 auto;padding:44px 28px;background:#f8f6f0">${content}<p style="margin-top:42px;font:700 9px/1.5 monospace;letter-spacing:.12em;color:#8b8c84">NEW ERA PRESENTATION<br>Sent from ${FROM}</p></div></body></html>`;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
