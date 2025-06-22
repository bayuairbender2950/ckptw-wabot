const mime = require("mime-types");
const axios = require("axios");

module.exports = {
    name: "loli",
    category: "entertainment",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        try {
            const imageUrl = "https://i.imgflip.com/4drxpt.jpg";
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data, "binary");

            return await ctx.reply({
                image: buffer,
                mimetype: mime.lookup("jpg")
            });
        } catch (error) {
            return await tools.cmd.handleError(ctx, error, true);
        }
    }
};