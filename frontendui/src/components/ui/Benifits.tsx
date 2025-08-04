import { FC, useRef } from "react";
import { motion, Variants } from "framer-motion";
import clsx from "clsx";

type Theme = {
  glowFrom: string;
  glowVia: string;
  glowTo: string;
  ringFrom: string;
  ringTo: string;
  badgeFrom: string;
  badgeTo: string;
  dot: string;
  accentText: string;
};

const themes: Theme[] = [
  {
    glowFrom: "from-emerald-300/20",
    glowVia: "via-emerald-400/12",
    glowTo: "to-green-500/8",
    ringFrom: "from-emerald-300",
    ringTo: "to-teal-400",
    badgeFrom: "from-green-300",
    badgeTo: "to-emerald-500",
    dot: "bg-emerald-400",
    accentText: "text-emerald-300",
  },
  {
    glowFrom: "from-sky-400/25",
    glowVia: "via-blue-500/15",
    glowTo: "to-indigo-700/10",
    ringFrom: "from-sky-400",
    ringTo: "to-indigo-500",
    badgeFrom: "from-sky-400",
    badgeTo: "to-indigo-600",
    dot: "bg-sky-500",
    accentText: "text-sky-400",
  },
  {
    glowFrom: "from-fuchsia-400/25",
    glowVia: "via-violet-500/15",
    glowTo: "to-indigo-700/10",
    ringFrom: "from-fuchsia-400",
    ringTo: "to-violet-500",
    badgeFrom: "from-fuchsia-400",
    badgeTo: "to-indigo-600",
    dot: "bg-fuchsia-500",
    accentText: "text-fuchsia-400",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

type Benefit = {
  title: string;
  description: string;
  footer: string;
  icon: React.ReactNode;
};

const benefits: Benefit[] = [
  {
    title: "Real-Time Monitoring",
    description:
      "Continuous checks across distributed probes detect downtime the instant it happens—before your users do.",
    footer: "Live status stream",
    icon: (
      <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
    ),
  },
  {
    title: "Global Perspective",
    description:
      "See performance by region with synthetic checks from major continents—pinpoint latency and routing anomalies.",
    footer: "15+ regions covered",
    icon: <span className="text-xl">🌐</span>,
  },
  {
    title: "Instant Alerts",
    description:
      "Sub-60s alerts via email, Slack, and webhooks—smart dedupe prevents noise while keeping you informed.",
    footer: "Smart throttling",
    icon: <span className="text-xl">⚡</span>,
  },
];

type NeonCardProps = {
  index: number;
  theme: Theme;
  title: string;
  description: string;
  footer: string;
  icon: React.ReactNode;
};

const NeonCard: FC<NeonCardProps> = ({
  index,
  theme,
  title,
  description,
  footer,
  icon,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    el.style.setProperty("--mx", `${px}%`);
    el.style.setProperty("--my", `${py}%`);

    const rx = ((py - 50) / 50) * -6; // tilt X
    const ry = ((px - 50) / 50) * 6; // tilt Y
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="relative h-full"
    >
      {/* Ambient particle field */}
      <div
        className={clsx(
          "pointer-events-none absolute -inset-3 -z-10 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br",
          theme.glowFrom,
          theme.glowVia,
          theme.glowTo
        )}
        aria-hidden
      />

      {/* Card wrapper with neon ring sweep */}
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={clsx(
          "group relative h-full rounded-[22px] p-[2px]",
          "bg-slate-900/5 dark:bg-white/5",
          "before:absolute before:inset-0 before:rounded-[22px] before:p-[2px] before:content-['']",
          "before:[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]",
          "before:[mask-composite:exclude]",
          "before:bg-[conic-gradient(var(--angle),theme(colors.white/40),transparent_30%,transparent_70%,theme(colors.white/40))]",
          "before:animate-[spin_6s_linear_infinite]",
          "[--angle:0deg]"
        )}
        style={{
          transform:
            "perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner glass panel */}
        <div
          className={clsx(
            "relative h-full rounded-[20px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
            "border border-white/40 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
            "transition-all duration-300 group-hover:shadow-[0_18px_60px_rgba(0,0,0,0.2)]"
          )}
        >
          {/* Neon edge gradient behind */}
          <div
            className={clsx(
              "pointer-events-none absolute -inset-px rounded-[21px] opacity-70 mix-blend-soft-light",
              "bg-gradient-to-br",
              theme.ringFrom,
              theme.ringTo
            )}
            aria-hidden
          />
          {/* Vignette + sheen following cursor */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[20px]"
            style={{
              background: `
                radial-gradient(200px 200px at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.12), transparent 60%),
                radial-gradient(600px 180px at 50% 0%, rgba(255,255,255,0.1), transparent 70%)
              `,
            }}
            aria-hidden
          />

          {/* Content area with consistent height */}
          <div className="relative z-10 flex h-full flex-col items-center text-center px-7 py-9 min-h-[280px]">
            {/* Icon badge */}
            <div
              className={clsx(
                "relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl",
                "bg-gradient-to-br",
                theme.badgeFrom,
                theme.badgeTo,
                "shadow-lg ring-1 ring-inset ring-white/40"
              )}
              aria-hidden
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-white/95 shadow-md">
                {icon}
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent" />
            </div>

            <h3 className="text-[1.15rem] font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h3>

            <p className="mt-3 text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-xs">
              {description}
            </p>

            {/* Spacer to push footer to bottom */}
            <div className="flex-1" />

            {/* Footer pill */}
            <div className="mt-5">
              <span
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm",
                  "bg-white/70 dark:bg-white/10 backdrop-blur-md",
                  "border border-white/40 dark:border-white/10",
                  "shadow-sm text-gray-800/80 dark:text-gray-200/85",
                  "transition-colors duration-300 group-hover:text-white",
                  "group-hover:bg-gradient-to-r",
                  theme.ringFrom,
                  theme.ringTo
                )}
              >
                {footer}
                <span
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]",
                    theme.dot
                  )}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const BenefitsHyper: FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="relative mt-16"
    >
      {/* Section eyebrow and heading */}
      <div className="mx-auto mb-10 max-w-3xl text-center px-4 mt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-1 text-xs font-medium text-gray-700/80 dark:text-gray-200/80 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Uptime that feels instant
        </div>
        <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Beyond monitoring—experience it
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Precision checks, global reach, and alerts that respect your focus.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch px-2 md:px-0">
        {benefits.map((b, i) => (
          <NeonCard
            key={b.title}
            index={i}
            theme={themes[0]}
            title={b.title}
            description={b.description}
            footer={b.footer}
            icon={b.icon}
          />
        ))}
      </div>

      {/* Subtle floating particles across section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_40%,#000,transparent)]"
      >
        <div className="absolute left-1/3 top-10 h-1.5 w-1.5 rounded-full bg-emerald-400/40 blur-[2px] animate-pulse" />
        <div className="absolute right-1/4 top-1/3 h-1 w-1 rounded-full bg-sky-400/40 blur-[1px] animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="absolute right-1/5 bottom-6 h-1.5 w-1.5 rounded-full bg-fuchsia-400/40 blur-[2px] animate-[pulse_2.4s_ease-in-out_infinite]" />
      </div>
    </motion.div>
  );
};