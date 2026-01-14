// controlCommands.js
export default ({ room }) => {
  room.onPlayerChat = (player, message) => {
    if (!message) return false;

    const cmd = message.trim().toLowerCase();

    switch (cmd) {
      case "!swap":
        if (!player.admin) return false;
        room.getPlayerList().forEach(p => {
          if (p.team === 1) {
            room.setPlayerTeam(p.id, 2);
          } else if (p.team === 2) {
            room.setPlayerTeam(p.id, 1);
          }
        });
        return false;

      case "!rr":
        if (!player.admin) return false;
        const players = room.getPlayerList().filter(p => p.id !== 0);
        const teams = {};
        players.forEach(p => { teams[p.id] = p.team; });
        room.stopGame();
        room.startGame();
        setTimeout(() => {
          players.forEach(p => room.setPlayerTeam(p.id, teams[p.id]));
        }, 200);
        return false;

      case "!stop":
        if (!player.admin) return false;
        room.stopGame();
        return false;

      case "!start":
        if (!player.admin) return false;
        room.startGame();
        return false;

      default:
        return true; // allow other messages
    }
  };
};
