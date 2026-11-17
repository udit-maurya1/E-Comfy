import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { gsap } from "gsap";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import StoreNav from "../../../components/StoreNav";
import { useCart } from "../../cart/hooks/useCart";
import { useAddress } from "../../address/hooks/useAddress";
import { useCheckout } from "../hooks/useCheckout";
import AddressForm from "../../address/components/AddressForm";
import AddressCard from "../../address/components/AddressCard";
import { setError as setAddressError } from "../../address/state/address.slice";
import { setError as setOrderError, resetCheckout } from "../state/order.slice";
import { fmt } from "../pricing";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

function SectionHeading({ step, title, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            width: "24px",
            height: "24px",
            border: "1px solid var(--gold-tint-deep)",
            color: "var(--accent-color)",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {step}
        </span>
        <h2
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "14px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--white-or-black)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function ReviewRow({ item, isMobile }) {
  const variant = item.product?.variant;
  const images = variant?.images?.length ? variant.images : item.product?.images;
  const thumb = images?.[0]?.url;
  const amount = (variant?.price?.amount || item.price?.amount || 0) * item.quantity;
  const currency = variant?.price?.currency || item.price?.currency || "INR";

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid var(--border-muted)",
      }}
    >
      <div
        style={{
          width: isMobile ? "48px" : "58px",
          height: isMobile ? "60px" : "72px",
          flexShrink: 0,
          background: "var(--card-bg)",
          border: "1px solid var(--surface-border)",
          overflow: "hidden",
        }}
      >
        {thumb && (
          <img
            src={thumb}
            alt={item.product?.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "13px",
            textTransform: "uppercase",
            color: "var(--text-color)",
            margin: "0 0 4px 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.product?.title || "Product"}
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Qty {item.quantity}
        </p>
      </div>

      <span
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          fontSize: "14px",
          color: "var(--accent-color)",
          flexShrink: 0,
        }}
      >
        {fmt(amount, currency)}
      </span>
    </div>
  );
}

