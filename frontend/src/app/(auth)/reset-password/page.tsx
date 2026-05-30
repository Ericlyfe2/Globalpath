"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetForm() {
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="animate-fade-up text-center">
        <AlertCircle size={24} className="mx-auto mb-3 text-clay-600" />
        <h1 className="text-3xl font-display font-semibold text-ink-900">Invalid reset link</h1>
        <p className="mt-2 text-ink-600">This link is missing or invalid. Request a new one.</p>
        <Link href="/forgot-password" className="btn-accent text-sm mt-6 inline-flex">
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-fade-up text-center">
        <CheckCircle2 size={24} className="mx-auto mb-3 text-leaf-600" />
        <h1 className="text-3xl font-display font-semibold text-ink-900">Password reset</h1>
        <p className="mt-2 text-ink-600">Your password has been updated successfully.</p>
        <Link href="/login" className="btn-accent text-sm mt-6 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-display font-semibold text-ink-900">Set new password</h1>
      <p className="mt-2 text-ink-600">Must be at least 8 characters.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">New password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-md bg-red-500/10 border border-red-500/25 text-sm text-red-600">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-50">
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
