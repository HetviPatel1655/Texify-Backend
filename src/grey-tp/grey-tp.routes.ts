import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../common/middleware/validateBody.js";
import {
  createGreyTPSchema,
  listGreyTPQuerySchema,
  updateGreyTPSchema,
} from "./grey-tp.validators.js";
import {
  createGreyTP,
  deleteGreyTP,
  getGreyTPById,
  listGreyTPs,
  updateGreyTP,
} from "./grey-tp.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listGreyTPQuerySchema), listGreyTPs);
router.get("/:id", getGreyTPById);
router.post("/", validateBody(createGreyTPSchema), createGreyTP);
router.patch("/:id", validateBody(updateGreyTPSchema), updateGreyTP);
router.delete("/:id", deleteGreyTP);

export { router as greyTPRouter };
