import { Router } from "express";
import { z } from "zod";
import { query, queryOne } from "../db";
import { requireAuth } from "../middleware/auth";

export const contentRouter = Router();

// ===== Success stories =====
contentRouter.get("/stories", async (_req, res, next) => {
  try {
    const stories = await query(
      `SELECT * FROM success_stories ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ stories });
  } catch (err) { next(err); }
});

contentRouter.get("/stories/:id", async (req, res, next) => {
  try {
    const story = await queryOne(`SELECT * FROM success_stories WHERE id = $1`, [req.params.id]);
    if (!story) return res.status(404).json({ error: "Story not found" });
    const related = await query(
      `SELECT id, name, outcome FROM success_stories WHERE id != $1 ORDER BY created_at DESC LIMIT 3`,
      [req.params.id]
    );
    res.json({ story, related });
  } catch (err) { next(err); }
});

// ===== Notifications =====
contentRouter.get("/notifications", requireAuth, async (req, res, next) => {
  try {
    const notes = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.sub]
    );
    res.json({ notifications: notes });
  } catch (err) { next(err); }
});

contentRouter.post("/notifications/read", requireAuth, async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().uuid().optional() }).parse(req.body);
    if (id) {
      await query(`UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`, [id, req.user!.sub]);
    } else {
      await query(`UPDATE notifications SET read = TRUE WHERE user_id = $1`, [req.user!.sub]);
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ===== Saved / bookmarked items =====
const saveSchema = z.object({
  item_type: z.enum(["opportunity", "housing", "job"]),
  item_id: z.string().uuid(),
});

contentRouter.get("/saved", requireAuth, async (req, res, next) => {
  try {
    const items = await query(
      `SELECT * FROM saved_items WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user!.sub]
    );
    res.json({ saved: items });
  } catch (err) { next(err); }
});

contentRouter.post("/saved", requireAuth, async (req, res, next) => {
  try {
    const b = saveSchema.parse(req.body);
    const item = await queryOne(
      `INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, item_type, item_id) DO NOTHING RETURNING *`,
      [req.user!.sub, b.item_type, b.item_id]
    );
    res.json({ saved: item, ok: true });
  } catch (err) { next(err); }
});

contentRouter.delete("/saved", requireAuth, async (req, res, next) => {
  try {
    const b = saveSchema.parse(req.body);
    await query(
      `DELETE FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
      [req.user!.sub, b.item_type, b.item_id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ===== Mentor bookings =====
const bookingSchema = z.object({
  mentor_id: z.string().uuid(),
  slot_date: z.string(),
  slot_time: z.string(),
  duration_min: z.number().int().optional(),
  goal: z.string().optional(),
});

contentRouter.get("/bookings", requireAuth, async (req, res, next) => {
  try {
    const bookings = await query(
      `SELECT b.*, m.full_name AS mentor_name FROM mentor_bookings b
       JOIN users m ON m.id = b.mentor_id
       WHERE b.student_id = $1 ORDER BY b.slot_date ASC`,
      [req.user!.sub]
    );
    res.json({ bookings });
  } catch (err) { next(err); }
});

contentRouter.post("/bookings", requireAuth, async (req, res, next) => {
  try {
    const b = bookingSchema.parse(req.body);
    // Only let students book real mentors (stops bookings + notification spam to arbitrary user IDs).
    const mentor = await queryOne<{ id: string }>(
      `SELECT id FROM users WHERE id = $1 AND role = 'mentor'`,
      [b.mentor_id]
    );
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    const booking = await queryOne(
      `INSERT INTO mentor_bookings (mentor_id, student_id, slot_date, slot_time, duration_min, goal)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [b.mentor_id, req.user!.sub, b.slot_date, b.slot_time, b.duration_min ?? 30, b.goal]
    );
    // Notify the mentor
    await query(
      `INSERT INTO notifications (user_id, kind, title, body, href)
       VALUES ($1, 'message', 'New mentorship booking', $2, '/messages')`,
      [b.mentor_id, `A student booked a ${b.duration_min ?? 30}-min session on ${b.slot_date} at ${b.slot_time}.`]
    );
    res.json({ booking });
  } catch (err) { next(err); }
});
