const getstock = require("./getstock");
const getweather = require("./getweather");
const getegg = require("./getegg");
const getcosmetic = require("./getcosmetic");
const gethoney = require("./gethoney");
const { sendGrowagardenNotif } = require("../events/handler");
const moment = require("moment-timezone");
const config = require("../config");
const jandelnotif = require("./jandelnotif");

let lastGearSeeds = null, lastWeather = null, lastEgg = null, lastCosmetic = null, lastHoney = null;
let lastNotifSent = { gearSeeds: 0, weather: 0, egg: 0, cosmetic: 0, honey: 0 };

// Hapus cache polling, gunakan fetch langsung setiap polling
// Hapus juga lastApiData, lastApiRaw, lastApiTime

// Polling Gear & Seeds
async function pollGearSeeds() {
  try {
    const stock = await getstock.fetchStockLatest();
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

// Polling Egg
async function pollEgg() {
  try {
    const stock = await getstock.fetchStockLatest();
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

// Polling Cosmetic
async function pollCosmetic() {
  try {
    const stock = await getstock.fetchStockLatest();
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

// Polling Honey
async function pollHoney() {
  try {
    const stock = await getstock.fetchStockLatest();
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

// Polling Weather
async function pollWeather() {
  try {
    const weatherData = await getweather.fetchWeatherJSON();
    if (!weatherData) return;
    const currentWeather = weatherData.weather || {};
    let changed = !lastWeather || JSON.stringify(lastWeather) !== JSON.stringify(currentWeather);
    if (changed && (currentWeather.weather_name || Object.keys(currentWeather).length === 0) && Date.now() - lastNotifSent.weather > 10000) {
      console.log("Perubahan Cuaca terdeteksi, mengirim notifikasi...");
      await sendGrowagardenNotif(getweather.formatWeatherForWhatsapp(weatherData), "weather");
      lastNotifSent.weather = Date.now();
    }
    lastWeather = currentWeather;
  } catch (e) { console.error("pollWeather error:", e); }
}

// Interval polling tetap, tapi semua fetch langsung ke API
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

setInterval(async () => {
  try {
    await jandelnotif.pollJandelNotif();
  } catch (e) {
    console.error("Jandel notif polling error:", e);
  }
}, 10000); // 10 detik
