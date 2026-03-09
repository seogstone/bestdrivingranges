import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.nextPublicSiteUrl),
  title: {
    default: "BestDrivingRanges | UK Driving Range Directory",
    template: "%s | BestDrivingRanges",
  },
  description:
    "Find golf driving ranges and indoor golf simulators across the UK. Filter by city, facility type, price, and features.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        <SiteHeader />
        <main className="container main-content">{children}</main>
      </body>
    </html>
  );
}
