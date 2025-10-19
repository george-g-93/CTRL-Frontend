import CTRLMark from "./CTRLMark.jsx";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Footer() {
    return (
        <footer className="border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <Logo className="h-12" alt="CTRL Compliance" />
                    <div className="text-sm text-slate-400">
                        © {new Date().getFullYear()} CTRL. All rights reserved.
                    </div>
                </div>
                <div className="flex gap-6 text-sm text-slate-400">
                    <Link className="hover:text-emerald-700 dark:hover:text-emerald-300" to="/privacy">Privacy</Link>
                    <Link className="hover:text-emerald-700 dark:hover:text-emerald-300" to="/terms">Terms</Link>
                    <Link className="hover:text-emerald-700 dark:hover:text-emerald-300" to="/cookies">Cookies</Link>
                </div>
            </div>
        </footer>
    );
}
