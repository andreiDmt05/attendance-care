import { Router } from "express";
import { getSchedule, updateSchedule } from "../controllers/scheduleController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/:employeeId", getSchedule);
router.patch("/:employeeId", requireAdmin, updateSchedule);

export default router;
