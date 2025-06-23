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

function emojiSeed(name) {
  if (!name) return "🌱";
  const lower = name.toLowerCase();
  if (lower.includes("watermelon")) return "🍉";
  if (lower.includes("strawberry")) return "🍓";
  if (lower.includes("green apple")) return "📦";
  if (lower.includes("carrot")) return "🥕";
  if (lower.includes("tomato")) return "🍅";
  if (lower.includes("blueberry")) return "🫐";
  return "🌱";
}
function emojiGear(name) {
  if (!name) return "⚙️";
  const lower = name.toLowerCase();
  if (lower.includes("cleaning spray")) return "🧽";
  if (lower.includes("trowel")) return "🔧";
  if (lower.includes("watering can")) return "🚿";
  if (lower.includes("recall wrench")) return "🔧";
  if (lower.includes("favorite tool")) return "⭐";
  if (lower.includes("harvest tool")) return "🛠️";
  return "⚙️";
}
function emojiEgg(name) {
  if (!name) return "🥚";
  const lower = name.toLowerCase();
  if (lower.includes("rare")) return "📦";
  if (lower.includes("common")) return "🥚";
  return "🥚";
}
function emojiCactus(name) {
  if (!name) return "🌵";
  const lower = name.toLowerCase();
  if (lower.includes("cactus")) return "🌵";
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

function formatStockLatestForWhatsapp(stock) {
  // Seeds
  const seedStock = Array.isArray(stock.seed_stock) ? stock.seed_stock : [];
  const seedMap = {};
  for (const item of seedStock) {
    const key = item.display_name || item.name;
    if (!seedMap[key]) seedMap[key] = { ...item, quantity: 0 };
    seedMap[key].quantity += item.quantity ?? item.value ?? 1;
  }
  const seedsSorted = Object.values(seedMap).sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  const msgSeeds = seedsSorted.length
    ? seedsSorted.map(item =>
        `- ${emojiSeed(item.display_name)} ${item.display_name} x${item.quantity}`
      ).join("\n")
    : "-";

  // Gear
  const gearStock = Array.isArray(stock.gear_stock) ? stock.gear_stock : [];
  const gearMap = {};
  for (const item of gearStock) {
    const key = item.display_name || item.name;
    if (!gearMap[key]) gearMap[key] = { ...item, quantity: 0 };
    gearMap[key].quantity += item.quantity ?? item.value ?? 1;
  }
  const gearSorted = Object.values(gearMap).sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  const msgGear = gearSorted.length
    ? gearSorted.map(item =>
        `- ${emojiGear(item.display_name)} ${item.display_name} x${item.quantity}`
      ).join("\n")
    : "-";

  // Egg
  const eggStock = Array.isArray(stock.egg_stock) ? stock.egg_stock : [];
  const eggMap = {};
  for (const item of eggStock) {
    const key = item.display_name || item.name;
    if (!eggMap[key]) eggMap[key] = { ...item, quantity: 0 };
    eggMap[key].quantity += item.quantity ?? item.value ?? 1;
  }
  const msgEgg = Object.values(eggMap)
    .map(item => `- ${emojiEgg(item.display_name)} ${item.display_name} x${item.quantity}`)
    .join("\n");

  // Cosmetic
  const cosmeticStock = Array.isArray(stock.cosmetic_stock) ? stock.cosmetic_stock : [];
  const cosmeticsSorted = [...cosmeticStock].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  const msgCosmetic = cosmeticsSorted.length
    ? cosmeticsSorted.map(item =>
        `- 🎀 ${item.display_name} x${item.quantity ?? item.value}`
      ).join("\n")
    : "-";

  // Cactus Event
  let cactusStock = [];
  if (Array.isArray(stock.cactus_event_stock) && stock.cactus_event_stock.length > 0) {
    cactusStock = stock.cactus_event_stock;
  } else if (Array.isArray(stock.eventshop_stock) && stock.eventshop_stock.length > 0) {
    cactusStock = stock.eventshop_stock;
  }
  const cactusSorted = [...cactusStock].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  const msgCactus = cactusSorted.length
    ? cactusSorted.map(item =>
        `- ${emojiCactus(item.display_name)} ${item.display_name} x${item.quantity ?? item.value}`
      ).join("\n")
    : "-";

  const now = new Date();
  now.setHours(now.getHours() + 7);
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  const tanggal = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
  const waktu = now.toTimeString().split(" ")[0];

  return [
    "🌱 GROW A GARDEN STOCK UPDATE 🌱",
    "",
    `📅 Tanggal: ${tanggal}`,
    `⏰ Waktu: ${waktu} WIB`,
    "",
    "🌱 Seeds Stock",
    msgSeeds,
    "",
    "⚙️ Gear Stock",
    msgGear,
    "",
    "🥚 Egg Stock",
    msgEgg,
    "",
    "🎀 Cosmetic Stock",
    msgCosmetic,
    "",
    "🌵 Cactus Event Stock",
    msgCactus
  ].join("\n");
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