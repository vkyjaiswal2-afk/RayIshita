import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/schedule", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).orderBy(asc(eventsTable.sortOrder), asc(eventsTable.startTime));
    res.json(events);
  } catch (err) {
    req.log.error({ err }, "Failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schedule", async (req, res) => {
  try {
    const inserted = await db.insert(eventsTable).values(req.body).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/schedule/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(eventsTable)
      .set(req.body)
      .where(eq(eventsTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schedule/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
