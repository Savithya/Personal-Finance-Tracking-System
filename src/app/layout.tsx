import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FINORA – Personal Finance Management System (LKR)",
  description:
    "Comprehensive Sri Lankan Rupee personal finance tracking system with multi-device responsive design and dark/light themes.",
  keywords: ["personal finance", "Sri Lanka", "LKR", "budget tracker", "expense tracker"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070B14" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('finora_theme');
                  var isDark = true;
                  if (saved === 'light') {
                    isDark = false;
                  } else if (saved === 'system') {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  } else if (saved === 'dark') {
                    isDark = true;
                  } else {
                    isDark = true;
                  }
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-emerald-500 selection:text-white min-h-screen">
        <ThemeProvider>
          <FinanceProvider>
            <AppShell>{children}</AppShell>
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
