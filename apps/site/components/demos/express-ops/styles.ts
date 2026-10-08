/**
 * Scoped design tokens and primitives for the Express Ops replica.
 * Warm neutrals with one amber accent; status uses four semantic roles
 * (success / warning / danger / info), each with fg / soft / line.
 * Text colors were checked for WCAG AA against the surfaces they sit on.
 */
export const css = `
.eo{
  --bg:#15130f;--side:#1a1713;--card:#1f1b16;--raised:#2a251d;--line:#352f26;--line2:#50473a;
  --fg:#f3eee5;--muted:#a9a193;--brand:#e8b650;--brand-ink:#f3cd7e;--brand-soft:#3a2d12;--ring:#f0c060;
  --ok:#74d69f;--ok-soft:#12291d;--ok-line:#2a6a47;
  --warn:#f5a85e;--warn-soft:#35200c;--warn-line:#7a4d19;
  --bad:#ff958f;--bad-soft:#391917;--bad-line:#8a3430;
  --info:#8dbbf7;--info-soft:#14233a;--info-line:#2f5183;
  background:var(--bg);color:var(--fg);font-size:13px;line-height:1.45;outline:none;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}
.eo *,.eo *::before,.eo *::after{box-sizing:border-box}
.eo button,.eo input,.eo select{font:inherit;color:inherit}
.eo :focus-visible{outline:2px solid var(--ring);outline-offset:2px;border-radius:6px}
.eo ::placeholder{color:#8b8374}
.eo .mono{font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
.eo-card{background:var(--card);border:1px solid var(--line);border-radius:10px}
.eo-card.warn{border-color:var(--warn-line);background:var(--warn-soft)}
.eo-card.ok{border-color:var(--ok-line);background:var(--ok-soft)}
.eo-card.bad{border-color:var(--bad-line);background:var(--bad-soft)}
.eo-eyebrow{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-ink);font-weight:600}
.eo-muted{color:var(--muted)}
.eo-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:0 12px;border-radius:7px;
  border:1px solid var(--line2);background:var(--raised);font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap;
  transition:background .15s,border-color .15s}
.eo-btn:hover:not(:disabled){background-color:#373027;border-color:#665b4a}
.eo-btn:disabled{opacity:.5;cursor:not-allowed}
.eo-btn[aria-disabled="true"]{opacity:.65;cursor:progress}
.eo-btn.primary{background:var(--fg);border-color:var(--fg);color:#17140f}
.eo-btn.primary:hover:not(:disabled){background-color:#fff;border-color:#fff}
.eo-btn.quiet{background:transparent;border-color:transparent;color:var(--muted)}
.eo-btn.quiet:hover:not(:disabled){background-color:var(--raised);color:var(--fg);border-color:var(--line)}
.eo-btn.icon{padding:0;min-width:32px}
.eo-input{width:100%;min-height:30px;padding:0 8px;border-radius:6px;border:1px solid var(--line2);background:var(--bg);
  color:var(--fg);font-size:13px;transition:border-color .15s}
.eo-input:hover{border-color:#665b4a}
.eo-input:focus-visible{outline:2px solid var(--ring);outline-offset:1px;border-color:var(--ring)}
.eo-input.num{text-align:right;font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
.eo-chip{display:inline-flex;align-items:center;gap:5px;min-height:20px;padding:0 8px;border-radius:999px;font-size:11px;font-weight:600;
  border:1px solid var(--line2);color:var(--muted);white-space:nowrap}
.eo-chip.ok{color:var(--ok);background:var(--ok-soft);border-color:var(--ok-line)}
.eo-chip.warn{color:var(--warn);background:var(--warn-soft);border-color:var(--warn-line)}
.eo-chip.bad{color:var(--bad);background:var(--bad-soft);border-color:var(--bad-line)}
.eo-chip.info{color:var(--info);background:var(--info-soft);border-color:var(--info-line)}
.eo-chip.brand{color:var(--brand-ink);background:var(--brand-soft);border-color:#6d531c}
.eo-dot{width:6px;height:6px;border-radius:99px;background:currentColor;flex:none}
.eo-kbd{display:inline-block;padding:0 5px;border-radius:4px;border:1px solid var(--line2);background:var(--raised);
  font-size:11px;font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--muted)}
.eo-navbtn{display:flex;align-items:center;gap:10px;width:100%;min-height:34px;padding:0 10px;border-radius:7px;border:1px solid transparent;
  background:transparent;color:var(--muted);cursor:pointer;font-size:13px;font-weight:500;text-align:left;transition:background .15s,color .15s}
.eo-navbtn:hover{background:var(--raised);color:var(--fg)}
.eo-navbtn[aria-current="page"]{background:var(--brand-soft);color:var(--brand-ink);border-color:#5c4617}
.eo-seg{display:inline-flex;padding:2px;border-radius:8px;border:1px solid var(--line2);background:var(--bg)}
.eo-seg button{min-height:26px;padding:0 10px;border-radius:6px;border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:12px;font-weight:600}
.eo-seg button:hover{color:var(--fg)}
.eo-seg button[aria-pressed="true"]{background:var(--fg);color:#17140f}
.eo-switch{display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:0 4px;border:0;background:transparent;cursor:pointer;font-size:12.5px}
.eo-switch .track{width:30px;height:18px;border-radius:99px;background:var(--line2);position:relative;transition:background .15s;flex:none}
.eo-switch .track::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:99px;background:#fff;transition:transform .15s}
.eo-switch[aria-checked="true"] .track{background:var(--brand)}
.eo-switch[aria-checked="true"] .track::after{transform:translateX(12px);background:#17140f}
.eo-thumb{display:flex;gap:10px;align-items:center;width:100%;padding:8px;border-radius:9px;border:1px solid var(--line);background:var(--card);
  cursor:pointer;text-align:left;transition:border-color .15s,background .15s}
.eo-thumb:hover{border-color:var(--line2);background:#241f19}
.eo-thumb[aria-current="true"]{border-color:var(--brand);background:#2a2214}
.eo-th{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.eo-spin{width:12px;height:12px;border-radius:99px;border:2px solid currentColor;border-right-color:transparent;animation:eo-rot .7s linear infinite}
@keyframes eo-rot{to{transform:rotate(360deg)}}
@keyframes eo-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.eo-toast{animation:eo-in .18s ease-out}
.eo-scroll{scrollbar-width:thin;scrollbar-color:var(--line2) transparent}
@media (prefers-reduced-motion:reduce){
  .eo *,.eo *::before,.eo *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;
