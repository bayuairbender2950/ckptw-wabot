const { quote } = require("@itsreimau/ckptw-mod");
const getstock = require("../../gag/getstock");
const getweather = require("../../gag/getweather");
const getegg = require("../../gag/getegg");
const getcosmetic = require("../../gag/getcosmetic");
const gethoney = require("../../gag/gethoney");

function formatDateWIB(date) {
  const d = new Date(date);
  d.setHours(d.getHours() + 7); // WIB offset
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  return {
    tanggal: `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`,
    waktu: d.toTimeString().split(" ")[0]
  };
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

module.exports = {
  name: "cekstock",
  aliases: ["stockgag", "gagstock"],
  category: "growagarden",
  code: async (ctx) => {
    try {
      const stock = await getstock.fetchStockLatest();

      // Format tanggal dan waktu WIB
      const now = Date.now();
      const { tanggal, waktu } = formatDateWIB(now);

      // Seeds
      const seedStock = Array.isArray(stock.seed_stock) ? stock.seed_stock : [];
      const seedsSorted = [...seedStock].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
      const msgSeeds = seedsSorted.map(item =>
        `- ${emojiSeed(item.display_name)} ${item.display_name} x${item.quantity ?? item.value}`
      ).join("\n");

      // Gear
      const gearStock = Array.isArray(stock.gear_stock) ? stock.gear_stock : [];
      const gearSorted = [...gearStock].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
      const msgGear = gearSorted.map(item =>
        `- ${emojiGear(item.display_name)} ${item.display_name} x${item.quantity ?? item.value}`
      ).join("\n");

      // Egg
      const eggStock = Array.isArray(stock.egg_stock) ? stock.egg_stock : [];
      // Gabungkan dan urutkan berdasarkan display_name, lalu group by display_name dan jumlahkan quantity
      const eggMap = {};
      for (const item of eggStock) {
        const key = item.display_name || item.name;
        if (!eggMap[key]) eggMap[key] = { ...item, quantity: 0 };
        eggMap[key].quantity += item.quantity ?? item.value ?? 1;
      }
      const msgEgg = Object.values(eggMap)
        .map(item => `- ${emojiEgg(item.display_name)} ${item.display_name} x${item.quantity}`)
        .join("\n");

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

      let msg = [
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
        "🌵 Cactus Event Stock",
        msgCactus
      ].join("\n");

      return await ctx.reply(msg);
    } catch (e) {
      return await ctx.reply(quote("Gagal cek semua stock: " + e.message));
    }
  }
};
