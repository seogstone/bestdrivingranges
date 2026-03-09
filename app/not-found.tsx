import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="card stack-sm">
      <h1>Page not found</h1>
      <p className="text-muted">The listing or page you requested does not exist.</p>
      <Link href="/">Return home</Link>
    </section>
  );
}
