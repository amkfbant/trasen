// packages/shared/src/types.ts
export type Side = "L" | "R";

export type GameState = {
  w: number; h: number;
  lY: number; rY: number;
  bX: number; bY: number; vX: number; vY: number;
  sL: number; sR: number;
  tick: number;
  paused: boolean;
};

export type Inputs = {
  Lup: boolean; Ldown: boolean;
  Rup: boolean; Rdown: boolean;
};

// WS messages
export type JoinMsg   = { t: "join"; matchId: string; alias: string };
export type Assigned  = { t: "assigned"; side: Side };
export type InputMsg  = { t: "input"; k: "ArrowUp"|"ArrowDown"|"KeyW"|"KeyS"; d: boolean };
export type SnapMsg   = { t: "snap"; state: GameState };
export type ScoreMsg  = { t: "score"; sL: number; sR: number };
export type WsMsg = JoinMsg | Assigned | InputMsg | SnapMsg | ScoreMsg;
