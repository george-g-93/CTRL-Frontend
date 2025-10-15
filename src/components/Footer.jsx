import CTRLMark from "./CTRLMark.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <CTRLMark small />
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} CTRL. All rights reserved.
          </div>
        </div>
        <div className="flex gap-6 text-sm text-slate-400">
          <a className="hover:text-emerald-300" href="#">Privacy</a>
          <a className="hover:text-emerald-300" href="#">Terms</a>
          <a className="hover:text-emerald-300" href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
