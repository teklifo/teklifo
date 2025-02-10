import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getServerSession } from "next-auth/next";
import { ThemeProvider } from "@/components/theme-provider";
import NextAuthProvider from "@/components/next-auth-provider";
import { Toaster } from "@/components/ui/toaster";
import authOptions from "@/lib/auth-options";
import { locales } from "@/navigation";
import { cn } from "@/lib/utils";
import "./globals.css";

type RootLayoutProps = {
  params: { locale: string };
  children: React.ReactNode;
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  if (!locales.includes(locale as any)) notFound();

  const messages = await getMessages();

  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} className="h-full">
      <body
        className={cn("relative h-full font-sans antialiased", inter.className)}
      >
        <NextAuthProvider session={session}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main className="relative flex flex-col min-h-screen">
                <div className="flex-grow flex-1">{children}</div>
              </main>
            </ThemeProvider>
            <Toaster />
          </NextIntlClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
