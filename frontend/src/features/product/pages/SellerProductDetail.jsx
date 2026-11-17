import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProduct } from "../hooks/useProduct";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import SellerNav from "../../../components/SellerNav";

gsap.registerPlugin(ScrollTrigger);

// ── Fonts & Style Config ─────────────────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap";

const CURRENCY = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

// ── Ticker Tape ──────────────────────────────────────────────────
const TICKER_TEXT = "MANAGE LISTING  ·  ADD VARIANT  ·  UPDATE SPECIFICATIONS  ·  INVENTORY CONTROL  ·  STREETWEAR DROP  ·  ";
function TickerTape() {
  const tickerRef = useRef(null);
  useEffect(() => {
    gsap.to(tickerRef.current, { x: "-50%", duration: 20, ease: "none", repeat: -1 });
  }, []);
  return (
    <div style={{ background: "var(--accent-color)", overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0" }}>
      <span ref={tickerRef} style={{ display: "inline-block", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "11px", letterSpacing: "0.2em", color: "var(--black-or-white)" }}>
        {TICKER_TEXT.repeat(10)}
      </span>
    </div>
  );
}

// ── Main Seller Product Detail Component ──────────────────────────
export default function SellerProductDetail() {
  const { id } = useParams();
  const { isMobile } = useBreakpoint();

  const currentProduct = useSelector((s) => s.product.currentProduct);
  const loading = useSelector((s) => s.product.loading);

  const {
    fetchProductById,
    updateExistingProduct,
    addVariantToProduct,
    updateStockOfVariant,
    removeVariantFromProduct,
  } = useProduct();

  // ── Mode & Edit States ──────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Edit base product form fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAttributes, setEditAttributes] = useState([]);
  const [editPriceAmount, setEditPriceAmount] = useState("");
  const [editPriceCurrency, setEditPriceCurrency] = useState("INR");

  // Add Variant form fields
  const [varPriceAmount, setVarPriceAmount] = useState("");
  const [varPriceCurrency, setVarPriceCurrency] = useState("INR");
  const [varStock, setVarStock] = useState("");
  const [varAttributes, setVarAttributes] = useState([
    { key: "size", value: "" },
    { key: "color", value: "" },
  ]);
  const [varImages, setVarImages] = useState([]);
  const [varImagePreviews, setVarImagePreviews] = useState([]);
  const [isVariantSubmitting, setIsVariantSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ── Existing-variant row states (stock edit / delete) ──────────
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockDraft, setStockDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  // Which row is mid-request — disables just that row, not the whole panel.
  const [busyVariantId, setBusyVariantId] = useState(null);
  const [variantError, setVariantError] = useState(null);

  // ── Refs for GSAP ──────────────────────────────────────────────
  const pageRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const editFormRef = useRef(null);
  const viewDetailsRef = useRef(null);

  // ── Font loader ─────────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // ── Fetch Product on Load ──────────────────────────────────────
  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  /**
   * Fills the edit form from the product on screen.
   *
   * Called when edit mode opens rather than from an effect on currentProduct.
   * As an effect it re-ran on every dispatch — including each variant save —
   * and overwrote whatever the seller had typed with the server's copy, and it
   * cost a render on load to mirror data the form wasn't showing yet.
   */
  const seedEditForm = () => {
    if (!currentProduct) return;

    setEditTitle(currentProduct.title || "");
    setEditDescription(currentProduct.description || "");

    const attrs = currentProduct.attributes || {};
    setEditAttributes(
      Object.entries(
        attrs instanceof Map ? Object.fromEntries(attrs) : attrs
      ).map(([key, val]) => ({ key, value: val })),
    );

    setEditPriceAmount(currentProduct.price?.amount || "");
    setEditPriceCurrency(currentProduct.price?.currency || "INR");
  };

  // ── Entrance GSAP Animations ───────────────────────────────────
  // Also keyed on the id. On [loading, currentProduct] both panels dropped back
  // to opacity 0 and slid in again every time a variant was saved or a stock
  // level changed — the page appeared to reload itself mid-edit.
  useEffect(() => {
    if (!currentProduct?._id) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [leftPanelRef.current, rightPanelRef.current],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.15 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [currentProduct?._id]);

  // Underline focus animations
  const onFieldFocus = (name, wrapperEl) => {
    setFocusedField(name);
    if (wrapperEl) {
      const fill = wrapperEl.querySelector(".underline-fill");
      if (fill) gsap.to(fill, { scaleX: 1, duration: 0.35, ease: "power2.out" });
    }
  };

  const onFieldBlur = (wrapperEl) => {
    setFocusedField(null);
    if (wrapperEl) {
      const fill = wrapperEl.querySelector(".underline-fill");
      if (fill) gsap.to(fill, { scaleX: 0, duration: 0.3, ease: "power2.in" });
    }
  };

  // Toggle Edit Mode with smooth fade transition
  const handleToggleEdit = (editing) => {
    if (editing) {
      seedEditForm();
      gsap.to(viewDetailsRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        onComplete: () => {
          setIsEditing(true);
          gsap.fromTo(editFormRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        },
      });
    } else {
      gsap.to(editFormRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.25,
        onComplete: () => {
          setIsEditing(false);
          gsap.fromTo(viewDetailsRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        },
      });
    }
  };

  // ── Form handlers ──────────────────────────────────────────────
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!editTitle.trim()) return setSubmitError("Product title is required.");
    if (!editDescription.trim()) return setSubmitError("Description is required.");
    if (!editPriceAmount || isNaN(editPriceAmount) || Number(editPriceAmount) <= 0) {
      return setSubmitError("Please enter a valid price amount.");
    }

    const attrsObj = {};
    editAttributes.forEach((attr) => {
      if (attr.key.trim() && attr.value.trim()) {
        attrsObj[attr.key.trim()] = attr.value.trim();
      }
    });

    try {
      await updateExistingProduct(id, {
        title: editTitle,
        description: editDescription,
        attributes: attrsObj,
        priceAmount: Number(editPriceAmount),
        priceCurrency: editPriceCurrency,
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      handleToggleEdit(false);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to update product details.");
    }
  };

  const handleAddEditAttribute = () => {
    setEditAttributes([...editAttributes, { key: "", value: "" }]);
  };

  const handleRemoveEditAttribute = (idx) => {
    setEditAttributes(editAttributes.filter((_, i) => i !== idx));
  };

  const handleEditAttributeChange = (idx, field, val) => {
    setEditAttributes(
      editAttributes.map((attr, i) => (i === idx ? { ...attr, [field]: val } : attr))
    );
  };

  const handleAddAttribute = () => {
    setVarAttributes([...varAttributes, { key: "", value: "" }]);
  };

  const handleRemoveAttribute = (idx) => {
    setVarAttributes(varAttributes.filter((_, i) => i !== idx));
  };

  const handleAttributeChange = (idx, field, val) => {
    setVarAttributes(
      varAttributes.map((attr, i) => (i === idx ? { ...attr, [field]: val } : attr))
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 5 - varImages.length;
    const toAdd = files.slice(0, remaining);
    setVarImages((prev) => [...prev, ...toAdd]);
    setVarImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    // Reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const handleRemoveVarImage = (idx) => {
    URL.revokeObjectURL(varImagePreviews[idx]);
    setVarImages((prev) => prev.filter((_, i) => i !== idx));
    setVarImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const remaining = 5 - varImages.length;
    const toAdd = files.slice(0, remaining);
    setVarImages((prev) => [...prev, ...toAdd]);
    setVarImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!varPriceAmount || isNaN(varPriceAmount) || Number(varPriceAmount) < 0) {
      return setSubmitError("Please enter a valid variant price.");
    }
    if (!varStock || isNaN(varStock) || Number(varStock) < 0) {
      return setSubmitError("Please enter a valid stock level.");
    }

    const attrs = {};
    varAttributes.forEach((attr) => {
      if (attr.key.trim() && attr.value.trim()) {
        attrs[attr.key.trim().toLowerCase()] = attr.value.trim();
      }
    });

    setIsVariantSubmitting(true);
    try {
      const data = new FormData();
      data.append("priceAmount", varPriceAmount);
      data.append("priceCurrency", varPriceCurrency);
      data.append("stock", varStock);
      data.append("attributes", JSON.stringify(attrs));
      varImages.forEach((img) => data.append("images", img));

      await addVariantToProduct(id, data);
      
      // Reset variant form fields
      setVarPriceAmount("");
      setVarStock("");
      setVarAttributes([
        { key: "size", value: "" },
        { key: "color", value: "" },
      ]);
      varImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setVarImages([]);
      setVarImagePreviews([]);

      // Smooth highlight entrance for new variant
      gsap.fromTo(
        ".variant-row-newest",
        { backgroundColor: "rgba(245,197,24,0.18)" },
        { backgroundColor: "rgba(255,255,255,0.01)", duration: 1.5 }
      );
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to add product variant.");
    } finally {
      setIsVariantSubmitting(false);
    }
  };

  // ── Existing variant: stock edit & delete ──────────────────────
  const startStockEdit = (variant) => {
    setVariantError(null);
    setConfirmDeleteId(null);
    setEditingStockId(variant._id);
    setStockDraft(String(variant.stock ?? 0));
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
    setStockDraft("");
  };

  const handleSaveStock = async (variantId) => {
    const parsed = Number(stockDraft);
    if (stockDraft === "" || !Number.isInteger(parsed) || parsed < 0) {
      return setVariantError("Stock must be a whole number of 0 or more.");
    }

    setVariantError(null);
    setBusyVariantId(variantId);
    try {
      await updateStockOfVariant(id, variantId, parsed);
      cancelStockEdit();
    } catch (err) {
      setVariantError(
        err?.response?.data?.message || "Failed to update the stock level.",
      );
    } finally {
      setBusyVariantId(null);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    setVariantError(null);
    setBusyVariantId(variantId);
    try {
      await removeVariantFromProduct(id, variantId);
      setConfirmDeleteId(null);
      if (editingStockId === variantId) cancelStockEdit();
    } catch (err) {
      setVariantError(
        err?.response?.data?.message || "Failed to delete this variant.",
      );
    } finally {
      setBusyVariantId(null);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      varImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Styles ──────────────────────────────────────────────────────
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "15px",
    color: "var(--text-color)",
    caretColor: "var(--accent-color)",
    fontFamily: "'Inter', sans-serif",
    padding: "0.5rem 0.4rem",
    width: "100%",
  };

  const buttonStyle = {
    background: "var(--accent-color)",
    color: "var(--black-or-white)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "12px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    border: "none",
    cursor: "pointer",
    padding: "16px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const outlineButtonStyle = {
    background: "transparent",
    color: "var(--white-or-black)",
    border: "2px solid var(--white-or-black)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "12px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    cursor: "pointer",
    padding: "14px 26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "background 0.2s, color 0.2s, border-color 0.2s",
  };

  // ── Loading state ───────────────────────────────────────────────
  if (loading && !currentProduct) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-color)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: "900", fontSize: "36px", color: "var(--white-or-black)", margin: 0, letterSpacing: "-0.04em" }}>
          ECOMFY
        </h1>
        <div style={{ display: "flex", gap: "6px" }}>
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              style={{
                width: "10px",
                height: "10px",
                background: "var(--accent-color)",
                display: "inline-block",
                animation: "pulse 0.6s infinite alternate",
                animationDelay: `${d}ms`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.3; }
            100% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-color)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", color: "var(--text-color)" }}>
        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "28px", fontWeight: 800, marginBottom: "16px" }}>Product Not Found</h2>
        <Link to="/seller/products" style={{ ...outlineButtonStyle, textDecoration: "none" }}>Back to dashboard</Link>
      </div>
    );
  }

  const primaryImage = currentProduct.images?.[0]?.url || "";

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div ref={pageRef} style={{ minHeight: "100vh", background: "var(--bg-color)", fontFamily: "'Inter', sans-serif", color: "var(--text-color)", overflowX: "hidden" }}>
      
      <SellerNav />

      <TickerTape />

      {/* ── CONTENT CONTAINER ── */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: isMobile ? "24px 16px 64px" : "48px 40px 96px",
        }}
      >
        
        {/* Back Link */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            to="/seller/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-color)",
              textDecoration: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Global Error/Success notification */}
        {submitError && (
          <div style={{ padding: "14px 16px", background: "rgba(147,0,10,0.25)", border: "1px solid rgba(255,180,171,0.3)", color: "#ffb4ab", fontSize: "13px", fontWeight: "500", marginBottom: "28px" }}>
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div style={{ padding: "14px 16px", background: "rgba(var(--accent-rgb),0.1)", border: "1px solid rgba(var(--accent-rgb),0.4)", color: "var(--accent-color)", fontSize: "13px", fontWeight: "500", marginBottom: "28px" }}>
            ✓ Listing updated successfully!
          </div>
        )}

        {/* Layout Split Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "40px" : "64px",
            alignItems: "start",
          }}
        >
          
          {/* ══════════════════ LEFT PANEL: VIEW / EDIT DETAIL ══════════════════ */}
          <div ref={leftPanelRef} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* ── View Mode ── */}
            <div
              ref={viewDetailsRef}
              style={{
                display: isEditing ? "none" : "block",
                background: "var(--card-bg)",
                padding: "32px",
                border: "1px solid var(--border-muted)",
              }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div>
                    <span style={{ display: "inline-block", background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent-color)", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 8px", marginBottom: "12px" }}>
                      ACTIVE LISTING
                    </span>
                    <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--white-or-black)", margin: 0 }}>
                      {currentProduct.title}
                    </h1>
                  </div>
                  <button
                    onClick={() => handleToggleEdit(true)}
                    style={{ ...outlineButtonStyle, padding: "8px 16px", fontSize: "10px" }}
                  >
                    Edit Info
                  </button>
                </div>

                {/* Base Image display */}
                <div style={{ width: "100%", aspectRatio: "16/10", background: "var(--surface-color)", overflow: "hidden", marginBottom: "24px", border: "1px solid rgba(var(--accent-rgb),0.08)" }}>
                  {primaryImage ? (
                    <img src={primaryImage} alt={currentProduct.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.1)" }}>
                      No Image Uploaded
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                  <div>
                    <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                      Base Price
                    </span>
                    <span style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--accent-color)", marginTop: "4px" }}>
                      {CURRENCY[currentProduct.price?.currency] || "₹"}
                      {currentProduct.price?.amount}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1%m", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "4px" }}>
                      Variants Count
                    </span>
                    <span style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "800", color: "var(--white-or-black)", marginTop: "4px" }}>
                      {currentProduct.variant?.length || 0}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "20px" }}>
                  <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Description
                  </span>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", lineHeight: "1.7", color: "var(--text-color)", margin: 0 }}>
                    {currentProduct.description}
                  </p>
                </div>

                {currentProduct.attributes && Object.keys(currentProduct.attributes instanceof Map ? Object.fromEntries(currentProduct.attributes) : currentProduct.attributes).length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "20px" }}>
                    <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Specifications / Attributes
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {Object.entries(currentProduct.attributes instanceof Map ? Object.fromEntries(currentProduct.attributes) : currentProduct.attributes).map(([key, val]) => (
                        <div key={key} style={{ display: "flex", gap: "10px", fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
                          <span style={{ fontWeight: "600", color: "var(--text-muted)", width: "120px" }}>{key}:</span>
                          <span style={{ color: "var(--text-color)" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* ── Edit Mode ── */}
            <div
              ref={editFormRef}
              style={{
                display: isEditing ? "block" : "none",
                background: "var(--card-bg)",
                padding: "32px",
                border: "1px solid rgba(var(--accent-rgb),0.18)",
              }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                  <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--white-or-black)", margin: 0 }}>
                    Edit Details
                  </h2>
                  <button
                    onClick={() => handleToggleEdit(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: "600" }}
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleUpdateProduct} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Title */}
                  <div id="edit-wrap-title" style={{ position: "relative", paddingBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "title" ? "var(--accent-color)" : "var(--text-muted)" }}>
                      Title
                    </label>
                    <input
                      name="title"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onFocus={() => onFieldFocus("title", document.getElementById("edit-wrap-title"))}
                      onBlur={() => onFieldBlur(document.getElementById("edit-wrap-title"))}
                      style={inputStyle}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                      <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                    </div>
                  </div>

                  {/* Description */}
                  <div id="edit-wrap-description" style={{ position: "relative", paddingBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "description" ? "var(--accent-color)" : "var(--text-muted)" }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      onFocus={() => onFieldFocus("description", document.getElementById("edit-wrap-description"))}
                      onBlur={() => onFieldBlur(document.getElementById("edit-wrap-description"))}
                      style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                      <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                    </div>
                  </div>

                  {/* Specifications / Attributes */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--border-muted)", paddingBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        Specifications / Attributes
                      </label>
                      <button
                        type="button"
                        onClick={handleAddEditAttribute}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--accent-color)",
                          color: "var(--accent-color)",
                          padding: "3px 8px",
                          fontSize: "9px",
                          fontWeight: "700",
                          fontFamily: "'Montserrat', sans-serif",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        + Add Spec
                      </button>
                    </div>

                    {editAttributes.map((attr, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                          type="text"
                          placeholder="Key (e.g. Fabric)"
                          value={attr.key}
                          onChange={(e) => handleEditAttributeChange(idx, "key", e.target.value)}
                          style={{ ...inputStyle, borderBottom: "1px solid var(--border-muted)", padding: "4px 2px", fontSize: "13px" }}
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Cotton)"
                          value={attr.value}
                          onChange={(e) => handleEditAttributeChange(idx, "value", e.target.value)}
                          style={{ ...inputStyle, borderBottom: "1px solid var(--border-muted)", padding: "4px 2px", fontSize: "13px" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditAttribute(idx)}
                          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div id="edit-wrap-price" style={{ flex: 1, position: "relative", paddingBottom: "20px" }}>
                      <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "price" ? "var(--accent-color)" : "var(--text-muted)" }}>
                        Base Amount
                      </label>
                      <input
                        name="priceAmount"
                        type="number"
                        min="0"
                        value={editPriceAmount}
                        onChange={(e) => setEditPriceAmount(e.target.value)}
                        onFocus={() => onFieldFocus("price", document.getElementById("edit-wrap-price"))}
                        onBlur={() => onFieldBlur(document.getElementById("edit-wrap-price"))}
                        style={inputStyle}
                      />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                        <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                      </div>
                    </div>

                    <div id="edit-wrap-currency" style={{ width: "100px", position: "relative", paddingBottom: "20px" }}>
                      <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "currency" ? "var(--accent-color)" : "var(--text-muted)" }}>
                        Currency
                      </label>
                      <select
                        name="priceCurrency"
                        value={editPriceCurrency}
                        onChange={(e) => setEditPriceCurrency(e.target.value)}
                        onFocus={() => onFieldFocus("currency", document.getElementById("edit-wrap-currency"))}
                        onBlur={() => onFieldBlur(document.getElementById("edit-wrap-currency"))}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        {Object.keys(CURRENCY).map((c) => (
                          <option key={c} value={c} style={{ background: "var(--card-bg)", color: "var(--text-color)" }}>{c}</option>
                        ))}
                      </select>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                        <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                      </div>
                    </div>
                  </div>

                  <button type="submit" style={buttonStyle}>
                    Save Updates
                  </button>
                </form>
            </div>

            {/* ── VARIANTS VIEW PANEL ── */}
            <div style={{ background: "var(--card-bg)", padding: "32px", border: "1px solid var(--border-muted)" }}>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--white-or-black)", marginBottom: "20px", borderBottom: "1px solid var(--border-muted)", paddingBottom: "12px" }}>
                Current Product Variants
              </h2>

              {variantError && (
                <div style={{ padding: "12px 14px", background: "rgba(147,0,10,0.25)", border: "1px solid rgba(255,180,171,0.3)", color: "#ffb4ab", fontSize: "12px", marginBottom: "16px" }}>
                  {variantError}
                </div>
              )}

              {!currentProduct.variant || currentProduct.variant.length === 0 ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-muted)", margin: "20px 0 0" }}>
                  No variants defined for this product drop. Use the form on the right to append variants (sizes, custom colors, stock adjustments).
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {currentProduct.variant.map((v, idx) => {
                    const isNewest = idx === currentProduct.variant.length - 1;
                    const isEditingStock = editingStockId === v._id;
                    const isConfirmingDelete = confirmDeleteId === v._id;
                    const isBusy = busyVariantId === v._id;
                    return (
                      <div
                        key={v._id || idx}
                        className={isNewest ? "variant-row-newest" : ""}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "12px 16px",
                          background: "var(--surface-color)",
                          border: isConfirmingDelete
                            ? "1px solid #ffb4ab"
                            : "1px solid var(--border-muted)",
                          opacity: isBusy ? 0.6 : 1,
                          transition: "opacity 0.2s, border-color 0.2s",
                        }}
                      >
                        {/* Variant image or placeholder */}
                        <div style={{ width: "56px", height: "70px", background: "var(--surface-color)", flexShrink: 0, overflow: "hidden", border: "1px solid var(--border-muted)" }}>
                          {v.images?.[0]?.url ? (
                            <img src={v.images[0].url} alt="variant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Variant details */}
                        <div style={{ flexGrow: 1 }}>
                          {/* Price and Stock */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: "800", color: "var(--accent-color)" }}>
                              {CURRENCY[v.price?.currency] || "₹"}{v.price?.amount || 0}
                            </span>

                            {isEditingStock ? (
                              /* Stock is the only variant field editable in place — price and
                                 attributes stay frozen so live carts don't shift under buyers. */
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  autoFocus
                                  value={stockDraft}
                                  disabled={isBusy}
                                  onChange={(e) => setStockDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveStock(v._id);
                                    if (e.key === "Escape") cancelStockEdit();
                                  }}
                                  style={{
                                    width: "72px",
                                    background: "var(--card-bg)",
                                    border: "1px solid var(--accent-color)",
                                    outline: "none",
                                    color: "var(--text-color)",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "12px",
                                    padding: "4px 6px",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveStock(v._id)}
                                  disabled={isBusy}
                                  style={{
                                    background: "var(--accent-color)",
                                    color: "var(--black-or-white)",
                                    border: "none",
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 800,
                                    fontSize: "9px",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    padding: "5px 10px",
                                    cursor: isBusy ? "not-allowed" : "pointer",
                                  }}
                                >
                                  {isBusy ? "…" : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelStockEdit}
                                  disabled={isBusy}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "600", color: v.stock > 0 ? "var(--text-color)" : "#ffb4ab" }}>
                                  {v.stock > 0 ? `Stock: ${v.stock}` : "OUT OF STOCK"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => startStockEdit(v)}
                                  disabled={isBusy}
                                  title="Update stock"
                                  style={{
                                    background: "transparent",
                                    border: "1px solid var(--border-muted)",
                                    color: "var(--text-muted)",
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "9px",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    padding: "4px 9px",
                                    cursor: isBusy ? "not-allowed" : "pointer",
                                    transition: "color 0.2s, border-color 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--accent-color)";
                                    e.currentTarget.style.borderColor = "var(--accent-color)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.borderColor = "var(--border-muted)";
                                  }}
                                >
                                  Edit Stock
                                </button>

                                {/* Delete asks once inline — a mis-click here would drop a
                                    variant buyers may already have in their cart. */}
                                {isConfirmingDelete ? (
                                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVariant(v._id)}
                                      disabled={isBusy}
                                      style={{
                                        background: "#ffb4ab",
                                        color: "#690005",
                                        border: "none",
                                        fontFamily: "'Montserrat', sans-serif",
                                        fontWeight: 800,
                                        fontSize: "9px",
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        padding: "5px 10px",
                                        cursor: isBusy ? "not-allowed" : "pointer",
                                      }}
                                    >
                                      {isBusy ? "…" : "Confirm"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      disabled={isBusy}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      Keep
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantError(null);
                                      setConfirmDeleteId(v._id);
                                    }}
                                    disabled={isBusy}
                                    title="Delete variant"
                                    aria-label="Delete variant"
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "var(--text-muted)",
                                      cursor: isBusy ? "not-allowed" : "pointer",
                                      padding: "2px",
                                      display: "flex",
                                      alignItems: "center",
                                      transition: "color 0.2s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffb4ab")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                                  >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                      <path d="M10 11v6M14 11v6" />
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Attributes mapping */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {v.attributes && typeof v.attributes === "object" ? (
                                Object.entries(v.attributes).map(([key, val]) => (
                                  <span
                                    key={key}
                                    style={{
                                      display: "inline-block",
                                      background: "var(--surface-color)",
                                      border: "1px solid var(--border-muted)",
                                      padding: "2px 8px",
                                      fontSize: "10px",
                                      fontWeight: "600",
                                      fontFamily: "'Inter', sans-serif",
                                      textTransform: "uppercase",
                                      color: "var(--text-color)",
                                    }}
                                  >
                                    {key}: {val}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Standard Variant</span>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ══════════════════ RIGHT PANEL: ADD VARIANT FORM ══════════════════ */}
          <div ref={rightPanelRef} style={{ background: "var(--card-bg)", padding: "32px", border: "1px solid var(--border-muted)" }}>
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
              EXPAND PRODUCT DROP
            </span>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: "800",
                fontSize: "clamp(22px, 5vw, 32px)",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
                color: "var(--white-or-black)",
                margin: "0 0 10px",
              }}
            >
              Add Variant
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", margin: "0 0 32px" }}>
              Define attributes (e.g. size/color), price points, stock levels, and a dedicated image for this product variant.
            </p>

            <form onSubmit={handleAddVariant} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              
              {/* Variant Price */}
              <div>
                <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Variant Price & Stock
                </span>

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px" }}>
                  {/* Amount */}
                  <div id="vwrap-amount" style={{ flex: 1, position: "relative", paddingBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "varAmount" ? "var(--accent-color)" : "var(--text-muted)" }}>
                      Price Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={varPriceAmount}
                      onChange={(e) => setVarPriceAmount(e.target.value)}
                      onFocus={() => onFieldFocus("varAmount", document.getElementById("vwrap-amount"))}
                      onBlur={() => onFieldBlur(document.getElementById("vwrap-amount"))}
                      placeholder="e.g. 2499"
                      style={inputStyle}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                      <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                    </div>
                  </div>

                  {/* Currency */}
                  <div id="vwrap-currency" style={{ width: "90px", position: "relative", paddingBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "varCurrency" ? "var(--accent-color)" : "var(--text-muted)" }}>
                      Currency
                    </label>
                    <select
                      value={varPriceCurrency}
                      onChange={(e) => setVarPriceCurrency(e.target.value)}
                      onFocus={() => onFieldFocus("varCurrency", document.getElementById("vwrap-currency"))}
                      onBlur={() => onFieldBlur(document.getElementById("vwrap-currency"))}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      {Object.keys(CURRENCY).map((c) => (
                        <option key={c} value={c} style={{ background: "var(--card-bg)", color: "var(--text-color)" }}>{c}</option>
                      ))}
                    </select>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                      <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                    </div>
                  </div>

                  {/* Stock */}
                  <div id="vwrap-stock" style={{ width: "100px", position: "relative", paddingBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", color: focusedField === "varStock" ? "var(--accent-color)" : "var(--text-muted)" }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={varStock}
                      onChange={(e) => setVarStock(e.target.value)}
                      onFocus={() => onFieldFocus("varStock", document.getElementById("vwrap-stock"))}
                      onBlur={() => onFieldBlur(document.getElementById("vwrap-stock"))}
                      placeholder="e.g. 50"
                      style={inputStyle}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }}>
                      <div className="underline-fill" style={{ position: "absolute", inset: 0, background: "var(--accent-color)", transformOrigin: "left center", transform: "scaleX(0)" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributes configuration */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Variant Attributes
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--accent-color)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    + Add Attribute
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {varAttributes.map((attr, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ flex: 1, position: "relative", paddingBottom: "6px" }}>
                        <input
                          type="text"
                          placeholder="Key (e.g. size, color)"
                          value={attr.key}
                          onChange={(e) => handleAttributeChange(idx, "key", e.target.value)}
                          style={{ ...inputStyle, fontSize: "13px", padding: "6px" }}
                        />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }} />
                      </div>
                      <div style={{ flex: 1.5, position: "relative", paddingBottom: "6px" }}>
                        <input
                          type="text"
                          placeholder="Value (e.g. L, Obsidian)"
                          value={attr.value}
                          onChange={(e) => handleAttributeChange(idx, "value", e.target.value)}
                          style={{ ...inputStyle, fontSize: "13px", padding: "6px" }}
                        />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--border-muted)" }} />
                      </div>
                      {varAttributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(idx)}
                          style={{ background: "transparent", border: "none", color: "#ffb4ab", cursor: "pointer", padding: "4px" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Images upload */}
              <div>
                <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Variant Images (up to 5, optional)
                </span>

                {/* Preview row */}
                {varImagePreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {varImagePreviews.map((src, idx) => (
                      <div key={idx} style={{ position: "relative", width: "80px", height: "100px", background: "var(--surface-color)", border: "1px solid rgba(var(--accent-rgb),0.3)", flexShrink: 0 }}>
                        <img src={src} alt={`variant img ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveVarImage(idx)}
                          style={{
                            position: "absolute", top: "-7px", right: "-7px",
                            width: "18px", height: "18px",
                            background: "#ffb4ab", color: "#690005",
                            border: "none", borderRadius: "50%",
                            cursor: "pointer", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: "10px", fontWeight: "bold",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone (hidden when 5 images reached) */}
                {varImages.length < 5 && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("variant-file-input").click()}
                    style={{
                      border: `2px dashed ${isDragging ? "var(--accent-color)" : "rgba(var(--accent-rgb),0.22)"}`,
                      background: isDragging ? "rgba(var(--accent-rgb),0.04)" : "var(--card-bg)",
                      cursor: "pointer",
                      padding: "18px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textAlign: "center",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--accent-rgb),0.5)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="1" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <div>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em", color: "var(--white-or-black)", margin: "0 0 4px", textTransform: "uppercase" }}>
                        Drag & Drop or Click
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                        {varImages.length} / 5 — PNG, JPG or WEBP
                      </p>
                    </div>
                    <input id="variant-file-input" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
                  </div>
                )}
              </div>

              {/* Submit variant button */}
              <button
                type="submit"
                disabled={isVariantSubmitting}
                style={{
                  ...buttonStyle,
                  opacity: isVariantSubmitting ? 0.75 : 1,
                  cursor: isVariantSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isVariantSubmitting ? (
                  <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        style={{ width: "6px", height: "6px", background: "var(--black-or-white)", borderRadius: "50%", display: "inline-block", animation: "bounce 0.6s infinite", animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                ) : (
                  <>
                    <span>Add Variant</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--black-or-white)" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
        
      </div>

      {/* Bounce keyframes for loading dots */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}