// Tells IndexNow engines (Bing, Yandex, Seznam, Naver and others) that every URL in the
// live sitemap may have changed, so they recrawl after a production deploy. Google does
// not take part in IndexNow; it reads the sitemap named in robots.txt instead.
//
// The key is public by design: engines confirm ownership by fetching /<key>.txt from the
// site, so the file in apps/site/public must stay in step with the key sent here.
//
// Usage: node scripts/indexnow.mjs [siteUrl]   (defaults to SITE_URL, then the live site)
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const site = new URL(process.argv[2] ?? process.env.SITE_URL ?? "https://www.ahmedeltigani.com");
const publicDir = fileURLToPath(new URL("../apps/site/public/", import.meta.url));
const keyFile = readdirSync(publicDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error(`No IndexNow key file (<32 hex chars>.txt) in ${publicDir}`);
const key = keyFile.slice(0, -4);

const sitemap = await fetch(new URL("/sitemap.xml", site));
if (!sitemap.ok) throw new Error(`GET sitemap.xml: ${sitemap.status}`);
const urlList = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => new URL(u).host === site.host);
if (urlList.length === 0) throw new Error(`sitemap.xml lists no URLs on ${site.host}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: site.host, key, keyLocation: new URL(keyFile, site).href, urlList }),
});
// 200 = accepted, 202 = accepted while the key is still being verified.
if (res.status !== 200 && res.status !== 202) {
  throw new Error(`IndexNow rejected the submission: ${res.status} ${await res.text()}`);
}
console.log(`IndexNow: submitted ${urlList.length} URLs for ${site.host} (${res.status})`);
