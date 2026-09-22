import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Glasses,
  Aperture,
  Droplets,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Clock,
  Star,
  Users,
  ArrowRight,
  Calendar,
  Phone,
  MapPin,
  Mail,
  Check,
  Menu,
  X,
  Heart,
  Package,
} from "lucide-react";
import GlassesScene from "./GlassesScene";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Frames", href: "#frames" },
  { label: "Why Us", href: "#why" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    icon: Eye,
    title: "Eye Check-up",
    desc: "Comprehensive eye exams and vision tests by certified optometrists using modern diagnostic equipment.",
    tag: "From ₱250",
  },
  {
    icon: Aperture,
    title: "Prescription Lenses",
    desc: "Anti-glare, blue-light, progressive, and high-index lenses precision-cut to fit your exact prescription.",
    tag: "Custom fit",
  },
  {
    icon: Glasses,
    title: "Designer Frames",
    desc: "Trendy and durable frames for every face — from classic round to cat-eye, aviator, and rimless styles.",
    tag: "100+ styles",
  },
  {
    icon: Droplets,
    title: "Contact Lenses",
    desc: "Daily, bi-weekly, and monthly contact lens plans with proper fitting, care kits, and insertion training.",
    tag: "All brands",
  },
];

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Computerized eye exams",
    desc: "Accurate prescriptions powered by the latest vision testing technology.",
  },
  {
    icon: ShieldCheck,
    title: "Certified optometrists",
    desc: "Licensed eye care professionals you can trust with your vision.",
  },
  {
    icon: Clock,
    title: "Same-day lens service",
    desc: "Most prescriptions ready in as fast as 30 minutes in-clinic.",
  },
  {
    icon: Package,
    title: "Free adjustments",
    desc: "Lifetime free frame alignment, cleaning, and minor repairs.",
  },
];

const FRAME_STYLES = [
  { name: "Round", color: "#8B1E42" },
  { name: "Square", color: "#C08A3E" },
  { name: "Cat-eye", color: "#2B241F" },
  { name: "Aviator", color: "#52795A" },
  { name: "Rimless", color: "#B8AC88" },
  { name: "Oversized", color: "#4A6FA5" },
];

