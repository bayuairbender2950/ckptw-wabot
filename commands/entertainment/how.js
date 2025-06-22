const {
    monospace,
    quote
} = require("@itsreimau/ckptw-mod");

module.exports = {
    name: "how",
    aliases: ["howgay", "howpintar", "howcantik", "howganteng", "howgabut", "howgila", "howlesbi", "howstress", "howbucin", "howjones", "howsadboy"],
    category: "entertainment",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            `${quote(tools.msg.generateCmdExample(ctx.used, "itsreimau"))}\n` +
            quote(tools.msg.generateNotes([`Ketik ${monospace(`${ctx.used.prefix + ctx.used.command} list`)} untuk melihat daftar.`]))
        );

        if (ctx.used.command === "how" || ["l", "list"].includes(input.toLowerCase())) {
            const listText = await tools.list.get("how");
            return await ctx.reply(listText);
        }

        try {
            const selfWords = /\b(gw|gue|gua|ane|wa|beta|abdi|daku|kami|kita|saya|aku\w*|me|i|my|mine|myself|aku|saya|abdi|beta|daku|gua|gue|ane|wa|kami|kita)\b/i;
            let processedInput = input;
            if (selfWords.test(input)) {
                const match = (ctx.sender?.jid || "").match(/\d+/);
                const mention = match ? "@" + match[0] : "@user";
                processedInput = input.replace(selfWords, mention);
            }

            const randomNumber = Math.floor(Math.random() * 100);

            return await ctx.reply(quote(`${processedInput} itu ${randomNumber}% ${(ctx.used.command.replace("how", "")).toLowerCase()}.`));
        } catch (error) {
            return await tools.cmd.handleError(ctx, error);
        }
    }
};