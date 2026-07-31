// Vercel serverless adapter for TanStack Start (Fetch API → Node req/res)
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { join, resolve } from "node:path";

// The built server handler lives at dist/server/server.js relative to project root
const serverPath = resolve(process.cwd(), "dist/server/server.js");
const { default: handler } = await import(serverPath);

/**
 * Convert a Node IncomingMessage into a WHATWG Request.
 */
async function toRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? Readable.toWeb(req) : undefined;
  return new Request(url.toString(), { method: req.method, headers, body, duplex: "half" });
}

/**
 * Write a WHATWG Response into a Node ServerResponse.
 */
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

export default async function vercelHandler(req, res) {
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
