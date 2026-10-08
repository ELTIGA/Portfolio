import { FlowDiagram, type FlowSpec } from "./kit";

// Source: getit README and docs/ARCHITECTURE.md.
const spec: FlowSpec = {
  title: "getit architecture",
  description:
    "Three rows. First, the download path: the CLI, the TUI or the MCP server call one DownloadService, which hands the URL to an async DownloadManager; the extractor registry routes the URL to a host extractor, and the FileDownloader streams, resumes, decrypts and verifies the file. Second, state and progress: a SQLite task registry stores task state, an event bus publishes progress, completion and error events, and the CLI progress bars, the TUI and the MCP resource subscribe. Third, the MCP surface: an agent calls the download, list_files, get_download_status and cancel_download tools, which go through the same DownloadService, and can watch a live active-downloads resource.",
  caption:
    "Mechanism: three interfaces share one service, hosts plug in as self-registering extractors, and progress flows through an event bus rather than being wired to any one UI.",
  lanes: [
    {
      title: "Download path · URL in, file out",
      nodes: [
        { label: ["CLI, TUI", "or MCP"], sub: ["same call into", "one service"] },
        { label: ["Download", "Service"], sub: ["facade; records", "the task"] },
        { label: ["Manager"], sub: ["async; semaphore", "limits", "concurrency"] },
        { label: ["Extractor"], sub: ["registry routes", "the URL to a", "host extractor"], tone: "accent" },
        { label: ["Downloader"], sub: ["streams, resumes,", "decrypts,", "checksums"] },
      ],
    },
    {
      title: "State and progress",
      nodes: [
        { label: ["Task registry"], sub: ["SQLite; task", "metadata and", "progress"] },
        { label: ["Event bus"], sub: ["download_progress,", "download_complete,", "download_error"], tone: "accent" },
        { label: ["Subscribers"], sub: ["CLI progress bars,", "TUI, MCP resource", "updates"] },
      ],
    },
    {
      title: "MCP server · for AI agents",
      nodes: [
        { label: ["Agent"], sub: ["Claude Desktop,", "Cursor, Windsurf"] },
        { label: ["MCP tools"], sub: ["download,", "list_files,", "get_download_status,", "cancel_download"] },
        { label: ["Download", "Service"], sub: ["same path as", "the CLI and TUI"] },
        { label: ["Live queue"], sub: ["active-downloads://list"], tone: "accent" },
      ],
    },
  ],
};

export function GetitDiagram() {
  return <FlowDiagram spec={spec} />;
}
