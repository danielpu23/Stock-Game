import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login, register } from "../api/authApi";
import { getErrorMessage } from "../api/errors";
import { setToken, setUser } from "../utils/auth";
import type { LoginRequest, RegisterRequest } from "../types/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  function switchMode(toLogin: boolean) {
    setIsLogin(toLogin);
    setError("");
    setNotice("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (isLogin) {
        const credentials: LoginRequest = { username, password };
        const response = await login(credentials);
        setToken(response.token);
        setUser({ id: response.id, username: response.username });
        navigate("/");
      } else {
        const userData: RegisterRequest = { username, email, password };
        await register(userData);
        setIsLogin(true);
        setNotice("Account created. You can sign in now.");
      }
    } catch (err) {
      // Surface the server's own reason ("password must be at least 8
      // characters", "Email already exists") rather than a generic message.
      setError(
        getErrorMessage(
          err,
          isLogin
            ? "Login failed. Please check your credentials."
            : "Registration failed. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="navbar__mark" style={{ width: 44, height: 44, fontSize: "1.1rem" }}>
            SG
          </span>
          <h1>Stock Game</h1>
          <p className="auth__tagline">
            Trade against your friends. Best portfolio wins.
          </p>
        </div>

        <div className="card">
          <div className="card__body">
            <div className="stack stack--tight">
              {error && <div className="alert alert--error">{error}</div>}
              {notice && <div className="alert alert--success">{notice}</div>}

              <form onSubmit={handleSubmit} className="stack stack--tight">
                <div className="field">
                  <label className="label" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="input"
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="field">
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="input"
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="field">
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="input"
                    id="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {!isLogin && (
                    <span className="dim small">At least 8 characters.</span>
                  )}
                </div>

                <button
                  className="btn btn--primary btn--block"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Please wait..."
                    : isLogin
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>
            </div>

            <div className="auth__switch">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => switchMode(false)}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => switchMode(true)}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* The dev profile seeds these two accounts. */}
        <div className="auth__demo">
          Demo accounts: <code>alice</code> / <code>bob</code> — password{" "}
          <code>password123</code>
        </div>
      </div>
    </div>
  );
}
