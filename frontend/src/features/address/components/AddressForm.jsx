import { useState } from "react";

const LABELS = ["home", "work", "other"];

const EMPTY = {
  fullname: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  label: "home",
  isDefault: false,
};

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "8px",
  display: "block",
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "13px 14px",
  background: "var(--card-bg)",
  border: `1px solid ${hasError ? "rgba(255,75,75,0.55)" : "var(--border-muted)"}`,
  color: "var(--text-color)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

const errorStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "11px",
  color: "#ff8a80",
  margin: "6px 0 0 0",
};

function Field({ name, label, value, onChange, error, placeholder, ...rest }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label htmlFor={`addr-${name}`} style={labelStyle}>
        {label}
      </label>
      <input
        id={`addr-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle(Boolean(error))}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-color)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "rgba(255,75,75,0.55)"
            : "var(--border-muted)";
        }}
        {...rest}
      />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

/**
 * Collects a delivery address. Used both for the first address a buyer ever
 * saves and for editing one from the address book.
 */
export default function AddressForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  isMobile,
  submitLabel = "Save Address",
}) {
  const [values, setValues] = useState({ ...EMPTY, ...(initialValues || {}) });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Mirrors address.validator.js on the server — the server is still the
  // authority, this just saves the buyer a round trip.
  const validate = () => {
    const next = {};
    if (!values.fullname.trim()) next.fullname = "Full name is required";
    if (!/^[+]?[\d\s-]{10,15}$/.test(values.phone.trim()))
      next.phone = "Enter a valid phone number";
    if (!values.line1.trim()) next.line1 = "Address line 1 is required";
    if (!values.city.trim()) next.city = "City is required";
    if (!values.state.trim()) next.state = "State is required";
    if (!/^\d{4,10}$/.test(values.pincode.trim()))
      next.pincode = "Enter a valid pincode";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  const row = {
    display: "flex",
    gap: isMobile ? "0" : "16px",
    flexDirection: isMobile ? "column" : "row",
    rowGap: isMobile ? "18px" : 0,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        background: "var(--surface-color)",
        border: "1px solid var(--surface-border)",
        padding: isMobile ? "22px" : "28px",
      }}
    >
      <div style={row}>
        <Field
          name="fullname"
          label="Full Name"
          value={values.fullname}
          onChange={handleChange}
          error={errors.fullname}
          placeholder="Rohan Sharma"
          autoComplete="name"
        />
        <Field
          name="phone"
          label="Phone Number"
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="9876543210"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <Field
        name="line1"
        label="Address Line 1"
        value={values.line1}
        onChange={handleChange}
        error={errors.line1}
        placeholder="Flat / House no., Building, Street"
        autoComplete="address-line1"
      />

      <Field
        name="line2"
        label="Address Line 2 (Optional)"
        value={values.line2}
        onChange={handleChange}
        error={errors.line2}
        placeholder="Area, Landmark"
        autoComplete="address-line2"
      />

      <div style={row}>
        <Field
          name="city"
          label="City"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
          placeholder="Mumbai"
          autoComplete="address-level2"
        />
        <Field
          name="state"
          label="State"
          value={values.state}
          onChange={handleChange}
          error={errors.state}
          placeholder="Maharashtra"
          autoComplete="address-level1"
        />
      </div>

      <div style={row}>
        <Field
          name="pincode"
          label="Pincode"
          value={values.pincode}
          onChange={handleChange}
          error={errors.pincode}
          placeholder="400001"
          inputMode="numeric"
          autoComplete="postal-code"
        />
        <Field
          name="country"
          label="Country"
          value={values.country}
          onChange={handleChange}
          error={errors.country}
          autoComplete="country-name"
        />
      </div>

      {/* Label chips */}
      <div>
        <span style={labelStyle}>Save As</span>
        <div style={{ display: "flex", gap: "10px" }}>
          {LABELS.map((l) => {
            const active = values.label === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setValues((v) => ({ ...v, label: l }))}
                style={{
                  padding: "9px 18px",
                  background: active ? "var(--accent-color)" : "transparent",
                  color: active ? "var(--black-or-white)" : "var(--text-muted)",
                  border: `1px solid ${active ? "var(--accent-color)" : "var(--border-muted)"}`,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.18s",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        <input
          type="checkbox"
          name="isDefault"
          checked={values.isDefault}
          onChange={handleChange}
          style={{ accentColor: "var(--accent-color)", width: "15px", height: "15px" }}
        />
        Make this my default delivery address
      </label>

      <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            padding: "15px",
            background: "var(--accent-color)",
            color: "var(--black-or-white)",
            border: "none",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.6 : 1,
            outline: "none",
            transition: "box-shadow 0.25s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px var(--gold-tint-deep)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "15px 28px",
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-muted)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              outline: "none",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
