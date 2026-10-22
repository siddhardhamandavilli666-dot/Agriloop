import {
  Tractor,
  Wrench,
  Sprout,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { money } from "../utils/formatters";
import React from "react";

export default function MachineCard({
  machine: m,
  index,
  role,
  onBook,
  onDelete,
}) {
  const illustrations = [
    <Tractor key="tractor" />,
    <Wrench key="wrench" />,
    <Sprout key="sprout" />,
    <Tractor key="tractor-alt" />,
  ];
  const themes = [
    "machine-green",
    "machine-sand",
    "machine-blue",
    "machine-rust",
  ];
  const available = m.available && !m.maintenanceDue;

  return (
    <article className="machine-card">
      <div className={`machine-visual ${themes[index % themes.length]}`}>
        {m.imageUrl ? (
          <img
            src={m.imageUrl}
            alt={m.name}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="machine-art-icon">
            {illustrations[index % illustrations.length]}
          </div>
        )}
        <div className="visual-top">
          <span className="type-pill">{m.type || "Equipment"}</span>
          {m.verified && (
            <span className="verified-pill">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>
        {m.maintenanceDue && (
          <span className="unavailable-label">Maintenance due</span>
        )}
        <div className="visual-number">
          AG / {String(m.id || index + 1).padStart(3, "0")}
        </div>
      </div>

      <div className="machine-card-body">
        <div className="machine-title-row">
          <h3>{m.name}</h3>
          <div className="rate">
            <strong>{money(m.rate)}</strong>
            <span>/{m.rateUnit || "day"}</span>
          </div>
        </div>
        <div className="machine-location">
          <MapPin size={14} />
          {m.location || "Location not specified"}
          <span className="location-sep">·</span>
          <span>
            {m.operatorAvailable ? "Operator available" : "Self-operated"}
          </span>
        </div>
        <p className="machine-desc">
          {m.description || "Flexible rental from a local machinery owner."}
        </p>
        <div className="machine-owner">
          <div className="owner-avatar">
            {(m.ownerName || "O")[0].toUpperCase()}
          </div>
          <div>
            <span>Listed by</span>
            <strong>{m.ownerName || "Local owner"}</strong>
          </div>
          <div className="availability">
            <span className={`availability-dot ${available ? "" : "off"}`} />
            {available ? "Available" : "Unavailable"}
          </div>
        </div>
        <div className="machine-actions">
          {role === "Farmer" ? (
            <button
              className="btn btn-green w-100"
              disabled={!available}
              onClick={onBook}
            >
              View &amp; book <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                className="btn btn-outline-green flex-grow-1"
                onClick={onBook}
              >
                Details
              </button>
              {role === "Admin" && (
                <button className="btn btn-outline-danger" onClick={onDelete}>
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
