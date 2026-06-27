import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createYarnReceiveSchema,
  listYarnReceiveQuerySchema,
  updateYarnReceiveSchema,
} from "./yarn-receive-jobwork.validators";
import {
  createYarnReceive,
  deleteYarnReceive,
  getYarnReceiveById,
  getNextYarnReceiveNumber,
  listYarnReceives,
  updateYarnReceive,
} from "./yarn-receive-jobwork.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextYarnReceiveNumber);
router.get("/", validateQuery(listYarnReceiveQuerySchema), listYarnReceives);
router.get("/:id", getYarnReceiveById);
router.post("/", validateBody(createYarnReceiveSchema), createYarnReceive);
router.patch("/:id", validateBody(updateYarnReceiveSchema), updateYarnReceive);
router.delete("/:id", deleteYarnReceive);

export { router as yarnReceiveJobworkRouter };
