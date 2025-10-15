// FILE: src/pages/NewsDetail.jsx
import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import posts from "../data/news.json";

export default function NewsDetail() {
  const { id } = useParams();
  const post = useMemo(() => posts.find((p) => p.id === id), [id]);

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Post not found</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          It may have been moved or deleted.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/news" className="btn-outline">Back to News</Link>
          <Link to="/" className="btn-primary">Home</Link>
        </div>
      </section>
    );
  }

  if (typeof document !== "undefined") {
    document.title = `${post.title} • CTRL News`;
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {new Date(post.date).toLocaleDateString()}
      </div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {post.title}
      </h1>

      <div
        className="mt-4 rounded-2xl border p-6
          border-slate-200 bg-white shadow-sm
          dark:border-white/10 dark:bg-white/5"
      >
        <p className="text-slate-700 dark:text-slate-200">{post.blurb}</p>

        {post.content ? (
          <div
            className="mt-6 space-y-4 text-slate-700 dark:text-slate-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="mt-6 text-slate-600 dark:text-slate-400 text-sm">
            (Full article coming soon.)
          </p>
        )}
      </div>

      <div className="mt-10 flex gap-3">
        <Link to="/news" className="btn-outline">Back to News</Link>
        <Link to="/" className="btn-primary">Home</Link>
      </div>
    </article>
  );
}
