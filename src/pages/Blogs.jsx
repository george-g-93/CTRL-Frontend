// FILE: src/pages/Blogs.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";

// API base (same resolution you use elsewhere)
const fromVite = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) || "";
const fromWindow = (typeof window !== "undefined" && window.__ENV?.VITE_API_BASE) || "";
const rawBase = (import.meta?.env?.MODE === "development") ? fromVite || fromWindow : fromWindow || fromVite;
const API_ROOT = (rawBase || "").replace(/\/+$/, "");

const CLS = {
    field: "w-full rounded-xl px-3 py-2 outline-none ring-0 border border-slate-300 bg-white placeholder:text-slate-500 focus:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-400 dark:focus:border-emerald-400/40",
    btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
    tag: "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-100 dark:border-emerald-400/25",
    link: "text-emerald-800 underline underline-offset-[3px] decoration-emerald-300/70 hover:text-emerald-900 dark:text-emerald-300 dark:decoration-emerald-400/50",
    meta: "text-xs text-slate-500",
    card: "group grid grid-rows-[auto_1fr_auto] rounded-xl border bg-white overflow-hidden transition hover:shadow-md dark:bg-white/5 dark:border-white/10",
    cardBody: "px-3 sm:px-0",
};

// Small helper
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : "—"; }
//function catFrom(post) { return Array.isArray(post.tags) && post.tags[0] ? post.tags[0] : "Blog"; }
const placeholder =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#e2e8f0' offset='0'/><stop stop-color='#cbd5e1' offset='1'/></linearGradient></defs>
  <rect width='1200' height='630' fill='url(#g)'/></svg>`);

export default function Blogs() {
    const [sp, setSp] = useSearchParams();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(sp.get("limit") || "12", 10)));
    const q = sp.get("q") || "";
    const tag = sp.get("tag") || "";
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const params = useMemo(() => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (q) p.set("q", q);
        if (tag) p.set("tag", tag);
        return p.toString();
    }, [page, limit, q, tag]);

    useEffect(() => {
        let gone = false;
        async function load() {
            setLoading(true); setErr("");
            try {
                const res = await fetch(`${API_ROOT}/blogs?${params}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
                if (!gone) { setItems(data.items || []); setTotal(data.total || 0); }
            } catch (e) {
                if (!gone) setErr(e.message || "Failed to load blogs");
            } finally {
                if (!gone) setLoading(false);
            }
        }
        load();
        return () => { gone = true; };
    }, [params]);

    const pages = Math.max(1, Math.ceil(total / limit));

    function update(key, value) {
        const next = new URLSearchParams(sp);
        if (value) next.set(key, value); else next.delete(key);
        if (key !== "page") next.set("page", "1");
        setSp(next, { replace: true });
    }

    // Split into featured (first 3 on page 1) and the rest
    const featured = page === 1 ? items.slice(0, 3) : [];
    const rest = page === 1 ? items.slice(3) : items;

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <Seo
                title="Blog — CTRL Compliance"
                description="Insights on transport compliance, tachograph rules, and operator licensing."
                canonical="https://ctrlcompliance.co.uk/blogs"
            />

            <h1 className="text-3xl font-semibold tracking-tight mb-4">Blog</h1>

            {/* Filters */}
            <div className="grid gap-3 sm:grid-cols-3 mb-6">
                <input
                    className={CLS.field}
                    placeholder="Search title, blurb, content…"
                    defaultValue={q}
                    onKeyDown={(e) => { if (e.key === "Enter") update("q", e.currentTarget.value); }}
                />
                <input
                    className={CLS.field}
                    placeholder="Filter by tag (e.g. tachograph)"
                    defaultValue={tag}
                    onKeyDown={(e) => { if (e.key === "Enter") update("tag", e.currentTarget.value); }}
                />
                <div className="flex gap-2">
                    <button className={CLS.btn} onClick={() => update("q", document.activeElement?.value || q)}>Search</button>
                    <button
                        className={CLS.btn}
                        onClick={() => { const n = new URLSearchParams(sp);["q", "tag", "page"].forEach(k => n.delete(k)); setSp(n, { replace: true }); }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {err && <div className="text-sm text-rose-600 mb-4">{err}</div>}
            {loading && <div className="text-sm text-slate-600 mb-4">Loading…</div>}

            {/* Featured band */}
            {featured.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Featured</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map(post => (
                            <article key={post._id} className={CLS.card}>
                                {/* image */}
                                <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="block">
                                    <div className="aspect-[16/9] w-full overflow-hidden">
                                        <img
                                            src={post.heroUrl || placeholder}
                                            alt=""
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                            loading="lazy"
                                        />
                                    </div>
                                </Link>

                                {/* body */}
                                <div className="p-3">
                                    <div className={CLS.meta}>{fmtDate(post.date)}</div>

                                    <h3 className="mt-1 text-lg font-semibold leading-snug">
                                        <Link to={`/blog/${encodeURIComponent(post.slug)}`} className={CLS.link}>
                                            {post.title}
                                        </Link>
                                    </h3>

                                    {post.blurb && (
                                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-4">
                                            {post.blurb}
                                        </p>
                                    )}

                                    {/* chips at bottom */}
                                    {(() => {
                                        const tagsArr = Array.isArray(post.tags)
                                            ? post.tags
                                            : (typeof post.tags === "string"
                                                ? post.tags.split(",").map(s => s.trim()).filter(Boolean)
                                                : []);
                                        return tagsArr.length ? (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {tagsArr.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => update("tag", t)}
                                                        className={CLS.tag}
                                                        title={`Filter by ${t}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null;
                                    })()}
                                </div>

                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Rest of posts (card grid) */}
            {!loading && items.length === 0 ? (
  <div className="text-sm text-slate-500">No posts found.</div>
) : (
  <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {rest.map(post => (
      <article key={post._id} className={CLS.card}>
        <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="block">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src={post.heroUrl || placeholder}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="p-3">
          <div className={CLS.meta}>{fmtDate(post.date)}</div>
          <h3 className="mt-1 text-lg font-semibold leading-snug">
            <Link to={`/blog/${encodeURIComponent(post.slug)}`} className={CLS.link}>
              {post.title}
            </Link>
          </h3>
          {post.blurb && (
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-4">
              {post.blurb}
            </p>
          )}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.map(t => (
                <button
                  key={t}
                  onClick={() => update("tag", t)}
                  className={CLS.tag}
                  title={`Filter by ${t}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </article>
    ))}
  </section>
)}


            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between text-sm">
                <div>Page <b>{page}</b> of <b>{pages}</b> · Total <b>{total}</b></div>
                <div className="flex gap-2">
                    <button className={CLS.btn} onClick={() => update("page", "1")} disabled={page === 1}>First</button>
                    <button className={CLS.btn} onClick={() => update("page", String(Math.max(1, page - 1)))} disabled={page === 1}>Prev</button>
                    <button className={CLS.btn} onClick={() => update("page", String(Math.min(pages, page + 1)))} disabled={page === pages}>Next</button>
                    <button className={CLS.btn} onClick={() => update("page", String(pages))} disabled={page === pages}>Last</button>
                </div>
            </div>
        </div>
    );
}
