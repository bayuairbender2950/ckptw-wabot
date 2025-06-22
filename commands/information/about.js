const {
    quote
} = require("@itsreimau/ckptw-mod");
const moment = require("moment-timezone");
module.exports = {
    name: "about",
    aliases: ["bot", "infobot"],
    category: "information",
    code: async (ctx) => {
        try {
            const botDb = await db.get("bot") || {};

            return await ctx.reply({
                text: `${quote(`👋 Halo! Saya adalah bot WhatsApp bernama ${config.bot.name}, dimiliki oleh ${config.owner.name}. Saya bisa melakukan banyak perintah, seperti membuat stiker, menggunakan AI untuk pekerjaan tertentu, dan beberapa perintah berguna lainnya. Saya di sini untuk menghibur dan menyenangkan kamu!`)}\n` + // Dapat diubah sesuai keinginan
                    `${quote("─────")}\n` +
                    `${quote(`Nama Bot: ${config.bot.name}`)}\n` +
                    `${quote(`Versi: ${config.bot.version}`)}\n` +
                    `${quote(`Owner: ${config.owner.name}`)}\n` +
                    `${quote(`Mode: ${tools.msg.ucwords(botDb?.mode || "public")}`)}\n` +
                    `${quote(`Bot Uptime: ${config.bot.uptime}`)}\n` +
                    `${quote(`Database: ${config.bot.dbSize} (MongoDB)`)}\n` +
                    `${quote("@abiem/bubuhan-baik - Fork of @itsreimau/ckptw-mod")}\n` +
                    `${quote(`Last Restart: ${moment.tz(config.system.timeZone).format("dddd, DD MMMM YYYY HH:mm:ss")}`)}\n` +
                    "\n" +
                    config.msg.footer,
                contextInfo: {
                    externalAdReply: {
                        title: config.bot.name,
                        body: config.bot.version,
                        mediaType: 1,
                        thumbnailUrl: config.bot.thumbnail,
                        renderLargerThumbnail: true
                    }
                }
            });
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};