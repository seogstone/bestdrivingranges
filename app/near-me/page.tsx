import { NearMeSearch } from "@/components/near-me-search";

export const metadata = {
  title: "Driving range near me",
  description:
    "Use your location to find nearby driving ranges and indoor golf simulators.",
};

export default function NearMePage() {
  return (
    <section className="stack-lg animate-in">
      <header className="hero" style={{ padding: "3rem 1.5rem" }}>
        <h1>Near Me</h1>
        <p className="text-muted">Find the closest golf practice facilities with browser geolocation.</p>
      </header>
      <NearMeSearch />
    </section>
  );
}
