import React from "react";

export default function Status({ status }) {
  const value = status || "PENDING";
  const className = value.toLowerCase();

  return (
    <span className={`status-pill status-${className}`}>
      {value.replace("_", " ")}
    </span>
  );
}
