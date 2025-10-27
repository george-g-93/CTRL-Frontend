import { useEffect, useMemo, useState, useRef } from "react";

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
// const API_ROOT = (
//     (typeof window !== "undefined" && window.__ENV && window.__ENV.VITE_API_BASE) ||
//     (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
//     ""
// ).replace(/\/+$/, "");

const fromVite = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) || "";
const fromWindow = (typeof window !== "undefined" && window.__ENV?.VITE_API_BASE) || "";

// In development, always prefer Vite envs; in production, prefer window.__ENV (if present)
const rawBase =
    (import.meta?.env?.MODE === "development")
        ? fromVite || fromWindow
        : fromWindow || fromVite;

export const API_ROOT = (rawBase || "").replace(/\/+$/, "");







//slugify
function slugify(s) {
    return (s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


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
        apiFetch("/admin/csrf", { headers: {} }).then((d) => setCsrf(d.csrf)).catch(() => { });
    }, []);
    return csrf;
}

// -----------MFA----------------
// near the top:
function isMfaRequiredError(e) { return e?.status === 401 && /MFA required/i.test(e.message || ""); }

function MfaBox({ initiallyEnrolled = true, onDone }) {
    const [csrf, setCsrf] = useState("");
    const [step, setStep] = useState(initiallyEnrolled ? "verify" : "enrol");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [token, setToken] = useState("");
    const [qr, setQr] = useState("");
    const [secret, setSecret] = useState("");
    const [remember, setRemember] = useState(true);

    useEffect(() => {
        apiFetch("/admin/csrf", { headers: {} })
            .then((d) => setCsrf(d.csrf))
            .catch(() => setCsrf(""));
    }, []);

    // Helper to remember device
    function rememberDevice(marker) {
        const now = Date.now();
        const expiry = now + 14 * 24 * 60 * 60 * 1000; // 14 days
        localStorage.setItem(
            "ctrlAdminTrustedDevice",
            JSON.stringify({ marker, expiry })
        );
    }

    async function startEnrol() {
        setErr("");
        setLoading(true);
        try {
            const d = await apiFetch("/admin/2fa/setup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-CSRF-Token": csrf,
                },
            });
            setQr(d.qr);
            setSecret(d.secret);
            setStep("verify");
        } catch (e) {
            setErr(e.message || "Failed to start 2FA");
        } finally {
            setLoading(false);
        }
    }

    async function verify() {
        setErr("");
        setLoading(true);
        try {
            const body = { token, remember: !!remember };
            const resp = await apiFetch("/admin/2fa/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-CSRF-Token": csrf,
                },
                body: JSON.stringify(body),
            });
            if (remember && resp.deviceMarker) rememberDevice(resp.deviceMarker);
            onDone?.();
        } catch (e) {
            setErr(e.message || "Invalid code");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto rounded-2xl border p-6 mt-10 border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
            <h1 className="text-2xl font-semibold">Two-factor authentication</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Use an authenticator app (Microsoft/Google Authenticator, 1Password, etc).
            </p>

            {step === "enrol" && (
                <div className="mt-4 space-y-3">
                    <button onClick={startEnrol} className={CLS.btnPrimary} disabled={loading}>
                        {loading ? "Generating key…" : "Set up 2FA"}
                    </button>
                    {err && <div className="text-sm text-rose-600">{err}</div>}
                    <p className="text-xs text-slate-500">
                        You’ll get a QR code and secret to add to your app.
                    </p>
                </div>
            )}

            {step === "verify" && (
                <div className="mt-4 space-y-3">
                    {qr && (
                        <div className="rounded-xl border p-3 bg-white dark:bg-white/5 dark:border-white/10">
                            <img alt="Authenticator QR" src={qr} className="mx-auto" />
                            <div className="mt-2 text-xs text-slate-500 break-all">
                                Secret: {secret}
                            </div>
                        </div>
                    )}
                    <label className="flex flex-col gap-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                            6-digit code
                        </span>
                        <input
                            className={CLS.field}
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                        />
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        Remember this browser for 14 days
                    </label>

                    <button
                        onClick={verify}
                        className={CLS.btnPrimary + " w-full"}
                        disabled={loading || token.length < 6}
                    >
                        {loading ? "Verifying…" : "Verify & continue"}
                    </button>

                    {err && <div className="text-sm text-rose-600">{err}</div>}
                </div>
            )}
        </div>
    );
}



