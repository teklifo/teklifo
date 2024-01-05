import nodemailer from "nodemailer";
import emailTemplate from "@/lib/nodemailer/emailTemplate";
import { EmailType, EmailContextType } from "@/types";

interface EmailParametersType {
  locale: string;
  emailType: EmailType;
  subject: string;
  receivers: string;
  context: EmailContextType;
}

export default async function sendEmail(params: EmailParametersType) {
  const { emailType, locale, subject, receivers, context } = params;
  const { text, html } = await emailTemplate(emailType, context, locale);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: receivers,
    subject,
    text,
    html,
  });
}
