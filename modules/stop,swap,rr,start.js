export default ({ room, register }) => {
  register("onPlayerChat", (player, msg) => {
    if (!msg || !player.admin) return false;
    const cmd = msg.trim().toLowerCase();

    if (cmd === "!swap") {
      room.getPlayerList().forEach(p =>
        room.setPlayerTeam(p.id, p.team === 1 ? 2 : p.team === 2 ? 1 : p.team)
      );
      return false;
    }

    if (cmd === "!rr") {
      const players = room.getPlayerList().filter(p => p.id !== 0);
      const teams = Object.fromEntries(players.map(p => [p.id, p.team]));
      room.stopGame();
      room.startGame();
      setTimeout(() => players.forEach(p => room.setPlayerTeam(p.id, teams[p.id])), 300);
      return false;
    }

    if (cmd === "!stop") {
      room.stopGame();
      return false;
    }

    if (cmd === "!start") {
      room.startGame();
      return false;
    }

    return true; // otros mensajes sí aparecen
  });
};
