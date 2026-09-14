

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function AuthPage() {
//   const { login, register, API_BASE } = useAuth();
//   const navigate = useNavigate();

//   const [isLogin, setIsLogin] = useState(true);
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // Form inputs
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSubmitting(true);

//     try {
//       if (isLogin) {
//         // 1. Perform login and retrieve user object
//         const user = await login(email, password);

//         // 2. Route based on user role (falls back to user object or decoded role)
//         const role = user?.role;

//         if (role === "admin") {
//           navigate("/admin", { replace: true });
//         } else if (role === "doctor") {
//           navigate("/doctor/dashboard", { replace: true });
//         } else {
//           navigate("/dashboard", { replace: true });
//         }
//       } else {
//         await register({ firstName, lastName, email, password });
//         setIsLogin(true);
//         setError("Account created successfully! Please sign in.");
//       }
//     } catch (err) {
//       setError(err?.message || "An error occurred during authentication.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
//         <h2 className="text-2xl font-bold text-slate-100 mb-1">
//           {isLogin ? "Welcome Back" : "Create Account"}
//         </h2>
//         <p className="text-sm text-slate-400 mb-6">
//           {isLogin ? "Sign in to access your dashboard" : "Get started with your new account"}
//         </p>

//         {error && (
//           <div
//             className={`p-3 rounded-md text-sm border mb-4 ${
//               error.includes("successfully")
//                 ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
//                 : "bg-red-950/50 text-red-400 border-red-800"
//             }`}
//           >
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {!isLogin && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="John"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Doe"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           )}

//           <div>
//             <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
//             <input
//               type="email"
//               required
//               placeholder="john@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
//             <input
//               type="password"
//               required
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
//           >
//             {submitting ? "Processing..." : isLogin ? "Sign In" : "Register"}
//           </button>
//         </form>

//         {/* Divider */}
//         <div className="relative my-6 text-center">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-t border-slate-700"></div>
//           </div>
//           <span className="relative bg-slate-800 px-3 text-xs text-slate-400 font-medium uppercase">
//             Or continue with
//           </span>
//         </div>

//         {/* OAuth Endpoints */}
//         <div className="space-y-2">
//           <a
//             href={`${API_BASE}/github`}
//             className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-950 text-white font-medium py-2 rounded-lg text-sm border border-slate-700 transition-colors"
//           >
//             GitHub
//           </a>
//           <a
//             href={`${API_BASE}/google`}
//             className="w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg text-sm transition-colors"
//           >
//             Google
//           </a>
//           <a
//             href={`${API_BASE}/facebook`}
//             className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
//           >
//             Facebook
//           </a>
//         </div>

//         {/* Toggle Mode */}
//         <div className="mt-6 text-center text-sm text-slate-400">
//           {isLogin ? (
//             <p>
//               Don't have an account?{" "}
//               <button
//                 type="button"
//                 onClick={() => setIsLogin(false)}
//                 className="text-blue-400 hover:underline font-medium"
//               >
//                 Sign up
//               </button>
//             </p>
//           ) : (
//             <p>
//               Already have an account?{" "}
//               <button
//                 type="button"
//                 onClick={() => setIsLogin(true)}
//                 className="text-blue-400 hover:underline font-medium"
//               >
//                 Sign in
//               </button>
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GitHubIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      {...props}
    >
      <path d="M12 .3a12 12 0 00-3.8 23.38c.6.1.83-.26.83-.58v-2.17c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.08 1.83 2.83 1.31 3.52 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0012 .3z" />
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="12" fill="#fff" />

      <path
        fill="#4285F4"
        d="M21.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.36c-.23 1.24-.94 2.29-2 3v2.49h3.24c1.9-1.75 2.96-4.32 2.96-7.5z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.89 6.6-2.42l-3.24-2.49c-.9.6-2.04.96-3.36.96-2.58 0-4.77-1.74-5.55-4.08H3.11v2.56C4.74 19.62 8.1 22 12 22z"
      />

      <path
        fill="#FBBC05"
        d="M6.45 13.97a5.9 5.9 0 010-3.94V7.47H3.11a10 10 0 000 9.06l3.34 2.56z"
      />

      <path
        fill="#EA4335"
        d="M12 6.02c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.98 14.7 2 12 2 8.1 2 4.74 4.38 3.11 7.47l3.34 2.56C7.23 7.76 9.42 6.02 12 6.02z"
      />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      {...props}
    >
      <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, register, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        const role = user?.role;

        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "doctor") {
          navigate("/doctor/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        await register({
          firstName,
          lastName,
          email,
          password,
        });

        setIsLogin(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setError("Account created successfully! Please sign in.");
      }
    } catch (err) {
      setError(
        err?.message ||
          (isLogin
            ? "Login failed"
            : "An error occurred during registration.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#f8f3ee] px-4 py-10">

      {/* =====================================================
          BACKGROUND WAVES
      ====================================================== */}

      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          {/* BASE */}
          <rect
            width="1600"
            height="900"
            fill="#f8f3ee"
          />

          {/* TOP LEFT LARGE WAVE */}
          <path
            d="
              M0 0
              H1600
              V115
              C1450 160 1320 155 1190 110
              C1040 58 940 35 790 55
              C620 78 520 155 350 145
              C210 137 105 75 0 30
              Z
            "
            fill="#ddd0c5"
          />

          {/* TOP WHITE FLOW */}
          <path
            d="
              M0 0
              H1600
              V70
              C1430 120 1300 115 1170 70
              C1030 22 930 5 790 25
              C620 50 510 120 350 110
              C205 100 100 45 0 10
              Z
            "
            fill="#fffdfb"
          />

          {/* FIRST MAIN BEIGE WAVE */}
          <path
            d="
              M0 190
              C170 175 290 210 430 280
              C585 358 720 395 870 365
              C1035 332 1150 235 1300 190
              C1425 152 1515 160 1600 185
              V330
              C1490 305 1400 320 1280 375
              C1120 448 1010 535 850 555
              C675 575 530 510 380 430
              C220 345 110 315 0 330
              Z
            "
            fill="#d7c8bd"
          />

          {/* MAIN WHITE WAVE */}
          <path
            d="
              M0 305
              C170 285 300 330 450 405
              C605 485 735 525 885 495
              C1045 462 1165 355 1315 295
              C1430 248 1520 250 1600 270
              V420
              C1480 395 1390 425 1270 485
              C1110 565 1000 655 835 670
              C660 685 515 615 365 530
              C215 445 105 425 0 455
              Z
            "
            fill="#fffdfb"
          />

          {/* LOWER BEIGE WAVE */}
          <path
            d="
              M0 485
              C145 465 275 500 410 570
              C570 652 700 720 855 705
              C1015 690 1135 595 1280 530
              C1415 470 1515 475 1600 505
              V700
              C1470 670 1375 705 1250 775
              C1085 865 960 920 790 900
              C600 880 455 795 305 705
              C170 625 80 610 0 635
              Z
            "
            fill="#d8c9be"
          />

          {/* LOWER WHITE WAVE */}
          <path
            d="
              M0 650
              C135 615 255 635 390 705
              C545 785 670 855 825 875
              C980 895 1100 825 1245 745
              C1395 660 1510 650 1600 675
              V900
              H0
              Z
            "
            fill="#fffdfb"
          />

          {/* RIGHT TOP SOFT WAVE */}
          <path
            d="
              M930 0
              C1050 70 1150 115 1280 120
              C1410 125 1510 90 1600 45
              V0
              Z
            "
            fill="#ded1c7"
            opacity="0.9"
          />

          {/* SMOOTH WHITE LINES */}
          <path
            d="
              M0 245
              C175 250 300 315 455 395
              C610 475 750 510 895 480
              C1050 448 1170 360 1320 285
              C1435 228 1520 220 1600 235
            "
            fill="none"
            stroke="#fffdfb"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <path
            d="
              M0 285
              C175 295 305 360 455 440
              C615 525 755 555 905 525
              C1060 495 1185 405 1330 335
              C1450 275 1535 270 1600 285
            "
            fill="none"
            stroke="#fffdfb"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* TOP RIGHT CURVE */}
          <path
            d="
              M920 0
              C1050 75 1140 145 1270 175
              C1400 205 1515 175 1600 135
            "
            fill="none"
            stroke="#fffdfb"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* LOWER RIGHT CURVE */}
          <path
            d="
              M900 900
              C1030 800 1145 705 1290 635
              C1420 575 1520 570 1600 590
            "
            fill="none"
            stroke="#fffdfb"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* LOWER LEFT CURVE */}
          <path
            d="
              M0 700
              C140 675 265 710 400 785
              C535 860 650 900 790 915
            "
            fill="none"
            stroke="#fffdfb"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* SOFT LIGHT */}
          <ellipse
            cx="800"
            cy="450"
            rx="570"
            ry="450"
            fill="#ffffff"
            opacity="0.12"
          />

        </svg>
      </div>

      {/* =====================================================
          GLASS LOGIN CARD
      ====================================================== */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-[24px]
          border
          border-white/80
          bg-white/25
          backdrop-blur-[26px]
          shadow-[0_30px_75px_rgba(80,45,35,0.18)]
          p-8
          overflow-hidden
        "
      >

        {/* GLASS HIGHLIGHT */}

        <div
          className="
            absolute
            inset-0
            rounded-[24px]
            pointer-events-none
            bg-gradient-to-br
            from-white/35
            via-white/10
            to-transparent
          "
        />

        <div className="relative z-10">

          {/* HEADER */}

          <div className="flex flex-col items-center text-center mb-6">

            <div className="mb-3">
              <h1 className="text-[34px] font-serif tracking-wide leading-none">

                <span className="text-[#8A0033] font-semibold">
                  Sight
                </span>

                <span className="text-[#B49A89] font-normal">
                  Sync
                </span>

              </h1>
            </div>

            <p className="text-sm text-[#967f76]">
              {isLogin
                ? "Sign in to access your eye care dashboard"
                : "Create your eye care dashboard account"}
            </p>

          </div>

          {/* FORM */}

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >

            {!isLogin && (
              <>
                {/* FIRST NAME */}

                <div>
                  <label className="block text-xs font-medium text-[#7d1535] mb-1.5">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                    className="
                      w-full
                      rounded-lg
                      bg-white/45
                      backdrop-blur-md
                      border
                      border-white/75
                      px-3
                      py-2.5
                      text-sm
                      text-[#493a36]
                      placeholder-[#b9aaa4]
                      shadow-[inset_0_1px_3px_rgba(255,255,255,0.65)]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#8a183d]/25
                      focus:border-[#8a183d]
                    "
                  />
                </div>

                {/* LAST NAME */}

                <div>
                  <label className="block text-xs font-medium text-[#7d1535] mb-1.5">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                    className="
                      w-full
                      rounded-lg
                      bg-white/45
                      backdrop-blur-md
                      border
                      border-white/75
                      px-3
                      py-2.5
                      text-sm
                      text-[#493a36]
                      placeholder-[#b9aaa4]
                      shadow-[inset_0_1px_3px_rgba(255,255,255,0.65)]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#8a183d]/25
                      focus:border-[#8a183d]
                    "
                  />
                </div>
              </>
            )}

            {/* EMAIL */}

            <div>

              <label className="block text-xs font-medium text-[#7d1535] mb-1.5">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-[#96766b]
                  "
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="
                    w-full
                    rounded-lg
                    bg-white/45
                    backdrop-blur-md
                    border
                    border-white/75
                    pl-9
                    pr-3
                    py-2.5
                    text-sm
                    text-[#493a36]
                    placeholder-[#b9aaa4]
                    shadow-[inset_0_1px_3px_rgba(255,255,255,0.65)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#8a183d]/25
                    focus:border-[#8a183d]
                  "
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-xs font-medium text-[#7d1535] mb-1.5">
                Password
              </label>

              <div className="relative">

                <Lock
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-[#96766b]
                  "
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="
                    w-full
                    rounded-lg
                    bg-white/45
                    backdrop-blur-md
                    border
                    border-white/75
                    pl-9
                    pr-3
                    py-2.5
                    text-sm
                    text-[#493a36]
                    placeholder-[#b9aaa4]
                    shadow-[inset_0_1px_3px_rgba(255,255,255,0.65)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#8a183d]/25
                    focus:border-[#8a183d]
                  "
                />

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <p
                className={`text-sm text-center ${
                  error.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={submitting}
              className="
                w-full
                rounded-lg
                bg-gradient-to-b
                from-[#951b43]
                to-[#791331]
                hover:from-[#a51f49]
                hover:to-[#861638]
                transition-colors
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-[0_8px_20px_rgba(121,19,49,0.25)]
                disabled:opacity-70
              "
            >
              {submitting
                ? isLogin
                  ? "Signing In..."
                  : "Registering..."
                : isLogin
                ? "Sign In"
                : "Register"}
            </button>

          </form>

          {/* DIVIDER */}

          <div className="flex items-center gap-3 my-6">

            <div className="h-px flex-1 bg-[#d8cbc4]" />

            <span className="text-xs tracking-wide text-[#9b837a]">
              OR CONTINUE WITH
            </span>

            <div className="h-px flex-1 bg-[#d8cbc4]" />

          </div>

          {/* SOCIAL BUTTONS */}

          <div className="space-y-3">

            <div className="grid grid-cols-2 gap-3">

              {/* GITHUB - ORIGINAL FUNCTIONALITY */}

              <a
                href={`${API_BASE}/github`}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#292525]
                  hover:bg-[#201d1d]
                  border
                  border-[#292525]
                  py-2.5
                  text-sm
                  text-white
                  transition-colors
                  no-underline
                "
              >
                <GitHubIcon className="w-4 h-4" />
                GitHub
              </a>

              {/* GOOGLE */}

            <a
              href={`${API_BASE}/google`}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-white/65
                hover:bg-white/80
                backdrop-blur-md
                border
                border-white/80
                py-2.5
                text-sm
                text-[#493a36]
                transition-colors
                no-underline
              "
            >
              <GoogleIcon />
              Google
            </a>

            </div>

            {/* FACEBOOK */}

            <a
              href={`${API_BASE}/facebook`}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-blue-700
                hover:bg-blue-800
                py-2.5
                text-sm
                text-white
                transition-colors
                no-underline
              "
            >
              <FacebookIcon />
              Facebook
            </a>

          </div>

          {/* SIGN UP / SIGN IN */}

          <p className="text-center text-sm text-[#927b73] mt-6">

            {isLogin ? (
              <>
                Don't have an account?{" "}

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className="text-[#821638] hover:text-[#6d112e] font-medium bg-transparent border-0 p-0 cursor-pointer"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className="text-[#821638] hover:text-[#6d112e] font-medium bg-transparent border-0 p-0 cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}

          </p>

        </div>

      </div>

      {/* FOOTER */}

      <p className="absolute bottom-4 z-10 text-xs text-[#9b8279] tracking-wide">
        Excellence in Eyecare, Managed Online
      </p>

    </div>
  );
}