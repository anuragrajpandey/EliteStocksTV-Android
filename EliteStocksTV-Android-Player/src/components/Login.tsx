import { FormEvent, useState } from "react";
import { LogIn, Server, User, LockKeyhole, Eye, EyeOff, Tv } from "lucide-react";
import type { Credentials } from "../types";

type Props = {
  initial?: Credentials | null;
  busy: boolean;
  error?: string;
  onSubmit: (credentials: Credentials) => void;
};

export default function Login({ initial, busy, error, onSubmit }: Props) {
  const [server, setServer] = useState(initial?.server ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [showPassword, setShowPassword] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ server, username, password });
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-lockup">
          <div className="brand-mark"><Tv size={28} /></div>
          <div>
            <div className="brand-name">EliteStocks TV</div>
            <div className="brand-subtitle">Your entertainment, one place.</div>
          </div>
        </div>

        <div className="login-copy">
          <h1>Welcome back.</h1>
          <p>Sign in with your Xtream Codes subscription.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>Server URL</span>
            <div className="input-wrap">
              <Server size={18} />
              <input
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="http://server:port"
                autoComplete="url"
                required
              />
            </div>
          </label>

          <label>
            <span>Username</span>
            <div className="input-wrap">
              <User size={18} />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <div className="error-banner">{error}</div>}

          <button className="primary-button" disabled={busy}>
            {busy ? <span className="spinner" /> : <LogIn size={19} />}
            {busy ? "Connecting..." : "Continue"}
          </button>
        </form>

        <p className="legal-note">Only use subscriptions and streams you are authorized to access.</p>
      </section>
    </main>
  );
}