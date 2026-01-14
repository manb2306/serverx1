// config.js
export default {
  // --- Room Settings ---
  roomName: "test no entrar plis", // room name
  maxPlayers: 16,              // 4v4 means 8 players max
  public: true,               // visible in the room list
  password: null,             // set a string if you want a private room

  // --- Authentication ---
  token: "thr1.AAAAAGlm3CgZmerv4r2nhw.BBdXey0QpXg", // your Haxball headless token

  // --- Location Settings ---
  geo: {
    lat: 4.44,
    lon: -75.24,
    code: "CO"                // country code (Colombia)
  },

  // --- Optional Enhancements ---
  noPlayer: false,            // allow spectators (true = only host, no players)
  playerName: "BOT",       // default host name
  kickRateLimit: 3,           // prevent spam kicks (seconds)
  teamLock: false             // allow players to switch freely
};
