import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createRollsSendSchema,
  listRollsSendQuerySchema,
  updateRollsSendSchema,
} from "./rolls-send-jobwork.validators";
import {
  createRollsSend,
  deleteRollsSend,
  getRollsSendById,
  getNextRollsSendNumber,
  listRollsSends,
  updateRollsSend,
} from "./rolls-send-jobwork.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextRollsSendNumber);
router.get("/", validateQuery(listRollsSendQuerySchema), listRollsSends);
router.get("/:id", getRollsSendById);
router.post("/", validateBody(createRollsSendSchema), createRollsSend);
router.patch("/:id", validateBody(updateRollsSendSchema), updateRollsSend);
router.delete("/:id", deleteRollsSend);

export { router as rollsSendJobworkRouter };
