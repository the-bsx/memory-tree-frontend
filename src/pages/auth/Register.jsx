import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { registerUser } from "../../api/authApi";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (avatar) formData.append("avatar", avatar);

      await registerUser(formData);
      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong while creating your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Plant your tree" subtitle="Create an account to start keeping your memories.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full border-2 border-dashed border-mist flex items-center justify-center overflow-hidden bg-parchment hover:border-bark transition-colors shrink-0"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-mist">
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <div>
            <p className="text-sm text-ink font-medium">Profile photo</p>
            <p className="text-xs text-bark-light/60">Optional — you can add one later</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <label htmlFor="name" className="form-label">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Jordan Avery"
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className="input-field"
            placeholder="At least 8 characters"
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-bark-light/80">
        Already have an account?{" "}
        <Link to="/login" className="text-clay-dark font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
