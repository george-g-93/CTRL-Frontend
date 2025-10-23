// FILE: src/pages/NewsPost.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";

export default function NewsPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API}/news/${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (alive) setPost(data);
      } catch (e) {
        if (alive) setErr("Couldn't load this article.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/news" className="text-sm text-emerald-700 dark:text-emerald-300 hover:underline">← Back to news</Link>

      {loading && <p className="mt-6 text-slate-500">Loading…</p>}
      {err && !loading && <p className="mt-6 text-rose-500">{err}</p>}

      {post && (
        <>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{post.title}</h1>
          <div className="mt-1 text-xs text-slate-500">
            {post.date ? new Date(post.date).toLocaleDateString() : ""}
          </div>

          {/* If your API returns sanitized HTML in `content` */}
          {post.content ? (
            <article
              className="prose prose-slate dark:prose-invert mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="mt-6 text-slate-600 dark:text-slate-300">{post.blurb}</p>
          )}
        </>
      )}
    </section>
  );
}
