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

export async function sendEmailWithFetch(params: EmailParametersType) {
  const { emailType, locale, subject, receivers, context } = params;
  const { text, html } = await emailTemplate(emailType, context, locale);

  const domain = "teklifo.com";

  const url = `https://api.eu.mailgun.net/v3/${domain}/messages`;

  const formData = new URLSearchParams();
  formData.append("from", process.env.EMAIL_FROM ?? "");
  formData.append("to[0]", receivers);
  formData.append("subject", subject);
  formData.append("text", text);
  formData.append("html", html);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.EMAIL_SERVER_API_USER}:${process.env.EMAIL_SERVER_API_KEY}`
        ).toString("base64"),
    },
    body: formData,
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Email error: ${responseText}`);
  }
}
