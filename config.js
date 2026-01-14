// config.js
export default {
  // --- Room Settings ---
  roomName: "test no entrar plis", // room name
  maxPlayers: 16,                  // máximo de jugadores
  public: true,                    // visible en la lista de salas
  password: null,                  // null = sin contraseña

  // --- Authentication ---
  token: "thr1.AAAAAGlm3CgZmerv4r2nhw.BBdXey0QpXg", // tu token de Haxball headless

  // --- Location Settings ---
  geo: {
    lat: 4.44,
    lon: -75.24,
    code: "CO"                      // código de país (Colombia)
  },

  // --- Optional Enhancements ---
  noPlayer: true,                   // true = host invisible, no aparece como BOT
  // playerName eliminado porque no aplica si noPlayer es true
  kickRateLimit: 3,                 // límite de kicks para evitar spam (segundos)
  teamLock: true                    // true = bloquea cambios de equipo libre
};
