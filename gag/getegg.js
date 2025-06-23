const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");

async function fetchEggJSON() {
  const stock = await fetchStockLatest();
  return {
    egg: stock.eggStock || [],
    updatedAt: stock.timerCalculatedAt
  };
}

function getEmoji(name) {
  const lower = name.toLowerCase();
  if (lower.includes("paradise")) return "🌴";
  if (lower.includes("common")) return "🥚";
  if (lower.includes("egg")) return "🥚";
  if (lower.includes("legendary")) return "🌟";
  if (lower.includes("mystic")) return "✨";
  return "❓";
}

function formatEggForWhatsapp(egg) {
  function formatList(arr) {
    return arr && arr.length
      ? arr.map(item => `${getEmoji(item.name)} *${item.name}* x${item.value}`).join("\n")
      : "-";
  }
  return [
    "🥚 *Egg Stock*",
    "",
    "*Eggs:*",
    formatList(egg.egg),
    "",
    egg.updatedAt ? `*Updated:* ${new Date(egg.updatedAt).toLocaleString()}` : ""
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

async function updateEgg() {
  try {
    const egg = await fetchEggJSON();
    const notifMsg = formatEggForWhatsapp(egg);
    await sendGrowagardenNotif(notifMsg);
  } catch (err) {
    console.error("Failed to fetch egg data:", err.message);
  }
}

module.exports = {
  updateEgg,
  fetchEggJSON,
  formatEggForWhatsapp
};
