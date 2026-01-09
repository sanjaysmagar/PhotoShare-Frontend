import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import http from "../api/http";

function roleLabel(role) {
  if (role === "creator") return "Creator";
  if (role === "user") return "User";
  if (role === "viewer") return "Viewer";
  return role || "Unknown";
}

export default function Profile() {
  const nav = useNavigate();
  const { role, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await http.get("/api/auth/me");
        setEmail(res.data?.user?.email || "");
      } catch {
        setEmail("");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const initials = useMemo(() => {
    if (!email) return "";
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  }, [email]);

  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  };

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      {/* Header */}
      <div style={{ margin: "8px 0 18px" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Profile</h2>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Manage your account details
        </div>
      </div>

      {/* Layout */}
      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "1.1fr 0.9fr",
        }}
      >
        {/* Main card */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar */}
            <div
              style={{
                height: 64,
                width: 64,
                borderRadius: 18,
                border: "1px solid var(--border)",
                display: "grid",
                placeItems: "center",
                background: "#fff",
                fontWeight: 900,
                fontSize: 18,
                color: "var(--text)",
              }}
              title="Profile"
            >
              {email ? initials : <i className="fa-solid fa-user"></i>}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 16,
                  color: "var(--text)",
                }}
              >
                {loading ? "Loading..." : email || "Your Account"}
              </div>
              <div
                style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}
              >
                Signed in as <span className="badge">{roleLabel(role)}</span>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={copyEmail}
                disabled={!email}
                title="Copy email"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i className="fa-regular fa-copy"></i>
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  logout();
                  nav("/login");
                }}
                title="Logout"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Logout
              </button>
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid var(--border)",
              margin: "14px 0",
            }}
          />

          {/* Details */}
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Email</div>
              <div style={{ fontWeight: 700, color: "var(--text)" }}>
                {email || "—"}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                Account type
              </div>
              <div style={{ fontWeight: 700, color: "var(--text)" }}>
                {roleLabel(role)}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "145px 1fr",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Status</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    height: 8,
                    width: 8,
                    borderRadius: 999,
                    background: "var(--primary)",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "var(--text)", fontWeight: 700 }}>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Side card */}
        <div className="card" style={{ padding: 16 }}>
          <div
            style={{
              fontWeight: 900,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Tips
          </div>

          <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
            {role === "creator" ? (
              <>
                As a <b>Creator</b>, you can upload new posts, edit your post
                metadata, and manage your uploads from the dashboard.
              </>
            ) : (
              <>
                As a <b>User</b>, you can explore the feed, like posts, comment,
                and download photos (if enabled).
              </>
            )}
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {role === "creator" ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => nav("/dashboard")}
                style={{ width: "100%" }}
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => nav("/")}
                style={{ width: "100%" }}
              >
                Explore Feed
              </button>
            )}

            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => nav("/search")}
              style={{ width: "100%" }}
            >
              Search Posts
            </button>
          </div>
        </div>
      </div>

      {/* Responsive fallback */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
