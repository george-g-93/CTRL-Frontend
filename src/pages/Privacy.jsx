// FILE: src/pages/Privacy.jsx
export default function Privacy() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-8 rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold">How we use your data</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-200">
          We process personal data only to respond to enquiries, deliver services, and improve our site.
          We keep data minimal, relevant, and for no longer than necessary.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">What we collect</h3>
          <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-200 space-y-1">
            <li>Contact details (name, email, phone, company)</li>
            <li>Messages you send via forms or email</li>
            <li>Basic analytics (pages visited, device/browser)</li>
          </ul>
        </div>
        <div className="rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">Why we collect it</h3>
          <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-200 space-y-1">
            <li>To reply to enquiries and deliver work</li>
            <li>To maintain security and site performance</li>
            <li>To understand what content is helpful</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <h3 className="text-lg font-semibold">Sharing & retention</h3>
        <p className="mt-2 text-slate-700 dark:text-slate-200">
          We never sell your data. We may share it with trusted service providers (e.g., hosting,
          analytics) only where necessary and under appropriate safeguards. We retain data only as long
          as needed for the purpose collected or to meet legal requirements.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <h3 className="text-lg font-semibold">Your rights</h3>
        <p className="mt-2 text-slate-700 dark:text-slate-200">
          You can request access, correction, deletion, or restriction of your personal data. To exercise
          these rights, contact us at{" "}
          <a className="text-emerald-700 dark:text-emerald-300 hover:underline" href="mailto:hello@ctrl-compliance.co.uk">
            hello@ctrl-compliance.co.uk
          </a>.
        </p>
      </div>
    </section>
  );
}
