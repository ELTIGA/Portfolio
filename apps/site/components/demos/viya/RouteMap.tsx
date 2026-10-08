"use client";

import type { RoutePlan } from "./calc";
import type { MapDecor, Stop, VehicleSeed } from "./types";

export interface MapVehicle {
  v: VehicleSeed;
  index: number;
  stops: Stop[];
  plan: RoutePlan;
}

const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: 3, strokeLinejoin: "round" } as const;

/** Stylized, tile-free map: decor shapes plus one polyline per vehicle. */
export function RouteMap({
  decor,
  vehicles,
  selected,
  dest,
  onSelect,
  summary,
}: {
  decor: MapDecor;
  vehicles: MapVehicle[];
  selected: string;
  dest: { name: string; x: number; y: number };
  onSelect: (id: string) => void;
  summary: string;
}) {
  return (
    <svg viewBox="0 0 640 400" role="img" aria-label={summary} className="block h-auto w-full rounded-xl border border-(--v-line)" style={{ background: decor.land }}>
      {decor.parks.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#D9E8D3" />
      ))}
      {decor.roads.map((d, i) => (
        <g key={i} fill="none" strokeLinecap="round">
          <path d={d} stroke="#D3DCE7" strokeWidth="8" />
          <path d={d} stroke="#fff" strokeWidth="5.5" />
        </g>
      ))}
      {decor.water.map((d, i) => (
        <path key={i} d={d} fill="#BFDDEE" stroke="#A5CBE0" strokeWidth="1.5" />
      ))}
      {decor.labels.map((l) => (
        <text key={l.t} x={l.x} y={l.y} fontSize="11" fill="#5B6B80" fontStyle="italic" letterSpacing="1.5" textAnchor="middle" style={halo}>
          {l.t.toUpperCase()}
        </text>
      ))}

      {vehicles.map(({ v, plan }) => {
        const on = v.id === selected;
        const pts = plan.points.map((p) => `${p.x},${p.y}`).join(" ");
        return (
          <g key={v.id} opacity={on ? 1 : 0.5}>
            <polyline points={pts} fill="none" stroke="#fff" strokeWidth={on ? 8 : 6} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pts} fill="none" stroke={v.color} strokeWidth={on ? 4 : 3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={on ? undefined : "1 7"} />
            {on &&
              plan.points.slice(1).map((p, i) => {
                const a = plan.points[i];
                const mx = (a.x + p.x) / 2;
                const my = (a.y + p.y) / 2;
                const ang = (Math.atan2(p.y - a.y, p.x - a.x) * 180) / Math.PI;
                return <path key={i} d="M -5 -4.5 L 5 0 L -5 4.5 Z" fill={v.color} stroke="#fff" strokeWidth="1.5" transform={`translate(${mx} ${my}) rotate(${ang})`} />;
              })}
          </g>
        );
      })}

      {vehicles.map(({ v, stops, plan }) => {
        const on = v.id === selected;
        const d = plan.points[0];
        return (
          <g key={v.id} opacity={on ? 1 : 0.7} onClick={() => onSelect(v.id)} className="cursor-pointer">
            <rect x={d.x - 9} y={d.y - 9} width="18" height="18" rx="4" fill="#22334A" stroke={v.color} strokeWidth="3" />
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
              D
            </text>
            <title>{`${v.label} start: ${v.depot.name}`}</title>
            {stops.map((s, i) => (
              <g key={s.id}>
                <circle cx={s.x} cy={s.y} r={on ? 11 : 9} fill={v.color} stroke="#fff" strokeWidth="2.5" />
                <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                  {i + 1}
                </text>
                <title>{`${v.label} stop ${i + 1}: ${s.hotel}`}</title>
                {on && (
                  <text x={s.x + 15} y={s.y + 4} fontSize="11" fontWeight="600" fill="#22334A" style={halo}>
                    {s.hotel}
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}

      <g>
        <circle cx={dest.x} cy={dest.y} r="13" fill="#fff" stroke="#22334A" strokeWidth="3" />
        <path d={`M ${dest.x - 4} ${dest.y + 6} V ${dest.y - 6} L ${dest.x + 5} ${dest.y - 3} L ${dest.x - 4} ${dest.y}`} fill="#F59E42" stroke="#22334A" strokeWidth="1.6" strokeLinejoin="round" />
        <text x={dest.x} y={dest.y + 27} textAnchor="middle" fontSize="11" fontWeight="700" fill="#22334A" style={halo}>
          {dest.name}
        </text>
        <title>{`Destination: ${dest.name}`}</title>
      </g>
    </svg>
  );
}
