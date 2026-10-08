// Builds the standalone 3D intro (apps/shell) and copies its static output into
// the Next site's public/ folder so it is served at /experience/index.html.
// apps/shell is intentionally NOT an npm workspace: it has its own lockfile.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const shell = join(root, "apps", "shell");
const dist = join(shell, "dist");
const target = join(root, "apps", "site", "public", "experience");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(args) {
  const res = spawnSync(npm, args, { cwd: shell, stdio: "inherit" });
  if (res.status !== 0) {
    console.error(`build-shell: "npm ${args.join(" ")}" failed`);
    process.exit(res.status ?? 1);
  }
}

if (!existsSync(join(shell, "node_modules"))) {
  console.log("build-shell: installing apps/shell dependencies (npm ci)");
  run(["ci", "--no-audit", "--no-fund"]);
}

run(["run", "build"]);

if (!existsSync(join(dist, "index.html"))) {
  console.error("build-shell: apps/shell/dist/index.html missing after build");
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(dist, target, { recursive: true });

function size(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    total += statSync(p).isDirectory() ? size(p) : statSync(p).size;
  }
  return total;
}
console.log(`build-shell: copied dist -> apps/site/public/experience (${(size(target) / 1024).toFixed(0)} kB)`);
