// FILE: src/pages/Home.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, ClipboardCheck, Truck, FileSpreadsheet,
  TimerReset, ArrowRight, Phone, Mail, CheckCircle2,
  Building2, LineChart, BookOpenCheck
} from "lucide-react";

/* Theme-aware utility classes injected once */
const styles = `
.btn-primary { @apply inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition
  border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15
  dark:border-emerald-400/30 dark:bg-emerald-400/20 dark:text-emerald-200 dark:hover:bg-emerald-400/25; }

.btn-outline { @apply inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition
  border border-slate-300 bg-white text-slate-900 hover:bg-slate-50
  dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10; }

.field { @apply w-full rounded-xl px-3 py-2 outline-none ring-0
  border border-slate-300 bg-white placeholder:text-slate-500 focus:border-emerald-500/40
  dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-400 dark:focus:border-emerald-400/40; }

/* Card flip effect */
.flip-container {
  perspective: 1000px;
  cursor: pointer;
  height: 100%;
  position: relative;
}

.flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-container.flipped .flipper {
  transform: rotateY(180deg);
}

.flip-front,
.flip-back {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
}

.flip-back {
  transform: rotateY(180deg);
}
`;



if (typeof document !== "undefined" && !document.getElementById("ctrl-styles")) {
  const style = document.createElement("style");
  style.id = "ctrl-styles";
  style.innerHTML = styles;
  document.head.appendChild(style);
}

function FlipCard({ icon, title, desc, backInfo }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative cursor-pointer [perspective:1000px]"
      onClick={() => setFlipped((v) => !v)}
    >
      {/* Rotating wrapper */}
      <div
        className={[
          "relative w-full h-64 sm:h-72 md:h-80 transition-transform duration-500",
          "[transform-style:preserve-3d]",
          flipped ? "[transform:rotateY(180deg)]" : "",
        ].join(" ")}
      >
        {/* FRONT */}
        <div className="absolute inset-0 rounded-2xl border p-6 backdrop-blur
                        border-slate-200 bg-white shadow-sm
                        dark:border-white/10 dark:bg-white/5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
                        [backface-visibility:hidden]">
          <div
            className="flex items-center justify-center h-11 w-11 rounded-xl border
                       border-slate-200 bg-slate-100
                       dark:border-black/10 dark:bg-gradient-to-br dark:from-emerald-400/20 dark:to-cyan-400/20
                       [&>svg]:!text-black dark:[&>svg]:!text-black"
          >
            {icon}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-transparent bg-clip-text
                         bg-gradient-to-r from-emerald-600 to-cyan-600
                         dark:from-emerald-300 dark:to-cyan-400">
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
          <p className="mt-auto text-xs text-slate-400 dark:text-slate-500 mt-4">(Click for more)</p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-2xl border p-6
                        border-slate-200 bg-gradient-to-b from-emerald-50 to-cyan-50
                        dark:border-white/10 dark:from-emerald-900/20 dark:to-cyan-900/20
                        [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h4 className="text-base font-semibold text-transparent bg-clip-text
                         bg-gradient-to-r from-emerald-600 to-cyan-600
                         dark:from-emerald-300 dark:to-cyan-400 mb-2">
            {title}
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
            {/*More detailed information about <strong>{title}</strong> can go here — e.g., key benefits, approach, or what’s included.*/}
            {backInfo}
          </p>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">(Click again to flip back)</p>
        </div>
      </div>
    </div>
  );
}





