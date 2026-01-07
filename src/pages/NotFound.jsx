import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight:"70vh", display:"grid", placeItems:"center" }}>
      <div className="card" style={{ padding:18, textAlign:"center" }}>
        <div style={{ fontSize:26, fontWeight:900 }}>404</div>
        <div style={{ color:"var(--muted)", marginTop:8 }}>Page not found</div>
        <Link to="/" className="btn btn-primary" style={{ display:"inline-block", marginTop:12 }}>Go to Feed</Link>
      </div>
    </div>
  );
}
