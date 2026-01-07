import { useEffect, useMemo, useState, useCallback } from "react";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";
import PostCard from "../components/PostCard";

// decode JWT payload to get { id, role }
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

export default function Dashboard() {
  const { token } = useAuth();
  const myUserId = useMemo(() => getUserIdFromToken(token), [token]);

  // upload state
  const [showUploader, setShowUploader] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  // posts state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState("date_desc");

  const loadMyPosts = useCallback(async () => {
    if (!myUserId) return;

    setLoadingPosts(true);
    try {
      const res = await http.get("/api/posts");

      const allPosts = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.posts)
        ? res.data.posts
        : [];

      const mine = allPosts.filter((p) => {
        const creatorId =
          typeof p.creator === "string" ? p.creator : p.creator?._id;
        return creatorId === myUserId;
      });

      setPosts(mine);
    } finally {
      setLoadingPosts(false);
    }
  }, [myUserId]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  const upload = async (e) => {
    e.preventDefault();
    setErr("");

    if (!file) return setErr("Please select an image.");

    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("caption", caption.trim());

      await http.post("/api/posts", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      setCaption("");
      setShowUploader(false);

      // Refresh posts and reset pagination to show latest uploads
      await loadMyPosts();
      // setVisibleCount(6);
      setPage(1);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const sortedPosts = useMemo(() => {
    const arr = [...posts];

    if (sort === "date_asc") {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "date_desc") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "likes_desc") {
      arr.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }

    return arr;
  }, [posts, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const visiblePosts = sortedPosts.slice(start, end);

  return (
    <div className="container">
      {/* Header */}
      <div
        className="card"
        style={{
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 10,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
            Creator Dashboard
          </h2>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
            Upload photos and manage your posts
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => {
              setErr("");
              setShowUploader((s) => !s);
            }}
          >
            {showUploader ? "Close uploader" : "Add new post"}
          </button>
        </div>
      </div>

      {showUploader && (
        <div
          onClick={() => setShowUploader(false)}
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
                <i className="fa-solid fa-square-plus" />
              </div>

              <div style={{ fontWeight: 900, flex: 1 }}>Add a new post</div>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setShowUploader(false)}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={upload}>
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
                    Photo
                  </label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
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
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    style={{ resize: "vertical" }}
                  />
                </div>

                {err && <div className="errorBox">{err}</div>}

                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>My Posts</h3>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
            Showing {visiblePosts.length} of {posts.length}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "nowrap",
          }}
        >
          <select
            className="input"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            style={{ width: 230 }}
            title="Sort posts"
          >
            <option value="date_desc">Sort: Date (Newest First)</option>
            <option value="date_asc">Sort: Date (Oldes First)</option>
            <option value="likes_desc">Sort: Likes (High → Low)</option>
          </select>

          <button
            className="btn btn-ghost"
            onClick={() => {
              setPage(1);
              loadMyPosts();
            }}
            style={{ whiteSpace: "nowrap" }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Posts list */}
      {loadingPosts ? (
        <div className="card" style={{ padding: 14 }}>
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: 14 }}>
          You haven’t uploaded any posts yet. Click <b>Add new post</b> to
          create one.
        </div>
      ) : (
        <>
          <div className="grid">
            {visiblePosts.map((p) => (
              <PostCard key={p._id} post={p} onChanged={loadMyPosts} />
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-ghost"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>

            <span className="badge">
              Page {safePage} of {totalPages}
            </span>

            <button
              className="btn btn-ghost"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
