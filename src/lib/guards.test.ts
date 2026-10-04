import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { languageShares } from "./languages.ts";
import { rateLimit } from "./rateLimit.ts";
import { safeHttpUrl } from "./safeUrl.ts";
import { isPublicLiveUrl } from "./liveUrls.ts";

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
