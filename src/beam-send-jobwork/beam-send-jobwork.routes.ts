import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createBeamSendSchema,
  listBeamSendQuerySchema,
  updateBeamSendSchema,
} from "./beam-send-jobwork.validators";
import {
  createBeamSend,
  deleteBeamSend,
  getBeamSendById,
  getNextBeamSendNumber,
  listBeamSends,
  updateBeamSend,
} from "./beam-send-jobwork.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextBeamSendNumber);
router.get("/", validateQuery(listBeamSendQuerySchema), listBeamSends);
router.get("/:id", getBeamSendById);
router.post("/", validateBody(createBeamSendSchema), createBeamSend);
router.patch("/:id", validateBody(updateBeamSendSchema), updateBeamSend);
router.delete("/:id", deleteBeamSend);

export { router as beamSendJobworkRouter };
