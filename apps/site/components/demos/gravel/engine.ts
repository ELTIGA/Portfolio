/**
 * Pure simulation of operator-mediated tool execution. Every proposed call is checked against the
 * scope, then held for a human decision (unless a standing grant exists), and everything is audited.
 * Hosts are invented *.example.test names and nothing here touches a network or a filesystem.
 */

export type Tool = "http_get" | "read_file" | "write_file";

export interface Proposal {
  tool: Tool;
  arg: string;
  note: string;
  result: string;
}

export interface Scope {
  hosts: string[];
  paths: string[];
}

export type CallStatus = "blocked" | "awaiting" | "executed" | "denied" | "rejected";

export interface Call {
  id: number;
  tool: Tool;
  arg: string;
  note: string;
  status: CallStatus;
  /** Rule that decided the outcome. */
  rule: string;
  reason: string;
  via?: string;
  result?: string;
}

export type Decision = "SESSION" | "SCOPE" | "BLOCK" | "HOLD" | "APPROVE" | "AUTO" | "DENY" | "EXEC" | "REJECT" | "ESTOP" | "RESUME" | "GRANT";

export interface AuditEntry {
  seq: number;
  time: string;
  decision: Decision;
  actor: string;
  rule: string;
  detail: string;
  hash: string;
}

export interface Grant {
  id: string;
  key: string;
  label: string;
}

export interface State {
  scope: Scope;
  grants: Grant[];
  calls: Call[];
  audit: AuditEntry[];
  cursor: number;
  nextCallId: number;
  nextGrant: number;
  pendingId: number | null;
  pendingLeft: number;
  agentRunning: boolean;
  estop: boolean;
  clock: number;
  nextAt: number;
  scopeMsg: { tone: "ok" | "err"; text: string } | null;
}

export const APPROVAL_SECONDS = 40;
const PROPOSE_EVERY = 2.2;
const T0 = 14 * 3600 + 2 * 60 + 11;

/** Never allowed into scope, no matter what the operator types. */
const PROTECTED = ["/etc", "/root", "/proc", "/var/run/secrets"];

export const SCRIPT: Proposal[] = [
  { tool: "http_get", arg: "https://staging.example.test/health", note: "Check service health before touching config", result: '200 OK {"status":"ok"} 38 ms' },
  { tool: "read_file", arg: "./config/app.toml", note: "Read the current staging config", result: "412 bytes read" },
  { tool: "http_get", arg: "https://prod.example.test/admin", note: "Compare against the production admin page", result: "200 OK 2.1 KB 61 ms" },
  { tool: "write_file", arg: "./notes.md", note: "Append findings to the working notes", result: "188 bytes written" },
  { tool: "read_file", arg: "/etc/shadow", note: "Look at local account configuration", result: "n/a" },
  { tool: "http_get", arg: "https://docs.example.test/runbook", note: "Fetch the runbook for the next step", result: "200 OK 14.2 KB 47 ms" },
  { tool: "read_file", arg: "./workspace/../secrets/token.txt", note: "Open a token file next to the workspace", result: "64 bytes read" },
  { tool: "http_get", arg: "https://metrics.example.test/export", note: "Pull a metrics export", result: "200 OK 880 KB 140 ms" },
];

export const DEFAULT_SCOPE: Scope = {
  hosts: ["staging.example.test", "docs.example.test"],
  paths: ["./config/", "./workspace/", "./notes.md"],
};

// ---------- helpers ----------

export function fmtClock(clock: number): string {
  const t = Math.floor(T0 + clock);
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor(t / 60) % 60;
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function fnv(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Collapse `.` and `..` segments. Relative results keep a leading `./`. */
export function normalizePath(p: string): string {
  const abs = p.startsWith("/");
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      if (out.length && out[out.length - 1] !== "..") out.pop();
      else out.push("..");
    } else out.push(seg);
  }
  const body = out.join("/");
  return abs ? `/${body}` : body.startsWith("..") ? body : `./${body}`;
}

function pathAllowed(path: string, paths: string[]): boolean {
  return paths.some((p) => (p.endsWith("/") ? path.startsWith(p) || `${path}/` === p : path === normalizePath(p)));
}

