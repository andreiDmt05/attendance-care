import { Router } from "express";
import { getLeaves, createLeave, updateLeaveStatus } from "../controllers/leaveController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getLeaves);
router.post("/", createLeave);
router.patch("/:id", requireAdmin, updateLeaveStatus);

export default router;
