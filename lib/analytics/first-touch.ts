/**
 * Shared first-touch cookie writer — a verbatim copy of ops-site's
 * src/lib/analytics/first-touch.ts (Unified Attribution P2) plus the two
 * Google click ids that arrive without gclid (gbraid on iOS app-to-web,
 * wbraid on iOS web-to-web). Both writers of the `.opsapp.co` cookie must
 * agree on this shape byte for byte: app.opsapp.co/register reads it at the
 * company step and hands it to trial_attributions.
 */
export const FIRST_TOUCH_COOKIE_NAME = '__ops_first_touch';
export const LEGACY_ATTRIBUTION_COOKIE_NAME = 'ops_attribution';
export const FIRST_TOUCH_VERSION = 1 as const;
export const FIRST_TOUCH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const FIRST_TOUCH_MAX_ENCODED_BYTES = 3500;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CAMPAIGN_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;
const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid'] as const;

export interface FirstTouchPayload {
  version: typeof FIRST_TOUCH_VERSION;
  anonymous_id: string;
  captured_at: string;
  landing_path: string;
  referrer_domain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
}

interface BuildFirstTouchInput {
  url: string;
  referrer: string;
  capturedAt: string;
  anonymousId: string;
}

interface ParseFirstTouchOptions {
  legacyAnonymousId?: string;
}

interface ResolveFirstTouchInput extends BuildFirstTouchInput {
  canonicalValue?: string;
  legacyValue?: string;
}

export interface FirstTouchDecision {
  payload: FirstTouchPayload | null;
  shouldWrite: boolean;
}

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\ud800-\udfff]/g, '')
    .trim()
    .slice(0, maxLength);
  return cleaned || undefined;
}

function canonicalPath(value: unknown): string | null {
  const text = cleanText(value, 2048);
  if (!text) return null;
  try {
    const url = new URL(text, 'https://opsapp.co');
    return url.pathname.startsWith('/') ? url.pathname : null;
  } catch {
    return null;
  }
}

function canonicalTimestamp(value: unknown): string | null {
  const text = cleanText(value, 64);
  if (!text) return null;
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
}

function isOpsDomain(hostname: string): boolean {
  return hostname === 'opsapp.co' || hostname.endsWith('.opsapp.co');
}

export function canonicalReferrerDomain(value: unknown): string | undefined {
  const text = cleanText(value, 2048);
  if (!text) return undefined;
  try {
    const hostname = new URL(text).hostname.toLowerCase().replace(/^www\./, '');
    if (!hostname || isOpsDomain(hostname)) return undefined;
    return hostname.slice(0, 253);
  } catch {
    return undefined;
  }
}

function decodePayload(rawValue: string): string | null {
  let current = rawValue;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const trimmed = current.trim();
    if (trimmed.startsWith('{')) return trimmed;
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) return null;
      current = decoded;
    } catch {
      return null;
    }
  }
  return null;
}

