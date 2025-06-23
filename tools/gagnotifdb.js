const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "gagnotif.json");

function load() {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

function getAll() {
  return load();
}

function get(groupId) {
  const db = load();
  return db[groupId] || [];
}

function set(groupId, types) {
  const db = load();
  db[groupId] = types;
  save(db);
}

function remove(groupId) {
  const db = load();
  delete db[groupId];
  save(db);
}

module.exports = {
  getAll,
  get,
  set,
  remove
};
