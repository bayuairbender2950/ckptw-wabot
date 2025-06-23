const { quote } = require("@itsreimau/ckptw-mod");

module.exports = {
  name: "gagnotif",
  aliases: ["gagnotify", "gagnotifikasi"],
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

    // Default: all jika tidak ada argumen
    const validTypes = ["gear", "seed", "egg", "weather", "honey", "cosmetic", "all"];
    let types = input ? input.split(",").map(t => t.trim()).filter(t => validTypes.includes(t)) : ["all"];
    if (!types.length) types = ["all"];

    notifGroups[groupId] = types;
    await db.set("gag.notifGroups", notifGroups);

    // Konfirmasi ke user
    return await ctx.reply(
      quote(
        `✅ Notifikasi Grow a Garden diaktifkan untuk grup ini!\n` +
        `Tipe: ${types.join(", ")}\n\n` +
        `Contoh: .gagnotif gear,seed,egg,weather,honey,cosmetic,all\nMatikan: .gagnotif off`
      )
    );
  }
};