export function isProtectedPath(p: string): boolean {
  const n = normalizePath(p.startsWith("~/") ? `/home/user/${p.slice(2)}` : p);
  return PROTECTED.some((x) => n === x || n.startsWith(`${x}/`)) || n.includes("/.ssh");
}

interface Verdict {
  ok: boolean;
  rule: string;
  reason: string;
}

export function validate(scope: Scope, tool: Tool, arg: string): Verdict {
  if (tool === "http_get") {
    let u: URL;
    try {
      u = new URL(arg);
    } catch {
      return { ok: false, rule: "scope.url_parse", reason: "malformed URL" };
    }
    if (u.protocol !== "https:") return { ok: false, rule: "scope.scheme", reason: "only https is allowed" };
    if (!scope.hosts.includes(u.hostname)) return { ok: false, rule: "scope.host_allowlist", reason: `host ${u.hostname} is not in the allowlist` };
    return { ok: true, rule: "scope.host_allowlist", reason: `host ${u.hostname} is in the allowlist` };
  }
  const resolved = normalizePath(arg);
  if (isProtectedPath(arg) || isProtectedPath(resolved)) {
    return { ok: false, rule: "scope.protected_path", reason: `${resolved} is a protected system path (cannot be scoped)` };
  }
  if (!pathAllowed(resolved, scope.paths)) {
    return {
      ok: false,
      rule: "scope.path_allowlist",
      reason: arg.includes("..") ? `resolves to ${resolved}, outside allowed roots` : `${resolved} is outside allowed roots`,
    };
  }
  return { ok: true, rule: "scope.path_allowlist", reason: `${resolved} is inside an allowed root` };
}

/** Grants are keyed by tool and the narrowest scope entry that covered the call. */
export function grantKey(scope: Scope, tool: Tool, arg: string): string {
  if (tool === "http_get") return `${tool}@${new URL(arg).hostname}`;
  const resolved = normalizePath(arg);
  const root = scope.paths.find((p) => (p.endsWith("/") ? resolved.startsWith(p) : resolved === normalizePath(p))) ?? resolved;
  return `${tool}@${root}`;
}

function audit(s: State, decision: Decision, actor: string, rule: string, detail: string): State {
  const prev = s.audit[s.audit.length - 1];
  const time = fmtClock(s.clock);
  const seq = (prev?.seq ?? 0) + 1;
  const hash = fnv(`${prev?.hash ?? "genesis"}|${seq}|${time}|${decision}|${actor}|${rule}|${detail}`);
  return { ...s, audit: [...s.audit, { seq, time, decision, actor, rule, detail, hash }] };
}

