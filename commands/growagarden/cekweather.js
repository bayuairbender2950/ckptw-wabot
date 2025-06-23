const { quote } = require("@itsreimau/ckptw-mod");
const getweather = require("../../gag/getweather");

module.exports = {
  name: "cekweather",
  aliases: ["weather", "gagweather"],
  category: "growagarden",
  code: async (ctx) => {
    try {
      const weatherData = await getweather.fetchWeatherJSON();
      const msg = getweather.formatWeatherForWhatsapp(weatherData);
      return await ctx.reply(msg);
    } catch (e) {
      return await ctx.reply(quote("Gagal cek weather: " + e.message));
    }
  }
};
