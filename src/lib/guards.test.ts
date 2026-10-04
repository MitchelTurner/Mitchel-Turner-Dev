import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { languageShares } from "./languages.ts";
import { rateLimit } from "./rateLimit.ts";
import { safeHttpUrl } from "./safeUrl.ts";
import { isPublicLiveUrl, LIVE_URL_OVERRIDES, resolveLiveUrl } from "./liveUrls.ts";

describe("languageShares", () => {
  it("keeps rounded slices from exceeding 100%", () => {
    const shares = languageShares({ A: 336, B: 336, C: 328 });
    const sum = shares.reduce((total, share) => total + share.percent, 0);
    assert.ok(sum <= 100);
    assert.equal(shares.length, 3);
  });

  it("returns an empty list when there are no bytes", () => {
    assert.deepEqual(languageShares({}), []);
  });

  it("reports a single language as 100%", () => {
    assert.deepEqual(languageShares({ Python: 10 }), [{ name: "Python", percent: 100 }]);
  });
});

describe("safeHttpUrl", () => {
  it("allows https URLs and uploaded paths", () => {
    assert.equal(safeHttpUrl("https://example.com/demo"), "https://example.com/demo");
    assert.equal(safeHttpUrl("/uploads/cover.png"), "/uploads/cover.png");
  });

  it("rejects scriptable and protocol-relative URLs", () => {
    assert.equal(safeHttpUrl("javascript:alert(1)"), null);
    assert.equal(safeHttpUrl("data:text/html,hi"), null);
    assert.equal(safeHttpUrl("//evil.example/phish"), null);
    assert.equal(safeHttpUrl("/uploads/../../etc/passwd"), null);
  });
});

describe("isPublicLiveUrl", () => {
  it("drops hosting dashboards and keeps public sites", () => {
    assert.equal(isPublicLiveUrl("https://railway.com/project/abc"), false);
    assert.equal(isPublicLiveUrl("https://github.com/MitchelTurner/FlagShip"), false);
    assert.equal(isPublicLiveUrl("https://mitchelturner.dev"), true);
    assert.equal(isPublicLiveUrl("https://gyotaku.up.railway.app"), true);
  });

  it("points every live-demo override at a public site", () => {
    assert.ok(Object.keys(LIVE_URL_OVERRIDES).length > 5);
    for (const url of Object.values(LIVE_URL_OVERRIDES)) {
      assert.equal(isPublicLiveUrl(url), true, url);
    }
  });
});

describe("resolveLiveUrl", () => {
  it("prefers the public override over a Railway dashboard URL", () => {
    assert.equal(
      resolveLiveUrl({
        name: "Waterfowl",
        homepage: "https://railway.com/project/abc",
        pagesUrl: null,
        deployment: { url: "https://railway.com/project/abc" },
      }),
      "https://waterfowl.up.railway.app",
    );
  });

  it("accepts a GitHub homepage that has no scheme", () => {
    assert.equal(
      resolveLiveUrl({
        name: "NotInTheMap",
        homepage: "mitchelturner.com",
        pagesUrl: null,
        deployment: null,
      }),
      "https://mitchelturner.com",
    );
  });
});

describe("rateLimit", () => {
  it("blocks once the window is full", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    assert.equal(rateLimit(key, 2, 60_000), false);
    assert.equal(rateLimit(key, 2, 60_000), false);
    assert.equal(rateLimit(key, 2, 60_000), true);
  });
});
