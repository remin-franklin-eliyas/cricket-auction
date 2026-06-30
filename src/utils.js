export const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString()}`;
};

export const CATEGORY_COLORS = {
  STAR: { bg: "#fbbf24", text: "#000" },
  ALLROUNDER: { bg: "#34d399", text: "#000" },
  BATSMAN: { bg: "#60a5fa", text: "#000" },
  BOWLER: { bg: "#f87171", text: "#000" },
};
