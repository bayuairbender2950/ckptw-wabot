const {
    quote
} = require("@itsreimau/ckptw-mod");
const axios = require("axios");

module.exports = {
    name: "animeinfo",
    aliases: ["anime"],
    category: "tool",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            quote(tools.msg.generateCmdExample(ctx.used, "evangelion"))
        );

        try {
            const apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(input)}`;
            const result = (await axios.get(apiUrl, { timeout: 10000 })).data.data[0];
            if (!result) return await ctx.reply("Anime tidak ditemukan.");
        
            return await ctx.reply(
                `${quote(`Judul: ${result.title}`)}\n` +
                `${quote(`Judul (Inggris): ${result.title_english}`)}\n` +
                `${quote(`Judul (Jepang): ${result.title_japanese}`)}\n` +
                `${quote(`Tipe: ${result.type}`)}\n` +
                `${quote(`Episode: ${result.episodes}`)}\n` +
                `${quote(`Durasi: ${result.duration}`)}\n` +
                `${quote(`URL: ${result.url}`)}\n` +
                `${quote("─────")}\n` +
                `${await tools.cmd.translate(result.synopsis, "id")}\n` +
                "\n" +
                config.msg.footer
            );
        } catch (error) {
            return await tools.cmd.handleError(ctx, error, true);
        }
    }
};