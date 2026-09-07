// ============================================================================
// 发布辅助：更新本地 main（构建产物）并重建 gh-pages（站点静态根）分支。
// 用法：node scripts/publish-pages.mjs [--no-build]  [提交信息]
// 之后仍需手动推送（需要 GitHub 账号授权）：
//   git push -u origin main
//   git push origin gh-pages
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const noBuild = args.includes("--no-build");
const msg = args.filter((a) => a !== "--no-build").join(" ") || "chore(release): 更新官网产物与 Pages 分支";

function git(argv, cwd = root) {
  const r = spawnSync("git", argv, { encoding: "utf8", cwd, timeout: 120000, env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "Never" } });
  if (r.status !== 0) throw new Error("git " + argv.join(" ") + " 失败：\n" + (r.stderr || r.stdout || ""));
  return (r.stdout || "").trim();
}

if (!noBuild) {
  const b = spawnSync(process.execPath, ["scripts/build.mjs"], { encoding: "utf8", cwd: root, timeout: 120000 });
  if (b.status !== 0) throw new Error("build 失败：\n" + (b.stderr || b.stdout || ""));
  console.log("build 完成。");
}

// 1) main 提交（含 dist 更新）
const cur = git(["branch", "--show-current"]);
if (cur !== "main") git(["checkout", "main"]);
git(["add", "-A"]);
const changed = git(["status", "--porcelain"]);
if (changed) { git(["commit", "-m", msg]); console.log("main 已提交：" + msg); }
else console.log("main 无变更。");

// 2) 在临时目录重建 gh-pages，并把 ref 推回本地仓库
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ghpages-"));
try {
  git(["clone", "--no-hardlinks", "-q", root, tmp]);
  git(["checkout", "--orphan", "gh-pages"], tmp);
  git(["rm", "-rf", "-q", "."], tmp);
  const copyAll = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
      if (e.name === ".git") continue;
      const s = path.join(from, e.name), d = path.join(to, e.name);
      if (e.isDirectory()) copyAll(s, d); else fs.copyFileSync(s, d);
    }
  };
  copyAll(path.join(root, "dist"), tmp);
  fs.writeFileSync(path.join(tmp, "README.md"), "# ai-content-workbench-site (gh-pages)\n\nGitHub Pages 静态托管分支，由主分支 dist/ 产物生成（node scripts/build.mjs）。源码见 main 分支。\n", "utf8");
  git(["add", "-A"], tmp);
  git(["commit", "-m", "deploy(gh-pages): " + (changed ? msg : "同步 dist 产物")], tmp);
  git(["push", "--force", root, "gh-pages:gh-pages"], tmp);
  console.log("gh-pages 分支已更新。");
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* 忽略临时目录清理失败 */ }
}
console.log("\n请在你的终端执行推送（首次会弹出 GitHub 授权）：");
console.log("  git push -u origin main");
console.log("  git push origin gh-pages");
