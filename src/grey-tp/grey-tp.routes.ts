import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createGreyTPSchema,
  listGreyTPQuerySchema,
  updateGreyTPSchema,
} from "./grey-tp.validators";
import {
  createGreyTP,
  deleteGreyTP,
  getGreyTPById,
  listGreyTPs,
  updateGreyTP,
} from "./grey-tp.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listGreyTPQuerySchema), listGreyTPs);
router.get("/:id", getGreyTPById);
router.post("/", validateBody(createGreyTPSchema), createGreyTP);
router.patch("/:id", validateBody(updateGreyTPSchema), updateGreyTP);
router.delete("/:id", deleteGreyTP);

export { router as greyTPRouter };
