import { useEffect, useMemo, useState } from "react";

// Fallback utility classes (avoid @apply). If your project already defines
// .btn-primary / .btn-outline / .field via Tailwind @layer, you can delete these
// and swap back to those classnames. Otherwise we use inline utility strings here.
const CLS = {
  btnPrimary:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 min-h-11 text-sm font-medium transition border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-[.99] dark:border-emerald-400/30 dark:bg-emerald-400/20 dark:text-emerald-200 dark:hover:bg-emerald-400/25",
  btnOutline:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 min-h-11 text-sm font-medium transition border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-[.99] dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10",
  field:
    "w-full rounded-xl px-3 py-2 outline-none ring-0 border border-slate-300 bg-white placeholder:text-slate-500 focus:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-400 dark:focus:border-emerald-400/40",
};

/**
 * Admin.jsx
 * Secure admin UI for CTRL contact messages
 * - Login (session cookie via cookie-session)
 * - CSRF via /admin/csrf double-submit token
 * - List, search, filter (read/unread), pagination
 * - Mark read/unread, delete, restore
 * - CSV export
 *
 * Requirements on the API side:
 *  - CORS: credentials: true, SameSite=None cookies, domain=.ctrlcompliance.co.uk
 *  - Endpoints:
 *    GET    /admin/csrf                     -> { csrf }
 *    POST   /admin/login                    (body {email,password}, header X-CSRF-Token)
 *    POST   /admin/logout                   (header X-CSRF-Token)
 *    GET    /admin/messages?read=&q=&page=&limit=
 *    PATCH  /admin/messages/:id             (body {read}, header X-CSRF-Token)
 *    DELETE /admin/messages/:id             (header X-CSRF-Token)
 *    POST   /admin/messages/:id/restore     (header X-CSRF-Token)
 */

// ---------- tiny API helper ----------
const API_ROOT = (
  (typeof window !== "undefined" && window.__ENV && window.__ENV.VITE_API_BASE) ||
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  ""
).replace(/\/+$/, "");

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function useCsrf() {
  const [csrf, setCsrf] = useState("");
  useEffect(() => {
    apiFetch("/admin/csrf", { headers: {} }).then((d) => setCsrf(d.csrf)).catch(() => {});
  }, []);
  return csrf;
}

// ---------- Login ----------
function AdminLogin({ onLoggedIn }) {
  const csrf = useCsrf();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await apiFetch("/admin/login", {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify({ email, password }),
      });
      onLoggedIn();
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl border p-6 mt-10 border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">You must be authorised to access enquiries.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-300">Email</span>
          <input className={CLS.field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-300">Password</span>
          <div className="relative">
            <input
              className={CLS.field}
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <button className={CLS.btnPrimary + " w-full"} disabled={!csrf || loading}>{loading ? "Signing in…" : "Sign in"}</button>
        {err && <div className="text-sm text-rose-600 dark:text-rose-400">{err}</div>}
      </form>
    </div>
  );
}

