const { quote } = require("@itsreimau/ckptw-mod");
const getstock = require("../../gag/getstock");
const getweather = require("../../gag/getweather");
const getegg = require("../../gag/getegg");
const getcosmetic = require("../../gag/getcosmetic");
const gethoney = require("../../gag/gethoney");

module.exports = {
  name: "cekstock",
  aliases: ["stockgag", "gagstock"],
  category: "growagarden",
  code: async (ctx) => {
    try {
      // Fetch sekali dari api.joshlei.com/v2/growagarden/stock
      const stock = await getstock.fetchStockLatest();

      // Pastikan semua array tidak undefined/null
      const gearStock = Array.isArray(stock.gear_stock) ? stock.gear_stock : [];
      const seedStock = Array.isArray(stock.seed_stock) ? stock.seed_stock : [];
      const eggStock = Array.isArray(stock.egg_stock) ? stock.egg_stock : [];
      const cosmeticStock = Array.isArray(stock.cosmetic_stock) ? stock.cosmetic_stock : [];
      const honeyStock = Array.isArray(stock.eventshop_stock) ? stock.eventshop_stock : [];

      // Format Gear & Seeds (tanpa header ganda, tampilkan jika ada data)
      let msgGear = "-";
      if (gearStock.length || seedStock.length) {
        const formatList = arr =>
          arr.length
            ? arr.map(item => {
                const emoji = getstock.getEmoji(item.display_name || item.name);
                return `${emoji} *${item.display_name || item.name}* x${item.quantity ?? item.value}`;
              }).join("\n")
            : "-";
        msgGear =
          (gearStock.length ? "*Gear:*\n" + formatList(gearStock) : "") +
          (gearStock.length && seedStock.length ? "\n\n" : "") +
          (seedStock.length ? "*Seeds:*\n" + formatList(seedStock) : "");
        msgGear = msgGear.trim();
      }

      // Format Egg
      let msgEgg = "-";
      try {
        msgEgg = getegg.formatEggForWhatsapp({
          egg: eggStock,
          updatedAt: Date.now()
        });
        if (typeof msgEgg === "string") {
          msgEgg = msgEgg.replace(/^🥚 \*Egg Stock\*\n?/m, "").trim();
        }
      } catch {
        msgEgg = "-";
      }

      // Format Weather (tampilkan status aktif jika ada)
      let msgWeather = "-";
      try {
        const weatherData = await getweather.fetchWeatherJSON();
        if (weatherData.weather && weatherData.weather.weather_name) {
          msgWeather =
            (weatherData.weather.icon ? `${weatherData.weather.icon} ` : "") +
            (weatherData.weather.weather_name || "") +
            (weatherData.updatedAt ? `\nUpdated: ${new Date(weatherData.updatedAt).toLocaleString()}` : "");
        } else {
          msgWeather = "Tidak ada weather aktif\n" +
            (weatherData.updatedAt ? `Updated: ${new Date(weatherData.updatedAt).toLocaleString()}` : "");
        }
        msgWeather = msgWeather.trim();
      } catch {
        msgWeather = "-";
      }

      // Format Cosmetic
      let msgCosmetic = "-";
      try {
        msgCosmetic = getcosmetic.formatCosmeticForWhatsapp({
          cosmetics: cosmeticStock,
          updatedAt: Date.now()
        });
        if (typeof msgCosmetic === "string") {
          msgCosmetic = msgCosmetic.replace(/^🎀 \*Cosmetic Stock\*\n?/m, "").trim();
        }
      } catch {
        msgCosmetic = "-";
      }

      // Format Honey/EventShop
      let msgHoney = "-";
      try {
        msgHoney = gethoney.formatHoneyForWhatsapp({
          honey: honeyStock,
          updatedAt: Date.now()
        });
        if (typeof msgHoney === "string") {
          msgHoney = msgHoney.replace(/^🍯 \*Honey Stock\*\n?/m, "").trim();
        }
      } catch {
        msgHoney = "-";
      }

      let msg = [
        "🛠️ *Gear & Seeds*",
        msgGear,
        "",
        "🥚 *Egg Stock*",
        msgEgg,
        "",
        "🌤️ *Weather*",
        msgWeather,
        "",
        "🎀 *Cosmetic Stock*",
        msgCosmetic,
        "",
        "🍯 *Honey/EventShop*",
        msgHoney
      ].map(m => typeof m === "string" ? m.replace(/\n{3,}/g, "\n\n") : m).join("\n\n");

      return await ctx.reply(msg);
    } catch (e) {
      return await ctx.reply(quote("Gagal cek semua stock: " + e.message));
    }
  }
};
