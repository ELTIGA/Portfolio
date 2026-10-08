import { FlowDiagram, type FlowSpec } from "./kit";

// Source: viya README, docs/overview.md, docs/implementation.md, docs/manifest-operations-policies.md.
const spec: FlowSpec = {
  title: "Viya architecture",
  description:
    "Three rows. First, ingestion: an Excel or PDF manifest is uploaded as a tenant-scoped record, parsed by one of four providers (docling, native_sheet, mistral_ocr, llamaparse), then structured by an LLM router that uses minimax_m2_5_highspeed by default with a fallback chain across openai_gpt_4_1_mini, gemini_2_5_flash_lite, zai_glm and deepseek_chat. Second, operations: an admin reviews the rows, routes are generated only when every passenger location is resolved, drivers are dispatched over WhatsApp, Telegram or Slack, and inbound replies are resolved back to the tenant and dispatch. Third, the tenant boundary: Clerk organization context and Convex ownership guards are checked on every read and write, and channel credentials are encrypted before storage.",
  caption:
    "Mechanism: parse and extraction providers are interchangeable behind one routing layer, route generation is gated on resolved locations, and every business read and write passes a tenant ownership check.",
  lanes: [
    {
      title: "Ingest · manifest to data",
      linkToNext: "extracted passenger rows",
      nodes: [
        { label: ["Upload"], sub: ["Excel or PDF,", "stored as a", "tenant-scoped record"] },
        { label: ["Parse"], sub: ["docling, native_sheet,", "mistral_ocr, llamaparse;", "spreadsheet fast path"] },
        {
          label: ["LLM router"],
          sub: ["default: minimax_m2_5_highspeed", "fallback chain:", "openai_gpt_4_1_mini,", "gemini_2_5_flash_lite,", "zai_glm, deepseek_chat"],
          tone: "accent",
        },
      ],
    },
    {
      title: "Operate · review, route, dispatch",
      nodes: [
        { label: ["Review"], sub: ["admin corrects", "rows; map pin", "for ambiguous", "places"] },
        { label: ["Routes"], sub: ["blocked on missing,", "failed or ambiguous", "geocodes", "Google or MapLibre", "+ OSRM"], tone: "accent" },
        { label: ["Dispatch"], sub: ["WhatsApp,", "Telegram,", "Slack driver DMs"] },
        { label: ["Driver replies"], sub: ["inbound webhooks", "resolved to tenant", "and dispatch"] },
      ],
    },
    {
      title: "Tenant boundary",
      nodes: [
        { label: ["Clerk"], sub: ["organization", "context"] },
        { label: ["Convex guards"], sub: ["tenant ownership", "validated before", "any read or write"], tone: "accent" },
        { label: ["Tenant data"], sub: ["channel credentials", "encrypted before", "storage"] },
      ],
    },
  ],
};

export function ViyaDiagram() {
  return <FlowDiagram spec={spec} />;
}
