// utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,       // SSL port
  secure: true,    // Use true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter failed to connect:', error);
  } else {
    console.log('✅ Email transporter is ready to send messages');
  }
});

const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <b>${code}</b></p>`
  };

  console.log(`📤 Attempting to send email to ${to} with code: ${code}`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

export default sendVerificationEmail;