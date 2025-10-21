// FILE: src/pages/Home.jsx
import { useState } from "react";
import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
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

//Functions

if (typeof document !== "undefined" && !document.getElementById("ctrl-styles")) {
  const style = document.createElement("style");
  style.id = "ctrl-styles";
  style.innerHTML = styles;
  document.head.appendChild(style);
}

function FlipCard({ icon, title, desc, backPoints = [], tags = [], href }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative cursor-pointer [perspective:1000px]"
      onClick={() => setFlipped((v) => !v)}
    >
      {/* Gradient ring + hover glow */}
      <div className="rounded-2xl p-[1px] transition-shadow duration-300
                      bg-gradient-to-br from-emerald-300/40 via-cyan-300/40 to-transparent
                      dark:from-emerald-400/30 dark:via-cyan-400/30 dark:to-transparent
                      hover:shadow-[0_10px_40px_-12px_rgba(16,185,129,0.35)]">
        {/* Rotating wrapper */}
        <div
          className={[
            "relative w-full h-64 sm:h-72 md:h-80 transition-transform duration-500",
            "[transform-style:preserve-3d]",
            flipped ? "[transform:rotateY(180deg)]" : "",
          ].join(" ")}
        >
          {/* FRONT */}
          <div className="absolute inset-0 rounded-2xl border px-6 py-5 backdrop-blur
                          border-slate-200 bg-white shadow-sm
                          dark:border-white/10 dark:bg-white/5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
                          [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center justify-center h-11 w-11 rounded-xl border
                           border-slate-200 bg-slate-100
                           dark:border-black/10 dark:bg-gradient-to-br dark:from-emerald-400/20 dark:to-cyan-400/20
                           [&>svg]:!text-black dark:[&>svg]:!text-black"
              >
                {icon}
              </div>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Click to flip
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-transparent bg-clip-text
                           bg-gradient-to-r from-emerald-600 to-cyan-600
                           dark:from-emerald-300 dark:to-cyan-400">
              {title}
            </h3>

            {/* Clamp to tidy lengths */}
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
              {desc}
            </p>

            {/* Mini divider */}
            <div className="mt-4 h-px bg-gradient-to-r from-emerald-200/60 via-slate-200/40 to-transparent
                            dark:from-emerald-300/20 dark:via-white/10" />

            {/* Optional quick tags preview (first 2) */}
            {tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2 py-0.5 text-[11px]
                               bg-emerald-500/10 text-emerald-700 border border-emerald-500/20
                               dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-400/25"
                  >
                    {t}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">+{tags.length - 2}</span>
                )}
              </div>
            )}
          </div>

          {/* BACK */}
          <div className="absolute inset-0 rounded-2xl border px-6 py-5
                          border-slate-200 bg-gradient-to-b from-emerald-50 to-cyan-50
                          dark:border-white/10 dark:from-emerald-900/20 dark:to-cyan-900/20
                          [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <h4 className="text-base font-semibold text-transparent bg-clip-text
                           bg-gradient-to-r from-emerald-600 to-cyan-600
                           dark:from-emerald-300 dark:to-cyan-400">
              What you’ll get
            </h4>

            {/* Bullet list */}
            <ul className="mt-3 space-y-2">
              {backPoints.map((bp) => (
                <li key={bp} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>

            {/* Tags */}
            {tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2 py-0.5 text-[11px]
                               bg-white/60 text-slate-700 border border-white
                               dark:bg-white/10 dark:text-slate-200 dark:border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Optional CTA */}
            {href && (
              <a
                href={href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium
                           text-emerald-700 hover:text-emerald-600
                           dark:text-emerald-300 dark:hover:text-emerald-200"
                onClick={(e) => e.stopPropagation()}
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessStep({ index, title, desc, Icon, points }) {
  const cardRef = useRef(null);

  function handleMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (cardRef.current) {
          cardRef.current.style.removeProperty("--mx");
          cardRef.current.style.removeProperty("--my");
        }
      }}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -4 }}
      className="
        relative rounded-2xl border p-6
        border-slate-200 bg-gradient-to-b from-white to-slate-50
        dark:border-white/10 dark:from-white/[0.06] dark:to-white/[0.03]
        shadow-sm hover:shadow-lg transition-shadow
      "
    >
      {/* soft spotlight that follows cursor (no transform) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 md:opacity-100"
        style={{
          background:
            "radial-gradient(400px 180px at var(--mx,50%) var(--my,0%), rgba(16,185,129,0.10), transparent 60%)",
          maskImage:
            "radial-gradient(380px 160px at var(--mx,50%) var(--my,0%), rgba(0,0,0,0.8), transparent 70%)",
        }}
      />

      {/* header row */}
      <div className="flex items-center gap-3">
        <div className="
          h-10 w-10 grid place-items-center rounded-xl border
          border-emerald-300/40 bg-emerald-50 text-emerald-700
          dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200
        ">
          {String(index).padStart(2, "0")}
        </div>
        <div className="
          h-10 w-10 grid place-items-center rounded-xl border
          border-slate-200 bg-slate-50
          dark:border-white/10 dark:bg-emerald-400/20
        ">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">{desc}</p>

      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}



function SectionProgress({ targetRef }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 80%", "end 20%"], // start filling when section comes in, finish before it leaves
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="relative my-6 h-1 bg-slate-200/60 dark:bg-white/10 rounded">
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-emerald-500 to-cyan-500"
      />
    </div>
  );
}

function SectionRule() {
  return (
    <div className="relative my-6 h-1 bg-slate-200/60 dark:bg-white/10 rounded">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
        className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-emerald-500 to-cyan-500"
      />
    </div>
  );
}






export default function Home() {
  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
      title: "Operator Licence Support",
      desc: "Policies, systems, and evidence packs aligned to DVSA expectations.",
      backPoints: [
        "Bespoke policy & SOP packs",
        "Digital maintenance & driver records",
        "Pre-audit checks and PI prep",
      ],
      tags: ["DVSA-ready", "SOPs", "Policy Pack"],
      href: "#operator-licence"
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" aria-hidden />,
      title: "Independent Compliance Audits",
      desc: "End-to-end reviews of maintenance, hours, and records.",
      backPoints: [
        "Gap analysis with risk scoring",
        "Prioritised action plan",
        "Evidence for ER / TC / DVSA",
      ],
      tags: ["Audit", "Risk Score", "Action Plan"],
      href: "#audit"
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6" aria-hidden />,
      title: "Tachograph & Working Time Analysis",
      desc: "Detect infringements and coach improvements.",
      backPoints: [
        "Driver card & VU analysis",
        "Corrective actions & coaching",
        "Scheduling & fatigue insights",
      ],
      tags: ["Tacho", "WTD", "Coaching"]
    },
    {
      icon: <TimerReset className="h-6 w-6" aria-hidden />,
      title: "Earned Recognition Readiness",
      desc: "Get audit-ready and maintain KPIs.",
      backPoints: [
        "Readiness assessment",
        "KPI tracking & alerts",
        "Audit-ready documentation",
      ],
      tags: ["ER", "KPIs", "Monitoring"]
    },
    {
      icon: <Truck className="h-6 w-6" aria-hidden />,
      title: "Maintenance & Defect Systems",
      desc: "Robust PMI, defect and recall controls.",
      backPoints: [
        "PMI planner & defect flow",
        "Recall & escalation controls",
        "Digital or paper processes",
      ],
      tags: ["PMI", "Defects", "Recall"]
    },
    {
      icon: <BookOpenCheck className="h-6 w-6" aria-hidden />,
      title: "Training & Toolbox Talks",
      desc: "Practical sessions for drivers & managers.",
      backPoints: [
        "Drivers’ hours & walkaround",
        "Load security & bridge strikes",
        "OL awareness for managers",
      ],
      tags: ["Training", "Toolbox", "Safety Culture"]
    },
  ];

  const steps = [
    {
      k: "01",
      title: "Discovery",
      desc: "Short scoping call to understand your operation, risks, and goals.",
      icon: Building2,
      points: ["Fleet & sites profile", "Pain points & risks", "Quick-win opportunities"],
    },
    {
      k: "02",
      title: "Audit & Action Plan",
      desc: "On-site/remote audit with a prioritized roadmap.",
      icon: ClipboardCheck,
      points: ["Evidence review", "Risk score by area", "Prioritised action list"],
    },
    {
      k: "03",
      title: "Embed & Monitor",
      desc: "Implement controls, train teams, and set up checks.",
      icon: TimerReset,
      points: ["SOPs & training", "KPI/ER tracking", "Follow-up & support"],
    },
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
      <div className="bg-gradient-to-b from-white to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/10">
        <section className="mx-auto max-w-7xl px-6 py-16" id="services">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-medium tracking-wider uppercase text-emerald-700/80 dark:text-emerald-300">
                Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold">What we do</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Audits, advice, and embedded systems for sustained compliance.
              </p>
            </div>
            <a
              href="#contact"
              className="text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200 inline-flex items-center gap-2 text-sm"
            >
              Talk to an expert <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* grey bar with gradient fill */}
          <SectionRule />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FlipCard key={f.title} {...f} />
            ))}
          </div>
        </section>
      </div>


      {/* PROCESS */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="process">
        <div className="mb-2">
          <span className="text-xs font-medium tracking-wider uppercase text-emerald-700/80 dark:text-emerald-300">
            How it works
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            Fully compliant in 3 simple steps
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            A lightweight path from first conversation to embedded, auditable control.
          </p>
        </div>

        {/* Progress bar bound to section scroll */}
        <div ref={processRef => (window.__processRef = processRef)}>
          <SectionProgress targetRef={typeof window !== "undefined" ? window.__processRef : null} />
        </div>

        {/* Connecting line behind cards (desktop) */}
        <div className="relative">
          <div className="
      pointer-events-none absolute left-0 right-0 top-1/2 -z-10 hidden md:block
      h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent
      dark:via-emerald-400/30
    " />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <ProcessStep
                key={s.k}
                index={i + 1}
                title={s.title}
                desc={s.desc}
                Icon={s.icon}
                points={s.points}
              />
            ))}
          </div>
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
      <section id="contact" className="relative overflow-hidden">
        {/* subtle background accents */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-20 h-[34rem] w-[34rem]
      bg-[radial-gradient(closest-side,theme(colors.emerald.300/.18),transparent)]
      blur-3xl dark:bg-[radial-gradient(closest-side,theme(colors.emerald.500/.14),transparent)]" />
          <div className="absolute -bottom-28 -right-16 h-[28rem] w-[28rem]
      bg-[radial-gradient(closest-side,theme(colors.cyan.300/.16),transparent)]
      blur-3xl dark:bg-[radial-gradient(closest-side,theme(colors.cyan.400/.12),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20">
          {/* left-aligned heading to match site */}
          <div className="mb-6">
            <span className="text-xs font-medium tracking-wider uppercase text-emerald-700/80 dark:text-emerald-300">
              Contact
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold">Speak with CTRL</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
              Tell us a bit about your operation and we’ll suggest a sensible starting point.
            </p>
          </div>

          {/* grey bar with gradient fill */}
          <SectionRule />

          <div className="grid gap-6 lg:grid-cols-3">
            <ContactCard />
            <HomeContactForm />
          </div>
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
    <div className="lg:col-span-2 rounded-3xl p-[1px]
      bg-gradient-to-br from-emerald-300/40 via-cyan-300/40 to-transparent
      dark:from-emerald-400/30 dark:via-cyan-400/30 dark:to-transparent">
      <form
        onSubmit={(e) => { e.preventDefault(); alert(`Thanks! We'll be in touch at: ${email}`); setEmail(""); }}
        className="relative rounded-3xl border p-8
          border-slate-200 bg-gradient-to-b from-white to-slate-50
          dark:border-white/10 dark:from-white/[0.06] dark:to-white/[0.03]"
      >
        {/* cursor-following soft spotlight (no transforms) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          onMouseMove={(e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty("--mx", `${x}%`);
            el.style.setProperty("--my", `${y}%`);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.removeProperty("--mx");
            e.currentTarget.style.removeProperty("--my");
          }}
          style={{
            background:
              "radial-gradient(420px 200px at var(--mx,50%) var(--my,0%), rgba(16,185,129,0.08), transparent 60%)",
            maskImage:
              "radial-gradient(400px 180px at var(--mx,50%) var(--my,0%), rgba(0,0,0,0.9), transparent 70%)",
          }}
        />

        <div className="grid gap-6 sm:grid-cols-2 relative">
          <Field label="Full name"><input required className="field" placeholder="Alex Smith" /></Field>
          <Field label="Company"><input className="field" placeholder="Acme Logistics" /></Field>
          <Field label="Email">
            <input
              type="email"
              required
              className="field"
              placeholder="you@company.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Fleet size">
            <select className="field">
              <option>1–10</option><option>11–50</option>
              <option>51–150</option><option>151+</option>
            </select>
          </Field>
          <Field label="What do you need?" full>
            <textarea rows={5} className="field" placeholder="Audit, tachograph analysis, training, ER readiness..." />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By submitting, you agree to be contacted about CTRL services.
          </p>
          <button className="btn-primary">Send enquiry</button>
        </div>
      </form>
    </div>
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
    <div className="rounded-3xl p-[1px]
      bg-gradient-to-br from-emerald-300/40 via-cyan-300/40 to-transparent
      dark:from-emerald-400/30 dark:via-cyan-400/30 dark:to-transparent">
      <div className="rounded-3xl border p-8 h-full
        border-slate-200 bg-white text-slate-800
        dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Get in touch
          </h3>
          <div className="h-9 w-9 grid place-items-center rounded-xl border
            border-emerald-300/50 bg-emerald-50 text-emerald-700
            dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          Quick responses, straight answers.
        </p>

        {/* Divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-emerald-200/60 via-slate-200/40 to-transparent
          dark:from-emerald-300/20 dark:via-white/10" />

        {/* Channels */}
        <div className="mt-6 flex flex-col gap-3 text-sm">
          <a className="inline-flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300"
            href="tel:+443301338986">
            <Phone className="h-4 w-4" />
            03301338986
          </a>
          <a className="inline-flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300"
            href="mailto:daniel@ctrlcompliance.co.uk">
            <Mail className="h-4 w-4" />
            daniel@ctrlcompliance.co.uk
          </a>
        </div>

        {/* Badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[11px]
            bg-emerald-500/10 text-emerald-700 border border-emerald-500/20
            dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-400/25">
            UK-wide
          </span>
          <span className="rounded-full px-2.5 py-1 text-[11px]
            bg-emerald-500/10 text-emerald-700 border border-emerald-500/20
            dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-400/25">
            SME → Enterprise
          </span>
          <span className="rounded-full px-2.5 py-1 text-[11px]
            bg-emerald-500/10 text-emerald-700 border border-emerald-500/20
            dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-400/25">
            Confidential & independent
          </span>
        </div>

        {/* Small note */}
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Prefer email? We usually reply the same day.
        </p>
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

