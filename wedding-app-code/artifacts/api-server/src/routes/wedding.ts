import { Router } from "express";
import { db } from "@workspace/db";
import { weddingTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/wedding", async (req, res) => {
  try {
    const rows = await db.select().from(weddingTable).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Wedding not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get wedding");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/wedding", async (req, res) => {
  try {
    const rows = await db.select().from(weddingTable).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Wedding not found" });
      return;
    }
    const updated = await db
      .update(weddingTable)
      .set(req.body)
      .where(eq(weddingTable.id, rows[0].id))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update wedding");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
