import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMIPredict AI — Intelligent Financial Risk Assessment Platform",
  description:
    "Precision credit risk classification and maximum safe installment quantification powered by production gradient boosted ML models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text-primary antialiased selection:bg-accent-subtle selection:text-accent">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Navbar />
          <main className="pt-14 min-h-[calc(100vh-140px)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
