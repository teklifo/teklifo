import NextAuth, { AuthOptions } from "next-auth";
import EmailProvider, {
  SendVerificationRequestParams,
} from "next-auth/providers/email";
import { cookies } from "next/headers";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import db from "@/lib/db";
import sendEmail from "@/nodemailer/sendEmail";

const getEmailSubject = (locale: string) => {
  switch (locale) {
    case "ru":
      return "Авторизация на Kraft";
    case "az":
    default:
      return "Avtorizasiya | Kraft";
  }
};

const sendVerificationRequest = async ({
  identifier,
  url,
}: SendVerificationRequestParams) => {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "az";

  await sendEmail({
    locale,
    emailType: "email-verification",
    receivers: identifier,
    subject: getEmailSubject(locale),
    context: {
      url,
    },
  });
};

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-email",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
