// FILE: src/pages/News.jsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import postsRaw from "../data/news.json";

export default function News() {
  const posts = useMemo(
    () => [...postsRaw].sort((a, b) => new Date(b.date) - new Date(a.date)),
    []
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">News</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Updates from CTRL—guides, releases, and events.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-6
              border-slate-200 bg-white shadow-sm
              dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(p.date).toLocaleDateString()}
            </div>

            <h2 className="mt-1 text-xl font-semibold">
              <Link
                to={`/news/${p.id}`}
                className="text-slate-900 hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-300"
              >
                {p.title}
              </Link>
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {p.blurb}
            </p>

            <Link
              to={`/news/${p.id}`}
              className="mt-4 inline-block btn-outline text-xs"
            >
              Read more
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
