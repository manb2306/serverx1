export default ({ room, register }) => {
  room.setTeamsLock(true);

  const P = "x0.hbs", D = "x1.hbs";
  const pl = () => room.getPlayerList().filter(p => p.id !== 0),
        ac = () => pl().filter(p => p.team > 0),
        sp = () => pl().filter(p => p.team === 0);

  const prac = id => {
    room.stopGame();
    room.setCustomStadium(room.maps[P]);
    pl().forEach(p => room.setPlayerTeam(p.id, p.id === id ? 1 : 0));
    room.startGame();
  };

  const duel = () => {
    room.stopGame();
    room.setCustomStadium(room.maps[D]);
    room.startGame();
  };

  const norm = () =>
    pl().sort((a, b) => a.id - b.id)
      .forEach((p, i) => room.setPlayerTeam(p.id, i < 2 ? i + 1 : 0));

  const dist = w => {
    let [win, los] = ac().reduce(
      (r, p) => p.team === w ? [p, r[1]] : [r[0], p],
      [null, null]
    );
    if (win) room.setPlayerTeam(win.id, 1);
    if (los) room.setPlayerTeam(los.id, 0);
    let n = sp()[0] || los;
    if (n) room.setPlayerTeam(n.id, 2);
    duel();
  };

  // Handlers registrados en dispatcher
  register("onPlayerJoin", p => {
    let l = pl();
    if (l.length === 1) prac(p.id);
    else if (l.length === 2) { norm(); duel(); }
    else room.setPlayerTeam(p.id, 0);
  });

  register("onPlayerLeave", p => {
    if (!p.team) return;
    let a = ac();
    if (!a.length) return room.stopGame();
    if (a.length === 1) {
      let n = sp()[0];
      return n
        ? (room.setPlayerTeam(a[0].id, 1), room.setPlayerTeam(n.id, 2), duel())
        : prac(a[0].id);
    }
    norm();
  });

  register("onTeamVictory", s => dist(s.red > s.blue ? 1 : 2));
};
