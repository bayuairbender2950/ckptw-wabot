const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");

let lastNotifTimestamp = 0;

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
    // Ambil notifikasi terbaru yang belum pernah dikirim
    const newNotifs = notifArr.filter(n => n.timestamp > lastNotifTimestamp);
    for (const notif of newNotifs) {
      const msg = `📢 *Jandel Announcement*\n\n${notif.message}\n\n🕒 ${new Date(notif.timestamp * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;
      await sendGrowagardenNotif(msg, "jandel");
      if (notif.timestamp > lastNotifTimestamp) lastNotifTimestamp = notif.timestamp;
    }
  } catch (e) {
    console.error("pollJandelNotif error:", e);
  }
}

module.exports = {
  pollJandelNotif
};
