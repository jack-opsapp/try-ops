/**
 * try-ops middleware: the A/B variant cookie it always set, plus the shared
 * `__ops_first_touch` cookie on `.opsapp.co` so a paid click's Google id
 * survives to app.opsapp.co/register, where the company step reads it.
 */
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "@/middleware";

function setCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

describe("middleware first-touch cookie", async () => {
  it("writes the shared first-touch cookie on .opsapp.co with the Google click id", async () => {
    const request = new NextRequest(
      "https://try.opsapp.co/?gclid=abc&utm_source=google&utm_medium=cpc",
      { headers: { referer: "https://www.google.com/" } }
    );
    const response = await middleware(request);
    const cookies = setCookies(response);
    const firstTouch = cookies.find((c) => c.startsWith("__ops_first_touch="));
    expect(firstTouch).toBeDefined();
    expect(firstTouch).toMatch(/Domain=\.opsapp\.co/i);
    expect(firstTouch).toMatch(/Max-Age=2592000/i);
    expect(firstTouch).toMatch(/SameSite=lax/i);
    expect(firstTouch).toMatch(/Path=\//i);
    expect(firstTouch).toMatch(/Secure/i);
    expect(firstTouch).not.toMatch(/HttpOnly/i);

    const value = decodeURIComponent(firstTouch!.split(";")[0].slice("__ops_first_touch=".length));
    const payload = JSON.parse(value);
    expect(payload).toMatchObject({
      version: 1,
      landing_path: "/",
      referrer_domain: "google.com",
      utm_source: "google",
      utm_medium: "cpc",
      gclid: "abc",
    });
    expect(payload.anonymous_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("captures gbraid and wbraid the same way", async () => {
    const response = await middleware(new NextRequest("https://try.opsapp.co/scheduling?gbraid=gb1&wbraid=wb1"));
    const firstTouch = setCookies(response).find((c) => c.startsWith("__ops_first_touch="))!;
    const payload = JSON.parse(decodeURIComponent(firstTouch.split(";")[0].slice("__ops_first_touch=".length)));
    expect(payload).toMatchObject({ landing_path: "/scheduling", gbraid: "gb1", wbraid: "wb1" });
  });

  it("does not rewrite an existing first touch", async () => {
    const first = await middleware(new NextRequest("https://try.opsapp.co/?gclid=first"));
    const firstCookie = setCookies(first).find((c) => c.startsWith("__ops_first_touch="))!;
    const value = firstCookie.split(";")[0].slice("__ops_first_touch=".length);
    const second = await middleware(
      new NextRequest("https://try.opsapp.co/?gclid=second", {
        headers: { cookie: `__ops_first_touch=${value}; ops_variant=a` },
      })
    );
    expect(setCookies(second).find((c) => c.startsWith("__ops_first_touch="))).toBeUndefined();
  });

  it("omits the dotted domain outside opsapp.co so localhost keeps working", async () => {
    const response = await middleware(new NextRequest("http://localhost:3000/?gclid=abc"));
    const firstTouch = setCookies(response).find((c) => c.startsWith("__ops_first_touch="))!;
    expect(firstTouch).toBeDefined();
    expect(firstTouch).not.toMatch(/Domain=/i);
    expect(firstTouch).not.toMatch(/Secure/i);
  });

  it("keeps the A/B variant cookie behaviour", async () => {
    const response = await middleware(new NextRequest("https://try.opsapp.co/?variant=b"));
    const variant = setCookies(response).find((c) => c.startsWith("ops_variant="));
    expect(variant).toMatch(/^ops_variant=b;/);
  });

  it("matches the paid landing paths on day one", async () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(["/", "/job-management", "/compare/:path*", "/for/:path*"])
    );
  });

  it("no longer matches the two pages measured demand killed", async () => {
    // /scheduling and /quotes-invoices were planned before the keyword pull.
    // Every term behind them has zero volume, so neither page nor ad group
    // exists and the matcher should not claim otherwise.
    expect(config.matcher).not.toContain("/scheduling");
    expect(config.matcher).not.toContain("/quotes-invoices");
  });
});
