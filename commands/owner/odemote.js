const {
    quote
} = require("@itsreimau/ckptw-mod");

module.exports = {
    name: "odemote",
    category: "owner",
    permissions: {
        botAdmin: true,
        group: true,
        owner: true
    },
    code: async (ctx) => {
        const accountJid = ctx.quoted.senderJid || ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null;

        if (!accountJid) return await ctx.reply({
            text: `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n` +
                `${quote(tools.msg.generateCmdExample(ctx.used, `@${ctx.getId(ctx.sender.jid)}`))}\n` +
                quote(tools.msg.generateNotes(["Balas atau kutip pesan untuk menjadikan pengirim sebagai akun target."])),
            mentions: [ctx.sender.jid]
        });

        if (!await ctx.group().isAdmin(accountJid)) return await ctx.reply(quote("❎ Dia adalah anggota!"));

        try {
            await ctx.group().demote([accountJid]);

            return await ctx.reply(quote("✅ Berhasil diturunkan dari admin menjadi anggota!"));
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};