import type { ReactNode } from "react";

/**
 * Tiny layout kit for architecture diagrams. A diagram is a list of "lanes"
 * (a titled row of nodes joined by arrows). Two SVG layouts are generated from
 * the same data: a wide one (nodes in a row) and a narrow stacked one for
 * phones, so text stays at a readable size at 340px. Colours come from the
 * site's Tailwind theme tokens, so no hard-coded palette lives here.
 */

export type Tone = "default" | "accent";

export interface FlowNode {
  /** Bold heading; each entry is one line. */
  label: string[];
  /** Muted detail lines under the label. */
  sub?: string[];
  /** "accent" marks the node that carries the interesting mechanism. */
  tone?: Tone;
}

export interface FlowLane {
  title: string;
  nodes: FlowNode[];
  /** Draws an arrow from this lane to the next one, with this label. */
  linkToNext?: string;
}

export interface FlowSpec {
  /** Short accessible name, also the <title>. */
  title: string;
  /** Longer plain-language description (<desc> and aria-label). */
  description: string;
  lanes: FlowLane[];
  caption: string;
}

type Mode = "wide" | "narrow";

const LABEL_LH = 18;
const SUB_LH = 16.5;
const LABEL_FS = 13.5;
const SUB_FS = 12.5;
const TITLE_FS = 12;

const CFG = {
  wide: { W: 760, pad: 12, gap: 22, laneGap: 14, linkGap: 40 },
  narrow: { W: 300, pad: 12, gap: 16, laneGap: 14, linkGap: 36 },
} as const;

/** Greedy word wrap by character count (used only for the narrow layout). */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

interface Prepared {
  label: string[];
  sub: string[];
  tone: Tone;
  h: number;
}

function prepare(node: FlowNode, mode: Mode): Prepared {
  const label = mode === "wide" ? node.label : [node.label.join(" ")];
  const sub = mode === "wide" ? (node.sub ?? []) : node.sub && node.sub.length ? wrap(node.sub.join(" "), 38) : [];
  const h = 10 + LABEL_LH * label.length + (sub.length ? 4 + SUB_LH * sub.length : 0) + 9;
  return { label, sub, tone: node.tone ?? "default", h };
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const horizontal = y1 === y2;
  const head = horizontal
    ? `${x2},${y2} ${x2 - 7},${y2 - 4.5} ${x2 - 7},${y2 + 4.5}`
    : `${x2},${y2} ${x2 - 4.5},${y2 - 7} ${x2 + 4.5},${y2 - 7}`;
  return (
    <g aria-hidden="true">
      <line x1={x1} y1={y1} x2={horizontal ? x2 - 6 : x2} y2={horizontal ? y2 : y2 - 6} className="stroke-muted" strokeWidth={1.5} />
      <polygon points={head} className="fill-muted" />
    </g>
  );
}

function build(spec: FlowSpec, mode: Mode): { W: number; H: number; children: ReactNode[] } {
  const { W, pad, gap, laneGap, linkGap } = CFG[mode];
  const children: ReactNode[] = [];
  let y = 1;

  spec.lanes.forEach((lane, li) => {
    const nodes = lane.nodes.map((n) => prepare(n, mode));
    const maxH = Math.max(...nodes.map((n) => n.h));
    const body = mode === "wide" ? maxH : nodes.reduce((s, n) => s + n.h, 0) + gap * (nodes.length - 1);
    const laneH = 34 + body + pad + 2;
    const laneY = y;

    children.push(
      <rect key={`lane-${li}`} x={1} y={laneY} width={W - 2} height={laneH} rx={10} className="fill-surface stroke-line" strokeWidth={1} />,
      <text key={`lt-${li}`} x={pad + 2} y={laneY + 22} className="fill-muted font-mono uppercase" fontSize={TITLE_FS} letterSpacing={1}>
        {lane.title}
      </text>,
    );

    const top = laneY + 34;
    const count = nodes.length;
    const wideW = (W - 2 * pad - 2 - gap * (count - 1)) / count;
    let ny = top;

    nodes.forEach((n, ni) => {
      const nx = mode === "wide" ? pad + 1 + ni * (wideW + gap) : pad + 1;
      const nw = mode === "wide" ? wideW : W - 2 * pad - 2;
      const nh = mode === "wide" ? maxH : n.h;
      const ty = mode === "wide" ? top : ny;
      const accent = n.tone === "accent";
      children.push(
        <rect
          key={`n-${li}-${ni}`}
          x={nx}
          y={ty}
          width={nw}
          height={nh}
          rx={7}
          className={`fill-bg ${accent ? "stroke-accent" : "stroke-line"}`}
          strokeWidth={accent ? 1.5 : 1}
        />,
      );
      const cx = nx + nw / 2;
      n.label.forEach((line, i) =>
        children.push(
          <text key={`l-${li}-${ni}-${i}`} x={cx} y={ty + 10 + LABEL_FS + i * LABEL_LH} textAnchor="middle" fontSize={LABEL_FS} fontWeight={600} className={accent ? "fill-accent" : "fill-fg"}>
            {line}
          </text>,
        ),
      );
      n.sub.forEach((line, i) =>
        children.push(
          <text key={`s-${li}-${ni}-${i}`} x={cx} y={ty + 10 + LABEL_LH * n.label.length + 4 + SUB_FS + i * SUB_LH} textAnchor="middle" fontSize={SUB_FS} className="fill-muted">
            {line}
          </text>,
        ),
      );

      if (ni < count - 1) {
        if (mode === "wide") {
          const my = top + maxH / 2;
          children.push(<Arrow key={`a-${li}-${ni}`} x1={nx + nw + 3} y1={my} x2={nx + nw + gap - 3} y2={my} />);
        } else {
          children.push(<Arrow key={`a-${li}-${ni}`} x1={W / 2} y1={ty + nh + 2} x2={W / 2} y2={ty + nh + gap - 1} />);
        }
      }
      if (mode === "narrow") ny += nh + gap;
    });

    y += laneH;
    if (lane.linkToNext && li < spec.lanes.length - 1) {
      const x = mode === "wide" ? W / 2 : 26;
      children.push(
        <Arrow key={`link-${li}`} x1={x} y1={y + 3} x2={x} y2={y + linkGap - 3} />,
        <text key={`linkt-${li}`} x={x + 12} y={y + linkGap / 2 + 4} fontSize={SUB_FS} className="fill-muted">
          {lane.linkToNext}
        </text>,
      );
      y += linkGap;
    } else {
      y += laneGap;
    }
  });

  return { W, H: y - laneGap + 1, children };
}

function Svg({ spec, mode }: { spec: FlowSpec; mode: Mode }) {
  const { W, H, children } = build(spec, mode);
  return (
    <svg
      role="img"
      aria-label={`${spec.title}. ${spec.description}`}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ height: "auto", display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
      data-diagram-mode={mode}
    >
      <title>{spec.title}</title>
      <desc>{spec.description}</desc>
      {children}
    </svg>
  );
}

export function FlowDiagram({ spec }: { spec: FlowSpec }) {
  return (
    <figure className="rounded-xl border border-line bg-bg p-2 sm:p-4 lg:-mx-12">
      <div className="hidden md:block">
        <Svg spec={spec} mode="wide" />
      </div>
      <div className="mx-auto max-w-[460px] md:hidden">
        <Svg spec={spec} mode="narrow" />
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted">{spec.caption}</figcaption>
    </figure>
  );
}
