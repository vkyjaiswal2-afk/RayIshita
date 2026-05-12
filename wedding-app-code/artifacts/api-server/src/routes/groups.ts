import { Router } from "express";
import { db } from "@workspace/db";
import { groupsTable, guestsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/groups", async (req, res) => {
  try {
    const groups = await db.select().from(groupsTable).orderBy(groupsTable.name);
    // Attach guest counts
    const counts = await db
      .select({ groupId: guestsTable.groupId, count: sql<number>`count(*)::int` })
      .from(guestsTable)
      .groupBy(guestsTable.groupId);
    const countMap = new Map(counts.map((c) => [c.groupId, c.count]));
    const result = groups.map((g) => ({ ...g, guestCount: countMap.get(g.id) ?? 0 }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list groups");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/groups", async (req, res) => {
  try {
    const inserted = await db.insert(groupsTable).values(req.body).returning();
    res.status(201).json({ ...inserted[0], guestCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create group");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/groups/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(groupsTable)
      .set(req.body)
      .where(eq(groupsTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    const counts = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(guestsTable)
      .where(eq(guestsTable.groupId, id));
    res.json({ ...updated[0], guestCount: counts[0]?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to update group");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/groups/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(groupsTable).where(eq(groupsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete group");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
