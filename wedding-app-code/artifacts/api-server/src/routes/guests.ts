import { Router } from "express";
import { db } from "@workspace/db";
import { guestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/guests", async (req, res) => {
  try {
    const guests = await db.select().from(guestsTable).orderBy(guestsTable.name);
    res.json(guests);
  } catch (err) {
    req.log.error({ err }, "Failed to list guests");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/guests", async (req, res) => {
  try {
    const { name, email, phone, city, transportMode, groupId, dietaryReqs, notes } = req.body;
    const inserted = await db
      .insert(guestsTable)
      .values({ name, email, phone, city, transportMode, groupId, dietaryReqs, notes })
      .returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create guest");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/guests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(guestsTable).where(eq(guestsTable.id, id));
    if (rows.length === 0) {
      res.status(404).json({ error: "Guest not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get guest");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/guests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(guestsTable)
      .set(req.body)
      .where(eq(guestsTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Guest not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update guest");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/guests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(guestsTable).where(eq(guestsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete guest");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/guests/:id/checkin", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(guestsTable)
      .set({ checkedIn: true, checkedInAt: new Date().toISOString() })
      .where(eq(guestsTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Guest not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to check in guest");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/guests/:id/rsvp", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, dietaryReqs, notes } = req.body;
    const updated = await db
      .update(guestsTable)
      .set({ rsvpStatus: status, dietaryReqs, notes })
      .where(eq(guestsTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Guest not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to RSVP guest");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
