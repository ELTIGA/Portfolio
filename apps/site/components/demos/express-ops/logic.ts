import type { DriverBatch, ManifestImage, Row } from "./data";

export type ImageStatus = "ready" | "mismatch" | "failed";

export const sumPax = (rows: { pax: number }[]) => rows.reduce((n, r) => n + (Number.isFinite(r.pax) ? r.pax : 0), 0);

export function statusOf(img: Pick<ManifestImage, "rows" | "printedTotal">): ImageStatus {
  if (img.rows.length === 0) return "failed";
  if (img.printedTotal === null || sumPax(img.rows) !== img.printedTotal) return "mismatch";
  return "ready";
}

export const STATUS_LABEL: Record<ImageStatus, string> = {
  ready: "Ready",
  mismatch: "Totals mismatch",
  failed: "Extraction failed",
};

export function groupByService(rows: Row[]) {
  const map = new Map<string, Row[]>();
  for (const row of rows) {
    const list = map.get(row.service) ?? [];
    list.push(row);
    map.set(row.service, list);
  }
  return [...map.entries()].map(([service, list]) => ({ service, rows: list, subtotal: sumPax(list) }));
}

export const batchSum = (b: DriverBatch) => sumPax(b.entries);
export const batchOk = (b: DriverBatch) => batchSum(b) === b.footerTotal;

/** Plain-language explanation of the reconciliation state. */
export function reconcileMessage(extracted: number, printed: number | null): string {
  if (printed === null) return "The footer total was not read. Enter it from the image to reconcile.";
  const diff = extracted - printed;
  if (diff === 0) return "Extracted rows match the printed total.";
  const n = Math.abs(diff);
  return diff < 0
    ? `Rows are ${n} short of the printed total. A row may be missing or a count misread.`
    : `Rows are ${n} over the printed total. A count may be misread or a row duplicated.`;
}
