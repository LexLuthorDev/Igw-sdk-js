/* ===================== src/time.js ===================== */
// Converte Date|string|number para "YYYY-MM-DD HH:mm:ss" em UTC
export function toApiDateTime(input) {
const d = input instanceof Date ? input : new Date(input);
if (Number.isNaN(d.getTime())) {
throw new Error("Data inválida para getGameLog");
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