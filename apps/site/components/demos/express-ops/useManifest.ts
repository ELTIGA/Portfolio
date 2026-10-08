"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { manifestSeed } from "./data";
import type { ManifestImage, Row } from "./data";
import type { PushToast } from "./hooks";

type Snapshot = { id: number; imageId: string; rows: Row[]; printedTotal: number | null; toastId?: number };

const clone = (rows: Row[]) => rows.map((r) => ({ ...r }));

/** Manifest session state: images, editing, reprocess, and an undo stack for reprocessed images. */
export function useManifest(push: PushToast, dismiss: (id: number) => void) {
  const [images, setImages] = useState<ManifestImage[]>(manifestSeed);
  const [selectedId, setSelectedId] = useState("m2");
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [grouped, setGrouped] = useState(false);

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const counter = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const patchImage = useCallback((id: string, fn: (img: ManifestImage) => ManifestImage) => {
    setImages((list) => list.map((img) => (img.id === id ? fn(img) : img)));
  }, []);

  const updateRow = useCallback(
    (imageId: string, rowId: string, patch: Partial<Row>) => {
      patchImage(imageId, (img) => ({ ...img, rows: img.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)) }));
    },
    [patchImage],
  );

  const addRow = useCallback(
    (imageId: string) => {
      const id = `${imageId}-n${counter.current++}`;
      patchImage(imageId, (img) => ({
        ...img,
        rows: [...img.rows, { id, guest: "", pax: 1, hotel: "", service: img.rows[img.rows.length - 1]?.service ?? "Rafting day" }],
      }));
      return id;
    },
    [patchImage],
  );

  const removeRow = useCallback(
    (imageId: string, rowId: string) => {
      patchImage(imageId, (img) => ({ ...img, rows: img.rows.filter((r) => r.id !== rowId) }));
    },
    [patchImage],
  );

  const setPrinted = useCallback(
    (imageId: string, value: number | null) => patchImage(imageId, (img) => ({ ...img, printedTotal: value })),
    [patchImage],
  );

  const restore = useCallback(
    (snap: Snapshot) => {
      const file = imagesRef.current.find((i) => i.id === snap.imageId)?.file ?? "image";
      patchImage(snap.imageId, (img) => ({ ...img, rows: clone(snap.rows), printedTotal: snap.printedTotal }));
      setHistory((h) => h.filter((s) => s.id !== snap.id));
      if (snap.toastId) dismiss(snap.toastId);
      setSelectedId(snap.imageId);
      push(`Restored the previous extraction for ${file}.`, { tone: "ok" });
    },
    [patchImage, push, dismiss],
  );

  const undoLatest = useCallback(() => {
    const last = history[history.length - 1];
    if (!last) return false;
    restore(last);
    return true;
  }, [history, restore]);

  const reprocess = useCallback(
    (imageId: string) => {
      if (busyId) return;
      setBusyId(imageId);
      timer.current = setTimeout(() => {
        setBusyId(null);
        const current = imagesRef.current.find((i) => i.id === imageId);
        if (!current) return;
        const next = current.reprocessed;
        const same = !next || (JSON.stringify(next.rows) === JSON.stringify(current.rows) && next.printedTotal === current.printedTotal);
        if (same) {
          push(`${current.file}: the second pass matched the current rows. Nothing changed.`);
          return;
        }
        const id = counter.current++;
        const base = { id, imageId, rows: clone(current.rows), printedTotal: current.printedTotal };
        // The toast's Undo needs the snapshot and the snapshot needs the toast id; build
        // the final object first (the closure reads it lazily) so state is never mutated.
        const snap: Snapshot = {
          ...base,
          toastId: push(`Reprocessed ${current.file}. Rows replaced with the second extraction.`, {
            tone: "ok",
            action: { label: "Undo", run: () => restore(snap) },
          }),
        };
        setHistory((h) => [...h, snap]);
        patchImage(imageId, (img) => ({ ...img, rows: clone(next.rows), printedTotal: next.printedTotal }));
      }, 900);
    },
    [busyId, patchImage, push, restore],
  );

  return { images, selectedId, setSelectedId, history, busyId, grouped, setGrouped, updateRow, addRow, removeRow, setPrinted, reprocess, undoLatest };
}

export type ManifestApi = ReturnType<typeof useManifest>;
