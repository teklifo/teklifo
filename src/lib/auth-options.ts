import { cookies } from "next/headers";
import { NextAuthOptions } from "next-auth";
import EmailProvider, {
  SendVerificationRequestParams,
} from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import sendEmail from "@/lib/nodemailer/sendEmail";
import { getCredentialsSchema } from "@/lib/schemas";

const getEmailSubject = (locale: string) => {
  switch (locale) {
    case "ru":
      return "Авторизация на Teklifo";
    case "en":
    default:
      return "Authorization | Teklifo";
  }
};

const sendVerificationRequest = async ({
  identifier,
  url,
}: SendVerificationRequestParams) => {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";

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

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as unknown as PrismaClient),
  providers: [
    EmailProvider({
      sendVerificationRequest,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials, req) {
        const st = () => "";
        const test = getCredentialsSchema(st).safeParse(credentials);
        if (!test.success) {
          return null;
        }

        const { email, password } = test.data;

        const user = await db.user.findUnique({
          where: {
            email,
          },
        });
        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
