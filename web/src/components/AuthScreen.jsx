import React, { useState } from "react";
import { Activity, Eye, EyeOff, LogIn } from "lucide-react";

export function AuthScreen({ onAuth, notice, error, setNotice, setError }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      setBusy(false);
      return;
    }
    try {
      await onAuth(mode, mode === "register"
        ? { name, email, company, password, confirm_password: confirmPassword }
        : { email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="brand large">
          <div className="brand-mark"><Activity size={24} /></div>
          <div>
            <h1>JobFlow</h1>
            <span>Background jobs, workers, retries, queues</span>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="segmented">
            <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Register</button>
          </div>
          {mode === "register" && (
            <>
              <label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Company<input value={company} onChange={(event) => setCompany(event.target.value)} /></label>
            </>
          )}
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password
            <span className="password-field">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {mode === "register" && (
            <label>Confirm password
              <span className="password-field">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
          )}
          <button className="primary" disabled={busy}><LogIn size={16} /> {busy ? "Working..." : "Continue"}</button>
        </form>
        {(notice || error) && <div className={`notice ${error ? "error" : ""}`}>{error || notice}</div>}
      </section>
    </main>
  );
}
