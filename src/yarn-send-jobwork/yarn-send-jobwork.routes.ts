import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createYarnSendSchema,
  listYarnSendQuerySchema,
  updateYarnSendSchema,
} from "./yarn-send-jobwork.validators";
import {
  createYarnSend,
  deleteYarnSend,
  getYarnSendById,
  getNextYarnSendNumber,
  listYarnSends,
  updateYarnSend,
} from "./yarn-send-jobwork.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextYarnSendNumber);
router.get("/", validateQuery(listYarnSendQuerySchema), listYarnSends);
router.get("/:id", getYarnSendById);
router.post("/", validateBody(createYarnSendSchema), createYarnSend);
router.patch("/:id", validateBody(updateYarnSendSchema), updateYarnSend);
router.delete("/:id", deleteYarnSend);

export { router as yarnSendJobworkRouter };
