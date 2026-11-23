import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/authApi";
import { setToken, setUser } from "../utils/auth";
import type { LoginRequest, RegisterRequest } from "../types/auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
        // After successful registration, switch to login
        setIsLogin(true);
        setError("Registration successful! Please login.");
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Username or email already exists. Please try different credentials.");
      } else if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError(
          isLogin
            ? "Login failed. Please check your credentials."
            : "Registration failed. Please try again."
        );
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px" }}>
      <Card title={isLogin ? "Login" : "Register"}>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="label">Username:</label>
            <Input
              id="username"
              data-testid="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="email" className="label">Email:</label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="password" className="label">Password:</label>
            <Input
              id="password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            data-testid="submit-button"
            variant="primary"
            style={{ width: "100%" }}
          >
            {isLogin ? "Login" : "Register"}
          </Button>
        </form>
        <div className="text-center mt-4">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="btn-link"
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}