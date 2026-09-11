import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSelector } from "@/components/language-selector";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" aria-label="MY RIGHT home"><BrandMark /></Link>
        <nav className="hidden items-center gap-8 text-sm text-[var(--ink-muted)] md:flex" aria-label="Primary navigation">
          <a className="transition-colors hover:text-[var(--foreground)]" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-[var(--foreground)]" href="#privacy">Privacy</a>
          <a className="transition-colors hover:text-[var(--foreground)]" href="/emergency">Emergency help</a>
        </nav>
        <div className="flex items-center gap-3"><LanguageSelector /><a href="/support" className="motion-lift rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Get support <span aria-hidden="true">↗</span></a></div>
      </header>

      <main>
        <section className="hero-wash grain relative mx-4 overflow-hidden rounded-[2rem] sm:mx-6 lg:mx-10">
          <Image src="/images/images%20(8).jpg" alt="A person asking for safety and space" fill priority sizes="100vw" className="hero-photo absolute inset-0 object-cover object-center grayscale opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,247,244,0.97)_0%,rgba(245,247,244,0.78)_42%,rgba(23,59,53,0.08)_78%,rgba(23,59,53,0.02)_100%)]" aria-hidden="true" />
          <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-20">
            <div className="relative z-10 max-w-xl">
              <p className="rise mb-6 text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Private support, on your terms</p>
              <h1 className="rise rise-delay-1 max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.35rem]">You have the right to be heard.</h1>
              <p className="rise rise-delay-2 mt-7 max-w-md text-lg leading-8 text-[var(--ink-muted)]">Describe what is happening, understand your options, and choose whether you want human support. You can start without creating an account.</p>
              <div className="rise rise-delay-2 mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="/support" className="motion-lift flex h-14 items-center justify-center rounded-full bg-[var(--accent)] px-7 font-semibold text-white shadow-[0_12px_30px_rgba(11,107,95,0.18)] transition-transform hover:-translate-y-1">Get support <span className="ml-3" aria-hidden="true">→</span></a>
                <a href="#how-it-works" className="motion-lift flex h-14 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-7 font-semibold transition-colors hover:bg-white">See how it works</a>
              </div>
              <p className="mt-5 text-xs text-[var(--ink-muted)]">AI-assisted information, with human follow-up when you choose.</p>
            </div>
            <div className="relative hidden min-h-[430px] lg:block" aria-hidden="true">
              <div className="hero-orbit absolute right-8 top-4 h-72 w-72 rounded-full border border-[var(--accent)]/20"></div>
              <div className="hero-orbit absolute right-20 top-16 h-56 w-56 rounded-full border border-[var(--accent)]/15" style={{ animationDelay: "-3s" }}></div>
              <div className="hero-panel absolute bottom-8 right-0 w-[360px] rounded-[1.75rem] border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(18,51,42,0.12)] backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-5"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">Your space</span><span className="h-2 w-2 rounded-full bg-[var(--accent)]"></span></div>
                <div className="py-7"><p className="text-2xl font-semibold leading-tight tracking-[-0.03em]">Start with what feels easiest to say.</p><p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">Text, a file, or your voice. You decide what to share.</p></div>
                <div className="flex gap-2"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent-dark)]">Private</span><span className="rounded-full bg-[#f8eadb] px-3 py-2 text-xs font-semibold text-[#8e4a2c]">No account</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-arrive mx-auto grid max-w-7xl gap-5 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10" id="how-it-works">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">A gentler first step</p><h2 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.045em]">Support that keeps you in control.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3"><article className="border-t border-[var(--line)] pt-5"><span className="text-sm font-bold text-[var(--accent)]">01</span><h3 className="mt-10 text-lg font-semibold">Tell us what&apos;s happening</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Use words, a photo, a document, or audio. Share only what feels safe.</p></article><article className="border-t border-[var(--line)] pt-5"><span className="text-sm font-bold text-[var(--accent)]">02</span><h3 className="mt-10 text-lg font-semibold">Understand your options</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Receive thoughtful information and verified Ghana-based resources.</p></article><article className="border-t border-[var(--line)] pt-5"><span className="text-sm font-bold text-[var(--accent)]">03</span><h3 className="mt-10 text-lg font-semibold">Choose human follow-up</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Request contact from a trained professional only when you want it.</p></article></div>
        </section>

        <section className="section-arrive mx-4 mb-16 rounded-[1.75rem] bg-[#173b35] px-6 py-8 text-white sm:mx-6 lg:mx-10 lg:px-10" id="privacy">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a9decd]">Need help right now?</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Immediate danger needs immediate support.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#c6ddd5]">MY RIGHT is not an emergency service. If you are in immediate danger, use the emergency pathway for urgent guidance and verified contacts.</p></div><a href="/emergency" className="inline-flex h-13 shrink-0 items-center justify-center rounded-full bg-[#f1c6a0] px-6 py-3 font-semibold text-[#173b35] transition-transform hover:-translate-y-0.5">Open emergency help <span className="ml-3" aria-hidden="true">↗</span></a></div>
        </section>
        <section className="section-arrive mx-auto grid max-w-7xl gap-10 px-6 pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10" aria-labelledby="talk-about-heading">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">You can talk about it</p>
            <h2 id="talk-about-heading" className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.045em]">Whatever brought you here, you deserve options.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--ink-muted)]">MY RIGHT makes room for difficult conversations about safety, control, harassment, violence, and the wellbeing of someone you care about.</p>
            <a href="/support" className="mt-7 inline-flex items-center font-semibold text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-8 transition-colors hover:decoration-[var(--accent)]">Start privately <span className="ml-3" aria-hidden="true">→</span></a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <div className="relative min-h-[230px] overflow-hidden rounded-[1.5rem] bg-[#dce8e2] sm:min-h-[310px]"><Image src="/images/images%20(8).jpg" alt="Person holding up a hand to ask for safety and space" fill sizes="(max-width: 768px) 50vw, 30vw" className="object-cover grayscale" /></div>
            <div className="relative mt-10 min-h-[230px] overflow-hidden rounded-[1.5rem] bg-[#e8ddd3] sm:min-h-[310px]"><Image src="/images/images%20(6).jpg" alt="A person reaching for support while someone sits in the background" fill sizes="(max-width: 768px) 50vw, 30vw" className="object-cover grayscale" /></div>
            <div className="relative col-span-2 h-32 overflow-hidden rounded-[1.5rem] bg-[#e3e7e4] sm:h-44"><Image src="/images/images%20(7).jpg" alt="A child receiving care and support" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover object-[center_38%] grayscale" /></div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pb-10 text-xs text-[var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 MY RIGHT</span><span>Built for privacy, dignity, and choice.</span><a href="#privacy" className="underline underline-offset-4">Privacy information</a></footer>
    </div>
  );
}
