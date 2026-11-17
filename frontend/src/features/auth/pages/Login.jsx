import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

// ── Google Fonts import via style tag ─────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap";

// ── Field wrapper — defined at module scope so React never
//    treats it as a new component type between renders ─────────
function FieldWrap({ fieldRef, name, label, isFocused, hasValue, onFocus, onBlur, children }) {
  return (
    <div
      ref={fieldRef}
      className="relative pb-6 flex flex-col gap-2"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* Label */}
      <label
        htmlFor={`login-${name}`}
        className={[
          "block font-['Inter'] text-[11px] font-bold tracking-[0.14em] uppercase mb-[1em] transition-colors duration-300",
          isFocused || hasValue ? "text-[#F5C518]" : "text-[rgba(209,197,172,0.55)]",
        ].join(" ")}
      >
        {label}
      </label>
      {children}
      {/* Animated bottom underline */}
      <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[rgba(255,255,255,0.1)] mb-6">
        <div
          className="underline-fill absolute inset-0 bg-[#F5C518] origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

export default function Login() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Refs ────────────────────────────────────────────────────
  const containerRef  = useRef(null);
  const leftRef       = useRef(null);
  const rightRef      = useRef(null);
  const stripeRef     = useRef(null);
  const logoRef       = useRef(null);
  const taglineRef    = useRef(null);
  const formHeaderRef = useRef(null);
  const emailRef      = useRef(null);
  const passwordRef   = useRef(null);
  const forgotRef     = useRef(null);
  const btnRef        = useRef(null);
  const footerRef     = useRef(null);
  const particlesRef  = useRef([]);

  // ── Load Google Fonts once ──────────────────────────────────
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // ── GSAP animations ─────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 1024;

      // Initial states — slide direction flips on mobile
      gsap.set(leftRef.current,       { x: isMobile ? 0 : "100%", y: isMobile ? 60 : 0, opacity: 0 });
      gsap.set(rightRef.current,      { x: isMobile ? 0 : "-100%", y: isMobile ? -60 : 0, opacity: 0 });
      gsap.set(stripeRef.current,     { scaleX: 0, transformOrigin: "right center" });
      gsap.set(logoRef.current,       { y: 60, opacity: 0 });
      gsap.set(taglineRef.current,    { y: 40, opacity: 0 });
      gsap.set(formHeaderRef.current, { y: -30, opacity: 0 });
      gsap.set(emailRef.current,      { y: 40, opacity: 0 });
      gsap.set(passwordRef.current,   { y: 40, opacity: 0 });
      gsap.set(forgotRef.current,     { y: 20, opacity: 0 });
      gsap.set(btnRef.current,        { y: 30, opacity: 0, scale: 0.95 });
      gsap.set(footerRef.current,     { y: 20, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(rightRef.current,      { x: "0%", y: 0, opacity: 1, duration: 0.85 })
        .to(leftRef.current,       { x: "0%", y: 0, opacity: 1, duration: 0.85 }, "-=0.65")
        .to(stripeRef.current,     { scaleX: 1, duration: 0.8, ease: "power4.inOut" }, "-=0.5")
        .to(logoRef.current,       { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
        .to(taglineRef.current,    { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
        .to(formHeaderRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.8")
        .to(emailRef.current,      { y: 0, opacity: 1, duration: 0.5 }, "-=0.35")
        .to(passwordRef.current,   { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
        .to(forgotRef.current,     { y: 0, opacity: 1, duration: 0.4 }, "-=0.2")
        .to(btnRef.current,        { y: 0, opacity: 1, scale: 1, duration: 0.5 }, "-=0.15")
        .to(footerRef.current,     { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");

      // Stripe shimmer
      gsap.to(stripeRef.current, {
        backgroundPosition: "200% center",
        duration: 3,
        ease: "none",
        repeat: -1,
      });

      // Floating particles
      particlesRef.current.forEach((p) => {
        if (!p) return;
        gsap.set(p, {
          x: Math.random() * 400,
          y: Math.random() * 600,
          opacity: Math.random() * 0.45 + 0.1,
          scale: Math.random() * 0.8 + 0.2,
        });
        gsap.to(p, {
          y: `-=${Math.random() * 100 + 50}`,
          x: `+=${(Math.random() - 0.5) * 60}`,
          opacity: 0,
          duration: Math.random() * 4 + 3,
          repeat: -1,
          delay: Math.random() * 4,
          ease: "power1.inOut",
          onRepeat: () => {
            gsap.set(p, {
              y: Math.random() * 600,
              x: Math.random() * 400,
              opacity: Math.random() * 0.45 + 0.1,
            });
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    gsap.to(btnRef.current, {
      scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut",
    });
    const res = await handleLogin({ email: formData.email, password: formData.password });
    if (res) {
      if (res.user.role === "seller") {
        navigate("/seller/products");
      } else {
        navigate("/");
      }
    }
    setIsSubmitting(false);
  };

  const onFieldFocus = (ref, name) => {
    setFocusedField(name);
    gsap.to(ref.current.querySelector(".underline-fill"), {
      scaleX: 1, duration: 0.35, ease: "power2.out",
    });
  };

  const onFieldBlur = (ref) => {
    setFocusedField(null);
    gsap.to(ref.current.querySelector(".underline-fill"), {
      scaleX: 0, duration: 0.3, ease: "power2.in",
    });
  };

  const onBtnHover = (enter) => {
    gsap.to(btnRef.current, {
      scale: enter ? 1.03 : 1,
      boxShadow: enter
        ? "0 0 40px rgba(245,197,24,0.45)"
        : "0 0 0px rgba(245,197,24,0)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  // (FieldWrap is defined at module scope above — see top of file)

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:flex-row w-screen min-h-screen overflow-x-hidden bg-[#0a0a0a]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── TOP on mobile / RIGHT on desktop: BRAND HERO ─────── */}
      <div
        ref={rightRef}
        className="relative lg:order-last flex-shrink-0 w-full lg:w-[45%] min-h-[220px] sm:min-h-[260px] lg:min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
        style={{ borderBottom: "1px solid rgba(245,197,24,0.12)" }}
      >
        {/* Floating particles — hidden on mobile for perf */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none z-[1]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              ref={(el) => (particlesRef.current[i] = el)}
              className="absolute w-[4px] h-[4px] bg-[#F5C518] opacity-30"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
          ))}
        </div>

        {/* Diagonal stripe */}
        <div
          ref={stripeRef}
          className="absolute z-0 opacity-90"
          style={{
            bottom: "-10%",
            right: "-20%",
            width: "140%",
            height: "55%",
            background: "linear-gradient(105deg, #F5C518 0%, #FFD700 35%, #F5C518 50%, #e8b800 65%, #F5C518 100%)",
            backgroundSize: "200% 100%",
            transform: "rotate(-15deg) skewY(-5deg)",
            transformOrigin: "right center",
            clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        />

        {/* Corner accents — desktop only */}
        <div className="hidden lg:block absolute top-7 left-7 w-[60px] h-[60px] z-[2] opacity-50"
          style={{ border: "2px solid #F5C518", borderRight: "none", borderBottom: "none" }} />
        <div className="hidden lg:block absolute bottom-7 right-7 w-[60px] h-[60px] z-[2] opacity-50"
          style={{ border: "2px solid #F5C518", borderLeft: "none", borderTop: "none" }} />

        {/* Content */}
        <div className="relative z-[3] flex flex-col gap-4 lg:gap-10 w-full max-w-[420px] px-6 py-6 lg:px-10 lg:py-10">

          {/* Brand */}
          <div ref={logoRef} className="flex flex-col gap-1.5 lg:gap-2.5">
            <span
              className="font-['Inter'] text-[10px] lg:text-[11px] font-bold tracking-[0.22em] uppercase px-2 lg:px-3 py-1 w-fit"
              style={{ background: "#F5C518", color: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}
            >
              EXCLUSIVE
            </span>
            <h1
              className="font-['Montserrat'] font-black leading-none tracking-[-0.04em] text-[#ffffff]"
              style={{
                fontSize: "clamp(40px, 10vw, 96px)",
                color: "#ffffff",
                fontFamily: "'Montserrat', sans-serif",
                textShadow: "0 0 60px rgba(245,197,24,0.2)",
              }}
            >
              ECOMFY
            </h1>
            <div className="w-14 lg:w-20 h-1 bg-[#F5C518]" />
          </div>

          {/* Tagline — hidden on small mobile, shown sm+ */}
          <div ref={taglineRef} className="hidden sm:flex flex-col gap-1">
            <h2
              className="font-['Montserrat'] font-extrabold tracking-[0.06em] leading-[1.1]"
              style={{
                fontSize: "clamp(22px, 3.2vw, 44px)",
                color: "#ffffff",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              WELCOME
            </h2>
            <h2
              className="font-['Montserrat'] font-black tracking-[0.06em] leading-[1.1]"
              style={{
                fontSize: "clamp(22px, 3.2vw, 44px)",
                color: "#F5C518",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              BACK
            </h2>
            <p
              className="hidden lg:block font-['Inter'] text-sm leading-relaxed mt-3 max-w-[300px]"
              style={{ color: "rgba(229,226,225,0.5)", fontFamily: "'Inter', sans-serif" }}
            >
              Your drops are waiting. Sign in to browse, track orders, and stay ahead of the next release.
            </p>
          </div>

          {/* Stats — desktop only */}
          <div
            className="hidden lg:flex items-center gap-6 pt-3"
            style={{ borderTop: "1px solid rgba(245,197,24,0.15)" }}
          >
            {[
              { num: "2M+", label: "MEMBERS" },
              { num: "500+", label: "BRANDS" },
              { num: "24/7", label: "SUPPORT" },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <span
                    className="font-['Montserrat'] font-extrabold tracking-[-0.02em]"
                    style={{ fontSize: "22px", color: "#F5C518", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {s.num}
                  </span>
                  <span
                    className="font-['Inter'] font-bold tracking-[0.15em]"
                    style={{ fontSize: "10px", color: "rgba(229,226,225,0.38)", fontFamily: "'Inter', sans-serif" }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-9 bg-[rgba(245,197,24,0.15)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM on mobile / LEFT on desktop: FORM PANEL ───── */}
      <div
        ref={leftRef}
        className="relative flex-1 bg-[#0e0e0e] flex items-center justify-center px-5 sm:px-8 py-10 lg:py-12 overflow-y-auto"
        style={{ borderTop: "none" }}
      >
        <div className="w-full max-w-[420px] flex flex-col gap-6 lg:gap-8">

          {/* Form header */}
          <div ref={formHeaderRef} className="flex flex-col gap-2 lg:gap-3">
            <span
              className="font-['Inter'] text-[11px] font-bold tracking-[0.22em] uppercase"
              style={{ color: "#F5C518" }}
            >
              MEMBER PORTAL
            </span>
            <h2
              className="font-['Montserrat'] font-extrabold leading-[1.15] tracking-[-0.02em]"
              style={{ color: "#e5e2e1", fontSize: "clamp(24px, 5vw, 40px)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Sign In
            </h2>
            <p className="font-['Inter'] text-sm text-[rgba(229,226,225,0.42)] leading-relaxed">
              Welcome back. Your wardrobe awaits.
            </p>
          </div>

          {/* Form */}
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Email */}
            <FieldWrap
              fieldRef={emailRef}
              name="email"
              label="Email ID"
              isFocused={focusedField === "email"}
              hasValue={!!formData.email}
              onFocus={() => onFieldFocus(emailRef, "email")}
              onBlur={() => onFieldBlur(emailRef)}
            >
              <div className="flex  items-center gap-3 ">
                <span
                  className="flex-shrink-0 flex items-center transition-colors duration-300"
                  style={{ color: focusedField === "email" ? "#F5C518" : "rgba(209,197,172,0.38)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={focusedField === "email" ? "you@example.com" : ""}
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#e5e2e1] pb-2 caret-[#F5C518] placeholder:text-[rgba(209,197,172,0.22)] placeholder:text-[13px]"
                  style={{ fontFamily: "'Inter', sans-serif" ,padding:"0.6rem"}}
                />
              </div>
            </FieldWrap>

            {/* Password */}
            <FieldWrap
              fieldRef={passwordRef}
              name="password"
              label="Password"
              isFocused={focusedField === "password"}
              hasValue={!!formData.password}
              onFocus={() => onFieldFocus(passwordRef, "password")}
              onBlur={() => onFieldBlur(passwordRef)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex-shrink-0 flex items-center transition-colors duration-300"
                  style={{ color: focusedField === "password" ? "#F5C518" : "rgba(209,197,172,0.38)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={focusedField === "password" ? "Your password" : ""}
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#e5e2e1] pb-2 caret-[#F5C518] placeholder:text-[rgba(209,197,172,0.22)] placeholder:text-[13px]"
                  style={{ fontFamily: "'Inter', sans-serif" ,padding:"0.6rem"}}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex-shrink-0 flex items-center transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
                  style={{ color: showPassword ? "#F5C518" : "rgba(209,197,172,0.38)" }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </FieldWrap>

            {/* Forgot password */}
            <div ref={forgotRef} className="flex justify-end -mt-2 mb-2">
              <a
                href="#"
                className="font-['Inter'] text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity duration-200 hover:opacity-100"
                style={{ color: "#F5C518", opacity: 0.65 }}
              >
                FORGOT PASSWORD?
              </a>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              ref={btnRef}
              disabled={isSubmitting}
              onMouseEnter={() => onBtnHover(true)}
              onMouseLeave={() => onBtnHover(false)}
              className="relative mt-4 w-full flex items-center justify-center gap-3 py-[50px] px-7 overflow-hidden cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-80"
              style={{
                background: "#F5C518",
                fontFamily: "'Montserrat', sans-serif",
                padding:"1rem"
              }}
            >
              {/* Shimmer overlay */}
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
                  transform: "translateX(-100%)",
                  transition: "transform 0.5s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(100%)")}
              />
              {isSubmitting ? (
                <span className="flex gap-1.5 items-center">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-2 h-2 bg-[#0a0a0a] rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  <span
                    className="text-[13px] font-extrabold tracking-[0.14em] text-[#0a0a0a]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    SIGN IN
                  </span>
                  <svg
                    className="text-[#0a0a0a] transition-transform duration-200 group-hover:translate-x-1"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            {/* Terms */}
            <p className="font-['Inter'] text-[12px] text-[rgba(209,197,172,0.3)] text-center leading-relaxed mt-3">
              By signing in, you agree to our{" "}
              <a href="#" className="text-[rgba(245,197,24,0.6)] hover:text-[#F5C518] transition-colors duration-200 no-underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-[rgba(245,197,24,0.6)] hover:text-[#F5C518] transition-colors duration-200 no-underline">
                Privacy Policy
              </a>
              .
            </p>

            {/* ── OR Divider ── */}
            <div className="flex items-center gap-3 my-1">
              <span className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
              <span
                className="font-['Inter'] text-[11px] font-bold tracking-[0.18em]"
                style={{ color: "rgba(209,197,172,0.35)" }}
              >
                OR
              </span>
              <span className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            </div>

            {/* ── Google OAuth button ── */}
            <a
              id="login-google-btn"
              href="http://localhost:8080/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-[20px] px-5 no-underline transition-all duration-250"
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                padding:"1rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.background = "#222222";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "#1a1a1a";
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="flex-shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span
                className="font-['Inter'] text-[13px] font-medium tracking-[0.02em]"
                style={{ color: "rgba(229,226,225,0.85)" }}
              >
                Continue with Google
              </span>
            </a>
          </form>

          {/* Footer */}
          <div
            ref={footerRef}
            className="flex items-center justify-center gap-2.5 pt-1 border-t border-[rgba(245,197,24,0.08)]"
          >
            <span className="font-['Inter'] text-[13px] text-[rgba(209,197,172,0.42)]">
              Don&apos;t have an account?
            </span>
            <Link
              to="/register"
              className="font-['Montserrat'] text-[13px] font-bold tracking-[0.1em] no-underline relative group"
              style={{ color: "#F5C518", fontFamily: "'Montserrat', sans-serif" }}
            >
              REGISTER
              <span
                className="absolute bottom-0 left-0 w-full h-[1px] bg-[#F5C518] scale-x-0 group-hover:scale-x-100 transition-transform duration-[250ms] origin-left"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
