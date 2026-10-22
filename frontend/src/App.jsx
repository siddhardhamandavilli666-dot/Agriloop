import React, { useEffect, useMemo, useState } from "react";
import {
  Tractor,
  Search,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Clock3,
  Sprout,
  Plus,
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Users,
  CheckCircle2,
  Menu,
  X,
  IndianRupee,
  SlidersHorizontal,
  Leaf,
  ArrowRight,
  CircleAlert,
} from "lucide-react";
import {
  getMachinery,
  addMachinery,
  getBookings,
  addBooking,
  setBookingStatus,
  deleteMachinery,
  getMe,
  logout,
} from "./api";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import Stat from "./components/Stat.jsx";
import MachineCard from "./components/MachineCard.jsx";
import BookingTable from "./components/BookingTable.jsx";
import Field from "./components/Field.jsx";
import Modal from "./components/Modal.jsx";
import EmptyState from "./components/EmptyState.jsx";
import Status from "./components/Status.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import { money } from "./utils/formatters.js";

const blankMachine = {
  name: "",
  type: "Tractor",
  location: "",
  description: "",
  rate: "",
  rateUnit: "day",
  ownerName: "",
  ownerPhone: "",
  imageUrl: "",
  operatorAvailable: false,
  available: true,
  maintenanceDue: false,
  verified: false,
};
const blankBooking = {
  farmerName: "",
  farmerPhone: "",
  farmerLocation: "",
  startDate: "",
  endDate: "",
  purpose: "",
  groupBooking: false,
};
const types = [
  "All types",
  "Tractor",
  "Tillage",
  "Harvester",
  "Sowing",
  "Sprayer",
  "Transplanter",
  "Other",
];

