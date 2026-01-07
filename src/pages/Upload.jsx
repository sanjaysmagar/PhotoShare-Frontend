import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

export default function Upload() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!file) return setErr("Please select an image.");

    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("caption", caption);

      await http.post("/api/posts", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ margin:"8px 0 14px" }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:900 }}>Upload</h2>
        <div style={{ color:"var(--muted)", fontSize:13 }}>Creators only</div>
      </div>

      <div className="card" style={{ padding:14, maxWidth:520 }}>
        <form onSubmit={submit}>
          <div style={{ marginTop:10 }}>
            <label style={{ display:"block", fontSize:13, color:"var(--muted)", marginBottom:6 }}>Photo</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div style={{ marginTop:12 }}>
            <label style={{ display:"block", fontSize:13, color:"var(--muted)", marginBottom:6 }}>Caption</label>
            <input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." />
          </div>

          {err && <div className="errorBox">{err}</div>}

          <div style={{ marginTop:12 }}>
            <button className="btn btn-primary" style={{ width:"100%" }} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
