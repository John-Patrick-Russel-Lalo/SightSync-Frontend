// import { useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Eye,
//   Glasses,
//   Aperture,
//   Droplets,
//   Stethoscope,
//   Sparkles,
//   ShieldCheck,
//   Clock,
//   Star,
//   Users,
//   ArrowRight,
//   Calendar,
//   Phone,
//   MapPin,
//   Mail,
//   Check,
//   Menu,
//   X,
//   Heart,
//   Package,
// } from "lucide-react";
// import GlassesScene from "./GlassesScene";

// const NAV_LINKS = [
//   { label: "Home", href: "#home" },
//   { label: "Services", href: "#services" },
//   { label: "Frames", href: "#frames" },
//   { label: "Why Us", href: "#why" },
//   { label: "Contact", href: "#contact" },
// ];

// const SERVICES = [
//   {
//     icon: Eye,
//     title: "Eye Check-up",
//     desc: "Comprehensive eye exams and vision tests by certified optometrists using modern diagnostic equipment.",
//     tag: "From ₱250",
//   },
//   {
//     icon: Aperture,
//     title: "Prescription Lenses",
//     desc: "Anti-glare, blue-light, progressive, and high-index lenses precision-cut to fit your exact prescription.",
//     tag: "Custom fit",
//   },
//   {
//     icon: Glasses,
//     title: "Designer Frames",
//     desc: "Trendy and durable frames for every face — from classic round to cat-eye, aviator, and rimless styles.",
//     tag: "100+ styles",
//   },
//   {
//     icon: Droplets,
//     title: "Contact Lenses",
//     desc: "Daily, bi-weekly, and monthly contact lens plans with proper fitting, care kits, and insertion training.",
//     tag: "All brands",
//   },
// ];

// const FEATURES = [
//   {
//     icon: Stethoscope,
//     title: "Computerized eye exams",
//     desc: "Accurate prescriptions powered by the latest vision testing technology.",
//   },
//   {
//     icon: ShieldCheck,
//     title: "Certified optometrists",
//     desc: "Licensed eye care professionals you can trust with your vision.",
//   },
//   {
//     icon: Clock,
//     title: "Same-day lens service",
//     desc: "Most prescriptions ready in as fast as 30 minutes in-clinic.",
//   },
//   {
//     icon: Package,
//     title: "Free adjustments",
//     desc: "Lifetime free frame alignment, cleaning, and minor repairs.",
//   },
// ];

// const FRAME_STYLES = [
//   { name: "Round", color: "#8B1E42" },
//   { name: "Square", color: "#C08A3E" },
//   { name: "Cat-eye", color: "#2B241F" },
//   { name: "Aviator", color: "#52795A" },
//   { name: "Rimless", color: "#B8AC88" },
//   { name: "Oversized", color: "#4A6FA5" },
// ];

// const STATS = [
//   { value: "12+", label: "Years in practice" },
//   { value: "15k", label: "Happy patients" },
//   { value: "4.9★", label: "Average rating" },
//   { value: "40+", label: "Certified optometrists" },
// ];

// export default function LandingPage() {
//   const [menuOpen, setMenuOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-[#EDE3D8] text-stone-800 font-sans">
//       {/* ------------------------------ NAV ------------------------------ */}
//       <header className="sticky top-0 z-30 bg-[#EDE3D8]/90 backdrop-blur border-b border-[#DCD0C0]/70">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-3">
//             <span className="bg-[#8B1E42] text-white p-2 rounded-xl shadow-sm">
//               <Eye className="w-5 h-5" />
//             </span>
//             <span className="font-bold text-lg text-stone-900 leading-none">
//               SightSync
//             </span>
//           </Link>

//           <nav className="hidden lg:flex items-center gap-8">
//             {NAV_LINKS.map((link) => (
//               <a
//                 key={link.href}
//                 href={link.href}
//                 className="text-sm font-medium text-stone-600 hover:text-[#8B1E42] transition"
//               >
//                 {link.label}
//               </a>
//             ))}
//           </nav>

//           <div className="hidden lg:flex items-center gap-3">
//             <Link
//               to="/login"
//               className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-[#E2D6C7] transition"
//             >
//               Sign in
//             </Link>
//             <Link
//               to="/login"
//               className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] transition shadow-sm"
//             >
//               Book a check-up
//             </Link>
//           </div>

