// FILE: src/pages/Cookies.jsx
export default function Cookies() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Cookies</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-8 rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-slate-700 dark:text-slate-200">
          Cookies are small text files placed on your device. We use them to run the site and
          understand how it’s used. You can block cookies in your browser settings, but some features may
          not work correctly.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <CookieCard
          title="Essential"
          examples={["Session state", "Security features"]}
          desc="Required for the site to function. Cannot be switched off."
        />
        <CookieCard
          title="Analytics"
          examples={["Page views", "Referrers"]}
          desc="Helps us improve the site by understanding anonymised usage."
        />
        <CookieCard
          title="Preferences"
          examples={["Theme (light/dark)"]}
          desc="Remembers your settings to give a consistent experience."
        />
      </div>

      <div className="mt-6 rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold">Managing cookies</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-200">
          Most browsers let you block or delete cookies. Look for options under Privacy or Site Settings.
          If we add non-essential cookies (e.g., new analytics), we’ll update this page.
        </p>
      </div>
    </section>
  );
}

function CookieCard({ title, examples, desc }) {
  return (
    <div className="rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-slate-700 dark:text-slate-200 text-sm">{desc}</p>
      <ul className="mt-3 list-disc pl-5 text-slate-700 dark:text-slate-200 text-sm space-y-1">
        {examples.map((e) => <li key={e}>{e}</li>)}
      </ul>
    </div>
  );
}
