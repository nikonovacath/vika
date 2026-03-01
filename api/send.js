function normalizeBody(reqBody) {
  if (!reqBody) return {};
  if (typeof reqBody === "string") {
    try {
      return JSON.parse(reqBody);
    } catch {
      return {};
    }
  }
  if (typeof reqBody === "object") return reqBody;
  return {};
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "Missing BOT_TOKEN or CHAT_ID in environment",
    });
  }

  const body = normalizeBody(req.body);
  const name = String(body.name || "").trim();
  const contact = String(body.contact || "").trim();
  const contactMethod = String(body.contactMethod || "").trim();

  if (!name || !contact) {
    return res.status(400).json({
      ok: false,
      error: "Fields 'name' and 'contact' are required",
    });
  }

  const messageLines = [
    "Новая заявка с сайта",
    "",
    `Имя: ${escapeHtml(name)}`,
    `Контакт: ${escapeHtml(contact)}`,
    `Способ связи: ${escapeHtml(contactMethod || "не указан")}`,
  ];

  const text = messageLines.join("\n");
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    const tgResult = await tgResponse.json().catch(() => ({}));

    if (!tgResponse.ok || tgResult.ok === false) {
      return res.status(502).json({
        ok: false,
        error: "Telegram API request failed",
        details: tgResult,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to send message",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

module.exports = handler;
