import { FlowDiagram, type FlowSpec } from "./kit";

// Source: Gravel TUI README and docs (architecture, crates, operations).
const spec: FlowSpec = {
  title: "Gravel architecture",
  description:
    "Three rows. First, the gate: the agent proposes a tool call, the scope check extracts targets from the arguments and validates them against allow and block lists (violations are denied and logged), the operator approves or denies in the terminal UI, and approval yields a signed token. Second, execution: the MCP interceptor accepts only requests that carry the token, sends them over a stdio or HTTP transport, and the tool server runs them. Third, always on: an audit log records sessions, requests, approvals, denials, executions and scope violations, and an emergency stop halts new requests and pending work.",
  caption:
    "Mechanism: a tool call moves from raw request to scoped request to signed token, and only a signed request can reach the tool transport.",
  lanes: [
    {
      title: "Gate · before anything runs",
      linkToNext: "approved requests only",
      nodes: [
        { label: ["Agent"], sub: ["model backend", "proposes a", "tool call"] },
        { label: ["Scope check"], sub: ["targets extracted", "from arguments;", "allow and block", "lists, CIDR"], tone: "accent" },
        { label: ["Operator", "approval"], sub: ["queued in the", "TUI overlay;", "approve or deny"], tone: "accent" },
        { label: ["Signed token"], sub: ["issued on", "approval"] },
      ],
    },
    {
      title: "Execute · MCP layer",
      nodes: [
        { label: ["MCP interceptor"], sub: ["scope, risk and", "approval aware"] },
        { label: ["Transport"], sub: ["stdio or HTTP"] },
        { label: ["Tool server"], sub: ["runs only with", "a signed token"] },
      ],
    },
    {
      title: "Always on",
      nodes: [
        { label: ["Audit log"], sub: ["session, request, approval,", "denial, execution,", "scope violations"] },
        { label: ["Emergency stop"], sub: ["stop new requests;", "cancel or deny", "pending work"], tone: "accent" },
      ],
    },
  ],
};

export function GravelDiagram() {
  return <FlowDiagram spec={spec} />;
}
