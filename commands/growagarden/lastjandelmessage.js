const { quote } = require("@itsreimau/ckptw-mod");
const { getLastJandelMessage } = require("../../gag/jandelnotif");

module.exports = {
  name: "lastjandelmessage",
  aliases: ["lastjandel", "jandelmsg"],
  category: "growagarden",
  code: async (ctx) => {
    const msg = getLastJandelMessage();
    if (!msg) {
      return await ctx.reply(quote("Belum ada pesan Jandel yang tersimpan."));
    }
    return await ctx.reply(
      `📢 *Jandel Announcement*\n\n${msg.message}\n\n🕒 ${new Date(msg.timestamp * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`
    );
  }
};
