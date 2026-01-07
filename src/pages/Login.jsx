import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    // ✅ Frontend validations
    if (!email) {
      return setErr("Email is required.");
    }

    if (!password) {
      return setErr("Password is required.");
    }

    setLoading(true);

    try {
      const res = await http.post("/api/auth/login", { email, password });
      login({ token: res.data.token, role: res.data.role });
      if (res.data.role === "creator") nav("/dashboard");
      else nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="card authCard" style={{ padding: 22 }}>
        {/* 1) Welcome back */}
        <h1
          className="authTitle"
          style={{ textAlign: "center", marginTop: 20, marginBottom: 16 }}
        >
          WELCOME BACK
        </h1>

        {/* 2) Profile icon */}
        <div style={{ display: "grid", placeItems: "center", marginTop: 20 }}>
          <div
            style={{
              height: 64,
              width: 64,
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              boxShadow: "var(--shadow)",
            }}
          >
            <i
              className="fa-solid fa-user"
              style={{ fontSize: 22, color: "var(--text)" }}
            ></i>
          </div>
        </div>

        {/* 3) Sign-in heading */}
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 6,
              color: "var(--text)",
            }}
          >
            Sign In to Your Account
          </div>

          <p className="authSub" style={{ margin: 0 }}>
            Let’s get you signed in and explore.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ marginTop: 14 }}>
          {/* 4) Email */}
          <div className="formRow">
            <label>Email</label>
            <div className="input-wrap">
              <i className="fa-solid fa-envelope"></i>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* 5) Password */}
          <div className="formRow">
            <label>Password</label>
            <div className="input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error */}
          {err && <div className="errorBox">{err}</div>}

          {/* 6) Login button */}
          <div className="formRow">
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* 7) Signup link */}
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "var(--muted)",
              textAlign: "center",
            }}
          >
            Don’t have an account?{" "}
            <Link
              to="/signup"
              style={{
                fontWeight: 700,
                textDecoration: "none",
              }}
              className="signup-link"
            >
              Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
