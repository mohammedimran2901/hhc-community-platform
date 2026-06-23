import type { Metadata } from "next";
import "./globals.css";
import FirstVisitHelp from "@/components/layout/FirstVisitHelp";

export const metadata: Metadata = {
  title: "HHC Clinical Costing Community",
  description: "A platform for clinical costing professionals across Saudi Arabia's 20 health clusters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen">
        {children}
        <FirstVisitHelp />
      </body>
    </html>
  );
}
