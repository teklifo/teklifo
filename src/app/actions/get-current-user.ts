import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

    return await db.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
  } catch (error: any) {
    return null;
  }
}