// ---------- Login ----------
function AdminLogin({ onLoggedIn }) {
    const csrf = useCsrf();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const deviceMarker = localStorage.getItem("ctrlAdminTrustedDevice")
        ? JSON.parse(localStorage.getItem("ctrlAdminTrustedDevice")).marker
        : null;


    async function submit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            const resp = await apiFetch("/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",   // <-- add this explicitly
                    "X-CSRF-Token": csrf,
                },
                body: JSON.stringify({ email, password, deviceMarker }),
            });
            onLoggedIn(resp);
        } catch (e) {
            // Prefer server-provided message
            const lockedExtra = (e?.body?.locked && e?.body?.minutesRemaining)
                ? ` (Try again in ~${e.body.minutesRemaining} min)`
                : "";
            setErr((e?.body?.error || e.message || "Login failed") + lockedExtra);
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

function AdminMessages({ onLoggedOut, onMfaRequired }) {
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
        try {
            await apiFetch(`/admin/messages/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                body: JSON.stringify({ read }),
            });
            m.reload();
        } catch (e) {
            if (isMfaRequiredError(e)) { onMfaRequired?.(); return; }
            throw e;
        }
    }

    async function del(id) {
        try {
            await apiFetch(`/admin/messages/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
            });
            m.reload();
        } catch (e) {
            if (isMfaRequiredError(e)) { onMfaRequired?.(); return; }
            throw e;
        }
    }

    async function restore(id) {
        try {
            await apiFetch(`/admin/messages/${id}/restore`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
            });
            m.reload();
        } catch (e) {
            if (isMfaRequiredError(e)) { onMfaRequired?.(); return; }
            throw e;
        }
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
        const head = ["_id", "createdAt", "name", "email", "company", "fleetSize", "read", "message", "ip", "ua"];
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
        try { await apiFetch("/admin/logout", { method: "POST", headers: { "X-CSRF-Token": csrf } }); } catch { }
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
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
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
                    <div
                        key={it._id}
                        className={[
                            "relative rounded-xl p-4 border transition-colors shadow-sm",
                            it.read
                                ? "bg-white border-slate-200 hover:shadow-md dark:bg-white/5 dark:border-white/10"
                                : "bg-emerald-50/80 border-emerald-200 hover:shadow-md dark:bg-emerald-400/10 dark:border-emerald-400/30"
                        ].join(" ")}
                    >
                        {/* unread left accent bar */}
                        {!it.read && <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-emerald-400/90" />}

                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className={it.read
                                    ? "font-medium text-slate-900 dark:text-slate-100"
                                    : "font-semibold text-emerald-950 dark:text-emerald-100"}>

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
                                {!it.read && (
                                    <span className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[11px]
                   bg-emerald-500/15 text-emerald-700 border border-emerald-500/20
                   dark:bg-emerald-400/15 dark:text-emerald-100 dark:border-emerald-400/25">
                                        Unread
                                    </span>
                                )}

                            </div>
                        </div>
                        <p className={`mt-2 text-sm whitespace-pre-wrap ${it.read ? "text-slate-700 dark:text-slate-300" : "text-slate-800 dark:text-slate-100"
                            }`}>
                            {it.message}
                        </p>

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

function AdminUsers({ onRequireMfa }) {
    const csrf = useCsrf();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // New user form state
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    async function load() {
        setLoading(true); setErr("");
        try {
            const d = await apiFetch("/admin/users");
            setItems(d.items || []);
        } catch (e) {
            setErr(e.message || "Failed to load users");
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function createUser(e) {
        e.preventDefault();
        setErr("");
        try {
            await apiFetch("/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                body: JSON.stringify({ email, name, password }),
            });
            setEmail(""); setName(""); setPassword("");
            load();
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            setErr(e.message || "Failed to create user");
        }
    }

    async function disableUser(id, disabled) {
        try {
            await apiFetch(`/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                body: JSON.stringify({ disabled }),
            });
            load();
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            setErr(e.message || "Failed to update");
        }
    }

    async function resetPassword(id) {
        const pw = prompt("Enter a new temporary password (min 8 chars):");
        if (!pw) return;
        try {
            await apiFetch(`/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                body: JSON.stringify({ password: pw }),
            });
            alert("Password updated.");
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            alert(e.message || "Failed to update password");
        }
    }

    async function resetMfa(id) {
        if (!confirm("Reset MFA for this user? They will need to re-enrol on next login.")) return;
        try {
            await apiFetch(`/admin/users/${id}/reset-mfa`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
            });
            alert("MFA reset.");
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            alert(e.message || "Failed to reset MFA");
        }
    }

    async function removeUser(id) {
        if (!confirm("Delete this user?")) return;
        try {
            await apiFetch(`/admin/users/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
            });
            load();
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            alert(e.message || "Failed to delete user");
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-3">Admin users</h2>

            <form onSubmit={createUser} className="rounded-xl border p-4 mb-4 dark:border-white/10">
                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Email</span>
                        <input className={CLS.field} type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Name</span>
                        <input className={CLS.field} value={name} onChange={e => setName(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Password</span>
                        <input className={CLS.field} type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
                    </label>
                </div>
                <div className="mt-3">
                    <button className={CLS.btnPrimary}>Add user</button>
                </div>
                {err && <div className="text-sm text-rose-600 mt-2">{err}</div>}
            </form>

            {loading ? (
                <div className="text-sm text-slate-600">Loading…</div>
            ) : (
                <div className="space-y-2">
                    {items.map(u => (
                        <div key={u._id} className="rounded-xl border p-3 flex items-center justify-between dark:border-white/10">
                            <div>
                                <div className="font-medium">{u.email}{u.name ? ` — ${u.name}` : ""}</div>
                                <div className="text-xs text-slate-500">
                                    Created {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                                    {u.lastLoginAt ? ` · Last login ${new Date(u.lastLoginAt).toLocaleString()}` : ""}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className={CLS.btnOutline} onClick={() => disableUser(u._id, !u.disabled)}>
                                    {u.disabled ? "Enable" : "Disable"}
                                </button>
                                <button className={CLS.btnOutline} onClick={() => resetPassword(u._id)}>Reset password</button>
                                <button className={CLS.btnOutline} onClick={() => resetMfa(u._id)}>Reset MFA</button>
                                <button className={CLS.btnOutline} onClick={() => removeUser(u._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <div className="text-sm text-slate-500">No admin users yet.</div>}
                </div>
            )}
        </div>
    );
}

function AdminNews({ onRequireMfa }) {
    const csrf = useCsrf();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // editor state
    const emptyForm = { _id: "", title: "", slug: "", date: new Date().toISOString().slice(0, 10), blurb: "", content: "", published: true };
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const params = useMemo(() => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (q) p.set("q", q);
        return p.toString();
    }, [page, limit, q]);

    async function load() {
        setLoading(true); setErr("");
        try {
            const d = await apiFetch(`/admin/news?${params}`);
            setItems(d.items || []); setTotal(d.total || 0);
        } catch (e) {
            setErr(e.message || "Failed to load news");
        } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, [params]);

    function startNew() { setForm({ ...emptyForm }); }
    function editItem(it) {
        setForm({
            _id: it._id,
            title: it.title || "",
            slug: it.slug || "",
            date: (it.date ? new Date(it.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
            blurb: it.blurb || "",
            content: it.content || "",
            published: !!it.published,
        });
    }

    async function save(e) {
        e.preventDefault();
        setSaving(true); setErr("");
        const body = { ...form, date: form.date };
        try {
            if (!form.slug) body.slug = slugify(form.title);
            if (form._id) {
                await apiFetch(`/admin/news/${form._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                    body: JSON.stringify(body),
                });
            } else {
                const r = await apiFetch(`/admin/news`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                    body: JSON.stringify(body),
                });
                // load created id into form for convenience
                if (r?.item?._id) setForm(f => ({ ...f, _id: r.item._id }));
            }
            await load();
        } catch (e2) {
            if (e2.status === 401 && /MFA required/i.test(e2.message || "")) { onRequireMfa?.(); return; }
            setErr(e2.message || "Save failed");
        } finally { setSaving(false); }
    }

    async function remove(id) {
        if (!confirm("Delete this story?")) return;
        try {
            await apiFetch(`/admin/news/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
            });
            if (form._id === id) startNew();
            load();
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            alert(e.message || "Delete failed");
        }
    }

    const pages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">News</h2>
                <div className="flex gap-2">
                    <input className={CLS.field} placeholder="Search title/slug/blurb…" value={q} onChange={e => setQ(e.target.value)} />
                    <button className={CLS.btnOutline} onClick={load}>{loading ? "Loading…" : "Refresh"}</button>
                    <button className={CLS.btnPrimary} onClick={startNew}>New</button>
                </div>
            </div>

            {/* Editor */}
            <form onSubmit={save} className="rounded-xl border p-4 dark:border-white/10 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Title</span>
                        <input className={CLS.field} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Slug</span>
                        <input className={CLS.field} value={form.slug} placeholder="auto-from-title" onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Date</span>
                        <input className={CLS.field} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                    </label>
                    <label className="flex items-center gap-2 mt-6">
                        <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                        <span className="text-sm">Published</span>
                    </label>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="text-xs">Blurb</span>
                    <input className={CLS.field} value={form.blurb} onChange={e => setForm(f => ({ ...f, blurb: e.target.value }))} />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-xs">Content (HTML or markdown)</span>
                    <textarea className={CLS.field + " min-h-[180px]"} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                </label>

                <div className="flex items-center gap-2">
                    <button className={CLS.btnPrimary} disabled={saving}>{saving ? "Saving…" : (form._id ? "Update" : "Create")}</button>
                    {form._id && (
                        <button type="button" className={CLS.btnOutline} onClick={() => remove(form._id)}>Delete</button>
                    )}
                    {err && <div className="text-sm text-rose-600">{err}</div>}
                </div>
            </form>

            {/* List */}
            <div className="space-y-2">
                {items.map(it => (
                    <div key={it._id} className="rounded-xl border p-3 flex items-center justify-between dark:border-white/10">
                        <div>
                            <div className="font-medium">{it.title} {it.published ? "" : <span className="text-xs text-slate-500">(unpublished)</span>}</div>
                            <div className="text-xs text-slate-500">
                                {it.slug} · {it.date ? new Date(it.date).toLocaleDateString() : "—"}
                            </div>
                            {it.blurb && <div className="text-sm mt-1 text-slate-700 dark:text-slate-300">{it.blurb}</div>}
                        </div>
                        <div className="flex gap-2">
                            <button className={CLS.btnOutline} onClick={() => editItem(it)}>Edit</button>
                            <button className={CLS.btnOutline} onClick={() => remove(it._id)}>Delete</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && !loading && <div className="text-sm text-slate-500">No news yet.</div>}
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between text-sm">
                <div>Page <b>{page}</b> of <b>{pages}</b> · Total <b>{total}</b></div>
                <div className="flex gap-2">
                    <button className={CLS.btnOutline} onClick={() => setPage(1)} disabled={page === 1}>First</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(pages)} disabled={page === pages}>Last</button>
                </div>
                <select className={CLS.field + " w-28"} value={limit} onChange={e => setLimit(parseInt(e.target.value) || 20)}>
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
            </div>
        </div>
    );
}

function RichTextEditor({ value = "", onChange, placeholder = "Type your content…" }) {
    const ref = useRef(null);
    const [showHtml, setShowHtml] = useState(false);
    const debRef = useRef(null);
    const lastValueRef = useRef(""); // track last value we wrote to DOM

    // Write prop `value` -> DOM (only when it actually changes externally)
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Only update if different from what's in the DOM to avoid caret jumps
        const domHtml = el.innerHTML;
        const next = value || "";
        if (domHtml !== next) {
            el.innerHTML = next;
            lastValueRef.current = next;
        }
    }, [value]);

    function exec(cmd, arg = null) {
        ref.current?.focus();
        document.execCommand(cmd, false, arg);
        scheduleEmit();
    }

    function makeLink() {
        const url = prompt("Enter URL (https://…):", "https://");
        if (!url) return;
        exec("createLink", url);
    }

    function handlePaste(e) {
        // Keep paste plain-text to avoid messy markup
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        document.execCommand("insertText", false, text);
        scheduleEmit();
    }

    function scheduleEmit() {
        // Debounce emitting changes to parent so React re-renders less,
        // and we don't rewrite DOM while typing.
        clearTimeout(debRef.current);
        debRef.current = setTimeout(() => {
            const html = ref.current?.innerHTML || "";
            lastValueRef.current = html;
            onChange?.(html);
        }, 200);
    }

    function handleInput() {
        scheduleEmit();
    }

    function toggleHtmlView(checked) {
        setShowHtml(checked);
        // When leaving HTML view, write the textarea value back into DOM
        if (!checked) {
            const el = ref.current;
            if (el && lastValueRef.current !== el.innerHTML) {
                el.innerHTML = lastValueRef.current;
            }
        }
    }

    return (
        <div className="rounded-xl border dark:border-white/10">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b dark:border-white/10 bg-white/60 dark:bg-white/[0.05]">
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("formatBlock", "<h1>")}>H1</button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("formatBlock", "<h2>")}>H2</button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("formatBlock", "<h3>")}>H3</button>

                <span className="w-px h-6 bg-slate-200 mx-1 dark:bg-white/10" />

                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("bold")}><b>B</b></button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("italic")}><i>I</i></button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("underline")}><u>U</u></button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("strikeThrough")}><span className="line-through">S</span></button>

                <span className="w-px h-6 bg-slate-200 mx-1 dark:bg-white/10" />

                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("insertUnorderedList")}>• List</button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("insertOrderedList")}>1. List</button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("formatBlock", "<blockquote>")}>“ Quote</button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("formatBlock", "<pre>")}>{`</>`} Code</button>

                <span className="w-px h-6 bg-slate-200 mx-1 dark:bg-white/10" />

                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={makeLink}>Link</button>
                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("unlink")}>Unlink</button>

                <span className="w-px h-6 bg-slate-200 mx-1 dark:bg-white/10" />

                <button type="button" className="px-2 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => exec("removeFormat")}>Clear</button>

                <div className="ml-auto">
                    <label className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer select-none">
                        <input type="checkbox" className="h-3.5 w-3.5" checked={showHtml} onChange={e => toggleHtmlView(e.target.checked)} />
                        Show HTML
                    </label>
                </div>
            </div>

            {/* Editor area */}
            {!showHtml ? (
                <div
                    ref={ref}
                    className="min-h-[240px] p-3 outline-none leading-7 bg-white dark:bg-white/5 prose prose-sm max-w-none dark:prose-invert"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onPaste={handlePaste}
                    data-placeholder={placeholder}
                // NOTE: do NOT set innerHTML here; we set it via useEffect to avoid caret jumps
                />
            ) : (
                <textarea
                    className="w-full min-h-[240px] p-3 outline-none ring-0 border-t dark:border-white/10 bg-white dark:bg-white/5"
                    value={lastValueRef.current}
                    onChange={(e) => {
                        lastValueRef.current = e.target.value;
                        onChange?.(e.target.value);
                    }}
                />
            )}

            <style>{`
        [contenteditable][data-placeholder]:empty:before{
          content: attr(data-placeholder);
          color: #94a3b8;
        }
      `}</style>
        </div>
    );
}


function AdminBlogs({ onRequireMfa }) {
    const csrf = useCsrf();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // editor state
    const emptyForm = {
        _id: "",
        title: "",
        slug: "",
        date: new Date().toISOString().slice(0, 10),
        blurb: "",
        content: "",
        published: true,
        author: "",
        tags: "",        // comma-separated in UI, array in DB
        heroUrl: "",
    };
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const params = useMemo(() => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (q) p.set("q", q);
        return p.toString();
    }, [page, limit, q]);

    async function load() {
        setLoading(true); setErr("");
        try {
            const d = await apiFetch(`/admin/blogs?${params}`);
            setItems(d.items || []); setTotal(d.total || 0);
        } catch (e) {
            setErr(e.message || "Failed to load blogs");
        } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, [params]);

    function startNew() { setForm({ ...emptyForm }); }
    function editItem(it) {
        setForm({
            _id: it._id,
            title: it.title || "",
            slug: it.slug || "",
            date: (it.date ? new Date(it.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
            blurb: it.blurb || "",
            content: it.content || "",
            published: !!it.published,
            author: it.author || "",
            tags: (it.tags || []).join(", "),
            heroUrl: it.heroUrl || "",
        });
    }

    async function save(e) {
        e.preventDefault();
        setSaving(true); setErr("");
        const body = {
            ...form,
            date: form.date,
            tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
        };
        try {
            if (!form.slug) body.slug = slugify(form.title);
            if (form._id) {
                await apiFetch(`/admin/blogs/${form._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                    body: JSON.stringify(body),
                });
            } else {
                const r = await apiFetch(`/admin/blogs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                    body: JSON.stringify(body),
                });
                if (r?.item?._id) setForm(f => ({ ...f, _id: r.item._id }));
            }
            await load();
        } catch (e2) {
            if (e2.status === 401 && /MFA required/i.test(e2.message || "")) { onRequireMfa?.(); return; }
            setErr(e2.message || "Save failed");
        } finally { setSaving(false); }
    }

    async function remove(id) {
        if (!confirm("Delete this blog post?")) return;
        try {
            await apiFetch(`/admin/blogs/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
            });
            if (form._id === id) startNew();
            load();
        } catch (e) {
            if (e.status === 401 && /MFA required/i.test(e.message || "")) { onRequireMfa?.(); return; }
            alert(e.message || "Delete failed");
        }
    }

    const pages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Blogs</h2>
                <div className="flex gap-2">
                    <input className={CLS.field} placeholder="Search title/slug/blurb/content/tags…" value={q} onChange={e => setQ(e.target.value)} />
                    <button className={CLS.btnOutline} onClick={load}>{loading ? "Loading…" : "Refresh"}</button>
                    <button className={CLS.btnPrimary} onClick={startNew}>New</button>
                </div>
            </div>

            {/* Editor */}
            <form onSubmit={save} className="rounded-xl border p-4 dark:border-white/10 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Title</span>
                        <input className={CLS.field} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Slug</span>
                        <input className={CLS.field} value={form.slug} placeholder="auto-from-title" onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Date</span>
                        <input className={CLS.field} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                    </label>
                    <label className="flex items-center gap-2 mt-6">
                        <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                        <span className="text-sm">Published</span>
                    </label>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Author</span>
                        <input className={CLS.field} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Tags (comma separated)</span>
                        <input className={CLS.field} placeholder="compliance, tachograph" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs">Hero image URL (optional)</span>
                        <input className={CLS.field} placeholder="https://…" value={form.heroUrl} onChange={e => setForm(f => ({ ...f, heroUrl: e.target.value }))} />
                    </label>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="text-xs">Blurb</span>
                    <input className={CLS.field} value={form.blurb} onChange={e => setForm(f => ({ ...f, blurb: e.target.value }))} />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-xs">Content</span>
                    <RichTextEditor
                        value={form.content}
                        onChange={(html) => setForm(f => ({ ...f, content: html }))}
                        placeholder="Write your post… Use the toolbar for headings, bold, lists, links, code, and more."
                    />
                </label>

                <div className="flex items-center gap-2">
                    <button className={CLS.btnPrimary} disabled={saving}>{saving ? "Saving…" : (form._id ? "Update" : "Create")}</button>
                    {form._id && <button type="button" className={CLS.btnOutline} onClick={() => remove(form._id)}>Delete</button>}
                    {err && <div className="text-sm text-rose-600">{err}</div>}
                </div>
            </form>

            {/* List */}
            <div className="space-y-2">
                {items.map(it => (
                    <div key={it._id} className="rounded-xl border p-3 flex items-center justify-between dark:border-white/10">
                        <div>
                            <div className="font-medium">{it.title} {it.published ? "" : <span className="text-xs text-slate-500">(unpublished)</span>}</div>
                            <div className="text-xs text-slate-500">
                                {it.slug} · {it.date ? new Date(it.date).toLocaleDateString() : "—"}
                                {it.author ? ` · ${it.author}` : ""}
                                {(it.tags?.length) ? ` · ${it.tags.join(", ")}` : ""}
                            </div>
                            {it.blurb && <div className="text-sm mt-1 text-slate-700 dark:text-slate-300">{it.blurb}</div>}
                        </div>
                        <div className="flex gap-2">
                            <button className={CLS.btnOutline} onClick={() => editItem(it)}>Edit</button>
                            <button className={CLS.btnOutline} onClick={() => remove(it._id)}>Delete</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && !loading && <div className="text-sm text-slate-500">No blog posts yet.</div>}
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between text-sm">
                <div>Page <b>{page}</b> of <b>{Math.max(1, Math.ceil(total / limit))}</b> · Total <b>{total}</b></div>
                <div className="flex gap-2">
                    <button className={CLS.btnOutline} onClick={() => setPage(1)} disabled={page === 1}>First</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>Next</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(Math.max(1, Math.ceil(total / limit)))} disabled={page >= Math.ceil(total / limit)}>Last</button>
                </div>
                <select className={CLS.field + " w-28"} value={limit} onChange={e => setLimit(parseInt(e.target.value) || 20)}>
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
            </div>
        </div>
    );
}


