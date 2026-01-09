import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthed, role, logout } = useAuth();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [search, setSearch] = useState("");

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ fontWeight: 900, letterSpacing: -0.3, fontSize: 18 }}
        >
          Photo<span style={{ color: "var(--muted)" }}>Share</span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isAuthed && (
            <>
              {/* Feed / Dashboard based on role */}
              {role === "creator" ? (
                <Link className="badge" to="/dashboard">
                  Dashboard
                </Link>
              ) : (
                <Link className="badge" to="/">
                  Feed
                </Link>
              )}
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  placeholder="Search photos..."
                  style={{
                    maxWidth: 260,
                    paddingRight: 38, // ✅ space for icon button
                  }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = search.trim();
                      nav(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                    }
                  }}
                />

                <button
                  type="button"
                  title="Search"
                  onClick={() => {
                    const q = search.trim();
                    nav(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted)")
                  }
                  style={{
                    position: "absolute",
                    right: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--muted)",
                    transition: "color 0.15s ease",
                    padding: 6,
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>

              {/* Profile dropdown */}
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 18,
                    padding: 6,
                    borderRadius: 999,
                  }}
                  title="Profile"
                >
                  <i className="fa-solid fa-user"></i>
                </button>

                {open && (
                  <div
                    className="card"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      minWidth: 160,
                      padding: 6,
                    }}
                  >
                    <Link
                      to="/profile"
                      className="badge"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                        textAlign: "left",
                      }}
                      onClick={() => setOpen(false)}
                    >
                      <i className="fa-solid fa-user"></i>
                      Profile
                    </Link>

                    <button
                      className="badge"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        textAlign: "left",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setOpen(false);
                        logout();
                        nav("/login");
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
