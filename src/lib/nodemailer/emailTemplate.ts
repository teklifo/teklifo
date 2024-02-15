import fs from "fs";
import path from "path";
import { EmailType, EmailContextType } from "@/types";

export default async function emailTemplate(
  emailType: EmailType,
  context: EmailContextType,
  locale: string
) {
  let localeFolder = "en";
  if (locale.toLocaleLowerCase().startsWith("ru")) localeFolder = "ru";

  const filePath = path.join(
    process.cwd(),
    `src/lib/nodemailer/emails/${localeFolder}/${emailType}.html`
  );

  let html = (await fs.promises.readFile(filePath, "utf-8")).toString();

  Object.keys(context).forEach((key) => {
    html = html.replaceAll(`{{${key}}}`, context[key]);
  });

  return {
    text: "",
    html,
  };
}
