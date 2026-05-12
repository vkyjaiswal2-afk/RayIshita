import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.isPinned), desc(announcementsTable.createdAt));
    res.json(announcements);
  } catch (err) {
    req.log.error({ err }, "Failed to list announcements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    const inserted = await db.insert(announcementsTable).values(req.body).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
