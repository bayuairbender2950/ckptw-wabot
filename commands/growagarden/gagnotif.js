const { quote } = require("@itsreimau/ckptw-mod");
const gagnotifdb = require("../../tools/gagnotifdb");

const validTypes = ["gear", "seed", "egg", "weather", "honey", "cosmetic", "jandel", "all"];

module.exports = {
  name: "gagnotif",
  aliases: ["gagnotify", "notifgag", "gagnotifikasi"],
  category: "growagarden",
  permissions: {
    group: true,
    admin: true
  },
  code: async (ctx) => {
    const input = (ctx.args[0] || "").toLowerCase();
    const groupId = ctx.getId(ctx.id);

    // Ambil dari file local gagnotifdb
    let notifGroups = gagnotifdb.getAll();

    if (input === "off") {
      gagnotifdb.remove(groupId);
      return await ctx.reply(quote("✅ Notifikasi Grow a Garden dimatikan untuk grup ini!"));
    }

    // Jika "all", masukkan semua tipe satuan (bukan string "all" saja)
    let types;
    if (input === "all" || !input) {
      types = validTypes.filter(t => t !== "all");
    } else {
      types = input.split(",").map(t => t.trim()).filter(t => validTypes.includes(t) && t !== "all");
      if (!types.length) types = ["gear"];
    }

    gagnotifdb.set(groupId, types);

    return await ctx.reply(
      quote(
        `✅ Notifikasi Grow a Garden diaktifkan untuk grup ini!\n` +
        `Tipe: ${types.join(", ")}\n\n` +
        `Contoh: .gagnotif gear,seed,egg,weather,honey,cosmetic,jandel\nMatikan: .gagnotif off`
      )
    );
  }
};
