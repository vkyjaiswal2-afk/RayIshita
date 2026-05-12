import { Router } from "express";
import { db } from "@workspace/db";
import { travelUpdatesTable, groupsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/travel-updates", async (req, res) => {
  try {
    const updates = await db
      .select({
        id: travelUpdatesTable.id,
        groupId: travelUpdatesTable.groupId,
        groupName: groupsTable.name,
        status: travelUpdatesTable.status,
        message: travelUpdatesTable.message,
        currentLocation: travelUpdatesTable.currentLocation,
        etaMinutes: travelUpdatesTable.etaMinutes,
        createdAt: travelUpdatesTable.createdAt,
      })
      .from(travelUpdatesTable)
      .leftJoin(groupsTable, eq(travelUpdatesTable.groupId, groupsTable.id))
      .orderBy(desc(travelUpdatesTable.createdAt));
    res.json(updates);
  } catch (err) {
    req.log.error({ err }, "Failed to list travel updates");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/travel-updates", async (req, res) => {
  try {
    const inserted = await db.insert(travelUpdatesTable).values(req.body).returning();
    // Also update the group status
    if (req.body.status) {
      await db
        .update(groupsTable)
        .set({
          status: req.body.status,
          currentLocation: req.body.currentLocation,
          etaMinutes: req.body.etaMinutes,
        })
        .where(eq(groupsTable.id, req.body.groupId));
    }
    const group = await db.select().from(groupsTable).where(eq(groupsTable.id, req.body.groupId)).limit(1);
    res.status(201).json({ ...inserted[0], groupName: group[0]?.name ?? "" });
  } catch (err) {
    req.log.error({ err }, "Failed to create travel update");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/travel-updates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(travelUpdatesTable)
      .set(req.body)
      .where(eq(travelUpdatesTable.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Travel update not found" });
      return;
    }
    const group = await db.select().from(groupsTable).where(eq(groupsTable.id, updated[0].groupId)).limit(1);
    res.json({ ...updated[0], groupName: group[0]?.name ?? "" });
  } catch (err) {
    req.log.error({ err }, "Failed to update travel update");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/travel-updates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(travelUpdatesTable).where(eq(travelUpdatesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete travel update");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
