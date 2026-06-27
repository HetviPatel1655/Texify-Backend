import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createReturnTakaSchema,
  listReturnTakaQuerySchema,
  updateReturnTakaSchema,
} from "./return-takas.validators";
import {
  createReturnTaka,
  deleteReturnTaka,
  getReturnTakaById,
  listReturnTakas,
  updateReturnTaka,
} from "./return-takas.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listReturnTakaQuerySchema), listReturnTakas);
router.get("/:id", getReturnTakaById);
router.post("/", validateBody(createReturnTakaSchema), createReturnTaka);
router.patch("/:id", validateBody(updateReturnTakaSchema), updateReturnTaka);
router.delete("/:id", deleteReturnTaka);

export { router as returnTakasRouter };