// ---------- Messages list & actions ----------
function useMessages({ initialLimit = 20 } = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [q, setQ] = useState("");
  const [readFilter, setReadFilter] = useState(""); // "", "true", "false"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (q) p.set("q", q);
    if (readFilter) p.set("read", readFilter);
    return p.toString();
  }, [page, limit, q, readFilter]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/admin/messages?${params}`);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [params]);

  return {
    items, total, page, setPage, limit, setLimit, q, setQ, readFilter, setReadFilter, loading, error, reload: load,
  };
}

function ActionsBar({ selected, clearSelection, onBulkRead, onBulkUnread, onBulkDelete, exporting, onExport }) {
  const count = selected.length;
  if (!count) return null;
  return (
    <div className="sticky top-0 z-10 mb-3 rounded-xl border bg-white/80 backdrop-blur p-3 text-sm flex items-center justify-between dark:bg-slate-900/70 dark:border-white/10">
      <div>
        <strong>{count}</strong> selected
      </div>
      <div className="flex gap-2">
        <button className={CLS.btnOutline} onClick={onBulkUnread}>Mark unread</button>
        <button className={CLS.btnPrimary} onClick={onBulkRead}>Mark read</button>
        <button className={CLS.btnOutline} onClick={onBulkDelete}>Delete</button>
        <button className={CLS.btnOutline} onClick={onExport} disabled={exporting}>{exporting ? "Exporting…" : "Export CSV"}</button>
        <button className={CLS.btnOutline} onClick={clearSelection}>Clear</button>
      </div>
    </div>
  );
}

function AdminMessages({ onLoggedOut }) {
  const csrf = useCsrf();
  const m = useMessages({ initialLimit: 20 });
  const [selected, setSelected] = useState([]);
  const [exporting, setExporting] = useState(false);

  const pages = Math.max(1, Math.ceil(m.total / m.limit));

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function clearSelection() { setSelected([]); }

  async function setRead(id, read) {
    await apiFetch(`/admin/messages/${id}`, { method: "PATCH", headers: { "X-CSRF-Token": csrf }, body: JSON.stringify({ read }) });
    m.reload();
  }
  async function del(id) {
    await apiFetch(`/admin/messages/${id}`, { method: "DELETE", headers: { "X-CSRF-Token": csrf } });
    m.reload();
  }
  async function restore(id) {
    await apiFetch(`/admin/messages/${id}/restore`, { method: "POST", headers: { "X-CSRF-Token": csrf } });
    m.reload();
  }
  async function bulk(setToRead) {
    for (const id of selected) {
      await setRead(id, setToRead);
    }
    clearSelection();
  }
  async function bulkDelete() {
    for (const id of selected) {
      await del(id);
    }
    clearSelection();
  }

  function toCSV(rows) {
    const head = ["_id","createdAt","name","email","company","fleetSize","read","message","ip","ua"];
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}` + `"` : s;
    };
    const body = rows.map(r => head.map(k => esc(k === "createdAt" ? new Date(r[k]).toISOString() : r[k])).join(","));
    return [head.join(","), ...body].join("\n");
  }
  function download(filename, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  async function exportCSV() {
    setExporting(true);
    try {
      // Export current page selection if any, otherwise all items on page
      const rows = m.items.filter(it => selected.length ? selected.includes(it._id) : true);
      download(`ctrl-messages-page${m.page}.csv`, toCSV(rows));
    } finally { setExporting(false); }
  }

  async function logout() {
    try { await apiFetch("/admin/logout", { method: "POST", headers: { "X-CSRF-Token": csrf } }); } catch {}
    onLoggedOut?.();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <div className="flex gap-2">
          <button className={CLS.btnOutline} onClick={() => m.reload()}>{m.loading ? "Loading…" : "Refresh"}</button>
          <button className={CLS.btnOutline} onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 mb-3">
        <input className={CLS.field} placeholder="Search name/email/company/message…" value={m.q} onChange={(e) => m.setQ(e.target.value)} />
        <select className={CLS.field} value={m.readFilter} onChange={(e) => m.setReadFilter(e.target.value)}>
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <select className={CLS.field} value={m.limit} onChange={(e) => m.setLimit(parseInt(e.target.value) || 20)}>
          {[10,20,50,100].map(n => <option key={n} value={n}>{n} per page</option>)}
        </select>
      </div>

      <ActionsBar
        selected={selected}
        clearSelection={clearSelection}
        onBulkRead={() => bulk(true)}
        onBulkUnread={() => bulk(false)}
        onBulkDelete={bulkDelete}
        exporting={exporting}
        onExport={exportCSV}
      />

      {m.error && <div className="text-sm text-rose-600 mb-3">{m.error}</div>}

      <div className="space-y-3">
        {m.items.map((it) => (
          <div key={it._id} className={`rounded-xl border p-4 ${it.read ? "opacity-80" : ""} dark:border-white/10`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {it.name} <span className="text-slate-500">·</span> <a href={`mailto:${it.email}`} className="underline-offset-2 hover:underline">{it.email}</a>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{new Date(it.createdAt).toLocaleString()}</div>
                {(it.company || it.fleetSize) && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{[it.company, it.fleetSize].filter(Boolean).join(" · ")}</div>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {it.deletedAt ? (
                  <button className={CLS.btnOutline} onClick={() => restore(it._id)}>Restore</button>
                ) : (
                  <>
                    {it.read ? (
                      <button className={CLS.btnOutline} onClick={() => setRead(it._id, false)}>Mark unread</button>
                    ) : (
                      <button className={CLS.btnPrimary} onClick={() => setRead(it._id, true)}>Mark read</button>
                    )}
                    <button className={CLS.btnOutline} onClick={() => del(it._id)}>Delete</button>
                  </>
                )}
                <input type="checkbox" className="h-4 w-4" checked={selected.includes(it._id)} onChange={() => toggle(it._id)} />
              </div>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{it.message}</p>
          </div>
        ))}
        {(!m.loading && m.items.length === 0) && (
          <div className="text-sm text-slate-500">No messages found.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div>
          Page <strong>{m.page}</strong> of <strong>{pages}</strong> · Total <strong>{m.total}</strong>
        </div>
        <div className="flex gap-2">
          <button className={CLS.btnOutline} onClick={() => m.setPage(1)} disabled={m.page === 1}>First</button>
          <button className={CLS.btnOutline} onClick={() => m.setPage(Math.max(1, m.page - 1))} disabled={m.page === 1}>Prev</button>
          <button className={CLS.btnOutline} onClick={() => m.setPage(Math.min(pages, m.page + 1))} disabled={m.page === pages}>Next</button>
          <button className={CLS.btnOutline} onClick={() => m.setPage(pages)} disabled={m.page === pages}>Last</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Root component exported ----------
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // quick session check - if 401, show login
    apiFetch("/admin/messages?page=1&limit=1")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  if (!API_ROOT) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-rose-600">VITE_API_BASE is not configured.</p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p className="text-sm text-slate-600">Checking session…</p>
      </div>
    );
  }

  return authed ? <AdminMessages onLoggedOut={() => setAuthed(false)} /> : <AdminLogin onLoggedIn={() => setAuthed(true)} />;
}
