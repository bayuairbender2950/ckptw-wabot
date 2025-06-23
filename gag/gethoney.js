const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");

async function fetchHoneyJSON() {
  const stock = await fetchStockLatest();
  return {
    honey: stock.honeyStock || [],
    updatedAt: stock.timerCalculatedAt
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

function formatHoneyForWhatsapp(honey) {
  function formatList(arr) {
    return arr && arr.length
      ? arr.map(item => `${getEmoji(item.name)} *${item.name}* x${item.value}`).join("\n")
      : "-";
  }
  return [
    "🍯 *Honey Stock*",
    "",
    "*Honey Items:*",
    formatList(honey.honey),
    "",
    honey.updatedAt ? `*Updated:* ${new Date(honey.updatedAt).toLocaleString()}` : ""
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
