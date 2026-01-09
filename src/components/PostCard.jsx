import { useMemo, useState, useEffect } from "react";
import http from "../api/http";
import CommentsModal from "./CommentsModal";
import { useAuth } from "../auth/AuthContext";

// decode JWT payload to get { id }
function getUserIdFromToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json);
    return data.id || null;
  } catch {
    return null;
  }
}

export default function PostCard({ post, onChanged }) {
  const { role, token } = useAuth();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [likes, setLikes] = useState(post.likes || []);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editLocation, setEditLocation] = useState(post.location || "");
  const [editCaption, setEditCaption] = useState(post.caption || "");

  useEffect(() => {
    setEditTitle(post.title || "");
    setEditLocation(post.location || "");
    setEditCaption(post.caption || "");
  }, [post.title, post.location, post.caption]);

  const myUserId = useMemo(() => getUserIdFromToken(token), [token]);

  const likedByMe = useMemo(() => {
    return myUserId ? likes.includes(myUserId) : false;
  }, [likes, myUserId]);

  const like = async () => {
    if (!myUserId) return;

    setErr("");

    // Optimistic update
    const wasLiked = likes.includes(myUserId);
    const nextLikes = wasLiked
      ? likes.filter((id) => id !== myUserId)
      : [...likes, myUserId];

    setLikes(nextLikes);

    try {
      await http.post(`/api/posts/${post._id}/like`);
      // ✅ no onChanged() here — avoids full list refresh
    } catch (e) {
      // rollback on failure
      setLikes(likes);
      setErr(e?.response?.data?.message || "Like failed");
    }
  };

  useEffect(() => {
    setLikes(post.likes || []);
  }, [post.likes]);

  // const edit = async () => {
  //   const nextCaption = window.prompt("Edit caption:", post.caption || "");
  //   if (nextCaption === null) return; // cancel

  //   try {
  //     setErr("");
  //     setBusy(true);

  //     // Requires backend: PUT /api/posts/:id
  //     await http.put(`/api/posts/${post._id}`, { caption: nextCaption });

  //     onChanged();
  //   } catch (e) {
  //     setErr(
  //       e?.response?.data?.message ||
  //         "Edit failed (make sure PUT /api/posts/:id exists)"
  //     );
  //   } finally {
  //     setBusy(false);
  //   }
  // };

  const edit = () => {
    setErr("");
    setShowEditor(true);
  };

  // ✅ NEW: submit edited fields
  const saveEdit = async (e) => {
    e.preventDefault();

    try {
      setErr("");
      setBusy(true);

      await http.put(`/api/posts/${post._id}`, {
        title: editTitle,
        location: editLocation,
        caption: editCaption,
      });

      setShowEditor(false);
      onChanged(); // refresh list
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Edit failed");
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    try {
      setErr("");
      setBusy(true);

      // Requires backend: DELETE /api/posts/:id
      await http.delete(`/api/posts/${post._id}`);

      onChanged();
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Delete failed (make sure DELETE /api/posts/:id exists)"
      );
    } finally {
      setBusy(false);
    }
  };

  function formatPostDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const isSameDay = (a, b) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isSameDay(date, now)) {
      return `Today at ${time}`;
    }

    if (isSameDay(date, yesterday)) {
      return `Yesterday at ${time}`;
    }

    return (
      date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ${time}`
    );
  }

  const downloadPhoto = () => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.open(`${apiBase}/api/posts/${post._id}/download`, "_blank");
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        className="postMedia"
        onClick={() => setPreviewOpen(true)}
        style={{ cursor: "pointer" }}
        title="Open"
      >
        <img src={post.imageUrl || post.image_url} alt="post" />
      </div>

      <div className="postBody">
        <div
          className="postMeta"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span>
            by{" "}
            <b style={{ color: "var(--text)" }}>
              {post.creator?.email || "creator"}
            </b>
          </span>

          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            {post.createdAt ? formatPostDate(post.createdAt) : ""}
          </span>
        </div>
        {/* Keep caption area even if empty so actions row stays consistent */}
        <div
          className="postCaption"
          title={post.caption}
          style={{
            minHeight: 18,
            display: "-webkit-box",
            WebkitLineClamp: 1, // ✅ number of lines
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {post.title ? (
            <span
              style={{ fontWeight: 800, color: "var(--text)", marginRight: 6 }}
            >
              {post.title}
            </span>
          ) : null}
          {post.caption || ""}
        </div>

        {err && (
          <div className="errorBox" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}

        {/* Last row: like/comment left, edit/delete right */}
        <div
          className="postActions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn-ghost" onClick={like} disabled={busy}>
              <i
                className={
                  likedByMe ? "fa-solid fa-heart" : "fa-regular fa-heart"
                }
                style={{
                  marginRight: 8,
                  color: likedByMe ? "var(--primary)" : "inherit",
                  transform: likedByMe ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s ease",
                }}
              ></i>

              {/* {post.likes?.length || 0} */}
              {likes.length}
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => setOpen(true)}
              disabled={busy}
            >
              <i
                className="fa-regular fa-comment"
                style={{ marginRight: 8 }}
              ></i>
              Comments
            </button>
            {(role === "user" || role === "viewer") && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={downloadPhoto}
                disabled={busy}
              >
                <i
                  className="fa-solid fa-download"
                  style={{ marginRight: 8 }}
                ></i>
                Download
              </button>
            )}
          </div>

          {/* Only show edit/delete if creator is logged in */}
          {role === "creator" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={edit}
                disabled={busy}
                title="Edit"
              >
                <i className="fa-regular fa-pen-to-square"></i>
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={del}
                disabled={busy}
                title="Delete"
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: Edit Post Modal */}
      {showEditor && (
        <div
          onClick={() => setShowEditor(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 720,
              padding: 16,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  height: 34,
                  width: 34,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  display: "grid",
                  placeItems: "center",
                  background: "#fff",
                }}
              >
                <i className="fa-regular fa-pen-to-square" />
              </div>

              <div style={{ fontWeight: 900, flex: 1 }}>Edit post</div>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setShowEditor(false)}
                disabled={busy}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={saveEdit}>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 6,
                    }}
                  >
                    Title
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Add a title"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 6,
                    }}
                  >
                    Location
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Add a location"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 6,
                    }}
                  >
                    Caption
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Write a caption..."
                    style={{ resize: "vertical" }}
                  />
                </div>

                {err && <div className="errorBox">{err}</div>}

                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={busy}
                >
                  {busy ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewOpen && (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* row: preview card + side actions */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* ✅ Preview card stays centered */}
            <div
              className="card"
              style={{
                width: "min(980px, 78vw)",
                padding: 12,
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.42)", // slight transparency
                backdropFilter: "blur(6px)", // optional, looks premium
              }}
            >
              {/* Top bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "6px 8px 12px",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  by{" "}
                  <b style={{ color: "var(--text)" }}>
                    {post.creator?.email || "creator"}
                  </b>
                  {post.createdAt ? (
                    <>
                      {" "}
                      • <span>{formatPostDate(post.createdAt)}</span>
                    </>
                  ) : null}
                  {post.location ? (
                    <span
                      title={post.location}
                      style={{
                        marginLeft: 10,
                        gap: 6,
                      }}
                    >
                      <i className="fa-solid fa-location-dot"></i>{" "}
                      {post.location}
                    </span>
                  ) : null}
                </div>

                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  title="Close"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Big image */}
              <div style={{ borderRadius: 14, overflow: "hidden" }}>
                <img
                  src={post.imageUrl || post.image_url}
                  alt="post"
                  style={{
                    width: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                    display: "block",
                    background: "#000",
                  }}
                />
              </div>

              {/* Caption */}
              {post.caption ? (
                <div style={{ padding: "12px 8px 6px", color: "var(--text)" }}>
                  {post.title ? (
                    <span
                      style={{
                        fontWeight: 800,
                        color: "var(--text)",
                        marginRight: 6,
                      }}
                    >
                      {post.title}
                    </span>
                  ) : null}
                  {post.caption}
                </div>
              ) : null}
            </div>

            {/* ✅ Actions OUTSIDE the card (right side, vertical, icons only) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
              }}
            >
              {/* Like */}
              <button
                className="btn btn-ghost"
                onClick={like}
                disabled={busy}
                title={`Like (${likes.length})`}
                style={{
                  width: 46,
                  height: 46,
                  display: "grid",
                  placeItems: "center",
                  background: "transparent",
                  border: "1px solid var(--border)",
                }}
              >
                <i
                  className={
                    likedByMe ? "fa-solid fa-heart" : "fa-regular fa-heart"
                  }
                  style={{
                    color: likedByMe ? "var(--primary)" : "inherit",
                    fontSize: 18,
                  }}
                ></i>
              </button>

              {/* Comment */}
              <button
                className="btn btn-ghost"
                onClick={() => {
                  // setPreviewOpen(false);
                  setOpen(true);
                }}
                disabled={busy}
                title="Comments"
                style={{
                  width: 46,
                  height: 46,
                  display: "grid",
                  placeItems: "center",
                  background: "transparent",
                  border: "1px solid var(--border)",
                }}
              >
                <i
                  className="fa-regular fa-comment"
                  style={{ fontSize: 18 }}
                ></i>
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={downloadPhoto}
                disabled={busy}
                title="Download"
                style={{
                  width: 46,
                  height: 46,
                  display: "grid",
                  placeItems: "center",
                  background: "transparent",
                  border: "1px solid var(--border)",
                }}
              >
                <i
                  className="fa-solid fa-download"
                  style={{ fontSize: 18 }}
                ></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <CommentsModal postId={post._id} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
