import { Router } from "express";
import { query, queryOne } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function sanitizeObject(obj: Record<string, unknown>, allowed: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of allowed) {
    const v = obj[k];
    if (v !== undefined) {
      out[k] = typeof v === "string" ? sanitize(v) : v;
    }
  }
  return out;
}

export const usersRouter = Router();

usersRouter.get("/mentors", async (_req, res, next) => {
  try {
    const mentors = await query(
      `SELECT u.id, u.full_name, u.avatar_url, u.country_of_residence, u.country_of_origin,
              u.bio, u.trust_score, mp.expertise_areas, mp.years_abroad, mp.languages_spoken
       FROM users u
       JOIN mentor_profiles mp ON mp.user_id = u.id
       WHERE u.role = 'mentor' AND u.verification_status = 'verified'
         AND mp.available_for_mentoring = TRUE
       ORDER BY u.trust_score DESC
       LIMIT 50`
    );
    res.json({ mentors });
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await queryOne(
      `SELECT id, full_name, avatar_url, role, country_of_origin, country_of_residence,
              bio, trust_score, verification_status
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const allowed = ["full_name", "bio", "country_of_residence", "avatar_url", "preferred_language"];
    const safe = sanitizeObject(req.body, allowed);
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const k of allowed) {
      if (safe[k] !== undefined) {
        updates.push(`${k} = $${i++}`);
        values.push(safe[k]);
      }
    }
    if (!updates.length) return res.json({ ok: true });
    values.push(req.user!.sub);
    const user = await queryOne(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${i}
       RETURNING id, email, full_name, role, country_of_origin, country_of_residence,
                 avatar_url, bio, trust_score, verification_status, preferred_language`,
      values
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/:id/verify", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    await query(`UPDATE users SET verification_status = 'verified' WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