function AdminComments({ onRequireMfa }) {
    const csrf = useCsrf();

    // list state
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [q, setQ] = useState("");
    const [slug, setSlug] = useState("");
    const [approved, setApproved] = useState("false"); // "","true","false" (default pending)
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // selection
    const [selected, setSelected] = useState([]);

    const params = useMemo(() => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (q) p.set("q", q);
        if (slug) p.set("slug", slug);
        if (approved) p.set("approved", approved);
        return p.toString();
    }, [page, limit, q, slug, approved]);

    async function load() {
        setLoading(true); setErr("");
        try {
            const d = await apiFetch(`/admin/blog-comments?${params}`);
            setItems(d.items || []);
            setTotal(d.total || 0);
            setSelected([]);
        } catch (e) {
            setErr(e.message || "Failed to load comments");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, [params]);

    const pages = Math.max(1, Math.ceil(total / limit));

    function toggle(id) {
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    }
    function clearSelection() { setSelected([]); }

    async function setApprovedState(id, val) {
        try {
            await apiFetch(`/admin/blog-comments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json; charset=UTF-8", "X-CSRF-Token": csrf },
                body: JSON.stringify({ approved: !!val }),
            });
            load();
        } catch (e) {
            if (isMfaRequiredError(e)) { onRequireMfa?.(); return; }
            alert(e.message || "Failed to update");
        }
    }
    async function remove(id) {
        if (!confirm("Delete this comment?")) return;
        try {
            await apiFetch(`/admin/blog-comments/${id}`, {
                method: "DELETE",
                headers: { "X-CSRF-Token": csrf },
            });
            load();
        } catch (e) {
            if (isMfaRequiredError(e)) { onRequireMfa?.(); return; }
            alert(e.message || "Delete failed");
        }
    }

    async function bulkApprove(val) {
        for (const id of selected) {
            await setApprovedState(id, val);
        }
        clearSelection();
    }
    async function bulkDelete() {
        for (const id of selected) {
            await remove(id);
        }
        clearSelection();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Comments</h2>
                <div className="grid gap-2 sm:grid-cols-4 w-full sm:w-auto">
                    <input className={CLS.field} placeholder="Search name/email/body…" value={q} onChange={e => setQ(e.target.value)} />
                    <input className={CLS.field} placeholder="Filter by blog slug…" value={slug} onChange={e => setSlug(e.target.value)} />
                    <select className={CLS.field} value={approved} onChange={e => setApproved(e.target.value)}>
                        <option value="">All</option>
                        <option value="false">Pending</option>
                        <option value="true">Approved</option>
                    </select>
                    <div className="flex gap-2">
                        <button className={CLS.btnOutline} onClick={load}>{loading ? "Loading…" : "Refresh"}</button>
                    </div>
                </div>
            </div>

            {/* actions bar */}
            {selected.length > 0 && (
                <div className="sticky top-0 z-10 mb-3 rounded-xl border bg-white/80 backdrop-blur p-3 text-sm flex items-center justify-between dark:bg-slate-900/70 dark:border-white/10">
                    <div><strong>{selected.length}</strong> selected</div>
                    <div className="flex gap-2">
                        <button className={CLS.btnOutline} onClick={() => bulkApprove(false)}>Unapprove</button>
                        <button className={CLS.btnPrimary} onClick={() => bulkApprove(true)}>Approve</button>
                        <button className={CLS.btnOutline} onClick={bulkDelete}>Delete</button>
                        <button className={CLS.btnOutline} onClick={clearSelection}>Clear</button>
                    </div>
                </div>
            )}

            {err && <div className="text-sm text-rose-600">{err}</div>}

            {/* list */}
            <div className="space-y-2">
                {items.map(c => (
                    <div key={c._id} className="rounded-xl border p-3 flex items-start justify-between gap-3 dark:border-white/10">
                        <div>
                            <div className="text-sm font-medium">
                                {c.name} {c.email ? <span className="text-slate-500">· {c.email}</span> : null}
                                {!c.approved && <span className="ml-2 text-[11px] rounded-full px-2 py-0.5 bg-amber-500/15 text-amber-700 border border-amber-500/20 dark:bg-amber-400/15 dark:text-amber-100 dark:border-amber-400/25">Pending</span>}
                            </div>
                            <div className="text-xs text-slate-500">
                                {c.slug} · {new Date(c.createdAt).toLocaleString()}
                            </div>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{c.body}</p>
                            <div className="mt-1 text-[11px] text-slate-400">
                                IP: {c.ip || "—"} · UA: {c.ua ? c.ua.slice(0, 80) : "—"}
                            </div>
                        </div>
                        <div className="flex gap-2 items-start">
                            {c.approved ? (
                                <button className={CLS.btnOutline} onClick={() => setApprovedState(c._id, false)}>Unapprove</button>
                            ) : (
                                <button className={CLS.btnPrimary} onClick={() => setApprovedState(c._id, true)}>Approve</button>
                            )}
                            <button className={CLS.btnOutline} onClick={() => remove(c._id)}>Delete</button>
                            <input type="checkbox" className="h-4 w-4 mt-2" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} />
                        </div>
                    </div>
                ))}
                {!loading && items.length === 0 && <div className="text-sm text-slate-500">No comments found.</div>}
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between text-sm">
                <div>Page <b>{page}</b> of <b>{pages}</b> · Total <b>{total}</b></div>
                <div className="flex gap-2">
                    <button className={CLS.btnOutline} onClick={() => setPage(1)} disabled={page === 1}>First</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
                    <button className={CLS.btnOutline} onClick={() => setPage(pages)} disabled={page === pages}>Last</button>
                </div>
                <select className={CLS.field + " w-28"} value={limit} onChange={e => setLimit(parseInt(e.target.value) || 20)}>
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
            </div>
        </div>
    );
}

function AdminAuthLogs() {
  const csrf = useCsrf();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (q) p.set("q", q);
    return p.toString();
  }, [page, limit, q]);

  async function load() {
    setLoading(true); setErr("");
    try {
      const d = await apiFetch(`/admin/auth-logs?${params}`);
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (e) {
      setErr(e.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [params]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Login Attempts</h2>
        <div className="flex gap-2">
          <input
            className={CLS.field}
            placeholder="Search email/ip/reason…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button className={CLS.btnOutline} onClick={load}>{loading ? "Loading…" : "Refresh"}</button>
        </div>
      </div>

      {err && <div className="text-sm text-rose-600">{err}</div>}

      <div className="overflow-x-auto rounded-xl border dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">UA</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr key={log._id} className="border-t dark:border-white/10">
                <td className="px-3 py-1">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-3 py-1">{log.email}</td>
                <td className="px-3 py-1">{log.ip}</td>
                <td className="px-3 py-1 text-xs text-slate-500 max-w-[240px] truncate">{log.ua}</td>
                <td className={`px-3 py-1 font-medium ${log.success ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                  {log.success ? "✅ Success" : "❌ Failed"}
                </td>
                <td className="px-3 py-1 text-xs text-slate-500">{log.reason || "—"}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan="6" className="text-center py-4 text-slate-500">No login attempts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div>Page <b>{page}</b> of <b>{pages}</b> · Total <b>{total}</b></div>
        <div className="flex gap-2">
          <button className={CLS.btnOutline} onClick={() => setPage(1)} disabled={page === 1}>First</button>
          <button className={CLS.btnOutline} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
          <button className={CLS.btnOutline} onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages}>Next</button>
          <button className={CLS.btnOutline} onClick={() => setPage(pages)} disabled={page === pages}>Last</button>
        </div>
      </div>
    </div>
  );
}



// ---------- Root component exported ----------
export default function Admin() {
    const [authed, setAuthed] = useState(false);
    const [checking, setChecking] = useState(true);
    const [mfaNeeded, setMfaNeeded] = useState(false);
    const [enrolled, setEnrolled] = useState(true);
    const [tab, setTab] = useState("messages"); // <— NEW
    const csrf = useCsrf();


    useEffect(() => {
        apiFetch("/admin/messages?page=1&limit=1")
            .then(() => { setAuthed(true); setMfaNeeded(false); })
            .catch(() => { setAuthed(false); })
            .finally(() => setChecking(false));
    }, []);

    function handleLoggedIn(result) {
        if (result?.mfaRequired) {
            setMfaNeeded(true);
            setEnrolled(!!result.enrolled);
            setAuthed(false);
        } else {
            setAuthed(true);
        }
    }

    if (!API_ROOT) {
        return <div className="max-w-xl mx-auto p-6">
            <h1 className="text-xl font-semibold">Admin</h1>
            <p className="mt-2 text-rose-600">VITE_API_BASE is not configured.</p>
        </div>;
    }

    if (checking) {
        return <div className="max-w-xl mx-auto p-6">
            <p className="text-sm text-slate-600">Checking session…</p>
        </div>;
    }

    if (mfaNeeded) {
        return <MfaBox initiallyEnrolled={enrolled} onDone={() => { setMfaNeeded(false); setAuthed(true); }} />;
    }

    if (!authed) return <AdminLogin onLoggedIn={handleLoggedIn} />;

    // --- When authed, render top tabs + panel ---
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-2">
                <button className={(tab === "messages" ? CLS.btnPrimary : CLS.btnOutline)} onClick={() => setTab("messages")}>Messages</button>
                <button className={(tab === "users" ? CLS.btnPrimary : CLS.btnOutline)} onClick={() => setTab("users")}>Users</button>
                <button className={(tab === "news" ? CLS.btnPrimary : CLS.btnOutline)} onClick={() => setTab("news")}>News</button>
                <button className={(tab === "blogs" ? CLS.btnPrimary : CLS.btnOutline)} onClick={() => setTab("blogs")}>Blogs</button>
                <button className={(tab === "comments" ? CLS.btnPrimary : CLS.btnOutline)} onClick={() => setTab("comments")}>Comments</button>
                <button className={(tab === "authlogs" ? CLS.btnPrimary : CLS.btnOutline)} onClick={() => setTab("authlogs")}>Login Logs</button>



            </div>

            {tab === "messages" ? (
                <AdminMessages onLoggedOut={() => setAuthed(false)} onMfaRequired={() => setMfaNeeded(true)} />
            ) : tab === "users" ? (
                <AdminUsers onRequireMfa={() => setMfaNeeded(true)} />
            ) : tab === "news" ? (
                <AdminNews onRequireMfa={() => setMfaNeeded(true)} />
            ) : tab === "blogs" ? (
                <AdminBlogs onRequireMfa={() => setMfaNeeded(true)} />
            ) : tab === "comments" ? (
                <AdminComments onRequireMfa={() => setMfaNeeded = true} />
            ) : (
                <AdminAuthLogs />
            )}


        </div>
    );
}
