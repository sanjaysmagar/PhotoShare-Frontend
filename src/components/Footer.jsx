export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 60,
        padding: "24px 0",
        borderTop: "1px solid var(--border)",
        background: "#fafafa",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          textAlign: "center",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        {/* Brand */}
        <div style={{ fontWeight: 700, color: "var(--text)" }}>
          Photo<span style={{ color: "var(--muted)" }}>Share</span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span>About</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>

        {/* Copyright */}
        <div>© {new Date().getFullYear()} PhotoShare. All rights reserved.</div>
      </div>
    </footer>
  );
}
