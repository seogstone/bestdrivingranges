import { SubmitRangeForm } from "@/components/submit-range-form";

export const metadata = {
  title: "Submit a driving range",
  description: "Submit missing golf ranges for moderation and publishing.",
};

export default function SubmitPage() {
  return (
    <section className="stack-lg animate-in">
      <header className="hero" style={{ padding: "3rem 1.5rem" }}>
        <h1>Submit a Range</h1>
        <p className="text-muted">Help expand the UK directory by submitting missing facilities.</p>
      </header>
      <div className="animate-in" style={{ animationDelay: "0.1s" }}>
        <SubmitRangeForm />
      </div>
    </section>
  );
}
