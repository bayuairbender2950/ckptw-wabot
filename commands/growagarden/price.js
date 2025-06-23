const { quote } = require("@itsreimau/ckptw-mod");
const axios = require("axios");

function emojiItem(name) {
  if (!name) return "🌱";
  const lower = name.toLowerCase();
  if (lower.includes("watermelon")) return "🍉";
  if (lower.includes("strawberry")) return "🍓";
  if (lower.includes("green apple")) return "📦";
  if (lower.includes("carrot")) return "🥕";
  if (lower.includes("tomato")) return "🍅";
  if (lower.includes("blueberry")) return "🫐";
  if (lower.includes("pineapple")) return "🍍";
  if (lower.includes("apple")) return "🍎";
  if (lower.includes("cleaning spray")) return "🧽";
  if (lower.includes("trowel")) return "🔧";
  if (lower.includes("watering can")) return "🚿";
  if (lower.includes("recall wrench")) return "🔧";
  if (lower.includes("favorite tool")) return "⭐";
  if (lower.includes("harvest tool")) return "🛠️";
  if (lower.includes("cactus")) return "🌵";
  if (lower.includes("honey")) return "🍯";
  if (lower.includes("lavender")) return "💜";
  if (lower.includes("flower")) return "🌸";
  if (lower.includes("bee")) return "🐝";
  if (lower.includes("sprinkler")) return "💧";
  if (lower.includes("comb")) return "🍯";
  if (lower.includes("chair")) return "🪑";
  if (lower.includes("torch")) return "🔥";
  if (lower.includes("crate")) return "📦";
  return "🌱";
}

function formatItemInfo(item) {
  return [
    `${emojiItem(item.display_name)} *${item.display_name}*`,
    item.price && item.price !== "0" ? `💰 Harga: ${item.price} ${item.currency || ""}` : "",
    item.rarity ? `⭐ Rarity: ${item.rarity}` : "",
    item.description ? `📝 ${item.description}` : "",
    item.icon ? `🖼️ [Icon](${item.icon})` : "",
    item.duration && item.duration !== "0" ? `⏳ Duration: ${item.duration}s` : "",
    item.last_seen && item.last_seen !== "0" ? `🕒 Last Seen: ${new Date(Number(item.last_seen) * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}` : ""
  ].filter(Boolean).join("\n");
}

function formatSeedList(items) {
  // Tampilkan harga semua seed dalam satu list seperti contoh user
  return [
    "Seeds:",
    ...items.map(i =>
      `${emojiItem(i.display_name)} ${i.display_name} x${i.price && i.price !== "0" ? i.price : "-"}`
    )
  ].join("\n");
}

module.exports = {
  name: "price",
  aliases: ["harga", "cekprice"],
  category: "growagarden",
  code: async (ctx) => {
    // Parsing argumen: .price all 1, .price seed, .price gear, .price <nama> <page>
    const args = ctx.args.map(a => a.toLowerCase());
    let input = args[0] || "";
    let page = 1;
    if (args.length > 1 && !isNaN(Number(args[args.length - 1]))) {
      page = Math.max(1, Number(args.pop()));
      input = args.join(" ");
    }
    input = input.trim();

    if (!input) {
      return await ctx.reply(quote(
        "Ketik nama item, contoh:\n" +
        ".price seed\n.price gear\n.price carrot\n.price honey comb\n.price rare\n.price currency:honey\n.price all 1"
      ));
    }

    try {
      const url = "https://api.joshlei.com/v2/growagarden/info";
      const res = await axios.get(url);
      const data = Array.isArray(res.data) ? res.data : [];

      let items = [];
      if (["seed", "seeds"].includes(input)) {
        // Ambil semua item yang mengandung "seed" di display_name, urutkan abjad
        items = data.filter(i =>
          (i.display_name || "").toLowerCase().includes("seed")
        ).sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
        if (!items.length) return await ctx.reply(quote("Tidak ada data seed."));
        return await ctx.reply(formatSeedList(items));
      } else if (["gear", "gears", "tool", "tools"].includes(input)) {
        items = data.filter(i =>
          (i.display_name || "").toLowerCase().includes("tool") ||
          (i.display_name || "").toLowerCase().includes("gear")
        );
      } else if (input.startsWith("rarity:")) {
        const rarity = input.split(":")[1].trim();
        items = data.filter(i => (i.rarity || "").toLowerCase() === rarity);
      } else if (input.startsWith("currency:")) {
        const currency = input.split(":")[1].trim();
        items = data.filter(i => (i.currency || "").toLowerCase() === currency);
      } else if (input === "all") {
        items = data;
      } else {
        // Cari berdasarkan nama item
        items = data.filter(i =>
          (i.display_name || "").toLowerCase().includes(input)
        );
      }

      if (!items.length) {
        return await ctx.reply(quote("Item tidak ditemukan."));
      }

      // Paging
      const perPage = 20;
      const totalPage = Math.ceil(items.length / perPage);
      if (page > totalPage) page = totalPage;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const pageItems = items.slice(start, end);

      const msg = [
        `Hasil pencarian (${items.length} item) - Page ${page}/${totalPage}`,
        "",
        ...pageItems.map(formatItemInfo)
      ].join("\n\n");

      return await ctx.reply(msg.trim());
    } catch (e) {
      return await ctx.reply(quote("Gagal mengambil data harga: " + e.message));
    }
  }
};
