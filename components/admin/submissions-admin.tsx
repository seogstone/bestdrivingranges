"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { SubmissionRecord, SubmissionStatus } from "@/types/range";

interface AdminState {
  loading: boolean;
  error: string | null;
  submissions: SubmissionRecord[];
  status: SubmissionStatus;
}

async function getAccessToken(): Promise<string | null> {
  const client = getBrowserClient();
  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  return session?.access_token ?? null;
}

export function SubmissionsAdmin() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<AdminState>({
    loading: false,
    error: null,
    submissions: [],
    status: "pending",
  });

  const isConfigured = useMemo(() => Boolean(getBrowserClient()), []);

  async function refresh(status = state.status) {
    const token = await getAccessToken();
    if (!token) {
      setState((current) => ({
        ...current,
        loading: false,
        submissions: [],
        error: "Sign in first with an admin/editor account.",
      }));
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null, status }));

    const response = await fetch(`/api/admin/submissions?status=${status}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Request failed" }))) as {
        error?: string;
      };

      setState((current) => ({
        ...current,
        loading: false,
        error: payload.error ?? "Request failed",
      }));
      return;
    }

    const payload = (await response.json()) as { submissions: SubmissionRecord[] };
    setState((current) => ({
      ...current,
      loading: false,
      submissions: payload.submissions ?? [],
      status,
      error: null,
    }));
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const client = getBrowserClient();
    if (!client) {
      setState((current) => ({ ...current, error: "Supabase browser client is not configured." }));
      return;
    }

    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/submissions`,
      },
    });

    if (error) {
      setState((current) => ({ ...current, error: error.message }));
      return;
    }

    setState((current) => ({
      ...current,
      error: "Magic link sent. Open it, then refresh this page.",
    }));
  }

  async function moderate(submissionId: string, action: "approve" | "reject") {
    const token = await getAccessToken();
    if (!token) {
      setState((current) => ({ ...current, error: "Session expired. Sign in again." }));
      return;
    }

    const response = await fetch(`/api/admin/submissions/${submissionId}/${action}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Action failed" }))) as {
        error?: string;
      };
      setState((current) => ({ ...current, error: payload.error ?? "Action failed" }));
      return;
    }

    await refresh(state.status);
  }

  useEffect(() => {
    void refresh("pending");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isConfigured) {
    return (
      <div className="card">
        Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable admin auth.
      </div>
    );
  }

  return (
    <section className="stack-md">
      <form className="card stack-sm" onSubmit={signIn}>
        <h2>Admin Sign-in</h2>
        <p className="text-muted">Use your Supabase-authenticated admin/editor email.</p>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button type="submit">Send magic link</button>
      </form>

      <div className="card stack-sm">
        <div className="filter-inline">
          <button onClick={() => void refresh("pending")} disabled={state.loading}>
            Pending
          </button>
          <button onClick={() => void refresh("approved")} disabled={state.loading}>
            Approved
          </button>
          <button onClick={() => void refresh("rejected")} disabled={state.loading}>
            Rejected
          </button>
        </div>

        {state.error ? <p className="error-text">{state.error}</p> : null}

        <ul className="admin-list">
          {state.submissions.map((submission) => (
            <li key={submission.id} className="admin-list-item">
              <h3>{submission.name}</h3>
              <p className="text-muted">{submission.address}</p>
              <p className="text-muted">
                {submission.city} · {submission.postcode}
              </p>
              <p className="text-muted">Status: {submission.status}</p>

              {submission.status === "pending" ? (
                <div className="filter-inline">
                  <button onClick={() => void moderate(submission.id, "approve")}>Approve</button>
                  <button onClick={() => void moderate(submission.id, "reject")}>Reject</button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        {!state.loading && state.submissions.length === 0 ? (
          <p className="text-muted">No submissions in this status.</p>
        ) : null}
      </div>
    </section>
  );
}
