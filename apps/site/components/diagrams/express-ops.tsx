import { FlowDiagram, type FlowSpec } from "./kit";

// Source: Express-Lists README ("What it does", "Release and CI/CD", "Convex networking in production").
const spec: FlowSpec = {
  title: "Express Ops architecture",
  description:
    "Four rows. First, the manifest pipeline: manifest photos are read by Mistral OCR, each result is reconciled against the footer totals printed on the image, failures and mismatches go to an editable review queue, and the output is exported as an XLSX driver list or DOCX lists. Second, the browser path: the browser talks to the public Convex URL through Cloudflare. Third, the server path: the Next.js server talks to Convex over the internal Docker network, which avoids the Cloudflare managed challenge. Fourth, the release path: a push or pull request runs dependency audit, lint, tests, typecheck and build; a push to main deploys over SSH to Docker Compose, and the sign-in endpoint is checked afterwards.",
  caption:
    "Mechanism: every extracted manifest is checked against its own printed totals before it can become a document. Server-to-server traffic stays on the Docker network because the public hostname sits behind a Cloudflare challenge.",
  lanes: [
    {
      title: "Manifest pipeline",
      nodes: [
        { label: ["Manifest", "photos"], sub: ["grouped into", "a session"] },
        { label: ["Mistral OCR"], sub: ["each image", "is read"] },
        { label: ["Footer-total", "check"], sub: ["rows vs totals", "printed in", "the image"], tone: "accent" },
        { label: ["Review queue"], sub: ["failures and", "mismatches;", "edit in place,", "undo"] },
        { label: ["Exports"], sub: ["XLSX driver list,", "DOCX lists"] },
      ],
    },
    {
      title: "Browser path · public URLs",
      nodes: [
        { label: ["Browser"], sub: ["NEXT_PUBLIC_CONVEX_URL"] },
        { label: ["Cloudflare"], sub: ["public hostname"] },
        { label: ["Convex"], sub: ["self-hosted", "backend"] },
      ],
    },
    {
      title: "Server path · internal network",
      nodes: [
        { label: ["Next.js server"], sub: ["auth, queries,", "preloads, uploads"] },
        { label: ["Docker network"], sub: ["backend:3230 and", "backend:3231", "no Cloudflare challenge"], tone: "accent" },
        { label: ["Convex"], sub: ["same backend,", "internal URL"] },
      ],
    },
    {
      title: "Release · GitHub Actions",
      nodes: [
        { label: ["Push or PR"], sub: ["every push", "and every", "pull request"] },
        { label: ["Checks"], sub: ["audit, lint,", "test, tsc,", "build"], tone: "accent" },
        { label: ["SSH deploy"], sub: ["push to main", "only; same", "commit"] },
        { label: ["Docker", "Compose"], sub: ["Convex", "functions, stack", "rebuilt"] },
        { label: ["Sign-in", "check"], sub: ["endpoint", "verified after", "release"] },
      ],
    },
  ],
};

export function ExpressOpsDiagram() {
  return <FlowDiagram spec={spec} />;
}
