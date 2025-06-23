const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");

let lastKnownEggStock = [];
let lastUpdateTimestamp = null;

async function fetchEggJSON() {
  console.log("[getegg.js] Memulai fetchEggJSON...");
  
  try {
    const stock = await fetchStockLatest();
    
    console.log(`[getegg.js] Berhasil fetch. Apakah ada egg_stock? ${stock && stock.egg_stock ? 'Ya' : 'Tidak'}`);

    const newEggStock = Array.isArray(stock.egg_stock) && stock.egg_stock.length > 0
      ? stock.egg_stock
      : null;

    let finalEggStock;

    if (newEggStock) {
      console.log(`[getegg.js] Ditemukan ${newEggStock.length} telur baru. Menyimpan ke cache.`);
      finalEggStock = newEggStock;
      lastKnownEggStock = newEggStock;
      lastUpdateTimestamp = Date.now();
    } else {
      console.log("[getegg.js] Tidak ada telur baru di API, menggunakan data dari cache.");
      finalEggStock = lastKnownEggStock;
    }

    return {
      egg: finalEggStock,
      updatedAt: lastUpdateTimestamp || Date.now()
    };
  } catch (error) {
    console.error("[getegg.js] Gagal total di fetchEggJSON:", error);
    return {
      egg: lastKnownEggStock,
      updatedAt: lastUpdateTimestamp
    };
  }
}

function emojiEgg(name) {
  if (!name) return "🥚";
  const lower = name.toLowerCase();
  if (lower.includes("rare")) return "📦";
  if (lower.includes("common")) return "🥚";
  return "🥚";
}

function formatEggForWhatsapp(eggData) {
  const eggStock = Array.isArray(eggData.egg) ? eggData.egg : [];
  const eggMap = {};
  for (const item of eggStock) {
    const key = item.display_name || item.name;
    if (!eggMap[key]) eggMap[key] = { ...item, quantity: 0 };
    eggMap[key].quantity += item.quantity ?? item.value ?? 1;
  }
  const msgEgg = Object.values(eggMap)
    .map(item => `- ${emojiEgg(item.display_name)} ${item.display_name} x${item.quantity}`)
    .join("\n");

  return [
    "🥚 Egg Stock",
    msgEgg
  ].join("\n");
}

async function updateEgg() {
  try {
    const egg = await fetchEggJSON();
    const notifMsg = formatEggForWhatsapp(egg);
    await sendGrowagardenNotif(notifMsg);
  } catch (err) {
    console.error("[getegg.js] Gagal di updateEgg:", err.message);
  }
}

module.exports = {
  updateEgg,
  fetchEggJSON,
  formatEggForWhatsapp
};