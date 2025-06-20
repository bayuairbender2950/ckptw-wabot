const {
    quote
} = require("@itsreimau/ckptw-mod");

module.exports = {
    name: "uptime",
    aliases: ["runtime"],
    category: "information",
    code: async (ctx) => {
        try {
            const startTime = config.bot.readyAt;
            const uptimeBot = Date.now() - startTime;
            const uptimeOS = require('os').uptime() * 1000;

            return await ctx.reply(
                `${quote(`Bot Uptime: ${tools.msg.convertMsToDuration(uptimeBot)}`)}\n` +
                `${quote(`System Uptime: ${tools.msg.convertMsToDuration(uptimeOS)}`)}\n` +
                `${quote(`Last Restart: ${config.bot.uptime}`)}\n` +
                "\n" +
                config.msg.footer
            );
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};