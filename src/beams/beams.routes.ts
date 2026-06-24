import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../common/middleware/validateBody.js";
import {
  createBeamSchema,
  listBeamQuerySchema,
  updateBeamSchema,
} from "./beams.validators.js";
import {
  createBeam,
  deleteBeam,
  getBeamById,
  getDistinctBeamValues,
  getNextBeamNo,
  listBeams,
  updateBeam,
} from "./beams.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/next-number", getNextBeamNo);
router.get("/distinct/:field", getDistinctBeamValues);
router.get("/", validateQuery(listBeamQuerySchema), listBeams);
router.get("/:id", getBeamById);
router.post("/", validateBody(createBeamSchema), createBeam);
router.patch("/:id", validateBody(updateBeamSchema), updateBeam);
router.delete("/:id", deleteBeam);

export { router as beamsRouter };
