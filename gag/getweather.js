const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");

// Fetch dari API weather JoshLei
async function fetchWeatherJSON() {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: "api.joshlei.com",
      path: "/v2/growagarden/weather",
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
            return reject(new Error("GAG Weather API error: " + data.trim().slice(0, 100)));
          }
          const json = JSON.parse(data);
          let active = {};
          if (Array.isArray(json.weather)) {
            active = json.weather.find(w => w.active === true) || {};
          }
          resolve({
            weather: active,
            updatedAt: Date.now()
          });
        } catch (e) {
          reject(new Error("Failed to parse JSON: " + e.message + " | Raw: " + data.trim().slice(0, 100)));
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

function formatWeatherForWhatsapp(weatherObj) {
  const weather = weatherObj.weather || {};
  return [
    "🌤️ *Weather*",
    weather.icon
      ? `*Status:* ${weather.weather_name || weather.weather_id || ""}`
      : "Tidak ada weather yang aktif",
    weatherObj.updatedAt ? `*Updated:* ${new Date(weatherObj.updatedAt).toLocaleString()}` : ""
  ].filter(Boolean).join("\n");
}

async function updateWeather() {
  try {
    const weather = await fetchWeatherJSON();
    const notifMsg = formatWeatherForWhatsapp(weather);
    await sendGrowagardenNotif(notifMsg);
  } catch (err) {
    console.error("Failed to fetch weather data:", err.message);
  }
}

module.exports = {
  updateWeather,
  fetchWeatherJSON,
  formatWeatherForWhatsapp
};