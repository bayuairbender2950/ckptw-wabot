const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");

// Variabel untuk menyimpan data terakhir
let lastKnownEggStock = [];
let lastUpdateTimestamp = null;

async function fetchEggJSON() {
  // Log untuk debugging
  console.log("[getegg.js] Memulai fetchEggJSON...");
  
  try {
    const stock = await fetchStockLatest();
    
    // Log untuk melihat apa yang didapat dari API
    console.log(`[getegg.js] Berhasil fetch. Apakah ada egg_stock? ${stock && stock.egg_stock ? 'Ya' : 'Tidak'}`);

    const newEggStock = Array.isArray(stock.egg_stock) && stock.egg_stock.length > 0
      ? stock.egg_stock
      : null;

    let finalEggStock;

    if (newEggStock) {
      // Log jika ada stok baru
      console.log(`[getegg.js] Ditemukan ${newEggStock.length} telur baru. Menyimpan ke cache.`);
      finalEggStock = newEggStock;
      lastKnownEggStock = newEggStock;
      lastUpdateTimestamp = Date.now();
    } else {
      // Log jika tidak ada stok baru
      console.log("[getegg.js] Tidak ada telur baru di API, menggunakan data dari cache.");
      finalEggStock = lastKnownEggStock;
    }

    return {
      egg: finalEggStock,
      updatedAt: lastUpdateTimestamp || Date.now()
    };
  } catch (error) {
    console.error("[getegg.js] Gagal total di fetchEggJSON:", error);
    // Jika gagal, tetap kembalikan data terakhir yang diketahui agar tidak kosong
    return {
      egg: lastKnownEggStock,
      updatedAt: lastUpdateTimestamp
    };
  }
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

function formatEggForWhatsapp(eggData) {
  function formatList(arr) {
    return Array.isArray(arr) && arr.length
      ? arr.map(item => `${getEmoji(item.display_name || item.name)} *${item.display_name || item.name}* x${item.quantity ?? item.value}`).join("\n")
      : "-\n_(Tidak ada stok saat ini)_";
  }
  
  return [
    "🥚 *Egg Stock*",
    "",
    "*Eggs:*",
    formatList(eggData.egg), 
    "",
    eggData.updatedAt ? `*Last Seen:* ${new Date(eggData.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Makassar' })} WITA` : ""
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
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