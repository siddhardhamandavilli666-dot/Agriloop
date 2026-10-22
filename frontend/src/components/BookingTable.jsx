import EmptyState from "./EmptyState";
import Status from "./Status";
import { money, safeDate } from "../utils/formatters";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import React from "react";
export default function BookingTable({ bookings, role, onStatus }) {
  const { language } = useLanguage();
  if (!bookings.length)
    return (
      <EmptyState
        title="No bookings yet"
        text="Booking requests will appear here once a farmer reserves machinery."
      />
    );
  return (
    <div className="custom-table-wrap table-responsive">
      <table className="table custom-table">
        <thead>
          <tr>
            <th>Machinery / Farmer</th>
            <th>Contact details</th>
            <th>Rental dates</th>
            <th>Estimated cost</th>
            <th>Group</th>
            <th>Status</th>
            {role !== "Farmer" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <strong>
                  {booking.machineryName || `Machinery #${booking.machineryId}`}
                </strong>
                <small>
                  {booking.farmerName} ·{" "}
                  {booking.farmerLocation || "Location —"}
                </small>
              </td>
              <td>
                {role === "Farmer" ? (
                  <>
                    <strong>{booking.ownerName || "Machinery owner"}</strong>
                    <small>
                      {booking.ownerPhone ? (
                        <a href={`tel:${booking.ownerPhone}`}>
                          {booking.ownerPhone}
                        </a>
                      ) : (
                        "Phone unavailable"
                      )}
                      {booking.ownerEmail && (
                        <>
                          <br />
                          <a href={`mailto:${booking.ownerEmail}`}>
                            {booking.ownerEmail}
                          </a>
                        </>
                      )}
                    </small>
                  </>
                ) : role === "Owner" ? (
                  <>
                    <strong>{booking.farmerName || "Farmer"}</strong>
                    <small>
                      {booking.farmerPhone ? (
                        <a href={`tel:${booking.farmerPhone}`}>
                          {booking.farmerPhone}
                        </a>
                      ) : (
                        "Phone unavailable"
                      )}
                      {booking.farmerEmail && (
                        <>
                          <br />
                          <a href={`mailto:${booking.farmerEmail}`}>
                            {booking.farmerEmail}
                          </a>
                        </>
                      )}
                    </small>
                  </>
                ) : (
                  <>
                    <strong>Owner: {booking.ownerName || "—"}</strong>
                    <small>
                      {booking.ownerPhone || "—"} · Farmer:{" "}
                      {booking.farmerPhone || "—"}
                    </small>
                  </>
                )}
              </td>
              <td>
                {safeDate(booking.startDate, language)}
                <small>to {safeDate(booking.endDate, language)}</small>
              </td>
              <td>
                <strong>{money(booking.estimatedCost)}</strong>
              </td>
              <td>{booking.groupBooking ? "Yes" : "No"}</td>
              <td>
                <Status status={booking.status} />
              </td>
              {role !== "Farmer" && (
                <td>
                  <div className="table-actions">
                    {booking.status === "PENDING" ? (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => onStatus(booking.id, "APPROVED")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onStatus(booking.id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </>
                    ) : booking.status === "APPROVED" ? (
                      <button
                        className="btn btn-sm btn-outline-green"
                        onClick={() => onStatus(booking.id, "COMPLETED")}
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="muted-small">—</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