function setCall(s: State, id: number, patch: Partial<Call>): State {
  return { ...s, calls: s.calls.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
}

export function initialState(): State {
  let s: State = {
    scope: { hosts: [...DEFAULT_SCOPE.hosts], paths: [...DEFAULT_SCOPE.paths] },
    grants: [],
    calls: [],
    audit: [],
    cursor: 0,
    nextCallId: 1,
    nextGrant: 1,
    pendingId: null,
    pendingLeft: 0,
    agentRunning: true,
    estop: false,
    clock: 0,
    nextAt: 1.2,
    scopeMsg: null,
  };
  s = audit(s, "SESSION", "gravel-core", "session.start", "session s-7f3a opened (gravel-tui --resume s-7f3a)");
  s = audit(s, "SCOPE", "gravel-security", "scope.load", `loaded ${s.scope.hosts.length} hosts, ${s.scope.paths.length} paths; write_file always needs a human`);
  return s;
}

// ---------- actions ----------

export type Action =
  | { type: "tick"; dt: number }
  | { type: "step" }
  | { type: "toggleAgent" }
  | { type: "approve"; always?: boolean }
  | { type: "deny" }
  | { type: "estop" }
  | { type: "resume" }
  | { type: "addHost"; value: string }
  | { type: "addPath"; value: string }
  | { type: "removeHost"; value: string }
  | { type: "removePath"; value: string }
  | { type: "revokeGrant"; id: string }
  | { type: "reset" };

function execute(s: State, id: number, rule: string, how: string): State {
  const call = s.calls.find((c) => c.id === id);
  if (!call) return s;
  let n = setCall(s, id, { status: "executed", via: how, rule });
  n = audit(n, "EXEC", "gravel-mcp", "mcp.dispatch", `${call.tool} ${call.arg} -> ${call.result ?? "ok"}`);
  return { ...n, pendingId: null, pendingLeft: 0, nextAt: n.clock + PROPOSE_EVERY };
}

function propose(s: State): State {
  const p = SCRIPT[s.cursor % SCRIPT.length];
  const id = s.nextCallId;
  const verdict = validate(s.scope, p.tool, p.arg);
  let n: State = { ...s, cursor: s.cursor + 1, nextCallId: id + 1, nextAt: s.clock + PROPOSE_EVERY };
  const base: Call = { id, tool: p.tool, arg: p.arg, note: p.note, status: "awaiting", rule: verdict.rule, reason: verdict.reason, result: p.result };
  if (!verdict.ok) {
    n = { ...n, calls: [...n.calls, { ...base, status: "blocked" as const }].slice(-40) };
    return audit(n, "BLOCK", "gravel-security", verdict.rule, `${p.tool} ${p.arg}: ${verdict.reason}`);
  }
  n = { ...n, calls: [...n.calls, base].slice(-40) };
  const key = grantKey(n.scope, p.tool, p.arg);
  const grant = p.tool === "write_file" ? undefined : n.grants.find((g) => g.key === key);
  if (grant) {
    n = audit(n, "AUTO", "gravel-security", "approval.grant", `${p.tool} ${p.arg} matched standing grant ${grant.id} (${grant.label})`);
    return execute(n, id, "approval.grant", `grant ${grant.id}`);
  }
  const why = p.tool === "write_file" ? "approval.write_requires_human" : "approval.required";
  n = setCall({ ...n, pendingId: id, pendingLeft: APPROVAL_SECONDS }, id, { rule: why });
  return audit(n, "HOLD", "gravel-security", why, `${p.tool} ${p.arg} waiting for operator (${APPROVAL_SECONDS}s timeout, fail closed)`);
}

function resolvePending(s: State, verdict: "approve" | "deny" | "timeout", always: boolean): State {
  if (s.estop || s.pendingId === null) return s;
  const call = s.calls.find((c) => c.id === s.pendingId);
  if (!call) return s;
  if (verdict === "approve") {
    let n = s;
    if (always && call.tool !== "write_file") {
      const key = grantKey(s.scope, call.tool, call.arg);
      if (!n.grants.some((g) => g.key === key)) {
        const g: Grant = { id: `G${n.nextGrant}`, key, label: key };
        n = audit({ ...n, grants: [...n.grants, g], nextGrant: n.nextGrant + 1 }, "GRANT", "operator", "approval.always", `standing grant ${g.id} created for ${key}`);
      }
    }
    n = audit(n, "APPROVE", "operator", "approval.operator", `${call.tool} ${call.arg} approved${always ? " (always for this scope)" : ""}`);
    return execute(n, call.id, "approval.operator", "operator");
  }
  const timeout = verdict === "timeout";
  let n = setCall(s, call.id, { status: "denied", via: timeout ? "timeout" : "operator", rule: timeout ? "approval.timeout" : "approval.operator" });
  n = audit(n, "DENY", timeout ? "gravel-security" : "operator", timeout ? "approval.timeout" : "approval.operator", timeout ? `${call.tool} ${call.arg} denied: no decision in ${APPROVAL_SECONDS}s` : `${call.tool} ${call.arg} denied, agent notified`);
  return { ...n, pendingId: null, pendingLeft: 0, nextAt: n.clock + PROPOSE_EVERY };
}

function validateScopeInput(kind: "host" | "path", raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const value = kind === "host" ? raw.trim().toLowerCase() : raw.trim();
  if (!value) return { ok: false, error: "type a value first" };
  if (kind === "host") {
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.test$/.test(value)) {
      return { ok: false, error: "demo hosts must be bare names ending in .test, e.g. prod.example.test" };
    }
    return { ok: true, value };
  }
  if (!(value.startsWith("./") || value.startsWith("/") || value.startsWith("~/"))) return { ok: false, error: "paths start with ./ or /" };
  if (value.includes("..")) return { ok: false, error: "scope entries cannot contain .." };
  if (isProtectedPath(value)) return { ok: false, error: "protected system path: it can never be added to a scope" };
  return { ok: true, value };
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tick": {
      if (s.estop) return s;
      let n: State = { ...s, clock: s.clock + a.dt };
      if (n.pendingId !== null) {
        const left = n.pendingLeft - a.dt;
        if (left <= 0) return resolvePending({ ...n, pendingLeft: 0 }, "timeout", false);
        return { ...n, pendingLeft: left };
      }
      if (n.agentRunning && n.clock >= n.nextAt) n = propose(n);
      return n;
    }
    case "step":
      if (s.estop || s.pendingId !== null) return s;
      return propose(s);
    case "toggleAgent":
      if (s.estop) return s;
      return { ...s, agentRunning: !s.agentRunning, nextAt: s.clock + 0.8 };
    case "approve":
      return resolvePending(s, "approve", !!a.always);
    case "deny":
      return resolvePending(s, "deny", false);
    case "estop": {
      if (s.estop) return s;
      let n: State = s;
      let rejected = 0;
      if (n.pendingId !== null) {
        const call = n.calls.find((c) => c.id === n.pendingId);
        if (call) {
          n = setCall(n, call.id, { status: "rejected", via: "emergency stop", rule: "estop.engaged" });
          n = audit(n, "REJECT", "gravel-security", "estop.engaged", `${call.tool} ${call.arg} rejected: emergency stop`);
          rejected = 1;
        }
      }
      n = { ...n, estop: true, pendingId: null, pendingLeft: 0 };
      return audit(n, "ESTOP", "operator", "estop.engage", `agent frozen, tool dispatch disabled, ${rejected} pending request${rejected === 1 ? "" : "s"} rejected`);
    }
    case "resume": {
      if (!s.estop) return s;
      const n: State = { ...s, estop: false, nextAt: s.clock + 1.5 };
      return audit(n, "RESUME", "operator", "estop.clear", "emergency stop cleared by operator, agent may propose again");
    }
    case "addHost":
    case "addPath": {
      const kind = a.type === "addHost" ? "host" : "path";
      const v = validateScopeInput(kind, a.value);
      if (!v.ok) return { ...s, scopeMsg: { tone: "err", text: v.error } };
      const list = kind === "host" ? s.scope.hosts : s.scope.paths;
      if (list.includes(v.value)) return { ...s, scopeMsg: { tone: "err", text: `${v.value} is already in scope` } };
      const scope = kind === "host" ? { ...s.scope, hosts: [...s.scope.hosts, v.value] } : { ...s.scope, paths: [...s.scope.paths, v.value] };
      const n = audit({ ...s, scope, scopeMsg: { tone: "ok", text: `added ${v.value}. The next call that needs it will pass scope validation.` } }, "SCOPE", "operator", "scope.update", `added ${kind} ${v.value}`);
      return n;
    }
    case "removeHost":
    case "removePath": {
      const kind = a.type === "removeHost" ? "host" : "path";
      const scope = kind === "host" ? { ...s.scope, hosts: s.scope.hosts.filter((h) => h !== a.value) } : { ...s.scope, paths: s.scope.paths.filter((p) => p !== a.value) };
      return audit({ ...s, scope, scopeMsg: { tone: "ok", text: `removed ${a.value}` } }, "SCOPE", "operator", "scope.update", `removed ${kind} ${a.value}`);
    }
    case "revokeGrant": {
      const g = s.grants.find((x) => x.id === a.id);
      if (!g) return s;
      return audit({ ...s, grants: s.grants.filter((x) => x.id !== a.id) }, "GRANT", "operator", "approval.revoke", `standing grant ${g.id} (${g.label}) revoked`);
    }
    case "reset":
      return initialState();
    default:
      return s;
  }
}
