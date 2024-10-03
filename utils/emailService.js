// utils/emailService.js
import nodemailer from "nodemailer";

// Configure the transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Function to send email
export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAILUSER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
};
