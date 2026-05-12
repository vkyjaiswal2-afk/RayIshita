import { Router } from "express";
import { db } from "@workspace/db";
import { guestsTable, groupsTable, announcementsTable } from "@workspace/db";
import { eq, sql, and, gt } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [guestStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        confirmed: sql<number>`sum(case when rsvp_status = 'confirmed' then 1 else 0 end)::int`,
        declined: sql<number>`sum(case when rsvp_status = 'declined' then 1 else 0 end)::int`,
        pending: sql<number>`sum(case when rsvp_status = 'pending' then 1 else 0 end)::int`,
        checkedIn: sql<number>`sum(case when checked_in then 1 else 0 end)::int`,
      })
      .from(guestsTable);

    const [groupStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        arriving: sql<number>`sum(case when status = 'en_route' then 1 else 0 end)::int`,
        arrived: sql<number>`sum(case when status = 'arrived' then 1 else 0 end)::int`,
      })
      .from(groupsTable);

    const transportBreakdown = await db
      .select({
        mode: guestsTable.transportMode,
        count: sql<number>`count(*)::int`,
      })
      .from(guestsTable)
      .groupBy(guestsTable.transportMode);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [recentAnnouncements] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(announcementsTable)
      .where(gt(announcementsTable.createdAt, new Date(since24h)));

    const byTransportMode: Record<string, number> = {};
    for (const row of transportBreakdown) {
      byTransportMode[row.mode] = row.count;
    }

    res.json({
      totalGuests: guestStats.total ?? 0,
      confirmedGuests: guestStats.confirmed ?? 0,
      declinedGuests: guestStats.declined ?? 0,
      pendingGuests: guestStats.pending ?? 0,
      checkedInGuests: guestStats.checkedIn ?? 0,
      totalGroups: groupStats.total ?? 0,
      arrivingGroups: groupStats.arriving ?? 0,
      arrivedGroups: groupStats.arrived ?? 0,
      byTransportMode,
      recentAnnouncements: recentAnnouncements.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
