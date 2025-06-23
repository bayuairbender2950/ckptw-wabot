const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler"); 
const { fetchStockLatest } = require("./getstock");
const moment = require("moment-timezone");
const config = require("../config");

async function fetchCosmeticJSON() {
  const stock = await fetchStockLatest();
  const cosmeticStock = Array.isArray(stock.cosmetic_stock) ? stock.cosmetic_stock : [];
  return {
    cosmetics: cosmeticStock,
    updatedAt: Date.now()
  };
}

function getEmoji(name) {
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
    return "🎀";
  }
  
  function formatCosmeticForWhatsapp(cosmeticData) {
    function formatList(arr) {
      return arr && arr.length
        ? arr.map(item => `${getEmoji(item.display_name || item.name)} *${item.display_name || item.name}* x${item.quantity ?? item.value}`).join("\n")
        : "-";
    }
    return [
      "🎀 *Cosmetic Stock*",
      "",
      "*Cosmetics:*",
      formatList(cosmeticData.cosmetics),
      "",
      cosmeticData.updatedAt
        ? `*Updated:* ${moment(cosmeticData.updatedAt).tz(config.timezone || "Asia/Makassar").format("YYYY-MM-DD HH:mm:ss")}`
        : ""
    ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
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
