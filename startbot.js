const { fork } = require("child_process");
const path = require("path");

function hotReloadLog(msg) {
    console.log("\x1b[41m\x1b[30m HOTRELOAD \x1b[0m " + msg);
}

function start() {
    const child = fork(path.join(__dirname, "index.js"), [], { stdio: "inherit" });
    child.on("exit", (code) => {
        if (code === 42) {
            hotReloadLog("Restarting bot...");
            start();
        } else {
            process.exit(code);
        }
    });
}

start();
