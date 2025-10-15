import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import CTRLMark from "./CTRLMark.jsx";
import { Menu, X, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider.jsx";
import Logo from "./Logo.jsx";


// FILE: src/components/Header.jsx
// …imports unchanged…
export default function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { theme, setTheme, toggleTheme } = useTheme();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const b = document.body;
    if (!open) return;
    const prev = b.style.overflow;
    b.style.overflow = "hidden";
    return () => { b.style.overflow = prev; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/*
        <Link to="/" className="flex items-center gap-3 group">
          <CTRLMark />
          <span className="font-semibold tracking-widest">CTRL</span>
        </Link>
        */}

        <Logo className="h-12" alt="CTRL Compliance" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 dark:text-slate-300">
          <NavLink to="/" end className={({ isActive }) => isActive ? "text-emerald-700 dark:text-emerald-300" : "hover:text-emerald-700 dark:hover:text-emerald-300"}>Home</NavLink>
          <NavLink to="/news" className={({ isActive }) => isActive ? "text-emerald-700 dark:text-emerald-300" : "hover:text-emerald-700 dark:hover:text-emerald-300"}>News</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "text-emerald-700 dark:text-emerald-300" : "hover:text-emerald-700 dark:hover:text-emerald-300"}>About us</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? "text-emerald-700 dark:text-emerald-300" : "hover:text-emerald-700 dark:hover:text-emerald-300"}>Services</NavLink>
          <a href="/#process" className="hover:text-emerald-700 dark:hover:text-emerald-300">Process</a>
          <a href="/#contact" className="hover:text-emerald-700 dark:hover:text-emerald-300">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitch theme={theme} setTheme={setTheme} toggleTheme={toggleTheme} />
          <div className="hidden md:block">
            <a href="/#contact" className="btn-outline">Book a call</a>
          </div>
          {/* Keep ONE mobile toggle only */}
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border
                       border-slate-300 bg-white hover:bg-slate-50
                       dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15 transition"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Drawer in portal */}
      {typeof document !== "undefined" && createPortal(
        <>
          <div
            className={`fixed inset-0 z-[9998] bg-black/90 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            className={`fixed right-0 top-0 z-[9999] h-full w-80 max-w-[85%] transform
                        border-l border-slate-200 bg-white text-slate-900 shadow-2xl
                        dark:border-white/10 dark:bg-slate-950 dark:text-slate-100
                        ${open ? "translate-x-0" : "translate-x-full"} transition-transform`}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <CTRLMark small />
                <span className="font-semibold tracking-widest">CTRL</span>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border
                           border-slate-300 bg-white hover:bg-slate-50
                           dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15 transition"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="px-5 py-4 text-sm">
              <MobileItem to="/" onSelect={() => setOpen(false)}>Home</MobileItem>
              <MobileItem to="/news" onSelect={() => setOpen(false)}>News</MobileItem>
              <MobileItem to="/services" onSelect={() => setOpen(false)}>Services</MobileItem>
              <MobileItem to="/about" onSelect={() => setOpen(false)}>About us</MobileItem>

              <div className="mt-3 h-px bg-slate-200 dark:bg-white/10" />

              <MobileA href="/#process" onSelect={() => setOpen(false)}>Process</MobileA>
              <MobileA href="/#contact" onSelect={() => setOpen(false)}>Contact</MobileA>

              <div className="mt-6">
                <a
                  href="/#contact"
                  className="inline-flex w-full items-center justify-center rounded-xl border
                             border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15
                             dark:border-emerald-400/30 dark:bg-emerald-400/20 dark:text-emerald-200 dark:hover:bg-emerald-400/25 px-4 py-2 text-sm font-medium transition"
                  onClick={() => setOpen(false)}
                >
                  Book a call
                </a>
              </div>
            </nav>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}

// helpers unchanged except for theme-aware hover colors:
function MobileItem({ to, children, onSelect }) {
  return (
    <NavLink
      to={to}
      onClick={onSelect}
      className={({ isActive }) =>
        "block rounded-lg px-3 py-2 " +
        (isActive
          ? "bg-slate-100 text-emerald-700 dark:bg-white/[0.08] dark:text-emerald-200"
          : "hover:bg-slate-100 text-slate-900 dark:text-slate-100 dark:hover:bg-white/[0.06]")
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
      onClick={() => onSelect?.()}
      className="block rounded-lg px-3 py-2 hover:bg-slate-100 text-slate-900 dark:text-slate-100 dark:hover:bg-white/[0.06]"
    >
      {children}
    </a>
  );
}


function ThemeSwitch({ theme, setTheme, toggleTheme }) {
  // Compact control that cycles with click; right-click (or menu) allows explicit pick
  const icon =
    theme === "dark" ? <Moon className="h-4 w-4" /> :
    theme === "light" ? <Sun className="h-4 w-4" /> :
    <Laptop className="h-4 w-4" />;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleTheme}
        title={`Theme: ${theme}`}
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
      >
        {icon}
        <span className="hidden sm:inline">{theme[0].toUpperCase() + theme.slice(1)}</span>
      </button>
      {/* Simple flyout on hover (optional): keep it super light to avoid extra libs */}
      <div className="group inline-block relative">
        <button className="sr-only">Theme menu</button>
        <div className="absolute right-0 mt-1 hidden group-hover:block z-[10000] rounded-xl border border-white/10 bg-slate-950 p-1 text-xs shadow-xl w-36">
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/[0.06]" onClick={() => setTheme("system")}>
            <span className="inline-flex items-center gap-2"><Laptop className="h-3.5 w-3.5" /> System</span>
          </button>
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/[0.06]" onClick={() => setTheme("light")}>
            <span className="inline-flex items-center gap-2"><Sun className="h-3.5 w-3.5" /> Light</span>
          </button>
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/[0.06]" onClick={() => setTheme("dark")}>
            <span className="inline-flex items-center gap-2"><Moon className="h-3.5 w-3.5" /> Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
}
