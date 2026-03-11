import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
    <html lang="en-GB" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <SiteHeader />
        <main className="container main-content">{children}</main>
        
        <footer style={{ borderTop: "1px solid var(--border)", padding: "4rem 0 2rem", marginTop: "auto", background: "var(--surface)" }}>
          <div className="container">
            <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
              <div>
                <h4 style={{ marginBottom: "1rem", color: "var(--brand)" }}>BestDrivingRanges</h4>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>The UK's most comprehensive directory of golf driving ranges. Find the perfect practice facility near you.</p>
              </div>
              <div>
                <h4 style={{ marginBottom: "1rem" }}>Quick Links</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                  <li><Link href="/ranges" className="text-muted" style={{ fontSize: "0.9rem" }}>All Driving Ranges</Link></li>
                  <li><Link href="/uk" className="text-muted" style={{ fontSize: "0.9rem" }}>UK Directory</Link></li>
                  <li><Link href="/simulators" className="text-muted" style={{ fontSize: "0.9rem" }}>Indoor Simulators</Link></li>
                  <li><Link href="/near-me" className="text-muted" style={{ fontSize: "0.9rem" }}>Near Me Map</Link></li>
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: "1rem" }}>Legal</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                  <li><span className="text-muted" style={{ fontSize: "0.9rem", cursor: "pointer" }}>Privacy Policy</span></li>
                  <li><span className="text-muted" style={{ fontSize: "0.9rem", cursor: "pointer" }}>Terms of Service</span></li>
                </ul>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              &copy; {new Date().getFullYear()} BestDrivingRanges. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
