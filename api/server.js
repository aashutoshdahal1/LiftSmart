import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "..", "dist", "server", "server.js");
const { default: handler } = await import(serverPath);

async function toRequest(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url = new URL(req.url, `${proto}://${host}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? Readable.toWeb(req) : undefined;
  return new Request(url.toString(), { method: req.method, headers, ...(body ? { body, duplex: "half" } : {}) });
}

async function sendResponse(webRes, res) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  if (webRes.body) {
    for await (const chunk of webRes.body) {
      res.write(chunk);
    }
  }
  res.end();
}

export default async function handler_(req, res) {
  try {
    const request = await toRequest(req);
    const response = await handler.fetch(request);
    await sendResponse(response, res);
  } catch (err) {
    console.error("[vercel-adapter]", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
