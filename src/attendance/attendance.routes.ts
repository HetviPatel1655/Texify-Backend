import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  bulkUpsertAttendanceSchema,
  monthlyGridQuerySchema,
  salaryReportQuerySchema,
  workerSalaryReportQuerySchema,
  patiaReportQuerySchema,
} from "./attendance.validators";
import {
  getMonthlyGrid,
  bulkUpsertAttendance,
  getAttendanceSalaryReport,
  getWorkerSalaryReport,
  getPatiaReport,
  getDistinctMachines,
} from "./attendance.controller";

const router = Router();

router.use(authMiddleware);

router.get("/monthly-grid", validateQuery(monthlyGridQuerySchema), getMonthlyGrid);
router.put("/monthly-grid", validateBody(bulkUpsertAttendanceSchema), bulkUpsertAttendance);
router.get("/reports/salary", validateQuery(salaryReportQuerySchema), getAttendanceSalaryReport);
router.get("/reports/worker-salary", validateQuery(workerSalaryReportQuerySchema), getWorkerSalaryReport);
router.get("/reports/patia", validateQuery(patiaReportQuerySchema), getPatiaReport);
router.get("/machines", getDistinctMachines);

export { router as attendanceRouter };