export default function Home() {
  const features = [
    { icon: <ShieldCheck className="h-6 w-6" aria-hidden />, title: "Operator Licence Support", desc: "Policies, systems, and evidence packs aligned to DVSA expectations.", backInfo: "We help you stay on the right side of the Traffic Commissioner by ensuring your systems meet all Operator Licence undertakings. From building bespoke policy and procedure packs to setting up digital maintenance and driver record systems. Whether you’re applying for a new licence, facing a Public Inquiry, or simply tightening your systems, our team provides the expertise to keep your licence safe and your operation running smoothly." },
    { icon: <ClipboardCheck className="h-6 w-6" aria-hidden />, title: "Independent Compliance Audits", desc: "End-to-end reviews of maintenance, drivers’ hours, and record-keeping.", backInfo: "Our audits provide a full, unbiased view of your transport compliance. We review everything from maintenance and driver hours to daily defect reporting, working time, and record-keeping. You’ll receive a detailed written report with clear, prioritised actions to close any gaps and demonstrate proactive management to the DVSA or Traffic Commissioner. Ideal for peace of mind, internal checks, or Earned Recognition evidence." },
    { icon: <FileSpreadsheet className="h-6 w-6" aria-hidden />, title: "Tachograph & Working Time Analysis", desc: "Infringement detection and corrective actions.", backInfo: "We analyse driver card and vehicle unit data to detect infringements, fatigue risks, and poor scheduling practices before they escalate. You’ll receive clear, actionable reports that help you manage driver performance, plan corrective actions, and improve scheduling efficiency. Our systems also help you demonstrate control and due diligence, key factors in any DVSA visit or operator licence review." },
    { icon: <TimerReset className="h-6 w-6" aria-hidden />, title: "Earned Recognition Readiness", desc: "Gap analysis and continuous monitoring to stay audit-ready.", backInfo: "If you’re working toward DVSA Earned Recognition status, we’ll assess your systems against the scheme’s standards. Our gap analysis identifies areas needing improvement, and our continuous monitoring helps ensure ongoing compliance. From KPI tracking to audit-ready documentation, we’ll position your operation to achieve recognition and showcase your commitment to excellence." },
    { icon: <Truck className="h-6 w-6" aria-hidden />, title: "Maintenance & Defect Systems", desc: "Robust PMI, defect, and recall controls.", backInfo: "We build and review maintenance regimes that meet DVSA standards — covering PMIs, driver walkaround checks, defect reporting, and recall management. Our team ensures your paperwork (digital or paper-based) aligns with OCRS and Earned Recognition expectations. We can also assist in implementing digital defect systems, maintenance planners, and escalation procedures to reduce downtime and risk." },
    { icon: <BookOpenCheck className="h-6 w-6" aria-hidden />, title: "Training & Toolbox Talks", desc: "Practical sessions for drivers and transport managers.", backInfo: "We deliver practical training sessions for drivers, transport managers, and supervisors on key compliance areas — from daily defect checks and drivers’ hours to load security, bridge strikes, and operator licence awareness. Sessions can be tailored to your business and delivered onsite or online, helping you build a stronger safety culture and keep compliance front of mind." },
  ];
  const steps = [
    { k: "1", title: "Discovery", desc: "Short scoping call to understand your operation, risks, and goals." },
    { k: "2", title: "Audit & Action Plan", desc: "On-site/remote audit with a prioritized roadmap." },
    { k: "3", title: "Embed & Monitor", desc: "Implement controls, train teams, and set up checks." },
  ];

  return (
    <>
      {/* HERO */}
      <section
        className="
    relative overflow-hidden
    bg-gradient-to-b from-emerald-50 via-cyan-50 to-white
    dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950
  "
      >
        {/* Decorative background layers */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft blobs */}
          <div className="
      absolute -top-24 -right-20 h-[42rem] w-[42rem]
      bg-[radial-gradient(closest-side,theme(colors.emerald.300/.25),transparent)]
      blur-3xl
      dark:bg-[radial-gradient(closest-side,theme(colors.emerald.500/.18),transparent)]
    " />
          <div className="
      absolute -bottom-32 -left-24 h-[36rem] w-[36rem]
      bg-[radial-gradient(closest-side,theme(colors.cyan.300/.22),transparent)]
      blur-3xl
      dark:bg-[radial-gradient(closest-side,theme(colors.cyan.400/.16),transparent)]
    " />

          {/* Subtle grid (masked so it fades out) */}
          <div
            className="
        absolute inset-0 opacity-25 dark:opacity-10
        bg-[linear-gradient(0deg,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)]
        bg-[size:28px_28px,28px_28px]
        [mask-image:radial-gradient(60%_60%_at_50%_10%,black,transparent_70%)]
      "
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-10 lg:grid-cols-2"
          >
            <div>
              <Badge>Transport Auditing & Compliance</Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                CTRL keeps your fleet
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-300 dark:to-cyan-400">
                  compliant, audit-ready, and in control
                </span>
              </h1>
              <p className="mt-6 text-slate-600 dark:text-slate-300 max-w-xl">
                We help transport operators build practical systems that pass scrutiny—without slowing the operation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <CTAButton primary>Book an intro call</CTAButton>
                <CTAButton>See audit checklist</CTAButton>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start text-center sm:text-left gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> UK-wide</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> SME to enterprise</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Confidential & independent</div>
              </div>
            </div>
            <HeroCard />
          </motion.div>
        </div>
      </section>


      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="services">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold">What we do</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Audits, advice, and embedded systems for sustained compliance.</p>
          </div>
          <a href="#contact" className="text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200 inline-flex items-center gap-2 text-sm">
            Talk to an expert <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FlipCard key={f.title} {...f} />
          ))}


        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="process">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Fully compliant in 3 simple steps</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border p-6
                border-slate-200 bg-gradient-to-b from-white to-slate-50
                dark:border-white/10 dark:from-white/[0.06] dark:to-white/[0.03]"
            >
              <div className="text-sm text-slate-500 dark:text-slate-400"><strong>{s.k}</strong></div>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL 
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border p-8 md:p-12
          border-slate-200 bg-white
          dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
            “CTRL helped us turn a patchwork of spreadsheets into a clean, auditable system.”
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="h-9 w-9 rounded-full bg-emerald-500/15 border
              border-slate-200 dark:border-white/10" />
            <div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">Ops Manager, National Haulier</div>
              <div>Name withheld by request</div>
            </div>
          </div>
        </div>
      </section>*/}

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
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
      border border-slate-200 bg-white text-slate-700
      dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> {children}
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
      className="lg:col-span-2 rounded-3xl border p-8
        border-slate-200 bg-gradient-to-b from-white to-slate-50
        dark:border-white/10 dark:from-white/[0.06] dark:to-white/[0.03]"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name"><input required className="field" placeholder="Alex Smith" /></Field>
        <Field label="Company"><input className="field" placeholder="Acme Logistics" /></Field>
        <Field label="Email"><input type="email" required className="field" placeholder="you@company.co.uk" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Fleet size">
          <select className="field"><option>1–10</option><option>11–50</option><option>51–150</option><option>151+</option></select>
        </Field>
        <Field label="What do you need?" full><textarea rows={5} className="field" placeholder="Audit, tachograph analysis, training, ER readiness..." /></Field>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">By submitting, you agree to be contacted about CTRL services.</p>
        <button className="btn-primary">Send enquiry</button>
      </div>
    </form>
  );
}
function Field({ label, children, full }) {
  return (
    <label className={(full ? "sm:col-span-2 " : "") + "flex flex-col gap-2"}>
      <span className="text-xs text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
function ContactCard() {
  return (
    <div className="rounded-3xl border p-8
      border-slate-200 bg-white text-slate-800
      dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Speak with CTRL</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">Tell us a bit about your operation and we’ll suggest a sensible starting point.</p>
      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
        <a className="inline-flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300" href="tel:+443301338986"><Phone className="h-4 w-4" />03301338986</a>
        <a className="inline-flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300" href="mailto:daniel@ctrlcompliance.co.uk"><Mail className="h-4 w-4" />daniel@ctrlcompliance.co.uk</a>
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="
        relative rounded-3xl border p-6 md:p-8
        bg-white border-slate-200
        dark:bg-slate-950 dark:border-white/10
      "
    >
      {/* Dark-only soft gloss overlay — separate from base bg */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10 rounded-3xl
          hidden dark:block
          bg-gradient-to-b from-white/[0.08] to-white/[0.04]
        "
      />

      {/* Glow blob (behind content) */}
      <div
        className="
          absolute -top-8 -right-8 -z-10 h-40 w-40 rounded-full
          bg-emerald-500/10 blur-3xl
          dark:bg-emerald-500/20
        "
      />

      <div className="flex items-center gap-3">
        <div
          className="
            h-10 w-10 grid place-items-center rounded-xl border
            border-slate-200 bg-slate-50
            dark:border-white/10 dark:bg-emerald-400/20
          "
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-slate-600 dark:text-slate-300">CTRL Audit Overview</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">What you can expect</div>
        </div>
      </div>

      <div
        className="
          mt-4 overflow-hidden rounded-xl border divide-y
          border-slate-200 divide-slate-200
          dark:border-white/10 dark:divide-white/10
        "
      >
        {items.map((it) => (
          <div
            key={it.label}
            className="
              grid grid-cols-3 gap-3 p-4
              bg-slate-50
              dark:bg-white/5
            "
          >
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {it.label}
            </div>
            <div className="col-span-2 text-sm text-slate-800 dark:text-slate-200">
              {it.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-600 dark:text-slate-400">No-nonsense reporting. Practical fixes.</div>
        <a
          href="#services"
          className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          Explore services <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}

