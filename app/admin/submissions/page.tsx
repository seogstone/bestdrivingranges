import { SubmissionsAdmin } from "@/components/admin/submissions-admin";

export const metadata = {
  title: "Submission moderation",
  description: "Admin moderation queue for pending directory submissions.",
};

export default function AdminSubmissionsPage() {
  return (
    <section className="stack-md">
      <header>
        <h1>Moderation Queue</h1>
        <p className="text-muted">Approve or reject pending submissions as an admin/editor user.</p>
      </header>
      <SubmissionsAdmin />
    </section>
  );
}
