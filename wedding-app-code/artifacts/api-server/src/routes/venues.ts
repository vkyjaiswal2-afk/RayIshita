import { Router } from "express";
import { db } from "@workspace/db";
import { venuesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/venues", async (req, res) => {
  try {
    const venues = await db.select().from(venuesTable).orderBy(asc(venuesTable.type), asc(venuesTable.name));
    res.json(venues);
  } catch (err) {
    req.log.error({ err }, "Failed to list venues");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/venues", async (req, res) => {
  try {
    const inserted = await db.insert(venuesTable).values(req.body).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create venue");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/venues/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(venuesTable)
      .set(req.body)
      .where(eq(venuesTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Venue not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update venue");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
