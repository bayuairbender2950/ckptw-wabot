const fs = require("fs");
const path = require("path");

const commandsDir = path.join(__dirname, "..", "commands");

function hotReloadLog(msg) {
    console.log("\x1b[41m\x1b[30m HOTRELOAD \x1b[0m " + msg);
}

fs.watch(commandsDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".js")) {
        hotReloadLog(`Detected change in: ${filename}. Restarting bot...`);
        process.exit(42);
    }
});
