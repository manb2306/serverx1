// admin.js
export default ({ room, register }) => {
  const ADMIN_AUTH = "IZKxYphPgBT5AevloEWWhui-GjgSK7Cp-LCO35aiH8Y";

  register("onPlayerJoin", (player) => {
    if (player.auth === ADMIN_AUTH) {
      room.setPlayerAdmin(player.id, true);
    }
  });
};