const STATS = [
  { value: "12+", label: "Years in practice" },
  { value: "15k", label: "Happy patients" },
  { value: "4.9★", label: "Average rating" },
  { value: "40+", label: "Certified optometrists" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDE3D8] text-stone-800 font-sans">
      {/* ------------------------------ NAV ------------------------------ */}
      <header className="sticky top-0 z-30 bg-[#EDE3D8]/90 backdrop-blur border-b border-[#DCD0C0]/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="bg-[#8B1E42] text-white p-2 rounded-xl shadow-sm">
              <Eye className="w-5 h-5" />
            </span>
            <span className="font-bold text-lg text-stone-900 leading-none">
              SightSync
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-600 hover:text-[#8B1E42] transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-[#E2D6C7] transition"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] transition shadow-sm"
            >
              Book a check-up
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-stone-700 hover:bg-[#E2D6C7] rounded-xl transition"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden px-6 pb-5 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-stone-700 hover:text-[#8B1E42] transition"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] transition"
            >
              Sign in / Book a check-up
            </Link>
          </div>
        )}
      </header>

      {/* ------------------------------ HERO ------------------------------ */}
      <section id="home" className="relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-16 lg:pt-20 pb-16">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Optical clinic · Eye care · Eyewear shop
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.05]">
              See the world in{" "}
              <span className="text-[#8B1E42]">perfect focus</span>.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              From thorough eye check-ups and prescription lenses to designer
              frames and comfortable contact lenses — SightSync has everything
              you need for a clearer, brighter vision.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 bg-[#8B1E42] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#731836] transition shadow-lg shadow-[#8B1E42]/20"
              >
                <Calendar className="w-5 h-5" /> Book an eye check-up
              </a>
              <a
                href="#frames"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#DCD0C0] bg-[#F8F3EC] text-stone-800 px-6 py-3.5 rounded-xl font-semibold hover:border-[#8B1E42]/50 hover:text-[#8B1E42] transition"
              >
                <Glasses className="w-5 h-5" /> Browse frames
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-stone-800">4.9/5</span>
              </div>
              <div className="h-4 w-px bg-[#DCD0C0]" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B1E42]" />
                <span>Trusted by <strong className="text-stone-800">15,000+</strong> patients</span>
              </div>
            </div>
          </div>

          {/* 3D Scene */}
          <div className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#2B241F] via-[#3a2a1f] to-[#8B1E42]/40 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,138,62,0.18),transparent_60%)]" />
              <GlassesScene />
              <div className="absolute bottom-5 inset-x-5 flex items-center justify-between text-xs font-semibold text-[#EDE3D8]/80 bg-[#2B241F]/50 backdrop-blur px-4 py-3 rounded-2xl border border-white/10">
                <span className="flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-[#C08A3E]" /> Premium eyewear
                </span>
                <span className="hidden sm:inline-flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C08A3E]" /> EMA-certified lenses
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ SERVICES ------------------------------ */}
      <section id="services" className="py-20 bg-[#F8F3EC] border-y border-[#DCD0C0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E42]">
              What we offer
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
              Complete eye care, all in one place
            </h2>
            <p className="mt-4 text-stone-600">
              Whether you need a new prescription, stylish frames, or easy
              contact lenses, our optical clinic has you covered.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group bg-[#EDE3D8] border border-[#DCD0C0] rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="p-3 w-fit rounded-2xl bg-[#8B1E42] text-white shadow-sm group-hover:scale-105 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-stone-900">{service.title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{service.desc}</p>
                  <span className="mt-4 inline-block text-xs font-bold text-[#8B1E42] bg-[#8B1E42]/10 border border-[#8B1E42]/15 px-3 py-1 rounded-full">
                    {service.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------ FRAMES ------------------------------ */}
      <section id="frames" className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative order-last lg:order-first">
            <div className="grid grid-cols-2 gap-5">
              {FRAME_STYLES.map((style, i) => (
                <div
                  key={style.name}
                  className={`bg-white border border-[#DCD0C0] rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm hover:shadow-lg transition ${
                    i % 3 === 0 ? "lg:-translate-y-3" : i % 3 === 1 ? "lg:translate-y-3" : ""
                  }`}
                >
                  <Glasses
                    className="w-14 h-14 transition"
                    style={{ color: style.color }}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-semibold text-stone-800">{style.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E42]">
              Frame collection
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              Frame styles that suit every face and fashion
            </h2>
            <p className="mt-4 text-stone-600 leading-relaxed">
              Explore dozens of shapes, tints, and materials — from timeless
              classics to runway trends. Try them on in-store with the help of
              our eyewear stylists, or pick up your pair the same day.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Free in-store fitting and size consultation",
                "UV-protective lenses on every frame purchase",
                "Flexible bundles: frames + prescription lenses",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
                  <span className="p-1 rounded-full bg-[#52795A]/15 text-[#52795A]">
                    <Check className="w-4 h-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------ WHY US / FEATURES ------------------------------ */}
      <section id="why" className="py-20 bg-[#2B241F] text-[#EDE3D8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C08A3E]">
              Why SightSync
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
              Modern care, measured by clarity
            </h2>
            <p className="mt-4 text-[#EDE3D8]/70 leading-relaxed">
              We combine precise diagnostics with honest pricing so every
              patient walks away seeing — and feeling — their best.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-[#EDE3D8]/5 border border-[#EDE3D8]/10 rounded-2xl p-6 hover:bg-[#EDE3D8]/10 transition"
                >
                  <div className="p-3 w-fit rounded-2xl bg-[#C08A3E]/15 text-[#C08A3E]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 font-bold text-[#EDE3D8]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[#EDE3D8]/60 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-[#EDE3D8]/10 pt-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-[#C08A3E]">{stat.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#EDE3D8]/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA ------------------------------ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#8B1E42] to-[#731836] rounded-[2.5rem] px-8 py-14 lg:px-16 lg:py-16 text-center shadow-2xl">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#C08A3E]/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <Heart className="w-10 h-10 mx-auto text-[#C08A3E]" />
              <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold text-white">
                Your vision is our mission.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#EDE3D8]/85 leading-relaxed">
                Book your comprehensive eye check-up today and discover the
                perfect lens, frame, or contact lenses for your lifestyle.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#8B1E42] px-7 py-3.5 rounded-xl font-bold hover:bg-[#EDE3D8] transition shadow-lg"
                >
                  Book a check-up <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Explore services
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ FOOTER ------------------------------ */}
      <footer id="contact" className="bg-[#2B241F] text-[#EDE3D8]">
        <div className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#8B1E42] text-white p-2 rounded-xl">
                <Eye className="w-5 h-5" />
              </span>
              <span className="font-bold text-lg leading-none">SightSync</span>
            </div>
            <p className="mt-4 text-sm text-[#EDE3D8]/60 leading-relaxed">
              Modern optical care for lenses, frames, and contact lenses —
              because everyone deserves a clearer view.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C08A3E]">Quick links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#EDE3D8]/70">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[#EDE3D8] transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C08A3E]">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#EDE3D8]/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" /> 124 Vision Ave, Metro Manila
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" /> (02) 555-0199
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" /> hello@sightsync.ph
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C08A3E]">Clinic hours</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#EDE3D8]/70">
              <li>Mon – Fri: 8:00 AM – 7:00 PM</li>
              <li>Saturday: 9:00 AM – 6:00 PM</li>
              <li>Sunday: 10:00 AM – 3:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#EDE3D8]/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#EDE3D8]/50">
            <span>© {new Date().getFullYear()} SightSync. All rights reserved.</span>
            <span>Lenses · Frames · Contact Lenses · Eye Check-ups</span>
          </div>
        </div>
      </footer>
    </div>
  );
}