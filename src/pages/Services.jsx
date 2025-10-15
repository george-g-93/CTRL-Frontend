// FILE: src/pages/Services.jsx
import { motion } from "framer-motion";
import {
  ShieldCheck, ClipboardCheck, FileSpreadsheet, Truck, TimerReset, BookOpenCheck, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    id: "operator-licence",
    icon: ShieldCheck,
    title: "Operator Licence Support",
    summary: "Policies, systems, and evidence packs aligned to DVSA expectations.",
    bullets: [
      "Undertakings mapping & risk register",
      "Policy suite (maintenance, drivers, incident, recalls)",
      "Evidence pack setup & review cadence",
    ],
    outcomes: [
      "Clear accountability & audit trails",
      "Reduced regulatory risk",
      "Confidence before and during inspections",
    ],
  },
  {
    id: "audits",
    icon: ClipboardCheck,
    title: "Independent Compliance Audits",
    summary: "End-to-end review of maintenance, drivers’ hours, WTD, and record-keeping.",
    bullets: [
      "On-site or remote sampling",
      "Findings report with risk scoring",
      "Prioritised action plan & retest",
    ],
    outcomes: [
      "Objective view of current risk",
      "Practical, sequenced fixes",
      "Easier stakeholder sign-off",
    ],
  },
  {
    id: "tacho",
    icon: FileSpreadsheet,
    title: "Tachograph & Working Time Analysis",
    summary: "Detect infringements, find root causes, and prevent repeat issues.",
    bullets: [
      "Weekly/Monthly analysis & exception reporting",
      "Driver debrief workflow & sign-off",
      "Trend dashboards for TM/ops",
    ],
    outcomes: [
      "Fewer repeat infringements",
      "Stronger driver engagement",
      "Better planning decisions",
    ],
  },
  {
    id: "maintenance-defects",
    icon: Truck,
    title: "Maintenance & Defect Systems",
    summary: "Robust PMI, defect, recall and MOT controls sized to your fleet.",
    bullets: [
      "PMI schedule & variance tracking",
      "Defect reporting and close-out controls",
      "Recall & VOR process integration",
    ],
    outcomes: [
      "Cleaner OCRS trajectory",
      "Less downtime, better compliance",
      "Evidence ready for audits",
    ],
  },
  {
    id: "earned-recognition",
    icon: TimerReset,
    title: "Earned Recognition Readiness",
    summary: "Gap analysis and continuous monitoring against ER KPIs.",
    bullets: [
      "KPI mapping & data flow check",
      "Exception handling SOPs",
      "Mock assessment & documentation",
    ],
    outcomes: [
      "Predictable performance to target",
      "Faster issue resolution",
      "Confidence to pursue ER status",
    ],
  },
  {
    id: "training",
    icon: BookOpenCheck,
    title: "Training & Toolbox Talks",
    summary: "Short, practical sessions for drivers, planners, and transport managers.",
    bullets: [
      "Drivers’ hours & WTD refresher",
      "Defect reporting done right",
      "TM responsibilities & oversight",
    ],
    outcomes: [
      "Higher awareness on the floor",
      "Less corrective firefighting",
      "Sustained standards",
    ],
  },
];

export default function Services() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Services</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            Deeper detail on what we deliver, what’s included, and the outcomes you should expect.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {services.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-xl border px-3 py-1
                border-slate-200 bg-white text-slate-900 hover:bg-slate-50
                dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Service cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.section
              id={s.id}
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border p-6
                border-slate-200 bg-white shadow-sm
                dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 flex items-center justify-center rounded-xl
                  border border-slate-200 bg-slate-50
                  dark:border-white/10 dark:bg-emerald-400/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{s.summary}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4
                  border-slate-200 bg-slate-50
                  dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-sm font-semibold">What’s included</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {s.bullets.map(b => <li key={b}>• {b}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border p-4
                  border-slate-200 bg-slate-50
                  dark:border-white/10 dark:bg-white/10">
                  <h3 className="text-sm font-semibold">Expected outcomes</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {s.outcomes.map(b => <li key={b}>• {b}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <a
                  href="/#contact"
                  className="inline-flex items-center gap-2 text-sm
                    text-emerald-700 hover:text-emerald-600
                    dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  Book a call <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/about"
                  className="text-sm rounded-xl border px-3 py-2
                    border-slate-300 bg-white hover:bg-slate-50
                    dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Learn about us
                </Link>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Process recap */}
      <div className="mt-12 rounded-2xl border p-6
        border-slate-200 bg-white shadow-sm
        dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold">How engagement works</h2>
        <ol className="mt-3 grid gap-4 md:grid-cols-3 text-sm">
          <li className="rounded-xl border p-4 border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">01</div>
            <div className="font-medium">Discovery</div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Short scoping call to understand operation, risks, goals.</p>
          </li>
          <li className="rounded-xl border p-4 border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">02</div>
            <div className="font-medium">Audit & Action Plan</div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Sampling, findings, risk score, and a prioritised plan.</p>
          </li>
          <li className="rounded-xl border p-4 border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">03</div>
            <div className="font-medium">Embed & Monitor</div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Train teams, embed controls, then monitor and refine.</p>
          </li>
        </ol>
      </div>

      {/* FAQ (optional quick answers) */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">How do you price?</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Fixed-fee for defined projects, or a monthly retainer for ongoing monitoring and analysis. We’ll suggest the leanest option that still keeps you safe.
          </p>
        </div>
        <div className="rounded-2xl border p-6 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">Can you work UK-wide?</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Yes—onsite or remote. We plan fieldwork to minimise disruption and keep costs sensible.
          </p>
        </div>
      </div>
    </section>
  );
}
