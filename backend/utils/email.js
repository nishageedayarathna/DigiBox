const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add debug options
      debug: true,
      logger: true
    });

    // Verify connection
    await transporter.verify();
    console.log("✅ Email transporter verified successfully");

    const mailOptions = {
      from: `"DigiBox Donation Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    console.log("📧 Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!html
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
    console.log(`📧 Response:`, result);

    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};

module.exports = sendEmail;
