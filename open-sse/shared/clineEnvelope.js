import { PROVIDERS } from "../providers/index.js";
import { resolveProviderAlias } from "../services/model.js";

/**
 * Unwrap Cline's non-stream envelope: {"success":true,"data":{...choices...}}.
 *
 * Scoped to providers opting in via `transport.quirks.clineEnvelope` so no other
 * provider's body is ever rewritten. The error envelope ({"success":false,...})
 * never matches and passes through untouched.
 *
 * @param {object} body - Parsed upstream response body
 * @param {string} provider - Provider id or alias
 * @returns {object} The inner `data` object, or `body` unchanged
 */
export function unwrapClineEnvelope(body, provider) {
  if (!body || typeof body !== "object") return body;
  const resolvedProvider = provider ? (resolveProviderAlias(provider) || provider) : null;
  const isCline = resolvedProvider === "cline" || resolvedProvider === "clinepass";
  const hasQuirk = isCline || Boolean(PROVIDERS[resolvedProvider]?.quirks?.clineEnvelope);

  if (!hasQuirk) return body;
  const { success, data } = body;
  if (success !== true || !data || typeof data !== "object" || Array.isArray(data)) return body;
  return data;
}
