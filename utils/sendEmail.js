// utils/emailUtil.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // load env for email/pass

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config for production
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, content) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: "OTP Verification - Your Site",
    html: content,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
