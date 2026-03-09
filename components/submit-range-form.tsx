"use client";

import { FormEvent, useState } from "react";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function SubmitRangeForm() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      postcode: String(form.get("postcode") ?? ""),
      facility_type: String(form.get("facility_type") ?? ""),
      bays: form.get("bays") ? Number(form.get("bays")) : null,
      covered_bays: form.get("covered_bays") === "on",
      floodlights: form.get("floodlights") === "on",
      short_game_area: form.get("short_game_area") === "on",
      simulator_brand: String(form.get("simulator_brand") ?? "") || null,
      price_100_balls: form.get("price_100_balls") ? Number(form.get("price_100_balls")) : null,
      website: String(form.get("website") ?? "") || null,
      phone: String(form.get("phone") ?? "") || null,
      opening_hours: String(form.get("opening_hours") ?? "") || null,
      submitter_email: String(form.get("submitter_email") ?? "") || null,
      honeypot: String(form.get("company") ?? ""),
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ error: "Submission failed" }))) as {
        error?: string;
      };

      setState({ status: "error", message: error.error ?? "Submission failed" });
      return;
    }

    (event.target as HTMLFormElement).reset();
    setState({ status: "success" });
  }

  return (
    <form className="card stack-sm" onSubmit={onSubmit}>
      <h2>Submit a Missing Range</h2>
      <p className="text-muted">
        Every submission enters a moderation queue before publishing.
      </p>

      <label>
        Range name
        <input required name="name" minLength={2} />
      </label>

      <label>
        Address
        <input required name="address" minLength={5} />
      </label>

      <div className="filter-inline">
        <label>
          City
          <input required name="city" />
        </label>

        <label>
          Postcode
          <input required name="postcode" />
        </label>
      </div>

      <label>
        Facility type
        <select required name="facility_type" defaultValue="outdoor">
          <option value="outdoor">Outdoor</option>
          <option value="indoor">Indoor</option>
          <option value="both">Both</option>
        </select>
      </label>

      <div className="filter-inline">
        <label>
          Bays
          <input type="number" name="bays" min={1} />
        </label>

        <label>
          Price (100 balls)
          <input type="number" step="0.01" name="price_100_balls" min={0} />
        </label>
      </div>

      <div className="filter-grid">
        <label className="checkbox">
          <input type="checkbox" name="covered_bays" /> Covered bays
        </label>
        <label className="checkbox">
          <input type="checkbox" name="floodlights" /> Floodlights
        </label>
        <label className="checkbox">
          <input type="checkbox" name="short_game_area" /> Short game area
        </label>
      </div>

      <label>
        Simulator brand
        <input name="simulator_brand" placeholder="Trackman" />
      </label>

      <label>
        Website
        <input type="url" name="website" placeholder="https://" />
      </label>

      <label>
        Phone
        <input name="phone" />
      </label>

      <label>
        Opening hours
        <textarea name="opening_hours" rows={3} />
      </label>

      <label>
        Your email (optional)
        <input type="email" name="submitter_email" />
      </label>

      <div className="honeypot-field" aria-hidden>
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Submitting..." : "Submit for review"}
      </button>

      {state.status === "success" ? (
        <p className="success-text">Thanks, your listing was submitted for moderation.</p>
      ) : null}

      {state.status === "error" ? <p className="error-text">{state.message}</p> : null}
    </form>
  );
}