//           <button
//             onClick={() => setMenuOpen((v) => !v)}
//             className="lg:hidden p-2 text-stone-700 hover:bg-[#E2D6C7] rounded-xl transition"
//             aria-label="Toggle navigation"
//           >
//             {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {menuOpen && (
//           <div className="lg:hidden px-6 pb-5 space-y-3">
//             {NAV_LINKS.map((link) => (
//               <a
//                 key={link.href}
//                 href={link.href}
//                 onClick={() => setMenuOpen(false)}
//                 className="block text-sm font-medium text-stone-700 hover:text-[#8B1E42] transition"
//               >
//                 {link.label}
//               </a>
//             ))}
//             <Link
//               to="/login"
//               className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] transition"
//             >
//               Sign in / Book a check-up
//             </Link>
//           </div>
//         )}
//       </header>

//       {/* ------------------------------ HERO ------------------------------ */}
//       <section id="home" className="relative">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-16 lg:pt-20 pb-16">
//           <div className="relative z-10">
//             <span className="inline-flex items-center gap-2 bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">
//               <Sparkles className="w-3.5 h-3.5" />
//               Optical clinic · Eye care · Eyewear shop
//             </span>

//             <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.05]">
//               See the world in{" "}
//               <span className="text-[#8B1E42]">perfect focus</span>.
//             </h1>

//             <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
//               From thorough eye check-ups and prescription lenses to designer
//               frames and comfortable contact lenses — SightSync has everything
//               you need for a clearer, brighter vision.
//             </p>

//             <div className="mt-8 flex flex-col sm:flex-row gap-3">
//               <a
//                 href="#services"
//                 className="inline-flex items-center justify-center gap-2 bg-[#8B1E42] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#731836] transition shadow-lg shadow-[#8B1E42]/20"
//               >
//                 <Calendar className="w-5 h-5" /> Book an eye check-up
//               </a>
//               <a
//                 href="#frames"
//                 className="inline-flex items-center justify-center gap-2 border-2 border-[#DCD0C0] bg-[#F8F3EC] text-stone-800 px-6 py-3.5 rounded-xl font-semibold hover:border-[#8B1E42]/50 hover:text-[#8B1E42] transition"
//               >
//                 <Glasses className="w-5 h-5" /> Browse frames
//               </a>
//             </div>

//             <div className="mt-8 flex items-center gap-6 text-sm text-stone-600">
//               <div className="flex items-center gap-2">
//                 <div className="flex text-amber-500">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="w-4 h-4 fill-current" />
//                   ))}
//                 </div>
//                 <span className="font-semibold text-stone-800">4.9/5</span>
//               </div>
//               <div className="h-4 w-px bg-[#DCD0C0]" />
//               <div className="flex items-center gap-2">
//                 <Users className="w-4 h-4 text-[#8B1E42]" />
//                 <span>Trusted by <strong className="text-stone-800">15,000+</strong> patients</span>
//               </div>
//             </div>
//           </div>

//           {/* 3D Scene */}
//           <div className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
//             <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#2B241F] via-[#3a2a1f] to-[#8B1E42]/40 overflow-hidden shadow-2xl">
//               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,138,62,0.18),transparent_60%)]" />
//               <GlassesScene />
//               <div className="absolute bottom-5 inset-x-5 flex items-center justify-between text-xs font-semibold text-[#EDE3D8]/80 bg-[#2B241F]/50 backdrop-blur px-4 py-3 rounded-2xl border border-white/10">
//                 <span className="flex items-center gap-2">
//                   <Glasses className="w-4 h-4 text-[#C08A3E]" /> Premium eyewear
//                 </span>
//                 <span className="hidden sm:inline-flex items-center gap-2">
//                   <Eye className="w-4 h-4 text-[#C08A3E]" /> EMA-certified lenses
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ------------------------------ SERVICES ------------------------------ */}
//       <section id="services" className="py-20 bg-[#F8F3EC] border-y border-[#DCD0C0]">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center max-w-2xl mx-auto">
//             <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E42]">
//               What we offer
//             </span>
//             <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
//               Complete eye care, all in one place
//             </h2>
//             <p className="mt-4 text-stone-600">
//               Whether you need a new prescription, stylish frames, or easy
//               contact lenses, our optical clinic has you covered.
//             </p>
//           </div>

