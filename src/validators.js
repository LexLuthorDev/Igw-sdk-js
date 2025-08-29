/* ===================== src/validators.js ===================== */
function ensureString(val, name) {
if (typeof val !== "string" || !val.trim()) {
throw new Error(`${name} deve ser string não vazia`);
}
}
function ensurePositiveInt(val, name) {
if (!Number.isInteger(val) || val <= 0) {
throw new Error(`${name} deve ser inteiro positivo (centavos)`);
}
}
export const v = {
user_code: (x) => ensureString(x, "user_code"),
amount: (x) => ensurePositiveInt(x, "amount"),
provider_code: (x) => ensureString(x, "provider_code"),
lang: (x) => ensureString(x, "lang"),
};