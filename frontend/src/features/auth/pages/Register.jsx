import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import "./Register.css";

export default function Register() {
  const { handleRegister } = useAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    contact: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const logoRef = useRef(null);
  const taglineRef = useRef(null);
  const stripeRef = useRef(null);
  const formRef = useRef(null);
  const formTitleRef = useRef(null);
  const fieldRefs = useRef([]);
  const btnRef = useRef(null);
  const footerRef = useRef(null);
  const particlesRef = useRef([]);
  const roleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(leftPanelRef.current, { x: "-100%", opacity: 0 });
      gsap.set(rightPanelRef.current, { x: "100%", opacity: 0 });
      gsap.set(stripeRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(logoRef.current, { y: 60, opacity: 0 });
      gsap.set(taglineRef.current, { y: 40, opacity: 0 });
      gsap.set(formTitleRef.current, { y: -30, opacity: 0 });
      gsap.set(fieldRefs.current, { y: 50, opacity: 0 });
      gsap.set(roleRef.current, { y: 30, opacity: 0 });
      gsap.set(btnRef.current, { y: 30, opacity: 0, scale: 0.95 });
      gsap.set(footerRef.current, { y: 20, opacity: 0 });

      // Master timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(leftPanelRef.current, { x: "0%", opacity: 1, duration: 0.9 })
        .to(
          rightPanelRef.current,
          { x: "0%", opacity: 1, duration: 0.9 },
          "-=0.7",
        )
        .to(
          stripeRef.current,
          { scaleX: 1, duration: 0.8, ease: "power4.inOut" },
          "-=0.5",
        )
        .to(logoRef.current, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
        .to(taglineRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
        .to(formTitleRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.8")
        .to(
          fieldRefs.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.12,
          },
          "-=0.4",
        )
        .to(roleRef.current, { y: 0, opacity: 1, duration: 0.5 }, "-=0.1")
        .to(
          btnRef.current,
          { y: 0, opacity: 1, scale: 1, duration: 0.5 },
          "-=0.1",
        )
        .to(footerRef.current, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");

      // Continuous diagonal stripe shimmer
      gsap.to(stripeRef.current, {
        backgroundPosition: "200% center",
        duration: 3,
        ease: "none",
        repeat: -1,
      });

      // Floating particles animation
      particlesRef.current.forEach((particle) => {
        if (!particle) return;
        gsap.set(particle, {
          x: Math.random() * 400,
          y: Math.random() * 600,
          opacity: Math.random() * 0.5 + 0.1,
          scale: Math.random() * 0.8 + 0.2,
        });
        gsap.to(particle, {
          y: `-=${Math.random() * 100 + 50}`,
          x: `+=${(Math.random() - 0.5) * 60}`,
          opacity: 0,
          duration: Math.random() * 4 + 3,
          repeat: -1,
          delay: Math.random() * 4,
          ease: "power1.inOut",
          yoyo: false,
          onRepeat: () => {
            gsap.set(particle, {
              y: Math.random() * 600,
              x: Math.random() * 400,
              opacity: Math.random() * 0.5 + 0.1,
            });
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Button pulse animation on submit
    gsap.to(btnRef.current, {
      scale: 0.96,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });

    await handleRegister({
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      fullname: formData.fullname,
      isSeller,
    });
    setIsSubmitting(false);
  };

  const handleFieldFocus = (fieldName, index) => {
    setFocusedField(fieldName);
    gsap.to(fieldRefs.current[index], {
      borderBottomColor: "#F5C518",
      duration: 0.3,
    });
  };

  const handleFieldBlur = (index) => {
    setFocusedField(null);
    gsap.to(fieldRefs.current[index], {
      borderBottomColor: "rgba(255,255,255,0.25)",
      duration: 0.3,
    });
  };

  const handleButtonHover = (isEnter) => {
    if (isEnter) {
      gsap.to(btnRef.current, {
        scale: 1.03,
        boxShadow: "0 0 40px rgba(245,197,24,0.45)",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(btnRef.current, {
        scale: 1,
        boxShadow: "0 0 0px rgba(245,197,24,0)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const fields = [
    {
      name: "fullname",
      label: "Full Name",
      type: "text",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      placeholder: "Enter your full name",
    },
    {
      name: "email",
      label: "Email ID",
      type: "email",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      placeholder: "Enter your email",
    },
    {
      name: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      placeholder: "Min. 6 characters",
      isPassword: true,
    },
    {
      name: "contact",
      label: "Contact Number",
      type: "tel",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.36a2 2 0 0 1 1.99-2H6.6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.06 6.06l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      placeholder: "+91 XXXXX XXXXX",
      hasPrefix: true,
    },
  ];

  return (
    <div className="register-container" ref={containerRef}>
      {/* Left Brand Panel */}
      <div className="register-left" ref={leftPanelRef}>
        {/* Floating particles */}
        <div className="particles-layer">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              ref={(el) => (particlesRef.current[i] = el)}
            />
          ))}
        </div>

        {/* Diagonal stripe */}
        <div className="diagonal-stripe" ref={stripeRef} />

        {/* Corner accent */}
        <div className="corner-accent top-right" />
        <div className="corner-accent bottom-left" />

        <div className="left-content">
          <div className="brand-badge" ref={logoRef}>
            <span className="brand-tag">EXCLUSIVE</span>
            <h1 className="brand-name">ECOMFY</h1>
            <div className="brand-underline" />
          </div>

          <div className="brand-tagline" ref={taglineRef}>
            <h2 className="tagline-main">BECOME A</h2>
            <h2 className="tagline-accent">CREATOR</h2>
            <p className="tagline-sub">
              Join the movement. Launch your drops. Own your style.
            </p>
          </div>

          <div className="left-stats">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">CREATORS</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">₹2Cr+</span>
              <span className="stat-label">EARNED</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">FREE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="register-right" ref={rightPanelRef}>
        <div className="form-wrapper">
          <div className="form-header" ref={formTitleRef}>
            <span className="form-eyebrow">CREATOR PORTAL</span>
            <h3 className="form-title">Create Account</h3>
            <p className="form-subtitle">
              Join ECOMFY — where style meets everyday comfort.
            </p>
          </div>

          <form
            className="register-form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
          >
            {fields.map((field, i) => (
              <div
                key={field.name}
                className={`field-group ${focusedField === field.name ? "focused" : ""} ${formData[field.name] ? "has-value" : ""}`}
                ref={(el) => (fieldRefs.current[i] = el)}
              >
                <label
                  className="field-label"
                  htmlFor={`register-${field.name}`}
                >
                  {field.label}
                </label>
                <div className="field-input-wrap">
                  <span className="field-icon">{field.icon}</span>

                  {field.hasPrefix && <span className="phone-prefix">+91</span>}

                  <input
                    id={`register-${field.name}`}
                    className={`field-input ${field.hasPrefix ? "with-prefix" : ""}`}
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    placeholder={
                      focusedField === field.name ? field.placeholder : ""
                    }
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus(field.name, i)}
                    onBlur={() => handleFieldBlur(i)}
                    required
                    autoComplete={
                      field.name === "password" ? "new-password" : field.name
                    }
                  />

                  {field.isPassword && (
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="field-underline">
                  <div className="field-underline-fill" />
                </div>
              </div>
            ))}

            {/* ── Role Selector ── */}
            <div className="role-selector" ref={roleRef}>
              <span className="role-selector-label">I AM REGISTERING AS</span>
              <div className="role-options">
                <button
                  id="role-buyer"
                  type="button"
                  className={`role-option ${!isSeller ? "role-active" : ""}`}
                  onClick={() => setIsSeller(false)}
                  aria-pressed={!isSeller}
                >
                  <span className="role-checkbox">
                    {!isSeller && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="#0a0a0a"
                      >
                        <polygon points="5,0 10,5 5,10 0,5" />
                      </svg>
                    )}
                  </span>
                  <span className="role-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </span>
                  <span className="role-name">BUYER</span>
                  <span className="role-desc">Shop & discover</span>
                </button>

                <button
                  id="role-seller"
                  type="button"
                  className={`role-option ${isSeller ? "role-active" : ""}`}
                  onClick={() => setIsSeller(true)}
                  aria-pressed={isSeller}
                >
                  <span className="role-checkbox">
                    {isSeller && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="#0a0a0a"
                      >
                        <polygon points="5,0 10,5 5,10 0,5" />
                      </svg>
                    )}
                  </span>
                  <span className="role-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </span>
                  <span className="role-name">SELLER</span>
                  <span className="role-desc">List & earn</span>
                </button>
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className={`register-btn ${isSubmitting ? "submitting" : ""}`}
              ref={btnRef}
              disabled={isSubmitting}
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
            >
              {isSubmitting ? (
                <span className="btn-loader">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <>
                  <span className="btn-text">
                    {isSeller ? "REGISTER AS SELLER" : "REGISTER AS BUYER"}
                  </span>
                  <svg
                    className="btn-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            <div className="form-terms">
              By registering, you agree to our{" "}
              <a href="#" className="terms-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="terms-link">
                Privacy Policy
              </a>
              .
            </div>

            {/* ── Divider ── */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">OR</span>
              <span className="auth-divider-line" />
            </div>

            {/* ── Google OAuth button ── */}
            <a
              id="register-google-btn"
              href="/api/auth/google"
              className="google-btn"
            >
              <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span className="google-btn-text">Continue with Google</span>
            </a>
          </form>

          <div className="form-footer" ref={footerRef}>
            <span className="footer-text">Already have an account?</span>
            <Link to="/login" className="signin-link">
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
