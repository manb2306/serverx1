// index.js
import HaxballJS from "haxball.js";
import config from "./config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

HaxballJS().then((HBInit) => {
  const room = HBInit({
    roomName: config.roomName,
    maxPlayers: config.maxPlayers,
    public: config.public,
    token: config.token,
    geo: config.geo,
    password: config.password
  });

  room.onRoomLink = (link) => {
    console.log("✅ Room started at:", link);
  };

  // --- Auto-load modules from /modules ---
  const modulesPath = path.join(__dirname, "modules");
  if (fs.existsSync(modulesPath)) {
    const modules = fs.readdirSync(modulesPath).filter(file => file.endsWith(".js"));
    console.log("📂 Modules detected:", modules);

    modules.forEach(async (file) => {
      const filePath = path.join(modulesPath, file);
      try {
        const mod = await import(filePath);
        if (typeof mod.default === "function") {
          const sandbox = {
            room,
            name: file,
            log: (...args) => console.log(`[${file}]`, ...args)
          };
          mod.default(sandbox);
          console.log("✅ Module loaded:", file);
        } else {
          console.log("❌ Invalid module:", file);
        }
      } catch (e) {
        console.log("❌ Error loading module:", file, e.message);
      }
    });
  } else {
    console.log("⚠️ /modules folder not found.");
  }

  // --- Auto-load maps from /maps ---
  const mapsPath = path.join(__dirname, "maps");
  if (fs.existsSync(mapsPath)) {
    const maps = fs.readdirSync(mapsPath).filter(file => file.endsWith(".hbs"));
    console.log("🗺️ Maps detected:", maps);

    room.maps = {};
    maps.forEach(file => {
      const filePath = path.join(mapsPath, file);
      try {
        const mapData = fs.readFileSync(filePath, "utf8");
        room.maps[file] = mapData;
        console.log("✅ Map loaded:", file);
      } catch (e) {
        console.log("❌ Error loading map:", file, e.message);
      }
    });
  } else {
    console.log("⚠️ /maps folder not found.");
  }
});
