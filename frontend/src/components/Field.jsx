import React from "react";

export default function Field({ label, required, wide, children }) {
  return (
    <div className={`form-field ${wide ? "field-wide" : ""}`}>
      <label>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      {children}
    </div>
  );
}
