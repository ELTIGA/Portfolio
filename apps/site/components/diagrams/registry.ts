import type { ComponentType } from "react";
import type { DiagramProps } from "./kit";
import { ExpressOpsDiagram } from "./express-ops";
import { GetitDiagram } from "./getit";
import { GravelDiagram } from "./gravel";
import { ViyaDiagram } from "./viya";

/** slug -> architecture diagram (inline SVG, server-rendered). Projects without an entry show no Architecture section. */
export const diagrams: Record<string, ComponentType<DiagramProps>> = {
  "express-ops": ExpressOpsDiagram,
  viya: ViyaDiagram,
  gravel: GravelDiagram,
  getit: GetitDiagram,
};
