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

      // Simulasi semua notifikasi GAG
      await sendGrowagardenNotif(getstock.formatGearSeedsForWhatsapp(stock, stock.lastSeen || {}), "gear");
      await sendGrowagardenNotif(getegg.formatEggForWhatsapp({
        egg: stock.eggStock || [],
        updatedAt: stock.timerCalculatedAt
      }), "egg");
      await sendGrowagardenNotif(getweather.formatWeatherForWhatsapp({
        weather: (stock.lastSeen?.Weather || []).slice(-1)[0] || {},
        updatedAt: stock.timerCalculatedAt
      }), "weather");
      await sendGrowagardenNotif(getcosmetic.formatCosmeticForWhatsapp({
        cosmetics: stock.cosmeticsStock || [],
        updatedAt: stock.timerCalculatedAt
      }), "cosmetic");
      await sendGrowagardenNotif(gethoney.formatHoneyForWhatsapp({
        honey: stock.honeyStock || [],
        updatedAt: stock.timerCalculatedAt
      }), "honey");

      return await ctx.reply(quote("✅ Simulasi notifikasi GAG berhasil dikirim ke semua grup yang aktif."));
    } catch (e) {
      return await ctx.reply(quote("Gagal simulasi notifikasi: " + e.message));
    }
  }
};
