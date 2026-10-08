export const HEADPHONES = "Studio Headphones";
export const outputBase = ["Desk Speakers", "Laptop Speakers"] as const;
export const inputBase = ["Laptop Mic"] as const;

export type Kind = "input" | "output";
export type Pair = { input: string; output: string };

export interface LogEntry {
  id: number;
  at: string;
  text: string;
  tone: "info" | "restore";
}

export interface GuardState {
  callActive: boolean;
  headphones: boolean;
  guard: boolean;
  /** The devices the user chose to keep. */
  selected: Pair;
  /** What the system is currently using. */
  current: Pair;
  log: LogEntry[];
  seq: number;
}

export type Action = { at: string } & (
  | { type: "start" }
  | { type: "end" }
  | { type: "plug" }
  | { type: "unplug" }
  | { type: "toggleGuard" }
  | { type: "select"; kind: Kind; device: string }
  | { type: "clear" }
);

const defaults: Pair = { input: "Laptop Mic", output: "Desk Speakers" };

export const initialState: GuardState = {
  callActive: false,
  headphones: false,
  guard: true,
  selected: defaults,
  current: defaults,
  log: [{ id: 0, at: "09:00:00", text: "CallAudioGuard started in the menu bar", tone: "info" }],
  seq: 1,
};

export const stamp = () => new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

function push(s: GuardState, at: string, text: string, tone: LogEntry["tone"] = "info"): GuardState {
  return { ...s, seq: s.seq + 1, log: [{ id: s.seq, at, text, tone }, ...s.log].slice(0, 8) };
}

/** Rule: while a call is active and Keep is on, put the user's chosen devices back. */
function enforce(s: GuardState, at: string, reason: string): GuardState {
  if (!s.guard || !s.callActive) return s;
  if (s.current.input === s.selected.input && s.current.output === s.selected.output) {
    return push(s, at, `${reason}: devices already correct (${s.selected.output} + ${s.selected.input})`);
  }
  return push({ ...s, current: s.selected }, at, `${reason}: restored ${s.selected.output} for output and ${s.selected.input} for input`, "restore");
}

export function reducer(s: GuardState, a: Action): GuardState {
  switch (a.type) {
    case "start":
      if (s.callActive) return s;
      return enforce(push({ ...s, callActive: true }, a.at, "Call detected: a video call app opened its audio session"), a.at, "Call start");
    case "end":
      if (!s.callActive) return s;
      return push({ ...s, callActive: false }, a.at, "Call ended: guard standing by");
    case "plug": {
      if (s.headphones) return s;
      const next = push({ ...s, headphones: true, current: { input: HEADPHONES, output: HEADPHONES } }, a.at, `${HEADPHONES} connected: macOS switched input and output to them`);
      if (next.guard && next.callActive) return enforce(next, a.at, "Headphones plugged in during a call");
      return next.guard ? push(next, a.at, "No active call: left the system's choice alone") : push(next, a.at, "Keep is off: nothing restored");
    }
    case "unplug": {
      if (!s.headphones) return s;
      const selected = {
        input: s.selected.input === HEADPHONES ? defaults.input : s.selected.input,
        output: s.selected.output === HEADPHONES ? defaults.output : s.selected.output,
      };
      const current = {
        input: s.current.input === HEADPHONES ? selected.input : s.current.input,
        output: s.current.output === HEADPHONES ? selected.output : s.current.output,
      };
      return push({ ...s, headphones: false, selected, current }, a.at, `${HEADPHONES} disconnected: back to ${current.output}`);
    }
    case "toggleGuard":
      return push({ ...s, guard: !s.guard }, a.at, s.guard ? "Keep on selected device: off" : "Keep on selected device: on");
    case "select": {
      const selected = { ...s.selected, [a.kind]: a.device };
      const current = { ...s.current, [a.kind]: a.device };
      return push({ ...s, selected, current }, a.at, `Selected ${a.device} for ${a.kind}`);
    }
    case "clear":
      return { ...s, log: [] };
  }
}
