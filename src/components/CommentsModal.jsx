import { useEffect, useState, useCallback } from "react";
import http from "../api/http";

export default function CommentsModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal) => {
    try {
      const res = await http.get(`/api/posts/${postId}/comments`, { signal });
      setComments(res.data.comments || []);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);              // ✅ set loading here, not inside load()
    load(controller.signal);       // ✅ async work happens here
    return () => controller.abort();
  }, [load]);

  const add = async () => {
    if (!text.trim()) return;
    await http.post(`/api/posts/${postId}/comments`, { text });
    setText("");
    setLoading(true);
    await load();                  // reload list
  };

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0, 0, 0, 0.25)", // (your 0.69 was very dark)
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          maxWidth: 520,
          width: "100%",
        }}
      >
        <div className="modalHeader">
          <strong>Comments {!loading && `(${comments.length})`}</strong>
          <button className="modalClose" onClick={onClose}>✕</button>
        </div>

        <div className="modalBody">
          {loading ? (
            <div style={{ color: "var(--muted)" }}>Loading...</div>
          ) : comments.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>No comments yet.</div>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="commentItem">
                <div className="commentMeta">
                  <b style={{ color: "var(--text)" }}>{c.user?.email || "user"}</b>
                  {" "}• {new Date(c.createdAt).toLocaleString()}
                </div>
                <div className="commentText">{c.text}</div>
              </div>
            ))
          )}
        </div>

        <div className="modalFooter">
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button className="btn btn-primary" onClick={add}>Send</button>
        </div>
      </div>
    </div>
  );
}
