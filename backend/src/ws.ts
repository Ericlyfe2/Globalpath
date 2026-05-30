import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { redis } from "./db";

type Client = WebSocket & { userId?: string };
const clients = new Map<string, Set<Client>>();

export function initWebsocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (raw, req) => {
    const ws = raw as Client;
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Missing token");
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
      ws.userId = payload.sub;
      addClient(payload.sub, ws);
    } catch {
      ws.close(1008, "Invalid token");
      return;
    }

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
      } catch {
        /* ignore */
      }
    });

    ws.on("close", () => {
      if (ws.userId) removeClient(ws.userId, ws);
    });
  });

  // Redis pub/sub is optional — only wire up broadcast bridge if Redis available
  if (redis) {
    const sub = redis.duplicate();
    sub.subscribe("ws:broadcast");
    sub.on("message", (_channel, raw) => {
      try {
        const { userIds, payload } = JSON.parse(raw);
        for (const id of userIds) {
          const set = clients.get(id);
          if (!set) continue;
          for (const c of set) {
            if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(payload));
          }
        }
      } catch {
        /* ignore */
      }
    });
    console.log("🔌 WebSocket server initialized on /ws (with Redis pub/sub)");
  } else {
    console.log("🔌 WebSocket server initialized on /ws (single-instance mode, no Redis)");
  }
}

function addClient(userId: string, ws: Client) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(ws);
}

function removeClient(userId: string, ws: Client) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(ws);
  if (!set.size) clients.delete(userId);
}

/**
 * Notify users via WebSocket. Uses Redis pub/sub if available (for multi-instance),
 * otherwise pushes directly to local clients only.
 */
export async function notifyUsers(userIds: string[], payload: unknown) {
  if (redis) {
    await redis.publish("ws:broadcast", JSON.stringify({ userIds, payload }));
    return;
  }
  // Fallback: direct local push
  for (const id of userIds) {
    const set = clients.get(id);
    if (!set) continue;
    for (const c of set) {
      if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(payload));
    }
  }
}
