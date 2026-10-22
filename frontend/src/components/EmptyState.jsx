import { Search } from "lucide-react";
import React from "react";

export default function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Search size={23} />
      </div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
