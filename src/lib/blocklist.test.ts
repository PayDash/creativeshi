import { describe, it, expect } from "vitest";
import { shouldBlock } from "./blocklist";

describe("shouldBlock", () => {
  it("blocks a name that contains a blocklist entry", () => {
    expect(shouldBlock("20-okt-1947-hartal-se-malaya-2", ["20-okt-1947-hartal-se-malaya-2"])).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(shouldBlock("Secret-Project", ["secret-project"])).toBe(true);
    expect(shouldBlock("my-Secret-stuff", ["SECRET"])).toBe(true);
  });

  it("passes names that are not on the blocklist", () => {
    expect(shouldBlock("creativeshi", ["20-okt-1947-hartal-se-malaya-2"])).toBe(false);
  });

  it("never blocks anything with an empty blocklist", () => {
    expect(shouldBlock("anything", [])).toBe(false);
  });
});
