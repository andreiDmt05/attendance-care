import { Router } from "express";
import {
  getAttendance,
  getAttendanceById,
  clockIn,
  clockOut,
  updateAttendance,
  exportAttendanceCsv,
} from "../controllers/attendanceController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getAttendance);
router.get("/export", requireAdmin, exportAttendanceCsv);
router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/:id", getAttendanceById);
router.patch("/:id", requireAdmin, updateAttendance);

export default router;