function Banner({ message, tone = "error", onDismiss }) {
  const isError = tone === "error";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        marginBottom: "20px",
        background: isError ? "rgba(255,75,75,0.08)" : "var(--gold-tint)",
        border: `1px solid ${isError ? "rgba(255,75,75,0.35)" : "var(--gold-tint-deep)"}`,
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        color: isError ? "#ffb4ab" : "var(--accent-color)",
      }}
    >
      <span>{isError ? "⚠" : "ℹ"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "15px",
            opacity: 0.6,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ── Checkout Page ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile } = useBreakpoint();

  const user = useSelector((s) => s.auth.user);
  const { items, amounts, loading: cartLoading } = useSelector((s) => s.cart);
  const {
    addresses,
    selectedAddressId,
    loading: addressLoading,
    error: addressError,
  } = useSelector((s) => s.address);
  const { status, error: orderError } = useSelector((s) => s.order);

  const { getCartItems } = useCart();
  const { fetchAddresses, saveAddress, editAddress, deleteAddress, chooseAddress } =
    useAddress();
  const { startPayment } = useCheckout();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  // The cart starts out empty in the store, so we can't tell "no items" from
  // "not fetched yet" until this flips.
  const [cartLoaded, setCartLoaded] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    dispatch(resetCheckout());
    getCartItems().finally(() => setCartLoaded(true));
    fetchAddresses().then((list) => {
      // Nothing saved yet — drop the buyer straight into the form rather than
      // making them hunt for an "add address" button.
      if (!list.length) setShowForm(true);
    });
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: 20 },
        { y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform" },
      );
    }
  }, []);

  // An empty cart has nothing to pay for — send them back rather than showing a
  // ₹0 checkout.
  useEffect(() => {
    if (cartLoaded && !cartLoading && items.length === 0 && status === "idle") {
      navigate("/cart", { replace: true });
    }
  }, [cartLoaded, cartLoading, items.length, status]);

  const currency =
    items[0]?.product?.variant?.price?.currency || items[0]?.price?.currency || "INR";

  const busy = status === "creating" || status === "processing";
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const handleFormSubmit = async (values) => {
    try {
      if (editing) {
        await editAddress(editing._id, values);
      } else {
        await saveAddress(values);
      }
      setShowForm(false);
      setEditing(null);
    } catch {
      // The hook already pushed the message into state.address.error.
    }
  };

  const handlePay = async () => {
    if (!selectedAddressId) {
      dispatch(setOrderError("Please select a delivery address"));
      return;
    }
    try {
      await startPayment({
        addressId: selectedAddressId,
        user,
        onSuccess: (order) => navigate(`/order/${order._id}`, { replace: true }),
      });
    } catch {
      // Surfaced through state.order.error.
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "var(--bg-color)", color: "var(--text-color)" }}>
        <StoreNav />

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: isMobile ? "32px 20px 80px" : "48px 48px 80px",
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <Link
              to="/"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(245,197,24,0.5)",
                textDecoration: "none",
              }}
            >
              Home
            </Link>
            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>›</span>
            <Link
              to="/cart"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(245,197,24,0.5)",
                textDecoration: "none",
              }}
            >
              Cart
            </Link>
            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>›</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Checkout
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? "28px" : "clamp(32px, 4vw, 48px)",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "var(--white-or-black)",
              margin: "0 0 20px 0",
              paddingBottom: "20px",
              borderBottom: "1px solid var(--surface-border)",
            }}
          >
            Checkout
          </h1>

          {orderError && (
            <Banner message={orderError} onDismiss={() => dispatch(setOrderError(null))} />
          )}
          {addressError && (
            <Banner
              message={addressError}
              onDismiss={() => dispatch(setAddressError(null))}
            />
          )}

          <div
            style={{
              display: "flex",
              gap: isMobile ? "0" : "48px",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "flex-start",
            }}
          >
            {/* ── Left: address + review ───────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
              <SectionHeading
                step="1"
                title="Delivery Address"
                action={
                  !showForm &&
                  addresses.length > 0 && (
                    <button
                      onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--gold-tint-deep)",
                        color: "var(--accent-color)",
                        padding: "8px 16px",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontSize: "10px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      + Add New
                    </button>
                  )
                }
              />

              {showForm ? (
                <AddressForm
                  initialValues={
                    editing || { fullname: user?.fullname || "", phone: user?.contact || "" }
                  }
                  submitting={addressLoading}
                  submitLabel={editing ? "Update Address" : "Save Address"}
                  isMobile={isMobile}
                  onSubmit={handleFormSubmit}
                  onCancel={
                    addresses.length > 0
                      ? () => {
                          setShowForm(false);
                          setEditing(null);
                        }
                      : undefined
                  }
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {addresses.map((address) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      selected={address._id === selectedAddressId}
                      onSelect={chooseAddress}
                      isMobile={isMobile}
                      onEdit={(a) => {
                        setEditing(a);
                        setShowForm(true);
                      }}
                      onDelete={(id) => deleteAddress(id)}
                    />
                  ))}
                </div>
              )}

              {/* ── Order review ───────────────────────────────────── */}
              <div style={{ marginTop: "44px" }}>
                <SectionHeading step="2" title={`Review Items (${items.length})`} />
                <div>
                  {items.map((item) => (
                    <ReviewRow key={item._id} item={item} isMobile={isMobile} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: payment summary ───────────────────────────── */}
            <div
              ref={panelRef}
              style={{
                width: isMobile ? "100%" : "360px",
                flexShrink: 0,
                marginTop: isMobile ? "36px" : 0,
                alignSelf: "flex-start",
                position: isMobile ? "static" : "sticky",
                top: "88px",
                background: "var(--surface-color)",
                border: "1px solid var(--surface-border)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "14px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--white-or-black)",
                  margin: 0,
                }}
              >
                Payment Summary
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--text-muted)" }}>
                    Subtotal
                  </span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--white-or-black)" }}>
                    {fmt(amounts.subtotal, currency)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--text-muted)" }}>
                    Shipping
                  </span>
                  {amounts.shipping === 0 ? (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Free
                    </span>
                  ) : (
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--white-or-black)" }}>
                      {fmt(amounts.shipping, currency)}
                    </span>
                  )}
                </div>

                {amounts.tax > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--text-muted)" }}>
                      Tax
                    </span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--white-or-black)" }}>
                      {fmt(amounts.tax, currency)}
                    </span>
                  </div>
                )}

                <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-color)" }}>
                      Total
                    </span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "26px", color: "var(--accent-color)", letterSpacing: "-0.02em" }}>
                      {fmt(amounts.total, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Where it's going */}
              {selectedAddress && !showForm && (
                <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "16px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px 0" }}>
                    Delivering To
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.6, color: "var(--text-color)", margin: 0 }}>
                    {selectedAddress.fullname} · {selectedAddress.phone}
                    <br />
                    {selectedAddress.line1}, {selectedAddress.city} {selectedAddress.pincode}
                  </p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={busy || !selectedAddressId || items.length === 0}
                style={{
                  width: "100%",
                  padding: "18px",
                  background:
                    busy || !selectedAddressId ? "var(--gold-tint-deep)" : "var(--accent-color)",
                  color: "var(--black-or-white)",
                  border: "none",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "13px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: busy || !selectedAddressId ? "not-allowed" : "pointer",
                  outline: "none",
                  transition: "box-shadow 0.25s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!busy && selectedAddressId)
                    e.currentTarget.style.boxShadow = "0 0 40px var(--gold-tint-deep)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {status === "creating"
                  ? "Opening Gateway…"
                  : status === "processing"
                    ? "Confirming Payment…"
                    : `Pay ${fmt(amounts.total, currency)}`}
              </button>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                🔒 Secured by Razorpay · UPI, Cards, Netbanking & Wallets
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