//           <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {SERVICES.map((service) => {
//               const Icon = service.icon;
//               return (
//                 <div
//                   key={service.title}
//                   className="group bg-[#EDE3D8] border border-[#DCD0C0] rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
//                 >
//                   <div className="p-3 w-fit rounded-2xl bg-[#8B1E42] text-white shadow-sm group-hover:scale-105 transition">
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <h3 className="mt-5 text-lg font-bold text-stone-900">{service.title}</h3>
//                   <p className="mt-2 text-sm text-stone-600 leading-relaxed">{service.desc}</p>
//                   <span className="mt-4 inline-block text-xs font-bold text-[#8B1E42] bg-[#8B1E42]/10 border border-[#8B1E42]/15 px-3 py-1 rounded-full">
//                     {service.tag}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ------------------------------ FRAMES ------------------------------ */}
//       <section id="frames" className="py-20">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
//           <div className="relative order-last lg:order-first">
//             <div className="grid grid-cols-2 gap-5">
//               {FRAME_STYLES.map((style, i) => (
//                 <div
//                   key={style.name}
//                   className={`bg-white border border-[#DCD0C0] rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm hover:shadow-lg transition ${
//                     i % 3 === 0 ? "lg:-translate-y-3" : i % 3 === 1 ? "lg:translate-y-3" : ""
//                   }`}
//                 >
//                   <Glasses
//                     className="w-14 h-14 transition"
//                     style={{ color: style.color }}
//                     strokeWidth={1.5}
//                   />
//                   <span className="text-sm font-semibold text-stone-800">{style.name}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E42]">
//               Frame collection
//             </span>
//             <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
//               Frame styles that suit every face and fashion
//             </h2>
//             <p className="mt-4 text-stone-600 leading-relaxed">
//               Explore dozens of shapes, tints, and materials — from timeless
//               classics to runway trends. Try them on in-store with the help of
//               our eyewear stylists, or pick up your pair the same day.
//             </p>
//             <ul className="mt-6 space-y-3">
//               {[
//                 "Free in-store fitting and size consultation",
//                 "UV-protective lenses on every frame purchase",
//                 "Flexible bundles: frames + prescription lenses",
//               ].map((item) => (
//                 <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
//                   <span className="p-1 rounded-full bg-[#52795A]/15 text-[#52795A]">
//                     <Check className="w-4 h-4" />
//                   </span>
//                   {item}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </section>

//       {/* ------------------------------ WHY US / FEATURES ------------------------------ */}
//       <section id="why" className="py-20 bg-[#2B241F] text-[#EDE3D8]">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="max-w-2xl">
//             <span className="text-xs font-bold uppercase tracking-widest text-[#C08A3E]">
//               Why SightSync
//             </span>
//             <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
//               Modern care, measured by clarity
//             </h2>
//             <p className="mt-4 text-[#EDE3D8]/70 leading-relaxed">
//               We combine precise diagnostics with honest pricing so every
//               patient walks away seeing — and feeling — their best.
//             </p>
//           </div>

