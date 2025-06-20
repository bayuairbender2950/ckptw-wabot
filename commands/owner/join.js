const {
    quote
} = require("@itsreimau/ckptw-mod");

module.exports = {
    name: "join",
    aliases: ["j"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        const url = ctx.args[0] || null;

        if (!url) return await ctx.reply(
            `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n`
        );

        const isUrl = await tools.cmd.isUrl(url);
        if (!isUrl) return await ctx.reply(config.msg.urlInvalid);

        try {
            const urlCode = new URL(url).pathname.split("/").pop();
            await ctx.groups.acceptInvite(urlCode).then(async result => {
                await ctx.sendMessage(result, {
                    text: quote(`👋 Halo! Saya adalah Bot WhatsApp bernama ${config.bot.name}, dimiliki oleh ${config.owner.name}. Saya bisa melakukan banyak perintah, seperti membuat stiker, menggunakan AI untuk pekerjaan tertentu, dan beberapa perintah berguna lainnya. Saya di sini untuk menghibur dan menyenangkan kamu!`)
                });
            });

            return await ctx.reply(quote("✅ Berhasil bergabung dengan grup!"));
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};