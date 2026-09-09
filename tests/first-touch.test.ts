/**
 * First-touch cookie payload — ported from ops-site's
 * src/lib/analytics/__tests__/first-touch.test.ts (node:test) so both writers
 * of the shared `.opsapp.co` cookie prove the same shape, plus the Google
 * click ids that try-ops must capture for paid traffic: gclid, gbraid, wbraid.
 */
import { describe, expect, it } from "vitest";
import {
  buildFirstTouchPayload,
  encodeFirstTouchPayload,
  FIRST_TOUCH_MAX_ENCODED_BYTES,
  parseFirstTouchValue,
  resolveFirstTouch,
} from "@/lib/analytics/first-touch";

const NOW = "2026-09-08T20:00:00.000Z";
const ANONYMOUS_ID = "11111111-1111-4111-8111-111111111111";

describe("buildFirstTouchPayload", () => {
  it("captures only allowlisted campaign fields, every Google click id, and a canonical landing path", () => {
    const touch = buildFirstTouchPayload({
      url:
        "https://try.opsapp.co/job-management?utm_source=google&utm_medium=cpc" +
        "&utm_campaign=jobber-alt&utm_content=rsa1&utm_term=jobber+alternative" +
        "&gclid=click-1&gbraid=brand-1&wbraid=web-1&fbclid=click-2&email=operator%40example.com",
      referrer: "https://www.google.com/search?q=private+query",
      capturedAt: NOW,
      anonymousId: ANONYMOUS_ID,
    });

    expect(touch).toEqual({
      version: 1,
      anonymous_id: ANONYMOUS_ID,
      captured_at: NOW,
      landing_path: "/job-management",
      referrer_domain: "google.com",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "jobber-alt",
      utm_content: "rsa1",
      utm_term: "jobber alternative",
      gclid: "click-1",
      gbraid: "brand-1",
      wbraid: "web-1",
      fbclid: "click-2",
    });
    expect(JSON.stringify(touch)).not.toMatch(/operator|private|email|q=/);
  });

  it("excludes OPS subdomains from referral classification", () => {
    const touch = buildFirstTouchPayload({
      url: "https://try.opsapp.co/",
      referrer: "https://app.opsapp.co/setup?company=private",
      capturedAt: NOW,
      anonymousId: ANONYMOUS_ID,
    });
    expect(touch?.referrer_domain).toBeUndefined();
  });

  it("round-trips the versioned payload and rejects invalid identities", () => {
    const touch = buildFirstTouchPayload({
      url: "https://try.opsapp.co/?gbraid=brand-1",
      referrer: "",
      capturedAt: NOW,
      anonymousId: ANONYMOUS_ID,
    });
    expect(touch).not.toBeNull();
    expect(parseFirstTouchValue(encodeFirstTouchPayload(touch!))).toEqual(touch);
    expect(
      buildFirstTouchPayload({ url: "https://try.opsapp.co/", referrer: "", capturedAt: NOW, anonymousId: "nope" })
    ).toBeNull();
    expect(parseFirstTouchValue("%7B%22anonymous_id%22%3A%22nope%22%7D")).toBeNull();
  });
});

describe("resolveFirstTouch", () => {
  it("migrates the active legacy payload without preserving raw URLs", () => {
    const legacy = encodeURIComponent(
      JSON.stringify({
        utm_source: "google",
        gclid: "legacy-click",
        landing_url: "/scheduling?email=owner%40example.com",
        first_touch_at: "2026-09-01T10:00:00.000Z",
      })
    );
    const decision = resolveFirstTouch({
      legacyValue: legacy,
      url: "https://try.opsapp.co/scheduling",
      referrer: "",
      capturedAt: NOW,
      anonymousId: ANONYMOUS_ID,
    });
    expect(decision.shouldWrite).toBe(true);
    expect(decision.payload).toEqual({
      version: 1,
      anonymous_id: ANONYMOUS_ID,
      captured_at: "2026-09-01T10:00:00.000Z",
      landing_path: "/scheduling",
      utm_source: "google",
      gclid: "legacy-click",
    });
  });

  it("preserves an existing canonical first touch", () => {
    const first = buildFirstTouchPayload({
      url: "https://try.opsapp.co/?gclid=first",
      referrer: "",
      capturedAt: "2026-09-01T10:00:00.000Z",
      anonymousId: ANONYMOUS_ID,
    })!;
    const decision = resolveFirstTouch({
      canonicalValue: encodeFirstTouchPayload(first),
      url: "https://try.opsapp.co/?gclid=second",
      referrer: "",
      capturedAt: NOW,
      anonymousId: "22222222-2222-4222-8222-222222222222",
    });
    expect(decision.shouldWrite).toBe(false);
    expect(decision.payload).toEqual(first);
  });
});

describe("encodeFirstTouchPayload", () => {
  it("bounds pathological campaign payloads below the browser cookie ceiling and keeps the click ids", () => {
    // Every field at its per-field cap overflows the 3,500-byte ceiling, so the
    // bounded payload must be rebuilt in priority order: click ids first.
    const touch = buildFirstTouchPayload({
      url:
        "https://try.opsapp.co/?" +
        ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
          .map((k) => `${k}=${k.slice(4, 5).repeat(300)}`)
          .join("&") +
        `&gclid=${"g".repeat(600)}&gbraid=${"b".repeat(600)}&wbraid=${"w".repeat(600)}&fbclid=${"f".repeat(600)}`,
      referrer: `https://${"r".repeat(240)}.example.com/`,
      capturedAt: NOW,
      anonymousId: ANONYMOUS_ID,
    })!;
    expect(encodeURIComponent(JSON.stringify(touch)).length).toBeGreaterThan(FIRST_TOUCH_MAX_ENCODED_BYTES);
    const encoded = encodeFirstTouchPayload(touch);
    expect(encoded.length).toBeLessThanOrEqual(FIRST_TOUCH_MAX_ENCODED_BYTES);
    const parsed = parseFirstTouchValue(encoded)!;
    expect(parsed.gclid).toBe("g".repeat(256));
    expect(parsed.gbraid).toBe("b".repeat(256));
    expect(parsed.wbraid).toBe("w".repeat(256));
  });
});
