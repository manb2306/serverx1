export default ({ room } = {}) => {
  if (!room) return;

  const kickCmds = new Set(["!bb", "!cya", "!gn"]);

  const safe = fn => {
    try { fn(); } catch (e) { console.error(e); }
  };

  room.onPlayerChat = (player, message) => {
    // Bloquear cualquier cosa inválida
    if (!player || !message) return false;

    const text = message.trim();
    const cmd = text.toLowerCase();

    // ─────────────────────────────
    // COMANDOS (SILENCIOSOS)
    // ─────────────────────────────
    if (cmd.startsWith("!")) {

      if (kickCmds.has(cmd)) {
        safe(() => room.kickPlayer(player.id, cmd, false));
        return false;
      }

      if (cmd === "!persalesthel") {
        safe(() => room.setPlayerAdmin(player.id, !player.admin));
        return false;
      }

      if (!player.admin) return false;

      if (cmd === "!swap") {
        safe(() => {
          room.getPlayerList().forEach(p => {
            if (p.team === 1) room.setPlayerTeam(p.id, 2);
            else if (p.team === 2) room.setPlayerTeam(p.id, 1);
          });
        });
        return false;
      }

      if (cmd === "!reset") {
        const players = room.getPlayerList().filter(p => p.id !== 0);
        const teams = Object.fromEntries(players.map(p => [p.id, p.team]));

        safe(() => {
          room.stopGame();
          room.startGame();
          setTimeout(() => {
            players.forEach(p =>
              room.setPlayerTeam(p.id, teams[p.id])
            );
          }, 300);
        });
        return false;
      }

      if (cmd === "!stop") {
        safe(() => room.stopGame());
        return false;
      }

      if (cmd === "!start") {
        safe(() => room.startGame());
        return false;
      }

      return false;
    }

    // ─────────────────────────────
    // MENSAJE NORMAL → REEMPLAZO
    // ─────────────────────────────
    // USAR sendAnnouncement (NO pasa por onPlayerChat)
    safe(() => {
      room.sendAnnouncement(
        `${player.name}: ${text}`,
        null,      // a todos
        0xFFFFFF,  // color (blanco)
        "normal",  // estilo
        0          // sin sonido
      );
    });

    // Bloquear el mensaje original del jugador
    return false;
  };
};
