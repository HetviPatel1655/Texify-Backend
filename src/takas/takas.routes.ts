import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createTakaSchema,
  createMultiTakasSchema,
  listTakaQuerySchema,
  updateTakaSchema,
} from "./takas.validators";
import {
  createTaka,
  createMultiTakas,
  deleteTaka,
  getTakaById,
  getTakaByNo,
  getNextTakaNo,
  getDistinctTakaValues,
  getTakaStock,
  listTakas,
  updateTaka,
} from "./takas.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextTakaNo);
router.get("/distinct/:field", getDistinctTakaValues);
router.get("/stock", getTakaStock);
router.get("/by-no/:takaNo", getTakaByNo);
router.get("/", validateQuery(listTakaQuerySchema), listTakas);
router.get("/:id", getTakaById);
router.post("/", validateBody(createTakaSchema), createTaka);
router.post("/multi", validateBody(createMultiTakasSchema), createMultiTakas);
router.patch("/:id", validateBody(updateTakaSchema), updateTaka);
router.delete("/:id", deleteTaka);

export { router as takasRouter };
