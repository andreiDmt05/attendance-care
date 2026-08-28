import { Router } from "express";
import { getAdminDashboard, getEmployeeDashboard } from "../controllers/dashboardController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/admin", requireAdmin, getAdminDashboard);
router.get("/employee", getEmployeeDashboard);

export default router;
