import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createProduct } from "../service/product.api";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import SellerNav from "../../../components/SellerNav";

gsap.registerPlugin(ScrollTrigger);

// ── Google Fonts ─────────────────────────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap";

  
// ── FieldWrap ─────────────────────────────────────────────────────
function FieldWrap({ fieldRef, name, label, isFocused, hasValue, onFocus, onBlur, children }) {
  return (
    <div
      ref={fieldRef}
      className="field-wrap relative pb-6 flex flex-col gap-2"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <label
        htmlFor={`product-${name}`}
        style={{
          display: "block",
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "0.5em",
          transition: "color 0.3s",
          color: isFocused || hasValue ? "var(--accent-color)" : "var(--text-muted)",
        }}
      >
        {label}
      </label>
      {children}
      {/* Animated bottom underline */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "var(--border-muted)",
        }}
      >
        <div
          className="underline-fill"
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--accent-color)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function AddSellerProduct() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });
  const [attributes, setAttributes] = useState([
    { key: "Material", value: "" },
    { key: "Fit", value: "" },
  ]);
  const [images, setImages]           = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging]   = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError]             = useState(null);

  // ── Refs ──────────────────────────────────────────────────────
  const pageRef        = useRef(null);
  const headerRef      = useRef(null);
  const dividerRef     = useRef(null);
  const formHeaderRef  = useRef(null);
  const titleRef       = useRef(null);
  const descRef        = useRef(null);
  const attributeRef   = useRef(null);
  const priceRef       = useRef(null);
  const uploadRef      = useRef(null);
  const imagesGridRef  = useRef(null);
  const btnRef         = useRef(null);

  // ── Google Fonts ──────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // ── GSAP Animations ───────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Initial hidden states
      gsap.set(headerRef.current,     { y: -40, opacity: 0 });
      gsap.set(dividerRef.current,    { scaleX: 0, transformOrigin: "left center" });
      gsap.set(formHeaderRef.current, { y: 30, opacity: 0 });

      // ── Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(headerRef.current,     { y: 0, opacity: 1, duration: 0.7 })
        .to(dividerRef.current,    { scaleX: 1, duration: 0.65, ease: "power4.inOut" }, "-=0.3")
        .to(formHeaderRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.35");

      // ── ScrollTrigger for form sections
      const scrollEls = [
        titleRef.current,
        descRef.current,
        attributeRef.current,
        priceRef.current,
        uploadRef.current,
        imagesGridRef.current,
        btnRef.current,
      ].filter(Boolean);

      scrollEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 45, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power2.out",
            delay: i * 0.04,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // ── Field focus / blur ────────────────────────────────────────
  const onFieldFocus = (ref, name) => {
    setFocusedField(name);
    const fill = ref.current?.querySelector(".underline-fill");
    if (fill) gsap.to(fill, { scaleX: 1, duration: 0.35, ease: "power2.out" });
  };

  const onFieldBlur = (ref) => {
    setFocusedField(null);
    const fill = ref.current?.querySelector(".underline-fill");
    if (fill) gsap.to(fill, { scaleX: 0, duration: 0.3, ease: "power2.in" });
  };

  const onBtnHover = (enter) => {
    gsap.to(btnRef.current, {
      scale: enter ? 1.02 : 1,
      boxShadow: enter
        ? "0 0 40px rgba(var(--accent-rgb),0.4)"
        : "0 0 0px rgba(var(--accent-rgb),0)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  // ── Image handling ────────────────────────────────────────────
  const addFiles = useCallback((files) => {
    const allowed = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImages((prev) => {
      const remaining = 7 - prev.length;
      if (remaining <= 0) return prev;
      const toAdd = allowed.slice(0, remaining).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
  }, []);

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => { images.forEach((img) => URL.revokeObjectURL(img.previewUrl)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const handleFileInput = (e) => addFiles(e.target.files);
  const handleChange    = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const handleRemoveAttribute = (idx) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const handleAttributeChange = (idx, field, val) => {
    setAttributes(
      attributes.map((attr, i) => (i === idx ? { ...attr, [field]: val } : attr))
    );
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.title.trim())       { setError("Product title is required."); return; }
    if (!formData.description.trim()) { setError("Description is required."); return; }
    if (!formData.priceAmount || isNaN(formData.priceAmount) || Number(formData.priceAmount) <= 0) {
      setError("Please enter a valid price amount."); return;
    }
    setIsSubmitting(true);
    gsap.to(btnRef.current, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
    try {
      const data = new FormData();
      data.append("title",         formData.title);
      data.append("description",   formData.description);

      const attrsObj = {};
      attributes.forEach((attr) => {
        if (attr.key.trim() && attr.value.trim()) {
          attrsObj[attr.key.trim()] = attr.value.trim();
        }
      });
      data.append("attributes",    JSON.stringify(attrsObj));

      data.append("priceAmount",   formData.priceAmount);
      data.append("priceCurrency", formData.priceCurrency);
      images.forEach(({ file }) => data.append("images", file));
      await createProduct(data);
      setSubmitSuccess(true);
      gsap.fromTo(btnRef.current,
        { scale: 1 },
        { scale: 1.05, yoyo: true, repeat: 1, duration: 0.3, ease: "power2.inOut",
          onComplete: () => setTimeout(() => navigate("/seller/products"), 1200) }
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input style ────────────────────────────────────────
  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "15px",
    color: "var(--text-color)",
    caretColor: "var(--accent-color)",
    fontFamily: "'Inter', sans-serif",
    padding: "0.5rem 0.4rem",
  };

  const iconColor = (field) =>
    focusedField === field ? "var(--accent-color)" : "var(--text-muted)";

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      ref={pageRef}
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
        color: "var(--text-color)",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      <SellerNav />

      {/* Back link */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px 32px 0" }}>
        <Link to="/seller/products" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent-color)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to studio
        </Link>
      </div>

      {/* ── INNER CONTAINER ── */}
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: isMobile ? "24px 16px 48px" : "48px 32px 80px",
        }}
      >

        {/* ── HEADER : ECOMFY branding ── */}
        <div ref={headerRef} style={{ marginBottom: isMobile ? "24px" : "36px" }}>
          {/* Label tag */}
          <span
            style={{
              display: "inline-block",
              background: "var(--accent-color)",
              color: "var(--black-or-white)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              padding: "4px 10px",
              marginBottom: "10px",
            }}
          >
            SELLER STUDIO
          </span>

          {/* Brand name */}
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "900",
              fontSize: "clamp(48px, 10vw, 80px)",
              lineHeight: "1",
              letterSpacing: "-0.04em",
              color: "var(--white-or-black)",
              margin: 0,
              textShadow: "0 0 60px rgba(var(--accent-rgb),0.15)",
            }}
          >
            ECOMFY
          </h1>

          {/* Gold accent bar */}
          <div style={{ width: "64px", height: "4px", background: "var(--accent-color)", marginTop: "12px" }} />
        </div>

        {/* ── SECTION DIVIDER ── */}
        <div
          ref={dividerRef}
          style={{ height: "1px", background: "rgba(var(--accent-rgb),0.18)", marginBottom: isMobile ? "28px" : "40px" }}
        />

        {/* ── FORM HEADER ── */}
        <div ref={formHeaderRef} style={{ marginBottom: isMobile ? "28px" : "40px" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--accent-color)",
              display: "block",
              marginBottom: "10px",
            }}
          >
            NEW LISTING
          </span>
          <h2
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "800",
              fontSize: "clamp(22px, 5vw, 36px)",
              lineHeight: "1.15",
              letterSpacing: "-0.02em",
              color: "var(--white-or-black)",
              margin: "0 0 10px",
            }}
          >
            Add Product
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
            Fill in the details below and publish your drop to the ECOMFY marketplace.
          </p>
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(147,0,10,0.25)",
              border: "1px solid rgba(255,180,171,0.3)",
              color: "#ffb4ab",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "28px",
            }}
          >
            {error}
          </div>
        )}

        {/* ── SUCCESS BANNER ── */}
        {submitSuccess && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(var(--accent-rgb),0.1)",
              border: "1px solid rgba(var(--accent-rgb),0.4)",
              color: "var(--accent-color)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "28px",
            }}
          >
            ✓ Product published successfully! Redirecting...
          </div>
        )}

        {/* ══════════════════ FORM ══════════════════ */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* ── 1. PRODUCT TITLE ── */}
          <FieldWrap
            fieldRef={titleRef}
            name="title"
            label="Product Title"
            isFocused={focusedField === "title"}
            hasValue={!!formData.title}
            onFocus={() => onFieldFocus(titleRef, "title")}
            onBlur={() => onFieldBlur(titleRef)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ flexShrink: 0, display: "flex", alignItems: "center", color: iconColor("title"), transition: "color 0.3s" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 7h16M4 12h10M4 17h6" />
                </svg>
              </span>
              <input
                id="product-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder={focusedField === "title" ? "e.g. ECOMFY Noir Hoodie — Limited Drop" : ""}
                autoComplete="off"
                style={{
                  ...inputStyle,
                  "::placeholder": { color: "rgba(209,197,172,0.22)", fontSize: "13px" },
                }}
              />
            </div>
          </FieldWrap>

          {/* ── 2. DESCRIPTION ── */}
          <FieldWrap
            fieldRef={descRef}
            name="description"
            label="Description"
            isFocused={focusedField === "description"}
            hasValue={!!formData.description}
            onFocus={() => onFieldFocus(descRef, "description")}
            onBlur={() => onFieldBlur(descRef)}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", paddingTop: "4px", color: iconColor("description"), transition: "color 0.3s" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <path d="M7 8h10M7 12h10M7 16h6" />
                </svg>
              </span>
              <textarea
                id="product-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={focusedField === "description" ? "Describe the product, materials, sizing, and story..." : ""}
                rows={5}
                style={{ ...inputStyle, resize: "none", lineHeight: "1.7" }}
              />
            </div>
          </FieldWrap>

          {/* ── 3. PRODUCT SPECIFICATIONS / ATTRIBUTES ── */}
          <div ref={attributeRef} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Product Specifications / Attributes
              </span>
              <button
                type="button"
                onClick={handleAddAttribute}
                style={{
                  background: "transparent",
                  border: "1px solid var(--accent-color)",
                  color: "var(--accent-color)",
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontWeight: "700",
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-color)"; e.currentTarget.style.color = "var(--black-or-white)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent-color)"; }}
              >
                + ADD SPEC
              </button>
            </div>

            {attributes.map((attr, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {/* Key Field */}
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Specification (e.g. Fabric, Fit)"
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(idx, "key", e.target.value)}
                    style={{ ...inputStyle, borderBottom: "1px solid var(--border-muted)", padding: "8px 4px" }}
                  />
                </div>
                {/* Value Field */}
                <div style={{ flex: 1.5, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Value (e.g. 100% Cotton, Oversized)"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(idx, "value", e.target.value)}
                    style={{ ...inputStyle, borderBottom: "1px solid var(--border-muted)", padding: "8px 4px" }}
                  />
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(idx)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ffb4ab"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* ── Divider ── */}
          <div style={{ height: "1px", background: "rgba(var(--accent-rgb),0.08)" }} />

          {/* ── 3. PRICE ── */}
          <div ref={priceRef}>
            <span
              style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "20px",
              }}
            >
              Price
            </span>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "12px" : "20px" }}>
              {/* Amount */}
              <div style={{ flex: 1, position: "relative", paddingBottom: "24px", width: "100%" }}>
                <label
                  htmlFor="product-priceAmount"
                  style={{
                    display: "block",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    color: focusedField === "priceAmount" ? "var(--accent-color)" : "var(--text-muted)",
                    transition: "color 0.3s",
                  }}
                >
                  Amount
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  onFocus={() => { setFocusedField("priceAmount"); const el = document.getElementById("price-ul-amount"); if (el) gsap.to(el, { scaleX: 1, duration: 0.35, ease: "power2.out" }); }}
                  onBlur={() => { setFocusedField(null); const el = document.getElementById("price-ul-amount"); if (el) gsap.to(el, { scaleX: 0, duration: 0.3, ease: "power2.in" }); }}
                >
                  <span style={{ flexShrink: 0, display: "flex", alignItems: "center", color: iconColor("priceAmount"), transition: "color 0.3s" }}>
                    ₹
                  </span>
                  <input
                     id="product-priceAmount"
                     name="priceAmount"
                     type="number"
                     min="0"
                     step="0.01"
                     value={formData.priceAmount}
                     onChange={handleChange}
                     placeholder="0.00"
                     style={{ ...inputStyle, padding: "0.5rem 0.3rem" }}
                  />
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "var(--border-muted)" }}>
                  <div id="price-ul-amount" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                </div>
              </div>

              {/* Currency */}
              <div style={{ width: isMobile ? "100%" : "140px", position: "relative", paddingBottom: "24px" }}>
                <label
                  htmlFor="product-priceCurrency"
                  style={{
                    display: "block",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    color: focusedField === "priceCurrency" ? "var(--accent-color)" : "var(--text-muted)",
                    transition: "color 0.3s",
                  }}
                >
                  Currency
                </label>
                <div
                  onFocus={() => { setFocusedField("priceCurrency"); const el = document.getElementById("price-ul-currency"); if (el) gsap.to(el, { scaleX: 1, duration: 0.35, ease: "power2.out" }); }}
                  onBlur={() => { setFocusedField(null); const el = document.getElementById("price-ul-currency"); if (el) gsap.to(el, { scaleX: 0, duration: 0.3, ease: "power2.in" }); }}
                >
                  <select
                    id="product-priceCurrency"
                    name="priceCurrency"
                    value={formData.priceCurrency}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: "pointer", width: "100%" }}
                  >
                    {["INR", "USD", "EUR", "GBP", "JPY"].map((c) => (
                      <option key={c} value={c} style={{ background: "var(--card-bg)", color: "var(--text-color)" }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "var(--border-muted)" }}>
                  <div id="price-ul-currency" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: "1px", background: "rgba(var(--accent-rgb),0.08)" }} />

          {/* ── 4. IMAGE UPLOAD ── */}
          <div ref={uploadRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Product Images
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: images.length >= 7 ? "var(--accent-color)" : "var(--text-muted)" }}>
                {images.length} / 7
              </span>
            </div>

            {/* Drop zone */}
            {images.length < 7 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("image-file-input").click()}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "48px 24px",
                  cursor: "pointer",
                  border: `2px dashed ${isDragging ? "var(--accent-color)" : "rgba(var(--accent-rgb),0.22)"}`,
                  background: isDragging ? "rgba(var(--accent-rgb),0.04)" : "var(--card-bg)",
                  transition: "border-color 0.2s, background 0.2s",
                  marginBottom: "16px",
                }}
              >
                {/* Icon */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "56px", height: "56px",
                  border: `1px solid ${isDragging ? "var(--accent-color)" : "rgba(var(--accent-rgb),0.28)"}`,
                  color: isDragging ? "var(--accent-color)" : "rgba(var(--accent-rgb),0.45)",
                  transition: "border-color 0.2s, color 0.2s",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: "700", fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", color: isDragging ? "var(--accent-color)" : "var(--text-color)", margin: "0 0 6px" }}>
                    Drag & drop or click to upload
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                    Max 7 images · PNG, JPG, WEBP accepted
                  </p>
                </div>
                <input id="image-file-input" type="file" accept="image/*" multiple onChange={handleFileInput} style={{ display: "none" }} />
              </div>
            )}

            {/* Image Grid */}
            {images.length > 0 && (
              <div
                ref={imagesGridRef}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: "12px",
                }}
              >
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="img-thumb-wrap"
                    style={{ position: "relative", aspectRatio: "1", background: "var(--surface-color)", overflow: "hidden" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector(".img-overlay").style.opacity = "1";
                      gsap.to(e.currentTarget.querySelector("img"), { scale: 1.06, duration: 0.3 });
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector(".img-overlay").style.opacity = "0";
                      gsap.to(e.currentTarget.querySelector("img"), { scale: 1, duration: 0.3 });
                    }}
                  >
                    <img src={img.previewUrl} alt={`Product image ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div className="img-overlay" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", opacity: 0, transition: "opacity 0.2s" }}>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label={`Remove image ${i + 1}`}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "var(--accent-color)", color: "var(--black-or-white)", border: "none", cursor: "pointer" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    {/* Badge */}
                    <div style={{ position: "absolute", top: "4px", left: "4px", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "var(--accent-color)" : "rgba(10,10,10,0.7)", color: i === 0 ? "var(--black-or-white)" : "#e5e2e1", fontSize: "9px", fontFamily: "'Montserrat', sans-serif", fontWeight: "700" }}>
                      {i === 0 ? "★" : i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length >= 7 && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--accent-color)", marginTop: "8px" }}>
                ✓ Maximum 7 images reached.
              </p>
            )}
          </div>

          {/* ── Divider ── */}
          <div style={{ height: "1px", background: "rgba(var(--accent-rgb),0.08)" }} />

          {/* ── 5. SUBMIT ── */}
          <button
            id="add-product-submit-btn"
            type="submit"
            ref={btnRef}
            disabled={isSubmitting || submitSuccess}
            onMouseEnter={() => onBtnHover(true)}
            onMouseLeave={() => onBtnHover(false)}
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "18px 32px",
              background: submitSuccess ? "var(--border-muted)" : "var(--accent-color)",
              border: "none",
              cursor: isSubmitting || submitSuccess ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.8 : 1,
              fontFamily: "'Montserrat', sans-serif",
              overflow: "hidden",
              transition: "opacity 0.2s",
            }}
          >
            {/* Shimmer */}
            <span
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                transform: "translateX(-100%)",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(100%)")}
            />

            {isSubmitting ? (
              <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    style={{ width: "8px", height: "8px", background: "var(--black-or-white)", borderRadius: "50%", display: "inline-block", animation: "bounce 0.6s infinite", animationDelay: `${d}ms` }}
                  />
                ))}
              </span>
            ) : submitSuccess ? (
              <span style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.14em", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                PUBLISHED
              </span>
            ) : (
              <>
                <span style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.14em", color: "var(--black-or-white)" }}>PUBLISH PRODUCT</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--black-or-white)" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.6", margin: 0 }}>
            By publishing, you confirm this listing complies with{" "}
            <a href="#" style={{ color: "var(--accent-color)", textDecoration: "none" }}>ECOMFY Seller Terms</a>.
          </p>
        </form>
      </div>

      {/* Bounce keyframes for loading dots */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
