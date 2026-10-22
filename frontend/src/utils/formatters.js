export const money = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const safeDate = (date, language = "en") => {
  if (!date) {
    return "—";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    language === "te" ? "te-IN" : "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
};