//           <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {FEATURES.map((feature) => {
//               const Icon = feature.icon;
//               return (
//                 <div
//                   key={feature.title}
//                   className="bg-[#EDE3D8]/5 border border-[#EDE3D8]/10 rounded-2xl p-6 hover:bg-[#EDE3D8]/10 transition"
//                 >
//                   <div className="p-3 w-fit rounded-2xl bg-[#C08A3E]/15 text-[#C08A3E]">
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <h3 className="mt-5 font-bold text-[#EDE3D8]">{feature.title}</h3>
//                   <p className="mt-2 text-sm text-[#EDE3D8]/60 leading-relaxed">{feature.desc}</p>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-[#EDE3D8]/10 pt-10">
//             {STATS.map((stat) => (
//               <div key={stat.label} className="text-center">
//                 <div className="text-3xl font-extrabold text-[#C08A3E]">{stat.value}</div>
//                 <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#EDE3D8]/60">
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ------------------------------ CTA ------------------------------ */}
//       <section className="py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="relative overflow-hidden bg-gradient-to-br from-[#8B1E42] to-[#731836] rounded-[2.5rem] px-8 py-14 lg:px-16 lg:py-16 text-center shadow-2xl">
//             <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#C08A3E]/20 blur-3xl" />
//             <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
//             <div className="relative">
//               <Heart className="w-10 h-10 mx-auto text-[#C08A3E]" />
//               <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold text-white">
//                 Your vision is our mission.
//               </h2>
//               <p className="mx-auto mt-4 max-w-xl text-[#EDE3D8]/85 leading-relaxed">
//                 Book your comprehensive eye check-up today and discover the
//                 perfect lens, frame, or contact lenses for your lifestyle.
//               </p>
//               <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
//                 <Link
//                   to="/login"
//                   className="inline-flex items-center justify-center gap-2 bg-white text-[#8B1E42] px-7 py-3.5 rounded-xl font-bold hover:bg-[#EDE3D8] transition shadow-lg"
//                 >
//                   Book a check-up <ArrowRight className="w-5 h-5" />
//                 </Link>
//                 <a
//                   href="#services"
//                   className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
//                 >
//                   Explore services
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ------------------------------ FOOTER ------------------------------ */}
//       <footer id="contact" className="bg-[#2B241F] text-[#EDE3D8]">
//         <div className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
//           <div>
//             <div className="flex items-center gap-3">
//               <span className="bg-[#8B1E42] text-white p-2 rounded-xl">
//                 <Eye className="w-5 h-5" />
//               </span>
//               <span className="font-bold text-lg leading-none">SightSync</span>
//             </div>
//             <p className="mt-4 text-sm text-[#EDE3D8]/60 leading-relaxed">
//               Modern optical care for lenses, frames, and contact lenses —
//               because everyone deserves a clearer view.
//             </p>
//           </div>

//           <div>
//             <h4 className="text-sm font-bold uppercase tracking-wider text-[#C08A3E]">Quick links</h4>
//             <ul className="mt-4 space-y-2.5 text-sm text-[#EDE3D8]/70">
//               {NAV_LINKS.map((link) => (
//                 <li key={link.href}>
//                   <a href={link.href} className="hover:text-[#EDE3D8] transition">
//                     {link.label}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-sm font-bold uppercase tracking-wider text-[#C08A3E]">Contact</h4>
//             <ul className="mt-4 space-y-2.5 text-sm text-[#EDE3D8]/70">
//               <li className="flex items-center gap-2">
//                 <MapPin className="w-4 h-4 shrink-0" /> 124 Vision Ave, Metro Manila
//               </li>
//               <li className="flex items-center gap-2">
//                 <Phone className="w-4 h-4 shrink-0" /> (02) 555-0199
//               </li>
//               <li className="flex items-center gap-2">
//                 <Mail className="w-4 h-4 shrink-0" /> hello@sightsync.ph
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-sm font-bold uppercase tracking-wider text-[#C08A3E]">Clinic hours</h4>
//             <ul className="mt-4 space-y-2.5 text-sm text-[#EDE3D8]/70">
//               <li>Mon – Fri: 8:00 AM – 7:00 PM</li>
//               <li>Saturday: 9:00 AM – 6:00 PM</li>
//               <li>Sunday: 10:00 AM – 3:00 PM</li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-[#EDE3D8]/10">
//           <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#EDE3D8]/50">
//             <span>© {new Date().getFullYear()} SightSync. All rights reserved.</span>
//             <span>Lenses · Frames · Contact Lenses · Eye Check-ups</span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Glasses,
  Aperture,
  Droplets,
  Star,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Mail,
  Calendar,
  ArrowRight,
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
    title: "Comprehensive Eye Examination",
    desc: "Accurate and thorough eye tests using modern diagnostic equipment.",
    tag: "From ₱250",
  },
  {
    icon: Aperture,
    title: "Prescription & Lens Solutions",
    desc: "Anti-glare, blue-light, progressive, and high-index lenses tailored to your prescription.",
    tag: "Custom fit",
  },
  {
    icon: Glasses,
    title: "Eyewear Fitting",
    desc: "Trendy and durable frames for every face — from classic round to modern styles.",
    tag: "100+ styles",
  },
  {
    icon: Droplets,
    title: "Contact Lens Care",
    desc: "Daily, bi-weekly, and monthly lenses with proper fitting, care kits, and insertion training.",
    tag: "All brands",
  },
];

