const { Resend } = require("resend");

const sendMail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ShopNest <onboarding@resend.dev>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  });
};

module.exports = sendMail;
