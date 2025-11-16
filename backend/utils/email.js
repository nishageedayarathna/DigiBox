// utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or any SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (to, causeTitle, approved) => {
  const status = approved ? "approved" : "rejected";
  const subject = `Your Cause "${causeTitle}" has been ${status}`;
  const text = `Hello,\n\nYour cause "${causeTitle}" has been ${status} by the admin. Please visit the website to see details.\n\nThank you.`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = sendApprovalEmail;
