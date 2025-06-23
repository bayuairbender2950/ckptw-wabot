const { quote } = require("@itsreimau/ckptw-mod");

const validTypes = ["gear", "seed", "egg", "weather", "honey", "cosmetic", "all"];

module.exports = {
  name: "gagnotify",
  aliases: ["notifgag", "gagnotifikasi"],
  category: "growagarden",
  permissions: {
    group: true,
    admin: true
  },
  code: async (ctx) => {
    const input = (ctx.args[0] || "").toLowerCase();
    const groupId = ctx.getId(ctx.id);

    // Ambil dari DB, jika belum ada, inisialisasi objek kosong
    let notifGroups = await db.get("gag.notifGroups");
    if (!notifGroups || typeof notifGroups !== "object") notifGroups = {};

    if (input === "off") {
      delete notifGroups[groupId];
      await db.set("gag.notifGroups", notifGroups);
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

    notifGroups[groupId] = types;
    await db.set("gag.notifGroups", notifGroups);

    return await ctx.reply(
      quote(
        `✅ Notifikasi Grow a Garden diaktifkan untuk grup ini!\n` +
        `Tipe: ${types.join(", ")}\n\n` +
        `Contoh: .gagnotif gear,seed,egg,weather,honey,cosmetic\nMatikan: .gagnotif off`
      )
    );
  }
};
