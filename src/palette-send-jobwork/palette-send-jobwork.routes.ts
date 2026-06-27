import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import {
  createPaletteSendSchema,
  listPaletteSendQuerySchema,
  updatePaletteSendSchema,
} from "./palette-send-jobwork.validators";
import {
  createPaletteSend,
  deletePaletteSend,
  getPaletteSendById,
  getNextPaletteSendNumber,
  listPaletteSends,
  updatePaletteSend,
} from "./palette-send-jobwork.controller";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextPaletteSendNumber);
router.get("/", validateQuery(listPaletteSendQuerySchema), listPaletteSends);
router.get("/:id", getPaletteSendById);
router.post("/", validateBody(createPaletteSendSchema), createPaletteSend);
router.patch("/:id", validateBody(updatePaletteSendSchema), updatePaletteSend);
router.delete("/:id", deletePaletteSend);

export { router as paletteSendJobworkRouter };
