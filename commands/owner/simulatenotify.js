const { quote } = require("@itsreimau/ckptw-mod");
const getstock = require("../../gag/getstock");
const getweather = require("../../gag/getweather");
const getegg = require("../../gag/getegg");
const getcosmetic = require("../../gag/getcosmetic");
const gethoney = require("../../gag/gethoney");
const { sendGrowagardenNotif } = require("../../events/handler");

module.exports = {
  name: "simulatenotify",
  aliases: ["simulatenotif", "simulategag"],
  category: "owner",
  permissions: {
    owner: true
  },
  code: async (ctx) => {
    try {
      const stock = await getstock.fetchStockLatest();
      const weatherData = await getweather.fetchWeatherJSON();

      if (!stock) {
        return await ctx.reply(quote("Gagal mengambil data stok dari API, simulasi dibatalkan."));
      }
      
      console.log("Memulai simulasi notifikasi GAG...");
      await sendGrowagardenNotif(getstock.formatGearSeedsForWhatsapp(stock), "gear");
      await sendGrowagardenNotif(getegg.formatEggForWhatsapp({
        egg: stock.egg_stock || [], 
        updatedAt: Date.now()
      }), "egg");
      
      await sendGrowagardenNotif(getweather.formatWeatherForWhatsapp(weatherData), "weather");
      await sendGrowagardenNotif(getcosmetic.formatCosmeticForWhatsapp({
        cosmetics: stock.cosmetic_stock || [],
        updatedAt: Date.now()
      }), "cosmetic");
      await sendGrowagardenNotif(gethoney.formatHoneyForWhatsapp({
        honey: stock.eventshop_stock || [], 
        updatedAt: Date.now()
      }), "honey");
      console.log("Simulasi notifikasi berhasil.");
      return await ctx.reply(quote("✅ Simulasi notifikasi GAG berhasil dikirim ke semua grup yang aktif."));
    } catch (e) {
      console.error("Gagal simulasi notifikasi:", e);
      return await ctx.reply(quote("Gagal simulasi notifikasi: " + e.message));
    }
  }
};