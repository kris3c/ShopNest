// Backend/utils/sendMail.js
// Sends transactional email via Brevo's HTTPS API (port 443),
// which works on Render's free tier (SMTP ports are blocked there).

const sendMail = async (options) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "ShopNest",
        email: process.env.MAIL_FROM, // must EXACTLY match your verified Brevo sender
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.message,
    }),
  });

  // Brevo returns 201 on success. Throw on anything else so the
  // controller's try/catch can handle it (and not falsely report success).
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Email send failed (${res.status}): ${detail}`);
  }

  return res.json().catch(() => ({}));
};

module.exports = sendMail;
