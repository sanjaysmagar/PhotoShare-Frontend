import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import http from "../api/http";
import PostCard from "../components/PostCard";

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const PAGE_SIZE = 15;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount]
  );
  const canLoadMore = visibleCount < posts.length;

  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      const res = await http.get(`/api/posts?q=${encodeURIComponent(q)}`);
      const arr = Array.isArray(res.data?.posts) ? res.data.posts : [];
      setPosts(arr);
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      setErr(e?.response?.data?.message || "Search failed");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // re-run whenever q changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const title = useMemo(() => {
    if (!q) return "Search";
    return `Search results for "${q}"`;
  }, [q]);

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{title}</h3>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>
          {loading ? "Loading..." : `${posts.length} result(s)`}
        </div>
      </div>

      {err && (
        <div className="errorBox" style={{ marginTop: 12 }}>
          {err}
        </div>
      )}

      {!loading && !err && q && posts.length === 0 && (
        <div style={{ marginTop: 14, color: "var(--muted)" }}>
          No posts matched your search.
        </div>
      )}

      {!q && (
        <div style={{ marginTop: 14, color: "var(--muted)" }}>
          Type something in the search box above.
        </div>
      )}

      {!loading && !err && posts.length > 0 && (
        <>
          <div className="grid" style={{ marginTop: 14 }}>
            {visiblePosts.map((p) => (
              <PostCard key={p._id} post={p} onChanged={load} />
            ))}
          </div>

          {/* Load more (same as Feed) */}
          <div style={{ display: "grid", placeItems: "center", marginTop: 16 }}>
            {canLoadMore ? (
              <button
                className="btn btn-primary"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more
              </button>
            ) : (
              posts.length > 0 && <span className="badge">End of results.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
