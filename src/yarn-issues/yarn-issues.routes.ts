import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createYarnIssueSchema,
  listYarnIssueQuerySchema,
  updateYarnIssueSchema,
} from "./yarn-issues.validators";
import {
  createYarnIssue,
  deleteYarnIssue,
  getNextYarnIssueSlipNo,
  getYarnIssueById,
  listYarnIssues,
  updateYarnIssue,
} from "./yarn-issues.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextYarnIssueSlipNo);
router.get("/", validateQuery(listYarnIssueQuerySchema), listYarnIssues);
router.get("/:id", getYarnIssueById);
router.post("/", validateBody(createYarnIssueSchema), createYarnIssue);
router.patch("/:id", validateBody(updateYarnIssueSchema), updateYarnIssue);
router.delete("/:id", deleteYarnIssue);

export { router as yarnIssuesRouter };
