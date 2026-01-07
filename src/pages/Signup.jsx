import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../api/http";

export default function Signup() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ new
  const [role, setRole] = useState("user");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => {
    // simple reliable email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const isStrongPassword = (value) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(value);
};

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const cleanEmail = email.trim();

    // ✅ validations (before API)
    if (!cleanEmail) return setErr("Email is required.");
    if (!isValidEmail(cleanEmail)) return setErr("Please enter a valid email address.");
    if (!password) return setErr("Password is required.");
    if (!isStrongPassword(password)) {
  return setErr(
    "Password must be at least 6 characters and include an uppercase letter, lowercase letter, number, and special character."
  );
}
    if (!confirmPassword) return setErr("Confirm password is required.");
    if (password !== confirmPassword) return setErr("Passwords do not match.");

    setLoading(true);

    try {
      await http.post("/api/auth/signup", { email: cleanEmail, password, role });
      nav("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="card authCard" style={{ padding: 22 }}>
        <h1 className="authTitle" style={{ textAlign: "center", marginTop: 20, marginBottom: 16 }}>
          CREATE ACCOUNT
        </h1>

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
            <i className="fa-solid fa-user-plus" style={{ fontSize: 22, color: "var(--text)" }}></i>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
            Sign Up to get started
          </div>
          <p className="authSub" style={{ margin: 0 }}>
            Choose an account type and create your profile.
          </p>
        </div>

        <form onSubmit={submit} style={{ marginTop: 14 }}>
          {/* Email */}
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

          {/* Password */}
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

          {/* ✅ Confirm Password */}
          <div className="formRow">
            <label>Confirm Password</label>
            <div className="input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          {/* Role */}
          <div className="formRow">
            <label>Account type</label>
            <div className="input-wrap">
              <i className="fa-solid fa-user-tag"></i>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Viewer</option>
                <option value="creator">Creator</option>
              </select>
            </div>
          </div>

          {err && <div className="errorBox">{err}</div>}

          <div className="formRow">
            <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating..." : "Signup"}
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 700, textDecoration: "none" }} className="signup-link">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}