export function parseFirstTouchValue(
  rawValue: string,
  options: ParseFirstTouchOptions = {},
): FirstTouchPayload | null {
  try {
    const decoded = decodePayload(rawValue);
    if (!decoded) return null;
    const unknownPayload: unknown = JSON.parse(decoded);
    if (
      !unknownPayload ||
      typeof unknownPayload !== 'object' ||
      Array.isArray(unknownPayload)
    ) {
      return null;
    }
    const payload = unknownPayload as Record<string, unknown>;
    const anonymousId = cleanText(
      payload.anonymous_id ?? options.legacyAnonymousId,
      36,
    );
    if (!anonymousId || !UUID_PATTERN.test(anonymousId)) return null;

    const capturedAt = canonicalTimestamp(
      payload.captured_at ?? payload.first_touch_at,
    );
    const landingPath = canonicalPath(
      payload.landing_path ?? payload.landing_url,
    );
    if (!capturedAt || !landingPath) return null;

    const parsed: FirstTouchPayload = {
      version: FIRST_TOUCH_VERSION,
      anonymous_id: anonymousId,
      captured_at: capturedAt,
      landing_path: landingPath,
    };
    const referrerDomain = cleanText(payload.referrer_domain, 253)
      ?.toLowerCase()
      .replace(/^www\./, '');
    const canonicalDomain = referrerDomain && !isOpsDomain(referrerDomain)
      ? referrerDomain
      : canonicalReferrerDomain(payload.referrer);
    if (canonicalDomain) parsed.referrer_domain = canonicalDomain;

    for (const key of CAMPAIGN_KEYS) {
      const value = cleanText(payload[key], 256);
      if (value) parsed[key] = value;
    }
    for (const key of CLICK_ID_KEYS) {
      const value = cleanText(payload[key], 512);
      if (value) parsed[key] = value;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function buildFirstTouchPayload(
  input: BuildFirstTouchInput,
): FirstTouchPayload | null {
  if (!UUID_PATTERN.test(input.anonymousId)) return null;
  const capturedAt = canonicalTimestamp(input.capturedAt);
  if (!capturedAt) return null;

  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    return null;
  }

  const payload: FirstTouchPayload = {
    version: FIRST_TOUCH_VERSION,
    anonymous_id: input.anonymousId,
    captured_at: capturedAt,
    landing_path: url.pathname,
  };
  const referrerDomain = canonicalReferrerDomain(input.referrer);
  if (referrerDomain) payload.referrer_domain = referrerDomain;

  for (const key of CAMPAIGN_KEYS) {
    const value = cleanText(url.searchParams.get(key), 256);
    if (value) payload[key] = value;
  }
  for (const key of CLICK_ID_KEYS) {
    const value = cleanText(url.searchParams.get(key), 512);
    if (value) payload[key] = value;
  }
  return payload;
}

function encodedPayloadLength(payload: FirstTouchPayload): number {
  return encodeURIComponent(JSON.stringify(payload)).length;
}

function cookieSafePayload(payload: FirstTouchPayload): FirstTouchPayload {
  if (encodedPayloadLength(payload) <= FIRST_TOUCH_MAX_ENCODED_BYTES) {
    return payload;
  }

  const bounded: FirstTouchPayload = {
    version: payload.version,
    anonymous_id: payload.anonymous_id,
    captured_at: payload.captured_at,
    landing_path: payload.landing_path.slice(0, 256),
  };
  const prioritized = [
    ['gclid', 256],
    ['gbraid', 256],
    ['wbraid', 256],
    ['fbclid', 256],
    ['utm_source', 128],
    ['utm_medium', 128],
    ['utm_campaign', 128],
    ['referrer_domain', 253],
    ['utm_content', 96],
    ['utm_term', 96],
  ] as const;

  for (const [key, maxLength] of prioritized) {
    const value = payload[key]?.slice(0, maxLength);
    if (!value) continue;
    const candidate = { ...bounded, [key]: value };
    if (encodedPayloadLength(candidate) <= FIRST_TOUCH_MAX_ENCODED_BYTES) {
      bounded[key] = value;
    }
  }
  return bounded;
}

export function serializeFirstTouchPayload(payload: FirstTouchPayload): string {
  return JSON.stringify(cookieSafePayload(payload));
}

export function encodeFirstTouchPayload(payload: FirstTouchPayload): string {
  return encodeURIComponent(serializeFirstTouchPayload(payload));
}

export function resolveFirstTouch(
  input: ResolveFirstTouchInput,
): FirstTouchDecision {
  if (input.canonicalValue) {
    const canonical = parseFirstTouchValue(input.canonicalValue);
    if (canonical) return { payload: canonical, shouldWrite: false };
  }

  if (input.legacyValue) {
    const migrated = parseFirstTouchValue(input.legacyValue, {
      legacyAnonymousId: input.anonymousId,
    });
    if (migrated) return { payload: migrated, shouldWrite: true };
  }

  return {
    payload: buildFirstTouchPayload(input),
    shouldWrite: true,
  };
}

function browserCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    const equalsAt = trimmed.indexOf('=');
    if (equalsAt < 0 || trimmed.slice(0, equalsAt) !== name) continue;
    return trimmed.slice(equalsAt + 1);
  }
  return undefined;
}

export function captureFirstTouchOnClient(): FirstTouchPayload | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  const decision = resolveFirstTouch({
    canonicalValue: browserCookieValue(FIRST_TOUCH_COOKIE_NAME),
    legacyValue: browserCookieValue(LEGACY_ATTRIBUTION_COOKIE_NAME),
    url: window.location.href,
    referrer: document.referrer,
    capturedAt: new Date().toISOString(),
    anonymousId: crypto.randomUUID(),
  });
  if (!decision.shouldWrite || !decision.payload) return decision.payload;

  const isOpsProductionHost =
    window.location.hostname === 'opsapp.co' ||
    window.location.hostname.endsWith('.opsapp.co');
  const domain = isOpsProductionHost ? '; Domain=.opsapp.co' : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${FIRST_TOUCH_COOKIE_NAME}=${encodeFirstTouchPayload(decision.payload)}` +
    `; Path=/; Max-Age=${FIRST_TOUCH_MAX_AGE_SECONDS}; SameSite=Lax` +
    domain +
    secure;
  return decision.payload;
}
