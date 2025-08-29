/* ===================== src/errors.js ===================== */
class ApiError extends Error {
  constructor(message, code, meta) {
    super(message || code || "API_ERROR");
    this.name = this.constructor.name;
    this.code = code || "API_ERROR";
    this.meta = meta || null;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

const map = {
  INVALID_METHOD: class InvalidMethodError extends ApiError {},
  INVALID_PARAMETER: class InvalidParameterError extends ApiError {},
  INVALID_AGENT: class InvalidAgentError extends ApiError {},
  INVALID_AGENT_ROLE: class InvalidAgentRoleError extends ApiError {},
  BLOCKED_AGENT: class BlockedAgentError extends ApiError {},
  INVALID_USER: class InvalidUserError extends ApiError {},
  MAX_DEMO_USER: class MaxDemoUserError extends ApiError {},
  INSUFFICIENT_AGENT_FUNDS: class InsufficientAgentFundsError extends ApiError {},
  INSUFFICIENT_USER_FUNDS: class InsufficientUserFundsError extends ApiError {},
  DUPLICATED_USER: class DuplicatedUserError extends ApiError {},
  INVALID_PROVIDER: class InvalidProviderError extends ApiError {},
  INTERNAL_ERROR: class InternalServerError extends ApiError {},
  EXTERNAL_ERROR: class ExternalServerError extends ApiError {},
  API_CHECKING: class ApiCheckingError extends ApiError {},
  AGENT_SEAMLESS: class AgentSeamlessError extends ApiError {},
};

function fromApi(msg, meta) {
  const Code = map[msg] || ApiError;
  const friendly = msg || "API_ERROR";
  return new Code(friendly, msg, meta);
}

export { ApiError, fromApi };
