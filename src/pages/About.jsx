export default function About() {
  const points = [
    { h: "Independent & practical", p: "We’re auditors who’ve sat in the transport office. We build controls that actually work." },
    { h: "Across fleet sizes", p: "From 3 vans to 300 artics—our approach scales without the bureaucracy." },
    { h: "Outcome-focused", p: "Fewer infringements, cleaner records, calmer inspections." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">About CTRL</h1>
      <p className="mt-2 text-slate-400 max-w-2xl">
        We help operators stay audit-ready with clear processes, bite-size training, and steady monitoring.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {points.map((x) => (
          <div key={x.h} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-lg font-semibold">{x.h}</h3>
            <p className="mt-2 text-sm text-slate-300">{x.p}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h2 className="text-2xl font-semibold">Our story</h2>
        <p className="mt-2 text-slate-300 text-sm max-w-3xl">
          CTRL started as a tidy-up project for one fleet’s paperwork. It grew into a set of tools and habits that make
          compliance less chaotic. We now support operators UK-wide with audits, tachograph analysis, and operator-licence systems.
        </p>
      </div>
    </section>
  );
}
