/* ===================== src/transport.js ===================== */
import { fromApi } from "./errors.js";

function redactToken(token) {
  if (!token || typeof token !== "string") return "<hidden>";
  const tail = token.slice(-4);
  return `***${tail}`;
}

export function createTransport({
  baseURL,
  timeoutMs,
  logger,
  agentCode,
  agentToken,
}) {
  const url = baseURL || "https://igamewin.com/api/v1";
  const timeout = Number.isInteger(timeoutMs) ? timeoutMs : 12000;
  const log = logger && typeof logger.info === "function" ? logger : null;

  async function post(method, payload) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeout);
    const body = {
      method,
      agent_code: agentCode,
      agent_token: agentToken,
      ...payload,
    };

    try {
      log?.debug?.(`[IGW] → ${method}`, {
        url,
        agent_code: agentCode,
        agent_token: redactToken(agentToken),
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (_) {
        throw new Error(`Resposta não-JSON (${res.status})`);
      }

      log?.debug?.(`[IGW] ← ${method}`, { status: res.status, json });

      // A doc usa { status: 1|0, msg: "..." }
      if (json && json.status === 0) {
        const code = json.msg || json.error || "API_ERROR";
        throw fromApi(code, { httpStatus: res.status, response: json });
      }
      return json;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Requisição abortada por timeout");
      }
      throw err;
    } finally {
      clearTimeout(to);
    }
  }

  return { post };
}
