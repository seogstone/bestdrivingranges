import Link from "next/link";

const navItems = [
  { href: "/ranges", label: "Directory" },
  { href: "/map", label: "Map" },
  { href: "/near-me", label: "Near Me" },
  { href: "/submit", label: "Submit Range" },
  { href: "/admin/submissions", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo">
          BestDrivingRanges
        </Link>
        <nav className="site-nav" aria-label="Main">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
