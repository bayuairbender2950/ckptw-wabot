const getstock = require("./getstock");
const getweather = require("./getweather");
const getegg = require("./getegg");
const getcosmetic = require("./getcosmetic");
const gethoney = require("./gethoney");
const { sendGrowagardenNotif } = require("../events/handler");
const moment = require("moment-timezone");
const config = require("../config");

let lastGearSeeds = null, lastWeather = null, lastEgg = null, lastCosmetic = null, lastHoney = null;
let lastNotifSent = { gearSeeds: 0, weather: 0, egg: 0, cosmetic: 0, honey: 0 };
let lastApiData = null;
let lastApiRaw = "";

setInterval(async () => {
  try {
    const stock = await getstock.fetchStockLatest();
    if (!stock) return;
    const raw = JSON.stringify(stock);
    if (raw !== lastApiRaw) {
      console.log("[Scheduler] API Stok terdeteksi berubah. Memperbarui cache...");
      lastApiData = stock;
      lastApiRaw = raw;
    }
  } catch (e) {
    console.error("GAG API fetch error:", e);
  }
}, 3000);

async function pollGearSeeds() {
  try {
    const stock = lastApiData;
    if (!stock) return;

    const currentGearAndSeeds = {
        gear: stock.gear_stock || [],
        seeds: stock.seed_stock || []
    };
    
    let changed = !lastGearSeeds || JSON.stringify(lastGearSeeds) !== JSON.stringify(currentGearAndSeeds);

    if (changed && Date.now() - lastNotifSent.gearSeeds > 10000) {
      console.log("Perubahan stok Gear & Seeds terdeteksi, mengirim notifikasi...");
      await sendGrowagardenNotif(getstock.formatGearSeedsForWhatsapp(stock), "gear");
      lastNotifSent.gearSeeds = Date.now();
    }
    lastGearSeeds = currentGearAndSeeds;
  } catch(e) { console.error("pollGearSeeds error:", e); }
}

async function pollEgg() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    const currentEggStock = stock.egg_stock || [];
    let changed = !lastEgg || JSON.stringify(lastEgg) !== JSON.stringify(currentEggStock);
    if (changed && Date.now() - lastNotifSent.egg > 10000) {
      console.log("Perubahan stok Telur terdeteksi, mengirim notifikasi...");
      await sendGrowagardenNotif(getegg.formatEggForWhatsapp({
        egg: currentEggStock,
        updatedAt: Date.now()
      }), "egg");
      lastNotifSent.egg = Date.now();
    }
    lastEgg = currentEggStock;
  } catch (e) { console.error("pollEgg error:", e); }
}

async function pollCosmetic() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    const currentCosmeticStock = stock.cosmetic_stock || [];
    let changed = !lastCosmetic || JSON.stringify(lastCosmetic) !== JSON.stringify(currentCosmeticStock);
    if (changed && Date.now() - lastNotifSent.cosmetic > 10000) {
      console.log("Perubahan stok Kosmetik terdeteksi, mengirim notifikasi...");
      await sendGrowagardenNotif(getcosmetic.formatCosmeticForWhatsapp({
        cosmetics: currentCosmeticStock,
        updatedAt: Date.now()
      }), "cosmetic");
      lastNotifSent.cosmetic = Date.now();
    }
    lastCosmetic = currentCosmeticStock;
  } catch (e) { console.error("pollCosmetic error:", e); }
}

async function pollHoney() {
  try {
    const stock = lastApiData;
    if (!stock) return;
    const currentHoneyStock = stock.eventshop_stock || [];
    let changed = !lastHoney || JSON.stringify(lastHoney) !== JSON.stringify(currentHoneyStock);
    if (changed && Date.now() - lastNotifSent.honey > 10000) {
      console.log("Perubahan stok Honey/Event terdeteksi, mengirim notifikasi...");
      await sendGrowagardenNotif(gethoney.formatHoneyForWhatsapp({
        honey: currentHoneyStock,
        updatedAt: Date.now()
      }), "honey");
      lastNotifSent.honey = Date.now();
    }
    lastHoney = currentHoneyStock;
  } catch (e) { console.error("pollHoney error:", e); }
}

async function pollWeather() {
  try {
    const weatherData = await getweather.fetchWeatherJSON();
    if (!weatherData) return;
    const currentWeather = weatherData.weather || {};
    let changed = !lastWeather || JSON.stringify(lastWeather) !== JSON.stringify(currentWeather);
    if (changed && currentWeather.weather_name && Date.now() - lastNotifSent.weather > 10000) {
        console.log("Perubahan Cuaca terdeteksi, mengirim notifikasi...");
        await sendGrowagardenNotif(getweather.formatWeatherForWhatsapp(weatherData), "weather");
        lastNotifSent.weather = Date.now();
    }
    lastWeather = currentWeather;
  } catch (e) { console.error("pollWeather error:", e); }
}

setInterval(async () => {
  const makassar = moment().tz(config.timezone || "Asia/Makassar");
  const minute = makassar.minute();
  const second = makassar.second();

  if (minute % 5 === 0 && second === 3) {
    console.log(`[Scheduler] Waktu notifikasi tercapai (${minute}:${second}), menjalankan semua poll...`);
    await pollGearSeeds();
    await pollWeather();
    await pollEgg();
    await pollCosmetic();
    await pollHoney();
  }
}, 1000);
