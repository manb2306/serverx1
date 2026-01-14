// kickCommands.js
export default ({ room, log }) => {
  room.onPlayerChat = (player, message) => {
    if (!message) return false;

    const cmd = message.trim().toLowerCase();

    // --- Kick commands ---
    if (cmd === "!bb" || cmd === "!cya" || cmd === "!gn") {
      room.kickPlayer(player.id, cmd, false);
      log(`Player ${player.name} was kicked with reason: ${cmd}`);
      return false; // block message from appearing in chat
    }

    return true; // allow other messages
  };
};
