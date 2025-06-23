const { quote } = require("@itsreimau/ckptw-mod");
const getstock = require("../../gag/getstock");
const moment = require("moment-timezone");
const config = require("../../config");

module.exports = {
  name: "cektimer",
  aliases: ["timerstock", "cekstocktimer"],
  category: "growagarden",
  code: async (ctx) => {
    try {
      // Ambil data stock gear-seeds
      const stock = await getstock.fetchGearSeedsJSON();
      const updatedAt = stock.updatedAt || Date.now();
      const now = Date.now();

      // Format waktu lokal Asia/Makassar
      const updatedDate = moment(updatedAt).tz(config.timezone || "Asia/Makassar");
      const nowDate = moment(now).tz(config.timezone || "Asia/Makassar");

      // Hitung selisih waktu
      const diffMs = now - updatedAt;
      const diffMin = Math.floor(diffMs / 60000);
      const diffSec = Math.floor((diffMs % 60000) / 1000);

      // Hitung waktu menuju menit kelipatan 5 berikutnya
      const next5 = updatedDate.clone().add(5 - (updatedDate.minute() % 5), "minutes").startOf("minute");
      const untilNext5 = next5.diff(nowDate, "seconds");
      const untilMin = Math.floor(untilNext5 / 60);
      const untilSec = untilNext5 % 60;

      let msg = [
        "*⏲️ CEK TIMER STOCK GEAR-SEEDS*",
        `*Waktu update terakhir:* ${updatedDate.format("YYYY-MM-DD HH:mm:ss")}`,
        `*Sekarang:* ${nowDate.format("YYYY-MM-DD HH:mm:ss")}`,
        `*Sudah berlalu:* ${diffMin} menit ${diffSec} detik`,
        `*Menuju restock berikutnya (kelipatan 5 menit):* ${untilMin} menit ${untilSec} detik`
      ].join("\n");

      return await ctx.reply(quote(msg));
    } catch (e) {
      return await ctx.reply(quote("Gagal cek timer: " + e.message));
    }
  }
};