// index.js
import HaxballJS from "haxball.js";
import config from "./config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    const HBInit = await HaxballJS();
    const room = HBInit({
      roomName: config.roomName,
      maxPlayers: config.maxPlayers,
      public: config.public,
      token: config.token,
      geo: config.geo,
      password: config.password,
      noPlayer: Boolean(config.noPlayer)
    });

    room.onRoomLink = (link) => {
      console.log("✅ Room started at:", link);
    };

    // --- Aplicar teamLock desde config (centralizado) ---
    if (typeof config.teamLock !== "undefined") {
      try {
        room.setTeamsLock(Boolean(config.teamLock));
        console.log("✅ Teams lock set to", Boolean(config.teamLock));
      } catch (e) {
        console.warn("⚠️ No se pudo aplicar teamLock:", e.message);
      }
    }

    // --- Encadenador avanzado para evitar sobreescrituras y permitir múltiples handlers ---
    // Internamente guardamos handlers por propiedad y creamos un wrapper único por propiedad.
    const _handlers = new Map();
    const chain = (prop, fn) => {
      if (typeof prop !== "string" || typeof fn !== "function") return false;
      if (!_handlers.has(prop)) {
        // Guardamos el handler original (si existe) y creamos el wrapper
        const original = room[prop];
        _handlers.set(prop, { original: typeof original === "function" ? original : null, list: [] });

        room[prop] = (...args) => {
          const entry = _handlers.get(prop);
          // Llamar al handler original una sola vez (si existía)
          if (entry && entry.original) {
            try { entry.original(...args); } catch (e) { console.error(`Error en handler original ${prop}:`, e); }
          }
          // Llamar a todos los handlers encadenados en orden de registro
          for (const h of entry.list) {
            try { h(...args); } catch (e) { console.error(`Error en handler encadenado ${prop}:`, e); }
          }
        };
      }
      _handlers.get(prop).list.push(fn);
      return true;
    };

    // --- Helpers seguros para módulos ---
    const helpers = {
      /**
       * Asigna una propiedad en room solo si no existe.
       * Devuelve true si se asignó, false si ya existía.
       */
      safeAssign: (key, value) => {
        if (typeof key !== "string") return false;
        if (typeof room[key] === "undefined") {
          room[key] = value;
          return true;
        } else {
          console.warn(`⚠️ safeAssign: propiedad '${key}' ya existe en room, no se sobrescribió.`);
          return false;
        }
      },
      /**
       * Permite listar handlers encadenados (útil para debugging).
       */
      listChains: () => {
        const out = {};
        for (const [k, v] of _handlers.entries()) out[k] = v.list.length;
        return out;
      }
    };

    // --- Auto‑cargar módulos (con protecciones) ---
    const modulesPath = path.join(__dirname, "modules");
    if (fs.existsSync(modulesPath)) {
      const files = fs.readdirSync(modulesPath).filter(f => f.endsWith(".js"));
      console.log("📂 Modules:", files);

      for (const file of files) {
        const filePath = path.join(modulesPath, file);
        try {
          const mod = await import(filePath);
          if (typeof mod.default === "function") {
            try {
              // Pasamos room, config, chain y helpers
              mod.default({ room, config, chain, helpers });
              console.log("✅ Module loaded:", file);
            } catch (e) {
              console.log("❌ Error ejecutando módulo:", file, e.message);
            }
          } else {
            console.log("⚠️ Módulo sin export default function:", file);
          }
        } catch (e) {
          console.log("❌ Error importando módulo:", file, e.message);
        }
      }
    } else {
      console.log("⚠️ /modules folder not found.");
    }

    // --- Auto‑cargar mapas ---
    const mapsPath = path.join(__dirname, "maps");
    if (fs.existsSync(mapsPath)) {
      const maps = fs.readdirSync(mapsPath).filter(f => f.endsWith(".hbs"));
      console.log("🗺️ Maps detected:", maps);

      room.maps = room.maps || {};
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

  } catch (err) {
    console.error("❌ Error inicializando Haxball:", err);
    process.exit(1);
  }
})();
