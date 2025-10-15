import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-sm uppercase tracking-widest text-slate-400">404</p>
      <h1 className="mt-2 text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-slate-400">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 transition"
        >
          Go Home
        </Link>
        <Link
          to="/news"
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/20 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-400/25 transition"
        >
          View News
        </Link>
      </div>
    </section>
  );
}
