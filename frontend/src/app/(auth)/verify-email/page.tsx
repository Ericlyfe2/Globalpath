"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/auth";

function VerifyContent() {
  const search = useSearchParams();
  const token = search.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    (async () => {
      try {
        const res = await authFetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) setStatus("success");
        else setStatus("error");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="animate-fade-up text-center">
        <Loader2 size={24} className="mx-auto mb-3 animate-spin text-clay-500" />
        <h1 className="text-3xl font-display font-semibold text-ink-900">Verifying your email...</h1>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="animate-fade-up text-center">
        <CheckCircle2 size={24} className="mx-auto mb-3 text-leaf-600" />
        <h1 className="text-3xl font-display font-semibold text-ink-900">Email verified!</h1>
        <p className="mt-2 text-ink-600">Your account is now fully active.</p>
        <Link href="/dashboard" className="btn-accent text-sm mt-6 inline-flex">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up text-center">
      <XCircle size={24} className="mx-auto mb-3 text-red-500" />
      <h1 className="text-3xl font-display font-semibold text-ink-900">Verification failed</h1>
      <p className="mt-2 text-ink-600">The link may be expired or invalid.</p>
      <Link href="/dashboard" className="btn-accent text-sm mt-6 inline-flex">
        Go to dashboard
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
