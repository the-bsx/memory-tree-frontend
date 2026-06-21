import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { verifyEmail } from "../../api/authApi";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    let cancelled = false;

    const runVerification = async () => {
      if (!token) {
        if (!cancelled) setStatus("error");
        return;
      }
      try {
        await verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    runVerification();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      <div className="card p-8 text-center">
        {status === "verifying" && (
          <p className="text-bark-light text-sm">Verifying your email…</p>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-sage/15 flex items-center justify-center mx-auto mb-5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-sage-dark">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-ink text-sm mb-6">Your email is verified. You're all set to sign in.</p>
            <Link to="/login" className="btn-primary w-full inline-block text-center">
              Continue to sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-clay/15 flex items-center justify-center mx-auto mb-5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-clay-dark">
                <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="text-ink text-sm mb-6">
              This link is invalid or has expired. Request a new one from the sign-in page.
            </p>
            <Link to="/login" className="btn-secondary w-full inline-block text-center">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
