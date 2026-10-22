import React, { useState } from "react";
import { ArrowRight, Sprout, ShieldCheck } from "lucide-react";
import { login, register } from "../api";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "FARMER",
};

export default function AuthScreen({ onAuthenticated }) {
  const { language, toggleLanguage } = useLanguage();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError("");

    try {
      const user = isRegister
        ? await register(form)
        : await login({
            email: form.email.trim(),
            password: form.password,
          });

      onAuthenticated(user);
    } catch (requestError) {
      if (requestError.status === 401) {
        setError("Incorrect email or password. Please try again.");
      } else if (requestError.status === 403) {
        setError("Incorrect email or password. Please try again.");
      } else if (requestError.status === 409 && isRegister) {
        setError("This email is already registered. Please sign in.");
      } else {
        setError(
          requestError.message || "Unable to continue. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-top">
        <div className="auth-brand">
          <span className="brand-mark">
            <Sprout size={24} />
          </span>

          <span>
            <strong>AgriLoop</strong>
            <small>FARM EQUIPMENT NETWORK</small>
          </span>
        </div>

        <button
          type="button"
          className="language-toggle"
          onClick={toggleLanguage}
        >
          {language === "en" ? "తెలుగు" : "English"}
        </button>
      </div>

      <div className="auth-layout">
        <section className="auth-intro">
          <div className="auth-kicker">
            <ShieldCheck size={15} />
            SMART FARMING, MADE ACCESSIBLE
          </div>

          <h1>
            Share equipment.
            <br />
            <em>Grow together.</em>
          </h1>

          <p>
            Find trusted farm machinery, make affordable rental bookings and
            help local farms thrive.
          </p>

          <div className="auth-benefit">
            <span>
              <ShieldCheck size={18} />
            </span>

            <div>
              <strong>One trusted network</strong>
              <small>Connect farmers and machinery owners in one place.</small>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "selected" : ""}
              onClick={() => changeMode("login")}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "register" ? "selected" : ""}
              onClick={() => changeMode("register")}
            >
              Create account
            </button>
          </div>

          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>

          <p className="auth-subtitle">
            {isRegister
              ? "Join AgriLoop as a farmer or machinery owner."
              : "Sign in to continue to your AgriLoop workspace."}
          </p>

          {error && (
            <div
              className="alert alert-danger auth-error"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            {isRegister && (
              <label>
                Full name
                <input
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Enter your full name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                autoComplete="email"
                type="email"
                required
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            {isRegister && (
              <label>
                Phone number
                <input
                  autoComplete="tel"
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  minLength={10}
                  maxLength={10}
                  required
                  value={form.phone}
                  onChange={(event) =>
                    update(
                      "phone",
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="10-digit mobile number"
                />
                <small>
                  Required · Enter a valid 10-digit Indian mobile number.
                </small>
              </label>
            )}

            <label>
              Password
              <input
                autoComplete={isRegister ? "new-password" : "current-password"}
                type="password"
                minLength={isRegister ? 8 : undefined}
                required
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder={
                  isRegister ? "At least 8 characters" : "Enter your password"
                }
              />
              {isRegister && <small>Use at least 8 characters.</small>}
            </label>

            {isRegister && (
              <label>
                Account type
                <select
                  value={form.role}
                  onChange={(event) => update("role", event.target.value)}
                >
                  <option value="FARMER">Farmer</option>
                  <option value="OWNER">Machinery owner</option>
                </select>
              </label>
            )}

            <button
              type="submit"
              className="btn btn-green auth-submit"
              disabled={busy}
            >
              {busy
                ? "Please wait…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}

              <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to AgriLoop?"}{" "}
            <button
              type="button"
              onClick={() => changeMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>

          <p className="auth-admin-note">
            Admin accounts are created by an administrator, not through public
            registration.
          </p>
        </section>
      </div>

      <footer className="auth-footer">
        AgriLoop · Better access. Stronger farms. Shared growth.
      </footer>
    </main>
  );
}
