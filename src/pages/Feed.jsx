import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import PostCard from "../components/PostCard";

export default function Feed() {
  const PAGE_SIZE = 15;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // show only first 15 initially
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = async () => {
    setLoading(true);
    const res = await http.get("/api/posts");

    const postsArr = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.posts)
      ? res.data.posts
      : [];

    setPosts(postsArr);
    setVisibleCount(PAGE_SIZE); // reset to first 15 on refresh/load
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount]
  );
  const canLoadMore = visibleCount < posts.length;

  return (
    <div className="container">
      <div style={{ margin: "8px 0 25px" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
          Discover Photos
        </h2>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Explore the latest uploads • Like and join the conversation
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 14 }}>
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: 14 }}>
          No posts yet.
        </div>
      ) : (
        <>
          <div className="grid">
            {visiblePosts.map((p) => (
              <PostCard key={p._id} post={p} onChanged={load} />
            ))}
          </div>

          {/* Load more */}
          <div style={{ display: "grid", placeItems: "center", marginTop: 16 }}>
            {canLoadMore ? (
              <button
                className="btn btn-primary"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more
              </button>
            ) : (
              <span className="badge">You’re all caught up.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
