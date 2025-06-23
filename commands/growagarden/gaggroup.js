const { quote } = require("@itsreimau/ckptw-mod");

module.exports = {
  name: "gaggroup",
  aliases: ["gagnotifgroup", "listgaggroup"],
  category: "owner",
  permissions: {
    owner: true
  },
  code: async (ctx) => {
    try {
      const notifGroups = await db.get("gag.notifGroups") || {};
      const groupIds = Object.keys(notifGroups);

      if (groupIds.length === 0) {
        return await ctx.reply(quote("Tidak ada grup yang mengaktifkan notifikasi Grow a Garden."));
      }

      let msg = "*Daftar Grup dengan Notifikasi Grow a Garden Aktif:*\n";
      for (let i = 0; i < groupIds.length; i++) {
        const id = groupIds[i];
        const types = Array.isArray(notifGroups[id])
          ? notifGroups[id].join(", ")
          : String(notifGroups[id]);
        let subject = "-";
        try {
          // Tambahkan timeout agar tidak hang jika metadata gagal diambil
          const metadata = await Promise.race([
            ctx.group(`${id}@g.us`).metadata(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
          ]);
          subject = metadata?.subject || "-";
        } catch {
          subject = "(Gagal ambil nama grup)";
        }
        msg += `${i + 1}. ${subject} (${id}) [${types}]\n`;
      }

      return await ctx.reply(quote(msg));
    } catch (e) {
      return await ctx.reply(quote("Gagal mengambil data grup notifikasi: " + e.message));
    }
  }
};
