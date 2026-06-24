import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../common/middleware/validateBody.js";
import {
  createReturnTakaSchema,
  listReturnTakaQuerySchema,
  updateReturnTakaSchema,
} from "./return-takas.validators.js";
import {
  createReturnTaka,
  deleteReturnTaka,
  getReturnTakaById,
  listReturnTakas,
  updateReturnTaka,
} from "./return-takas.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listReturnTakaQuerySchema), listReturnTakas);
router.get("/:id", getReturnTakaById);
router.post("/", validateBody(createReturnTakaSchema), createReturnTaka);
router.patch("/:id", validateBody(updateReturnTakaSchema), updateReturnTaka);
router.delete("/:id", deleteReturnTaka);

export { router as returnTakasRouter };