const APPROACH_STEPS = [
  {
    title: "Listen to Your Needs",
    desc: "We get to know your lifestyle and vision goals.",
  },
  {
    title: "Personalized Solutions",
    desc: "We recommend what truly fits for you.",
  },
  {
    title: "Ongoing Support",
    desc: "Because your vision matters, always.",
  },
];

const WHY_US_FEATURES = [
  {
    title: "Personalized Care",
    desc: "Tailored solutions for your unique needs.",
  },
  {
    title: "Modern Technology",
    desc: "Advanced tools for accurate results.",
  },
  {
    title: "Professional Guidance",
    desc: "Licensed and experienced optometrists.",
  },
  {
    title: "Easy Appointment Experience",
    desc: "Book, visit, and get started — hassle-free.",
  },
];

const TESTIMONIALS = [
  {
    name: "Angela R.",
    role: "Patient",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    text: "The staff is so accommodating and professional. My new glasses are perfect!",
    stars: 5,
  },
  {
    name: "Mark D.",
    role: "Patient",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    text: "Fast, accurate, and very comfortable. The eye exam was thorough and explained well.",
    stars: 5,
  },
  {
    name: "Camilla S.",
    role: "Patient",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    text: "Great selection of frames and excellent service. I finally found the perfect pair!",
    stars: 5,
  },
];

const REVEAL_OFFSETS = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "-translate-x-10",
  right: "translate-x-10",
  scale: "scale-95",
  fade: "",
};

