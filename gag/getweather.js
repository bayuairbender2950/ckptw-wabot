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

function getWeatherEmoji(weather) {
  if (!weather || !weather.weather_id) return "";
  const map = {
    "beeswarm": "🐝",
    "frost": "❄️",
    "rain": "🌧️",
    "thunderstorm": "⛈️",
    "disco": "🪩",
    "jandelstorm": "🌪️",
    "blackhole": "🕳️",
    "djjhai": "🎧",
    "nightevent": "🌙",
    "meteorshower": "☄️",
    "sungod": "☀️",
    "jandelfloat": "🪁",
    "chocolaterain": "🍫",
    "bloodmoonevent": "🌑",
    "workingbeeswarm": "🐝",
    "volcano": "🌋",
    "alieninvasion": "👽",
    "spacetravel": "🚀",
    "summerharvest": "🌾",
    "windy": "💨",
    "heatwave": "🔥",
    "tornado": "🌪️",
    "gale": "🌬️"
  };
  return map[weather.weather_id] || "";
}

function formatWeatherForWhatsapp(weatherObj) {
  const weather = weatherObj.weather || {};
  const emoji = getWeatherEmoji(weather);
  // Duration
  let duration = "-";
  if (weather.duration) {
    const min = Math.floor(weather.duration / 60);
    duration = `${min} minute${min !== 1 ? "s" : ""}`;
  }
  // Ends in
  let ends = "-";
  if (weather.end_duration_unix && weather.end_duration_unix > 0) {
    const now = Math.floor(Date.now() / 1000);
    const diff = weather.end_duration_unix - now;
    if (diff > 0) {
      const min = Math.floor(diff / 60);
      const sec = diff % 60;
      ends = `in ${min} minute${min !== 1 ? "s" : ""}${min > 0 && sec > 0 ? ` ${sec} sec` : (min === 0 ? `${sec} sec` : "")}`;
    } else {
      ends = "ended";
    }
  }
  return [
    `${emoji ? emoji + " " : ""}${weather.weather_name}`,
    `Ends: ${ends}`,
    `Duration: ${duration}`
  ].join("\n");
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