const {
    bold,
    italic,
    monospace,
    quote
} = require("@itsreimau/ckptw-mod");
const mime = require("mime-types");
const moment = require("moment-timezone");

module.exports = {
    name: "menu",
    aliases: ["allmenu", "help", "list", "listmenu"],
    category: "main",
    code: async (ctx) => {
        try {
            const {
                cmd
            } = ctx.bot;
            const tag = {
                "ai-chat": "AI (Chat)",
                "ai-image": "AI (Image)",
                "ai-misc": "AI (Miscellaneous)",
                "converter": "Converter",
                "downloader": "Downloader",
                "entertainment": "Entertainment",
                "game": "Game",
                "group": "Group",
                "maker": "Maker",
                "profile": "Profile",
                "search": "Search",
                "tool": "Tool",
                "owner": "Owner",
                "information": "Information",
                "misc": "Miscellaneous"
            };

            let text = `Hai @${ctx.getId(ctx.sender.jid)}, berikut adalah daftar perintah yang tersedia!\n` +
                "\n" +
                `${quote(`Tanggal: ${moment.tz(config.system.timeZone).locale("id").format("dddd, DD MMMM YYYY")}`)}\n` +
                `${quote(`Waktu: ${moment.tz(config.system.timeZone).format("HH.mm.ss")}`)}\n` +
                "\n" +
                `${quote(`Bot Uptime: ${config.bot.uptime}`)}\n` +
                `${quote(`Database: ${config.bot.dbSize} (MongoDB)`)}\n` +
                `${quote("@abiem/bubuhan-baik - Fork of @itsreimau/ckptw-mod")}\n` +
                `${quote(`Last Restart: ${moment.tz(config.system.timeZone).format("dddd, DD MMMM YYYY HH:mm:ss")}`)}\n` +
                "\n" +
                `${config.msg.readmore}\n`;

            for (const category of Object.keys(tag)) {
                const categoryCmds = Array.from(cmd.values())
                    .filter(cmd => cmd.category === category)
                    .map(cmd => ({
                        name: cmd.name,
                        aliases: cmd.aliases,
                        permissions: cmd.permissions || {}
                    }));

                if (categoryCmds.length > 0) {
                    text += `◆ ${bold(tag[category])}\n`;

                    categoryCmds.forEach(cmd => {
                        let permissionsText = "";
                        if (cmd.permissions.coin) permissionsText += "- ⓒ Coin";
                        if (cmd.permissions.group) permissionsText += " - Ⓖ Group only";
                        if (cmd.permissions.owner) permissionsText += " - Ⓞ Owner only";
                        if (cmd.permissions.premium) permissionsText += " - Ⓟ Premium only";
                        if (cmd.permissions.private) permissionsText += " - ⓟ Private";

                        text += quote(monospace(`${ctx.used.prefix + cmd.name} ${permissionsText}`));
                        text += "\n";
                    });

                    text += "\n";
                }
            }

            text += config.msg.footer;

            await ctx.sendMessage(ctx.id, {
                text,
                contextInfo: {
                    mentionedJid: [ctx.sender.jid],
                    isForwarded: false,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.bot.newsletterJid,
                        newsletterName: config.bot.name
                    },
                    externalAdReply: {
                        title: config.bot.name,
                        body: config.bot.version,
                        mediaType: 1,
                        thumbnailUrl: config.bot.thumbnail,
                        renderLargerThumbnail: true
                    }
                }
            }, {
                quoted: tools.cmd.fakeMetaAiQuotedText(config.msg.note)
            });
            return await ctx.sendMessage(ctx.id, {
                audio: {
                    url: "https://archive.org/download/TripleBaka_944/TripleBaka.mp3" // Dapat diubah sesuai keinginan (Ada yg request, tambah lagu di menu nya)
                },
                mimetype: mime.lookup("mp3"),
                ptt: true,
                contextInfo: {
                    mentionedJid: [ctx.sender.jid],
                    externalAdReply: {
                        title: config.bot.name,
                        body: config.bot.version,
                        mediaType: 1,
                        thumbnailUrl: "https://i.ytimg.com/vi/HhN4wdpbPrg/hqdefault.jpg",
                        renderLargerThumbnail: true
                    }
                }
            });
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};