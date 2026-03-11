import Link from "next/link";

const navItems = [
  { href: "/ranges", label: "Directory" },
  { href: "/map", label: "Map" },
  { href: "/near-me", label: "Near Me" },
  { href: "/submit", label: "Submit Range" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner animate-in">
        <Link href="/" className="site-logo">
          BestDrivingRanges
        </Link>
        <nav className="site-nav" aria-label="Main">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="/admin/submissions" className="site-nav-link" style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
