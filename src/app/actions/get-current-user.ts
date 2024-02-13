import { getServerSession } from "next-auth/next";

import authOptions from "@/lib/auth-options";
import db from "@/lib/db";

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (user) {
      user.password = null;
    }

    return user;
  } catch (error: any) {
    return null;
  }
}
