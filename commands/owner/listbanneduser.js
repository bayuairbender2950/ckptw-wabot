const {
    quote
} = require("@itsreimau/ckptw-mod");

module.exports = {
    name: "listbanneduser",
    aliases: ["listban", "listbanned"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        try {
            const users = (await db.toJSON()).user;
            const bannedUsers = [];

            for (const userId in users) {
                if (users[userId].banned === true) bannedUsers.push(userId);
            }

            let resultText = "";
            let userMentions = [];

            bannedUsers.forEach(userId => {
                resultText += `${quote(`@${userId}`)}\n`;
            });

            bannedUsers.forEach(userId => {
                userMentions.push(`${userId}@s.whatsapp.net`);
            });

            return await ctx.reply({
                text: `${resultText || config.msg.notFound}` +
                    "\n" +
                    config.msg.footer,
                mentions: userMentions
            });
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};