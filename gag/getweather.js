const https = require("https");
const { sendGrowagardenNotif } = require("../events/handler");
const { fetchStockLatest } = require("./getstock");

async function fetchWeatherJSON() {
  const stock = await fetchStockLatest();
  const weatherArr = stock.lastSeen?.Weather || [];
  const latest = weatherArr.length ? weatherArr[weatherArr.length - 1] : {};
  return {
    weather: latest,
    updatedAt: stock.timerCalculatedAt
  };
}

function formatWeatherForWhatsapp(weatherObj) {
  const weather = weatherObj.weather || {};
  return [
    "🌤️ *Weather*",
    weather.emoji ? `*Status:* ${weather.emoji} ${weather.name || ""}` : "",
    weather.seen ? `*Last Seen:* ${new Date(weather.seen).toLocaleString()}` : "",
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

if (require.main === module) {
  updateWeather();
}

module.exports = {
  updateWeather,
  fetchWeatherJSON,
  formatWeatherForWhatsapp
};