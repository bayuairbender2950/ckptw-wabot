const getstock = require("./getstock");
const getweather = require("./getweather");
const getegg = require("./getegg");
const getcosmetic = require("./getcosmetic");
const gethoney = require("./gethoney");
const { sendGrowagardenNotif } = require("../events/handler");
const moment = require("moment-timezone");
const config = require("../config");


let lastStock = null, lastGearSeeds = null, lastWeather = null, lastEgg = null, lastCosmetic = null, lastHoney = null;
let lastNotifSent = { stock: 0, gearSeeds: 0, weather: 0, egg: 0, cosmetic: 0, honey: 0 };

let lastApiFetchTime = 0;

let lastApiData = null;
let lastApiRaw = "";
let lastApiTime = 0;

setInterval(async () => {
  try {
    const stock = await getstock.fetchStockLatest();
    const raw = JSON.stringify(stock);
    if (raw !== lastApiRaw) {
      lastApiData = stock;
      lastApiRaw = raw;
      lastApiTime = Date.now();
      await db.set("gag.lastStockLatest", stock);
    }
  } catch (e) {
    console.error("GAG API fetch error:", e);
  }
}, 1000);

// Fungsi polling & compare untuk setiap fetcher, gunakan cache terbaru
async function pollStock() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    let changed = !lastStock || JSON.stringify(lastStock) !== JSON.stringify(stock);
    if (changed && Date.now() - lastNotifSent.stock > 10000) {
      await sendGrowagardenNotif(getstock.formatStockLatestForWhatsapp(stock), "all");
      lastNotifSent.stock = Date.now();
    }
    lastStock = stock;
  } catch (e) { console.error("pollStock error:", e); }
}

async function pollGearSeeds() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    await db.set("gag.lastGearSeeds", {
      gear: stock.gearStock,
      seeds: stock.seedsStock,
      updatedAt: stock.timerCalculatedAt
    });
    let changed = !lastGearSeeds || JSON.stringify(lastGearSeeds) !== JSON.stringify(stock);
    if (changed && Date.now() - lastNotifSent.gearSeeds > 10000) {
      await sendGrowagardenNotif(getstock.formatGearSeedsForWhatsapp(stock, stock.lastSeen || {}), "gear");
      lastNotifSent.gearSeeds = Date.now();
    }
    lastGearSeeds = stock;
  } catch (e) { console.error("pollGearSeeds error:", e); }
}

async function pollWeather() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    await db.set("gag.lastWeather", stock.lastSeen?.Weather || []);
    let changed = !lastWeather || JSON.stringify(lastWeather) !== JSON.stringify(stock.lastSeen?.Weather);
    if (changed && Date.now() - lastNotifSent.weather > 10000) {
      await sendGrowagardenNotif(getweather.formatWeatherForWhatsapp({
        weather: (stock.lastSeen?.Weather || []).slice(-1)[0] || {},
        updatedAt: stock.timerCalculatedAt
      }), "weather");
      lastNotifSent.weather = Date.now();
    }
    lastWeather = stock.lastSeen?.Weather || [];
  } catch (e) { console.error("pollWeather error:", e); }
}

async function pollEgg() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    await db.set("gag.lastEgg", stock.eggStock || []);
    let changed = !lastEgg || JSON.stringify(lastEgg) !== JSON.stringify(stock.eggStock);
    if (changed && Date.now() - lastNotifSent.egg > 10000) {
      await sendGrowagardenNotif(getegg.formatEggForWhatsapp({
        egg: stock.eggStock || [],
        updatedAt: stock.timerCalculatedAt
      }), "egg");
      lastNotifSent.egg = Date.now();
    }
    lastEgg = stock.eggStock || [];
  } catch (e) { console.error("pollEgg error:", e); }
}

async function pollCosmetic() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    await db.set("gag.lastCosmetic", stock.cosmeticsStock || []);
    let changed = !lastCosmetic || JSON.stringify(lastCosmetic) !== JSON.stringify(stock.cosmeticsStock);
    if (changed && Date.now() - lastNotifSent.cosmetic > 10000) {
      await sendGrowagardenNotif(getcosmetic.formatCosmeticForWhatsapp({
        cosmetics: stock.cosmeticsStock || [],
        updatedAt: stock.timerCalculatedAt
      }), "cosmetic");
      lastNotifSent.cosmetic = Date.now();
    }
    lastCosmetic = stock.cosmeticsStock || [];
  } catch (e) { console.error("pollCosmetic error:", e); }
}

