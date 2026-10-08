"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Phone } from "./Phone";
import type { Channel, ClickEvent, Source } from "./channels";

/** Review Router replica: mobile landing page for a fictional rafting company, with a click-analytics side panel. */
export default function Demo() {
  const [events, setEvents] = useState<ClickEvent[]>([]);
  const [source, setSource] = useState<Source>("qr");
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onPick = useCallback(
    (c: Channel) => {
      counter.current += 1;
      const n = counter.current;
      const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setEvents((prev) => [...prev, { n, channel: c.id, source, at }]);
      setToast(`This would open ${c.name}`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 2400);
    },
    [source],
  );

  return (
    <div className="@container h-full overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center gap-4 p-4 @2xl:flex-row @2xl:gap-8">
        <p className="w-full max-w-[320px] rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs @2xl:hidden" aria-hidden="true">
          review_channel_click: <span className="text-accent">{events.length}</span>
        </p>
        <div className="w-full max-w-[320px] shrink-0">
          <Phone onPick={onPick} toast={toast} />
        </div>
        <AnalyticsPanel events={events} source={source} onSource={setSource} onReset={() => setEvents([])} />
      </div>
    </div>
  );
}
