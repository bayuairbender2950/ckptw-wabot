// Impor modul dan dependensi yang diperlukan
require("./config.js");
const pkg = require("./package.json");
const tools = require("./tools/exports.js");
const {
    Consolefy
} = require("@mengkodingan/consolefy");
const CFonts = require("cfonts");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const SimplDB = require("simpl.db");
const { handleWebhook } = require('./tools/webhook.js');
require("./tools/hotreload.js"); 

// Inisialisasi Consolefy untuk logging
const c = new Consolefy({
    tag: pkg.name
});

// Inisialisasi SimplDB untuk Database
const dbFile = path.join(__dirname, "database.json");
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "{}", "utf8");
const db = new SimplDB();

// Tetapkan variabel global
config.bot.version = `v${pkg.version}`;
Object.assign(global, {
    config,
    tools,
    consolefy: c,
    db
});

c.log("Starting..."); // Logging proses awal

// Tampilkan nama proyek
CFonts.say(pkg.name, {
    font: "chrome",
    align: "center",
    gradient: ["red", "magenta"]
});

// Tampilkan deskripsi dan informasi pengembang
CFonts.say(
    `'${pkg.description}'\n` +
    `By ${pkg.author}`, {
        font: "console",
        align: "center",
        gradient: ["red", "magenta"]
    }
);

if (config.system.useServer) {
    const { port } = config.system;
    const { bot } = require("./main.js");

    http.createServer(async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.url.startsWith('/webhook')) {
            const result = await handleWebhook(req, req.url, bot);
            res.writeHead(result.status);
            res.end(JSON.stringify(result));
            return;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', message: `${pkg.name} berjalan di port ${port}` }));
    }).listen(port, () => c.success(`${pkg.name} runs on port ${port}`));
}

require("./main.js"); // Jalankan modul utama