import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createEmployeeSchema,
  listEmployeeQuerySchema,
  updateEmployeeSchema,
} from "./employees.validators";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "./employees.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listEmployeeQuerySchema), listEmployees);
router.get("/:id", getEmployeeById);
router.post("/", validateBody(createEmployeeSchema), createEmployee);
router.patch("/:id", validateBody(updateEmployeeSchema), updateEmployee);
router.delete("/:id", deleteEmployee);

export { router as employeesRouter };
