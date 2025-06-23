const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");


function getEmoji(name) {
  if (!name) return "❓";
  const lower = name.toLowerCase();
  if (lower.includes("blueberry")) return "🫐";
  if (lower.includes("carrot")) return "🥕";
  if (lower.includes("strawberry")) return "🍓";
  if (lower.includes("tomato")) return "🍅";
  if (lower.includes("tulip")) return "🌷";
  if (lower.includes("corn")) return "🌽";
  if (lower.includes("daffodil")) return "🌼";
  if (lower.includes("watermelon")) return "🍉";
  if (lower.includes("pumpkin")) return "🎃";
  if (lower.includes("apple")) return "🍎";
  if (lower.includes("spray")) return "🧴";
  if (lower.includes("bamboo")) return "🎍";
  if (lower.includes("coconut")) return "🥥";
  if (lower.includes("dragon")) return "🐲";
  if (lower.includes("mango")) return "🥭";
  if (lower.includes("grape")) return "🍇";
  if (lower.includes("mushroom")) return "🍄";
  if (lower.includes("pepper")) return "🌶";
  if (lower.includes("cacao")) return "☕";
  if (lower.includes("beanstalk")) return "🌱";
  if (lower.includes("ember")) return "💐";
  if (lower.includes("sugar")) return "🍏";
  if (lower.includes("trowel")) return "🛠️";
  if (lower.includes("favorite")) return "💖";
  if (lower.includes("watering")) return "💧";
  if (lower.includes("wrench")) return "🔧";
  if (lower.includes("harvest")) return "🌾";
  if (lower.includes("tanning")) return "🕶";
  if (lower.includes("avocado")) return "🥑";
  if (lower.includes("banana")) return "🍌";
  if (lower.includes("cauliflower")) return "🥦";
  if (lower.includes("loquat")) return "🍊";
  if (lower.includes("kiwi")) return "🥝";
  return "❓";
}

function getEmojiFromLastSeen(name, lastSeenArr) {
  if (!Array.isArray(lastSeenArr)) return getEmoji(name);
  const found = lastSeenArr.find(x => x.name && x.name.toLowerCase() === name.toLowerCase());
  return found?.emoji || getEmoji(name);
}


// Fetch dari API baru JoshLei (realtime, 3 detik delay)
async function fetchStockLatest() {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: "api.joshlei.com",
      path: "/v2/growagarden/stock",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0",
        accept: "application/json",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          if (!data.trim().startsWith("{")) {
            return reject(new Error("GAG API error: " + data.trim().slice(0, 100)));
          }
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error("Failed to parse JSON: " + e.message + " | Raw: " + data.trim().slice(0, 100)));
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

// Format WhatsApp untuk API JoshLei
function formatStockLatestForWhatsapp(stock) {
  function formatList(arr) {
    if (!Array.isArray(arr)) return "-";
    if (arr.length === 0) return "-";
    return arr.map(item => {
      const emoji = getEmoji(item.display_name || item.name);
      return `${emoji} *${item.display_name || item.name}* x${item.quantity ?? item.value ?? item.stock}`;
    }).join("\n");
  }
  // Ambil waktu update dari salah satu item (pakai end_date_unix)
  const updatedUnix = stock.seed_stock?.[0]?.end_date_unix || stock.gear_stock?.[0]?.end_date_unix || 0;
  const updatedAt = updatedUnix ? new Date(updatedUnix * 1000) : new Date();

  return [
    "🛠️ *Gear & Seeds*",
    "",
    "*Gear:*",
    formatList(stock.gear_stock),
    "",
    "*Seeds:*",
    formatList(stock.seed_stock),
    "",
    "*Eggs:*",
    formatList(stock.egg_stock),
    "",
    "*Event Shop:*",
    formatList(stock.eventshop_stock),
    "",
    "*Cosmetics:*",
    formatList(stock.cosmetic_stock),
    "",
    updatedAt ? `*Updated:* ${updatedAt.toLocaleString()}` : ""
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

function extractCounts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => ({
    name: item.display_name || item.name,
    stock: item.quantity ?? item.value ?? item.stock
  }));
}

function formatGearSeedsForWhatsapp(stock, lastSeen = {}) {
  // Support format baru JoshLei API (gear_stock, seed_stock)
  const gearArr = Array.isArray(stock.gearStock) ? stock.gearStock
    : Array.isArray(stock.gear_stock) ? stock.gear_stock
    : Array.isArray(stock.gear) ? stock.gear
    : [];
  const seedArr = Array.isArray(stock.seedsStock) ? stock.seedsStock
    : Array.isArray(stock.seed_stock) ? stock.seed_stock
    : Array.isArray(stock.seeds) ? stock.seeds
    : [];

  function formatList(arr) {
    if (!Array.isArray(arr)) return "-";
    if (arr.length === 0) return "-";
    return arr.map(item => {
      const emoji = getEmoji(item.display_name || item.name);
      return `${emoji} *${item.display_name || item.name}* x${item.quantity ?? item.value ?? item.stock}`;
    }).join("\n");
  }

  return [
    "🛠️ *Gear & Seeds*",
    "",
    "*Gear:*",
    formatList(gearArr),
    "",
    "*Seeds:*",
    formatList(seedArr),
    "",
    stock.timerCalculatedAt || stock.updatedAt
      ? `*Updated:* ${new Date(stock.timerCalculatedAt || stock.updatedAt).toLocaleString()}`
      : ""
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

function formatStockForWhatsapp(stock, newItems) {
  function formatList(arr) {
    return arr && arr.length
      ? arr.map(item => `${getEmoji(item.name)} *${item.name}* x${item.stock}`).join("\n")
      : "-";
  }
  let notif = [
    "*Eggs:*",
    formatList(stock.Data?.egg || []),
    "",
    stock.Data?.updatedAt ? `*Updated:* ${new Date(stock.Data.updatedAt).toLocaleString()}` : ""
  ].filter(Boolean).join("\n");
  if (newItems && newItems.length) {
    notif = `*STOCK BARU!*\n${newItems.map(i => `• ${i.category.toUpperCase()}: *${i.name}*`).join("\n")}\n\n${notif}`;
  }
  return notif.replace(/\n{3,}/g, "\n\n");
}

async function updateStock() {
  try {
    const stock = await fetchStockLatest();
    const notifMsg = formatStockLatestForWhatsapp(stock);
    await sendGrowagardenNotif(notifMsg);
  } catch (err) {
    console.error("Failed to fetch stock data:", err.message);
  }
}

async function updateStockGearSeeds() {
  return;
}

module.exports = {
  updateStock,
  updateStockGearSeeds,
  fetchStockLatest,
  formatStockLatestForWhatsapp,
  fetchStockJSON: fetchStockLatest,
  fetchGearSeedsJSON: fetchStockLatest,
  extractCounts,
  formatGearSeedsForWhatsapp,
  formatStockForWhatsapp,
  getEmoji,
  getEmojiFromLastSeen,
  formatStockLatestForWhatsapp
};