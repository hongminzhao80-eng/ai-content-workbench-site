// ============================================================================
// 本地静态预览服务（零依赖）。用法：
//   node scripts/serve.mjs [端口]   （默认 8630，可用环境变量 PORT 覆盖）
// ============================================================================
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || process.argv[2] || 8630);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2"
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]).replace(/\\/g, "/");
  let rel = urlPath.replace(/^\/+/, "");
  if (!rel || rel === ".") rel = "index.html";
  else if (rel.endsWith("/")) rel += "index.html";
  const filePath = path.resolve(dist, rel);
  // 防目录穿越
  if (!filePath.startsWith(dist)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (!err) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(data);
      return;
    }
    // SPA/静态友好：HTML 请求回退 404.html
    fs.readFile(path.join(dist, "404.html"), (err2, nf) => {
      if (!err2) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(nf);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found");
      }
    });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("静态预览已启动： http://127.0.0.1:" + port + "/  （目录：dist/）");
  console.log("停止服务：Ctrl+C");
});
