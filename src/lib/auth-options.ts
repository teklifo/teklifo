import { cookies } from "next/headers";
import { NextAuthOptions } from "next-auth";
import EmailProvider, {
  SendVerificationRequestParams,
} from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getTranslations } from "next-intl/server";
import queryString from "query-string";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { sendEmailWithFetch } from "@/lib/nodemailer/sendEmail";
import { getCredentialsSchema } from "@/lib/schemas";

const sendVerificationRequest = async ({
  identifier,
  url,
}: SendVerificationRequestParams) => {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";

  const urlObject = queryString.parseUrl(url);

  const callbackUrl = urlObject.query.callbackUrl?.toString();
  const isInvintation = callbackUrl?.includes("/invitation/");

  const t = await getTranslations({ locale, namespace: "Emails" });

  if (isInvintation && callbackUrl) {
    const splittedUrl = callbackUrl.split("/");
    const invitationId = splittedUrl[splittedUrl?.length - 1];

    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
      },
      select: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) return;

    await sendEmailWithFetch({
      locale,
      emailType: "invitation",
      receivers: identifier,
      subject: t("invitationEmailTitle", {
        companyName: invitation.company.name,
      }),
      context: {
        companyId: invitation.company.id,
        companyName: invitation.company.name,
        url,
      },
    });
  } else {
    await sendEmailWithFetch({
      locale,
      emailType: "email-verification",
      receivers: identifier,
      subject: t("authEmailTitle"),
      context: {
        url,
      },
    });
  }
};

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as unknown as PrismaClient),
  providers: [
    EmailProvider({
      sendVerificationRequest,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
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
