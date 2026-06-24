import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../common/middleware/validateBody.js";
import {
  createYarnIssueSchema,
  listYarnIssueQuerySchema,
  updateYarnIssueSchema,
} from "./yarn-issues.validators.js";
import {
  createYarnIssue,
  deleteYarnIssue,
  getNextYarnIssueSlipNo,
  getYarnIssueById,
  listYarnIssues,
  updateYarnIssue,
} from "./yarn-issues.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextYarnIssueSlipNo);
router.get("/", validateQuery(listYarnIssueQuerySchema), listYarnIssues);
router.get("/:id", getYarnIssueById);
router.post("/", validateBody(createYarnIssueSchema), createYarnIssue);
router.patch("/:id", validateBody(updateYarnIssueSchema), updateYarnIssue);
router.delete("/:id", deleteYarnIssue);

export { router as yarnIssuesRouter };
