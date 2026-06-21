import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { resendVerificationEmail } from "../../api/authApi";

export default function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleResend = async () => {
    setStatus("sending");
    try {
      await resendVerificationEmail(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <AuthLayout title="Check your inbox">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-sage/15 flex items-center justify-center mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-sage-dark">
            <path
              d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-ink text-sm leading-relaxed">
          We sent a verification link to{" "}
          <span className="font-medium text-bark">{email || "your email"}</span>.
          Open it to activate your account.
        </p>

        <button
          onClick={handleResend}
          disabled={status === "sending" || status === "sent"}
          className="btn-secondary w-full mt-6"
        >
          {status === "sending" && "Sending…"}
          {status === "sent" && "Email sent ✓"}
          {status === "error" && "Try again"}
          {status === "idle" && "Resend verification email"}
        </button>

        <Link to="/login" className="block mt-5 text-sm text-clay-dark hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
