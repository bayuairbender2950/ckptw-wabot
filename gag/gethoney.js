const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");

async function fetchHoneyJSON() {
  const stock = await fetchStockLatest();
  const honeyStock = Array.isArray(stock.eventshop_stock) ? stock.eventshop_stock : [];
  return {
    honey: honeyStock,
    updatedAt: Date.now()
  };
}

function emojiHoney(name) {
  if (!name) return "🍯";
  const lower = name.toLowerCase();
  if (lower.includes("honey")) return "🍯";
  if (lower.includes("lavender")) return "💜";
  if (lower.includes("flower")) return "🌸";
  if (lower.includes("bee")) return "🐝";
  if (lower.includes("sprinkler")) return "💧";
  if (lower.includes("comb")) return "🍯";
  if (lower.includes("chair")) return "🪑";
  if (lower.includes("torch")) return "🔥";
  if (lower.includes("nectarshade")) return "❓";
  if (lower.includes("crate")) return "📦";
  return "🌵";
}

function formatHoneyForWhatsapp(honeyData) {
  const honey = Array.isArray(honeyData.honey) ? honeyData.honey : [];
  const honeySorted = [...honey].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  const msgHoney = honeySorted.map(item =>
    `- ${emojiHoney(item.display_name)} ${item.display_name} x${item.quantity ?? item.value}`
  ).join("\n");

  return [
    "🌵 Cactus Event Stock",
    msgHoney
  ].join("\n");
}

async function updateHoney() {
  try {
    const honey = await fetchHoneyJSON();
    const notifMsg = formatHoneyForWhatsapp(honey);
    await sendGrowagardenNotif(notifMsg);
  } catch (err) {
    console.error("Failed to fetch honey data:", err.message);
  }
}

module.exports = {
  updateHoney,
  fetchHoneyJSON,
  formatHoneyForWhatsapp
};
