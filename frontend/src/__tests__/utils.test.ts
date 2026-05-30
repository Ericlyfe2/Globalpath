import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("resolves tailwind conflicts", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });
  });

  describe("formatCurrency", () => {
    it("formats USD by default", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1,234.56");
    });

    it("formats with specified currency", () => {
      const result = formatCurrency(500, "EUR");
      expect(result).toContain("500");
    });
  });

  describe("formatDate", () => {
    it("formats a date string", () => {
      const result = formatDate("2026-05-29");
      expect(result).toContain("May");
      expect(result).toContain("29");
      expect(result).toContain("2026");
    });
  });
});
