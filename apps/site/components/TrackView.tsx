"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Fires `case_study_open` once when a case-study page mounts. */
export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    track("case_study_open", { slug });
  }, [slug]);
  return null;
}
