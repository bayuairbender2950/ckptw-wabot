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
      // Fetch sekali dari growagarden.gg/api/stock
      const stock = await getstock.fetchStockLatest();

      // Format
      const msgGear = getstock.formatGearSeedsForWhatsapp(stock, stock.lastSeen || {}).replace(/^🛠️ \*Gear & Seeds\*\n?/m, "").trim();
      const msgEgg = getegg.formatEggForWhatsapp({
        egg: stock.eggStock || [],
        updatedAt: stock.timerCalculatedAt
      }).replace(/^🥚 \*Egg Stock\*\n?/m, "").trim();
      const msgWeather = getweather.formatWeatherForWhatsapp({
        weather: (stock.lastSeen?.Weather || []).slice(-1)[0] || {},
        updatedAt: stock.timerCalculatedAt
      }).replace(/^🌤️ \*Weather\*\n?/m, "").trim();
      const msgCosmetic = getcosmetic.formatCosmeticForWhatsapp({
        cosmetics: stock.cosmeticsStock || [],
        updatedAt: stock.timerCalculatedAt
      }).replace(/^🎀 \*Cosmetic Stock\*\n?/m, "").trim();
      const msgHoney = gethoney.formatHoneyForWhatsapp({
        honey: stock.honeyStock || [],
        updatedAt: stock.timerCalculatedAt
      }).replace(/^🍯 \*Honey Stock\*\n?/m, "").trim();

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
        "🍯 *Honey Stock*",
        msgHoney
      ].map(m => m.replace(/\n{3,}/g, "\n\n")).join("\n\n");

      return await ctx.reply(msg);
    } catch (e) {
      return await ctx.reply(quote("Gagal cek semua stock: " + e.message));
    }
  }
};
