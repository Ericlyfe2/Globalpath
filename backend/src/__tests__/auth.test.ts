import { describe, it, expect } from "vitest";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(["student", "mentor", "employer"]).default("student"),
  country_of_origin: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

describe("Auth validation schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.parse({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
        role: "student",
      });
      expect(result.email).toBe("test@example.com");
      expect(result.full_name).toBe("Test User");
    });

    it("rejects short passwords", () => {
      expect(() =>
        registerSchema.parse({
          email: "test@example.com",
          password: "123",
          full_name: "Test User",
        }),
      ).toThrow();
    });

    it("rejects invalid email", () => {
      expect(() =>
        registerSchema.parse({
          email: "not-an-email",
          password: "password123",
          full_name: "Test User",
        }),
      ).toThrow();
    });

    it("rejects short names", () => {
      expect(() =>
        registerSchema.parse({
          email: "test@example.com",
          password: "password123",
          full_name: "A",
        }),
      ).toThrow();
    });

    it("defaults role to student", () => {
      const result = registerSchema.parse({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
      });
      expect(result.role).toBe("student");
    });

    it("accepts optional country_of_origin", () => {
      const result = registerSchema.parse({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
        country_of_origin: "Ghana",
      });
      expect(result.country_of_origin).toBe("Ghana");
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login data", () => {
      const result = loginSchema.parse({
        email: "test@example.com",
        password: "anypassword",
      });
      expect(result.email).toBe("test@example.com");
    });

    it("rejects invalid email", () => {
      expect(() =>
        loginSchema.parse({
          email: "invalid",
          password: "password",
        }),
      ).toThrow();
    });
  });
});
