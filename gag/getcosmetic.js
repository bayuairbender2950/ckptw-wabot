const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler"); 
const { fetchStockLatest } = require("./getstock");

async function fetchCosmeticJSON() {
  const stock = await fetchStockLatest();
  const cosmeticStock = Array.isArray(stock.cosmetic_stock) ? stock.cosmetic_stock : [];
  return {
    cosmetics: cosmeticStock,
    updatedAt: Date.now()
  };
}

function emojiCosmetic(name) {
  if (!name) return "🎀";
  const lower = name.toLowerCase();
  if (lower.includes("crate")) return "📦";
  if (lower.includes("sign")) return "🪧";
  if (lower.includes("hammock")) return "🛏️";
  if (lower.includes("table")) return "🪑";
  if (lower.includes("umbrella")) return "⛱️";
  if (lower.includes("tile")) return "🧱";
  if (lower.includes("brick")) return "🧱";
  if (lower.includes("fence")) return "🚧";
  if (lower.includes("bookshelf")) return "📚";
  if (lower.includes("lantern")) return "🏮";
  if (lower.includes("canopy")) return "🏕️";
  if (lower.includes("compost")) return "🗑️";
  return "🎀";
}

function formatCosmeticForWhatsapp(cosmeticData) {
  const cosmetics = Array.isArray(cosmeticData.cosmetics) ? cosmeticData.cosmetics : [];
  const cosmeticsSorted = [...cosmetics].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  const msgCosmetic = cosmeticsSorted.map(item =>
    `- ${emojiCosmetic(item.display_name)} ${item.display_name} x${item.quantity ?? item.value}`
  ).join("\n");

  return [
    "🎀 Cosmetic Stock",
    msgCosmetic
  ].join("\n");
}

async function updateCosmetic() {
  try {
    const cosmetic = await fetchCosmeticJSON();
    const notifMsg = formatCosmeticForWhatsapp(cosmetic);
    await sendGrowagardenNotif(notifMsg);
  } catch (err) {
    console.error("Failed to fetch cosmetic data:", err.message);
  }
}

module.exports = {
  updateCosmetic,
  fetchCosmeticJSON,
  formatCosmeticForWhatsapp
};
