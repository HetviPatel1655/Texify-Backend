import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createTakaReceiveSchema,
  listTakaReceiveQuerySchema,
  updateTakaReceiveSchema,
} from "./taka-receive-jobwork.validators";
import {
  createTakaReceive,
  deleteTakaReceive,
  getTakaReceiveById,
  getNextTakaReceiveNumber,
  listTakaReceives,
  updateTakaReceive,
} from "./taka-receive-jobwork.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextTakaReceiveNumber);
router.get("/", validateQuery(listTakaReceiveQuerySchema), listTakaReceives);
router.get("/:id", getTakaReceiveById);
router.post("/", validateBody(createTakaReceiveSchema), createTakaReceive);
router.patch("/:id", validateBody(updateTakaReceiveSchema), updateTakaReceive);
router.delete("/:id", deleteTakaReceive);

export { router as takaReceiveJobworkRouter };
