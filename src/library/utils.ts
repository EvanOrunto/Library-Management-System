import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'LibraTech.notification@gmail.com',
    pass: 'vlwb xsyb rpxz ixnw',
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: 'LibraTech.notification@gmail.com',
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};
