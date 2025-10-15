import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, ClipboardCheck, Truck, FileSpreadsheet,
  TimerReset, ArrowRight, Phone, Mail, CheckCircle2,
  Building2, LineChart, BookOpenCheck
} from "lucide-react";

/* Utility classes injected once (so this page is self-contained) */
const styles = `
.btn-primary { @apply inline-flex items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/20 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-400/25 transition; }
.btn-outline { @apply inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 transition; }
.field { @apply w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-400/40 focus:bg-white/10; }
`;
if (typeof document !== "undefined" && !document.getElementById("ctrl-styles")) {
  const style = document.createElement("style");
  style.id = "ctrl-styles";
  style.innerHTML = styles;
  document.head.appendChild(style);
}

export default function Home() {
  const features = [
    { icon: <ShieldCheck className="h-6 w-6" aria-hidden />, title: "Operator Licence Support", desc: "Policies, systems, and evidence packs aligned to DVSA expectations." },
    { icon: <ClipboardCheck className="h-6 w-6" aria-hidden />, title: "Independent Compliance Audits", desc: "End-to-end reviews of maintenance, drivers’ hours, and record-keeping." },
    { icon: <FileSpreadsheet className="h-6 w-6" aria-hidden />, title: "Tachograph & Working Time Analysis", desc: "Infringement detection and corrective actions." },
    { icon: <TimerReset className="h-6 w-6" aria-hidden />, title: "Earned Recognition Readiness", desc: "Gap analysis and continuous monitoring to stay audit-ready." },
    { icon: <Truck className="h-6 w-6" aria-hidden />, title: "Maintenance & Defect Systems", desc: "Robust PMI, defect, and recall controls." },
    { icon: <BookOpenCheck className="h-6 w-6" aria-hidden />, title: "Training & Toolbox Talks", desc: "Practical sessions for drivers and transport managers." },
  ];
  const steps = [
    { k: "01", title: "Discovery", desc: "Short scoping call to understand your operation, risks, and goals." },
    { k: "02", title: "Audit & Action Plan", desc: "On-site/remote audit with a prioritized roadmap." },
    { k: "03", title: "Embed & Monitor", desc: "Implement controls, train teams, and set up checks." },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="from-emerald-500/10 via-cyan-500/10 to-transparent bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] h-[60rem] w-[60rem] blur-3xl translate-x-1/2 -translate-y-1/3 opacity-70" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 sm:pt-28">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge>Transport Auditing & Compliance</Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                CTRL keeps your fleet
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                  compliant, audit-ready, and in control
                </span>
              </h1>
              <p className="mt-6 text-slate-300 max-w-xl">
                We help transport operators build practical systems that pass scrutiny—without slowing the operation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <CTAButton primary>Book an intro call</CTAButton>
                <CTAButton>See audit checklist</CTAButton>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> UK-wide</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> SME to enterprise</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Confidential & independent</div>
              </div>
            </div>
            <HeroCard />
          </motion.div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-sm text-slate-400 mb-6">Trusted by operations across logistics, retail, construction, and field services</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 opacity-70">
          {[Building2, Truck, LineChart, ShieldCheck, ClipboardCheck, FileSpreadsheet].map((I, idx) => (
            <div key={idx} className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-4">
              <I className="h-6 w-6" />
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="services">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold">What we do</h2>
            <p className="mt-2 text-slate-400">Audits, advice, and embedded systems for sustained compliance.</p>
          </div>
          <a href="#contact" className="text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-2 text-sm">
            Talk to an expert <ArrowRight className="h-4 w-4"/>
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="process">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">How engagement works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-6"
            >
              <div className="text-sm text-slate-400">{s.k}</div>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-slate-300 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-12">
          <p className="text-slate-200 text-lg leading-relaxed">
            “CTRL helped us turn a patchwork of spreadsheets into a clean, auditable system.”
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
            <div className="h-9 w-9 rounded-full bg-emerald-400/20 border border-white/10" />
            <div>
              <div className="text-slate-200 font-medium">Ops Manager, National Haulier</div>
              <div>Name withheld by request</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">
          <ContactCard />
          <HomeContactForm />
        </div>
      </section>
    </>
  );
}

/* ---------- bits local to Home ---------- */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {children}
    </span>
  );
}
function CTAButton({ children, primary }) {
  return <button className={primary ? "btn-primary" : "btn-outline"}>{children}</button>;
}
function HomeContactForm() {
  const [email, setEmail] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); alert(`Thanks! We'll be in touch at: ${email}`); setEmail(""); }}
      className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name"><input required className="field" placeholder="Alex Smith" /></Field>
        <Field label="Company"><input className="field" placeholder="Acme Logistics" /></Field>
        <Field label="Email"><input type="email" required className="field" placeholder="you@company.co.uk" value={email} onChange={(e)=>setEmail(e.target.value)} /></Field>
        <Field label="Fleet size">
          <select className="field"><option>1–10</option><option>11–50</option><option>51–150</option><option>151+</option></select>
        </Field>
        <Field label="What do you need?" full><textarea rows={5} className="field" placeholder="Audit, tachograph analysis, training, ER readiness..." /></Field>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">By submitting, you agree to be contacted about CTRL services.</p>
        <button className="btn-primary">Send enquiry</button>
      </div>
    </form>
  );
}
function Field({ label, children, full }) {
  return (
    <label className={(full ? "sm:col-span-2 " : "") + "flex flex-col gap-2"}>
      <span className="text-xs text-slate-300">{label}</span>
      {children}
    </label>
  );
}
function ContactCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <h3 className="text-2xl font-semibold">Speak with CTRL</h3>
      <p className="mt-2 text-slate-300 text-sm">Tell us a bit about your operation and we’ll suggest a sensible starting point.</p>
      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-300">
        <a className="inline-flex items-center gap-2 hover:text-emerald-300" href="tel:+440000000000"><Phone className="h-4 w-4"/> +44 (0)00 0000 0000</a>
        <a className="inline-flex items-center gap-2 hover:text-emerald-300" href="mailto:hello@ctrl-compliance.co.uk"><Mail className="h-4 w-4"/> hello@ctrl-compliance.co.uk</a>
      </div>
    </div>
  );
}
function HeroCard() {
  const items = [
    { label: "Audit scope", value: "Drivers’ hours • WTD • PMIs • Defects" },
    { label: "Outputs", value: "Findings • Risk score • Action plan" },
    { label: "Follow-up", value: "Training • SOPs • Monitoring" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-6 md:p-8">
      <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-400/20 border border-white/10">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-slate-300">CTRL Audit Overview</div>
          <div className="text-lg font-semibold">What you can expect</div>
        </div>
      </div>
      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 overflow-hidden">
        {items.map((it) => (
          <div key={it.label} className="grid grid-cols-3 gap-3 bg-white/[0.02] p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400">{it.label}</div>
            <div className="col-span-2 text-sm text-slate-200">{it.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-400">No-nonsense reporting. Practical fixes.</div>
        <a href="#services" className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200">Explore services <ArrowRight className="h-4 w-4"/></a>
      </div>
    </motion.div>
  );
}
