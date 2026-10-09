"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { LOGIN_SLIDES } from "../../config/login-slides";

const SLIDE_INTERVAL_MS = 5500;
const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

/** The photo slides in from the side it is travelling from, and leaves on the other. */
const photoMotion = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0.4 }),
  center: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -28}%`, opacity: 0 }),
};

const ROLE_DESTINATIONS: Readonly<Record<string, string>> = {
  ADMIN: "/dashboard/admin",
  PROJECT_HEAD: "/dashboard/pm",
  EPC_MANAGER: "/dashboard/pm",
  SUPERVISOR: "/dashboard/supervisor",
  VENDOR: "/dashboard/vendor",
  CONSULTANT: "/dashboard/consultant",
  CONTRACTOR: "/dashboard/contractor",
  SUBCONTRACTOR: "/dashboard/subcontractor",
};

interface LoginResponse {
  role?: string;
  message?: string;
}

function safeRedirect(role?: string) {
  const requested = new URLSearchParams(window.location.search).get("redirect");
  if (requested?.startsWith("/") && !requested.startsWith("//")) return requested;
  return (role && ROLE_DESTINATIONS[role]) || "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const showSlide = useCallback((index: number, travel: number = 1) => {
    setDirection(travel);
    setActiveIndex((index + LOGIN_SLIDES.length) % LOGIN_SLIDES.length);
  }, []);

  // The slideshow always plays by itself. Restarting the timer whenever the slide changes gives a slide that was
  // picked by hand its full time on screen.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % LOGIN_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        throw new Error(payload.message || "The email or password is not valid.");
      }

      router.replace(safeRedirect(payload.role));
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeSlide = LOGIN_SLIDES[activeIndex];
  // The next two photos, shown as floating cards that the eye can follow into the main frame.
  const upcoming = [1, 2].map((step) => {
    const index = (activeIndex + step) % LOGIN_SLIDES.length;
    return { slide: LOGIN_SLIDES[index], index, step };
  });

  return (
    <main className="min-h-screen bg-[#071425] text-slate-950 lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.8fr)]">
      <section
        className="relative min-h-[38vh] overflow-hidden lg:min-h-screen"
        aria-label="Infrastructure disciplines"
      >
        <AnimatePresence initial={false} mode="sync" custom={direction}>
          <motion.div
            key={activeSlide.id}
            className="absolute inset-0"
            custom={direction}
            variants={reduceMotion ? undefined : photoMotion}
            initial={reduceMotion ? { opacity: 0 } : "enter"}
            animate={reduceMotion ? { opacity: 1 } : "center"}
            exit={reduceMotion ? { opacity: 0 } : "exit"}
            transition={{ duration: reduceMotion ? 0.6 : 1.15, ease: SLIDE_EASE }}
          >
            {/* While it is on screen the photo keeps drifting, slightly larger than its frame so no edge shows. */}
            <motion.div
              className="absolute inset-[-4%]"
              initial={{ scale: 1.04, x: "-1.2%", y: "0.8%" }}
              animate={reduceMotion ? undefined : { scale: 1.12, x: "1.2%", y: "-0.8%" }}
              transition={{ duration: SLIDE_INTERVAL_MS / 1000 + 1.5, ease: "linear" }}
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.alt}
                fill
                priority={activeIndex === 0}
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Loads every photo up front, at the two sizes used here, so a slide never arrives before its picture. */}
        <div className="pointer-events-none invisible absolute inset-0" aria-hidden="true">
          {LOGIN_SLIDES.map((slide) => (
            <span key={slide.id}>
              <Image src={slide.image} alt="" fill loading="eager" sizes="(min-width: 1024px) 70vw, 100vw" />
              <Image src={slide.image} alt="" fill loading="eager" sizes="260px" />
            </span>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#061426] via-[#061426]/20 to-[#061426]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061426]/35 via-transparent to-transparent" />

        {/* Floating cards: the photos that come next. Decorative for screen readers; the dots below do the same job. */}
        <div className="pointer-events-none absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-6 lg:flex xl:right-12" aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            {upcoming.map(({ slide, index, step }) => (
              <motion.button
                key={slide.id}
                type="button"
                tabIndex={-1}
                layout
                onClick={() => showSlide(index)}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-white/40 bg-slate-900 shadow-2xl shadow-black/50 ring-1 ring-black/10 ${
                  step === 1 ? "h-40 w-60 xl:h-44 xl:w-64" : "mr-6 h-28 w-44 xl:h-32 xl:w-48"
                }`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 140, rotate: 6 }}
                animate={{ opacity: step === 1 ? 1 : 0.82, x: 0, rotate: step === 1 ? -2.5 : 3 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -220, scale: 1.25, rotate: 0 }}
                transition={{ duration: reduceMotion ? 0.4 : 0.9, ease: SLIDE_EASE }}
                whileHover={{ scale: 1.04 }}
              >
                {/* The gentle bob that makes the card float. */}
                <motion.span
                  className="absolute inset-0 block"
                  animate={reduceMotion ? undefined : { y: [0, step === 1 ? -9 : 7, 0] }}
                  transition={{ duration: step === 1 ? 5.5 : 6.5, ease: "easeInOut", repeat: Infinity }}
                >
                  <Image src={slide.image} alt="" fill sizes="260px" className="scale-110 object-cover" />
                </motion.span>
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 right-3 truncate text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  {slide.discipline}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex min-h-[38vh] flex-col justify-between p-5 text-white sm:p-8 lg:min-h-screen lg:p-10 xl:p-14">
          <Link href="/" className="inline-flex w-fit items-center gap-3" aria-label="VendorConnect home">
            <span className="grid h-10 w-10 rotate-45 place-items-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/30">
              <span className="h-4 w-4 rounded-[4px] bg-cyan-200" />
            </span>
            <span className="text-xl font-extrabold tracking-[-0.035em]">
              Vendor<span className="text-blue-300">Connect</span>
            </span>
          </Link>

          <div className="max-w-2xl pb-1 lg:pb-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${activeSlide.id}-copy`}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: reduceMotion ? 0 : 0.45 }}
              >
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200 sm:text-xs">
                  {activeSlide.discipline}
                </p>
                <h1 className="max-w-xl text-3xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl xl:text-6xl">
                  {activeSlide.title}
                </h1>
                <p className="mt-3 hidden max-w-xl text-sm leading-6 text-slate-200 sm:block lg:mt-5 lg:text-base">
                  {activeSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between gap-5 lg:mt-8">
              <div className="flex items-center gap-2" role="tablist" aria-label="Choose slideshow image">
                {LOGIN_SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-label={`Show ${slide.discipline}`}
                    aria-selected={index === activeIndex}
                    onClick={() => showSlide(index, index < activeIndex ? -1 : 1)}
                    className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                      index === activeIndex ? "w-12 bg-white/35" : "w-4 bg-white/45 hover:bg-white/70"
                    }`}
                  >
                    {/* Fills while the slide is on screen, so the next change is never a surprise. */}
                    {index === activeIndex && (
                      <motion.span
                        key={activeSlide.id}
                        className="absolute inset-y-0 left-0 rounded-full bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => showSlide(activeIndex - 1, -1)}
                  aria-label="Previous slide"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-slate-950/25 text-white backdrop-blur hover:bg-white/15"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => showSlide(activeIndex + 1, 1)}
                  aria-label="Next slide"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-slate-950/25 text-white backdrop-blur hover:bg-white/15"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[62vh] items-center bg-[#f6f8fc] px-5 py-10 sm:px-10 lg:min-h-screen lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-9">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <ShieldCheck size={15} /> Secure project workspace
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in with your organisation account to continue.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@organisation.com"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-65"
            >
              {submitting ? "Signing in…" : "Sign in to workspace"}
            </button>
          </form>

          <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm">
            <Link href="/" className="font-medium text-slate-500 hover:text-slate-900">Back to website</Link>
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-800">Create vendor account</Link>
          </div>

          <p className="mt-10 text-xs leading-5 text-slate-400">
            Access is monitored and governed by your organisation&apos;s assigned role and project scope.
          </p>
        </div>
      </section>
    </main>
  );
}
