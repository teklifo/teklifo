import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "./globals.css";

type RootLayoutProps = {
  params: { locale: string };
  children: React.ReactNode;
};

const inter = Inter({ subsets: ["latin"] });

const locales = ["en", "ru"];

export default function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  if (!locales.includes(locale as any)) notFound();

  const messages = useMessages();

  return (
    <html lang={locale} className="h-full">
      <body
        className={cn("relative h-full font-sans antialiased", inter.className)}
      >
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
      </body>
    </html>
  );
}