function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as: Tag = "div",
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const hidden = REVEAL_OFFSETS[variant] ?? REVEAL_OFFSETS.up;

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? "opacity-100 translate-x-0 translate-y-0 scale-100"
          : `opacity-0 ${hidden}`
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDE3D8] text-[#3D2E28] font-sans overflow-x-hidden">
      {/* ------------------------------ HEADER / NAV ------------------------------ */}
      <header className="sticky top-0 z-30 bg-[#EDE3D8]/90 backdrop-blur border-b border-[#DCD0C0]/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8B1E42] flex items-center justify-center text-white">
              <Eye className="w-5 h-5" />
            </div>
            <span className="font-bold text-2xl text-[#3D2E28] tracking-tight">
              SightSync
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-semibold text-[#5B4B41] hover:text-[#8B1E42] transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            <Link
              to="/login"
              className="text-base font-semibold text-[#3D2E28] hover:opacity-80 transition px-2"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full text-sm font-bold bg-[#8B1E42] text-white hover:bg-[#731836] transition shadow-sm"
            >
              Book a check-up
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-[#3D2E28] hover:bg-black/5 rounded-xl transition"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden px-6 pb-6 space-y-4 bg-[#EDE3D8]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-base font-semibold text-[#3D2E28] hover:text-[#8B1E42] transition"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/login"
                className="block text-center px-4 py-2 text-base font-semibold text-[#3D2E28]"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="block text-center px-6 py-3 rounded-full text-sm font-bold bg-[#8B1E42] text-white"
              >
                Book a check-up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ------------------------------ HERO ------------------------------ */}
      <section id="home" className="relative pt-8 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="up">
            <span className="inline-flex items-center bg-[#8B1E42]/10 text-[#8B1E42] px-4 py-2 rounded-full text-sm font-bold tracking-wide">
              Optical clinic · Eye care · Eyewear shop
            </span>

            <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#3D2E28] tracking-tight leading-[1.08]">
              See the world in <br />
              <span className="text-[#8B1E42]">perfect focus.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[#8B7562] leading-relaxed max-w-xl">
              From thorough eye check-ups and prescription lenses to designer
              frames and comfortable contact lenses — SightSync has everything you
              need for a clearer, brighter vision.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#services"
                className="inline-flex items-center gap-2.5 bg-[#8B1E42] text-white px-7 py-4 rounded-2xl text-base font-bold hover:bg-[#731836] transition shadow-md shadow-[#8B1E42]/15"
              >
                <Calendar className="w-5 h-5" />
                Book an eye check-up
              </a>
              <a
                href="#frames"
                className="inline-flex items-center gap-2.5 bg-[#F8F3EC] border border-[#E2D6C7] text-[#3D2E28] px-7 py-4 rounded-2xl text-base font-bold hover:bg-white transition"
              >
                <Glasses className="w-5 h-5 text-[#8B1E42]" /> Browse frames
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm sm:text-base text-[#8B7562]">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-[#3D2E28] ml-1 text-lg">4.9/5</span>
              </div>
              <div className="h-5 w-px bg-[#DCD0C0]" />
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8B1E42]" />
                <span>Trusted by <strong className="text-[#3D2E28] font-extrabold text-base">15,000+</strong> patients</span>
              </div>
            </div>
          </Reveal>

          {/* 3D Scene Wrapper */}
          <Reveal variant="fade" delay={150} className="relative h-[420px] sm:h-[500px] lg:h-[560px]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-[#2B241F] overflow-hidden shadow-2xl flex flex-col justify-between p-6">
              <div className="w-full h-full relative">
                <GlassesScene />
              </div>

              <div className="bg-[#3D2E28]/90 backdrop-blur border border-white/10 rounded-2xl px-5 py-3.5 flex items-center justify-between text-sm text-[#DCD0C0]">
                <span className="flex items-center gap-2 font-semibold">
                  <Glasses className="w-5 h-5 text-[#C08A3E]" /> Premium eyewear
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Eye className="w-5 h-5 text-[#C08A3E]" /> EMA-certified lenses
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ OUR SERVICES ------------------------------ */}
      <section id="services" className="py-20 bg-[#EDE3D8]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal variant="up" className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-sm font-extrabold uppercase tracking-widest text-[#8B7562]">
                OUR SERVICES
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2E28] leading-tight max-w-md">
                Complete Eye Care Under One Roof
              </h2>
            </div>
            <p className="text-base sm:text-lg text-[#8B7562] max-w-md leading-relaxed">
              From routine check-ups to stylish eyewear, we provide comprehensive eye care services to keep your vision clear and your eyes healthy.
            </p>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Reveal
                  key={service.title}
                  delay={idx * 120}
                  className="bg-[#F8F3EC] rounded-3xl p-7 border border-[#DCD0C0]/40 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#8B1E42]/10 flex items-center justify-center text-[#8B1E42]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="mt-6 text-lg font-extrabold text-[#3D2E28] leading-snug">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#8B7562] leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                  <div className="mt-6">
                    <span className="inline-block text-xs font-bold text-[#8B1E42] bg-[#8B1E42]/10 px-4 py-1.5 rounded-full">
                      {service.tag}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------ OUR APPROACH ------------------------------ */}
      <section className="py-20 bg-[#E8DDD0]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
          <Reveal variant="left" className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-lg bg-stone-300 aspect-[4/3] lg:aspect-auto">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                alt="Optometrist conducting an eye checkup"
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal variant="right" delay={100} className="lg:col-span-7 lg:pl-6">
            <span className="text-sm font-extrabold uppercase tracking-widest text-[#8B7562]">
              OUR APPROACH
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2E28] leading-tight">
              Care that goes beyond <br />
              the prescription.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#8B7562] leading-relaxed max-w-xl">
              We take time to understand your vision needs first, then guide you to the right solution — from eye examination to the eyewear you use every day.
            </p>

            <a
              href="#why"
              className="mt-6 inline-block bg-[#8B1E42] text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-[#731836] transition"
            >
              Learn More →
            </a>

            <div className="mt-10 space-y-6 border-t border-[#DCD0C0] pt-8">
              {APPROACH_STEPS.map((step, idx) => (
                <Reveal key={idx} delay={200 + idx * 120} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#8B1E42]/10 text-[#8B1E42] flex items-center justify-center shrink-0 font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#3D2E28]">{step.title}</h4>
                    <p className="text-sm text-[#8B7562] mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ WHY SIGHTSYNC ------------------------------ */}
      <section id="why" className="py-20 bg-[#EDE3D8]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal variant="up" className="text-center max-w-xl mx-auto">
            <span className="text-sm font-extrabold uppercase tracking-widest text-[#8B7562]">
              WHY SIGHTSYNC
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2E28]">
              More Than Just Eyewear. <br />
              It's a Better You.
            </h2>
          </Reveal>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {WHY_US_FEATURES.map((feat, idx) => (
              <Reveal key={idx} delay={idx * 120} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#8B1E42]/10 flex items-center justify-center text-[#8B1E42] mb-5">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#3D2E28]">{feat.title}</h3>
                <p className="mt-2 text-sm text-[#8B7562] max-w-xs leading-relaxed">
                  {feat.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ TESTIMONIALS ------------------------------ */}
      <section className="py-20 bg-[#F8F3EC] border-t border-[#DCD0C0]/40">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal variant="up" className="flex items-center justify-between mb-12">
            <div>
              <span className="text-sm font-extrabold uppercase tracking-widest text-[#8B7562]">
                REAL STORIES. CLEARER VISION.
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2E28]">
                What Our Patients Say
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full border border-[#DCD0C0] flex items-center justify-center text-[#5B4B41] hover:bg-white transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-[#DCD0C0] flex items-center justify-center text-[#5B4B41] hover:bg-white transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal
                key={i}
                delay={i * 120}
                className="bg-white rounded-3xl p-8 border border-[#DCD0C0]/40 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm text-[#8B7562] leading-relaxed italic">
                      "{t.text}"
                    </p>
                    <h4 className="mt-3 text-sm font-extrabold text-[#3D2E28]">{t.name}</h4>
                    <div className="flex text-amber-500 mt-1 gap-0.5">
                      {[...Array(t.stars)].map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ BOTTOM CTA BANNER ------------------------------ */}
      <section className="bg-[#8B1E42] text-white py-14 px-6">
        <Reveal variant="up" className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
              READY TO SEE THINGS DIFFERENTLY?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Take the first step toward better vision with SightSync.
            </h3>
          </div>
          <Link
            to="/login"
            className="px-7 py-3.5 rounded-full text-sm font-bold bg-white text-[#8B1E42] hover:bg-[#EDE3D8] transition shrink-0 inline-flex items-center gap-2"
          >
            Book a Check-up <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

      {/* ------------------------------ FOOTER ------------------------------ */}
      <footer id="contact" className="bg-[#2B241F] text-[#B9AAA4] text-sm">
        <Reveal variant="up" className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E42] flex items-center justify-center text-white shadow-md">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">SightSync</span>
            </div>
            <p className="text-sm text-[#B9AAA4]/80 leading-relaxed">
              Modern optical care dedicated to precision vision tests, designer frames, and high-quality prescription lenses.
            </p>
            <div className="pt-1 flex items-center gap-3 text-white/70">
              <span className="text-xs font-bold tracking-wider text-[#C08A3E]">OPTICAL CLINIC & EYEWEAR</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C08A3E] mb-4">Our Specialty</h4>
            <ul className="space-y-2.5 text-sm text-[#DCD0C0]">
              <li className="hover:text-white transition">Comprehensive Eye Exam</li>
              <li className="hover:text-white transition">Prescription & Blue-Light Lenses</li>
              <li className="hover:text-white transition">Designer & Custom Frames</li>
              <li className="hover:text-white transition">Contact Lens Fitting & Care</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C08A3E] mb-4">Clinic Hours</h4>
            <ul className="space-y-2.5 text-sm text-[#DCD0C0]">
              <li className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Monday – Friday</span>
                <span className="text-white/90 font-semibold">8:00 AM – 7:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Saturday</span>
                <span className="text-white/90 font-semibold">9:00 AM – 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-[#C08A3E] font-bold bg-[#C08A3E]/15 px-2.5 py-0.5 rounded text-xs">Closed</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C08A3E] mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-[#DCD0C0]">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C08A3E] shrink-0 mt-1" />
                <span>+63 912 345 6789 / (02) 8555-0199</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C08A3E] shrink-0 mt-1" />
                <span>123 Vision Street, Rizal City, Metro Manila</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C08A3E] shrink-0 mt-1" />
                <span>hello@sightsync.com</span>
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B9AAA4]/70">
          <span>© {new Date().getFullYear()} SightSync Optical Clinic. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Patient Care Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
}