export default function App() {
  const { language, toggleLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const role =
    user?.role === "OWNER"
      ? "Owner"
      : user?.role === "ADMIN"
        ? "Admin"
        : "Farmer";
  const [page, setPage] = useState("Explore");
  const [machines, setMachines] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [location, setLocation] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankMachine);
  const [bookingForm, setBookingForm] = useState(blankBooking);
  const [mobileNav, setMobileNav] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [m, b] = await Promise.all([getMachinery(), getBookings()]);
      setMachines(m);
      setBookings(b);
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? language === "te"
            ? "బ్యాకెండ్‌తో కనెక్షన్ కాలేదు"
            : "Unable to connect to the backend"
          : e.message,
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setAuthReady(true));
  }, []);
  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const filtered = useMemo(
    () =>
      machines.filter((m) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          [m.name, m.type, m.location, m.description, m.ownerName].some((v) =>
            (v || "").toLowerCase().includes(q),
          );
        const matchesType = type === "All types" || m.type === type;
        const matchesLocation =
          !location ||
          (m.location || "").toLowerCase().includes(location.toLowerCase());
        return matchesSearch && matchesType && matchesLocation;
      }),
    [machines, search, type, location],
  );

  const totalBookings = bookings.length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const activeListings = machines.filter(
    (m) => m.available && !m.maintenanceDue,
  ).length;
  const estimatedRevenue = bookings
    .filter((b) => ["APPROVED", "COMPLETED"].includes(b.status))
    .reduce((s, b) => s + Number(b.estimatedCost || 0), 0);

  function flash(message) {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 3500);
  }
  async function submitMachine(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        rate: Number(form.rate),
        rateUnit: form.rateUnit || "day",
      };
      await addMachinery(payload);
      setShowAdd(false);
      setForm(blankMachine);
      await refresh();
      flash("Machinery listing added successfully.");
    } catch (e) {
      setError(e.message);
    }
  }
  async function submitBooking(e) {
    e.preventDefault();
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) /
          86400000,
      ) + 1,
    );
    try {
      await addBooking({
        ...bookingForm,
        machineryId: selected.id,
        estimatedCost: Number(selected.rate || 0) * days,
      });
      setSelected(null);
      setBookingForm(blankBooking);
      await refresh();
      flash(
        "Booking request submitted. The machinery owner can now review it.",
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function changeStatus(id, status) {
    try {
      await setBookingStatus(id, status);
      await refresh();
      flash(`Booking marked ${status.toLowerCase()}.`);
    } catch (e) {
      setError(e.message);
    }
  }
  async function removeMachine(id) {
    if (
      !window.confirm(
        language === "te"
          ? "ఈ యంత్ర జాబితాను తొలగించాలా?"
          : "Delete this machinery listing?",
      )
    )
      return;
    try {
      await deleteMachinery(id);
      await refresh();
      flash("Listing deleted.");
    } catch (e) {
      setError(e.message);
    }
  }

  function openAddListing() {
    setForm({
      ...blankMachine,
      ownerName: user.name,
      ownerPhone: user.phone || "",
    });
    setShowAdd(true);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setMachines([]);
    setBookings([]);
  }

  const nav = [
    { name: "Explore", icon: Search, roles: ["Farmer", "Owner", "Admin"] },
    {
      name: "My Bookings",
      icon: CalendarDays,
      roles: ["Farmer", "Owner", "Admin"],
    },
    { name: "Machinery", icon: Tractor, roles: ["Owner", "Admin"] },
    { name: "Add Listing", icon: Plus, roles: ["Owner"] },
    { name: "Dashboard", icon: LayoutDashboard, roles: ["Admin"] },
  ].filter((n) => n.roles.includes(role));

  function navigate(name) {
    if (name === "Add Listing") {
      openAddListing();
    } else setPage(name);
    setMobileNav(false);
  }

  if (!authReady)
    return <div className="auth-loading">AgriLoop · Loading your account…</div>;
  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sprout size={25} />
          </div>
          <div>
            <div className="brand-name">AgriLoop</div>
            <div className="brand-sub">FARM EQUIPMENT NETWORK</div>
          </div>
          <button className="close-nav" onClick={() => setMobileNav(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {nav.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => navigate(item.name)}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
              {item.name === "My Bookings" && pending > 0 && (
                <span className="nav-count">{pending}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Leaf size={18} />
            </div>
            <strong>Grow more, spend less.</strong>
            <p>Share machinery. Save resources. Help every farm thrive.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">
              {(user?.name || role)[0].toUpperCase()}
            </div>
            <div className="user-text">
              <strong>{user?.name}</strong>
              <span>{role} account</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}>
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="language-toggle"
              onClick={toggleLanguage}
              aria-label={
                language === "en" ? "Change language" : "భాషను మార్చండి"
              }
              title={language === "en" ? "Change language" : "భాషను మార్చండి"}
            >
              {language === "en" ? "తెలుగు" : "English"}
            </button>
            <span className="status-dot"></span>
            <span className="live-label">Rental network</span>
            <button type="button" className="logout-top" onClick={handleLogout}>
              Sign out
            </button>
            <div className="top-avatar">
              {(user?.name || role)[0].toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">
          {notice && (
            <div className="alert alert-success d-flex align-items-center gap-2">
              <CheckCircle2 size={18} />
              {notice}
              <button className="alert-close" onClick={() => setNotice("")}>
                ×
              </button>
            </div>
          )}
          {error && (
            <div className="alert alert-danger d-flex align-items-start gap-2">
              <CircleAlert size={18} className="mt-1" />
              <div>
                {error}
                <div className="small mt-1">
                  See README.md for setup instructions.
                </div>
              </div>
              <button className="alert-close" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}

          {page === "Explore" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line"></span> SMART FARMING, MADE
                    ACCESSIBLE
                  </div>
                  <h1>
                    Machinery when
                    <br className="desktop-break" /> <em>you need it.</em>
                  </h1>
                  <p className="welcome-copy">
                    Find trusted farm equipment near you. Book the right
                    machine, at the right price, for the right time.
                  </p>
                  <div className="welcome-tags">
                    <span>
                      <ShieldCheck size={15} /> Verified listings
                    </span>
                    <span>
                      <Clock3 size={15} /> Flexible rental
                    </span>
                    <span>
                      <MapPin size={15} /> Local equipment
                    </span>
                  </div>
                </div>
                <div className="hero-art">
                  <div className="sun"></div>
                  <div className="hill hill-back"></div>
                  <div className="hill hill-front"></div>
                  <div className="tractor-illustration">
                    <Tractor size={112} strokeWidth={1.25} />
                  </div>
                  <div className="hero-note">
                    <span className="note-dot"></span>
                    <div>
                      <strong>Shared equipment</strong>
                      <small>Better access for every farm</small>
                    </div>
                  </div>
                </div>
              </section>
              <section className="stats-grid">
                <Stat
                  icon={Tractor}
                  label="Available listings"
                  value={activeListings}
                  note="Ready to rent"
                />
                <Stat
                  icon={CalendarDays}
                  label="Total bookings"
                  value={totalBookings}
                  note="Across the network"
                />
                <Stat
                  icon={Clock3}
                  label="Awaiting approval"
                  value={pending}
                  note="Requests to review"
                />
                <Stat
                  icon={IndianRupee}
                  label="Rental value"
                  value={money(estimatedRevenue)}
                  note="Approved + completed"
                />
              </section>
              <section className="catalog-section">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">THE EQUIPMENT EXCHANGE</div>
                    <h2>
                      Find your next <em>workhorse.</em>
                    </h2>
                    <p>Explore equipment shared by local owners.</p>
                  </div>
                  {role === "Owner" && (
                    <button className="btn btn-green" onClick={openAddListing}>
                      <Plus size={17} /> Add machinery
                    </button>
                  )}
                </div>
                <div className="search-panel">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tractors, harvesters, rotavators..."
                    />
                  </div>
                  <div className="filter-box">
                    <SlidersHorizontal size={17} />
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {types.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="search-box location-search">
                    <MapPin size={18} />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Village or town"
                    />
                  </div>
                  <button
                    className="filter-reset"
                    onClick={() => {
                      setSearch("");
                      setType("All types");
                      setLocation("");
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div className="results-line">
                  <span>
                    <strong>{filtered.length}</strong> machines found
                  </span>
                  <span className="sort-label">
                    Listed equipment <ArrowRight size={14} />
                  </span>
                </div>
                {loading ? (
                  <div className="loading-state">
                    Loading machinery listings…
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState
                    title="No machinery found"
                    text="Try a different search or clear the filters."
                  />
                ) : (
                  <div className="machine-grid">
                    {filtered.map((m, i) => (
                      <MachineCard
                        key={m.id}
                        machine={m}
                        index={i}
                        role={role}
                        onBook={() => {
                          setSelected(m);
                          setError("");
                        }}
                        onDelete={() => removeMachine(m.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {page === "My Bookings" && (
            <section className="inner-page">
              <div className="eyebrow">RENTAL ACTIVITY</div>
              <h1>
                {role === "Owner" ? "Booking requests" : "My bookings"}{" "}
                <em>& history.</em>
              </h1>
              <p className="welcome-copy">
                Review booking details, dates, estimated costs and request
                status.
              </p>
              <BookingTable
                bookings={bookings}
                role={role}
                onStatus={changeStatus}
              />
            </section>
          )}

          {page === "Machinery" && (
            <section className="inner-page">
              <div className="eyebrow">OWNER WORKSPACE</div>
              <h1>
                Your <em>equipment.</em>
              </h1>
              <p className="welcome-copy">
                Manage the machinery you share on the AgriLoop network.
              </p>
              <div className="owner-toolbar">
                <span>
                  {
                    machines.filter(
                      (m) => role === "Admin" || m.ownerUserId === user.id,
                    ).length
                  }{" "}
                  total listings
                </span>
                <button className="btn btn-green" onClick={openAddListing}>
                  <Plus size={17} /> Add listing
                </button>
              </div>
              <div className="table-responsive custom-table-wrap">
                <table className="table custom-table">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Location</th>
                      <th>Rental rate</th>
                      <th>Availability</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines
                      .filter(
                        (m) => role === "Admin" || m.ownerUserId === user.id,
                      )
                      .map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.name}</strong>
                            <small>
                              {m.type} · Owner: {m.ownerName || "—"}
                            </small>
                          </td>
                          <td>{m.location}</td>
                          <td>
                            {money(m.rate)} / {m.rateUnit}
                          </td>
                          <td>
                            <Status
                              status={
                                m.maintenanceDue
                                  ? "MAINTENANCE"
                                  : m.available
                                    ? "AVAILABLE"
                                    : "UNAVAILABLE"
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeMachine(m.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {page === "Dashboard" && (
            <section className="inner-page">
              <div className="eyebrow">PLATFORM OVERVIEW</div>
              <h1>
                Network <em>at a glance.</em>
              </h1>
              <p className="welcome-copy">
                Monitor equipment, bookings and estimated rental value.
              </p>
              <div className="admin-cards">
                <Stat
                  icon={Users}
                  label="Machinery owners"
                  value={
                    new Set(machines.map((m) => m.ownerName).filter(Boolean))
                      .size
                  }
                  note="Distinct listed owners"
                />
                <Stat
                  icon={Wrench}
                  label="Equipment listings"
                  value={machines.length}
                  note="All listing statuses"
                />
                <Stat
                  icon={ClipboardList}
                  label="Pending requests"
                  value={pending}
                  note="Need owner review"
                />
                <Stat
                  icon={IndianRupee}
                  label="Rental value"
                  value={money(estimatedRevenue)}
                  note="Approved + completed"
                />
              </div>
              <h3 className="subheading">Recent bookings</h3>
              <BookingTable
                bookings={bookings.slice(0, 8)}
                role="Admin"
                onStatus={changeStatus}
              />
              <h3 className="subheading">Equipment verification</h3>
              <div className="custom-table-wrap table-responsive">
                <table className="table custom-table">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Owner</th>
                      <th>Location</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.name}</strong>
                          <small>{m.type}</small>
                        </td>
                        <td>{m.ownerName}</td>
                        <td>{m.location}</td>
                        <td>
                          <Status
                            status={m.verified ? "VERIFIED" : "UNVERIFIED"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
        <footer className="footer">
          <span>
            <Sprout size={16} /> AgriLoop
          </span>
          <span>Better access. Stronger farms. Shared growth.</span>
          <span>Starter MVP</span>
        </footer>
      </main>

      {showAdd && (
        <Modal
          title="List your machinery"
          subtitle="Add equipment details so farmers can discover and book it."
          onClose={() => setShowAdd(false)}
        >
          <form onSubmit={submitMachine} className="form-grid">
            <Field label="Machinery name" required>
              <input
                className="form-control"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mahindra 575 Tractor"
              />
            </Field>
            <Field label="Equipment type" required>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {types
                  .filter((t) => t !== "All types")
                  .map((t) => (
                    <option key={t}>{t}</option>
                  ))}
              </select>
            </Field>
            <Field label="Village / town" required>
              <input
                className="form-control"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Kakinada"
              />
            </Field>
            <Field label="Rental price (₹)" required>
              <input
                className="form-control"
                type="number"
                min="0"
                required
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder="1200"
              />
            </Field>
            <Field label="Price unit" required>
              <select
                className="form-select"
                value={form.rateUnit}
                onChange={(e) => setForm({ ...form, rateUnit: e.target.value })}
              >
                <option value="hour">Per hour</option>
                <option value="day">Per day</option>
                <option value="acre">Per acre</option>
              </select>
            </Field>
            <Field label="Owner name" required>
              <input
                className="form-control"
                required
                value={form.ownerName}
                onChange={(e) =>
                  setForm({ ...form, ownerName: e.target.value })
                }
                placeholder="Your name / business"
              />
            </Field>
            <Field label="Contact number" required>
              <input
                className="form-control"
                required
                type="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                value={form.ownerPhone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ownerPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                placeholder="10-digit mobile number"
              />
              <small>Uses the phone number on your AgriLoop account.</small>
            </Field>
            <Field label="Image URL (optional)">
              <input
                className="form-control"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="Description" wide>
              <textarea
                className="form-control"
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Condition, capacity, suitable crops, delivery details…"
              />
            </Field>
            <div className="checks-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.operatorAvailable}
                  onChange={(e) =>
                    setForm({ ...form, operatorAvailable: e.target.checked })
                  }
                />{" "}
                Operator available
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.maintenanceDue}
                  onChange={(e) =>
                    setForm({ ...form, maintenanceDue: e.target.checked })
                  }
                />{" "}
                Needs maintenance
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button className="btn btn-green" type="submit">
                <Plus size={16} /> Publish listing
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal
          title={role === "Farmer" ? "Request a booking" : "Machinery details"}
          subtitle={`${selected.name} · ${selected.location}`}
          onClose={() => setSelected(null)}
        >
          <div className="booking-machine-summary">
            <div className="summary-icon">
              <Tractor size={25} />
            </div>
            <div>
              <strong>{selected.name}</strong>
              <div className="muted-small">
                {selected.type} · {selected.ownerName || "Local owner"}
              </div>
            </div>
            <div className="summary-price">
              <strong>{money(selected.rate)}</strong>
              <span>per {selected.rateUnit}</span>
            </div>
          </div>
          {role !== "Farmer" ? (
            <>
              <p>
                {selected.description || "No additional description provided."}
              </p>
              <p>
                <strong>Availability:</strong>{" "}
                {selected.maintenanceDue
                  ? "Maintenance due"
                  : selected.available
                    ? "Available"
                    : "Unavailable"}
              </p>
              {role === "Owner" && selected.ownerUserId === user.id && (
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      setSelected(null);
                      removeMachine(selected.id);
                    }}
                  >
                    Delete my listing
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
              )}
              {!(role === "Owner" && selected.ownerUserId === user.id) && (
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          ) : selected.maintenanceDue || !selected.available ? (
            <div className="alert alert-warning">
              This machine is currently unavailable for booking.
            </div>
          ) : (
            <form onSubmit={submitBooking} className="form-grid">
              <div className="field-wrap">
                <strong>Booking as:</strong> {user.name}
                <br />
                <strong>Contact number:</strong>{" "}
                {user.phone || "Add a phone number to your account"}
              </div>
              <Field label="Your village / town" required>
                <input
                  className="form-control"
                  required
                  value={bookingForm.farmerLocation}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      farmerLocation: e.target.value,
                    })
                  }
                  placeholder="Where is the farm?"
                />
              </Field>
              <Field label="Start date" required>
                <input
                  className="form-control"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  required
                  value={bookingForm.startDate}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      startDate: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="End date" required>
                <input
                  className="form-control"
                  type="date"
                  min={
                    bookingForm.startDate ||
                    new Date().toISOString().slice(0, 10)
                  }
                  required
                  value={bookingForm.endDate}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, endDate: e.target.value })
                  }
                />
              </Field>
              <Field label="Purpose / crop" wide>
                <input
                  className="form-control"
                  value={bookingForm.purpose}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, purpose: e.target.value })
                  }
                  placeholder="e.g. paddy field preparation"
                />
              </Field>
              <div className="checks-row">
                <label>
                  <input
                    type="checkbox"
                    checked={bookingForm.groupBooking}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        groupBooking: e.target.checked,
                      })
                    }
                  />{" "}
                  This is a group booking with nearby farmers
                </label>
              </div>
              {bookingForm.startDate &&
                bookingForm.endDate &&
                bookingForm.endDate >= bookingForm.startDate && (
                  <div className="estimate-box">
                    <span>Estimated rental total</span>
                    <strong>
                      {money(
                        Number(selected.rate || 0) *
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date(bookingForm.endDate) -
                                new Date(bookingForm.startDate)) /
                                86400000,
                            ) + 1,
                          ),
                      )}
                    </strong>
                    <small>
                      Indicative estimate; owner may confirm final terms.
                    </small>
                  </div>
                )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-green">
                  Send booking request <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
