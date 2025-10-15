// FILE: src/pages/Terms.jsx
export default function Terms() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-8 space-y-6">
        <Card title="Acceptance of terms">
          By using this website, you agree to these Terms. If you do not agree, please do not use the site.
        </Card>

        <Card title="Website content">
          We aim to keep content accurate and current, but it’s provided “as is” without warranties.
          Nothing here constitutes professional or legal advice.
        </Card>

        <Card title="Use of the site">
          Use this site lawfully and responsibly. Do not attempt to disrupt, reverse engineer, or
          gain unauthorised access to any part of the service.
        </Card>

        <Card title="Third-party links">
          Our site may link to third-party sites. We are not responsible for their content or practices.
        </Card>

        <Card title="Limitation of liability">
          We will not be liable for any indirect, incidental, or consequential damages arising from your
          use of (or inability to use) the site.
        </Card>

        <Card title="Changes">
          We may update these Terms from time to time. Continued use of the site means you accept the revised terms.
        </Card>

        <Card title="Contact">
          Questions about these Terms? Email{" "}
          <a className="text-emerald-700 dark:text-emerald-300 hover:underline" href="mailto:hello@ctrl-compliance.co.uk">
            hello@ctrl-compliance.co.uk
          </a>.
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-700 dark:text-slate-200">{children}</p>
    </div>
  );
}
