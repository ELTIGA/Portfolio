export interface AppDef {
  id: "finder" | "terminal" | "mail" | "notes" | "settings";
  label: string;
  title: string;
  glyph: string;
  color: string;
  size: { w: number; h: number };
}

export const APPS: AppDef[] = [
  { id: "finder", label: "Projects", title: "Projects", glyph: "📁", color: "#1f6feb", size: { w: 760, h: 480 } },
  { id: "terminal", label: "Terminal", title: "Terminal", glyph: "⌨️", color: "#2b2f36", size: { w: 700, h: 440 } },
  { id: "notes", label: "About", title: "About Ahmed", glyph: "📝", color: "#d29922", size: { w: 640, h: 520 } },
  { id: "mail", label: "Mail", title: "New message", glyph: "✉️", color: "#2ea043", size: { w: 560, h: 380 } },
  { id: "settings", label: "About this portfolio", title: "About this portfolio", glyph: "⚙️", color: "#6e7681", size: { w: 620, h: 520 } },
];

export const projectWindowId = (slug: string) => `project:${slug}`;
