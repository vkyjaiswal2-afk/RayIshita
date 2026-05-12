import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weddingRouter from "./wedding";
import guestsRouter from "./guests";
import groupsRouter from "./groups";
import scheduleRouter from "./schedule";
import announcementsRouter from "./announcements";
import travelRouter from "./travel";
import venuesRouter from "./venues";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weddingRouter);
router.use(guestsRouter);
router.use(groupsRouter);
router.use(scheduleRouter);
router.use(announcementsRouter);
router.use(travelRouter);
router.use(venuesRouter);
router.use(statsRouter);

export default router;
