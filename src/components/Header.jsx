import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import CTRLMark from "./CTRLMark.jsx";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [open, setOpen] = useState(false);
    const loc = useLocation();

    // Close menu on route change
    useEffect(() => { setOpen(false); }, [loc.pathname]);

    // Lock background scroll when menu is open
    useEffect(() => {
        const b = document.body;
        if (!open) return;
        const prev = b.style.overflow;
        b.style.overflow = "hidden";
        return () => { b.style.overflow = prev; };
    }, [open]);

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <CTRLMark />
                    <span className="font-semibold tracking-widest text-slate-100">CTRL</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
                    <NavLink to="/" end className={({ isActive }) => isActive ? "text-emerald-300" : "hover:text-emerald-300"}>Home</NavLink>
                    <NavLink to="/news" className={({ isActive }) => isActive ? "text-emerald-300" : "hover:text-emerald-300"}>News</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "text-emerald-300" : "hover:text-emerald-300"}>About us</NavLink>
                    <a href="/#services" className="hover:text-emerald-300">Services</a>
                    <a href="/#process" className="hover:text-emerald-300">Process</a>
                    <a href="/#contact" className="hover:text-emerald-300">Contact</a>
                </nav>

                <div className="hidden md:block">
                    <a href="/#contact" className="btn-outline">Book a call</a>
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
                    aria-controls="mobile-menu"
                    aria-expanded={open}
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen(v => !v)}
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Render backdrop + drawer at <body> level so nothing bleeds through */}
            {typeof document !== "undefined" && createPortal(
                <>
                    {/* Backdrop — solid and dark */}
                    <div
                        className={`fixed inset-0 z-[9998] bg-black/90 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                        onClick={() => setOpen(false)}
                    />

                    {/* Panel — fully opaque */}
                    <div
                        id="mobile-menu"
                        className={`fixed right-0 top-0 z-[9999] h-full w-80 max-w-[85%] transform border-l border-white/10 shadow-2xl
              ${open ? "translate-x-0" : "translate-x-full"} transition-transform`}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="relative h-full bg-slate-950">
                            {/* optional decorative gradient—kept subtle and does NOT reduce opacity */}
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,rgba(16,185,129,0.15),transparent)]" />

                            <div className="relative px-5 py-4 flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <CTRLMark small />
                                    <span className="font-semibold tracking-widest text-slate-100">CTRL</span>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 transition"
                                    aria-label="Close menu"
                                    onClick={() => setOpen(false)}
                                >
                                    <X className="h-5 w-5 text-slate-100" />
                                </button>
                            </div>

                            <nav className="relative px-5 py-4 text-sm">
                                <MobileItem to="/" onSelect={() => setOpen(false)}>Home</MobileItem>
                                <MobileItem to="/news" onSelect={() => setOpen(false)}>News</MobileItem>
                                <MobileItem to="/about" onSelect={() => setOpen(false)}>About us</MobileItem>

                                <div className="mt-3 h-px bg-white/10" />

                                {/* Hash links stay on the same route, so we MUST close explicitly */}
                                <MobileA href="/#services" onSelect={() => setOpen(false)}>Services</MobileA>
                                <MobileA href="/#process" onSelect={() => setOpen(false)}>Process</MobileA>
                                <MobileA href="/#contact" onSelect={() => setOpen(false)}>Contact</MobileA>

                                <div className="mt-6">
                                    <a
                                        href="/#contact"
                                        className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/25 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-400/30 transition"
                                        onClick={() => setOpen(false)}
                                    >
                                        Book a call
                                    </a>
                                </div>
                            </nav>

                        </div>
                    </div>
                </>,
                document.body
            )}
        </header>
    );
}

/* ---------- helpers ---------- */
function MobileItem({ to, children, onSelect }) {
  return (
    <NavLink
      to={to}
      onClick={onSelect} // closes even if the route is the same
      className={({ isActive }) =>
        "block rounded-lg px-3 py-2 " +
        (isActive ? "text-emerald-200 bg-white/[0.08]" : "text-slate-100 hover:bg-white/[0.06]")
      }
      end
    >
      {children}
    </NavLink>
  );
}

function MobileA({ href, children, onSelect }) {
  return (
    <a
      href={href}
      onClick={() => onSelect?.()} // close on hash-link taps
      className="block rounded-lg px-3 py-2 text-slate-100 hover:bg-white/[0.06]"
    >
      {children}
    </a>
  );
}
