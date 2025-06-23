const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");
const fs = require("fs");
const path = require("path");

const LAST_PATH = path.join(__dirname, "../tools/lastjandelmsg.json");
let lastNotifTimestamp = 0;

// Saat load, baca last timestamp dari file agar tidak spam saat restart
(function initLastTimestamp() {
  try {
    if (fs.existsSync(LAST_PATH)) {
      const last = JSON.parse(fs.readFileSync(LAST_PATH, "utf8"));
      if (last && last.timestamp) lastNotifTimestamp = last.timestamp;
    }
  } catch {}
})();

async function fetchJandelNotif() {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: "api.joshlei.com",
      path: "/v2/growagarden/stock",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0",
        accept: "application/json",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          if (!data.trim().startsWith("{")) {
            return reject(new Error("GAG API error: " + data.trim().slice(0, 100)));
          }
          const json = JSON.parse(data);
          resolve(json.notification || []);
        } catch (e) {
          reject(new Error("Failed to parse JSON: " + e.message + " | Raw: " + data.trim().slice(0, 100)));
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

async function pollJandelNotif() {
  try {
    const notifArr = await fetchJandelNotif();
    if (!Array.isArray(notifArr) || notifArr.length === 0) return;
    const now = Math.floor(Date.now() / 1000);
    // Hanya kirim notifikasi baru yang belum pernah dikirim dan tidak lebih dari 1 jam yang lalu
    const newNotifs = notifArr.filter(n =>
      n.timestamp > lastNotifTimestamp && (now - n.timestamp) <= 3600
    );
    for (const notif of newNotifs) {
      const msg = `📢 *Jandel Announcement*\n\n${notif.message}\n\n🕒 ${new Date(notif.timestamp * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;
      await sendGrowagardenNotif(msg, "jandel");
      if (notif.timestamp > lastNotifTimestamp) lastNotifTimestamp = notif.timestamp;
    }
    // Simpan pesan terakhir untuk command .lastjandelmessage
    if (notifArr.length > 0) {
      const last = notifArr.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
      saveLastJandelMessage(last);
    }
    // Simpan lastNotifTimestamp ke file agar persist saat restart
    saveLastTimestamp(lastNotifTimestamp);
  } catch (e) {
    console.error("pollJandelNotif error:", e);
  }
}

function saveLastJandelMessage(msg) {
  try {
    fs.writeFileSync(LAST_PATH, JSON.stringify(msg, null, 2), "utf8");
  } catch {}
}
function getLastJandelMessage() {
  try {
    if (!fs.existsSync(LAST_PATH)) return null;
    return JSON.parse(fs.readFileSync(LAST_PATH, "utf8"));
  } catch {
    return null;
  }
}
function saveLastTimestamp(ts) {
  // Simpan timestamp saja agar tidak spam saat restart
  try {
    let last = {};
    if (fs.existsSync(LAST_PATH)) {
      last = JSON.parse(fs.readFileSync(LAST_PATH, "utf8"));
    }
    last.timestamp = ts;
    fs.writeFileSync(LAST_PATH, JSON.stringify(last, null, 2), "utf8");
  } catch {}
}

module.exports = {
  pollJandelNotif,
  getLastJandelMessage
};
