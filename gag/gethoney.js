const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");
const moment = require("moment-timezone");
async function fetchHoneyJSON() {
  const stock = await fetchStockLatest();
  const honey = Array.isArray(stock.eventshop_stock) ? stock.eventshop_stock : [];
  return {
    honey,
    updatedAt: Date.now()
  };
}

function getEmoji(name) {
  const lower = name.toLowerCase();
  if (lower.includes("honey")) return "🍯";
  if (lower.includes("lavender")) return "💜";
  if (lower.includes("flower")) return "🌸";
  if (lower.includes("bee")) return "🐝";
  if (lower.includes("sprinkler")) return "💧";
  if (lower.includes("comb")) return "🍯";
  if (lower.includes("chair")) return "🪑";
  return "❓";
}

function formatHoneyForWhatsapp(honeyData) {
  function formatList(arr) {
    return arr && arr.length
      ? arr.map(item => `${getEmoji(item.display_name || item.name)} *${item.display_name || item.name}* x${item.quantity ?? item.value}`).join("\n")
      : "-";
  }
  return [
    "🍯 *Event Stock*",
    "",
    "*Items:*", 
    formatList(honeyData.honey),
    "",
    honeyData.updatedAt ? `*Updated:* ${new Date(honeyData.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Makassar' })} WITA` : ""
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
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
