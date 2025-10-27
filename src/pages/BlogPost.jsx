// FILE: src/pages/BlogPost.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo";

const fromVite = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) || "";
const fromWindow = (typeof window !== "undefined" && window.__ENV?.VITE_API_BASE) || "";
const rawBase = (import.meta?.env?.MODE === "development") ? fromVite || fromWindow : fromWindow || fromVite;
const API_ROOT = (rawBase || "").replace(/\/+$/, "");

const CLS = {
  tag: "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-100 dark:border-emerald-400/25",
  content: "prose dark:prose-invert max-w-none prose-a:text-emerald-700 dark:prose-a:text-emerald-300",
  field: "w-full rounded-xl px-3 py-2 outline-none ring-0 border border-slate-300 bg-white placeholder:text-slate-500 focus:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-400 dark:focus:border-emerald-400/40",
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
  btnPrimary: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:border-emerald-400/30 dark:bg-emerald-400/20 dark:text-emerald-100 dark:hover:bg-emerald-400/25",
};

function escapeHtml(s="") {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

export default function BlogPost() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // comments state
  const [comments, setComments] = useState([]);
  const [cTotal, setCTotal] = useState(0);
  const [cPage, setCPage] = useState(1);
  const [cLimit, setCLimit] = useState(10);
  const [cLoading, setCLoading] = useState(false);
  const [cErr, setCErr] = useState("");

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");         // optional (not shown publicly)
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");     // honeypot
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  useEffect(() => {
    let gone = false;
    async function load() {
      setLoading(true); setErr("");
      try {
        const res = await fetch(`${API_ROOT}/blogs/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        if (!gone) setItem(data.item);
      } catch (e) {
        if (!gone) setErr(e.message || "Not found");
      } finally {
        if (!gone) setLoading(false);
      }
    }
    load();
    return () => { gone = true; };
  }, [slug]);

  // load comments
  const cParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(cPage));
    p.set("limit", String(cLimit));
    return p.toString();
  }, [cPage, cLimit]);

  useEffect(() => {
    let gone = false;
    async function loadComments() {
      if (!slug) return;
      setCLoading(true); setCErr("");
      try {
        const res = await fetch(`${API_ROOT}/blogs/${encodeURIComponent(slug)}/comments?${cParams}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        if (!gone) { setComments(data.items || []); setCTotal(data.total || 0); }
      } catch (e) {
        if (!gone) setCErr(e.message || "Failed to load comments");
      } finally {
        if (!gone) setCLoading(false);
      }
    }
    loadComments();
    return () => { gone = true; };
  }, [slug, cParams]);

  async function submitComment(e) {
    e.preventDefault();
    setSending(true); setSentMsg(""); setCErr("");
    try {
      const res = await fetch(`${API_ROOT}/blogs/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ name, email, body, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setSentMsg(data?.message || "Thanks! Your comment is awaiting approval.");
      setName(""); setEmail(""); setBody(""); setWebsite("");
      // keep user on same page; once approved it will appear.
    } catch (e2) {
      setCErr(e2.message || "Could not send comment");
    } finally {
      setSending(false);
    }
  }

  const title = item?.title ? `${item.title} — CTRL Compliance Blog` : "Blog — CTRL Compliance";
  const desc = item?.blurb || "Insights on transport compliance and operations.";
  const ogImage = item?.heroUrl || undefined;

  const cPages = Math.max(1, Math.ceil(cTotal / cLimit));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Seo title={title} description={desc} ogImage={ogImage} canonical={`https://ctrlcompliance.co.uk/blog/${encodeURIComponent(slug || "")}`} />
      <div className="mb-5">
        <Link to="/blogs" className="text-sm underline underline-offset-2">← Back to blog</Link>
      </div>

      {loading && <div className="text-sm text-slate-600">Loading…</div>}
      {err && !loading && <div className="text-sm text-rose-600">{err}</div>}

      {item && (
        <article>
          <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
          <div className="text-xs text-slate-500 mt-1">
            {item.date ? new Date(item.date).toLocaleDateString() : "—"}
            {item.author ? ` · ${item.author}` : ""}
          </div>
          {item.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map(t => <span key={t} className={CLS.tag}>{t}</span>)}
            </div>
          )}
          {item.heroUrl && (
            <img src={item.heroUrl} alt="" className="mt-4 rounded-xl w-full object-cover max-h-[360px]" />
          )}

          {/* Content: admin-controlled → HTML */}
          <div className={CLS.content + " mt-6"} dangerouslySetInnerHTML={{ __html: item.content || "" }} />
        </article>
      )}

      {/* Comments */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Comments</h2>

        {cLoading && <div className="text-sm text-slate-600">Loading comments…</div>}
        {cErr && <div className="text-sm text-rose-600 mb-3">{cErr}</div>}

        <div className="space-y-3">
          {comments.map(c => (
            <div key={c._id} className="rounded-xl border p-3 dark:border-white/10">
              <div className="text-sm font-medium">{escapeHtml(c.name)}</div>
              <div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</div>
              <p className="mt-1 text-sm whitespace-pre-wrap">{escapeHtml(c.body)}</p>
            </div>
          ))}
          {!cLoading && comments.length === 0 && <div className="text-sm text-slate-500">No comments yet.</div>}
        </div>

        {/* Pagination */}
        {cPages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <div>Page <b>{cPage}</b> of <b>{cPages}</b> · Total <b>{cTotal}</b></div>
            <div className="flex gap-2">
              <button className={CLS.btn} onClick={() => setCPage(1)} disabled={cPage === 1}>First</button>
              <button className={CLS.btn} onClick={() => setCPage(p => Math.max(1, p - 1))} disabled={cPage === 1}>Prev</button>
              <button className={CLS.btn} onClick={() => setCPage(p => Math.min(cPages, p + 1))} disabled={cPage === cPages}>Next</button>
              <button className={CLS.btn} onClick={() => setCPage(cPages)} disabled={cPage === cPages}>Last</button>
            </div>
            <select className={CLS.field + " w-28"} value={cLimit} onChange={e => setCLimit(parseInt(e.target.value) || 10)}>
              {[5,10,20,50].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        )}

        {/* Add a comment */}
        <div className="mt-8 rounded-xl border p-4 dark:border-white/10">
          <h3 className="font-medium mb-2">Leave a comment</h3>
          {sentMsg && <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">{sentMsg}</div>}
          <form onSubmit={submitComment} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs">Name</span>
                <input className={CLS.field} value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs">Email (not published)</span>
                <input className={CLS.field} type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={120} />
              </label>
            </div>
            {/* Honeypot (hidden) */}
            <label className="hidden">
              Website
              <input value={website} onChange={e => setWebsite(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs">Comment</span>
              <textarea className={CLS.field + " min-h-[140px]"} value={body} onChange={e => setBody(e.target.value)} required maxLength={4000} />
            </label>
            <button className={CLS.btnPrimary} disabled={sending || !name || !body}>{sending ? "Sending…" : "Post comment"}</button>
          </form>
          <p className="mt-2 text-xs text-slate-500">Comments are moderated and may take a moment to appear.</p>
        </div>
      </section>
    </div>
  );
}
