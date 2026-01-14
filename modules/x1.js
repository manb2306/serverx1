export default (ctx = {}) => {
  const { room, chain } = ctx;
  if (!room) return;

  const attach = (prop, fn) => {
    if (typeof chain === "function") {
      chain(prop, fn);
    } else {
      const prev = room[prop];
      room[prop] = (...args) => {
        if (typeof prev === "function") {
          try { prev(...args); } catch (e) { console.error(`Error en handler previo ${prop}:`, e); }
        }
        try { fn(...args); } catch (e) { console.error(`Error en handler ${prop}:`, e); }
      };
    }
  };

  const P = "x0.hbs", D = "x1.hbs";
  const pl = () => room.getPlayerList().filter(p => p.id !== 0),
        ac = () => pl().filter(p => p.team > 0),
        sp = () => pl().filter(p => p.team === 0);

  const prac = id => {
    room.stopGame();
    room.setCustomStadium(room.maps[P]);
    try { room.setScoreLimit(0); } catch (e) {  }
    try { room.setTimeLimit(0); } catch (e) {  }
    pl().forEach(p => room.setPlayerTeam(p.id, p.id === id ? 1 : 0));
    room.startGame();
  };

  const duel = () => {
    room.stopGame();
    room.setCustomStadium(room.maps[D]);
    
    try { room.setScoreLimit(3); } catch (e) {  }
    try { room.setTimeLimit(2); } catch (e) {  }
    room.startGame();
  };

  const norm = () => pl().sort((a, b) => a.id - b.id).forEach((p, i) => room.setPlayerTeam(p.id, i < 2 ? i + 1 : 0));

  const dist = w => {
    let [win, los] = ac().reduce((r, p) => p.team === w ? [p, r[1]] : [r[0], p], [null, null]);
    if (win) room.setPlayerTeam(win.id, 1);
    if (los) room.setPlayerTeam(los.id, 0);
    let n = sp()[0] || los;
    if (n) room.setPlayerTeam(n.id, 2);
    duel();
  };

  attach("onPlayerJoin", p => {
    let l = pl();
    if (l.length === 1) {
      prac(p.id);
    } else if (l.length === 2) {
      norm();
      duel();
    } else {
      room.setPlayerTeam(p.id, 0);
    }
  });

  attach("onPlayerLeave", p => {
    if (!p.team) return;
    let a = ac();
    if (!a.length) return room.stopGame();
    if (a.length === 1) {
      let n = sp()[0];
      if (n) {
        room.setPlayerTeam(a[0].id, 1);
        room.setPlayerTeam(n.id, 2);
        duel();
        return;
      }
      prac(a[0].id);
      return;
    }
    norm();
  });

  attach("onTeamVictory", s => dist(s.red > s.blue ? 1 : 2));
};
