const nodemailer = require("nodemailer");

// Nodemailer
const sendEmail = async (mailOptions) => {
  // 1- Create transporter (service that will send email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false? port = 587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2- Define email options
  const mailOpts = {
    from: `E-Shop App <${process.env.EMAIL_USER}>`,
    to: mailOptions.email,
    subject: mailOptions.subject,
    text: mailOptions.message,
    html: mailOptions.html,
  };

  // 3- send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