async function pollHoney() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    await db.set("gag.lastHoney", stock.honeyStock || []);
    let changed = !lastHoney || JSON.stringify(lastHoney) !== JSON.stringify(stock.honeyStock);
    if (changed && Date.now() - lastNotifSent.honey > 10000) {
      await sendGrowagardenNotif(gethoney.formatHoneyForWhatsapp({
        honey: stock.honeyStock || [],
        updatedAt: stock.timerCalculatedAt
      }), "honey");
      lastNotifSent.honey = Date.now();
    }
    lastHoney = stock.honeyStock || [];
  } catch (e) { console.error("pollHoney error:", e); }
}

async function sendAllRestockNotif() {
  try {
    const [
      stock,
      gearSeeds,
      weather,
      egg,
      cosmetic,
      honey
    ] = await Promise.all([
      getstock.fetchStockJSON(),
      getstock.fetchGearSeedsJSON(),
      getweather.fetchWeatherJSON(),
      getegg.fetchEggJSON(),
      getcosmetic.fetchCosmeticJSON(),
      gethoney.fetchHoneyJSON()
    ]);

    // Format pesan
    const msgGear = getstock.formatGearSeedsForWhatsapp({
      gear: getstock.extractCounts(gearSeeds.gear || []),
      seeds: getstock.extractCounts(gearSeeds.seeds || []),
      updatedAt: gearSeeds.updatedAt
    });
    const msgStock = getstock.formatStockForWhatsapp({
      Data: {
        gear: getstock.extractCounts(stock.gear || []),
        seeds: getstock.extractCounts(stock.seeds || []),
        egg: getstock.extractCounts(stock.egg || []),
        updatedAt: stock.updatedAt
      }
    });
    const msgWeather = getweather.formatWeatherForWhatsapp(weather);
    const msgEgg = getegg.formatEggForWhatsapp(egg);
    const msgCosmetic = getcosmetic.formatCosmeticForWhatsapp(cosmetic);
    const msgHoney = gethoney.formatHoneyForWhatsapp(honey);

    await sendGrowagardenNotif(msgGear, "gear");
    await sendGrowagardenNotif(msgStock, "seed");
    await sendGrowagardenNotif(msgEgg, "egg");
    await sendGrowagardenNotif(msgWeather, "weather");
    await sendGrowagardenNotif(msgCosmetic, "cosmetic");
    await sendGrowagardenNotif(msgHoney, "honey");
  } catch (e) {
    console.error("Gagal kirim notif restock:", e);
  }
}

setInterval(async () => {
  const makassar = moment().tz(config.timezone || "Asia/Makassar");
  const minute = makassar.minute();
  const second = makassar.second();

  if (minute % 5 === 0 && second === 30) {
    await pollStock();
    await pollGearSeeds();
    await pollWeather();
    await pollEgg();
    await pollCosmetic();
    await pollHoney();
  }
}, 1000);

let manualResetTime = 0;

setInterval(async () => {
  // Cek apakah ada manual reset timer
  try {
    manualResetTime = await db.get("gag.manualResetTimer") || 0;
    if (manualResetTime) {
      const now = Date.now();
      const diff = now - manualResetTime;
      if (diff >= 300000) {
        try {
          const getstock = require("./getstock");
          const stock = await getstock.fetchGearSeedsJSON();
          const gearArr = getstock.extractCounts(stock.gear || []);
          const seedsArr = getstock.extractCounts(stock.seeds || []);
          const notifMsg = getstock.formatGearSeedsForWhatsapp({ gear: gearArr, seeds: seedsArr, updatedAt: stock.updatedAt });
          await require("../events/handler").sendGrowagardenNotif(notifMsg);
          await db.set("gag.manualResetTimer", 0); // reset timer
        } catch (e) {
          console.error("Gagal kirim notif stock setelah reset timer:", e);
        }
      }
    }
  } catch (e) {
    console.error("Gagal cek manualResetTimer:", e);
  }
}, 1000);

