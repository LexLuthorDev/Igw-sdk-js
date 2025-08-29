var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/errors.js
var errors_exports = {};
__export(errors_exports, {
  ApiError: () => ApiError,
  fromApi: () => fromApi
});
var ApiError = class extends Error {
  constructor(message, code, meta) {
    super(message || code || "API_ERROR");
    this.name = this.constructor.name;
    this.code = code || "API_ERROR";
    this.meta = meta || null;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var map = {
  INVALID_METHOD: class InvalidMethodError extends ApiError {
  },
  INVALID_PARAMETER: class InvalidParameterError extends ApiError {
  },
  INVALID_AGENT: class InvalidAgentError extends ApiError {
  },
  INVALID_AGENT_ROLE: class InvalidAgentRoleError extends ApiError {
  },
  BLOCKED_AGENT: class BlockedAgentError extends ApiError {
  },
  INVALID_USER: class InvalidUserError extends ApiError {
  },
  MAX_DEMO_USER: class MaxDemoUserError extends ApiError {
  },
  INSUFFICIENT_AGENT_FUNDS: class InsufficientAgentFundsError extends ApiError {
  },
  INSUFFICIENT_USER_FUNDS: class InsufficientUserFundsError extends ApiError {
  },
  DUPLICATED_USER: class DuplicatedUserError extends ApiError {
  },
  INVALID_PROVIDER: class InvalidProviderError extends ApiError {
  },
  INTERNAL_ERROR: class InternalServerError extends ApiError {
  },
  EXTERNAL_ERROR: class ExternalServerError extends ApiError {
  },
  API_CHECKING: class ApiCheckingError extends ApiError {
  },
  AGENT_SEAMLESS: class AgentSeamlessError extends ApiError {
  }
};
function fromApi(msg, meta) {
  const Code = map[msg] || ApiError;
  const friendly = msg || "API_ERROR";
  return new Code(friendly, msg, meta);
}

// src/transport.js
function redactToken(token) {
  if (!token || typeof token !== "string") return "<hidden>";
  const tail = token.slice(-4);
  return `***${tail}`;
}
function createTransport({
  baseURL,
  timeoutMs,
  logger,
  agentCode,
  agentToken
}) {
  const url = baseURL || "https://igamewin.com/api/v1";
  const timeout = Number.isInteger(timeoutMs) ? timeoutMs : 12e3;
  const log = logger && typeof logger.info === "function" ? logger : null;
  async function post(method, payload) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeout);
    const body = {
      method,
      agent_code: agentCode,
      agent_token: agentToken,
      ...payload
    };
    try {
      log?.debug?.(`[IGW] \u2192 ${method}`, {
        url,
        agent_code: agentCode,
        agent_token: redactToken(agentToken)
      });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (_) {
        throw new Error(`Resposta n\xE3o-JSON (${res.status})`);
      }
      log?.debug?.(`[IGW] \u2190 ${method}`, { status: res.status, json });
      if (json && json.status === 0) {
        const code = json.msg || json.error || "API_ERROR";
        throw fromApi(code, { httpStatus: res.status, response: json });
      }
      return json;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Requisi\xE7\xE3o abortada por timeout");
      }
      throw err;
    } finally {
      clearTimeout(to);
    }
  }
  return { post };
}

// src/validators.js
function ensureString(val, name) {
  if (typeof val !== "string" || !val.trim()) {
    throw new Error(`${name} deve ser string n\xE3o vazia`);
  }
}
function ensurePositiveInt(val, name) {
  if (!Number.isInteger(val) || val <= 0) {
    throw new Error(`${name} deve ser inteiro positivo (centavos)`);
  }
}
var v = {
  user_code: (x) => ensureString(x, "user_code"),
  amount: (x) => ensurePositiveInt(x, "amount"),
  provider_code: (x) => ensureString(x, "provider_code"),
  lang: (x) => ensureString(x, "lang")
};

// src/time.js
function toApiDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Data inv\xE1lida para getGameLog");
  }
  const pad = (n) => String(n).padStart(2, "0");
  const YYYY = d.getUTCFullYear();
  const MM = pad(d.getUTCMonth() + 1);
  const DD = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

// src/client.js
function createClient({ agentCode, agentToken, baseURL, timeoutMs, logger } = {}) {
  if (!agentCode || !agentToken) {
    throw new Error("agentCode e agentToken s\xE3o obrigat\xF3rios");
  }
  const http = createTransport({ baseURL, timeoutMs, logger, agentCode, agentToken });
  return {
    /** Escape hatch: envia qualquer método bruto. */
    async raw(method, payload) {
      if (!method) throw new Error("method \xE9 obrigat\xF3rio");
      return http.post(method, payload || {});
    },
    /* ========== Transfer API ========== */
    async createUser({ user_code, is_demo } = {}) {
      v.user_code(user_code);
      const payload = { user_code };
      if (typeof is_demo === "boolean") payload.is_demo = is_demo;
      return http.post("user_create", payload);
    },
    async deposit({ user_code, amount } = {}) {
      v.user_code(user_code);
      v.amount(amount);
      return http.post("user_deposit", { user_code, amount });
    },
    async withdraw({ user_code, amount } = {}) {
      v.user_code(user_code);
      v.amount(amount);
      return http.post("user_withdraw", { user_code, amount });
    },
    async resetUserBalance({ user_code } = {}) {
      v.user_code(user_code);
      return http.post("user_withdraw_reset", { user_code });
    },
    async resetAllUsersBalance() {
      return http.post("user_withdraw_reset", { all_users: true });
    },
    async setDemo({ user_code } = {}) {
      v.user_code(user_code);
      return http.post("set_demo", { user_code });
    },
    /* ========== Games / Providers ========== */
    async launchGame({ user_code, provider_code, game_code, lang } = {}) {
      v.user_code(user_code);
      v.provider_code(provider_code);
      const payload = { user_code, provider_code };
      if (game_code) payload.game_code = game_code;
      if (lang) payload.lang = lang;
      return http.post("game_launch", payload);
    },
    async providerList() {
      return http.post("provider_list", {});
    },
    async gameList({ provider_code } = {}) {
      v.provider_code(provider_code);
      return http.post("game_list", { provider_code });
    },
    /* ========== Money / Histórico ========== */
    async moneyInfo() {
      return http.post("money_info", {});
    },
    async moneyInfoForUser({ user_code } = {}) {
      v.user_code(user_code);
      return http.post("money_info", { user_code });
    },
    async moneyInfoAllUsers() {
      return http.post("money_info", { all_users: true });
    },
    async getGameLog({ user_code, game_type, start, end, page, perPage } = {}) {
      v.user_code(user_code);
      if (typeof game_type !== "string" || !game_type) throw new Error("game_type \xE9 obrigat\xF3rio");
      if (!start || !end) throw new Error("start e end s\xE3o obrigat\xF3rios");
      const payload = {
        user_code,
        game_type,
        start: typeof start === "string" ? start : toApiDateTime(start),
        end: typeof end === "string" ? end : toApiDateTime(end)
      };
      if (Number.isInteger(page)) payload.page = page;
      if (Number.isInteger(perPage)) payload.perPage = perPage;
      return http.post("get_game_log", payload);
    }
  };
}
export {
  errors_exports as IGWErrors,
  createClient
};
