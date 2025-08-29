/* ===================== src/client.js ===================== */
import { createTransport } from "./transport.js";
import { v } from "./validators.js";
import { toApiDateTime } from "./time.js";

export function createClient({ agentCode, agentToken, baseURL, timeoutMs, logger } = {}) {
  if (!agentCode || !agentToken) {
    throw new Error("agentCode e agentToken são obrigatórios");
  }
  const http = createTransport({ baseURL, timeoutMs, logger, agentCode, agentToken });

  return {
    /** Escape hatch: envia qualquer método bruto. */
    async raw(method, payload) {
      if (!method) throw new Error("method é obrigatório");
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
      v.user_code(user_code); v.amount(amount);
      return http.post("user_deposit", { user_code, amount });
    },

    async withdraw({ user_code, amount } = {}) {
      v.user_code(user_code); v.amount(amount);
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
      v.user_code(user_code); v.provider_code(provider_code);
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
      return http.post("money_info", {}); // agent apenas
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
      if (typeof game_type !== "string" || !game_type) throw new Error("game_type é obrigatório");
      if (!start || !end) throw new Error("start e end são obrigatórios");
      const payload = {
        user_code,
        game_type,
        start: typeof start === "string" ? start : toApiDateTime(start),
        end: typeof end === "string" ? end : toApiDateTime(end),
      };
      if (Number.isInteger(page)) payload.page = page;
      if (Number.isInteger(perPage)) payload.perPage = perPage;
      return http.post("get_game_log", payload);
    },
  };
}